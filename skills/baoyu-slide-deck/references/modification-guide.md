# Slide Modification Guide

## Edit Single Slide

1. Identify slide (e.g., `03-slide-key-findings.png`)
2. Update prompt in `prompts/03-slide-key-findings.md`
3. If content changes significantly, update slug in filename
4. Regenerate image using same session ID
5. Regenerate PPTX and PDF

## Add New Slide

1. Specify insertion position (e.g., after slide 3)
2. Create new prompt with appropriate slug (e.g., `04-slide-new-section.md`)
3. Generate new slide image
4. **Renumber**: all subsequent slides increment NN by 1 (`04-slide-conclusion.png` → `05-slide-conclusion.png`)
5. Update `outline.md` with new slide entry
6. Regenerate PPTX and PDF

## Delete Slide

1. Identify slide (e.g., `03-slide-key-findings.png`)
2. Remove image file and prompt file
3. **Renumber**: all subsequent slides decrement NN by 1 (`04-slide-conclusion.png` → `03-slide-conclusion.png`)
4. Update `outline.md` to remove slide entry
5. Regenerate PPTX and PDF

## Naming & Renumbering

Files: `NN-slide-[slug].png`, `prompts/NN-slide-[slug].md` (e.g., `01-slide-cover.png`, `02-slide-problem-statement.png`, `04-slide-back-cover.png`).

| Rule | Description |
|------|-------------|
| Format | Kebab-case (lowercase, hyphens) |
| Source | Derived from slide title/content |
| Uniqueness | Must be unique within the deck |
| Updates | Change slug when content changes significantly |
| Reorder | Update NN to match new positions |
| Renumber | Only the NN prefix changes; slugs remain unchanged |

## Post-Modification Checklist

- [ ] Image file renamed/created correctly
- [ ] Prompt file renamed/created correctly
- [ ] Subsequent files renumbered (if add/delete)
- [ ] `outline.md` updated to reflect changes
- [ ] PPTX regenerated
- [ ] PDF regenerated
- [ ] Slide count in outline header updated
