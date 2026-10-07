import { defineConfig } from "@playwright/test";

/*
 * The Maker's own browser checks: they start its dev server and drive the real app. Projects live
 * in the dev server's memory for the run, never in the database; each test opens a project of its
 * own, so parallel tests never share one.
 */
/* Its own port when asked: the dev server, the stream config and another run all want 4201, and two servers on one
   port is how a run dies half way. `MAKER_E2E_PORT=4301 pnpm test` keeps this run apart from the rest. */
const PORT = Number(process.env.MAKER_E2E_PORT ?? 4201);

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  fullyParallel: true,
  workers: process.env.CI ? undefined : 4,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${PORT}`, viewport: { width: 1600, height: 1000 } },
  webServer: [
    {
      command: `vite --port ${PORT} --strictPort`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: false,
      env: { MAKER_STORE: "memory", MAKER_AI_LOG: "off" },
      timeout: 120_000,
    },
  ],
});
