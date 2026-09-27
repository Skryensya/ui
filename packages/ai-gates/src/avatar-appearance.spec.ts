import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * AVATAR BRUTALIST, measured on the real stylesheet: a black edge and a hard offset scaled to the
 * disc, the same footprint as plain, and inside a group the construction instead of the ring.
 */

async function mount(page: Page, html: string, hostAttrs: Record<string, string> = {}): Promise<void> {
  await page.evaluate(
    ({ html, hostAttrs }) => {
      document.getElementById("avatar-host")?.remove();
      const host = document.createElement("div");
      host.id = "avatar-host";
      host.style.cssText = "position:fixed;inset:0 auto auto 0;z-index:9999;padding:40px;display:flex;gap:24px;align-items:center;background:var(--color-bg-surface)";
      for (const [name, value] of Object.entries(hostAttrs)) host.setAttribute(name, value);
      host.innerHTML = html;
      document.body.append(host);
    },
    { html, hostAttrs },
  );
}

async function read(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { shadow: cs.boxShadow, border: cs.borderTopWidth, edge: cs.borderTopColor, radius: cs.borderTopLeftRadius, width: r.width, height: r.height };
  });
}

const disc = (id: string, attrs: string) =>
  `<span id="${id}" class="sk-avatar" role="img" aria-label="Ada Lovelace" ${attrs}><span class="sk-avatar__fallback" aria-hidden="true">AL</span></span>`;

test.beforeEach(async ({ page }) => {
  await waitForStage(page);
});

test("brutalist draws a black edge and a hard offset, at plain's exact footprint", async ({ page }) => {
  await mount(page, disc("plain", 'data-size="md"') + disc("probe", 'data-size="md" data-appearance="brutalist"'));
  const plain = await read(page, "#plain");
  const probe = await read(page, "#probe");
  expect(probe.width).toBe(plain.width);
  expect(probe.height).toBe(plain.height);
  expect(probe.radius).toBe(plain.radius);
  expect(probe.border).toBe("1px");
  expect(probe.shadow).toMatch(/3px 3px 0px/);
  const edge = await page.locator("#probe").evaluate((el) => {
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.fillStyle = getComputedStyle(el).borderTopColor;
    ctx.fillRect(0, 0, 1, 1);
    return Array.from(ctx.getImageData(0, 0, 1, 1).data);
  });
  expect(Math.max(edge[0]!, edge[1]!, edge[2]!)).toBeLessThan(13);
  expect(plain.shadow).toBe("none");
});

test("the offset scales with the disc", async ({ page }) => {
  await mount(page, (["sm", "md", "lg", "xl"] as const).map((size) => disc(`a-${size}`, `data-size="${size}" data-appearance="brutalist"`)).join(""));
  const offsets = [];
  for (const size of ["sm", "md", "lg", "xl"]) offsets.push(Number.parseFloat((await read(page, `#a-${size}`)).shadow.match(/(-?\d+)px/)![1]!));
  expect(offsets).toEqual([2, 3, 4, 5]);
});

test("an image avatar keeps the edge visible over the photo", async ({ page }) => {
  await mount(
    page,
    `<span id="photo" class="sk-avatar" data-appearance="brutalist"><span class="sk-image-frame" data-aspect="1/1" data-fit="cover" data-radius="pill"><img class="sk-image-frame__media" alt="Ada" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='4' height='4'><rect width='4' height='4' fill='%23e33'/></svg>"></span></span>`,
  );
  const photo = await read(page, "#photo");
  const frame = await page.locator("#photo .sk-image-frame").boundingBox();
  const host = await page.locator("#photo").boundingBox();
  // The frame sits inside the border, so the black edge is never painted over by the image.
  expect(frame!.width).toBeLessThan(host!.width);
  expect(photo.border).toBe("1px");
});

test("in a group the construction replaces the ring, and the +N chip follows the stack", async ({ page }) => {
  await mount(
    page,
    `<div class="sk-avatar-group" role="group">${disc("g1", 'data-appearance="brutalist"')}${disc("g2", 'data-appearance="brutalist"')}<span id="more" class="sk-avatar-group__overflow">+3</span></div>` +
      `<div class="sk-avatar-group" role="group">${disc("p1", "")}<span id="pmore" class="sk-avatar-group__overflow">+3</span></div>`,
  );
  for (const id of ["#g1", "#g2", "#more"]) {
    const r = await read(page, id);
    expect(r.shadow, id).toMatch(/3px 3px 0px/);
    expect(r.shadow, id).not.toMatch(/0px 0px 0px 2px/);
    expect(r.border, id).toBe("1px");
  }
  // A plain group keeps its surface ring, chip included.
  expect((await read(page, "#p1")).shadow).toMatch(/0px 0px 0px 2px/);
  expect((await read(page, "#pmore")).shadow).toMatch(/0px 0px 0px 2px/);
});

test("RTL mirrors the offset", async ({ page }) => {
  await mount(page, disc("rtl", 'data-appearance="brutalist"'), { dir: "rtl" });
  expect((await read(page, "#rtl")).shadow).toMatch(/-3px 3px 0px/);
});

test("forced colors keep the boundary and drop the offset", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await mount(page, disc("probe", 'data-appearance="brutalist"'));
  const r = await read(page, "#probe");
  expect(r.shadow).toBe("none");
  expect(r.border).toBe("1px");
  await page.emulateMedia({ forcedColors: null });
});
