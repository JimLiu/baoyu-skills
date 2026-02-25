---
name: baoyu-compress-image
description: Compresses images to WebP (default) or PNG with automatic tool selection. Use when user asks to "compress image", "optimize image", "convert to webp", or reduce image file size.
---

# Image Compressor

Compresses images using best available tool (sips → cwebp → ImageMagick → Sharp).

## Script Directory

Scripts in `scripts/` subdirectory. Replace `${SKILL_DIR}` with this SKILL.md's directory path.

| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Image compression CLI |

## Preferences (EXTEND.md)

Check EXTEND.md existence (project-level `.baoyu-skills/baoyu-compress-image/EXTEND.md`, then user-level `$HOME/.baoyu-skills/baoyu-compress-image/EXTEND.md`):

```bash
test -f .baoyu-skills/baoyu-compress-image/EXTEND.md && echo "project"
test -f "$HOME/.baoyu-skills/baoyu-compress-image/EXTEND.md" && echo "user"
```

| Result | Action |
|--------|--------|
| Found | Read, parse, apply settings. If parsing fails, warn user and use defaults |
| Not found | Use defaults (webp format, quality 80) |

**Supports**: Default format | Default quality | Keep original preference

## Usage

```bash
npx -y bun ${SKILL_DIR}/scripts/main.ts <input> [options]
```

## Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `<input>` | | File or directory | Required |
| `--output` | `-o` | Output path | Same path, new ext |
| `--format` | `-f` | webp, png, jpeg | webp |
| `--quality` | `-q` | Quality 0-100 | 80 |
| `--keep` | `-k` | Keep original | false |
| `--recursive` | `-r` | Process subdirs | false |
| `--json` | | JSON output | false |

## Examples

```bash
# Single file → WebP (replaces original)
npx -y bun ${SKILL_DIR}/scripts/main.ts image.png

# Keep PNG format
npx -y bun ${SKILL_DIR}/scripts/main.ts image.png -f png --keep

# Directory recursive
npx -y bun ${SKILL_DIR}/scripts/main.ts ./images/ -r -q 75

# JSON output
npx -y bun ${SKILL_DIR}/scripts/main.ts image.png --json
```

**Output**:
```
image.png → image.webp (245KB → 89KB, 64% reduction)
```

## Post-Compression Verification

After compression, verify the output:

```bash
# Verify output exists and is non-empty
test -s output.webp && echo "OK" || echo "FAIL: output missing or empty"
```

When using `--json`, parse the JSON output to confirm success and check reported file size reduction. If output is missing, check for error messages and retry. **Tip**: Use `--keep` flag to preserve originals when compressing important files.

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
