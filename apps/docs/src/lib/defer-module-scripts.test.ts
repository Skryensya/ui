import { describe, expect, it } from "vitest";
import { deferModuleScripts } from "./defer-module-scripts";

describe("deferModuleScripts", () => {
  const page = `<html><head><script type="module" src="/_astro/a.js"></script></head><body><p>x</p><script>inline()</script><script type="module" src="/_astro/b.js"></script></body></html>`;

  it("replaces every module script tag with one loader at the end of the body, in order", () => {
    const out = deferModuleScripts(page);
    expect(out).not.toContain('<script type="module" src=');
    expect(out).toContain('["/_astro/a.js","/_astro/b.js"]');
    expect(out.indexOf("requestAnimationFrame")).toBeGreaterThan(out.indexOf("<p>x</p>"));
    expect(out.endsWith("</script></body></html>")).toBe(true);
  });

  it("leaves classic and inline scripts, and a page without module scripts, untouched", () => {
    expect(deferModuleScripts(page)).toContain("<script>inline()</script>");
    const plain = "<html><body><script>a()</script></body></html>";
    expect(deferModuleScripts(plain)).toBe(plain);
  });
});
