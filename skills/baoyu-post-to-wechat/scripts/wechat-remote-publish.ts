import type { LookupAddress } from "node:dns";
import dns from "node:dns/promises";
import fs from "node:fs";
import type { IncomingHttpHeaders } from "node:http";
import * as https from "node:https";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

import {
  type WechatUploadAsset,
  prepareWechatBodyImageUpload,
  needsWechatBodyImageProcessing,
  detectImageFormatFromBuffer,
} from "./wechat-image-processor.ts";

export interface RemotePublishConfig {
  host: string;
  user?: string;
  port?: number;
  workdir?: string;
  cleanup?: boolean;
  identityFile?: string;
  knownHostsFile?: string;
  strictHostKeyChecking?: "yes" | "no" | "accept-new";
  connectTimeout?: number;
  proxyJump?: string;
}

interface RemoteImageInfo {
  placeholder: string;
  localPath: string;
  originalPath: string;
}

export interface RemotePublishOptions {
  remote: RemotePublishConfig;
  appId: string;
  appSecret: string;
  title: string;
  author?: string;
  digest?: string;
  html: string;
  baseDir: string;
  contentImages?: RemoteImageInfo[];
  coverPath?: string;
  articleType: "news" | "newspic";
  needOpenComment: number;
  onlyFansCanComment: number;
}

export interface RemotePublishResult {
  mediaId: string;
  title: string;
  bodyImages: number;
  imageMediaIds: number;
}

interface StagedAssetRef {
  filename: string;
  content_type: string;
}

interface StagedHtmlImage {
  src: string;
  body?: StagedAssetRef;
  material?: StagedAssetRef;
}

interface StagedPlaceholderImage {
  placeholder: string;
  body: StagedAssetRef;
  material?: StagedAssetRef;
}

interface NormalizedRemoteConfig extends Required<Pick<RemotePublishConfig, "host" | "user" | "port" | "workdir" | "cleanup">> {
  identityFile?: string;
  knownHostsFile?: string;
  strictHostKeyChecking?: "yes" | "no" | "accept-new";
  connectTimeout?: number;
  proxyJump?: string;
}

type LookupAll = (hostname: string) => Promise<LookupAddress[]>;

interface ResolvedHttpsUrl {
  url: URL;
  address: LookupAddress;
}


function shQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function normalizeRemoteConfig(remote: RemotePublishConfig): NormalizedRemoteConfig {
  const host = remote.host?.trim();
  if (!host) throw new Error("Remote publish requires remote_publish_host.");

  return {
    host,
    user: remote.user?.trim() || "root",
    port: remote.port || 22,
    workdir: remote.workdir?.trim() || "/tmp/baoyu-wechat-remote-publish",
    cleanup: remote.cleanup ?? true,
    identityFile: remote.identityFile?.trim() || undefined,
    knownHostsFile: remote.knownHostsFile?.trim() || undefined,
    strictHostKeyChecking: remote.strictHostKeyChecking,
    connectTimeout: remote.connectTimeout,
    proxyJump: remote.proxyJump?.trim() || undefined,
  };
}

function buildSshOptions(remote: NormalizedRemoteConfig): string[] {
  const options: string[] = [];
  if (remote.identityFile) options.push("-i", remote.identityFile);
  if (remote.knownHostsFile) options.push("-o", `UserKnownHostsFile=${remote.knownHostsFile}`);
  if (remote.strictHostKeyChecking) options.push("-o", `StrictHostKeyChecking=${remote.strictHostKeyChecking}`);
  if (remote.connectTimeout) options.push("-o", `ConnectTimeout=${remote.connectTimeout}`);
  if (remote.proxyJump) options.push("-J", remote.proxyJump);
  return options;
}

