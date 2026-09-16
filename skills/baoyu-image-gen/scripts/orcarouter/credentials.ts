import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { buildExchangeUrl } from "./origins";

export const ORCA_CREDENTIAL_ENV = "ORCAROUTER_API_KEY";
export const ORCA_KEY_COMMAND = "--orcarouter-login";
export const ORCA_KEY_URL = "https://www.orcarouter.ai/console/token";
export const ORCA_AUTHORIZED_APPS_URL = "https://www.orcarouter.ai/console/authorized-apps";

export const ORCA_APP_NAME = "baoyu-image-gen";

export type OrcaCredentialSource = "api-key" | "pkce";
export type OrcaCredentialStatus = "active" | "needsReauth";

export type OrcaCredential = {
  source: OrcaCredentialSource;
  value: string;
  scope: string | null;
  userId: string | null;
  generation: number;
  status: OrcaCredentialStatus;
  reason: string | null;
};

export type OrcaCredentialResult = {
  credential: OrcaCredential;
  scopeDowngrade: string | null;
};

export type OrcaAccountStore = Record<string, OrcaCredential>;

let generationCounter = 0;

export function nextGeneration(): number {
  generationCounter += 1;
  return generationCounter;
}

export function resetGenerationCounter(): void {
  generationCounter = 0;
}

export function maskSecret(value: string | null | undefined): string {
  if (!value) return "(none)";
  return value.length <= 8 ? "***" : `${value.slice(0, 3)}***${value.slice(-4)}`;
}

export function describeCredential(credential: OrcaCredential): string {
  const provenance = credential.source === "api-key" ? "API key" : "PKCE account login";
  return `${provenance} (${maskSecret(credential.value)}, generation ${credential.generation})`;
}

