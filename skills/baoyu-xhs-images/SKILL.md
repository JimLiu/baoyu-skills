---
name: baoyu-xhs-images
description: Generates Xiaohongshu (Little Red Book) image card series with 12 visual styles, 8 layouts, and 3 color palettes. Breaks content into 1-10 cartoon-style image cards optimized for XHS engagement. Use when user mentions "小红书图片", "XHS images", "RedNote infographics", "小红书种草", "小绿书", "微信图文", "微信贴图", or wants social media infographic series for Chinese platforms.
version: 1.56.1
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-xhs-images
---

# Xiaohongshu Image Card Series Generator

Break down complex content into eye-catching Xiaohongshu image card series with multiple style options.

## Options

| Option | Description |
|--------|-------------|
| `--style <name>` | Visual style (see Style Gallery) |
| `--layout <name>` | Information layout (see Layout Gallery) |
| `--palette <name>` | Color palette override (see Palette Gallery) |
| `--preset <name>` | Style + layout + optional palette shorthand (see [Style Presets](references/style-presets.md)) |
| `--yes` | Non-interactive mode: skip all confirmations. Uses EXTEND.md preferences if found, otherwise uses defaults (no watermark, auto style/layout). Auto-confirms recommended plan (Path A). Suitable for scheduled tasks and automation. |

## Dimensions

| Dimension | Controls | Options |
|-----------|----------|---------|
| **Style** | Visual aesthetics: lines, decorations, rendering | cute, fresh, warm, bold, minimal, retro, pop, notion, chalkboard, study-notes, screen-print, sketch-notes |
| **Layout** | Information structure: density, arrangement | sparse, balanced, dense, list, comparison, flow, mindmap, quadrant |
| **Palette** (optional) | Color override: replaces style's default colors | macaron, warm, neon |

Style × Layout can be freely combined, with optional palette override. Example: `--style notion --layout dense` creates an intellectual-looking knowledge card with high information density. Add `--palette macaron` to swap colors to soft pastels while keeping notion's rendering style.

Or use presets: `--preset knowledge-card` → style + layout in one flag. See [Style Presets](references/style-presets.md).

**Palette behavior**:
- No `--palette` → style uses its built-in colors (or its `default_palette` if defined)
- `--palette macaron` → overrides any style's colors with macaron palette
- Palette replaces colors only; style rendering rules (line treatment, elements, textures) stay unchanged
- Some styles declare a `default_palette` (e.g., sketch-notes defaults to macaron)

## Style Gallery

| Style | Description |
|-------|-------------|
| `cute` (Default) | Sweet, adorable, girly aesthetic |
| `fresh` | Clean, refreshing, natural |
| `warm` | Cozy, friendly, approachable |
| `bold` | High impact, attention-grabbing |
| `minimal` | Ultra-clean, sophisticated |
| `retro` | Vintage, nostalgic, trendy |
| `pop` | Vibrant, energetic, eye-catching |
| `notion` | Minimalist hand-drawn line art, intellectual |
| `chalkboard` | Colorful chalk on black board, educational |
| `study-notes` | Realistic handwritten photo style, blue pen + red annotations + yellow highlighter |
| `screen-print` | Bold poster art, halftone textures, limited colors, symbolic storytelling |
| `sketch-notes` | Hand-drawn educational infographic, macaron pastels on warm cream, wobble lines |

Detailed style definitions: `references/presets/<style>.md`

## Preset Gallery

Quick-start presets by content scenario. Use `--preset <name>` or recommend during Step 2.

**Knowledge & Learning**:

| Preset | Style | Layout | Best For |
|--------|-------|--------|----------|
| `knowledge-card` | notion | dense | 干货知识卡、概念科普 |
| `checklist` | notion | list | 清单、排行榜、必备清单 |
| `concept-map` | notion | mindmap | 概念图、知识脉络 |
| `swot` | notion | quadrant | SWOT 分析、四象限分类 |
| `tutorial` | chalkboard | flow | 教程步骤、操作流程 |
| `classroom` | chalkboard | balanced | 课堂笔记、知识讲解 |
| `study-guide` | study-notes | dense | 学习笔记、考试重点 |
| `hand-drawn-edu` | sketch-notes | flow | 手绘教程、流程图解 |
| `sketch-card` | sketch-notes | dense | 手绘知识卡、概念科普 |
| `sketch-summary` | sketch-notes | balanced | 手绘总结、图文笔记 |

**Lifestyle & Sharing**:

