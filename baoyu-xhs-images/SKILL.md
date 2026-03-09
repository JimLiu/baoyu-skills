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

## Two Dimensions

| Dimension | Controls | Options |
|-----------|----------|---------|
| **Style** | Visual aesthetics: colors, lines, decorations | cute, fresh, warm, bold, minimal, retro, pop, notion, chalkboard, study-notes |
| **Layout** | Information structure: density, arrangement | sparse, balanced, dense, list, comparison, flow, mindmap, quadrant |

Style × Layout can be freely combined. Example: `--style notion --layout dense` creates an intellectual-looking knowledge card with high information density.

## Style Gallery

| Style | Description |
|-------|-------------|
| `cute` (Default) | Sweet, adorable, girly - classic Xiaohongshu aesthetic |
| `fresh` | Clean, refreshing, natural |
| `warm` | Cozy, friendly, approachable |
| `bold` | High impact, attention-grabbing |
| `minimal` | Ultra-clean, sophisticated |
| `retro` | Vintage, nostalgic, trendy |
| `pop` | Vibrant, energetic, eye-catching |
| `notion` | Minimalist hand-drawn line art, intellectual |
| `chalkboard` | Colorful chalk on black board, educational |
| `study-notes` | Realistic handwritten photo style, blue pen + red annotations + yellow highlighter |

Detailed style definitions: `references/presets/<style>.md`

## Layout Gallery

| Layout | Description |
|--------|-------------|
| `sparse` (Default) | Minimal information, maximum impact (1-2 points) |
| `balanced` | Standard content layout (3-4 points) |
| `dense` | High information density, knowledge card style (5-8 points) |
| `list` | Enumeration and ranking format (4-7 items) |
| `comparison` | Side-by-side contrast layout |
| `flow` | Process and timeline layout (3-6 steps) |
| `mindmap` | Center radial mind map layout (4-8 branches) |
| `quadrant` | Four-quadrant / circular section layout |

Detailed layout definitions: `references/elements/canvas.md`

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

Each session creates an independent directory named by content slug:

```
xhs-images/{topic-slug}/
├── source-{slug}.{ext}             # Source files (text, images, etc.)
├── analysis.md                     # Deep analysis + questions asked
├── outline-strategy-a.md           # Strategy A: Story-driven
├── outline-strategy-b.md           # Strategy B: Information-dense
├── outline-strategy-c.md           # Strategy C: Visual-first
├── outline.md                      # Final selected/merged outline
├── prompts/
│   ├── 01-cover-[slug].md
│   ├── 02-content-[slug].md
│   └── ...
├── 01-cover-[slug].png
├── 02-content-[slug].png
└── NN-ending-[slug].png
```

**Slug Generation**:
1. Extract main topic from content (2-4 words, kebab-case)
2. Example: "AI工具推荐" → `ai-tools-recommend`

**Conflict Resolution**:
If `xhs-images/{topic-slug}/` already exists:
- Append timestamp: `{topic-slug}-YYYYMMDD-HHMMSS`
- Example: `ai-tools` exists → `ai-tools-20260118-143052`

**Source Files**:
Copy all sources with naming `source-{slug}.{ext}`:
- `source-article.md`, `source-photo.jpg`, etc.
- Multiple sources supported: text, images, files from conversation

## Workflow

### Progress Checklist

Copy and track progress:

```
XHS Infographic Progress:
- [ ] Step 0: Check preferences (EXTEND.md) ⛔ BLOCKING
  - [ ] Found → load preferences → continue
  - [ ] Not found → run first-time setup → MUST complete before Step 1
- [ ] Step 1: Analyze content → analysis.md
- [ ] Step 2: Confirmation 1 - Content understanding ⚠️ REQUIRED
- [ ] Step 3: Generate 3 outline + style variants
- [ ] Step 4: Confirmation 2 - Outline & style & elements selection ⚠️ REQUIRED
- [ ] Step 5: Generate images (sequential)
- [ ] Step 6: Completion report
```

### Flow

```
Input → [Step 0: Preferences] ─┬─ Found → Continue
                               │
                               └─ Not found → First-Time Setup ⛔ BLOCKING
                                              │
                                              └─ Complete setup → Save EXTEND.md → Continue
                                                                                      │
        ┌───────────────────────────────────────────────────────────────────────────┘
        ↓
Analyze → [Confirm 1] → 3 Outlines → [Confirm 2: Outline + Style + Elements] → Generate → Complete
```

### Step 0: Load Preferences (EXTEND.md) ⛔ BLOCKING

**Purpose**: Load user preferences or run first-time setup.

**CRITICAL**: If EXTEND.md not found, MUST complete first-time setup before ANY other questions or steps. Do NOT proceed to content analysis, do NOT ask about style, do NOT ask about layout — ONLY complete the preferences setup first.

Check EXTEND.md existence (priority order):

```bash
# macOS, Linux, WSL, Git Bash
test -f .baoyu-skills/baoyu-xhs-images/EXTEND.md && echo "project"
test -f "$HOME/.baoyu-skills/baoyu-xhs-images/EXTEND.md" && echo "user"
```

```powershell
# PowerShell (Windows)
if (Test-Path .baoyu-skills/baoyu-xhs-images/EXTEND.md) { "project" }
if (Test-Path "$HOME/.baoyu-skills/baoyu-xhs-images/EXTEND.md") { "user" }
```

