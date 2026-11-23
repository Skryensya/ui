import { carouselEvents, carouselParts, carouselTranslations, type CarouselGotoDetail } from "./carousel.js";
import { prefersReducedMotion } from "./reduced-motion.js";

/*
 * PROGRESSIVE CAROUSEL (`Carousel.progressive`): a circular row of slides whose widths shrink
 * progressively. The active slide is always first, on the start side; the next ones follow as ever
 * narrower strips. Moving on, the active slide leaves past the start edge, every other slide moves up a
 * place and widens, and a new one comes in past the end edge as the narrowest strip.
 *
 * The engine places each slide by its distance from the active one (`progressiveSlot`) at the widths
 * `progressiveWidths` gives, and animates every slide on ONE clock: each frame interpolates every
 * position and width with the same progress, so the gaps between neighbours are always what the layout
 * says, however a move or a hover interrupts another. (Per-slide CSS transitions cannot promise that: an
 * interrupted transition is shortened by how far it got, differently on every slide, and neighbours
 * drift apart.) A slide whose move wraps round the loop goes out one side and comes back on the other.
 */

/**
 * Width weights of the visible places: the active slide, three that shrink, then the narrowest strips (as
 * many as there are slides for, up to `MAX_NARROWEST`). Narrow, it is a plain carousel: one slide the full
 * width, the next one coming in as it leaves.
 */
const LEADING_WEIGHTS = [16, 4, 2, 1];
const NARROWEST_WEIGHT = 0.25;
const MAX_NARROWEST = 4;
/** Below this container width (px) the row is a plain carousel, one slide at a time. */
export const PROGRESSIVE_NARROW = 480;

/** How many places are on show. One slide always waits off-stage (from three up), ready to come in the
 * moment the row moves: with every slide on show, the last place would stand empty while one went round. */
export function progressiveVisible(width: number, count: number, narrow = width < PROGRESSIVE_NARROW): number {
  if (count <= 1) return 1;
  if (narrow) return 1;
  return Math.min(count > 2 ? count - 1 : count, LEADING_WEIGHTS.length + MAX_NARROWEST);
}

/**
 * The gaps after each visible place but the last: the full `gap` between the large slides, half of it
 * between the narrowest strips, and half from the last large slide to the first narrowest one.
 */
export function progressiveGaps(visible: number, gap: number): number[] {
  return Array.from({ length: Math.max(0, visible - 1) }, (_, k) => (k + 1 >= LEADING_WEIGHTS.length ? gap / 2 : gap));
}

/** The widths (px) of the visible places for a track `width` wide, whose large slides stand `gap` apart. */
export function progressiveWidths(width: number, gap: number, count: number, narrow = width < PROGRESSIVE_NARROW): number[] {
  const visible = progressiveVisible(width, count, narrow);
  if (visible === 1) return [width];
  const weights = Array.from({ length: visible }, (_, k) => LEADING_WEIGHTS[k] ?? NARROWEST_WEIGHT);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const free = Math.max(0, width - progressiveGaps(visible, gap).reduce((sum, g) => sum + g, 0));
  return weights.map((weight) => (free * weight) / total);
}

/**
 * The widths with the place `hovered` grown by `factor` × √(its width), the others giving that up in
 * proportion to theirs, so the row stays exactly as wide. The square root keeps the growth tied to the
 * size (a larger slide grows more) while easing it off as slides get large: the active slide grows a
 * little, a hairline grows by most of itself.
 */
export function progressiveHover(widths: readonly number[], hovered: number, factor: number): number[] {
  if (widths.length < 2 || hovered < 0 || hovered >= widths.length) return [...widths];
  const rest = widths.reduce((sum, width, k) => (k === hovered ? sum : sum + width), 0);
  const give = Math.min(factor * Math.sqrt(widths[hovered]!), rest * 0.5);
  return widths.map((width, k) => (k === hovered ? width + give : width - (give * width) / rest));
}

/** How much a hovered slide grows: this × √(its width) px. */
export const PROGRESSIVE_HOVER = 1.6;

export type ProgressiveSlot = { kind: "visible"; place: number } | { kind: "before" } | { kind: "after" };

