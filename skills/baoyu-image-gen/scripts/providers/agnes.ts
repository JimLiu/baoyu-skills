import path from "node:path";
import { readFile } from "node:fs/promises";
import type { CliArgs, Quality, ResponseFormat } from "../types";

type AgnesResponse = {
  data?: Array<{ url?: string | null; b64_json?: string | null }>;
};

type AgnesTextToImageBody = {
  model: string;
  prompt: string;
  size: string;
  return_base64?: true;
  extra_body?: {
    response_format: "url";
  };
};

type AgnesImageToImageBody = {
  model: string;
  prompt: string;
  size: string;
  extra_body: {
    image: string[];
    response_format: "b64_json" | "url";
  };
};

const DEFAULT_MODEL = "agnes-image-2.1-flash";
const DEFAULT_BASE_URL = "https://apihub.agnes-ai.com/v1";
const SIZE_STEP = 16;

const TARGET_PIXELS: Record<Quality, number> = {
  normal: 1024 * 1024,
  "2k": 1536 * 1536,
};

export function getDefaultModel(): string {
  return process.env.AGNES_IMAGE_MODEL || DEFAULT_MODEL;
}

function getApiKey(): string {
  const key = process.env.AGNES_API_KEY;
  if (!key) {
    throw new Error("AGNES_API_KEY is required. Get it from https://agnes-ai.com/");
  }
  return key;
}

export function buildAgnesUrl(): string {
  const base = (process.env.AGNES_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/g, "");
  if (base.endsWith("/images/generations")) return base;
  if (base.endsWith("/v1")) return `${base}/images/generations`;
  return `${base}/v1/images/generations`;
}

export function parseAspectRatio(ar: string): { width: number; height: number } | null {
  const match = ar.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
  if (!match) return null;

  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  return { width, height };
}

export function parseSize(size: string): { width: number; height: number } | null {
  const match = size.trim().match(/^(\d+)\s*[xX]\s*(\d+)$/);
  if (!match) return null;

  const width = parseInt(match[1]!, 10);
  const height = parseInt(match[2]!, 10);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  return { width, height };
}

function roundToStep(value: number): number {
  return Math.max(SIZE_STEP, Math.round(value / SIZE_STEP) * SIZE_STEP);
}

function formatSize(width: number, height: number): string {
  return `${width}x${height}`;
}

function normalizeQuality(quality: CliArgs["quality"]): Quality {
  return quality === "normal" ? "normal" : "2k";
}

function resolveResponseFormat(responseFormat: ResponseFormat | null): "b64_json" | "url" {
  return responseFormat === "url" ? "url" : "b64_json";
}

export function resolveSize(args: Pick<CliArgs, "size" | "aspectRatio" | "quality">): string {
  if (args.size) {
    const parsed = parseSize(args.size);
    if (!parsed) {
      throw new Error("Agnes --size must be in WxH format, for example 1024x768.");
    }
    return formatSize(parsed.width, parsed.height);
  }

  const quality = normalizeQuality(args.quality);
  if (!args.aspectRatio) {
    const edge = quality === "normal" ? 1024 : 1536;
    return formatSize(edge, edge);
  }

  const parsedRatio = parseAspectRatio(args.aspectRatio);
  if (!parsedRatio) {
    throw new Error(`Invalid Agnes aspect ratio: ${args.aspectRatio}`);
  }

  const ratio = parsedRatio.width / parsedRatio.height;
  const targetPixels = TARGET_PIXELS[quality];
  const width = roundToStep(Math.sqrt(targetPixels * ratio));
  const height = roundToStep(width / ratio);
  return formatSize(width, height);
}

function getReferenceMime(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/png";
}

async function loadReferenceImage(refPath: string): Promise<string> {
  if (/^https?:\/\//i.test(refPath)) {
    return refPath;
  }

  const fullPath = path.resolve(refPath);
  const bytes = await readFile(fullPath);
  return `data:${getReferenceMime(fullPath)};base64,${bytes.toString("base64")}`;
}

export function validateArgs(_model: string, args: CliArgs): void {
  if (args.n > 1) {
    throw new Error("Agnes image generation currently supports only a single image per request in baoyu-image-gen.");
  }

  if (args.size && !parseSize(args.size)) {
    throw new Error("Agnes --size must be in WxH format, for example 1024x768.");
  }
}

export function getDefaultOutputExtension(_model: string, args: CliArgs): ".png" | ".txt" {
  return args.responseFormat === "url" ? ".txt" : ".png";
}

export function buildTextToImageBody(
  prompt: string,
  model: string,
  args: Pick<CliArgs, "size" | "aspectRatio" | "quality" | "responseFormat">,
): AgnesTextToImageBody {
  if (args.responseFormat === "url") {
    return {
      model,
      prompt,
      size: resolveSize(args),
      extra_body: {
        response_format: "url",
      },
    };
  }

  return {
    model,
    prompt,
    size: resolveSize(args),
    return_base64: true,
  };
}

export async function buildImageToImageBody(
  prompt: string,
  model: string,
  args: Pick<CliArgs, "size" | "aspectRatio" | "quality" | "referenceImages" | "responseFormat">,
): Promise<AgnesImageToImageBody> {
  const images = await Promise.all(args.referenceImages.map((refPath) => loadReferenceImage(refPath)));
  return {
    model,
    prompt,
    size: resolveSize(args),
    extra_body: {
      image: images,
      response_format: resolveResponseFormat(args.responseFormat),
    },
  };
}

export async function extractImageFromResponse(result: AgnesResponse): Promise<Uint8Array> {
  const image = result.data?.[0];
  if (image?.b64_json) {
    return Uint8Array.from(Buffer.from(image.b64_json, "base64"));
  }

  if (image?.url) {
    const response = await fetch(image.url);
    if (!response.ok) {
      throw new Error(`Failed to download Agnes image: ${response.status}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }

  throw new Error("No image in response");
}

export async function generateImage(
  prompt: string,
  model: string,
  args: CliArgs,
): Promise<Uint8Array> {
  validateArgs(model, args);

  const body = args.referenceImages.length > 0
    ? await buildImageToImageBody(prompt, model, args)
    : buildTextToImageBody(prompt, model, args);

  const response = await fetch(buildAgnesUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Agnes API error (${response.status}): ${errorText}`);
  }

  const result = (await response.json()) as AgnesResponse;
  if (args.responseFormat === "url") {
    const url = result.data?.[0]?.url;
    if (!url) {
      throw new Error("No URL in response");
    }
    return new Uint8Array(Buffer.from(url, "utf8"));
  }

  return extractImageFromResponse(result);
}
