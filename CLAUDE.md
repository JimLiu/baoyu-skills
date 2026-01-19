# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Code marketplace plugin providing AI-powered content generation skills. Skills use Gemini Web API (reverse-engineered) for text/image generation and Chrome CDP for browser automation.

## Architecture

Skills are organized into three plugin categories in `marketplace.json`:

```
skills/
├── [content-skills]           # Content generation and publishing
│   ├── baoyu-xhs-images/          # Xiaohongshu infographic series (1-10 images)
│   ├── baoyu-cover-image/         # Article cover images (2.35:1 aspect)
│   ├── baoyu-slide-deck/          # Presentation slides with outlines
│   ├── baoyu-article-illustrator/ # Smart illustration placement
│   ├── baoyu-comic/               # Knowledge comics (Logicomix/Ohmsha style)
│   ├── baoyu-post-to-x/           # X/Twitter posting automation
│   └── baoyu-post-to-wechat/      # WeChat Official Account posting
│
├── [ai-generation-skills]     # AI-powered generation backends
│   └── baoyu-danger-gemini-web/   # Gemini API wrapper (text + image gen)
│
└── [utility-skills]           # Utility tools for content processing
    ├── baoyu-danger-x-to-markdown/ # X/Twitter content to markdown
    └── baoyu-compress-image/      # Image compression
```

**Plugin Categories**:
| Category | Description |
|----------|-------------|
| `content-skills` | Skills that generate or publish content (images, slides, comics, posts) |
| `ai-generation-skills` | Backend skills providing AI generation capabilities |
| `utility-skills` | Helper tools for content processing (conversion, compression) |

Each skill contains:
- `SKILL.md` - YAML front matter (name, description) + documentation
- `scripts/` - TypeScript implementations
- `prompts/system.md` - AI generation guidelines (optional)

## Running Skills

All scripts run via Bun (no build step):

```bash
npx -y bun skills/<skill>/scripts/main.ts [options]
```

Examples:
```bash
# Text generation
npx -y bun skills/baoyu-danger-gemini-web/scripts/main.ts "Hello"

# Image generation
npx -y bun skills/baoyu-danger-gemini-web/scripts/main.ts --prompt "A cat" --image cat.png

# From prompt files
npx -y bun skills/baoyu-danger-gemini-web/scripts/main.ts --promptfiles system.md content.md --image out.png
```

## Key Dependencies

- **Bun**: TypeScript runtime (via `npx -y bun`)
- **Chrome**: Required for `baoyu-danger-gemini-web` auth and `baoyu-post-to-x` automation
- **No npm packages**: Self-contained TypeScript, no external dependencies

## Authentication

`baoyu-danger-gemini-web` uses browser cookies for Google auth:
- First run opens Chrome for login
- Cookies cached in data directory
- Force refresh: `--login` flag

## Plugin Configuration

`.claude-plugin/marketplace.json` defines plugin metadata and skill paths. Version follows semver.

## Adding New Skills

**IMPORTANT**: All skills MUST use `baoyu-` prefix to avoid conflicts when users import this plugin.

1. Create `skills/baoyu-<name>/SKILL.md` with YAML front matter
   - Directory name: `baoyu-<name>`
   - SKILL.md `name` field: `baoyu-<name>`
2. Add TypeScript in `skills/baoyu-<name>/scripts/`
3. Add prompt templates in `skills/baoyu-<name>/prompts/` if needed
4. **Choose the appropriate category** and register in `marketplace.json`:
   - `content-skills`: For content generation/publishing (images, slides, posts)
   - `ai-generation-skills`: For AI backend capabilities
   - `utility-skills`: For helper tools (conversion, compression)
   - If none fit, create a new category with descriptive name
5. **Add Script Directory section** to SKILL.md (see template below)

### Choosing a Category

