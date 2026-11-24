# popover

Category: overlays. Stylesheet: `@skryensya/core/components/popover.css`. Signatures: `Popover`, `Popover.bare`.

## Popover

**Use when**

- a panel with content of its own hanging from a control is needed: a short form, a formatted explanation
- the browser should handle closing on an outside click and on Escape

**Avoid when**

- it is a one-line description; that is a Tooltip and it does not steal focus
- it is a list of actions; that is a Menu, which already brings keyboard navigation
- it blocks the screen until a decision is made; that is a Dialog

Alternatives: `Tooltip`, `Menu`, `Dialog`.

- React: `import { Popover } from "@skryensya/react/popover"`.
- HTML: a `<div>`, no JavaScript needed.

- Requires the options: `panelId`.

**Options**

| Option | Values | Default |
|---|---|---|
| `panelId` (React: `id`) | string |  |
| `placement` | "block-start" \| "block-end" \| "inline-start" \| "inline-end" | `"block-end"` |
| `arrow` | boolean | `false` |
| `closeLabel` | string | `"Close"` |
| `triggerLabel` | string |  |
| `triggerVariant` | string |  |
| `triggerTone` | string |  |
| `triggerSize` | string |  |
| `triggerAppearance` | string |  |
| `triggerIconOnly` | boolean | `false` |
| `appearance` | "plain" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `trigger` | node | yes |
| `children` | node | yes |
| `title` | text |  |
| `description` | text |  |

**Accessible name**

- An icon-only trigger shows no text, so the trigger button owns the accessible name; the glyph is decorative. Give one of: `triggerLabel`.

**Example** (canonical tree `popover/on-a-trigger`; its copy is placeholder, replace it)

```tsx
import { Popover } from "@skryensya/react/popover";

export function PopoverExample() {
  return (
    <Popover
      id="demo-popover"
      arrow
      trigger="Detalles del plan"
      title="Plan Pro"
      description="Facturación mensual"
    >
      Incluye seis réplicas y soporte en horario hábil.
    </Popover>
  );
}
```

```html
<div class="sk-popover" data-appearance="plain" data-arrow>
  <button
    class="sk-popover__trigger sk-button sk-interactive sk-anchor"
    popovertarget="demo-popover"
    type="button"
  >
    Detalles del plan
  </button>
  <div
    class="sk-popover__positioner sk-popover__content sk-anchored"
    id="demo-popover"
    data-sk-placement="block-end"
    popover="auto"
    aria-labelledby="plan-pro"
    aria-describedby="sk-form-field-description"
  >
    <span class="sk-anchored-arrow" aria-hidden="true"></span>
    <h2 class="sk-popover__title" id="plan-pro">Plan Pro</h2>
    <p class="sk-popover__description" id="sk-form-field-description">
      Facturación mensual
    </p>
    Incluye seis réplicas y soporte en horario hábil.
    <button
      class="sk-popover__close sk-button sk-interactive"
      popovertarget="demo-popover"
      type="button"
      popovertargetaction="hide"
    >
      Close
    </button>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/popover.css`, `@skryensya/core/patterns/anchored.css`.

## Popover.bare

**Use when**

- a floating surface and nothing more is needed: the composition brings its own semantics
- the pattern has no title or close actions that would justify Popover's chrome

**Avoid when**

- there is a title or something to close: that is Popover, which already brings that anatomy
- it is a one-line description; that is a Tooltip

Alternatives: `Popover`, `Tooltip`.

- React: `import { Popover } from "@skryensya/react/popover"`.
- HTML: a `<div>`, no JavaScript needed.

- Requires the options: `panelId`.

**Options**

| Option | Values | Default |
|---|---|---|
| `panelId` (React: `id`) | string |  |
| `placement` | "block-start" \| "block-end" \| "inline-start" \| "inline-end" | `"block-end"` |
| `bare` | boolean | `false` |
| `arrow` | boolean | `false` |
| `triggerLabel` | string |  |
| `triggerVariant` | string |  |
| `triggerTone` | string |  |
| `triggerSize` | string |  |
| `triggerAppearance` | string |  |
| `triggerIconOnly` | boolean | `false` |
| `appearance` | "plain" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `trigger` | node | yes |
| `children` | node | yes |

**Accessible name**

- An icon-only trigger shows no text, so the trigger button owns the accessible name; the glyph is decorative. Give one of: `triggerLabel`.

**Example** (canonical tree `popover/bare`; its copy is placeholder, replace it)

```tsx
import { Popover } from "@skryensya/react/popover";

export function PopoverExample() {
  return (
    <Popover id="filters-popup" bare trigger="Filtros">
      Cualquier cosa cabe aquí.
    </Popover>
  );
}
```

```html
<div class="sk-popover" data-appearance="plain" data-bare>
  <button
    class="sk-popover__trigger sk-button sk-interactive sk-anchor"
    popovertarget="filters-popup"
    type="button"
  >
    Filtros
  </button>
  <div
    class="sk-popover__positioner sk-popover__content sk-anchored"
    id="filters-popup"
    data-sk-placement="block-end"
    popover="auto"
  >
    Cualquier cosa cabe aquí.
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/popover.css`, `@skryensya/core/patterns/anchored.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-anchored-z`, `--sk-popover-bg`, `--sk-popover-border-color`, `--sk-popover-fg`, `--sk-popover-padding`, `--sk-popover-radius`, `--sk-popover-shadow`, `--sk-popover-wash`.
