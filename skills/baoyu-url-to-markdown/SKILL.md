---
name: baoyu-url-to-markdown
description: Fetch any URL and convert to markdown using baoyu-fetch CLI (Chrome CDP with site-specific adapters). Built-in adapters for X/Twitter, YouTube transcripts, Hacker News threads, and generic pages via Defuddle. Handles login/CAPTCHA via interaction wait modes. Use when user wants to save a webpage as markdown.
version: 1.61.0
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-url-to-markdown
    requires:
      anyBins:
        - bun
---

# URL to Markdown

## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete `AskUserQuestion` references below are examples — substitute the local equivalent in other runtimes.

## CLI Setup

The CLI source is vendored in `{baseDir}/scripts/lib`; `scripts/package.json` installs only third-party runtime dependencies.

1. `{baseDir}` = this SKILL.md's directory
2. `${BUN}` = `bun` if installed; otherwise suggest installing Bun
3. If `{baseDir}/scripts/node_modules` is missing: `${BUN} install --cwd {baseDir}/scripts`
4. `${READER}` = `{baseDir}/scripts/baoyu-fetch` (substitute everywhere below)

## Preferences (EXTEND.md)

First one found wins:

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-url-to-markdown/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-url-to-markdown/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-url-to-markdown/EXTEND.md` | User home |

Found → read and apply. Not found → **BLOCKING** first-time setup: ask the questions in [references/config/first-time-setup.md](references/config/first-time-setup.md) (Media, Output, Save — all in one call) before any conversion, write EXTEND.md, confirm "Preferences saved to [path]", then continue. Never create EXTEND.md with silent defaults.

| Key | Default | Values | CLI mapping |
|-----|---------|--------|-------------|
| `download_media` | `ask` | `ask` (prompt each time) / `1` (always) / `0` (never) | `1` → `--download-media` (requires `--output`) |
| `default_output_dir` | empty (= `./url-to-markdown/`) | path or empty | Agent builds `--output <dir>/{domain}/{slug}.md`; not a direct flag |

Value priority: CLI arguments → EXTEND.md → skill defaults.

## Usage

```bash
${READER} <url>                                          # headless, markdown to stdout
${READER} <url> --output article.md --download-media     # save with local media
${READER} <url> --wait-for interaction --output a.md     # login/CAPTCHA: auto-detect and continue
${READER} <url> --wait-for force --output a.md           # manual: Enter to continue
${READER} <url> --format json --output a.json
${READER} <url> --adapter youtube --output transcript.md
```

## Options

| Option | Description |
|--------|-------------|
| `<url>` | URL to fetch |
| `--output <path>` | Output file path (default: stdout) |
| `--format <type>` | `markdown` (default) or `json` |
| `--json` | Shorthand for `--format json` |
| `--adapter <name>` | Force adapter: `x`, `youtube`, `hn`, or `generic` (default: auto-detect) |
| `--headless` | Force headless Chrome |
| `--wait-for <mode>` | `none` (default), `interaction`, or `force` |
| `--wait-for-interaction` | Alias for `--wait-for interaction` |
| `--wait-for-login` | Alias for `--wait-for interaction` |
| `--timeout <ms>` | Page load timeout (default: 30000) |
| `--interaction-timeout <ms>` | Login/CAPTCHA wait timeout (default: 600000 = 10 min) |
| `--interaction-poll-interval <ms>` | Interaction poll interval (default: 1500) |
| `--download-media` | Download images/videos to local `imgs/` and `videos/`, rewrite links. Requires `--output` |
| `--media-dir <dir>` | Base directory for downloaded media (default: `--output` directory) |
| `--cdp-url <url>` | Reuse existing Chrome DevTools Protocol endpoint |
| `--browser-path <path>` | Custom Chrome/Chromium binary path |
| `--chrome-profile-dir <path>` | Chrome user data directory (default: `BAOYU_CHROME_PROFILE_DIR` env or `./baoyu-skills/chrome-profile`) |
| `--debug-dir <dir>` | Write debug artifacts (document.json, markdown.md, page.html, network.json) |

## Quality Gate

Headless capture is provisional: some sites silently return low-quality content with exit code `0`. Inspect the saved markdown after every headless run, using [references/quality-gate.md](references/quality-gate.md) for the checklist, recovery steps, and capture modes.

## Output Path

`baoyu-fetch` does not generate paths; the agent builds one and passes it to `--output`:

1. Base dir: EXTEND.md `default_output_dir` or `./url-to-markdown/`
2. Domain from URL (e.g., `example.com`)
3. Slug from URL path or page title (kebab-case, 2-6 words)
4. Path: `{base_dir}/{domain}/{slug}/{slug}.md` — one directory per URL so media stays isolated
5. On conflict: `{slug}-YYYYMMDD-HHMMSS/{slug}-YYYYMMDD-HHMMSS.md`

Downloaded media goes into subdirectories next to the markdown file.

## Adapters & Media

[references/adapters.md](references/adapters.md): adapter catalog (X, YouTube, Hacker News, generic), media download flow (`ask` / always / never), JSON output schema. Read it for adapter-specific questions or media prompts.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BAOYU_CHROME_PROFILE_DIR` | Chrome user data directory (or `--chrome-profile-dir`) |

**Troubleshooting**: Chrome not found → `--browser-path`. Timeout → raise `--timeout`. Login/CAPTCHA → `--wait-for interaction`. Debug → `--debug-dir` to inspect captured HTML and network logs.

## Extension Support

Custom configurations via EXTEND.md — see **Preferences** above.
