import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * SPLIT BUTTON APPEARANCE: the halves carry Button's appearance; the group decides the one shadow.
 * Tactile keeps each half's ledge, brutalist casts one hard offset around the whole pill.
 */

const group = (id: string, appearance: string) => `
  <div id="${id}" class="sk-split-button" role="group">
    <button class="sk-button sk-interactive" type="button" data-tone="accent" data-appearance="${appearance}" data-weld-end>Guardar</button>
    <div class="sk-menu"><button class="sk-button sk-interactive" type="button" data-tone="accent" data-appearance="${appearance}" data-weld-start data-icon-only aria-label="Más">▾</button></div>
  </div>`;

async function mount(page: Page, html: string, hostAttrs: Record<string, string> = {}) {
  await page.evaluate(
    ({ html, hostAttrs }) => {
      document.getElementById("split-host")?.remove();
      const host = document.createElement("div");
      host.id = "split-host";
      host.style.cssText = "position:fixed;inset:0 auto auto 0;z-index:9999;padding:40px;display:flex;gap:40px;background:var(--color-bg-canvas)";
      for (const [k, v] of Object.entries(hostAttrs)) host.setAttribute(k, v);
      host.innerHTML = html;
      document.body.append(host);
    },
    { html, hostAttrs },
  );
  await page.waitForTimeout(300);
}

const shadows = (page: Page, id: string) =>
  page.evaluate((id) => {
    const root = document.getElementById(id)!;
    const [action, trigger] = Array.from(root.querySelectorAll("button"));
    return {
      group: getComputedStyle(root).boxShadow,
      action: getComputedStyle(action!).boxShadow,
      trigger: getComputedStyle(trigger!).boxShadow,
      seam: getComputedStyle(trigger!).borderInlineStartColor,
      edge: getComputedStyle(trigger!).borderBlockEndColor,
    };
  }, id);

test.beforeEach(async ({ page }) => {
  await waitForStage(page);
});

test("plain keeps one soft group shadow and clears the halves'", async ({ page }) => {
  await mount(page, group("g", "plain"));
  const s = await shadows(page, "g");
  expect(s.group).not.toBe("none");
  expect(s.action).toBe("none");
  expect(s.trigger).toBe("none");
});

test("tactile: each half keeps its ledge, and the group drops its soft shadow", async ({ page }) => {
  await mount(page, group("g", "tactile"));
  const s = await shadows(page, "g");
  expect(s.group).toBe("none");
  expect(s.action).toMatch(/0px 5px 0px/);
  expect(s.trigger).toMatch(/0px 5px 0px/);
});

test("brutalist: one hard offset around the whole pill, a black seam, mirrored in RTL", async ({ page }) => {
  await mount(page, group("g", "brutalist"));
  const s = await shadows(page, "g");
  expect(s.group).toMatch(/5px 5px 0px/);
  expect(s.action).toBe("none");
  expect(s.trigger).toBe("none");
  expect(s.seam).toBe(s.edge);

  await mount(page, group("r", "brutalist"), { dir: "rtl" });
  expect((await shadows(page, "r")).group).toMatch(/-5px 5px 0px/);
});

test("forced colors: no group shadow in any appearance", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await mount(page, group("t", "tactile") + group("b", "brutalist"));
  expect((await shadows(page, "t")).group).toBe("none");
  expect((await shadows(page, "b")).group).toBe("none");
  await page.emulateMedia({ forcedColors: null });
});
