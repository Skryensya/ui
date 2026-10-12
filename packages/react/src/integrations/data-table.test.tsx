import {
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { fireEvent, render, screen, within } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { DataTable, DataTablePagination, selectColumn } from "./data-table.js";

type Person = { name: string; age: number };

const people: Person[] = [
  { name: "Bea", age: 31 },
  { name: "Ada", age: 36 },
  { name: "Cy", age: 29 },
  { name: "Dee", age: 44 },
  { name: "Eli", age: 22 },
];

const plain = tableFeatures({});
const rich = tableFeatures({
  rowSortingFeature,
  rowSelectionFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns,
});

const columns: ColumnDef<typeof rich, Person>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "age", header: "Age" },
];


/* Columns are defined once, outside the component: TanStack needs them stable, a new array each render
 * remounts every header and cell. `selectColumn()` follows the same rule. */
const selectable = [selectColumn<typeof rich, Person>(), ...columns];
const localised = [selectColumn<typeof rich, Person>({ all: "Seleccionar todo", row: "Seleccionar fila" }), ...columns];

function Plain({ data = people, empty }: { data?: Person[]; empty?: string }) {
  const table = useTable({ features: plain, columns: columns as never, data });
  return <DataTable caption="People" empty={empty} table={table} />;
}

function Rich({ pageSize = 2, withSelect = false }: { pageSize?: number; withSelect?: boolean }) {
  const table = useTable({
    features: rich,
    columns: withSelect ? selectable : columns,
    data: people,
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });
  return (
    <>
      <DataTable caption="People" table={table} />
      <DataTablePagination table={table} />
    </>
  );
}

describe("DataTable, a plain table", () => {
  it("draws the headers and the cells of the instance, named by its caption", () => {
    render(<Plain />);
    expect(screen.getByRole("table", { name: "People" })).toBeTruthy();
    expect(screen.getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Name", "Age"]);
    expect(screen.getAllByRole("row")).toHaveLength(1 + people.length);
  });

  it("renders no sort control for a table that registered no sorting", () => {
    render(<Plain />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    for (const header of screen.getAllByRole("columnheader")) expect(header.getAttribute("aria-sort")).toBeNull();
  });

  it("says so in one full-width cell when there are no rows", () => {
    render(<Plain data={[]} empty="Nobody yet." />);
    const cell = screen.getByRole("cell", { name: "Nobody yet." });
    expect(cell.getAttribute("colspan")).toBe("2");
  });
});

describe("DataTable, sorting", () => {
  it("marks each sortable header with aria-sort and starts unsorted", () => {
    render(<Rich pageSize={10} />);
    for (const header of screen.getAllByRole("columnheader")) expect(header.getAttribute("aria-sort")).toBe("none");
  });

  it("sorts ascending, then descending, and says which through aria-sort", () => {
    render(<Rich pageSize={10} />);
    const nameHeader = screen.getByRole("columnheader", { name: /Name/ });

    fireEvent.click(within(nameHeader).getByRole("button"));
    expect(nameHeader.getAttribute("aria-sort")).toBe("ascending");
    expect(screen.getAllByRole("row").slice(1).map((r) => within(r).getAllByRole("cell")[0]?.textContent)).toEqual(["Ada", "Bea", "Cy", "Dee", "Eli"]);

    fireEvent.click(within(nameHeader).getByRole("button"));
    expect(nameHeader.getAttribute("aria-sort")).toBe("descending");
    expect(screen.getAllByRole("row").slice(1).map((r) => within(r).getAllByRole("cell")[0]?.textContent)).toEqual(["Eli", "Dee", "Cy", "Bea", "Ada"]);
  });
});

describe("DataTable, selection", () => {
  it("gives the header and every row a named checkbox", () => {
    render(<Rich pageSize={10} withSelect />);
    expect(screen.getByRole("checkbox", { name: "Select all rows on this page" })).toBeTruthy();
    expect(screen.getAllByRole("checkbox", { name: "Select row" })).toHaveLength(people.length);
  });

  it("selects a row, reads the page as indeterminate, and selects the page from the header", () => {
    render(<Rich pageSize={10} withSelect />);
    const all = screen.getByRole("checkbox", { name: "Select all rows on this page" }) as HTMLInputElement;
    const rows = screen.getAllByRole("checkbox", { name: "Select row" }) as HTMLInputElement[];

    fireEvent.click(rows[0]!);
    expect(rows[0]!.checked).toBe(true);
    expect(all.indeterminate).toBe(true);

    fireEvent.click(all);
    expect(rows.every((r) => (screen.getAllByRole("checkbox", { name: "Select row" }) as HTMLInputElement[]).every((c) => c.checked))).toBe(true);
    expect(all.checked).toBe(true);
    expect(document.querySelectorAll("tr[data-selected]")).toHaveLength(people.length);
  });

  it("limits the header checkbox to the page, not to every row", () => {
    render(<Rich pageSize={2} withSelect />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows on this page" }));
    expect(document.querySelectorAll("tr[data-selected]")).toHaveLength(2);
  });

  it("takes the labels from the caller", () => {
    function Spanish() {
      const table = useTable({ features: rich, columns: localised, data: people });
      return <DataTable table={table} />;
    }
    render(<Spanish />);
    expect(screen.getByRole("checkbox", { name: "Seleccionar todo" })).toBeTruthy();
    expect(screen.getAllByRole("checkbox", { name: "Seleccionar fila" })).toHaveLength(people.length);
  });
});

describe("DataTablePagination", () => {
  it("shows the rows of the current page and moves to the next", () => {
    render(<Rich pageSize={2} />);
    expect(screen.getAllByRole("row")).toHaveLength(1 + 2);

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByRole("button", { name: "2" }).getAttribute("aria-current")).toBe("page");
    expect(within(screen.getAllByRole("row")[1]!).getAllByRole("cell")[0]?.textContent).toBe("Cy");
  });

  it("renders nothing when everything fits on one page", () => {
    render(<Rich pageSize={10} />);
    expect(screen.queryByRole("navigation")).toBeNull();
  });
});

describe("DataTable, accessibility", () => {
  it("has no axe violations with sorting, selection and pagination", async () => {
    const ui = render(<Rich pageSize={3} withSelect />);
    const results = await axe.run(ui.container);
    expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.html}`)).toEqual([]);
  });
});
