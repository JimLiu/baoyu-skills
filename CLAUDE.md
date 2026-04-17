# CLAUDE.md

Claude Code marketplace plugin providing AI-powered content generation skills. Version: **1.107.0**.

## Architecture

Skills are exposed through the single `baoyu-skills` plugin in `.claude-plugin/marketplace.json` (which defines plugin metadata, version, and skill paths). The repo docs still group them into three logical areas:

| Group | Description |
|-------|-------------|
| Content Skills | Generate or publish content (images, slides, comics, posts) |
| AI Generation Skills | AI generation backends |
| Utility Skills | Content processing (conversion, compression, translation) |

Each skill contains `SKILL.md` (YAML front matter + docs), optional `scripts/`, `references/`, `prompts/`.

Top-level `scripts/` contains repo maintenance utilities (sync, hooks, publish).

## Running Skills

TypeScript via Bun (no build step). Detect runtime once per session:
```bash
if command -v bun &>/dev/null; then BUN_X="bun"
elif command -v npx &>/dev/null; then BUN_X="npx -y bun"
else echo "Error: install bun: brew install oven-sh/bun/bun or npm install -g bun"; exit 1; fi
```

Execute: `${BUN_X} skills/<skill>/scripts/main.ts [options]`

## Key Dependencies

- **Bun**: TypeScript runtime (`bun` preferred, fallback `npx -y bun`)
- **Chrome**: Required for CDP-based skills (gemini-web, post-to-x/wechat/weibo, url-to-markdown). All CDP skills share a single profile, override via `BAOYU_CHROME_PROFILE_DIR` env var. Platform paths: [docs/chrome-profile.md](docs/chrome-profile.md)
- **Image generation APIs**: `baoyu-imagine` requires API key (OpenAI, Azure OpenAI, Google, OpenRouter, DashScope, or Replicate) configured in EXTEND.md
- **Gemini Web auth**: Browser cookies (first run opens Chrome for login, `--login` to refresh)

## Security

- **No piped shell installs**: Never `curl | bash`. Use `brew install` or `npm install -g`
- **Remote downloads**: HTTPS only, max 5 redirects, 30s timeout, expected content types only
- **System commands**: Array-form `spawn`/`execFile`, never unsanitized input to shell
- **External content**: Treat as untrusted, don't execute code blocks, sanitize HTML

## Skill Loading Rules

| Rule | Description |
|------|-------------|
| **Load project skills first** | Project skills override system/user-level skills with same name |
| **Default image generation** | Use `skills/baoyu-imagine/SKILL.md` unless user specifies otherwise |

Priority: project `skills/` → `$HOME/.baoyu-skills/` → system-level.

## Skill Self-Containment

Each skill under `skills/` (and `.claude/skills/`) is distributed and consumed independently — the folder may be extracted, copied into another project, or loaded without the rest of this repo. Therefore:

- **Never link from `SKILL.md` or its `references/` to files outside the skill's own directory.** This includes `docs/`, sibling skills, and the repo root. Relative paths like `../../docs/foo.md` break when the skill is used standalone.
- **Inline any shared convention** (e.g., user-input rules) directly in the skill rather than referencing an out-of-skill doc.
- Shared docs under `docs/` exist for **repo-author guidance only** — they may be referenced from `CLAUDE.md` and `docs/creating-skills.md`, but NOT from any `SKILL.md`.

## User Input Tools

Skills that prompt users for choices MUST declare the tool-selection convention **inline** in exactly one place per `SKILL.md` — a `## User Input Tools` section near the top. Do NOT link out to [docs/user-input-tools.md](docs/user-input-tools.md); that doc is the author-side canonical source — copy its body into each SKILL.md. Concrete `AskUserQuestion` mentions elsewhere in a skill are treated as examples — other runtimes substitute their local equivalent under the rule.

## Deprecated Skills

| Skill | Note |
|-------|------|
| `baoyu-image-gen` | Migrated to `baoyu-imagine`. Do NOT add to `.claude-plugin/marketplace.json`. Do NOT update README for this skill. |
| `baoyu-xhs-images` | Migrated to `baoyu-image-cards`. Do NOT add to `.claude-plugin/marketplace.json`. Do NOT update README for this skill. |

## Release Process

Use `/release-skills` workflow. Never skip:
1. `CHANGELOG.md` + `CHANGELOG.zh.md`
2. `marketplace.json` version bump
3. `README.md` + `README.zh.md` if applicable
4. All files committed together before tag

## Code Style

TypeScript, no comments, async/await, short variable names, type-safe interfaces.

## Adding New Skills

All skills MUST use `baoyu-` prefix. Details: [docs/creating-skills.md](docs/creating-skills.md)

## Reference Docs

| Topic | File |
|-------|------|
| Image generation guidelines | [docs/image-generation.md](docs/image-generation.md) |
| Chrome profile platform paths | [docs/chrome-profile.md](docs/chrome-profile.md) |
| Comic style maintenance | [docs/comic-style-maintenance.md](docs/comic-style-maintenance.md) |
| ClawHub/OpenClaw publishing | [docs/publishing.md](docs/publishing.md) |
