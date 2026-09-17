import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_CATALOG_ITEMS,
  filterModels,
  discoverOrcaModels,
  getVerifiedSeed,
  isChatModel,
  parseCatalogResponse,
  resolveModelSelection,
  type OrcaModel,
} from "./catalog.ts";

const TEXT_ONLY_CHAT = {
  id: "deepseek/deepseek-v4-pro",
  object: "model",
  supported_endpoint_types: ["openai", "openai-response"],
  architecture: { input_modalities: ["text"], output_modalities: ["text"] },
  context_length: 1048576,
  max_completion_tokens: 384000,
  description: "text only",
};

const IMAGE_INPUT_CHAT = {
  id: "deepseek/deepseek-v4-flash-vision-exp",
  object: "model",
  supported_endpoint_types: ["openai", "openai-response", "anthropic"],
  architecture: { input_modalities: ["text", "image"], output_modalities: ["text"] },
};

const GEMINI_IMAGE_OUTPUT = {
  id: "google/gemini-3.1-flash-image-preview",
  object: "model",
  supported_endpoint_types: ["gemini"],
  architecture: { input_modalities: ["text", "image"], output_modalities: ["image", "text"] },
};

const IMAGE_GENERATION = {
  id: "openai/gpt-image-1.5",
  object: "model",
  supported_endpoint_types: ["image-generation"],
  architecture: { input_modalities: ["text", "image"], output_modalities: null },
};

const EMBEDDING = {
  id: "openai/text-embedding-3-large",
  object: "model",
  supported_endpoint_types: ["embeddings"],
  architecture: { input_modalities: ["text"], output_modalities: null },
};

const VIDEO = {
  id: "minimax/minimax-h3",
  object: "model",
  supported_endpoint_types: ["openai-video"],
  architecture: { input_modalities: ["text", "image"], output_modalities: null },
};

const RERANK = {
  id: "jina/jina-reranker-v3",
  object: "model",
  supported_endpoint_types: ["jina-rerank"],
  architecture: { input_modalities: ["text"], output_modalities: null },
};

const CATALOG_PAYLOAD = {
  object: "list",
  data: [
    IMAGE_GENERATION,
    EMBEDDING,
    VIDEO,
    RERANK,
    GEMINI_IMAGE_OUTPUT,
    IMAGE_INPUT_CHAT,
    TEXT_ONLY_CHAT,
    TEXT_ONLY_CHAT,
    { id: "", object: "model" },
    { object: "model" },
    "not-an-object",
    { id: "bad id with spaces", object: "model" },
  ],
};

function ids(models: OrcaModel[]): string[] {
  return models.map((model) => model.id);
}

test("catalog parsing accepts well-formed models with metadata and rejects malformed records", () => {
  const parsed = parseCatalogResponse(CATALOG_PAYLOAD);

  assert.equal(parsed.acceptedCount, 7);
  assert.equal(parsed.rejectedCount, 5);
  assert.equal(parsed.truncated, false);

  const textOnly = parsed.models.find((model) => model.id === TEXT_ONLY_CHAT.id)!;
  assert.equal(textOnly.contextLength, 1048576);
  assert.equal(textOnly.maxCompletionTokens, 384000);
  assert.deepEqual(textOnly.inputModalities, ["text"]);
  assert.deepEqual(textOnly.outputModalities, ["text"]);
});

test("catalog parsing refuses a non-object payload instead of guessing", () => {
  assert.deepEqual(parseCatalogResponse(null).models, []);
  assert.deepEqual(parseCatalogResponse({ data: "nope" }).models, []);
  assert.equal(parseCatalogResponse(undefined).acceptedCount, 0);
});

test("catalog parsing bounds the accepted item count", () => {
  const many = { data: Array.from({ length: MAX_CATALOG_ITEMS + 25 }, (_, i) => ({ id: `vendor/m${i}` })) };
  const parsed = parseCatalogResponse(many);

  assert.equal(parsed.models.length, MAX_CATALOG_ITEMS);
  assert.equal(parsed.truncated, true);
});

