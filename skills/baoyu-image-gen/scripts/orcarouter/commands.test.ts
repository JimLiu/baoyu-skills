import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  formatModelList,
  getCredentialRemediation,
  isUsableCredential,
  resolveEnvTarget,
  saveOrcaCredential,
  upsertEnvLine,
} from "./commands.ts";

const FAKE_KEY = "sk-orca-fake-command-key";

test("an existing env file is updated in place instead of appending a duplicate key", () => {
  const updated = upsertEnvLine("OPENAI_API_KEY=abc\nORCAROUTER_API_KEY=old\n", "ORCAROUTER_API_KEY", FAKE_KEY);

  assert.equal(updated.match(/ORCAROUTER_API_KEY/g)?.length, 1);
  assert.ok(updated.includes(`ORCAROUTER_API_KEY=${FAKE_KEY}`));
  assert.ok(updated.includes("OPENAI_API_KEY=abc"));
  assert.ok(!updated.includes("ORCAROUTER_API_KEY=old"));
});

test("a new key is appended to an existing env file without disturbing it", () => {
  const updated = upsertEnvLine("GOOGLE_API_KEY=xyz\n", "ORCAROUTER_API_KEY", FAKE_KEY);

  assert.ok(updated.startsWith("GOOGLE_API_KEY=xyz"));
  assert.ok(updated.includes(`ORCAROUTER_API_KEY=${FAKE_KEY}`));
});

test("a commented-out key is not treated as the existing entry", () => {
  const updated = upsertEnvLine("# ORCAROUTER_API_KEY=comment\n", "ORCAROUTER_API_KEY", FAKE_KEY);
  assert.ok(updated.includes("# ORCAROUTER_API_KEY=comment"));
  assert.ok(updated.includes(`ORCAROUTER_API_KEY=${FAKE_KEY}`));
});

test("saving a credential writes it to the resolved env file and reports only a masked value", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "orca-env-"));
  const envPath = path.join(dir, ".baoyu-skills", ".env");

  const result = await saveOrcaCredential(FAKE_KEY, { path: envPath, scope: "project" });

  assert.equal(result.stored, true);
  assert.equal(result.scope, "project");
  assert.equal(result.masked, "sk-***-key");
  assert.ok(!result.masked.includes("fake-command"));

  const written = await readFile(envPath, "utf8");
  assert.ok(written.includes(`ORCAROUTER_API_KEY=${FAKE_KEY}`));
});

test("an empty key is refused rather than written as a blank credential", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "orca-env-"));
  const envPath = path.join(dir, ".env");

  await assert.rejects(() => saveOrcaCredential("   ", { path: envPath, scope: "user" }), /empty/);
});

test("the project env file wins when a project store already exists, otherwise the user store is used", async () => {
  const home = await mkdtemp(path.join(tmpdir(), "orca-home-"));
  const cwd = await mkdtemp(path.join(tmpdir(), "orca-cwd-"));

  const userTarget = await resolveEnvTarget(cwd, home);
  assert.equal(userTarget.scope, "user");
  assert.equal(userTarget.path, path.join(home, ".baoyu-skills", ".env"));

  await mkdir(path.join(cwd, ".baoyu-skills"), { recursive: true });
  await writeFile(path.join(cwd, ".baoyu-skills", ".env"), "", "utf8");

  const projectTarget = await resolveEnvTarget(cwd, home);
  assert.equal(projectTarget.scope, "project");
  assert.equal(projectTarget.path, path.join(cwd, ".baoyu-skills", ".env"));
});

test("a credential marked needsReauth is not usable until a new login succeeds", () => {
  assert.equal(isUsableCredential(null), false);
  assert.equal(
    isUsableCredential({
      source: "pkce",
      value: FAKE_KEY,
      scope: "api",
      userId: "1",
      generation: 1,
      status: "needsReauth",
      reason: "401",
    }),
    false,
  );
  assert.equal(
    isUsableCredential({
      source: "api-key",
      value: FAKE_KEY,
      scope: null,
      userId: null,
      generation: 2,
      status: "active",
      reason: null,
    }),
    true,
  );
});

test("the remediation text points at both authentication entries and never contains a key", () => {
  const missing = getCredentialRemediation("missing");
  assert.match(missing, /ORCAROUTER_API_KEY/);
  assert.match(missing, /--orcarouter-login/);
  assert.match(missing, /https:\/\/www\.orcarouter\.ai\/console\/token/);
  assert.ok(!missing.includes(FAKE_KEY));

  const rejected = getCredentialRemediation("rejected");
  assert.match(rejected, /needsReauth/);
  assert.match(rejected, /not retried/);
});

test("the model list is rendered as concrete ids and never as free-form input", () => {
  assert.deepEqual(formatModelList(["google/gemini-3.1-flash-image-preview"]), ["- google/gemini-3.1-flash-image-preview"]);
  assert.deepEqual(formatModelList([]), ["No OrcaRouter models are available for this credential."]);
});
