---
name: baoyu-post-to-wechat
description: Posts content to WeChat Official Account (微信公众号) via API or Chrome CDP. Supports article posting (文章) with HTML, markdown, or plain text input, and image-text posting (贴图, formerly 图文) with multiple images. Markdown article workflows default to converting ordinary external links into bottom citations for WeChat-friendly output. Use when user mentions "发布公众号", "post to wechat", "微信公众号", or "贴图/图文/文章".
version: 1.56.1
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-post-to-wechat
    requires:
      anyBins:
        - bun
        - npx
---

# Post to WeChat Official Account

## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete `AskUserQuestion` references below are examples — substitute the local equivalent in other runtimes.

## Language

Respond in the user's language. If they write in Chinese, reply in Chinese; if English, English. Keep technical tokens (paths, flags, field names) in English.

## Script Directory

`{baseDir}` = this SKILL.md's directory. Resolve `${BUN_X}`: prefer `bun`; else `npx -y bun`; else suggest `brew install oven-sh/bun/bun`.

| Script | Purpose |
|--------|---------|
| `scripts/wechat-browser.ts` | Image-text posts (图文) |
| `scripts/wechat-article.ts` | Article posting via browser (文章) |
| `scripts/wechat-api.ts` | Article posting via API (文章) |
| `scripts/md-to-wechat.ts` | Markdown → WeChat-ready HTML with image placeholders |
| `scripts/check-permissions.ts` | Verify environment & permissions |

## Preferences (EXTEND.md)

Check these paths in order; first hit wins:

| Path | Scope |
|------|-------|
| `.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | Project |
| `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | XDG |
| `$HOME/.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | User home |

Found → read, parse, apply. Not found → run first-time setup (`references/config/first-time-setup.md`) before anything else.

**Minimum keys** (case-insensitive, accept `1/0` or `true/false`):

| Key | Default | Mapping |
|-----|---------|---------|
| `default_author` | empty | Fallback for `author` when CLI/frontmatter not provided |
| `need_open_comment` | `1` | `articles[].need_open_comment` in `draft/add` |
| `only_fans_can_comment` | `0` | `articles[].only_fans_can_comment` in `draft/add` |

**Recommended EXTEND.md**:

```md
default_theme: default
default_color: blue
default_publish_method: api
default_author: 宝玉
need_open_comment: 1
only_fans_can_comment: 0
chrome_profile_path: /path/to/chrome/profile
```

**Theme options**: default, grace, simple, modern. **Color presets**: blue, green, vermilion, yellow, purple, sky, rose, olive, black, gray, pink, red, orange (or hex).

**Value priority**: CLI args → frontmatter → EXTEND.md (account-level → global) → skill defaults.

## Multi-Account Support

EXTEND.md supports an `accounts:` block for managing multiple Official Accounts. With 2+ entries, the workflow inserts a Step 0.5 to prompt for account selection (or auto-selects based on `default: true` or `--account <alias>`).

Full details — compatibility rules, per-account keys, credential resolution, per-account Chrome profiles, CLI usage — in `references/multi-account.md`.

## Pre-flight Check (Optional)

Before first use, suggest the environment check (user can skip):

```bash
${BUN_X} {baseDir}/scripts/check-permissions.ts
```

Checks: Chrome, profile isolation, Bun, Accessibility, clipboard, paste keystroke, API credentials, Chrome conflicts.

| Check fails | Fix |
|-------------|-----|
| Chrome | Install Chrome or set `WECHAT_BROWSER_CHROME_PATH` |
| Profile dir | Shared profile at `baoyu-skills/chrome-profile` |
| Bun runtime | `brew install oven-sh/bun/bun` or `npm install -g bun` |
| Accessibility (macOS) | System Settings → Privacy & Security → Accessibility → enable terminal app |
| Clipboard copy | Ensure Swift/AppKit (macOS: `xcode-select --install`) |
| Paste keystroke (Linux) | Install `xdotool` (X11) or `ydotool` (Wayland) |
| API credentials | Follow guided setup in Step 2, or set in `.baoyu-skills/.env` |

## Image-Text Posting (图文)

Short posts with multiple images (up to 9):

```bash
${BUN_X} {baseDir}/scripts/wechat-browser.ts --markdown article.md --images ./images/
${BUN_X} {baseDir}/scripts/wechat-browser.ts --title "标题" --content "内容" --image img.png --submit
```

Details: `references/image-text-posting.md`.

## Article Posting Workflow (文章)

```
- [ ] Step 0: Load preferences (EXTEND.md)
- [ ] Step 0.5: Resolve account (multi-account only — see references/multi-account.md)
- [ ] Step 1: Determine input type
- [ ] Step 2: Select method and configure credentials
- [ ] Step 3: Resolve theme/color and validate metadata
- [ ] Step 4: Publish to WeChat
- [ ] Step 5: Report completion
```

### Step 0: Load Preferences

Check and load EXTEND.md (see "Preferences" above). If not found, complete first-time setup before any other questions. Resolve and cache for later steps: `default_theme`, `default_color`, `default_author`, `need_open_comment`, `only_fans_can_comment`.

### Step 1: Determine Input Type

| Input | Detection | Next |
|-------|-----------|------|
| HTML file | Path ends `.html`, file exists | Skip to Step 3 |
| Markdown file | Path ends `.md`, file exists | Step 2 |
| Plain text | Not a file path, or file doesn't exist | Save to markdown, then Step 2 |

**Plain-text handling**:

1. Generate slug (first 2-4 meaningful words, kebab-case; translate Chinese to English for the slug).
2. Save to `post-to-wechat/YYYY-MM-DD/<slug>.md` (create directory if needed).
3. Continue as a markdown file.

### Step 2: Select Publishing Method and Configure

Ask method unless specified in EXTEND.md or CLI:

| Method | Speed | Requires |
|--------|-------|----------|
| `api` (Recommended) | Fast | API credentials |
| `browser` | Slow | Chrome + logged-in session |

**API selected + missing credentials** → run guided setup per `references/api-setup.md` (writes to `.baoyu-skills/.env`).

### Step 3: Resolve Theme/Color and Validate Metadata

1. **Theme**: CLI `--theme` → EXTEND.md `default_theme` → `default` (first match wins; do NOT ask if resolved).
2. **Color**: CLI `--color` → EXTEND.md `default_color` → omit (theme default applies).
3. **Validate metadata** (frontmatter for markdown, meta tags for HTML):

| Field | Missing → |
|-------|-----------|
| Title | Ask, or press Enter to auto-generate from content |
| Summary | Frontmatter `description` → `summary` → ask or auto-generate |
| Author | CLI `--author` → frontmatter `author` → EXTEND.md `default_author` |

Auto-generation: title = first H1/H2 or first sentence; summary = first paragraph, truncated to 120 chars.

4. **Cover image** (required for API `article_type=news`): CLI `--cover` → frontmatter (`coverImage` / `featureImage` / `cover` / `image`) → `imgs/cover.png` → first inline image → stop and request one if still missing.

### Step 4: Publish

**Important — never pre-convert markdown to HTML.** Publishing scripts handle the conversion internally and the two methods render images differently: API renders `<img>` tags for upload, browser uses placeholders for paste-and-replace. Passing a pre-converted HTML breaks one or the other.

**Markdown citation default**: for markdown input, ordinary external links are converted to bottom citations by default. Use `--no-cite` only if the user explicitly wants to keep inline links. Existing HTML input is left as-is.

**API method** (accepts `.md` or `.html`):

```bash
${BUN_X} {baseDir}/scripts/wechat-api.ts <file> --theme <theme> [--color <color>] [--title <title>] [--summary <summary>] [--author <author>] [--cover <cover_path>] [--no-cite]
```

Always pass `--theme` even if it's `default`. Only pass `--color` when explicitly set by the user or EXTEND.md.

**`draft/add` payload rules**:
- Endpoint: `POST https://api.weixin.qq.com/cgi-bin/draft/add?access_token=ACCESS_TOKEN`
- `article_type`: `news` (default) or `newspic`
- For `news`, include `thumb_media_id` (cover required)
- Always include `need_open_comment` (default `1`) and `only_fans_can_comment` (default `0`) in the request body, even if the CLI doesn't expose them

