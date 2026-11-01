// Shared theme helpers for theme-switch.ts, flatten-vars.ts and main.ts.
// Themes are flat JSON files in {skillDir}/themes/<name>.json mapping CSS custom
// property names (keys starting with `--`) to color values. Other keys are metadata.
import { existsSync, readFileSync, readdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export const DEFAULT_THEME = "dark";
export const THEMES_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..", "themes");

export function listThemes(themesDir = THEMES_DIR): string[] {
  try {
    return readdirSync(themesDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
      .sort();
  } catch {
    return [];
  }
}

export function loadTheme(name: string, themesDir = THEMES_DIR): Record<string, string> {
  const themePath = resolve(themesDir, `${name}.json`);
  if (!existsSync(themePath)) {
    throw new Error(
      `Theme not found: ${name} (available: ${listThemes(themesDir).join(", ") || "none"}). ` +
        `To add a custom theme, create ${themePath}`,
    );
  }
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(readFileSync(themePath, "utf-8"));
  } catch (e) {
    throw new Error(`Failed to parse theme file ${themePath}: ${e}`);
  }
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!key.startsWith("--")) continue;
    if (typeof value !== "string") throw new Error(`Theme "${name}" variable ${key} must be a string`);
    vars[key] = value;
  }
  if (Object.keys(vars).length === 0) {
    throw new Error(`Theme "${name}" contains no CSS custom properties (keys starting with "--")`);
  }
  return vars;
}

export function hasCssVars(svg: string): boolean {
  return /var\(\s*--[\w-]+/.test(svg);
}

/**
 * Replace every `var(--name)` / `var(--name, fallback)` with the theme's literal value
 * and drop the `:root { ... }` block, so renderers without CSS variable support
 * (sharp/librsvg) draw the right colors. Unknown variables fall back to their
 * inline fallback, or to the value defined in the SVG's own :root block.
 */
export function flattenVars(svg: string, theme: Record<string, string>): { svg: string; count: number; missing: string[] } {
  const own: Record<string, string> = {};
  const root = svg.match(/:root\s*\{([^}]*)\}/s);
  if (root) {
    for (const m of root[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g)) own[m[1]] = m[2].trim();
  }
  const vars = { ...own, ...theme };
  let count = 0;
  const missing = new Set<string>();

  // Scan for var( ... ) with balanced parentheses, so fallbacks like
  // rgb(255,255,255) or a nested var() stay intact.
  const resolve = (text: string, seen: Set<string> = new Set()): string => {
    let result = "";
    let i = 0;
    while (i < text.length) {
      const start = text.indexOf("var(", i);
      if (start === -1) {
        result += text.slice(i);
        break;
      }
      result += text.slice(i, start);
      let depth = 1;
      let j = start + 4;
      while (j < text.length && depth > 0) {
        if (text[j] === "(") depth++;
        else if (text[j] === ")") depth--;
        j++;
      }
      if (depth > 0) {
        result += text.slice(start);
        break;
      }
      const inner = text.slice(start + 4, j - 1);
      const comma = inner.indexOf(",");
      const name = (comma === -1 ? inner : inner.slice(0, comma)).trim();
      const fallback = comma === -1 ? undefined : inner.slice(comma + 1).trim();
      let value: string | undefined;
      if (name.startsWith("--") && vars[name] !== undefined && !seen.has(name)) {
        // A value may itself reference other variables (aliases); resolve those too.
        value = resolve(vars[name], new Set(seen).add(name));
      } else if (fallback) {
        value = resolve(fallback, seen);
      }
      if (value === undefined || !name.startsWith("--")) {
        missing.add(name);
        result += text.slice(start, j);
      } else {
        count++;
        result += value;
      }
      i = j;
    }
    return result;
  };

  const out = resolve(svg).replace(/:root\s*\{[^}]*\}/s, "");
  return { svg: out, count, missing: [...missing] };
}
