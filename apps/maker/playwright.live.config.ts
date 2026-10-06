import { defineConfig } from "@playwright/test";
/* The tests against a Maker that is already running (npx vite --port 4202 with MAKER_STORE=memory): no server of its own to start or stop. */
export default defineConfig({ testDir: "./tests", timeout: 60_000, workers: 1, reporter: "list", use: { baseURL: "http://localhost:4202", viewport: { width: 1600, height: 1000 } } });
