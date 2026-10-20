import { meterFraction, meterParts, type MeterTone, meterContract } from "@skryensya/core/meter";
import { useEffect, type CSSProperties, type HTMLAttributes } from "react";
import { dev, devTicket } from "../dev-warning.js";

/* Derived, never restated: the default lives in the contract. */
const { max: maxOption, min: minOption, tone: toneOption } = meterContract.options;

/*
 * Found on the break harness (`/debug/meter-break`): `meterFraction` already clamps the PAINTED
 * bar to `[min, max]` (shared with Progress/Slider/Chart, fraction.ts), but `aria-valuenow` below
 * still announces whatever `value` the caller passed, verbatim - a value outside `[min, max]` is
 * invalid for the `meter` role regardless of what the bar paints, so the announced state and the
 * painted one can disagree with nothing saying so. An inverted or empty range (`min >= max`) is
 * the same kind of silent nonsense: `meterFraction` guards it to a safe 0, but the config itself
 * is still a caller mistake worth naming. Dev-only, console-only, value left exactly as given -
 * same posture as Pagination's own non-integer warning.
 */
function warnMeterRange(value: number, min: number, max: number): void {
  if (!dev) return;
  if (min >= max) {
    console.error(
      ...devTicket("<Meter>", { issue: `has an inverted or empty range: min (${min}) is not less than max (${max}).` }),
    );
    return;
  }
  if (value < min || value > max) {
    console.error(
      ...devTicket("<Meter>", {
        issue: `received a value (${value}) outside its own [${min}, ${max}] range.`,
        why: "The bar clamps to it; aria-valuenow does not.",
      }),
    );
  }
}

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type MeterProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  value: number;
  min?: number;
  max?: number;
  /** For when the raw number alone is not user-friendly: "50% (6 hours) remaining". */
  valueText?: string;
  tone?: MeterTone;
  /**
   * Accessible name for the bar, also painted in the header row. Required: `core/meter.ts` requires
   * it too, without one the `meter` role announces a bare number about nothing.
   */
  label: string;
};

export function Meter({
  className,
  label,
  max = maxOption.default,
  min = minOption.default,
  tone = toneOption.default,
  value,
  valueText,
  ...props
}: MeterProps) {
  // Effect, not a direct render-body call: client-only, post-mount, straight into the browser's
  // own console - same reasoning as Kbd's own warnEmptyKbd.
  useEffect(() => warnMeterRange(value, min, max), [value, min, max]);

  const fraction = meterFraction(value, min, max);
  const style = { ...props.style, "--sk-meter-fill": `${fraction * 100}%` } as CSSProperties;

  return (
    // Painted, not just announced (see meter.ts's own file banner): `label`/`valueText` also drive
    // this header row, so a reader tells a Meter from a Progress bar at a glance, not only via a
    // screen reader. The track below still carries its own `aria-label`/`aria-valuetext` independently
    // of what's painted here. Spoken and painted never have to agree on layout to both be correct.
    <div className={cx(meterParts.root, className)}>
      <div aria-hidden="true" className={meterParts.header}>
        <span className={meterParts.label}>{label}</span>
        {valueText && <span className={meterParts.value}>{valueText}</span>}
      </div>
      <div
        {...props}
        aria-label={label}
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={value}
        aria-valuetext={valueText}
        className={meterParts.track}
        data-sk-meter=""
        data-tone={tone}
        role="meter"
        style={style}
      >
        <div className={meterParts.bar} />
      </div>
    </div>
  );
}
