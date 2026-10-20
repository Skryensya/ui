import { describe, expect, it } from "vitest";
import { contractSourceUrl } from "./contract-source";
import { contractDoc, summarizeRelease } from "./contract-reference";

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

describe("summarizeRelease", () => {
  const entry = (kind: string, title: string) => ({ date: "2026-10-02", kind, es: { title, body: "x" }, en: { title, body: "x" } }) as never;

  it("counts arrivals apart from changes to what already existed", () => {
    const summary = summarizeRelease({
      version: "0.0.2",
      date: "2026-10-12",
      surfaces: [
        { id: "toolbar", entries: [entry("feature", "New component")] },
        { id: "button", entries: [entry("breaking", "A"), entry("feature", "B"), entry("bugfix", "C")] },
        { id: "badge", entries: [entry("chore", "D")] },
      ],
    });
    expect(summary).toEqual({ added: ["toolbar"], breaking: ["button"], features: 1, fixes: 1, other: 2 });
  });
});
