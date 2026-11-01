# Creating New Skills

**REQUIRED READING**: [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

## Key Requirements

| Requirement | Details |
|-------------|---------|
| **Prefix** | All skills MUST use `baoyu-` prefix |
| **name field** | Max 64 chars, lowercase letters/numbers/hyphens only, no "anthropic"/"claude" |
| **description** | Max 1024 chars, third person, include what + when to use |
| **SKILL.md body** | Keep under 500 lines; use `references/` for additional content |
| **References** | One level deep from SKILL.md; avoid nested references |

## SKILL.md Frontmatter Template

```yaml
---
name: baoyu-<name>
description: <Third-person description. What it does + when to use it.>
version: <semver matching marketplace.json>
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-<name>
    requires:          # include only if skill has scripts
      anyBins:
        - bun
        - npx
---
```

## Steps

1. Create `skills/baoyu-<name>/SKILL.md` with YAML front matter
2. Add TypeScript in `skills/baoyu-<name>/scripts/` (if applicable)
3. Add prompt templates in `skills/baoyu-<name>/prompts/` if needed
4. Register the skill in `.claude-plugin/marketplace.json` under the `baoyu-skills` plugin entry
5. Add Script Directory section to SKILL.md if skill has scripts
6. Add openclaw metadata to frontmatter

## Skill Grouping

All skills are registered under the single `baoyu-skills` plugin. Use these logical groups when deciding where the skill should appear in the docs:

| If your skill... | Use group |
|------------------|-----------|
| Generates visual content (images, slides, comics) | Content Skills |
| Publishes to platforms (X, WeChat, Weibo) | Content Skills |
| Provides AI generation backend | AI Generation Skills |
| Converts or processes content | Utility Skills |

If you add a new logical group, update the docs that present grouped skills, but keep the skill registered under the single `baoyu-skills` plugin entry.

## Writing Descriptions

**MUST write in third person**:

```yaml
# Good
description: Generates Xiaohongshu infographic series from content. Use when user asks for "小红书图片", "XHS images".

# Bad
description: I can help you create Xiaohongshu images
```

## Script Directory Template

Every SKILL.md with scripts MUST include:

```markdown
## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `{baseDir}`
2. Script path = `{baseDir}/scripts/<script-name>.ts`
3. Resolve `${BUN_X}` runtime: if `bun` installed → `bun`; if `npx` available → `npx -y bun`; else suggest installing bun
4. Replace all `{baseDir}` and `${BUN_X}` in this document with actual values

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Main entry point |
```

## Progressive Disclosure

For skills with extensive content:

```
skills/baoyu-example/
├── SKILL.md              # Main instructions (<500 lines)
├── references/
│   ├── styles.md         # Loaded as needed
│   └── examples.md       # Loaded as needed
└── scripts/
    └── main.ts
```

Link from SKILL.md (one level deep only):
```markdown
**Available styles**: See [references/styles.md](references/styles.md)
```

## Extension Support (EXTEND.md)

Every SKILL.md MUST include EXTEND.md loading. Add as Step 1.1 (workflow skills) or "Preferences" section (utility skills):

```markdown
**1.1 Load Preferences (EXTEND.md)**

Check EXTEND.md existence (priority order):

\`\`\`bash
test -f .baoyu-skills/<skill-name>/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/<skill-name>/EXTEND.md" && echo "xdg"
test -f "$HOME/.baoyu-skills/<skill-name>/EXTEND.md" && echo "user"
\`\`\`

| Path | Location |
|------|----------|
| `.baoyu-skills/<skill-name>/EXTEND.md` | Project directory |
| `$XDG_CONFIG_HOME/baoyu-skills/<skill-name>/EXTEND.md` | XDG config (~/.config) |
| `$HOME/.baoyu-skills/<skill-name>/EXTEND.md` | User home (legacy) |

| Result | Action |
|--------|--------|
| Found | Read, parse, display summary |
| Not found | Ask user via the runtime's user-input tool (see [user-input-tools.md](user-input-tools.md)) |
```

End of SKILL.md should include:
```markdown
## Extension Support
Custom configurations via EXTEND.md. See **Step 1.1** for paths and supported options.
```

## User Input Tools Section (Required)

Every SKILL.md that prompts the user for choices MUST include exactly one `## User Input Tools` section near the top (right after the intro, before the main workflow). The rule must be **inlined** — do NOT link to `docs/user-input-tools.md` (skills are self-contained; see [CLAUDE.md → Skill Self-Containment](../CLAUDE.md)). The author-side canonical reference lives at [user-input-tools.md](user-input-tools.md); copy its body into each new SKILL.md.

Standard snippet (copy verbatim, then fill the `{…}` slots for this skill):

```markdown
## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete `AskUserQuestion` references below are examples — substitute the local equivalent in other runtimes.
```

## Image Generation Tools Section (Required for image-gen skills)

Every SKILL.md that renders images — whether by calling an image-generation API directly or by delegating to another skill — MUST include exactly one `## Image Generation Tools` section near the top (after `## User Input Tools`, before the main workflow). The rule must be **inlined** — do NOT link to `docs/image-generation-tools.md` (skills are self-contained; see [CLAUDE.md → Skill Self-Containment](../CLAUDE.md)). The author-side canonical reference lives at [image-generation-tools.md](image-generation-tools.md); copy its body into each new SKILL.md.

Standard snippet (copy verbatim):

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
