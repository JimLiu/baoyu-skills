---
name: baoyu-post-to-wechat
description: Posts content to WeChat Official Account (微信公众号) via API or Chrome CDP. Supports article posting (文章) with HTML, markdown, or plain text input, and image-text posting (贴图, formerly 图文) with multiple images. Markdown article workflows default to converting ordinary external links into bottom citations for WeChat-friendly output. Use when user mentions "发布公众号", "post to wechat", "微信公众号", or "贴图/图文/文章".
version: 1.118.2
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

Reply in the user's language; keep paths, flags, field names in English.

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

First hit wins:

| Path | Scope |
|------|-------|
| `.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | Project |
| `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | XDG |
| `$HOME/.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | User home |

Found → apply. Not found → run first-time setup (`references/config/first-time-setup.md`) before anything else.

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
default_publish_method: browser
default_author: 宝玉
need_open_comment: 1
only_fans_can_comment: 0
chrome_profile_path: /path/to/chrome/profile

# Remote API publishing (optional) — only set if WeChat's IP allowlist
# excludes your local machine. See "Remote API Method" below.
# remote_publish_host: server.example.com
# remote_publish_user: deploy
# remote_publish_port: 22
# remote_publish_identity_file: ~/.ssh/id_ed25519
# remote_publish_known_hosts_file: ~/.ssh/known_hosts
# remote_publish_strict_host_key_checking: accept-new
# remote_publish_connect_timeout: 10
# remote_publish_proxy_jump: bastion.example.com
```

Only the typed `remote_publish_*` keys are honored (no raw `ssh`/`scp` options). SSH key auth only (no passwords).

**Theme options**: default, grace, simple, modern. **Color presets**: blue, green, vermilion, yellow, purple, sky, rose, olive, black, gray, pink, red, orange (or hex).

**Value priority**: CLI args → frontmatter → EXTEND.md (account-level → global) → skill defaults.

## Multi-Account

An `accounts:` block with 2+ entries adds Step 0.5 (account selection; auto-selects via `default: true` or `--account <alias>`). Per-account keys, credential resolution, Chrome profiles: `references/multi-account.md`.

## Pre-flight Check (Optional)

Before first use, suggest (user can skip):

```bash
${BUN_X} {baseDir}/scripts/check-permissions.ts
```

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

Up to 9 images:

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

Load EXTEND.md (see Preferences); if missing, finish first-time setup before any other question. Cache `default_theme`, `default_color`, `default_author`, `need_open_comment`, `only_fans_can_comment`.

### Step 1: Determine Input Type

| Input | Detection | Next |
|-------|-----------|------|
| HTML file | Path ends `.html`, file exists | Skip to Step 3 |
| Markdown file | Path ends `.md`, file exists | Step 2 |
| Plain text | Not a file path, or file doesn't exist | Save to markdown, then Step 2 |

**Plain text**: save to `post-to-wechat/YYYY-MM-DD/<slug>.md` (slug = 2-4 meaningful words, kebab-case, Chinese translated to English), then treat as markdown.

### Step 2: Select Publishing Method and Configure

Ask method unless specified in EXTEND.md or CLI:

| Method | Speed | Requires |
|--------|-------|----------|
| `api` (Recommended) | Fast | API credentials (local IP allowlisted) |
| `browser` | Slow | Chrome + logged-in session |
| `remote-api` | Fast | API credentials + an SSH-reachable server whose IP is on the WeChat allowlist |

**API selected + missing credentials** → run guided setup per `references/api-setup.md` (writes to `.baoyu-skills/.env`).

**`remote-api`**: for when "公众号设置 → IP 白名单" excludes the local IP but includes a server's. Rendering, image processing, draft assembly and HTML rewriting stay local; only the HTTPS calls to `api.weixin.qq.com` (token, uploadimg, add_material, draft/add) go through an SSH SOCKS5 forward (`ssh -N -D`), so WeChat sees the server's IP. Nothing is written to the remote host; `AppSecret` never leaves the local process. Remote needs only `sshd` + outbound network. Usage: "Remote API method" in Step 4.

### Step 3: Resolve Theme/Color and Validate Metadata

