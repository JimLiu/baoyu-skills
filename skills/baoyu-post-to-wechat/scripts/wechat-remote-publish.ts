import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
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
  sshOptions?: string[];
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
  filename?: string;
  content_type?: string;
  remote_url?: string;
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

const REMOTE_PUBLISHER = String.raw`#!/usr/bin/env python3
import json
import mimetypes
import urllib.parse
import urllib.request
from pathlib import Path
from uuid import uuid4

API = "https://api.weixin.qq.com"
ROOT = Path(__file__).resolve().parent


def request_json(url, data=None, headers=None):
    body = None
    if data is not None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        headers = {"Content-Type": "application/json; charset=utf-8", **(headers or {})}
    req = urllib.request.Request(url, data=body, headers=headers or {})
    with urllib.request.urlopen(req, timeout=60) as resp:
        raw = resp.read().decode("utf-8")
    obj = json.loads(raw)
    if obj.get("errcode") not in (None, 0):
        raise RuntimeError(f"WeChat API error {obj.get('errcode')}: {obj.get('errmsg')}")
    return obj


def load_asset(asset):
    if asset.get("remote_url"):
        req = urllib.request.Request(asset["remote_url"], headers={"User-Agent": "baoyu-post-to-wechat/remote"})
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = resp.read()
            content_type = resp.headers.get("content-type") or asset.get("content_type") or "image/jpeg"
        filename = Path(urllib.parse.urlparse(asset["remote_url"]).path).name or f"remote-{uuid4().hex}.jpg"
        return data, filename, content_type

    file_path = ROOT / "images" / asset["filename"]
    return (
        file_path.read_bytes(),
        asset["filename"],
        asset.get("content_type") or mimetypes.guess_type(file_path.name)[0] or "application/octet-stream",
    )


def multipart_upload(url, asset):
    data, filename, content_type = load_asset(asset)
    boundary = f"----baoyu-wechat-{uuid4().hex}"
    body = b"".join([
        f"--{boundary}\r\n".encode(),
        f'Content-Disposition: form-data; name="media"; filename="{filename}"\r\n'.encode(),
        f"Content-Type: {content_type}\r\n\r\n".encode(),
        data,
        b"\r\n",
        f"--{boundary}--\r\n".encode(),
    ])
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        raw = resp.read().decode("utf-8")
    obj = json.loads(raw)
    if obj.get("errcode") not in (None, 0):
        raise RuntimeError(f"WeChat upload error {obj.get('errcode')}: {obj.get('errmsg')}")
    return obj


def get_token(appid, secret):
    query = urllib.parse.urlencode({
        "grant_type": "client_credential",
        "appid": appid,
        "secret": secret,
    })
    return request_json(f"{API}/cgi-bin/token?{query}")["access_token"]


def upload_body_image(token, asset):
    obj = multipart_upload(
        f"{API}/cgi-bin/media/uploadimg?access_token={urllib.parse.quote(token)}",
        asset,
    )
    url = obj["url"]
    return "https://" + url[len("http://"):] if url.startswith("http://") else url


def upload_material(token, asset):
    obj = multipart_upload(
        f"{API}/cgi-bin/material/add_material?access_token={urllib.parse.quote(token)}&type=image",
        asset,
    )
    return obj["media_id"]


def replace_all_placeholders(html, placeholder, replacement):
    return html.replace(placeholder, replacement)


def publish_to_draft(token, payload, content, thumb_media_id, image_media_ids):
    article_type = payload["article_type"]
    article = {
        "article_type": article_type,
        "title": payload["title"],
        "content": content,
        "need_open_comment": payload.get("need_open_comment", 1),
        "only_fans_can_comment": payload.get("only_fans_can_comment", 0),
    }
    if payload.get("author"):
        article["author"] = payload["author"]

    if article_type == "newspic":
        article["image_info"] = {
            "image_list": [{"image_media_id": item} for item in image_media_ids],
        }
    else:
        article["thumb_media_id"] = thumb_media_id
        if payload.get("digest"):
            article["digest"] = payload["digest"]

    return request_json(
        f"{API}/cgi-bin/draft/add?access_token={urllib.parse.quote(token)}",
        {"articles": [article]},
    )


def main():
    payload = json.loads((ROOT / "payload.json").read_text(encoding="utf-8"))
    secrets = json.loads((ROOT / "wechat.json").read_text(encoding="utf-8"))
    token = get_token(secrets["app_id"], secrets["app_secret"])

    html = payload["html"]
    image_media_ids = []
    thumb_media_id = None
    body_uploads = 0

    for item in payload.get("html_images", []):
        src = item["src"]
        if src.startswith("https://mmbiz.qpic.cn"):
            if payload.get("collect_news_cover_fallback") and not thumb_media_id:
                thumb_media_id = upload_material(token, {"remote_url": src, "content_type": "image/jpeg"})
            continue

        body_asset = item.get("body")
        if body_asset:
            image_url = upload_body_image(token, body_asset)
            html = html.replace(src, image_url)
            body_uploads += 1

        if item.get("material"):
            media_id = upload_material(token, item["material"])
            if payload["article_type"] == "newspic":
                image_media_ids.append(media_id)
            if payload.get("collect_news_cover_fallback") and not thumb_media_id:
                thumb_media_id = media_id

    for item in payload.get("placeholder_images", []):
        image_url = upload_body_image(token, item["body"])
        replacement = f'<img src="{image_url}" style="display: block; width: 100%; margin: 1.5em auto;">'
        html = replace_all_placeholders(html, item["placeholder"], replacement)
        body_uploads += 1

        if item.get("material"):
            media_id = upload_material(token, item["material"])
            if payload["article_type"] == "newspic":
                image_media_ids.append(media_id)
            if payload.get("collect_news_cover_fallback") and not thumb_media_id:
                thumb_media_id = media_id

    if payload.get("cover"):
        thumb_media_id = upload_material(token, payload["cover"])

    if payload["article_type"] == "news" and not thumb_media_id:
        raise RuntimeError("news article requires thumb_media_id")
    if payload["article_type"] == "newspic" and not image_media_ids:
        raise RuntimeError("newspic requires at least one image_media_id")

    result = publish_to_draft(token, payload, html, thumb_media_id, image_media_ids)
    print(json.dumps({
        "media_id": result.get("media_id"),
        "title": payload["title"],
        "body_images": body_uploads,
        "image_media_ids": len(image_media_ids),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
`;

function shQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function normalizeRemoteConfig(remote: RemotePublishConfig): Required<RemotePublishConfig> {
  const host = remote.host?.trim();
  if (!host) throw new Error("Remote publish requires remote_publish_host.");

  return {
    host,
    user: remote.user?.trim() || "root",
    port: remote.port || 22,
    workdir: remote.workdir?.trim() || "/tmp/baoyu-wechat-remote-publish",
    cleanup: remote.cleanup ?? true,
    sshOptions: remote.sshOptions || [],
  };
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

async function loadUploadAsset(imagePath: string, baseDir: string): Promise<WechatUploadAsset | { remoteUrl: string }> {
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return { remoteUrl: imagePath };
  }

  const resolvedPath = resolveLocalPath(imagePath, baseDir);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Image not found: ${resolvedPath}`);
  }

  const fileBuffer = fs.readFileSync(resolvedPath);
  if (fileBuffer.length === 0) {
    throw new Error(`Local image is empty: ${resolvedPath}`);
  }

  let filename = path.basename(resolvedPath);
  let fileExt = path.extname(filename).toLowerCase();
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
  let contentType = mimeTypes[fileExt] || "image/jpeg";

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
  if ("remoteUrl" in asset) {
    return { remote_url: asset.remoteUrl };
  }

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

function runChecked(command: string, args: string[], options?: { capture?: boolean }): string {
  const result = spawnSync(command, args, {
    encoding: "utf-8",
    stdio: options?.capture ? ["ignore", "pipe", "pipe"] : "inherit",
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
  fs.mkdirSync(imagesDir, { recursive: true });

  const usedNames = new Set<string>();
  const collectNewsCoverFallback = options.articleType === "news" && !options.coverPath;

  try {
    const htmlImages: StagedHtmlImage[] = [];
    for (const src of collectHtmlImageSources(options.html)) {
      if (src.startsWith("https://mmbiz.qpic.cn")) {
        htmlImages.push({ src });
        continue;
      }

      const shouldUploadMaterial = options.articleType === "newspic" || collectNewsCoverFallback;
      htmlImages.push({
        src,
        body: await stageAsset(src, options.baseDir, imagesDir, usedNames, "body"),
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

    const wechatPath = path.join(tmpDir, "wechat.json");
    fs.writeFileSync(wechatPath, JSON.stringify({
      app_id: options.appId,
      app_secret: options.appSecret,
    }, null, 2));
    fs.chmodSync(wechatPath, 0o600);

    const publisherPath = path.join(tmpDir, "remote_publisher.py");
    fs.writeFileSync(publisherPath, REMOTE_PUBLISHER);
    fs.chmodSync(publisherPath, 0o700);

    const remoteTarget = `${remote.user}@${remote.host}`;
    const remoteRunDir = `${remote.workdir.replace(/\/+$/, "")}/${randomUUID()}`;
    const sshBase = ["-p", String(remote.port), ...remote.sshOptions, remoteTarget];
    const scpBase = ["-P", String(remote.port), ...remote.sshOptions];

    runChecked("ssh", [...sshBase, `rm -rf ${shQuote(remoteRunDir)} && mkdir -p ${shQuote(remoteRunDir)}`]);
    runChecked("scp", [...scpBase, "-r", `${tmpDir}/.`, `${remoteTarget}:${remoteRunDir}/`]);

    try {
      const stdout = runChecked(
        "ssh",
        [...sshBase, `cd ${shQuote(remoteRunDir)} && python3 remote_publisher.py`],
        { capture: true },
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
      if (remote.cleanup) {
        runBestEffort("ssh", [...sshBase, `rm -rf ${shQuote(remoteRunDir)}`]);
      }
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
