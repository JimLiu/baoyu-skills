---
name: baoyu-infographic
description: Generate professional infographics with 21 layout types and 22 visual styles. Analyzes content, recommends layout×style combinations, and generates publication-ready infographics. Use when user asks to create "infographic", "信息图", "visual summary", "可视化", or "高密度信息大图".
version: 1.117.4
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-infographic
---

# Infographic Generator

Two dimensions: **layout** (information structure) × **style** (visual aesthetics). Freely combine any layout with any style.

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

**⛔ No bitmap text patching**: never use ImageMagick, Pillow, Canvas, SVG, HTML/CSS, OCR scripts, or any other overlay to cover, rewrite, erase, stroke, or replace labels, headings, callouts, data values, or any other text inside an already generated infographic. Regenerate from a corrected prompt, switch to a layout with less on-image text, or ask the user which imperfect candidate to keep.

**Prompt file (hard)**: before invoking any backend, write each image's full, final prompt to its own file under `prompts/` (`NN-{type}-[slug].md`) and pass that file (or its content) to the backend. It is the reproducibility record and lets you switch backends without rewriting prompts.

Change the pinned backend via `## Changing Preferences` below. Tool names above are examples; use the local equivalent in other runtimes.

## Reference Images

Users may supply reference images to guide style, palette, composition, or subject.

**Intake**: Accept via `--ref <files...>` or when the user provides file paths / pastes images in conversation.
- File path(s) → copy to `refs/NN-ref-{slug}.{ext}` alongside the output
- Pasted image with no path → ask the user for the path (per the User Input Tools rule above), or extract style traits verbally as a text fallback
- No reference → skip this section

**Usage modes** (per reference):

| Usage | Effect |
|-------|--------|
| `direct` | Pass the file to the backend as a reference image |
| `style` | Extract style traits (line treatment, texture, mood) and append to the prompt body |
| `palette` | Extract hex colors from the image and append to the prompt body |

**Record in `prompts/infographic.md` frontmatter** when refs exist:

```yaml
references:
  - ref_id: 01
    filename: 01-ref-brand.png
    usage: direct
```

**At generation time**:
- Verify each referenced file exists on disk
- If `usage: direct` AND the chosen backend accepts reference images (e.g., `baoyu-image-gen` via `--ref`) → pass the file via the backend's ref parameter
- Otherwise → embed extracted `style`/`palette` traits in the prompt text

## Confirmation Policy

Default behavior: **confirm before generation**.

- Treat explicit skill invocation, a file path, a matched keyword shortcut, `EXTEND.md` defaults, and the documented default combination as **recommendation inputs only**. None of them authorizes skipping confirmation.
- Do **not** start Step 5 or Step 6 until the user confirms the combination/aspect/language/backend choices.
- Skip confirmation only when the current request explicitly says to do so, for example: `--no-confirm`, "直接生成", "不用确认", "跳过确认", "按默认出图", or equivalent wording.
- If confirmation is skipped explicitly, state the assumed combination/aspect/language/backend in the next user-facing update before generating.

## Options

| Option | Values |
|--------|--------|
| `--layout` | 21 options (see Layout Gallery), default: bento-grid |
| `--style` | 22 options (see Style Gallery), default: craft-handmade |
| `--aspect` | Named: landscape (16:9), portrait (9:16), square (1:1). Custom: any W:H ratio (e.g., 3:4, 4:3, 2.35:1) |
| `--lang` | en, zh, ja, etc. |
| `--no-confirm` | Skip Step 4 only when the user explicitly requests direct generation without confirmation |
| `--ref <files...>` | Reference images (file paths) for style / palette / composition / subject guidance |

## Layout Gallery (21)

| Layout | Best For |
|--------|----------|
| `linear-progression` | Timelines, processes, tutorials |
| `binary-comparison` | A vs B, before-after, pros-cons |
| `comparison-matrix` | Multi-factor comparisons |
| `hierarchical-layers` | Pyramids, priority levels |
| `tree-branching` | Categories, taxonomies |
| `hub-spoke` | Central concept with related items |
| `structural-breakdown` | Exploded views, cross-sections |
| `bento-grid` | Multiple topics, overview (default) |
| `iceberg` | Surface vs hidden aspects |
| `bridge` | Problem-solution |
| `funnel` | Conversion, filtering |
| `isometric-map` | Spatial relationships |
| `dashboard` | Metrics, KPIs |
| `periodic-table` | Categorized collections |
| `comic-strip` | Narratives, sequences |
| `story-mountain` | Plot structure, tension arcs |
| `jigsaw` | Interconnected parts |
| `venn-diagram` | Overlapping concepts |
| `winding-roadmap` | Journey, milestones |
| `circular-flow` | Cycles, recurring processes |
| `dense-modules` | High-density modules, data-rich guides |

Full definitions live at `references/layouts/<layout>.md`.

## Style Gallery (22)

