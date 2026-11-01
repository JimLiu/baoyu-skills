---
name: baoyu-diagram
description: Create professional diagrams with configurable dark/light theme via CSS custom properties. Use this skill whenever the user asks for any kind of technical or conceptual diagram, visualization of a system, process flow, data flow, component relationship, network topology, decision tree, org chart, state machine, or any visual representation of structure/logic/process. Also trigger when the user says "画个图" "画一个架构图" "diagram" "flowchart" "sequence diagram" "draw me a ..." or uploads content and asks to visualize it. Outputs a dark-theme SVG, a light-theme SVG, and a @2x PNG of each.
version: 1.118.0
---

# Diagram Generator

Create SVG diagrams. Each SVG embeds its own styles, uses CSS custom properties for theming, and loads nothing over the network.

## Output Files

For a diagram saved as `<name>.svg`, produce exactly these files:

| File | What it is | Made by |
|------|-----------|---------|
| `<name>.svg` | Source SVG, CSS variables with dark theme values | You (the LLM) |
| `<name>.light.svg` | Same markup with light theme values | `theme-switch.ts --theme=light` |
| `<name>@2x.png` | Dark PNG at 2x scale | `main.ts` |
| `<name>.light@2x.png` | Light PNG at 2x scale | `main.ts --theme light` |

If the user asks for only one theme, or only SVG, produce just those files.

## Themes

All colors are CSS custom properties defined in the `:root` block of the SVG's `<style>`; markup references them as `var(--bg)`, `var(--color-primary-fill)`, etc. Never hardcode color values in SVG attributes.

Theme values live in `{baseDir}/themes/<name>.json` — one flat JSON object mapping CSS property names (keys starting with `--`) to colors. Other keys (e.g. `"description"`) are metadata, ignored by scripts. Built-in: `dark.json`, `light.json`.

**Custom themes:** drop a new `.json` into `themes/` — no script changes needed:

```json
// themes/my-brand.json
{
  "description": "Corporate brand theme",
  "--bg": "#ffffff",
  "--text": "#1a1a2e",
  "--text-muted": "#6b7280",
  "--arrow": "#9ca3af",
  "--color-primary-fill": "rgba(37,99,235,0.12)",
  "--color-primary-stroke": "#2563eb",
  "--color-secondary-fill": "rgba(22,163,74,0.12)",
  "--color-secondary-stroke": "#16a34a"
}
```

Apply with `--theme=my-brand` (`theme-switch.ts`, `main.ts` and `flatten-vars.ts` all support it). Variables omitted from a custom theme are not replaced. When generating SVGs for a custom theme, use its values in the `:root` block.

### CSS Custom Properties

| Variable | Dark Theme Default | Light Theme Value | Usage |
|----------|-------------------|-------------------|-------|
| `--bg` | `#0f172a` | `#f8fafc` | Page background |
| `--bg-grid` | `#1e293b` | `#e2e8f0` | Grid pattern stroke |
| `--mask` | `#0f172a` | `#f8fafc` | Opaque mask fill (same as --bg) |
| `--text` | `white` | `#0f172a` | Primary text color |
| `--text-muted` | `#94a3b8` | `#475569` | Secondary/sublabel text |
| `--arrow` | `#64748b` | `#64748b` | Arrow/connector lines (unchanged) |
| `--color-primary-fill` | `rgba(8,51,68,0.4)` | `rgba(6,182,212,0.12)` | Frontend, user-facing, inputs |
| `--color-primary-stroke` | `#22d3ee` | `#0891b2` | Primary border |
| `--color-secondary-fill` | `rgba(6,78,59,0.4)` | `rgba(5,150,105,0.12)` | Backend, services, processing |
| `--color-secondary-stroke` | `#34d399` | `#059669` | Secondary border |
| `--color-tertiary-fill` | `rgba(76,29,149,0.4)` | `rgba(124,58,237,0.12)` | Database, storage, persistence |
| `--color-tertiary-stroke` | `#a78bfa` | `#7c3aed` | Tertiary border |
| `--color-accent-fill` | `rgba(120,53,15,0.3)` | `rgba(217,119,6,0.12)` | Cloud, infrastructure, regions |
| `--color-accent-stroke` | `#fbbf24` | `#d97706` | Accent border |
| `--color-alert-fill` | `rgba(136,19,55,0.4)` | `rgba(225,29,72,0.12)` | Security, errors, warnings |
| `--color-alert-stroke` | `#fb7185` | `#e11d48` | Alert border |
| `--color-connector-fill` | `rgba(251,146,60,0.3)` | `rgba(234,88,12,0.12)` | Buses, queues, middleware |
| `--color-connector-stroke` | `#fb923c` | `#ea580c` | Connector border |
| `--color-neutral-fill` | `rgba(30,41,59,0.5)` | `rgba(100,116,139,0.12)` | External, generic, unknown |
| `--color-neutral-stroke` | `#94a3b8` | `#64748b` | Neutral border |
| `--color-highlight-fill` | `rgba(59,130,246,0.3)` | `rgba(59,130,246,0.12)` | Active state, focus, current step |
| `--color-highlight-stroke` | `#60a5fa` | `#3b82f6` | Highlight border |

