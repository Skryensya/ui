import { expect, test, type Locator, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * MAGNIFIER, IN A REAL BROWSER, WITH A REAL POINTER. What no DOM comparison can see: that the lens comes up over the picture and
 * sits on the pointer, that it is whole up to the very corner and shrinks only once the pointer is off the picture, that it lets
 * go a short way past the edge and closes on its own when the pointer stays off, that a held press grows it, that reduced motion
 * keeps it from growing in, and that on touch a swipe still scrolls while a held finger magnifies.
 *
 * It drives the canonical tree the stage already renders (`magnifier/image-frame`), in BOTH bindings: the React half and the
 * vanilla half share one view (`magnifier-view.ts`), so a difference here is a binding wiring it differently. What the glass
 * draws is not asserted: the stage's browser may have no WebGPU, and the 2D fallback is then what runs. The renderer is only
 * asserted to be one of the two.
 */

const BINDINGS = ["react", "vanilla"] as const;

/* The stage keeps other cases' overlays open; they would take the pointer meant for the picture. */
const clearOverlays = (page: Page) =>
  page.evaluate(() => {
    for (const dialog of document.querySelectorAll<HTMLDialogElement>("dialog[open]")) dialog.close();
    for (const overlay of document.querySelectorAll<HTMLElement>("dialog, [popover], .sk-vaul, .sk-drawer")) overlay.style.pointerEvents = "none";
  });

async function magnifier(page: Page, binding: (typeof BINDINGS)[number]): Promise<{ root: Locator; picture: Locator; lens: Locator }> {
  await clearOverlays(page);
  const root = page.locator(`[data-binding="${binding}"] [data-sk-magnifier]`).first();
  await root.scrollIntoViewIfNeeded();
  /* A picture big enough to move over, whatever width the stage gives it. */
  await root.evaluate((el) => {
    el.style.inlineSize = "480px";
  });
  const picture = root.locator("img").first();
  await expect.poll(() => picture.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  return { root, picture, lens: root.locator(":scope > canvas.sk-magnifier__lens") };
}

const box = async (locator: Locator) => (await locator.boundingBox())!;
const active = (root: Locator) => root.evaluate((el) => el.hasAttribute("data-active"));
const scale = (lens: Locator) => lens.evaluate((el) => Number.parseFloat((el as HTMLElement).style.scale || "0"));
/** The lens's centre on screen: its box is the drawn one, translate and scale included. */
const centre = async (lens: Locator) => {
  const b = await box(lens);
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
};

/** Bring the lens up at a point of the picture, and let its springs settle there. */
async function hover(page: Page, picture: Locator, fx: number, fy: number) {
  const b = await box(picture);
  const at = { x: b.x + b.width * fx, y: b.y + b.height * fy };
  await page.mouse.move(at.x - 20, at.y - 20);
  await page.mouse.move(at.x, at.y, { steps: 4 });
  await page.waitForTimeout(600);
  return at;
}

test.describe("Magnifier", () => {
  test.beforeEach(async ({ page }) => {
    await waitForStage(page);
  });

  for (const binding of BINDINGS) {
    test.describe(binding, () => {
      test("comes up over the picture, on the pointer, out of the reading order", async ({ page }) => {
        const { root, picture, lens } = await magnifier(page, binding);
        expect(await active(root)).toBe(false);
        const at = await hover(page, picture, 0.5, 0.5);

        expect(await active(root)).toBe(true);
        expect(await lens.evaluate((el) => getComputedStyle(el).visibility)).toBe("visible");
        expect(["webgpu", "2d"]).toContain(await root.getAttribute("data-renderer"));
        const c = await centre(lens);
        expect(Math.abs(c.x - at.x)).toBeLessThan(2);
        expect(Math.abs(c.y - at.y)).toBeLessThan(2);
        expect(await scale(lens)).toBeCloseTo(1, 2);

        /* The lens adds nothing the picture does not already say, and takes no focus or pointer of its own. */
        expect(await lens.getAttribute("aria-hidden")).toBe("true");
        expect(await lens.evaluate((el) => [el.tabIndex, getComputedStyle(el).pointerEvents])).toEqual([-1, "none"]);
        expect(await picture.getAttribute("alt")).toBeTruthy();
      });

      test("is whole at the very corner, shrinks only off the picture, and lets go a short way past", async ({ page }) => {
        const { root, picture, lens } = await magnifier(page, binding);
        const b = await box(picture);
        await hover(page, picture, 0.6, 0.6);
        await page.mouse.move(b.x + b.width - 1, b.y + b.height - 1, { steps: 6 });
        await page.waitForTimeout(500);
        expect(await scale(lens)).toBeCloseTo(1, 2);

        /*
         * Off the picture the lens shrinks, and half a second later closes on its own: an in-between state racing a timer. Read
         * from here, each call a round trip, a loaded machine sees it already closed. So the page records the lens's size
         * every frame from the moment the pointer leaves, and the record is what is asserted.
         */
        await root.evaluate((el) => {
          const lens = el.querySelector<HTMLElement>(":scope > .sk-magnifier__lens")!;
          const sizes: number[] = [];
          (el as HTMLElement & { __sizes?: number[] }).__sizes = sizes;
          const until = performance.now() + 3000;
          const sample = () => {
            if (el.hasAttribute("data-active")) sizes.push(Number.parseFloat(lens.style.scale || "0"));
            if (performance.now() < until) requestAnimationFrame(sample);
          };
          requestAnimationFrame(sample);
        });
        await page.mouse.move(b.x + b.width + 12, b.y + b.height / 2);
        await expect.poll(() => active(root), { timeout: 3_000 }).toBe(false);
        const sizes = await root.evaluate((el) => (el as HTMLElement & { __sizes?: number[] }).__sizes ?? []);
        /* It shrank past the edge (not straight from whole to gone), and it closed. */
        expect(sizes.some((size) => size > 0.2 && size < 0.99)).toBe(true);
      });

      test("closes on its own when the pointer stays off the picture, even within reach of it", async ({ page }) => {
        const { root, picture } = await magnifier(page, binding);
        const b = await box(picture);
        await hover(page, picture, 0.8, 0.5);
        await page.mouse.move(b.x + b.width + 6, b.y + b.height / 2, { steps: 2 });
        await page.waitForTimeout(150);
        expect(await active(root)).toBe(true);
        await expect.poll(() => active(root), { timeout: 2_000 }).toBe(false);
      });

      test("grows while the mouse button is held, and comes back when it is let go", async ({ page }) => {
        const { lens, picture } = await magnifier(page, binding);
        await hover(page, picture, 0.5, 0.5);
        const resting = (await box(lens)).width;

        await page.mouse.down();
        await expect.poll(async () => (await box(lens)).width / resting).toBeGreaterThan(1.45);
        await page.mouse.up();
        await expect.poll(async () => Math.abs((await box(lens)).width - resting)).toBeLessThan(2);
      });

      test("appears whole, without growing in, when motion is reduced", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        const { root, picture, lens } = await magnifier(page, binding);
        const b = await box(picture);
        await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
        await expect.poll(() => active(root)).toBe(true);
        /* The first drawn frame is already full size: no spring runs. */
        await expect.poll(() => scale(lens), { timeout: 1_000 }).toBeCloseTo(1, 2);
      });

      test("on touch, a swipe is left to the page and a held finger magnifies", async ({ browser }) => {
        const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 600, height: 900 } });
        const page = await context.newPage();
        await waitForStage(page);
        const { root, picture } = await magnifier(page, binding);
        const cdp = await context.newCDPSession(page);
        const touch = (type: "touchStart" | "touchMove" | "touchEnd", x = 0, y = 0) =>
          cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y }] });
        const b = await box(picture);
        const cx = b.x + b.width / 2;
        const cy = b.y + b.height / 2;

        await touch("touchStart", cx, cy);
        for (let i = 1; i <= 6; i++) await touch("touchMove", cx, cy - i * 15);
        await touch("touchEnd");
        await page.waitForTimeout(400);
        expect(await active(root)).toBe(false);

        const c = await box(picture);
        await touch("touchStart", c.x + c.width / 2, c.y + c.height / 2);
        await expect.poll(() => active(root)).toBe(true);
        await touch("touchEnd");
        await expect.poll(() => active(root)).toBe(false);
        await context.close();
      });
    });
  }
});
