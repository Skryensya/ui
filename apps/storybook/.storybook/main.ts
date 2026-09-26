import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

/*
 * THE STORIES DO NOT OWN THEIR EXAMPLES. Every story renders a usage tree the docs site already
 * publishes (`apps/docs/src/demos/*.ts`), through the same `renderTree` the docs frame and the gates
 * call. `@docs` is the alias that reaches them, named like the docs app's own `@core`/`@react`
 * aliases: a path into the file tree, not a package's published surface.
 */
const docsSrc = fileURLToPath(new URL("../../docs/src", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  addons: ["@storybook/addon-docs"],
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  core: { disableTelemetry: true },
  viteFinal: async (vite) => ({
    ...vite,
    resolve: {
      ...vite.resolve,
      alias: { ...(vite.resolve?.alias as Record<string, string> | undefined), "@docs": docsSrc },
    },
    // The trees live in apps/docs and the stylesheets in packages/core, both outside this root.
    server: { ...vite.server, fs: { ...vite.server?.fs, allow: [repoRoot] } },
    /*
     * The tokens' `light-dark()` must reach the browser as written. Storybook's default target is old
     * enough that lightningcss lowers it to a `prefers-color-scheme` fallback, and that fallback
     * cannot see `color-scheme` set on the root: the Mode toolbar then changed nothing.
     */
    build: { ...vite.build, cssTarget: ["chrome123", "firefox120", "safari17.5"] },
  }),
};

export default config;
