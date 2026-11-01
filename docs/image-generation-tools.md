# Image Generation Tools

Skills in this repo are loaded by multiple agent runtimes (Claude Code, Codex, Cursor, Hermes, other agents, bare CLI). Each runtime exposes a different image-generation capability — some have a runtime-native tool (Codex `imagegen`, Cursor `GenerateImage`, Hermes `image_generate`), others rely on an installed skill (`baoyu-image-gen`, or user-defined). This document defines the canonical **backend-selection rule** every skill that renders images follows so skills stay portable.

## The Rule

Every image-rendering `SKILL.md` inlines this section verbatim, filling the three `{…}` slots in the text-patching rule with its own wording (what text, what artifact, which low-text fallback) and the prompt-file naming it uses (e.g. `NN-slide-[slug].md` in slide-deck). Keep the copies in sync when this text changes.

```markdown
## Image Generation Tools

Resolve the image backend in this order:

1. **User names a backend** in the current message → use it.
2. **`preferred_image_backend`** in `EXTEND.md` names a backend available now → use it. `ask` means ask every run.
3. **Auto-select** (preference `auto`, unset, or the pinned backend is unavailable), first match wins:
   - **Codex `imagegen`** skill is in your available skills → you are in Codex and MUST use it: `Skill` with `skill: "imagegen"`, passing the prompt file's content plus output path and aspect ratio. It outranks non-native skills such as `baoyu-image-gen`.
   - **Codex via `codex exec` (`codex-imagegen`)**: no native `imagegen`, but the `codex` CLI is on `PATH` with an active `codex login` → `baoyu-image-gen --provider codex-cli` (preferred), or the bundled wrapper if baoyu-image-gen is unavailable. Load [references/codex-imagegen.md](references/codex-imagegen.md) only for this branch.
   - **Cursor `GenerateImage`** → use it (outranks non-native skills). It has no aspect-ratio parameter, so state the aspect ratio / dimensions in the `description` prompt; it saves to a tool-managed location, so copy the file to the expected output path (e.g., `outputs/.../NN-xxx.png`). Reference images go in `reference_image_paths`.
   - **Other runtime-native image tool** (e.g., Hermes `image_generate`) → use it the same way.
   - Exactly one non-native backend installed (e.g., `baoyu-image-gen`) → use it.
   - Several non-native backends → ask the user once, batched with other initial questions.
4. **None available** → tell the user and ask how to proceed.

**⛔ Raster only**: never substitute SVG, HTML/CSS, canvas, or other code-based rendering for a raster image, even for diagram-like content. If no raster backend resolves, go to step 4.

**⛔ No bitmap text patching**: never use ImageMagick, Pillow, Canvas, SVG, HTML/CSS, OCR scripts, or any other overlay to cover, rewrite, erase, stroke, or replace {text kinds, e.g. labels, captions, or any other text} inside an already generated {artifact, e.g. illustration}. Regenerate from a corrected prompt, {low-text fallback, e.g. redraw with less or no on-image text}, or ask the user which imperfect candidate to keep.

**Prompt file (hard)**: before invoking any backend, write each image's full, final prompt to its own file under `prompts/` (`NN-{type}-[slug].md`) and pass that file (or its content) to the backend. It is the reproducibility record and lets you switch backends without rewriting prompts.

Change the pinned backend via `## Changing Preferences` below. Tool names above are examples; use the local equivalent in other runtimes.
```

## The Preference Field

Each image-consuming skill's `EXTEND.md` carries a single `preferred_image_backend` field:

| Value | Meaning |
|---|---|
| `auto` (default) | Apply the auto-select rule — runtime-native preferred, fall back to only installed backend, ask if multiple non-native. |
| `ask` | Always confirm the backend on every run, even when a runtime-native tool exists. |
| `<backend-id>` (e.g., `codex-imagegen`, `baoyu-image-gen`, `GenerateImage`, `image_generate`) | Pin this backend when available; fall back to `auto` if it isn't. |

The field is **absent-equals-auto**: older `EXTEND.md` files without this field behave exactly as if `preferred_image_backend: auto` were set. No schema version bump is needed to introduce it.

## How Skills Declare This

Each `SKILL.md` that renders images includes **exactly one** `## Image Generation Tools` section (near the top, after `## User Input Tools` and before the main workflow) that **inlines** this rule. Skills are self-contained and cannot link to `docs/` — each skill folder must ship the rule inside its own `SKILL.md`. See [CLAUDE.md → Skill Self-Containment](../CLAUDE.md).

Each skill's `references/config/preferences-schema.md` (and its `EXTEND.md` template in `first-time-setup.md`) lists `preferred_image_backend` alongside other preference fields. First-time setup does NOT ask the user about the backend — `auto` is set silently. Users who want to pin a specific backend edit `EXTEND.md` later, and each skill's `## Changing Preferences` section documents the common one-line edits.

Concrete tool names (`imagegen`, `GenerateImage`, `image_generate`, `baoyu-image-gen`) in this document and in SKILL.md are **examples** — agents in other runtimes apply the rule above and substitute the local equivalent. Skill-specific parameters for these backends are illustrative; runtimes without those knobs can omit them.

## Backend Skills Are Exempt

Skills that **are themselves** image-generation backends — currently `baoyu-image-gen`, `baoyu-image-gen` (deprecated), and `baoyu-danger-gemini-web` — do NOT include a `## Image Generation Tools` section. They render directly via their own provider integrations and have no need to "select a backend." The rule applies only to consumer skills that delegate rendering to whatever backend the runtime exposes.
