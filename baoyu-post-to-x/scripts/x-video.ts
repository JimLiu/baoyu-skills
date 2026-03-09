import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  CHROME_CANDIDATES_FULL,
  CdpConnection,
  findChromeExecutable,
  getDefaultProfileDir,
  getFreePort,
  sleep,
  waitForChromeDebugPort,
} from './x-utils.js';

const X_COMPOSE_URL = 'https://x.com/compose/post';

interface XVideoOptions {
  text?: string;
  videoPath: string;
  submit?: boolean;
  timeoutMs?: number;
  profileDir?: string;
  chromePath?: string;
}

export async function postVideoToX(options: XVideoOptions): Promise<void> {
  const { text, videoPath, submit = false, timeoutMs = 120_000, profileDir = getDefaultProfileDir() } = options;

  const chromePath = options.chromePath ?? findChromeExecutable(CHROME_CANDIDATES_FULL);
  if (!chromePath) throw new Error('Chrome not found. Set X_BROWSER_CHROME_PATH env var.');

  if (!fs.existsSync(videoPath)) throw new Error(`Video not found: ${videoPath}`);

  const absVideoPath = path.resolve(videoPath);
  console.log(`[x-video] Video: ${absVideoPath}`);

  await mkdir(profileDir, { recursive: true });

  const port = await getFreePort();
  console.log(`[x-video] Launching Chrome (profile: ${profileDir})`);

  const chrome = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-blink-features=AutomationControlled',
    '--start-maximized',
    X_COMPOSE_URL,
  ], { stdio: 'ignore' });

  let cdp: CdpConnection | null = null;

  try {
    const wsUrl = await waitForChromeDebugPort(port, 30_000, { includeLastError: true });
    cdp = await CdpConnection.connect(wsUrl, 30_000, { defaultTimeoutMs: 30_000 });

    const targets = await cdp.send<{ targetInfos: Array<{ targetId: string; url: string; type: string }> }>('Target.getTargets');
    let pageTarget = targets.targetInfos.find((t) => t.type === 'page' && t.url.includes('x.com'));

    if (!pageTarget) {
      const { targetId } = await cdp.send<{ targetId: string }>('Target.createTarget', { url: X_COMPOSE_URL });
      pageTarget = { targetId, url: X_COMPOSE_URL, type: 'page' };
    }

    const { sessionId } = await cdp.send<{ sessionId: string }>('Target.attachToTarget', { targetId: pageTarget.targetId, flatten: true });

    await cdp.send('Page.enable', {}, { sessionId });
    await cdp.send('Runtime.enable', {}, { sessionId });
    await cdp.send('DOM.enable', {}, { sessionId });
    await cdp.send('Input.setIgnoreInputEvents', { ignore: false }, { sessionId });

    console.log('[x-video] Waiting for X editor...');
    await sleep(3000);

    const waitForEditor = async (): Promise<boolean> => {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const result = await cdp!.send<{ result: { value: boolean } }>('Runtime.evaluate', {
          expression: `!!document.querySelector('[data-testid="tweetTextarea_0"]')`,
          returnByValue: true,
        }, { sessionId });
        if (result.result.value) return true;
        await sleep(1000);
      }
      return false;
    };

    const editorFound = await waitForEditor();
    if (!editorFound) {
      console.log('[x-video] Editor not found. Please log in to X in the browser window.');
      console.log('[x-video] Waiting for login...');
      const loggedIn = await waitForEditor();
      if (!loggedIn) throw new Error('Timed out waiting for X editor. Please log in first.');
    }

    // Upload video FIRST (before typing text to avoid text being cleared)
    console.log('[x-video] Uploading video...');

    const { root } = await cdp.send<{ root: { nodeId: number } }>('DOM.getDocument', {}, { sessionId });
    const { nodeId } = await cdp.send<{ nodeId: number }>('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: 'input[type="file"][accept*="video"], input[data-testid="fileInput"], input[type="file"]',
    }, { sessionId });

    if (!nodeId || nodeId === 0) {
      throw new Error('Could not find file input for video upload.');
    }

    await cdp.send('DOM.setFileInputFiles', {
      nodeId,
      files: [absVideoPath],
    }, { sessionId });
    console.log('[x-video] Video file set, uploading in background...');

    // Wait a moment for upload to start, then type text while video processes
    await sleep(2000);

    // Type text while video uploads in background
    if (text) {
      console.log('[x-video] Typing text...');
      await cdp.send('Runtime.evaluate', {
        expression: `
          const editor = document.querySelector('[data-testid="tweetTextarea_0"]');
          if (editor) {
            editor.focus();
            document.execCommand('insertText', false, ${JSON.stringify(text)});
          }
        `,
      }, { sessionId });
      await sleep(500);
    }

    // Wait for video to finish processing by checking if tweet button is enabled
    console.log('[x-video] Waiting for video processing...');
    const waitForVideoReady = async (maxWaitMs = 180_000): Promise<boolean> => {
      const start = Date.now();
      let dots = 0;
      while (Date.now() - start < maxWaitMs) {
        const result = await cdp!.send<{ result: { value: { hasMedia: boolean; buttonEnabled: boolean } } }>('Runtime.evaluate', {
          expression: `(() => {
            const hasMedia = !!document.querySelector('[data-testid="attachments"] video, [data-testid="videoPlayer"], video');
            const tweetBtn = document.querySelector('[data-testid="tweetButton"]');
            const buttonEnabled = tweetBtn && !tweetBtn.disabled && tweetBtn.getAttribute('aria-disabled') !== 'true';
            return { hasMedia, buttonEnabled };
          })()`,
          returnByValue: true,
        }, { sessionId });

        const { hasMedia, buttonEnabled } = result.result.value;
        if (hasMedia && buttonEnabled) {
          console.log('');
          return true;
        }

        process.stdout.write('.');
        dots++;
        if (dots % 60 === 0) console.log(''); // New line every 60 dots
        await sleep(2000);
      }
      console.log('');
      return false;
    };

    const videoReady = await waitForVideoReady();
    if (videoReady) {
      console.log('[x-video] Video ready!');
    } else {
      console.log('[x-video] Video may still be processing. Please check browser window.');
    }

    if (submit) {
      console.log('[x-video] Submitting post...');
      await cdp.send('Runtime.evaluate', {
        expression: `document.querySelector('[data-testid="tweetButton"]')?.click()`,
      }, { sessionId });
      await sleep(5000);
      console.log('[x-video] Post submitted!');
    } else {
      console.log('[x-video] Post composed (preview mode). Add --submit to post.');
      console.log('[x-video] Browser stays open for review.');
    }
  } finally {
    if (cdp) {
      cdp.close();
    }
    // Don't kill Chrome in preview mode, let user review
    if (submit) {
      setTimeout(() => {
        if (!chrome.killed) try { chrome.kill('SIGKILL'); } catch {}
      }, 2_000).unref?.();
      try { chrome.kill('SIGTERM'); } catch {}
    }
  }
}

