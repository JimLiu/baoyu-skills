---
name: baoyu-image-gen
description: AI image generation with OpenAI, Google, DashScope and Replicate APIs. Supports text-to-image, reference-image editing, aspect ratios, and faster parallel batch generation. Sequential by default; parallel generation available on request. Use when user asks to generate, create, or draw images.
---

# Image Generation (AI SDK)

Official API-based image generation. Supports OpenAI, Google, DashScope and Replicate providers.
Default recommendation: `Replicate / google/nano-banana-pro`.

## Script Directory

**Agent Execution**:
1. `SKILL_DIR` = this SKILL.md file's directory
2. Script path = `${SKILL_DIR}/scripts/main.ts`
3. Resolve `${BUN_X}` runtime: if `bun` installed -> `bun`; if `npx` available -> `npx -y bun`; else suggest installing bun
4. On Windows PowerShell, if `npx.ps1` is blocked, use `npx.cmd -y tsx` as a fallback runner

## Step 0: Load Preferences (BLOCKING)

**CRITICAL**: This step MUST complete BEFORE any image generation. Do NOT skip or defer.

Check EXTEND.md existence (priority: project -> user):

```bash
test -f .baoyu-skills/baoyu-image-gen/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-image-gen/EXTEND.md" && echo "xdg"
test -f "$HOME/.baoyu-skills/baoyu-image-gen/EXTEND.md" && echo "user"
```

```powershell
if (Test-Path .baoyu-skills/baoyu-image-gen/EXTEND.md) { "project" }
$xdg = if ($env:XDG_CONFIG_HOME) { $env:XDG_CONFIG_HOME } else { "$HOME/.config" }
if (Test-Path "$xdg/baoyu-skills/baoyu-image-gen/EXTEND.md") { "xdg" }
if (Test-Path "$HOME/.baoyu-skills/baoyu-image-gen/EXTEND.md") { "user" }
```

| Result | Action |
|--------|--------|
| Found | Load, parse, apply settings. If `default_model.[provider]` is null -> ask model only (Flow 2) |
| Not found | Run first-time setup (`references/config/first-time-setup.md`) -> save EXTEND.md -> continue |

**CRITICAL**: If not found, complete the full setup (provider + model + quality + save location) before generating images.

| Path | Location |
|------|----------|
| `.baoyu-skills/baoyu-image-gen/EXTEND.md` | Project directory |
| `$HOME/.baoyu-skills/baoyu-image-gen/EXTEND.md` | User home |

**EXTEND.md Supports**: Default provider | Default quality | Default aspect ratio | Default image size | Default models | Batch worker cap | Provider-specific batch limits

Schema: `references/config/preferences-schema.md`

## Usage

```bash
# Basic
${BUN_X} ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image cat.png

# With aspect ratio
${BUN_X} ${SKILL_DIR}/scripts/main.ts --prompt "A landscape" --image out.png --ar 16:9

# High quality
${BUN_X} ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image out.png --quality 2k

# From prompt files
${BUN_X} ${SKILL_DIR}/scripts/main.ts --promptfiles system.md content.md --image out.png

# With reference images (Google multimodal or OpenAI edits)
${BUN_X} ${SKILL_DIR}/scripts/main.ts --prompt "Make blue" --image out.png --ref source.png

# Faithful localization of an existing framework diagram
${BUN_X} ${SKILL_DIR}/scripts/main.ts --promptfiles localize-framework.md --ref source-diagram.png --image localized-diagram.png --provider replicate --model google/nano-banana-pro --quality normal

# OpenAI GPT Image (official API)
${BUN_X} ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image out.png --provider openai --model gpt-image-1.5

# Replicate default recommendation
${BUN_X} ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image out.png --provider replicate --model google/nano-banana-pro

# Batch mode with saved prompt files
${BUN_X} ${SKILL_DIR}/scripts/main.ts --batchfile batch.json

# Windows PowerShell fallback runner
npx.cmd -y tsx ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image out.png --provider replicate
```

## Options

| Option | Description |
|--------|-------------|
| `--prompt <text>`, `-p` | Prompt text |
| `--promptfiles <files...>` | Read prompt from files (concatenated) |
| `--image <path>` | Output image path (required) |
| `--batchfile <path>` | JSON batch file for multi-image generation |
| `--jobs <count>` | Worker count for batch mode (default: auto, max from config, built-in default 10) |
| `--provider google\|openai\|dashscope\|replicate` | Force provider (default preference: replicate when available) |
| `--model <id>`, `-m` | Model ID (Google: `gemini-3-pro-image-preview`, `gemini-3.1-flash-image-preview`; OpenAI: `gpt-image-1.5`, `gpt-image-1`) |
| `--ar <ratio>` | Aspect ratio (e.g. `16:9`, `1:1`, `4:3`) |
| `--size <WxH>` | Size (e.g. `1024x1024`) |
| `--quality normal\|2k` | Quality preset (default: `2k`) |
| `--imageSize 1K\|2K\|4K` | Image size for Google (default: from quality) |
| `--ref <files...>` | Reference images. Supported by Google multimodal, OpenAI GPT Image edits, and Replicate |
| `--n <count>` | Number of images |
| `--json` | JSON output |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `GOOGLE_API_KEY` | Google API key |
| `GEMINI_API_KEY` | Alias for `GOOGLE_API_KEY` |
| `DASHSCOPE_API_KEY` | DashScope API key |
| `REPLICATE_API_TOKEN` | Replicate API token |
| `OPENAI_IMAGE_MODEL` | OpenAI model override |
| `GOOGLE_IMAGE_MODEL` | Google model override |
| `DASHSCOPE_IMAGE_MODEL` | DashScope model override (default: `z-image-turbo`) |
| `REPLICATE_IMAGE_MODEL` | Replicate model override (default: `google/nano-banana-pro`) |
| `OPENAI_BASE_URL` | Custom OpenAI endpoint |
| `OPENAI_IMAGE_USE_CHAT` | Use `/chat/completions` instead of `/images/generations` when a compatible proxy requires it |
| `GOOGLE_BASE_URL` | Custom Google endpoint |
| `DASHSCOPE_BASE_URL` | Custom DashScope endpoint |
| `REPLICATE_BASE_URL` | Custom Replicate endpoint |
| `BAOYU_IMAGE_GEN_MAX_WORKERS` | Override batch worker cap |
| `BAOYU_IMAGE_GEN_<PROVIDER>_CONCURRENCY` | Override provider concurrency, e.g. `BAOYU_IMAGE_GEN_REPLICATE_CONCURRENCY` |
| `BAOYU_IMAGE_GEN_<PROVIDER>_START_INTERVAL_MS` | Override provider start gap, e.g. `BAOYU_IMAGE_GEN_REPLICATE_START_INTERVAL_MS` |

