import {
  carouselContract,
  carouselEvents,
  carouselParts,
  carouselTranslations,
  type CarouselChangeDetail,
  type CarouselGotoDetail,
} from "@skryensya/core/carousel";
import type { OptionValue } from "@skryensya/core/contract";
import { fadeEdgeAttrs } from "@skryensya/core/fade-edge";
import { watchFadeEdge } from "@skryensya/core/fade-edge-dom";
import { carousel } from "@skryensya/core/machines";
import { prefersReducedMotion as reducedMotion } from "@skryensya/core/reduced-motion";
import { normalizeProps, useMachine } from "@zag-js/react";
import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Icon } from "./icon.js";

/* Derived, never restated: the default lives in the contract. */
const { mounted: mountedOption } = carouselContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

/*
 * One `<button>` per slide, with no cap, rendered a thousand-slide control rail ~2,416px wide -
 * found as a real break, not a taste call. The contract already offers `indicator="count"` ("2 / 5")
 * as the built-in alternative to dots; past this many pages, nothing reads a wall of dots as
 * navigation anyway, so the count display takes over regardless of which indicator was asked for.
 */
const MAX_DOTS = 20;

export type CarouselHandle = {
  /** Snap to a page index. Dispatches the same goto command any consumer can dispatch. */
  snapTo: (index: number) => void;
  /** The carousel root element, or null before mount. */
  element: HTMLElement | null;
};

export type CarouselProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  /** Names the carousel region for assistive tech. */
  "aria-label"?: string;
  loop?: boolean;
  /** Advance on a timer. Also draws the pause control, which WCAG 2.2.2 requires along with it. */
  autoplay?: boolean | number;
  orientation?: OptionValue<typeof carouselContract.options.orientation>;
  controls?: OptionValue<typeof carouselContract.options.controls>;
  /** Fade the track's two ends with FadeEdge (needs `@skryensya/core/components/fade-edge.css`). */
  fade?: boolean;
  /** What says where you are: one dot per page (default), or a "2 / 5" counter. */
  indicator?: OptionValue<typeof carouselContract.options.indicator>;
  mouseDrag?: OptionValue<typeof carouselContract.options.mouseDrag>;
  /** Set false to leave the native CSS-only scroll-snap baseline unenhanced. */
  mounted?: boolean;
  /** CSS length for each slide, e.g. `min(42%, 14rem)`. */
  slideSize?: string;
  /** Which edge a slide comes to rest on. `center` wants `edgePadding` so the ends can reach the middle. */
  align?: OptionValue<typeof carouselContract.options.align>;
  /** How many slides one step travels. The slides in between are not snap points. */
  slidesPerMove?: number;
  /** `proximity` lets a drag come to rest between slides, the closest this gets to a free drag. */
  snap?: OptionValue<typeof carouselContract.options.snap>;
  /** Air before the first slide and after the last, as a CSS length. */
  edgePadding?: string;
};

type CarouselApi = ReturnType<typeof carousel.connect>;

/* The machine for the slides below, and each slide's index. Null outside a mounted Carousel, where a
 * slide is the plain scroll-snap item the zero-JS baseline draws. */
const CarouselApiContext = createContext<CarouselApi | null>(null);
const CarouselIndexContext = createContext<number>(-1);
/* What every slide needs from the root: where it comes to rest, and whether it is a stop at all. */
const CarouselSnapContext = createContext<{ align: OptionValue<typeof carouselContract.options.align>; step: number }>({ align: "start", step: 1 });

/*
 * CAROUSEL, the same `@zag-js/carousel` machine the vanilla enhancer runs, configured the same way
 * (`Carousel.svelte` has the reasoning behind every setting). React used to render only the static
 * markup and wait for the vanilla enhancer to find it, which left a React app without the vanilla
 * runtime with no controls at all.
 *
 * `mounted={false}` is the zero-JS baseline: the section and the track, no machine.
 */
export const Carousel = forwardRef<CarouselHandle, CarouselProps>(function Carousel(
  { mounted = mountedOption.default, ...props },
  ref,
) {
  return mounted ? <MountedCarousel {...props} handleRef={ref} /> : <StaticCarousel {...props} handleRef={ref} />;
});

