# Translation Workflow Details

Per-step guidelines. All intermediate results are saved in the output directory.

## Step 1: Content Analysis

Save to `01-analysis.md`.

### 1.1 Content Summary

- What is this content about? What is the core argument?
- Author background, stance, and writing context
- Purpose and intended audience of the original

### 1.2 Terminology

- List technical terms, proper nouns, brand names, acronyms
- Cross-reference with loaded glossaries
- For terms not in glossary, determine standard translations
- Record in a terminology table

### 1.3 Tone & Style

- Formal or conversational? Humor, metaphor, cultural references?
- What register is appropriate for the translation given the target audience?

### 1.4 Translation Challenges

- **Comprehension gaps**: Terms or references that target readers may not understand — note what explanation is needed
- **Figurative language**: Metaphors, idioms, expressions that don't translate literally — note intended meaning and target-language approach (interpret / substitute / retain)
- **Structural challenges**: Long complex sentences, wordplay, puns, or humor that needs creative adaptation

**Save `01-analysis.md`** with:
```
## Content Summary
[Core argument, author, context, purpose]

## Terminology
[term → translation, ...]

## Tone & Style
[assessment]

## Translation Challenges
- [term/passage] → [challenge type] → [suggested approach]
- ...
```

## Step 2: Assemble Translation Prompt

Main agent builds the prompt from `01-analysis.md` using [references/subagent-prompt-template.md](subagent-prompt-template.md), inlining:

- **Target style**: Resolved style preset + source voice assessment from §1.3
- **Content background**: Summary from §1.1
- **Glossary**: Merged glossary with analysis-extracted terms from §1.2
- **Translation challenges**: All challenges from §1.4

Save to `02-prompt.md`; used by subagents (chunked) or the main agent (non-chunked).

## Step 3: Initial Draft

Save to `03-draft.md`. Chunked: merged from subagent chunk translations; non-chunked: the main agent translates directly. Follow `02-prompt.md` and the **Translation principles** in SKILL.md.

## Step 4: Critical Review

Main agent reviews the draft against the source → `04-critique.md`. **Diagnosis only** — no rewriting yet.

### 4.1 Accuracy

- Compare each paragraph against the original
- Verify facts, numbers, dates, proper nouns
- Flag content accidentally added, removed, or altered
- Check terminology consistency with glossary

### 4.2 Native Voice

- Flag sentences that read as "translated" rather than "written" — unnatural word order, calques, stiff phrasing
- For CJK targets: check for unnecessary connectives (因此/然而/此外), passive voice abuse (被/由/受到), noun pile-ups, over-nominalization
- Flag metaphors translated literally that sound unnatural in the target language
- Check emotional connotations are preserved, not flattened
- Note where sentence restructuring would improve readability

### 4.3 Notes & Adaptation

- Are translator's notes accurate, concise, and genuinely helpful?
- Flag missed comprehension challenges that need notes, and over-annotations on obvious terms
- Were translation strategies from `02-prompt.md` followed?
- Do cultural references work in the target language?

**Save `04-critique.md`** with:
```
## Accuracy
- [issue]: [location] — [description]

## Native Voice
- [issue]: [example] → [suggested fix]

## Notes & Adaptation
- [add/remove/revise]: [term/passage] — [reason]

## Summary
[Overall assessment: X critical issues, Y improvements]
```

## Step 5: Revision

Read `03-draft.md` and `04-critique.md`; apply all findings (fix accuracy issues, rewrite unnatural expressions, adjust notes, improve flow) → `05-revision.md`.

## Step 6: Polish

Final publication-quality pass on `05-revision.md` → `translation.md`:

- Read it as a standalone piece — does it flow as native content?
- Smooth remaining rough transitions
- Ensure consistent narrative voice and style throughout
- Final terminology consistency check
- Verify formatting is preserved correctly

## Chunked Refined Translation

Subagents (one per chunk, in parallel) only produce the Step 3 draft; the main agent does everything else:

1. Analysis (Step 1) on the **entire** document first → `01-analysis.md`
2. Assemble prompt → `02-prompt.md`
3. Split into chunks → `chunks/`
4. Subagents translate chunks (each reads `02-prompt.md`) → merge into `03-draft.md`
5. Review → `04-critique.md`; revise → `05-revision.md`; polish → `translation.md`
6. Final cross-chunk consistency check: terminology, narrative flow, transitions at chunk boundaries
