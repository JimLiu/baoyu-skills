import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import { mkdir, readdir } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const WECHAT_URL = 'https://mp.weixin.qq.com/';

interface MarkdownMeta {
  title: string;
  author: string;
  content: string;
}

function parseMarkdownFile(filePath: string): MarkdownMeta {
  const text = fs.readFileSync(filePath, 'utf-8');
  let title = '';
  let author = '';
  let content = '';

  const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fmMatch) {
    const fm = fmMatch[1]!;
    const titleMatch = fm.match(/^title:\s*(.+)$/m);
    if (titleMatch) title = titleMatch[1]!.trim().replace(/^["']|["']$/g, '');
    const authorMatch = fm.match(/^author:\s*(.+)$/m);
    if (authorMatch) author = authorMatch[1]!.trim().replace(/^["']|["']$/g, '');
  }

  const bodyText = fmMatch ? text.slice(fmMatch[0].length) : text;

  if (!title) {
    const h1Match = bodyText.match(/^#\s+(.+)$/m);
    if (h1Match) title = h1Match[1]!.trim();
  }

  const lines = bodyText.split('\n');
  const paragraphs: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('![')) continue;
    if (trimmed.startsWith('---')) continue;
    paragraphs.push(trimmed);
    if (paragraphs.join('\n').length > 1200) break;
  }
  content = paragraphs.join('\n');

  return { title, author, content };
}

function compressTitle(title: string, maxLen = 20): string {
  if (title.length <= maxLen) return title;

  const prefixes = ['如何', '为什么', '什么是', '怎样', '怎么', '关于'];
  let t = title;
  for (const p of prefixes) {
    if (t.startsWith(p) && t.length > maxLen) {
      t = t.slice(p.length);
      if (t.length <= maxLen) return t;
    }
  }

  const fillers = ['的', '了', '在', '是', '和', '与', '以及', '或者', '或', '还是', '而且', '并且', '但是', '但', '因为', '所以', '如果', '那么', '虽然', '不过', '然而', '——', '…'];
  for (const f of fillers) {
    if (t.length <= maxLen) break;
    t = t.replace(new RegExp(f, 'g'), '');
  }

  if (t.length > maxLen) t = t.slice(0, maxLen);

  return t;
}

function compressContent(content: string, maxLen = 1000): string {
  if (content.length <= maxLen) return content;

  const lines = content.split('\n');
  const result: string[] = [];
  let len = 0;

  for (const line of lines) {
    if (len + line.length + 1 > maxLen) {
      const remaining = maxLen - len - 1;
      if (remaining > 20) result.push(line.slice(0, remaining - 3) + '...');
      break;
    }
    result.push(line);
    len += line.length + 1;
  }

  return result.join('\n');
}

async function loadImagesFromDir(dir: string): Promise<string[]> {
  const entries = await readdir(dir);
  const images = entries
    .filter(f => /\.(png|jpg|jpeg|gif|webp)$/i.test(f))
    .sort()
    .map(f => path.join(dir, f));
  return images;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getFreePort(): Promise<number> {
  const fixed = parseInt(process.env.WECHAT_BROWSER_DEBUG_PORT || '', 10);
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

function findChromeExecutable(): string | undefined {
  const override = process.env.WECHAT_BROWSER_CHROME_PATH?.trim();
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

let _wslHome: string | null | undefined;
function getWslWindowsHome(): string | null {
  if (_wslHome !== undefined) return _wslHome;
  if (!process.env.WSL_DISTRO_NAME) { _wslHome = null; return null; }
  try {
    const raw = execSync('cmd.exe /C "echo %USERPROFILE%"', { encoding: 'utf-8', timeout: 5000 }).trim().replace(/\r/g, '');
    _wslHome = execSync(`wslpath -u "${raw}"`, { encoding: 'utf-8', timeout: 5000 }).trim() || null;
  } catch { _wslHome = null; }
  return _wslHome;
}

function getDefaultProfileDir(): string {
  const override = process.env.BAOYU_CHROME_PROFILE_DIR?.trim() || process.env.WECHAT_BROWSER_PROFILE_DIR?.trim();
  if (override) return path.resolve(override);
  const wslHome = getWslWindowsHome();
  if (wslHome) return path.join(wslHome, '.local', 'share', 'baoyu-skills', 'chrome-profile');
  const base = process.platform === 'darwin'
    ? path.join(os.homedir(), 'Library', 'Application Support')
    : process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
  return path.join(base, 'baoyu-skills', 'chrome-profile');
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

  on(method: string, handler: (params: unknown) => void): void {
    if (!this.eventHandlers.has(method)) this.eventHandlers.set(method, new Set());
    this.eventHandlers.get(method)!.add(handler);
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

interface WeChatBrowserOptions {
  title?: string;
  content?: string;
  images?: string[];
  imagesDir?: string;
  markdownFile?: string;
  submit?: boolean;
  timeoutMs?: number;
  profileDir?: string;
  chromePath?: string;
}

export async function postToWeChat(options: WeChatBrowserOptions): Promise<void> {
  const { submit = false, timeoutMs = 120_000, profileDir = getDefaultProfileDir() } = options;

  let title = options.title || '';
  let content = options.content || '';
  let images = options.images || [];

  if (options.markdownFile) {
    const absPath = path.isAbsolute(options.markdownFile) ? options.markdownFile : path.resolve(process.cwd(), options.markdownFile);
    if (!fs.existsSync(absPath)) throw new Error(`Markdown file not found: ${absPath}`);
    const meta = parseMarkdownFile(absPath);
    if (!title) title = meta.title;
    if (!content) content = meta.content;
    console.log(`[wechat-browser] Parsed markdown: title="${meta.title}", content=${meta.content.length} chars`);
  }

  if (options.imagesDir) {
    const absDir = path.isAbsolute(options.imagesDir) ? options.imagesDir : path.resolve(process.cwd(), options.imagesDir);
    if (!fs.existsSync(absDir)) throw new Error(`Images directory not found: ${absDir}`);
    images = await loadImagesFromDir(absDir);
    console.log(`[wechat-browser] Found ${images.length} images in ${absDir}`);
  }

  if (title.length > 20) {
    const original = title;
    title = compressTitle(title, 20);
    console.log(`[wechat-browser] Title compressed: "${original}" → "${title}"`);
  }

  if (content.length > 1000) {
    const original = content.length;
    content = compressContent(content, 1000);
    console.log(`[wechat-browser] Content compressed: ${original} → ${content.length} chars`);
  }

  if (!title) throw new Error('Title is required (use --title or --markdown)');
  if (!content) throw new Error('Content is required (use --content or --markdown)');
  if (images.length === 0) throw new Error('At least one image is required (use --image or --images)');

  for (const img of images) {
    if (!fs.existsSync(img)) throw new Error(`Image not found: ${img}`);
  }

  const chromePath = options.chromePath ?? findChromeExecutable();
  if (!chromePath) throw new Error('Chrome not found. Set WECHAT_BROWSER_CHROME_PATH env var.');

  await mkdir(profileDir, { recursive: true });

  const port = await getFreePort();
  console.log(`[wechat-browser] Launching Chrome (profile: ${profileDir})`);

  const chrome = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-blink-features=AutomationControlled',
    '--start-maximized',
    WECHAT_URL,
  ], { stdio: 'ignore' });

  let cdp: CdpConnection | null = null;

  try {
    const wsUrl = await waitForChromeDebugPort(port, 30_000);
    cdp = await CdpConnection.connect(wsUrl, 30_000);

    const targets = await cdp.send<{ targetInfos: Array<{ targetId: string; url: string; type: string }> }>('Target.getTargets');
    let pageTarget = targets.targetInfos.find((t) => t.type === 'page' && t.url.includes('mp.weixin.qq.com'));

    if (!pageTarget) {
      const { targetId } = await cdp.send<{ targetId: string }>('Target.createTarget', { url: WECHAT_URL });
      pageTarget = { targetId, url: WECHAT_URL, type: 'page' };
    }

    let { sessionId } = await cdp.send<{ sessionId: string }>('Target.attachToTarget', { targetId: pageTarget.targetId, flatten: true });

    await cdp.send('Page.enable', {}, { sessionId });
    await cdp.send('Runtime.enable', {}, { sessionId });
    await cdp.send('DOM.enable', {}, { sessionId });

    console.log('[wechat-browser] Waiting for page load...');
    await sleep(3000);

    const checkLoginStatus = async (): Promise<boolean> => {
      const result = await cdp!.send<{ result: { value: string } }>('Runtime.evaluate', {
        expression: `window.location.href`,
        returnByValue: true,
      }, { sessionId });
      return result.result.value.includes('/cgi-bin/home');
    };

    const waitForLogin = async (): Promise<boolean> => {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        if (await checkLoginStatus()) return true;
        await sleep(2000);
      }
      return false;
    };

    let isLoggedIn = await checkLoginStatus();
    if (!isLoggedIn) {
      console.log('[wechat-browser] Not logged in. Please scan QR code to log in...');
      isLoggedIn = await waitForLogin();
      if (!isLoggedIn) throw new Error('Timed out waiting for login. Please log in first.');
    }
    console.log('[wechat-browser] Logged in.');

    await sleep(2000);

    console.log('[wechat-browser] Looking for "贴图" menu...');
    const menuResult = await cdp.send<{ result: { value: string } }>('Runtime.evaluate', {
      expression: `
        const menuItems = document.querySelectorAll('.new-creation__menu .new-creation__menu-item');
        const count = menuItems.length;
        const texts = Array.from(menuItems).map(m => m.querySelector('.new-creation__menu-title')?.textContent?.trim() || m.textContent?.trim() || '');
        JSON.stringify({ count, texts });
      `,
      returnByValue: true,
    }, { sessionId });
    console.log(`[wechat-browser] Menu items: ${menuResult.result.value}`);

    const getTargets = async () => {
      return await cdp!.send<{ targetInfos: Array<{ targetId: string; url: string; type: string }> }>('Target.getTargets');
    };

    const initialTargets = await getTargets();
    const initialIds = new Set(initialTargets.targetInfos.map(t => t.targetId));
    console.log(`[wechat-browser] Initial targets count: ${initialTargets.targetInfos.length}`);

    console.log('[wechat-browser] Finding "贴图" menu position...');
    const menuPos = await cdp.send<{ result: { value: string } }>('Runtime.evaluate', {
      expression: `
        (function() {
          const menuItems = document.querySelectorAll('.new-creation__menu .new-creation__menu-item');
          console.log('Found menu items:', menuItems.length);
          for (const item of menuItems) {
            const title = item.querySelector('.new-creation__menu-title');
            const text = title?.textContent?.trim() || '';
            console.log('Menu item text:', text);
            if (text === '图文' || text === '贴图') {
              item.scrollIntoView({ block: 'center' });
              const rect = item.getBoundingClientRect();
              console.log('Found 贴图，rect:', JSON.stringify(rect));
              return JSON.stringify({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, width: rect.width, height: rect.height });
            }
          }
          return 'null';
        })()
      `,
      returnByValue: true,
    }, { sessionId });
    console.log(`[wechat-browser] Menu position: ${menuPos.result.value}`);

    const pos = menuPos.result.value !== 'null' ? JSON.parse(menuPos.result.value) : null;
    if (!pos) throw new Error('贴图 menu not found or not visible');

    console.log('[wechat-browser] Clicking "贴图" menu with mouse events...');
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: pos.x,
      y: pos.y,
      button: 'left',
      clickCount: 1,
    }, { sessionId });
    await sleep(100);
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: pos.x,
      y: pos.y,
      button: 'left',
      clickCount: 1,
    }, { sessionId });

    console.log('[wechat-browser] Waiting for editor...');
    await sleep(3000);

    const waitForEditor = async (): Promise<{ targetId: string; isNewTab: boolean } | null> => {
      const start = Date.now();

      while (Date.now() - start < 30_000) {
        const targets = await getTargets();
        const pageTargets = targets.targetInfos.filter(t => t.type === 'page');

        for (const t of pageTargets) {
          console.log(`[wechat-browser] Target: ${t.url}`);
        }

        const newTab = pageTargets.find(t => !initialIds.has(t.targetId) && t.url.includes('mp.weixin.qq.com'));
        if (newTab) {
          console.log(`[wechat-browser] Found new tab: ${newTab.url}`);
          return { targetId: newTab.targetId, isNewTab: true };
        }

        const editorTab = pageTargets.find(t => t.url.includes('appmsg'));
        if (editorTab) {
          console.log(`[wechat-browser] Found editor tab: ${editorTab.url}`);
          return { targetId: editorTab.targetId, isNewTab: !initialIds.has(editorTab.targetId) };
        }

        const currentUrl = await cdp!.send<{ result: { value: string } }>('Runtime.evaluate', {
          expression: `window.location.href`,
          returnByValue: true,
        }, { sessionId });
        console.log(`[wechat-browser] Current page URL: ${currentUrl.result.value}`);

        if (currentUrl.result.value.includes('appmsg')) {
          console.log(`[wechat-browser] Current page navigated to editor`);
          return { targetId: pageTarget!.targetId, isNewTab: false };
        }

        await sleep(1000);
      }
      return null;
    };

    const editorInfo = await waitForEditor();
    if (!editorInfo) {
      const finalTargets = await getTargets();
      console.log(`[wechat-browser] Final targets: ${finalTargets.targetInfos.filter(t => t.type === 'page').map(t => t.url).join(', ')}`);
      throw new Error('Editor not found.');
    }

    if (editorInfo.isNewTab) {
      console.log('[wechat-browser] Switching to editor tab...');
      const editorSession = await cdp.send<{ sessionId: string }>('Target.attachToTarget', { targetId: editorInfo.targetId, flatten: true });
      sessionId = editorSession.sessionId;

      await cdp.send('Page.enable', {}, { sessionId });
      await cdp.send('Runtime.enable', {}, { sessionId });
      await cdp.send('DOM.enable', {}, { sessionId });
    } else {
      console.log('[wechat-browser] Editor opened in current page');
    }

    await cdp.send('Page.enable', {}, { sessionId });
    await cdp.send('Runtime.enable', {}, { sessionId });
    await cdp.send('DOM.enable', {}, { sessionId });

    await sleep(2000);

    console.log('[wechat-browser] Uploading all images at once...');
    const absolutePaths = images.map(p => path.isAbsolute(p) ? p : path.resolve(process.cwd(), p));
    console.log(`[wechat-browser] Images: ${absolutePaths.join(', ')}`);

    const { root } = await cdp.send<{ root: { nodeId: number } }>('DOM.getDocument', {}, { sessionId });

    // Try primary selector, then fallback to any multi-file image input
    let { nodeId } = await cdp.send<{ nodeId: number }>('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: '.js_upload_btn_container input[type=file]',
    }, { sessionId });

    if (!nodeId) {
      console.log('[wechat-browser] Primary file input not found, trying fallback selector...');
      const fallback = await cdp.send<{ nodeId: number }>('DOM.querySelector', {
        nodeId: root.nodeId,
        selector: 'input[type=file][multiple][accept*="image"]',
      }, { sessionId });
      nodeId = fallback.nodeId;
    }

    if (!nodeId) throw new Error('File input not found');

    await cdp.send('DOM.setFileInputFiles', {
      nodeId,
      files: absolutePaths,
    }, { sessionId });

    // Dispatch change event to trigger the upload
    await cdp.send('Runtime.evaluate', {
      expression: `
        const fileInput = document.querySelector('.js_upload_btn_container input[type=file]') || document.querySelector('input[type=file][multiple][accept*="image"]');
        if (fileInput) fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      `,
    }, { sessionId });

    // Wait for images to upload
    console.log('[wechat-browser] Waiting for images to upload...');
    const targetCount = absolutePaths.length;
    for (let i = 0; i < 30; i++) {
      await sleep(2000);
      const uploadCheck = await cdp.send<{ result: { value: string } }>('Runtime.evaluate', {
        expression: `JSON.stringify({ uploaded: document.querySelectorAll('.weui-desktop-upload__thumb, .pic_item, [class*=upload_thumb]').length })`,
        returnByValue: true,
      }, { sessionId });
      const status = JSON.parse(uploadCheck.result.value);
      console.log(`[wechat-browser] Upload progress: ${status.uploaded}/${targetCount}`);
      if (status.uploaded >= targetCount) break;
    }

    console.log('[wechat-browser] Filling title...');
    await cdp.send('Runtime.evaluate', {
      expression: `
        const titleInput = document.querySelector('#title');
        if (titleInput) {
          titleInput.value = ${JSON.stringify(title)};
          titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          throw new Error('Title input not found');
        }
      `,
    }, { sessionId });
    await sleep(500);

    console.log('[wechat-browser] Filling content...');
    // Try ProseMirror editor first (new WeChat UI), then fallback to old editor
    const contentResult = await cdp.send<{ result: { value: string } }>('Runtime.evaluate', {
      expression: `
        (function() {
          const contentHtml = ${JSON.stringify('<p>' + content.split('\n').filter(l => l.trim()).join('</p><p>') + '</p>')};

          // New UI: ProseMirror contenteditable
          const pm = document.querySelector('.ProseMirror[contenteditable=true]');
          if (pm) {
            pm.innerHTML = contentHtml;
            pm.dispatchEvent(new Event('input', { bubbles: true }));
            return 'ProseMirror: content set, length=' + pm.textContent.length;
          }

          // Old UI: .js_pmEditorArea
          const oldEditor = document.querySelector('.js_pmEditorArea');
          if (oldEditor) {
            return JSON.stringify({ type: 'old', x: oldEditor.getBoundingClientRect().x + 50, y: oldEditor.getBoundingClientRect().y + 20 });
          }

          return 'editor_not_found';
        })()
      `,
      returnByValue: true,
    }, { sessionId });

    const contentStatus = contentResult.result.value;
    console.log(`[wechat-browser] Content result: ${contentStatus}`);

    if (contentStatus === 'editor_not_found') {
      throw new Error('Content editor not found');
    }

    // Fallback: old editor uses keyboard simulation
    if (contentStatus.startsWith('{')) {
      const editorClickPos = JSON.parse(contentStatus);
      if (editorClickPos.type === 'old') {
        console.log('[wechat-browser] Using old editor with keyboard simulation...');
        await cdp.send('Input.dispatchMouseEvent', {
          type: 'mousePressed',
          x: editorClickPos.x,
          y: editorClickPos.y,
          button: 'left',
          clickCount: 1,
        }, { sessionId });
        await sleep(50);
        await cdp.send('Input.dispatchMouseEvent', {
          type: 'mouseReleased',
          x: editorClickPos.x,
          y: editorClickPos.y,
          button: 'left',
          clickCount: 1,
        }, { sessionId });
        await sleep(300);

        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line!.length > 0) {
            await cdp.send('Input.insertText', { text: line }, { sessionId });
          }
          if (i < lines.length - 1) {
            await cdp.send('Input.dispatchKeyEvent', {
              type: 'keyDown',
              key: 'Enter',
              code: 'Enter',
              windowsVirtualKeyCode: 13,
            }, { sessionId });
            await cdp.send('Input.dispatchKeyEvent', {
              type: 'keyUp',
              key: 'Enter',
              code: 'Enter',
              windowsVirtualKeyCode: 13,
            }, { sessionId });
          }
          await sleep(50);
        }
        console.log('[wechat-browser] Content typed via keyboard.');
      }
    }
    await sleep(500);

    if (submit) {
      console.log('[wechat-browser] Saving as draft...');
      const submitResult = await cdp.send<{ result: { value: string } }>('Runtime.evaluate', {
        expression: `
          (function() {
            // Try new UI: find button by text
            const allBtns = document.querySelectorAll('button');
            for (const btn of allBtns) {
              const text = btn.textContent?.trim();
              if (text === '保存为草稿') {
                btn.click();
                return 'clicked:保存为草稿';
              }
            }
            // Fallback: old UI selector
            const oldBtn = document.querySelector('#js_submit');
            if (oldBtn) {
              oldBtn.click();
              return 'clicked:#js_submit';
            }
            // List available buttons for debugging
            const btnTexts = [];
            allBtns.forEach(b => {
              const t = b.textContent?.trim();
              if (t && t.length < 20) btnTexts.push(t);
            });
            return 'not_found:' + btnTexts.join(',');
          })()
        `,
        returnByValue: true,
      }, { sessionId });
      console.log(`[wechat-browser] Submit result: ${submitResult.result.value}`);
      await sleep(3000);

      // Verify save success by checking for toast
      const toastCheck = await cdp.send<{ result: { value: string } }>('Runtime.evaluate', {
        expression: `
          const toasts = document.querySelectorAll('.weui-desktop-toast, [class*=toast]');
          const msgs = [];
          toasts.forEach(t => { const text = t.textContent?.trim(); if (text) msgs.push(text); });
          JSON.stringify(msgs);
        `,
        returnByValue: true,
      }, { sessionId });
      console.log(`[wechat-browser] Toast messages: ${toastCheck.result.value}`);
      console.log('[wechat-browser] Draft saved!');
    } else {
      console.log('[wechat-browser] Article composed (preview mode). Add --submit to save as draft.');
    }
  } finally {
    if (cdp) {
      cdp.close();
    }
    console.log('[wechat-browser] Done. Browser window left open.');
  }
}

