import { expect, test } from "@playwright/test";
import { buildSamplePage, openMaker } from "./fixtures";

/*
 * Publishing end to end: from the Publish panel, through the sites Worker run locally, to the site
 * at its subdomain, served with the kit and the Worker's CSP.
 */

const SITES = "localhost:8799";

test("a project is published at its subdomain, with the kit, and can be taken down", async ({ page, context }) => {
  await openMaker(page, `Publicado ${Date.now()}`);
  await buildSamplePage(page);
  const name = `cafe-${Date.now().toString(36)}`;

  await page.getByRole("button", { name: "Publish", exact: true }).click();
  const panel = page.locator(".maker__right");
  const field = panel.getByLabel("Site name");
  await field.fill(name);
  await expect(panel).toContainText(`https://${name}.${SITES}/`);
  await panel.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(panel.getByRole("status")).toContainText(`http://${name}.${SITES}/`);

  const site = await context.newPage();
  const response = await site.goto(`http://${name}.${SITES}/`);
  expect(response!.status()).toBe(200);
  expect(response!.headers()["content-security-policy"]).toContain("script-src 'self'");
  await expect(site.locator("h2")).toHaveText("Heading");
  await expect(site.getByRole("button", { name: "Button" })).toHaveCount(2);
  /* The kit is there: its enhancers mounted the buttons, and its stylesheet sets the body's face. */
  await expect(site.locator("[data-sk-button][data-sk-ready='true']")).toHaveCount(2);
  expect(await site.evaluate(() => getComputedStyle(document.body).fontFamily)).toMatch(/Hanken/i);

  /* A reserved or malformed name is refused before anything is uploaded. */
  await field.fill("ui");
  await expect(panel).toContainText('"ui" is reserved.');
  await expect(panel.getByRole("button", { name: "Publish changes", exact: true })).toBeDisabled();
  await field.fill(name);

  await panel.getByRole("button", { name: "Unpublish" }).click();
  await panel.getByRole("button", { name: `Take ${name} down` }).click();
  await expect(panel).toContainText("Not published.");
  /* Asked of the server, not the browser: a browser that already had the page may keep it up to a
     minute (max-age=60), the price of a new publication showing up without a purge. */
  expect((await site.request.get(`http://${name}.${SITES}/`)).status()).toBe(404);
});

test("a link that would run code keeps the site from being published at all", async ({ page }) => {
  const project = await openMaker(page, `Peligroso ${Date.now()}`);
  /* Planted straight into the stored project, past the Maker's own refusal, as a corrupted row might be. */
  const saved = await (await page.request.get(`/api/projects/${project}`)).json();
  const root = saved.site.pages[0].root;
  root.slots.children.children.push({ id: "bad", contract: "button", signature: "Button.navigation", options: { href: "javascript:alert(1)" }, slots: { children: { kind: "nodes", children: [{ id: "bad-t", text: "Go" }] } } });
  expect((await page.request.put(`/api/projects/${project}`, { data: { baseRevision: saved.revision, site: saved.site } })).status()).toBe(200);
  const response = await page.request.post(`/api/projects/${project}/publish`, { data: { name: `bad-${Date.now().toString(36)}` } });
  expect(response.status()).toBe(502);
  expect((await response.json()).error).toMatch(/javascript/);
});
