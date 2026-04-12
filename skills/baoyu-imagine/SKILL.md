---
name: baoyu-imagine
description: AI image generation with OpenAI, Azure OpenAI, Google, OpenRouter, DashScope, MiniMax, Jimeng, Seedream and Replicate APIs. Supports text-to-image, reference images, aspect ratios, and batch generation from saved prompt files. Sequential by default; use batch parallel generation when the user already has multiple prompts or wants stable multi-image throughput. Use when user asks to generate, create, or draw images.
version: 1.56.4
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-imagine
    requires:
      anyBins:
        - bun
        - npx
---

# Image Generation (AI SDK)

Official API-based image generation. Supports OpenAI, Azure OpenAI, Google, OpenRouter, DashScope (阿里通义万象), MiniMax, Jimeng (即梦), Seedream (豆包) and Replicate providers.

## Script Directory

**Agent Execution**:
1. `{baseDir}` = this SKILL.md file's directory
2. Script path = `{baseDir}/scripts/main.ts`
3. Resolve `${BUN_X}` runtime: if `bun` installed → `bun`; if `npx` available → `npx -y bun`; else suggest installing bun

## Step 0: Load Preferences ⛔ BLOCKING

**CRITICAL**: This step MUST complete BEFORE any image generation. Do NOT skip or defer.

Check EXTEND.md existence (priority: project → user):

```bash
# macOS, Linux, WSL, Git Bash
test -f .baoyu-skills/baoyu-imagine/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-imagine/EXTEND.md" && echo "xdg"
test -f "$HOME/.baoyu-skills/baoyu-imagine/EXTEND.md" && echo "user"
```

```powershell
# PowerShell (Windows)
if (Test-Path .baoyu-skills/baoyu-imagine/EXTEND.md) { "project" }
$xdg = if ($env:XDG_CONFIG_HOME) { $env:XDG_CONFIG_HOME } else { "$HOME/.config" }
if (Test-Path "$xdg/baoyu-skills/baoyu-imagine/EXTEND.md") { "xdg" }
if (Test-Path "$HOME/.baoyu-skills/baoyu-imagine/EXTEND.md") { "user" }
```

| Result | Action |
|--------|--------|
| Found | Load, parse, apply settings. If `default_model.[provider]` is null → ask model only (Flow 2) |
| Not found | ⛔ Run first-time setup ([references/config/first-time-setup.md](references/config/first-time-setup.md)) → Save EXTEND.md → Then continue |

**CRITICAL**: If not found, complete the full setup (provider + model + quality + save location) using AskUserQuestion BEFORE generating any images. Generation is BLOCKED until EXTEND.md is created.

| Path | Location |
|------|----------|
| `.baoyu-skills/baoyu-imagine/EXTEND.md` | Project directory |
| `$HOME/.baoyu-skills/baoyu-imagine/EXTEND.md` | User home |

Legacy compatibility: if `.baoyu-skills/baoyu-image-gen/EXTEND.md` exists and the new path does not, runtime renames it to `baoyu-imagine`. If both files exist, runtime leaves them unchanged and uses the new path.

**EXTEND.md Supports**: Default provider | Default quality | Default aspect ratio | Default image size | Default models | Batch worker cap | Provider-specific batch limits

Schema: `references/config/preferences-schema.md`

## Usage

