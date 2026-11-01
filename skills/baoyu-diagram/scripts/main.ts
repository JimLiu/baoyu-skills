#!/usr/bin/env bun
import { existsSync, readFileSync, mkdirSync } from "fs";
import { basename, dirname, extname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { DEFAULT_THEME, flattenVars, hasCssVars, loadTheme } from "./themes.ts";

interface Options {
  input: string;
  output?: string;
  scale: number;
  theme: string;
  json: boolean;
}

function parseViewBox(svg: string): { width: number; height: number } | null {
  const vb = svg.match(/viewBox\s*=\s*"([^"]+)"/);
  if (vb) {
    const parts = vb[1].split(/[\s,]+/).map(Number);
    if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) return { width: parts[2], height: parts[3] };
  }
  const w = svg.match(/\bwidth\s*=\s*"(\d+(?:\.\d+)?)"/);
  const h = svg.match(/\bheight\s*=\s*"(\d+(?:\.\d+)?)"/);
  if (w && h) return { width: Number(w[1]), height: Number(h[1]) };
  return null;
}

function getOutputPath(input: string, scale: number, custom?: string): string {
  if (custom) return resolve(custom);
  const dir = dirname(input);
  const base = basename(input, extname(input));
  const suffix = scale === 1 ? "" : `@${scale}x`;
  return join(dir, `${base}${suffix}.png`);
}

function findInstalledSharp(fromDir: string): string | null {
  let dir = fromDir;
  while (true) {
    if (existsSync(join(dir, "node_modules", "sharp", "package.json"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

async function loadSharp() {
  const scriptsDir = dirname(fileURLToPath(import.meta.url));
  const missing = (detail: string) =>
    new Error(
      `PNG conversion needs the "sharp" package (${detail}).\n` +
        `Install the pinned version once with: cd "${scriptsDir}" && bun install\n` +
        `The SVG output is still usable without it.`,
    );
  // Check first so Bun never auto-installs sharp from the network on import.
  if (!findInstalledSharp(scriptsDir)) throw missing("not installed");
  try {
    return (await import("sharp")).default;
  } catch (e) {
    throw missing(`failed to load: ${(e as Error).message}`);
  }
}

async function convert(
  input: string,
  opts: Options,
): Promise<{ output: string; width: number; height: number; theme: string | null; flattened: number }> {
  let svgStr = readFileSync(input, "utf-8");
  let theme: string | null = null;
  let flattened = 0;
  if (hasCssVars(svgStr)) {
    // sharp/librsvg can't resolve CSS var(); inline the theme's literal colors first.
    const result = flattenVars(svgStr, loadTheme(opts.theme));
    if (result.missing.length) throw new Error(`Undefined CSS variables: ${result.missing.join(", ")}`);
    svgStr = result.svg;
    theme = opts.theme;
    flattened = result.count;
  }
  const svg = Buffer.from(svgStr, "utf-8");
  const dims = parseViewBox(svgStr);
  if (!dims) throw new Error("Cannot determine SVG dimensions from viewBox or width/height attributes");

  const width = Math.round(dims.width * opts.scale);
  const height = Math.round(dims.height * opts.scale);

  const sharp = await loadSharp();
  const output = getOutputPath(input, opts.scale, opts.output);
  mkdirSync(dirname(output), { recursive: true });

  await sharp(svg, { density: 72 * opts.scale })
    .resize(width, height)
    .png()
    .toFile(output);

  return { output, width, height, theme, flattened };
}

function printHelp() {
  console.log(`Usage: bun main.ts <input.svg> [options]

Convert SVG to @2x PNG. CSS var() colors are resolved with the chosen theme first.

Options:
  -o, --output <path>   Output path (default: <input>@2x.png)
  -s, --scale <n>       Scale factor (default: 2)
  -t, --theme <name>    Theme used to resolve CSS variables (default: ${DEFAULT_THEME})
      --json            JSON output
  -h, --help            Show help`);
}

function parseArgs(args: string[]): Options | null {
  const opts: Options = { input: "", scale: 2, theme: DEFAULT_THEME, json: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-h" || arg === "--help") { printHelp(); process.exit(0); }
    else if (arg === "-o" || arg === "--output") opts.output = args[++i];
    else if (arg === "-s" || arg === "--scale") {
      const s = Number(args[++i]);
      if (isNaN(s) || s <= 0) { console.error(`Invalid scale: ${args[i]}`); return null; }
      opts.scale = s;
    } else if (arg === "-t" || arg === "--theme") opts.theme = args[++i];
    else if (arg.startsWith("--theme=")) opts.theme = arg.slice("--theme=".length);
    else if (arg === "--json") opts.json = true;
    else if (!arg.startsWith("-") && !opts.input) opts.input = arg;
  }
  if (!opts.input) { console.error("Error: Input SVG file required"); printHelp(); return null; }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts) process.exit(1);

  const input = resolve(opts.input);
  if (!existsSync(input)) { console.error(`Error: ${input} not found`); process.exit(1); }
  if (extname(input).toLowerCase() !== ".svg") { console.error("Error: Input must be an SVG file"); process.exit(1); }

  try {
    const r = await convert(input, opts);
    if (opts.json) console.log(JSON.stringify({ input, ...r }, null, 2));
    else console.log(`${input} → ${r.output} (${r.width}×${r.height}${r.theme ? `, theme: ${r.theme}` : ""})`);
  } catch (e) {
    console.error(`Error: ${(e as Error).message}`);
    process.exit(1);
  }
}

main();
