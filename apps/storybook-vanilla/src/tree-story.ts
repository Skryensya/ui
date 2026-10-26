import type { Decorator, Meta as HtmlMeta, StoryObj as HtmlStoryObj } from "@storybook/html-vite";
import { emitMarkup } from "@skryensya/ai-compiler/emit";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { lucideIcons } from "@skryensya/icons-lucide";
import { mountComponentsWithIcons } from "@skryensya/vanilla/auto";
import type { Translate } from "@docs/i18n";
import { isLocale, translator } from "@skryensya/storybook-kit/translate";
import { wireCommandPaletteDemo } from "@skryensya/storybook-kit/command-palette-playground";
import { wireTagInteractions } from "@skryensya/storybook-kit/tag-interactions";
import { rootControls, withRootOptions } from "@skryensya/storybook-kit/controls";

/*
 * THIS STORYBOOK'S BINDING: what every generated story imports (`treeStory`, `argsStory`, `withCss`,
 * `localeOf`, the story types). A tree becomes the markup `emitMarkup` writes (what the docs'
 * Vanilla stage shows and what a consumer authors), the enhancers bring it to life in the order the
 * docs preview frame uses, and the code panel shows that markup, the snippet the docs print for
 * Vanilla.
 */

export { localeOf } from "@skryensya/storybook-kit/translate";
export type Meta = HtmlMeta;
export type StoryObj<Args = Record<string, unknown>> = HtmlStoryObj<Args>;

/** A docs demo: one composition, authored as a function of the translator. */
export type TreeFactory = (t: Translate) => UsageTree;

const treeFor = (factory: TreeFactory, locale: unknown): UsageTree =>
  factory(translator(isLocale(locale) ? locale : "en"));

/*
 * THE BOOT, as `component-preview-frame.ts` runs it: icons, the registry, one frame, icons again
 * (`mountComponentsWithIcons` says why), then the two surfaces the registry deliberately does not
 * name. Code preview is a documentation surface a page opts into; Editor pulls ProseMirror, an
 * optional peer the auto-loader must never reach for.
 */
async function boot(host: HTMLElement): Promise<void> {
  await mountComponentsWithIcons(host, lucideIcons);
  if (host.querySelector("[data-sk-code-preview]")) {
    (await import("@skryensya/vanilla/code-preview")).mountCodePreview(host);
  }
}

/*
 * Enhancers measure (an annotation's leaders, a canvas's fit), so they run once the markup is in the
 * document, not while Storybook still holds it detached.
 */
export function render(tree: UsageTree): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = emitMarkup(tree);
  wireTagInteractions(host);
  const whenConnected = () => (host.isConnected ? void boot(host) : requestAnimationFrame(whenConnected));
  requestAnimationFrame(whenConnected);
  return host;
}

/* The snippet the docs print for this binding: authored markup, defaults left out. */
const source = (code: (context: { args: never; globals: Record<string, unknown> }) => string) => ({
  language: "html",
  transform: (_code: string, context: { args: never; globals: Record<string, unknown> }) => code(context),
});

/* The root's options as Controls: read from the English tree once, when the story is declared. */
function controlsOf(factory: TreeFactory) {
  try {
    return rootControls(treeFor(factory, "en"));
  } catch {
    return { args: {}, argTypes: {} };
  }
}

/** One story per docs tree, drawn in the toolbar's locale, with Controls for the root's options. */
export function treeStory(factory: TreeFactory, story: StoryObj = {}): StoryObj {
  const { args, argTypes } = controlsOf(factory);
  return {
    /* A demo whose trigger the docs wire with a script (a palette's "open") gets it wired here. */
    play: ({ canvasElement }: { canvasElement: HTMLElement }) => wireCommandPaletteDemo(canvasElement),
    ...story,
    args: { ...args, ...story.args },
    argTypes: { ...argTypes, ...story.argTypes },
    render: (args, { globals }) => render(withRootOptions(treeFor(factory, globals.locale), args)),
    parameters: {
      ...story.parameters,
      docs: {
        ...story.parameters?.docs,
        source: source(({ args, globals }) => emitMarkup(withRootOptions(treeFor(factory, globals.locale), args), { fillDefaults: false })),
      },
    },
  };
}

/** A story whose tree is built from its args (a playground). */
export function argsStory<Args>(build: (args: Args) => UsageTree, story: StoryObj<Args>): StoryObj<Args> {
  return {
    play: ({ canvasElement }: { canvasElement: HTMLElement }) => wireCommandPaletteDemo(canvasElement),
    ...story,
    render: (args: unknown) => render(build(args as Args)),
    parameters: {
      ...story.parameters,
      docs: { ...story.parameters?.docs, source: source(({ args }) => emitMarkup(build(args), { fillDefaults: false })) },
    },
  };
}

/** A stylesheet only some stories need, the way `ComponentPreview`'s `css` prop hands it to a frame. */
export const withCss =
  (css: string): Decorator =>
  (Story) => {
    const wrapper = document.createElement("div");
    const style = document.createElement("style");
    style.textContent = css;
    const story = Story();
    wrapper.append(style, ...(typeof story === "string" ? [Object.assign(document.createElement("div"), { innerHTML: story })] : [story]));
    return wrapper;
  };
