# Changelog

[English](./CHANGELOG.md) | 中文

## 1.24.0 - 2026-01-27

### 新功能
- `baoyu-post-to-wechat`：复用已打开的 Chrome 浏览器，无需关闭所有窗口 (by @AliceLJY)。

### 修复
- `baoyu-post-to-wechat`：改进标题提取，支持 h1/h2 标题；新增摘要自动填充和粘贴/输入后内容验证；支持 HTML meta 标签属性顺序灵活匹配。

### 文档
- `release-skills`：在发布流程中新增第三方贡献者署名规则。
- 补全历史 changelog 中缺失的第三方贡献者署名。

## 1.23.1 - 2026-01-27

### 修复
- `baoyu-compress-image`：压缩后将原始文件重命名为 `_original` 备份，不再删除。

## 1.23.0 - 2026-01-26

### 重构
- `baoyu-cover-image`：将 20 种固定风格替换为五维系统（类型 × 配色 × 渲染 × 文字 × 氛围）。9 种配色方案 × 6 种渲染风格 = 54 种组合。新增风格预设实现向后兼容，v2→v3 配置迁移，以及新的引用文件结构（`palettes/`、`renderings/`、`workflow/`）。

## 1.22.0 - 2026-01-25

### 新功能
- `baoyu-article-illustrator`：新增 `imgs-subdir` 输出目录选项；改进风格选择，始终询问并展示 EXTEND.md 中的 preferred_style。
- `baoyu-cover-image`：新增 `default_output_dir` 偏好设置，支持 `same-dir`、`imgs-subdir` 和 `independent` 选项，新增 Step 1.5 输出目录选择流程。
- `baoyu-post-to-wechat`：发布前新增主题选择（default/grace/simple）；新增 HTML 预览步骤；图片占位符简化为 `WECHATIMGPH_N` 格式；重构复制粘贴为跨平台辅助函数。

### 重构
- `baoyu-post-to-x`：图片占位符从 `[[IMAGE_PLACEHOLDER_N]]` 简化为 `XIMGPH_N` 格式。

## 1.21.4 - 2026-01-25

### 修复
- `baoyu-post-to-wechat`：新增 Windows 兼容性——使用 `fileURLToPath` 正确解析路径，将系统依赖的复制粘贴工具（osascript/xdotool）替换为 CDP 键盘事件，实现跨平台支持 (by @JadeLiang003)。
- `baoyu-post-to-wechat`：修复 Windows 兼容性 PR 引入的回退问题——修正错误的 `-fixed` 文件名引用、恢复 frontmatter 引号剥离、恢复 `--title` CLI 参数、修复摘要提取逻辑以正确跳过标题/引用/列表、修复单横线参数解析、移除调试日志。
- `baoyu-article-illustrator`、`baoyu-cover-image`、`baoyu-xhs-images`：移除水印配置中的透明度选项。

## 1.21.3 - 2026-01-24

### 重构
- `baoyu-article-illustrator`：简化 SKILL.md，提取内容至引用文件——新增 `references/usage.md` 用于命令语法，`references/prompt-construction.md` 用于提示词模板。工作流从 5 步重组为 6 步，新增 Pre-check 预检阶段。新增 `default_output_dir` 偏好设置选项。

## 1.21.2 - 2026-01-24

### 新功能
- `baoyu-image-gen`：添加并行生成文档，推荐使用 4 个并发 subagent 进行批量操作。

### 文档
- `release-skills`：新增按 skill/module 分组提交流程和发布前用户确认步骤。

## 1.21.1 - 2026-01-24

### 文档
- `baoyu-comic`：在角色参考图生成后添加压缩步骤，减少作为参考图使用时的 token 消耗。

## 1.21.0 - 2026-01-24

### 新功能
- `baoyu-cover-image`：扩展宽高比选项——新增 4:3、3:2、3:4 比例；默认值从 2.35:1 改为 16:9 以提高通用性。现在除非通过 `--aspect` 标志明确指定，否则始终确认宽高比。
- `baoyu-image-gen`：重构 Google provider 以统一支持 Gemini 多模态和 Imagen 模型。为 Gemini 模型新增 `--imageSize` 参数支持（1K/2K/4K）。

## 1.20.0 - 2026-01-24

