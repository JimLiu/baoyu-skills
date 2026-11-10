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
import { createHash } from 'node:crypto';
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

// ---------- session store (conversation URL per --sessionId) ----------
// One file per session id: concurrent invocations with different ids cannot
// clobber each other the way a single shared JSON map would (read-modify-
// write races silently drop the other run's URL).

function legacySessionMapFile(dataDir: string): string {
  return path.join(dataDir, 'webui-sessions.json');
}

function sessionUrlFile(dataDir: string, id: string): string {
  // Hash instead of sanitize: character replacement is not injective (`a/b`
  // and `a?b` both collapse to `a_b`), and case-only ids collide on the
  // case-insensitive filesystems of macOS and Windows. A hex digest maps
  // every distinct id to its own file, so one session can never resume and
  // then overwrite another's conversation URL.
  const digest = createHash('sha256').update(id, 'utf8').digest('hex');
  return path.join(dataDir, 'webui-sessions', `${digest}.json`);
}

function processExists(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// Serialize invocations on the same Chrome profile: a second run would
// otherwise discover and attach to the browser the first run spawned, and the
// first run's cleanup kills that browser out from under it. Invocations queue
// on a lock file; a crashed run leaves a stale pid that the next run detects
// and breaks.
async function acquireInvokeLock(file: string, timeoutMs: number): Promise<void> {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    let fd: number | undefined;
    try {
      fd = fs.openSync(file, 'wx', 0o600);
      fs.writeFileSync(fd, String(process.pid));
      fs.closeSync(fd);
      return;
    } catch {
      if (fd !== undefined) {
        try {
          fs.closeSync(fd);
        } catch {}
      }
      try {
        const holderPid = Number(fs.readFileSync(file, 'utf8').trim());
        if (Number.isInteger(holderPid) && holderPid > 0 && !processExists(holderPid)) {
          fs.rmSync(file, { force: true });
          continue;
        }
      } catch {}
      if (Date.now() > deadline) {
        throw new Error(
          `Another gemini-webui invocation is holding ${file}. Wait for it to finish, or remove the stale lock file.`,
        );
      }
      await sleep(250);
    }
  }
}

function loadSessionUrl(dataDir: string, id: string): string | undefined {
  try {
    const parsed = JSON.parse(fs.readFileSync(sessionUrlFile(dataDir, id), 'utf8')) as { url?: unknown };
    if (typeof parsed?.url === 'string' && parsed.url) return parsed.url;
  } catch {}
  // Migration: per-session files were briefly written under a sanitized name
  // before the digest encoding; read that file, but never trust it for saves.
  try {
    const legacyPerSession = path.join(
      dataDir,
      'webui-sessions',
      `${id.replace(/[^A-Za-z0-9._-]/g, '_')}.json`,
    );
    const parsed = JSON.parse(fs.readFileSync(legacyPerSession, 'utf8')) as { url?: unknown };
    if (typeof parsed?.url === 'string' && parsed.url) return parsed.url;
  } catch {}
  // Migration: fall back to the pre-per-session shared map file.
  try {
    const map = JSON.parse(fs.readFileSync(legacySessionMapFile(dataDir), 'utf8')) as Record<string, unknown>;
    const url = map[id];
    if (typeof url === 'string' && url) return url;
  } catch {}
  return undefined;
}

function saveSessionUrl(dataDir: string, id: string, url: string): void {
  const file = sessionUrlFile(dataDir, id);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify({ url }, null, 2), { mode: 0o600 });
  fs.chmodSync(tmp, 0o600);
  fs.renameSync(tmp, file);
}