| If your skill... | Use category |
|------------------|--------------|
| Generates visual content (images, slides, comics) | `content-skills` |
| Publishes to platforms (X, WeChat, etc.) | `content-skills` |
| Provides AI generation backend | `ai-generation-skills` |
| Converts or processes content | `utility-skills` |
| Compresses or optimizes files | `utility-skills` |

**Creating a new category**: If the skill doesn't fit existing categories, add a new plugin object to `marketplace.json` with:
- `name`: Descriptive kebab-case name (e.g., `analytics-skills`)
- `description`: Brief description of the category
- `skills`: Array with the skill path

### Script Directory Template

Every SKILL.md with scripts MUST include this section after Usage:

```markdown
## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.ts`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Main entry point |
| `scripts/other.ts` | Other functionality |
```

When referencing scripts in workflow sections, use `${SKILL_DIR}/scripts/<name>.ts` so agents can resolve the correct path.

## Code Style

- TypeScript throughout, no comments
- Async/await patterns
- Short variable names
- Type-safe interfaces

## Image Generation Guidelines

Skills that require image generation MUST delegate to available image generation skills rather than implementing their own.

### Image Generation Skill Selection

1. Check available image generation skills in `skills/` directory
2. Read each skill's SKILL.md to understand parameters and capabilities
3. If multiple image generation skills available, ask user to choose preferred skill

### Generation Flow Template

Use this template when implementing image generation in skills:

```markdown
### Step N: Generate Images

**Skill Selection**:
1. Check available image generation skills (e.g., `baoyu-danger-gemini-web`)
2. Read selected skill's SKILL.md for parameter reference
3. If multiple skills available, ask user to choose

**Generation Flow**:
1. Call selected image generation skill with:
   - Prompt file path (or inline prompt)
   - Output image path
   - Any skill-specific parameters (refer to skill's SKILL.md)
2. Generate images sequentially (one at a time)
3. After each image, output progress: "Generated X/N"
4. On failure, auto-retry once before reporting error
```

### Output Path Convention

Generated images from the same skill and source file MUST be grouped together:

**With source file** (e.g., `/path/to/project/content/my-article.md`):
```
/path/to/project/content/my-article/<skill-suffix>/
```
- Remove file extension from source filename
- Use skill name suffix (e.g., `xhs-images`, `cover-image`, `slide-deck`)
- Example: source `/tests-data/anthropic-economic-index.md` + skill `baoyu-xhs-images` → `/tests-data/anthropic-economic-index/xhs-images/`

**Without source file**:
```
./<skill-suffix>/<source-slug>/
```
- Place under current project directory
- Use descriptive slug for the content

**Directory Backup**:
- If output directory already exists, rename existing directory with timestamp
- Format: `<dirname>-backup-YYYYMMDD-HHMMSS`
- Example: `xhs-images` → `xhs-images-backup-20260117-143052`

### Image Naming Convention

Image filenames MUST include meaningful slugs for readability:

**Format**: `NN-{type}-[slug].png`
- `NN`: Two-digit sequence number (01, 02, ...)
- `{type}`: Image type (cover, content, page, slide, illustration, etc.)
- `[slug]`: Descriptive kebab-case slug derived from content

**Examples**:
```
01-cover-ai-future.png
02-content-key-benefits.png
03-page-enigma-machine.png
04-slide-architecture-overview.png
```

**Slug Rules**:
- Derived from image purpose or content (kebab-case)
- Must be unique within the output directory
- 2-5 words, concise but descriptive
- When content changes significantly, update slug accordingly

### Best Practices

- Always read the image generation skill's SKILL.md before calling
- Pass parameters exactly as documented in the skill
- Handle failures gracefully with retry logic
- Provide clear progress feedback to user

## Extension Support

Every SKILL.md MUST include an Extension Support section at the end:

```markdown
## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.baoyu-skills/<skill-name>/EXTEND.md` (project)
2. `~/.baoyu-skills/<skill-name>/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.
```

Replace `<skill-name>` with the actual skill name (e.g., `baoyu-cover-image`).
