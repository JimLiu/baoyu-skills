---
name: baoyu-image-gen
description: AI image generation with OpenAI GPT Image 2.5, Azure OpenAI, Google, OpenRouter, DashScope, Z.AI GLM-Image, MiniMax, Jimeng, Seedream, Replicate and Agnes APIs. Supports text-to-image, reference images, aspect ratios, and batch generation from saved prompt files. Sequential by default; use batch parallel generation when the user already has multiple prompts or wants stable multi-image throughput. Use when user asks to generate, create, or draw images.
version: 2.2.0
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-image-gen
    requires:
      anyBins:
        - bun
        - npx
---

# Image Generation (AI SDK)

## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete `AskUserQuestion` references below are examples — substitute the local equivalent in other runtimes.

## Script Directory

`{baseDir}` = this SKILL.md's directory; `scripts/...` paths are relative to it. Main script: `{baseDir}/scripts/main.ts`. Batch payload helper: `{baseDir}/scripts/build-batch.ts`. Resolve `${BUN_X}`: prefer `bun`; else `npx -y bun`; else suggest `brew install oven-sh/bun/bun`.

## Step 0: Load Preferences (blocking)

No image generation until EXTEND.md exists. Check in order; first hit wins:

| Path | Scope |
|------|-------|
| `.baoyu-skills/baoyu-image-gen/EXTEND.md` | Project |
| `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-image-gen/EXTEND.md` | XDG |
| `$HOME/.baoyu-skills/baoyu-image-gen/EXTEND.md` | User home |

- **Found** → load and apply. If `default_model.[provider]` is null → ask model only.
- **Not found** → run first-time setup (`references/config/first-time-setup.md`) via AskUserQuestion to collect provider + model + quality + save location. Save EXTEND.md, then continue.

Legacy: if `.baoyu-skills/baoyu-imagine/EXTEND.md` exists and the new path doesn't, the runtime renames it to `baoyu-image-gen`. If both exist, the runtime leaves them alone and uses the new path.

**EXTEND.md keys**: default provider, quality, aspect ratio, image size, OpenAI image API dialect, default models, batch worker cap, provider-specific batch limits. Schema: `references/config/preferences-schema.md`.

## Usage

More examples (per provider, batch file format): `references/usage-examples.md`.

```bash
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image cat.png
${BUN_X} {baseDir}/scripts/main.ts --prompt "A landscape" --image out.png --ar 16:9 --quality 2k
${BUN_X} {baseDir}/scripts/main.ts --promptfiles system.md content.md --image out.png
${BUN_X} {baseDir}/scripts/main.ts --prompt "Make blue" --image out.png --ref source.png
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider dashscope --model qwen-image-2.0-pro
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cat" --image out.png --provider codex-cli --ar 16:9   # Codex login, no OPENAI_API_KEY; needs `codex` on PATH

# Batch; build the payload from outline.md + prompts/ (e.g. baoyu-article-illustrator output)
${BUN_X} {baseDir}/scripts/build-batch.ts --outline outline.md --prompts prompts --output batch.json --images-dir attachments
${BUN_X} {baseDir}/scripts/main.ts --batchfile batch.json --jobs 4
```

## Reference-Image Identity Preservation

When a real person/character/object must be preserved from reference images:

- Use short, hard identity language instead of a long generic description: "Use the person/object in the reference image(s) as the same identity. Do not redesign it or create a similar-looking new subject. Only change scene, clothing, pose, lighting, rendering style, and composition. Keep the face/proportions/hair/key accessories/overall identity from the references." With multiple refs, say they are the same subject and jointly define identity.
- Long feature descriptions ("young East Asian woman, oval face, clear eyes...") make the model synthesize a new matching person instead.
- Prefer 2–4 curated existing source refs; many or multi-megabyte refs can destabilize streaming providers.
- Don't use newly generated outputs as refs unless the user asks (drift compounds).
- Too polished/influencer-like → reduce stylized refs, add anti-beautification constraints (no face slimming, eye enlargement, heavy makeup, commercial travel shoot, over-smoothing).
- Younger/older look → keep the face; express age via clothing, posture, scene, styling. Never ask to change facial identity.

## Options

