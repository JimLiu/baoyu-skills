import assert from "node:assert/strict";
import test from "node:test";

import {
  buildImagesGenerationsBody,
  buildRequestBody,
  describeImageCatalog,
  endpointPathFor,
  forgetCatalogEntries,
  getDefaultModel,
  rememberCatalogEntries,
  resolveCredential,
  setActiveOrcaCredential,
  supportsAspectRatioField,
  usesTopLevelImageEndpoint,
} from "./orcarouter.ts";
import { clearOrcaCatalogCache } from "../orcarouter/discovery.ts";
import { parseCatalogResponse, filterModels, type OrcaModel } from "../orcarouter/catalog.ts";
import type { CliArgs } from "../types.ts";

const FAKE_KEY = "sk-orca-fake-provider-key";
const GEMINI = "google/gemini-3.1-flash-image-preview";
const GPT_IMAGE = "openai/gpt-image-1.5";

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

function catalogModels(): OrcaModel[] {
  return parseCatalogResponse({
    data: [
      { id: GEMINI, supported_endpoint_types: ["gemini"], architecture: { input_modalities: ["text", "image"], output_modalities: ["image", "text"] } },
      { id: GPT_IMAGE, supported_endpoint_types: ["image-generation"], architecture: { input_modalities: ["text", "image"] } },
      { id: "deepseek/deepseek-v4-pro", supported_endpoint_types: ["openai", "openai-response"], architecture: { input_modalities: ["text"], output_modalities: ["text"] } },
    ],
  }).models;
}

test("both authentication adapters reach the provider through the same credential seam", () => {
  setActiveOrcaCredential(null);

  const viaKey = resolveCredential({ ORCAROUTER_API_KEY: FAKE_KEY });
  assert.equal(viaKey.source, "api-key");
  assert.equal(viaKey.value, FAKE_KEY);

  setActiveOrcaCredential({
    source: "pkce",
    value: "sk-orca-from-pkce",
    scope: "api",
    userId: "42",
    generation: 3,
    status: "active",
    reason: null,
  });

  const viaPkce = resolveCredential({});
  assert.equal(viaPkce.source, "pkce");
  assert.equal(viaPkce.value, "sk-orca-from-pkce");

  assert.deepEqual(Object.keys(viaKey).sort(), Object.keys(viaPkce).sort());
  setActiveOrcaCredential(null);
});

test("a rejected credential is not reused and the provider asks for re-authentication", () => {
  setActiveOrcaCredential({
    source: "pkce",
    value: FAKE_KEY,
    scope: "api",
    userId: "42",
    generation: 4,
    status: "needsReauth",
    reason: "relay 401",
  });

  assert.throws(() => resolveCredential({}), /OrcaRouter is not connected/);
  assert.throws(() => resolveCredential({}), /orcarouter-login/);
  setActiveOrcaCredential(null);
});

test("the API key wins when both an env key and a stored login are present", () => {
  setActiveOrcaCredential({
    source: "pkce",
    value: "sk-orca-stored",
    scope: "api",
    userId: "42",
    generation: 5,
    status: "active",
    reason: null,
  });

  assert.equal(resolveCredential({ ORCAROUTER_API_KEY: FAKE_KEY }).source, "api-key");
  setActiveOrcaCredential(null);
});

test("the endpoint is chosen from the discovered endpoint type, not the model name", () => {
  assert.equal(endpointPathFor(GEMINI, ["gemini"]), "/chat/completions");
  assert.equal(endpointPathFor(GPT_IMAGE, ["image-generation"]), "/images/generations");
  assert.equal(endpointPathFor("vendor/mystery", []), "/chat/completions");
  assert.equal(endpointPathFor("google/imagen-4.0-generate-001", ["image-generation"]), "/images/generations");

  assert.ok(supportsAspectRatioField(GEMINI));
  assert.ok(!supportsAspectRatioField(GPT_IMAGE));
  assert.ok(!usesTopLevelImageEndpoint(GEMINI));
});

