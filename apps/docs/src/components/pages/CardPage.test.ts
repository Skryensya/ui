import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/*
 * Card is a composition guide, not a component page. These tests protect the mechanical bits that
 * make that guide render correctly and keep the page from drifting back into a chart/dashboard
 * gallery instead of teaching the root-decision rule.
 */
const source = readFileSync(fileURLToPath(new URL("./CardPage.astro", import.meta.url)), "utf8");

describe("CardPage.astro", () => {
  it("imports tile.css, which Base.astro never loads globally", () => {
    expect(source).toContain('import "@skryensya/core/components/tile.css"');
  });

  it("imports checkbox.css, without which every indicator paints both the check and the dash glyph at once", () => {
    expect(source).toContain('import "@skryensya/core/components/checkbox.css"');
  });

  it("uses property-driven UsagePreview cards instead of old source-heavy ComponentPreview cards", () => {
    expect(source).toContain('import UsagePreview from "../UsagePreview.astro"');
    expect(source).not.toContain('import ComponentPreview from "../ComponentPreview.astro"');
    expect(source).toContain('optionName="surface"');
    /* A spacing scale, the page's own appearance axis and an initial state fail the "one choice per
       instance, seen at rest" test that earns a live control; each is taught elsewhere. */
    expect(source).not.toContain('optionName="padding"');
    expect(source).not.toContain('optionName="appearance"');
    expect(source).not.toContain('optionName="defaultChecked"');
  });

  it("keeps Card as a composition guide, not a chart showcase", () => {
    expect(source).not.toContain("ChartCardDemo");
    expect(source).not.toContain("emitChartWithOverlay");
    expect(source).not.toContain("cardStatTree");
    expect(source).not.toContain("cardMetaTree");
  });
});
