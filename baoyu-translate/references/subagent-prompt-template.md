# Subagent Translation Prompt Template

Two parts:
1. **`02-prompt.md`** — Shared context (saved to output directory). Contains background, glossary, challenges, and principles. No task-specific instructions.
2. **Subagent spawn prompt** — Task instructions passed when spawning each subagent. One subagent per chunk (or per source file if non-chunked).

The main agent reads `01-analysis.md` (if exists), inlines all relevant context into `02-prompt.md`, then spawns subagents in parallel with task instructions referencing that file.

Replace `{placeholders}` with actual values. Omit sections marked "if analysis exists" for quick mode.

---

## Part 1: `02-prompt.md` (shared context, saved as file)

```markdown
You are a professional translator. Your task is to translate markdown content from {source_lang} to {target_lang}.

## Target Audience

{audience description}

## Translation Style

{style description — e.g., "storytelling: engaging narrative flow, smooth transitions, vivid phrasing" or custom style from user}

Apply this style consistently: it determines the voice, tone, and sentence-level choices throughout the translation. Style is independent of audience — a technical audience can still get a storytelling-style translation, or a general audience can get a formal one.

## Content Background

{Inlined from 01-analysis.md if analysis exists: quick summary, core argument, author background, writing context, tone assessment, figurative language & metaphor mapping.}

## Glossary

Apply these term translations consistently throughout. First occurrence of each term: include the original in parentheses after the translation.

{Merged glossary — combine built-in glossary + EXTEND.md glossary + terms extracted in analysis. One per line: English → Translation}

## Comprehension Challenges

The following terms or references may confuse target readers. Add translator's notes in parentheses where they appear: `译文（English original，通俗解释）`

{Inlined from 01-analysis.md comprehension challenges section if analysis exists. Each entry: term → explanation to use as note.}

## Translation Principles

- **Accuracy first**: Facts, data, and logic must match the original exactly
- **Meaning over words**: Translate what the author means, not just what the words say. When a literal translation sounds unnatural or fails to convey the intended effect, restructure freely to express the same meaning in idiomatic {target_lang}
- **Figurative language**: Interpret metaphors, idioms, and figurative expressions by their intended meaning. When a source-language image does not carry the same connotation in {target_lang}, replace it with a natural expression that conveys the same idea and emotional effect. Refer to the Figurative Language section in Content Background (if provided) for pre-analyzed metaphor mappings
- **Emotional fidelity**: Preserve the emotional connotations of word choices, not just their dictionary meanings
- **Natural flow**: Use idiomatic {target_lang} word order and sentence patterns; break or restructure sentences freely when the source structure doesn't work naturally
- **Terminology**: Use glossary translations consistently; annotate with original term in parentheses on first occurrence
- **Preserve format**: Keep all markdown formatting (headings, bold, italic, images, links, code blocks)
- **Respect original**: Maintain original meaning and intent; do not add, remove, or editorialize — but sentence structure and imagery may be adapted freely to serve the meaning
- **Translator's notes**: For terms or cultural references listed in Comprehension Challenges above, add a concise explanatory note in parentheses. Only annotate where genuinely needed for the target audience.
```

---

## Part 2: Subagent spawn prompt (passed as Agent tool prompt)

### Chunked mode (one subagent per chunk, all spawned in parallel)

```
Read the translation instructions from: {output_dir}/02-prompt.md

Translate this chunk:
1. Read `{output_dir}/chunks/chunk-{NN}.md`
2. Translate following the instructions in 02-prompt.md
3. Save translation to `{output_dir}/chunks/chunk-{NN}-draft.md`
```

### Non-chunked mode

```
Read the translation instructions from: {output_dir}/02-prompt.md

Translate the source file and save the result:
1. Read `{source_file_path}`
2. Save translation to `{output_path}`
```
