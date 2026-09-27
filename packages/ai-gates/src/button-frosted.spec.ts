import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";
import { setScheme, TEXT_FLOOR, worstContrast } from "./frost-contrast.js";

/*
 * FROSTED, measured on the real stylesheet: a translucent material over a processed backdrop, with an
 * opaque baseline wherever the material cannot be trusted. Every claim is read from the browser:
 * computed paint, composited colour, hit testing, emulated preferences.
 */

const VARIANTS = ["solid", "soft", "ghost", "translucent"] as const;
const TONES = ["neutral", "accent", "danger"] as const;

/* Chromium supports backdrop-filter and prefers-reduced-transparency, so the MATERIAL path is what
 * renders here by default; the baseline is reached through CDP emulation of reduced transparency,
 * the same branch a browser without backdrop-filter takes. */
async function reduceTransparency(page: Page, on: boolean): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: on ? "reduce" : "" }],
  });
  // The face's colour transitions like any state change; read it once it has landed.
  await page.waitForTimeout(400);
}

async function mount(page: Page, html: string, hostStyle = ""): Promise<void> {
  await page.evaluate(
    ({ html, hostStyle }) => {
      document.getElementById("frosted-host")?.remove();
      const host = document.createElement("div");
      host.id = "frosted-host";
      host.style.cssText = `position:fixed;inset:0 auto auto 0;z-index:9999;padding:40px;display:flex;flex-wrap:wrap;gap:24px;align-items:start;background:var(--color-bg-canvas);${hostStyle}`;
      host.innerHTML = html;
      document.body.append(host);
    },
    { html, hostStyle },
  );
}

type Read = {
  bg: string;
  bgAlpha: number;
  fg: string;
  backdrop: string;
  shadow: string;
  border: string;
  borderWidth: string;
  borderStartColor: string;
  borderEndColor: string;
  radius: string;
  translate: string;
  scale: string;
  blockSize: number;
};

async function read(page: Page, selector: string): Promise<Read> {
  return page.locator(selector).evaluate((el) => {
    const cs = getComputedStyle(el);
    // Alpha through a canvas: it parses every CSS colour syntax the computed value may use.
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = cs.backgroundColor;
    ctx.fillRect(0, 0, 1, 1);
    const alpha = ctx.getImageData(0, 0, 1, 1).data[3]! / 255;
    return {
      bg: cs.backgroundColor,
      bgAlpha: alpha,
      fg: cs.color,
      backdrop: cs.backdropFilter,
      shadow: cs.boxShadow,
      border: cs.borderTopColor,
      borderWidth: cs.borderTopWidth,
      borderStartColor: cs.borderInlineStartColor,
      borderEndColor: cs.borderInlineEndColor,
      radius: cs.borderTopLeftRadius,
      translate: cs.translate,
      scale: cs.scale,
      blockSize: (el as HTMLElement).offsetHeight,
    };
  });
}

const button = (id: string, attrs = "", label = "Continue") =>
  `<button id="${id}" class="sk-button sk-interactive" type="button" data-appearance="frosted" ${attrs}>${label}</button>`;

/** A backdrop worth processing: detail, colour and both extremes of lightness in one strip. */
const BUSY =
  "background: repeating-linear-gradient(45deg, #000 0 6px, #fff 6px 12px), linear-gradient(90deg, #e33, #33e);background-blend-mode: difference";

test.beforeEach(async ({ page }) => {
  await waitForStage(page);
});

test("the material: a see-through face over a blurred, saturated backdrop, with a fine edge", async ({ page }) => {
  await mount(
    page,
    [
      '<button id="plain" class="sk-button sk-interactive" type="button" data-tone="accent">Continue</button>',
      button("probe", 'data-tone="accent"'),
    ].join(""),
    BUSY,
  );
  const plain = await read(page, "#plain");
  const probe = await read(page, "#probe");

  expect(probe.backdrop).toMatch(/blur\(16px\).*saturate\(1\.5\)/);
  expect(probe.bgAlpha).toBeLessThan(1);
  expect(probe.bgAlpha).toBeGreaterThan(0.5);
  expect(probe.borderWidth).toBe(plain.borderWidth);
  // The lit rim: an inset highlight layered over the button's own separation shadow.
  expect(probe.shadow).toContain("inset");
  expect(plain.backdrop).toBe("none");
  expect(plain.bgAlpha).toBe(1);
});

