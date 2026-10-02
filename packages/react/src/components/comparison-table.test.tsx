import { render } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { ComparisonCell, ComparisonColumn, ComparisonRow, ComparisonTable } from "./comparison-table.js";

const Fixture = (props: { density?: "compact"; caption?: string }) => (
  <ComparisonTable
    aspectLabel="Aspect"
    caption={props.caption}
    columns={
      <>
        <ComparisonColumn>Basic</ComparisonColumn>
        <ComparisonColumn>Full</ComparisonColumn>
      </>
    }
    density={props.density}
  >
    <ComparisonRow label="Users">
      <ComparisonCell>Up to 3</ComparisonCell>
      <ComparisonCell>Unlimited</ComparisonCell>
    </ComparisonRow>
    <ComparisonRow label="Support">
      <ComparisonCell>Email</ComparisonCell>
      <ComparisonCell>Email and chat</ComparisonCell>
    </ComparisonRow>
  </ComparisonTable>
);

describe("ComparisonTable (React)", () => {
  it("is a table whose columns and rows are headers with a scope", () => {
    const ui = render(<Fixture />);
    const columns = ui.getAllByRole("columnheader");
    expect(columns.map((c) => c.getAttribute("scope"))).toEqual(["col", "col", "col"]);
    const rows = ui.getAllByRole("rowheader");
    expect(rows.map((r) => r.textContent)).toEqual(["Users", "Support"]);
    expect(rows.every((r) => r.getAttribute("scope") === "row")).toBe(true);
  });

  it("never leaves the corner cell empty: it holds the aspect label, drawn visually hidden", () => {
    const ui = render(<Fixture />);
    const corner = ui.container.querySelector(".sk-comparison-table__corner")!;
    expect(corner.textContent).toBe("Aspect");
    expect(corner.querySelector(".sk-comparison-table__corner-label")).not.toBeNull();
  });

  it("puts a cell under each column, in order, and writes density and caption only when given", () => {
    const plain = render(<Fixture />);
    expect(plain.container.querySelector("table")!.hasAttribute("data-density")).toBe(false);
    expect(plain.container.querySelector("caption")).toBeNull();
    const rich = render(<Fixture caption="Plans" density="compact" />);
    expect(rich.container.querySelector("table")!.getAttribute("data-density")).toBe("compact");
    expect(rich.container.querySelector("caption")!.textContent).toBe("Plans");
    const firstRow = plain.container.querySelector("tbody tr")!;
    expect([...firstRow.children].map((c) => c.textContent)).toEqual(["Users", "Up to 3", "Unlimited"]);
  });

  it("has no accessibility violations", async () => {
    const ui = render(<Fixture caption="Plans" />);
    const results = await axe.run(ui.container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
