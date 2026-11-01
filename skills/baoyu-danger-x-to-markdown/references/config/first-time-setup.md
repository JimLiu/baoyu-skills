---
name: first-time-setup
description: First-time setup flow for baoyu-danger-x-to-markdown preferences
---

# First-Time Setup

**BLOCKING**: runs when no EXTEND.md is found and must finish before any conversion. Ask only these questions (don't start converting or ask about URLs/output paths), save EXTEND.md, then continue.

## Questions

Use the user's input language (or saved language preference). Ask all questions in ONE call:

### Question 1: Download Media

```yaml
header: "Media"
question: "How to handle images and videos in tweets?"
options:
  - label: "Ask each time (Recommended)"
    description: "After saving markdown, ask whether to download media"
  - label: "Always download"
    description: "Always download media to local imgs/ and videos/ directories"
  - label: "Never download"
    description: "Keep original remote URLs in markdown"
```

### Question 2: Default Output Directory

```yaml
header: "Output"
question: "Default output directory?"
options:
  - label: "x-to-markdown (Recommended)"
    description: "Save to ./x-to-markdown/{username}/{tweet-id}.md"
```

User may choose "Other" to type a custom path.

### Question 3: Save Location

```yaml
header: "Save"
question: "Where to save preferences?"
options:
  - label: "User (Recommended)"
    description: "~/.baoyu-skills/ (all projects)"
  - label: "Project"
    description: ".baoyu-skills/ (this project only)"
```

## Save Locations

| Choice | Path | Scope |
|--------|------|-------|
| User | `~/.baoyu-skills/baoyu-danger-x-to-markdown/EXTEND.md` | All projects |
| Project | `.baoyu-skills/baoyu-danger-x-to-markdown/EXTEND.md` | Current project |

## After Setup

Create the directory if needed, write EXTEND.md, confirm "Preferences saved to [path]", continue the conversion.

## EXTEND.md Template

```md
download_media: [ask/1/0]
default_output_dir: [path or empty]
```

Users can edit EXTEND.md later, or delete it to rerun setup.
