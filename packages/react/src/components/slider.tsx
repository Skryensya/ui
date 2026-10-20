import { slider } from "@skryensya/core/machines";
import { clampSliderRange, sliderEvents, sliderParts, sliderContract } from "@skryensya/core/slider";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from "react";
import { dev, devTicket } from "../dev-warning.js";

/* Derived, never restated: the default lives in the contract. */
const { max: maxOption, min: minOption } = sliderContract.options;

/*
 * The contract's own a11y rule (`sliderContract.a11y`) requires `aria-label` or `aria-labelledby`
 * on `Slider`; nothing checked it at runtime, found the same way Switch's own gap was.
 * `SliderRange` has no equivalent gap: `lowLabel`/`highLabel` are required PROPS at the type level
 * (`SliderRangeProps` below), not optional strings, so there is nothing to check at runtime there.
 */
function warnMissingSliderName(ariaLabel: unknown, ariaLabelledBy: unknown): void {
  if (!dev || ariaLabel || ariaLabelledBy) return;
  console.error(
    ...devTicket("<Slider>", {
      issue: "no accessible name.",
      fix: "Give it `aria-label` or `aria-labelledby` - without one it announces as a bare number.",
    }),
  );
}

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

function getDirection(dir: HTMLAttributes<HTMLDivElement>["dir"], root: HTMLElement | null): "ltr" | "rtl" {
  if (dir === "rtl" || dir === "ltr") return dir;
  const target = dir ? root : root?.parentElement ?? root;
  return getComputedStyle(target ?? document.documentElement).direction === "rtl" ? "rtl" : "ltr";
}

const toNumber = (value: unknown, fallback: number) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const thumbSize = { width: 32, height: 32 };

export type SliderProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
  defaultValue?: number;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  name?: string;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
};

export function Slider({
  className,
  defaultValue,
  disabled,
  id,
  max = maxOption.default,
  min = minOption.default,
  name,
  onValueChange,
  step,
  style,
  value,
  dir,
  ...props
}: SliderProps) {
  // Effect, not a direct render-body call: client-only, post-mount, straight into the browser's
  // own console - same reasoning as Kbd's own warnEmptyKbd.
  useEffect(() => {
    warnMissingSliderName(props["aria-label"], props["aria-labelledby"]);
  }, [props["aria-label"], props["aria-labelledby"]]);

  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<"ltr" | "rtl">(dir === "rtl" ? "rtl" : "ltr");
  useLayoutEffect(() => setDirection(getDirection(dir, rootRef.current)), [dir]);
  const lo = toNumber(min, 0);
  const hi = toNumber(max, 100);
  const controlled = value !== undefined;
  const service = useMachine(slider.machine, {
    id: id ?? generatedId,
    "aria-label": props["aria-label"] ? [String(props["aria-label"])] : undefined,
    "aria-labelledby": props["aria-labelledby"] ? [String(props["aria-labelledby"])] : undefined,
    defaultValue: [toNumber(defaultValue, lo)],
    dir: direction,
    disabled,
    max: hi,
    min: lo,
    name,
    onValueChange(details) {
      const next = details.value[0] ?? lo;
      onValueChange?.(next);
      rootRef.current?.dispatchEvent(
        new CustomEvent(sliderEvents.valueChange, { bubbles: true, detail: { value: next } }),
      );
    },
    step,
    thumbAlignment: "center",
    thumbSize,
    value: controlled ? [toNumber(value, lo)] : undefined,
  });
  const api = slider.connect(service, normalizeProps);
  const rootProps = api.getRootProps();
  const controlProps = api.getControlProps();
  const trackProps = api.getTrackProps();
  const rangeProps = api.getRangeProps();
  const thumbProps = api.getThumbProps({ index: 0 });

  return (
    <div
      {...props}
      {...rootProps}
      dir={dir}
      className={cx(sliderParts.root, className)}
      data-sk-slider=""
      data-sk-slider-ready="true"
      ref={rootRef}
      style={{ ...(rootProps.style as CSSProperties), ...style }}
    >
      <div {...controlProps} dir={dir} className={sliderParts.control} data-sk-slider-control="">
        <div {...trackProps} dir={dir} className={sliderParts.track} data-sk-slider-track="">
          <div {...rangeProps} dir={dir} className={sliderParts.range} data-sk-slider-range-part="" />
        </div>
        <div {...thumbProps} dir={dir} className={sliderParts.thumb} data-sk-slider-thumb="" draggable={undefined}>
          <input {...api.getHiddenInputProps({ index: 0, name })} dir={dir} className={sliderParts.input} data-sk-slider-input="" />
        </div>
      </div>
    </div>
  );
}

