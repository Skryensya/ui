import {
  COMPARE_SLIDER_COARSE_STEP,
  COMPARE_SLIDER_DEFAULT_POSITION,
  COMPARE_SLIDER_STEP,
  compareSliderClamp,
  compareSliderContract,
  compareSliderHandleOrientation,
  compareSliderKeyOrientation,
  compareSliderMove,
  compareSliderParts,
  compareSliderPositionFromPointer,
  compareSliderProperties,
  type CompareSliderDirectionOption,
} from "@skryensya/core/compare-slider";
import { createCompareSliderView, type CompareSliderView } from "@skryensya/core/compare-slider-view";
import { resolveSplitterKey } from "@skryensya/core/splitter";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

/* Derived, never restated: the defaults live in the contract. */
const { direction: directionOption, position: positionOption } = compareSliderContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type CompareSliderProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The layer shown from the start edge to the divider. It should fill its box. */
  before: ReactNode;
  /** The layer shown from the divider to the end edge: the same box as the other, which it fills. */
  after: ReactNode;
  /**
   * The divider's accessible name. It is a line and a thumb, so nothing about it names itself: a focusable `slider`
   * that says only "slider" is a control nobody can tell apart.
   */
  label: string;
  /** `horizontal` is side by side with an upright divider; `vertical` is stacked with a flat one. */
  direction?: CompareSliderDirectionOption;
  /** How much of the box the before layer shows when it starts, 0 to 100. The middle by default. Enter goes back to it. */
  position?: number;
  /** Called with the new position after every change: a drag, a key, a press. */
  onPositionChange?: (position: number) => void;
};

/**
 * Two layers of the same size and a divider you drag to reveal one over the other: before and after.
 *
 * The divider is the same bar Resizable uses (its keys, its right-to-left sign, its thumb), carrying one value: how much
 * of the box the before layer shows. Arrows move it a percent (Shift, ten), Home and End take it to the ends and Enter
 * back to where it started; a press anywhere on the box moves it there. The six-dot thumb is always on screen.
 *
 * Both layers are laid out at the full size of the box and a clip opens over the after one, so nothing is resized and the
 * two stay registered. A layer is a box, not an image: put anything in it, and keep it non-interactive, since a press on
 * the box is the divider's.
 */
export function CompareSlider({
  after,
  before,
  className,
  direction = directionOption.default,
  label,
  onPositionChange,
  position: initial = positionOption.default,
  style,
  ...props
}: CompareSliderProps) {
  const start = compareSliderClamp(initial ?? COMPARE_SLIDER_DEFAULT_POSITION);
  /*
   * THE POSITION IS NOT STATE. It changes on every pointer move, and a state change re-renders this component on every one of
   * them; the position is only DRAWN, and drawing is the shared view's job (`compare-slider-view.ts`: the clip on the after
   * layer and the divider's `translate`, written straight on those two elements). React renders the initial position once,
   * which is what a server shows, and the view takes over when the component mounts. Only `dragging` is state, and it changes
   * twice per drag.
   */
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<CompareSliderView | null>(null);
  const positionRef = useRef(start);
  const onChangeRef = useRef(onPositionChange);
  onChangeRef.current = onPositionChange;

  useEffect(() => {
    const root = rootRef.current;
    const handle = handleRef.current;
    if (!root || !handle) return;
    const view = createCompareSliderView(root, handle, afterRef.current, direction);
    viewRef.current = view;
    view.paint(positionRef.current);
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [direction]);

  const commit = useCallback((next: number) => {
    const value = compareSliderClamp(next);
    if (value === positionRef.current) return;
    positionRef.current = value;
    viewRef.current?.paint(value);
    onChangeRef.current?.(value);
  }, []);

  /** The pointer as a position along the axis, against the box the view took when the press began (a move reads nothing). */
  const fromPointer = (event: ReactPointerEvent<HTMLDivElement>): number => {
    const view = viewRef.current;
    if (!view) return positionRef.current;
    const rect = view.rect;
    const horizontal = direction === "horizontal";
    return compareSliderPositionFromPointer({
      direction,
      pointer: horizontal ? event.clientX : event.clientY,
      start: horizontal ? rect.left : rect.top,
      end: horizontal ? rect.right : rect.bottom,
      rtl: view.rtl,
    });
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    /* A press does not start a text selection or a native image drag, and puts the focus where the keys are. */
    event.preventDefault();
    viewRef.current?.refresh();
    handleRef.current?.focus({ preventScroll: true });
    rootRef.current?.setPointerCapture?.(event.pointerId);
    setDragging(true);
    commit(fromPointer(event));
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    commit(fromPointer(event));
  };
  const onPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    rootRef.current?.releasePointerCapture?.(event.pointerId);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const action = resolveSplitterKey(event, { step: COMPARE_SLIDER_STEP, coarseStep: COMPARE_SLIDER_COARSE_STEP, orientation: compareSliderKeyOrientation(direction) });
    if (action.kind === "none") return;
    event.preventDefault();
    const rtl = viewRef.current?.rtl ?? false;
    if (action.kind === "delta") commit(compareSliderMove(positionRef.current, action.delta * (rtl ? -1 : 1)));
    else if (action.kind === "home") commit(0);
    else if (action.kind === "end") commit(100);
    else commit(start);
  };

  /* The initial position, for the server and the first paint; the view is what moves it after that. */
  const rootStyle = { ...style, [compareSliderProperties.position]: String(start) } as CSSProperties;

  return (
    <div
      {...props}
      ref={rootRef}
      className={cx(compareSliderParts.root, className)}
      data-direction={direction}
      data-dragging={dragging ? "" : undefined}
      style={rootStyle}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
    >
      <div className={compareSliderParts.before}>{before}</div>
      <div ref={afterRef} className={compareSliderParts.after}>{after}</div>
      <div
        ref={handleRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-orientation={compareSliderHandleOrientation(direction)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(start)}
        className={compareSliderParts.handle}
        onKeyDown={onKeyDown}
        onDoubleClick={() => commit(start)}
      >
        {/* The thumb is paint (`patterns/grip.css`): the divider takes the pointer and the keys. */}
        <span aria-hidden="true" className={`${compareSliderParts.grip} sk-grip`} />
      </div>
    </div>
  );
}
