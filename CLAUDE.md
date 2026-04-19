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
| **Default image generation** | Use whatever image backend is available in the current runtime; if multiple are available, ask the user which to use. See `## Image Generation Tools` below. |

Priority: project `skills/` → `$HOME/.baoyu-skills/` → system-level.

## Skill Self-Containment

Each skill under `skills/` (and `.claude/skills/`) is distributed and consumed independently — the folder may be extracted, copied into another project, or loaded without the rest of this repo. Therefore:

- **Never link from `SKILL.md` or its `references/` to files outside the skill's own directory.** This includes `docs/`, sibling skills, and the repo root. Relative paths like `../../docs/foo.md` break when the skill is used standalone.
- **Inline any shared convention** (e.g., user-input rules, image-generation backend selection) directly in the skill rather than referencing an out-of-skill doc.
- Shared docs under `docs/` exist for **repo-author guidance only** — they may be referenced from `CLAUDE.md` and `docs/creating-skills.md`, but NOT from any `SKILL.md`. This applies to `docs/user-input-tools.md`, `docs/image-generation-tools.md`, `docs/image-generation.md`, and any other `docs/` file.

## User Input Tools

Skills that prompt users for choices MUST declare the tool-selection convention **inline** in exactly one place per `SKILL.md` — a `## User Input Tools` section near the top. Do NOT link out to [docs/user-input-tools.md](docs/user-input-tools.md); that doc is the author-side canonical source — copy its body into each SKILL.md. Concrete `AskUserQuestion` mentions elsewhere in a skill are treated as examples — other runtimes substitute their local equivalent under the rule.

## Image Generation Tools

Skills that render images MUST declare the backend-selection convention **inline** in exactly one place per `SKILL.md` — a `## Image Generation Tools` section near the top (after `## User Input Tools`). Do NOT link out to [docs/image-generation-tools.md](docs/image-generation-tools.md); that doc is the author-side canonical source — copy its body into each SKILL.md. Concrete tool names (`imagegen`, `image_generate`, `baoyu-imagine`) elsewhere in a skill are treated as examples — other runtimes substitute their local equivalent under the rule. The rule is stateless: use whatever backend is available; if multiple, ask the user once; if none, ask how to proceed. Every rendered image's full prompt must be written to a standalone `prompts/NN-*.md` file before any backend is invoked. Backend skills (`baoyu-imagine`, `baoyu-image-gen`, `baoyu-danger-gemini-web`) are exempt — they render directly rather than selecting a backend.

## Deprecated Skills

| Skill | Note |
|-------|------|
| `baoyu-image-gen` | Superseded by `baoyu-imagine`. Not in `.claude-plugin/marketplace.json`. Kept functional — sync any cross-cutting changes with `baoyu-imagine`. |
| `baoyu-xhs-images` | Superseded by `baoyu-image-cards`. Not in `.claude-plugin/marketplace.json`. Kept functional — sync any cross-cutting changes with `baoyu-image-cards`. Do NOT update README for this skill. |

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
| Image generation output guidelines | [docs/image-generation.md](docs/image-generation.md) |
| Image generation backend selection | [docs/image-generation-tools.md](docs/image-generation-tools.md) |
| User input tool convention | [docs/user-input-tools.md](docs/user-input-tools.md) |
| Chrome profile platform paths | [docs/chrome-profile.md](docs/chrome-profile.md) |
| Comic style maintenance | [docs/comic-style-maintenance.md](docs/comic-style-maintenance.md) |
| ClawHub/OpenClaw publishing | [docs/publishing.md](docs/publishing.md) |