```bash
# Basic
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image cat.png

# With aspect ratio
${BUN_X} {baseDir}/scripts/main.ts --prompt "A landscape" --image out.png --ar 16:9

# High quality
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --quality 2k

# From prompt files
${BUN_X} {baseDir}/scripts/main.ts --promptfiles system.md content.md --image out.png

# With reference images (Google, OpenAI, Azure OpenAI, OpenRouter, Replicate, MiniMax, or Seedream 4.0/4.5/5.0)
${BUN_X} {baseDir}/scripts/main.ts --prompt "Make blue" --image out.png --ref source.png

# With reference images (explicit provider/model)
${BUN_X} {baseDir}/scripts/main.ts --prompt "Make blue" --image out.png --provider google --model gemini-3-pro-image-preview --ref source.png

# Azure OpenAI (model means deployment name)
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider azure --model gpt-image-1.5

# OpenRouter (recommended default model)
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider openrouter

# OpenRouter with reference images
${BUN_X} {baseDir}/scripts/main.ts --prompt "Make blue" --image out.png --provider openrouter --model google/gemini-3.1-flash-image-preview --ref source.png

# Specific provider
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider openai

# DashScope (阿里通义万象)
${BUN_X} {baseDir}/scripts/main.ts --prompt "一只可爱的猫" --image out.png --provider dashscope

# DashScope Qwen-Image 2.0 Pro (recommended for custom sizes and text rendering)
${BUN_X} {baseDir}/scripts/main.ts --prompt "为咖啡品牌设计一张 21:9 横幅海报，包含清晰中文标题" --image out.png --provider dashscope --model qwen-image-2.0-pro --size 2048x872

# DashScope legacy Qwen fixed-size model
${BUN_X} {baseDir}/scripts/main.ts --prompt "一张电影感海报" --image out.png --provider dashscope --model qwen-image-max --size 1664x928

# MiniMax
${BUN_X} {baseDir}/scripts/main.ts --prompt "A fashion editorial portrait by a bright studio window" --image out.jpg --provider minimax

# MiniMax with subject reference (best for character/portrait consistency)
${BUN_X} {baseDir}/scripts/main.ts --prompt "A girl stands by the library window, cinematic lighting" --image out.jpg --provider minimax --model image-01 --ref portrait.png --ar 16:9

# MiniMax with custom size (documented for image-01)
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cinematic poster" --image out.jpg --provider minimax --model image-01 --size 1536x1024

# Replicate (google/nano-banana-2)
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider replicate

# Replicate with specific model
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider replicate --model google/nano-banana

# Batch mode with saved prompt files
${BUN_X} {baseDir}/scripts/main.ts --batchfile batch.json

# Batch mode with explicit worker count
${BUN_X} {baseDir}/scripts/main.ts --batchfile batch.json --jobs 4 --json
```

### Batch File Format

```json
{
  "jobs": 4,
  "tasks": [
    {
      "id": "hero",
      "promptFiles": ["prompts/hero.md"],
      "image": "out/hero.png",
      "provider": "replicate",
      "model": "google/nano-banana-2",
      "ar": "16:9",
      "quality": "2k"
    },
    {
      "id": "diagram",
      "promptFiles": ["prompts/diagram.md"],
      "image": "out/diagram.png",
      "ref": ["references/original.png"]
    }
  ]
}
```

Paths in `promptFiles`, `image`, and `ref` are resolved relative to the batch file's directory. `jobs` is optional (overridden by CLI `--jobs`). Top-level array format (without `jobs` wrapper) is also accepted.

## Options

