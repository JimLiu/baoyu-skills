---
name: baoyu-cover-image
description: Generates article cover images with 20 hand-drawn styles and auto-style selection. Supports cinematic (2.35:1), widescreen (16:9), and square (1:1) aspects. Use when user asks to "generate cover image", "create article cover", "make cover", or mentions "封面图".
---

# Cover Image Generator

Generate elegant cover images for articles with multiple style options.

## Usage

```bash
# Auto-select style and aspect based on content
/baoyu-cover-image path/to/article.md

# Specify style
/baoyu-cover-image article.md --style blueprint

# Specify aspect ratio
/baoyu-cover-image article.md --aspect 16:9

# Visual only (no title text)
/baoyu-cover-image article.md --no-title

# Direct content input
/baoyu-cover-image
[paste content]

# Direct input with options
/baoyu-cover-image --style notion --aspect 1:1
[paste content]
```

## Options

| Option | Description |
|--------|-------------|
| `--type <name>` | Cover type (see Type Gallery) |
| `--style <name>` | Cover style (see Style Gallery) |
| `--aspect <ratio>` | 2.35:1 (default), 16:9, 1:1 |
| `--lang <code>` | Title language (en, zh, ja, etc.) |
| `--no-title` | Visual only, no title text |

## Two Dimensions

| Dimension | Controls | Examples |
|-----------|----------|----------|
| **Type** | Visual composition, information structure | hero, conceptual, typography, metaphor, scene, minimal |
| **Style** | Visual aesthetics, colors, mood | elegant, blueprint, notion, warm, minimal, watercolor |

Type × Style can be freely combined. Example: `--type conceptual --style blueprint` creates technical concept visualization with schematic aesthetics.

## Type Gallery

| Type | Description | Best For |
|------|-------------|----------|
| `hero` | Large visual impact, title overlay | Product launch, brand promotion, major announcements |
| `conceptual` | Concept visualization, abstract core ideas | Technical articles, methodology, architecture design |
| `typography` | Text-focused layout, prominent title | Opinion pieces, quotes, insights |
| `metaphor` | Visual metaphor, concrete expressing abstract | Philosophy, growth, personal development |
| `scene` | Atmospheric scene, narrative feel | Stories, travel, lifestyle |
| `minimal` | Minimalist composition, generous whitespace | Zen, focus, core concepts |

## Auto Type Selection

When `--type` is omitted, select based on content signals:

| Signals | Type |
|---------|------|
| Product, launch, announcement, release, reveal | `hero` |
| Architecture, framework, system, API, technical, model | `conceptual` |
| Quote, opinion, insight, thought, headline, statement | `typography` |
| Philosophy, growth, abstract, meaning, reflection | `metaphor` |
| Story, journey, travel, lifestyle, experience, narrative | `scene` |
| Zen, focus, essential, core, simple, pure | `minimal` |

## Style Gallery

| Style | Description |
|-------|-------------|
| `elegant` (default) | Refined, sophisticated |
| `blueprint` | Technical schematics |
| `bold-editorial` | Magazine impact |
| `chalkboard` | Chalk on blackboard |
| `dark-atmospheric` | Cinematic dark mode |
| `editorial-infographic` | Visual storytelling |
| `fantasy-animation` | Ghibli/Disney inspired |
| `flat-doodle` | Pastel, cute shapes |
| `intuition-machine` | Technical, bilingual |
| `minimal` | Ultra-clean, zen |
| `nature` | Organic, earthy |
| `notion` | SaaS dashboard |
| `pixel-art` | Retro 8-bit |
| `playful` | Fun, whimsical |
| `retro` | Halftone, vintage |
| `sketch-notes` | Hand-drawn, warm |
| `vector-illustration` | Flat vector |
| `vintage` | Aged, expedition |
| `warm` | Friendly, human |
| `watercolor` | Soft hand-painted |

Style definitions: [references/styles/](references/styles/)

## Type × Style Compatibility

