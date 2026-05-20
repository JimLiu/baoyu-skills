import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publisherPath = path.join(__dirname, "remote_publisher.py");

function runPython(code: string): string {
  const result = spawnSync("python3", ["-c", code], {
    encoding: "utf-8",
    env: { ...process.env, REMOTE_PUBLISHER_PATH: publisherPath },
  });

  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

test("remote Python publisher replaces numbered placeholders with a digit boundary", () => {
  const stdout = runPython(String.raw`
import importlib.util
import os
spec = importlib.util.spec_from_file_location("remote_publisher", os.environ["REMOTE_PUBLISHER_PATH"])
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
print(mod.replace_placeholder("WECHATIMGPH_10 WECHATIMGPH_1 WECHATIMGPH_11", "WECHATIMGPH_1", "<img>"))
`);

  assert.equal(stdout, "WECHATIMGPH_10 <img> WECHATIMGPH_11");
});

test("remote Python publisher rejects remote_url assets", () => {
  const stdout = runPython(String.raw`
import importlib.util
import os
spec = importlib.util.spec_from_file_location("remote_publisher", os.environ["REMOTE_PUBLISHER_PATH"])
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
try:
    mod.load_asset({"remote_url": "https://example.com/a.png", "filename": "a.png"})
except RuntimeError as exc:
    print(str(exc))
`);

  assert.match(stdout, /remote_url assets are forbidden/);
});


test("remote TypeScript publisher does not emit remote URL payloads or remote credential files", () => {
  const source = fs.readFileSync(path.join(__dirname, "wechat-remote-publish.ts"), "utf8");
  assert.doesNotMatch(source, /remote_url\s*:/);
  assert.doesNotMatch(source, /wechat\.json/);
  assert.doesNotMatch(source, /sshOptions\s*\?:\s*string\[\]/);
});