| Preset | Style | Layout | Best For |
|--------|-------|--------|----------|
| `cute-share` | cute | balanced | 少女风分享、日常种草 |
| `girly` | cute | sparse | 甜美封面、氛围感 |
| `cozy-story` | warm | balanced | 生活故事、情感分享 |
| `product-review` | fresh | comparison | 产品对比、测评 |
| `nature-flow` | fresh | flow | 健康流程、自然主题 |

**Impact & Opinion**:

| Preset | Style | Layout | Best For |
|--------|-------|--------|----------|
| `warning` | bold | list | 避坑指南、重要提醒 |
| `versus` | bold | comparison | 正反对比、强烈对照 |
| `clean-quote` | minimal | sparse | 金句、极简封面 |
| `pro-summary` | minimal | balanced | 专业总结、商务内容 |

**Trend & Entertainment**:

| Preset | Style | Layout | Best For |
|--------|-------|--------|----------|
| `retro-ranking` | retro | list | 复古排行、经典盘点 |
| `throwback` | retro | balanced | 怀旧分享、老物件 |
| `pop-facts` | pop | list | 趣味冷知识、好玩的事 |
| `hype` | pop | sparse | 炸裂封面、惊叹分享 |

**Poster & Editorial**:

| Preset | Style | Layout | Best For |
|--------|-------|--------|----------|
| `poster` | screen-print | sparse | 海报风封面、影评书评 |
| `editorial` | screen-print | balanced | 观点文章、文化评论 |
| `cinematic` | screen-print | comparison | 电影对比、戏剧张力 |

Full preset definitions: [references/style-presets.md](references/style-presets.md)

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

## Palette Gallery

Optional color override. Replaces style's built-in colors while preserving rendering rules.

| Palette | Background | Zone Colors | Accent | Feel |
|---------|------------|-------------|--------|------|
| `macaron` | Warm cream #F5F0E8 | Blue #A8D8EA, Lavender #D5C6E0, Mint #B5E5CF, Peach #F8D5C4 | Coral #E8655A | Soft, educational, approachable |
| `warm` | Soft Peach #FFECD2 | Orange #ED8936, Terracotta #C05621, Golden #F6AD55, Rose #D4A09A | Sienna #A0522D | Cozy, earth tones, no cool colors |
| `neon` | Dark Purple #1A1025 | Cyan #00F5FF, Magenta #FF00FF, Green #39FF14, Pink #FF6EC7 | Yellow #FFFF00 | High-energy, futuristic |

Detailed palette definitions: `references/palettes/<palette>.md`

## Auto Selection

| Content Signals | Style | Layout | Recommended Preset |
|-----------------|-------|--------|--------------------|
| Beauty, fashion, cute, girl, pink | `cute` | sparse/balanced | `cute-share`, `girly` |
| Health, nature, clean, fresh, organic | `fresh` | balanced/flow | `product-review`, `nature-flow` |
| Life, story, emotion, feeling, warm | `warm` | balanced | `cozy-story` |
| Warning, important, must, critical | `bold` | list/comparison | `warning`, `versus` |
| Professional, business, elegant, simple | `minimal` | sparse/balanced | `clean-quote`, `pro-summary` |
| Classic, vintage, old, traditional | `retro` | balanced | `throwback`, `retro-ranking` |
| Fun, exciting, wow, amazing | `pop` | sparse/list | `hype`, `pop-facts` |
| Knowledge, concept, productivity, SaaS | `notion` | dense/list | `knowledge-card`, `checklist` |
| Education, tutorial, learning, teaching, classroom | `chalkboard` | balanced/dense | `tutorial`, `classroom` |
| Notes, handwritten, study guide, knowledge, realistic, photo | `study-notes` | dense/list/mindmap | `study-guide` |
| Movie, album, concert, poster, opinion, editorial, dramatic, cinematic | `screen-print` | sparse/comparison | `poster`, `editorial`, `cinematic` |
| Hand-drawn, infographic, diagram, visual summary, 手绘，图解，workflow, process | `sketch-notes` | flow/balanced/dense | `hand-drawn-edu`, `sketch-card`, `sketch-summary` |

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
2. Example: "AI 工具推荐" → `ai-tools-recommend`

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
- [ ] Step 0: Check preferences (EXTEND.md) ⛔ BLOCKING (--yes: use defaults if not found)
  - [ ] Found → load preferences → continue
  - [ ] Not found → run first-time setup → MUST complete before Step 1 (--yes: skip setup, use defaults)
