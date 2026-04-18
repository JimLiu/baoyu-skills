# ClawHub / OpenClaw Publishing

## OpenClaw Metadata

Skills include `metadata.openclaw` in YAML front matter:

```yaml
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#<skill-name>
    requires:          # only for skills with scripts
      anyBins:
        - bun
        - npx
```

## Publishing Commands

```bash
bash scripts/sync-clawhub.sh           # sync all skills
bash scripts/sync-clawhub.sh <skill>   # sync one skill
```

Release hooks are configured via `.releaserc.yml`. This repo does not stage a separate release directory: release prep verifies that skills depend on published npm package versions, and publish reads the skill directory directly.

## Shared Workspace Packages

`packages/` is the **only** source of truth for shared runtime code. Publish shared packages to npm and reference them from skill script `package.json` files with semver ranges. Do not vendor shared packages into `skills/*/scripts/vendor/`.

Current packages:
- `baoyu-chrome-cdp` (Chrome CDP utilities), consumed by 5 skills (`baoyu-danger-gemini-web`, `baoyu-danger-x-to-markdown`, `baoyu-post-to-wechat`, `baoyu-post-to-weibo`, `baoyu-post-to-x`)
- `baoyu-md` (shared Markdown rendering and placeholder pipeline), consumed by 3 skills (`baoyu-markdown-to-html`, `baoyu-post-to-wechat`, `baoyu-post-to-weibo`)
- `baoyu-fetch` (URL-to-Markdown CLI), consumed by 1 skill (`baoyu-url-to-markdown`)

**How it works**: npm packages are built from `packages/` and published to the public npm registry. Skills depend on those packages with `^<version>` specs. Release prep runs `node scripts/verify-shared-package-deps.mjs` so `file:` dependencies and vendored workspace packages cannot slip back in.

**Update workflow**:
1. Edit package under `packages/`
2. Run the package build, e.g. `bun run --cwd packages/baoyu-md build`
3. Publish the changed npm package with `npm publish --access public`
4. Update consuming skill `package.json` semver ranges if the package version changed
5. Run `node scripts/verify-shared-package-deps.mjs`

**Git hook**: Run `node scripts/install-git-hooks.mjs` once to enable the `pre-push` hook. It blocks pushes when a skill uses a local `file:` dependency or a vendored workspace package.
