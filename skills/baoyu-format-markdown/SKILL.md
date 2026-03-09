---
name: baoyu-format-markdown
description: Formats plain text or markdown files with frontmatter, titles, summaries, headings, bold, lists, and code blocks. Use when user asks to "format markdown", "beautify article", "add formatting", or improve article layout. Outputs to {filename}-formatted.md.
version: 1.56.1
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-format-markdown
    requires:
      anyBins:
        - bun
        - npx
---

# Markdown Formatter

Transforms plain text or markdown into well-structured, reader-friendly markdown. The goal is to help readers quickly grasp key points, highlights, and structure — without changing any original content.

**Core principle**: Only adjust formatting and fix obvious typos. Never add, delete, or rewrite content.

## Script Directory

Scripts in `scripts/` subdirectory. `{baseDir}` = this SKILL.md's directory path. Resolve `${BUN_X}` runtime: if `bun` installed → `bun`; if `npx` available → `npx -y bun`; else suggest installing bun. Replace `{baseDir}` and `${BUN_X}` with actual values.

| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Main entry point with CLI options (uses remark-cjk-friendly for CJK emphasis) |
| `scripts/quotes.ts` | Replace ASCII quotes with fullwidth quotes |
| `scripts/autocorrect.ts` | Add CJK/English spacing via autocorrect |

## Preferences (EXTEND.md)

Check EXTEND.md existence (priority order):

```bash
# macOS, Linux, WSL, Git Bash
test -f .baoyu-skills/baoyu-format-markdown/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-format-markdown/EXTEND.md" && echo "xdg"
test -f "$HOME/.baoyu-skills/baoyu-format-markdown/EXTEND.md" && echo "user"
```

```powershell
# PowerShell (Windows)
if (Test-Path .baoyu-skills/baoyu-format-markdown/EXTEND.md) { "project" }
$xdg = if ($env:XDG_CONFIG_HOME) { $env:XDG_CONFIG_HOME } else { "$HOME/.config" }
if (Test-Path "$xdg/baoyu-skills/baoyu-format-markdown/EXTEND.md") { "xdg" }
if (Test-Path "$HOME/.baoyu-skills/baoyu-format-markdown/EXTEND.md") { "user" }
```

┌──────────────────────────────────────────────────────────┬───────────────────┐
│                           Path                           │     Location      │
├──────────────────────────────────────────────────────────┼───────────────────┤
│ .baoyu-skills/baoyu-format-markdown/EXTEND.md            │ Project directory │
├──────────────────────────────────────────────────────────┼───────────────────┤
│ $HOME/.baoyu-skills/baoyu-format-markdown/EXTEND.md      │ User home         │
└──────────────────────────────────────────────────────────┴───────────────────┘

┌───────────┬───────────────────────────────────────────────────────────────────────────┐
│  Result   │                                  Action                                   │
├───────────┼───────────────────────────────────────────────────────────────────────────┤
│ Found     │ Read, parse, apply settings                                               │
├───────────┼───────────────────────────────────────────────────────────────────────────┤
│ Not found │ Use defaults                                                              │
└───────────┴───────────────────────────────────────────────────────────────────────────┘

**EXTEND.md Supports**:

| Setting | Values | Default | Description |
|---------|--------|---------|-------------|
| `auto_select` | `true`/`false` | `false` | Skip both title and summary selection, auto-pick best |
| `auto_select_title` | `true`/`false` | `false` | Skip title selection only |
| `auto_select_summary` | `true`/`false` | `false` | Skip summary selection only |
| Other | — | — | Default formatting options, typography preferences |

## Usage

The workflow has two phases: **Analyze** (understand the content) then **Format** (apply formatting). Claude performs content analysis and formatting (Steps 1-5), then runs the script for typography fixes (Step 6).

## Workflow

### Step 1: Read & Detect Content Type

Read the user-specified file, then detect content type:

| Indicator | Classification |
|-----------|----------------|
| Has `---` YAML frontmatter | Markdown |
| Has `#`, `##`, `###` headings | Markdown |
| Has `**bold**`, `*italic*`, lists, code blocks, blockquotes | Markdown |
| None of above | Plain text |

**If Markdown detected, ask user:**

```
Detected existing markdown formatting. What would you like to do?

1. Optimize formatting (Recommended)
   - Analyze content, improve headings, bold, lists for readability
   - Run typography script (spacing, emphasis fixes)
   - Output: {filename}-formatted.md

2. Keep original formatting
   - Preserve existing markdown structure
   - Run typography script only
   - Output: {filename}-formatted.md

3. Typography fixes only
   - Run typography script on original file in-place
   - No copy created, modifies original file directly
```

