import type { ComponentContract } from "./contract.js";

/*
 * CAROUSEL, a native scroll-snap region of slides (cards or any content) with controls.
 *
 * The scrolling is the platform's: a `<ul>` track with `scroll-snap-type`, so momentum, touch, wheel
 * and snap points come for free. Two control layers sit on top of that one substrate:
 *
 *   1. A ZERO-JS baseline of the native carousel pseudo-elements (`::scroll-button`, `::scroll-marker`),
 *      shown until the enhancer marks the root ready. Chrome/Edge today; elsewhere a plain snap scroller.
 *   2. The vanilla ENHANCER, machine-backed by `@zag-js/carousel` (the SAME machine any framework
 *      binding would use, re-exported from `@skryensya/core/machines`). It renders the prev/next
 *      buttons and one dot per PAGE, and the machine owns the rest: it measures the track's real
 *      scroll-snap positions, tracks the page from the native scroll offset, disables the ends,
 *      handles keyboard and drag, and re-measures on resize.
 *
 * Why the machine matters here, concretely: the reachable snap positions are NOT one-per-slide. With
 * peeking slides the last few all clamp to the same maximum scroll offset, so a hand-rolled
 * "one dot per slide" carousel ends with dots that can never activate and a next button that never
 * disables. The machine derives the pages from the measured, clamped, de-duplicated positions, so the
 * dots and the scroll agree by construction.
 *
 * Layout is CSS's, not the machine's: `--sk-carousel-slide-size` sizes a slide (peek or multi-up) for
 * BOTH layers, so the zero-JS baseline and the enhanced carousel are the same carousel.
 */

export const carouselAttrs = {
  /** Marks the enhancer root; its presence is what loads and mounts the vanilla controls. */
  root: "data-sk-carousel",
  /** `data-loop` on the root: wrap around past either end. */
  loop: "data-loop",
  /** `data-autoplay` on the root: advance on a timer. Empty for the 4000ms default, or a delay in ms. */
  autoplay: "data-autoplay",
  /** `data-orientation="vertical"` on the root: a vertical track. Defaults to horizontal. */
  orientation: "data-orientation",
  /**
   * `data-controls="none"` on the root: draw no prev/next and no dots, in either layer. The track
   * is then a plain snap scroller you swipe or drag, and the peek is the only thing saying so.
   */
  controls: "data-controls",
  /**
   * `data-fade-edge` on the root: the track fades its two ends, scroll-aware, with FadeEdge's own
   * ramp (`fade-edge.css`), so a slide cut by the viewport releases instead of hard-clipping and
   * each end retires once it is reached. FadeEdge is paint-only composition; the carousel is the
   * scroller it paints on.
   */
  fade: "data-fade-edge",
  /** `data-indicator="count"` on the root: "2 / 5" in place of the dots. Dots by default. */
  indicator: "data-indicator",
  /**
   * `data-mouse-drag="off"` on the root: turn OFF click-and-drag with a mouse. It is ON by default,
   * because a mouse cannot scroll a horizontal track any other way, a vertical wheel scrolls the
   * PAGE, so without drag a desktop pointer has no way through a carousel with no controls.
   * Turn it off for slides whose text people are meant to select: the drag suppresses selection.
   */
  mouseDrag: "data-mouse-drag",
  /** `data-align` on the root: which edge of the track a slide snaps to. `start` by default. */
  align: "data-align",
  /** `data-slides-per-move` on the root: how many slides one step (button, key, snap) travels. 1 by default. */
  slidesPerMove: "data-slides-per-move",
  /** `data-snap="proximity"` on the root: a soft snap that lets a drag come to rest between slides. */
  snap: "data-snap",
  /**
   * `data-curve` on the root: the slides stand on a ring. `convex` sees it from outside (the centred
   * slide nearest), `concave` from inside (the centred slide farthest). CSS only, horizontal only.
   */
  curve: "data-curve",
  /** `data-default-page` on the root: the page the carousel opens on. 0 by default. */
  defaultPage: "data-default-page",
  /** `data-bend` on a CurveCarousel root: each slide bends along the ring, not just its place on it. */
  bend: "data-bend",
  /** `data-infinite="off"` on a CurveCarousel root: stop at the first and the last slide. Infinite by default. */
  infinite: "data-infinite",
  /** `data-momentum="off"` on a CurveCarousel root: a release settles at once instead of gliding. */
  momentum: "data-momentum",
  /** `data-tall` on a CurveCarousel root: portrait slides (2:3) whose content fills them. */
  tall: "data-tall",
  /** `data-focus` on a CurveCarousel root: one large slide, its neighbours peeking at the sides. */
  focus: "data-focus",
  /** `data-progressive` on the root: ProgressiveCarousel, a circular row whose widths shrink progressively. */
  progressive: "data-progressive",
} as const;

