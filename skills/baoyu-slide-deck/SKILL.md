---
name: baoyu-slide-deck
description: Generates professional slide deck images from content. Creates outlines with style instructions, then generates individual slide images. Use when user asks to "create slides", "make a presentation", "generate deck", "slide deck", or "PPT".
version: 1.117.4
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-slide-deck
    requires:
      anyBins:
        - bun
        - npx
---

# Slide Deck Generator

Decks are designed for **reading and sharing** (self-explanatory slides, logical scroll flow, social-media-friendly), not live presentation — this drives every layout and density decision.

## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete `AskUserQuestion` references below are examples — substitute the local equivalent in other runtimes.

## Image Generation Tools

Resolve the image backend in this order:

1. **User names a backend** in the current message → use it.
2. **`preferred_image_backend`** in `EXTEND.md` names a backend available now → use it. `ask` means ask every run.
3. **Auto-select** (preference `auto`, unset, or the pinned backend is unavailable), first match wins:
   - **Codex `imagegen`** skill is in your available skills → you are in Codex and MUST use it: `Skill` with `skill: "imagegen"`, passing the prompt file's content plus output path and aspect ratio. It outranks non-native skills such as `baoyu-image-gen`.
   - **Codex via `codex exec` (`codex-imagegen`)**: no native `imagegen`, but the `codex` CLI is on `PATH` with an active `codex login` → `baoyu-image-gen --provider codex-cli` (preferred), or the bundled wrapper if baoyu-image-gen is unavailable. Load [references/codex-imagegen.md](references/codex-imagegen.md) only for this branch.
   - **Cursor `GenerateImage`** → use it (outranks non-native skills). It has no aspect-ratio parameter, so state the aspect ratio / dimensions in the `description` prompt; it saves to a tool-managed location, so copy the file to the expected output path (e.g., `outputs/.../NN-xxx.png`). Reference images go in `reference_image_paths`.
   - **Other runtime-native image tool** (e.g., Hermes `image_generate`) → use it the same way.
   - Exactly one non-native backend installed (e.g., `baoyu-image-gen`) → use it.
   - Several non-native backends → ask the user once, batched with other initial questions.
4. **None available** → tell the user and ask how to proceed.

**⛔ Raster only**: never substitute SVG, HTML/CSS, canvas, or other code-based rendering for a raster image, even for diagram-like content. If no raster backend resolves, go to step 4.

**⛔ No bitmap text patching**: never use ImageMagick, Pillow, Canvas, SVG, HTML/CSS, OCR scripts, or any other overlay to cover, rewrite, erase, stroke, or replace slide titles, bullets, or any other text inside an already generated slide image. Regenerate from a corrected prompt, simplify the slide's on-image text, or ask the user which imperfect candidate to keep.

**Prompt file (hard)**: before invoking any backend, write each image's full, final prompt to its own file under `prompts/` (`NN-slide-[slug].md`) and pass that file (or its content) to the backend. It is the reproducibility record and lets you switch backends without rewriting prompts.

Change the pinned backend via `## Changing Preferences` below. Tool names above are examples; use the local equivalent in other runtimes.

## Batch Generation Policy

After every prompt file for the current generation group is saved and verified, generate slide images in batches by default:

1. Use the backend's native batch / multi-task interface if it exists. Each task keeps its own prompt file, output path, aspect ratio, session ID, and direct reference images.
2. Else, if the runtime can issue parallel tool calls, dispatch up to `generation_batch_size` slide images at a time (default `4`). An explicit request in the current message (e.g. `--batch-size 4`, "并行4张一起生成") overrides EXTEND.md.
3. Else generate sequentially.

Rules:

- Never start the first batch until all selected slide prompt files exist on disk.
- Retry failed items once without regenerating successful items.
- Do not use subagents merely to parallelize image rendering; use them only for separate prompt iteration or creative exploration.
- Merge PPTX/PDF only after all selected slide images are generated.

## Confirmation Policy

Default behavior: **confirm before generation**.

- Treat explicit skill invocation, a file path, matched signals/presets, and `EXTEND.md` defaults as **recommendation inputs only**. None of them authorizes skipping confirmation.
- Do **not** start Step 3 or later until the user completes Step 2.
- Skip confirmation only when the current request explicitly says to do so, for example: "直接生成", "不用确认", "跳过确认", "按默认出幻灯片", or equivalent wording.
- If confirmation is skipped explicitly, state the assumed style / audience / slide-count / language / backend in the next user-facing update before generating.

## Language

Respond in the user's language across questions, progress reports, error messages, and the completion summary. Keep technical tokens (style names, file paths, code) in English.

## Script Directory

