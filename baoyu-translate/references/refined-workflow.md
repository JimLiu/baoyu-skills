# Translation Workflow Details

This file provides detailed guidelines for each workflow step. Steps are shared across modes:

- **Quick**: Translate only (no steps from this file)
- **Normal**: Step 1 (Analysis) → Translate
- **Refined**: Step 1 (Analysis) → Step 2 (Draft) → Step 3 (Review) → Step 4 (Revision) → Step 5 (Polish)
- **Normal → Upgrade**: After normal mode, user can continue with Step 3 → Step 4 → Step 5

All intermediate results are saved as files in the output directory.

## Step 1: Content Analysis

Before translating, deeply analyze the source material. Save analysis to `01-analysis.md` in the output directory. Focus on dimensions that directly inform translation quality.

### 1.1 Quick Summary

3-5 sentences capturing:
- What is this content about?
- What is the core argument?
- What is the most valuable point?

### 1.2 Core Content

- **Core argument**: One sentence summary
- **Key concepts**: What key concepts does the author use? How are they defined?
- **Structure**: How is the argument developed? How do sections connect?
- **Evidence**: What specific examples, data, or authoritative citations are used?

### 1.3 Background Context

- **Author**: Who is the author? What is their background and stance?
- **Writing context**: What phenomenon, trend, or debate is this responding to?
- **Purpose**: What problem is the author trying to solve? Who are they trying to influence?
- **Implicit assumptions**: What unstated premises underlie the argument?

### 1.4 Terminology Extraction

- List all technical terms, proper nouns, brand names, acronyms
- Cross-reference with loaded glossaries
- For terms not in glossary, research standard translations
- Record decisions in a working terminology table

### 1.5 Tone & Style

- Is the original formal or conversational?
- Does it use humor, metaphor, or cultural references?
- What register is appropriate for the translation given the target audience?

### 1.6 Reader Comprehension Challenges

Identify points where target readers may struggle, calibrated to the target audience:

- **Domain jargon**: Technical terms that lack widely-known translations or are meaningless when translated literally
- **Cultural references**: Idioms, historical events, pop culture, social norms specific to the source culture
- **Implicit knowledge**: Background context the original author assumes but target readers may lack
- **Wordplay & metaphors**: Figurative language that doesn't carry over across languages
- **Named concepts**: Theories, effects, or phenomena with coined names (e.g., "comb-over effect", "Dunning-Kruger effect")
- **Cognitive gaps**: Counterintuitive claims or expectations vs. reality that need framing for target readers

For each identified challenge, note:
1. The original term/passage
2. Why it may confuse target readers
3. A concise plain-language explanation to use as a translator's note

### 1.7 Figurative Language & Metaphor Mapping

Identify all metaphors, similes, idioms, and figurative expressions in the source. For each:

1. **Original expression**: The exact phrase
2. **Intended meaning**: What the author is actually communicating (the idea behind the image)
3. **Literal translation risk**: Would a word-for-word translation sound unnatural, lose the connotation, or confuse target readers?
4. **Target-language approach**: One of:
   - **Interpret**: Discard the source image entirely, express the intended meaning directly in natural target language
   - **Substitute**: Replace with a target-language idiom or image that conveys the same idea and emotional effect
   - **Retain**: Keep the original image if it works equally well in the target language

Also flag:
- **Emotional connotations carried by word choice**: Words like "alarming" that convey subjective feeling, not just objective description — note the emotional effect to preserve
- **Implied meanings**: Sentences where the surface meaning is simple but the implication is richer — note what the author really means so the translator can convey the full intent

### 1.8 Structural & Creative Challenges

