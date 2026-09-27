import { fileURLToPath } from "node:url";
import type { InlineConfig } from "vite";

/*
 * THE VITE SETTINGS BOTH STORYBOOKS NEED, applied by each app's own `.storybook/main.ts`.
 *
 * `@docs` reaches the trees the docs site publishes, named like the docs app's own `@core`/`@react`
 * aliases: a path into the file tree, not a package's published surface.
 */
const repo = (path: string) => fileURLToPath(new URL(`../../../${path}`, import.meta.url));

// The demos' own media (`/demos/*.svg`), served from where the docs serve it.
export const staticDirs = [repo("apps/docs/public")];

export function sharedVite(vite: InlineConfig): InlineConfig {
  return {
    ...vite,
    resolve: {
      ...vite.resolve,
      alias: {
        ...(vite.resolve?.alias as Record<string, string> | undefined),
        "@docs": repo("apps/docs/src"),
      },
    },
    // The trees live in apps/docs and the stylesheets in packages/core, outside the app's root.
    server: { ...vite.server, fs: { ...vite.server?.fs, allow: [repo("")] } },
    /*
     * The tokens' `light-dark()` must reach the browser as written. Storybook's default target is old
     * enough that lightningcss lowers it to a `prefers-color-scheme` fallback, and that fallback
     * cannot see `color-scheme` set on the root: the Mode toolbar then changed nothing.
     */
    build: { ...vite.build, cssTarget: ["chrome123", "firefox120", "safari17.5"] },
  };
}
