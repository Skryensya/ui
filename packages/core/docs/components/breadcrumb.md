# breadcrumb

Category: navigation. Stylesheet: `@skryensya/core/components/breadcrumb.css`. Signatures: `Breadcrumb`.

## Breadcrumb

**Use when**

- the page lives inside a hierarchy and the user needs to go back up it

**Avoid when**

- the navigation is flat; that is a NavList
- they are steps of a process; that is Steps

Alternatives: `NavList`, `Steps`.

- React: `import { Breadcrumb } from "@skryensya/react/breadcrumb"`.
- HTML: a `<nav>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string | `"Breadcrumb"` |
| `collapsedLabel` | string | `"Show hidden levels"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `separator` | node |  |
| `items` | a list of items (below) | yes |

Each item in `items`: `href` (string), `current` (boolean), `label` (text, required).

**Example** (canonical tree `breadcrumb/trail`; its copy is placeholder, replace it)

```tsx
import { Breadcrumb } from "@skryensya/react/breadcrumb";
import { items } from "./breadcrumb-items";

export function BreadcrumbExample() {
  return <Breadcrumb items={items} />;
}
```

`breadcrumb-items.ts`:

```ts
export const items = [
  { href: "/", label: "Inicio" },
  { href: "/proyectos", label: "Proyectos" },
  { current: true, label: "Atlas" },
];
```

```html
<nav
  class="sk-breadcrumb"
  aria-label="Breadcrumb"
  data-collapsed-label="Show hidden levels"
  data-sk-breadcrumb
>
  <ol class="sk-breadcrumb__list" role="list">
    <li class="sk-breadcrumb__item">
      <a class="sk-breadcrumb__link" href="/" title="Inicio">Inicio</a>
      <span class="sk-breadcrumb__separator" aria-hidden="true">/</span>
    </li>
    <li class="sk-breadcrumb__item">
      <a class="sk-breadcrumb__link" href="/proyectos" title="Proyectos">
        Proyectos
      </a>
      <span class="sk-breadcrumb__separator" aria-hidden="true">/</span>
    </li>
    <li class="sk-breadcrumb__item">
      <span class="sk-breadcrumb__current" aria-current="page">Atlas</span>
    </li>
  </ol>
</nav>
```

Stylesheets: `@skryensya/core/components/breadcrumb.css`, `@skryensya/core/components/menu.css`, `@skryensya/core/patterns/anchored.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-anchored-z`, `--sk-breadcrumb-current-color`, `--sk-breadcrumb-current-weight`, `--sk-breadcrumb-gap`, `--sk-breadcrumb-link-color`, `--sk-breadcrumb-link-max`, `--sk-breadcrumb-separator-color`, `--sk-menu-bg`, `--sk-menu-border-color`, `--sk-menu-fg`, `--sk-menu-item-gap`, `--sk-menu-item-min-height`, `--sk-menu-max-block-size`, `--sk-menu-radius`, `--sk-menu-separator-color`, `--sk-menu-separator-margin`, `--sk-menu-shadow`, `--sk-menu-wash`.