| Option | Description |
|--------|-------------|
| `--prompt <text>`, `-p` | Prompt text |
| `--promptfiles <files...>` | Read prompt from files (concatenated) |
| `--image <path>` | Output image path (required in single-image mode) |
| `--batchfile <path>` | JSON batch file for multi-image generation |
| `--jobs <count>` | Worker count for batch mode (default: auto, max from config, built-in default 10) |
| `--provider google\|openai\|azure\|openrouter\|dashscope\|zai\|minimax\|jimeng\|seedream\|replicate\|codex-cli\|agnes` | Force provider (default: auto-detect; `codex-cli` is never auto-selected — must be pinned via CLI or EXTEND.md) |
| `--model <id>`, `-m` | Model ID — see provider references for defaults and allowed values |
| `--ar <ratio>` | Aspect ratio (`16:9`, `1:1`, `4:3`, …) |
| `--size <WxH>` | Explicit size (e.g., `1024x1024`; for `gpt-image-2.5-*` and `gpt-image-2`, width/height must be multiples of 16, max edge 3840px, ratio no wider than 3:1) |
| `--quality normal\|2k` | Quality preset (default: `2k`) |
| `--imageSize 1K\|2K\|4K` | Image size for Google/OpenRouter (default: from quality) |
| `--imageApiDialect openai-native\|ratio-metadata` | OpenAI-compatible endpoint dialect — use `ratio-metadata` for gateways that expect aspect-ratio `size` plus `metadata.resolution` |
| `--ref <files...>` | Reference images. Supported by Google multimodal, OpenAI GPT Image edits, Azure OpenAI edits (PNG/JPG only), OpenRouter multimodal models, Replicate supported families, MiniMax subject-reference, Seedream 5.0/4.5/4.0, DashScope `wan2.7-image-pro`/`wan2.7-image`. Not supported by Jimeng, Seedream 3.0, SeedEdit 3.0, or any DashScope model outside the `wan2.7-image*` family |
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
| `<PROVIDER>_IMAGE_MODEL` | Per-provider model override (`OPENAI_IMAGE_MODEL`, `GOOGLE_IMAGE_MODEL`, `DASHSCOPE_IMAGE_MODEL`, `ZAI_IMAGE_MODEL`/`BIGMODEL_IMAGE_MODEL`, `MINIMAX_IMAGE_MODEL`, `OPENROUTER_IMAGE_MODEL`, `REPLICATE_IMAGE_MODEL`, `JIMENG_IMAGE_MODEL`, `SEEDREAM_IMAGE_MODEL`, `AGNES_IMAGE_MODEL`) |
| `AZURE_OPENAI_DEPLOYMENT` (alias `AZURE_OPENAI_IMAGE_MODEL`) | Azure default deployment |
| `<PROVIDER>_BASE_URL` | Per-provider endpoint override |
| `AZURE_API_VERSION` | Azure image API version (default `2025-04-01-preview`) |
| `JIMENG_REGION` | Jimeng region (default `cn-north-1`) |
| `OPENAI_IMAGE_API_DIALECT` | `openai-native` \| `ratio-metadata` |
| `OPENROUTER_HTTP_REFERER`, `OPENROUTER_TITLE` | Optional OpenRouter attribution |
| `BAOYU_IMAGE_GEN_MAX_WORKERS` | Override batch worker cap |
| `BAOYU_IMAGE_GEN_<PROVIDER>_CONCURRENCY` | Per-provider concurrency (e.g., `BAOYU_IMAGE_GEN_REPLICATE_CONCURRENCY`; for codex-cli use `BAOYU_IMAGE_GEN_CODEX_CLI_CONCURRENCY`) |
| `BAOYU_IMAGE_GEN_<PROVIDER>_START_INTERVAL_MS` | Per-provider start-gap |
| `BAOYU_CODEX_IMAGEGEN_BIN` | Override the codex-imagegen wrapper path for the `codex-cli` provider (default: bundled `scripts/codex-imagegen/main.ts`; accepts `.ts` or legacy `.sh`/binary) |
| `BAOYU_CODEX_IMAGEGEN_CACHE_DIR` | Enable idempotency cache for the `codex-cli` provider (off by default) |
| `BAOYU_CODEX_IMAGEGEN_TIMEOUT_MS` | Per-attempt `codex exec` timeout for the `codex-cli` provider (default: 300000 ms) |
| `BAOYU_CODEX_IMAGEGEN_RETRIES` | Wrapper-side retry attempts on retryable errors for the `codex-cli` provider (default: 2) |
| `BAOYU_CODEX_IMAGEGEN_LOG_FILE` | Append JSONL diagnostic log for the `codex-cli` provider |

