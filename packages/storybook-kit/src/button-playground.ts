import { buttonContract } from "@skryensya/core/button";
import type { OptionInput, UsageTree } from "@skryensya/core/usage-tree";

/*
 * BUTTON WITH CONTROLS, as data both Storybooks render: the args ARE the tree's options, so the
 * snippet, the render and the contract's own validation all see the same object. The choices come
 * from `buttonContract`, never restated, so a new variant shows up without an edit.
 */
const { variant, tone, appearance, size } = buttonContract.options;

export type ButtonPlaygroundArgs = {
  label: string;
  variant: string;
  tone: string;
  appearance: string;
  size: string;
  iconOnly: boolean;
  disabled: boolean;
  pre: string;
  post: string;
};

const icon = (name: string): UsageTree => ({ contract: "icon", signature: "Icon", options: { name } });

/** Only what differs from the contract's default is written, as the docs trees do. */
export function buttonPlaygroundTree(args: ButtonPlaygroundArgs): UsageTree {
  const options: Record<string, OptionInput> = {};
  for (const [key, option] of Object.entries({ variant, tone, appearance, size })) {
    const value = args[key as keyof ButtonPlaygroundArgs] as string;
    if (value !== option.default) options[key] = value;
  }
  if (args.iconOnly) options.iconOnly = true;
  if (args.disabled) options.disabled = true;

  if (args.iconOnly) {
    return {
      contract: "button",
      signature: "Button.action",
      options,
      attrs: { "aria-label": args.label },
      children: icon(args.pre || "settings"),
    };
  }
  const slots: Record<string, UsageTree> = {};
  if (args.pre) slots.pre = icon(args.pre);
  if (args.post) slots.post = icon(args.post);
  return {
    contract: "button",
    signature: "Button.action",
    options,
    ...(Object.keys(slots).length > 0 ? { slots } : {}),
    children: args.label,
  };
}

const select = (option: { values: readonly string[] }) => ({
  control: "inline-radio" as const,
  options: [...option.values],
});

const iconChoices = { control: "select" as const, options: ["", "download", "settings", "external-link", "placeholder"] };

export const buttonPlaygroundArgs: ButtonPlaygroundArgs = {
  label: "Action",
  variant: variant.default,
  tone: tone.default,
  appearance: appearance.default,
  size: size.default,
  iconOnly: false,
  disabled: false,
  pre: "",
  post: "",
};

export const buttonPlaygroundArgTypes = {
  variant: select(variant),
  tone: select(tone),
  appearance: select(appearance),
  size: select(size),
  pre: iconChoices,
  post: iconChoices,
};
