---
name: first-time-setup
description: First-time setup flow for baoyu-translate preferences
---

# First-Time Setup

**BLOCKING**: runs when no EXTEND.md is found and must finish before any translation. Ask only these questions (don't start translating or ask about files/output paths), save EXTEND.md, then continue.

## Questions

Use the user's input language (or saved language preference). Ask all questions in ONE call:

### Question 1: Target Language

```yaml
header: "Target Language"
question: "Default target language?"
options:
  - label: "简体中文 zh-CN (Recommended)"
    description: "Translate to Simplified Chinese"
  - label: "繁體中文 zh-TW"
    description: "Translate to Traditional Chinese"
  - label: "English en"
    description: "Translate to English"
  - label: "日本語 ja"
    description: "Translate to Japanese"
```

Note: User may type a custom language code.

### Question 2: Translation Mode

```yaml
header: "Mode"
question: "Default translation mode?"
options:
  - label: "Normal (Recommended)"
    description: "Analyze content first, then translate"
  - label: "Quick"
    description: "Direct translation, no analysis"
  - label: "Refined"
    description: "Full workflow: analyze → translate → review → polish"
```

### Question 3: Target Audience

```yaml
header: "Audience"
question: "Default target audience?"
options:
  - label: "General readers (Recommended)"
    description: "Plain language, more translator's notes for jargon"
  - label: "Technical"
    description: "Developers/engineers, less annotation on tech terms"
  - label: "Academic"
    description: "Formal register, precise terminology"
  - label: "Business"
    description: "Business-friendly tone, explain tech concepts"
```

Note: User may type a custom audience description.

### Question 4: Translation Style

```yaml
header: "Style"
question: "Translation style?"
options:
  - label: "Storytelling (Recommended)"
    description: "Engaging narrative flow, smooth transitions"
  - label: "Formal"
    description: "Professional, structured, neutral tone"
  - label: "Technical"
    description: "Precise, documentation-style, concise"
  - label: "Literal"
    description: "Close to original structure"
  - label: "Academic"
    description: "Scholarly, rigorous, formal register"
  - label: "Business"
    description: "Concise, results-focused, action-oriented"
  - label: "Humorous"
    description: "Preserves humor, witty, playful"
  - label: "Conversational"
    description: "Casual, friendly, spoken-like"
  - label: "Elegant"
    description: "Literary, polished, aesthetically refined"
```

Note: User may type a custom style description.

### Question 5: Save Location

```yaml
header: "Save"
question: "Where to save preferences?"
options:
  - label: "User (Recommended)"
    description: "$HOME/.baoyu-skills/ (all projects)"
  - label: "Project"
    description: ".baoyu-skills/ (this project only)"
```

## Save Locations

| Choice | Path | Scope |
|--------|------|-------|
| User | `$HOME/.baoyu-skills/baoyu-translate/EXTEND.md` | All projects |
| Project | `.baoyu-skills/baoyu-translate/EXTEND.md` | Current project |

## After Setup

1. Create the directory if needed; write EXTEND.md with the selected values
2. Confirm: "Preferences saved to [path]"
3. Mention: "You can add custom glossary terms to EXTEND.md anytime. See the `glossary` section in the file for the format."
4. Continue the translation

## EXTEND.md Template

```yaml
target_language: [zh-CN/zh-TW/en/ja/...]
default_mode: [quick/normal/refined]
audience: [general/technical/academic/business/custom]
style: [storytelling/formal/technical/literal/academic/business/humorous/conversational/elegant]

# Custom glossary (optional) — add your own term translations here
# glossary:
#   - from: "Term"
#     to: "翻译"
#   - from: "Another Term"
#     to: "另一个翻译"
#     note: "Usage context"
```

Users can edit EXTEND.md later, or delete it to rerun setup.
