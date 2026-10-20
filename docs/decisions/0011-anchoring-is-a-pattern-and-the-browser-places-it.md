---
num: 11
title: Anchoring is a pattern, and Zag's popper is what places it
short: "Anchoring: a pattern, one engine (@zag-js/popper)"
summary: >-
  Nine components float anchored to a trigger and each one solved placement on its own. This decision
  unifies them in a PATTERN, `sk-anchored`, plus a small module in `@skryensya/core/anchored`. ONE engine
  places every box: Zag's popper (floating-ui underneath), through the component's own machine or, for
  the boxes with none, through `placeAnchored`. The CSS Anchor Positioning API, which this decision first
  chose, was removed (2026-10-14).
---

## Amendment, 2026-10-14: the browser no longer places

The first version of this decision made CSS Anchor Positioning the primary engine and Zag's machine the
fallback. It was removed, for two measured reasons:

- **A box trailed its anchor while the page scrolled.** In Chromium, under real wheel scrolling, an
  anchor-positioned box was laid out against the previous scroll step in roughly one frame out of three.
  Nothing in the pattern could fix it: the engine's timing is not a property.
- **Two engines meant two behaviours.** Submenus, and every box in a browser without the API, were
  already placed by Zag; the browser engine could not paint a box anchored inside another anchored box.

What replaced it:

- **`anchoredPositioning`** (`core/src/anchored.ts`) is spread into every machine's `positioning`:
  `strategy: "fixed"`, a 4px gutter and `animationFrame`, so the popper re-measures every frame while a
  box is open instead of after each scroll event.
- **`placeAnchored(reference, floating, options)`** is the same popper for the boxes with no machine: the
  copy button's flag and Megamenu's shared panel. **`placeNativePopovers()`** does it for `popover="auto"`
  boxes, on the browser's `toggle` event.
- **The stylesheet** (`patterns/anchored.css`) only turns the popper's `--x`/`--y` into a `transform`
  and owns the arrow. Side, flip and gap are popper options set in JS; `--sk-anchored-position-area`,
  `-offset`, `-size`, `-justify`, `-align` and `-position-try` no longer exist.
- **The arrow** is marked `data-part="arrow"`, which is how the popper finds and moves it, and takes
  `data-side` from the side the popper resolved.
- **`data-placed`** is written once the popper has measured a box that has no machine, so it is never
  seen at the origin first.

The rest of this document is the original reasoning. Anything below about `position-area`,
`position-try`, `anchor-size()`, `anchor-name`, the `@supports` split or the degraded states describes
the removed engine; the anatomy, the four logical placements, the optional authored arrow and the
decision to add no engine of our own still hold.

## What was there

Four paths for a single behavior:

- **Tooltip and Select**: anchor positioning with a Zag fallback, implemented twice and differently. Two
  support probes, two conventions for naming the anchor (`--sk-select-anchor-${id}` against
  `--${root.id}-anchor`), two functions removing Zag's inline `style` from the positioner.
- **Popover and Popup**: anchor positioning with no fallback at all.
- **Menu, Combobox, Date picker**: Zag only, with no `@supports` block anywhere, meaning that in a browser
  with the API they still positioned in JS.
- **Flyout**: hand-written geometry, `computeFlyoutFixedCoords`, with its own flip and its own clamp.

Three CSS dialects for the same thing, on top of that: `position-area` with hooks in tooltip, raw
`top: anchor(bottom)` in select, and a hardcoded `position-area` with no hooks in popover.

## It is a pattern, by decision 8's rule

[ADR-2](./0002-what-tier-3-ships.md)'s question is whether a second component could need this exact
structure. Here it is not hypothetical: **nine** already need it. So it ships hooks *and* structure, like
Vaul, and not only variables.

`.sk-anchored` goes **alongside** the component's positioner class, it does not replace it, the same way
`sk-interactive` coexists with `sk-button`. The component still owns its paint and its `z-index`; the
pattern owns placement and nothing else.

## The primary engine is the browser

Where the anchor positioning API exists, the browser places: no layout loop, no measuring on every
scroll, and with `position-try-fallbacks` and `position-visibility` resolving the flip and the lost
anchor in the layout engine, which is where that information already lives. Where it is absent, Zag's
machine positions.

**The fallback is not an inferior path**, it is the same contract executed by another engine. What it
requires is that the two do not run at once: on the browser path the binding strips the inline `style`
Zag brings from the positioner, and that is why the pattern's declarations can stay free of `!important`.
That is load-bearing: `position-try` can only flip declarations that are NOT `!important`, so an
`!important` there would switch off the flip.

## One dialect, `position-area`

tooltip.css's grammar is chosen, `position-area` plus hooks, and select.css's is abandoned,
`top: anchor(bottom); left: anchor(left)`. Both work; the difference is that
`position-try-fallbacks: flip-block | flip-inline` exists **in order to flip `position-area`**. With raw
insets you have to write every fallback by hand and you are back to geometry, only declarative.

`anchor-size()` survives as an optional hook, `--sk-anchored-size`, because Select's `sameWidth` is a real
need and not a dialect: the listbox has to measure what its trigger measures.

## No engine is added

