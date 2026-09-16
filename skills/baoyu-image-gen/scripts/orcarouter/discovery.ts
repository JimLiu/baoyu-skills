import { createHash } from "node:crypto";
import {
  discoverOrcaModels,
  getVerifiedSeed,
  type OrcaCatalogResult,
  type OrcaModel,
} from "./catalog";

export const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry = {
  result: OrcaCatalogResult;
  fetchedAt: number;
};

const imageCache = new Map<string, CacheEntry>();
let lastImageCatalog: OrcaCatalogResult | null = null;

function cacheKey(apiBaseUrl: string, apiKey: string): string {
  const fingerprint = createHash("sha256").update(apiKey).digest("hex").slice(0, 16);
  return `${apiBaseUrl}::${fingerprint}`;
}

export function clearOrcaCatalogCache(): void {
  imageCache.clear();
  lastImageCatalog = null;
}

export function cacheCatalog(result: OrcaCatalogResult): void {
  lastImageCatalog = result;
}

export function getCachedImageCatalog(apiBaseUrl: string, apiKey: string): OrcaCatalogResult | null {
  const entry = imageCache.get(cacheKey(apiBaseUrl, apiKey));
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
  return entry.result;
}

export function getLastKnownGoodImageCatalog(): OrcaCatalogResult | null {
  return lastImageCatalog;
}

export type EnsureCatalogOptions = {
  apiBaseUrl: string;
  apiKey: string | null;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  forceRefresh?: boolean;
};

export async function ensureImageCatalog(options: EnsureCatalogOptions): Promise<OrcaCatalogResult> {
  const apiKey = options.apiKey ?? "";

  if (!options.forceRefresh) {
    const cached = getCachedImageCatalog(options.apiBaseUrl, apiKey);
    if (cached) return cached;
  }

  const previous = lastImageCatalog;
  const result = await discoverOrcaModels({
    apiBaseUrl: options.apiBaseUrl,
    apiKey: options.apiKey,
    capability: "image",
    catalogCapability: "image",
    fetchImpl: options.fetchImpl,
    timeoutMs: options.timeoutMs,
    lastKnownGood: previous && previous.source === "live" ? previous.models : null,
  });

  imageCache.set(cacheKey(options.apiBaseUrl, apiKey), { result, fetchedAt: Date.now() });
  lastImageCatalog = result;

  return result;
}

export function seedImageModels(): OrcaModel[] {
  return getVerifiedSeed("image");
}
