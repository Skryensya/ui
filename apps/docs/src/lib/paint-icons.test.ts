import { describe, expect, it } from "vitest";
import { paintIconPlaceholders } from "./paint-icons";

describe("paintIconPlaceholders", () => {
  it("draws a placeholder, keeping the author's attributes and size", () => {
    const html = paintIconPlaceholders('<span data-sk-icon="check" data-sk-icon-size="md" data-face="light" class="mine"></span>');
    expect(html.startsWith("<svg")).toBe(true);
    expect(html).toContain('data-icon="check"');
    expect(html).toContain('data-size="md"');
    expect(html).toContain('data-face="light"');
    expect(html).toMatch(/class="sk-icon mine"/);
    expect(html).not.toContain("data-sk-icon");
  });

  it("leaves labelled placeholders, unknown icons and other markup to the script", () => {
    const labelled = '<span data-sk-icon="check" data-sk-icon-label="Done"></span>';
    const unknown = '<span data-sk-icon="not-a-real-icon"></span>';
    expect(paintIconPlaceholders(`${labelled}${unknown}<span>x</span>`)).toBe(`${labelled}${unknown}<span>x</span>`);
  });
});
