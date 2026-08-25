import assert from "node:assert/strict";
import test from "node:test";

import { parseArgs, resolveContentProvider, resolveTweetProvider } from "./main.js";

test("parseArgs accepts explicit Xquik and legacy providers", () => {
  assert.equal(parseArgs(["--provider", "xquik", "123"]).provider, "xquik");
  assert.equal(parseArgs(["--provider", "legacy", "123"]).provider, "legacy");
});

test("parseArgs rejects unknown providers", () => {
  assert.throws(() => parseArgs(["--provider", "other", "123"]), /Invalid --provider/);
});

test("resolveTweetProvider prefers an explicit provider and otherwise detects Xquik", () => {
  assert.equal(resolveTweetProvider("legacy", true), "legacy");
  assert.equal(resolveTweetProvider(null, true), "xquik");
  assert.equal(resolveTweetProvider(null, false), "legacy");
});

test("resolveContentProvider keeps X Articles on the legacy provider by default", () => {
  assert.equal(resolveContentProvider("article", null, true), "legacy");
  assert.equal(resolveContentProvider("article", "xquik", true), "xquik");
  assert.equal(resolveContentProvider("tweet", null, true), "xquik");
});
