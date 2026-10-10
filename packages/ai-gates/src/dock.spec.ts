import { test, expect, type Page } from "@playwright/test";
import { readComponentCss } from "./fixtures.js";

const css = readComponentCss("dock", import.meta.url);
const stateLayer = readComponentCss("../patterns/state-layer", import.meta.url);
const html = `<style>
  body { margin: 64px; }
  :root {
    --color-bg-surface: white; --color-bg-surface-sunken: #eee;
    --color-border-subtle: silver; --color-text-primary: black;
    --space-inline-xs: 4px; --space-inset-xs: 4px; --radius-surface: 16px;
    --radius-control: 8px; --size-control-lg: 40px; --size-touch-target: 44px;
    --motion-feedback-duration: 120ms; --motion-feedback-easing: ease;
    --motion-reveal-duration: 120ms; --motion-reveal-easing: cubic-bezier(0, 0, 0, 1);
    --motion-distance-md: 8px; --motion-distance-lg: 16px; --motion-press-scale: 0.98;
    --state-layer-color: currentColor; --state-layer-hover-opacity: .12;
    --state-layer-pressed-opacity: .2; --state-layer-focus-opacity: .16;
    --state-layer-disabled-opacity: 0; --state-layer-keyline-scale: 0px; --z-below: -1;
    --elevation-overlay: none;
  }
  ${stateLayer}
  ${css}
</style>
<div class="sk-dock" role="group" aria-label="Actions">
  ${["Search", "Notes", "Add", "Settings"].map(name => `<button class="sk-dock__item sk-interactive" type="button" aria-label="${name}" ${name === "Settings" ? "disabled" : ""}><span class="sk-dock__icon" aria-hidden="true">${name[0]}</span></button>`).join("")}
</div>`;

const matrix = (scale: number, lift: number) => `matrix(${scale}, 0, 0, ${scale}, 0, ${-lift})`;
const allLayers = (transform: string) => ({ background: transform, stateLayer: "none", icon: "none" });
const raised = matrix(1.3, 16);
const neighbor = matrix(1.06, 6);
const pressed = matrix(1.274, 8);
const paintedPose = (page: Page, name: string) => page.getByRole("button", { name }).evaluate(el => ({
  background: getComputedStyle(el).transform,
  stateLayer: getComputedStyle(el, "::before").transform,
  icon: getComputedStyle(el.querySelector("span")!).transform,
}));
const settles = (page: Page, name: string, transform: string) =>
  expect.poll(() => paintedPose(page, name)).toEqual(allLayers(transform));

async function enhance(page: Page) {
  await page.goto("/");
  await page.setContent(html);
  await page.locator(".sk-dock").evaluate(el => el.setAttribute("data-sk-dock", ""));
  await page.evaluate(async url => {
    const { mountDock } = await import(/* @vite-ignore */ url);
    mountDock(document);
  }, `/@fs${new URL("../../vanilla/src/components/dock.ts", import.meta.url).pathname}`);
  await expect(page.locator(".sk-dock")).toHaveAttribute("data-dock-motion", "");
}

