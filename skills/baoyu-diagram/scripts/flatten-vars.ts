#!/usr/bin/env bun
// flatten-vars.ts — Resolve CSS var() references in an SVG to literal values so
// non-browser renderers (sharp/librsvg) can render it correctly.
// Usage: bun flatten-vars.ts <svg-path> <output-path> [--theme=<name>]
// Theme maps are JSON files in {skillDir}/themes/<name>.json (default: dark).
// main.ts already does this automatically before PNG conversion.
import { readFileSync, writeFileSync } from "fs";
import { DEFAULT_THEME, flattenVars, loadTheme } from "./themes.ts";

const positional: string[] = [];
let themeName = DEFAULT_THEME;
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith("--theme=")) themeName = arg.slice("--theme=".length);
  else positional.push(arg);
}
const [svgPath, outPath] = positional;
if (!svgPath || !outPath) {
  console.error("Usage: bun flatten-vars.ts <svg-path> <output-path> [--theme=<name>]");
  process.exit(1);
}

try {
  const result = flattenVars(readFileSync(svgPath, "utf-8"), loadTheme(themeName));
  writeFileSync(outPath, result.svg, "utf-8");
  console.log(`Flattened ${result.count} var() references -> ${outPath} (theme: ${themeName})`);
  if (result.missing.length) console.error(`Warning: undefined variables left as-is: ${result.missing.join(", ")}`);
} catch (e) {
  console.error(`Error: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
}
