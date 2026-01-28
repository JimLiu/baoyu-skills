# Changelog

English | [中文](./CHANGELOG.zh.md)

## 1.24.0 - 2026-01-27

### Features
- `baoyu-post-to-wechat`: reuse existing Chrome browser instead of requiring all windows closed (by @AliceLJY).

### Fixes
- `baoyu-post-to-wechat`: improves title extraction to support h1/h2 headings; adds summary auto-fill and content verification after paste/type; supports flexible HTML meta tag attribute ordering.

### Documentation
- `release-skills`: adds third-party contributor attribution rules to changelog workflow.
- Backfills missing third-party contributor attributions across historical changelog entries.

## 1.23.1 - 2026-01-27

### Fixes
- `baoyu-compress-image`: rename original file as `_original` backup instead of deleting after compression.

## 1.23.0 - 2026-01-26

### Refactor
- `baoyu-cover-image`: replaces 20 fixed styles with 5-dimension system (Type × Palette × Rendering × Text × Mood). 9 color palettes × 6 rendering styles = 54 combinations. Adds style presets for backward compatibility, v2→v3 schema migration, and new reference structure (`palettes/`, `renderings/`, `workflow/`).

## 1.22.0 - 2026-01-25

### Features
- `baoyu-article-illustrator`: adds `imgs-subdir` output directory option; improves style selection to always ask and show preferred_style from EXTEND.md.
- `baoyu-cover-image`: adds `default_output_dir` preference supporting `same-dir`, `imgs-subdir`, and `independent` options with Step 1.5 for output directory selection.
- `baoyu-post-to-wechat`: adds theme selection (default/grace/simple) with AskUserQuestion before posting; adds HTML preview step; simplifies image placeholders to `WECHATIMGPH_N` format; refactors copy/paste to cross-platform helpers.

### Refactor
- `baoyu-post-to-x`: simplifies image placeholders from `[[IMAGE_PLACEHOLDER_N]]` to `XIMGPH_N` format.

## 1.21.4 - 2026-01-25

### Fixes
- `baoyu-post-to-wechat`: adds Windows compatibility—uses `fileURLToPath` for correct path resolution, replaces system-dependent copy/paste tools (osascript/xdotool) with CDP keyboard events for cross-platform support (by @JadeLiang003).
- `baoyu-post-to-wechat`: fixes regressions from Windows compatibility PR—corrects broken `-fixed` filename references, restores frontmatter quote stripping, restores `--title` CLI parameter, fixes summary extraction to skip headings/quotes/lists, fixes argument parsing for single-dash flags, removes debug logs.
- `baoyu-article-illustrator`, `baoyu-cover-image`, `baoyu-xhs-images`: removes opacity option from watermark configuration.

## 1.21.3 - 2026-01-24

### Refactor
- `baoyu-article-illustrator`: simplifies SKILL.md by extracting content to reference files—adds `references/usage.md` for command syntax, `references/prompt-construction.md` for prompt templates. Reorganizes workflow from 5 to 6 steps with new Pre-check phase. Adds `default_output_dir` preference option.

## 1.21.2 - 2026-01-24

### Features
- `baoyu-image-gen`: adds parallel generation documentation with recommended 4 concurrent subagents for batch operations.

### Documentation
- `release-skills`: adds skill/module grouping workflow and user confirmation step before release.

## 1.21.1 - 2026-01-24

### Documentation
- `baoyu-comic`: adds character sheet compression step after generation to reduce token usage when used as reference image.

## 1.21.0 - 2026-01-24

### Features
- `baoyu-cover-image`: expands aspect ratio options—adds 4:3, 3:2, 3:4 ratios; changes default from 2.35:1 to 16:9 for better versatility. Aspect ratio is now always confirmed unless explicitly specified via `--aspect` flag.
- `baoyu-image-gen`: refactors Google provider to support both Gemini multimodal and Imagen models with unified API. Adds `--imageSize` parameter support (1K/2K/4K) for Gemini models.

## 1.20.0 - 2026-01-24

### Features
- `baoyu-cover-image`: upgrades from Type × Style two-dimension system to **4-dimension system**—adds `--text` dimension (none, title-only, title-subtitle, text-rich) for text density control and `--mood` dimension (subtle, balanced, bold) for emotional intensity. New `--quick` flag skips confirmation and uses auto-selection.

