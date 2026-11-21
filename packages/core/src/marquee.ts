import type { ComponentContract } from "./contract.js";

/*
 * MARQUEE, one continuous strip with two honest start modes.
 *
 * A marquee is not a carousel. It does not expose pages, selection, or interactive descendants; it
 * repeats a short run of inert content to create a continuous visual rhythm. If the content is a set
 * of destinations or controls, Carousel or a plain list preserves one focus stop per item instead of
 * cloning those controls into a second, hidden copy.
 *
 * The two signatures make the motion's cause explicit:
 *
 *   - Marquee waits for the reader to press Play.
 *   - Marquee.autoplay starts without a request and therefore always ships a Pause control.
 *
 * Both render one semantic copy and one aria-hidden visual copy. Reduced-motion CSS keeps either
 * signature static. The enhancer only owns the explicit play state and the duration measurement.
 */

/**
 * Custom properties the bindings write on the root. Named here because CSS and both bindings have to
 * agree on them, and a string repeated in three files is a rename waiting to break one of them.
 */
export const marqueeProperties = {
  duration: "--sk-marquee-duration",
  gapFill: "--sk-marquee-gap-fill",
} as const;

export const marqueeAttrs = {
  root: "data-sk-marquee",
  start: "data-start",
  state: "data-state",
  direction: "data-direction",
  speed: "data-speed",
  /** Set while keyboard focus is being shown inside the strip: CSS drops the fade. */
  revealing: "data-revealing",
} as const;

export const marqueeParts = {
  root: "sk-marquee",
  viewport: "sk-marquee__viewport",
  track: "sk-marquee__track",
  content: "sk-marquee__content",
  toggle: "sk-marquee__toggle",
  glyph: "sk-marquee__glyph",
  label: "sk-marquee__label",
} as const;

export type MarqueePart = keyof typeof marqueeParts;
export type MarqueePartClass = (typeof marqueeParts)[MarqueePart];
export type MarqueeDirection = "left" | "right" | "up" | "down";
export type MarqueeSpeed = "slow" | "normal" | "fast";
export type MarqueeFade = "edges" | "none";
export type MarqueeStart = "manual" | "auto";

/**
 * One cadence step is 3rem at the system's 16px base. Bindings read a duration-scale token for
 * this distance, then repeat it across the measured strip. The scale therefore controls the tempo
 * without turning a longer row into a faster one.
 */
export const MARQUEE_CADENCE_DISTANCE_PX = 48;

/** A measured distance becomes a duration, keeping token-scaled velocity stable as content changes. */
/** A CSS `<time>` read off a custom property (`960ms`, `0.96s`) in ms; a bare number is ms. NaN when unreadable. */
export function marqueeCadenceMilliseconds(value: string): number {
  const match = /^\s*(-?[\d.]+(?:e-?\d+)?)\s*(ms|s)?\s*$/i.exec(value);
  if (!match) return Number.NaN;
  const amount = Number.parseFloat(match[1]!);
  return match[2]?.toLowerCase() === "s" ? amount * 1000 : amount;
}

export function marqueeDurationSeconds(distance: number, cadenceMilliseconds: number): number {
  if (!Number.isFinite(distance) || distance <= 0) return 0;
  if (!Number.isFinite(cadenceMilliseconds) || cadenceMilliseconds <= 0) return 0;
  return (distance / MARQUEE_CADENCE_DISTANCE_PX) * (cadenceMilliseconds / 1000);
}

/**
 * How much every gap has to grow for one run to reach across its viewport, and the reason the strip
 * is infinite at all.
 *
 * Two copies cannot cover a window wider than one of them. A 530px run inside a 691px viewport looks
 * continuous until the track has travelled its full run: at that instant the second copy sits where
 * the first began and the last 161px of the viewport hold nothing, so a hole crosses the strip once
 * per cycle. Repeating a third copy is not open to a fixed template, so the missing distance is
 * spread over the run's own gaps instead, which reaches the same measure without inventing content.
 *
 * `gapCount` is the item count, not `items - 1`: the run's trailing gap is what separates the last
 * item of one copy from the first item of the next, so it takes a share like every other gap and the
 * rhythm stays even ACROSS the seam, which is the only place a reader could spot the repeat.
 */