┌────────────────────────────────────────────────────┬───────────────────┐
│                        Path                        │     Location      │
├────────────────────────────────────────────────────┼───────────────────┤
│ .baoyu-skills/baoyu-xhs-images/EXTEND.md           │ Project directory │
├────────────────────────────────────────────────────┼───────────────────┤
│ $HOME/.baoyu-skills/baoyu-xhs-images/EXTEND.md     │ User home         │
└────────────────────────────────────────────────────┴───────────────────┘

┌───────────┬─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Result   │                                              Action                                              │
├───────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Found     │ Read, parse, display summary → Continue to Step 1                                                 │
├───────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Not found │ ⛔ BLOCKING: Run first-time setup ONLY (see below) → Complete and save EXTEND.md → Then Step 1    │
└───────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────┘

**First-Time Setup** (when EXTEND.md not found):

**Language**: Use user's input language or saved language preference.

Use AskUserQuestion with ALL questions in ONE call. See `references/config/first-time-setup.md` for question details.

**EXTEND.md Supports**: Watermark | Preferred style/layout | Custom style definitions | Language preference

Schema: `references/config/preferences-schema.md`

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

With confirmed outline + style + layout:

**Visual Consistency — Reference Image Chain**:
To ensure character/style consistency across all images in a series:
1. **Generate image 1 (cover) FIRST** — without `--ref`
2. **Use image 1 as `--ref` for ALL remaining images** (2, 3, ..., N)
   - This anchors the character design, color rendering, and illustration style
   - Command pattern: `--ref <path-to-image-01.png>` added to every subsequent generation

This is critical for styles that use recurring characters, mascots, or illustration elements. Image 1 becomes the visual anchor for the entire series.

**For each image (cover + content + ending)**:
1. Save prompt to `prompts/NN-{type}-[slug].md` (in user's preferred language)
   - **Backup rule**: If prompt file exists, rename to `prompts/NN-{type}-[slug]-backup-YYYYMMDD-HHMMSS.md`
2. Generate image:
   - **Image 1**: Generate without `--ref` (this establishes the visual anchor)
   - **Images 2+**: Generate with `--ref <image-01-path>` for consistency
   - **Backup rule**: If image file exists, rename to `NN-{type}-[slug]-backup-YYYYMMDD-HHMMSS.png`
3. Report progress after each generation

**Watermark Application** (if enabled in preferences):
Add to each image generation prompt:
```
Include a subtle watermark "[content]" positioned at [position].
The watermark should be legible but not distracting from the main content.
```
Reference: `references/config/watermark-guide.md`

**Image Generation Skill Selection**:
- Check available image generation skills
- If multiple skills available, ask user preference

**Session Management**:
If image generation skill supports `--sessionId`:
1. Generate unique session ID: `xhs-{topic-slug}-{timestamp}`
2. Use same session ID for all images
3. Combined with reference image chain, ensures maximum visual consistency

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

1. **Cover (Image 1)**: Hook + visual impact → `sparse` layout
2. **Content (Middle)**: Core value per image → `balanced`/`dense`/`list`/`comparison`/`flow`
3. **Ending (Last)**: CTA / summary → `sparse` or `balanced`

**Style × Layout Matrix** (✓✓ = highly recommended, ✓ = works well):

| | sparse | balanced | dense | list | comparison | flow | mindmap | quadrant |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| cute | ✓✓ | ✓✓ | ✓ | ✓✓ | ✓ | ✓ | ✓ | ✓ |
| fresh | ✓✓ | ✓✓ | ✓ | ✓ | ✓ | ✓✓ | ✓ | ✓ |
| warm | ✓✓ | ✓✓ | ✓ | ✓ | ✓✓ | ✓ | ✓ | ✓ |
| bold | ✓✓ | ✓ | ✓ | ✓✓ | ✓✓ | ✓ | ✓ | ✓✓ |
| minimal | ✓✓ | ✓✓ | ✓✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| retro | ✓✓ | ✓✓ | ✓ | ✓✓ | ✓ | ✓ | ✓ | ✓ |
| pop | ✓✓ | ✓✓ | ✓ | ✓✓ | ✓✓ | ✓ | ✓ | ✓ |
| notion | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓✓ |
| chalkboard | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓ | ✓✓ | ✓✓ | ✓ |
| study-notes | ✗ | ✓ | ✓✓ | ✓✓ | ✓ | ✓ | ✓✓ | ✓ |

## References

Detailed templates in `references/` directory:

**Elements** (Visual building blocks):
- `elements/canvas.md` - Aspect ratios, safe zones, grid layouts
- `elements/image-effects.md` - Cutout, stroke, filters
- `elements/typography.md` - Decorated text (花字), tags, text direction
- `elements/decorations.md` - Emphasis marks, backgrounds, doodles, frames

**Presets** (Style presets):
- `presets/<name>.md` - Element combination definitions (cute, notion, warm...)

**Workflows** (Process guides):
- `workflows/analysis-framework.md` - Content analysis framework
- `workflows/outline-template.md` - Outline template with layout guide
- `workflows/prompt-assembly.md` - Prompt assembly guide

**Config** (Settings):
- `config/preferences-schema.md` - EXTEND.md schema
- `config/first-time-setup.md` - First-time setup flow
- `config/watermark-guide.md` - Watermark configuration

## Notes

- Auto-retry once on failure | Cartoon alternatives for sensitive figures
- Use confirmed language preference | Maintain style consistency
- **Two confirmation points required** (Steps 2 & 4) - do not skip

## Extension Support

Custom configurations via EXTEND.md. See **Step 0** for paths and supported options.
