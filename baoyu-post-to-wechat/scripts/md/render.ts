#!/usr/bin/env npx tsx

import fs from "node:fs";
import path from "node:path";
import type { StyleConfig, HtmlDocumentMeta } from "./types.js";
import { DEFAULT_STYLE, THEME_STYLE_DEFAULTS } from "./constants.js";
import { loadThemeCss, normalizeThemeCss } from "./themes.js";
import { parseArgs, printUsage } from "./cli.js";
import { initRenderer, renderMarkdown, postProcessHtml } from "./renderer.js";
import {
  buildCss,
  loadCodeThemeCss,
  buildHtmlDocument,
  inlineCss,
  normalizeInlineCss,
  modifyHtmlStructure,
  removeFirstHeading,
} from "./html-builder.js";

function formatTimestamp(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(
    date.getDate()
  )}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  if (!options) {
    printUsage();
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), options.inputPath);
  if (!inputPath.toLowerCase().endsWith(".md")) {
    console.error("Input file must end with .md");
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }

  const outputPath = path.resolve(
    process.cwd(),
    options.inputPath.replace(/\.md$/i, ".html")
  );

  const themeDefaults = THEME_STYLE_DEFAULTS[options.theme] ?? {};
  const style: StyleConfig = {
    ...DEFAULT_STYLE,
    ...themeDefaults,
    ...(options.primaryColor !== undefined ? { primaryColor: options.primaryColor } : {}),
    ...(options.fontFamily !== undefined ? { fontFamily: options.fontFamily } : {}),
    ...(options.fontSize !== undefined ? { fontSize: options.fontSize } : {}),
  };

  const { baseCss, themeCss } = loadThemeCss(options.theme);
  const css = normalizeThemeCss(buildCss(baseCss, themeCss, style));
  const codeThemeCss = loadCodeThemeCss(options.codeTheme);

  const markdown = fs.readFileSync(inputPath, "utf-8");

  const renderer = initRenderer({
    legend: options.legend,
    citeStatus: options.citeStatus,
    countStatus: options.countStatus,
    isMacCodeBlock: options.isMacCodeBlock,
    isShowLineNumber: options.isShowLineNumber,
  });
  const { yamlData } = renderer.parseFrontMatterAndContent(markdown);
  const { html: baseHtml, readingTime: readingTimeResult } = renderMarkdown(
    markdown,
    renderer
  );
  let content = postProcessHtml(baseHtml, readingTimeResult, renderer);
  if (!options.keepTitle) {
    content = removeFirstHeading(content);
  }

  const stripQuotes = (s?: string): string | undefined => {
    if (!s) return s;
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      return s.slice(1, -1);
    }
    if ((s.startsWith('\u201c') && s.endsWith('\u201d')) || (s.startsWith('\u2018') && s.endsWith('\u2019'))) {
      return s.slice(1, -1);
    }
    return s;
  };

  const meta: HtmlDocumentMeta = {
    title: stripQuotes(yamlData.title) || path.basename(outputPath, ".html"),
    author: stripQuotes(yamlData.author),
    description: stripQuotes(yamlData.description) || stripQuotes(yamlData.summary),
  };
  const html = buildHtmlDocument(meta, css, content, codeThemeCss);
  const inlinedHtml = normalizeInlineCss(await inlineCss(html), style);
  const finalHtml = modifyHtmlStructure(inlinedHtml);

  let backupPath = "";
  if (fs.existsSync(outputPath)) {
    backupPath = `${outputPath}.bak-${formatTimestamp()}`;
    fs.renameSync(outputPath, backupPath);
  }

  fs.writeFileSync(outputPath, finalHtml, "utf-8");

  if (backupPath) {
    console.log(`Backup created: ${backupPath}`);
  }
  console.log(`HTML written: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
