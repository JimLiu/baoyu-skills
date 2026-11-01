---
name: baoyu-translate
description: >-
  This skill should be used when the user asks to "translate", "翻译", "精翻", "translate article",
  "translate to Chinese", "translate to English", "改成中文", "改成英文", "convert to Chinese",
  "localize", "本地化", "refined translation", "精细翻译", "proofread translation", "快速翻译", "快翻",
  "这篇文章翻译一下", or provides a URL/file with translation intent. Supports three modes
  (quick/normal/refined) with custom glossary support.
version: 1.117.3
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-translate
    requires:
      anyBins:
        - bun
        - npx
---

# Translator

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
| `scripts/main.ts` | CLI entry point. Default action splits markdown into chunks; also supports explicit `chunk` subcommand |
| `scripts/chunk.ts` | Markdown chunking implementation used by `main.ts` and kept compatible for direct invocation |

## Preferences (EXTEND.md)

First one found wins:

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-translate/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-translate/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-translate/EXTEND.md` | User home |

- **Found** → read and apply. On first use in a session, remind briefly: "Using preferences from [path]. You can edit EXTEND.md to customize glossary, audience, etc."
- **Not found** → **BLOCKING** first-time setup before any translation; never silently use defaults. Ask all questions in [references/config/first-time-setup.md](references/config/first-time-setup.md) (target language, mode, audience, style, save location) in ONE call, write EXTEND.md at the chosen location, confirm "Preferences saved to [path]", then continue.

Supports: target language, mode, audience, glossaries (inline or file path), style, chunk settings. Schema: [references/config/extend-schema.md](references/config/extend-schema.md).

## Defaults

EXTEND.md overrides defaults; CLI flags override EXTEND.md.

| Setting | Default | EXTEND.md key | CLI flag |
|---------|---------|---------------|----------|
| Target language | `zh-CN` | `target_language` | `--to` |
| Mode | `normal` | `default_mode` | `--mode` |
| Audience | `general` | `audience` | `--audience` |
| Style | `storytelling` | `style` | `--style` |
| Chunk threshold (words, triggers chunking) | `4000` | `chunk_threshold` | — |
| Chunk max words | `5000` | `chunk_max_words` | — |

## Modes

| Mode | Flag | Steps | When to Use |
|------|------|-------|-------------|
| Quick | `--mode quick` | Translate | Short texts, informal content, quick tasks |
| Normal | `--mode normal` (default) | Analyze → Translate | Articles, blog posts, general content |
| Refined | `--mode refined` | Analyze → Translate → Review → Polish | Publication-quality, important documents |

Auto-detection: "快翻", "quick", "直接翻译" → quick; "精翻", "refined", "publication quality", "proofread" → refined; otherwise the default mode.

**Style presets** (voice and tone, independent of audience; custom descriptions accepted, e.g. `--style "poetic and lyrical"`):

| Value | Description | Effect |
|-------|-------------|--------|
| `storytelling` | Engaging narrative flow (default) | Draws readers in, smooth transitions, vivid phrasing |
| `formal` | Professional, structured | Neutral tone, clear organization, no colloquialisms |
| `technical` | Precise, documentation-style | Concise, terminology-heavy, minimal embellishment |
| `literal` | Close to original structure | Minimal restructuring, preserves source sentence patterns |
| `academic` | Scholarly, rigorous | Formal register, complex clauses OK, citation-aware |
| `business` | Concise, results-focused | Action-oriented, executive-friendly, bullet-point mindset |
| `humorous` | Preserves and adapts humor | Witty, playful, recreates comedic effect in target language |
| `conversational` | Casual, spoken-like | Friendly, approachable, as if explaining to a friend |
| `elegant` | Literary, polished prose | Aesthetically refined, rhythmic, carefully crafted word choices |

**Audience presets** (custom descriptions accepted, e.g. `--audience "AI感兴趣的普通读者"`):

| Value | Description | Effect |
|-------|-------------|--------|
| `general` | General readers (default) | Plain language, more translator's notes for jargon |
| `technical` | Developers / engineers | Less annotation on common tech terms |
| `academic` | Researchers / scholars | Formal register, precise terminology |
| `business` | Business professionals | Business-friendly tone, explain tech concepts |

## Workflow

### Step 1: Load Preferences

1. Check EXTEND.md (see Preferences)
2. Load the built-in glossary for the language pair if available — EN→ZH: [references/glossary-en-zh.md](references/glossary-en-zh.md)
3. Merge glossaries: EXTEND.md `glossary` (inline) + `glossary_files` (paths relative to EXTEND.md) + built-in + `--glossary` file (CLI overrides all)

### Step 2: Materialize Source & Create Output Directory

Materialize the source (file as-is; inline text/URL → `translate/{slug}.md`), then create `{source-dir}/{source-basename}-{target-lang}/`. Detect source language if `--from` is not given. Details and conflict handling: [references/workflow-mechanics.md](references/workflow-mechanics.md).

All intermediate and final files go in the output directory:

| File | Mode | Description |
|------|------|-------------|
| `translation.md` | All | Final translation (always this name) |
| `01-analysis.md` | Normal, Refined | Content analysis (domain, tone, terminology) |
| `02-prompt.md` | Normal, Refined | Assembled translation prompt |
| `03-draft.md` | Refined | Initial draft before review |
| `04-critique.md` | Refined | Critical review findings (diagnosis only) |
| `05-revision.md` | Refined | Revised translation based on critique |
| `chunks/` | Chunked | Source chunks + translated chunks |

### Step 3: Assess Content Length

**Quick mode never chunks.** If content exceeds the chunk threshold, warn: "This article is ~{N} words. Quick mode translates in one pass without chunking — for long content, `--mode normal` produces better results with terminology consistency." Proceed if the user doesn't switch.

Normal/refined: below threshold → translate as a single unit; at or above → chunked translation (3.1).

**3.1 Long Content Preparation** (normal/refined, ≥ threshold)

1. **Extract terminology** across the whole document (proper nouns, technical terms, recurring phrases)
2. **Build session glossary**: merge extracted terms with loaded glossaries, fix consistent translations
3. **Split**: `${BUN_X} {baseDir}/scripts/main.ts <file> [--max-words <chunk_max_words>] [--output-dir <output-dir>]` — splits at markdown block boundaries (headings, paragraphs, lists, code blocks, tables, etc.); an oversized single block falls back to line, then word splitting
4. **Assemble prompt**: read `01-analysis.md` (if it exists) and build shared context with Part 1 of [references/subagent-prompt-template.md](references/subagent-prompt-template.md), inlining target style, content background, merged glossary, and translation challenges. Save as `02-prompt.md` (shared context only, no task instructions)
5. **Draft via subagents** (if an Agent tool is available):
   - One subagent **per chunk**, all in parallel (Part 2 of the template). Each reads `02-prompt.md`, gets its position (chunk N of M + brief context of where it sits in the argument), and saves `chunks/chunk-NN-draft.md`
   - Consistency comes from the shared `02-prompt.md` (glossary, figurative language mapping, comprehension challenges, source voice, translation challenges)
   - No chunks (under threshold): one subagent for the whole source file
   - No Agent tool: translate chunks sequentially inline using `02-prompt.md`
6. **Merge** chunks in order after all subagents finish; prepend `chunks/frontmatter.md` if it exists. Save as `03-draft.md` (refined) or `translation.md` (normal)
7. Keep all intermediate files in `chunks/`

After merging, the main agent takes over for review, revision, and polish (Step 4).

### Step 4: Translate & Refine

**Translation principles** (all modes):

- **Rewrite, not translate**: write natural, engaging target language as if a skilled native writer composed it. Test: "Does this read like it was originally written in the target language?"
- **Accuracy first**: facts, data, and logic match the original exactly
- **Natural flow**: idiomatic target word order; break long source sentences into shorter ones; render metaphors and idioms by intended meaning, not word-for-word
- **Terminology**: standard translations, used consistently; annotate specialized terms with the original in parentheses on first occurrence
- **Preserve format**: all markdown formatting (headings, bold, italic, images, links, code blocks)
- **Proactive interpretation**: for jargon or concepts the audience may lack context for, add concise explanations in **bold parentheses** `（**解释**）` — few, only where genuinely needed
- **Frontmatter** (if the source has YAML frontmatter): rename source-metadata fields with a `source` prefix (camelCase: `url`→`sourceUrl`, `title`→`sourceTitle`, etc.), add translated values as new top-level fields (skip `title` if the body has an H1), keep other fields as-is

**Quick**: translate directly → `translation.md`.

**Normal**:
1. Analyze → `01-analysis.md` (domain, tone, terminology, translation challenges)
2. Assemble prompt → `02-prompt.md` (instructions with context, glossary, challenges)
3. Translate following `02-prompt.md` → `translation.md`

Then tell the user: "Translation saved. To further review and polish, reply **继续润色** or **refine**." If they do, run refined Steps 4-6 on the existing output: rename current `translation.md` to `03-draft.md`, then write `04-critique.md`, `05-revision.md`, and an updated `translation.md`.

**Refined** — per-step guidelines in [references/refined-workflow.md](references/refined-workflow.md). Each step reads the previous step's file:
1. Analyze → `01-analysis.md`
2. Assemble prompt → `02-prompt.md` (instructions with inlined context)
3. Draft → `03-draft.md` (with translator's notes; from subagents if chunked)
4. Critical review → `04-critique.md` (diagnosis only: accuracy, Europeanized language, strategy execution, expression issues)
5. Revision → `05-revision.md` (apply all critique findings)
6. Polish → `translation.md` (publication quality)

Subagents (Step 3.1) only produce the initial draft. Review, revision, and polish belong to the main agent, which may delegate to subagents at its discretion.

### Step 5: Output

Final translation is always `translation.md` in the output directory.

Then run a lightweight image-language pass: collect image references, identify likely text-heavy ones (covers, screenshots, diagrams, charts, frameworks, infographics), and list any whose main text language likely differs from the translated article. List only — do not localize images unless the user asks. Use the article's own image syntax (markdown or wikilink):

```text
Possible image localization needed:
- ![example cover](attachments/example-cover.png): likely still contains source-language text while the article is now in target language
- ![example diagram](attachments/example-diagram.png): likely text-heavy framework graphic, check whether labels need translation
```

Summary:
```
**Translation complete** ({mode} mode)

Source: {source-path}
Languages: {from} → {to}
Output dir: {output-dir}/
Final: {output-dir}/translation.md
Glossary terms applied: {count}
```

If candidates were found, append after the summary a short note that some embedded images may still need image-text localization, followed by the list.

## Extension Support

Custom configurations via EXTEND.md — see **Preferences** above.