### 新功能
- `baoyu-cover-image`：从类型 × 风格二维系统升级为**四维系统**——新增 `--text` 维度（none 无文字、title-only 仅标题、title-subtitle 标题+副标题、text-rich 丰富文字）控制文字密度，新增 `--mood` 维度（subtle 低调、balanced 平衡、bold 醒目）控制情感强度。新增 `--quick` 标志跳过确认，直接使用自动选择。

### 文档
- `baoyu-cover-image`：新增维度参考文件——`references/dimensions/text.md`（文字密度级别）和 `references/dimensions/mood.md`（氛围强度级别）。
- `baoyu-cover-image`：更新 base-prompt、first-time-setup 和 preferences-schema 以支持新的四维系统及 v2 配置模式。
- `README.md`、`README.zh.md`：更新 baoyu-cover-image 文档，反映新的四维系统及 `--text`、`--mood`、`--quick` 选项。

## 1.19.0 - 2026-01-24

### 新功能
- `baoyu-comic`：新增部分工作流选项——`--storyboard-only`、`--prompts-only`、`--images-only` 和 `--regenerate N`，实现灵活的工作流控制。
- `baoyu-image-gen`：新增 `--imageSize` 参数用于 Google 提供商（1K/2K/4K），默认质量改为 2k。
- `baoyu-image-gen`：新增 `GEMINI_API_KEY` 作为 `GOOGLE_API_KEY` 的别名。

### 重构
- `baoyu-comic`：将详细工作流提取至 `references/workflow.md`，SKILL.md 减少约 400 行，功能完整保留。
- `baoyu-comic`：将内容信号分析提取至 `references/auto-selection.md`，部分工作流文档提取至 `references/partial-workflows.md`。
- `baoyu-image-gen`：代码模块化——类型定义提取至 `types.ts`，provider 实现提取至 `providers/google.ts` 和 `providers/openai.ts`。

### 文档
- `baoyu-comic`：改进 ohmsha 预设文档，明确默认哆啦A梦角色定义和视觉描述。

## 1.18.3 - 2026-01-23

### 文档
- `baoyu-comic`：改进角色参考处理流程，新增明确的 Strategy A/B 选择逻辑——Strategy A 使用 `--ref` 参数（适用于支持该参数的技能），Strategy B 将角色描述嵌入提示词（适用于不支持的技能）。包含两种方法的具体代码示例。

### 修复
- `baoyu-image-gen`：从多模态模型列表中移除不支持的 Gemini 模型（`gemini-2.0-flash-exp-image-generation`、`gemini-2.5-flash-preview-native-audio-dialog`）。

## 1.18.2 - 2026-01-23

### 重构
- 精简 7 个技能的 SKILL.md 文档（`baoyu-compress-image`、`baoyu-danger-gemini-web`、`baoyu-danger-x-to-markdown`、`baoyu-image-gen`、`baoyu-post-to-wechat`、`baoyu-post-to-x`、`baoyu-url-to-markdown`），遵循官方最佳实践——总文档量减少约 300 行，功能完整保留。

### 文档
- `CLAUDE.md`：新增官方技能编写最佳实践链接、技能加载规则、描述编写指南和渐进式披露模式。

## 1.18.1 - 2026-01-23

### 文档
- `baoyu-slide-deck`：进度清单新增详细子步骤（1.1-1.3），标记 Step 1.3 为必须步骤并提供明确的 Bash 检查命令用于检测已存在目录。

## 1.18.0 - 2026-01-23

### 新功能
- `baoyu-slide-deck`：引入基于维度的风格系统——将单一风格定义重构为模块化四维架构：**纹理** (clean 纯净、grid 网格、organic 有机、pixel 像素、paper 纸张)、**氛围** (professional 专业、warm 温暖、cool 冷静、vibrant 鲜艳、dark 暗色、neutral 中性)、**字体** (geometric 几何、humanist 人文、handwritten 手写、editorial 编辑、technical 技术)、**密度** (minimal 极简、balanced 均衡、dense 密集)。16 种预设映射到特定维度组合，并提供「自定义维度」选项实现完全灵活配置。
- `baoyu-slide-deck`：新增两轮确认工作流——第一轮询问风格/受众/页数/审核偏好，第二轮（可选）在用户选择「自定义维度」时收集具体维度选择。
- `baoyu-slide-deck`：新增条件性大纲和提示词审核——用户可跳过审核以加快生成，或启用审核以获得更多控制。

