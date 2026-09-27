import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * THE TOKEN APPEARANCE GATE, shared by the small marks that publish plain / brutalist only (Badge,
 * Tag, Kbd, ImageFrame): a black edge and a small hard offset, mirrored in RTL, gone under forced
 * colors, and plain untouched.
 */
export type TokenSpec = {
  name: string;
  markup: (id: string, appearance: string) => string;
  offset: number;
};

async function mount(page: Page, html: string, hostAttrs: Record<string, string> = {}) {
  await page.evaluate(
    ({ html, hostAttrs }) => {
      document.getElementById("token-host")?.remove();
      const host = document.createElement("div");
      host.id = "token-host";
      host.style.cssText = "position:fixed;inset:0 auto auto 0;z-index:9999;padding:40px;display:flex;gap:40px;background:var(--color-bg-canvas)";
      for (const [k, v] of Object.entries(hostAttrs)) host.setAttribute(k, v);
      host.innerHTML = html;
      document.body.append(host);
    },
    { html, hostAttrs },
  );
  await page.waitForTimeout(300);
}

const read = (page: Page, id: string) =>
  page.locator(`#${id}`).evaluate((el) => {
    const cs = getComputedStyle(el);
    return { shadow: cs.boxShadow, edge: cs.borderTopColor };
  });

export function tokenAppearanceGate(spec: TokenSpec): void {
  test.describe(`${spec.name} appearance`, () => {
    test.beforeEach(async ({ page }) => {
      await waitForStage(page);
    });

    test("brutalist: a black edge and a hard offset, mirrored in RTL; plain untouched", async ({ page }) => {
      await mount(page, spec.markup("p", "plain") + spec.markup("b", "brutalist"));
      const b = await read(page, "b");
      expect(b.edge).toBe("oklch(0 0 0)");
      expect(b.shadow).toContain(`oklch(0 0 0) ${spec.offset}px ${spec.offset}px 0px`);
      expect((await read(page, "p")).shadow).not.toContain("oklch(0 0 0)");
      await mount(page, spec.markup("r", "brutalist"), { dir: "rtl" });
      expect((await read(page, "r")).shadow).toContain(`-${spec.offset}px ${spec.offset}px 0px`);
    });

    test("forced colors: no offset", async ({ page }) => {
      await page.emulateMedia({ forcedColors: "active" });
      await mount(page, spec.markup("f", "brutalist"));
      expect((await read(page, "f")).shadow).toBe("none");
      await page.emulateMedia({ forcedColors: null });
    });
  });
}