### Documentation
- `baoyu-cover-image`: adds dimension reference files—`references/dimensions/text.md` (text density levels) and `references/dimensions/mood.md` (mood intensity levels).
- `baoyu-cover-image`: updates base-prompt, first-time-setup, and preferences-schema to support new 4-dimension system with v2 schema.
- `README.md`, `README.zh.md`: updates baoyu-cover-image documentation to reflect new 4-dimension system with `--text`, `--mood`, and `--quick` options.

## 1.19.0 - 2026-01-24

### Features
- `baoyu-comic`: adds partial workflow options—`--storyboard-only`, `--prompts-only`, `--images-only`, and `--regenerate N` for flexible workflow control.
- `baoyu-image-gen`: adds `--imageSize` parameter for Google providers (1K/2K/4K), changes default quality to 2k.
- `baoyu-image-gen`: adds `GEMINI_API_KEY` as alias for `GOOGLE_API_KEY`.

### Refactor
- `baoyu-comic`: extracts detailed workflow to `references/workflow.md`, reduces SKILL.md by ~400 lines while preserving functionality.
- `baoyu-comic`: extracts content signal analysis to `references/auto-selection.md` and partial workflow docs to `references/partial-workflows.md`.
- `baoyu-image-gen`: modularizes code—extracts types to `types.ts`, provider implementations to `providers/google.ts` and `providers/openai.ts`.

### Documentation
- `baoyu-comic`: improves ohmsha preset documentation with explicit default Doraemon character definitions and visual descriptions.

## 1.18.3 - 2026-01-23

### Documentation
- `baoyu-comic`: improves character reference handling with explicit Strategy A/B selection—Strategy A uses `--ref` parameter for skills that support it, Strategy B embeds character descriptions in prompts for skills that don't. Includes concrete code examples for both approaches.

### Fixes
- `baoyu-image-gen`: removes unsupported Gemini models (`gemini-2.0-flash-exp-image-generation`, `gemini-2.5-flash-preview-native-audio-dialog`) from multimodal model list.

## 1.18.2 - 2026-01-23

### Refactor
- Streamline SKILL.md documentation across 7 skills (`baoyu-compress-image`, `baoyu-danger-gemini-web`, `baoyu-danger-x-to-markdown`, `baoyu-image-gen`, `baoyu-post-to-wechat`, `baoyu-post-to-x`, `baoyu-url-to-markdown`) following official best practices—reduces total documentation by ~300 lines while preserving all functionality.

### Documentation
- `CLAUDE.md`: adds official skill authoring best practices link, skill loading rules, description writing guidelines, and progressive disclosure patterns.

## 1.18.1 - 2026-01-23

### Documentation
- `baoyu-slide-deck`: adds detailed sub-steps (1.1-1.3) to progress checklist, marks Step 1.3 as required with explicit Bash check command for existing directory detection.

## 1.18.0 - 2026-01-23

### Features
- `baoyu-slide-deck`: introduces dimension-based style system—replaces monolithic style definitions with modular 4-dimension architecture: **Texture** (clean, grid, organic, pixel, paper), **Mood** (professional, warm, cool, vibrant, dark, neutral), **Typography** (geometric, humanist, handwritten, editorial, technical), and **Density** (minimal, balanced, dense). 16 presets map to specific dimension combinations, with "Custom dimensions" option for full flexibility.
- `baoyu-slide-deck`: adds two-round confirmation workflow—Round 1 asks style/audience/slides/review preferences, Round 2 (optional) collects custom dimension choices when user selects "Custom dimensions".
- `baoyu-slide-deck`: adds conditional outline and prompt review—users can skip reviews for faster generation or enable them for more control.

### Documentation
- `baoyu-slide-deck`: adds dimension reference files—`references/dimensions/texture.md`, `references/dimensions/mood.md`, `references/dimensions/typography.md`, `references/dimensions/density.md`, and `references/dimensions/presets.md` (preset → dimension mapping).
- `baoyu-slide-deck`: adds design guidelines—`references/design-guidelines.md` with audience principles, visual hierarchy, content density, color selection, typography, and font recommendations.
- `baoyu-slide-deck`: adds layout reference—`references/layouts.md` with layout options and selection tips.
- `baoyu-slide-deck`: adds preferences schema—`references/config/preferences-schema.md` for EXTEND.md configuration.

