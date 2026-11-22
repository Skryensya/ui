import { carouselEvents, carouselParts, carouselTranslations, type CarouselGotoDetail } from "./carousel.js";

/*
 * THE RING ENGINE of CurveCarousel (`Carousel.curve`): a wheel, not a scroller.
 *
 * One number, `position` (in slides, fractional while it moves), places every slide on a wheel: five
 * in view, the rest round the back, so the roll never ends (a slide's distance from the front is taken
 * modulo the count) and a drag that lets go keeps the wheel turning, slowing down until it
 * comes to rest on a slide. Native scroll could not: it has ends, and its snap points are measured
 * from boxes the ring itself moves.
 *
 * Both bindings call `connectCurveRing` after mount and `destroy()` before unmount; the markup they
 * render is the same (root, track, slides, and the system-owned stepper and pause toggle), so this is
 * the one place the behaviour lives.
 */

export type RingCurve = "convex" | "concave";

/** Shortest signed distance from `from` to `to` on a loop of `count` (the infinite roll). */
export function wrapDelta(from: number, to: number, count: number): number {
  if (count <= 0) return to - from;
  const d = (((to - from) % count) + count) % count;
  return d > count / 2 ? d - count : d;
}

/**
 * The angle between neighbours, in radians. Fixed per curve so five slides are in view (the front one
 * and two each side): inside the ring a slide fades out past 55°, outside past 75°, so 26° and 32°
 * leave the third neighbour on each side out of sight. The rest of the wheel is round the back, where
 * the endless roll hands a slide from one end to the other unseen. With few slides that hand-off would
 * come into view, so they then spread just far enough to keep it out of sight.
 */
export function ringStep(curve: RingCurve, count: number, focus = false): number {
  const deg = Math.PI / 180;
  // In focus one large slide fills the front: a tighter wheel makes it cover a wide arc, so the ring
  // reads in the slide itself (bent, its edges arc) and the neighbours wrap round the sides. The track
  // clips at its edges, so the hand-off, a slide and a half away or more, is always out of it.
  if (focus) return 60 * deg;
  const fixed = (curve === "concave" ? 26 : 32) * deg;
  // The hand-off happens half the count away from the front: keep it past where slides are gone.
  const gone = (curve === "concave" ? 85 : 100) * deg;
  return Math.max(fixed, (2 * gone) / Math.max(count, 1));
}

/** The radius at which neighbours `step` apart are one `pitch` (width + gap) apart: they just meet. */
export function ringRadius(step: number, pitch: number): number {
  return step >= Math.PI ? pitch : pitch / (2 * Math.sin(step / 2));
}

/** Camera distance in radii: inside the ring it stands a little behind the centre, outside well back. */
const CAMERA = { concave: 2, convex: 3 } as const;

/** Where the camera stands, in px: `strength` > 1 brings it closer (the ends grow / shrink more). */
export function ringPerspective(curve: RingCurve, radius: number, strength: number, focus = false): number {
  const s = Math.min(2.5, Math.max(0.25, Number.isFinite(strength) ? strength : 1));
  // In focus the camera comes close, so the one large slide's arc reads as a curved screen.
  const camera = focus ? (curve === "concave" ? 1.2 : 2) : CAMERA[curve];
  return (camera * radius) / s;
}

export type RingPlacement = { x: number; z: number; angle: number; opacity: number; zIndex: number };

/**
 * A slide `delta` slides from the front (fractional), on a wheel of `count`. Position on the circle
 * (R·sin θ, ±R·(1 − cos θ)), turned along its tangent. CSS `rotateY(+a)` sends the right edge away:
 * outside the ring (`convex`) a right-hand slide's far edge recedes (+θ) and slides past 90° are round
 * the back, so they are hidden; inside (`concave`) the far edge comes towards the camera (−θ) and the
 * slides beside and behind the camera fade out.
 */