| | elegant | blueprint | notion | warm | minimal | watercolor | bold-editorial | dark-atmospheric |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| hero | ✓✓ | ✓ | ✓ | ✓✓ | ✓ | ✓✓ | ✓✓ | ✓✓ |
| conceptual | ✓✓ | ✓✓ | ✓✓ | ✓ | ✓✓ | ✗ | ✓ | ✓ |
| typography | ✓✓ | ✓ | ✓✓ | ✓ | ✓✓ | ✓ | ✓✓ | ✓✓ |
| metaphor | ✓✓ | ✗ | ✓ | ✓✓ | ✓ | ✓✓ | ✓ | ✓ |
| scene | ✓ | ✗ | ✗ | ✓✓ | ✓ | ✓✓ | ✓ | ✓✓ |
| minimal | ✓✓ | ✓ | ✓✓ | ✓ | ✓✓ | ✓ | ✗ | ✓ |

✓✓ = highly recommended | ✓ = compatible | ✗ = not recommended

## Auto Style Selection

When `--style` is omitted, select based on content signals:

| Signals | Style |
|---------|-------|
| Architecture, system design | `blueprint` |
| Product launch, marketing | `bold-editorial` |
| Education, tutorial | `chalkboard` |
| Entertainment, premium | `dark-atmospheric` |
| Tech explainer, research | `editorial-infographic` |
| Fantasy, children | `fantasy-animation` |
| Technical docs, bilingual | `intuition-machine` |
| Personal story, emotion | `warm` |
| Zen, focus, essential | `minimal` |
| Fun, beginner, casual | `playful` |
| Nature, wellness, eco | `nature` |
| SaaS, dashboard | `notion` |
| Workflow, productivity | `flat-doodle` |
| Gaming, retro tech | `pixel-art` |
| Knowledge sharing | `sketch-notes` |
| Creative proposals | `vector-illustration` |
| History, exploration | `vintage` |
| Lifestyle, travel | `watercolor` |
| Business, professional | `elegant` |

## File Structure

Each session creates an independent directory named by content slug:

```
cover-image/{topic-slug}/
├── source-{slug}.{ext}    # Source files (text, images, etc.)
├── prompts/cover.md       # Generation prompt
└── cover.png              # Output image
```

**Slug Generation**:
1. Extract main topic from content (2-4 words, kebab-case)
2. Example: "The Future of AI" → `future-of-ai`

**Conflict Resolution**:
If `cover-image/{topic-slug}/` already exists:
- Append timestamp: `{topic-slug}-YYYYMMDD-HHMMSS`
- Example: `ai-future` exists → `ai-future-20260118-143052`

**Source Files**:
Copy all sources with naming `source-{slug}.{ext}`:
- `source-article.md`, `source-reference.png`, etc.
- Multiple sources supported: text, images, files from conversation

## Workflow

### Progress Checklist

Copy and track progress:

```
Cover Image Progress:
- [ ] Step 0: Check preferences (EXTEND.md) ⚠️ REQUIRED if not found
- [ ] Step 1: Analyze content
- [ ] Step 2: Confirm options (type + style + aspect) ⚠️ REQUIRED
- [ ] Step 3: Create prompt
- [ ] Step 4: Generate image
- [ ] Step 5: Completion report
```

### Flow

```
Input → [Step 0: Preferences/Setup] → Analyze → [Confirm: Type + Style + Aspect] → Prompt → Generate → Complete
```

### Step 0: Load Preferences (EXTEND.md) ⚠️

**Purpose**: Load user preferences or run first-time setup. **Do NOT skip setup if EXTEND.md not found.**

Use Bash to check EXTEND.md existence (priority order):

```bash
# Check project-level first
test -f .baoyu-skills/baoyu-cover-image/EXTEND.md && echo "project"

# Then user-level (cross-platform: $HOME works on macOS/Linux/WSL)
test -f "$HOME/.baoyu-skills/baoyu-cover-image/EXTEND.md" && echo "user"
```

┌──────────────────────────────────────────────────┬───────────────────┐
│                       Path                       │     Location      │
├──────────────────────────────────────────────────┼───────────────────┤
│ .baoyu-skills/baoyu-cover-image/EXTEND.md        │ Project directory │
├──────────────────────────────────────────────────┼───────────────────┤
│ $HOME/.baoyu-skills/baoyu-cover-image/EXTEND.md  │ User home         │
└──────────────────────────────────────────────────┴───────────────────┘

