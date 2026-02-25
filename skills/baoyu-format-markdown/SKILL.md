---
name: baoyu-format-markdown
description: Formats plain text or markdown files with frontmatter, titles, summaries, headings, bold, lists, and code blocks. Use when user asks to "format markdown", "beautify article", "add formatting", or improve article layout. Outputs to {filename}-formatted.md.
---

# Markdown Formatter

Transforms plain text or markdown files into well-structured markdown with proper frontmatter, formatting, and typography.

## Script Directory

Scripts in `scripts/` subdirectory. Replace `${SKILL_DIR}` with this SKILL.md's directory path.

| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Main entry point with CLI options (uses remark-cjk-friendly for CJK emphasis) |
| `scripts/quotes.ts` | Replace ASCII quotes with fullwidth quotes |
| `scripts/autocorrect.ts` | Add CJK/English spacing via autocorrect |

## Preferences (EXTEND.md)

Check EXTEND.md existence (project-level `.baoyu-skills/baoyu-format-markdown/EXTEND.md`, then user-level `$HOME/.baoyu-skills/baoyu-format-markdown/EXTEND.md`). If found, read and apply settings. If not found, use defaults.

**Supports**: Default formatting options | Summary length preferences

## Usage

Claude performs content analysis and formatting (Steps 1-6), then runs the script for typography fixes (Step 7).

## Workflow

### Step 1: Read Source File

Read the user-specified markdown or plain text file.

### Step 1.5: Detect Content Type & Confirm

Detect if input is plain text (no markdown syntax) or markdown (has frontmatter, headings, bold, lists, code blocks, or blockquotes).

- **Plain text** → Proceed to Step 2 (full formatting)
- **Markdown detected** → Use AskUserQuestion with 3 options:
  1. **Optimize formatting** (Recommended): Full workflow Steps 2-8
  2. **Keep original formatting**: Skip Steps 2-5, copy file → Steps 6-8
  3. **Typography fixes only**: Skip Steps 2-6, run Step 7 on original file directly

### Step 2: Analyze Content Structure

Identify: existing title (H1), paragraph separations, keywords suitable for **bold**, parallel content convertible to lists, code snippets, and quotations.

### Step 3: Check/Create Frontmatter

Check for YAML frontmatter (`---` block). Create if missing.

| Field | Processing |
|-------|------------|
| `title` | See Step 4 |
| `slug` | Infer from file path or generate from title |
| `summary` | Generate engaging summary (100-150 characters) |
| `coverImage` | Check if `imgs/cover.png` exists in same directory (also accepted: `featureImage`) |

### Step 4: Title Handling

1. If frontmatter already has `title` → use it, no H1 in body
2. If first line is H1 → extract to frontmatter `title`, remove H1 from body
3. If neither exists → generate 3 candidate titles, use AskUserQuestion to let user choose

**Title principles**: Concise (max 20 chars), captures core message, engaging, accurate. Once title is in frontmatter, body should NOT have H1.

### Step 5: Format Processing

Apply formatting: heading hierarchy (`#`, `##`, `###`), **bold** for key points, lists for parallel items, code blocks/inline code, blockquotes, and `---` separators.

**Principles**: Preserve original content, add formatting only, serve readability, avoid over-formatting.

### Step 6: Save Formatted File

Save as `{original-filename}-formatted.md`. If file exists, backup to `{filename}-formatted.backup-YYYYMMDD-HHMMSS.md` first.

If user chose "Keep original formatting", copy original to `{filename}-formatted.md` without modifications.

### Step 7: Execute Text Formatting Script

After saving, **must** run the formatting script:

```bash
npx -y bun ${SKILL_DIR}/scripts/main.ts {output-file-path} [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--quotes` / `-q` | Replace ASCII quotes with fullwidth quotes | false |
| `--spacing` / `-s` | Add CJK/English spacing via autocorrect | true |
| `--emphasis` / `-e` | Fix CJK emphasis punctuation issues | true |

Use `--no-quotes`, `--no-spacing`, `--no-emphasis` to disable individual features.

### Step 8: Display Results

```
**Formatting complete**

File: posts/2026/01/09/example/final-formatted.md

Changes:
- Added title: [title content]
- Added X bold markers
- Added X lists
- Added X code blocks
```

## Formatting Example

**Before:**
```
This is plain text. First point is efficiency improvement. Second point is cost reduction. Third point is experience optimization. Use npm install to install dependencies.
```

**After:**
```markdown
---
title: Three Core Advantages
slug: three-core-advantages
summary: Discover the three key benefits that drive success in modern projects.
---

This is plain text.

**Main advantages:**
- Efficiency improvement
- Cost reduction
- Experience optimization

Use `npm install` to install dependencies.
```

## Notes

- Preserve original writing style and tone
- Specify correct language for code blocks (e.g., `python`, `javascript`)
- Maintain CJK/English spacing standards
- Do not add content not present in original

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
