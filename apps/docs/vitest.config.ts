import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@artifacts": new URL("../../artifacts", import.meta.url).pathname,
    },
  },
  test: {
    exclude: [...configDefaults.exclude, ".astro/**", "dist/**"],
    environment: "node",
    /* Vitest blanks CSS by default, `?raw` included; the icon-set switch reads these sheets as text. */
    css: { include: [/src\/icon-sets\//] },
  },
});
