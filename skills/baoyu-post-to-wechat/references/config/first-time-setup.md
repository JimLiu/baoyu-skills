---
name: first-time-setup
description: First-time setup flow for baoyu-post-to-wechat preferences
---

# First-Time Setup

**BLOCKING**: when no EXTEND.md exists, complete this setup before ANY other step — don't ask about content, files, themes or methods, and don't convert or publish. Ask only these questions, save EXTEND.md, then continue.

## Questions

Use the user's language (or saved language preference). Ask ALL questions in ONE AskUserQuestion call:

### Question 1: Default Theme

```yaml
header: "Theme"
question: "Default theme for article conversion?"
options:
  - label: "default (Recommended)"
    description: "Classic layout - centered title with border, white-on-color H2 (default: blue)"
  - label: "grace"
    description: "Elegant - text shadows, rounded cards, refined blockquotes (default: purple)"
  - label: "simple"
    description: "Minimal modern - asymmetric rounded corners, clean whitespace (default: green)"
  - label: "modern"
    description: "Large rounded corners, pill headings, spacious (default: orange)"
```

### Question 2: Default Color

```yaml
header: "Color"
question: "Default color preset? (theme default if not set)"
options:
  - label: "Theme default (Recommended)"
    description: "Use the theme's built-in default color"
  - label: "blue"
    description: "#0F4C81 经典蓝"
  - label: "red"
    description: "#A93226 中国红"
  - label: "green"
    description: "#009874 翡翠绿"
```

"Other" accepts any preset (vermilion, yellow, purple, sky, rose, olive, black, gray, pink, orange) or hex.

### Question 3: Default Publishing Method

```yaml
header: "Method"
question: "Default publishing method?"
options:
  - label: "api (Recommended)"
    description: "Fast, requires API credentials (AppID + AppSecret)"
  - label: "browser"
    description: "Slow, requires Chrome and login session"
  - label: "remote-api"
    description: "Fast, tunnels WeChat API calls through SSH to a server whose IP is on the WeChat allowlist"
```

If `remote-api` is chosen, prompt for `remote_publish_host` and optionally `remote_publish_user`, `remote_publish_identity_file` (or fill in EXTEND.md later).

### Question 4: Default Author

```yaml
header: "Author"
question: "Default author name for articles?"
options:
  - label: "No default"
    description: "Leave empty, specify per article"
```

### Question 5: Open Comments

```yaml
header: "Comments"
question: "Enable comments on articles by default?"
options:
  - label: "Yes (Recommended)"
    description: "Allow readers to comment on articles"
  - label: "No"
    description: "Disable comments by default"
```

### Question 6: Fans-Only Comments

```yaml
header: "Fans only"
question: "Restrict comments to followers only?"
options:
  - label: "No (Recommended)"
    description: "All readers can comment"
  - label: "Yes"
    description: "Only followers can comment"
```

### Question 7: Save Location

```yaml
header: "Save"
question: "Where to save preferences?"
options:
  - label: "Project (Recommended)"
    description: ".baoyu-skills/ (this project only)"
  - label: "User"
    description: "~/.baoyu-skills/ (all projects)"
```

## Save Locations

| Choice | Path | Scope |
|--------|------|-------|
| Project | `.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | Current project |
| User | `~/.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | All projects |

## After Setup

1. Create directory if needed
2. Write EXTEND.md
3. Confirm: "Preferences saved to [path]"
4. Continue to Step 0 (load the saved preferences)

## EXTEND.md Template

### Single Account (Default)

```md
default_theme: [default/grace/simple/modern]
default_color: [preset name, hex, or empty for theme default]
default_publish_method: [api/browser/remote-api]
default_author: [author name or empty]
need_open_comment: [1/0]
only_fans_can_comment: [1/0]
chrome_profile_path:

# Remote API publishing — only fill in if default_publish_method is remote-api
# or you plan to pass --remote on the CLI.
remote_publish_host:
remote_publish_user:
remote_publish_port:
remote_publish_identity_file:
remote_publish_known_hosts_file:
remote_publish_strict_host_key_checking:
remote_publish_connect_timeout:
remote_publish_proxy_jump:
```

Only the typed keys above are honored (no raw `ssh`/`scp` options). SSH key auth only.

### Multi-Account

```md
default_theme: [default/grace/simple/modern]
default_color: [preset name, hex, or empty for theme default]

accounts:
  - name: [display name]
    alias: [short key, e.g. "baoyu"]
    default: true
    default_publish_method: [api/browser/remote-api]
    default_author: [author name]
    need_open_comment: [1/0]
    only_fans_can_comment: [1/0]
    app_id: [WeChat App ID, optional]
    app_secret: [WeChat App Secret, optional]
    # Remote API publishing (optional, per-account override of globals)
    remote_publish_host:
    remote_publish_user:
    remote_publish_identity_file:
  - name: [second account name]
    alias: [short key, e.g. "ai-tools"]
    default_publish_method: [api/browser/remote-api]
    default_author: [author name]
    need_open_comment: [1/0]
    only_fans_can_comment: [1/0]
```

## Later Changes

- Add accounts: add an `accounts:` block, move per-account settings (author, publish method, comments) into entries, keep theme/color global, give each a unique `alias` (used by `--account` and Chrome profile naming), set `default: true` on the primary.
- Edit EXTEND.md directly, or delete it to rerun setup.
