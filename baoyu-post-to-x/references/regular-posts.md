# Regular Posts - Detailed Guide

Detailed documentation for posting text and images to X.

## Manual Workflow

If you prefer step-by-step control:

### Step 1: Copy Image to Clipboard

```bash
${BUN_X} ${SKILL_DIR}/scripts/copy-to-clipboard.ts image /path/to/image.png
```

### Step 2: Paste from Clipboard

```bash
# Simple paste to frontmost app
${BUN_X} ${SKILL_DIR}/scripts/paste-from-clipboard.ts

# Paste to Chrome with retries
${BUN_X} ${SKILL_DIR}/scripts/paste-from-clipboard.ts --app "Google Chrome" --retries 5

# Quick paste with shorter delay
${BUN_X} ${SKILL_DIR}/scripts/paste-from-clipboard.ts --delay 200
```

### Step 3: Use Playwright MCP (if Chrome session available)

```bash
# Navigate
mcp__playwright__browser_navigate url="https://x.com/compose/post"

# Get element refs
mcp__playwright__browser_snapshot

# Type text
mcp__playwright__browser_click element="editor" ref="<ref>"
mcp__playwright__browser_type element="editor" ref="<ref>" text="Your content"

# Paste image (after copying to clipboard)
mcp__playwright__browser_press_key key="Meta+v"  # macOS
# or
mcp__playwright__browser_press_key key="Control+v"  # Windows/Linux

# Screenshot to verify
mcp__playwright__browser_take_screenshot filename="preview.png"
```

## Image Support

- Formats: PNG, JPEG, GIF, WebP
- Max 4 images per post
- Images copied to system clipboard, then pasted via keyboard shortcut

## Example Session

```
User: /post-to-x "Hello from Claude!" --image ./screenshot.png

Claude:
1. Runs: ${BUN_X} ${SKILL_DIR}/scripts/x-browser.ts "Hello from Claude!" --image ./screenshot.png
2. Chrome opens with X compose page
3. Text is typed into editor
4. Image is copied to clipboard and pasted
5. Browser stays open 30s for preview
6. Reports: "Post composed. Use --submit to post."
```

## Troubleshooting

- **Chrome not found**: Set `X_BROWSER_CHROME_PATH` environment variable
- **Not logged in**: First run opens Chrome - log in manually, cookies are saved
- **Image paste fails**:
  - Verify clipboard script: `${BUN_X} ${SKILL_DIR}/scripts/copy-to-clipboard.ts image <path>`
  - On macOS, grant "Accessibility" permission to Terminal/iTerm in System Settings > Privacy & Security > Accessibility
  - Keep Chrome window visible and in front during paste operations
- **osascript permission denied**: Grant Terminal accessibility permissions in System Preferences
- **Rate limited**: Wait a few minutes before retrying

## How It Works

The `x-browser.ts` script uses Chrome DevTools Protocol (CDP) to:
1. Launch real Chrome (not Playwright) with `--disable-blink-features=AutomationControlled`
2. Use persistent profile directory for saved login sessions
3. Interact with X via CDP commands (Runtime.evaluate, Input.dispatchKeyEvent)
4. **Paste images using osascript** (macOS): Sends real Cmd+V keystroke to Chrome, bypassing CDP's synthetic events that X can detect

This approach bypasses X's anti-automation detection that blocks Playwright/Puppeteer.

### Image Paste Mechanism (macOS)

CDP's `Input.dispatchKeyEvent` sends "synthetic" keyboard events that websites can detect. X ignores synthetic paste events for security. The solution:

1. Copy image to system clipboard via Swift/AppKit (`copy-to-clipboard.ts`)
2. Bring Chrome to front via `osascript`
3. Send real Cmd+V keystroke via `osascript` and System Events
4. Wait for upload to complete

This requires Terminal to have "Accessibility" permission in System Settings.
