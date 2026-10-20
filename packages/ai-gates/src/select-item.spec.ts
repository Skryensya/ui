import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { readComponentCss } from "./fixtures.js";

const selectCss = readComponentCss("select", import.meta.url);
const comboboxCss = readComponentCss("combobox", import.meta.url);
const scrollbarCss = readFileSync(new URL("../../core/css/patterns/scrollbar.css", import.meta.url), "utf8");

test("select keeps a long selected value on one line while option labels remain readable", async ({ page }) => {
  await page.setContent(`
    <style>
      :root {
        --color-bg-surface-sunken: #f2f2f2;
        --color-bg-surface-raised: #fff;
        --color-border-default: #888;
        --color-border-subtle: #ccc;
        --color-text-primary: #111;
        --color-text-disabled: #888;
        --color-action-disabled: #ddd;
        --space-inset-xs: 4px;
        --space-inset-sm: 8px;
        --space-inset-md: 12px;
        --space-inline-sm: 8px;
        --space-stack-xs: 4px;
        --size-control-md: 44px;
        --size-touch-target: 44px;
        --size-control-sm: 36px;
        --size-icon-md: 20px;
        --radius-control: 8px;
        --elevation-sunken: none;
        --elevation-wash-sunken: none;
        --elevation-raised: none;
        --elevation-wash-raised: none;
      }
      ${selectCss}
      .fixture { inline-size: 180px; font: 16px/24px system-ui; }
      .sk-select__content { --reference-width: 180px; --available-width: 180px; }
    </style>
    <div class="sk-select fixture">
      <button class="sk-select__trigger" type="button">
        <span class="sk-select__value">Abrechnungsbenachrichtigungseinstellungen</span>
        <span class="sk-select__indicator">⌄</span>
      </button>
      <ul class="sk-select__content">
        <li class="sk-select__item">
          <span class="sk-select__item-text">Abrechnungsbenachrichtigungseinstellungen</span>
          <span class="sk-select__item-indicator">✓</span>
        </li>
      </ul>
    </div>
  `);

  const label = page.locator(".sk-select__item-text");
  const state = await label.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    height: element.getBoundingClientRect().height,
    lineHeight: Number.parseFloat(getComputedStyle(element).lineHeight),
    whiteSpace: getComputedStyle(element).whiteSpace,
  }));

  expect(state.whiteSpace).not.toBe("nowrap");
  expect(state.height).toBeGreaterThan(state.lineHeight);
  expect(state.scrollWidth).toBeLessThanOrEqual(state.clientWidth);

  const value = await page.locator(".sk-select__value").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      height: element.getBoundingClientRect().height,
      lineHeight: parseFloat(style.lineHeight),
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      overflow: style.overflow,
      textOverflow: style.textOverflow,
    };
  });
  expect(value.height).toBe(value.lineHeight);
  expect(value.scrollWidth).toBeGreaterThan(value.clientWidth);
  expect(value.overflow).toBe("hidden");
  expect(value.textOverflow).toBe("ellipsis");
});

test("select controls shrink to their field at 200% text size", async ({ page }) => {
  await page.setContent(`
    <style>
      :root { font-size: 32px; --z-popover: 200; }
      ${selectCss}
      ${comboboxCss}
      .fixture { inline-size: 240px; }
    </style>
    <div class="fixture">
      <select class="sk-select-native"><option>International billing and security notifications</option></select>
      <div class="sk-select"><button class="sk-select__trigger">Owner</button></div>
      <div class="sk-combobox"><div class="sk-combobox__control"></div></div>
      <ul class="sk-select__content"></ul>
      <div class="sk-combobox__positioner">
        <div class="sk-combobox__content" data-state="open" style="--reference-width: 229px; --available-width: 288px"></div>
      </div>
    </div>
  `);

  const widths = await page.locator(".fixture").evaluate((fixture) => {
    const edge = fixture.getBoundingClientRect().right;
    return [...fixture.querySelectorAll(".sk-select-native, .sk-select, .sk-combobox")].map((child) => ({
      name: child.className,
      right: child.getBoundingClientRect().right,
      fits: child.getBoundingClientRect().right <= edge + 1,
    }));
  });

  expect(widths.every((item) => item.fits), JSON.stringify(widths)).toBe(true);
  expect(await page.locator(".sk-select__content").evaluate((element) => getComputedStyle(element).zIndex)).toBe("200");
  const panel = await page.locator(".sk-combobox__content").evaluate((element) => {
    const style = getComputedStyle(element);
    return { width: style.width, minWidth: style.minInlineSize, maxWidth: style.maxInlineSize, zIndex: style.zIndex };
  });
  expect(panel).toEqual({ width: "229px", minWidth: "229px", maxWidth: "288px", zIndex: "200" });
});

