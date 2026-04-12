# Changelog

[English](./CHANGELOG.md) | 中文

## 1.100.0 - 2026-04-12

### 新功能
- `baoyu-imagine`：新增 Z.AI GLM-Image 服务商支持，支持 `glm-image` 和 `cogview-4-250304` 模型，通过 Z.AI 同步图像 API 调用；配置 `ZAI_API_KEY`（或 `BIGMODEL_API_KEY` 向后兼容）

## 1.99.1 - 2026-04-11

### 修复
- `baoyu-article-illustrator`：未指定 `--model` 时，批处理任务中不再写入 `model` 字段，改由 `baoyu-imagine` 从环境变量或配置中解析默认值

## 1.99.0 - 2026-04-10

### 新功能
- `baoyu-diagram`：新增技能，用于生成可直接发布的 SVG 图表 —— 包括流程图、架构/结构图、示意图（直觉图解）。Claude 直接输出符合统一设计规范的真实 SVG 代码，产物是单个自包含的 `.svg` 文件，内嵌样式并自动支持深色模式，可直接嵌入文章、微信公众号、幻灯片和文档中

## 1.98.0 - 2026-04-10

### 新功能
- `baoyu-xhs-images`：恢复为正式技能（移除废弃警告）
- `baoyu-xhs-images`：新增 `sketch-notes` 风格 —— 手绘教育信息图，马卡龙配色，波动线条，暖奶油背景
- `baoyu-xhs-images`：新增配色系统（`macaron`、`warm`、`neon`），支持 `--palette` 参数覆盖风格默认颜色
- `baoyu-xhs-images`：新增 3 个预设：`hand-drawn-edu`、`sketch-card`、`sketch-summary`

## 1.97.1 - 2026-04-09

### 修复
- `baoyu-image-cards`：将配色方案中 "Zone N" 角色名改为 "Block Color"，防止 AI 将标签文字渲染到图片中

## 1.97.0 - 2026-04-09

### 新功能
- `baoyu-image-cards`：新增 `sketch-notes` 风格、配色系统（`macaron`、`warm`、`neon`）及 3 个新预设（`hand-drawn-edu`、`sketch-card`、`sketch-summary`）

### 修复
- `baoyu-xhs-images`：优化已弃用技能描述以改善路由匹配

## 1.96.0 - 2026-04-09

### 新功能
- `baoyu-image-cards`：新增图片卡片系列技能，从 `baoyu-xhs-images` 迁移，解除小红书平台绑定
- `baoyu-xhs-images`：已弃用，迁移至 `baoyu-image-cards`

## 1.95.1 - 2026-04-09

### 修复
- `baoyu-slide-deck`：添加 `pptxgenjs` 依赖，PDF 合并时通过魔数字节检测图片格式替代文件扩展名判断

## 1.95.0 - 2026-04-08

### 新功能
- `baoyu-infographic`：新增 `hand-drawn-edu` 风格 — 马卡龙柔和色块、手绘线条、火柴人角色
- `baoyu-slide-deck`：新增 `hand-drawn-edu` 预设和 `macaron` 色调维度，含柔和马卡龙色板

## 1.94.0 - 2026-04-08

### 新功能
- `baoyu-cover-image`：新增马卡龙色板和 hand-drawn-edu 风格预设

## 1.93.0 - 2026-04-08

### 新功能
- `baoyu-article-illustrator`：新增 `hand-drawn-edu` 预设 — flowchart + sketch-notes + macaron 组合，用于手绘教育图解

### 重构
- `baoyu-article-illustrator`：将色板（Palette）提取为独立的第三维度，形成 Type × Style × Palette 三维系统

### 修复
- `baoyu-article-illustrator`：在工作流中添加显式的风格文件加载步骤

## 1.92.0 - 2026-04-08

### 新功能
- `baoyu-article-illustrator`：新增 `macaron` 风格 — 马卡龙柔和色块（浅蓝、浅绿、浅紫、浅橙）配暖白底色，可选手绘模式；新增 `edu-visual` 预设

## 1.90.1 - 2026-04-05

### 修复
- `baoyu-post-to-wechat`：通过 magic bytes 检测实际图片格式，修复 CDN 返回与 URL 扩展名不一致的 content-type 问题（如 .png URL 实际返回 WebP）；WebP 格式按 PNG 策略处理以保留透明度

## 1.89.1 - 2026-04-01

### 新功能
- `baoyu-chrome-cdp`：新增 `gracefulKillChrome`，等待 Chrome 进程退出并释放端口；修复 `killChrome` 使用 `exitCode`/`signalCode` 替代 `.killed` 以更可靠地检测进程状态
- `baoyu-fetch`：在交互等待模式下自动检测登录状态，未登录时提示用户先登录再提取内容

### 维护
- 同步 vendor baoyu-chrome-cdp 至所有 CDP 技能
- `baoyu-url-to-markdown`：同步 vendor baoyu-fetch 的登录自动检测功能

## 1.89.0 - 2026-03-31

### 新功能
- `baoyu-fetch`：新增 X 会话 Cookie 旁路文件，跨运行持久化登录状态；通过 Browser.close 优雅关闭 Chrome；自动检测并清理过期的 Chrome 配置锁文件
- `baoyu-article-illustrator`：新增暖色调矢量插画配色方案，含 `warm-knowledge` 预设
- `baoyu-post-to-x`：新增登录后 X 会话持久化、Chrome 锁文件恢复和优雅关闭

### 文档
- `baoyu-post-to-weibo`：新增发帖类型自动选择规则，优化 CDP Chrome 终止指令

### 重构
- `baoyu-danger-gemini-web`：使用优雅 Chrome 关闭替代强制终止
- `baoyu-danger-x-to-markdown`：使用优雅 Chrome 关闭替代强制终止

### 修复
- 同步 npm lockfile 及修复根目录 Node 测试

### 维护
- `baoyu-url-to-markdown`：同步 vendor baoyu-fetch 的会话和生命周期改进
- 更新 bun.lock 文件

## 1.88.0 - 2026-03-27

