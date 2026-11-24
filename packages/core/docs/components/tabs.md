# tabs

Category: navigation. Stylesheet: `@skryensya/core/components/tabs.css`. Signatures: `Tabs`.

## Tabs

**Use when**

- several sections share one region and only one is seen at a time
- the content is siblings, not a hierarchy: every tab is at the same level
- the user switches between views of the same object (summary, activity, settings)
- the list always carries a name (aria-label, or aria-labelledby pointing at a visible title)

**Avoid when**

- each section's content is long and the user would want to see it all together: that is an Accordion or a page with sections
- each tab navigates to another URL: that is a NavList
- there is a single section; a lone tab is not a choice

Alternatives: `NavList`.

- React: `import { Tabs } from "@skryensya/react/tabs"`.
- HTML: a `<div>` with `data-sk-tabs`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `orientation` | "horizontal" \| "vertical" | `"horizontal"` |
| `activationMode` | "automatic" \| "manual" | `"automatic"` |
| `value` (React: `defaultValue`) | string |  |
| `size` | "sm" \| "md" | `"md"` |
| `variant` | "underline" \| "hanging" | `"underline"` |
| `listPlacement` | "before" \| "after" | `"before"` |
| `wrap` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `items` | a list of items (below) | yes |

Each item in `items`, keyed by `value`: `value` (string), `disabled` (boolean), `label` (node, required), `children` (node).

**Accessible name**

- The tab list is a named region; a page with two of them needs to tell them apart. Give one of: `aria-label`, `aria-labelledby`.

**Example** (canonical tree `tabs/two-panels`; its copy is placeholder, replace it)

```tsx
import { Tabs } from "@skryensya/react/tabs";
import { items } from "./tabs-items";

export function TabsExample() {
  return <Tabs defaultValue="summary" aria-label="Proyecto" items={items} />;
}
```

`tabs-items.ts`:

```ts
export const items = [
  {
    value: "summary",
    label: "Resumen",
    children: "Atlas está listo para el lanzamiento de julio.",
  },
  {
    value: "activity",
    label: "Actividad",
    children: "Tres cambios aprobados esta semana.",
  },
];
```

```html
<div
  class="sk-tabs"
  data-sk-tabs
  data-orientation="horizontal"
  data-activation-mode="automatic"
  data-value="summary"
  data-size="md"
  data-variant="underline"
  data-list-placement="before"
>
  <div class="sk-tabs__list" data-sk-tabs-list aria-label="Proyecto">
    <button
      class="sk-tabs__trigger sk-interactive"
      data-value="summary"
      data-sk-tabs-trigger
      type="button"
    >
      Resumen
    </button>
    <button
      class="sk-tabs__trigger sk-interactive"
      data-value="activity"
      data-sk-tabs-trigger
      type="button"
    >
      Actividad
    </button>
  </div>
  <div
    class="sk-tabs__content"
    data-sk-tabs-initial
    data-value="summary"
    data-sk-tabs-content
  >
    Atlas está listo para el lanzamiento de julio.
  </div>
  <div class="sk-tabs__content" data-value="activity" data-sk-tabs-content>
    Tres cambios aprobados esta semana.
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/tabs.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:tabsvaluechange` | `onValueChange` | { value: string } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-tabs-gap`, `--sk-tabs-indicator-bg`, `--sk-tabs-indicator-size`, `--sk-tabs-list-border-color`, `--sk-tabs-list-border-width`, `--sk-tabs-list-gap`, `--sk-tabs-panel-fg`, `--sk-tabs-panel-padding-block`, `--sk-tabs-trigger-border-color`, `--sk-tabs-trigger-border-width`, `--sk-tabs-trigger-disabled-fg`, `--sk-tabs-trigger-fg`, `--sk-tabs-trigger-font-size`, `--sk-tabs-trigger-gap`, `--sk-tabs-trigger-height`, `--sk-tabs-trigger-padding-x`, `--sk-tabs-trigger-radius`, `--sk-tabs-trigger-selected-bg`, `--sk-tabs-trigger-selected-border-color`, `--sk-tabs-trigger-selected-fg`.