test("select popup fits the available width when the trigger is wider than the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 600 });
  await page.setContent(`
    <style>
      ${selectCss}
      body { margin: 0; }
      .sk-select__positioner { position: fixed; inset: 8px auto auto 8px; }
      .sk-select__content {
        --reference-width: 320px;
        --available-width: 293px;
        --available-height: 240px;
        --sk-select-content-max-block-size: 240px;
      }
    </style>
    <div class="sk-select__positioner">
      <ul class="sk-select__content sk-scrollbar">
        <li class="sk-select__item">A long select option that still needs to fit in the available viewport</li>
      </ul>
    </div>
  `);

  const state = await page.evaluate(() => ({
    right: document.querySelector(".sk-select__content")!.getBoundingClientRect().right,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(state.right).toBeLessThanOrEqual(320);
  expect(state.documentWidth).toBeLessThanOrEqual(320);
});

for (const direction of ["ltr", "rtl"]) {
test(`select popup clips and spaces the kit scrollbar in ${direction}`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.setContent(`
    <style>
      :root {
        --color-bg-surface-raised: #fff;
        --color-bg-surface-sunken: #eee;
        --color-border-subtle: #ccc;
        --color-border-strong: #555;
        --color-text-tertiary: #777;
        --color-text-primary: #111;
        --space-inset-xs: 4px;
        --space-inset-sm: 8px;
        --radius-control: 8px;
        --elevation-raised: none;
        --elevation-wash-raised: none;
      }
      ${scrollbarCss}
      ${selectCss}
      body { margin: 0; font: 16px/24px system-ui; direction: ${direction}; }
      .sk-select__positioner {
        --reference-width: 220px;
        --available-width: 220px;
        --available-height: 128px;
        --sk-select-content-max-block-size: 128px;
      }
    </style>
    <div class="sk-scrollbar" data-testid="scrollbar-reference" style="position:fixed;visibility:hidden;inline-size:100px;block-size:32px;overflow:auto">
      <div style="block-size:100px"></div>
    </div>
    <div style="height: 500px"></div>
    <div class="sk-select__positioner">
      <div class="sk-select__panel">
        <ul class="sk-select__content sk-scrollbar" data-state="open">
          ${Array.from({ length: 40 }, (_, i) => `<li class="sk-select__item">Option ${i + 1}</li>`).join("")}
        </ul>
      </div>
    </div>
    <div style="height: 1000px"></div>
  `);

  const list = page.locator(".sk-select__content");
  await list.evaluate((element) => { element.scrollTop = 0; });
  await page.evaluate(() => window.scrollTo(0, 300));
  await list.hover();
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, -160);
  await page.waitForTimeout(100);

  expect(before).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  await page.mouse.wheel(0, 160);
  await expect.poll(() => list.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  expect(await list.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  const [kitScrollbar, selectScrollbar] = await page.locator('[data-testid="scrollbar-reference"], .sk-select__content').evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element);
      return {
        width: style.scrollbarWidth,
        color: style.scrollbarColor,
        gutter: element.getBoundingClientRect().width - element.clientWidth - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth),
      };
    }),
  );
  expect(selectScrollbar).toEqual(kitScrollbar);
  expect(selectScrollbar.width).toBe("thin");
  const panel = await page.locator(".sk-select__panel").evaluate((element) => {
    const style = getComputedStyle(element);
    return { overflow: style.overflow, radius: style.borderRadius };
  });
  expect(panel).toEqual({ overflow: "hidden", radius: "8px" });
  const spacing = await list.evaluate((element) => {
    const frame = element.parentElement!;
    const item = element.firstElementChild!;
    const frameStyle = getComputedStyle(frame);
    const frameRect = frame.getBoundingClientRect();
    const listRect = element.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const listStyle = getComputedStyle(element);
    return listStyle.direction === "rtl"
      ? {
          start: frameRect.right - parseFloat(frameStyle.borderRightWidth) - itemRect.right,
          end: listRect.left - frameRect.left - parseFloat(frameStyle.borderLeftWidth),
          itemToTrack: itemRect.left - listRect.right + parseFloat(listStyle.borderRightWidth) + element.clientWidth,
        }
      : {
          start: itemRect.left - frameRect.left - parseFloat(frameStyle.borderLeftWidth),
          end: frameRect.right - parseFloat(frameStyle.borderRightWidth) - listRect.right,
          itemToTrack: listRect.left + element.clientLeft + element.clientWidth - itemRect.right,
        };
  });
  expect(spacing).toEqual({ start: 4, end: 0, itemToTrack: 4 });
  const trackInsets = await list.evaluate((element) => {
    const frame = element.parentElement!;
    const style = getComputedStyle(frame);
    const frameRect = frame.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top - frameRect.top - parseFloat(style.borderTopWidth),
      bottom: frameRect.bottom - parseFloat(style.borderBottomWidth) - rect.bottom,
    };
  });
  expect(trackInsets).toEqual({ top: 0, bottom: 0 });
  await list.evaluate((element) => { element.dataset.state = "closed"; });
  await expect(page.locator(".sk-select__panel")).toBeHidden();
});
}

