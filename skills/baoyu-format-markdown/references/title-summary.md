# Title & Summary Generation

Read when Step 3 needs to produce the article's frontmatter title/summary/description. The guidance here makes sure user-facing candidates are genuinely different (not paraphrases) and that summaries communicate *value*, not *topic*.

## Title Generation

Whether or not a title already exists, run the title optimization flow unless `auto_select_title` is set.

**Preparation** — read the full text and extract:
- Core argument (one sentence: "what is this article about?")
- Most impactful opinion or conclusion
- Reader pain point or curiosity trigger
- Most memorable metaphor or golden quote

**Generate candidates** using formulas from `references/title-formulas.md`:

1. Select the **2-3 best-matching hook formulas** based on the article's content, tone, and structure (see "When to pick each formula" in the reference)
2. Generate **1-2 straightforward titles** (descriptive or declarative, no formula — clear and accurate)
3. If the user specifies a direction (e.g., "make it suspenseful"), prioritize that direction
4. Total: **4-5 candidates**

Present via `AskUserQuestion`:

```
Pick a title:

1. [Hook title A] — (recommended) [formula name]
2. [Hook title B] — [formula name]
3. [Hook title C] — [formula name]
4. [Straightforward title D] — straightforward
5. [Straightforward title E] — straightforward

Enter number, or type a custom title:
```

Put the strongest hook first and mark it `(recommended)`. See `references/title-formulas.md` for principles and prohibited patterns.

If the first line is an H1, extract it to frontmatter and remove it from the body. If frontmatter already has a `title`, include it as context but still generate fresh candidates — the existing title may be weak.

**Skip behavior**: If `auto_select: true` or `auto_select_title: true`, skip the user prompt and use the top candidate directly.

## Summary Generation

Generate two versions directly (no user selection), both stored in frontmatter:

| Field | Length | Purpose |
|-------|--------|---------|
| `summary` | 1 sentence, ~50-80 chars | Concise hook — for feeds, social sharing, SEO meta |
| `description` | 2-3 sentences, ~100-200 chars | Richer context — for article previews, newsletter blurbs |

**Principles**:

- Convey **core value** to the reader, not just the topic
- Use concrete details (numbers, outcomes, specific methods) over vague descriptions
- `summary` should be punchy and self-contained; `description` can expand with supporting details
- If frontmatter already has `summary` or `description`, keep the existing one and only generate the missing field

**Prohibited patterns**:

- "This article introduces...", "This article explores..."
- Pure topic description without value proposition
- Repeating the title in different words

Once the title is in frontmatter, the body should NOT contain an H1 (avoid duplication).
