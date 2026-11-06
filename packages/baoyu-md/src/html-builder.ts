import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { StyleConfig, HtmlDocumentMeta } from "./types.js";
import { DEFAULT_STYLE } from "./constants.js";

function resolveCommonJsDir(): string | undefined {
  try {
    const value = eval(
      "typeof module === 'object' && module && module.exports && typeof __dirname === 'string' ? __dirname : undefined",
    );
    return typeof value === "string" ? value : undefined;
  } catch {
    return undefined;
  }
}

function resolveModuleDir(metaUrl?: string): string {
  const commonJsDir = resolveCommonJsDir();
  if (commonJsDir) return commonJsDir;
  if (!metaUrl) {
    throw new Error("Unable to resolve module directory.");
  }
  return path.dirname(fileURLToPath(metaUrl));
}

const SCRIPT_DIR = resolveModuleDir(import.meta.url);
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
  const escapeHtmlAttribute = (value: string) => value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const lines = [
    "<!doctype html>",
    "<html>",
    "<head>",
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
    `  <title>${escapeHtmlAttribute(meta.title)}</title>`,
  ];
  if (meta.author) {
    lines.push(`  <meta name="author" content="${escapeHtmlAttribute(meta.author)}" />`);
  }
  if (meta.description) {
    lines.push(`  <meta name="description" content="${escapeHtmlAttribute(meta.description)}" />`);
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

function resolveSrgbTransparentColorMix(cssText: string): string {
  return cssText.replace(
    /color-mix\(\s*in\s+srgb\s*,\s*#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\s+(\d+(?:\.\d+)?)%\s*,\s*transparent\s*\)/gi,
    (match, rawHex: string, rawPct: string) => {
      const hex =
        rawHex.length === 3
          ? rawHex
              .split("")
              .map((ch) => ch + ch)
              .join("")
          : rawHex;
      const r = Number.parseInt(hex.slice(0, 2), 16);
      const g = Number.parseInt(hex.slice(2, 4), 16);
      const b = Number.parseInt(hex.slice(4, 6), 16);
      const pct = Number.parseFloat(rawPct);
      if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) || Number.isNaN(pct)) {
        return match;
      }
      const alpha = Number((Math.min(100, Math.max(0, pct)) / 100).toFixed(4));
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
  );
}

export function normalizeCssText(cssText: string, style: StyleConfig = DEFAULT_STYLE): string {
  const substituted = cssText
    .replace(/var\(--md-primary-color\)/g, style.primaryColor)
    .replace(/var\(--md-font-family\)/g, style.fontFamily)
    .replace(/var\(--md-font-size\)/g, style.fontSize)
    .replace(/var\(--blockquote-background\)/g, style.blockquoteBackground)
    .replace(/var\(--md-accent-color\)/g, style.accentColor)
    .replace(/var\(--md-container-bg\)/g, style.containerBg)
    .replace(/hsl\(var\(--foreground\)\)/g, "#3f3f3f")
    .replace(/--md-primary-color:\s*[^;]+;?/g, "")
    .replace(/--md-font-family:\s*[^;]+;?/g, "")
    .replace(/--md-font-size:\s*[^;]+;?/g, "")
    .replace(/--blockquote-background:\s*[^;]+;?/g, "")
    .replace(/--md-accent-color:\s*[^;]+;?/g, "")
    .replace(/--md-container-bg:\s*[^;]+;?/g, "")
    .replace(/--foreground:\s*[^;]+;?/g, "");
  return resolveSrgbTransparentColorMix(substituted);
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
