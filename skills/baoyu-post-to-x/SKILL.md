---
name: baoyu-post-to-x
description: Posts content and articles to X (Twitter). Supports regular posts with images/videos and X Articles (long-form Markdown). In Codex, honor explicit requests for the Codex Chrome plugin/@chrome by using the Chrome Extension workflow; otherwise use Chrome Computer Use when available and fall back to real Chrome CDP scripts only when allowed. Use when user asks to "post to X", "tweet", "publish to Twitter", or "share on X".
version: 1.58.1
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-post-to-x
    requires:
      anyBins:
        - bun
        - npx
---

# Post to X (Twitter)

Posts text, images, videos, and long-form articles to X via a real Chrome browser.

In Codex, three distinct browser paths — do not conflate them:
- **Codex Chrome plugin / `@chrome` / Chrome Extension**: the bundled `chrome:Chrome` skill and its Node REPL browser client. Required whenever the user says "Codex Chrome plugin", "Codex 自带的 Chrome 插件", `@chrome`, or similar.
- **Chrome Computer Use**: `mcp__computer_use__.*` against the visible Google Chrome UI.
- **CDP script mode**: the bundled scripts; fallback only.

## Script Directory

`{baseDir}` = this SKILL.md's directory; scripts are at `{baseDir}/scripts/<script-name>.ts`. Resolve `${BUN_X}`: `bun` if installed → else `npx -y bun` → else suggest installing bun.

| Script | Purpose |
|--------|---------|
| `scripts/x-browser.ts` | Regular posts (text + images), CDP fallback |
| `scripts/x-video.ts` | Video posts (text + video), CDP fallback |
| `scripts/x-quote.ts` | Quote tweet with comment, CDP fallback |
| `scripts/x-article.ts` | Long-form article publishing (Markdown), CDP fallback |
| `scripts/md-to-html.ts` | Markdown → HTML conversion |
| `scripts/copy-to-clipboard.ts` | Copy content to clipboard |
| `scripts/paste-from-clipboard.ts` | Send real paste keystroke |
| `scripts/check-paste-permissions.ts` | Verify environment & permissions |

## Execution Mode Selection (Required)

Choose exactly one mode before interacting with X:

1. User asks for the Codex Chrome plugin, `@chrome`, the Chrome extension, or "Codex 自带的 Chrome 插件" → **Codex Chrome Plugin Mode**. Do not call Computer Use first.
2. User asks for Chrome Computer Use → **Chrome Computer Use Mode**. Do not fall back to CDP, Playwright, the in-app Browser, or the Chrome plugin without telling the user and getting approval.
3. User asks for CDP/script mode → **CDP Script Mode**.
4. Otherwise prefer **Chrome Computer Use Mode** (if available). For Markdown X Articles with local content images, use the toolbar image flow (`Insert` → `Media` → `Add photos or video`) in "X Articles (UI Modes)". Use CDP Script Mode only when the selected browser-control mode is unavailable or the UI upload/selection flow is unreliable.

Never use the in-app Browser for X publishing. Never switch away from an explicitly requested mode without explaining the blocker and getting approval.

**Publish gate (all modes)**: never click `Publish`, `Post`, or any externally visible submit action, and never pass `--submit`, without explicit final confirmation from the user in the current conversation.

In Codex Chrome Plugin Mode and Chrome Computer Use Mode, use the user's existing Chrome session (profile, cookies, X login); do not launch a separate CDP profile.

## Preferences (EXTEND.md)

