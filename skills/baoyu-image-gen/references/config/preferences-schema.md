---
name: preferences-schema
description: EXTEND.md YAML schema for baoyu-image-gen user preferences
---

# Preferences Schema

## Full Schema

```yaml
---
version: 1

default_provider: null      # google|openai|azure|openrouter|dashscope|minimax|replicate|zai|null (null = auto-detect)

default_quality: null       # normal|2k|null (null = use default: 2k)

default_aspect_ratio: null  # "16:9"|"1:1"|"4:3"|"3:4"|"2.35:1"|null

default_image_size: null    # 1K|2K|4K|null (Google/OpenRouter, overrides quality)

default_model:
  google: null              # e.g., "gemini-3-pro-image-preview", "gemini-3.1-flash-image-preview"
  openai: null              # e.g., "gpt-image-1.5", "gpt-image-1"
  azure: null               # Azure deployment name, e.g., "gpt-image-1.5" or "image-prod"
  openrouter: null          # e.g., "google/gemini-3.1-flash-image-preview"
  dashscope: null           # e.g., "qwen-image-2.0-pro"
  minimax: null             # e.g., "image-01"
  replicate: null           # e.g., "google/nano-banana-pro"
  zai: null                 # e.g., "glm-image", "cogview-4-250304"

batch:
  max_workers: 10
  provider_limits:
    replicate:
      concurrency: 5
      start_interval_ms: 700
    google:
      concurrency: 3
      start_interval_ms: 1100
    openai:
      concurrency: 3
      start_interval_ms: 1100
    azure:
      concurrency: 3
      start_interval_ms: 1100
    openrouter:
      concurrency: 3
      start_interval_ms: 1100
    dashscope:
      concurrency: 3
      start_interval_ms: 1100
    minimax:
      concurrency: 3
      start_interval_ms: 1100
    zai:
      concurrency: 3
      start_interval_ms: 1100
---
```

## Field Reference

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `version` | int | 1 | Schema version |
| `default_provider` | string\|null | null | Default provider (null = auto-detect) |
| `default_quality` | string\|null | null | Default quality (null = 2k) |
| `default_aspect_ratio` | string\|null | null | Default aspect ratio |
| `default_image_size` | string\|null | null | Google/OpenRouter image size (overrides quality) |
| `default_model.google` | string\|null | null | Google default model |
| `default_model.openai` | string\|null | null | OpenAI default model |
| `default_model.azure` | string\|null | null | Azure default deployment name |
| `default_model.openrouter` | string\|null | null | OpenRouter default model |
| `default_model.dashscope` | string\|null | null | DashScope default model |
| `default_model.minimax` | string\|null | null | MiniMax default model |
| `default_model.replicate` | string\|null | null | Replicate default model |
| `default_model.zai` | string\|null | null | Z.AI default model (glm-image / cogview-4-*) |
| `batch.max_workers` | int\|null | 10 | Batch worker cap |
| `batch.provider_limits.<provider>.concurrency` | int\|null | provider default | Max simultaneous requests per provider |
| `batch.provider_limits.<provider>.start_interval_ms` | int\|null | provider default | Minimum gap between request starts per provider |

## Examples

**Minimal**:
```yaml
---
version: 1
default_provider: google
default_quality: 2k
---
```

**Full**:
```yaml
---
version: 1
default_provider: google
default_quality: 2k
default_aspect_ratio: "16:9"
default_image_size: 2K
default_model:
  google: "gemini-3-pro-image-preview"
  openai: "gpt-image-1.5"
  azure: "gpt-image-1.5"
  openrouter: "google/gemini-3.1-flash-image-preview"
  dashscope: "qwen-image-2.0-pro"
  minimax: "image-01"
  replicate: "google/nano-banana-pro"
  zai: "glm-image"
batch:
  max_workers: 10
  provider_limits:
    replicate:
      concurrency: 5
      start_interval_ms: 700
    azure:
      concurrency: 3
      start_interval_ms: 1100
    openrouter:
      concurrency: 3
      start_interval_ms: 1100
    minimax:
      concurrency: 3
      start_interval_ms: 1100
    zai:
      concurrency: 3
      start_interval_ms: 1100
---
```