Floating UI is **already in the tree**, as `@zag-js/popper`, which is what the machines use. A direct
`@floating-ui/dom` dependency would be a second copy of the same engine to solve a problem the browser
solves on the primary path and the machine solves on the fallback. And `computeFlyoutFixedCoords`, the
only geometry of our own that was left, stops being API: it becomes Flyout's private fallback, Flyout
being the only anchored one without a machine.

## Four placements, on logical axes

`block-start`, `block-end`, `inline-start`, `inline-end`, requested with `data-sk-placement` on the
positioner and not on the root, because in React the positioner is portaled to the body and inheritance
from the root does not reach it. They flip themselves in RTL; the only place they do not is Zag's
fallback, whose placements are physical, and there the binding translates.

The vocabulary **is not enlarged** for the rare cases. A submenu wants `inline-end` aligned to the
block-start, and that is requested by overriding `--sk-anchored-position-area` directly, which is what a
hook is for. Adding a fifth placement to the public vocabulary for one case would be letting the
exception write the contract.

## The arrow is optional, and it is authored

A square rotated 45 degrees peeking out of the box's edge toward the anchor. **It is not invented**: if
the markup does not bring `.sk-anchored-arrow`, there is no arrow, and that is the default. A tooltip or
a popover wants one because they are floating chrome that has to say *which control* it is talking about;
a menu, a select or a combobox does not, because there the relationship is already stated by the border
shared with the trigger.

It is **decorative**, so it always goes with `aria-hidden`: it adds no information, it repeats what
placement already gives.

It is painted ON TOP of the box and not beneath it, which is what makes the seam disappear: the square's
fill covers the piece of border it enters through, and its two outer edges continue the box's own. A
`z-index: -1` would hide it exactly where it is most used, in a Popover, where the positioner and the
content are the SAME element and its own background would cover it.

### It comes from the anchor, not from the box's center

The difference appears as soon as the box shifts: `anchor-center` centers it over the anchor but pushes
it back on screen if it does not fit, so a trigger near the edge leaves the box displaced, and an arrow
drawn at 50% of that box points anywhere but at the control. That is the normal case for a toolbar
button, not a strange edge. So the arrow is not placed against the box: it is **another anchored box**
against the same anchor, with the same `position-area` and the same flip.

And even so it lives INSIDE the positioner, which would seem impossible: the spec only allows using as an
anchor something that is a *descendant of the containing block* of the element, and the trigger does not
hang off the positioner. What resolves it is **`position: fixed`**: a fixed element's containing block is
the viewport, where the trigger does live, even though in the DOM the arrow stays inside. With `absolute`
the containing block would be the positioner and `anchor()` and `anchor-center` would be invalid
SILENTLY, falling to the fallback without warning and without `CSS.supports` ceasing to say yes.

Staying inside is not tidiness either, it is needed for three things at once: the **top layer**, which a
Popover's box only enters together with its children; the **seam**, which is only covered by painting
over the box's background and border, and for that you have to be its positioned child; and the
**fallback**, where the machine places and `@zag-js/popper` looks for the arrow inside the floating
element.

It flips together with the box because it carries the box's height (`anchor-size()`) as its outer-side
margin: both have the same block footprint, so they cross `position-try`'s threshold at the same time. A
size is the only piece of data from the other element that can be read without scroll making it stale,
and that is why placement always goes through `position-area` and never through `anchor()` in the insets:
Blink compensates the former for scroll, not the latter, which lags by a whole scrollY.

## Costs, stated

- **Flyout's anatomy changes.** `sk-flyout__panel` splits into `__positioner` and `__content`. That is a
  contract change for anyone who authored a flyout's markup. It is done anyway: Flyout was the only one
  of nine out of alignment, and the pattern's value is that the anatomy is one.
- **Popover and Popup need an explicit degraded state.** Today, without the API, they end up
  `position: fixed` with no coordinates under `popover="auto"`, so the user agent's `inset: 0` governs
  and the box does not appear near its trigger. They have no machine, so there is no JS fallback to place
  them: the degraded state becomes a sheet centered in the viewport, chosen on purpose rather than
  inherited by accident.
- **The pattern is opt-in, like all of them.** Importing `patterns/anchored.css` is one more import for
  the consumer assembling their own sheet. It is the same cost `nav-list.css` or `scroll-lock.css`
  already carry.
- **The positioner has to carry an `anchor-name` of its own.** A second ident per instance, written by
  the binding just like the first, only so its arrow can measure it. `anchor-scope` over a shared name is
  not enough: two anchored elements open at once (a menu and its submenu) would both answer, and each
  arrow has to measure ITS box.
- **On flip, the `rotate` does not follow.** `position-try` flips insets, margins and alignment, but
  `rotate` is not a property it accepts. The diamond is symmetric at 180 degrees, so the SHAPE stays the
  same and only which of its sides carry the border changes: invisible in a tooltip, which has no border,
  a line on the wrong side in a popover, which does. It is the remainder of a cost that used to be the
  entire arrow drawn on the wrong edge of the box.
- **The positioner cannot carry `transform` or `translate`.** Either one turns it into the containing
  block of its `fixed` descendants, and with that the arrow loses the anchor for as long as it lasts. It
  was paid by moving the tooltip's entry offset from the positioner to its two pieces.