## 1.17.1 - 2026-01-23

### Refactor
- `baoyu-infographic`: simplifies SKILL.md documentation—removes redundant content, streamlines workflow description, and improves readability.
- `baoyu-xhs-images`: improves Step 0 (Load Preferences) documentation—adds clearer first-time setup flow with visual tables and explicit path checking instructions.

### Improvements
- `baoyu-infographic`: enhances `craft-handmade` style with strict hand-drawn enforcement—requires all imagery to maintain cartoon/illustrated aesthetic, no realistic or photographic elements.

## 1.17.0 - 2026-01-23

### Features
- `baoyu-cover-image`: adds user preferences support via EXTEND.md—configure watermark (content, position, opacity), preferred type/style, default aspect ratio, and custom styles. New Step 0 checks for preferences at project (`.baoyu-skills/`) or user (`~/.baoyu-skills/`) level with first-time setup flow.

### Refactor
- `baoyu-cover-image`: restructures to Type × Style two-dimension system—adds 6 types (`hero`, `conceptual`, `typography`, `metaphor`, `scene`, `minimal`) that control visual composition, while 20 styles control aesthetics. New `--type` and `--aspect` options, Type × Style compatibility matrix, and structured workflow with progress checklist.

### Documentation
- `baoyu-cover-image`: adds three reference documents—`references/config/preferences-schema.md` (EXTEND.md YAML schema), `references/config/first-time-setup.md` (setup flow), `references/config/watermark-guide.md` (watermark configuration).
- `README.md`, `README.zh.md`: updates baoyu-cover-image documentation to reflect new Type × Style system with `--type` and `--aspect` options.

## 1.16.0 - 2026-01-23

### Features
- `baoyu-article-illustrator`: adds user preferences support via EXTEND.md—configure watermark (content, position, opacity), preferred type/style, and custom styles. New Step 1.1 checks for preferences at project (`.baoyu-skills/`) or user (`~/.baoyu-skills/`) level with first-time setup flow.

### Refactor
- `baoyu-article-illustrator`: restructures to Type × Style two-dimension system—replaces 20+ single-dimension styles with modular Type (infographic, scene, flowchart, comparison, framework, timeline) × Style (notion, elegant, warm, minimal, blueprint, watercolor, editorial, scientific) architecture. Adds `--type` and `--density` options, Type × Style compatibility matrix, and structured prompt construction templates.

### Documentation
- `baoyu-article-illustrator`: adds three reference documents—`references/styles.md` (style gallery and compatibility matrix), `references/config/preferences-schema.md` (EXTEND.md YAML schema), `references/config/first-time-setup.md` (setup flow).
- `README.md`, `README.zh.md`: updates baoyu-article-illustrator documentation to reflect new Type × Style system with `--type` and `--style` options.

## 1.15.3 - 2026-01-23

### Refactor
- `baoyu-comic`: restructures style system into 3-dimension architecture—replaces 10 monolithic style files with modular `art-styles/` (5 styles: ligne-claire, manga, realistic, ink-brush, chalk), `tones/` (7 moods: neutral, warm, dramatic, romantic, energetic, vintage, action), and `presets/` (3 shortcuts: ohmsha, wuxia, shoujo). New art × tone × layout system enables flexible combinations while presets preserve special rules for specific genres.

### Documentation
- `release-skills`: adds Step 5 (Check README Updates)—ensures README documentation stays in sync with code changes during releases.
- `README.md`, `README.zh.md`: updates baoyu-comic documentation to reflect new `--art` and `--tone` options replacing `--style`.

## 1.15.2 - 2026-01-23

### Documentation
- `release-skills`: comprehensive SKILL.md rewrite—adds multi-language changelog support, .releaserc.yml configuration, dry-run mode, language detection rules, and section title translations for 7 languages.

## 1.15.1 - 2026-01-22

### Refactor
- `baoyu-xhs-images`: restructures reference documents into modular architecture—reorganizes scattered files into `config/` (settings), `elements/` (visual building blocks), `presets/` (style definitions), and `workflows/` (process guides) directories for improved maintainability.

