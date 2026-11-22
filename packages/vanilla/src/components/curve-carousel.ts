import { bendCarouselSlides, carouselAttrs, carouselParts, carouselTranslations, connectCurveRing } from "@skryensya/core/carousel";
import { prefersReducedMotion } from "@skryensya/core/reduced-motion";
import { remountIcons } from "../icon.js";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/**
 * CurveCarousel (`data-curve`): the wheel. No machine and no Svelte: the ring engine in core
 * (`connectCurveRing`) owns the behaviour, and this only draws the system-owned chrome it drives, the
 * stepper and, under autoplay, the pause toggle (WCAG 2.2.2), then cuts the bands when `data-bend` asks.
 */
export function connectCurveCarousel(root: HTMLElement): () => void {
  const track = root.querySelector<HTMLElement>(`.${carouselParts.track}`);
  const slides = track ? track.querySelectorAll(`.${carouselParts.slide}`).length : 0;
  const cleanups: Array<() => void> = [];

  const autoplayAttr = root.getAttribute(carouselAttrs.autoplay);
  const delay = autoplayAttr === null ? 0 : Number(autoplayAttr) > 0 ? Number(autoplayAttr) : 4000;

  if (slides > 1) {
    const controls = document.createElement("div");
    controls.className = carouselParts.controls;
    if (delay) {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = `${carouselParts.button} ${carouselParts.autoplay} sk-button sk-interactive`;
      for (const [name, value] of [["data-icon-only", ""], ["data-size", "sm"], ["data-tone", "neutral"], ["data-variant", "soft"]]) {
        toggle.setAttribute(name!, value!);
      }
      toggle.setAttribute("aria-label", carouselTranslations.autoplayStop);
      toggle.innerHTML =
        '<span data-glyph="pause"><span data-sk-icon="pause" data-sk-icon-size="md"></span></span>' +
        '<span data-glyph="play"><span data-sk-icon="play" data-sk-icon-size="md"></span></span>';
      controls.append(toggle);
    }
    const stepper = document.createElement("div");
    stepper.className = carouselParts.stepper;
    stepper.setAttribute("role", "group");
    for (let i = 0; i < slides; i++) {
      const step = document.createElement("button");
      step.type = "button";
      step.className = carouselParts.step;
      const fill = document.createElement("span");
      fill.className = carouselParts.stepProgress;
      step.append(fill);
      stepper.append(step);
    }
    controls.append(stepper);
    root.append(controls);
    cleanups.push(() => controls.remove());
  }

  // `data-fade-edge` is the sheet's on a wheel (both sides, always): no scroll for FadeEdge to watch.
  // The bands are cut before the engine measures, so it lays them on the circle at once.
  if (root.hasAttribute(carouselAttrs.bend)) cleanups.push(bendCarouselSlides(root));

  const pageAttr = root.getAttribute(carouselAttrs.defaultPage);
  const ring = connectCurveRing(root, {
    curve: root.getAttribute(carouselAttrs.curve) === "convex" ? "convex" : "concave",
    infinite: root.getAttribute(carouselAttrs.infinite) !== "off",
    momentum: root.getAttribute(carouselAttrs.momentum) !== "off",
    autoplay: delay,
    defaultPage: pageAttr === null ? undefined : Number(pageAttr) || 0,
    dir: root.closest("[dir=rtl]") ? "rtl" : "ltr",
    reducedMotion: prefersReducedMotion(),
    focus: root.hasAttribute(carouselAttrs.focus),
  });
  root.setAttribute("data-sk-carousel-ready", "true");
  remountIcons(root);

  return () => {
    ring.destroy();
    root.removeAttribute("data-sk-carousel-ready");
    for (const cleanup of cleanups.reverse()) cleanup();
  };
}

/**
 * Mounts only CurveCarousel roots (`[data-sk-carousel][data-curve]`). Its own module, apart from the flat
 * Carousel's, so a page with only a wheel loads neither Svelte nor Zag's carousel machine.
 */
export const mountCurveCarousel = createConnectMount({
  key: "curve-carousel",
  rootSelector: `[${carouselAttrs.root}][${carouselAttrs.curve}]`,
  connect: connectCurveCarousel,
});
