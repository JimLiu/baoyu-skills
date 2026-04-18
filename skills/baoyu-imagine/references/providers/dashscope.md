# DashScope (阿里通义万象)

Read when the user picks `--provider dashscope`, sets `default_model.dashscope`, or asks for Qwen-Image behavior. The SKILL.md only names the default — this file covers model families, sizing rules, and limits.

## Model Families

**`qwen-image-2.0*`** — recommended modern family. Members: `qwen-image-2.0-pro`, `qwen-image-2.0-pro-2026-03-03`, `qwen-image-2.0`, `qwen-image-2.0-2026-03-03`.

- Free-form `size` in `宽*高` format
- Total pixels must be between `512*512` and `2048*2048`
- Default ≈ `1024*1024`
- Best choice for custom ratios (e.g. `21:9`) and text-heavy Chinese/English layouts

**Fixed-size family** — `qwen-image-max`, `qwen-image-max-2025-12-30`, `qwen-image-plus`, `qwen-image-plus-2026-01-09`, `qwen-image`.

- Only five sizes allowed: `1664*928`, `1472*1104`, `1328*1328`, `1104*1472`, `928*1664`
- Default is `1664*928`
- `qwen-image` currently has the same capability as `qwen-image-plus`

**Legacy** — `z-image-turbo`, `z-image-ultra`, `wanx-v1`. Only use when the user explicitly asks for legacy behavior.

## Size Resolution

- `--size` wins over `--ar`
- For `qwen-image-2.0*`: prefer explicit `--size`; otherwise infer from `--ar` using the recommended table below
- For `qwen-image-max/plus/image`: only use the five fixed sizes; if the requested ratio doesn't fit, switch to `qwen-image-2.0-pro`
- `--quality` is a baoyu-imagine preset, not an official DashScope field. The mapping of `normal`/`2k` onto the `qwen-image-2.0*` table is an implementation choice, not an API guarantee

### Recommended `qwen-image-2.0*` sizes

| Ratio | `normal` | `2k` |
|-------|----------|------|
| `1:1` | `1024*1024` | `1536*1536` |
| `2:3` | `768*1152` | `1024*1536` |
| `3:2` | `1152*768` | `1536*1024` |
| `3:4` | `960*1280` | `1080*1440` |
| `4:3` | `1280*960` | `1440*1080` |
| `9:16` | `720*1280` | `1080*1920` |
| `16:9` | `1280*720` | `1920*1080` |
| `21:9` | `1344*576` | `2048*872` |

## Not Exposed

DashScope APIs also support `negative_prompt`, `prompt_extend`, and `watermark`, but `baoyu-imagine` does not expose them as CLI flags today.

## Official References

- [Qwen-Image API](https://help.aliyun.com/zh/model-studio/qwen-image-api)
- [Text-to-image guide](https://help.aliyun.com/zh/model-studio/text-to-image)
- [Qwen-Image Edit API](https://help.aliyun.com/zh/model-studio/qwen-image-edit-api)
