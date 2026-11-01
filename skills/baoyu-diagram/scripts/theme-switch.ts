#!/usr/bin/env bun
/**
 * theme-switch.ts — Switch SVG theme between dark and light by replacing CSS custom property definitions.
 *
 * This script reads an SVG file, finds the `:root { ... }` block containing CSS custom property
 * definitions, and replaces them with the target theme's color values. All `var(--variable)`
 * references in the SVG markup remain unchanged — only the definitions are swapped.
 *
 * Usage:
 *   bun theme-switch.ts <svg-path> --theme=<name> [--output=<path>] [--validate]
 *
 * Themes are JSON files in {skillDir}/themes/ (e.g. dark.json, light.json).
 * Each file is a flat object mapping CSS custom property names (keys starting
 * with `--`) to color values; other keys (e.g. "description") are ignored.
 * Add a new .json file there to create a custom theme, then use --theme=<name>.
 *
 * Example:
 *   bun theme-switch.ts diagram.svg --theme=light
 *   bun theme-switch.ts diagram.svg --theme=light --output=diagram-light.svg
 *   bun theme-switch.ts diagram.svg --theme=my-brand
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';

// ─── Theme Loading ──────────────────────────────────────────────────────
// Theme color maps live in {skillDir}/themes/<name>.json — one flat JSON
// object mapping CSS custom property names (keys starting with `--`) to
// color values. Extra metadata keys (not starting with `--`) are ignored.

const THEMES_DIR = resolve(dirname(process.argv[1]), '..', 'themes');

function listThemes(): string[] {
  try {
    return readdirSync(THEMES_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace(/\.json$/, ''))
      .sort();
  } catch {
    return [];
  }
}

function loadTheme(name: string): Record<string, string> {
  const themePath = resolve(THEMES_DIR, `${name}.json`);
  if (!existsSync(themePath)) {
    console.error(`Error: Theme not found: ${name}`);
    console.error(`Available themes: ${listThemes().join(', ') || '(none)'}`);
    console.error(`To add a custom theme, create: ${themePath}`);
    process.exit(1);
  }
  try {
    const raw = JSON.parse(readFileSync(themePath, 'utf-8')) as Record<string, unknown>;
    const vars: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (!key.startsWith('--')) continue; // metadata, ignored
      if (typeof value !== 'string') {
        console.error(`Error: Theme "${name}" variable ${key} must be a string value`);
        process.exit(1);
      }
      vars[key] = value;
    }
    if (Object.keys(vars).length === 0) {
      console.error(`Error: Theme "${name}" contains no CSS custom properties (keys starting with "--")`);
      process.exit(1);
    }
    return vars;
  } catch (e) {
    console.error(`Error: Failed to parse theme file: ${themePath}\n${e}`);
    process.exit(1);
  }
}

// ─── Core Logic ──────────────────────────────────────────────────────────────

/**
 * Apply a theme to SVG content by replacing CSS custom property definitions
 * inside the `:root { ... }` block within a `<style>` element.
 */
function applyTheme(svgContent: string, vars: Record<string, string>): string {
  // Build the replacement :root block
  const rootLines = Object.entries(vars)
    .map(([key, value]) => `    ${key}: ${value};`)
    .join('\n');
  const newRootBlock = `:root {\n${rootLines}\n}`;

  // Replace the :root { ... } block in the <style> element
  // Pattern matches :root { ... } including multiline content
  const rootBlockRegex = /:root\s*\{[^}]*\}/s;

  if (rootBlockRegex.test(svgContent)) {
    return svgContent.replace(rootBlockRegex, newRootBlock);
  }

  // Fallback: if no :root block found, check if there's a <style> tag and inject one
  if (svgContent.includes('<style>')) {
    const injectedRoot = `:root {\n${Object.entries(vars)
      .map(([key, value]) => `    ${key}: ${value};`)
      .join('\n')}\n}`;
    return svgContent.replace('<style>', `<style>${injectedRoot}`);
  }

  // Last fallback: warn the user that the SVG doesn't follow the expected format
  console.warn(
    'Warning: No :root block or <style> element found in SVG. ' +
    'The SVG may not have CSS custom properties defined. ' +
    'Please ensure the SVG includes a <style>:root { ... } block.'
  );
  return svgContent;
}

