import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * WINDOW APPEARANCE, on the real stylesheet, painted on the content (the element React portals).
 * Static open frames: the machine owns geometry, not paint, so none is needed to read the paint.
 */

const frame = (id: string, attrs = "") => `
  <div class="sk-window__positioner" style="position:static">
    <div id="${id}" class="sk-window__content" data-state="open" ${attrs} style="inline-size:220px;block-size:120px">
      <div class="sk-window__drag"><div class="sk-window__header"><h2 class="sk-window__title">${id}</h2></div></div>
      <div class="sk-window__body">Body</div>
    </div>
  </div>`;

const BUSY = "background: repeating-linear-gradient(45deg, #000 0 6px, #fff 6px 12px)";

async function mount(page: Page, html: string, hostStyle = "", hostAttrs: Record<string, string> = {}) {
  await page.evaluate(
    ({ html, hostStyle, hostAttrs }) => {
      document.getElementById("window-host")?.remove();
      const host = document.createElement("div");
      host.id = "window-host";
      host.style.cssText = `position:fixed;inset:0 auto auto 0;z-index:9999;padding:40px;display:flex;gap:40px;flex-wrap:wrap;background:var(--color-bg-canvas);${hostStyle}`;
      for (const [k, v] of Object.entries(hostAttrs)) host.setAttribute(k, v);
      host.innerHTML = html;
      document.body.append(host);
    },
    { html, hostStyle, hostAttrs },
  );
  await page.waitForTimeout(300);
}

async function read(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const cs = getComputedStyle(el);
    const header = getComputedStyle(el.querySelector(".sk-window__header")!);
    const ctx = document.createElement("canvas").getContext("2d")!;
    const alpha = (color: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      return ctx.getImageData(0, 0, 1, 1).data[3]! / 255;
    };
    return {
      shadow: cs.boxShadow,
      backdrop: cs.backdropFilter,
      bg: cs.backgroundColor,
      bgAlpha: alpha(cs.backgroundColor),
      sheen: cs.backgroundImage,
      headerBgAlpha: alpha(header.backgroundColor),
      headerBackdrop: header.backdropFilter,
      border: cs.borderTopColor,
      radius: cs.borderTopLeftRadius,
      headerBorder: header.borderBottomColor,
    };
  });
}

test.beforeEach(async ({ page }) => {
  await waitForStage(page);
});

test("plain is untouched: omitting appearance equals plain", async ({ page }) => {
  await mount(page, frame("implicit") + frame("explicit", 'data-appearance="plain"'));
  expect(await read(page, "#explicit")).toEqual(await read(page, "#implicit"));
});

test("legacy tactile markup has no slab: it renders the plain frame", async ({ page }) => {
  await mount(page, frame("plain") + frame("legacy", 'data-appearance="tactile"'));
  expect(await read(page, "#legacy")).toEqual(await read(page, "#plain"));
});

test("brutalist: black edge and header rule, hard offset halved behind, gone when maximized, mirrored in RTL", async ({ page }) => {
  await mount(
    page,
    frame("front", 'data-appearance="brutalist"') +
      frame("behind", 'data-appearance="brutalist" data-behind') +
      frame("max", 'data-appearance="brutalist" data-maximized'),
  );
  const front = await read(page, "#front");
  expect(front.shadow).toMatch(/8px 8px 0px/);
  expect(front.shadow).not.toContain("inset");
  expect(front.border).toBe(front.headerBorder);
  expect((await read(page, "#behind")).shadow).toMatch(/4px 4px 0px/);
  expect((await read(page, "#max")).shadow).toMatch(/0px 0px 0px/);

  await mount(page, frame("rtl", 'data-appearance="brutalist"'), "", { dir: "rtl" });
  expect((await read(page, "#rtl")).shadow).toMatch(/-8px 8px 0px/);
});

test("frosted: a see-through frame over a blurred backdrop, opaque under reduced transparency and high contrast", async ({ page }) => {
  await mount(page, frame("plain") + frame("frosted", 'data-appearance="frosted"'), BUSY);
  const frosted = await read(page, "#frosted");
  expect(frosted.backdrop).toMatch(/blur\(24px\)/);
  expect(frosted.bgAlpha).toBeLessThan(1);
  expect(frosted.bgAlpha).toBeGreaterThan(0.6);
  expect(frosted.shadow).toContain("inset");
  expect(frosted.sheen).toContain("linear-gradient");
  expect(frosted.headerBgAlpha).toBeLessThan(0.1);
  expect(frosted.headerBackdrop).toBe("none");

  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "reduce" }] });
  await page.waitForTimeout(300);
  const reduced = await read(page, "#frosted");
  expect(reduced.backdrop).toBe("none");
  const plain = await read(page, "#plain");
  expect(reduced.bg).toBe(plain.bg);
  expect(reduced.sheen).toBe("none");
  expect(reduced.border).toBe(plain.border);
  expect(reduced.headerBgAlpha).toBe(1);
  expect(reduced.headerBorder).toBe(plain.headerBorder);
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "" }] });

  await mount(page, frame("hc", 'data-appearance="frosted"'), BUSY, { "data-contrast": "high" });
  expect((await read(page, "#hc")).backdrop).toBe("none");
  expect((await read(page, "#hc")).bgAlpha).toBe(1);
});

test("frosted keeps depth behind another window and removes the header divider when minimized", async ({ page }) => {
  await mount(page, frame("front", 'data-appearance="frosted"') +
    frame("behind", 'data-appearance="frosted" data-behind') +
    frame("min", 'data-appearance="frosted" data-minimized'), BUSY);
  const front = await read(page, "#front");
  const behind = await read(page, "#behind");
  expect(behind.shadow).not.toBe(front.shadow);
  expect(behind.shadow).toContain("inset");
  expect(behind.bg).toBe(front.bg);
  expect((await read(page, "#min")).headerBorder).toBe("rgba(0, 0, 0, 0)");
});

test("frosted uses a denser glass tint in dark mode", async ({ page }) => {
  await mount(page, frame("glass", 'data-appearance="frosted"'), BUSY);
  await page.locator("#window-host").evaluate(el => { el.style.colorScheme = "light"; });
  const light = await read(page, "#glass");
  await page.locator("#window-host").evaluate(el => { el.style.colorScheme = "dark"; });
  const dark = await read(page, "#glass");
  expect(light.bgAlpha).toBeCloseTo(0.68, 2);
  expect(dark.bgAlpha).toBeCloseTo(0.76, 2);
  expect(dark.headerBgAlpha).toBeLessThan(0.1);
});

test("radius stays the window's own in every appearance", async ({ page }) => {
  await mount(page, ["plain", "brutalist", "frosted"].map((a) => frame(a, `data-appearance="${a}"`)).join(""));
  const plain = await read(page, "#plain");
  for (const id of ["#brutalist", "#frosted"]) expect((await read(page, id)).radius, id).toBe(plain.radius);
});

test("forced colors: every appearance falls back to the system frame", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await mount(page, ["plain", "brutalist", "frosted"].map((a) => frame(a, `data-appearance="${a}"`)).join(""), BUSY);
  for (const id of ["#plain", "#brutalist", "#frosted"]) {
    const r = await read(page, id);
    expect(r.shadow, id).toBe("none");
    expect(r.backdrop, id).toBe("none");
    expect(r.bgAlpha, id).toBe(1);
  }
  await page.emulateMedia({ forcedColors: null });
});
