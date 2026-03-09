---
name: baoyu-post-to-wechat
description: Posts content to WeChat Official Account (微信公众号) via API or Chrome CDP. Supports article posting (文章) with HTML, markdown, or plain text input, and image-text posting (贴图, formerly 图文) with multiple images. Markdown article workflows default to converting ordinary external links into bottom citations for WeChat-friendly output. Use when user mentions "发布公众号", "post to wechat", "微信公众号", or "贴图/图文/文章".
---

# Post to WeChat Official Account

## Language

**Match user's language**: Respond in the same language the user uses. If user writes in Chinese, respond in Chinese. If user writes in English, respond in English.

## Script Directory

**Agent Execution**: Determine this SKILL.md directory as `SKILL_DIR`, then use `${SKILL_DIR}/scripts/<name>.ts`. Resolve `${BUN_X}` runtime: if `bun` installed → `bun`; if `npx` available → `npx -y bun`; else suggest installing bun.

| Script | Purpose |
|--------|---------|
| `scripts/wechat-browser.ts` | Image-text posts (图文) |
| `scripts/wechat-article.ts` | Article posting via browser (文章) |
| `scripts/wechat-api.ts` | Article posting via API (文章) |
| `scripts/md-to-wechat.ts` | Markdown → WeChat-ready HTML with image placeholders |
| `scripts/check-permissions.ts` | Verify environment & permissions |

## Preferences (EXTEND.md)

Check EXTEND.md existence (priority order):

```bash
# macOS, Linux, WSL, Git Bash
test -f .baoyu-skills/baoyu-post-to-wechat/EXTEND.md && echo "project"
test -f "$HOME/.baoyu-skills/baoyu-post-to-wechat/EXTEND.md" && echo "user"
```

```powershell
# PowerShell (Windows)
if (Test-Path .baoyu-skills/baoyu-post-to-wechat/EXTEND.md) { "project" }
if (Test-Path "$HOME/.baoyu-skills/baoyu-post-to-wechat/EXTEND.md") { "user" }
```

┌────────────────────────────────────────────────────────┬───────────────────┐
│                          Path                          │     Location      │
├────────────────────────────────────────────────────────┼───────────────────┤
│ .baoyu-skills/baoyu-post-to-wechat/EXTEND.md           │ Project directory │
├────────────────────────────────────────────────────────┼───────────────────┤
│ $HOME/.baoyu-skills/baoyu-post-to-wechat/EXTEND.md     │ User home         │
└────────────────────────────────────────────────────────┴───────────────────┘

┌───────────┬───────────────────────────────────────────────────────────────────────────┐
│  Result   │                                  Action                                   │
├───────────┼───────────────────────────────────────────────────────────────────────────┤
│ Found     │ Read, parse, apply settings                                               │
├───────────┼───────────────────────────────────────────────────────────────────────────┤
│ Not found │ Run first-time setup ([references/config/first-time-setup.md](references/config/first-time-setup.md)) → Save → Continue │
└───────────┴───────────────────────────────────────────────────────────────────────────┘

**EXTEND.md Supports**: Default theme | Default color | Default publishing method (api/browser) | Default author | Default open-comment switch | Default fans-only-comment switch | Chrome profile path

First-time setup: [references/config/first-time-setup.md](references/config/first-time-setup.md)

**Minimum supported keys** (case-insensitive, accept `1/0` or `true/false`):

| Key | Default | Mapping |
|-----|---------|---------|
| `default_author` | empty | Fallback for `author` when CLI/frontmatter not provided |
| `need_open_comment` | `1` | `articles[].need_open_comment` in `draft/add` request |
| `only_fans_can_comment` | `0` | `articles[].only_fans_can_comment` in `draft/add` request |

**Recommended EXTEND.md example**:

```md
default_theme: default
default_color: blue
default_publish_method: api
default_author: 宝玉
need_open_comment: 1
only_fans_can_comment: 0
chrome_profile_path: /path/to/chrome/profile
```

