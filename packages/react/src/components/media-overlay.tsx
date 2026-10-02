import { mediaOverlayParts, type MediaOverlayEdge, type MediaOverlayStrength, mediaOverlayContract } from "@skryensya/core/media-overlay";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

/* Derived, never restated: the default lives in the contract. */
const { strength: strengthOption, edge: edgeOption } = mediaOverlayContract.options;

type PolymorphicProps<Element extends ElementType, OwnProps> = OwnProps & {
  as?: Element;
} & Omit<ComponentPropsWithoutRef<Element>, keyof OwnProps | "as">;

function classes(base: string, className: string | undefined) {
  return className ? `${base} ${className}` : base;
}

export type MediaOverlayShadeProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  {
    className?: string;
    strength?: MediaOverlayStrength;
  }
>;

/**
 * Decorative wash. Author inside `MediaOverlay` so the box matches the type.
 * Always `aria-hidden`. Direction comes from the caption's `edge`.
 */
export function MediaOverlayShade<Element extends ElementType = "div">({
  as,
  className,
  strength = strengthOption.default,
  ...props
}: MediaOverlayShadeProps<Element>) {
  const Component = as ?? "div";
  return (
    <Component
      {...props}
      aria-hidden="true"
      className={classes(mediaOverlayParts.root, className)}
      data-strength={strength}
    />
  );
}

export type MediaOverlayProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  {
    children: ReactNode;
    className?: string;
    edge?: MediaOverlayEdge;
    /** When set, renders a `MediaOverlayShade` as the first child. */
    strength?: MediaOverlayStrength;
  }
>;

/**
 * Readable content on media. Sizes the wash: nest `MediaOverlayShade` (or pass `strength` to
 * inject one) so the gradient is only as tall/wide as this caption.
 */
export function MediaOverlay<Element extends ElementType = "div">({
  as,
  children,
  className,
  edge = edgeOption.default,
  strength,
  ...props
}: MediaOverlayProps<Element>) {
  const Component = as ?? "div";
  return (
    <Component
      {...props}
      className={classes(mediaOverlayParts.caption, className)}
      data-edge={edge}
    >
      {strength != null ? <MediaOverlayShade strength={strength} /> : null}
      {children}
    </Component>
  );
}
