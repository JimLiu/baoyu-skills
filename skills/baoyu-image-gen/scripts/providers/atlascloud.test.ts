import assert from "node:assert/strict";
import test from "node:test";

import type { CliArgs } from "../types.ts";
import {
  buildRequestBody,
  inferAspectRatioFromSize,
  resolveRequestModel,
  resolveResolution,
  validateArgs,
} from "./atlascloud.ts";

function makeArgs(overrides: Partial<CliArgs> = {}): CliArgs {
  return {
    prompt: null,
    promptFiles: [],
    imagePath: null,
    provider: null,
    model: null,
    aspectRatio: null,
    aspectRatioSource: null,
    size: null,
    quality: null,
    imageSize: null,
    imageSizeSource: null,
    imageApiDialect: null,
    responseFormat: null,
    referenceImages: [],
    n: 1,
    batchFile: null,
    jobs: null,
    json: false,
    help: false,
    ...overrides,
  };
}

test("Atlas Cloud maps quality, imageSize, and explicit size to schema resolution values", () => {
  assert.equal(resolveResolution(makeArgs({ quality: "normal" })), "1k");
  assert.equal(resolveResolution(makeArgs({ quality: "2k" })), "2k");
  assert.equal(resolveResolution(makeArgs({ imageSize: "4K" })), "4k");
  assert.equal(resolveResolution(makeArgs({ size: "1024x1024" })), "1k");
  assert.equal(resolveResolution(makeArgs({ size: "2048x1152" })), "2k");
  assert.equal(resolveResolution(makeArgs({ size: "3840x2160" })), "4k");
});

test("Atlas Cloud infers supported aspect ratios from explicit sizes", () => {
  assert.equal(inferAspectRatioFromSize("2048x1152"), "16:9");
  assert.equal(inferAspectRatioFromSize("1024*1024"), "1:1");
  assert.equal(inferAspectRatioFromSize("1234x999"), null);
  assert.equal(inferAspectRatioFromSize("bad"), null);
});

test("Atlas Cloud switches default generation model to edit model when refs are provided", () => {
  assert.equal(
    resolveRequestModel(
      "google/nano-banana-2/text-to-image",
      makeArgs({ referenceImages: ["ref.png"] }),
    ),
    "google/nano-banana-2/edit",
  );

  assert.equal(
    resolveRequestModel(
      "google/nano-banana-2/text-to-image",
      makeArgs({ referenceImages: ["ref.png"], model: "google/nano-banana-2/text-to-image" }),
    ),
    "google/nano-banana-2/edit",
  );
});

test("Atlas Cloud request body follows live Nano Banana 2 schema fields", () => {
  assert.deepEqual(
    buildRequestBody(
      "A poster",
      "google/nano-banana-2/text-to-image",
      makeArgs({ aspectRatio: "16:9", quality: "2k" }),
      [],
    ),
    {
      model: "google/nano-banana-2/text-to-image",
      prompt: "A poster",
      resolution: "2k",
      output_format: "png",
      aspect_ratio: "16:9",
    },
  );

  assert.deepEqual(
    buildRequestBody(
      "Make it green",
      "google/nano-banana-2/text-to-image",
      makeArgs({ referenceImages: ["ref.png"], imageSize: "1K", responseFormat: "url" }),
      ["https://example.com/ref.png"],
    ),
    {
      model: "google/nano-banana-2/edit",
      prompt: "Make it green",
      resolution: "1k",
      output_format: "default",
      images: ["https://example.com/ref.png"],
    },
  );
});

test("Atlas Cloud validates local unsupported combinations", () => {
  assert.throws(
    () => validateArgs("google/nano-banana-2/text-to-image", makeArgs({ n: 2 })),
    /exactly one image/,
  );
  assert.throws(
    () =>
      validateArgs(
        "custom/model",
        makeArgs({ referenceImages: ["a.png"] }),
      ),
    /not configured for reference-image editing/,
  );
  assert.throws(
    () =>
      validateArgs(
        "google/nano-banana-2/text-to-image",
        makeArgs({ referenceImages: new Array(15).fill("a.png") }),
      ),
    /at most 14/,
  );
  assert.throws(
    () =>
      validateArgs(
        "google/nano-banana-2/text-to-image",
        makeArgs({ aspectRatio: "1:4" }),
      ),
    /does not support aspect ratio/,
  );
});
