import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it } from "vitest";
import { mountScrollHint } from "./scroll-hint.js";

function mount() {
  document.body.innerHTML = `<div id="region"></div><div data-sk-scroll-hint data-axis="horizontal" data-scroller="#region" hidden><span aria-hidden="true">→</span><span>Scroll for more</span></div>`;
  const region = document.getElementById("region")!;
  Object.defineProperties(region, { clientWidth: { value: 100 }, scrollWidth: { value: 400 } });
  expect(mountScrollHint(document)).toBe(1);
  return { region, hint: document.querySelector<HTMLElement>("[data-sk-scroll-hint]")! };
}

afterEach(() => { document.body.innerHTML = ""; });
describe("ScrollHint Vanilla", () => {
  it("mounts once and dismisses after horizontal scroll", () => {
    const { region, hint } = mount();
    expect(mountScrollHint(document)).toBe(0);
    expect(hint.hidden).toBe(false);
    region.scrollLeft = 10; fireEvent.scroll(region);
    expect(hint.hidden).toBe(true);
    region.scrollLeft = 0; fireEvent.scroll(region);
    expect(hint.hidden).toBe(true);
  });
});
