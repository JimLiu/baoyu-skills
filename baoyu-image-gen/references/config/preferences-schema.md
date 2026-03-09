---
name: preferences-schema
description: EXTEND.md YAML schema for baoyu-image-gen user preferences
---

# Preferences Schema

## Full Schema

```yaml
---
version: 1

default_provider: null      # google|openai|dashscope|replicate|null (null = auto-detect, prefers replicate when multiple keys are available)

default_quality: null       # normal|2k|null (null = use default: 2k)

default_aspect_ratio: null  # "16:9"|"1:1"|"4:3"|"3:4"|"2.35:1"|null

default_image_size: null    # 1K|2K|4K|null (Google only, overrides quality)

default_model:
  google: null              # e.g. "gemini-3-pro-image-preview", "gemini-3.1-flash-image-preview"
  openai: null              # e.g. "gpt-image-1.5", "gpt-image-1"
  dashscope: null           # e.g. "z-image-turbo"
  replicate: null           # e.g. "google/nano-banana-pro"

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
    dashscope:
      concurrency: 3
      start_interval_ms: 1100
---
```

## Field Reference

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `version` | int | 1 | Schema version |
| `default_provider` | string\|null | null | Default provider (`null` = auto-detect, preferring Replicate when multiple keys are available) |
| `default_quality` | string\|null | null | Default quality (`null` = `2k`) |
| `default_aspect_ratio` | string\|null | null | Default aspect ratio |
| `default_image_size` | string\|null | null | Google image size (overrides quality) |
| `default_model.google` | string\|null | null | Google default model |
| `default_model.openai` | string\|null | null | OpenAI default model |
| `default_model.dashscope` | string\|null | null | DashScope default model |
| `default_model.replicate` | string\|null | null | Replicate default model |
| `batch.max_workers` | int\|null | 10 | Batch worker cap |
| `batch.provider_limits.<provider>.concurrency` | int\|null | provider default | Max simultaneous requests per provider |
| `batch.provider_limits.<provider>.start_interval_ms` | int\|null | provider default | Minimum gap between request starts per provider |

## Examples

**Minimal**:

```yaml
---
version: 1
default_provider: replicate
default_quality: 2k
---
```

**Full**:

```yaml
---
version: 1
default_provider: replicate
default_quality: 2k
default_aspect_ratio: "16:9"
default_image_size: 2K
default_model:
  google: "gemini-3-pro-image-preview"
  openai: "gpt-image-1.5"
  dashscope: "z-image-turbo"
  replicate: "google/nano-banana-pro"
batch:
  max_workers: 10
  provider_limits:
    replicate:
      concurrency: 5
      start_interval_ms: 700
--- 
```