/**
 * Validate that all CSS variable references in the SVG match defined variables.
 * Helps catch typos or missing variable definitions.
 */
function validateVariables(svgContent: string, vars: Record<string, string>): string[] {
  const definedVars = new Set(Object.keys(vars));
  const referencedVars = new Set<string>();

  // Find all var(--xxx) references
  const varRefRegex = /var\(--([^)]+)\)/g;
  let match;
  while ((match = varRefRegex.exec(svgContent)) !== null) {
    referencedVars.add(`--${match[1]}`);
  }

  const missing = [...referencedVars].filter(v => !definedVars.has(v));
  return missing;
}

// ─── CLI Entry Point ─────────────────────────────────────────────────────────

function parseArgs(argv: string[]): {
  svgPath?: string;
  theme?: string;
  output?: string;
  validate?: boolean;
} {
  const args = argv.slice(2); // skip node and script path
  const result: any = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // Positional argument (svg path)
    if (!arg.startsWith('--') && !result.svgPath) {
      result.svgPath = arg;
      continue;
    }

    // --theme=<name> or --theme <name> (any theme in {skillDir}/themes/)
    if (arg.startsWith('--theme=')) {
      result.theme = arg.split('=')[1];
    } else if (arg === '--theme' && args[i + 1]) {
      result.theme = args[++i];
    }

    // --output=path
    if (arg.startsWith('--output=')) {
      result.output = arg.split('=')[1];
    } else if (arg === '--output' && args[i + 1]) {
      result.output = args[++i];
    }

    // --validate
    if (arg === '--validate') {
      result.validate = true;
    }
  }

  return result;
}

function main(): void {
  const args = parseArgs(process.argv);

  // Validate inputs
  if (!args.svgPath) {
    console.error('Usage: theme-switch.ts <svg-path> [--theme=<name>] [--output=<path>] [--validate]');
    console.error('');
    console.error('Arguments:');
    console.error('  <svg-path>          Path to the input SVG file');
    console.error(`  --theme=<name>      Target theme from {skillDir}/themes/ (default: dark; available: ${listThemes().join(', ') || 'none'})`);
    console.error('  --output=<path>     Custom output path');
    console.error('  --validate          Check for undefined CSS variable references');
    process.exit(1);
  }

  const theme: string = args.theme || 'dark';
  const themeVars = loadTheme(theme);
  const svgPath = resolve(args.svgPath);

  if (!existsSync(svgPath)) {
    console.error(`Error: File not found: ${svgPath}`);
    process.exit(1);
  }

  if (!svgPath.endsWith('.svg')) {
    console.error('Error: Input file must be a .svg file');
    process.exit(1);
  }

  // Read SVG
  const svgContent = readFileSync(svgPath, 'utf-8');

  // Optional validation
  if (args.validate) {
    const missing = validateVariables(svgContent, themeVars);
    if (missing.length > 0) {
      console.error('Warning: The following CSS variables are referenced but not defined:');
      missing.forEach(v => console.error(`  - ${v}`));
      console.error('');
      console.error('Defined variables:');
      Object.keys(themeVars).forEach(v => console.error(`  - ${v}`));
      process.exit(1);
    }
    console.log('Validation passed: all CSS variable references are defined.');
  }

  // Apply theme
  const result = applyTheme(svgContent, themeVars);

  // Determine output path
  const outputDir = args.output ? dirname(args.output) : dirname(svgPath);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = args.output || svgPath.replace('.svg', `.${theme}.svg`);
  writeFileSync(outputPath, result, 'utf-8');

  console.log(`Theme "${theme}" applied successfully: ${outputPath}`);
  console.log(`  Source: ${svgPath}`);
  console.log(`  Variables replaced: ${Object.keys(themeVars).length}`);
}

main();
