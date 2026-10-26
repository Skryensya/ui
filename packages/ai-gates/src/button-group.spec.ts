import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * BUTTON GROUP: the group welds its members by DOM position (corners, one shared seam column) and
 * decides the one shadow. Members carry no weld attribute. A split button is a group of a Button
 * and a Menu; the shadcn cases (orientation, size, nested, separator, input, select, popover,
 * text, RTL) each get a geometry check below.
 */

const btn = (attrs = "", label = "Guardar", appearance = "plain", variant = "solid") =>
  `<button class="sk-button sk-interactive" type="button" data-variant="${variant}" data-tone="accent" data-appearance="${appearance}" ${attrs}>${label}</button>`;

const menu = (attrs = "", appearance = "plain", variant = "solid") =>
  `<div class="sk-menu">${btn(`data-icon-only aria-label="Más" ${attrs}`, "▾", appearance, variant)}</div>`;

const group = (id: string, appearance: string, variant = "solid") => `
  <div id="${id}" class="sk-button-group" role="group" data-orientation="horizontal">
    ${btn("", "Guardar", appearance, variant)}
    ${menu("", appearance, variant)}
  </div>`;

const verticalGroup = (id: string, appearance: string) => `
  <div id="${id}" class="sk-button-group" role="group" data-orientation="vertical">
    <button class="sk-button sk-interactive" type="button" data-appearance="${appearance}">Zoom in</button>
    <button class="sk-button sk-interactive" type="button" data-appearance="${appearance}">Zoom out</button>
  </div>`;

