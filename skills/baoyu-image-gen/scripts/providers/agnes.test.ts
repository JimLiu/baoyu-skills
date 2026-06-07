import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test, { type TestContext } from "node:test";

import type { CliArgs } from "../types.ts";
import {
  buildAgnesUrl,
  generateImage,
  extractImageFromResponse,
  getDefaultOutputExtension,
  getDefaultModel,
  parseAspectRatio,
  parseSize,
  resolveSize,
  validateArgs,
  buildTextToImageBody,
  buildImageToImageBody,
} from "./agnes.ts";

function makeArgs(overrides: Partial<CliArgs> = {}): CliArgs {
  return {
    prompt: null,
    promptFiles: [],
    imagePath: null,
    provider: null,
    model: null,
    aspectRatio: null,
    size: null,
    quality: "2k",
    imageSize: null,
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

function useEnv(
  t: TestContext,
  values: Record<string, string | null>,
): void {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(values)) {
    previous.set(key, process.env[key]);
    if (value == null) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  t.after(() => {
    for (const [key, value] of previous.entries()) {
      if (value == null) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });
}

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

test("Agnes default model and endpoint honor env overrides", (t) => {
  useEnv(t, {
    AGNES_IMAGE_MODEL: null,
    AGNES_BASE_URL: null,
  });

  assert.equal(getDefaultModel(), "agnes-image-2.1-flash");
  assert.equal(buildAgnesUrl(), "https://apihub.agnes-ai.com/v1/images/generations");

  process.env.AGNES_IMAGE_MODEL = "agnes-image-2.1-pro";
  process.env.AGNES_BASE_URL = "https://proxy.example.com/v1/";
  assert.equal(getDefaultModel(), "agnes-image-2.1-pro");
  assert.equal(buildAgnesUrl(), "https://proxy.example.com/v1/images/generations");
});

test("Agnes size helpers resolve custom and aspect-ratio-driven sizes", () => {
  assert.deepEqual(parseAspectRatio("16:9"), { width: 16, height: 9 });
  assert.equal(parseAspectRatio("wide"), null);
  assert.deepEqual(parseSize("1024x768"), { width: 1024, height: 768 });
  assert.equal(parseSize("big"), null);

  assert.equal(
    resolveSize(makeArgs({ aspectRatio: "16:9", quality: "2k" })),
    "2048x1152",
  );
  assert.equal(
    resolveSize(makeArgs({ aspectRatio: "4:3", quality: "normal" })),
    "1184x896",
  );
  assert.equal(
    resolveSize(makeArgs({ size: "1024x768" })),
    "1024x768",
  );
});

test("Agnes validates unsupported multi-image requests and explicit sizes", () => {
  assert.throws(
    () => validateArgs("agnes-image-2.1-flash", makeArgs({ n: 2 })),
    /single image per request/,
  );
  assert.throws(
    () => validateArgs("agnes-image-2.1-flash", makeArgs({ size: "1024" })),
    /WxH format/,
  );
});

test("Agnes request bodies use return_base64 for text-to-image and extra_body image for edits", async (t) => {
  const root = await makeTempDir("agnes-provider-");
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  const refPath = path.join(root, "ref.png");
  await fs.writeFile(
    refPath,
    Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX8kAAAAASUVORK5CYII=", "base64"),
  );

  assert.deepEqual(
    buildTextToImageBody("Draw a skyline", "agnes-image-2.1-flash", makeArgs({ aspectRatio: "16:9", quality: "normal" })),
    {
      model: "agnes-image-2.1-flash",
      prompt: "Draw a skyline",
      size: "1360x768",
      return_base64: true,
    },
  );

  const editBody = await buildImageToImageBody(
    "Make the square red",
    "agnes-image-2.1-flash",
    makeArgs({ referenceImages: [refPath], size: "1024x1024" }),
  );

  assert.equal(editBody.model, "agnes-image-2.1-flash");
  assert.equal(editBody.prompt, "Make the square red");
  assert.equal(editBody.size, "1024x1024");
  assert.deepEqual(editBody.extra_body?.response_format, "b64_json");
  assert.equal(Array.isArray(editBody.extra_body?.image), true);
  assert.match(editBody.extra_body?.image?.[0] ?? "", /^data:image\/png;base64,/);
});

test("Agnes URL output switches extension and request format", async (t) => {
  const root = await makeTempDir("agnes-provider-url-");
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  const refPath = path.join(root, "ref.png");
  await fs.writeFile(
    refPath,
    Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX8kAAAAASUVORK5CYII=", "base64"),
  );

  assert.equal(
    getDefaultOutputExtension("agnes-image-2.1-flash", makeArgs({ responseFormat: "url" })),
    ".txt",
  );
  assert.equal(
    getDefaultOutputExtension("agnes-image-2.1-flash", makeArgs()),
    ".png",
  );

  assert.deepEqual(
    buildTextToImageBody("Draw a skyline", "agnes-image-2.1-flash", makeArgs({
      aspectRatio: "16:9",
      quality: "normal",
      responseFormat: "url",
    })),
    {
      model: "agnes-image-2.1-flash",
      prompt: "Draw a skyline",
      size: "1360x768",
      extra_body: {
        response_format: "url",
      },
    },
  );

  const editBody = await buildImageToImageBody(
    "Make the square red",
    "agnes-image-2.1-flash",
    makeArgs({
      referenceImages: [refPath],
      size: "1024x1024",
      responseFormat: "url",
    }),
  );
  assert.deepEqual(editBody.extra_body?.response_format, "url");
});

test("Agnes response extraction supports base64 and URL download flows", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const fromBase64 = await extractImageFromResponse({
    data: [{ b64_json: Buffer.from("hello").toString("base64") }],
  });
  assert.equal(Buffer.from(fromBase64).toString("utf8"), "hello");

  globalThis.fetch = async () =>
    new Response(Uint8Array.from([1, 2, 3]), {
      status: 200,
      headers: { "Content-Type": "image/png" },
    });

  const fromUrl = await extractImageFromResponse({
    data: [{ url: "https://cdn.example.com/agnes.png" }],
  });
  assert.deepEqual([...fromUrl], [1, 2, 3]);

  await assert.rejects(
    () => extractImageFromResponse({ data: [{}] }),
    /No image in response/,
  );
});

test("Agnes URL output returns URL text and API errors include HTTP status", async (t) => {
  useEnv(t, {
    AGNES_API_KEY: "agnes-key",
  });

  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        data: [{ url: "https://cdn.example.com/agnes.png" }],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );

  const urlBytes = await generateImage(
    "Draw a skyline",
    "agnes-image-2.1-flash",
    makeArgs({ responseFormat: "url" }),
  );
  assert.equal(Buffer.from(urlBytes).toString("utf8"), "https://cdn.example.com/agnes.png");

  globalThis.fetch = async () =>
    new Response("denied", {
      status: 401,
      headers: { "Content-Type": "text/plain" },
    });

  await assert.rejects(
    () => generateImage("Draw a skyline", "agnes-image-2.1-flash", makeArgs()),
    /Agnes API error \(401\): denied/,
  );
});
