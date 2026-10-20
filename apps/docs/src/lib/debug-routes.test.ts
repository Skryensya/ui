import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routes = new URL("../pages/debug/", import.meta.url);
const index = readFileSync(new URL("index.astro", routes), "utf8");
const pages = readdirSync(routes).filter((name) =>
  name.endsWith("-break.astro") && !name.includes("["),
);

describe("break harness routes", () => {
  it("does not generate catalog break routes in production", () => {
    const source = readFileSync(new URL("[component]-break.astro", routes), "utf8");
    expect(source).toContain('import.meta.env.PROD ? [] : catalogBreaks.map');
    expect(source).toContain('if (import.meta.env.PROD) return new Response(null, { status: 404 })');
    expect(source).toContain('client:only="react"');
  });
  it("shows diagnostics on internal pages without hiding specimen overflow", () => {
    const shell = readFileSync(
      new URL("../components/DebugShell.astro", import.meta.url),
      "utf8",
    );
    expect(shell).toContain("<BreakFindings component={componentSlug} />");
    expect(shell).toMatch(
      /\.break-page \.break-case__stage\s*\{\s*overflow: visible;/,
    );
  });

  it.each(pages)(
    "%s is dev-only, uses the shared shell and is indexed",
    (name) => {
      const source = readFileSync(new URL(name, routes), "utf8");
      expect(source).toMatch(
        /if\s*\(import\.meta\.env\.PROD\)\s*\{?\s*return new Response\(null,\s*\{\s*status:\s*404\s*\}\)/,
      );
      expect(source).toContain("<DebugShell");
      expect(source).toMatch(/client:(?:only="react"|load)/);
      expect(index).toContain(`/debug/${name.replace(".astro", "")}`);
    },
  );
});
