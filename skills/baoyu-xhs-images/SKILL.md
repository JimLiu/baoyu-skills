---
name: baoyu-xhs-images
description: Generates Xiaohongshu (Little Red Book) infographic series with 10 visual styles and 8 layouts. Breaks content into 1-10 cartoon-style images optimized for XHS engagement. Use when user mentions "小红书图片", "XHS images", "RedNote infographics", "小红书种草", or wants social media infographics for Chinese platforms.
---

# Xiaohongshu Infographic Series Generator

Break down complex content into eye-catching infographic series for Xiaohongshu with multiple style options.

## Usage

```bash
# Auto-select style and layout based on content
/baoyu-xhs-images posts/ai-future/article.md

# Specify style
/baoyu-xhs-images posts/ai-future/article.md --style notion

# Specify layout
/baoyu-xhs-images posts/ai-future/article.md --layout dense

# Combine style and layout
/baoyu-xhs-images posts/ai-future/article.md --style notion --layout list

# Direct content input
/baoyu-xhs-images
[paste content]

# Direct input with options
/baoyu-xhs-images --style bold --layout comparison
[paste content]
```

## Options

| Option | Description |
|--------|-------------|
| `--style <name>` | Visual style (see Style Gallery) |
| `--layout <name>` | Information layout (see Layout Gallery) |

## Style & Layout

Two independently combinable dimensions. Example: `--style notion --layout dense`.

**Styles** (10): cute (default), fresh, warm, bold, minimal, retro, pop, notion, chalkboard, study-notes. Detailed definitions: `references/presets/<style>.md`

**Layouts** (8): sparse (default, 1-2 points), balanced (3-4), dense (5-8), list (4-7 items), comparison, flow (3-6 steps), mindmap (4-8 branches), quadrant. Detailed definitions: `references/elements/canvas.md`

## Auto Selection

| Content Signals | Style | Layout |
|-----------------|-------|--------|
| Beauty, fashion, cute, girl, pink | `cute` | sparse/balanced |
| Health, nature, clean, fresh, organic | `fresh` | balanced/flow |
| Life, story, emotion, feeling, warm | `warm` | balanced |
| Warning, important, must, critical | `bold` | list/comparison |
| Professional, business, elegant, simple | `minimal` | sparse/balanced |
| Classic, vintage, old, traditional | `retro` | balanced |
| Fun, exciting, wow, amazing | `pop` | sparse/list |
| Knowledge, concept, productivity, SaaS | `notion` | dense/list |
| Education, tutorial, learning, teaching, classroom | `chalkboard` | balanced/dense |
| Notes, handwritten, study guide, knowledge, realistic, photo | `study-notes` | dense/list/mindmap |

## Outline Strategies

Three differentiated outline strategies for different content goals:

### Strategy A: Story-Driven (故事驱动型)

| Aspect | Description |
|--------|-------------|
| **Concept** | Personal experience as main thread, emotional resonance first |
| **Features** | Start from pain point, show before/after change, strong authenticity |
| **Best for** | Reviews, personal shares, transformation stories |
| **Structure** | Hook → Problem → Discovery → Experience → Conclusion |

### Strategy B: Information-Dense (信息密集型)

| Aspect | Description |
|--------|-------------|
| **Concept** | Value-first, efficient information delivery |
| **Features** | Clear structure, explicit points, professional credibility |
| **Best for** | Tutorials, comparisons, product reviews, checklists |
| **Structure** | Core conclusion → Info card → Pros/Cons → Recommendation |

### Strategy C: Visual-First (视觉优先型)

| Aspect | Description |
|--------|-------------|
| **Concept** | Visual impact as core, minimal text |
| **Features** | Large images, atmospheric, instant appeal |
| **Best for** | High-aesthetic products, lifestyle, mood-based content |
| **Structure** | Hero image → Detail shots → Lifestyle scene → CTA |

## File Structure

Output directory: `xhs-images/{topic-slug}/` containing `source-*.{ext}`, `analysis.md`, `outline-strategy-{a,b,c}.md`, `outline.md`, `prompts/NN-{type}-[slug].md`, and `NN-{type}-[slug].png`.

**Slug**: 2-4 words kebab-case from topic (e.g., "AI工具推荐" → `ai-tools-recommend`). If directory exists, append timestamp.

