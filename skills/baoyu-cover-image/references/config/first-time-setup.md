---
name: first-time-setup
description: First-time setup flow for baoyu-cover-image preferences
---

# First-Time Setup

## Overview

When no EXTEND.md is found, guide user through preference setup.

## Setup Flow

```
No EXTEND.md found
        │
        ▼
┌─────────────────────┐
│ AskUserQuestion     │
│ (all questions)     │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Create EXTEND.md    │
└─────────────────────┘
        │
        ▼
    Continue to Step 1
```

## Questions

**Language**: Use user's input language or saved language preference.

Use single AskUserQuestion with multiple questions (AskUserQuestion auto-adds "Other" option):

### Question 1: Watermark

```
header: "Watermark"
question: "Watermark text for generated cover images? Type your watermark content (e.g., name, @handle)"
options:
  - label: "No watermark (Recommended)"
    description: "No watermark, can enable later in EXTEND.md"
```

Position defaults to bottom-right.

### Question 2: Preferred Type

```
header: "Type"
question: "Default cover type preference?"
options:
  - label: "None (Recommended)"
    description: "Auto-select based on content analysis"
  - label: "hero"
    description: "Large visual impact - product launch, announcements"
  - label: "conceptual"
    description: "Concept visualization - technical, architecture"
  - label: "typography"
    description: "Text-focused layout - opinions, quotes"
```

### Question 3: Preferred Style

```
header: "Style"
question: "Default cover style preference? Or type another style name"
options:
  - label: "None (Recommended)"
    description: "Auto-select based on content analysis"
  - label: "elegant"
    description: "Refined, sophisticated - professional business"
  - label: "blueprint"
    description: "Technical schematics - architecture/system design"
  - label: "notion"
    description: "SaaS dashboard - productivity/tech content"
```

### Question 4: Default Aspect Ratio

```
header: "Aspect"
question: "Default aspect ratio for cover images?"
options:
  - label: "2.35:1 (Recommended)"
    description: "Cinematic widescreen, best for article headers"
  - label: "16:9"
    description: "Standard widescreen, versatile"
  - label: "1:1"
    description: "Square, social media friendly"
```

### Question 5: Save Location

```
header: "Save"
question: "Where to save preferences?"
options:
  - label: "Project"
    description: ".baoyu-skills/ (this project only)"
  - label: "User"
    description: "~/.baoyu-skills/ (all projects)"
```

## Save Locations

| Choice | Path | Scope |
|--------|------|-------|
| Project | `.baoyu-skills/baoyu-cover-image/EXTEND.md` | Current project |
| User | `~/.baoyu-skills/baoyu-cover-image/EXTEND.md` | All projects |

## After Setup

1. Create directory if needed
2. Write EXTEND.md with frontmatter
3. Confirm: "Preferences saved to [path]"
4. Continue to Step 1

## EXTEND.md Template

```yaml
---
version: 1
watermark:
  enabled: [true/false]
  content: "[user input or empty]"
  position: bottom-right
  opacity: 0.7
preferred_type: [selected type or null]
preferred_style: [selected style or null]
default_aspect: [2.35:1/16:9/1:1]
language: null
custom_styles: []
---
```

## Modifying Preferences Later

Users can edit EXTEND.md directly or run setup again:
- Delete EXTEND.md to trigger setup
- Edit YAML frontmatter for quick changes
- Full schema: `config/preferences-schema.md`
