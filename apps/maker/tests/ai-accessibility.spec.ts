import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { openMaker } from "./fixtures";

const require = createRequire(import.meta.url);
test("AI settings and composer are keyboard accessible with no panel axe violations", async ({ page }) => {
  await openMaker(page);
  await page.getByRole("tab", { name: "AI", exact: true }).focus();
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

test("AI asks to be set up: the settings open in a modal by themselves, and a prompt stays once it is closed", async ({ page }) => {
  await openMaker(page);
  await page.getByRole("tab", { name: "AI", exact: true }).click();
  const modal = page.getByRole("dialog", { name: "AI settings" });
  await expect(modal).toBeVisible();
  await expect(modal.getByLabel("API key", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  const prompt = page.getByRole("region", { name: "Set up AI" });
  await expect(prompt).toBeVisible();
  await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();
  await prompt.getByRole("button", { name: "Set up AI" }).click();
  await expect(modal).toBeVisible();
});

test("a remembered key is encrypted at rest, is not asked for again after a reload, and Disconnect forgets it", async ({ page }) => {
  const KEY = "sk-test-remember-0123456789";
  await page.route("https://api.openai.com/**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ output: [{ type: "message", content: [{ type: "output_text", text: "connected" }] }] }) }));
  await openMaker(page);
  await page.getByRole("tab", { name: "AI", exact: true }).click();
  await page.getByLabel("API key", { exact: true }).fill(KEY);
  await page.getByRole("button", { name: "Test & connect" }).click();
  await expect(page.getByRole("status").filter({ hasText: "saved, encrypted" })).toBeVisible();
  /* At rest it is ciphertext: the plain key is nowhere in what IndexedDB holds. */
  const stored = await page.evaluate(() => new Promise<string>((resolve) => {
    const open = indexedDB.open("maker-ai");
    open.onsuccess = () => {
      const get = open.result.transaction("vault").objectStore("vault").get("connection");
      get.onsuccess = () => resolve(JSON.stringify({ iv: [...get.result.iv], secret: [...new Uint8Array(get.result.secret)], extractable: get.result.key.extractable }));
    };
  }));
  expect(stored).not.toContain(KEY);
  expect(JSON.parse(stored).extractable).toBe(false);
  await page.reload();
  await page.getByRole("tab", { name: "AI", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "AI settings" })).toBeHidden();
  await expect(page.getByRole("status").filter({ hasText: "saved on this device" })).toBeVisible();
  await expect(page.getByLabel("Ask Maker")).toBeVisible();
  await page.getByRole("button", { name: "AI settings" }).click();
  await page.getByRole("button", { name: "Disconnect" }).click();
  await expect(page.getByRole("status").filter({ hasText: "saved key was removed" })).toBeVisible();
  await page.reload();
  await page.getByRole("tab", { name: "AI", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "AI settings" })).toBeVisible();
});
