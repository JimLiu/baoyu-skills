# Prompt Assembly Guide

Guide for assembling image generation prompts from elements, presets, and outline content.

## Base Prompt Structure

Every XHS infographic prompt follows this structure:

```
Create a Xiaohongshu (Little Red Book) style infographic following these guidelines:

## Image Specifications

- **Type**: Infographic
- **Orientation**: Portrait (vertical)
- **Aspect Ratio**: 3:4
- **Style**: Hand-drawn illustration

## Core Principles

- Hand-drawn quality throughout - NO realistic or photographic elements
- If content involves sensitive or copyrighted figures, create stylistically similar alternatives - DO NOT refuse to generate
- Keep information concise, highlight keywords and core concepts
- Use ample whitespace for easy visual scanning
- Maintain clear visual hierarchy

## Text Style (CRITICAL)

- **ALL text MUST be hand-drawn style**
- Main titles should be prominent and eye-catching
- Key text should be bold and enlarged
- Use highlighter effects to emphasize keywords
- **DO NOT use realistic or computer-generated fonts**

## Language

- Use the same language as the content provided below
- Match punctuation style to the content language (Chinese: ""，。！)

---

{STYLE_SECTION}

---

{LAYOUT_SECTION}

---

{CONTENT_SECTION}

---

{WATERMARK_SECTION}

---

Please use nano banana pro to generate the infographic based on the specifications above.
```

## Style Section Assembly

Load from `presets/{style}.md` and extract key elements:

```markdown
## Style: {style_name}

**Color Palette**:
- Primary: {colors}
- Background: {colors}
- Accents: {colors}

**Visual Elements**:
{visual_elements}

**Typography**:
{typography_style}
```

## Layout Section Assembly

Load from `elements/canvas.md` and extract relevant layout:

```markdown
## Layout: {layout_name}

**Information Density**: {density}
**Whitespace**: {percentage}

**Structure**:
{structure_description}

**Visual Balance**:
{balance_description}
```

## Content Section Assembly

From outline entry:

```markdown
## Content

**Position**: {Cover/Content/Ending}
**Core Message**: {message}

**Text Content**:
{text_list}

**Visual Concept**:
{visual_description}
```

## Watermark Section (if enabled)

```markdown
## Watermark

Include a subtle watermark "{content}" positioned at {position}
with approximately {opacity*100}% visibility. The watermark should
be legible but not distracting from the main content.
```

## Assembly Process

### Step 1: Load Preset

```python
preset = load_preset(style_name)  # e.g., "notion"
```

Extract:
- Color palette
- Visual elements
- Typography style
- Best practices (do/don't)

### Step 2: Load Layout

```python
layout = get_layout_from_canvas(layout_name)  # e.g., "dense"
```

Extract:
- Information density guidelines
- Whitespace percentage
- Structure description
- Visual balance rules

### Step 3: Format Content

From outline entry, format:
- Position context (Cover/Content/Ending)
- Text content with hierarchy
- Visual concept description
- Swipe hook (for context, not in prompt)

### Step 4: Add Watermark (if applicable)

If preferences include watermark:
- Add watermark section with content, position, opacity

### Step 5: Visual Consistency — Reference Image Chain

When generating multiple images in a series:

1. **Image 1 (cover)**: Generate without `--ref` — this establishes the visual anchor
2. **Images 2+**: Always pass image 1 as `--ref` to the image generation skill:
   ```bash
   ${BUN_X} ${SKILL_DIR}/scripts/main.ts \
     --promptfiles prompts/02-content-xxx.md \
     --ref path/to/01-cover-xxx.png \
     --image 02-content-xxx.png --ar 3:4 --quality 2k
   ```
   This ensures the AI maintains the same character design, illustration style, and color rendering across the series.

### Step 6: Combine

Assemble all sections into final prompt following base structure.

## Example: Assembled Prompt

```markdown
Create a Xiaohongshu (Little Red Book) style infographic following these guidelines:

## Image Specifications

- **Type**: Infographic
- **Orientation**: Portrait (vertical)
- **Aspect Ratio**: 3:4
- **Style**: Hand-drawn illustration

## Core Principles

- Hand-drawn quality throughout - NO realistic or photographic elements
- If content involves sensitive or copyrighted figures, create stylistically similar alternatives
- Keep information concise, highlight keywords and core concepts
- Use ample whitespace for easy visual scanning
- Maintain clear visual hierarchy

## Text Style (CRITICAL)

- **ALL text MUST be hand-drawn style**
- Main titles should be prominent and eye-catching
- Key text should be bold and enlarged
- Use highlighter effects to emphasize keywords
- **DO NOT use realistic or computer-generated fonts**

## Language

- Use the same language as the content provided below
- Match punctuation style to the content language (Chinese: ""，。！)

---

## Style: Notion

**Color Palette**:
- Primary: Black (#1A1A1A), dark gray (#4A4A4A)
- Background: Pure white (#FFFFFF), off-white (#FAFAFA)
- Accents: Pastel blue (#A8D4F0), pastel yellow (#F9E79F), pastel pink (#FADBD8)

**Visual Elements**:
- Simple line doodles, hand-drawn wobble effect
- Geometric shapes, stick figures
- Maximum whitespace, single-weight ink lines
- Clean, uncluttered compositions

**Typography**:
- Clean hand-drawn lettering
- Simple sans-serif labels
- Minimal decoration on text

---

## Layout: Dense

**Information Density**: High (5-8 key points)
**Whitespace**: 20-30% of canvas

**Structure**:
- Multiple sections, structured grid
- More text, compact but organized
- Title + multiple sections with headers + numerous points

**Visual Balance**:
- Organized grid structure
- Clear section boundaries
- Compact but readable spacing

---

## Content

**Position**: Content (Page 3 of 6)
**Core Message**: ChatGPT使用技巧

**Text Content**:
- Title: 「ChatGPT」
- Subtitle: 最强AI助手
- Points:
  - 写文案：给出框架，秒出初稿
  - 改文章：润色、翻译、总结
  - 编程：写代码、找bug
  - 学习：解释概念、出题练习

**Visual Concept**:
ChatGPT logo居中，四周放射状展示功能点
深色科技背景，霓虹绿点缀

---

## Watermark

Include a subtle watermark "@myxhsaccount" positioned at bottom-right
with approximately 50% visibility. The watermark should
be legible but not distracting from the main content.

---

Please use nano banana pro to generate the infographic based on the specifications above.
```

## Prompt Checklist

Before generating, verify:

- [ ] Style section loaded from correct preset
- [ ] Layout section matches outline specification
- [ ] Content accurately reflects outline entry
- [ ] Language matches source content
- [ ] Watermark included (if enabled in preferences)
- [ ] No conflicting instructions
