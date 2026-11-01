# Partial Workflows

| Option | Steps Executed | Output |
|--------|----------------|--------|
| `--storyboard-only` | 1-3 | `storyboard.md` + `characters/` |
| `--prompts-only` | 1-5 | + `prompts/*.md` |
| `--images-only` | 7-9 | + images + PDF |
| `--regenerate N` | 7 (partial) | Specific page(s) + PDF |

## `--storyboard-only`

```bash
/baoyu-comic content.md --storyboard-only
```

Steps 1-3 only; stop after storyboard + characters. Output: `analysis.md`, `storyboard.md`, `characters/characters.md`. For reviewing/editing narrative, panel layouts, or custom characters before generation.

## `--prompts-only`

```bash
/baoyu-comic content.md --prompts-only
```

Steps 1-5; skip images. Output: `analysis.md`, `storyboard.md`, `characters/characters.md`, `prompts/*.md`. For fine-tuning prompts before generation.

## `--images-only`

```bash
/baoyu-comic comic/topic-slug/ --images-only
```

Skip to Step 7, then 8-9.

**Prerequisites** (must exist in directory):
- `prompts/` directory with page prompt files
- `storyboard.md` with style information
- `characters/characters.md` with character definitions

**Output**: `characters/characters.png` (if not exists), `NN-{cover|page}-[slug].png` images, `{topic-slug}.pdf`.

## `--regenerate`

```bash
/baoyu-comic comic/topic-slug/ --regenerate 3       # single page
/baoyu-comic comic/topic-slug/ --regenerate 2,5,8   # multiple pages
/baoyu-comic comic/topic-slug/ --regenerate 0       # cover
```

Page numbering: `0` = cover, `1-N` = content pages.

**Workflow**: read existing prompts for the specified pages → regenerate only those images → regenerate PDF.

**Prerequisites** (must exist):
- `prompts/NN-{cover|page}-[slug].md` for specified pages
- `characters/characters.png` (for reference)

**Output**: regenerated `NN-{cover|page}-[slug].png` for specified pages; updated `{topic-slug}.pdf`.
