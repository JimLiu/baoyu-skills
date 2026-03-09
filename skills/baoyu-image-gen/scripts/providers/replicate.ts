import path from "node:path";
import { readFile } from "node:fs/promises";
import type { CliArgs } from "../types";

const DEFAULT_MODEL = "google/nano-banana-pro";
const SYNC_WAIT_SECONDS = 60;
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_MS = 300_000;

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

function parseModelId(model: string): { owner: string; name: string; version: string | null } {
  const [ownerName, version] = model.split(":");
  const parts = ownerName!.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(
      `Invalid Replicate model format: "${model}". Expected "owner/name" or "owner/name:version".`
    );
  }
  return { owner: parts[0], name: parts[1], version: version || null };
}

function buildInput(prompt: string, args: CliArgs, referenceImages: string[]): Record<string, unknown> {
  const input: Record<string, unknown> = { prompt };

  if (args.aspectRatio) {
    input.aspect_ratio = args.aspectRatio;
  } else if (referenceImages.length > 0) {
    // Replicate nano-banana-pro supports matching the original image ratio for edit/localization tasks.
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
    // Official nano-banana-pro schema uses image_input: array
    input.image_input = referenceImages;
  }

  return input;
}

async function readImageAsDataUrl(p: string): Promise<string> {
  const buf = await readFile(p);
  const ext = path.extname(p).toLowerCase();
  let mimeType = "image/png";
  if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
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

function extractOutputUrl(prediction: PredictionResponse): string {
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

  const parsedModel = parseModelId(model);

  const refDataUrls: string[] = [];
  for (const refPath of args.referenceImages) {
    refDataUrls.push(await readImageAsDataUrl(refPath));
  }

  const input = buildInput(prompt, args, refDataUrls);

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