**Theme options**: default, grace, simple, modern

**Color presets**: blue, green, vermilion, yellow, purple, sky, rose, olive, black, gray, pink, red, orange (or hex value)

**Value priority**:
1. CLI arguments
2. Frontmatter
3. EXTEND.md
4. Skill defaults

## Pre-flight Check (Optional)

Before first use, suggest running the environment check. User can skip if they prefer.

```bash
${BUN_X} ${SKILL_DIR}/scripts/check-permissions.ts
```

Checks: Chrome, profile isolation, Bun, Accessibility, clipboard, paste keystroke, API credentials, Chrome conflicts.

**If any check fails**, provide fix guidance per item:

| Check | Fix |
|-------|-----|
| Chrome | Install Chrome or set `WECHAT_BROWSER_CHROME_PATH` env var |
| Profile dir | Shared profile at `baoyu-skills/chrome-profile` (see CLAUDE.md Chrome Profile section) |
| Bun runtime | `brew install oven-sh/bun/bun` (macOS) or `npm install -g bun` |
| Accessibility (macOS) | System Settings → Privacy & Security → Accessibility → enable terminal app |
| Clipboard copy | Ensure Swift/AppKit available (macOS Xcode CLI tools: `xcode-select --install`) |
| Paste keystroke (macOS) | Same as Accessibility fix above |
| Paste keystroke (Linux) | Install `xdotool` (X11) or `ydotool` (Wayland) |
| API credentials | Follow guided setup in Step 2, or manually set in `.baoyu-skills/.env` |

## Image-Text Posting (图文)

For short posts with multiple images (up to 9):

```bash
${BUN_X} ${SKILL_DIR}/scripts/wechat-browser.ts --markdown article.md --images ./images/
${BUN_X} ${SKILL_DIR}/scripts/wechat-browser.ts --title "标题" --content "内容" --image img.png --submit
```

See [references/image-text-posting.md](references/image-text-posting.md) for details.

## Article Posting Workflow (文章)

Copy this checklist and check off items as you complete them:

```
Publishing Progress:
- [ ] Step 0: Load preferences (EXTEND.md)
- [ ] Step 1: Determine input type
- [ ] Step 2: Select method and configure credentials
- [ ] Step 3: Resolve theme/color and validate metadata
- [ ] Step 4: Publish to WeChat
- [ ] Step 5: Report completion
```

### Step 0: Load Preferences

Check and load EXTEND.md settings (see Preferences section above).

**CRITICAL**: If not found, complete first-time setup BEFORE any other steps or questions.

Resolve and store these defaults for later steps:
- `default_theme` (default `default`)
- `default_color` (omit if not set — theme default applies)
- `default_author`
- `need_open_comment` (default `1`)
- `only_fans_can_comment` (default `0`)

### Step 1: Determine Input Type

| Input Type | Detection | Action |
|------------|-----------|--------|
| HTML file | Path ends with `.html`, file exists | Skip to Step 3 |
| Markdown file | Path ends with `.md`, file exists | Continue to Step 2 |
| Plain text | Not a file path, or file doesn't exist | Save to markdown, continue to Step 2 |

**Plain Text Handling**:

1. Generate slug from content (first 2-4 meaningful words, kebab-case)
2. Create directory and save file:

```bash
mkdir -p "$(pwd)/post-to-wechat/$(date +%Y-%m-%d)"
# Save content to: post-to-wechat/yyyy-MM-dd/[slug].md
```

3. Continue processing as markdown file

**Slug Examples**:
- "Understanding AI Models" → `understanding-ai-models`
- "人工智能的未来" → `ai-future` (translate to English for slug)

### Step 2: Select Publishing Method and Configure

**Ask publishing method** (unless specified in EXTEND.md or CLI):

| Method | Speed | Requirements |
|--------|-------|--------------|
| `api` (Recommended) | Fast | API credentials |
| `browser` | Slow | Chrome, login session |