**Load priority**: CLI args > EXTEND.md > env vars > `<cwd>/.baoyu-skills/.env` > `~/.baoyu-skills/.env`

## Codex/ChatGPT OAuth Is Not an OpenAI API Key

`--provider openai` calls the standard OpenAI Images API (`/v1/images/generations`, `/v1/images/edits`) and requires `OPENAI_API_KEY`. A Codex/ChatGPT login is a different entitlement: never paste a Codex OAuth token into `OPENAI_API_KEY` or just point `OPENAI_BASE_URL` at a Codex backend. Do not modify the `openai` provider to silently consume Codex OAuth.

To use a Codex subscription without an API key:

- Codex runtime: native `imagegen` skill/tool.
- Non-Codex runtime with `codex` CLI installed and logged in: `--provider codex-cli` (preferred; same retry/cache/batch flow). It spawns the bundled `scripts/codex-imagegen/main.ts` (upstream: `packages/baoyu-codex-imagegen/src/main.ts`).
- Hermes runtime with native `image_generate`: use as fallback; state whether refs were passed directly or reconstructed from extracted traits.

**Fallback**: if `--provider openai` fails only because `OPENAI_API_KEY` is missing and one of the backends above is available, use it rather than leaving the user waiting, and say whether it was true reference-image generation or a text reconstruction from visual traits. Details: `references/codex-oauth-vs-openai-api-key.md`, `references/codex-image2-fallback.md`.

## Model Resolution

Priority for every provider: CLI `--model <id>` > EXTEND.md `default_model.[provider]` > env `<PROVIDER>_IMAGE_MODEL` > built-in default.

- **OpenAI**: default `gpt-image-2.5-flare` (fastest). `gpt-image-2.5-sunburst` is most capable for complex scenes and precise edits; `gpt-image-2`, `gpt-image-1.5`, `gpt-image-1` and dated snapshots (e.g. `gpt-image-2.5-flare-2026-09-08`, `gpt-image-2-2026-04-21`) stay selectable.
- **Google**: default `gemini-3-pro-image`. `gemini-3.1-flash-image` is faster/cheaper; `gemini-3.1-flash-lite-image` is cheapest and 1K-only (`--quality 2k` / `--imageSize 2K|4K` clamp to 1K with a warning).
- **DashScope**: default `qwen-image-2.0-pro`; `qwen-image-3.0-pro` is the newest flagship with the same sizing rules.
- **Azure**: `--model` / `default_model.azure` is the deployment name (`AZURE_OPENAI_DEPLOYMENT`, alias `AZURE_OPENAI_IMAGE_MODEL`). Use `gpt-image-2.5-flare` if the deployment is named after the model, else the exact custom name.

Before each generation, display:

- `Using [provider] / [model]`
- `Switch model: --model <id> | EXTEND.md default_model.[provider] | env <PROVIDER>_IMAGE_MODEL`

## OpenAI-Compatible Gateway Dialects

`provider=openai` only means OpenAI-compatible auth/routing, not native image semantics. Set `default_image_api_dialect` (EXTEND.md), `OPENAI_IMAGE_API_DIALECT`, or `--imageApiDialect`:

- `openai-native`: pixel `size` (`1536x1024`) and native quality fields — OpenAI and strict clones
- `ratio-metadata`: aspect-ratio `size` (`16:9`) + `metadata.resolution` (`1K|2K|4K`) + `metadata.orientation` — gateways fronting Gemini or similar. Text-to-image only; reference edits need `openai-native` or a provider with first-class edit support.

## Provider-Specific Guides

Read when the user picks that provider or asks for non-default behavior:

