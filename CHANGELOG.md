# Changelog

English | [中文](./CHANGELOG.zh.md)

## 1.1.0 - 2026-01-18

### Features
- `baoyu-compress-image`: new utility skill for cross-platform image compression. Converts to WebP by default with PNG-to-PNG support. Uses system tools (sips, cwebp, ImageMagick) with Sharp fallback.

### Refactor
- Marketplace structure: reorganizes plugins into three categories—`content-skills`, `ai-generation-skills`, and `utility-skills`—for better organization.

### Documentation
- `CLAUDE.md`, `README.md`, `README.zh.md`: updates skill architecture documentation to reflect the new three-category structure.

## 1.0.1 - 2026-01-18

### Refactor
- Code structure improvements for better readability and maintainability.
- `baoyu-slide-deck`: unified style reference file formats.

### Other
- Screenshots: converted from PNG to WebP format for smaller file sizes; added screenshots for new styles.

## 1.0.0 - 2026-01-18

### Features
- `baoyu-danger-x-to-markdown`: new skill to convert X/Twitter posts and threads to Markdown format.

### Breaking Changes
- `baoyu-gemini-web` renamed to `baoyu-danger-gemini-web` to indicate potential risks of using reverse-engineered APIs.

## 0.11.0 - 2026-01-18

### Features
- `baoyu-danger-gemini-web`: adds disclaimer consent check flow—requires user acceptance before first use, with persistent consent storage per platform.

## 0.10.0 - 2026-01-18

### Features
- `baoyu-slide-deck`: expands style library from 10 to 15 styles with 8 new additions—`dark-atmospheric`, `editorial-infographic`, `fantasy-animation`, `intuition-machine`, `pixel-art`, `scientific`, `vintage`, `watercolor`.

### Breaking Changes
- `baoyu-slide-deck`: removes 3 styles (`playful`, `storytelling`, `warm`); changes default style from `notion` to `blueprint`.

## 0.9.0 - 2026-01-17

### Features
- Extension support: all skills now support customization via `EXTEND.md` files. Check `.baoyu-skills/<skill-name>/EXTEND.md` (project) or `~/.baoyu-skills/<skill-name>/EXTEND.md` (user) for custom styles and configurations.

### Other
- `.gitignore`: adds `.baoyu-skills/` directory for user extension files.

## 0.8.2 - 2026-01-17

### Refactor
- `baoyu-danger-gemini-web`: reorganizes script architecture—moves modular files into `gemini-webapi/` subdirectory and updates SKILL.md with `${SKILL_DIR}` path references.

## 0.8.1 - 2026-01-17

### Refactor
- `baoyu-danger-gemini-web`: refactors script architecture—consolidates 10 separate files into a structured `gemini-webapi/` module (TypeScript port of gemini_webapi Python library).

## 0.8.0 - 2026-01-17

### Features
- `baoyu-xhs-images`: adds content analysis framework (`analysis-framework.md`, `outline-template.md`) for structured content breakdown and outline generation.

### Documentation
- `CLAUDE.md`: adds Output Path Convention (directory structure, backup rules) and Image Naming Convention (format, slug rules) to standardize image generation outputs.
- Multiple skills: updates file management conventions to use unified directory structure (`[source-name-no-ext]/<skill-suffix>/`).
  - `baoyu-article-illustrator`, `baoyu-comic`, `baoyu-cover-image`, `baoyu-slide-deck`, `baoyu-xhs-images`

## 0.7.0 - 2026-01-17

### Features
- `baoyu-comic`: adds `--aspect` (3:4, 4:3, 16:9) and `--lang` options; introduces multi-variant storyboard workflow (chronological, thematic, character-centric) with user selection.

### Enhancements
- `baoyu-comic`: adds `analysis-framework.md` and `storyboard-template.md` for structured content analysis and variant generation.
- `baoyu-slide-deck`: adds `analysis-framework.md`, `content-rules.md`, `modification-guide.md`, and `outline-template.md` references for improved outline quality.
- `baoyu-article-illustrator`, `baoyu-cover-image`, `baoyu-xhs-images`: enhanced SKILL.md documentation with clearer workflows.

### Documentation
- Multiple skills: restructured SKILL.md files—moved detailed content to `references/` directory for maintainability.
- `baoyu-slide-deck`: simplified SKILL.md, consolidated style descriptions.

## 0.6.1 - 2026-01-17

- `baoyu-slide-deck`: adds `scripts/merge-to-pdf.ts` to export generated slides into a single PDF; docs updated with pptx/pdf outputs.
- `baoyu-comic`: adds `scripts/merge-to-pdf.ts` to merge cover/pages into a PDF; docs clarify character reference handling (image vs text).
- Docs conventions: adds a “Script Directory” template to `CLAUDE.md`; aligns `baoyu-danger-gemini-web` / `baoyu-slide-deck` / `baoyu-comic` docs to use `${SKILL_DIR}` in commands so agents can run scripts from any install location.

## 0.6.0 - 2026-01-17

