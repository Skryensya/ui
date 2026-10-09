import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * SCROLL EXPAND, IN A REAL BROWSER, SCROLLING. The claims no DOM comparison can see: that the container
 * opens AS A FUNCTION OF THE SCROLL POSITION, that the lead listens to the same clock (it lifts and fades with it), that the stage is held while that happens, and that a reader who asks for reduced motion gets none of it.
 *
 * The probe is a 400px scroll box that is a size container (so the component measures it and not the window). The track is
 * two boxes tall, so the opening is exactly the first 400px of scroll: progress 0 at scrollTop 0, 1 at 400.
 */

const PROBE = "scroll-expand-probe";
const BOX = 400;
const FULL = /^inset\(0(px|%)?( 0(px|%)?){0,3}\)$/;

async function mount(page: Page, direction = "expand"): Promise<void> {
  await page.evaluate(
    ({ id, box, direction }) => {
      document.getElementById(id)?.remove();
      const host = document.createElement("div");
      host.id = id;
      host.style.cssText = `position:fixed;inset-block-start:0;inset-inline-start:0;inline-size:600px;block-size:${box}px;overflow:auto;container-type:size;z-index:9;background:#fff`;
      host.innerHTML = `
        <div class="sk-scroll-expand" data-direction="${direction}">
          <div class="sk-scroll-expand__track">
            <span class="sk-scroll-expand__clock" aria-hidden="true"></span>
            <div class="sk-scroll-expand__stage">
              <div class="sk-scroll-expand__lead">
                <h2>Open wide</h2>
              </div>
              <div class="sk-scroll-expand__container">
                <div class="sk-scroll-expand__backdrop"><div style="background:#369"></div></div>
                <div class="sk-scroll-expand__reveal"><p>First</p><p>Second</p><p>Third</p></div>
              </div>
            </div>
          </div>
          <div class="sk-scroll-expand__after" style="block-size:600px">What follows</div>
        </div>`;
      document.body.append(host);
    },
    { id: PROBE, box: BOX, direction },
  );
}

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

type Read = { reveal: number[]; stagePosition: string; stageTop: number; clip: string; leadShift: number; fade: number; animations: number };

async function read(page: Page): Promise<Read> {
  return page.evaluate((id) => {
    const box = document.getElementById(id)!;
    const q = (selector: string) => box.querySelector<HTMLElement>(selector)!;
    const stage = q(".sk-scroll-expand__stage");
    const shift = (el: HTMLElement) => {
      /* `translate` is "0px -24px": the lead moves on the block axis, so it is the second number that says how far. */
      const value = getComputedStyle(el).translate;
      return value === "none" ? 0 : Number.parseFloat(value.split(" ")[1] ?? "0");
    };
    const reveal = Array.from(box.querySelectorAll<HTMLElement>(".sk-scroll-expand__reveal > *")).map((el) => Number.parseFloat(getComputedStyle(el).opacity));
    return {
      reveal,
      stagePosition: getComputedStyle(stage).position,
      stageTop: Math.round(stage.getBoundingClientRect().top - box.getBoundingClientRect().top),
      clip: getComputedStyle(q(".sk-scroll-expand__container")).clipPath,
      leadShift: shift(q(".sk-scroll-expand__lead")),
      fade: Number.parseFloat(getComputedStyle(q(".sk-scroll-expand__lead")).opacity),
      animations: document.getAnimations().filter((a) => (a.effect as KeyframeEffect | null)?.target instanceof Element && (a.effect as KeyframeEffect).target!.closest(`#${id}`)).length,
    };
  }, PROBE);
}

test.describe("Scroll Expand", () => {
  test.beforeEach(async ({ page }) => {
    await waitForStage(page);
    await mount(page);
  });

  test("at rest the container is a small window and the lead's words are in place", async ({ page }) => {
    await scrollTo(page, 0);
    const now = await read(page);
    expect(now.stagePosition).toBe("sticky");
    expect(now.clip).toContain("inset(");
    expect(now.clip).not.toMatch(FULL);
    expect(now.leadShift).toBeCloseTo(0, 1);
    expect(now.fade).toBeCloseTo(1, 2);
  });

  test("partway, the lead is lifting and fading while the stage is held at the top", async ({ page }) => {
    await scrollTo(page, BOX / 4);
    const now = await read(page);
    expect(now.leadShift).toBeLessThan(0);
    expect(now.fade).toBeLessThan(1);
    expect(now.fade).toBeGreaterThan(0);
    expect(now.stageTop).toBe(0);
  });

  test("once the box-height of scroll is spent, the container is full and the lead's words are gone", async ({ page }) => {
    await scrollTo(page, BOX);
    const now = await read(page);
    expect(now.clip).toMatch(FULL);
    expect(now.fade).toBeCloseTo(0, 2);
    expect(now.stageTop).toBe(0);
  });

  test("past that, the stage is released and what follows scrolls in", async ({ page }) => {
    await scrollTo(page, BOX + 200);
    expect((await read(page)).stageTop).toBeLessThan(0);
  });

  test("scrolling back up closes the window again", async ({ page }) => {
    await scrollTo(page, BOX);
    await scrollTo(page, 0);
    const now = await read(page);
    expect(now.fade).toBeCloseTo(1, 2);
    expect(now.leadShift).toBeCloseTo(0, 1);
  });

  test("the reveal is not on screen in the small window, arrives as it opens (each child after the one before) and is whole when full", async ({ page }) => {
    await scrollTo(page, 0);
    expect((await read(page)).reveal).toEqual([0, 0, 0]);
    await scrollTo(page, BOX * 0.55);
    const partway = (await read(page)).reveal;
    expect(partway[0]!).toBeGreaterThan(0);
    expect(partway[0]!).toBeGreaterThanOrEqual(partway[1]!);
    expect(partway[1]!).toBeGreaterThanOrEqual(partway[2]!);
    expect(partway[2]!).toBeLessThan(1);
    await scrollTo(page, BOX);
    expect((await read(page)).reveal).toEqual([1, 1, 1]);
  });

  test("contract starts full with the lead gone, and closes to the window as the scroll is spent", async ({ page }) => {
    await mount(page, "contract");
    await scrollTo(page, 0);
    const start = await read(page);
    expect(start.clip).toMatch(FULL);
    expect(start.fade).toBeCloseTo(0, 2);
    await scrollTo(page, BOX / 4);
    const partway = await read(page);
    expect(partway.clip).not.toMatch(FULL);
    expect(partway.fade).toBeGreaterThan(0);
    expect(partway.fade).toBeLessThan(1);
    await scrollTo(page, BOX);
    const end = await read(page);
    expect(end.clip).toContain("inset(");
    expect(end.clip).not.toMatch(FULL);
    expect(end.fade).toBeCloseTo(1, 2);
    expect(end.leadShift).toBeCloseTo(0, 1);
    expect(end.stageTop).toBe(0);
    expect(end.reveal).toEqual([0, 0, 0]);
  });

  test("with reduced motion nothing is held or animated: lead, container, then what follows", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await waitForStage(page);
    await mount(page);
    await scrollTo(page, BOX / 2);
    const now = await read(page);
    expect(now.stagePosition).not.toBe("sticky");
    expect(now.animations).toBe(0);
    expect(now.clip).toBe("none");
    expect(now.fade).toBe(1);
    expect(now.reveal).toEqual([1, 1, 1]);
  });
});
