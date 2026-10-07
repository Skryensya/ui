import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * DECISION 35, measured rather than asserted from the markup: every layout rule that changes with width
 * asks its nearest query container, and the regions that change width (a Main, a Sidebar) are containers.
 * The symmetry gate proves both bindings write the same attributes (`layout/container-surface`,
 * `layout/app-shell`); this proves the stylesheet answers for the room an element has, not the window's.
 */

async function mount(page: Page, width: number, markup: string) {
  await page.setViewportSize({ width, height: 900 });
  await waitForStage(page);
  await page.evaluate((html) => {
    document.getElementById("container-host")?.remove();
    const host = document.createElement("div");
    host.id = "container-host";
    host.innerHTML = html;
    document.body.append(host);
  }, markup);
}

const box = (page: Page, selector: string) =>
  page.evaluate((query) => {
    const element = document.querySelector(query)!;
    const rect = element.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height), display: getComputedStyle(element).display };
  }, selector);

const lanes = (page: Page, selector: string) =>
  page.evaluate((query) => getComputedStyle(document.querySelector(query)!).gridTemplateColumns.split(" ").length, selector);

test("a Grid in a narrow Main counts the Main's room, not the window's", async ({ page }) => {
  await mount(
    page,
    1400,
    `<main class="sk-main" style="inline-size: 600px">
       <div id="grid" class="sk-grid" data-columns="4" data-responsive><span>a</span><span>b</span><span>c</span><span>d</span></div>
       <div id="wide" class="sk-inline" data-show="expanded">wide</div>
       <div id="narrow" class="sk-box" data-padding="sm" data-show="compact">narrow</div>
     </main>
     <div id="root-grid" class="sk-grid" data-columns="4" data-responsive><span>a</span><span>b</span><span>c</span><span>d</span></div>
     <div id="root-wide" class="sk-inline" data-show="expanded">wide</div>
     <div id="root-narrow" class="sk-box" data-padding="sm" data-show="compact">narrow</div>`,
  );
  /* 600px is past `compact` (36rem) and short of `desktop` (52rem): two lanes, at a window that holds four. */
  expect(await lanes(page, "#grid")).toBe(2);
  expect(await lanes(page, "#root-grid")).toBe(4);
  expect((await box(page, "#wide")).display).toBe("none");
  expect((await box(page, "#narrow")).display).not.toBe("none");
  expect((await box(page, "#root-wide")).display).not.toBe("none");
  expect((await box(page, "#root-narrow")).display).toBe("none");
});

test("uneven columns are a span of even ones, and a span never conjures a lane", async ({ page }) => {
  await mount(
    page,
    1200,
    `<div id="grid" class="sk-grid" data-columns="3" data-gap="none" style="inline-size: 900px">
       <div id="two" data-span="2">two thirds</div><div id="one">one third</div>
     </div>
     <div id="small" class="sk-grid" data-columns="2" data-gap="none" style="inline-size: 900px">
       <div data-span="3">too wide</div>
     </div>`,
  );
  expect((await box(page, "#two")).width).toBe(600);
  expect((await box(page, "#one")).width).toBe(300);
  expect(await lanes(page, "#small")).toBe(2);
});

test("a Stack with justify spends the height its parent gives it", async ({ page }) => {
  await mount(
    page,
    1200,
    `<div style="display: grid; block-size: 400px">
       <div id="stack" class="sk-stack" data-justify="center"><p id="child" style="margin: 0; block-size: 100px">centred</p></div>
     </div>`,
  );
  const stack = await box(page, "#stack");
  const child = await box(page, "#child");
  expect(stack.height).toBe(400);
  expect(child.y - stack.y).toBe(150);
});

const SHELL = (scroll = "") => `
  <div id="shell" class="sk-app-shell" data-height="fit" ${scroll}>
    <header id="header" class="sk-navbar">Header</header>
    <aside id="start" class="sk-sidebar" data-side="start"><div class="sk-sidebar__content">Start</div></aside>
    <main id="main" class="sk-main"><p style="margin: 0; block-size: 1200px">Long content</p></main>
    <aside id="end" class="sk-sidebar" data-side="end"><div class="sk-sidebar__content">End</div></aside>
    <footer id="footer" class="sk-footer">Footer</footer>
  </div>`;

test("an expanded shell draws both rails beside the main, the end rail after it", async ({ page }) => {
  await mount(page, 1400, SHELL());
  const [start, main, end] = [await box(page, "#start"), await box(page, "#main"), await box(page, "#end")];
  expect(start.display).not.toBe("none");
  expect(start.x + start.width).toBeLessThanOrEqual(main.x);
  expect(end.x).toBeGreaterThanOrEqual(main.x + main.width);
  /* A page: the main is as tall as its content and the footer follows it. */
  expect(main.height).toBeGreaterThanOrEqual(1200);
  expect((await box(page, "#footer")).y).toBeGreaterThanOrEqual(main.y + main.height);
});

test("a compact shell is one column and draws no rail", async ({ page }) => {
  await mount(page, 600, SHELL());
  expect((await box(page, "#start")).display).toBe("none");
  expect((await box(page, "#end")).display).toBe("none");
  expect((await box(page, "#main")).width).toBe((await box(page, "#shell")).width);
});

test("regions keep the shell a screen tall and scroll the main inside it", async ({ page }) => {
  await mount(page, 1400, SHELL('data-scroll="regions" style="--sk-app-shell-block-size: 600px"').replace('data-height="fit" ', ""));
  expect((await box(page, "#shell")).height).toBe(600);
  const overflow = await page.evaluate(() => {
    const main = document.getElementById("main")!;
    return { style: getComputedStyle(main).overflowY, scrolls: main.scrollHeight > main.clientHeight };
  });
  expect(overflow).toEqual({ style: "auto", scrolls: true });
});
