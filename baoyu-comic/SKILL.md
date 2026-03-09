---
name: baoyu-comic
description: Knowledge comic creator supporting multiple art styles and tones. Creates original educational comics with detailed panel layouts and sequential image generation. Use when user asks to create "知识漫画", "教育漫画", "biography comic", "tutorial comic", or "Logicomix-style comic".
---

# Knowledge Comic Creator

Create original knowledge comics with flexible art style × tone combinations.

## Usage

```bash
/baoyu-comic posts/turing-story/source.md
/baoyu-comic article.md --art manga --tone warm
/baoyu-comic  # then paste content
```

## Options

### Visual Dimensions

| Option | Values | Description |
|--------|--------|-------------|
| `--art` | ligne-claire (default), manga, realistic, ink-brush, chalk | Art style / rendering technique |
| `--tone` | neutral (default), warm, dramatic, romantic, energetic, vintage, action | Mood / atmosphere |
| `--layout` | standard (default), cinematic, dense, splash, mixed, webtoon | Panel arrangement |
| `--aspect` | 3:4 (default, portrait), 4:3 (landscape), 16:9 (widescreen) | Page aspect ratio |
| `--lang` | auto (default), zh, en, ja, etc. | Output language |

### Partial Workflow Options

| Option | Description |
|--------|-------------|
| `--storyboard-only` | Generate storyboard only, skip prompts and images |
| `--prompts-only` | Generate storyboard + prompts, skip images |
| `--images-only` | Generate images from existing prompts directory |
| `--regenerate N` | Regenerate specific page(s) only (e.g., `3` or `2,5,8`) |

Details: [references/partial-workflows.md](references/partial-workflows.md)

### Art Styles (画风)

| Style | 中文 | Description |
|-------|------|-------------|
| `ligne-claire` | 清线 | Uniform lines, flat colors, European comic tradition (Tintin, Logicomix) |
| `manga` | 日漫 | Large eyes, manga conventions, expressive emotions |
| `realistic` | 写实 | Digital painting, realistic proportions, sophisticated |
| `ink-brush` | 水墨 | Chinese brush strokes, ink wash effects |
| `chalk` | 粉笔 | Chalkboard aesthetic, hand-drawn warmth |

### Tones (基调)

| Tone | 中文 | Description |
|------|------|-------------|
| `neutral` | 中性 | Balanced, rational, educational |
| `warm` | 温馨 | Nostalgic, personal, comforting |
| `dramatic` | 戏剧 | High contrast, intense, powerful |
| `romantic` | 浪漫 | Soft, beautiful, decorative elements |
| `energetic` | 活力 | Bright, dynamic, exciting |
| `vintage` | 复古 | Historical, aged, period authenticity |
| `action` | 动作 | Speed lines, impact effects, combat |

### Preset Shortcuts

Presets with special rules beyond art+tone:

| Preset | Equivalent | Special Rules |
|--------|-----------|---------------|
| `--style ohmsha` | `--art manga --tone neutral` | Visual metaphors, NO talking heads, gadget reveals |
| `--style wuxia` | `--art ink-brush --tone action` | Qi effects, combat visuals, atmospheric elements |
| `--style shoujo` | `--art manga --tone romantic` | Decorative elements, eye details, romantic beats |

### Compatibility Matrix

| Art Style | ✓✓ Best | ✓ Works | ✗ Avoid |
|-----------|---------|---------|---------|
| ligne-claire | neutral, warm | dramatic, vintage, energetic | romantic, action |
| manga | neutral, romantic, energetic, action | warm, dramatic | vintage |
| realistic | neutral, warm, dramatic, vintage | action | romantic, energetic |
| ink-brush | neutral, dramatic, action, vintage | warm | romantic, energetic |
| chalk | neutral, warm, energetic | vintage | dramatic, action, romantic |

Details: [references/auto-selection.md](references/auto-selection.md)

## Auto Selection

Content signals determine default art + tone + layout (or preset):

| Content Signals | Recommended |
|-----------------|-------------|
| Tutorial, how-to, programming, educational | **ohmsha** preset |
| Pre-1950, classical, ancient | realistic + vintage |
| Personal story, mentor | ligne-claire + warm |
| Martial arts, wuxia | **wuxia** preset |
| Romance, school life | **shoujo** preset |
| Biography, balanced | ligne-claire + neutral |

**When preset is recommended**: Load `references/presets/{preset}.md` and apply all special rules.

