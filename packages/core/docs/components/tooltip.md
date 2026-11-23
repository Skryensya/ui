# tooltip

Category: overlays. Stylesheet: `@skryensya/core/components/tooltip.css`. Signatures: `Tooltip`.

## Tooltip

**Use when**

- a control already has an accessible name and needs a short description on hover or focus
- an icon-only button needs a redundant visual hint for whoever can see it

**Avoid when**

- the text is the only name or the only information available; it has to live outside the tooltip
- the content needs actions, formatting or several lines; use Popover
- it is a list of actions; that is a Menu

Alternatives: `Popover`, `Menu`.

- React: `import { Tooltip } from "@skryensya/react/tooltip"`.
- HTML: a `<span>` with `data-sk-anchor`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `placement` | "block-start" \| "block-end" \| "inline-start" \| "inline-end" | `"block-start"` |
| `arrow` | boolean | `false` |
| `interactive` | boolean | `true` |
| `openDelay` | number |  |
| `closeDelay` | number |  |
| `disabled` | boolean | `false` |
| `defaultOpen` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | signature | yes |
| `content` | text | yes |

**Example** (canonical tree `tooltip/on-an-icon-button`; its copy is placeholder, replace it)

```tsx
import { Button } from "@skryensya/react/button";
import { Tooltip } from "@skryensya/react/tooltip";

export function TooltipExample() {
  return (
    <Tooltip arrow content="Archiva el hilo sin borrarlo">
      <Button iconOnly aria-label="Archivar">🗄</Button>
    </Tooltip>
  );
}
```

```html
<span
  class="sk-tooltip"
  data-sk-anchor
  data-sk-placement="block-start"
  data-arrow
>
  <span class="sk-tooltip__trigger sk-anchor" data-sk-anchor-trigger>
    <button
      class="sk-button sk-interactive"
      data-sk-button
      data-variant="solid"
      data-tone="neutral"
      data-appearance="plain"
      data-size="md"
      type="button"
      data-icon-only
      aria-label="Archivar"
    >
      <span class="sk-button__label">🗄</span>
      <span class="sk-button__loader sk-loader" aria-hidden="true"></span>
    </button>
  </span>
  <div
    class="sk-tooltip__positioner sk-anchored"
    data-sk-anchor-positioner
  >
    <span class="sk-anchored-arrow" aria-hidden="true"></span>
    <div class="sk-tooltip__content" data-sk-anchor-content role="tooltip">
      Archiva el hilo sin borrarlo
    </div>
  </div>
</span>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/loader.css`, `@skryensya/core/components/tooltip.css`, `@skryensya/core/patterns/anchored.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:tooltipopenchange` | `onOpenChange` | { open: boolean } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-anchored-z`, `--sk-tooltip-bg`, `--sk-tooltip-fg`, `--sk-tooltip-font-size`, `--sk-tooltip-max-inline-size`, `--sk-tooltip-padding`, `--sk-tooltip-radius`, `--sk-tooltip-shadow`, `--sk-tooltip-wash`.
