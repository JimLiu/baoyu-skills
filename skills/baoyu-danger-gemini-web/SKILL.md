---
name: baoyu-danger-gemini-web
description: Generates images and text via reverse-engineered Gemini Web API. Supports text generation, image generation from prompts, reference images for vision input, and multi-turn conversations. Use when other skills need image generation backend, or when user requests "generate image with Gemini", "Gemini text generation", or needs vision-capable AI generation.
version: 1.56.2
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-danger-gemini-web
    requires:
      anyBins:
        - bun
        - npx
---

# Gemini Web Client

## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete `AskUserQuestion` references below are examples — substitute the local equivalent in other runtimes.

## Script Directory

`{baseDir}` = this SKILL.md's directory; scripts are at `{baseDir}/scripts/<script-name>.ts`. Resolve `${BUN_X}`: `bun` if installed; else `npx -y bun`; else suggest installing bun. Replace `{baseDir}` and `${BUN_X}` with actual values.

| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | CLI entry point for text/image generation |
| `scripts/gemini-webapi/*` | TypeScript port of `gemini_webapi` (GeminiClient, types, utils) |

## Consent Check (REQUIRED)

Before first use, verify user consent for reverse-engineered API usage. Consent file:
- macOS: `~/Library/Application Support/baoyu-skills/gemini-web/consent.json`
- Linux: `~/.local/share/baoyu-skills/gemini-web/consent.json`
- Windows: `%APPDATA%\baoyu-skills\gemini-web\consent.json`

1. Check if consent file exists with `accepted: true` and `disclaimerVersion: "1.0"`
2. If valid consent exists → print warning with `acceptedAt` date, proceed
3. If no consent → show disclaimer, ask user via `AskUserQuestion`:
   - "Yes, I accept" → create consent file with ISO timestamp, proceed
   - "No, I decline" → output decline message, stop
4. Consent file format: `{"version":1,"accepted":true,"acceptedAt":"<ISO>","disclaimerVersion":"1.0"}`

## Preferences (EXTEND.md)

First found wins:

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-danger-gemini-web/EXTEND.md` | Project |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-danger-gemini-web/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-danger-gemini-web/EXTEND.md` | User home |

If none found, use defaults. **EXTEND.md supports**: default model, proxy settings, custom data directory.

## Usage

```bash
${BUN_X} {baseDir}/scripts/main.ts "Your prompt"                                     # text
${BUN_X} {baseDir}/scripts/main.ts --prompt "Your prompt" --model gemini-3-flash
${BUN_X} {baseDir}/scripts/main.ts --prompt "A cute cat" --image cat.png             # image
${BUN_X} {baseDir}/scripts/main.ts --promptfiles system.md content.md --image out.png
${BUN_X} {baseDir}/scripts/main.ts --prompt "Describe this" --reference image.png    # vision input
${BUN_X} {baseDir}/scripts/main.ts --prompt "Create variation" --reference a.png --image out.png
${BUN_X} {baseDir}/scripts/main.ts "Remember: 42" --sessionId session-abc           # multi-turn
${BUN_X} {baseDir}/scripts/main.ts "What number?" --sessionId session-abc
${BUN_X} {baseDir}/scripts/main.ts "Hello" --json
```

## Options

| Option | Description |
|--------|-------------|
| `--prompt`, `-p` | Prompt text |
| `--promptfiles` | Read prompt from files (concatenated) |
| `--model`, `-m` | Model (see Models; default `gemini-3-pro`) |
| `--image [path]` | Generate image (default: generated.png) |
| `--reference`, `--ref` | Reference images for vision input |
| `--sessionId` | Session ID for multi-turn conversation |
| `--list-sessions` | List saved sessions |
| `--json` | Output as JSON |
| `--login` | Refresh cookies, then exit |
| `--cookie-path` | Custom cookie file path |
| `--profile-dir` | Chrome profile directory |

## Models

| Model | Description |
|-------|-------------|
| `gemini-3-pro` | Default, latest 3.0 Pro |
| `gemini-3-flash` | Fast, lightweight 3.0 Flash |
| `gemini-3-flash-thinking` | 3.0 Flash with thinking |
| `gemini-3.1-pro-preview` | 3.1 Pro preview (empty header, auto-routed) |

## Authentication

First run opens a browser for Google auth; cookies are cached. Force refresh: `--login`. Override browser: `GEMINI_WEB_CHROME_PATH`. Auto-detected browsers: Chrome, Chrome Canary/Beta, Chromium, Edge.

Without an explicit profile dir, cookie refresh may reuse an already-running local Chrome/Chromium debugging session tied to a standard user-data dir (best-effort CDP reuse, not Chrome DevTools MCP's `--autoConnect` flow). Set `--profile-dir` or `GEMINI_WEB_CHROME_PROFILE_DIR` to force a dedicated profile and skip that reuse.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_WEB_DATA_DIR` | Data directory |
| `GEMINI_WEB_COOKIE_PATH` | Cookie file path |
| `GEMINI_WEB_CHROME_PROFILE_DIR` | Chrome profile directory |
| `GEMINI_WEB_CHROME_PATH` | Chrome executable path |
| `HTTP_PROXY`, `HTTPS_PROXY` | Proxy for Google access (set inline with command) |

## Sessions

Stored in the data directory as `sessions/<id>.json`, containing `id`, `metadata` (Gemini chat state), `messages` array, timestamps.

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
