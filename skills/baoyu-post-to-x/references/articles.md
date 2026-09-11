# X Articles - Detailed Guide

Publish Markdown articles to X Articles editor with rich text formatting and images.

## Mode Selection

In Codex, choose the browser-control mode from the user's wording:

1. If the user says "Codex Chrome plugin", "Codex 自带的 Chrome 插件", `@chrome`, or Chrome Extension, use **Codex Chrome Plugin Workflow**. Do not try Computer Use first.
2. If the user explicitly asks for Chrome Computer Use, use **Computer Use Workflow**.
3. If the user explicitly asks for CDP/script mode, use **CDP Script Workflow**.
4. Otherwise, use Computer Use when available; if unavailable or blocked, use CDP Script Workflow.

Never use the in-app Browser for X Article publishing. Never switch away from an explicitly requested mode without explaining the blocker and getting approval.

## Prerequisites

- X Premium subscription (required for Articles)
- Google Chrome installed
- `bun` installed

## Usage

### Codex Chrome Plugin (When Requested)

Use the `chrome:Chrome` skill and its Node REPL browser client. Verify the connection with a lightweight call such as `browser.user.openTabs()`. If it fails, wait 2 seconds and retry once, then follow the Chrome skill's health checks.

Prepare the article HTML and image map:

```bash
${BUN_X} {baseDir}/scripts/md-to-html.ts article.md --save-html /tmp/x-article-body.html > /tmp/x-article.json
```

Copy generated HTML as rich text:

```bash
${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts html --file /tmp/x-article-body.html
```

Use the Chrome plugin's tab, Playwright-wrapper, CUA, clipboard, and file chooser APIs for all X UI operations. If upload fails with `Not allowed`, stop and tell the user to enable file URL access for the Codex Chrome Extension in `chrome://extensions` → Details.

### Chrome Computer Use

Prepare the article HTML and image map:

```bash
${BUN_X} {baseDir}/scripts/md-to-html.ts article.md --save-html /tmp/x-article-body.html > /tmp/x-article.json
```

Copy the generated HTML as rich text:

```bash
${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts html --file /tmp/x-article-body.html
```

Then use Codex Computer Use against `Google Chrome` for all X UI operations.

### CDP Script Fallback

```bash
# Publish markdown article (preview mode)
${BUN_X} {baseDir}/scripts/x-article.ts article.md

# With custom cover image
${BUN_X} {baseDir}/scripts/x-article.ts article.md --cover ./cover.jpg

# Actually publish
${BUN_X} {baseDir}/scripts/x-article.ts article.md --submit
```

Do not use `--submit` unless the user has explicitly confirmed the final public publish action.

## Markdown Format

```markdown
---
title: My Article Title
cover_image: /path/to/cover.jpg
---

# Title (becomes article title)

Regular paragraph text with **bold** and *italic*.

## Section Header

More content here.

![Image alt text](./image.png)

- List item 1
- List item 2

1. Numbered item
2. Another item

> Blockquote text

[Link text](https://example.com)

\`\`\`
Code blocks become blockquotes (X doesn't support code)
\`\`\`
```

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

## Generated Cover Images

X recommends a `5:2` article cover. When the Markdown lacks a good cover, or the user asks for one, generate a separate cover image before uploading the draft.

1. Use the article title and opening sections to derive a simple visual metaphor.
2. Generate a clean `5:2` cover with the available image-generation tool. If no image-generation tool is available, ask the user to provide a cover image or continue without generating one.
3. Use no text, letters, logos, or watermark. Keep generous safe margins for X preview crops.
4. Save the file in a durable path beside the article or project assets.
5. Normalize the final asset to an exact `5:2` size such as `2000x800`:
   ```bash
   # macOS, for outputs already close to 5:2
   sips -z 800 2000 input.png --out cover-5x2.png

   # ImageMagick, for center-cropping without distortion
   magick input.png -resize 2000x800^ -gravity center -extent 2000x800 cover-5x2.png
   ```
6. Verify dimensions before upload:
   ```bash
   sips -g pixelWidth -g pixelHeight cover-5x2.png
   ```
7. Inspect the result visually for clutter, text artifacts, and bad crops.
8. Upload this generated image only to the article cover slot. Do not also insert it into the body unless the user asks.

