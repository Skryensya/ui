import { carouselEvents, carouselParts, carouselTranslations, type CarouselGotoDetail } from "./carousel.js";

/*
 * STRIP CAROUSEL (`Carousel.strips`): one item open, the others standing beside it as strips that get
 * thinner the farther they are, the caption of the open one underneath. A carousel by behaviour (the
 * WAI-ARIA pattern: one item at a time, prev/next), an accordion by layout: nothing scrolls, the strips
 * widen and narrow. So the engine is only an index: it writes `data-distance` on every slide and the
 * sheet turns distances into widths (and animates them).
 */

/** How far a slide is from the open one, capped where the sheet stops telling distances apart. */
export const STRIP_MAX_DISTANCE = 4;

export function stripDistance(index: number, open: number): number {
  return Math.min(Math.abs(index - open), STRIP_MAX_DISTANCE);
}

export type StripCarouselOptions = {
  /** The item it opens on, counted from 0. The first by default. */
  defaultPage?: number;
  dir?: "ltr" | "rtl";
};

export type StripCarouselHandle = {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  readonly index: number;
  destroy: () => void;
};

export function connectCarouselStrips(root: HTMLElement, options: StripCarouselOptions = {}): StripCarouselHandle {
  const track = root.querySelector<HTMLElement>(`.${carouselParts.track}`);
  const slides = track ? Array.from(track.querySelectorAll<HTMLElement>(`:scope > .${carouselParts.slide}`)) : [];
  const captions = Array.from(root.querySelectorAll<HTMLElement>(`.${carouselParts.caption}`));
  const prevButton = root.querySelector<HTMLButtonElement>(`.${carouselParts.button}[data-side="start"]`);
  const nextButton = root.querySelector<HTMLButtonElement>(`.${carouselParts.button}[data-side="end"]`);
  const count = slides.length;
  const clamp = (i: number): number => Math.max(0, Math.min(count - 1, Math.round(i)));
  let index = clamp(options.defaultPage ?? 0);

  // ARIA: the WAI carousel pattern, the same names the other carousels give.
  const live = document.createElement("span");
  live.className = "sk-visually-hidden";
  live.setAttribute("aria-live", "polite");
  live.setAttribute("aria-atomic", "true");
  root.append(live);
  root.setAttribute("role", "region");
  root.setAttribute("aria-roledescription", "carousel");
  slides.forEach((slide, i) => {
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", carouselTranslations.item(i, count));
  });
  if (prevButton) prevButton.setAttribute("aria-label", carouselTranslations.prevTrigger);
  if (nextButton) nextButton.setAttribute("aria-label", carouselTranslations.nextTrigger);

  const render = (): void => {
    slides.forEach((slide, i) => {
      slide.dataset.distance = String(stripDistance(i, index));
      slide.dataset.side = i < index ? "before" : i > index ? "after" : "open";
      slide.toggleAttribute("data-active", i === index);
      // A strip's content leaves the Tab order and the tree; the strip itself still takes a click.
      for (const child of Array.from(slide.children) as HTMLElement[]) child.inert = i !== index;
    });
    captions.forEach((caption, i) => {
      caption.hidden = i !== index;
    });
    if (prevButton) prevButton.disabled = index === 0;
    if (nextButton) nextButton.disabled = index === count - 1;
  };

  const goTo = (target: number): void => {
    const to = clamp(target);
    if (!count || to === index) return;
    index = to;
    render();
    live.textContent = carouselTranslations.item(index, count);
    root.dispatchEvent(new CustomEvent(carouselEvents.change, { bubbles: true, detail: { index, count } }));
  };
  const next = (): void => goTo(index + 1);
  const prev = (): void => goTo(index - 1);

  const onClick = (event: Event): void => {
    const slide = (event.target as Element).closest?.(`.${carouselParts.slide}`) as HTMLElement | null;
    const i = slide ? slides.indexOf(slide) : -1;
    if (i >= 0 && i !== index) goTo(i);
  };
  const onKeyDown = (event: KeyboardEvent): void => {
    if ((event.target as Element).closest?.("input, textarea, select, [contenteditable]")) return;
    const forward = options.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const back = options.dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    const to = event.key === forward ? index + 1 : event.key === back ? index - 1 : event.key === "Home" ? 0 : event.key === "End" ? count - 1 : null;
    if (to === null) return;
    event.preventDefault();
    goTo(to);
  };
  const onGoto = (event: Event): void => {
    const target = (event as CustomEvent<CarouselGotoDetail>).detail?.index;
    if (typeof target === "number") goTo(target);
  };

  track?.addEventListener("click", onClick);
  prevButton?.addEventListener("click", prev);
  nextButton?.addEventListener("click", next);
  root.addEventListener("keydown", onKeyDown);
  root.addEventListener(carouselEvents.goto, onGoto);
  render();

  return {
    goTo,
    next,
    prev,
    get index() {
      return index;
    },
    destroy: () => {
      track?.removeEventListener("click", onClick);
      prevButton?.removeEventListener("click", prev);
      nextButton?.removeEventListener("click", next);
      root.removeEventListener("keydown", onKeyDown);
      root.removeEventListener(carouselEvents.goto, onGoto);
      live.remove();
      for (const slide of slides) {
        delete slide.dataset.distance;
        delete slide.dataset.side;
        slide.removeAttribute("data-active");
        for (const child of Array.from(slide.children) as HTMLElement[]) child.inert = false;
      }
      for (const caption of captions) caption.hidden = false;
    },
  };
}
