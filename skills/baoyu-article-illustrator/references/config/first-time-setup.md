---
name: first-time-setup
description: First-time setup flow for baoyu-article-illustrator preferences
---

# First-Time Setup

When no EXTEND.md is found, run this setup.

**⛔ BLOCKING**: complete it before ANY other workflow step — do not ask about reference images, content, or type/style, and do not start content analysis. Ask only these questions, save EXTEND.md, then continue.

## Questions

Ask in the user's input or preferred language (not always English), in a single AskUserQuestion with all questions (it auto-adds "Other"):

### Question 1: Watermark

```
header: "Watermark"
question: "Watermark text for generated illustrations? Type your watermark content (e.g., name, @handle)"
options:
  - label: "No watermark (Recommended)"
    description: "No watermark, can enable later in EXTEND.md"
```

Position defaults to bottom-right.

### Question 2: Preferred Style

```
header: "Style"
question: "Default illustration style preference? Or type another style name or your custom style"
options:
  - label: "sketch-notes (Recommended)"
    description: "Warm cream paper, black hand-drawn lines, soft pastel blocks — educational infographic feel. Great default for most articles."
  - label: "None"
    description: "Auto-select based on content analysis (falls back to sketch-notes when no strong signal)"
  - label: "notion"
    description: "Minimalist hand-drawn line art"
  - label: "warm"
    description: "Friendly, approachable, personal"
```

### Question 3: Output Directory

```
header: "Output Directory"
question: "Where to save generated illustrations when illustrating a file?"
options:
  - label: "imgs-subdir (Recommended)"
    description: "{article-dir}/imgs/ — images in a subdirectory next to the article"
  - label: "same-dir"
    description: "{article-dir}/ — images alongside the article file"
  - label: "illustrations-subdir"
    description: "{article-dir}/illustrations/ — separate illustrations subdirectory"
  - label: "independent"
    description: "illustrations/{topic-slug}/ — standalone directory in cwd"
```

### Question 4: Save Location

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
| Project | `.baoyu-skills/baoyu-article-illustrator/EXTEND.md` | Current project |
| User | `~/.baoyu-skills/baoyu-article-illustrator/EXTEND.md` | All projects |

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
preferred_style:
  name: [selected style or null]
  description: ""
default_output_dir: imgs-subdir  # same-dir | imgs-subdir | illustrations-subdir | independent
language: null
preferred_image_backend: auto
generation_batch_size: 4
custom_styles: []
---
```

`preferred_image_backend: auto` and `generation_batch_size: 4` are baked-in defaults — setup does not ask about them. The current request may override the batch size for one run.

Later changes: `## Changing Preferences` in `SKILL.md`; full schema: `preferences-schema.md`.
