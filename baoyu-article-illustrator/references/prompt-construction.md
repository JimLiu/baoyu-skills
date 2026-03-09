# Prompt Construction

## Prompt File Format

Each prompt file uses YAML frontmatter + content:

```yaml
---
illustration_id: 01
type: infographic
style: blueprint
references:                    # ⚠️ ONLY if files EXIST in references/ directory
  - ref_id: 01
    filename: 01-ref-diagram.png
    usage: direct              # direct | style | palette
---

[Type-specific template content below...]
```

**⚠️ CRITICAL - When to include `references` field**:

| Situation | Action |
|-----------|--------|
| Reference file saved to `references/` | Include in frontmatter ✓ |
| Style extracted verbally (no file) | DO NOT include in frontmatter, append to prompt body instead |
| File path in frontmatter but file doesn't exist | ERROR - remove references field |

**Reference Usage Types** (only when file exists):

| Usage | Description | Generation Action |
|-------|-------------|-------------------|
| `direct` | Primary visual reference | Pass to `--ref` parameter |
| `style` | Style characteristics only | Describe style in prompt text |
| `palette` | Color palette extraction | Include colors in prompt |

**If no reference file but style/palette extracted verbally**, append directly to prompt body:
```
COLORS (from reference):
- Primary: #E8756D coral
- Secondary: #7ECFC0 mint
...

STYLE (from reference):
- Clean lines, minimal shadows
- Gradient backgrounds
...
```

---

## Default Composition Requirements

**Apply to ALL prompts by default**:

| Requirement | Description |
|-------------|-------------|
| **Clean composition** | Simple layouts, no visual clutter |
| **White space** | Generous margins, breathing room around elements |
| **No complex backgrounds** | Solid colors or subtle gradients only, avoid busy textures |
| **Centered or content-appropriate** | Main visual elements centered or positioned by content needs |
| **Matching graphics** | Use graphic elements that align with content theme |
| **Highlight core info** | White space draws attention to key information |

**Add to ALL prompts**:
> Clean composition with generous white space. Simple or no background. Main elements centered or positioned by content needs.

---

## Character Rendering

When depicting people:

| Guideline | Description |
|-----------|-------------|
| **Style** | Simplified cartoon silhouettes or symbolic expressions |
| **Avoid** | Realistic human portrayals, detailed faces |
| **Diversity** | Varied body types when showing multiple people |
| **Emotion** | Express through posture and simple gestures |

**Add to ALL prompts with human figures**:
> Human figures: simplified stylized silhouettes or symbolic representations, not photorealistic.

---

## Text in Illustrations

| Element | Guideline |
|---------|-----------|
| **Size** | Large, prominent, immediately readable |
| **Style** | Handwritten fonts preferred for warmth |
| **Content** | Concise keywords and core concepts only |
| **Language** | Match article language |

**Add to prompts with text**:
> Text should be large and prominent with handwritten-style fonts. Keep minimal, focus on keywords.

### Text Localization Rules

When a prompt is meant to translate or localize an existing text-heavy image:

1. Pass the original image as a real reference image instead of relying on text-only description
2. Extract the authoritative terminology from the article first
3. Write the target text explicitly into the prompt instead of saying only "translate this image"
4. State what must remain unchanged: layout, structure, colors, icons, arrows, spacing, and non-text elements
5. If the image is a framework, acronym, mnemonic, or labeled methodology, require the translated labels to preserve the original letter mapping exactly

Examples of tasks that need this treatment:
- acronym frameworks such as `D.E.E.P`, `SOLVER`, `AARRR`
- process diagrams where each step name has a fixed canonical translation
- charts or cards with short labels that must align with the article wording

Recommended wording pattern:
```text
This is a faithful localization task, not a redesign task.
Use these exact English labels:
- ...
Requirements:
- Preserve layout, structure, icons, colors, spacing, and composition
- Replace only the text language
- Do not invent new step names
```

---

## Principles

Good prompts must include:

