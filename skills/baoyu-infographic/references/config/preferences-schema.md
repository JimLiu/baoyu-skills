---
name: preferences-schema
description: EXTEND.md YAML schema for baoyu-infographic user preferences
---

# Preferences Schema

## Full Schema

```yaml
---
version: 1

preferred_layout: null    # any of the 21 layouts (see Layout Gallery in SKILL.md) or null
preferred_style: null     # any of the 21 styles (see Style Gallery in SKILL.md) or null
preferred_aspect: null    # landscape|portrait|square|null  (custom W:H also accepted)

language: null            # zh|en|ja|ko|null (null = auto-detect from source)

custom_styles:            # extra style definitions merged with the 21 built-ins
  - name: my-brand
    description: "Short description shown in Step 3 recommendations"
    prompt_fragment: "Style traits to inject into Step 5 prompt"
---
```

## Field Reference

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `version` | int | 1 | Schema version |
| `preferred_layout` | string\|null | null | Pre-selected layout — surfaces as the top recommendation in Step 3 |
| `preferred_style` | string\|null | null | Pre-selected style — surfaces as the top recommendation in Step 3 |
| `preferred_aspect` | string\|null | null | Default aspect for Step 4 (named preset or W:H string) |
| `language` | string\|null | null | Output language (null = auto-detect from source content) |
| `custom_styles` | array | [] | Additional styles available alongside the 21 built-ins |

## Layout Options

See the **Layout Gallery (21)** table in `SKILL.md` for the canonical list. Common picks:

| Value | Best For |
|-------|----------|
| `bento-grid` | General default — overview, multiple topics |
| `linear-progression` | Timelines, processes, tutorials |
| `dense-modules` | High-density modules, data-rich guides |
| `hub-spoke` | Central concept with related items |
| `dashboard` | Metrics, KPIs |

## Style Options

See the **Style Gallery (21)** table in `SKILL.md` for the canonical list. Common picks:

| Value | Description |
|-------|-------------|
| `craft-handmade` | Hand-drawn, paper craft (default) |
| `corporate-memphis` | Flat vector, vibrant |
| `morandi-journal` | Hand-drawn doodle, warm Morandi tones |
| `pop-laboratory` | Blueprint grid, lab precision |
| `retro-pop-grid` | 1970s retro pop art, Swiss grid |

## Aspect Options

| Value | Ratio | Notes |
|-------|-------|-------|
| `landscape` | 16:9 | Slides, blog headers, web banners |
| `portrait` | 9:16 | Mobile, social, dense modules (default for `dense-modules`) |
| `square` | 1:1 | Social posts, thumbnails |
| Custom W:H | e.g. `3:4`, `4:3`, `2.35:1` | Pass through verbatim to the prompt |

## Custom Style Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique style identifier (kebab-case) |
| `description` | Yes | One-line description shown in Step 3 recommendations |
| `prompt_fragment` | Yes | Style traits appended into the Step 5 prompt body |

## Example: Minimal Preferences

```yaml
---
version: 1
preferred_layout: bento-grid
preferred_style: craft-handmade
language: zh
---
```

## Example: Full Preferences

```yaml
---
version: 1

preferred_layout: dense-modules
preferred_style: morandi-journal
preferred_aspect: portrait

language: zh

custom_styles:
  - name: my-brand
    description: "Brand-aligned warm pastel infographic"
    prompt_fragment: "Use brand pastel palette (#F2C7B6, #B6D7E8, #C8E0B4); rounded rectangles; warm hand-drawn outlines; ample whitespace."
---
```
