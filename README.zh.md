# baoyu-skills

[English](./README.md) | 中文

宝玉分享的 Claude Code 技能集，提升日常工作效率。

## 前置要求

- 已安装 Node.js 环境
- 能够运行 `npx bun` 命令

## 安装

### 快速安装（推荐）

```bash
npx add-skill jimliu/baoyu-skills
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
3. 选择 **content-skills**
4. 选择 **Install now**

**方式二：直接安装**

```bash
/plugin install content-skills@baoyu-skills
```

**方式三：告诉 Agent**

直接告诉 Claude Code：

> 请帮我安装 github.com/JimLiu/baoyu-skills 中的 Skills

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

**风格**（视觉美学）：`cute`（默认）、`fresh`、`tech`、`warm`、`bold`、`minimal`、`retro`、`pop`、`notion`

**布局**（信息密度）：
| 布局 | 密度 | 适用场景 |
|------|------|----------|
| `sparse` | 1-2 点 | 封面、金句 |
| `balanced` | 3-4 点 | 常规内容 |
| `dense` | 5-8 点 | 知识卡片、干货总结 |
| `list` | 4-7 项 | 清单、排行 |
| `comparison` | 双栏 | 对比、优劣 |
| `flow` | 3-6 步 | 流程、时间线 |

#### baoyu-cover-image

为文章生成手绘风格封面图，支持多种风格选项。

```bash
# 从 markdown 文件生成（自动选择风格）
/baoyu-cover-image path/to/article.md

# 指定风格
/baoyu-cover-image path/to/article.md --style tech
/baoyu-cover-image path/to/article.md --style warm

# 不包含标题文字
/baoyu-cover-image path/to/article.md --no-title
```

可用风格：`elegant`（默认）、`tech`、`warm`、`bold`、`minimal`、`playful`、`nature`、`retro`

#### baoyu-slide-deck

从内容生成专业的幻灯片图片。先创建包含样式说明的完整大纲，然后逐页生成幻灯片图片。

```bash
# 从 markdown 文件生成
/baoyu-slide-deck path/to/article.md

# 指定风格和受众
/baoyu-slide-deck path/to/article.md --style corporate
/baoyu-slide-deck path/to/article.md --audience executives

# 仅生成大纲（不生成图片）
/baoyu-slide-deck path/to/article.md --outline-only

# 指定语言
/baoyu-slide-deck path/to/article.md --lang zh
```

**风格**（视觉美学）：

| 风格 | 描述 | 适用场景 |
|------|------|----------|
| `blueprint`（默认） | 技术蓝图风格，网格纹理，工程精度 | 架构设计、系统设计 |
| `notion` | SaaS 仪表盘美学，卡片式布局，数据清晰 | 产品演示、SaaS、B2B |
| `bold-editorial` | 杂志社论风格，粗体排版，深色背景 | 产品发布、主题演讲 |
| `corporate` | 海军蓝/金色配色，结构化布局，专业图标 | 投资者演示、客户提案 |
| `dark-atmospheric` | 电影级暗色调，发光效果，氛围感 | 娱乐、游戏、创意 |
| `editorial-infographic` | 杂志风格信息图，扁平插画 | 科技解说、研究报告 |
| `fantasy-animation` | 吉卜力/迪士尼风格，手绘动画 | 教育、故事讲述 |
| `intuition-machine` | 技术简报，双语标签，做旧纸张纹理 | 技术文档、双语内容 |
| `minimal` | 极简风格，大量留白，单一强调色 | 高管简报、高端品牌 |
| `pixel-art` | 复古 8-bit 像素风，怀旧游戏感 | 游戏、开发者分享 |
| `scientific` | 学术图表，生物通路，精确标注 | 生物、化学、医学 |
| `sketch-notes` | 手绘风格，柔和笔触，暖白色背景 | 教育、教程、知识分享 |
| `vector-illustration` | 扁平矢量风格，黑色轮廓线，复古柔和配色 | 创意提案、说明性内容 |
| `vintage` | 做旧纸张美学，历史文档风格 | 历史、传记、人文 |
| `watercolor` | 柔和手绘水彩纹理，自然温暖 | 生活方式、健康、旅行 |

**风格预览**：

| | | |
|:---:|:---:|:---:|
| ![blueprint](./screenshots/slide-deck-styles/blueprint.webp) | ![bold-editorial](./screenshots/slide-deck-styles/bold-editorial.webp) | ![corporate](./screenshots/slide-deck-styles/corporate.webp) |
| blueprint | bold-editorial | corporate |
| ![dark-atmospheric](./screenshots/slide-deck-styles/dark-atmospheric.webp) | ![editorial-infographic](./screenshots/slide-deck-styles/editorial-infographic.webp) | ![fantasy-animation](./screenshots/slide-deck-styles/fantasy-animation.webp) |
| dark-atmospheric | editorial-infographic | fantasy-animation |
| ![intuition-machine](./screenshots/slide-deck-styles/intuition-machine.webp) | ![minimal](./screenshots/slide-deck-styles/minimal.webp) | ![notion](./screenshots/slide-deck-styles/notion.webp) |
| intuition-machine | minimal | notion |
| ![pixel-art](./screenshots/slide-deck-styles/pixel-art.webp) | ![scientific](./screenshots/slide-deck-styles/scientific.webp) | ![sketch-notes](./screenshots/slide-deck-styles/sketch-notes.webp) |
| pixel-art | scientific | sketch-notes |
| ![vector-illustration](./screenshots/slide-deck-styles/vector-illustration.webp) | ![vintage](./screenshots/slide-deck-styles/vintage.webp) | ![watercolor](./screenshots/slide-deck-styles/watercolor.webp) |
| vector-illustration | vintage | watercolor |

生成完成后，所有幻灯片会自动合并为 `.pptx` 文件，方便分享。

#### baoyu-comic

知识漫画创作器，支持多种风格（Logicomix/清线风格、欧姆社漫画教程风格）。创作带有详细分镜布局的原创教育漫画，逐页生成图片。

```bash
# 从素材文件生成
/baoyu-comic posts/turing-story/source.md

