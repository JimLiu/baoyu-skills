import { parseHTML } from "linkedom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

export interface PageMetadata {
  url: string;
  title: string;
  description?: string;
  author?: string;
  published?: string;
  coverImage?: string;
  captured_at: string;
}

export interface ConversionResult {
  metadata: PageMetadata;
  markdown: string;
  rawHtml: string;
  conversionMethod: string;
  fallbackReason?: string;
}

interface ExtractionCandidate {
  title: string | null;
  byline: string | null;
  excerpt: string | null;
  published: string | null;
  html: string | null;
  textContent: string;
  method: string;
}

type AnyRecord = Record<string, unknown>;

const MIN_CONTENT_LENGTH = 120;
const GOOD_CONTENT_LENGTH = 900;

const CONTENT_SELECTORS = [
  "article",
  "main article",
  "[role='main'] article",
  "[itemprop='articleBody']",
  ".article-content",
  ".article-body",
  ".post-content",
  ".entry-content",
  ".story-body",
  "main",
  "[role='main']",
  "#content",
  ".content",
];

const REMOVE_SELECTORS = [
  "script",
  "style",
  "noscript",
  "template",
  "iframe",
  "svg",
  "path",
  "nav",
  "aside",
  "footer",
  "header",
  "form",
  ".advertisement",
  ".ads",
  ".social-share",
  ".related-articles",
  ".comments",
  ".newsletter",
  ".cookie-banner",
  ".cookie-consent",
  "[role='navigation']",
  "[aria-label*='cookie' i]",
];

const PUBLISHED_TIME_SELECTORS = [
  "meta[property='article:published_time']",
  "meta[name='pubdate']",
  "meta[name='publishdate']",
  "meta[name='date']",
  "time[datetime]",
];

const ARTICLE_TYPES = new Set([
  "Article",
  "NewsArticle",
  "BlogPosting",
  "WebPage",
  "ReportageNewsArticle",
]);

const NEXT_DATA_CONTENT_PATHS = [
  "props.pageProps.content.body",
  "props.pageProps.article.body",
  "props.pageProps.article.content",
  "props.pageProps.post.body",
  "props.pageProps.post.content",
  "props.pageProps.data.body",
  "props.pageProps.story.body.content",
];

const LOW_QUALITY_MARKERS = [
  /Join The Conversation/i,
  /One Community\. Many Voices/i,
  /Read our community guidelines/i,
  /Create a free account to share your thoughts/i,
  /Become a Forbes Member/i,
  /Subscribe to trusted journalism/i,
  /\bComments\b/i,
];

export const absolutizeUrlsScript = String.raw`
(function() {
  const baseUrl = document.baseURI || location.href;
  function toAbsolute(url) {
    if (!url) return url;
    try { return new URL(url, baseUrl).href; } catch { return url; }
  }
  function absAttr(sel, attr) {
    document.querySelectorAll(sel).forEach(el => {
      const v = el.getAttribute(attr);
      if (v) { const a = toAbsolute(v); if (a) el.setAttribute(attr, a); }
    });
  }
  function absSrcset(sel) {
    document.querySelectorAll(sel).forEach(el => {
      const s = el.getAttribute("srcset");
      if (!s) return;
      el.setAttribute("srcset", s.split(",").map(p => {
        const t = p.trim(); if (!t) return "";
        const [url, ...d] = t.split(/\s+/);
        return d.length ? toAbsolute(url) + " " + d.join(" ") : toAbsolute(url);
      }).filter(Boolean).join(", "));
    });
  }
  document.querySelectorAll("img[data-src], video[data-src], audio[data-src], source[data-src]").forEach(el => {
    const ds = el.getAttribute("data-src");
    if (ds && (!el.getAttribute("src") || el.getAttribute("src") === "" || el.getAttribute("src")?.startsWith("data:"))) {
      el.setAttribute("src", ds);
    }
  });
  absAttr("a[href]", "href");
  absAttr("img[src], video[src], audio[src], source[src]", "src");
  absSrcset("img[srcset], source[srcset]");
  return { html: document.documentElement.outerHTML };
})()
`;

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return null;
}

