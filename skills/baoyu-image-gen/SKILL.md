---
name: baoyu-image-gen
description: "[Deprecated: use baoyu-imagine] AI image generation with OpenAI, Azure OpenAI, Google, OpenRouter, DashScope, Z.AI GLM-Image, MiniMax, Jimeng, Seedream and Replicate APIs. Supports text-to-image, reference images, aspect ratios, and batch generation from saved prompt files. Sequential by default; use batch parallel generation when the user already has multiple prompts or wants stable multi-image throughput. Use when user asks to generate, create, or draw images."
version: 1.56.4
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-image-gen
    requires:
      anyBins:
        - bun
        - npx
---


# Image Generation (AI SDK)

Official API-based image generation. Supports OpenAI, Azure OpenAI, Google, OpenRouter, DashScope (阿里通义万象), Z.AI GLM-Image, MiniMax, Jimeng (即梦), Seedream (豆包) and Replicate.

## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete `AskUserQuestion` references below are examples — substitute the local equivalent in other runtimes.

## Script Directory

`{baseDir}` = this SKILL.md's directory. Main script: `{baseDir}/scripts/main.ts`. Resolve `${BUN_X}`: prefer `bun`; else `npx -y bun`; else suggest `brew install oven-sh/bun/bun`.

## Step 0: Load Preferences ⛔ BLOCKING

This step MUST complete before any image generation — generation is blocked until EXTEND.md exists.

Check these paths in order; first hit wins:

| Path | Scope |
|------|-------|
| `.baoyu-skills/baoyu-image-gen/EXTEND.md` | Project |
| `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-image-gen/EXTEND.md` | XDG |
| `$HOME/.baoyu-skills/baoyu-image-gen/EXTEND.md` | User home |

- **Found** → load, parse, apply. If `default_model.[provider]` is null → ask model only.
- **Not found** → run first-time setup (`references/config/first-time-setup.md`) using AskUserQuestion to collect provider + model + quality + save location. Save EXTEND.md, then continue. Do not generate images before this completes.

**EXTEND.md keys**: default provider, default quality, default aspect ratio, default image size, OpenAI image API dialect, default models, batch worker cap, provider-specific batch limits. Schema: `references/config/preferences-schema.md`.

## Usage

Minimum working examples — see `references/usage-examples.md` for the full set including per-provider invocations and batch mode.

```bash
# Basic
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image cat.png

# With aspect ratio and high quality
${BUN_X} {baseDir}/scripts/main.ts --prompt "A landscape" --image out.png --ar 16:9 --quality 2k

# Prompt from files
${BUN_X} {baseDir}/scripts/main.ts --promptfiles system.md content.md --image out.png

# With reference image
${BUN_X} {baseDir}/scripts/main.ts --prompt "Make blue" --image out.png --ref source.png

# Specific provider
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider dashscope --model qwen-image-2.0-pro

# Batch mode
${BUN_X} {baseDir}/scripts/main.ts --batchfile batch.json --jobs 4
```

## Options

