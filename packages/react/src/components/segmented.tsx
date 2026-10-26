import { segmentedContract, segmentedEvents, segmentedParts, type SegmentedOption } from "@skryensya/core/segmented";
import { useLayoutEffect, useRef, useState, type HTMLAttributes, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

/*
 * ArrowRight/ArrowLeft map to "next"/"previous" by array order, which is backwards once the group
 * is laid out right-to-left: visually, ArrowRight should move toward the start, not the end. Found
 * reading the keydown handler directly - it never read `dir` at all, so every RTL layout was wrong,
 * not just unverified. `dir="auto"` resolves to the computed direction like Slider's own helper.
 */
function getDirection(dir: HTMLAttributes<HTMLDivElement>["dir"], root: HTMLElement | null): "ltr" | "rtl" {
  if (dir === "rtl" || dir === "ltr") return dir;
  return getComputedStyle(root ?? document.documentElement).direction === "rtl" ? "rtl" : "ltr";
}

/* Derived, never restated: the values and the default live in the contract. */
const { appearance: appearanceOption, iconPosition: iconPositionOption, size: sizeOption } = segmentedContract.options;

/** An option whose label may carry an icon beside the words (`<><Icon name="sun" />Light</>`). */
export type SegmentedControlOption = Omit<SegmentedOption, "label"> & { label: ReactNode };

export type SegmentedControlProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue" | "aria-label"
> & {
  options: readonly SegmentedControlOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** The group's own accessible name. WAI's Radio Group pattern expects one on `role="radiogroup"`. */
  label: string;
  /** How the control is drawn: `plain`, `tactile`, `brutalist` or `frosted`. */
  appearance?: (typeof appearanceOption.values)[number];
  /** The track's size on Button's scale: `sm` (the default, beside a small button), `md` or `lg`. */
  size?: (typeof sizeOption.values)[number];
  /** Where an option's icon sits: `inline` beside the word (the default) or `block` above it. */
  iconPosition?: (typeof iconPositionOption.values)[number];
};

export function SegmentedControl({
  appearance = appearanceOption.default,
  className,
  defaultValue,
  iconPosition = iconPositionOption.default,
  label,
  onValueChange,
  options,
  size = sizeOption.default,
  value,
  ...props
}: SegmentedControlProps) {
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(() => value ?? defaultValue ?? options.find((option) => !option.disabled)?.value ?? options[0]?.value);
  const selected = controlled ? value : internal;

  const rootRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const indicator = indicatorRef.current;
    if (!root || !indicator) return;

    const alignIndicator = () => {
      const option = root.querySelector<HTMLButtonElement>('[role="radio"][aria-checked="true"]');
      if (!option) return;

      indicator.style.transform = `translate3d(${option.offsetLeft}px, ${option.offsetTop}px, 0)`;
      indicator.style.inlineSize = `${option.offsetWidth}px`;
      indicator.style.blockSize = `${option.offsetHeight}px`;
      const first = !root.hasAttribute("data-sk-segmented-ready");
      root.setAttribute("data-sk-segmented-ready", "");
      /* Placed without motion; only later changes glide. */
      if (first) requestAnimationFrame(() => requestAnimationFrame(() => root.setAttribute("data-sk-segmented-motion", "")));
    };

    alignIndicator();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(alignIndicator);
    observer.observe(root);
    return () => observer.disconnect();
  }, [selected]);

  const select = (next: string) => {
    if (next === selected || options.find((option) => option.value === next)?.disabled) return;
    if (!controlled) setInternal(next);
    onValueChange?.(next);
    rootRef.current?.dispatchEvent(
      new CustomEvent(segmentedEvents.valueChange, { bubbles: true, detail: { value: next } }),
    );
  };

  const onOptionKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, current: string) => {
    const enabled = options.filter((option) => !option.disabled);
    const index = enabled.findIndex((option) => option.value === current);
    if (index === -1) return;

    const rtl = getDirection(props.dir, rootRef.current) === "rtl";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const backward = rtl ? "ArrowRight" : "ArrowLeft";

    const next = event.key === "Home"
      ? enabled[0]
      : event.key === "End"
        ? enabled.at(-1)
        : event.key === backward || event.key === "ArrowUp"
          ? enabled[(index - 1 + enabled.length) % enabled.length]
          : event.key === forward || event.key === "ArrowDown"
            ? enabled[(index + 1) % enabled.length]
            : undefined;

    if (!next) return;

    event.preventDefault();
    [...(rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [])]
      .find((option) => option.dataset.value === next.value)
      ?.focus();
    select(next.value);
  };

  return (
    <div
      {...props}
      aria-label={label}
      className={cx(segmentedParts.root, className)}
      data-appearance={appearance}
      data-icon-position={iconPosition}
      data-size={size}
      data-sk-segmented=""
      data-value={selected}
      ref={rootRef}
      role="radiogroup"
    >
      <span aria-hidden="true" className={segmentedParts.indicator} ref={indicatorRef} />
      {options.map((option) => (
        <button
          aria-checked={option.value === selected}
          className={`${segmentedParts.option} sk-interactive`}
          data-sk-segmented-option=""
          data-value={option.value}
          disabled={option.disabled}
          key={option.value}
          onClick={() => select(option.value)}
          onKeyDown={(event) => onOptionKeyDown(event, option.value)}
          role="radio"
          tabIndex={option.value === selected && !option.disabled ? 0 : -1}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
