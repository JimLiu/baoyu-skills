---
name: baoyu-translate
description: Translates articles and documents between languages with three modes - quick (direct), normal (analyze then translate), and refined (analyze, translate, review, polish). Supports custom glossaries and terminology consistency via EXTEND.md. Use when user asks to "translate", "翻译", "精翻", "translate article", "translate to Chinese/English", "改成中文", "改成英文", "convert to Chinese", "localize", "本地化", or needs any document translation. Also triggers for "refined translation", "精细翻译", "proofread translation", "快速翻译", "快翻", "这篇文章翻译一下", or when a URL or file is provided with translation intent.
readme-blog: https://mp.weixin.qq.com/s/l32EPYG5RmeLXqG6RlXKug
how-to-work:
   源文档
   → 解析 Markdown AST
   → (按需）按 block 切 chunks
   → 全文提取术语
   → 生成共享 prompt
   → 每块交给一个 subagent 并行翻译（若可用）
   → 产出各块 draft
   → (按需）主 agent 合并
   → 主 agent 审校
   → 主 agent 修订
   → 最终 translation.md
---

# Translator

Three-mode translation skill: **quick** for direct translation, **normal** for analysis-informed translation, **refined** for full publication-quality workflow with review and polish.

## Script Directory

Scripts in `scripts/` subdirectory. `${SKILL_DIR}` = this SKILL.md's directory path. Resolve `${BUN_X}` runtime: if `bun` installed → `bun`; if `npx` available → `npx -y bun`; else suggest installing bun. Replace `${SKILL_DIR}` and `${BUN_X}` with actual values.

| Script | Purpose |
|--------|---------|
| `scripts/chunk.ts` | Split markdown into chunks by AST blocks (sections, headings, paragraphs), with line/word fallback for oversized blocks. Use `--output-dir <dir>` to write chunks into `<dir>/chunks/` instead of `<source-dir>/chunks/` |

## Preferences (EXTEND.md)

Check EXTEND.md existence (priority order):

```bash
# macOS, Linux, WSL, Git Bash
test -f .baoyu-skills/baoyu-translate/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-translate/EXTEND.md" && echo "xdg"
test -f "$HOME/.baoyu-skills/baoyu-translate/EXTEND.md" && echo "user"
```

```powershell
# PowerShell (Windows)
if (Test-Path .baoyu-skills/baoyu-translate/EXTEND.md) { "project" }
$xdg = if ($env:XDG_CONFIG_HOME) { $env:XDG_CONFIG_HOME } else { "$HOME/.config" }
if (Test-Path "$xdg/baoyu-skills/baoyu-translate/EXTEND.md") { "xdg" }
if (Test-Path "$HOME/.baoyu-skills/baoyu-translate/EXTEND.md") { "user" }
```

| Path | Location |
|------|----------|
| `.baoyu-skills/baoyu-translate/EXTEND.md` | Project directory |
| `$HOME/.baoyu-skills/baoyu-translate/EXTEND.md` | User home |

| Result | Action |
|--------|--------|
| Found | Read, parse, apply settings. On first use in session, briefly remind: "Using preferences from [path]. You can edit EXTEND.md to customize glossary, audience, etc." |
| Not found | **MUST** run first-time setup (see below) — do NOT silently use defaults |

**EXTEND.md Supports**: Default target language | Default mode | Target audience | Custom glossaries (inline or file path) | Translation style | Chunk settings

Schema: [references/config/extend-schema.md](references/config/extend-schema.md)

### First-Time Setup (BLOCKING)

**CRITICAL**: When EXTEND.md is not found, you **MUST** run the first-time setup before ANY translation. This is a **BLOCKING** operation.

Full reference: [references/config/first-time-setup.md](references/config/first-time-setup.md)

Use `AskUserQuestion` with all questions (target language, mode, audience, style, save location) in ONE call. After user answers, create EXTEND.md at the chosen location, confirm "Preferences saved to [path]", then continue.

## Defaults

All configurable values in one place. EXTEND.md overrides these; CLI flags override EXTEND.md.

| Setting | Default | EXTEND.md key | CLI flag | Description |
|---------|---------|---------------|----------|-------------|
| Target language | `zh-CN` | `target_language` | `--to` | Translation target language |
| Mode | `normal` | `default_mode` | `--mode` | Translation mode |
| Audience | `general` | `audience` | `--audience` | Target reader profile |
| Style | `storytelling` | `style` | `--style` | Translation style preference |
| Chunk threshold | `4000` | `chunk_threshold` | — | Word count to trigger chunked translation |
| Chunk max words | `5000` | `chunk_max_words` | — | Max words per chunk |

## Modes

| Mode | Flag | Steps | When to Use |
|------|------|-------|-------------|
| Quick | `--mode quick` | Translate | Short texts, informal content, quick tasks |
| Normal | `--mode normal` (default) | Analyze → Translate | Articles, blog posts, general content |
| Refined | `--mode refined` | Analyze → Translate → Review → Polish | Publication-quality, important documents |

**Default mode**: Normal (can be overridden in EXTEND.md `default_mode` setting).

**Style presets** — control the voice and tone of the translation (independent of audience):

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

Custom style descriptions are also accepted, e.g., `--style "poetic and lyrical"`.

**Auto-detection**:
- "快翻", "quick", "直接翻译" → quick mode
- "精翻", "refined", "publication quality", "proofread" → refined mode
- Otherwise → default mode (normal)

**Upgrade prompt**: After normal mode completes, display:
> Translation saved. To further review and polish, reply "继续润色" or "refine".

If user responds, continue with review → polish steps (same as refined mode Steps 4-6 in refined-workflow.md) on the existing output.

## Usage

```
/translate [--mode quick|normal|refined] [--from <lang>] [--to <lang>] [--audience <audience>] [--style <style>] [--glossary <file>] <source>
```

- `<source>`: File path, URL, or inline text
- `--from`: Source language (auto-detect if omitted)
- `--to`: Target language (from EXTEND.md or default `zh-CN`)
- `--audience`: Target reader profile (from EXTEND.md or default `general`)
- `--style`: Translation style (from EXTEND.md or default `storytelling`)
- `--glossary`: Additional glossary file to merge with EXTEND.md glossary

**Audience presets**:

| Value | Description | Effect |
|-------|-------------|--------|
| `general` | General readers (default) | Plain language, more translator's notes for jargon |
| `technical` | Developers / engineers | Less annotation on common tech terms |
| `academic` | Researchers / scholars | Formal register, precise terminology |
| `business` | Business professionals | Business-friendly tone, explain tech concepts |

Custom audience descriptions are also accepted, e.g., `--audience "AI感兴趣的普通读者"`.

## Workflow

### Step 1: Load Preferences

1.1 Check EXTEND.md (see Preferences section above)

1.2 Load built-in glossary for the language pair if available:
- EN→ZH: [references/glossary-en-zh.md](references/glossary-en-zh.md)

1.3 Merge glossaries: EXTEND.md `glossary` (inline) + EXTEND.md `glossary_files` (external files, paths relative to EXTEND.md location) + built-in glossary + `--glossary` file (CLI overrides all)

### Step 2: Materialize Source & Create Output Directory

Materialize source (file as-is, inline text/URL → save to `translate/{slug}.md`), then create output directory: `{source-dir}/{source-basename}-{target-lang}/`. Detect source language if `--from` not specified.

Full details: [references/workflow-mechanics.md](references/workflow-mechanics.md)

**Output directory contents** (all intermediate and final files go here):

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

Quick mode does not chunk — translate directly regardless of length. Before translating, estimate word count. If content exceeds chunk threshold (default 4000 words), proactively warn: "This article is ~{N} words. Quick mode translates in one pass without chunking — for long content, `--mode normal` produces better results with terminology consistency." Then proceed if user doesn't switch.

For normal and refined modes:

| Content | Action |
|---------|--------|
| < chunk threshold | Translate as single unit |
| >= chunk threshold | Chunk translation (see Step 3.1) |

**3.1 Long Content Preparation** (normal/refined modes, >= chunk threshold only)

Before translating chunks:

1. **Extract terminology**: Scan entire document for proper nouns, technical terms, recurring phrases
2. **Build session glossary**: Merge extracted terms with loaded glossaries, establish consistent translations
3. **Split into chunks**: Use `${BUN_X} ${SKILL_DIR}/scripts/chunk.ts <file> [--max-words <chunk_max_words>] [--output-dir <output-dir>]`
   - Parses markdown AST (headings, paragraphs, lists, code blocks, tables, etc.)
   - Splits at markdown block boundaries to preserve structure
   - If a single block exceeds the threshold, falls back to line splitting, then word splitting
4. **Assemble translation prompt**:
   - Main agent reads `01-analysis.md` (if exists) and assembles shared context using Part 1 of [references/subagent-prompt-template.md](references/subagent-prompt-template.md) — inlining content background, merged glossary, and comprehension challenges
   - Save as `02-prompt.md` in the output directory (shared context only, no task instructions)
5. **Draft translation via subagents** (if Agent tool available):
   - Spawn one subagent **per chunk**, all in parallel (Part 2 of the template)
   - Each subagent reads `02-prompt.md` for shared context, translates its chunk, saves to `chunks/chunk-NN-draft.md`
   - Terminology consistency is guaranteed by the shared `02-prompt.md` (glossary + comprehension challenges from analysis)
   - If no chunks (content under threshold): spawn one subagent for the entire source file
   - If Agent tool is unavailable, translate chunks sequentially inline using `02-prompt.md`
6. **Merge**: Once all subagents complete, combine translated chunks in order. If `chunks/frontmatter.md` exists, prepend it. Save as `03-draft.md` (refined) or `translation.md` (normal)
7. All intermediate files (source chunks + translated chunks) are preserved in `chunks/`

**After chunked draft is merged**, return control to main agent for critical review, revision, and polish (Step 4).

### Step 4: Translate & Refine

**Translation principles** (apply to all modes):

- **Accuracy first**: Facts, data, and logic must match the original exactly
- **Meaning over words**: Translate what the author means, not just what the words say. When a literal translation sounds unnatural or fails to convey the intended effect, restructure freely to express the same meaning in idiomatic target language
- **Figurative language**: Interpret metaphors, idioms, and figurative expressions by their intended meaning rather than translating them word-for-word. When a source-language image does not carry the same connotation in the target language, replace it with a natural expression that conveys the same idea and emotional effect
- **Emotional fidelity**: Preserve the emotional connotations of word choices, not just their dictionary meanings. Words that carry subjective feelings (e.g., "alarming", "haunting") should be rendered to evoke the same response in target-language readers
- **Natural flow**: Use idiomatic target language word order and sentence patterns; break or restructure sentences freely when the source structure doesn't work naturally in the target language
- **Terminology**: Use standard translations; annotate with original term in parentheses on first occurrence
- **Preserve format**: Keep all markdown formatting (headings, bold, italic, images, links, code blocks)
- **Image-language awareness**: Preserve image references exactly during translation, but after the translation is complete, review referenced images and check whether their likely main text language still matches the translated article language
- **Frontmatter transformation**: If the source has YAML frontmatter, preserve it in the translation with these changes: (1) Rename metadata fields that describe the *source* article — `url`→`sourceUrl`, `title`→`sourceTitle`, `description`→`sourceDescription`, `author`→`sourceAuthor`, `date`→`sourceDate`, and any similar origin-metadata fields — by adding a `source` prefix (camelCase). (2) Translate the values of text fields (title, description, etc.) and add them as new top-level fields. (3) Keep other fields (tags, categories, custom fields) as-is, translating their values where appropriate
- **Respect original**: Maintain original meaning and intent; do not add, remove, or editorialize — but sentence structure and imagery may be adapted freely to serve the meaning
- **Translator's notes**: For terms, concepts, or cultural references that target readers may not understand — due to jargon, cultural gaps, or domain-specific knowledge — add a concise explanatory note in parentheses immediately after the term. The note should explain *what it means* in plain language, not just provide the English original. Format: `译文（English original，通俗解释）`. Calibrate annotation depth to the target audience: general readers need more notes than technical readers. Only add notes where genuinely needed; do not over-annotate obvious terms.

#### Quick Mode

Translate directly → save to `translation.md`. No analysis file, but still apply all translation principles above — especially: interpret figurative language by meaning (not word-for-word), preserve emotional connotations, and restructure sentences for natural target-language flow.

#### Normal Mode

1. **Analyze** → `01-analysis.md` (domain, tone, audience, terminology, reader comprehension challenges, figurative language & metaphor mapping)
2. **Assemble prompt** → `02-prompt.md` (translation instructions with inlined context)
3. **Translate** (following `02-prompt.md`) → `translation.md`

After completion, prompt user: "Translation saved. To further review and polish, reply **继续润色** or **refine**."

If user continues, proceed with critical review → revision → polish (same as refined mode Steps 4-6 below), saving `03-draft.md` (rename current `translation.md`), `04-critique.md`, `05-revision.md`, and updated `translation.md`.

#### Refined Mode

Full workflow for publication quality. See [references/refined-workflow.md](references/refined-workflow.md) for detailed guidelines per step.

The subagent (if used in Step 3.1) only handles the initial draft. All subsequent steps (critical review, revision, polish) are handled by the main agent, which may delegate to subagents at its discretion.

Steps and saved files (all in output directory):
1. **Analyze** → `01-analysis.md` (domain, tone, terminology, reader comprehension challenges, figurative language & metaphor mapping)
2. **Assemble prompt** → `02-prompt.md` (translation instructions with inlined context)
3. **Draft** → `03-draft.md` (initial translation with translator's notes; from subagent if chunked)
4. **Critical review** → `04-critique.md` (diagnosis only: accuracy, Europeanized language, strategy execution, expression issues)
5. **Revision** → `05-revision.md` (apply all critique findings to produce revised translation)
6. **Polish** → `translation.md` (final publication-quality translation)

Each step reads the previous step's file and builds on it.

### Step 5: Output

Final translation is always at `translation.md` in the output directory.

After the final translation is written, do a lightweight image-language pass:

1. Collect image references from the translated article
2. Identify likely text-heavy images such as covers, screenshots, diagrams, charts, frameworks, and infographics
3. If any image likely contains a main text language that does not match the translated article language, proactively remind the user
4. The reminder must be a list only. Do not automatically localize those images unless the user asks

Reminder format:
```text
Possible image localization needed:
- ![[attachments/example-cover.png]]: likely still contains Chinese text while the article is now English
- ![[attachments/example-diagram.png]]: likely text-heavy framework graphic, check whether labels need translation
```

Display summary:
```
**Translation complete** ({mode} mode)

Source: {source-path}
Languages: {from} → {to}
Output dir: {output-dir}/
Final: {output-dir}/translation.md
Glossary terms applied: {count}
```

If mismatched image-language candidates were found, append a short note after the summary telling the user that some embedded images may still need image-text localization, followed by the candidate list.

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
