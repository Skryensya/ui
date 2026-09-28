import { defineConfig } from "@playwright/test";

/* Projects live in the dev server's memory for the run, never in the database; each test opens a
   project of its own, so parallel tests never share one. */

/* The Maker's own browser checks: it starts its dev server and drives the real app. */
export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  fullyParallel: true,
  workers: process.env.CI ? undefined : 4,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:4201", viewport: { width: 1600, height: 1000 } },
  webServer: {
    command: "vite --port 4201 --strictPort",
    url: "http://localhost:4201",
    reuseExistingServer: false,
    env: { MAKER_STORE: "memory" },
    timeout: 60_000,
  },
});
