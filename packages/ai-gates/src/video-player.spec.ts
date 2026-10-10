import { expect, test, type Locator, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * VIDEO PLAYER, IN A REAL BROWSER. What no DOM comparison can see: where the bar and the big button sit, which face of each
 * toggle the sheet lights from the root's state alone (no script names a face), that the two fills and the thumb follow the
 * numbers the controller writes, that a right-to-left page anchors the fills to the other edge, and that the keys answer only
 * while focus is inside the player.
 *
 * No test here plays anything. The stage's source is a path the harness does not serve, and a gate that decoded video would be
 * a gate on the browser's codecs; playing, seeking and the idle timer are proved against a controlled element in both
 * bindings' suites. What is checked here is the part those suites cannot reach: the paint.
 */

const BINDINGS = ["react", "vanilla"] as const;

/*
 * The stage keeps other cases' overlays open, and an open modal `<dialog>` makes everything outside it inert and takes the
 * focus: a keyboard test would press its keys into the dialog. So they are closed here, which is also what a reader who
 * reached this player would have done.
 */
const clearOverlays = (page: Page) =>
  page.evaluate(() => {
    for (const dialog of document.querySelectorAll<HTMLDialogElement>("dialog[open]")) dialog.close();
    for (const overlay of document.querySelectorAll<HTMLElement>("dialog, [popover], .sk-vaul, .sk-drawer")) overlay.style.pointerEvents = "none";
  });

async function player(page: Page, binding: (typeof BINDINGS)[number]): Promise<Locator> {
  await clearOverlays(page);
  const root = page.locator(`[data-binding="${binding}"] .sk-video-player`).first();
  await root.scrollIntoViewIfNeeded();
  await root.evaluate((el) => {
    el.style.inlineSize = "480px";
  });
  return root;
}

/** Whether a face is the lit one: the toggle's own opacity, which the sheet drives from the root's flags. */
const lit = (root: Locator, scope: string): Promise<string[]> =>
  root.evaluate(
    (el, selector) =>
      [...el.querySelectorAll<HTMLElement>(`${selector} [data-face]`)]
        .filter((face) => Number(getComputedStyle(face).opacity) > 0.5)
        .map((face) => face.dataset.face!),
    scope,
  );

test.describe("VideoPlayer", () => {
  test.beforeEach(async ({ page }) => {
    await waitForStage(page);
  });

  for (const binding of BINDINGS) {
    test.describe(binding, () => {
      test("the bar sits along the bottom edge and the big button in the middle", async ({ page }) => {
        const root = await player(page, binding);
        const geometry = await root.evaluate((el) => {
          const box = el.getBoundingClientRect();
          const controls = el.querySelector(".sk-video-player__controls")!.getBoundingClientRect();
          const big = el.querySelector(".sk-video-player__big")!.getBoundingClientRect();
          return {
            barBottomGap: box.bottom - controls.bottom,
            barWidth: controls.width / box.width,
            bigOffset: Math.abs(big.left + big.width / 2 - (box.left + box.width / 2)),
            bigVertical: Math.abs(big.top + big.height / 2 - (box.top + box.height / 2)),
            ratio: box.width / box.height,
          };
        });
        expect(geometry.barBottomGap).toBeLessThan(2);
        expect(geometry.barWidth).toBeGreaterThan(0.99);
        expect(geometry.bigOffset).toBeLessThan(2);
        expect(geometry.bigVertical).toBeLessThan(2);
        expect(geometry.ratio).toBeGreaterThan(1.75);
        expect(geometry.ratio).toBeLessThan(1.8);
      });

      test("the sheet lights the face the root's state names, with no script choosing one", async ({ page }) => {
        const root = await player(page, binding);
        const bar = ".sk-video-player__bar [data-video-action=play]";
        /* A face cross-fades, so each state is polled until it has settled. */
        await expect.poll(() => lit(root, bar)).toEqual(["play"]);
        await root.evaluate((el) => el.setAttribute("data-playing", ""));
        await expect.poll(() => lit(root, bar)).toEqual(["pause"]);
        await root.evaluate((el) => {
          el.removeAttribute("data-playing");
          el.setAttribute("data-ended", "");
        });
        await expect.poll(() => lit(root, bar)).toEqual(["replay"]);
        await expect.poll(() => lit(root, "[data-video-action=mute]")).toEqual(["volume"]);
        await root.evaluate((el) => el.setAttribute("data-muted", ""));
        await expect.poll(() => lit(root, "[data-video-action=mute]")).toEqual(["muted"]);
        await expect.poll(() => lit(root, "[data-video-action=fullscreen]")).toEqual(["enter"]);
        await root.evaluate((el) => el.setAttribute("data-fullscreen", ""));
        await expect.poll(() => lit(root, "[data-video-action=fullscreen]")).toEqual(["exit"]);
      });

      test("the big button is there before the first play and leaves once the media has started", async ({ page }) => {
        const root = await player(page, binding);
        const big = root.locator(".sk-video-player__big");
        await expect(big).toBeVisible();
        await root.evaluate((el) => el.setAttribute("data-started", ""));
        await expect(big).toBeHidden();
        await root.evaluate((el) => el.setAttribute("data-ended", ""));
        await expect(big).toBeVisible();
      });

      test("the fills follow the scale the controller writes on them", async ({ page }) => {
        const root = await player(page, binding);
        /* Written and measured in ONE evaluation: the controller repaints on its own (a visibility report, a frame), and a gap between the two would let it overwrite the value under test. */
        const fills = await root.evaluate((el) => {
          el.querySelector<HTMLElement>(".sk-video-player__played")!.style.scale = "0.25 1";
          el.querySelector<HTMLElement>(".sk-video-player__buffered")!.style.scale = "0.6 1";
          const track = el.querySelector(".sk-video-player__track")!.getBoundingClientRect();
          const played = el.querySelector(".sk-video-player__played")!.getBoundingClientRect();
          const buffered = el.querySelector(".sk-video-player__buffered")!.getBoundingClientRect();
          return { played: played.width / track.width, buffered: buffered.width / track.width, playedAtStart: Math.abs(played.left - track.left) };
        });
        expect(fills.played).toBeCloseTo(0.25, 2);
        expect(fills.buffered).toBeCloseTo(0.6, 2);
        expect(fills.playedAtStart).toBeLessThan(1);
      });

      test("the thumb stays away until the pointer or the keys arrive", async ({ page }) => {
        const root = await player(page, binding);
        const thumb = root.locator(".sk-video-player__thumb");
        const scale = () => thumb.evaluate((el) => getComputedStyle(el).scale);
        await page.mouse.move(0, 0);
        expect(await scale()).toBe("0");
        const box = (await root.locator(".sk-video-player__seek").boundingBox())!;
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await expect.poll(scale).toBe("1");
      });

      test("in a right-to-left page the fills start from the right edge", async ({ page }) => {
        const root = await player(page, binding);
        const anchored = await root.evaluate((el) => {
          el.setAttribute("dir", "rtl");
          el.querySelector<HTMLElement>(".sk-video-player__played")!.style.scale = "0.4 1";
          const track = el.querySelector(".sk-video-player__track")!.getBoundingClientRect();
          const played = el.querySelector(".sk-video-player__played")!.getBoundingClientRect();
          return { rightGap: Math.abs(played.right - track.right), width: played.width / track.width };
        });
        expect(anchored.rightGap).toBeLessThan(1);
        expect(anchored.width).toBeCloseTo(0.4, 2);
      });

      test("the volume slider is a popup over the button: hidden at rest, there when the focus arrives, and the bar never moves", async ({ page }) => {
        const root = await player(page, binding);
        const slider = root.locator(".sk-video-player__volume-slider");
        const clockLeft = () => root.locator(".sk-video-player__time").evaluate((el) => el.getBoundingClientRect().left);
        await page.mouse.move(0, 0);
        await expect(slider).toBeHidden();
        const before = await clockLeft();
        await root.locator("[data-video-action=mute]").focus();
        await expect(slider).toBeVisible();
        const box = (await slider.boundingBox())!;
        const mute = (await root.locator("[data-video-action=mute]").boundingBox())!;
        expect(box.y + box.height).toBeLessThanOrEqual(mute.y + 1);
        expect(await clockLeft()).toBe(before);
      });

      test("the keys answer only while focus is inside the player", async ({ page }) => {
        const root = await player(page, binding);
        await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
        await page.keyboard.press("m");
        await expect(root).not.toHaveAttribute("data-muted");
        await root.locator(".sk-video-player__seek").focus();
        await page.keyboard.press("m");
        await expect(root).toHaveAttribute("data-muted");
        await expect(root.locator("[data-video-action=mute]")).toHaveAttribute("aria-label", /.+/);
      });

      test("the volume slider answers the arrows with its own value", async ({ page }) => {
        const root = await player(page, binding);
        const slider = root.locator(".sk-video-player__volume-slider");
        /* The popup opens with the focus inside its wrapper, so the way in is the mute button next to it. */
        await root.locator("[data-video-action=mute]").focus();
        await expect(slider).toBeVisible();
        await slider.focus();
        await page.keyboard.press("ArrowLeft");
        await expect(slider).toHaveAttribute("aria-valuenow", "95");
        await page.keyboard.press("End");
        await expect(slider).toHaveAttribute("aria-valuenow", "100");
      });

      test("every control keeps a name when the state flips", async ({ page }) => {
        const root = await player(page, binding);
        const names = () => root.locator("button").evaluateAll((buttons) => buttons.map((button) => button.getAttribute("aria-label")));
        for (const name of await names()) expect(name).toBeTruthy();
        await root.evaluate((el) => el.querySelector<HTMLButtonElement>("[data-video-action=mute]")!.click());
        for (const name of await names()) expect(name).toBeTruthy();
      });
    });
  }
});
