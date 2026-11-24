# list

Category: data. Stylesheet: `@skryensya/core/components/list.css`. Signatures: `List`, `OrderedList`, `ListItemPlain`, `ListItem`, `ListItemLink`, `ListItemButton`.

## List

**Use when**

- rows of things of the same kind: an inbox, settings, results

**Avoid when**

- the rows have columns comparable with each other; that is a Table
- they are navigation destinations of the site or the page; that is NavList
- they are instructions to read and follow, in order; that is Procedure

Alternatives: `Table`, `NavList`, `Procedure`.

- React: `import { List } from "@skryensya/react/list"`.
- HTML: a `<ul>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `density` | "compact" |  |
| `dividers` | boolean | `true` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `ListItemPlain`, `ListItem`, `ListItemLink`, `ListItemButton` | yes |

**Example** (canonical tree `list/rows`; its copy is placeholder, replace it)

```tsx
import { List, ListItem, ListItemLink } from "@skryensya/react/list";

export function ListExample() {
  return (
    <List>
      <ListItem title="Cuenta" description="john.doe@ejemplo.cl" />
      <ListItemLink href="/ajustes" title="Ajustes" trailing="→" />
    </List>
  );
}
```

```html
<ul class="sk-list" role="list">
  <li class="sk-list__item">
    <span class="sk-list__content">
      <span class="sk-list__title">Cuenta</span>
      <span class="sk-list__description">john.doe@ejemplo.cl</span>
    </span>
  </li>
  <li class="sk-list__item">
    <a class="sk-list__action sk-interactive" href="/ajustes">
      <span class="sk-list__content">
        <span class="sk-list__title">Ajustes</span>
      </span>
      <span class="sk-list__trailing">→</span>
    </a>
  </li>
</ul>
```

Stylesheets: `@skryensya/core/components/list.css`.

## OrderedList

**Use when**

- the order of the rows communicates sequence, priority or ranking

**Avoid when**

- reordering the rows does not change their meaning; that is List
- they are steps of a process with a rich body per item; that is Procedure

Alternatives: `List`, `Procedure`.

- React: `import { OrderedList } from "@skryensya/react/list"`.
- HTML: a `<ol>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `density` | "compact" |  |
| `dividers` | boolean | `true` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `ListItemPlain`, `ListItem`, `ListItemLink`, `ListItemButton` | yes |

**Example** (canonical tree `list/ordered`; its copy is placeholder, replace it)

```tsx
import { ListItemPlain, OrderedList } from "@skryensya/react/list";

export function OrderedListExample() {
  return (
    <OrderedList>
      <ListItemPlain>Primero, crear la rama.</ListItemPlain>
      <ListItemPlain>Segundo, abrir el PR.</ListItemPlain>
    </OrderedList>
  );
}
```

```html
<ol class="sk-list" role="list">
  <li class="sk-list__item">Primero, crear la rama.</li>
  <li class="sk-list__item">Segundo, abrir el PR.</li>
</ol>
```

Stylesheets: `@skryensya/core/components/list.css`.

## ListItemPlain

**Use when**

- an interface row only needs direct content, with no title, description or trailing anatomy

- React: `import { ListItemPlain } from "@skryensya/react/list"`.
- HTML: a `<li>`, no JavaScript needed.

- Goes inside: `List`, `OrderedList`.

**Options**

| Option | Values | Default |
|---|---|---|
| `disabled` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## ListItem

**Use when**

- a row that is not interactive

- React: `import { ListItem } from "@skryensya/react/list"`.
- HTML: a `<li>`, no JavaScript needed.

- Goes inside: `List`, `OrderedList`.

**Options**

| Option | Values | Default |
|---|---|---|
| `disabled` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `leading` | one of `Icon`, `Avatar.initials` |  |
| `title` | text | yes |
| `description` | text |  |
| `trailing` | node |  |

## ListItemLink

**Use when**

- the whole row navigates, and the row is the focus and click target

**Avoid when**

- only part of the row is a link; there the link goes inside, not wrapping
- the row triggers an action without changing URL; that is ListItemButton

Alternatives: `ListItemButton`.

- React: `import { ListItemLink } from "@skryensya/react/list"`.
- HTML: a `<a>`, no JavaScript needed.

- Goes inside: `List`, `OrderedList`.
- Requires the options: `href`.

**Options**

| Option | Values | Default |
|---|---|---|
| `href` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `leading` | one of `Icon`, `Avatar.initials` |  |
| `title` | text | yes |
| `description` | text |  |
| `trailing` | node |  |

## ListItemButton

**Use when**

- the whole row triggers an action (send, sign out, open a dialog), and the row is the focus and click target

**Avoid when**

- the row navigates to another URL; that is ListItemLink
- only a control inside the row is the button; there the button goes inside, not wrapping

Alternatives: `ListItemLink`.

- React: `import { ListItemButton } from "@skryensya/react/list"`.
- HTML: a `<button>`, no JavaScript needed.

- Goes inside: `List`, `OrderedList`.

**Options**

| Option | Values | Default |
|---|---|---|
| `disabled` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `leading` | one of `Icon`, `Avatar.initials` |  |
| `title` | text | yes |
| `description` | text |  |
| `trailing` | node |  |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-list-description-fg`, `--sk-list-description-font-size`, `--sk-list-disabled-fg`, `--sk-list-divider-color`, `--sk-list-fg`, `--sk-list-leading-fg`, `--sk-list-row-gap`, `--sk-list-row-min-height`, `--sk-list-row-padding-x`, `--sk-list-row-padding-y`, `--sk-list-row-radius`, `--sk-list-title-fg`, `--sk-list-title-font-size`, `--sk-list-title-font-weight`, `--sk-list-trailing-fg`.
