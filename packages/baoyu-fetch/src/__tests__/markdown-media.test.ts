import { describe, expect, test } from "bun:test";
import {
  collectMediaFromDocument,
  collectMediaFromMarkdown,
  normalizeMarkdownMediaLinks,
  rewriteMarkdownMediaLinks,
} from "../media/markdown-media";

describe("markdown media helpers", () => {
  test("collects cover, image markdown, and plain media urls from a document", () => {
    const media = collectMediaFromDocument({
      url: "https://example.com/post",
      metadata: {
        coverImage: "https://cdn.example.com/cover.jpg",
      },
      content: [
        { type: "paragraph", text: "Poster: https://cdn.example.com/poster.png" },
        { type: "markdown", markdown: "![inline](https://cdn.example.com/body.webp)\n\n[video](https://cdn.example.com/clip.mp4)" },
      ],
    });

    expect(media).toEqual([
      { url: "https://cdn.example.com/cover.jpg", kind: "image", role: "cover" },
      { url: "https://cdn.example.com/poster.png", kind: "image", role: "inline" },
      { url: "https://cdn.example.com/body.webp", kind: "image", role: "inline" },
      { url: "https://cdn.example.com/clip.mp4", kind: "video", role: "inline" },
    ]);
  });

  test("rewrites markdown links, frontmatter cover images, and plain url mentions", () => {
    const markdown = `---
coverImage: "https://cdn.example.com/cover.jpg"
---

![inline](https://cdn.example.com/body.webp)

Poster: https://cdn.example.com/poster.png
`;

    const rewritten = rewriteMarkdownMediaLinks(markdown, [
      {
        url: "https://cdn.example.com/cover.jpg",
        localPath: "imgs/img-001-cover.jpg",
        absolutePath: "/tmp/imgs/img-001-cover.jpg",
        kind: "image",
      },
      {
        url: "https://cdn.example.com/body.webp",
        localPath: "imgs/img-002-body.webp",
        absolutePath: "/tmp/imgs/img-002-body.webp",
        kind: "image",
      },
      {
        url: "https://cdn.example.com/poster.png",
        localPath: "imgs/img-003-poster.png",
        absolutePath: "/tmp/imgs/img-003-poster.png",
        kind: "image",
      },
    ]);

    expect(rewritten).toContain('coverImage: "imgs/img-001-cover.jpg"');
    expect(rewritten).toContain("![inline](imgs/img-002-body.webp)");
    expect(rewritten).toContain("Poster: imgs/img-003-poster.png");
  });

  test("normalizes and dedupes linked Substack CDN image variants", () => {
    const resizedUrl =
      "https://substackcdn.com/image/fetch/$s_!wORh!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb83f9d2f-711f-4edd-bc8a-303b8de422e5_1600x1300.png";
    const linkedUrl =
      "https://substackcdn.com/image/fetch/$s_!wORh!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb83f9d2f-711f-4edd-bc8a-303b8de422e5_1600x1300.png";
    const canonicalUrl =
      "https://substack-post-media.s3.amazonaws.com/public/images/b83f9d2f-711f-4edd-bc8a-303b8de422e5_1600x1300.png";
    const markdown = `[![](${resizedUrl})](${linkedUrl})`;

    expect(normalizeMarkdownMediaLinks(markdown)).toBe(`![](${canonicalUrl})`);
    expect(collectMediaFromMarkdown(markdown)).toEqual([
      {
        url: canonicalUrl,
        kind: "image",
        role: "inline",
      },
    ]);
  });

  test("collapses linked images when href equals image url after normalization", () => {
    const resizedUrl =
      "https://substackcdn.com/image/fetch/$s_!wORh!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb83f9d2f-711f-4edd-bc8a-303b8de422e5_1600x1300.png";
    const linkedUrl =
      "https://substackcdn.com/image/fetch/$s_!wORh!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb83f9d2f-711f-4edd-bc8a-303b8de422e5_1600x1300.png";
    const canonicalUrl =
      "https://substack-post-media.s3.amazonaws.com/public/images/b83f9d2f-711f-4edd-bc8a-303b8de422e5_1600x1300.png";
    const markdown = `[

![](${resizedUrl})

](${linkedUrl})`;

    expect(normalizeMarkdownMediaLinks(markdown)).toBe(`![](${canonicalUrl})`);
  });

  test("compacts linked images when href differs from the image url", () => {
    const markdown = `[

![diagram](https://cdn.example.com/body.webp)

](https://example.com/source)`;

    expect(normalizeMarkdownMediaLinks(markdown)).toBe(
      "[![diagram](https://cdn.example.com/body.webp)](https://example.com/source)",
    );
  });

  test("keeps single-line linked images on one line after parser-based normalization", () => {
    const markdown = `[![diagram](https://cdn.example.com/body.webp)](https://example.com/source)`;

    expect(normalizeMarkdownMediaLinks(markdown)).toBe(
      "[![diagram](https://cdn.example.com/body.webp)](https://example.com/source)",
    );
  });

  test("repairs broken linked image blocks without disturbing surrounding paragraphs", () => {
    const markdown = `Before

[

![diagram](https://cdn.example.com/body.webp)

](https://example.com/source)

After`;

    expect(normalizeMarkdownMediaLinks(markdown)).toBe(`Before

[![diagram](https://cdn.example.com/body.webp)](https://example.com/source)

After`);
  });

  test("keeps escaped quotes after urls in frontmatter strings", () => {
    const markdown = [
      "---",
      'title: "Andrew Ng on X: \\"New: https://t.co/VVkn1Dqp1N\\""',
      'coverImage: "https://cdn.example.com/cover image.jpg"',
      "---",
      "",
      "See https://t.co/VVkn1Dqp1N\\",
    ].join("\n");

    const normalized = normalizeMarkdownMediaLinks(markdown);
    const frontmatter = normalized.split("\n---")[0]!.replace(/^---\n/, "");

    expect(normalized).toContain('title: "Andrew Ng on X: \\"New: https://t.co/VVkn1Dqp1N\\""');
    expect(normalized).toContain('coverImage: "https://cdn.example.com/cover%20image.jpg"');
    expect(normalized).toContain("See https://t.co/VVkn1Dqp1N\\");
    expect(Bun.YAML.parse(frontmatter)).toEqual({
      title: 'Andrew Ng on X: "New: https://t.co/VVkn1Dqp1N"',
      coverImage: "https://cdn.example.com/cover%20image.jpg",
    });
  });
});
