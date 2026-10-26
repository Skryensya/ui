import { buttonGroupContract, buttonGroupParts } from "@skryensya/core/button-group";
import type { OptionValue } from "@skryensya/core/contract";
import { Children, Fragment, isValidElement } from "react";
import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";

/*
 * A BINDING, not a second declaration (decision 28). The weld is CSS on the group
 * (button-group.css), read from DOM position, so nothing here touches its children.
 */
const { label: labelOption, orientation: orientationOption, separator: separatorOption } = buttonGroupContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type ButtonGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "role"> & {
  children: ReactNode;
  orientation?: OptionValue<typeof orientationOption>;
  /** The group's accessible name. Optional: each member names itself. */
  label?: string;
  /** `full` runs the divider the whole height; `inset` draws a shorter centred one. */
  separator?: OptionValue<typeof separatorOption>;
};

// An explicit ButtonGroupSeparator already marks that seam; the group adds none beside it.
const isSeparator = (node: ReactNode) => isValidElement(node) && node.type === ButtonGroupSeparator;

export function ButtonGroup({ children, className, label, orientation = orientationOption.default, separator = separatorOption.default, ...rest }: ButtonGroupProps) {
  const kids = Children.toArray(children);
  return (
    <div
      {...rest}
      {...{ [labelOption.attr]: label ?? rest["aria-label"] }}
      className={cx(buttonGroupParts.root, className)}
      data-orientation={orientation}
      {...{ [separatorOption.attr]: separator }}
      role="group"
    >
      {separator === "inset"
        ? kids.map((child, i) => (
            <Fragment key={i}>
              {i > 0 && !isSeparator(child) && !isSeparator(kids[i - 1]) && <ButtonGroupSeparator />}
              {child}
            </Fragment>
          ))
        : children}
    </div>
  );
}

/** The line between two members. Decorative: the members name themselves. */
export function ButtonGroupSeparator() {
  return <span aria-hidden="true" className={buttonGroupParts.separator} />;
}

export type ButtonGroupTextProps = HTMLAttributes<HTMLSpanElement> & { children: ReactNode };

/** Static text with a member's face: a prefix, a unit. */
export function ButtonGroupText({ children, className, ...rest }: ButtonGroupTextProps) {
  return (
    <span {...rest} className={cx(buttonGroupParts.text, className)}>
      {children}
    </span>
  );
}

export type ButtonGroupLabelProps = LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode; htmlFor: string };

/** ButtonGroupText as a real `<label>` for the input beside it. */
export function ButtonGroupLabel({ children, className, ...rest }: ButtonGroupLabelProps) {
  return (
    <label {...rest} className={cx(buttonGroupParts.text, className)}>
      {children}
    </label>
  );
}
