---
num: 30
title: Spacing declares its desktop side, it is never inferred
short: "Declared desktop spacing"
summary: >-
  A layout that wants different spacing on a phone and on a desktop says so, with a second option
  beside the first: `padding` + `paddingDesktop`, `gap` + `gapDesktop`, `gutter` + `gutterDesktop`.
  The plain option is the value from the smallest screen up; the `Desktop` one replaces it from the
  `desktop` breakpoint (52rem) up. Neither density nor fluid tokens stand in for that choice, and a
  layout that declares nothing renders exactly as before.
---

A spacing step that is right on a desktop (`xl` around a card, `lg` beside a page column) is usually
too much on a phone, where the same 32px on both sides of a 390px screen is a sixth of it. The
templates made that visible: nested insets left a phone a 200px column.

## The two automatic answers, and why neither

**Density.** `--sk-density` already scales every spacing token, but it scales control sizes with them
([decision 1](./0001-density-is-a-multiplier-with-the-floor-inside.md)), and a phone wants its
controls as large as ever. It is also a product preference, not a property of the screen.

**Fluid tokens** (`clamp()` over the viewport or a container). They remove the choice from the
author: every `lg` in the product becomes smaller on a phone, including the ones that should not. A
layout's spacing on each screen size is a design decision, and a decision belongs where it can be
read, reviewed and changed one layout at a time.

## One more option per axis, mobile first

Each layout primitive that owns spacing gets a `Desktop` sibling for it:

| Signature | Phone (and up) | Desktop and up |
|---|---|---|
| `Box`, `Hero`, `Footer` | `padding` | `paddingDesktop` |
| `Stack`, `Inline`, `Grid` | `gap` | `gapDesktop` |
| `Wrapper` | `gutter` | `gutterDesktop` |

```ts
{ contract: "box", signature: "Box", options: { padding: "md", paddingDesktop: "xl" } }
```

- **Two sizes, not a map.** The kit's own layouts already switch at `desktop` (the rail becomes a
  drawer, Vaul changes shape), so that is the line a layout declares against. An option value is a
  string, not an object, which keeps usage trees flat and every value one attribute.
- **No default on the `Desktop` option.** Absent, nothing is written and the plain option holds at
  every width, so no existing tree or page moves. The same holds for Wrapper's `gutter`, which stays
  `--space-inset-lg` until declared.
- **Declared beats automatic.** Footer already stepped `lg`/`xl` down on phones on its own. That
  guess now yields as soon as `paddingDesktop` is present: the author has said what the phone gets.
- **Viewport, like the rest of the kit.** The switch is an `@media` at 52rem, the literal the other
  breakpoint rules hand-copy from `semantic/_breakpoints.scss`. Container queries remain a separate,
  kit-wide change.

## Evidence

`packages/ai-gates/src/declared-spacing.spec.ts` measures the used values on either side of 832px;
the `layout/declared-desktop-spacing` tree holds both bindings to the same attributes.
