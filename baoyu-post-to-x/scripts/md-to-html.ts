import fs from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { createHash } from 'node:crypto';

import frontMatter from 'front-matter';
import hljs from 'highlight.js/lib/common';
import { Lexer, Marked, type RendererObject, type Tokens } from 'marked';
import { unified } from 'unified';
import remarkCjkFriendly from 'remark-cjk-friendly';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';

interface ImageInfo {
  placeholder: string;
  localPath: string;
  originalPath: string;
  blockIndex: number;
}

interface ParsedMarkdown {
  title: string;
  coverImage: string | null;
  contentImages: ImageInfo[];
  html: string;
  totalBlocks: number;
}

type FrontmatterFields = Record<string, unknown>;

function parseFrontmatter(content: string): { frontmatter: FrontmatterFields; body: string } {
  try {
    const parsed = frontMatter<FrontmatterFields>(content);
    return {
      frontmatter: parsed.attributes ?? {},
      body: parsed.body,
    };
  } catch {
    return { frontmatter: {}, body: content };
  }
}

function stripWrappingQuotes(value: string): string {
  if (!value) return value;
  const doubleQuoted = value.startsWith('"') && value.endsWith('"');
  const singleQuoted = value.startsWith("'") && value.endsWith("'");
  const cjkDoubleQuoted = value.startsWith('\u201c') && value.endsWith('\u201d');
  const cjkSingleQuoted = value.startsWith('\u2018') && value.endsWith('\u2019');
  if (doubleQuoted || singleQuoted || cjkDoubleQuoted || cjkSingleQuoted) {
    return value.slice(1, -1).trim();
  }
  return value.trim();
}

function toFrontmatterString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return stripWrappingQuotes(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return undefined;
}

function pickFirstString(frontmatter: FrontmatterFields, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = toFrontmatterString(frontmatter[key]);
    if (value) return value;
  }
  return undefined;
}

function findCoverImageNearMarkdown(baseDir: string): string | null {
  const candidateDirs = [baseDir, path.join(baseDir, 'imgs')];
  const coverPattern = /^cover\.(png|jpe?g|webp)$/i;

  for (const dir of candidateDirs) {
    try {
      if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
        continue;
      }

      const match = fs.readdirSync(dir).find((entry) => coverPattern.test(entry));
      if (match) {
        return path.join(dir, match);
      }
    } catch {
      continue;
    }
  }

  return null;
}

function extractTitleFromMarkdown(markdown: string): string {
  const tokens = Lexer.lex(markdown, { gfm: true, breaks: true });
  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === 1) {
      return stripWrappingQuotes(token.text);
    }
  }
  return '';
}

function downloadFile(url: string, destPath: string, maxRedirects = 5): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!url.startsWith('https://')) {
      reject(new Error(`Refusing non-HTTPS download: ${url}`));
      return;
    }
    if (maxRedirects <= 0) {
      reject(new Error('Too many redirects'));
      return;
    }
    const file = fs.createWriteStream(destPath);

    const request = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          fs.unlinkSync(destPath);
          downloadFile(redirectUrl, destPath, maxRedirects - 1).then(resolve).catch(reject);
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
  if (imagePath.startsWith('http://')) {
    console.error(`[md-to-html] Skipping non-HTTPS image: ${imagePath}`);
    return '';
  }
  if (imagePath.startsWith('https://')) {
    const hash = createHash('md5').update(imagePath).digest('hex').slice(0, 8);
    const ext = getImageExtension(imagePath);
    const localPath = path.join(tempDir, `remote_${hash}.${ext}`);

    if (!fs.existsSync(localPath)) {
      console.error(`[md-to-html] Downloading: ${imagePath}`);
      await downloadFile(imagePath, localPath);
    }
    return localPath;
  }

  if (path.isAbsolute(imagePath)) {
    return imagePath;
  }

  return path.resolve(baseDir, imagePath);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function highlightCode(code: string, lang: string): string {
  try {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
    }
    return hljs.highlightAuto(code).value;
  } catch {
    return escapeHtml(code);
  }
}