async function mount(page: Page, html: string, hostAttrs: Record<string, string> = {}) {
  await page.evaluate(
    ({ html, hostAttrs }) => {
      document.getElementById("group-host")?.remove();
      const host = document.createElement("div");
      host.id = "group-host";
      host.style.cssText = "position:fixed;inset:0 auto auto 0;z-index:9999;padding:40px;display:flex;flex-wrap:wrap;gap:40px;background:var(--color-bg-canvas)";
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

/** Physical corners, as numbers, and the box: what a reader actually sees. */
const shape = (page: Page, selector: string) =>
  page.evaluate((selector) => {
    const el = document.querySelector<HTMLElement>(selector)!;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tl: Number.parseFloat(cs.borderTopLeftRadius),
      tr: Number.parseFloat(cs.borderTopRightRadius),
      bl: Number.parseFloat(cs.borderBottomLeftRadius),
      br: Number.parseFloat(cs.borderBottomRightRadius),
      left: r.left,
      right: r.right,
      top: r.top,
      bottom: r.bottom,
    };
  }, selector);

const round = (s: { tl: number; tr: number; bl: number; br: number }) => ({
  left: s.tl > 0 && s.bl > 0,
  right: s.tr > 0 && s.br > 0,
  top: s.tl > 0 && s.tr > 0,
  bottom: s.bl > 0 && s.br > 0,
});

test.beforeEach(async ({ page }) => {
  await waitForStage(page);
});

/* ── THE WELD ─────────────────────────────────────────────────────────────────────────────────── */

test("horizontal: outer corners stay round, inner ones square, each seam is one shared column", async ({ page }) => {
  await mount(
    page,
    `<div class="sk-button-group" role="group" data-orientation="horizontal">
      ${btn('id="a"', "Archive", "plain", "soft")}${btn('id="b"', "Report", "plain", "soft")}${btn('id="c"', "Snooze", "plain", "soft")}
    </div>`,
  );
  const [a, b, c] = await Promise.all(["#a", "#b", "#c"].map((s) => shape(page, s)));
  expect(round(a!)).toMatchObject({ left: true, right: false });
  expect(b).toMatchObject({ tl: 0, tr: 0, bl: 0, br: 0 });
  expect(round(c!)).toMatchObject({ left: false, right: true });
  expect(b!.left).toBeCloseTo(a!.right - 1, 1);
  expect(c!.left).toBeCloseTo(b!.right - 1, 1);
});

test("vertical: the block-axis corners weld instead", async ({ page }) => {
  await mount(page, verticalGroup("v", "plain").replace(">Zoom in", ' id="up">Zoom in').replace(">Zoom out", ' id="down">Zoom out'));
  const up = await shape(page, "#up");
  const down = await shape(page, "#down");
  expect(round(up)).toMatchObject({ top: true, bottom: false });
  expect(round(down)).toMatchObject({ top: false, bottom: true });
  expect(down.top).toBeCloseTo(up.bottom - 1, 1);
});

test("RTL: the logical start is the right edge", async ({ page }) => {
  await mount(page, `<div class="sk-button-group" role="group">${btn('id="first"', "أرشفة")}${btn('id="last"', "تأجيل")}</div>`, { dir: "rtl" });
  const first = await shape(page, "#first");
  const last = await shape(page, "#last");
  expect(round(first)).toMatchObject({ right: true, left: false });
  expect(round(last)).toMatchObject({ left: true, right: false });
  expect(first.left).toBeCloseTo(last.right - 1, 1);
});

test("faces: Input, Select, NativeSelect, Popover and ButtonGroupText weld; inner Buttons do not", async ({ page }) => {
  await mount(
    page,
    `<div class="sk-button-group" role="group">
      <span id="text" class="sk-button-group__text">https://</span>
      <input id="input" class="sk-input" aria-label="URL" />
      <div id="select-root" class="sk-select"><div class="sk-select__control"><button id="select" class="sk-select__trigger" type="button">USD</button></div></div>
      <select id="native" class="sk-select-native" aria-label="Moneda"><option>CLP</option></select>
      <div class="sk-popover">
        ${btn('id="pop" data-icon-only aria-label="Copilot"', "▾")}
        <div class="sk-popover__panel">${btn('id="close"', "Cerrar")}</div>
      </div>
    </div>`,
  );
  expect(round(await shape(page, "#text"))).toMatchObject({ left: true, right: false });
  for (const id of ["#input", "#select", "#native"]) expect(await shape(page, id), id).toMatchObject({ tl: 0, tr: 0, bl: 0, br: 0 });
  expect(await page.locator("#select-root").evaluate((el) => getComputedStyle(el).minInlineSize)).toBe("0px");
  expect(round(await shape(page, "#pop"))).toMatchObject({ left: false, right: true });
  // A Button inside a member's own panel is not a face: it keeps every corner.
  expect(round(await shape(page, "#close"))).toEqual({ left: true, right: true, top: true, bottom: true });
});

test("separator: lies on both neighbours' borders, one line instead of three", async ({ page }) => {
  await mount(
    page,
    `<div class="sk-button-group" role="group">${btn('id="a"', "Copiar")}<span id="sep" class="sk-button-group__separator" aria-hidden="true"></span>${btn('id="b"', "Pegar")}</div>`,
  );
  const a = await shape(page, "#a");
  const sep = await shape(page, "#sep");
  const b = await shape(page, "#b");
  expect(sep.right - sep.left).toBeCloseTo(1, 1);
  expect(sep.left).toBeCloseTo(a.right - 1, 1);
  expect(b.left).toBeCloseTo(sep.left, 1);
  expect(round(a)).toMatchObject({ right: false });
  expect(round(b)).toMatchObject({ left: false });
});

test("nested: a group of groups gaps them apart and welds only inside each", async ({ page }) => {
  await mount(
    page,
    `<div id="outer" class="sk-button-group" role="group">
      <div class="sk-button-group" role="group">${btn('id="a1"', "1")}${btn('id="a2"', "2")}</div>
      <div class="sk-button-group" role="group">${btn('id="b1"', "‹")}</div>
    </div>`,
  );
  const a2 = await shape(page, "#a2");
  const b1 = await shape(page, "#b1");
  expect(b1.left - a2.right).toBeGreaterThan(4);
  expect(round(a2)).toMatchObject({ left: false, right: true });
  // b1 is alone in its group: round on both sides, untouched by the outer row.
  expect(round(b1)).toMatchObject({ left: true, right: true });
  expect(await page.evaluate(() => getComputedStyle(document.getElementById("outer")!).boxShadow)).toBe("none");
});

test("size: every member keeps its own size, and the group stays one row", async ({ page }) => {
  await mount(
    page,
    ["sm", "md", "lg"]
      .map((size) => `<div class="sk-button-group" role="group">${btn(`id="${size}-a" data-size="${size}"`, "Uno")}${btn(`id="${size}-b" data-size="${size}" data-icon-only aria-label="Más"`, "+")}</div>`)
      .join(""),
  );
  for (const size of ["sm", "md", "lg"]) {
    const a = await shape(page, `#${size}-a`);
    const b = await shape(page, `#${size}-b`);
    expect(b.top, size).toBeCloseTo(a.top, 1);
    expect(b.bottom, size).toBeCloseTo(a.bottom, 1);
  }
  const sm = await shape(page, "#sm-a");
  const lg = await shape(page, "#lg-a");
  expect(lg.bottom - lg.top).toBeGreaterThan(sm.bottom - sm.top);
});

test("a member does not squeeze on press: its welded edge would pull off the seam", async ({ page }) => {
  await mount(page, `${group("g", "plain")}${btn('id="alone"', "Solo")}`);
  const client = await page.context().newCDPSession(page);
  await client.send("DOM.enable");
  await client.send("CSS.enable");
  const { root } = await client.send("DOM.getDocument");
  for (const selector of ["#g > button", "#g .sk-menu > button", "#alone"]) {
    const { nodeId } = await client.send("DOM.querySelector", { nodeId: root.nodeId, selector });
    await client.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: ["active"] });
  }
  await page.waitForTimeout(250);
  const scales = await page.evaluate(() =>
    ["#g > button", "#g .sk-menu > button", "#alone"].map((s) => getComputedStyle(document.querySelector(s)!).scale),
  );
  expect(scales[0]).toBe("none");
  expect(scales[1]).toBe("none");
  expect(scales[2]).not.toBe("none");
});