Prompt pattern:

```text
Create a concise 5:2 X Article cover for: <article title/theme>.
Visualize the article's subject with a simple editorial illustration, generous safe margins, and no text.
No letters, logos, UI brand names, watermark, or clutter.
```

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

## Codex Chrome Plugin Workflow

1. **Load Chrome skill**: use `chrome:Chrome`, not Computer Use.
2. **Connect**: initialize the Chrome plugin browser client and verify with `browser.user.openTabs()`.
3. **Parse Markdown**: run `md-to-html.ts --save-html /tmp/x-article-body.html > /tmp/x-article.json`.
4. **Read the map**: use `/tmp/x-article.json` for `title`, `coverImage`, and `contentImages`.
5. **Prepare Cover**: if the user asks for a generated cover, or `coverImage` is missing/unsuitable, follow **Generated Cover Images** and use that file as `coverImage`.
6. **Open X Articles**: open or claim a Chrome tab for `https://x.com/compose/articles`.
7. **Create Draft**: click the create/write button if needed, or open the target draft.
8. **Upload Cover**: use the Chrome plugin file chooser flow. If file upload returns `Not allowed`, report the Chrome Extension file-access fix and stop.
9. **Fill Title**: fill the title field.
10. **Paste Content**:
   - Run `copy-to-clipboard.ts html --file /tmp/x-article-body.html`.
   - Click the article body.
   - Press `Meta+V` on macOS or `Control+V` on Windows/Linux through the Chrome plugin.
   - Verify the article body appeared and contains `XIMGPH_` placeholders. On macOS, use `pbpaste` to verify shell-written system clipboard contents if paste is suspicious; `tab.clipboard.readText()` may not reflect the system clipboard after shell writes.
11. **Insert Images**: for each `contentImages` item in placeholder order:
   - Locate the exact visible placeholder text (`XIMGPH_N`) and click it to put the insertion point there.
   - Open the editor toolbar dropdown `Insert` and choose `Media`.
   - In the `Insert` modal, click the icon button with `aria-label="Add photos or video"`; do not click the "Choose a file or drag it here" text/dropzone or hidden file input.
   - Use the Chrome plugin file chooser flow to upload that image's `localPath`.
   - Wait until the image block appears. If `XIMGPH_N` remains above the image, select exactly that placeholder and press `Delete` first; use `Backspace` only if `Delete` fails and the selected text is confirmed to be exactly the placeholder.
   - Verify that placeholder's count is `0` before continuing.
12. **Verify**:
   - Inspect the editor for `XIMGPH_` residue.
   - Confirm the expected number of image blocks is visible.
   - Open Preview and verify title, cover, body, links, and images.
13. **Publish Safety**: ask the user for explicit final confirmation before clicking `Publish`.

If the Chrome plugin reports `native pipe is closed`, retry one lightweight browser call after 2 seconds, then run the Chrome skill health checks. If Chrome, the extension, and native host are healthy, ask the user before opening a new Chrome window and retrying.

## Computer Use Workflow

1. **Detect Computer Use**: call `get_app_state` for `Google Chrome`; use `tool_search` first if the tools are not visible.
2. **Parse Markdown**: run `md-to-html.ts --save-html /tmp/x-article-body.html > /tmp/x-article.json`.
3. **Read the map**: use `/tmp/x-article.json` for `title`, `coverImage`, and `contentImages`.
4. **Prepare Cover**: if the user asks for a generated cover, or `coverImage` is missing/unsuitable, follow **Generated Cover Images** and use that file as `coverImage`.
5. **Open X Articles**: use Chrome Computer Use to navigate to `https://x.com/compose/articles`.
6. **Create Draft**: click the create/write button if needed, or open the target draft.
7. **Upload Cover**: if `coverImage` exists, use Chrome's visible upload/file picker UI. If the file picker cannot be operated reliably, stop and ask for help rather than switching to CDP silently.
8. **Fill Title**: type the title into the title field.
9. **Paste Content**:
   - Run `copy-to-clipboard.ts html --file /tmp/x-article-body.html`.
   - Click the article body.
   - Press `super+v` on macOS or `control+v` on Windows/Linux with Computer Use.
