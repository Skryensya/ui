import {
  chartAreaPath,
  chartAttrs,
  chartLinePath,
  chartMax,
  chartParts,
  formatChartValue,
  type ChartFormat,
} from "@skryensya/core/chart";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = `[${chartAttrs.root}]`;

export const mountChart = createConnectMount({ key: "chart", rootSelector, connect: connectChart });

/**
 * Turns an authored series into a painted one: reads `data-value` off every entry, computes the
 * maximum once, and writes `--sk-chart-max` on the figure and `--sk-chart-value` on each entry.
 * `chart.css` divides one by the other to get a bar's height.
 *
 * The arithmetic is the whole enhancer, and that is the design (`core/chart.ts`'s banner): a bar
 * chart needs a division, not a charting library. Meter's precedent for the shape, with one
 * difference that matters. A meter reads a value that is already ON the element it paints, so it can
 * work from attributes alone; a bar's height depends on the LARGEST value in the series, which no
 * single entry knows. Hence the pass over the whole list before anything is written.
 *
 * For `line` and `area` it also draws the path into the overlay the template reserves, from core's
 * own geometry, and writes `data-rendered` so `chart.css` retires the fallback bars: the same SVG the
 * React binding renders, so one tree paints one line in both.
 *
 * It also fills in an entry's value TEXT when the author left it empty, using the same
 * `formatChartValue` the React binding calls. Without that, identical markup would announce the
 * number on one side and nothing on the other, which is exactly the divergence the symmetry gate
 * exists to catch.
 */
export function connectChart(root: HTMLElement): () => void {
  const points = Array.from(root.querySelectorAll<HTMLElement>(`.${chartParts.point}`));
  const values = points.map((point) => Number(point.getAttribute("data-value")));
  const max = chartMax(values);

  root.style.setProperty(chartAttrs.max, String(max));

  const format = (root.getAttribute("data-format") ?? undefined) as ChartFormat | undefined;
  const currency = root.getAttribute("data-currency") ?? undefined;
  const locale = root.getAttribute("data-locale") ?? undefined;
  const filled: HTMLElement[] = [];

  points.forEach((point, index) => {
    const value = values[index] ?? 0;
    point.style.setProperty(chartAttrs.value, String(value));

    const text = point.querySelector<HTMLElement>(`.${chartParts.value}`);
    if (text && text.textContent?.trim() === "") {
      text.textContent = formatChartValue(value, { currency, format, locale });
      filled.push(text);
    }
  });

  const kind = root.getAttribute("data-kind");
  const overlay = root.querySelector<HTMLElement>(`.${chartParts.overlay}`);
  let drawn: SVGSVGElement | null = null;
  if ((kind === "line" || kind === "area") && overlay && !overlay.firstElementChild) {
    const series = values.map((value, index) => ({ label: String(index), value }));
    const line = chartLinePath(series);
    if (line) {
      const svgNs = "http://www.w3.org/2000/svg";
      const path = (className: string, d: string) => {
        const node = document.createElementNS(svgNs, "path");
        node.setAttribute("class", className);
        node.setAttribute("d", d);
        return node;
      };
      drawn = document.createElementNS(svgNs, "svg");
      drawn.setAttribute("class", chartParts.overlaySvg);
      drawn.setAttribute("preserveAspectRatio", "none");
      drawn.setAttribute("viewBox", "0 0 100 100");
      if (kind === "area") drawn.append(path(chartParts.overlayArea, chartAreaPath(series)));
      drawn.append(path(chartParts.overlayLine, line));
      overlay.append(drawn);
      root.setAttribute(chartAttrs.rendered, "");
    }
  }

  return () => {
    // Only what this enhancer drew: an overlay an author wrote by hand is not ours to remove.
    if (drawn) {
      drawn.remove();
      root.removeAttribute(chartAttrs.rendered);
    }
    root.style.removeProperty(chartAttrs.max);
    for (const point of points) point.style.removeProperty(chartAttrs.value);
    // Only the ones this enhancer wrote: an author's own string is not ours to clear.
    for (const text of filled) text.textContent = "";
  };
}
