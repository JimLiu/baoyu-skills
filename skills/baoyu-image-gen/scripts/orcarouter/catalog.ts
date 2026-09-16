export type OrcaCapability =
  | "chat"
  | "multimodal"
  | "embedding"
  | "image"
  | "video"
  | "rerank";

export type OrcaCatalogSource = "live" | "seed" | "last-known-good";

export type OrcaModel = {
  id: string;
  source: OrcaCatalogSource;
  endpointTypes: string[];
  inputModalities: string[];
  outputModalities: string[];
  contextLength: number | null;
  maxCompletionTokens: number | null;
  description: string | null;
  reasoningEfforts: string[] | null;
};

export type OrcaCatalogResult = {
  models: OrcaModel[];
  source: OrcaCatalogSource;
  degraded: boolean;
  degradedReason: string | null;
  acceptedCount: number;
  rejectedCount: number;
};

export const TEXT_ENDPOINT_TYPES = ["openai", "openai-response", "anthropic", "gemini"] as const;
export const IMAGE_ENDPOINT_TYPES = ["image-generation"] as const;
export const VIDEO_ENDPOINT_TYPES = ["openai-video"] as const;
export const RERANK_ENDPOINT_TYPES = ["jina-rerank"] as const;
export const EMBEDDING_ENDPOINT_TYPES = ["embeddings"] as const;

const NON_TEXT_ENDPOINT_TYPES = [
  ...IMAGE_ENDPOINT_TYPES,
  ...VIDEO_ENDPOINT_TYPES,
  ...RERANK_ENDPOINT_TYPES,
];

const NON_TEXT_OUTPUT_MODALITIES = ["image", "video", "audio"];

export const MAX_CATALOG_BYTES = 512 * 1024;
export const MAX_CATALOG_ITEMS = 400;
export const CATALOG_TIMEOUT_MS = 8000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function readPositiveInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return Math.floor(value);
}

function readModalities(architecture: unknown, field: string): string[] {
  if (!isRecord(architecture)) return [];
  return readStringArray(architecture[field]);
}

export function parseCatalogModel(raw: unknown, source: OrcaCatalogSource = "live"): OrcaModel | null {
  if (!isRecord(raw)) return null;

  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  if (!id || /\s/.test(id)) return null;

  const endpointTypes = readStringArray(raw.supported_endpoint_types);

  return {
    id,
    source,
    endpointTypes,
    inputModalities: readModalities(raw.architecture, "input_modalities"),
    outputModalities: readModalities(raw.architecture, "output_modalities"),
    contextLength: readPositiveInt(raw.context_length),
    maxCompletionTokens: readPositiveInt(raw.max_completion_tokens),
    description: typeof raw.description === "string" && raw.description.trim() ? raw.description.trim() : null,
    reasoningEfforts: null,
  };
}

export type ParseCatalogResult = {
  models: OrcaModel[];
  acceptedCount: number;
  rejectedCount: number;
  truncated: boolean;
};

export function parseCatalogResponse(
  payload: unknown,
  source: OrcaCatalogSource = "live",
  maxItems = MAX_CATALOG_ITEMS,
): ParseCatalogResult {
  const rawItems = isRecord(payload) && Array.isArray(payload.data) ? payload.data : null;
  if (!rawItems) return { models: [], acceptedCount: 0, rejectedCount: 0, truncated: false };

  const models: OrcaModel[] = [];
  let rejectedCount = 0;
  const seen = new Set<string>();

  for (const raw of rawItems) {
    if (models.length >= maxItems) {
      return { models, acceptedCount: models.length, rejectedCount, truncated: true };
    }

    const parsed = parseCatalogModel(raw, source);
    if (!parsed || seen.has(parsed.id)) {
      rejectedCount += 1;
      continue;
    }

    seen.add(parsed.id);
    models.push(parsed);
  }

  return { models, acceptedCount: models.length, rejectedCount, truncated: false };
}

function hasAny(values: string[], candidates: readonly string[]): boolean {
  return candidates.some((candidate) => values.includes(candidate));
}

function hasAll(values: string[], required: Iterable<string>): boolean {
  for (const item of required) {
    if (!values.includes(item)) return false;
  }
  return true;
}

export function isChatModel(model: OrcaModel): boolean {
  if (!hasAny(model.endpointTypes, TEXT_ENDPOINT_TYPES)) return false;
  if (hasAny(model.endpointTypes, NON_TEXT_ENDPOINT_TYPES)) return false;
  if (hasAny(model.outputModalities, NON_TEXT_OUTPUT_MODALITIES)) return false;
  return true;
}

export function isImageModel(model: OrcaModel): boolean {
  if (hasAny(model.endpointTypes, IMAGE_ENDPOINT_TYPES)) return true;
  return model.outputModalities.includes("image");
}

export function isEmbeddingModel(model: OrcaModel): boolean {
  return hasAny(model.endpointTypes, EMBEDDING_ENDPOINT_TYPES);
}

export function isVideoModel(model: OrcaModel): boolean {
  return hasAny(model.endpointTypes, VIDEO_ENDPOINT_TYPES);
}

