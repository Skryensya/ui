import {
  RESIZABLE_COARSE_STEP,
  RESIZABLE_STEP,
  resizableAttrs,
  resizableCollapseTarget,
  resizableContract,
  resizableEvents,
  resizableHandleOrientation,
  resizableHandleRange,
  resizableIsCollapsed,
  resizableParts,
  resizablePercentFromPixels,
  resizableProperties,
  resolveInitialSizes,
  resolvePanelResize,
  resolveResizableCommand,
  type ResizableCommand,
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
  useImperativeHandle,
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
const {
  direction: directionOption,
  minSize: minSizeOption,
  maxSize: maxSizeOption,
  collapsible: collapsibleOption,
  collapsedSize: collapsedSizeOption,
} = resizableContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

type ResizableContextValue = {
  direction: ResizableDirectionOption;
  sizes: readonly number[];
  specs: readonly ResizablePanelSpec[];
  initial: readonly number[];
  panelIds: readonly string[];
  resize: (index: number, from: readonly number[], delta: number) => void;
  /** Runs a command (collapse, expand, toggle, reset) against the group's current sizes. */
  command: (command: ResizableCommand) => void;
  /** Notes what each open panel measures now, so a panel that closes can be opened back to it. */
  remember: (from: readonly number[]) => void;
  extent: () => number;
  rtl: () => boolean;
  setDragging: (dragging: boolean) => void;
};

const ResizableContext = createContext<ResizableContextValue | null>(null);

/**
 * What a page can ask of a group from anywhere: a button, a shortcut, a layout that decided to give the room
 * back. Panels are numbered from 0, in the order they are written.
 */
export type ResizableApi = {
  /** Closes a collapsible panel; its room goes to the neighbour across the nearest bar. */
  collapse: (panel: number) => void;
  /** Opens it back to the size it had, or to its initial size. */
  expand: (panel: number) => void;
  toggle: (panel: number) => void;
  /** Back to the sizes the group started with, which also opens anything that was closed. */
  reset: () => void;
  /** The current sizes, as percentages in panel order. */
  sizes: () => readonly number[];
};

export type ResizableProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The handle for collapsing, expanding and resetting from outside. */
  apiRef?: Ref<ResizableApi>;
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
  /**
   * Lets it close all the way. Dragged below `minSize` it snaps shut, its bar stays so it can be opened again, and
   * Home or End on a bar next to it close it. Without this the floor holds and it never disappears.
   */
  collapsible?: boolean;
  /** What it collapses to, as a percentage. 0 (the default) closes it; a small number leaves a rail. */
  collapsedSize?: number;
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
  { apiRef, children, className, direction = directionOption.default, onSizesChange, ...props },
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
        return {
          size: p.size,
          minSize: p.minSize ?? minSizeOption.default,
          maxSize: p.maxSize ?? maxSizeOption.default,
          collapsible: p.collapsible ?? collapsibleOption.default,
          collapsedSize: p.collapsedSize ?? collapsedSizeOption.default,
        };
      }),
    // The authored bounds, not the elements: a re-render with the same numbers must not reset a drag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(panelNodes.map((node) => (node as ReactElement<ResizablePanelProps>).props).map((p) => [p.size, p.minSize, p.maxSize, p.collapsible, p.collapsedSize]))],
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

  const restore = useRef<(number | undefined)[]>([]);
  const remember = useCallback(
    (from: readonly number[]) => {
      from.forEach((size, i) => {
        if (!resizableIsCollapsed(size, specs[i])) restore.current[i] = size;
      });
    },
    [specs],
  );

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

  const command = useCallback(
    (action: ResizableCommand) => {
      const previous = sizesRef.current;
      const next = resolveResizableCommand({ sizes: previous, panels: specs, initial, restore: restore.current, command: action });
      if (next === previous) return;
      remember(previous);
      sizesRef.current = next;
      setSizes(next);
      notify.current?.(next);
    },
    [specs, initial, remember],
  );
  const commandRef = useRef(command);
  commandRef.current = command;

  useImperativeHandle(
    apiRef,
    () => ({
      collapse: (panel) => commandRef.current({ action: "collapse", panel }),
      expand: (panel) => commandRef.current({ action: "expand", panel }),
      toggle: (panel) => commandRef.current({ action: "toggle", panel }),
      reset: () => commandRef.current({ action: "reset" }),
      sizes: () => sizesRef.current,
    }),
    [],
  );

  /* The same commands for anything with no reference to the component: an event on the group. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onCommand = (event: Event) => {
      const detail = (event as CustomEvent<ResizableCommand | undefined>).detail;
      if (detail) commandRef.current(detail);
    };
    root.addEventListener(resizableEvents.command, onCommand);
    return () => root.removeEventListener(resizableEvents.command, onCommand);
  }, []);

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
    () => ({ direction, sizes, specs, initial, panelIds, resize, command, remember, extent, rtl, setDragging }),
    [direction, sizes, specs, initial, panelIds, resize, command, remember, extent, rtl, setDragging],
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
  { children, className, collapsedSize: _collapsedSize, collapsible: _collapsible, maxSize: _max, minSize: _min, size: _size, style, ...props },
  ref,
) {
  const context = useContext(ResizableContext);
  const index = (props as InternalPanelProps).__index ?? 0;
  const { __index: _i, ...rest } = props as InternalPanelProps;
  const spec = context?.specs[index];
  const collapsed = resizableIsCollapsed(context?.sizes[index] ?? 1, spec);
  return (
    <div
      {...rest}
      ref={ref}
      id={rest.id ?? context?.panelIds[index]}
      className={cx(resizableParts.panel, className)}
      data-collapsed={collapsed ? "" : undefined}
      /* Closed to nothing, its content is no longer there to reach: out of the tab order and the reading order.
         A rail (a collapsed size above zero) keeps its content, which is the point of a rail. */
      inert={collapsed && (spec?.collapsedSize ?? 0) === 0 ? true : undefined}
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
  const { direction, sizes, specs, initial, panelIds, resize, command, remember, extent, rtl } = context;
  const barOrientation = resizableHandleOrientation(direction);
  const range = resizableHandleRange({ sizes, panels: specs, index });
  const sign = () => (direction === "horizontal" ? splitterDirectionSign(rtl() ? "rtl" : "ltr") : 1);
  const position = (event: ReactPointerEvent) => (direction === "horizontal" ? event.clientX : event.clientY);
  const resetDelta = () => (initial[index] ?? sizes[index] ?? 0) - (sizes[index] ?? 0);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    remember(sizes);
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
    /* Ctrl or Cmd + Enter closes or opens the collapsible panel beside the bar. Plain Enter stays the reset. */
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      const panel = resizableCollapseTarget({ sizes, panels: specs, index });
      if (panel !== undefined) {
        event.preventDefault();
        command({ action: "toggle", panel });
      }
      return;
    }
    remember(sizes);
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
      data-collapsed={resizableIsCollapsed(sizes[index] ?? 1, specs[index]) || resizableIsCollapsed(sizes[index + 1] ?? 1, specs[index + 1]) ? "" : undefined}
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