test("moves the native hit area with its background, state layer and icon", async ({ page }) => {
  await page.setContent(html);
  const button = page.getByRole("button", { name: "Search" });
  const before = await button.boundingBox();
  expect(await button.evaluate(el => getComputedStyle(el).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  await button.hover();
  await settles(page, "Search", raised);
  const after = await button.boundingBox();
  expect(after!.width).toBeCloseTo(before!.width * 1.3, 3);
  expect(after!.height).toBeCloseTo(before!.height * 1.3, 3);
  expect(after!.y).toBeLessThan(before!.y);
  expect(before!.width).toBeGreaterThanOrEqual(44);
  expect(before!.height).toBeGreaterThanOrEqual(44);
});

test("keeps keyboard order native and omits the whole wave with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setContent(html);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Search" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Notes" })).toBeFocused();
  await page.getByRole("button", { name: "Search" }).hover();
  for (const name of ["Search", "Notes", "Add", "Settings"]) await settles(page, name, "none");
});

test("raises neighbors subtly without shrinking other items and returns to rest", async ({ page }) => {
  await page.setContent(html);
  await page.getByRole("button", { name: "Notes" }).hover();
  await settles(page, "Notes", raised);
  for (const name of ["Search", "Add"]) await settles(page, name, neighbor);
  await settles(page, "Settings", "none");
  await page.mouse.move(500, 200);
  for (const name of ["Search", "Notes", "Add"]) await settles(page, name, "none");
});

test("retargets the wave on direction changes and gives a subtle press response", async ({ page }) => {
  await page.setContent(html);
  for (const name of ["Search", "Add", "Notes"]) await page.getByRole("button", { name }).hover();
  await settles(page, "Notes", raised);
  await page.mouse.down();
  await settles(page, "Notes", pressed);
  await page.mouse.up();
  await settles(page, "Notes", raised);
});

test("disabled actions neither lift nor start a wave", async ({ page }) => {
  await page.setContent(html);
  await page.getByRole("button", { name: "Add" }).hover();
  await settles(page, "Add", raised);
  await settles(page, "Settings", "none");
  await page.getByRole("button", { name: "Settings" }).hover();
  await settles(page, "Add", "none");
});

test("allows consumers to adjust lift, magnification and item background", async ({ page }) => {
  await page.setContent(html);
  await page.locator(".sk-dock").evaluate(el => {
    (el as HTMLElement).style.setProperty("--sk-dock-lift", "12px");
    (el as HTMLElement).style.setProperty("--sk-dock-magnification", "1.4");
    (el as HTMLElement).style.setProperty("--sk-dock-item-bg", "rgb(200, 210, 220)");
  });
  await page.getByRole("button", { name: "Notes" }).hover();
  await settles(page, "Notes", matrix(1.4, 12));
  await settles(page, "Search", matrix(1.08, 4.5));
  expect(await page.getByRole("button", { name: "Notes" }).evaluate(el => getComputedStyle(el).backgroundColor)).toBe("rgb(200, 210, 220)");
});

test("Motion moves native controls, retargets, and resets immediately for reduced motion", async ({ page }) => {
  await enhance(page);
  await page.getByRole("button", { name: "Notes" }).hover();
  await settles(page, "Notes", raised);
  expect(await page.getByRole("button", { name: "Notes" }).evaluate(el => getComputedStyle(el).zIndex)).toBe("2");
  await page.getByRole("button", { name: "Add" }).hover();
  await settles(page, "Add", raised);
  expect(await page.getByRole("button", { name: "Add" }).evaluate(el => getComputedStyle(el).zIndex)).toBe("2");
  expect(await page.getByRole("button", { name: "Notes" }).evaluate(el => getComputedStyle(el).zIndex)).toBe("1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await settles(page, "Add", "none");
});

test("the raised region is clickable and a stationary pointer does not cause hover oscillation", async ({ page }) => {
  await enhance(page);
  const button = page.getByRole("button", { name: "Notes" });
  const original = (await button.boundingBox())!;
  await button.evaluate(el => {
    el.addEventListener("click", () => el.setAttribute("data-clicked", ""));
  });
  await page.mouse.move(original.x + original.width / 2, original.y + original.height - 2);
  await settles(page, "Notes", raised);
  // Let the spring settle while the pointer remains below the new, moving hit area.
  await page.waitForTimeout(600);
  await settles(page, "Notes", raised);
  const elevated = (await button.boundingBox())!;
  const x = elevated.x + elevated.width / 2;
  const y = elevated.y + 3;
  expect(y).toBeLessThan(original.y);
  expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest("button")?.getAttribute("aria-label"), { x, y })).toBe("Notes");
  expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest("button")?.getAttribute("aria-label"), { x, y: original.y + original.height - 2 })).not.toBe("Notes");
  await page.mouse.click(x, y);
  await expect(button).toHaveAttribute("data-clicked", "");
});

test("does not lift or magnify on touch", async ({ browser }) => {
  const context = await browser.newContext({ isMobile: true, hasTouch: true });
  try {
    const page = await context.newPage();
    await page.setContent(html);
    await page.getByRole("button", { name: "Search" }).tap();
    await settles(page, "Search", "none");
  } finally { await context.close(); }
});
