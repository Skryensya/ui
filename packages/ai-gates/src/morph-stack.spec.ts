import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * MORPH STACK, IN A REAL BROWSER. The claims a DOM comparison cannot see: that the stack really opens (the stage tilts,
 * the plates move apart in depth, the back plate appears), that `auto` answers to a fine pointer and to focus while a
 * written state does not, and that a reader who asks for reduced motion gets both states with a quarter of the travel
 * and no transition.
 *
 * Each probe is authored markup injected into the stage, which has every stylesheet loaded. After a state change the
 * probe waits for every transition on the stack to finish, so what is read is the resting value of that state.
 */

const PROBE = "morph-stack-probe";

async function mount(page: Page, state: string, turn = "start", dir = "ltr", five = false): Promise<void> {
  await page.evaluate(
    ({ id, state, turn, dir, five }) => {
      document.getElementById(id)?.remove();
      const host = document.createElement("div");
      host.id = id;
      host.dir = dir;
      host.style.cssText = "position:fixed;inset-block-start:2rem;inset-inline-start:2rem;z-index:9;background:#fff;padding:2rem";
      host.innerHTML = `
        <div class="sk-morph-stack" data-state="${state}" data-turn="${turn}">
          <div class="sk-morph-stack__stage">
            ${five ? '<div class="sk-morph-stack__deepest"><div style="inline-size:10rem;block-size:10rem">deepest</div></div>' : ""}
            <div class="sk-morph-stack__back"><div style="inline-size:10rem;block-size:10rem">back</div></div>
            <div class="sk-morph-stack__middle"><div style="inline-size:10rem;block-size:10rem">middle</div></div>
            <div class="sk-morph-stack__front"><button type="button" id="${id}-button">front</button></div>
            ${five ? '<div class="sk-morph-stack__nearest"><div style="inline-size:10rem;block-size:10rem">nearest</div></div>' : ""}
          </div>
        </div>`;
      document.body.append(host);
    },
    { id: PROBE, state, turn, dir, five },
  );
}

/** Let every transition on the probe run out, then read the resting values. */
async function settle(page: Page): Promise<void> {
  await page.evaluate(
    (id) =>
      Promise.all(
        document
          .getAnimations()
          .filter((a) => (a.effect as KeyframeEffect | null)?.target instanceof Element && (a.effect as KeyframeEffect).target!.closest(`#${id}`))
          .map((a) => a.finished.catch(() => undefined)),
      ).then(() => undefined),
    PROBE,
  );
}

type Read = { spin: number; frontX: number; stageTilted: boolean; backOpacity: number; backZ: number; frontZ: number; frontTransition: string };