## Workflow

```
0. Preferences (⛔ BLOCKING) → 1. Analyze → 2. Confirm content (⚠️ REQUIRED) → 3. Generate 3 outline variants → 4. Confirm outline + style (⚠️ REQUIRED) → 5. Generate images → 6. Report
```

### Step 0: Load Preferences (EXTEND.md) ⛔ BLOCKING

Check EXTEND.md existence (project-level `.baoyu-skills/baoyu-xhs-images/EXTEND.md`, then user-level `$HOME/.baoyu-skills/baoyu-xhs-images/EXTEND.md`). If found, read and display summary. If not found, MUST complete first-time setup before ANY other steps — do NOT proceed to content analysis.

**First-Time Setup**: Use AskUserQuestion with ALL questions in ONE call. See `references/config/first-time-setup.md`.

**Supports**: Watermark | Preferred style/layout | Custom style definitions | Language preference. Schema: `references/config/preferences-schema.md`

### Step 1: Analyze Content → `analysis.md`

Read source content, save it if needed, and perform deep analysis.

**Actions**:
1. **Save source content** (if not already a file):
   - If user provides a file path: use as-is
   - If user pastes content: save to `source.md` in target directory
   - **Backup rule**: If `source.md` exists, rename to `source-backup-YYYYMMDD-HHMMSS.md`
2. Read source content
3. **Deep analysis** following `references/workflows/analysis-framework.md`:
   - Content type classification (种草/干货/测评/教程/避坑...)
   - Hook analysis (爆款标题潜力)
   - Target audience identification
   - Engagement potential (收藏/分享/评论)
   - Visual opportunity mapping
   - Swipe flow design
4. Detect source language
5. Determine recommended image count (2-10)
6. **Generate clarifying questions** (see Step 2)
7. **Save to `analysis.md`**

### Step 2: Confirmation 1 - Content Understanding ⚠️

**Purpose**: Validate understanding + collect missing info. **Do NOT skip.**

**Display summary**:
- Content type + topic identified
- Key points extracted
- Tone detected
- Source images count

**Use AskUserQuestion** for:
1. Core selling point (multiSelect: true)
2. Target audience
3. Style preference: Authentic sharing / Professional review / Aesthetic mood / Auto
4. Additional context (optional)

**After response**: Update `analysis.md` → Step 3

### Step 3: Generate 3 Outline + Style Variants

Based on analysis + user context, create three distinct strategy variants. Each variant includes both **outline structure** and **visual style recommendation**.

**For each strategy**:

| Strategy | Filename | Outline | Recommended Style |
|----------|----------|---------|-------------------|
| A | `outline-strategy-a.md` | Story-driven: emotional, before/after | warm, cute, fresh |
| B | `outline-strategy-b.md` | Information-dense: structured, factual | notion, minimal, chalkboard |
| C | `outline-strategy-c.md` | Visual-first: atmospheric, minimal text | bold, pop, retro |

**Outline format** (YAML front matter + content):
```yaml
---
strategy: a  # a, b, or c
name: Story-Driven
style: warm  # recommended style for this strategy
style_reason: "Warm tones enhance emotional storytelling and personal connection"
elements:  # from style preset, can be customized in Step 4
  background: solid-pastel
  decorations: [clouds, stars-sparkles]
  emphasis: star-burst
  typography: highlight
layout: balanced  # primary layout
image_count: 5
---

## P1 Cover
**Type**: cover
**Hook**: "入冬后脸不干了🥹终于找到对的面霜"
**Visual**: Product hero shot with cozy winter atmosphere
**Layout**: sparse

## P2 Problem
**Type**: pain-point
**Message**: Previous struggles with dry skin
**Visual**: Before state, relatable scenario
**Layout**: balanced

...
```

**Differentiation requirements**:
- Each strategy MUST have different outline structure AND different recommended style
- Adapt page count: A typically 4-6, B typically 3-5, C typically 3-4
- Include `style_reason` explaining why this style fits the strategy
- Consider user's style preference from Step 2

Reference: `references/workflows/outline-template.md`

### Step 4: Confirmation 2 - Outline & Style & Elements Selection ⚠️

**Purpose**: User chooses outline strategy, confirms visual style, and customizes elements. **Do NOT skip.**

