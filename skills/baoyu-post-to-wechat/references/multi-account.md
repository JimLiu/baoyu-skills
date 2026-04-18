# Multi-Account Support

Details for managing multiple WeChat Official Accounts through one EXTEND.md. SKILL.md only covers single-account flow and the selection prompt — read this file when the user has an `accounts:` block, asks to publish to a specific account, or needs per-account credentials.

## Compatibility

| Condition | Mode | Behavior |
|-----------|------|----------|
| No `accounts` block | Single-account | Original behavior, no changes |
| `accounts` with 1 entry | Single-account | Auto-select, no prompt |
| `accounts` with 2+ entries | Multi-account | Prompt to select before publishing |
| `accounts` with `default: true` | Multi-account | Pre-select default; user can switch |

## EXTEND.md Example

```md
default_theme: default
default_color: blue

accounts:
  - name: 宝玉的技术分享
    alias: baoyu
    default: true
    default_publish_method: api
    default_author: 宝玉
    need_open_comment: 1
    only_fans_can_comment: 0
    app_id: your_wechat_app_id
    app_secret: your_wechat_app_secret
  - name: AI工具集
    alias: ai-tools
    default_publish_method: browser
    default_author: AI工具集
    need_open_comment: 1
    only_fans_can_comment: 0
```

## Per-Account vs Global Keys

**Per-account** (also accepted globally as fallback): `default_publish_method`, `default_author`, `need_open_comment`, `only_fans_can_comment`, `app_id`, `app_secret`, `chrome_profile_path`.

**Global-only** (always shared): `default_theme`, `default_color`.

## Account Selection (Step 0.5)

Insert between Step 0 (Load EXTEND.md) and Step 1 (Determine input type):

```
if no accounts block:
    → single-account mode (original behavior)
elif accounts.length == 1:
    → auto-select the only account
elif --account <alias> CLI arg:
    → select matching account
elif one account has default: true:
    → pre-select, display: "Using account: <name> (--account to switch)"
else:
    → prompt user to choose from the list
```

## Credential Resolution (API Method)

For the selected account with alias `{alias}`, try in this order (first hit wins):

1. `app_id` / `app_secret` inline in the EXTEND.md account block
2. Env vars `WECHAT_{ALIAS}_APP_ID` / `WECHAT_{ALIAS}_APP_SECRET` (alias uppercased, hyphens → underscores)
3. `.baoyu-skills/.env` with the prefixed key `WECHAT_{ALIAS}_APP_ID`
4. `~/.baoyu-skills/.env` with the prefixed key
5. Fallback to unprefixed `WECHAT_APP_ID` / `WECHAT_APP_SECRET`

### .env Multi-Account Example

```bash
# Account: baoyu
WECHAT_BAOYU_APP_ID=your_wechat_app_id
WECHAT_BAOYU_APP_SECRET=your_wechat_app_secret

# Account: ai-tools
WECHAT_AI_TOOLS_APP_ID=your_ai_tools_wechat_app_id
WECHAT_AI_TOOLS_APP_SECRET=your_ai_tools_wechat_app_secret
```

## Chrome Profile (Browser Method)

Each account uses an isolated Chrome profile so logins don't collide.

| Source | Path |
|--------|------|
| Account `chrome_profile_path` in EXTEND.md | Use as-is |
| Auto-generated from alias | `{shared_profile_parent}/wechat-{alias}/` |
| Single-account fallback | Shared default profile |

## CLI `--account` Flag

All publishing scripts accept `--account <alias>`:

```bash
${BUN_X} {baseDir}/scripts/wechat-api.ts <file> --theme default --account ai-tools
${BUN_X} {baseDir}/scripts/wechat-article.ts --markdown <file> --theme default --account baoyu
${BUN_X} {baseDir}/scripts/wechat-browser.ts --markdown <file> --images ./photos/ --account baoyu
```
