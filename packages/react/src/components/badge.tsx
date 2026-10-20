import { badgeParts, type BadgeSize, type BadgeTone, badgeContract } from "@skryensya/core/badge";
import { type HTMLAttributes, type ReactNode } from "react";

/* Derived, never restated: the default lives in the contract. */
const { appearance: appearanceOption, size: sizeOption, tone: toneOption, pulse: pulseOption } = badgeContract.options;

/*
 * A badge reports; it never acts. Plain `HTMLAttributes<HTMLSpanElement>` still carries every mouse,
 * pointer, keyboard and drag handler (and `role`/`tabIndex`, the two props that turn a plain span
 * INTO a widget) because the DOM lets any element listen for a click - but the contract never
 * declares a `forward` list for Badge/BadgeDot (badge.ts), so none of that was ever part of the
 * promise. Omitting it here closes a gap the contract already implied: the same move Badge and Tag
 * just made at the content layer (Tag owns the feedback tones) now holds at the interaction layer
 * too (Tag owns being clicked, dismissed or navigated). `BadgeHolder` is NOT restricted this way: it
 * anchors a real Button or Avatar, which is supposed to stay interactive.
 */
type NonInteractiveSpanProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  | "onClick"
  | "onDoubleClick"
  | "onContextMenu"
  | "onMouseDown"
  | "onMouseUp"
  | "onPointerDown"
  | "onPointerUp"
  | "onKeyDown"
  | "onKeyUp"
  | "onKeyPress"
  | "onTouchStart"
  | "onTouchEnd"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onDrop"
  | "role"
  | "tabIndex"
>;

export type BadgeProps = Omit<NonInteractiveSpanProps, "children"> & {
  children: ReactNode;
  tone?: BadgeTone;
  size?: BadgeSize;
  /** How the mark is drawn: `plain`, or `brutalist`'s black edge and small hard offset. */
  appearance?: (typeof appearanceOption.values)[number];
};

export function Badge({
  appearance = appearanceOption.default,
  children,
  className,
  size = sizeOption.default,
  tone = toneOption.default,
  ...props
}: BadgeProps) {
  const classes = className ? `${badgeParts.root} ${className}` : badgeParts.root;
  const text = typeof children === "string" || typeof children === "number" ? String(children) : undefined;
  const singleDigit = text !== undefined && /^\p{Decimal_Number}$/u.test(text);

  return (
    <span
      title={text}
      {...props}
      className={classes}
      data-appearance={appearance}
      data-single-digit={singleDigit ? "" : undefined}
      data-size={size}
      data-tone={tone}
    >
      {children}
    </span>
  );
}

export type BadgeDotProps = Omit<NonInteractiveSpanProps, "aria-label"> & {
  tone?: BadgeTone;
  pulse?: boolean;
  /** What the dot means ("Unread", "Online"). Its only accessible content. */
  label: string;
};

export function BadgeDot({ className, label, pulse = pulseOption.default, tone = toneOption.default, ...props }: BadgeDotProps) {
  const classes = className ? `${badgeParts.root} ${className}` : badgeParts.root;
  return (
    <span
      {...props}
      aria-label={label}
      className={classes}
      data-dot=""
      data-pulse={pulse ? "" : undefined}
      data-tone={tone}
      role="status"
    />
  );
}

export type BadgeHolderProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function BadgeHolder({ children, className, ...props }: BadgeHolderProps) {
  const classes = className ? `${badgeParts.holder} ${className}` : badgeParts.holder;
  return (
    <span {...props} className={classes}>
      {children}
    </span>
  );
}