function normalizeMarkdown(markdown: string): string {
  return markdown
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseDocument(html: string): Document {
  const normalized = /<\s*html[\s>]/i.test(html)
    ? html
    : `<!doctype html><html><body>${html}</body></html>`;
  return parseHTML(normalized).document as unknown as Document;
}

function sanitizeHtml(html: string): string {
  const { document } = parseHTML(`<div id="__root">${html}</div>`);
  const root = document.querySelector("#__root");
  if (!root) return html;

  for (const selector of ["script", "style", "iframe", "noscript", "template", "svg", "path"]) {
    for (const el of root.querySelectorAll(selector)) {
      el.remove();
    }
  }

  return root.innerHTML;
}

function extractTextFromHtml(html: string): string {
  const { document } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);
  for (const selector of ["script", "style", "noscript", "template", "iframe", "svg", "path"]) {
    for (const el of document.querySelectorAll(selector)) {
      el.remove();
    }
  }
  return document.body?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function getMetaContent(document: Document, names: string[]): string | null {
  for (const name of names) {
    const element =
      document.querySelector(`meta[name="${name}"]`) ??
      document.querySelector(`meta[property="${name}"]`);
    const content = element?.getAttribute("content");
    if (content && content.trim()) return content.trim();
  }
  return null;
}

function flattenJsonLdItems(data: unknown): AnyRecord[] {
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data)) return data.flatMap(flattenJsonLdItems);

  const item = data as AnyRecord;
  if (Array.isArray(item["@graph"])) {
    return (item["@graph"] as unknown[]).flatMap(flattenJsonLdItems);
  }

  return [item];
}

function parseJsonLdScripts(document: Document): AnyRecord[] {
  const results: AnyRecord[] = [];
  const scripts = document.querySelectorAll("script[type='application/ld+json']");

  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent ?? "");
      results.push(...flattenJsonLdItems(data));
    } catch {
      // Ignore malformed blocks.
    }
  }

  return results;
}

function isArticleType(item: AnyRecord): boolean {
  const value = Array.isArray(item["@type"]) ? item["@type"][0] : item["@type"];
  return typeof value === "string" && ARTICLE_TYPES.has(value);
}

function extractAuthorFromJsonLd(authorData: unknown): string | null {
  if (typeof authorData === "string") return authorData;
  if (!authorData || typeof authorData !== "object") return null;

  if (Array.isArray(authorData)) {
    const names = authorData
      .map((author) => extractAuthorFromJsonLd(author))
      .filter((name): name is string => Boolean(name));
    return names.length > 0 ? names.join(", ") : null;
  }

  const author = authorData as AnyRecord;
  return typeof author.name === "string" ? author.name : null;
}

function extractPrimaryJsonLdMeta(document: Document): Partial<PageMetadata> {
  for (const item of parseJsonLdScripts(document)) {
    if (!isArticleType(item)) continue;

    return {
      title: pickString(item.headline, item.name) ?? undefined,
      description: pickString(item.description) ?? undefined,
      author: extractAuthorFromJsonLd(item.author) ?? undefined,
      published: pickString(item.datePublished, item.dateCreated) ?? undefined,
      coverImage:
        pickString(
          item.image,
          (item.image as AnyRecord | undefined)?.url,
          (Array.isArray(item.image) ? item.image[0] : undefined) as unknown
        ) ?? undefined,
    };
  }

  return {};
}

function extractPublishedTime(document: Document): string | null {
  for (const selector of PUBLISHED_TIME_SELECTORS) {
    const el = document.querySelector(selector);
    if (!el) continue;
    const value = el.getAttribute("content") ?? el.getAttribute("datetime");
    if (value && value.trim()) return value.trim();
  }
  return null;
}

function extractTitle(document: Document): string | null {
  const ogTitle = document.querySelector("meta[property='og:title']")?.getAttribute("content");
  if (ogTitle && ogTitle.trim()) return ogTitle.trim();

  const twitterTitle = document.querySelector("meta[name='twitter:title']")?.getAttribute("content");
  if (twitterTitle && twitterTitle.trim()) return twitterTitle.trim();

  const title = document.querySelector("title")?.textContent?.trim();
  if (title) {
    const cleaned = title.split(/\s*[-|–—]\s*/)[0]?.trim();
    if (cleaned) return cleaned;
  }

  const h1 = document.querySelector("h1")?.textContent?.trim();
  return h1 || null;
}

