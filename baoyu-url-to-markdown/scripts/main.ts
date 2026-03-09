import { createInterface } from "node:readline";
import { writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { CdpConnection, getFreePort, launchChrome, waitForChromeDebugPort, waitForNetworkIdle, waitForPageLoad, autoScroll, evaluateScript, killChrome } from "./cdp.js";
import { absolutizeUrlsScript, extractContent, createMarkdownDocument, type ConversionResult } from "./html-to-markdown.js";
import { localizeMarkdownMedia, countRemoteMedia } from "./media-localizer.js";
import { resolveUrlToMarkdownDataDir } from "./paths.js";
import { DEFAULT_TIMEOUT_MS, CDP_CONNECT_TIMEOUT_MS, NETWORK_IDLE_TIMEOUT_MS, POST_LOAD_DELAY_MS, SCROLL_STEP_WAIT_MS, SCROLL_MAX_STEPS } from "./constants.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

interface Args {
  url: string;
  output?: string;
  outputDir?: string;
  wait: boolean;
  timeout: number;
  downloadMedia: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { url: "", wait: false, timeout: DEFAULT_TIMEOUT_MS, downloadMedia: false };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--wait" || arg === "-w") {
      args.wait = true;
    } else if (arg === "-o" || arg === "--output") {
      args.output = argv[++i];
    } else if (arg === "--timeout" || arg === "-t") {
      args.timeout = parseInt(argv[++i], 10) || DEFAULT_TIMEOUT_MS;
    } else if (arg === "--output-dir") {
      args.outputDir = argv[++i];
    } else if (arg === "--download-media") {
      args.downloadMedia = true;
    } else if (!arg.startsWith("-") && !args.url) {
      args.url = arg;
    }
  }
  return args;
}

function generateSlug(title: string, url: string): string {
  const text = title || new URL(url).pathname.replace(/\//g, "-");
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "page";
}

function formatTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function deriveHtmlSnapshotPath(markdownPath: string): string {
  const parsed = path.parse(markdownPath);
  const basename = parsed.ext ? parsed.name : parsed.base;
  return path.join(parsed.dir, `${basename}-captured.html`);
}

async function generateOutputPath(url: string, title: string, outputDir?: string): Promise<string> {
  const domain = new URL(url).hostname.replace(/^www\./, "");
  const slug = generateSlug(title, url);
  const dataDir = outputDir ? path.resolve(outputDir) : resolveUrlToMarkdownDataDir();
  const basePath = path.join(dataDir, domain, `${slug}.md`);

  if (!(await fileExists(basePath))) {
    return basePath;
  }

  const timestampSlug = `${slug}-${formatTimestamp()}`;
  return path.join(dataDir, domain, `${timestampSlug}.md`);
}

async function waitForUserSignal(): Promise<void> {
  console.log("Page opened. Press Enter when ready to capture...");
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  await new Promise<void>((resolve) => {
    rl.once("line", () => { rl.close(); resolve(); });
  });
}

async function captureUrl(args: Args): Promise<ConversionResult> {
  const port = await getFreePort();
  const chrome = await launchChrome(args.url, port, false);

  let cdp: CdpConnection | null = null;
  try {
    const wsUrl = await waitForChromeDebugPort(port, 30_000);
    cdp = await CdpConnection.connect(wsUrl, CDP_CONNECT_TIMEOUT_MS);

    const targets = await cdp.send<{ targetInfos: Array<{ targetId: string; type: string; url: string }> }>("Target.getTargets");
    const pageTarget = targets.targetInfos.find(t => t.type === "page" && t.url.startsWith("http"));
    if (!pageTarget) throw new Error("No page target found");

    const { sessionId } = await cdp.send<{ sessionId: string }>("Target.attachToTarget", { targetId: pageTarget.targetId, flatten: true });
    await cdp.send("Network.enable", {}, { sessionId });
    await cdp.send("Page.enable", {}, { sessionId });

    if (args.wait) {
      await waitForUserSignal();
    } else {
      console.log("Waiting for page to load...");
      await Promise.race([
        waitForPageLoad(cdp, sessionId, 15_000),
        sleep(8_000)
      ]);
      await waitForNetworkIdle(cdp, sessionId, NETWORK_IDLE_TIMEOUT_MS);
      await sleep(POST_LOAD_DELAY_MS);
      console.log("Scrolling to trigger lazy load...");
      await autoScroll(cdp, sessionId, SCROLL_MAX_STEPS, SCROLL_STEP_WAIT_MS);
      await sleep(POST_LOAD_DELAY_MS);
    }

    console.log("Capturing page content...");
    const { html } = await evaluateScript<{ html: string }>(
      cdp, sessionId, absolutizeUrlsScript, args.timeout
    );

    return await extractContent(html, args.url);
  } finally {
    if (cdp) {
      try { await cdp.send("Browser.close", {}, { timeoutMs: 5_000 }); } catch {}
      cdp.close();
    }
    killChrome(chrome);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  if (!args.url) {
    console.error("Usage: bun main.ts <url> [-o output.md] [--output-dir dir] [--wait] [--timeout ms] [--download-media]");
    process.exit(1);
  }

  try {
    new URL(args.url);
  } catch {
    console.error(`Invalid URL: ${args.url}`);
    process.exit(1);
  }

  if (args.output) {
    const stat = await import("node:fs").then(fs => fs.statSync(args.output!, { throwIfNoEntry: false }));
    if (stat?.isDirectory()) {
      console.error(`Error: -o path is a directory, not a file: ${args.output}`);
      process.exit(1);
    }
  }

  console.log(`Fetching: ${args.url}`);
  console.log(`Mode: ${args.wait ? "wait" : "auto"}`);

  const result = await captureUrl(args);
  const outputPath = args.output || await generateOutputPath(args.url, result.metadata.title, args.outputDir);
  const outputDir = path.dirname(outputPath);
  const htmlSnapshotPath = deriveHtmlSnapshotPath(outputPath);
  await mkdir(outputDir, { recursive: true });
  await writeFile(htmlSnapshotPath, result.rawHtml, "utf-8");

  let document = createMarkdownDocument(result);

  if (args.downloadMedia) {
    const mediaResult = await localizeMarkdownMedia(document, {
      markdownPath: outputPath,
      log: console.log,
    });
    document = mediaResult.markdown;
    if (mediaResult.downloadedImages > 0 || mediaResult.downloadedVideos > 0) {
      console.log(`Downloaded: ${mediaResult.downloadedImages} images, ${mediaResult.downloadedVideos} videos`);
    }
  } else {
    const { images, videos } = countRemoteMedia(document);
    if (images > 0 || videos > 0) {
      console.log(`Remote media found: ${images} images, ${videos} videos`);
    }
  }

  await writeFile(outputPath, document, "utf-8");

  console.log(`Saved: ${outputPath}`);
  console.log(`Saved HTML: ${htmlSnapshotPath}`);
  console.log(`Title: ${result.metadata.title || "(no title)"}`);
  console.log(`Converter: ${result.conversionMethod}`);
  if (result.fallbackReason) {
    console.warn(`Fallback used: ${result.fallbackReason}`);
  }
}

main().catch((err) => {
  console.error("Error:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
