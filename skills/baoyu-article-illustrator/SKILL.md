---
name: baoyu-article-illustrator
description: Analyzes article structure, identifies positions requiring visual aids, generates illustrations with Type × Style × Palette three-dimension approach. Use when user asks to "illustrate article", "add images", "generate images for article", or "为文章配图".
version: 1.117.4
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-article-illustrator
---

# Article Illustrator

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

**⛔ No bitmap text patching**: never use ImageMagick, Pillow, Canvas, SVG, HTML/CSS, OCR scripts, or any other overlay to cover, rewrite, erase, stroke, or replace labels, captions, or any other text inside an already generated illustration. Regenerate from a corrected prompt, redraw with less or no on-image text, or ask the user which imperfect candidate to keep.

**Prompt file (hard)**: before invoking any backend, write each image's full, final prompt to its own file under `prompts/` (`NN-{type}-[slug].md`) and pass that file (or its content) to the backend. It is the reproducibility record and lets you switch backends without rewriting prompts.

Change the pinned backend via `## Changing Preferences` below. Tool names above are examples; use the local equivalent in other runtimes.

## Batch Generation Policy

After every prompt file for the run has been saved and verified, generate images in batches by default:

1. Use the chosen backend's native batch / multi-task interface if it exists. Each task keeps its own prompt file, output path, aspect ratio, and direct reference images.
2. Otherwise, if the runtime can issue parallel tool calls, dispatch up to `generation_batch_size` images at a time (default `4`). An explicit request in the current message (`--batch-size 4`, "并行4张一起生成") overrides EXTEND.md.
3. Otherwise generate sequentially.

- Never start a batch until all its prompt files exist on disk.
- Retry failed items once without regenerating successful ones.
- Don't use subagents just to parallelize rendering; only for separate per-image prompt iteration or creative exploration.

## Confirmation Policy

Default: **confirm before generation**.

- Explicit skill invocation, a file path, matched signals/presets, and `EXTEND.md` defaults are recommendation inputs only — none authorizes skipping confirmation.
- Do not start Step 4 or later until the user completes Step 3.
- Skip confirmation only when the current request explicitly says so ("直接生成", "不用确认", "跳过确认", "按默认出图", or equivalent). Then state the assumed type / density / style / palette / language / backend in the next user-facing update before generating.

## Reference Images

Users may supply refs via `--ref <files...>`, file paths, or pasted images; they guide style, palette, composition, or subject. Step 1.0 in [references/workflow.md](references/workflow.md) saves them to `references/NN-ref-{slug}.{ext}`; Step 5.3 processes per-illustration usage `direct | style | palette`. When the backend supports batch input, propagate `direct` entries from each prompt file's `references:` frontmatter into its batch task (e.g. `baoyu-image-gen` accepts `ref` per task).

## Three Dimensions

| Dimension | Controls | Values |
|-----------|----------|--------|
| **Type** | Information structure | `infographic` (data, metrics, technical), `scene` (narrative, emotional), `flowchart` (processes), `comparison` (side-by-side), `framework` (models, architecture), `timeline` (history, evolution) |
| **Style** | Rendering approach | See [references/styles.md](references/styles.md) (Core Styles, gallery, Type × Style compatibility) |
| **Palette** | Color scheme (optional) | macaron, warm, neon — overrides style's default colors |

Combine freely (`--type infographic --style vector-illustration --palette macaron`) or use `--preset edu-visual` for type + style + palette in one flag ([references/style-presets.md](references/style-presets.md)). Command syntax and options: [references/usage.md](references/usage.md).

## Workflow

```
- [ ] Step 1: Pre-check (EXTEND.md, references, config)
- [ ] Step 2: Analyze content
- [ ] Step 3: Confirm settings (AskUserQuestion)
- [ ] Step 4: Generate outline
- [ ] Step 5: Generate images
- [ ] Step 6: Finalize
```

Detailed procedures for every step: [references/workflow.md](references/workflow.md).

### Step 1: Pre-check

