---
name: baoyu-post-to-weibo
description: Posts content to Weibo (微博). Supports regular posts with text, images, and videos, and headline articles (头条文章) with Markdown input via Chrome CDP. Use when user asks to "post to Weibo", "发微博", "发布微博", "publish to Weibo", "share on Weibo", "写微博", or "微博头条文章".
version: 1.117.3
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-post-to-weibo
    requires:
      anyBins:
        - bun
        - npx
---

# Post to Weibo

Posts via a real Chrome browser (CDP), which avoids anti-bot detection. Scripts only fill content in the browser — the user reviews and publishes manually.

## Script Directory

`{baseDir}` = this SKILL.md's directory; scripts are at `{baseDir}/scripts/<script-name>.ts`. Resolve `${BUN_X}`: `bun` if installed → else `npx -y bun` → else suggest installing bun.

| Script | Purpose |
|--------|---------|
| `scripts/weibo-post.ts` | Regular posts (text + images) |
| `scripts/weibo-article.ts` | Headline article publishing (Markdown) |
| `scripts/copy-to-clipboard.ts` | Copy content to clipboard |
| `scripts/paste-from-clipboard.ts` | Send real paste keystroke |

## Preferences (EXTEND.md)

First found wins:

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-post-to-weibo/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-post-to-weibo/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-post-to-weibo/EXTEND.md` | User home |

None found → use defaults. Supported: default Chrome profile.

## Prerequisites

Google Chrome or Chromium; `bun`. First run: user logs in to Weibo manually (session persists). Works on macOS, Linux, Windows.

## Post Type Selection

Unless the user specifies: Markdown file (`.md`) → Headline Article (头条文章); plain text / text with images → Regular Post.

## Regular Posts

Text + images/videos (max 18 files total), posted on the Weibo homepage.

```bash
${BUN_X} {baseDir}/scripts/weibo-post.ts "Hello Weibo!" --image ./photo.png
${BUN_X} {baseDir}/scripts/weibo-post.ts "Watch this" --video ./clip.mp4
```

| Parameter | Description |
|-----------|-------------|
| `<text>` | Post content (positional) |
| `--image <path>` | Image file (repeatable) |
| `--video <path>` | Video file (repeatable) |
| `--profile <dir>` | Custom Chrome profile |

## Headline Articles (头条文章)

Editor: `https://card.weibo.com/article/v3/editor`.

```bash
${BUN_X} {baseDir}/scripts/weibo-article.ts article.md
${BUN_X} {baseDir}/scripts/weibo-article.ts article.md --cover ./cover.jpg
```

| Parameter | Description |
|-----------|-------------|
| `<markdown>` | Markdown file (positional) |
| `--cover <path>` | Cover image |
| `--title <text>` | Override title (max 32 chars, truncated with warning if longer) |
| `--summary <text>` | Override summary/导语 (max 44 chars, auto-regenerated from content if longer) |
| `--profile <dir>` | Custom Chrome profile |

Frontmatter: `title`, `summary`, `cover_image`.

**Markdown-to-HTML**: do NOT pass any `--theme` when converting; use the default theme.

Script flow: opens the editor → clicks "写文章" and waits until editable → fills title and summary → pastes HTML into the ProseMirror editor → replaces image placeholders one by one (copy image → select placeholder → paste).

**Post-composition check**: the script then reports remaining `WBIMGPH_` placeholders and expected vs actual image count. If it prints warnings, tell the user the specific issues before they publish.

## Troubleshooting

**`Chrome debug port not ready` / `Unable to connect`**: automatically, without asking, kill only the CDP Chrome instances (with `--remote-debugging-port` AND the baoyu-skills profile), then retry:

```bash
pkill -f "remote-debugging-port.*baoyu-skills/chrome-profile" 2>/dev/null; sleep 2
```

**Never kill all Chrome processes** (`pkill -f "Google Chrome"`) — the user may have regular Chrome windows open.

## Extension Support

Custom configuration via EXTEND.md — see Preferences.
