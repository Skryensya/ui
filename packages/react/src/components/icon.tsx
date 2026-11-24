/*
 * React's icon renderer.
 *
 * React renders, it does not hydrate (decision 14), which is why there is a component here and
 * nothing in @skryensya/vanilla. It is not an omission: the vanilla layer exists for the behavior the
 * platform does not give, and an icon has no behavior. A vanilla consumer writes the `<svg>` by hand;
 * the markup contract is documented and never shipped (decision 8).
 */
import { renderIconBox, type IconData, type IconSet, type IconSize, type StableIconName, type BrandIconName, iconContract } from "@skryensya/core/icon";
import { createContext, useContext, type ReactNode, type SVGAttributes } from "react";
import { a11yWarnRef, dev, devTicket } from "../dev-warning.js";

/* Derived, never restated: the default lives in the contract. */
const { size: sizeOption } = iconContract.options;

/*
 * The bound set. It goes through context and not through a prop because the foundational components
 * (select, tile, sidebar) consume roles internally and passing them down would be drilling through the
 * whole tree.
 *
 * And it goes through context and not a global module registry because the site, the real consumer
 * (decision 12), will want to show two sets on the same page, and a module variable can only hold one.
 *
 * There is NO default set. The geometry is the consumer's dependency (an `@iconify-json/<set>` they
 * install, written into their project by `skryensya icons <set>`), so the kit's bundle carries no icon
 * library and the consumer's carries only the roles. Until a provider binds one, `<Icon name>` draws
 * nothing and says so once in development.
 */
const IconSetContext = createContext<IconSet | undefined>(undefined);

export type IconSetProviderProps = {
  /** The set that occupies the stable vocabulary. Binding it is the same as choosing a brand. */
  set: IconSet;
  children: ReactNode;
};

/** The bound set, for a component that draws an icon outside JSX (into DOM a shared helper builds). */
export function useIconSet(): IconSet | undefined {
  return useContext(IconSetContext);
}

export function IconSetProvider({ set, children }: IconSetProviderProps) {
  return <IconSetContext.Provider value={set}>{children}</IconSetContext.Provider>;
}

type IconBaseProps = Omit<
  SVGAttributes<SVGSVGElement>,
  // the renderer writes them; letting them through lets the consumer break accessibility and the viewBox
  "children" | "dangerouslySetInnerHTML" | "role" | "aria-label" | "aria-hidden" | "focusable" | "viewBox"
> & {
  /**
   * The accessible name. With a label the icon is content (`role="img"`); without a label it is
   * decorative (`aria-hidden`).
   *
   * An icon inside a control with text is decorative: the text already names the action. An icon ALONE
   * inside a button is too: the accessible name belongs to the button (`aria-label`), not to the svg.
   * The label here is for the icon that stands alone and means something by itself.
   */
  label?: string;
  size?: IconSize;
  /** Set false when this icon conveys meaning on its own; then `label` is required. */
  decorative?: boolean;
};

/*
 * `name` or `data`, never both; the discriminated union IS the distinction the original proposal split
 * between <Icon> and <SetIcon> (decision 15).
 *
 *   name → a system role, portable, survives a change of set
 *   data → project geometry, coupled on purpose, and the consumer's
 *
 * There is no SetIcon because it would be the system typing a tenant's vocabulary (decision 2). An app
 * that wants names for its icons writes its own three-line wrapper over `data`.
 */
export type IconProps = IconBaseProps &
  ({ name: StableIconName | BrandIconName; data?: never } | { data: IconData; name?: never });

let warnedNoSet = false;
function warnNoSet() {
  if (!dev || warnedNoSet) return;
  warnedNoSet = true;
  console.error(...devTicket("<Icon>", {
    issue: "has a `name` but no icon set is bound, so it draws nothing.",
    why: "The kit ships no icons: the project picks a set.",
    fix: "Run `skryensya icons lucide` (after installing @iconify-json/lucide) and wrap the app in <IconSetProvider set={icons}>.",
  }));
}

export function Icon({ name, data, label, decorative = true, size = sizeOption.default, className, ...props }: IconProps) {
  const missingLabel = decorative === false && !label;
  if (dev && missingLabel) {
    console.error(...devTicket("<Icon>", {
      issue: "is marked meaningful (`decorative={false}`) but has no accessible name.",
      why: "A meaningful icon needs a label for assistive technology.",
      fix: 'Add `label="…"` or leave it decorative.',
    }));
  }
  // `data` does not read the context, it is project geometry, portable without a set (decision 15).
  const set = useContext(IconSetContext);
  if (name !== undefined && !set) {
    warnNoSet();
    return null;
  }
  const icon = name !== undefined ? set![name] : data!;

  /*
   * `name`'s type is the closed vocabulary (`StableIconName`), which `validate_ui` checks for a tree
   * built through the contract tooling - but a `name` computed at runtime (from an API, a CMS field)
   * reaches this component as a plain string with the type erased, and a set is never obliged to
   * draw every stable name. Caught here, not left to crash: `icon.attrs`/`.viewBox`/`.body` below
   * would otherwise throw on `undefined`, which is what an unrecognized name did the first time this
   * contract was exercised (see the comment on `iconContract.options.name` in core).
   */
  if (!icon) {
    if (dev) {
      console.error(...devTicket("<Icon>", {
        issue: `name "${name}" has no drawing in the active set.`,
        fix: "Check the name against the active IconSetProvider's set, or fall back to a known name.",
      }));
    }
    return null;
  }

  // The box is computed once, in core, as data: presentation are the set's attrs (without the keys the
  // box reserves), box is what the binding dictates. This component is only the adapter to JSX.
  const { presentation, box, body } = renderIconBox({ icon, dataIcon: name, size, label, className });

  // presentation first (fill/stroke), then the consumer's props, then the box, which wins. In JSX the
  // last spread overrides, so this order reproduces the exact precedence: a set cannot touch the viewBox
  // or the a11y, and the consumer can override fill/stroke but not the contract.
  const boxProps: Record<string, string> = {};
  for (const [k, v] of box) boxProps[k === "class" ? "className" : k] = v;

  // `presentation` is the set's raw attrs (`stroke-width`, `stroke-linecap`, …), correct as literal
  // HTML attribute names for vanilla's own `setAttribute` calls, but React's SVG props expect the
  // DOM property spelling (`strokeWidth`) for the multi-word ones: spread as-is, a glyph carrying one
  // of these (an outlined arrow, say) renders with React warning "Invalid DOM property" and dropping
  // the attribute silently, which is a real bug, not a lint nit  -  the icon paints thinner than the
  // set drew it. `fill`/`stroke` themselves are already single words, so the replace is a no-op there.
  const presentationProps: Record<string, string> = {};
  for (const [k, v] of presentation) {
    presentationProps[k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = v;
  }

  return (
    <svg
      {...presentationProps}
      {...props}
      ref={a11yWarnRef(missingLabel)}
      {...boxProps}
      // The body is trusted by contract: authored or build-time geometry, never from a user or an API
      // (decision 15, "the stated cost"). Today that is a type convention, not a rule the validator
      // enforces.
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
