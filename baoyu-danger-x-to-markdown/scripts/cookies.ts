import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import { mkdir } from "node:fs/promises";
import net from "node:net";
import process from "node:process";

import { read_cookie_file, write_cookie_file } from "./cookie-file.js";
import { resolveXToMarkdownCookiePath } from "./paths.js";
import { X_COOKIE_NAMES, X_REQUIRED_COOKIES, X_LOGIN_URL, X_USER_DATA_DIR } from "./constants.js";
import type { CookieLike } from "./types.js";

type CdpSendOptions = { sessionId?: string; timeoutMs?: number };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs, ...rest } = init;
  if (!timeoutMs || timeoutMs <= 0) return fetch(url, rest);

  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...rest, signal: ctl.signal });
  } finally {
    clearTimeout(t);
  }
}

class CdpConnection {
  private ws: WebSocket;
  private nextId = 0;
  private pending = new Map<
    number,
    { resolve: (v: unknown) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> | null }
  >();

  private constructor(ws: WebSocket) {
    this.ws = ws;
    this.ws.addEventListener("message", (event) => {
      try {
        const data =
          typeof event.data === "string"
            ? event.data
            : new TextDecoder().decode(event.data as ArrayBuffer);
        const msg = JSON.parse(data) as { id?: number; result?: unknown; error?: { message?: string } };
        if (msg.id) {
          const p = this.pending.get(msg.id);
          if (p) {
            this.pending.delete(msg.id);
            if (p.timer) clearTimeout(p.timer);
            if (msg.error?.message) p.reject(new Error(msg.error.message));
            else p.resolve(msg.result);
          }
        }
      } catch {}
    });
    this.ws.addEventListener("close", () => {
      for (const [id, p] of this.pending.entries()) {
        this.pending.delete(id);
        if (p.timer) clearTimeout(p.timer);
        p.reject(new Error("CDP connection closed."));
      }
    });
  }

  static async connect(url: string, timeoutMs: number): Promise<CdpConnection> {
    const ws = new WebSocket(url);
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("CDP connection timeout.")), timeoutMs);
      ws.addEventListener("open", () => {
        clearTimeout(t);
        resolve();
      });
      ws.addEventListener("error", () => {
        clearTimeout(t);
        reject(new Error("CDP connection failed."));
      });
    });
    return new CdpConnection(ws);
  }

  async send<T = unknown>(
    method: string,
    params?: Record<string, unknown>,
    opts?: CdpSendOptions
  ): Promise<T> {
    const id = ++this.nextId;
    const msg: Record<string, unknown> = { id, method };
    if (params) msg.params = params;
    if (opts?.sessionId) msg.sessionId = opts.sessionId;

    const timeoutMs = opts?.timeoutMs ?? 15_000;
    const out = await new Promise<unknown>((resolve, reject) => {
      const t =
        timeoutMs > 0
          ? setTimeout(() => {
              this.pending.delete(id);
              reject(new Error(`CDP timeout: ${method}`));
            }, timeoutMs)
          : null;
      this.pending.set(id, { resolve, reject, timer: t });
      this.ws.send(JSON.stringify(msg));
    });
    return out as T;
  }

  close(): void {
    try {
      this.ws.close();
    } catch {}
  }
}

async function getFreePort(): Promise<number> {
  const fixed = parseInt(process.env.X_DEBUG_PORT || "", 10);
  if (fixed > 0) return fixed;
  return await new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const addr = srv.address();
      if (!addr || typeof addr === "string") {
        srv.close(() => reject(new Error("Unable to allocate a free TCP port.")));
        return;
      }
      const port = addr.port;
      srv.close((err) => (err ? reject(err) : resolve(port)));
    });
  });
}

function findChromeExecutable(): string | null {
  const override = process.env.X_CHROME_PATH?.trim();
  if (override && fs.existsSync(override)) return override;

  const candidates: string[] = [];
  switch (process.platform) {
    case "darwin":
      candidates.push(
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
        "/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
      );
      break;
    case "win32":
      candidates.push(
        "C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
        "C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
        "C:\\\\Program Files\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe",
        "C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe"
      );
      break;
    default:
      candidates.push(
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/snap/bin/chromium",
        "/usr/bin/microsoft-edge"
      );
      break;
  }

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function waitForChromeDebugPort(port: number, timeoutMs: number): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetchWithTimeout(`http://127.0.0.1:${port}/json/version`, { timeoutMs: 5_000 });
      if (!res.ok) throw new Error(`status=${res.status}`);
      const j = (await res.json()) as { webSocketDebuggerUrl?: string };
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("Chrome debug port not ready");
}