/**
 * Where the slide `distance` places after the active one stands, with `visible` places on show: in one of
 * them, waiting past the end edge, or (the one just left behind) past the start edge.
 */
export function progressiveSlot(distance: number, count: number, visible: number): ProgressiveSlot {
  if (distance < visible) return { kind: "visible", place: distance };
  return distance === count - 1 ? { kind: "before" } : { kind: "after" };
}

/** The circular distance from `from` to `to`, forwards, on a loop of `count`. */
export function forwardDistance(from: number, to: number, count: number): number {
  return (((to - from) % count) + count) % count;
}

export type ProgressiveCarouselOptions = {
  /** The slide it opens on, counted from 0. The first by default. */
  defaultPage?: number;
  dir?: "ltr" | "rtl";
};

export type ProgressiveCarouselHandle = {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  readonly index: number;
  destroy: () => void;
};

type Place = { x: number; width: number; opacity: number };

/** A step and a hover, in ms, and their curve: quick to start, long to settle. The root's
 * `--sk-carousel-progressive-step` / `-hover` custom properties (ms) override these. Reduced motion keeps only a fade. */
const STEP_DURATION = 520;
const HOVER_DURATION = 200;
const REDUCED_DURATION = 200;
const cssMs = (el: Element, name: string, fallback: number): number => Number.parseFloat(getComputedStyle(el).getPropertyValue(name)) || fallback;
/** At most how far (px) a slide coming on starts (half its own width at most, or a strip would start out of sight) from its place, toward the edge it enters by. */
const ENTER_OFFSET = 48;
const clamp01 = (p: number): number => Math.min(1, Math.max(0, p));
const ease = (p: number): number => 1 - (1 - p) ** 5;
/**
 * Position and width follow `ease`. Opacity has its own clock: a slide coming in fades up fast, a slide
 * going out stays solid until it has left (the track clips it) so it never shows what is behind it.
 */
const lerp = (a: Place, b: Place, p: number): Place => {
  const fade = b.opacity > a.opacity ? 1 - (1 - clamp01(p / 0.5)) ** 3 : p < 1 ? 0 : 1;
  const e = ease(p);
  return { x: a.x + (b.x - a.x) * e, width: a.width + (b.width - a.width) * e, opacity: a.opacity + (b.opacity - a.opacity) * fade };
};

