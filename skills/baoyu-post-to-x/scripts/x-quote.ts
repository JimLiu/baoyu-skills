import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { mkdir } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getFreePort(): Promise<number> {
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

function findChromeExecutable(): string | undefined {
  const override = process.env.X_BROWSER_CHROME_PATH?.trim();
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
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
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
  return undefined;
}

function getDefaultProfileDir(): string {
  const base = process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
  return path.join(base, 'x-browser-profile');
}

async function fetchJson<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

async function waitForChromeDebugPort(port: number, timeoutMs: number): Promise<string> {
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

class CdpConnection {
  private ws: WebSocket;
  private nextId = 0;
  private pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> | null }>();
  private eventHandlers = new Map<string, Set<(params: unknown) => void>>();

  private constructor(ws: WebSocket) {
    this.ws = ws;
    this.ws.addEventListener('message', (event) => {
      try {
        const data = typeof event.data === 'string' ? event.data : new TextDecoder().decode(event.data as ArrayBuffer);
        const msg = JSON.parse(data) as { id?: number; method?: string; params?: unknown; result?: unknown; error?: { message?: string } };

        if (msg.method) {
          const handlers = this.eventHandlers.get(msg.method);
          if (handlers) handlers.forEach((h) => h(msg.params));
        }

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

  static async connect(url: string, timeoutMs: number): Promise<CdpConnection> {
    const ws = new WebSocket(url);
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('CDP connection timeout.')), timeoutMs);
      ws.addEventListener('open', () => { clearTimeout(timer); resolve(); });
      ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('CDP connection failed.')); });
    });
    return new CdpConnection(ws);
  }

  async send<T = unknown>(method: string, params?: Record<string, unknown>, options?: { sessionId?: string; timeoutMs?: number }): Promise<T> {
    const id = ++this.nextId;
    const message: Record<string, unknown> = { id, method };
    if (params) message.params = params;
    if (options?.sessionId) message.sessionId = options.sessionId;

    const timeoutMs = options?.timeoutMs ?? 15_000;

    const result = await new Promise<unknown>((resolve, reject) => {
      const timer = timeoutMs > 0 ? setTimeout(() => { this.pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, timeoutMs) : null;
      this.pending.set(id, { resolve, reject, timer });
      this.ws.send(JSON.stringify(message));
    });

    return result as T;
  }

  close(): void {
    try { this.ws.close(); } catch {}
  }
}

function extractTweetUrl(urlOrId: string): string | null {
  // If it's already a full URL, normalize it
  if (urlOrId.match(/(?:x\.com|twitter\.com)\/\w+\/status\/\d+/)) {
    return urlOrId.replace(/twitter\.com/, 'x.com').split('?')[0];
  }
  return null;
}

interface QuoteOptions {
  tweetUrl: string;
  comment?: string;
  submit?: boolean;
  timeoutMs?: number;
  profileDir?: string;
  chromePath?: string;
}

