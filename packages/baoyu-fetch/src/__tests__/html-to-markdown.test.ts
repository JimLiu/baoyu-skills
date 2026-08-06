import { afterEach, describe, expect, test } from "bun:test";
import {
  convertHtmlToMarkdown,
  extractTitleFromMarkdownDocument,
} from "../extract/html-to-markdown";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("extractTitleFromMarkdownDocument", () => {
  test("prefers frontmatter title when present", () => {
    const title = extractTitleFromMarkdownDocument(`---
title: "Frontmatter Title"
---

# Heading Title
`);

    expect(title).toBe("Frontmatter Title");
  });

  test("falls back to the first markdown heading", () => {
    const title = extractTitleFromMarkdownDocument(`
Intro text

# Heading Title

Body text.
`);

    expect(title).toBe("Heading Title");
  });
});

describe("convertHtmlToMarkdown CSS robustness", () => {
  // Browsers serialize the `background` shorthand in its full form, which carries
  // both a background-origin and a background-clip box value. Any page captured
  // from a live DOM (CDP, DevTools copy, WeChat article pages, ...) is full of it.
  // jsdom <30 failed to parse that value and then crashed while rebuilding the
  // shorthand, taking down the whole document parse.
  test("parses browser-serialized background shorthand without crashing", async () => {
    const html = `<!doctype html><html><head><title>Local Title</title></head><body>
<article style="background: none left top / auto no-repeat scroll padding-box border-box rgba(0, 0, 0, 0); color: rgb(0, 0, 0);">
<h1>Article Heading</h1>
<p style="background: padding-box border-box; font-size: 16px;">First paragraph carrying enough prose that the extractor keeps the article body instead of discarding it as boilerplate.</p>
<p>Second paragraph so the readability heuristics have a real block of content to score against and retain.</p>
</article>
</body></html>`;

    const result = await convertHtmlToMarkdown(html, "https://example.com/post");

    expect(result.markdown).toContain("First paragraph");
  });
});

describe("convertHtmlToMarkdown remote fallback", () => {
  test("does not call defuddle.md when the remote fallback option is disabled", async () => {
    let fetchCalls = 0;
    globalThis.fetch = Object.assign(
      async () => {
        fetchCalls += 1;
        return new Response("# Remote Title\n\nRemote body.", {
          headers: {
            "content-type": "text/markdown",
          },
        });
      },
      {
        preconnect: originalFetch.preconnect,
      },
    ) as typeof fetch;

    const result = await convertHtmlToMarkdown(
      "<!doctype html><html><head><title>Local Title</title></head><body></body></html>",
      "https://example.com/post",
    );

    expect(fetchCalls).toBe(0);
    expect(result.conversionMethod).not.toBe("defuddle-api");
  });

  test("uses defuddle.md markdown when local extraction is empty", async () => {
    const fetchCalls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
    globalThis.fetch = Object.assign(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        fetchCalls.push({ input, init });
        return new Response(`---
title: "Remote Title"
---

# Remote Title

Remote body.
`, {
          headers: {
            "content-type": "text/markdown",
          },
        });
      },
      {
        preconnect: originalFetch.preconnect,
      },
    ) as typeof fetch;

    const result = await convertHtmlToMarkdown(
      "<!doctype html><html><head><title>Local Title</title></head><body></body></html>",
      "https://example.com/post",
      { enableRemoteMarkdownFallback: true },
    );

    expect(fetchCalls).toHaveLength(1);
    expect(String(fetchCalls[0]?.input)).toBe(
      "https://defuddle.md/https%3A%2F%2Fexample.com%2Fpost",
    );
    expect(fetchCalls[0]?.init?.headers).toEqual({
      accept: "text/markdown,text/plain;q=0.9,*/*;q=0.1",
    });
    expect(result.conversionMethod).toBe("defuddle-api");
    expect(result.metadata.title).toBe("Remote Title");
    expect(result.markdown).toBe("# Remote Title\n\nRemote body.");
    expect(result.fallbackReason).toContain("defuddle.md");
  });
});
