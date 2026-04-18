---
name: baoyu-url-to-markdown
description: Fetch any URL and convert to markdown using baoyu-fetch CLI (Chrome CDP with site-specific adapters). Built-in adapters for X/Twitter, YouTube transcripts, Hacker News threads, and generic pages via Defuddle. Handles login/CAPTCHA via interaction wait modes. Use when user wants to save a webpage as markdown.
version: 1.60.0
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-url-to-markdown
    requires:
      anyBins:
        - bun
        - npx
---

# URL to Markdown

Fetches any URL via `baoyu-fetch` CLI (Chrome CDP + site-specific adapters) and converts it to clean markdown.

## CLI Setup

**Important**: The CLI is provided by the npm package dependency `baoyu-fetch`. Do not use a vendored `scripts/vendor/baoyu-fetch` copy.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `{baseDir}`
2. Resolve `${BUN}` runtime: if `bun` installed → `bun`; else suggest installing Bun
3. If `{baseDir}/scripts/node_modules/.bin/baoyu-fetch` does not exist, run `${BUN} install --cwd {baseDir}/scripts`
4. `${READER}` = `{baseDir}/scripts/node_modules/.bin/baoyu-fetch`
5. Replace all `${READER}` in this document with the resolved value

## Preferences (EXTEND.md)

Check EXTEND.md existence (priority order):

```bash
# macOS, Linux, WSL, Git Bash
test -f .baoyu-skills/baoyu-url-to-markdown/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-url-to-markdown/EXTEND.md" && echo "xdg"
test -f "$HOME/.baoyu-skills/baoyu-url-to-markdown/EXTEND.md" && echo "user"
```

```powershell
# PowerShell (Windows)
if (Test-Path .baoyu-skills/baoyu-url-to-markdown/EXTEND.md) { "project" }
$xdg = if ($env:XDG_CONFIG_HOME) { $env:XDG_CONFIG_HOME } else { "$HOME/.config" }
if (Test-Path "$xdg/baoyu-skills/baoyu-url-to-markdown/EXTEND.md") { "xdg" }
if (Test-Path "$HOME/.baoyu-skills/baoyu-url-to-markdown/EXTEND.md") { "user" }
```

| Path | Location |
|------|----------|
| `.baoyu-skills/baoyu-url-to-markdown/EXTEND.md` | Project directory |
| `$HOME/.baoyu-skills/baoyu-url-to-markdown/EXTEND.md` | User home |

| Result | Action |
|--------|--------|
| Found | Read, parse, apply settings |
| Not found | **MUST** run first-time setup (see below) — do NOT silently create defaults |

**EXTEND.md Supports**: Download media by default | Default output directory

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
| `download_media: 1` | `--download-media` | Requires `--output` to be set |
| `default_output_dir: ./posts/` | Agent constructs `--output ./posts/{domain}/{slug}.md` | Agent generates path, not a direct CLI flag |

**Value priority**:
1. CLI arguments (`--download-media`, `--output`)
2. EXTEND.md
3. Skill defaults

## Features

- Chrome CDP for full JavaScript rendering via `baoyu-fetch` CLI
- Site-specific adapters: X/Twitter, YouTube, Hacker News, generic (Defuddle)
- Automatic adapter selection based on URL, or force with `--adapter`
- Interaction gate detection: Cloudflare, reCAPTCHA, hCAPTCHA, custom challenges
- Two capture modes: headless (default) or interactive with wait-for-interaction
- Clean markdown output with YAML front matter
- Structured JSON output available via `--format json`
- X/Twitter: extracts tweets, threads, and X Articles with media
- YouTube: transcript/caption extraction, chapters, cover images
- Hacker News: threaded comment parsing with proper nesting
- Generic: Defuddle extraction with Readability fallback
- Download images and videos to local directories
- Chrome profile persistence for authenticated sessions
- Debug artifact output for troubleshooting

## Usage

```bash
# Default: headless capture, markdown to stdout
${READER} <url>

# Save to file
${READER} <url> --output article.md

# Save with media download
${READER} <url> --output article.md --download-media

# Headless mode (explicit)
${READER} <url> --headless --output article.md

# Wait for interaction (login/CAPTCHA) — auto-detect and continue
${READER} <url> --wait-for interaction --output article.md

# Wait for interaction — manual control (Enter to continue)
${READER} <url> --wait-for force --output article.md

# JSON output
${READER} <url> --format json --output article.json

# Force specific adapter
${READER} <url> --adapter youtube --output transcript.md

# Connect to existing Chrome
${READER} <url> --cdp-url http://localhost:9222 --output article.md

# Debug artifacts
${READER} <url> --output article.md --debug-dir ./debug/
```