test("omitting data-appearance is plain, and the other appearances are untouched", async ({ page }) => {
  await mount(
    page,
    [
      '<button id="implicit" class="sk-button sk-interactive" type="button" data-tone="accent">Save</button>',
      '<button id="explicit" class="sk-button sk-interactive" type="button" data-tone="accent" data-appearance="plain">Save</button>',
      '<button id="tactile" class="sk-button sk-interactive" type="button" data-tone="accent" data-appearance="tactile">Save</button>',
      '<button id="brutalist" class="sk-button sk-interactive" type="button" data-tone="accent" data-appearance="brutalist">Save</button>',
    ].join(""),
  );
  expect(await read(page, "#explicit")).toEqual(await read(page, "#implicit"));
  for (const id of ["#implicit", "#tactile", "#brutalist"]) expect((await read(page, id)).backdrop, id).toBe("none");
});

test("every variant and tone keeps the label at 4.5:1 over a black and a white backdrop, at rest and pressed, in both modes", async ({ page }) => {
  const cells = VARIANTS.flatMap((variant) => TONES.flatMap((tone) => [false, true].map((pressed) => ({ variant, tone, pressed }))));
  const id = ({ variant, tone, pressed }: (typeof cells)[number]) => `c-${variant}-${tone}${pressed ? "-on" : ""}`;
  await mount(
    page,
    cells
      .map((cell) => button(id(cell), `data-variant="${cell.variant}" data-tone="${cell.tone}"${cell.pressed ? ' aria-pressed="true"' : ""}`))
      .join(""),
  );
  const report: string[] = [];
  for (const scheme of ["light", "dark"] as const) {
    await setScheme(page, scheme);
    for (const cell of cells) {
      const label = `${scheme} ${cell.variant}/${cell.tone}${cell.pressed ? " pressed" : ""}`;
      const ratio = await worstContrast(page, `#${id(cell)}`);
      report.push(`${label}: ${ratio.toFixed(2)}`);
      expect(ratio, label).toBeGreaterThanOrEqual(TEXT_FLOOR);
    }
  }
  test.info().annotations.push({ type: "contrast", description: report.join(", ") });
  await setScheme(page, "");
});

test("variant and tone keep their meaning: the same ink, and emphasis orders the sheets", async ({ page }) => {
  await mount(
    page,
    VARIANTS.flatMap((variant) =>
      TONES.map(
        (tone) =>
          `<button id="p-${variant}-${tone}" class="sk-button sk-interactive" type="button" data-variant="${variant}" data-tone="${tone}">x</button>` +
          button(`f-${variant}-${tone}`, `data-variant="${variant}" data-tone="${tone}"`, "x"),
      ),
    ).join(""),
  );
  const alpha: Record<string, number> = {};
  for (const variant of VARIANTS) {
    for (const tone of TONES) {
      const plain = await read(page, `#p-${variant}-${tone}`);
      const frosted = await read(page, `#f-${variant}-${tone}`);
      const cell = `${variant}/${tone}`;
      // Tone is the button's: the same ink, whatever the material.
      expect(frosted.fg, cell).toBe(plain.fg);
      expect(frosted.backdrop, cell).toContain("blur");
      if (tone === "neutral") alpha[variant] = frosted.bgAlpha;
      // Ghost and translucent gain a real sheet: plain promises nothing over an unknown backdrop.
      if (variant === "ghost" || variant === "translucent") expect(frosted.bgAlpha, cell).toBeGreaterThan(plain.bgAlpha);
    }
  }
  // Emphasis still orders the sheets: solid densest, ghost thinnest, and still see-through.
  expect(alpha.solid).toBeGreaterThan(alpha.soft!);
  expect(alpha.soft).toBeGreaterThan(alpha.translucent!);
  expect(alpha.translucent).toBeGreaterThan(alpha.ghost!);
  expect(alpha.ghost).toBeLessThan(1);
});

/* On a neutral face: a toned face already sits at its 94% legibility floor, so its density has
 * nowhere left to go and the state layer alone answers the pointer there. */
