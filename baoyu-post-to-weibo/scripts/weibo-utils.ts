import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const CHROME_CANDIDATES = {
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ],
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ],
  default: [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ],
};

export function findChromeExecutable(): string | undefined {
  const override = process.env.WEIBO_BROWSER_CHROME_PATH?.trim();
  if (override && fs.existsSync(override)) return override;

  const candidates = process.platform === 'darwin'
    ? CHROME_CANDIDATES.darwin
    : process.platform === 'win32'
      ? CHROME_CANDIDATES.win32
      : CHROME_CANDIDATES.default;

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

export function findExistingChromeDebugPort(profileDir: string): number | null {
  try {
    const result = spawnSync('ps', ['aux'], { encoding: 'utf-8', timeout: 5000 });
    if (result.status !== 0 || !result.stdout) return null;
    const lines = result.stdout.split('\n');
    for (const line of lines) {
      if (!line.includes('--remote-debugging-port=') || !line.includes(profileDir)) continue;
      const portMatch = line.match(/--remote-debugging-port=(\d+)/);
      if (portMatch) return Number(portMatch[1]);
    }
  } catch {}
  return null;
}

export function killChromeByProfile(profileDir: string): void {
  try {
    const result = spawnSync('ps', ['aux'], { encoding: 'utf-8', timeout: 5000 });
    if (result.status !== 0 || !result.stdout) return;
    for (const line of result.stdout.split('\n')) {
      if (!line.includes(profileDir) || !line.includes('--remote-debugging-port=')) continue;
      const pidMatch = line.trim().split(/\s+/)[1];
      if (pidMatch) {
        try { process.kill(Number(pidMatch), 'SIGTERM'); } catch {}
      }
    }
  } catch {}
}

export function getDefaultProfileDir(): string {
  const override = process.env.BAOYU_CHROME_PROFILE_DIR?.trim() || process.env.WEIBO_BROWSER_PROFILE_DIR?.trim();
  if (override) return path.resolve(override);
  const base = process.platform === 'darwin'
    ? path.join(os.homedir(), 'Library', 'Application Support')
    : process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
  return path.join(base, 'baoyu-skills', 'chrome-profile');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getFreePort(): Promise<number> {
  const fixed = parseInt(process.env.WEIBO_BROWSER_DEBUG_PORT || '', 10);
  if (fixed > 0) return fixed;
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('Unable to allocate a free TCP port.')));
        return;
      }
      const port = address.port;
      server.close((err) => {
        if (err) reject(err);
        else resolve(port);
      });
    });
  });
}

async function fetchJson<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export async function waitForChromeDebugPort(port: number, timeoutMs: number): Promise<string> {
  const start = Date.now();
  let lastError: unknown = null;

  while (Date.now() - start < timeoutMs) {
    try {
      const version = await fetchJson<{ webSocketDebuggerUrl?: string }>(`http://127.0.0.1:${port}/json/version`);
      if (version.webSocketDebuggerUrl) return version.webSocketDebuggerUrl;
      lastError = new Error('Missing webSocketDebuggerUrl');
    } catch (error) {
      lastError = error;
    }
    await sleep(200);
  }

  throw new Error(`Chrome debug port not ready: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout> | null;
};

export class CdpConnection {
  private ws: WebSocket;
  private nextId = 0;
  private pending = new Map<number, PendingRequest>();
  private defaultTimeoutMs: number;

  private constructor(ws: WebSocket, options?: { defaultTimeoutMs?: number }) {
    this.ws = ws;
    this.defaultTimeoutMs = options?.defaultTimeoutMs ?? 15_000;

    this.ws.addEventListener('message', (event) => {
      try {
        const data = typeof event.data === 'string' ? event.data : new TextDecoder().decode(event.data as ArrayBuffer);
        const msg = JSON.parse(data) as { id?: number; method?: string; params?: unknown; result?: unknown; error?: { message?: string } };

        if (msg.id) {
          const pending = this.pending.get(msg.id);
          if (pending) {
            this.pending.delete(msg.id);
            if (pending.timer) clearTimeout(pending.timer);
            if (msg.error?.message) pending.reject(new Error(msg.error.message));
            else pending.resolve(msg.result);
          }
        }
      } catch {}
    });

    this.ws.addEventListener('close', () => {
      for (const [id, pending] of this.pending.entries()) {
        this.pending.delete(id);
        if (pending.timer) clearTimeout(pending.timer);
        pending.reject(new Error('CDP connection closed.'));
      }
    });
  }

  static async connect(url: string, timeoutMs: number, options?: { defaultTimeoutMs?: number }): Promise<CdpConnection> {
    const ws = new WebSocket(url);
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('CDP connection timeout.')), timeoutMs);
      ws.addEventListener('open', () => { clearTimeout(timer); resolve(); });
      ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('CDP connection failed.')); });
    });
    return new CdpConnection(ws, options);
  }

  async send<T = unknown>(method: string, params?: Record<string, unknown>, options?: { sessionId?: string; timeoutMs?: number }): Promise<T> {
    const id = ++this.nextId;
    const message: Record<string, unknown> = { id, method };
    if (params) message.params = params;
    if (options?.sessionId) message.sessionId = options.sessionId;

    const timeoutMs = options?.timeoutMs ?? this.defaultTimeoutMs;

    const result = await new Promise<unknown>((resolve, reject) => {
      const timer = timeoutMs > 0
        ? setTimeout(() => { this.pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, timeoutMs)
        : null;
      this.pending.set(id, { resolve, reject, timer });
      this.ws.send(JSON.stringify(message));
    });

    return result as T;
  }

  close(): void {
    try { this.ws.close(); } catch {}
  }
}

export function getScriptDir(): string {
  return path.dirname(fileURLToPath(import.meta.url));
}

function runBunScript(scriptPath: string, args: string[]): boolean {
  const result = spawnSync('npx', ['-y', 'bun', scriptPath, ...args], { stdio: 'inherit' });
  return result.status === 0;
}

export function copyImageToClipboard(imagePath: string): boolean {
  const copyScript = path.join(getScriptDir(), 'copy-to-clipboard.ts');
  return runBunScript(copyScript, ['image', imagePath]);
}

export function copyHtmlToClipboard(htmlPath: string): boolean {
  const copyScript = path.join(getScriptDir(), 'copy-to-clipboard.ts');
  return runBunScript(copyScript, ['html', '--file', htmlPath]);
}

export function pasteFromClipboard(targetApp?: string, retries = 3, delayMs = 500): boolean {
  const pasteScript = path.join(getScriptDir(), 'paste-from-clipboard.ts');
  const args = ['--retries', String(retries), '--delay', String(delayMs)];
  if (targetApp) args.push('--app', targetApp);
  return runBunScript(pasteScript, args);
}
