# Changelog

English | [中文](./CHANGELOG.zh.md)

## 1.58.0 - 2026-03-08

### Features
- Add XDG config path support for EXTEND.md (by @liby)

### Fixes
- `baoyu-post-to-wechat`: surface agent-browser startup errors
- `baoyu-post-to-wechat`: harden agent-browser command and eval handling (by @luojiyin1987)
- `baoyu-image-gen`: use execFileSync for google curl requests (by @luojiyin1987)
- `baoyu-format-markdown`: use spawnSync for autocorrect command (by @luojiyin1987)

### Documentation
- Fix CLAUDE dependency statement (by @luojiyin1987)
- Add markdown-to-html to README utility skills (by @luojiyin1987)

## 1.57.0 - 2026-03-08

### Features
- Add ClawHub/OpenClaw publishing support with sync script and README documentation

### Refactor
- Add openclaw metadata to all skill frontmatter for ClawHub registry compatibility
- Rename `SKILL_DIR` to `baseDir` across all skills for consistency
- `baoyu-danger-gemini-web`, `baoyu-danger-x-to-markdown`: dynamic script path in usage display
- `baoyu-comic`, `baoyu-xhs-images`: use skill interface instead of direct script invocation for image generation

## 1.56.1 - 2026-03-08

### Fixes
- `baoyu-post-to-weibo`: simplify article image insertion with Backspace-based placeholder deletion for ProseMirror compatibility

## 1.56.0 - 2026-03-08

### Features
- `baoyu-article-illustrator`: preset-first selection flow with categorized style presets by content type
- `baoyu-xhs-images`: streamline workflow from 6 to 4 steps with Smart Confirm (Quick/Customize/Detailed paths)

### Fixes
- `baoyu-post-to-wechat`: improve image upload reliability with file chooser interception and fallback

## 1.55.0 - 2026-03-08

### Features
- `baoyu-article-illustrator`: add screen-print style and `--preset` flag for quick type + style selection
- `baoyu-cover-image`: add screen-print rendering and duotone palette with 5 new style presets
- `baoyu-xhs-images`: add screen-print style and `--preset` flag with 23 built-in presets

### Documentation
- Add credits section to both READMEs acknowledging open source inspirations

## 1.54.1 - 2026-03-07

### Fixes
- `baoyu-post-to-x`: keep composed posts open in Chrome so users can review and publish manually

### Documentation
- `baoyu-post-to-x`: document default post type selection and manual publishing flow
- `README`: add Star History charts to the English and Chinese READMEs

## 1.54.0 - 2026-03-06

### Features
- `baoyu-format-markdown`: improve title and summary generation with style-differentiated candidates, prohibited patterns, and hook-first principles
- `baoyu-markdown-to-html`: add `--cite` option to convert ordinary external links to numbered bottom citations
- `baoyu-post-to-wechat`: enable bottom citations by default for markdown input, add `--no-cite` flag to disable
- `baoyu-translate`: support external glossary files via `glossary_files` in EXTEND.md (markdown table or YAML)
- `baoyu-translate`: add frontmatter transformation rules to rename source metadata fields with `source` prefix

## 1.53.0 - 2026-03-06

### Features
- `baoyu-url-to-markdown`: save rendered HTML snapshot as `-captured.html` alongside markdown output
- `baoyu-url-to-markdown`: Defuddle-first markdown conversion with automatic fallback to legacy Readability/selector extractor

## 1.52.0 - 2026-03-06

### Features
- `baoyu-post-to-weibo`: add video upload support via `--video` flag (max 18 files total)
- `baoyu-post-to-weibo`: switch from clipboard paste to `DOM.setFileInputFiles` for more reliable uploads

### Fixes
- `baoyu-post-to-weibo`: add Chrome health check with auto-restart for unresponsive instances
- `baoyu-post-to-weibo`: add navigation check to ensure Weibo home page before posting

## 1.51.2 - 2026-03-06

