import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * THE SURFACE APPEARANCE GATE, shared by every surface that publishes plain / brutalist / frosted
 * (Dialog, Popover, Drawer, Sidebar, …). Each spec supplies its markup and the element that paints;
 * the claims are the same everywhere: a black hard offset mirrored in RTL, a see-through face over a
 * blurred backdrop that goes opaque under reduced transparency and high contrast, and nothing of
 * either under forced colors.
 */
export type SurfaceSpec = {
  name: string;
  /** Markup for one instance. `id` goes on the element carrying `data-appearance`. */
  markup: (id: string, appearance: string) => string;
  /** Selector, relative to the instance root, for the element that paints (`:scope` for itself). */
  paint: string;
  offset: number;
  blur: number;
};

const BUSY = "background: repeating-linear-gradient(45deg,#000 0 6px,#fff 6px 12px)";

async function mount(page: Page, html: string, hostAttrs: Record<string, string> = {}) {
  await page.evaluate(
    ({ html, hostAttrs, busy }) => {
      document.getElementById("surface-host")?.remove();
      const host = document.createElement("div");
      host.id = "surface-host";
      host.style.cssText = `position:fixed;inset:0 auto auto 0;z-index:9999;padding:40px;display:flex;gap:40px;${busy}`;
      for (const [k, v] of Object.entries(hostAttrs)) host.setAttribute(k, v);
      host.innerHTML = html;
      document.body.append(host);
    },
    { html, hostAttrs, busy: BUSY },
  );
  await page.waitForTimeout(400);
}

async function read(page: Page, id: string, paint: string) {
  return page.evaluate(
    ({ id, paint }) => {
      const root = document.getElementById(id)!;
      const el = paint === ":scope" ? root : root.querySelector<HTMLElement>(paint)!;
      const cs = getComputedStyle(el);
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.fillStyle = cs.backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
      return { shadow: cs.boxShadow, backdrop: cs.backdropFilter, alpha: ctx.getImageData(0, 0, 1, 1).data[3]! / 255 };
    },
    { id, paint },
  );
}

export function surfaceAppearanceGate(spec: SurfaceSpec): void {
  test.describe(`${spec.name} appearance`, () => {
    test.beforeEach(async ({ page }) => {
      await waitForStage(page);
    });

    test("brutalist: a black hard offset in place of the soft elevation, mirrored in RTL", async ({ page }) => {
      await mount(page, spec.markup("b", "brutalist"));
      const b = await read(page, "b", spec.paint);
      expect(b.shadow).toContain(`oklch(0 0 0) ${spec.offset}px ${spec.offset}px 0px`);
      await mount(page, spec.markup("r", "brutalist"), { dir: "rtl" });
      expect((await read(page, "r", spec.paint)).shadow).toContain(`-${spec.offset}px ${spec.offset}px 0px`);
    });

    test("frosted: see-through over a blurred backdrop, opaque under reduced transparency and high contrast", async ({ page }) => {
      await mount(page, spec.markup("f", "frosted"));
      const f = await read(page, "f", spec.paint);
      expect(f.backdrop).toMatch(new RegExp(`blur\\(${spec.blur}px\\)`));
      expect(f.alpha).toBeLessThan(1);
      expect(f.shadow).toContain("inset");

      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "reduce" }] });
      await page.waitForTimeout(400);
      const reduced = await read(page, "f", spec.paint);
      expect(reduced.backdrop).toBe("none");
      expect(reduced.alpha).toBe(1);
      await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "" }] });

      await mount(page, spec.markup("h", "frosted"), { "data-contrast": "high" });
      expect((await read(page, "h", spec.paint)).backdrop).toBe("none");
    });

    test("forced colors: neither construction survives", async ({ page }) => {
      await page.emulateMedia({ forcedColors: "active" });
      await mount(page, spec.markup("fb", "brutalist") + spec.markup("ff", "frosted"));
      for (const id of ["fb", "ff"]) {
        const r = await read(page, id, spec.paint);
        expect(r.shadow, id).toBe("none");
        expect(r.backdrop, id).toBe("none");
      }
      await page.emulateMedia({ forcedColors: null });
    });
  });
}