- `baoyu-slide-deck`: adds `scripts/merge-to-pptx.ts` to merge slide images into a PPTX and attach `prompts/` content as speaker notes.
- `baoyu-slide-deck`: reshapes/expands the style library (adds `blueprint` / `bold-editorial` / `sketch-notes` / `vector-illustration`, and adjusts/replaces some older styles).
- `baoyu-comic`: adds a `realistic` style reference.
- Docs: refreshes `README.md` / `README.zh.md`.

## 0.5.3 - 2026-01-17

- `baoyu-post-to-x` (X Articles): makes image placeholder replacement more reliable (selection retry + verification; deletes via Backspace and verifies deletion before pasting), reducing mis-insertions/failures.

## 0.5.2 - 2026-01-16

- `baoyu-danger-gemini-web`: adds `--sessionId` (local persisted sessions, plus `--list-sessions`) for multi-turn conversations and consistent multi-image generation.
- `baoyu-danger-gemini-web`: adds `--reference/--ref` for reference images (vision input), plus stronger timeout handling and cookie refresh recovery.
- Docs: `baoyu-xhs-images` / `baoyu-slide-deck` / `baoyu-comic` document session usage (reuse one `sessionId` per set) to improve visual consistency.

## 0.5.1 - 2026-01-16

- `baoyu-comic`: adds creation templates/references (character template, Ohmsha guide, outline template) to speed up “characters → storyboard → generation”.

## 0.5.0 - 2026-01-16

- Adds `baoyu-comic`: a knowledge-comic generator with `style × layout` and a full set of style/layout references for more stable output.
- `baoyu-xhs-images`: moves style/layout details into `references/styles/*` and `references/layouts/*`, and migrates the base prompt into `references/base-prompt.md` for easier maintenance/reuse.
- `baoyu-slide-deck` / `baoyu-cover-image`: similarly split base prompt and style references into `references/`, reducing SKILL.md complexity and making style expansion easier.
- Docs: updates `README.md` / `README.zh.md` skill list and examples.

## 0.4.2 - 2026-01-15

- `baoyu-danger-gemini-web`: updates description to clarify it as the image-generation backend for other skills (e.g. `cover-image`, `xhs-images`, `article-illustrator`).

## 0.4.1 - 2026-01-15

- `baoyu-post-to-x` / `baoyu-post-to-wechat`: adds `scripts/paste-from-clipboard.ts` to send a “real paste” keystroke (Cmd/Ctrl+V), avoiding sites ignoring CDP synthetic events.
- `baoyu-post-to-x`: adds docs for X Articles/regular posts, and switches image upload to prefer real paste (with a CDP fallback).
- `baoyu-post-to-wechat`: docs add script-location guidance and `${SKILL_DIR}` path usage for reliable agent execution.
- Docs: adds `screenshots/update-plugins.png` for the marketplace update flow.

## 0.4.0 - 2026-01-15

- Adds `baoyu-` prefix to skill directories and updates marketplace paths/docs accordingly to reduce naming collisions.

## 0.3.1 - 2026-01-15

- `xhs-images`: upgrades docs to a Style × Layout system (adds `--layout`, auto layout selection, and a `notion` style), with more complete usage examples.
- `article-illustrator` / `cover-image`: docs no longer hard-code `gemini-web`; instead they instruct the agent to pick an available image-generation skill.
- `slide-deck`: docs add the `notion` style and update auto-style mapping.
- Tooling/docs: adds `.DS_Store` to `.gitignore`; refreshes `README.md` / `README.zh.md`.

## 0.3.0 - 2026-01-14

- Adds `post-to-wechat`: Chrome CDP automation for WeChat Official Account posting (image-text + full article), including Markdown → WeChat HTML conversion and multiple themes.
- Adds `CLAUDE.md`: repository structure, running conventions, and “add new skill” guidelines.
- Docs: updates `README.md` / `README.zh.md` install/update/usage instructions.

## 0.2.0 - 2026-01-13

- Adds new skills: `post-to-x` (real Chrome/CDP automation for posts and X Articles), `article-illustrator`, `cover-image`, and `slide-deck`.
- `xhs-images`: adds multi-style support (`--style`) with auto style selection and updates the base prompt (e.g. language follows input, hand-drawn infographic constraints).
- Docs: adds `README.zh.md` and improves `README.md` and `.gitignore`.

## 0.1.1 - 2026-01-13

- Marketplace refactor: introduces `metadata` (including `version`), renames the plugin entry to `content-skills` and explicitly lists installable skills; removes legacy `.claude-plugin/plugin.json`.
- Adds `xhs-images`: Xiaohongshu infographic series generator (outline + per-image prompts).
- `gemini-web`: adds `--promptfiles` to build prompts from multiple files (system/content separation).
- Docs: adds `README.md`.

## 0.1.0 - 2026-01-13

- Initial release: `.claude-plugin/marketplace.json` plus `gemini-web` (text/image generation, browser login + cookie cache).
