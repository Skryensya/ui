# callout

Category: feedback. Stylesheet: `@skryensya/core/components/callout.css`. Signatures: `Callout`.

## Callout

**Use when**

- something that happened has to be told: an error, a confirmation, a warning, or just a side note
- the message stays on the page, it does not go away on its own

**Avoid when**

- the message is ephemeral and goes away on its own; that is a Toast
- the region is empty for lack of data; that is an EmptyState

Alternatives: `Toast`, `EmptyState`.

- React: `import { Callout } from "@skryensya/react/callout"`.
- HTML: a `<div>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `tone` | "neutral" \| "info" \| "success" \| "warning" \| "danger" | `"neutral"` |
| `appearance` | "plain" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `icon` | one of `Icon` |  |
| `title` | text |  |
| `children` | node | yes |
| `actions` | one of `Button.action`, `Button.navigation`, `Link` |  |

**Example** (canonical tree `callout/brutalist`; its copy is placeholder, replace it)

```tsx
import { Callout } from "@skryensya/react/callout";

export function CalloutExample() {
  return (
    <Callout
      appearance="brutalist"
      tone="info"
      title="Mantenimiento programado"
    >
      El servicio estará en pausa el domingo a las 02:00.
    </Callout>
  );
}
```

```html
<div
  class="sk-callout"
  data-appearance="brutalist"
  data-tone="info"
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  <div class="sk-callout__content">
    <p class="sk-callout__title">Mantenimiento programado</p>
    <div class="sk-callout__description">
      El servicio estará en pausa el domingo a las
      02:00.
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/callout.css`, `@skryensya/core/components/callout.brutalist.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-callout-accent`, `--sk-callout-bg`, `--sk-callout-content-gap`, `--sk-callout-fg`, `--sk-callout-padding`.