1. **Layout Structure First**: Describe composition, zones, flow direction
2. **Specific Data/Labels**: Use actual numbers, terms from article
3. **Visual Relationships**: How elements connect
4. **Semantic Colors**: Meaning-based color choices (red=warning, green=efficient)
5. **Style Characteristics**: Line treatment, texture, mood
6. **Aspect Ratio**: End with ratio and complexity level

For localization prompts, add one more rule:
7. **Exact Target Text List**: For any acronym, framework, or named methodology, include the exact target labels and sublabels to prevent semantic drift

## Type-Specific Templates

### Infographic

```
[Title] - Data Visualization

Layout: [grid/radial/hierarchical]

ZONES:
- Zone 1: [data point with specific values]
- Zone 2: [comparison with metrics]
- Zone 3: [summary/conclusion]

LABELS: [specific numbers, percentages, terms from article]
COLORS: [semantic color mapping]
STYLE: [style characteristics]
ASPECT: 16:9
```

**Infographic + vector-illustration**:
```
Flat vector illustration infographic. Clean black outlines on all elements.
COLORS: Cream background (#F5F0E6), Coral Red (#E07A5F), Mint Green (#81B29A), Mustard Yellow (#F2CC8F)
ELEMENTS: Geometric simplified icons, no gradients, playful decorative elements (dots, stars)
```

### Scene

```
[Title] - Atmospheric Scene

FOCAL POINT: [main subject]
ATMOSPHERE: [lighting, mood, environment]
MOOD: [emotion to convey]
COLOR TEMPERATURE: [warm/cool/neutral]
STYLE: [style characteristics]
ASPECT: 16:9
```

### Flowchart

```
[Title] - Process Flow

Layout: [left-right/top-down/circular]

STEPS:
1. [Step name] - [brief description]
2. [Step name] - [brief description]
...

CONNECTIONS: [arrow types, decision points]
STYLE: [style characteristics]
ASPECT: 16:9
```

**Flowchart + vector-illustration**:
```
Flat vector flowchart with bold arrows and geometric step containers.
COLORS: Cream background (#F5F0E6), steps in Coral/Mint/Mustard, black outlines
ELEMENTS: Rounded rectangles, thick arrows, simple icons per step
```

### Comparison

```
[Title] - Comparison View

LEFT SIDE - [Option A]:
- [Point 1]
- [Point 2]

RIGHT SIDE - [Option B]:
- [Point 1]
- [Point 2]

DIVIDER: [visual separator]
STYLE: [style characteristics]
ASPECT: 16:9
```

**Comparison + vector-illustration**:
```
Flat vector comparison with split layout. Clear visual separation.
COLORS: Left side Coral (#E07A5F), Right side Mint (#81B29A), cream background
ELEMENTS: Bold icons, black outlines, centered divider line
```

### Framework

```
[Title] - Conceptual Framework

STRUCTURE: [hierarchical/network/matrix]

NODES:
- [Concept 1] - [role]
- [Concept 2] - [role]

RELATIONSHIPS: [how nodes connect]
STYLE: [style characteristics]
ASPECT: 16:9
```

**Framework + vector-illustration**:
```
Flat vector framework diagram with geometric nodes and bold connectors.
COLORS: Cream background (#F5F0E6), nodes in Coral/Mint/Mustard/Blue, black outlines
ELEMENTS: Rounded rectangles or circles for nodes, thick connecting lines
```

### Timeline

```
[Title] - Chronological View

DIRECTION: [horizontal/vertical]

EVENTS:
- [Date/Period 1]: [milestone]
- [Date/Period 2]: [milestone]

MARKERS: [visual indicators]
STYLE: [style characteristics]
ASPECT: 16:9
```

## What to Avoid

- Vague descriptions ("a nice image")
- Literal metaphor illustrations
- Missing concrete labels/annotations
- Generic decorative elements

## Watermark Integration

If watermark enabled in preferences, append:

```
Include a subtle watermark "[content]" positioned at [position] with approximately [opacity*100]% visibility.
```
