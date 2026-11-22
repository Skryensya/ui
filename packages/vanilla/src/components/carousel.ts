import { carouselAttrs } from "@skryensya/core/carousel";
import { mountCurveCarousel } from "./curve-carousel.js";
import { mountStripCarousel } from "./strip-carousel.js";
import Carousel from "./Carousel.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/**
 * Mounts only authored Carousel roots; it never scans or imports another enhancer.
 *
 * The flat Carousel is `@zag-js/carousel` behind a private Svelte component (see `Carousel.svelte`);
 * the ring (`data-curve`) is `connectCurveCarousel`. The consumer contract is the same for both:
 * `[data-sk-carousel]` markup in, `sk:carouselchange` out, `sk:carouselgoto` in.
 */
const mountFlat = createSvelteMount({
  key: "carousel",
  rootSelector: `[${carouselAttrs.root}]:not([${carouselAttrs.curve}]):not([${carouselAttrs.strips}])`,
  Component: Carousel,
});

export { connectCurveCarousel, mountCurveCarousel } from "./curve-carousel.js";
export { connectStripCarousel, mountStripCarousel } from "./strip-carousel.js";

/** All of them: the flat Carousels, the wheels and the strips. The auto-loader loads each on its own (`registry.ts`). */
export const mountCarousel = (target?: Parameters<typeof mountFlat>[0]): number => mountFlat(target) + mountCurveCarousel(target) + mountStripCarousel(target);
