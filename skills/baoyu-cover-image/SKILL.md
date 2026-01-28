---
name: baoyu-cover-image
description: Generates article cover images with 5 dimensions (type, palette, rendering, text, mood) combining 9 color palettes and 6 rendering styles. Supports cinematic (2.35:1), widescreen (16:9), and square (1:1) aspects. Use when user asks to "generate cover image", "create article cover", "make cover", or mentions "封面图".
---

# Cover Image Generator

Generate elegant cover images for articles with 5-dimensional customization.

## Usage

```bash
# Auto-select all dimensions based on content
/baoyu-cover-image path/to/article.md

# Quick mode: skip confirmation, use auto-selection
/baoyu-cover-image article.md --quick

# Specify dimensions (new 5D system)
/baoyu-cover-image article.md --type conceptual --palette warm --rendering flat-vector
/baoyu-cover-image article.md --text title-subtitle --mood bold

# Style presets (backward-compatible shorthand for palette + rendering)
/baoyu-cover-image article.md --style blueprint
/baoyu-cover-image article.md --style blueprint --rendering hand-drawn  # override rendering

# Visual only (no title text)
/baoyu-cover-image article.md --no-title

# Direct content input
/baoyu-cover-image
[paste content]

# Direct input with options
/baoyu-cover-image --palette mono --rendering digital --aspect 1:1 --quick
[paste content]
```

## Options

| Option | Description |
|--------|-------------|
| `--type <name>` | Cover type: hero, conceptual, typography, metaphor, scene, minimal |
| `--palette <name>` | Color palette: warm, elegant, cool, dark, earth, vivid, pastel, mono, retro |
| `--rendering <name>` | Rendering style: flat-vector, hand-drawn, painterly, digital, pixel, chalk |
| `--style <name>` | Preset shorthand (expands to palette + rendering, see [Style Presets](references/style-presets.md)) |
| `--text <level>` | Text density: none, title-only, title-subtitle, text-rich |
| `--mood <level>` | Emotional intensity: subtle, balanced, bold |
| `--aspect <ratio>` | 16:9 (default), 2.35:1, 4:3, 3:2, 1:1, 3:4 |
| `--lang <code>` | Title language (en, zh, ja, etc.) |
| `--no-title` | Alias for `--text none` |
| `--quick` | Skip confirmation, use auto-selection for missing dimensions |

## Five Dimensions

| Dimension | Controls | Values | Default |
|-----------|----------|--------|---------|
| **Type** | Visual composition, information structure | hero, conceptual, typography, metaphor, scene, minimal | auto |
| **Palette** | Colors, color scheme, decorative hints | warm, elegant, cool, dark, earth, vivid, pastel, mono, retro | auto |
| **Rendering** | Line quality, texture, depth, element style | flat-vector, hand-drawn, painterly, digital, pixel, chalk | auto |
| **Text** | Text density, information hierarchy | none, title-only, title-subtitle, text-rich | title-only |
| **Mood** | Emotional intensity, visual weight | subtle, balanced, bold | balanced |

Dimensions can be freely combined. Auto-selection rules: [references/auto-selection.md](references/auto-selection.md)

## Type Gallery

| Type | Description | Best For |
|------|-------------|----------|
| `hero` | Large visual impact, title overlay | Product launch, brand promotion, major announcements |
| `conceptual` | Concept visualization, abstract core ideas | Technical articles, methodology, architecture design |
| `typography` | Text-focused layout, prominent title | Opinion pieces, quotes, insights |
| `metaphor` | Visual metaphor, concrete expressing abstract | Philosophy, growth, personal development |
| `scene` | Atmospheric scene, narrative feel | Stories, travel, lifestyle |
| `minimal` | Minimalist composition, generous whitespace | Zen, focus, core concepts |

Type composition details: [references/types.md](references/types.md)

## Palette Gallery

| Palette | Vibe | Primary Colors |
|---------|------|----------------|
| `warm` | Friendly, approachable | Orange, golden yellow, terracotta |
| `elegant` | Sophisticated, refined | Soft coral, muted teal, dusty rose |
| `cool` | Technical, professional | Engineering blue, navy, cyan |
| `dark` | Cinematic, premium | Electric purple, cyan, magenta |
| `earth` | Natural, organic | Forest green, sage, earth brown |
| `vivid` | Energetic, bold | Bright red, neon green, electric blue |
| `pastel` | Gentle, whimsical | Soft pink, mint, lavender |
| `mono` | Clean, focused | Black, near-black, white |
| `retro` | Nostalgic, vintage | Muted orange, dusty pink, maroon |

