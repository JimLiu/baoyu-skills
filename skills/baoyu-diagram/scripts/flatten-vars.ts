// flatten-vars.ts — Resolve CSS var() references in an SVG to literal values so
// non-browser renderers (sharp/librsvg) can render it correctly.
// Usage: bun flatten-vars.ts <svg-path> <output-path> [--theme=<name>]
// Theme maps are JSON files in {skillDir}/themes/<name>.json (default: light).
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';

const THEMES_DIR = resolve(dirname(process.argv[1]), '..', 'themes');

function loadTheme(name: string): Record<string, string> {
  const themePath = resolve(THEMES_DIR, `${name}.json`);
  if (!existsSync(themePath)) {
    const available = readdirSync(THEMES_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace(/\.json$/, ''))
      .join(', ');
    console.error(`Error: Theme not found: ${name} (available: ${available || 'none'})`);
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(themePath, 'utf-8')) as Record<string, unknown>;
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key.startsWith('--') && typeof value === 'string') vars[key] = value;
  }
  return vars;
}

// args: <svg-path> <output-path> [--theme=<name>]
const positional: string[] = [];
let themeName = 'light';
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--theme=')) themeName = arg.slice('--theme='.length);
  else positional.push(arg);
}
const [svgPath, outPath] = positional;
if (!svgPath || !outPath) {
  console.error('Usage: bun flatten-vars.ts <svg-path> <output-path> [--theme=<name>]');
  process.exit(1);
}

const THEME = loadTheme(themeName);

let svg = readFileSync(svgPath, 'utf-8');
let count = 0;
for (const [name, value] of Object.entries(THEME)) {
  const re = new RegExp(`var\\(${name}\\)`, 'g');
  svg = svg.replace(re, () => { count++; return value; });
}
// Drop the :root block — no longer needed in the flattened version
svg = svg.replace(/:root\s*\{[^}]*\}/s, '');

writeFileSync(outPath, svg, 'utf-8');
console.log(`Flattened ${count} var() references -> ${outPath} (theme: ${themeName})`);