async function launchChrome(profileDir: string, port: number): Promise<ChildProcess> {
  const chrome = findChromeExecutable();
  if (!chrome) throw new Error("Chrome executable not found.");

  const args = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-popup-blocking",
    X_LOGIN_URL,
  ];

  return spawn(chrome, args, { stdio: "ignore" });
}

async function fetchXCookiesViaCdp(
  profileDir: string,
  timeoutMs: number,
  verbose: boolean,
  log?: (message: string) => void
): Promise<Record<string, string>> {
  await mkdir(profileDir, { recursive: true });

  const port = await getFreePort();
  const chrome = await launchChrome(profileDir, port);

  let cdp: CdpConnection | null = null;
  try {
    const wsUrl = await waitForChromeDebugPort(port, 30_000);
    cdp = await CdpConnection.connect(wsUrl, 15_000);

    const { targetId } = await cdp.send<{ targetId: string }>("Target.createTarget", {
      url: X_LOGIN_URL,
      newWindow: true,
    });
    const { sessionId } = await cdp.send<{ sessionId: string }>("Target.attachToTarget", { targetId, flatten: true });
    await cdp.send("Network.enable", {}, { sessionId });

    if (verbose) {
      log?.("[x-cookies] Chrome opened. If needed, complete X login in the window. Waiting for cookies...");
    }

    const start = Date.now();
    let last: Record<string, string> = {};

    while (Date.now() - start < timeoutMs) {
      const { cookies } = await cdp.send<{ cookies: CookieLike[] }>(
        "Network.getCookies",
        { urls: ["https://x.com/", "https://twitter.com/"] },
        { sessionId, timeoutMs: 10_000 }
      );

      const m = buildXCookieMap((cookies ?? []).filter(Boolean));
      last = m;
      if (hasRequiredXCookies(m)) {
        return m;
      }

      await sleep(1000);
    }

    throw new Error(`Timed out waiting for X cookies. Last keys: ${Object.keys(last).join(", ")}`);
  } finally {
    if (cdp) {
      try {
        await cdp.send("Browser.close", {}, { timeoutMs: 5_000 });
      } catch {}
      cdp.close();
    }

    try {
      chrome.kill("SIGTERM");
    } catch {}
    setTimeout(() => {
      if (!chrome.killed) {
        try {
          chrome.kill("SIGKILL");
        } catch {}
      }
    }, 2_000).unref?.();
  }
}

function resolveCookieDomain(cookie: CookieLike): string | null {
  const rawDomain = cookie.domain?.trim();
  if (rawDomain) {
    return rawDomain.startsWith(".") ? rawDomain.slice(1) : rawDomain;
  }
  const rawUrl = cookie.url?.trim();
  if (rawUrl) {
    try {
      return new URL(rawUrl).hostname;
    } catch {
      return null;
    }
  }
  return null;
}

function pickCookieValue<T extends CookieLike>(cookies: T[], name: string): string | undefined {
  const matches = cookies.filter((cookie) => cookie.name === name && typeof cookie.value === "string");
  if (matches.length === 0) return undefined;

  const preferred = matches.find((cookie) => {
    const domain = resolveCookieDomain(cookie);
    return domain === "x.com" && (cookie.path ?? "/") === "/";
  });
  const xDomain = matches.find((cookie) => (resolveCookieDomain(cookie) ?? "").endsWith("x.com"));
  const twitterDomain = matches.find((cookie) => (resolveCookieDomain(cookie) ?? "").endsWith("twitter.com"));
  return (preferred ?? xDomain ?? twitterDomain ?? matches[0])?.value;
}

function buildXCookieMap<T extends CookieLike>(cookies: T[]): Record<string, string> {
  const cookieMap: Record<string, string> = {};
  for (const name of X_COOKIE_NAMES) {
    const value = pickCookieValue(cookies, name);
    if (value) cookieMap[name] = value;
  }
  return cookieMap;
}

export function hasRequiredXCookies(cookieMap: Record<string, string>): boolean {
  return X_REQUIRED_COOKIES.every((name) => Boolean(cookieMap[name]));
}

