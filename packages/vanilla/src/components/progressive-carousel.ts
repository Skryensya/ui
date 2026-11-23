import { carouselAttrs, carouselParts, connectProgressiveTrack } from "@skryensya/core/carousel";
import { remountIcons } from "../icon.js";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/**
 * ProgressiveCarousel (`data-progressive`): a circular row whose widths shrink progressively. The engine in
 * core owns the behaviour; this only draws the system-owned prev/next it drives, large enough to tap, at the
 * end of the bottom row.
 */
export function connectProgressiveCarousel(root: HTMLElement): () => void {
  const slides = root.querySelectorAll(`.${carouselParts.track} > .${carouselParts.slide}`).length;
  let controls: HTMLElement | null = null;
  if (slides > 1) {
    controls = document.createElement("div");
    controls.className = carouselParts.controls;
    for (const [side, icon] of [["start", "chevron-left"], ["end", "chevron-right"]] as const) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `${carouselParts.button} sk-button sk-interactive`;
      for (const [name, value] of [["data-icon-only", ""], ["data-side", side], ["data-size", "md"], ["data-tone", "neutral"], ["data-variant", "soft"]]) {
        button.setAttribute(name!, value!);
      }
      button.innerHTML = `<span data-sk-icon="${icon}" data-sk-icon-size="md"></span>`;
      controls.append(button);
    }
    root.append(controls);
  }

  const pageAttr = root.getAttribute(carouselAttrs.defaultPage);
  const track = connectProgressiveTrack(root, {
    defaultPage: pageAttr === null ? undefined : Number(pageAttr) || 0,
    dir: root.closest("[dir=rtl]") ? "rtl" : "ltr",
  });
  root.setAttribute("data-sk-carousel-ready", "true");
  remountIcons(root);

  return () => {
    track.destroy();
    root.removeAttribute("data-sk-carousel-ready");
    controls?.remove();
  };
}

/** Mounts only ProgressiveCarousel roots (`[data-sk-carousel][data-progressive]`), apart from the other carousels. */
export const mountProgressiveCarousel = createConnectMount({
  key: "progressive-carousel",
  rootSelector: `[${carouselAttrs.root}][${carouselAttrs.progressive}]`,
  connect: connectProgressiveCarousel,
});