### 新功能
- `baoyu-fetch`：新增 URL 阅读器 CLI 包，支持 Chrome CDP 和站点适配器（X/Twitter、YouTube、Hacker News、通用页面）

### 重构
- `baoyu-url-to-markdown`：用 `baoyu-fetch` CLI 替换自定义 CDP/转换管道
- `shared-skill-packages`：支持 `package.json` 的 `files` 白名单，vendor 同步时过滤测试文件、CHANGELOG 和 `.changeset` 目录

### 修复
- `baoyu-md`：修正测试中图片路径 `images/` 为 `imgs/`

## 1.87.2 - 2026-03-26

### 重构
- `baoyu-translate`：精简翻译提示词，将 15+ 条冗长原则压缩为 7 条，合并分析和审校步骤

## 1.87.1 - 2026-03-26

### 维护
- 在 `baoyu-image-gen` SKILL.md 中添加废弃提示，引导用户使用 `baoyu-imagine`
- 在 CLAUDE.md 中记录废弃技能策略

## 1.87.0 - 2026-03-26

### 维护
- 移除已废弃的 `baoyu-image-gen` 重定向技能及插件清单条目 — 向 `baoyu-imagine` 的迁移已完成

## 1.86.0 - 2026-03-25

### 新功能
- `baoyu-translate`：丰富翻译提示词的分析上下文 — 加入原文语气评估、结构化比喻映射表、理解难点推理、结构性/创造性翻译挑战，以及分块翻译的位置上下文

## 1.85.0 - 2026-03-25

### 新功能
- `baoyu-imagine`：运行时自动迁移旧版 `baoyu-image-gen` 的 EXTEND.md 配置路径
- 新增 `baoyu-image-gen` 废弃重定向技能，引导用户安装 `baoyu-imagine` 并移除旧技能

## 1.84.0 - 2026-03-25

### 新功能
- 将 `baoyu-image-gen` 技能重命名为 `baoyu-imagine` — 更简短的命令名，所有文档、配置和依赖技能中的引用已同步更新

## 1.83.0 - 2026-03-25

### 新功能
- `baoyu-image-gen`：新增 MiniMax 服务商（`image-01` / `image-01-live`），支持 subject_reference 角色/肖像一致性、自定义尺寸和宽高比

## 1.82.0 - 2026-03-24

### 新功能
- `baoyu-url-to-markdown`：新增浏览器回退策略 — 默认无头模式优先，技术故障时自动重试有头 Chrome；新增 `--browser auto|headless|headed` 参数及 `--headless`/`--headed` 快捷方式
- `baoyu-url-to-markdown`：新增内容清理模块，提取前预处理 HTML（移除广告、base64 图片、脚本、样式）
- `baoyu-url-to-markdown`：媒体本地化支持 base64 data URI 图片
- `baoyu-url-to-markdown`：从浏览器捕获最终 URL 以跟踪重定向，用于输出路径生成
- `baoyu-url-to-markdown`：新增 Agent 质量门控文档，规范捕获后的内容验证流程

### 依赖
- `baoyu-url-to-markdown`：升级 defuddle ^0.12.0 → ^0.14.0

### 测试
- `baoyu-url-to-markdown`：新增 content-cleaner、html-to-markdown、legacy-converter、media-localizer 单元测试

## 1.81.0 - 2026-03-24

### 新功能
- `baoyu-youtube-transcript`：YouTube 封锁直连 InnerTube API 时自动回退到 yt-dlp，支持备用客户端身份重试及通过 `YOUTUBE_TRANSCRIPT_COOKIES_FROM_BROWSER` 环境变量传递浏览器 Cookie

### 重构
- `baoyu-youtube-transcript`：将单体脚本拆分为类型化模块（youtube、transcript、storage、shared、types）并添加单元测试

## 1.80.1 - 2026-03-24

### 修复
- `baoyu-image-gen`：修正即梦 API 请求中的 `prompt` 字段名

## 1.80.0 - 2026-03-24

### 新功能
- `baoyu-image-gen`：新增 Azure OpenAI 作为独立图像生成服务商，支持灵活的端点解析、部署名称推断、质量映射及参考图片格式校验

## 1.79.2 - 2026-03-23

### 修复
- `baoyu-cover-image`：简化参考图片处理流程 — 模型支持 `--ref` 时直接传递，仅在模型不支持参考图时创建描述文件
- `baoyu-post-to-weibo`：文章 Markdown 转 HTML 时不传递 --theme 参数

### 测试
- 修复 Node 兼容的解析器测试，添加解析器测试依赖

## 1.79.1 - 2026-03-23

### 修复
- 合并为单一插件，防止 skill 重复注册 (by @TyrealQ)
- `baoyu-article-illustrator`：移除水印提示词中的不透明度参数
- `baoyu-comic`：修正哆啦 A 梦命名间距，移除水印不透明度参数
- `baoyu-xhs-images`：移除水印不透明度参数，修正中英文间距

### 文档
- 更新项目文档以反映单一插件架构

## 1.79.0 - 2026-03-22

### 新功能
- `baoyu-post-to-wechat`：改进凭据加载机制，支持多来源优先级解析，并提供不完整凭据来源的诊断信息

## 1.78.0 - 2026-03-22

### 新功能
- `baoyu-url-to-markdown`：新增 URL 专用解析层，支持 X/Twitter 和 archive.ph 站点的定制化 HTML 提取
- `baoyu-url-to-markdown`：改进 slug 生成算法，去除停用词并采用子目录输出结构

### 修复
- `baoyu-url-to-markdown`：旧版转换器保留包含媒体元素的锚标签
- `baoyu-url-to-markdown`：更智能的标题去重，避免重复添加标题

## 1.77.0 - 2026-03-22

### 新功能
- `baoyu-youtube-transcript`：为章节数据添加结束时间 (by @jzOcb)

### 修复
- `sync-clawhub`：跳过失败的技能而不是中止同步

## 1.76.1 - 2026-03-21

