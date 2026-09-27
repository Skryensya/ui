import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/html-vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { sharedVite, staticDirs, stories } from "../../storybook/.storybook/main-shared";

/*
 * THE SAME STORIES AS `apps/storybook`, not a copy of them: `stories` is that app's generated
 * directory. What differs is `@story`, which here is the Vanilla renderer (emitted markup plus the
 * enhancers), and the Svelte plugin, because several enhancers are Svelte components inside.
 */
const story = fileURLToPath(new URL("../src/tree-story.ts", import.meta.url));

const config: StorybookConfig = {
  framework: "@storybook/html-vite",
  addons: ["@storybook/addon-docs"],
  stories,
  staticDirs,
  core: { disableTelemetry: true },
  viteFinal: async (vite) => {
    const shared = sharedVite(vite, story);
    return { ...shared, plugins: [...(shared.plugins ?? []), svelte()] };
  },
};

export default config;