type InnerProps = Omit<CarouselProps, "mounted"> & { handleRef: React.ForwardedRef<CarouselHandle> };

function useCarouselHandle(handleRef: InnerProps["handleRef"], rootRef: React.RefObject<HTMLElement | null>) {
  useImperativeHandle(
    handleRef,
    () => ({
      element: rootRef.current,
      snapTo: (index: number) => {
        const detail: CarouselGotoDetail = { index };
        rootRef.current?.dispatchEvent(new CustomEvent(carouselEvents.goto, { detail }));
      },
    }),
    [rootRef],
  );
}

/* The two lengths the sheet reads, merged under the consumer's own style. */
function rootStyle({ edgePadding, slideSize, style }: InnerProps): CSSProperties | undefined {
  if (!slideSize && !edgePadding) return style;
  return {
    ...style,
    ...(slideSize ? { "--sk-carousel-slide-size": slideSize } : {}),
    ...(edgePadding ? { "--sk-carousel-edge-padding": edgePadding } : {}),
  } as CSSProperties;
}

/* One step travels `slidesPerMove` slides, so only every Nth slide is a stop. */
const stepOf = (slidesPerMove: number | undefined) => (slidesPerMove && slidesPerMove > 1 ? Math.floor(slidesPerMove) : 1);

function rootAttributes({ align, autoplay, controls, fade, indicator, loop, mouseDrag, orientation, slidesPerMove, snap }: InnerProps) {
  return {
    "data-align": align,
    "data-slides-per-move": slidesPerMove,
    "data-snap": snap,
    "data-autoplay": typeof autoplay === "number" ? autoplay : autoplay ? "" : undefined,
    "data-controls": controls,
    "data-indicator": indicator,
    "data-fade-edge": fade ? "" : undefined,
    "data-loop": loop ? "" : undefined,
    "data-mouse-drag": mouseDrag,
    "data-orientation": orientation,
  };
}

function StaticCarousel(inner: InnerProps) {
  const {
    align: _align,
    autoplay: _autoplay,
    children,
    className,
    controls: _controls,
    fade: _fade,
    indicator: _indicator,
    edgePadding: _edgePadding,
    handleRef,
    loop: _loop,
    mouseDrag: _mouseDrag,
    orientation: _orientation,
    slideSize: _slideSize,
    slidesPerMove: _slidesPerMove,
    snap: _snap,
    style: _style,
    ...props
  } = inner;
  const rootRef = useRef<HTMLElement>(null);
  useCarouselHandle(handleRef, rootRef);

  return (
    <section
      {...props}
      {...rootAttributes(inner)}
      className={cx(carouselParts.root, className)}
      ref={rootRef}
      style={rootStyle(inner)}
    >
      {/* A div, not a <ul>: the machine gives each slide role="group", which takes it out of the
          list and leaves a list with no list items. */}
      <div className={carouselParts.track}>{children}</div>
    </section>
  );
}


