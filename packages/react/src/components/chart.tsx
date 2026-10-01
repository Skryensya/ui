import {
  chartAreaPath,
  chartAttrs,
  chartContract,
  chartLinePath,
  chartMax,
  chartParts,
  formatChartValue,
  type ChartPoint,
} from "@skryensya/core/chart";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";

/*
 * A BINDING, not a second declaration (decision 28). The kind/tone/height unions, their defaults and
 * the attributes they land on are read off `chartContract`; the five-element structure below is that
 * contract's part template.
 *
 * What this component does that the contract cannot: the ARITHMETIC. A bar's height is its value over
 * the series maximum, and the maximum belongs to the series rather than to any entry, so no per-entry
 * declaration can reach it (see the `value` option's own comment in `core/chart.ts`). This is
 * Meter's precedent: the contract declares the data, the bindings compute the paint, and
 * `chart.css` carries a fallback for the window before either has run.
 *
 * NO CHARTING LIBRARY IS IMPORTED HERE, and that is the point of the whole design. A bar chart is a
 * list plus a division. `line` and `area` need a real path, drawn here from core's own geometry into
 * the overlay the template reserves, exactly as the Vanilla enhancer draws it: the same tree paints
 * the same line in both bindings.
 */
const o = chartContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type ChartProps = Omit<HTMLAttributes<HTMLElement>, "children"> &
  SignatureOptionsOf<typeof chartContract, "Chart"> & {
    /** The series. The contract keys every collection `items`; a chart's entries are its points. */
    points: readonly ChartPoint[];
    /**
     * The accessible name. Required, as the contract requires it: a series of numbers with nothing
     * saying what it measures is the one chart that is worse than no chart.
     */
    label: string;
  };

export const Chart = forwardRef<HTMLElement, ChartProps>(function Chart(
  {
    className,
    currency,
    description,
    flush = o.flush.default,
    format = o.format.default,
    grid = o.grid.default,
    height = o.height.default,
    kind = o.kind.default,
    label,
    labels = o.labels.default,
    locale,
    points,
    tone = o.tone.default,
    values = o.values.default,
    ...props
  },
  ref,
) {
  const max = chartMax(points.map((point) => point.value));
  const line = kind === "bar" ? "" : chartLinePath(points);

  return (
    <figure
      {...props}
      aria-label={label}
      className={cx(chartParts.root, className)}
      data-currency={currency}
      data-description={description}
      data-flush={flush ? "" : undefined}
      data-format={format}
      data-grid={grid ? "" : undefined}
      data-height={height}
      data-kind={kind}
      // `"false"` rather than an absent attribute: the stylesheet has a rule for exactly that
      // string, and a vanished attribute would be a third state nobody meant (`labels`'s own
      // `falseValue` in the contract says the same).
      data-labels={labels ? undefined : "false"}
      data-locale={locale}
      data-rendered={line ? "" : undefined}
      data-tone={tone}
      data-values={values ? "" : undefined}
      ref={ref}
      style={{ ...props.style, [chartAttrs.max]: max } as CSSProperties}
      {...{ [chartAttrs.root]: "" }}
    >
      {/* First in the markup, hidden by default: what the numbers measure has to be announced
          before the numbers. `chart.css` explains when a composition shows it. */}
      <figcaption className={chartParts.caption}>{label}</figcaption>
      <div className={chartParts.plot}>
        {/* The path for `line` and `area`, empty for `bar`. `aria-hidden` always, because it is a
            second rendering of the list below. `preserveAspectRatio="none"` over a 0-100 box is what
            makes it responsive with no measurement (see the geometry's own banner in core). */}
        <div aria-hidden="true" className={chartParts.overlay}>
          {line && (
            <svg className={chartParts.overlaySvg} preserveAspectRatio="none" viewBox="0 0 100 100">
              {kind === "area" && <path className={chartParts.overlayArea} d={chartAreaPath(points)} />}
              <path className={chartParts.overlayLine} d={line} />
            </svg>
          )}
        </div>
        <ul className={chartParts.series} role="list">
          {points.map((point) => (
            <li
              className={chartParts.point}
              data-tone={point.tone}
              data-value={point.value}
              key={point.label}
              style={{ [chartAttrs.value]: point.value } as CSSProperties}
            >
              <span aria-hidden="true" className={chartParts.bar} />
              <span className={chartParts.label}>{point.label}</span>
              <span className={chartParts.value}>
                {point.text ?? formatChartValue(point.value, { currency, format, locale })}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
});
