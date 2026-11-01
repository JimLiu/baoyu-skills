# Codex CLI (`--provider codex-cli`)

Thin wrapper around the bundled `scripts/codex-imagegen/main.ts` (synced from `packages/baoyu-codex-imagegen`), which spawns `codex exec --json --sandbox danger-full-access` and routes the request to Codex CLI's built-in `image_gen` tool. Uses the **user's Codex / ChatGPT subscription** — no `OPENAI_API_KEY` is read or sent.

## Prerequisites

```bash
npm install -g @openai/codex
codex login            # signs in with the user's OpenAI / Codex account
codex --version        # confirm >= 0.130
```

The wrapper (`#!/usr/bin/env bun`) needs `bun`; `npx -y bun` works as a fallback.

## Selection

- **Never auto-selected.** Pin it with `--provider codex-cli` or `default_provider: codex-cli` in EXTEND.md.
- Use when the user has a Codex subscription and doesn't want an OpenAI API key, or needs Codex's specific `image_gen` behavior/quality.
- Avoid when latency matters — typically 5–10× slower than direct OpenAI / Google API calls (except cache hits).

## Supported flags

| Flag | Behavior |
|------|----------|
| `--prompt <text>` / `--promptfiles <files>` | Required. Written to a temp file and passed to the wrapper as `--prompt-file`. |
| `--image <path>` | Required. Final output PNG location. |
| `--ar <ratio>` | Mapped to wrapper's `--aspect`. Supported by Codex: `1:1` (default), `16:9`, `9:16`, `4:3`, `2.35:1`. |
| `--ref <files...>` | Mapped to wrapper's repeated `--ref`. Codex's `image_gen` accepts reference images for style/composition guidance. |
| `--n` | Must be `1`. `validateArgs` throws if `n > 1` because Codex `image_gen` returns a single image per call. |
| `--imageApiDialect` | Not applicable. Throws if set to a non-default value. |
| `--size`, `--imageSize`, `--quality` | Silently ignored — Codex picks pixel dimensions from the aspect ratio. |
| `--model`, `-m` | Logical label only. The wrapper does not forward a model selector to Codex; the underlying engine is whichever model Codex's `image_gen` currently uses. Default label: `codex-image-gen`. |

## Environment variables

| Variable | Effect |
|----------|--------|
| `BAOYU_CODEX_IMAGEGEN_BIN` | Override the wrapper path. Default: bundled `scripts/codex-imagegen/main.ts` resolved relative to this skill's installed location. Accepts a `.ts` file (spawned with `bun`) or a legacy `.sh`/binary (spawned directly). |
| `BAOYU_CODEX_IMAGEGEN_CACHE_DIR` | Enable the wrapper's idempotency cache (off by default), e.g. `~/.cache/baoyu-codex-imagegen`. |
| `BAOYU_CODEX_IMAGEGEN_TIMEOUT_MS` | Per-attempt `codex exec` timeout in ms. Default: `300000` (5 min). Raise for slow networks or large prompts. |
| `BAOYU_CODEX_IMAGEGEN_RETRIES` | Wrapper-side retry attempts on retryable errors. Default: `2` (3 total attempts). |
| `BAOYU_CODEX_IMAGEGEN_LOG_FILE` | Append a structured JSONL diagnostic log (for triaging timeouts or `agent_refused`). |
| `BAOYU_IMAGE_GEN_CODEX_CLI_CONCURRENCY` | Batch-mode concurrency. Default: `1` (codex exec is heavy; raising rarely helps). |
| `BAOYU_IMAGE_GEN_CODEX_CLI_START_INTERVAL_MS` | Batch-mode minimum start-gap. Default: `2000` ms. |

## Error model

The wrapper emits a single JSON line on stdout. On failure:

```json
{"status":"error","path":"...","bytes":0,"error":"...","error_kind":"..."}
```

The provider re-throws it as `Invalid codex-cli result (<error_kind>): <message>`. The `"Invalid "` prefix makes `isRetryableGenerationError` treat it as **non-retryable** in the outer retry loop — the wrapper already retried per `BAOYU_CODEX_IMAGEGEN_RETRIES`.

| Kind | Cause | Action |
|------|-------|--------|
| `codex_not_installed` | `codex` not on `PATH` or unreadable | `npm install -g @openai/codex`, then `codex login`. |
| `invalid_args` | Programmer error in the spawn invocation | Inspect provider source; usually a path-injection guard fired. |
| `prompt_file_missing` | Temp prompt file vanished mid-call | Retry once; check `$TMPDIR` permissions. |
| `spawn_failed` | OS / process-launch failure | Verify `bun` or `npx` is installed; check filesystem permissions. |
| `timeout` | `codex exec` exceeded `--timeout` | Raise `BAOYU_CODEX_IMAGEGEN_TIMEOUT_MS`; check network. |
| `no_image_gen_tool_use` | Codex agent answered without calling `image_gen` | Often transient — retry. If persistent, refine the prompt. |
| `output_missing` / `invalid_png` | Agent reported success but file is absent or not a valid PNG | Retry; check disk space. |
| `agent_refused` | Codex agent refused (policy or content) | Adjust the prompt; surface the refusal to the user. |
| `lock_busy` | Another `codex-imagegen` invocation holds the file lock | Wait or set a distinct `--cache-dir` per concurrent caller. |

## Notes

- Same TOS as interactive `codex exec` use — programmatic invocation is the same usage class.
- Requires a live `codex login`; an expired session shows up as `codex_not_installed` or `agent_refused`.

## See also

- `references/codex-oauth-vs-openai-api-key.md` — why Codex OAuth is not interchangeable with `OPENAI_API_KEY`.
- `references/codex-image2-fallback.md` — when to fall back to `codex-cli` from a failed `openai` provider call.
