# app-bar

Category: actions. Stylesheet: `@skryensya/core/components/app-bar.css`. Signatures: `AppBar`, `AppBarMenu`, `AppBarStatus`.

## AppBar

**Use when**

- the top edge of an application (an editor, a tool, a dashboard) needs its menus in one short line of text, the way a desktop OS draws its menu bar
- the application also has a few words of state to keep in view (saved, a width, a zoom level, a clock) and some of them open a small menu

**Avoid when**

- the screen is narrow or the pointer is a finger (mobile): its 24px targets, switch-by-pointing and single clipped line assume a desktop with a mouse or trackpad; show a Navbar with a Menu, or one button opening a Menu, there instead
- it is a website's header with destinations; that is a Navbar
- the menus sit among other controls on a page and should read as buttons; that is a Menubar
- the actions are icons for the current selection; that is a Toolbar
- there is a single menu of commands behind one button; that is a Menu

Alternatives: `Menubar`, `Navbar`, `Toolbar`, `Menu`.

- React: `import { AppBar } from "@skryensya/react/app-bar"`.
- HTML: a `<div>` with `data-sk-app-bar`, enhanced by Vanilla's mount.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `AppBarMenu` | yes |
| `status` | one of `AppBarStatus` |  |

**Example** (canonical tree `app-bar/desktop`; its copy is placeholder, replace it)

```tsx
import { AppBar, AppBarMenu, AppBarStatus } from "@skryensya/react/app-bar";
import { items, items2, items3 } from "./app-bar-data";

export function AppBarExample() {
  return (
    <AppBar
      label="Maker"
      status={
        <>
          <AppBarStatus>Guardado</AppBarStatus>
          <AppBarStatus items={items}>72rem</AppBarStatus>
        </>
      }
    >
      <AppBarMenu strong items={items2}>Maker</AppBarMenu>
      <AppBarMenu items={items3}>Archivo</AppBarMenu>
      <AppBarMenu>Ayuda</AppBarMenu>
    </AppBar>
  );
}
```

`app-bar-data.ts`:

```ts
export const items = [{ value: "36", label: "36rem" }];

export const items2 = [{ value: "about", label: "Acerca de Maker" }];

export const items3 = [
  { value: "new", label: "Nuevo" },
  { value: "export", label: "Exportar" },
];
```

