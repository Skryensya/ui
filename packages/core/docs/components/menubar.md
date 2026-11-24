# menubar

Category: actions. Stylesheet: `@skryensya/core/components/menubar.css`. Signatures: `Menubar`, `MenubarItem`.

## Menubar

**Use when**

- a persistent bar of application commands, some with a dropdown submenu. An editor (File/Edit/View)
- site navigation with sections that drop down sub-destinations

**Avoid when**

- it is a single button opening a menu of commands; that is Menu
- they are navigation destinations with no dropdowns or commands; that is NavList

Alternatives: `Menu`, `NavList`, `Megamenu`, `Toolbar`.

- React: `import { Menubar } from "@skryensya/react/menubar"`.
- HTML: a `<div>` with `data-sk-menubar`, enhanced by Vanilla's mount.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `MenubarItem` | yes |

**Example** (canonical tree `menubar/with-dropdown`; its copy is placeholder, replace it)

```tsx
import { Menubar, MenubarItem } from "@skryensya/react/menubar";
import { items } from "./menubar-items";

export function MenubarExample() {
  return (
    <Menubar label="Barra de comandos">
      <MenubarItem>Guardar</MenubarItem>
      <MenubarItem items={items}>Archivo</MenubarItem>
    </Menubar>
  );
}
```

`menubar-items.ts`:

```ts
export const items = [
  { value: "open", label: "Abrir" },
  { value: "export", label: "Exportar" },
];
```

```html
<div
  class="sk-menubar"
  data-sk-menubar
  aria-label="Barra de comandos"
  role="menubar"
>
  <div class="sk-menubar__item-wrapper sk-menu" data-sk-menu>
    <button
      class="sk-menubar__item sk-button sk-interactive sk-anchor"
      data-sk-menubar-item
      type="button"
      role="menuitem"
      data-sk-menu-trigger
      data-variant="ghost"
      data-size="sm"
    >
      Guardar</button>
  </div>
  <div class="sk-menubar__item-wrapper sk-menu" data-sk-menu>
    <button
      class="sk-menubar__item sk-button sk-interactive sk-anchor"
      data-sk-menubar-item
      type="button"
      role="menuitem"
      data-sk-menu-trigger
      data-variant="ghost"
      data-size="sm"
    >
      Archivo
      <span class="sk-menubar__item-indicator" aria-hidden="true">
        <span data-sk-icon="chevron-down" data-sk-icon-size="md"></span>
      </span></button>
    <div class="sk-menu__positioner sk-anchored" data-sk-menu-positioner>
      <div class="sk-menu__content" data-sk-menu-content>
        <div
          class="sk-menu__item sk-interactive"
          data-sk-menu-item
          data-value="open"
        >
          <span class="sk-menu__item-label">Abrir</span>
        </div>
        <div
          class="sk-menu__item sk-interactive"
          data-sk-menu-item
          data-value="export"
        >
          <span class="sk-menu__item-label">Exportar</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/menu.css`, `@skryensya/core/components/menubar.css`, `@skryensya/core/patterns/anchored.css`.

## MenubarItem

**Use when**

- one item of the bar. With `items` (the same shape as Menu: commands, checkbox/radio, separators, nested submenus) it is a dropdown; without `items` it is a direct command

- React: `import { MenubarItem } from "@skryensya/react/menubar"`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `Menubar`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |
| `items` | a list of items (below) |  |

Each item in `items`, keyed by `value`: `disabled` (boolean), `group` (string), `href` (string), `kind` ("checkbox" \| "radio" \| "separator"), `tone` ("danger"), `value` (string), `children` (items), `label` (text).

## Styling hooks

Override on the root, never by restyling its classes: `--sk-anchored-z`, `--sk-menubar-gap`.
