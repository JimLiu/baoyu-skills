# API Credential Setup

Run when `WECHAT_APP_ID` / `WECHAT_APP_SECRET` are missing (Step 2).

## Detection

Order:

1. Env vars `WECHAT_APP_ID` / `WECHAT_APP_SECRET`
2. `<cwd>/.baoyu-skills/.env` with `WECHAT_APP_ID=...`
3. `$HOME/.baoyu-skills/.env` with `WECHAT_APP_ID=...`

## Guided Setup

Show the user and ask where to save:

```
WeChat API credentials not found.

To obtain credentials:
1. Visit https://mp.weixin.qq.com
2. Go to: 开发 → 基本配置
3. Copy AppID and AppSecret

Where to save?
A) Project-level: .baoyu-skills/.env (this project only)
B) User-level: ~/.baoyu-skills/.env (all projects)
```

Then collect the values (per User Input Tools in SKILL.md) and append:

```
WECHAT_APP_ID=<user_input>
WECHAT_APP_SECRET=<user_input>
```

## Multi-Account Variant

With an `accounts:` block in EXTEND.md, use prefixed keys — see `multi-account.md` → "Credential Resolution".
