# Adapters & Media

## Built-in Adapters

| Adapter | URLs | Key Features |
|---------|------|-------------|
| `x` | x.com, twitter.com | Tweets, threads, X Articles, media, login detection |
| `youtube` | youtube.com, youtu.be | Transcript/captions, chapters, cover image, metadata |
| `hn` | news.ycombinator.com | Threaded comments, story metadata, nested replies |
| `generic` | Any URL (fallback) | Defuddle extraction, Readability fallback, auto-scroll, network idle detection |

Auto-selected by URL; override with `--adapter <name>`.

### YouTube

- Transcript format: `[MM:SS] Text segment` with chapter headings
- Needs an exposed caption track; captions disabled or restricted playback may yield description-only output
- `--wait-for force` if the player metadata needs time to load

### X/Twitter

- Single tweets, threads, X Articles
- Logged out on auth-only content → JSON `"status": "needs_interaction"`; use `--wait-for interaction`

### Hacker News

- Nested comment threads; story metadata (title, URL, author, score, comment count); deleted/dead status

## Media Download Workflow

By EXTEND.md `download_media`:

| Setting | Behavior |
|---------|----------|
| `1` (always) | Run CLI with `--download-media --output <path>` |
| `0` (never) | Run CLI with `--output <path>` (no media download) |
| `ask` (default) | Follow the ask-each-time flow below |

### Ask-Each-Time Flow

1. Run with `--output <path>`, **without** `--download-media`
2. Check the saved markdown for remote media (`https://` image/video links); none → done, no prompt
3. Otherwise ask (header "Media", question "Download N images/videos to local files?"): "Yes" — download to local directories / "No" — keep remote URLs
4. Yes → rerun with `--download-media --output <same-path>` (overwrites markdown with localized links)

### Media Layout

With `--download-media`: images → `imgs/`, videos → `videos/`, next to the output file (or under `--media-dir`); markdown links rewritten to local relative paths.

## Output Format

Markdown to stdout (or `--output` file). `--format json` fields:

- `adapter` — which adapter handled the URL
- `status` — `"ok"` or `"needs_interaction"`
- `login` — login state detection (`logged_in`, `logged_out`, `unknown`)
- `interaction` — interaction gate details (kind, provider, prompt)
- `document` — structured content (url, title, author, publishedAt, content blocks, metadata)
- `media` — collected media assets with url, kind, role
- `markdown` — converted markdown text
- `downloads` — media download results (when `--download-media` used)
