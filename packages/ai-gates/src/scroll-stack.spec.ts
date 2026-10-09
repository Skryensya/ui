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

async function mount(page: Page, rootStyle = ""): Promise<void> {
  await page.evaluate(
    ({ id, box, rootStyle }) => {
      document.getElementById(id)?.remove();
      const host = document.createElement("div");
      host.id = id;
      host.style.cssText = `position:fixed;inset-block-start:0;inset-inline-start:0;inline-size:600px;block-size:${box}px;overflow:auto;container-type:size;z-index:9;background:#fff`;
      host.innerHTML = `
        <div class="sk-scroll-stack" style="${rootStyle}">
          <div class="sk-scroll-stack__back"><button type="button" id="${id}-back-button">Inside the back layer</button></div>
          <div class="sk-scroll-stack__front">
            <span class="sk-scroll-stack__runway" aria-hidden="true"></span>
            <div class="sk-scroll-stack__content" style="block-size:1200px"><p>The front layer</p><p>Second</p><p>Third</p></div>
          </div>
        </div>`;
      document.body.append(host);
    },
    { id: PROBE, box: BOX, rootStyle },
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

type Read = { reveal: number[]; position: string; visibility: string; backScale: number; contentScale: number; frontRadius: number; veil: number; animations: number };

async function read(page: Page): Promise<Read> {
  return page.evaluate((id) => {
    const q = (selector: string) => document.querySelector<HTMLElement>(`#${id} ${selector}`)!;
    const back = q(".sk-scroll-stack__back");
    const front = q(".sk-scroll-stack__front");
    const content = q(".sk-scroll-stack__content");
    /* `scale` is "none" when nothing sets it, and "0.97 0.97" or "0.97" when something does: the first number is the factor. */
    const factor = (value: string) => (value === "none" ? 1 : Number.parseFloat(value));
    const reveal = Array.from(document.querySelectorAll<HTMLElement>(`#${id} .sk-scroll-stack__content > *`)).map((el) => Number.parseFloat(getComputedStyle(el).opacity));
    return {
      reveal,
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
    expect(now.contentScale).toBeCloseTo(1.1, 2);
    expect(now.frontRadius).toBeGreaterThan(0);
  });

  test("halfway through the front layer's rise, both are partway", async ({ page }) => {
    await scrollTo(page, BOX / 2);
    const now = await read(page);
    expect(now.backScale).toBeLessThan(1);
    expect(now.backScale).toBeGreaterThan(0.9);
    expect(now.veil).toBeGreaterThan(0);
    expect(now.veil).toBeLessThan(0.45);
    expect(now.contentScale).toBeGreaterThan(1);
    expect(now.contentScale).toBeLessThan(1.1);
    expect(now.visibility).toBe("visible");
  });

  test("once the front layer has docked: the back is fully receded, hidden from the keyboard, and the content has settled", async ({ page }) => {
    await scrollTo(page, BOX + 60);
    const now = await read(page);
    expect(now.backScale).toBeCloseTo(0.9, 3);
    expect(now.veil).toBeCloseTo(0.45, 3);
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

  test("the front layer's children arrive as it rises, each after the one before, and are whole once docked", async ({ page }) => {
    await scrollTo(page, 0);
    expect((await read(page)).reveal).toEqual([0, 0, 0]);
    await scrollTo(page, BOX * 0.5);
    const partway = (await read(page)).reveal;
    expect(partway[0]!).toBeGreaterThan(0);
    expect(partway[0]!).toBeGreaterThanOrEqual(partway[1]!);
    expect(partway[1]!).toBeGreaterThanOrEqual(partway[2]!);
    expect(partway[2]!).toBeLessThan(1);
    await scrollTo(page, BOX + 60);
    expect((await read(page)).reveal).toEqual([1, 1, 1]);
  });

  test("a stack inside the front layer is there the moment the outer one docks, and its own front layer is already rising", async ({ page }) => {
    await page.evaluate(
      ({ id }) => {
        const content = document.querySelector(`#${id} .sk-scroll-stack__content`)!;
        content.removeAttribute("style");
        content.innerHTML = `
          <div class="sk-scroll-stack" id="${id}-inner">
            <div class="sk-scroll-stack__back" style="min-block-size:100cqh">Inner back</div>
            <div class="sk-scroll-stack__front">
              <span class="sk-scroll-stack__runway" aria-hidden="true"></span>
              <div class="sk-scroll-stack__content" style="block-size:900px">Inner front</div>
            </div>
          </div>`;
      },
      { id: PROBE },
    );
    await scrollTo(page, BOX);
    const docked = await page.evaluate((id) => {
      const inner = document.getElementById(`${id}-inner`)!;
      const box = document.getElementById(id)!;
      const back = inner.querySelector(".sk-scroll-stack__back")!;
      const front = inner.querySelector(":scope > .sk-scroll-stack__front")!;
      return {
        opacity: Number.parseFloat(getComputedStyle(inner).opacity),
        shift: getComputedStyle(inner).translate,
        backTop: Math.round(back.getBoundingClientRect().top - box.getBoundingClientRect().top),
        frontTop: Math.round(front.getBoundingClientRect().top - box.getBoundingClientRect().top),
      };
    }, PROBE);
    expect(docked.opacity).toBe(1);
    expect(docked.shift).toBe("none");
    expect(docked.backTop).toBe(0);
    /* Its own front layer is exactly one box below: it starts rising on the very next pixel, with no dead scroll. */
    expect(docked.frontTop).toBe(BOX);
    await scrollTo(page, BOX + 100);
    const rising = await page.evaluate((id) => {
      const box = document.getElementById(id)!;
      const front = document.getElementById(`${id}-inner`)!.querySelector(":scope > .sk-scroll-stack__front")!;
      return Math.round(front.getBoundingClientRect().top - box.getBoundingClientRect().top);
    }, PROBE);
    expect(rising).toBe(BOX - 100);
  });

  test("scrolling back up undoes it all", async ({ page }) => {
    await scrollTo(page, BOX + 60);
    await scrollTo(page, 0);
    const now = await read(page);
    expect(now.backScale).toBeCloseTo(1, 3);
    expect(now.visibility).toBe("visible");
    expect(now.contentScale).toBeCloseTo(1.1, 2);
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
    expect(now.reveal).toEqual([1, 1, 1]);
  });

  test("with an offset, the back layer is held under it and the front layer docks right below it", async ({ page }) => {
    await mount(page, "--sk-scroll-stack-offset: 48px");
    /* The stack starts at the top of the box and the back layer is a box tall, so the back layer is the box less the held line, so the front layer starts 352px down and docks at 48px after 304px of scroll. */
    await scrollTo(page, 304 + 20);
    const docked = await read(page);
    expect(docked.backScale).toBeCloseTo(0.9, 3);
    expect(docked.visibility).toBe("hidden");
    /* Under a held line too: once docked the corners are square, unless a page asks to keep them with `front-docked-radius`. */
    expect(docked.frontRadius).toBeCloseTo(0, 3);
    const frontTop = await page.evaluate((id) => {
      const box = document.getElementById(id)!;
      const front = box.querySelector(".sk-scroll-stack__front")!;
      return Math.round(front.getBoundingClientRect().top - box.getBoundingClientRect().top);
    }, PROBE);
    expect(frontTop).toBeLessThanOrEqual(48);
    /* Before it docks, the back layer is still there, held at the offset and not at the top of the box. */
    await scrollTo(page, 120);
    const held = await page.evaluate((id) => {
      const box = document.getElementById(id)!;
      const back = box.querySelector(".sk-scroll-stack__back")!;
      return Math.round(back.getBoundingClientRect().top - box.getBoundingClientRect().top);
    }, PROBE);
    expect(held).toBeGreaterThanOrEqual(47);
    expect((await read(page)).visibility).toBe("visible");
  });
});