### 文档
- `baoyu-slide-deck`：新增维度参考文件——`references/dimensions/texture.md`、`references/dimensions/mood.md`、`references/dimensions/typography.md`、`references/dimensions/density.md`，以及 `references/dimensions/presets.md`（预设到维度的映射）。
- `baoyu-slide-deck`：新增设计指南——`references/design-guidelines.md`，包含受众原则、视觉层次、内容密度、配色选择、字体排版和字体推荐。
- `baoyu-slide-deck`：新增布局参考——`references/layouts.md`，包含布局选项和选择技巧。
- `baoyu-slide-deck`：新增偏好配置模式——`references/config/preferences-schema.md`，用于 EXTEND.md 配置。

## 1.17.1 - 2026-01-23

### 重构
- `baoyu-infographic`：精简 SKILL.md 文档——移除冗余内容，优化工作流描述，提升可读性。
- `baoyu-xhs-images`：优化 Step 0（加载偏好设置）文档——新增更清晰的首次设置流程，使用可视化表格和明确的路径检查指令。

### 改进
- `baoyu-infographic`：增强 `craft-handmade` 风格的手绘规则——要求所有图像必须保持卡通/插画风格，禁止写实或照片元素。

## 1.17.0 - 2026-01-23

### 新功能
- `baoyu-cover-image`：新增用户偏好设置支持（通过 EXTEND.md 配置）——可设置水印（内容、位置、透明度）、首选类型/风格、默认宽高比和自定义风格。新增 Step 0 检查项目级（`.baoyu-skills/`）或用户级（`~/.baoyu-skills/`）偏好设置，首次使用时引导设置。

### 重构
- `baoyu-cover-image`：重构为类型 × 风格二维系统——新增 6 种类型（`hero` 主视觉、`conceptual` 概念、`typography` 文字、`metaphor` 隐喻、`scene` 场景、`minimal` 极简）控制视觉构图，20 种风格控制美学表现。新增 `--type` 和 `--aspect` 选项、类型 × 风格兼容性矩阵，以及带进度清单的结构化工作流。

### 文档
- `baoyu-cover-image`：新增三个参考文档——`references/config/preferences-schema.md`（EXTEND.md YAML 配置模式）、`references/config/first-time-setup.md`（首次设置流程）、`references/config/watermark-guide.md`（水印配置指南）。
- `README.md`、`README.zh.md`：更新 baoyu-cover-image 文档，反映新的类型 × 风格系统及 `--type` 和 `--aspect` 选项。

## 1.16.0 - 2026-01-23

### 新功能
- `baoyu-article-illustrator`：新增用户偏好设置支持（通过 EXTEND.md 配置）——可设置水印（内容、位置、透明度）、首选类型/风格和自定义风格。新增 Step 1.1 检查项目级（`.baoyu-skills/`）或用户级（`~/.baoyu-skills/`）偏好设置，首次使用时引导设置。

### 重构
- `baoyu-article-illustrator`：重构为类型 × 风格二维系统——将 20+ 种单维风格替换为模块化的类型（infographic 信息图、scene 场景、flowchart 流程图、comparison 对比、framework 框架、timeline 时间线）× 风格（notion、elegant、warm、minimal、blueprint、watercolor、editorial、scientific）架构。新增 `--type` 和 `--density` 选项、类型 × 风格兼容性矩阵，以及结构化提示词构建模板。

### 文档
- `baoyu-article-illustrator`：新增三个参考文档——`references/styles.md`（风格库和兼容性矩阵）、`references/config/preferences-schema.md`（EXTEND.md YAML 配置模式）、`references/config/first-time-setup.md`（首次设置流程）。
- `README.md`、`README.zh.md`：更新 baoyu-article-illustrator 文档，反映新的类型 × 风格系统及 `--type` 和 `--style` 选项。

## 1.15.3 - 2026-01-23

### 重构
- `baoyu-comic`：风格系统重构为三维架构——将 10 个单一风格文件拆分为模块化的 `art-styles/`（5 种画风：ligne-claire 清线、manga 日漫、realistic 写实、ink-brush 水墨、chalk 粉笔）、`tones/`（7 种基调：neutral 中性、warm 温馨、dramatic 戏剧、romantic 浪漫、energetic 活力、vintage 复古、action 动作）和 `presets/`（3 种预设：ohmsha、wuxia 武侠、shoujo 少女漫画）。新的画风 × 基调 × 布局系统支持灵活组合，同时预设保留特定类型的专属规则。