- Complex sentence patterns (long subordinate clauses, nested modifiers, participial phrases) that need restructuring for natural target-language flow
- Structural challenges (wordplay, ambiguity, puns that don't translate)
- Content where the author's voice or humor requires creative adaptation

**Save `01-analysis.md`** with:
```
## Quick Summary
[3-5 sentences]

## Core Content
Core argument: [one sentence]
Key concepts: [list]
Structure: [outline]

## Background Context
Author: [who, background, stance]
Writing context: [what this responds to]
Purpose: [goal and target audience]
Implicit assumptions: [unstated premises]

## Terminology
[term → translation, ...]

## Tone & Style
[assessment]

## Comprehension Challenges
- [term/passage] → [why confusing] → [proposed note]
- ...

## Figurative Language & Metaphor Mapping
- [original expression] → [intended meaning] → [approach: interpret/substitute/retain] → [suggested rendering]
- ...

## Structural & Creative Challenges
[sentence restructuring needs, wordplay, creative adaptation needs]
```

## Step 2: Assemble Translation Prompt

Main agent reads `01-analysis.md` and assembles a complete translation prompt using [references/subagent-prompt-template.md](subagent-prompt-template.md). Inline content background, merged glossary, and comprehension challenges into the prompt. Save to `02-prompt.md`.

This prompt is used by the subagent (chunked) or by the main agent itself (non-chunked).

## Step 3: Initial Draft

Save to `03-draft.md` in the output directory.

For chunked content, the subagent produces this draft (merged from chunk translations). For non-chunked content, the main agent produces it directly.

Translate the full content following `02-prompt.md`. Apply all **Translation principles** from SKILL.md Step 4, plus these step-specific guidelines:

- Use the terminology decisions from Step 1 consistently
- Match the identified tone and register
- Follow the metaphor mapping from Step 1 for figurative language handling
- Add translator's notes for comprehension challenges identified in Step 1

## Step 4: Critical Review

The main agent critically reviews the draft against the source. Save review findings to `04-critique.md`. This step produces **diagnosis only** — no rewriting yet.

### 4.1 Accuracy & Completeness
- Compare each paragraph against the original, sentence by sentence
- Verify all facts, numbers, dates, and proper nouns
- Flag any content accidentally added, removed, or altered
- Check that technical terms match glossary consistently throughout
- Verify no paragraphs or sections were skipped

### 4.2 Europeanized Language Diagnosis (for CJK targets)
- **Unnecessary connectives**: Overuse of 因此/然而/此外/另外 where context already implies the relationship
- **Passive voice abuse**: Excessive 被/由/受到 where active voice is more natural
- **Noun pile-up**: Long modifier chains that should be broken into shorter clauses
- **Cleft sentences**: Unnatural "是...的" structures calqued from English "It is...that"
- **Over-nominalization**: Abstract nouns where verbs or adjectives would be more natural (e.g., "进行了讨论" → "讨论了")
- **Awkward pronouns**: Overuse of 他/她/它/我们/你 where they can be omitted

### 4.3 Figurative Language & Emotional Fidelity
- Cross-check against the metaphor mapping in `01-analysis.md`: were all flagged metaphors/idioms handled per the recommended approach (interpret/substitute/retain)?
- Flag any metaphors or figurative expressions that were translated literally and sound unnatural or lose the intended meaning in the target language
- Check emotional connotations: do words that carry subjective feelings in the source (e.g., "alarming", "haunting", "striking") evoke the same response in the translation, or were they flattened into neutral/objective descriptions?
- Flag implied meanings that were lost: sentences where the author's deeper intent was not conveyed because the translator stayed too close to the surface meaning

### 4.4 Strategy Execution
- Were the translation strategies from `02-prompt.md` actually followed?
- Did the translator apply the tone and register identified in analysis?
- Were comprehension challenges from `01-analysis.md` addressed with appropriate notes?
- Were glossary terms used consistently?

### 4.5 Expression & Logic
- Flag sentences that read like "translationese" — unnatural word order, calques, stiff phrasing
- Check logical flow between sentences and paragraphs
- Identify where sentence restructuring would improve readability
- Note where the target language idiom was missed

### 4.6 Translator's Notes Quality
- Are notes accurate, concise, and genuinely helpful?
- Identify missed comprehension challenges that need notes
- Flag over-annotations on terms obvious to the target audience
- Check that cultural references are explained where needed

### 4.7 Cultural Adaptation
- Do metaphors and idioms work in the target language?
- Are any references potentially confusing or offensive in the target culture?
- Could any passage be misinterpreted due to cultural context differences?

**Save `04-critique.md`** with:
```
## Accuracy & Completeness
- [issue]: [location] — [description]
- ...

## Europeanized Language Issues
- [issue type]: [example from draft] → [suggested fix]
- ...

## Figurative Language & Emotional Fidelity
- [literal metaphor]: [original] → [draft rendering] → [suggested interpretation]
- [flattened emotion]: [original word/phrase] → [draft rendering] → [how to restore emotional effect]
- ...

## Strategy Execution
- [strategy]: [followed/missed] — [details]
- ...

## Expression & Logic
- [location]: [problem] → [suggestion]
- ...

## Translator's Notes
- [add/remove/revise]: [term] — [reason]
- ...

## Cultural Adaptation
- [issue]: [description] — [suggestion]
- ...

## Summary
[Overall assessment: X critical issues, Y improvements, Z minor suggestions]
```

## Step 5: Revision

Apply all findings from `04-critique.md` to produce a revised translation. Save to `05-revision.md`.

The revision reads `03-draft.md` (the original draft) and `04-critique.md` (the review findings), and may also refer back to the source text and `01-analysis.md`:

- Fix all accuracy issues identified in the critique
- Rewrite Europeanized expressions into natural target-language patterns
- Re-interpret literally translated metaphors and figurative expressions per the metaphor mapping; replace with natural target-language renderings that convey the intended meaning and emotional effect
- Restore flattened emotional connotations: ensure words carrying subjective feelings evoke the same response as the source
- Apply missed translation strategies
- Restructure stiff or awkward sentences for fluency
- Add, remove, or revise translator's notes per critique recommendations
- Improve transitions between paragraphs
- Adapt cultural references as suggested

## Step 6: Polish

Save final version to `translation.md`.

Final pass on `05-revision.md` for publication quality:

- Read the entire translation as a standalone piece — does it flow as native content?
- Smooth any remaining rough transitions between paragraphs
- Ensure the narrative voice is consistent throughout
- Apply the selected translation style consistently: storytelling should flow like a narrative, formal should maintain neutral professionalism, humorous should land jokes naturally in the target language, etc.
- Final scan for surviving literal metaphors or flattened emotions: any figurative expression that still reads as "translated" rather than "written" should be recast into natural target-language expression
- Final consistency check on terminology across the full text
- Verify formatting is preserved correctly (headings, bold, links, code blocks)
- Remove any remaining traces of translationese

## Subagent Responsibility

Each subagent (one per chunk) is responsible **only** for producing the initial draft of its chunk (Step 3). The main agent assembles the shared prompt (Step 2), spawns all subagents in parallel, then takes over for critical review (Step 4), revision (Step 5), and polish (Step 6). The main agent may delegate revision or polish to subagents at its own discretion.

## Chunked Refined Translation

When content exceeds the chunk threshold (see Defaults in SKILL.md) and uses refined mode:

1. Main agent runs analysis (Step 1) on the **entire** document first → `01-analysis.md`
2. Main agent assembles translation prompt → `02-prompt.md`
3. Split into chunks → `chunks/`
4. Spawn one subagent per chunk in parallel (each reads `02-prompt.md` for shared context) → merge all results into `03-draft.md`
5. Main agent critically reviews the merged draft → `04-critique.md`
6. Main agent revises based on critique → `05-revision.md`
7. Main agent polishes → `translation.md`
7. Final cross-chunk consistency check:
   - Check terminology consistency across chunk boundaries
   - Verify narrative flow between chunks
   - Fix any transition issues at chunk boundaries