function uniqueName(name: string, used: Set<string>): string {
  const safe = path.basename(name) || `asset-${randomUUID()}`;
  if (!used.has(safe)) {
    used.add(safe);
    return safe;
  }

  const ext = path.extname(safe);
  const stem = path.basename(safe, ext);
  while (true) {
    const candidate = `${stem}-${randomUUID().slice(0, 8)}${ext}`;
    if (!used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
  }
}

function resolveLocalPath(imagePath: string, baseDir: string): string {
  return path.isAbsolute(imagePath) ? imagePath : path.resolve(baseDir, imagePath);
}

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map(part => Number.parseInt(part, 10));
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b, c] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized.includes(".")) {
    const mapped = normalized.match(/(?:::ffff:)?(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIpv4(mapped[1]!);
  }
  return (
    normalized === "::1" ||
    normalized === "::" ||
    normalized.startsWith("fe80:") ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd")
  );
}

function normalizeIpLiteral(hostname: string): string {
  return hostname.startsWith("[") && hostname.endsWith("]")
    ? hostname.slice(1, -1)
    : hostname;
}

export function isPrivateAddress(address: string): boolean {
  const normalized = normalizeIpLiteral(address);
  const family = net.isIP(normalized);
  if (family === 4) return isPrivateIpv4(normalized);
  if (family === 6) return isPrivateIpv6(normalized);
  return false;
}

async function defaultLookupAll(hostname: string): Promise<LookupAddress[]> {
  return await dns.lookup(hostname, { all: true });
}

export async function resolvePublicHttpsUrl(
  rawUrl: string,
  lookupAll: LookupAll = defaultLookupAll,
): Promise<ResolvedHttpsUrl> {
  const parsed = new URL(rawUrl);
  if (parsed.protocol !== "https:") {
    throw new Error(`Remote images must use https URLs: ${rawUrl}`);
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    throw new Error(`Remote image host is not allowed: ${hostname}`);
  }

  const literalAddress = normalizeIpLiteral(hostname);
  const literalFamily = net.isIP(literalAddress);
  if (literalFamily !== 0) {
    if (isPrivateAddress(literalAddress)) {
      throw new Error(`Remote image host resolves to a private address: ${hostname}`);
    }
    return { url: parsed, address: { address: literalAddress, family: literalFamily } };
  }

  const addresses = await lookupAll(hostname);
  if (addresses.length === 0 || addresses.some(address => isPrivateAddress(address.address))) {
    throw new Error(`Remote image host resolves to a private address: ${hostname}`);
  }

  return { url: parsed, address: addresses[0]! };
}

function readHttpsImage(resolved: ResolvedHttpsUrl): Promise<{ statusCode: number; headers: IncomingHttpHeaders; buffer: Buffer }> {
  return new Promise((resolve, reject) => {
    const req = https.request(resolved.url, {
      method: "GET",
      headers: { "User-Agent": "baoyu-post-to-wechat/remote-stager" },
      timeout: 60_000,
      lookup: (_hostname, _options, callback) => {
        callback(null, resolved.address.address, resolved.address.family);
      },
    }, (res) => {
      const statusCode = res.statusCode || 0;
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });
      res.on("end", () => {
        resolve({ statusCode, headers: res.headers, buffer: Buffer.concat(chunks) });
      });
    });

    req.on("timeout", () => {
      req.destroy(new Error(`Timed out while downloading image: ${resolved.url.toString()}`));
    });
    req.on("error", reject);
    req.end();
  });
}

async function fetchRemoteImage(url: string, redirects = 0): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
  if (redirects > 5) throw new Error(`Too many redirects while downloading image: ${url}`);
  const resolved = await resolvePublicHttpsUrl(url);
  const response = await readHttpsImage(resolved);

  if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
    const location = response.headers.location;
    if (!location) throw new Error(`Image redirect without Location: ${url}`);
    return await fetchRemoteImage(new URL(String(location), resolved.url).toString(), redirects + 1);
  }

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`Failed to download image: ${url} (${response.statusCode})`);
  }

  const contentType = String(response.headers["content-type"] || "image/jpeg");
  if (!contentType.toLowerCase().startsWith("image/")) {
    throw new Error(`Remote URL did not return an image content type: ${url} (${contentType})`);
  }

  if (response.buffer.length === 0) throw new Error(`Remote image is empty: ${url}`);
  const filename = path.basename(resolved.url.pathname) || `remote-${randomUUID()}.jpg`;
  return { buffer: response.buffer, filename, contentType };
}