**If API Selected - Check Credentials**:

```bash
# macOS, Linux, WSL, Git Bash
test -f .baoyu-skills/.env && grep -q "WECHAT_APP_ID" .baoyu-skills/.env && echo "project"
test -f "$HOME/.baoyu-skills/.env" && grep -q "WECHAT_APP_ID" "$HOME/.baoyu-skills/.env" && echo "user"
```

```powershell
# PowerShell (Windows)
if ((Test-Path .baoyu-skills/.env) -and (Select-String -Quiet -Pattern "WECHAT_APP_ID" .baoyu-skills/.env)) { "project" }
if ((Test-Path "$HOME/.baoyu-skills/.env") -and (Select-String -Quiet -Pattern "WECHAT_APP_ID" "$HOME/.baoyu-skills/.env")) { "user" }
```

**If Credentials Missing - Guide Setup**:

```
WeChat API credentials not found.

To obtain credentials:
1. Visit https://mp.weixin.qq.com
2. Go to: 开发 → 基本配置
3. Copy AppID and AppSecret

Where to save?
A) Project-level: .baoyu-skills/.env (this project only)
B) User-level: ~/.baoyu-skills/.env (all projects)
```

After location choice, prompt for values and write to `.env`:

```
WECHAT_APP_ID=<user_input>
WECHAT_APP_SECRET=<user_input>
```

### Step 3: Resolve Theme/Color and Validate Metadata

1. **Resolve theme** (first match wins, do NOT ask user if resolved):
   - CLI `--theme` argument
   - EXTEND.md `default_theme` (loaded in Step 0)
   - Fallback: `default`

2. **Resolve color** (first match wins):
   - CLI `--color` argument
   - EXTEND.md `default_color` (loaded in Step 0)
   - Omit if not set (theme default applies)

3. **Validate metadata** from frontmatter (markdown) or HTML meta tags (HTML input):

| Field | If Missing |
|-------|------------|
| Title | Prompt: "Enter title, or press Enter to auto-generate from content" |
| Summary | Prompt: "Enter summary, or press Enter to auto-generate (recommended for SEO)" |
| Author | Use fallback chain: CLI `--author` → frontmatter `author` → EXTEND.md `default_author` |

**Auto-Generation Logic**:
- **Title**: First H1/H2 heading, or first sentence
- **Summary**: First paragraph, truncated to 120 characters

4. **Cover Image Check** (required for API `article_type=news`):
   1. Use CLI `--cover` if provided.
   2. Else use frontmatter (`coverImage`, `featureImage`, `cover`, `image`).
   3. Else check article directory default path: `imgs/cover.png`.
   4. Else fallback to first inline content image.
   5. If still missing, stop and request a cover image before publishing.

### Step 4: Publish to WeChat

**CRITICAL**: Publishing scripts handle markdown conversion internally. Do NOT pre-convert markdown to HTML — pass the original markdown file directly. This ensures the API method renders images as `<img>` tags (for API upload) while the browser method uses placeholders (for paste-and-replace workflow).

**Markdown citation default**:
- For markdown input, ordinary external links are converted to bottom citations by default.
- Use `--no-cite` only if the user explicitly wants to keep ordinary external links inline.
- Existing HTML input is left as-is; no extra citation conversion is applied.

**API method** (accepts `.md` or `.html`):

```bash
${BUN_X} ${SKILL_DIR}/scripts/wechat-api.ts <file> --theme <theme> [--color <color>] [--title <title>] [--summary <summary>] [--author <author>] [--cover <cover_path>] [--no-cite]
```

**CRITICAL**: Always include `--theme` parameter. Never omit it, even if using `default`. Only include `--color` if explicitly set by user or EXTEND.md.