export function isRerankModel(model: OrcaModel): boolean {
  return hasAny(model.endpointTypes, RERANK_ENDPOINT_TYPES);
}

export type ModelFilterOptions = {
  requireInputModalities?: string[];
};

export function filterModels(
  models: OrcaModel[],
  capability: OrcaCapability,
  options: ModelFilterOptions = {},
): OrcaModel[] {
  const required = options.requireInputModalities ?? [];

  return models.filter((model) => {
    if (!matchesCapability(model, capability)) return false;
    if (required.length === 0) return true;
    return hasAll(model.inputModalities, required);
  });
}

function matchesCapability(model: OrcaModel, capability: OrcaCapability): boolean {
  switch (capability) {
    case "chat":
      return isChatModel(model);
    case "multimodal":
      return isChatModel(model) && model.inputModalities.includes("image");
    case "embedding":
      return isEmbeddingModel(model);
    case "image":
      return isImageModel(model);
    case "video":
      return isVideoModel(model);
    case "rerank":
      return isRerankModel(model);
  }
}

export const VERIFIED_CHAT_SEED: OrcaModel[] = [
  {
    id: "openai/gpt-5.5",
    source: "seed",
    endpointTypes: ["openai", "openai-response"],
    inputModalities: ["text", "image"],
    outputModalities: ["text"],
    contextLength: null,
    maxCompletionTokens: null,
    description: null,
    reasoningEfforts: ["low", "medium", "high", "xhigh"],
  },
  {
    id: "anthropic/claude-opus-4.8",
    source: "seed",
    endpointTypes: ["openai", "anthropic", "openai-response"],
    inputModalities: ["text", "image"],
    outputModalities: ["text"],
    contextLength: null,
    maxCompletionTokens: null,
    description: null,
    reasoningEfforts: null,
  },
  {
    id: "google/gemini-3.5-flash",
    source: "seed",
    endpointTypes: ["openai", "gemini"],
    inputModalities: ["text", "image"],
    outputModalities: ["text"],
    contextLength: null,
    maxCompletionTokens: null,
    description: null,
    reasoningEfforts: null,
  },
  {
    id: "deepseek/deepseek-v4-pro",
    source: "seed",
    endpointTypes: ["openai", "openai-response"],
    inputModalities: ["text"],
    outputModalities: ["text"],
    contextLength: null,
    maxCompletionTokens: null,
    description: null,
    reasoningEfforts: null,
  },
  {
    id: "orcarouter/auto",
    source: "seed",
    endpointTypes: ["openai", "openai-response", "anthropic", "gemini"],
    inputModalities: [],
    outputModalities: [],
    contextLength: null,
    maxCompletionTokens: null,
    description: null,
    reasoningEfforts: null,
  },
];

export const VERIFIED_IMAGE_SEED: OrcaModel[] = [
  {
    id: "google/gemini-3.1-flash-image-preview",
    source: "seed",
    endpointTypes: ["gemini"],
    inputModalities: ["text", "image"],
    outputModalities: ["image", "text"],
    contextLength: null,
    maxCompletionTokens: null,
    description: null,
    reasoningEfforts: null,
  },
  {
    id: "google/gemini-3-pro-image-preview",
    source: "seed",
    endpointTypes: ["gemini"],
    inputModalities: ["text", "image"],
    outputModalities: ["image", "text"],
    contextLength: null,
    maxCompletionTokens: null,
    description: null,
    reasoningEfforts: null,
  },
  {
    id: "google/gemini-2.5-flash-image",
    source: "seed",
    endpointTypes: ["gemini"],
    inputModalities: ["text", "image"],
    outputModalities: ["image", "text"],
    contextLength: null,
    maxCompletionTokens: null,
    description: null,
    reasoningEfforts: null,
  },
  {
    id: "openai/gpt-image-1.5",
    source: "seed",
    endpointTypes: ["image-generation"],
    inputModalities: ["text", "image"],
    outputModalities: [],
    contextLength: null,
    maxCompletionTokens: null,
    description: null,
    reasoningEfforts: null,
  },
  {
    id: "openai/gpt-image-1",
    source: "seed",
    endpointTypes: ["image-generation"],
    inputModalities: ["text", "image"],
    outputModalities: [],
    contextLength: null,
    maxCompletionTokens: null,
    description: null,
    reasoningEfforts: null,
  },
  {
    id: "google/imagen-4.0-generate-001",
    source: "seed",
    endpointTypes: ["image-generation"],
    inputModalities: ["text"],
    outputModalities: [],
    contextLength: null,
    maxCompletionTokens: null,
    description: null,
    reasoningEfforts: null,
  },
];

const SEED_CATALOG_MODELS: OrcaModel[] = [...VERIFIED_CHAT_SEED, ...VERIFIED_IMAGE_SEED];

export function getVerifiedSeed(capability: OrcaCapability): OrcaModel[] {
  return filterModels(SEED_CATALOG_MODELS, capability);
}

export const DEFAULT_IMAGE_MODEL = "google/gemini-3.1-flash-image-preview";

