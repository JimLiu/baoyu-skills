---
name: baoyu-diagram
description: Create professional diagrams with configurable dark/light theme via CSS custom properties. Use this skill whenever the user asks for any kind of technical or conceptual diagram, visualization of a system, process flow, data flow, component relationship, network topology, decision tree, org chart, state machine, or any visual representation of structure/logic/process. Also trigger when the user says "画个图" "画一个架构图" "diagram" "flowchart" "sequence diagram" "draw me a ..." or uploads content and asks to visualize it. Output is always a standalone .svg file. After generating the SVG, run the theme-switch script to produce both dark and light theme versions.
version: 1.118.0
---

# Diagram Generator

Create professional SVG diagrams across multiple diagram types. All output is a single self-contained `.svg` file with embedded styles and CSS custom properties for theme switching.

## Theme System (CSS Custom Properties)

All colors in the SVG are controlled via CSS custom properties (CSS variables) defined in the `:root` block of the `<style>` element. To switch between dark and light themes, run:

```
bun {baseDir}/scripts/theme-switch.ts <svg-path> --theme=light [--output=<path>]
```

This produces a light-themed SVG without modifying the original dark-themed source. The LLM should always generate SVGs using CSS variable references (e.g., `var(--bg)`, `var(--color-primary-fill)`) instead of hardcoded color values.

### Theme Files ({baseDir}/themes/)

Theme color values live in `{baseDir}/themes/<name>.json` — one flat JSON object per theme, mapping CSS custom property names (keys starting with `--`) to color values. Other keys (e.g. `"description"`) are allowed as metadata and ignored by the scripts. Built-in themes: `dark.json`, `light.json`.

**Custom themes:** anyone can extend the skill by dropping a new `.json` file into `themes/` — no script changes needed:

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

Then apply it with `--theme=my-brand` (both `theme-switch.ts` and `flatten-vars.ts` support this). Any variable omitted from a custom theme simply won't be replaced by that theme. When generating SVGs for a custom theme, use its variable values in the `:root` block.

### CSS Custom Properties Reference

These variables are defined in the `:root` block. **Never hardcode color values** — always use `var(--variable-name)` in SVG attributes.

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

## Supported Diagram Types

| Type | When to Use | Key Characteristics |
|------|-------------|-------------------|
| **Architecture** | System components & relationships | Grouped boxes, connection arrows, region boundaries |
| **Flowchart** | Decision logic, process steps | Diamond decisions, rounded step boxes, directional flow |
| **Sequence** | Time-ordered interactions between actors | Vertical lifelines, horizontal messages, activation bars |
| **Structural** | Class diagrams, ER diagrams, org charts | Compartmented boxes, typed relationships (inheritance, composition) |
| **Mind Map** | Brainstorming, topic exploration | Central node, radiating branches, organic layout |
| **Timeline** | Chronological events | Horizontal/vertical axis, event markers, period spans |
| **Illustrative** | Conceptual explanations, comparisons | Free-form layout, icons, annotations, visual metaphors |
| **State Machine** | State transitions, lifecycle | Rounded state nodes, labeled transitions, start/end markers |
| **Data Flow** | Data transformation pipelines | Process bubbles, data stores, external entities |

## Design System

### Typography

Use embedded SVG `@font-face` or system monospace fallback:

