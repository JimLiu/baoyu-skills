import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { StyleConfig, HtmlDocumentMeta } from "./types.js";
import { DEFAULT_STYLE } from "./constants.js";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const CODE_THEMES_DIR = path.resolve(SCRIPT_DIR, "code-themes");

export function buildCss(baseCss: string, themeCss: string, style: StyleConfig = DEFAULT_STYLE): string {
  const variables = `
:root {
  --md-primary-color: ${style.primaryColor};
  --md-font-family: ${style.fontFamily};
  --md-font-size: ${style.fontSize};
  --foreground: ${style.foreground};
  --blockquote-background: ${style.blockquoteBackground};
  --md-accent-color: ${style.accentColor};
  --md-container-bg: ${style.containerBg};
}

body {
  margin: 0;
  padding: 24px;
  background: #ffffff;
}

#output {
  max-width: 860px;
  margin: 0 auto;
}
`.trim();

  return [variables, baseCss, themeCss].join("\n\n");
}

export function loadCodeThemeCss(themeName: string): string {
  const filePath = path.join(CODE_THEMES_DIR, `${themeName}.min.css`);
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    console.error(`Code theme CSS not found: ${filePath}`);
    return "";
  }
}

export function buildHtmlDocument(meta: HtmlDocumentMeta, css: string, html: string, codeThemeCss?: string): string {
  const lines = [
    "<!doctype html>",
    "<html>",
    "<head>",
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
    `  <title>${meta.title}</title>`,
  ];
  if (meta.author) {
    lines.push(`  <meta name="author" content="${meta.author}" />`);
  }
  if (meta.description) {
    lines.push(`  <meta name="description" content="${meta.description}" />`);
  }
  lines.push(`  <style>${css}</style>`);
  if (codeThemeCss) {
    lines.push(`  <style>${codeThemeCss}</style>`);
  }
  lines.push(
    "</head>",
    "<body>",
    '  <div id="output">',
    html,
    "  </div>",
    "</body>",
    "</html>"
  );
  return lines.join("\n");
}

export async function inlineCss(html: string): Promise<string> {
  try {
    const { default: juice } = await import("juice");
    return juice(html, {
      inlinePseudoElements: true,
      preserveImportant: true,
      resolveCSSVariables: false,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Missing dependency "juice" for CSS inlining. Install it first (e.g. "bun add juice" or "npm add juice"). Original error: ${detail}`
    );
  }
}

export function normalizeCssText(cssText: string, style: StyleConfig = DEFAULT_STYLE): string {
  return cssText
    .replace(/var\(--md-primary-color\)/g, style.primaryColor)
    .replace(/var\(--md-font-family\)/g, style.fontFamily)
    .replace(/var\(--md-font-size\)/g, style.fontSize)
    .replace(/var\(--blockquote-background\)/g, style.blockquoteBackground)
    .replace(/var\(--md-accent-color\)/g, style.accentColor)
    .replace(/var\(--md-container-bg\)/g, style.containerBg)
    .replace(/hsl\(var\(--foreground\)\)/g, "#3f3f3f")
    .replace(/--md-primary-color:\s*[^;"']+;?/g, "")
    .replace(/--md-font-family:\s*[^;"']+;?/g, "")
    .replace(/--md-font-size:\s*[^;"']+;?/g, "")
    .replace(/--blockquote-background:\s*[^;"']+;?/g, "")
    .replace(/--md-accent-color:\s*[^;"']+;?/g, "")
    .replace(/--md-container-bg:\s*[^;"']+;?/g, "")
    .replace(/--foreground:\s*[^;"']+;?/g, "");
}

export function normalizeInlineCss(html: string, style: StyleConfig = DEFAULT_STYLE): string {
  let output = html;
  output = output.replace(
    /<style([^>]*)>([\s\S]*?)<\/style>/gi,
    (_match, attrs: string, cssText: string) =>
      `<style${attrs}>${normalizeCssText(cssText, style)}</style>`
  );
  output = output.replace(
    /style="([^"]*)"/gi,
    (_match, cssText: string) => `style="${normalizeCssText(cssText, style)}"`
  );
  output = output.replace(
    /style='([^']*)'/gi,
    (_match, cssText: string) => `style='${normalizeCssText(cssText, style)}'`
  );
  return output;
}

export function modifyHtmlStructure(htmlString: string): string {
  let output = htmlString;
  const pattern =
    /<li([^>]*)>([\s\S]*?)(<ul[\s\S]*?<\/ul>|<ol[\s\S]*?<\/ol>)<\/li>/i;
  while (pattern.test(output)) {
    output = output.replace(pattern, "<li$1>$2</li>$3");
  }
  return output;
}

export function removeFirstHeading(html: string): string {
  return html.replace(/<h[12][^>]*>[\s\S]*?<\/h[12]>/, "");
}
