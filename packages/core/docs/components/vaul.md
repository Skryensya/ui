# vaul

Category: overlays. Stylesheet: `@skryensya/core/patterns/vaul.css`. Signatures: `Vaul`, `Vaul.Close`, `Vaul.drawer`, `Vaul.Trigger`.

## Vaul

**Use when**

- a modal panel arrives from an edge and can be closed by dragging it: a filter, an action sheet, sharing
- on mobile the task should rest on an edge rather than in a centered box

**Avoid when**

- it is a short decision that has to be confirmed: that is Dialog, centered and with a title of its own
- it is a Dialog that should become a bottom sheet only on mobile: that is Dialog with vaul, which keeps its header and its title
- it does not block the rest of the screen: that is Popover

Alternatives: `Dialog`, `Popover`.

- React: `import { Vaul } from "@skryensya/react/vaul"`.
- HTML: a `<dialog>` with `data-sk-vaul`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `panelId` (React: `id`) | string |  |
| `edge` | "inline-start" \| "inline-end" \| "block-end" | `"block-end"` |
| `open` | boolean | `false` |
| `label` | string |  |
| `draggable` | boolean | `true` |
| `dismissThreshold` | number | `0.4` |
| `appearance` | "plain" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Accessible name**

- showModal() gives the panel role="dialog", and a dialog needs a name. Give one of: `label`, `aria-labelledby`.

**Example** (canonical tree `vaul/edge-panel`; its copy is placeholder, replace it)

```tsx
import { Vaul } from "@skryensya/react/vaul";

export function VaulExample() {
  return (
    <Vaul edge="inline-start" open label="Navegación">
      Trabajo, Personal, Archivo
    </Vaul>
  );
}
```

```html
<dialog
  class="sk-vaul"
  data-sk-vaul
  data-appearance="plain"
  data-edge="inline-start"
  open
  aria-label="Navegación"
  data-dismiss-threshold="0.4"
>
  <div class="sk-vaul__handle" aria-hidden="true" data-part="handle"></div>
  Trabajo, Personal, Archivo
</dialog>
```

Stylesheets: `@skryensya/core/patterns/vaul.css`.

## Vaul.Close

**Use when**

- the panel needs a button of its own to close (a Done, an X): it goes inside the Vaul

**Avoid when**

- the button confirms an action besides closing; there a Button that performs the action and closes from its own handler fits better

- React: `import { Vaul } from "@skryensya/react/vaul"`, then `<Vaul.Close>`.
- HTML: a `<button>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `buttonVariant` (React: `variant`) | string |  |
| `buttonTone` (React: `tone`) | string |  |
| `buttonSize` (React: `size`) | string |  |
| `buttonIconOnly` (React: `iconOnly`) | boolean | `false` |
| `buttonLabel` (React: `aria-label`) | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Accessible name**

- An icon-only trigger or close button has no visible text, so nothing else names it. Give one of: `buttonLabel`.

## Vaul.drawer

**Use when**

- the modal panel takes its whole edge: mobile navigation, a side panel of filters
- the content is a long list that needs the full height

**Avoid when**

- a sheet resting on the edge is enough: that is Vaul
- the navigation has to stay visible beside the content: a drawer is modal and blocks the page; that is Sidebar

Alternatives: `Vaul`, `Sidebar`.

- React: `import { Drawer } from "@skryensya/react/vaul"`.
- HTML: a `<dialog>` with `data-sk-vaul`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `panelId` (React: `id`) | string |  |
| `edge` | "inline-start" \| "inline-end" \| "block-end" | `"block-end"` |
| `open` | boolean | `false` |
| `label` | string |  |
| `draggable` | boolean | `true` |
| `dismissThreshold` | number | `0.4` |
| `appearance` | "plain" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Accessible name**

- showModal() gives the panel role="dialog", and a dialog needs a name. Give one of: `label`, `aria-labelledby`.

**Example** (canonical tree `vaul/drawer`; its copy is placeholder, replace it)

```tsx
import { Drawer } from "@skryensya/react/vaul";

export function DrawerExample() {
  return (
    <Drawer edge="inline-start" open label="Navegación">
      Trabajo, Personal, Archivo
    </Drawer>
  );
}
```

```html
<dialog
  class="sk-vaul sk-drawer"
  data-sk-vaul
  data-appearance="plain"
  data-edge="inline-start"
  open
  aria-label="Navegación"
  data-dismiss-threshold="0.4"
>
  <div class="sk-vaul__handle" aria-hidden="true" data-part="handle"></div>
  Trabajo, Personal, Archivo
</dialog>
```

Stylesheets: `@skryensya/core/patterns/vaul.css`.

## Vaul.Trigger

**Use when**

- a button on the page opens a Vaul: opens is the panel's panelId, and both go in the same tree

**Avoid when**

- the panel opens from script, not from a button; then no trigger is needed
- it opens a popover or a menu anchored to the button; that is Popover or Menu, which bring their own trigger

Alternatives: `Popover`, `Menu`.

- React: `import { Vaul } from "@skryensya/react/vaul"`, then `<Vaul.Trigger>`.
- HTML: a `<button>`, no JavaScript needed.

- Requires the options: `opens`.

**Options**

| Option | Values | Default |
|---|---|---|
| `opens` | string |  |
| `buttonVariant` (React: `variant`) | string |  |
| `buttonTone` (React: `tone`) | string |  |
| `buttonSize` (React: `size`) | string |  |
| `buttonIconOnly` (React: `iconOnly`) | boolean | `false` |
| `buttonLabel` (React: `aria-label`) | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Accessible name**

- An icon-only trigger or close button has no visible text, so nothing else names it. Give one of: `buttonLabel`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:vaulopenchange` | `onOpenChange` | { open: boolean } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-drawer-bg`, `--sk-drawer-border-color`, `--sk-drawer-border-width`, `--sk-drawer-elevation`, `--sk-drawer-fg`, `--sk-drawer-inline-size`, `--sk-drawer-wash`, `--sk-vaul-backdrop-bg`, `--sk-vaul-bg`, `--sk-vaul-border-color`, `--sk-vaul-border-width`, `--sk-vaul-drag-offset`, `--sk-vaul-drag-progress`, `--sk-vaul-elevation`, `--sk-vaul-enter-duration`, `--sk-vaul-enter-easing`, `--sk-vaul-exit-duration`, `--sk-vaul-exit-easing`, `--sk-vaul-fg`, `--sk-vaul-material`, `--sk-vaul-overpull`, `--sk-vaul-radius`, `--sk-vaul-release-duration`, `--sk-vaul-release-easing`, `--sk-vaul-size`, `--sk-vaul-wash`.