### 文档
- `release-skills`：新增 Step 5（检查 README 更新）——确保发布时 README 文档与代码变更保持同步。
- `README.md`、`README.zh.md`：更新 baoyu-comic 文档，反映新的 `--art` 和 `--tone` 选项（替代原 `--style`）。

## 1.15.2 - 2026-01-23

### 文档
- `release-skills`：SKILL.md 全面重写——新增多语言 changelog 支持、.releaserc.yml 配置文件、dry-run 模式、语言检测规则、7 种语言的章节标题翻译。

## 1.15.1 - 2026-01-22

### 重构
- `baoyu-xhs-images`：参考文档模块化重构——将分散的文件整理为 `config/`（配置设置）、`elements/`（视觉构建块）、`presets/`（风格预设）、`workflows/`（流程指南）四个目录，提升可维护性。

## 1.15.0 - 2026-01-22

### 新功能
- `baoyu-xhs-images`：新增用户偏好设置支持（通过 EXTEND.md 配置）——可设置水印（内容、位置、透明度）、首选风格、首选布局和自定义风格。新增 Step 0 检查项目级（`.baoyu-skills/`）或用户级（`~/.baoyu-skills/`）偏好设置，首次使用时引导设置。

### 文档
- `baoyu-xhs-images`：新增三个参考文档——`preferences-schema.md`（YAML 配置模式）、`watermark-guide.md`（水印位置和透明度指南）、`first-time-setup.md`（首次设置流程）。

## 1.14.0 - 2026-01-22

### 修复
- `baoyu-post-to-x`：改进视频就绪检测，提升视频发布稳定性 (by @fkysly)。

### 文档
- `baoyu-slide-deck`：SKILL.md 全面增强——新增幻灯片数量指南（推荐 8-25 张，最多 30 张）、受众指南表格及各受众特定原则、风格选择原则与内容类型推荐、布局选择技巧与常见错误提示、视觉层次原则、内容密度指南（麦肯锡风格高密度原则）、配色选择指南、字体排版原则与字体推荐（中英文字体及多语言搭配方案）、视觉元素参考（背景处理、字体处理、几何装饰）。

## 1.13.0 - 2026-01-21

### 新功能
- `baoyu-url-to-markdown`：新增 URL 转 Markdown 工具技能，通过 Chrome CDP 抓取任意网页并转换为干净的 Markdown 格式。支持两种抓取模式——自动模式（页面加载后立即抓取）和等待模式（用户控制抓取时机，适用于需要登录的页面）。

### 改进
- `baoyu-xhs-images`：更新风格推荐——将 `tech` 风格引用替换为 `notion` 和 `chalkboard`，用于技术和教育内容。

## 1.12.0 - 2026-01-21

### 新功能
- `baoyu-post-to-x`：新增引用推文（Quote Tweet）支持 (by @threehotpot-bot)。

### 重构
- `baoyu-post-to-x`：提取公共工具函数到 `x-utils.ts`——将 `x-article.ts`、`x-browser.ts`、`x-quote.ts`、`x-video.ts` 中重复的 Chrome 检测、CDP 连接、剪贴板操作等功能整合为统一的可复用模块。

## 1.11.0 - 2026-01-21

### 新功能
- `baoyu-image-gen`：新增基于 AI SDK 的图像生成技能，使用官方 OpenAI 和 Google API。支持文生图、参考图（Google 多模态）、宽高比和质量预设（`normal`、`2k`）。根据可用的 API 密钥自动选择服务商。
- `baoyu-slide-deck`：新增布局库（Layout Gallery），包含 24 种布局类型——10 种幻灯片专用布局（`title-hero` 标题主图、`quote-callout` 引用突出、`key-stat` 关键数据、`split-screen` 分屏、`icon-grid` 图标网格、`two-columns` 双栏、`three-columns` 三栏、`image-caption` 图片说明、`agenda` 议程、`bullet-list` 要点列表）和 14 种信息图衍生布局（`linear-progression` 线性流程、`binary-comparison` 二元对比、`comparison-matrix` 对比矩阵、`hierarchical-layers` 层级、`hub-spoke` 中心辐射、`bento-grid` 便当盒、`funnel` 漏斗、`dashboard` 仪表盘、`venn-diagram` 韦恩图、`circular-flow` 循环流程、`winding-roadmap` 蜿蜒路线图、`tree-branching` 树状分支、`iceberg` 冰山、`bridge` 桥接）。

