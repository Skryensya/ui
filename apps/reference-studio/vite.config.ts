import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: {
    /*
     * Browsers with native light-dark(). Below these, the minifier rewrites every light-dark() into
     * variables keyed to `prefers-color-scheme`, which only the OS can flip: the theme choice sets
     * `color-scheme` on <html> and the built CSS would ignore it. Dev never transforms, so only a
     * production build showed the bug.
     */
    cssTarget: ["chrome123", "edge123", "firefox120", "safari17.5"],
  },
  server: { port: 5174, strictPort: true },
});
