---
name: baoyu-url-to-markdown
description: Fetch any URL and convert to markdown using Chrome CDP. Saves the rendered HTML snapshot alongside the markdown, and automatically falls back to the pre-Defuddle HTML-to-Markdown pipeline when Defuddle fails. Supports two modes - auto-capture on page load, or wait for user signal (for pages requiring login). Use when user wants to save a webpage as markdown.
---

# URL to Markdown

Fetches any URL via Chrome CDP, saves the rendered HTML snapshot, and converts it to clean markdown.

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
| `scripts/main.ts` | CLI entry point for URL fetching |
| `scripts/html-to-markdown.ts` | Defuddle-first conversion with automatic legacy fallback |

## Preferences (EXTEND.md)

Check EXTEND.md existence (priority order):

```bash
# macOS, Linux, WSL, Git Bash
test -f .baoyu-skills/baoyu-url-to-markdown/EXTEND.md && echo "project"
test -f "$HOME/.baoyu-skills/baoyu-url-to-markdown/EXTEND.md" && echo "user"
```

```powershell
# PowerShell (Windows)
if (Test-Path .baoyu-skills/baoyu-url-to-markdown/EXTEND.md) { "project" }
if (Test-Path "$HOME/.baoyu-skills/baoyu-url-to-markdown/EXTEND.md") { "user" }
```

┌────────────────────────────────────────────────────────┬───────────────────┐
│                          Path                          │     Location      │
├────────────────────────────────────────────────────────┼───────────────────┤
│ .baoyu-skills/baoyu-url-to-markdown/EXTEND.md          │ Project directory │
├────────────────────────────────────────────────────────┼───────────────────┤
│ $HOME/.baoyu-skills/baoyu-url-to-markdown/EXTEND.md    │ User home         │
└────────────────────────────────────────────────────────┴───────────────────┘

┌───────────┬───────────────────────────────────────────────────────────────────────────┐
│  Result   │                                  Action                                   │
├───────────┼───────────────────────────────────────────────────────────────────────────┤
│ Found     │ Read, parse, apply settings                                               │
├───────────┼───────────────────────────────────────────────────────────────────────────┤
│ Not found │ **MUST** run first-time setup (see below) — do NOT silently create defaults │
└───────────┴───────────────────────────────────────────────────────────────────────────┘

**EXTEND.md Supports**: Download media by default | Default output directory | Default capture mode | Timeout settings

### First-Time Setup (BLOCKING)

**CRITICAL**: When EXTEND.md is not found, you **MUST use `AskUserQuestion`** to ask the user for their preferences before creating EXTEND.md. **NEVER** create EXTEND.md with defaults without asking. This is a **BLOCKING** operation — do NOT proceed with any conversion until setup is complete.

Use `AskUserQuestion` with ALL questions in ONE call:

**Question 1** — header: "Media", question: "How to handle images and videos in pages?"
- "Ask each time (Recommended)" — After saving markdown, ask whether to download media
- "Always download" — Always download media to local imgs/ and videos/ directories
- "Never download" — Keep original remote URLs in markdown

**Question 2** — header: "Output", question: "Default output directory?"
- "url-to-markdown (Recommended)" — Save to ./url-to-markdown/{domain}/{slug}.md
- (User may choose "Other" to type a custom path)

**Question 3** — header: "Save", question: "Where to save preferences?"
- "User (Recommended)" — ~/.baoyu-skills/ (all projects)
- "Project" — .baoyu-skills/ (this project only)

After user answers, create EXTEND.md at the chosen location, confirm "Preferences saved to [path]", then continue.

Full reference: [references/config/first-time-setup.md](references/config/first-time-setup.md)

### Supported Keys

| Key | Default | Values | Description |
|-----|---------|--------|-------------|
| `download_media` | `ask` | `ask` / `1` / `0` | `ask` = prompt each time, `1` = always download, `0` = never |
| `default_output_dir` | empty | path or empty | Default output directory (empty = `./url-to-markdown/`) |

**EXTEND.md → CLI mapping**:
| EXTEND.md key | CLI argument | Notes |
|---------------|-------------|-------|
| `download_media: 1` | `--download-media` | |
| `default_output_dir: ./posts/` | `--output-dir ./posts/` | Directory path. Do NOT pass to `-o` (which expects a file path) |

**Value priority**:
1. CLI arguments (`--download-media`, `-o`, `--output-dir`)
2. EXTEND.md
3. Skill defaults

## Features

- Chrome CDP for full JavaScript rendering
- Two capture modes: auto or wait-for-user
- Save rendered HTML as a sibling `-captured.html` file
- Clean markdown output with metadata
- Defuddle-first markdown conversion with automatic fallback to the pre-Defuddle extractor from git history
- Handles login-required pages via wait mode
- Download images and videos to local directories

