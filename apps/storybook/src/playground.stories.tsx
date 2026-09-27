import "@skryensya/core/components/button.css";
import "@skryensya/core/patterns/icon.css";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { buttonContract } from "@skryensya/core/button";
import type { OptionInput, UsageTree } from "@skryensya/core/usage-tree";
import { emitReact } from "@skryensya/ai-compiler/emit";
import { loadTree, renderTree } from "@skryensya/react/render-tree";

/*
 * The Button page, story by story, in the page's own order: the anatomy first, then one decision at
 * a time. Every story is a tree from `apps/docs/src/demos/button.ts`; nothing here is a second copy.
 */
const meta = {
  title: "Playground/Button",
} satisfies Meta;

export default meta;

/*
 * BUTTON WITH CONTROLS, and it is still a tree: the args ARE the tree's options, so the
 * snippet, the render and the contract's own validation all see the same object. The choices come
 * from `buttonContract`, never restated, so a new variant shows up here without an edit.
 */
const { variant, tone, appearance, size } = buttonContract.options;

type PlaygroundArgs = {
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
function playgroundTree(args: PlaygroundArgs): UsageTree {
  const options: Record<string, OptionInput> = {};
  for (const [key, option] of Object.entries({ variant, tone, appearance, size })) {
    const value = args[key as keyof PlaygroundArgs];
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

export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    label: "Action",
    variant: variant.default,
    tone: tone.default,
    appearance: appearance.default,
    size: size.default,
    iconOnly: false,
    disabled: false,
    pre: "",
    post: "",
  },
  argTypes: {
    variant: select(variant),
    tone: select(tone),
    appearance: select(appearance),
    size: select(size),
    pre: iconChoices,
    post: iconChoices,
  },
  // Button and Icon are the only families this tree can ever name, so one load covers every arg.
  loaders: [async () => loadTree(playgroundTree({ ...Playground.args, pre: "placeholder" } as PlaygroundArgs))],
  render: (args) => <>{renderTree(playgroundTree(args))}</>,
  parameters: {
    docs: {
      source: {
        language: "tsx",
        transform: (_code: string, { args }: { args: PlaygroundArgs }) => emitReact(playgroundTree(args)),
      },
    },
  },
};