| Provider | Reference |
|----------|-----------|
| DashScope (Qwen-Image families, custom sizes) | `references/providers/dashscope.md` |
| Z.AI (GLM-Image, cogview-4) | `references/providers/zai.md` |
| MiniMax (image-01, subject-reference) | `references/providers/minimax.md` |
| OpenRouter (multimodal models, `/chat/completions` flow) | `references/providers/openrouter.md` |
| Replicate (nano-banana, Seedream, Wan) | `references/providers/replicate.md` |
| Codex CLI (wraps bundled `scripts/codex-imagegen/`; Codex login, no `OPENAI_API_KEY`) | `references/providers/codex-cli.md` |
| Agnes (agnes-image-2.5-flash, reference-image support) | `references/providers/agnes.md` |

## Provider Selection

1. `--ref` provided + no `--provider` → auto-select Google → OpenAI → Azure → OpenRouter → Replicate → Seedream → MiniMax → Agnes (MiniMax subject reference is specialized for character/portrait consistency)
2. `--provider` specified → use it (with `--ref`, must be google/openai/azure/openrouter/replicate/seedream/minimax/codex-cli/agnes)
3. Only one API key present → that provider
4. Multiple keys → Google → OpenAI → Azure → OpenRouter → DashScope → Z.AI → MiniMax → Replicate → Jimeng → Seedream → Agnes
5. `codex-cli` is **never auto-selected** — pin via `default_provider: codex-cli` or `--provider codex-cli`. Runs `codex exec` through the bundled `scripts/codex-imagegen/main.ts` (with `bun`) on the user's Codex subscription; requires `codex` on `PATH` with an active `codex login`.

## Quality Presets

| Preset | Google imageSize | OpenAI size | OpenRouter size | Replicate resolution | Use case |
|--------|------------------|-------------|-----------------|----------------------|----------|
| `normal` | 1K | 1024px target | 1K | 1K | Quick previews |
| `2k` (default) | 2K | 2048px target | 2K | 2K | Covers, illustrations, infographics |

Google/OpenRouter `imageSize` can be overridden with `--imageSize 1K|2K|4K`.

OpenAI native `gpt-image-2.5-*` / `gpt-image-2`: `normal` → `quality=medium` + low-latency valid size near the ratio; `2k` → `quality=high` + 2048px-class sizes (`2048x2048`, `2048x1152`, `1152x2048`). Use explicit `--size` for custom or 4K (e.g. `3840x2160`).

## Aspect Ratios

Supported: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `2.35:1`.

- Google multimodal: `imageConfig.aspectRatio`
- OpenAI: `gpt-image-2.5-*` / `gpt-image-2` use the closest valid custom size; older GPT Image and DALL·E use the closest fixed size
- OpenRouter: `imageGenerationOptions.aspect_ratio`; with only `--size <WxH>`, the ratio is inferred
- Replicate: model-specific — `google/nano-banana*` uses `aspect_ratio`, `bytedance/seedream-*` uses documented Replicate ratios, Wan 2.7 maps `--ar` to a concrete `size`
- MiniMax: official `aspect_ratio` values; `--size <WxH>` without `--ar` sends `width`/`height` for `image-01`

## Generation Mode

**Default**: sequential. **Batch parallel**: automatic when `--batchfile` has 2+ pending tasks.

| Situation | Prefer |
|-----------|--------|
| One image, or 1-2 simple images | Sequential |
| Multiple images with saved prompt files | Batch (`--batchfile`) — shared throttling/retries |
| Each image still needs its own reasoning / prompt writing / style exploration | Subagents |
| Input is `outline.md` + `prompts/` (e.g. from `baoyu-article-illustrator`) | Batch, payload built with `{baseDir}/scripts/build-batch.ts` |

Once prompt files are saved and the task is "generate all of these", prefer batch over subagents.

**Parallel behavior**: worker count auto, capped by config (built-in default 10), override with `--jobs <count>`; provider-specific throttling applies only in batch mode; each image retries up to 3 attempts; final output reports success count, failure count, and per-image failure reasons.

## Error Handling

- Missing API key → error with setup instructions (for OpenAI see the Codex fallback above)
- Generation failure → auto-retry up to 3 attempts per image
- Invalid aspect ratio → warning, proceed with default
- Reference images with unsupported provider/model → error with fix hint

## Extension Support

Custom configurations via EXTEND.md. See Step 0 for paths and schema.
