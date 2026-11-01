import { spawn, type ChildProcess } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { GenError, type CodexRunResult } from "./types.ts";
import { parseEventStream } from "./parser.ts";

export interface SpawnInput {
  instruction: string;
  timeoutMs: number;
  refImages?: string[];
  command?: string;
  commandArgs?: string[];
  completionGraceMs?: number;
  exitGraceMs?: number;
  killGraceMs?: number;
  onStart?: (info: { pid: number | undefined; rawLogPath: string }) => void | Promise<void>;
}

type FinishReason = "exit" | "error" | "timeout" | "turn_completed";

interface Finish {
  reason: FinishReason;
  code: number | null;
  signal: NodeJS.Signals | null;
}

export function turnEndType(line: string): "turn.completed" | "turn.failed" | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    const type = JSON.parse(trimmed)?.type;
    return type === "turn.completed" || type === "turn.failed" ? type : null;
  } catch {
    return null;
  }
}

function isRunning(child: ChildProcess): boolean {
  return child.exitCode === null && child.signalCode === null;
}

function killTree(child: ChildProcess): void {
  if (!isRunning(child)) return;
  if (process.platform === "win32" && child.pid) {
    const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true,
    });
    killer.on("error", () => child.kill());
    return;
  }
  child.kill("SIGTERM");
  setTimeout(() => {
    if (isRunning(child)) child.kill("SIGKILL");
  }, 2000).unref();
}

function waitForExit(child: ChildProcess, ms: number): Promise<boolean> {
  if (!isRunning(child)) return Promise.resolve(true);
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(!isRunning(child)), ms);
    child.once("exit", () => {
      clearTimeout(timer);
      resolve(true);
    });
  });
}

async function stopChild(child: ChildProcess): Promise<void> {
  if (!isRunning(child)) return;
  killTree(child);
  if (await waitForExit(child, 2000)) return;
  if (process.platform !== "win32") child.kill("SIGKILL");
  await waitForExit(child, 1000);
}

export async function runCodexExec(input: SpawnInput): Promise<CodexRunResult> {
  const start = Date.now();
  const logDir = await mkdtemp(path.join(tmpdir(), "codex-imggen-"));
  const rawLogPath = path.join(logDir, "stream.jsonl");
  const completionGraceMs = input.completionGraceMs ?? 15_000;
  const exitGraceMs = input.exitGraceMs ?? 2_000;
  const killGraceMs = input.killGraceMs ?? 5_000;

  // --skip-git-repo-check: lets the wrapper run from non-git cwds
  //   (e.g. /tmp, or a skill installed under ~/.claude/plugins/...).
  //   Without it, codex refuses with "Not inside a trusted directory".
  const args = input.commandArgs ?? [
    "exec",
    "--json",
    "--sandbox",
    "danger-full-access",
    "--skip-git-repo-check",
  ];
  if (!input.commandArgs) {
    for (const img of input.refImages ?? []) {
      args.push("--image", img);
    }
    args.push("-");
  }

  const logStream = createWriteStream(rawLogPath);
  logStream.on("error", () => {});
  const child = spawn(input.command ?? "codex", args, {
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true,
  });

  let stdout = "";
  let stderr = "";
  let pendingLine = "";
  let turnEnded = false;
  let turnCompleted = false;
  let timedOut = false;
  let spawnError: NodeJS.ErrnoException | null = null;
  const timers: NodeJS.Timeout[] = [];

  let resolveFinish!: (f: Finish) => void;
  const finished = new Promise<Finish>((resolve) => {
    resolveFinish = resolve;
  });
  let settled = false;
  const finish = (reason: FinishReason, code: number | null = null, signal: NodeJS.Signals | null = null) => {
    if (settled) return;
    settled = true;
    resolveFinish({ reason, code, signal });
  };

  const onLine = (line: string) => {
    const type = turnEndType(line);
    if (!type) return;
    if (type === "turn.completed") turnCompleted = true;
    if (turnEnded) return;
    turnEnded = true;
    timers.push(
      setTimeout(() => {
        killTree(child);
        finish("turn_completed");
      }, completionGraceMs),
    );
  };

  child.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    stdout += text;
    logStream.write(text);
    const lines = (pendingLine + text).split("\n");
    pendingLine = lines.pop() ?? "";
    lines.forEach(onLine);
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });
  child.stdin.on("error", () => {});

  child.on("error", (err: NodeJS.ErrnoException) => {
    spawnError = err;
    finish("error");
  });
  child.on("exit", (code, signal) => {
    timers.push(setTimeout(() => finish("exit", code, signal), exitGraceMs));
  });
  child.on("close", (code, signal) => finish("exit", code, signal));

  timers.push(
    setTimeout(() => {
      timedOut = true;
      killTree(child);
      timers.push(setTimeout(() => finish("timeout"), killGraceMs));
    }, input.timeoutMs),
  );

  if (input.onStart) {
    try {
      await input.onStart({ pid: child.pid, rawLogPath });
    } catch {}
  }

  child.stdin.write(input.instruction);
  child.stdin.end();

  const exit = await finished;
  for (const t of timers) clearTimeout(t);
  await stopChild(child);
  child.stdout.destroy();
  child.stderr.destroy();
  child.unref();

  if (turnEndType(pendingLine) === "turn.completed") turnCompleted = true;
  await new Promise<void>((resolve) => {
    logStream.end(stderr ? `\n--- stderr ---\n${stderr}` : "", () => resolve());
  });

  if (spawnError) {
    const err: NodeJS.ErrnoException = spawnError;
    if (err.code === "ENOENT") {
      throw new GenError("codex_not_installed", "codex CLI not installed", false);
    }
    throw new GenError("spawn_failed", `failed to start codex: ${err.message} (log: ${rawLogPath})`);
  }

  if (!turnCompleted) {
    if (timedOut) {
      throw new GenError("timeout", `codex exec exceeded ${input.timeoutMs}ms (log: ${rawLogPath})`);
    }
    if (exit.code !== 0) {
      if (stderr.includes("command not found") || stderr.includes("not found: codex")) {
        throw new GenError("codex_not_installed", "codex CLI not installed", false);
      }
      throw new GenError(
        "spawn_failed",
        `codex exec exited ${exit.code} signal=${exit.signal} (log: ${rawLogPath})`,
      );
    }
  }

  const parsed = parseEventStream(stdout);
  return {
    ...parsed,
    rawLogPath,
    durationMs: Date.now() - start,
  };
}
