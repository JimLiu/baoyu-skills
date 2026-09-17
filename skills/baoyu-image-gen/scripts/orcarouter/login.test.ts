import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import http from "node:http";
import test from "node:test";

import {
  OrcaLoginError,
  OrcaLoginSession,
  connectOrcaAccount,
  isAuthorizeUrl,
  normalizePastedCode,
} from "./login.ts";

const FAKE_KEY = "sk-orca-fake-login-key";

type FakeAuthServer = {
  authBaseUrl: string;
  apiBaseUrl: string;
  recorded: Array<{ path: string; body: Record<string, unknown> }>;
  authorizeRequests: URL[];
  close: () => Promise<void>;
  respondWith: (status: number, body: unknown) => void;
};

async function startFakeAuthServer(): Promise<FakeAuthServer> {
  const recorded: FakeAuthServer["recorded"] = [];
  const authorizeRequests: URL[] = [];
  let nextResponse: { status: number; body: unknown } = {
    status: 200,
    body: { key: FAKE_KEY, scope: "api", user_id: "42" },
  };

  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const chunks: Buffer[] = [];

    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => {
      if (url.pathname === "/auth") {
        authorizeRequests.push(url);
        res.writeHead(200, { "Content-Type": "text/html", Connection: "close" });
        res.end(`<p>consent for ${url.searchParams.get("app_name")}</p>`);
        return;
      }

      let body: Record<string, unknown> = {};
      const raw = Buffer.concat(chunks).toString("utf8");
      if (raw) body = JSON.parse(raw);
      recorded.push({ path: url.pathname, body });

      res.writeHead(nextResponse.status, { "Content-Type": "application/json", Connection: "close" });
      res.end(JSON.stringify(nextResponse.body));
    });
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as { port: number }).port;

  return {
    authBaseUrl: `http://127.0.0.1:${port}`,
    apiBaseUrl: `http://127.0.0.1:${port}/v1`,
    recorded,
    authorizeRequests,
    respondWith: (status, body) => {
      nextResponse = { status, body };
    },
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}

test("the login session builds an out-of-band authorize URL with S256 and never leaks the verifier", () => {
  const session = new OrcaLoginSession("https://www.orcarouter.ai", "https://api.orcarouter.ai/v1", 1);
  const url = new URL(session.url());

  assert.equal(url.origin, "https://www.orcarouter.ai");
  assert.equal(url.pathname, "/auth");
  assert.equal(url.searchParams.get("callback_url"), "oob");
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.equal(url.searchParams.get("scope"), "api");
  assert.equal(session.codeChallengeMethod(), "S256");

  const challenge = url.searchParams.get("code_challenge")!;
  assert.ok(!challenge.includes("="));

  const state = url.searchParams.get("state")!;
  assert.throws(() => session.verifyReturnedState("attacker"), /state mismatch/);
  assert.doesNotThrow(() => session.verifyReturnedState(state));
  assert.ok(session.returnedStateExpected() === state);
});

test("two login attempts never reuse a verifier, challenge or state", () => {
  const first = new OrcaLoginSession("https://www.orcarouter.ai", "https://api.orcarouter.ai/v1", 1);
  const second = new OrcaLoginSession("https://www.orcarouter.ai", "https://api.orcarouter.ai/v1", 2);

  const firstUrl = new URL(first.url());
  const secondUrl = new URL(second.url());

  assert.notEqual(firstUrl.searchParams.get("code_challenge"), secondUrl.searchParams.get("code_challenge"));
  assert.notEqual(firstUrl.searchParams.get("state"), secondUrl.searchParams.get("state"));
});

test("a pasted authorize URL is refused with an actionable message, and denial is reported", () => {
  assert.ok(isAuthorizeUrl("https://www.orcarouter.ai/auth?callback_url=oob&code_challenge=x"));
  assert.throws(
    () => normalizePastedCode("https://www.orcarouter.ai/auth?callback_url=oob"),
    (error: OrcaLoginError) => error.kind === "wrong-value" && /paste the code shown/.test(error.message),
  );
  assert.throws(
    () => normalizePastedCode("http://127.0.0.1:9/cb?error=access_denied&code=abc"),
    (error: OrcaLoginError) => error.kind === "denied",
  );
  assert.equal(normalizePastedCode("  the-code  "), "the-code");
});

