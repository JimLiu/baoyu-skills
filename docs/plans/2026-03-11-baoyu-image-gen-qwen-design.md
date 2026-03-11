# baoyu-image-gen 兼容 Qwen 模型 API 设计

## 目标

在不覆盖现有 DashScope 能力的前提下，为 `baoyu-image-gen` 增加对 Qwen 新 API / 新模型的兼容支持。

## 已确认约束

1. 保留现有 `z-image-turbo` 能力，不做破坏性替换
2. 在同一个 `dashscope` provider 内自动识别模型并路由到对应 API
3. 先不对用户开放 `--negative-prompt`、`--prompt-extend`、`--watermark` CLI 参数
4. DashScope 默认模型改为 `qwen-image-2.0-pro`

## 方案

### 1) Provider 内部自动路由

在 `scripts/providers/dashscope.ts` 中根据模型名判断 API 路由：

- `qwen-image-*` → Qwen 新 API：`/api/v1/services/aigc/multimodal-generation/generation`
- 其他模型（如 `z-image-turbo`）→ 旧 API（保持现有逻辑）

这样用户只需通过 `--model` / EXTEND / env 切换模型，不需要理解底层端点差异。

### 2) 默认模型调整

`getDefaultModel()` 从：

- `z-image-turbo`

调整为：

- `qwen-image-2.0-pro`

同时保留 `DASHSCOPE_IMAGE_MODEL` 环境变量覆盖能力，保证老用户可无缝继续使用旧模型。

### 3) Qwen 请求体（参数先内置）

Qwen 分支使用文档要求的结构：

- `model`
- `input.messages[0].content[0].text`
- `parameters.size`
- `parameters.prompt_extend`
- `parameters.watermark`
- `parameters.negative_prompt`（可不传或固定值）

当前阶段高级参数不开放 CLI，仅在 provider 内按固定策略处理。

### 4) 尺寸映射与格式

Qwen API 使用 `WxH`（`x`）格式，并映射到其官方分辨率集合：

- 1664x928（16:9）
- 1472x1104（4:3）
- 1328x1328（1:1）
- 1104x1472（3:4）
- 928x1664（9:16）

若用户传 `--size`，做兼容规范化；若传 `--ar`，按最接近比例选择。

### 5) 响应兼容

保留当前已支持的两种结果提取方式：

- `output.result_image`
- `output.choices[].message.content[].image`

因此可同时兼容新旧 API 响应。

## 变更文件

1. `skills/baoyu-image-gen/scripts/providers/dashscope.ts`
   - 默认模型改为 `qwen-image-2.0-pro`
   - 新增模型识别与 API 路由
   - 新增 Qwen 尺寸映射与请求体构建
   - 保留旧 API 分支逻辑

2. `skills/baoyu-image-gen/SKILL.md`
   - 更新 DashScope 默认模型说明（从 `z-image-turbo` 到 `qwen-image-2.0-pro`）
   - 补充 Qwen 模型兼容说明

## 验收标准

1. 不指定 `--model` 时，DashScope 默认使用 `qwen-image-2.0-pro`
2. 指定 `--model qwen-image-2.0-pro` 时走新 API，生成成功
3. 指定 `--model z-image-turbo` 时走旧 API，行为不退化
4. 响应解析对新旧格式都正常
5. 未新增 `--negative-prompt`/`--prompt-extend`/`--watermark` CLI 对外参数

## 风险与缓解

- 风险：旧 API 端点细节与当前实现存在隐式耦合
  - 缓解：旧分支仅最小改动，逻辑独立封装
- 风险：尺寸格式在新旧 API 间不同（`x` vs `*`）
  - 缓解：分支内独立 normalize，避免共用导致误传

## 后续可选增强（本次不做）

- 将 Qwen 高级参数开放为 CLI 可选项
- 为 DashScope provider 增加更细粒度的错误码映射与提示
