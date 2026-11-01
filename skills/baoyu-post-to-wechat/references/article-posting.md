# Article Posting (文章发表)

## Usage

```bash
${BUN_X} ./scripts/wechat-article.ts --markdown article.md
${BUN_X} ./scripts/wechat-article.ts --markdown article.md --theme grace --author "作者名" --summary "摘要"
```

## Parameters

| Parameter | Description |
|-----------|-------------|
| `--markdown <path>` | Markdown file to convert and post |
| `--theme <name>` | Theme: default, grace, simple, modern |
| `--no-cite` | Keep ordinary external links inline instead of converting them to bottom citations (default: convert) |
| `--title <text>` | Override title (auto-extracted from markdown) |
| `--author <name>` | Author name |
| `--summary <text>` | Article summary |
| `--html <path>` | Pre-rendered HTML file (alternative to markdown) |
| `--profile <dir>` | Chrome profile directory |

Frontmatter `title` / `author` are read; otherwise the first `#` heading becomes the title.

## Image Handling

1. **Parse**: Images in markdown are replaced with `WECHATIMGPH_N`
2. **Render**: HTML is generated with placeholders in text
3. **Paste**: HTML content is pasted into WeChat editor
4. **Replace**: for each placeholder — select it, scroll into view, Backspace to delete, paste the image from clipboard

## Scripts

| Script | Purpose |
|--------|---------|
| `wechat-article.ts` | Main article publishing script |
| `md-to-wechat.ts` | Markdown to HTML with placeholders |
| `md/render.ts` | Markdown rendering with themes |
