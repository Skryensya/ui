import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
const shoot = async (url, sel, out, act) => {
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  const el = p.locator(sel).first();
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(3000);
  if (act) await act(el);
  await el.screenshot({ path: out });
};
await p.goto("http://localhost:4173/es/componentes/charts", { waitUntil: "networkidle" }); await p.waitForTimeout(4000);
await shoot("http://localhost:4173/es/componentes/charts", '#linea ~ .sk-preview-section', "/tmp/shot-line.png");
await shoot("http://localhost:4173/es/vaul", '.sk-preview-section[aria-label]', "/tmp/shot-vaul.png", async (el) => {
  const frame = await (await el.locator("iframe").elementHandle()).contentFrame();
  await frame.locator("button").first().click(); await p.waitForTimeout(1500);
});
await shoot("http://localhost:4173/es/componentes/user-select", '.sk-preview-section[aria-label="UserSelect (loading)"]', "/tmp/shot-us-loading.png", async (el) => {
  const frame = await (await el.locator("iframe").elementHandle()).contentFrame();
  await frame.locator("[data-sk-select-trigger]").first().click(); await p.waitForTimeout(1500);
});
await b.close();
