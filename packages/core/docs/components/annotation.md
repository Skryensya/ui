# annotation

Category: content. Stylesheet: `@skryensya/core/components/annotation.css`. Signatures: `Annotated`.

## Annotated

**Use when**

- the pieces of something already rendered have to be pointed at and named: a component's anatomy, the parts of a composition, an assembly diagram
- the marks must not cover it: each part gets a number in one of the four margins of a grid and the subject takes the middle cell, so overlap is not avoided, it cannot be expressed; the names go in an ordered legend below
- each number reaches its part by a leader line of one or two segments, straight or at 45 degrees only: the fewest that will do
- the drawing recomputes itself when the container resizes, the subject reflows or a font arrives: where a part lands is not a value that can be written when composing
- the diagram has to read on a phone: the drawing lives on a canvas, is designed at its own width and shown fitted, with zoom to get close to a part
- some parts are areas that contain others (an accordion, one of its items, a panel): `mark: bracket` marks them with a bracket as long as the part, nested outward, instead of a leader that would land on some arbitrary child
- the subject is a sample and not a control: `inert` is on, it takes no pointer, focus or keyboard, and leaves the accessibility tree

**Avoid when**

- what is wanted is a numbered legend under a static image, with no leaders or rings: that is a List or a Table
- the label has to appear on hover or focus: that is Tooltip, which is floating, ephemeral chrome; this is always drawn
- a value next to a control inside a real form needs explaining: that is FormField's `hint`, which is also linked through aria-describedby
- the subject has to stay usable: `inert` is all or nothing, so a diagram over a live UI is two things fighting over the same markup
- the diagram is boxes and arrows between nodes, not the parts of one thing: this anchors each label to a selector inside the subject, it does not draw a graph

Alternatives: `Tooltip`, `FormField`, `List`.

- React: `import { Annotated } from "@skryensya/react/annotation"`.
- HTML: a `<div>` with `data-sk-annotated`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string |  |
| `inert` | boolean | `true` |
| `ringPlacement` | "inset" \| "offset" | `"inset"` |
| `ringDistance` | number | `2` |
| `ringRadius` | number |  |
| `fitOnly` | boolean | `false` |
| `zoomInLabel` | string | `"Zoom in"` |
| `zoomOutLabel` | string | `"Zoom out"` |
| `fitLabel` | string | `"Fit to view"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `items` (React: `annotations`) | a list of items (below) | yes |
| `key` | text |  |
| `subject` | node | yes |
| `touchHint` | text |  |
| `wheelHint` | text |  |

Each item in `items`, keyed by `for`: `for` (string), `mark` ("ring" \| "bracket"), `match` ("first" \| "all"), `ringDistance` (number), `ringPlacement` ("inset" \| "offset"), `ringRadius` (number), `side` ("inline-start" \| "inline-end" \| "block-start" \| "block-end"), `children` (node, required).

**Accessible name**

- un sujeto inerte sale del árbol de accesibilidad, así que sin `label` el grupo queda como una lista de nombres de partes sin decir de qué son las partes Give one of: `label`.

**Example** (canonical tree `annotation/anatomy`; its copy is placeholder, replace it)

```tsx
import { Annotated } from "@skryensya/react/annotation";
import { Stat } from "@skryensya/react/stat";
import { annotations } from "./annotation-annotations";

export function AnnotatedExample() {
  return (
    <Annotated
      label="Anatomía de Stat"
      inert
      subject={<Stat label="Ingresos" value="38.2K" />}
      annotations={annotations}
    />
  );
}
```

`annotation-annotations.ts`:

```ts
export const annotations = [
  { for: ".sk-stat", side: "block-start", children: "sk-stat" },
  { for: ".sk-stat__label", side: "inline-start", children: "sk-stat__label" },
  { for: ".sk-stat__value", side: "inline-end", children: "sk-stat__value" },
];
```

```html
<div
  class="sk-annotated-figure"
  data-sk-annotated
  aria-label="Anatomía de Stat"
  data-ring-placement="inset"
  data-ring-distance="2"
  role="group"
>
  <div class="sk-canvas" data-sk-canvas>
    <div class="sk-canvas__viewport" tabindex="0">
      <div class="sk-canvas__content">
        <div class="sk-annotated">
          <div class="sk-annotated__subject" inert>
            <div class="sk-stat" data-sk-stat>
              <span class="sk-stat__label">Ingresos</span>
              <span class="sk-stat__value">38.2K</span>
            </div>
          </div>
          <span
            class="sk-annotation"
            data-for=".sk-stat"
            data-side="block-start"
            data-match="first"
            aria-hidden="true"
          ></span>
          <span
            class="sk-annotation"
            data-for=".sk-stat__label"
            data-side="inline-start"
            data-match="first"
            aria-hidden="true"
          ></span>
          <span
            class="sk-annotation"
            data-for=".sk-stat__value"
            data-side="inline-end"
            data-match="first"
            aria-hidden="true"
          ></span>
          <svg
            class="sk-annotated__leaders"
            aria-hidden="true"
            focusable="false"
          ></svg>
        </div>
      </div>
    </div>
    <div class="sk-canvas__controls">
      <button
        class="sk-canvas__control sk-button sk-interactive"
        aria-label="Zoom in"
        type="button"
        data-canvas-action="zoom-in"
        data-icon-only
        data-size="xs"
        data-variant="ghost"
      >
        <span data-sk-icon="zoom-in" data-sk-icon-size="sm"></span>
      </button>
      <button
        class="sk-canvas__control sk-button sk-interactive"
        aria-label="Zoom out"
        type="button"
        data-canvas-action="zoom-out"
        data-icon-only
        data-size="xs"
        data-variant="ghost"
      >
        <span data-sk-icon="zoom-out" data-sk-icon-size="sm"></span>
      </button>
      <button
        class="sk-canvas__control sk-button sk-interactive"
        aria-label="Fit to view"
        type="button"
        data-canvas-action="fit"
        data-icon-only
        data-size="xs"
        data-variant="ghost"
      >
        <span data-sk-icon="fit" data-sk-icon-size="sm"></span>
      </button>
    </div>
    <div class="sk-canvas__minimap" aria-hidden="true">
      <span class="sk-canvas__minimap-view"></span>
    </div>
    <p class="sk-canvas__hint" data-canvas-hint="touch" aria-hidden="true">
      <span>Use two fingers to move the view</span>
    </p>
    <p class="sk-canvas__hint" data-canvas-hint="wheel" aria-hidden="true">
      <span>Use Ctrl + scroll to zoom</span>
    </p>
  </div>
  <ol class="sk-annotated__legend">
    <li class="sk-annotated__legend-item" tabindex="0">sk-stat</li>
    <li class="sk-annotated__legend-item" tabindex="0">sk-stat__label</li>
    <li class="sk-annotated__legend-item" tabindex="0">sk-stat__value</li>
  </ol>
</div>
```

Stylesheets: `@skryensya/core/components/annotation.css`, `@skryensya/core/components/button.css`, `@skryensya/core/components/canvas.css`, `@skryensya/core/components/stat.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-annotated-gap`, `--sk-annotated-key-color`, `--sk-annotated-subject-filter`, `--sk-annotated-surface-bg`, `--sk-annotated-legend-bg`, `--sk-annotated-figure-inset`.
