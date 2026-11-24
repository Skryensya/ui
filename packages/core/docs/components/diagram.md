# diagram

Category: content. Stylesheet: `@skryensya/core/components/diagram.css`. Signatures: `Diagram`.

## Diagram

**Use when**

- how several things relate has to be explained: a linear flow, an if/else, a decision tree, a state machine with a loop. All four come from the same two pieces, they are not four modes
- the boxes are ordinary HTML content and the drawing is everything else: the runtime measures and computes the routes, the elbows, the arrowheads and where each label lands. Whoever composes never writes a coordinate
- the layout is an ordinary CSS grid: `columns` on the frame and `span` on a node cover the usual shapes, and anything else is `grid-area` in the consumer's own stylesheet. If a media query moves a node, the connectors redraw themselves
- the relationship has to reach a screen reader: the SVG is `aria-hidden` and the binding writes an announced list of where it leads inside each node, so the drawing can be read without seeing it
- a loop is needed: an edge to a node higher up leaves through the margin and comes back, which is how "and start again" has always been drawn
- the edges are not a sequence but a relation between things (a model, a schema): `arrow: "none"` draws the line with no head and the label carries the cardinality
- a node has to say more than one line of text: its slot takes a composition, so any tree of the catalogue fits inside
- what has to be drawn is boolean logic: `shape` brings the seven gates of IEEE 91 / IEC 60617-12 notation (`and`, `or`, `xor`, `nand`, `nor`, `xnor`, `not`), with the real shape and not a box that says AND inside
- the diagram is wider than the screen showing it (four columns on a phone): wrapped in a `Canvas` it is designed at its desktop width and shown fitted, with zoom, instead of squeezing each box to one word per line
- a gate and a step go in the same drawing: they are one `Diagram`, so a gate's result can feed a process box and a step's output can be an operand, without switching components halfway

**Avoid when**

- what has to be named are the parts of one thing already drawn: that is Annotation, which anchors each label to a selector inside the subject and does not draw a graph
- the content is a sequence with no branches and no loops: that is Procedure if they are instructions, or Steps if progress is primary; a single-column diagram with no forks is a list with extra lines
- the hierarchy is containment and not flow (folders, a file tree): that is TreeView, where what matters is what is inside what
- the graph is large, comes from data, or has to be explored or have its nodes dragged: this does not do layout, it draws small hand-written diagrams. Wrapping it in a Canvas is enough to zoom and pan the view
- full UML notation, swimlanes or box types by convention (cylinder, parallelogram, hexagon) are needed: those are conventions the reader has to be taught, and of the prose shapes only the three understood without a legend live here. Logic gates are the exception and pass the same test from the other side: they are not a box that means AND, they are the symbol the standard assigns to conjunction, and anyone who reads the notation reads it without a legend
- a real schematic is needed: this draws the seven gates and nothing else. There are no flip-flops, buses, multiplexers, components with numbered pins, junction nodes or netlist; a gate holds nothing inside either, so a visible designator (`U1`) has nowhere to go
- the logic drawing needs feedback: a latch of cross-coupled gates cannot be drawn here. Operands have to come from earlier columns, which is the order a schematic is drawn in anyway; a wire going backwards bends halfway between its two ends, and if both gates share a column that point falls inside both and the wire runs under the symbol it was feeding

Alternatives: `Annotated`, `Procedure`, `Steps`, `TreeView`.

- React: `import { Diagram } from "@skryensya/react/diagram"`.
- HTML: a `<div>` with `data-sk-diagram`, enhanced by Vanilla's mount.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string |  |
| `columns` | number |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `nodes` | a list of items (below) | yes |
| `zones` | a list of items (below) |  |
| `edges` | a list of items (below) | yes |

Each item in `nodes`, keyed by `node`: `node` (string), `shape` ("process" \| "decision" \| "terminal" \| "and" \| "or" \| "xor" \| "nand" \| "nor" \| "xnor" \| "not"), `span` (number), `zone` (string), `children` (node, required), `logo` (node), `designator` (node), `rows` (items).

Each item in `zones`, keyed by `zone`: `zone` (string), `within` (string), `children` (text, required).

Each item in `edges`: `from` (string), `to` (string), `fromRow` (string), `toRow` (string), `arrow` ("end" \| "both" \| "none"), `children` (text).

**Accessible name**

- un diagrama es un grupo sin encabezado propio: sin `label`, un lector de pantalla anuncia una lista de palabras sueltas y nada dice de qué es el dibujo Give one of: `label`.

**Example** (canonical tree `diagram/flow`; its copy is placeholder, replace it)

```tsx
import { Diagram } from "@skryensya/react/diagram";
import { type CSSProperties } from "react";
import { nodes, edges } from "./diagram-data";

export function DiagramExample() {
  return (
    <Diagram
      label="Request handling"
      columns={2}
      style={{ "--sk-diagram-columns": 2 } as CSSProperties}
      nodes={nodes}
      edges={edges}
    />
  );
}
```

