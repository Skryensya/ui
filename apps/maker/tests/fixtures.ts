import { expect, type Page } from "@playwright/test";

/** A clean Maker: nothing remembered from a previous test. */
export async function openMaker(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.frameLocator("iframe.maker-stage__iframe").locator("main[data-maker-node]")).toBeAttached();
}

export async function addFromPalette(page: Page, signature: string): Promise<void> {
  await page.locator(".maker-palette").getByRole("button", { name: signature, exact: true }).first().click();
}

/** Select a node by clicking its row in the outline (the last row with that label). */
export async function selectInOutline(page: Page, label: string): Promise<void> {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  await page
    .locator(".maker-outline :is(.sk-tree-view__branch-text, .sk-tree-view__item-text)", { hasText: new RegExp(`^${escaped}$`) })
    .last()
    /* A leaf's text takes no pointer events (the row does), so the click is forced onto it. */
    .click({ force: true });
}

/** The saved page as an indented list of signatures and quoted text runs. */
export async function pageTree(page: Page): Promise<string> {
  return page.evaluate(() => {
    type Held = { kind: string; children?: Node[] };
    type Node = { signature?: string; text?: string; slots?: Record<string, Held> };
    const saved = JSON.parse(localStorage.getItem("skryensya-maker:page") ?? "null") as { root: Node } | null;
    if (!saved) return "";
    const show = (node: Node, depth: number): string[] => [
      " ".repeat(depth * 2) + (node.signature ?? JSON.stringify(node.text)),
      ...Object.values(node.slots ?? {}).flatMap((held) => (held.kind === "nodes" ? (held.children ?? []).flatMap((child) => show(child, depth + 1)) : [])),
    ];
    return show(saved.root, 0).join("\n");
  });
}

/** The page every flow starts from: a column holding a heading, a paragraph and a row of two buttons. */
export async function buildSamplePage(page: Page): Promise<void> {
  await addFromPalette(page, "Wrapper");
  await addFromPalette(page, "Stack");
  await addFromPalette(page, "Heading");
  await selectInOutline(page, "Stack");
  await addFromPalette(page, "Text");
  await selectInOutline(page, "Stack");
  await addFromPalette(page, "Inline");
  await addFromPalette(page, "Button.action");
  await selectInOutline(page, "Inline");
  await addFromPalette(page, "Button.action");
  await expect.poll(() => pageTree(page)).toContain("      Inline\n        Button.action");
}
