import path from "node:path";
import { readFile } from "node:fs/promises";
import type { CliArgs } from "../types";

const DEFAULT_GENERATION_MODEL = "google/nano-banana-2/text-to-image";
const DEFAULT_EDIT_MODEL = "google/nano-banana-2/edit";
const DEFAULT_BASE_URL = "https://api.atlascloud.ai/api/v1";
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_MS = 300_000;
const SUPPORTED_ASPECT_RATIOS = new Set([
  "1:1",
  "3:2",
  "2:3",
  "3:4",
  "4:3",
  "4:5",
  "5:4",
  "9:16",
  "16:9",
  "21:9",
]);

type AtlasPrediction = {
  id?: string;
  prediction_id?: string;
  status?: string;
  outputs?: unknown;
  output?: unknown;
  result?: unknown;
  images?: unknown;
  urls?: unknown;
  error?: unknown;
};

type AtlasResponse = {
  code?: number;
  msg?: string;
  message?: string;
  data?: AtlasPrediction;
};

type AtlasUploadResponse = {
  data?: {
    download_url?: string;
    url?: string;
  };
  download_url?: string;
  url?: string;
};

export function getDefaultModel(): string {
  return process.env.ATLASCLOUD_IMAGE_MODEL || process.env.ATLAS_CLOUD_IMAGE_MODEL || DEFAULT_GENERATION_MODEL;
}

export function getDefaultOutputExtension(_model: string, args: CliArgs): string {
  return args.responseFormat === "url" ? ".txt" : ".png";
}

function getApiKey(): string | null {
  return process.env.ATLASCLOUD_API_KEY || process.env.ATLAS_CLOUD_API_KEY || null;
}

function getBaseUrl(): string {
  const base =
    process.env.ATLASCLOUD_MEDIA_BASE_URL ||
    process.env.ATLAS_CLOUD_MEDIA_BASE_URL ||
    DEFAULT_BASE_URL;
  return base.replace(/\/+$/g, "");
}

function isRemoteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/png";
}

function extractPrediction(payload: AtlasResponse | AtlasPrediction): AtlasPrediction {
  return "data" in payload && payload.data ? payload.data : payload;
}

function getPredictionId(payload: AtlasPrediction): string {
  const id = payload.id || payload.prediction_id;
  if (!id) {
    throw new Error(`Atlas Cloud response did not include a prediction id: ${JSON.stringify(payload)}`);
  }
  return id;
}

function extractOutputValue(prediction: AtlasPrediction): unknown {
  for (const key of ["outputs", "output", "result", "images", "urls"] as const) {
    const value = prediction[key];
    if (Array.isArray(value)) return value[0];
    if (value) return value;
  }
  throw new Error(`Atlas Cloud prediction completed without image output: ${JSON.stringify(prediction)}`);
}

function getOutputUrl(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["url", "download_url", "image_url"] as const) {
      const nested = record[key];
      if (typeof nested === "string") return nested;
    }
  }
  throw new Error(`Unexpected Atlas Cloud output format: ${JSON.stringify(value)}`);
}

