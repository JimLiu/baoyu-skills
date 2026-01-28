# Step 3: Prompt Template

Save to `prompts/cover.md`:

```markdown
# Content Context
Article title: [full original title from source]
Content summary: [2-3 sentence summary of key points and themes]
Keywords: [5-8 key terms extracted from content]

# Visual Design
Cover theme: [2-3 words visual interpretation]
Type: [confirmed type]
Palette: [confirmed palette]
Rendering: [confirmed rendering]
Text level: [confirmed text level]
Mood: [confirmed mood]
Aspect ratio: [confirmed ratio]
Language: [confirmed language]

# Text Elements
[Based on text level:]
- none: "No text elements"
- title-only: "Title: [max 8 chars headline]"
- title-subtitle: "Title: [headline] / Subtitle: [max 15 chars context]"
- text-rich: "Title: [headline] / Subtitle: [context] / Tags: [2-4 keywords]"

# Mood Application
[Based on mood level:]
- subtle: "Use low contrast, muted colors, light visual weight, calm aesthetic"
- balanced: "Use medium contrast, normal saturation, balanced visual weight"
- bold: "Use high contrast, vivid saturated colors, heavy visual weight, dynamic energy"

# Composition
Type composition:
- [Type-specific layout and structure]

Visual composition:
- Main visual: [metaphor derived from content meaning]
- Layout: [positioning based on type and aspect ratio]
- Decorative: [palette-specific elements that reinforce content theme]

Color scheme: [primary, background, accent from palette definition, adjusted by mood]
Rendering notes: [key characteristics from rendering definition — lines, texture, depth, element style]
Type notes: [key characteristics from type definition]
Palette notes: [key characteristics from palette definition]

[Watermark section if enabled]
```

## Content-Driven Design

- Article title and summary inform the visual metaphor choice
- Keywords guide decorative elements and symbols
- The skill controls visual style; the content drives meaning

## Type-Specific Composition

| Type | Composition Guidelines |
|------|------------------------|
| `hero` | Large focal visual (60-70% area), title overlay on visual, dramatic composition |
| `conceptual` | Abstract shapes representing core concepts, information hierarchy, clean zones |
| `typography` | Title as primary element (40%+ area), minimal supporting visuals, strong hierarchy |
| `metaphor` | Concrete object/scene representing abstract idea, symbolic elements, emotional resonance |
| `scene` | Atmospheric environment, narrative elements, mood-setting lighting and colors |
| `minimal` | Single focal element, generous whitespace (60%+), essential shapes only |

## Title Guidelines

When text level includes title:
- Max 8 characters, punchy headline
- Use engagement hooks: numbers ("3个陷阱"), questions ("Why X?"), contrasts ("A vs B"), pain points ("别再X了")
- Match confirmed language

## Watermark Application

If enabled in preferences, add to prompt:

```
Include a subtle watermark "[content]" positioned at [position].
The watermark should be legible but not distracting from the main content.
```

Reference: `config/watermark-guide.md`
