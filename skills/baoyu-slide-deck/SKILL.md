---
name: baoyu-slide-deck
description: Generates professional slide deck images from content. Creates outlines with style instructions, then generates individual slide images. Use when user asks to "create slides", "make a presentation", "generate deck", "slide deck", or "PPT".
version: 1.56.1
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-slide-deck
    requires:
      anyBins:
        - bun
        - npx
---

# Slide Deck Generator

Transform content into professional slide deck images. The deck is designed for **reading and sharing** (self-explanatory slides, logical scroll flow, social-media-friendly) rather than live presentation — that assumption drives every layout and density decision below.

## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete `AskUserQuestion` references below are examples — substitute the local equivalent in other runtimes.

## Image Generation Tools

When this skill needs to render an image:

- **Use whatever image-generation tool or skill is available** in the current runtime — e.g., Codex `imagegen`, Hermes `image_generate`, `baoyu-imagine`, or any equivalent the user has installed.
- **If multiple are available**, ask the user **once** at the start which to use (batch with any other initial questions).
- **If none are available**, tell the user and ask how to proceed.

**Prompt file requirement (hard)**: write each image's full, final prompt to a standalone file under `prompts/` (naming: `NN-slide-[slug].md`) BEFORE invoking any backend. The file is the reproducibility record and lets you switch backends without regenerating prompts.

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
| `--outline-only` | Stop after outline |
| `--prompts-only` | Stop after prompts (skip image generation) |
| `--images-only` | Skip to Step 7; requires existing `prompts/` |
| `--regenerate <N>` | Regenerate specific slide(s): `3` or `2,5,8` |

## Style System

17 presets covering technical / educational / lifestyle / editorial use cases. Every preset is a combination of four dimensions (texture / mood / typography / density). If the user picks "Custom dimensions" in Round 1, Round 2 of the confirmation asks one question per dimension — options and verbatim copy live in `references/confirmation.md`.

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

Match content signals to a preset. Pick the first row whose signal keywords appear in the source; fall back to `blueprint` if nothing matches.

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

Users may supply reference images to guide style, palette, layout, or subject.

**Intake**: Accept via `--ref <files...>` or when the user provides file paths / pastes images in conversation.
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

At generation time, verify files exist. If `usage: direct` and the backend accepts refs (e.g., `baoyu-imagine --ref`), pass the file on every slide. Otherwise embed extracted `style`/`palette` traits in the prompt text.

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

**Backup rule** (applies across steps): if a file about to be written already exists, rename it to `<name>-backup-YYYYMMDD-HHMMSS.<ext>` before writing the new one. This protects user edits and enables rollback.

## Workflow

Copy this checklist and check off items as you complete them:

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

If found, read, parse, and print a summary (style / audience / language / review). If not, proceed with defaults — first-time setup is not blocking for this skill. Schema: `references/config/preferences-schema.md`.

**1.2 Analyze content** — follow `references/analysis-framework.md`: classify content, detect language, note signals for style selection, estimate slide count from length (see the **Slide Count Heuristic** in Style System above), generate topic slug. Save source as `source.md` (honor backup rule if one exists).

**1.3 Check existing output** ⚠️ REQUIRED before Step 2. If `slide-deck/{topic-slug}/` exists, ask how to proceed — four options (regenerate outline / regenerate images / backup and regenerate / exit), verbatim copy in `references/confirmation.md`.

Save findings to `analysis.md`: topic, audience, signals, recommended style and slide count, language detection.

### Step 2: Confirmation ⚠️ REQUIRED

**Round 1 (always)** — batch five questions in one `AskUserQuestion` call: style, audience, slide count, review-outline?, review-prompts?. Verbatim options in `references/confirmation.md`.

Summary displayed before the questions:
- Content type + topic
- Detected language
- Recommended style (based on signals)
- Recommended slide count (based on length)

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
2. Confirm every `prompts/NN-slide-{slug}.md` exists (hard requirement; prompt files are the reproducibility record regardless of backend).
3. Session ID: `slides-{topic-slug}-{timestamp}` — pass to the backend only if it supports sessions.
4. For each slide: generate sequentially, reusing the session ID. Backup rule applies to PNG files. Report progress as `Generated X/N`. Auto-retry once on failure before reporting an error.

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

Always update the prompt file before regenerating the image — this keeps the prompts directory as the source of truth and makes changes reproducible. Only `NN` changes on renumber; slugs stay stable so references remain valid.

See `references/modification-guide.md` for full details.

## References

| File | Content |
|------|---------|
| `references/confirmation.md` | Verbatim AskUserQuestion option copy for every confirmation |
| `references/analysis-framework.md` | Content analysis framework |
| `references/outline-template.md` | Outline structure |
| `references/base-prompt.md` | Base prompt body for image generation |
| `references/layouts.md` | Layout options |
| `references/design-guidelines.md` | Audience, typography, color selection |
| `references/content-rules.md` | Content guidelines |
| `references/modification-guide.md` | Edit/add/delete workflows |
| `references/styles/<preset>.md` | Per-preset specifications |
| `references/dimensions/*.md` | Per-dimension specifications |
| `references/config/preferences-schema.md` | EXTEND.md schema |

## Notes

- Image generation takes ~10-30s per slide; report progress between them.
- For sensitive public figures, prefer stylized alternatives to avoid likeness issues.
- Maintain visual consistency via the session ID when the backend supports it.

Custom configurations via EXTEND.md. See Step 1.1 for paths and schema.