**Browser method** (accepts `--markdown` or `--html`):

```bash
${BUN_X} {baseDir}/scripts/wechat-article.ts --markdown <markdown_file> --theme <theme> [--color <color>] [--no-cite]
${BUN_X} {baseDir}/scripts/wechat-article.ts --html <html_file>
```

### Step 5: Completion Report

```
WeChat Publishing Complete!

Input: [type] - [path]
Method: [API | Browser]
Theme: [theme] [color if set]

Article:
• Title: [title]
• Summary: [summary]
• Images: [N] inline
• Comments: [open/closed], [fans-only/all]    ← API method only

Result:
✓ Draft saved to WeChat Official Account
• media_id: [media_id]                         ← API method only

Next Steps (API):
→ Manage drafts: https://mp.weixin.qq.com (登录后进入「内容管理」→「草稿箱」)

Files created:
[• post-to-wechat/YYYY-MM-DD/slug.md (if plain text input)]
[• slug.html (converted)]
```

## Feature Comparison

| Feature | Image-Text | Article (API) | Article (Browser) |
|---------|:---:|:---:|:---:|
| Plain text input | ✗ | ✓ | ✓ |
| HTML input | ✗ | ✓ | ✓ |
| Markdown input | Title/content | ✓ | ✓ |
| Multiple images | ✓ (up to 9) | ✓ (inline) | ✓ (inline) |
| Themes | ✗ | ✓ | ✓ |
| Auto-generate metadata | ✗ | ✓ | ✓ |
| Default cover fallback (`imgs/cover.png`) | ✗ | ✓ | ✗ |
| Comment control | ✗ | ✓ | ✗ |
| Requires Chrome | ✓ | ✗ | ✓ |
| Requires API credentials | ✗ | ✓ | ✗ |
| Speed | Medium | Fast | Slow |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Missing API credentials | Follow guided setup in Step 2 |
| Access token error | Verify credentials valid and not expired |
| Not logged in (browser) | First run opens browser — scan QR to log in |
| Chrome not found | Set `WECHAT_BROWSER_CHROME_PATH` |
| Title/summary missing | Use auto-generation or provide manually |
| No cover image | Add frontmatter cover or place `imgs/cover.png` in article directory |
| Wrong comment defaults | Check `need_open_comment` / `only_fans_can_comment` in EXTEND.md |
| Paste fails | Check system clipboard permissions |

## References

| File | Content |
|------|---------|
| `references/image-text-posting.md` | Image-text parameters, auto-compression |
| `references/article-posting.md` | Article themes, image handling |
| `references/multi-account.md` | Multi-account compatibility, credentials, Chrome profiles, CLI |
| `references/api-setup.md` | Guided credential setup |
| `references/config/first-time-setup.md` | First-time EXTEND.md setup |

## Extension Support

Custom configurations via EXTEND.md. See "Preferences" for paths and supported options.
