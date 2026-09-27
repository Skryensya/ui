import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * DECISION 30, measured rather than asserted from the markup: the plain spacing option is what a
 * phone gets, the `-desktop` one is what a screen at or past the `desktop` breakpoint (52rem) gets,
 * and a layout that declared no desktop side keeps its phone value at every width. The symmetry
 * gate proves both bindings write the same attributes; this proves the stylesheet reads them.
 */

const MARKUP = `
  <div id="wrapper" class="sk-wrapper" data-size="md" data-gutter="sm" data-gutter-desktop="xl">
    <div id="box" class="sk-box" data-padding="sm" data-padding-desktop="xl" data-surface="raised">
      <div id="stack" class="sk-stack" data-gap="xs" data-gap-desktop="xl"><p>a</p><p>b</p></div>
      <div id="inline" class="sk-inline" data-gap="xs" data-gap-desktop="lg"><span>a</span><span>b</span></div>
      <div id="grid" class="sk-grid" data-gap="xs" data-gap-desktop="lg"><span>a</span></div>
    </div>
    <div id="hero" class="sk-hero" data-padding="sm" data-padding-desktop="xl"><h2>Hero</h2></div>
    <footer id="footer" class="sk-footer" data-padding="lg" data-padding-desktop="xl">Footer</footer>
    <footer id="footer-undeclared" class="sk-footer" data-padding="lg">Footer</footer>
    <div id="box-undeclared" class="sk-box" data-padding="sm">Plain</div>
  </div>
`;

async function measure(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await waitForStage(page);
  await page.evaluate((markup) => {
    document.getElementById("declared-spacing-host")?.remove();
    const host = document.createElement("div");
    host.id = "declared-spacing-host";
    host.innerHTML = markup;
    document.body.append(host);
  }, MARKUP);
  return page.evaluate(() => {
    const cs = (id: string) => getComputedStyle(document.getElementById(id)!);
    /* The token each step resolves to, read off a real property (custom properties only resolve
     * where they are used; decision 1's trap). */
    const probe = document.createElement("div");
    document.body.append(probe);
    const token = (name: string) => {
      probe.style.paddingLeft = `var(${name})`;
      return getComputedStyle(probe).paddingLeft;
    };
    const tokens = {
      insetSm: token("--space-inset-sm"),
      insetLg: token("--space-inset-lg"),
      insetXl: token("--space-inset-xl"),
      insetMd: token("--space-inset-md"),
      stackXs: token("--space-stack-xs"),
      stackXl: token("--space-stack-xl"),
      stackLg: token("--space-stack-lg"),
      inlineXs: token("--space-inline-xs"),
      inlineLg: token("--space-inline-lg"),
    };
    probe.remove();
    return {
      tokens,
      wrapper: cs("wrapper").paddingLeft,
      box: cs("box").paddingLeft,
      stack: cs("stack").rowGap,
      inline: cs("inline").columnGap,
      grid: cs("grid").rowGap,
      hero: cs("hero").paddingLeft,
      footer: cs("footer").paddingLeft,
      footerUndeclared: cs("footer-undeclared").paddingLeft,
      boxUndeclared: cs("box-undeclared").paddingLeft,
    };
  });
}

test("a phone gets the plain spacing option, however the desktop side is declared", async ({ page }) => {
  const m = await measure(page, 390);
  expect(m.wrapper).toBe(m.tokens.insetSm);
  expect(m.box).toBe(m.tokens.insetSm);
  expect(m.stack).toBe(m.tokens.stackXs);
  expect(m.inline).toBe(m.tokens.inlineXs);
  expect(m.grid).toBe(m.tokens.stackXs);
  expect(m.hero).toBe(m.tokens.insetSm);
  /* Declared: `lg` means `lg` on the phone too. Undeclared: Footer's own phone step-down still
   * applies, so no existing footer moves. */
  expect(m.footer).toBe(m.tokens.insetLg);
  expect(m.footerUndeclared).toBe(m.tokens.insetMd);
});

test("from the desktop breakpoint up the declared desktop side replaces it", async ({ page }) => {
  const m = await measure(page, 1280);
  expect(m.wrapper).toBe(m.tokens.insetXl);
  expect(m.box).toBe(m.tokens.insetXl);
  expect(m.stack).toBe(m.tokens.stackXl);
  expect(m.inline).toBe(m.tokens.inlineLg);
  expect(m.grid).toBe(m.tokens.stackLg);
  expect(m.hero).toBe(m.tokens.insetXl);
  expect(m.footer).toBe(m.tokens.insetXl);
  /* Nothing declared, nothing changes: the plain value holds on a wide screen too. */
  expect(m.boxUndeclared).toBe(m.tokens.insetSm);
});

test("the switch sits exactly on the desktop breakpoint", async ({ page }) => {
  /* 52rem at the default 16px root is 832px: one pixel under is still the phone value. */
  const below = await measure(page, 831);
  expect(below.box).toBe(below.tokens.insetSm);
  const at = await measure(page, 832);
  expect(at.box).toBe(at.tokens.insetXl);
});