Palette definitions: [references/palettes/](references/palettes/)

## Rendering Gallery

| Rendering | Description | Key Characteristics |
|-----------|-------------|---------------------|
| `flat-vector` | Clean modern vector | Uniform outlines, flat fills, geometric icons |
| `hand-drawn` | Sketchy organic illustration | Imperfect strokes, paper texture, doodles |
| `painterly` | Soft watercolor/paint | Brush strokes, color bleeds, soft edges |
| `digital` | Polished modern digital | Precise edges, subtle gradients, UI components |
| `pixel` | Retro 8-bit pixel art | Pixel grid, dithering, chunky shapes |
| `chalk` | Chalk on blackboard | Chalk strokes, dust effects, board texture |

Rendering definitions: [references/renderings/](references/renderings/)

## Text & Mood

| Text Level | Title | Subtitle | Tags | Use Case |
|------------|:-----:|:--------:|:----:|----------|
| `none` | - | - | - | Pure visual, no text |
| `title-only` | ✓ (≤8 字) | - | - | Simple headline (default) |
| `title-subtitle` | ✓ | ✓ (≤15 字) | - | Title + supporting context |
| `text-rich` | ✓ | ✓ | ✓ (2-4) | Information-dense |

| Mood | Contrast | Saturation | Weight | Use Case |
|------|:--------:|:----------:|:------:|----------|
| `subtle` | Low | Muted | Light | Corporate, thought leadership |
| `balanced` | Medium | Normal | Medium | General articles (default) |
| `bold` | High | Vivid | Heavy | Announcements, promotions |

Full guides: [references/dimensions/text.md](references/dimensions/text.md) | [references/dimensions/mood.md](references/dimensions/mood.md)

## Style Presets & Compatibility

- **Style Presets**: `--style X` expands to palette + rendering. See [references/style-presets.md](references/style-presets.md)
- **Compatibility Matrices**: Palette×Rendering, Type×Rendering, Type×Text, Type×Mood. See [references/compatibility.md](references/compatibility.md)
  - ✓✓ = highly recommended | ✓ = compatible | ✗ = not recommended

## File Structure

Output directory depends on `default_output_dir` preference:

| Preference | Output Path |
|------------|-------------|
| `same-dir` | `{article-dir}/` |
| `imgs-subdir` | `{article-dir}/imgs/` |
| `independent` (default) | `cover-image/{topic-slug}/` |
| Pasted content | `cover-image/{topic-slug}/` (always) |

```
<output-dir>/
├── source-{slug}.{ext}    # Source files (text, images, etc.)
├── prompts/cover.md       # Generation prompt
└── cover.png              # Output image
```

**Slug**: Extract main topic (2-4 words, kebab-case). Example: "The Future of AI" → `future-of-ai`
**Conflict**: If directory exists, append timestamp: `{topic-slug}-YYYYMMDD-HHMMSS`
**Source Files**: Copy all sources with naming `source-{slug}.{ext}` (multiple supported)

## Workflow

### Progress Checklist

```
Cover Image Progress:
- [ ] Step 0: Check preferences (EXTEND.md) ⚠️ REQUIRED if not found
- [ ] Step 1: Analyze content + determine output directory ⚠️ MUST ask if not configured
- [ ] Step 2: Confirm options (5 dimensions) ⚠️ REQUIRED unless --quick or all specified
- [ ] Step 3: Create prompt
- [ ] Step 4: Generate image
- [ ] Step 5: Completion report
```

### Flow

```
Input → [Step 0: Preferences/Setup] → Analyze → [Output Dir ⚠️] → [Confirm: 5 Dimensions] → Prompt → Generate → Complete
                                                                          ↓
                                                                  (skip if --quick or all specified)
```

### Step 0: Load Preferences (EXTEND.md) ⚠️

**Purpose**: Load user preferences or run first-time setup. **Do NOT skip setup if EXTEND.md not found.**

Use Bash to check EXTEND.md existence (priority order):

```bash
# Check project-level first
test -f .baoyu-skills/baoyu-cover-image/EXTEND.md && echo "project"

# Then user-level (cross-platform: $HOME works on macOS/Linux/WSL)
test -f "$HOME/.baoyu-skills/baoyu-cover-image/EXTEND.md" && echo "user"
```

