import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { openMaker } from "./fixtures";

const require = createRequire(import.meta.url);
test("AI settings and composer are keyboard accessible with no panel axe violations", async ({ page }) => {
  await openMaker(page);
  await page.getByRole("radio", { name: "AI", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByLabel("API key", { exact: true })).toBeVisible();
  await page.getByLabel("API key", { exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Model", { exact: true })).toBeFocused();
  await page.addScriptTag({ content: readFileSync(require.resolve("axe-core/axe.min.js"), "utf8") });
  const violations = await page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run: (context: string, options: unknown) => Promise<{ violations: { id: string; nodes: { target: string[] }[] }[] }> } }).axe;
    return (await axe.run(".maker-ai", { resultTypes: ["violations"] })).violations.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(" ")).join(", ")}`);
  });
  expect(violations).toEqual([]);
});
