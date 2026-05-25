import { createHash } from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";

export interface ImagePlaceholder {
  originalPath: string;
  placeholder: string;
  alt?: string;
}

export interface ResolvedImageInfo extends ImagePlaceholder {
  localPath: string;
}

export function replaceMarkdownImagesWithPlaceholders(
  markdown: string,
  placeholderPrefix: string,
): {
  images: ImagePlaceholder[];
  markdown: string;
} {
  const images: ImagePlaceholder[] = [];
  let imageCounter = 0;

  // Combined pattern: Obsidian wikilink ![[path]] or ![[path|alt]], and standard ![alt](path)
  const combined = /!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]|!\[([^\]]*)\]\(([^)]+)\)/g;
  const rewritten = markdown.replace(combined, (_match, wikiSrc, wikiAlt, mdAlt, mdSrc) => {
    const placeholder = `${placeholderPrefix}${++imageCounter}`;
    if (wikiSrc != null) {
      images.push({ alt: wikiAlt ?? "", originalPath: wikiSrc, placeholder });
    } else {
      images.push({ alt: mdAlt, originalPath: mdSrc, placeholder });
    }
    return placeholder;
  });

  return { images, markdown: rewritten };
}

export function getImageExtension(urlOrPath: string): string {
  const match = urlOrPath.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
  return match ? match[1]!.toLowerCase() : "png";
}

export async function downloadFile(url: string, destPath: string): Promise<void> {
  return await new Promise((resolve, reject) => {
    const protocol = url.startsWith("https://") ? https : http;
    const file = fs.createWriteStream(destPath);

    const request = protocol.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          fs.unlinkSync(destPath);
          void downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    });

    request.on("error", (error) => {
      file.close();
      fs.unlink(destPath, () => {});
      reject(error);
    });

    request.setTimeout(30_000, () => {
      request.destroy();
      reject(new Error("Download timeout"));
    });
  });
}

export async function resolveImagePath(
  imagePath: string,
  baseDir: string,
  tempDir: string,
  logLabel = "baoyu-md",
): Promise<string> {
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    const hash = createHash("md5").update(imagePath).digest("hex").slice(0, 8);
    const ext = getImageExtension(imagePath);
    const localPath = path.join(tempDir, `remote_${hash}.${ext}`);

    if (!fs.existsSync(localPath)) {
      console.error(`[${logLabel}] Downloading: ${imagePath}`);
      await downloadFile(imagePath, localPath);
    }
    return localPath;
  }

  const resolved = path.isAbsolute(imagePath)
    ? imagePath
    : path.resolve(baseDir, imagePath);
  return resolveLocalWithFallback(resolved, logLabel);
}

export async function resolveContentImages(
  images: ImagePlaceholder[],
  baseDir: string,
  tempDir: string,
  logLabel = "baoyu-md",
): Promise<ResolvedImageInfo[]> {
  const resolved: ResolvedImageInfo[] = [];

  for (const image of images) {
    resolved.push({
      ...image,
      localPath: await resolveImagePath(image.originalPath, baseDir, tempDir, logLabel),
    });
  }

  return resolved;
}

function resolveLocalWithFallback(resolved: string, logLabel: string): string {
  if (fs.existsSync(resolved)) {
    return resolved;
  }

  const ext = path.extname(resolved);
  const base = ext ? resolved.slice(0, -ext.length) : resolved;
  const alternatives = [
    `${base}.webp`,
    `${base}.jpg`,
    `${base}.jpeg`,
    `${base}.png`,
    `${base}.gif`,
    `${base}_original.png`,
    `${base}_original.jpg`,
  ].filter((candidate) => candidate !== resolved);

  for (const alternative of alternatives) {
    if (!fs.existsSync(alternative)) continue;
    console.error(
      `[${logLabel}] Image fallback: ${path.basename(resolved)} -> ${path.basename(alternative)}`,
    );
    return alternative;
  }

  // Obsidian attachment folder fallback: check Attachments/ subdirectory
  const dir = path.dirname(resolved);
  const filename = path.basename(resolved);
  const attachmentsPath = path.join(dir, "Attachments", filename);
  if (fs.existsSync(attachmentsPath)) {
    console.error(
      `[${logLabel}] Image fallback: ${filename} -> Attachments/${filename}`,
    );
    return attachmentsPath;
  }

  return resolved;
}
