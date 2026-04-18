import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const SCRIPT_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "verify-shared-package-deps.mjs",
);

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

async function writeFile(filePath: string, contents = ""): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents);
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function runVerifier(root: string): Promise<void> {
  await execFileAsync(process.execPath, [SCRIPT_PATH, "--repo-root", root]);
}

test("verify-shared-package-deps accepts npm semver dependencies", async (t) => {
  const root = await makeTempDir("baoyu-verify-shared-ok-");
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  await writeJson(path.join(root, "packages", "baoyu-md", "package.json"), {
    name: "baoyu-md",
    version: "1.2.3",
  });
  await writeJson(path.join(root, "skills", "demo", "scripts", "package.json"), {
    dependencies: {
      "baoyu-md": "^1.2.3",
    },
  });

  await assert.doesNotReject(() => runVerifier(root));
});

test("verify-shared-package-deps rejects file dependencies and vendored workspace packages", async (t) => {
  const root = await makeTempDir("baoyu-verify-shared-bad-");
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  await writeJson(path.join(root, "packages", "baoyu-md", "package.json"), {
    name: "baoyu-md",
    version: "1.2.3",
  });
  await writeJson(path.join(root, "skills", "demo", "scripts", "package.json"), {
    dependencies: {
      "baoyu-md": "file:./vendor/baoyu-md",
    },
  });
  await writeFile(path.join(root, "skills", "demo", "scripts", "vendor", "baoyu-md", "index.ts"));

  await assert.rejects(
    () => runVerifier(root),
    (error: unknown) => {
      assert(error instanceof Error);
      assert.match(error.message, /must use \^1\.2\.3/);
      assert.match(error.message, /remove vendored workspace package/);
      return true;
    },
  );
});
