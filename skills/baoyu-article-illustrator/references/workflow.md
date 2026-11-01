# Detailed Workflow Procedures

## Step 1: Pre-check

### 1.0 Detect & Save Reference Images ⚠️ REQUIRED if images provided

| Input Type | Action |
|------------|--------|
| Image file path provided | Copy to `references/` subdirectory → can use `--ref` |
| Image in conversation (no path) | **ASK user for file path** with AskUserQuestion |
| User can't provide path | Extract style/palette verbally → append to prompts (NO frontmatter references) |

**If user provides file path**:
1. Copy to `references/NN-ref-{slug}.png`
2. Create description `references/NN-ref-{slug}.md`:
   ```yaml
   ---
   ref_id: NN
   filename: NN-ref-{slug}.png
   ---
   [User's description or auto-generated description]
   ```
3. Verify files exist, then report: `Reference Images Saved: 01-ref-{slug}.png ✓ (can use --ref)`

**If user can't provide path**:
1. Analyze image visually; extract colors, style, composition
2. Create `references/extracted-style.md` with the extracted info
3. Do NOT add `references` to prompt frontmatter — append extracted style/colors to the prompt text instead
4. Report: `Reference Style Extracted (no file): Colors: #E8756D coral, ... Style: ... → Will append to prompt text (not --ref)`

---

### 1.1 Determine Input Type

| Input | Output Directory | Next |
|-------|------------------|------|
| File path | EXTEND.md `default_output_dir` (default: `imgs-subdir`). If not configured, confirm in 1.2. | → 1.2 |
| Pasted content | `illustrations/{topic-slug}/` | → 1.4 |

**Backup rule for pasted content**: If `source.md` exists in target directory, rename to `source-backup-YYYYMMDD-HHMMSS.md` before saving.

### 1.2-1.4 Configuration (file path input only)

Ask ALL needed questions in ONE AskUserQuestion call (max 4). Skip any whose preference exists or doesn't apply:

| Question | When to Ask | Options |
|----------|-------------|---------|
| Output directory | No `default_output_dir` in EXTEND.md | `{article-dir}/imgs/` (Recommended), `{article-dir}/`, `{article-dir}/illustrations/`, `illustrations/{topic-slug}/` |
| Existing images | Target dir has `.png/.jpg/.webp` files | `supplement`, `overwrite`, `regenerate` |
| Article update | Always (file path input) | `update`, `copy` |

`default_output_dir` values → paths: see Output Directory in SKILL.md.

### 1.5 Load Preferences (EXTEND.md) ⛔ BLOCKING

If EXTEND.md is not found, complete first-time setup before ANY other question or step (no reference images, content, or type/style questions first).

```bash
# macOS, Linux, WSL, Git Bash
test -f .baoyu-skills/baoyu-article-illustrator/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-article-illustrator/EXTEND.md" && echo "xdg"
test -f "$HOME/.baoyu-skills/baoyu-article-illustrator/EXTEND.md" && echo "user"
```

```powershell
# PowerShell (Windows)
if (Test-Path .baoyu-skills/baoyu-article-illustrator/EXTEND.md) { "project" }
$xdg = if ($env:XDG_CONFIG_HOME) { $env:XDG_CONFIG_HOME } else { "$HOME/.config" }
if (Test-Path "$xdg/baoyu-skills/baoyu-article-illustrator/EXTEND.md") { "xdg" }
if (Test-Path "$HOME/.baoyu-skills/baoyu-article-illustrator/EXTEND.md") { "user" }
```

| Result | Action |
|--------|--------|
| Found | Read, parse, display summary → Continue |
| Not found | ⛔ Run first-time setup ONLY ([config/first-time-setup.md](config/first-time-setup.md)) → save EXTEND.md → continue |

**Supports**: Watermark | Preferred type/style | Custom styles | Language | Output directory

---

## Step 2: Setup & Analyze

### 2.1 Analyze Content

| Analysis | Description |
|----------|-------------|
| Content type | Technical / Tutorial / Methodology / Narrative |
| Illustration purpose | information / visualization / imagination |
| Core arguments | 2-5 main points to visualize (main thesis, key concepts, comparisons, proposed framework) |
| Visual opportunities | Positions where illustrations add value |
| Recommended type | Based on content signals and purpose |
| Recommended density | Based on length and complexity |

If the article uses metaphors (e.g., "电锯切西瓜"), do NOT illustrate literally — visualize the **underlying concept**.

