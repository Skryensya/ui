import { describe, expect, it } from "vitest";
import { nextTagSelection } from "./tag-selection";

describe("Tag filter selection", () => {
  it("keeps only the clicked Tag active in single mode, with an active Tag still toggleable off", () => {
    expect(nextTagSelection([true, false, false], 1, "single")).toEqual([false, true, false]);
    expect(nextTagSelection([false, true, false], 1, "single")).toEqual([false, false, false]);
  });

  it("toggles one Tag without changing the others in multiple mode", () => {
    expect(nextTagSelection([true, false, false], 1, "multiple")).toEqual([true, true, false]);
  });
});
