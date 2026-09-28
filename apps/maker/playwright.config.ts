import { defineConfig } from "@playwright/test";

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
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