## Usage

```bash
# Auto mode (default) - capture when page loads
${BUN_X} ${SKILL_DIR}/scripts/main.ts <url>

# Wait mode - wait for user signal before capture
${BUN_X} ${SKILL_DIR}/scripts/main.ts <url> --wait

# Save to specific file
${BUN_X} ${SKILL_DIR}/scripts/main.ts <url> -o output.md

# Save to a custom output directory (auto-generates filename)
${BUN_X} ${SKILL_DIR}/scripts/main.ts <url> --output-dir ./posts/

# Download images and videos to local directories
${BUN_X} ${SKILL_DIR}/scripts/main.ts <url> --download-media
```

## Options

| Option | Description |
|--------|-------------|
| `<url>` | URL to fetch |
| `-o <path>` | Output file path — must be a **file** path, not directory (default: auto-generated) |
| `--output-dir <dir>` | Base output directory — auto-generates `{dir}/{domain}/{slug}.md` (default: `./url-to-markdown/`) |
| `--wait` | Wait for user signal before capturing |
| `--timeout <ms>` | Page load timeout (default: 30000) |
| `--download-media` | Download image/video assets to local `imgs/` and `videos/`, and rewrite markdown links to local relative paths |

## Capture Modes

| Mode | Behavior | Use When |
|------|----------|----------|
| Auto (default) | Capture on network idle | Public pages, static content |
| Wait (`--wait`) | User signals when ready | Login-required, lazy loading, paywalls |

**Wait mode workflow**:
1. Run with `--wait` → script outputs "Press Enter when ready"
2. Ask user to confirm page is ready
3. Send newline to stdin to trigger capture

## Output Format

Each run saves two files side by side:

- Markdown: YAML front matter with `url`, `title`, `description`, `author`, `published`, optional `coverImage`, and `captured_at`, followed by converted markdown content
- HTML snapshot: `*-captured.html`, containing the rendered page HTML captured from Chrome

The HTML snapshot is saved before any markdown media localization, so it stays a faithful capture of the page DOM used for conversion.

## Output Directory

Default: `url-to-markdown/<domain>/<slug>.md`
With `--output-dir ./posts/`: `./posts/<domain>/<slug>.md`

HTML snapshot path uses the same basename:

- `url-to-markdown/<domain>/<slug>-captured.html`
- `./posts/<domain>/<slug>-captured.html`

- `<slug>`: From page title or URL path (kebab-case, 2-6 words)
- Conflict resolution: Append timestamp `<slug>-YYYYMMDD-HHMMSS.md`

When `--download-media` is enabled:
- Images are saved to `imgs/` next to the markdown file
- Videos are saved to `videos/` next to the markdown file
- Markdown media links are rewritten to local relative paths

## Conversion Fallback

Conversion order:

1. Try Defuddle first
2. If Defuddle throws, cannot load, returns obviously incomplete markdown, or captures lower-quality content than the legacy pipeline, automatically fall back to the pre-Defuddle extractor
3. The fallback path uses the older Readability/selector/Next.js-data based HTML-to-Markdown implementation recovered from git history

CLI output will show:

- `Converter: defuddle` when Defuddle succeeds
- `Converter: legacy:...` plus `Fallback used: ...` when fallback was needed

## Media Download Workflow

Based on `download_media` setting in EXTEND.md:

| Setting | Behavior |
|---------|----------|
| `1` (always) | Run script with `--download-media` flag |
| `0` (never) | Run script without `--download-media` flag |
| `ask` (default) | Follow the ask-each-time flow below |

### Ask-Each-Time Flow

1. Run script **without** `--download-media` → markdown saved
2. Check saved markdown for remote media URLs (`https://` in image/video links)
3. **If no remote media found** → done, no prompt needed
4. **If remote media found** → use `AskUserQuestion`:
   - header: "Media", question: "Download N images/videos to local files?"
   - "Yes" — Download to local directories
   - "No" — Keep remote URLs
5. If user confirms → run script **again** with `--download-media` (overwrites markdown with localized links)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `URL_CHROME_PATH` | Custom Chrome executable path |
| `URL_DATA_DIR` | Custom data directory |
| `URL_CHROME_PROFILE_DIR` | Custom Chrome profile directory |

**Troubleshooting**: Chrome not found → set `URL_CHROME_PATH`. Timeout → increase `--timeout`. Complex pages → try `--wait` mode. If markdown quality is poor, inspect the saved `-captured.html` and check whether the run logged a legacy fallback.

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