export type SliderRangeProps = {
  className?: string;
  id?: string;
  lowLabel: string;
  highLabel: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  defaultLowValue?: number;
  defaultHighValue?: number;
  lowName?: string;
  highName?: string;
  dir?: HTMLAttributes<HTMLDivElement>["dir"];
  onValueChange?: (value: { low: number; high: number }) => void;
};

export function SliderRange({
  className,
  defaultHighValue,
  defaultLowValue,
  disabled,
  highLabel,
  highName,
  id,
  lowLabel,
  lowName,
  max = maxOption.default,
  min = minOption.default,
  dir,
  onValueChange,
  step,
}: SliderRangeProps) {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<"ltr" | "rtl">(dir === "rtl" ? "rtl" : "ltr");
  useLayoutEffect(() => setDirection(getDirection(dir, rootRef.current)), [dir]);
  const { low, high } = clampSliderRange(defaultLowValue ?? min, defaultHighValue ?? max);
  const service = useMachine(slider.machine, {
    id: id ?? generatedId,
    "aria-label": [lowLabel, highLabel],
    defaultValue: [low, high],
    dir: direction,
    disabled,
    max,
    min,
    onValueChange(details) {
      const next = { low: details.value[0] ?? min, high: details.value[1] ?? max };
      onValueChange?.(next);
      rootRef.current?.dispatchEvent(
        new CustomEvent(sliderEvents.valueChange, { bubbles: true, detail: next }),
      );
    },
    step,
    thumbAlignment: "center",
    thumbSize,
  });
  const api = slider.connect(service, normalizeProps);
  const rootProps = api.getRootProps();
  const controlProps = api.getControlProps();
  const trackProps = api.getTrackProps();
  const rangeProps = api.getRangeProps();
  const lowThumbProps = api.getThumbProps({ index: 0, name: lowName });
  const highThumbProps = api.getThumbProps({ index: 1, name: highName });

  return (
    <div
      {...rootProps}
      dir={dir}
      className={cx(sliderParts.rangeRoot, className)}
      data-sk-slider-range=""
      data-sk-slider-range-ready="true"
      ref={rootRef}
      style={rootProps.style as CSSProperties}
    >
      <div {...controlProps} dir={dir} className={sliderParts.rangeControl} data-sk-slider-range-control="">
        <div {...trackProps} dir={dir} className={sliderParts.rangeTrack} data-sk-slider-range-track="">
          <div {...rangeProps} dir={dir} className={sliderParts.rangeFill} data-sk-slider-range-fill="" />
        </div>
        <div {...lowThumbProps} dir={dir} className={sliderParts.rangeLow} data-sk-slider-range-low="" draggable={undefined}>
          <input
            {...api.getHiddenInputProps({ index: 0, name: lowName })}
            dir={dir}
            className={sliderParts.rangeLowInput}
            data-sk-slider-range-low-input=""
          />
        </div>
        <div {...highThumbProps} dir={dir} className={sliderParts.rangeHigh} data-sk-slider-range-high="" draggable={undefined}>
          <input
            {...api.getHiddenInputProps({ index: 1, name: highName })}
            dir={dir}
            className={sliderParts.rangeHighInput}
            data-sk-slider-range-high-input=""
          />
        </div>
      </div>
    </div>
  );
}