export async function quotePost(options: QuoteOptions): Promise<void> {
  const { tweetUrl, comment, submit = false, timeoutMs = 120_000, profileDir = getDefaultProfileDir() } = options;

  const chromePath = options.chromePath ?? findChromeExecutable();
  if (!chromePath) throw new Error('Chrome not found. Set X_BROWSER_CHROME_PATH env var.');

  await mkdir(profileDir, { recursive: true });

  const port = await getFreePort();
  console.log(`[x-quote] Launching Chrome (profile: ${profileDir})`);
  console.log(`[x-quote] Opening tweet: ${tweetUrl}`);

  const chrome = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-blink-features=AutomationControlled',
    '--start-maximized',
    tweetUrl,
  ], { stdio: 'ignore' });

  let cdp: CdpConnection | null = null;

  try {
    const wsUrl = await waitForChromeDebugPort(port, 30_000);
    cdp = await CdpConnection.connect(wsUrl, 30_000);

    const targets = await cdp.send<{ targetInfos: Array<{ targetId: string; url: string; type: string }> }>('Target.getTargets');
    let pageTarget = targets.targetInfos.find((t) => t.type === 'page' && t.url.includes('x.com'));

    if (!pageTarget) {
      const { targetId } = await cdp.send<{ targetId: string }>('Target.createTarget', { url: tweetUrl });
      pageTarget = { targetId, url: tweetUrl, type: 'page' };
    }

    const { sessionId } = await cdp.send<{ sessionId: string }>('Target.attachToTarget', { targetId: pageTarget.targetId, flatten: true });

    await cdp.send('Page.enable', {}, { sessionId });
    await cdp.send('Runtime.enable', {}, { sessionId });

    console.log('[x-quote] Waiting for tweet to load...');
    await sleep(3000);

    // Wait for retweet button to appear (indicates tweet loaded and user logged in)
    const waitForRetweetButton = async (): Promise<boolean> => {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const result = await cdp!.send<{ result: { value: boolean } }>('Runtime.evaluate', {
          expression: `!!document.querySelector('[data-testid="retweet"]')`,
          returnByValue: true,
        }, { sessionId });
        if (result.result.value) return true;
        await sleep(1000);
      }
      return false;
    };

    const retweetFound = await waitForRetweetButton();
    if (!retweetFound) {
      console.log('[x-quote] Tweet not found or not logged in. Please log in to X in the browser window.');
      console.log('[x-quote] Waiting for login...');
      const loggedIn = await waitForRetweetButton();
      if (!loggedIn) throw new Error('Timed out waiting for tweet. Please log in first or check the tweet URL.');
    }

    // Click the retweet button
    console.log('[x-quote] Clicking retweet button...');
    await cdp.send('Runtime.evaluate', {
      expression: `document.querySelector('[data-testid="retweet"]')?.click()`,
    }, { sessionId });
    await sleep(1000);

    // Wait for and click the "Quote" option in the menu
    console.log('[x-quote] Selecting quote option...');
    const waitForQuoteOption = async (): Promise<boolean> => {
      const start = Date.now();
      while (Date.now() - start < 10_000) {
        const result = await cdp!.send<{ result: { value: boolean } }>('Runtime.evaluate', {
          expression: `!!document.querySelector('[data-testid="Dropdown"] [role="menuitem"]:nth-child(2)')`,
          returnByValue: true,
        }, { sessionId });
        if (result.result.value) return true;
        await sleep(200);
      }
      return false;
    };

    const quoteOptionFound = await waitForQuoteOption();
    if (!quoteOptionFound) {
      throw new Error('Quote option not found. The menu may not have opened.');
    }

    // Click the quote option (second menu item)
    await cdp.send('Runtime.evaluate', {
      expression: `document.querySelector('[data-testid="Dropdown"] [role="menuitem"]:nth-child(2)')?.click()`,
    }, { sessionId });
    await sleep(2000);

    // Wait for the quote compose dialog
    console.log('[x-quote] Waiting for quote compose dialog...');
    const waitForQuoteDialog = async (): Promise<boolean> => {
      const start = Date.now();
      while (Date.now() - start < 10_000) {
        const result = await cdp!.send<{ result: { value: boolean } }>('Runtime.evaluate', {
          expression: `!!document.querySelector('[data-testid="tweetTextarea_0"]')`,
          returnByValue: true,
        }, { sessionId });
        if (result.result.value) return true;
        await sleep(200);
      }
      return false;
    };

    const dialogFound = await waitForQuoteDialog();
    if (!dialogFound) {
      throw new Error('Quote compose dialog not found.');
    }

    // Type the comment if provided
    if (comment) {
      console.log('[x-quote] Typing comment...');
      // Use CDP Input.insertText for more reliable text insertion
      await cdp.send('Runtime.evaluate', {
        expression: `document.querySelector('[data-testid="tweetTextarea_0"]')?.focus()`,
      }, { sessionId });
      await sleep(200);

      await cdp.send('Input.insertText', {
        text: comment,
      }, { sessionId });
      await sleep(500);
    }

    if (submit) {
      console.log('[x-quote] Submitting quote post...');
      await cdp.send('Runtime.evaluate', {
        expression: `document.querySelector('[data-testid="tweetButton"]')?.click()`,
      }, { sessionId });
      await sleep(2000);
      console.log('[x-quote] Quote post submitted!');
    } else {
      console.log('[x-quote] Quote composed (preview mode). Add --submit to post.');
      console.log('[x-quote] Browser will stay open for 30 seconds for preview...');
      await sleep(30_000);
    }
  } finally {
    if (cdp) {
      try { await cdp.send('Browser.close', {}, { timeoutMs: 5_000 }); } catch {}
      cdp.close();
    }

    setTimeout(() => {
      if (!chrome.killed) try { chrome.kill('SIGKILL'); } catch {}
    }, 2_000).unref?.();
    try { chrome.kill('SIGTERM'); } catch {}
  }
}

function printUsage(): never {
  console.log(`Quote a tweet on X (Twitter) using real Chrome browser

Usage:
  npx -y bun x-quote.ts <tweet-url> [options] [comment]

Options:
  --submit         Actually post (default: preview only)
  --profile <dir>  Chrome profile directory
  --help           Show this help

Examples:
  npx -y bun x-quote.ts https://x.com/user/status/123456789 "Great insight!"
  npx -y bun x-quote.ts https://x.com/user/status/123456789 "I agree!" --submit
`);
  process.exit(0);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) printUsage();

  let tweetUrl: string | undefined;
  let submit = false;
  let profileDir: string | undefined;
  const commentParts: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === '--submit') {
      submit = true;
    } else if (arg === '--profile' && args[i + 1]) {
      profileDir = args[++i];
    } else if (!arg.startsWith('-')) {
      // First non-option argument is the tweet URL
      if (!tweetUrl && arg.match(/(?:x\.com|twitter\.com)\/\w+\/status\/\d+/)) {
        tweetUrl = extractTweetUrl(arg) ?? undefined;
      } else {
        commentParts.push(arg);
      }
    }
  }

  if (!tweetUrl) {
    console.error('Error: Please provide a tweet URL.');
    console.error('Example: npx -y bun x-quote.ts https://x.com/user/status/123456789 "Your comment"');
    process.exit(1);
  }

  const comment = commentParts.join(' ').trim() || undefined;

  await quotePost({ tweetUrl, comment, submit, profileDir });
}

await main().catch((err) => {
  console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