┌───────────┬───────────────────────────────────────────────────────────────────────────┐
│  Result   │                                  Action                                   │
├───────────┼───────────────────────────────────────────────────────────────────────────┤
│ Found     │ Read, parse, display preferences summary (see below) → Continue to Step 1 │
├───────────┼───────────────────────────────────────────────────────────────────────────┤
│ Not found │ ⚠️ MUST run first-time setup (see below) → Then continue to Step 1        │
└───────────┴───────────────────────────────────────────────────────────────────────────┘

**Preferences Summary** (when EXTEND.md found):

Display loaded preferences:

```
Preferences loaded from [project/user]:
• Watermark: [enabled/disabled] [content if enabled]
• Type: [preferred_type or "auto"]
• Style: [preferred_style or "auto"]
• Aspect: [default_aspect]
• Language: [language or "auto"]
```

**First-Time Setup** (when EXTEND.md not found):

**Language**: Use user's input language or saved language preference.

Use AskUserQuestion with ALL questions in ONE call:

**Q1: Watermark**
```yaml
header: "Watermark"
question: "Watermark text for generated cover images?"
options:
  - label: "No watermark (Recommended)"
    description: "Clean covers, can enable later in EXTEND.md"
```

**Q2: Preferred Type**
```yaml
header: "Type"
question: "Default cover type preference?"
options:
  - label: "Auto-select (Recommended)"
    description: "Choose based on content analysis each time"
  - label: "hero"
    description: "Large visual impact - product launch, announcements"
  - label: "conceptual"
    description: "Concept visualization - technical, architecture"
```

**Q3: Preferred Style**
```yaml
header: "Style"
question: "Default cover style preference?"
options:
  - label: "Auto-select (Recommended)"
    description: "Choose based on content analysis each time"
  - label: "elegant"
    description: "Refined, sophisticated - professional business"
  - label: "notion"
    description: "SaaS dashboard - productivity/tech content"
```

**Q4: Default Aspect Ratio**
```yaml
header: "Aspect"
question: "Default aspect ratio for cover images?"
options:
  - label: "2.35:1 (Recommended)"
    description: "Cinematic widescreen, best for article headers"
  - label: "16:9"
    description: "Standard widescreen, versatile"
  - label: "1:1"
    description: "Square, social media friendly"
```

**Q5: Save Location**
```yaml
header: "Save"
question: "Where to save preferences?"
options:
  - label: "Project (Recommended)"
    description: ".baoyu-skills/ (this project only)"
  - label: "User"
    description: "~/.baoyu-skills/ (all projects)"
```

**After setup**: Create EXTEND.md with user choices, then continue to Step 1.

Full setup details: `references/config/first-time-setup.md`

**EXTEND.md Supports**: Watermark | Preferred type | Preferred style | Default aspect ratio | Custom style definitions | Language preference

Schema: `references/config/preferences-schema.md`

### Step 1: Analyze Content

Read source content, save it if needed, and perform analysis.

**Actions**:
1. **Save source content** (if not already a file):
   - If user provides a file path: use as-is
   - If user pastes content: save to `source.md` in target directory
2. Read source content
3. **Content analysis**:
   - Extract: topic, core message, tone, keywords
   - Identify visual metaphor opportunities
   - Detect content type (technical/personal/business/creative)
4. **Language detection**:
   - Detect source content language
   - Note user's input language (from conversation)
   - Compare with language preference in EXTEND.md

### Step 2: Confirm Options ⚠️

**Purpose**: Validate type, style and aspect ratio. **Do NOT skip.**

