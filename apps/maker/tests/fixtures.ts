import { expect, type Locator, type Page } from "@playwright/test";

/** The page open in the Maker: the artboard on the canvas that is being edited. */
export const stage = (page: Page) => page.frameLocator(".maker-artboard[data-active] iframe.maker-stage__iframe");

/** The left panel on one of its tabs: Layers (pages and the outline) or Insert (the palette). */
export async function leftTab(page: Page, tab: "Layers" | "Insert"): Promise<Locator> {
  const panel = page.locator(".maker__left");
  const radio = panel.getByRole("radio", { name: tab, exact: true });
  if (!(await radio.isChecked())) await radio.click();
  return panel;
}
export const layers = (page: Page) => leftTab(page, "Layers");
export const insert = (page: Page) => leftTab(page, "Insert");

/** A clean Maker: nothing remembered from a previous test. */
let made = 0;
let current = "";

/** The project the running test opened. */
export const currentProject = () => current;

/** A project of this test's own, created through the API, then opened in the Maker. */
export async function openMaker(page: Page, name = `Test ${process.pid}-${++made}`): Promise<string> {
  const response = await page.request.post("/api/projects", { data: { name } });
  current = ((await response.json()) as { id: string }).id;
  await page.goto(`/?project=${current}`);
  await expect(stage(page).locator("main[data-maker-node]")).toBeAttached();
  await expect(page.locator(".maker__sync")).toHaveText("Saved");
  return current;
}

type Held = { kind: string; children?: Node[] };
type Node = { id?: string; signature?: string; text?: string; slots?: Record<string, Held> };
export type SavedSite = { pages: { id: string; name: string; path: string; root: Node }[] };

/** The project as the server holds it. */
export async function savedProject(page: Page, id = current): Promise<{ revision: number; site: SavedSite }> {
  return (await page.request.get(`/api/projects/${id}`)).json();
}

export async function addFromPalette(page: Page, signature: string): Promise<void> {
  await (await insert(page)).locator(".maker-palette").getByRole("button", { name: signature, exact: true }).first().click();
}

/** Select a node by clicking its row in the outline (the last row with that label). */
export async function selectInOutline(page: Page, label: string): Promise<void> {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  await (await layers(page))
    .locator(".maker-outline :is(.sk-tree-view__branch-text, .sk-tree-view__item-text)", { hasText: new RegExp(`^${escaped}$`) })
    .last()
    /* A leaf's text takes no pointer events (the row does), so the click is forced onto it. */
    .click({ force: true });
}

/** The page open in the Maker, as saved: an indented list of signatures and quoted text runs. */
export async function pageTree(page: Page): Promise<string> {
  const openName = (await (await layers(page)).locator(".maker-pages__item[aria-current=page] .maker-pages__name").textContent()) ?? "";
  const { site } = await savedProject(page);
  const saved = site.pages.find((entry) => entry.name === openName) ?? site.pages[0];
  if (!saved) return "";
  const show = (node: Node, depth: number): string[] => [
    " ".repeat(depth * 2) + (node.signature ?? JSON.stringify(node.text)),
    ...Object.values(node.slots ?? {}).flatMap((held) => (held.kind === "nodes" ? (held.children ?? []).flatMap((child) => show(child, depth + 1)) : [])),
  ];
  return show(saved.root, 0).join("\n");
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
  /* Saved whole: both buttons are in the project, not only in the browser. */
  await expect.poll(async () => (await pageTree(page)).match(/Button\.action/g)?.length).toBe(2);
  await expect(page.locator(".maker__sync")).toHaveText("Saved");
}