### 文档
- `baoyu-youtube-transcript`：修复 zsh glob 问题 — 运行脚本时始终对 YouTube URL 使用单引号

## 1.76.0 - 2026-03-21

### 新功能
- `baoyu-youtube-transcript`：Markdown 输出中新增标题、描述摘要和封面图片

### 修复
- `baoyu-markdown-to-html`：测试运行器改用 process.execPath 和 tsx import

## 1.75.0 - 2026-03-21

### 新功能
- `baoyu-youtube-transcript`：新技能 — 下载 YouTube 视频字幕/转录文本和封面图片，支持多语言、章节分段和说话人识别

## 1.74.1 - 2026-03-21

### 修复
- `baoyu-image-gen`：对齐 OpenRouter 图像生成与当前 API，增强图像支持，收窄 Gemini 宽高比范围 (by @cwandev)
- `baoyu-image-gen`：扩展 OpenRouter 模型检测和宽高比验证

## 1.74.0 - 2026-03-20

### 新功能
- `baoyu-markdown-to-html`：CLI 支持全部渲染选项 — color、font-family、font-size、code-theme、mac-code-block、line-number、count、legend

### 修复
- `baoyu-markdown-to-html`：修复 CSS 自定义属性正则无法处理带引号值的问题；grace/simple 主题现在会叠加 default 主题 CSS

## 1.73.3 - 2026-03-20

### 修复
- `baoyu-post-to-wechat`：修复占位符替换时短占位符错误匹配更长编号变体的问题

## 1.73.2 - 2026-03-20

### 修复
- `baoyu-post-to-wechat`：修复正文图片上传，正确使用 media/uploadimg 接口并处理格式和大小限制 (by @AICreator-Wind)

### 重构
- `baoyu-post-to-wechat`：提取图片处理模块，本地转换不支持的格式（WebP/BMP/GIF → JPEG/PNG）而非回退到 material 接口

## 1.73.1 - 2026-03-18

### 重构
- `baoyu-danger-x-to-markdown`：测试从 bun:test 迁移至 node:test

## 1.73.0 - 2026-03-18

### 新功能
- `baoyu-danger-x-to-markdown`：支持 X 文章中的视频媒体，渲染封面图和视频链接

## 1.72.0 - 2026-03-18

### 新功能
- `baoyu-danger-x-to-markdown`：支持渲染 X 文章中嵌入的 MARKDOWN 实体（代码块等）

## 1.71.0 - 2026-03-17

### 新功能
- `baoyu-image-gen`：为 Seedream 5.0/4.5/4.0 模型添加参考图支持，并增加模型特定的尺寸校验

## 1.70.0 - 2026-03-17

### 新功能
- `baoyu-format-markdown`：优化标题生成，基于公式智能推荐并提供平实风格备选
- `baoyu-format-markdown`：自动生成双版本摘要（`summary` + `description`），写入 frontmatter

## 1.69.1 - 2026-03-16

### 修复
- `baoyu-chrome-cdp`：收紧 Chrome 自动连接逻辑，减少误连接

## 1.69.0 - 2026-03-16

### 新功能
- `baoyu-chrome-cdp`：支持连接到已有的 Chrome 会话 (by @bviews)

### 修复
- `baoyu-chrome-cdp`：支持 Chrome 146 原生远程调试（审批模式）(by @bviews)
- `baoyu-chrome-cdp`：保留 findExistingChromeDebugPort 中的 HTTP 验证 (by @bviews)
- `baoyu-danger-gemini-web`：复用 openPageSession 并修复孤立标签页泄漏 (by @bviews)
- `baoyu-danger-gemini-web`：显式配置优先于自动发现 (by @bviews)
- `baoyu-danger-gemini-web`：自动发现跳过时也遵循 BAOYU_CHROME_PROFILE_DIR (by @bviews)
- `baoyu-post-to-wechat`：提升浏览器发布可靠性 (by @cfh-7598)

### 文档
- `baoyu-cover-image`：完善人物参考图片工作流和交互式确认说明

## 1.68.0 - 2026-03-14

### 新功能
- `baoyu-article-illustrator`：新增可配置输出目录（`default_output_dir`），支持 4 种选项——`imgs-subdir`、`same-dir`、`illustrations-subdir`、`independent`
- `baoyu-cover-image`：新增参考图片人物保留功能——当参考图包含人物时使用 `usage: direct` 传递给模型，风格化保留人物特征

## 1.67.0 - 2026-03-13

### 新功能
- `baoyu-image-gen`：新增 DashScope qwen-image-2.0-pro 模型支持，支持自由尺寸和文字渲染 (by @JianJang2017)

## 1.66.1 - 2026-03-13

### 测试
- 将测试文件从集中式 `tests/` 目录迁移至与源码同级
- 将测试从 `.mjs` 转换为 TypeScript（`.test.ts`），使用 `tsx` 运行器
- 新增 npm workspaces 配置，CI 工作流添加 npm 缓存

## 1.66.0 - 2026-03-13

### 新功能
- `baoyu-image-gen`：新增即梦（Jimeng）和豆包（Seedream）图像生成服务商 (by @lindaifeng)

### 修复
- `baoyu-image-gen`：收紧即梦服务商行为

### 重构
- `baoyu-image-gen`：导出函数以支持测试，新增模块入口守卫

### 文档
- `baoyu-image-gen`：在 SKILL.md 和 README 中添加即梦和豆包服务商文档

### 测试
- 新增测试基础设施，包含 CI 工作流和 image-gen 单元测试

## 1.65.1 - 2026-03-13

### 重构
- `baoyu-translate`：将 chunk 解析从 remark/unified 替换为 markdown-it，新增 main.ts CLI 入口

## 1.65.0 - 2026-03-13

### 新功能
- `baoyu-post-to-wechat`：新增占位符图片上传支持，自动去重 Markdown 内嵌图片

### 修复
- `baoyu-post-to-wechat`：修复 frontmatter 解析，允许前导空白和可选的尾随换行

### 重构
- `baoyu-post-to-wechat`：将 `renderMarkdownToHtml` 重构为 `renderMarkdownWithPlaceholders`，输出结构化结果

