import { defineConfig } from "@playwright/test";

/*
 * The Maker's own browser checks: they start its dev server and drive the real app. Projects live
 * in the dev server's memory for the run, never in the database; each test opens a project of its
 * own, so parallel tests never share one.
 *
 * Publishing goes to the sites Worker run locally (apps/sites-worker, `dev:local`) with a token of
 * the run's own, so a publication is checked end to end without Cloudflare.
 */
const PUBLISH_TOKEN = `e2e-${process.pid}`;
export const SITES_PORT = 8799;

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  fullyParallel: true,
  workers: process.env.CI ? undefined : 4,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:4201", viewport: { width: 1600, height: 1000 } },
  webServer: [
    {
      command: `pnpm --filter @skryensya/maker-server build:kit && vite --port 4201 --strictPort`,
      url: "http://localhost:4201",
      reuseExistingServer: false,
      env: {
        MAKER_STORE: "memory",
        SITES_PUBLISH_TOKEN: PUBLISH_TOKEN,
        SITES_PUBLISH_URL: `http://localhost:${SITES_PORT}`,
        SITES_DOMAIN: `localhost:${SITES_PORT}`,
      },
      timeout: 120_000,
    },
    {
      command: "pnpm --filter @skryensya/sites-worker dev:local",
      url: `http://localhost:${SITES_PORT}/v1/sites`,
      reuseExistingServer: false,
      ignoreHTTPSErrors: true,
      env: { SITES_PUBLISH_TOKEN: PUBLISH_TOKEN, PORT: String(SITES_PORT) },
      timeout: 60_000,
    },
  ],
});