### 文档
- `README.md`、`README.zh.md`：新增 baoyu-image-gen 文档，包含用法示例、选项表和环境变量说明；新增环境配置章节，介绍 API 密钥设置方法。

## 1.10.0 - 2026-01-21

### 新功能
- `baoyu-post-to-x`：新增视频发布支持——新增 `x-video.ts` 脚本，支持发布带视频的推文（MP4、MOV、WebM 格式）。支持预览模式，自动处理视频上传等待 (by @fkysly)。

## 1.9.0 - 2026-01-20

### 新功能
- `baoyu-xhs-images`：新增 `chalkboard`（黑板）风格——黑色黑板背景配彩色粉笔绘画，适合教育和教程内容。
- `baoyu-comic`：新增 `chalkboard`（黑板）风格——黑色黑板上的教育粉笔画，适合教程、讲解和知识漫画。

### 改进
- `baoyu-article-illustrator`、`baoyu-cover-image`、`baoyu-infographic`：更新 `chalkboard` 风格，增强视觉指南。

### 破坏性变更
- `baoyu-xhs-images`：移除 `tech` 风格（技术内容改用 `minimal` 或 `notion` 风格）。

### 文档
- `README.md`、`README.zh.md`：新增 xhs-images 风格和布局预览图库（9 种风格、6 种布局）。

## 1.8.0 - 2026-01-20

### 新功能
- `baoyu-infographic`：新增专业信息图生成技能，支持 20 种布局类型（bridge 桥接、circular-flow 循环流程、comparison-table 对比表、do-dont 正误对比、equation 公式分解、feature-list 特性列表、fishbone 鱼骨图、funnel 漏斗、grid-cards 网格卡片、iceberg 冰山、journey-path 旅程路径、layers-stack 层级堆叠、mind-map 思维导图、nested-circles 嵌套圆、priority-quadrants 优先象限、pyramid 金字塔、scale-balance 天平、timeline-horizontal 时间线、tree-hierarchy 树状层级、venn 韦恩图）和 17 种视觉风格。智能分析内容、推荐布局×风格组合，生成发布级信息图。

### 修复
- `baoyu-danger-gemini-web`：改进 cookie 验证逻辑，通过验证实际 Gemini 会话可用性而非仅检查 cookie 存在。

## 1.7.0 - 2026-01-19

### 新功能
- `baoyu-comic`：新增 `shoujo`（少女漫画）风格——经典少女漫画风格，大眼睛闪亮高光、花朵星星装饰、柔和粉紫色调。适合恋爱、青春成长、友情、情感故事。

## 1.6.0 - 2026-01-19

### 新功能
- `baoyu-cover-image`：新增 `flat-doodle`（扁平涂鸦）风格——粗黑色轮廓线、明亮粉彩色、简单扁平形状、可爱圆润比例。适合生产力、SaaS、工作流内容。
- `baoyu-article-illustrator`：新增 `flat-doodle`（扁平涂鸦）风格——同样的视觉风格用于文章插图。

## 1.5.0 - 2026-01-19

### 新功能
- `baoyu-article-illustrator`：风格库扩展至 20 种——将风格定义提取到 `references/styles/` 目录，新增 11 种风格（`blueprint`（蓝图）、`chalkboard`（黑板）、`editorial`（杂志信息图）、`fantasy-animation`（奇幻动画）、`flat`（扁平矢量）、`intuition-machine`（技术简报）、`pixel-art`（像素艺术）、`retro`（复古）、`scientific`（科学图解）、`sketch-notes`（手绘笔记）、`vector-illustration`（矢量插画）、`vintage`（复古文献）、`watercolor`（水彩））。

### 破坏性变更
- `baoyu-article-illustrator`：移除 `tech`、`bold`、`isometric` 风格。
- `baoyu-cover-image`：移除 `bold` 风格（大胆编辑内容改用 `bold-editorial` 风格）。

### 文档
- `README.md`、`README.zh.md`：新增 article-illustrator 风格预览图库（20 种风格）。

## 1.4.2 - 2026-01-19

### 文档
- `baoyu-danger-gemini-web`：添加支持的浏览器列表（Chrome、Chromium、Edge）和代理配置指南。

## 1.4.1 - 2026-01-18

### 修复
- `baoyu-post-to-x`：支持 X Articles 多语言 UI 选择器 (by @ianchenx)。

## 1.4.0 - 2026-01-18