**Load Priority**: CLI args > EXTEND.md > env vars > `<cwd>/.baoyu-skills/.env` > `~/.baoyu-skills/.env`

## OpenAI Support

OpenAI is an officially supported provider in this skill.

- Recommended OpenAI model: `gpt-image-1.5`
- Required auth: `OPENAI_API_KEY`
- Optional override: `OPENAI_BASE_URL`
- Reference-image editing: supported with GPT Image models via `--ref`

Important:

- Codex/ChatGPT desktop login does **not** automatically grant this script OpenAI Images API access
- If you want to use OpenAI here, provide a real `OPENAI_API_KEY`
- If your endpoint is a compatible proxy that only supports chat-style image output, set `OPENAI_IMAGE_USE_CHAT=true`

## Model Resolution

Model priority (highest -> lowest), applies to all providers:

1. CLI flag: `--model <id>`
2. EXTEND.md: `default_model.[provider]`
3. Env var: `<PROVIDER>_IMAGE_MODEL`
4. Built-in default

**EXTEND.md overrides env vars**.

**Agent MUST display model info** before each generation:
- Show: `Using [provider] / [model]`
- Show switch hint: `Switch model: --model <id> | EXTEND.md default_model.[provider] | env <PROVIDER>_IMAGE_MODEL`

### Replicate Models

Supported model formats:

- `owner/name` (recommended), e.g. `google/nano-banana-pro`
- `owner/name:version` (community models by version), e.g. `stability-ai/sdxl:<version>`

## Provider Selection

1. `--ref` provided + no `--provider` -> auto-select Google first, then OpenAI, then Replicate
2. `--provider` specified -> use it (if `--ref`, must be `google`, `openai`, or `replicate`)
3. Only one API key available -> use that provider
4. Multiple available -> default to Replicate (`google/nano-banana-pro`) unless explicitly overridden

## Quality Presets

| Preset | Google imageSize | OpenAI Size | Use Case |
|--------|------------------|-------------|----------|
| `normal` | 1K | 1024px | Quick previews |
| `2k` | 2K | 2048px | Covers, illustrations, infographics |

## Aspect Ratios

Supported: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `2.35:1`

- Google multimodal: uses `imageConfig.aspectRatio`
- OpenAI: maps to closest supported size
- Replicate: depends on model support

## Generation Mode

**Default**: Sequential generation.

**Batch Parallel Generation**: When `--batchfile` contains 2 or more pending tasks, the script automatically enables parallel generation.

| Mode | When to Use |
|------|-------------|
| Sequential (default) | Normal usage, single images, small batches |
| Parallel batch | Batch mode with 2+ tasks |

Parallel behavior:

- Default worker count is automatic, capped by config, built-in default 10
- Provider-specific throttling is applied only in batch mode, and the built-in defaults are tuned for faster throughput while still avoiding obvious RPM bursts
- You can override worker count with `--jobs <count>`
- Each image retries automatically up to 3 attempts
- Final output includes success count, failure count, and per-image failure reasons
- Replicate defaults are tuned aggressively for `google/nano-banana-pro` and can be overridden in `EXTEND.md` or env vars

Important note on speed:

- Single-image generation does not add a forced inter-request wait in the shell script
- The main performance controls are model-side latency, requested quality/resolution, and batch-mode throttling
- For reference-image editing on Replicate, `quality: normal` maps to `resolution: 1K`, which is often much faster than `2k`

Important note on localization quality:

- For text-heavy reference-image localization, do not stop at "translate this image into English"
- If the image contains a framework, acronym, mnemonic, named method, or fixed step labels, extract the canonical target wording first and write those exact labels into the prompt
- Also tell the model what must not change: layout, composition, arrows, icons, colors, spacing, and non-text elements
- This greatly reduces semantic drift such as changing a fixed acronym into different step names

## Error Handling

- Missing API key -> error with setup instructions
- Codex desktop auth without `OPENAI_API_KEY` -> explain that local login cannot be reused as OpenAI Images API auth
- Generation failure -> auto-retry up to 3 attempts per image
- Invalid aspect ratio -> warning, proceed with default
- Reference images with unsupported provider/model -> error with fix hint

## Extension Support

Custom configurations via EXTEND.md. See the preferences schema for supported options.
