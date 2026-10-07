---
num: 35
title: Layout answers to its container, and a page is built from the kit alone
short: "Container layout"
summary: >-
  Every layout rule that changes with width asks the nearest query container instead of the viewport:
  the document is the container of last resort, and the regions that change width (Main, Sidebar) are
  containers of their own. On that footing the kit closes the gaps that made every real page write its
  own CSS: one-sided `show`, a block-axis `justify` for Stack, spans for uneven columns, an AppShell that
  is also a document's frame, owns its scroll and folds its rails into a drawer on a phone.
---

The templates were the evidence. Seventeen pages composed for the docs gallery, and not one of them was
built from the kit alone: every page leaned on `page-shell` (a footer on the floor, a padded main, a
Hero flush under the header), every application on `app-shell` (a pane that scrolls), and six on
`template-wide-only` / `template-narrow-only` to fold their links behind a menu button that opened
nothing. The dashboard's own comment said why its KPI row was cramped: the lanes read the viewport, the
row lived in a pane a third narrower, and the kit published no container query. A consumer would have
written the same CSS, so the kit was missing it.

## The container, not the viewport

Decision 30 put the expanded line at 52rem and left the question it is asked of open: "Container
queries remain a separate, kit-wide change". This is that change.

- **Every width rule is `@container`, unnamed.** It answers for the nearest query container, which is
  the room the element actually has. The literals stay the `_breakpoints.scss` steps, hand-copied for
  the reason ADR-19 already gives: a container query cannot read a custom property any more than a
  media query can.
- **The document is the container of last resort.** `:root` declares `container-type: inline-size`
  in base (`patterns/query-container.css`), beside the state layer and the icon, because a query with
  no container to ask is never true. A page with no Main answers exactly as it did against the
  viewport; `declared-spacing.spec.ts` still passes unchanged.
- **The regions that change width are containers.** `Main` (the work area beside a rail) and `Sidebar`
  (a rail with its own width hook). Both have a width that never comes from their content, which is
  the one condition inline-size containment needs.
- **Not Wrapper, not Box.** A 42rem reading column on a wide screen is not a phone, and decision 30
  wants its expanded spacing there. A Box is often a fit child of an Inline, where inline-size
  containment would collapse it to nothing.
- **Not overlays.** Vaul and Dialog keep their `@media`: whether a sheet becomes a dialog is a question
  about the screen the top layer covers, not about where the trigger sits.

## One side of the line: `show`

`show: "compact" | "expanded"` on Stack, Inline, Grid and Box hides the element on the other side of
the line. `display: none`, so it leaves the accessibility tree too: a phone's menu button is not a
second, silent copy of the desktop's links. Navbar accepts an Inline as a child for this, because the
bar is a flex row and a group of its items needs no part of its own.

## The frame: AppShell for applications and documents

- **A document is an AppShell with no rail.** Header, a Main that grows, a Footer that stays on the
  floor of a short page. The work-area row keeps its automatic minimum, so a page grows past the
  screen and its footer follows; only `scroll: "regions"` zeroes it.
- **`scroll` says where the scroll lives.** `page` by default; `regions` makes the shell a screen tall
  and scrolls each region in its own box, which is what a mail client, a chat or an editor is.
  `stickyHeader` pins the header on a page that scrolls. Below the expanded line the shell always
  scrolls as a page: one column of panes on a phone is a page.
- **Rails are placed by where they stand.** A Sidebar before the Main is the start rail, one after it
  the end rail. `side: "end"` mirrors the rail itself, and both bindings flip the resize sign the way
  they already did for a right-to-left page (`sidebarTowardWider`).
- **Below the expanded line the rails are not drawn.** Decision 8 still holds: collapsing narrows a
  rail and never hides it. What changes here is the layout, not the rail: a 390px screen has no room
  for a column beside the work, so what the rail carries reaches it in a `Vaul.drawer`, a child of the
  shell, opened by a `Vaul.Trigger` the header shows with `show: "compact"`. The tree carries the
  navigation twice, as the docs site itself does (its rail and its drawer answer different questions).
  `review_ui` fails a shell with a rail and no drawer opened from it (`rails-reach-compact`), since a
  rail that vanishes with nothing in its place is a reflow failure, not a style choice.
- **Main owns its block inset.** `paddingBlock` and its expanded side, block only, because the inline
  gutter is the Wrapper's. A Hero that opens the Main sits flush and square, the rule `page-shell`
  used to carry.

## The rest of the gaps

- **Stack `justify`** is the block-axis twin of Inline's: given, the Stack fills the height its parent
  has (a Main, a stretched card) and spends the leftover. No default, so a Stack that says nothing never
  claims height.
- **Uneven columns are spans of even ones.** `data-span` is a published child attribute in fixed grids
  too, written only where the grid has that many lanes, so a span never conjures an implicit track.
  `fill`, `--sk-grid-fill` and `--sk-grid-template` are removed: nothing used them, and a second
  vocabulary of ratios is what a span makes unnecessary.
- **`gap: "section"`** reaches `--space-section`, the distance between a page's bands.
- **Grid `align`** places cells in their row; LayoutGrid's `flush` breakout becomes a published child
  attribute instead of a pass-through the validator could not check.

## What stays as it was, on purpose

- **Inline's default `align` stays `end`.** It is the field-beside-its-button case, and the stylesheet
  records why.
- **Stack does not render as a list.** A `ul` owes its children `li`, which a primitive with node
  children cannot keep; a list is `List`.
- **A table wider than a phone scrolls** in its `TableScroll`. Hiding a column hides data with no way to
  reach it.

## Evidence

`packages/ai-gates/src/container-queries.spec.ts` measures a Grid in a narrow Main against the same
Grid at the root, `show` on both sides, spans, `justify`, and the shell's columns, rails and scroll.
`layout/container-surface` and `layout/app-shell` hold both bindings to the same attributes. Every
template in the gallery is now an AppShell composed from published signatures, with no layout class of
the site's own.