test("hover and press make the sheet denser, with no travel or squeeze; disabled never moves", async ({ page }) => {
  await mount(page, [button("probe", 'data-variant="soft"'), button("off", 'data-variant="soft" disabled')].join(""));
  const rest = await read(page, "#probe");
  await page.locator("#probe").hover();
  await page.waitForTimeout(300);
  const hover = await read(page, "#probe");
  await page.mouse.down();
  await page.waitForTimeout(300);
  const active = await read(page, "#probe");
  await page.mouse.up();
  await page.mouse.move(1, 1);

  expect(hover.bgAlpha).toBeGreaterThan(rest.bgAlpha);
  expect(active.bgAlpha).toBeGreaterThan(hover.bgAlpha);
  for (const state of [rest, hover, active]) {
    expect(state.translate).toBe("none");
    expect(["none", "1"]).toContain(state.scale);
  }

  const offRest = await read(page, "#off");
  await page.locator("#off").hover({ force: true });
  await page.mouse.down();
  await page.waitForTimeout(300);
  const offActive = await read(page, "#off");
  await page.mouse.up();
  expect(offActive.bg).toBe(offRest.bg);
  expect(offRest.bgAlpha).toBeGreaterThan(0.9);
  const plainDisabled = await page.evaluate(() => {
    const b = document.createElement("button");
    b.className = "sk-button sk-interactive";
    b.disabled = true;
    b.dataset.variant = "soft";
    document.getElementById("frosted-host")!.append(b);
    return getComputedStyle(b).color;
  });
  expect(offRest.fg).toBe(plainDisabled);
});

test("aria-pressed is a paint, not a blur: distinct with the material, without it, and under hover", async ({ page }) => {
  for (const variant of VARIANTS) {
    await mount(page, [button("on", `data-variant="${variant}" aria-pressed="true"`, "Bold"), button("off", `data-variant="${variant}" aria-pressed="false"`, "Bold")].join(""), BUSY);
    const on = await read(page, "#on");
    const off = await read(page, "#off");
    expect(on.bg, variant).not.toBe(off.bg);
    expect(on.bgAlpha, variant).toBeGreaterThan(0.9);

    await page.locator("#on").hover();
    await page.waitForTimeout(300);
    expect((await read(page, "#on")).bg, `${variant} hovered`).not.toBe(off.bg);
    await page.mouse.move(1, 1);

    await reduceTransparency(page, true);
    const onBase = await read(page, "#on");
    const offBase = await read(page, "#off");
    expect(onBase.backdrop, variant).toBe("none");
    expect(onBase.bg, `${variant} baseline`).not.toBe(offBase.bg);
    await reduceTransparency(page, false);
  }
});

test("the baseline (no backdrop-filter, or reduced transparency) is the opaque face plus the edge", async ({ page }) => {
  await mount(
    page,
    VARIANTS.map(
      (variant) =>
        `<button id="p-${variant}" class="sk-button sk-interactive" type="button" data-variant="${variant}" data-tone="accent">x</button>` +
        button(`f-${variant}`, `data-variant="${variant}" data-tone="accent"`, "x"),
    ).join(""),
    BUSY,
  );
  await reduceTransparency(page, true);
  for (const variant of VARIANTS) {
    const plain = await read(page, `#p-${variant}`);
    const frosted = await read(page, `#f-${variant}`);
    expect(frosted.backdrop, variant).toBe("none");
    // The face falls back to the material's own face, opaque: the plain paint for solid and soft,
    // the sheet's tint for ghost and translucent, so the label stays legible without the blur too.
    if (variant === "solid" || variant === "soft") expect(frosted.bg, variant).toBe(plain.bg);
    expect(frosted.bgAlpha, variant).toBe(1);
    expect(frosted.fg, variant).toBe(plain.fg);
    expect(frosted.shadow, variant).toContain("inset");
  }
  await reduceTransparency(page, false);

  // And every declaration that asks for the material sits behind the system switch.
  const outside = await page.evaluate(() => {
    const found: string[] = [];
    const walk = (rules: CSSRuleList) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSGroupingRule) walk(rule.cssRules);
        else if (rule instanceof CSSStyleRule && rule.selectorText.includes('data-appearance="frosted"')) {
          const value = rule.style.getPropertyValue("backdrop-filter").trim();
          if (value && value !== "none" && !value.startsWith("var(--frost-on)")) found.push(rule.selectorText);
        }
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        walk(sheet.cssRules);
      } catch {
        /* cross-origin sheet */
      }
    }
    return found;
  });
  expect(outside).toEqual([]);
});