**1.5 Load Preferences (EXTEND.md) ⛔ BLOCKING** — first match wins:

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-article-illustrator/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-article-illustrator/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-article-illustrator/EXTEND.md` | User home |

Found → read, parse, display summary. Not found → ⛔ run [first-time-setup](references/config/first-time-setup.md) before anything else.

Also: save reference images (1.0), determine input type and output dir (1.1–1.4). See [workflow.md](references/workflow.md#step-1-pre-check).

### Step 2: Analyze

Determine content type (Technical / Tutorial / Methodology / Narrative), purpose (information / visualization / imagination), 2-5 core arguments, and positions where illustrations add value. Metaphors → visualize the underlying concept, never the literal image. See [workflow.md](references/workflow.md#step-2-setup--analyze).

### Step 3: Confirm Settings ⚠️

**Hard gate** per the [Confirmation Policy](#confirmation-policy). ONE AskUserQuestion, max 4 Qs. Q1-Q2 required; Q3 required unless a preset was chosen.

| Q | Options |
|---|---------|
| **Q1: Preset or Type** | [Recommended preset], [alt preset], or manual: infographic, scene, flowchart, comparison, framework, timeline, mixed |
| **Q2: Density** | minimal (1-2), balanced (3-5), per-section (Recommended), rich (6+) |
| **Q3: Style** | [Recommended], minimal-flat, sci-fi, hand-drawn, editorial, scene, poster, Other — **skip if preset chosen** |
| Q4: Palette | Default (style colors), macaron, warm, neon — **skip if preset includes palette or preferred_palette set** |
| Q5: Language | When article language ≠ EXTEND.md setting |

See [workflow.md](references/workflow.md#step-3-confirm-settings-).

### Step 4: Generate Outline

Save `outline.md` with frontmatter (type, density, style, palette, image_count) and one entry per illustration (Position, Purpose, Visual Content, Filename `01-infographic-concept-name.png`). Template: [workflow.md](references/workflow.md#step-4-generate-outline).

### Step 5: Generate Images

⛔ **Prompt files MUST be saved before ANY image generation**, whatever the backend.

1. Per illustration, write `prompts/NN-{type}-{slug}.md` (YAML frontmatter) per [references/prompt-construction.md](references/prompt-construction.md): type-specific template with ZONES / LABELS / COLORS / STYLE / ASPECT; LABELS use article-specific data (actual numbers, terms, metrics, quotes). Never pass ad-hoc inline prompts to `--prompt` without saving prompt files first.
2. Select the backend once per session via `## Image Generation Tools`. For `codex-imagegen`, see [references/codex-imagegen.md](references/codex-imagegen.md).
3. Process references (`direct`/`style`/`palette`) per prompt frontmatter; apply watermark if EXTEND.md enables it.
4. Generate from saved prompt files per `## Batch Generation Policy`; retry once on failure.

See [workflow.md](references/workflow.md#step-5-generate-images).

### Step 6: Finalize

Insert `![description]({relative-path}/NN-{type}-{slug}.png)` after the corresponding paragraph (path relative to the article file, per Output Directory), then print the completion summary ([workflow.md](references/workflow.md#step-6-finalize)).

## Output Directory

Set by `default_output_dir` in EXTEND.md:

| `default_output_dir` | Output Path | Markdown Insert Path |
|----------------------|-------------|----------------------|
| `imgs-subdir` (default) | `{article-dir}/imgs/` | `imgs/NN-{type}-{slug}.png` |
| `same-dir` | `{article-dir}/` | `NN-{type}-{slug}.png` |
| `illustrations-subdir` | `{article-dir}/illustrations/` | `illustrations/NN-{type}-{slug}.png` |
| `independent` | `illustrations/{topic-slug}/` | `illustrations/{topic-slug}/NN-{type}-{slug}.png` (relative to cwd) |

```
{output-dir}/
├── outline.md
├── prompts/
│   └── NN-{type}-{slug}.md
└── NN-{type}-{slug}.png
```

Pasted content (no file path) always uses `illustrations/{topic-slug}/` with `source-{slug}.{ext}` saved alongside. **Slug**: 2-4 words, kebab-case. **Conflict**: append `-YYYYMMDD-HHMMSS`.

## Modification

| Action | Steps |
|--------|-------|
| Edit | Update prompt → Regenerate → Update reference |
| Add | Position → Prompt → Generate → Update outline → Insert |
| Delete | Delete files → Remove reference → Update outline |

Text correction: never patch misspelled, garbled, or weak rendered text in the bitmap with code. Write a new prompt file and a new output path so the flawed candidate is kept for comparison. Post-processing is limited to crop, resize, compression, or format conversion that doesn't alter text or composition.

## Changing Preferences

EXTEND.md lives at the first matching path in Step 1.5. Edit it directly (schema: [references/config/preferences-schema.md](references/config/preferences-schema.md)), or delete it / ask "reconfigure baoyu-article-illustrator preferences" / "重新配置" to re-run first-time setup. Common edits:

- `preferred_image_backend`: `auto` (default; runtime-native wins, else the only installed backend, ask if multiple non-native) | `codex-imagegen` | `baoyu-image-gen` | `ask` (confirm every run)
- `generation_batch_size: 4` — concurrent renders when parallel calls are supported
- `preferred_type: infographic`, `preferred_style: notion`, `preferred_palette: macaron`, `language: zh`
- `default_output_dir: imgs-subdir`
