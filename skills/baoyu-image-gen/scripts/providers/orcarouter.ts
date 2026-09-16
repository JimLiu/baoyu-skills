import path from "node:path";
import { readFile } from "node:fs/promises";
import type { CliArgs } from "../types";
import {
  buildContent,
  extractImageFromResponse,
  getImageSize,
  type OpenRouterResponse,
} from "./openrouter";
import { DEFAULT_IMAGE_MODEL, type OrcaModel } from "../orcarouter/catalog";
import {
  cacheCatalog,
  ensureImageCatalog,
  type OrcaCatalogResult,
} from "../orcarouter/discovery";
import {
  ORCA_KEY_URL,
  ORCA_KEY_COMMAND,
  ORCA_PKCE_PROVIDER,
  classifyGenerationFailure,
  maskSecret,
  type OrcaCredential,
} from "../orcarouter/credentials";
import { resolveOrcaOrigins } from "../orcarouter/origins";

const IMAGE_ENDPOINT_TYPE = "image-generation";
const ASPECT_RATIO_ENDPOINT_TYPES = ["gemini"];
const ASPECT_RATIO_MODEL_FAMILY = ["google/gemini"];
const TOP_LEVEL_IMAGE_ENDPOINTS = ["gemini"];

type OrcaCredentialHolder = {
  current: OrcaCredential | null;
};

const credentialHolder: OrcaCredentialHolder = { current: null };

const discoveredEndpointTypes = new Map<string, string[]>();

export function setActiveOrcaCredential(credential: OrcaCredential | null): void {
  credentialHolder.current = credential;
}

export function getActiveOrcaCredential(): OrcaCredential | null {
  return credentialHolder.current;
}

export function getDefaultModel(): string {
  return process.env.ORCAROUTER_IMAGE_MODEL || DEFAULT_IMAGE_MODEL;
}

export function getCatalogModels(models: OrcaCatalogResult): string[] {
  return models.models.map((model) => model.id);
}

export function rememberCatalogEntries(models: OrcaModel[]): void {
  for (const model of models) {
    discoveredEndpointTypes.set(model.id, model.endpointTypes);
  }
}

export function forgetCatalogEntries(): void {
  discoveredEndpointTypes.clear();
}

export function supportsAspectRatioField(model: string): boolean {
  const endpointTypes = discoveredEndpointTypes.get(model);
  if (endpointTypes) {
    return endpointTypes.some((type) => ASPECT_RATIO_ENDPOINT_TYPES.includes(type));
  }

  return ASPECT_RATIO_MODEL_FAMILY.some((prefix) => model.startsWith(prefix));
}

export function usesTopLevelImageEndpoint(model: string): boolean {
  return TOP_LEVEL_IMAGE_ENDPOINTS.some((prefix) => model.startsWith(prefix));
}

export function endpointPathFor(model: string, entryEndpointTypes: string[]): string {
  if (entryEndpointTypes.includes(IMAGE_ENDPOINT_TYPE)) return "/images/generations";
  if (entryEndpointTypes.includes("gemini") && !supportsAspectRatioField(model)) {
    return "/images/generations";
  }
  return "/chat/completions";
}

export function resolveCredential(env: Record<string, string | undefined> = process.env): OrcaCredential {
  const viaKey = env.ORCAROUTER_API_KEY?.trim();
  if (viaKey) {
    return {
      source: "api-key",
      value: viaKey,
      scope: null,
      userId: null,
      generation: 1,
      status: "active",
      reason: null,
    };
  }

  const held = credentialHolder.current;
  if (held && held.status === "active") return held;

  throw new Error(
    `OrcaRouter is not connected. Set ORCAROUTER_API_KEY (create one at ${ORCA_KEY_URL}) or run the ${ORCA_KEY_COMMAND} login to authorize with your OrcaRouter account (${ORCA_PKCE_PROVIDER}).`
  );
}

export type OrcaImageCatalogView = {
  ids: string[];
  source: OrcaCatalogResult["source"];
  degraded: boolean;
  degradedReason: string | null;
};

