import { describe, expect, it } from "vitest";
import { chartAreaPath, chartLinePath, chartParts } from "@skryensya/core/chart";
import { connectChart } from "./chart.js";

const points = [
  { label: "S1", value: 148 },
  { label: "S2", value: 121 },
  { label: "S3", value: 103 },
];

/* The markup the contract's template emits: an empty overlay, then the series as a list. */
function chart(kind: "bar" | "line" | "area"): HTMLElement {
  document.body.innerHTML = `<figure class="sk-chart" data-sk-chart data-kind="${kind}" aria-label="Peso">
    <div class="sk-chart__plot">
      <div class="sk-chart__overlay" aria-hidden="true"></div>
      <ul class="sk-chart__series" role="list">
        ${points.map((p) => `<li class="sk-chart__point" data-value="${p.value}"><span class="sk-chart__bar"></span><span class="sk-chart__label">${p.label}</span><span class="sk-chart__value"></span></li>`).join("")}
      </ul>
    </div>
  </figure>`;
  return document.querySelector<HTMLElement>("[data-sk-chart]")!;
}

describe("connectChart draws line and area like the React binding", () => {
  it("leaves the overlay empty for bars", () => {
    const root = chart("bar");
    connectChart(root);
    expect(root.querySelector(`.${chartParts.overlay}`)?.childElementCount).toBe(0);
    expect(root.hasAttribute("data-rendered")).toBe(false);
  });

  it("paints a line from core's geometry and flags the chart as rendered", () => {
    const root = chart("line");
    connectChart(root);
    expect(root.querySelector(`.${chartParts.overlayLine}`)?.getAttribute("d")).toBe(chartLinePath(points));
    expect(root.querySelector(`.${chartParts.overlayArea}`)).toBeNull();
    expect(root.hasAttribute("data-rendered")).toBe(true);
  });

  it("paints an area as two paths and removes both on disconnect", () => {
    const root = chart("area");
    const disconnect = connectChart(root);
    expect(root.querySelector(`.${chartParts.overlayArea}`)?.getAttribute("d")).toBe(chartAreaPath(points));
    expect(root.querySelector(`.${chartParts.overlayLine}`)?.getAttribute("d")).toBe(chartLinePath(points));
    disconnect();
    expect(root.querySelector(`.${chartParts.overlay}`)?.childElementCount).toBe(0);
    expect(root.hasAttribute("data-rendered")).toBe(false);
  });
});
