import { describe, expect, it } from "vitest";
import { anchorPlacements, anchorPlacementToZag, anchoredPositioning, isAnchorPlacement } from "./anchored.js";

describe("anchored", () => {
  it("maps every logical placement to a physical one", () => {
    for (const placement of anchorPlacements) expect(anchorPlacementToZag[placement]).toBeTruthy();
  });

  it("recognises only the four placements", () => {
    expect(isAnchorPlacement("block-end")).toBe(true);
    expect(isAnchorPlacement("top")).toBe(false);
  });

  it("re-measures every frame, scrolling with the document", () => {
    expect(anchoredPositioning.strategy).toBe("absolute");
    expect(anchoredPositioning.listeners.animationFrame).toBe(true);
  });
});