function extractMetadataFromHtml(html: string, url: string, capturedAt: string): PageMetadata {
  const document = parseDocument(html);
  const jsonLd = extractPrimaryJsonLdMeta(document);
  const timeEl = document.querySelector("time[datetime]");

  return {
    url,
    title:
      pickString(
        getMetaContent(document, ["og:title", "twitter:title"]),
        jsonLd.title,
        document.querySelector("h1")?.textContent,
        document.title
      ) ?? "",
    description:
      pickString(
        getMetaContent(document, ["description", "og:description", "twitter:description"]),
        jsonLd.description
      ) ?? undefined,
    author:
      pickString(
        getMetaContent(document, ["author", "article:author", "twitter:creator"]),
        jsonLd.author
      ) ?? undefined,
    published:
      pickString(
        timeEl?.getAttribute("datetime"),
        getMetaContent(document, ["article:published_time", "datePublished", "publishdate", "date"]),
        jsonLd.published,
        extractPublishedTime(document)
      ) ?? undefined,
    coverImage:
      pickString(
        getMetaContent(document, ["og:image", "twitter:image", "twitter:image:src"]),
        jsonLd.coverImage
      ) ?? undefined,
    captured_at: capturedAt,
  };
}

function generateExcerpt(excerpt: string | null, textContent: string | null): string | null {
  if (excerpt) return excerpt;
  if (!textContent) return null;
  const trimmed = textContent.trim();
  if (!trimmed) return null;
  return trimmed.length > 200 ? `${trimmed.slice(0, 200)}...` : trimmed;
}

function parseJsonLdItem(item: AnyRecord): ExtractionCandidate | null {
  if (!isArticleType(item)) return null;

  const rawContent =
    (typeof item.articleBody === "string" && item.articleBody) ||
    (typeof item.text === "string" && item.text) ||
    (typeof item.description === "string" && item.description) ||
    null;

  if (!rawContent) return null;

  const content = rawContent.trim();
  const htmlLike = /<\/?[a-z][\s\S]*>/i.test(content);
  const textContent = htmlLike ? extractTextFromHtml(content) : content;

  if (textContent.length < MIN_CONTENT_LENGTH) return null;

  return {
    title: pickString(item.headline, item.name),
    byline: extractAuthorFromJsonLd(item.author),
    excerpt: pickString(item.description),
    published: pickString(item.datePublished, item.dateCreated),
    html: htmlLike ? content : null,
    textContent,
    method: "json-ld",
  };
}

function tryJsonLdExtraction(document: Document): ExtractionCandidate | null {
  for (const item of parseJsonLdScripts(document)) {
    const extracted = parseJsonLdItem(item);
    if (extracted) return extracted;
  }
  return null;
}

function getByPath(value: unknown, path: string): unknown {
  let current = value;
  for (const part of path.split(".")) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as AnyRecord)[part];
  }
  return current;
}

function isContentBlockArray(value: unknown): value is AnyRecord[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.slice(0, 5).some((item) => {
    if (!item || typeof item !== "object") return false;
    const obj = item as AnyRecord;
    return "type" in obj || "text" in obj || "textHtml" in obj || "content" in obj;
  });
}

function extractTextFromContentBlocks(blocks: AnyRecord[]): string {
  const parts: string[] = [];

  function pushParagraph(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    parts.push(trimmed, "\n\n");
  }

  function walk(node: unknown): void {
    if (!node || typeof node !== "object") return;
    const block = node as AnyRecord;

    if (typeof block.text === "string") {
      pushParagraph(block.text);
      return;
    }

    if (typeof block.textHtml === "string") {
      pushParagraph(extractTextFromHtml(block.textHtml));
      return;
    }

    if (Array.isArray(block.items)) {
      for (const item of block.items) {
        if (item && typeof item === "object") {
          const text = pickString((item as AnyRecord).text);
          if (text) parts.push(`- ${text}\n`);
        }
      }
      parts.push("\n");
    }

    if (Array.isArray(block.components)) {
      for (const component of block.components) {
        walk(component);
      }
    }

    if (Array.isArray(block.content)) {
      for (const child of block.content) {
        walk(child);
      }
    }
  }

  for (const block of blocks) {
    walk(block);
  }

  return parts.join("").replace(/\n{3,}/g, "\n\n").trim();
}

