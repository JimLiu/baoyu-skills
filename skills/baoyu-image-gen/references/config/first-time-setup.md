---
name: first-time-setup
description: First-time setup and default model selection flow for baoyu-image-gen
---

# First-Time Setup

## Overview

Triggered when:
1. No EXTEND.md found -> full setup (provider + model + preferences)
2. EXTEND.md found but `default_model.[provider]` is null -> model selection only

## Flow 1: No EXTEND.md (Full Setup)

Use AskUserQuestion with all questions in one call.

### Question 1: Default Provider

```yaml
header: "Provider"
question: "Default image generation provider?"
options:
  - label: "Replicate (Recommended)"
    description: "Default to google/nano-banana-pro, flexible model selection, strong general-purpose generation"
  - label: "Google"
    description: "Gemini multimodal, good for reference-image workflows"
  - label: "OpenAI"
    description: "GPT Image via OPENAI_API_KEY, strong text rendering and edits"
  - label: "DashScope"
    description: "Alibaba Cloud image generation"
```

### Question 2: Provider Model

Ask the model question that matches the chosen provider:

- Replicate -> use the Replicate model question, recommend `google/nano-banana-pro`
- Google -> use the Google model question
- OpenAI -> use the OpenAI model question, recommend `gpt-image-1.5`
- DashScope -> use the DashScope model question

### Question 3: Default Quality

```yaml
header: "Quality"
question: "Default image quality?"
options:
  - label: "2k (Recommended)"
    description: "2048px, suitable for covers and production use"
  - label: "normal"
    description: "1024px, suitable for previews and drafts"
```

### Question 4: Save Location

```yaml
header: "Save"
question: "Where to save preferences?"
options:
  - label: "Project (Recommended)"
    description: ".baoyu-skills/ for this project"
  - label: "User"
    description: "~/.baoyu-skills/ for all projects"
```

### Save Locations

| Choice | Path | Scope |
|--------|------|-------|
| Project | `.baoyu-skills/baoyu-image-gen/EXTEND.md` | Current project |
| User | `$HOME/.baoyu-skills/baoyu-image-gen/EXTEND.md` | All projects |

### EXTEND.md Template

```yaml
---
version: 1
default_provider: [selected provider or null]
default_quality: [selected quality]
default_aspect_ratio: null
default_image_size: null
default_model:
  google: [selected google model or null]
  openai: [selected openai model or null]
  dashscope: [selected dashscope model or null]
  replicate: [selected replicate model or null]
---
```

## Flow 2: EXTEND.md Exists, Model Null

When EXTEND.md exists but `default_model.[current_provider]` is null, ask only the model question for the current provider.

### Google Model Selection

```yaml
header: "Google Model"
question: "Choose a default Google image generation model?"
options:
  - label: "gemini-3-pro-image-preview (Recommended)"
    description: "Highest quality, best for production use"
  - label: "gemini-3.1-flash-image-preview"
    description: "Fast generation, good quality, lower cost"
  - label: "gemini-3-flash-preview"
    description: "Fast generation, balanced quality and speed"
```

### OpenAI Model Selection

```yaml
header: "OpenAI Model"
question: "Choose a default OpenAI image generation model?"
options:
  - label: "gpt-image-1.5 (Recommended)"
    description: "Latest GPT Image model, best default for OpenAI"
  - label: "gpt-image-1"
    description: "Previous generation GPT Image model"
```

### DashScope Model Selection

```yaml
header: "DashScope Model"
question: "Choose a default DashScope image generation model?"
options:
  - label: "z-image-turbo (Recommended)"
    description: "Fast generation, good quality"
  - label: "z-image-ultra"
    description: "Higher quality, slower generation"
```

### Replicate Model Selection

```yaml
header: "Replicate Model"
question: "Choose a default Replicate image generation model?"
options:
  - label: "google/nano-banana-pro (Recommended)"
    description: "Default recommended model for this skill"
  - label: "google/nano-banana"
    description: "Base nano-banana model on Replicate"
```

## After Setup

1. Create directory if needed
2. Write or update EXTEND.md
3. Confirm the save path
4. Continue with image generation