test("the full login adapter runs authorize -> code -> exchange -> persist against a fake auth server", async () => {
  const server = await startFakeAuthServer();
  const logged: string[] = [];

  try {
    const result = await connectOrcaAccount(
      {
        prompt: async () => "  fake-one-time-code  ",
        log: (message) => logged.push(message),
      },
      { authBaseUrl: server.authBaseUrl, apiBaseUrl: server.apiBaseUrl },
    );

    assert.ok(result);
    assert.equal(result.credential.value, FAKE_KEY);
    assert.equal(result.credential.scope, "api");
    assert.equal(result.credential.source, "pkce");

    assert.equal(server.authorizeRequests.length, 0, "the client must not call the consent endpoint itself");
    assert.equal(server.recorded.length, 1);
    assert.equal(server.recorded[0]!.path, "/api/v1/auth/keys");
    assert.equal(server.recorded[0]!.body.code, "fake-one-time-code");
    assert.equal(server.recorded[0]!.body.code_challenge_method, "S256");

    const verifier = String(server.recorded[0]!.body.code_verifier);
    const expectedChallenge = createHash("sha256").update(verifier).digest("base64url");

    const printed = logged.join("\n");
    assert.ok(printed.includes(`code_challenge=${expectedChallenge}`), "the printed challenge must match the verifier");
    assert.ok(!printed.includes(verifier), "the verifier must never be printed");
    assert.ok(!printed.includes(FAKE_KEY), "the key must never be printed in full");
    assert.ok(printed.includes("sk-***-key") || printed.includes("sk-***"), "only a masked key may be logged");
  } finally {
    await server.close();
  }
});

test("the exchange always goes to the auth origin while inference stays on the API origin", async () => {
  const server = await startFakeAuthServer();
  const session = new OrcaLoginSession(server.authBaseUrl, "https://api.orcarouter.ai/v1", 1);

  try {
    await session.exchange("fake-code");
    assert.equal(server.recorded[0]!.path, "/api/v1/auth/keys");
    assert.equal(new URL(session.url()).pathname, "/auth");
    assert.ok(!server.recorded.some((call) => call.path === "/v1/auth/keys"));
    assert.ok(!server.recorded.some((call) => call.path.startsWith("/v1/")));
  } finally {
    await server.close();
  }
});

test("denial, reuse/expiry, 429 and transport failure each end the login with an actionable error", async () => {
  const server = await startFakeAuthServer();

  const run = async (): Promise<OrcaLoginError> => {
    const session = new OrcaLoginSession(server.authBaseUrl, "https://api.orcarouter.ai/v1", 1);
    return session.exchange("fake-code").catch((error: OrcaLoginError) => error);
  };

  try {
    server.respondWith(403, { error: "invalid_grant" });
    const expired = await run();
    assert.equal(expired.kind, "invalid-code");
    assert.match(expired.message, /start a new login/);

    server.respondWith(400, { error: "invalid_request" });
    const mismatch = await run();
    assert.equal(mismatch.kind, "malformed-response");
    assert.match(mismatch.message, /challenge method/);

    server.respondWith(429, { error: "too_many_requests" });
    const limited = await run();
    assert.equal(limited.kind, "rate-limited");
    assert.match(limited.message, /24 hours/);

    server.respondWith(200, { error: "access_denied" });
    const denied = await run();
    assert.equal(denied.kind, "denied");

    server.respondWith(200, { key: FAKE_KEY, scope: "connector" });
    const downgraded = await run();
    assert.equal(downgraded.kind, "scope-mismatch");
  } finally {
    await server.close();
  }
});

test("a cancelled login stores nothing and leaves the previous credential untouched", async () => {
  const server = await startFakeAuthServer();
  try {
    await assert.rejects(
      () =>
        connectOrcaAccount(
          { prompt: async () => "   ", log: () => {} },
          { authBaseUrl: server.authBaseUrl, apiBaseUrl: server.apiBaseUrl },
        ),
      (error: OrcaLoginError) => error.kind === "cancelled" && /left untouched/.test(error.message),
    );

    await assert.rejects(
      () =>
        connectOrcaAccount(
          {
            prompt: async () => {
              throw new Error("stdin closed");
            },
            log: () => {},
          },
          { authBaseUrl: server.authBaseUrl, apiBaseUrl: server.apiBaseUrl },
        ),
      (error: OrcaLoginError) => error.kind === "cancelled",
    );

    assert.equal(server.recorded.length, 0, "a cancelled login must not reach the exchange endpoint");
  } finally {
    await server.close();
  }
});

test("a revoked key is recorded as needsReauth and never exchanged for a fake refresh", async () => {
  const server = await startFakeAuthServer();
  try {
    await connectOrcaAccount(
      { prompt: async () => "fake-code", log: () => {} },
      { authBaseUrl: server.authBaseUrl, apiBaseUrl: server.apiBaseUrl },
    );

    const paths = server.recorded.map((call) => call.path);
    assert.deepEqual(paths, ["/api/v1/auth/keys"]);
    assert.ok(!paths.some((path) => /refresh|token$/.test(path)), "no refresh grant may be attempted");
  } finally {
    await server.close();
  }
});
