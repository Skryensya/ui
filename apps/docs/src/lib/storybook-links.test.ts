import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { resolveStorybookStory } from "./storybook-stories";
import { storybookDocsUrl } from "./navigation";

const pagesDir = new URL("../components/pages/", import.meta.url);
const storiesDir = new URL("../../../storybook-react/src/stories/", import.meta.url);
const published = new Map<string, Set<string>>();
for (const file of readdirSync(storiesDir).filter((file) => file.endsWith(".stories.ts"))) {
  const source = readFileSync(new URL(file, storiesDir), "utf8");
  const title = source.match(/export default\s*\{\s*title:\s*"([^"]+)"/)?.[1];
  if (title) published.set(title, new Set([...source.matchAll(/^export const (\w+)/gm)].map((match) => match[1])));
}

describe("documentation Storybook links", () => {
  it.skipIf(!process.env.STORYBOOK_INDEX)("matches the running Storybook docs index", () => {
    const index = JSON.parse(readFileSync(process.env.STORYBOOK_INDEX!, "utf8")) as { entries: Record<string, unknown> };
    for (const [title, stories] of published) {
      const href = storybookDocsUrl("http://localhost/", title, [...stories][0]);
      const id = new URL(href!).searchParams.get("path")!.replace("/docs/", "");
      expect(index.entries[id], `${title}: ${id}`).toBeDefined();
    }
  });
  it("resolves renamed categories and disambiguated module titles", () => {
    expect(resolveStorybookStory("Components/Actions/Clipboard", "Field")).toEqual({ title: "Components/Actions/Clipboard/Clipboard", story: "Field" });
    expect(resolveStorybookStory("Components/Layout/FadeEdge", "FadeBottom")).toEqual({ title: "Components/Utilities/FadeEdge", story: "FadeBottom" });
    expect(resolveStorybookStory("Components/Actions/Clipboard", "MissingStory")).toBeNull();
  });
  it("links to published titles and story exports", () => {
    const broken: string[] = [];
    for (const file of readdirSync(pagesDir).filter((file) => file.endsWith(".astro"))) {
      const source = readFileSync(new URL(file, pagesDir), "utf8");
      const defaultTitle = source.match(/const storybookTitle\s*=\s*"([^"]+)"/)?.[1];
      for (const [preview] of source.matchAll(/<UsagePreview\b[\s\S]*?\/>/g)) {
        const title = preview.match(/storybookTitle="([^"]+)"/)?.[1] ?? (preview.includes("storybookTitle={storybookTitle}") ? defaultTitle : undefined);
        const story = preview.match(/storybookStory="([^"]+)"/)?.[1];
        if (title && story) {
          const resolved = resolveStorybookStory(title, story);
          if (!resolved || !published.get(resolved.title)?.has(resolved.story)) broken.push(`${file}: ${title} / ${story}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });
});