export function connectProgressiveTrack(root: HTMLElement, options: ProgressiveCarouselOptions = {}): ProgressiveCarouselHandle {
  const track = root.querySelector<HTMLElement>(`.${carouselParts.track}`);
  const slides = track ? Array.from(track.querySelectorAll<HTMLElement>(`:scope > .${carouselParts.slide}`)) : [];
  const captions = Array.from(root.querySelectorAll<HTMLElement>(`.${carouselParts.caption}`));
  const prevButton = root.querySelector<HTMLButtonElement>(`.${carouselParts.button}[data-side="start"]`);
  const nextButton = root.querySelector<HTMLButtonElement>(`.${carouselParts.button}[data-side="end"]`);
  const count = slides.length;
  const wrap = (i: number): number => ((Math.round(i) % count) + count) % count;
  let index = count ? wrap(options.defaultPage ?? 0) : 0;
  let widths: number[] = [];
  let base: number[] = [];
  let hovered = -1;
  let trackWidth = 0;
  let gap = 0;
  let gaps: number[] = [];
  // The clock: where each slide is now, and the move under way (from, to, since when, what comes after).
  const now = new Map<HTMLElement, Place>();
  const from = new Map<HTMLElement, Place>();
  const to = new Map<HTMLElement, Place>();
  let started = 0;
  let duration = STEP_DURATION;
  let stepMs = STEP_DURATION;
  let hoverMs = HOVER_DURATION;
  let frame = 0;
  let after: (() => void) | null = null;
  // Slides out on their first leg (leaving past one edge); they come back in on the other side.
  let returning: Array<{ slide: HTMLElement; via: "before" | "after" }> = [];

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
  prevButton?.setAttribute("aria-label", carouselTranslations.prevTrigger);
  nextButton?.setAttribute("aria-label", carouselTranslations.nextTrigger);

  const placeOf = (slot: ProgressiveSlot | "before" | "after"): Place => {
    const kind = typeof slot === "string" ? slot : slot.kind;
    if (kind === "before") return { x: -((widths[0] ?? 0) + gap), width: widths[0] ?? 0, opacity: 0 };
    if (kind === "after") return { x: trackWidth + (gaps[gaps.length - 1] ?? gap), width: widths[widths.length - 1] ?? 0, opacity: 0 };
    const place = (slot as { place: number }).place;
    let x = 0;
    for (let k = 0; k < place; k++) x += widths[k]! + gaps[k]!;
    return { x, width: widths[place]!, opacity: 1 };
  };
  const write = (slide: HTMLElement, place: Place): void => {
    now.set(slide, place);
    const x = options.dir === "rtl" ? trackWidth - place.x - place.width : place.x;
    slide.style.transform = `translateX(${x.toFixed(2)}px)`;
    slide.style.inlineSize = `${place.width.toFixed(2)}px`;
    // The CSS scales the corner radius by this, so a thin strip is not rounded like the open slide.
    slide.style.setProperty("--sk-slide-width", `${place.width.toFixed(2)}px`);
    slide.style.opacity = place.opacity.toFixed(3);
  };
  const tick = (time: number): void => {
    const progress = clamp01((time - started) / duration);
    for (const slide of slides) write(slide, lerp(from.get(slide)!, to.get(slide)!, progress));
    publishActive();
    if (progress < 1) {
      frame = requestAnimationFrame(tick);
      return;
    }
    frame = 0;
    const next = after;
    after = null;
    next?.();
  };
  /** Every slide from where it is now to its target (or staying put), on one clock; `then` once it lands. */
  const run = (targets: Map<HTMLElement, Place>, then: (() => void) | null = null, ms = stepMs): void => {
    for (const slide of slides) {
      from.set(slide, now.get(slide)!);
      to.set(slide, targets.get(slide) ?? now.get(slide)!);
    }
    after = then;
    if (typeof requestAnimationFrame === "undefined") {
      for (const slide of slides) write(slide, to.get(slide)!);
      publishActive();
      after = null;
      then?.();
      return;
    }
    // Reduced motion: no travel, only the fade.
    if (prefersReducedMotion()) {
      for (const slide of slides) from.set(slide, { ...to.get(slide)!, opacity: now.get(slide)!.opacity });
      ms = REDUCED_DURATION;
    }
    // A move already under way: a burst of steps settles faster than the sum of full ones.
    duration = frame ? Math.round(ms * 0.6) : ms;
    started = performance.now();
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const hoverWidths = (): number[] => {
    const place = hovered < 0 ? -1 : forwardDistance(index, hovered, count);
    return progressiveHover(base, place, PROGRESSIVE_HOVER);
  };
  // The caption is a sibling of the track, not inside it, so what it sizes by lives on the root. The title
  // is exactly as wide as the active slide is now (hover included), unlike the picture, which keeps room to grow.
  const publishActive = (): void => {
    const active = now.get(slides[index]!);
    root.style.setProperty("--progressive-active-size", `${(active?.width ?? widths[0] ?? trackWidth).toFixed(1)}px`);
    // Where it starts, from the inline start: the title rides on it as it moves into first place.
    root.style.setProperty("--progressive-active-start", `${(active?.x ?? 0).toFixed(1)}px`);
  };
  // Hover grows the slide under the pointer; the slides on show move to make room, animated.
  const onHover = (slide: HTMLElement | null): void => {
    const next = slide ? slides.indexOf(slide) : -1;
    if (next === hovered || !count) return;
    hovered = next;
    widths = hoverWidths();
    const targets = new Map<HTMLElement, Place>();
    slides.forEach((other, i) => {
      const leaving = returning.find((entry) => entry.slide === other);
      if (leaving) targets.set(other, placeOf(leaving.via));
      else if (slotOf(i).kind === "visible") targets.set(other, placeOf(slotOf(i)));
    });
    // A hover retargets the move under way from where every slide is now, keeping what comes after it.
    run(targets, after, hoverMs);
  };
  const onPointerOver = (event: PointerEvent): void => {
    if (event.pointerType === "touch") return;
    onHover((event.target as Element).closest?.(`.${carouselParts.slide}`) as HTMLElement | null);
  };
  const onPointerLeave = (): void => onHover(null);
  const slotOf = (i: number): ProgressiveSlot => progressiveSlot(forwardDistance(index, i, count), count, widths.length);
  const sync = (): void => {
    slides.forEach((slide, i) => {
      const distance = forwardDistance(index, i, count);
      slide.dataset.distance = String(Math.min(distance, 4));
      slide.toggleAttribute("data-active", distance === 0);
      if (distance === 0) slide.setAttribute("aria-current", "true");
      else slide.removeAttribute("aria-current");
      // A strip's content leaves the Tab order and the tree; the strip itself still takes a click.
      for (const child of Array.from(slide.children) as HTMLElement[]) child.inert = distance !== 0;
    });
    captions.forEach((caption, i) => {
      caption.hidden = i !== index;
    });
  };

  // Every slide straight to its place, no motion: the first layout and every resize.
  const layout = (): void => {
    if (!track || !count) return;
    trackWidth = track.clientWidth;
    gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    stepMs = cssMs(root, "--sk-carousel-progressive-step", STEP_DURATION);
    hoverMs = cssMs(root, "--sk-carousel-progressive-hover", HOVER_DURATION);
    base = progressiveWidths(trackWidth, gap, count);
    gaps = progressiveGaps(base.length, gap);
    widths = hoverWidths();
    returning = [];
    cancelAnimationFrame(frame);
    frame = 0;
    after = null;
    slides.forEach((slide, i) => write(slide, placeOf(slotOf(i))));
    publishActive();
  };

  // The second leg of the slides that left the row: past the other edge, then into a place on show if
  // they have one, or off stage.
  const comeBack = (): void => {
    const back = returning;
    returning = [];
    const targets = new Map<HTMLElement, Place>();
    for (const { slide, via } of back) {
      const slot = slotOf(slides.indexOf(slide));
      if (slot.kind !== "visible") write(slide, placeOf(slot));
      else {
        write(slide, placeOf(via === "before" ? "after" : "before"));
        targets.set(slide, placeOf(slot));
      }
    }
    if (targets.size) run(targets);
  };

  /**
   * Move by `step` places, forwards (positive) or back; every slide moves at once:
   *  - on show before and after, without wrapping: straight to its new place (moving up and widening);
   *  - on show and leaving the row (or wrapping round it): out past the edge it is heading for, then off
   *    stage or in from the other edge;
   *  - waiting off stage and coming on: from the edge it comes in at (the end going forwards, the start
   *    going back), never across the row.
   */
  const move = (step: number): void => {
    if (count < 2 || step === 0) return;
    // Slides still on their way out finish it at once (they are out of sight), so fast steps never leave
    // one stranded past an edge.
    for (const { slide, via } of returning) write(slide, placeOf(via === "before" ? "after" : "before"));
    returning = [];
    const previous = index;
    index = wrap(index + step);
    widths = hoverWidths();
    const exit = step > 0 ? "before" : "after";
    // A slide coming on is there from the first frame at its own place, a little toward the edge it comes
    // from (the track clips it), and fades up as it settles; the others make room as they move.
    const side = (step > 0 ? 1 : -1);
    const enterAt = (target: Place): Place => ({ ...target, x: target.x + side * Math.min(ENTER_OFFSET, target.width * 0.5), opacity: 0 });
    const targets = new Map<HTMLElement, Place>();
    slides.forEach((slide, i) => {
      const old = forwardDistance(previous, i, count);
      const slot = slotOf(i);
      const wasOn = old < widths.length;
      const isOn = slot.kind === "visible";
      const wraps = old - step < 0 || old - step >= count;
      if (wasOn && isOn && !wraps) targets.set(slide, placeOf(slot));
      else if (wasOn) {
        targets.set(slide, placeOf(exit));
        returning.push({ slide, via: exit });
      } else if (isOn) {
        write(slide, enterAt(placeOf(slot)));
        targets.set(slide, placeOf(slot));
      } else write(slide, placeOf(slot));
    });
    run(targets, returning.length ? comeBack : null);
    sync();
    live.textContent = carouselTranslations.item(index, count);
    root.dispatchEvent(new CustomEvent(carouselEvents.change, { bubbles: true, detail: { index, count } }));
  };

  /** To a slide by the shorter way round. */
  const goTo = (target: number): void => {
    if (!count) return;
    const forward = forwardDistance(index, wrap(target), count);
    move(forward <= count / 2 ? forward : forward - count);
  };
  const next = (): void => move(1);
  const prev = (): void => move(-1);

  // A swipe (touch, pen or a mouse drag) moves one place; the click that ends it opens nothing.
  let press: { x: number; y: number } | null = null;
  let swiped = false;
  const onPointerDown = (event: PointerEvent): void => {
    press = { x: event.clientX, y: event.clientY };
    swiped = false;
  };
  const onPointerUp = (event: PointerEvent): void => {
    if (!press) return;
    const dx = event.clientX - press.x;
    const dy = event.clientY - press.y;
    press = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    swiped = true;
    const forwards = options.dir === "rtl" ? dx > 0 : dx < 0;
    if (forwards) next();
    else prev();
  };
  const onTrackClick = (event: Event): void => {
    if (swiped) {
      swiped = false;
      return;
    }
    const slide = (event.target as Element).closest?.(`.${carouselParts.slide}`) as HTMLElement | null;
    const i = slide ? slides.indexOf(slide) : -1;
    // A strip is always ahead of the active slide: it comes forwards to the first place.
    if (i >= 0 && i !== index) move(forwardDistance(index, i, count));
  };
  const onKeyDown = (event: KeyboardEvent): void => {
    if ((event.target as Element).closest?.("input, textarea, select, [contenteditable]")) return;
    const forward = options.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const back = options.dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    if (event.key === forward) next();
    else if (event.key === back) prev();
    else if (event.key === "Home") goTo(0);
    else if (event.key === "End") goTo(count - 1);
    else return;
    event.preventDefault();
  };
  const preventDrag = (event: Event): void => event.preventDefault();
  const onGoto = (event: Event): void => {
    const target = (event as CustomEvent<CarouselGotoDetail>).detail?.index;
    if (typeof target === "number") goTo(target);
  };

  track?.addEventListener("click", onTrackClick);
  track?.addEventListener("pointerover", onPointerOver);
  track?.addEventListener("pointerleave", onPointerLeave);
  track?.addEventListener("pointerdown", onPointerDown);
  track?.addEventListener("pointerup", onPointerUp);
  track?.addEventListener("dragstart", preventDrag);
  prevButton?.addEventListener("click", prev);
  nextButton?.addEventListener("click", next);
  root.addEventListener("keydown", onKeyDown);
  root.addEventListener(carouselEvents.goto, onGoto);
  const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(layout);
  if (track) resize?.observe(track);
  layout();
  sync();

  return {
    goTo,
    next,
    prev,
    get index() {
      return index;
    },
    destroy: () => {
      cancelAnimationFrame(frame);
      resize?.disconnect();
      track?.removeEventListener("click", onTrackClick);
      track?.removeEventListener("pointerover", onPointerOver);
      track?.removeEventListener("pointerleave", onPointerLeave);
      track?.removeEventListener("pointerdown", onPointerDown);
      track?.removeEventListener("pointerup", onPointerUp);
      track?.removeEventListener("dragstart", preventDrag);
      prevButton?.removeEventListener("click", prev);
      nextButton?.removeEventListener("click", next);
      root.removeEventListener("keydown", onKeyDown);
      root.removeEventListener(carouselEvents.goto, onGoto);
      live.remove();
      root.style.removeProperty("--progressive-active-size");
      root.style.removeProperty("--progressive-active-start");
      for (const slide of slides) {
        delete slide.dataset.distance;
        slide.removeAttribute("data-active");
        slide.removeAttribute("aria-current");
        slide.style.transform = "";
        slide.style.removeProperty("--sk-slide-width");
        slide.style.inlineSize = "";
        slide.style.opacity = "";
        for (const child of Array.from(slide.children) as HTMLElement[]) child.inert = false;
      }
      for (const caption of captions) caption.hidden = false;
    },
  };
}