```html
<div class="sk-app-bar" data-sk-app-bar>
  <div class="sk-app-bar__menus" aria-label="Maker" role="menubar">
    <div
      class="sk-app-bar__menu sk-menu"
      data-sk-menu
      data-strong
      data-density="compact"
    >
      <button
        class="sk-app-bar__trigger sk-interactive sk-anchor"
        type="button"
        role="menuitem"
        data-sk-menu-trigger
        data-sk-app-bar-trigger
        data-sk-app-bar-menu
      >
        Maker
        <span class="sk-app-bar__indicator" aria-hidden="true">
          <span data-sk-icon="chevron-down" data-sk-icon-size="sm"></span>
        </span></button>
      <div
        class="sk-app-bar__dropdown sk-menu__positioner sk-anchored"
        data-sk-menu-positioner
        data-density="compact"
      >
        <div class="sk-menu__content" data-sk-menu-content>
          <div
            class="sk-menu__item sk-interactive"
            data-sk-menu-item
            data-value="about"
          >
            <span class="sk-menu__item-label">Acerca de Maker</span>
          </div>
        </div>
      </div>
    </div>
    <div
      class="sk-app-bar__menu sk-menu"
      data-sk-menu
      data-density="compact"
    >
      <button
        class="sk-app-bar__trigger sk-interactive sk-anchor"
        type="button"
        role="menuitem"
        data-sk-menu-trigger
        data-sk-app-bar-trigger
        data-sk-app-bar-menu
      >
        Archivo
        <span class="sk-app-bar__indicator" aria-hidden="true">
          <span data-sk-icon="chevron-down" data-sk-icon-size="sm"></span>
        </span></button>
      <div
        class="sk-app-bar__dropdown sk-menu__positioner sk-anchored"
        data-sk-menu-positioner
        data-density="compact"
      >
        <div class="sk-menu__content" data-sk-menu-content>
          <div
            class="sk-menu__item sk-interactive"
            data-sk-menu-item
            data-value="new"
          >
            <span class="sk-menu__item-label">Nuevo</span>
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
    <div
      class="sk-app-bar__menu sk-menu"
      data-sk-menu
      data-density="compact"
    >
      <button
        class="sk-app-bar__trigger sk-interactive sk-anchor"
        type="button"
        role="menuitem"
        data-sk-menu-trigger
        data-sk-app-bar-trigger
        data-sk-app-bar-menu
      >
        Ayuda</button>
    </div>
  </div>
  <div class="sk-app-bar__status">
    <div
      class="sk-app-bar__status-item sk-menu"
      data-sk-menu
      data-density="compact"
    >
      <span class="sk-app-bar__status-text" role="status">Guardado</span>
    </div>
    <div
      class="sk-app-bar__status-item sk-menu"
      data-sk-menu
      data-density="compact"
    >
      <button
        class="sk-app-bar__trigger sk-interactive sk-anchor"
        type="button"
        data-sk-menu-trigger
        data-sk-app-bar-trigger
      >
        72rem
        <span class="sk-app-bar__indicator" aria-hidden="true">
          <span data-sk-icon="chevron-down" data-sk-icon-size="sm"></span>
        </span></button>
      <div
        class="sk-app-bar__dropdown sk-menu__positioner sk-anchored"
        data-sk-menu-positioner
        data-density="compact"
      >
        <div class="sk-menu__content" data-sk-menu-content>
          <div
            class="sk-menu__item sk-interactive"
            data-sk-menu-item
            data-value="36"
          >
            <span class="sk-menu__item-label">36rem</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/app-bar.css`, `@skryensya/core/components/menu.css`, `@skryensya/core/patterns/anchored.css`.

## AppBarMenu

**Use when**

- one menu of the bar. With `items` (actions only: commands, links, disabled commands and submenus two or three levels deep) it opens a dropdown; without, it is a command that acts at once
- `strong` for the application's own menu, the first one, drawn in bold

**Avoid when**

- the menu would toggle or choose something (a checkbox, a radio set, a view setting); the bar holds actions only, so that belongs in the application's own panel or inspector

- React: `import { AppBarMenu } from "@skryensya/react/app-bar"`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `AppBar`.

**Options**

| Option | Values | Default |
|---|---|---|
| `strong` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |
| `items` | a list of items (below) |  |

Each item in `items`, keyed by `value`: `value` (string), `disabled` (boolean), `tone` ("danger"), `href` (string), `label` (text), `children` (items).

## AppBarStatus

**Use when**

- a few words of state on the trailing side of the bar; plain text stays text, not a control
- with `items`, the words become a menu button, the way a desktop status item opens its own small menu

**Avoid when**

- it is a command the person runs; put it in one of the bar's menus

- React: `import { AppBarStatus } from "@skryensya/react/app-bar"`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `AppBar`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |
| `items` | a list of items (below) |  |

Each item in `items`, keyed by `value`: `value` (string), `disabled` (boolean), `tone` ("danger"), `href` (string), `label` (text), `children` (items).

## Styling hooks

Override on the root, never by restyling its classes: `--sk-anchored-z`, `--sk-app-bar-bg`, `--sk-app-bar-block-size`, `--sk-app-bar-border-color`, `--sk-app-bar-dropdown-padding-block`, `--sk-app-bar-fg`, `--sk-app-bar-font-size`, `--sk-app-bar-gap`, `--sk-app-bar-item-open-bg`, `--sk-app-bar-item-open-fg`, `--sk-app-bar-item-open-indicator`, `--sk-app-bar-menu-item-block-size`, `--sk-app-bar-menu-item-padding-block`, `--sk-app-bar-item-padding-inline`, `--sk-app-bar-item-radius`, `--sk-app-bar-muted-fg`.