function preprocessCjkMarkdown(markdown: string): string {
  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkCjkFriendly)
      .use(remarkStringify);

    const result = String(processor.processSync(markdown));
    return result.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)));
  } catch {
    return markdown;
  }
}

function convertMarkdownToHtml(markdown: string, imageCallback: (src: string, alt: string) => string): { html: string; totalBlocks: number } {
  const preprocessedMarkdown = preprocessCjkMarkdown(markdown);
  const blockTokens = Lexer.lex(preprocessedMarkdown, { gfm: true, breaks: true });

  const renderer: RendererObject = {
    heading({ depth, tokens }: Tokens.Heading): string {
      if (depth === 1) {
        return '';
      }
      return `<h2>${this.parser.parseInline(tokens)}</h2>`;
    },

    paragraph({ tokens }: Tokens.Paragraph): string {
      const text = this.parser.parseInline(tokens).trim();
      if (!text) return '';
      return `<p>${text}</p>`;
    },

    blockquote({ tokens }: Tokens.Blockquote): string {
      return `<blockquote>${this.parser.parse(tokens)}</blockquote>`;
    },

    code({ text, lang = '' }: Tokens.Code): string {
      const language = lang.split(/\s+/)[0]!.toLowerCase();
      const source = text.replace(/\n$/, '');
      const highlighted = highlightCode(source, language).replace(/\n/g, '<br>');
      const label = language ? `<strong>[${escapeHtml(language)}]</strong><br>` : '';
      return `<blockquote>${label}${highlighted}</blockquote>`;
    },

    image({ href, text }: Tokens.Image): string {
      if (!href) return '';
      return imageCallback(href, text ?? '');
    },

    link({ href, title, tokens, text }: Tokens.Link): string {
      const label = tokens?.length ? this.parser.parseInline(tokens) : escapeHtml(text || href || '');
      if (!href) return label;

      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      return `<a href="${escapeHtml(href)}"${titleAttr} rel="noopener noreferrer nofollow">${label}</a>`;
    },
  };

  const parser = new Marked({
    gfm: true,
    breaks: true,
  });
  parser.use({ renderer });

  const rendered = parser.parse(preprocessedMarkdown);
  if (typeof rendered !== 'string') {
    throw new Error('Unexpected async markdown parse result');
  }

  const totalBlocks = blockTokens.filter((token) => {
    if (token.type === 'space') return false;
    if (token.type === 'heading' && token.depth === 1) return false;
    return true;
  }).length;

  return {
    html: rendered,
    totalBlocks,
  };
}

