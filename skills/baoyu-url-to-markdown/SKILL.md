---
name: baoyu-url-to-markdown
description: Fetches any URL and converts HTML to clean markdown using Chrome CDP with full JavaScript rendering. Supports auto-capture and wait-for-user modes for login-required pages. Use when user asks to "save webpage", "scrape page", "download page as markdown", "capture website", "web page to markdown", or "convert URL to markdown".
---

# URL to Markdown

Fetches any URL via Chrome CDP and converts HTML to clean markdown.

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.ts`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | CLI entry point for URL fetching |

## Preferences (EXTEND.md)

Check EXTEND.md existence (project-level `.baoyu-skills/baoyu-url-to-markdown/EXTEND.md`, then user-level `$HOME/.baoyu-skills/baoyu-url-to-markdown/EXTEND.md`). If found, read and apply settings. If not found, use defaults.

**Supports**: Default output directory | Default capture mode | Timeout settings

## Features

- Chrome CDP for full JavaScript rendering
- Two capture modes: auto or wait-for-user
- Clean markdown output with metadata
- Handles login-required pages via wait mode

## Usage

```bash
# Auto mode (default) - capture when page loads
npx -y bun ${SKILL_DIR}/scripts/main.ts <url>

# Wait mode - wait for user signal before capture
npx -y bun ${SKILL_DIR}/scripts/main.ts <url> --wait

# Save to specific file
npx -y bun ${SKILL_DIR}/scripts/main.ts <url> -o output.md
```

## Options

| Option | Description |
|--------|-------------|
| `<url>` | URL to fetch |
| `-o <path>` | Output file path (default: auto-generated) |
| `--wait` | Wait for user signal before capturing |
| `--timeout <ms>` | Page load timeout (default: 30000) |

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

YAML front matter with `url`, `title`, `description`, `author`, `published`, `captured_at` fields, followed by converted markdown content.

## Output Directory

```
url-to-markdown/<domain>/<slug>.md
```

- `<slug>`: From page title or URL path (kebab-case, 2-6 words)
- Conflict resolution: Append timestamp `<slug>-YYYYMMDD-HHMMSS.md`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `URL_CHROME_PATH` | Custom Chrome executable path |
| `URL_DATA_DIR` | Custom data directory |
| `URL_CHROME_PROFILE_DIR` | Custom Chrome profile directory |

## Workflow

1. Check EXTEND.md preferences (see Preferences section)
2. Run script with URL and options
3. **Verify output**: Check that output file exists and contains valid markdown with YAML front matter
4. If capture fails or output is empty, retry with `--wait` mode for dynamic content

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Chrome not found | Set `URL_CHROME_PATH` to Chrome executable path |
| Timeout on slow pages | Increase `--timeout` value (e.g., `--timeout 60000`) |
| Dynamic/JS-heavy content | Use `--wait` mode to control capture timing |
| Login-required page | Use `--wait`, log in manually, then signal capture |
| Empty output | Page may need longer load time; try `--wait` or increase `--timeout` |

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
