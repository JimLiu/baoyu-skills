# Reference Images

User-supplied refs are **separate from** the internal "image-1 as anchor" chain (Step 3) — they layer on top of it.

**Intake**: via `--ref <files...>` or paths pasted in conversation.
- File path → copy to `refs/NN-ref-{slug}.{ext}`
- Pasted with no path → ask for the path, or extract style traits as a text fallback

**Usage modes** (per reference):

| Usage | Effect |
|-------|--------|
| `direct` | Pass the file to the backend (typically on image 1 only, so the anchor propagates through the chain) |
| `style` | Extract style traits and append to every card's prompt body |
| `palette` | Extract hex colors and append to every card's prompt body |

Record refs in each affected card's prompt frontmatter:

```yaml
references:
  - ref_id: 01
    filename: 01-ref-brand.png
    usage: direct
```

At generation time: verify files exist. Image 1 with `usage: direct` + backend that accepts refs → pass via the backend's ref parameter (becomes the chain anchor). Images 2+ keep using image-1 as `--ref` per Step 3 — do NOT re-stack user refs on top (avoids conflicting signals). For `style`/`palette`, embed extracted traits in every prompt.
