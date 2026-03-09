import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ThemeName } from "./types.js";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const THEME_DIR = path.resolve(SCRIPT_DIR, "themes");
const FALLBACK_THEMES: ThemeName[] = ["default", "grace", "simple"];

function stripOutputScope(cssContent: string): string {
  let css = cssContent;
  css = css.replace(/#output\s*\{/g, "body {");
  css = css.replace(/#output\s+/g, "");
  css = css.replace(/^#output\s*/gm, "");
  return css;
}

function discoverThemesFromDir(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".css"))
    .map((name) => name.replace(/\.css$/i, ""))
    .filter((name) => name.toLowerCase() !== "base");
}

function resolveThemeNames(): ThemeName[] {
  const localThemes = discoverThemesFromDir(THEME_DIR);
  const resolved = localThemes.filter((name) =>
    fs.existsSync(path.join(THEME_DIR, `${name}.css`))
  );
  return resolved.length ? resolved : FALLBACK_THEMES;
}

export const THEME_NAMES: ThemeName[] = resolveThemeNames();

export function loadThemeCss(theme: ThemeName): {
  baseCss: string;
  themeCss: string;
} {
  const basePath = path.join(THEME_DIR, "base.css");
  const themePath = path.join(THEME_DIR, `${theme}.css`);

  if (!fs.existsSync(basePath)) {
    throw new Error(`Missing base CSS: ${basePath}`);
  }

  if (!fs.existsSync(themePath)) {
    throw new Error(`Missing theme CSS for "${theme}": ${themePath}`);
  }

  return {
    baseCss: fs.readFileSync(basePath, "utf-8"),
    themeCss: fs.readFileSync(themePath, "utf-8"),
  };
}

export function normalizeThemeCss(css: string): string {
  return stripOutputScope(css);
}
