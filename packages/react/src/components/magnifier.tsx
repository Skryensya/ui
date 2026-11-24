import {
  magnifierContract,
  magnifierDispersionStrength,
  magnifierFilterColor,
  magnifierParts,
  type MagnifierDispersion,
  type MagnifierFilter,
} from "@skryensya/core/magnifier";
import { createMagnifierView, type MagnifierView } from "@skryensya/core/magnifier-view";
import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

const { zoom: zoomOption, dispersion: dispersionOption, filter: filterOption } = magnifierContract.options;

export type MagnifierProps = HTMLAttributes<HTMLDivElement> & {
  /** The one picture the lens reads: an `img`, `video` or `canvas`. It keeps its own `alt` or label. */
  children: ReactNode;
  /** How many times larger the lens shows the picture, 1 to 8. */
  zoom?: number;
  /** How much the glass splits colour toward its edge: `subtle` (default) or `strong`. WebGPU glass only. */
  dispersion?: MagnifierDispersion;
  /** Coloured glass that lets only its own light through: `red`, `green`, `blue`, `cyan`, `magenta`, `yellow`, or `none`. */
  filter?: MagnifierFilter;
};

/**
 * A round glass lens that follows the pointer over a picture and shows it larger. Mouse and pen show it while hovering, a
 * finger while pressed. WebGPU draws the glass; without it, or over a cross-origin image without CORS, it is a plain zoomed
 * circle. The lens is `aria-hidden`: the picture under it keeps its own `alt`.
 */
export function Magnifier({ children, className, zoom = zoomOption.default, dispersion = dispersionOption.default, filter = filterOption.default, ...props }: MagnifierProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef<MagnifierView | null>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const dispersionRef = useRef(dispersion);
  dispersionRef.current = dispersion;
  const filterRef = useRef(filter);
  filterRef.current = filter;

  useEffect(() => {
    if (!rootRef.current || !lensRef.current) return;
    const view = createMagnifierView(rootRef.current, lensRef.current, {
      zoom: zoomRef.current,
      dispersion: magnifierDispersionStrength(dispersionRef.current),
      filter: magnifierFilterColor(filterRef.current),
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => viewRef.current?.setZoom(zoom), [zoom]);
  useEffect(() => viewRef.current?.setDispersion(magnifierDispersionStrength(dispersion)), [dispersion]);
  useEffect(() => viewRef.current?.setFilter(magnifierFilterColor(filter)), [filter]);

  return (
    <div
      {...props}
      ref={rootRef}
      className={className ? `${magnifierParts.root} ${className}` : magnifierParts.root}
      data-sk-magnifier=""
      data-zoom={zoom}
      data-dispersion={dispersion}
      data-filter={filter}
    >
      {children}
      <canvas ref={lensRef} className={magnifierParts.lens} aria-hidden="true" />
    </div>
  );
}
