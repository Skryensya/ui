import { describe, expect, it } from "vitest";
import { windowContract } from "./window.js";

// Frame appearances describe a movable surface, not a pressable slab. The trigger is still Button.
describe("Window appearance contract", () => {
  it("publishes plain, brutalist and frosted, without tactile or its ledge hook", () => {
    expect(windowContract.options.appearance.values).toEqual(["plain", "brutalist", "frosted"]);
    expect(windowContract.options.appearance.default).toBe("plain");
    expect(windowContract.hooks).not.toContain("--sk-window-depth");
  });

  it("keeps the trigger's appearance sourced from Button", () => {
    expect(windowContract.options.triggerAppearance.valuesFrom).toEqual({
      contract: "button",
      option: "appearance",
    });
  });
});