- [ ] Step 1: Analyze content → analysis.md
- [ ] Step 2: Smart Confirm ⚠️ REQUIRED (--yes: auto-confirm Path A)
  - [ ] Path A: Quick confirm → generate recommended outline
  - [ ] Path B: Customize → adjust then generate outline
  - [ ] Path C: Detailed → 3 outlines → second confirm → generate outline
- [ ] Step 3: Generate images (sequential)
- [ ] Step 4: Completion report
```

### Flow

```
Input → [--yes?] ─┬─ Yes → [Step 0: Load or defaults] → Analyze → Auto-confirm → Generate → Complete
                   │
                   └─ No → [Step 0: Preferences] ─┬─ Found → Continue
                                                   │
                                                   └─ Not found → First-Time Setup ⛔ BLOCKING
                                                                  │
                                                                  └─ Complete setup → Save EXTEND.md → Continue
                                                                                                          │
                    ┌─────────────────────────────────────────────────────────────────────────────────────┘
                    ↓
            Analyze → [Smart Confirm] ─┬─ Quick: confirm recommended → outline.md → Generate → Complete
                                       │
                                       ├─ Customize: adjust options → outline.md → Generate → Complete
                                       │
                                       └─ Detailed: 3 outlines → [Confirm 2] → outline.md → Generate → Complete
```

### Step 0: Load Preferences (EXTEND.md) ⛔ BLOCKING

**Purpose**: Load user preferences or run first-time setup.

**`--yes` mode**: If EXTEND.md found → load it. If not found → use built-in defaults (no watermark, style/layout auto-select, language from content). Do NOT run first-time setup, do NOT create EXTEND.md, do NOT ask any questions. Proceed directly to Step 1.

**CRITICAL** (interactive mode only): If EXTEND.md not found, MUST complete first-time setup before ANY other questions or steps. Do NOT proceed to content analysis, do NOT ask about style, do NOT ask about layout — ONLY complete the preferences setup first.

Check EXTEND.md existence (priority order):

```bash
# macOS, Linux, WSL, Git Bash
test -f .baoyu-skills/baoyu-xhs-images/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-xhs-images/EXTEND.md" && echo "xdg"
test -f "$HOME/.baoyu-skills/baoyu-xhs-images/EXTEND.md" && echo "user"
```

```powershell
# PowerShell (Windows)
if (Test-Path .baoyu-skills/baoyu-xhs-images/EXTEND.md) { "project" }
$xdg = if ($env:XDG_CONFIG_HOME) { $env:XDG_CONFIG_HOME } else { "$HOME/.config" }
if (Test-Path "$xdg/baoyu-skills/baoyu-xhs-images/EXTEND.md") { "xdg" }
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
6. **Auto-recommend** best strategy + style + layout + palette based on content signals
7. **Save to `analysis.md`**

### Step 2: Smart Confirm ⚠️

**Purpose**: Present auto-recommended plan, let user confirm or adjust.

**`--yes` mode**: Skip this entire step. Use auto-recommended strategy + style + layout + palette from Step 1 analysis (or `--style`/`--layout`/`--palette`/`--preset` if provided). Generate outline directly using Path A logic → save to `outline.md` → proceed to Step 3. No AskUserQuestion calls.

**Interactive mode**: Do NOT skip.

**Auto-Recommendation Logic**:
1. Use Auto Selection table to match content signals → best strategy + style + layout + palette
2. Infer optimal image count from content density
3. Load style's default elements from preset (apply palette override if applicable)

**Display** (analysis summary + recommended plan):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 内容分析
  主题：[topic] | 类型：[content_type]
  要点：[key points summary]
  受众：[target audience]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 推荐方案（自动匹配）
  策略：[A/B/C] [strategy name]（[reason]）
  风格：[style] · 布局：[layout] · 配色：[palette or "默认"] · 预设：[preset]
  图片：[N]张（封面+[N-2]内容+结尾）
  元素：[background] / [decorations] / [emphasis]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Use AskUserQuestion** with single question:

| Option | Description |
|--------|-------------|
| 1. ✅ 确认，直接生成（推荐） | Trust auto-recommendation, proceed immediately |
| 2. 🎛️ 自定义调整 | Modify strategy/style/layout/count in one step |
| 3. 📋 详细模式 | Generate 3 outlines, then choose (two confirmations) |

#### Path A: Quick Confirm (Option 1)

Generate single outline using recommended strategy + style → save to `outline.md` → Step 3.

#### Path B: Customize (Option 2)

**Use AskUserQuestion** with adjustable options (leave blank = keep recommended):

