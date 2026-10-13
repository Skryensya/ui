export default {
  testDir: "../packages/ai-gates/src",
  testMatch: "dock.spec.ts",
  workers: 1,
  outputDir: "./dock-test-results",
  use: { browserName: "chromium", headless: true, baseURL: "http://localhost:4180" },
  webServer: { command: "pnpm --filter @skryensya/ai-gates exec vite", url: "http://localhost:4180", reuseExistingServer: true },
};