test("text chat filtering keeps text models and excludes image/output-specialised routes", () => {
  const { models } = parseCatalogResponse(CATALOG_PAYLOAD);
  const chat = ids(filterModels(models, "chat"));

  assert.ok(chat.includes(TEXT_ONLY_CHAT.id));
  assert.ok(chat.includes(IMAGE_INPUT_CHAT.id));
  assert.ok(!chat.includes(EMBEDDING.id));
  assert.ok(!chat.includes(VIDEO.id));
  assert.ok(!chat.includes(RERANK.id));
  assert.ok(!chat.includes(GEMINI_IMAGE_OUTPUT.id));
  assert.ok(!chat.includes(IMAGE_GENERATION.id));
});

test("multimodal filtering requires declared image input and fails closed otherwise", () => {
  const { models } = parseCatalogResponse(CATALOG_PAYLOAD);
  const multimodal = ids(filterModels(models, "multimodal"));

  assert.ok(multimodal.includes(IMAGE_INPUT_CHAT.id));
  assert.ok(!multimodal.includes(TEXT_ONLY_CHAT.id));
  assert.ok(!multimodal.includes(GEMINI_IMAGE_OUTPUT.id));
  assert.ok(!multimodal.includes(IMAGE_GENERATION.id));

  const undeclared = { id: "vendor/undeclared", supported_endpoint_types: ["openai"], object: "model" };
  const parsedUndeclared = parseCatalogResponse({ data: [undeclared] }).models;
  assert.deepEqual(filterModels(parsedUndeclared, "multimodal"), []);
  assert.ok(isChatModel(parsedUndeclared[0]!));
});

test("every capability filter selects only its own endpoint family", () => {
  const { models } = parseCatalogResponse(CATALOG_PAYLOAD);

  assert.deepEqual(ids(filterModels(models, "embedding")), [EMBEDDING.id]);
  assert.deepEqual(ids(filterModels(models, "video")), [VIDEO.id]);
  assert.deepEqual(ids(filterModels(models, "rerank")), [RERANK.id]);
  assert.deepEqual(ids(filterModels(models, "image")).sort(), [GEMINI_IMAGE_OUTPUT.id, IMAGE_GENERATION.id].sort());
});

test("image filtering is driven by endpoint type or image output, never by model name", () => {
  const named = { id: "vendor/super-image-generator", supported_endpoint_types: ["openai"], object: "model" };
  const parsed = parseCatalogResponse({ data: [named] }).models;

  assert.deepEqual(filterModels(parsed, "image"), []);
});

test("live discovery failure falls back to the verified seed and marks the catalog degraded", async () => {
  const result = await discoverOrcaModels({
    apiBaseUrl: "https://api.orcarouter.ai/v1",
    capability: "chat",
    fetchImpl: async () => {
      throw new Error("offline");
    },
  });

  assert.equal(result.source, "seed");
  assert.equal(result.degraded, true);
  assert.match(result.degradedReason!, /offline/);
  assert.deepEqual(ids(result.models).sort(), ids(getVerifiedSeed("chat")).sort());
});

test("the verified chat seed keeps the documented reasoning ladder for openai/gpt-5.5", () => {
  const seed = getVerifiedSeed("chat");
  const gpt55 = seed.find((model) => model.id === "openai/gpt-5.5")!;

  assert.deepEqual(gpt55.reasoningEfforts, ["low", "medium", "high", "xhigh"]);
  assert.ok(gpt55.inputModalities.includes("image"));
  assert.ok(seed.some((model) => model.id === "anthropic/claude-opus-4.8"));
  assert.ok(seed.some((model) => model.id === "google/gemini-3.5-flash"));
  assert.ok(seed.some((model) => model.id === "deepseek/deepseek-v4-pro"));
  assert.ok(seed.some((model) => model.id === "orcarouter/auto"));
});

