import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * BOX APPEARANCE, measured on the real stylesheet: brutalist draws the black edge and hard offset,
 * frosted is the see-through sheet with an opaque baseline. A Box is never pressed, so neither moves.
 */

const BUSY =
  "background: repeating-linear-gradient(45deg, #000 0 6px, #fff 6px 12px), linear-gradient(90deg, #e33, #33e);background-blend-mode: difference";

async function mount(page: Page, html: string, hostStyle = "", hostAttrs: Record<string, string> = {}): Promise<void> {
  await page.evaluate(
    ({ html, hostStyle, hostAttrs }) => {
      document.getElementById("box-host")?.remove();
      const host = document.createElement("div");
      host.id = "box-host";
      host.style.cssText = `position:fixed;inset:0 auto auto 0;z-index:9999;padding:40px;display:flex;gap:24px;align-items:start;${hostStyle}`;
      for (const [name, value] of Object.entries(hostAttrs)) host.setAttribute(name, value);
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
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.fillStyle = cs.backgroundColor;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
    return {
      shadow: cs.boxShadow,
      bg: cs.backgroundColor,
      bgAlpha: a! / 255,
      backdrop: cs.backdropFilter,
      border: cs.borderTopColor,
      borderWidth: cs.borderTopWidth,
      radius: cs.borderTopLeftRadius,
      padding: cs.paddingTop,
      rgb: [r, g, b],
    };
  });
}

const box = (id: string, attrs: string) => `<div id="${id}" class="sk-box" data-padding="md" ${attrs}>Content</div>`;

test.beforeEach(async ({ page }) => {
  await waitForStage(page);
});

test("plain Box is untouched: omitting appearance equals plain", async ({ page }) => {
  await mount(page, box("implicit", 'data-surface="raised"') + box("explicit", 'data-surface="raised" data-appearance="plain"'));
  expect(await read(page, "#explicit")).toEqual(await read(page, "#implicit"));
});

test("brutalist: black edge, hard zero-blur offset toward block-end and inline-end, mirrored in RTL", async ({ page }) => {
  await mount(page, box("probe", 'data-surface="surface" data-appearance="brutalist"') + box("bare", 'data-appearance="brutalist"'));
  for (const id of ["#probe", "#bare"]) {
    const probe = await read(page, id);
    expect(probe.borderWidth, id).toBe("1px");
    expect(probe.shadow, id).toMatch(/5px 5px 0px/);
    expect(probe.shadow, id).not.toContain("inset");
  }
  const edge = await page.locator("#probe").evaluate((el) => {
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.fillStyle = getComputedStyle(el).borderTopColor;
    ctx.fillRect(0, 0, 1, 1);
    return Array.from(ctx.getImageData(0, 0, 1, 1).data);
  });
  expect(Math.max(edge[0]!, edge[1]!, edge[2]!)).toBeLessThan(13);

  await mount(page, box("rtl", 'data-appearance="brutalist"'), "", { dir: "rtl" });
  expect((await read(page, "#rtl")).shadow).toMatch(/-5px 5px 0px/);
});

test("frosted: a see-through sheet over a blurred backdrop, tinted with the Box's surface", async ({ page }) => {
  await mount(
    page,
    box("plain", 'data-surface="raised"') + box("frosted", 'data-surface="raised" data-appearance="frosted"') + box("none", 'data-appearance="frosted"'),
    BUSY,
  );
  const frosted = await read(page, "#frosted");
  expect(frosted.backdrop).toMatch(/blur\(16px\).*saturate\(1\.5\)/);
  expect(frosted.bgAlpha).toBeGreaterThan(0.5);
  expect(frosted.bgAlpha).toBeLessThan(1);
  expect(frosted.shadow).toContain("inset");
  // surface: none still gets a sheet, the page's surface, not a blur with nothing tinting it.
  expect((await read(page, "#none")).bgAlpha).toBeGreaterThan(0.5);
});

test("frosted falls back to an opaque surface under reduced transparency and high contrast", async ({ page }) => {
  await mount(page, box("plain", 'data-surface="raised"') + box("frosted", 'data-surface="raised" data-appearance="frosted"'), BUSY);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "reduce" }] });
  await page.waitForTimeout(300);
  const reduced = await read(page, "#frosted");
  expect(reduced.backdrop).toBe("none");
  expect(reduced.bgAlpha).toBe(1);
  expect(reduced.bg).toBe((await read(page, "#plain")).bg);
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "" }] });

  await mount(page, box("hc", 'data-surface="raised" data-appearance="frosted"'), BUSY, { "data-contrast": "high" });
  const hc = await read(page, "#hc");
  expect(hc.backdrop).toBe("none");
  expect(hc.bgAlpha).toBe(1);
});

test("radius and padding stay the Box's own", async ({ page }) => {
  for (const multiplier of ["0", "2"]) {
    await mount(page, ["plain", "brutalist", "frosted"].map((a) => box(a, `data-surface="surface" data-appearance="${a}"`)).join(""));
    await page.evaluate((m) => document.documentElement.style.setProperty("--radius-multiplier", m), multiplier);
    const plain = await read(page, "#plain");
    for (const id of ["#brutalist", "#frosted"]) {
      const r = await read(page, id);
      expect(r.radius, `${id} ${multiplier}`).toBe(plain.radius);
      expect(r.padding, id).toBe(plain.padding);
    }
  }
  await page.evaluate(() => document.documentElement.style.removeProperty("--radius-multiplier"));
});

test("forced colors: no offset, no blur, an opaque face and a system boundary", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await mount(page, box("brutalist", 'data-appearance="brutalist"') + box("frosted", 'data-surface="raised" data-appearance="frosted"'), BUSY);
  for (const id of ["#brutalist", "#frosted"]) {
    const r = await read(page, id);
    expect(r.shadow, id).toBe("none");
    expect(r.backdrop, id).toBe("none");
    expect(r.bgAlpha, id).toBe(1);
    expect(r.borderWidth, id).toBe("1px");
  }
  await page.emulateMedia({ forcedColors: null });
});
