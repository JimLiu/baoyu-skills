---
name: baoyu-comic
description: Knowledge comic creator supporting multiple art styles and tones. Creates original educational comics with detailed panel layouts and sequential image generation. Use when user asks to create "知识漫画", "教育漫画", "biography comic", "tutorial comic", or "Logicomix-style comic".
version: 1.56.1
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-comic
    requires:
      anyBins:
        - bun
        - npx
---

# Knowledge Comic Creator

Create original knowledge comics with flexible art style × tone combinations.

## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete `AskUserQuestion` references below are examples — substitute the local equivalent in other runtimes.

## Options

### Visual Dimensions

| Option | Values | Description |
|--------|--------|-------------|
| `--art` | ligne-claire (default), manga, realistic, ink-brush, chalk, minimalist | Art style / rendering technique |
| `--tone` | neutral (default), warm, dramatic, romantic, energetic, vintage, action | Mood / atmosphere |
| `--layout` | standard (default), cinematic, dense, splash, mixed, webtoon, four-panel | Panel arrangement |
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
| `minimalist` | 极简 | Clean black line art, limited spot color, stick-figure characters |

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
| `--style concept-story` | `--art manga --tone warm` | Visual symbol system, growth arc, dialogue+action balance |
| `--style four-panel` | `--art minimalist --tone neutral --layout four-panel` | 起承转合 4-panel structure, B&W + spot color, stick-figure characters |

### Compatibility Matrix

| Art Style | ✓✓ Best | ✓ Works | ✗ Avoid |
|-----------|---------|---------|---------|
| ligne-claire | neutral, warm | dramatic, vintage, energetic | romantic, action |
| manga | neutral, romantic, energetic, action | warm, dramatic | vintage |
| realistic | neutral, warm, dramatic, vintage | action | romantic, energetic |
| ink-brush | neutral, dramatic, action, vintage | warm | romantic, energetic |
| chalk | neutral, warm, energetic | vintage | dramatic, action, romantic |
| minimalist | neutral | warm, energetic | dramatic, vintage, romantic, action |

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
| Psychology, motivation, business narrative | **concept-story** preset |
| Business allegory, fable, parable, short insight, 四格 | **four-panel** preset |
| Biography, balanced | ligne-claire + neutral |

**When preset is recommended**: Load `references/presets/{preset}.md` and apply all special rules.

Details: [references/auto-selection.md](references/auto-selection.md)

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `{baseDir}`
2. Script path = `{baseDir}/scripts/<script-name>.ts`
3. Replace all `{baseDir}` in this document with the actual path
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
- [ ] Step 7: Generate images
  - [ ] 7.1 Generate character sheet (if needed) → characters/characters.png
  - [ ] 7.2 Generate pages (with --ref if character sheet exists)
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
| 7.1 | Generate character sheet (if needed) | `characters/characters.png` |
| 7.2 | Generate pages (with character ref if available) | `*.png` files |
| 8 | Merge to PDF | `{slug}.pdf` |
| 9 | Completion report | Summary |

### Step 7: Image Generation

**7.1 Generate character sheet (conditional)**:

Character sheet is recommended for multi-page comics with recurring characters, but **NOT required** for all presets:

| Condition | Action |
|-----------|--------|
| Multi-page comic with detailed characters | Generate character sheet (recommended) |
| Preset with simplified characters (e.g., four-panel minimalist) | Skip — prompt descriptions are sufficient |
| Single-page comic | Skip unless characters are complex |

**When generating character sheet**:
- **Backup rule**: If `characters/characters.png` exists, rename to `characters/characters-backup-YYYYMMDD-HHMMSS.png`
- Invoke an installed image generation skill such as `baoyu-imagine`
- Read that skill's `SKILL.md` and follow its documented interface rather than calling its scripts directly
- Use `characters/characters.md` as the prompt-file input
- Save output to `characters/characters.png`
- Use aspect ratio `4:3`

**Compress character sheet** (recommended when using as `--ref`):
- Use available image compression skill (if any)
- Or system tools: `sips -s format jpeg -s formatOptions 80 input.png --out output.jpg` (macOS)
- Or: `pngquant --quality=65-80 input.png -o output.png`
- Compression reduces API payload size and avoids `--ref` failures

**7.2 Generate each page**:

| Character Sheet | Skill Capability | Strategy |
|-----------------|------------------|----------|
| Exists | Supports `--ref` | Pass `characters/characters.png` with EVERY page |
| Exists | No `--ref` support | Prepend character descriptions to EVERY prompt file |
| Skipped | — | Prompt file contains all character descriptions inline |

**`--ref` failure recovery**: If generation fails with `--ref`:
1. **Compress**: Convert reference image to JPEG with reduced quality:
   `sips -s format jpeg -s formatOptions 70 characters.png --out characters-compressed.jpg`
2. **Retry** with compressed image as `--ref`
3. **If still fails**: Fall back to generating WITHOUT `--ref` (prompt-only, character descriptions embedded in prompt text)

**Backup rules for page generation**:
- If prompt file exists: rename to `prompts/NN-{cover|page}-[slug]-backup-YYYYMMDD-HHMMSS.md`
- If image file exists: rename to `NN-{cover|page}-[slug]-backup-YYYYMMDD-HHMMSS.png`
- Invoke the installed image generation skill for each page
- Use `prompts/01-page-xxx.md` as the prompt-file input
- Save output to `01-page-xxx.png`
- Use aspect ratio from storyboard (default `3:4`, preset may override)
- If character sheet exists and skill supports reference images, pass as `--ref`

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
- `references/art-styles/` - Art styles (ligne-claire, manga, realistic, ink-brush, chalk, minimalist)
- `references/tones/` - Tones (neutral, warm, dramatic, romantic, energetic, vintage, action)
- `references/presets/` - Presets with special rules (ohmsha, wuxia, shoujo, concept-story, four-panel)
- `references/layouts/` - Layouts (standard, cinematic, dense, splash, mixed, webtoon, four-panel)

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
- **Step 7.1 character sheet** - recommended for multi-page comics, optional for simple presets
- **Step 7.2 character reference** - use `--ref` if sheet exists; compress/convert on failure; fall back to prompt-only
- Watermark/language configured once in EXTEND.md
