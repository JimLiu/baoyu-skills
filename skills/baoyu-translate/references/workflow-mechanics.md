# Workflow Mechanics

## Materialize Source

| Input Type | Action |
|------------|--------|
| File | Use as-is (no copy needed) |
| Inline text | Save to `translate/{slug}.md` |
| URL | Fetch content, save to `translate/{slug}.md` |

`{slug}`: 2-4 word kebab-case slug derived from content topic.

## Create Output Directory

Subdirectory next to the source: `{source-dir}/{source-basename}-{target-lang}/` (e.g., `posts/article.md` → `posts/article-zh/`)

## Conflict Resolution

If the output directory exists, rename it to `{name}.backup-YYYYMMDD-HHMMSS/` before creating the new one. Never overwrite existing results.
