import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * SCROLL STACK, IN A REAL BROWSER, SCROLLING. The claims no DOM or accessibility comparison can see: that the back
 * layer recedes and the front layer settles AS A FUNCTION OF THE SCROLL POSITION, that the covered layer is gone for the
 * keyboard, and that a reader who asks for reduced motion gets none of it.
 *
 * Each probe is authored markup injected into the stage, which has every stylesheet loaded: a 400px scroll box that is a
 * size container (so the component measures it and not the window), holding a back layer that fills the box and a front
 * layer much taller than it. The front layer's top edge starts one box-height below the top, so its rise through the box
 * is exactly the first 400px of scroll: progress 0 at scrollTop 0, progress 1 at 400.
 */

const PROBE = "scroll-stack-probe";
const BOX = 400;

async function mount(page: Page): Promise<void> {
  await page.evaluate(
    ({ id, box }) => {
      document.getElementById(id)?.remove();
      const host = document.createElement("div");
      host.id = id;
      host.style.cssText = `position:fixed;inset-block-start:0;inset-inline-start:0;inline-size:600px;block-size:${box}px;overflow:auto;container-type:size;z-index:9;background:#fff`;
      host.innerHTML = `
        <div class="sk-scroll-stack">
          <div class="sk-scroll-stack__back"><button type="button" id="${id}-back-button">Inside the back layer</button></div>
          <div class="sk-scroll-stack__front">
            <span class="sk-scroll-stack__runway" aria-hidden="true"></span>
            <div class="sk-scroll-stack__content" style="block-size:1200px">The front layer</div>
          </div>
        </div>`;
      document.body.append(host);
    },
    { id: PROBE, box: BOX },
  );
}

/** Scroll the box and wait for two frames, which is what the browser needs to resolve a scroll-driven animation. */
async function scrollTo(page: Page, top: number): Promise<void> {
  await page.evaluate(
    ({ id, top }) =>
      new Promise<void>((resolve) => {
        document.getElementById(id)!.scrollTop = top;
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
    { id: PROBE, top },
  );
}

type Read = { position: string; visibility: string; backScale: number; contentScale: number; frontRadius: number; veil: number; animations: number };

async function read(page: Page): Promise<Read> {
  return page.evaluate((id) => {
    const q = (selector: string) => document.querySelector<HTMLElement>(`#${id} ${selector}`)!;
    const back = q(".sk-scroll-stack__back");
    const front = q(".sk-scroll-stack__front");
    const content = q(".sk-scroll-stack__content");
    /* `scale` is "none" when nothing sets it, and "0.97 0.97" or "0.97" when something does: the first number is the factor. */
    const factor = (value: string) => (value === "none" ? 1 : Number.parseFloat(value));
    return {
      position: getComputedStyle(back).position,
      visibility: getComputedStyle(back).visibility,
      backScale: factor(getComputedStyle(back).scale),
      contentScale: factor(getComputedStyle(content).scale),
      frontRadius: Number.parseFloat(getComputedStyle(front).borderStartStartRadius),
      veil: Number.parseFloat(getComputedStyle(back, "::after").opacity),
      animations: document.getAnimations().filter((a) => (a.effect as KeyframeEffect | null)?.target instanceof Element && (a.effect as KeyframeEffect).target!.closest(`#${id}`)).length,
    };
  }, PROBE);
}

test.describe("Scroll Stack", () => {
  test.beforeEach(async ({ page }) => {
    await waitForStage(page);
    await mount(page);
  });

  test("at rest the back layer is untouched and the front layer's content is a little zoomed in", async ({ page }) => {
    await scrollTo(page, 0);
    const now = await read(page);
    expect(now.position).toBe("sticky");
    expect(now.visibility).toBe("visible");
    expect(now.backScale).toBeCloseTo(1, 3);
    expect(now.veil).toBeCloseTo(0, 3);
    expect(now.contentScale).toBeCloseTo(1.06, 2);
    expect(now.frontRadius).toBeGreaterThan(0);
  });

  test("halfway through the front layer's rise, both are partway", async ({ page }) => {
    await scrollTo(page, BOX / 2);
    const now = await read(page);
    expect(now.backScale).toBeLessThan(1);
    expect(now.backScale).toBeGreaterThan(0.94);
    expect(now.veil).toBeGreaterThan(0);
    expect(now.veil).toBeLessThan(0.35);
    expect(now.contentScale).toBeGreaterThan(1);
    expect(now.contentScale).toBeLessThan(1.06);
    expect(now.visibility).toBe("visible");
  });

  test("once the front layer has docked: the back is fully receded, hidden from the keyboard, and the content has settled", async ({ page }) => {
    await scrollTo(page, BOX + 60);
    const now = await read(page);
    expect(now.backScale).toBeCloseTo(0.94, 3);
    expect(now.veil).toBeCloseTo(0.35, 3);
    expect(now.contentScale).toBeCloseTo(1, 3);
    expect(now.frontRadius).toBeCloseTo(0, 3);
    expect(now.visibility).toBe("hidden");
    /* Hidden, so a covered button cannot be reached: focusing it is refused. */
    const focused = await page.evaluate((id) => {
      const button = document.getElementById(`${id}-back-button`) as HTMLButtonElement;
      button.focus();
      return document.activeElement === button;
    }, PROBE);
    expect(focused).toBe(false);
  });

  test("scrolling back up undoes it all", async ({ page }) => {
    await scrollTo(page, BOX + 60);
    await scrollTo(page, 0);
    const now = await read(page);
    expect(now.backScale).toBeCloseTo(1, 3);
    expect(now.visibility).toBe("visible");
    expect(now.contentScale).toBeCloseTo(1.06, 2);
  });

  test("with reduced motion the two layers are plain blocks in normal flow", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await waitForStage(page);
    await mount(page);
    await scrollTo(page, BOX / 2);
    const now = await read(page);
    expect(now.position).not.toBe("sticky");
    expect(now.animations).toBe(0);
    expect(now.backScale).toBe(1);
    expect(now.contentScale).toBe(1);
    expect(now.visibility).toBe("visible");
  });
});
