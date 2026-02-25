---
name: baoyu-post-to-wechat
description: Posts content to WeChat Official Account (微信公众号) via API or Chrome CDP. Supports article posting (文章) with HTML, markdown, or plain text input, and image-text posting (贴图, formerly 图文) with multiple images. Use when user mentions "发布公众号", "post to wechat", "微信公众号", or "贴图/图文/文章".
---

# Post to WeChat Official Account

## Language

**Match user's language**: Respond in the same language the user uses.

## Script Directory

**Agent Execution**: Determine this SKILL.md directory as `SKILL_DIR`, then use `${SKILL_DIR}/scripts/<name>.ts`.

| Script | Purpose |
|--------|---------|
| `scripts/wechat-browser.ts` | Image-text posts (图文) |
| `scripts/wechat-article.ts` | Article posting via browser (文章) |
| `scripts/wechat-api.ts` | Article posting via API (文章) |
| `scripts/check-permissions.ts` | Verify environment & permissions |

## Preferences (EXTEND.md)

Check EXTEND.md existence (project-level `.baoyu-skills/baoyu-post-to-wechat/EXTEND.md`, then user-level `$HOME/.baoyu-skills/baoyu-post-to-wechat/EXTEND.md`). If found, read and apply. If not found, run first-time setup ([references/config/first-time-setup.md](references/config/first-time-setup.md)).

**Supports**: Default theme | Publishing method (api/browser) | Default author | Comment settings | Chrome profile path

**Minimum supported keys**:

| Key | Default | Description |
|-----|---------|-------------|
| `default_author` | empty | Fallback author |
| `need_open_comment` | `1` | Enable comments |
| `only_fans_can_comment` | `0` | Restrict to fans |

**Priority**: CLI > Frontmatter > EXTEND.md > Defaults

## Pre-flight Check (Optional)

```bash
npx -y bun ${SKILL_DIR}/scripts/check-permissions.ts
```

Checks: Chrome, profile isolation, Bun, Accessibility, clipboard, paste keystroke, API credentials, Chrome conflicts.

## Image-Text Posting (图文)

For short posts with multiple images (up to 9):

```bash
npx -y bun ${SKILL_DIR}/scripts/wechat-browser.ts --markdown article.md --images ./images/
npx -y bun ${SKILL_DIR}/scripts/wechat-browser.ts --title "标题" --content "内容" --image img.png --submit
```

See [references/image-text-posting.md](references/image-text-posting.md) for details.

## Article Posting Workflow (文章)

```
Step 0: Load preferences → Step 1: Determine input type → Step 2: Check md-to-html skill → Step 3: Convert to HTML → Step 4: Validate metadata → Step 5: Select method & credentials → Step 6: Publish → Step 7: Report
```

### Step 0: Load Preferences

Check and load EXTEND.md settings. If not found, complete first-time setup BEFORE any other steps.

### Step 1: Determine Input Type

| Input | Detection | Action |
|-------|-----------|--------|
| HTML file | `.html` extension | Skip to Step 4 |
| Markdown file | `.md` extension | Continue to Step 2 |
| Plain text | No file path | Save to `post-to-wechat/YYYY-MM-DD/{slug}.md`, then Step 2 |

### Step 2: Check Markdown-to-HTML Skill

Skip if input is HTML. Check `skills/baoyu-markdown-to-html/SKILL.md` exists. If not found, suggest installation.

### Step 3: Convert Markdown to HTML

Theme resolution (first match, do NOT ask if resolved): CLI `--theme` → EXTEND.md `default_theme` → `default`.

```bash
npx -y bun ${MD_TO_HTML_SKILL_DIR}/scripts/main.ts <markdown_file> --theme <theme>
```

**CRITICAL**: Always include `--theme`. Parse JSON output for `htmlPath`, `title`, `author`, `summary`, `contentImages`.

### Step 4: Validate Metadata

| Field | If Missing |
|-------|------------|
| Title | Prompt or auto-generate from first heading |
| Summary | Prompt or auto-generate (first paragraph, 120 chars) |
| Author | Fallback chain: CLI → frontmatter → EXTEND.md `default_author` |
| Cover | CLI `--cover` → frontmatter → `imgs/cover.png` → first inline image → stop and request |

### Step 5: Select Publishing Method and Configure

| Method | Speed | Requirements |
|--------|-------|--------------|
| `api` (Recommended) | Fast | API credentials (WECHAT_APP_ID, WECHAT_APP_SECRET in `.baoyu-skills/.env`) |
| `browser` | Slow | Chrome, login session |

If API selected and credentials missing, guide setup via `mp.weixin.qq.com` → 开发 → 基本配置.

### Step 6: Publish to WeChat

**API**: `npx -y bun ${SKILL_DIR}/scripts/wechat-api.ts <html_file> [--title <title>] [--summary <summary>] [--author <author>] [--cover <cover_path>]`

Always resolve and include `need_open_comment` and `only_fans_can_comment` in the draft/add request.

**Browser**: `npx -y bun ${SKILL_DIR}/scripts/wechat-article.ts --html <html_file>`

### Step 7: Completion Report

Report: input type, method, theme, article details (title, summary, image count, comment settings), result (media_id for API), and next steps (manage drafts link for API method).

## Feature Comparison

| Feature | Image-Text | Article (API) | Article (Browser) |
|---------|------------|---------------|-------------------|
| Markdown input | Title/content | ✓ (via skill) | ✓ (via skill) |
| Multiple images | ✓ (up to 9) | ✓ (inline) | ✓ (inline) |
| Comment control | ✗ | ✓ | ✗ |
| Requires Chrome | ✓ | ✗ | ✓ |
| Requires API credentials | ✗ | ✓ | ✗ |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No markdown-to-html skill | Install `baoyu-markdown-to-html` |
| Missing API credentials | Follow guided setup in Step 5 |
| Not logged in (browser) | First run opens browser - scan QR to log in |
| Chrome not found | Set `WECHAT_BROWSER_CHROME_PATH` env var |
| No cover image | Add frontmatter cover or place `imgs/cover.png` in article directory |

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for supported options.
