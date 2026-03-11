import type { CliArgs } from "../types";

export function getDefaultModel(): string {
  return process.env.DASHSCOPE_IMAGE_MODEL || "qwen-image-2.0-pro";
}

function getApiKey(): string | null {
  return process.env.DASHSCOPE_API_KEY || null;
}

function getBaseUrl(): string {
  const base = process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com";
  return base.replace(/\/+$/g, "");
}

function parseAspectRatio(ar: string): { width: number; height: number } | null {
  const match = ar.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const w = parseFloat(match[1]!);
  const h = parseFloat(match[2]!);
  if (w <= 0 || h <= 0) return null;
  return { width: w, height: h };
}

const STANDARD_SIZES: [number, number][] = [
  [1024, 1024],
  [1280, 720],
  [720, 1280],
  [1024, 768],
  [768, 1024],
  [1536, 1024],
  [1024, 1536],
  [1536, 864],
  [864, 1536],
];

const STANDARD_SIZES_2K: [number, number][] = [
  [1536, 1536],
  [2048, 1152],
  [1152, 2048],
  [1536, 1024],
  [1024, 1536],
  [1536, 864],
  [864, 1536],
  [2048, 2048],
];

const QWEN_SIZES: [number, number][] = [
  [1664, 928],
  [1472, 1104],
  [1328, 1328],
  [1104, 1472],
  [928, 1664],
];

function getSizeFromAspectRatio(ar: string | null, quality: CliArgs["quality"]): string {
  const is2k = quality === "2k";
  const defaultSize = is2k ? "1536*1536" : "1024*1024";

  if (!ar) return defaultSize;

  const parsed = parseAspectRatio(ar);
  if (!parsed) return defaultSize;

  const targetRatio = parsed.width / parsed.height;
  const sizes = is2k ? STANDARD_SIZES_2K : STANDARD_SIZES;

  let best = defaultSize;
  let bestDiff = Infinity;

  for (const [w, h] of sizes) {
    const diff = Math.abs(w / h - targetRatio);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = `${w}*${h}`;
    }
  }

  return best;
}

function normalizeSize(size: string): string {
  return size.replace("x", "*");
}

function isQwenModel(model: string): boolean {
  return model.startsWith("qwen-image-");
}

function getQwenSizeFromAspectRatio(ar: string | null): string {
  const defaultSize = "1328*1328";

  if (!ar) return defaultSize;

  const parsed = parseAspectRatio(ar);
  if (!parsed) return defaultSize;

  const targetRatio = parsed.width / parsed.height;

  let best = defaultSize;
  let bestDiff = Infinity;

  for (const [w, h] of QWEN_SIZES) {
    const diff = Math.abs(w / h - targetRatio);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = `${w}*${h}`;
    }
  }

  return best;
}

async function generateWithQwenApi(
  prompt: string,
  model: string,
  size: string,
  apiKey: string
): Promise<Uint8Array> {
  const url = `${getBaseUrl()}/api/v1/services/aigc/multimodal-generation/generation`;

  const body = {
    model,
    input: {
      messages: [
        {
          role: "user",
          content: [{ text: prompt }],
        },
      ],
    },
    parameters: {
      prompt_extend: false,
      watermark: false,
      size,
    },
  };

  console.log(`Generating image with DashScope Qwen API (${model})...`, { size });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DashScope API error (${res.status}): ${err}`);
  }

  const result = await res.json() as {
    output?: {
      result_image?: string;
      choices?: Array<{
        message?: {
          content?: Array<{ image?: string }>;
        };
      }>;
    };
  };

  let imageData: string | null = null;

  if (result.output?.result_image) {
    imageData = result.output.result_image;
  } else if (result.output?.choices?.[0]?.message?.content) {
    const content = result.output.choices[0].message.content;
    for (const item of content) {
      if (item.image) {
        imageData = item.image;
        break;
      }
    }
  }

  if (!imageData) {
    console.error("Response:", JSON.stringify(result, null, 2));
    throw new Error("No image in response");
  }

  if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
    const imgRes = await fetch(imageData);
    if (!imgRes.ok) throw new Error("Failed to download image");
    const buf = await imgRes.arrayBuffer();
    return new Uint8Array(buf);
  }

  return Uint8Array.from(Buffer.from(imageData, "base64"));
}

async function generateWithLegacyApi(
  prompt: string,
  model: string,
  size: string,
  apiKey: string
): Promise<Uint8Array> {
  const url = `${getBaseUrl()}/api/v1/services/aigc/multimodal-generation/generation`;

  const body = {
    model,
    input: {
      messages: [
        {
          role: "user",
          content: [{ text: prompt }],
        },
      ],
    },
    parameters: {
      prompt_extend: false,
      size,
    },
  };

  console.log(`Generating image with DashScope Legacy API (${model})...`, { size });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DashScope API error (${res.status}): ${err}`);
  }

  const result = await res.json() as {
    output?: {
      result_image?: string;
      choices?: Array<{
        message?: {
          content?: Array<{ image?: string }>;
        };
      }>;
    };
  };

  let imageData: string | null = null;

  if (result.output?.result_image) {
    imageData = result.output.result_image;
  } else if (result.output?.choices?.[0]?.message?.content) {
    const content = result.output.choices[0].message.content;
    for (const item of content) {
      if (item.image) {
        imageData = item.image;
        break;
      }
    }
  }

  if (!imageData) {
    console.error("Response:", JSON.stringify(result, null, 2));
    throw new Error("No image in response");
  }

  if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
    const imgRes = await fetch(imageData);
    if (!imgRes.ok) throw new Error("Failed to download image");
    const buf = await imgRes.arrayBuffer();
    return new Uint8Array(buf);
  }

  return Uint8Array.from(Buffer.from(imageData, "base64"));
}

export async function generateImage(
  prompt: string,
  model: string,
  args: CliArgs
): Promise<Uint8Array> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("DASHSCOPE_API_KEY is required");

  if (args.referenceImages.length > 0) {
    throw new Error(
      "Reference images are not supported with DashScope provider in baoyu-image-gen. Use --provider google with a Gemini multimodal model."
    );
  }

  if (isQwenModel(model)) {
    const size = args.size ? normalizeSize(args.size) : getQwenSizeFromAspectRatio(args.aspectRatio);
    return generateWithQwenApi(prompt, model, size, apiKey);
  } else {
    const size = args.size ? normalizeSize(args.size) : getSizeFromAspectRatio(args.aspectRatio, args.quality);
    return generateWithLegacyApi(prompt, model, size, apiKey);
  }
}
