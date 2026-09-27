import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * SEGMENTED APPEARANCE, written only as hooks on the root: the track and the checked option (the
 * indicator reads the same hooks once enhanced) change together, and the forced-colors track stays
 * the system's.
 */

const control = (id: string, appearance: string) => `
  <div id="${id}" class="sk-segmented" role="radiogroup" aria-label="Vista" data-appearance="${appearance}">
    <button class="sk-segmented__option sk-interactive" role="radio" aria-checked="true" type="button">Lista</button>
    <button class="sk-segmented__option sk-interactive" role="radio" aria-checked="false" type="button">Grilla</button>
  </div>`;

async function mount(page: Page, html: string, hostAttrs: Record<string, string> = {}, style = "") {
  await page.evaluate(
    ({ html, hostAttrs, style }) => {
      document.getElementById("seg-host")?.remove();
      const host = document.createElement("div");
      host.id = "seg-host";
      host.style.cssText = `position:fixed;inset:0 auto auto 0;z-index:9999;padding:40px;display:flex;gap:40px;background:var(--color-bg-canvas);${style}`;
      for (const [k, v] of Object.entries(hostAttrs)) host.setAttribute(k, v);
      host.innerHTML = html;
      document.body.append(host);
    },
    { html, hostAttrs, style },
  );
  await page.waitForTimeout(300);
}

const read = (page: Page, id: string) =>
  page.evaluate((id) => {
    const root = document.getElementById(id)!;
    const checked = root.querySelector('[aria-checked="true"]')!;
    const cs = getComputedStyle(root);
    return {
      track: cs.boxShadow,
      edge: cs.borderTopColor,
      backdrop: cs.backdropFilter,
      selected: getComputedStyle(checked).boxShadow,
    };
  }, id);

test.beforeEach(async ({ page }) => {
  await waitForStage(page);
});

test("plain is untouched: omitting appearance equals plain", async ({ page }) => {
  await mount(page, control("a", "plain") + control("b", "plain").replace(' data-appearance="plain"', ""));
  expect(await read(page, "a")).toEqual(await read(page, "b"));
});

test("tactile: a deeper well and a raised key on a ledge", async ({ page }) => {
  await mount(page, control("t", "tactile"));
  const t = await read(page, "t");
  expect(t.track).toMatch(/inset/);
  expect(t.selected).toMatch(/0px 3px 0px 0px/);
});

test("brutalist: a black-edged track with a hard offset, mirrored in RTL, and a black-ringed selection", async ({ page }) => {
  await mount(page, control("b", "brutalist"));
  const b = await read(page, "b");
  expect(b.track).toMatch(/3px 3px 0px/);
  expect(b.selected).toMatch(/oklch\(0 0 0\) 0px 0px 0px 1px inset/);
  await mount(page, control("r", "brutalist"), { dir: "rtl" });
  expect((await read(page, "r")).track).toMatch(/-3px 3px 0px/);
});

test("frosted: a see-through track over a blurred backdrop, opaque under high contrast", async ({ page }) => {
  await mount(page, control("f", "frosted"), {}, "background: repeating-linear-gradient(45deg,#000 0 6px,#fff 6px 12px)");
  expect((await read(page, "f")).backdrop).toMatch(/blur\(12px\)/);
  await mount(page, control("h", "frosted"), { "data-contrast": "high" });
  expect((await read(page, "h")).backdrop).toBe("none");
});

test("forced colors: no well, offset, ledge or glass", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await mount(page, ["tactile", "brutalist", "frosted"].map((a) => control(a, a)).join(""));
  for (const id of ["tactile", "brutalist", "frosted"]) {
    const r = await read(page, id);
    expect(r.track, id).toBe("none");
    expect(r.backdrop, id).toBe("none");
  }
  await page.emulateMedia({ forcedColors: null });
});