### Fixes
- `release-skills`: replace explicit language filename patterns (e.g. `CHANGELOG.de.md`) with generic pattern to avoid Gen Agent Trust Hub URL scanner false positive
- `baoyu-infographic`: add credential/secret stripping instructions to address Snyk W007 insecure credential handling audit

## 1.51.1 - 2026-03-06

### Refactor
- Unify Chrome CDP profile path — all skills now share `baoyu-skills/chrome-profile` instead of per-skill directories
- Fix `baoyu-post-to-weibo` incorrectly reusing `x-browser-profile` path

### Fixes
- Remove `curl | bash` remote code execution pattern from all install instructions
- Enforce HTTPS-only for remote image downloads in `md-to-html` scripts
- Add redirect limit (max 5) to prevent infinite redirect loops
- Add Security Guidelines section to CLAUDE.md

## 1.51.0 - 2026-03-06

### Features
- `baoyu-post-to-weibo`: new skill for posting to Weibo — supports text posts with images and headline articles (头条文章) via Chrome CDP
- `baoyu-format-markdown`: add title/summary multi-candidate selection — generates 3 candidates for user to pick, with `auto_select` EXTEND.md support

## 1.50.0 - 2026-03-06

### Features
- `baoyu-translate`: expand translation style presets from 4 to 9 — add academic, business, humorous, conversational, and elegant styles
- `baoyu-translate`: add `--style` CLI flag for per-invocation style override
- `baoyu-translate`: integrate style instructions into subagent prompt template

## 1.49.0 - 2026-03-06

### Features
- `baoyu-format-markdown`: add reader-perspective content analysis phase — analyzes highlights, structure, and formatting issues before applying formatting
- `baoyu-format-markdown`: restructure workflow from 8 steps to 7 with explicit do/don't formatting principles and completion report
- `baoyu-translate`: extract Step 2 workflow mechanics to separate reference file for cleaner SKILL.md
- `baoyu-translate`: expand trigger keywords (改成中文, 快翻, 本地化, etc.) for better skill activation
- `baoyu-translate`: add proactive warning for long content in quick mode
- `baoyu-translate`: save frontmatter to `chunks/frontmatter.md` during chunking

## 1.48.2 - 2026-03-06

### Features
- `baoyu-translate`: add figurative language & emotional fidelity review steps to refined workflow critique and revision stages
- `baoyu-translate`: enhance quick mode to enforce meaning-first translation principles for figurative language

## 1.48.1 - 2026-03-05

### Features
- `baoyu-translate`: add figurative language & metaphor mapping to analysis step — interprets metaphors, idioms, and implied meanings before translation instead of translating literally
- `baoyu-translate`: add "meaning over words", "figurative language", and "emotional fidelity" translation principles to SKILL.md, refined workflow, and subagent prompt template

## 1.48.0 - 2026-03-05

### Features
- `baoyu-translate`: add `--output-dir` option to chunk.ts — chunks now write to the translation output directory instead of the source file directory
- `baoyu-translate`: improve refined workflow — split Review into Critical Review + Revision (5→6 steps), add Europeanized language diagnosis for CJK targets

## 1.47.0 - 2026-03-05

### Features
- Add `baoyu-translate` skill — three-mode translation (quick/normal/refined) with custom glossaries, audience-aware translation, and parallel chunked translation for long documents
- Add cross-platform PowerShell support for EXTEND.md preference checks across all skills

## 1.46.0 - 2026-03-05

### Features
- Add `--output-dir` option to url-to-markdown for custom output directory with auto-generated filenames

## 1.45.1 - 2026-03-05

### Refactor
- Replace hardcoded `npx -y bun` with `${BUN_X}` runtime variable across all skills — prefers native `bun`, falls back to `npx -y bun`
- Add Runtime Detection section to CLAUDE.md and Script Directory instructions in all SKILL.md files

## 1.45.0 - 2026-03-05

### Features
- `baoyu-post-to-x`: add post-composition verification for X Articles — automatically checks remaining placeholders and image count after all images are inserted
- `baoyu-post-to-x`: increase CDP timeout to 60s and add 3s DOM stabilization delay between image insertions for long articles

## 1.44.0 - 2026-03-05

