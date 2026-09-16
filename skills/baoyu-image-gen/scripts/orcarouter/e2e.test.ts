import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import http from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MAIN = path.resolve(HERE, "..", "main.ts");
const REPO_ROOT = path.resolve(HERE, "..", "..", "..", "..");

const FAKE_KEY = "sk-orca-fake-e2e-key";

const IMAGE_CATALOG = {
  object: "list",
  data: [
    {
      id: "google/gemini-3.1-flash-image-preview",
      object: "model",
      supported_endpoint_types: ["gemini"],
      architecture: { input_modalities: ["text", "image"], output_modalities: ["image", "text"] },
    },
    {
      id: "openai/gpt-image-1.5",
      object: "model",
      supported_endpoint_types: ["image-generation"],
      architecture: { input_modalities: ["text", "image"] },
    },
    {
      id: "deepseek/deepseek-v4-pro",
      object: "model",
      supported_endpoint_types: ["openai", "openai-response"],
      architecture: { input_modalities: ["text"], output_modalities: ["text"] },
    },
  ],
};

type Recorded = { url: string; authorization: string | null; body: unknown };

type FakeApi = {
  baseUrl: string;
  recorded: Recorded[];
  close: () => Promise<void>;
};

async function startFakeApi(chatResponse: unknown, catalogStatus = 200): Promise<FakeApi> {
  const recorded: Recorded[] = [];

  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      recorded.push({
        url: req.url ?? "",
        authorization: (req.headers.authorization as string | undefined) ?? null,
        body: raw ? JSON.parse(raw) : null,
      });

      if ((req.url ?? "").includes("/models")) {
        if (catalogStatus !== 200) {
          res.writeHead(catalogStatus, { "Content-Type": "application/json", Connection: "close" });
          res.end(JSON.stringify({ error: "boom" }));
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json", Connection: "close" });
        res.end(JSON.stringify(IMAGE_CATALOG));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json", Connection: "close" });
      res.end(JSON.stringify(chatResponse));
    });
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as { port: number }).port;

  return {
    baseUrl: `http://127.0.0.1:${port}/v1`,
    recorded,
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}

function imagePayload(contents: string): unknown {
  return {
    choices: [
      {
        finish_reason: "stop",
        message: {
          images: [{ image_url: { url: `data:image/png;base64,${Buffer.from(contents).toString("base64")}` } }],
        },
      },
    ],
  };
}

type RunResult = { code: number | null; stdout: string; stderr: string };

async function runCli(args: string[], env: Record<string, string>): Promise<RunResult> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["--import", "tsx", MAIN, ...args], {
      cwd: REPO_ROOT,
      env: {
        PATH: process.env.PATH,
        HOME: process.env.HOME,
        ...env,
      },
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += String(chunk)));
    child.stderr.on("data", (chunk) => (stderr += String(chunk)));
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

