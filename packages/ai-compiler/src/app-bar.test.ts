import { describe, expect, it } from "vitest";
import type { ItemInput, UsageTree } from "@skryensya/core/usage-tree";
import { validateUsageTree } from "./validate.js";

/*
 * AppBar at the compiler's boundary: its dropdowns hold actions only. What Menu allows and the bar
 * does not (a checkbox, a radio set, a separator) is refused here, not quietly rendered.
 */

const bar = (items: readonly ItemInput[], signature: "AppBarMenu" | "AppBarStatus" = "AppBarMenu"): UsageTree => ({
  contract: "app-bar",
  signature: "AppBar",
  options: { label: "Maker" },
  children: [{ contract: "app-bar", signature: "AppBarMenu", slots: { children: "Archivo", ...(signature === "AppBarMenu" ? { items } : {}) } }],
  ...(signature === "AppBarStatus"
    ? { slots: { status: [{ contract: "app-bar", signature: "AppBarStatus", slots: { children: "72rem", items } }] } }
    : {}),
});

const action = (value: string, label: string, extra: Record<string, string | boolean> = {}): ItemInput => ({ options: { value, ...extra }, slots: { label } });

describe("app-bar: actions only", () => {
  it("accepts commands, links, disabled commands and submenus three levels deep", () => {
    const tree = bar([
      action("new", "Nuevo"),
      action("docs", "Documentación", { href: "/docs" }),
      action("undo", "Deshacer", { disabled: true }),
      { options: { value: "export" }, slots: { label: "Exportar", children: [{ options: { value: "react" }, slots: { label: "React", children: [action("tsx", "TSX")] } }] } },
    ]);
    expect(validateUsageTree(tree).problems).toEqual([]);
  });

  for (const kind of ["checkbox", "radio", "separator"]) {
    for (const signature of ["AppBarMenu", "AppBarStatus"] as const) {
      it(`refuses a ${kind} in an ${signature}'s dropdown`, () => {
        const result = validateUsageTree(bar([action("x", "X", { kind })], signature));
        expect(result.valid).toBe(false);
        expect(result.problems.map((problem) => problem.message).join(" ")).toContain("kind");
      });
    }
  }

  it("refuses a radio group, even one level down", () => {
    const tree = bar([{ options: { value: "view" }, slots: { label: "Ver", children: [action("a", "A", { group: "zoom" })] } }]);
    expect(validateUsageTree(tree).valid).toBe(false);
  });
});
