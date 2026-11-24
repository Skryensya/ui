# treegrid

Category: data. Stylesheet: `@skryensya/core/components/treegrid.css`. Signatures: `Treegrid`, `TreegridBody`, `TreegridCell`, `TreegridColumnHeader`, `TreegridHead`, `TreegridHeadRow`, `TreegridRow`, `TreegridScroll`.

## Treegrid

**Use when**

- the data has hierarchy AND columns at once. A file explorer with size/date, an org chart with role/department
- each row needs to expand or collapse without losing the rest of its columns

**Avoid when**

- there are columns but no hierarchy; that is a Table
- there is hierarchy but a single text column; that is a TreeView

Alternatives: `Table`, `TreeView`.

- React: `import { Treegrid } from "@skryensya/react/treegrid"`.
- HTML: a `<table>` with `data-sk-treegrid`, enhanced by Vanilla's mount.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string |  |
| `resizableColumns` | boolean | `false` |
| `resizeLabel` | string |  |
| `columnWeights` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `TreegridHead`, `TreegridBody` | yes |

**Accessible name**

- Each column resizer is a real, focusable role="separator" a binding inserts: never authored, so nothing else names it for a screen reader; the column header it sits beside says WHICH column, not that the control resizes it. Give one of: `resizeLabel`.

## TreegridBody

**Use when**

- always: it is where the grid's rows live, and the grid is not complete without it

- React: `import { TreegridBody } from "@skryensya/react/treegrid"`.
- HTML: a `<tbody>`, no JavaScript needed.

- Goes inside: `Treegrid`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `TreegridRow` | yes |

## TreegridCell

**Use when**

- a value inside a row of the grid

**Avoid when**

- the content needs its own interactive control (a button, a link); this version of the contract is faithful to the WAI `treegrid-1` example. Text-only cells, see docs/aria-apg-audit.md

- React: `import { TreegridCell } from "@skryensya/react/treegrid"`.
- HTML: a `<td>`, no JavaScript needed.

- Goes inside: `TreegridRow`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |

## TreegridColumnHeader

**Use when**

- the cell names its column

- React: `import { TreegridColumnHeader } from "@skryensya/react/treegrid"`.
- HTML: a `<th>`, no JavaScript needed.

- Goes inside: `TreegridHeadRow`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## TreegridHead

**Use when**

- the columns have headers, which is almost always

- React: `import { TreegridHead } from "@skryensya/react/treegrid"`.
- HTML: a `<thead>`, no JavaScript needed.

- Goes inside: `Treegrid`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `TreegridHeadRow` | yes |

## TreegridHeadRow

**Use when**

- whenever there is a TreegridHead: it is the row holding the TreegridColumnHeaders

- React: `import { TreegridHeadRow } from "@skryensya/react/treegrid"`.
- HTML: a `<tr>`, no JavaScript needed.

- Goes inside: `TreegridHead`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `TreegridColumnHeader` | yes |

## TreegridRow

**Use when**

- one record of the grid, in the same order a screen reader walks it: never nested inside another TreegridRow, a <tr> cannot contain another <tr>
- the row has descendants: pass `expanded` (true or false) and write them right after, in order, with a higher `level`
- every row carries a `value` unique in the grid: it is what the expand and activate events report

**Avoid when**

- the row is a leaf with no children; there `expanded` is not passed at all. Its absence is what marks it a leaf, not a `false` value

- React: `import { TreegridRow } from "@skryensya/react/treegrid"`.
- HTML: a `<tr>` with `data-sk-treegrid-row`, enhanced by Vanilla's mount.

- Goes inside: `TreegridBody`.
- Requires the options: `level`, `setSize`, `posInset`, `value`.

**Options**

| Option | Values | Default |
|---|---|---|
| `level` | number |  |
| `setSize` | number |  |
| `posInset` | number |  |
| `expanded` | boolean |  |
| `value` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `TreegridCell` | yes |

## TreegridScroll

**Use when**

- almost always: the same reason as TableScroll. The grid must not break a flex or a grid by being wider than its space

Alternatives: `Treegrid`.

- React: `import { TreegridScroll } from "@skryensya/react/treegrid"`.
- HTML: a `<div>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `Treegrid` | yes |

**Example** (canonical tree `treegrid/file-explorer`; its copy is placeholder, replace it)

```tsx
import {
  Treegrid,
  TreegridBody,
  TreegridCell,
  TreegridColumnHeader,
  TreegridHead,
  TreegridHeadRow,
  TreegridRow,
  TreegridScroll,
} from "@skryensya/react/treegrid";