| Option | Description |
|--------|-------------|
| `--prompt <text>`, `-p` | Prompt text |
| `--promptfiles <files...>` | Read prompt from files (concatenated) |
| `--image <path>` | Output image path (required in single-image mode) |
| `--batchfile <path>` | JSON batch file for multi-image generation |
| `--jobs <count>` | Worker count for batch mode (default: auto, max from config, built-in default 10) |
| `--provider google\|openai\|azure\|openrouter\|dashscope\|zai\|minimax\|jimeng\|seedream\|replicate` | Force provider (default: auto-detect) |
| `--model <id>`, `-m` | Model ID — see provider references for defaults and allowed values |
| `--ar <ratio>` | Aspect ratio (`16:9`, `1:1`, `4:3`, …) |
| `--size <WxH>` | Explicit size (e.g., `1024x1024`) |
| `--quality normal\|2k` | Quality preset (default: `2k`) |
| `--imageSize 1K\|2K\|4K` | Image size for Google/OpenRouter (default: from quality) |
| `--imageApiDialect openai-native\|ratio-metadata` | OpenAI-compatible endpoint dialect — use `ratio-metadata` for gateways that expect aspect-ratio `size` plus `metadata.resolution` |
| `--ref <files...>` | Reference images. Supported by Google multimodal, OpenAI GPT Image edits, Azure OpenAI edits (PNG/JPG only), OpenRouter multimodal models, Replicate supported families, MiniMax subject-reference, Seedream 5.0/4.5/4.0. Not supported by Jimeng, Seedream 3.0, SeedEdit 3.0 |
| `--n <count>` | Number of images. Replicate requires `--n 1` (single-output save semantics) |
| `--json` | JSON output |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `GOOGLE_API_KEY` | Google API key |
| `DASHSCOPE_API_KEY` | DashScope API key |
| `ZAI_API_KEY` (alias `BIGMODEL_API_KEY`) | Z.AI API key |
| `MINIMAX_API_KEY` | MiniMax API key |
| `REPLICATE_API_TOKEN` | Replicate API token |
| `JIMENG_ACCESS_KEY_ID`, `JIMENG_SECRET_ACCESS_KEY` | Jimeng (即梦) Volcengine credentials |
| `ARK_API_KEY` | Seedream (豆包) Volcengine ARK API key |
| `<PROVIDER>_IMAGE_MODEL` | Per-provider model override (`OPENAI_IMAGE_MODEL`, `GOOGLE_IMAGE_MODEL`, `DASHSCOPE_IMAGE_MODEL`, `ZAI_IMAGE_MODEL`/`BIGMODEL_IMAGE_MODEL`, `MINIMAX_IMAGE_MODEL`, `OPENROUTER_IMAGE_MODEL`, `REPLICATE_IMAGE_MODEL`, `JIMENG_IMAGE_MODEL`, `SEEDREAM_IMAGE_MODEL`) |
| `AZURE_OPENAI_DEPLOYMENT` (alias `AZURE_OPENAI_IMAGE_MODEL`) | Azure default deployment |
| `<PROVIDER>_BASE_URL` | Per-provider endpoint override |
| `AZURE_API_VERSION` | Azure image API version (default `2025-04-01-preview`) |
| `JIMENG_REGION` | Jimeng region (default `cn-north-1`) |
| `OPENAI_IMAGE_API_DIALECT` | `openai-native` \| `ratio-metadata` |
| `OPENROUTER_HTTP_REFERER`, `OPENROUTER_TITLE` | Optional OpenRouter attribution |
| `BAOYU_IMAGE_GEN_MAX_WORKERS` | Override batch worker cap |
| `BAOYU_IMAGE_GEN_<PROVIDER>_CONCURRENCY` | Per-provider concurrency (e.g., `BAOYU_IMAGE_GEN_REPLICATE_CONCURRENCY`) |
| `BAOYU_IMAGE_GEN_<PROVIDER>_START_INTERVAL_MS` | Per-provider start-gap |

**Load priority**: CLI args > EXTEND.md > env vars > `<cwd>/.baoyu-skills/.env` > `~/.baoyu-skills/.env`

## Model Resolution

Priority (highest → lowest) applies to every provider:

1. CLI flag `--model <id>`
2. EXTEND.md `default_model.[provider]`
3. Env var `<PROVIDER>_IMAGE_MODEL`
4. Built-in default

For Azure, `--model` / `default_model.azure` is the Azure deployment name. `AZURE_OPENAI_DEPLOYMENT` is the preferred env var; `AZURE_OPENAI_IMAGE_MODEL` is kept as a backward-compatible alias.

EXTEND.md overrides env vars: if EXTEND.md sets `default_model.google: "gemini-3-pro-image-preview"` and the env var sets `GOOGLE_IMAGE_MODEL=gemini-3.1-flash-image-preview`, EXTEND.md wins.

**Display model info before each generation**:

- `Using [provider] / [model]`
- `Switch model: --model <id> | EXTEND.md default_model.[provider] | env <PROVIDER>_IMAGE_MODEL`

## OpenAI-Compatible Gateway Dialects

`provider=openai` means the auth and routing entrypoint is OpenAI-compatible. It does **not** guarantee the upstream image API uses OpenAI native semantics. When a gateway expects a different wire format, set `default_image_api_dialect` in EXTEND.md, `OPENAI_IMAGE_API_DIALECT`, or `--imageApiDialect`:

- `openai-native`: pixel `size` (`1536x1024`) and native OpenAI quality fields
- `ratio-metadata`: aspect-ratio `size` (`16:9`) plus `metadata.resolution` (`1K|2K|4K`) and `metadata.orientation`

Use `openai-native` for the OpenAI native API or strict clones; try `ratio-metadata` for compatibility gateways in front of Gemini or similar models. Current limitation: `ratio-metadata` applies only to text-to-image; reference-image edits still need `openai-native` or a provider with first-class edit support.

## Provider-Specific Guides

