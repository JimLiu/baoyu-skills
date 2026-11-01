# Image-Text Posting (贴图发表, formerly 图文)

WeChat renamed "图文" to "贴图" in the Official Account menu (2026).

## Usage

```bash
# Title/content extracted from markdown
${BUN_X} ./scripts/wechat-browser.ts --markdown source.md --images ./images/

# Explicit title and content
${BUN_X} ./scripts/wechat-browser.ts --title "标题" --content "内容" --image img1.png --image img2.png

# Save as draft
${BUN_X} ./scripts/wechat-browser.ts --markdown source.md --images ./images/ --submit
```

## Parameters

| Parameter | Description |
|-----------|-------------|
| `--markdown <path>` | Markdown file for title/content extraction |
| `--images <dir>` | Directory containing images (sorted by name) |
| `--title <text>` | Article title (max 20 chars, auto-compressed if too long) |
| `--content <text>` | Article content (max 1000 chars, auto-compressed if too long) |
| `--image <path>` | Single image file (can be repeated) |
| `--submit` | Save as draft (default: preview only) |
| `--profile <dir>` | Chrome profile directory |

Max 9 images (WeChat limit).

## Auto Title/Content from Markdown

With `--markdown`:

1. Title/author from frontmatter (`title`, `author`); else the H1 becomes the title.
2. Title compressed to 20 chars if longer (e.g. "如何在一天内彻底重塑你的人生" → "一天彻底重塑你的人生").
3. First paragraphs become content (max 1000 chars).

## Image Directory Mode

With `--images <dir>`: all PNG/JPG files are uploaded, sorted alphabetically by name (name them `01-cover.png`, `02-content.png`, …).

## Scripts

| Script | Purpose |
|--------|---------|
| `wechat-browser.ts` | Main image-text posting script |
| `cdp.ts` | Chrome DevTools Protocol utilities |
| `copy-to-clipboard.ts` | Clipboard operations |
