import { describe, expect, it } from "vitest";
import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { emitMarkup } from "@skryensya/ai-compiler/emit";
import { buttonAxes, buttonCanvas } from "./button-canvas";

const boards = buttonAxes.appearance.values.map((appearance) => buttonCanvas(appearance, "Save", "Saving…", "/components/button"));

describe("Button canvas", () => {
  it("covers every published variant, tone and size for each appearance", () => {
    for (const board of boards) {
      expect(board.matrix.map((row) => row.variant)).toEqual(buttonAxes.variant.values);
      for (const row of board.matrix) expect(row.cells.map((cell) => cell.tone)).toEqual(buttonAxes.tone.values);
      expect(board.groups.find((group) => group.id === "size")!.items.map((item) => item.label)).toEqual(buttonAxes.size.values);
    }
  });

  it("renders only valid specimens, with native semantics for states and hosts", () => {
    for (const board of boards) {
      const trees = [
        ...board.matrix.flatMap((row) => row.cells.map((cell) => cell.tree)),
        ...board.groups.flatMap((group) => group.items.map((item) => item.tree)),
      ];
      for (const tree of trees) {
        expect(validateUsageTree(tree).problems.filter((problem) => problem.severity === "error")).toEqual([]);
      }
      const states = board.groups.find((group) => group.id === "state")!.items;
      expect(emitMarkup(states.find((item) => item.label === "disabled")!.tree)).toContain("disabled");
      expect(emitMarkup(states.find((item) => item.label === "loading")!.tree)).toContain('aria-busy="true"');
      expect(emitMarkup(states.find((item) => item.label === "pressed: false")!.tree)).toContain('aria-pressed="false"');
      const navigation = board.groups.find((group) => group.id === "host")!.items[1]!.tree;
      expect(emitMarkup(navigation)).toMatch(/^<a\s/);
      expect(emitMarkup(navigation)).not.toContain("disabled");
    }
  });
});
