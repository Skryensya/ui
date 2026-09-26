import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/* PAGINATION APPEARANCE: the current page wears the construction through its own hooks. */

const pager = (id: string, appearance: string) => `
  <nav id="${id}" class="sk-pagination" aria-label="p" data-appearance="${appearance}">
    <button class="sk-pagination__item sk-interactive" type="button">1</button>
    <button class="sk-pagination__item sk-interactive" type="button" aria-current="page">2</button>
    <button class="sk-pagination__item sk-interactive" type="button">3</button>
  </nav>`;

async function mount(page: Page, html: string, hostAttrs: Record<string, string> = {}) {
  await page.evaluate(
    ({ html, hostAttrs }) => {
      document.getElementById("pg-host")?.remove();
      const host = document.createElement("div");
      host.id = "pg-host";
      host.style.cssText = "position:fixed;inset:0 auto auto 0;z-index:9999;padding:40px;display:flex;gap:40px;background:var(--color-bg-canvas)";
      for (const [k, v] of Object.entries(hostAttrs)) host.setAttribute(k, v);
      host.innerHTML = html;
      document.body.append(host);
    },
    { html, hostAttrs },
  );
  await page.waitForTimeout(300);
}

const current = (page: Page, id: string) =>
  page.evaluate((id) => {
    const el = document.querySelector(`#${id} [aria-current="page"]`)!;
    const cs = getComputedStyle(el);
    return { shadow: cs.boxShadow, border: cs.borderTopColor, backdrop: cs.backdropFilter };
  }, id);

test.beforeEach(async ({ page }) => {
  await waitForStage(page);
});

test("tactile: the current page stands on a deeper ledge, and a press sinks instead of squeezing", async ({ page }) => {
  await mount(page, pager("t", "tactile"));
  expect((await current(page, "t")).shadow).toMatch(/0px 3px 0px 0px/);
  await page.locator("#t button").first().hover();
  await page.mouse.down();
  await page.waitForTimeout(300);
  const pressed = await page.locator("#t button").first().evaluate((el) => [getComputedStyle(el).translate, getComputedStyle(el).scale]);
  await page.mouse.up();
  expect(pressed[0]).toBe("0px 2px");
  expect(["none", "1"]).toContain(pressed[1]);
});

test("brutalist: the current page is a black-edged block with a hard offset, mirrored in RTL", async ({ page }) => {
  await mount(page, pager("b", "brutalist"));
  const b = await current(page, "b");
  expect(b.shadow).toMatch(/3px 3px 0px/);
  expect(b.border).toBe("oklch(0 0 0)");
  await mount(page, pager("r", "brutalist"), { dir: "rtl" });
  expect((await current(page, "r")).shadow).toMatch(/-3px 3px 0px/);
});

test("frosted: the current page is a see-through sheet, opaque under high contrast", async ({ page }) => {
  await mount(page, pager("f", "frosted"));
  expect((await current(page, "f")).backdrop).toMatch(/blur\(10px\)/);
  await mount(page, pager("h", "frosted"), { "data-contrast": "high" });
  expect((await current(page, "h")).backdrop).toBe("none");
});

test("forced colors: Highlight alone marks the page", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await mount(page, ["tactile", "brutalist", "frosted"].map((a) => pager(a, a)).join(""));
  for (const id of ["tactile", "brutalist", "frosted"]) {
    const r = await current(page, id);
    expect(r.shadow, id).toBe("none");
    expect(r.backdrop, id).toBe("none");
  }
  await page.emulateMedia({ forcedColors: null });
});
