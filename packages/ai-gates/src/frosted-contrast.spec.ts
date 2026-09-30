import { expect, test } from "@playwright/test";
import { waitForStage } from "./fixtures.js";
import { setScheme, TEXT_FLOOR, worstContrast } from "./frost-contrast.js";

/*
 * EVERY FROSTED SURFACE THAT CARRIES TEXT keeps it at 4.5:1 over a black and a white backdrop, in both
 * modes (frost-contrast.ts says why those two). Button has its own matrix in button-frosted.spec.ts;
 * this is everything else a reader has to read through the material: fields, overlays, chrome, cards.
 *
 * Each case names the INK (the element whose text is measured) and the SURFACE (the frosted element the
 * backdrop shows through); every background in between is stacked, so a selected tab is measured on its
 * own paint over the list's sheet, not on the sheet alone.
 */
type Case = { name: string; markup: string; ink: string; surface?: string };

const SECONDARY = 'style="color:var(--color-text-secondary)"';

const cases: Case[] = [
  // Fields: the value the reader typed.
  { name: "Input", markup: `<input id="input" class="sk-input" aria-label="Campo" value="Texto" data-appearance="frosted" style="inline-size:220px">`, ink: "#input" },
  { name: "Select", markup: `<div class="sk-select" data-appearance="frosted"><button id="select" class="sk-select__trigger" type="button" style="inline-size:200px">Elige</button></div>`, ink: "#select" },
  { name: "Combobox", markup: `<div class="sk-combobox" data-appearance="frosted"><div id="combobox" class="sk-combobox__control" style="inline-size:200px"><input aria-label="País" value="Chile"></div></div>`, ink: "#combobox" },
  { name: "NumberField", markup: `<div class="sk-number-field" data-appearance="frosted"><div id="number" class="sk-number-field__control" style="inline-size:200px"><input aria-label="Cantidad" value="1"></div></div>`, ink: "#number" },
  { name: "PasswordInput", markup: `<div class="sk-password-input" data-appearance="frosted"><div id="password" class="sk-password-input__control" style="inline-size:200px"><input type="password" aria-label="Clave" value="x"></div></div>`, ink: "#password" },
  { name: "TagsInput", markup: `<div class="sk-tags-input" data-appearance="frosted"><div id="tags" class="sk-tags-input__control" style="inline-size:220px"><input aria-label="Temas"></div></div>`, ink: "#tags" },
  { name: "TimeField", markup: `<div class="sk-time-field" data-appearance="frosted"><div id="time" class="sk-time-field__control" style="inline-size:200px">10:30</div></div>`, ink: "#time" },
  { name: "DatePicker", markup: `<div class="sk-date-picker" data-appearance="frosted"><div id="date" class="sk-date-picker__control" style="inline-size:200px"><input aria-label="Fecha"></div></div>`, ink: "#date" },
  // Overlays.
  { name: "Popover", markup: `<div class="sk-popover" data-appearance="frosted"><div id="popover" class="sk-popover__content" style="position:static;display:block;inline-size:220px">Contenido</div></div>`, ink: "#popover" },
  { name: "Dialog", markup: `<dialog id="dialog" class="sk-dialog" open data-appearance="frosted" style="position:static;inline-size:240px"><div class="sk-dialog__body">Cuerpo <span id="dialog-secondary" ${SECONDARY}>detalle</span></div></dialog>`, ink: "#dialog" },
  { name: "Dialog, secondary text", markup: "", ink: "#dialog-secondary", surface: "#dialog" },
  { name: "Vaul", markup: `<dialog id="vaul" class="sk-vaul" open data-edge="block-end" data-appearance="frosted" style="position:static;inset:auto;inline-size:220px;block-size:120px;translate:none;transform:none">Panel</dialog>`, ink: "#vaul" },
  { name: "Tour", markup: `<div class="sk-tour" data-appearance="frosted"><div id="tour" class="sk-tour__popover" style="position:static;display:block;inline-size:220px;opacity:1;visibility:visible">Paso</div></div>`, ink: "#tour" },
  { name: "Window", markup: `<div class="sk-window__positioner" style="position:static"><div id="window" class="sk-window__content" data-state="open" data-appearance="frosted" style="inline-size:220px;block-size:120px"><div class="sk-window__drag"><div class="sk-window__header"><h2 id="window-title" class="sk-window__title">Título</h2></div></div><div class="sk-window__body">Cuerpo</div></div></div>`, ink: "#window" },
  { name: "Window title", markup: "", ink: "#window-title", surface: "#window" },
  // Chrome.
  { name: "Navbar", markup: `<header id="navbar" class="sk-navbar" data-appearance="frosted" style="position:static;inline-size:280px">Marca</header>`, ink: "#navbar" },
  { name: "Sidebar", markup: `<aside id="sidebar" class="sk-sidebar" data-state="expanded" data-appearance="frosted" style="position:static;block-size:120px;inline-size:200px">Nav</aside>`, ink: "#sidebar" },
  { name: "Toolbar", markup: `<div id="toolbar" class="sk-toolbar" role="toolbar" aria-label="t" data-appearance="frosted">Herramientas</div>`, ink: "#toolbar" },
  { name: "Footer", markup: `<footer id="footer" class="sk-footer" data-surface="surface" data-appearance="frosted" style="inline-size:260px">Pie</footer>`, ink: "#footer" },
  { name: "Hero", markup: `<section id="hero" class="sk-hero" data-surface="raised" data-appearance="frosted" style="--sk-hero-min-height:6rem;inline-size:260px">Titular</section>`, ink: "#hero" },
  { name: "Tabs, unselected", markup: "", ink: "#tab-off", surface: "#tablist" },
  { name: "Segmented, selected", markup: `<div id="segmented" class="sk-segmented" role="radiogroup" aria-label="Vista" data-appearance="frosted"><button id="seg-on" class="sk-segmented__option sk-interactive" role="radio" aria-checked="true" type="button">Lista</button><button id="seg-off" class="sk-segmented__option sk-interactive" role="radio" aria-checked="false" type="button">Grilla</button></div>`, ink: "#seg-on", surface: "#segmented" },
  { name: "Segmented, unselected", markup: "", ink: "#seg-off", surface: "#segmented" },
  { name: "Pagination, current page", markup: `<nav class="sk-pagination" aria-label="p" data-appearance="frosted"><button id="page-current" class="sk-pagination__item sk-interactive" type="button" aria-current="page">2</button></nav>`, ink: "#page-current" },
  // Cards and blocks of reading.
  { name: "Box", markup: `<div id="box" class="sk-box" data-padding="md" data-appearance="frosted">Contenido <span id="box-secondary" ${SECONDARY}>detalle</span></div>`, ink: "#box" },
  { name: "Box, secondary text", markup: "", ink: "#box-secondary", surface: "#box" },
  { name: "Box, raised", markup: `<div id="box-raised" class="sk-box" data-padding="md" data-surface="raised" data-appearance="frosted">Contenido</div>`, ink: "#box-raised" },
  { name: "Callout", markup: `<div id="callout-root" class="sk-callout" data-tone="info" data-appearance="frosted" style="inline-size:240px"><div id="callout" class="sk-callout__content">Aviso</div></div>`, ink: "#callout", surface: "#callout-root" },
  { name: "Tile", markup: `<button id="tile" class="sk-tile sk-tile--interactive" data-appearance="frosted" type="button">Tile</button>`, ink: "#tile" },
  { name: "Details", markup: `<details id="details" class="sk-details" data-appearance="frosted" open><summary id="details-summary" class="sk-details__summary">Resumen</summary><div id="details-content" class="sk-details__content">Contenido</div></details>`, ink: "#details-summary", surface: "#details" },
  { name: "Details, open body", markup: "", ink: "#details-content", surface: "#details" },
  { name: "Accordion", markup: `<div id="accordion" class="sk-accordion" data-appearance="frosted"><p id="accordion-text">Texto</p></div>`, ink: "#accordion-text", surface: "#accordion" },
  { name: "CodePreview", markup: `<div id="code" class="sk-code-preview" data-appearance="frosted" style="inline-size:260px"><pre id="code-text">const a = 1;</pre></div>`, ink: "#code-text", surface: "#code" },
];

test("every frosted surface keeps its text at 4.5:1 over a black and a white backdrop, in both modes", async ({ page }) => {
  await waitForStage(page);
  await page.evaluate((html) => {
    const host = document.createElement("div");
    host.id = "frosted-contrast-host";
    host.style.cssText =
      "position:fixed;inset:0 auto auto 0;z-index:9999;padding:40px;display:flex;flex-wrap:wrap;gap:24px;align-items:start;background:var(--color-bg-canvas)";
    host.innerHTML = html;
    document.body.append(host);
  }, cases.map((c) => c.markup).join(""));

  const failures: string[] = [];
  const report: string[] = [];
  for (const scheme of ["light", "dark"] as const) {
    await setScheme(page, scheme);
    for (const { name, ink, surface } of cases) {
      const ratio = await worstContrast(page, ink, surface ?? ink);
      report.push(`${scheme} ${name}: ${ratio.toFixed(2)}`);
      if (ratio < TEXT_FLOOR) failures.push(`${scheme} ${name}: ${ratio.toFixed(2)}`);
    }
  }
  test.info().annotations.push({ type: "contrast", description: report.join(", ") });
  await setScheme(page, "");
  expect(failures).toEqual([]);
});
