---
name: baoyu-cover-image
description: Generates article cover images with 5 dimensions (type, palette, rendering, text, mood) combining 11 color palettes and 7 rendering styles. Supports cinematic (2.35:1), widescreen (16:9), and square (1:1) aspects. Use when user asks to "generate cover image", "create article cover", or "make cover".
version: 1.117.5
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-cover-image
---

# Cover Image Generator

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

**⛔ No bitmap text patching**: never use ImageMagick, Pillow, Canvas, SVG, HTML/CSS, OCR scripts, or any other overlay to cover, rewrite, erase, stroke, or replace title/subtitle text inside an already generated cover image. Regenerate from a corrected prompt, switch to a lower-text or no-title variant, or ask the user which imperfect candidate to keep.

**Prompt file (hard)**: before invoking any backend, write each image's full, final prompt to its own file under `prompts/` (`NN-{type}-[slug].md`) and pass that file (or its content) to the backend. It is the reproducibility record and lets you switch backends without rewriting prompts.

Change the pinned backend via `## Changing Preferences` below. Tool names above are examples; use the local equivalent in other runtimes.

## Confirmation Policy

Default: **confirm before generation**.

- Explicit skill invocation, a file path, matched keywords/presets, `EXTEND.md` defaults, and any documented auto-selection are recommendation inputs only — none authorizes skipping confirmation.
- Do not start Step 3 or Step 4 until the user confirms the dimensions / aspect / language / backend choices.
- Skip confirmation only when the current request explicitly says so: `--quick`, "直接生成", "不用确认", "跳过确认", "按默认出图", or equivalent. `quick_mode: true` in `EXTEND.md` counts as a standing explicit opt-out — set it only when you want every run to skip Step 2.
- When skipped, state the assumed dimensions / aspect / language / backend in the next user-facing update before generating.

## Options

| Option | Description |
|--------|-------------|
| `--type <name>` | hero, conceptual, typography, metaphor, scene, minimal |
| `--palette <name>` | warm, elegant, cool, dark, earth, vivid, pastel, mono, retro, duotone, macaron |
| `--rendering <name>` | flat-vector, hand-drawn, painterly, digital, pixel, chalk, screen-print |
| `--style <name>` | Preset shorthand (see [Style Presets](references/style-presets.md)) |
| `--text <level>` | none, title-only, title-subtitle, text-rich |
| `--mood <level>` | subtle, balanced, bold |
| `--font <name>` | clean, handwritten, serif, display |
| `--aspect <ratio>` | 16:9 (default), 2.35:1, 4:3, 3:2, 1:1, 3:4 |
| `--lang <code>` | Title language (en, zh, ja, etc.) |
| `--no-title` | Alias for `--text none` |
| `--quick` | Skip confirmation, use auto-selection |
| `--ref <files...>` | Reference images for style/composition guidance |

## Five Dimensions

| Dimension | Default | Details |
|-----------|---------|---------|
| **Type** | auto | [types.md](references/types.md) |
| **Palette** | auto | [palettes/](references/palettes/) |
| **Rendering** | auto | [renderings/](references/renderings/) |
| **Text** | title-only | [dimensions/text.md](references/dimensions/text.md) |
| **Mood** | balanced | [dimensions/mood.md](references/dimensions/mood.md) |
| **Font** | clean | [dimensions/font.md](references/dimensions/font.md) |

Values are listed in Options. Auto-selection: [references/auto-selection.md](references/auto-selection.md). Compatibility matrices: [references/compatibility.md](references/compatibility.md). Icon vocabulary: [references/visual-elements.md](references/visual-elements.md).

## File Structure

Output directory per `default_output_dir` preference:
- `same-dir`: `{article-dir}/`
- `imgs-subdir`: `{article-dir}/imgs/`
- `independent` (default): `cover-image/{topic-slug}/`

```
<output-dir>/
├── source-{slug}.{ext}    # Source files
├── refs/                  # Reference images (if provided)
│   ├── ref-01-{slug}.{ext}
│   └── ref-01-{slug}.md   # Description file
├── prompts/cover.md       # Generation prompt
└── cover.png              # Output image
```

**Slug**: 2-4 words, kebab-case. Conflict: append `-YYYYMMDD-HHMMSS`

## Workflow

```
Cover Image Progress:
- [ ] Step 0: Check preferences (EXTEND.md) ⛔ BLOCKING
- [ ] Step 1: Analyze content + save refs + determine output dir
- [ ] Step 2: Confirm options (6 dimensions) ⚠️ unless --quick
- [ ] Step 3: Create prompt
- [ ] Step 4: Generate image
- [ ] Step 5: Completion report
```

### Step 0: Load Preferences ⛔ BLOCKING