First found wins:

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-post-to-x/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-post-to-x/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-post-to-x/EXTEND.md` | User home |

None found → use defaults. Supported: default Chrome profile.

## Prerequisites

Google Chrome or Chromium; `bun`. First run: user logs in to X manually (session persists). Works on macOS, Linux, Windows.

## Pre-flight Check (Optional)

Before first use, suggest (user can skip):

```bash
${BUN_X} {baseDir}/scripts/check-paste-permissions.ts
```

| Check fails | Fix |
|-------|-----|
| Chrome | Install Chrome or set `X_BROWSER_CHROME_PATH` env var |
| Profile dir | Shared profile at `baoyu-skills/chrome-profile` (see CLAUDE.md Chrome Profile section) |
| Bun runtime | `brew install oven-sh/bun/bun` (macOS) or `npm install -g bun` |
| Accessibility (macOS) | System Settings → Privacy & Security → Accessibility → enable terminal app |
| Clipboard copy | Ensure Swift/AppKit available (macOS Xcode CLI tools: `xcode-select --install`) |
| Paste keystroke (macOS) | Same as Accessibility fix above |
| Paste keystroke (Linux) | Install `xdotool` (X11) or `ydotool` (Wayland) |

## Post Type Selection

Unless the user specifies:
- **Plain text** within 10,000 characters → **Regular Post** (Premium: up to 10,000 characters; non-Premium: 280)
- **Markdown file** (.md) → **X Article** (requires X Premium)

---

## Codex Chrome Plugin Mode

Uses the user's real Chrome profile and X login through the bundled Chrome plugin — not Computer Use, not CDP.

**Setup**
1. Load the `chrome:Chrome` skill before browser work.
2. Use `tool_search` for `node_repl js` if the Node REPL `js` tool is not visible.
3. Initialize the browser client exactly as the Chrome skill specifies, then verify the extension with a lightweight call such as `browser.user.openTabs()`.
4. If that fails, wait 2 seconds and retry once; then follow the Chrome skill's extension checks and recovery steps. If checks pass but communication still fails, ask the user before opening a new Chrome window. Do not switch to Computer Use or CDP silently.

**Rules**
- Use the plugin's `browser.tabs.*`, `tab.playwright.*`, `tab.cua.*`, and file chooser APIs for X UI actions.
- Shell commands are allowed for Markdown preprocessing and rich-HTML clipboard preparation. For X Article body images, do not rely on image clipboard paste; use the `Insert` → `Media` upload flow.
- Upload fails with `Not allowed` → tell the user: `To enable file upload, go to chrome://extensions in Chrome, click Details under the Codex extension, and enable "Allow access to file URLs." See https://developers.openai.com/codex/app/chrome-extension#upload-files for details.`
- `native pipe is closed` → retry the lightweight browser call once after 2 seconds, then run the Chrome skill health checks. If Chrome is running, the extension is enabled, and the native host manifest is correct, ask permission to open a new Chrome window and retry. Do not keep sending actions through the broken pipe.

## Chrome Computer Use Mode

Uses the user's existing Chrome window, cookies, login, extensions, and X session.

**Rules**
- Start each assistant turn that controls Chrome by calling `get_app_state` for `Google Chrome`.
- Prefer element-index actions; use coordinates only for editor text selection or drag selection.
- Do not use the in-app Browser, the Chrome plugin, Playwright, or CDP for X UI actions in this mode unless the user approves a mode change.
- If selection, toolbar upload, or file-picker control becomes unreliable, stop and report the blocker instead of switching to the Chrome plugin or CDP silently.

**Regular posts**
1. Open `https://x.com/compose/post`; type the post text into the composer.
2. For each image: `${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts image /absolute/path/to/image.png`, then paste (`super+v` macOS, `control+v` Windows/Linux) and wait until X finishes uploading.
3. Ask for confirmation before clicking `Post`.

**Video posts**: open `https://x.com/compose/post` → type text → attach the video via the visible media upload/file picker UI → wait for upload and processing → ask before clicking `Post`.

**Quote tweets**: open the tweet URL → choose Quote in the visible quote/repost UI → type the comment → ask before clicking `Post`.

## X Articles (UI Modes)

Shared by Codex Chrome Plugin Mode and Chrome Computer Use Mode. Paste keys: plugin `Meta+V` (macOS) / `Control+V`; Computer Use `super+v` (macOS) / `control+v`. File upload: plugin file chooser API; Computer Use native file picker.

1. Convert Markdown and keep the image map:
   ```bash
   ${BUN_X} {baseDir}/scripts/md-to-html.ts article.md --save-html /tmp/x-article-body.html > /tmp/x-article.json
   ```
