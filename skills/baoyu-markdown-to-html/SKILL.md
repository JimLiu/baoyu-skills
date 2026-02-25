---
name: baoyu-markdown-to-html
description: Converts Markdown to styled HTML with WeChat-compatible themes. Supports code highlighting, math, PlantUML, footnotes, alerts, and infographics. Use when user asks for "markdown to html", "convert md to html", "md转html", or needs styled HTML output from markdown.
---

# Markdown to HTML Converter

Converts Markdown files to beautifully styled HTML with inline CSS, optimized for WeChat Official Account and other platforms.

## Script Directory

**Agent Execution**: Determine this SKILL.md directory as `SKILL_DIR`, then use `${SKILL_DIR}/scripts/<name>.ts`.

| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Main entry point |

## Preferences (EXTEND.md)

Check EXTEND.md existence (project-level `.baoyu-skills/baoyu-markdown-to-html/EXTEND.md`, then user-level `$HOME/.baoyu-skills/baoyu-markdown-to-html/EXTEND.md`). If found, read and apply settings. If not found, use defaults.

**Supports**: Default theme | Custom CSS variables | Code block style

## Workflow

### Step 0: Pre-check (Chinese Content)

Only if input contains CJK characters: suggest running `baoyu-format-markdown` first to fix bold/emphasis parsing and CJK/English spacing. Use AskUserQuestion to confirm. Skip if no CJK content.

### Step 1: Determine Theme

**Theme resolution order** (first match wins):
1. User explicitly specified theme (CLI `--theme` or conversation)
2. EXTEND.md `default_theme` (this skill's own EXTEND.md)
3. `baoyu-post-to-wechat` EXTEND.md `default_theme` (cross-skill fallback via `grep -o 'default_theme:.*' "$HOME/.baoyu-skills/baoyu-post-to-wechat/EXTEND.md"`)
4. If none found → use AskUserQuestion to confirm (see Themes section below)

### Step 2: Convert

```bash
npx -y bun ${SKILL_DIR}/scripts/main.ts <markdown_file> --theme <theme>
```

### Step 3: Validate & Report Result

1. Parse JSON output from the script
2. Verify `htmlPath` exists and is non-empty: `test -s <htmlPath>`
3. If conversion failed or output is empty, report the error from JSON output
4. Display the output path. If backup was created, mention it.

## Usage

```bash
npx -y bun ${SKILL_DIR}/scripts/main.ts <markdown_file> [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--theme <name>` | Theme name (default, grace, simple) | default |
| `--title <title>` | Override title from frontmatter | |
| `--keep-title` | Keep the first heading in content | false (removed) |

**Examples:**

```bash
# Basic conversion (uses default theme, removes first heading)
npx -y bun ${SKILL_DIR}/scripts/main.ts article.md

# With specific theme
npx -y bun ${SKILL_DIR}/scripts/main.ts article.md --theme grace

# Keep the first heading in content
npx -y bun ${SKILL_DIR}/scripts/main.ts article.md --keep-title
```

## Output

**File location**: Same directory as input (e.g., `/path/to/article.md` → `/path/to/article.html`).

**Conflict handling**: Existing HTML file backed up to `article.html.bak-YYYYMMDDHHMMSS`.

**JSON output to stdout** includes: `title`, `author`, `summary`, `htmlPath`, `backupPath`, `contentImages` array.

## Themes

| Theme | Description |
|-------|-------------|
| `default` | 经典主题 - 传统排版，标题居中带底边，二级标题白字彩底 |
| `grace` | 优雅主题 - 文字阴影，圆角卡片，精致引用块 (by @brzhang) |
| `simple` | 简洁主题 - 现代极简风，不对称圆角，清爽留白 (by @okooo5km) |

## Supported Features

Standard GitHub-flavored markdown plus: alerts (`> [!NOTE]`), footnotes, ruby text (`{base|annotation}`), Mermaid diagrams, and PlantUML diagrams.

Supports YAML frontmatter (`title`, `author`, `description`). If no title is found, extracts from first H1/H2 heading or uses filename.

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
