import { describe, expect, it } from "vitest";
import { getBreakCoverage } from "./debug-coverage";

const routes = (...hrefs: string[]) => hrefs.map((href) => ({ href }));

describe("break coverage", () => {
  it("counts shared harnesses without counting a documented component twice", () => {
    expect(
      getBreakCoverage(
        routes(
          "/debug/content-break",
          "/debug/selection-break",
          "/debug/accordion-break",
          "/debug/details-break",
        ),
        routes(
          "/components/text",
          "/components/heading",
          "/components/link",
          "/components/switch",
          "/components/radio-group",
          "/components/accordion",
          "/components/editor",
        ),
      ),
    ).toEqual({ covered: 6, total: 7 });
  });

  it("handles renamed and utility routes without claiming coverage of Sidebar", () => {
    expect(
      getBreakCoverage(
        routes("/debug/file-upload-break", "/debug/nav-list-break"),
        routes("/components/drop-zone", "/nav-list", "/components/sidebar"),
      ),
    ).toEqual({ covered: 2, total: 3 });
  });

  it("ignores unknown harnesses and duplicate entries", () => {
    expect(
      getBreakCoverage(
        routes(
          "/debug/button-break",
          "/debug/button-break",
          "/debug/unknown-break",
        ),
        routes("/components/button", "/components/button", "/components/input"),
      ),
    ).toEqual({ covered: 1, total: 2 });
  });

  it("handles an empty inventory", () => {
    expect(getBreakCoverage([], [])).toEqual({ covered: 0, total: 0 });
  });
});
