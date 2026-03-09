---
name: preferences-schema
description: EXTEND.md YAML schema for baoyu-xhs-images user preferences
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

preferred_style:
  name: null              # Built-in or custom style name
  description: ""         # Override/notes

preferred_layout: null    # sparse|balanced|dense|list|comparison|flow

language: null            # zh|en|ja|ko|auto

custom_styles:
  - name: my-style
    description: "Style description"
    color_palette:
      primary: ["#FED7E2", "#FEEBC8"]
      background: "#FFFAF0"
      accents: ["#FF69B4", "#FF6B6B"]
    visual_elements: "Hearts, stars, sparkles"
    typography: "Rounded, bubbly hand lettering"
    best_for: "Lifestyle, beauty"
---
```

## Field Reference

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `version` | int | 1 | Schema version |
| `watermark.enabled` | bool | false | Enable watermark |
| `watermark.content` | string | "" | Watermark text (@username or custom) |
| `watermark.position` | enum | bottom-right | Position on image |
| `preferred_style.name` | string | null | Style name or null |
| `preferred_style.description` | string | "" | Custom notes/override |
| `preferred_layout` | string | null | Layout preference or null |
| `language` | string | null | Output language (null = auto-detect) |
| `custom_styles` | array | [] | User-defined styles |

## Position Options

| Value | Description |
|-------|-------------|
| `bottom-right` | Lower right corner (default, most common) |
| `bottom-left` | Lower left corner |
| `bottom-center` | Bottom center |
| `top-right` | Upper right corner |

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
  content: "@myusername"
preferred_style:
  name: notion
---
```

## Example: Full Preferences

```yaml
---
version: 1
watermark:
  enabled: true
  content: "@myxhsaccount"
  position: bottom-right

preferred_style:
  name: notion
  description: "Clean knowledge cards for tech content"

preferred_layout: dense

language: zh

custom_styles:
  - name: corporate
    description: "Professional B2B style"
    color_palette:
      primary: ["#1E3A5F", "#4A90D9"]
      background: "#F5F7FA"
      accents: ["#00B4D8", "#48CAE4"]
    visual_elements: "Clean lines, subtle gradients, geometric shapes"
    typography: "Modern sans-serif, professional"
    best_for: "Business, SaaS, enterprise"
---
```
