---
name: first-time-setup
description: First-time setup and default model selection flow for baoyu-image-gen
---

# First-Time Setup

Triggered when:
1. No EXTEND.md found → full setup (Flow 1), create EXTEND.md
2. EXTEND.md found but `default_model.[provider]` is null → model question only (Flow 2), update EXTEND.md

Then continue with generation. Ask in the user's input language or saved language preference.

## Flow 1: Full Setup

Use AskUserQuestion with ALL questions in ONE call:

1. **Provider**:

```yaml
header: "Provider"
question: "Default image generation provider?"
options:
  - label: "Google (Recommended)"
    description: "Gemini multimodal - high quality, reference images, flexible sizes"
  - label: "OpenAI"
    description: "GPT Image 2 - latest OpenAI image model, reference-image workflows"
  - label: "Azure OpenAI"
    description: "Azure-hosted GPT Image deployments with resource-specific routing"
  - label: "OpenRouter"
    description: "Router for Gemini/FLUX/OpenAI-compatible image models"
  - label: "DashScope"
    description: "Alibaba Cloud - Qwen-Image, strong Chinese/English text rendering"
  - label: "Z.AI"
    description: "GLM-image, strong poster and text-heavy image generation"
  - label: "MiniMax"
    description: "MiniMax image generation with subject-reference character workflows"
  - label: "Replicate"
    description: "Curated Replicate image families - nano-banana-2, Seedream, and Wan image models"
  - label: "Agnes"
    description: "Sapiens AI Agnes - optimized for high information density, complex layouts, reference-image support"
```

