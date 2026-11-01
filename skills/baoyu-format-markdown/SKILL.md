---
name: baoyu-format-markdown
description: Formats plain text or markdown files with frontmatter, titles, summaries, headings, bold, lists, and code blocks. Use when user asks to "format markdown", "beautify article", "add formatting", or improve article layout. Outputs to {filename}-formatted.md.
version: 1.57.0
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-format-markdown
    requires:
      anyBins:
        - bun
        - npx
---

# Markdown Formatter

Make plain text or markdown scannable so readers grasp key points and structure fast.

**Core principle**: Only adjust formatting and fix obvious typos. Never add, delete, or rewrite content.

## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete `AskUserQuestion` references below are examples — substitute the local equivalent in other runtimes.

## Script Directory

`{baseDir}` = this SKILL.md's directory. `${BUN_X}` = `bun` if installed; else `npx -y bun` if `npx` available; else suggest installing bun. Replace `{baseDir}` and `${BUN_X}` with actual values.

| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Main entry point with CLI options (uses remark-cjk-friendly for CJK emphasis) |
| `scripts/quotes.ts` | Replace ASCII quotes with fullwidth quotes |
| `scripts/autocorrect.ts` | Add CJK/English spacing via autocorrect |

## Preferences (EXTEND.md)

First one found wins:

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-format-markdown/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-format-markdown/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-format-markdown/EXTEND.md` | User home |

None found → use defaults (no first-time setup for this skill).

| Setting | Values | Default | Description |
|---------|--------|---------|-------------|
| `auto_select` | `true`/`false` | `false` | Skip both title and summary selection, auto-pick best |
| `auto_select_title` | `true`/`false` | `false` | Skip title selection only |
| `auto_select_summary` | `true`/`false` | `false` | Skip summary selection only |
| Other | — | — | Default formatting options, typography preferences |

## Workflow

The agent analyzes and formats (Steps 1-5), then runs the typography script (Step 6).

### Step 1: Read & Detect Content Type

Read the file. It is **Markdown** if it has `---` YAML frontmatter, `#`/`##`/`###` headings, or `**bold**`/`*italic*`/lists/code blocks/blockquotes; otherwise **plain text**.

If Markdown, ask:

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

- **Optimize** → Step 2 (full workflow)
- **Keep original** → skip to Step 5 (copy file), then Step 6
- **Typography only** → skip to Step 6 on the original file

### Step 2: Analyze Content (Reader's Perspective)

Read the whole text and ask what would help a reader quickly understand and remember it. Save `{original-filename}-analysis.md` — the blueprint for Step 4:

```markdown
# Content Analysis: {filename}

## Highlights & Key Insights
- [core arguments/conclusions, surprising facts or data, counterintuitive claims, golden quotes]

## Structure Assessment
- Current flow: [describe]
- Suggested sections: [heading candidates with brief rationale; unheaded section boundaries; walls of text needing breaks]

## Reader-Important Information
- [actionable takeaways, key definitions, lists buried in prose, comparisons that should be tables]

## Formatting Issues
- [specific issues with location: heading hierarchy, mixed-topic paragraphs, parallel items as prose, unmarked code/commands/terms]

## Typos Found
- [obvious typos with corrections, or "None found"]
```

### Step 3: Check/Create Frontmatter, Title & Summary

Create a YAML frontmatter block if missing.

| Field | Processing |
|-------|------------|
| `title` | See **Title Generation** |
| `slug` | Infer from file path or generate from title |
| `summary` | One-sentence summary (see **Summary Generation**) |
| `description` | Longer descriptive summary (see **Summary Generation**) |
| `coverImage` | If `imgs/cover.png` exists in the same directory, use its relative path |

#### Title Generation

Run this flow even if a title exists, unless `auto_select_title` is set.

