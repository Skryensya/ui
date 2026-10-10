import { expect, test, type Locator, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * COMPARE SLIDER, AND THE THUMB, IN A REAL BROWSER, WITH A REAL POINTER. What no DOM comparison can see: that a press and a drag
 * put the divider where the pointer is (and keep it in the box when the pointer leaves), that the clip over the after layer
 * and the line follow it, that the keys move it, that a right-to-left page measures from the other edge, and that the
 * six-dot thumb is always on screen in Compare Slider and only comes up in Resizable when the pointer finds the bar.
 *
 * It drives the canonical trees the stage already renders, in BOTH bindings: the React half and the vanilla half, which
 * are one markup and two implementations of the same gesture.
 */

const BINDINGS = ["react", "vanilla"] as const;

/*
 * The stage keeps other cases' overlays open (a drawer, a dialog): they would take a press meant for the component under test.
 * An open MODAL dialog is worse than in the way: it makes the rest of the page inert, and an inert element never matches `:hover`
 * or takes focus, so a hover test sees nothing happen. They are closed first.
 */
const clearOverlays = (page: Page) =>
  page.evaluate(() => {
    for (const dialog of document.querySelectorAll<HTMLDialogElement>("dialog[open]")) dialog.close();
    for (const overlay of document.querySelectorAll<HTMLElement>("dialog, [popover], .sk-vaul, .sk-drawer")) overlay.style.pointerEvents = "none";
  });

async function compare(page: Page, binding: (typeof BINDINGS)[number], direction: "horizontal" | "vertical"): Promise<Locator> {
  await clearOverlays(page);
  const root = page.locator(`[data-binding="${binding}"] .sk-compare-slider[data-direction="${direction}"]`).first();
  await root.scrollIntoViewIfNeeded();
  /* Give the box room to be pressed in, whatever its layers hold. */
  await root.evaluate((el) => {
    el.style.inlineSize = "400px";
    el.style.blockSize = "200px";
  });
  return root;
}

const position = async (root: Locator): Promise<number> =>
  Number(await root.locator(":scope > .sk-compare-slider__handle").getAttribute("aria-valuenow"));

async function point(root: Locator, fx: number, fy: number): Promise<{ x: number; y: number }> {
  const box = (await root.boundingBox())!;
  return { x: box.x + box.width * fx, y: box.y + box.height * fy };
}

test.describe("CompareSlider", () => {
  test.beforeEach(async ({ page }) => {
    await waitForStage(page);
  });

  for (const binding of BINDINGS) {
    test.describe(binding, () => {
      test("a press puts the divider where the pointer is, and the clip and the line follow", async ({ page }) => {
        const root = await compare(page, binding, "horizontal");
        const at = await point(root, 0.25, 0.5);
        await page.mouse.move(at.x, at.y);
        await page.mouse.down();
        await page.mouse.up();
        expect(await position(root)).toBeGreaterThanOrEqual(24);
        expect(await position(root)).toBeLessThanOrEqual(26);
        const geometry = await root.evaluate((el) => {
          const box = el.getBoundingClientRect();
          const handle = el.querySelector(".sk-compare-slider__handle")!.getBoundingClientRect();
          const after = getComputedStyle(el.querySelector(".sk-compare-slider__after")!).clipPath;
          return { handleAt: ((handle.left - box.left) / box.width) * 100, after };
        });
        expect(geometry.handleAt).toBeGreaterThan(24);
        expect(geometry.handleAt).toBeLessThan(26);
        expect(geometry.after).toMatch(/^inset\(0px 0px 0px 2[45]/);
      });

      test("a drag follows the pointer, and stays in the box when the pointer leaves it", async ({ page }) => {
        const root = await compare(page, binding, "horizontal");
        const from = await point(root, 0.5, 0.5);
        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        const mid = await point(root, 0.8, 0.5);
        await page.mouse.move(mid.x, mid.y, { steps: 4 });
        expect(await position(root)).toBeGreaterThanOrEqual(79);
        expect(await position(root)).toBeLessThanOrEqual(81);
        await expect(root).toHaveAttribute("data-dragging", "");
        const beyond = await point(root, 2, 0.5);
        await page.mouse.move(beyond.x, beyond.y, { steps: 4 });
        expect(await position(root)).toBe(100);
        await page.mouse.up();
        await expect(root).not.toHaveAttribute("data-dragging", "");
      });

      test("the keys move the divider, and a press puts the focus on it", async ({ page }) => {
        const root = await compare(page, binding, "horizontal");
        const at = await point(root, 0.5, 0.5);
        await page.mouse.click(at.x, at.y);
        const handle = root.locator(":scope > .sk-compare-slider__handle");
        await expect(handle).toBeFocused();
        await page.keyboard.press("ArrowRight");
        const start = await position(root);
        await page.keyboard.press("Shift+ArrowLeft");
        expect(await position(root)).toBe(start - 10);
        await page.keyboard.press("End");
        expect(await position(root)).toBe(100);
        await page.keyboard.press("Home");
        expect(await position(root)).toBe(0);
      });

      test("stacked layers measure the vertical axis", async ({ page }) => {
        const root = await compare(page, binding, "vertical");
        const at = await point(root, 0.5, 0.75);
        await page.mouse.click(at.x, at.y);
        expect(await position(root)).toBeGreaterThanOrEqual(74);
        expect(await position(root)).toBeLessThanOrEqual(76);
        const after = await root.locator(":scope > .sk-compare-slider__after").evaluate((el) => getComputedStyle(el).clipPath);
        expect(after).toMatch(/^inset\(7[45]/);
      });

      test("in a right-to-left page the before layer is on the right, and the position is measured from there", async ({ page }) => {
        const root = await compare(page, binding, "horizontal");
        await root.evaluate((el) => el.setAttribute("dir", "rtl"));
        const at = await point(root, 0.9, 0.5);
        await page.mouse.click(at.x, at.y);
        /* 10% from the right edge: the before layer shows only that far. */
        expect(await position(root)).toBeGreaterThanOrEqual(9);
        expect(await position(root)).toBeLessThanOrEqual(11);
        const handleAt = await root.evaluate((el) => {
          const box = el.getBoundingClientRect();
          const handle = el.querySelector(".sk-compare-slider__handle")!.getBoundingClientRect();
          return ((handle.left - box.left) / box.width) * 100;
        });
        expect(handleAt).toBeGreaterThan(88);
        expect(handleAt).toBeLessThan(92);
      });

      test("the thumb is always on screen", async ({ page }) => {
        const root = await compare(page, binding, "horizontal");
        const grip = root.locator(".sk-compare-slider__grip");
        await page.mouse.move(0, 0);
        const style = await grip.evaluate((el) => {
          const s = getComputedStyle(el);
          return { opacity: s.opacity, scale: s.scale };
        });
        expect(Number(style.opacity)).toBe(1);
        expect(await grip.evaluate((el) => el.getBoundingClientRect().width)).toBeGreaterThan(8);
      });
    });
  }
});

test.describe("The thumb on a Resizable bar", () => {
  test.beforeEach(async ({ page }) => {
    await waitForStage(page);
  });

  for (const binding of BINDINGS) {
    test(`${binding}: not on screen at rest, comes up with the pointer and the keyboard`, async ({ page }) => {
      await clearOverlays(page);
      const handle = page.locator(`[data-binding="${binding}"] .sk-resizable__handle`).first();
      await handle.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      const grip = handle.locator(".sk-resizable__grip");
      const opacity = () => grip.evaluate((el) => Number(getComputedStyle(el).opacity));
      await expect.poll(opacity).toBe(0);
      const box = (await handle.boundingBox())!;
      await page.mouse.move(box.x, box.y + box.height / 2);
      await expect.poll(opacity).toBe(1);
      await page.mouse.move(0, 0);
      await expect.poll(opacity).toBe(0);
      await handle.focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Shift+Tab");
      await expect.poll(opacity).toBe(1);
    });
  }
});
