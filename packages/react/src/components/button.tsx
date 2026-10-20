import { buttonContract, buttonParts } from "@skryensya/core/button";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import {
  cloneElement,
  isValidElement,
  useEffect,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { a11yWarnRef, dev, devTicket } from "../dev-warning.js";

/*
 * A BINDING, not a second declaration (decision 28). Everything below that could be restated here -
 * the variant and size unions, their defaults, the attributes they land on, the classes, and the
 * accessible-name rule. Is read from `buttonContract`. Adding a variant is one edit, in Core.
 */
const {
  variant: variantOption,
  tone: toneOption,
  appearance: appearanceOption,
  pressed: pressedOption,
  size: sizeOption,
  iconOnly: iconOnlyOption,
  weldStart: weldStartOption,
  weldEnd: weldEndOption,
  loading: loadingOption,
} = buttonContract.options;
const actionTemplate = buttonContract.signatures["Button.action"].template;
const iconOnlyRule = buttonContract.a11y[0];

/** Shared appearance: the navigation signature's options (no pressed / disabled). */
type ButtonNavAppearance = SignatureOptionsOf<typeof buttonContract, "Button.navigation"> & {
  children: ReactNode;
  /** Leading slot: icon (or other affordance) before the label. */
  pre?: ReactNode;
  /** Trailing slot: icon (or other affordance) after the label. */
  post?: ReactNode;
};

/** Action signature adds toggle and unavailable state. */
type ButtonActionAppearance = SignatureOptionsOf<typeof buttonContract, "Button.action"> & {
  children: ReactNode;
  pre?: ReactNode;
  post?: ReactNode;
};

/*
 * `href` is the discriminant and the tag switch: every appearance works identically on either host,
 * only the semantics differ (`Button.action` vs `Button.navigation`), so one component picks the tag
 * instead of asking the caller to duplicate the same props on a second export. Passing `href` drops
 * `disabled` (a link cannot be disabled and stay a link) and `pressed` / `type`; omitting it keeps
 * the native button contract.
 */
export type ButtonProps =
  | (Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> &
      ButtonActionAppearance & { href?: undefined })
  | (Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> &
      ButtonNavAppearance & { href: string });

/**
 * Renders Button's own chrome (variant/tone/appearance/size/weld classes and data attrs) onto a
 * single child element instead of a `<button>`/`<a>` of Button's own, chaining the child's own
 * `onClick` before Button's: for a router's own `Link`, which owns navigation Button's `href`
 * cannot reach into. The same `asChild` shape `DialogStackTrigger` already uses, and the same
 * narrowed scope: `pre`/`post`/`loading` are Button's own anatomy, composed around Button's OWN
 * host, so they are not available here - the single child already carries everything it renders,
 * which is the one thing `asChild` exists to NOT reach into.
 */
export type ButtonAsChildProps = {
  asChild: true;
  children: ReactElement<Record<string, unknown>>;
  variant?: ButtonProps["variant"];
  tone?: ButtonProps["tone"];
  appearance?: ButtonProps["appearance"];
  size?: ButtonProps["size"];
  iconOnly?: boolean;
  weldStart?: boolean;
  weldEnd?: boolean;
  className?: string;
  /** Chained AFTER the child's own `onClick` (a router's navigation), and only when that one did
   * not call `preventDefault()`. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (event: any) => void;
};

const baseClasses = [buttonParts[actionTemplate.part], ...actionTemplate.also].join(" ");

function buttonClasses(className?: string): string {
  return className ? `${baseClasses} ${className}` : baseClasses;
}

/*
 * Real text anywhere inside names the button as surely as `aria-label` does, and a visually-hidden
 * label is the one way to name an icon-only control whose MEANING changes (Marquee's Play/Pause
 * swaps which of two labels is `hidden`, so a single static `aria-label` would announce the wrong
 * action half the time). The vanilla enhancer has always accepted it, via its own `textContent`
 * check; this walk is what keeps the two bindings enforcing the same rule instead of React alone
 * rejecting markup the enhancer is happy with. Dev-only, and only on the path that is about to warn.
 */
function hasTextContent(node: ReactNode): boolean {
  if (typeof node === "string") return node.trim().length > 0;
  if (typeof node === "number") return true;
  if (Array.isArray(node)) return node.some(hasTextContent);
  if (isValidElement<{ children?: ReactNode }>(node)) return hasTextContent(node.props.children);
  return false;
}

/*
 * PROVABLY nothing, which is a different question from `hasTextContent`'s.
 *
 * `children` is required by the contract, and `""` satisfies that requirement and TypeScript both
 * while rendering a 34x44 control with no label, no icon and, on `ghost`, no paint whatsoever:
 * invisible, focusable, clickable. It turned up on the break harness, where the `ghost` twin of the
 * empty button simply was not on the page.
 *
 * The walk above asks "is there text anywhere in here", cannot see through a component boundary, and
 * gets away with it because an icon-only button rendering a text component is a contradiction.
 * Asking the same question of EVERY button would warn on `<Button><Label /></Button>`, which is
 * fine markup. So this asks the narrower one that has no false positives: did the caller hand this
 * button anything at all? An element counts as content whatever it turns out to render.
 */
function rendersNothing(node: ReactNode): boolean {
  if (node === null || node === undefined || typeof node === "boolean") return true;
  if (typeof node === "string") return node.trim().length === 0;
  if (Array.isArray(node)) return node.every(rendersNothing);
  return false;
}

/*
 * A button with no content at all, named or not. `aria-label` does NOT excuse it: a name makes the
 * control announceable, and this one still paints nothing for everybody else, so it is a hole in the
 * page that happens to be reachable by keyboard. A separate failure from the accessible-name one
 * below, with a separate fix (put something in it, rather than name what's already there), but the
 * same VISUAL signal: before this shared `[data-sk-a11y-warn]`, the console error was the only cue,
 * so an empty button sat pixel-identical to a correct one right beside it on the break harness.
 */
function isEmptyButton(pre: ReactNode, children: ReactNode, post: ReactNode): boolean {
  return rendersNothing(pre) && rendersNothing(children) && rendersNothing(post);
}

function warnEmptyButton(empty: boolean): void {
  if (!dev || !empty) return;
  console.error(
    ...devTicket("<Button>", {
      issue: "renders nothing: children is empty and neither `pre` nor `post` was given.",
      why: 'The control still takes its full size and stays focusable and clickable, and on `variant="ghost"` it paints nothing at all.',
      fix: "Give it a label, an icon, or do not render it.",
    }),
  );
}

/*
 * Returns whether the name is missing, rather than warning directly, so the one answer can both
 * drive the console error below AND mark the node for `[data-sk-a11y-warn]` (button.css) - found on
 * the break harness (`/debug/button-break`): the console error was the ONLY signal, so a page full
 * of iconOnly buttons gave no visual way to tell the broken one from every correctly-labelled
 * sibling next to it. The attribute is applied through `a11yWarnRef` (`../dev-warning.js`), a ref
 * callback rather than a rendered prop, so it is dev-only without ever entering the hydration diff;
 * see that function's own doc for why a plain `dev &&` prop broke SSR for this exact attribute.
 */
function missingAccessibleName(
  iconOnly: boolean | undefined,
  present: readonly (string | undefined)[],
  /*
   * EVERYTHING THE BUTTON RENDERS, not only `children`: the `pre` and `post` slots are inside the
   * control, so text in one of them names it exactly as text in `children` does. The vanilla
   * enhancer already agreed, because it reads `root.textContent` and that is the whole element,
   * spans included. Walking `children` alone meant React rejected markup the enhancer accepts, which
   * is the divergence the note above `hasTextContent` says this walk exists to prevent.
   */
  rendered: ReactNode,
): boolean {
  return Boolean(iconOnly) && !present.some(Boolean) && !hasTextContent(rendered);
}

function warnMissingAccessibleName(missing: boolean): void {
  if (!dev || !missing) return;
  console.error(
    ...devTicket("<Button iconOnly>", {
      issue: "has no accessible name.",
      why: iconOnlyRule.because,
      fix: `Give it one of: ${iconOnlyRule.requiresOneOf.join(", ")}.`,
    }),
  );
}

/*
 * OVERLOADS, not one signature over the union: a single union parameter lost the per-field
 * contextual typing every existing `onClick={(event) => …}` call site relied on (TypeScript
 * stopped inferring `event`'s type, surfacing as an implicit-any error at callers that never
 * mentioned `asChild` at all). Two signatures keep each shape's own inference intact; the
 * implementation below still takes the union, which is what the runtime branch already expects.
 */
export function Button(props: ButtonAsChildProps): ReturnType<typeof cloneElement>;
export function Button(props: ButtonProps & { pressed?: boolean; loading?: boolean }): ReactElement;
export function Button(allProps: (ButtonProps & { pressed?: boolean; loading?: boolean }) | ButtonAsChildProps) {
  if ("asChild" in allProps && allProps.asChild) {
    const {
      asChild: _asChild,
      children: child,
      className,
      iconOnly,
      weldStart,
      weldEnd,
      variant = variantOption.default,
      tone = toneOption.default,
      appearance = appearanceOption.default,
      size = sizeOption.default,
      onClick,
      ...rest
    } = allProps;
    if (!isValidElement(child)) throw new Error("<Button asChild> requires one element child");
    const target = child as ReactElement<Record<string, unknown> & { onClick?: (event: unknown) => void }>;
    return cloneElement(target, {
      ...rest,
      className: buttonClasses([target.props.className as string | undefined, className].filter(Boolean).join(" ") || undefined),
      "data-sk-button": "",
      [iconOnlyOption.attr]: iconOnly ? iconOnlyOption.trueValue : undefined,
      [weldStartOption.attr]: weldStart ? weldStartOption.trueValue : undefined,
      [weldEndOption.attr]: weldEnd ? weldEndOption.trueValue : undefined,
      [sizeOption.attr]: size,
      [variantOption.attr]: variant,
      [toneOption.attr]: tone,
      [appearanceOption.attr]: appearance,
      onClick(event: unknown) {
        target.props.onClick?.(event);
        const nativeEvent = event as { defaultPrevented?: boolean };
        if (!nativeEvent?.defaultPrevented) onClick?.(event);
      },
    });
  }

  const {
    children,
    className,
    iconOnly,
    weldStart,
    weldEnd,
    variant = variantOption.default,
    tone = toneOption.default,
    appearance = appearanceOption.default,
    pressed,
    loading,
    loadingText,
    size = sizeOption.default,
    pre,
    post,
    ...props
  } = allProps as ButtonProps & { pressed?: boolean; loading?: boolean; loadingText?: string };
  const emptyButton = isEmptyButton(pre, children, post);
  const noAccessibleName = missingAccessibleName(iconOnly, [props["aria-label"], props["aria-labelledby"]], [pre, children, post]);
  // Effect, not a direct render-body call: client-only, post-mount, straight into the browser's
  // own console - same reasoning as Kbd's own warnEmptyKbd.
  useEffect(() => {
    warnEmptyButton(emptyButton);
    warnMissingAccessibleName(noAccessibleName);
  }, [emptyButton, noAccessibleName]);

  const shared = {
    className: buttonClasses(className),
    "data-sk-button": "",
    [iconOnlyOption.attr]: iconOnly ? iconOnlyOption.trueValue : undefined,
    [weldStartOption.attr]: weldStart ? weldStartOption.trueValue : undefined,
    [weldEndOption.attr]: weldEnd ? weldEndOption.trueValue : undefined,
    [sizeOption.attr]: size,
    [variantOption.attr]: variant,
    [toneOption.attr]: tone,
    [appearanceOption.attr]: appearance,
  } as const;

  /*
   * Three states, and the key is OMITTED rather than set to `undefined` for the third. `shared` is
   * spread after the caller's own props, so a key present with an `undefined` value still wins and
   * erases whatever they passed: a component handing Button a raw `aria-pressed` (marquee's toggle
   * did) silently lost it. Absent means "not a toggle" and has to mean absent from this object too.
   */
  const toggle =
    pressed === undefined || props.href !== undefined
      ? {}
      : { [pressedOption.attr]: pressed ? pressedOption.trueValue : pressedOption.falseValue };

  const body = (
    <>
      {pre != null ? <span className={buttonParts.pre}>{pre}</span> : null}
      {/* Wrapped, unlike `pre`/`post`'s own content: plain text has no element of its own for
          `[data-loading]` to hide, which is what let the old label sit fully visible under the
          overlay spinner this replaced (see button.css). */}
      <span className={buttonParts.label}>{children}</span>
      {post != null ? <span className={buttonParts.post}>{post}</span> : null}
      {/* Always in the DOM, like `pre`/`post`'s own `[data-loading]`-gated sibling: see button.css.
          No `data-size`: button.css sizes it off the host's own, the same tiers `.sk-icon` uses. */}
      <span aria-hidden="true" className={`${buttonParts.loader} sk-loader`} />
      {/* Only rendered when `loadingText` is given; the plain label above keeps showing otherwise. */}
      {loadingText != null ? <span className={buttonParts.loadingLabel}>{loadingText}</span> : null}
    </>
  );

  if (props.href !== undefined) {
    /* `disabled`/`loading` can still arrive from a loose JS call site; strip them so the anchor
       stays a link - `Button.navigation` declares neither. */
    const { href, disabled: _disabled, loading: _loading, ...anchorProps } = props as Extract<ButtonProps, { href: string }> & {
      disabled?: boolean;
      loading?: boolean;
    };
    return (
      <a {...anchorProps} {...shared} href={href} ref={a11yWarnRef(noAccessibleName || emptyButton)}>
        {body}
      </a>
    );
  }

  /* Narrowed by hand: a consumer's looser tsconfig (the playground's) does not discriminate the union
     on `href` through the early return above. */
  const { disabled, type = "button", ...buttonProps } = props as Extract<ButtonProps, { href?: undefined }>;
  /* `loading` implies `disabled`: a second click cannot start a second export while the first is
     still running. */
  const busy = disabled || loading;
  return (
    <button
      {...buttonProps}
      {...shared}
      {...toggle}
      {...{ [loadingOption.attr]: loading ? loadingOption.trueValue : undefined }}
      aria-busy={loading ? "true" : buttonProps["aria-busy"]}
      aria-disabled={busy ? "true" : buttonProps["aria-disabled"]}
      disabled={busy}
      ref={a11yWarnRef(noAccessibleName || emptyButton)}
      type={type}
    >
      {body}
    </button>
  );
}
