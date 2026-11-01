---
name: first-time-setup
description: First-time setup flow for baoyu-infographic preferences
---

# First-Time Setup

When no EXTEND.md is found, run this setup before generating any infographic.

**⛔ BLOCKING**: complete it before ANY other workflow step — do not ask about source content, topic, layout, style, or aspect, and do not begin Step 1.2. Ask only these questions, save EXTEND.md, then continue to Step 1.2.

## Questions

Ask in the user's input language (not always English), in a single `AskUserQuestion` with all questions (the runtime auto-adds "Other"):

### Question 1: Preferred Layout

```
header: "Layout"
question: "Default layout preference?"
options:
  - label: "Auto-select (Recommended)"
    description: "Pick layout per content in Step 3"
  - label: "bento-grid"
    description: "Multiple topics, overview (general default)"
  - label: "linear-progression"
    description: "Timelines, processes, tutorials"
  - label: "dense-modules"
    description: "High-density modules, data-rich guides"
```

### Question 2: Preferred Style

```
header: "Style"
question: "Default visual style preference?"
options:
  - label: "Auto-select (Recommended)"
    description: "Pick style per tone in Step 3"
  - label: "craft-handmade"
    description: "Hand-drawn, paper craft (general default)"
  - label: "corporate-memphis"
    description: "Flat vector, vibrant"
  - label: "morandi-journal"
    description: "Hand-drawn doodle, warm Morandi tones"
```

### Question 3: Preferred Aspect

```
header: "Aspect"
question: "Default aspect ratio?"
options:
  - label: "Auto-select (Recommended)"
    description: "Pick per layout in Step 4"
  - label: "landscape"
    description: "16:9 (slides, blogs, web)"
  - label: "portrait"
    description: "9:16 (mobile, social, dense modules)"
  - label: "square"
    description: "1:1 (social, thumbnails)"
```

### Question 4: Language

```
header: "Language"
question: "Output language for infographic text?"
options:
  - label: "Auto-detect (Recommended)"
    description: "Match source content language"
  - label: "zh"
    description: "Chinese (中文)"
  - label: "en"
    description: "English"
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
| Project | `.baoyu-skills/baoyu-infographic/EXTEND.md` | Current project |
| User | `~/.baoyu-skills/baoyu-infographic/EXTEND.md` | All projects |

XDG path (`${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-infographic/EXTEND.md`) is also recognized at read time but not offered as a save target during first-time setup.

## After Setup

1. Create the directory if needed
2. Write EXTEND.md with frontmatter (see template below)
3. Confirm: "Preferences saved to [path]"
4. Continue to Step 1.2

## EXTEND.md Template

```yaml
---
version: 1
preferred_layout: [selected layout or null]
preferred_style: [selected style or null]
preferred_aspect: [landscape|portrait|square|null]
language: [selected language or null]
preferred_image_backend: auto
custom_styles: []
---
```

`preferred_image_backend: auto` is the baked-in default — setup never asks about it.

Later changes: `## Changing Preferences` in `SKILL.md`; full schema: `references/config/preferences-schema.md`.
