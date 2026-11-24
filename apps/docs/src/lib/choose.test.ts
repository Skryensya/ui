import { describe, expect, it } from "vitest";
import { chooseGroups, pageOf } from "./choose";

describe("which component?", () => {
  it("sends a variant to its own page, then to its base's, then to its family's", () => {
    expect(pageOf("Carousel.progressive", "carousel")).toBe("/components/progressive-carousel");
    expect(pageOf("Button.navigation", "button")).toBe("/components/button");
  });

  it("lists picks, not parts, and links almost every one to its page", () => {
    const rows = chooseGroups("en").flatMap((group) => group.rows);
    expect(rows.some((row) => row.signature === "Accordion.Item")).toBe(false);
    expect(rows.filter((row) => row.href).length / rows.length).toBeGreaterThan(0.9);
  });

  it("links to the Spanish pages from the Spanish table", () => {
    const button = chooseGroups("es").flatMap((group) => group.rows).find((row) => row.signature === "Button.action");
    expect(button?.href).toMatch(/^\/es\/componentes\/button/);
  });
});