## Design System

### Typography

Use a locally installed monospace font stack. Do not `@import` web fonts or reference any remote resource: the SVG must render the same offline, and the PNG converter cannot fetch fonts.

```svg
<style>
  text { font-family: 'JetBrains Mono', 'SF Mono', 'Cascadia Code', 'Noto Sans Mono', 'DejaVu Sans Mono', monospace; }
</style>
```

Font sizes by role:
- **Title:** 16px, weight 700, fill: `var(--text)`
- **Component name:** 11-12px, weight 600, fill: `var(--text)`
- **Sublabel / description:** 9px, weight 400, fill: `var(--text-muted)`
- **Annotation / note:** 8px, weight 400
- **Tiny label (on arrows):** 7-8px

### Core Visual Elements

**Background + Grid:**

```svg
<defs>
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--bg-grid)" stroke-width="0.5"/>
  </pattern>
</defs>
<rect width="100%" height="100%" fill="var(--bg)"/>
<rect width="100%" height="100%" fill="url(#grid)"/>
```

**Arrowhead marker (standard):**

```svg
<marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
  <polygon points="0 0, 10 3.5, 0 7" fill="var(--arrow)"/>
</marker>
```

**Arrowhead marker (colored) — create per-color as needed:**

```svg
<marker id="arrow-primary" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
  <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-primary-stroke)"/>
</marker>
```

**Open arrowhead (for async/return messages):**

```svg
<marker id="arrow-open" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
  <polyline points="0 0, 10 3.5, 0 7" fill="none" stroke="var(--arrow)" stroke-width="1.5"/>
</marker>
```

### SVG Structure & Layering

Draw in this order (SVG paints back-to-front):

1. Background fill + grid pattern
2. Region/group boundaries (dashed outlines)
3. Connection arrows and lines
4. Opaque masking rects (same position as component boxes, `fill="var(--mask)"`)
5. Component boxes (semi-transparent fill + stroke via CSS variables)
6. Text labels
7. Legend (bottom-right or bottom area, outside all boundaries)
8. Title block (top-left)

The opaque mask rect is required — semi-transparent component fills otherwise show arrows underneath:

```svg
<!-- Mask layer: opaque background to hide arrows -->
<rect x="100" y="100" width="160" height="60" rx="6" fill="var(--mask)"/>
<!-- Visual layer: styled component -->
<rect x="100" y="100" width="160" height="60" rx="6" fill="var(--color-primary-fill)" stroke="var(--color-primary-stroke)" stroke-width="1.5"/>
<text x="180" y="125" fill="var(--text)" font-size="11" font-weight="600" text-anchor="middle">API Gateway</text>
<text x="180" y="141" fill="var(--text-muted)" font-size="9" text-anchor="middle">Kong / Nginx</text>
```

### Spacing Rules

Follow strictly to prevent overlaps:

- **Component box height:** 50-70px (standard), 80-120px (large/complex)
- **Minimum gap between components:** 40px vertical, 30px horizontal
- **Arrow label clearance:** 10px from any box edge
- **Region boundary padding:** 20px inside edges around contained components
- **Legend placement:** At least 20px below the lowest diagram element
- **Title block:** 20px from top-left, outside diagram content area
- **viewBox:** Always extend to fit all content + 30px padding on all sides

### Component Patterns

**Standard box (service/process):**

