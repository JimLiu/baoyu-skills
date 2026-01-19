---
name: baoyu-compress-image
description: Cross-platform image compression skill. Converts images to WebP by default with PNG-to-PNG support. Uses system tools (sips, cwebp, ImageMagick) with Sharp fallback.
---

# Image Compressor

Cross-platform image compression with WebP default output, PNG-to-PNG support, preferring system tools with Sharp fallback.

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.ts`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | CLI entry point for image compression |

## Quick Start

```bash
# Compress to WebP (default)
npx -y bun ${SKILL_DIR}/scripts/main.ts image.png

# Keep original format (PNG → PNG)
npx -y bun ${SKILL_DIR}/scripts/main.ts image.png --format png

# Custom quality
npx -y bun ${SKILL_DIR}/scripts/main.ts image.png -q 75

# Process directory
npx -y bun ${SKILL_DIR}/scripts/main.ts ./images/ -r
```

## Commands

### Single File Compression

```bash
# Basic (converts to WebP, replaces original)
npx -y bun ${SKILL_DIR}/scripts/main.ts image.png

# Custom output path
npx -y bun ${SKILL_DIR}/scripts/main.ts image.png -o compressed.webp

# Keep original file
npx -y bun ${SKILL_DIR}/scripts/main.ts image.png --keep

# Custom quality (0-100, default: 80)
npx -y bun ${SKILL_DIR}/scripts/main.ts image.png -q 75

# Keep original format
npx -y bun ${SKILL_DIR}/scripts/main.ts image.png -f png
```

### Directory Processing

```bash
# Process all images in directory
npx -y bun ${SKILL_DIR}/scripts/main.ts ./images/

# Recursive processing
npx -y bun ${SKILL_DIR}/scripts/main.ts ./images/ -r

# With custom quality
npx -y bun ${SKILL_DIR}/scripts/main.ts ./images/ -r -q 75
```

### Output Formats

```bash
# Plain text (default)
npx -y bun ${SKILL_DIR}/scripts/main.ts image.png

# JSON output
npx -y bun ${SKILL_DIR}/scripts/main.ts image.png --json
```

## Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `<input>` | | Input file or directory | Required |
| `--output <path>` | `-o` | Output path | Same path, new extension |
| `--format <fmt>` | `-f` | webp, png, jpeg | webp |
| `--quality <n>` | `-q` | Quality 0-100 | 80 |
| `--keep` | `-k` | Keep original file | false |
| `--recursive` | `-r` | Process directories recursively | false |
| `--json` | | JSON output | false |
| `--help` | `-h` | Show help | |

## Compressor Selection

Priority order (auto-detected):

1. **sips** (macOS built-in, WebP support since macOS 11)
2. **cwebp** (Google's official WebP tool)
3. **ImageMagick** (`convert` command)
4. **Sharp** (npm package, auto-installed by Bun)

The skill automatically selects the best available compressor.

## Output Format

### Text Mode (default)

```
image.png → image.webp (245KB → 89KB, 64% reduction)
```

### JSON Mode

```json
{
  "input": "image.png",
  "output": "image.webp",
  "inputSize": 250880,
  "outputSize": 91136,
  "ratio": 0.36,
  "compressor": "sips"
}
```

### Directory JSON Mode

```json
{
  "files": [...],
  "summary": {
    "totalFiles": 10,
    "totalInputSize": 2508800,
    "totalOutputSize": 911360,
    "ratio": 0.36,
    "compressor": "sips"
  }
}
```

## Examples

### Compress single image

```bash
npx -y bun ${SKILL_DIR}/scripts/main.ts photo.png
# photo.png → photo.webp (1.2MB → 340KB, 72% reduction)
```

### Compress with custom quality

```bash
npx -y bun ${SKILL_DIR}/scripts/main.ts photo.png -q 60
# photo.png → photo.webp (1.2MB → 280KB, 77% reduction)
```

### Keep original format

```bash
npx -y bun ${SKILL_DIR}/scripts/main.ts screenshot.png -f png --keep
# screenshot.png → screenshot-compressed.png (500KB → 380KB, 24% reduction)
```

### Process entire directory

```bash
npx -y bun ${SKILL_DIR}/scripts/main.ts ./screenshots/ -r
# Processed 15 files: 12.5MB → 4.2MB (66% reduction)
```

### Get JSON for scripting

```bash
npx -y bun ${SKILL_DIR}/scripts/main.ts image.png --json | jq '.ratio'
```

## Extension Support

Custom configurations via EXTEND.md.

**Check paths** (priority order):
1. `.baoyu-skills/baoyu-compress-image/EXTEND.md` (project)
2. `~/.baoyu-skills/baoyu-compress-image/EXTEND.md` (user)

If found, load before workflow. Extension content overrides defaults.
