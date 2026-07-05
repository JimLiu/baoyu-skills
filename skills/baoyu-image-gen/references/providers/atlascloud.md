# Atlas Cloud Image

Read when the user picks `--provider atlascloud` or sets `default_model.atlascloud`. Default text-to-image model is `google/nano-banana-2/text-to-image`.

## Models

**`google/nano-banana-2/text-to-image`**

- Text-to-image model used when no reference images are provided
- Supports `prompt`, `aspect_ratio`, `resolution`, and `output_format`
- Default resolution follows baoyu-image-gen quality mapping: `normal` -> `1k`, default/`2k` -> `2k`

**`google/nano-banana-2/edit`**

- Reference-image editing model used when `--ref` is provided with the default Atlas Cloud model
- Accepts up to 14 reference images through the `images` field
- Local reference files are uploaded first; remote `http`/`https` URLs are passed through directly

## Authentication

- API key: `ATLASCLOUD_API_KEY` (alias: `ATLAS_CLOUD_API_KEY`)
- Base URL: `https://api.atlascloud.ai/api/v1`
- Base URL override: `ATLASCLOUD_MEDIA_BASE_URL` (alias: `ATLAS_CLOUD_MEDIA_BASE_URL`)
- Model override: `ATLASCLOUD_IMAGE_MODEL` (alias: `ATLAS_CLOUD_IMAGE_MODEL`)

## Size and Aspect Ratio

- `--imageSize 1K|2K|4K` maps directly to Atlas Cloud `resolution` values `1k|2k|4k`
- `--quality normal` maps to `1k`; default/`--quality 2k` maps to `2k`
- `--size <WxH>` is accepted and mapped to `resolution` by longest edge: <=1024 -> `1k`, <=2048 -> `2k`, otherwise `4k`
- `--ar` sends Atlas Cloud `aspect_ratio`; if only `--size` is provided, a supported ratio is inferred when possible

Supported aspect ratios: `1:1`, `3:2`, `2:3`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`.

## Response Format

- Default (`--response-format file`): downloads the completed image URL and saves image bytes
- Pass `--response-format url`: writes the completed image URL string instead

## Limits and Behavior Notes

- `--n > 1` is rejected locally because baoyu-image-gen saves one image per request
- Reference-image editing is limited to the built-in Nano Banana 2 edit flow unless a future provider mapping is added
- Rate limit defaults: concurrency=3, startIntervalMs=1100 (override via `BAOYU_IMAGE_GEN_ATLASCLOUD_CONCURRENCY` / `BAOYU_IMAGE_GEN_ATLASCLOUD_START_INTERVAL_MS`)
- Generation is asynchronous: the provider creates a prediction, polls until completion, then downloads the final image URL

## Official References

- [Atlas Cloud API](https://www.atlascloud.ai/)
