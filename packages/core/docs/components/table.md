# table

Category: data. Stylesheet: `@skryensya/core/components/table.css`. Signatures: `Table`, `TableBody`, `TableCaption`, `TableCell`, `TableFooter`, `TableHead`, `TableHeader`, `TableRow`, `TableScroll`.

## Table

**Use when**

- the data has rows and columns, and a cell means something by where they cross
- it carries a name: a TableCaption, or aria-labelledby pointing at a visible title
- the user is going to compare values across rows

**Avoid when**

- it is a list of things with no columns; that is a List
- it is used for layout; a table announces relationships the layout does not have

Alternatives: `DataGrid`, `List`, `DescriptionList`.

- React: `import { Table } from "@skryensya/react/table"`.
- HTML: a `<table>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `resizableColumns` | boolean | `false` |
| `resizeLabel` | string |  |
| `columnWeights` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `TableCaption`, `TableHead`, `TableBody`, `TableFooter` | yes |

**Accessible name**

- A table with no name is announced as "table" and nothing else; a reader cannot tell two apart. Give one of: `TableCaption`, `aria-label`, `aria-labelledby`.
- Each column resizer is a real, focusable role="separator" a binding inserts: never authored, so nothing else names it for a screen reader; the column header it sits beside says WHICH column, not that the control resizes it. Give one of: `resizeLabel`.

**Example** (canonical tree `table/resizable`; its copy is placeholder, replace it)

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@skryensya/react/table";

export function TableExample() {
  return (
    <Table
      resizableColumns
      resizeLabel="Redimensionar columna"
      aria-label="Planes"
    >
      <TableHead>
        <TableRow>
          <TableHeader>Plan</TableHeader>
          <TableHeader>Precio</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Base</TableCell>
          <TableCell>0</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

```html
<table
  class="sk-table"
  data-resizable-columns
  data-resize-label="Redimensionar columna"
  aria-label="Planes"
>
  <thead class="sk-table__head">
    <tr class="sk-table__row">
      <th class="sk-table__header" scope="col">Plan</th>
      <th class="sk-table__header" scope="col">Precio</th>
    </tr>
  </thead>
  <tbody class="sk-table__body">
    <tr class="sk-table__row">
      <td class="sk-table__cell">Base</td>
      <td class="sk-table__cell">0</td>
    </tr>
  </tbody>
</table>
```

Stylesheets: `@skryensya/core/components/table.css`.

## TableBody

**Use when**

- always: it is where the data rows live, and the table is not complete without it

- React: `import { TableBody } from "@skryensya/react/table"`.
- HTML: a `<tbody>`, no JavaScript needed.

- Goes inside: `Table`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `TableRow` | yes |

## TableCaption

**Use when**

- the table needs a name a screen reader announces before the content

**Avoid when**

- the title is already outside and associated through aria-labelledby

- React: `import { TableCaption } from "@skryensya/react/table"`.
- HTML: a `<caption>`, no JavaScript needed.

- Goes inside: `Table`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## TableCell

**Use when**

- a value inside a row

- React: `import { TableCell } from "@skryensya/react/table"`.
- HTML: a `<td>`, no JavaScript needed.

- Goes inside: `TableRow`.

**Options**

| Option | Values | Default |
|---|---|---|
| `colspan` (React: `colSpan`) | number |  |
| `rowspan` (React: `rowSpan`) | number |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## TableFooter

**Use when**

- there are totals or a summary at the foot of the columns

**Avoid when**

- it is one more data row; that goes in the body

- React: `import { TableFooter } from "@skryensya/react/table"`.
- HTML: a `<tfoot>`, no JavaScript needed.

- Goes inside: `Table`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `TableRow` | yes |

## TableHead

**Use when**

- the columns have headers, which is almost always

- React: `import { TableHead } from "@skryensya/react/table"`.
- HTML: a `<thead>`, no JavaScript needed.

- Goes inside: `Table`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `TableRow` | yes |

## TableHeader

**Use when**

- the cell names its column, or names its row with scope row
- a header groups several columns (colspan) or several header rows (rowspan)

**Avoid when**

- it is a value; that is TableCell

- React: `import { TableHeader } from "@skryensya/react/table"`.
- HTML: a `<th>`, no JavaScript needed.

- Goes inside: `TableRow`.

**Options**

| Option | Values | Default |
|---|---|---|
| `scope` | "col" \| "row" | `"col"` |
| `colspan` (React: `colSpan`) | number |  |
| `rowspan` (React: `rowSpan`) | number |  |
| `sortable` | boolean | `false` |
| `sortDirection` | "ascending" \| "descending" \| "none" |  |
| `sortLabel` | string |  |
| `visuallyHidden` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## TableRow

**Use when**

- one record of the table

- React: `import { TableRow } from "@skryensya/react/table"`.
- HTML: a `<tr>`, no JavaScript needed.

- Goes inside: `TableHead`, `TableBody`, `TableFooter`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `TableHeader`, `TableCell` | yes |

## TableScroll

**Use when**

- almost always: a table inside a flex or a grid pushes the column out and breaks the surface, and this is the box that shrinks in its place
- the table is wider than its space and has to scroll sideways
- the first column or the header should stay fixed while the rest scrolls

**Avoid when**

- the table is narrow and its container has a fixed width; there the wrapper adds nothing

Alternatives: `Table`.

- React: `import { TableScroll } from "@skryensya/react/table"`.
- HTML: a `<div>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `stickyColumn` | boolean | `false` |
| `stickyHeader` | boolean | `false` |
| `density` | number |  |
| `densityFactor` | number |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `Table` | yes |

