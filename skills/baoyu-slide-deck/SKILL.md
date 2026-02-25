---
name: baoyu-slide-deck
description: Generates professional slide deck images from content with 16 visual style presets and 4 style dimensions. Creates outlines, generates individual slide images, and merges to PPTX/PDF. Use when user asks to "create slides", "make a presentation", "generate deck", "slide deck", "PPT", "make slides", or "演示文稿".
---

# Slide Deck Generator

Transform content into professional slide deck images.

## Usage

```bash
/baoyu-slide-deck path/to/content.md
/baoyu-slide-deck path/to/content.md --style sketch-notes
/baoyu-slide-deck path/to/content.md --audience executives
/baoyu-slide-deck path/to/content.md --lang zh
/baoyu-slide-deck path/to/content.md --slides 10
/baoyu-slide-deck path/to/content.md --outline-only
/baoyu-slide-deck  # Then paste content
```

## Script Directory

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.ts`

| Script | Purpose |
|--------|---------|
| `scripts/merge-to-pptx.ts` | Merge slides into PowerPoint |
| `scripts/merge-to-pdf.ts` | Merge slides into PDF |

## Options

| Option | Description |
|--------|-------------|
| `--style <name>` | Visual style: preset name, `custom`, or custom style name |
| `--audience <type>` | Target: beginners, intermediate, experts, executives, general |
| `--lang <code>` | Output language (en, zh, ja, etc.) |
| `--slides <number>` | Target slide count (8-25 recommended, max 30) |
| `--outline-only` | Generate outline only, skip image generation |
| `--prompts-only` | Generate outline + prompts, skip images |
| `--images-only` | Generate images from existing prompts directory |
| `--regenerate <N>` | Regenerate specific slide(s): `--regenerate 3` or `--regenerate 2,5,8` |

**Slide Count**: Scale by content length — short (<1K words): 5-10, medium (1-3K): 10-18, long (3-5K): 15-25, very long (>5K): 20-30 (consider splitting).

## Style System

### Presets & Auto Selection

16 presets, auto-selected by content signals (default: `blueprint`):

| Preset | Best For | Content Signals |
|--------|----------|-----------------|
| `blueprint` (Default) | Architecture, system design | architecture, system, data, technical |
| `chalkboard` | Education, tutorials | classroom, teaching, school |
| `corporate` | Investor decks, proposals | investor, quarterly, business |
| `minimal` | Executive briefings | executive, minimal, clean |
| `sketch-notes` | Educational, tutorials | tutorial, learn, guide, beginner |
| `watercolor` | Lifestyle, wellness | lifestyle, wellness, travel |
| `dark-atmospheric` | Entertainment, gaming | entertainment, music, gaming |
| `notion` | Product demos, SaaS | saas, product, dashboard |
| `bold-editorial` | Product launches, keynotes | launch, marketing, keynote |
| `editorial-infographic` | Tech explainers, research | explainer, journalism |
| `fantasy-animation` | Educational storytelling | story, fantasy, animation |
| `intuition-machine` | Technical docs, academic | briefing, academic, research |
| `pixel-art` | Gaming, developer talks | gaming, retro, pixel |
| `scientific` | Biology, chemistry, medical | biology, chemistry, medical |
| `vector-illustration` | Creative, children's content | creative, children, kids |
| `vintage` | Historical, heritage | history, heritage, vintage |

### Custom Style Dimensions

4 dimensions: **Texture** (clean/grid/organic/pixel/paper), **Mood** (professional/warm/cool/vibrant/dark/neutral), **Typography** (geometric/humanist/handwritten/editorial/technical), **Density** (minimal/balanced/dense). Full specs: `references/dimensions/*.md`

## Design Philosophy

Decks designed for **reading and sharing**, not live presentation:
- Each slide self-explanatory without verbal commentary
- Logical flow when scrolling
- All necessary context within each slide
- Optimized for social media sharing

See `references/design-guidelines.md` for:
- Audience-specific principles
- Visual hierarchy
- Content density guidelines
- Color and typography selection
- Font recommendations

See `references/layouts.md` for layout options.

## File Management

### Output Directory

```
slide-deck/{topic-slug}/
├── source-{slug}.{ext}
├── outline.md
├── prompts/
│   └── 01-slide-cover.md, 02-slide-{slug}.md, ...
├── 01-slide-cover.png, 02-slide-{slug}.png, ...
├── {topic-slug}.pptx
└── {topic-slug}.pdf
```

**Slug**: Extract topic (2-4 words, kebab-case). Example: "Introduction to Machine Learning" → `intro-machine-learning`

**Conflict Handling**: See Step 1.3 for existing content detection and user options.

## Language Handling

Language priority: `--lang` flag > EXTEND.md > conversation language > source content language. All responses use detected language; technical terms remain in English.

## Workflow

```
Input → 1. Setup (preferences + analyze + check existing) → 2. Confirm (style, audience, slides, reviews) → 3. Outline → 4. Review outline? → 5. Prompts → 6. Review prompts? → 7. Images → 8. Merge PPTX/PDF → 9. Summary
```

### Step 1: Setup & Analyze

**1.1 Load Preferences (EXTEND.md)**

Check EXTEND.md existence (project-level `.baoyu-skills/baoyu-slide-deck/EXTEND.md`, then user-level `$HOME/.baoyu-skills/baoyu-slide-deck/EXTEND.md`). If found, read and display summary (style, audience, language, review preferences). If not found, proceed with defaults or run first-time setup.

**Supports**: Preferred style | Custom dimensions | Default audience | Language preference | Review preference. Schema: `references/config/preferences-schema.md`

**1.2 Analyze Content**

1. Save source content (if pasted, save as `source.md`)
   - **Backup rule**: If `source.md` exists, rename to `source-backup-YYYYMMDD-HHMMSS.md`
2. Follow `references/analysis-framework.md` for content analysis
3. Analyze content signals for style recommendations
4. Detect source language
5. Determine recommended slide count
6. Generate topic slug from content

**1.3 Check Existing Content** ⚠️ REQUIRED

**MUST execute before proceeding to Step 2.**

Use Bash to check if output directory exists:

```bash
test -d "slide-deck/{topic-slug}" && echo "exists"
```

**If directory exists**, use AskUserQuestion:

```
header: "Existing"
question: "Existing content found. How to proceed?"
options:
  - label: "Regenerate outline"
    description: "Keep images, regenerate outline only"
  - label: "Regenerate images"
    description: "Keep outline, regenerate images only"
  - label: "Backup and regenerate"
    description: "Backup to {slug}-backup-{timestamp}, then regenerate all"
  - label: "Exit"
    description: "Cancel, keep existing content unchanged"
```

**Save to `analysis.md`** with:
- Topic, audience, content signals
- Recommended style (based on Auto Style Selection)
- Recommended slide count
- Language detection

### Step 2: Confirmation ⚠️ REQUIRED

**Two-round confirmation**: Round 1 always, Round 2 only if "Custom dimensions" selected.

**Language**: Use user's input language or saved language preference.

**Display summary**:
- Content type + topic identified
- Language: [from EXTEND.md or detected]
- **Recommended style**: [preset] (based on content signals)
- **Recommended slides**: [N] (based on content length)

#### Round 1 (Always)

Use AskUserQuestion for all 5 questions in one call:

| # | Header | Question | Options |
|---|--------|----------|---------|
| 1 | Style | Which visual style? | {recommended_preset} (Recommended), {alternative}, Custom dimensions |
| 2 | Audience | Primary reader? | General (Recommended), Beginners, Experts, Executives |
| 3 | Slides | How many slides? | {N} (Recommended), Fewer ({N-3}), More ({N+3}) |
| 4 | Outline | Review outline before prompts? | Yes (Recommended), No |
| 5 | Prompts | Review prompts before images? | Yes (Recommended), No |

#### Round 2 (Only if "Custom dimensions" selected)

Use AskUserQuestion for all 4 dimensions: Texture (clean/grid/organic/pixel), Mood (professional/warm/cool/vibrant), Typography (geometric/humanist/handwritten/editorial), Density (balanced/minimal/dense).

**After Confirmation**: Update `analysis.md`, store `skip_outline_review` and `skip_prompt_review` flags → Step 3

### Step 3: Generate Outline

Create outline using the confirmed style from Step 2.

**Style Resolution**:
- If preset selected → Read `references/styles/{preset}.md`
- If custom dimensions → Read dimension files from `references/dimensions/` and combine

**Generate**:
1. Follow `references/outline-template.md` for structure
2. Build STYLE_INSTRUCTIONS from style or dimensions
3. Apply confirmed audience, language, slide count
4. Save as `outline.md`

**After generation**:
- If `--outline-only`, stop here
- If `skip_outline_review` is true → Skip Step 4, go to Step 5
- If `skip_outline_review` is false → Continue to Step 4

### Step 4: Review Outline (Conditional)

Skip if user opted out in Step 2. Display slide summary table (number, title, type, layout), then AskUserQuestion: proceed / edit first / regenerate.

### Step 5: Generate Prompts

1. Read `references/base-prompt.md`
2. For each slide in outline:
   - Extract STYLE_INSTRUCTIONS from outline (not from style file again)
   - Add slide-specific content
   - If `Layout:` specified, include layout guidance from `references/layouts.md`
3. Save to `prompts/` directory (backup existing files before overwriting)

**After generation**:
- If `--prompts-only`, stop here and output prompt summary
- If `skip_prompt_review` is true → Skip Step 6, go to Step 7
- If `skip_prompt_review` is false → Continue to Step 6

### Step 6: Review Prompts (Conditional)

Skip if user opted out in Step 2. Display prompt list table, then AskUserQuestion: proceed / edit first / regenerate.

### Step 7: Generate Images

**Backup rule** (applies to all steps): If file exists, rename to `{name}-backup-YYYYMMDD-HHMMSS.{ext}`.

Generate images sequentially with same session ID (`slides-{topic-slug}-{timestamp}`). Report progress after each. Auto-retry once on failure.

### Step 8: Merge to PPTX and PDF

```bash
npx -y bun ${SKILL_DIR}/scripts/merge-to-pptx.ts <slide-deck-dir>
npx -y bun ${SKILL_DIR}/scripts/merge-to-pdf.ts <slide-deck-dir>
```

### Step 9: Output Summary

**Language**: Use user's input language or saved language preference.

```
Slide Deck Complete!

Topic: [topic]
Style: [preset name or custom dimensions]
Location: [directory path]
Slides: N total

- 01-slide-cover.png - Cover
- 02-slide-intro.png - Content
- ...
- {NN}-slide-back-cover.png - Back Cover

Outline: outline.md
PPTX: {topic-slug}.pptx
PDF: {topic-slug}.pdf
```

## Partial Workflows & Modification

| Option | Workflow |
|--------|----------|
| `--outline-only` | Steps 1-3 only |
| `--prompts-only` | Steps 1-5 (skip images) |
| `--images-only` | Step 7 only (requires existing `prompts/` and `outline.md`) |
| `--regenerate N` | Regenerate specific slide(s) only (e.g., `3` or `2,5,8`) |

**Slide Modification**: Always update the prompt file FIRST before regenerating. See `references/modification-guide.md` for edit/add/delete workflows.

**File Naming**: `NN-slide-[slug].png` — NN is two-digit sequence, slug is kebab-case (2-5 words). When renumbering, only NN changes, slugs remain.

## References

| File | Content |
|------|---------|
| `references/analysis-framework.md` | Content analysis for presentations |
| `references/outline-template.md` | Outline structure and format |
| `references/modification-guide.md` | Edit, add, delete slide workflows |
| `references/content-rules.md` | Content and style guidelines |
| `references/design-guidelines.md` | Audience, typography, colors, visual elements |
| `references/layouts.md` | Layout options and selection tips |
| `references/base-prompt.md` | Base prompt for image generation |
| `references/dimensions/*.md` | Dimension specifications (texture, mood, typography, density) |
| `references/dimensions/presets.md` | Preset → dimension mapping |
| `references/styles/<style>.md` | Full style specifications (legacy) |
| `references/config/preferences-schema.md` | EXTEND.md structure |

## Notes

- Image generation: 10-30 seconds per slide
- Auto-retry once on generation failure
- Use stylized alternatives for sensitive public figures
- Maintain style consistency via session ID
- **Step 2 confirmation required** - do not skip (style, audience, slides, outline review, prompt review)
- **Step 4 conditional** - only if user requested outline review in Step 2
- **Step 6 conditional** - only if user requested prompt review in Step 2

## Extension Support

Custom configurations via EXTEND.md. See **Step 1.1** for paths and supported options.