### Features
- `baoyu-url-to-markdown`: add `--download-media` flag to download images and videos to local directories, rewriting markdown links to local paths
- `baoyu-url-to-markdown`: extract cover image from page meta (og:image) into YAML front matter `coverImage` field
- `baoyu-url-to-markdown`: handle `data-src` lazy loading for WeChat and similar sites
- `baoyu-url-to-markdown`: add EXTEND.md preferences with first-time setup for media download behavior

## 1.43.2 - 2026-03-05

### Refactor
- `baoyu-url-to-markdown`: replace custom HTML extraction (linkedom + Readability + Turndown) with defuddle library for cleaner content extraction and markdown conversion

## 1.43.1 - 2026-03-02

### Features
- `baoyu-post-to-x`: auto-detect WSL environment and resolve Chrome profile to Windows-native path for stable login persistence
- `baoyu-post-to-wechat`: auto-detect WSL environment and resolve Chrome profile to Windows-native path for stable login persistence
- `baoyu-danger-gemini-web`: WSL auto-detection for Chrome profile path; add `GEMINI_WEB_DEBUG_PORT` env var for fixed debug port
- `baoyu-danger-x-to-markdown`: WSL auto-detection for Chrome profile path; add `X_DEBUG_PORT` env var for fixed debug port

## 1.43.0 - 2026-03-02

### Features
- `baoyu-post-to-wechat`: support env var overrides for browser debug port (`WECHAT_BROWSER_DEBUG_PORT`) and profile directory (`WECHAT_BROWSER_PROFILE_DIR`)
- `baoyu-post-to-x`: support env var overrides for browser debug port (`X_BROWSER_DEBUG_PORT`) and profile directory (`X_BROWSER_PROFILE_DIR`)

## 1.42.3 - 2026-03-02

### Fixes
- `baoyu-image-gen`: use standard size presets for DashScope aspect ratio mapping instead of free-form calculation

## 1.42.2 - 2026-03-01

### Features
- `baoyu-markdown-to-html`: inline rendering pipeline (no subprocess), fix CJK emphasis order, enhance modern theme with GFM alerts and improved typography
- `baoyu-post-to-wechat`: internalize markdown conversion with modular renderer, add color support, simplify publishing workflow

## 1.42.1 - 2026-02-28

### Features
- `baoyu-markdown-to-html`: modularize render.ts into cli, constants, extend-config, html-builder, renderer, themes, and types modules; bundle code highlighting themes locally

## 1.42.0 - 2026-02-28

### Features
- `baoyu-markdown-to-html`: consolidate heritage and warm into single modern theme, add per-theme color defaults (default→blue, grace→purple, simple→green, modern→orange)
- `baoyu-post-to-wechat`: add default color preference support in EXTEND.md, add modern theme option to first-time setup

## 1.41.0 - 2026-02-28

### Features
- `baoyu-markdown-to-html`: rename themes (red→heritage, orange→warm), add 13 named color presets, serif-cjk font family, and per-theme style defaults

## 1.40.1 - 2026-02-28

### Features
- `baoyu-image-gen`: clarify model resolution priority (EXTEND.md overrides env vars) and display current model with switch hints during generation

## 1.40.0 - 2026-02-28

### Features
- `baoyu-image-gen`: support OpenAI chat completions endpoint for image generation (by @zhao-newname)
- `baoyu-markdown-to-html`: add CLI customization options (--color, --font-family, --font-size, --code-theme, --mac-code-block, --line-number, --cite, --count, --legend) and EXTEND.md config support

## 1.39.0 - 2026-02-28

### Features
- `baoyu-markdown-to-html`: add red theme (traditional calligraphy style with red-gold palette and serif typography) and orange theme (warm modern style with rounded corners and relaxed line height)

## 1.38.0 - 2026-02-28

### Features
- `baoyu-danger-x-to-markdown`: render embedded tweets in articles as blockquotes with author info and text summary
- `baoyu-danger-x-to-markdown`: reuse existing markdown when `--download-media` targets already-converted URLs
- `baoyu-danger-x-to-markdown`: upgrade Twitter image downloads to 4096x4096 high resolution

