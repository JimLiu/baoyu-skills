import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import { mkdir } from 'node:fs/promises';
import net from 'node:net';
import process from 'node:process';

import { Endpoint, Headers } from '../constants.js';
import { logger } from './logger.js';
import { cookie_header, fetch_with_timeout, sleep } from './http.js';
import { read_cookie_file, type CookieMap, write_cookie_file } from './cookie-file.js';
import { resolveGeminiWebChromeProfileDir, resolveGeminiWebCookiePath } from './paths.js';

type CdpSendOptions = { sessionId?: string; timeoutMs?: number };

class CdpConnection {
  private ws: WebSocket;
  private nextId = 0;
  private pending = new Map<
    number,
    { resolve: (v: unknown) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> | null }
  >();

  private constructor(ws: WebSocket) {
    this.ws = ws;
    this.ws.addEventListener('message', (event) => {
      try {
        const data = typeof event.data === 'string' ? event.data : new TextDecoder().decode(event.data as ArrayBuffer);
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
    this.ws.addEventListener('close', () => {
      for (const [id, p] of this.pending.entries()) {
        this.pending.delete(id);
        if (p.timer) clearTimeout(p.timer);
        p.reject(new Error('CDP connection closed.'));
      }
    });
  }

  static async connect(url: string, timeoutMs: number): Promise<CdpConnection> {
    const ws = new WebSocket(url);
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('CDP connection timeout.')), timeoutMs);
      ws.addEventListener('open', () => {
        clearTimeout(t);
        resolve();
      });
      ws.addEventListener('error', () => {
        clearTimeout(t);
        reject(new Error('CDP connection failed.'));
      });
    });
    return new CdpConnection(ws);
  }

  async send<T = unknown>(method: string, params?: Record<string, unknown>, opts?: CdpSendOptions): Promise<T> {
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

async function get_free_port(): Promise<number> {
  const fixed = parseInt(process.env.GEMINI_WEB_DEBUG_PORT || '', 10);
  if (fixed > 0) return fixed;
  return await new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const addr = srv.address();
      if (!addr || typeof addr === 'string') {
        srv.close(() => reject(new Error('Unable to allocate a free TCP port.')));
        return;
      }
      const port = addr.port;
      srv.close((err) => (err ? reject(err) : resolve(port)));
    });
  });
}

function find_chrome_executable(): string | null {
  const override = process.env.GEMINI_WEB_CHROME_PATH?.trim();
  if (override && fs.existsSync(override)) return override;

  const candidates: string[] = [];
  switch (process.platform) {
    case 'darwin':
      candidates.push(
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
        '/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      );
      break;
    case 'win32':
      candidates.push(
        'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
        'C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
        'C:\\\\Program Files\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe',
        'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe',
      );
      break;
    default:
      candidates.push(
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/snap/bin/chromium',
        '/usr/bin/microsoft-edge',
      );
      break;
  }

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function wait_for_chrome_debug_port(port: number, timeoutMs: number): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch_with_timeout(`http://127.0.0.1:${port}/json/version`, { timeout_ms: 5_000 });
      if (!res.ok) throw new Error(`status=${res.status}`);
      const j = (await res.json()) as { webSocketDebuggerUrl?: string };
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error('Chrome debug port not ready');
}

async function launch_chrome(profileDir: string, port: number): Promise<ChildProcess> {
  const chrome = find_chrome_executable();
  if (!chrome) throw new Error('Chrome executable not found.');

  const args = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-popup-blocking',
    'https://gemini.google.com/app',
  ];

  return spawn(chrome, args, { stdio: 'ignore' });
}

async function is_gemini_session_ready(cookies: CookieMap, verbose: boolean): Promise<boolean> {
  if (!cookies['__Secure-1PSID']) return false;

  try {
    const res = await fetch_with_timeout(Endpoint.INIT, {
      method: 'GET',
      headers: { ...Headers.GEMINI, Cookie: cookie_header(cookies) },
      redirect: 'follow',
      timeout_ms: 30_000,
    });

    if (!res.ok) {
      if (verbose) logger.debug(`Gemini init check failed: ${res.status} ${res.statusText}`);
      return false;
    }

    const text = await res.text();
    return /\"SNlM0e\":\"(.*?)\"/.test(text);
  } catch (e) {
    if (verbose) logger.debug(`Gemini init check error: ${e instanceof Error ? e.message : String(e)}`);
    return false;
  }
}

async function fetch_google_cookies_via_cdp(
  profileDir: string,
  timeoutMs: number,
  verbose: boolean,
): Promise<CookieMap> {
  await mkdir(profileDir, { recursive: true });

  const port = await get_free_port();
  const chrome = await launch_chrome(profileDir, port);

  let cdp: CdpConnection | null = null;
  try {
    const wsUrl = await wait_for_chrome_debug_port(port, 30_000);
    cdp = await CdpConnection.connect(wsUrl, 15_000);

    const { targetId } = await cdp.send<{ targetId: string }>('Target.createTarget', {
      url: 'https://gemini.google.com/app',
      newWindow: true,
    });
    const { sessionId } = await cdp.send<{ sessionId: string }>('Target.attachToTarget', { targetId, flatten: true });
    await cdp.send('Network.enable', {}, { sessionId });

    if (verbose) {
      logger.info('Chrome opened. If needed, complete Google login in the window. Waiting for a valid Gemini session...');
    }

    const start = Date.now();
    let last: CookieMap = {};

    while (Date.now() - start < timeoutMs) {
      const { cookies } = await cdp.send<{ cookies: Array<{ name: string; value: string }> }>(
        'Network.getCookies',
        { urls: ['https://gemini.google.com/', 'https://accounts.google.com/', 'https://www.google.com/'] },
        { sessionId, timeoutMs: 10_000 },
      );

      const m: CookieMap = {};
      for (const c of cookies) {
        if (c?.name && typeof c.value === 'string') m[c.name] = c.value;
      }

      last = m;
      if (await is_gemini_session_ready(m, verbose)) {
        return m;
      }

      await sleep(1000);
    }

    throw new Error(`Timed out waiting for a valid Gemini session. Last keys: ${Object.keys(last).join(', ')}`);
  } finally {
    if (cdp) {
      try {
        await cdp.send('Browser.close', {}, { timeoutMs: 5_000 });
      } catch {}
      cdp.close();
    }

    try {
      chrome.kill('SIGTERM');
    } catch {}
    setTimeout(() => {
      if (!chrome.killed) {
        try {
          chrome.kill('SIGKILL');
        } catch {}
      }
    }, 2_000).unref?.();
  }
}

export async function load_browser_cookies(domain_name: string = '', verbose: boolean = true): Promise<Record<string, CookieMap>> {
  const force = process.env.GEMINI_WEB_LOGIN?.trim() || process.env.GEMINI_WEB_FORCE_LOGIN?.trim();
  if (!force) {
    const cached = await read_cookie_file();
    if (cached) return { chrome: cached };
  }

  const profileDir = process.env.GEMINI_WEB_CHROME_PROFILE_DIR?.trim() || resolveGeminiWebChromeProfileDir();
  const cookies = await fetch_google_cookies_via_cdp(profileDir, 120_000, verbose);

  const filtered: CookieMap = {};
  for (const [k, v] of Object.entries(cookies)) {
    if (typeof v === 'string' && v.length > 0) filtered[k] = v;
  }

  await write_cookie_file(filtered, resolveGeminiWebCookiePath(), 'cdp');
  void domain_name;
  return { chrome: filtered };
}

export const loadBrowserCookies = load_browser_cookies;