2. Read the JSON for `title`, `coverImage`, and `contentImages` (`placeholder` → `localPath`).
3. Open `https://x.com/compose/articles`; click create/write if needed, or open the target draft.
4. Upload the cover if present. Plugin: if blocked by extension permissions (`Not allowed`), stop and report the permission fix above. Computer Use: if the file picker can't be operated reliably, stop and ask rather than switching to CDP silently.
5. Fill the title, then copy rich HTML:
   ```bash
   ${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts html --file /tmp/x-article-body.html
   ```
6. Click the article body and paste with a real paste keystroke.
7. Plugin only: verify the body appeared and contains `XIMGPH_` placeholders. Don't trust `tab.clipboard.readText()` as proof of the system clipboard after shell writes; on macOS verify with `pbpaste` if needed.
8. For each `contentImages` item, in placeholder order:
   - Click the exact visible placeholder text (`XIMGPH_N`) to set the insertion point.
   - Toolbar `Insert` → `Media`; in the modal click the icon button `aria-label="Add photos or video"` — not the "Choose a file or drag it here" text/dropzone or the hidden file input.
   - Upload that image's `localPath`; wait until the image block appears and upload activity finishes.
   - If `XIMGPH_N` remains above the image, select exactly that placeholder and press `Delete` first; use `Backspace` only if `Delete` fails and the selected text is confirmed to be exactly the placeholder.
   - Verify that placeholder's count is `0` before continuing.
9. Verify no `XIMGPH_` remains and the expected number of images is visible; open Preview and check title, cover, body, links, and images.
10. Ask for explicit confirmation before clicking `Publish`.

More (frontmatter, md-to-html output, formatting, troubleshooting): `references/articles.md`.

---

## CDP Script Mode (Fallback)

Use only when the selected browser-control mode is unavailable or unreliable, or the user asks for CDP. If the user explicitly required the Codex Chrome plugin or Chrome Computer Use, use CDP only after explaining the blocker and getting approval.

Scripts launch or reuse a real Chrome via CDP, fill the content, and leave the browser open — the user reviews and publishes manually (`x-article.ts` publishes only with `--submit`, see Publish gate).

### Regular Posts

```bash
${BUN_X} {baseDir}/scripts/x-browser.ts "Hello!" --image ./photo.png
```

| Parameter | Description |
|-----------|-------------|
| `<text>` | Post content (positional) |
| `--image <path>` | Image file (repeatable, max 4) |
| `--profile <dir>` | Custom Chrome profile |

Manual clipboard/paste steps, troubleshooting, internals: `references/regular-posts.md`.

### Video Posts

```bash
${BUN_X} {baseDir}/scripts/x-video.ts "Check this out!" --video ./clip.mp4
```

| Parameter | Description |
|-----------|-------------|
| `<text>` | Post content (positional) |
| `--video <path>` | Video file (MP4, MOV, WebM) |
| `--profile <dir>` | Custom Chrome profile |

Limits: regular 140s max, Premium 60min. Processing: 30-60s.

### Quote Tweets

```bash
${BUN_X} {baseDir}/scripts/x-quote.ts https://x.com/user/status/123 "Great insight!"
```

| Parameter | Description |
|-----------|-------------|
| `<tweet-url>` | URL to quote (positional) |
| `<comment>` | Comment text (positional, optional) |
| `--profile <dir>` | Custom Chrome profile |

### X Articles

```bash
${BUN_X} {baseDir}/scripts/x-article.ts article.md
${BUN_X} {baseDir}/scripts/x-article.ts article.md --cover ./cover.jpg
```

| Parameter | Description |
|-----------|-------------|
| `<markdown>` | Markdown file (positional) |
| `--cover <path>` | Cover image |
| `--title <text>` | Override title |

Frontmatter: `title`, `cover_image`.

**Post-composition check**: the script then reports remaining `XIMGPH_` placeholders and expected vs actual image count. If it prints warnings, tell the user the specific issues before they publish.

### Troubleshooting

**`Chrome debug port not ready` / `Unable to connect`** (CDP only): automatically, without asking, kill existing Chrome CDP instances and retry:

```bash
pkill -f "Chrome.*remote-debugging-port" 2>/dev/null; pkill -f "Chromium.*remote-debugging-port" 2>/dev/null; sleep 2
```

## Extension Support

Custom configuration via EXTEND.md — see Preferences.
