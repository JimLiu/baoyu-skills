# baoyu-skills

[English](./README.md) | [中文](./README.zh.md) | 日本語

Baoyu が共有する、AI エージェント (Claude Code、Codex など) で日々の作業効率を高めるためのスキル集です。

## 前提条件

- Node.js 環境がインストールされていること
- `npx bun` コマンドを実行できること

## インストール

> **ヒント**: このリポジトリには 20 以上のスキルが含まれています。実際に必要なものだけをインストールしてください。すべてのスキルを一括でインストールすると、実行のたびに AI エージェントに不要なコンテキストの負荷がかかります。

### クイックインストール (推奨)

```bash
npx skills add jimliu/baoyu-skills
```

### Codex のプロジェクト単位のインストール

1 つのプロジェクトで一部のスキルだけが必要な場合、プラグイン全体をインストールする必要はありません。Codex はプロジェクト内の `.agents/skills` をスキャンするため、必要な各スキルをディレクトリごとコピーするか、シンボリックリンクを作成してください:

```text
<project>/.agents/skills/baoyu-cover-image/SKILL.md
<project>/.agents/skills/baoyu-article-illustrator/SKILL.md
<project>/.agents/skills/baoyu-post-to-wechat/SKILL.md
```

WeChat 公式アカウントの記事ワークフローでは、通常の最小構成は次のとおりです:

- `baoyu-cover-image`
- `baoyu-article-illustrator`
- `baoyu-post-to-wechat`

`baoyu-markdown-to-html` を別途インストールする必要はありません。`baoyu-post-to-wechat` には、Markdown を WeChat 向けの HTML に変換するフローがすでに含まれています。`baoyu-format-markdown` は、生のテキストや下書きを、タイトル、要約、見出し、太字、リストなどの書式を備えた構造化された Markdown 記事に先に変換する必要がある場合にのみインストールしてください。

WeChat API の認証情報は、適用したい範囲に応じて配置します:

- ユーザー単位: `~/.baoyu-skills/.env`
- プロジェクト単位: `<project>/.baoyu-skills/.env`

プロジェクト単位の `.env` ファイルは、認証情報を現在のプロジェクトにのみ適用したい場合に便利です。Git にはコミットしないでください。

### ClawHub / OpenClaw への公開

このリポジトリは、各 `skills/baoyu-*` ディレクトリを個別の ClawHub スキルとして公開することに対応しました。

```bash
# Preview what would be published
./scripts/sync-clawhub.sh --dry-run

# Publish all changed skills from ./skills
./scripts/sync-clawhub.sh --all
```

ClawHub はスキルを 1 つのマーケットプレイスバンドルとしてではなく、個別にインストールします。公開後、ユーザーは次のように特定のスキルをインストールできます:

```bash
clawhub install baoyu-image-gen
clawhub install baoyu-markdown-to-html
```

ClawHub に公開すると、ClawHub のレジストリ規則に従い、公開されたスキルは `MIT-0` でリリースされます。

### プラグインマーケットプレイスとして登録

エージェントで次のコマンドを実行します:

```bash
/plugin marketplace add JimLiu/baoyu-skills
```

### スキルのインストール

**方法 1: ブラウズ UI から**

1. **Browse and install plugins** を選択します
2. **baoyu-skills** を選択します
3. **baoyu-skills** プラグインを選択します
4. **Install now** を選択します

**方法 2: 直接インストール**

```bash
# Install the marketplace's single plugin
/plugin install baoyu-skills@baoyu-skills
```

**方法 3: エージェントに依頼**

エージェントに次のように伝えるだけです:

> github.com/JimLiu/baoyu-skills からスキルをインストールしてください

### 利用可能なプラグイン

マーケットプレイスは現在、各スキルが一度だけ登録されるよう、単一のプラグインを公開しています。

| プラグイン | 説明 | 含まれるもの |
|--------|-------------|----------|
| **baoyu-skills** | 日々の作業効率のためのコンテンツ生成、AI バックエンド、ユーティリティツール | このリポジトリのすべてのスキル (以下でコンテンツスキル、AI 生成スキル、ユーティリティスキルに分類) |

## スキルの更新

スキルを最新バージョンに更新するには:

1. エージェントで `/plugin` を実行します
2. **Marketplaces** タブに切り替えます (矢印キーまたは Tab を使用)
3. **baoyu-skills** を選択します
4. **Update marketplace** を選択します

**Enable auto-update** を有効にして、最新バージョンを自動的に取得することもできます。

![スキルの更新](./screenshots/update-plugins.png)

## 利用可能なスキル

スキルは 3 つのカテゴリに分類されています:

### 注目のデザインスキル: baoyu-design

