import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/* CHECKBOX APPEARANCE: keyed on a Checkbox's label or a CheckboxGroup's root, painted on the box. */

const box = (id: string, appearance: string, checked = false) =>
  `<label id="${id}" class="sk-checkbox" data-appearance="${appearance}"><input class="sk-checkbox__input" type="checkbox" ${checked ? "checked" : ""}><span class="sk-checkbox__control sk-interactive" aria-hidden="true"></span><span class="sk-checkbox__label">${id}</span></label>`;

async function mount(page: Page, html: string, hostAttrs: Record<string, string> = {}) {
  await page.evaluate(
    ({ html, hostAttrs }) => {
      document.getElementById("cb-host")?.remove();
      const host = document.createElement("div");
      host.id = "cb-host";
      host.style.cssText = "position:fixed;inset:0 auto auto 0;z-index:9999;padding:40px;display:flex;gap:40px;background:repeating-linear-gradient(45deg,#000 0 6px,#fff 6px 12px)";
      for (const [k, v] of Object.entries(hostAttrs)) host.setAttribute(k, v);
      host.innerHTML = html;
      document.body.append(host);
    },
    { html, hostAttrs },
  );
  await page.waitForTimeout(300);
}

const read = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => {
    const cs = getComputedStyle(el);
    return { shadow: cs.boxShadow, edge: cs.borderTopColor, backdrop: cs.backdropFilter, translate: cs.translate, scale: cs.scale };
  });

test.beforeEach(async ({ page }) => {
  await waitForStage(page);
});

test("tactile: a raised box on a ledge that sinks instead of squeezing", async ({ page }) => {
  await mount(page, box("t", "tactile"));
  expect((await read(page, "#t .sk-checkbox__control")).shadow).toMatch(/0px 2px 0px 0px/);
  await page.locator("#t").hover();
  await page.mouse.down();
  await page.waitForTimeout(300);
  const pressed = await read(page, "#t .sk-checkbox__control");
  await page.mouse.up();
  expect(pressed.translate).toBe("0px 1px");
  expect(["none", "1"]).toContain(pressed.scale);
});

test("brutalist: a black edge and a hard offset, from the label or the group, mirrored in RTL", async ({ page }) => {
  await mount(page, box("b", "brutalist") + `<div class="sk-checkbox-group" data-appearance="brutalist">${box("g", "plain").replace(' data-appearance="plain"', "")}</div>`);
  for (const sel of ["#b .sk-checkbox__control", "#g .sk-checkbox__control"]) {
    const r = await read(page, sel);
    expect(r.edge, sel).toBe("oklch(0 0 0)");
    expect(r.shadow, sel).toMatch(/2px 2px 0px/);
  }
  await mount(page, box("r", "brutalist"), { dir: "rtl" });
  expect((await read(page, "#r .sk-checkbox__control")).shadow).toMatch(/-2px 2px 0px/);
});

test("frosted: a see-through box, opaque under high contrast", async ({ page }) => {
  await mount(page, box("f", "frosted"));
  expect((await read(page, "#f .sk-checkbox__control")).backdrop).toMatch(/blur\(6px\)/);
  await mount(page, box("h", "frosted"), { "data-contrast": "high" });
  expect((await read(page, "#h .sk-checkbox__control")).backdrop).toBe("none");
});

test("forced colors: the system box, no ledge, offset or glass", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await mount(page, ["tactile", "brutalist", "frosted"].map((a) => box(a, a)).join(""));
  for (const id of ["tactile", "brutalist", "frosted"]) {
    const r = await read(page, `#${id} .sk-checkbox__control`);
    expect(r.shadow, id).toBe("none");
    expect(r.backdrop, id).toBe("none");
  }
  await page.emulateMedia({ forcedColors: null });
});
