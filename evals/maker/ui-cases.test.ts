import { describe, expect, it } from "vitest";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { brokenInvariants, malformedInvariants } from "../invariants.js";
import { quality, textsOf } from "./ui-checks.js";
import { uiCases, type UiCase } from "./ui-cases.js";
import { scoreAttempt } from "./ui-score.js";

const page = (children: readonly UsageTree[]): UsageTree => ({ contract: "layout", signature: "Main", children: [...children] });

describe("the UI bench holds its own checks to the pages it knows", () => {
  it("has unique ids and covers more than one family", () => {
    expect(new Set(uiCases.map((entry) => entry.id)).size).toBe(uiCases.length);
    expect(new Set(uiCases.map((entry) => entry.family)).size).toBeGreaterThan(8);
  });

  for (const entry of uiCases) {
    describe(entry.id, () => {
      const given = `${entry.prompt.en} ${entry.prompt.es} ${entry.start ? entry.start.flatMap((tree) => textsOf(tree)).join(" ") : ""}`;
      it("states invariants that can be judged", () => {
        expect(malformedInvariants(entry.invariants)).toEqual([]);
      });
      it("its good answer passes every check", () => {
        const result = scoreAttempt(entry as UiCase, page(entry.good), given);
        expect(result.failures).toEqual([]);
      });
      for (const bad of entry.bad) {
        it(`its bad answer fails: ${bad.because}`, () => {
          const result = scoreAttempt(entry as UiCase, page(bad.children), given);
          expect(result.failures.length).toBeGreaterThan(0);
        });
      }
    });
  }

  it("the quality check names the arrangement mistakes it exists to catch", () => {
    const loose = quality(page([{ contract: "wrapper", signature: "Wrapper", options: { wrapperSize: "md" }, children: [{ contract: "typography", signature: "Heading", children: "A" }, { contract: "typography", signature: "Text", children: "B" }] }]), "");
    expect(loose.problems.join(" ")).toContain("Put them in one Stack");
    const stacked = quality(page([{ contract: "wrapper", signature: "Wrapper", options: { wrapperSize: "md" }, children: [{ contract: "layout", signature: "Stack", children: [{ contract: "button", signature: "Button.action", children: "A" }, { contract: "button", signature: "Button.action", children: "B" }] }] }]), "");
    expect(stacked.problems.join(" ")).toContain("go in an Inline");
  });

  it("an invented price, address or percentage is flagged unless the person gave it", () => {
    const tree = page([{ contract: "typography", signature: "Text", children: "Only $19 a month, write to hi@bakery.com, save 20%." }]);
    expect(quality(tree, "").warnings.join(" ")).toMatch(/price.*email|email.*price|price/);
    expect(quality(tree, "Only $19 a month, write to hi@bakery.com, save 20%.").warnings).toEqual([]);
  });
});
