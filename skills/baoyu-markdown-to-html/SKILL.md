---
name: baoyu-markdown-to-html
description: Converts Markdown to styled HTML with WeChat-compatible themes. Supports code highlighting, math, Mermaid (rendered to PNG via headless Chrome), PlantUML, footnotes, alerts, infographics, and optional bottom citations for external links. Use when user asks for "markdown to html", "convert md to html", "md 转 html", "微信外链转底部引用", or needs styled HTML output from markdown.
version: 1.117.3
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-markdown-to-html
    requires:
      anyBins:
        - bun
        - npx
---

# Markdown to HTML Converter

Output is HTML with inline CSS, optimized for WeChat Official Account.

## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete `AskUserQuestion` references below are examples — substitute the local equivalent in other runtimes.

## Script Directory

`{baseDir}` = this SKILL.md's directory. Resolve `${BUN_X}`: `bun` if installed → else `npx -y bun` → else suggest installing bun.

| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Main entry point |

## Preferences (EXTEND.md)

First found wins:

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-markdown-to-html/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-markdown-to-html/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-markdown-to-html/EXTEND.md` | User home |

None found → use defaults.

**Supported**: default theme, custom CSS variables, code block style, mermaid defaults (`mermaid_theme`, `mermaid_scale`, `mermaid_background`).

## Workflow

### Step 0: Pre-check (CJK Content)

Only if the input contains CJK characters AND the `baoyu-format-markdown` skill is available: ask (`AskUserQuestion`) whether to format first — it fixes `**` bold markers broken by inner punctuation and CJK/English spacing. Agree → run `baoyu-format-markdown`, use the formatted file. Decline → use the original. No CJK → skip to Step 1.

### Step 1: Determine Theme

First match wins:
1. User-specified (CLI `--theme` or conversation)
2. This skill's EXTEND.md `default_theme`
3. Cross-skill fallback (only if step 2 has none): `default_theme:` line in `$HOME/.baoyu-skills/baoyu-post-to-wechat/EXTEND.md`, if it exists
4. None → ask (`AskUserQuestion`) with the [Themes](#themes) table

Theme from EXTEND.md → use it directly, do NOT ask.

### Step 1.5: Determine Citation Mode

Default off; don't ask. Enable (`--cite`) only if the user explicitly asks for "微信外链转底部引用", "底部引用", "文末引用", or passes `--cite`. When enabled:
- Ordinary external links are rendered with numbered superscripts and collected under a final `引用链接` section.
- `https://mp.weixin.qq.com/...` links stay as direct links and are not moved to the bottom.
- Bare links where link text equals URL stay inline.

### Step 2: Convert

```bash
${BUN_X} {baseDir}/scripts/main.ts <markdown_file> --theme <theme> [--cite]
```

### Step 3: Report Result

Show `htmlPath` from the JSON result; mention `backupPath` if a backup was created.

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--theme <name>` | Theme name (default, grace, simple, modern) | default |
| `--color <name\|hex>` | Primary color: preset name or hex value | theme default |
| `--font-family <name>` | Font: sans, serif, serif-cjk, mono, or CSS value | theme default |
| `--font-size <N>` | Font size: 14px, 15px, 16px, 17px, 18px | 16px |
| `--title <title>` | Override title from frontmatter | |
| `--cite` | Convert external links to bottom citations, append `引用链接` section | false (off) |
| `--keep-title` | Keep the first heading in content | false (removed) |
| `--mermaid-theme <name>` | Mermaid theme: `default`, `forest`, `dark`, `neutral`, `base` | default |
| `--mermaid-scale <N>` | Mermaid render scale (positive number ≤ 4) | 2 |
| `--mermaid-width <N>` | Mermaid target display width in CSS px; PNG is rendered at `width × scale` pixels when the diagram is narrower than this | 860 |
| `--mermaid-bg <value>` | Mermaid background: `white`, `transparent`, or `#hex` | white |
| `--no-mermaid` | Skip Mermaid PNG rendering; emit `<pre class="mermaid">` fallback | false |
| `--help` | Show help | |

**Color Presets:**

| Name | Hex | Label |
|------|-----|-------|
| blue | #0F4C81 | Classic Blue |
| green | #009874 | Emerald Green |
| vermilion | #FA5151 | Vibrant Vermilion |
| yellow | #FECE00 | Lemon Yellow |
| purple | #92617E | Lavender Purple |
| sky | #55C9EA | Sky Blue |
| rose | #B76E79 | Rose Gold |
| olive | #556B2F | Olive Green |
| black | #333333 | Graphite Black |
| gray | #A9A9A9 | Smoke Gray |
| pink | #FFB7C5 | Sakura Pink |
| red | #A93226 | China Red |
| orange | #D97757 | Warm Orange (modern default) |

**Examples:**

```bash
${BUN_X} {baseDir}/scripts/main.ts article.md                                  # default theme, first heading removed
${BUN_X} {baseDir}/scripts/main.ts article.md --theme modern --color red
${BUN_X} {baseDir}/scripts/main.ts article.md --cite --keep-title --title "My Article"
```

## Output

`/path/to/article.md` → `/path/to/article.html` (same directory). An existing HTML file is first backed up to `/path/to/article.html.bak-YYYYMMDDHHMMSS`.

**JSON to stdout:**

```json
{
  "title": "Article Title",
  "author": "Author Name",
  "summary": "Article summary...",
  "htmlPath": "/path/to/article.html",
  "backupPath": "/path/to/article.html.bak-20260128180000",
  "contentImages": [
    {
      "placeholder": "MDTOHTMLIMGPH_1",
      "localPath": "/path/to/img.png",
      "originalPath": "imgs/image.png"
    }
  ],
  "mermaidImages": [
    {
      "hash": "a1b2c3d4e5f6",
      "localPath": "/path/to/imgs/.mermaid-cache/mermaid-a1b2c3d4e5f6.png",
      "cached": false
    }
  ]
}
```

**Mermaid**: ` ```mermaid ` blocks are rendered to PNG via headless Chrome (CDP), cached at `imgs/.mermaid-cache/mermaid-<hash>.png` (key: code, theme, scale, target width, background, mermaid version; suggest adding the dir to `.gitignore`). Needs Chrome/Chromium/Edge; if unavailable or rendering fails, falls back to `<pre class="mermaid">…</pre>` and conversion still succeeds.

## Themes

| Theme | Description |
|-------|-------------|
| `default` | Classic - traditional layout, centered title with bottom border, H2 with white text on colored background |
| `grace` | Elegant - text shadow, rounded cards, refined blockquotes (by @brzhang) |
| `simple` | Minimal - modern minimalist, asymmetric rounded corners, clean whitespace (by @okooo5km) |
| `modern` | Modern - large radius, pill-shaped titles, relaxed line height (pair with `--color red` for traditional red-gold style) |

## Supported Markdown Features

Standard GFM (headings, emphasis, lists, tables, images, links, blockquotes, inline code) plus:

| Feature | Syntax |
|---------|--------|
| Code blocks | ` ```lang ` with syntax highlighting |
| Links | `[text](url)`; add `--cite` to move ordinary external links into bottom references |
| Alerts | `> [!NOTE]`, `> [!WARNING]`, etc. |
| Footnotes | `[^1]` references |
| Ruby text | `{base|annotation}` |
| Mermaid | ` ```mermaid ` (see Output) |
| PlantUML | ` ```plantuml ` diagrams |

## Frontmatter

`title`, `author`, `description` (summary). No title → first H1/H2, else filename.

## Extension Support

Custom configuration via EXTEND.md — see Preferences.
