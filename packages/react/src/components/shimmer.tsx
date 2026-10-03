import { shimmerContract, shimmerParts } from "@skryensya/core/shimmer";
import { type HTMLAttributes, type ReactNode } from "react";

const { active: activeOption, once: onceOption, reverse: reverseOption } = shimmerContract.options;

export type ShimmerProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  /** Temporary live text to highlight. */
  children: ReactNode;
  /** Turn the sweep off while keeping the same element and colour. */
  active?: boolean;
  /** Run the sweep once instead of looping. */
  once?: boolean;
  /** Sweep in the opposite direction. */
  reverse?: boolean;
  /** Override `--sk-shimmer-color`. */
  color?: string;
  /** Override `--sk-shimmer-duration`, e.g. `2s`. */
  duration?: string;
  /** Override `--sk-shimmer-spread`, e.g. `3em`. */
  spread?: string;
  /** Override `--sk-shimmer-angle`, e.g. `100deg`. */
  angle?: string;
};

/** A pure-CSS moving highlight for temporary status text. */
export function Shimmer({
  active = activeOption.default,
  angle,
  children,
  className,
  color,
  duration,
  once = onceOption.default,
  reverse = reverseOption.default,
  spread,
  style,
  ...props
}: ShimmerProps) {
  const classes = className ? `${shimmerParts.root} ${className}` : shimmerParts.root;
  const styles = {
    ...style,
    ...(color ? { "--sk-shimmer-color": color } : {}),
    ...(duration ? { "--sk-shimmer-duration": duration } : {}),
    ...(spread ? { "--sk-shimmer-spread": spread } : {}),
    ...(angle ? { "--sk-shimmer-angle": angle } : {}),
  } as ShimmerProps["style"];

  return (
    <span
      {...props}
      className={classes}
      data-once={once ? "" : undefined}
      data-reverse={reverse ? "" : undefined}
      data-shimmer={active ? undefined : "false"}
      style={styles}
    >
      {children}
    </span>
  );
}
