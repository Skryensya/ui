import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/* TOOLBAR APPEARANCE: the bar's frame takes the construction; its Buttons keep their own. */

const bar = (id: string, appearance: string) =>
  `<div id="${id}" class="sk-toolbar" role="toolbar" aria-label="t" data-appearance="${appearance}"><div class="sk-toolbar__group"><button class="sk-button sk-interactive" data-variant="ghost" data-size="sm">B</button></div><div class="sk-toolbar__separator"></div><div class="sk-toolbar__group"><button class="sk-button sk-interactive" data-variant="ghost" data-size="sm">I</button></div></div>`;

async function mount(page: Page, html: string, hostAttrs: Record<string, string> = {}) {
  await page.evaluate(
    ({ html, hostAttrs }) => {
      document.getElementById("tb-host")?.remove();
      const host = document.createElement("div");
      host.id = "tb-host";
      host.style.cssText = "position:fixed;inset:0 auto auto 0;z-index:9999;padding:40px;display:flex;gap:40px;background:repeating-linear-gradient(45deg,#000 0 6px,#fff 6px 12px)";
      for (const [k, v] of Object.entries(hostAttrs)) host.setAttribute(k, v);
      host.innerHTML = html;
      document.body.append(host);
    },
    { html, hostAttrs },
  );
  await page.waitForTimeout(300);
}

const read = (page: Page, id: string) =>
  page.evaluate((id) => {
    const el = document.getElementById(id)!;
    const cs = getComputedStyle(el);
    return {
      shadow: cs.boxShadow,
      edge: cs.borderTopColor,
      backdrop: cs.backdropFilter,
      separator: getComputedStyle(el.querySelector(".sk-toolbar__separator")!).backgroundColor,
    };
  }, id);

test.beforeEach(async ({ page }) => {
  await waitForStage(page);
});

test("tactile, brutalist and frosted each draw the frame", async ({ page }) => {
  await mount(page, ["plain", "tactile", "brutalist", "frosted"].map((a) => bar(a, a)).join(""));
  expect((await read(page, "plain")).shadow).toBe("none");
  expect((await read(page, "tactile")).shadow).toMatch(/0px 4px 0px 0px/);
  const b = await read(page, "brutalist");
  expect(b.shadow).toMatch(/4px 4px 0px/);
  expect(b.edge).toBe("oklch(0 0 0)");
  expect(b.separator).toBe("oklch(0 0 0)");
  expect((await read(page, "frosted")).backdrop).toMatch(/blur\(16px\)/);
});

test("brutalist mirrors in RTL; frosted is opaque under high contrast", async ({ page }) => {
  await mount(page, bar("r", "brutalist"), { dir: "rtl" });
  expect((await read(page, "r")).shadow).toMatch(/-4px 4px 0px/);
  await mount(page, bar("h", "frosted"), { "data-contrast": "high" });
  expect((await read(page, "h")).backdrop).toBe("none");
});

test("forced colors: the system frame in every appearance", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await mount(page, ["tactile", "brutalist", "frosted"].map((a) => bar(a, a)).join(""));
  for (const id of ["tactile", "brutalist", "frosted"]) {
    const r = await read(page, id);
    expect(r.shadow, id).toBe("none");
    expect(r.backdrop, id).toBe("none");
  }
  await page.emulateMedia({ forcedColors: null });
});