async function read(page: Page): Promise<Read> {
  return page.evaluate((id) => {
    const q = (selector: string) => getComputedStyle(document.querySelector<HTMLElement>(`#${id} ${selector}`)!);
    /* `translate` is "none" at zero, otherwise "x y z" with the third missing when it is zero. */
    const z = (value: string) => (value === "none" ? 0 : Number.parseFloat(value.split(" ")[2] ?? "0"));
    /* The stage's rotation about z, from its matrix: the sign says which way it turned. */
    const spin = (() => {
      const m = q(".sk-morph-stack__stage").transform;
      if (m === "none") return 0;
      const v = m.replace(/matrix3d\(|matrix\(|\)/g, "").split(",").map(Number);
      return v.length === 16 ? Math.atan2(v[1]!, v[0]!) : Math.atan2(v[1]!, v[0]!);
    })();
    const frontX = Number.parseFloat(q(".sk-morph-stack__front").translate.split(" ")[0] ?? "0") || 0;
    return {
      spin,
      frontX,
      stageTilted: q(".sk-morph-stack__stage").transform !== "none" && q(".sk-morph-stack__stage").transform !== "matrix(1, 0, 0, 1, 0, 0)",
      backOpacity: Number.parseFloat(q(".sk-morph-stack__back").opacity),
      backZ: z(q(".sk-morph-stack__back").translate),
      frontZ: z(q(".sk-morph-stack__front").translate),
      frontTransition: q(".sk-morph-stack__front").transitionProperty,
    };
  }, PROBE);
}

test.describe("Morph Stack", () => {
  test.beforeEach(async ({ page }) => {
    await waitForStage(page);
  });

  test("at rest the stage is flat, the back plate is not there and the front plate sits just above the middle one", async ({ page }) => {
    await mount(page, "rest");
    await settle(page);
    const now = await read(page);
    expect(now.stageTilted).toBe(false);
    expect(now.backOpacity).toBe(0);
    expect(now.backZ).toBe(0);
    expect(now.frontZ).toBeGreaterThan(0);
    expect(now.frontZ).toBeLessThan(24);
  });

  test("written open, the stage tilts, the back plate appears and moves away, and the front plate comes forward", async ({ page }) => {
    await mount(page, "expanded");
    await settle(page);
    const now = await read(page);
    expect(now.stageTilted).toBe(true);
    expect(now.backOpacity).toBe(1);
    expect(now.backZ).toBeLessThan(0);
    expect(now.frontZ).toBeGreaterThan(24);
  });

  test("closing again puts everything back", async ({ page }) => {
    await mount(page, "expanded");
    await settle(page);
    await page.evaluate((id) => document.querySelector(`#${id} .sk-morph-stack`)!.setAttribute("data-state", "rest"), PROBE);
    await settle(page);
    const now = await read(page);
    expect(now.stageTilted).toBe(false);
    expect(now.backOpacity).toBe(0);
  });

  test("turn end is the mirror image of start: the stage swings the other way and the front plate slides to the other side", async ({ page }) => {
    await mount(page, "expanded", "start");
    await settle(page);
    const start = await read(page);
    await mount(page, "expanded", "end");
    await settle(page);
    const end = await read(page);
    expect(start.spin).not.toBe(0);
    expect(Math.sign(end.spin)).toBe(-Math.sign(start.spin));
    expect(Math.sign(end.frontX)).toBe(-Math.sign(start.frontX));
    expect(end.backZ).toBeCloseTo(start.backZ, 3);
  });

  test("in a right-to-left page start turns the way end does in a left-to-right one", async ({ page }) => {
    await mount(page, "expanded", "end", "ltr");
    await settle(page);
    const ltrEnd = await read(page);
    await mount(page, "expanded", "start", "rtl");
    await settle(page);
    const rtlStart = await read(page);
    expect(Math.sign(rtlStart.spin)).toBe(Math.sign(ltrEnd.spin));
  });

  test("the perspective option reaches the stack: a closer lens makes the same stack read bigger at the front", async ({ page }) => {
    await mount(page, "expanded");
    await settle(page);
    const stylesheet = await page.evaluate((id) => getComputedStyle(document.querySelector(`#${id} .sk-morph-stack`)!).perspective, PROBE);
    await page.evaluate((id) => document.querySelector<HTMLElement>(`#${id} .sk-morph-stack`)!.style.setProperty("--sk-morph-stack-perspective", "20rem"), PROBE);
    const closer = await page.evaluate((id) => getComputedStyle(document.querySelector(`#${id} .sk-morph-stack`)!).perspective, PROBE);
    expect(stylesheet).toBe("896px");
    expect(closer).toBe("320px");
  });

  test("five plates sit at -2, -1, 0, +1 and +2 gaps from the middle one, and the end plates are optional", async ({ page }) => {
    await mount(page, "expanded", "start", "ltr", true);
    await settle(page);
    const zs = await page.evaluate((id) => {
      const z = (cls: string) => {
        const value = getComputedStyle(document.querySelector<HTMLElement>(`#${id} .sk-morph-stack__${cls}`)!).translate;
        return value === "none" ? 0 : Number.parseFloat(value.split(" ")[2] ?? "0");
      };
      return { deepest: z("deepest"), back: z("back"), middle: z("middle"), front: z("front"), nearest: z("nearest") };
    }, PROBE);
    /* Gap is 4.5rem, 72px at a 16px root. */
    expect(zs.middle).toBe(0);
    expect(zs.front).toBeCloseTo(72, 0);
    expect(zs.nearest).toBeCloseTo(144, 0);
    expect(zs.back).toBeCloseTo(-72, 0);
    expect(zs.deepest).toBeCloseTo(-144, 0);
    /* Without the two end plates the others sit exactly where they did: nothing moves to fill the gap. */
    await mount(page, "expanded");
    await settle(page);
    expect((await read(page)).backZ).toBeCloseTo(-72, 0);
    expect((await read(page)).frontZ).toBeCloseTo(72, 0);
  });

  test("auto opens under a fine pointer and closes when it leaves", async ({ page }) => {
    await mount(page, "auto");
    await page.hover(`#${PROBE} .sk-morph-stack`);
    await settle(page);
    expect((await read(page)).stageTilted).toBe(true);
    await page.mouse.move(2000, 600);
    await settle(page);
    expect((await read(page)).stageTilted).toBe(false);
  });

  test("auto-inverse starts open, settles under a fine pointer and opens again when it leaves", async ({ page }) => {
    await mount(page, "auto-inverse");
    await settle(page);
    expect((await read(page)).stageTilted).toBe(true);
    await page.hover(`#${PROBE} .sk-morph-stack`);
    await settle(page);
    const settled = await read(page);
    expect(settled.stageTilted).toBe(false);
    expect(settled.backOpacity).toBe(0);
    await page.mouse.move(2000, 600);
    await settle(page);
    expect((await read(page)).stageTilted).toBe(true);
  });

  test("auto-inverse settles while focus is inside", async ({ page }) => {
    await mount(page, "auto-inverse");
    await page.focus(`#${PROBE}-button`);
    await settle(page);
    expect((await read(page)).stageTilted).toBe(false);
  });

  test("auto opens while focus is inside, for a keyboard reader", async ({ page }) => {
    await mount(page, "auto");
    await page.focus(`#${PROBE}-button`);
    await settle(page);
    expect((await read(page)).stageTilted).toBe(true);
  });

  test("a written state ignores the pointer and focus", async ({ page }) => {
    await mount(page, "rest");
    await page.hover(`#${PROBE} .sk-morph-stack`);
    await page.focus(`#${PROBE}-button`);
    await settle(page);
    expect((await read(page)).stageTilted).toBe(false);
  });

  test("with reduced motion both states stay, with a quarter of the travel and no transition", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await waitForStage(page);
    await mount(page, "expanded");
    const now = await read(page);
    expect(now.stageTilted).toBe(true);
    expect(now.frontTransition).toBe("none");
    /* The back plate's depth is the hook's default, -4.5rem (-72px at a 16px root), times the quarter. */
    expect(now.backZ).toBeCloseTo(-18, 0);
  });
});
