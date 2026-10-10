import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * BACK-TO-TOP APPEARANCE, on the real stylesheet. The press travel rides `transform`, so the reveal's
 * own `translate` is never touched, and nothing moves on hover in any appearance.
 */

async function mount(page: Page, html: string, hostAttrs: Record<string, string> = {}) {
  await page.evaluate(
    ({ html, hostAttrs }) => {
      document.getElementById("btt-host")?.remove();
      const host = document.createElement("div");
      host.id = "btt-host";
      host.style.cssText = "position:fixed;inset:0 auto auto 0;z-index:9999;padding:40px;display:flex;gap:40px;background:repeating-linear-gradient(45deg,#000 0 6px,#fff 6px 12px)";
      for (const [k, v] of Object.entries(hostAttrs)) host.setAttribute(k, v);
      host.innerHTML = html;
      document.body.append(host);
    },
    { html, hostAttrs },
  );
  await page.waitForTimeout(400);
}

const control = (id: string, appearance: string) =>
  `<button id="${id}" class="sk-back-to-top sk-interactive" type="button" data-appearance="${appearance}"><span class="sk-back-to-top__icon">↑</span><span class="sk-back-to-top__label">Top</span></button>`;

async function read(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const cs = getComputedStyle(el);
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.fillStyle = cs.backgroundColor;
    ctx.fillRect(0, 0, 1, 1);
    return {
      shadow: cs.boxShadow,
      transform: cs.transform,
      translate: cs.translate,
      backdrop: cs.backdropFilter,
      alpha: ctx.getImageData(0, 0, 1, 1).data[3]! / 255,
    };
  });
}

async function held(page: Page, selector: string) {
  await page.locator(selector).hover();
  await page.mouse.down();
  await page.waitForTimeout(300);
  const r = await read(page, selector);
  await page.mouse.up();
  await page.mouse.move(1, 1);
  await page.waitForTimeout(300);
  return r;
}

async function hovered(page: Page, selector: string) {
  await page.locator(selector).hover();
  await page.waitForTimeout(300);
  const r = await read(page, selector);
  await page.mouse.move(1, 1);
  return r;
}

test.beforeEach(async ({ page }) => {
  await waitForStage(page);
  // Other stage specimens open modal dialogs; they must not intercept this test's pointer.
  await page.evaluate(() => document.querySelectorAll<HTMLDialogElement>("dialog[open]").forEach((dialog) => dialog.close()));
});

test("soft background is painted at rest, including existing authored markup", async ({ page }) => {
  await page.mouse.move(1, 1);
  await mount(page, control("legacy", "plain") + '<button id="soft" class="sk-back-to-top sk-button sk-interactive" data-variant="soft">Top</button>');
  for (const id of ["#legacy", "#soft"]) {
    expect((await read(page, id)).alpha, id).toBeGreaterThan(0.3);
  }
});

test("tactile: a ledge the press sinks into through transform, never the reveal's translate", async ({ page }) => {
  await mount(page, control("probe", "tactile"));
  const rest = await read(page, "#probe");
  expect(rest.shadow).toMatch(/0px 5px 0px/);
  expect(rest.transform).toBe("none");
  const hover = await hovered(page, "#probe");
  expect(hover.transform).toBe("none");
  const press = await held(page, "#probe");
  expect(press.transform).toBe("matrix(1, 0, 0, 1, 0, 4)");
  expect(press.shadow).toMatch(/0px 1px 0px/);
  expect(press.translate).toBe(rest.translate);
});

test("brutalist: a hard offset the disc travels into, mirrored in RTL", async ({ page }) => {
  await mount(page, control("probe", "brutalist"));
  expect((await read(page, "#probe")).shadow).toMatch(/4px 4px 0px/);
  expect((await hovered(page, "#probe")).transform).toBe("none");
  const press = await held(page, "#probe");
  expect(press.transform).toBe("matrix(1, 0, 0, 1, 3, 3)");
  expect(press.shadow).toMatch(/1px 1px 0px/);

  await mount(page, control("rtl", "brutalist"), { dir: "rtl" });
  expect((await read(page, "#rtl")).shadow).toMatch(/-4px 4px 0px/);
});

test("frosted: see-through over the page, opaque under reduced transparency", async ({ page }) => {
  await mount(page, control("plain", "plain") + control("probe", "frosted"));
  const frosted = await read(page, "#probe");
  expect(frosted.backdrop).toMatch(/blur\(12px\)/);
  expect(frosted.alpha).toBeLessThan(1);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "reduce" }] });
  await page.waitForTimeout(400);
  const reduced = await read(page, "#probe");
  expect(reduced.backdrop).toBe("none");
  expect(reduced.alpha).toBe(1);
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "" }] });
});

test("forced colors: no ledge, offset, glass or travel", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await mount(page, ["tactile", "brutalist", "frosted"].map((a) => control(a, a)).join(""));
  for (const id of ["#tactile", "#brutalist", "#frosted"]) {
    const r = await read(page, id);
    expect(r.shadow, id).toBe("none");
    expect(r.backdrop, id).toBe("none");
  }
  expect((await held(page, "#brutalist")).transform).toBe("none");
  await page.emulateMedia({ forcedColors: null });
});