| Option | Description |
|--------|-------------|
| `--prompt <text>`, `-p` | Prompt text |
| `--promptfiles <files...>` | Read prompt from files (concatenated) |
| `--image <path>` | Output image path (required in single-image mode) |
| `--batchfile <path>` | JSON batch file for multi-image generation |
| `--jobs <count>` | Worker count for batch mode (default: auto, max from config, built-in default 10) |
| `--provider google\|openai\|azure\|openrouter\|dashscope\|minimax\|jimeng\|seedream\|replicate` | Force provider (default: auto-detect) |
| `--model <id>`, `-m` | Model ID (Google: `gemini-3-pro-image-preview`; OpenAI: `gpt-image-1.5`; Azure: deployment name such as `gpt-image-1.5` or `image-prod`; OpenRouter: `google/gemini-3.1-flash-image-preview`; DashScope: `qwen-image-2.0-pro`; MiniMax: `image-01`) |
| `--ar <ratio>` | Aspect ratio (e.g., `16:9`, `1:1`, `4:3`) |
| `--size <WxH>` | Size (e.g., `1024x1024`) |
| `--quality normal\|2k` | Quality preset (default: `2k`) |
| `--imageSize 1K\|2K\|4K` | Image size for Google/OpenRouter (default: from quality) |
| `--ref <files...>` | Reference images. Supported by Google multimodal, OpenAI GPT Image edits, Azure OpenAI edits (PNG/JPG only), OpenRouter multimodal models, Replicate, MiniMax subject-reference, and Seedream 5.0/4.5/4.0. Not supported by Jimeng, Seedream 3.0, or removed SeedEdit 3.0 |
| `--n <count>` | Number of images |
| `--json` | JSON output |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `GOOGLE_API_KEY` | Google API key |
| `DASHSCOPE_API_KEY` | DashScope API key (阿里云) |
| `MINIMAX_API_KEY` | MiniMax API key |
| `REPLICATE_API_TOKEN` | Replicate API token |
| `JIMENG_ACCESS_KEY_ID` | Jimeng (即梦) Volcengine access key |
| `JIMENG_SECRET_ACCESS_KEY` | Jimeng (即梦) Volcengine secret key |
| `ARK_API_KEY` | Seedream (豆包) Volcengine ARK API key |
| `OPENAI_IMAGE_MODEL` | OpenAI model override |
| `AZURE_OPENAI_DEPLOYMENT` | Azure default deployment name |
| `AZURE_OPENAI_IMAGE_MODEL` | Backward-compatible alias for Azure default deployment/model name |
| `OPENROUTER_IMAGE_MODEL` | OpenRouter model override (default: `google/gemini-3.1-flash-image-preview`) |
| `GOOGLE_IMAGE_MODEL` | Google model override |
| `DASHSCOPE_IMAGE_MODEL` | DashScope model override (default: `qwen-image-2.0-pro`) |
| `MINIMAX_IMAGE_MODEL` | MiniMax model override (default: `image-01`) |
| `REPLICATE_IMAGE_MODEL` | Replicate model override (default: google/nano-banana-2) |
| `JIMENG_IMAGE_MODEL` | Jimeng model override (default: jimeng_t2i_v40) |
| `SEEDREAM_IMAGE_MODEL` | Seedream model override (default: doubao-seedream-5-0-260128) |
| `OPENAI_BASE_URL` | Custom OpenAI endpoint |
| `AZURE_OPENAI_BASE_URL` | Azure resource endpoint or deployment endpoint |
| `AZURE_API_VERSION` | Azure image API version (default: `2025-04-01-preview`) |
| `OPENROUTER_BASE_URL` | Custom OpenRouter endpoint (default: `https://openrouter.ai/api/v1`) |
| `OPENROUTER_HTTP_REFERER` | Optional app/site URL for OpenRouter attribution |
| `OPENROUTER_TITLE` | Optional app name for OpenRouter attribution |
| `GOOGLE_BASE_URL` | Custom Google endpoint |
| `DASHSCOPE_BASE_URL` | Custom DashScope endpoint |
| `MINIMAX_BASE_URL` | Custom MiniMax endpoint (default: `https://api.minimax.io`) |
| `REPLICATE_BASE_URL` | Custom Replicate endpoint |
| `JIMENG_BASE_URL` | Custom Jimeng endpoint (default: `https://visual.volcengineapi.com`) |
| `JIMENG_REGION` | Jimeng region (default: `cn-north-1`) |
| `SEEDREAM_BASE_URL` | Custom Seedream endpoint (default: `https://ark.cn-beijing.volces.com/api/v3`) |
| `BAOYU_IMAGE_GEN_MAX_WORKERS` | Override batch worker cap |
| `BAOYU_IMAGE_GEN_<PROVIDER>_CONCURRENCY` | Override provider concurrency, e.g. `BAOYU_IMAGE_GEN_REPLICATE_CONCURRENCY` |
| `BAOYU_IMAGE_GEN_<PROVIDER>_START_INTERVAL_MS` | Override provider start gap, e.g. `BAOYU_IMAGE_GEN_REPLICATE_START_INTERVAL_MS` |

**Load Priority**: CLI args > EXTEND.md > env vars > `<cwd>/.baoyu-skills/.env` > `~/.baoyu-skills/.env`

## Model Resolution

Model priority (highest → lowest), applies to all providers:

1. CLI flag: `--model <id>`
2. EXTEND.md: `default_model.[provider]`
3. Env var: `<PROVIDER>_IMAGE_MODEL` (e.g., `GOOGLE_IMAGE_MODEL`)
4. Built-in default

For Azure, `--model` / `default_model.azure` should be the Azure deployment name. `AZURE_OPENAI_DEPLOYMENT` is the preferred env var, and `AZURE_OPENAI_IMAGE_MODEL` remains as a backward-compatible alias.

**EXTEND.md overrides env vars**. If both EXTEND.md `default_model.google: "gemini-3-pro-image-preview"` and env var `GOOGLE_IMAGE_MODEL=gemini-3.1-flash-image-preview` exist, EXTEND.md wins.

**Agent MUST display model info** before each generation:
- Show: `Using [provider] / [model]`
- Show switch hint: `Switch model: --model <id> | EXTEND.md default_model.[provider] | env <PROVIDER>_IMAGE_MODEL`

