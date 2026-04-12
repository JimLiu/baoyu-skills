import assert from "node:assert/strict";
import test from "node:test";

import type { CliArgs } from "../types.ts";
import {
  buildInput,
  extractOutputUrl,
  generateImage,
  getDefaultOutputExtension,
  parseModelId,
  validateArgs,
} from "./replicate.ts";

function makeArgs(overrides: Partial<CliArgs> = {}): CliArgs {
  return {
    prompt: null,
    promptFiles: [],
    imagePath: null,
    provider: null,
    model: null,
    aspectRatio: null,
    size: null,
    quality: null,
    imageSize: null,
    referenceImages: [],
    n: 1,
    batchFile: null,
    jobs: null,
    json: false,
    help: false,
    ...overrides,
  };
}

test("Replicate model parsing accepts official formats and rejects malformed ones", () => {
  assert.deepEqual(parseModelId("google/nano-banana-pro"), {
    owner: "google",
    name: "nano-banana-pro",
    version: null,
  });
  assert.deepEqual(parseModelId("owner/model:abc123"), {
    owner: "owner",
    name: "model",
    version: "abc123",
  });

  assert.throws(
    () => parseModelId("just-a-model-name"),
    /Invalid Replicate model format/,
  );
});

test("Replicate input builder keeps nano-banana mapping for compatible models", () => {
  assert.deepEqual(
    buildInput(
      "A robot painter",
      "google/nano-banana-2",
      makeArgs({
        aspectRatio: "16:9",
        quality: "2k",
      }),
      ["data:image/png;base64,AAAA"],
    ),
    {
      prompt: "A robot painter",
      aspect_ratio: "16:9",
      resolution: "2K",
      output_format: "png",
      image_input: ["data:image/png;base64,AAAA"],
    },
  );

  assert.deepEqual(
    buildInput("A robot painter", "google/nano-banana-pro", makeArgs({ quality: "normal" }), ["ref"]),
    {
      prompt: "A robot painter",
      aspect_ratio: "match_input_image",
      resolution: "1K",
      output_format: "png",
      image_input: ["ref"],
    },
  );
});

test("Replicate input builder maps Seedream models to their native schema", () => {
  assert.deepEqual(
    buildInput(
      "A robot painter",
      "bytedance/seedream-4.5",
      makeArgs({
        size: "1536x1024",
        aspectRatio: "16:9",
      }),
      ["data:image/png;base64,AAAA"],
    ),
    {
      prompt: "A robot painter",
      size: "custom",
      width: 1536,
      height: 1024,
      image_input: ["data:image/png;base64,AAAA"],
    },
  );

  assert.deepEqual(
    buildInput(
      "A robot painter",
      "bytedance/seedream-5-lite",
      makeArgs({
        size: "3K",
        aspectRatio: "4:3",
      }),
      [],
    ),
    {
      prompt: "A robot painter",
      size: "3K",
      output_format: "png",
      aspect_ratio: "4:3",
    },
  );
});

test("Replicate input builder maps Wan models to their native schema", () => {
  assert.deepEqual(
    buildInput(
      "A robot painter",
      "wan-video/wan-2.7-image-pro",
      makeArgs({
        quality: "2k",
      }),
      ["data:image/png;base64,AAAA"],
    ),
    {
      prompt: "A robot painter",
      size: "2K",
      images: ["data:image/png;base64,AAAA"],
      thinking_mode: false,
    },
  );

  assert.deepEqual(
    buildInput(
      "A robot painter",
      "wan-video/wan-2.7-image",
      makeArgs({
        size: "1536x1024",
      }),
      [],
    ),
    {
      prompt: "A robot painter",
      size: "1536*1024",
      thinking_mode: true,
    },
  );
});

test("Replicate validation rejects unsupported schema combinations before the API call", () => {
  assert.throws(
    () => validateArgs("google/nano-banana-2", makeArgs({ n: 2 })),
    /Replicate --n is not supported yet/,
  );

  assert.throws(
    () => validateArgs("bytedance/seedream-4.5", makeArgs({ size: "8x8" })),
    /must keep width and height between 1024 and 4096/,
  );

  assert.throws(
    () => validateArgs("bytedance/seedream-5-lite", makeArgs({ size: "4K" })),
    /requires --size to be 2K or 3K/,
  );

  assert.throws(
    () => validateArgs("wan-video/wan-2.7-image-pro", makeArgs({ aspectRatio: "16:9" })),
    /do not accept --ar/,
  );

  assert.throws(
    () => validateArgs("wan-video/wan-2.7-image", makeArgs({ referenceImages: Array.from({ length: 10 }, () => "ref.png") })),
    /at most 9 reference images/,
  );

  assert.throws(
    () => validateArgs("wan-video/wan-2.7-image-pro", makeArgs({ size: "4K", referenceImages: ["ref.png"] })),
    /only supports 4K for text-to-image requests/,
  );

  assert.doesNotThrow(
    () => validateArgs("bytedance/seedream-4.5", makeArgs({ size: "1536x1024" })),
  );

  assert.doesNotThrow(
    () => validateArgs("wan-video/wan-2.7-image", makeArgs({ size: "1920x1080" })),
  );
});

test("Replicate output extraction supports string, array, and object URLs", () => {
  assert.equal(
    extractOutputUrl({ output: "https://example.com/a.png" } as never),
    "https://example.com/a.png",
  );
  assert.equal(
    extractOutputUrl({ output: ["https://example.com/b.png"] } as never),
    "https://example.com/b.png",
  );
  assert.equal(
    extractOutputUrl({ output: { url: "https://example.com/c.png" } } as never),
    "https://example.com/c.png",
  );

  assert.throws(
    () => extractOutputUrl({ output: { invalid: true } } as never),
    /Unexpected Replicate output format/,
  );
});

test("Replicate default output extension matches model family behavior", () => {
  assert.equal(getDefaultOutputExtension("bytedance/seedream-4.5"), ".jpg");
  assert.equal(getDefaultOutputExtension("bytedance/seedream-5-lite"), ".png");
  assert.equal(getDefaultOutputExtension("google/nano-banana-2"), ".png");
});

test("Replicate generateImage validates arguments before making API requests", async () => {
  const previousToken = process.env.REPLICATE_API_TOKEN;
  process.env.REPLICATE_API_TOKEN = "test-token";

  try {
    await assert.rejects(
      generateImage(
        "A robot painter",
        "wan-video/wan-2.7-image-pro",
        makeArgs({ aspectRatio: "16:9" }),
      ),
      /do not accept --ar/,
    );
  } finally {
    if (previousToken === undefined) {
      delete process.env.REPLICATE_API_TOKEN;
    } else {
      process.env.REPLICATE_API_TOKEN = previousToken;
    }
  }
});
