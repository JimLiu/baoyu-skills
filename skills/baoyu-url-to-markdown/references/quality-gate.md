# Quality Gate & Recovery

Headless Chrome can return layout shells, login walls, or framework payloads with exit code `0`.

## Checks (after every headless run)

1. Title matches the target page, not a generic site shell
2. Body has the expected content, not just navigation, footer, or a generic error
3. Failure signs:
   - `Application error`
   - `This page could not be found`
   - Login, signup, subscribe, or verification shells
   - Extremely short markdown for a page that should be long-form
   - Raw framework payloads or mostly boilerplate content
4. Exit `0` alone is not success

`--format json` exposes `status`, `login.state`, `interaction`; `"status": "needs_interaction"` means manual interaction is required.

## Recovery Workflow

1. Start headless (default) unless there's a clear reason for interaction mode
2. Review quality right after the run
3. Low quality or login/CAPTCHA:
   - `--wait-for interaction` for auto-detected gates (login, CAPTCHA, Cloudflare)
   - `--wait-for force` when the page needs manual browsing, scroll loading, or complex interaction
4. With `--wait-for`, tell the user exactly what to do:
   - Login required → sign in in the browser
   - CAPTCHA visible → solve it
   - Slow loading → wait until content is visible
   - `--wait-for force` → press Enter when ready
5. JSON `"status": "needs_interaction"` → switch to `--wait-for interaction` automatically

## Capture Modes

| Mode | Behavior | Use When |
|------|----------|----------|
| Default | Headless Chrome, auto-extract on network idle | Public pages, static content |
| `--headless` | Explicit headless (same as default) | Clarify intent |
| `--wait-for interaction` | Opens visible Chrome, auto-detects login/CAPTCHA gates, waits for them to clear, then continues | Login-required, CAPTCHA-protected |
| `--wait-for force` | Opens visible Chrome, auto-detects OR accepts Enter keypress to continue | Complex flows, lazy loading, paywalls |

**Interaction gate auto-detection**: Cloudflare Turnstile / "just a moment" pages, Google reCAPTCHA, hCaptcha, custom challenge / verification screens.