export const carouselParts = {
  root: "sk-carousel",
  track: "sk-carousel__track",
  slide: "sk-carousel__slide",
  controls: "sk-carousel__controls",
  button: "sk-carousel__button",
  /** The pause/play toggle, drawn only when `data-autoplay` is on. A carousel that moves by itself
   * has to be stoppable (WCAG 2.2.2), so the option and the control are one thing, not two. */
  autoplay: "sk-carousel__autoplay",
  dots: "sk-carousel__dots",
  /** The page counter ("2 / 5") `data-indicator="count"` draws instead of the dots. */
  count: "sk-carousel__count",
  dot: "sk-carousel__dot",
  /** `bend` (CurveCarousel): the decorative layer of bands a slide's content is cut into. */
  bend: "sk-carousel__bend",
  /** One vertical band of a bent slide: a clipped copy of its content that turns on the ring alone. */
  band: "sk-carousel__band",
  /** CurveCarousel's indicator: a flat row of one segment per slide (it has no prev/next buttons). */
  stepper: "sk-carousel__stepper",
  /** One segment of the stepper: a button to that slide, the current one filled. */
  step: "sk-carousel__step",
  /** The fill inside a segment; under autoplay it grows with the time left on the current slide. */
  stepProgress: "sk-carousel__step-progress",
  /** ProgressiveCarousel's top row: its heading at the start, the stepper and prev/next at the end. */
  header: "sk-carousel__header",
  heading: "sk-carousel__heading",
  /** ProgressiveCarousel's caption area under the row: one caption per slide, only the active one's shown. */
  captions: "sk-carousel__captions",
  caption: "sk-carousel__caption",
  captionTitle: "sk-carousel__caption-title",
  captionBody: "sk-carousel__caption-body",
  captionAction: "sk-carousel__caption-action",
} as const;

export type CarouselPart = keyof typeof carouselParts;
export type CarouselPartClass = (typeof carouselParts)[CarouselPart];

/** Fired on the root whenever the active page changes (scroll, control, keyboard, drag, or a goto). */
export const carouselEvents = {
  change: "sk:carouselchange",
  /** Dispatch this on the root to command a snap: `new CustomEvent("sk:carouselgoto", { detail: { index } })`. */
  goto: "sk:carouselgoto",
} as const;

export type CarouselChangeDetail = {
  /** The active page. With one slide per page (the default) this is the slide index. */
  index: number;
  /** How many pages the track actually has: measured, so peeking slides do not invent a page. */
  count: number;
};

export type CarouselGotoDetail = {
  index: number;
};

/** The machine's labels, one copy for both bindings so their accessible names cannot drift. */
export const carouselTranslations = {
  nextTrigger: "Siguiente",
  prevTrigger: "Anterior",
  indicator: (index: number) => `Ir a la diapositiva ${index + 1}`,
  /** The "2 / 5" counter. */
  count: (page: number, count: number) => `${page + 1} / ${count}`,
  item: (index: number, count: number) => `${index + 1} de ${count}`,
  autoplayStart: "Reanudar la rotación",
  autoplayStop: "Pausar la rotación",
};

/**
 * The contract. Both bindings run the SAME `@zag-js/carousel` machine with the same configuration
 * (vanilla's enhancer, React's own component), so what a contract adds here is the vocabulary:
 * which knobs exist and what each one costs.
 *
 * `autoplay` is the interesting one. A carousel that moves by itself has to be stoppable (WCAG
 * 2.2.2), so turning it on is also what draws the pause control: the option and the control are one
 * thing. The millisecond form (`data-autoplay="6000"`) stays authorable and is not published:
 * a delay is tuning, and the catalogue is for choosing.
 */