test("the live catalog is authoritative and the seed is never mixed into it", async () => {
  const result = await discoverOrcaModels({
    apiBaseUrl: "https://api.orcarouter.ai/v1",
    capability: "chat",
    fetchImpl: async () =>
      new Response(JSON.stringify({ data: [TEXT_ONLY_CHAT] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
  });

  assert.equal(result.source, "live");
  assert.equal(result.degraded, false);
  assert.deepEqual(ids(result.models), [TEXT_ONLY_CHAT.id]);
  assert.ok(!ids(result.models).includes("orcarouter/auto"));
});

test("discovery requests the capability filter and sends the Bearer credential only to the API origin", async () => {
  const seen: Array<{ url: string; authorization: string | null }> = [];

  await discoverOrcaModels({
    apiBaseUrl: "https://api.orcarouter.ai/v1",
    apiKey: "sk-orca-test-not-a-real-key",
    capability: "image",
    fetchImpl: async (input, init) => {
      const url = typeof input === "string" ? input : String(input);
      const headers = (init?.headers ?? {}) as Record<string, string>;
      seen.push({ url, authorization: headers.Authorization ?? null });
      return new Response(JSON.stringify({ data: [] }), { status: 200 });
    },
  });

  assert.equal(seen.length, 1);
  assert.equal(seen[0]!.url, "https://api.orcarouter.ai/v1/models?capability=image");
  assert.equal(seen[0]!.authorization, "Bearer sk-orca-test-not-a-real-key");
});

test("an oversized catalog response is rejected rather than parsed", async () => {
  const result = await discoverOrcaModels({
    apiBaseUrl: "https://api.orcarouter.ai/v1",
    capability: "chat",
    maxBytes: 32,
    fetchImpl: async () => new Response(JSON.stringify({ data: [TEXT_ONLY_CHAT] }), { status: 200 }),
  });

  assert.equal(result.source, "seed");
  assert.match(result.degradedReason!, /exceeds 32 bytes/);
});

test("a successful but empty capability result falls back instead of presenting an empty list", async () => {
  const result = await discoverOrcaModels({
    apiBaseUrl: "https://api.orcarouter.ai/v1",
    capability: "image",
    fetchImpl: async () => new Response(JSON.stringify({ data: [TEXT_ONLY_CHAT] }), { status: 200 }),
  });

  assert.equal(result.degraded, true);
  assert.match(result.degradedReason!, /no image-capable models/);
  assert.ok(result.models.length > 0);
});

test("last-known-good is preferred over the seed when a live refresh fails", async () => {
  const result = await discoverOrcaModels({
    apiBaseUrl: "https://api.orcarouter.ai/v1",
    capability: "chat",
    lastKnownGood: parseCatalogResponse({ data: [IMAGE_INPUT_CHAT] }).models,
    fetchImpl: async () => {
      throw new Error("outage");
    },
  });

  assert.equal(result.source, "last-known-good");
  assert.deepEqual(ids(result.models), [IMAGE_INPUT_CHAT.id]);
});

test("a stale model id is invalidated instead of silently kept when the model set changes", () => {
  const { models } = parseCatalogResponse(CATALOG_PAYLOAD);

  assert.deepEqual(resolveModelSelection(TEXT_ONLY_CHAT.id, models), {
    model: TEXT_ONLY_CHAT.id,
    invalidated: false,
    reason: null,
  });

  const stale = resolveModelSelection("openai/retired-model", models);
  assert.equal(stale.model, null);
  assert.equal(stale.invalidated, true);
  assert.match(stale.reason!, /openai\/retired-model/);
});

test("a model that becomes incompatible with the entry capability is cleared", () => {
  const textModels = filterModels(parseCatalogResponse(CATALOG_PAYLOAD).models, "chat");
  const staleForImage = resolveModelSelection(GEMINI_IMAGE_OUTPUT.id, textModels);

  assert.equal(staleForImage.model, null);
  assert.equal(staleForImage.invalidated, true);
});
