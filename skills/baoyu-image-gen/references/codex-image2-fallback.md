---
name: codex-image2-fallback
description: Fallback behavior when baoyu-image-gen lacks OpenAI API credentials but Codex/native image generation is available
---

# Codex Image2 Fallback

`--provider openai --model gpt-image-2.5-flare` without `OPENAI_API_KEY` fails with:

```text
OPENAI_API_KEY is required. Codex/ChatGPT desktop login does not automatically grant OpenAI Images API access to this script.
```

Expected: the `openai` provider uses the public OpenAI Images API; Codex/ChatGPT image2 entitlement is a separate runtime-native path.

## Fallback pattern

1. Use `baoyu-image-gen` when provider credentials are available.
2. If it fails only because `OPENAI_API_KEY` is missing, don't leave the user waiting. Use the first available:
   - Codex runtime native `imagegen` skill/tool.
   - `baoyu-image-gen --provider codex-cli` (preferred; wraps the bundled `scripts/codex-imagegen/main.ts`, upstream `packages/baoyu-codex-imagegen/src/main.ts`), if `codex` CLI is installed and logged in.
   - Hermes native `image_generate`.
3. Reference images: pass them if the backend accepts refs; otherwise derive a concise identity-preserving prompt from them and state it is a text-description fallback, not strict reference-image editing.
4. Return the generated media path or structured backend error promptly.

## User-facing wording

> The OpenAI API path needs `OPENAI_API_KEY`; Codex login is a separate image2 backend. I used the available Codex/native image backend instead. Reference images were [passed directly / reconstructed from visual traits].

Don't imply `baoyu-image-gen --provider openai` can use Codex OAuth without a dedicated provider implementation.