10. **Insert Images**: for each `contentImages` item in placeholder order:
   - Locate the exact visible placeholder text (`XIMGPH_N`) and click it to put the insertion point there.
   - Open the editor toolbar dropdown `Insert`, choose `Media`, then click the icon button with `aria-label="Add photos or video"` inside the modal.
   - Use the native file picker to choose that image's `localPath`.
   - Wait until the image block appears and upload activity is complete.
   - If `XIMGPH_N` remains above the inserted image, reselect exactly that placeholder text and press `Delete` first; use `Backspace` only if `Delete` fails and the Computer Use state confirms the selected text is exactly the placeholder.
   - Confirm that placeholder is gone before continuing.
11. **Verify**:
   - Inspect the Computer Use state for `XIMGPH_` residue.
   - Confirm the expected number of image blocks is visible.
   - Open Preview and verify title, cover, body, links, and images.
12. **Publish Safety**: ask the user for explicit final confirmation before clicking `Publish`.

## CDP Script Workflow (Fallback)

1. **Parse Markdown**: Extract title, cover, content images, generate HTML
2. **Prepare Cover**: if the user asks for a generated cover, or the parsed cover is missing/unsuitable, follow **Generated Cover Images** and pass it with `--cover cover-5x2.png`
3. **Launch Chrome**: Real browser with CDP, persistent login
4. **Navigate**: Open `x.com/compose/articles`
5. **Create Article**: Click create button if on list page
6. **Upload Cover**: Use file input for cover image
7. **Fill Title**: Type title into title field
8. **Paste Content**: Copy HTML to clipboard, paste into editor
9. **Insert Images**: For each placeholder in placeholder order:
   - Find and click the placeholder text in the editor
   - Use `Insert` -> `Media`
   - Click the modal's icon button labeled `Add photos or video`
   - Upload the matching image file
   - Delete the leftover placeholder text with `Delete` after the image appears
10. **Post-Composition Check** (automatic):
   - Scan editor for remaining `XIMGPH_` placeholders
   - Compare expected vs actual image count
   - Warn if issues found
11. **Review**: Browser stays open for 60s preview
12. **Publish**: Only with `--submit` flag and explicit user confirmation

## Example Session

```
User: /post-to-x article ./blog/my-post.md --cover ./thumbnail.png

Claude:
1. Detects that the user requested the Codex Chrome plugin
2. Parses markdown: title="My Post", 3 content images
3. Saves `/tmp/x-article-body.html` and `/tmp/x-article.json`
4. Uses the Chrome plugin to open X Articles and create a draft
5. Uploads thumbnail.png as cover
6. Fills title "My Post"
7. Pastes HTML content with a real Chrome paste
8. Inserts 3 images at placeholder positions
9. Opens Preview and asks before publishing
```

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

1. `md-to-html.ts` converts Markdown to HTML:
   - Extracts frontmatter (title, cover)
   - Converts markdown to HTML
   - Replaces images with unique placeholders
   - Downloads remote images locally
   - Returns structured JSON

2. The Codex Chrome plugin publishes through the user's real Chrome session when explicitly requested:
   - Uses the user's active Chrome profile and logged-in X session
   - Uses the Chrome Extension browser client rather than Computer Use or CDP
   - Uses `copy-to-clipboard.ts` for rich HTML body paste
   - Inserts body images through X's toolbar `Insert` -> `Media` modal and its `Add photos or video` icon button
   - Keeps the final publish click under user confirmation

3. Chrome Computer Use publishes through the user's visible Chrome UI:
   - Uses the user's active Chrome profile and logged-in X session
   - Uses `copy-to-clipboard.ts` for rich HTML body paste
   - Inserts body images through X's toolbar `Insert` -> `Media` modal and its `Add photos or video` icon button
   - Uses real keystrokes (`super+v`/`control+v`) through Codex Computer Use
   - Keeps the final publish click under user confirmation

4. `x-article.ts` publishes via CDP as a fallback:
   - Launches real Chrome (bypasses detection)
   - Uses persistent profile (saved login)
   - Navigates and fills editor via DOM manipulation
   - Pastes HTML from system clipboard
   - Finds/selects/replaces each image placeholder