export const carouselContract = {
  id: "carousel",
  category: "content",
  css: "@skryensya/core/components/carousel.css",
  parts: carouselParts,
  /*
   * Template authors root + track + slides. Prev/next, dots, and autoplay pause are enhancer-
   * injected (or native pseudo-elements until ready); class names stay owned here for CSS.
   */
  systemOwned: ["controls", "button", "autoplay", "dots", "dot", "count", "bend", "band", "stepper", "step", "stepProgress"],
  hooks: [
    "--sk-carousel-control-bg",
    "--sk-carousel-control-border",
    "--sk-carousel-control-disabled-fg",
    "--sk-carousel-control-radius",
    "--sk-carousel-control-fg",
    "--sk-carousel-control-size",
    "--sk-carousel-dot-active-color",
    "--sk-carousel-dot-color",
    "--sk-carousel-dot-gap",
    "--sk-carousel-dot-size",
    "--sk-carousel-edge-padding",
    "--sk-carousel-gap",
    "--sk-carousel-motion-duration",
    "--sk-carousel-motion-easing",
    "--sk-carousel-native-next-disabled-icon",
    "--sk-carousel-native-next-icon",
    "--sk-carousel-native-previous-disabled-icon",
    "--sk-carousel-native-previous-icon",
    "--sk-carousel-curve-strength",
    "--sk-carousel-progressive-hover",
    "--sk-carousel-progressive-step",
    "--sk-carousel-slide-size",
  ],
  events: carouselEvents,
  eventDetails: {
    change: { detail: { index: "number", count: "number" }, reactProp: false, source: "root" },
    goto: { detail: { index: "number" }, direction: "in", source: "root" },
  },

  options: {
    /** Wrap around past either end. */
    loop: { type: "boolean", default: false, attr: "data-loop", trueValue: "" },
    /** Advance on a timer, and draw the pause control that WCAG 2.2.2 requires along with it. */
    autoplay: { type: "boolean", default: false, attr: "data-autoplay", trueValue: "" },
    /** Explicit delay in milliseconds. Same behavior as autoplay, with authored timing. */
    autoplayDelay: { type: "number", min: 1, attr: "data-autoplay", prop: "autoplay" },
    /** Leave false to demonstrate the native CSS-only scroll-snap baseline. */
    mounted: { type: "boolean", default: true, attr: "data-sk-carousel", trueValue: "" },
    /** The one authored size knob, kept as a custom property on the root. */
    slideSize: {
      type: "string",
      styleProperty: "--sk-carousel-slide-size",
    },
    orientation: { type: "enum", values: ["horizontal", "vertical"], attr: "data-orientation" },
    /**
     * `none` draws no prev/next and no dots, in either layer. The track is then a plain snap
     * scroller, and the peeking slide is the only thing saying so, which is a real design, and a
     * bad accident.
     */
    controls: { type: "enum", values: ["auto", "none"], attr: "data-controls" },
    /** Fade the track's two ends with FadeEdge, so the peeking slide releases instead of hard-clipping. */
    fade: { type: "boolean", default: false, attr: "data-fade-edge", trueValue: "" },
    /** What says where you are: one dot per page, or a "2 / 5" counter. */
    indicator: { type: "enum", values: ["dots", "count"], attr: "data-indicator" },
    /**
     * Click-and-drag with a mouse, ON by default: a mouse cannot scroll a horizontal track any
     * other way. Turn it off for slides whose text people are meant to select.
     */
    mouseDrag: { type: "enum", values: ["on", "off"], attr: "data-mouse-drag" },
    /**
     * Which edge of the track a slide comes to rest on, Embla's `align`. `center` is the focused-slide
     * carousel: pair it with `edgePadding`, or the first and last slide cannot reach the middle.
     */
    align: { type: "enum", values: ["start", "center", "end"], attr: "data-align" },
    /** How many slides one step travels, Embla's `slidesToScroll`. Slides in between are not snap points. */
    slidesPerMove: { type: "number", min: 1, attr: "data-slides-per-move" },
    /**
     * `proximity` snaps only when a drag ends near a slide, so it can come to rest between two: the closest
     * this carousel gets to Embla's `dragFree`. Absent means `mandatory`: every release lands on a slide.
     */
    snap: { type: "enum", values: ["mandatory", "proximity"], attr: "data-snap" },
    /** Air before the first slide and after the last, as a CSS length. What lets `align="center"` centre the ends. */
    edgePadding: { type: "string", styleProperty: "--sk-carousel-edge-padding" },
    /**
     * The ring of `Carousel.curve` (CurveCarousel): `convex` looks at it from outside, the centred slide
     * nearest and the sides turning away; `concave` stands inside it, the centred slide farthest and
     * the sides wrapping towards you. Pure CSS (scroll-driven animations): where they are missing,
     * under reduced motion and in right-to-left, the track stays flat.
     */
    curve: { type: "enum", values: ["convex", "concave"], attr: "data-curve" },
    /**
     * How strong the ring's lens is: how much the slides at the ends grow inside the ring (`concave`)
     * or shrink outside it (`convex`). 1 is the default; 2 is twice as strong, 0.5 half as strong.
     */
    curveStrength: { type: "number", min: 0.25, max: 2.5, styleProperty: "--sk-carousel-curve-strength" },
    /**
     * Bend each slide along the ring, the wide-lens look where a picture's top and bottom edges arc,
     * instead of standing it flat on it. The bindings cut each slide's content into vertical bands
     * (decorative copies, hidden from assistive tech; the content itself stays for it).
     */
    bend: { type: "boolean", default: false, attr: "data-bend", trueValue: "" },
    /** Roll without end: past the last slide comes the first. On by default; off stops at both ends. */
    infinite: { type: "enum", values: ["on", "off"], attr: "data-infinite" },
    /**
     * A drag that lets go keeps the wheel turning and slows down little by little, like a real wheel,
     * before it comes to rest on a slide. On by default; off settles on the nearest slide at once.
     */
    momentum: { type: "enum", values: ["on", "off"], attr: "data-momentum" },
    /** Taller slides: a portrait 9:16 box that the slide's content fills (a picture is cropped to cover it). */
    tall: { type: "boolean", default: false, attr: "data-tall", trueValue: "" },
    /**
     * One slide in focus instead of five: a large slide at the front with the one before and the one after
     * peeking at the sides, and every turn snapping onto the next. For a hero with a single message.
     */
    focus: { type: "boolean", default: false, attr: "data-focus", trueValue: "" },
    /** The page it opens on, counted from 0. A CurveCarousel without one opens on the middle slide. */
    defaultPage: { type: "number", min: 0, attr: "data-default-page" },
  },

  signatures: {
    Carousel: {
      intent: ["carousel", "slider-of-cards", "snap-scroller", "gallery"],
      host: { element: "section" },
      options: [
        "loop",
        "autoplay",
        "autoplayDelay",
        "mounted",
        "slideSize",
        "orientation",
        "controls",
        "indicator",
        "fade",
        "mouseDrag",
        "align",
        "slidesPerMove",
        "snap",
        "edgePadding",
        "defaultPage",
      ],
      slots: { children: { accepts: "signature", of: ["CarouselSlide"], required: true } },
      template: {
        element: "section",
        part: "root",
        host: true,
        /*
         * A plain div, not a `<ul>`. It reads like a list and it is not one: the machine gives each
         * slide `role="group"` and `aria-roledescription="slide"`, which is the ARIA carousel
         * pattern and which takes the items OUT of the list, leaving a list with no list items,
         * exactly what axe reports. The slides are counted by "1 de 3", not by the list.
         */
        children: [{ element: "div", part: "track", slot: "children" }],
      },
      react: { from: "@skryensya/react/carousel", name: "Carousel" },
    },

    /*
     * THE RING: the same carousel (machine, snap points, controls, keyboard) with its slides on a ring,
     * for a hero rather than a shelf. A signature and not just an option of Carousel because what makes
     * a ring work is fixed, not chosen: the slide at rest is the middle one (`align` is always centre),
     * the track is horizontal, and the sheet sizes the slides and the air at the ends to match.
     */
    "Carousel.curve": {
      intent: ["hero-carousel", "ring-carousel", "3d-carousel", "perspective-carousel", "coverflow"],
      host: { element: "section" },
      options: ["curve", "curveStrength", "tall", "focus", "bend", "fade", "infinite", "momentum", "autoplay", "autoplayDelay", "mounted", "slideSize", "defaultPage"],
      requires: ["curve"],
      slots: { children: { accepts: "signature", of: ["CarouselSlide"], required: true } },
      template: {
        element: "section",
        part: "root",
        host: true,
        attrs: { "data-align": "center" },
        children: [{ element: "div", part: "track", slot: "children" }],
      },
      react: { from: "@skryensya/react/carousel", name: "CurveCarousel" },
    },

    /*
     * THE PROGRESSIVE ROW (ProgressiveCarousel): a circular row of slides whose widths shrink progressively,
     * the active one first and the next ones as ever narrower strips, the active one's caption under them.
     * A carousel by behaviour (one slide at a time, prev and next, a stepper), its own layout, so its items
     * are data: one entry is a slide AND a caption, far apart in the markup.
     */
    "Carousel.progressive": {
      intent: ["progressive-carousel", "news-carousel", "cascade-carousel", "expanding-gallery", "featured-stories"],
      host: { element: "section" },
      options: ["mounted", "defaultPage"],
      slots: {
        heading: { accepts: "node" },
        items: {
          accepts: "items",
          required: true,
          item: {
            options: {},
            slots: {
              /** The picture: active, it shows whole; as a strip, a slice of its middle. */
              media: { accepts: "node", required: true },
              title: { accepts: "node", required: true },
              body: { accepts: "node" },
              /** A link or button for the active slide ("Read the announcement"). */
              action: { accepts: "node" },
            },
          },
        },
      },
      template: {
        element: "section",
        part: "root",
        host: true,
        attrs: { "data-progressive": "" },
        children: [
          {
            element: "div",
            part: "header",
            whenGiven: "heading",
            children: [{ element: "div", part: "heading", slot: "heading" }],
          },
          { element: "div", part: "track", children: [{ element: "div", part: "slide", repeat: "items", itemSlot: "media" }] },
          {
            element: "div",
            part: "captions",
            children: [
              {
                element: "div",
                part: "caption",
                repeat: "items",
                children: [
                  { element: "p", part: "captionTitle", itemSlot: "title" },
                  { element: "p", part: "captionBody", itemSlot: "body", whenItemSlotGiven: "body" },
                  { element: "div", part: "captionAction", itemSlot: "action", whenItemSlotGiven: "action" },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/carousel", name: "ProgressiveCarousel" },
    },

    CarouselSlide: {
      intent: ["slide", "carousel-item"],
      host: { element: "div" },
      parents: ["Carousel", "Carousel.curve"],
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "slide", host: true, slot: "children" },
      react: { from: "@skryensya/react/carousel", name: "CarouselSlide" },
    },
  },

  a11y: [
    {
      signatures: ["Carousel", "Carousel.curve", "Carousel.progressive"],
      when: {},
      requiresOneOf: ["aria-label", "aria-labelledby"],
      because:
        "The machine gives the root role=\"region\" and aria-roledescription=\"carousel\", but neither " +
        "names it: WAI-ARIA's Carousel pattern asks for a label naming the CONTENT (\"Featured products\", " +
        "not \"carousel\", which the roledescription already says), the same landmark-naming rule " +
        "`nav-list`/`tabs` already enforce for themselves.",
    },
  ],
} as const satisfies ComponentContract;

/** How many bands a bent slide is cut into: a slide spans about 26° of the wheel, so ~3° a band reads
 * round, and every band is a 3D layer the compositor turns each frame. */
export const CAROUSEL_BEND_BANDS = 8;

/**
 * BEND (`data-bend`): cut each slide's content into vertical bands so the slide bends along the ring
 * instead of standing flat on it. A flat CSS box cannot curve, but a row of narrow ones can: each band
 * is a copy of the content clipped to its slice, and each turns on its own view timeline, so the
 * neighbours turn a little more than one another and the slide reads as a curved surface.
 *
 * The bands are decoration: the layer is `aria-hidden` and `inert`, and the original content stays in
 * the slide (the sheet hides it visually) as the thing assistive tech reads and the place a link or a
 * button keeps working from. Both bindings call this after mount and the cleanup before unmount.
 */
export function bendCarouselSlides(root: HTMLElement, bands: number = CAROUSEL_BEND_BANDS): () => void {
  const layers: HTMLElement[] = [];
  for (const slide of Array.from(root.querySelectorAll<HTMLElement>(`.${carouselParts.slide}`))) {
    const content = Array.from(slide.children).find((child: Element) => !child.classList.contains(carouselParts.bend));
    if (!content) continue;
    const layer = document.createElement("div");
    layer.className = carouselParts.bend;
    layer.setAttribute("aria-hidden", "true");
    layer.inert = true;
    for (let index = 0; index < bands; index++) {
      const band = document.createElement("div");
      band.className = carouselParts.band;
      // Its slice, a pixel wider each side so two turned neighbours overlap instead of leaving a seam.
      band.style.insetInlineStart = `calc(${(index * 100) / bands}% - 1px)`;
      band.style.inlineSize = `calc(${100 / bands}% + 2px)`;
      const copy = content.cloneNode(true) as HTMLElement;
      copy.removeAttribute("id");
      for (const named of Array.from(copy.querySelectorAll("[id]"))) named.removeAttribute("id");
      // The copy is the slide's full width, shifted to this band's slice, so every band shows its own part
      // of one unstretched picture. A share of the band first; the ring engine rewrites both in px once it
      // has measured the slide (a percentage of a band that is 2px wider than its slice drifts).
      copy.style.inlineSize = `${bands * 100}%`;
      copy.style.marginInlineStart = `${-index * 100}%`;
      band.append(copy);
      layer.append(band);
    }
    slide.append(layer);
    layers.push(layer);
  }
  return () => {
    for (const layer of layers) layer.remove();
  };
}

/* The ring engine of CurveCarousel, also at `@skryensya/core/curve-ring`. */
export * from "./curve-ring.js";
/* ProgressiveCarousel's engine. */
export * from "./progressive-carousel.js";
