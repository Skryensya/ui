import type { Decorator, Meta as HtmlMeta, StoryObj as HtmlStoryObj } from "@storybook/html-vite";
import { emitMarkup } from "@skryensya/ai-compiler/emit";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { lucideIcons } from "@skryensya/icons-lucide";
import { mountComponentsWithIcons } from "@skryensya/vanilla/auto";
import type { Translate } from "@docs/i18n";
import { isLocale, translator } from "@skryensya/storybook-kit/translate";

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
  if (host.querySelector("[data-sk-editor]")) {
    (await import("@skryensya/vanilla/editor")).mountEditor(host);
  }
}

/*
 * Enhancers measure (an annotation's leaders, a canvas's fit), so they run once the markup is in the
 * document, not while Storybook still holds it detached.
 */
function render(tree: UsageTree): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = emitMarkup(tree);
  const whenConnected = () => (host.isConnected ? void boot(host) : requestAnimationFrame(whenConnected));
  requestAnimationFrame(whenConnected);
  return host;
}

/* The snippet the docs print for this binding: authored markup, defaults left out. */
const source = (code: (context: { args: never; globals: Record<string, unknown> }) => string) => ({
  language: "html",
  transform: (_code: string, context: { args: never; globals: Record<string, unknown> }) => code(context),
});

/** One story per docs tree, drawn in the toolbar's locale. */
export function treeStory(factory: TreeFactory, story: StoryObj = {}): StoryObj {
  return {
    ...story,
    render: (_args, { globals }) => render(treeFor(factory, globals.locale)),
    parameters: {
      ...story.parameters,
      docs: {
        ...story.parameters?.docs,
        source: source(({ globals }) => emitMarkup(treeFor(factory, globals.locale), { fillDefaults: false })),
      },
    },
  };
}

/** A story whose tree is built from its args (a playground). */
export function argsStory<Args>(build: (args: Args) => UsageTree, story: StoryObj<Args>): StoryObj<Args> {
  return {
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