`diagram-data.ts`:

```ts
export const nodes = [
  { node: "start", shape: "terminal", span: 2, children: "Request" },
  { node: "valid", shape: "decision", span: 2, children: "Session valid?" },
  { node: "app", children: "Dashboard" },
  { node: "login", children: "Sign in" },
];

export const edges = [
  { from: "start", to: "valid" },
  { from: "valid", to: "app", children: "yes" },
  { from: "valid", to: "login", children: "no" },
  { from: "login", to: "valid", children: "retry" },
];
```

```html
<div
  class="sk-diagram"
  data-sk-diagram
  aria-label="Request handling"
  style="--sk-diagram-columns: 2;"
  role="group"
>
  <ul class="sk-diagram__zones"></ul>
  <svg class="sk-diagram__connectors" aria-hidden="true" focusable="false"></svg>
  <ul class="sk-diagram__nodes">
    <li
      class="sk-diagram__node"
      data-node="start"
      data-shape="terminal"
      style="--sk-diagram-node-span: 2;"
    >
      <span class="sk-diagram__node-title">Request</span>
    </li>
    <li
      class="sk-diagram__node"
      data-node="valid"
      data-shape="decision"
      style="--sk-diagram-node-span: 2;"
    >
      <span class="sk-diagram__node-title">Session valid?</span>
    </li>
    <li class="sk-diagram__node" data-node="app" data-shape="process">
      <span class="sk-diagram__node-title">Dashboard</span>
    </li>
    <li class="sk-diagram__node" data-node="login" data-shape="process">
      <span class="sk-diagram__node-title">Sign in</span>
    </li>
  </ul>
  <ul class="sk-diagram__edges">
    <li
      class="sk-diagram__edge"
      data-from="start"
      data-to="valid"
      data-arrow="end"
    ></li>
    <li
      class="sk-diagram__edge"
      data-from="valid"
      data-to="app"
      data-arrow="end"
    >
      yes
    </li>
    <li
      class="sk-diagram__edge"
      data-from="valid"
      data-to="login"
      data-arrow="end"
    >
      no
    </li>
    <li
      class="sk-diagram__edge"
      data-from="login"
      data-to="valid"
      data-arrow="end"
    >
      retry
    </li>
  </ul>
</div>
```

Stylesheets: `@skryensya/core/components/diagram.css`, `@skryensya/core/patterns/visually-hidden.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-diagram-columns`, `--sk-diagram-column-gap`, `--sk-diagram-row-gap`, `--sk-diagram-node-span`, `--sk-diagram-node-bg`, `--sk-diagram-node-border-color`, `--sk-diagram-node-border-width`, `--sk-diagram-node-color`, `--sk-diagram-node-radius`, `--sk-diagram-node-padding-inline`, `--sk-diagram-node-padding-block`, `--sk-diagram-node-min-inline-size`, `--sk-diagram-node-max-inline-size`, `--sk-diagram-canvas-inline-size`, `--sk-diagram-node-font-size`, `--sk-diagram-node-line-height`, `--sk-diagram-node-font-weight`, `--sk-diagram-node-shadow`, `--sk-diagram-logo-size`, `--sk-diagram-logo-gap`, `--sk-diagram-row-color`, `--sk-diagram-row-font-size`, `--sk-diagram-row-line-height`, `--sk-diagram-row-padding-block`, `--sk-diagram-row-padding-inline`, `--sk-diagram-row-rule-color`, `--sk-diagram-record-header-bg`, `--sk-diagram-record-header-font-weight`, `--sk-diagram-decision-aspect`, `--sk-diagram-decision-stroke-scale`, `--sk-diagram-gate-inline-size`, `--sk-diagram-designator-color`, `--sk-diagram-designator-font-size`, `--sk-diagram-designator-gap`, `--sk-diagram-connector-color`, `--sk-diagram-connector-width`, `--sk-diagram-zone-bg`, `--sk-diagram-zone-border-color`, `--sk-diagram-zone-border-style`, `--sk-diagram-zone-border-width`, `--sk-diagram-zone-color`, `--sk-diagram-zone-label-bg`, `--sk-diagram-zone-font-size`, `--sk-diagram-zone-inset`, `--sk-diagram-zone-inset-block-start`, `--sk-diagram-zone-padding-block`, `--sk-diagram-zone-padding-inline`, `--sk-diagram-zone-radius`, `--sk-diagram-edge-bg`, `--sk-diagram-edge-color`, `--sk-diagram-edge-border-color`, `--sk-diagram-edge-radius`, `--sk-diagram-edge-padding-inline`, `--sk-diagram-edge-padding-block`, `--sk-diagram-edge-font-size`, `--sk-diagram-edge-line-height`.