`{baseDir}` = this SKILL.md's directory. Resolve `${BUN_X}`: prefer `bun`; else `npx -y bun`; else suggest `brew install oven-sh/bun/bun`.

| Script | Purpose |
|--------|---------|
| `scripts/merge-to-pptx.ts` | Merge slides into PowerPoint |
| `scripts/merge-to-pdf.ts` | Merge slides into PDF |

## Options

| Option | Description |
|--------|-------------|
| `--style <name>` | Preset (see Presets below), `custom`, or custom style name |
| `--audience <type>` | beginners / intermediate / experts / executives / general |
| `--lang <code>` | Output language (en, zh, ja, ...) |
| `--slides <N>` | Target slide count (8-25 recommended, max 30) |
| `--ref <files...>` | Reference images applied per slide (style / palette / composition / subject) |
| `--batch-size <n>` | Temporary slide image generation batch size for this run. Default: `generation_batch_size` from EXTEND.md, otherwise 4. Clamp to 1-8. |
| `--outline-only` | Stop after outline |
| `--prompts-only` | Stop after prompts (skip image generation) |
| `--images-only` | Skip to Step 7; requires existing `prompts/` |
| `--regenerate <N>` | Regenerate specific slide(s): `3` or `2,5,8` |

## Style System

Each preset combines four dimensions (texture / mood / typography / density). If the user picks "Custom dimensions" in Round 1, Round 2 asks one question per dimension (copy in `references/confirmation.md`).

### Presets (17)

| Preset | Dimensions | Best For |
|--------|------------|----------|
| `blueprint` (Default) | grid + cool + technical + balanced | Architecture, system design |
| `chalkboard` | organic + warm + handwritten + balanced | Education, tutorials |
| `corporate` | clean + professional + geometric + balanced | Investor decks, proposals |
| `minimal` | clean + neutral + geometric + minimal | Executive briefings |
| `sketch-notes` | organic + warm + handwritten + balanced | Educational, tutorials |
| `hand-drawn-edu` | organic + macaron + handwritten + balanced | Educational diagrams, process explainers |
| `watercolor` | organic + warm + humanist + minimal | Lifestyle, wellness |
| `dark-atmospheric` | clean + dark + editorial + balanced | Entertainment, gaming |
| `notion` | clean + neutral + geometric + dense | Product demos, SaaS |
| `bold-editorial` | clean + vibrant + editorial + balanced | Product launches, keynotes |
| `editorial-infographic` | clean + cool + editorial + dense | Tech explainers, research |
| `fantasy-animation` | organic + vibrant + handwritten + minimal | Educational storytelling |
| `intuition-machine` | clean + cool + technical + dense | Technical docs, academic |
| `pixel-art` | pixel + vibrant + technical + balanced | Gaming, developer talks |
| `scientific` | clean + cool + technical + dense | Biology, chemistry, medical |
| `vector-illustration` | clean + vibrant + humanist + balanced | Creative, children's content |
| `vintage` | paper + warm + editorial + balanced | Historical, heritage |

Per-preset specs: `references/styles/<preset>.md`. Preset → dimension mapping: `references/dimensions/presets.md`.

### Dimensions (when "Custom dimensions" picked)

| Dimension | Options | Purpose |
|-----------|---------|---------|
| **Texture** | clean, grid, organic, pixel, paper | Background treatment |
| **Mood** | professional, warm, cool, vibrant, dark, neutral, macaron | Color temperature |
| **Typography** | geometric, humanist, handwritten, editorial, technical | Headline/body styling |
| **Density** | minimal, balanced, dense | Information per slide |

Full per-dimension specs: `references/dimensions/*.md`.

### Auto-Selection

Pick the first row whose signal keywords appear in the source; fall back to `blueprint`.

| Signals in source | Preset |
|-------------------|--------|
| tutorial, learn, education, guide, beginner | `sketch-notes` |
| hand-drawn, infographic, diagram, process, onboarding | `hand-drawn-edu` |
| classroom, teaching, school, chalkboard | `chalkboard` |
| architecture, system, data, analysis, technical | `blueprint` |
| creative, children, kids, cute | `vector-illustration` |
| briefing, academic, research, bilingual | `intuition-machine` |
| executive, minimal, clean, simple | `minimal` |
| saas, product, dashboard, metrics | `notion` |
| investor, quarterly, business, corporate | `corporate` |
| launch, marketing, keynote, magazine | `bold-editorial` |
| entertainment, music, gaming, atmospheric | `dark-atmospheric` |
| explainer, journalism, science communication | `editorial-infographic` |
| story, fantasy, animation, magical | `fantasy-animation` |
| gaming, retro, pixel, developer | `pixel-art` |
| biology, chemistry, medical, scientific | `scientific` |
| history, heritage, vintage, expedition | `vintage` |
| lifestyle, wellness, travel, artistic | `watercolor` |