test("high contrast outranks the material", async ({ page }) => {
  await mount(page, button("probe", 'data-tone="accent"'), "");
  await page.evaluate(() => document.getElementById("frosted-host")!.setAttribute("data-contrast", "high"));
  await page.waitForTimeout(400);
  const probe = await read(page, "#probe");
  expect(probe.backdrop).toBe("none");
  expect(probe.bgAlpha).toBe(1);
});

test("radius and density stay their own", async ({ page }) => {
  for (const multiplier of ["0", "2"]) {
    await mount(page, '<button id="plain" class="sk-button sk-interactive" type="button">Save</button>' + button("probe", "", "Save"));
    await page.evaluate((m) => document.documentElement.style.setProperty("--radius-multiplier", m), multiplier);
    const plain = await read(page, "#plain");
    const probe = await read(page, "#probe");
    expect(probe.radius, multiplier).toBe(plain.radius);
    if (multiplier === "0") expect(probe.radius).toBe("0px");
  }
  await page.evaluate(() => document.documentElement.style.removeProperty("--radius-multiplier"));

  await mount(
    page,
    (["xs", "sm", "md", "lg"] as const)
      .map((size) => `<button id="p-${size}" class="sk-button sk-interactive" data-size="${size}">Go</button>` + button(`f-${size}`, `data-size="${size}"`, "Go"))
      .join(""),
  );
  for (const size of ["xs", "sm", "md", "lg"]) {
    expect((await read(page, `#f-${size}`)).blockSize, size).toBe((await read(page, `#p-${size}`)).blockSize);
  }
});

test("focus-visible keeps the system ring over light, dark, detailed and accent backdrops", async ({ page }) => {
  const backdrops = {
    light: "background: #fff",
    dark: "background: #000",
    detail: BUSY,
    accent: "background: var(--color-action-accent)",
  };
  for (const [name, style] of Object.entries(backdrops)) {
    await mount(page, `<button id="first" type="button">first</button>${button("probe", 'data-tone="accent"')}`, style);
    await page.locator("#first").focus();
    await page.keyboard.press("Tab");
    const ring = await page.locator("#probe").evaluate((el) => {
      const cs = getComputedStyle(el);
      return { focused: el.matches(":focus-visible"), style: cs.outlineStyle, width: parseFloat(cs.outlineWidth), color: cs.outlineColor };
    });
    expect(ring.focused, name).toBe(true);
    expect(ring.style, name).toBe("solid");
    expect(ring.width, name).toBeGreaterThan(0);
    // The ring is its own opaque mark, never the material's translucent edge.
    expect(ring.color, name).not.toMatch(/\/ 0\.|rgba\(.*, 0\.\d+\)/);
  }
});

test("xs and sm keep their 44px hit area, at rest and hovered", async ({ page }) => {
  await mount(
    page,
    (["xs", "sm"] as const)
      .map((size) => `<div style="padding:24px">${button(`frosted-hit-${size}`, `data-size="${size}" data-icon-only aria-label="Go"`, "★")}</div>`)
      .join(""),
  );
  const probe = (size: "xs" | "sm") =>
    page.evaluate((size) => {
      const touchTarget = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--size-touch-target"));
      const el = document.getElementById(`frosted-hit-${size}`)!;
      const r = el.getBoundingClientRect();
      const reach = Math.max(0, (touchTarget - r.height) / 2) - 1;
      const hit = (dx: number, dy: number) => document.elementFromPoint(r.left + r.width / 2 + dx, r.top + r.height / 2 + dy) === el;
      return {
        start: hit(-(r.width / 2 + reach), 0),
        end: hit(r.width / 2 + reach, 0),
        top: hit(0, -(r.height / 2 + reach)),
        bottom: hit(0, r.height / 2 + reach),
      };
    }, size);
  for (const size of ["xs", "sm"] as const) {
    expect(await probe(size), `${size} at rest`).toEqual({ start: true, end: true, top: true, bottom: true });
    await page.locator(`#frosted-hit-${size}`).hover();
    await page.waitForTimeout(250);
    expect(await probe(size), `${size} hovered`).toEqual({ start: true, end: true, top: true, bottom: true });
    await page.mouse.move(1, 1);
  }
});

