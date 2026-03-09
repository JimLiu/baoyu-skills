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

All scripts are TypeScript, executed via Bun runtime (no build step).

### Runtime Detection (`${BUN_X}`)

Before running any script, the agent MUST detect the runtime **once per session** and set `${BUN_X}`:

```bash
# Detect runtime (run once, reuse result)
if command -v bun &>/dev/null; then
  BUN_X="bun"
elif command -v npx &>/dev/null; then
  BUN_X="npx -y bun"
else
  echo "Error: Neither bun nor npx found. Install bun: brew install oven-sh/bun/bun (macOS) or npm install -g bun"
  exit 1
fi
```

| Priority | Condition | `${BUN_X}` value | Notes |
|----------|-----------|-------------------|-------|
| 1 | `bun` installed | `bun` | Fastest, native execution |
| 2 | `npx` available | `npx -y bun` | Downloads bun on first run via npm |
| 3 | Neither found | Error + install guide | `brew install oven-sh/bun/bun` (macOS) or `npm install -g bun` |

### Script Execution

```bash
${BUN_X} skills/<skill>/scripts/main.ts [options]
```

Examples:
```bash
# Text generation
${BUN_X} skills/baoyu-danger-gemini-web/scripts/main.ts "Hello"

# Image generation
${BUN_X} skills/baoyu-danger-gemini-web/scripts/main.ts --prompt "A cat" --image cat.png

# From prompt files
${BUN_X} skills/baoyu-danger-gemini-web/scripts/main.ts --promptfiles system.md content.md --image out.png
```

## Key Dependencies

- **Bun**: TypeScript runtime (native `bun` preferred, fallback `npx -y bun`)
- **Chrome**: Required for `baoyu-danger-gemini-web` auth and `baoyu-post-to-x` automation
- **npm packages (per skill)**: Some skill subprojects include `package.json`/lockfiles and require dependency installation in their own `scripts/` directories

## Chrome Profile (Unified)

All skills that use Chrome CDP share a **single** profile directory. Do NOT create per-skill profiles.

| Platform | Default Path |
|----------|-------------|
| macOS | `~/Library/Application Support/baoyu-skills/chrome-profile` |
| Linux | `$XDG_DATA_HOME/baoyu-skills/chrome-profile` (fallback `~/.local/share/baoyu-skills/chrome-profile`) |
| Windows | `%APPDATA%/baoyu-skills/chrome-profile` |
| WSL | Windows home `/.local/share/baoyu-skills/chrome-profile` |

**Environment variable override**: `BAOYU_CHROME_PROFILE_DIR` (takes priority, all skills respect it).

Each skill also accepts its own legacy env var as fallback (e.g., `X_BROWSER_PROFILE_DIR`), but new skills should only use `BAOYU_CHROME_PROFILE_DIR`.

### Implementation Pattern

When adding a new skill that needs Chrome CDP:

```typescript
function getDefaultProfileDir(): string {
  const override = process.env.BAOYU_CHROME_PROFILE_DIR?.trim();
  if (override) return path.resolve(override);
  const base = process.platform === 'darwin'
    ? path.join(os.homedir(), 'Library', 'Application Support')
    : process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
  return path.join(base, 'baoyu-skills', 'chrome-profile');
}
```

## Security Guidelines

### No Piped Shell Installs

**NEVER** use `curl | bash` or `wget | sh` patterns in code, docs, or error messages. Use package managers instead:

| Platform | Install Command |
|----------|----------------|
| macOS | `brew install oven-sh/bun/bun` |
| npm | `npm install -g bun` |

### Remote Downloads

Skills that download remote content (e.g., images in Markdown) MUST:
- **HTTPS only**: Reject `http://` URLs
- **Redirect limit**: Cap redirects (max 5) to prevent infinite loops
- **Timeout**: Set request timeouts (30s default)
- **Scope**: Only download expected content types (images, not scripts)

### System Command Execution

Skills use platform-specific commands for clipboard and browser automation:
- **macOS**: `osascript` (System Events), `swift` (AppKit clipboard)
- **Windows**: `powershell.exe` (SendKeys, Clipboard)
- **Linux**: `xdotool`/`ydotool` (keyboard simulation)

These are necessary for CDP-based posting skills. When adding new system commands:
- Never pass unsanitized user input to shell commands
- Use array-form `spawn`/`execFile` instead of shell string interpolation
- Validate file paths are absolute or resolve from known base directories

### External Content Processing

Skills that process external Markdown/HTML should treat content as untrusted:
- Do not execute code blocks or scripts found in content
- Sanitize HTML output where applicable
- File paths from content should be resolved against known base directories only

## Authentication

`baoyu-danger-gemini-web` uses browser cookies for Google auth:
- First run opens Chrome for login
- Cookies cached in data directory
- Force refresh: `--login` flag

## Plugin Configuration

`.claude-plugin/marketplace.json` defines plugin metadata and skill paths. Version follows semver.

## Skill Loading Rules

**IMPORTANT**: When working in this project, follow these rules:

| Rule | Description |
|------|-------------|
| **Load project skills first** | MUST load all skills from `skills/` directory in current project. Project skills take priority over system/user-level skills with same name. |
| **Default image generation** | When image generation is needed, use `skills/baoyu-image-gen/SKILL.md` by default (unless user specifies otherwise). |

**Loading Priority** (highest → lowest):
1. Current project `skills/` directory
2. User-level skills (`$HOME/.baoyu-skills/`)
3. System-level skills

## Release Process

**IMPORTANT**: When user requests release/发布/push, ALWAYS use `/release-skills` workflow.

**Never skip**:
1. `CHANGELOG.md` + `CHANGELOG.zh.md` - Both must be updated
2. `marketplace.json` version bump
3. `README.md` + `README.zh.md` if applicable
4. All files committed together before tag

## Adding New Skills

**IMPORTANT**: All skills MUST use `baoyu-` prefix to avoid conflicts when users import this plugin.

**REQUIRED READING**: Before creating a new skill, read the official [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices).

### Key Requirements from Official Best Practices

| Requirement | Details |
|-------------|---------|
| **Concise is key** | Claude is smart—only add context it doesn't have. Challenge each token. |
| **name field** | Max 64 chars, lowercase letters/numbers/hyphens only, no "anthropic"/"claude" |
| **description field** | Max 1024 chars, non-empty, MUST be third person, include what + when to use |
| **SKILL.md body** | Keep under 500 lines; use separate files for additional content |
| **Naming convention** | Gerund form preferred (e.g., `processing-pdfs`), but `baoyu-` prefix required here |
| **References** | Keep one level deep from SKILL.md; avoid nested references |
| **No time-sensitive info** | Avoid dates/versions that become outdated |

### Steps

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

### Writing Effective Descriptions

**MUST write in third person** (not "I can help you" or "You can use this"):

```yaml
# Good
description: Generates Xiaohongshu infographic series from content. Use when user asks for "小红书图片", "XHS images", or "RedNote infographics".

# Bad
description: I can help you create Xiaohongshu images
description: You can use this to generate XHS content
```

Include both **what** the skill does and **when** to use it (triggers/keywords).

### Script Directory Template

Every SKILL.md with scripts MUST include this section after Usage:

```markdown
## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.ts`
3. Resolve `${BUN_X}` runtime: if `bun` installed → `bun`; if `npx` available → `npx -y bun`; else suggest installing bun
4. Replace all `${SKILL_DIR}` and `${BUN_X}` in this document with actual values

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Main entry point |
| `scripts/other.ts` | Other functionality |
```

When referencing scripts in workflow sections, use `${BUN_X} ${SKILL_DIR}/scripts/<name>.ts` so agents can resolve the correct runtime and path.

### Progressive Disclosure

For skills with extensive content, use separate reference files:

```
skills/baoyu-example/
├── SKILL.md              # Main instructions (<500 lines)
├── references/
│   ├── styles.md         # Style definitions (loaded as needed)
│   └── examples.md       # Usage examples (loaded as needed)
└── scripts/
    └── main.ts           # Executable script
