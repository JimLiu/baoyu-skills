# Image Generation Guidelines

Skills that require image generation MUST delegate to available image generation tools (runtime-native tools or installed skills).

**Backend selection convention**: see [image-generation-tools.md](image-generation-tools.md) for the runtime-neutral rule. Short version: use whatever backend is available; if multiple, ask the user once; if none, ask how to proceed. This document covers output conventions (naming, paths) that apply regardless of which backend is selected.

## Skill Selection

1. Follow the rule in [image-generation-tools.md](image-generation-tools.md): use whatever backend is available; ask only on ambiguity.
2. Read the chosen backend's documentation for parameters and capabilities.
3. If user requests a specific backend, honor it.

## Generation Flow Template

```markdown
### Step N: Generate Images

**Backend Selection**:
1. Detect available image-generation tools/skills (runtime-native + installed)
2. If one available → use it. If multiple → ask user once. If none → ask how to proceed.
3. Read the chosen backend's docs for parameters

**Generation Flow**:
1. Write the full prompt to `prompts/NN-{type}-[slug].md` BEFORE invoking the backend
2. Call backend with the prompt (or prompt file), output path, and parameters
3. Generate sequentially by default (batch parallel only when backend supports it and user has multiple prompts)
4. Output progress: "Generated X/N"
5. On failure, auto-retry once before reporting error
```

**Batch Parallel** (`baoyu-imagine` only): concurrent workers with per-provider throttling via `batch.max_workers` in EXTEND.md.

## Output Path Convention

**Output Directory**: `<skill-suffix>/<topic-slug>/`
- `<skill-suffix>`: e.g., `xhs-images`, `cover-image`, `slide-deck`, `comic`
- `<topic-slug>`: 2-4 words, kebab-case from content topic
- Conflict: append timestamp `<topic-slug>-YYYYMMDD-HHMMSS`

**Source Files**: Copy to output dir as `source-{slug}.{ext}`

## Image Naming Convention

**Format**: `NN-{type}-[slug].png`
- `NN`: Two-digit sequence (01, 02, ...)
- `{type}`: cover, content, page, slide, illustration, etc.
- `[slug]`: 2-5 word kebab-case descriptor, unique within directory

Examples:
```
01-cover-ai-future.png
02-content-key-benefits.png
03-slide-architecture-overview.png
```