```svg
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&amp;display=swap');
  text { font-family: 'JetBrains Mono', 'SF Mono', 'Cascadia Code', monospace; }
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

Draw elements in this order to get correct z-ordering (SVG paints back-to-front):

1. Background fill + grid pattern
2. Region/group boundaries (dashed outlines)
3. Connection arrows and lines
4. Opaque masking rects (same position as component boxes, `fill="var(--mask)"`)
5. Component boxes (semi-transparent fill + stroke via CSS variables)
6. Text labels
7. Legend (bottom-right or bottom area, outside all boundaries)
8. Title block (top-left)

The opaque masking rect trick is essential — semi-transparent component fills will show arrows underneath without it:

```svg
<!-- Mask layer: opaque background to hide arrows -->
<rect x="100" y="100" width="160" height="60" rx="6" fill="var(--mask)"/>
<!-- Visual layer: styled component -->
<rect x="100" y="100" width="160" height="60" rx="6" fill="var(--color-primary-fill)" stroke="var(--color-primary-stroke)" stroke-width="1.5"/>
<text x="180" y="125" fill="var(--text)" font-size="11" font-weight="600" text-anchor="middle">API Gateway</text>
<text x="180" y="141" fill="var(--text-muted)" font-size="9" text-anchor="middle">Kong / Nginx</text>
```

### Spacing Rules

These prevent overlapping — follow them strictly:

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

## Type-Specific Layout Guidance

Determine this SKILL.md file's directory path as `{baseDir}`. Read the reference file for the specific diagram type before starting layout. Reference files are located at `{baseDir}/references/` and contain detailed layout algorithms and examples.

### Architecture Diagrams
→ Read `{baseDir}/references/architecture.md`

Key points: left-to-right or top-to-bottom data flow. Group related services in region boundaries. Use buses/connectors between layers. Place databases at the bottom or right.

### Flowcharts
→ Read `{baseDir}/references/flowchart.md`

Key points: top-to-bottom primary flow. Diamonds for decisions with Yes/No labels on exit arrows. Rounded rectangles for start/end. Use the Highlight color for the happy path.

### Sequence Diagrams
→ Read `{baseDir}/references/sequence.md`

Key points: actors as boxes at top, vertical dashed lifelines, horizontal arrows for messages (solid=sync, dashed=return). Time flows downward. Activation bars show processing. Number messages if complex.

### Structural Diagrams
→ Read `{baseDir}/references/structural.md`

Key points: compartmented boxes (name / attributes / methods for class diagrams). Relationship lines: solid with filled diamond=composition, solid with empty diamond=aggregation, dashed arrow=dependency, solid triangle=inheritance.

### Mind Maps
Free-form radiating layout from a central concept. Use organic curves (`<path>` with cubic beziers) for branches. Vary branch colors using the palette. Larger font for central node, decreasing as you go outward.

### Timelines
Horizontal or vertical axis line. Event markers as circles or diamonds on the axis. Description text offset to alternating sides to avoid overlap. Use color to categorize event types.

### State Machines
Rounded-rect states with double-border for composite states. Filled circle for initial state, bullseye for final state. Curved arrows for self-transitions. Label all transitions with `event [guard] / action` format.

## Output Rules

1. Output a **single `.svg` file** — no external dependencies except the Google Fonts import
2. Set `viewBox` to fit all content with 30px padding; do NOT set fixed `width`/`height` attributes (let the SVG scale responsively)
3. Include `xmlns="http://www.w3.org/2000/svg"` on the root `<svg>` element
4. Put all `<style>`, `<defs>`, markers, and patterns at the top of the SVG
5. Use `text-anchor="middle"` for centered labels; ensure text doesn't overflow boxes
6. **Chinese text support:** When labels contain Chinese characters, use `font-family: 'JetBrains Mono', 'Noto Sans SC', 'PingFang SC', sans-serif'` and increase box widths — CJK characters are wider
7. **CSS Variables Required:** All color values MUST use CSS custom property references (e.g., `var(--bg)`, `var(--color-primary-fill)`). Never hardcode hex/rgb color values directly in SVG attributes. This enables theme switching via the post-processing script.
8. **Save location:** If the input is a file, save to `{inputFileDir}/diagram/`. Otherwise save to `{projectDir}/diagram/{topic-slug}/`. Create the directory if it doesn't exist

## Theme Switching

After generating the SVG, use the theme-switch script to produce alternative theme versions:

