# Image Modification

| Action | How |
|--------|-----|
| Edit | Update `prompts/NN-{type}-{slug}.md` **first**, then regenerate with the same session ID |
| Add | Specify position, create prompt, generate, renumber subsequent files `NN+1`, update outline |
| Delete | Remove files, renumber subsequent `NN-1`, update outline |

Always update the prompt file before regenerating — it's the source of truth and makes changes reproducible.

Text correction policy:

- If a card's title, body copy, tags, or any other rendered text is misspelled, garbled, hard to read, or visually weak, do not patch the bitmap with code.
- For text-correction regenerations, write a new prompt file and a new output path so the flawed candidate is preserved for comparison.
- Post-processing is limited to crop, resize, compression, or format conversion that does not alter text or the main composition.