2. **Model** — only for these choices, using the matching question under [Model Questions](#model-questions): Google (also when auto-detect / no explicit provider), OpenRouter, Azure OpenAI, MiniMax, Z.AI.

3. **Quality**:

```yaml
header: "Quality"
question: "Default image quality?"
options:
  - label: "2k (Recommended)"
    description: "2048px - covers, illustrations, infographics"
  - label: "normal"
    description: "1024px - quick previews, drafts"
```

4. **Save location**:

```yaml
header: "Save"
question: "Where to save preferences?"
options:
  - label: "Project (Recommended)"
    description: ".baoyu-skills/ (this project only)"
  - label: "User"
    description: "~/.baoyu-skills/ (all projects)"
```

| Choice | Path | Scope |
|--------|------|-------|
| Project | `.baoyu-skills/baoyu-image-gen/EXTEND.md` | Current project |
| User | `$HOME/.baoyu-skills/baoyu-image-gen/EXTEND.md` | All projects |

EXTEND.md template:

```yaml
---
version: 1
default_provider: [selected provider or null]
default_quality: [selected quality]
default_aspect_ratio: null
default_image_size: null
default_image_api_dialect: null
default_model:
  google: [selected google model or null]
  openai: null
  azure: [selected azure deployment or null]
  openrouter: [selected openrouter model or null]
  dashscope: null
  zai: [selected Z.AI model or null]
  minimax: [selected minimax model or null]
  replicate: null
  agnes: null
---
```

If the user picks `OpenAI` but says the endpoint is only OpenAI-compatible and fronts another image model family, save `default_image_api_dialect: ratio-metadata` only when they confirm the gateway expects aspect-ratio `size` plus metadata-based resolution. Otherwise leave it `null` / `openai-native`.

## Flow 2: Model Only

Ask ONLY the model question for the current provider (below). Then:

1. Read existing EXTEND.md
2. If `default_model:` exists → update the provider-specific key
3. If `default_model:` is missing → add the full section:

```yaml
default_model:
  google: [value or null]
  openai: [value or null]
  azure: [value or null]
  openrouter: [value or null]
  dashscope: [value or null]
  zai: [value or null]
  minimax: [value or null]
  replicate: [value or null]
  agnes: [value or null]
```

Only set the selected provider's model; leave others as their current value or null.

## Model Questions

Model details and limits: `references/providers/*.md`.

### Google

```yaml
header: "Google Model"
question: "Default Google image generation model?"
options:
  - label: "gemini-3-pro-image (Recommended)"
    description: "Highest quality, best for production use"
  - label: "gemini-3.1-flash-image"
    description: "Fast generation, good quality, lower cost"
  - label: "gemini-3.1-flash-lite-image"
    description: "Cheapest and fastest; 1K output only"
  - label: "gemini-3-flash-preview"
    description: "Fast generation, balanced quality and speed"
```

### OpenAI

```yaml
header: "OpenAI Model"
question: "Default OpenAI image generation model?"
options:
  - label: "gpt-image-2.5-flare (Recommended)"
    description: "Latest GPT Image model, fastest; flexible sizes up to 4K, high-fidelity image inputs"
  - label: "gpt-image-2.5-sunburst"
    description: "Most capable GPT Image model for complex scenes and precise edits; slower"
  - label: "gpt-image-2"
    description: "Previous GPT Image generation, flexible sizes up to 4K"
  - label: "gpt-image-1.5"
    description: "Previous GPT Image model"
  - label: "gpt-image-1"
    description: "Earlier GPT Image model"
```

### Azure

```yaml
header: "Azure Deploy"
question: "Default Azure image deployment name?"
options:
  - label: "gpt-image-2.5-flare (Recommended)"
    description: "Use when your Azure deployment name matches the GPT Image 2.5 Flare model"
  - label: "gpt-image-2.5-sunburst"
    description: "Use when your Azure deployment name matches the GPT Image 2.5 Sunburst model"
  - label: "gpt-image-2"
    description: "Use when your Azure deployment name matches the GPT Image 2 model"
  - label: "gpt-image-1.5"
    description: "Use when your Azure deployment name matches the GPT Image 1.5 model"
  - label: "gpt-image-1"
    description: "Use when your Azure deployment name matches GPT-image-1"
```

Azure `--model` / `default_model.azure` is the deployment name, not the model family. If the deployment name is custom, save that exact name.

### OpenRouter

```yaml
header: "OpenRouter Model"
question: "Default OpenRouter image generation model?"
options:
  - label: "google/gemini-3.1-flash-image (Recommended)"
    description: "Recommended for image output and reference-image edits"
  - label: "google/gemini-2.5-flash-image-preview"
    description: "Fast preview-oriented image generation"
  - label: "black-forest-labs/flux.2-pro"
    description: "High-quality text-to-image through OpenRouter"
```

### DashScope

```yaml
header: "DashScope Model"
question: "Default DashScope image generation model?"
options:
  - label: "qwen-image-2.0-pro (Recommended)"
    description: "Best-verified DashScope model for text rendering and custom sizes"
  - label: "qwen-image-3.0-pro"
    description: "Newest Qwen flagship; same sizing rules, not yet the built-in default"
  - label: "qwen-image-2.0"
    description: "Faster 2.0 variant with flexible output size"
  - label: "qwen-image-max"
    description: "Legacy Qwen model with five fixed output sizes"
  - label: "qwen-image-plus"
    description: "Legacy Qwen model, same current capability as qwen-image"
  - label: "wan2.7-image-pro"
    description: "Wan 2.7 Pro — supports up to 4K text-to-image and reference-image editing"
  - label: "wan2.7-image"
    description: "Wan 2.7 base — faster generation, up to 2K, supports reference-image editing"
  - label: "z-image-turbo"
    description: "Legacy DashScope model for compatibility"
  - label: "z-image-ultra"
    description: "Legacy DashScope model, higher quality but slower"
```

### Z.AI

```yaml
header: "Z.AI Model"
question: "Default Z.AI image generation model?"
options:
  - label: "glm-image (Recommended)"
    description: "Current flagship image model with better text rendering and poster layouts"
  - label: "cogview-4-250304"
    description: "Legacy model on the sync image endpoint"
```

### Replicate

```yaml
header: "Replicate Model"
question: "Default Replicate image generation model?"
options:
  - label: "google/nano-banana-2 (Recommended)"
    description: "Current default for general Replicate image generation in baoyu-image-gen"
  - label: "bytedance/seedream-4.5"
    description: "Replicate Seedream 4.5 with validated local size/ref guardrails"
  - label: "bytedance/seedream-5-lite"
    description: "Replicate Seedream 5 Lite with validated local size/ref guardrails"
  - label: "wan-video/wan-2.7-image-pro"
    description: "Replicate Wan 2.7 Image Pro with 4K text-to-image support"
```

### MiniMax

```yaml
header: "MiniMax Model"
question: "Default MiniMax image generation model?"
options:
  - label: "image-01 (Recommended)"
    description: "Best general-purpose MiniMax image model with custom width/height support"
  - label: "image-01-live"
    description: "Lower-latency MiniMax image model using aspect ratios"
```

## After Setup

1. Create directory if needed
2. Write/update EXTEND.md with frontmatter
3. Confirm: "Preferences saved to [path]"
4. Continue with image generation
