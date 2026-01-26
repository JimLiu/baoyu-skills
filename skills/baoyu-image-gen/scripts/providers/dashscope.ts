import type { CliArgs } from "../types";

export function getDefaultModel(): string {
  return process.env.DASHSCOPE_IMAGE_MODEL || "z-image-turbo";
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

function getSizeFromAspectRatio(ar: string | null, quality: CliArgs["quality"]): string {
  const baseSize = quality === "2k" ? 1440 : 1024;

  if (!ar) return `${baseSize}*${baseSize}`;

  const parsed = parseAspectRatio(ar);
  if (!parsed) return `${baseSize}*${baseSize}`;

  const ratio = parsed.width / parsed.height;

  if (Math.abs(ratio - 1) < 0.1) {
    return `${baseSize}*${baseSize}`;
  }

  if (ratio > 1) {
    const w = Math.round(baseSize * ratio);
    return `${w}*${baseSize}`;
  }

  const h = Math.round(baseSize / ratio);
  return `${baseSize}*${h}`;
}

function normalizeSize(size: string): string {
  return size.replace("x", "*");
}

export async function generateImage(
  prompt: string,
  model: string,
  args: CliArgs
): Promise<Uint8Array> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("DASHSCOPE_API_KEY is required");

  if (args.referenceImages.length > 0) {
    console.error("Warning: Reference images not yet supported with DashScope, ignoring.");
  }

  const size = args.size ? normalizeSize(args.size) : getSizeFromAspectRatio(args.aspectRatio, args.quality);
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

  console.log(`Generating image with DashScope (${model})...`, { size });

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
