import { expect, test, type Page } from "@playwright/test";
import { createSite, counterIds, fromUsageTree, parseSite, randomId, serializeSite, tryAgentOperations } from "@skryensya/maker-model";
import { openMaker, savedProject, stage } from "./fixtures";

/*
 * AN AGENT BUILDING A PAGE THROUGH THE MCP, one `maker_apply` at a time. What `maker_apply` does is what
 * this does: read the project, resolve ONE insert against it (the nodes that are already there keep their
 * identities, only the new one is minted), and save on top of the revision it read. An open Maker takes it
 * in live, and what the person sees is what is checked: every section appears as it is saved, comes in
 * marked as new, and the mark clears on its own a moment after the last one.
 */
const SECTIONS = ["Hero", "Features", "Pricing"];

async function seed(page: Page, id: string) {
  const base = createSite("hash", counterIds("s"));
  const root = fromUsageTree({ contract: "layout", signature: "Main", children: [{ contract: "typography", signature: "Heading", children: "Existing" }] }, counterIds("n"));
  const saved = await savedProject(page, id);
  await page.request.put(`/api/projects/${id}`, { data: { baseRevision: saved.revision, site: { ...base, pages: [{ ...base.pages[0]!, id: "home", root }] } } });
}

/** One `maker_apply`: a single insert at the end of Main, saved on the revision that was read. */
async function applyInsert(page: Page, id: string, text: string) {
  const saved = (await (await page.request.get(`/api/projects/${id}`)).json()) as { revision: number; site: { sourceHash: string; pages: { id: string; root: { id: string; slots: { children?: { children: unknown[] } } } }[] } };
  const parsed = parseSite(JSON.stringify(saved.site), saved.site.sourceHash, randomId);
  if (!parsed.ok) throw new Error("the saved site did not parse");
  const main = parsed.site.pages[0]!;
  const held = main.root.slots.children;
  const index = held?.kind === "nodes" ? held.children.length : 0;
  const result = tryAgentOperations(parsed.site, [{ type: "page", page: main.id, operations: [{ type: "insert", at: { parent: main.root.id, slot: "children", index }, tree: { contract: "typography", signature: "Heading", children: text } }] }], randomId);
  if (!result.ok) throw new Error(result.reason);
  const response = await page.request.put(`/api/projects/${id}`, { data: { baseRevision: saved.revision, site: JSON.parse(serializeSite(result.site, saved.site.sourceHash)) } });
  expect(response.ok()).toBe(true);
}

test("sections an agent saves one by one arrive on the canvas as they are saved", async ({ page }) => {
  const id = await openMaker(page);
  await seed(page, id);
  await page.reload();
  await expect(stage(page).getByRole("heading", { name: "Existing" })).toBeVisible();
  await expect(stage(page).locator("[data-maker-fresh]")).toHaveCount(0);

  for (let i = 0; i < SECTIONS.length; i++) {
    await applyInsert(page, id, SECTIONS[i]!);
    await expect(stage(page).getByRole("heading", { name: SECTIONS[i]! })).toBeVisible();
    /* Exactly the one that just arrived is marked: not the page, not the sections that were already there. */
    await expect(stage(page).locator("[data-maker-fresh]")).toHaveCount(1);
    await expect(stage(page).locator("[data-maker-fresh]")).toHaveText(SECTIONS[i]!);
    if (i < SECTIONS.length - 1) await expect(stage(page).getByRole("heading", { name: SECTIONS[i + 1]! })).toHaveCount(0);
  }

  /* A moment after the last one the marks go away by themselves, and the page is still all there. */
  await expect(stage(page).locator("[data-maker-fresh]")).toHaveCount(0, { timeout: 6000 });
  for (const text of ["Existing", ...SECTIONS]) await expect(stage(page).getByRole("heading", { name: text })).toBeVisible();
});
