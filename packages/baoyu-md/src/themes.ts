import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ThemeName } from "./types.js";

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
export const THEME_DIR = path.resolve(SCRIPT_DIR, "themes");
const FALLBACK_THEMES: ThemeName[] = ["default", "grace", "simple"];
const THEMES_EXTENDING_DEFAULT = new Set<ThemeName>(["grace", "simple"]);

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
  const defaultThemePath = path.join(THEME_DIR, "default.css");
  const themePath = path.join(THEME_DIR, `${theme}.css`);

  if (!fs.existsSync(basePath)) {
    throw new Error(`Missing base CSS: ${basePath}`);
  }

  if (!fs.existsSync(themePath)) {
    throw new Error(`Missing theme CSS for "${theme}": ${themePath}`);
  }

  const layeredThemeCss: string[] = [];
  if (theme !== "default" && THEMES_EXTENDING_DEFAULT.has(theme)) {
    if (!fs.existsSync(defaultThemePath)) {
      throw new Error(`Missing default theme CSS: ${defaultThemePath}`);
    }
    layeredThemeCss.push(fs.readFileSync(defaultThemePath, "utf-8"));
  }
  layeredThemeCss.push(fs.readFileSync(themePath, "utf-8"));

  return {
    baseCss: fs.readFileSync(basePath, "utf-8"),
    themeCss: layeredThemeCss.join("\n"),
  };
}

export function normalizeThemeCss(css: string): string {
  return stripOutputScope(css);
}
