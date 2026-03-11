# baoyu-image-gen DashScope Qwen API 兼容实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在不破坏现有 DashScope 旧模型能力的前提下，为 baoyu-image-gen 增加对 qwen-image-2.0-pro 新 API 的兼容支持，并将默认模型切换为 qwen-image-2.0-pro。

**Architecture:** 在同一个 DashScope provider 中按模型名自动分流：`qwen-image-*` 走新 API，其它模型继续走旧 API。请求体与尺寸映射在分支内独立处理，响应解析保持统一路径，避免影响已有行为。CLI 不新增高级参数入口，先将 Qwen 高级参数在 provider 内固定。

**Tech Stack:** TypeScript, Bun runtime, fetch API, 现有 baoyu-image-gen provider 架构

---

### Task 1: 更新类型与主程序文案，声明新的 DashScope 默认模型

**Files:**
- Modify: `skills/baoyu-image-gen/scripts/main.ts`
- Modify: `skills/baoyu-image-gen/SKILL.md`

**Step 1: 写失败检查（文本级）**

在本地先搜索当前默认 DashScope 模型声明，确认仍是旧值：

Run: `grep -n "DASHSCOPE_IMAGE_MODEL\|z-image-turbo\|qwen-image-2.0-pro" skills/baoyu-image-gen/scripts/main.ts skills/baoyu-image-gen/SKILL.md`
Expected: 看到 `z-image-turbo` 是默认值，且未完整体现新的默认模型策略。

**Step 2: 修改最小实现**

1. 在 `main.ts` 的 Usage/Env 说明中，将 DashScope 默认模型文案更新为 `qwen-image-2.0-pro`。
2. 在 `SKILL.md` 的环境变量说明中，将 `DASHSCOPE_IMAGE_MODEL` 默认值同步更新为 `qwen-image-2.0-pro`。
3. 在 `SKILL.md` 增加简短说明：DashScope 支持 qwen-image-2.0-pro（新 API）与旧模型兼容。

**Step 3: 运行检查**

Run: `grep -n "DASHSCOPE_IMAGE_MODEL\|qwen-image-2.0-pro" skills/baoyu-image-gen/scripts/main.ts skills/baoyu-image-gen/SKILL.md`
Expected: 默认值相关描述全部更新为 `qwen-image-2.0-pro`。

**Step 4: 提交**

```bash
git add skills/baoyu-image-gen/scripts/main.ts skills/baoyu-image-gen/SKILL.md
git commit -m "docs: set dashscope default model to qwen-image-2.0-pro"
```

### Task 2: 在 DashScope provider 中实现模型分流（Qwen 新 API + 旧 API 兼容）

**Files:**
- Modify: `skills/baoyu-image-gen/scripts/providers/dashscope.ts`

**Step 1: 写失败检查（行为级）**

先查看 provider 现状，确认仅有单一路径请求：

Run: `grep -n "multimodal-generation/generation\|text2image/image-synthesis\|getDefaultModel\|generateImage" skills/baoyu-image-gen/scripts/providers/dashscope.ts`
Expected: 当前缺少按模型分流逻辑，且默认模型不是目标值。

**Step 2: 写最小实现（结构拆分）**

在 `dashscope.ts` 中完成以下最小必要改造：

1. `getDefaultModel()` 默认值改为 `qwen-image-2.0-pro`（仍允许 `DASHSCOPE_IMAGE_MODEL` 覆盖）。
2. 新增 `isQwenModel(model: string): boolean`。
3. 将现有请求流程拆分为：
   - `generateWithQwenApi(...)`
   - `generateWithLegacyApi(...)`
4. `generateImage(...)` 中按模型自动分流。
5. 保留 reference image 不支持的限制逻辑（与现有行为一致）。

**Step 3: 写最小实现（Qwen 请求体）**

在 `generateWithQwenApi` 中：