### 2.3 Identify Positions

**Illustrate**: core arguments (REQUIRED), abstract concepts, data comparisons, processes/workflows.
**Do NOT illustrate**: metaphors literally, decorative scenes, generic illustrations.

### 2.4 Analyze Reference Images (if provided in Step 1.0)

For each reference: visual characteristics (style, colors, composition), subject, suitable sections, matching types/styles, and a usage recommendation:

| Usage | When to Use |
|-------|-------------|
| `direct` | Reference matches desired output closely |
| `style` | Extract visual style characteristics only |
| `palette` | Extract color scheme only |

---

## Step 3: Confirm Settings ⚠️

**Do NOT skip.** ONE AskUserQuestion call, max 4 questions. **Q1, Q2, Q3 are ALL REQUIRED** (Q3 skipped only when a preset is chosen).

### Q1: Preset or Type ⚠️ REQUIRED

Recommend a preset from [style-presets.md](style-presets.md) "Content Type → Preset Recommendations":

- [Recommended preset] — [brief: type + style + why] (Recommended)
- [Alternative preset] — [brief]
- Or choose type manually: infographic / scene / flowchart / comparison / framework / timeline / mixed

**Default**: if Step 2 found no strong content signal, the recommended preset MUST be `hand-drawn-edu` (infographic + sketch-notes + macaron). If the user then picks a type manually without a `preferred_style`, recommend `sketch-notes` first in Q3.

Preset picked → skip Q3. Type picked → Q3 REQUIRED.

### Q2: Density ⚠️ REQUIRED
- minimal (1-2) - Core concepts only
- balanced (3-5) - Major sections
- per-section - At least 1 per section/chapter (Recommended)
- rich (6+) - Comprehensive coverage

### Q3: Style ⚠️ REQUIRED (skip if preset chosen in Q1)

- If EXTEND.md has `preferred_style`: [custom style + brief] (Recommended), top 2 compatible core styles, Other (full Style Gallery)
- Otherwise: best compatible core style (Recommended), 2 other compatible core styles, Other (full Style Gallery)

Core Styles, gallery, and the Type × Style compatibility matrix: [styles.md](styles.md). In Step 5.1, read `styles/<style>.md` for visual elements and rendering rules.

### Q4: Palette (optional)

Offer when the preset didn't set one and an override may help:

