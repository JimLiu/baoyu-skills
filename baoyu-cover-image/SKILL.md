---
name: baoyu-cover-image
description: Generates article cover images with 5 dimensions (type, palette, rendering, text, mood) combining 9 color palettes and 6 rendering styles. Supports cinematic (2.35:1), widescreen (16:9), and square (1:1) aspects. Use when user asks to "generate cover image", "create article cover", or "make cover".
---

# Cover Image Generator

Generate elegant cover images for articles with 5-dimensional customization.

## Usage

```bash
# Auto-select dimensions based on content
/baoyu-cover-image path/to/article.md

# Quick mode: skip confirmation
/baoyu-cover-image article.md --quick

# Specify dimensions
/baoyu-cover-image article.md --type conceptual --palette warm --rendering flat-vector

# Style presets (shorthand for palette + rendering)
/baoyu-cover-image article.md --style blueprint

# With reference images
/baoyu-cover-image article.md --ref style-ref.png

# Direct content input
/baoyu-cover-image --palette mono --aspect 1:1 --quick
[paste content]
```

## Options

| Option | Description |
|--------|-------------|
| `--type <name>` | hero, conceptual, typography, metaphor, scene, minimal |
| `--palette <name>` | warm, elegant, cool, dark, earth, vivid, pastel, mono, retro |
| `--rendering <name>` | flat-vector, hand-drawn, painterly, digital, pixel, chalk |
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

| Dimension | Values | Default |
|-----------|--------|---------|
| **Type** | hero, conceptual, typography, metaphor, scene, minimal | auto |
| **Palette** | warm, elegant, cool, dark, earth, vivid, pastel, mono, retro | auto |
| **Rendering** | flat-vector, hand-drawn, painterly, digital, pixel, chalk | auto |
| **Text** | none, title-only, title-subtitle, text-rich | title-only |
| **Mood** | subtle, balanced, bold | balanced |
| **Font** | clean, handwritten, serif, display | clean |

Auto-selection rules: [references/auto-selection.md](references/auto-selection.md)

## Galleries

**Types**: hero, conceptual, typography, metaphor, scene, minimal
→ Details: [references/types.md](references/types.md)

**Palettes**: warm, elegant, cool, dark, earth, vivid, pastel, mono, retro
→ Details: [references/palettes/](references/palettes/)

**Renderings**: flat-vector, hand-drawn, painterly, digital, pixel, chalk
→ Details: [references/renderings/](references/renderings/)

**Text Levels**: none (pure visual) | title-only (default) | title-subtitle | text-rich (with tags)
→ Details: [references/dimensions/text.md](references/dimensions/text.md)

**Mood Levels**: subtle (low contrast) | balanced (default) | bold (high contrast)
→ Details: [references/dimensions/mood.md](references/dimensions/mood.md)

**Fonts**: clean (sans-serif) | handwritten | serif | display (bold decorative)
→ Details: [references/dimensions/font.md](references/dimensions/font.md)

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

### Progress Checklist

```
Cover Image Progress:
- [ ] Step 0: Check preferences (EXTEND.md) ⛔ BLOCKING
- [ ] Step 1: Analyze content + save refs + determine output dir
- [ ] Step 2: Confirm options (6 dimensions) ⚠️ unless --quick
- [ ] Step 3: Create prompt
- [ ] Step 4: Generate image
- [ ] Step 5: Completion report
```

### Flow

```
Input → [Step 0: Preferences] ─┬─ Found → Continue
                               └─ Not found → First-Time Setup ⛔ BLOCKING → Save EXTEND.md → Continue
        ↓
Analyze + Save Refs → [Output Dir] → [Confirm: 6 Dimensions] → Prompt → Generate → Complete
                                              ↓
                                     (skip if --quick or all specified)
```

### Step 0: Load Preferences ⛔ BLOCKING

Check EXTEND.md existence (priority: project → user):
```bash
# macOS, Linux, WSL, Git Bash
test -f .baoyu-skills/baoyu-cover-image/EXTEND.md && echo "project"
test -f "$HOME/.baoyu-skills/baoyu-cover-image/EXTEND.md" && echo "user"
```