export async function loadImageCatalog(
  credential: OrcaCredential,
  options: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<OrcaCatalogResult> {
  const origins = resolveOrcaOrigins();
  return ensureImageCatalog({
    apiBaseUrl: origins.apiBaseUrl,
    apiKey: credential.value,
    fetchImpl: options.fetchImpl,
    timeoutMs: options.timeoutMs,
  });
}

export function describeImageCatalog(result: OrcaCatalogResult): OrcaImageCatalogView {
  return {
    ids: getCatalogModels(result),
    source: result.source,
    degraded: result.degraded,
    degradedReason: result.degradedReason,
  };
}

export function validateArgs(model: string, args: CliArgs): void {
  if (!args.aspectRatio) return;
  if (!supportsAspectRatioField(model)) {
    throw new Error(
      `OrcaRouter model ${model} does not accept an aspect-ratio field on this endpoint. Use --size <WxH> (or --provider openrouter for Gemini image aspect ratios).`
    );
  }
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/png";
}

async function readImageAsDataUrl(filePath: string): Promise<string> {
  const bytes = await readFile(filePath);
  return `data:${getMimeType(filePath)};base64,${bytes.toString("base64")}`;
}

function getModalities(model: string): string[] {
  return supportsAspectRatioField(model) ? ["image", "text"] : ["image"];
}

export function buildRequestBody(
  prompt: string,
  model: string,
  args: CliArgs,
  referenceImages: string[],
): Record<string, unknown> {
  validateArgs(model, args);

  const imageConfig: Record<string, string> = {};
  const imageSize = getImageSize(args);
  if (imageSize) imageConfig.image_size = imageSize;
  if (args.aspectRatio) imageConfig.aspect_ratio = args.aspectRatio;

  const body: Record<string, unknown> = {
    messages: [
      {
        role: "user",
        content: buildContent(prompt, referenceImages),
      },
    ],
    modalities: getModalities(model),
    stream: false,
  };

  if (Object.keys(imageConfig).length > 0) {
    body.image_config = imageConfig;
    body.provider = { require_parameters: true };
  }

  return body;
}

export function buildImagesGenerationsBody(
  prompt: string,
  model: string,
  args: CliArgs,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model,
    prompt,
    n: 1,
  };

  if (args.size) body.size = args.size;
  if (args.quality === "2k") body.quality = "high";

  return body;
}

export async function generateImage(
  prompt: string,
  model: string,
  args: CliArgs,
): Promise<Uint8Array> {
  const credential = resolveCredential();
  const origins = resolveOrcaOrigins();
  const catalog = await loadImageCatalog(credential);
  cacheCatalog(catalog);
  rememberCatalogEntries(catalog.models);

  const entry = catalog.models.find((item) => item.id === model);
  if (catalog.source === "live" && !entry) {
    throw new Error(
      `OrcaRouter model ${model} is not in the live image catalog for this credential (${catalog.models.length} image-capable models). Pick a model from the discovered list.`
    );
  }

  const entryEndpointTypes = entry?.endpointTypes ?? [];
  const referenceImages: string[] = [];
  for (const refPath of args.referenceImages) {
    referenceImages.push(await readImageAsDataUrl(refPath));
  }

  if (
    entryEndpointTypes.includes(IMAGE_ENDPOINT_TYPE) &&
    (referenceImages.length > 0 || args.aspectRatio || args.imageSize)
  ) {
    throw new Error(
      `OrcaRouter routes ${model} to the image-generation endpoint, which does not accept reference images, aspect ratios, or image sizes in this skill. Use --provider openrouter for Gemini image models with references, or drop --ref/--ar/--imageSize.`
    );
  }

  const useImagesEndpoint = endpointPathFor(model, entryEndpointTypes) === "/images/generations";
  const url = `${origins.apiBaseUrl}${useImagesEndpoint ? "/images/generations" : "/chat/completions"}`;

  const body = useImagesEndpoint
    ? buildImagesGenerationsBody(prompt, model, args)
    : { model, ...buildRequestBody(prompt, model, args, referenceImages) };

  console.log(
    `Generating image with OrcaRouter (${model}) via ${useImagesEndpoint ? "images/generations" : "chat/completions"} [credential ${maskSecret(credential.value)}, catalog ${catalog.source}]`,
  );

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${credential.value}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const classified = classifyGenerationFailure(
      response.status,
      `OrcaRouter API error (${response.status}): ${errorText}`,
      credential.generation,
      credentialHolder.current?.generation ?? credential.generation,
    );
    if (classified.markReauth && credentialHolder.current) {
      credentialHolder.current = {
        ...credentialHolder.current,
        status: "needsReauth",
        reason: `HTTP 401 from the OrcaRouter relay for generation ${credential.generation}`,
      };
    }
    throw new Error(classified.message);
  }

  if (useImagesEndpoint) {
    const result = (await response.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
    const first = result.data?.[0];
    if (first?.b64_json) return Uint8Array.from(Buffer.from(first.b64_json, "base64"));
    if (first?.url) {
      const imageResponse = await fetch(first.url);
      if (!imageResponse.ok) throw new Error("Failed to download the OrcaRouter image");
      return new Uint8Array(await imageResponse.arrayBuffer());
    }
    throw new Error("No image in the OrcaRouter images/generations response");
  }

  const result = (await response.json()) as OpenRouterResponse;
  return extractImageFromResponse(result);
}

export function describeCredentialSource(
  env: Record<string, string | undefined> = process.env,
): "api-key" | "pkce" | "none" {
  if (env.ORCAROUTER_API_KEY?.trim()) return "api-key";
  const held = credentialHolder.current;
  return held && held.status === "active" ? "pkce" : "none";
}
