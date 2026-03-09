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

interface ImageInfo {
  placeholder: string;
  localPath: string;
  originalPath: string;
  alt: string;
  blockIndex: number;
}

interface ParsedMarkdown {
  title: string;
  summary: string;
  shortSummary: string;
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

function extractTitleFromMarkdown(markdown: string): string {
  const tokens = Lexer.lex(markdown, { gfm: true, breaks: true });
  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === 1) {
      return stripWrappingQuotes(token.text);
    }
  }
  return '';
}

function extractSummaryFromBody(body: string, maxLen: number): string {
  const lines = body.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('!') && !l.startsWith('```'));
  const firstParagraph = lines[0]?.replace(/[*_`\[\]()]/g, '').trim() || '';
  if (firstParagraph.length <= maxLen) return firstParagraph;
  return firstParagraph.slice(0, maxLen - 1) + '\u2026';
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

function resolveLocalWithFallback(resolved: string): string {
  if (fs.existsSync(resolved)) return resolved;
  const ext = path.extname(resolved);
  const base = resolved.slice(0, -ext.length);
  const alternatives = [
    base + '.webp',
    base + '.jpg',
    base + '.jpeg',
    base + '.png',
    base + '.gif',
    base + '_original.png',
    base + '_original.jpg',
  ].filter((p) => p !== resolved);
  for (const alt of alternatives) {
    if (fs.existsSync(alt)) {
      console.error(`[md-to-html] Image fallback: ${path.basename(resolved)} → ${path.basename(alt)}`);
      return alt;
    }
  }
  return resolved;
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

  const resolved = path.isAbsolute(imagePath) ? imagePath : path.resolve(baseDir, imagePath);
  return resolveLocalWithFallback(resolved);
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

const EMPTY_PARAGRAPH = '<p></p>';

function convertMarkdownToHtml(markdown: string, imageCallback: (src: string, alt: string) => string): { html: string; totalBlocks: number } {
  const blockTokens = Lexer.lex(markdown, { gfm: true, breaks: true });

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

  const rendered = parser.parse(markdown);
  if (typeof rendered !== 'string') {
    throw new Error('Unexpected async markdown parse result');
  }

  const totalBlocks = blockTokens.filter((token) => {
    if (token.type === 'space') return false;
    if (token.type === 'heading' && token.depth === 1) return false;
    return true;
  }).length;

  const blocks = rendered
    .replace(/(<\/(?:p|h[1-6]|blockquote|ol|ul|hr|pre)>)/gi, '$1\n')
    .split('\n')
    .filter((l) => l.trim());

  const spaced: string[] = [];
  const nestTags = ['ol', 'ul', 'blockquote'];
  let depth = 0;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;
    const opens = (block.match(new RegExp(`<(${nestTags.join('|')})[\\s>]`, 'gi')) || []).length;
    const closes = (block.match(new RegExp(`</(${nestTags.join('|')})>`, 'gi')) || []).length;

    spaced.push(block);
    depth += opens - closes;

    if (depth <= 0 && i < blocks.length - 1) {
      const lastIsEmpty = spaced.length > 0 && spaced[spaced.length - 1] === EMPTY_PARAGRAPH;
      if (!lastIsEmpty) {
        spaced.push(EMPTY_PARAGRAPH);
      }
    }
    if (depth < 0) depth = 0;
  }

  return {
    html: spaced.join('\n'),
    totalBlocks,
  };
}

export async function parseMarkdown(
  markdownPath: string,
  options?: { coverImage?: string; title?: string; tempDir?: string },
): Promise<ParsedMarkdown> {
  const content = fs.readFileSync(markdownPath, 'utf-8');
  const baseDir = path.dirname(markdownPath);
  const tempDir = options?.tempDir ?? path.join(os.tmpdir(), 'weibo-article-images');

  await mkdir(tempDir, { recursive: true });

  const { frontmatter, body } = parseFrontmatter(content);

  let title = stripWrappingQuotes(options?.title ?? '') || pickFirstString(frontmatter, ['title']) || '';
  if (!title) {
    title = extractTitleFromMarkdown(body);
  }
  if (!title) {
    title = path.basename(markdownPath, path.extname(markdownPath));
  }

  let summary = pickFirstString(frontmatter, ['summary', 'description', 'excerpt']) || '';
  if (!summary) summary = extractSummaryFromBody(body, 44);
  const shortSummary = extractSummaryFromBody(body, 44);

  let coverImagePath = stripWrappingQuotes(options?.coverImage ?? '') || pickFirstString(frontmatter, [
    'featureImage', 'cover_image', 'coverImage', 'cover', 'image',
  ]) || null;

  const images: Array<{ src: string; alt: string; blockIndex: number }> = [];
  let imageCounter = 0;

  const { html, totalBlocks } = convertMarkdownToHtml(body, (src, alt) => {
    const placeholder = `WBIMGPH_${++imageCounter}`;
    images.push({ src, alt, blockIndex: -1 });
    return placeholder;
  });

  const htmlLines = html.split('\n');
  for (let i = 0; i < images.length; i++) {
    const placeholder = `WBIMGPH_${i + 1}`;
    for (let lineIndex = 0; lineIndex < htmlLines.length; lineIndex++) {
      const regex = new RegExp(`\\b${placeholder}\\b`);
      if (regex.test(htmlLines[lineIndex]!)) {
        images[i]!.blockIndex = lineIndex;
        break;
      }
    }
  }

  const contentImages: ImageInfo[] = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i]!;
    const localPath = await resolveImagePath(img.src, baseDir, tempDir);

    contentImages.push({
      placeholder: `WBIMGPH_${i + 1}`,
      localPath,
      originalPath: img.src,
      alt: img.alt,
      blockIndex: img.blockIndex,
    });
  }

  const finalHtml = html.replace(/\n{3,}/g, '\n\n').trim();

  let resolvedCoverImage: string | null = null;
  if (coverImagePath) {
    resolvedCoverImage = await resolveImagePath(coverImagePath, baseDir, tempDir);
  }

  return {
    title,
    summary,
    shortSummary,
    coverImage: resolvedCoverImage,
    contentImages,
    html: finalHtml,
    totalBlocks,
  };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`Convert Markdown to HTML for Weibo article publishing

Usage:
  npx -y bun md-to-html.ts <markdown_file> [options]

Options:
  --title <title>       Override title
  --cover <image>       Override cover image
  --output <json|html>  Output format (default: json)
  --html-only           Output only the HTML content
  --save-html <path>    Save HTML to file
  --help                Show this help
`);
    process.exit(0);
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

  if (!markdownPath || !fs.existsSync(markdownPath)) {
    console.error('Error: Valid markdown file path required');
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
