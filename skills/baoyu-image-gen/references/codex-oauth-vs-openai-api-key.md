# Codex OAuth vs OpenAI API key for baoyu-image-gen

`baoyu-image-gen --provider openai` uses the standard OpenAI Images API (`/images/generations`, `/images/edits`) and requires `OPENAI_API_KEY`.

Codex/ChatGPT image generation is driven by Codex OAuth and the Codex runtime's `image_gen` capability, not the public Images API key path. A Codex OAuth token is not a drop-in `OPENAI_API_KEY`, and pointing `OPENAI_BASE_URL` at a Codex backend won't make the `openai` provider work — auth, route, and payload shape differ.

## What to use instead

- Inside Codex with the native `imagegen` skill/tool: use it directly.
- Outside Codex with `codex` CLI installed and logged in: `baoyu-image-gen --provider codex-cli` (preferred). It spawns the bundled `scripts/codex-imagegen/main.ts` and gets baoyu-image-gen's standard CLI + batch flow with the wrapper's retry/cache/log machinery. Standalone callers can run the same code at `packages/baoyu-codex-imagegen/src/main.ts`. Both invoke `codex exec` and the Codex `image_gen` tool; no `OPENAI_API_KEY`.
- Inside Hermes with a native `image_generate` tool: runtime-native fallback. State whether reference images were passed directly or only reconstructed from extracted traits.
- Do not modify the existing `openai` provider to add Codex OAuth; `codex-cli` is the dedicated provider.

For identity-preserving reference prompts, see "Reference-Image Identity Preservation" in SKILL.md.