### 新功能
- `baoyu-cover-image`：风格库从 8 个扩展至 19 个，新增 12 种风格——`blueprint`（蓝图）、`bold-editorial`（大胆编辑）、`chalkboard`（黑板）、`dark-atmospheric`（暗黑氛围）、`editorial-infographic`（杂志信息图）、`fantasy-animation`（奇幻动画）、`intuition-machine`（技术简报）、`notion`（Notion 风格）、`pixel-art`（像素艺术）、`sketch-notes`（手绘笔记）、`vector-illustration`（矢量插画）、`vintage`（复古文献）、`watercolor`（水彩）。
- `baoyu-slide-deck`：新增 `chalkboard`（黑板）风格——黑色黑板背景配彩色粉笔绘画，适合教育和教程内容。

### 破坏性变更
- `baoyu-cover-image`：移除 `tech` 风格（技术内容改用 `blueprint` 或 `editorial-infographic` 风格）。

### 文档
- `README.md`、`README.zh.md`：更新 cover-image 和 slide-deck 风格预览截图。

## 1.3.0 - 2026-01-18

### 新功能
- `baoyu-comic`：新增 `wuxia` 武侠风格——港漫武侠风格，水墨笔触、动态打斗、气功特效。适用于武侠、仙侠、中国历史小说。
- `baoyu-comic`：README 新增风格和布局预览截图（8 种风格 + 6 种布局）。

### 重构
- `baoyu-comic`：移除 `tech` 风格（技术内容改用 `ohmsha` 风格）。

## 1.2.0 - 2026-01-18

### 新功能
- Session 独立输出目录：每次生成创建独立目录（`<skill-suffix>/<topic-slug>/`），即使是同一源文件也会新建目录。目录冲突时追加时间戳。
- 多源文件支持：源文件现以 `source-{slug}.{ext}` 命名，支持多个输入（文本、图片、会话中的文件）。

### 文档
- `CLAUDE.md`：更新 Output Path Convention，采用新的 session 独立目录结构和多源文件命名规范。
- 多个技能：更新文件管理部分，反映新的目录和源文件规范。
  - `baoyu-slide-deck`、`baoyu-article-illustrator`、`baoyu-cover-image`、`baoyu-xhs-images`、`baoyu-comic`

## 1.1.0 - 2026-01-18

### 新功能
- `baoyu-compress-image`：新增跨平台图片压缩技能。默认转换为 WebP 格式，支持 PNG 转 PNG。自动选择系统工具（sips、cwebp、ImageMagick），Sharp 作为兜底方案。

### 重构
- Marketplace 结构重组：将插件分为三大类——`content-skills`（内容技能）、`ai-generation-skills`（AI 生成技能）和 `utility-skills`（工具技能），便于管理和发现。

### 文档
- `CLAUDE.md`、`README.md`、`README.zh.md`：更新技能架构文档，反映新的三类分组结构。

## 1.0.1 - 2026-01-18

### 重构
- 代码结构优化，提升可读性和可维护性。
- `baoyu-slide-deck`：统一风格参考文件格式。

### 其他
- 截图：从 PNG 转换为 WebP 格式，减小文件体积；新增新风格的截图。

## 1.0.0 - 2026-01-18

### 新功能
- `baoyu-danger-x-to-markdown`：新增技能，将 X/Twitter 帖子和线程转换为 Markdown 格式。

### 破坏性变更
- `baoyu-gemini-web` 重命名为 `baoyu-danger-gemini-web`，以提示使用逆向工程 API 的潜在风险。

## 0.11.0 - 2026-01-18

### 新功能
- `baoyu-danger-gemini-web`：新增 Disclaimer 同意检查流程——首次使用前需用户确认接受，同意状态按平台持久化存储。

## 0.10.0 - 2026-01-18

### 新功能
- `baoyu-slide-deck`：风格库从 10 个扩展至 15 个，新增 8 种风格——`dark-atmospheric`（暗黑氛围）、`editorial-infographic`（杂志信息图）、`fantasy-animation`（奇幻动画）、`intuition-machine`（技术简报）、`pixel-art`（像素艺术）、`scientific`（科学图解）、`vintage`（复古文献）、`watercolor`（水彩手绘）。

### 破坏性变更
- `baoyu-slide-deck`：移除 3 种风格（`playful`、`storytelling`、`warm`）；默认风格从 `notion` 改为 `blueprint`。

## 0.9.0 - 2026-01-17