**Based on user choice:**
- **Optimize**: Continue to Step 2 (full workflow)
- **Keep original**: Skip to Step 5, copy file then run Step 6
- **Typography only**: Skip to Step 6, run on original file directly

### Step 2: Analyze Content (Reader's Perspective)

Read the entire content carefully. Think from a reader's perspective: what would help them quickly understand and remember the key information?

Produce an analysis covering these dimensions:

**2.1 Highlights & Key Insights**
- Core arguments or conclusions the author makes
- Surprising facts, data points, or counterintuitive claims
- Memorable quotes or well-phrased sentences (golden quotes)

**2.2 Structure Assessment**
- Does the content have a clear logical flow? What is it?
- Are there natural section boundaries that lack headings?
- Are there long walls of text that could benefit from visual breaks?

**2.3 Reader-Important Information**
- Actionable advice or takeaways
- Definitions, explanations of key concepts
- Lists or enumerations buried in prose
- Comparisons or contrasts that would be clearer as tables

**2.4 Formatting Issues**
- Missing or inconsistent heading hierarchy
- Paragraphs that mix multiple topics
- Parallel items written as prose instead of lists
- Code, commands, or technical terms not marked as code
- Obvious typos or formatting errors

**Save analysis to file**: `{original-filename}-analysis.md`

The analysis file serves as the blueprint for Step 3. Use this format:

```markdown
# Content Analysis: {filename}

## Highlights & Key Insights
- [list findings]

## Structure Assessment
- Current flow: [describe]
- Suggested sections: [list heading candidates with brief rationale]

## Reader-Important Information
- [list actionable items, key concepts, buried lists, potential tables]

## Formatting Issues
- [list specific issues with location references]

## Typos Found
- [list any obvious typos with corrections, or "None found"]
```

### Step 3: Check/Create Frontmatter, Title & Summary

Check for YAML frontmatter (`---` block). Create if missing.

| Field | Processing |
|-------|------------|
| `title` | See **Title Generation** below |
| `slug` | Infer from file path or generate from title |
| `summary` | See **Summary Generation** below |
| `coverImage` | Check if `imgs/cover.png` exists in same directory; if so, use relative path |

**Title Generation:**

Whether or not a title already exists, always run the title optimization flow (unless `auto_select_title` is set).

**Preparation** — read the full text and extract:
- Core argument (one sentence: "what is this article about?")
- Most impactful opinion or conclusion
- Reader pain point or curiosity trigger
- Most memorable metaphor or golden quote

**Generate 3-4 style-differentiated candidates:**

| Style | Characteristics | Example |
|-------|----------------|---------|
| Subversive | Deny common practice, create conflict | "All de-AI-flavor prompts are wrong" |
| Solution | Give the answer directly, promise value | "One recipe to make AI write in your voice" |
| Suspense | Reveal half, spark curiosity | "It took me six months to find how to remove AI flavor" |
| Concrete number | Use numbers for credibility | "150 lines of docs taught AI my writing style" |

Present to user:

```
Pick a title:

1. [Title A] — (recommended)
2. [Title B] — [style note]
3. [Title C] — [style note]

Enter number, or type a custom title:
```

Put the strongest hook first and mark it (recommended).

**Title principles:**
- **Hook in first 5 chars**: create information gap or cognitive conflict
- **Specific > abstract**: "150 lines" beats "a document"
- **Negation > affirmation**: "you're doing it wrong" beats "the right way"
- **Conversational**: like chatting with a friend, not a paper title
- **Max ~25 chars**: longer titles get truncated in feeds
- **Accurate, not clickbait**: the article must deliver what the title promises

**Prohibited patterns:**
- "浅谈 XX"、"关于 XX 的思考"、"XX 的探索与实践"
- "震惊！"、"万字长文"、"建议收藏"
- Pure questions without direction: "AI 写作的未来在哪里？"

If first line is H1, extract to frontmatter and remove from body. If frontmatter already has `title`, include it as context but still generate fresh candidates.

**Summary Generation:**

Generate 3 candidate summaries with different angles. Present to user:

```
Pick a summary:

1. [Summary A] — [focus note]
2. [Summary B] — [focus note]
3. [Summary C] — [focus note]

Enter number, or type a custom summary:
```

**Summary principles:**
- 80-150 characters, precise and information-rich
- Convey **core value** to the reader, not just the topic
- Vary angles: problem-driven, result-driven, insight-driven
- **Hook the reader**: make them want to read the full article
- Use concrete details (numbers, outcomes, specific methods) over vague descriptions

**Prohibited patterns:**
- "本文介绍了..."、"本文探讨了..."
- Pure topic description without value proposition
- Repeating the title in different words

If frontmatter already has `summary`, skip selection and use it.

