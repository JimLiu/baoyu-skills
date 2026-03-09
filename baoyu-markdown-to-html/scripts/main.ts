import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import https from 'node:https';
import http from 'node:http';
import process from 'node:process';
import type { StyleConfig, HtmlDocumentMeta } from './md/types.js';
import { DEFAULT_STYLE, THEME_STYLE_DEFAULTS } from './md/constants.js';
import { loadThemeCss, normalizeThemeCss } from './md/themes.js';
import { initRenderer, renderMarkdown, postProcessHtml } from './md/renderer.js';
import {
  buildCss, loadCodeThemeCss, buildHtmlDocument,
  inlineCss, normalizeInlineCss, modifyHtmlStructure, removeFirstHeading,
} from './md/html-builder.js';

interface ImageInfo {
  placeholder: string;
  localPath: string;
  originalPath: string;
}

interface ParsedResult {
  title: string;
  author: string;
  summary: string;
  htmlPath: string;
  backupPath?: string;
  contentImages: ImageInfo[];
}

function formatTimestamp(date = new Date()): string {
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);

    const request = protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          fs.unlinkSync(destPath);
          downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
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
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });

    request.on('error', (err) => {
      file.close();
      fs.unlink(destPath, () => {});
      reject(err);
    });

    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Download timeout'));
    });
  });
}

function getImageExtension(urlOrPath: string): string {
  const match = urlOrPath.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
  return match ? match[1]!.toLowerCase() : 'png';
}

async function resolveImagePath(imagePath: string, baseDir: string, tempDir: string): Promise<string> {
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    const hash = createHash('md5').update(imagePath).digest('hex').slice(0, 8);
    const ext = getImageExtension(imagePath);
    const localPath = path.join(tempDir, `remote_${hash}.${ext}`);

    if (!fs.existsSync(localPath)) {
      console.error(`[markdown-to-html] Downloading: ${imagePath}`);
      await downloadFile(imagePath, localPath);
    }
    return localPath;
  }

  if (path.isAbsolute(imagePath)) {
    return imagePath;
  }

  return path.resolve(baseDir, imagePath);
}

function parseFrontmatter(content: string): { frontmatter: Record<string, string>; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter: Record<string, string> = {};
  const lines = match[1]!.split('\n');
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  }

  return { frontmatter, body: match[2]! };
}