- Default (use style's built-in colors) (Recommended)
- `macaron` — soft pastel blocks on warm cream
- `warm` — warm earth tones, no cool colors
- `neon` — vibrant neon on dark backgrounds

**Skip if**: preset already resolved palette, or `preferred_palette` set in EXTEND.md. See [styles.md](styles.md#palette-gallery) and `palettes/<palette>.md`.

### Q5: Image Text Language ⚠️ REQUIRED when article language ≠ EXTEND.md `language`

- Article language (Recommended)
- EXTEND.md language (user's general preference)

**Skip only if**: article language matches EXTEND.md `language`, or EXTEND.md has no `language`.

### Display Reference Usage (if references detected in Step 1.0)

In the outline preview, show assignments:

```
| Ref | Filename | Recommended Usage |
|-----|----------|-------------------|
| 01 | 01-ref-diagram.png | direct → Illustration 1, 3 |
| 02 | 02-ref-chart.png | palette → Illustration 2 |
```

---

## Step 4: Generate Outline

Save as `{output-dir}/outline.md` (paths relative to the output directory from Step 1.1/1.2):

```yaml
---
type: infographic
density: balanced
style: blueprint
image_count: 4
references:                    # Only if references provided
  - ref_id: 01
    filename: 01-ref-diagram.png
    description: "Technical diagram showing system architecture"
---

## Illustration 1

**Position**: [section] / [paragraph]
**Purpose**: [why this helps]
**Visual Content**: [what to show]
**Type Application**: [how type applies]
**References**: [01]                    # Optional: list ref_ids used
**Reference Usage**: direct             # direct | style | palette
**Filename**: 01-infographic-concept-name.png

## Illustration 2
...
```

Each position justified by content; type applied consistently; style reflected in descriptions; count matches density; references assigned per Step 2.4.

---

## Step 5: Generate Images

### 5.1 Create Prompts ⛔ BLOCKING

Every illustration MUST have a saved prompt file before generation begins. For each illustration in the outline:

1. **Create** `{output-dir}/prompts/NN-{type}-{slug}.md` with YAML frontmatter:
   ```yaml
   ---
   illustration_id: 01
   type: infographic
   style: custom-flat-vector
   ---
   ```
2. **Load style specs** from `styles/<style>.md` (visual elements, style rules, rendering).
3. **Load palette specs** (if specified) from `palettes/<palette>.md`; palette colors **replace** the style's default Color Palette. No palette → style's built-in colors.
4. **Follow the type-specific template** in [prompt-construction.md](prompt-construction.md).
5. **Required prompt sections**:
   - `Layout`: overall composition (grid / radial / hierarchical / left-right / top-down)
   - `ZONES`: each visual area with specific content, not vague descriptions
   - `LABELS`: **actual numbers, terms, metrics, quotes from the article** — not placeholders
   - `COLORS`: hex codes with semantic meaning
   - `STYLE`: line treatment, texture, mood, character rendering
   - `ASPECT`: ratio (e.g., `16:9`)
6. **Apply defaults**: composition requirements, character rendering, text guidelines, watermark.
7. **Backup rule**: if the prompt file exists, rename to `prompts/NN-{type}-{slug}-backup-YYYYMMDD-HHMMSS.md`.

**References in frontmatter**: add `references` only if the files ACTUALLY EXIST in `references/` (verify with `test -f references/NN-ref-{slug}.png`). Verbally extracted style/palette goes in the prompt BODY.

**Verification** ⛔: before 5.2, confirm ALL prompt files exist (list them with ✓).

Never pass ad-hoc inline text to `--prompt` without first saving prompt files: use `--promptfiles prompts/NN-{type}-{slug}.md` or read the saved file content for `--prompt`. Rendering then follows the Batch Generation Policy in SKILL.md.

### 5.2 Select Generation Skill

Follow the `## Image Generation Tools` rule in `SKILL.md`. Never substitute SVG, HTML, or code-based vector for the raster image; if no raster backend resolves, ask the user.

### 5.3 Process References ⚠️ REQUIRED if references saved in Step 1.0

For each illustration with references:

1. **Verify files exist**: `test -f references/NN-ref-{slug}.png && echo "exists" || echo "MISSING"`. Missing but in frontmatter → ERROR: fix frontmatter or remove the references field.
2. Process by usage type from prompt frontmatter:

| Usage | Action | Example |
|-------|--------|---------|
| `direct` | Add reference path to `--ref` parameter | `--ref references/01-ref-brand.png` |
| `style` | Analyze reference, append style traits to prompt | "Style: clean lines, gradient backgrounds..." |
| `palette` | Extract colors from reference, append to prompt | "Colors: #E8756D coral, #7ECFC0 mint..." |

3. If the backend doesn't support `--ref` (baoyu-image-gen with Google does), convert refs to text descriptions appended to the prompt.

Before generating, report processing per illustration (e.g., `Illustration 1: using 01-ref-brand.png (direct) ✓`).

### 5.4 Apply Watermark (if enabled)

Add: `Include a subtle watermark "[content]" at [position].`

### 5.5 Generate

1. Build a task list from saved prompt files:
   - `prompt_file`: `{output-dir}/prompts/NN-{type}-{slug}.md`
   - `output_file`: `{output-dir}/NN-{type}-{slug}.png`
   - `aspect_ratio`: from prompt frontmatter or body
   - `refs`: only verified `direct` references from prompt frontmatter
2. **Backup rule**: if an output image already exists, rename it to `NN-{type}-{slug}-backup-YYYYMMDD-HHMMSS.{ext}` before dispatching.
3. Dispatch per the Batch Generation Policy (native batch: all tasks, or chunks of `generation_batch_size` if the backend has a practical limit; parallel calls: up to `generation_batch_size` at a time; else sequential).
4. After each task, record "Generated X/N: filename".
5. On failure: retry once from the same saved prompt file; keep successful outputs and continue.

---

## Step 6: Finalize

### 6.1 Update Article

Insert after the corresponding paragraph using the Markdown Insert Path from SKILL.md's Output Directory table. Alt text: concise description in the article's language.

### 6.2 Output Summary

```
Article Illustration Complete!

Article: [path]
Type: [type] | Density: [level] | Style: [style] | Palette: [palette or default]
Location: [directory]
Images: X/N generated

Positions:
- 01-xxx.png → After "[Section]"
- 02-yyy.png → After "[Section]"

[If failures]
Failed:
- NN-zzz.png: [reason]
```
