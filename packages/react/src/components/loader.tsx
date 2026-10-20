import { loaderAttrs, loaderParts, loaderTicks, type LoaderSize, type LoaderSpeed, type LoaderVariant, loaderContract } from "@skryensya/core/loader";
import { useEffect, type HTMLAttributes } from "react";
import { dev, devTicket } from "../dev-warning.js";

/* Derived, never restated: the default lives in the contract. */
const { size: sizeOption, speed: speedOption, variant: variantOption } = loaderContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

/*
 * Same posture as Tag's `warnEmptyTag` and Kbd's `warnEmptyKbd`: LoaderStatus's own doc comment
 * already named this exact risk ("without a name it is an empty live region that announces an
 * empty string") but never checked for it at runtime. A computed status message ("" before the
 * first real update) hits it in practice, not just in theory.
 */
function warnEmptyLoaderStatus(label: string): void {
  if (!dev || label.trim().length !== 0) return;
  console.error(
    ...devTicket("<LoaderStatus>", {
      issue: "renders nothing: label is empty.",
      why: "It is an empty live region that announces an empty string instead of the wait it exists to describe.",
      fix: "Give it a label, or do not render it.",
    }),
  );
}

export type LoaderProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children" | "role" | "aria-label" | "aria-hidden"
> & {
  /** Accessible status name. Without a label, Loader is decorative beside another status label. */
  label?: string;
  size?: LoaderSize;
  /** Motion design. Orthogonal to size and speed. */
  variant?: LoaderVariant;
  /** Cycle length via motion-loading intents. Orthogonal to size and variant. */
  speed?: LoaderSpeed;
};

export function Loader({
  className,
  label,
  size = sizeOption.default,
  speed = speedOption.default,
  variant = variantOption.default,
  ...props
}: LoaderProps) {
  // An explicit empty label ("" from a computed status, not yet set) must fall back to the same
  // decorative path as no label at all - an explicit, empty aria-label on a role="status" region
  // is worse than nothing, not better.
  const decorative = !label?.trim();

  /*
   * The COUNT comes from core and the ANGLE comes from the stylesheet, which is why the staggered
   * variants render nothing but empty spans. The six pseudo-element variants return zero and render
   * no children at all, so their markup is unchanged. Both halves are shared with authored markup,
   * so a spokes has one stagger rather than one per binding.
   */
  return (
    <span
      {...props}
      aria-atomic={decorative ? undefined : "true"}
      aria-hidden={decorative ? true : undefined}
      aria-label={label}
      className={cx(loaderParts.root, className)}
      data-size={size}
      data-speed={speed}
      data-variant={variant}
      role={decorative ? undefined : "status"}
      {...{ [loaderAttrs.root]: "" }}
    >
      {Array.from({ length: loaderTicks(variant) }, (_, index) => (
        <span className={loaderParts.tick} key={index} />
      ))}
    </span>
  );
}

/**
 * The wait announced and not drawn: for a skeleton screen, where Placeholders already carry the
 * shape and a spinner would undo the reason for them.
 *
 * The label is required, not optional: this element renders nothing, so without a name it is an
 * empty live region that announces an empty string.
 */
export function LoaderStatus({ label }: { label: string }) {
  // Effect, not a direct render-body call: client-only, post-mount, straight into the browser's
  // own console - same reasoning as Kbd's own warnEmptyKbd.
  useEffect(() => warnEmptyLoaderStatus(label), [label]);
  return (
    <span aria-atomic="true" aria-label={label} className="sk-visually-hidden" role="status" />
  );
}
