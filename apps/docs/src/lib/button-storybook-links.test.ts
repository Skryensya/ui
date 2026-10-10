import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync(new URL("../components/pages/ButtonPage.astro", import.meta.url), "utf8");
const stories = readFileSync(new URL("../../../storybook-react/src/stories/button.stories.ts", import.meta.url), "utf8");

describe("Button preview code links", () => {
  it("links every non-bare preview to an existing Storybook story", () => {
    const previews = [...page.matchAll(/<UsagePreview\b[\s\S]*?\/>/g)]
      .map(([preview]) => preview)
      .filter((preview) => !/\bbare\b/.test(preview));
    expect(previews.length).toBeGreaterThan(0);
    for (const preview of previews) {
      expect(preview).toContain("storybookTitle={storybookTitle}");
      const story = preview.match(/storybookStory="([^"]+)"/)?.[1];
      expect(story, preview).toBeDefined();
      expect(stories).toContain(`export const ${story}:`);
    }
  });
});