function filterXCookieMap(cookieMap: Record<string, string>): Record<string, string> {
  const filtered: Record<string, string> = {};
  for (const name of X_COOKIE_NAMES) {
    const value = cookieMap[name];
    if (value) filtered[name] = value;
  }
  return filtered;
}

function buildInlineCookiesFromEnv(): CookieLike[] {
  const cookies: CookieLike[] = [];
  const authToken = process.env.X_AUTH_TOKEN?.trim();
  const ct0 = process.env.X_CT0?.trim();
  const gt = process.env.X_GUEST_TOKEN?.trim();
  const twid = process.env.X_TWID?.trim();

  if (authToken) {
    cookies.push({ name: "auth_token", value: authToken, domain: "x.com", path: "/" });
  }
  if (ct0) {
    cookies.push({ name: "ct0", value: ct0, domain: "x.com", path: "/" });
  }
  if (gt) {
    cookies.push({ name: "gt", value: gt, domain: "x.com", path: "/" });
  }
  if (twid) {
    cookies.push({ name: "twid", value: twid, domain: "x.com", path: "/" });
  }

  return cookies;
}

async function loadXCookiesFromInline(log?: (message: string) => void): Promise<Record<string, string>> {
  const inline = buildInlineCookiesFromEnv();
  if (inline.length === 0) return {};

  const cookieMap = buildXCookieMap(
    inline.filter((cookie): cookie is CookieLike => Boolean(cookie?.name && typeof cookie.value === "string"))
  );

  if (Object.keys(cookieMap).length > 0) {
    log?.(`[x-cookies] Loaded X cookies from env: ${Object.keys(cookieMap).length} cookie(s).`);
  } else {
    log?.("[x-cookies] Env cookies provided but no X cookies matched.");
  }

  return cookieMap;
}

async function loadXCookiesFromFile(log?: (message: string) => void): Promise<Record<string, string>> {
  const cookiePath = resolveXToMarkdownCookiePath();
  const fileMap = filterXCookieMap((await read_cookie_file(cookiePath)) ?? {});
  if (Object.keys(fileMap).length > 0) {
    log?.(`[x-cookies] Loaded X cookies from file: ${cookiePath} (${Object.keys(fileMap).length} cookie(s))`);
  }
  return fileMap;
}

async function loadXCookiesFromCdp(log?: (message: string) => void): Promise<Record<string, string>> {
  try {
    const cookieMap = await fetchXCookiesViaCdp(X_USER_DATA_DIR, 5 * 60 * 1000, true, log);
    if (!hasRequiredXCookies(cookieMap)) return cookieMap;

    const cookiePath = resolveXToMarkdownCookiePath();
    try {
      await write_cookie_file(cookieMap, cookiePath, "cdp");
      log?.(`[x-cookies] Cookies saved to ${cookiePath}`);
    } catch (error) {
      log?.(
        `[x-cookies] Failed to write cookie file (${cookiePath}): ${
          error instanceof Error ? error.message : String(error ?? "")
        }`
      );
    }
    if (cookieMap.auth_token) log?.(`[x-cookies] auth_token: ${cookieMap.auth_token.slice(0, 20)}...`);
    if (cookieMap.ct0) log?.(`[x-cookies] ct0: ${cookieMap.ct0.slice(0, 20)}...`);
    return cookieMap;
  } catch (error) {
    log?.(
      `[x-cookies] Failed to load cookies via Chrome DevTools Protocol: ${
        error instanceof Error ? error.message : String(error ?? "")
      }`
    );
    return {};
  }
}

export async function loadXCookies(log?: (message: string) => void): Promise<Record<string, string>> {
  const inlineMap = await loadXCookiesFromInline(log);
  const fileMap = await loadXCookiesFromFile(log);
  const combined = { ...fileMap, ...inlineMap };

  if (hasRequiredXCookies(combined)) return combined;

  const cdpMap = await loadXCookiesFromCdp(log);
  return { ...fileMap, ...cdpMap, ...inlineMap };
}

export async function refreshXCookies(log?: (message: string) => void): Promise<Record<string, string>> {
  return loadXCookiesFromCdp(log);
}

export function buildCookieHeader(cookieMap: Record<string, string>): string | undefined {
  const entries = Object.entries(cookieMap).filter(([, value]) => value);
  if (entries.length === 0) return undefined;
  return entries.map(([key, value]) => `${key}=${value}`).join("; ");
}