test("native select keeps the platform scrollbar without changing platform selection", async ({ page }) => {
  await page.setContent(`
    <style>
      :root {
        --radius-control: 16px;
        --space-inset-xs: 4px;
        --space-inset-md: 12px;
        --size-control-md: 44px;
        --size-touch-target: 44px;
        --size-control-sm: 36px;
        --size-icon-md: 20px;
        --color-border-default: #888;
        --elevation-wash-sunken: none;
        --elevation-sunken: none;
      }
      ${scrollbarCss}
      ${selectCss}
      form { inline-size: 220px; font: 16px/24px system-ui; }
    </style>
    <form>
      <select name="plan" class="sk-select-native" aria-label="Plan">
        <button type="button"><selectedcontent></selectedcontent></button>
        ${Array.from({ length: 40 }, (_, i) => `<option value="${i}">${i ? `Option ${i + 1}` : "International billing and security notifications ".repeat(3)}</option>`).join("")}
      </select>
    </form>
  `);

  const select = page.getByRole("combobox", { name: "Plan" });
  /* The kit's `scrollbar-color`/`thin` treatment can't be clipped to the picker's own
   * border-radius (Chrome never clips a classic scrollbar to it, and this top-layer surface has
   * no inner wrapper to apply the enhanced select's panel/content split to), so the picker keeps
   * the platform's own scrollbar instead of fighting a corner it can't win. */
  expect(await select.evaluate((element) => getComputedStyle(element, "::picker(select)").scrollbarWidth)).toBe("auto");
  const selected = await select.locator("selectedcontent").evaluate((element) => {
    const control = element.closest("select")!;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const controlRect = control.getBoundingClientRect();
    const iconWidth = parseFloat(getComputedStyle(control, "::picker-icon").width);
    return {
      lines: rect.height / parseFloat(style.lineHeight),
      clipped: element.scrollWidth > element.clientWidth,
      overflow: style.overflow,
      textOverflow: style.textOverflow,
      staysInside: rect.left >= controlRect.left && rect.right + iconWidth <= controlRect.right,
      controlOverflow: control.scrollHeight > control.clientHeight,
    };
  });
  expect(selected).toEqual({
    lines: 1, clipped: true, overflow: "hidden", textOverflow: "ellipsis", staysInside: true, controlOverflow: false,
  });
  await select.evaluate((element: HTMLSelectElement) => element.showPicker());
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(select).toHaveValue("39");
  expect(await page.locator("form").evaluate((form: HTMLFormElement) => new FormData(form).get("plan"))).toBe("39");
});