function tryStringBodyExtraction(
  content: string,
  meta: AnyRecord,
  document: Document,
  method: string
): ExtractionCandidate | null {
  if (!content || content.length < MIN_CONTENT_LENGTH) return null;

  const isHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  const html = isHtml ? sanitizeHtml(content) : null;
  const textContent = isHtml ? extractTextFromHtml(html) : content.trim();

  if (textContent.length < MIN_CONTENT_LENGTH) return null;

  return {
    title: pickString(meta.headline, meta.title, extractTitle(document)),
    byline: pickString(meta.byline, meta.author),
    excerpt: pickString(meta.description, meta.excerpt, generateExcerpt(null, textContent)),
    published: pickString(meta.datePublished, meta.publishedAt, extractPublishedTime(document)),
    html,
    textContent,
    method,
  };
}

function tryNextDataExtraction(document: Document): ExtractionCandidate | null {
  try {
    const script = document.querySelector("script#__NEXT_DATA__");
    if (!script?.textContent) return null;

    const data = JSON.parse(script.textContent) as AnyRecord;
    const pageProps = (getByPath(data, "props.pageProps") ?? {}) as AnyRecord;

    for (const path of NEXT_DATA_CONTENT_PATHS) {
      const value = getByPath(data, path);

      if (typeof value === "string") {
        const parentPath = path.split(".").slice(0, -1).join(".");
        const parent = (getByPath(data, parentPath) ?? {}) as AnyRecord;
        const meta = {
          ...pageProps,
          ...parent,
          title: parent.title ?? (pageProps.title as string | undefined),
        };

        const candidate = tryStringBodyExtraction(value, meta, document, "next-data");
        if (candidate) return candidate;
      }

      if (isContentBlockArray(value)) {
        const textContent = extractTextFromContentBlocks(value);
        if (textContent.length < MIN_CONTENT_LENGTH) continue;

        return {
          title: pickString(
            getByPath(data, "props.pageProps.content.headline"),
            getByPath(data, "props.pageProps.article.headline"),
            getByPath(data, "props.pageProps.article.title"),
            getByPath(data, "props.pageProps.post.title"),
            pageProps.title,
            extractTitle(document)
          ),
          byline: pickString(
            getByPath(data, "props.pageProps.author.name"),
            getByPath(data, "props.pageProps.article.author.name")
          ),
          excerpt: pickString(
            getByPath(data, "props.pageProps.content.description"),
            getByPath(data, "props.pageProps.article.description"),
            pageProps.description,
            generateExcerpt(null, textContent)
          ),
          published: pickString(
            getByPath(data, "props.pageProps.content.datePublished"),
            getByPath(data, "props.pageProps.article.datePublished"),
            getByPath(data, "props.pageProps.publishedAt"),
            extractPublishedTime(document)
          ),
          html: null,
          textContent,
          method: "next-data",
        };
      }
    }
  } catch {
    return null;
  }

  return null;
}

function buildReadabilityCandidate(
  article: ReturnType<Readability["parse"]>,
  document: Document,
  method: string
): ExtractionCandidate | null {
  const textContent = article?.textContent?.trim() ?? "";
  if (textContent.length < MIN_CONTENT_LENGTH) return null;

  return {
    title: pickString(article?.title, extractTitle(document)),
    byline: pickString((article as { byline?: string } | null)?.byline),
    excerpt: pickString(article?.excerpt, generateExcerpt(null, textContent)),
    published: pickString((article as { publishedTime?: string } | null)?.publishedTime, extractPublishedTime(document)),
    html: article?.content ? sanitizeHtml(article.content) : null,
    textContent,
    method,
  };
}