Each provider has its own quirks (model families, size rules, ref support, limits). Read these when the user picks that provider or asks for non-default behavior:

| Provider | Reference |
|----------|-----------|
| DashScope (Qwen-Image families, custom sizes) | `references/providers/dashscope.md` |
| Z.AI (GLM-Image, cogview-4) | `references/providers/zai.md` |
| MiniMax (image-01, subject-reference) | `references/providers/minimax.md` |
| OpenRouter (multimodal models, `/chat/completions` flow) | `references/providers/openrouter.md` |
| Replicate (nano-banana, Seedream, Wan) | `references/providers/replicate.md` |

## Provider Selection

1. `--ref` provided + no `--provider` → auto-select Google → OpenAI → Azure → OpenRouter → Replicate → Seedream → MiniMax (MiniMax's subject reference is more specialized toward character/portrait consistency)
2. `--provider` specified → use it (if `--ref`, must be google/openai/azure/openrouter/replicate/seedream/minimax)
3. Only one API key present → use that provider
4. Multiple keys → default priority: Google → OpenAI → Azure → OpenRouter → DashScope → Z.AI → MiniMax → Replicate → Jimeng → Seedream

## Quality Presets

| Preset | Google imageSize | OpenAI size | OpenRouter size | Replicate resolution | Use case |
|--------|------------------|-------------|-----------------|----------------------|----------|
| `normal` | 1K | 1024px | 1K | 1K | Quick previews |
| `2k` (default) | 2K | 2048px | 2K | 2K | Covers, illustrations, infographics |

Google/OpenRouter `imageSize` can be overridden with `--imageSize 1K|2K|4K`.

## Aspect Ratios

Supported: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `2.35:1`.

- Google multimodal: `imageConfig.aspectRatio`
- OpenAI: closest supported size
- OpenRouter: `imageGenerationOptions.aspect_ratio`; if only `--size <WxH>` is given, the ratio is inferred
- Replicate: behavior is model-specific — `google/nano-banana*` uses `aspect_ratio`, `bytedance/seedream-*` uses documented Replicate ratios, Wan 2.7 maps `--ar` to a concrete `size`
- MiniMax: official `aspect_ratio` values; if `--size <WxH>` is given without `--ar`, sends `width`/`height` for `image-01`

## Generation Mode

**Default**: sequential. **Batch parallel**: enabled automatically when `--batchfile` contains 2+ pending tasks.

| Situation | Prefer | Why |
|-----------|--------|-----|
| One image, or 1-2 simple images | Sequential | Lower coordination overhead, easier debugging |
| Multiple images with saved prompt files | Batch (`--batchfile`) | Reuses finalized prompts, applies shared throttling/retries, predictable throughput |
| Each image still needs its own reasoning / prompt writing / style exploration | Subagents | Work is still exploratory, each needs independent analysis |
| Input is `outline.md` + `prompts/` (e.g. from `baoyu-article-illustrator`) | Batch — use `scripts/build-batch.ts` to assemble the payload | The outline + prompt files already contain everything needed |

Rule of thumb: once prompt files are saved and the task is "generate all of these", prefer batch over subagents. Use subagents only when generation is coupled with per-image thinking or divergent creative exploration.

**Parallel behavior**:

- Default worker count is automatic, capped by config, built-in default 10
- Provider-specific throttling applies only in batch mode; defaults are tuned for throughput while avoiding RPM bursts
- Override with `--jobs <count>`
- Each image retries up to 3 attempts
- Final output includes success count, failure count, and per-image failure reasons

## Error Handling

- Missing API key → error with setup instructions
- Generation failure → auto-retry up to 3 attempts per image
- Invalid aspect ratio → warning, proceed with default
- Reference images with unsupported provider/model → error with fix hint

## References

| File | Content |
|------|---------|
| `references/usage-examples.md` | Extended CLI examples across providers and batch mode |
| `references/providers/dashscope.md` | DashScope families, sizes, limits |
| `references/providers/zai.md` | Z.AI GLM-image / cogview-4 |
| `references/providers/minimax.md` | MiniMax image-01 + subject reference |
| `references/providers/openrouter.md` | OpenRouter multimodal flow |
| `references/providers/replicate.md` | Replicate supported families + guardrails |
| `references/config/preferences-schema.md` | EXTEND.md schema |
| `references/config/first-time-setup.md` | First-time setup flow |

## Extension Support

Custom configurations via EXTEND.md. See Step 0 for paths and schema.
