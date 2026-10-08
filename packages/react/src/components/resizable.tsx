import {
  RESIZABLE_COARSE_STEP,
  RESIZABLE_STEP,
  resizableAttrs,
  resizableContract,
  resizableHandleOrientation,
  resizableHandleRange,
  resizableParts,
  resizablePercentFromPixels,
  resizableProperties,
  resolveInitialSizes,
  resolvePanelResize,
  type ResizableDirectionOption,
  type ResizablePanelSpec,
} from "@skryensya/core/resizable";
import { hasCrossedDragThreshold, resolveSplitterKey, splitterDirectionSign } from "@skryensya/core/splitter";
import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ForwardRefExoticComponent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

/* Derived, never restated: the defaults live in the contract. */
const { direction: directionOption, minSize: minSizeOption, maxSize: maxSizeOption } = resizableContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

type ResizableContextValue = {
  direction: ResizableDirectionOption;
  sizes: readonly number[];
  specs: readonly ResizablePanelSpec[];
  initial: readonly number[];
  panelIds: readonly string[];
  resize: (index: number, from: readonly number[], delta: number) => void;
  extent: () => number;
  rtl: () => boolean;
  setDragging: (dragging: boolean) => void;
};

const ResizableContext = createContext<ResizableContextValue | null>(null);

export type ResizableProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The axis the panels run along. `horizontal` is side by side. */
  direction?: ResizableDirectionOption;
  /** Fires after every change of the sizes, with the new percentages in panel order. */
  onSizesChange?: (sizes: readonly number[]) => void;
  children?: ReactNode;
};

export type ResizablePanelProps = HTMLAttributes<HTMLDivElement> & {
  /** Where the panel starts, as a percentage of the group. Left out, it shares what the others left. */
  size?: number;
  /** The least it may shrink to, as a percentage. */
  minSize?: number;
  /** The most it may grow to, as a percentage. */
  maxSize?: number;
};

export type ResizableHandleProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "aria-label"> & {
  /** The bar's accessible name. A focusable separator with none is announced as just "separator". */
  label: string;
};

type InternalHandleProps = ResizableHandleProps & { __index?: number };
type InternalPanelProps = ResizablePanelProps & { __index?: number };

type ResizableComponent = ForwardRefExoticComponent<ResizableProps & { ref?: Ref<HTMLDivElement> }> & {
  Panel: typeof ResizablePanel;
  Handle: typeof ResizableHandle;
};

const isOfType = (node: ReactNode, type: unknown): node is ReactElement<Record<string, unknown>> =>
  isValidElement(node) && node.type === type;