First match wins:

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-cover-image/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-cover-image/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-cover-image/EXTEND.md` | User home |

Found → load, display summary. Not found → ⛔ run [first-time-setup](references/config/first-time-setup.md) and save, BEFORE any other step or question.

### Step 1: Analyze Content

1. **Save reference images** (if provided) → [references/workflow/reference-images.md](references/workflow/reference-images.md)
2. **Save source content** (if pasted, save to `source.md`)
3. **Analyze content**: topic, tone, keywords, visual metaphors
4. **Deep analyze references** ⚠️: extract specific, concrete elements (see reference-images.md)
5. **Detect language**: compare source, user input, EXTEND.md preference
6. **Determine output directory** per File Structure

**People in reference images** who should appear in the cover:
- **Model supports `--ref`** (default): copy image to `refs/`, pass via `--ref` at generation. No description file needed.
- **Model does NOT support `--ref`** (Jimeng, Seedream 3.0): create `refs/ref-NN-{slug}.md` with per-character description (hair, glasses, skin tone, clothing); embed as MUST/REQUIRED instructions in prompt text.

### Step 2: Confirm Options ⚠️

**Hard gate** per the [Confirmation Policy](#confirmation-policy) (opt-out: `--quick` / `quick_mode: true` / equivalent wording in the current request).

**MUST use `AskUserQuestion`** (interactive selection, not plain-text tables): up to 4 questions in one call (Type, Palette, Rendering, Font + Settings), each with the recommended option first plus reason. `--quick` / `quick_mode` still asks aspect ratio unless `--aspect` is given; all 6 dimensions + `--aspect` specified skips everything. Full flow: [references/workflow/confirm-options.md](references/workflow/confirm-options.md).

### Step 3: Create Prompt

Save to `prompts/cover.md` per [references/workflow/prompt-template.md](references/workflow/prompt-template.md).

- Frontmatter `references`: only files saved to `refs/` (verify `test -f refs/ref-NN-{slug}.{ext}`); verbally extracted style → omit `references`, describe in body.
- Reference elements in the body MUST be detailed, prefixed with "MUST"/"REQUIRED", with an integration approach.

### Step 4: Generate Image

1. **Backup existing** `cover.png` if regenerating
2. **Select backend** once per session via `## Image Generation Tools`.
3. **Write the full final prompt** to `prompts/01-cover-[slug].md` (hard requirement) BEFORE invoking the backend.
4. **Process references** from prompt frontmatter: `direct` → pass via `--ref` (ref-capable backend); `style`/`palette` → extract traits, append to prompt.
5. **Generate** with the prompt file, output path, aspect ratio. For `codex-imagegen`, see [references/codex-imagegen.md](references/codex-imagegen.md).
6. On failure: auto-retry once

### Step 5: Completion Report

```
Cover Generated!

Topic: [topic]
Type: [type] | Palette: [palette] | Rendering: [rendering]
Text: [text] | Mood: [mood] | Font: [font] | Aspect: [ratio]
Title: [title or "visual only"]
Language: [lang] | Watermark: [enabled/disabled]
References: [N images or "extracted style" or "none"]
Location: [directory path]

Files:
✓ source-{slug}.{ext}
✓ prompts/cover.md
✓ cover.png
```

## Image Modification

| Action | Steps |
|--------|-------|
| **Regenerate** | Backup → Update prompt file FIRST → Regenerate |
| **Change dimension** | Backup → Confirm new value → Update prompt → Regenerate |

Text correction: never patch a misspelled, garbled, or weak title/subtitle in the bitmap with code. Write a new prompt file and a new output path so the flawed candidate is kept for comparison. Post-processing is limited to crop, resize, compression, or format conversion that doesn't alter text or composition.

## Composition Principles

- **Whitespace**: 40-60% breathing room
- **Visual anchor**: Main element centered or offset left
- **Characters**: Simplified silhouettes; NO realistic humans
- **Title**: Use exact title from user/source; never invent

## Changing Preferences

EXTEND.md lives at the path from **Step 0**. Edit it directly (schema: [references/config/preferences-schema.md](references/config/preferences-schema.md); watermark: [references/config/watermark-guide.md](references/config/watermark-guide.md)), or delete it / ask "reconfigure baoyu-cover-image preferences" / "重新配置" to re-run first-time setup. Common edits:

- `preferred_image_backend`: `auto` (default; runtime-native wins, else the only installed backend, ask if multiple non-native) | `codex-imagegen` | `baoyu-image-gen` | `ask` (confirm every run)
- `watermark.enabled: true`, `preferred_type`, `preferred_palette`, `preferred_rendering`, `default_aspect`, `quick_mode: true`, `language` — shift auto-selection defaults and the confirmation flow.
