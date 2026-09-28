import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { siteSync } from "./site-sync";

/*
 * TWO PAGES, one origin. `index.html` is the Maker's own chrome; `stage.html` is the document the
 * maker page renders in, loaded into an iframe whose width is the stage width. Same origin on
 * purpose: the chrome reads the stage's DOM directly to paint overlays and resolve a drop, and
 * nothing it reads there is ever written back into the page (decision 31).
 *
 * A second Vite entry rather than a `srcdoc` string (what `apps/eval-viewer` does): Vite serves it
 * like any page, so React's refresh preamble and the dependency scan cover it with no workaround.
 *
 * `fs.allow` reaches the workspace root for `artifacts/ai-index.json` (the catalogue's hash).
 *
 * `siteSync` shares the open site with an agent through a file (see `site-sync.ts`).
 */
const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));

/* Where the site files the MCP's maker tools share with this app live: MAKER_DIR, or `.maker/`. */
const siteDir = process.env.MAKER_DIR ?? fileURLToPath(new URL("../../.maker", import.meta.url));

export default defineConfig({
  plugins: [react(), siteSync(siteDir)],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("index.html", import.meta.url)),
        stage: fileURLToPath(new URL("stage.html", import.meta.url)),
      },
    },
  },
  optimizeDeps: { entries: ["index.html", "stage.html"] },
  server: { port: 4200, strictPort: false, fs: { allow: [workspaceRoot] } },
});
