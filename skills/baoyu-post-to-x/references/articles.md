# X Articles - Detailed Guide

Requires X Premium, Google Chrome, and `bun`. Mode selection, the publish gate, and the step-by-step Codex Chrome plugin / Computer Use workflows are in SKILL.md ("Execution Mode Selection", "X Articles (UI Modes)").

## CDP Script Fallback

```bash
# Publish markdown article (preview mode)
${BUN_X} {baseDir}/scripts/x-article.ts article.md

# With custom cover image
${BUN_X} {baseDir}/scripts/x-article.ts article.md --cover ./cover.jpg

# Actually publish
${BUN_X} {baseDir}/scripts/x-article.ts article.md --submit
```

Do not use `--submit` unless the user has explicitly confirmed the final public publish action.

## Frontmatter Fields

| Field | Description |
|-------|-------------|
| `title` | Article title (or uses first H1) |
| `cover_image` | Cover image path or URL |
| `cover` | Alias for cover_image |
| `image` | Alias for cover_image |

## Image Handling

1. **Cover Image**: First image or `cover_image` from frontmatter
2. **Remote Images**: Automatically downloaded to temp directory
3. **Placeholders**: Images in content use `XIMGPH_N` format
4. **Insertion**: Placeholders are found, selected, and replaced with actual images

## Markdown to HTML Script

Convert markdown and inspect structure:

```bash
# Get JSON with all metadata
${BUN_X} {baseDir}/scripts/md-to-html.ts article.md

# Output HTML only
${BUN_X} {baseDir}/scripts/md-to-html.ts article.md --html-only

# Save HTML to file
${BUN_X} {baseDir}/scripts/md-to-html.ts article.md --save-html /tmp/article.html
```

JSON output:
```json
{
  "title": "Article Title",
  "coverImage": "/path/to/cover.jpg",
  "contentImages": [
    {
      "placeholder": "XIMGPH_1",
      "localPath": "/tmp/x-article-images/img.png",
      "blockIndex": 5
    }
  ],
  "html": "<p>Content...</p>",
  "totalBlocks": 20
}
```

## Supported Formatting

| Markdown | HTML Output |
|----------|-------------|
| `# H1` | Title only (not in body) |
| `## H2` - `###### H6` | `<h2>` |
| `**bold**` | `<strong>` |
| `*italic*` | `<em>` |
| `[text](url)` | `<a href>` |
| `> quote` | `<blockquote>` |
| `` `code` `` | `<code>` |
| ```` ``` ```` | `<blockquote>` (X limitation) |
| `- item` | `<ul><li>` |
| `1. item` | `<ol><li>` |
| `![](img)` | Image placeholder |

## CDP Script Workflow (Fallback)

1. **Parse Markdown**: Extract title, cover, content images, generate HTML
2. **Launch Chrome**: Real browser with CDP, persistent login
3. **Navigate**: Open `x.com/compose/articles`
4. **Create Article**: Click create button if on list page
5. **Upload Cover**: Use file input for cover image
6. **Fill Title**: Type title into title field
7. **Paste Content**: Copy HTML to clipboard, paste into editor
8. **Insert Images**: For each placeholder in placeholder order:
   - Find and click the placeholder text in the editor
   - Use `Insert` -> `Media`
   - Click the modal's icon button labeled `Add photos or video`
   - Upload the matching image file
   - Delete the leftover placeholder text with `Delete` after the image appears
9. **Post-Composition Check** (automatic):
   - Scan editor for remaining `XIMGPH_` placeholders
   - Compare expected vs actual image count
   - Warn if issues found
10. **Review**: Browser stays open for 60s preview
11. **Publish**: Only with `--submit` flag and explicit user confirmation

## Troubleshooting

- **No create button**: Ensure X Premium subscription is active
- **Cover upload fails**: Check file path and format (PNG, JPEG)
- **Images not inserting**: Verify placeholders exist in pasted content; use `Insert` -> `Media` -> modal icon button `Add photos or video`, not image clipboard paste, the dropzone text, or the hidden file input.
- **Content not pasting**: Check HTML clipboard: `${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts html --file /tmp/test.html`
- **Chrome plugin `native pipe is closed`**: retry once after 2 seconds, then run Chrome skill checks; ask before opening a new Chrome window if checks pass.
- **Chrome plugin upload `Not allowed`**: enable file URL access for the Codex Chrome Extension in `chrome://extensions` → Details.
- **Computer Use unavailable**: Use the CDP fallback script, unless the user explicitly required Chrome Computer Use.
- **Placeholder remains after upload**: Select only the placeholder text and press `Delete` after upload completes. Use `Backspace` only if `Delete` fails and the selection is exactly the placeholder.

## How It Works

- `md-to-html.ts`: extracts frontmatter (title, cover), converts Markdown to HTML, replaces images with unique placeholders, downloads remote images locally, returns structured JSON.
- Chrome plugin / Computer Use: publish through the user's real Chrome session; body pasted as rich HTML via `copy-to-clipboard.ts`; body images inserted via `Insert` → `Media` → `Add photos or video`; final publish click stays under user confirmation.
- `x-article.ts` (CDP fallback): launches real Chrome (bypasses detection) with a persistent profile (saved login), fills the editor via DOM manipulation, pastes HTML from the system clipboard, then finds/selects/replaces each image placeholder.
