import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * SPLIT BUTTON APPEARANCE: the halves carry Button's appearance; the group decides the one shadow.
 * Tactile keeps each half's ledge, brutalist casts one hard offset around the whole pill.
 */

const group = (id: string, appearance: string, variant = "solid") => `
  <div id="${id}" class="sk-split-button" role="group">
    <button class="sk-button sk-interactive" type="button" data-variant="${variant}" data-tone="accent" data-appearance="${appearance}" data-weld-end>Guardar</button>
    <div class="sk-menu"><button class="sk-button sk-interactive" type="button" data-variant="${variant}" data-tone="accent" data-appearance="${appearance}" data-weld-start data-icon-only aria-label="Más">▾</button></div>
  </div>`;

const verticalGroup = (id: string, appearance: string) => `
  <div id="${id}" class="sk-split-button" role="group" data-orientation="vertical">
    <button class="sk-button sk-interactive" type="button" data-appearance="${appearance}">Zoom in</button>
    <button class="sk-button sk-interactive" type="button" data-appearance="${appearance}">Zoom out</button>
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

test("brutalist split group offset follows soft and ghost button emphasis", async ({ page }) => {
  await mount(page, group("soft", "brutalist", "soft") + group("ghost", "brutalist", "ghost"));
  expect((await shadows(page, "soft")).group).toMatch(/4px 4px 0px/);
  expect((await shadows(page, "ghost")).group).toMatch(/2px 2px 0px/);
});

test("brutalist press travels only the active split segment", async ({ page }) => {
  await mount(page, group("split-brutal-press", "brutalist"));

  const client = await page.context().newCDPSession(page);
  await client.send("DOM.enable");
  await client.send("CSS.enable");
  const { root: documentRoot } = await client.send("DOM.getDocument");
  const { nodeId } = await client.send("DOM.querySelector", {
    nodeId: documentRoot.nodeId,
    selector: "#split-brutal-press > button",
  });
  await client.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: ["active"] });
  await page.waitForTimeout(250);

  const active = await page.evaluate(() => {
    const root = document.getElementById("split-brutal-press")!;
    const [action, trigger] = Array.from(root.querySelectorAll("button"));
    return {
      groupTranslate: getComputedStyle(root).translate,
      actionTranslate: getComputedStyle(action!).translate,
      actionShadow: getComputedStyle(action!).boxShadow,
      triggerTranslate: getComputedStyle(trigger!).translate,
      travel: getComputedStyle(action!).getPropertyValue("--brutalist-travel").trim(),
      sourceOffsetInline: getComputedStyle(action!).getPropertyValue("--sk-button-brutalist-offset-inline").trim(),
    };
  });
  expect(active.groupTranslate).toBe("none");
  expect(active.travel).toBe("0.8");
  expect(active.sourceOffsetInline).not.toBe("0px");
  expect(active.actionShadow).toMatch(/1px 1px 0px/);
  expect(active.triggerTranslate).toBe("none");
});

test("vertical brutalist split keeps a hard shadow on both actions", async ({ page }) => {
  await mount(page, verticalGroup("v", "brutalist"));
  const s = await page.evaluate(() => {
    const [first, second] = Array.from(document.querySelectorAll<HTMLButtonElement>("#v > button"));
    return {
      first: getComputedStyle(first!).boxShadow,
      second: getComputedStyle(second!).boxShadow,
    };
  });
  expect(s.first).toMatch(/5px 5px 0px/);
  expect(s.second).toMatch(/5px 5px 0px/);
});

test("forced colors: no group shadow in any appearance", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await mount(page, group("t", "tactile") + group("b", "brutalist"));
  expect((await shadows(page, "t")).group).toBe("none");
  expect((await shadows(page, "b")).group).toBe("none");
  await page.emulateMedia({ forcedColors: null });
});