export function getDefaultImageModel(): string {
  return process.env.ORCAROUTER_IMAGE_MODEL || DEFAULT_IMAGE_MODEL;
}

export type DiscoveryOptions = {
  apiBaseUrl: string;
  apiKey?: string | null;
  capability: OrcaCapability;
  catalogCapability?: string | null;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  maxItems?: number;
  maxBytes?: number;
  lastKnownGood?: OrcaModel[] | null;
};

export async function discoverOrcaModels(options: DiscoveryOptions): Promise<OrcaCatalogResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? CATALOG_TIMEOUT_MS;
  const maxItems = options.maxItems ?? MAX_CATALOG_ITEMS;
  const maxBytes = options.maxBytes ?? MAX_CATALOG_BYTES;

  const live = await fetchLiveCatalog({
    ...options,
    fetchImpl,
    timeoutMs,
    maxItems,
    maxBytes,
  });

  if (live.ok) {
    const filtered = filterModels(live.models, options.capability);
    if (filtered.length > 0) {
      return {
        models: filtered,
        source: "live",
        degraded: false,
        degradedReason: null,
        acceptedCount: live.acceptedCount,
        rejectedCount: live.rejectedCount,
      };
    }
    return fallbackResult(options, `live catalog returned no ${options.capability}-capable models`, live.acceptedCount, live.rejectedCount);
  }

  return fallbackResult(options, live.reason, live.acceptedCount, live.rejectedCount);
}

function fallbackResult(
  options: DiscoveryOptions,
  reason: string,
  acceptedCount: number,
  rejectedCount: number,
): OrcaCatalogResult {
  const lastKnownGood = options.lastKnownGood ? filterModels(options.lastKnownGood, options.capability) : [];
  if (lastKnownGood.length > 0) {
    return {
      models: lastKnownGood,
      source: "last-known-good",
      degraded: true,
      degradedReason: reason,
      acceptedCount,
      rejectedCount,
    };
  }

  const seed = getVerifiedSeed(options.capability);
  return {
    models: seed,
    source: "seed",
    degraded: true,
    degradedReason: seed.length > 0 ? reason : `${reason}; no verified seed available for ${options.capability}`,
    acceptedCount,
    rejectedCount,
  };
}

type LiveCatalog =
  | { ok: true; models: OrcaModel[]; acceptedCount: number; rejectedCount: number }
  | { ok: false; reason: string; acceptedCount: number; rejectedCount: number };

async function fetchLiveCatalog(
  options: DiscoveryOptions & { fetchImpl: typeof fetch; timeoutMs: number; maxItems: number; maxBytes: number },
): Promise<LiveCatalog> {
  const empty = { acceptedCount: 0, rejectedCount: 0 };
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.apiKey) headers.Authorization = `Bearer ${options.apiKey}`;

  let response: Response;
  try {
    response = await options.fetchImpl(
      buildCapabilityUrl(options.apiBaseUrl, options.catalogCapability ?? options.capability),
      { headers, signal: AbortSignal.timeout(options.timeoutMs) },
    );
  } catch (error) {
    return { ok: false, reason: `catalog request failed: ${describeError(error)}`, ...empty };
  }

  if (!response.ok) {
    return { ok: false, reason: `catalog request failed: HTTP ${response.status}`, ...empty };
  }

  const declaredLength = Number(response.headers?.get?.("content-length") ?? "");
  if (Number.isFinite(declaredLength) && declaredLength > options.maxBytes) {
    return { ok: false, reason: `catalog response exceeds ${options.maxBytes} bytes`, ...empty };
  }

  let text: string;
  try {
    text = await response.text();
  } catch (error) {
    return { ok: false, reason: `catalog body failed: ${describeError(error)}`, ...empty };
  }

  if (text.length > options.maxBytes) {
    return { ok: false, reason: `catalog response exceeds ${options.maxBytes} bytes`, ...empty };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    return { ok: false, reason: "catalog response was not valid JSON", ...empty };
  }

  const parsed = parseCatalogResponse(payload, "live", options.maxItems);
  return {
    ok: true,
    models: parsed.models,
    acceptedCount: parsed.acceptedCount,
    rejectedCount: parsed.rejectedCount,
  };
}

function buildCapabilityUrl(apiBaseUrl: string, capability: string | null): string {
  const url = new URL(`${apiBaseUrl}/models`);
  if (capability) url.searchParams.set("capability", capability);
  return url.toString();
}

export function describeError(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === "TimeoutError") return "request timed out";
    return error.message;
  }
  return String(error);
}

export type ModelSelection = {
  model: string | null;
  invalidated: boolean;
  reason: string | null;
};

export function resolveModelSelection(
  requested: string | null,
  available: OrcaModel[],
): ModelSelection {
  if (!requested) return { model: null, invalidated: false, reason: null };

  const match = available.find((model) => model.id === requested);
  if (match) return { model: match.id, invalidated: false, reason: null };

  return {
    model: null,
    invalidated: true,
    reason: `${requested} is not in the current OrcaRouter ${available.length} model set`,
  };
}
