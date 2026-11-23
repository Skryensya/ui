# nav-list

Category: navigation. Stylesheet: `@skryensya/core/patterns/nav-list.css`. Signatures: `NavList`, `NavListGroup`, `NavListLink`.

## NavList

**Use when**

- the list of destinations of a sidebar, a navbar or a drawer
- a page's main or secondary navigation

**Avoid when**

- they are an application's actions, not destinations: that is a menu, with role="menu"
- it is a hierarchical path to the current page: that is a Breadcrumb
- it is an index of the current page's headings: that is a Toc
- the bar has dropdowns of commands or sub-destinations with menuitem: that is Menubar

Alternatives: `Menu`, `Breadcrumb`, `Toc`, `Menubar`.

- React: `import { NavList } from "@skryensya/react/nav-list"`.
- HTML: a `<nav>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `orientation` | "vertical" \| "horizontal" | `"vertical"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `NavListGroup` | yes |

**Accessible name**

- A page with a second nav needs each landmark named; the platform's own rule, not this system's. Give one of: `aria-label`, `aria-labelledby`.

**Example** (canonical tree `nav-list/collapsible`; its copy is placeholder, replace it)

```tsx
import { NavList, NavListGroup, NavListLink } from "@skryensya/react/nav-list";

export function NavListExample() {
  return (
    <NavList aria-label="Principal">
      <NavListGroup collapsible label="Espacio">
        <NavListLink href="/">Inicio</NavListLink>
      </NavListGroup>
    </NavList>
  );
}
```

```html
<nav
  class="sk-nav-list"
  data-orientation="vertical"
  aria-label="Principal"
>
  <div class="sk-nav-list__group" data-collapsible>
    <button
      class="sk-nav-list__group-label sk-interactive"
      data-sk-nav-list-group-trigger
      type="button"
      aria-expanded="true"
    >
      Espacio
    </button>
    <ul class="sk-nav-list__list" data-sk-nav-list-group-list role="list">
      <li class="sk-nav-list__item">
        <a class="sk-nav-list__link sk-interactive" href="/">
          <span class="sk-nav-list__label">Inicio</span>
        </a>
      </li>
    </ul>
  </div>
</nav>
```

Stylesheets: `@skryensya/core/patterns/nav-list.css`.

## NavListGroup

**Use when**

- it groups destinations under a label
- the <ul> is needed even when the group has no visible label
- with collapsible: the section can be hidden/shown. The WAI 'Disclosure (Navigation)' pattern

**Avoid when**

- there is a single destination and no label: the group is still required, it is not optional
- collapsible without label: the button needs the label's text to have something to show
- heading without label: an empty heading is worse than none
- collapsible and heading together: collapsible is already a button; heading does not apply

- React: `import { NavListGroup } from "@skryensya/react/nav-list"`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `NavList`, `NavListLink`, `MegamenuTrigger`.

**Options**

| Option | Values | Default |
|---|---|---|
| `collapsible` | boolean | `false` |
| `defaultOpen` | boolean |  |
| `heading` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `NavListLink` | yes |
| `label` | node |  |

## NavListLink

**Use when**

- one destination of the list
- it marks the current page with current
- it has sub-destinations of its own: a NavListGroup in the nested slot, inside the same <li>

**Avoid when**

- it triggers an action instead of navigating: that is Button.action

Alternatives: `Button.navigation`.

- React: `import { NavListLink } from "@skryensya/react/nav-list"`.
- HTML: a `<a>`, no JavaScript needed.

- Goes inside: `NavListGroup`.
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
| `icon` | node |  |
| `nested` | one of `NavListGroup` |  |
| `trailing` | node |  |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-nav-list-category-chevron-fg`, `--sk-nav-list-category-current-fg`, `--sk-nav-list-category-fg`, `--sk-nav-list-category-font-size`, `--sk-nav-list-category-font-weight`, `--sk-nav-list-duration`, `--sk-nav-list-easing`, `--sk-nav-list-gap`, `--sk-nav-list-group-gap`, `--sk-nav-list-group-label-fg`, `--sk-nav-list-group-label-font-size`, `--sk-nav-list-group-label-font-weight`, `--sk-nav-list-group-label-min-height`, `--sk-nav-list-group-label-opacity`, `--sk-nav-list-group-label-padding-block-end`, `--sk-nav-list-group-label-padding-block-start`, `--sk-nav-list-group-label-padding-x`, `--sk-nav-list-guide-color`, `--sk-nav-list-guide-inset`, `--sk-nav-list-item-gap`, `--sk-nav-list-label-opacity`, `--sk-nav-list-link-bg`, `--sk-nav-list-link-current-bg`, `--sk-nav-list-link-current-emphasis`, `--sk-nav-list-link-current-fg`, `--sk-nav-list-link-disabled-fg`, `--sk-nav-list-link-fg`, `--sk-nav-list-link-font-size`, `--sk-nav-list-link-font-weight`, `--sk-nav-list-link-gap`, `--sk-nav-list-link-height`, `--sk-nav-list-link-padding-x`, `--sk-nav-list-link-radius`, `--sk-nav-list-nested-indent`, `--sk-nav-list-trailing-fg`.