function tryReadability(document: Document): ExtractionCandidate | null {
  try {
    const strictClone = document.cloneNode(true) as Document;
    const strictResult = buildReadabilityCandidate(
      new Readability(strictClone).parse(),
      document,
      "readability"
    );
    if (strictResult) return strictResult;

    const relaxedClone = document.cloneNode(true) as Document;
    return buildReadabilityCandidate(
      new Readability(relaxedClone, { charThreshold: 120 }).parse(),
      document,
      "readability-relaxed"
    );
  } catch {
    return null;
  }
}

function trySelectorExtraction(document: Document): ExtractionCandidate | null {
  for (const selector of CONTENT_SELECTORS) {
    const element = document.querySelector(selector);
    if (!element) continue;

    const clone = element.cloneNode(true) as Element;
    for (const removeSelector of REMOVE_SELECTORS) {
      for (const node of clone.querySelectorAll(removeSelector)) {
        node.remove();
      }
    }

    const html = sanitizeHtml(clone.innerHTML);
    const textContent = extractTextFromHtml(html);
    if (textContent.length < MIN_CONTENT_LENGTH) continue;

    return {
      title: extractTitle(document),
      byline: null,
      excerpt: generateExcerpt(null, textContent),
      published: extractPublishedTime(document),
      html,
      textContent,
      method: `selector:${selector}`,
    };
  }

  return null;
}

function tryBodyExtraction(document: Document): ExtractionCandidate | null {
  const body = document.body;
  if (!body) return null;

  const clone = body.cloneNode(true) as Element;
  for (const removeSelector of REMOVE_SELECTORS) {
    for (const node of clone.querySelectorAll(removeSelector)) {
      node.remove();
    }
  }

  const html = sanitizeHtml(clone.innerHTML);
  const textContent = extractTextFromHtml(html);
  if (!textContent) return null;

  return {
    title: extractTitle(document),
    byline: null,
    excerpt: generateExcerpt(null, textContent),
    published: extractPublishedTime(document),
    html,
    textContent,
    method: "body-fallback",
  };
}

function pickBestCandidate(candidates: ExtractionCandidate[]): ExtractionCandidate | null {
  if (candidates.length === 0) return null;

  const methodOrder = [
    "readability",
    "readability-relaxed",
    "next-data",
    "json-ld",
    "selector:",
    "body-fallback",
  ];

  function methodRank(method: string): number {
    const idx = methodOrder.findIndex((entry) =>
      entry.endsWith(":") ? method.startsWith(entry) : method === entry
    );
    return idx === -1 ? methodOrder.length : idx;
  }

  const ranked = [...candidates].sort((a, b) => {
    const rankA = methodRank(a.method);
    const rankB = methodRank(b.method);
    if (rankA !== rankB) return rankA - rankB;
    return (b.textContent.length ?? 0) - (a.textContent.length ?? 0);
  });

  for (const candidate of ranked) {
    if (candidate.textContent.length >= GOOD_CONTENT_LENGTH) {
      return candidate;
    }
  }

  for (const candidate of ranked) {
    if (candidate.textContent.length >= MIN_CONTENT_LENGTH) {
      return candidate;
    }
  }

  return ranked[0];
}

function extractFromHtml(html: string): ExtractionCandidate | null {
  const document = parseDocument(html);

  const readabilityCandidate = tryReadability(document);
  const nextDataCandidate = tryNextDataExtraction(document);
  const jsonLdCandidate = tryJsonLdExtraction(document);
  const selectorCandidate = trySelectorExtraction(document);
  const bodyCandidate = tryBodyExtraction(document);

  const candidates = [
    readabilityCandidate,
    nextDataCandidate,
    jsonLdCandidate,
    selectorCandidate,
    bodyCandidate,
  ].filter((candidate): candidate is ExtractionCandidate => Boolean(candidate));

  const winner = pickBestCandidate(candidates);
  if (!winner) return null;

  return {
    ...winner,
    title: winner.title ?? extractTitle(document),
    published: winner.published ?? extractPublishedTime(document),
    excerpt: winner.excerpt ?? generateExcerpt(null, winner.textContent),
  };
}

const turndown = new TurndownService({
  headingStyle: "atx",
  hr: "---",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
  strongDelimiter: "**",
  linkStyle: "inlined",
});

turndown.use(gfm);
turndown.remove(["script", "style", "iframe", "noscript", "template", "svg", "path"]);