**Display each strategy**:
- Strategy name + page count + recommended style
- Page-by-page summary (P1 → P2 → P3...)

**Use AskUserQuestion** with three questions:

**Question 1: Outline Strategy**
- Strategy A (Recommended if "authentic sharing")
- Strategy B (Recommended if "professional review")
- Strategy C (Recommended if "aesthetic mood")
- Combine: specify pages from each

**Question 2: Visual Style**
- Use strategy's recommended style (show which style)
- Or select from: cute / fresh / warm / bold / minimal / retro / pop / notion / chalkboard
- Or type custom style description

**Question 3: Visual Elements** (show after style selection)
Display the selected style's default elements from preset, then ask:
- Use style defaults (Recommended) - show preview: background, decorations, emphasis
- Adjust background - options: solid-pastel / solid-saturated / gradient-linear / gradient-radial / paper-texture / grid
- Adjust decorations - options: hearts / stars-sparkles / flowers / clouds / leaves / confetti
- Type custom element preferences

**After response**:
- Single strategy → copy to `outline.md` with confirmed style
- Combination → merge specified pages with confirmed style
- Custom request → regenerate based on feedback
- Style defaults → use preset's Element Combination as-is
- Background adjustment → update elements.background with user choice
- Decorations adjustment → update elements.decorations with user choice
- Custom elements → parse user's preferences into elements fields
- Update `outline.md` frontmatter with final style and elements

### Step 5: Generate Images

With confirmed outline + style + layout. **Backup rule** (applies to all files): If file exists, rename to `{name}-backup-YYYYMMDD-HHMMSS.{ext}` before writing.

**Visual Consistency**: Generate image 1 (cover) first without `--ref`, then use image 1 as `--ref` for ALL subsequent images to anchor character/style consistency.

**For each image**: Save prompt to `prompts/NN-{type}-[slug].md` → Generate image → Report progress. Apply watermark if enabled in preferences (see `references/config/watermark-guide.md`).

**Session Management**: Use same session ID (`xhs-{topic-slug}-{timestamp}`) for all images to maintain consistency.

### Step 6: Completion Report

```
Xiaohongshu Infographic Series Complete!

Topic: [topic]
Strategy: [A/B/C/Combined]
Style: [style name]
Layout: [layout name or "varies"]
Location: [directory path]
Images: N total

✓ analysis.md
✓ outline-strategy-a.md
✓ outline-strategy-b.md
✓ outline-strategy-c.md
✓ outline.md (selected: [strategy])

Files:
- 01-cover-[slug].png ✓ Cover (sparse)
- 02-content-[slug].png ✓ Content (balanced)
- 03-content-[slug].png ✓ Content (dense)
- 04-ending-[slug].png ✓ Ending (sparse)
```

## Image Modification

| Action | Steps |
|--------|-------|
| **Edit** | **Update prompt file FIRST** → Regenerate with same session ID |
| **Add** | Specify position → Create prompt → Generate → Renumber subsequent files (NN+1) → Update outline |
| **Delete** | Remove files → Renumber subsequent (NN-1) → Update outline |

**IMPORTANT**: When updating images, ALWAYS update the prompt file (`prompts/NN-{type}-[slug].md`) FIRST before regenerating. This ensures changes are documented and reproducible.

## Content Breakdown Principles

Cover (image 1): hook + visual impact → `sparse`. Content (middle): core value per image → `balanced`/`dense`/`list`/`comparison`/`flow`. Ending (last): CTA/summary → `sparse` or `balanced`. All style × layout combinations work; `notion` is the most versatile across all layouts.

## References

| Category | Files |
|----------|-------|
| Elements | `elements/canvas.md`, `elements/image-effects.md`, `elements/typography.md`, `elements/decorations.md` |
| Presets | `presets/<name>.md` — style definitions |
| Workflows | `workflows/analysis-framework.md`, `workflows/outline-template.md`, `workflows/prompt-assembly.md` |
| Config | `config/preferences-schema.md`, `config/first-time-setup.md`, `config/watermark-guide.md` |

## Notes

- Auto-retry once on failure | Cartoon alternatives for sensitive figures
- Use confirmed language preference | Maintain style consistency
- **Two confirmation points required** (Steps 2 & 4) - do not skip

## Extension Support

Custom configurations via EXTEND.md. See **Step 0** for paths and supported options.