const ResizableRoot = forwardRef<HTMLDivElement, ResizableProps>(function Resizable(
  { children, className, direction = directionOption.default, onSizesChange, ...props },
  forwarded,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const base = useId();
  const items = Children.toArray(children);
  const panelNodes = items.filter((node) => isOfType(node, ResizablePanel));

  const specs = useMemo<ResizablePanelSpec[]>(
    () =>
      panelNodes.map((node) => {
        const p = (node as ReactElement<ResizablePanelProps>).props;
        return { size: p.size, minSize: p.minSize ?? minSizeOption.default, maxSize: p.maxSize ?? maxSizeOption.default };
      }),
    // The authored bounds, not the elements: a re-render with the same numbers must not reset a drag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(panelNodes.map((node) => (node as ReactElement<ResizablePanelProps>).props).map((p) => [p.size, p.minSize, p.maxSize]))],
  );
  const initial = useMemo(() => resolveInitialSizes(specs), [specs]);
  const [sizes, setSizes] = useState<readonly number[]>(initial);
  const sizesRef = useRef(sizes);
  sizesRef.current = sizes;

  // A different set of panels, or different bounds, is a different layout: start it from its own sizes.
  const seeded = useRef(initial);
  useEffect(() => {
    if (seeded.current === initial) return;
    seeded.current = initial;
    setSizes(initial);
  }, [initial]);

  const notify = useRef(onSizesChange);
  notify.current = onSizesChange;

  const resize = useCallback(
    (index: number, from: readonly number[], delta: number) => {
      const next = resolvePanelResize({ sizes: from, panels: specs, index, delta });
      if (next === sizesRef.current) return;
      sizesRef.current = next;
      setSizes(next);
      notify.current?.(next);
    },
    [specs],
  );

  const panelIds = useMemo(() => panelNodes.map((_, i) => `${base}-panel-${i}`), [base, panelNodes.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const extent = useCallback(() => {
    const root = rootRef.current;
    if (!root) return 0;
    return Array.from(root.querySelectorAll<HTMLElement>(`:scope > .${resizableParts.panel}`)).reduce((sum, panel) => {
      const rect = panel.getBoundingClientRect();
      return sum + (direction === "horizontal" ? rect.width : rect.height);
    }, 0);
  }, [direction]);

  const rtl = useCallback(() => (rootRef.current ? getComputedStyle(rootRef.current).direction === "rtl" : false), []);
  const setDragging = useCallback((dragging: boolean) => {
    const root = rootRef.current;
    if (!root) return;
    if (dragging) root.setAttribute(resizableAttrs.dragging, "");
    else root.removeAttribute(resizableAttrs.dragging);
  }, []);

  const context = useMemo<ResizableContextValue>(
    () => ({ direction, sizes, specs, initial, panelIds, resize, extent, rtl, setDragging }),
    [direction, sizes, specs, initial, panelIds, resize, extent, rtl, setDragging],
  );

  let panelIndex = 0;
  let handleIndex = 0;
  const content = items.map((node) => {
    if (isOfType(node, ResizablePanel)) return cloneElement(node, { __index: panelIndex++ });
    if (isOfType(node, ResizableHandle)) return cloneElement(node, { __index: handleIndex++ });
    return node;
  });

  return (
    <ResizableContext.Provider value={context}>
      <div
        {...props}
        ref={(node) => {
          rootRef.current = node;
          if (typeof forwarded === "function") forwarded(node);
          else if (forwarded) forwarded.current = node;
        }}
        className={cx(resizableParts.root, className)}
        data-direction={direction}
      >
        {content}
      </div>
    </ResizableContext.Provider>
  );
});

const ResizablePanel = forwardRef<HTMLDivElement, ResizablePanelProps>(function ResizablePanel(
  { children, className, maxSize: _max, minSize: _min, size: _size, style, ...props },
  ref,
) {
  const context = useContext(ResizableContext);
  const index = (props as InternalPanelProps).__index ?? 0;
  const { __index: _i, ...rest } = props as InternalPanelProps;
  return (
    <div
      {...rest}
      ref={ref}
      id={rest.id ?? context?.panelIds[index]}
      className={cx(resizableParts.panel, className)}
      style={{ ...style, [resizableProperties.size]: context?.sizes[index] ?? 1 } as CSSProperties}
    >
      {children}
    </div>
  );
});

const ResizableHandle = forwardRef<HTMLDivElement, ResizableHandleProps>(function ResizableHandle(
  { className, label, ...props },
  ref,
) {
  const context = useContext(ResizableContext);
  const { __index: index = 0, ...rest } = props as Omit<InternalHandleProps, "label" | "className">;
  const start = useRef<{ position: number; sizes: readonly number[]; dragging: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

  if (!context) return null;
  const { direction, sizes, specs, initial, panelIds, resize, extent, rtl } = context;
  const barOrientation = resizableHandleOrientation(direction);
  const range = resizableHandleRange({ sizes, panels: specs, index });
  const sign = () => (direction === "horizontal" ? splitterDirectionSign(rtl() ? "rtl" : "ltr") : 1);
  const position = (event: ReactPointerEvent) => (direction === "horizontal" ? event.clientX : event.clientY);
  const resetDelta = () => (initial[index] ?? sizes[index] ?? 0) - (sizes[index] ?? 0);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    start.current = { position: position(event), sizes, dragging: false };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = start.current;
    if (!gesture) return;
    if (!gesture.dragging) {
      if (!hasCrossedDragThreshold(gesture.position, position(event))) return;
      gesture.dragging = true;
      setDragging(true);
      context.setDragging(true);
    }
    resize(index, gesture.sizes, resizablePercentFromPixels((position(event) - gesture.position) * sign(), extent()));
  };
  const onPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    start.current = null;
    setDragging(false);
    context.setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const action = resolveSplitterKey(event, { step: RESIZABLE_STEP, coarseStep: RESIZABLE_COARSE_STEP, orientation: barOrientation });
    if (action.kind === "none") return;
    event.preventDefault();
    if (action.kind === "delta") resize(index, sizes, action.delta * sign());
    else if (action.kind === "home") resize(index, sizes, -Infinity);
    else if (action.kind === "end") resize(index, sizes, Infinity);
    else resize(index, sizes, resetDelta());
  };

  return (
    <div
      tabIndex={0}
      {...rest}
      ref={ref}
      role="separator"
      aria-label={label}
      aria-orientation={barOrientation}
      aria-controls={panelIds[index]}
      aria-valuenow={range.now}
      aria-valuemin={range.min}
      aria-valuemax={range.max}
      className={cx(resizableParts.handle, className)}
      data-dragging={dragging ? "" : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
      onDoubleClick={() => resize(index, sizes, resetDelta())}
    />
  );
});

/**
 * Panels that share one box, with a bar between each pair that moves the boundary. Sizes are
 * percentages of the group and always add up to 100; a bar redistributes only the pair it separates.
 *
 * Panels and handles must be DIRECT children, in order: a handle sits between the panel before it and
 * the one after, and the group reads its panels from its own children.
 */
export const Resizable = Object.assign(ResizableRoot, {
  Panel: ResizablePanel,
  Handle: ResizableHandle,
}) as ResizableComponent;

export { ResizableHandle, ResizablePanel };
