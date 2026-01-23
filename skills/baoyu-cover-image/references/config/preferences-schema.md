---
name: preferences-schema
description: EXTEND.md YAML schema for baoyu-cover-image user preferences
---

# Preferences Schema

## Full Schema

```yaml
---
version: 1

watermark:
  enabled: false
  content: ""
  position: bottom-right  # bottom-right|bottom-left|bottom-center|top-right
  opacity: 0.7            # 0.1-1.0

preferred_type: null      # hero|conceptual|typography|metaphor|scene|minimal or null for auto-select

preferred_style: null     # Built-in style name or null for auto-select

default_aspect: "2.35:1"  # 2.35:1|16:9|1:1

language: null            # zh|en|ja|ko|auto (null = auto-detect)

custom_styles:
  - name: my-style
    description: "Style description"
    color_palette:
      primary: ["#1E3A5F", "#4A90D9"]
      background: "#F5F7FA"
      accents: ["#00B4D8"]
    visual_elements: "Clean lines, geometric shapes"
    typography: "Modern sans-serif"
    best_for: "Business, tech content"
---
```

## Field Reference

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `version` | int | 1 | Schema version |
| `watermark.enabled` | bool | false | Enable watermark |
| `watermark.content` | string | "" | Watermark text (@username or custom) |
| `watermark.position` | enum | bottom-right | Position on image |
| `watermark.opacity` | float | 0.7 | Transparency (0.1-1.0) |
| `preferred_type` | string | null | Type name or null for auto |
| `preferred_style` | string | null | Style name or null for auto |
| `default_aspect` | string | "2.35:1" | Default aspect ratio |
| `language` | string | null | Output language (null = auto-detect) |
| `custom_styles` | array | [] | User-defined styles |

## Type Options

| Value | Description |
|-------|-------------|
| `hero` | Large visual impact, title overlay |
| `conceptual` | Concept visualization, abstract core ideas |
| `typography` | Text-focused layout, prominent title |
| `metaphor` | Visual metaphor, concrete expressing abstract |
| `scene` | Atmospheric scene, narrative feel |
| `minimal` | Minimalist composition, generous whitespace |

## Position Options

| Value | Description |
|-------|-------------|
| `bottom-right` | Lower right corner (default, most common) |
| `bottom-left` | Lower left corner |
| `bottom-center` | Bottom center |
| `top-right` | Upper right corner |

## Aspect Ratio Options

| Value | Description | Best For |
|-------|-------------|----------|
| `2.35:1` | Cinematic widescreen | Article headers, blog covers |
| `16:9` | Standard widescreen | Presentations, video thumbnails |
| `1:1` | Square | Social media, profile images |

## Custom Style Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique style identifier (kebab-case) |
| `description` | Yes | What the style conveys |
| `color_palette.primary` | No | Main colors (array) |
| `color_palette.background` | No | Background color |
| `color_palette.accents` | No | Accent colors (array) |
| `visual_elements` | No | Decorative elements |
| `typography` | No | Font/lettering style |
| `best_for` | No | Recommended content types |

## Example: Minimal Preferences

```yaml
---
version: 1
watermark:
  enabled: true
  content: "@myhandle"
preferred_type: null
preferred_style: elegant
---
```

## Example: Full Preferences

```yaml
---
version: 1
watermark:
  enabled: true
  content: "myblog.com"
  position: bottom-right
  opacity: 0.5

preferred_type: conceptual

preferred_style: blueprint

default_aspect: "16:9"

language: en

custom_styles:
  - name: corporate-tech
    description: "Professional B2B tech style"
    color_palette:
      primary: ["#1E3A5F", "#4A90D9"]
      background: "#F5F7FA"
      accents: ["#00B4D8", "#48CAE4"]
    visual_elements: "Clean lines, subtle gradients, circuit patterns"
    typography: "Modern sans-serif, professional"
    best_for: "SaaS, enterprise, technical"
---
```
