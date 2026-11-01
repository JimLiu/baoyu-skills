---
name: baoyu-compress-image
description: Compresses images to WebP (default) or PNG with automatic tool selection. Use when user asks to "compress image", "optimize image", "convert to webp", or reduce image file size.
version: 1.56.1
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-compress-image
    requires:
      anyBins:
        - bun
        - npx
---

# Image Compressor

Tool auto-selection order: sips → cwebp → ImageMagick → Sharp.

## Script Directory

`{baseDir}` = this SKILL.md's directory. Resolve `${BUN_X}`: `bun` if installed; else `npx -y bun`; else suggest installing bun. Replace `{baseDir}` and `${BUN_X}` with actual values.

| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Image compression CLI |

## Preferences (EXTEND.md)

First found wins:

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-compress-image/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-compress-image/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-compress-image/EXTEND.md` | User home |

If none found, use defaults. **EXTEND.md supports**: default format, default quality, keep-original preference.

## Usage

```bash
${BUN_X} {baseDir}/scripts/main.ts <input> [options]
${BUN_X} {baseDir}/scripts/main.ts image.png                    # → WebP, replaces original
${BUN_X} {baseDir}/scripts/main.ts image.png -f png --keep      # keep PNG format and original
${BUN_X} {baseDir}/scripts/main.ts ./images/ -r -q 75           # directory, recursive
```

Output: `image.png → image.webp (245KB → 89KB, 64% reduction)`

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

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
