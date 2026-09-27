import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import { sharedVite, staticDirs, stories } from "./main-shared";

/* The React renderer behind `@story`: every story is drawn by `renderTree`. */
const story = fileURLToPath(new URL("../src/tree-story.tsx", import.meta.url));

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  addons: ["@storybook/addon-docs"],
  stories,
  staticDirs,
  core: { disableTelemetry: true },
  viteFinal: async (vite) => sharedVite(vite, story),
};

export default config;
