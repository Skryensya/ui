/* Read generated CSF as text, never execute its rendering imports in the docs build.
 * The published title can gain a category or module suffix; handwritten page titles can lag it.
 * Resolve only an unambiguous component + export pair, never guess a missing story. */
const sources = import.meta.glob("../../../storybook-react/src/stories/*.stories.ts", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const published = Object.values(sources).flatMap((source) => {
  const title = source.match(/export default\s*\{\s*title:\s*"([^"]+)"/)?.[1];
  return title ? [{ title, stories: new Set([...source.matchAll(/^export const (\w+)/gm)].map((match) => match[1])) }] : [];
});

export function resolveStorybookStory(title: string, story: string): { title: string; story: string } | null {
  const exact = published.find((entry) => entry.title === title && entry.stories.has(story));
  if (exact) return { title: exact.title, story };
  const component = title.split("/").at(-1);
  const matches = published.filter((entry) => entry.title.split("/").at(-1) === component && entry.stories.has(story));
  return matches.length === 1 ? { title: matches[0].title, story } : null;
}