| Style | Description |
|-------|-------------|
| `craft-handmade` | Hand-drawn, paper craft (default) |
| `claymation` | 3D clay figures, stop-motion |
| `kawaii` | Japanese cute, pastels |
| `storybook-watercolor` | Soft painted, whimsical |
| `chalkboard` | Chalk on black board |
| `cyberpunk-neon` | Neon glow, futuristic |
| `bold-graphic` | Comic style, halftone |
| `aged-academia` | Vintage science, sepia |
| `corporate-memphis` | Flat vector, vibrant |
| `technical-schematic` | Blueprint, engineering |
| `origami` | Folded paper, geometric |
| `pixel-art` | Retro 8-bit |
| `ui-wireframe` | Grayscale interface mockup |
| `subway-map` | Transit diagram |
| `ikea-manual` | Minimal line art |
| `knolling` | Organized flat-lay |
| `lego-brick` | Toy brick construction |
| `pop-laboratory` | Blueprint grid, coordinate markers, lab precision |
| `morandi-journal` | Hand-drawn doodle, warm Morandi tones |
| `retro-pop-grid` | 1970s retro pop art, Swiss grid, thick outlines |
| `hand-drawn-edu` | Macaron pastels, hand-drawn wobble, stick figures |
| `retro-popup-pop` | Retro popup collage, vintage UI, thick outlines, flat pop colors |

Full definitions live at `references/styles/<style>.md`.

## Recommended Combinations

| Content Type | Layout + Style |
|--------------|----------------|
| Timeline/History | `linear-progression` + `craft-handmade` |
| Step-by-step | `linear-progression` + `ikea-manual` |
| A vs B | `binary-comparison` + `corporate-memphis` |
| Hierarchy | `hierarchical-layers` + `craft-handmade` |
| Overlap | `venn-diagram` + `craft-handmade` |
| Conversion | `funnel` + `corporate-memphis` |
| Cycles | `circular-flow` + `craft-handmade` |
| Technical | `structural-breakdown` + `technical-schematic` |
| Metrics | `dashboard` + `corporate-memphis` |
| Educational | `bento-grid` + `chalkboard` |
| Journey | `winding-roadmap` + `storybook-watercolor` |
| Categories | `periodic-table` + `bold-graphic` |
| Product Guide | `dense-modules` + `morandi-journal` |
| Technical Guide | `dense-modules` + `pop-laboratory` |
| Trendy Guide | `dense-modules` + `retro-pop-grid` |
| Retro Pop Guide | `dense-modules` + `retro-popup-pop` |
| Educational Diagram | `hub-spoke` + `hand-drawn-edu` |
| Process Tutorial | `linear-progression` + `hand-drawn-edu` |

