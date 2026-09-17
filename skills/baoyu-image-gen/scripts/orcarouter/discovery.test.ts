import assert from "node:assert/strict";
import test from "node:test";

import {
  CACHE_TTL_MS,
  cacheCatalog,
  clearOrcaCatalogCache,
  ensureImageCatalog,
  getCachedImageCatalog,
  getLastKnownGoodImageCatalog,
  seedImageModels,
} from "./discovery.ts";
import { parseCatalogResponse } from "./catalog.ts";

const API_BASE = "https://api.orcarouter.ai/v1";
const KEY_ONE = "sk-orca-fake-one-aaaa";
const KEY_TWO = "sk-orca-fake-two-bbbb";

const LIVE_IMAGE_PAYLOAD = {
  data: [
    { id: "google/gemini-3.1-flash-image-preview", supported_endpoint_types: ["gemini"], architecture: { input_modalities: ["text", "image"], output_modalities: ["image", "text"] } },
    { id: "openai/gpt-image-1.5", supported_endpoint_types: ["image-generation"], architecture: { input_modalities: ["text", "image"] } },
    { id: "deepseek/deepseek-v4-pro", supported_endpoint_types: ["openai"], architecture: { input_modalities: ["text"], output_modalities: ["text"] } },
  ],
};

function countingFetch(payload: unknown): { calls: () => number; impl: typeof fetch } {
  let calls = 0;
  return {
    calls: () => calls,
    impl: (async () => {
      calls += 1;
      return new Response(JSON.stringify(payload), { status: 200 });
    }) as unknown as typeof fetch,
  };
}

test("a live catalog is cached per credential and re-used without a second request", async () => {
  clearOrcaCatalogCache();
  const fetcher = countingFetch(LIVE_IMAGE_PAYLOAD);

  const first = await ensureImageCatalog({ apiBaseUrl: API_BASE, apiKey: KEY_ONE, fetchImpl: fetcher.impl });
  const second = await ensureImageCatalog({ apiBaseUrl: API_BASE, apiKey: KEY_ONE, fetchImpl: fetcher.impl });

  assert.equal(first.source, "live");
  assert.equal(second.source, "live");
  assert.equal(fetcher.calls(), 1, "the cached catalog must not trigger a second request");
  assert.equal(getCachedImageCatalog(API_BASE, KEY_ONE)?.models.length, 2);
});

test("caches are scoped per credential so one key never sees another key's catalog", async () => {
  clearOrcaCatalogCache();
  const fetcher = countingFetch(LIVE_IMAGE_PAYLOAD);

  await ensureImageCatalog({ apiBaseUrl: API_BASE, apiKey: KEY_ONE, fetchImpl: fetcher.impl });
  assert.equal(getCachedImageCatalog(API_BASE, KEY_TWO), null);
});

test("forceRefresh bypasses the cache for an explicit user refresh", async () => {
  clearOrcaCatalogCache();
  const fetcher = countingFetch(LIVE_IMAGE_PAYLOAD);

  await ensureImageCatalog({ apiBaseUrl: API_BASE, apiKey: KEY_ONE, fetchImpl: fetcher.impl });
  await ensureImageCatalog({ apiBaseUrl: API_BASE, apiKey: KEY_ONE, fetchImpl: fetcher.impl, forceRefresh: true });

  assert.equal(fetcher.calls(), 2);
});

test("a failed refresh keeps the last known good catalog available and marked degraded", async () => {
  clearOrcaCatalogCache();
  const good = countingFetch(LIVE_IMAGE_PAYLOAD);
  const first = await ensureImageCatalog({ apiBaseUrl: API_BASE, apiKey: KEY_ONE, fetchImpl: good.impl });
  assert.equal(first.source, "live");

  const failing = (async () => {
    throw new Error("network down");
  }) as unknown as typeof fetch;

  const second = await ensureImageCatalog({
    apiBaseUrl: API_BASE,
    apiKey: KEY_ONE,
    fetchImpl: failing,
    forceRefresh: true,
  });

  assert.equal(second.source, "last-known-good");
  assert.equal(second.degraded, true);
  assert.match(second.degradedReason!, /network down/);
  assert.deepEqual(
    second.models.map((model) => model.id).sort(),
    ["google/gemini-3.1-flash-image-preview", "openai/gpt-image-1.5"],
  );
});

test("a cold start with no live catalog and no last-known-good falls back to the verified seed only", async () => {
  clearOrcaCatalogCache();
  const failing = (async () => {
    throw new Error("offline");
  }) as unknown as typeof fetch;

  const result = await ensureImageCatalog({ apiBaseUrl: API_BASE, apiKey: KEY_ONE, fetchImpl: failing });

  assert.equal(result.source, "seed");
  assert.equal(result.degraded, true);
  assert.deepEqual(
    result.models.map((model) => model.id).sort(),
    seedImageModels().map((model) => model.id).sort(),
  );
  assert.ok(result.models.length > 0, "a cold start must not present an empty model list");
  assert.ok(result.models.every((model) => model.source === "seed"));
});

test("a successful refresh replaces the degraded state instead of blending seed and live models", async () => {
  clearOrcaCatalogCache();
  const failing = (async () => {
    throw new Error("offline");
  }) as unknown as typeof fetch;
  await ensureImageCatalog({ apiBaseUrl: API_BASE, apiKey: KEY_ONE, fetchImpl: failing });

  const good = countingFetch(LIVE_IMAGE_PAYLOAD);
  const result = await ensureImageCatalog({
    apiBaseUrl: API_BASE,
    apiKey: KEY_ONE,
    fetchImpl: good.impl,
    forceRefresh: true,
  });

  assert.equal(result.source, "live");
  assert.equal(result.degraded, false);
  assert.ok(result.models.every((model) => model.source === "live"));
  assert.ok(!result.models.some((model) => model.id === "orcarouter/auto"));
});

test("cache invalidated catalogs are dropped entirely", () => {
  clearOrcaCatalogCache();
  cacheCatalog({
    models: parseCatalogResponse(LIVE_IMAGE_PAYLOAD).models,
    source: "live",
    degraded: false,
    degradedReason: null,
    acceptedCount: 3,
    rejectedCount: 0,
  });
  assert.ok(getLastKnownGoodImageCatalog());

  clearOrcaCatalogCache();
  assert.equal(getLastKnownGoodImageCatalog(), null);
  assert.equal(getCachedImageCatalog(API_BASE, KEY_ONE), null);
  assert.ok(CACHE_TTL_MS > 0);
});
