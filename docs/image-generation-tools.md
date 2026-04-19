# Image Generation Tools

Skills in this repo are loaded by multiple agent runtimes (Claude Code, Codex, Hermes, other agents, bare CLI). Each runtime exposes a different image-generation capability — some have a runtime-native tool (Codex `imagegen`, Hermes `image_generate`), others rely on an installed skill (`baoyu-imagine`, or user-defined). This document defines the canonical **backend-selection rule** every skill that renders images follows so skills stay portable.

## The Rule

When a skill needs to render an image:

- **Use whatever image-generation tool or skill is available** in the current runtime — e.g., Codex `imagegen`, Hermes `image_generate`, `baoyu-imagine`, or any equivalent the user has installed.
- **If multiple are available**, ask the user **once** at the start which to use (batch with any other initial questions).
- **If none are available**, tell the user and ask how to proceed.

No explicit priority between runtime-native tools and repo skills — treat them equivalently and let the user decide when there's a choice. No persisted preference mechanism; the question is cheap, and the rule is stateless.

## Prompt File Requirement (hard)

Regardless of which backend is chosen, every skill that renders images MUST write each image's full, final prompt to a standalone file under `prompts/` (naming: `NN-{type}-[slug].md`) BEFORE invoking any backend. The backend receives the prompt file (or its content); the file is the reproducibility record and allows switching backends without regenerating prompts.

## How Skills Declare This

Each `SKILL.md` that renders images includes **exactly one** `## Image Generation Tools` section (near the top, after `## User Input Tools` and before the main workflow) that **inlines** this rule. Skills are self-contained and cannot link to `docs/` — each skill folder must ship the rule inside its own `SKILL.md`. See [CLAUDE.md → Skill Self-Containment](../CLAUDE.md).

Concrete tool names (`imagegen`, `image_generate`, `baoyu-imagine`) in this document and in SKILL.md are **examples** — agents in other runtimes apply the rule above and substitute the local equivalent. Skill-specific parameters for these backends are illustrative; runtimes without those knobs can omit them.

## Backend Skills Are Exempt

Skills that **are themselves** image-generation backends — currently `baoyu-imagine`, `baoyu-image-gen` (deprecated), and `baoyu-danger-gemini-web` — do NOT include a `## Image Generation Tools` section. They render directly via their own provider integrations and have no need to "select a backend." The rule applies only to consumer skills that delegate rendering to whatever backend the runtime exposes.