```svg
<rect x="X" y="Y" width="160" height="60" rx="6" fill="var(--mask)"/>
<rect x="X" y="Y" width="160" height="60" rx="6" fill="var(--color-primary-fill)" stroke="var(--color-primary-stroke)" stroke-width="1.5"/>
<text x="CX" y="Y+24" fill="var(--text)" font-size="11" font-weight="600" text-anchor="middle">Name</text>
<text x="CX" y="Y+40" fill="var(--text-muted)" font-size="9" text-anchor="middle">description</text>
```

**Decision diamond (flowchart):**

```svg
<g transform="translate(CX, CY)">
  <polygon points="0,-35 50,0 0,35 -50,0" fill="var(--mask)"/>
  <polygon points="0,-35 50,0 0,35 -50,0" fill="var(--color-accent-fill)" stroke="var(--color-accent-stroke)" stroke-width="1.5"/>
  <text y="4" fill="var(--text)" font-size="10" font-weight="600" text-anchor="middle">Condition?</text>
</g>
```

**Database cylinder:**

```svg
<g transform="translate(X, Y)">
  <rect x="0" y="10" width="120" height="50" rx="2" fill="var(--mask)"/>
  <ellipse cx="60" cy="10" rx="60" ry="12" fill="var(--mask)"/>
  <ellipse cx="60" cy="60" rx="60" ry="12" fill="var(--mask)"/>
  <rect x="0" y="10" width="120" height="50" fill="var(--color-tertiary-fill)"/>
  <ellipse cx="60" cy="10" rx="60" ry="12" fill="var(--color-tertiary-fill)" stroke="var(--color-tertiary-stroke)" stroke-width="1.5"/>
  <ellipse cx="60" cy="60" rx="60" ry="12" fill="var(--color-tertiary-fill)" stroke="var(--color-tertiary-stroke)" stroke-width="1.5"/>
  <line x1="0" y1="10" x2="0" y2="60" stroke="var(--color-tertiary-stroke)" stroke-width="1.5"/>
  <line x1="120" y1="10" x2="120" y2="60" stroke="var(--color-tertiary-stroke)" stroke-width="1.5"/>
  <text x="60" y="40" fill="var(--text)" font-size="11" font-weight="600" text-anchor="middle">PostgreSQL</text>
</g>
```

**Region boundary:**

```svg
<rect x="X" y="Y" width="W" height="H" rx="12" fill="none" stroke="var(--color-accent-stroke)" stroke-width="1" stroke-dasharray="8,4"/>
<text x="X+12" y="Y+16" fill="var(--color-accent-stroke)" font-size="9" font-weight="600">AWS us-east-1</text>
```

**Security group:**

```svg
<rect x="X" y="Y" width="W" height="H" rx="8" fill="none" stroke="var(--color-alert-stroke)" stroke-width="1" stroke-dasharray="4,4"/>
<text x="X+10" y="Y+14" fill="var(--color-alert-stroke)" font-size="8" font-weight="500">VPC / Security Group</text>
```

## Diagram Types & Layout

Determine this SKILL.md file's directory path as `{baseDir}`. Before layout, read the type's reference in `{baseDir}/references/` if one exists.

| Type | When to use | Reference | Layout key points |
|------|-------------|-----------|-------------------|
| Architecture | System components & relationships | `references/architecture.md` | LTR or TTB data flow; group related services in region boundaries; buses/connectors between layers; databases at bottom or right |
| Flowchart | Decision logic, process steps | `references/flowchart.md` | Top-to-bottom primary flow; diamonds with Yes/No labels on exit arrows; rounded rects for start/end; Highlight color for the happy path |
| Sequence | Time-ordered interactions between actors | `references/sequence.md` | Actor boxes at top, vertical dashed lifelines; horizontal messages (solid=sync, dashed=return); time flows down; activation bars; number messages if complex |
| Structural | Class/ER diagrams, org charts | `references/structural.md` | Compartmented boxes (name / attributes / methods); filled diamond=composition, empty diamond=aggregation, dashed arrow=dependency, solid triangle=inheritance |
| Mind Map | Brainstorming, topic exploration | — | Radiating layout from a central concept; cubic-bezier `<path>` branches; vary branch colors; font size decreases outward |
| Timeline | Chronological events | — | Horizontal or vertical axis; circle/diamond event markers, period spans; descriptions on alternating sides; color by event type |
| State Machine | State transitions, lifecycle | — | Rounded-rect states, double border for composite; filled circle = initial, bullseye = final; curved self-transitions; label transitions `event [guard] / action` |
| Illustrative | Conceptual explanations, comparisons | — | Free-form layout, icons, annotations, visual metaphors |
| Data Flow | Data transformation pipelines | — | Process bubbles, data stores, external entities |