### 新功能
- 扩展支持：所有技能现支持通过 `EXTEND.md` 文件自定义。检查 `.baoyu-skills/<skill-name>/EXTEND.md`（项目级）或 `~/.baoyu-skills/<skill-name>/EXTEND.md`（用户级）配置自定义样式与设置。

### 其他
- `.gitignore`：添加 `.baoyu-skills/` 目录忽略，存放用户扩展文件。

## 0.8.2 - 2026-01-17

### 重构
- `baoyu-danger-gemini-web`：重组脚本架构——将模块文件移至 `gemini-webapi/` 子目录，并更新 SKILL.md 使用 `${SKILL_DIR}` 路径引用。

## 0.8.1 - 2026-01-17

### 重构
- `baoyu-danger-gemini-web`：重构脚本架构——将 10 个分散的脚本文件整合为结构化的 `gemini-webapi/` 模块（gemini_webapi Python 库的 TypeScript 移植版）。

## 0.8.0 - 2026-01-17

### 新功能
- `baoyu-xhs-images`：新增内容分析框架（`analysis-framework.md`、`outline-template.md`），提供结构化内容拆解与大纲生成方案。

### 文档
- `CLAUDE.md`：新增 Output Path Convention（目录结构、备份规则）和 Image Naming Convention（文件命名格式、slug 规则），统一图片生成输出规范。
- 多个技能：更新文件管理规范，采用统一目录结构（`[source-name-no-ext]/<skill-suffix>/`）。
  - `baoyu-article-illustrator`、`baoyu-comic`、`baoyu-cover-image`、`baoyu-slide-deck`、`baoyu-xhs-images`

## 0.7.0 - 2026-01-17

### 新功能
- `baoyu-comic`：新增 `--aspect`（3:4、4:3、16:9）和 `--lang` 选项；引入多变体分镜工作流（时间线、主题、人物视角），支持用户选择最佳方案。

### 增强
- `baoyu-comic`：新增 `analysis-framework.md` 和 `storyboard-template.md`，提供结构化内容分析与变体生成框架。
- `baoyu-slide-deck`：新增 `analysis-framework.md`、`content-rules.md`、`modification-guide.md`、`outline-template.md` 参考文档，提升大纲质量。
- `baoyu-article-illustrator`、`baoyu-cover-image`、`baoyu-xhs-images`：SKILL.md 文档增强，工作流程更清晰。

### 文档
- 多个技能：重构 SKILL.md 结构，将详细内容移至 `references/` 目录，便于维护。
- `baoyu-slide-deck`：精简 SKILL.md，整合风格描述。

## 0.6.1 - 2026-01-17

- `baoyu-slide-deck`：新增 `scripts/merge-to-pdf.ts`，可将生成的 slide 图片一键合并为 PDF；文档补充导出步骤与产物命名（pptx/pdf）。
- `baoyu-comic`：新增 `scripts/merge-to-pdf.ts`，将封面/分页图片合并为 PDF；补充角色参考（图片/文本）处理说明。
- 文档规范：在 `CLAUDE.md` 中补充“Script Directory”模板；`baoyu-danger-gemini-web` / `baoyu-slide-deck` / `baoyu-comic` 文档统一用 `${SKILL_DIR}` 引用脚本路径，方便 agent 在任意安装目录运行。

## 0.6.0 - 2026-01-17

- `baoyu-slide-deck`：新增 `scripts/merge-to-pptx.ts`，将生成的 slide 图片合并为 PPTX，并可把 `prompts/` 写入 speaker notes。
- `baoyu-slide-deck`：风格库重组与扩充（新增 `blueprint` / `bold-editorial` / `sketch-notes` / `vector-illustration`，并调整/替换部分旧风格定义）。
- `baoyu-comic`：新增 `realistic` 风格参考文件。
- 文档：README / README.zh 同步更新技能说明与用法示例。

## 0.5.3 - 2026-01-17

- `baoyu-post-to-x`（X Articles）：插图占位符替换更稳定——选中占位符增加重试与校验，改用 Backspace 删除并确认删除后再粘贴图片，降低插图错位/替换失败概率。

## 0.5.2 - 2026-01-16

- `baoyu-danger-gemini-web`：新增 `--sessionId`（本地持久化会话，支持 `--list-sessions`），用于多轮对话/多图生成保持上下文一致。
- `baoyu-danger-gemini-web`：新增 `--reference/--ref` 传入参考图片（vision 输入），并增强超时与 cookie 失效自动恢复逻辑。
- `baoyu-xhs-images` / `baoyu-slide-deck` / `baoyu-comic`：文档补充 session 约定（整套图使用同一 `sessionId`，增强风格一致性）。

