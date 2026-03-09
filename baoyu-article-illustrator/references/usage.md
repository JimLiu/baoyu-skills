# Usage

## Core Flow

```bash
# Analyze article and plan illustrations
/baoyu-article-illustrator path/to/article.md

# Specify type
/baoyu-article-illustrator path/to/article.md --type infographic

# Specify style
/baoyu-article-illustrator path/to/article.md --style blueprint

# Specify density
/baoyu-article-illustrator path/to/article.md --density rich
```

## Batch Generation Integration

When an article has 2 or more pending illustrations, use batch mode.

### Step 1: Build batch tasks from outline + prompts

```bash
npx -y tsx scripts/build-batch.ts \
  --outline outline.md \
  --prompts prompts \
  --output batch.json \
  --images-dir attachments \
  --provider replicate \
  --model google/nano-banana-pro \
  --ar 16:9 \
  --quality 2k
```

### Step 2: Run baoyu-image-gen batch mode

```bash
npx.cmd -y tsx ../baoyu-image-gen/scripts/main.ts --batchfile batch.json --jobs 2 --json
```

## What batch mode gives you

- Automatic parallel generation when pending images >= 2
- Tuned provider throttling for faster throughput without obvious RPM bursts
- Automatic retries up to 3 attempts per image
- Final batch summary with total success count, failure count, and failure reasons

## Recommended Defaults

- Provider: `replicate`
- Model: `google/nano-banana-pro`
- Aspect ratio: `16:9`
- Quality: `2k`
- Image text language: default to the article's main language unless the user explicitly asks for another language

## Localizing Existing Images

When the task is to translate text inside an existing image:

- Save the original image locally first
- Pass the original image through `--ref`
- Tell the model to replace only the text language while preserving layout and non-text elements
- Prefer `quality normal` for faster edit-style iterations on Replicate when visual fidelity is already good

## Input Modes

| Mode | Trigger | Output Directory |
|------|---------|------------------|
| File path | `path/to/article.md` | Use preference or ask |
| Paste content | No path argument | `illustrations/{topic-slug}/` |
