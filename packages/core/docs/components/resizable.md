# resizable

Category: layout. Stylesheet: `@skryensya/core/components/resizable.css`. Signatures: `Resizable`, `Resizable.Panel`, `Resizable.Handle`.

## Resizable

**Use when**

- two or more regions share one box and the person decides how much room each gets: a list beside its detail, an editor over its output
- the split is a working preference worth keeping, not a fixed layout the page has already decided
- panels are peers: growing one is exactly shrinking its neighbour, and the box is always full
- a keyboard has to be able to move the boundary too: every handle is a focusable separator

**Avoid when**

- it is an application's navigation rail, with its own open and close, rail and remembered width; that is Sidebar, which clamps one value instead of trading between two
- the columns belong to a table; Table and Treegrid already carry their own column resizers
- the regions never change size; a Grid or Inline with fixed measures is simpler and has nothing to drag
- there is only room for one region at a time (a phone); resizing needs space the screen does not have, and Tabs fits better

Alternatives: `Sidebar`, `Grid`, `Inline`, `Tabs`.

- React: `import { Resizable } from "@skryensya/react/resizable"`.
- HTML: a `<div>` with `data-sk-resizable`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `direction` | "horizontal" \| "vertical" | `"horizontal"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `Resizable.Panel`, `Resizable.Handle` | yes |

**Example** (canonical tree `resizable/three-panels`; its copy is placeholder, replace it)

```tsx
import { Resizable } from "@skryensya/react/resizable";

export function ResizableExample() {
  return (
    <Resizable>
      <Resizable.Panel size={25} minSize={15} maxSize={40}>
        Folders
      </Resizable.Panel>
      <Resizable.Handle label="Resize folders" />
      <Resizable.Panel minSize={30}>List</Resizable.Panel>
      <Resizable.Handle label="Resize detail" />
      <Resizable.Panel size={30}>Detail</Resizable.Panel>
    </Resizable>
  );
}
```

```html
<div class="sk-resizable" data-sk-resizable data-direction="horizontal">
  <div
    class="sk-resizable__panel"
    data-size="25"
    data-min-size="15"
    data-max-size="40"
    data-collapsed-size="0"
  >
    Folders
  </div>
  <div
    class="sk-resizable__handle"
    aria-label="Resize folders"
    role="separator"
    tabindex="0"
  >
    <span class="sk-resizable__grip sk-grip" aria-hidden="true"></span>
  </div>
  <div
    class="sk-resizable__panel"
    data-min-size="30"
    data-max-size="100"
    data-collapsed-size="0"
  >
    List
  </div>
  <div
    class="sk-resizable__handle"
    aria-label="Resize detail"
    role="separator"
    tabindex="0"
  >
    <span class="sk-resizable__grip sk-grip" aria-hidden="true"></span>
  </div>
  <div
    class="sk-resizable__panel"
    data-size="30"
    data-min-size="10"
    data-max-size="100"
    data-collapsed-size="0"
  >
    Detail
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/resizable.css`.

## Resizable.Panel

**Use when**

- one region of the split; give it a size when the starting proportion matters and leave it out to share equally
- a region that must never vanish or swallow the others: set minSize and maxSize
- a region the person may want out of the way (a file list, an inspector): mark it collapsible, so dragging past its floor closes it and its bar stays to open it again

**Avoid when**

- it holds the handle or any layout of its own; the panel is the box, put the content inside it
- it should be able to reach zero by setting minSize to 0; that leaves no clear way back, use collapsible

Alternatives: `Box`.

- React: `import { Resizable } from "@skryensya/react/resizable"`, then `<Resizable.Panel>`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `Resizable`.

**Options**

| Option | Values | Default |
|---|---|---|
| `size` | number |  |
| `minSize` | number | `10` |
| `maxSize` | number | `100` |
| `collapsible` | boolean | `false` |
| `collapsedSize` | number | `0` |
| `minInlineSize` | string |  |
| `minBlockSize` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node |  |

## Resizable.Handle

**Use when**

- between two panels, so a person can drag or arrow the boundary; one handle per pair

**Avoid when**

- a static rule is all that is wanted; that is Separator, which divides and does not move
- it has no label: a focusable separator with no name is announced as just 'separator'

Alternatives: `Separator`.

- React: `import { Resizable } from "@skryensya/react/resizable"`, then `<Resizable.Handle>`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `Resizable`.
- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string |  |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-resizable-handle-active-color`, `--sk-resizable-handle-color`, `--sk-resizable-handle-hit`, `--sk-resizable-handle-line`, `--sk-resizable-panel-min-block-size`, `--sk-resizable-panel-min-inline-size`, `--sk-resizable-size`.