export async function convertMarkdown(
  markdownPath: string,
  options?: { title?: string; theme?: string; keepTitle?: boolean; citeStatus?: boolean }
): Promise<ParsedResult> {
  const baseDir = path.dirname(markdownPath);
  const content = fs.readFileSync(markdownPath, 'utf-8');
  const theme = options?.theme ?? 'default';
  const keepTitle = options?.keepTitle ?? false;
  const citeStatus = options?.citeStatus ?? false;

  const { frontmatter, body } = parseFrontmatter(content);

  const stripQuotes = (s?: string): string => {
    if (!s) return '';
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      return s.slice(1, -1);
    }
    if ((s.startsWith('\u201c') && s.endsWith('\u201d')) || (s.startsWith('\u2018') && s.endsWith('\u2019'))) {
      return s.slice(1, -1);
    }
    return s;
  };

  let title = options?.title ?? stripQuotes(frontmatter.title) ?? '';
  if (!title) {
    const lines = body.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const headingMatch = trimmed.match(/^#{1,2}\s+(.+)$/);
      if (headingMatch) title = headingMatch[1]!;
      break;
    }
  }
  if (!title) title = path.basename(markdownPath, path.extname(markdownPath));
  const author = stripQuotes(frontmatter.author);
  let summary = stripQuotes(frontmatter.description) || stripQuotes(frontmatter.summary);

  if (!summary) {
    const lines = body.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('#')) continue;
      if (trimmed.startsWith('![')) continue;
      if (trimmed.startsWith('>')) continue;
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) continue;
      if (/^\d+\./.test(trimmed)) continue;

      const cleanText = trimmed
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/`([^`]+)`/g, '$1');

      if (cleanText.length > 20) {
        summary = cleanText.length > 120 ? cleanText.slice(0, 117) + '...' : cleanText;
        break;
      }
    }
  }

  const images: Array<{ src: string; placeholder: string }> = [];
  let imageCounter = 0;

  const modifiedBody = body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    const placeholder = `MDTOHTMLIMGPH_${++imageCounter}`;
    images.push({ src, placeholder });
    return placeholder;
  });

  const modifiedMarkdown = `---\n${Object.entries(frontmatter).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n${modifiedBody}`;

  console.error(`[markdown-to-html] Rendering with theme: ${theme}, keepTitle: ${keepTitle}, citeStatus: ${citeStatus}`);

  const themeDefaults = THEME_STYLE_DEFAULTS[theme] ?? {};
  const style: StyleConfig = { ...DEFAULT_STYLE, ...themeDefaults };
  const { baseCss, themeCss } = loadThemeCss(theme);
  const css = normalizeThemeCss(buildCss(baseCss, themeCss, style));
  const codeThemeCss = loadCodeThemeCss('github');

  const renderer = initRenderer({ citeStatus });
  const { html: baseHtml, readingTime } = renderMarkdown(modifiedMarkdown, renderer);
  let htmlContent = postProcessHtml(baseHtml, readingTime, renderer);
  if (!keepTitle) htmlContent = removeFirstHeading(htmlContent);

  const meta: HtmlDocumentMeta = { title, author, description: summary };
  const fullHtml = buildHtmlDocument(meta, css, htmlContent, codeThemeCss);
  const inlinedHtml = normalizeInlineCss(await inlineCss(fullHtml), style);
  const renderedHtml = modifyHtmlStructure(inlinedHtml);

  const finalHtmlPath = markdownPath.replace(/\.md$/i, '.html');
  let backupPath: string | undefined;

  if (fs.existsSync(finalHtmlPath)) {
    backupPath = `${finalHtmlPath}.bak-${formatTimestamp()}`;
    console.error(`[markdown-to-html] Backing up existing file to: ${backupPath}`);
    fs.renameSync(finalHtmlPath, backupPath);
  }

  fs.writeFileSync(finalHtmlPath, renderedHtml, 'utf-8');

  const contentImages: ImageInfo[] = [];
  let tempDir: string | undefined;
  for (const img of images) {
    if (!tempDir && (img.src.startsWith('http://') || img.src.startsWith('https://'))) {
      const os = await import('node:os');
      tempDir = fs.mkdtempSync(path.join(os.default.tmpdir(), 'markdown-to-html-'));
    }
    const localPath = await resolveImagePath(img.src, baseDir, tempDir ?? baseDir);
    contentImages.push({
      placeholder: img.placeholder,
      localPath,
      originalPath: img.src,
    });
  }

  let finalContent = fs.readFileSync(finalHtmlPath, 'utf-8');
  for (const img of contentImages) {
    const imgTag = `<img src="${img.originalPath}" data-local-path="${img.localPath}" style="display: block; width: 100%; margin: 1.5em auto;">`;
    finalContent = finalContent.replace(img.placeholder, imgTag);
  }
  fs.writeFileSync(finalHtmlPath, finalContent, 'utf-8');

  console.error(`[markdown-to-html] HTML saved to: ${finalHtmlPath}`);

  return {
    title,
    author,
    summary,
    htmlPath: finalHtmlPath,
    backupPath,
    contentImages,
  };
}

function printUsage(): never {
  console.log(`Convert Markdown to styled HTML

Usage:
  npx -y bun main.ts <markdown_file> [options]

Options:
  --title <title>     Override title
  --theme <name>      Theme name (default, grace, simple). Default: default
  --cite              Convert ordinary external links to bottom citations. Default: off
  --keep-title        Keep the first heading in content. Default: false (removed)
  --help              Show this help

Output:
  HTML file saved to same directory as input markdown file.
  Example: article.md -> article.html

  If HTML file already exists, it will be backed up first:
  article.html -> article.html.bak-YYYYMMDDHHMMSS

Output JSON format:
{
  "title": "Article Title",
  "htmlPath": "/path/to/article.html",
  "backupPath": "/path/to/article.html.bak-20260128180000",
  "contentImages": [...]
}

Example:
  npx -y bun main.ts article.md
  npx -y bun main.ts article.md --theme grace
  npx -y bun main.ts article.md --cite
`);
  process.exit(0);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
  }

  let markdownPath: string | undefined;
  let title: string | undefined;
  let theme: string | undefined;
  let citeStatus = false;
  let keepTitle = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === '--title' && args[i + 1]) {
      title = args[++i];
    } else if (arg === '--theme' && args[i + 1]) {
      theme = args[++i];
    } else if (arg === '--cite') {
      citeStatus = true;
    } else if (arg === '--keep-title') {
      keepTitle = true;
    } else if (!arg.startsWith('-')) {
      markdownPath = arg;
    }
  }

  if (!markdownPath) {
    console.error('Error: Markdown file path is required');
    process.exit(1);
  }

  if (!fs.existsSync(markdownPath)) {
    console.error(`Error: File not found: ${markdownPath}`);
    process.exit(1);
  }

  const result = await convertMarkdown(markdownPath, { title, theme, keepTitle, citeStatus });
  console.log(JSON.stringify(result, null, 2));
}

await main().catch((err) => {
  console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
