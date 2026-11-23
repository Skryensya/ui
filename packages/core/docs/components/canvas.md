# canvas

Category: content. Stylesheet: `@skryensya/core/components/canvas.css`. Signatures: `Canvas`.

## Canvas

**Use when**

- a drawing is larger than the screen showing it (a diagram, an anatomy, a plan) and rescaling it beats reflowing it: it is designed at its own width and shown fitted
- on a phone the content would be rewrapped word by word: here it is seen whole and small, and the reader zooms into the part they care about
- zoom has to feel like a design tool: dragging pans, Ctrl/Cmd + wheel and trackpad pinch zoom around the pointer, `+`/`-`/`0` from the keyboard
- it must not hijack the page's scroll: one finger and the plain wheel stay the page's; two fingers and Ctrl + wheel are the canvas's, and a short hint explains it when someone tries the other
- an Annotated needs no wrapping: it already brings the same canvas around its frame and keeps the legend outside, unscaled

**Avoid when**

- the content fits the screen or can reflow without losing meaning: a canvas adds a gesture nobody needed
- it is an image that only needs to be seen larger: that is ImageFrame with a link to the full image, or a Dialog with the image
- the content is interactive and has to stay usable: drag-to-pan competes with every click and every text selection inside
- it is a wide table or list: that is native horizontal scroll inside its own container, which the keyboard and the screen reader already handle

Alternatives: `Annotated`, `ImageFrame`, `Dialog`.

- React: `import { Canvas } from "@skryensya/react/canvas"`.
- HTML: a `<div>` with `data-sk-canvas`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string |  |
| `minZoom` | number | `0.25` |
| `maxZoom` | number | `4` |
| `fitOnly` | boolean | `false` |
| `zoomInLabel` | string | `"Zoom in"` |
| `zoomOutLabel` | string | `"Zoom out"` |
| `fitLabel` | string | `"Fit to view"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |
| `touchHint` | text |  |
| `wheelHint` | text |  |

**Example** (canonical tree `canvas/default`; its copy is placeholder, replace it)

```tsx
import { Canvas } from "@skryensya/react/canvas";
import { Stat } from "@skryensya/react/stat";

export function CanvasExample() {
  return (
    <Canvas
      label="Plano"
      zoomInLabel="Acercar"
      zoomOutLabel="Alejar"
      fitLabel="Ajustar"
      touchHint="Usa dos dedos para mover el plano"
    >
      <Stat label="Ingresos" value="38.2K" />
    </Canvas>
  );
}
```

```html
<div
  class="sk-canvas"
  data-sk-canvas
  aria-label="Plano"
  data-min-zoom="0.25"
  data-max-zoom="4"
  role="group"
>
  <div class="sk-canvas__viewport" tabindex="0">
    <div class="sk-canvas__content">
      <div class="sk-stat" data-sk-stat>
        <span class="sk-stat__label">Ingresos</span>
        <span class="sk-stat__value">38.2K</span>
      </div>
    </div>
  </div>
  <div class="sk-canvas__controls">
    <button
      class="sk-canvas__control sk-button sk-interactive"
      aria-label="Acercar"
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
      aria-label="Alejar"
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
      aria-label="Ajustar"
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
    <span>Usa dos dedos para mover el plano</span>
  </p>
  <p class="sk-canvas__hint" data-canvas-hint="wheel" aria-hidden="true">
    <span>Use Ctrl + scroll to zoom</span>
  </p>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/canvas.css`, `@skryensya/core/components/stat.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-canvas-bg`, `--sk-canvas-border-color`, `--sk-canvas-radius`, `--sk-canvas-content-inline-size`, `--sk-canvas-max-block-size`, `--sk-canvas-min-block-size`, `--sk-canvas-viewport-bg`, `--sk-canvas-grid-color`, `--sk-canvas-grid-size`.
