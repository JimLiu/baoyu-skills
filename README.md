# baoyu-skills

English | [中文](./README.zh.md)

Skills shared by Baoyu for improving daily work efficiency with Claude Code.

## Prerequisites

- Node.js environment installed
- Ability to run `npx bun` commands

## Installation

### Quick Install (Recommended)

```bash
npx skills add jimliu/baoyu-skills
```

### Register as Plugin Marketplace

Run the following command in Claude Code:

```bash
/plugin marketplace add jimliu/baoyu-skills
```

### Install Skills

**Option 1: Via Browse UI**

1. Select **Browse and install plugins**
2. Select **baoyu-skills**
3. Select the plugin(s) you want to install
4. Select **Install now**

**Option 2: Direct Install**

```bash
# Install specific plugin
/plugin install content-skills@baoyu-skills
/plugin install ai-generation-skills@baoyu-skills
/plugin install utility-skills@baoyu-skills
```

**Option 3: Ask the Agent**

Simply tell Claude Code:

> Please install Skills from github.com/JimLiu/baoyu-skills

### Available Plugins

| Plugin | Description | Skills |
|--------|-------------|--------|
| **content-skills** | Content generation and publishing | [xhs-images](#baoyu-xhs-images), [infographic](#baoyu-infographic), [cover-image](#baoyu-cover-image), [slide-deck](#baoyu-slide-deck), [comic](#baoyu-comic), [article-illustrator](#baoyu-article-illustrator), [post-to-x](#baoyu-post-to-x), [post-to-wechat](#baoyu-post-to-wechat) |
| **ai-generation-skills** | AI-powered generation backends | [image-gen](#baoyu-image-gen), [danger-gemini-web](#baoyu-danger-gemini-web) |
| **utility-skills** | Utility tools for content processing | [url-to-markdown](#baoyu-url-to-markdown), [danger-x-to-markdown](#baoyu-danger-x-to-markdown), [compress-image](#baoyu-compress-image) |

## Update Skills

To update skills to the latest version:

1. Run `/plugin` in Claude Code
2. Switch to **Marketplaces** tab (use arrow keys or Tab)
3. Select **baoyu-skills**
4. Choose **Update marketplace**

You can also **Enable auto-update** to get the latest versions automatically.

![Update Skills](./screenshots/update-plugins.png)

## Available Skills

Skills are organized into three categories:

### Content Skills

Content generation and publishing skills.

#### baoyu-xhs-images

Xiaohongshu (RedNote) infographic series generator. Breaks down content into 1-10 cartoon-style infographics with **Style × Layout** two-dimensional system.

```bash
# Auto-select style and layout
/baoyu-xhs-images posts/ai-future/article.md

# Specify style
/baoyu-xhs-images posts/ai-future/article.md --style notion

# Specify layout
/baoyu-xhs-images posts/ai-future/article.md --layout dense

# Combine style and layout
/baoyu-xhs-images posts/ai-future/article.md --style tech --layout list

# Direct content input
/baoyu-xhs-images 今日星座运势
```

**Styles** (visual aesthetics): `cute` (default), `fresh`, `warm`, `bold`, `minimal`, `retro`, `pop`, `notion`, `chalkboard`

**Style Previews**:

| | | |
|:---:|:---:|:---:|
| ![cute](./screenshots/xhs-images-styles/cute.webp) | ![fresh](./screenshots/xhs-images-styles/fresh.webp) | ![warm](./screenshots/xhs-images-styles/warm.webp) |
| cute | fresh | warm |
| ![bold](./screenshots/xhs-images-styles/bold.webp) | ![minimal](./screenshots/xhs-images-styles/minimal.webp) | ![retro](./screenshots/xhs-images-styles/retro.webp) |
| bold | minimal | retro |
| ![pop](./screenshots/xhs-images-styles/pop.webp) | ![notion](./screenshots/xhs-images-styles/notion.webp) | ![chalkboard](./screenshots/xhs-images-styles/chalkboard.webp) |
| pop | notion | chalkboard |

**Layouts** (information density):
| Layout | Density | Best for |
|--------|---------|----------|
| `sparse` | 1-2 pts | Covers, quotes |
| `balanced` | 3-4 pts | Regular content |
| `dense` | 5-8 pts | Knowledge cards, cheat sheets |
| `list` | 4-7 items | Checklists, rankings |
| `comparison` | 2 sides | Before/after, pros/cons |
| `flow` | 3-6 steps | Processes, timelines |

**Layout Previews**:

| | | |
|:---:|:---:|:---:|
| ![sparse](./screenshots/xhs-images-layouts/sparse.webp) | ![balanced](./screenshots/xhs-images-layouts/balanced.webp) | ![dense](./screenshots/xhs-images-layouts/dense.webp) |
| sparse | balanced | dense |
| ![list](./screenshots/xhs-images-layouts/list.webp) | ![comparison](./screenshots/xhs-images-layouts/comparison.webp) | ![flow](./screenshots/xhs-images-layouts/flow.webp) |
| list | comparison | flow |

#### baoyu-infographic

Generate professional infographics with 20 layout types and 17 visual styles. Analyzes content, recommends layout×style combinations, and generates publication-ready infographics.

```bash
# Auto-recommend combinations based on content
/baoyu-infographic path/to/content.md

# Specify layout
/baoyu-infographic path/to/content.md --layout pyramid

# Specify style (default: craft-handmade)
/baoyu-infographic path/to/content.md --style technical-schematic

# Specify both
/baoyu-infographic path/to/content.md --layout funnel --style corporate-memphis

# With aspect ratio
/baoyu-infographic path/to/content.md --aspect portrait
```

**Options**:
| Option | Description |
|--------|-------------|
| `--layout <name>` | Information layout (20 options) |
| `--style <name>` | Visual style (17 options, default: craft-handmade) |
| `--aspect <ratio>` | landscape (16:9), portrait (9:16), square (1:1) |
| `--lang <code>` | Output language (en, zh, ja, etc.) |

**Layouts** (information structure):

| Layout | Best For |
|--------|----------|
| `bridge` | Problem-solution, gap-crossing |
| `circular-flow` | Cycles, recurring processes |
| `comparison-table` | Multi-factor comparisons |
| `do-dont` | Correct vs incorrect practices |
| `equation` | Formula breakdown, input-output |
| `feature-list` | Product features, bullet points |
| `fishbone` | Root cause analysis |
| `funnel` | Conversion processes, filtering |
| `grid-cards` | Multiple topics, overview |
| `iceberg` | Surface vs hidden aspects |
| `journey-path` | Customer journey, milestones |
| `layers-stack` | Technology stack, layers |
| `mind-map` | Brainstorming, idea mapping |
| `nested-circles` | Levels of influence, scope |
| `priority-quadrants` | Eisenhower matrix, 2x2 |
| `pyramid` | Hierarchy, Maslow's needs |
| `scale-balance` | Pros vs cons, weighing |
| `timeline-horizontal` | History, chronological events |
| `tree-hierarchy` | Org charts, taxonomy |
| `venn` | Overlapping concepts |

**Layout Previews**:

| | | |
|:---:|:---:|:---:|
| ![bridge](./screenshots/infographic-layouts/bridge.webp) | ![circular-flow](./screenshots/infographic-layouts/circular-flow.webp) | ![comparison-table](./screenshots/infographic-layouts/comparison-table.webp) |
| bridge | circular-flow | comparison-table |
| ![do-dont](./screenshots/infographic-layouts/do-dont.webp) | ![equation](./screenshots/infographic-layouts/equation.webp) | ![feature-list](./screenshots/infographic-layouts/feature-list.webp) |
| do-dont | equation | feature-list |
| ![fishbone](./screenshots/infographic-layouts/fishbone.webp) | ![funnel](./screenshots/infographic-layouts/funnel.webp) | ![grid-cards](./screenshots/infographic-layouts/grid-cards.webp) |
| fishbone | funnel | grid-cards |
| ![iceberg](./screenshots/infographic-layouts/iceberg.webp) | ![journey-path](./screenshots/infographic-layouts/journey-path.webp) | ![layers-stack](./screenshots/infographic-layouts/layers-stack.webp) |
| iceberg | journey-path | layers-stack |
| ![mind-map](./screenshots/infographic-layouts/mind-map.webp) | ![nested-circles](./screenshots/infographic-layouts/nested-circles.webp) | ![priority-quadrants](./screenshots/infographic-layouts/priority-quadrants.webp) |
| mind-map | nested-circles | priority-quadrants |
| ![pyramid](./screenshots/infographic-layouts/pyramid.webp) | ![scale-balance](./screenshots/infographic-layouts/scale-balance.webp) | ![timeline-horizontal](./screenshots/infographic-layouts/timeline-horizontal.webp) |
| pyramid | scale-balance | timeline-horizontal |
| ![tree-hierarchy](./screenshots/infographic-layouts/tree-hierarchy.webp) | ![venn](./screenshots/infographic-layouts/venn.webp) | |
| tree-hierarchy | venn | |

**Styles** (visual aesthetics):

| Style | Description |
|-------|-------------|
| `craft-handmade` (Default) | Hand-drawn illustration, paper craft aesthetic |
| `claymation` | 3D clay figures, playful stop-motion |
| `kawaii` | Japanese cute, big eyes, pastel colors |
| `storybook-watercolor` | Soft painted illustrations, whimsical |
| `chalkboard` | Colorful chalk on black board |
| `cyberpunk-neon` | Neon glow on dark, futuristic |
| `bold-graphic` | Comic style, halftone dots, high contrast |
| `aged-academia` | Vintage science, sepia sketches |
| `corporate-memphis` | Flat vector people, vibrant fills |
| `technical-schematic` | Blueprint, isometric 3D, engineering |
| `origami` | Folded paper forms, geometric |
| `pixel-art` | Retro 8-bit, nostalgic gaming |
| `ui-wireframe` | Grayscale boxes, interface mockup |
| `subway-map` | Transit diagram, colored lines |
| `ikea-manual` | Minimal line art, assembly style |
| `knolling` | Organized flat-lay, top-down |
| `lego-brick` | Toy brick construction, playful |

**Style Previews**:

| | | |
|:---:|:---:|:---:|
| ![craft-handmade](./screenshots/infographic-styles/craft-handmade.webp) | ![claymation](./screenshots/infographic-styles/claymation.webp) | ![kawaii](./screenshots/infographic-styles/kawaii.webp) |
| craft-handmade | claymation | kawaii |
| ![storybook-watercolor](./screenshots/infographic-styles/storybook-watercolor.webp) | ![chalkboard](./screenshots/infographic-styles/chalkboard.webp) | ![cyberpunk-neon](./screenshots/infographic-styles/cyberpunk-neon.webp) |
| storybook-watercolor | chalkboard | cyberpunk-neon |
| ![bold-graphic](./screenshots/infographic-styles/bold-graphic.webp) | ![aged-academia](./screenshots/infographic-styles/aged-academia.webp) | ![corporate-memphis](./screenshots/infographic-styles/corporate-memphis.webp) |
| bold-graphic | aged-academia | corporate-memphis |
| ![technical-schematic](./screenshots/infographic-styles/technical-schematic.webp) | ![origami](./screenshots/infographic-styles/origami.webp) | ![pixel-art](./screenshots/infographic-styles/pixel-art.webp) |
| technical-schematic | origami | pixel-art |
| ![ui-wireframe](./screenshots/infographic-styles/ui-wireframe.webp) | ![subway-map](./screenshots/infographic-styles/subway-map.webp) | ![ikea-manual](./screenshots/infographic-styles/ikea-manual.webp) |
| ui-wireframe | subway-map | ikea-manual |
| ![knolling](./screenshots/infographic-styles/knolling.webp) | ![lego-brick](./screenshots/infographic-styles/lego-brick.webp) | |
| knolling | lego-brick | |

#### baoyu-cover-image

Generate cover images for articles with Type × Style two-dimension system.

```bash
# Auto-select type and style based on content
/baoyu-cover-image path/to/article.md

# Specify type and/or style
/baoyu-cover-image path/to/article.md --type conceptual --style blueprint
/baoyu-cover-image path/to/article.md --style warm

# Specify aspect ratio (default: 2.35:1)
/baoyu-cover-image path/to/article.md --aspect 16:9

# Without title text
/baoyu-cover-image path/to/article.md --no-title
```

Available types: `hero`, `conceptual`, `typography`, `metaphor`, `scene`, `minimal`

Available styles: `elegant` (default), `blueprint`, `bold-editorial`, `chalkboard`, `dark-atmospheric`, `editorial-infographic`, `fantasy-animation`, `flat-doodle`, `intuition-machine`, `minimal`, `nature`, `notion`, `pixel-art`, `playful`, `retro`, `sketch-notes`, `vector-illustration`, `vintage`, `warm`, `watercolor`

**Style Previews**:

| | | |
|:---:|:---:|:---:|
| ![elegant](./screenshots/cover-image-styles/elegant.webp) | ![blueprint](./screenshots/cover-image-styles/blueprint.webp) | ![bold-editorial](./screenshots/cover-image-styles/bold-editorial.webp) |
| elegant | blueprint | bold-editorial |
| ![chalkboard](./screenshots/cover-image-styles/chalkboard.webp) | ![dark-atmospheric](./screenshots/cover-image-styles/dark-atmospheric.webp) | ![editorial-infographic](./screenshots/cover-image-styles/editorial-infographic.webp) |
| chalkboard | dark-atmospheric | editorial-infographic |
| ![fantasy-animation](./screenshots/cover-image-styles/fantasy-animation.webp) | ![intuition-machine](./screenshots/cover-image-styles/intuition-machine.webp) | ![minimal](./screenshots/cover-image-styles/minimal.webp) |
| fantasy-animation | intuition-machine | minimal |
| ![nature](./screenshots/cover-image-styles/nature.webp) | ![notion](./screenshots/cover-image-styles/notion.webp) | ![pixel-art](./screenshots/cover-image-styles/pixel-art.webp) |
| nature | notion | pixel-art |
| ![playful](./screenshots/cover-image-styles/playful.webp) | ![retro](./screenshots/cover-image-styles/retro.webp) | ![sketch-notes](./screenshots/cover-image-styles/sketch-notes.webp) |
| playful | retro | sketch-notes |
| ![vector-illustration](./screenshots/cover-image-styles/vector-illustration.webp) | ![vintage](./screenshots/cover-image-styles/vintage.webp) | ![warm](./screenshots/cover-image-styles/warm.webp) |
| vector-illustration | vintage | warm |
| ![watercolor](./screenshots/cover-image-styles/watercolor.webp) | ![flat-doodle](./screenshots/cover-image-styles/flat-doodle.webp) | |
| watercolor | flat-doodle | |

#### baoyu-slide-deck

Generate professional slide deck images from content. Creates comprehensive outlines with style instructions, then generates individual slide images.

```bash
# From markdown file
/baoyu-slide-deck path/to/article.md

# With style and audience
/baoyu-slide-deck path/to/article.md --style corporate
/baoyu-slide-deck path/to/article.md --audience executives

# Outline only (no image generation)
/baoyu-slide-deck path/to/article.md --outline-only

# With language
/baoyu-slide-deck path/to/article.md --lang zh
```

**Styles** (visual aesthetics):

| Style | Description | Best For |
|-------|-------------|----------|
| `blueprint` (default) | Technical schematics, grid texture, engineering precision | Architecture, system design |
| `notion` | SaaS dashboard aesthetic, card-based layouts, clean data focus | Product demos, SaaS, B2B |
| `bold-editorial` | High-impact magazine style, bold typography, dark backgrounds | Product launches, keynotes |
| `corporate` | Navy/gold palette, structured layouts, professional icons | Investor decks, proposals |
| `dark-atmospheric` | Cinematic dark mode, glowing accents, atmospheric depth | Entertainment, gaming, creative |
| `editorial-infographic` | Magazine-style explainers, flat illustrations | Tech explainers, research |
| `fantasy-animation` | Whimsical Ghibli/Disney style, hand-drawn animation | Educational, storytelling |
| `intuition-machine` | Technical briefing, bilingual labels, aged paper texture | Technical docs, bilingual |
| `minimal` | Ultra-clean, maximum whitespace, single accent color | Executive briefings, premium |
| `pixel-art` | Retro 8-bit aesthetic, chunky pixels, nostalgic gaming | Gaming, developer talks |
| `scientific` | Academic diagrams, biological pathways, precise labeling | Biology, chemistry, medical |
| `sketch-notes` | Hand-drawn feel, soft brush strokes, warm background | Educational, tutorials |
| `vector-illustration` | Flat vector, black outlines, retro soft colors | Creative proposals, explainers |
| `vintage` | Aged-paper aesthetic, historical document styling | Historical, heritage, biography |
| `watercolor` | Soft hand-painted textures, natural warmth | Lifestyle, wellness, travel |

**Style Previews**:

| | | |
|:---:|:---:|:---:|
| ![blueprint](./screenshots/slide-deck-styles/blueprint.webp) | ![chalkboard](./screenshots/slide-deck-styles/chalkboard.webp) | ![bold-editorial](./screenshots/slide-deck-styles/bold-editorial.webp) |
| blueprint | chalkboard | bold-editorial |
| ![corporate](./screenshots/slide-deck-styles/corporate.webp) | ![dark-atmospheric](./screenshots/slide-deck-styles/dark-atmospheric.webp) | ![editorial-infographic](./screenshots/slide-deck-styles/editorial-infographic.webp) |
| corporate | dark-atmospheric | editorial-infographic |
| ![fantasy-animation](./screenshots/slide-deck-styles/fantasy-animation.webp) | ![intuition-machine](./screenshots/slide-deck-styles/intuition-machine.webp) | ![minimal](./screenshots/slide-deck-styles/minimal.webp) |
| fantasy-animation | intuition-machine | minimal |
| ![notion](./screenshots/slide-deck-styles/notion.webp) | ![pixel-art](./screenshots/slide-deck-styles/pixel-art.webp) | ![scientific](./screenshots/slide-deck-styles/scientific.webp) |
| notion | pixel-art | scientific |
| ![sketch-notes](./screenshots/slide-deck-styles/sketch-notes.webp) | ![vector-illustration](./screenshots/slide-deck-styles/vector-illustration.webp) | ![vintage](./screenshots/slide-deck-styles/vintage.webp) |
| sketch-notes | vector-illustration | vintage |
| ![watercolor](./screenshots/slide-deck-styles/watercolor.webp) | | |
| watercolor | | |

After generation, slides are automatically merged into a `.pptx` file for easy sharing.

#### baoyu-comic

Knowledge comic creator with flexible art style × tone combinations. Creates original educational comics with detailed panel layouts and sequential image generation.

```bash
# From source material (auto-selects art + tone)
/baoyu-comic posts/turing-story/source.md

# Specify art style and tone
/baoyu-comic posts/turing-story/source.md --art manga --tone warm
/baoyu-comic posts/turing-story/source.md --art ink-brush --tone dramatic

# Use preset (includes special rules)
/baoyu-comic posts/turing-story/source.md --style ohmsha
/baoyu-comic posts/turing-story/source.md --style wuxia

# Specify layout and aspect ratio
/baoyu-comic posts/turing-story/source.md --layout cinematic
/baoyu-comic posts/turing-story/source.md --aspect 16:9

# Specify language
/baoyu-comic posts/turing-story/source.md --lang zh

# Direct content input
/baoyu-comic "The story of Alan Turing and the birth of computer science"
```

**Options**:
| Option | Values |
|--------|--------|
| `--art` | `ligne-claire` (default), `manga`, `realistic`, `ink-brush`, `chalk` |
| `--tone` | `neutral` (default), `warm`, `dramatic`, `romantic`, `energetic`, `vintage`, `action` |
| `--style` | `ohmsha`, `wuxia`, `shoujo` (presets with special rules) |
| `--layout` | `standard` (default), `cinematic`, `dense`, `splash`, `mixed`, `webtoon` |
| `--aspect` | `3:4` (default, portrait), `4:3` (landscape), `16:9` (widescreen) |
| `--lang` | `auto` (default), `zh`, `en`, `ja`, etc. |

**Art Styles** (rendering technique):

| Art Style | Description |
|-----------|-------------|
| `ligne-claire` | Uniform lines, flat colors, European comic tradition (Tintin, Logicomix) |
| `manga` | Large eyes, manga conventions, expressive emotions |
| `realistic` | Digital painting, realistic proportions, sophisticated |
| `ink-brush` | Chinese brush strokes, ink wash effects |
| `chalk` | Chalkboard aesthetic, hand-drawn warmth |

**Tones** (mood/atmosphere):

| Tone | Description |
|------|-------------|
| `neutral` | Balanced, rational, educational |
| `warm` | Nostalgic, personal, comforting |
| `dramatic` | High contrast, intense, powerful |
| `romantic` | Soft, beautiful, decorative elements |
| `energetic` | Bright, dynamic, exciting |
| `vintage` | Historical, aged, period authenticity |
| `action` | Speed lines, impact effects, combat |

**Presets** (art + tone + special rules):

| Preset | Equivalent | Special Rules |
|--------|-----------|---------------|
| `ohmsha` | manga + neutral | Visual metaphors, NO talking heads, gadget reveals |
| `wuxia` | ink-brush + action | Qi effects, combat visuals, atmospheric elements |
| `shoujo` | manga + romantic | Decorative elements, eye details, romantic beats |

**Layouts** (panel arrangement):
| Layout | Panels/Page | Best for |
|--------|-------------|----------|
| `standard` | 4-6 | Dialogue, narrative flow |
| `cinematic` | 2-4 | Dramatic moments, establishing shots |
| `dense` | 6-9 | Technical explanations, timelines |
| `splash` | 1-2 large | Key moments, revelations |
| `mixed` | 3-7 varies | Complex narratives, emotional arcs |
| `webtoon` | 3-5 vertical | Ohmsha tutorials, mobile reading |

**Layout Previews**:

| | | |
|:---:|:---:|:---:|
| ![standard](./screenshots/comic-layouts/standard.webp) | ![cinematic](./screenshots/comic-layouts/cinematic.webp) | ![dense](./screenshots/comic-layouts/dense.webp) |
| standard | cinematic | dense |
| ![splash](./screenshots/comic-layouts/splash.webp) | ![mixed](./screenshots/comic-layouts/mixed.webp) | ![webtoon](./screenshots/comic-layouts/webtoon.webp) |
| splash | mixed | webtoon |

#### baoyu-article-illustrator

Smart article illustration skill with Type × Style two-dimension approach. Analyzes article structure, identifies positions requiring visual aids, and generates illustrations.

```bash
# Auto-select type and style based on content
/baoyu-article-illustrator path/to/article.md

# Specify type
/baoyu-article-illustrator path/to/article.md --type infographic

# Specify style
/baoyu-article-illustrator path/to/article.md --style blueprint

# Combine type and style
/baoyu-article-illustrator path/to/article.md --type flowchart --style notion
```

**Types** (information structure):

| Type | Description | Best For |
|------|-------------|----------|
| `infographic` | Data visualization, charts, metrics | Technical articles, data analysis |
| `scene` | Atmospheric illustration, mood rendering | Narrative, personal stories |
| `flowchart` | Process diagrams, step visualization | Tutorials, workflows |
| `comparison` | Side-by-side, before/after contrast | Product comparisons |
| `framework` | Concept maps, relationship diagrams | Methodologies, architecture |
| `timeline` | Chronological progression | History, project progress |

**Styles** (visual aesthetics):

| Style | Description | Best For |
|-------|-------------|----------|
| `notion` (default) | Minimalist hand-drawn line art | Knowledge sharing, SaaS, productivity |
| `elegant` | Refined, sophisticated | Business, thought leadership |
| `warm` | Friendly, approachable | Personal growth, lifestyle |
| `minimal` | Ultra-clean, zen-like | Philosophy, minimalism |
| `blueprint` | Technical schematics | Architecture, system design |
| `watercolor` | Soft artistic with natural warmth | Lifestyle, travel, creative |
| `editorial` | Magazine-style infographic | Tech explainers, journalism |
| `scientific` | Academic precise diagrams | Biology, chemistry, technical |

**Style Previews**:

| | | |
|:---:|:---:|:---:|
| ![notion](./screenshots/article-illustrator-styles/notion.webp) | ![elegant](./screenshots/article-illustrator-styles/elegant.webp) | ![warm](./screenshots/article-illustrator-styles/warm.webp) |
| notion | elegant | warm |
| ![minimal](./screenshots/article-illustrator-styles/minimal.webp) | ![blueprint](./screenshots/article-illustrator-styles/blueprint.webp) | ![watercolor](./screenshots/article-illustrator-styles/watercolor.webp) |
| minimal | blueprint | watercolor |
| ![editorial](./screenshots/article-illustrator-styles/editorial.webp) | ![scientific](./screenshots/article-illustrator-styles/scientific.webp) | |
| editorial | scientific | |

#### baoyu-post-to-x

Post content and articles to X (Twitter). Supports regular posts with images and X Articles (long-form Markdown). Uses real Chrome with CDP to bypass anti-automation.

```bash
# Post with text
/baoyu-post-to-x "Hello from Claude Code!"

# Post with images
/baoyu-post-to-x "Check this out" --image photo.png

# Post X Article
/baoyu-post-to-x --article path/to/article.md
```

#### baoyu-post-to-wechat

Post content to WeChat Official Account (微信公众号). Two modes available:

**Image-Text (图文)** - Multiple images with short title/content:

```bash
/baoyu-post-to-wechat 图文 --markdown article.md --images ./photos/
/baoyu-post-to-wechat 图文 --markdown article.md --image img1.png --image img2.png --image img3.png
/baoyu-post-to-wechat 图文 --title "标题" --content "内容" --image img1.png --submit
```

**Article (文章)** - Full markdown/HTML with rich formatting:

```bash
/baoyu-post-to-wechat 文章 --markdown article.md
/baoyu-post-to-wechat 文章 --markdown article.md --theme grace
/baoyu-post-to-wechat 文章 --html article.html
```

Prerequisites: Google Chrome installed. First run requires QR code login (session preserved).

### AI Generation Skills

AI-powered generation backends.

#### baoyu-image-gen

AI SDK-based image generation using official OpenAI and Google APIs. Supports text-to-image, reference images, aspect ratios, and quality presets.

```bash
# Basic generation (auto-detect provider)
/baoyu-image-gen --prompt "A cute cat" --image cat.png

# With aspect ratio
/baoyu-image-gen --prompt "A landscape" --image landscape.png --ar 16:9

# High quality (2k)
/baoyu-image-gen --prompt "A banner" --image banner.png --quality 2k

# Specific provider
/baoyu-image-gen --prompt "A cat" --image cat.png --provider openai

# With reference images (Google multimodal only)
/baoyu-image-gen --prompt "Make it blue" --image out.png --ref source.png
```

**Options**:
| Option | Description |
|--------|-------------|
| `--prompt`, `-p` | Prompt text |
| `--promptfiles` | Read prompt from files (concatenated) |
| `--image` | Output image path (required) |
| `--provider` | `google` or `openai` (default: google) |
| `--model`, `-m` | Model ID |
| `--ar` | Aspect ratio (e.g., `16:9`, `1:1`, `4:3`) |
| `--size` | Size (e.g., `1024x1024`) |
| `--quality` | `normal` or `2k` (default: normal) |
| `--ref` | Reference images (Google multimodal only) |

**Environment Variables** (see [Environment Configuration](#environment-configuration) for setup):
| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | - |
| `GOOGLE_API_KEY` | Google API key | - |
| `OPENAI_IMAGE_MODEL` | OpenAI model | `gpt-image-1.5` |
| `GOOGLE_IMAGE_MODEL` | Google model | `gemini-3-pro-image-preview` |
| `OPENAI_BASE_URL` | Custom OpenAI endpoint | - |
| `GOOGLE_BASE_URL` | Custom Google endpoint | - |

**Provider Auto-Selection**:
1. If `--provider` specified → use it
2. If only one API key available → use that provider
3. If both available → default to Google

#### baoyu-danger-gemini-web

Interacts with Gemini Web to generate text and images.

**Text Generation:**

```bash
/baoyu-danger-gemini-web "Hello, Gemini"
/baoyu-danger-gemini-web --prompt "Explain quantum computing"
```

**Image Generation:**

```bash
/baoyu-danger-gemini-web --prompt "A cute cat" --image cat.png
/baoyu-danger-gemini-web --promptfiles system.md content.md --image out.png
```

### Utility Skills

Utility tools for content processing.

#### baoyu-url-to-markdown

Fetch any URL via Chrome CDP and convert to clean markdown. Supports two capture modes for different scenarios.

```bash
# Auto mode (default) - capture when page loads
/baoyu-url-to-markdown https://example.com/article

# Wait mode - for login-required pages
/baoyu-url-to-markdown https://example.com/private --wait

# Save to specific file
/baoyu-url-to-markdown https://example.com/article -o output.md
```

**Capture Modes**:
| Mode | Description | Best For |
|------|-------------|----------|
| Auto (default) | Captures immediately after page load | Public pages, static content |
| Wait (`--wait`) | Waits for user signal before capture | Login-required, dynamic content |

**Options**:
| Option | Description |
|--------|-------------|
| `<url>` | URL to fetch |
| `-o <path>` | Output file path |
| `--wait` | Wait for user signal before capturing |
| `--timeout <ms>` | Page load timeout (default: 30000) |

#### baoyu-danger-x-to-markdown

Converts X (Twitter) content to markdown format. Supports tweet threads and X Articles.

```bash
# Convert tweet to markdown
/baoyu-danger-x-to-markdown https://x.com/username/status/123456

# Save to specific file
/baoyu-danger-x-to-markdown https://x.com/username/status/123456 -o output.md

# JSON output
/baoyu-danger-x-to-markdown https://x.com/username/status/123456 --json
```

**Supported URLs:**
- `https://x.com/<user>/status/<id>`
- `https://twitter.com/<user>/status/<id>`
- `https://x.com/i/article/<id>`

**Authentication:** Uses environment variables (`X_AUTH_TOKEN`, `X_CT0`) or Chrome login for cookie-based auth.

#### baoyu-compress-image

Compress images to reduce file size while maintaining quality.

```bash
/baoyu-compress-image path/to/image.png
/baoyu-compress-image path/to/images/ --quality 80
```

## Environment Configuration

Some skills require API keys or custom configuration. Environment variables can be set in `.env` files:

**Load Priority** (higher priority overrides lower):
1. CLI environment variables (e.g., `OPENAI_API_KEY=xxx /baoyu-image-gen ...`)
2. `process.env` (system environment)
3. `<cwd>/.baoyu-skills/.env` (project-level)
4. `~/.baoyu-skills/.env` (user-level)

**Setup**:

```bash
# Create user-level config directory
mkdir -p ~/.baoyu-skills

# Create .env file
cat > ~/.baoyu-skills/.env << 'EOF'
# OpenAI
OPENAI_API_KEY=sk-xxx
OPENAI_IMAGE_MODEL=gpt-image-1.5
# OPENAI_BASE_URL=https://api.openai.com/v1

# Google
GOOGLE_API_KEY=xxx
GOOGLE_IMAGE_MODEL=gemini-3-pro-image-preview
# GOOGLE_BASE_URL=https://generativelanguage.googleapis.com/v1beta
EOF
```

**Project-level config** (for team sharing):

```bash
mkdir -p .baoyu-skills
# Add .baoyu-skills/.env to .gitignore to avoid committing secrets
echo ".baoyu-skills/.env" >> .gitignore
```

## Customization

All skills support customization via `EXTEND.md` files. Create an extension file to override default styles, add custom configurations, or define your own presets.

**Extension paths** (checked in priority order):
1. `.baoyu-skills/<skill-name>/EXTEND.md` - Project-level (for team/project-specific settings)
2. `~/.baoyu-skills/<skill-name>/EXTEND.md` - User-level (for personal preferences)

**Example**: To customize `baoyu-cover-image` with your brand colors:

```bash
mkdir -p .baoyu-skills/baoyu-cover-image
```

Then create `.baoyu-skills/baoyu-cover-image/EXTEND.md`:

```markdown
## Custom Styles

### brand
- Primary color: #1a73e8
- Secondary color: #34a853
- Font style: Modern sans-serif
- Always include company logo watermark
```

The extension content will be loaded before skill execution and override defaults.

## Disclaimer

### baoyu-danger-gemini-web

This skill uses the Gemini Web API (reverse-engineered).

**Warning:** This project uses unofficial API access via browser cookies. Use at your own risk.

- First run opens a browser to authenticate with Google
- Cookies are cached for subsequent runs
- No guarantees on API stability or availability

**Supported browsers** (auto-detected): Google Chrome, Chrome Canary/Beta, Chromium, Microsoft Edge

**Proxy configuration**: If you need a proxy to access Google services (e.g., in China), set environment variables inline:

```bash
HTTP_PROXY=http://127.0.0.1:7890 HTTPS_PROXY=http://127.0.0.1:7890 /baoyu-danger-gemini-web "Hello"
```

### baoyu-danger-x-to-markdown

This skill uses a reverse-engineered X (Twitter) API.

**Warning:** This is NOT an official API. Use at your own risk.

- May break without notice if X changes their API
- Account restrictions possible if API usage detected
- First use requires consent acknowledgment
- Authentication via environment variables or Chrome login

## License

MIT