## 1.64.0 - 2026-03-13

### 新功能
- `baoyu-image-gen`：新增 OpenRouter 服务商，支持图像生成、参考图和可配置模型

## 1.63.0 - 2026-03-13

### 新功能
- `baoyu-url-to-markdown`：本地浏览器抓取失败时自动回退到 `defuddle.md` 托管 API
- `baoyu-url-to-markdown`：将 YouTube 字幕/文字记录提取到 Markdown 输出中
- `baoyu-url-to-markdown`：转换前展开 Shadow DOM 内容，提升 Web Component 页面的转换质量
- `baoyu-url-to-markdown`：Markdown front matter 中包含语言标识（如有）

### 重构
- `baoyu-url-to-markdown`：将单体转换器拆分为 defuddle、legacy 和 shared 三个模块

### 文档
- 修复 README 中 Claude Code marketplace 仓库名大小写

## 1.62.0 - 2026-03-12

### 新功能
- `baoyu-infographic`：支持灵活宽高比，可使用自定义 W:H 值（如 3:4、4:3、2.35:1），同时保留预设名称

### 修复
- 设置插件严格模式，防止重复注册斜杠命令

### 文档
- `baoyu-post-to-wechat`：替换类似凭证的占位符

## 1.61.0 - 2026-03-11

### 新功能
- `baoyu-post-to-wechat`：新增多账号支持，通过 `--account` 参数选择账号，EXTEND.md 支持 accounts 配置块，每个账号独立 Chrome 配置目录和凭证解析链

### 修复
- 排除 `out/dist/build` 目录和 `bun.lockb` 文件，避免打包到技能发布文件中
- 修复技能发布时 MIME 类型不正确导致 ClawhHub 拒绝的问题

## 1.60.0 - 2026-03-11

### 新功能
- `baoyu-url-to-markdown`：支持复用已有 Chrome CDP 实例，修复端口检测顺序问题

### 修复
- `baoyu-post-to-x`：补充 x-article 缺失的 `fs` 导入

### 重构
- 统一所有 CDP 技能使用共享 `baoyu-chrome-cdp` 包，各技能内置 vendor 副本
- 精简 CLAUDE.md，将详细文档移至 `docs/` 目录
- 从 synced vendor 直接发布技能，移除单独的 artifact 准备步骤

## 1.59.1 - 2026-03-11

### 修复
- `baoyu-translate`：改进短文本注释密度规则，补充风格预设到 02-prompt.md 的显式传递
- `baoyu-post-to-x`：移除 `--disable-blink-features=AutomationControlled` Chrome 启动参数

### 重构
- `baoyu-post-to-weibo`：为 md-to-html.ts 添加入口守卫，支持模块导入
- 使用本地 sync-clawhub.mjs 脚本替代 clawhub CLI

### 文档
- 更新 CLAUDE.md 以反映 v1.59.0 代码库状态 (by @jackL1020)

## 1.59.0 - 2026-03-09

### 新功能
- `baoyu-image-gen`：新增批量并行图片生成和提供商级别限流 (by @SeamoonAO)

### 修复
- `baoyu-image-gen`：修复多个 API key 可用时恢复 Google 为默认提供商

### 文档
- 改进技能文档清晰度 (by @SeamoonAO)

## 1.58.0 - 2026-03-08

### 新功能
- 新增 EXTEND.md 的 XDG 配置路径支持 (by @liby)

### 修复
- `baoyu-post-to-wechat`：暴露 agent-browser 启动错误信息
- `baoyu-post-to-wechat`：加固 agent-browser 命令和 eval 处理 (by @luojiyin1987)
- `baoyu-image-gen`：使用 execFileSync 替代 shell 执行 Google curl 请求 (by @luojiyin1987)
- `baoyu-format-markdown`：使用 spawnSync 替代 shell 执行 autocorrect 命令 (by @luojiyin1987)

### 文档
- 修正 CLAUDE 依赖说明 (by @luojiyin1987)
- 将 markdown-to-html 添加到 README 工具技能列表 (by @luojiyin1987)

## 1.57.0 - 2026-03-08

### 新功能
- 新增 ClawHub/OpenClaw 发布支持，包含同步脚本和 README 文档

### 重构
- 为所有 skill 前言添加 openclaw 元数据，兼容 ClawHub 注册表
- 全部 skill 中将 `SKILL_DIR` 统一重命名为 `baseDir`
- `baoyu-danger-gemini-web`、`baoyu-danger-x-to-markdown`：使用动态脚本路径显示用法
- `baoyu-comic`、`baoyu-xhs-images`：通过 skill 接口调用图片生成，不再直接调用脚本

## 1.56.1 - 2026-03-08

### 修复
- `baoyu-post-to-weibo`：简化头条文章图片插入逻辑，使用 Backspace 按键替代复杂的 deleteContents 方案，兼容 ProseMirror 编辑器

## 1.56.0 - 2026-03-08

### 新功能
- `baoyu-article-illustrator`：预设优先选择流程，按内容类型分类的风格预设
- `baoyu-xhs-images`：精简工作流从 6 步到 4 步，新增智能确认（快速/自定义/详细三种路径）

### 修复
- `baoyu-post-to-wechat`：通过文件选择器拦截改进图片上传可靠性

## 1.55.0 - 2026-03-08

### 新功能
- `baoyu-article-illustrator`：新增 screen-print 风格和 `--preset` 快捷预设（如 tech-explainer、opinion-piece）
- `baoyu-cover-image`：新增 screen-print 渲染风格和 duotone 调色板，包含 5 个新预设（poster-art、mondo 等）
- `baoyu-xhs-images`：新增 screen-print 风格和 `--preset` 快捷预设，内置 23 个场景预设

### 文档
- 为中英文 README 新增致谢章节，致敬相关开源项目

## 1.54.1 - 2026-03-07

### 修复
- `baoyu-post-to-x`：保持已填充的发帖窗口处于打开状态，方便用户手动检查并发布