デザインに特化したエージェントスキルが必要な場合は、[JimLiu/baoyu-design](https://github.com/JimLiu/baoyu-design) をご覧ください。これは Cursor、Claude Code、Codex、Claude Desktop、またはファイルを扱える任意のコーディングエージェントで Claude Design をローカルに実行する別プロジェクトで、洗練された UI モックアップ、インタラクティブなプロトタイプ、ワイヤーフレーム、ランディングページ、ダッシュボード、モバイルアプリ、スライドデッキを自己完結型の HTML として生成します。

<a href="https://github.com/JimLiu/baoyu-design">
  <img src="https://raw.githubusercontent.com/JimLiu/baoyu-design/main/assets/screenshots/cursor-reader-mac-app.webp" alt="baoyu-design を実行している Cursor" width="720">
</a>

```bash
npx skills add JimLiu/baoyu-design
```

### コンテンツスキル

コンテンツの生成と公開のためのスキルです。

#### baoyu-xhs-images

小紅書 (Xiaohongshu) 向けの画像カードシリーズ生成ツールです。**スタイル × レイアウト** システムとオプションのパレット上書きにより、コンテンツを 1〜10 枚のカートゥーン風画像カードに分割します。

```bash
# Auto-select style and layout
/baoyu-xhs-images posts/ai-future/article.md

# Specify style
/baoyu-xhs-images posts/ai-future/article.md --style notion

# Specify layout
/baoyu-xhs-images posts/ai-future/article.md --layout dense

# Combine style and layout
/baoyu-xhs-images posts/ai-future/article.md --style notion --layout list

# Override palette
/baoyu-xhs-images posts/ai-future/article.md --style notion --palette macaron

# Direct content input
/baoyu-xhs-images 今日星座运势

# Non-interactive (skip all confirmations, for scheduled tasks)
/baoyu-xhs-images posts/ai-future/article.md --yes
/baoyu-xhs-images posts/ai-future/article.md --yes --preset knowledge-card
```

**スタイル** (ビジュアルの美学): `cute` (デフォルト)、`fresh`、`warm`、`bold`、`minimal`、`retro`、`pop`、`notion`、`chalkboard`、`study-notes`、`screen-print`、`sketch-notes`

**パレット** (オプションの配色上書き): `macaron`、`warm`、`neon`

**スタイルのプレビュー**:

| | | |
|:---:|:---:|:---:|
| ![cute](./screenshots/xhs-images-styles/cute.webp) | ![fresh](./screenshots/xhs-images-styles/fresh.webp) | ![warm](./screenshots/xhs-images-styles/warm.webp) |
| cute | fresh | warm |
| ![bold](./screenshots/xhs-images-styles/bold.webp) | ![minimal](./screenshots/xhs-images-styles/minimal.webp) | ![retro](./screenshots/xhs-images-styles/retro.webp) |
| bold | minimal | retro |
| ![pop](./screenshots/xhs-images-styles/pop.webp) | ![notion](./screenshots/xhs-images-styles/notion.webp) | ![chalkboard](./screenshots/xhs-images-styles/chalkboard.webp) |
| pop | notion | chalkboard |

**レイアウト** (情報密度):
| レイアウト | 密度 | 最適な用途 |
|--------|---------|----------|
| `sparse` | 1〜2 項目 | 表紙、引用 |
| `balanced` | 3〜4 項目 | 通常のコンテンツ |
| `dense` | 5〜8 項目 | 知識カード、チートシート |
| `list` | 4〜7 項目 | チェックリスト、ランキング |
| `comparison` | 2 つの側面 | ビフォー/アフター、長所/短所 |
| `flow` | 3〜6 ステップ | プロセス、タイムライン |

**レイアウトのプレビュー**:

| | | |
|:---:|:---:|:---:|
| ![sparse](./screenshots/xhs-images-layouts/sparse.webp) | ![balanced](./screenshots/xhs-images-layouts/balanced.webp) | ![dense](./screenshots/xhs-images-layouts/dense.webp) |
| sparse | balanced | dense |
| ![list](./screenshots/xhs-images-layouts/list.webp) | ![comparison](./screenshots/xhs-images-layouts/comparison.webp) | ![flow](./screenshots/xhs-images-layouts/flow.webp) |
| list | comparison | flow |

#### baoyu-infographic

21 種類のレイアウトと 22 種類のビジュアルスタイルで、プロ品質のインフォグラフィックを生成します。コンテンツを分析してレイアウト×スタイルの組み合わせを推奨し、そのまま公開できるインフォグラフィックを生成します。

```bash
# Auto-recommend combinations based on content
/baoyu-infographic path/to/content.md

# Specify layout
/baoyu-infographic path/to/content.md --layout hub-spoke

# Specify style (default: craft-handmade)
/baoyu-infographic path/to/content.md --style technical-schematic

# Specify both
/baoyu-infographic path/to/content.md --layout funnel --style corporate-memphis

# With aspect ratio (named preset or custom W:H)
/baoyu-infographic path/to/content.md --aspect portrait
/baoyu-infographic path/to/content.md --aspect 3:4
```

**オプション**:
| オプション | 説明 |
|--------|-------------|
| `--layout <name>` | 情報レイアウト (21 種類、デフォルト: bento-grid) |
| `--style <name>` | ビジュアルスタイル (22 種類、デフォルト: craft-handmade) |
| `--aspect <ratio>` | 名前付き: landscape (16:9)、portrait (9:16)、square (1:1)。カスタム: 任意の W:H 比 (例: 3:4、4:3、2.35:1) |
| `--lang <code>` | 出力言語 (en、zh、ja など) |
| `--no-confirm` | 組み合わせの確認ステップをスキップして直接生成します |
| `--ref <files...>` | スタイル、パレット、構図、被写体の参考にする画像 |

**レイアウト** (情報構造):

| レイアウト | 最適な用途 |
|--------|----------|
| `linear-progression` | タイムライン、プロセス、チュートリアル |
| `binary-comparison` | A 対 B、ビフォー/アフター、長所/短所 |
| `comparison-matrix` | 多要素の比較 |
| `hierarchical-layers` | ピラミッド、優先度レベル |
| `tree-branching` | カテゴリ、分類体系 |
| `hub-spoke` | 中心概念と関連項目 |
| `structural-breakdown` | 分解図、断面図 |
| `bento-grid` | 複数のトピック、概要 (デフォルト) |
| `iceberg` | 表面と隠れた側面 |
| `bridge` | 問題と解決策 |
| `funnel` | コンバージョン、絞り込み |
| `isometric-map` | 空間的な関係 |
| `dashboard` | 指標、KPI |
| `periodic-table` | 分類されたコレクション |
| `comic-strip` | ストーリー、シーケンス |
| `story-mountain` | プロット構成、緊張の高まり |
| `jigsaw` | 相互につながった要素 |
| `venn-diagram` | 重なり合う概念 |
| `winding-roadmap` | 道のり、マイルストーン |
| `circular-flow` | サイクル、繰り返すプロセス |
| `dense-modules` | 高密度のモジュール、データ豊富なガイド |

**旧レイアウトのプレビュー**:

> **注:** これらの画像は旧レイアウト名のままで、視覚的な参考としてのみ掲載しています。上記の現在の `--layout` の値を表すものではありません。
>
> **TODO:** 現在の 21 種類のレイアウトすべてのプレビューを再生成し、このギャラリーを置き換えます。

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

**スタイル** (ビジュアルの美学):

| スタイル | 説明 |
|-------|-------------|
| `craft-handmade` (デフォルト) | 手描きイラスト、ペーパークラフト風 |
| `claymation` | 3D の粘土人形、遊び心のあるストップモーション |
| `kawaii` | 日本的なかわいさ、大きな目、パステルカラー |
| `storybook-watercolor` | 柔らかな水彩イラスト、幻想的 |
| `chalkboard` | 黒板にカラフルなチョーク |
| `cyberpunk-neon` | 暗い背景にネオンの輝き、未来的 |
| `bold-graphic` | コミック風、網点、高コントラスト |
| `aged-academia` | ヴィンテージの科学、セピア調のスケッチ |
| `corporate-memphis` | フラットなベクターの人物、鮮やかな塗り |
| `technical-schematic` | 設計図、アイソメトリック 3D、エンジニアリング |
| `origami` | 折り紙の形、幾何学的 |
| `pixel-art` | レトロな 8 ビット、懐かしのゲーム風 |
| `ui-wireframe` | グレースケールのボックス、インターフェースのモックアップ |
| `subway-map` | 路線図、色分けされた線 |
| `ikea-manual` | ミニマルな線画、組み立て説明書風 |
| `knolling` | 整然と並べたフラットレイ、真上からの視点 |
| `lego-brick` | おもちゃのブロック構造、遊び心 |
| `pop-laboratory` | 設計図のグリッド、座標マーカー、ラボの精密さ |
| `morandi-journal` | 手描きの落書き、温かみのあるモランディカラー |
| `retro-pop-grid` | 1970 年代のポップアート、スイスグリッド、太いアウトライン |
| `hand-drawn-edu` | マカロンパステル、手描きの揺らぎ、棒人間 |
| `retro-popup-pop` | レトロなポップアップコラージュ、ヴィンテージ UI、フラットなポップカラー |

**一部のスタイルのプレビュー**:

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

#### baoyu-diagram

ソース資料から、そのまま公開できる SVG ダイアグラム (フローチャート、シーケンス/プロトコル図、構造/アーキテクチャ図、直感を伝える説明図) を生成します。入力資料を分析してダイアグラムの種類と分割方針を推奨し、計画を一度確認した後、すべてのダイアグラムを生成します。Claude は一貫したデザインシステムに従って実際の SVG コードを直接記述します。出力は、スタイルが埋め込まれ自動ダークモードに対応した自己完結型の `.svg` ファイルです。

```bash
# Topic string — skill analyzes and proposes a plan
/baoyu-diagram "how JWT authentication works"
/baoyu-diagram "Kubernetes architecture" --type structural
/baoyu-diagram "OAuth 2.0 flow"          --type sequence

# File path — skill reads, analyzes, and proposes a plan
/baoyu-diagram path/to/article.md

# Language and output path
/baoyu-diagram "微服务架构" --lang zh
/baoyu-diagram "build pipeline" --out docs/build-pipeline.svg
```

**オプション**:
| オプション | 説明 |
|--------|-------------|
| `--type <name>` | `flowchart`、`sequence`、`structural`、`illustrative`、`class`、`auto` (デフォルト)。種類の推奨をスキップします。 |
| `--lang <code>` | 出力言語 (en、zh、ja など) |
| `--out <path>` | 出力ファイルのパス。最も重要な側面に焦点を当てたダイアグラムを 1 つだけ生成します。 |

**ダイアグラムの種類**:

| 種類 | 読者のニーズ | トリガーとなる表現 |
|------|-------------|------------------------|
| `flowchart` | 手順を順番に説明してほしい | walk through、steps、process、lifecycle、workflow、state machine |
| `sequence` | 誰が誰と、どの順番でやり取りするか | protocol、handshake、auth flow、OAuth、TCP、request/response |
| `structural` | 何の中に何があり、どう構成されているかを見せてほしい | architecture、components、topology、layout、what's inside |
| `illustrative` | 直感をつかみたい — 仕組みを図にしてほしい | how does X work、explain X、intuition for、why does X do Y |
| `class` | どのような型があり、どう関連しているか | class diagram、UML、inheritance、interface、schema |

画像生成スキルではなく、LLM の画像モデルは呼び出しません。Claude がレイアウトの計算を手作業で行いながら SVG を手書きするため、すべてのダイアグラムがデザインシステムに従います。`@media (prefers-color-scheme: dark)` を含む `<style>` ブロックが埋め込まれているため、同じファイルがどこに埋め込まれてもライトモードとダークモードの両方で正しく表示されます。

#### baoyu-cover-image

Type × Palette × Rendering × Text × Mood の 5 つの次元で記事のカバー画像を生成します。11 種類のカラーパレットと 7 種類のレンダリングスタイルを組み合わせ、77 通りの組み合わせを作れます。

```bash
# Auto-select all dimensions based on content
/baoyu-cover-image path/to/article.md

# Quick mode: skip confirmation, use auto-selection
/baoyu-cover-image path/to/article.md --quick

# Specify dimensions (5D system)
/baoyu-cover-image path/to/article.md --type conceptual --palette cool --rendering digital
/baoyu-cover-image path/to/article.md --text title-subtitle --mood bold

# Style presets (backward-compatible shorthand)
/baoyu-cover-image path/to/article.md --style blueprint

# Specify aspect ratio (default: 16:9)
/baoyu-cover-image path/to/article.md --aspect 2.35:1

# Visual only (no title text)
/baoyu-cover-image path/to/article.md --no-title
```

**5 つの次元**:
- **Type**: `hero`, `conceptual`, `typography`, `metaphor`, `scene`, `minimal`
- **Palette**: `warm`, `elegant`, `cool`, `dark`, `earth`, `vivid`, `pastel`, `mono`, `retro`, `duotone`, `macaron`
- **Rendering**: `flat-vector`, `hand-drawn`, `painterly`, `digital`, `pixel`, `chalk`, `screen-print`
- **Text**: `none`, `title-only` (デフォルト), `title-subtitle`, `text-rich`
- **Mood**: `subtle`, `balanced` (デフォルト), `bold`

#### baoyu-slide-deck

コンテンツからプロフェッショナルなスライド画像を生成します。スタイル指示を含む詳細なアウトラインを作成し、その後スライドごとの画像を生成します。

```bash
# From markdown file
/baoyu-slide-deck path/to/article.md

# With style and audience
/baoyu-slide-deck path/to/article.md --style corporate
/baoyu-slide-deck path/to/article.md --audience executives

# Target slide count
/baoyu-slide-deck path/to/article.md --slides 15

# Outline only (no image generation)
/baoyu-slide-deck path/to/article.md --outline-only

# With language
/baoyu-slide-deck path/to/article.md --lang zh
```

**オプション**:

| オプション | 説明 |
|--------|-------------|
| `--style <name>` | ビジュアルスタイル: プリセット名または `custom` |
| `--audience <type>` | 対象: beginners、intermediate、experts、executives、general |
| `--lang <code>` | 出力言語 (en、zh、ja など) |
| `--slides <number>` | 目標スライド枚数 (推奨 8〜25、最大 30) |
| `--outline-only` | アウトラインのみ生成し、画像はスキップ |
| `--prompts-only` | アウトラインとプロンプトを生成し、画像はスキップ |
| `--images-only` | 既存のプロンプトから画像を生成 |
| `--regenerate <N>` | 特定のスライドを再生成: `3` または `2,5,8` |

**スタイルシステム**:

スタイルは 4 つの次元で構成されます: **Texture** × **Mood** × **Typography** × **Density**

| 次元 | オプション |
|-----------|---------|
| Texture | clean, grid, organic, pixel, paper |
| Mood | professional, warm, cool, vibrant, dark, neutral |
| Typography | geometric, humanist, handwritten, editorial, technical |
| Density | minimal, balanced, dense |

**プリセット** (あらかじめ設定された次元の組み合わせ):

| プリセット | 次元 | 最適な用途 |
|--------|------------|----------|
| `blueprint` (デフォルト) | grid + cool + technical + balanced | アーキテクチャ、システム設計 |
| `chalkboard` | organic + warm + handwritten + balanced | 教育、チュートリアル |
| `corporate` | clean + professional + geometric + balanced | 投資家向け資料、提案書 |
| `minimal` | clean + neutral + geometric + minimal | 経営層向けブリーフィング |
| `sketch-notes` | organic + warm + handwritten + balanced | 教育、チュートリアル |
| `watercolor` | organic + warm + humanist + minimal | ライフスタイル、ウェルネス |
| `dark-atmospheric` | clean + dark + editorial + balanced | エンターテインメント、ゲーム |
| `notion` | clean + neutral + geometric + dense | 製品デモ、SaaS |
| `bold-editorial` | clean + vibrant + editorial + balanced | 製品発表、基調講演 |
| `editorial-infographic` | clean + cool + editorial + dense | 技術解説、リサーチ |
| `fantasy-animation` | organic + vibrant + handwritten + minimal | 教育的なストーリーテリング |
| `intuition-machine` | clean + cool + technical + dense | 技術ドキュメント、学術 |
| `pixel-art` | pixel + vibrant + technical + balanced | ゲーム、開発者向けトーク |
| `scientific` | clean + cool + technical + dense | 生物学、化学、医療 |
| `vector-illustration` | clean + vibrant + humanist + balanced | クリエイティブ、子ども向けコンテンツ |
| `vintage` | paper + warm + editorial + balanced | 歴史、伝統 |

**スタイルのプレビュー**:

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

生成後、スライドは共有しやすいよう自動的に `.pptx` と `.pdf` ファイルにまとめられます。

#### baoyu-comic

アートスタイル × トーンを柔軟に組み合わせられる知識系マンガの作成ツールです。詳細なコマ割りと連続した画像生成により、オリジナルの教育マンガを作成します。

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

**オプション**:
| オプション | 値 |
|--------|--------|
| `--art` | `ligne-claire` (デフォルト), `manga`, `realistic`, `ink-brush`, `chalk` |
| `--tone` | `neutral` (デフォルト), `warm`, `dramatic`, `romantic`, `energetic`, `vintage`, `action` |
| `--style` | `ohmsha`, `wuxia`, `shoujo` (特別なルールを持つプリセット) |
| `--layout` | `standard` (デフォルト), `cinematic`, `dense`, `splash`, `mixed`, `webtoon` |
| `--aspect` | `3:4` (デフォルト、縦長), `4:3` (横長), `16:9` (ワイドスクリーン) |
| `--lang` | `auto` (デフォルト), `zh`, `en`, `ja` など |

**アートスタイル** (レンダリング手法):

| アートスタイル | 説明 |
|-----------|-------------|
| `ligne-claire` | 均一な線、フラットな色、ヨーロッパのバンド・デシネの伝統 (Tintin、Logicomix) |
| `manga` | 大きな目、日本のマンガの表現技法、豊かな感情表現 |
| `realistic` | デジタルペインティング、写実的なプロポーション、洗練された表現 |
| `ink-brush` | 中国の筆遣い、水墨のにじみ効果 |
| `chalk` | 黒板風の美しさ、手描きのぬくもり |

**トーン** (ムード/雰囲気):

| トーン | 説明 |
|------|-------------|
| `neutral` | バランスが取れた、理性的、教育的 |
| `warm` | 懐かしい、個人的、心が和む |
| `dramatic` | 高コントラスト、強烈、力強い |
| `romantic` | 柔らかい、美しい、装飾的な要素 |
| `energetic` | 明るい、ダイナミック、ワクワクする |
| `vintage` | 歴史的、年代を感じさせる、時代考証に忠実 |
| `action` | 集中線、インパクト効果、戦闘 |

**プリセット** (アート + トーン + 特別なルール):

| プリセット | 相当する組み合わせ | 特別なルール |
|--------|-----------|---------------|
| `ohmsha` | manga + neutral | 視覚的なメタファー、会話だけのコマは禁止、ガジェットの登場 |
| `wuxia` | ink-brush + action | 気のエフェクト、戦闘のビジュアル、雰囲気のある要素 |
| `shoujo` | manga + romantic | 装飾的な要素、瞳の描き込み、ロマンチックな場面 |

**レイアウト** (コマの配置):
| レイアウト | コマ数/ページ | 最適な用途 |
|--------|-------------|----------|
| `standard` | 4-6 | 会話、物語の流れ |
| `cinematic` | 2-4 | ドラマチックな場面、状況説明のショット |
| `dense` | 6-9 | 技術的な説明、タイムライン |
| `splash` | 1-2 (大ゴマ) | 重要な場面、真相が明かされる瞬間 |
| `mixed` | 3-7 (可変) | 複雑な物語、感情の起伏 |
| `webtoon` | 3-5 (縦スクロール) | Ohmsha 風チュートリアル、モバイルでの閲覧 |

**レイアウトのプレビュー**:

| | | |
|:---:|:---:|:---:|
| ![standard](./screenshots/comic-layouts/standard.webp) | ![cinematic](./screenshots/comic-layouts/cinematic.webp) | ![dense](./screenshots/comic-layouts/dense.webp) |
| standard | cinematic | dense |
| ![splash](./screenshots/comic-layouts/splash.webp) | ![mixed](./screenshots/comic-layouts/mixed.webp) | ![webtoon](./screenshots/comic-layouts/webtoon.webp) |
| splash | mixed | webtoon |

#### baoyu-article-illustrator

Type × Style × Palette の 3 次元アプローチによるスマートな記事イラストスキルです。記事の構成を分析し、視覚的な補足が必要な箇所を特定して、イラストを生成します。

```bash
# Auto-select type and style based on content
/baoyu-article-illustrator path/to/article.md

# Specify type and style
/baoyu-article-illustrator path/to/article.md --type flowchart --style notion

# With palette override
/baoyu-article-illustrator path/to/article.md --style vector-illustration --palette macaron
```

**タイプ** (情報の構造):

| タイプ | 説明 | 最適な用途 |
|------|-------------|----------|
| `infographic` | データの可視化、チャート、指標 | 技術記事、データ分析 |
| `scene` | 雰囲気のあるイラスト、ムードの表現 | 物語、個人的なストーリー |
| `flowchart` | プロセス図、ステップの可視化 | チュートリアル、ワークフロー |
| `comparison` | 横並び、ビフォー/アフターの対比 | 製品比較 |
| `framework` | コンセプトマップ、関係図 | 方法論、アーキテクチャ |
| `timeline` | 時系列の進行 | 歴史、プロジェクトの進捗 |

**スタイル** (レンダリング手法):

| スタイル | 説明 | 最適な用途 |
|-------|-------------|----------|
| `notion` (デフォルト) | ミニマルな手描きの線画 | 知識共有、SaaS、生産性 |
| `elegant` | 上品で洗練された表現 | ビジネス、ソートリーダーシップ |
| `warm` | 親しみやすく、取っつきやすい | 自己成長、ライフスタイル |
| `minimal` | 極めてすっきりした、禅のような表現 | 哲学、ミニマリズム |
| `blueprint` | 技術的な設計図 | アーキテクチャ、システム設計 |
| `watercolor` | 自然なぬくもりのある柔らかな芸術表現 | ライフスタイル、旅行、クリエイティブ |
| `editorial` | 雑誌風のインフォグラフィック | 技術解説、ジャーナリズム |
| `scientific` | 学術的で正確な図 | 生物学、化学、技術 |

**パレット** (任意の配色の上書き):

| パレット | 説明 | 最適な用途 |
|---------|-------------|----------|
| `macaron` | 温かみのあるクリーム地に柔らかなパステルのブロック (ブルー、ミント、ラベンダー、ピーチ) | 教育、知識、チュートリアル |
| `warm` | 柔らかなピーチ地に温かみのあるアースカラー、寒色なし | ブランド、製品、ライフスタイル |
| `neon` | ダークパープル地に鮮やかなネオン | ゲーム、レトロ、ポップカルチャー |

**スタイルのプレビュー**:

| | | |
|:---:|:---:|:---:|
| ![notion](./screenshots/article-illustrator-styles/notion.webp) | ![elegant](./screenshots/article-illustrator-styles/elegant.webp) | ![warm](./screenshots/article-illustrator-styles/warm.webp) |
| notion | elegant | warm |
| ![minimal](./screenshots/article-illustrator-styles/minimal.webp) | ![blueprint](./screenshots/article-illustrator-styles/blueprint.webp) | ![watercolor](./screenshots/article-illustrator-styles/watercolor.webp) |
| minimal | blueprint | watercolor |
| ![editorial](./screenshots/article-illustrator-styles/editorial.webp) | ![scientific](./screenshots/article-illustrator-styles/scientific.webp) | |
| editorial | scientific | |

#### baoyu-post-to-x

コンテンツや記事を X (Twitter) に投稿します。画像付きの通常の投稿と X Articles (長文 Markdown) に対応しています。CDP 経由で実際の Chrome を使用し、自動化対策を回避します。

プレーンテキストの入力は通常の投稿として扱われます。Markdown ファイルは X Articles として扱われます。スクリプトがブラウザにコンテンツを入力し、ユーザーが内容を確認して手動で公開します。

```bash
# Post with text
/baoyu-post-to-x "Hello from AI Agent!"

# Post with images
/baoyu-post-to-x "Check this out" --image photo.png

# Post X Article
/baoyu-post-to-x --article path/to/article.md
```

#### baoyu-post-to-wechat

WeChat 公式アカウント (微信公众号) にコンテンツを投稿します。2 つのモードがあります:

**画像テキスト (贴图)** - 複数の画像と短いタイトル/本文:

```bash
/baoyu-post-to-wechat 贴图 --markdown article.md --images ./photos/
/baoyu-post-to-wechat 贴图 --markdown article.md --image img1.png --image img2.png --image img3.png
/baoyu-post-to-wechat 贴图 --title "标题" --content "内容" --image img1.png --submit
```

**記事 (文章)** - リッチな書式を備えた完全な Markdown/HTML:

```bash
/baoyu-post-to-wechat 文章 --markdown article.md
/baoyu-post-to-wechat 文章 --markdown article.md --theme grace
/baoyu-post-to-wechat 文章 --html article.html
```

**公開方法**:

| 方法 | 速度 | 必要なもの |
|--------|-------|--------------|
| API (推奨) | 高速 | API 認証情報 (ローカル IP が WeChat の許可リストに登録済み) |
| ブラウザ | 低速 | Chrome、ログインセッション |
| リモート API | 高速 | API 認証情報 + SSH で接続でき、IP が WeChat の許可リストに登録されたサーバー |

**API の設定** (より高速に公開するため):

```bash
# Add to .baoyu-skills/.env (project-level) or ~/.baoyu-skills/.env (user-level)
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
```

認証情報の取得方法:
1. https://developers.weixin.qq.com/platform/ にアクセスします
2. 我的业务 → 公众号 → 开发密钥 に移動します
3. 開発キーを作成し、AppID/AppSecret をコピーします
4. お使いのマシンの IP をホワイトリストに追加します

**ブラウザ方式** (API の設定は不要): Google Chrome が必要です。初回実行時にブラウザが開き、QR コードでログインします (セッションは保持されます)。

**リモート API 方式** (WeChat の IP 許可リストにローカルマシンが含まれない場合): IP が許可リストに登録されたサーバーへの SSH SOCKS5 ダイナミックポートフォワードを通して、WeChat API の呼び出しをトンネリングします。リモートホストにはファイルが書き込まれず、`AppSecret` がローカルプロセスの外に出ることもありません。EXTEND.md に以下を追加してください:

```yaml
# Optional: only set when WeChat's IP allowlist excludes your local machine
remote_publish_host: server.example.com
remote_publish_user: deploy
remote_publish_identity_file: ~/.ssh/id_ed25519
```

その後、`--remote` を付けて公開します (または `default_publish_method: remote-api` を設定します)。認証は SSH キーのみで、型付きの `remote_publish_*` キーだけが有効になります。

**複数アカウントのサポート**: `EXTEND.md` で複数の WeChat 公式アカウントを管理できます:

```bash
mkdir -p .baoyu-skills/baoyu-post-to-wechat
```

`.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` を作成します:

```yaml
# Global settings (shared across all accounts)
default_theme: default
default_color: blue

# Account list
accounts:
  - name: My Tech Blog
    alias: tech-blog
    default: false
    default_publish_method: api
    default_author: Author Name
    need_open_comment: 1
    only_fans_can_comment: 0
    app_id: your_wechat_app_id
    app_secret: your_wechat_app_secret
  - name: AI Newsletter
    alias: ai-news
    default_publish_method: browser
    default_author: AI Newsletter
    need_open_comment: 1
    only_fans_can_comment: 0
```

| 設定済みのアカウント | 動作 |
|---------------------|----------|
| `accounts` ブロックなし | シングルアカウントモード (後方互換) |
| 1 アカウント | 自動選択され、確認なし |
| 2 アカウント以上 | 選択を求められるか、`--account <alias>` を使用 |
| 1 アカウントに `default: true` がある | デフォルトとして事前選択 |

各アカウントには独立した Chrome プロファイルが割り当てられ、ログインセッションが分離されます (ブラウザ方式)。API 認証情報は EXTEND.md に直接記述するか、エイリアスをプレフィックスにしたキーで `.env` に設定できます (例: `WECHAT_TECH_BLOG_APP_ID`)。

#### baoyu-post-to-weibo

Weibo (微博) にコンテンツを投稿します。テキスト、画像、動画を含む通常の投稿と、Markdown 入力によるヘッドライン記事 (头条文章) に対応しています。自動化対策を回避するため、CDP 経由で実際の Chrome を使用します。

**通常の投稿** - テキスト + 画像/動画 (最大 18 ファイル):

```bash
# Post with text
/baoyu-post-to-weibo "Hello Weibo!"

# Post with images
/baoyu-post-to-weibo "Check this out" --image photo.png

# Post with video
/baoyu-post-to-weibo "Watch this" --video clip.mp4
```

**ヘッドライン記事 (头条文章)** - 長文の Markdown:

```bash
# Publish article
/baoyu-post-to-weibo --article article.md

# With cover image
/baoyu-post-to-weibo --article article.md --cover cover.jpg
```

**記事のオプション**:
| オプション | 説明 |
|--------|-------------|
| `--cover <path>` | カバー画像 |
| `--title <text>` | タイトルを上書き (最大 32 文字) |
| `--summary <text>` | 概要を上書き (最大 44 文字) |

**注意**: スクリプトはブラウザにコンテンツを入力します。ユーザーが内容を確認し、手動で公開します。初回実行時は Weibo への手動ログインが必要です (セッションは保持されます)。

### AI 生成スキル

AI を活用した生成バックエンドです。

#### baoyu-image-gen

OpenAI GPT Image 2、Azure OpenAI、Google、OpenRouter、DashScope (Aliyun Tongyi Wanxiang)、MiniMax、Jimeng (即梦)、Seedream (豆包)、Replicate の API を使用する、AI SDK ベースの画像生成です。テキストからの画像生成、参照画像、アスペクト比、カスタムサイズ、バッチ生成、品質プリセットに対応しています。

```bash
# Basic generation (auto-detect provider)
/baoyu-image-gen --prompt "A cute cat" --image cat.png

# With aspect ratio
/baoyu-image-gen --prompt "A landscape" --image landscape.png --ar 16:9

# High quality (2k)
/baoyu-image-gen --prompt "A banner" --image banner.png --quality 2k

# Specific provider
/baoyu-image-gen --prompt "A cat" --image cat.png --provider openai --model gpt-image-2

# Azure OpenAI (model = deployment name)
/baoyu-image-gen --prompt "A cat" --image cat.png --provider azure --model gpt-image-2

# OpenRouter
/baoyu-image-gen --prompt "A cat" --image cat.png --provider openrouter

# OpenRouter with reference images
/baoyu-image-gen --prompt "Make it blue" --image out.png --provider openrouter --model google/gemini-3.1-flash-image --ref source.png

# DashScope (Aliyun Tongyi Wanxiang)
/baoyu-image-gen --prompt "一只可爱的猫" --image cat.png --provider dashscope

# DashScope with custom size
/baoyu-image-gen --prompt "为咖啡品牌设计一张 21:9 横幅海报，包含清晰中文标题" --image banner.png --provider dashscope --model qwen-image-2.0-pro --size 2048x872

# Z.AI GLM-Image
/baoyu-image-gen --prompt "一张带清晰中文标题的科技海报" --image out.png --provider zai

# MiniMax
/baoyu-image-gen --prompt "A fashion editorial portrait by a bright studio window" --image out.jpg --provider minimax

# MiniMax with subject reference
/baoyu-image-gen --prompt "A girl stands by the library window, cinematic lighting" --image out.jpg --provider minimax --model image-01 --ref portrait.png --ar 16:9

# Replicate (default: google/nano-banana-2)
/baoyu-image-gen --prompt "A cat" --image cat.png --provider replicate

# Replicate Seedream 4.5
/baoyu-image-gen --prompt "A studio portrait" --image portrait.png --provider replicate --model bytedance/seedream-4.5 --ar 3:2

# Replicate Wan 2.7 Image Pro
/baoyu-image-gen --prompt "A concept frame" --image frame.png --provider replicate --model wan-video/wan-2.7-image-pro --size 2048x1152

# Jimeng (即梦)
/baoyu-image-gen --prompt "一只可爱的猫" --image cat.png --provider jimeng

# Seedream (豆包)
/baoyu-image-gen --prompt "一只可爱的猫" --image cat.png --provider seedream

# With reference images (Google, OpenAI, Azure OpenAI, OpenRouter, Replicate, MiniMax, or Seedream 5.0/4.5/4.0)
/baoyu-image-gen --prompt "Make it blue" --image out.png --ref source.png

# Batch mode
/baoyu-image-gen --batchfile batch.json --jobs 4 --json
```

**オプション**:
| オプション | 説明 |
|--------|-------------|
| `--prompt`, `-p` | プロンプトテキスト |
| `--promptfiles` | ファイルからプロンプトを読み込みます (連結されます) |
| `--image` | 出力画像のパス (必須) |
| `--batchfile` | 複数画像を生成するための JSON バッチファイル |
| `--jobs` | バッチモードのワーカー数 |
| `--provider` | `google`、`openai`、`azure`、`openrouter`、`dashscope`、`zai`、`minimax`、`jimeng`、`seedream`、`replicate`、または `agnes` |
| `--model`, `-m` | モデル ID またはデプロイ名。Azure はデプロイ名、OpenRouter は完全なモデル ID を使用します。Z.AI は `glm-image`、MiniMax は `image-01` / `image-01-live` を使用します |
| `--ar` | アスペクト比 (例: `16:9`、`1:1`、`4:3`) |
| `--size` | サイズ (例: `1024x1024`。`gpt-image-2` は最大辺 3840px までの有効なカスタムサイズを受け付けます) |
| `--quality` | `normal` または `2k` (デフォルト: `2k`) |
| `--imageSize` | Google/OpenRouter 向けの `1K`、`2K`、または `4K` |
| `--imageApiDialect` | OpenAI 互換ゲートウェイ向けの `openai-native` または `ratio-metadata` |
| `--ref` | 参照画像 (Google、OpenAI、Azure OpenAI、OpenRouter、Replicate の対応ファミリー、MiniMax、または Seedream 5.0/4.5/4.0) |
| `--n` | 1 リクエストあたりの画像数 (`replicate` は現在 `--n 1` が必須です) |
| `--json` | JSON 出力 |

**環境変数** (設定方法は[環境設定](#環境設定)を参照してください):
| 変数 | 説明 | デフォルト |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API キー | - |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API キー | - |
| `OPENROUTER_API_KEY` | OpenRouter API キー | - |
| `GOOGLE_API_KEY` | Google API キー | - |
| `GEMINI_API_KEY` | `GOOGLE_API_KEY` のエイリアス | - |
| `DASHSCOPE_API_KEY` | DashScope API キー (Aliyun) | - |
| `ZAI_API_KEY` | Z.AI API キー | - |
| `BIGMODEL_API_KEY` | Z.AI API キーの後方互換エイリアス | - |
| `MINIMAX_API_KEY` | MiniMax API キー | - |
| `REPLICATE_API_TOKEN` | Replicate API トークン | - |
| `JIMENG_ACCESS_KEY_ID` | Jimeng Volcengine アクセスキー | - |
| `JIMENG_SECRET_ACCESS_KEY` | Jimeng Volcengine シークレットキー | - |
| `ARK_API_KEY` | Seedream Volcengine ARK API キー | - |
| `OPENAI_IMAGE_MODEL` | OpenAI のモデル | `gpt-image-2` |
| `AZURE_OPENAI_DEPLOYMENT` | Azure のデフォルトのデプロイ名 | - |
| `AZURE_OPENAI_IMAGE_MODEL` | Azure のデプロイ/モデルの後方互換エイリアス | `gpt-image-2` |
| `OPENROUTER_IMAGE_MODEL` | OpenRouter のモデル | `google/gemini-3.1-flash-image` |
| `GOOGLE_IMAGE_MODEL` | Google のモデル | `gemini-3-pro-image` |
| `DASHSCOPE_IMAGE_MODEL` | DashScope のモデル | `qwen-image-2.0-pro` |
| `ZAI_IMAGE_MODEL` | Z.AI のモデル | `glm-image` |
| `BIGMODEL_IMAGE_MODEL` | Z.AI のモデルの後方互換エイリアス | `glm-image` |
| `MINIMAX_IMAGE_MODEL` | MiniMax のモデル | `image-01` |
| `REPLICATE_IMAGE_MODEL` | Replicate のモデル | `google/nano-banana-2` |
| `JIMENG_IMAGE_MODEL` | Jimeng のモデル | `jimeng_t2i_v40` |
| `SEEDREAM_IMAGE_MODEL` | Seedream のモデル | `doubao-seedream-5-0-260128` |
| `OPENAI_BASE_URL` | カスタム OpenAI エンドポイント | - |
| `OPENAI_IMAGE_API_DIALECT` | OpenAI 互換の画像 API の方言 (`openai-native` または `ratio-metadata`) | `openai-native` |
| `OPENAI_IMAGE_USE_CHAT` | OpenAI の画像生成に `/chat/completions` を使用します | `false` |
| `AZURE_OPENAI_BASE_URL` | Azure のリソースまたはデプロイのエンドポイント | - |
| `AZURE_API_VERSION` | Azure の画像 API バージョン | `2025-04-01-preview` |
| `OPENROUTER_BASE_URL` | カスタム OpenRouter エンドポイント | `https://openrouter.ai/api/v1` |
| `OPENROUTER_HTTP_REFERER` | OpenRouter のアトリビューション用のアプリ/サイト URL (任意) | - |
| `OPENROUTER_TITLE` | OpenRouter のアトリビューション用のアプリ名 (任意) | - |
| `GOOGLE_BASE_URL` | カスタム Google エンドポイント | - |
| `DASHSCOPE_BASE_URL` | カスタム DashScope エンドポイント | - |
| `ZAI_BASE_URL` | カスタム Z.AI エンドポイント | `https://api.z.ai/api/paas/v4` |
| `BIGMODEL_BASE_URL` | Z.AI エンドポイントの後方互換エイリアス | - |
| `MINIMAX_BASE_URL` | カスタム MiniMax エンドポイント | `https://api.minimaxi.com` |
| `REPLICATE_BASE_URL` | カスタム Replicate エンドポイント | - |
| `JIMENG_BASE_URL` | カスタム Jimeng エンドポイント | `https://visual.volcengineapi.com` |
| `JIMENG_REGION` | Jimeng のリージョン | `cn-north-1` |
| `SEEDREAM_BASE_URL` | カスタム Seedream エンドポイント | `https://ark.cn-beijing.volces.com/api/v3` |
| `BAOYU_IMAGE_GEN_MAX_WORKERS` | バッチのワーカー数の上限を上書き | `10` |
| `BAOYU_IMAGE_GEN_<PROVIDER>_CONCURRENCY` | プロバイダーの同時実行数を上書き | プロバイダーごとに異なる |
| `BAOYU_IMAGE_GEN_<PROVIDER>_START_INTERVAL_MS` | プロバイダーのリクエスト開始間隔を上書き | プロバイダーごとに異なる |

**プロバイダーに関する注意**:
- Azure OpenAI: `--model` は基盤となるモデルファミリーではなく、Azure のデプロイ名を意味します。
- DashScope: カスタムの `--size`、`21:9`、および中国語/英語テキストの高品質なレンダリングには、`qwen-image-2.0-pro` がデフォルトとして推奨されます。
- Z.AI: ポスター、図、テキストの多い中国語/英語の画像には `glm-image` が推奨されます。参照画像には対応していません。
- MiniMax: `image-01` はドキュメントに記載されたカスタムの `width` / `height` に対応しています。`image-01-live` は低レイテンシで、`--ar` との組み合わせで最も効果を発揮します。
- MiniMax の参照画像は `subject_reference` として送信されます。現在の API はキャラクター / ポートレートの一貫性に特化しています。
- Jimeng は参照画像に対応していません。
- Seedream の参照画像は Seedream 5.0 / 4.5 / 4.0 で対応しており、Seedream 3.0 では対応していません。
- Replicate のデフォルトは `google/nano-banana-2` です。`baoyu-image-gen` は `google/nano-banana*`、`bytedance/seedream-4.5`、`bytedance/seedream-5-lite`、`wan-video/wan-2.7-image`、`wan-video/wan-2.7-image-pro` に対してのみ Replicate の詳細オプションを有効にします。
- Replicate は現在、1 リクエストにつき出力画像を 1 枚だけ保存します。余分な結果を黙って破棄する代わりに、`--n > 1` はローカルでブロックされます。
- Replicate のモデルの動作はファミリーごとに異なります。nano-banana は `--quality` / `--ar` を使用し、Seedream は検証済みの `--size` / `--ar` を使用し、Wan は検証済みの `--size` を使用します (`--ar` はローカルで具体的なサイズに変換されます)。

**プロバイダーの自動選択**:
1. `--provider` が指定されている場合 → それを使用します
2. `--ref` が指定され、プロバイダーが指定されていない場合 → Google、次に OpenAI、Azure、OpenRouter、Replicate、Seedream、MiniMax、最後に Agnes の順に試します
3. API キーが 1 つだけ利用可能な場合 → そのプロバイダーを使用します
4. 複数のプロバイダーが利用可能な場合 → Google をデフォルトとし、次に OpenAI、Azure、OpenRouter、DashScope、Z.AI、MiniMax、Replicate、Jimeng、Seedream、Agnes の順になります

#### baoyu-danger-gemini-web

Gemini Web と連携してテキストと画像を生成します。

**テキスト生成:**

```bash
/baoyu-danger-gemini-web "Hello, Gemini"
/baoyu-danger-gemini-web --prompt "Explain quantum computing"
```

**画像生成:**

```bash
/baoyu-danger-gemini-web --prompt "A cute cat" --image cat.png
/baoyu-danger-gemini-web --promptfiles system.md content.md --image out.png
```

### ユーティリティスキル

コンテンツ処理のためのユーティリティツールです。

#### baoyu-youtube-transcript

YouTube 動画の文字起こし/字幕とカバー画像をダウンロードします。複数言語、翻訳、チャプター、話者の識別に対応しています。生データをキャッシュするため、すばやく再フォーマットできます。

```bash
# Default: markdown with timestamps
/baoyu-youtube-transcript https://www.youtube.com/watch?v=VIDEO_ID

# Specify languages (priority order)
/baoyu-youtube-transcript https://youtu.be/VIDEO_ID --languages zh,en,ja

# With chapters and speaker identification
/baoyu-youtube-transcript https://youtu.be/VIDEO_ID --chapters --speakers

# SRT subtitle format
/baoyu-youtube-transcript https://youtu.be/VIDEO_ID --format srt

# List available transcripts
/baoyu-youtube-transcript https://youtu.be/VIDEO_ID --list
```

**オプション**:
| オプション | 説明 | デフォルト |
|--------|-------------|---------|
| `<url-or-id>` | YouTube の URL または動画 ID | 必須 |
| `--languages <codes>` | 言語コード (カンマ区切り) | `en` |
| `--format <fmt>` | 出力形式: `text`、`srt` | `text` |
| `--translate <code>` | 指定した言語に翻訳します | |
| `--chapters` | 動画の説明文からチャプターを分割します | |
| `--speakers` | 話者の識別 (AI による後処理が必要です) | |
| `--no-timestamps` | タイムスタンプを無効にします | |
| `--list` | 利用可能な文字起こしを一覧表示します | |
| `--refresh` | キャッシュを無視して強制的に再取得します | |

#### baoyu-url-to-markdown

Chrome CDP 経由で任意の URL を取得し、クリーンな Markdown に変換します。レンダリングされた HTML のスナップショットを Markdown と一緒に保存し、Defuddle が失敗した場合は自動的に従来の抽出器にフォールバックします。

```bash
# Auto mode (default) - capture when page loads
/baoyu-url-to-markdown https://example.com/article

# Wait mode - for login-required pages
/baoyu-url-to-markdown https://example.com/private --wait

# Save to specific file
/baoyu-url-to-markdown https://example.com/article -o output.md
```

**キャプチャモード**:
| モード | 説明 | 最適な用途 |
|------|-------------|----------|
| 自動 (デフォルト) | ページの読み込み直後にキャプチャします | 公開ページ、静的コンテンツ |
| 待機 (`--wait`) | ユーザーの合図を待ってからキャプチャします | ログインが必要なページ、動的コンテンツ |

**オプション**:
| オプション | 説明 |
|--------|-------------|
| `<url>` | 取得する URL |
| `-o <path>` | 出力ファイルのパス |
| `--wait` | ユーザーの合図を待ってからキャプチャします |
| `--timeout <ms>` | ページ読み込みのタイムアウト (デフォルト: 30000) |

#### baoyu-danger-x-to-markdown

X (Twitter) のコンテンツを Markdown 形式に変換します。ツイートのスレッドと X Articles に対応しています。

```bash
# Convert tweet to markdown
/baoyu-danger-x-to-markdown https://x.com/username/status/123456

# Save to specific file
/baoyu-danger-x-to-markdown https://x.com/username/status/123456 -o output.md

# JSON output
/baoyu-danger-x-to-markdown https://x.com/username/status/123456 --json

# Download media (images/videos) to local files
/baoyu-danger-x-to-markdown https://x.com/username/status/123456 --download-media
```

**対応している URL:**
- `https://x.com/<user>/status/<id>`
- `https://twitter.com/<user>/status/<id>`
- `https://x.com/i/article/<id>`

**認証:** 環境変数 (`X_AUTH_TOKEN`、`X_CT0`) または Chrome のログインによる Cookie ベースの認証を使用します。

#### baoyu-compress-image

品質を保ちながら画像を圧縮し、ファイルサイズを削減します。

```bash
/baoyu-compress-image path/to/image.png
/baoyu-compress-image path/to/images/ --quality 80
```

#### baoyu-format-markdown

プレーンテキストや Markdown ファイルを、適切な frontmatter、タイトル、要約、見出し、太字、リスト、コードブロックで整形します。

```bash
# Format a markdown file
/baoyu-format-markdown path/to/article.md

# Format with specific output
/baoyu-format-markdown path/to/draft.md
```

**ワークフロー**:
1. ソースファイルを読み込み、コンテンツの構造を分析します
2. YAML frontmatter (title、slug、summary、coverImage) を確認または作成します
3. タイトルを処理します: 既存のものを使用、H1 から抽出、または候補を生成します
4. 整形を適用します: 見出し、太字、リスト、コードブロック、引用
5. `{filename}-formatted.md` に保存します
6. タイポグラフィスクリプトを実行します: ASCII 引用符→全角引用符、CJK のスペーシング、autocorrect

**Frontmatter フィールド**:
| フィールド | 処理 |
|-------|------------|
| `title` | 既存のものを使用、H1 から抽出、または候補を生成 |
| `slug` | ファイルパスから推測、またはタイトルから生成 |
| `summary` | 読者を引きつける要約を生成 (100〜150 文字) |
| `coverImage` | 同じディレクトリに `imgs/cover.png` があるか確認 |

**整形ルール**:
| 要素 | 書式 |
|---------|--------|
| タイトル | `#`、`##`、`###` の階層 |
| 要点 | `**bold**` |
| 並列の項目 | `-` 箇条書きまたは `1.` 番号付きリスト |
| コード/コマンド | `` `inline` `` または ` ```block``` ` |
| 引用 | `>` ブロック引用 |

#### baoyu-markdown-to-html

Markdown ファイルを、WeChat 互換のテーマ、シンタックスハイライト、外部リンクのオプションの文末引用を備えたスタイル付き HTML に変換します。

```bash
# Basic conversion
/baoyu-markdown-to-html article.md

# Theme + color
/baoyu-markdown-to-html article.md --theme grace --color red

# Convert ordinary external links to bottom citations
/baoyu-markdown-to-html article.md --cite
```

#### baoyu-translate

記事やドキュメントを言語間で翻訳します。quick (直接翻訳)、normal (分析に基づく翻訳)、refined (レビューと推敲を含む、出版品質の完全なワークフロー) の 3 つのモードがあります。

```bash
# Normal mode (default) - analyze then translate
/translate article.md --to zh-CN

# Quick mode - direct translation
/translate article.md --mode quick --to ja

# Refined mode - full workflow with review and polish
/translate article.md --mode refined --to zh-CN

# Translate a URL
/translate https://example.com/article --to zh-CN

# Specify audience
/translate article.md --to zh-CN --audience technical

# Specify style
/translate article.md --to zh-CN --style humorous

# With additional glossary
/translate article.md --to zh-CN --glossary my-terms.md
```

**オプション**:
| オプション | 説明 |
|--------|-------------|
| `<source>` | ファイルパス、URL、またはインラインテキスト |
| `--mode <mode>` | `quick`、`normal` (デフォルト)、`refined` |
| `--from <lang>` | ソース言語 (省略時は自動検出) |
| `--to <lang>` | ターゲット言語 (デフォルト: `zh-CN`) |
| `--audience <type>` | 想定読者のプロファイル (デフォルト: `general`) |
| `--style <style>` | 翻訳スタイル (デフォルト: `storytelling`) |
| `--glossary <file>` | 追加の用語集ファイル |

**モード**:
| モード | ステップ | ユースケース |
|------|-------|----------|
| Quick | 翻訳 | 短いテキスト、カジュアルなコンテンツ |
| Normal | 分析 → 翻訳 | 記事、ブログ投稿 |
| Refined | 分析 → 翻訳 → レビュー → 推敲 | 出版品質のドキュメント |

normal モードが完了した後、「继续润色」または「refine」と返信すると、レビューと推敲のステップに進めます。

**想定読者のプリセット**:
| 値 | 説明 |
|-------|-------------|
| `general` | 一般の読者 (デフォルト) — 平易な言葉、訳注を多めに |
| `technical` | 開発者 / エンジニア — 一般的な技術用語への注釈を少なめに |
| `academic` | 研究者 / 学者 — フォーマルな文体、正確な用語 |
| `business` | ビジネスパーソン — ビジネスに適したトーン |

独自の想定読者の説明も指定できます。例: `--audience "AI-interested general readers"`。

**スタイルのプリセット**:
| 値 | 説明 |
|-------|-------------|
| `storytelling` | 引き込まれる語り口 (デフォルト) — なめらかなつなぎ、生き生きとした表現 |
| `formal` | プロフェッショナルで構造的 — 中立的なトーン、口語表現なし |
| `technical` | 正確なドキュメント調 — 簡潔、専門用語が多め |
| `literal` | 原文の構造に忠実 — 再構成は最小限 |
| `academic` | 学術的で厳密 — フォーマルな文体、複雑な構文も可 |
| `business` | 簡潔で成果重視 — 行動志向、経営層向け |
| `humorous` | ユーモアを保ちつつ翻案 — 機知に富み、笑いの効果を再現 |
| `conversational` | カジュアルな話し言葉 — 友人に説明するような親しみやすさ |
| `elegant` | 文学的で洗練された文章 — 美的に洗練され、丁寧に練られた表現 |

独自のスタイルの説明も指定できます。例: `--style "poetic and lyrical"`。

**機能**:
- EXTEND.md による独自の用語集 (英→中の用語集を内蔵)
- 注釈の深さを調整できる、想定読者を考慮した翻訳
- 長いドキュメント (4000 語以上) の自動チャンク分割と、サブエージェントによる並列翻訳
- 比喩表現を逐語訳ではなく意味に基づいて解釈
- 文化的・分野固有の言及に対する訳注
- すべての中間ファイルを保持した出力ディレクトリ

#### baoyu-wechat-summary

WeChat グループチャットのハイライトを、構造化されたダイジェストにまとめます。[wx-cli](https://github.com/jackwener/wx-cli) を使って、グループのメッセージからトピック、発言の引用、統計を抽出します。グループごとの履歴、ユーザーごとのプロファイル、グループごとの事実の記憶を実行をまたいで保持します。通常版と辛口 (毒舌) 版に対応し、チャット内で出た `@bot` の質問にも回答します。

```bash
# Summarize a group's recent messages
/baoyu-wechat-summary 相亲相爱一家人 最近 1 天

# Weekly summary
/baoyu-wechat-summary AI 技术群 最近 7 天

# Incremental (since last digest)
/baoyu-wechat-summary 相亲相爱一家人

# Roast version
/baoyu-wechat-summary 相亲相爱一家人 最近 3 天 毒舌版
```

**要件**:
- [wx-cli](https://github.com/jackwener/wx-cli) がインストールされていること (`npm install -g @jackwener/wx-cli`)
- macOS で WeChat 4.x が起動し、ログインしていること

**機能**:
- 発言者と引用付きのトピック抽出
- メッセージ数ランキングとユーザーごとのプロファイル
- グループごとの事実の記憶: チャット内で確認された訂正がダイジェストをまたいで保持されます (インジェクション対策付き)
- 増分モード (前回のダイジェストの続きから処理)
- 大量のメッセージに対する複数日の範囲分割
- 通常版と辛口 (毒舌) 版のダイジェスト
- 過去のダイジェストからのプロファイルの補完

#### baoyu-podcast-summary

ポッドキャスト、インタビュー、パネルディスカッションを、お好みの言語で客観的かつ読者本位の要約にまとめます。エピソードを順番にたどるのではなく、覚えておく価値のある 2〜3 個の要点から始め、すべての論点をそれを述べたゲストまたはホストに帰属させ、独自の意見は一切加えません。

```bash
# YouTube link (transcript fetched via baoyu-youtube-transcript)
/baoyu-podcast-summary https://www.youtube.com/watch?v=VIDEO_ID

# Transcript file
/baoyu-podcast-summary transcript.md

# Name a focus, reader, or output language
/baoyu-podcast-summary transcript.md focus on how they changed code review, in English
```

**機能**:
- 貼り付けた文字起こし、文字起こしファイル、YouTube の URL を受け付けます
- 文字起こしにラベルがない場合は、話者の名前と誰が何を言ったかを推測します
- 人物、企業、製品を Web 検索で確認し、読者に必要な背景情報を補います
- あなたの言語で書きます: リクエストで指定した言語、EXTEND.md で設定した言語、またはチャットで使っている言語
- 独自の文体スキルやスタイルガイドがあれば、それに従います (オプション)
- 分野外の読者のために専門用語を説明します。`audience` の設定はオプションです

#### baoyu-electron-extract

インストール済みの任意の Electron アプリの `app.asar` から、リソースと JavaScript を抽出します。`.js.map` ファイルに `sourcesContent` が埋め込まれている場合は元のソースツリー (TypeScript/JSX を含む) を復元し、そうでない場合は minify された JS/CSS を Prettier でその場で整形します。`node_modules` は常にスキップします。macOS と Windows で動作し、その他のプラットフォームでは `--asar <path>` を指定してください。

```bash
# Extract by app name (default output: ~/Downloads/Codex-electron-extract/)
/baoyu-electron-extract Codex

# Extract by absolute path (.app bundle, install dir, or .asar file)
/baoyu-electron-extract "/Applications/Visual Studio Code.app"
/baoyu-electron-extract --asar /Applications/Codex.app/Contents/Resources/app.asar Codex

# Custom output directory
/baoyu-electron-extract Codex --output ~/work/codex-source

# Preview discovery without writing anything
/baoyu-electron-extract Codex --dry-run

# Overwrite an existing output directory
/baoyu-electron-extract Codex --force
```

**オプション**:
| オプション | 説明 | デフォルト |
|--------|-------------|---------|
| `<app>` | アプリ名または絶対パス (`--asar` を指定しない場合は必須) | — |
| `--output`, `-o` | 出力ディレクトリ | `~/Downloads/<AppName>-electron-extract` |
| `--asar` | 解決された `.asar` のパスを上書き | 自動検出 |
| `--force`, `-f` | 空でない既存の出力ディレクトリへの書き込みを許可 | false |
| `--skip-format` | Prettier による整形をスキップ | false |
| `--skip-restore` | ソースマップからの復元をスキップ | false |
| `--no-unpacked` | `app.asar.unpacked/` を一緒にコピーしない | false |
| `--dry-run` | 解決されたパスを表示し、書き込まずに終了 | false |
| `--json` | stdout に 1 行の JSON サマリーを出力 | false |

**出力の構成**: `extract-report.json` (件数、警告、パス)、`extracted/` (asar の中身。マップがない場合はその場で整形)、`extracted.unpacked/` (ネイティブモジュールがある場合)、`restored/` (`.js.map` ファイルから再構築したソースツリー)。

## 環境設定

一部のスキルには API キーやカスタム設定が必要です。環境変数は `.env` ファイルで設定できます:

**読み込みの優先順位** (優先度の高いものが低いものを上書きします):
1. CLI の環境変数 (例: `OPENAI_API_KEY=xxx /baoyu-image-gen ...`)
2. `process.env` (システムの環境変数)
3. `<cwd>/.baoyu-skills/.env` (プロジェクトレベル)
4. `~/.baoyu-skills/.env` (ユーザーレベル)

**セットアップ**:

```bash
# Create user-level config directory
mkdir -p ~/.baoyu-skills

# Create .env file
cat > ~/.baoyu-skills/.env << 'EOF'
# OpenAI
OPENAI_API_KEY=sk-xxx
OPENAI_IMAGE_MODEL=gpt-image-2
# OPENAI_BASE_URL=https://api.openai.com/v1
# OPENAI_IMAGE_USE_CHAT=false

# Azure OpenAI
AZURE_OPENAI_API_KEY=xxx
AZURE_OPENAI_BASE_URL=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-image-2
# AZURE_API_VERSION=2025-04-01-preview

# OpenRouter
OPENROUTER_API_KEY=sk-or-xxx
OPENROUTER_IMAGE_MODEL=google/gemini-3.1-flash-image
# OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
# OPENROUTER_HTTP_REFERER=https://your-app.example.com
# OPENROUTER_TITLE=Your App Name

# Google
GOOGLE_API_KEY=xxx
GOOGLE_IMAGE_MODEL=gemini-3-pro-image
# GOOGLE_BASE_URL=https://generativelanguage.googleapis.com/v1beta

# DashScope (Aliyun Tongyi Wanxiang)
DASHSCOPE_API_KEY=sk-xxx
DASHSCOPE_IMAGE_MODEL=qwen-image-2.0-pro
# DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/api/v1

# Z.AI
ZAI_API_KEY=xxx
ZAI_IMAGE_MODEL=glm-image
# ZAI_BASE_URL=https://api.z.ai/api/paas/v4

# MiniMax
MINIMAX_API_KEY=xxx
MINIMAX_IMAGE_MODEL=image-01
# MINIMAX_BASE_URL=https://api.minimaxi.com

# Replicate
REPLICATE_API_TOKEN=r8_xxx
REPLICATE_IMAGE_MODEL=google/nano-banana-2
# REPLICATE_BASE_URL=https://api.replicate.com

# Jimeng (即梦)
JIMENG_ACCESS_KEY_ID=xxx
JIMENG_SECRET_ACCESS_KEY=xxx
JIMENG_IMAGE_MODEL=jimeng_t2i_v40
# JIMENG_BASE_URL=https://visual.volcengineapi.com
# JIMENG_REGION=cn-north-1

# Seedream (豆包)
ARK_API_KEY=xxx
SEEDREAM_IMAGE_MODEL=doubao-seedream-5-0-260128
# SEEDREAM_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
EOF
```

**プロジェクトレベルの設定** (チームで共有する場合):

```bash
mkdir -p .baoyu-skills
# Add .baoyu-skills/.env to .gitignore to avoid committing secrets
echo ".baoyu-skills/.env" >> .gitignore
```

## カスタマイズ

すべてのスキルは `EXTEND.md` ファイルによるカスタマイズに対応しています。拡張ファイルを作成すると、デフォルトのスタイルを上書きしたり、カスタム設定を追加したり、独自のプリセットを定義したりできます。

**拡張ファイルのパス** (優先順位の高い順に確認されます):
1. `.baoyu-skills/<skill-name>/EXTEND.md` - プロジェクトレベル (チームやプロジェクト固有の設定向け)
2. `~/.baoyu-skills/<skill-name>/EXTEND.md` - ユーザーレベル (個人の好みの設定向け)

**例**: `baoyu-cover-image` をブランドカラーでカスタマイズするには:

```bash
mkdir -p .baoyu-skills/baoyu-cover-image
```

次に `.baoyu-skills/baoyu-cover-image/EXTEND.md` を作成します:

```markdown
## Custom Palettes

### corporate-tech
- Primary colors: #1a73e8, #4A90D9
- Background: #F5F7FA
- Accent colors: #00B4D8, #48CAE4
- Decorative hints: Clean lines, subtle gradients
- Best for: SaaS, enterprise, technical
```

拡張ファイルの内容はスキルの実行前に読み込まれ、デフォルトを上書きします。

## 免責事項

### baoyu-danger-gemini-web

このスキルは Gemini Web API (リバースエンジニアリングによるもの) を使用します。

**警告:** このプロジェクトはブラウザの Cookie を介した非公式の API アクセスを使用しています。自己責任でご利用ください。

- 初回実行時はブラウザが開き、Google で認証します
- Cookie はキャッシュされ、以降の実行で使用されます
- API の安定性や可用性は保証されません

**対応ブラウザ** (自動検出): Google Chrome、Chrome Canary/Beta、Chromium、Microsoft Edge

**プロキシの設定**: Google のサービスへのアクセスにプロキシが必要な場合 (例: 中国国内)、環境変数をインラインで設定してください:

```bash
HTTP_PROXY=http://127.0.0.1:7890 HTTPS_PROXY=http://127.0.0.1:7890 /baoyu-danger-gemini-web "Hello"
```

Windows PowerShell ではインラインでの代入は機能しません。先にセッションで変数を設定してから、同じセッションからエージェントを起動してください:

```powershell
$env:HTTP_PROXY = 'http://127.0.0.1:7890'
$env:HTTPS_PROXY = 'http://127.0.0.1:7890'
# Start your agent from this PowerShell session, then run the skill inside it
```

これらの変数は、現在の PowerShell セッションとそこから起動したプロセスに適用されます。すでに実行中のエージェントに反映させるには、再起動が必要です。

### baoyu-danger-x-to-markdown

このスキルは、リバースエンジニアリングによる X (Twitter) API を使用します。

**警告:** これは公式の API では**ありません**。自己責任でご利用ください。

- X が API を変更した場合、予告なく動作しなくなる可能性があります
- API の利用が検知された場合、アカウントが制限される可能性があります
- 初回利用時に同意の確認が必要です
- 環境変数または Chrome のログインで認証します

## クレジット

このプロジェクトは、以下のオープンソースプロジェクトに着想を得て、それらを基に構築されています:

- [@wshuyi](https://github.com/wshuyi) による [x-article-publisher-skill](https://github.com/wshuyi/x-article-publisher-skill) — X 記事投稿スキルの着想元
- [@doocs](https://github.com/doocs) による [doocs/md](https://github.com/doocs/md) — Markdown から HTML への変換の中核となる実装ロジック
- AJ@WaytoAGI による [High-density Infographic Prompt](https://waytoagi.feishu.cn/wiki/YG0zwalijihRREkgmPzcWRInnUg) — インフォグラフィックスキルの着想元
- [@joeseesun](https://github.com/joeseesun)（乔木）による [qiaomu-mondo-poster-design](https://github.com/joeseesun/qiaomu-mondo-poster-design) — Mondo スタイルの着想元
- [@Cocoon-AI](https://github.com/Cocoon-AI) による [architecture-diagram-generator](https://github.com/Cocoon-AI/architecture-diagram-generator) — 図解スキルのデザインシステムの着想元

## ライセンス

特に明記されていない限り、このリポジトリは [MIT License](./LICENSE) の下でライセンスされています。

公開された ClawHub スキルは ClawHub レジストリのルールに従い、`MIT-0` の下で配布されます。サードパーティのコードやアセットは、明記されている場合、元のライセンスが維持されます。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=JimLiu/baoyu-skills&type=Date)](https://www.star-history.com/#JimLiu/baoyu-skills&Date)
