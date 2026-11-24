# menu

Category: actions. Stylesheet: `@skryensya/core/components/menu.css`. Signatures: `Menu`.

## Menu

**Use when**

- a set of commands acting on something, behind a trigger
- the actions are too many to show them all, or they are secondary
- a submenu: the same list, nested without limit

**Avoid when**

- it is choosing a value inside a form; that is Select
- the content is a description and not a list of actions; that is Tooltip or Popover
- the bar is application commands (File/Edit/View); that is Menubar
- site navigation with a multi-column panel; that is Megamenu

Alternatives: `Select`, `Popover`, `Menubar`, `Megamenu`.

- React: `import { Menu } from "@skryensya/react/menu"`.
- HTML: a `<div>` with `data-sk-menu`, enhanced by Vanilla's mount.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string |  |
| `triggerLabel` | string |  |
| `triggerVariant` | string |  |
| `triggerTone` | string |  |
| `triggerSize` | string |  |
| `triggerAppearance` | string |  |
| `triggerIconOnly` | boolean | `false` |
| `disabled` | boolean | `false` |
| `density` | "compact" |  |
| `debugSafetyTriangle` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `trigger` | node |  |
| `items` (React: `items`) | a list of items (below) | yes |

Each item in `items`, keyed by `value`: `value` (string), `disabled` (boolean), `kind` ("checkbox" \| "radio" \| "separator"), `group` (string), `tone` ("danger"), `href` (string), `label` (text), `children` (items).

**Accessible name**

- An icon-only trigger shows no text, so the trigger button owns the accessible name; the chevron is decorative. Give one of: `triggerLabel`.

**Example** (canonical tree `menu/trigger-brutalist`; its copy is placeholder, replace it)

```tsx
import { Menu } from "@skryensya/react/menu";
import { items } from "./menu-items";

export function MenuExample() {
  return (
    <Menu
      label="Acciones"
      triggerAppearance="brutalist"
      trigger="Acciones"
      items={items}
    />
  );
}
```

`menu-items.ts`:

```ts
export const items = [
  { value: "edit", label: "Editar" },
  { value: "copy", label: "Copiar" },
];
```

```html
<div class="sk-menu" data-sk-menu aria-label="Acciones">
  <button
    class="sk-menu__trigger sk-button sk-interactive sk-anchor"
    data-sk-menu-trigger
    data-appearance="brutalist"
    type="button"
  >
    Acciones
    <span aria-hidden="true">
      <span data-sk-icon="chevron-down" data-sk-icon-size="md"></span>
    </span></button>
  <div class="sk-menu__positioner sk-anchored" data-sk-menu-positioner>
    <div class="sk-menu__content" data-sk-menu-content>
      <div
        class="sk-menu__item sk-interactive"
        data-sk-menu-item
        data-value="edit"
      >
        <span class="sk-menu__item-label">Editar</span>
      </div>
      <div
        class="sk-menu__item sk-interactive"
        data-sk-menu-item
        data-value="copy"
      >
        <span class="sk-menu__item-label">Copiar</span>
      </div>
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/button.brutalist.css`, `@skryensya/core/components/menu.css`, `@skryensya/core/patterns/anchored.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:menuopenchange` | `onOpenChange` | { open: boolean } |
| `sk:menucheckedchange` | `onCheckedChange` | { value: string, checked: boolean } |
| `sk:menuselect` | `onSelect` | { value: string } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-anchored-z`, `--sk-menu-bg`, `--sk-menu-border-color`, `--sk-menu-fg`, `--sk-menu-item-gap`, `--sk-menu-item-min-height`, `--sk-menu-max-block-size`, `--sk-menu-radius`, `--sk-menu-separator-color`, `--sk-menu-separator-margin`, `--sk-menu-shadow`, `--sk-menu-wash`.