## Options

| Option | Description |
|--------|-------------|
| `<url>` | URL to fetch |
| `--output <path>` | Output file path (default: stdout) |
| `--format <type>` | Output format: `markdown` (default) or `json` |
| `--json` | Shorthand for `--format json` |
| `--adapter <name>` | Force adapter: `x`, `youtube`, `hn`, or `generic` (default: auto-detect) |
| `--headless` | Force headless Chrome (no visible window) |
| `--wait-for <mode>` | Interaction wait mode: `none` (default), `interaction`, or `force` |
| `--wait-for-interaction` | Alias for `--wait-for interaction` |
| `--wait-for-login` | Alias for `--wait-for interaction` |
| `--timeout <ms>` | Page load timeout (default: 30000) |
| `--interaction-timeout <ms>` | Login/CAPTCHA wait timeout (default: 600000 = 10 min) |
| `--interaction-poll-interval <ms>` | Poll interval for interaction checks (default: 1500) |
| `--download-media` | Download images/videos to local `imgs/` and `videos/`, rewrite markdown links. Requires `--output` |
| `--media-dir <dir>` | Base directory for downloaded media (default: same as `--output` directory) |
| `--cdp-url <url>` | Reuse existing Chrome DevTools Protocol endpoint |
| `--browser-path <path>` | Custom Chrome/Chromium binary path |
| `--chrome-profile-dir <path>` | Chrome user data directory (default: `BAOYU_CHROME_PROFILE_DIR` env or `./baoyu-skills/chrome-profile`) |
| `--debug-dir <dir>` | Write debug artifacts (document.json, markdown.md, page.html, network.json) |

## Capture Modes

| Mode | Behavior | Use When |
|------|----------|----------|
| Default | Headless Chrome, auto-extract on network idle | Public pages, static content |
| `--headless` | Explicit headless (same as default) | Clarify intent |
| `--wait-for interaction` | Opens visible Chrome, auto-detects login/CAPTCHA gates, waits for them to clear, then continues | Login-required, CAPTCHA-protected |
| `--wait-for force` | Opens visible Chrome, auto-detects OR accepts Enter keypress to continue | Complex flows, lazy loading, paywalls |

**Interaction gate auto-detection**:
- Cloudflare Turnstile / "just a moment" pages
- Google reCAPTCHA
- hCaptcha
- Custom challenge / verification screens

**Wait-for-interaction workflow**:
1. Run with `--wait-for interaction` → Chrome opens visibly
2. CLI auto-detects login/CAPTCHA gates
3. User completes login or solves CAPTCHA in the browser
4. CLI auto-detects gate cleared → captures page
5. If `--wait-for force` is used, user can also press Enter to trigger capture manually

## Agent Quality Gate

**CRITICAL**: The agent must treat default headless capture as provisional. Some sites render differently in headless mode and can silently return low-quality content without causing the CLI to fail.

After every headless run, the agent **MUST** inspect the saved markdown output.

### Quality checks the agent must perform

1. Confirm the markdown title matches the target page, not a generic site shell
2. Confirm the body contains the expected article or page content, not just navigation, footer, or a generic error
3. Watch for obvious failure signs:
   - `Application error`
   - `This page could not be found`
   - Login, signup, subscribe, or verification shells
   - Extremely short markdown for a page that should be long-form
   - Raw framework payloads or mostly boilerplate content
4. If the result is low quality, incomplete, or clearly wrong, do **not** accept the run as successful just because the CLI exited with code 0

**Tip**: Use `--format json` to get structured output including `status`, `login.state`, and `interaction` fields for programmatic quality assessment. A `"status": "needs_interaction"` response means the page requires manual interaction.

### Recovery workflow the agent must follow

1. First run headless (default) unless there is already a clear reason to use interaction mode
2. Review markdown quality immediately after the run
3. If the content is low quality or indicates login/CAPTCHA:
   - `--wait-for interaction` for auto-detected gates (login, CAPTCHA, Cloudflare)
   - `--wait-for force` when the page needs manual browsing, scroll loading, or complex interaction
