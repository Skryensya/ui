import { splitter } from "@skryensya/core/machines";
import { resolveColumnResize, resolveSplitterKey, splitterDirectionSign } from "@skryensya/core/splitter";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useRef, type KeyboardEvent, type RefObject } from "react";

/*
 * COLUMN RESIZER, the drag edge Table and Treegrid render between two head-row columns: ONE Zag
 * `splitter` machine per boundary, the same machine and the same split of duties as vanilla's
 * `ColumnResizer.svelte` (that file has the full reasoning behind each choice):
 *
 *   - Zag owns the POINTER drag and the focus/hover/drag state attributes.
 *   - The keyboard is hand-wired: Zag moves in fixed percentage points, the Window Splitter contract
 *     here moves in px (`resolveSplitterKey`) and Enter resets.
 *   - The ARIA value triple is computed against this PAIR's own total, which is all a resize ever
 *     redistributes (`resolveColumnResize`), not Zag's whole-row bounds.
 *   - `aria-controls` is dropped: Zag points it at panel elements that do not exist here (a column is
 *     a `<col>` and its cells, not one element), and a reference to a missing id is an ARIA error.
 */
export type ColumnResizerProps = {
  /** The table's id: Zag derives the trigger's id and `data-ownedby` from it. */
  rootId: string;
  index: number;
  widths: readonly number[];
  setWidths: (widths: readonly number[]) => void;
  min: number;
  headerRef: RefObject<HTMLTableCellElement | null>;
  label: string;
  className: string;
  /** The width Enter/double-click returns this column to. Omitted, or no answer: an even split of the pair. */
  resetWidth?: () => number | undefined;
};

const toPercent = (width: number, total: number) => (total > 0 ? (width / total) * 100 : 0);

export function ColumnResizer({ rootId, index, widths, setWidths, min, headerRef, label, className, resetWidth }: ColumnResizerProps) {
  const widthsRef = useRef(widths);
  widthsRef.current = widths;

  const direction = (): "ltr" | "rtl" =>
    headerRef.current && getComputedStyle(headerRef.current).direction === "rtl" ? "rtl" : "ltr";
  const total = widths.reduce((sum, width) => sum + width, 0);

  const service = useMachine(splitter.machine, {
    id: `${rootId}-${index}`,
    ids: {
      root: rootId,
      resizeTrigger: (id: string) => `${rootId}:resize:${id}`,
      panel: (id: string | number) => `${rootId}:panel:${id}`,
    },
    dir: direction(),
    orientation: "horizontal",
    // `minSize` as a percent of the CURRENT total, so its serialized value changes whenever the real
    // floor-to-total ratio does, which is what Zag's watcher re-normalizes on.
    panels: widths.map((_, panelIndex) => ({ id: `c${panelIndex}`, minSize: `${toPercent(min, total)}%` })),
    size: widths.map((width) => `${toPercent(width, total)}%`),
    onResize(details) {
      const current = widthsRef.current.reduce((sum, width) => sum + width, 0);
      setWidths(details.size.map((size) => (size / 100) * current));
    },
  });
  const api = splitter.connect(service, normalizeProps);

  // Zag's drag has no `dir` awareness: in RTL the pivot order flips so a rightward drag shrinks this column.
  const triggerId = (direction() === "rtl" ? `c${index + 1}:c${index}` : `c${index}:c${index + 1}`) as `${string}:${string}`;
  const { onKeyDown: _zagKeyDown, "aria-controls": _missingPanels, ...triggerProps } = api.getResizeTriggerProps({ id: triggerId });

  const before = widths[index] ?? 0;
  const after = widths[index + 1] ?? 0;
  const pairTotal = before + after;

  const resize = (delta: number) => setWidths(resolveColumnResize({ widths: widthsRef.current, index, delta, min }));
  const reset = () => {
    const target = resetWidth?.() ?? pairTotal / 2;
    resize(Math.min(Math.max(target, min), pairTotal - min) - before);
  };

  return (
    <div
      {...triggerProps}
      aria-label={label}
      aria-orientation="vertical"
      aria-valuemax={pairTotal > 0 ? Math.round(((pairTotal - min) / pairTotal) * 100) : 100}
      aria-valuemin={pairTotal > 0 ? Math.round((min / pairTotal) * 100) : 0}
      aria-valuenow={pairTotal > 0 ? Math.round((before / pairTotal) * 100) : 0}
      className={`${className} sk-splitter`}
      data-sk-column-resizer=""
      onDoubleClick={reset}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        const action = resolveSplitterKey(event);
        if (action.kind === "none") return;
        event.preventDefault();
        if (action.kind === "reset") {
          reset();
          return;
        }
        resize(action.kind === "home" ? -Infinity : action.kind === "end" ? Infinity : action.delta * splitterDirectionSign(direction()));
      }}
    />
  );
}