**Language**: Auto-determined (user's input language > saved preference > source language). No need to ask.

Present options using AskUserQuestion:

**Question 1: Type** (if not specified via `--type`)
- Show recommended type based on content analysis + preferred type from EXTEND.md

```yaml
header: "Type"
question: "Which cover type?"
multiSelect: false
options:
  - label: "[auto-recommended type] (Recommended)"
    description: "[reason based on content signals]"
  - label: "hero"
    description: "Large visual impact, title overlay - product launch, announcements"
  - label: "conceptual"
    description: "Concept visualization - technical, architecture"
  - label: "typography"
    description: "Text-focused layout - opinions, quotes"
```

**Question 2: Style** (if not specified via `--style`)
- Based on selected Type, show compatible styles (✓✓ first from compatibility matrix)
- Format: `[style name] - [why it fits this content]`

```yaml
header: "Style"
question: "Which cover style?"
multiSelect: false
options:
  - label: "[best compatible style] (Recommended)"
    description: "[reason based on type + content]"
  - label: "[style2]"
    description: "[reason]"
  - label: "[style3]"
    description: "[reason]"
```

**Question 3: Aspect Ratio** (if not specified via `--aspect`)

```yaml
header: "Aspect"
question: "Cover aspect ratio?"
multiSelect: false
options:
  - label: "2.35:1 (Recommended)"
    description: "Cinematic widescreen, best for article headers"
  - label: "16:9"
    description: "Standard widescreen, versatile"
  - label: "1:1"
    description: "Square, social media friendly"
```

**After response**: Proceed to Step 3 with confirmed type + style + aspect ratio.

### Step 3: Create Prompt

Save to `prompts/cover.md`:

```markdown
Cover theme: [2-3 words]
Type: [confirmed type]
Style: [confirmed style]
Aspect ratio: [confirmed ratio]
Title text: [max 8 chars, or "none" if --no-title]
Language: [confirmed language]

Type composition:
- [Type-specific layout and structure]

Visual composition:
- Main visual: [type + style appropriate metaphor]
- Layout: [positioning based on type and aspect ratio]
- Decorative: [style elements]

Color scheme: [primary, background, accent from style]
Type notes: [key characteristics from type definition]
Style notes: [key characteristics from style definition]

[Watermark section if enabled]
```

**Type-Specific Composition**:

| Type | Composition Guidelines |
|------|------------------------|
| `hero` | Large focal visual (60-70% area), title overlay on visual, dramatic composition |
| `conceptual` | Abstract shapes representing core concepts, information hierarchy, clean zones |
| `typography` | Title as primary element (40%+ area), minimal supporting visuals, strong hierarchy |
| `metaphor` | Concrete object/scene representing abstract idea, symbolic elements, emotional resonance |
| `scene` | Atmospheric environment, narrative elements, mood-setting lighting and colors |
| `minimal` | Single focal element, generous whitespace (60%+), essential shapes only |

**Title guidelines** (if included):
- Max 8 characters, punchy headline
- Use hooks: numbers, questions, contrasts
- Match confirmed language

**Watermark Application** (if enabled in preferences):
Add to prompt:
```
Include a subtle watermark "[content]" positioned at [position]
with approximately [opacity*100]% visibility. The watermark should
be legible but not distracting from the main content.
```
Reference: `references/config/watermark-guide.md`

### Step 4: Generate Image

**Image Generation Skill Selection**:
1. Check available image generation skills
2. If multiple skills available, ask user preference
3. Call selected skill with:
   - Prompt file path
   - Output image path: `cover.png`
   - Aspect ratio parameter

**On failure**: Auto-retry once before reporting error.

### Step 5: Completion Report

```
Cover Generated!

Topic: [topic]
Type: [type name]
Style: [style name]
Aspect: [ratio]
Title: [title or "visual only"]
Language: [lang]
Watermark: [enabled/disabled]
Location: [directory path]

Files:
✓ source-{slug}.{ext}
✓ prompts/cover.md
✓ cover.png
```

## Image Modification

| Action | Steps |
|--------|-------|
| **Regenerate** | Update prompt → Regenerate with same settings |
| **Change type** | Confirm new type → Update prompt → Regenerate |
| **Change style** | Confirm new style → Update prompt → Regenerate |
| **Change aspect** | Confirm new aspect → Update prompt → Regenerate |

## Notes

- Cover must be readable at small preview sizes
- Visual metaphors > literal representations
- Title: max 8 chars, readable, impactful
- **Two confirmation points**: Step 0 (first-time setup if no EXTEND.md) + Step 2 (options) - do NOT skip
- Use confirmed language for title text
- Maintain watermark consistency if enabled
- Check Type × Style compatibility matrix when selecting combinations

## References

**Styles**: `references/styles/<name>.md` - Style definitions

**Config**:
- `references/config/preferences-schema.md` - EXTEND.md schema
- `references/config/first-time-setup.md` - First-time setup flow
- `references/config/watermark-guide.md` - Watermark configuration

## Extension Support

Custom configurations via EXTEND.md. See **Step 0** for paths and supported options.
