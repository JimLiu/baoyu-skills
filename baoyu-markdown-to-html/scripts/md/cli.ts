import type { CliOptions, ThemeName } from "./types.js";
import {
  FONT_FAMILY_MAP,
  FONT_SIZE_OPTIONS,
  COLOR_PRESETS,
  CODE_BLOCK_THEMES,
} from "./constants.js";
import { THEME_NAMES } from "./themes.js";
import { loadExtendConfig } from "./extend-config.js";

export function printUsage(): void {
  console.error(
    [
      "Usage:",
      "  npx tsx src/md/render.ts <markdown_file> [options]",
      "",
      "Options:",
      `  --theme <name>        Theme (${THEME_NAMES.join(", ")})`,
      `  --color <name|hex>    Primary color: ${Object.keys(COLOR_PRESETS).join(", ")}, or hex`,
      `  --font-family <name>  Font: ${Object.keys(FONT_FAMILY_MAP).join(", ")}, or CSS value`,
      `  --font-size <N>       Font size: ${FONT_SIZE_OPTIONS.join(", ")} (default: 16px)`,
      `  --code-theme <name>   Code highlight theme (default: github)`,
      `  --mac-code-block      Show Mac-style code block header`,
      `  --line-number         Show line numbers in code blocks`,
      `  --cite                Enable footnote citations`,
      `  --count               Show reading time / word count`,
      `  --legend <value>      Image caption: title-alt, alt-title, title, alt, none`,
      `  --keep-title          Keep the first heading in output`,
    ].join("\n")
  );
}

function parseArgValue(argv: string[], i: number, flag: string): string | null {
  const arg = argv[i]!;
  if (arg.includes("=")) {
    return arg.slice(flag.length + 1);
  }
  const next = argv[i + 1];
  return next ?? null;
}

function resolveFontFamily(value: string): string {
  return FONT_FAMILY_MAP[value] ?? value;
}

function resolveColor(value: string): string {
  return COLOR_PRESETS[value] ?? value;
}

export function parseArgs(argv: string[]): CliOptions | null {
  const ext = loadExtendConfig();

  let inputPath = "";
  let theme: ThemeName = ext.default_theme ?? "default";
  let keepTitle = ext.keep_title ?? false;
  let primaryColor: string | undefined = ext.default_color ? resolveColor(ext.default_color) : undefined;
  let fontFamily: string | undefined = ext.default_font_family ? resolveFontFamily(ext.default_font_family) : undefined;
  let fontSize: string | undefined = ext.default_font_size ?? undefined;
  let codeTheme = ext.default_code_theme ?? "github";
  let isMacCodeBlock = ext.mac_code_block ?? true;
  let isShowLineNumber = ext.show_line_number ?? false;
  let citeStatus = ext.cite ?? false;
  let countStatus = ext.count ?? false;
  let legend = ext.legend ?? "alt";

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;

    if (!arg.startsWith("--") && !inputPath) {
      inputPath = arg;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      return null;
    }

    if (arg === "--keep-title") { keepTitle = true; continue; }
    if (arg === "--mac-code-block") { isMacCodeBlock = true; continue; }
    if (arg === "--no-mac-code-block") { isMacCodeBlock = false; continue; }
    if (arg === "--line-number") { isShowLineNumber = true; continue; }
    if (arg === "--cite") { citeStatus = true; continue; }
    if (arg === "--count") { countStatus = true; continue; }

    if (arg === "--theme" || arg.startsWith("--theme=")) {
      const val = parseArgValue(argv, i, "--theme");
      if (!val) { console.error("Missing value for --theme"); return null; }
      theme = val as ThemeName;
      if (!arg.includes("=")) i += 1;
      continue;
    }

    if (arg === "--color" || arg.startsWith("--color=")) {
      const val = parseArgValue(argv, i, "--color");
      if (!val) { console.error("Missing value for --color"); return null; }
      primaryColor = resolveColor(val);
      if (!arg.includes("=")) i += 1;
      continue;
    }

    if (arg === "--font-family" || arg.startsWith("--font-family=")) {
      const val = parseArgValue(argv, i, "--font-family");
      if (!val) { console.error("Missing value for --font-family"); return null; }
      fontFamily = resolveFontFamily(val);
      if (!arg.includes("=")) i += 1;
      continue;
    }

    if (arg === "--font-size" || arg.startsWith("--font-size=")) {
      const val = parseArgValue(argv, i, "--font-size");
      if (!val) { console.error("Missing value for --font-size"); return null; }
      fontSize = val.endsWith("px") ? val : `${val}px`;
      if (!FONT_SIZE_OPTIONS.includes(fontSize)) {
        console.error(`Invalid font size: ${fontSize}. Valid: ${FONT_SIZE_OPTIONS.join(", ")}`);
        return null;
      }
      if (!arg.includes("=")) i += 1;
      continue;
    }

    if (arg === "--code-theme" || arg.startsWith("--code-theme=")) {
      const val = parseArgValue(argv, i, "--code-theme");
      if (!val) { console.error("Missing value for --code-theme"); return null; }
      codeTheme = val;
      if (!CODE_BLOCK_THEMES.includes(codeTheme)) {
        console.error(`Unknown code theme: ${codeTheme}`);
        return null;
      }
      if (!arg.includes("=")) i += 1;
      continue;
    }

    if (arg === "--legend" || arg.startsWith("--legend=")) {
      const val = parseArgValue(argv, i, "--legend");
      if (!val) { console.error("Missing value for --legend"); return null; }
      const valid = ["title-alt", "alt-title", "title", "alt", "none"];
      if (!valid.includes(val)) {
        console.error(`Invalid legend: ${val}. Valid: ${valid.join(", ")}`);
        return null;
      }
      legend = val;
      if (!arg.includes("=")) i += 1;
      continue;
    }

    console.error(`Unknown argument: ${arg}`);
    return null;
  }

  if (!inputPath) {
    return null;
  }

  if (!THEME_NAMES.includes(theme)) {
    console.error(`Unknown theme: ${theme}`);
    return null;
  }

  return {
    inputPath, theme, keepTitle, primaryColor, fontFamily, fontSize,
    codeTheme, isMacCodeBlock, isShowLineNumber, citeStatus, countStatus, legend,
  };
}
