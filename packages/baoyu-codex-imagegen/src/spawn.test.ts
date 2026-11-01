import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { runCodexExec, turnEndType } from "./spawn.ts";

const node = process.execPath;
const completed = JSON.stringify({ type: "turn.completed", usage: { input_tokens: 1, output_tokens: 2 } });
const started = JSON.stringify({ type: "thread.started", thread_id: "t-1" });

function script(body: string): string[] {
  return ["-e", body];
}

describe("turnEndType", () => {
  test("detects turn end events", () => {
    expect(turnEndType(completed)).toBe("turn.completed");
    expect(turnEndType('{"type":"turn.failed"}')).toBe("turn.failed");
    expect(turnEndType('{"type":"item.completed"}')).toBeNull();
    expect(turnEndType("not json")).toBeNull();
  });
});

describe("runCodexExec", () => {
  test("returns after the turn completes even if the process never exits", async () => {
    const t0 = Date.now();
    const run = await runCodexExec({
      instruction: "",
      timeoutMs: 20_000,
      command: node,
      commandArgs: script(`console.log(${JSON.stringify(started)}); console.log(${JSON.stringify(completed)}); setInterval(() => {}, 1000);`),
      completionGraceMs: 200,
    });
    expect(Date.now() - t0).toBeLessThan(5_000);
    expect(run.threadId).toBe("t-1");
    expect(run.usage?.output).toBe(2);
    expect(await readFile(run.rawLogPath, "utf-8")).toContain("turn.completed");
  });

  test("returns when the process exits but a grandchild keeps stdout open", async () => {
    const t0 = Date.now();
    const child = `require("child_process").spawn(process.execPath, ["-e", "setTimeout(() => {}, 30000)"], { stdio: "inherit" }).unref();`;
    const run = await runCodexExec({
      instruction: "",
      timeoutMs: 20_000,
      command: node,
      commandArgs: script(`${child} console.log(${JSON.stringify(started)}); process.exit(0);`),
      exitGraceMs: 200,
      completionGraceMs: 60_000,
    });
    expect(Date.now() - t0).toBeLessThan(5_000);
    expect(run.threadId).toBe("t-1");
  });

  test("times out even when killing does not release stdout", async () => {
    const t0 = Date.now();
    const child = `require("child_process").spawn(process.execPath, ["-e", "setTimeout(() => {}, 30000)"], { stdio: "inherit" }).unref();`;
    const err = await runCodexExec({
      instruction: "",
      timeoutMs: 300,
      command: node,
      commandArgs: script(`${child} setInterval(() => {}, 1000);`),
      killGraceMs: 300,
      exitGraceMs: 60_000,
    }).catch((e) => e);
    expect(Date.now() - t0).toBeLessThan(5_000);
    expect(err.kind).toBe("timeout");
  });

  test("reports a missing binary as codex_not_installed", async () => {
    const err = await runCodexExec({
      instruction: "",
      timeoutMs: 5_000,
      command: "definitely-not-a-real-codex-binary",
      commandArgs: [],
    }).catch((e) => e);
    expect(err.kind).toBe("codex_not_installed");
  });

  test("still reports a non-zero exit without a completed turn", async () => {
    const err = await runCodexExec({
      instruction: "",
      timeoutMs: 5_000,
      command: node,
      commandArgs: script(`process.exit(3);`),
    }).catch((e) => e);
    expect(err.kind).toBe("spawn_failed");
  });

  test("kills a child that ignores SIGTERM before returning", async () => {
    if (process.platform === "win32") return;
    let pid: number | undefined;
    const run = await runCodexExec({
      instruction: "",
      timeoutMs: 20_000,
      command: node,
      commandArgs: script(`process.on("SIGTERM", () => {}); console.log(${JSON.stringify(started)}); console.log(${JSON.stringify(completed)}); setInterval(() => {}, 1000);`),
      completionGraceMs: 200,
      onStart: (info) => {
        pid = info.pid;
      },
    });
    expect(run.threadId).toBe("t-1");
    expect(() => process.kill(pid!, 0)).toThrow();
  });
});

