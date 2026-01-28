# baoyu-skills

[English](./README.md) | 中文

宝玉分享的 Claude Code 技能集，提升日常工作效率。

## 前置要求

- 已安装 Node.js 环境
- 能够运行 `npx bun` 命令

## 安装

### 快速安装（推荐）

```bash
npx skills add jimliu/baoyu-skills
```

### 注册插件市场

在 Claude Code 中运行：

```bash
/plugin marketplace add jimliu/baoyu-skills
```

### 安装技能

**方式一：通过浏览界面**

1. 选择 **Browse and install plugins**
2. 选择 **baoyu-skills**
3. 选择要安装的插件
4. 选择 **Install now**

**方式二：直接安装**

```bash
# 安装指定插件
/plugin install content-skills@baoyu-skills
/plugin install ai-generation-skills@baoyu-skills
/plugin install utility-skills@baoyu-skills
```

**方式三：告诉 Agent**

直接告诉 Claude Code：

> 请帮我安装 github.com/JimLiu/baoyu-skills 中的 Skills

### 可用插件

| 插件 | 说明 | 包含技能 |
|------|------|----------|
| **content-skills** | 内容生成和发布 | [xhs-images](#baoyu-xhs-images), [infographic](#baoyu-infographic), [cover-image](#baoyu-cover-image), [slide-deck](#baoyu-slide-deck), [comic](#baoyu-comic), [article-illustrator](#baoyu-article-illustrator), [post-to-x](#baoyu-post-to-x), [post-to-wechat](#baoyu-post-to-wechat) |
| **ai-generation-skills** | AI 生成后端 | [image-gen](#baoyu-image-gen), [danger-gemini-web](#baoyu-danger-gemini-web) |
| **utility-skills** | 内容处理工具 | [url-to-markdown](#baoyu-url-to-markdown), [danger-x-to-markdown](#baoyu-danger-x-to-markdown), [compress-image](#baoyu-compress-image) |

## 更新技能

更新技能到最新版本：

1. 在 Claude Code 中运行 `/plugin`
2. 切换到 **Marketplaces** 标签页（使用方向键或 Tab）
3. 选择 **baoyu-skills**
4. 选择 **Update marketplace**

也可以选择 **Enable auto-update** 启用自动更新，每次启动时自动获取最新版本。

![更新技能](./screenshots/update-plugins.png)

## 可用技能

技能分为三大类：

### 内容技能 (Content Skills)

内容生成和发布技能。

#### baoyu-xhs-images

小红书信息图系列生成器。将内容拆解为 1-10 张卡通风格信息图，支持 **风格 × 布局** 二维系统。

```bash
# 自动选择风格和布局
/baoyu-xhs-images posts/ai-future/article.md

# 指定风格
/baoyu-xhs-images posts/ai-future/article.md --style notion

# 指定布局
/baoyu-xhs-images posts/ai-future/article.md --layout dense

# 组合风格和布局
/baoyu-xhs-images posts/ai-future/article.md --style tech --layout list

# 直接输入内容
/baoyu-xhs-images 今日星座运势
```

**风格**（视觉美学）：`cute`（默认）、`fresh`、`warm`、`bold`、`minimal`、`retro`、`pop`、`notion`、`chalkboard`

**风格预览**：

| | | |
|:---:|:---:|:---:|
| ![cute](./screenshots/xhs-images-styles/cute.webp) | ![fresh](./screenshots/xhs-images-styles/fresh.webp) | ![warm](./screenshots/xhs-images-styles/warm.webp) |
| cute | fresh | warm |
| ![bold](./screenshots/xhs-images-styles/bold.webp) | ![minimal](./screenshots/xhs-images-styles/minimal.webp) | ![retro](./screenshots/xhs-images-styles/retro.webp) |
| bold | minimal | retro |
| ![pop](./screenshots/xhs-images-styles/pop.webp) | ![notion](./screenshots/xhs-images-styles/notion.webp) | ![chalkboard](./screenshots/xhs-images-styles/chalkboard.webp) |
| pop | notion | chalkboard |

**布局**（信息密度）：
| 布局 | 密度 | 适用场景 |
|------|------|----------|
| `sparse` | 1-2 点 | 封面、金句 |
| `balanced` | 3-4 点 | 常规内容 |
| `dense` | 5-8 点 | 知识卡片、干货总结 |
| `list` | 4-7 项 | 清单、排行 |
| `comparison` | 双栏 | 对比、优劣 |
| `flow` | 3-6 步 | 流程、时间线 |

**布局预览**：

| | | |
|:---:|:---:|:---:|
| ![sparse](./screenshots/xhs-images-layouts/sparse.webp) | ![balanced](./screenshots/xhs-images-layouts/balanced.webp) | ![dense](./screenshots/xhs-images-layouts/dense.webp) |
| sparse | balanced | dense |
| ![list](./screenshots/xhs-images-layouts/list.webp) | ![comparison](./screenshots/xhs-images-layouts/comparison.webp) | ![flow](./screenshots/xhs-images-layouts/flow.webp) |
| list | comparison | flow |

#### baoyu-infographic

专业信息图生成器，支持 20 种布局和 17 种视觉风格。分析内容后推荐布局×风格组合，生成可发布的信息图。

```bash
# 根据内容自动推荐组合
/baoyu-infographic path/to/content.md

# 指定布局
/baoyu-infographic path/to/content.md --layout pyramid

# 指定风格（默认：craft-handmade）
/baoyu-infographic path/to/content.md --style technical-schematic

# 同时指定布局和风格
/baoyu-infographic path/to/content.md --layout funnel --style corporate-memphis

# 指定比例
/baoyu-infographic path/to/content.md --aspect portrait
```

**选项**：
| 选项 | 说明 |
|------|------|
| `--layout <name>` | 信息布局（20 种选项） |
| `--style <name>` | 视觉风格（17 种选项，默认：craft-handmade） |
| `--aspect <ratio>` | landscape (16:9)、portrait (9:16)、square (1:1) |
| `--lang <code>` | 输出语言（en、zh、ja 等） |

**布局**（信息结构）：

| 布局 | 适用场景 |
|------|----------|
| `bridge` | 问题→解决方案、跨越鸿沟 |
| `circular-flow` | 循环、周期性流程 |
| `comparison-table` | 多因素对比 |
| `do-dont` | 正确 vs 错误做法 |
| `equation` | 公式分解、输入→输出 |
| `feature-list` | 产品功能、要点列表 |
| `fishbone` | 根因分析、鱼骨图 |
| `funnel` | 转化漏斗、筛选过程 |
| `grid-cards` | 多主题概览、卡片网格 |
| `iceberg` | 表面 vs 隐藏层面 |
| `journey-path` | 用户旅程、里程碑 |
| `layers-stack` | 技术栈、分层结构 |
| `mind-map` | 头脑风暴、思维导图 |
| `nested-circles` | 影响层级、范围圈 |
| `priority-quadrants` | 四象限矩阵、优先级 |
| `pyramid` | 层级金字塔、马斯洛需求 |
| `scale-balance` | 利弊权衡、天平对比 |
| `timeline-horizontal` | 历史、时间线事件 |
| `tree-hierarchy` | 组织架构、分类树 |
| `venn` | 重叠概念、韦恩图 |

**布局预览**：

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

**风格**（视觉美学）：

| 风格 | 描述 |
|------|------|
| `craft-handmade`（默认） | 手绘插画、纸艺风格 |
| `claymation` | 3D 黏土人物、定格动画感 |
| `kawaii` | 日系可爱、大眼睛、粉彩色 |
| `storybook-watercolor` | 柔和水彩、童话绘本 |
| `chalkboard` | 彩色粉笔、黑板风格 |
| `cyberpunk-neon` | 霓虹灯光、暗色未来感 |
| `bold-graphic` | 漫画风格、网点、高对比 |
| `aged-academia` | 复古科学、泛黄素描 |
| `corporate-memphis` | 扁平矢量人物、鲜艳填充 |
| `technical-schematic` | 蓝图、等距 3D、工程图 |
| `origami` | 折纸形态、几何感 |
| `pixel-art` | 复古 8-bit、怀旧游戏 |
| `ui-wireframe` | 灰度框图、界面原型 |
| `subway-map` | 地铁图、彩色线路 |
| `ikea-manual` | 极简线条、组装说明风 |
| `knolling` | 整齐平铺、俯视图 |
| `lego-brick` | 乐高积木、童趣拼搭 |

**风格预览**：

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

为文章生成封面图，支持五维定制系统：类型 × 配色 × 渲染 × 文字 × 氛围。9 种配色方案与 6 种渲染风格组合，提供 54 种独特效果。

```bash
# 根据内容自动选择所有维度
/baoyu-cover-image path/to/article.md

# 快速模式：跳过确认，使用自动选择
/baoyu-cover-image path/to/article.md --quick

# 指定维度（5D 系统）
/baoyu-cover-image path/to/article.md --type conceptual --palette cool --rendering digital
/baoyu-cover-image path/to/article.md --text title-subtitle --mood bold

# 风格预设（向后兼容的简写方式）
/baoyu-cover-image path/to/article.md --style blueprint

# 指定宽高比（默认：16:9）
/baoyu-cover-image path/to/article.md --aspect 2.35:1

# 纯视觉（不含标题文字）
/baoyu-cover-image path/to/article.md --no-title
```

**五个维度**：
- **类型 (Type)**：`hero`、`conceptual`、`typography`、`metaphor`、`scene`、`minimal`
- **配色 (Palette)**：`warm`、`elegant`、`cool`、`dark`、`earth`、`vivid`、`pastel`、`mono`、`retro`
- **渲染 (Rendering)**：`flat-vector`、`hand-drawn`、`painterly`、`digital`、`pixel`、`chalk`
- **文字 (Text)**：`none`、`title-only`（默认）、`title-subtitle`、`text-rich`
- **氛围 (Mood)**：`subtle`、`balanced`（默认）、`bold`

#### baoyu-slide-deck

从内容生成专业的幻灯片图片。先创建包含样式说明的完整大纲，然后逐页生成幻灯片图片。

```bash
# 从 markdown 文件生成
/baoyu-slide-deck path/to/article.md

# 指定风格和受众
/baoyu-slide-deck path/to/article.md --style corporate
/baoyu-slide-deck path/to/article.md --audience executives

# 指定页数
/baoyu-slide-deck path/to/article.md --slides 15

# 仅生成大纲（不生成图片）
/baoyu-slide-deck path/to/article.md --outline-only

# 指定语言
/baoyu-slide-deck path/to/article.md --lang zh
```

**选项**：

| 选项 | 说明 |
|------|------|
| `--style <name>` | 视觉风格：预设名称或 `custom` |
| `--audience <type>` | 目标受众：beginners、intermediate、experts、executives、general |
| `--lang <code>` | 输出语言（en、zh、ja 等） |
| `--slides <number>` | 目标页数（推荐 8-25，最多 30） |
| `--outline-only` | 仅生成大纲，跳过图片 |
| `--prompts-only` | 生成大纲 + 提示词，跳过图片 |
| `--images-only` | 从现有提示词生成图片 |
| `--regenerate <N>` | 重新生成指定页：`3` 或 `2,5,8` |

**风格系统**：

风格由 4 个维度组合而成：**纹理** × **氛围** × **字体** × **密度**

| 维度 | 选项 |
|------|------|
| 纹理 | clean 纯净、grid 网格、organic 有机、pixel 像素、paper 纸张 |
| 氛围 | professional 专业、warm 温暖、cool 冷静、vibrant 鲜艳、dark 暗色、neutral 中性 |
| 字体 | geometric 几何、humanist 人文、handwritten 手写、editorial 编辑、technical 技术 |
| 密度 | minimal 极简、balanced 均衡、dense 密集 |

**预设**（预配置的维度组合）：

| 预设 | 维度组合 | 适用场景 |
|------|----------|----------|
| `blueprint`（默认） | grid + cool + technical + balanced | 架构设计、系统设计 |
| `chalkboard` | organic + warm + handwritten + balanced | 教育、教程 |
| `corporate` | clean + professional + geometric + balanced | 投资者演示、提案 |
| `minimal` | clean + neutral + geometric + minimal | 高管简报 |
| `sketch-notes` | organic + warm + handwritten + balanced | 教育、教程 |
| `watercolor` | organic + warm + humanist + minimal | 生活方式、健康 |
| `dark-atmospheric` | clean + dark + editorial + balanced | 娱乐、游戏 |
| `notion` | clean + neutral + geometric + dense | 产品演示、SaaS |
| `bold-editorial` | clean + vibrant + editorial + balanced | 产品发布、主题演讲 |
| `editorial-infographic` | clean + cool + editorial + dense | 科技解说、研究 |
| `fantasy-animation` | organic + vibrant + handwritten + minimal | 教育故事 |
| `intuition-machine` | clean + cool + technical + dense | 技术文档、学术 |
| `pixel-art` | pixel + vibrant + technical + balanced | 游戏、开发者 |
| `scientific` | clean + cool + technical + dense | 生物、化学、医学 |
| `vector-illustration` | clean + vibrant + humanist + balanced | 创意、儿童内容 |
| `vintage` | paper + warm + editorial + balanced | 历史、传记 |

**风格预览**：

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

生成完成后，所有幻灯片会自动合并为 `.pptx` 和 `.pdf` 文件，方便分享。

#### baoyu-comic

知识漫画创作器，支持画风 × 基调灵活组合。创作带有详细分镜布局的原创教育漫画，逐页生成图片。

```bash
# 从素材文件生成（自动选择画风 + 基调）
/baoyu-comic posts/turing-story/source.md

# 指定画风和基调
/baoyu-comic posts/turing-story/source.md --art manga --tone warm
/baoyu-comic posts/turing-story/source.md --art ink-brush --tone dramatic

# 使用预设（包含特殊规则）
/baoyu-comic posts/turing-story/source.md --style ohmsha
/baoyu-comic posts/turing-story/source.md --style wuxia

# 指定布局和比例
/baoyu-comic posts/turing-story/source.md --layout cinematic
/baoyu-comic posts/turing-story/source.md --aspect 16:9

# 指定语言
/baoyu-comic posts/turing-story/source.md --lang zh

# 直接输入内容
/baoyu-comic "图灵的故事与计算机科学的诞生"
```

**选项**：
| 选项 | 取值 |
|------|------|
| `--art` | `ligne-claire`（默认）、`manga`、`realistic`、`ink-brush`、`chalk` |
| `--tone` | `neutral`（默认）、`warm`、`dramatic`、`romantic`、`energetic`、`vintage`、`action` |
| `--style` | `ohmsha`、`wuxia`、`shoujo`（预设，含特殊规则） |
| `--layout` | `standard`（默认）、`cinematic`、`dense`、`splash`、`mixed`、`webtoon` |
| `--aspect` | `3:4`（默认，竖版）、`4:3`（横版）、`16:9`（宽屏） |
| `--lang` | `auto`（默认）、`zh`、`en`、`ja` 等 |

**画风**（渲染技法）：

| 画风 | 描述 |
|------|------|
| `ligne-claire` | 统一线条、平涂色彩，欧洲漫画传统（丁丁、Logicomix） |
| `manga` | 大眼睛、日漫风格、表情丰富 |
| `realistic` | 数字绘画、写实比例、精致细腻 |
| `ink-brush` | 中国水墨笔触、水墨晕染效果 |
| `chalk` | 黑板粉笔风格、手绘温暖感 |

**基调**（氛围/情绪）：

| 基调 | 描述 |
|------|------|
| `neutral` | 平衡、理性、教育性 |
| `warm` | 怀旧、个人化、温馨 |
| `dramatic` | 高对比、紧张、有力 |
| `romantic` | 柔和、唯美、装饰性元素 |
| `energetic` | 明亮、动感、活力 |
| `vintage` | 历史感、做旧、时代真实性 |
| `action` | 速度线、冲击效果、战斗 |

**预设**（画风 + 基调 + 特殊规则）：

| 预设 | 等价于 | 特殊规则 |
|------|--------|----------|
| `ohmsha` | manga + neutral | 视觉比喻、禁止大头对话、道具揭秘 |
| `wuxia` | ink-brush + action | 气功特效、战斗视觉、氛围元素 |
| `shoujo` | manga + romantic | 装饰元素、眼睛细节、浪漫情节 |

**布局**（分镜排列）：
| 布局 | 每页分镜数 | 适用场景 |
|------|-----------|----------|
| `standard` | 4-6 | 对话、叙事推进 |
| `cinematic` | 2-4 | 戏剧性时刻、建立镜头 |
| `dense` | 6-9 | 技术说明、时间线 |
| `splash` | 1-2 大图 | 关键时刻、揭示 |
| `mixed` | 3-7 不等 | 复杂叙事、情感弧线 |
| `webtoon` | 3-5 竖向 | 欧姆社教程、手机阅读 |

**布局预览**：

| | | |
|:---:|:---:|:---:|
| ![standard](./screenshots/comic-layouts/standard.webp) | ![cinematic](./screenshots/comic-layouts/cinematic.webp) | ![dense](./screenshots/comic-layouts/dense.webp) |
| standard | cinematic | dense |
| ![splash](./screenshots/comic-layouts/splash.webp) | ![mixed](./screenshots/comic-layouts/mixed.webp) | ![webtoon](./screenshots/comic-layouts/webtoon.webp) |
| splash | mixed | webtoon |

#### baoyu-article-illustrator

智能文章插图技能，采用类型 × 风格二维系统。分析文章结构，识别需要视觉辅助的位置，生成插图。

```bash
# 根据内容自动选择类型和风格
/baoyu-article-illustrator path/to/article.md

# 指定类型
/baoyu-article-illustrator path/to/article.md --type infographic

# 指定风格
/baoyu-article-illustrator path/to/article.md --style blueprint

# 组合类型和风格
/baoyu-article-illustrator path/to/article.md --type flowchart --style notion
```

**类型**（信息结构）：

| 类型 | 描述 | 适用场景 |
|------|------|----------|
| `infographic` | 数据可视化、图表、指标 | 技术文章、数据分析 |
| `scene` | 氛围插图、情绪渲染 | 叙事、个人故事 |
| `flowchart` | 流程图、步骤可视化 | 教程、工作流 |
| `comparison` | 并排对比、前后对照 | 产品比较 |
| `framework` | 概念图、关系图 | 方法论、架构 |
| `timeline` | 时间线进展 | 历史、项目进度 |

**风格**（视觉美学）：

| 风格 | 描述 | 适用场景 |
|------|------|----------|
| `notion`（默认） | 极简手绘线条画 | 知识分享、SaaS、生产力 |
| `elegant` | 精致、优雅 | 商业、思想领导力 |
| `warm` | 友好、亲切 | 个人成长、生活方式 |
| `minimal` | 极简、禅意 | 哲学、极简主义 |
| `blueprint` | 技术蓝图 | 架构、系统设计 |
| `watercolor` | 柔和艺术感、自然温暖 | 生活方式、旅行、创意 |
| `editorial` | 杂志风格信息图 | 科技解说、新闻 |
| `scientific` | 学术精确图表 | 生物、化学、技术 |

**风格预览**：

| | | |
|:---:|:---:|:---:|
| ![notion](./screenshots/article-illustrator-styles/notion.webp) | ![elegant](./screenshots/article-illustrator-styles/elegant.webp) | ![warm](./screenshots/article-illustrator-styles/warm.webp) |
| notion | elegant | warm |
| ![minimal](./screenshots/article-illustrator-styles/minimal.webp) | ![blueprint](./screenshots/article-illustrator-styles/blueprint.webp) | ![watercolor](./screenshots/article-illustrator-styles/watercolor.webp) |
| minimal | blueprint | watercolor |
| ![editorial](./screenshots/article-illustrator-styles/editorial.webp) | ![scientific](./screenshots/article-illustrator-styles/scientific.webp) | |
| editorial | scientific | |

#### baoyu-post-to-x

发布内容和文章到 X (Twitter)。支持带图片的普通帖子和 X 文章（长篇 Markdown）。使用真实 Chrome + CDP 绕过反自动化检测。

```bash
# 发布文字
/baoyu-post-to-x "Hello from Claude Code!"

# 发布带图片
/baoyu-post-to-x "看看这个" --image photo.png

# 发布 X 文章
/baoyu-post-to-x --article path/to/article.md
```

#### baoyu-post-to-wechat

发布内容到微信公众号，支持两种模式：

**图文模式** - 多图配短标题和正文：

```bash
/baoyu-post-to-wechat 图文 --markdown article.md --images ./photos/
/baoyu-post-to-wechat 图文 --markdown article.md --image img1.png --image img2.png --image img3.png
/baoyu-post-to-wechat 图文 --title "标题" --content "内容" --image img1.png --submit
```

**文章模式** - 完整 markdown/HTML 富文本格式：

```bash
/baoyu-post-to-wechat 文章 --markdown article.md
/baoyu-post-to-wechat 文章 --markdown article.md --theme grace
/baoyu-post-to-wechat 文章 --html article.html
```

前置要求：已安装 Google Chrome，首次运行需扫码登录（登录状态会保存）

### AI 生成技能 (AI Generation Skills)

AI 驱动的生成后端。

#### baoyu-image-gen

基于 AI SDK 的图像生成，使用官方 OpenAI 和 Google API。支持文生图、参考图、宽高比和质量预设。

```bash
# 基础生成（自动检测服务商）
/baoyu-image-gen --prompt "一只可爱的猫" --image cat.png

# 指定宽高比
/baoyu-image-gen --prompt "风景图" --image landscape.png --ar 16:9

# 高质量（2k 分辨率）
/baoyu-image-gen --prompt "横幅图" --image banner.png --quality 2k

# 指定服务商
/baoyu-image-gen --prompt "一只猫" --image cat.png --provider openai

# 带参考图（仅 Google 多模态支持）
/baoyu-image-gen --prompt "把它变成蓝色" --image out.png --ref source.png
```

**选项**：
| 选项 | 说明 |
|------|------|
| `--prompt`, `-p` | 提示词文本 |
| `--promptfiles` | 从文件读取提示词（多文件拼接） |
| `--image` | 输出图片路径（必需） |
| `--provider` | `google` 或 `openai`（默认：google） |
| `--model`, `-m` | 模型 ID |
| `--ar` | 宽高比（如 `16:9`、`1:1`、`4:3`） |
| `--size` | 尺寸（如 `1024x1024`） |
| `--quality` | `normal` 或 `2k`（默认：normal） |
| `--ref` | 参考图片（仅 Google 多模态支持） |

**环境变量**（配置方法见[环境配置](#环境配置)）：
| 变量 | 说明 | 默认值 |
|------|------|--------|
| `OPENAI_API_KEY` | OpenAI API 密钥 | - |
| `GOOGLE_API_KEY` | Google API 密钥 | - |
| `OPENAI_IMAGE_MODEL` | OpenAI 模型 | `gpt-image-1.5` |
| `GOOGLE_IMAGE_MODEL` | Google 模型 | `gemini-3-pro-image-preview` |
| `OPENAI_BASE_URL` | 自定义 OpenAI 端点 | - |
| `GOOGLE_BASE_URL` | 自定义 Google 端点 | - |

**服务商自动选择**：
1. 如果指定了 `--provider` → 使用指定的
2. 如果只有一个 API 密钥 → 使用对应服务商
3. 如果两个都有 → 默认使用 Google

#### baoyu-danger-gemini-web

与 Gemini Web 交互，生成文本和图片。

**文本生成：**

```bash
/baoyu-danger-gemini-web "你好，Gemini"
/baoyu-danger-gemini-web --prompt "解释量子计算"
```

**图片生成：**

```bash
/baoyu-danger-gemini-web --prompt "一只可爱的猫" --image cat.png
/baoyu-danger-gemini-web --promptfiles system.md content.md --image out.png
```

### 工具技能 (Utility Skills)

内容处理工具。

#### baoyu-url-to-markdown

通过 Chrome CDP 抓取任意 URL 并转换为干净的 Markdown。支持两种抓取模式，适应不同场景。

```bash
# 自动模式（默认）- 页面加载后立即抓取
/baoyu-url-to-markdown https://example.com/article

# 等待模式 - 适用于需要登录的页面
/baoyu-url-to-markdown https://example.com/private --wait

# 保存到指定文件
/baoyu-url-to-markdown https://example.com/article -o output.md
```

**抓取模式**：
| 模式 | 说明 | 适用场景 |
|------|------|----------|
| 自动（默认） | 页面加载后立即抓取 | 公开页面、静态内容 |
| 等待（`--wait`） | 等待用户信号后抓取 | 需登录页面、动态内容 |

**选项**：
| 选项 | 说明 |
|------|------|
| `<url>` | 要抓取的 URL |
| `-o <path>` | 输出文件路径 |
| `--wait` | 等待用户信号后抓取 |
| `--timeout <ms>` | 页面加载超时（默认：30000） |

#### baoyu-danger-x-to-markdown

将 X (Twitter) 内容转换为 markdown 格式。支持推文串和 X 文章。

```bash
# 将推文转换为 markdown
/baoyu-danger-x-to-markdown https://x.com/username/status/123456

# 保存到指定文件
/baoyu-danger-x-to-markdown https://x.com/username/status/123456 -o output.md

# JSON 输出
/baoyu-danger-x-to-markdown https://x.com/username/status/123456 --json
```

**支持的 URL：**
- `https://x.com/<user>/status/<id>`
- `https://twitter.com/<user>/status/<id>`
- `https://x.com/i/article/<id>`

**身份验证：** 使用环境变量（`X_AUTH_TOKEN`、`X_CT0`）或 Chrome 登录进行 cookie 认证。

#### baoyu-compress-image

压缩图片以减小文件大小，同时保持质量。

```bash
/baoyu-compress-image path/to/image.png
/baoyu-compress-image path/to/images/ --quality 80
```

## 环境配置

部分技能需要 API 密钥或自定义配置。环境变量可以在 `.env` 文件中设置：

**加载优先级**（高优先级覆盖低优先级）：
1. 命令行环境变量（如 `OPENAI_API_KEY=xxx /baoyu-image-gen ...`）
2. `process.env`（系统环境变量）
3. `<cwd>/.baoyu-skills/.env`（项目级）
4. `~/.baoyu-skills/.env`（用户级）

**配置方法**：

```bash
# 创建用户级配置目录
mkdir -p ~/.baoyu-skills

# 创建 .env 文件
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

**项目级配置**（团队共享）：

```bash
mkdir -p .baoyu-skills
# 将 .baoyu-skills/.env 添加到 .gitignore 避免提交密钥
echo ".baoyu-skills/.env" >> .gitignore
```

## 自定义扩展

所有技能支持通过 `EXTEND.md` 文件自定义。创建扩展文件可覆盖默认样式、添加自定义配置或定义个人预设。

**扩展路径**（按优先级检查）：
1. `.baoyu-skills/<skill-name>/EXTEND.md` - 项目级（团队/项目特定设置）
2. `~/.baoyu-skills/<skill-name>/EXTEND.md` - 用户级（个人偏好设置）

**示例**：为 `baoyu-cover-image` 自定义品牌配色：

```bash
mkdir -p .baoyu-skills/baoyu-cover-image
```

然后创建 `.baoyu-skills/baoyu-cover-image/EXTEND.md`：

```markdown
## 自定义配色

### corporate-tech
- 主色：#1a73e8、#4A90D9
- 背景色：#F5F7FA
- 强调色：#00B4D8、#48CAE4
- 装饰提示：简洁线条、渐变效果
- 适用于：SaaS、企业、技术内容
```

扩展内容会在技能执行前加载，并覆盖默认设置。

## 免责声明

### baoyu-danger-gemini-web

此技能使用 Gemini Web API（逆向工程）。

**警告：** 本项目通过浏览器 cookies 使用非官方 API。使用风险自负。

- 首次运行会打开浏览器进行 Google 身份验证
- Cookies 会被缓存供后续使用
- 不保证 API 的稳定性或可用性

**支持的浏览器**（自动检测）：Google Chrome、Chrome Canary/Beta、Chromium、Microsoft Edge

**代理配置**：如果需要通过代理访问 Google 服务（如中国大陆用户），请在命令前设置环境变量：

```bash
HTTP_PROXY=http://127.0.0.1:7890 HTTPS_PROXY=http://127.0.0.1:7890 /baoyu-danger-gemini-web "你好"
```

### baoyu-danger-x-to-markdown

此技能使用逆向工程的 X (Twitter) API。

**警告：** 这不是官方 API。使用风险自负。

- 如果 X 更改其 API，可能会无预警失效
- 如检测到 API 使用，账号可能受限
- 首次使用需确认免责声明
- 通过环境变量或 Chrome 登录进行身份验证

## 许可证

MIT