## 0.5.1 - 2026-01-16

- `baoyu-comic`：补齐创作模板与参考（角色模板、Ohmsha 教学漫画指南、大纲模板），更适合从“设定 → 分镜 → 生成”快速落地。

## 0.5.0 - 2026-01-16

- 新增 `baoyu-comic`：知识漫画生成器，支持 `style × layout` 组合，并提供风格/布局参考文件用于稳定出图。
- `baoyu-xhs-images`：将 Style/Layout 的细节从 SKILL.md 拆分到 `references/styles/*` 与 `references/layouts/*`，并将基础提示词迁移到 `references/base-prompt.md`，便于维护和复用。
- `baoyu-slide-deck` / `baoyu-cover-image`：同样将基础提示词与风格拆分到 `references/`，降低 SKILL.md 复杂度，便于扩展更多风格。
- 文档：README / README.zh 更新技能清单与用法示例。

## 0.4.2 - 2026-01-15

- `baoyu-danger-gemini-web`：描述信息更新，明确其作为 `cover-image` / `xhs-images` / `article-illustrator` 等技能的图片生成后端。

## 0.4.1 - 2026-01-15

- `baoyu-post-to-x` / `baoyu-post-to-wechat`：新增 `scripts/paste-from-clipboard.ts`，通过系统级 Cmd/Ctrl+V 发送“真实粘贴”按键，规避 CDP 合成事件在站点侧被忽略的问题。
- `baoyu-post-to-x`：补充 X Articles/普通推文的操作文档（`references/articles.md`、`references/regular-posts.md`），并将发图流程改为优先使用“真实粘贴”（保留 CDP 兜底）。
- `baoyu-post-to-wechat`：文档补充脚本目录说明与 `${SKILL_DIR}` 路径写法，便于 agent 可靠定位脚本。
- 文档：新增插件更新流程截图 `screenshots/update-plugins.png`。

## 0.4.0 - 2026-01-15

- 技能命名统一加 `baoyu-` 前缀：目录结构、marketplace 清单与文档示例命令同步更新，减少与其它插件技能的命名冲突。

## 0.3.1 - 2026-01-15

- `xhs-images`：升级为 Style × Layout 二维系统（新增 `--layout`、自动布局选择与 Notion 风格），文档示例更完整。
- `article-illustrator` / `slide-deck` / `cover-image`：文档改为“选择可用的图片生成技能”而非强绑定 `gemini-web`，并补充 Notion 风格相关说明。
- 工程化：`.gitignore` 增加 `.DS_Store` 忽略；README / README.zh 同步调整。

## 0.3.0 - 2026-01-14

- 新增 `post-to-wechat`：基于 Chrome CDP 自动化发布公众号图文/文章，包含 Markdown → 微信 HTML 转换与多主题样式支持。
- 新增 `CLAUDE.md`：补充仓库结构、运行方式与添加新技能的约定，方便协作与二次开发。
- 文档：README / README.zh 更新安装、更新与使用说明。

## 0.2.0 - 2026-01-13

- 新增技能：`post-to-x`（真实 Chrome/CDP 自动化发布推文与 X Articles）、`article-illustrator`（文章智能插图规划）、`cover-image`（文章封面图生成）、`slide-deck`（幻灯片大纲与图片生成）。
- `xhs-images`：新增 `--style` 多风格与自动风格选择，并更新基础提示词（例如语言随内容、强调手绘信息图等）。
- 文档：新增 `README.zh.md`，并完善 README 与 `.gitignore`。

## 0.1.1 - 2026-01-13

- marketplace 结构重构：引入 `metadata`（含 `version`），插件名调整为 `content-skills` 并显式列出可安装 skills；移除旧 `.claude-plugin/plugin.json`。
- 新增 `xhs-images`：小红书信息图系列生成技能（拆解内容、生成 outline 与提示词）。
- `gemini-web`：新增 `--promptfiles`，支持从多个文件拼接 prompt（便于 system/content 分离）。
- 文档：新增 `README.md`。

## 0.1.0 - 2026-01-13

- 初始发布：提供 `.claude-plugin/marketplace.json` 与 `gemini-web`（文本/图片生成、cookie 登录与缓存流程）。