function printUsage(): never {
  console.log(`Post video to X (Twitter) using real Chrome browser

Usage:
  npx -y bun x-video.ts [options] --video <path> [text]

Options:
  --video <path>   Video file path (required, supports mp4/mov/webm)
  --submit         Actually post (default: preview only)
  --profile <dir>  Chrome profile directory
  --help           Show this help

Examples:
  npx -y bun x-video.ts --video ./clip.mp4 "Check out this video!"
  npx -y bun x-video.ts --video ./demo.mp4 --submit
  npx -y bun x-video.ts --video ./video.mp4 "Multi-line text
works too"

Notes:
  - Video is uploaded first, then text is added (to avoid text being cleared)
  - Video processing may take 30-60 seconds depending on file size
  - Maximum video length on X: 140 seconds (regular) or 60 min (Premium)
  - Supported formats: MP4, MOV, WebM
`);
  process.exit(0);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) printUsage();

  let videoPath: string | undefined;
  let submit = false;
  let profileDir: string | undefined;
  const textParts: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === '--video' && args[i + 1]) {
      videoPath = args[++i]!;
    } else if (arg === '--submit') {
      submit = true;
    } else if (arg === '--profile' && args[i + 1]) {
      profileDir = args[++i];
    } else if (!arg.startsWith('-')) {
      textParts.push(arg);
    }
  }

  const text = textParts.join(' ').trim() || undefined;

  if (!videoPath) {
    console.error('Error: --video <path> is required.');
    printUsage();
  }

  await postVideoToX({ text, videoPath, submit, profileDir });
}

await main().catch((err) => {
  console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
