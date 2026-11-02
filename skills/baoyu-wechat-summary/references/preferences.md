# Preferences — supported keys and first-time setup

Read from SKILL.md `## Preferences (EXTEND.md)`: the key table when parsing or writing EXTEND.md, the setup flow when no EXTEND.md is found.

## Supported keys

EXTEND.md is plain text with `key: value` or `key=value` lines, `#` for comments, case-insensitive keys.

| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `self_wxid` | string | (required) | The owning account's wxid. Messages whose `from_wxid` matches this are attributed to the user. |
| `self_display` | string | (required) | Display name to substitute for the user's own messages in digest text. |
| `default_version` | `normal` / `roast` / `both` | `normal` | Which version(s) to generate when the user doesn't say otherwise. |
| `default_time_range` | string (e.g. `7d`, `24h`, `1d`) | (none) | Default range when the user omits time and there's no incremental anchor. |
| `data_root` | path | `{project_root}/wechat` | Override where digest folders live. |
| `bot_aliases` | comma-separated strings | `bot, 精华bot` | Names that trigger the 「@bot 答疑」 section. A message containing `@<alias>` (case-insensitive) is treated as a question/request aimed at the digest bot. Pick names that do NOT match any real group member or existing bot, to avoid ambiguity. |

A starter template lives at [EXTEND.md.example](../EXTEND.md.example).

## First-Time Setup (BLOCKING)

If no EXTEND.md is found, do NOT silently proceed.

**Step A — Try to auto-discover `self_wxid` and `self_display` first.** Run (in order, stop at the first that succeeds):

```bash
# 1. If wx-cli exposes a whoami, use it
wx whoami --json 2>/dev/null

# 2. Otherwise, find self-sent messages in recent sessions
wx sessions --json --limit 20 2>/dev/null
```

For option 2, scan the sessions for any private/group thread the user has sent into and read one of their own `from_wxid` / `from_nickname` pairs. If you can confidently pre-fill both values, use them as defaults in the question below; otherwise leave the fields blank for the user to fill in.

**Step B — Confirm with one `AskUserQuestion` call (batched), pre-filling whatever auto-discovery found:**

- `self_wxid` (e.g., `wxid_abc123`) — fall-back hint: the user can find it with `wx contacts --query "<own nickname>"`, or by inspecting any of their own sent messages in `wx sessions --json`
- `self_display` (e.g., `宝玉`) — how they want their messages attributed
- `default_version` — pick one of `normal` / `roast` / `both`
- `data_root` — where digest folders live. Default: `{project_root}/wechat`. Enter a custom absolute path (e.g. `~/Documents/wechat-digests`) or leave blank for default.
- Save location — pick one of project / XDG / home

Write EXTEND.md to the chosen path. If the user provided a non-default `data_root`, include it as an uncommented line; otherwise omit it (the default applies automatically). Confirm "Preferences saved to [path]. Edit it any time to change defaults.", then continue with the digest workflow.
