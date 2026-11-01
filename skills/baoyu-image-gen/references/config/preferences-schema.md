---
name: preferences-schema
description: EXTEND.md YAML schema for baoyu-image-gen user preferences
---

# Preferences Schema

```yaml
---
version: 1                  # schema version

default_provider: null      # google|openai|azure|openrouter|dashscope|zai|minimax|replicate|jimeng|seedream|codex-cli|agnes|null (null = auto-detect; codex-cli is never auto-detected — pin it here or via --provider)

default_quality: null       # normal|2k|null (null = use default: 2k)

default_aspect_ratio: null  # "16:9"|"1:1"|"4:3"|"3:4"|"2.35:1"|null

default_image_size: null    # 1K|2K|4K|null (Google/OpenRouter, overrides quality)

default_image_api_dialect: null  # openai-native|ratio-metadata|null (OpenAI-compatible gateways; null = use env/default)

default_model:
  google: null              # e.g., "gemini-3-pro-image", "gemini-3.1-flash-image", "gemini-3.1-flash-lite-image"
  openai: null              # e.g., "gpt-image-2.5-flare", "gpt-image-2.5-sunburst", "gpt-image-2", "gpt-image-1.5"
  azure: null               # Azure deployment name, e.g., "gpt-image-2.5-flare" or "image-prod"
  openrouter: null          # e.g., "google/gemini-3.1-flash-image"
  dashscope: null           # e.g., "qwen-image-3.0-pro", "qwen-image-2.0-pro"
  zai: null                 # e.g., "glm-image"
  minimax: null             # e.g., "image-01"
  replicate: null           # e.g., "google/nano-banana-2"
  codex-cli: null           # Logical label only — Codex image_gen has no user-selectable model. Default: "codex-image-gen"
  agnes: null               # e.g., "agnes-image-2.5-flash"

batch:
  max_workers: 10            # batch worker cap
  provider_limits:          # per provider: concurrency = max simultaneous requests; start_interval_ms = min gap between request starts (omitted = provider default)
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
    zai:
      concurrency: 3
      start_interval_ms: 1100
    minimax:
      concurrency: 3
      start_interval_ms: 1100
    codex-cli:
      concurrency: 1
      start_interval_ms: 2000
    agnes:
      concurrency: 3
      start_interval_ms: 1100
---
```

## Minimal Example

```yaml
---
version: 1
default_provider: google
default_quality: 2k
default_image_api_dialect: null
---
```
