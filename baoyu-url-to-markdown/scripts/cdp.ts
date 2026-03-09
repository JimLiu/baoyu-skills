import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import { mkdir } from "node:fs/promises";
import net from "node:net";
import process from "node:process";

import { resolveUrlToMarkdownChromeProfileDir } from "./paths.js";
import { CDP_CONNECT_TIMEOUT_MS, NETWORK_IDLE_TIMEOUT_MS } from "./constants.js";

type CdpSendOptions = { sessionId?: string; timeoutMs?: number };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url: string, init: RequestInit & { timeoutMs?: number } = {}): Promise<Response> {
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

export class CdpConnection {
  private ws: WebSocket;
  private nextId = 0;
  private pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> | null }>();
  private eventHandlers = new Map<string, Set<(params: unknown) => void>>();

  private constructor(ws: WebSocket) {
    this.ws = ws;
    this.ws.addEventListener("message", (event) => {
      try {
        const data = typeof event.data === "string" ? event.data : new TextDecoder().decode(event.data as ArrayBuffer);
        const msg = JSON.parse(data) as { id?: number; method?: string; params?: unknown; result?: unknown; error?: { message?: string } };
        if (msg.id) {
          const p = this.pending.get(msg.id);
          if (p) {
            this.pending.delete(msg.id);
            if (p.timer) clearTimeout(p.timer);
            if (msg.error?.message) p.reject(new Error(msg.error.message));
            else p.resolve(msg.result);
          }
        } else if (msg.method) {
          const handlers = this.eventHandlers.get(msg.method);
          if (handlers) {
            for (const h of handlers) h(msg.params);
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
      ws.addEventListener("open", () => { clearTimeout(t); resolve(); });
      ws.addEventListener("error", () => { clearTimeout(t); reject(new Error("CDP connection failed.")); });
    });
    return new CdpConnection(ws);
  }

  on(event: string, handler: (params: unknown) => void): void {
    let handlers = this.eventHandlers.get(event);
    if (!handlers) {
      handlers = new Set();
      this.eventHandlers.set(event, handlers);
    }
    handlers.add(handler);
  }

  off(event: string, handler: (params: unknown) => void): void {
    this.eventHandlers.get(event)?.delete(handler);
  }

  async send<T = unknown>(method: string, params?: Record<string, unknown>, opts?: CdpSendOptions): Promise<T> {
    const id = ++this.nextId;
    const msg: Record<string, unknown> = { id, method };
    if (params) msg.params = params;
    if (opts?.sessionId) msg.sessionId = opts.sessionId;
    const timeoutMs = opts?.timeoutMs ?? 15_000;
    const out = await new Promise<unknown>((resolve, reject) => {
      const t = timeoutMs > 0 ? setTimeout(() => { this.pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, timeoutMs) : null;
      this.pending.set(id, { resolve, reject, timer: t });
      this.ws.send(JSON.stringify(msg));
    });
    return out as T;
  }

  close(): void {
    try { this.ws.close(); } catch {}
  }
}

export async function getFreePort(): Promise<number> {
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

export function findChromeExecutable(): string | null {
  const override = process.env.URL_CHROME_PATH?.trim();
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
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
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

export async function waitForChromeDebugPort(port: number, timeoutMs: number): Promise<string> {
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

export async function launchChrome(url: string, port: number, headless: boolean = false): Promise<ChildProcess> {
  const chrome = findChromeExecutable();
  if (!chrome) throw new Error("Chrome executable not found. Install Chrome or set URL_CHROME_PATH env.");
  const profileDir = resolveUrlToMarkdownChromeProfileDir();
  await mkdir(profileDir, { recursive: true });

  const args = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-popup-blocking",
  ];
  if (headless) args.push("--headless=new");
  args.push(url);

  return spawn(chrome, args, { stdio: "ignore" });
}

export async function waitForNetworkIdle(cdp: CdpConnection, sessionId: string, timeoutMs: number = NETWORK_IDLE_TIMEOUT_MS): Promise<void> {
  return new Promise((resolve) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let pending = 0;
    const cleanup = () => {
      if (timer) clearTimeout(timer);
      cdp.off("Network.requestWillBeSent", onRequest);
      cdp.off("Network.loadingFinished", onFinish);
      cdp.off("Network.loadingFailed", onFinish);
    };
    const done = () => { cleanup(); resolve(); };
    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(done, timeoutMs);
    };
    const onRequest = () => { pending++; resetTimer(); };
    const onFinish = () => { pending = Math.max(0, pending - 1); if (pending <= 2) resetTimer(); };
    cdp.on("Network.requestWillBeSent", onRequest);
    cdp.on("Network.loadingFinished", onFinish);
    cdp.on("Network.loadingFailed", onFinish);
    resetTimer();
  });
}

export async function waitForPageLoad(cdp: CdpConnection, sessionId: string, timeoutMs: number = 30_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cdp.off("Page.loadEventFired", handler);
      resolve();
    }, timeoutMs);
    const handler = () => {
      clearTimeout(timer);
      cdp.off("Page.loadEventFired", handler);
      resolve();
    };
    cdp.on("Page.loadEventFired", handler);
  });
}

export async function createTargetAndAttach(cdp: CdpConnection, url: string): Promise<{ targetId: string; sessionId: string }> {
  const { targetId } = await cdp.send<{ targetId: string }>("Target.createTarget", { url });
  const { sessionId } = await cdp.send<{ sessionId: string }>("Target.attachToTarget", { targetId, flatten: true });
  await cdp.send("Network.enable", {}, { sessionId });
  await cdp.send("Page.enable", {}, { sessionId });
  return { targetId, sessionId };
}

export async function navigateAndWait(cdp: CdpConnection, sessionId: string, url: string, timeoutMs: number): Promise<void> {
  const loadPromise = new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Page load timeout")), timeoutMs);
    const handler = (params: unknown) => {
      const p = params as { name?: string };
      if (p.name === "load" || p.name === "DOMContentLoaded") {
        clearTimeout(timer);
        cdp.off("Page.lifecycleEvent", handler);
        resolve();
      }
    };
    cdp.on("Page.lifecycleEvent", handler);
  });
  await cdp.send("Page.navigate", { url }, { sessionId });
  await loadPromise;
}

export async function evaluateScript<T>(cdp: CdpConnection, sessionId: string, expression: string, timeoutMs: number = 30_000): Promise<T> {
  const result = await cdp.send<{ result: { value?: T; type?: string; description?: string } }>(
    "Runtime.evaluate",
    { expression, returnByValue: true, awaitPromise: true },
    { sessionId, timeoutMs }
  );
  return result.result.value as T;
}

export async function autoScroll(cdp: CdpConnection, sessionId: string, steps: number = 8, waitMs: number = 600): Promise<void> {
  let lastHeight = await evaluateScript<number>(cdp, sessionId, "document.body.scrollHeight");
  for (let i = 0; i < steps; i++) {
    await evaluateScript<void>(cdp, sessionId, "window.scrollTo(0, document.body.scrollHeight)");
    await sleep(waitMs);
    const newHeight = await evaluateScript<number>(cdp, sessionId, "document.body.scrollHeight");
    if (newHeight === lastHeight) break;
    lastHeight = newHeight;
  }
  await evaluateScript<void>(cdp, sessionId, "window.scrollTo(0, 0)");
}

export function killChrome(chrome: ChildProcess): void {
  try { chrome.kill("SIGTERM"); } catch {}
  setTimeout(() => {
    if (!chrome.killed) {
      try { chrome.kill("SIGKILL"); } catch {}
    }
  }, 2_000).unref?.();
}
