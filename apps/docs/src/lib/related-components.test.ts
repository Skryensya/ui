import { describe, expect, it } from "vitest";
import { getNavigation } from "./navigation";
import { relatedComponents } from "./related-components";

const known = new Set(
  getNavigation("en")
    .find((section) => section.id === "components")!
    .groups.flatMap((group) => group.items.map((item) => item.href)),
);

describe("related components", () => {
  it("names only pages the navigation has", () => {
    for (const [page, related] of Object.entries(relatedComponents)) {
      expect(known.has(page), page).toBe(true);
      for (const href of related) expect(known.has(href), `${page} -> ${href}`).toBe(true);
    }
  });

  it("never lists a page as related to itself, nor twice", () => {
    for (const [page, related] of Object.entries(relatedComponents)) {
      expect(related).not.toContain(page);
      expect(new Set(related).size).toBe(related.length);
    }
  });

  it("puts the two players first in each other's list", () => {
    expect(relatedComponents["/components/video-player"]![0]).toBe("/components/audio-player");
    expect(relatedComponents["/components/audio-player"]![0]).toBe("/components/video-player");
  });
});