turndown.addRule("collapseFigure", {
  filter: "figure",
  replacement(content) {
    return `\n\n${content.trim()}\n\n`;
  },
});

turndown.addRule("dropInvisibleAnchors", {
  filter(node) {
    return node.nodeName === "A" && !(node as Element).textContent?.trim();
  },
  replacement() {
    return "";
  },
});

function convertHtmlToMarkdown(html: string): string {
  if (!html || !html.trim()) return "";

  try {
    const sanitized = sanitizeHtml(html);
    return turndown.turndown(sanitized);
  } catch {
    return "";
  }
}

function fallbackPlainText(html: string): string {
  const document = parseDocument(html);
  for (const selector of ["script", "style", "noscript", "template", "iframe", "svg", "path"]) {
    for (const el of document.querySelectorAll(selector)) {
      el.remove();
    }
  }
  const text = document.body?.textContent ?? document.documentElement?.textContent ?? "";
  return normalizeMarkdown(text.replace(/\s+/g, " "));
}

function countBylines(markdown: string): number {
  return (markdown.match(/(^|\n)By\s+/g) || []).length;
}

function countUsefulParagraphs(markdown: string): number {
  const paragraphs = normalizeMarkdown(markdown).split(/\n{2,}/);
  let count = 0;

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;
    if (/^!?\[[^\]]*\]\([^)]+\)$/.test(trimmed)) continue;
    if (/^#{1,6}\s+/.test(trimmed)) continue;
    if ((trimmed.match(/\b[\p{L}\p{N}']+\b/gu) || []).length < 8) continue;
    count++;
  }

  return count;
}

function countMarkerHits(markdown: string, markers: RegExp[]): number {
  let hits = 0;
  for (const marker of markers) {
    if (marker.test(markdown)) hits++;
  }
  return hits;
}

function scoreMarkdownQuality(markdown: string): number {
  const normalized = normalizeMarkdown(markdown);
  const wordCount = (normalized.match(/\b[\p{L}\p{N}']+\b/gu) || []).length;
  const usefulParagraphs = countUsefulParagraphs(normalized);
  const headingCount = (normalized.match(/^#{1,6}\s+/gm) || []).length;
  const markerHits = countMarkerHits(normalized, LOW_QUALITY_MARKERS);
  const bylineCount = countBylines(normalized);
  const staffCount = (normalized.match(/\bForbes Staff\b/gi) || []).length;

  return (
    Math.min(wordCount, 4000) +
    usefulParagraphs * 40 +
    headingCount * 10 -
    markerHits * 180 -
    Math.max(0, bylineCount - 1) * 120 -
    Math.max(0, staffCount - 1) * 80
  );
}

function shouldCompareWithLegacy(markdown: string): boolean {
  const normalized = normalizeMarkdown(markdown);
  return (
    countMarkerHits(normalized, LOW_QUALITY_MARKERS) > 0 ||
    countBylines(normalized) > 1 ||
    countUsefulParagraphs(normalized) < 6
  );
}

function isMarkdownUsable(markdown: string, html: string): boolean {
  const normalized = normalizeMarkdown(markdown);
  if (!normalized) return false;

  const htmlTextLength = extractTextFromHtml(html).length;
  if (htmlTextLength < MIN_CONTENT_LENGTH) return true;

  if (normalized.length >= 80) return true;
  return normalized.length >= Math.min(200, Math.floor(htmlTextLength * 0.2));
}

async function tryDefuddleConversion(
  html: string,
  url: string,
  baseMetadata: PageMetadata
): Promise<{ ok: true; result: ConversionResult } | { ok: false; reason: string }> {
  try {
    const [{ JSDOM, VirtualConsole }, { Defuddle }] = await Promise.all([
      import("jsdom"),
      import("defuddle/node"),
    ]);

    const virtualConsole = new VirtualConsole();
    virtualConsole.on("jsdomError", (error: Error & { type?: string }) => {
      if (error.type === "css parsing" || /Could not parse CSS stylesheet/i.test(error.message)) {
        return;
      }
      console.warn(`[url-to-markdown] jsdom: ${error.message}`);
    });

    const dom = new JSDOM(html, { url, virtualConsole });
    const result = await Defuddle(dom, url, { markdown: true });
    const markdown = normalizeMarkdown(result.content || "");

    if (!isMarkdownUsable(markdown, html)) {
      return { ok: false, reason: "Defuddle returned empty or incomplete markdown" };
    }

    return {
      ok: true,
      result: {
        metadata: {
          ...baseMetadata,
          title: pickString(result.title, baseMetadata.title) ?? "",
          description: pickString(result.description, baseMetadata.description) ?? undefined,
          author: pickString(result.author, baseMetadata.author) ?? undefined,
          published: pickString(result.published, baseMetadata.published) ?? undefined,
          coverImage: pickString(result.image, baseMetadata.coverImage) ?? undefined,
        },
        markdown,
        rawHtml: html,
        conversionMethod: "defuddle",
      },
    };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

function convertWithLegacyExtractor(html: string, baseMetadata: PageMetadata): ConversionResult {
  const extracted = extractFromHtml(html);

  let markdown = extracted?.html ? convertHtmlToMarkdown(extracted.html) : "";
  if (!markdown.trim()) {
    markdown = extracted?.textContent?.trim() || fallbackPlainText(html);
  }

  return {
    metadata: {
      ...baseMetadata,
      title: pickString(extracted?.title, baseMetadata.title) ?? "",
      description: pickString(extracted?.excerpt, baseMetadata.description) ?? undefined,
      author: pickString(extracted?.byline, baseMetadata.author) ?? undefined,
      published: pickString(extracted?.published, baseMetadata.published) ?? undefined,
    },
    markdown: normalizeMarkdown(markdown),
    rawHtml: html,
    conversionMethod: extracted ? `legacy:${extracted.method}` : "legacy:plain-text",
  };
}

export async function extractContent(html: string, url: string): Promise<ConversionResult> {
  const capturedAt = new Date().toISOString();
  const baseMetadata = extractMetadataFromHtml(html, url, capturedAt);

  const defuddleResult = await tryDefuddleConversion(html, url, baseMetadata);
  if (defuddleResult.ok) {
    if (shouldCompareWithLegacy(defuddleResult.result.markdown)) {
      const legacyResult = convertWithLegacyExtractor(html, baseMetadata);
      const legacyScore = scoreMarkdownQuality(legacyResult.markdown);
      const defuddleScore = scoreMarkdownQuality(defuddleResult.result.markdown);

      if (legacyScore > defuddleScore + 120) {
        return {
          ...legacyResult,
          fallbackReason: "Legacy extractor produced higher-quality markdown than Defuddle",
        };
      }
    }

    return defuddleResult.result;
  }

  const fallbackResult = convertWithLegacyExtractor(html, baseMetadata);
  return {
    ...fallbackResult,
    fallbackReason: defuddleResult.reason,
  };
}

function escapeYamlValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, "\\n");
}

export function formatMetadataYaml(meta: PageMetadata): string {
  const lines = ["---"];
  lines.push(`url: ${meta.url}`);
  lines.push(`title: "${escapeYamlValue(meta.title)}"`);
  if (meta.description) lines.push(`description: "${escapeYamlValue(meta.description)}"`);
  if (meta.author) lines.push(`author: "${escapeYamlValue(meta.author)}"`);
  if (meta.published) lines.push(`published: "${escapeYamlValue(meta.published)}"`);
  if (meta.coverImage) lines.push(`coverImage: "${escapeYamlValue(meta.coverImage)}"`);
  lines.push(`captured_at: "${escapeYamlValue(meta.captured_at)}"`);
  lines.push("---");
  return lines.join("\n");
}

export function createMarkdownDocument(result: ConversionResult): string {
  const yaml = formatMetadataYaml(result.metadata);
  const escapedTitle = result.metadata.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const titleRegex = new RegExp(`^#\\s+${escapedTitle}\\s*(\\n|$)`, "i");
  const hasTitle = titleRegex.test(result.markdown.trimStart());
  const title = result.metadata.title && !hasTitle ? `\n\n# ${result.metadata.title}\n\n` : "\n\n";
  return yaml + title + result.markdown;
}
