import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  EXPECTED_SCOPE,
  ORCA_KEY_COMMAND,
  OrcaApiKeyAdapter,
  OrcaExchangeError,
  classifyExchangeFailure,
  classifyGenerationFailure,
  createPkceChallenge,
  exchangeCodeForCredential,
  markCredentialNeedsReauth,
  maskSecret,
  nextGeneration,
  parseExchangeResponse,
  resetGenerationCounter,
  selectOrcaCredential,
  verifyState,
  type OrcaAccountStore,
  type OrcaCredential,
} from "./credentials.ts";
import { buildAuthorizeUrl, buildExchangeUrl, normalizeOrigin, resolveOrcaOrigins } from "./origins.ts";

const FAKE_KEY = "sk-orca-fake-test-key-value";
const AUTH_BASE = "https://www.orcarouter.ai";
const API_BASE = "https://api.orcarouter.ai/v1";

function decodeBase64Url(value: string): Buffer {
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

test("the API key adapter produces the same credential shape the PKCE adapter produces", async () => {
  const viaKey = new OrcaApiKeyAdapter().acquire(FAKE_KEY);

  const viaPkce = parseExchangeResponse({ key: FAKE_KEY, scope: "api", user_id: "42" });

  assert.equal(viaKey.credential.source, "api-key");
  assert.equal(viaPkce.credential.source, "pkce");

  for (const result of [viaKey, viaPkce]) {
    assert.equal(result.credential.value, FAKE_KEY);
    assert.equal(result.credential.status, "active");
    assert.equal(typeof result.credential.generation, "number");
  }

  assert.deepEqual(
    Object.keys(viaKey.credential).sort(),
    Object.keys(viaPkce.credential).sort(),
  );
});

test("the API key adapter masks the key in every description and reads/saves/clears through the env seam", () => {
  const adapter = new OrcaApiKeyAdapter();
  const result = adapter.acquire(FAKE_KEY);

  assert.equal(maskSecret(result.credential.value), "sk-***alue");
  assert.ok(!maskSecret(result.credential.value).includes("orca-fake"));

  assert.throws(() => adapter.acquire(""), /ORCAROUTER_API_KEY is empty/);
  assert.throws(() => adapter.acquire("   "), new RegExp(ORCA_KEY_COMMAND));

  const selected = selectOrcaCredential({ env: { ORCAROUTER_API_KEY: FAKE_KEY } });
  assert.equal(selected?.credential.source, "api-key");

  const cleared = selectOrcaCredential({ env: {} });
  assert.equal(cleared, null);
});

test("a broken or rejected stored credential is not selected and asks for re-authentication", () => {
  const rejected: OrcaCredential = {
    source: "pkce",
    value: FAKE_KEY,
    scope: "api",
    userId: "42",
    generation: 7,
    status: "needsReauth",
    reason: "HTTP 401",
  };

  assert.equal(selectOrcaCredential({ env: {}, storedAccount: rejected }), null);

  const active = { ...rejected, status: "active" as const };
  assert.equal(selectOrcaCredential({ env: {}, storedAccount: active })?.credential.source, "pkce");
});

test("PKCE creates a fresh verifier and state per attempt and only sends the S256 challenge", () => {
  const first = createPkceChallenge();
  const second = createPkceChallenge();

  assert.notEqual(first.verifier, second.verifier);
  assert.notEqual(first.state, second.state);
  assert.equal(first.method, "S256");

  const expected = createHash("sha256").update(first.verifier).digest("base64url");
  assert.equal(first.challenge, expected);
  assert.ok(!first.challenge.includes("="), "challenge must be base64url without padding");

  assert.equal(decodeBase64Url(first.verifier).length, 32);
  assert.equal(decodeBase64Url(first.state).length, 16);
});

test("the authorize URL carries the challenge on the auth origin and never the verifier", () => {
  const challenge = createPkceChallenge();
  const url = buildAuthorizeUrl(AUTH_BASE, {
    callback_url: "oob",
    code_challenge: challenge.challenge,
    code_challenge_method: challenge.method,
    state: challenge.state,
    app_name: "baoyu-image-gen",
    scope: EXPECTED_SCOPE,
  });

  const parsed = new URL(url);
  assert.equal(parsed.origin, AUTH_BASE);
  assert.equal(parsed.pathname, "/auth");
  assert.equal(parsed.searchParams.get("callback_url"), "oob");
  assert.equal(parsed.searchParams.get("code_challenge_method"), "S256");
  assert.equal(parsed.searchParams.get("code_challenge"), challenge.challenge);
  assert.equal(parsed.searchParams.get("scope"), EXPECTED_SCOPE);
  assert.ok(!url.includes(challenge.verifier), "the verifier must never leave the process");
});

test("the exchange uses the auth origin at /api/v1/auth/keys and never the inference origin", () => {
  const exchangeUrl = buildExchangeUrl(AUTH_BASE);

  assert.equal(exchangeUrl, "https://www.orcarouter.ai/api/v1/auth/keys");
  assert.ok(!exchangeUrl.includes("api.orcarouter.ai"));
  assert.equal(new URL(exchangeUrl).pathname, "/api/v1/auth/keys");
  assert.notEqual(new URL(exchangeUrl).pathname, "/v1/auth/keys");
  assert.notEqual(exchangeUrl, `${API_BASE}/auth/keys`);
});

test("state comparison rejects a mismatch and accepts only the exact value", () => {
  const { state } = createPkceChallenge();

  assert.doesNotThrow(() => verifyState(state, state));
  assert.throws(() => verifyState(state, null), /did not include a state value/);
  assert.throws(() => verifyState(state, `${state}x`), /state mismatch/);
  assert.throws(() => verifyState(state, "attacker-state"), /state mismatch/);
});

test("the exchange posts the verifier and S256 method to the auth origin and persists the key", async () => {
  const challenge = createPkceChallenge();
  const calls: Array<{ url: string; body: Record<string, unknown> }> = [];

  const result = await exchangeCodeForCredential("one-time-code", challenge, {
    authBaseUrl: AUTH_BASE,
    fetchImpl: async (input, init) => {
      const url = typeof input === "string" ? input : String(input);
      calls.push({ url, body: JSON.parse(String(init?.body)) });
      return new Response(JSON.stringify({ key: FAKE_KEY, scope: "api", user_id: "42" }), { status: 200 });
    },
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0]!.url, "https://www.orcarouter.ai/api/v1/auth/keys");
  assert.equal(calls[0]!.body.code, "one-time-code");
  assert.equal(calls[0]!.body.code_verifier, challenge.verifier);
  assert.equal(calls[0]!.body.code_challenge_method, "S256");
  assert.equal(result.credential.value, FAKE_KEY);
  assert.equal(result.credential.scope, "api");
  assert.equal(result.credential.userId, "42");
  assert.equal(result.credential.status, "active");
});

test("denial, expiry, reuse and RPC failures end safely without storing a credential", async () => {
  const challenge = createPkceChallenge();

  const denied = await exchangeCodeForCredential("c", challenge, {
    authBaseUrl: AUTH_BASE,
    fetchImpl: async () => new Response(JSON.stringify({ error: "access_denied" }), { status: 403 }),
  }).catch((error: OrcaExchangeError) => error);
  assert.ok(denied instanceof OrcaExchangeError);
  assert.equal(denied.kind, "invalid-code");
  assert.match(denied.message, /single-use and expire after 10 minutes/);

  const badMethod = classifyExchangeFailure(400, {});
  assert.equal(badMethod.kind, "malformed-response");
  assert.match(badMethod.message, /challenge method/);

  const limited = classifyExchangeFailure(429, {});
  assert.equal(limited.kind, "rate-limited");
  assert.match(limited.message, /10 keys/);

  const network = classifyExchangeFailure(500, {});
  assert.equal(network.kind, "network");

  const transport = await exchangeCodeForCredential("c", challenge, {
    authBaseUrl: AUTH_BASE,
    fetchImpl: async () => {
      throw new Error("socket hang up");
    },
  }).catch((error: OrcaExchangeError) => error);
  assert.equal(transport.kind, "network");
  assert.match(transport.message, /Retry the login/);
});

test("a scope downgrade is refused rather than assumed to be the requested scope", () => {
  assert.throws(() => parseExchangeResponse({ key: FAKE_KEY, scope: "connector" }), /connector/);
  assert.throws(() => parseExchangeResponse({ key: FAKE_KEY }), /did not report a granted scope/);
  assert.throws(() => parseExchangeResponse({ scope: "api" }), /did not return a key/);

  const ok = parseExchangeResponse({ key: FAKE_KEY, scope: "api" });
  assert.equal(ok.scopeDowngrade, null);
  assert.equal(ok.credential.scope, "api");
});

test("no credential, verifier or code value ever appears in an error message", async () => {
  const challenge = createPkceChallenge();
  const secret = "sk-orca-super-secret-value";

  const errors: string[] = [];

  const cases = [
    exchangeCodeForCredential("used-code", challenge, {
      authBaseUrl: AUTH_BASE,
      fetchImpl: async () => new Response(JSON.stringify({ key: secret, error: "invalid_grant" }), { status: 403 }),
    }),
    exchangeCodeForCredential("used-code", challenge, {
      authBaseUrl: AUTH_BASE,
      fetchImpl: async () => new Response(JSON.stringify({ scope: "api" }), { status: 200 }),
    }),
    exchangeCodeForCredential("used-code", challenge, {
      authBaseUrl: AUTH_BASE,
      fetchImpl: async () => new Response(JSON.stringify({ key: secret, scope: "connector" }), { status: 200 }),
    }),
  ];

  for (const attempt of cases) {
    const error = await attempt.catch((err: Error) => err);
    errors.push(String(error.message));
  }

  const joined = errors.join("\n");
  assert.ok(!joined.includes(secret), "a key must not appear in an error");
  assert.ok(!joined.includes(challenge.verifier), "the verifier must not appear in an error");
  assert.ok(!joined.includes("used-code"), "the auth code must not appear in an error");
});

test("a revoked durable key becomes needsReauth for that exact generation only", () => {
  resetGenerationCounter();
  const first = nextGeneration();
  const store: OrcaAccountStore = {
    alice: { source: "pkce", value: FAKE_KEY, scope: "api", userId: "1", generation: first, status: "active", reason: null },
  };

  const afterStaleFailure = markCredentialNeedsReauth(store, "alice", first - 1, "old request 401");
  assert.equal(afterStaleFailure.alice!.status, "active");

  const afterRealFailure = markCredentialNeedsReauth(store, "alice", first, "relay 401");
  assert.equal(afterRealFailure.alice!.status, "needsReauth");
  assert.equal(afterRealFailure.alice!.value, FAKE_KEY, "the rejected credential must not be deleted");
  assert.equal(afterRealFailure.alice!.reason, "relay 401");
});

test("a 401 on the current generation is terminal and never triggers a refresh of the durable key", () => {
  const current = 5;

  const stale = classifyGenerationFailure(401, "OrcaRouter API error (401)", 4, current);
  assert.equal(stale.terminal, false);
  assert.equal(stale.markReauth, false);
  assert.match(stale.message, /ignored: this failure belongs to credential generation 4/);

  const live = classifyGenerationFailure(401, "OrcaRouter API error (401)", current, current);
  assert.equal(live.terminal, true);
  assert.equal(live.markReauth, true);
  assert.match(live.message, /needsReauth/);
  assert.match(live.message, /was kept/);
  assert.ok(!/refresh/i.test(live.message), "a durable key grant has no refresh path");

  const serverError = classifyGenerationFailure(500, "OrcaRouter API error (500)", current, current);
  assert.equal(serverError.terminal, false);
  assert.equal(serverError.markReauth, false);
});

test("a late 401 from an old generation cannot poison a freshly reauthorized credential", () => {
  const store: OrcaAccountStore = {
    alice: { source: "pkce", value: FAKE_KEY, scope: "api", userId: "1", generation: 2, status: "active", reason: null },
  };

  const afterLateFailure = markCredentialNeedsReauth(store, "alice", 1, "late 401 from generation 1");

  assert.equal(afterLateFailure.alice!.status, "active");
  assert.equal(afterLateFailure.alice!.generation, 2);
});

test("auth and inference origins stay distinct and explicit overrides win", () => {
  const defaults = resolveOrcaOrigins({});
  assert.equal(defaults.authBaseUrl, "https://www.orcarouter.ai");
  assert.equal(defaults.apiBaseUrl, "https://api.orcarouter.ai/v1");

  const split = resolveOrcaOrigins({
    ORCA_AUTH_BASE_URL: "https://auth.internal.example",
    ORCA_API_BASE_URL: "https://relay.internal.example/v1",
  });
  assert.equal(split.authBaseUrl, "https://auth.internal.example");
  assert.equal(split.apiBaseUrl, "https://relay.internal.example/v1");

  const shared = resolveOrcaOrigins({ ORCA_BASE_URL: "https://one-host.internal.example" });
  assert.equal(shared.authBaseUrl, "https://one-host.internal.example");
  assert.equal(shared.apiBaseUrl, "https://one-host.internal.example/v1");

  const overridden = resolveOrcaOrigins({
    ORCA_BASE_URL: "https://one-host.internal.example",
    ORCA_API_BASE_URL: "https://relay.internal.example",
  });
  assert.equal(overridden.authBaseUrl, "https://one-host.internal.example");
  assert.equal(overridden.apiBaseUrl, "https://relay.internal.example/v1");
});

test("plain HTTP is refused for remote origins and allowed only for loopback development", () => {
  assert.throws(() => normalizeOrigin("http://orcarouter.example", "ORCA_AUTH_BASE_URL"), /must use https/);
  assert.equal(normalizeOrigin("http://127.0.0.1:8080", "ORCA_AUTH_BASE_URL"), "http://127.0.0.1:8080");
  assert.equal(normalizeOrigin("http://localhost:3000/", "ORCA_AUTH_BASE_URL"), "http://localhost:3000");
  assert.throws(() => normalizeOrigin("https://user:pass@example.com", "x"), /userinfo/);
  assert.throws(() => normalizeOrigin("not a url", "x"), /not a valid URL/);
  assert.equal(normalizeOrigin("https://api.orcarouter.ai/v1/", "x"), "https://api.orcarouter.ai/v1");
});

test("the exchange is never derived from the inference origin by appending /v1", () => {
  const api = resolveOrcaOrigins({
    ORCA_API_BASE_URL: "https://api.orcarouter.ai/v1",
  });

  assert.notEqual(buildExchangeUrl(api.apiBaseUrl), `${api.apiBaseUrl}/auth/keys`);
  assert.equal(buildExchangeUrl("https://www.orcarouter.ai"), "https://www.orcarouter.ai/api/v1/auth/keys");
});
