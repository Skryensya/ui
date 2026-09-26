import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/* SWITCH APPEARANCE: keyed on the label; the thumb's slide (transform) and its press (translate) compose. */

const sw = (id: string, appearance: string, checked = false) =>
  `<label id="${id}" class="sk-switch" data-appearance="${appearance}"><input class="sk-switch__input" type="checkbox" role="switch" ${checked ? "checked" : ""}><span class="sk-switch__control" aria-hidden="true"><span class="sk-switch__thumb"></span></span><span class="sk-switch__label">${id}</span></label>`;

async function mount(page: Page, html: string, hostAttrs: Record<string, string> = {}) {
  await page.evaluate(
    ({ html, hostAttrs }) => {
      document.getElementById("sw-host")?.remove();
      const host = document.createElement("div");
      host.id = "sw-host";
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
    const root = document.getElementById(id)!;
    const control = getComputedStyle(root.querySelector(".sk-switch__control")!);
    const thumb = getComputedStyle(root.querySelector(".sk-switch__thumb")!);
    return { track: control.boxShadow, edge: control.borderTopColor, backdrop: control.backdropFilter, thumb: thumb.boxShadow, translate: thumb.translate, transform: thumb.transform };
  }, id);

test.beforeEach(async ({ page }) => {
  await waitForStage(page);
});

test("tactile: a sunken well and a thumb on a ledge that sinks, while the slide still lands", async ({ page }) => {
  await mount(page, sw("t", "tactile", true));
  const rest = await read(page, "t");
  expect(rest.track).toMatch(/inset/);
  expect(rest.thumb).toMatch(/0px 2px 0px 0px/);
  expect(rest.transform).not.toBe("none");
  await page.locator("#t").hover();
  await page.mouse.down();
  await page.waitForTimeout(300);
  const pressed = await read(page, "t");
  await page.mouse.up();
  expect(pressed.translate).toBe("0px 1px");
  expect(pressed.transform).toBe(rest.transform);
});

test("brutalist: black edges and a hard-offset thumb, mirrored in RTL", async ({ page }) => {
  await mount(page, sw("b", "brutalist"));
  const b = await read(page, "b");
  expect(b.edge).toBe("oklch(0 0 0)");
  expect(b.thumb).toMatch(/2px 2px 0px/);
  await mount(page, sw("r", "brutalist"), { dir: "rtl" });
  expect((await read(page, "r")).thumb).toMatch(/-2px 2px 0px/);
});

test("frosted: a see-through track, opaque under high contrast", async ({ page }) => {
  await mount(page, sw("f", "frosted"));
  expect((await read(page, "f")).backdrop).toMatch(/blur\(8px\)/);
  await mount(page, sw("h", "frosted"), { "data-contrast": "high" });
  expect((await read(page, "h")).backdrop).toBe("none");
});

test("forced colors: the system track and thumb, no travel", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await mount(page, ["tactile", "brutalist", "frosted"].map((a) => sw(a, a)).join(""));
  for (const id of ["tactile", "brutalist", "frosted"]) {
    const r = await read(page, id);
    expect(r.track, id).toBe("none");
    expect(r.thumb, id).toBe("none");
    expect(r.backdrop, id).toBe("none");
  }
  await page.emulateMedia({ forcedColors: null });
});
