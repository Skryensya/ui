import { avatarInitials, avatarParts, type AvatarAppearance, type AvatarSize, avatarContract } from "@skryensya/core/avatar";
import { imageFrameParts } from "@skryensya/core/image-frame";
import { Children, type HTMLAttributes, type ImgHTMLAttributes, type ReactNode, useEffect, useState } from "react";
import { ImageFrame } from "./image-frame.js";

/* Derived, never restated: the default lives in the contract. */
const { appearance: appearanceOption, size: sizeOption } = avatarContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type AvatarImageSource = Pick<
  ImgHTMLAttributes<HTMLImageElement>,
  "crossOrigin" | "decoding" | "fetchPriority" | "height" | "loading" | "referrerPolicy" | "sizes" | "src" | "srcSet" | "width"
>;

export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "children" | "onError"> & {
  /**
   * Image URL, or the image descriptor emitted by an optimizer (`src`, `srcSet`, `sizes`, etc.).
   * When absent — or when the image fails in the browser — the fallback (initials) shows.
   */
  src?: string | AvatarImageSource;
  /** Accessible name (initials) or alt text (image). Required either way. */
  name: string;
  size?: AvatarSize;
  /** How the disc is drawn: `plain`, or `brutalist`'s black edge and hard offset. */
  appearance?: AvatarAppearance;
  /** Fallback content, usually initials. Defaults to the first two letters of `name`. */
  children?: ReactNode;
} & Pick<
  ImgHTMLAttributes<HTMLImageElement>,
  "crossOrigin" | "decoding" | "fetchPriority" | "height" | "loading" | "onError" | "referrerPolicy" | "sizes" | "srcSet" | "width"
>;

export function Avatar({
  appearance = appearanceOption.default,
  children,
  className,
  crossOrigin,
  decoding,
  fetchPriority,
  height,
  loading,
  name,
  onError,
  referrerPolicy,
  size = sizeOption.default,
  sizes,
  src,
  srcSet,
  width,
  ...props
}: AvatarProps) {
  const fallback = children ?? avatarInitials(name);
  const source = typeof src === "string" ? { src } : src;
  const imageProps = {
    ...source,
    crossOrigin: crossOrigin ?? source?.crossOrigin,
    decoding: decoding ?? source?.decoding ?? "async",
    fetchPriority: fetchPriority ?? source?.fetchPriority,
    height: height ?? source?.height,
    loading: loading ?? source?.loading ?? "lazy",
    referrerPolicy: referrerPolicy ?? source?.referrerPolicy,
    sizes: sizes ?? source?.sizes,
    srcSet: srcSet ?? source?.srcSet,
    width: width ?? source?.width,
  };
  const imageKey = [imageProps.src, imageProps.srcSet, imageProps.sizes].filter(Boolean).join("\n");
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageKey]);

  // With an image, ImageFrame clips the media and <img alt> carries the semantics. Without one,
  // the wrapper becomes the img role and the initials go decorative, so there is exactly one node.
  return imageProps.src && !imageFailed ? (
    <span {...props} className={cx(avatarParts.root, className)} data-appearance={appearance} data-size={size}>
      <ImageFrame as="span" aspect="1/1" fit="cover" radius="pill">
        <img
          {...imageProps}
          alt={name}
          className={imageFrameParts.media}
          onError={(event) => {
            setImageFailed(true);
            onError?.(event);
          }}
        />
      </ImageFrame>
    </span>
  ) : (
    <span
      {...props}
      aria-label={name}
      className={cx(avatarParts.root, className)}
      data-appearance={appearance}
      data-size={size}
      role="img"
    >
      <span aria-hidden="true" className={avatarParts.fallback}>
        {fallback}
      </span>
    </span>
  );
}

export type AvatarGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  /** Cap the visible avatars; the rest collapse into a "+N" counter. */
  max?: number;
  /** Explicit overflow label for a composition that already supplies its visible avatars. */
  overflow?: ReactNode;
  /** The group's own accessible name. Optional: each avatar already announces its own name. */
  label?: string;
};

export function AvatarGroup({
  children,
  className,
  label,
  max,
  overflow: overflowLabel,
  ...props
}: AvatarGroupProps) {
  const items = Children.toArray(children);
  const visible = max && items.length > max ? items.slice(0, max) : items;
  const overflowCount = items.length - visible.length;
  const overflow = overflowCount > 0 ? `+${overflowCount}` : overflowLabel;

  return (
    <div {...props} aria-label={label} className={cx(avatarParts.group, className)} role="group">
      {visible}
      {overflow != null ? <span className={avatarParts.groupOverflow}>{overflow}</span> : null}
    </div>
  );
}