function deleteSessionUrl(dataDir: string, id: string): void {
  fs.rmSync(sessionUrlFile(dataDir, id), { force: true });
  // Best-effort scrub of the legacy shared map (migration window only).
  try {
    const file = legacySessionMapFile(dataDir);
    const map = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>;
    if (id in map) {
      delete map[id];
      fs.writeFileSync(file, JSON.stringify(map, null, 2));
    }
  } catch {}
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
  const dataDir = resolveGeminiWebDataDir();
  const { sessionId } = args;

  // The profile is single-instance: if a Chrome for this profile is already
  // running, spawning another would just hand off and exit. Serialize whole
  // invocations on a lock file so a later run never attaches to a browser
  // the earlier run will shut down when it finishes.
  const lockFile = path.join(dataDir, 'webui-invoke.lock');
  await acquireInvokeLock(lockFile, 10 * 60_000);
  let lockHeld = true;

  // The profile is single-instance: if a Chrome for this profile is already
  // running, spawning another would just hand off and exit. Reuse its port.
  let chrome: ChildProcess | null = null;
  let port = await findExistingChromeDebugPort({ profileDir });
  const reusedBrowser = port !== null;
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
  }

  // A headless Chrome holding the signed-in profile must not leak on Ctrl-C —
  // including when this run attached to an already-running browser (the
  // spawned-browser branch above is skipped there, so install the handlers
  // unconditionally and close our own tab on the way out).
  let cleanupDone = false;
  const killChromeAndExit = (code: number) => {
    if (cleanupDone) return;
    cleanupDone = true;
    try {
      chrome?.kill('SIGKILL');
    } catch {}
    process.exit(code);
  };
  process.on('SIGINT', () => killChromeAndExit(130));
  process.on('SIGTERM', () => killChromeAndExit(143));

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

    const resumedUrl = sessionId ? loadSessionUrl(dataDir, sessionId) : undefined;

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
      // With --show-window the user may be signing in right now (that is the
      // documented recovery for a signed-out profile): give the login flow
      // time instead of tearing the window down while they type credentials.
      const deadline = Date.now() + (args.showWindow ? 300_000 : 60_000);
      let hintShown = false;
      while (Date.now() < deadline) {
        if (await composerReady()) return;
        const loc = String((await evalJs('location.href').catch(() => '')) ?? '');
        if (loc.includes('accounts.google') || loc.includes('ServiceLogin')) {
          if (!args.showWindow) {
            throw new Error(
              'NEED_LOGIN: not signed in. Run once with --show-window and sign in to your Google account in the window that opens.',
            );
          }
          if (!hintShown) {
            console.error('Waiting for sign-in: complete the Google login in the opened window (up to 5 minutes).');
            hintShown = true;
          }
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
        if (sessionId) deleteSessionUrl(dataDir, sessionId);
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

    // A resumed conversation renders its history lazily; sampling the baseline
    // while `<user-query>` nodes are still being inserted would make the
    // turn-index below land on a historical turn and return an old answer.
    // Wait until the count stops changing before submitting.
    let settledTurns = userTurnsBefore;
    const settleDeadline = Date.now() + 15_000;
    while (Date.now() < settleDeadline) {
      await sleep(1000);
      const n = await countElements('user-query');
      if (n < 0) continue;
      if (n === settledTurns) break;
      settledTurns = n;
    }
    const historyBaseline = settledTurns;

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
    let userTurns = historyBaseline;
    while (Date.now() < turnsDeadline) {
      userTurns = await countElements('user-query');
      if (userTurns > historyBaseline) break;
      await sleep(1000);
    }
    if (userTurns <= historyBaseline) {
      throw new Error('Prompt was not submitted (no new turn appeared).');
    }

    // Our answer is the response paired with our turn: the Nth user-query
    // pairs with the Nth model-response. The baseline above was sampled only
    // after history settled, so userTurns - 1 is our submitted turn's index —
    // not a historical node that merely arrived during lazy rendering.
    const ourResponseIndex = userTurns - 1;
    const hardDeadline = Date.now() + args.timeout * 1000;
    let lastText = '';
    let stableCount = 0;
    while (Date.now() < hardDeadline) {
      await sleep(3000);
      const state = await evalJs(`
        (() => {
          const all = document.querySelectorAll('model-response');
          if (all.length <= ${ourResponseIndex}) return JSON.stringify({ n: all.length });
          const t = all[${ourResponseIndex}].innerText || '';
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
    if (sessionId) {
      const loc = String((await evalJs('location.href').catch(() => '')) ?? '');
      if (/gemini\.google\.com\/app\/[0-9a-f]/.test(loc)) {
        saveSessionUrl(dataDir, sessionId, loc);
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
    cleanupDone = true;
    if (cdp && targetId) {
      // Close just the tab we opened, while the connection is still alive —
      // after cdp.close() this send fails silently and the tab leaks into
      // the browser (ours or the user's running one).
      await cdp.send('Target.closeTarget', { targetId }).catch(() => {});
    }
    if (cdp) cdp.close();
    if (chrome) {
      // We spawned this browser: shut it down so the profile is released.
      await gracefulKillChrome(chrome, port);
    }
    if (lockHeld) {
      try {
        fs.rmSync(lockFile, { force: true });
      } catch {}
      lockHeld = false;
    }
  }
}

main().catch((error) => {
  console.error(String(error?.message ?? error));
  process.exit(1);
});
