---
name: baoyu-youtube-transcript
description: Downloads YouTube video transcripts/subtitles and cover images by URL or video ID. Supports multiple languages, translation, chapters, and speaker identification. Caches raw data for fast re-formatting. Use when user asks to "get YouTube transcript", "download subtitles", "get captions", "YouTube字幕", "YouTube封面", "视频封面", "video thumbnail", "video cover image", or provides a YouTube URL and wants the transcript/subtitle text or cover image extracted.
version: 1.1.0
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-youtube-transcript
    requires:
      anyBins:
        - bun
        - npx
---

# YouTube Transcript

Works with manual and auto-generated transcripts. No API key or browser: uses YouTube's InnerTube API, falling back to `yt-dlp` when YouTube blocks the direct path. First run also fetches metadata and cover image and caches raw data for fast re-formatting.

## Script Directory

`{baseDir}` = this SKILL.md's directory. `${BUN_X}` = `bun` if installed; else `npx -y bun` if `npx` available; else suggest installing bun. Replace `{baseDir}` and `${BUN_X}` with actual values.

| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Transcript download CLI |

## Usage

```bash
${BUN_X} {baseDir}/scripts/main.ts <youtube-url-or-id>          # markdown with timestamps (English)
${BUN_X} {baseDir}/scripts/main.ts <url> --languages zh,en,ja   # language priority
${BUN_X} {baseDir}/scripts/main.ts <url> --chapters --speakers
${BUN_X} {baseDir}/scripts/main.ts <url> --format srt
${BUN_X} {baseDir}/scripts/main.ts <url> --translate zh-Hans
${BUN_X} {baseDir}/scripts/main.ts <url> --list
```

| Option | Description | Default |
|--------|-------------|---------|
| `<url-or-id>` | YouTube URL or video ID (multiple allowed) | Required |
| `--languages <codes>` | Language codes, comma-separated, in priority order | `en` |
| `--format <fmt>` | `text` (`.md`: frontmatter incl. `description`, title, summary, optional TOC/cover/timestamps/chapters/speakers) or `srt` | `text` |
| `--translate <code>` | Translate to language code | |
| `--list` | List available transcripts (stdout only, no file) | |
| `--timestamps` | `[HH:MM:SS → HH:MM:SS]` timestamps per paragraph | on |
| `--no-timestamps` | Disable timestamps | |
| `--chapters` | Chapter segmentation from video description | |
| `--speakers` | Raw transcript with metadata for speaker identification | |
| `--exclude-generated` | Skip auto-generated transcripts | |
| `--exclude-manually-created` | Skip manually created transcripts | |
| `--refresh` | Force re-fetch, ignore cache | |
| `-o, --output <path>` | Output file path | auto-generated |
| `--output-dir <dir>` | Base output directory | `youtube-transcript` |

Input: `https://www.youtube.com/watch?v=ID`, `https://youtu.be/ID`, `https://www.youtube.com/embed/ID`, `https://www.youtube.com/shorts/ID`, or bare video ID.

Optional env: `YOUTUBE_TRANSCRIPT_COOKIES_FROM_BROWSER` — passed to `yt-dlp --cookies-from-browser` during fallback (e.g. `chrome`, `safari`, `firefox`, `chrome:Profile 1`).

## Output Directory

```
youtube-transcript/
├── .index.json                          # Video ID → directory path (cache lookup)
└── {channel-slug}/{title-full-slug}/    # channel name / full title, kebab-case
    ├── meta.json                        # title, channel, description, duration, chapters, cover path, language info
    ├── transcript-raw.json              # raw API snippets `{ text, start, duration }[]`
    ├── transcript-sentences.json        # `{ text, start: "HH:mm:ss", end: "HH:mm:ss" }[]`
    ├── imgs/
    │   └── cover.jpg                    # Video thumbnail
    ├── transcript.md                    # from transcript-sentences.json
    └── transcript.srt                   # from transcript-raw.json (--format srt)
```

`transcript-sentences.json` splits on sentence-ending punctuation (`.?!…。？！` etc.), merges across snippets (CJK-aware), and allocates timestamps proportionally by character length.

## Caching & Fallback

- Repeat runs for the same video use the cache (no network). `--refresh` forces re-fetch; requesting a different language refreshes automatically.
- Any run caches `meta.json` and `imgs/cover.jpg`, so cover/metadata-only requests just need one run.
- On anti-bot / blocked responses the script retries alternate client identities, then `yt-dlp`. If `yt-dlp` is needed but missing, the agent decides how to make it available and continues — don't push the install decision to the user.

## Workflow

1. No language specified → run `--list` first to show options
2. **Always single-quote the URL** (zsh globs `?` → "no matches found"): `'https://www.youtube.com/watch?v=ID'`
3. Default: `--chapters --speakers` for the richest output
4. The script saves cache + output and prints the file path
5. `--speakers` → post-process per **Speaker Identification** below

## Chapters (`--chapters`)

Parses chapter timestamps from the description (e.g., `0:00 Introduction`), segments by chapter, groups snippets into paragraphs, saves `.md` with a Table of Contents. No further processing. No chapter timestamps → grouped paragraphs without chapter headings.

## Speaker Identification (`--speakers`)

Implies `--chapters`. The script saves a raw `.md` with YAML frontmatter (title, channel, date, cover, description, language), the video description, the description's chapter list (if any), and the transcript in SRT format.

Spawn a sub-agent (a cheaper model like Sonnet is fine) to:

1. Read the saved `.md` and `{baseDir}/prompts/speaker-transcript.md`
2. Process the transcript per the prompt: identify speakers from metadata (title → guest, channel → host, description → names) and conversation cues; segment into chapters (description chapters, else topic shifts); format with `**Speaker Name:**` labels, 2-4 sentence paragraphs, `[HH:MM:SS → HH:MM:SS]` timestamps
3. Overwrite the `.md` with the result, keeping the YAML frontmatter

## Error Cases

| Error | Meaning |
|-------|---------|
| Transcripts disabled | Video has no captions at all |
| No transcript found | Requested language not available |
| Video unavailable | Deleted, private, or region-locked |
| IP blocked | Too many requests, try again later |
| Age restricted | Login required for age verification |
| bot detected | Script retries alternate clients, then `yt-dlp`; resolve missing fallback tooling yourself; if it still fails try `YOUTUBE_TRANSCRIPT_COOKIES_FROM_BROWSER=safari` (or your browser) |