## 1.15.0 - 2026-01-22

### Features
- `baoyu-xhs-images`: adds user preferences support via EXTEND.md—configure watermark (content, position, opacity), preferred style, preferred layout, and custom styles. New Step 0 checks for preferences at project (`.baoyu-skills/`) or user (`~/.baoyu-skills/`) level with first-time setup flow.

### Documentation
- `baoyu-xhs-images`: adds three reference documents—`preferences-schema.md` (YAML schema), `watermark-guide.md` (position and opacity guide), `first-time-setup.md` (setup flow).

## 1.14.0 - 2026-01-22

### Fixes
- `baoyu-post-to-x`: improves video ready detection for more reliable video posting (by @fkysly).

### Documentation
- `baoyu-slide-deck`: comprehensive SKILL.md enhancement—adds slide count guidance (recommended 8-25, max 30), audience guidelines table with audience-specific principles, style selection principles with content-type recommendations, layout selection tips with common mistakes to avoid, visual hierarchy principles, content density guidelines (McKinsey-style high-density principles), color selection guide, typography principles with font recommendations (English and Chinese fonts with multilingual pairing), and visual elements reference (backgrounds, typography treatments, geometric accents).

## 1.13.0 - 2026-01-21

### Features
- `baoyu-url-to-markdown`: new utility skill for fetching any URL via Chrome CDP and converting to clean markdown. Supports two capture modes—auto (immediate capture on page load) and wait (user-controlled capture for login-required pages).

### Improvements
- `baoyu-xhs-images`: updates style recommendations—replaces `tech` references with `notion` and `chalkboard` for technical and educational content.

## 1.12.0 - 2026-01-21

### Features
- `baoyu-post-to-x`: adds quote tweet support (by @threehotpot-bot).

### Refactor
- `baoyu-post-to-x`: extracts shared utilities to `x-utils.ts`—consolidates Chrome detection, CDP connection, clipboard operations, and helper functions from `x-article.ts`, `x-browser.ts`, `x-quote.ts`, and `x-video.ts` into a single reusable module.

## 1.11.0 - 2026-01-21

### Features
- `baoyu-image-gen`: new AI SDK-based image generation skill using official OpenAI and Google APIs. Supports text-to-image, reference images (Google multimodal), aspect ratios, and quality presets (`normal`, `2k`). Auto-detects provider based on available API keys.
- `baoyu-slide-deck`: adds Layout Gallery with 24 layout types—10 slide-specific layouts (`title-hero`, `quote-callout`, `key-stat`, `split-screen`, `icon-grid`, `two-columns`, `three-columns`, `image-caption`, `agenda`, `bullet-list`) and 14 infographic-derived layouts (`linear-progression`, `binary-comparison`, `comparison-matrix`, `hierarchical-layers`, `hub-spoke`, `bento-grid`, `funnel`, `dashboard`, `venn-diagram`, `circular-flow`, `winding-roadmap`, `tree-branching`, `iceberg`, `bridge`).

### Documentation
- `README.md`, `README.zh.md`: adds baoyu-image-gen documentation with usage examples, options table, and environment variables; adds Environment Configuration section for API key setup.

## 1.10.0 - 2026-01-21

### Features
- `baoyu-post-to-x`: adds video posting support—new `x-video.ts` script for posting text with video files (MP4, MOV, WebM). Supports preview mode and handles video processing timeouts (by @fkysly).

## 1.9.0 - 2026-01-20

### Features
- `baoyu-xhs-images`: adds `chalkboard` style—black chalkboard background with colorful chalk drawings for education and tutorial content.
- `baoyu-comic`: adds `chalkboard` style—educational chalk drawings on black chalkboard for tutorials, explainers, and knowledge comics.

### Improvements
- `baoyu-article-illustrator`, `baoyu-cover-image`, `baoyu-infographic`: updates `chalkboard` style with enhanced visual guidelines.

### Breaking Changes
- `baoyu-xhs-images`: removes `tech` style (use `minimal` or `notion` for technical content).

### Documentation
- `README.md`, `README.zh.md`: adds style and layout preview galleries for xhs-images (9 styles, 6 layouts).

## 1.8.0 - 2026-01-20

