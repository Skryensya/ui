# description-list

Category: data. Stylesheet: `@skryensya/core/components/description-list.css`. Signatures: `DescriptionList`, `DescriptionItem`.

## DescriptionList

**Use when**

- the details of ONE record are shown as name and value: a summary, metadata, specs, key facts
- each row is a complete statement on its own and nothing is compared across rows
- the names are short and repeat the same shape: Status, Placed, Total, Tracking

**Avoid when**

- the same fields are shown for SEVERAL records; a cell that means something because of its row and its column is a Table
- the pairs are form controls a person fills in; that is FormField
- it is a list of things rather than of facts about one thing; that is List

Alternatives: `Table`, `List`, `FormField`.

- React: `import { DescriptionList } from "@skryensya/react/description-list"`.
- HTML: a `<dl>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `layout` | "stacked" \| "columns" | `"stacked"` |
| `dividers` | boolean | `false` |
| `density` | "compact" |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `DescriptionItem` | yes |

**Example** (canonical tree `description-list/columns`; its copy is placeholder, replace it)

```tsx
import {
  DescriptionItem,
  DescriptionList,
} from "@skryensya/react/description-list";

export function DescriptionListExample() {
  return (
    <DescriptionList layout="columns" dividers>
      <DescriptionItem term="Pedido">#4821</DescriptionItem>
      <DescriptionItem term="Fecha">10 de marzo de 2026</DescriptionItem>
    </DescriptionList>
  );
}
```

```html
<dl class="sk-description-list" data-layout="columns" data-dividers>
  <div class="sk-description-list__group">
    <dt class="sk-description-list__term">Pedido</dt>
    <dd class="sk-description-list__details">#4821</dd>
  </div>
  <div class="sk-description-list__group">
    <dt class="sk-description-list__term">Fecha</dt>
    <dd class="sk-description-list__details">10 de marzo de 2026</dd>
  </div>
</dl>
```

Stylesheets: `@skryensya/core/components/description-list.css`.

## DescriptionItem

**Use when**

- one name and its value; the name is text, the value takes markup (a Tag, a link, a date)

**Avoid when**

- the name needs markup of its own; a name that is a heading means this should be a section

Alternatives: `Table`.

- React: `import { DescriptionItem } from "@skryensya/react/description-list"`.
- HTML: a `<div>`, no JavaScript needed.

- Goes inside: `DescriptionList`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `term` | text | yes |
| `children` | node | yes |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-description-list-details-fg`, `--sk-description-list-divider-color`, `--sk-description-list-pair-gap`, `--sk-description-list-row-gap`, `--sk-description-list-row-padding-y`, `--sk-description-list-term-fg`, `--sk-description-list-term-font-size`, `--sk-description-list-term-font-weight`, `--sk-description-list-term-size`.
