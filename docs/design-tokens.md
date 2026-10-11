# Design tokens

All tokens live in `src/styles/base.css`. Direction: Material 3 foundation, dark first,
violet/indigo + cyan brand. Light theme values apply under `[data-theme="light"]` / `.light`
(set on `<html>` by `ThemeContext`).

## The rule

**Components use tokens, never raw hex.** Use a `--md-sys-*` role. Reach for `--md-ref-*`
only when you need an exact brand colour that has no role (gradients, charts). New raw hex
values in component CSS or inline styles should be rejected in review.

## Layers

| Layer | Prefix | Purpose |
| --- | --- | --- |
| Reference palette | `--md-ref-*` | Exact brand hexes in use today (indigo `#6366F1`, cyan `#06B6D4`, …). |
| System roles | `--md-sys-*` | What components use: colour roles, type, spacing, shape, elevation, state, motion. |
| Legacy aliases | `--color-*`, `--gradient-*`, `--chart-*` | Old names, now pointing at the tokens above so existing CSS renders unchanged. Do not use in new code. |

## Colour roles

| Role | Dark | Light |
| --- | --- | --- |
| `primary` / `on-primary` | `#818CF8` / `#1E1B4B` | `#4F46E5` / `#FFFFFF` |
| `primary-container` / `on-primary-container` | `#1E1B4B` / `#E0E7FF` | `#EEF2FF` / `#312E81` |
| `secondary` / `on-secondary` | `#22D3EE` / `#083344` | `#0E7490` / `#FFFFFF` |
| `tertiary` / `on-tertiary` | `#C4B5FD` / `#2E1065` | `#7C3AED` / `#FFFFFF` |
| `error` / `on-error` | `#FB7185` / `#4C0519` | `#E11D48` / `#FFFFFF` |
| `surface` | `#09090B` | `#F8FAFC` |
| `surface-container-lowest` | `#050507` | `#FFFFFF` |
| `surface-container-low` | `#121218` | `#F8FAFC` |
| `surface-container` | `#181822` | `#F1F5F9` |
| `surface-container-high` | `#1E1E2A` | `#E2E8F0` |
| `surface-container-highest` | `#26263A` | `#CBD5E1` |
| `on-surface` | `#F8FAFC` | `#0F172A` |
| `on-surface-variant` | `#94A3B8` | `#475569` |
| `outline` (UI borders, 3:1) | `#71809A` | `#64748B` |
| `outline-variant` (decorative) | `rgba(255,255,255,0.10)` | `#E2E8F0` |

Names are `--md-sys-color-<role>`, e.g. `--md-sys-color-on-surface-variant`.

### Contrast (WCAG 2.1)

Normal text needs at least 4.5:1. Large text (18.66px bold or 24px) and UI parts need at least 3:1.

| Pair | Dark | Light |
| --- | --- | --- |
| on-surface / surface | 19.02 ✅ | 17.06 ✅ |
| on-primary / primary | 5.36 ✅ | 6.29 ✅ |
| primary / surface (primary as text) | 6.67 ✅ | 6.01 ✅ |
| on-primary-container / primary-container | 12.98 ✅ | 10.22 ✅ |
| on-surface-variant / surface-container | 6.87 ✅ | 6.92 ✅ |
| on-surface-variant / surface-container-highest | 5.76 ✅ | 6.15 ✅ |
| on-secondary / secondary | 7.41 ✅ | 5.36 ✅ |
| on-tertiary / tertiary | 8.25 ✅ | 5.70 ✅ |
| on-error / error | 5.81 ✅ | 4.70 ✅ |
| outline / surface (UI, 3:1) | 4.98 ✅ | 4.55 ✅ |
| outline / surface-container-high (UI, 3:1) | 4.12 ✅ | 3.86 ✅ |

### Known gaps in today's UI (fixed when components move to roles in P6)

These legacy colours stay as they are in P5 so nothing changes visually:

| Legacy usage | Ratio | Move to |
| --- | --- | --- |
| White text on `#6366F1` buttons | 4.47 (fails body text) | `on-primary` on `primary` |
| `#6366F1` text/links on `#09090B` | 4.45 | `primary` |
| `#6366F1` text/links on white | 4.47 | `primary` (light) |
| `--color-muted` `#64748B` text on dark cards | 3.92 – 4.18 | `on-surface-variant` |
| `--color-muted` text on light `#F1F5F9` | 4.34 | `on-surface-variant` |

## Type scale

`--md-sys-typescale-<role>` is a `font` shorthand (weight size/line-height family), with a
matching `-tracking` token for `letter-spacing`:

```css
.title { font: var(--md-sys-typescale-title-medium); letter-spacing: var(--md-sys-typescale-title-medium-tracking); }
```

| Role | Large | Medium | Small |
| --- | --- | --- | --- |
| display | 57/64 · 400 | 45/52 · 400 | 36/44 · 400 |
| headline | 32/40 · 400 | 28/36 · 400 | 24/32 · 400 |
| title | 22/28 · 400 | 16/24 · 500 | 14/20 · 500 |
| body | 16/24 · 400 | 14/20 · 400 | 12/16 · 400 |
| label | 14/20 · 500 | 12/16 · 500 | 11/16 · 500 |

Sizes are px at a 16px base, written in rem so they follow the user's font size.

## Spacing, shape, elevation

- Spacing (4px base): `--md-sys-spacing-{0,1,2,3,4,5,6,8,10,12,16}` = 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px.
- Corners: `--md-sys-shape-corner-{none,xs,sm,md,lg,xl,full}` = 0, 4, 8, 12, 16, 28px, pill.
- Elevation: `--md-sys-elevation-level{0..5}`, layered box-shadows from the M3 spec.

## State layers

Overlay the content colour at these opacities: hover `0.08`, focus `0.12`, pressed `0.16`,
dragged `0.16` (`--md-sys-state-<state>-opacity`). Every interactive element also keeps a
visible `:focus-visible` outline.

## Motion

- Easing: `--md-sys-motion-easing-standard` (+ `-decelerate`, `-accelerate`) and
  `--md-sys-motion-easing-emphasized` (+ `-decelerate`, `-accelerate`).
- Duration: `short1-4` = 100, 150, 200, 250ms; `medium1-3` = 300, 350, 400ms.
- `prefers-reduced-motion: reduce` sets every duration token to 0ms and globally cuts
  transitions, animations and smooth scrolling (end of `base.css`).

## Not yet

- Components still use the legacy aliases. P6 refactors `src/components/ui` onto the roles.
- Bento layouts and soft-surface (neumorphic) small controls come in P7.