**Example** (canonical tree `table/with-a-footer`; its copy is placeholder, replace it)

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "@skryensya/react/table";

export function TableScrollExample() {
  return (
    <TableScroll>
      <Table>
        <TableCaption>Gastos de julio</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeader>Concepto</TableHeader>
            <TableHeader>Monto</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Servidores</TableCell>
            <TableCell>$120</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Dominios</TableCell>
            <TableCell>$30</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>$150</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableScroll>
  );
}
```

```html
<div class="sk-table-scroll">
  <table class="sk-table">
    <caption class="sk-table__caption">Gastos de julio</caption>
    <thead class="sk-table__head">
      <tr class="sk-table__row">
        <th class="sk-table__header" scope="col">Concepto</th>
        <th class="sk-table__header" scope="col">Monto</th>
      </tr>
    </thead>
    <tbody class="sk-table__body">
      <tr class="sk-table__row">
        <td class="sk-table__cell">Servidores</td>
        <td class="sk-table__cell">$120</td>
      </tr>
      <tr class="sk-table__row">
        <td class="sk-table__cell">Dominios</td>
        <td class="sk-table__cell">$30</td>
      </tr>
    </tbody>
    <tfoot class="sk-table__foot">
      <tr class="sk-table__row">
        <td class="sk-table__cell">Total</td>
        <td class="sk-table__cell">$150</td>
      </tr>
    </tfoot>
  </table>
</div>
```

Stylesheets: `@skryensya/core/components/table.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:tablesortchange` | `onSortChange` |  |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-table-bg`, `--sk-table-border-color`, `--sk-table-caption-fg`, `--sk-table-caption-gap`, `--sk-table-cell-min-inline-size`, `--sk-table-cell-padding-x`, `--sk-table-cell-padding-y`, `--sk-table-container-border-color`, `--sk-table-container-border-width`, `--sk-table-container-radius`, `--sk-table-fg`, `--sk-table-fixed-min-inline-size`, `--sk-table-font-size`, `--sk-table-footer-bg`, `--sk-table-footer-fg`, `--sk-table-header-bg`, `--sk-table-header-border-color`, `--sk-table-header-fg`, `--sk-table-header-font-weight`, `--sk-table-inner-radius`, `--sk-table-row-alt-bg`, `--sk-table-row-header-min-inline-size`, `--sk-table-sticky-shadow-color`.