function MountedCarousel(inner: InnerProps) {
  const {
    align,
    autoplay,
    children,
    className,
    controls,
    dir,
    fade,
    indicator,
    edgePadding: _edgePadding,
    handleRef,
    id,
    loop,
    mouseDrag,
    orientation,
    slideSize: _slideSize,
    slidesPerMove,
    snap,
    style: _style,
    ...props
  } = inner;
  const generatedId = useId();
  const rootId = id ?? generatedId;
  const rootRef = useRef<HTMLElement>(null);
  useCarouselHandle(handleRef, rootRef);
  const trackRef = useRef<HTMLDivElement>(null);
  // FadeEdge paints on the scroller itself: the track. The watcher keeps the retired end honest.
  useEffect(() => {
    const track = trackRef.current;
    return fade && track ? watchFadeEdge(track) : undefined;
  }, [fade]);

  const slides = Children.toArray(children).filter(isValidElement);
  const ids = {
    root: rootId,
    itemGroup: `${rootId}-track`,
    item: (index: number) => `${rootId}-slide-${index}`,
    prevTrigger: `${rootId}-prev`,
    nextTrigger: `${rootId}-next`,
    indicatorGroup: `${rootId}-dots`,
    indicator: (index: number) => `${rootId}-dot-${index}`,
  };

  /* Autoplay, with the brake on: whoever asked for less motion does not get a carousel that moves. */
  const wantsAutoplay = autoplay !== undefined && autoplay !== false;
  const [initialAutoplay] = useState(() =>
    !wantsAutoplay || reducedMotion()
      ? false
      : typeof autoplay === "number" && autoplay > 0
        ? { delay: autoplay }
        : true,
  );

  const service = useMachine(carousel.machine, {
    id: rootId,
    ids,
    slideCount: slides.length,
    orientation: orientation === "vertical" ? "vertical" : "horizontal",
    dir: dir === "rtl" ? "rtl" : "ltr",
    loop: Boolean(loop),
    autoplay: initialAutoplay,
    allowMouseDrag: mouseDrag !== "off",
    autoSize: true,
    spacing: "var(--sk-carousel-gap)",
    padding: "var(--sk-carousel-edge-padding)",
    snapType: snap === "proximity" ? "proximity" : "mandatory",
    slidesPerMove: stepOf(slidesPerMove),
    translations: carouselTranslations,
  });
  const api = carousel.connect(service, normalizeProps);
  const apiRef = useRef(api);
  apiRef.current = api;

  /*
   * Hover and focus pause the rotation and leaving resumes it, unless the other one still holds or
   * the reader stopped it with the button (`desiredPlaying`). Zag's machine does neither; see
   * `Carousel.svelte` for the WCAG 2.2.2 reasoning.
   */
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [desiredPlaying, setDesiredPlaying] = useState(Boolean(initialAutoplay));

  useEffect(() => {
    if (!wantsAutoplay) return;
    const shouldPlay = desiredPlaying && !hovering && !focused;
    if (shouldPlay === api.isPlaying) return;
    if (shouldPlay) api.play();
    else api.pause();
  }, [api, desiredPlaying, focused, hovering, wantsAutoplay]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !wantsAutoplay) return;
    const onMouseEnter = () => setHovering(true);
    const onMouseLeave = () => setHovering(false);
    const onFocusIn = () => setFocused(true);
    const onFocusOut = (event: FocusEvent) => {
      if (!root.contains(event.relatedTarget as Node | null)) setFocused(false);
    };
    root.addEventListener("mouseenter", onMouseEnter);
    root.addEventListener("mouseleave", onMouseLeave);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    return () => {
      root.removeEventListener("mouseenter", onMouseEnter);
      root.removeEventListener("mouseleave", onMouseLeave);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
    };
  }, [wantsAutoplay]);

  /* The public event contract: `sk:carouselchange` on page change, `sk:carouselgoto` as input. */
  const lastPage = useRef(-1);
  useEffect(() => {
    const index = api.page;
    if (index === lastPage.current) return;
    const isInitial = lastPage.current === -1;
    lastPage.current = index;
    if (isInitial) return;
    const detail: CarouselChangeDetail = { index, count: api.pageSnapPoints.length };
    rootRef.current?.dispatchEvent(new CustomEvent(carouselEvents.change, { bubbles: true, detail }));
  }, [api.page, api.pageSnapPoints.length]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onGoto = ((event: CustomEvent<CarouselGotoDetail>) => {
      const index = event.detail?.index ?? 0;
      // A goto to the current page does not move the machine; `refresh` re-measures and re-aligns.
      if (index === apiRef.current.page) apiRef.current.refresh();
      else apiRef.current.scrollTo(index);
    }) as EventListener;
    root.addEventListener(carouselEvents.goto, onGoto);
    // Re-measure once the controls row exists: its height changes the box the first measure saw.
    apiRef.current.refresh();
    return () => root.removeEventListener(carouselEvents.goto, onGoto);
  }, []);

  /*
   * The same lifecycle mark the vanilla runtime writes, and it is not bookkeeping here: the sheet
   * shows the native zero-JS controls until it is present, and gates mouse drag on it. Without it
   * React drew both sets of controls at once.
   */
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const rootProps = api.getRootProps();
  const showControls = controls !== "none" && slides.length > 1 && api.pageSnapPoints.length > 1;

  return (
    <section
      {...props}
      {...rootProps}
      {...rootAttributes(inner)}
      className={cx(carouselParts.root, className)}
      data-sk-carousel=""
      data-sk-carousel-ready={ready ? "true" : undefined}
      ref={rootRef}
      style={{ ...(rootProps.style as CSSProperties), ...rootStyle(inner) }}
    >
      <CarouselApiContext.Provider value={api}>
        <CarouselSnapContext.Provider value={{ align: align ?? "start", step: stepOf(slidesPerMove) }}>
          <div
            {...api.getItemGroupProps()}
            {...(fade ? { [fadeEdgeAttrs.direction]: "horizontal", [fadeEdgeAttrs.scrollAware]: "" } : {})}
            className={fade ? `${carouselParts.track} sk-fade-edge` : carouselParts.track}
            ref={trackRef}
          >
            {slides.map((slide, index) => (
              <CarouselIndexContext.Provider key={slide.key ?? index} value={index}>
                {slide}
              </CarouselIndexContext.Provider>
            ))}
          </div>
        </CarouselSnapContext.Provider>
      </CarouselApiContext.Provider>
      {showControls ? (
        <div {...api.getControlProps()} className={carouselParts.controls}>
          <button {...api.getPrevTriggerProps()} className={`${carouselParts.button} sk-button sk-interactive`} data-icon-only="" data-side="start" data-size="sm" data-tone="neutral" data-variant="soft">
            <Icon name="chevron-left" size="md" />
          </button>
          {indicator === "count" || api.pageSnapPoints.length > MAX_DOTS ? (
            <span className={carouselParts.count}>{carouselTranslations.count(api.page, api.pageSnapPoints.length)}</span>
          ) : (
            <div {...api.getIndicatorGroupProps()} className={carouselParts.dots}>
              {api.pageSnapPoints.map((_, index) => (
                <button
                  {...api.getIndicatorProps({ index })}
                  aria-current={index === api.page ? "true" : undefined}
                  className={`${carouselParts.dot} sk-interactive`}
                  key={index}
                />
              ))}
            </div>
          )}
          <button {...api.getNextTriggerProps()} className={`${carouselParts.button} sk-button sk-interactive`} data-icon-only="" data-side="end" data-size="sm" data-tone="neutral" data-variant="soft">
            <Icon name="chevron-right" size="md" />
          </button>
          {/* Both glyphs are drawn and CSS shows one from `data-pressed`. Its state and label follow the reader's last
              explicit choice, not Zag's momentary `isPlaying` (see `Carousel.svelte`). */}
          {wantsAutoplay ? (
            <button
              {...api.getAutoplayTriggerProps()}
              aria-label={desiredPlaying ? carouselTranslations.autoplayStop : carouselTranslations.autoplayStart}
              className={`${carouselParts.button} ${carouselParts.autoplay} sk-button sk-interactive`}
              data-icon-only=""
              data-size="sm"
              data-tone="neutral"
              data-variant="soft"
              data-pressed={desiredPlaying ? "" : undefined}
              onClick={(event) => {
                if (event.defaultPrevented) return;
                setDesiredPlaying((playing) => !playing);
              }}
            >
              <span data-glyph="pause"><Icon name="pause" size="md" /></span>
              <span data-glyph="play"><Icon name="play" size="md" /></span>
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export type CarouselSlideProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

/** One slide. Any content: a Card, an image, a stat; the track snaps to its start edge. */
export function CarouselSlide({ children, className, ...props }: CarouselSlideProps) {
  const api = useContext(CarouselApiContext);
  const index = useContext(CarouselIndexContext);
  const { align, step } = useContext(CarouselSnapContext);
  const itemProps = api && index >= 0 ? api.getItemProps({ index, snapAlign: align }) : null;
  const isStop = index % step === 0;
  return (
    <div
      {...props}
      {...itemProps}
      className={cx(carouselParts.slide, className)}
      /* A slide between two stops (`slidesPerMove` above 1) is marked, and the sheet takes its snap away. */
      data-no-snap={itemProps && !isStop ? "" : undefined}
      /* `scroll-snap-align` first, as the enhancer seeds it before the machine's first measure: that
         measure reads the computed value, and a consumer may mount without the system's sheet. */
      style={itemProps ? { scrollSnapAlign: isStop ? align : "none", ...(itemProps.style as CSSProperties), ...props.style } : props.style}
    >
      {children}
    </div>
  );
}
