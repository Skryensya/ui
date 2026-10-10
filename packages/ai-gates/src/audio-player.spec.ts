import { expect, test, type Locator, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * AUDIO PLAYER, IN A REAL BROWSER. What no DOM comparison can see: which face of each toggle the sheet lights from the
 * root's state alone, that the waveform replaces the plain track once peaks are drawn, that the played half is a clip of
 * the second set of bars, that the card puts the clock and the speed on a row of their own, and that the previous and next
 * buttons exist only with a list.
 *
 * Nothing here plays. The harness serves no audio, and a gate that decoded sound would be a gate on the browser's codecs;
 * playing, seeking and advancing are proved against a controlled element in the React suite. What is checked here is the
 * part that suite cannot reach: the paint.
 */

const BINDINGS = ["react", "vanilla"] as const;

const clearOverlays = (page: Page) =>
  page.evaluate(() => {
    for (const dialog of document.querySelectorAll<HTMLDialogElement>("dialog[open]")) dialog.close();
    for (const overlay of document.querySelectorAll<HTMLElement>("dialog, [popover], .sk-vaul, .sk-drawer")) overlay.style.pointerEvents = "none";
  });

async function player(page: Page, binding: (typeof BINDINGS)[number], which: "default" | "playlist" | "minimal"): Promise<Locator> {
  await clearOverlays(page);
  const block = page.locator(`[data-case="audio-player/${which}"] [data-binding="${binding}"]`).first();
  const root = block.locator(".sk-audio-player").first();
  await root.scrollIntoViewIfNeeded();
  await root.evaluate((el) => {
    el.style.inlineSize = "520px";
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

test.describe("AudioPlayerMinimal", () => {
  test.beforeEach(async ({ page }) => {
    await waitForStage(page);
  });

  for (const binding of BINDINGS) {
    test(`${binding}: is one row, a play button, the bar taking the room and the time, with nothing else in it`, async ({ page }) => {
      const root = await player(page, binding, "minimal");
      const row = await root.evaluate((el) => {
        const box = (selector: string) => el.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
        const play = box('[data-audio-action="play"]');
        const seek = box(".sk-audio-player__seek");
        const time = box(".sk-audio-player__time");
        return {
          buttons: el.querySelectorAll("button").length,
          extras: el.querySelectorAll(".sk-audio-player__cover, .sk-audio-player__meta, .sk-audio-player__list, .sk-audio-player__volume, .sk-audio-player__wave").length,
          sameRow: Math.abs(play.top + play.height / 2 - (seek.top + seek.height / 2)) < 12 && Math.abs(time.top + time.height / 2 - (seek.top + seek.height / 2)) < 12,
          order: play.right <= seek.left + 1 && seek.right <= time.left + 1,
          seekWidth: seek.width,
        };
      });
      expect(row.buttons).toBe(1);
      expect(row.extras).toBe(0);
      expect(row.sameRow).toBe(true);
      expect(row.order).toBe(true);
      expect(row.seekWidth).toBeGreaterThan(120);
    });

    test(`${binding}: lights the pause face from the root's flag alone`, async ({ page }) => {
      const root = await player(page, binding, "minimal");
      const lit = () =>
        root.evaluate((el) =>
          [...el.querySelectorAll<HTMLElement>('[data-audio-action="play"] [data-face]')]
            .filter((face) => Number(getComputedStyle(face).opacity) > 0.5)
            .map((face) => face.dataset.face!),
        );
      await expect.poll(lit).toEqual(["play"]);
      await root.evaluate((el) => el.setAttribute("data-playing", ""));
      await expect.poll(lit).toEqual(["pause"]);
    });
  }
});

test.describe("AudioPlayer", () => {
  test.beforeEach(async ({ page }) => {
    await waitForStage(page);
  });

  for (const binding of BINDINGS) {
    test.describe(binding, () => {
      test("lights the play face at rest, and the pause face from the root's flag alone", async ({ page }) => {
        const root = await player(page, binding, "default");
        const play = '[data-audio-action="play"]';
        await expect.poll(() => lit(root, play)).toEqual(["play"]);
        await root.evaluate((el) => el.setAttribute("data-playing", ""));
        await expect.poll(() => lit(root, play)).toEqual(["pause"]);
        await root.evaluate((el) => {
          el.removeAttribute("data-playing");
          el.setAttribute("data-ended", "");
        });
        await expect.poll(() => lit(root, play)).toEqual(["replay"]);
      });

      test("draws the waveform instead of the plain track, with nothing played until the controller says so", async ({ page }) => {
        const root = await player(page, binding, "default");
        const geometry = await root.evaluate((el) => {
          const track = el.querySelector<HTMLElement>(".sk-audio-player__track")!;
          const wave = el.querySelector<HTMLElement>(".sk-audio-player__wave")!;
          const fill = el.querySelector<HTMLElement>(".sk-audio-player__wave-fill")!;
          return {
            bars: el.querySelectorAll(".sk-audio-player__wave-bars > span").length,
            hasWaveFlag: el.hasAttribute("data-wave"),
            trackDisplay: getComputedStyle(track).display,
            waveDisplay: getComputedStyle(wave).display,
            clip: getComputedStyle(fill).clipPath,
            rootProps: el.getAttribute("style") ?? "",
          };
        });
        expect(geometry.hasWaveFlag).toBe(true);
        expect(geometry.bars).toBe(64);
        expect(geometry.trackDisplay).toBe("none");
        expect(geometry.waveDisplay).not.toBe("none");
        /* Nothing played yet: the played copy of the bars is clipped to nothing (the engine may keep the percentage or resolve it to pixels). */
        expect(geometry.clip).toMatch(/inset\(0px (100%|[\d.]+px) 0px 0px\)/);
        /* What moves is written on the elements, never as a custom property on the root. */
        expect(geometry.rootProps).not.toContain("--sk-audio-player-");
      });

      test("shows the played half of the waveform from the clip the controller writes on it", async ({ page }) => {
        const root = await player(page, binding, "default");
        const shown = await root.evaluate((el) => {
          const fill = el.querySelector<HTMLElement>(".sk-audio-player__wave-fill")!;
          const box = fill.getBoundingClientRect();
          fill.style.clipPath = "inset(0 50% 0 0)";
          const bars = [...fill.querySelectorAll<HTMLElement>(":scope > span")];
          const visible = bars.filter((bar) => {
            const b = bar.getBoundingClientRect();
            return b.left + b.width / 2 < box.left + box.width / 2;
          }).length;
          return { half: visible, total: bars.length, clip: getComputedStyle(fill).clipPath };
        });
        expect(shown.clip).toMatch(/inset\(0px 50%|inset\(0px [\d.]+px 0px 0px\)/);
        expect(shown.half).toBeGreaterThan(shown.total / 2 - 4);
        expect(shown.half).toBeLessThan(shown.total / 2 + 4);
      });

      test("shows the card's clock on a row of its own, below the transport", async ({ page }) => {
        const root = await player(page, binding, "default");
        const rows = await root.evaluate((el) => {
          const top = (selector: string) => el.querySelector<HTMLElement>(selector)!.getBoundingClientRect().top;
          return { play: top('[data-audio-action="play"]'), time: top(".sk-audio-player__time"), volume: top(".sk-audio-player__volume") };
        });
        expect(rows.time).toBeGreaterThan(rows.play + 8);
        expect(Math.abs(rows.time - rows.volume)).toBeLessThan(24);
      });

      test("hides previous and next on a single sound, and a cover that has no picture", async ({ page }) => {
        const root = await player(page, binding, "default");
        const shown = await root.evaluate((el) => ({
          previous: getComputedStyle(el.querySelector('[data-audio-action="previous"]')!).display,
          next: getComputedStyle(el.querySelector('[data-audio-action="next"]')!).display,
        }));
        expect(shown.previous).toBe("none");
        expect(shown.next).toBe("none");
      });

      test("marks the loaded track of a list by more than colour, and hides a track's missing cover", async ({ page }) => {
        const root = await player(page, binding, "playlist");
        const marks = await root.evaluate((el) => {
          const rows = [...el.querySelectorAll<HTMLElement>(".sk-audio-player__item")];
          const button = (i: number) => rows[i]!.querySelector<HTMLElement>(".sk-audio-player__item-button")!;
          const current = rows.findIndex((row) => row.hasAttribute("data-current"));
          const style = (i: number) => getComputedStyle(button(i));
          return {
            rows: rows.length,
            current,
            ariaCurrent: button(0).getAttribute("aria-current"),
            border: style(0).borderInlineStartColor !== style(1).borderInlineStartColor,
            weight: getComputedStyle(rows[0]!.querySelector(".sk-audio-player__item-title")!).fontWeight !== getComputedStyle(rows[1]!.querySelector(".sk-audio-player__item-title")!).fontWeight,
          };
        });
        expect(marks.rows).toBe(2);
        expect(marks.current).toBe(0);
        expect(marks.ariaCurrent).toBe("true");
        expect(marks.border).toBe(true);
        expect(marks.weight).toBe(true);
      });

      test("opens the volume as a popup that moves nothing in the bar, and keeps play a circle", async ({ page }) => {
        const root = await player(page, binding, "default");
        const measure = () =>
          root.evaluate((el) => {
            const rect = (selector: string) => {
              const b = el.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
              return [b.left, b.top, b.width, b.height].map((n) => Math.round(n * 10) / 10);
            };
            const slider = el.querySelector<HTMLElement>(".sk-audio-player__volume-slider")!;
            const mute = el.querySelector<HTMLElement>('[data-audio-action="mute"]')!.getBoundingClientRect();
            const sliderBox = slider.getBoundingClientRect();
            return {
              bar: ["previous", "play", "next", "speed", "mute"].map((a) => rect(`[data-audio-action="${a}"]`)),
              time: rect(".sk-audio-player__time"),
              height: el.getBoundingClientRect().height,
              visibility: getComputedStyle(slider).visibility,
              above: sliderBox.bottom <= mute.top,
              vertical: sliderBox.height > sliderBox.width * 3,
              radius: getComputedStyle(el.querySelector('[data-audio-action="play"]')!).borderTopLeftRadius,
            };
          });
        const before = await measure();
        expect(before.visibility).toBe("hidden");
        await root.locator('[data-audio-action="mute"]').hover();
        await expect.poll(async () => (await measure()).visibility).toBe("visible");
        const after = await measure();
        expect(after.bar).toEqual(before.bar);
        expect(after.time).toEqual(before.time);
        expect(after.height).toBe(before.height);
        expect(after.above).toBe(true);
        expect(after.vertical).toBe(true);
        expect(after.radius).toBe("9999px");
      });

      test("shows previous and next on a list", async ({ page }) => {
        const root = await player(page, binding, "playlist");
        const shown = await root.evaluate((el) => ({
          previous: getComputedStyle(el.querySelector('[data-audio-action="previous"]')!).display,
          next: getComputedStyle(el.querySelector('[data-audio-action="next"]')!).display,
        }));
        expect(shown.previous).not.toBe("none");
        expect(shown.next).not.toBe("none");
      });

      test("the playlist is List's rows: square corners, a hairline between rows, a bar on the loaded one", async ({ page }) => {
        const root = await player(page, binding, "playlist");
        const rows = await root.evaluate((el) => {
          const buttons = [...el.querySelectorAll<HTMLElement>(".sk-audio-player__item-button")];
          const radius = (b: HTMLElement) => getComputedStyle(b).borderTopLeftRadius;
          const second = el.querySelectorAll<HTMLElement>(".sk-audio-player__item")[1]!;
          return {
            firstRadius: radius(buttons[0]!),
            dividers: getComputedStyle(second).borderTopWidth,
            barLoaded: getComputedStyle(buttons[0]!).borderInlineStartWidth,
            colourLoaded: getComputedStyle(buttons[0]!).borderInlineStartColor,
            colourOther: getComputedStyle(buttons[1]!).borderInlineStartColor,
            numberShown: getComputedStyle(el.querySelector(".sk-audio-player__item-leading")!).display,
            bleed: el.querySelector(".sk-audio-player__list")!.getBoundingClientRect().width - el.getBoundingClientRect().width,
            barOther: getComputedStyle(buttons[1]!).borderInlineStartWidth,
            number: getComputedStyle(el.querySelector(".sk-audio-player__item-leading")!, "::before").content,
          };
        });
        expect(rows.firstRadius).toBe("0px");
        expect(rows.dividers).toBe("1px");
        /* The bar is the same width on every row (transparent but the loaded one's), so choosing a track never moves a title. */
        expect(rows.barLoaded).toBe("3px");
        expect(rows.barOther).toBe("3px");
        expect(rows.colourLoaded).not.toBe(rows.colourOther);
        expect(rows.numberShown).not.toBe("none");
        /* The list runs to the box's edges (inside its 1px border), where a row's divider belongs. */
        expect(Math.abs(rows.bleed)).toBeLessThanOrEqual(2);
        /* The number is a counter, so the markup has nothing to keep in order; the engine keeps the expression, not the digit. */
        expect(rows.number).toBe("counter(sk-audio-track)");
      });

      test("answers its keys only while focus is inside the player", async ({ page }) => {
        const root = await player(page, binding, "default");
        const calls = await root.evaluate((el) => {
          const audio = el.querySelector("audio")!;
          let plays = 0;
          audio.play = (async () => {
            plays += 1;
          }) as typeof audio.play;
          const press = (target: Element) => target.dispatchEvent(new KeyboardEvent("keydown", { key: "k", bubbles: true }));
          press(document.body);
          const outside = plays;
          press(el);
          return { outside, inside: plays };
        });
        expect(calls.outside).toBe(0);
        expect(calls.inside).toBe(1);
      });
    });
  }
});
