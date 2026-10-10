import { createServer, type Server } from "node:http";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { expect, test, type CDPSession, type Page } from "@playwright/test";

/*
 * IMAGE CROPPER, IN A REAL BROWSER. The claims a DOM comparison cannot see: that a crop never contains an empty corner whatever
 * the order of zoom, drag and rotation; that the pointer, a pen, two fingers and the keyboard all reach the same model; that the
 * file that comes out has the pixels the window showed, with a circle cut out of it; and that a picture replaced, a picture that
 * fails and a cropper taken down leave nothing behind.
 *
 * EVERY TEST RUNS IN BOTH BINDINGS. The two are rendered from one contract and driven by one controller, so the point is not
 * that they might differ but that they are held to the same numbers by the same assertions: a divergence has nowhere to hide.
 *
 * THE GEOMETRY IS MEASURED IN THE DOM, NOT IN THE MODEL. `overshoot` reads the window and the picture's real transform off
 * Cropper.js's own elements and does the corner arithmetic itself, so a bug in the model cannot vouch for itself.
 *
 * The picture is four flat quarters (red, green, blue, yellow), 800 by 600: a pixel's colour says which quarter it was cut from.
 */

const axeSource = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");

const CONTROLLER = `/@fs${fileURLToPath(new URL("../../core/src/image-cropper-controller.ts", import.meta.url))}`;
const BINDINGS = ["vanilla", "react"] as const;
type Binding = (typeof BINDINGS)[number];

const RED = [229, 57, 53];
const GREEN = [67, 160, 71];
const BLUE = [30, 136, 229];
const YELLOW = [253, 216, 53];

declare global {
  interface Window {
    __h: {
      getValue(): { position: { x: number; y: number }; zoom: number; rotation: number; frame?: unknown };
      getCrop(): { x: number; y: number; width: number; height: number; rotation: number; outputWidth: number; outputHeight: number } | null;
      setValue(value: unknown, options?: { silent?: boolean }): void;
      reset(): void;
      confirm(): void;
      destroy(): void;
      exportBlob(options?: unknown): Promise<Blob>;
      exportCanvas(options?: unknown): Promise<HTMLCanvasElement>;
      ready: Promise<void>;
    };
    __events: { type: string; detail: any }[];
  }
}

async function open(page: Page, id: string, binding: Binding, attrs: Record<string, string | null> = {}): Promise<void> {
  await page.goto(`/page.html?id=${id}&binding=${binding}`);
  await page.waitForSelector('body[data-ready="true"], body[data-ready="error"]');
  expect(await page.getAttribute("body", "data-ready")).toBe("true");
  await page.waitForSelector('.sk-image-cropper[data-status="ready"]', { timeout: 20_000 });
  if (Object.keys(attrs).length) {
    await page.evaluate((entries) => {
      const root = document.querySelector(".sk-image-cropper")!;
      for (const [name, value] of Object.entries(entries)) {
        if (value === null) root.removeAttribute(name);
        else root.setAttribute(name, value);
      }
    }, attrs);
    await settle(page);
  }
  await page.evaluate(async (url) => {
    const mod: any = await import(/* @vite-ignore */ url);
    const root = document.querySelector(".sk-image-cropper")!;
    window.__h = mod.getImageCropper(root);
    window.__events = [];
    for (const type of [
      "sk:imagecroppervaluechange",
      "sk:imagecroppervaluechangeend",
      "sk:imagecropperconfirm",
      "sk:imagecropperready",
      "sk:imagecroppererror",
      "sk:imagecropperaspectchange",
      "sk:imagecroppershapechange",
      "sk:imagecroppercancel",
    ]) {
      root.addEventListener(type, (event) => {
        const detail = (event as CustomEvent).detail ?? {};
        window.__events.push({ type: type.replace("sk:imagecropper", ""), detail: JSON.parse(JSON.stringify({ ...detail, exportBlob: undefined, exportCanvas: undefined })) });
      });
    }
  }, CONTROLLER);
}

const settle = (page: Page) => page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
const value = (page: Page) => page.evaluate(() => window.__h.getValue());
const crop = (page: Page) => page.evaluate(() => window.__h.getCrop());
const events = (page: Page) => page.evaluate(() => window.__events.map((entry) => entry.type));
const clearEvents = (page: Page) => page.evaluate(() => void (window.__events = []));
const click = (page: Page, selector: string) => page.locator(`.sk-image-cropper ${selector}`).click();
const action = (name: string) => `[data-sk-image-cropper-action="${name}"]`;

/**
 * How far, in stage pixels, the window pokes outside the picture: 0 when it is inside. Measured from Cropper.js's own elements,
 * with its own arithmetic and none of the model's: the window's corners are taken through the inverse of the picture's matrix and
 * compared with the picture's natural size.
 */
async function overshoot(page: Page): Promise<number> {
  return page.evaluate(() => {
    const root = document.querySelector(".sk-image-cropper")!;
    const selection = root.querySelector("cropper-selection") as any;
    const image = root.querySelector("cropper-image") as any;
    const [a, b, c, d, e, f] = image.$getTransform() as number[];
    const w = image.$image.naturalWidth as number;
    const h = image.$image.naturalHeight as number;
    const cx = w / 2;
    const cy = h / 2;
    const det = a * d - b * c;
    let worst = 0;
    for (const [px, py] of [
      [selection.x, selection.y],
      [selection.x + selection.width, selection.y],
      [selection.x, selection.y + selection.height],
      [selection.x + selection.width, selection.y + selection.height],
    ] as [number, number][]) {
      /* canvas = C + M (p - C) + t  =>  p = C + M^-1 (canvas - C - t) */
      const rx = px - cx - e;
      const ry = py - cy - f;
      const nx = cx + (d * rx - c * ry) / det;
      const ny = cy + (-b * rx + a * ry) / det;
      const scale = Math.hypot(a, b);
      worst = Math.max(worst, (0 - nx) * scale, (nx - w) * scale, (0 - ny) * scale, (ny - h) * scale);
    }
    return worst;
  });
}

async function stageBox(page: Page) {
  const box = await page.locator(".sk-image-cropper [data-sk-image-cropper-stage]").boundingBox();
  if (!box) throw new Error("no stage");
  return box;
}