export async function parseMarkdown(
  markdownPath: string,
  options?: { coverImage?: string; title?: string; tempDir?: string },
): Promise<ParsedMarkdown> {
  const content = fs.readFileSync(markdownPath, 'utf-8');
  const baseDir = path.dirname(markdownPath);
  const tempDir = options?.tempDir ?? path.join(os.tmpdir(), 'x-article-images');

  await mkdir(tempDir, { recursive: true });

  const { frontmatter, body } = parseFrontmatter(content);

  let title = stripWrappingQuotes(options?.title ?? '') || pickFirstString(frontmatter, ['title']) || '';
  if (!title) {
    title = extractTitleFromMarkdown(body);
  }
  if (!title) {
    title = path.basename(markdownPath, path.extname(markdownPath));
  }

  let coverImagePath = stripWrappingQuotes(options?.coverImage ?? '') || pickFirstString(frontmatter, [
    'cover_image',
    'coverImage',
    'cover',
    'image',
    'featureImage',
    'feature_image',
  ]) || null;
  if (!coverImagePath) {
    coverImagePath = findCoverImageNearMarkdown(baseDir);
  }

  const images: Array<{ src: string; alt: string; blockIndex: number }> = [];
  let imageCounter = 0;

  const { html, totalBlocks } = convertMarkdownToHtml(body, (src, alt) => {
    const placeholder = `XIMGPH_${++imageCounter}`;
    images.push({ src, alt, blockIndex: -1 });
    return placeholder;
  });

  const htmlLines = html.split('\n');
  for (let i = 0; i < images.length; i++) {
    const placeholder = `XIMGPH_${i + 1}`;
    for (let lineIndex = 0; lineIndex < htmlLines.length; lineIndex++) {
      const regex = new RegExp(`\\b${placeholder}\\b`);
      if (regex.test(htmlLines[lineIndex]!)) {
        images[i]!.blockIndex = lineIndex;
        break;
      }
    }
  }

  const contentImages: ImageInfo[] = [];
  let firstImageAsCover: string | null = null;

  for (let i = 0; i < images.length; i++) {
    const img = images[i]!;
    const localPath = await resolveImagePath(img.src, baseDir, tempDir);

    if (i === 0 && !coverImagePath) {
      firstImageAsCover = localPath;
    }

    contentImages.push({
      placeholder: `XIMGPH_${i + 1}`,
      localPath,
      originalPath: img.src,
      blockIndex: img.blockIndex,
    });
  }

  const finalHtml = html.replace(/\n{3,}/g, '\n\n').trim();

  let resolvedCoverImage: string | null = null;
  if (coverImagePath) {
    resolvedCoverImage = await resolveImagePath(coverImagePath, baseDir, tempDir);
  } else if (firstImageAsCover) {
    resolvedCoverImage = firstImageAsCover;
  }

  return {
    title,
    coverImage: resolvedCoverImage,
    contentImages,
    html: finalHtml,
    totalBlocks,
  };
}

function printUsage(): never {
  console.log(`Convert Markdown to HTML for X Article publishing

Usage:
  npx -y bun md-to-html.ts <markdown_file> [options]

Options:
  --title <title>       Override title from frontmatter
  --cover <image>       Override cover image from frontmatter
  --output <json|html>  Output format (default: json)
  --html-only           Output only the HTML content
  --save-html <path>    Save HTML to file

Frontmatter fields:
  title: Article title (or use first H1)
  cover_image: Cover image path or URL
  cover: Alias for cover_image
  image: Alias for cover_image

Example:
  npx -y bun md-to-html.ts article.md --output json
  npx -y bun md-to-html.ts article.md --html-only > /tmp/article.html
  npx -y bun md-to-html.ts article.md --save-html /tmp/article.html
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
  let coverImage: string | undefined;
  let outputFormat: 'json' | 'html' = 'json';
  let htmlOnly = false;
  let saveHtmlPath: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === '--title' && args[i + 1]) {
      title = args[++i];
    } else if (arg === '--cover' && args[i + 1]) {
      coverImage = args[++i];
    } else if (arg === '--output' && args[i + 1]) {
      outputFormat = args[++i] as 'json' | 'html';
    } else if (arg === '--html-only') {
      htmlOnly = true;
    } else if (arg === '--save-html' && args[i + 1]) {
      saveHtmlPath = args[++i];
    } else if (!arg.startsWith('-')) {
      markdownPath = arg;
    }
  }

  if (!markdownPath) {
    console.error('Error: Markdown file path required');
    process.exit(1);
  }

  if (!fs.existsSync(markdownPath)) {
    console.error(`Error: File not found: ${markdownPath}`);
    process.exit(1);
  }

  const result = await parseMarkdown(markdownPath, { title, coverImage });

  if (saveHtmlPath) {
    await writeFile(saveHtmlPath, result.html, 'utf-8');
    console.error(`[md-to-html] HTML saved to: ${saveHtmlPath}`);
  }

  if (htmlOnly) {
    console.log(result.html);
  } else if (outputFormat === 'html') {
    console.log(result.html);
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
}

await main().catch((err) => {
  console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
