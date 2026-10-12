/*
 * EVERY TREE-DRIVEN PREVIEW ON A DOCS PAGE LINKS TO ITS STORYBOOK STORY, and the story is the one that draws
 * the tree the page shows. The card's code button is how a reader gets from the example to its source; a
 * preview without it is a dead end, and one that links a different story shows the reader code for another example.
 *
 * `bare` anatomy diagrams and the page's own demos (a preview with children) have no story and are skipped.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveStorybookStory } from "./storybook-stories";
import { attrCount, hasFlag, needsStoryLink, previewTags, storiesByDemoExport, storyAttr, treeFactories } from "./usage-preview-tags";

const pagesDir = join(__dirname, "../components/pages");
const storiesDir = join(__dirname, "../../../storybook-react/src/stories");
const vanillaDir = join(__dirname, "../../../storybook-vanilla/src/stories");

const stories = storiesByDemoExport(
  Object.fromEntries(
    readdirSync(storiesDir)
      .filter((file) => file.endsWith(".stories.ts"))
      .map((file) => [file, readFileSync(join(storiesDir, file), "utf8")]),
  ),
);

/* The code button offers BOTH Storybooks, so a story has to exist in both: title and export name. */
const hasStory = (dir: string, title: string, story: string): boolean =>
  readdirSync(dir)
    .filter((file) => file.endsWith(".stories.ts"))
    .some((file) => {
      const source = readFileSync(join(dir, file), "utf8");
      return source.includes(`title: ${JSON.stringify(title)}`) && new RegExp(`^export const ${story}\\b`, "m").test(source);
    });

const pages = readdirSync(pagesDir)
  .filter((file) => file.endsWith("Page.astro"))
  .map((file) => ({ file, source: readFileSync(join(pagesDir, file), "utf8") }));

describe("docs previews link to Storybook", () => {
  for (const { file, source } of pages) {
    const tags = previewTags(source).filter(needsStoryLink);
    if (tags.length === 0) continue;
    it(file, () => {
      const problems: string[] = [];
      for (const tag of tags) {
        const line = source.slice(0, tag.start).split("\n").length;
        if (attrCount(tag.source, "storybookTitle") > 1 || attrCount(tag.source, "storybookStory") > 1) {
          problems.push(`line ${line}: sets storybookTitle or storybookStory twice`);
          continue;
        }
        const title = storyAttr(tag.source, "storybookTitle", source);
        const story = storyAttr(tag.source, "storybookStory", source);
        /* `null`: set from a loop variable or an expression, resolved by the card at build time (it throws on a miss). */
        if (title === null || story === null) continue;
        if (!title || !story) {
          problems.push(`line ${line}: no storybookTitle / storybookStory`);
          continue;
        }
        if (!hasStory(vanillaDir, title, story)) {
          problems.push(`line ${line}: "${title}" / "${story}" is missing from Storybook Vanilla`);
          continue;
        }
        if (!resolveStorybookStory(title, story)) {
          problems.push(`line ${line}: "${title}" / "${story}" is not a published story`);
          continue;
        }
        /* A fixed card shows one tree, so the story must be the one that draws it. A card with a control varies a
           base tree (or switches between several), and its story is the closest one: existing, not the same. */
        if (hasFlag(tag.source, "bare") || /\b(optionName|variants)=/.test(tag.source)) continue;
        const named = treeFactories(tag.source, source).filter((name) => stories.has(name));
        const tail = title.split("/").at(-1)!;
        if (named.length > 0 && !named.some((name) => stories.get(name)!.some((ref) => ref.story === story && ref.title.split("/").includes(tail)))) {
          problems.push(`line ${line}: story "${story}" does not draw ${named.join(" / ")}`);
        }
      }
      expect(problems).toEqual([]);
    });
  }

  /* A page that builds a Storybook link by hand (a story it shows outside a card) names the same published story. */
  for (const { file, source } of pages) {
    const calls = [...source.matchAll(/storybookDocsUrl\(\s*\w+,\s*"([^"]+)",\s*"([^"]+)"\s*\)/g)];
    if (calls.length === 0) continue;
    it(`${file} (hand-built links)`, () => {
      const missing = calls.filter(([, title, story]) => !hasStory(storiesDir, title!, story!) || !hasStory(vanillaDir, title!, story!)).map(([, title, story]) => `${title} / ${story}`);
      expect(missing).toEqual([]);
    });
  }
});