Default combination: `bento-grid` + `craft-handmade` (fallback recommendation only — per the [Confirmation Policy](#confirmation-policy), defaults never bypass Step 4).

## Keyword Shortcuts

When the user's input contains these keywords, use the mapped layout as the leading Step 3 recommendation and promote the listed styles to the top of the Step 3 list. Skip content-based layout inference for matched keywords. Append any `Prompt Notes` to the Step 5 prompt.

| User Keyword | Layout | Recommended Styles | Default Aspect | Prompt Notes |
|--------------|--------|--------------------|----------------|--------------|
| 高密度信息大图 / high-density-info | `dense-modules` | `morandi-journal`, `pop-laboratory`, `retro-pop-grid`, `retro-popup-pop` | portrait | — |
| 信息图 / infographic | `bento-grid` | `craft-handmade` | landscape | Minimalist: clean canvas, ample whitespace, no complex background textures. Simple cartoon elements and icons only. |

## Output Structure

```
infographic/{topic-slug}/
├── source-{slug}.{ext}
├── analysis.md
├── structured-content.md
├── prompts/infographic.md
└── infographic.png
```

Slug: 2-4 words kebab-case from topic. Conflict: append `-YYYYMMDD-HHMMSS`.

## Core Principles

- Preserve source data faithfully—no summarization or rephrasing (but **strip any credentials, API keys, tokens, or secrets** before including in outputs)
- Define learning objectives before structuring content
- Structure for visual communication (headlines, labels, visual elements)

## Workflow

### Step 1: Setup & Analyze

**1.1 Load Preferences (EXTEND.md)**

Check EXTEND.md in priority order — the first one found wins:

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-infographic/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-infographic/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-infographic/EXTEND.md` | User home |

| Result | Action |
|--------|--------|
| Found | Read, parse, display a one-line summary |
| Not found | Ask the user with `AskUserQuestion` (see `references/config/first-time-setup.md`) |

**EXTEND.md supports**: preferred layout/style, default aspect ratio, language preference, preferred image backend, custom style definitions.

Schema: `references/config/preferences-schema.md`

**1.2 Analyze Content → `analysis.md`**

1. Save source content (file path or paste → `source.md`)
   - **Backup rule**: If `source.md` exists, rename to `source-backup-YYYYMMDD-HHMMSS.md`
2. Analyze: topic, data type, complexity, tone, audience
3. Detect source language and user language
4. Extract design instructions from user input
5. Save analysis
   - **Backup rule**: If `analysis.md` exists, rename to `analysis-backup-YYYYMMDD-HHMMSS.md`

See `references/analysis-framework.md` for detailed format.

### Step 2: Generate Structured Content → `structured-content.md`

Transform content into infographic structure:
1. Title and learning objectives
2. Sections with: key concept, content (verbatim), visual element, text labels
3. Data points (all statistics/quotes copied exactly)
4. Design instructions from user

**Rules**: Markdown only. No new information. Preserve data faithfully. Strip any credentials or secrets from output.

See `references/structured-content-template.md` for detailed format.

### Step 3: Recommend Combinations

**3.1 Check Keyword Shortcuts first**: If user input matches a keyword from the **Keyword Shortcuts** table, use the associated layout as the leading recommendation and prioritize associated styles as top recommendations. Skip content-based layout inference.

**3.2 Otherwise**, recommend 3-5 layout×style combinations based on:
- Data structure → matching layout
- Content tone → matching style
- Audience expectations
- User design instructions

### Step 4: Confirm Options

**Hard gate**: this step is mandatory per the [Confirmation Policy](#confirmation-policy) — Steps 5–6 cannot start until the user confirms here (or explicitly opts out with `--no-confirm` / equivalent in the current request).

Ask the user to confirm the questions below following the [User Input Tools](#user-input-tools) rule at the top of this file (batch into one call if the runtime supports multiple questions; otherwise ask one at a time in priority order).

| Priority | Question | When | Options |
|----------|----------|------|---------|
| 1 | **Combination** | Always | 3+ layout×style combos with rationale |
| 2 | **Aspect** | Always | Named presets (landscape/portrait/square) or custom W:H ratio (e.g., 3:4, 4:3, 2.35:1) |
| 3 | **Language** | Only if source ≠ user language | Language for text content |
| 4 | **Image Backend** | Only if step 3 of the `## Image Generation Tools` rule needs to ask (no runtime-native tool AND multiple non-native backends, OR `preferred_image_backend: ask`) | Available backends |

### Step 5: Generate Prompt → `prompts/infographic.md`

**Backup rule**: If `prompts/infographic.md` exists, rename to `prompts/infographic-backup-YYYYMMDD-HHMMSS.md`

Combine:
1. Layout definition from `references/layouts/<layout>.md`
2. Style definition from `references/styles/<style>.md`
3. Base template from `references/base-prompt.md`
4. Structured content from Step 2
5. All text in confirmed language

**Aspect ratio resolution** for `{{ASPECT_RATIO}}`:
- Named presets → ratio string: landscape→`16:9`, portrait→`9:16`, square→`1:1`
- Custom W:H ratios → use as-is (e.g., `3:4`, `4:3`, `2.35:1`)

### Step 6: Generate Image

1. Resolve the backend per the `## Image Generation Tools` rule at the top of this file.
2. Ensure the full final prompt is persisted at `prompts/infographic.md` (already written in Step 5) BEFORE invoking the backend — the file is the reproducibility record.
3. **Check for existing file**: Before generating, check if `infographic.png` exists
   - If exists: Rename to `infographic-backup-YYYYMMDD-HHMMSS.png`
4. Call the chosen backend with the prompt file and output path.
   - **`codex-imagegen` invocation**: when the rule resolves to `codex-imagegen`, see [references/codex-imagegen.md](references/codex-imagegen.md) for the invocation contract (preferred `baoyu-image-gen --provider codex-cli` path, runtime wrapper discovery, parameter notes, stdout schema, batch semantics).
5. On failure, auto-retry once

Text correction policy:

- If labels, headings, callouts, data values, or any other rendered text is misspelled, garbled, hard to read, or visually weak, do not patch the bitmap with code.
- For text-correction regenerations, write a new prompt file and a new output path so the flawed candidate is preserved for comparison.
- Post-processing is limited to crop, resize, compression, or format conversion that does not alter text or the main composition.

### Step 7: Output Summary

Report: topic, layout, style, aspect, language, image backend, output path, files created.

## References

- `references/analysis-framework.md` - Analysis methodology
- `references/structured-content-template.md` - Content format
- `references/base-prompt.md` - Prompt template
- `references/layouts/<layout>.md` - 21 layout definitions
- `references/styles/<style>.md` - 21 style definitions

## Changing Preferences

EXTEND.md lives at the first matching path in Step 1.1. Three ways to change it:

- **Edit directly** — open EXTEND.md and change fields. Full schema: `references/config/preferences-schema.md`.
- **Reconfigure interactively** — delete EXTEND.md (or ask "reconfigure baoyu-infographic preferences" / "重新配置"). The next run re-triggers first-time setup.
- **Common one-line edits**:
  - `preferred_image_backend: auto` — default; runtime-native tool wins, falls back to the only installed backend, asks only if multiple non-native are present.
  - `preferred_image_backend: codex-imagegen` — pin to Codex's built-in.
  - `preferred_image_backend: baoyu-image-gen` — pin to the baoyu-image-gen skill.
  - `preferred_image_backend: ask` — confirm backend every run.
  - `preferred_layout: dense-modules`, `preferred_style: morandi-journal`, `preferred_aspect: portrait`, `language: zh` — shift the Step-3 recommendations and Step-4 defaults (per [Confirmation Policy](#confirmation-policy), these never bypass Step 4).
