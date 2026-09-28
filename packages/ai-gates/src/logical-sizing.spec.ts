import { expect, test } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * The three sizing decisions the Maker exposes (decision 31), measured rather than read off the
 * markup: a Grid with `minColumn` counts its lanes from its OWN width, an Inline child with
 * `data-sizing="fill"` takes what the row leaves, and a Box with `measure` stops growing at the
 * Wrapper's scale without centring. The symmetry gate proves both bindings write the attributes;
 * this proves the stylesheet reads them.
 */

const MARKUP = `
  <div id="wide" style="inline-size: 1000px">
    <div id="grid-wide" class="sk-grid" data-columns="1" data-gap="none" data-min-column="md">
      <span>a</span><span>b</span><span>c</span><span>d</span>
    </div>
  </div>
  <div id="narrow" style="inline-size: 400px">
    <div id="grid-narrow" class="sk-grid" data-columns="1" data-gap="none" data-min-column="md">
      <span>a</span><span>b</span><span>c</span><span>d</span>
    </div>
    <div id="grid-tiny" style="inline-size: 150px">
      <div class="sk-grid" data-columns="1" data-gap="none" data-min-column="lg"><span id="tiny-cell">a</span></div>
    </div>
  </div>
  <div style="inline-size: 600px">
    <div id="row" class="sk-inline" data-gap="none" data-wrap="true">
      <span id="fill" data-sizing="fill">field</span><button id="fit">Go</button>
    </div>
  </div>
  <div style="inline-size: 2000px">
    <div id="measured" class="sk-box" data-measure="sm">Reading measure</div>
  </div>
`;

test("a Grid with minColumn counts its lanes from its own width, not the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await waitForStage(page);
  await page.evaluate((markup) => {
    const host = document.createElement("div");
    host.innerHTML = markup;
    document.body.append(host);
  }, MARKUP);

  const m = await page.evaluate(() => {
    const lanes = (id: string) => getComputedStyle(document.getElementById(id)!).gridTemplateColumns.split(" ").length;
    const px = (probe: string) => {
      const el = document.createElement("div");
      el.style.inlineSize = `var(${probe})`;
      document.body.append(el);
      const value = el.getBoundingClientRect().width;
      el.remove();
      return value;
    };
    const width = (id: string) => document.getElementById(id)!.getBoundingClientRect().width;
    return {
      wide: lanes("grid-wide"),
      narrow: lanes("grid-narrow"),
      tiny: width("tiny-cell"),
      fill: width("fill"),
      fit: width("fit"),
      measured: width("measured"),
      measuredLeft: document.getElementById("measured")!.getBoundingClientRect().left,
      measuredParentLeft: document.getElementById("measured")!.parentElement!.getBoundingClientRect().left,
      wrapperSm: px("--size-wrapper-sm"),
      columnMd: px("--size-column-md"),
    };
  });

  /* 1000px over an 18rem (288px) floor fits three lanes; 400px fits one. Same viewport. */
  expect(m.columnMd).toBe(288);
  expect(m.wide).toBe(3);
  expect(m.narrow).toBe(1);
  /* `min(X, 100%)`: a container narrower than the floor keeps one lane and never overflows. */
  expect(m.tiny).toBe(150);
  /* `fill` takes the row minus the button; the button keeps its content size. */
  expect(Math.round(m.fill + m.fit)).toBe(600);
  expect(m.fill).toBeGreaterThan(m.fit);
  /* A ceiling, not a centred column: the Box stops at the token and stays where the flow put it. */
  expect(m.measured).toBe(m.wrapperSm);
  expect(m.measuredLeft).toBe(m.measuredParentLeft);
});
