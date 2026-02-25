---
name: baoyu-image-gen
description: AI image generation with OpenAI, Google, DashScope and Replicate APIs. Supports text-to-image, reference images, aspect ratios. Sequential by default; parallel generation available on request. Use when user asks to generate, create, or draw images.
---

# Image Generation (AI SDK)

Official API-based image generation. Supports OpenAI, Google, DashScope (阿里通义万象) and Replicate providers.

## Script Directory

**Agent Execution**:
1. `SKILL_DIR` = this SKILL.md file's directory
2. Script path = `${SKILL_DIR}/scripts/main.ts`

## Preferences (EXTEND.md)

Use Bash to check EXTEND.md existence (priority order):

```bash
# Check project-level first
test -f .baoyu-skills/baoyu-image-gen/EXTEND.md && echo "project"

# Then user-level (cross-platform: $HOME works on macOS/Linux/WSL)
test -f "$HOME/.baoyu-skills/baoyu-image-gen/EXTEND.md" && echo "user"
```

┌──────────────────────────────────────────────────┬───────────────────┐
│                       Path                       │     Location      │
├──────────────────────────────────────────────────┼───────────────────┤
│ .baoyu-skills/baoyu-image-gen/EXTEND.md          │ Project directory │
├──────────────────────────────────────────────────┼───────────────────┤
│ $HOME/.baoyu-skills/baoyu-image-gen/EXTEND.md    │ User home         │
└──────────────────────────────────────────────────┴───────────────────┘

┌───────────┬───────────────────────────────────────────────────────────────────────────┐
│  Result   │                                  Action                                   │
├───────────┼───────────────────────────────────────────────────────────────────────────┤
│ Found     │ Read, parse, apply settings                                               │
├───────────┼───────────────────────────────────────────────────────────────────────────┤
│ Not found │ Use defaults                                                              │
└───────────┴───────────────────────────────────────────────────────────────────────────┘

**EXTEND.md Supports**: Default provider | Default quality | Default aspect ratio | Default image size | Default models

Schema: `references/config/preferences-schema.md`

## Usage

```bash
# Basic
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image cat.png

# With aspect ratio
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A landscape" --image out.png --ar 16:9

# High quality
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image out.png --quality 2k

# From prompt files
npx -y bun ${SKILL_DIR}/scripts/main.ts --promptfiles system.md content.md --image out.png

# With reference images (Google multimodal or OpenAI edits)
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "Make blue" --image out.png --ref source.png

# With reference images (explicit provider/model)
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "Make blue" --image out.png --provider google --model gemini-3-pro-image-preview --ref source.png

# Specific provider
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image out.png --provider openai

# DashScope (阿里通义万象)
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "一只可爱的猫" --image out.png --provider dashscope

# Replicate (google/nano-banana-pro)
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image out.png --provider replicate

# Replicate with specific model
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image out.png --provider replicate --model google/nano-banana
```

## Options

| Option | Description |
|--------|-------------|
| `--prompt <text>`, `-p` | Prompt text |
| `--promptfiles <files...>` | Read prompt from files (concatenated) |
| `--image <path>` | Output image path (required) |
| `--provider google\|openai\|dashscope\|replicate` | Force provider (default: google) |
| `--model <id>`, `-m` | Model ID (`--ref` with OpenAI requires GPT Image model, e.g. `gpt-image-1.5`) |
| `--ar <ratio>` | Aspect ratio (e.g., `16:9`, `1:1`, `4:3`) |
| `--size <WxH>` | Size (e.g., `1024x1024`) |
| `--quality normal\|2k` | Quality preset (default: 2k) |
| `--imageSize 1K\|2K\|4K` | Image size for Google (default: from quality) |
| `--ref <files...>` | Reference images. Supported by Google multimodal and OpenAI edits (GPT Image models). If provider omitted: Google first, then OpenAI |
| `--n <count>` | Number of images |
| `--json` | JSON output |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `GOOGLE_API_KEY` | Google API key |
| `DASHSCOPE_API_KEY` | DashScope API key (阿里云) |
| `REPLICATE_API_TOKEN` | Replicate API token |
| `OPENAI_IMAGE_MODEL` | OpenAI model override |
| `GOOGLE_IMAGE_MODEL` | Google model override |
| `DASHSCOPE_IMAGE_MODEL` | DashScope model override (default: z-image-turbo) |
| `REPLICATE_IMAGE_MODEL` | Replicate model override (default: google/nano-banana-pro) |
| `OPENAI_BASE_URL` | Custom OpenAI endpoint |
| `GOOGLE_BASE_URL` | Custom Google endpoint |
| `DASHSCOPE_BASE_URL` | Custom DashScope endpoint |
| `REPLICATE_BASE_URL` | Custom Replicate endpoint |

**Load Priority**: CLI args > EXTEND.md > env vars > `<cwd>/.baoyu-skills/.env` > `~/.baoyu-skills/.env`

## Replicate Model Configuration

Model priority: CLI `--model` > EXTEND.md `default_model.replicate` > env `REPLICATE_IMAGE_MODEL` > default `google/nano-banana-pro`.

Model formats: `owner/name` (official) or `owner/name:version` (community).

## Provider Selection

1. `--ref` provided + no `--provider` → auto-select Google first, then OpenAI, then Replicate
2. `--provider` specified → use it (if `--ref`, must be `google`, `openai`, or `replicate`)
3. Only one API key available → use that provider
4. Multiple available → default to Google

## Quality Presets

| Preset | Google imageSize | OpenAI Size | Use Case |
|--------|------------------|-------------|----------|
| `normal` | 1K | 1024px | Quick previews |
| `2k` (default) | 2K | 2048px | Covers, illustrations, infographics |

**Google imageSize**: Can be overridden with `--imageSize 1K|2K|4K`

## Aspect Ratios

Supported: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `2.35:1`

- Google multimodal: uses `imageConfig.aspectRatio`
- Google Imagen: uses `aspectRatio` parameter
- OpenAI: maps to closest supported size

## Generation Mode

**Default**: Sequential generation (one image at a time). This ensures stable output and easier debugging.

**Parallel Generation**: Only use when user explicitly requests parallel/concurrent generation.

| Mode | When to Use |
|------|-------------|
| Sequential (default) | Normal usage, single images, small batches |
| Parallel | User explicitly requests, large batches (10+) |

**Parallel Settings** (when requested):

| Setting | Value |
|---------|-------|
| Recommended concurrency | 4 subagents |
| Max concurrency | 8 subagents |
| Use case | Large batch generation when user requests parallel |

**Agent Implementation** (parallel mode only):
```
# Launch multiple generations in parallel using Task tool
# Each Task runs as background subagent with run_in_background=true
# Collect results via TaskOutput when all complete
```

## Post-Generation Validation

After each image generation:
1. Verify output file exists: `test -f <output-path>`
2. Check file is non-empty: `test -s <output-path>`
3. If missing or empty, auto-retry once before reporting error

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| Missing API key | No key for selected provider | Set the appropriate env var (e.g., `GOOGLE_API_KEY`) |
| Generation failure | API error or timeout | Auto-retries once; if persistent, try different provider |
| Invalid aspect ratio | Unsupported ratio for provider | Falls back to default; use supported ratios |
| Reference image error | Provider doesn't support `--ref` | Switch to Google multimodal or OpenAI GPT Image edits |

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