### Slide Count Heuristic

| Source length | Recommended slides |
|---------------|--------------------|
| < 1000 words | 5-10 |
| 1000-3000 words | 10-18 |
| 3000-5000 words | 15-25 |
| > 5000 words | 20-30 (consider splitting) |

## Reference Images

User-supplied images guide style, palette, layout, or subject.

**Intake** via `--ref <files...>` or file paths / pasted images in conversation:
- File path → copy to `{slide-deck-dir}/refs/NN-ref-{slug}.{ext}`
- Pasted image with no path → ask for the path, or extract style traits verbally as a text fallback

**Usage modes** (per reference):

| Usage | Effect |
|-------|--------|
| `direct` | Pass the file to the backend as a reference image for each slide |
| `style` | Extract style traits (line treatment, texture, mood) and append to every slide's prompt body |
| `palette` | Extract hex colors and append to every slide's prompt body |

Record refs in each slide's prompt frontmatter:

```yaml
references:
  - ref_id: 01
    filename: 01-ref-brand.png
    usage: direct
```

At generation time, verify files exist. If `usage: direct` and the backend accepts refs (e.g., `baoyu-image-gen --ref`), pass the file on every slide. Otherwise embed extracted `style`/`palette` traits in the prompt text.

## File Layout

```
slide-deck/{topic-slug}/
├── source-{slug}.{ext}
├── outline.md
├── prompts/NN-slide-{slug}.md
├── NN-slide-{slug}.png
├── {topic-slug}.pptx
└── {topic-slug}.pdf
```

**Slug**: 2-4 words, kebab-case, extracted from topic. "Introduction to Machine Learning" → `intro-machine-learning`.

**Backup rule** (all steps): if a file about to be written already exists, rename it to `<name>-backup-YYYYMMDD-HHMMSS.<ext>` first.

## Workflow

```
- [ ] Step 1: Setup & analyze
- [ ] Step 2: Confirmation ⚠️ REQUIRED (Round 1; Round 2 only if "Custom dimensions")
- [ ] Step 3: Generate outline
- [ ] Step 4: Review outline (conditional)
- [ ] Step 5: Generate prompts
- [ ] Step 6: Review prompts (conditional)
- [ ] Step 7: Generate images
- [ ] Step 8: Merge to PPTX/PDF
- [ ] Step 9: Output summary
```

### Step 1: Setup & Analyze

**1.1 Load EXTEND.md** — check these paths in order; first hit wins:

| Path | Scope |
|------|-------|
| `.baoyu-skills/baoyu-slide-deck/EXTEND.md` | Project |
| `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-slide-deck/EXTEND.md` | XDG |
| `$HOME/.baoyu-skills/baoyu-slide-deck/EXTEND.md` | User home |

If found, read, parse, and print a summary (style / audience / language / review / generation batch size). If not, proceed with defaults — first-time setup is not blocking for this skill. Schema: `references/config/preferences-schema.md`.

**1.2 Analyze content** — follow `references/analysis-framework.md`: classify content, detect language, note signals for style selection, estimate slide count from length (see the **Slide Count Heuristic** in Style System above), generate topic slug. Save source as `source.md` (honor backup rule if one exists).

**1.3 Check existing output** ⚠️ REQUIRED before Step 2. If `slide-deck/{topic-slug}/` exists, ask how to proceed — four options (regenerate outline / regenerate images / backup and regenerate / exit), verbatim copy in `references/confirmation.md`.

Save findings to `analysis.md`: topic, audience, signals, recommended style and slide count, language detection.

### Step 2: Confirmation ⚠️ REQUIRED