function decodeDataUrl(value: string): Uint8Array | null {
  const match = value.match(/^data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  return Uint8Array.from(Buffer.from(match[1]!, "base64"));
}

async function downloadImage(value: string): Promise<Uint8Array> {
  const inline = decodeDataUrl(value);
  if (inline) return inline;

  const response = await fetch(value);
  if (!response.ok) {
    throw new Error(`Failed to download Atlas Cloud image: ${response.status}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

export function resolveResolution(args: CliArgs): "1k" | "2k" | "4k" {
  if (args.imageSize) return args.imageSize.toLowerCase() as "1k" | "2k" | "4k";

  if (args.size) {
    const match = args.size.match(/^(\d+)\s*[xX*]\s*(\d+)$/);
    if (!match) {
      throw new Error("Atlas Cloud --size must be in WxH format when provided, for example 2048x1152.");
    }
    const longestEdge = Math.max(parseInt(match[1]!, 10), parseInt(match[2]!, 10));
    if (longestEdge <= 1024) return "1k";
    if (longestEdge <= 2048) return "2k";
    return "4k";
  }

  return args.quality === "normal" ? "1k" : "2k";
}

export function inferAspectRatioFromSize(size: string | null): string | null {
  if (!size) return null;
  const match = size.match(/^(\d+)\s*[xX*]\s*(\d+)$/);
  if (!match) return null;
  const width = parseInt(match[1]!, 10);
  const height = parseInt(match[2]!, 10);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  const divisor = gcd(width, height);
  const aspectRatio = `${width / divisor}:${height / divisor}`;
  return SUPPORTED_ASPECT_RATIOS.has(aspectRatio) ? aspectRatio : null;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x || 1;
}

function resolveAspectRatio(args: CliArgs): string | null {
  return args.aspectRatio || inferAspectRatioFromSize(args.size);
}

export function validateArgs(model: string, args: CliArgs): void {
  if (args.n !== 1) {
    throw new Error("Atlas Cloud image generation currently supports saving exactly one image per request. Remove --n or use --n 1.");
  }

  if (args.referenceImages.length > 14) {
    throw new Error("Atlas Cloud Nano Banana 2 edit accepts at most 14 reference images.");
  }

  if (args.referenceImages.length > 0 && model !== DEFAULT_EDIT_MODEL && model !== DEFAULT_GENERATION_MODEL) {
    throw new Error(`Atlas Cloud model ${model} is not configured for reference-image editing in baoyu-image-gen. Use ${DEFAULT_EDIT_MODEL}.`);
  }

  if (args.aspectRatio && !SUPPORTED_ASPECT_RATIOS.has(args.aspectRatio)) {
    throw new Error(
      `Atlas Cloud does not support aspect ratio ${args.aspectRatio}. Supported values: ${Array.from(SUPPORTED_ASPECT_RATIOS).join(", ")}`
    );
  }

  resolveResolution(args);
}

export function resolveRequestModel(model: string, args: CliArgs): string {
  if (args.referenceImages.length > 0 && model === DEFAULT_GENERATION_MODEL) {
    return DEFAULT_EDIT_MODEL;
  }
  return model;
}

export function buildRequestBody(
  prompt: string,
  model: string,
  args: CliArgs,
  images: string[],
): Record<string, unknown> {
  validateArgs(model, args);
  const requestModel = resolveRequestModel(model, args);
  const body: Record<string, unknown> = {
    model: requestModel,
    prompt,
    resolution: resolveResolution(args),
    output_format: args.responseFormat === "url" ? "default" : "png",
  };

  const aspectRatio = resolveAspectRatio(args);
  if (aspectRatio) body.aspect_ratio = aspectRatio;
  if (images.length > 0) body.images = images;

  return body;
}

async function uploadImage(apiKey: string, refPath: string): Promise<string> {
  if (isRemoteUrl(refPath)) return refPath;

  const bytes = await readFile(refPath);
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: getMimeType(refPath) }), path.basename(refPath));

  const response = await fetch(`${getBaseUrl()}/model/uploadMedia`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Atlas Cloud upload error (${response.status}): ${errorText}`);
  }

  const result = (await response.json()) as AtlasUploadResponse;
  const mediaUrl = result.data?.download_url || result.data?.url || result.download_url || result.url;
  if (!mediaUrl) {
    throw new Error(`Atlas Cloud upload response did not include a media URL: ${JSON.stringify(result)}`);
  }
  return mediaUrl;
}

async function createPrediction(apiKey: string, body: Record<string, unknown>): Promise<AtlasPrediction> {
  const response = await fetch(`${getBaseUrl()}/model/generateImage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Atlas Cloud API error (${response.status}): ${errorText}`);
  }

  return extractPrediction((await response.json()) as AtlasResponse);
}

async function pollPrediction(apiKey: string, predictionId: string): Promise<AtlasPrediction> {
  const start = Date.now();
  while (Date.now() - start < MAX_POLL_MS) {
    const response = await fetch(`${getBaseUrl()}/model/prediction/${predictionId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Atlas Cloud poll error (${response.status}): ${errorText}`);
    }

    const prediction = extractPrediction((await response.json()) as AtlasResponse);
    const status = String(prediction.status || "").toLowerCase();
    if (status === "completed" || status === "succeeded" || status === "success") {
      return prediction;
    }
    if (status === "failed" || status === "error" || status === "canceled" || status === "cancelled") {
      throw new Error(`Atlas Cloud prediction ${status}: ${JSON.stringify(prediction.error ?? prediction)}`);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(`Atlas Cloud prediction timed out after ${MAX_POLL_MS / 1000}s`);
}

export async function generateImage(
  prompt: string,
  model: string,
  args: CliArgs,
): Promise<Uint8Array> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("ATLASCLOUD_API_KEY or ATLAS_CLOUD_API_KEY is required. Get one from https://www.atlascloud.ai/console/api-keys");
  }

  const images: string[] = [];
  for (const refPath of args.referenceImages) {
    images.push(await uploadImage(apiKey, refPath));
  }

  const body = buildRequestBody(prompt, model, args, images);
  console.log(`Generating image with Atlas Cloud (${body.model})...`);
  let prediction = await createPrediction(apiKey, body);
  const predictionId = getPredictionId(prediction);

  const status = String(prediction.status || "").toLowerCase();
  if (status !== "completed" && status !== "succeeded" && status !== "success") {
    console.log("Waiting for Atlas Cloud prediction to complete...");
    prediction = await pollPrediction(apiKey, predictionId);
  }

  const outputUrl = getOutputUrl(extractOutputValue(prediction));
  if (args.responseFormat === "url") {
    return new Uint8Array(Buffer.from(outputUrl, "utf-8"));
  }
  return downloadImage(outputUrl);
}
