# Regular Posts - Detailed Guide

The Computer Use flow for regular posts is in SKILL.md ("Chrome Computer Use Mode").

## Detecting Chrome Computer Use (Codex)

1. If Computer Use tools are visible, call `get_app_state` for `Google Chrome`.
2. If not, `tool_search` for `computer-use get_app_state click press_key drag scroll Google Chrome`, then call `get_app_state`.
3. If it succeeds, use the user's real Chrome with Computer Use for all X UI actions; use CDP scripts only when Computer Use is unavailable or explicitly requested.

If the user explicitly asks for Chrome Computer Use, do not use Playwright, the in-app Browser, or CDP without approval.

## Manual Clipboard Steps

```bash
# Copy image to clipboard
${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts image /path/to/image.png

# Paste to frontmost app
${BUN_X} {baseDir}/scripts/paste-from-clipboard.ts

# Paste to Chrome with retries
${BUN_X} {baseDir}/scripts/paste-from-clipboard.ts --app "Google Chrome" --retries 5

# Quick paste with shorter delay
${BUN_X} {baseDir}/scripts/paste-from-clipboard.ts --delay 200
```

## Image Support

PNG, JPEG, GIF, WebP; max 4 images per post. Images are copied to the system clipboard, then pasted via keyboard shortcut.

## Troubleshooting

- **Chrome not found**: Set `X_BROWSER_CHROME_PATH` environment variable
- **Not logged in**: First run opens Chrome - log in manually, cookies are saved
- **Image paste fails**:
  - Verify clipboard script: `${BUN_X} {baseDir}/scripts/copy-to-clipboard.ts image <path>`
  - On macOS, grant "Accessibility" permission to Terminal/iTerm in System Settings > Privacy & Security > Accessibility
  - Keep Chrome window visible and in front during paste operations
- **osascript permission denied**: Grant Terminal accessibility permissions in System Preferences
- **Rate limited**: Wait a few minutes before retrying

## How the CDP Fallback Works (`x-browser.ts`)

1. Launches real Chrome (not Playwright) with `--disable-blink-features=AutomationControlled` — X blocks Playwright/Puppeteer
2. Persistent profile directory keeps the login
3. Interacts via CDP (`Runtime.evaluate`, `Input.dispatchKeyEvent`)
4. Pastes images with a real keystroke, because X ignores CDP's synthetic paste events (macOS):
   1. Copy image to system clipboard via Swift/AppKit (`copy-to-clipboard.ts`)
   2. Bring Chrome to front via `osascript`
   3. Send real Cmd+V via `osascript` and System Events
   4. Wait for upload to complete

This requires Terminal to have "Accessibility" permission in System Settings.