/** Reads the colour of a pixel of a blob at a fraction of its size. */
async function pixelsOf(page: Page, blob: "blob", points: [number, number][]): Promise<{ width: number; height: number; type: string; colours: number[][] }> {
  return page.evaluate(async (fractions) => {
    const result = await (window as any).__lastBlob;
    const bitmap = await createImageBitmap(result as Blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d")!;
    context.drawImage(bitmap, 0, 0);
    return {
      width: bitmap.width,
      height: bitmap.height,
      type: (result as Blob).type,
      colours: fractions.map(([fx, fy]) => Array.from(context.getImageData(Math.min(bitmap.width - 1, Math.floor(fx * bitmap.width)), Math.min(bitmap.height - 1, Math.floor(fy * bitmap.height)), 1, 1).data)),
    };
  }, points);
}

const near = (colour: number[], expected: number[], tolerance = 6) => expected.every((channel, index) => Math.abs(colour[index]! - channel) <= tolerance);

for (const binding of BINDINGS) {
  test.describe(`Image Cropper, ${binding}`, () => {
    test("starts drawn: the window is the picture's own shape, centred, with every control in place and none of Cropper.js's CSS leaking out", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      const info = await page.evaluate(() => {
        const root = document.querySelector(".sk-image-cropper")!;
        const selection = root.querySelector("cropper-selection") as any;
        const stage = root.querySelector("[data-sk-image-cropper-stage]")!.getBoundingClientRect();
        return {
          ratio: selection.width / selection.height,
          centred: Math.abs(selection.x + selection.width / 2 - stage.width / 2) < 1 && Math.abs(selection.y + selection.height / 2 - stage.height / 2) < 1,
          buttons: root.querySelectorAll("button").length,
          ranges: root.querySelectorAll("input[type=range]").length,
          documentCropperStyles: Array.from(document.styleSheets).some((sheet) => {
            try {
              return Array.from(sheet.cssRules).some((rule) => rule.cssText.startsWith("cropper-"));
            } catch {
              return false;
            }
          }),
        };
      });
      expect(info.ratio).toBeCloseTo(16 / 9, 2);
      expect(info.centred).toBe(true);
      expect(info.buttons).toBeGreaterThan(14);
      expect(info.ranges).toBe(2);
      expect(info.documentCropperStyles).toBe(false);
      expect(await overshoot(page)).toBeLessThan(0.5);
      expect(await value(page)).toEqual({ position: { x: 0.5, y: 0.5 }, zoom: 1, rotation: 0 });
    });

    test("holds the aspect ratio that was asked: every preset, a custom number, original, and free", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      const ratio = () => page.evaluate(() => {
        const selection = document.querySelector("cropper-selection") as any;
        return selection.width / selection.height;
      });
      for (const [id, expected] of [["1:1", 1], ["4:3", 4 / 3], ["3:2", 3 / 2], ["16:9", 16 / 9], ["9:16", 9 / 16], ["original", 800 / 600]] as const) {
        await click(page, `[data-sk-image-cropper-aspect="${id}"]`);
        await settle(page);
        expect(await ratio(), id).toBeCloseTo(expected, 2);
        expect(await page.getAttribute(`.sk-image-cropper [data-sk-image-cropper-aspect="${id}"]`, "aria-pressed")).toBe("true");
        expect(await overshoot(page)).toBeLessThan(0.5);
      }
      const input = page.locator(".sk-image-cropper input[data-sk-image-cropper-ratio]");
      await input.fill("2.35");
      await input.press("Enter");
      await settle(page);
      expect(await ratio()).toBeCloseTo(2.35, 2);
      expect(await page.getAttribute(".sk-image-cropper", "data-aspect")).toBe("2.35");
      await input.fill("0");
      await input.press("Enter");
      expect(await input.getAttribute("aria-invalid")).toBe("true");
      expect(await ratio()).toBeCloseTo(2.35, 2);
      await click(page, `[data-sk-image-cropper-aspect="free"]`);
      await settle(page);
      expect(await page.getAttribute(".sk-image-cropper", "data-resizable")).not.toBeNull();
      expect((await events(page)).filter((type) => type === "aspectchange").length).toBeGreaterThanOrEqual(7);
    });

    test("a circle is 1:1 whatever the aspect says, and the toolbar says so", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      await click(page, `[data-sk-image-cropper-shape="circle"]`);
      await settle(page);
      const info = await page.evaluate(() => {
        const selection = document.querySelector("cropper-selection") as any;
        const aspects = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-sk-image-cropper-aspect]"));
        return { ratio: selection.width / selection.height, disabled: aspects.every((button) => button.disabled), pressed: aspects.some((button) => button.getAttribute("aria-pressed") === "true") };
      });
      expect(info.ratio).toBeCloseTo(1, 3);
      expect(info.disabled).toBe(true);
      expect(info.pressed).toBe(false);
      expect(await page.getAttribute(".sk-image-cropper", "data-shape")).toBe("circle");
      const outline = await page.evaluate(() => getComputedStyle(document.querySelector("cropper-selection")!).borderRadius);
      expect(outline).toBe("50%");
      await click(page, `[data-sk-image-cropper-shape="rectangle"]`);
      await settle(page);
      expect((await page.evaluate(() => (document.querySelector("cropper-selection") as any).width / (document.querySelector("cropper-selection") as any).height))).toBeCloseTo(16 / 9, 2);
    });

    test("zooms by button and by slider, between its limits, and reports the number", async ({ page }) => {
      await open(page, "image-cropper-avatar", binding);
      await click(page, action("zoom-in"));
      expect((await value(page)).zoom).toBeCloseTo(1.25, 3);
      await page.evaluate(() => {
        const range = document.querySelector<HTMLInputElement>("input[data-sk-image-cropper-range=zoom]")!;
        range.value = "2";
        range.dispatchEvent(new Event("input", { bubbles: true }));
        range.dispatchEvent(new Event("change", { bubbles: true }));
      });
      expect((await value(page)).zoom).toBeCloseTo(2, 3);
      expect(await page.locator("[data-sk-image-cropper-output=zoom]").textContent()).toBe("200%");
      expect(await page.getAttribute("input[data-sk-image-cropper-range=zoom]", "aria-valuetext")).toBe("200%");
      for (let i = 0; i < 12; i += 1) await click(page, action("zoom-in"));
      expect((await value(page)).zoom).toBeCloseTo(3, 3);
      for (let i = 0; i < 20; i += 1) await click(page, action("zoom-out"));
      expect((await value(page)).zoom).toBeCloseTo(1, 3);
      expect(await overshoot(page)).toBeLessThan(0.5);
    });

    test("drags with the mouse, and the picture stops where its edge meets the window's", async ({ page }) => {
      /* 4:3 over a 4:3 picture: at zoom 1 it fits exactly, so there is nowhere to go. (A 16:9 window has room to slide up and down.) */
      await open(page, "image-cropper-cover", binding, { "data-aspect": "4:3" });
      const box = await stageBox(page);
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      /* Zoom 1: the picture just covers the window, so there is nowhere to go, and no change is reported for trying. */
      await clearEvents(page);
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await page.mouse.move(cx + 120, cy + 80, { steps: 6 });
      await page.mouse.up();
      expect(await value(page)).toEqual({ position: { x: 0.5, y: 0.5 }, zoom: 1, rotation: 0 });
      expect(await events(page)).not.toContain("valuechange");

      await click(page, action("zoom-in"));
      await click(page, action("zoom-in"));
      await clearEvents(page);
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await page.mouse.move(cx - 40, cy - 25, { steps: 5 });
      await page.mouse.up();
      const moved = await value(page);
      expect(moved.position.x).toBeGreaterThan(0.5);
      expect(moved.position.y).toBeGreaterThan(0.5);
      expect(moved.zoom).toBeCloseTo(1.5, 3);
      const order = await events(page);
      expect(order.filter((type) => type === "valuechangeend")).toHaveLength(1);
      expect(order.at(-1)).toBe("valuechangeend");
      expect(order.indexOf("valuechange")).toBeLessThan(order.indexOf("valuechangeend"));

      /* A drag far past every edge: the picture follows until it can not, and never shows an empty corner on the way. */
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      for (const [dx, dy] of [[-600, -400], [900, 700], [-300, 500], [400, -300]] as const) {
        await page.mouse.move(cx + dx, cy + dy, { steps: 8 });
        expect(await overshoot(page)).toBeLessThan(0.5);
      }
      await page.mouse.up();
      const edge = await value(page);
      expect([0, 1]).toContain(edge.position.x);
    });

    test("drags with a pen and with a finger, the same way", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      await click(page, action("zoom-in"));
      await click(page, action("zoom-in"));
      const box = await stageBox(page);
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      for (const pointerType of ["pen", "touch"] as const) {
        await page.evaluate(() => window.__h.setValue({ position: { x: 0.5, y: 0.5 }, zoom: 1.5, rotation: 0 }));
        await page.evaluate(
          async ({ cx, cy, pointerType }) => {
            /* The move layer covers the window: it is what a real pointer lands on, and the one that says what the drag means. */
            const canvas = document.querySelector('cropper-handle[action="move"]')!;
            const fire = (target: EventTarget, type: string, x: number, y: number) =>
              target.dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType, isPrimary: true, clientX: x, clientY: y, bubbles: true, composed: true, button: 0, buttons: type === "pointerup" ? 0 : 1 }));
            fire(canvas, "pointerdown", cx, cy);
            for (let step = 1; step <= 5; step += 1) {
              /* A real pointer moves over the element under it, which Cropper.js asks for (`target.closest`): so does this one. */
              fire(canvas, "pointermove", cx - step * 8, cy - step * 5);
              await new Promise((resolve) => requestAnimationFrame(resolve));
            }
            fire(document, "pointerup", cx - 40, cy - 25);
          },
          { cx, cy, pointerType },
        );
        const after = await value(page);
        expect(after.position.x, pointerType).toBeGreaterThan(0.5);
        expect(after.position.y, pointerType).toBeGreaterThan(0.5);
        expect(await overshoot(page)).toBeLessThan(0.5);
      }
    });

    test("the mouse wheel zooms only when asked, and otherwise is the page's", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      const box = await stageBox(page);
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      /* Whether anything cancelled the wheel: a cancelled wheel does not scroll the page, so a page must be left able to. */
      await page.evaluate(() => {
        (window as any).__wheel = [];
        document.addEventListener("wheel", (event) => setTimeout(() => (window as any).__wheel.push(event.defaultPrevented), 0), { passive: true, capture: true });
      });
      await page.mouse.move(cx, cy);
      await page.mouse.wheel(0, -200);
      await page.waitForTimeout(120);
      expect((await value(page)).zoom).toBe(1);
      expect(await page.evaluate(() => (window as any).__wheel.at(-1))).toBe(false);

      await page.evaluate(() => document.querySelector(".sk-image-cropper")!.setAttribute("data-wheel-zoom", ""));
      await page.mouse.move(cx, cy);
      await page.mouse.wheel(0, -200);
      await page.waitForTimeout(150);
      expect((await value(page)).zoom).toBeGreaterThan(1);
      expect(await overshoot(page)).toBeLessThan(0.5);
      expect(await page.evaluate(() => (window as any).__wheel.at(-1))).toBe(true);
    });

    test("pinches with two real touches: the picture zooms about the fingers, inside its limits", async ({ browser }) => {
      const context = await browser.newContext({ hasTouch: true, viewport: { width: 420, height: 900 }, baseURL: "http://localhost:4180" });
      const page = await context.newPage();
      try {
        await open(page, "image-cropper-cover", binding);
        const client: CDPSession = await context.newCDPSession(page);
        const box = await stageBox(page);
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;
        const touch = (type: "touchStart" | "touchMove" | "touchEnd", points: [number, number][]) =>
          client.send("Input.dispatchTouchEvent", { type, touchPoints: points.map(([x, y], id) => ({ x, y, id })) });
        await clearEvents(page);
        await touch("touchStart", [[cx - 30, cy], [cx + 30, cy]]);
        for (let step = 1; step <= 10; step += 1) await touch("touchMove", [[cx - 30 - step * 8, cy], [cx + 30 + step * 8, cy]]);
        await touch("touchEnd", []);
        await settle(page);
        const zoomed = await value(page);
        expect(zoomed.zoom).toBeGreaterThan(1.5);
        expect(zoomed.zoom).toBeLessThanOrEqual(4);
        expect(await overshoot(page)).toBeLessThan(0.5);
        expect(await events(page)).toContain("valuechangeend");

        /* And pinching in past the floor stops at 1: a pinch cannot expose the stage behind the picture. */
        await touch("touchStart", [[cx - 120, cy], [cx + 120, cy]]);
        for (let step = 1; step <= 14; step += 1) await touch("touchMove", [[cx - 120 + step * 8, cy], [cx + 120 - step * 8, cy]]);
        await touch("touchEnd", []);
        await settle(page);
        expect((await value(page)).zoom).toBeGreaterThanOrEqual(1);
        expect(await overshoot(page)).toBeLessThan(0.5);
      } finally {
        await context.close();
      }
    });

    test("rotates by quarter turns and by a fine angle, and the picture grows just enough to keep covering the window", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      await click(page, action("rotate-right"));
      expect((await value(page)).rotation).toBe(90);
      expect(await overshoot(page)).toBeLessThan(0.5);
      await click(page, action("rotate-left"));
      await click(page, action("rotate-left"));
      expect((await value(page)).rotation).toBe(-90);
      await click(page, action("rotation-reset"));
      expect((await value(page)).rotation).toBe(0);

      await page.evaluate(() => {
        const range = document.querySelector<HTMLInputElement>("input[data-sk-image-cropper-range=rotation]")!;
        range.value = "30";
        range.dispatchEvent(new Event("input", { bubbles: true }));
        range.dispatchEvent(new Event("change", { bubbles: true }));
      });
      const turned = await value(page);
      expect(turned.rotation).toBe(30);
      expect(await overshoot(page)).toBeLessThan(0.5);
      expect(await page.locator("[data-sk-image-cropper-output=rotation]").textContent()).toBe("30°");
      /*
       * Zoomed all the way out, a 16:9 window turned thirty degrees over a 4:3 picture needs 1.316 times the picture it did upright:
       * the window's half-sizes (394, 222) reach 452 and 389 along the picture's axes, against its half-sizes (400, 300).
       * That floor is what the zoom-out button stops at, and the window is still inside the picture there.
       */
      for (let i = 0; i < 10; i += 1) await click(page, action("zoom-out"));
      expect(await overshoot(page)).toBeLessThan(0.5);
      expect((await value(page)).zoom).toBeCloseTo(1.316, 2);
    });

    test("zoom, drag and rotation in any order never leave an empty corner", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      const box = await stageBox(page);
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      let seed = 4242;
      const random = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
      for (let step = 0; step < 40; step += 1) {
        const choice = Math.floor(random() * 5);
        if (choice === 0) await click(page, action("zoom-in"));
        else if (choice === 1) await click(page, action("zoom-out"));
        else if (choice === 2) {
          await page.evaluate((angle) => {
            const range = document.querySelector<HTMLInputElement>("input[data-sk-image-cropper-range=rotation]")!;
            range.value = String(angle);
            range.dispatchEvent(new Event("input", { bubbles: true }));
            range.dispatchEvent(new Event("change", { bubbles: true }));
          }, Math.round((random() - 0.5) * 360));
        } else if (choice === 3) await click(page, action(random() > 0.5 ? "rotate-left" : "rotate-right"));
        else {
          await page.mouse.move(cx, cy);
          await page.mouse.down();
          await page.mouse.move(cx + (random() - 0.5) * 500, cy + (random() - 0.5) * 400, { steps: 5 });
          await page.mouse.up();
        }
        expect(await overshoot(page), `step ${step}`).toBeLessThan(0.5);
        const v = await value(page);
        expect(v.zoom).toBeGreaterThanOrEqual(1);
        expect(v.position.x).toBeGreaterThanOrEqual(0);
        expect(v.position.x).toBeLessThanOrEqual(1);
      }
    });

    test("the keyboard moves, zooms, rotates and resets, and leaves the browser's own shortcuts alone", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      await click(page, action("zoom-in"));
      await click(page, action("zoom-in"));
      await page.locator(".sk-image-cropper [data-sk-image-cropper-stage]").focus();
      const keys = async (key: string, options: { modifiers?: ("Shift" | "Control")[] } = {}) => {
        for (const modifier of options.modifiers ?? []) await page.keyboard.down(modifier);
        await page.keyboard.press(key);
        for (const modifier of options.modifiers ?? []) await page.keyboard.up(modifier);
      };
      const before = await value(page);
      await keys("ArrowRight");
      /* The picture goes the way the key points, so the window travels the other way over it. */
      expect((await value(page)).position.x).toBeLessThan(before.position.x);
      await keys("ArrowLeft", { modifiers: ["Shift"] });
      expect((await value(page)).position.x).toBeGreaterThan(before.position.x);
      await keys("ArrowDown");
      expect((await value(page)).position.y).toBeLessThan(before.position.y);
      const zoomBefore = (await value(page)).zoom;
      await keys("+");
      expect((await value(page)).zoom).toBeCloseTo(zoomBefore + 0.1, 2);
      await keys("-");
      expect((await value(page)).zoom).toBeCloseTo(zoomBefore, 2);
      await keys("]");
      expect((await value(page)).rotation).toBe(1);
      await keys("[", { modifiers: ["Shift"] });
      expect((await value(page)).rotation).toBe(-14);
      await keys("r");
      expect((await value(page)).rotation).toBe(76);
      /* A held Control makes the key the browser's: nothing happens to the picture. */
      const frozen = await value(page);
      await keys("r", { modifiers: ["Control"] });
      expect(await value(page)).toEqual(frozen);
      await keys("0");
      expect(await value(page)).toEqual({ position: { x: 0.5, y: 0.5 }, zoom: 1, rotation: 0 });
      expect(await overshoot(page)).toBeLessThan(0.5);
      /* One keystroke is one finished change, reported on release. */
      await clearEvents(page);
      await keys("ArrowUp");
      expect((await events(page)).filter((type) => type === "valuechangeend").length).toBeLessThanOrEqual(1);
    });

    test("reports a change as it happens, the end of it once, and nothing for a gesture that changed nothing", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      await clearEvents(page);
      await page.evaluate(() => {
        const range = document.querySelector<HTMLInputElement>("input[data-sk-image-cropper-range=zoom]")!;
        for (const zoom of [1.2, 1.4, 1.8]) {
          range.value = String(zoom);
          range.dispatchEvent(new Event("input", { bubbles: true }));
        }
        range.dispatchEvent(new Event("change", { bubbles: true }));
      });
      const seen = await events(page);
      expect(seen.filter((type) => type === "valuechange")).toHaveLength(3);
      expect(seen.filter((type) => type === "valuechangeend")).toHaveLength(1);
      expect(seen.at(-1)).toBe("valuechangeend");
      const last = await page.evaluate(() => window.__events.filter((entry) => entry.type === "valuechangeend").at(-1)!.detail);
      expect(last.value.zoom).toBeCloseTo(1.8, 2);
      expect(last.crop.width).toBeGreaterThan(0);
      /* Down to the floor, and then a press that changes nothing reports nothing. */
      for (let i = 0; i < 8; i += 1) await click(page, action("zoom-out"));
      expect((await value(page)).zoom).toBe(1);
      await clearEvents(page);
      await click(page, action("zoom-out"));
      expect(await events(page)).toEqual([]);
    });

    test("controlled from outside: a value set is not reported back, and the cropper draws it", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      await clearEvents(page);
      await page.evaluate(() => window.__h.setValue({ position: { x: 0.2, y: 0.8 }, zoom: 2.5, rotation: 20 }));
      await settle(page);
      const v = await value(page);
      expect(v.zoom).toBeCloseTo(2.5, 2);
      expect(v.rotation).toBe(20);
      expect(v.position.x).toBeCloseTo(0.2, 2);
      expect(v.position.y).toBeCloseTo(0.8, 2);
      expect(await events(page)).toEqual([]);
      expect(await overshoot(page)).toBeLessThan(0.5);
      /* A value that asks for more than there is lands inside the rule instead of exposing the stage. */
      await page.evaluate(() => window.__h.setValue({ position: { x: 9, y: -4 }, zoom: 50, rotation: 400 }));
      expect(await overshoot(page)).toBeLessThan(0.5);
      expect((await value(page)).zoom).toBeLessThanOrEqual(4);
      await page.evaluate(() => window.__h.setValue({ position: { x: 0.5, y: 0.5 }, zoom: 1, rotation: 0 }, { silent: false }));
      expect(await events(page)).toContain("valuechangeend");
    });

    test("reset returns to the start, reports it, and says so", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      await click(page, action("zoom-in"));
      await click(page, action("rotate-right"));
      await clearEvents(page);
      await click(page, action("reset"));
      expect(await value(page)).toEqual({ position: { x: 0.5, y: 0.5 }, zoom: 1, rotation: 0 });
      expect(await events(page)).toEqual(["valuechange", "valuechangeend"]);
      await page.waitForTimeout(150);
      expect(await page.locator("[data-sk-image-cropper-live]").textContent()).toBe("Crop reset");
    });

    test("announces what a finished change did, in words, and not while it is happening", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      const live = page.locator("[data-sk-image-cropper-live]");
      await click(page, action("rotate-right"));
      await expect(live).toHaveText("Rotation 90 degrees");
      /* Turned a quarter, a 16:9 window needs more of a 4:3 picture, so the zoom was already above 1 before the press. */
      const before = (await value(page)).zoom;
      await click(page, action("zoom-in"));
      await expect(live).toHaveText(`Zoom ${Math.round((before + 0.25) * 100)}%`);
      await click(page, `[data-sk-image-cropper-aspect="1:1"]`);
      await expect(live).toHaveText("Aspect ratio 1:1");
      expect(await live.getAttribute("aria-live")).toBe("polite");
      expect(await live.getAttribute("role")).toBe("status");
    });

    test("Apply confirms with the crop in the picture's own pixels, and the means to export it", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      await page.evaluate(() => window.__h.setValue({ position: { x: 1, y: 1 }, zoom: 2, rotation: 0 }));
      await clearEvents(page);
      await click(page, action("apply"));
      const confirm = await page.evaluate(() => window.__events.find((entry) => entry.type === "confirm")!.detail);
      expect(confirm.shape).toBe("rectangle");
      expect(confirm.aspect).toBeCloseTo(16 / 9, 3);
      /* The 16:9 window over the 800x600 picture is 800x450 at zoom 1: half of it at zoom 2, from the bottom right corner. */
      expect(confirm.crop.width).toBeCloseTo(400, 1);
      expect(confirm.crop.height).toBeCloseTo(225, 1);
      expect(confirm.crop.x + confirm.crop.width).toBeCloseTo(800, 1);
      expect(confirm.crop.y + confirm.crop.height).toBeCloseTo(600, 1);
      expect(confirm.crop.outputWidth).toBe(400);
      expect(confirm.crop.outputHeight).toBe(225);
      expect(confirm.value.zoom).toBeCloseTo(2, 3);
    });

    test("exports a rectangle at the size the window has in the picture's pixels, with the pixels the window showed", async ({ page }) => {
      await open(page, "image-cropper-cover", binding, { "data-aspect": "4:3", "data-output-type": "image/png", "data-output-width": null });
      /* The whole picture: four quarters, in the corners, at the picture's own size. */
      await page.evaluate(async () => void ((window as any).__lastBlob = window.__h.exportBlob()));
      const whole = await pixelsOf(page, "blob", [[0.05, 0.05], [0.95, 0.05], [0.05, 0.95], [0.95, 0.95]]);
      expect(whole.type).toBe("image/png");
      expect(whole.width).toBe(800);
      expect(whole.height).toBe(600);
      expect(near(whole.colours[0]!, RED)).toBe(true);
      expect(near(whole.colours[1]!, GREEN)).toBe(true);
      expect(near(whole.colours[2]!, BLUE)).toBe(true);
      expect(near(whole.colours[3]!, YELLOW)).toBe(true);

      /* Zoomed into the top left corner: the quarter that is red fills the file. */
      await page.evaluate(() => window.__h.setValue({ position: { x: 0, y: 0 }, zoom: 2, rotation: 0 }));
      await page.evaluate(async () => void ((window as any).__lastBlob = window.__h.exportBlob()));
      const corner = await pixelsOf(page, "blob", [[0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.5, 0.5]]);
      expect(corner.width).toBe(400);
      expect(corner.height).toBe(300);
      expect(near(corner.colours[0]!, RED)).toBe(true);
      expect(near(corner.colours[1]!, RED)).toBe(true);
      expect(near(corner.colours[2]!, RED)).toBe(true);

      /* The size asked for wins, and the other side follows the window's ratio. */
      await page.evaluate(async () => void ((window as any).__lastBlob = window.__h.exportBlob({ width: 200 })));
      const small = await pixelsOf(page, "blob", [[0.5, 0.5]]);
      expect(small.width).toBe(200);
      expect(small.height).toBe(150);
    });

    test("a quarter turn is in the file: the rotated picture is what is cut", async ({ page }) => {
      await open(page, "image-cropper-cover", binding, { "data-aspect": "4:3" });
      /* Turned right a quarter: red (top left) goes to the top right, green to the bottom right, blue to the top left. */
      await click(page, action("rotate-right"));
      await page.evaluate(async () => void ((window as any).__lastBlob = window.__h.exportBlob()));
      const turned = await pixelsOf(page, "blob", [[0.05, 0.05], [0.95, 0.05], [0.05, 0.95], [0.95, 0.95]]);
      expect(near(turned.colours[0]!, BLUE)).toBe(true);
      expect(near(turned.colours[1]!, RED)).toBe(true);
      expect(near(turned.colours[2]!, YELLOW)).toBe(true);
      expect(near(turned.colours[3]!, GREEN)).toBe(true);
    });

    test("a circle exports a transparent PNG with the circle already cut, whatever type was asked", async ({ page }) => {
      await open(page, "image-cropper-avatar", binding);
      await page.evaluate(async () => void ((window as any).__lastBlob = window.__h.exportBlob({ type: "image/jpeg" })));
      const circle = await pixelsOf(page, "blob", [[0.01, 0.01], [0.99, 0.01], [0.01, 0.99], [0.99, 0.99], [0.5, 0.5], [0.5, 0.02], [0.3, 0.3]]);
      expect(circle.type).toBe("image/png");
      expect(circle.width).toBe(600);
      expect(circle.height).toBe(600);
      for (const corner of circle.colours.slice(0, 4)) expect(corner[3], "corner alpha").toBe(0);
      expect(circle.colours[4]![3]).toBe(255);
      expect(circle.colours[5]![3]).toBeGreaterThan(0);
      /* Inside the circle the picture is the picture: the 600x600 centre of 800x600 is the middle of all four quarters. */
      expect(circle.colours[6]![3]).toBe(255);
      expect(near(circle.colours[6]!, RED)).toBe(true);
    });

    test("exports a JPEG of the size the page asked for when the shape allows it", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      await page.evaluate(async () => void ((window as any).__lastBlob = window.__h.exportBlob()));
      const cover = await pixelsOf(page, "blob", [[0.05, 0.05]]);
      expect(cover.type).toBe("image/jpeg");
      expect(cover.width).toBe(1600);
      expect(cover.height).toBe(900);
    });

    test("a picture replaced draws the new one, once, and leaves nothing of the old", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      await click(page, action("zoom-in"));
      const next = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#8e24aa"/></svg>')}`;
      await page.evaluate((src) => {
        const root = document.querySelector(".sk-image-cropper")!;
        root.setAttribute("data-src", src);
      }, next);
      await page.waitForFunction(() => document.querySelector(".sk-image-cropper")?.getAttribute("data-status") === "ready" && (document.querySelector("cropper-image") as any)?.$image?.naturalWidth === 300);
      await settle(page);
      expect(await page.locator("cropper-canvas").count()).toBe(1);
      expect(await overshoot(page)).toBeLessThan(0.5);
      /* The value starts over for the new picture: it is a different thing being cropped. */
      expect(await value(page)).toEqual({ position: { x: 0.5, y: 0.5 }, zoom: 1, rotation: 0 });
      await page.evaluate(async () => void ((window as any).__lastBlob = window.__h.exportBlob({ type: "image/png" })));
      const result = await pixelsOf(page, "blob", [[0.5, 0.5]]);
      expect(near(result.colours[0]!, [142, 36, 170])).toBe(true);
    });

    test("the preview draws the crop the stage shows, in the colours of the picture, round when the crop is", async ({ page }) => {
      await open(page, "image-cropper-avatar", binding);
      /* Zoomed into the top left quarter: the preview is red wherever the circle is, and clear in its corners. */
      await page.evaluate(() => window.__h.setValue({ position: { x: 0, y: 0 }, zoom: 2, rotation: 0 }));
      await page.waitForTimeout(150);
      const preview = await page.evaluate(() => {
        const canvas = document.querySelector<HTMLCanvasElement>(".sk-image-cropper__preview-canvas")!;
        const context = canvas.getContext("2d")!;
        const at = (fx: number, fy: number) => Array.from(context.getImageData(Math.floor(fx * canvas.width), Math.floor(fy * canvas.height), 1, 1).data);
        return { width: canvas.width, height: canvas.height, centre: at(0.5, 0.5), nearCentre: at(0.35, 0.4), corner: at(0.02, 0.02), radius: getComputedStyle(canvas).borderRadius };
      });
      expect(preview.width).toBeGreaterThan(0);
      expect(preview.width).toBe(preview.height);
      expect(near(preview.centre, RED)).toBe(true);
      expect(near(preview.nearCentre, RED)).toBe(true);
      expect(preview.corner[3]).toBe(0);
      expect(preview.radius).toBe("50%");
    });

    test("a picture replaced twice in a row draws only the last, and the first never lands", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      const picture = (fill: string, size: number) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${fill}"/></svg>`)}`;
      await page.evaluate(([first, second]) => {
        const root = document.querySelector(".sk-image-cropper")!;
        root.setAttribute("data-src", first!);
        root.setAttribute("data-src", second!);
      }, [picture("#8e24aa", 300), picture("#ef6c00", 500)]);
      await page.waitForFunction(() => document.querySelector(".sk-image-cropper")?.getAttribute("data-status") === "ready" && (document.querySelector("cropper-image") as any)?.$image?.naturalWidth === 500);
      await page.waitForTimeout(200);
      expect(await page.locator("cropper-canvas").count()).toBe(1);
      expect(await page.evaluate(() => (document.querySelector("cropper-image") as any).$image.naturalWidth)).toBe(500);
      expect(await overshoot(page)).toBeLessThan(0.5);
      await page.evaluate(async () => void ((window as any).__lastBlob = window.__h.exportBlob({ type: "image/png" })));
      const result = await pixelsOf(page, "blob", [[0.5, 0.5]]);
      expect(near(result.colours[0]!, [239, 108, 0])).toBe(true);
    });

    test("a starting value written as the data-value attribute is drawn, and a stored crop describes the same crop at any size", async ({ page }) => {
      await open(page, "image-cropper-cover", binding, { "data-aspect": "1:1" });
      const stored = { position: { x: 0.8, y: 0.35 }, zoom: 1.8, rotation: -12 };
      await page.evaluate((json) => document.querySelector(".sk-image-cropper")!.setAttribute("data-value", json), JSON.stringify(stored));
      await settle(page);
      const drawn = await value(page);
      expect(drawn.zoom).toBeCloseTo(1.8, 2);
      expect(drawn.rotation).toBe(-12);
      expect(drawn.position.x).toBeCloseTo(0.8, 2);
      expect(drawn.position.y).toBeCloseTo(0.35, 2);
      const wide = await crop(page);
      await page.setViewportSize({ width: 420, height: 900 });
      await settle(page);
      await page.waitForTimeout(100);
      const narrow = await crop(page);
      /* Two stage sizes, one crop: the same box of the picture, to the pixel. */
      expect(narrow!.x).toBeCloseTo(wide!.x, 0);
      expect(narrow!.width).toBeCloseTo(wide!.width, 0);
      expect(await overshoot(page)).toBeLessThan(0.5);
    });

    test("a picture that can not load says so on the stage, to a screen reader, and to the page", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      await clearEvents(page);
      await page.evaluate(() => document.querySelector(".sk-image-cropper")!.setAttribute("data-src", "/this-picture-does-not-exist.png"));
      await page.waitForSelector('.sk-image-cropper[data-status="error"]');
      const message = page.locator("[data-sk-image-cropper-message]");
      await expect(message).toHaveText("The image could not be loaded.");
      expect(await message.getAttribute("role")).toBe("alert");
      expect(await message.isVisible()).toBe(true);
      expect(await page.locator("cropper-canvas").count()).toBe(0);
      const error = await page.evaluate(() => window.__events.find((entry) => entry.type === "error")!.detail.error);
      expect(error.code).toBe("load");
      expect(error.message).toContain("could not be loaded");
      /* Nothing to apply, and the export says why instead of producing an empty file. */
      expect(await page.locator(`.sk-image-cropper ${action("apply")}`).isDisabled()).toBe(true);
      const rejected = await page.evaluate(() => window.__h.exportBlob().then(() => null, (reason: any) => reason.code));
      expect(rejected).toBe("not-ready");
    });

    test("an image from another origin can be shown, and its export fails with a message that says what to do", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      await page.evaluate((src) => document.querySelector(".sk-image-cropper")!.setAttribute("data-src", src), `${origin.url}/plain.svg`);
      await page.waitForFunction(() => document.querySelector(".sk-image-cropper")?.getAttribute("data-status") === "ready" && (document.querySelector("cropper-image") as any)?.$image?.naturalWidth === 400);
      await settle(page);
      const failure = await page.evaluate(() => window.__h.exportBlob().then(() => null, (reason: any) => ({ code: reason.code, message: reason.message })));
      expect(failure?.code).toBe("cors");
      expect(failure?.message).toContain("crossOrigin");
      expect(failure?.message).toContain("Access-Control-Allow-Origin");
    });

    test("with crossOrigin set, an image whose server allows it is cropped and exported, and one that does not is an error", async ({ page }) => {
      await open(page, "image-cropper-cover", binding, { "data-cross-origin": "anonymous" });
      await page.evaluate((src) => document.querySelector(".sk-image-cropper")!.setAttribute("data-src", src), `${origin.url}/cors.svg`);
      await page.waitForFunction(() => document.querySelector(".sk-image-cropper")?.getAttribute("data-status") === "ready" && (document.querySelector("cropper-image") as any)?.$image?.naturalWidth === 400);
      await settle(page);
      await page.evaluate(async () => void ((window as any).__lastBlob = window.__h.exportBlob({ type: "image/png" })));
      const result = await pixelsOf(page, "blob", [[0.5, 0.5]]);
      expect(result.type).toBe("image/png");
      expect(near(result.colours[0]!, [0, 150, 136])).toBe(true);

      await clearEvents(page);
      await page.evaluate((src) => document.querySelector(".sk-image-cropper")!.setAttribute("data-src", src), `${origin.url}/plain.svg`);
      await page.waitForSelector('.sk-image-cropper[data-status="error"]');
      const error = await page.evaluate(() => window.__events.find((entry) => entry.type === "error")!.detail.error);
      expect(error.code).toBe("load");
      expect(error.message).toContain("CORS");
    });

    test("disabled does nothing and is said to; read-only shows the crop and can still be applied", async ({ page }) => {
      await open(page, "image-cropper-cover", binding, { "data-disabled": "" });
      const stage = page.locator(".sk-image-cropper [data-sk-image-cropper-stage]");
      expect(await stage.getAttribute("aria-disabled")).toBe("true");
      expect(await stage.getAttribute("tabindex")).toBe("-1");
      const disabled = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLButtonElement>(".sk-image-cropper button")).every((button) => button.disabled));
      expect(disabled).toBe(true);
      expect(await page.locator(".sk-image-cropper input[type=range]").evaluateAll((inputs) => inputs.every((input) => (input as HTMLInputElement).disabled))).toBe(true);
      await clearEvents(page);
      const box = await stageBox(page);
      await page.mouse.move(box.x + 100, box.y + 100);
      await page.mouse.down();
      await page.mouse.move(box.x + 160, box.y + 140, { steps: 3 });
      await page.mouse.up();
      expect(await events(page)).toEqual([]);

      await page.evaluate(() => {
        const root = document.querySelector(".sk-image-cropper")!;
        root.removeAttribute("data-disabled");
        root.setAttribute("data-read-only", "");
      });
      await settle(page);
      expect(await page.locator(`.sk-image-cropper ${action("zoom-in")}`).isDisabled()).toBe(true);
      expect(await page.locator(`.sk-image-cropper ${action("apply")}`).isEnabled()).toBe(true);
      await page.locator(".sk-image-cropper [data-sk-image-cropper-stage]").focus();
      await page.keyboard.press("+");
      expect((await value(page)).zoom).toBe(1);
    });

    test("a free window resizes by its corners, stays inside the stage, and the picture is never left short of it", async ({ page }) => {
      await open(page, "image-cropper-cover", binding, { "data-aspect": "free" });
      await settle(page);
      const rect = () => page.evaluate(() => {
        const selection = document.querySelector("cropper-selection") as any;
        return { x: selection.x, y: selection.y, width: selection.width, height: selection.height };
      });
      const start = await rect();
      const stage = await stageBox(page);
      /* Drag the bottom right corner in and up: the window shrinks toward its top left. */
      const corner = await page.evaluate(() => {
        const handle = document.querySelector('cropper-handle[action="se-resize"]')!.getBoundingClientRect();
        return { x: handle.x + handle.width / 2, y: handle.y + handle.height / 2 };
      });
      await page.mouse.move(corner.x, corner.y);
      await page.mouse.down();
      await page.mouse.move(corner.x - 120, corner.y - 90, { steps: 8 });
      await page.mouse.up();
      const shrunk = await rect();
      expect(shrunk.width).toBeLessThan(start.width - 80);
      expect(shrunk.height).toBeLessThan(start.height - 60);
      expect(shrunk.x).toBeCloseTo(start.x, 0);
      expect(shrunk.y).toBeCloseTo(start.y, 0);
      expect(await overshoot(page)).toBeLessThan(0.5);
      const kept = await value(page);
      expect(kept.frame).toBeDefined();
      /* Far past the stage: the window stops at the stage's edge instead of leaving it. */
      const grow = await page.evaluate(() => {
        const handle = document.querySelector('cropper-handle[action="se-resize"]')!.getBoundingClientRect();
        return { x: handle.x + handle.width / 2, y: handle.y + handle.height / 2 };
      });
      await page.mouse.move(grow.x, grow.y);
      await page.mouse.down();
      await page.mouse.move(stage.x + stage.width + 300, stage.y + stage.height + 300, { steps: 8 });
      await page.mouse.up();
      const grown = await rect();
      expect(grown.x + grown.width).toBeLessThanOrEqual(stage.width + 0.5);
      expect(grown.y + grown.height).toBeLessThanOrEqual(stage.height + 0.5);
      expect(await overshoot(page)).toBeLessThan(0.5);
      expect((await crop(page))!.width).toBeGreaterThan(0);
    });

    test("follows its container: the same value draws the same crop at another width", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      await page.evaluate(() => window.__h.setValue({ position: { x: 0.3, y: 0.7 }, zoom: 2, rotation: 15 }));
      const wide = await crop(page);
      await page.setViewportSize({ width: 380, height: 800 });
      await settle(page);
      await page.waitForTimeout(100);
      const narrow = await crop(page);
      expect(await value(page)).toEqual(expect.objectContaining({ zoom: 2, rotation: 15 }));
      expect(narrow!.x).toBeCloseTo(wide!.x, 0);
      expect(narrow!.y).toBeCloseTo(wide!.y, 0);
      expect(narrow!.width).toBeCloseTo(wide!.width, 0);
      expect(await overshoot(page)).toBeLessThan(0.5);
    });

    test("fits a phone: no sideways scroll, every control a finger can hit, the stage as wide as the screen", async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true, baseURL: "http://localhost:4180" });
      const page = await context.newPage();
      try {
        await open(page, "image-cropper-avatar", binding);
        const info = await page.evaluate(() => {
          const root = document.querySelector(".sk-image-cropper")!;
          const stage = root.querySelector("[data-sk-image-cropper-stage]")!.getBoundingClientRect();
          const small = Array.from(root.querySelectorAll<HTMLElement>("button, input")).flatMap((el) => {
            const rect = el.getBoundingClientRect();
            const name = el.getAttribute("data-sk-image-cropper-action") ?? el.getAttribute("data-sk-image-cropper-aspect") ?? el.getAttribute("data-sk-image-cropper-shape") ?? el.getAttribute("type");
            /* A finger needs 44 CSS pixels each way. A text button may be narrower than that, and is still hit: it is the height that fails. */
            return rect.height < 43.5 || (el.hasAttribute("data-icon-only") && rect.width < 43.5) ? [`${el.tagName}:${name}:${Math.round(rect.width)}x${Math.round(rect.height)}`] : [];
          });
          return { scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth, stageWidth: stage.width, small, coarse: matchMedia("(pointer: coarse)").matches };
        });
        expect(info.coarse).toBe(true);
        expect(info.scrollWidth).toBeLessThanOrEqual(info.innerWidth);
        expect(info.stageWidth).toBeGreaterThan(300);
        expect(info.small).toEqual([]);
      } finally {
        await context.close();
      }
    });

    test("is a dialog's guest: it keeps focus where the dialog does, and a keystroke inside it does not close it", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      await page.evaluate(() => {
        const root = document.querySelector(".sk-image-cropper")!;
        const dialog = document.createElement("dialog");
        root.replaceWith(dialog);
        dialog.append(root);
        dialog.showModal();
        (window as any).__dialog = dialog;
      });
      await page.locator(".sk-image-cropper [data-sk-image-cropper-stage]").focus();
      const focused = await page.evaluate(() => document.activeElement?.hasAttribute("data-sk-image-cropper-stage"));
      expect(focused).toBe(true);
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("+");
      expect(await page.evaluate(() => (window as any).__dialog.open)).toBe(true);
      /* Escape is the dialog's, not the cropper's: it is not handled here, so it reaches the dialog. */
      await page.keyboard.press("Escape");
      expect(await page.evaluate(() => (window as any).__dialog.open)).toBe(false);
    });

    test("has no accessibility violations, in both colour schemes, and every control has a name", async ({ page }) => {
      for (const scheme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme: scheme });
        await open(page, "image-cropper-avatar", binding);
        await page.addScriptTag({ content: axeSource });
        /* WCAG 2.2 AA and the best practices, on the component. The page-level rules (a landmark, an h1) judge the page it is in, not it. */
        const violations = await page.evaluate(async () => {
          const axe = (window as unknown as { axe: { run: (c: Element, o: unknown) => Promise<{ violations: { id: string; nodes: { target: string[] }[] }[] }> } }).axe;
          const result = await axe.run(document.querySelector(".sk-image-cropper")!, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] },
            rules: { region: { enabled: false }, "landmark-one-main": { enabled: false }, "page-has-heading-one": { enabled: false } },
          });
          return result.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(" | ")}`);
        });
        expect(violations.map((violation) => `${scheme}: ${violation}`)).toEqual([]);
      }
      const unnamed = await page.evaluate(() => Array.from(document.querySelectorAll(".sk-image-cropper button, .sk-image-cropper input")).filter((el) => !(el.getAttribute("aria-label") || el.textContent?.trim())).map((el) => el.outerHTML.slice(0, 80)));
      expect(unnamed).toEqual([]);
      const stage = page.locator(".sk-image-cropper [data-sk-image-cropper-stage]");
      expect(await stage.getAttribute("aria-label")).toBe("Crop area: Four coloured quarters");
      const describedby = await stage.getAttribute("aria-describedby");
      expect(await page.locator(`#${describedby}`).textContent()).toContain("Arrow keys");
    });

    test("the stage has a visible focus indicator, and with reduced motion the handles do not animate", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await open(page, "image-cropper-cover", binding, { "data-aspect": "free" });
      await page.keyboard.press("Tab");
      const ring = await page.evaluate(() => {
        const stage = document.querySelector("[data-sk-image-cropper-stage]") as HTMLElement;
        stage.focus();
        const style = getComputedStyle(stage);
        return { width: Number.parseFloat(style.outlineWidth), style: style.outlineStyle };
      });
      expect(ring.style).not.toBe("none");
      expect(ring.width).toBeGreaterThan(0);
      /* `transition-property` is `all` by default; what matters is that nothing has a duration to run for. */
      const duration = await page.evaluate(() => getComputedStyle(document.querySelector('cropper-handle[action="se-resize"]')!).transitionDuration);
      expect(duration.split(",").every((part) => Number.parseFloat(part) === 0)).toBe(true);
    });

    test("taken down, it leaves nothing behind: no picture, no listeners, no live cropper", async ({ page }) => {
      await open(page, "image-cropper-cover", binding);
      const before = await page.evaluate(() => document.querySelectorAll("cropper-canvas").length);
      expect(before).toBe(1);
      await page.evaluate(() => window.__h.destroy());
      const after = await page.evaluate(() => ({
        canvases: document.querySelectorAll("cropper-canvas").length,
        status: document.querySelector(".sk-image-cropper")!.getAttribute("data-status"),
        surfaceChildren: document.querySelector("[data-sk-image-cropper-surface]")!.children.length,
      }));
      expect(after).toEqual({ canvases: 0, status: null, surfaceChildren: 0 });
      /* A destroyed cropper ignores the keyboard and the pointer, and a second destroy is not an error. */
      await page.locator(".sk-image-cropper [data-sk-image-cropper-stage]").focus();
      await page.keyboard.press("+");
      await page.evaluate(() => window.__h.destroy());
      const rejected = await page.evaluate(() => window.__h.exportBlob().then(() => null, (reason: any) => reason.code));
      expect(rejected).toBe("not-ready");
    });
  });
}

/* A second origin for the CORS gates: one picture that sends the header and one that does not. */
const origin: { url: string; server?: Server } = { url: "" };
const svg = (fill: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="${fill}"/></svg>`;

test.beforeAll(async () => {
  origin.server = createServer((request, response) => {
    const cors = request.url?.startsWith("/cors");
    response.writeHead(200, {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
      ...(cors ? { "Access-Control-Allow-Origin": "*" } : {}),
    });
    response.end(svg(cors ? "#009688" : "#795548"));
  });
  await new Promise<void>((resolve) => origin.server!.listen(0, "127.0.0.1", resolve));
  const address = origin.server!.address();
  origin.url = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}`;
});

test.afterAll(async () => {
  await new Promise<void>((resolve) => (origin.server ? origin.server.close(() => resolve()) : resolve()));
});