### DashScope Models

Use `--model qwen-image-2.0-pro` or set `default_model.dashscope` / `DASHSCOPE_IMAGE_MODEL` when the user wants official Qwen-Image behavior.

Official DashScope model families:

- `qwen-image-2.0-pro`, `qwen-image-2.0-pro-2026-03-03`, `qwen-image-2.0`, `qwen-image-2.0-2026-03-03`
  - Free-form `size` in `宽*高` format
  - Total pixels must stay between `512*512` and `2048*2048`
  - Default size is approximately `1024*1024`
  - Best choice for custom ratios such as `21:9` and text-heavy Chinese/English layouts
- `qwen-image-max`, `qwen-image-max-2025-12-30`, `qwen-image-plus`, `qwen-image-plus-2026-01-09`, `qwen-image`
  - Fixed sizes only: `1664*928`, `1472*1104`, `1328*1328`, `1104*1472`, `928*1664`
  - Default size is `1664*928`
  - `qwen-image` currently has the same capability as `qwen-image-plus`
- Legacy DashScope models such as `z-image-turbo`, `z-image-ultra`, `wanx-v1`
  - Keep using them only when the user explicitly asks for legacy behavior or compatibility

When translating CLI args into DashScope behavior:

- `--size` wins over `--ar`
- For `qwen-image-2.0*`, prefer explicit `--size`; otherwise infer from `--ar` and use the official recommended resolutions below
- For `qwen-image-max/plus/image`, only use the five official fixed sizes; if the requested ratio is not covered, switch to `qwen-image-2.0-pro`
- `--quality` is a baoyu-imagine compatibility preset, not a native DashScope API field. Mapping `normal` / `2k` onto the `qwen-image-2.0*` table below is an implementation inference, not an official API guarantee

Recommended `qwen-image-2.0*` sizes for common aspect ratios:

| Ratio | `normal` | `2k` |
|-------|----------|------|
| `1:1` | `1024*1024` | `1536*1536` |
| `2:3` | `768*1152` | `1024*1536` |
| `3:2` | `1152*768` | `1536*1024` |
| `3:4` | `960*1280` | `1080*1440` |
| `4:3` | `1280*960` | `1440*1080` |
| `9:16` | `720*1280` | `1080*1920` |
| `16:9` | `1280*720` | `1920*1080` |
| `21:9` | `1344*576` | `2048*872` |

DashScope official APIs also expose `negative_prompt`, `prompt_extend`, and `watermark`, but `baoyu-imagine` does not expose them as dedicated CLI flags today.

Official references:

