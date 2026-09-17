import { createInterface } from "node:readline/promises";
import {
  ORCA_APP_NAME,
  ORCA_AUTHORIZED_APPS_URL,
  ORCA_KEY_URL,
  ORCA_PKCE_PROVIDER,
  EXPECTED_SCOPE,
  createPkceChallenge,
  exchangeCodeForCredential,
  maskSecret,
  verifyState,
  type OrcaCredential,
  type OrcaCredentialResult,
  type PkceChallenge,
} from "./credentials";
import { buildAuthorizeUrl, resolveOrcaOrigins } from "./origins";

export type PromptFn = (question: string) => Promise<string>;

export type LoginDeps = {
  prompt: PromptFn;
  openUrl?: (url: string) => void;
  log?: (message: string) => void;
};

export type LoginOptions = {
  authBaseUrl?: string;
  apiBaseUrl?: string;
  timeoutMs?: number;
  env?: Record<string, string | undefined>;
  appName?: string;
};

export class OrcaLoginError extends Error {
  readonly kind: string;

  constructor(kind: string, message: string) {
    super(message);
    this.name = "OrcaLoginError";
    this.kind = kind;
  }
}

export class OrcaLoginSession {
  private readonly challenge: PkceChallenge;
  private readonly authorizeUrl: string;
  private cancelled = false;

  constructor(
    readonly authBaseUrl: string,
    readonly apiBaseUrl: string,
    readonly attempt: number,
    appName = ORCA_APP_NAME,
  ) {
    this.challenge = createPkceChallenge();
    this.authorizeUrl = buildOobAuthorizeUrl(authBaseUrl, this.challenge, appName);
  }

  url(): string {
    return this.authorizeUrl;
  }

  isCancelled(): boolean {
    return this.cancelled;
  }

  cancel(): void {
    this.cancelled = true;
  }

  codeChallengeMethod(): string {
    return this.challenge.method;
  }

  verifyReturnedState(state: string | null): void {
    verifyState(this.challenge.state, state);
  }

  returnedStateExpected(): string {
    return this.challenge.state;
  }

  exchange(code: string, options: { authBaseUrl?: string; timeoutMs?: number } = {}): Promise<OrcaCredentialResult> {
    return exchangeCodeForCredential(code, this.challenge, {
      authBaseUrl: options.authBaseUrl ?? this.authBaseUrl,
      timeoutMs: options.timeoutMs,
    });
  }
}

export function buildOobAuthorizeUrl(
  authBaseUrl: string,
  challenge: PkceChallenge,
  appName = ORCA_APP_NAME,
): string {
  return buildAuthorizeUrl(authBaseUrl, {
    callback_url: "oob",
    code_challenge: challenge.challenge,
    code_challenge_method: challenge.method,
    state: challenge.state,
    app_name: appName,
    scope: EXPECTED_SCOPE,
  });
}

export function isAuthorizeUrl(value: string): boolean {
  return value.includes("/auth?") && value.includes("callback_url=");
}

export function normalizePastedCode(input: string, expectedState?: string | null): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  if (isAuthorizeUrl(trimmed)) {
    throw new OrcaLoginError(
      "wrong-value",
      "That is the authorization URL, not the code. Open it in a browser, approve, then paste the code shown on the consent screen.",
    );
  }

  let parsed: URL | null = null;
  try {
    parsed = new URL(trimmed);
  } catch {
    parsed = null;
  }

  if (parsed) {
    const error = parsed.searchParams.get("error");
    if (error) {
      throw new OrcaLoginError(
        error === "access_denied" ? "denied" : "exchange",
        `OrcaRouter refused the authorization ("${error}"). No credential was stored.`,
      );
    }

    const code = parsed.searchParams.get("code");
    if (code) {
      if (expectedState) verifyState(expectedState, parsed.searchParams.get("state"));
      return code;
    }
  }

  return trimmed;
}

export async function connectOrcaAccount(
  deps: LoginDeps,
  options: LoginOptions = {},
): Promise<OrcaCredentialResult | null> {
  const env = options.env ?? process.env;
  const origins = resolveOrcaOrigins(env);
  const authBaseUrl = options.authBaseUrl ?? origins.authBaseUrl;
  const apiBaseUrl = options.apiBaseUrl ?? origins.apiBaseUrl;
  const log = deps.log ?? ((message: string) => console.error(message));

  const session = new OrcaLoginSession(authBaseUrl, apiBaseUrl, 1, options.appName);

  log(
    `Sign in to OrcaRouter (${ORCA_PKCE_PROVIDER}) — Flow B out-of-band code with PKCE ${session.codeChallengeMethod()}.`,
  );
  log(`Open this URL on any device and approve the request:\n${session.url()}`);
  deps.openUrl?.(session.url());

  let answer: string;
  try {
    answer = await deps.prompt(
      "Paste the code shown on the OrcaRouter consent screen (blank to cancel): ",
    );
  } catch (error) {
    throw new OrcaLoginError(
      "cancelled",
      `OrcaRouter login cancelled before a code was entered (${String(error)}). The stored credential was left untouched.`,
    );
  }

  if (session.isCancelled()) {
    throw new OrcaLoginError(
      "cancelled",
      "OrcaRouter login cancelled. The stored credential was left untouched.",
    );
  }

  const code = normalizePastedCode(answer, session.returnedStateExpected());
  if (!code) {
    throw new OrcaLoginError(
      "cancelled",
      "OrcaRouter login cancelled. The stored credential was left untouched.",
    );
  }

  const result = await session.exchange(code, {
    authBaseUrl,
    timeoutMs: options.timeoutMs,
  });

  log(
    `OrcaRouter login succeeded — stored credential ${maskSecret(result.credential.value)} (scope ${result.credential.scope}).`,
  );
  if (result.scopeDowngrade) log(`Warning: ${result.scopeDowngrade}`);
  return result;
}

export type { OrcaCredential, OrcaCredentialResult, PkceChallenge };
export { ORCA_AUTHORIZED_APPS_URL, ORCA_KEY_URL };

export async function createTerminalPrompt(): Promise<PromptFn> {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  return async (question: string) => {
    try {
      return await rl.question(question);
    } finally {
      rl.close();
    }
  };
}
