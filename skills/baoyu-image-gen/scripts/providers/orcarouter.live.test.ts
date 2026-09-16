import assert from "node:assert/strict";
import test from "node:test";

import {
  buildRequestBody,
  describeImageCatalog,
  endpointPathFor,
  getDefaultModel,
  loadImageCatalog,
  resolveCredential,
} from "./orcarouter.ts";
import { isImageModel } from "../orcarouter/catalog.ts";
import { resolveOrcaOrigins } from "../orcarouter/origins.ts";
import type { CliArgs } from "../types.ts";

const API_KEY = process.env.ORCAROUTER_API_KEY;
const LIVE = { skip: !API_KEY };

function makeArgs(overrides: Partial<CliArgs> = {}): CliArgs {
  return {
    prompt: null,
    promptFiles: [],
    imagePath: null,
    provider: "orcarouter",
    model: null,
    aspectRatio: null,
    size: null,
    quality: null,
    imageSize: null,
    imageApiDialect: null,
    responseFormat: null,
    referenceImages: [],
    n: 1,
    batchFile: null,
    jobs: null,
    json: false,
    help: false,
    ...overrides,
  };
}

test("live: the provider resolves a credential from the configured key", LIVE, () => {
  const credential = resolveCredential(process.env);

  assert.equal(credential.source, "api-key");
  assert.ok(credential.value.length > 0);
  assert.equal(credential.status, "active");
  assert.ok(!/ORCAROUTER/i.test(credential.value));
});

test("live: the provider reaches the documented OrcaRouter origins", LIVE, () => {
  const origins = resolveOrcaOrigins(process.env);

  assert.equal(origins.authBaseUrl, "https://www.orcarouter.ai");
  assert.equal(origins.apiBaseUrl, "https://api.orcarouter.ai/v1");
  assert.ok(origins.authBaseUrl.startsWith("https://"));
  assert.ok(origins.apiBaseUrl.startsWith("https://"));
  assert.notEqual(origins.authBaseUrl, origins.apiBaseUrl);
});

test("live: the provider discovers a usable image catalog from GET /v1/models?capability=image", LIVE, async () => {
  const credential = resolveCredential(process.env);
  const catalog = await loadImageCatalog(credential);

  assert.ok(
    ["live", "seed", "last-known-good"].includes(catalog.source),
    `unexpected catalog source ${catalog.source}`,
  );
  assert.equal(catalog.degraded, catalog.source !== "live");
  assert.ok(catalog.models.length > 0, "a discovered catalog must never be empty");

  for (const model of catalog.models) {
    assert.ok(isImageModel(model), `${model.id} was offered but is not image-capable by metadata`);
    assert.ok(!/\s/.test(model.id), "model ids must be namespace-qualified and whitespace-free");
    assert.equal(model.source, catalog.source);
  }

  const view = describeImageCatalog(catalog);
  assert.deepEqual(view.ids, catalog.models.map((model) => model.id));

  if (catalog.source === "live") {
    assert.equal(catalog.degradedReason, null);
  } else {
    assert.ok(catalog.degradedReason, "a degraded catalog must say why");
  }

  console.log(
    `[live] catalog source=${catalog.source} image models=${catalog.models.length} accepted=${catalog.acceptedCount} rejected=${catalog.rejectedCount} reason=${catalog.degradedReason ?? "none"}`,
  );
});

test("live: every method the catalog offers maps to a route this client can speak", LIVE, async () => {
  const credential = resolveCredential(process.env);
  const catalog = await loadImageCatalog(credential);

  for (const model of catalog.models) {
    const path = endpointPathFor(model.id, model.endpointTypes);
    assert.ok(
      path === "/chat/completions" || path === "/images/generations",
      `${model.id} maps to an unsupported route ${path}`,
    );

    if (path === "/chat/completions") {
      const body = buildRequestBody("a cat", model.id, makeArgs({ quality: "2k" }), []);
      assert.deepEqual(body.modalities, ["image", "text"]);
      assert.ok(Array.isArray(body.messages));
    }
  }

  assert.ok(getDefaultModel().includes("/"), "the default model must be a namespace-qualified id");
});

test("live: an inference request through the provider reaches the OrcaRouter relay with Bearer auth", LIVE, async () => {
  const credential = resolveCredential(process.env);
  const catalog = await loadImageCatalog(credential);
  const target = catalog.models[0]!;

  assert.ok(credential.value.length > 0);

  const { generateImage, setActiveOrcaCredential } = await import("./orcarouter.ts");
  setActiveOrcaCredential(null);

  const body = buildRequestBody("a small red circle on white", target.id, makeArgs({ quality: "normal" }), []);
  assert.equal(body.messages[0].content, "a small red circle on white");

  console.log(`[live] requesting ${target.id} through ${endpointPathFor(target.id, target.endpointTypes)}`);

  try {
    const bytes = await generateImage("a small red circle on white", target.id, makeArgs({ quality: "normal" }));
    assert.ok(bytes.length > 0, "a successful relay response must contain image bytes");
    console.log(`[live] generation succeeded: ${bytes.length} bytes from ${target.id}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    assert.match(message, /OrcaRouter API error \(4\d\d\)/, `expected a relay status, got: ${message}`);
    assert.match(
      message,
      /model_access_denied|insufficient|quota|rate/i,
      `expected a relay-issued rejection envelope, got: ${message}`,
    );
    assert.ok(
      !message.includes(credential.value),
      "the relay error must never echo the credential back",
    );

    console.log(`[live] relay reached and answered (account-scoped rejection): ${message.slice(0, 200)}`);
  }
});
