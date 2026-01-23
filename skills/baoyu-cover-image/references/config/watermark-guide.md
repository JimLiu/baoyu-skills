---
name: watermark-guide
description: Watermark configuration guide for baoyu-cover-image
---

# Watermark Guide

## Position Diagram

```
┌─────────────────────────────┐
│                  [top-right]│
│                             │
│                             │
│       COVER IMAGE           │
│                             │
│                             │
│[bottom-left][bottom-center][bottom-right]│
└─────────────────────────────┘
```

## Position Recommendations

| Position | Best For | Avoid When |
|----------|----------|------------|
| `bottom-right` | Default choice, most common | Title in bottom-right |
| `bottom-left` | Right-heavy layouts | Key visual in bottom-left |
| `bottom-center` | Centered designs | Text-heavy bottom area |
| `top-right` | Bottom-heavy content | Title/header in top-right |

## Opacity Examples

| Opacity | Visual Effect | Use Case |
|---------|---------------|----------|
| 0.3 | Very subtle, barely visible | Clean aesthetic priority |
| 0.5 | Balanced, noticeable but not distracting | Default recommendation |
| 0.7 | Clearly visible | Brand recognition priority |
| 0.9 | Strong presence | Anti-copy protection |

## Content Format

| Format | Example | Style |
|--------|---------|-------|
| Handle | `@username` | Social media |
| Domain | `myblog.com` | Cross-platform |
| Brand | `MyBrand` | Simple branding |
| Chinese | `博客名` | Chinese platforms |

## Best Practices

1. **Consistency**: Use same watermark across all covers
2. **Legibility**: Ensure watermark readable on both light/dark areas
3. **Size**: Keep subtle - should not distract from content
4. **Contrast**: Adjust opacity based on cover background

## Prompt Integration

When watermark is enabled, add to image generation prompt:

```
Include a subtle watermark "[content]" positioned at [position]
with approximately [opacity*100]% visibility. The watermark should
be legible but not distracting from the main content.
```

## Cover-Specific Considerations

| Aspect Ratio | Recommended Position | Notes |
|--------------|---------------------|-------|
| 2.35:1 | bottom-right | Cinematic - keep corners clean |
| 16:9 | bottom-right | Standard - flexible placement |
| 1:1 | bottom-center | Square - centered often works better |

## Common Issues

| Issue | Solution |
|-------|----------|
| Watermark invisible | Increase opacity or adjust position |
| Watermark too prominent | Decrease opacity (0.3-0.5) |
| Watermark overlaps title | Change position or reduce title area |
| Inconsistent appearance | Use fixed opacity/position in preferences |
