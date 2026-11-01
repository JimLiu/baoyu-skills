# Step 3: Prompt Template

Save to `prompts/cover.md`:

```markdown
---
type: cover
palette: [confirmed palette]
rendering: [confirmed rendering]
references:
  - ref_id: 01
    filename: refs/ref-01-{slug}.{ext}
    usage: direct | style | palette
  - ref_id: 02
    filename: refs/ref-02-{slug}.{ext}
    usage: direct | style | palette
---

# Content Context
Article title: [full original title from source]
Content summary: [2-3 sentence summary of key points and themes]
Keywords: [5-8 key terms extracted from content]

# Visual Design
Cover theme: [2-3 words visual interpretation]
Type: [confirmed type]
Palette: [confirmed palette]
Rendering: [confirmed rendering]
Font: [confirmed font]
Text level: [confirmed text level]
Mood: [confirmed mood]
Aspect ratio: [confirmed ratio]
Language: [confirmed language]

# Text Elements
[Based on text level:]
- none: "No text elements"
- title-only: "Title: [exact title from source or user]"
- title-subtitle: "Title: [title] / Subtitle: [context]"
- text-rich: "Title: [title] / Subtitle: [context] / Tags: [2-4 keywords]"

# Mood Application
[Based on mood level:]
- subtle: "Use low contrast, muted colors, light visual weight, calm aesthetic"
- balanced: "Use medium contrast, normal saturation, balanced visual weight"
- bold: "Use high contrast, vivid saturated colors, heavy visual weight, dynamic energy"

# Font Application
[Based on font style:]
- clean: "Use clean geometric sans-serif typography. Modern, minimal letterforms."
- handwritten: "Use warm hand-lettered typography with organic brush strokes. Friendly, personal feel."
- serif: "Use elegant serif typography with refined letterforms. Classic, editorial character."
- display: "Use bold decorative display typography. Heavy, expressive headlines."

# Composition
Type composition:
- [Type-specific layout and structure]

Visual composition:
- Main visual: [metaphor derived from content meaning]
- Layout: [positioning based on type and aspect ratio]
- Decorative: [palette-specific elements that reinforce content theme]

Color scheme: [primary, background, accent from palette definition, adjusted by mood]
Color constraint: Color values (#hex) and color names are rendering guidance only — do NOT display color names, hex codes, or palette labels as visible text in the image.
Rendering notes: [key characteristics from rendering definition — lines, texture, depth, element style]
Type notes: [key characteristics from type definition]
Palette notes: [key characteristics from palette definition]

[Watermark section if enabled]

[Reference images section if provided — REQUIRED, see below]
```

## Content-Driven Design

Title and summary inform the visual metaphor; keywords guide decorative elements and symbols. The skill controls visual style; the content drives meaning. Match content themes to icon vocabulary:

| Content Theme | Suggested Elements |
|---------------|-------------------|
| Programming/Dev | Code window, terminal, API brackets, gear |
| AI/ML | Brain, neural network, robot, circuit |
| Growth/Business | Chart, rocket, plant, mountain, arrow |
| Security | Lock, shield, key, fingerprint |
| Communication | Speech bubble, megaphone, mail, handshake |
| Tools/Methods | Wrench, checklist, pencil, puzzle |

Full library: [../visual-elements.md](../visual-elements.md)

## Type Composition & Title