1. **Theme**: CLI `--theme` → EXTEND.md `default_theme` → `default` (don't ask if resolved).
2. **Color**: CLI `--color` → EXTEND.md `default_color` → omit (theme default applies).
3. **Validate metadata** (frontmatter for markdown, meta tags for HTML):

| Field | Missing → |
|-------|-----------|
| Title | Ask, or press Enter to auto-generate from content |
| Summary | Frontmatter `description` → `summary` → ask or auto-generate |
| Author | CLI `--author` → frontmatter `author` → EXTEND.md `default_author` |
| Source URL | CLI `--source-url` → frontmatter `sourceUrl`/`contentSourceUrl`/`content_source_url` |

Auto-generation: title = first H1/H2 or first sentence; summary = first paragraph, truncated to 120 chars.

4. **Cover image** (required for API `article_type=news`): CLI `--cover` → frontmatter (`coverImage` / `featureImage` / `cover_image` / `cover` / `image`) → `imgs/cover.png` → first inline image → stop and request one if still missing. Local paths and `http(s)://` URLs are both accepted.

### Step 4: Publish

**Never pre-convert markdown to HTML.** The scripts convert internally and differ: API renders `<img>` for upload, browser uses placeholders for paste-and-replace.

**No SVG body images**: convert to PNG/JPG first.

**Citations**: markdown input converts ordinary external links to bottom citations by default; pass `--no-cite` only if the user explicitly wants inline links. HTML input is left as-is.

**API method** (accepts `.md` or `.html`):

```bash
${BUN_X} {baseDir}/scripts/wechat-api.ts <file> --theme <theme> [--color <color>] [--title <title>] [--summary <summary>] [--author <author>] [--cover <cover_path>] [--source-url <url>] [--no-cite]
```

Always pass `--theme` (even `default`). Pass `--color` only when set by the user or EXTEND.md.

**Remote API method** (same script, adds `--remote`):

```bash
${BUN_X} {baseDir}/scripts/wechat-api.ts <file> --theme <theme> --remote [--remote-host <host>] [--remote-user <user>] [--remote-port <port>] [--remote-identity-file <path>] [--remote-known-hosts-file <path>] [--remote-strict-host-key-checking yes|no|accept-new] [--remote-connect-timeout <s>] [--remote-proxy-jump <spec>]
```

Any `--remote-*` flag implies `--remote`. CLI values override account-level then global `remote_publish_*` keys from EXTEND.md. Setting `default_publish_method: remote-api` also enables remote mode without `--remote`.

**`draft/add` payload rules**:
- Endpoint: `POST https://api.weixin.qq.com/cgi-bin/draft/add?access_token=ACCESS_TOKEN`
- `article_type`: `news` (default) or `newspic`
- For `news`, include `thumb_media_id` (cover required)
- Always include `need_open_comment` (default `1`) and `only_fans_can_comment` (default `0`), even though the CLI doesn't expose them
- For `news`, optional `content_source_url` ("阅读原文" link, max 1KB) from `--source-url` or frontmatter (see Step 3)

**Browser method** (accepts `--markdown` or `--html`):

```bash
${BUN_X} {baseDir}/scripts/wechat-article.ts --markdown <markdown_file> --theme <theme> [--color <color>] [--no-cite]
${BUN_X} {baseDir}/scripts/wechat-article.ts --html <html_file>
```

Parameters and placeholder flow: `references/article-posting.md`.

### Step 5: Completion Report

Report: input type + path; method; theme/color; title, summary, inline image count; comments open/closed + fans-only/all (API only); "✓ Draft saved to WeChat Official Account" + `media_id` (API only); next step for API: https://mp.weixin.qq.com → 内容管理 → 草稿箱; files created (`post-to-wechat/YYYY-MM-DD/slug.md` for plain text, `slug.html` if converted).

## Feature Comparison

| Feature | Image-Text | Article (API) | Article (Remote API) | Article (Browser) |
|---------|:---:|:---:|:---:|:---:|
| Plain text input | ✗ | ✓ | ✓ | ✓ |
| HTML input | ✗ | ✓ | ✓ | ✓ |
| Markdown input | Title/content | ✓ | ✓ | ✓ |
| Multiple images | ✓ (up to 9) | ✓ (inline) | ✓ (inline) | ✓ (inline) |
| Themes | ✗ | ✓ | ✓ | ✓ |
| Auto-generate metadata | ✗ | ✓ | ✓ | ✓ |
| Default cover fallback (`imgs/cover.png`) | ✗ | ✓ | ✓ | ✗ |
| Comment control | ✗ | ✓ | ✓ | ✗ |
| Requires Chrome | ✓ | ✗ | ✗ | ✓ |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Missing API credentials | Follow guided setup in Step 2 |
| Access token error | Verify credentials valid and not expired |
| Not logged in (browser) | First run opens browser — scan QR to log in. Set `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` to receive the QR image via Telegram |
| Chrome not found | Set `WECHAT_BROWSER_CHROME_PATH` |
| No cover image | Add frontmatter cover or place `imgs/cover.png` in article directory |
| Wrong comment defaults | Check `need_open_comment` / `only_fans_can_comment` in EXTEND.md |
| Paste fails | Check system clipboard permissions |
| `Remote publish host is required` | Set `--remote-host` or `remote_publish_host` in EXTEND.md |
| `SOCKS proxy on 127.0.0.1:… not ready` | SSH could not start the tunnel — check key, host, `StrictHostKeyChecking`, or use `--remote-connect-timeout` |
| `ssh exited early` during remote publish | Verify the user can `ssh` non-interactively to the server; raise `--remote-connect-timeout` if the link is slow |
| Remote API call returns `errcode 40164` (invalid IP) | The remote server's egress IP is not on WeChat's allowlist; add it in 公众号设置 → IP 白名单 |

## Extension Support

Custom configuration via EXTEND.md — see Preferences.
