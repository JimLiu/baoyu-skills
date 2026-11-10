// Gemini Web UI driver — drives the real gemini.google.com page over CDP.
//
// Why this exists: the reverse-engineered API channel (`main.ts`) speaks a
// protocol Google can (and did) change; when it drifts, text generation breaks.
// The real page always speaks the current protocol, so driving it is the
// resilient path for TEXT generation. Image generation stays on `main.ts`.
//
// It shares the skill's Chrome profile and consent gate (see SKILL.md).
// First-time use: run once with `--show-window` and sign in to your Google
// account in the window that opens.
//
// Usage:
//   bun gemini-webui.ts --promptfiles <file...> [--sessionId <id>] [--timeout <sec>] [--json] [--show-window]
//   echo "prompt" | bun gemini-webui.ts
//
// Text-only by design: no `--model` (submits through the web UI, so the model
// the page has selected applies — the account default when signed in), no
// `--image`, no `--reference`.
//
// Sessions: without a signed-in profile the web app runs anonymously — chats
// work but are not saved, so each call starts a new conversation and
// --sessionId only records the chat URL. With a signed-in profile, the same
// --sessionId re-opens the saved conversation for multi-turn continuation; if
// the app drops the thread (deleted chat, anonymous mode), the driver
// proceeds on a fresh chat and re-maps the session id.
import { spawnSync, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  CdpConnection,
  findChromeExecutable,
  findExistingChromeDebugPort,
  getFreePort,
  gracefulKillChrome,
  launchChrome,
  openPageSession,
  sleep,
  waitForChromeDebugPort,
  type PlatformCandidates,
} from 'baoyu-chrome-cdp';
import { resolveGeminiWebChromeProfileDir, resolveGeminiWebDataDir } from './gemini-webapi/utils/index.js';

const GEMINI_APP_URL = 'https://gemini.google.com/app';
const EDITOR_SELECTOR = 'rich-textarea .ql-editor, div[contenteditable="true"]';

// Same table `load-browser-cookies.ts` uses, so both channels find the same browsers.
const CHROME_CANDIDATES: PlatformCandidates = {
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ],
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ],
  default: [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    '/usr/bin/microsoft-edge',
  ],
};

const USAGE = `Usage:
  bun gemini-webui.ts --promptfiles <files...> [options]
  echo "prompt" | bun gemini-webui.ts

Drives the real gemini.google.com page via CDP for TEXT generation.
Image generation is not supported here; use main.ts.

Options:
  --promptfiles <files...>  Prompt from one or more files (concatenated in order)
  --sessionId <id>          Resume the conversation stored under this id
  --timeout <sec>           Max seconds to wait for the answer (default: 480)
  --json                    Emit JSON (same "text" field as main.ts --json)
  --show-window             Show the Chrome window (default: headless)
  --profile-dir <path>      Chrome profile directory (same as main.ts)
  --help, -h                Show this help
`;

type CliArgs = {
  promptfiles: string[];
  sessionId: string | null;
  timeout: number;
  json: boolean;
  showWindow: boolean;
};

function parseArgs(): CliArgs {
  const out: CliArgs = { promptfiles: [], sessionId: null, timeout: 480, json: false, showWindow: false };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === '--promptfiles') {
      // Variadic, matches main.ts: consumes every following non-flag value.
      const start = out.promptfiles.length;
      let j = i + 1;
      while (j < argv.length && !argv[j]!.startsWith('-')) {
        out.promptfiles.push(argv[j]!);
        j++;
      }
      if (out.promptfiles.length === start) throw new Error('Missing files for --promptfiles');
      i = j - 1;
    } else if (arg === '--sessionId') {
      const v = argv[++i];
      if (!v) throw new Error('Missing value for --sessionId');
      out.sessionId = v;
    } else if (arg === '--timeout') {
      const v = Number(argv[++i]);
      if (!Number.isFinite(v) || v <= 0) throw new Error('Invalid value for --timeout (expected seconds > 0)');
      out.timeout = v;
    } else if (arg === '--json') {
      out.json = true;
    } else if (arg === '--show-window') {
      out.showWindow = true;
    } else if (arg === '--profile-dir') {
      // Bridge to the shared resolver, same approach as main.ts for --cookie-path.
      const v = argv[++i];
      if (!v) throw new Error('Missing value for --profile-dir');
      process.env.BAOYU_CHROME_PROFILE_DIR = v;
    } else if (arg === '--help' || arg === '-h') {
      console.log(USAGE);
      process.exit(0);
    } else {
      throw new Error(`Unknown option: ${arg}\n\n${USAGE}`);
    }
  }
  return out;
}