# 指定风格
/baoyu-comic posts/turing-story/source.md --style dramatic
/baoyu-comic posts/turing-story/source.md --style ohmsha

# 自定义风格（自然语言描述）
/baoyu-comic posts/turing-story/source.md --style "水彩风格，边缘柔和"

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
| `--style` | `classic`（默认）、`dramatic`、`warm`、`tech`、`sepia`、`vibrant`、`ohmsha`、`realistic`，或自然语言描述 |
| `--layout` | `standard`（默认）、`cinematic`、`dense`、`splash`、`mixed`、`webtoon` |
| `--aspect` | `3:4`（默认，竖版）、`4:3`（横版）、`16:9`（宽屏） |
| `--lang` | `auto`（默认）、`zh`、`en`、`ja` 等 |

**风格**（视觉美学）：

| 风格 | 描述 | 适用场景 |
|------|------|----------|
| `classic`（默认） | 传统清线风格，统一线条、平涂色彩、精细背景 | 传记、平衡叙事、教育内容 |
| `dramatic` | 高对比度，重阴影、紧张表情、棱角分明的构图 | 重大发现、冲突、高潮场景 |
| `warm` | 柔和边缘、金色调、温馨室内、怀旧感 | 个人故事、童年场景、师生情 |
| `tech` | 精确几何线条、电路纹理、深色背景配霓虹色 | 计算机史、AI 故事、现代科技 |
| `sepia` | 复古插画风格、做旧纸张效果、时代准确细节 | 1950 年前故事、古典科学、历史人物 |
| `vibrant` | 富有活力的线条、明亮色彩、动感姿态 | 科学解说、"顿悟"时刻、青少年读者 |
| `ohmsha` | 欧姆社漫画风格，视觉比喻、道具、学生/导师互动 | 技术教程、复杂概念（机器学习、物理） |
| `realistic` | 全彩写实日漫风格，数字绘画、平滑渐变、准确人体比例 | 红酒、美食、商业、生活方式、专业话题 |

**布局**（分镜排列）：
| 布局 | 每页分镜数 | 适用场景 |
|------|-----------|----------|
| `standard` | 4-6 | 对话、叙事推进 |
| `cinematic` | 2-4 | 戏剧性时刻、建立镜头 |
| `dense` | 6-9 | 技术说明、时间线 |
| `splash` | 1-2 大图 | 关键时刻、揭示 |
| `mixed` | 3-7 不等 | 复杂叙事、情感弧线 |
| `webtoon` | 3-5 竖向 | 欧姆社教程、手机阅读 |

#### baoyu-article-illustrator

智能文章插图技能。分析文章内容，在需要视觉辅助的位置生成插图。

```bash
/baoyu-article-illustrator path/to/article.md
```

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
## 自定义风格

### brand
- 主色：#1a73e8
- 辅色：#34a853
- 字体风格：现代无衬线
- 始终包含公司 logo 水印
```

扩展内容会在技能执行前加载，并覆盖默认设置。

## 免责声明

### baoyu-danger-gemini-web

此技能使用 Gemini Web API（逆向工程）。

**警告：** 本项目通过浏览器 cookies 使用非官方 API。使用风险自负。

- 首次运行会打开 Chrome 进行 Google 身份验证
- Cookies 会被缓存供后续使用
- 不保证 API 的稳定性或可用性

### baoyu-danger-x-to-markdown

此技能使用逆向工程的 X (Twitter) API。

**警告：** 这不是官方 API。使用风险自负。

- 如果 X 更改其 API，可能会无预警失效
- 如检测到 API 使用，账号可能受限
- 首次使用需确认免责声明
- 通过环境变量或 Chrome 登录进行身份验证

## 许可证

MIT