### Fixes
- `baoyu-danger-x-to-markdown`: improve entity resolution with logical key lookup for reliable media and link mapping
- `baoyu-danger-x-to-markdown`: support trailing media for all block types (headings, lists, blockquotes)

## 1.37.1 - 2026-02-27

### Fixes
- `baoyu-danger-gemini-web`: sync model headers with upstream and update model list (by @xkcoding)

## 1.37.0 - 2026-02-27

### Features
- `baoyu-danger-x-to-markdown`: add inline link rendering for X article content, mapping LINK/MEDIA entities to markdown links
- `baoyu-danger-x-to-markdown`: use content-based slug in output directory path for meaningful folder names
- `baoyu-danger-x-to-markdown`: add atomic media queue for blocks without direct media references

## 1.36.0 - 2026-02-27

### Features
- `baoyu-image-gen`: add `gemini-3.1-flash-image-preview` model support for Google multimodal image generation
- `baoyu-image-gen`: improve first-time setup with blocking preferences flow and guided configuration

### Fixes
- `baoyu-image-gen`: use curl fallback for Google API when HTTP proxy is detected (by @liye71023326)

## 1.35.0 - 2026-02-24

### Features
- `baoyu-image-gen`: add Replicate provider support with configurable models (by @justnode)
- `baoyu-infographic`: add `dense-modules` layout and 3 new styles (`morandi-journal`, `pop-laboratory`, `retro-pop-grid`) for high-density infographics. Add keyword shortcuts for auto-selection. Prompt credit: [AJ](https://waytoagi.feishu.cn/wiki/YG0zwalijihRREkgmPzcWRInnUg)

### Documentation
- `baoyu-image-gen`: add Replicate model configuration documentation

## 1.34.2 - 2026-02-25

### Documentation
- `baoyu-markdown-to-html`: clarify theme resolution order with local and cross-skill EXTEND.md fallbacks before prompting user.
- `baoyu-post-to-wechat`: align markdown conversion theme handling with deterministic fallback (`CLI --theme` -> EXTEND.md `default_theme` -> `default`) and require explicit `--theme` parameter.

## 1.34.1 - 2026-02-20

### Fixes
- `baoyu-post-to-wechat`: fix upload progress check crashing on second iteration (by @LyInfi)

## 1.34.0 - 2026-02-17

### Features
- `baoyu-xhs-images`: add reference image chain for visual consistency across multi-image series (by @jeffrey94)

### Refactor
- `baoyu-article-illustrator`: enforce prompt file creation as blocking step before image generation, add structured prompt quality requirements (ZONES / LABELS / COLORS / STYLE / ASPECT) and verification checklist.

## 1.33.1 - 2026-02-14

### Refactor
- `baoyu-post-to-x`: replace hand-rolled markdown parser with marked ecosystem for X Articles HTML conversion.

### Documentation
- `baoyu-post-to-x`: remove `--submit` flag from all scripts; clarify that scripts only fill content into browser for manual review and publish.

## 1.33.0 - 2026-02-13

### Features
- `baoyu-post-to-x`: add pre-flight environment check script (`check-paste-permissions.ts`); add troubleshooting section for Chrome debug port conflicts; replace fixed sleep with image upload verification polling up to 15s.
- `baoyu-post-to-wechat`: add pre-flight environment check script (`check-permissions.ts`) covering Chrome, profile isolation, Bun, Accessibility, clipboard, paste keystroke, API credentials.

## 1.32.0 - 2026-02-12

### Features
- `baoyu-danger-x-to-markdown`: add `--download-media` flag to download images/videos locally and rewrite markdown links to relative paths; add media localization module; add first-time setup with EXTEND.md preferences; add `coverImage` to frontmatter output.

### Refactor
- `baoyu-danger-x-to-markdown`: use camelCase for frontmatter keys (`tweetCount`, `coverImage`, `requestedUrl`, etc.).
- `baoyu-format-markdown`: rename `featureImage` to `coverImage` as primary frontmatter key (with `featureImage` as accepted alias).
- `baoyu-post-to-wechat`: prioritize `coverImage` over `featureImage` in cover image frontmatter lookup order.

## 1.31.2 - 2026-02-10

### Fixes
- `baoyu-post-to-wechat`: fix PowerShell clipboard copy failing on Windows due to `param()`/`-Path` not working with `-Command`.
- `baoyu-post-to-x`: fix PowerShell clipboard copy on Windows (same issue); fix `getScriptDir()` returning invalid path on Windows (`/C:/...` prefix).

## 1.31.1 - 2026-02-10

### Features
- `baoyu-post-to-wechat`: adapt to new WeChat UI — rename 图文 to 贴图; add ProseMirror editor support with old editor fallback; add fallback file input selector; add upload progress monitoring; improve save button detection with toast verification.

### Fixes
- `baoyu-post-to-wechat`: truncate digest > 120 chars at punctuation boundary; fix cover image relative path resolution.
- `baoyu-post-to-x`: fix Chrome launch on macOS via `open -na`; fix cover image relative path resolution.

## 1.31.0 - 2026-02-07

### Features
- `baoyu-post-to-wechat`: add comment control settings (`need_open_comment`, `only_fans_can_comment`); add cover image fallback chain (CLI → frontmatter → `imgs/cover.png` → first inline image); add author resolution priority; add first-time setup flow with EXTEND.md preferences.

## 1.30.3 - 2026-02-06

### Refactor
- `baoyu-article-illustrator`: optimize SKILL.md from 197 to 150 lines (24% reduction); apply progressive disclosure pattern with concise overview and detailed references.

## 1.30.2 - 2026-02-06

### Refactor
- `baoyu-cover-image`: optimize SKILL.md from 532 to 233 lines (56% reduction); extract reference image handling to `references/workflow/reference-images.md`; condense galleries to value-only tables with links.

## 1.30.1 - 2026-02-06

### Features
- `baoyu-image-gen`: add OpenAI GPT Image edits support for reference images (`--ref`); auto-select Google or OpenAI when ref provided.

### Fixes
- `baoyu-image-gen`: change ref-related warnings to explicit errors with fix hints; add reference image validation.
- `baoyu-cover-image`: enhance reference image analysis with deep extraction template; require MUST INCORPORATE section for concrete visual elements.

## 1.30.0 - 2026-02-06

### Features
- `baoyu-cover-image`: add font dimension with 4 typography styles (clean, handwritten, serif, display); includes auto-selection rules, compatibility matrix, and `warm-flat` style preset.

## 1.29.0 - 2026-02-06

### Features
- `baoyu-image-gen`: add EXTEND.md configuration support, including schema documentation and runtime preference loading in scripts (by @kingdomad).

### Fixes
- `baoyu-post-to-wechat`: fix duplicated title and ordered-list numbering in WeChat article publishing (by @NantesCheval).
- `baoyu-url-to-markdown`: replace regex-only conversion with multi-strategy content extraction and Turndown conversion; improve noise filtering for Substack-style pages.

## 1.28.4 - 2026-02-03

### Features
- `baoyu-markdown-to-html`: add author and description meta tags to generated HTML from YAML frontmatter; strip quotes from frontmatter values (supports both English and Chinese quotation marks).

### Fixes
- `baoyu-post-to-wechat`: remove extra empty lines after image paste; fix summary field timing to fill after content paste (prevents being overwritten).

## 1.28.3 - 2026-02-03

### Fixes
- `baoyu-post-to-wechat`: fix placeholder matching issue where `WECHATIMGPH_1` incorrectly matched `WECHATIMGPH_10`.

## 1.28.2 - 2026-02-03

### Fixes
- `baoyu-post-to-x`: reuse existing Chrome instance when available; fix placeholder matching issue where `XIMGPH_1` incorrectly matched `XIMGPH_10`; improve image sorting by placeholder index; use `execCommand` for more reliable placeholder deletion.

## 1.28.1 - 2026-02-02

### Refactor
- `baoyu-article-illustrator`: simplify main SKILL.md by extracting detailed procedures to `workflow.md`; add Core Styles tier (vector, minimal-flat, sci-fi, hand-drawn, editorial, scene) for quick selection; add `vector-illustration` as recommended default style; add Illustration Purpose (information/visualization/imagination) for better type/style recommendations; add default composition requirements, character rendering guidelines, and text styling rules to prompt construction.

## 1.28.0 - 2026-02-01

### Features
- `baoyu-cover-image`: add reference image support (`--ref` parameter) with direct/style/palette usage types; add visual elements library with icon vocabulary by topic.
- `baoyu-article-illustrator`: add reference image support with direct/style/palette usage types.
- `baoyu-post-to-wechat`: add `newspic` article type for image-text posts.

### Refactor
- `baoyu-cover-image`, `baoyu-article-illustrator`, `baoyu-comic`, `baoyu-xhs-images`: enforce first-time setup as blocking operation before any other workflow steps.
- `baoyu-cover-image`: remove character limits from titles, use original source titles.

## 1.26.1 - 2026-01-29

### Features
- `baoyu-article-illustrator`, `baoyu-comic`, `baoyu-cover-image`, `baoyu-infographic`, `baoyu-slide-deck`, `baoyu-xhs-images`: add backup rules for existing files—automatically renames source, prompt, and image files with timestamp suffix before overwriting.

### Fixes
- `baoyu-xhs-images`: remove `notebook` style (10 styles remaining).

## 1.26.0 - 2026-01-29

### Features
- `baoyu-xhs-images`: add `notebook` style (hand-drawn infographic with watercolor rendering and Morandi palette) and `study-notes` style (realistic handwritten photo aesthetic).
- `baoyu-xhs-images`: add `mindmap` (center radial) and `quadrant` (four-section grid) layouts.

## 1.25.4 - 2026-01-29

### Fixes
- `baoyu-markdown-to-html`: generate proper `<img>` tags with `data-local-path` attribute instead of text placeholders.
- `baoyu-post-to-wechat`: fix API publishing to read image paths from `data-local-path` attribute; fix title/cover extraction from corresponding `.md` frontmatter when publishing HTML files.
- `baoyu-post-to-wechat`: fix CLI argument parsing to handle unknown parameters gracefully; add `--summary` parameter support.
- `baoyu-post-to-wechat`: fix browser publishing to convert `<img>` tags back to text placeholders before paste.

## 1.25.3 - 2026-01-28

### Features
- `baoyu-format-markdown`: add content type detection with user confirmation for markdown files; add CJK punctuation handling to move paired punctuation outside emphasis markers.

## 1.25.2 - 2026-01-28

### Documentation
- `baoyu-post-to-wechat`: add WeChat API credentials configuration guide to README.

## 1.25.1 - 2026-01-28

### Features
- `baoyu-markdown-to-html`: add pre-check step for CJK content to suggest formatting with `baoyu-format-markdown` before conversion.

## 1.25.0 - 2026-01-28

### Features
- `baoyu-format-markdown`: add markdown formatter skill with frontmatter, typography, and CJK spacing support.
- `baoyu-markdown-to-html`: add markdown to HTML converter with WeChat-compatible themes, code highlighting, math, PlantUML, and alerts.
- `baoyu-post-to-wechat`: add API-based publishing method and external theme support.

## 1.24.4 - 2026-01-28

### Fixes
- `baoyu-post-to-x`: fix Apply button click for cover image modal; add retry logic and wait for modal close.

## 1.24.3 - 2026-01-28

### Documentation
- Emphasize updating prompt files before regenerating images in modification workflows (article-illustrator, slide-deck, xhs-images, cover-image, comic).

## 1.24.2 - 2026-01-28

### Refactor
- `baoyu-image-gen`: default to sequential generation; parallel available on request.

## 1.24.1 - 2026-01-28

### Features
- `baoyu-image-gen`: add Aliyun Tongyi Wanxiang (DashScope) text-to-image model support (by @JianJang2017).

### Documentation
- Add Aliyun text-to-image model configuration to README.

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
