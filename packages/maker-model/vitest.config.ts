import { configDefaults, defineConfig } from "vitest/config";

/* Node, not jsdom: nothing in the model touches a DOM, and a test that needed one would be a sign
   something that belongs on the stage leaked into the model. */
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude],
    environment: "node",
  },
});
