# Testing Strategy

This repository has many scripts, but they do not share a single runtime or dependency graph. The lowest-risk testing strategy is to start from stable Node-based library code, then expand outward to CLI and skill-specific smoke tests.

## Current Baseline

- Root test runner: `node:test`
- Entry point: `npm test`
- Coverage command: `npm run test:coverage`
- CI trigger: GitHub Actions on `push`, `pull_request`, and manual dispatch

This avoids introducing Jest/Vitest across a repo that already mixes plain Node scripts, Bun-based skill packages, npm-published shared packages, and browser automation.

## Rollout Plan

### Phase 1: Stable library coverage

Focus on pure functions under `scripts/lib/` first.

- `scripts/lib/release-files.mjs`
- `scripts/verify-shared-package-deps.mjs`

Goals:

- Validate file filtering and release packaging rules
- Catch regressions that reintroduce local `file:` dependencies or vendored workspace packages
- Keep tests deterministic and free of network, Bun, or browser requirements

### Phase 2: Root CLI integration tests

Add temp-directory integration tests for root CLIs that already support dry-run or local-only flows.

- `scripts/verify-shared-package-deps.mjs`
- `scripts/publish-skill.mjs --dry-run`
- `scripts/sync-clawhub.mjs` argument handling and local skill discovery

Goals:

- Assert exit codes and stdout for common flows
- Cover CLI argument parsing without hitting external services

### Phase 3: Skill script smoke tests

Add opt-in smoke tests for selected `skills/*/scripts/` packages, starting with those that:

- accept local input files
- have deterministic output
- do not require authenticated browser sessions

Examples:

- markdown transforms
- file conversion helpers
- local content analyzers

Keep browser automation, login flows, and live API publishing scripts outside the default CI path unless they are explicitly mocked.

### Phase 4: Coverage gates

After the stable Node path has enough breadth, add coverage thresholds in CI for the tested root modules.

Recommended order:

1. Start with reporting only
2. Add line/function thresholds for `scripts/lib/**`
3. Expand include patterns once skill-level smoke tests are reliable

## Conventions For New Tests

- Prefer temp directories over committed fixtures unless the fixture is reused heavily
- Test exported functions before testing CLI wrappers
- Avoid network, browser, and credential dependencies in default CI
- Keep tests isolated so they can run with plain `node --test`