```powershell
# PowerShell (Windows)
if (Test-Path .baoyu-skills/baoyu-cover-image/EXTEND.md) { "project" }
if (Test-Path "$HOME/.baoyu-skills/baoyu-cover-image/EXTEND.md") { "user" }
```

| Result | Action |
|--------|--------|
| Found | Load, display summary → Continue |
| Not found | ⛔ Run first-time setup ([references/config/first-time-setup.md](references/config/first-time-setup.md)) → Save → Continue |

**CRITICAL**: If not found, complete setup BEFORE any other steps or questions.

### Step 1: Analyze Content

1. **Save reference images** (if provided) → [references/workflow/reference-images.md](references/workflow/reference-images.md)
2. **Save source content** (if pasted, save to `source.md`)
3. **Analyze content**: topic, tone, keywords, visual metaphors
4. **Deep analyze references** ⚠️: Extract specific, concrete elements (see reference-images.md)
5. **Detect language**: Compare source, user input, EXTEND.md preference
6. **Determine output directory**: Per File Structure rules

### Step 2: Confirm Options ⚠️

Full confirmation flow: [references/workflow/confirm-options.md](references/workflow/confirm-options.md)

| Condition | Skipped | Still Asked |
|-----------|---------|-------------|
| `--quick` or `quick_mode: true` | 6 dimensions | Aspect ratio (unless `--aspect`) |
| All 6 + `--aspect` specified | All | None |

### Step 3: Create Prompt

Save to `prompts/cover.md`. Template: [references/workflow/prompt-template.md](references/workflow/prompt-template.md)

**CRITICAL - References in Frontmatter**:
- Files saved to `refs/` → Add to frontmatter `references` list
- Style extracted verbally (no file) → Omit `references`, describe in body
- Before writing → Verify: `test -f refs/ref-NN-{slug}.{ext}`

**Reference elements in body** MUST be detailed, prefixed with "MUST"/"REQUIRED", with integration approach.

### Step 4: Generate Image

1. **Backup existing** `cover.png` if regenerating
2. **Check image generation skills**; if multiple, ask preference
3. **Process references** from prompt frontmatter:
   - `direct` usage → pass via `--ref` (use ref-capable backend)
   - `style`/`palette` → extract traits, append to prompt
4. **Generate**: Call skill with prompt file, output path, aspect ratio
5. On failure: auto-retry once

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

## Composition Principles

- **Whitespace**: 40-60% breathing room
- **Visual anchor**: Main element centered or offset left
- **Characters**: Simplified silhouettes; NO realistic humans
- **Title**: Use exact title from user/source; never invent

## Extension Support

Custom configurations via EXTEND.md. See **Step 0** for paths.

Supports: Watermark | Preferred dimensions | Default aspect/output | Quick mode | Custom palettes | Language

Schema: [references/config/preferences-schema.md](references/config/preferences-schema.md)

## References

**Dimensions**: [text.md](references/dimensions/text.md) | [mood.md](references/dimensions/mood.md) | [font.md](references/dimensions/font.md)
**Palettes**: [references/palettes/](references/palettes/)
**Renderings**: [references/renderings/](references/renderings/)
**Types**: [references/types.md](references/types.md)
**Auto-Selection**: [references/auto-selection.md](references/auto-selection.md)
**Style Presets**: [references/style-presets.md](references/style-presets.md)
**Compatibility**: [references/compatibility.md](references/compatibility.md)
**Visual Elements**: [references/visual-elements.md](references/visual-elements.md)
**Workflow**: [confirm-options.md](references/workflow/confirm-options.md) | [prompt-template.md](references/workflow/prompt-template.md) | [reference-images.md](references/workflow/reference-images.md)
**Config**: [preferences-schema.md](references/config/preferences-schema.md) | [first-time-setup.md](references/config/first-time-setup.md) | [watermark-guide.md](references/config/watermark-guide.md)