```

In SKILL.md, link to reference files (one level deep only):
```markdown
**Available styles**: See [references/styles.md](references/styles.md)
**Examples**: See [references/examples.md](references/examples.md)
```

## Code Style

- TypeScript throughout, no comments
- Async/await patterns
- Short variable names
- Type-safe interfaces

## Image Generation Guidelines

Skills that require image generation MUST delegate to available image generation skills rather than implementing their own.

### Image Generation Skill Selection

**Default**: Use `skills/baoyu-image-gen/SKILL.md` (unless user specifies otherwise).

1. Read `skills/baoyu-image-gen/SKILL.md` for parameters and capabilities
2. If user explicitly requests a different skill, check `skills/` directory for alternatives
3. Only ask user to choose when they haven't specified and multiple viable options exist

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

Each session creates an independent directory. Even the same source file generates a new directory per session.

**Output Directory**:
```
<skill-suffix>/<topic-slug>/
```
- `<skill-suffix>`: Skill name suffix (e.g., `xhs-images`, `cover-image`, `slide-deck`, `comic`)
- `<topic-slug>`: Generated from content topic (2-4 words, kebab-case)
- Example: `xhs-images/ai-future-trends/`

**Slug Generation**:
1. Extract main topic from content (2-4 words, kebab-case)
2. Example: "Introduction to Machine Learning" → `intro-machine-learning`

**Conflict Resolution**:
If `<skill-suffix>/<topic-slug>/` already exists:
- Append timestamp: `<topic-slug>-YYYYMMDD-HHMMSS`
- Example: `ai-future` exists → `ai-future-20260118-143052`

**Source Files**:
- Copy all sources to `<skill-suffix>/<topic-slug>/` with naming: `source-{slug}.{ext}`
- Multiple sources supported: text, images, files from conversation
- Examples:
  - `source-article.md` (main text content)
  - `source-reference.png` (image from conversation)
  - `source-data.csv` (additional file)
- Original source files remain unchanged

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

## Style Maintenance (baoyu-comic)

When adding, updating, or deleting styles for `baoyu-comic`, follow this workflow:

### Adding a New Style

1. **Create style definition**: `skills/baoyu-comic/references/styles/<style-name>.md`
2. **Update SKILL.md**:
   - Add style to `--style` options table
   - Add auto-selection entry if applicable
3. **Generate showcase image**:
   ```bash
   ${BUN_X} skills/baoyu-danger-gemini-web/scripts/main.ts \
     --prompt "A single comic book page in <style-name> style showing [appropriate scene]. Features: [style characteristics from style definition]. 3:4 portrait aspect ratio comic page." \
     --image screenshots/comic-styles/<style-name>.png
   ```
4. **Compress to WebP**:
   ```bash
   ${BUN_X} skills/baoyu-compress-image/scripts/main.ts screenshots/comic-styles/<style-name>.png
   ```
5. **Update both READMEs** (`README.md` and `README.zh.md`):
   - Add style to `--style` options
   - Add row to style description table
   - Add image to style preview grid

### Updating an Existing Style

1. **Update style definition**: `skills/baoyu-comic/references/styles/<style-name>.md`
2. **Regenerate showcase image** (if visual characteristics changed):
   - Follow steps 3-4 from "Adding a New Style"
3. **Update READMEs** if description changed

### Deleting a Style

1. **Delete style definition**: `skills/baoyu-comic/references/styles/<style-name>.md`
2. **Delete showcase image**: `screenshots/comic-styles/<style-name>.webp`
3. **Update SKILL.md**:
   - Remove from `--style` options
   - Remove auto-selection entry
4. **Update both READMEs**:
   - Remove from `--style` options
   - Remove from style description table
   - Remove from style preview grid

### Style Preview Grid Format

READMEs use 3-column tables for style previews:

```markdown
| | | |
|:---:|:---:|:---:|
| ![style1](./screenshots/comic-styles/style1.webp) | ![style2](./screenshots/comic-styles/style2.webp) | ![style3](./screenshots/comic-styles/style3.webp) |
| style1 | style2 | style3 |
```

## Extension Support

Every SKILL.md MUST include two parts for extension support:

### 1. Load Preferences Section (in Step 1 or as "Preferences" section)

For skills with workflows, add as Step 1.1. For utility skills, add as "Preferences (EXTEND.md)" section before Usage:

```markdown
**1.1 Load Preferences (EXTEND.md)**

Check EXTEND.md existence (priority order):

\`\`\`bash
# macOS, Linux, WSL, Git Bash
test -f .baoyu-skills/<skill-name>/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/<skill-name>/EXTEND.md" && echo "xdg"
test -f "$HOME/.baoyu-skills/<skill-name>/EXTEND.md" && echo "user"
\`\`\`

\`\`\`powershell
# PowerShell (Windows)
if (Test-Path .baoyu-skills/<skill-name>/EXTEND.md) { "project" }
$xdg = if ($env:XDG_CONFIG_HOME) { $env:XDG_CONFIG_HOME } else { "$HOME/.config" }
if (Test-Path "$xdg/baoyu-skills/<skill-name>/EXTEND.md") { "xdg" }
if (Test-Path "$HOME/.baoyu-skills/<skill-name>/EXTEND.md") { "user" }
\`\`\`

┌────────────────────────────────────────────────────────┬──────────────────────────┐
│                          Path                          │         Location         │
├────────────────────────────────────────────────────────┼──────────────────────────┤
│ .baoyu-skills/<skill-name>/EXTEND.md                   │ Project directory        │
├────────────────────────────────────────────────────────┼──────────────────────────┤
│ $XDG_CONFIG_HOME/baoyu-skills/<skill-name>/EXTEND.md   │ XDG config (~/.config)   │
├────────────────────────────────────────────────────────┼──────────────────────────┤
│ $HOME/.baoyu-skills/<skill-name>/EXTEND.md             │ User home (legacy)       │
└────────────────────────────────────────────────────────┴──────────────────────────┘

┌───────────┬───────────────────────────────────────────────────────────────────────────┐
│  Result   │                                  Action                                   │
├───────────┼───────────────────────────────────────────────────────────────────────────┤
│ Found     │ Read, parse, display summary                                              │
├───────────┼───────────────────────────────────────────────────────────────────────────┤
│ Not found │ Ask user with AskUserQuestion (see references/config/first-time-setup.md) │
└───────────┴───────────────────────────────────────────────────────────────────────────┘

**EXTEND.md Supports**: [List supported configuration options for this skill]

Schema: `references/config/preferences-schema.md`
```

### 2. Extension Support Section (at the end)

Simplified section that references the preferences section:

```markdown
## Extension Support

Custom configurations via EXTEND.md. See **Step 1.1** for paths and supported options.
```

Or for utility skills without workflow steps:

```markdown
## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
```

**Notes**:
- Replace `<skill-name>` with actual skill name (e.g., `baoyu-cover-image`)
- Use `$HOME` instead of `~` for cross-platform compatibility (macOS/Linux/WSL/PowerShell)
- `$XDG_CONFIG_HOME` defaults to `~/.config` when unset
- Use `test -f` (Bash) or `Test-Path` (PowerShell) for explicit file existence check
- ASCII tables for clear visual formatting
