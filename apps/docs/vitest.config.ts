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
  },
});
