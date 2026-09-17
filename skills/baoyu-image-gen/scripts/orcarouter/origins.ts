export const DEFAULT_AUTH_BASE_URL = "https://www.orcarouter.ai";
export const DEFAULT_API_BASE_URL = "https://api.orcarouter.ai/v1";

export type OrcaOrigins = {
  authBaseUrl: string;
  apiBaseUrl: string;
};

export type OrcaEnv = Record<string, string | undefined>;

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

export function isLoopbackHost(hostname: string): boolean {
  return LOOPBACK_HOSTS.has(hostname.toLowerCase());
}

function stripTrailingSlashes(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

export function normalizeOrigin(value: string, label: string): string {
  const trimmed = stripTrailingSlashes(value);
  if (!trimmed) throw new Error(`${label} is empty.`);

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`${label} is not a valid URL: ${trimmed}`);
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`${label} must use http or https: ${trimmed}`);
  }

  if (parsed.protocol === "http:" && !isLoopbackHost(parsed.hostname)) {
    throw new Error(
      `${label} must use https for non-loopback hosts. HTTP is only allowed for localhost/127.0.0.1/[::1]: ${trimmed}`
    );
  }

  if (parsed.username || parsed.password) {
    throw new Error(`${label} must not contain userinfo: ${trimmed}`);
  }

  return stripTrailingSlashes(parsed.toString());
}

export function withV1Suffix(base: string): string {
  return /\/v1$/.test(base) ? base : `${base}/v1`;
}

function pick(env: OrcaEnv, primary: string, alias: string): string | undefined {
  const value = env[primary]?.trim();
  if (value) return value;
  const aliasValue = env[alias]?.trim();
  return aliasValue || undefined;
}

export function resolveOrcaOrigins(env: OrcaEnv = process.env): OrcaOrigins {
  const shared = pick(env, "ORCA_BASE_URL", "ORCAROUTER_BASE_URL");

  const authSource =
    pick(env, "ORCA_AUTH_BASE_URL", "ORCAROUTER_AUTH_BASE_URL") || shared || DEFAULT_AUTH_BASE_URL;
  const apiSource =
    pick(env, "ORCA_API_BASE_URL", "ORCAROUTER_API_BASE_URL") ||
    (shared ? withV1Suffix(stripTrailingSlashes(shared)) : DEFAULT_API_BASE_URL);

  const authBaseUrl = normalizeOrigin(authSource, "ORCA_AUTH_BASE_URL");
  const apiBaseUrl = normalizeOrigin(withV1Suffix(apiSource), "ORCA_API_BASE_URL");

  return { authBaseUrl, apiBaseUrl };
}

export function buildAuthorizeUrl(
  authBaseUrl: string,
  params: Record<string, string>,
): string {
  const url = new URL("/auth", `${authBaseUrl}/`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export function buildExchangeUrl(authBaseUrl: string): string {
  return new URL("/api/v1/auth/keys", `${authBaseUrl}/`).toString();
}
