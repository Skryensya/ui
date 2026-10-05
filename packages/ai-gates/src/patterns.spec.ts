import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import { auditLayout } from "./layout-audit.js";

/*
 * G6: THE REFERENCE PATTERNS, AS PAGES.
 *
 * Nine whole pages (a repository, an inbox, an issue tracker, a store listing, a chat, a sign-in, a checkout, settings, search results), each rendered
 * alone in its own document by `harness/page.tsx` and judged the way a user meets it: by axe over the whole
 * WCAG 2.2 AA rule set with colour contrast ON (the component stage turns it off, because a token decision
 * is not a markup defect; here the page is the thing being judged, so it counts), by the keyboard, and at
 * the width of a phone.
 *
 * Aesthetics do not buy an exception: a pattern that needs one is not a reference pattern.
 */
const patterns = ["page-repo-overview", "page-inbox", "page-issue-tracker", "page-store-listing", "page-chat", "page-sign-in-card", "page-checkout-form", "page-account-settings", "page-search-results"] as const;
const axeSource = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");

type Violation = { id: string; impact: string | null; help: string; nodes: string[] };

async function open(page: Page, id: string, binding: string, scheme: "light" | "dark" = "light"): Promise<void> {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ colorScheme: scheme });
  await page.goto(`/page.html?id=${id}&binding=${binding}`);
  await page.waitForSelector('body[data-ready="true"], body[data-ready="error"]', { timeout: 90_000 });
  if ((await page.getAttribute("body", "data-ready")) !== "true") {
    throw new Error(`${id} did not render: ${await page.evaluate(() => (window as unknown as { gateError?: string }).gateError)}`);
  }
  await page.addScriptTag({ content: axeSource });
  expect(errors).toEqual([]);
}

async function audit(page: Page): Promise<Violation[]> {
  return page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run: (c: Document, o: unknown) => Promise<{ violations: { id: string; impact: string | null; help: string; nodes: { html: string }[] }[] }> } }).axe;
    const result = await axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] },
    });
    return result.violations.map((violation) => ({ id: violation.id, impact: violation.impact, help: violation.help, nodes: violation.nodes.map((node) => node.html.slice(0, 160)) }));
  });
}

for (const id of patterns) {
  for (const binding of ["vanilla", "react"] as const) {
    test.describe(`${id} · ${binding}`, () => {
      for (const scheme of ["light", "dark"] as const) {
        test(`has no WCAG 2.2 AA violation (${scheme}, contrast included)`, async ({ page }) => {
          await page.setViewportSize({ width: 1280, height: 800 });
          await open(page, id, binding, scheme);
          mkdirSync("test-results/patterns", { recursive: true });
          await page.screenshot({ path: `test-results/patterns/${id}-${binding}-${scheme}.png`, fullPage: true });
          expect(await audit(page)).toEqual([]);
        });
      }

      test("reflows at 320px: no horizontal scroll, and still no violation", async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 800 });
        await open(page, id, binding);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        await page.screenshot({ path: `test-results/patterns/${id}-${binding}-320.png`, fullPage: true });
        expect(overflow, "the page scrolls sideways at 320px (WCAG 1.4.10 Reflow)").toBeLessThanOrEqual(0);
        expect(await audit(page)).toEqual([]);
      });

      test("the keyboard gets in: the skip link is first and lands in main", async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await open(page, id, binding);
        await page.keyboard.press("Tab");
        const first = await page.evaluate(() => document.activeElement?.className ?? "");
        expect(first).toContain("sk-skip-link");
        await page.keyboard.press("Enter");
        const insideMain = await page.evaluate(() => Boolean(document.activeElement?.closest("main") ?? document.querySelector("main") === document.activeElement));
        expect(insideMain, "activating the skip link must move focus into main").toBe(true);
      });

      for (const width of [1280, 1600]) {
        test(`is aligned, breathes and keeps its regions apart at ${width}px`, async ({ page }) => {
          await page.setViewportSize({ width, height: 900 });
          await open(page, id, binding);
          expect(await page.evaluate(auditLayout)).toEqual([]);
        });
      }

      test("walking the page with Tab, every stop shows where focus is", async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await open(page, id, binding);
        const stops: { name: string; shown: boolean }[] = [];
        for (let step = 0; step < 150; step++) {
          await page.keyboard.press("Tab");
          const stop = await page.evaluate(() => {
            const element = document.activeElement as HTMLElement | null;
            if (!element || element === document.body) return null;
            /* The ring may be painted by the control or by the part that wraps it (a Select's trigger, a Tab). */
            let shown = false;
            for (let node: HTMLElement | null = element, depth = 0; node && depth < 4; node = node.parentElement, depth++) {
              const style = getComputedStyle(node);
              if ((style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== "none") shown = true;
            }
            const rect = element.getBoundingClientRect();
            return { name: `${element.tagName.toLowerCase()} ${(element.getAttribute("aria-label") ?? element.textContent ?? "").trim().slice(0, 40)}`, shown, visible: rect.width > 0 && rect.height > 0 };
          });
          if (!stop) break;
          if (stops.length > 0 && stops[0]!.name === stop.name && step > 2) break;
          if (stop.visible) stops.push({ name: stop.name, shown: stop.shown });
        }
        expect(stops.length, "the page has a tab order").toBeGreaterThan(3);
        expect(stops.filter((stop) => !stop.shown)).toEqual([]);
      });
    });
  }
}
