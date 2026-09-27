import { fileURLToPath } from "node:url";
import type { InlineConfig } from "vite";

/*
 * THE STORYBOOK CONFIG BOTH APPS SHARE. The stories are binding-agnostic: they import their API
 * (`treeStory`, `argsStory`, `withCss`, `localeOf` and the story types) from `@story`, and each app
 * points that alias at its own renderer. So one generated file is a React story in this app and a
 * Vanilla story in `apps/storybook-vanilla`, from the same tree.
 *
 * `@docs` reaches the trees the docs site publishes, named like the docs app's own `@core`/`@react`
 * aliases: a path into the file tree, not a package's published surface.
 */
const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export const stories = [here("../src/stories/*.stories.ts"), here("../src/playgrounds/*.stories.ts")];

// The demos' own media (`/demos/*.svg`), served from where the docs serve it.
export const staticDirs = [here("../../docs/public")];

export function sharedVite(vite: InlineConfig, storyModule: string): InlineConfig {
  return {
    ...vite,
    resolve: {
      ...vite.resolve,
      alias: {
        ...(vite.resolve?.alias as Record<string, string> | undefined),
        "@docs": here("../../docs/src"),
        "@story": storyModule,
      },
    },
    // The trees live in apps/docs and the stylesheets in packages/core, both outside either root.
    server: { ...vite.server, fs: { ...vite.server?.fs, allow: [here("../../..")] } },
    /*
     * The tokens' `light-dark()` must reach the browser as written. Storybook's default target is old
     * enough that lightningcss lowers it to a `prefers-color-scheme` fallback, and that fallback
     * cannot see `color-scheme` set on the root: the Mode toolbar then changed nothing.
     */
    build: { ...vite.build, cssTarget: ["chrome123", "firefox120", "safari17.5"] },
  };
}