### 文档
- `baoyu-post-to-x`：补充默认帖子类型选择规则和手动发布流程说明
- `README`：为中英文 README 新增 Star History 图表

## 1.54.0 - 2026-03-06

### 新功能
- `baoyu-format-markdown`：优化标题和摘要生成，支持多风格候选（颠覆型、方案型、悬念型、数字型），新增禁用模式和钩子优先原则
- `baoyu-markdown-to-html`：新增 `--cite` 选项，将普通外链转换为底部编号引用
- `baoyu-post-to-wechat`：Markdown 输入默认启用底部引用，新增 `--no-cite` 标志可关闭
- `baoyu-translate`：EXTEND.md 支持 `glossary_files` 加载外部术语表文件（Markdown 表格或 YAML 格式）
- `baoyu-translate`：新增 frontmatter 转换规则，翻译时将源文章元数据字段添加 `source` 前缀

## 1.53.0 - 2026-03-06

### 新功能
- `baoyu-url-to-markdown`：将渲染后的 HTML 快照保存为 `-captured.html`，与 Markdown 文件并列输出
- `baoyu-url-to-markdown`：优先使用 Defuddle 转换，失败时自动回退到旧版 Readability/选择器提取器

## 1.52.0 - 2026-03-06

### 新功能
- `baoyu-post-to-weibo`：新增 `--video` 视频上传支持（图片+视频最多 18 个文件）
- `baoyu-post-to-weibo`：上传方式从剪贴板粘贴改为 `DOM.setFileInputFiles`，提升上传可靠性

### 修复
- `baoyu-post-to-weibo`：新增 Chrome 健康检查，无响应时自动重启
- `baoyu-post-to-weibo`：发布前检查页面是否在微博首页，避免在错误页面操作

## 1.51.2 - 2026-03-06

### 修复
- `release-skills`：将显式语言文件名模式（如 `CHANGELOG.de.md`）替换为通用模式，避免 Gen Agent Trust Hub URL 扫描器误报
- `baoyu-infographic`：新增凭证/密钥剥离指令，解决 Snyk W007 不安全凭证处理审计问题

## 1.51.1 - 2026-03-06

### 重构
- 统一 Chrome CDP profile 路径——所有 skill 共享 `baoyu-skills/chrome-profile`，不再各自独立目录
- 修复 `baoyu-post-to-weibo` 错误复用 `x-browser-profile` 路径的问题

### 修复
- 移除所有安装说明中的 `curl | bash` 远程代码执行模式
- `md-to-html` 脚本强制仅允许 HTTPS 下载远程图片
- 添加重定向次数限制（最多 5 次），防止无限重定向
- 在 CLAUDE.md 中新增安全准则章节

## 1.51.0 - 2026-03-06

### 新功能
- `baoyu-post-to-weibo`：新增微博发布技能——支持带图文本发布和头条文章，通过 Chrome CDP 自动化操作
- `baoyu-format-markdown`：新增标题/摘要多候选项选择——生成 3 个候选供用户选择，支持 EXTEND.md 中的 `auto_select` 配置

## 1.50.0 - 2026-03-06

### 新功能
- `baoyu-translate`：翻译风格预设从 4 种扩展到 9 种——新增学术、商务、幽默、口语化和优雅风格
- `baoyu-translate`：新增 `--style` 命令行参数，支持按次指定翻译风格
- `baoyu-translate`：将风格指令集成到子代理提示词模板

## 1.49.0 - 2026-03-06

### 新功能
- `baoyu-format-markdown`：新增读者视角内容分析阶段——在应用格式之前先分析要点、结构和格式问题
- `baoyu-format-markdown`：重构工作流从 8 步精简为 7 步，新增明确的格式化原则和完成报告模板
- `baoyu-translate`：将步骤 2 的工作流机制提取到独立参考文件，精简 SKILL.md
- `baoyu-translate`：扩展触发关键词（改成中文、快翻、本地化等），提升技能激活准确度
- `baoyu-translate`：快速翻译模式下对长内容主动提示切换建议
- `baoyu-translate`：分块时将 frontmatter 保存到 `chunks/frontmatter.md`

## 1.48.2 - 2026-03-06

### 新功能
- `baoyu-translate`：在精翻工作流的审查和修订阶段新增比喻语言与情感忠实度检查
- `baoyu-translate`：增强快速翻译模式，强制执行比喻语言的意义优先翻译原则

## 1.48.1 - 2026-03-05

### 新功能
- `baoyu-translate`：在分析阶段新增比喻语言与隐喻映射——翻译前先解读隐喻、习语和隐含意义，避免字面直译
- `baoyu-translate`：新增"意义优先于字面"、"比喻语言解读"、"情感忠实度"三项翻译原则，同步更新 SKILL.md、精翻工作流和子代理提示词模板

## 1.48.0 - 2026-03-05

### 新功能
- `baoyu-translate`：为 chunk.ts 新增 `--output-dir` 选项——分块文件现在写入翻译输出目录而非源文件目录
- `baoyu-translate`：优化精翻工作流——将审校拆分为批判性审查 + 修订（5→6 步），新增中日韩目标语言的欧化表达诊断

## 1.47.0 - 2026-03-05

### 新功能
- 新增 `baoyu-translate` 翻译技能——支持快速/标准/精翻三种模式，自定义术语表、面向受众翻译、长文档自动分块并行翻译
- 为所有技能的 EXTEND.md 偏好检测添加 PowerShell 跨平台支持

## 1.46.0 - 2026-03-05

### 新功能
- 为 url-to-markdown 新增 `--output-dir` 选项，支持自定义输出目录并自动生成文件名

## 1.45.1 - 2026-03-05

### 重构
- 将所有技能中硬编码的 `npx -y bun` 替换为 `${BUN_X}` 运行时变量——优先使用原生 `bun`，回退到 `npx -y bun`
- 在 CLAUDE.md 中新增运行时检测章节，在所有 SKILL.md 的脚本目录说明中添加运行时解析步骤

## 1.45.0 - 2026-03-05

