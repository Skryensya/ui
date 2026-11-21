import { fireEvent, waitFor } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mountTooltip } from "./tooltip.js";

/*
 * The enhancer renders nothing: it scans the authored trigger/positioner/content and patches Zag's
 * props onto them. jsdom has no anchor positioning, so every test here is on the FALLBACK path,
 * where the machine is the one that places the box and its inline style must survive.
 */
function markup({ root = "", arrow = false } = {}) {
  document.body.innerHTML = `<span class="sk-tooltip" data-sk-anchor ${root}>
    <button class="sk-tooltip__trigger" data-sk-anchor-trigger type="button">Eliminar</button>
    <span class="sk-tooltip__positioner sk-anchored" data-sk-anchor-positioner>
      <span class="sk-tooltip__content" data-sk-anchor-content>Elimina y no se puede deshacer</span>
      ${arrow ? '<span class="sk-anchored-arrow" aria-hidden="true"></span>' : ""}
    </span>
  </span>`;
  const element = document.querySelector<HTMLElement>("[data-sk-anchor]")!;
  expect(mountTooltip(document)).toBe(1);
  return element;
}

const trigger = () => document.querySelector<HTMLElement>("[data-sk-anchor-trigger]")!;
const content = () => document.querySelector<HTMLElement>("[data-sk-anchor-content]")!;

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Tooltip Vanilla contracts", () => {
  it("mounts on the attribute it scans for, and only once", () => {
    markup();
    // Keyed by the mount point, so the lifecycle markers share its prefix instead of inventing one.
    expect(document.querySelector("[data-sk-anchor-ready]")).toBeTruthy();
    expect(mountTooltip(document)).toBe(0);
  });

  it("describes the trigger rather than naming it", async () => {
    markup();
    expect(trigger().getAttribute("aria-describedby")).toBeNull();

    fireEvent.pointerMove(trigger(), { pointerType: "mouse" });

    await waitFor(() => expect(content().getAttribute("data-state")).toBe("open"));
    // The name still comes from the control's own text; the tooltip only adds a description.
    expect(trigger().getAttribute("aria-describedby")).toBe(content().id);
    expect(content().getAttribute("role")).toBe("tooltip");
  });

  it("closes when the pointer leaves", async () => {
    markup();

    fireEvent.pointerMove(trigger(), { pointerType: "mouse" });
    await waitFor(() => expect(content().getAttribute("data-state")).toBe("open"));

    fireEvent.pointerLeave(trigger(), { pointerType: "mouse" });
    await waitFor(() => expect(content().getAttribute("data-state")).toBe("closed"));
  });

  it("announces its open state to whatever is listening", async () => {
    const root = markup();
    const onOpenChange = vi.fn();
    root.addEventListener("sk:tooltipopenchange", onOpenChange);

    fireEvent.pointerMove(trigger(), { pointerType: "mouse" });

    await waitFor(() =>
      expect(onOpenChange).toHaveBeenCalledWith(expect.objectContaining({ detail: { open: true } })),
    );
  });

  it("stays shut while disabled", async () => {
    markup({ root: "data-disabled" });

    fireEvent.pointerMove(trigger(), { pointerType: "mouse" });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(content().getAttribute("data-state")).not.toBe("open");
  });

  it("resolves the placement onto the positioner, default included", () => {
    markup();
    const positioner = document.querySelector<HTMLElement>("[data-sk-anchor-positioner]")!;

    // Written out rather than left absent: the arrow's rules go by this attribute and the pattern's
    // own default is the other axis, so a tooltip without one ended up box up, arrow down.
    expect(positioner.getAttribute("data-sk-placement")).toBe("block-start");
  });

  it("copies an authored placement and ignores one outside the four", () => {
    markup({ root: 'data-sk-placement="inline-end"' });
    expect(
      document.querySelector("[data-sk-anchor-positioner]")?.getAttribute("data-sk-placement"),
    ).toBe("inline-end");

    document.body.innerHTML = "";
    markup({ root: 'data-sk-placement="diagonal"' });
    expect(
      document.querySelector("[data-sk-anchor-positioner]")?.getAttribute("data-sk-placement"),
    ).toBe("block-start");
  });

  it("marks the content unreachable only when hoverable is opted out of", async () => {
    markup();
    fireEvent.pointerMove(trigger(), { pointerType: "mouse" });
    await waitFor(() => expect(content().getAttribute("data-state")).toBe("open"));
    // Reachable is the sheet's default (WCAG 1.4.13), so nothing is written for it.
    expect(content().hasAttribute("data-interactive")).toBe(false);

    document.body.innerHTML = "";
    markup({ root: 'data-interactive="false"' });
    expect(content().getAttribute("data-interactive")).toBe("false");
  });

  it("lets the machine place the arrow where the browser cannot", async () => {
    markup({ arrow: true });

    fireEvent.pointerMove(trigger(), { pointerType: "mouse" });

    const arrow = document.querySelector<HTMLElement>(".sk-anchored-arrow")!;
    // On the fallback path the machine owns the geometry, so the arrow is its `[data-part=arrow]`
    // and carries the side the machine actually resolved.
    await waitFor(() => expect(arrow.getAttribute("data-part")).toBe("arrow"));
    expect(arrow.getAttribute("data-side")).toBe(content().getAttribute("data-side"));
  });

  /*
   * The box is `position: fixed` (`.sk-anchored`), so the popper has to measure in viewport space too.
   * Placed in document space it lands one scroll offset away from its trigger. jsdom lays nothing out,
   * so the geometry is stubbed: a 80x20 trigger 300px down the VIEWPORT, a 120x30 box.
   */
  it.each([
    ["no scroll", 0, 0],
    ["the document scrolled", 700, 0],
    ["a scrolling container", 0, 250],
  ])("places itself against its trigger in viewport space with %s", async (_, pageScroll, containerScroll) => {
    document.body.innerHTML = `<div class="scroller" style="overflow: auto; height: 200px"><span class="sk-tooltip" data-sk-anchor>
      <button class="sk-tooltip__trigger" data-sk-anchor-trigger type="button">Eliminar</button>
      <span class="sk-tooltip__positioner sk-anchored" data-sk-anchor-positioner>
        <span class="sk-tooltip__content" data-sk-anchor-content>Elimina</span>
      </span>
    </span></div>`;
    const scroller = document.querySelector<HTMLElement>(".scroller")!;
    const positioner = document.querySelector<HTMLElement>("[data-sk-anchor-positioner]")!;
    const rect = (x: number, y: number, width: number, height: number) => () => DOMRect.fromRect({ x, y, width, height });
    vi.spyOn(window, "scrollY", "get").mockReturnValue(pageScroll);
    vi.spyOn(window, "pageYOffset", "get").mockReturnValue(pageScroll);
    scroller.scrollTop = containerScroll;
    trigger().getBoundingClientRect = rect(100, 300, 80, 20);
    positioner.getBoundingClientRect = rect(0, 0, 120, 30);
    Object.defineProperty(positioner, "offsetWidth", { value: 120 });
    Object.defineProperty(positioner, "offsetHeight", { value: 30 });
    expect(mountTooltip(document)).toBe(1);

    fireEvent.pointerMove(trigger(), { pointerType: "mouse" });

    await waitFor(() => expect(positioner.style.getPropertyValue("--y")).not.toBe(""));
    expect(positioner.style.position).toBe("fixed");
    // Above the trigger (the tooltip's default side), 4px gutter: 300 - 30 - 4, whatever has scrolled.
    // (`--x` is not asserted: jsdom's viewport is 0px wide, so the popper's shift clamps it.)
    expect(positioner.style.getPropertyValue("--y")).toBe("266px");
    vi.restoreAllMocks();
  });

  it("gives itself an id when the author left none", () => {
    const root = markup();
    expect(root.id).toMatch(/^sk-tooltip-\d+$/);
  });
});