/* ── WORST CASE (break-ui) ───────────────────────────────────────────────────────────────────── */

const labelled = (attrs: string, label: string) =>
  `<button class="sk-button sk-interactive" type="button" data-variant="soft" ${attrs}><span class="sk-button__label">${label}</span></button>`;

const box = (width: number, html: string) => `<div id="box" style="inline-size:${width}px">${html}</div>`;

const overflows = (page: Page) =>
  page.evaluate(() => {
    const limit = document.getElementById("box")!.getBoundingClientRect().right + 0.5;
    return Array.from(document.querySelectorAll<HTMLElement>("#box .sk-button-group *"))
      .filter((el) => el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().right > limit)
      .map((el) => el.className);
  });

test("long labels in a narrow container end in an ellipsis; the split chevron stays square", async ({ page }) => {
  await mount(
    page,
    box(
      320,
      `<div class="sk-button-group" role="group">${labelled('id="long"', "Export international billing reconciliation")}<div class="sk-menu">${labelled('id="chev" data-icon-only aria-label="Más"', "▾")}</div></div>`,
    ),
  );
  expect(await overflows(page)).toEqual([]);
  const label = await page.evaluate(() => {
    const el = document.querySelector<HTMLElement>("#long .sk-button__label")!;
    return { overflow: getComputedStyle(el).textOverflow, clipped: el.scrollWidth > el.clientWidth };
  });
  expect(label).toEqual({ overflow: "ellipsis", clipped: true });
  const chev = await shape(page, "#chev");
  expect(chev.right - chev.left).toBeCloseTo(chev.bottom - chev.top, 0);
});

test("a long prefix gives way to the field, and a short one keeps its text when there is room", async ({ page }) => {
  await mount(
    page,
    box(320, `<div class="sk-button-group" role="group"><span class="sk-button-group__text">https://northwind-industries-holdings.example.com/</span><input class="sk-input" aria-label="Path"></div>`) +
      `<div class="sk-button-group" role="group"><span id="short" class="sk-button-group__text">https://</span><input class="sk-input" aria-label="Site"></div>`,
  );
  expect(await overflows(page)).toEqual([]);
  expect(await page.evaluate(() => { const el = document.getElementById("short")!; return el.scrollWidth <= el.clientWidth; })).toBe(true);
});

test("a member wrapped in a Tooltip welds like a bare one, and so does a Menu inside a Tooltip", async ({ page }) => {
  const tip = (inner: string) => `<span class="sk-tooltip"><span class="sk-tooltip__trigger">${inner}</span></span>`;
  await mount(
    page,
    `<div class="sk-button-group" role="group">${tip(btn('id="b" data-icon-only aria-label="Bold"', "B"))}${tip(btn('id="i" data-icon-only aria-label="Italic"', "I"))}${tip(`<div class="sk-menu">${btn('id="m" data-icon-only aria-label="Más"', "▾")}</div>`)}</div>`,
  );
  expect(round(await shape(page, "#b"))).toMatchObject({ left: true, right: false });
  expect(await shape(page, "#i")).toMatchObject({ tl: 0, tr: 0, bl: 0, br: 0 });
  expect(round(await shape(page, "#m"))).toMatchObject({ left: false, right: true });
});

test("a separator at an edge, or a hidden first member, leaves the outer corners round", async ({ page }) => {
  const sep = '<span class="sk-button-group__separator" aria-hidden="true"></span>';
  await mount(
    page,
    `<div class="sk-button-group" role="group">${sep}${btn('id="a"', "Copy")}${btn('id="b"', "Paste")}${sep}</div>` +
      `<div class="sk-button-group" role="group"><button id="h" class="sk-button" hidden>Hidden</button>${btn('id="v"', "Visible")}${btn('id="l"', "Last")}</div>`,
  );
  expect(round(await shape(page, "#a"))).toMatchObject({ left: true });
  expect(round(await shape(page, "#b"))).toMatchObject({ right: true });
  expect(await page.locator("#h").evaluate((el) => getComputedStyle(el).display)).toBe("none");
  expect(round(await shape(page, "#v"))).toMatchObject({ left: true, right: false });
  expect(await page.evaluate(() => Array.from(document.querySelectorAll("#group-host .sk-button-group__separator")).map((s) => getComputedStyle(s).display))).toEqual(["none", "none"]);
});

