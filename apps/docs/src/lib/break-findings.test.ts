import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { breakFindings, openBreakFindings } from "./break-findings";
import { catalogBreaks } from "./debug-catalog";

const root = new URL("../../../../", import.meta.url);
const index = readFileSync(
  new URL("../pages/debug/index.astro", import.meta.url),
  "utf8",
);

describe("break findings", () => {
  it("does not count an applied tooltip fix as an open error", () => {
    expect(breakFindings.tooltip[0].status).toBe("fixed");
    expect(openBreakFindings("tooltip")).toEqual([]);
  });

  it("does not invent findings for components without recorded defects", () => {
    expect(openBreakFindings("form-field")).toEqual([]);
  });

  it.each(Object.entries(breakFindings))(
    "%s shares its open findings with the index",
    (component, findings) => {
      if (catalogBreaks.some(({ id }) => id === component)) {
        expect(index).toContain("openBreakFindings(entry.id)");
      } else {
        expect(index).toContain(`openBreakFindings("${component}")`);
      }
      expect(openBreakFindings(component)).toEqual(
        findings
          .filter((finding) => finding.status === "open")
          .map((finding) => finding.error),
      );
      for (const finding of findings) {
        expect(finding.scenario.trim()).not.toBe("");
        expect(finding.error.trim()).not.toBe("");
        expect(finding.fix.trim()).not.toBe("");
        expect(existsSync(new URL(finding.source, root))).toBe(true);
      }
    },
  );
});
