---
name: baoyu-danger-x-to-markdown
description: Converts X (Twitter) tweets and articles to markdown with YAML front matter. Uses reverse-engineered API requiring user consent. Use when user mentions "X to markdown", "tweet to markdown", "save tweet", or provides x.com/twitter.com URLs for conversion.
---

# X to Markdown

Converts X content to markdown:
- Tweets/threads → Markdown with YAML front matter
- X Articles → Full content extraction

## Script Directory

Scripts located in `scripts/` subdirectory.

**Path Resolution**:
1. `SKILL_DIR` = this SKILL.md's directory
2. Script path = `${SKILL_DIR}/scripts/main.ts`

## Consent Requirement

**Before any conversion**, check and obtain consent.

1. Check consent file: `~/Library/Application Support/baoyu-skills/x-to-markdown/consent.json` (macOS) or `~/.local/share/baoyu-skills/x-to-markdown/consent.json` (Linux)
2. If `accepted: true` and `disclaimerVersion: "1.0"` → print warning and proceed
3. If missing or version mismatch → display disclaimer about reverse-engineered API risks, use AskUserQuestion ("Yes, I accept" / "No, I decline")
4. On accept → create consent JSON. On decline → stop.

## Preferences (EXTEND.md)

Check EXTEND.md existence (project-level `.baoyu-skills/baoyu-danger-x-to-markdown/EXTEND.md`, then user-level `$HOME/.baoyu-skills/baoyu-danger-x-to-markdown/EXTEND.md`). If found, read and apply. If not found, run first-time setup (BLOCKING).

### First-Time Setup (BLOCKING)

Use AskUserQuestion with ALL questions in ONE call:
1. **Media** — How to handle images/videos: Ask each time (Recommended) / Always download / Never download
2. **Output** — Default output directory: `x-to-markdown` (Recommended) / custom path
3. **Save** — Where to save preferences: User home (Recommended) / Project only

Full reference: [references/config/first-time-setup.md](references/config/first-time-setup.md)

### Supported Keys

| Key | Default | Description |
|-----|---------|-------------|
| `download_media` | `ask` | `ask` = prompt each time, `1` = always, `0` = never |
| `default_output_dir` | empty | Default output directory (empty = `./x-to-markdown/`) |

**Priority**: CLI arguments > EXTEND.md > Skill defaults

## Usage

```bash
npx -y bun ${SKILL_DIR}/scripts/main.ts <url>
npx -y bun ${SKILL_DIR}/scripts/main.ts <url> -o output.md
npx -y bun ${SKILL_DIR}/scripts/main.ts <url> --download-media
npx -y bun ${SKILL_DIR}/scripts/main.ts <url> --json
```

| Option | Description |
|--------|-------------|
| `<url>` | Tweet or article URL |
| `-o <path>` | Output path |
| `--json` | JSON output |
| `--download-media` | Download image/video assets locally, rewrite links |
| `--login` | Refresh cookies only |

## Supported URLs

- `https://x.com/<user>/status/<id>`
- `https://twitter.com/<user>/status/<id>`
- `https://x.com/i/article/<id>`

## Output

```markdown
---
url: "https://x.com/user/status/123"
author: "Name (@user)"
tweetCount: 3
coverImage: "https://pbs.twimg.com/media/example.jpg"
---

Content...
```

**File structure**: `x-to-markdown/{username}/{tweet-id}.md`

With `--download-media`: images saved to `imgs/`, videos to `videos/`, links rewritten to local paths.

## Media Download Workflow

Based on `download_media` setting: `1` → run with `--download-media`, `0` → run without, `ask` → run without first, then check for remote media URLs in output. If found, use AskUserQuestion to offer download. If confirmed, re-run with `--download-media`.

## Authentication

1. **Environment variables** (preferred): `X_AUTH_TOKEN`, `X_CT0`
2. **Chrome login** (fallback): Auto-opens Chrome, caches cookies locally

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