// ---------- session map (conversation URL per --sessionId) ----------

function loadSessionMap(file: string): Record<string, string> {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeSessionMap(file: string, map: Record<string, string>): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(map, null, 2), { mode: 0o600 });
  fs.chmodSync(tmp, 0o600);
  fs.renameSync(tmp, file);
}

function saveSessionMap(file: string, update: Record<string, string>): void {
  writeSessionMap(file, { ...loadSessionMap(file), ...update });
}

// ---------- headless user agent ----------
// The HeadlessChrome UA token is a known bot signal on gemini.google.com, so in
// headless mode we present the platform-standard UA. The version is read from
// the browser itself (`--version`) rather than hardcoded, so it does not go stale.
function chromeVersion(chromePath: string): string {
  try {
    const r = spawnSync(chromePath, ['--version'], { encoding: 'utf8', timeout: 5000 });
    const m = String(r.stdout ?? '').match(/\d+\.\d+\.\d+\.\d+/);
    if (m) return m[0];
  } catch {}
  return '131.0.0.0'; // fallback; any recent version beats the HeadlessChrome token
}

function headlessUserAgent(chromePath: string): string {
  const version = chromeVersion(chromePath);
  const base = `AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36`;
  const platform = process.platform === 'darwin'
    ? 'Macintosh; Intel Mac OS X 10_15_7'
    : process.platform === 'win32'
      ? 'Windows NT 10.0; Win64; x64'
      : 'X11; Linux x86_64';
  return `Mozilla/5.0 (${platform}) ${base}`;
}

// ---------- main ----------

