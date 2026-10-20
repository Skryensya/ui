import { describe, expect, it } from "vitest";
import { catalog, categories, consumerPath, cssOf, suggest } from "./manifest.js";

describe("catalog", () => {
  it("holds every component of the install manifest and the integrations", () => {
    expect(catalog.size).toBeGreaterThan(110);
    expect(catalog.get("button")?.react?.entry).toBe("@skryensya/react/button");
    expect(catalog.get("hook-form")?.kind).toBe("integration");
    expect(categories()).toContain("integrations");
  });

  it("puts a dependency's stylesheet before the one that needs it", () => {
    expect(catalog.get("calendar")!.css).toEqual([
      "@skryensya/core/components/loader.css",
      "@skryensya/core/patterns/a11y-warn.css",
      "@skryensya/core/components/button.css",
      "@skryensya/core/components/calendar.css",
    ]);
  });

  it("borrows an integration's stylesheets from the components it draws, each once", () => {
    const css = catalog.get("data-table")!.css;
    expect(css).toContain("@skryensya/core/components/table.css");
    expect(css).toContain("@skryensya/core/components/pagination.css");
    expect(new Set(css).size).toBe(css.length);
  });

  it("merges several entries without repeating a shared stylesheet", () => {
    const css = cssOf(["button", "calendar"]);
    expect(css.filter((file) => file.endsWith("button.css"))).toHaveLength(1);
  });

  it("names the packages a component needs besides the system's", () => {
    expect(catalog.get("editor")!.peers).toEqual(["@skryensya/editor"]);
    expect(catalog.get("data-table")!.peers).toEqual(["@tanstack/react-table"]);
  });
});

describe("suggest", () => {
  it("offers the closest names for a typo", () => {
    expect(suggest("buton")).toContain("button");
    expect(suggest("calender")).toContain("calendar");
  });

  it("offers nothing for something unrelated", () => {
    expect(suggest("zzzzzzzzzz")).toEqual([]);
  });
});

describe("consumerPath", () => {
  it("imports core's stylesheets through the binding, so core is never installed by the app", () => {
    expect(consumerPath("@skryensya/core/components/button.css", "react")).toBe("@skryensya/react/css/components/button.css");
    expect(consumerPath("@skryensya/core/tokens.css", "vanilla")).toBe("@skryensya/vanilla/css/tokens.css");
  });

  it("maps every stylesheet any entry names", () => {
    for (const entry of catalog.values()) for (const file of entry.css) expect(consumerPath(file, "react")).not.toContain("@skryensya/core");
  });
});
