import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { homedir } from "node:os";
import {
  ORCA_CREDENTIAL_ENV,
  ORCA_KEY_URL,
  maskSecret,
  type OrcaCredential,
} from "./credentials";
import type { Provider } from "../types";

export type CommandResult = {
  exitCode: number;
  stdout: string[];
  stderr: string[];
};

const LINE_PATTERN = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/;

export function isOrcaProviderName(value: string): value is Provider {
  return value === "orcarouter";
}

export function getCredentialRemediation(kind: "missing" | "rejected"): string {
  const base =
    kind === "missing"
      ? `OrcaRouter is not connected: no ${ORCA_CREDENTIAL_ENV} and no stored login.`
      : `The stored OrcaRouter credential was rejected (HTTP 401). It was kept, marked needsReauth, and is not retried.`;

  return [
    base,
    `  Reconnect: ${ORCA_CREDENTIAL_ENV}=sk-orca-... (create a key at ${ORCA_KEY_URL})`,
    "  Or authorize an account: --orcarouter-login (OAuth 2.0 + PKCE, out-of-band code)",
  ].join("\n");
}

export function isUsableCredential(credential: OrcaCredential | null): boolean {
  return !!credential && credential.status === "active";
}

export function upsertEnvLine(content: string, key: string, value: string): string {
  const lines = content.length > 0 ? content.split("\n") : [];
  let replaced = false;

  const next = lines.map((line) => {
    const match = line.match(LINE_PATTERN);
    if (match && match[1] === key) {
      replaced = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (!replaced) {
    while (next.length > 0 && next[next.length - 1] === "") next.pop();
    next.push(`${key}=${value}`);
    next.push("");
  }

  return next.join("\n");
}

export type EnvTarget = {
  path: string;
  scope: "project" | "user";
};

export async function resolveEnvTarget(
  cwd = process.cwd(),
  home = homedir(),
): Promise<EnvTarget> {
  const projectDir = path.join(cwd, ".baoyu-skills");
  try {
    await access(projectDir);
    return { path: path.join(projectDir, ".env"), scope: "project" };
  } catch {
    return { path: path.join(home, ".baoyu-skills", ".env"), scope: "user" };
  }
}

export async function saveOrcaCredential(
  key: string,
  target: EnvTarget,
): Promise<{ stored: boolean; scope: EnvTarget["scope"]; masked: string }> {
  const trimmed = key.trim();
  if (!trimmed) throw new Error("The OrcaRouter API key is empty.");

  let existing = "";
  try {
    existing = await readFile(target.path, "utf8");
  } catch {
    existing = "";
  }

  await mkdir(path.dirname(target.path), { recursive: true });
  await writeFile(target.path, upsertEnvLine(existing, ORCA_CREDENTIAL_ENV, trimmed), "utf8");

  return { stored: true, scope: target.scope, masked: maskSecret(trimmed) };
}

export function formatModelList(ids: string[]): string[] {
  if (ids.length === 0) return ["No OrcaRouter models are available for this credential."];
  return ids.map((id) => `- ${id}`);
}
