import { carouselAttrs, carouselParts, connectCarouselStrips } from "@skryensya/core/carousel";
import { remountIcons } from "../icon.js";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/**
 * StripCarousel (`data-strips`): one item open, the rest as strips beside it. The engine in core owns the
 * behaviour; this only draws the system-owned prev/next it drives, at the end of the header row.
 */
export function connectStripCarousel(root: HTMLElement): () => void {
  const slides = root.querySelectorAll(`.${carouselParts.track} > .${carouselParts.slide}`).length;
  let controls: HTMLElement | null = null;
  if (slides > 1) {
    controls = document.createElement("div");
    controls.className = carouselParts.controls;
    for (const [side, icon] of [["start", "chevron-left"], ["end", "chevron-right"]] as const) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `${carouselParts.button} sk-button sk-interactive`;
      for (const [name, value] of [["data-icon-only", ""], ["data-side", side], ["data-size", "sm"], ["data-tone", "neutral"], ["data-variant", "soft"]]) {
        button.setAttribute(name!, value!);
      }
      button.innerHTML = `<span data-sk-icon="${icon}" data-sk-icon-size="md"></span>`;
      controls.append(button);
    }
    (root.querySelector(`.${carouselParts.header}`) ?? root).append(controls);
  }

  const pageAttr = root.getAttribute(carouselAttrs.defaultPage);
  const strips = connectCarouselStrips(root, {
    defaultPage: pageAttr === null ? undefined : Number(pageAttr) || 0,
    dir: root.closest("[dir=rtl]") ? "rtl" : "ltr",
  });
  root.setAttribute("data-sk-carousel-ready", "true");
  remountIcons(root);

  return () => {
    strips.destroy();
    root.removeAttribute("data-sk-carousel-ready");
    controls?.remove();
  };
}

/** Mounts only StripCarousel roots (`[data-sk-carousel][data-strips]`), apart from the other carousels. */
export const mountStripCarousel = createConnectMount({
  key: "strip-carousel",
  rootSelector: `[${carouselAttrs.root}][${carouselAttrs.strips}]`,
  connect: connectStripCarousel,
});