| Result | Action |
|--------|--------|
| Found | Read, parse, display preferences summary → Continue to Step 1 |
| Not found | ⚠️ MUST run first-time setup ([references/config/first-time-setup.md](references/config/first-time-setup.md)) → Then continue to Step 1 |

**Preferences Summary** (when found):

```
Preferences loaded from [project/user]:
• Watermark: [enabled/disabled] [content if enabled]
• Type/Palette/Rendering: [value or "auto"]
• Text: [value or "title-only"] | Mood: [value or "balanced"]
• Aspect: [default_aspect] | Output: [dir or "not set — will ask in Step 1.5"]
• Quick mode: [enabled/disabled] | Language: [value or "auto"]
```

**EXTEND.md Supports**: Watermark | Preferred type | Preferred palette | Preferred rendering | Preferred text | Preferred mood | Default aspect ratio | Default output directory | Quick mode | Custom palette definitions | Language preference

Schema: [references/config/preferences-schema.md](references/config/preferences-schema.md)

### Step 1: Analyze Content

1. **Save source content** (if pasted, save to `source.md` in target directory; if file path, use as-is)
2. **Content analysis**: Extract topic, core message, tone, keywords; identify visual metaphors; detect content type
3. **Language detection**: Detect source language, note user's input language, compare with EXTEND.md preference
4. **Determine output directory** per File Structure rules. If no `default_output_dir` preference + file path input, include in Step 2 Q4

### Step 2: Confirm Options ⚠️

Validate all 5 dimensions + aspect ratio. Full confirmation flow: [references/workflow/confirm-options.md](references/workflow/confirm-options.md)

**Skip Conditions**:

| Condition | Skipped | Still Asked |
|-----------|---------|-------------|
| `--quick` or `quick_mode: true` | 5 dimensions | Aspect ratio (unless `--aspect`) |
| All 5 + `--aspect` specified | All | None |

### Step 3: Create Prompt

Save to `prompts/cover.md`. Full template: [references/workflow/prompt-template.md](references/workflow/prompt-template.md)

### Step 4: Generate Image

1. Backup existing `cover.png` → `cover-backup-YYYYMMDD-HHMMSS.png` (if regenerating)
2. Check available image generation skills; if multiple, ask user preference
3. Call selected skill with prompt file path, output path (`cover.png`), aspect ratio
4. On failure: auto-retry once before reporting error

### Step 5: Completion Report

```
Cover Generated!

Topic: [topic]
Type: [type] | Palette: [palette] | Rendering: [rendering]
Text: [text] | Mood: [mood] | Aspect: [ratio]
Title: [title text or "visual only"]
Language: [lang] | Watermark: [enabled/disabled]
Location: [directory path]

Files:
✓ source-{slug}.{ext}
✓ prompts/cover.md
✓ cover.png
[✓ cover-backup-{timestamp}.png (if regenerated)]
```

## Image Modification

| Action | Steps |
|--------|-------|
| **Regenerate** | Backup existing → Update prompt → Regenerate with same settings |
| **Change dimension** | Backup existing → Confirm new value → Update prompt → Regenerate |

All modifications automatically backup existing `cover.png` before regenerating.

## Notes

- Cover must be readable at small preview sizes
- Visual metaphors > literal representations
- Title: max 8 chars, readable, impactful
- Two confirmation points: Step 0 (first-time setup) + Step 2 (options) - skip Step 2 with `--quick`
- Use confirmed language for title text
- Maintain watermark consistency if enabled
- Check compatibility matrices when selecting combinations
- `--no-title` is alias for `--text none`
- `--style` presets are backward-compatible; explicit `--palette`/`--rendering` override preset values

## References

**Dimensions**: [text.md](references/dimensions/text.md) | [mood.md](references/dimensions/mood.md)
**Palettes**: [references/palettes/](references/palettes/)
**Renderings**: [references/renderings/](references/renderings/)
**Auto-Selection**: [references/auto-selection.md](references/auto-selection.md)
**Style Presets**: [references/style-presets.md](references/style-presets.md)
**Compatibility**: [references/compatibility.md](references/compatibility.md)
**Types**: [references/types.md](references/types.md)
**Workflow**: [confirm-options.md](references/workflow/confirm-options.md) | [prompt-template.md](references/workflow/prompt-template.md)
**Config**: [preferences-schema.md](references/config/preferences-schema.md) | [first-time-setup.md](references/config/first-time-setup.md) | [watermark-guide.md](references/config/watermark-guide.md)