- [Qwen-Image API](https://help.aliyun.com/zh/model-studio/qwen-image-api)
- [Text-to-image guide](https://help.aliyun.com/zh/model-studio/text-to-image)
- [Qwen-Image Edit API](https://help.aliyun.com/zh/model-studio/qwen-image-edit-api)

### MiniMax Models

Use `--model image-01` or set `default_model.minimax` / `MINIMAX_IMAGE_MODEL` when the user wants MiniMax image generation.

Official MiniMax image model options currently documented in the API reference:

- `image-01` (recommended default)
  - Supports text-to-image and subject-reference image generation
  - Supports official `aspect_ratio` values: `1:1`, `16:9`, `4:3`, `3:2`, `2:3`, `3:4`, `9:16`, `21:9`
  - Supports documented custom `width` / `height` output sizes when using `--size <WxH>`
  - `width` and `height` must both be between `512` and `2048`, and both must be divisible by `8`
- `image-01-live`
  - Lower-latency variant
  - Use `--ar` for sizing; MiniMax documents custom `width` / `height` as only effective for `image-01`

MiniMax subject reference notes:

- `--ref` files are sent as MiniMax `subject_reference`
- MiniMax docs currently describe `subject_reference[].type` as `character`
- Official docs say `image_file` supports public URLs or Base64 Data URLs; `baoyu-imagine` sends local refs as Data URLs
- Official docs recommend front-facing portrait references in JPG/JPEG/PNG under 10MB

Official references:

- [MiniMax Image Generation Guide](https://platform.minimax.io/docs/guides/image-generation)
- [MiniMax Text-to-Image API](https://platform.minimax.io/docs/api-reference/image-generation-t2i)
- [MiniMax Image-to-Image API](https://platform.minimax.io/docs/api-reference/image-generation-i2i)

### OpenRouter Models

Use full OpenRouter model IDs, e.g.:

- `google/gemini-3.1-flash-image-preview` (recommended, supports image output and reference-image workflows)
- `google/gemini-2.5-flash-image-preview`
- `black-forest-labs/flux.2-pro`
- Other OpenRouter image-capable model IDs

Notes:

- OpenRouter image generation uses `/chat/completions`, not the OpenAI `/images` endpoints
- If `--ref` is used, choose a multimodal model that supports image input and image output
- `--imageSize` maps to OpenRouter `imageGenerationOptions.size`; `--size <WxH>` is converted to the nearest OpenRouter size and inferred aspect ratio when possible

### Replicate Models

Supported model formats:

- `owner/name` (recommended for official models), e.g. `google/nano-banana-2`
- `owner/name:version` (community models by version), e.g. `stability-ai/sdxl:<version>`

Examples:

```bash
# Use Replicate default model
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider replicate

# Override model explicitly
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider replicate --model google/nano-banana
```

## Provider Selection

1. `--ref` provided + no `--provider` → auto-select Google first, then OpenAI, then Azure, then OpenRouter, then Replicate, then Seedream, then MiniMax (MiniMax subject reference is more specialized toward character/portrait consistency)
2. `--provider` specified → use it (if `--ref`, must be `google`, `openai`, `azure`, `openrouter`, `replicate`, `seedream`, or `minimax`)
3. Only one API key available → use that provider
4. Multiple available → default to Google

## Quality Presets

| Preset | Google imageSize | OpenAI Size | OpenRouter size | Replicate resolution | Use Case |
|--------|------------------|-------------|-----------------|----------------------|----------|
| `normal` | 1K | 1024px | 1K | 1K | Quick previews |
| `2k` (default) | 2K | 2048px | 2K | 2K | Covers, illustrations, infographics |

**Google/OpenRouter imageSize**: Can be overridden with `--imageSize 1K|2K|4K`

## Aspect Ratios

Supported: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `2.35:1`

- Google multimodal: uses `imageConfig.aspectRatio`
- OpenAI: maps to closest supported size
- OpenRouter: sends `imageGenerationOptions.aspect_ratio`; if only `--size <WxH>` is given, aspect ratio is inferred automatically
- Replicate: passes `aspect_ratio` to model; when `--ref` is provided without `--ar`, defaults to `match_input_image`
- MiniMax: sends official `aspect_ratio` values directly; if `--size <WxH>` is given without `--ar`, `width` / `height` are sent for `image-01`

## Generation Mode

**Default**: Sequential generation.

**Batch Parallel Generation**: When `--batchfile` contains 2 or more pending tasks, the script automatically enables parallel generation.

| Mode | When to Use |
|------|-------------|
| Sequential (default) | Normal usage, single images, small batches |
| Parallel batch | Batch mode with 2+ tasks |

Execution choice:

| Situation | Preferred approach | Why |
|-----------|--------------------|-----|
| One image, or 1-2 simple images | Sequential | Lower coordination overhead and easier debugging |
| Multiple images already have saved prompt files | Batch (`--batchfile`) | Reuses finalized prompts, applies shared throttling/retries, and gives predictable throughput |
| Each image still needs separate reasoning, prompt writing, or style exploration | Subagents | The work is still exploratory, so each image may need independent analysis before generation |
| Output comes from `baoyu-article-illustrator` with `outline.md` + `prompts/` | Batch (`build-batch.ts` -> `--batchfile`) | That workflow already produces prompt files, so direct batch execution is the intended path |

Rule of thumb:

- Prefer batch over subagents once prompt files are already saved and the task is "generate all of these"
- Use subagents only when generation is coupled with per-image thinking, rewriting, or divergent creative exploration

Parallel behavior:

- Default worker count is automatic, capped by config, built-in default 10
- Provider-specific throttling is applied only in batch mode, and the built-in defaults are tuned for faster throughput while still avoiding obvious RPM bursts
- You can override worker count with `--jobs <count>`
- Each image retries automatically up to 3 attempts
- Final output includes success count, failure count, and per-image failure reasons

## Error Handling

- Missing API key → error with setup instructions
- Generation failure → auto-retry up to 3 attempts per image
- Invalid aspect ratio → warning, proceed with default
- Reference images with unsupported provider/model → error with fix hint

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