Details: [references/auto-selection.md](references/auto-selection.md)

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.ts`
3. Replace all `${SKILL_DIR}` in this document with the actual path
4. Resolve `${BUN_X}` runtime: if `bun` installed → `bun`; if `npx` available → `npx -y bun`; else suggest installing bun

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/merge-to-pdf.ts` | Merge comic pages into PDF |

## File Structure

Output directory: `comic/{topic-slug}/`
- Slug: 2-4 words kebab-case from topic (e.g., `alan-turing-bio`)
- Conflict: append timestamp (e.g., `turing-story-20260118-143052`)

**Contents**:
| File | Description |
|------|-------------|
| `source-{slug}.{ext}` | Source files |
| `analysis.md` | Content analysis |
| `storyboard.md` | Storyboard with panel breakdown |
| `characters/characters.md` | Character definitions |
| `characters/characters.png` | Character reference sheet |
| `prompts/NN-{cover\|page}-[slug].md` | Generation prompts |
| `NN-{cover\|page}-[slug].png` | Generated images |
| `{topic-slug}.pdf` | Final merged PDF |

## Language Handling

**Detection Priority**:
1. `--lang` flag (explicit)
2. EXTEND.md `language` setting
3. User's conversation language
4. Source content language

**Rule**: Use user's input language or saved language preference for ALL interactions:
- Storyboard outlines and scene descriptions
- Image generation prompts
- User selection options and confirmations
- Progress updates, questions, errors, summaries

Technical terms remain in English.

## Workflow

### Progress Checklist

```
Comic Progress:
- [ ] Step 1: Setup & Analyze
  - [ ] 1.1 Preferences (EXTEND.md) ⛔ BLOCKING
    - [ ] Found → load preferences → continue
    - [ ] Not found → run first-time setup → MUST complete before other steps
  - [ ] 1.2 Analyze, 1.3 Check existing
- [ ] Step 2: Confirmation - Style & options ⚠️ REQUIRED
- [ ] Step 3: Generate storyboard + characters
- [ ] Step 4: Review outline (conditional)
- [ ] Step 5: Generate prompts
- [ ] Step 6: Review prompts (conditional)
- [ ] Step 7: Generate images ⚠️ CHARACTER REF REQUIRED
  - [ ] 7.1 Generate character sheet FIRST → characters/characters.png
  - [ ] 7.2 Generate pages WITH --ref characters/characters.png
- [ ] Step 8: Merge to PDF
- [ ] Step 9: Completion report
```

### Flow

```
Input → [Preferences] ─┬─ Found → Continue
                       │
                       └─ Not found → First-Time Setup ⛔ BLOCKING
                                      │
                                      └─ Complete setup → Save EXTEND.md → Continue
                                                                              │
        ┌─────────────────────────────────────────────────────────────────────┘
        ↓
Analyze → [Check Existing?] → [Confirm: Style + Reviews] → Storyboard → [Review?] → Prompts → [Review?] → Images → PDF → Complete
```

### Step Summary

| Step | Action | Key Output |
|------|--------|------------|
| 1.1 | Load EXTEND.md preferences ⛔ BLOCKING if not found | Config loaded |
| 1.2 | Analyze content | `analysis.md` |
| 1.3 | Check existing directory | Handle conflicts |
| 2 | Confirm style, focus, audience, reviews | User preferences |
| 3 | Generate storyboard + characters | `storyboard.md`, `characters/` |
| 4 | Review outline (if requested) | User approval |
| 5 | Generate prompts | `prompts/*.md` |
| 6 | Review prompts (if requested) | User approval |
| **7.1** | **Generate character sheet FIRST** | `characters/characters.png` |
| **7.2** | Generate pages **with character ref** | `*.png` files |
| 8 | Merge to PDF | `{slug}.pdf` |
| 9 | Completion report | Summary |

### Step 7: Image Generation ⚠️ CRITICAL

**Character reference is MANDATORY for visual consistency.**

**7.1 Generate character sheet first**:
- **Backup rule**: If `characters/characters.png` exists, rename to `characters/characters-backup-YYYYMMDD-HHMMSS.png`
```bash
# Use Reference Sheet Prompt from characters/characters.md
${BUN_X} ${SKILL_DIR}/../baoyu-image-gen/scripts/main.ts \
  --promptfiles characters/characters.md \
  --image characters/characters.png --ar 4:3
```

