# Detailed Workflow Procedures

## Step 1: Pre-check

### 1.0 Detect and Save Reference Images

Check whether the user provided reference images.

| Input Type | Action |
|------------|--------|
| Image file path provided | Copy to `references/` so it can be passed through `--ref` |
| Image appears only in conversation | Ask the user for a file path if the task depends on faithful image editing |
| User cannot provide a file path | Extract style/palette verbally and append those traits to prompts, but do not pretend this is a true reference-edit workflow |

Rules:
- Only add `references` to prompt frontmatter if the files were actually saved to `references/`
- If the job is to translate or localize an existing image, a real saved reference image is required
- For localization jobs, prompt-only description is not enough; the original image must be passed to the image model

### 1.1 Determine Input Type

| Input | Output Directory | Next |
|-------|------------------|------|
| File path | Ask user or use preference | Continue |
| Pasted content | `illustrations/{topic-slug}/` | Continue |

### 1.2 Load Preferences (EXTEND.md)

Load project or user EXTEND.md first. If not found, complete first-time setup before continuing.

Supports:
- Watermark
- Preferred type/style
- Custom styles
- Default language
- Output directory

**Questions to include** (skip if preference exists or not applicable):

| Question | When to Ask | Options |
|----------|-------------|---------|
| Output directory | No `default_output_dir` in EXTEND.md | `{article-dir}/`, `{article-dir}/imgs/` (Recommended), `{article-dir}/illustrations/`, `illustrations/{topic-slug}/` |
| Existing images | Target dir has `.png/.jpg/.webp` files | `supplement`, `overwrite`, `regenerate` |
| Article update | Always (file path input) | `update`, `copy` |

**Preference Values** (if configured, skip asking):

| `default_output_dir` | Path |
|----------------------|------|
| `same-dir` | `{article-dir}/` |
| `imgs-subdir` | `{article-dir}/imgs/` |
| `illustrations-subdir` | `{article-dir}/illustrations/` |
| `independent` | `illustrations/{topic-slug}/` |

### 1.5 Load Preferences (EXTEND.md) ⛔ BLOCKING

**CRITICAL**: If EXTEND.md not found, MUST complete first-time setup before ANY other questions or steps. Do NOT proceed to reference images, do NOT ask about content, do NOT ask about type/style — ONLY complete the preferences setup first.

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
| Found | Read, parse, display summary → Continue |
| Not found | ⛔ **BLOCKING**: Run first-time setup ONLY ([config/first-time-setup.md](config/first-time-setup.md)) → Complete and save EXTEND.md → Then continue |

**Supports**: Watermark | Preferred type/style | Custom styles | Language | Output directory

---

## Step 2: Setup & Analyze

### 2.1 Analyze Content

Determine:
- Content type: technical / tutorial / methodology / narrative
- Illustration purpose: information / explanation / imagination
- Core arguments that should be visualized
- Positions where visuals materially improve understanding
- Recommended type, density, and style
- Article main language

Critical rule:
- If the article uses metaphors, do not illustrate them literally. Visualize the underlying concept.

### 2.2 Determine Image Text Language

Default rule:
- If the user does not specify a language, all visible text inside generated illustrations must use the article's main language

Ask only when:
- The user explicitly wants a different image-text language
- The article is genuinely mixed-language and the intended output language is ambiguous
- A saved preference conflicts with the article language and the user has asked to follow the saved preference

## Step 3: Confirm Settings

Use one confirmation round for:
- Illustration type
- Density
- Style
- Image text language only if an override is needed

## Step 4: Generate Outline

Save as `outline.md`:

```yaml
---
type: infographic
density: balanced
style: blueprint
image_count: 4
references:
  - ref_id: 01
    filename: 01-ref-diagram.png
    description: "Technical diagram showing system architecture"
---
```

Per illustration include:
- `Position`
- `Purpose`
- `Visual Content`
- `Type Application`
- `References` when used
- `Reference Usage` as `direct`, `style`, or `palette`
- `Filename`

## Step 5: Generate Images

### 5.1 Create Prompt Files

Every illustration must have a saved prompt file before generation begins.

Prompt requirements:
- `Layout`: overall composition
- `ZONES`: each visual area with concrete content
- `LABELS`: actual terms, numbers, metrics, or quotes from the article
- `COLORS`: specific colors or palette guidance
- `STYLE`: rendering and line treatment
- `ASPECT`: ratio such as `16:9`

Language rule:
- If the user did not specify a language, all visible text in the prompt should clearly request the article's main language

### 5.2 Batch-First Execution for Multi-Image Jobs

When pending illustrations >= 2:
1. Save all prompt files first
2. Build `batch.json` from `outline.md + prompts/`
3. Call `baoyu-image-gen --batchfile`
4. Reuse the batch summary to report:
   - total images
   - success count
   - failure count
   - explicit failure reasons

Benefits:
- Parallel generation when pending images >= 2
- Automatic retries up to 3 attempts per image
- Tuned provider throttling for better throughput without obvious RPM bursts
- Clear final batch summary

### 5.3 Process References

If references were saved in Step 1, verify the files exist before generation.

| Usage | Action | Example |
|-------|--------|---------|
| `direct` | Pass the file path through `--ref` | `--ref references/01-ref-brand.png` |
| `style` | Extract style traits and append to prompt text | "clean lines, soft gradients..." |
| `palette` | Extract colors and append to prompt text | "coral + mint brand palette" |

Critical localization rule:
- If the job is to translate or localize text inside an existing image, you must pass the original image through `--ref`
- Do not rely on prompt-only description for this workflow
- Make the prompt explicitly say to replace only the text language while preserving layout, composition, and non-text elements
- If the image contains an acronym framework, methodology, mnemonic, or fixed step names, extract the canonical wording from the source article first and include the exact target labels in the prompt
- Do not let the model improvise alternative step names when the original framework has a fixed letter-to-term mapping

### 5.4 Generate

For each illustration:
- Backup an existing output first if needed
- Include `--ref` when direct references are required
- For localization jobs, include the original image in `--ref`
- Generate the image
- On failure, let `baoyu-image-gen` retry up to 3 attempts in batch mode or retry once manually in single-image mode

## Step 6: Finalize

### 6.1 Update Article

Insert image references back into the article while preserving the user's markdown conventions.

### 6.2 Output Summary

Summarize:
- article path
- type / density / style
- output directory
- total images generated
- any failures and their reasons