function compact(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function toAccountCredential(
  credential: OrcaCredential,
): OrcaCredential {
  return { ...credential };
}

export class OrcaApiKeyAdapter {
  readonly source = "api-key" as const;

  acquire(rawKey: string): OrcaCredentialResult {
    const value = compact(rawKey);
    if (!value) {
      throw new Error(
        `${ORCA_CREDENTIAL_ENV} is empty. Create a key at ${ORCA_KEY_URL} or run the ${ORCA_KEY_COMMAND} login.`
      );
    }

    return {
      credential: {
        source: this.source,
        value,
        scope: null,
        userId: null,
        generation: nextGeneration(),
        status: "active",
        reason: null,
      },
      scopeDowngrade: null,
    };
  }
}

export function base64UrlEncode(input: Buffer | Uint8Array): string {
  return Buffer.from(input).toString("base64url");
}

export type PkceChallenge = {
  verifier: string;
  challenge: string;
  state: string;
  method: "S256";
};

export function createPkceChallenge(): PkceChallenge {
  const verifier = base64UrlEncode(randomBytes(32));
  const challenge = base64UrlEncode(createHash("sha256").update(verifier).digest());
  const state = base64UrlEncode(randomBytes(16));
  return { verifier, challenge, state, method: "S256" };
}

export function verifyState(expected: string, received: string | null): void {
  if (!received) throw new Error("Authorization response did not include a state value.");

  const expectedBytes = Buffer.from(expected, "utf8");
  const receivedBytes = Buffer.from(received, "utf8");
  const equal =
    expectedBytes.length === receivedBytes.length && timingSafeEqual(expectedBytes, receivedBytes);
  if (!equal) throw new Error("Authorization state mismatch; the response was not for this login attempt.");
}

export type OrcaExchangeErrorKind =
  | "denied"
  | "invalid-code"
  | "scope-mismatch"
  | "rate-limited"
  | "network"
  | "malformed-response";

export class OrcaExchangeError extends Error {
  readonly kind: OrcaExchangeErrorKind;

  constructor(kind: OrcaExchangeErrorKind, message: string) {
    super(message);
    this.name = "OrcaExchangeError";
    this.kind = kind;
  }
}

export type ExchangeRequest = {
  code: string;
  code_verifier: string;
  code_challenge_method: "S256";
};

export type ExchangeResponse = {
  key?: unknown;
  scope?: unknown;
  user_id?: unknown;
  error?: unknown;
  error_description?: unknown;
};

export const EXPECTED_SCOPE = "api";

export function buildExchangeRequest(code: string, codeVerifier: string): ExchangeRequest {
  return { code, code_verifier: codeVerifier, code_challenge_method: "S256" };
}

export function classifyExchangeFailure(
  status: number,
  body: ExchangeResponse | null,
): OrcaExchangeError {
  const description = compact(body?.error_description) ?? compact(body?.error) ?? "";
  const suffix = description ? `: ${description}` : "";

  if (status === 403) {
    return new OrcaExchangeError(
      "invalid-code",
      `OrcaRouter refused the authorization code (HTTP 403)${suffix}. Codes are single-use and expire after 10 minutes; start a new login.`,
    );
  }
  if (status === 400) {
    return new OrcaExchangeError(
      "malformed-response",
      `OrcaRouter rejected the PKCE exchange (HTTP 400)${suffix}. This usually means the code challenge method did not match the one sent at authorize time.`,
    );
  }
  if (status === 429) {
    return new OrcaExchangeError(
      "rate-limited",
      `OrcaRouter is rate limiting logins (HTTP 429)${suffix}. At most 10 keys are issued per user per 24 hours; reuse the stored key or try again later.`,
    );
  }
  return new OrcaExchangeError(
    "network",
    `OrcaRouter login failed (HTTP ${status})${suffix}. Check your network and retry.`,
  );
}

export function parseExchangeResponse(body: ExchangeResponse): OrcaCredentialResult {
  const error = compact(body.error);
  if (error) {
    const denied = error === "access_denied" || error === "authorization_denied";
    throw new OrcaExchangeError(
      denied ? "denied" : "malformed-response",
      `OrcaRouter reported "${error}"${compact(body.error_description) ? `: ${body.error_description}` : ""}. No credential was stored.`,
    );
  }

  const key = compact(body.key);
  if (!key) {
    throw new OrcaExchangeError(
      "malformed-response",
      "OrcaRouter did not return a key. No credential was stored.",
    );
  }

  const scope = compact(body.scope);
  const scopeDowngrade =
    scope && scope !== EXPECTED_SCOPE
      ? `OrcaRouter granted scope "${scope}", not "${EXPECTED_SCOPE}".`
      : null;

  if (!scope) {
    throw new OrcaExchangeError(
      "scope-mismatch",
      `OrcaRouter did not report a granted scope, so the grant cannot be verified against "${EXPECTED_SCOPE}". No credential was stored.`,
    );
  }

  if (scope !== EXPECTED_SCOPE) {
    throw new OrcaExchangeError(
      "scope-mismatch",
      `OrcaRouter granted scope "${scope}", which does not satisfy the "${EXPECTED_SCOPE}" grant this client needs. No credential was stored.`,
    );
  }

  return {
    credential: {
      source: "pkce",
      value: key,
      scope,
      userId: compact(body.user_id),
      generation: nextGeneration(),
      status: "active",
      reason: null,
    },
    scopeDowngrade,
  };
}

export type OrcaExchangeOptions = {
  authBaseUrl: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

export async function exchangeCodeForCredential(
  code: string,
  challenge: PkceChallenge,
  options: OrcaExchangeOptions,
): Promise<OrcaCredentialResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 30000;

  let response: Response;
  try {
    response = await fetchImpl(buildExchangeUrl(options.authBaseUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildExchangeRequest(code, challenge.verifier)),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const reason = error instanceof Error && error.name === "TimeoutError" ? "timed out" : String(error);
    throw new OrcaExchangeError("network", `OrcaRouter login request failed (${reason}). Retry the login.`);
  }

  let body: ExchangeResponse | null = null;
  try {
    body = (await response.json()) as ExchangeResponse;
  } catch {
    body = null;
  }

  if (!response.ok) throw classifyExchangeFailure(response.status, body);
  if (!body) {
    throw new OrcaExchangeError(
      "malformed-response",
      "OrcaRouter returned a response that was not JSON. No credential was stored.",
    );
  }

  return parseExchangeResponse(body);
}

export type SelectOrcaCredentialOptions = {
  env?: Record<string, string | undefined>;
  storedAccount?: OrcaCredential | null;
};

export const ORCA_PKCE_PROVIDER = "orcarouter-oauth";

export function selectOrcaCredential(
  options: SelectOrcaCredentialOptions = {},
): OrcaCredentialResult | null {
  const env = options.env ?? process.env;
  const storedAccount = options.storedAccount ?? null;

  if (env[ORCA_CREDENTIAL_ENV]) {
    return new OrcaApiKeyAdapter().acquire(env[ORCA_CREDENTIAL_ENV]!);
  }

  if (storedAccount && storedAccount.status === "active") {
    return { credential: toAccountCredential(storedAccount), scopeDowngrade: null };
  }

  return null;
}

export function markCredentialNeedsReauth(
  store: OrcaAccountStore,
  accountId: string,
  generation: number,
  reason: string,
): OrcaAccountStore {
  const existing = store[accountId];
  if (!existing) return store;

  if (existing.generation !== generation) return store;

  return {
    ...store,
    [accountId]: { ...existing, status: "needsReauth", reason },
  };
}

export function classifyGenerationFailure(
  status: number,
  message: string,
  generation: number,
  currentGeneration: number,
): { terminal: boolean; markReauth: boolean; message: string } {
  if (status !== 401) return { terminal: false, markReauth: false, message };

  if (generation !== currentGeneration) {
    return {
      terminal: false,
      markReauth: false,
      message: `${message} (ignored: this failure belongs to credential generation ${generation}, not the current ${currentGeneration})`,
    };
  }

  return {
    terminal: true,
    markReauth: true,
    message: `${message} The OrcaRouter credential was rejected (HTTP 401). Re-authenticate with ${ORCA_KEY_COMMAND} or a new key from ${ORCA_KEY_URL}; the stored credential was kept and marked needsReauth.`,
  };
}
