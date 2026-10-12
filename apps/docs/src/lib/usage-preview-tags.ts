/*
 * THE `<UsagePreview …>` TAGS OF A DOCS PAGE, read from its source, and the Storybook story each one
 * should link to. Shared by `storybook-links.test.ts` (which fails a page whose preview has no link
 * or links the wrong story) and by the script that writes the missing links.
 *
 * A story is `treeStory(demos.<exportName>…)` in the generated `apps/storybook-react/src/stories/
 * <module>.stories.ts`, so the tree factory a page calls (`tree={megamenuTree(t, hrefs)}`) names its
 * story exactly: nothing here is guessed, and a page cannot drift from Storybook without the test saying so.
 */

export interface PreviewTag {
  /** The whole opening tag, from `<UsagePreview` to its closing `>`. */
  source: string;
  /** Offset of the tag in the page source. */
  start: number;
  /** Self-closing (`/>`): a tree-driven preview. One with children is the page's own demo in the card. */
  selfClosing: boolean;
}

/** Every `<UsagePreview` opening tag; braces and quotes are tracked, so a `=>` or a `>` in a prop does not end it. */
export function previewTags(page: string): PreviewTag[] {
  const tags: PreviewTag[] = [];
  const open = /<UsagePreview\b/g;
  for (let match = open.exec(page); match; match = open.exec(page)) {
    let depth = 0;
    let quote = "";
    let index = match.index;
    for (; index < page.length; index++) {
      const char = page[index]!;
      if (quote) {
        if (char === quote && page[index - 1] !== "\\") quote = "";
      } else if (char === '"' || char === "'" || char === "`") quote = char;
      else if (char === "{") depth++;
      else if (char === "}") depth--;
      else if (char === ">" && depth === 0 && page[index - 1] !== "=") break;
    }
    const source = page.slice(match.index, index + 1);
    tags.push({ source, start: match.index, selfClosing: source.endsWith("/>") });
  }
  return tags;
}

/** A boolean attribute such as `bare`, written bare in the tag. */
export const hasFlag = (tag: string, name: string): boolean => new RegExp(`\\s${name}(?=[\\s/>])`).test(tag);

/** What a tag needs a story link for: a tree-driven card. `bare` diagrams and the page's own demos have none. */
export const needsStoryLink = (tag: PreviewTag): boolean => tag.selfClosing && !hasFlag(tag.source, "bare");

/**
 * A story attribute's value: a literal (`storybookStory="Hero"`), or an identifier the page declares once
 * (`storybookTitle={storybookTitle}` with `const storybookTitle = "Components/…"`). `undefined` when the
 * tag does not set it; `null` when it sets it to something this cannot read.
 */
export function storyAttr(tag: string, name: "storybookTitle" | "storybookStory", page = ""): string | undefined | null {
  const found = new RegExp(`\\b${name}=(?:"([^"]*)"|\\{\\s*"([^"]*)"\\s*\\}|\\{\\s*(\\w+)\\s*\\})`).exec(tag);
  if (!found) return new RegExp(`\\b${name}\\b`).test(tag) ? null : undefined;
  const literal = found[1] ?? found[2];
  if (literal !== undefined) return literal;
  const declared = new RegExp(`const\\s+${found[3]}\\s*=\\s*"([^"]*)"`).exec(page)?.[1];
  return declared ?? null;
}

/** How many times a tag sets an attribute: more than once is a copy-paste slip. */
export const attrCount = (tag: string, name: string): number => (tag.match(new RegExp(`\\b${name}=`, "g")) ?? []).length;

export interface StoryRef {
  title: string;
  story: string;
  module: string;
}

/** Each demo export → the story that draws it, from the generated story files (their text, never executed). */
export function storiesByDemoExport(sources: Record<string, string>): Map<string, StoryRef[]> {
  const byExport = new Map<string, StoryRef[]>();
  for (const [path, source] of Object.entries(sources)) {
    const title = /export default\s*\{\s*title:\s*"([^"]+)"/.exec(source)?.[1];
    const module = /(?:^|\/)([\w-]+)\.stories\.ts$/.exec(path)?.[1];
    if (!title || !module) continue;
    for (const [, story, body] of source.matchAll(/^export const (\w+): StoryObj = treeStory\((.*)\);$/gm)) {
      const factory = /\bdemos\.(\w+)/.exec(body!)?.[1];
      if (!factory) continue;
      byExport.set(factory, [...(byExport.get(factory) ?? []), { title, story: story!, module }]);
    }
  }
  return byExport;
}

/**
 * The tree factories a tag names, in order. A page-local `const heroPitchTree = heroTree(t)` stands for the
 * factory it calls, so the tag's `tree={heroPitchTree}` is traced to `heroTree`.
 */
export function treeFactories(tag: string, page = ""): string[] {
  const names: string[] = [];
  for (const [, name] of tag.matchAll(/\b([a-z]\w*Tree)\b/g)) {
    names.push(name!);
    const via = new RegExp(`const\\s+${name}\\s*=\\s*(\\w+)\\(`).exec(page)?.[1];
    if (via) names.push(via);
  }
  return names;
}
