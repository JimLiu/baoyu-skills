---
name: baoyu-article-illustrator
description: Analyzes article structure, identifies positions requiring visual aids, and generates illustrations with Type × Style consistency. Defaults illustration text to the article's main language, and supports reference-image translation/localization by passing the original image to the generation model. Use when user asks to illustrate an article, add images, or generate images for article sections.
---

# Article Illustrator

Analyze articles, identify illustration positions, and generate images with Type × Style consistency.

For multi-image jobs, prefer building a `batch.json` and calling `baoyu-image-gen --batchfile` so image generation can run in parallel with retries and a final status summary.

## Two Dimensions

| Dimension | Controls | Examples |
|-----------|----------|----------|
| **Type** | Information structure | infographic, scene, flowchart, comparison, framework, timeline |
| **Style** | Visual aesthetics | vector-illustration, notion, warm, blueprint, editorial |

Combine freely: `--type infographic --style blueprint`

## Types

| Type | Best For |
|------|----------|
| `infographic` | Data, metrics, technical |
| `scene` | Narratives, emotional |
| `flowchart` | Processes, workflows |
| `comparison` | Side-by-side, options |
| `framework` | Models, architecture |
| `timeline` | History, evolution |
| `mixed` | Per-section optimization across multiple types |

## Styles

See [references/styles.md](references/styles.md) for the core style gallery and compatibility guidance.

## Workflow

```text
- [ ] Step 1: Pre-check (EXTEND.md, references, config)
- [ ] Step 2: Analyze content
- [ ] Step 3: Confirm settings
- [ ] Step 4: Generate outline
- [ ] Step 5: Generate prompts and images
- [ ] Step 6: Finalize
```

### Step 1: Pre-check

- Load `EXTEND.md`
- Confirm output location
- Save reference images if provided

```bash
# macOS, Linux, WSL, Git Bash
test -f .baoyu-skills/baoyu-article-illustrator/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-article-illustrator/EXTEND.md" && echo "xdg"
test -f "$HOME/.baoyu-skills/baoyu-article-illustrator/EXTEND.md" && echo "user"
```

```powershell
# PowerShell (Windows)
if (Test-Path .baoyu-skills/baoyu-article-illustrator/EXTEND.md) { "project" }
$xdg = if ($env:XDG_CONFIG_HOME) { $env:XDG_CONFIG_HOME } else { "$HOME/.config" }
if (Test-Path "$xdg/baoyu-skills/baoyu-article-illustrator/EXTEND.md") { "xdg" }
if (Test-Path "$HOME/.baoyu-skills/baoyu-article-illustrator/EXTEND.md") { "user" }
```

| Result | Action |
|--------|--------|
| Found | Read, parse, display summary |
| Not found | ⛔ Run [first-time-setup](references/config/first-time-setup.md) |

Full procedures: [references/workflow.md](references/workflow.md#step-1-pre-check)

### Step 2: Analyze

- Determine article type: technical / tutorial / methodology / narrative
- Identify sections where visuals materially improve understanding
- Recommend illustration type, density, and style
- Detect the article's main language and use it as the default language for visible text in generated illustrations unless the user explicitly requests otherwise
- Visualize the underlying concept, not literal metaphors

### Step 3: Confirm Settings

Use one confirmation round for:

- Type
- Density
- Style
- Image text language only when the user explicitly wants to override the article's main language or the article is genuinely mixed-language

### Step 4: Generate Outline

Save `outline.md` with frontmatter and entries like:

```yaml
## Illustration 1
**Position**: [section/paragraph]
**Purpose**: [why]
**Visual Content**: [what]
**Filename**: 01-infographic-topic.png
```

### Step 5: Generate Prompts and Images

1. Create one saved prompt file per illustration in `prompts/`
2. Use type-specific templates with structured sections such as `ZONES`, `LABELS`, `COLORS`, `STYLE`, `ASPECT`
3. If the user did not specify a language, all visible text in the illustration must default to the article's main language
4. Labels must include article-specific numbers, terms, metrics, or quotes
5. When translating or localizing an existing image, pass the original image to the image model as a real reference image instead of describing it only in text
6. For acronym frameworks, named methodologies, mnemonics, and fixed step diagrams, extract the canonical wording from the article and include the exact target labels in the prompt
7. Do not generate from ad-hoc inline prompts when prompt files are expected

When pending illustrations >= 2:

1. Build `batch.json` from `outline.md + prompts/`
2. Call `baoyu-image-gen --batchfile`
3. Let `baoyu-image-gen` handle:
   - parallel generation
   - per-image retries up to 3 attempts
   - tuned provider throttling
   - final success/failure summary

### Step 6: Finalize

- Insert image references back into the article
- Prefer preserving the user's markdown conventions
- Report total generated images and any failures

## Output Directory

Typical structure:

```text
illustrations/{topic-slug}/
|- source-{slug}.md
|- outline.md
|- prompts/
|- batch.json
\- NN-{type}-{slug}.png
```

## References

| File | Content |
|------|---------|
| [references/workflow.md](references/workflow.md) | Detailed workflow |
| [references/usage.md](references/usage.md) | Command syntax |
| [references/styles.md](references/styles.md) | Style gallery |
| [references/prompt-construction.md](references/prompt-construction.md) | Prompt templates |
| [references/config/first-time-setup.md](references/config/first-time-setup.md) | First-time setup |
