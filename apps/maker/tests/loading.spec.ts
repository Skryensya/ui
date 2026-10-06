import { expect, test } from "@playwright/test";
import { openMaker } from "./fixtures";

/*
 * THE FIRST VIEW OF THE CANVAS: pages arrive where they belong, in the Maker's own theme, instead of flashing
 * in white at the origin and sliding into place.
 */
test("a page is shown only once it is rendered, and it does not move afterwards", async ({ page }) => {
  await openMaker(page);
  const board = page.locator(".maker-artboard").first();
  await expect(board).toHaveAttribute("data-settled", "");
  await expect(page.locator(".maker-canvas__world")).not.toHaveAttribute("data-pending", "");

  /* Framed once: the artboard is inside the canvas the moment the world is shown, and stays exactly there. */
  const canvas = (await page.locator(".maker-canvas").boundingBox())!;
  const first = (await board.locator(".maker-stage__frame").boundingBox())!;
  expect(first.x).toBeGreaterThanOrEqual(canvas.x);
  expect(first.x + first.width).toBeLessThanOrEqual(canvas.x + canvas.width + 1);
  await page.waitForTimeout(700);
  const later = (await board.locator(".maker-stage__frame").boundingBox())!;
  expect(later.x).toBeCloseTo(first.x, 0);
  expect(later.y).toBeCloseTo(first.y, 0);
  expect(later.width).toBeCloseTo(first.width, 0);
});

test("the iframe is not drawn before its page is, and the world is not drawn before it is framed", async ({ page }) => {
  /* Hold the stage's own script back, so the first state the Maker sees is a stage that has loaded and not yet rendered. */
  await page.route("**/src/stage/entry.tsx*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    await route.continue();
  });
  const project = await page.request.post("/api/projects", { data: { name: `Loading ${process.pid}` } });
  await page.goto(`/?project=${((await project.json()) as { id: string }).id}`);

  const board = page.locator(".maker-artboard").first();
  await expect(board).toBeAttached();
  await expect(page.locator(".maker-canvas__world")).toHaveAttribute("data-pending", "");
  await expect(board).not.toHaveAttribute("data-settled", "");
  await expect(board.locator("iframe")).toHaveCSS("visibility", "hidden");

  await expect(board).toHaveAttribute("data-settled", "");
  await expect(board.locator("iframe")).toHaveCSS("visibility", "visible");
  await expect(page.locator(".maker-canvas__world")).not.toHaveAttribute("data-pending", "");
});

test("the stage takes the Maker's colour scheme before it paints, not after", async ({ page }) => {
  await openMaker(page);
  const seen = await page.evaluate(
    () =>
      new Promise<{ scheme: string | null; colorScheme: string }>((resolve) => {
        document.documentElement.setAttribute("data-scheme", "dark");
        const frame = document.createElement("iframe");
        frame.src = "/stage.html";
        frame.style.cssText = "position:fixed;inline-size:300px;block-size:200px;inset-block-start:0;inset-inline-start:0;visibility:hidden";
        document.body.append(frame);
        /* `load` fires once the document has parsed, before the stage's module graph has finished and so before
           the Maker's own effect could have set anything: what is on the root now came from the document's head. */
        frame.addEventListener("load", () => {
          const root = frame.contentDocument!.documentElement;
          resolve({ scheme: root.getAttribute("data-scheme"), colorScheme: root.style.colorScheme });
          frame.remove();
        });
      }),
  );
  expect(seen).toEqual({ scheme: "dark", colorScheme: "dark" });
});
