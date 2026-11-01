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
  const out = svg
    .replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/g, (match, name: string, fallback?: string) => {
      const value = vars[name] ?? fallback?.trim();
      if (value === undefined) {
        missing.add(name);
        return match;
      }
      count++;
      return value;
    })
    .replace(/:root\s*\{[^}]*\}/s, "");
  return { svg: out, count, missing: [...missing] };
}
