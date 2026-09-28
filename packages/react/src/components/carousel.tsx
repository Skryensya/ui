import {
  carouselContract,
  carouselEvents,
  carouselParts,
  carouselTranslations,
  type CarouselChangeDetail,
  type CarouselGotoDetail,
} from "@skryensya/core/carousel";
import type { OptionValue } from "@skryensya/core/contract";
import { carousel } from "@skryensya/core/machines";
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
  mouseDrag?: OptionValue<typeof carouselContract.options.mouseDrag>;
  /** Set false to leave the native CSS-only scroll-snap baseline unenhanced. */
  mounted?: boolean;
  /** CSS length for each slide, e.g. `min(42%, 14rem)`. */
  slideSize?: string;
};

type CarouselApi = ReturnType<typeof carousel.connect>;

/* The machine for the slides below, and each slide's index. Null outside a mounted Carousel, where a
 * slide is the plain scroll-snap item the zero-JS baseline draws. */
const CarouselApiContext = createContext<CarouselApi | null>(null);
const CarouselIndexContext = createContext<number>(-1);

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

function rootAttributes({ autoplay, controls, loop, mouseDrag, orientation }: InnerProps) {
  return {
    "data-autoplay": typeof autoplay === "number" ? autoplay : autoplay ? "" : undefined,
    "data-controls": controls,
    "data-loop": loop ? "" : undefined,
    "data-mouse-drag": mouseDrag,
    "data-orientation": orientation,
  };
}

function StaticCarousel(inner: InnerProps) {
  const { autoplay, children, className, controls, handleRef, loop, mouseDrag, orientation, slideSize, style, ...props } =
    inner;
  const rootRef = useRef<HTMLElement>(null);
  useCarouselHandle(handleRef, rootRef);

  return (
    <section
      {...props}
      {...rootAttributes(inner)}
      className={cx(carouselParts.root, className)}
      ref={rootRef}
      style={slideSize ? { ...style, "--sk-carousel-slide-size": slideSize } as CSSProperties : style}
    >
      {/* A div, not a <ul>: the machine gives each slide role="group", which takes it out of the
          list and leaves a list with no list items. */}
      <div className={carouselParts.track}>{children}</div>
    </section>
  );
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
}

function MountedCarousel(inner: InnerProps) {
  const { autoplay, children, className, controls, dir, handleRef, id, loop, mouseDrag, orientation, slideSize, style, ...props } =
    inner;
  const generatedId = useId();
  const rootId = id ?? generatedId;
  const rootRef = useRef<HTMLElement>(null);
  useCarouselHandle(handleRef, rootRef);

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
    !wantsAutoplay || prefersReducedMotion()
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
      style={{
        ...(rootProps.style as CSSProperties),
        ...style,
        ...(slideSize ? { "--sk-carousel-slide-size": slideSize } : null),
      } as CSSProperties}
    >
      <CarouselApiContext.Provider value={api}>
        <div {...api.getItemGroupProps()} className={carouselParts.track}>
          {slides.map((slide, index) => (
            <CarouselIndexContext.Provider key={slide.key ?? index} value={index}>
              {slide}
            </CarouselIndexContext.Provider>
          ))}
        </div>
      </CarouselApiContext.Provider>
      {showControls ? (
        <div {...api.getControlProps()} className={carouselParts.controls}>
          <button {...api.getPrevTriggerProps()} className={`${carouselParts.button} sk-interactive`}>
            <Icon name="chevron-left" size="sm" />
          </button>
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
          <button {...api.getNextTriggerProps()} className={`${carouselParts.button} sk-interactive`}>
            <Icon name="chevron-right" size="sm" />
          </button>
          {/* The glyph is CSS, drawn from `data-pressed`. Its state and label follow the reader's last
              explicit choice, not Zag's momentary `isPlaying` (see `Carousel.svelte`). */}
          {wantsAutoplay ? (
            <button
              {...api.getAutoplayTriggerProps()}
              aria-label={desiredPlaying ? carouselTranslations.autoplayStop : carouselTranslations.autoplayStart}
              className={`${carouselParts.button} ${carouselParts.autoplay} sk-interactive`}
              data-pressed={desiredPlaying ? "" : undefined}
              onClick={(event) => {
                if (event.defaultPrevented) return;
                setDesiredPlaying((playing) => !playing);
              }}
            />
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
  const itemProps = api && index >= 0 ? api.getItemProps({ index }) : null;
  return (
    <div
      {...props}
      {...itemProps}
      className={cx(carouselParts.slide, className)}
      /* `scroll-snap-align` first, as the enhancer seeds it before the machine's first measure: that
         measure reads the computed value, and a consumer may mount without the system's sheet. */
      style={itemProps ? { scrollSnapAlign: "start", ...(itemProps.style as CSSProperties), ...props.style } : props.style}
    >
      {children}
    </div>
  );
}
