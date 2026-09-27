import type { Page } from "@playwright/test";

/*
 * THE FROSTED CONTRAST FLOOR, measured the one way every frosted gate shares.
 *
 * A frosted face sits over a backdrop nobody controls, so its text has to stay legible over the worst
 * one. The worst is not an average photo: it is solid black or solid white under the sheet, which blur
 * cannot soften, because blurring a flat colour returns the same colour. So the ink is composited over
 * the face over each extreme, and the lower of the two ratios is the one the material has to answer for.
 *
 * The face is every background between the ink and the frosted surface, stacked: a tab's own paint over
 * the list's sheet, a selected option over its track. WCAG 2.x relative luminance, on the colours the
 * browser actually computed, parsed through a canvas so any syntax the computed value uses (oklch,
 * color-mix results, rgb with alpha) reads the same.
 */
export const TEXT_FLOOR = 4.5;

/**
 * `ink` is the element whose text colour is measured; `surface` (defaults to `ink`) is the frosted
 * element whose sheet the backdrop shows through. Selectors, resolved in the page.
 */
export async function worstContrast(page: Page, ink: string, surface: string = ink): Promise<number> {
  return page.evaluate(
    ({ ink, surface }) => {
      const inkEl = document.querySelector<HTMLElement>(ink);
      const surfaceEl = document.querySelector<HTMLElement>(surface);
      if (!inkEl || !surfaceEl) throw new Error(`worstContrast: nothing matches ${!inkEl ? ink : surface}`);
      if (!surfaceEl.contains(inkEl)) throw new Error(`worstContrast: ${ink} is not inside ${surface}`);

      const layers: string[] = [];
      for (let el: HTMLElement | null = inkEl; el; el = el.parentElement) {
        layers.unshift(getComputedStyle(el).backgroundColor);
        if (el === surfaceEl) break;
      }
      const color = getComputedStyle(inkEl).color;

      const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
      const paint = (...fills: string[]) => {
        ctx.clearRect(0, 0, 1, 1);
        for (const fill of fills) {
          ctx.fillStyle = fill;
          ctx.fillRect(0, 0, 1, 1);
        }
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        return [r!, g!, b!];
      };
      const lum = ([r, g, b]: number[]) =>
        [r!, g!, b!]
          .map((c) => c / 255)
          .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
          .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i]!, 0);
      const ratio = (a: number[], b: number[]) => {
        const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
        return (hi! + 0.05) / (lo! + 0.05);
      };
      return Math.min(
        ...["#000", "#fff"].map((backdrop) => ratio(paint(backdrop, ...layers), paint(backdrop, ...layers, color))),
      );
    },
    { ink, surface },
  );
}

export async function setScheme(page: Page, scheme: "light" | "dark" | ""): Promise<void> {
  await page.evaluate((scheme) => (document.documentElement.style.colorScheme = scheme), scheme);
  // Faces transition their colour like any state change; read them once they have landed.
  await page.waitForTimeout(400);
}