Type-specific composition: [../types.md](../types.md#type-specific-composition). When the text level includes a title, use the exact title provided by the user or extracted from source — never invent one — in the confirmed language.

## Watermark Application

If enabled in preferences, add to prompt:

```
Include a subtle watermark "[content]" positioned at [position].
The watermark should be legible but not distracting from the main content.
```

Reference: `config/watermark-guide.md`

## Reference Image Handling

When the user provides reference images (`--ref` or pasted), references are the **primary visual input**: the cover should look like the same visual family.

### ⚠️ Frontmatter References

**MUST add `references` in YAML frontmatter** when reference files are saved to `refs/`:

```yaml
---
type: cover
palette: warm
rendering: flat-vector
references:
  - ref_id: 01
    filename: refs/ref-01-podcast-thumbnail.jpg
    usage: style
---
```

| Field | Description |
|-------|-------------|
| `ref_id` | Sequential number (01, 02, ...) |
| `filename` | Relative path from prompt file's parent directory |
| `usage` | `direct` (matches desired output closely → pass to `--ref`) / `style` (describe style in prompt text) / `palette` (include colors in prompt) |

| Situation | Frontmatter Action | Generation Action |
|-----------|-------------------|-------------------|
| Reference file saved to `refs/` | Add to `references` list ✓ | Pass via `--ref` parameter |
| Style extracted verbally (no file) | Omit `references` field entirely | Describe in prompt body only |
| File path in frontmatter but doesn't exist | ERROR - fix or remove | Generation will fail |

**Before writing prompt with references, verify**: `test -f refs/ref-NN-{slug}.{ext}`

### Step 1: Analyze References

Extract concrete elements per [reference-images.md](reference-images.md#deep-analysis-) (style, composition, color mood, key elements).

### Step 2: Embed in Prompt ⚠️ CRITICAL

**Passing `--ref` alone is NOT enough** — models often ignore reference images unless the prompt text explicitly describes what to reproduce. Always write detailed textual instructions, with or without `--ref`.

**If file saved (with or without `--ref` support)**:
- Pass ref images via `--ref` parameter if skill supports it
- **ALWAYS** add a detailed mandatory section in the prompt body:

```
# Reference Style — MUST INCORPORATE

CRITICAL: The generated cover MUST visually reference the provided images. The cover must feel like it belongs to the same visual family.

## From Ref 1 ([filename]) — REQUIRED elements:
- [Brand element]: [Specific description of logo/wordmark treatment, e.g., "The logo uses vertical parallel lines (|||) for the letter 'm'. Reproduce this exact treatment."]
- [Signature pattern]: [Specific description, e.g., "Woven intersecting curves forming a diamond/lozenge grid pattern. This MUST appear prominently as a banner, border, or background section."]
- [Colors]: [Exact hex values, e.g., "Dark teal #2D4A3E background, cream #F5F0E0 text"]
- [Typography]: [Specific treatment, e.g., "Uppercase text with wide letter-spacing"]
- [Layout element]: [Specific spatial element, e.g., "Bottom banner strip in dark color"]

## From Ref 1 ([filename]) — Characters (if people present):
- **Character 1**: [Appearance, e.g., "Woman, long wavy blonde hair"] → MUST stylize: [e.g., "flat-vector, simplified face, keep blonde hair, label: 'Nicole Forsgren'"]
- **Character 2**: [Appearance, e.g., "Man, short dark hair, stubble"] → MUST stylize: [e.g., "flat-vector, simplified face, keep dark hair, label: 'Gergely Orosz'"]
- **Placement**: [e.g., "Right third, side by side, facing left toward main visual"]
- **Style**: Match rendering style, NOT photorealistic

## From Ref 2 ([filename]) — REQUIRED elements:
[Same detailed breakdown]

## Integration approach:
[Specific layout instruction describing how reference elements combine with the cover content, e.g., "Use a SPLIT LAYOUT: main illustration area (warm cream background) occupies ~65% of the image, while a dark teal BANNER STRIP (with the woven line pattern from Ref 2) runs along the bottom ~35%, containing branding elements from Ref 1."]
```

**Key rules**:
- Each visual element gets its own bullet with "MUST" or "REQUIRED"
- Descriptions must be **specific enough to reproduce** — not vague ("clean style")
- The integration approach must describe **exact spatial arrangement**
- After generation, verify reference elements are visible; if not, strengthen and regenerate

**If style/palette extracted verbally (NO file saved)**:
- DO NOT add references metadata to prompt
- Append extracted info directly to prompt body using the same MUST INCORPORATE format above:

```
# Reference Style — MUST INCORPORATE (extracted from visual analysis)

CRITICAL: Apply these specific visual elements extracted from the reference images.

## REQUIRED elements:
- [Same detailed bullet format as above]

## Integration approach:
[Same spatial layout instruction]
```