```bash
# Generate light theme version (default: dark)
${BUN_X} {baseDir}/scripts/theme-switch.ts <svg-path> --theme=light

# Generate with custom output path
${BUN_X} {baseDir}/scripts/theme-switch.ts <svg-path> --theme=light --output=path/to/output.svg

# Generate dark theme explicitly
${BUN_X} {baseDir}/scripts/theme-switch.ts <svg-path> --theme=dark

# Use a custom theme (from {baseDir}/themes/<name>.json)
${BUN_X} {baseDir}/scripts/theme-switch.ts <svg-path> --theme=my-brand
```

The script reads the SVG, finds the `:root { ... }` CSS custom property definitions in the `<style>` block, and replaces them with the target theme's color values. All `var(--variable)` references in the SVG markup remain unchanged — only the definitions are swapped.

**Workflow:**
1. Generate the SVG with CSS variable references (as specified above)
2. Run `theme-switch.ts` with `--theme=dark` to produce the dark version (default)
3. Run `theme-switch.ts` with `--theme=light` to produce the light version
4. Both versions share the same markup — only the color definitions differ

## Script

Determine this SKILL.md file's directory path as `{baseDir}`. Script path: `{baseDir}/scripts/theme-switch.ts`.

Resolve `${BUN_X}` runtime: if `bun` installed → `bun`; if `npx` available → `npx -y bun`; else suggest installing bun.

### SVG → @2x PNG

After saving the SVG, convert it to a @2x PNG:

```bash
${BUN_X} {baseDir}/scripts/main.ts <svg-path> [options]
```

Options:
- `-s, --scale <n>` — Scale factor (default: 2)
- `-o, --output <path>` — Custom output path (default: `<input>@2x.png`)
- `--json` — JSON output

**Important — flatten CSS variables before PNG conversion:**

The PNG converter uses `sharp` (librsvg), which does **not** resolve CSS `var()` references — a variable-based SVG renders as a solid dark image (or black) in the output PNG. Before running `main.ts` on any SVG that contains `var(...)` references, flatten the variables to literal values first:

```bash
${BUN_X} {baseDir}/scripts/flatten-vars.ts <svg-path> <output-path> [--theme=<name>]
```

- Replaces every `var(--xxx)` reference with the matching theme's literal value (default theme: `light`) and strips the `:root` block
- `--theme=<name>` loads `{baseDir}/themes/<name>.json` — custom themes work here too (e.g. flatten with `--theme=my-brand` for a custom-theme PNG)
- Then run `main.ts` on the flattened file to produce the PNG
- Browser rendering of the variable-based SVG is unaffected — flattening is only needed for non-browser renderers (sharp/librsvg, some thumbnailers)
- If the SVG already uses hardcoded colors (legacy diagrams), flattening is unnecessary

Typical PNG workflow:

```bash
${BUN_X} {baseDir}/scripts/theme-switch.ts <svg-path> --theme=light --output=<light-path>
${BUN_X} {baseDir}/scripts/flatten-vars.mjs <light-path> <flattened-path>
${BUN_X} {baseDir}/scripts/main.ts <flattened-path>
```

## Process

1. Identify the diagram type from the user's request
2. Read the relevant reference file if one exists for that type
3. Plan the layout: list all components, determine grouping and flow direction, calculate positions
4. Write the SVG following the layering order above, using **CSS variable references** for all color values (never hardcode colors)
5. Include the `:root { ... }` CSS custom property definitions in the `<style>` block (use the dark theme defaults from the CSS Custom Properties table)
6. Verify spacing rules — no overlaps, legends outside boundaries, viewBox large enough
7. Save the SVG file
8. Run `${BUN_X} {baseDir}/scripts/theme-switch.ts <svg-path> --theme=dark` to produce the dark theme version
9. Run `${BUN_X} {baseDir}/scripts/theme-switch.ts <svg-path> --theme=light` to produce the light theme version
10. Present both files to the user