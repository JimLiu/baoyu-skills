import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

import {
  COLOR_PRESETS,
  FONT_FAMILY_MAP,
  FONT_SIZE_OPTIONS,
  THEME_NAMES,
  extractSummaryFromBody,
  extractTitleFromMarkdown,
  formatTimestamp,
  parseArgs,
  parseFrontmatter,
  renderMarkdownDocument,
  replaceMarkdownImagesWithPlaceholders,
  resolveContentImages,
  serializeFrontmatter,
  stripWrappingQuotes,
} from "baoyu-md";
import type { CliOptions } from "baoyu-md";

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

type ConvertMarkdownOptions = Partial<Omit<CliOptions, "inputPath">> & {
  title?: string;
};

export async function convertMarkdown(
  markdownPath: string,
  options?: ConvertMarkdownOptions,
): Promise<ParsedResult> {
  const baseDir = path.dirname(markdownPath);
  const content = fs.readFileSync(markdownPath, "utf-8");
  const theme = options?.theme;
  const keepTitle = options?.keepTitle ?? false;
  const citeStatus = options?.citeStatus ?? false;

  const { frontmatter, body } = parseFrontmatter(content);

  let title = stripWrappingQuotes(options?.title ?? "")
    || stripWrappingQuotes(frontmatter.title ?? "")
    || extractTitleFromMarkdown(body);
  if (!title) {
    title = path.basename(markdownPath, path.extname(markdownPath));
  }

  const author = stripWrappingQuotes(frontmatter.author ?? "");
  let summary = stripWrappingQuotes(frontmatter.description ?? "")
    || stripWrappingQuotes(frontmatter.summary ?? "");
  if (!summary) {
    summary = extractSummaryFromBody(body, 120);
  }

  const effectiveFrontmatter = options?.title
    ? { ...frontmatter, title }
    : frontmatter;

  const { images, markdown: rewrittenBody } = replaceMarkdownImagesWithPlaceholders(
    body,
    "MDTOHTMLIMGPH_",
  );
  const rewrittenMarkdown = `${serializeFrontmatter(effectiveFrontmatter)}${rewrittenBody}`;

  console.error(
    `[markdown-to-html] Rendering with theme: ${theme ?? "default"}, keepTitle: ${keepTitle}, citeStatus: ${citeStatus}`,
  );

  const { html } = await renderMarkdownDocument(rewrittenMarkdown, {
    codeTheme: options?.codeTheme,
    countStatus: options?.countStatus,
    citeStatus,
    defaultTitle: title,
    fontFamily: options?.fontFamily,
    fontSize: options?.fontSize,
    isMacCodeBlock: options?.isMacCodeBlock,
    isShowLineNumber: options?.isShowLineNumber,
    keepTitle,
    legend: options?.legend,
    primaryColor: options?.primaryColor,
    theme,
  });

  const finalHtmlPath = markdownPath.replace(/\.md$/i, ".html");
  let backupPath: string | undefined;

  if (fs.existsSync(finalHtmlPath)) {
    backupPath = `${finalHtmlPath}.bak-${formatTimestamp()}`;
    console.error(`[markdown-to-html] Backing up existing file to: ${backupPath}`);
    fs.renameSync(finalHtmlPath, backupPath);
  }

  fs.writeFileSync(finalHtmlPath, html, "utf-8");

  const hasRemoteImages = images.some((image) =>
    image.originalPath.startsWith("http://") || image.originalPath.startsWith("https://"),
  );
  const tempDir = hasRemoteImages
    ? fs.mkdtempSync(path.join(os.tmpdir(), "markdown-to-html-"))
    : baseDir;
  const contentImages = await resolveContentImages(images, baseDir, tempDir, "markdown-to-html");

  let finalContent = fs.readFileSync(finalHtmlPath, "utf-8");
  for (const image of contentImages) {
    const imgTag = `<img src="${image.originalPath}" data-local-path="${image.localPath}" style="display: block; width: 100%; margin: 1.5em auto;">`;
    finalContent = finalContent.replace(image.placeholder, imgTag);
  }
  fs.writeFileSync(finalHtmlPath, finalContent, "utf-8");

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

function printUsage(exitCode = 0): never {
  const colorNames = Object.keys(COLOR_PRESETS).join(", ");
  const fontFamilyNames = Object.keys(FONT_FAMILY_MAP).join(", ");

  console.log(`Convert Markdown to styled HTML

Usage:
  npx -y bun main.ts <markdown_file> [options]

Options:
  --title <title>         Override title
  --theme <name>          Theme name (${THEME_NAMES.join(", ")}). Default: default
  --color <name|hex>      Primary color: ${colorNames}
  --font-family <name>    Font: ${fontFamilyNames}, or CSS value
  --font-size <N>         Font size: ${FONT_SIZE_OPTIONS.join(", ")} (default: 16px)
  --code-theme <name>     Code highlight theme (default: github)
  --mac-code-block        Show Mac-style code block header
  --no-mac-code-block     Hide Mac-style code block header
  --line-number           Show line numbers in code blocks
  --cite                  Convert ordinary external links to bottom citations. Default: off
  --count                 Show reading time / word count
  --legend <value>        Image caption: title-alt, alt-title, title, alt, none
  --keep-title            Keep the first heading in content. Default: false (removed)
  --help                  Show this help

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
  npx -y bun main.ts article.md --theme modern --color red
  npx -y bun main.ts article.md --cite
`);
  process.exit(exitCode);
}

function parseArgValue(argv: string[], i: number, flag: string): string | null {
  const arg = argv[i]!;
  if (arg.includes("=")) {
    return arg.slice(flag.length + 1);
  }
  const next = argv[i + 1];
  return next ?? null;
}

function extractTitleArg(argv: string[]): { renderArgs: string[]; title?: string } {
  let title: string | undefined;
  const renderArgs: string[] = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    if (arg === "--title" || arg.startsWith("--title=")) {
      const value = parseArgValue(argv, i, "--title");
      if (!value) {
        console.error("Missing value for --title");
        printUsage(1);
      }
      title = value;
      if (!arg.includes("=")) {
        i += 1;
      }
      continue;
    }
    renderArgs.push(arg);
  }

  return { renderArgs, title };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage(0);
  }

  const { renderArgs, title } = extractTitleArg(args);
  const options = parseArgs(renderArgs);
  if (!options) {
    printUsage(1);
  }

  const markdownPath = path.resolve(process.cwd(), options.inputPath);
  if (!markdownPath.toLowerCase().endsWith(".md")) {
    console.error("Input file must end with .md");
    process.exit(1);
  }

  if (!fs.existsSync(markdownPath)) {
    console.error(`Error: File not found: ${markdownPath}`);
    process.exit(1);
  }

  const result = await convertMarkdown(markdownPath, { ...options, title });
  console.log(JSON.stringify(result, null, 2));
}

await main().catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