test("vertical: an icon member stretches to a wider labelled one, so no welded corner hangs", async ({ page }) => {
  await mount(
    page,
    `<div class="sk-button-group" role="group" data-orientation="vertical">${btn('id="wide"', "Acercar hasta el 400 %")}${btn('id="icon" data-icon-only aria-label="Alejar"', "−")}</div>`,
  );
  const wide = await shape(page, "#wide");
  const icon = await shape(page, "#icon");
  expect(icon.right - icon.left).toBeCloseTo(wide.right - wide.left, 0);
});

/* ── APPEARANCE ───────────────────────────────────────────────────────────────────────────────── */

test("plain keeps one soft group shadow and clears the members'", async ({ page }) => {
  await mount(page, group("g", "plain"));
  const s = await shadows(page, "g");
  expect(s.group).not.toBe("none");
  expect(s.action).toBe("none");
  expect(s.trigger).toBe("none");
});

test("tactile: each member keeps its ledge, and the group drops its soft shadow", async ({ page }) => {
  await mount(page, group("g", "tactile"));
  const s = await shadows(page, "g");
  expect(s.group).toBe("none");
  expect(s.action).toMatch(/0px 5px 0px/);
  expect(s.trigger).toMatch(/0px 5px 0px/);
});

test("brutalist: one hard offset around the whole group, a black seam, mirrored in RTL", async ({ page }) => {
  await mount(page, group("g", "brutalist"));
  const s = await shadows(page, "g");
  expect(s.group).toMatch(/5px 5px 0px/);
  // Every member but the last keeps its own shadow under the next one (uncovered when that one is
  // pressed, 4px so it fits the farthest the face travels); the last one has the group's.
  expect(s.action).toMatch(/4px 4px 0px/);
  expect(s.trigger).toBe("none");
  expect(s.seam).toBe(s.edge);

  await mount(page, group("r", "brutalist"), { dir: "rtl" });
  const r = await shadows(page, "r");
  expect(r.group).toMatch(/-5px 5px 0px/);
  expect(r.action).toMatch(/-4px 4px 0px/);
});

test("brutalist group offset follows soft and ghost button emphasis", async ({ page }) => {
  await mount(page, group("soft", "brutalist", "soft") + group("ghost", "brutalist", "ghost"));
  expect((await shadows(page, "soft")).group).toMatch(/4px 4px 0px/);
  expect((await shadows(page, "ghost")).group).toMatch(/2px 2px 0px/);
});

test("brutalist press travels only the active member", async ({ page }) => {
  await mount(page, group("brutal-press", "brutalist"));

  const client = await page.context().newCDPSession(page);
  await client.send("DOM.enable");
  await client.send("CSS.enable");
  const { root: documentRoot } = await client.send("DOM.getDocument");
  const { nodeId } = await client.send("DOM.querySelector", {
    nodeId: documentRoot.nodeId,
    selector: "#brutal-press > button",
  });
  await client.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: ["active"] });
  // The travel transitions; on a loaded machine 250ms can land mid-flight (0.9995px).
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.querySelector("#brutal-press > button")!).boxShadow))
    .toMatch(/1px 1px 0px/);

  const active = await page.evaluate(() => {
    const root = document.getElementById("brutal-press")!;
    const [action, trigger] = Array.from(root.querySelectorAll("button"));
    return {
      groupTranslate: getComputedStyle(root).translate,
      actionShadow: getComputedStyle(action!).boxShadow,
      triggerTranslate: getComputedStyle(trigger!).left,
      travel: getComputedStyle(action!).getPropertyValue("--brutalist-travel").trim(),
      sourceOffsetInline: getComputedStyle(action!).getPropertyValue("--sk-button-brutalist-offset-inline").trim(),
    };
  });
  expect(active.groupTranslate).toBe("none");
  expect(active.travel).toBe("0.8");
  expect(active.sourceOffsetInline).not.toBe("0px");
  expect(active.actionShadow).toMatch(/1px 1px 0px/);
  expect(active.triggerTranslate).toBe("0px");
});

test("frosted: one sheet, the two edges overlap on one column instead of doubling", async ({ page }) => {
  await mount(page, group("f", "frosted"));
  const a = await shape(page, "#f > button");
  const b = await shape(page, "#f .sk-menu > button");
  expect(b.left).toBeCloseTo(a.right - 1, 1);
});

test("vertical brutalist keeps a hard shadow on both actions", async ({ page }) => {
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
