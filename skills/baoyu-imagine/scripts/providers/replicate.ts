import path from "node:path";
import { readFile } from "node:fs/promises";
import type { CliArgs } from "../types";

const DEFAULT_MODEL = "google/nano-banana-2";
const SYNC_WAIT_SECONDS = 60;
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_MS = 300_000;
const SEEDREAM_45_SIZES = new Set(["2K", "4K"]);
const SEEDREAM_5_LITE_SIZES = new Set(["2K", "3K"]);
const WAN_SIZES = new Set(["1K", "2K"]);
const WAN_PRO_SIZES = new Set(["1K", "2K", "4K"]);
const SEEDREAM_45_CUSTOM_MIN = 1024;
const SEEDREAM_45_CUSTOM_MAX = 4096;

export function getDefaultModel(): string {
  return process.env.REPLICATE_IMAGE_MODEL || DEFAULT_MODEL;
}

function getApiToken(): string | null {
  return process.env.REPLICATE_API_TOKEN || null;
}

function getBaseUrl(): string {
  const base = process.env.REPLICATE_BASE_URL || "https://api.replicate.com";
  return base.replace(/\/+$/g, "");
}

export function parseModelId(model: string): { owner: string; name: string; version: string | null } {
  const [ownerName, version] = model.split(":");
  const parts = ownerName!.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(
      `Invalid Replicate model format: "${model}". Expected "owner/name" or "owner/name:version".`
    );
  }
  return { owner: parts[0], name: parts[1], version: version || null };
}

function isSeedream45Model(model: string): boolean {
  return model.startsWith("bytedance/seedream-4.5");
}

function isSeedream5LiteModel(model: string): boolean {
  return model.startsWith("bytedance/seedream-5-lite");
}

function isSeedreamModel(model: string): boolean {
  return isSeedream45Model(model) || isSeedream5LiteModel(model);
}

function isWanProModel(model: string): boolean {
  return model.startsWith("wan-video/wan-2.7-image-pro");
}

function isWanModel(model: string): boolean {
  return model.startsWith("wan-video/wan-2.7-image");
}

function parsePixelSize(size: string): { width: number; height: number } | null {
  const match = size.trim().match(/^(\d+)\s*[xX*]\s*(\d+)$/);
  if (!match) return null;

  const width = Number.parseInt(match[1]!, 10);
  const height = Number.parseInt(match[2]!, 10);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  return { width, height };
}

function normalizePixelSize(size: string): string {
  const parsed = parsePixelSize(size);
  if (!parsed) return size;
  return `${parsed.width}*${parsed.height}`;
}

function normalizePresetSize(size: string): string {
  return size.trim().toUpperCase();
}

function getSeedreamSize(model: string, args: CliArgs): string | null {
  if (args.size) return args.size;
  if (isSeedream45Model(model) || isSeedream5LiteModel(model)) return "2K";
  return null;
}

function getWanSize(args: CliArgs): string | null {
  if (args.size) return args.size;
  if (args.quality === "normal") return "1K";
  if (args.quality === "2k") return "2K";
  return null;
}

function buildNanoBananaInput(prompt: string, args: CliArgs, referenceImages: string[]): Record<string, unknown> {
  const input: Record<string, unknown> = { prompt };

  if (args.aspectRatio) {
    input.aspect_ratio = args.aspectRatio;
  } else if (referenceImages.length > 0) {
    input.aspect_ratio = "match_input_image";
  }

  if (args.n > 1) {
    input.number_of_images = args.n;
  }

  if (args.quality === "normal") {
    input.resolution = "1K";
  } else if (args.quality === "2k") {
    input.resolution = "2K";
  }

  input.output_format = "png";

  if (referenceImages.length > 0) {
    input.image_input = referenceImages;
  }

  return input;
}

