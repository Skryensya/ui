# window

Category: overlays. Stylesheet: `@skryensya/core/components/window.css`. Signatures: `Window`.

## Window

**Use when**

- a panel has to live alongside the page: a tool palette, an inspector, a chat that stays open beside the work
- whoever uses it has to be able to move it, resize it or minimize it to see what it covers

**Avoid when**

- something has to be decided before going on; that is a Dialog, which makes the page inert
- the content hangs from a control and closes on an outside click; that is a Popover
- the panel comes in from an edge and does not move; that is a Vaul
- the content has to stay visible without JavaScript: a window does not open without its machine

Alternatives: `Dialog`, `Popover`, `Vaul`.

- React: `import { Window } from "@skryensya/react/window"`.
- HTML: a `<div>` with `data-sk-window`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `defaultOpen` | boolean | `false` |
| `draggable` | boolean | `true` |
| `resizable` | boolean | `true` |
| `closeOnEscape` | boolean | `true` |
| `persistRect` | boolean | `false` |
| `appearance` | "plain" \| "brutalist" \| "frosted" | `"plain"` |
| `defaultWidth` | number |  |
| `defaultHeight` | number |  |
| `minWidth` | number | `240` |
| `minHeight` | number | `120` |
| `boundary` | string |  |
| `closeLabel` | string | `"Close"` |
| `minimizeLabel` | string | `"Minimize"` |
| `maximizeLabel` | string | `"Maximize"` |
| `restoreLabel` | string | `"Restore"` |
| `triggerLabel` | string |  |
| `triggerVariant` | string |  |
| `triggerTone` | string |  |
| `triggerSize` | string |  |
| `triggerAppearance` | string |  |
| `triggerIconOnly` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |
| `title` | text | yes |
| `trigger` | node | yes |

**Accessible name**

- An icon-only trigger shows no text, so the trigger button owns the accessible name; the glyph is decorative. Give one of: `triggerLabel`.

**Example** (canonical tree `window/closed`; its copy is placeholder, replace it)

```tsx
import { Window } from "@skryensya/react/window";

export function WindowExample() {
  return (
    <Window
      defaultWidth={360}
      defaultHeight={220}
      trigger="Abrir inspector"
      title="Inspector"
    >
      Las propiedades de la capa seleccionada.
    </Window>
  );
}
```

```html
<div
  class="sk-window"
  data-sk-window
  data-default-width="360"
  data-default-height="220"
  data-min-width="240"
  data-min-height="120"
>
  <button
    class="sk-window__trigger sk-button sk-interactive"
    data-sk-window-trigger
    type="button"
  >
    Abrir inspector
  </button>
  <div class="sk-window__positioner" data-sk-window-positioner>
    <div
      class="sk-window__content"
      data-sk-window-content
      data-appearance="plain"
    >
      <div class="sk-window__drag" data-sk-window-drag>
        <div class="sk-window__header" data-sk-window-header>
          <h2 class="sk-window__title" data-sk-window-title>Inspector</h2>
          <div class="sk-window__controls" data-sk-window-controls>
            <button
              class="sk-window__stage sk-button sk-interactive"
              data-sk-window-stage
              aria-label="Minimize"
              type="button"
              data-stage="minimized"
              data-icon-only
              data-size="sm"
              data-variant="ghost"
            >
              <span data-sk-icon="minimize" data-sk-icon-size="sm"></span>
            </button>
            <button
              class="sk-window__stage sk-button sk-interactive"
              data-sk-window-stage
              aria-label="Maximize"
              type="button"
              data-stage="maximized"
              data-icon-only
              data-size="sm"
              data-variant="ghost"
            >
              <span data-sk-icon="maximize" data-sk-icon-size="sm"></span>
            </button>
            <button
              class="sk-window__stage sk-button sk-interactive"
              data-sk-window-stage
              aria-label="Restore"
              type="button"
              data-stage="default"
              data-icon-only
              data-size="sm"
              data-variant="ghost"
            >
              <span data-sk-icon="restore" data-sk-icon-size="sm"></span>
            </button>
            <button
              class="sk-window__close sk-button sk-interactive"
              data-sk-window-close
              aria-label="Close"
              type="button"
              data-icon-only
              data-size="sm"
              data-variant="ghost"
            >
              <span data-sk-icon="close" data-sk-icon-size="sm"></span>
            </button>
          </div>
        </div>
      </div>
      <div class="sk-window__body" data-sk-window-body>
        Las propiedades de la capa seleccionada.
      </div>
      <div class="sk-window__resize" data-sk-window-resize data-axis="n"></div>
      <div class="sk-window__resize" data-sk-window-resize data-axis="e"></div>
      <div class="sk-window__resize" data-sk-window-resize data-axis="s"></div>
      <div class="sk-window__resize" data-sk-window-resize data-axis="w"></div>
      <div class="sk-window__resize" data-sk-window-resize data-axis="ne"></div>
      <div class="sk-window__resize" data-sk-window-resize data-axis="se"></div>
      <div class="sk-window__resize" data-sk-window-resize data-axis="sw"></div>
      <div class="sk-window__resize" data-sk-window-resize data-axis="nw"></div>
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/window.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:windowopenchange` | `onOpenChange` | { open: boolean } |
| `sk:windowstagechange` | `onStageChange` | { stage: WindowStage } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-window-bg`, `--sk-window-border-color`, `--sk-window-brutalist-edge`, `--sk-window-brutalist-offset-block`, `--sk-window-brutalist-offset-inline`, `--sk-window-brutalist-shadow`, `--sk-window-fg`, `--sk-window-handle-size`, `--sk-window-header-bg`, `--sk-window-header-border-color`, `--sk-window-padding`, `--sk-window-radius`, `--sk-window-shadow`, `--sk-window-shadow-behind`, `--sk-window-wash`.