4. If `--wait-for` is used, tell the user exactly what to do:
   - If login is required, ask them to sign in in the browser
   - If CAPTCHA appears, ask them to solve it
   - If the page needs time to load, ask them to wait until content is visible
   - For `--wait-for force`: tell them to press Enter when ready
5. If JSON output shows `"status": "needs_interaction"`, switch to `--wait-for interaction` automatically

## Output Path Generation

The agent must construct the output file path since `baoyu-fetch` does not auto-generate paths.

**Algorithm**:
1. Determine base directory from EXTEND.md `default_output_dir` or default `./url-to-markdown/`
2. Extract domain from URL (e.g., `example.com`)
3. Generate slug from URL path or page title (kebab-case, 2-6 words)
4. Construct: `{base_dir}/{domain}/{slug}/{slug}.md` — each URL gets its own directory so media files stay isolated
5. Conflict resolution: append timestamp `{slug}-YYYYMMDD-HHMMSS/{slug}-YYYYMMDD-HHMMSS.md`

Pass the constructed path to `--output`. Media files (`--download-media`) are saved into subdirectories next to the markdown file, keeping each URL's assets self-contained.

## Output Format

Markdown output to stdout (or file with `--output`) as clean markdown text.

JSON output (`--format json`) returns structured data including:
- `adapter` — which adapter handled the URL
- `status` — `"ok"` or `"needs_interaction"`
- `login` — login state detection (`logged_in`, `logged_out`, `unknown`)
- `interaction` — interaction gate details (kind, provider, prompt)
- `document` — structured content (url, title, author, publishedAt, content blocks, metadata)
- `media` — collected media assets with url, kind, role
- `markdown` — converted markdown text
- `downloads` — media download results (when `--download-media` used)

When `--download-media` is enabled:
- Images are saved to `imgs/` next to the output file (or in `--media-dir`)
- Videos are saved to `videos/` next to the output file (or in `--media-dir`)
- Markdown media links are rewritten to local relative paths

## Built-in Adapters

| Adapter | URLs | Key Features |
|---------|------|-------------|
| `x` | x.com, twitter.com | Tweets, threads, X Articles, media, login detection |
| `youtube` | youtube.com, youtu.be | Transcript/captions, chapters, cover image, metadata |
| `hn` | news.ycombinator.com | Threaded comments, story metadata, nested replies |
| `generic` | Any URL (fallback) | Defuddle extraction, Readability fallback, auto-scroll, network idle detection |

Adapter is auto-selected based on URL. Use `--adapter <name>` to override.

## Media Download Workflow

Based on `download_media` setting in EXTEND.md:

| Setting | Behavior |
|---------|----------|
| `1` (always) | Run CLI with `--download-media --output <path>` |
| `0` (never) | Run CLI with `--output <path>` (no media download) |
| `ask` (default) | Follow the ask-each-time flow below |

### Ask-Each-Time Flow

1. Run CLI **without** `--download-media` with `--output <path>` → markdown saved
2. Check saved markdown for remote media URLs (`https://` in image/video links)
3. **If no remote media found** → done, no prompt needed
4. **If remote media found** → use `AskUserQuestion`:
   - header: "Media", question: "Download N images/videos to local files?"
   - "Yes" — Download to local directories
   - "No" — Keep remote URLs
5. If user confirms → run CLI **again** with `--download-media --output <same-path>` (overwrites markdown with localized links)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BAOYU_CHROME_PROFILE_DIR` | Chrome user data directory (can also use `--chrome-profile-dir`) |

**Troubleshooting**: Chrome not found → use `--browser-path`. Timeout → increase `--timeout`. Login/CAPTCHA pages → use `--wait-for interaction`. Debug → use `--debug-dir` to inspect captured HTML and network logs.

### YouTube Notes

- YouTube adapter extracts transcripts/captions automatically when available
- Transcript format: `[MM:SS] Text segment` with chapter headings
- Transcript availability depends on YouTube exposing a caption track. Videos with captions disabled or restricted playback may produce description-only output
- Use `--wait-for force` if the page needs time to finish loading player metadata

### X/Twitter Notes

- Extracts single tweets, threads, and X Articles
- Auto-detects login state; if logged out and content requires auth, JSON output will show `"status": "needs_interaction"`
- Use `--wait-for interaction` for login-protected content

### Hacker News Notes

- Parses threaded comments with proper nesting and reply hierarchy
- Includes story metadata (title, URL, author, score, comment count)
- Shows comment deletion/dead status

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