export function ringPlacement(delta: number, curve: RingCurve, step: number, radius: number, perspective = Infinity): RingPlacement {
  const theta = delta * step;
  const deg = (theta * 180) / Math.PI;
  const depth = radius * (1 - Math.cos(theta));
  const x = radius * Math.sin(theta);
  const away = Math.abs(deg);
  if (curve === "convex") {
    // Fully visible to 75°, gone by 95°: the turn past 90° would show the slide's back.
    const opacity = away <= 75 ? 1 : away >= 95 ? 0 : (95 - away) / 20;
    return { x, z: -depth, angle: deg, opacity, zIndex: Math.round(1000 - depth) };
  }
  // Inside, a side slide grows as it nears the camera: by how much (perspective / (perspective − z)) is
  // what decides it, not its angle. A strong lens would otherwise swell it to several times its size
  // (huge layers to paint) and then drop it in one frame. Full to 1.6×, gone by 2.4×, and past 80°.
  const scale = !Number.isFinite(perspective) ? 1 : perspective > depth ? perspective / (perspective - depth) : Infinity;
  const byScale = scale <= 1.6 ? 1 : scale >= 2.4 ? 0 : (2.4 - scale) / 0.8;
  const byAngle = away <= 55 ? 1 : away >= 80 ? 0 : (80 - away) / 25;
  return { x, z: depth, angle: -deg, opacity: Math.min(byScale, byAngle), zIndex: Math.round(depth) };
}

/**
 * A bent slide's band (`bend`) at `offset` px from the slide's centre, relative to the slide: the
 * piece of the same circle that band would occupy, so the slide reads as a curved surface.
 */
export function bandPlacement(offset: number, curve: RingCurve, radius: number): { x: number; z: number; angle: number } {
  const alpha = offset / radius;
  const deg = (alpha * 180) / Math.PI;
  const depth = radius * (1 - Math.cos(alpha));
  const x = radius * Math.sin(alpha) - offset;
  return curve === "convex" ? { x, z: -depth, angle: deg } : { x, z: depth, angle: -deg };
}

/** How long the glide after a release lasts: an ease-out whose starting speed is the release speed. */
export function glideDuration(distance: number, velocity: number): number {
  if (!velocity) return 320;
  // cubic ease-out starts at 3× its average speed, so D = 3·distance / v
  return Math.min(1800, Math.max(260, (3 * Math.abs(distance)) / Math.abs(velocity)));
}

export type CurveRingOptions = {
  curve: RingCurve;
  /** Roll without end (default). Off, the wheel stops at the first and the last slide. */
  infinite?: boolean;
  /** Keep turning after a drag and slow down (default). Off, a release settles straight away. */
  momentum?: boolean;
  /** Milliseconds between slides; 0 or absent is no autoplay. */
  autoplay?: number;
  /** The slide it opens on; absent is the middle one. */
  defaultPage?: number;
  dir?: "ltr" | "rtl";
  /** Under reduced motion nothing glides and autoplay starts paused. */
  reducedMotion?: boolean;
  /** One large slide with its neighbours peeking (`data-focus`): a flatter wheel. */
  focus?: boolean;
};

export type CurveRing = {
  goTo(index: number): void;
  next(): void;
  prev(): void;
  play(): void;
  pause(): void;
  readonly index: number;
  destroy(): void;
};

const easeOut = (t: number) => 1 - (1 - t) ** 3;
/** Fastest a release can throw the wheel, in slides per ms (about 6 slides of glide). */
const MAX_SPEED = 0.02;

