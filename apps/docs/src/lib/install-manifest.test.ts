import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { installFor } from "./install-manifest";

const pagesDir = join(import.meta.dirname, "../components/pages");

describe("component Installation", () => {
  it("has a manifest entry for every page that declares a contract", () => {
    const missing: string[] = [];
    for (const file of readdirSync(pagesDir).filter((name) => name.endsWith("Page.astro"))) {
      const id = /<ComponentPageShell[^>]*?\bcontractId="([\w-]+)"/s.exec(readFileSync(join(pagesDir, file), "utf8"))?.[1];
      if (id && !installFor(id)) missing.push(`${file}: ${id}`);
    }
    expect(missing).toEqual([]);
  });

  it("names the sheets a component loads in dependency order, ending on its own", () => {
    const calendar = installFor("calendar")!;
    expect(calendar.css.files).toEqual(["@skryensya/core/components/button.css", "@skryensya/core/components/calendar.css"]);
    expect(calendar.vanilla).toMatchObject({ entry: "@skryensya/vanilla/calendar", mount: "mountCalendar", auto: true });
  });
});
