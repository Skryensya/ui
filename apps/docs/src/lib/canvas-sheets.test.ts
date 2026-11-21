import { describe, expect, it } from "vitest";
import { canvasBlocks } from "./canvas-fragment";
import { componentsCanvas } from "./components-canvas";
import { canvasSheets } from "./canvas-sheets";

const sheetsOf = (id: string) => canvasSheets(canvasBlocks(componentsCanvas().filter((c) => c.id === id)));

describe("canvas sheets", () => {
  it("lists a component's own sheets, appearances included, and not the kit's other components", () => {
    const button = sheetsOf("button");
    expect(button).toContain("@skryensya/core/components/button.css");
    expect(button).toContain("@skryensya/core/components/button.brutalist.css");
    expect(button).not.toContain("@skryensya/core/components/calendar.css");
    expect(button.length).toBeLessThan(25);
  });

  it("brings the sheets of what a component composes", () => {
    expect(sheetsOf("image-frame")).toContain("@skryensya/core/patterns/image-frame.css");
  });
});