### Features
- `baoyu-infographic`: new skill for professional infographic generation with 20 layout types (bridge, circular-flow, comparison-table, do-dont, equation, feature-list, fishbone, funnel, grid-cards, iceberg, journey-path, layers-stack, mind-map, nested-circles, priority-quadrants, pyramid, scale-balance, timeline-horizontal, tree-hierarchy, venn) and 17 visual styles. Analyzes content, recommends layout×style combinations, and generates publication-ready infographics.

### Fixes
- `baoyu-danger-gemini-web`: improves cookie validation by verifying actual Gemini session readiness instead of just checking cookie presence.

## 1.7.0 - 2026-01-19

### Features
- `baoyu-comic`: adds `shoujo` style—classic shoujo manga style with large sparkling eyes, flowers, sparkles, and soft pink/lavender palette. Best for romance, coming-of-age, friendship, and emotional drama.

## 1.6.0 - 2026-01-19

### Features
- `baoyu-cover-image`: adds `flat-doodle` style—bold black outlines, bright pastel colors, simple flat shapes with cute rounded proportions. Best for productivity, SaaS, and workflow content.
- `baoyu-article-illustrator`: adds `flat-doodle` style—same visual aesthetic for article illustrations.

## 1.5.0 - 2026-01-19

### Features
- `baoyu-article-illustrator`: expands style library to 20 styles—extracts styles to `references/styles/` directory and adds 11 new styles (`blueprint`, `chalkboard`, `editorial`, `fantasy-animation`, `flat`, `intuition-machine`, `pixel-art`, `retro`, `scientific`, `sketch-notes`, `vector-illustration`, `vintage`, `watercolor`).

### Breaking Changes
- `baoyu-article-illustrator`: removes `tech`, `bold`, and `isometric` styles.
- `baoyu-cover-image`: removes `bold` style (use `bold-editorial` for bold editorial content).

### Documentation
- `README.md`, `README.zh.md`: adds style preview gallery for article-illustrator (20 styles).

## 1.4.2 - 2026-01-19

### Documentation
- `baoyu-danger-gemini-web`: adds supported browsers list (Chrome, Chromium, Edge) and proxy configuration guide.

## 1.4.1 - 2026-01-18

### Fixes
- `baoyu-post-to-x`: supports multi-language UI selectors for X Articles (by @ianchenx).

## 1.4.0 - 2026-01-18

### Features
- `baoyu-cover-image`: expands style library from 8 to 19 styles with 12 new additions—`blueprint`, `bold-editorial`, `chalkboard`, `dark-atmospheric`, `editorial-infographic`, `fantasy-animation`, `intuition-machine`, `notion`, `pixel-art`, `sketch-notes`, `vector-illustration`, `vintage`, `watercolor`.
- `baoyu-slide-deck`: adds `chalkboard` style—black chalkboard background with colorful chalk drawings for education and tutorials.

### Breaking Changes
- `baoyu-cover-image`: removes `tech` style (use `blueprint` or `editorial-infographic` for technical content).

### Documentation
- `README.md`, `README.zh.md`: updates style preview screenshots for cover-image and slide-deck.

## 1.3.0 - 2026-01-18

### Features
- `baoyu-comic`: adds `wuxia` style—Hong Kong martial arts comic style with ink brush strokes, dynamic combat poses, and qi energy effects. Best for wuxia/xianxia and Chinese historical fiction.
- `baoyu-comic`: adds style and layout preview screenshots for all 8 styles and 6 layouts in README.

### Refactor
- `baoyu-comic`: removes `tech` style (replaced by `ohmsha` for technical content).

## 1.2.0 - 2026-01-18

### Features
- Session-independent output directories: each generation session creates a new directory (`<skill-suffix>/<topic-slug>/`), even for the same source file. Conflicts resolved by appending timestamp.
- Multi-source file support: source files now saved as `source-{slug}.{ext}`, supporting multiple inputs (text, images, files from conversation).

### Documentation
- `CLAUDE.md`: updates Output Path Convention with new session-independent directory structure and multi-source file naming.
- Multiple skills: updates file management sections to reflect new directory and source file conventions.
  - `baoyu-slide-deck`, `baoyu-article-illustrator`, `baoyu-cover-image`, `baoyu-xhs-images`, `baoyu-comic`

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