export function marqueeGapFill(runSize: number, gapCount: number, viewportSize: number): number {
  if (!Number.isFinite(runSize) || !Number.isFinite(viewportSize)) return 0;
  if (!Number.isFinite(gapCount) || gapCount < 1) return 0;
  const missing = viewportSize - runSize;
  return missing > 0 ? missing / gapCount : 0;
}

/** Unrequested motion never starts for a reader who asked the platform to reduce it. */
export function marqueeInitialPlaying(start: MarqueeStart, reducedMotion: boolean): boolean {
  return start === "auto" && !reducedMotion;
}

/**
 * The animation time that moves the track from `offset` px (≤ 0, its translate now) by `-delta` px,
 * clamped to the real run so the strip never wraps onto the `aria-hidden` copy. The animation spans
 * 0 → -`run` px going forward (left, up) and -`run` → 0 going back (right, down). Time `duration` is
 * the next iteration's 0, the other end of the run, so the result stays just short of it.
 */
export function marqueeRevealTime(o: { offset: number; delta: number; run: number; duration: number; reverse: boolean }): number {
  if (!(o.run > 0) || !(o.duration > 0)) return 0;
  const offset = Math.min(0, Math.max(-o.run + 0.5, o.offset - o.delta));
  const progress = o.reverse ? 1 + offset / o.run : -offset / o.run;
  return Math.min(o.duration - 1, progress * o.duration) || 0;
}

const REVEAL_PAD = 16;

/**
 * Keyboard focus inside a strip lands on items under the edge fade or outside the viewport, and the
 * paused animation (CSS pauses on `:focus-within`) leaves them there. On a `:focus-visible` focusin
 * this drops the fade and moves the paused timeline just far enough to show the focused item; the
 * fade returns when focus leaves. Both bindings call it; it touches only the strip it is given.
 */
