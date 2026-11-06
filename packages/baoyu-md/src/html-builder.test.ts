import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_STYLE } from "./constants.ts";
import {
  buildCss,
  buildHtmlDocument,
  modifyHtmlStructure,
  normalizeCssText,
  normalizeInlineCss,
  removeFirstHeading,
} from "./html-builder.ts";

test("buildCss injects style variables and concatenates base and theme CSS", () => {
  const css = buildCss("body { color: red; }", ".theme { color: blue; }");

  assert.match(css, /--md-primary-color: #0F4C81;/);
  assert.match(css, /body \{ color: red; \}/);
  assert.match(css, /\.theme \{ color: blue; \}/);
});

test("buildHtmlDocument includes optional meta tags and code theme CSS", () => {
  const html = buildHtmlDocument(
    {
      title: "Doc",
      author: "Baoyu",
      description: "Summary",
    },
    "body { color: red; }",
    "<article>Hello</article>",
    ".hljs { color: blue; }",
  );

  assert.match(html, /<title>Doc<\/title>/);
  assert.match(html, /meta name="author" content="Baoyu"/);
  assert.match(html, /meta name="description" content="Summary"/);
  assert.match(html, /<style>body \{ color: red; \}<\/style>/);
  assert.match(html, /<style>\.hljs \{ color: blue; \}<\/style>/);
  assert.match(html, /<article>Hello<\/article>/);
});

test("buildHtmlDocument escapes head metadata attributes", () => {
  const html = buildHtmlDocument(
    {
      title: `Doc <draft>`,
      author: `Bao"yu`,
      description: `<p style="color: red">Summary & notes</p>`,
    },
    "",
    "",
  );

  assert.match(html, /<title>Doc &lt;draft&gt;<\/title>/);
  assert.match(html, /meta name="author" content="Bao&quot;yu"/);
  assert.match(html, /meta name="description" content="&lt;p style=&quot;color: red&quot;&gt;Summary &amp; notes&lt;\/p&gt;"/);
});

test("normalizeCssText and normalizeInlineCss replace variables and strip declarations", () => {
  const rawCss = `
:root { --md-primary-color: #000; --md-font-size: 12px; --foreground: 0 0% 5%; }
.box { color: var(--md-primary-color); font-size: var(--md-font-size); background: hsl(var(--foreground)); }
`;

  const normalizedCss = normalizeCssText(rawCss, DEFAULT_STYLE);
  assert.match(normalizedCss, /color: #0F4C81/);
  assert.match(normalizedCss, /font-size: 16px/);
  assert.match(normalizedCss, /background: #3f3f3f/);
  assert.doesNotMatch(normalizedCss, /--md-primary-color/);

  const normalizedHtml = normalizeInlineCss(
    `<style>${rawCss}</style><div style="color: var(--md-primary-color)"></div>`,
    DEFAULT_STYLE,
  );
  assert.match(normalizedHtml, /color: #0F4C81/);
  assert.doesNotMatch(normalizedHtml, /var\(--md-primary-color\)/);
});

test("normalizeInlineCss removes quoted custom property values without leaving fragments behind", () => {
  const normalizedHtml = normalizeInlineCss(
    `<html style="--md-font-family: Menlo, Monaco, 'Courier New', monospace; color: var(--md-primary-color)"></html>`,
    DEFAULT_STYLE,
  );

  assert.match(normalizedHtml, /style=" color: #0F4C81"/);
  assert.doesNotMatch(normalizedHtml, /Courier New/);
  assert.doesNotMatch(normalizedHtml, /--md-font-family/);
});

test("normalizeCssText resolves srgb hex color-mix with transparent to rgba", () => {
  const css = [
    "a { background: color-mix(in srgb, #009874 8%, transparent); }",
    "b { background: color-mix(in srgb, #c33 35%, transparent); }",
    "c { background: color-mix(in srgb, #000000 12.5%, transparent); }",
    "d { background: color-mix(in srgb, #ffffff 150%, transparent); }",
    "e { background: color-mix( in srgb , #0F4C81 10% , transparent ); }",
    "f { background: color-mix(in srgb, var(--md-primary-color) 10%, transparent); }",
  ].join("\n");

  const normalized = normalizeCssText(css, DEFAULT_STYLE);
  assert.match(normalized, /a \{ background: rgba\(0, 152, 116, 0\.08\); \}/);
  assert.match(normalized, /b \{ background: rgba\(204, 51, 51, 0\.35\); \}/);
  assert.match(normalized, /c \{ background: rgba\(0, 0, 0, 0\.125\); \}/);
  assert.match(normalized, /d \{ background: rgba\(255, 255, 255, 1\); \}/);
  assert.match(normalized, /e \{ background: rgba\(15, 76, 129, 0\.1\); \}/);
  assert.match(normalized, /f \{ background: rgba\(15, 76, 129, 0\.1\); \}/);
  assert.doesNotMatch(normalized, /color-mix\(/);
});

test("normalizeCssText leaves color-mix forms it cannot resolve untouched", () => {
  const unchanged = [
    "color-mix(in srgb, red 10%, transparent)",
    "color-mix(in srgb, #009874 10%, white)",
    "color-mix(in oklch, #009874 10%, transparent)",
    "color-mix(in srgb, #009874cc 10%, transparent)",
  ];

  for (const value of unchanged) {
    const css = `x { background: ${value}; }`;
    assert.equal(normalizeCssText(css, DEFAULT_STYLE), css);
  }
});

test("HTML structure helpers hoist nested lists and remove the first heading", () => {
  const nestedList = `<ul><li>Parent<ul><li>Child</li></ul></li></ul>`;
  assert.equal(
    modifyHtmlStructure(nestedList),
    `<ul><li>Parent</li><ul><li>Child</li></ul></ul>`,
  );

  const html = `<h1>Title</h1><p>Intro</p><h2>Sub</h2>`;
  assert.equal(removeFirstHeading(html), `<p>Intro</p><h2>Sub</h2>`);
});