function printUsage(): never {
  console.log(`Post image-text (贴图) to WeChat Official Account

Usage:
  npx -y bun wechat-browser.ts [options]

Options:
  --markdown <path>  Markdown file for title/content extraction
  --images <dir>     Directory containing images (PNG/JPG)
  --title <text>     Article title (max 20 chars, auto-compressed)
  --content <text>   Article content (max 1000 chars, auto-compressed)
  --image <path>     Add image (can be repeated)
  --submit           Save as draft (default: preview only)
  --profile <dir>    Chrome profile directory
  --help             Show this help

Examples:
  npx -y bun wechat-browser.ts --markdown article.md --images ./photos/
  npx -y bun wechat-browser.ts --title "测试" --content "内容" --image ./photo.png
  npx -y bun wechat-browser.ts --markdown article.md --images ./photos/ --submit
`);
  process.exit(0);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) printUsage();

  const images: string[] = [];
  let submit = false;
  let profileDir: string | undefined;
  let title: string | undefined;
  let content: string | undefined;
  let markdownFile: string | undefined;
  let imagesDir: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === '--image' && args[i + 1]) {
      images.push(args[++i]!);
    } else if (arg === '--images' && args[i + 1]) {
      imagesDir = args[++i];
    } else if (arg === '--title' && args[i + 1]) {
      title = args[++i];
    } else if (arg === '--content' && args[i + 1]) {
      content = args[++i];
    } else if (arg === '--markdown' && args[i + 1]) {
      markdownFile = args[++i];
    } else if (arg === '--submit') {
      submit = true;
    } else if (arg === '--profile' && args[i + 1]) {
      profileDir = args[++i];
    }
  }

  if (!markdownFile && !title) {
    console.error('Error: --title or --markdown is required');
    process.exit(1);
  }
  if (!markdownFile && !content) {
    console.error('Error: --content or --markdown is required');
    process.exit(1);
  }
  if (images.length === 0 && !imagesDir) {
    console.error('Error: --image or --images is required');
    process.exit(1);
  }

  await postToWeChat({ title, content, images: images.length > 0 ? images : undefined, imagesDir, markdownFile, submit, profileDir });
}

await main().catch((err) => {
  console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
