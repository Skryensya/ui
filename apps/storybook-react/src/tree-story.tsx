import type { Decorator, Meta as ReactMeta, StoryObj as ReactStoryObj } from "@storybook/react-vite";
import { emitReact } from "@skryensya/ai-compiler/emit";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { loadTree, renderTree } from "@skryensya/react/render-tree";
import type { Translate } from "@docs/i18n";
import { isLocale, translator } from "@skryensya/storybook-kit/translate";

/*
 * THIS STORYBOOK'S BINDING: what every generated story imports (`treeStory`, `argsStory`, `withCss`,
 * `localeOf`, the story types). A tree is drawn by `renderTree` and its code panel shows `emitReact`,
 * the TSX a consumer writes for it, which is the snippet the docs page prints for React.
 */

export { localeOf } from "@skryensya/storybook-kit/translate";
export type Meta = ReactMeta;
export type StoryObj<Args = Record<string, unknown>> = ReactStoryObj<Args>;

/** A docs demo: one composition, authored as a function of the translator. */
export type TreeFactory = (t: Translate) => UsageTree;

const treeFor = (factory: TreeFactory, locale: unknown): UsageTree =>
  factory(translator(isLocale(locale) ? locale : "en"));

const source = (code: (context: { args: never; globals: Record<string, unknown> }) => string) => ({
  language: "tsx",
  transform: (_code: string, context: { args: never; globals: Record<string, unknown> }) => code(context),
});

/*
 * ONE STORY PER DOCS TREE, and the story adds nothing to it. The tree is translated into the toolbar's
 * locale, its families are loaded (`loadTree`, the same lazy map the docs frame uses), and it is drawn
 * by `renderTree`. The "Show code" panel is `emitReact` over that same tree, so the snippet a reader
 * copies here is the one the docs page prints.
 */
export function treeStory(factory: TreeFactory, story: StoryObj = {}): StoryObj {
  return {
    ...story,
    loaders: [
      async ({ globals }) => {
        const tree = treeFor(factory, globals.locale);
        await loadTree(tree);
        return { tree };
      },
    ],
    render: (_args, { loaded }) => <>{renderTree(loaded.tree as UsageTree)}</>,
    parameters: {
      ...story.parameters,
      docs: {
        ...story.parameters?.docs,
        source: source(({ globals }) => emitReact(treeFor(factory, globals.locale))),
      },
    },
  };
}

/*
 * A story whose tree is built from its args (a playground). Loaded per render, because an arg can
 * name a family (an icon in a slot) the previous tree did not.
 */
export function argsStory<Args>(build: (args: Args) => UsageTree, story: StoryObj<Args>): StoryObj<Args> {
  return {
    ...story,
    loaders: [
      async ({ args }: { args: unknown }) => {
        const tree = build(args as Args);
        await loadTree(tree);
        return { tree };
      },
    ],
    render: (args: unknown) => <>{renderTree(build(args as Args))}</>,
    parameters: {
      ...story.parameters,
      docs: { ...story.parameters?.docs, source: source(({ args }) => emitReact(build(args))) },
    },
  };
}

/** A stylesheet only some stories need, the way `ComponentPreview`'s `css` prop hands it to a frame. */
export const withCss =
  (css: string): Decorator =>
  (Story) => (
    <>
      <style>{css}</style>
      <Story />
    </>
  );
