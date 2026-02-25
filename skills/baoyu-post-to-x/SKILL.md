---
name: baoyu-post-to-x
description: Posts content and articles to X (Twitter). Supports regular posts with images/videos and X Articles (long-form Markdown). Uses real Chrome with CDP to bypass anti-automation. Use when user asks to "post to X", "tweet", "publish to Twitter", or "share on X".
---

# Post to X (Twitter)

Posts text, images, videos, and long-form articles to X via real Chrome browser (bypasses anti-bot detection).

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.ts`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/x-browser.ts` | Regular posts (text + images) |
| `scripts/x-video.ts` | Video posts (text + video) |
| `scripts/x-quote.ts` | Quote tweet with comment |
| `scripts/x-article.ts` | Long-form article publishing (Markdown) |
| `scripts/md-to-html.ts` | Markdown → HTML conversion |
| `scripts/copy-to-clipboard.ts` | Copy content to clipboard |
| `scripts/paste-from-clipboard.ts` | Send real paste keystroke |
| `scripts/check-paste-permissions.ts` | Verify environment & permissions |

## Preferences (EXTEND.md)

Check EXTEND.md existence (project-level `.baoyu-skills/baoyu-post-to-x/EXTEND.md`, then user-level `$HOME/.baoyu-skills/baoyu-post-to-x/EXTEND.md`). If found, read and apply settings. If not found, use defaults.

**Supports**: Default Chrome profile

## Prerequisites

- Google Chrome or Chromium
- `bun` runtime
- First run: log in to X manually (session saved)

## Pre-flight Check (Optional)

Before first use, suggest running the environment check. User can skip if they prefer.

```bash
npx -y bun ${SKILL_DIR}/scripts/check-paste-permissions.ts
```

Checks: Chrome, profile isolation, Bun, Accessibility, clipboard, paste keystroke, Chrome conflicts.

**If any check fails**, provide fix guidance per item:

| Check | Fix |
|-------|-----|
| Chrome | Install Chrome or set `X_BROWSER_CHROME_PATH` env var |
| Profile dir | Ensure `~/.local/share/x-browser-profile` is writable |
| Bun runtime | `curl -fsSL https://bun.sh/install \| bash` |
| Accessibility (macOS) | System Settings → Privacy & Security → Accessibility → enable terminal app |
| Clipboard copy | Ensure Swift/AppKit available (macOS Xcode CLI tools: `xcode-select --install`) |
| Paste keystroke (macOS) | Same as Accessibility fix above |
| Paste keystroke (Linux) | Install `xdotool` (X11) or `ydotool` (Wayland) |

## References

- **Regular Posts**: See `references/regular-posts.md` for manual workflow, troubleshooting, and technical details
- **X Articles**: See `references/articles.md` for long-form article publishing guide

---

## Regular Posts

Text + up to 4 images.

```bash
npx -y bun ${SKILL_DIR}/scripts/x-browser.ts "Hello!" --image ./photo.png
```

**Parameters**:
| Parameter | Description |
|-----------|-------------|
| `<text>` | Post content (positional) |
| `--image <path>` | Image file (repeatable, max 4) |
| `--profile <dir>` | Custom Chrome profile |

**Verify**: After script completes, confirm browser opens with compose dialog showing your content. User reviews and publishes manually.

---

## Video Posts

Text + video file.

```bash
npx -y bun ${SKILL_DIR}/scripts/x-video.ts "Check this out!" --video ./clip.mp4
```

**Parameters**:
| Parameter | Description |
|-----------|-------------|
| `<text>` | Post content (positional) |
| `--video <path>` | Video file (MP4, MOV, WebM) |
| `--profile <dir>` | Custom Chrome profile |

**Limits**: Regular 140s max, Premium 60min. Processing: 30-60s.

**Verify**: Confirm browser opens with video attached in compose dialog.

---

## Quote Tweets

Quote an existing tweet with comment.

```bash
npx -y bun ${SKILL_DIR}/scripts/x-quote.ts https://x.com/user/status/123 "Great insight!"
```

**Parameters**:
| Parameter | Description |
|-----------|-------------|
| `<tweet-url>` | URL to quote (positional) |
| `<comment>` | Comment text (positional, optional) |
| `--profile <dir>` | Custom Chrome profile |

**Verify**: Confirm browser opens with quoted tweet and comment in compose dialog.

---

## X Articles

Long-form Markdown articles (requires X Premium).

```bash
npx -y bun ${SKILL_DIR}/scripts/x-article.ts article.md
npx -y bun ${SKILL_DIR}/scripts/x-article.ts article.md --cover ./cover.jpg
```

**Parameters**:
| Parameter | Description |
|-----------|-------------|
| `<markdown>` | Markdown file (positional) |
| `--cover <path>` | Cover image |
| `--title <text>` | Override title |

**Frontmatter**: `title`, `cover_image` supported in YAML front matter.

**Verify**: Confirm article editor opens with content and cover image loaded.

---

## Troubleshooting

### Chrome debug port not ready

If a script fails with `Chrome debug port not ready` or `Unable to connect`, kill existing Chrome CDP instances first, then retry:

```bash
pkill -f "Chrome.*remote-debugging-port" 2>/dev/null; pkill -f "Chromium.*remote-debugging-port" 2>/dev/null; sleep 2
```

**Important**: This should be done automatically — when encountering this error, kill Chrome CDP instances and retry the command without asking the user.

## Notes

- First run: manual login required (session persists)
- All scripts fill content into browser — user reviews and publishes manually
- Cross-platform: macOS, Linux, Windows
