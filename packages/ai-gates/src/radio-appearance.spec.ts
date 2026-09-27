import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/* RADIO APPEARANCE: keyed on a Radio's label or a RadioGroup's root, painted on the ring (::before). */

const radio = (id: string, attrs = "") =>
  `<label id="${id}" class="sk-radio" ${attrs}><input class="sk-radio__input" type="radio" name="${id}"><span class="sk-radio__control" aria-hidden="true"><span class="sk-radio__indicator"></span></span><span class="sk-radio__label">${id}</span></label>`;

async function mount(page: Page, html: string, hostAttrs: Record<string, string> = {}) {
  await page.evaluate(
    ({ html, hostAttrs }) => {
      document.getElementById("rd-host")?.remove();
      const host = document.createElement("div");
      host.id = "rd-host";
      host.style.cssText = "position:fixed;inset:0 auto auto 0;z-index:9999;padding:40px;display:flex;gap:40px;background:repeating-linear-gradient(45deg,#000 0 6px,#fff 6px 12px)";
      for (const [k, v] of Object.entries(hostAttrs)) host.setAttribute(k, v);
      host.innerHTML = html;
      document.body.append(host);
    },
    { html, hostAttrs },
  );
  await page.waitForTimeout(300);
}

const ring = (page: Page, id: string) =>
  page.locator(`#${id} .sk-radio__control`).evaluate((el) => {
    const cs = getComputedStyle(el, "::before");
    return { shadow: cs.boxShadow, edge: cs.borderTopColor, backdrop: cs.backdropFilter, translate: cs.translate };
  });

test.beforeEach(async ({ page }) => {
  await waitForStage(page);
});

test("tactile: a raised disc on a ledge that sinks when pressed", async ({ page }) => {
  await mount(page, radio("t", 'data-appearance="tactile"'));
  expect((await ring(page, "t")).shadow).toMatch(/0px 2px 0px 0px/);
  await page.locator("#t").hover();
  await page.mouse.down();
  await page.waitForTimeout(300);
  const pressed = await ring(page, "t");
  await page.mouse.up();
  expect(pressed.translate).toBe("0px 1px");
});

test("brutalist: a black edge and a hard offset, from the label or the group, mirrored in RTL", async ({ page }) => {
  await mount(page, radio("b", 'data-appearance="brutalist"') + `<div class="sk-radio-group" data-appearance="brutalist">${radio("g")}</div>`);
  for (const id of ["b", "g"]) {
    const r = await ring(page, id);
    expect(r.edge, id).toBe("oklch(0 0 0)");
    expect(r.shadow, id).toMatch(/2px 2px 0px/);
  }
  await mount(page, radio("r", 'data-appearance="brutalist"'), { dir: "rtl" });
  expect((await ring(page, "r")).shadow).toMatch(/-2px 2px 0px/);
});

test("frosted: a see-through disc, opaque under high contrast", async ({ page }) => {
  await mount(page, radio("f", 'data-appearance="frosted"'));
  expect((await ring(page, "f")).backdrop).toMatch(/blur\(6px\)/);
  await mount(page, radio("h", 'data-appearance="frosted"'), { "data-contrast": "high" });
  expect((await ring(page, "h")).backdrop).toBe("none");
});

test("forced colors: the system ring, no ledge, offset or glass", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await mount(page, ["tactile", "brutalist", "frosted"].map((a) => radio(a, `data-appearance="${a}"`)).join(""));
  for (const id of ["tactile", "brutalist", "frosted"]) {
    const r = await ring(page, id);
    expect(r.shadow, id).toBe("none");
    expect(r.backdrop, id).toBe("none");
  }
  await page.emulateMedia({ forcedColors: null });
});
