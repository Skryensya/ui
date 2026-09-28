import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig } from "@playwright/test";

/* Site files for the run, never the checkout's `.maker/`; each test opens a site of its own. */
process.env.MAKER_DIR ??= join(tmpdir(), `maker-e2e-${process.pid}`);

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
    env: { MAKER_DIR: process.env.MAKER_DIR },
    timeout: 60_000,
  },
});
