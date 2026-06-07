# Agnes Image 2.1 Flash

Read when the user picks `--provider agnes` or sets `default_model.agnes`. Default model is `agnes-image-2.1-flash`.

## Models

**`agnes-image-2.1-flash`** (recommended default)

- Supports both text-to-image and image-to-image
- baoyu-image-gen requests Base64 output for text-to-image via top-level `return_base64: true`
- baoyu-image-gen sends image-to-image refs under `extra_body.image[]` with `extra_body.response_format: "b64_json"` because that path was verified against the live API
- Local refs are converted to Data URLs; public `https://...` refs are passed through as-is

## Behavior Notes

- Agnes requires an explicit `size` for every request; baoyu-image-gen derives one from `--size`, `--ar`, and `--quality` when you do not pass `--size`
- `--n > 1` is rejected locally because the current provider flow saves exactly one image per request
- The API also supports URL output, but baoyu-image-gen prefers Base64 for stability and to avoid an extra download hop where possible

## Environment Variables

- `AGNES_API_KEY`
- `AGNES_IMAGE_MODEL`
- `AGNES_BASE_URL`

## Official References

- [Agnes Image 2.1 Flash](https://agnes-ai.com/doc/agnes-image-21-flash)