## Output Rules

1. Each SVG is a **single file with no external resources** — no `@import`, web fonts, remote images or scripts
2. Set `viewBox` to fit all content with 30px padding; do NOT set fixed `width`/`height` attributes
3. Include `xmlns="http://www.w3.org/2000/svg"` on the root `<svg>`
4. Put all `<style>`, `<defs>`, markers, and patterns at the top
5. Use `text-anchor="middle"` for centered labels; text must not overflow boxes
6. **Chinese text:** use `font-family: 'JetBrains Mono', 'Noto Sans SC', 'PingFang SC', sans-serif'` and widen boxes — CJK characters are wider
7. **CSS variables required:** every color is a `var(--...)` reference so theme switching works
8. **Save location:** input is a file → `{inputFileDir}/diagram/`; otherwise `{projectDir}/diagram/{topic-slug}/`. Create the directory if missing

## Scripts

Determine this SKILL.md file's directory path as `{baseDir}`. Scripts live in `{baseDir}/scripts/`:

- `theme-switch.ts` — write the SVG with another theme's variable values
- `main.ts` — convert an SVG to a @2x PNG
- `flatten-vars.ts` — inline CSS variables into literal colors (only for other non-browser tools; `main.ts` does this itself)

Resolve `${BUN_X}` runtime: if `bun` installed → `bun`; if `npx` available → `npx -y bun`; else suggest installing bun.

### Theme switch

```bash
${BUN_X} {baseDir}/scripts/theme-switch.ts <svg-path> --theme=light [--output=path/to/output.svg]
${BUN_X} {baseDir}/scripts/theme-switch.ts <svg-path> --theme=dark
${BUN_X} {baseDir}/scripts/theme-switch.ts <svg-path> --theme=my-brand   # {baseDir}/themes/<name>.json
```

Replaces the `:root { ... }` definitions with the target theme's values; `var(--...)` references stay unchanged and the source is not modified. Without `--output`, writes `<name>.<theme>.svg` next to the input. The source already carries dark values, so `--theme=dark` on it is unnecessary.

### Dependencies

`main.ts` needs `sharp`, pinned in `{baseDir}/scripts/package.json` with a lockfile. Install once:

```bash
cd {baseDir}/scripts && ${BUN_X} install
```

If `sharp` is missing, `main.ts` stops with an error that gives this command; it never installs anything itself. Then deliver the SVG files and tell the user how to enable PNG output. `theme-switch.ts` and `flatten-vars.ts` have no dependencies.

### SVG → @2x PNG

```bash
${BUN_X} {baseDir}/scripts/main.ts <svg-path> [options]
```

Options:
- `-t, --theme <name>` — Theme used to resolve CSS variables (default: `dark`; any `{baseDir}/themes/<name>.json` works)
- `-s, --scale <n>` — Scale factor (default: 2)
- `-o, --output <path>` — Custom output path (default: `<input>@2x.png`)
- `--json` — JSON output

`sharp` (librsvg) does not understand CSS `var()`, so `main.ts` replaces every `var(--xxx)` with the theme's literal value and drops the `:root` block. It fails if the SVG references a variable that neither the theme nor the SVG defines. SVGs with hardcoded colors (legacy diagrams) are converted as-is.

To flatten without converting (e.g. for another renderer):

```bash
${BUN_X} {baseDir}/scripts/flatten-vars.ts <svg-path> <output-path> [--theme=<name>]
```

## Process

1. Identify the diagram type; read its reference file if one exists
2. Plan the layout: list components, grouping and flow direction, calculate positions
3. Write the SVG in the layering order above, colors via CSS variables only, with the `:root { ... }` block using the dark defaults from the CSS Custom Properties table
4. Verify spacing rules — no overlaps, legends outside boundaries, viewBox large enough
5. Save as `<name>.svg` (the dark version)
6. Run `${BUN_X} {baseDir}/scripts/theme-switch.ts <name>.svg --theme=light` → `<name>.light.svg`
7. Run `${BUN_X} {baseDir}/scripts/main.ts <name>.svg` → `<name>@2x.png`
8. Run `${BUN_X} {baseDir}/scripts/main.ts <name>.svg --theme light -o <name>.light@2x.png` → `<name>.light@2x.png`
9. Present the files listed in Output Files to the user
