import type { Decorator, StoryObj } from "@storybook/react-vite";
import { emitReact } from "@skryensya/ai-compiler/emit";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { loadTree, renderTree } from "@skryensya/react/render-tree";
import type { Translate } from "@docs/i18n";
import { isLocale, translator } from "./translate";

/** A docs demo: one composition, authored as a function of the translator. */
export type TreeFactory = (t: Translate) => UsageTree;

const treeFor = (factory: TreeFactory, locale: unknown): UsageTree =>
  factory(translator(isLocale(locale) ? locale : "en"));

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
        source: {
          language: "tsx",
          transform: (_code: string, { globals }: { globals: Record<string, unknown> }) =>
            emitReact(treeFor(factory, globals.locale)),
        },
      },
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
