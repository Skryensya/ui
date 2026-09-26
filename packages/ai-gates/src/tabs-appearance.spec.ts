import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/* TABS APPEARANCE: the selected tab wears the construction, the rest stay flat, nested tabs keep their own. */

const tabs = (id: string, appearance: string, attrs = "", inner = "") => `
  <div id="${id}" class="sk-tabs" data-appearance="${appearance}" ${attrs}>
    <div class="sk-tabs__list" role="tablist">
      <button class="sk-tabs__trigger sk-interactive" role="tab" data-selected type="button">Uno</button>
      <button class="sk-tabs__trigger sk-interactive" role="tab" type="button">Dos</button>
    </div>
    <div class="sk-tabs__content" role="tabpanel">${inner}</div>
  </div>`;

async function mount(page: Page, html: string, hostAttrs: Record<string, string> = {}) {
  await page.evaluate(
    ({ html, hostAttrs }) => {
      document.getElementById("tabs-host")?.remove();
      const host = document.createElement("div");
      host.id = "tabs-host";
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
  page.evaluate((id) => {
    const root = document.getElementById(id)!;
    const [selected, other] = Array.from(root.querySelectorAll(":scope > .sk-tabs__list > .sk-tabs__trigger"));
    return {
      selected: getComputedStyle(selected!).boxShadow,
      other: getComputedStyle(other!).boxShadow,
      bar: getComputedStyle(selected!, "::after").opacity,
      list: getComputedStyle(root.querySelector(":scope > .sk-tabs__list")!).borderBottomColor,
      backdrop: getComputedStyle(root.querySelector(":scope > .sk-tabs__list")!).backdropFilter,
    };
  }, id);

test.beforeEach(async ({ page }) => {
  await waitForStage(page);
});

test("tactile: the selected tab is a raised key and replaces the bar", async ({ page }) => {
  await mount(page, tabs("t", "tactile"));
  const t = await read(page, "t");
  expect(t.selected).toMatch(/0px 3px 0px 0px/);
  expect(t.other).toBe("none");
  expect(t.bar).toBe("0");
});

test("brutalist: a black-edged block with a hard offset, a black rule, mirrored in RTL", async ({ page }) => {
  await mount(page, tabs("b", "brutalist"));
  const b = await read(page, "b");
  expect(b.selected).toMatch(/3px 3px 0px/);
  expect(b.bar).toBe("0");
  expect(b.list).toBe("oklch(0 0 0)");
  await mount(page, tabs("r", "brutalist"), { dir: "rtl" });
  expect((await read(page, "r")).selected).toMatch(/-3px 3px 0px/);
});

test("frosted: a see-through strip that keeps the bar", async ({ page }) => {
  await mount(page, tabs("f", "frosted"));
  const f = await read(page, "f");
  expect(f.backdrop).toMatch(/blur\(12px\)/);
  expect(f.bar).toBe("1");
});

test("a nested Tabs keeps its own appearance", async ({ page }) => {
  await mount(page, tabs("outer", "brutalist", "", tabs("inner", "plain")));
  const inner = await read(page, "inner");
  expect(inner.selected).toBe("none");
  expect(inner.bar).toBe("1");
});

test("forced colors: the Highlight bar carries the selection in every appearance", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await mount(page, ["tactile", "brutalist", "frosted"].map((a) => tabs(a, a)).join(""));
  for (const id of ["tactile", "brutalist", "frosted"]) {
    const r = await read(page, id);
    expect(r.selected, id).toBe("none");
    expect(r.bar, id).toBe("1");
  }
  await page.emulateMedia({ forcedColors: null });
});
