---
name: baoyu-danger-x-to-markdown
description: Converts X (Twitter) tweets and articles to markdown with YAML front matter. Uses reverse-engineered API requiring user consent. Use when user mentions "X to markdown", "tweet to markdown", "save tweet", or provides x.com/twitter.com URLs for conversion.
version: 1.117.3
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-danger-x-to-markdown
    requires:
      anyBins:
        - bun
        - npx
---

# X to Markdown

Tweets/threads → markdown with YAML front matter; X Articles → full content.

## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete `AskUserQuestion` references below are examples — substitute the local equivalent in other runtimes.

## Script Directory

1. `{baseDir}` = this SKILL.md's directory; script = `{baseDir}/scripts/main.ts`
2. `${BUN_X}` = `bun` if installed; else `npx -y bun` if `npx` available; else suggest installing bun

## Consent Requirement (before any conversion)

1. Read the consent file:
   - macOS: `~/Library/Application\ Support/baoyu-skills/x-to-markdown/consent.json`
   - Linux: `~/.local/share/baoyu-skills/x-to-markdown/consent.json`
2. `accepted: true` and `disclaimerVersion: "1.0"` → print `Warning: Using reverse-engineered X API. Accepted on: <acceptedAt>` and proceed.
3. Missing or version mismatch → show this disclaimer and ask "Yes, I accept" | "No, I decline":
   ```
   DISCLAIMER

   This tool uses a reverse-engineered X API, NOT official.

   Risks:
   - May break if X changes API
   - No guarantees or support
   - Possible account restrictions
   - Use at your own risk

   Accept terms and continue?
   ```
4. Accept → write the consent file:
   ```json
   {
     "version": 1,
     "accepted": true,
     "acceptedAt": "<ISO timestamp>",
     "disclaimerVersion": "1.0"
   }
   ```
5. Decline → output "User declined. Exiting." and stop.

## Preferences (EXTEND.md)

First one found wins:

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-danger-x-to-markdown/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-danger-x-to-markdown/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-danger-x-to-markdown/EXTEND.md` | User home |

Found → read and apply. Not found → **BLOCKING** first-time setup: ask the questions in [references/config/first-time-setup.md](references/config/first-time-setup.md) (Media, Output, Save — all in one call) before any conversion, write EXTEND.md at the chosen location, confirm "Preferences saved to [path]", then continue. Never create EXTEND.md with defaults without asking.

| Key | Default | Values |
|-----|---------|--------|
| `download_media` | `ask` | `ask` (prompt each time) / `1` (always) / `0` (never) |
| `default_output_dir` | empty (= `./x-to-markdown/`) | path or empty |

Value priority: CLI arguments (`--download-media`, `-o`) → EXTEND.md → skill defaults.

## Usage

```bash
${BUN_X} {baseDir}/scripts/main.ts <url>
${BUN_X} {baseDir}/scripts/main.ts <url> -o output.md
${BUN_X} {baseDir}/scripts/main.ts <url> --download-media
${BUN_X} {baseDir}/scripts/main.ts <url> --json
```

| Option | Description |
|--------|-------------|
| `<url>` | Tweet or article URL |
| `-o <path>` | Output path |
| `--json` | JSON output |
| `--download-media` | Download images/videos to local `imgs/` and `videos/` next to the markdown, rewrite links to local relative paths |
| `--login` | Refresh cookies only |

Supported URLs: `https://x.com/<user>/status/<id>`, `https://twitter.com/<user>/status/<id>`, `https://x.com/i/article/<id>`

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

File structure: `x-to-markdown/{username}/{tweet-id}/{content-slug}.md`

## Media Download

By EXTEND.md `download_media`: `1` → run with `--download-media`; `0` → run without; `ask` (default):

1. Run **without** `--download-media` → markdown saved
2. Check it for remote media (`https://` image/video links); none → done, no prompt
3. Otherwise ask (header "Media", question "Download N images/videos to local files?"): "Yes" — download to local directories / "No" — keep remote URLs
4. Yes → rerun **with** `--download-media` (overwrites markdown with localized links)

## Authentication

1. Environment variables (preferred): `X_AUTH_TOKEN`, `X_CT0`
2. Chrome login (fallback): auto-opens Chrome, caches cookies locally

## Extension Support

Custom configurations via EXTEND.md — see **Preferences** above.
