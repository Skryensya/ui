import { stateButtonAttrs, stateButtonParts, type IconStateFace } from "@skryensya/core/state-button";
import { iconToggleAttrs, iconToggleParts } from "@skryensya/core/icon-toggle";
import { forwardRef, useEffect, type ButtonHTMLAttributes } from "react";
import { a11yWarnRef, dev, devTicket } from "../dev-warning.js";
import { Icon } from "./icon.js";

/*
 * The contract's own a11y rule (`requiresOneOf: ["aria-label", "aria-labelledby"]`) is checked by
 * `validate_ui` for a tree built through the contract tooling, but every face here is `data-icon-
 * only=""` with no text of its own - a consumer who hand-writes `<StateButton faces={...} />`
 * outside that tooling gets no runtime signal at all, unlike Slider/Rating's own
 * `warnMissing*Name`. Same posture, here.
 */
function warnMissingStateButtonName(ariaLabel: unknown, ariaLabelledBy: unknown): void {
  if (!dev || ariaLabel || ariaLabelledBy) return;
  console.error(
    ...devTicket("<StateButton>", {
      issue: "no accessible name.",
      fix: "Give it `aria-label` or `aria-labelledby` - every face is icon-only, so nothing else names it.",
    }),
  );
}

/*
 * ICON STATE BUTTON, the React half (decision 33, reversed: this is the signature now, not a
 * primitive underneath CopyButton/ThemeToggle. Both are gone). `faces` is author-supplied, the
 * same shape the authored/vanilla contract's `faces` items slot takes; `current` picks which one
 * carries `data-active`, the same comparison Icon Toggle's own pattern CSS already reads. Nothing
 * here decides WHEN `current` changes. That is the consumer's click handler, not this component's.
 */

function classes(...values: readonly (string | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

export type StateButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  /** Which face's `name` is current. Absent means no face carries `data-active`. */
  current?: string;
  faces: readonly IconStateFace[];
};

export const StateButton = forwardRef<HTMLButtonElement, StateButtonProps>(function StateButton(
  { className, current, faces, ...props },
  ref,
) {
  const missingName = !props["aria-label"] && !props["aria-labelledby"];
  useEffect(
    () => warnMissingStateButtonName(props["aria-label"], props["aria-labelledby"]),
    [props["aria-label"], props["aria-labelledby"]],
  );

  return (
    <button
      {...props}
      className={classes(stateButtonParts.root, iconToggleParts.root, "sk-button", "sk-interactive", className)}
      data-icon-only=""
      ref={(el) => {
        a11yWarnRef(missingName)(el);
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      type="button"
      {...{ [stateButtonAttrs.current]: current }}
    >
      {faces.map((face) => (
        // No `data-sk-icon-size`: that is the vanilla enhancer's own control attribute (`icon.ts`),
        // read once to size the icon it builds and never meant to persist. `Icon`'s own `size` prop
        // already defaults to `"md"`, so this side needs nothing extra to match.
        <Icon
          key={face.name}
          name={face.icon}
          {...{
            [stateButtonAttrs.face]: face.name,
            [iconToggleAttrs.active]: face.name === current ? "" : undefined,
          }}
        />
      ))}
    </button>
  );
});