### 新功能
- `baoyu-post-to-x`：X 文章发布后自动验证——检查残留占位符和图片数量是否正确
- `baoyu-post-to-x`：增加 CDP 超时至 60 秒，图片插入间隔增加 3 秒 DOM 稳定等待，改善长文章发布稳定性

## 1.44.0 - 2026-03-05

### 新功能
- `baoyu-url-to-markdown`：新增 `--download-media` 参数，支持下载图片和视频到本地目录，并将 Markdown 中的链接改写为本地路径
- `baoyu-url-to-markdown`：从页面 meta 信息（og:image）提取封面图，写入 YAML front matter 的 `coverImage` 字段
- `baoyu-url-to-markdown`：支持 `data-src` 懒加载图片提取（兼容微信公众号等站点）
- `baoyu-url-to-markdown`：新增 EXTEND.md 偏好设置，支持首次使用引导配置媒体下载行为

## 1.43.2 - 2026-03-05

### 重构
- `baoyu-url-to-markdown`：使用 defuddle 库替换自定义 HTML 提取逻辑（linkedom + Readability + Turndown），简化内容提取和 Markdown 转换

## 1.43.1 - 2026-03-02

### 新功能
- `baoyu-post-to-x`：自动检测 WSL 环境，将 Chrome profile 路径解析为 Windows 本地路径，解决登录态丢失问题
- `baoyu-post-to-wechat`：自动检测 WSL 环境，将 Chrome profile 路径解析为 Windows 本地路径，解决登录态丢失问题
- `baoyu-danger-gemini-web`：WSL 自动检测 Chrome profile 路径；新增 `GEMINI_WEB_DEBUG_PORT` 环境变量支持固定调试端口
- `baoyu-danger-x-to-markdown`：WSL 自动检测 Chrome profile 路径；新增 `X_DEBUG_PORT` 环境变量支持固定调试端口

## 1.43.0 - 2026-03-02

### 新功能
- `baoyu-post-to-wechat`：支持通过环境变量覆盖浏览器调试端口（`WECHAT_BROWSER_DEBUG_PORT`）和配置目录（`WECHAT_BROWSER_PROFILE_DIR`）
- `baoyu-post-to-x`：支持通过环境变量覆盖浏览器调试端口（`X_BROWSER_DEBUG_PORT`）和配置目录（`X_BROWSER_PROFILE_DIR`）

## 1.42.3 - 2026-03-02

### 修复
- `baoyu-image-gen`：DashScope 宽高比映射改用标准预设尺寸匹配，避免自由计算产生无效分辨率

## 1.42.2 - 2026-03-01

### 新功能
- `baoyu-markdown-to-html`：内联渲染管线（移除子进程），修复 CJK 强调符号处理顺序，增强 modern 主题（GFM 警告块、排版改进）
- `baoyu-post-to-wechat`：内置 Markdown 转换模块化渲染器，新增颜色支持，简化发布流程

## 1.42.1 - 2026-02-28

### 新功能
- `baoyu-markdown-to-html`：将 render.ts 拆分为 cli、constants、extend-config、html-builder、renderer、themes、types 模块；本地打包代码高亮主题

## 1.42.0 - 2026-02-28

### 新功能
- `baoyu-markdown-to-html`：合并 heritage 和 warm 为 modern 主题，新增主题默认颜色（default→蓝、grace→紫、simple→绿、modern→橙）
- `baoyu-post-to-wechat`：EXTEND.md 新增默认颜色配置，首次设置增加 modern 主题和颜色选择

## 1.41.0 - 2026-02-28

### 新功能
- `baoyu-markdown-to-html`：重命名主题（red→heritage、orange→warm），新增 13 个颜色预设、serif-cjk 字体、主题级样式默认值

## 1.40.1 - 2026-02-28

### 新功能
- `baoyu-image-gen`：明确模型解析优先级（EXTEND.md 优先于环境变量），生成图片时显示当前模型及切换方式

## 1.40.0 - 2026-02-28

### 新功能
- `baoyu-image-gen`：支持 OpenAI Chat Completions 端点生成图片 (by @zhao-newname)
- `baoyu-markdown-to-html`：新增 CLI 自定义选项（--color、--font-family、--font-size、--code-theme、--mac-code-block、--line-number、--cite、--count、--legend）及 EXTEND.md 配置支持

## 1.39.0 - 2026-02-28

### 新功能
- `baoyu-markdown-to-html`：新增红色主题（红金配色、宋体排版、传统书法风格）和橙色主题（暖色调现代风、圆角装饰、宽松行距）

## 1.38.0 - 2026-02-28

### 新功能
- `baoyu-danger-x-to-markdown`：支持文章内嵌推文渲染，以引用块形式显示作者信息和推文摘要
- `baoyu-danger-x-to-markdown`：`--download-media` 复用已转换的 Markdown 文件，跳过重复抓取
- `baoyu-danger-x-to-markdown`：推特图片下载升级至 4096x4096 高分辨率

### 修复
- `baoyu-danger-x-to-markdown`：改进实体解析逻辑，通过逻辑键查找提升媒体和链接映射准确性
- `baoyu-danger-x-to-markdown`：所有区块类型（标题、列表、引用块）支持尾随媒体展示

## 1.37.1 - 2026-02-27

### 修复
- `baoyu-danger-gemini-web`：同步上游模型请求头并更新模型列表 (by @xkcoding)

## 1.37.0 - 2026-02-27

### 新功能
- `baoyu-danger-x-to-markdown`：支持 X 文章内联链接渲染，将 LINK/MEDIA 实体映射为 Markdown 链接
- `baoyu-danger-x-to-markdown`：输出目录使用基于内容的 slug，生成更有意义的文件夹名称
- `baoyu-danger-x-to-markdown`：新增 atomic 媒体队列，支持无直接媒体引用的区块

## 1.36.0 - 2026-02-27

### 新功能
- `baoyu-image-gen`：新增 `gemini-3.1-flash-image-preview` Google 多模态图片生成模型支持
- `baoyu-image-gen`：优化首次使用引导流程，支持阻塞式偏好配置