async function main(): Promise<void> {
  const args = parseArgs();

  let prompt = args.promptfiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n\n');
  if (!prompt.trim()) {
    // Align with main.ts: accept the prompt on stdin when stdin is not a TTY.
    prompt = process.stdin.isTTY ? '' : await Bun.stdin.text().catch(() => '');
  }
  if (!prompt.trim()) {
    console.error(USAGE);
    process.exit(1);
  }

  const profileDir = resolveGeminiWebChromeProfileDir();
  const sessionMapFile = path.join(resolveGeminiWebDataDir(), 'webui-sessions.json');

  // The profile is single-instance: if a Chrome for this profile is already
  // running, spawning another would just hand off and exit. Reuse its port.
  let chrome: ChildProcess | null = null;
  let port = await findExistingChromeDebugPort({ profileDir });
  if (port === null) {
    port = await getFreePort();
    const chromePath = findChromeExecutable({ candidates: CHROME_CANDIDATES, envNames: ['GEMINI_WEB_CHROME_PATH'] });
    if (!chromePath) {
      throw new Error(
        'Chrome executable not found. Install Chrome/Chromium/Edge, or set GEMINI_WEB_CHROME_PATH to its path.',
      );
    }
    const extraArgs = ['--window-size=1400,1000'];
    const headless = !args.showWindow;
    if (headless) {
      // Strip the HeadlessChrome token; see headlessUserAgent above.
      extraArgs.push('--disable-gpu', '--window-position=-32000,-32000', `--user-agent=${headlessUserAgent(chromePath)}`);
    }
    chrome = await launchChrome({ chromePath, profileDir, port, headless, extraArgs });
    // A headless Chrome holding the signed-in profile must not leak on Ctrl-C.
    const killChromeAndExit = (code: number) => {
      try {
        chrome?.kill('SIGKILL');
      } catch {}
      process.exit(code);
    };
    process.on('SIGINT', () => killChromeAndExit(130));
    process.on('SIGTERM', () => killChromeAndExit(143));
  }

  let cdp: CdpConnection | null = null;
  let targetId: string | null = null;
  try {
    const exitedEarly = new Promise<never>((_, reject) => {
      chrome?.once('exit', () => {
        reject(
          new Error(
            `Chrome exited immediately. Another Chrome instance may be holding the profile: ${profileDir}`,
          ),
        );
      });
    });
    exitedEarly.catch(() => {}); // silence the losing branch of the race below
    const wsUrl = await Promise.race([
      waitForChromeDebugPort(port, 30_000, { includeLastError: true }),
      exitedEarly,
    ]);
    cdp = await CdpConnection.connect(wsUrl, 15_000, { defaultTimeoutMs: 60_000 });

    const sessionMap = loadSessionMap(sessionMapFile);
    const resumedUrl = args.sessionId ? sessionMap[args.sessionId] : undefined;

    // Always open a fresh tab on the target URL (reusing: true), so a shared
    // browser never has a tab fight over the active conversation.
    const page = await openPageSession({
      cdp,
      reusing: true,
      url: resumedUrl ?? GEMINI_APP_URL,
      matchTarget: () => false,
      enablePage: true,
      enableRuntime: true,
    });
    targetId = page.targetId;

    type EvalResult = { result?: { value?: unknown }; exceptionDetails?: { exception?: { description?: string } } };
    const evalJs = async (expression: string): Promise<unknown> => {
      const r = await cdp!.send<EvalResult>(
        'Runtime.evaluate',
        { expression, returnByValue: true, awaitPromise: true },
        { sessionId: page.sessionId },
      );
      if (r.exceptionDetails) {
        throw new Error(r.exceptionDetails.exception?.description ?? 'Page script evaluation failed.');
      }
      return r.result?.value;
    };

    const composerReady = async (): Promise<boolean> =>
      Boolean(await evalJs(`!!document.querySelector('${EDITOR_SELECTOR}')`).catch(() => false));

    const waitComposer = async (): Promise<void> => {
      const deadline = Date.now() + 60_000;
      while (Date.now() < deadline) {
        if (await composerReady()) return;
        const loc = String((await evalJs('location.href').catch(() => '')) ?? '');
        if (loc.includes('accounts.google') || loc.includes('ServiceLogin')) {
          throw new Error(
            'NEED_LOGIN: not signed in. Run once with --show-window and sign in to your Google account in the window that opens.',
          );
        }
        await sleep(1500);
      }
      throw new Error('Gemini composer did not appear (not signed in, or the page structure changed).');
    };

    await waitComposer();

    // Resumed conversations: confirm the app is still on the saved thread and
    // give its history time to bind before typing. A redirect to the bare
    // /app URL means the chat is gone; typing before the history binds would
    // silently start a NEW chat while still believing we resumed.
    const resumedId = resumedUrl ? (resumedUrl.split('/app/')[1] ?? null) : null;
    if (resumedId) {
      const bindDeadline = Date.now() + 10_000;
      let bound = false;
      while (Date.now() < bindDeadline) {
        const loc = String((await evalJs('location.href').catch(() => '')) ?? '');
        if (!loc.includes(resumedId)) break;
        const historyTurns = Number(
          (await evalJs(`document.querySelectorAll('user-query').length`).catch(() => 0)) ?? 0,
        );
        if (historyTurns > 0) {
          bound = true;
          break;
        }
        await sleep(1000);
      }
      if (!bound) {
        // Stale conversation (deleted or redirected): drop the mapping and
        // continue on the fresh chat we are now on; the mapping re-saves with
        // the new URL after this run answers.
        const map = loadSessionMap(sessionMapFile);
        if (args.sessionId) delete map[args.sessionId];
        writeSessionMap(sessionMapFile, map);
      }
    }

    // Clear any leftover editor text, then type the prompt in chunks.
    await evalJs(`
      (() => {
        const el = document.querySelector('${EDITOR_SELECTOR}');
        el.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        return true;
      })()
    `);
    const insertChunk = async (chunk: string): Promise<void> => {
      await evalJs(`
        (() => {
          const el = document.querySelector('${EDITOR_SELECTOR}');
          el.focus();
          document.execCommand('insertText', false, ${JSON.stringify(chunk)});
          return true;
        })()
      `);
    };
    for (let i = 0; i < prompt.length;) {
      let end = Math.min(i + 2000, prompt.length);
      // Keep surrogate pairs (emoji, rare CJK) intact across chunk boundaries.
      if (end < prompt.length) {
        const code = prompt.charCodeAt(end - 1);
        if (code >= 0xd800 && code < 0xdc00) end -= 1;
      }
      await insertChunk(prompt.slice(i, end));
      i = end;
    }
    // Quill normalizes block boundaries, so innerText length only needs to be
    // in the same ballpark — this catches wholesale truncation without false
    // positives on newline normalization.
    const insertedLen = Number((await evalJs(`document.querySelector('${EDITOR_SELECTOR}').innerText.length`).catch(() => 0)) ?? 0);
    if (insertedLen > 0 && insertedLen < Math.floor(prompt.trim().length / 2)) {
      throw new Error(
        `Composer accepted only part of the prompt (${insertedLen} of ${prompt.length} chars). Try a shorter prompt.`,
      );
    }

    // Remember how many turns exist so we only read the NEW answer. Wait for
    // our own user-query to render first: history renders top-down, so once
    // our turn is visible every earlier response is in the DOM too (matters
    // for resumed conversations whose history loads lazily).
    const countElements = (selector: string): Promise<number> =>
      evalJs(`document.querySelectorAll('${selector}').length`).then(Number).catch(() => -1);

    const userTurnsBefore = await countElements('user-query');
    if (userTurnsBefore < 0) {
      throw new Error('Cannot read the conversation state (the page structure may have changed).');
    }

    let sent = false;
    const sendDeadline = Date.now() + 5000;
    while (Date.now() < sendDeadline && !sent) {
      sent = Boolean(
        await evalJs(`
          (() => {
            const btn = document.querySelector(
              'button[aria-label*="发送"], button[aria-label*="Send" i], button:has(mat-icon[fonticon="send"]), button.send-button'
            );
            if (btn && !btn.disabled) { btn.click(); return true; }
            return false;
          })()
        `).catch(() => false),
      );
      if (!sent) await sleep(250);
    }
    if (!sent) {
      await cdp!.send(
        'Input.dispatchKeyEvent',
        { type: 'keyDown', windowsVirtualKeyCode: 13, key: 'Enter', code: 'Enter', text: '\r' },
        { sessionId: page.sessionId },
      );
      await cdp!.send(
        'Input.dispatchKeyEvent',
        { type: 'keyUp', windowsVirtualKeyCode: 13, key: 'Enter', code: 'Enter' },
        { sessionId: page.sessionId },
      );
    }

    const turnsDeadline = Date.now() + 30_000;
    let userTurns = userTurnsBefore;
    while (Date.now() < turnsDeadline) {
      userTurns = await countElements('user-query');
      if (userTurns > userTurnsBefore) break;
      await sleep(1000);
    }
    if (userTurns <= userTurnsBefore) {
      throw new Error('Prompt was not submitted (no new turn appeared).');
    }

    const responsesBefore = await countElements('model-response');
    const hardDeadline = Date.now() + args.timeout * 1000;
    let lastText = '';
    let stableCount = 0;
    while (Date.now() < hardDeadline) {
      await sleep(3000);
      const state = await evalJs(`
        (() => {
          const all = document.querySelectorAll('model-response');
          if (all.length <= ${responsesBefore}) return JSON.stringify({ n: all.length });
          const t = all[all.length - 1].innerText || '';
          return JSON.stringify({ n: all.length, t });
        })()
      `).catch(() => undefined);
      if (!state) continue;
      const parsed = JSON.parse(String(state)) as { n: number; t?: string };
      if (parsed.t === undefined) continue;
      if (parsed.t === lastText && parsed.t.trim().length > 0) {
        stableCount++;
        if (stableCount >= 4) {
          lastText = parsed.t;
          break;
        }
      } else {
        stableCount = 0;
        lastText = parsed.t;
      }
    }
    if (!lastText.trim()) {
      throw new Error('No response captured (timeout, or the page structure changed).');
    }

    // Persist the conversation URL for multi-turn continuation.
    if (args.sessionId) {
      const loc = String((await evalJs('location.href').catch(() => '')) ?? '');
      if (/gemini\.google\.com\/app\/[0-9a-f]/.test(loc)) {
        saveSessionMap(sessionMapFile, { [args.sessionId]: loc });
      }
    }

    if (args.json) {
      // Same primary "text" field as main.ts --json, so downstream consumers
      // can switch channels without changes.
      console.log(
        JSON.stringify(
          { text: lastText, candidates: [], metadata: { via: 'webui' }, sessionId: args.sessionId },
          null,
          2,
        ),
      );
    } else {
      console.log(lastText);
    }
  } finally {
    if (cdp) cdp.close();
    if (chrome) {
      // We spawned this browser: shut it down so the profile is released.
      await gracefulKillChrome(chrome, port);
    } else if (cdp && targetId) {
      // Attached to an existing browser: just close the tab we opened.
      await cdp.send('Target.closeTarget', { targetId }).catch(() => {});
    }
  }
}

main().catch((error) => {
  console.error(String(error?.message ?? error));
  process.exit(1);
});