**Hard gate** per the [Confirmation Policy](#confirmation-policy): Steps 3+ wait for the user's answer here unless the current request explicitly opts out ("直接生成" or equivalent).

**Round 1 (always)** — batch five questions in one `AskUserQuestion` call: style, audience, slide count, review-outline?, review-prompts?. Verbatim options in `references/confirmation.md`.

Show before the questions: content type + topic, detected language, recommended style (from signals), recommended slide count (from length).

**Round 2 (only if "Custom dimensions" in Round 1)** — batch four questions: texture, mood, typography, density. Verbatim options in `references/confirmation.md`. The four answers replace the preset.

**After confirmation**: update `analysis.md` with final choices and store `skip_outline_review` / `skip_prompt_review` flags from Q4/Q5.

### Step 3: Generate Outline

Resolve style: preset → `references/styles/{preset}.md`; custom dimensions → combine files in `references/dimensions/`. Build `STYLE_INSTRUCTIONS` from the resolved style, apply confirmed audience + language + slide count, follow `references/outline-template.md`, and save as `outline.md`.

Stop here if `--outline-only`. Skip Step 4 if `skip_outline_review`.

### Step 4: Review Outline (Conditional)

Display a slide-by-slide table (`# | Title | Type | Layout`) along with total count and resolved style. Ask: proceed / edit outline first / regenerate — verbatim in `references/confirmation.md`.

On "Edit outline first", tell the user to edit `outline.md` and ask again when ready. On "Regenerate outline", return to Step 3.

### Step 5: Generate Prompts

For each slide in outline:
1. Read `references/base-prompt.md`
2. Extract `STYLE_INSTRUCTIONS` from the outline (don't re-read the style file)
3. Add the slide's content
4. If a `Layout:` is specified, include guidance from `references/layouts.md`
5. Save to `prompts/NN-slide-{slug}.md` (backup rule applies)

Stop here if `--prompts-only`. Skip Step 6 if `skip_prompt_review`.

### Step 6: Review Prompts (Conditional)

Display the prompts index (`# | Filename | Slide Title`) and ask: proceed / edit prompts first / regenerate — verbatim in `references/confirmation.md`. Branches mirror Step 4.

### Step 7: Generate Images

1. Resolve the image backend via the Image Generation Tools rule at the top — ask once if multiple are installed.
   - For `codex-imagegen`, follow [references/codex-imagegen.md](references/codex-imagegen.md) (n=1 per call, so slide batches dispatch one wrapper call per slide).
2. Confirm every `prompts/NN-slide-{slug}.md` exists (hard requirement).
3. Session ID: `slides-{topic-slug}-{timestamp}` — pass to the backend only if it supports sessions.
4. Build a task list for selected slides with each slide's prompt file, output PNG path, aspect ratio, session ID, and verified direct references.
5. Dispatch per `## Batch Generation Policy`. Backup rule applies to PNG files before dispatch. Report progress as `Generated X/N`. Retry only failed items once before reporting an error.

`--regenerate N` jumps to this step for the named slides only. `--images-only` starts here with existing prompts.

### Step 8: Merge

```bash
${BUN_X} {baseDir}/scripts/merge-to-pptx.ts <slide-deck-dir>
${BUN_X} {baseDir}/scripts/merge-to-pdf.ts <slide-deck-dir>
```

### Step 9: Summary

```
Slide Deck Complete!
Topic: [topic]
Style: [preset or "custom: texture+mood+typography+density"]
Location: [directory]
Slides: N

- 01-slide-cover.png
- ...
- NN-slide-back-cover.png

Outline: outline.md
PPTX: {topic-slug}.pptx
PDF: {topic-slug}.pdf
```

## Slide Modification

| Action | How |
|--------|-----|
| Edit | Update `prompts/NN-slide-{slug}.md` **first**, then `--regenerate N` |
| Add | Create new prompt at position, generate image, renumber subsequent `NN` (slugs unchanged), update `outline.md`, re-merge |
| Delete | Remove PNG + prompt, renumber subsequent, update `outline.md`, re-merge |

Always update the prompt file before regenerating the image (prompts are the source of truth). Only `NN` changes on renumber; slugs stay stable.

Text correction policy:

- If a slide's title, bullets, or any other rendered text is misspelled, garbled, hard to read, or visually weak, do not patch the bitmap with code.
- For text-correction regenerations, write a new prompt file and a new output path so the flawed candidate is preserved for comparison.
- Post-processing is limited to crop, resize, compression, or format conversion that does not alter text or the main composition.

See `references/modification-guide.md` for full details.

## Other References

- `references/design-guidelines.md` — audience, typography, color selection
- `references/content-rules.md` — content and style rules

## Notes

- For sensitive public figures, prefer stylized alternatives to avoid likeness issues.
- Maintain visual consistency via the session ID when the backend supports it.

## Changing Preferences

EXTEND.md lives at the first matching path in Step 1.1.

- **Edit directly** — full schema: `references/config/preferences-schema.md`.
- **Common one-line edits**:
  - `preferred_image_backend: auto` — default; runtime-native tool wins, falls back to the only installed backend, asks only if multiple non-native are present.
  - `preferred_image_backend: codex-imagegen` — pin to Codex's built-in.
  - `preferred_image_backend: baoyu-image-gen` — pin to the baoyu-image-gen skill.
  - `preferred_image_backend: ask` — confirm backend every run.
  - `generation_batch_size: 4` — default number of slide images to render concurrently when the backend/runtime supports batch or parallel generation.
  - `preferred_style: blueprint`, `preferred_audience: experts`, `language: zh`.
