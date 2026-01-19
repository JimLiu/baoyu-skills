# Changelog

[English](./CHANGELOG.md) | 中文

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