1. **策略风格**: Current: [strategy + style]. Options: A Story-Driven(warm) | B Information-Dense(notion) | C Visual-First(screen-print). Or specify style directly: cute/fresh/warm/bold/minimal/retro/pop/notion/chalkboard/study-notes/screen-print/sketch-notes. Or use preset: knowledge-card / checklist / tutorial / poster / hand-drawn-edu / etc.
2. **布局**: Current: [layout]. Options: sparse | balanced | dense | list | comparison | flow | mindmap | quadrant
3. **配色**: Current: [palette or "默认"]. Options: 默认 | macaron | warm | neon
4. **图片数量**: Current: [N]. Range: 2-10
5. **补充说明**（可选）: Selling point emphasis, audience adjustment, custom color preference, etc.

**After response**: Generate single outline with user's choices → save to `outline.md` → Step 3.

#### Path C: Detailed Mode (Option 3)

Full two-confirmation flow for maximum control:

**Step 2a: Content Understanding**

**Use AskUserQuestion** for:
1. Core selling point (multiSelect: true)
2. Target audience
3. Style preference: Authentic sharing / Professional review / Aesthetic mood / Auto
4. Additional context (optional)

**After response**: Update `analysis.md`.

**Step 2b: Generate 3 Outline Variants**

| Strategy | Filename | Outline | Recommended Style |
|----------|----------|---------|-------------------|
| A | `outline-strategy-a.md` | Story-driven: emotional, before/after | warm, cute, fresh |
| B | `outline-strategy-b.md` | Information-dense: structured, factual | notion, minimal, chalkboard |
| C | `outline-strategy-c.md` | Visual-first: atmospheric, minimal text | bold, pop, retro, screen-print |

**Outline format** (YAML front matter + content):
```yaml
---
strategy: a  # a, b, or c
name: Story-Driven
style: warm  # recommended style for this strategy
palette: ~  # optional palette override (macaron, warm, neon, or ~ for style default)
style_reason: "Warm tones enhance emotional storytelling and personal connection"
elements:  # from style preset, can be customized
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

Reference: `references/workflows/outline-template.md`

**Step 2c: Outline & Style Selection**

**Use AskUserQuestion** with three questions:

**Q1: Outline Strategy**: A / B / C / Combine (specify pages from each)

**Q2: Visual Style**: Use recommended | Select preset | Select style | Custom description

**Q3: Visual Elements**: Use defaults (Recommended) | Adjust background | Adjust decorations | Custom

**After response**: Save selected/merged outline to `outline.md` with confirmed style and elements → Step 3.

### Step 3: Generate Images

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
- If multiple skills available: ask user preference (interactive) or use first available skill (`--yes` mode)

**Session Management**:
If image generation skill supports `--sessionId`:
1. Generate unique session ID: `xhs-{topic-slug}-{timestamp}`
2. Use same session ID for all images
3. Combined with reference image chain, ensures maximum visual consistency

### Step 4: Completion Report

```
Xiaohongshu Image Card Series Complete!

Topic: [topic]
Mode: [Quick / Custom / Detailed]
Strategy: [A/B/C/Combined]
Style: [style name]
Palette: [palette name or "default"]
Layout: [layout name or "varies"]
Location: [directory path]
Images: N total

✓ analysis.md
✓ outline.md
✓ outline-strategy-a/b/c.md (detailed mode only)

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
| screen-print | ✓✓ | ✓✓ | ✗ | ✓ | ✓✓ | ✓ | ✗ | ✓✓ |
| sketch-notes | ✓ | ✓✓ | ✓✓ | ✓✓ | ✓ | ✓✓ | ✓✓ | ✓ |

## References

Detailed templates in `references/` directory:

**Elements** (Visual building blocks):
- `elements/canvas.md` - Aspect ratios, safe zones, grid layouts
- `elements/image-effects.md` - Cutout, stroke, filters
- `elements/typography.md` - Decorated text (花字), tags, text direction
- `elements/decorations.md` - Emphasis marks, backgrounds, doodles, frames

**Presets** (Style presets):
- `presets/<name>.md` - Element combination definitions (cute, notion, warm...)
- `style-presets.md` - Preset shortcuts (style + layout + palette combos)

**Palettes** (Color overrides):
- `palettes/<name>.md` - Color palette definitions (macaron, warm, neon)

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
- **Smart Confirm required** (Step 2) - do not skip; detailed mode uses two sub-confirmations

## Extension Support

Custom configurations via EXTEND.md. See **Step 0** for paths and supported options.