1. 使用文档端点：`/api/v1/services/aigc/multimodal-generation/generation`。
2. 使用文档请求体结构：`input.messages[].content[].text`。
3. `parameters` 固定策略（不开放 CLI）：
   - `prompt_extend: false`
   - `watermark: false`
   - `negative_prompt` 不暴露给用户（可不传，或内部固定空字符串，按文档兼容）。
4. 保留统一响应解析：优先 `result_image`，再 fallback 到 `choices[].message.content[].image`。

**Step 4: 写最小实现（Qwen 尺寸映射）**

在 provider 内新增 Qwen 尺寸映射集合并独立选择函数：

- 1664x928, 1472x1104, 1328x1328, 1104x1472, 928x1664

规则：
1. `--size` 优先（做 `x/*` 规范化后转换成 Qwen 需要的 `x`）。
2. 无 `--size` 时按 `--ar` 选最近比例。
3. 无 `--ar` 时默认 1:1（1328x1328）或你在代码中定义的一致默认值。

**Step 5: 运行静态检查（最小）**

Run: `bun skills/baoyu-image-gen/scripts/main.ts --help`
Expected: 命令能正常输出帮助，无 TypeScript 运行时报错。

**Step 6: 提交**

```bash
git add skills/baoyu-image-gen/scripts/providers/dashscope.ts
git commit -m "feat: add qwen dashscope api compatibility with model routing"
```

### Task 3: 更新文档并做回归验证（不调用真实外部 API）

**Files:**
- Modify: `skills/baoyu-image-gen/SKILL.md`
- Optional Modify: `skills/baoyu-image-gen/api-dashscope.md`（仅当需要补充兼容说明）

**Step 1: 写失败检查（文档一致性）**

Run: `grep -n "DashScope\|DASHSCOPE_IMAGE_MODEL\|qwen-image-2.0-pro\|z-image-turbo" skills/baoyu-image-gen/SKILL.md`
Expected: 若描述不完整，仍可能缺少“新旧模型兼容并自动分流”的说明。

**Step 2: 写最小实现**

1. 在 `SKILL.md` 里补充：
   - 默认模型为 `qwen-image-2.0-pro`
   - 仍兼容旧模型（如 `z-image-turbo`）
   - 可通过 `--model` / EXTEND / env 覆盖
2. 明确本次不新增 `--negative-prompt`、`--prompt-extend`、`--watermark` CLI 参数。

**Step 3: 运行回归验证命令**

Run:
- `bun skills/baoyu-image-gen/scripts/main.ts --help`
- `git diff -- skills/baoyu-image-gen/scripts/providers/dashscope.ts skills/baoyu-image-gen/scripts/main.ts skills/baoyu-image-gen/SKILL.md`

Expected:
- help 正常
- diff 仅包含预期文件与预期变更

**Step 4: 提交**

```bash
git add skills/baoyu-image-gen/SKILL.md skills/baoyu-image-gen/api-dashscope.md
git commit -m "docs: clarify dashscope qwen default and legacy compatibility"
```

### Task 4: 最终验证与交付

**Files:**
- Verify: `skills/baoyu-image-gen/scripts/main.ts`
- Verify: `skills/baoyu-image-gen/scripts/providers/dashscope.ts`
- Verify: `skills/baoyu-image-gen/SKILL.md`

**Step 1: 本地最终检查**

Run:
- `git status --short`
- `git log --oneline -5`

Expected:
- 工作区干净（如果已按任务提交）
- 最近提交包含本次变更的 commit 信息

**Step 2: 验收点逐条核对**

核对以下内容：
1. DashScope 默认模型已是 `qwen-image-2.0-pro`
2. `--model qwen-image-2.0-pro` 走新 API 代码路径
3. `--model z-image-turbo` 走旧 API 代码路径
4. 响应解析兼容新旧返回结构
5. 未新增高级参数 CLI 暴露

**Step 3: 交付说明**

输出变更摘要（文件+行为变化）与下一步建议（是否补充真实 API 联调记录）。