**EXTEND.md skip behavior:** If `auto_select: true` is set in EXTEND.md, skip title and summary selection — generate the best candidate directly without asking. User can also set `auto_select_title: true` or `auto_select_summary: true` independently.

Once title is in frontmatter, body should NOT have H1 (avoid duplication).

### Step 4: Format Content

Apply formatting guided by the Step 2 analysis. The goal is making the content scannable and the key points impossible to miss.

**Formatting toolkit:**

| Element | When to use | Format |
|---------|-------------|--------|
| Headings | Natural topic boundaries, section breaks | `##`, `###` hierarchy |
| Bold | Key conclusions, important terms, core takeaways | `**bold**` |
| Unordered lists | Parallel items, feature lists, examples | `- item` |
| Ordered lists | Sequential steps, ranked items, procedures | `1. item` |
| Tables | Comparisons, structured data, option matrices | Markdown table |
| Code | Commands, file paths, technical terms, variable names | `` `inline` `` or fenced blocks |
| Blockquotes | Notable quotes, important warnings, cited text | `> quote` |
| Separators | Major topic transitions | `---` |

**Formatting principles — what NOT to do:**
- Do NOT add sentences, explanations, or commentary
- Do NOT delete or shorten any content
- Do NOT rephrase or rewrite the author's words
- Do NOT add headings that editorialize (e.g., "Amazing Discovery" — use neutral descriptive headings)
- Do NOT over-format: not every sentence needs bold, not every paragraph needs a heading

**Formatting principles — what TO do:**
- Preserve the author's voice, tone, and every word
- **Bold key conclusions and core takeaways** — the sentences a reader would highlight
- Extract parallel items from prose into lists only when the structure is clearly there
- Add headings where the topic genuinely shifts — prefer vivid, specific headings over generic ones (e.g., "3 天搞定 vs 传统方案" over "方案对比")
- Use tables for comparisons or structured data buried in prose
- Use blockquotes for golden quotes, memorable statements, or important warnings
- Fix obvious typos (based on Step 2 findings)

### Step 5: Save Formatted File

Save as `{original-filename}-formatted.md`

**Backup existing file:**

```bash
if [ -f "{filename}-formatted.md" ]; then
  mv "{filename}-formatted.md" "{filename}-formatted.backup-$(date +%Y%m%d-%H%M%S).md"
fi
```

### Step 6: Execute Typography Script

Run the formatting script on the output file:

```bash
${BUN_X} {baseDir}/scripts/main.ts {output-file-path} [options]
```

**Script Options:**

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--quotes` | `-q` | Replace ASCII quotes with fullwidth quotes `"..."` | false |
| `--no-quotes` | | Do not replace quotes | |
| `--spacing` | `-s` | Add CJK/English spacing via autocorrect | true |
| `--no-spacing` | | Do not add CJK/English spacing | |
| `--emphasis` | `-e` | Fix CJK emphasis punctuation issues | true |
| `--no-emphasis` | | Do not fix CJK emphasis issues | |

**Examples:**

```bash
# Default: spacing + emphasis enabled, quotes disabled
${BUN_X} {baseDir}/scripts/main.ts article.md

# Enable all features including quote replacement
${BUN_X} {baseDir}/scripts/main.ts article.md --quotes

# Only fix emphasis issues, skip spacing
${BUN_X} {baseDir}/scripts/main.ts article.md --no-spacing
```

**Script performs (based on options):**
1. Fix CJK emphasis/bold punctuation issues (default: enabled)
2. Add CJK/English mixed text spacing via autocorrect (default: enabled)
3. Replace ASCII quotes with fullwidth quotes (default: disabled)
4. Format frontmatter YAML (always enabled)

### Step 7: Completion Report

Display a report summarizing all changes made:

```
**Formatting Complete**

**Files:**
- Analysis: {filename}-analysis.md
- Formatted: {filename}-formatted.md

**Content Analysis Summary:**
- Highlights found: X key insights
- Golden quotes: X memorable sentences
- Formatting issues fixed: X items

**Changes Applied:**
- Frontmatter: [added/updated] (title, slug, summary)
- Headings added: X (##: N, ###: N)
- Bold markers added: X
- Lists created: X (from prose → list conversion)
- Tables created: X
- Code markers added: X
- Blockquotes added: X
- Typos fixed: X [list each: "original" → "corrected"]

**Typography Script:**
- CJK spacing: [applied/skipped]
- Emphasis fixes: [applied/skipped]
- Quote replacement: [applied/skipped]
```

Adjust the report to reflect actual changes — omit categories where no changes were made.

## Notes

- Preserve original writing style and tone
- Specify correct language for code blocks (e.g., `python`, `javascript`)
- Maintain CJK/English spacing standards
- The analysis file is a working document — it helps maintain consistency between what was identified and what was formatted

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
