# megamenu

Category: navigation. Stylesheet: `@skryensya/core/components/megamenu.css`. Signatures: `Megamenu`, `MegamenuTrigger`, `MegamenuLink`.

## Megamenu

**Use when**

- site/marketing navigation with categories that drop down a multi-column panel of links, edge to edge under the bar

**Avoid when**

- the dropdown is a list of application commands, not destinations; that is Menu
- the bar is application commands (File/Edit/View), some with a dropdown; that is Menubar
- they are simple destinations with no multi-column panel; that is NavList
- only the brand/actions bar is needed, with no category panel; that is Navbar

Alternatives: `Menu`, `Menubar`, `NavList`, `Navbar`.

- React: `import { Megamenu } from "@skryensya/react/megamenu"`.
- HTML: a `<nav>` with `data-sk-megamenu`, enhanced by Vanilla's mount.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `MegamenuTrigger`, `MegamenuLink` | yes |

**Example** (canonical tree `megamenu/product`; its copy is placeholder, replace it)

```tsx
import {
  Megamenu,
  MegamenuLink,
  MegamenuTrigger,
} from "@skryensya/react/megamenu";
import { NavListGroup, NavListLink } from "@skryensya/react/nav-list";

export function MegamenuExample() {
  return (
    <Megamenu label="Producto">
      <MegamenuTrigger
        containsCurrent
        columns={
          <>
            <NavListGroup heading label="Producto">
              <NavListLink href="/precios">Precios</NavListLink>
              <NavListLink href="/integraciones">Integraciones</NavListLink>
            </NavListGroup>
            <NavListGroup heading label="Recursos">
              <NavListLink href="/guias">Guías</NavListLink>
              <NavListLink href="/cambios">Cambios</NavListLink>
            </NavListGroup>
          </>
        }
      >
        Soluciones
      </MegamenuTrigger>
      <MegamenuLink href="/precios" current>Precios</MegamenuLink>
    </Megamenu>
  );
}
```

```html
<nav class="sk-megamenu sk-anchor" data-sk-megamenu aria-label="Producto">
  <ul class="sk-megamenu__list" role="list">
    <li class="sk-megamenu__item" data-contains-current>
      <button
        class="sk-megamenu__trigger sk-interactive"
        data-sk-megamenu-trigger
        type="button"
        aria-expanded="false"
        aria-current="true"
      >
        Soluciones
      </button>
      <div
        class="sk-megamenu__positioner sk-anchored sk-megamenu"
        data-sk-megamenu-positioner
      >
        <div class="sk-megamenu__content" data-sk-megamenu-content>
          <div class="sk-nav-list__group" data-heading>
            <h3 class="sk-nav-list__group-label" id="producto">
              Producto
            </h3>
            <ul
              class="sk-nav-list__list"
              role="list"
              aria-labelledby="producto"
            >
              <li class="sk-nav-list__item">
                <a
                  class="sk-nav-list__link sk-interactive"
                  href="/precios"
                >
                  <span class="sk-nav-list__label">Precios</span>
                </a>
              </li>
              <li class="sk-nav-list__item">
                <a
                  class="sk-nav-list__link sk-interactive"
                  href="/integraciones"
                >
                  <span class="sk-nav-list__label">Integraciones</span>
                </a>
              </li>
            </ul>
          </div>
          <div class="sk-nav-list__group" data-heading>
            <h3 class="sk-nav-list__group-label" id="recursos">
              Recursos
            </h3>
            <ul
              class="sk-nav-list__list"
              role="list"
              aria-labelledby="recursos"
            >
              <li class="sk-nav-list__item">
                <a class="sk-nav-list__link sk-interactive" href="/guias">
                  <span class="sk-nav-list__label">Guías</span>
                </a>
              </li>
              <li class="sk-nav-list__item">
                <a
                  class="sk-nav-list__link sk-interactive"
                  href="/cambios"
                >
                  <span class="sk-nav-list__label">Cambios</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </li>
    <li class="sk-megamenu__item">
      <a
        class="sk-megamenu__link sk-interactive"
        href="/precios"
        aria-current="page"
      >
        Precios
      </a>
    </li>
  </ul>
</nav>
```

Stylesheets: `@skryensya/core/components/megamenu.css`, `@skryensya/core/patterns/anchored.css`, `@skryensya/core/patterns/nav-list.css`.

## MegamenuTrigger

**Use when**

- one category of the bar. Its panel (`columns`) is 2-4 NavListGroups, not commands or a single link

- React: `import { MegamenuTrigger } from "@skryensya/react/megamenu"`.
- HTML: a `<li>`, no JavaScript needed.

- Goes inside: `Megamenu`.

**Options**

| Option | Values | Default |
|---|---|---|
| `containsCurrent` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |
| `columns` | one of `NavListGroup`, `ImageFrame` | yes |

## MegamenuLink

**Use when**

- a destination in the same row as the categories that has no panel of its own: a plain link wearing the category's look, with no chevron

**Avoid when**

- it has several destinations under it; that is a MegamenuTrigger

Alternatives: `MegamenuTrigger`.

- React: `import { MegamenuLink } from "@skryensya/react/megamenu"`.
- HTML: a `<a>`, no JavaScript needed.

- Goes inside: `Megamenu`.
- Requires the options: `href`.

**Options**

| Option | Values | Default |
|---|---|---|
| `href` | string |  |
| `current` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:megamenuopenchange` | `onOpenChange` | { open: boolean, index: number \| null } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-anchored-z`, `--sk-megamenu-bg`, `--sk-megamenu-border-color`, `--sk-megamenu-fg`, `--sk-megamenu-gutter`, `--sk-megamenu-radius`, `--sk-megamenu-shadow`, `--sk-megamenu-wash`.
