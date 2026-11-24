# empty-state

Category: feedback. Stylesheet: `@skryensya/core/components/empty-state.css`. Signatures: `EmptyState`.

## EmptyState

**Use when**

- a list or a region has nothing to show, and why has to be said
- it is the first time and the action that fills it should be offered

**Avoid when**

- the data is loading; that is a Loader or a Placeholder
- there was an error; there the message is a Callout, not an empty state

Alternatives: `Callout`, `Placeholder`, `Loader`.

- React: `import { EmptyState } from "@skryensya/react/empty-state"`.
- HTML: a `<section>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `headingElement` | "h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" | `"h2"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `actions` | one of `Button.action`, `Button.navigation` |  |
| `description` | node |  |
| `icon` | one of `Icon` |  |
| `title` | text | yes |

**Example** (canonical tree `empty-state/no-results`; its copy is placeholder, replace it)

```tsx
import { EmptyState } from "@skryensya/react/empty-state";
import { Icon } from "@skryensya/react/icon";

export function EmptyStateExample() {
  return (
    <EmptyState
      icon={<Icon name="search" />}
      title="No hay resultados"
      description="Prueba con otros términos."
    />
  );
}
```

```html
<section class="sk-empty-state">
  <div class="sk-empty-state__icon" aria-hidden="true">
    <span data-sk-icon="search" data-sk-icon-size="md"></span>
  </div>
  <h2 class="sk-empty-state__title">No hay resultados</h2>
  <div class="sk-empty-state__description">Prueba con otros términos.</div>
</section>
```

Stylesheets: `@skryensya/core/components/empty-state.css`, `@skryensya/core/patterns/icon.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-empty-state-actions-gap`, `--sk-empty-state-description-color`, `--sk-empty-state-fg`, `--sk-empty-state-gap`, `--sk-empty-state-icon-bg`, `--sk-empty-state-icon-fg`, `--sk-empty-state-icon-radius`, `--sk-empty-state-icon-size`, `--sk-empty-state-max-inline-size`, `--sk-empty-state-padding`, `--sk-empty-state-title-size`.
