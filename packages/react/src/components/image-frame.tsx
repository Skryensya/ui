import { imageFrameContract, imageFrameParts } from "@skryensya/core/image-frame";
import type { OptionsOf } from "@skryensya/core/contract";
import type { ComponentPropsWithoutRef, ElementType, ReactEventHandler, ReactNode } from "react";

type PolymorphicProps<Element extends ElementType, OwnProps> = OwnProps & {
  as?: Element;
} & Omit<ComponentPropsWithoutRef<Element>, keyof OwnProps | "as">;

const o = imageFrameContract.options;

function classes(base: string, className: string | undefined) {
  return className ? `${base} ${className}` : base;
}

export type ImageFrameProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  {
    /** Type over the media: a MediaOverlay (and its wash). Not a second media source. */
    caption?: ReactNode;
    children?: ReactNode;
    className?: string;
    /**
     * Fires on the `<img>` itself when `src` fails to load. Fallback is the caller's job (ImageFrame
     * is a frame, not a fetch), but a native `error` event does not bubble, so a plain `onError`
     * landed on the wrapper this component renders (`...props` spreads there) and silently never
     * ran - this routes it to the one element that can actually dispatch it.
     */
    onError?: ReactEventHandler<HTMLImageElement>;
  } & Omit<OptionsOf<typeof imageFrameContract>, "frameElement">
>;

/**
 * Clipped media frame: aspect ratio, object-fit and object-position as data attributes.
 * The caller owns semantics (`figure`, `div`, a link wrapping the frame).
 */
export function ImageFrame<Element extends ElementType = "div">({
  as,
  aspect = o.aspect.default,
  fit = o.fit.default,
  position = o.position.default,
  radius = o.radius.default,
  border = o.border.default,
  appearance = o.appearance.default,
  caption,
  className,
  src,
  alt = "",
  children,
  onError,
  ...props
}: ImageFrameProps<Element>) {
  const Component = as ?? "div";
  return (
    <Component
      {...props}
      className={classes(imageFrameParts.root, className)}
      {...{
        [o.aspect.attr]: aspect,
        [o.fit.attr]: fit,
        [o.position.attr]: position,
        [o.radius.attr]: radius,
        [o.border.attr]: border,
        [o.appearance.attr]: appearance,
      }}
    >
      {src != null ? <img className={imageFrameParts.media} src={src} alt={alt} onError={onError} /> : children}
      {caption}
    </Component>
  );
}
