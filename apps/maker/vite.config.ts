import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { makerApi } from "./server/plugin";

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
 * `makerApi` serves the projects (Postgres) to the Maker and to agents (see `server/`).
 */
const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));


export default defineConfig(({ mode }) => {
  /* SITES_* from `.env.local` (git-ignored) or the environment: the publish token never reaches the
     browser, since nothing here is prefixed VITE_. */
  const env = { ...loadEnv(mode, fileURLToPath(new URL(".", import.meta.url)), "SITES_"), ...process.env };
  return {
  plugins: [react(), makerApi({ token: env.SITES_PUBLISH_TOKEN, url: env.SITES_PUBLISH_URL, domain: env.SITES_DOMAIN })],
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
};
});