test("welded members read as one sheet: no doubled edge at the seam", async ({ page }) => {
  await mount(
    page,
    `<div style="display:inline-flex">${button("lead", 'data-tone="accent" data-weld-end', "Save")}${button("trail", 'data-tone="accent" data-weld-start data-icon-only aria-label="More"', "▾")}</div>`,
    BUSY,
  );
  const lead = await read(page, "#lead");
  const trail = await read(page, "#trail");
  expect(lead.borderEndColor).toBe("rgba(0, 0, 0, 0)");
  expect(trail.borderStartColor).toBe("rgba(0, 0, 0, 0)");
  expect(lead.bg).toBe(trail.bg);
  expect(lead.backdrop).toBe(trail.backdrop);
});

test("the navigation host renders the same material as the action host", async ({ page }) => {
  await mount(page, button("action", 'data-tone="accent"', "Docs") + '<a id="link" class="sk-button sk-interactive" href="#x" data-appearance="frosted" data-tone="accent">Docs</a>');
  const action = await read(page, "#action");
  const link = await read(page, "#link");
  expect(link.bg).toBe(action.bg);
  expect(link.backdrop).toBe(action.backdrop);
  expect(link.border).toBe(action.border);
});

test("reduced motion: state changes land immediately, and the blur is never animated", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mount(page, button("probe", 'data-tone="accent"'));
  const transition = await page.locator("#probe").evaluate((el) => {
    const cs = getComputedStyle(el);
    const names = cs.transitionProperty.split(",").map((s) => s.trim());
    const times = cs.transitionDuration.split(",").map((s) => Number.parseFloat(s) * (s.includes("ms") ? 1 : 1000));
    return Object.fromEntries(names.map((name, i) => [name, times[i]]));
  });
  expect(Object.keys(transition)).not.toContain("backdrop-filter");
  expect(transition["background-color"]).toBeLessThanOrEqual(150);
  await page.emulateMedia({ reducedMotion: null });
});

test("forced colors: opaque system paint, no blur, and every state still readable", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await mount(
    page,
    [
      `<button id="first" type="button">first</button>`,
      button("probe", 'data-tone="accent"'),
      button("ghost", 'data-variant="ghost"'),
      button("pressed", 'aria-pressed="true"', "Bold"),
      button("off", 'aria-pressed="false"', "Bold"),
      button("disabled", "disabled", "Save"),
    ].join(""),
    BUSY,
  );
  // Chromium keeps its own forced system paint (an accent host reports Highlight at 0.8 alpha for
  // plain too), so the claim is "the same paint plain gets", with nothing of the material left.
  await page.evaluate(() => {
    const host = document.getElementById("frosted-host")!;
    for (const [id, attrs] of [["p-probe", 'data-tone="accent"'], ["p-ghost", 'data-variant="ghost"'], ["p-off", 'aria-pressed="false"']])
      host.insertAdjacentHTML("beforeend", `<button id="${id}" class="sk-button sk-interactive" type="button" ${attrs}>x</button>`);
  });
  for (const id of ["probe", "ghost", "off"]) {
    const r = await read(page, `#${id}`);
    const plain = await read(page, `#p-${id}`);
    expect(r.backdrop, id).toBe("none");
    expect(r.bg, id).toBe(plain.bg);
    expect(r.borderWidth, id).not.toBe("0px");
  }
  expect((await read(page, "#pressed")).bg).not.toBe((await read(page, "#off")).bg);
  expect((await read(page, "#disabled")).fg).not.toBe((await read(page, "#off")).fg);
  await page.locator("#first").focus();
  await page.keyboard.press("Tab");
  expect(await page.locator("#probe").evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
  await page.emulateMedia({ forcedColors: null });
});