test("the real CLI generates an image through the implemented OrcaRouter provider path", async () => {
  const api = await startFakeApi(imagePayload("generated-bytes"));
  const dir = await mkdtemp(path.join(tmpdir(), "orca-e2e-"));
  const out = path.join(dir, "out.png");

  try {
    const result = await runCli(
      ["--provider", "orcarouter", "--model", "google/gemini-3.1-flash-image-preview", "--prompt", "a cat", "--image", out],
      { ORCAROUTER_API_KEY: FAKE_KEY, ORCA_API_BASE_URL: api.baseUrl },
    );

    assert.equal(result.code, 0, result.stderr);
    assert.equal(await readFile(out, "utf8"), "generated-bytes");

    const modelCall = api.recorded.find((call) => call.url.includes("/models"));
    assert.ok(modelCall, "the provider must discover the catalog first");
    assert.equal(modelCall.url, "/v1/models?capability=image");
    assert.equal(modelCall.authorization, `Bearer ${FAKE_KEY}`);

    const chatCall = api.recorded.find((call) => call.url.includes("/chat/completions"));
    assert.ok(chatCall, "the image request must use the OrcaRouter chat/completions route");
    assert.equal(chatCall.authorization, `Bearer ${FAKE_KEY}`);

    const body = chatCall.body as Record<string, unknown>;
    assert.equal(body.model, "google/gemini-3.1-flash-image-preview");
    assert.deepEqual(body.modalities, ["image", "text"]);

    assert.ok(!result.stdout.includes(FAKE_KEY), "the key must never be printed");
    assert.ok(!result.stderr.includes(FAKE_KEY), "the key must never be printed");
    assert.match(result.stdout, /sk-\*\*\*/, "only a masked credential may be shown");
  } finally {
    await api.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test("the CLI lists only image-capable models from the live catalog", async () => {
  const api = await startFakeApi(imagePayload("x"));
  try {
    const result = await runCli(["--list-models", "--json"], {
      ORCAROUTER_API_KEY: FAKE_KEY,
      ORCA_API_BASE_URL: api.baseUrl,
    });

    assert.equal(result.code, 0, result.stderr);
    const payload = JSON.parse(result.stdout);

    assert.equal(payload.catalogSource, "live");
    assert.equal(payload.degraded, false);
    assert.deepEqual(
      payload.models.map((model: { id: string }) => model.id).sort(),
      ["google/gemini-3.1-flash-image-preview", "openai/gpt-image-1.5"],
    );
    assert.ok(!payload.models.some((model: { id: string }) => model.id === "deepseek/deepseek-v4-pro"));
    assert.ok(!result.stdout.includes(FAKE_KEY));

    const [first] = payload.models;
    assert.deepEqual(first.inputModalities, ["text", "image"]);
  } finally {
    await api.close();
  }
});

test("the CLI refuses a model that is absent from the live catalog instead of sending it", async () => {
  const api = await startFakeApi(imagePayload("x"));
  const dir = await mkdtemp(path.join(tmpdir(), "orca-e2e-"));
  const out = path.join(dir, "out.png");

  try {
    const result = await runCli(
      ["--provider", "orcarouter", "--model", "openai/retired-image-model", "--prompt", "a cat", "--image", out],
      { ORCAROUTER_API_KEY: FAKE_KEY, ORCA_API_BASE_URL: api.baseUrl },
    );

    assert.notEqual(result.code, 0);
    assert.match(result.stderr, /not in the live image catalog/);
    assert.ok(!api.recorded.some((call) => call.url.includes("/chat/completions")));
  } finally {
    await api.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test("a catalog outage degrades to the verified seed and says so instead of failing or falling back to free text", async () => {
  const api = await startFakeApi(imagePayload("x"), 503);
  try {
    const result = await runCli(["--list-models", "--json"], {
      ORCAROUTER_API_KEY: FAKE_KEY,
      ORCA_API_BASE_URL: api.baseUrl,
    });

    assert.equal(result.code, 0, result.stderr);
    const payload = JSON.parse(result.stdout);

    assert.equal(payload.catalogSource, "seed");
    assert.equal(payload.degraded, true);
    assert.match(payload.degradedReason, /HTTP 503/);
    assert.ok(payload.models.length > 0);
    assert.ok(payload.models.every((model: { id: string }) => model.id.includes("/")));
  } finally {
    await api.close();
  }
});

test("the CLI reports a missing credential with both authentication paths", async () => {
  const result = await runCli(["--list-models"], {});

  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /ORCAROUTER_API_KEY/);
  assert.match(result.stderr, /--orcarouter-login/);
  assert.match(result.stderr, /https:\/\/www\.orcarouter\.ai\/console\/token/);
});

test("the CLI saves an API key into the repo's own env store and reports it masked", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "orca-e2e-home-"));
  try {
    const result = await runCli(["--orcarouter-key", FAKE_KEY], { HOME: dir });

    assert.equal(result.code, 0, result.stderr);
    const envFile = await readFile(path.join(dir, ".baoyu-skills", ".env"), "utf8");
    assert.ok(envFile.includes(`ORCAROUTER_API_KEY=${FAKE_KEY}`));

    assert.match(result.stdout, /sk-\*\*\*/);
    assert.ok(!result.stdout.includes("fake-e2e-key"), "the saved key must be shown masked only");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