function buildSeedreamInput(
  prompt: string,
  model: string,
  args: CliArgs,
  referenceImages: string[],
): Record<string, unknown> {
  const input: Record<string, unknown> = { prompt };
  const requestedSize = getSeedreamSize(model, args);

  if (requestedSize) {
    if (isSeedream45Model(model)) {
      const customSize = parsePixelSize(requestedSize);
      if (customSize) {
        input.size = "custom";
        input.width = customSize.width;
        input.height = customSize.height;
      } else {
        input.size = normalizePresetSize(requestedSize);
      }
    } else {
      input.size = normalizePresetSize(requestedSize);
      input.output_format = "png";
    }
  }

  if (args.aspectRatio && input.size !== "custom") {
    input.aspect_ratio = args.aspectRatio;
  } else if (!args.aspectRatio && referenceImages.length > 0 && input.size !== "custom") {
    input.aspect_ratio = "match_input_image";
  }

  if (referenceImages.length > 0) {
    input.image_input = referenceImages;
  }

  return input;
}

function buildWanInput(prompt: string, args: CliArgs, referenceImages: string[]): Record<string, unknown> {
  const input: Record<string, unknown> = { prompt };
  const requestedSize = getWanSize(args);

  if (requestedSize) {
    input.size = parsePixelSize(requestedSize)
      ? normalizePixelSize(requestedSize)
      : normalizePresetSize(requestedSize);
  }

  if (referenceImages.length > 0) {
    input.images = referenceImages;
    input.thinking_mode = false;
  } else {
    input.thinking_mode = true;
  }

  return input;
}

export function getDefaultOutputExtension(model: string): ".png" | ".jpg" {
  if (isSeedream45Model(model)) return ".jpg";
  return ".png";
}

export function validateArgs(model: string, args: CliArgs): void {
  if (args.n > 1) {
    throw new Error(
      "Replicate --n is not supported yet in baoyu-imagine because this provider currently writes a single output file per request."
    );
  }

  if (isSeedream45Model(model)) {
    const requestedSize = getSeedreamSize(model, args);
    if (requestedSize) {
      const customSize = parsePixelSize(requestedSize);
      if (customSize) {
        if (
          customSize.width < SEEDREAM_45_CUSTOM_MIN ||
          customSize.width > SEEDREAM_45_CUSTOM_MAX ||
          customSize.height < SEEDREAM_45_CUSTOM_MIN ||
          customSize.height > SEEDREAM_45_CUSTOM_MAX
        ) {
          throw new Error("Seedream 4.5 on Replicate custom --size must keep width and height between 1024 and 4096.");
        }
      } else {
        const normalizedSize = normalizePresetSize(requestedSize);
        if (!SEEDREAM_45_SIZES.has(normalizedSize)) {
          throw new Error("Seedream 4.5 on Replicate requires --size to be 2K, 4K, or custom dimensions like 1536x1024.");
        }
      }
    }

    if (args.referenceImages.length > 14) {
      throw new Error("Seedream 4.5 on Replicate supports at most 14 reference images per request.");
    }
  }

  if (isSeedream5LiteModel(model)) {
    const requestedSize = getSeedreamSize(model, args);
    if (requestedSize && !SEEDREAM_5_LITE_SIZES.has(normalizePresetSize(requestedSize))) {
      throw new Error("Seedream 5 lite on Replicate requires --size to be 2K or 3K.");
    }

    if (args.referenceImages.length > 14) {
      throw new Error("Seedream 5 lite on Replicate supports at most 14 reference images per request.");
    }
  }

  if (isWanModel(model)) {
    if (args.aspectRatio) {
      throw new Error("Wan image models on Replicate do not accept --ar. Use --size with a preset like 2K or explicit dimensions like 1920x1080.");
    }

    if (args.referenceImages.length > 9) {
      throw new Error("Wan image models on Replicate support at most 9 reference images per request.");
    }

    const requestedSize = getWanSize(args);
    if (requestedSize) {
      const customSize = parsePixelSize(requestedSize);
      if (!customSize) {
        const normalizedSize = normalizePresetSize(requestedSize);
        const allowedSizes = isWanProModel(model) ? WAN_PRO_SIZES : WAN_SIZES;
        if (!allowedSizes.has(normalizedSize)) {
          throw new Error(
            `Wan image models on Replicate require --size to be one of ${Array.from(allowedSizes).join(", ")} or custom dimensions like 1920x1080.`
          );
        }
      }
    }

    if (args.referenceImages.length > 0 && requestedSize && normalizePresetSize(requestedSize) === "4K") {
      throw new Error("Wan 2.7 Image Pro on Replicate only supports 4K for text-to-image requests without input images.");
    }
  }
}

