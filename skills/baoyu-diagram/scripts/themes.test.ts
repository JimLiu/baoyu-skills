import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { flattenVars, hasCssVars, listThemes, loadTheme, THEMES_DIR } from "./themes.ts";

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
<style>
:root { --bg: #000000; --only-here: #123456; }
</style>
<rect fill="var(--bg)"/><rect fill="var(--only-here)"/><rect fill="var(--nowhere, #abcdef)"/>
</svg>`;

test("dark and light themes define the same variables", () => {
  assert.deepEqual(listThemes().slice(0, 2).length, 2);
  assert.deepEqual(Object.keys(loadTheme("light")).sort(), Object.keys(loadTheme("dark")).sort());
});

test("loadTheme reports available themes for an unknown name", () => {
  assert.throws(() => loadTheme("does-not-exist"), /available: .*dark.*light/);
});

test("flattenVars inlines theme values, SVG-defined values and fallbacks", () => {
  const { svg, count, missing } = flattenVars(SVG, loadTheme("light"));
  assert.equal(count, 3);
  assert.deepEqual(missing, []);
  assert.equal(hasCssVars(svg), false);
  assert.match(svg, /fill="#f8fafc"/);
  assert.match(svg, /fill="#123456"/);
  assert.match(svg, /fill="#abcdef"/);
  assert.doesNotMatch(svg, /:root/);
});

test("flattenVars keeps functional and nested fallbacks intact", () => {
  const svg = '<rect fill="var(--bg, rgb(255,255,255))"/><rect fill="var(--nope, rgba(1,2,3,0.5))"/><rect fill="var(--nope, var(--text))"/>';
  const { svg: out, missing } = flattenVars(svg, loadTheme("light"));
  assert.deepEqual(missing, []);
  assert.equal(out, '<rect fill="#f8fafc"/><rect fill="rgba(1,2,3,0.5)"/><rect fill="#0f172a"/>');
});

test("flattenVars resolves aliases and stops on cycles", () => {
  const svg = '<style>:root { --label: var(--text); --a: var(--b); --b: var(--a); }</style><text fill="var(--label)"/><rect fill="var(--a)"/>';
  const { svg: out, missing } = flattenVars(svg, loadTheme("light"));
  assert.match(out, /<text fill="#0f172a"\/>/);
  assert.doesNotMatch(out, /<text fill="var/);
  assert.ok(missing.length > 0);
});

test("flattenVars reports variables it cannot resolve", () => {
  const { missing } = flattenVars('<rect fill="var(--typo)"/>', loadTheme("dark"));
  assert.deepEqual(missing, ["--typo"]);
});

test("reference examples use only theme variables for colors", () => {
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "references");
  const known = new Set(Object.keys(loadTheme("dark")));
  for (const file of readdirSync(dir)) {
    const text = readFileSync(path.join(dir, file), "utf8");
    assert.doesNotMatch(text, /(?:fill|stroke)="(?:#[0-9a-fA-F]{3,8}|rgba?\(|white|black)/, file);
    for (const m of text.matchAll(/var\((--[\w-]+)\)/g)) assert.ok(known.has(m[1]), `${file}: ${m[1]}`);
  }
  assert.ok(THEMES_DIR.endsWith("themes"));
});
