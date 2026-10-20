import { tagEvents, tagParts, type TagTone, tagContract } from "@skryensya/core/tag";
import { useEffect, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type HTMLAttributes } from "react";
import { Button } from "./button.js";
import { a11yWarnRef, dev, devTicket } from "../dev-warning.js";
import { Icon } from "./icon.js";

/* Derived, never restated: the default lives in the contract. */
const { appearance: appearanceOption, tone: toneOption, removeLabel: removeLabelOption } = tagContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

/*
 * Same posture as Button's own `warnEmptyButton`, but a stricter message: Tag has no icon slot and
 * no `aria-label` escape hatch like BadgeDot's `label` - `children` is the WHOLE accessible name on
 * every shape. Found on the break harness (`/debug/tag-break`): the link and toggle shapes render a
 * fully blank, focusable, clickable control with nothing to announce at all, and nothing warned.
 */
function isEmptyTag(children: string): boolean {
  return children.trim().length === 0;
}

function warnEmptyTag(empty: boolean): void {
  if (!dev || !empty) return;
  console.error(
    ...devTicket("<Tag>", {
      issue: "renders nothing: children is empty.",
      why: "The chip still takes its full size and stays focusable and clickable on the link and toggle shapes - and unlike an icon-only Button, there is no `aria-label` to fall back on, the text IS the accessible name.",
      fix: "Give it a label, or do not render it.",
    }),
  );
}

type TagOwnProps = {
  /** How the chip is drawn: `plain`, or `brutalist`'s black edge and small hard offset. */
  appearance?: (typeof appearanceOption.values)[number];
  /** Plain chip text. Matches the contract slot (`accepts: "text"`). */
  children: string;
  tone?: TagTone;
};

type StaticTagProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> &
  TagOwnProps & {
    href?: undefined;
    selected?: undefined;
    /**
     * Called when the remove control is used. Structure is `removable`; this is behaviour only.
     * Also dispatches `sk:tagremove` on the host so the contract event and the React prop agree.
     */
    onRemove?: () => void;
    /** Whether the remove control exists. Defaults to false; must be set explicitly. */
    removable?: boolean;
    /** Accessible name for the remove control. Defaults to "Remove". */
    removeLabel?: string;
    /** `aria-disabled` on the chip; also disables the remove button for real, when there is one. */
    disabled?: boolean;
  };

type LinkTagProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> &
  TagOwnProps & {
    href: string;
    selected?: undefined;
    /** A link tag navigates. It cannot also carry a nested dismiss button. */
    onRemove?: never;
    removable?: never;
    removeLabel?: never;
    /** A link cannot be natively disabled either; same exclusion as Button.navigation. */
    disabled?: never;
  };

/*
 * `selected` has NO default (unlike `removable`), the same deliberate gap Button's own `pressed`
 * leaves (button.tsx): required here, not optional, because a `Tag` with no `selected` at all is a
 * DIFFERENT signature (`StaticTagProps`, a `<span>`) - there is no "toggle, currently unset" value
 * to default to.
 */
type ToggleTagProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> &
  TagOwnProps & {
    href?: undefined;
    selected: boolean;
    /** Called with the NEXT value when the chip is activated. The caller owns the state. */
    onSelectedChange?: (selected: boolean) => void;
    /** A toggle tag selects/deselects itself; it cannot also carry a nested dismiss button. */
    onRemove?: never;
    removable?: never;
    removeLabel?: never;
  };

export type TagProps = StaticTagProps | LinkTagProps | ToggleTagProps;

export function Tag({ appearance = appearanceOption.default, children, className, tone = toneOption.default, ...props }: TagProps) {
  const empty = isEmptyTag(children);
  // Effect, not a direct render-body call: client-only, post-mount, straight into the browser's
  // own console - same reasoning as Kbd's own warnEmptyKbd.
  useEffect(() => warnEmptyTag(empty), [empty]);

  if (props.href !== undefined) {
    return (
      <a
        title={children}
        {...props}
        className={cx(`${tagParts.root} sk-interactive`, className)}
        data-appearance={appearance}
        data-tone={tone}
        ref={a11yWarnRef(empty)}
      >
        <span className={tagParts.label}>{children}</span>
      </a>
    );
  }

  if (props.selected !== undefined) {
    const { selected, onSelectedChange, onClick, disabled = false, type = "button", ...buttonProps } = props;
    return (
      <button
        title={children}
        {...buttonProps}
        aria-disabled={disabled ? "true" : buttonProps["aria-disabled"]}
        aria-pressed={selected ? "true" : "false"}
        className={cx(`${tagParts.root} sk-interactive`, className)}
        data-appearance={appearance}
        data-tone={tone}
        disabled={disabled}
        onClick={(event) => {
          onClick?.(event);
          onSelectedChange?.(!selected);
        }}
        ref={a11yWarnRef(empty)}
        type={type}
      >
        <span className={tagParts.label}>{children}</span>
      </button>
    );
  }

  const { disabled = false, onRemove, removable = false, removeLabel = removeLabelOption.default, ...spanProps } = props;
  return (
    <span
      title={children}
      {...spanProps}
      aria-disabled={disabled ? "true" : undefined}
      className={cx(tagParts.root, className)}
      data-appearance={appearance}
      data-removable={removable ? "" : undefined}
      data-tone={tone}
      ref={a11yWarnRef(empty)}
    >
      <span className={tagParts.label}>{children}</span>
      {/* A real Button, not a chip-shaped lookalike: the state layer, the focus ring and the 44px hit
          target come with it. `close` is the system's icon for dismissing, never a literal "×". */}
      {removable ? (
        <Button
          aria-label={removeLabel}
          className={tagParts.remove}
          disabled={disabled}
          iconOnly
          onClick={(event) => {
            onRemove?.();
            event.currentTarget
              .closest(`.${tagParts.root}`)
              ?.dispatchEvent(new CustomEvent(tagEvents.remove, { bubbles: true }));
          }}
          size="sm"
          variant="ghost"
        >
          <Icon name="close" />
        </Button>
      ) : null}
    </span>
  );
}
