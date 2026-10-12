import type { ColumnDef, ReactTable, RowData, TableFeatures } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { Button } from "../components/button.js";
import { Icon } from "../components/icon.js";
import { Pagination, type PaginationProps } from "../components/pagination.js";
import { Checkbox } from "../components/selection.js";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
  type TableProps,
} from "../components/table.js";

/*
 * TANSTACK TABLE, drawn with this system's Table. A headless table owns the STATE (sorting, selection,
 * the page) and none of the markup; `Table` owns the markup and none of the state. This file is the
 * seam between them and nothing else: it never sorts, selects or pages anything itself, it reads what
 * the table instance already decided and says it in this system's parts.
 *
 * Only TYPES come from `@tanstack/react-table`, so this module loads no TanStack code of its own: the
 * instance the app built is the only copy, and `table.FlexRender` renders its cells.
 *
 * TanStack Table v9 registers features explicitly (`features: tableFeatures({ rowSortingFeature })`),
 * and a method of an unregistered feature does not exist on the column or the row. Every
 * feature-dependent read below is therefore a "does it exist" check, which is also what lets one
 * `DataTable` serve a plain table, a sortable one and a selectable one without a flag for each.
 */

/** The slice of a column this file reads when the sorting feature is registered. */
type SortableColumn = {
  getCanSort?: () => boolean;
  getIsSorted?: () => false | "asc" | "desc";
  getToggleSortingHandler?: () => undefined | ((event: unknown) => void);
};

/** The slice of a row this file reads: selection and column visibility are features, so both are optional. */
type FeatureRow<TCell> = {
  getIsSelected?: () => boolean;
  getVisibleCells?: () => TCell[];
  getAllCells: () => TCell[];
};

/** The slice of the table this file reads when the column-visibility feature is registered. */
type VisibleColumns = {
  getVisibleLeafColumns?: () => unknown[];
  getAllLeafColumns: () => unknown[];
};

const ariaSort = { asc: "ascending", desc: "descending" } as const;

export type DataTableProps<TFeatures extends TableFeatures, TData extends RowData> = Omit<TableProps, "children"> & {
  /** The instance from `useTable`. Everything about the data lives there. */
  table: ReactTable<TFeatures, TData>;
  /** The table's accessible name, drawn as its caption. */
  caption?: ReactNode;
  /** What a table with no rows says, in one full-width cell. Omitted, an empty body stays empty. */
  empty?: ReactNode;
  /** Keeps the header in view while the body scrolls. */
  stickyHeader?: boolean;
  /** Keeps the first column in view while the body scrolls sideways. */
  stickyColumn?: boolean;
};

export function DataTable<TFeatures extends TableFeatures, TData extends RowData>({
  caption,
  empty,
  stickyColumn,
  stickyHeader,
  table,
  ...props
}: DataTableProps<TFeatures, TData>) {
  const rows = table.getRowModel().rows;
  const columns = table as unknown as VisibleColumns;
  const columnCount = (columns.getVisibleLeafColumns?.() ?? columns.getAllLeafColumns()).length;

  return (
    <TableScroll stickyColumn={stickyColumn} stickyHeader={stickyHeader}>
      <Table {...props}>
        {caption ? <TableCaption>{caption}</TableCaption> : null}
        <TableHead>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => {
                const column = header.column as unknown as SortableColumn;
                const sortable = column.getCanSort?.() === true;
                const sorted = column.getIsSorted?.() || false;
                const label = header.isPlaceholder ? null : <table.FlexRender header={header} />;
                return (
                  <TableHeader
                    aria-sort={sortable ? (sorted ? ariaSort[sorted] : "none") : undefined}
                    colSpan={header.colSpan}
                    key={header.id}
                  >
                    {sortable ? (
                      <Button
                        onClick={column.getToggleSortingHandler?.() as (() => void) | undefined}
                        post={sorted ? <Icon name={sorted === "asc" ? "chevron-up" : "chevron-down"} size="sm" /> : undefined}
                        size="sm"
                        variant="ghost"
                      >
                        {label}
                      </Button>
                    ) : (
                      label
                    )}
                  </TableHeader>
                );
              })}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {rows.length === 0 && empty ? (
            <TableRow>
              <TableCell colSpan={columnCount}>{empty}</TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const featured = row as unknown as FeatureRow<(typeof row.getAllCells extends () => (infer C)[] ? C : never)>;
              const cells = featured.getVisibleCells?.() ?? featured.getAllCells();
              return (
                <TableRow data-selected={featured.getIsSelected?.() ? "" : undefined} key={row.id}>
                  {cells.map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableScroll>
  );
}

export type SelectColumnLabels = {
  /** The header checkbox's name. Default "Select all rows on this page". */
  all?: string;
  /** Each row checkbox's name. Default "Select row". */
  row?: string;
};

/**
 * A column of checkboxes for the row-selection feature: the header one selects the page, each row's
 * selects that row, and a partly selected page reads as indeterminate. Put it first in `columns`.
 * The names default to English; pass yours, they are the only text the column owns.
 */
export function selectColumn<TFeatures extends TableFeatures, TData extends RowData>(
  labels: SelectColumnLabels = {},
): ColumnDef<TFeatures, TData> {
  const { all = "Select all rows on this page", row: rowLabel = "Select row" } = labels;
  return {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }: { table: unknown }) => {
      const t = table as unknown as {
        getIsAllPageRowsSelected: () => boolean;
        getIsSomePageRowsSelected: () => boolean;
        toggleAllPageRowsSelected: (value?: boolean) => void;
      };
      return (
        <Checkbox
          aria-label={all}
          checked={t.getIsAllPageRowsSelected() ? true : t.getIsSomePageRowsSelected() ? "indeterminate" : false}
          onCheckedChange={({ checked }) => t.toggleAllPageRowsSelected(checked === true)}
        />
      );
    },
    cell: ({ row }: { row: unknown }) => {
      const r = row as unknown as {
        getIsSelected: () => boolean;
        getCanSelect: () => boolean;
        toggleSelected: (value?: boolean) => void;
      };
      return (
        <Checkbox
          aria-label={rowLabel}
          checked={r.getIsSelected()}
          disabled={!r.getCanSelect()}
          onCheckedChange={({ checked }) => r.toggleSelected(checked === true)}
        />
      );
    },
  } as unknown as ColumnDef<TFeatures, TData>;
}

export type DataTablePaginationProps<TFeatures extends TableFeatures, TData extends RowData> = Omit<
  PaginationProps,
  "page" | "total" | "onPageChange"
> & {
  table: ReactTable<TFeatures, TData>;
};

/**
 * The page control for a table that registered the pagination feature: numbered pages driven by the
 * table's own page index, so the instance, not this component, decides which rows exist. (The
 * `TablePager` pattern pages the rows already in the DOM, which is the other model: use it for a
 * table that renders everything.) Renders nothing when there is a single page.
 */
export function DataTablePagination<TFeatures extends TableFeatures, TData extends RowData>({
  table,
  ...props
}: DataTablePaginationProps<TFeatures, TData>) {
  const t = table as unknown as {
    state: { pagination: { pageIndex: number } };
    getPageCount: () => number;
    setPageIndex: (index: number) => void;
  };
  const total = t.getPageCount();
  if (total <= 1) return null;
  return <Pagination {...props} onPageChange={(page) => t.setPageIndex(page - 1)} page={t.state.pagination.pageIndex + 1} total={total} />;
}