export function connectCurveRing(root: HTMLElement, options: CurveRingOptions): CurveRing {
  const track = root.querySelector<HTMLElement>(`.${carouselParts.track}`);
  const slides = track ? Array.from(track.querySelectorAll<HTMLElement>(`.${carouselParts.slide}`)) : [];
  const count = slides.length;
  const steps = Array.from(root.querySelectorAll<HTMLButtonElement>(`.${carouselParts.step}`));
  const toggle = root.querySelector<HTMLButtonElement>(`.${carouselParts.autoplay}`);
  const infinite = options.infinite !== false;
  const momentum = options.momentum !== false && !options.reducedMotion;
  const sign = options.dir === "rtl" ? -1 : 1;
  const delay = options.autoplay && options.autoplay > 0 ? options.autoplay : 0;
  const clampIndex = (i: number) => Math.min(count - 1, Math.max(0, i));
  const normal = (i: number) => (count ? ((Math.round(i) % count) + count) % count : 0);

  let desired = Boolean(delay) && !options.reducedMotion;
  let hovering = false;
  let focused = false;
  let playing = false;
  let progress = 0;
  let lastTick = 0;
  let position = clampIndex(options.defaultPage ?? Math.floor((count - 1) / 2));
  let radius = 1;
  let step = Math.PI;
  let pitch = 1;
  let frame = 0;
  let animation: { from: number; to: number; start: number; duration: number } | null = null;
  let lastIndex = normal(position);
  let destroyed = false;

  // ARIA: the WAI carousel pattern, the same names the flat Carousel's machine gives.
  const live = document.createElement("span");
  live.className = "sk-visually-hidden";
  live.setAttribute("aria-live", "polite");
  live.setAttribute("aria-atomic", "true");
  root.append(live);
  steps.forEach((step) => step.setAttribute("tabindex", "-1"));
  root.setAttribute("role", "region");
  root.setAttribute("aria-roledescription", "carousel");
  slides.forEach((slide, i) => {
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", carouselTranslations.item(i, count));
  });

  const measure = (): void => {
    if (!track || !count) return;
    const width = slides[0]!.offsetWidth || 1;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    pitch = width + gap;
    step = ringStep(options.curve, count, options.focus);
    radius = ringRadius(step, pitch);
    const strength = Number.parseFloat(getComputedStyle(root).getPropertyValue("--sk-carousel-curve-strength"));
    perspective = ringPerspective(options.curve, radius, strength, options.focus);
    track.style.perspective = `${perspective}px`;
    for (const last of written) last.transform = "";
    // A bent slide's bands sit on the same circle: their place relative to the slide is fixed per size.
    for (const slide of slides) {
      const bands = Array.from(slide.querySelectorAll<HTMLElement>(`.${carouselParts.band}`));
      const slice = width / (bands.length || 1);
      bands.forEach((band, i) => {
        const offset = (i + 0.5 - bands.length / 2) * slice;
        const p = bandPlacement(offset, options.curve, radius);
        band.style.transform = `translate3d(${p.x}px, 0, ${p.z}px) rotateY(${p.angle}deg)`;
        // Its slice, a pixel wider each side so two turned neighbours overlap instead of leaving a seam,
        // and its copy the slide's full width shifted onto that slice.
        band.style.insetInlineStart = `${i * slice - 1}px`;
        band.style.inlineSize = `${slice + 2}px`;
        const copy = band.firstElementChild as HTMLElement | null;
        if (copy) {
          copy.style.inlineSize = `${width}px`;
          copy.style.marginInlineStart = `${1 - i * slice}px`;
        }
      });
    }
    render();
  };

  // What each slide was last given, so a frame writes only what changed: a hidden slide is not touched
  // again until it comes back, and the stepper only when the current slide does.
  const written = slides.map(() => ({ transform: "", opacity: -1, zIndex: -1 }));
  let shownStep = -1;
  let perspective = Infinity;

  const render = (): void => {
    slides.forEach((slide, i) => {
      const delta = infinite ? wrapDelta(position, i, count) : i - position;
      const p = ringPlacement(delta * sign, options.curve, step, radius, perspective);
      const last = written[i]!;
      const opacity = Math.round(p.opacity * 100) / 100;
      if (opacity !== last.opacity) {
        slide.style.opacity = String(opacity);
        slide.style.visibility = opacity === 0 ? "hidden" : "";
        // A slide round the back is out of reach too: Tab never lands on a link nobody can see.
        slide.inert = opacity === 0;
        last.opacity = opacity;
      }
      if (opacity === 0) return;
      const transform = `translate3d(${p.x.toFixed(1)}px, 0, ${p.z.toFixed(1)}px) rotateY(${p.angle.toFixed(2)}deg)`;
      if (transform !== last.transform) {
        slide.style.transform = transform;
        last.transform = transform;
      }
      if (p.zIndex !== last.zIndex) {
        slide.style.zIndex = String(p.zIndex);
        last.zIndex = p.zIndex;
      }
    });
    const current = normal(position);
    if (current !== shownStep) {
      // A roving stepper: one Tab stop, the current segment; the arrows walk the rest.
      steps[shownStep]?.removeAttribute("aria-current");
      steps[shownStep]?.setAttribute("tabindex", "-1");
      steps[current]?.setAttribute("aria-current", "true");
      steps[current]?.setAttribute("tabindex", "0");
      shownStep = current;
    }
  };

  // Pointer and wheel events come faster than frames: they only move `position`, and one frame draws.
  let dirty = false;
  const scheduleRender = (): void => {
    dirty = true;
    run();
  };

  const settle = (): void => {
    const index = normal(position);
    if (index !== lastIndex) {
      lastIndex = index;
      progress = 0;
      steps.forEach((step) => step.style.removeProperty("--sk-carousel-step-progress"));
      root.dispatchEvent(new CustomEvent(carouselEvents.change, { bubbles: true, detail: { index, count } }));
      // Said to a screen reader, unless it turns by itself: a rotation that talks every few seconds is noise.
      if (live && !playing) live.textContent = carouselTranslations.item(index, count);
    }
  };

  const tick = (now: number): void => {
    frame = 0;
    if (destroyed) return;
    if (dirty && !animation) {
      dirty = false;
      render();
    }
    if (animation) {
      const t = Math.min(1, (now - animation.start) / animation.duration);
      position = animation.from + (animation.to - animation.from) * easeOut(t);
      if (t >= 1) {
        position = infinite ? animation.to : clampIndex(animation.to);
        animation = null;
        settle();
      }
      render();
    }
    if (playing && !dragging && !animation) advanceAutoplay(now);
    if (animation || dirty || (playing && delay)) frame = requestAnimationFrame(tick);
  };

  const run = (): void => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  /** Turn to `target` (in position units, may be beyond the count when infinite). */
  const turnTo = (target: number, velocity = 0): void => {
    const to = infinite ? target : clampIndex(target);
    if (options.reducedMotion) {
      position = to;
      animation = null;
      render();
      settle();
      return;
    }
    const distance = to - position;
    animation = { from: position, to, start: performance.now(), duration: glideDuration(distance, velocity) };
    run();
  };

  const goTo = (index: number): void => {
    const target = infinite ? position + wrapDelta(position, index, count) : clampIndex(index);
    turnTo(Math.round(target));
  };

  // DRAG, with momentum. Horizontal drags turn the wheel; `touch-action: pan-y` (carousel.css) leaves
  // vertical swipes to the page.
  let dragging = false;
  let dragMoved = 0;
  let dragFrom = 0; // the position the drag started at
  let lastX = 0;
  let lastT = 0;
  let velocity = 0; // slides per ms
  let pointerId = -1;

  const onPointerDown = (event: PointerEvent): void => {
    if (!track || (event.pointerType === "mouse" && event.button !== 0)) return;
    dragging = true;
    dragMoved = 0;
    dragFrom = Math.round(position);
    pointerId = event.pointerId;
    lastX = event.clientX;
    lastT = event.timeStamp;
    velocity = 0;
    animation = null;
    track.setPointerCapture(pointerId);
    root.setAttribute("data-dragging", "");
    syncPlaying();
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!dragging || event.pointerId !== pointerId) return;
    const dx = event.clientX - lastX;
    const dt = Math.max(1, event.timeStamp - lastT);
    dragMoved += Math.abs(dx);
    let move = (-dx * sign) / pitch;
    if (!infinite && (position + move < 0 || position + move > count - 1)) move *= 0.35; // rubber band
    position += move;
    // Capped: a hard flick still spins the wheel several slides, but one spiky event cannot fling it.
    velocity = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, 0.8 * (move / dt) + 0.2 * velocity));
    lastX = event.clientX;
    lastT = event.timeStamp;
    scheduleRender();
  };

  const onPointerUp = (event: PointerEvent): void => {
    if (!dragging || event.pointerId !== pointerId) return;
    dragging = false;
    root.removeAttribute("data-dragging");
    if (track?.hasPointerCapture(pointerId)) track.releasePointerCapture(pointerId);
    // A pause before letting go is a stop, not a throw.
    if (event.timeStamp - lastT > 80) velocity = 0;
    const throwDistance = momentum ? velocity * 280 : 0;
    let target = Math.round(position + throwDistance);
    // A deliberate drag of a fraction of a slide still means "the next one": past 15% of a slide toward
    // a side, never come back to where it started. Large slides (`focus`) would otherwise need a long drag.
    const dragged = position - dragFrom;
    if (target === dragFrom && Math.abs(dragged) > 0.15) target = dragFrom + Math.sign(dragged);
    turnTo(target, momentum ? velocity : 0);
    syncPlaying();
  };

  // A drag that moved is not a click on the slide under it.
  const onClick = (event: MouseEvent): void => {
    if (dragMoved > 6) {
      event.preventDefault();
      event.stopPropagation();
    }
    dragMoved = 0;
  };

  // WHEEL: a horizontal trackpad swipe turns it; a vertical wheel is the page's.
  let wheelTimer = 0;
  const onWheel = (event: WheelEvent): void => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    animation = null;
    position += (event.deltaX * sign) / pitch;
    if (!infinite) position = Math.min(count - 1, Math.max(0, position));
    scheduleRender();
    clearTimeout(wheelTimer);
    wheelTimer = window.setTimeout(() => turnTo(Math.round(position)), 120);
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement;
    if (target.closest("input, textarea, select, [contenteditable]")) return;
    const key = event.key;
    let to: number | null = null;
    if (key === "ArrowRight" || key === "ArrowLeft") {
      const forward = (key === "ArrowRight") === (sign === 1);
      to = heading() + (forward ? 1 : -1);
      if (!infinite) to = clampIndex(to);
    } else if (key === "Home" || key === "End") {
      to = key === "Home" ? 0 : count - 1;
    }
    if (to === null) return;
    event.preventDefault();
    if (key === "Home" || key === "End") goTo(to);
    else turnTo(to);
    // On the stepper the focus follows the current segment, as a tab list's does.
    if (steps.includes(target as HTMLButtonElement)) steps[normal(to)]?.focus();
  };

  // Focus landing inside a slide (a link, a button) turns the wheel to it, so it is never round the back.
  const onFocusIn = (event: FocusEvent): void => {
    focused = true;
    const slide = (event.target as HTMLElement).closest(`.${carouselParts.slide}`) as HTMLElement | null;
    const index = slide ? slides.indexOf(slide) : -1;
    if (index >= 0 && index !== normal(position)) goTo(index);
    syncPlaying();
  };
  const onFocusOut = (event: FocusEvent): void => {
    if (root.contains(event.relatedTarget as Node | null)) return;
    focused = false;
    syncPlaying();
  };

  // AUTOPLAY. The stepper's active segment fills with the time left (`--sk-carousel-step-progress`,
  // written here, so it pauses exactly when the timer does). Hover, focus and a drag pause it and
  // leaving resumes it, unless the reader stopped it with the toggle (WCAG 2.2.2, as the flat Carousel).

  const advanceAutoplay = (now: number): void => {
    const dt = lastTick ? now - lastTick : 0;
    lastTick = now;
    progress = Math.min(1, progress + dt / delay);
    steps[normal(position)]?.style.setProperty("--sk-carousel-step-progress", String(progress));
    if (progress >= 1) {
      progress = 0;
      steps.forEach((step) => step.style.removeProperty("--sk-carousel-step-progress"));
      next();
    }
  };

  const syncPlaying = (): void => {
    if (toggle) {
      toggle.toggleAttribute("data-pressed", desired);
      toggle.setAttribute("aria-pressed", String(desired));
      toggle.setAttribute("aria-label", desired ? carouselTranslations.autoplayStop : carouselTranslations.autoplayStart);
    }
    const should = Boolean(delay) && desired && !hovering && !focused && !dragging;
    if (should === playing) return;
    playing = should;
    lastTick = 0;
    root.toggleAttribute("data-playing", playing);
    if (playing) run();
  };

  const onEnter = (): void => {
    hovering = true;
    syncPlaying();
  };
  const onLeave = (): void => {
    hovering = false;
    syncPlaying();
  };
  const onToggle = (): void => {
    desired = !desired;
    syncPlaying();
  };

  const stepHandlers = steps.map((step, i) => {
    const handler = () => goTo(i);
    step.addEventListener("click", handler);
    step.setAttribute("aria-label", carouselTranslations.indicator(i));
    return handler;
  });

  const onGoto = (event: Event): void => {
    const index = (event as CustomEvent<CarouselGotoDetail>).detail?.index;
    if (typeof index === "number") goTo(index);
  };

  // Steps count from where a turn is headed, not from where it is: a second key press mid-turn moves one
  // further instead of rounding back onto the slide the first one left.
  const heading = (): number => (animation ? animation.to : Math.round(position));
  const next = (): void => turnTo(heading() + 1);
  const prev = (): void => turnTo(heading() - 1);

  track?.addEventListener("pointerdown", onPointerDown);
  track?.addEventListener("pointermove", onPointerMove);
  track?.addEventListener("pointerup", onPointerUp);
  track?.addEventListener("pointercancel", onPointerUp);
  track?.addEventListener("click", onClick, true);
  track?.addEventListener("dragstart", (event) => event.preventDefault());
  track?.addEventListener("wheel", onWheel, { passive: false });
  root.addEventListener("keydown", onKeyDown);
  root.addEventListener("focusin", onFocusIn);
  root.addEventListener("focusout", onFocusOut);
  root.addEventListener("pointerenter", onEnter);
  root.addEventListener("pointerleave", onLeave);
  root.addEventListener(carouselEvents.goto, onGoto);
  toggle?.addEventListener("click", onToggle);

  const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
  if (track) resize?.observe(track);
  measure();
  syncPlaying();

  return {
    goTo,
    next,
    prev,
    play: () => {
      desired = true;
      syncPlaying();
    },
    pause: () => {
      desired = false;
      syncPlaying();
    },
    get index() {
      return normal(position);
    },
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(frame);
      clearTimeout(wheelTimer);
      resize?.disconnect();
      track?.removeEventListener("pointerdown", onPointerDown);
      track?.removeEventListener("pointermove", onPointerMove);
      track?.removeEventListener("pointerup", onPointerUp);
      track?.removeEventListener("pointercancel", onPointerUp);
      track?.removeEventListener("click", onClick, true);
      track?.removeEventListener("wheel", onWheel);
      root.removeEventListener("keydown", onKeyDown);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener(carouselEvents.goto, onGoto);
      toggle?.removeEventListener("click", onToggle);
      steps.forEach((step, i) => step.removeEventListener("click", stepHandlers[i]!));
      for (const slide of slides) {
        slide.style.transform = "";
        slide.style.opacity = "";
        slide.style.zIndex = "";
        slide.style.visibility = "";
      }
      if (track) track.style.perspective = "";
      root.removeAttribute("data-playing");
      live.remove();
      for (const slide of slides) slide.inert = false;
    },
  };
}
