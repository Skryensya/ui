---
num: 31
title: The Maker speaks only the contract and changes only through operations
short: "The Maker"
summary: >-
  The Maker is a visual page builder in which the browser places everything. It has no options of its
  own: its inspector shows exactly what a signature's contract declares, and anything it lacks is added
  to the contract in core or does not exist. A maker page changes only through a closed set of
  operations, none of which accepts a position, so coordinates cannot be expressed rather than being
  forbidden by a rule someone has to enforce.
---

A page builder usually starts from a canvas and coordinates, then adds "auto layout" on top. The
Maker starts from the other end: a maker page is a tree of maker nodes, and every maker node is a
usage-tree node plus a stable identity. Remove the identities and what is left is the usage tree
`validate_ui` accepts ([decision 14](./0014-the-usage-tree-is-the-single-currency.md)).

## No option the contract does not declare

The obvious path is for the builder to own a style panel (padding on anything, a radius, a width in
px) and compile it to CSS. That makes the Maker a second vocabulary beside the contract: a page built
in it could not be proposed by an agent, checked by the gates, or rendered by the vanilla binding
the same way. So the inspector shows only a signature's options and its parent's child attributes,
and when a control seems to be missing the answer is a contract change with its changelog entry, or
no control.

What that looked like on day one:

- **Stack has no `padding` and no `justify`.** Padding belongs to Box, and the Maker offers "wrap in
  Box". `justify` on a column with no set height has no visible effect.
- **Fill and fit belong to the parent.** Inline declares `sizing` (`fit`, `fill`) as a child
  attribute, the way LayoutGrid declares `width`. A node that moves to another parent loses it instead of carrying it
  as an orphan.
- **Constraining a width is Box's `measure`**, from the `--size-wrapper-*` scale and without
  centring. Wrapper remains the centred page column.
- **A responsive grid answers to its container.** Grid gains `minColumn`, which compiles to
  `repeat(auto-fit, minmax(min(X, 100%), 1fr))`, instead of a count per breakpoint.
- **Radius stays a theming dimension**, never a per-node control.
- **The `*Expanded` options ([decision 30](./0030-spacing-declares-its-expanded-side.md)) are shown**,
  because they are the contract, grouped beside their base option.

## A closed set of operations

Insert, move, remove, wrap, unwrap, set an option, set a host attribute, set a slot's text or
entries. Dragging in the outline, dragging on the stage, the keyboard, the inspector and (later) a
prompt all emit these and nothing else. `move` takes a parent and an index; no operation takes an x,
a y or an offset. Duplicating is an insert of a copy, not another operation.

Setting an attribute is in the set because two things the contract asks for are attributes, not
options: a child attribute a parent publishes (Inline's `data-sizing`) and the accessible name of an
icon-only control (`aria-label`). It is held tighter than an option: never `style`, `class` or a
handler, never an attribute an option already writes, a `data-*` one only when the parent's slot
publishes it, and anything else only when the signature forwards it.

What the browser computes (rects, rendered sizes) is read from the stage while painting overlays and
resolving a drop, and is never written to a maker page.

A site adds its own few beside them: add, remove, rename and move a page, set its path, and `edit`,
which carries one page operation to one page. They share the one history, so removing a page is
undone like removing a button.

## A prompt is an agent speaking operations

The spec asked that prompts respect the same paradigm. They do by construction: an agent reads the
site through the MCP's `maker_read` and changes it through `maker_apply`, whose input is the closed
set of operations and nothing else. "Put these two buttons next to each other" can only arrive as a
wrap in an Inline. The agent works through the MCP rather than a prompt box inside the Maker, so no
model key lives in a browser, and both save projects through the Maker's own API on top of the
revision they read (PostgreSQL announces every change): an agent's change appears live in any open
Maker and is undone like any other step.

## Structure is always sound, options may be pending

A drop zone appears only where the contract allows the node (`notInside`, required descendants), so
structure is valid at every step. Options are allowed to be **pending**: an emptied container or a
constraint not yet met is shown and reported, never silently repaired, and does not block export.

## Consequences

- Every gap the Maker finds becomes a contract change that also helps hand-written and agent-written
  trees.
- The stage renders in its own browsing context, sized to the chosen width, because the kit's CSS
  still answers to the viewport in places, and a narrowed div would lie about it.