**`draft/add` payload rules**:
- Use endpoint: `POST https://api.weixin.qq.com/cgi-bin/draft/add?access_token=ACCESS_TOKEN`
- `article_type`: `news` (default) or `newspic`
- For `news`, include `thumb_media_id` (cover is required)
- Always resolve and send:
  - `need_open_comment` (default `1`)
  - `only_fans_can_comment` (default `0`)
- `author` resolution: CLI `--author` → frontmatter `author` → EXTEND.md `default_author`

If script parameters do not expose the two comment fields, still ensure final API request body includes resolved values.

**Browser method** (accepts `--markdown` or `--html`):

```bash
${BUN_X} ${SKILL_DIR}/scripts/wechat-article.ts --markdown <markdown_file> --theme <theme> [--color <color>] [--no-cite]
${BUN_X} ${SKILL_DIR}/scripts/wechat-article.ts --html <html_file>
```

### Step 5: Completion Report

**For API method**, include draft management link:

```
WeChat Publishing Complete!

Input: [type] - [path]
Method: API
Theme: [theme name] [color if set]

Article:
• Title: [title]
• Summary: [summary]
• Images: [N] inline images
• Comments: [open/closed], [fans-only/all users]

Result:
✓ Draft saved to WeChat Official Account
• media_id: [media_id]

Next Steps:
→ Manage drafts: https://mp.weixin.qq.com (登录后进入「内容管理」→「草稿箱」)

Files created:
[• post-to-wechat/yyyy-MM-dd/slug.md (if plain text)]
[• slug.html (converted)]
```

**For Browser method**:

```
WeChat Publishing Complete!

Input: [type] - [path]
Method: Browser
Theme: [theme name] [color if set]

Article:
• Title: [title]
• Summary: [summary]
• Images: [N] inline images

Result:
✓ Draft saved to WeChat Official Account

Files created:
[• post-to-wechat/yyyy-MM-dd/slug.md (if plain text)]
[• slug.html (converted)]
```

## Detailed References

| Topic | Reference |
|-------|-----------|
| Image-text parameters, auto-compression | [references/image-text-posting.md](references/image-text-posting.md) |
| Article themes, image handling | [references/article-posting.md](references/article-posting.md) |

## Feature Comparison

| Feature | Image-Text | Article (API) | Article (Browser) |
|---------|------------|---------------|-------------------|
| Plain text input | ✗ | ✓ | ✓ |
| HTML input | ✗ | ✓ | ✓ |
| Markdown input | Title/content | ✓ | ✓ |
| Multiple images | ✓ (up to 9) | ✓ (inline) | ✓ (inline) |
| Themes | ✗ | ✓ | ✓ |
| Auto-generate metadata | ✗ | ✓ | ✓ |
| Default cover fallback (`imgs/cover.png`) | ✗ | ✓ | ✗ |
| Comment control (`need_open_comment`, `only_fans_can_comment`) | ✗ | ✓ | ✗ |
| Requires Chrome | ✓ | ✗ | ✓ |
| Requires API credentials | ✗ | ✓ | ✗ |
| Speed | Medium | Fast | Slow |

## Prerequisites

**For API method**:
- WeChat Official Account API credentials
- Guided setup in Step 2, or manually set in `.baoyu-skills/.env`

**For Browser method**:
- Google Chrome
- First run: log in to WeChat Official Account (session preserved)

**Config File Locations** (priority order):
1. Environment variables
2. `<cwd>/.baoyu-skills/.env`
3. `~/.baoyu-skills/.env`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Missing API credentials | Follow guided setup in Step 2 |
| Access token error | Check if API credentials are valid and not expired |
| Not logged in (browser) | First run opens browser - scan QR to log in |
| Chrome not found | Set `WECHAT_BROWSER_CHROME_PATH` env var |
| Title/summary missing | Use auto-generation or provide manually |
| No cover image | Add frontmatter cover or place `imgs/cover.png` in article directory |
| Wrong comment defaults | Check `EXTEND.md` keys `need_open_comment` and `only_fans_can_comment` |
| Paste fails | Check system clipboard permissions |

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