### 修复
- `baoyu-image-gen`：检测到 HTTP 代理时自动回退使用 curl 调用 Google API (by @liye71023326)

## 1.35.0 - 2026-02-24

### 新功能
- `baoyu-image-gen`：新增 Replicate 图片生成服务，支持自定义模型配置 (by @justnode)
- `baoyu-infographic`：新增 `dense-modules` 高密度模块布局及 3 种新风格（`morandi-journal`、`pop-laboratory`、`retro-pop-grid`），支持关键词快捷选择。高密度信息大图提示词来自 [AJ](https://waytoagi.feishu.cn/wiki/YG0zwalijihRREkgmPzcWRInnUg)

### 文档
- `baoyu-image-gen`：补充 Replicate 模型配置说明文档

## 1.34.2 - 2026-02-25

### 文档
- `baoyu-markdown-to-html`：明确主题解析优先级，先读取本技能与跨技能 EXTEND.md 的 `default_theme`，仅在未命中时询问用户。
- `baoyu-post-to-wechat`：统一 markdown 转 HTML 的主题解析回退链（CLI `--theme` -> EXTEND.md `default_theme` -> `default`），并强制始终显式传入 `--theme` 参数。

## 1.34.1 - 2026-02-20

### 修复
- `baoyu-post-to-wechat`：修复上传进度检查在第二次迭代时崩溃的问题 (by @LyInfi)

## 1.34.0 - 2026-02-17

### 新功能
- `baoyu-xhs-images`：新增参考图片链功能，确保多图系列的视觉一致性 (by @jeffrey94)

### 重构
- `baoyu-article-illustrator`：将提示词文件创建设为生成图片前的阻断步骤，新增结构化提示词质量要求（ZONES / LABELS / COLORS / STYLE / ASPECT）和验证清单。

## 1.33.1 - 2026-02-14

### 重构
- `baoyu-post-to-x`：将手写 markdown 解析器替换为 marked 生态系统，用于 X Articles HTML 转换。

### 文档
- `baoyu-post-to-x`：移除所有脚本的 `--submit` 参数；明确脚本仅将内容填充到浏览器，由用户手动审核和发布。

## 1.33.0 - 2026-02-13

### 新功能
- `baoyu-post-to-x`：新增环境预检脚本（`check-paste-permissions.ts`）；新增 Chrome 调试端口冲突的故障排查说明；将固定等待替换为图片上传轮询验证（最长 15 秒）。
- `baoyu-post-to-wechat`：新增环境预检脚本（`check-permissions.ts`），检查 Chrome、配置文件隔离、Bun、辅助功能、剪贴板、粘贴按键和 API 凭据。

## 1.32.0 - 2026-02-12

### 新功能
- `baoyu-danger-x-to-markdown`：新增 `--download-media` 参数，支持将图片/视频下载到本地并将 markdown 链接改写为相对路径；新增媒体本地化模块；新增首次使用 EXTEND.md 偏好设置；在 frontmatter 中输出 `coverImage`。

### 重构
- `baoyu-danger-x-to-markdown`：frontmatter 字段改为 camelCase（`tweetCount`、`coverImage`、`requestedUrl` 等）。
- `baoyu-format-markdown`：将主 frontmatter 字段从 `featureImage` 更名为 `coverImage`（兼容 `featureImage`）。
- `baoyu-post-to-wechat`：封面图片 frontmatter 查找顺序中优先使用 `coverImage`。

## 1.31.2 - 2026-02-10

### 修复
- `baoyu-post-to-wechat`：修复 Windows 上 PowerShell 剪贴板复制失败的问题（`param()`/`-Path` 与 `-Command` 参数不兼容）。
- `baoyu-post-to-x`：修复 Windows 上 PowerShell 剪贴板复制（同上）；修复 `getScriptDir()` 在 Windows 上返回无效路径（`/C:/...` 前缀）。

## 1.31.1 - 2026-02-10

### 新功能
- `baoyu-post-to-wechat`：适配微信新版 UI — 图文更名为贴图；新增 ProseMirror 编辑器支持（兼容旧版编辑器）；新增备用文件上传选择器；新增上传进度监控；改进保存按钮检测并增加 toast 验证。

### 修复
- `baoyu-post-to-wechat`：摘要超过 120 字符时在标点处截断；修复封面图片相对路径解析。
- `baoyu-post-to-x`：修复 macOS 上 Chrome 启动问题（使用 `open -na`）；修复封面图片相对路径解析。

## 1.31.0 - 2026-02-07

### 新功能
- `baoyu-post-to-wechat`：新增评论控制设置（`need_open_comment`、`only_fans_can_comment`）；新增封面图片回退链（CLI → frontmatter → `imgs/cover.png` → 首张内联图片）；新增作者优先级解析；新增首次使用引导流程和 EXTEND.md 偏好配置。

## 1.30.3 - 2026-02-06

### 重构
- `baoyu-article-illustrator`：优化 SKILL.md 从 197 行精简至 150 行（减少 24%）；采用渐进式披露模式，主文件提供简洁概览，详细内容通过引用文件提供。

## 1.30.2 - 2026-02-06

### 重构
- `baoyu-cover-image`：优化 SKILL.md 从 532 行精简至 233 行（减少 56%）；将参考图片处理流程提取到 `references/workflow/reference-images.md`；画廊改为纯值表格并链接到详细参考文件。

## 1.30.1 - 2026-02-06

### 新功能
- `baoyu-image-gen`：新增 OpenAI GPT Image edits 支持参考图片（`--ref`）；提供 ref 时自动选择 Google 或 OpenAI。

### 修复
- `baoyu-image-gen`：将 ref 相关警告改为明确错误提示；新增参考图片验证。
- `baoyu-cover-image`：增强参考图片分析，使用深度提取模板；要求 MUST INCORPORATE 章节以包含具体可复现的视觉元素。

## 1.30.0 - 2026-02-06

### 新功能
- `baoyu-cover-image`：新增字体维度，支持 4 种字体风格（clean、handwritten、serif、display）；包含自动选择规则、兼容性矩阵和 `warm-flat` 风格预设。

## 1.29.0 - 2026-02-06

### 新功能
- `baoyu-image-gen`：新增 EXTEND.md 配置支持，补充配置 schema 文档并在脚本运行时读取偏好设置 (by @kingdomad)。

### 修复
- `baoyu-post-to-wechat`：修复公众号文章发布时标题和有序列表编号重复问题 (by @NantesCheval)。
- `baoyu-url-to-markdown`：将正则转换升级为多策略正文抽取 + Turndown 转换，提升 Substack 类页面的噪声过滤能力。

## 1.28.4 - 2026-02-03

### 新功能
- `baoyu-markdown-to-html`：从 YAML frontmatter 生成 author 和 description meta 标签；自动去除 frontmatter 值两端的引号（支持中英文引号）。

### 修复
- `baoyu-post-to-wechat`：移除图片粘贴后产生的多余空行；修复摘要填充时机，改为内容粘贴后填写（避免被覆盖）。

## 1.28.3 - 2026-02-03

### 修复
- `baoyu-post-to-wechat`：修复占位符匹配问题（`WECHATIMGPH_1` 错误匹配 `WECHATIMGPH_10`）。

## 1.28.2 - 2026-02-03

### 修复
- `baoyu-post-to-x`：复用已有 Chrome 实例；修复占位符匹配问题（`XIMGPH_1` 错误匹配 `XIMGPH_10`）；改进图片按占位符序号排序；使用 `execCommand` 提高占位符删除可靠性。

## 1.28.1 - 2026-02-02

### 重构
- `baoyu-article-illustrator`：简化主 SKILL.md，将详细步骤提取到 `workflow.md`；新增 Core Styles 快速选择层（vector、minimal-flat、sci-fi、hand-drawn、editorial、scene）；新增 `vector-illustration` 作为推荐默认风格；新增插图目的（information/visualization/imagination）以优化类型/风格推荐；在提示词构建中新增默认构图要求、人物渲染指南和文本样式规则。

## 1.28.0 - 2026-02-01

### 新功能
- `baoyu-cover-image`：新增参考图片支持（`--ref` 参数），支持 direct/style/palette 三种用法；新增视觉元素库，按主题分类图标词汇。
- `baoyu-article-illustrator`：新增参考图片支持，支持 direct/style/palette 三种用法。
- `baoyu-post-to-wechat`：新增 `newspic` 图文消息类型支持。

### 重构
- `baoyu-cover-image`、`baoyu-article-illustrator`、`baoyu-comic`、`baoyu-xhs-images`：强化首次设置为阻塞操作，必须在其他工作流步骤之前完成。
- `baoyu-cover-image`：移除标题字符数限制，使用原始来源标题。

## 1.26.1 - 2026-01-29

### 新功能
- `baoyu-article-illustrator`、`baoyu-comic`、`baoyu-cover-image`、`baoyu-infographic`、`baoyu-slide-deck`、`baoyu-xhs-images`：新增文件备份规则，覆盖前自动将现有源文件、提示词和图片重命名为带时间戳后缀的备份文件。

### 修复
- `baoyu-xhs-images`：移除 `notebook` 风格（保留 10 种风格）。

## 1.26.0 - 2026-01-29

### 新功能
- `baoyu-xhs-images`：新增 `notebook` 风格（水彩渲染手绘信息图 + 莫兰迪配色）和 `study-notes` 风格（真实手写照片美学）。
- `baoyu-xhs-images`：新增 `mindmap`（中心发散式）和 `quadrant`（四象限）布局。

## 1.25.4 - 2026-01-29

### 修复
- `baoyu-markdown-to-html`：生成带 `data-local-path` 属性的 `<img>` 标签，而非纯文本占位符。
- `baoyu-post-to-wechat`：修复 API 发布时从 `data-local-path` 属性读取图片路径；修复发布 HTML 文件时从对应 `.md` 的 frontmatter 提取标题和封面图。
- `baoyu-post-to-wechat`：修复命令行参数解析，正确跳过未知参数；新增 `--summary` 参数支持。
- `baoyu-post-to-wechat`：修复浏览器发布模式，粘贴前将 `<img>` 标签转换回文本占位符。

## 1.25.3 - 2026-01-28

### 新功能
- `baoyu-format-markdown`：新增内容类型检测，对已有 markdown 格式的文件提供用户确认选项；新增 CJK 配对标点处理，将括号、引号等标点移出加粗标记外。

## 1.25.2 - 2026-01-28

### 文档
- `baoyu-post-to-wechat`：README 新增微信公众号 API 凭证配置说明。

## 1.25.1 - 2026-01-28

### 新功能
- `baoyu-markdown-to-html`：新增中文内容预检查，建议在转换前使用 `baoyu-format-markdown` 格式化以修复加粗标点问题。

## 1.25.0 - 2026-01-28

### 新功能
- `baoyu-format-markdown`：新增 markdown 格式化技能，支持 frontmatter、排版优化和中英文空格处理。
- `baoyu-markdown-to-html`：新增 markdown 转 HTML 技能，支持微信兼容主题、代码高亮、数学公式、PlantUML 和 alerts。
- `baoyu-post-to-wechat`：新增 API 发布方式和外部主题支持。

## 1.24.4 - 2026-01-28

### 修复
- `baoyu-post-to-x`：修复封面图上传后 Apply 按钮点击问题；增加重试逻辑并等待弹窗关闭后再继续。

## 1.24.3 - 2026-01-28

### 文档
- 在修改工作流中强调先更新提示词文件再生成图片（article-illustrator、slide-deck、xhs-images、cover-image、comic）。

## 1.24.2 - 2026-01-28

### 重构
- `baoyu-image-gen`：默认改为顺序生成图片；并行生成需明确请求。

## 1.24.1 - 2026-01-28

### 新功能
- `baoyu-image-gen`：新增阿里云通义万象（DashScope）文生图模型支持 (by @JianJang2017)。

### 文档
- README 中新增阿里云文生图模型配置说明。

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
