# comparison-table

Category: data. Stylesheet: `@skryensya/core/components/comparison-table.css`. Signatures: `ComparisonCell`, `ComparisonColumn`, `ComparisonRow`, `ComparisonTable`, `ComparisonTableScroll`.

## ComparisonCell

**Use when**

- how one thing answers one aspect: a short phrase, with code or a link

**Avoid when**

- the answer needs a paragraph or a control; that is a Table, or prose beside the comparison

Alternatives: `Table`.

- React: `import { ComparisonCell } from "@skryensya/react/comparison-table"`.
- HTML: a `<td>`, no JavaScript needed.

- Goes inside: `ComparisonRow`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## ComparisonColumn

**Use when**

- the name of one of the things compared, at the top of its column

**Avoid when**

- a grouped or spanning header; that is a Table's TableHeader

Alternatives: `Table`.

- React: `import { ComparisonColumn } from "@skryensya/react/comparison-table"`.
- HTML: a `<th>`, no JavaScript needed.

- Goes inside: `ComparisonTable`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## ComparisonRow

**Use when**

- one aspect the things are compared on, named once on the left and answered in each column

**Avoid when**

- the row needs a spanning cell; that is a Table

Alternatives: `Table`.

- React: `import { ComparisonRow } from "@skryensya/react/comparison-table"`.
- HTML: a `<tr>`, no JavaScript needed.

- Goes inside: `ComparisonTable`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `ComparisonCell` | yes |
| `label` | text | yes |

## ComparisonTable

**Use when**

- two to four things are set side by side on the same few aspects: two components, three plans, an old and a new behaviour
- the reader has to decide between them, and the answer is in how the columns differ row by row
- every cell is short: a phrase, a bit of code, a link

**Avoid when**

- there are more than four things, or the cells are long; that is a catalogue and it is a Table
- the rows are facts about ONE thing and nothing is compared across them; that is DescriptionList
- the data is sorted, filtered, paged or summed; that is a Table or a DataGrid

Alternatives: `Table`, `DescriptionList`, `DataGrid`.

- React: `import { ComparisonTable } from "@skryensya/react/comparison-table"`.
- HTML: a `<table>`, no JavaScript needed.

- Requires the options: `aspectLabel`.

**Options**

| Option | Values | Default |
|---|---|---|
| `aspectLabel` | string |  |
| `density` | "compact" |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `caption` | text |  |
| `children` | one of `ComparisonRow` | yes |
| `columns` | one of `ComparisonColumn` | yes |

**Example** (canonical tree `comparison-table/two-columns`; its copy is placeholder, replace it)

```tsx
import {
  ComparisonCell,
  ComparisonColumn,
  ComparisonRow,
  ComparisonTable,
} from "@skryensya/react/comparison-table";

export function ComparisonTableExample() {
  return (
    <ComparisonTable
      aspectLabel="Aspecto"
      columns={
        <>
          <ComparisonColumn>Plan básico</ComparisonColumn>
          <ComparisonColumn>Plan completo</ComparisonColumn>
        </>
      }
    >
      <ComparisonRow label="Usuarios">
        <ComparisonCell>Hasta 3</ComparisonCell>
        <ComparisonCell>Sin límite</ComparisonCell>
      </ComparisonRow>
      <ComparisonRow label="Soporte">
        <ComparisonCell>Por correo</ComparisonCell>
        <ComparisonCell>Por correo y chat</ComparisonCell>
      </ComparisonRow>
    </ComparisonTable>
  );
}
```

```html
<table class="sk-comparison-table">
  <thead>
    <tr>
      <th class="sk-comparison-table__corner" scope="col">
        <span class="sk-comparison-table__corner-label">Aspecto</span>
      </th>
      <th class="sk-comparison-table__column" scope="col">Plan básico</th>
      <th class="sk-comparison-table__column" scope="col">
        Plan completo
      </th>
    </tr>
  </thead>
  <tbody>
    <tr class="sk-comparison-table__row">
      <th class="sk-comparison-table__row-header" scope="row">Usuarios</th>
      <td class="sk-comparison-table__cell">Hasta 3</td>
      <td class="sk-comparison-table__cell">Sin límite</td>
    </tr>
    <tr class="sk-comparison-table__row">
      <th class="sk-comparison-table__row-header" scope="row">Soporte</th>
      <td class="sk-comparison-table__cell">Por correo</td>
      <td class="sk-comparison-table__cell">Por correo y chat</td>
    </tr>
  </tbody>
</table>
```

Stylesheets: `@skryensya/core/components/comparison-table.css`.

## ComparisonTableScroll

**Use when**

- almost always: a comparison inside a flex or a grid pushes the column out and breaks the surface, and this is the box that shrinks in its place
- the comparison is wider than its space and has to scroll sideways

**Avoid when**

- the comparison is narrow and its container has a fixed width; there the wrapper adds nothing

Alternatives: `ComparisonTable`.

- React: `import { ComparisonTableScroll } from "@skryensya/react/comparison-table"`.
- HTML: a `<div>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `ComparisonTable` | yes |

**Example** (canonical tree `comparison-table/scroll`; its copy is placeholder, replace it)

```tsx
import {
  ComparisonCell,
  ComparisonColumn,
  ComparisonRow,
  ComparisonTable,
  ComparisonTableScroll,
} from "@skryensya/react/comparison-table";

export function ComparisonTableScrollExample() {
  return (
    <ComparisonTableScroll>
      <ComparisonTable
        aspectLabel="Aspecto"
        columns={
          <>
            <ComparisonColumn>Plan básico</ComparisonColumn>
            <ComparisonColumn>Plan completo</ComparisonColumn>
          </>
        }
      >
        <ComparisonRow label="Usuarios">
          <ComparisonCell>Hasta 3</ComparisonCell>
          <ComparisonCell>Sin límite</ComparisonCell>
        </ComparisonRow>
      </ComparisonTable>
    </ComparisonTableScroll>
  );
}
```

```html
<div class="sk-comparison-table-scroll">
  <table class="sk-comparison-table">
    <thead>
      <tr>
        <th class="sk-comparison-table__corner" scope="col">
          <span class="sk-comparison-table__corner-label">Aspecto</span>
        </th>
        <th class="sk-comparison-table__column" scope="col">
          Plan básico
        </th>
        <th class="sk-comparison-table__column" scope="col">
          Plan completo
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="sk-comparison-table__row">
        <th class="sk-comparison-table__row-header" scope="row">
          Usuarios
        </th>
        <td class="sk-comparison-table__cell">Hasta 3</td>
        <td class="sk-comparison-table__cell">Sin límite</td>
      </tr>
    </tbody>
  </table>
</div>
```

Stylesheets: `@skryensya/core/components/comparison-table.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-comparison-table-border-color`, `--sk-comparison-table-cell-padding-block`, `--sk-comparison-table-cell-padding-inline`, `--sk-comparison-table-column-fg`, `--sk-comparison-table-font-size`, `--sk-comparison-table-row-header-fg`, `--sk-comparison-table-row-header-size`.