**Compress character sheet** (recommended):
Compress to reduce token usage when used as reference image:
- Use available image compression skill (if any)
- Or system tools: `pngquant`, `optipng`, `sips` (macOS)
- **Keep PNG format**, lossless compression preferred

**7.2 Generate each page WITH character reference**:

| Skill Capability | Strategy |
|------------------|----------|
| Supports `--ref` | Pass `characters/characters.png` with EVERY page |
| No `--ref` support | Prepend character descriptions to EVERY prompt file |

**Backup rules for page generation**:
- If prompt file exists: rename to `prompts/NN-{cover|page}-[slug]-backup-YYYYMMDD-HHMMSS.md`
- If image file exists: rename to `NN-{cover|page}-[slug]-backup-YYYYMMDD-HHMMSS.png`

```bash
# Example: ALWAYS include --ref for consistency
${BUN_X} ${SKILL_DIR}/../baoyu-image-gen/scripts/main.ts \
  --promptfiles prompts/01-page-xxx.md \
  --image 01-page-xxx.png --ar 3:4 \
  --ref characters/characters.png
```

**Full workflow details**: [references/workflow.md](references/workflow.md)

### EXTEND.md Paths ⛔ BLOCKING

**CRITICAL**: If EXTEND.md not found, MUST complete first-time setup before ANY other questions or steps. Do NOT proceed to content analysis, do NOT ask about art style, do NOT ask about tone — ONLY complete the preferences setup first.

| Path | Location |
|------|----------|
| `.baoyu-skills/baoyu-comic/EXTEND.md` | Project directory |
| `$HOME/.baoyu-skills/baoyu-comic/EXTEND.md` | User home |

| Result | Action |
|--------|--------|
| Found | Read, parse, display summary → Continue |
| Not found | ⛔ **BLOCKING**: Run first-time setup ONLY ([references/config/first-time-setup.md](references/config/first-time-setup.md)) → Complete and save EXTEND.md → Then continue |

**EXTEND.md Supports**: Watermark | Preferred art/tone/layout | Custom style definitions | Character presets | Language preference

Schema: [references/config/preferences-schema.md](references/config/preferences-schema.md)

## References

**Core Templates**:
- [analysis-framework.md](references/analysis-framework.md) - Deep content analysis
- [character-template.md](references/character-template.md) - Character definition format
- [storyboard-template.md](references/storyboard-template.md) - Storyboard structure
- [ohmsha-guide.md](references/ohmsha-guide.md) - Ohmsha manga specifics

**Style Definitions**:
- `references/art-styles/` - Art styles (ligne-claire, manga, realistic, ink-brush, chalk)
- `references/tones/` - Tones (neutral, warm, dramatic, romantic, energetic, vintage, action)
- `references/presets/` - Presets with special rules (ohmsha, wuxia, shoujo)
- `references/layouts/` - Layouts (standard, cinematic, dense, splash, mixed, webtoon)

**Workflow**:
- [workflow.md](references/workflow.md) - Full workflow details
- [auto-selection.md](references/auto-selection.md) - Content signal analysis
- [partial-workflows.md](references/partial-workflows.md) - Partial workflow options

**Config**:
- [config/preferences-schema.md](references/config/preferences-schema.md) - EXTEND.md schema
- [config/first-time-setup.md](references/config/first-time-setup.md) - First-time setup
- [config/watermark-guide.md](references/config/watermark-guide.md) - Watermark configuration

## Page Modification

| Action | Steps |
|--------|-------|
| **Edit** | **Update prompt file FIRST** → `--regenerate N` → Regenerate PDF |
| **Add** | Create prompt at position → Generate with character ref → Renumber subsequent → Update storyboard → Regenerate PDF |
| **Delete** | Remove files → Renumber subsequent → Update storyboard → Regenerate PDF |

**IMPORTANT**: When updating pages, ALWAYS update the prompt file (`prompts/NN-{cover|page}-[slug].md`) FIRST before regenerating. This ensures changes are documented and reproducible.

## Notes

- Image generation: 10-30 seconds per page
- Auto-retry once on generation failure
- Use stylized alternatives for sensitive public figures
- Maintain style consistency via session ID
- **Step 2 confirmation required** - do not skip
- **Steps 4/6 conditional** - only if user requested in Step 2
- **Step 7.1 character sheet MUST be generated before pages** - ensures consistency
- **Step 7.2 EVERY page MUST reference characters** - use `--ref` or embed descriptions
- Watermark/language configured once in EXTEND.md