1. Extract: core argument (one sentence), most impactful opinion/conclusion, reader pain point or curiosity trigger, most memorable metaphor or golden quote
2. Using [references/title-formulas.md](references/title-formulas.md): pick the **2-3 best-matching hook formulas** ("When to pick each formula"), plus **1-2 straightforward titles** (descriptive or declarative, no formula). If the user gave a direction (e.g., "make it suspenseful"), prioritize it. Total **4-5 candidates**, obeying the reference's principles and prohibited patterns
3. Ask, strongest hook first and marked `(recommended)`:

```
Pick a title:

1. [Hook title A] — (recommended) [formula name]
2. [Hook title B] — [formula name]
3. [Hook title C] — [formula name]
4. [Straightforward title D] — straightforward
5. [Straightforward title E] — straightforward

Enter number, or type a custom title:
```

- First line is an H1 → move it to frontmatter and remove it from the body. An existing frontmatter `title` is context only; still generate fresh candidates.
- `auto_select: true` or `auto_select_title: true` → skip the prompt, use the top candidate.
- Once the title is in frontmatter, the body must NOT contain an H1.

#### Summary Generation

Generate both directly (no user selection):

| Field | Length | Purpose |
|-------|--------|---------|
| `summary` | 1 sentence, ~50-80 chars | Concise hook — feeds, social sharing, SEO meta |
| `description` | 2-3 sentences, ~100-200 chars | Richer context — article previews, newsletter blurbs |

- Convey **core value** to the reader, not just the topic; prefer concrete details (numbers, outcomes, specific methods)
- `summary` punchy and self-contained; `description` may add supporting details
- Keep an existing `summary`/`description`; only generate the missing one
- Prohibited: "This article introduces...", "This article explores..."; pure topic description without value; restating the title

### Step 4: Format Content

Guided by the Step 2 analysis, make content scannable and key points impossible to miss, using headings (`##`/`###`), bold, ordered/unordered lists, tables, inline/fenced code (commands, paths, technical terms), blockquotes, and `---` for major transitions.

**Don't:**
- Add sentences, explanations, or commentary
- Delete or shorten any content
- Rephrase or rewrite the author's words
- Add editorializing headings (e.g., "Amazing Discovery" — use neutral descriptive ones)
- Over-format: not every sentence needs bold, not every paragraph a heading

**Do:**
- Preserve the author's voice, tone, and every word
- **Bold key conclusions and core takeaways** — what a reader would highlight
- Turn prose into lists only when the parallel structure is clearly there
- Add headings where the topic genuinely shifts — vivid and specific over generic (e.g., "3 天搞定 vs 传统方案" over "方案对比")
- Tables for comparisons or structured data buried in prose
- Blockquotes for golden quotes, memorable statements, or important warnings
- Fix obvious typos (from Step 2)
- Specify the language on code blocks (e.g., `python`, `javascript`)
- Maintain CJK/English spacing standards

### Step 5: Save Formatted File

Save as `{original-filename}-formatted.md`, backing up any existing one:

```bash
if [ -f "{filename}-formatted.md" ]; then
  mv "{filename}-formatted.md" "{filename}-formatted.backup-$(date +%Y%m%d-%H%M%S).md"
fi
```

### Step 6: Execute Typography Script

```bash
${BUN_X} {baseDir}/scripts/main.ts {output-file-path} [options]
```

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--quotes` | `-q` | Replace ASCII quotes with fullwidth quotes `"..."` | false |
| `--no-quotes` | | Do not replace quotes | |
| `--spacing` | `-s` | Add CJK/English spacing via autocorrect | true |
| `--no-spacing` | | Do not add CJK/English spacing | |
| `--emphasis` | `-e` | Fix CJK emphasis punctuation issues | true |
| `--no-emphasis` | | Do not fix CJK emphasis issues | |

Frontmatter YAML is always formatted. Examples: `main.ts article.md` (defaults), `--quotes` (add quote replacement), `--no-spacing` (emphasis only).

### Step 7: Completion Report

Report actual changes; omit categories with none:

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

## Extension Support

Custom configurations via EXTEND.md — see **Preferences** above.
