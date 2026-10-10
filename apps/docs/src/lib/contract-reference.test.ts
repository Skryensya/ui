import { describe, expect, it } from "vitest";
import { contractSourceUrl } from "./contract-source";
import { contractDoc } from "./contract-reference";

describe("published Dock documentation", () => {
  it("resolves Dock and DockItem from the generated manifest", () => {
    const contract = contractDoc("dock");
    expect(contract.id).toBe("dock");
    expect(contract.signatures).toHaveProperty("Dock");
    expect(contract.signatures).toHaveProperty("DockItem");
  });
});

describe("contractSourceUrl", () => {
  it("links an independently declared contract to its Core source", () => {
    expect(contractSourceUrl("separator")).toBe(
      "https://github.com/Skryensya/ui/blob/main/packages/core/src/separator.ts",
    );
  });

  it("links contracts declared together to their shared Core module", () => {
    expect(contractSourceUrl("box")).toBe(
      "https://github.com/Skryensya/ui/blob/main/packages/core/src/layout.ts",
    );
    expect(contractSourceUrl("radio-group")).toBe(
      "https://github.com/Skryensya/ui/blob/main/packages/core/src/selection.ts",
    );
    expect(contractSourceUrl("table-pager")).toBe(
      "https://github.com/Skryensya/ui/blob/main/packages/core/src/pagination.ts",
    );
  });
});