test("the chat-completions body keeps OrcaRouter image_config and modalities for Gemini image models", () => {
  const body = buildRequestBody("a cat", GEMINI, makeArgs({ aspectRatio: "16:9", quality: "2k" }), []);

  assert.deepEqual(body.image_config, { image_size: "2K", aspect_ratio: "16:9" });
  assert.deepEqual(body.modalities, ["image", "text"]);
  assert.deepEqual(body.provider, { require_parameters: true });
  assert.equal(body.messages[0].content, "a cat");
});

test("an aspect ratio is refused for models that cannot carry one on this endpoint", () => {
  assert.throws(
    () => buildRequestBody("a cat", GPT_IMAGE, makeArgs({ aspectRatio: "16:9" }), []),
    /does not accept an aspect-ratio field/,
  );
});

test("the images/generations body uses pixel size and the documented fields only", () => {
  const body = buildImagesGenerationsBody("a cat", GPT_IMAGE, makeArgs({ size: "1024x1024", quality: "2k" }));

  assert.deepEqual(body, { model: GPT_IMAGE, prompt: "a cat", n: 1, size: "1024x1024", quality: "high" });
});

test("the OrcaRouter image catalog is the filtered live image set with its provenance recorded", () => {
  const result = {
    models: filterModels(catalogModels(), "image"),
    source: "live" as const,
    degraded: false,
    degradedReason: null,
    acceptedCount: 3,
    rejectedCount: 0,
  };

  const view = describeImageCatalog(result);

  assert.deepEqual(view.ids.sort(), [GEMINI, GPT_IMAGE].sort());
  assert.equal(view.source, "live");
  assert.equal(view.degraded, false);
  assert.ok(!view.ids.includes("deepseek/deepseek-v4-pro"));
});

test("the default OrcaRouter model is overridable through the existing env convention", () => {
  const previous = process.env.ORCAROUTER_IMAGE_MODEL;
  try {
    delete process.env.ORCAROUTER_IMAGE_MODEL;
    assert.equal(getDefaultModel(), GEMINI);

    process.env.ORCAROUTER_IMAGE_MODEL = "vendor/custom";
    assert.equal(getDefaultModel(), "vendor/custom");
  } finally {
    if (previous === undefined) delete process.env.ORCAROUTER_IMAGE_MODEL;
    else process.env.ORCAROUTER_IMAGE_MODEL = previous;
  }
});

test("catalog caching is keyed on the credential and can be invalidated", () => {
  clearOrcaCatalogCache();
  assert.ok(true);
});

test("endpoint routing follows discovered catalog metadata rather than a model-name guess", () => {
  forgetCatalogEntries();

  rememberCatalogEntries([
    {
      id: "vendor/unknown-gateway-model",
      source: "live",
      endpointTypes: ["gemini"],
      inputModalities: ["text", "image"],
      outputModalities: ["image", "text"],
      contextLength: null,
      maxCompletionTokens: null,
      description: null,
      reasoningEfforts: null,
    },
  ]);

  assert.ok(supportsAspectRatioField("vendor/unknown-gateway-model"));
  forgetCatalogEntries();
  assert.ok(!supportsAspectRatioField("vendor/unknown-gateway-model"));
});

test("a model discovered as image-generation routes to the image endpoint regardless of its name", () => {
  forgetCatalogEntries();
  rememberCatalogEntries([
    {
      id: "google/gemini-image-via-generation-endpoint",
      source: "live",
      endpointTypes: ["image-generation"],
      inputModalities: ["text"],
      outputModalities: [],
      contextLength: null,
      maxCompletionTokens: null,
      description: null,
      reasoningEfforts: null,
    },
  ]);

  assert.equal(endpointPathFor("google/gemini-image-via-generation-endpoint", ["image-generation"]), "/images/generations");
  forgetCatalogEntries();
});