export function connectMarqueeFocusReveal(root: HTMLElement): () => void {
  const viewport = root.querySelector<HTMLElement>(`.${marqueeParts.viewport}`);
  const track = root.querySelector<HTMLElement>(`.${marqueeParts.track}`);
  if (!viewport || !track) return () => {};
  let frame = 0;

  const reveal = (item: HTMLElement): void => {
    root.setAttribute(marqueeAttrs.revealing, "");
    const direction = root.getAttribute(marqueeAttrs.direction);
    const vertical = direction === "up" || direction === "down";
    /* The browser may have scrolled the clipped viewport to reach the focus; the timeline is what
     * positions the strip, so undo that. */
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
    const animation = track.getAnimations?.().find((a) => "animationName" in a);
    if (!animation || animation.playState !== "paused") return; // reduced motion, or still running
    const duration = Number(animation.effect?.getComputedTiming().duration) || 0;
    const box = viewport.getBoundingClientRect();
    const rect = item.getBoundingClientRect();
    const [start, end, itemStart, itemEnd] = vertical
      ? [Math.max(box.top, 0), Math.min(box.bottom, document.documentElement.clientHeight), rect.top, rect.bottom]
      : [Math.max(box.left, 0), Math.min(box.right, document.documentElement.clientWidth), rect.left, rect.right];
    const delta =
      itemStart < start + REVEAL_PAD ? itemStart - start - REVEAL_PAD : itemEnd > end - REVEAL_PAD ? itemEnd - end + REVEAL_PAD : 0;
    if (!delta || !duration) return;
    const matrix = new DOMMatrix(getComputedStyle(track).transform);
    const from = Number(animation.currentTime) || 0;
    const to = marqueeRevealTime({
      offset: vertical ? matrix.m42 : matrix.m41,
      delta,
      run: (vertical ? track.offsetHeight : track.offsetWidth) / 2,
      duration,
      reverse: direction === "right" || direction === "down",
    });
    /* A short glide rather than a jump. */
    const began = performance.now();
    cancelAnimationFrame(frame);
    const step = (now: number): void => {
      const k = Math.min(1, (now - began) / 260);
      animation.currentTime = from + (to - from) * (1 - (1 - k) ** 3);
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  };

  const onFocusIn = (event: FocusEvent): void => {
    const target = event.target as HTMLElement;
    if (!target.matches(":focus-visible")) return;
    const content = target.closest<HTMLElement>(`.${marqueeParts.content}`);
    if (!content || !root.contains(content)) return;
    const item = Array.from(content.children).find((child) => child.contains(target)) as HTMLElement | undefined;
    reveal(item ?? target);
  };

  const onFocusOut = (event: FocusEvent): void => {
    if (!root.contains(event.relatedTarget as Node | null)) root.removeAttribute(marqueeAttrs.revealing);
  };

  root.addEventListener("focusin", onFocusIn);
  root.addEventListener("focusout", onFocusOut);
  return () => {
    cancelAnimationFrame(frame);
    root.removeEventListener("focusin", onFocusIn);
    root.removeEventListener("focusout", onFocusOut);
    root.removeAttribute(marqueeAttrs.revealing);
  };
}

const marqueeOptions = {
  direction: {
    type: "enum",
    values: ["left", "right", "up", "down"],
    default: "left",
    attr: "data-direction",
  },
  speed: {
    type: "enum",
    values: ["slow", "normal", "fast"],
    default: "normal",
    attr: "data-speed",
  },
  /*
   * Whether the viewport softens the two edges where it clips the run. On by default, because a
   * repeating strip cut off mid-item at a hard edge reads as a mistake rather than as "this
   * continues"; `none` is for a marquee already bounded by something that explains the cut, a
   * bordered box, a panel it fills edge to edge.
   *
   * It is Marquee's own, not a FadeEdge wrapped around it, for a reason the control made visible:
   * a wrapper masks everything it contains, including the Play/Pause button, and a control washed
   * out by its own component's paint is worse than the hard edge the wrapper came to fix. Fading
   * from INSIDE reaches the viewport alone, which is the only part that clips anything. FadeEdge
   * remains the right tool for a consumer's own clipped edge; this is the one Marquee already knows
   * it has. The band size is `--sk-marquee-fade-size`.
   */
  fade: {
    type: "enum",
    values: ["edges", "none"],
    default: "edges",
    attr: "data-fade",
  },
  /*
   * Whether the automatic marquee ships a visible Play/Pause button. OFF by default: an ambient logo
   * row is not a media player, and a control nobody came to press is one more thing on the page.
   *
   * It exists only on `Marquee.autoplay`. The requested signature starts paused, so its button is
   * the only cause of motion it has, and an opt-out there would render a strip that can never start.
   *
   * TURNING IT OFF IS A CONFORMANCE DECISION, not just a visual one. WCAG 2.2.2 wants a pause
   * mechanism for motion that starts by itself and runs past five seconds, and every marquee runs
   * past five seconds. Without the button the strip still stops on hover and on focus within, and
   * still never starts under `prefers-reduced-motion`, but neither of those is the explicit control
   * 2.2.2 asks for. Off is right for decoration a reader can ignore; on is right the moment the
   * strip carries anything they might want to read.
   */
  control: {
    type: "boolean",
    default: false,
    attr: "data-control",
    trueValue: "",
  },
} as const;

/*
 * The requested marquee's slots. Its labels are REQUIRED because its control is: a strip that starts
 * paused has exactly one way to start, so the button is not an option there and neither are its
 * names.
 */
const manualSlots = {
  children: { accepts: "node", required: true },
  playLabel: { accepts: "text", required: true },
  pauseLabel: { accepts: "text", required: true },
} as const;

/*
 * The automatic marquee's slots. Its labels are OPTIONAL because its control is `control`, off by
 * default: an ambient strip nobody is expected to stop should not force two strings on every author
 * who just wants a logo row.
 *
 * Passing `control` without them is caught where it actually breaks rather than here: the button is
 * icon-only, and BOTH bindings already refuse an icon-only Button with no accessible name (the
 * vanilla enhancer throws, React logs it in dev). A conditional `required` would be a second, weaker
 * copy of a rule that is already enforced.
 */
const autoplaySlots = {
  children: { accepts: "node", required: true },
  playLabel: { accepts: "text" },
  pauseLabel: { accepts: "text" },
} as const;

const contentTrack = {
  element: "div",
  part: "viewport",
  children: [
    {
      element: "div",
      part: "track",
      children: [
        { element: "div", part: "content", slot: "children" },
        { element: "div", part: "content", attrs: { "aria-hidden": "true" }, slot: "children" },
      ],
    },
  ],
} as const;

/*
 * A REAL BUTTON, not a button-shaped div of this component's own making. It needs exactly what Button
 * already publishes: the state layer, the focus ring, and the touch-target floor a `sm` face keeps
 * through Button's own hit-area `::after`. Marquee owns where it sits, at the block-end/inline-end
 * corner of the component, on a row of its own rather than over a viewport that is one run tall and
 * has no corner to spare. Button owns the control.
 *
 * The glyph is its own element rather than a pseudo on the button, because on a real `.sk-button`
 * both are already spoken for: `::before` is the state layer's and `::after` is the hit area's. It
 * stays component anatomy either way, since the icon vocabulary names no play/pause ROLE, and a
 * media transport control is not a thing every icon set is obliged to draw.
 */
const toggleAttrs = {
  type: "button",
  "data-appearance": "plain",
  "data-variant": "soft",
  "data-tone": "neutral",
  "data-size": "sm",
  "data-icon-only": "",
  "data-sk-button": "",
} as const;

const toggleGlyph = { element: "span", part: "glyph", attrs: { "aria-hidden": "true" } } as const;

const manualToggle = {
  element: "button",
  part: "toggle",
  also: ["sk-button", "sk-interactive"],
  attrs: { ...toggleAttrs, "aria-pressed": "false" },
  children: [
    toggleGlyph,
    { element: "span", part: "label", also: ["sk-visually-hidden"], attrs: { "data-action": "play" }, slot: "playLabel" },
    { element: "span", part: "label", also: ["sk-visually-hidden"], attrs: { "data-action": "pause", hidden: "" }, slot: "pauseLabel" },
  ],
} as const;

const autoplayToggle = {
  element: "button",
  part: "toggle",
  also: ["sk-button", "sk-interactive"],
  attrs: { ...toggleAttrs, "aria-pressed": "true" },
  children: [
    toggleGlyph,
    { element: "span", part: "label", also: ["sk-visually-hidden"], attrs: { "data-action": "play", hidden: "" }, slot: "playLabel" },
    { element: "span", part: "label", also: ["sk-visually-hidden"], attrs: { "data-action": "pause" }, slot: "pauseLabel" },
  ],
} as const;

export const marqueeContract = {
  id: "marquee",
  category: "content",
  css: "@skryensya/core/components/marquee.css",
  parts: marqueeParts,
  hooks: [
    "--sk-marquee-cadence-duration",
    "--sk-marquee-duration",
    "--sk-marquee-fade-lead",
    "--sk-marquee-fade-size",
    "--sk-marquee-fade-trail",
    "--sk-marquee-gap",
    "--sk-marquee-gap-fill",
    "--sk-marquee-run-gap",
    "--sk-marquee-vertical-size",
  ],
  /*
   * Duration and gap-fill are binding-written after measure. Listed here so a consumer cannot
   * treat them as author overrides without knowing the enhancer will rewrite them.
   */
  outputHooks: ["--sk-marquee-duration", "--sk-marquee-gap-fill"],
  /*
   * Play/Pause labels use `sk-visually-hidden`. That class has no unique contract owner, so
   * `sheetsForTree` cannot discover the sheet from `also` alone; name it here.
   */
  hookSheets: ["@skryensya/core/patterns/visually-hidden.css"],
  options: marqueeOptions,
  signatures: {
    Marquee: {
      intent: ["user-started-marquee", "requested-continuous-strip", "moving-brand-row"],
      host: { element: "div" },
      options: ["direction", "speed", "fade"],
      compose: [
        { of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true },
      ],
      slots: manualSlots,
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { "data-start": "manual", "data-state": "paused" },
        /*
         * The toggle is unconditional here, and `control` is deliberately NOT among this signature's
         * options: a strip that starts paused with no way to start it is not a state worth
         * validating, it is one worth making unrepresentable.
         */
        children: [contentTrack, manualToggle],
      },
      react: { from: "@skryensya/react/marquee", name: "Marquee" },
      mount: "data-sk-marquee",
    },
    "Marquee.autoplay": {
      intent: ["autoplay-marquee", "ambient-continuous-strip", "automatic-moving-content"],
      host: { element: "div" },
      options: ["direction", "speed", "fade", "control"],
      /* The control is an icon-only button; its two labels are its only names. */
      implies: { control: ["playLabel", "pauseLabel"] },
      compose: [
        { of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true },
      ],
      slots: autoplaySlots,
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { "data-start": "auto", "data-state": "playing" },
        children: [contentTrack, { ...autoplayToggle, whenGiven: "control" }],
      },
      react: { from: "@skryensya/react/marquee", name: "AutoplayMarquee" },
      mount: "data-sk-marquee",
    },
  },
} as const satisfies ComponentContract;