export function buildInput(
  prompt: string,
  model: string,
  args: CliArgs,
  referenceImages: string[],
): Record<string, unknown> {
  if (isSeedreamModel(model)) {
    return buildSeedreamInput(prompt, model, args, referenceImages);
  }

  if (isWanModel(model)) {
    return buildWanInput(prompt, args, referenceImages);
  }

  return buildNanoBananaInput(prompt, args, referenceImages);
}

async function readImageAsDataUrl(p: string): Promise<string> {
  const buf = await readFile(p);
  const ext = path.extname(p).toLowerCase();
  let mimeType = "image/png";
  if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
  else if (ext === ".bmp") mimeType = "image/bmp";
  else if (ext === ".gif") mimeType = "image/gif";
  else if (ext === ".webp") mimeType = "image/webp";
  return `data:${mimeType};base64,${buf.toString("base64")}`;
}

type PredictionResponse = {
  id: string;
  status: string;
  output: unknown;
  error: string | null;
  urls?: { get?: string };
};

async function createPrediction(
  apiToken: string,
  model: { owner: string; name: string; version: string | null },
  input: Record<string, unknown>,
  sync: boolean
): Promise<PredictionResponse> {
  const baseUrl = getBaseUrl();

  let url: string;
  const body: Record<string, unknown> = { input };

  if (model.version) {
    url = `${baseUrl}/v1/predictions`;
    body.version = model.version;
  } else {
    url = `${baseUrl}/v1/models/${model.owner}/${model.name}/predictions`;
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  };

  if (sync) {
    headers["Prefer"] = `wait=${SYNC_WAIT_SECONDS}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Replicate API error (${res.status}): ${err}`);
  }

  return (await res.json()) as PredictionResponse;
}

async function pollPrediction(apiToken: string, getUrl: string): Promise<PredictionResponse> {
  const start = Date.now();

  while (Date.now() - start < MAX_POLL_MS) {
    const res = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Replicate poll error (${res.status}): ${err}`);
    }

    const prediction = (await res.json()) as PredictionResponse;

    if (prediction.status === "succeeded") return prediction;
    if (prediction.status === "failed" || prediction.status === "canceled") {
      throw new Error(`Replicate prediction ${prediction.status}: ${prediction.error || "unknown error"}`);
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error(`Replicate prediction timed out after ${MAX_POLL_MS / 1000}s`);
}

export function extractOutputUrl(prediction: PredictionResponse): string {
  const output = prediction.output;

  if (typeof output === "string") return output;

  if (Array.isArray(output)) {
    const first = output[0];
    if (typeof first === "string") return first;
  }

  if (output && typeof output === "object" && "url" in output) {
    const url = (output as Record<string, unknown>).url;
    if (typeof url === "string") return url;
  }

  throw new Error(`Unexpected Replicate output format: ${JSON.stringify(output)}`);
}

async function downloadImage(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image from Replicate: ${res.status}`);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

export async function generateImage(
  prompt: string,
  model: string,
  args: CliArgs
): Promise<Uint8Array> {
  const apiToken = getApiToken();
  if (!apiToken) throw new Error("REPLICATE_API_TOKEN is required. Get one at https://replicate.com/account/api-tokens");

  validateArgs(model, args);

  const parsedModel = parseModelId(model);

  const refDataUrls: string[] = [];
  for (const refPath of args.referenceImages) {
    refDataUrls.push(await readImageAsDataUrl(refPath));
  }

  const input = buildInput(prompt, model, args, refDataUrls);

  console.log(`Generating image with Replicate (${model})...`);

  let prediction = await createPrediction(apiToken, parsedModel, input, true);

  if (prediction.status !== "succeeded") {
    if (!prediction.urls?.get) {
      throw new Error("Replicate prediction did not return a poll URL");
    }
    console.log("Waiting for prediction to complete...");
    prediction = await pollPrediction(apiToken, prediction.urls.get);
  }

  console.log("Generation completed.");

  const outputUrl = extractOutputUrl(prediction);
  return downloadImage(outputUrl);
}