export function TreegridScrollExample() {
  return (
    <TreegridScroll>
      <Treegrid label="Archivos">
        <TreegridHead>
          <TreegridHeadRow>
            <TreegridColumnHeader>Nombre</TreegridColumnHeader>
            <TreegridColumnHeader>Tamaño</TreegridColumnHeader>
          </TreegridHeadRow>
        </TreegridHead>
        <TreegridBody>
          <TreegridRow
            level={1}
            setSize={2}
            posInset={1}
            expanded
            value="documentos"
          >
            <TreegridCell>Documentos</TreegridCell>
            <TreegridCell>N/A</TreegridCell>
          </TreegridRow>
          <TreegridRow
            level={2}
            setSize={1}
            posInset={1}
            value="documentos/informe"
          >
            <TreegridCell>informe.pdf</TreegridCell>
            <TreegridCell>2.1 MB</TreegridCell>
          </TreegridRow>
          <TreegridRow level={1} setSize={2} posInset={2} value="fotos">
            <TreegridCell>Fotos</TreegridCell>
            <TreegridCell>N/A</TreegridCell>
          </TreegridRow>
        </TreegridBody>
      </Treegrid>
    </TreegridScroll>
  );
}
```

```html
<div class="sk-treegrid-scroll sk-table-scroll">
  <table
    class="sk-treegrid sk-table"
    data-sk-treegrid
    aria-label="Archivos"
    role="treegrid"
  >
    <thead class="sk-treegrid__head sk-table__head">
      <tr class="sk-treegrid__head-row sk-table__row">
        <th
          class="sk-treegrid__column-header sk-table__header"
          scope="col"
        >
          Nombre
        </th>
        <th
          class="sk-treegrid__column-header sk-table__header"
          scope="col"
        >
          Tamaño
        </th>
      </tr>
    </thead>
    <tbody class="sk-treegrid__body sk-table__body">
      <tr
        class="sk-treegrid__row sk-table__row"
        data-sk-treegrid-row
        aria-level="1"
        aria-setsize="2"
        aria-posinset="1"
        aria-expanded="true"
        data-value="documentos"
        role="row"
        tabindex="-1"
      >
        <td
          class="sk-treegrid__cell sk-table__cell sk-interactive"
          role="gridcell"
          tabindex="-1"
        >
          Documentos
        </td>
        <td
          class="sk-treegrid__cell sk-table__cell sk-interactive"
          role="gridcell"
          tabindex="-1"
        >
          N/A
        </td>
      </tr>
      <tr
        class="sk-treegrid__row sk-table__row"
        data-sk-treegrid-row
        aria-level="2"
        aria-setsize="1"
        aria-posinset="1"
        data-value="documentos/informe"
        role="row"
        tabindex="-1"
      >
        <td
          class="sk-treegrid__cell sk-table__cell sk-interactive"
          role="gridcell"
          tabindex="-1"
        >
          informe.pdf
        </td>
        <td
          class="sk-treegrid__cell sk-table__cell sk-interactive"
          role="gridcell"
          tabindex="-1"
        >
          2.1 MB
        </td>
      </tr>
      <tr
        class="sk-treegrid__row sk-table__row"
        data-sk-treegrid-row
        aria-level="1"
        aria-setsize="2"
        aria-posinset="2"
        aria-expanded="false"
        data-value="fotos"
        role="row"
        tabindex="-1"
      >
        <td
          class="sk-treegrid__cell sk-table__cell sk-interactive"
          role="gridcell"
          tabindex="-1"
        >
          Fotos
        </td>
        <td
          class="sk-treegrid__cell sk-table__cell sk-interactive"
          role="gridcell"
          tabindex="-1"
        >
          N/A
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

Stylesheets: `@skryensya/core/components/table.css`, `@skryensya/core/components/treegrid.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:treegridactivate` | `onActivate` | { value: string } |
| `sk:treegridexpandedchange` | `onExpandedChange` | { expanded: boolean, value: string } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-treegrid-glyph-size`, `--sk-treegrid-guide-color`, `--sk-treegrid-indent`, `--sk-treegrid-indicator-size`.