async function loadUploadAsset(imagePath: string, baseDir: string): Promise<WechatUploadAsset> {
  let fileBuffer: Buffer;
  let filename: string;
  let fileExt = "";
  let contentType = "image/jpeg";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    const downloaded = await fetchRemoteImage(imagePath);
    fileBuffer = downloaded.buffer;
    filename = downloaded.filename;
    fileExt = path.extname(filename).toLowerCase();
    contentType = downloaded.contentType;
  } else {
    const resolvedPath = resolveLocalPath(imagePath, baseDir);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Image not found: ${resolvedPath}`);
    }

    fileBuffer = fs.readFileSync(resolvedPath);
    if (fileBuffer.length === 0) {
      throw new Error(`Local image is empty: ${resolvedPath}`);
    }

    filename = path.basename(resolvedPath);
    fileExt = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
      ".tiff": "image/tiff",
      ".tif": "image/tiff",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
    };
    contentType = mimeTypes[fileExt] || "image/jpeg";
  }

  const detected = detectImageFormatFromBuffer(fileBuffer);
  if (detected && detected.contentType !== contentType) {
    contentType = detected.contentType;
    fileExt = detected.fileExt;
    filename = `${path.basename(filename, path.extname(filename))}${detected.fileExt}`;
  }

  return {
    buffer: fileBuffer,
    filename,
    contentType,
    fileExt,
    fileSize: fileBuffer.length,
  };
}

async function stageAsset(
  imagePath: string,
  baseDir: string,
  imagesDir: string,
  usedNames: Set<string>,
  uploadType: "body" | "material",
): Promise<StagedAssetRef> {
  const asset = await loadUploadAsset(imagePath, baseDir);

  let staged = asset;
  if (uploadType === "body" && needsWechatBodyImageProcessing(asset)) {
    const prepared = await prepareWechatBodyImageUpload(asset);
    staged = {
      ...asset,
      buffer: prepared.buffer,
      filename: prepared.filename,
      contentType: prepared.contentType,
      fileExt: path.extname(prepared.filename).toLowerCase(),
      fileSize: prepared.buffer.length,
    };
  }

  const filename = uniqueName(staged.filename, usedNames);
  fs.writeFileSync(path.join(imagesDir, filename), staged.buffer);
  return { filename, content_type: staged.contentType };
}

function collectHtmlImageSources(html: string): string[] {
  const imgRegex = /<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi;
  const sources: string[] = [];
  for (const match of html.matchAll(imgRegex)) {
    const src = match[1];
    if (src && !sources.includes(src)) sources.push(src);
  }
  return sources;
}

function runChecked(command: string, args: string[], options?: { capture?: boolean; input?: string }): string {
  const result = spawnSync(command, args, {
    encoding: "utf-8",
    input: options?.input,
    stdio: options?.capture ? ["pipe", "pipe", "pipe"] : options?.input ? ["pipe", "inherit", "inherit"] : "inherit",
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const stderr = typeof result.stderr === "string" ? result.stderr.trim() : "";
    throw new Error(`${command} ${args.join(" ")} failed${stderr ? `: ${stderr}` : ""}`);
  }
  return typeof result.stdout === "string" ? result.stdout : "";
}

function runBestEffort(command: string, args: string[]): void {
  spawnSync(command, args, { stdio: "ignore" });
}

export async function publishRemoteDraft(options: RemotePublishOptions): Promise<RemotePublishResult> {
  const remote = normalizeRemoteConfig(options.remote);
  if (!options.appId || !options.appSecret) {
    throw new Error("Remote publish requires WeChat API credentials.");
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "baoyu-wechat-remote-"));
  const imagesDir = path.join(tmpDir, "images");
  fs.mkdirSync(imagesDir, { recursive: true, mode: 0o700 });

  const usedNames = new Set<string>();
  const collectNewsCoverFallback = options.articleType === "news" && !options.coverPath;

  try {
    const htmlImages: StagedHtmlImage[] = [];
    for (const src of collectHtmlImageSources(options.html)) {
      const shouldUploadMaterial = options.articleType === "newspic" || collectNewsCoverFallback;
      const shouldUploadBody = !src.startsWith("https://mmbiz.qpic.cn");
      htmlImages.push({
        src,
        body: shouldUploadBody
          ? await stageAsset(src, options.baseDir, imagesDir, usedNames, "body")
          : undefined,
        material: shouldUploadMaterial
          ? await stageAsset(src, options.baseDir, imagesDir, usedNames, "material")
          : undefined,
      });
    }

    const placeholderImages: StagedPlaceholderImage[] = [];
    for (const image of options.contentImages || []) {
      if (!options.html.includes(image.placeholder)) continue;

      const imagePath = image.localPath || image.originalPath;
      const shouldUploadMaterial = options.articleType === "newspic" || collectNewsCoverFallback;
      placeholderImages.push({
        placeholder: image.placeholder,
        body: await stageAsset(imagePath, options.baseDir, imagesDir, usedNames, "body"),
        material: shouldUploadMaterial
          ? await stageAsset(imagePath, options.baseDir, imagesDir, usedNames, "material")
          : undefined,
      });
    }

    const cover = options.coverPath
      ? await stageAsset(options.coverPath, options.baseDir, imagesDir, usedNames, "material")
      : undefined;

    fs.writeFileSync(path.join(tmpDir, "payload.json"), JSON.stringify({
      title: options.title,
      author: options.author || "",
      digest: options.digest || "",
      html: options.html,
      article_type: options.articleType,
      need_open_comment: options.needOpenComment,
      only_fans_can_comment: options.onlyFansCanComment,
      html_images: htmlImages,
      placeholder_images: placeholderImages,
      cover,
      collect_news_cover_fallback: collectNewsCoverFallback,
    }, null, 2));

    const __filename = fileURLToPath(import.meta.url);
    const publisherSource = path.join(path.dirname(__filename), "remote_publisher.py");
    const publisherPath = path.join(tmpDir, "remote_publisher.py");
    fs.copyFileSync(publisherSource, publisherPath);
    fs.chmodSync(publisherPath, 0o700);

    const remoteTarget = `${remote.user}@${remote.host}`;
    const remoteRunDir = `${remote.workdir.replace(/\/+$/, "")}/${randomUUID()}`;
    const sshOptions = buildSshOptions(remote);
    const sshBase = ["-p", String(remote.port), ...sshOptions, remoteTarget];
    const scpBase = ["-P", String(remote.port), ...sshOptions];
    let remoteCreated = false;

    try {
      runChecked("ssh", [...sshBase, `umask 077 && rm -rf ${shQuote(remoteRunDir)} && mkdir -p ${shQuote(remoteRunDir)} && chmod 700 ${shQuote(remoteRunDir)}`]);
      remoteCreated = true;
      runChecked("scp", [...scpBase, "-r", `${tmpDir}/.`, `${remoteTarget}:${remoteRunDir}/`]);

      const stdout = runChecked(
        "ssh",
        [...sshBase, `cd ${shQuote(remoteRunDir)} && python3 remote_publisher.py`],
        {
          capture: true,
          input: JSON.stringify({ app_id: options.appId, app_secret: options.appSecret }),
        },
      );
      const lastLine = stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
      if (!lastLine) throw new Error("Remote publisher returned no output.");
      const result = JSON.parse(lastLine) as {
        media_id: string;
        title: string;
        body_images: number;
        image_media_ids: number;
      };
      return {
        mediaId: result.media_id,
        title: result.title,
        bodyImages: result.body_images,
        imageMediaIds: result.image_media_ids,
      };
    } finally {
      if (remote.cleanup && remoteCreated) {
        runBestEffort("ssh", [...sshBase, `rm -rf ${shQuote(remoteRunDir)}`]);
      }
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
