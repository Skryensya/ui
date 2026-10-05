import { defineConfig } from "@playwright/test";

/*
 * THE PAGE GATES ONLY: no global warm-up and none of the 175-case stage. Each reference pattern is its own
 * document, so a cold dev server costs seconds here, not the minutes the component stage pays once.
 *   pnpm --filter @skryensya/ai-gates exec playwright test -c patterns.config.ts
 */
export default defineConfig({
  testDir: "./src",
  testMatch: ["patterns.spec.ts", "layout-audit.spec.ts"],
  fullyParallel: true,
  workers: 2,
  timeout: 120_000,
  reporter: [["list"], ["json", { outputFile: "test-results/patterns.json" }]],
  use: { baseURL: "http://localhost:4180", trace: "off" },
  webServer: { command: "vite", url: "http://localhost:4180", reuseExistingServer: true, stdout: "pipe", stderr: "pipe" },
});
