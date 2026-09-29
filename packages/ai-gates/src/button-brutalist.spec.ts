import { expect, test, type Page } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * BRUTALIST, measured on the real stylesheet: a flat face, a hard edge, and a zero-blur offset the
 * face travels into. Each test mounts its own fixture on the stage and reads computed styles, so the
 * claims are about what the browser paints, not about what the source says.
 */

const VARIANTS = ["solid", "soft", "ghost"] as const;
const TONES = ["neutral", "accent", "danger"] as const;

type Shadow = { x: number; y: number; blur: number; color: string } | null;

/** The first box-shadow layer, colour and lengths apart, or null for `none`. */
function parseShadow(shadow: string): Shadow {
  if (shadow === "none") return null;
  const first = shadow.split(/,(?![^(]*\))/)[0]!.trim();
  const color = first.match(/^[a-z-]+\([^)]*\)|^[a-z]+/i)?.[0] ?? "";
  const lengths = [...first.slice(color.length).matchAll(/-?\d+(?:\.\d+)?px/g)].map((m) => Number.parseFloat(m[0]));
  if (lengths.length < 2) throw new Error(`Could not parse box-shadow: ${shadow}`);
  return { x: lengths[0]!, y: lengths[1]!, blur: lengths[2] ?? 0, color };
}

function parseTranslate(translate: string): { x: number; y: number } {
  if (translate === "none") return { x: 0, y: 0 };
  const [x = "0", y = "0"] = translate.split(/\s+/);
  return { x: Number.parseFloat(x), y: Number.parseFloat(y) };
}

type Read = {
  shadow: Shadow;
  translate: { x: number; y: number };
  scale: string;
  bg: string;
  fg: string;
  radius: string;
  borderWidth: string;
  borderStartColor: string;
  borderEndColor: string;
  blockSize: number;
  inlineSize: number;
};

async function mount(page: Page, html: string, attrs = ""): Promise<void> {
  await page.evaluate(
    ({ html, attrs }) => {
      document.getElementById("brutalist-host")?.remove();
      const host = document.createElement("div");
      host.id = "brutalist-host";
      host.style.cssText =
        "position:fixed;inset:0 auto auto 0;z-index:9999;padding:40px;display:flex;flex-wrap:wrap;gap:24px;align-items:start;background:var(--color-bg-canvas)";
      for (const [name, value] of Object.entries(JSON.parse(attrs || "{}") as Record<string, string>))
        host.setAttribute(name, value);
      host.innerHTML = html;
      document.body.append(host);
    },
    { html, attrs },
  );
}

async function read(page: Page, selector: string): Promise<Read> {
  const raw = await page.locator(selector).evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      shadow: cs.boxShadow,
      translate: cs.translate,
      scale: cs.scale,
      bg: cs.backgroundColor,
      fg: cs.color,
      radius: cs.borderTopLeftRadius,
      borderWidth: cs.borderTopWidth,
      borderStartColor: cs.borderInlineStartColor,
      borderEndColor: cs.borderInlineEndColor,
      // The layout box, not the painted one: offsetWidth ignores `translate`.
      blockSize: (el as HTMLElement).offsetHeight,
      inlineSize: (el as HTMLElement).offsetWidth,
    };
  });
  return { ...raw, shadow: parseShadow(raw.shadow), translate: parseTranslate(raw.translate) };
}

/** Holds the pointer down on `selector`, reads, and lets go. */
async function whilePressed(page: Page, selector: string): Promise<Read> {
  await page.locator(selector).hover();
  await page.mouse.down();
  await page.waitForTimeout(250);
  const state = await read(page, selector);
  await page.mouse.up();
  await page.mouse.move(1, 1);
  await page.waitForTimeout(250);
  return state;
}

async function whileHovered(page: Page, selector: string): Promise<Read> {
  await page.locator(selector).hover();
  await page.waitForTimeout(250);
  const state = await read(page, selector);
  await page.mouse.move(1, 1);
  await page.waitForTimeout(250);
  return state;
}

const button = (id: string, attrs = "", label = "Get started") =>
  `<button id="${id}" class="sk-button sk-interactive" type="button" data-appearance="brutalist" ${attrs}>${label}</button>`;

test.beforeEach(async ({ page }) => {
  await waitForStage(page);
});

test("rest paints a flat face, an edge and a zero-blur offset toward block-end and inline-end", async ({ page }) => {
  await mount(page, button("probe", 'data-tone="accent"'));
  const rest = await read(page, "#probe");

  expect(rest.shadow).toMatchObject({ x: 5, y: 5, blur: 0 });
  expect(rest.borderWidth).toBe("1px");
  expect(rest.translate).toEqual({ x: 0, y: 0 });
  // Flat: no gradient or wash layered over the fill.
  expect(await page.locator("#probe").evaluate((el) => getComputedStyle(el).backgroundImage)).toBe("none");
});

test("hover reaches further, press drives the face into a fixed shadow, footprint unchanged", async ({ page }) => {
  await mount(page, `<span id="before">before</span>${button("probe", 'data-tone="accent"')}<span id="after">after</span>`);
  const afterRest = await page.locator("#after").boundingBox();

  const rest = await read(page, "#probe");
  const hover = await whileHovered(page, "#probe");
  const active = await whilePressed(page, "#probe");
  const afterActive = await page.locator("#after").boundingBox();

  expect(hover.shadow!.y).toBeGreaterThan(rest.shadow!.y);
  // No transform at rest or on hover: it would cut the touch target back to the face.
  expect(rest.translate).toEqual({ x: 0, y: 0 });
  expect(hover.translate).toEqual({ x: 0, y: 0 });
  expect(active.shadow!.y).toBeLessThan(rest.shadow!.y);
  expect(active.translate.y).toBeGreaterThan(0);
  // Never swallowed whole: some shadow is still visible at the bottom of the press.
  expect(active.shadow!.x).toBeGreaterThanOrEqual(1);
  expect(active.shadow!.y).toBeGreaterThanOrEqual(1);

  // Through the press, the far edge of the shadow is the one thing that never moves.
  for (const state of [rest, active]) {
    expect(state.translate.x + state.shadow!.x).toBe(rest.shadow!.x);
    expect(state.translate.y + state.shadow!.y).toBe(rest.shadow!.y);
    expect(state.shadow!.blur).toBe(0);
    // Whole pixels: a hard edge at a fractional offset antialiases into a soft one.
    expect(Number.isInteger(state.shadow!.x) && Number.isInteger(state.shadow!.y)).toBe(true);
  }
  expect(hover.shadow!.blur).toBe(0);

  // No squeeze, no bounce: brutalist is excluded from plain's press scale.
  expect(["none", "1"]).toContain(active.scale);
  expect(afterActive).toEqual(afterRest);
});

test("omitting data-appearance is plain, and plain is untouched by brutalist", async ({ page }) => {
  await mount(
    page,
    [
      '<button id="implicit" class="sk-button sk-interactive" type="button" data-tone="accent">Save</button>',
      '<button id="explicit" class="sk-button sk-interactive" type="button" data-tone="accent" data-appearance="plain">Save</button>',
      button("brutalist", 'data-tone="accent"', "Save"),
    ].join(""),
  );
  const implicit = await read(page, "#implicit");
  const explicit = await read(page, "#explicit");
  const brutalist = await read(page, "#brutalist");

  expect(explicit).toEqual(implicit);
  expect(implicit.borderWidth).toBe("1px");
  expect(implicit.shadow?.blur ?? 0).toBeGreaterThan(0);
  // Same tone, same fill: appearance does not redefine what accent means.
  expect(brutalist.bg).toBe(implicit.bg);
  expect(brutalist.fg).toBe(implicit.fg);
  // Plain still squeezes on press; brutalist does not inherit that.
  const plainActive = await whilePressed(page, "#implicit");
  expect(plainActive.scale).not.toBe("none");
});

test("every variant and tone keeps its meaning, and the quieter emphases spend less offset", async ({ page }) => {
  await mount(
    page,
    VARIANTS.flatMap((variant) =>
      TONES.map(
        (tone) =>
          `<button id="plain-${variant}-${tone}" class="sk-button sk-interactive" type="button" data-variant="${variant}" data-tone="${tone}">${variant}</button>` +
          button(`b-${variant}-${tone}`, `data-variant="${variant}" data-tone="${tone}"`, variant),
      ),
    ).join(""),
  );

  const offsets: Record<string, number> = {};
  for (const variant of VARIANTS) {
    for (const tone of TONES) {
      const plain = await read(page, `#plain-${variant}-${tone}`);
      const brutalist = await read(page, `#b-${variant}-${tone}`);
      const cell = `${variant}/${tone}`;

      expect(brutalist.shadow, cell).not.toBeNull();
      expect(brutalist.shadow!.blur, cell).toBe(0);
      expect(brutalist.shadow!.x, cell).toBe(brutalist.shadow!.y);
      // The face is the variant's own: ghost stays see-through, soft keeps its see-through wash,
      // solid keeps the fill tone gave it.
      expect(brutalist.bg, cell).toBe(plain.bg);
      expect(brutalist.fg, cell).toBe(plain.fg);
      // Every cell has a visible edge, even the variants whose plain border is transparent.
      expect(brutalist.borderStartColor, cell).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
      offsets[variant] = brutalist.shadow!.y;
    }
  }

  expect(offsets.solid).toBeGreaterThan(offsets.soft!);
  expect(offsets.soft).toBeGreaterThan(offsets.ghost!);
  expect(await read(page, "#b-ghost-danger").then((r) => r.bg)).toBe("rgba(0, 0, 0, 0)");
});

test("radius stays the dimension's: brutalist corners follow radius none and xl exactly as plain does", async ({ page }) => {
  for (const multiplier of ["0", "2"]) {
    await mount(
      page,
      [
        '<button id="plain" class="sk-button sk-interactive" type="button">Save</button>',
        button("probe", "", "Save"),
        button("icon", 'data-icon-only aria-label="Save"', "S"),
      ].join(""),
    );
    // The dimension's own mechanism: role radii resolve from the multiplier on the root.
    await page.evaluate((m) => document.documentElement.style.setProperty("--radius-multiplier", m), multiplier);
    const plain = await read(page, "#plain");
    const probe = await read(page, "#probe");
    const icon = await read(page, "#icon");

    expect(probe.radius, `multiplier ${multiplier}`).toBe(plain.radius);
    expect(probe.shadow, `multiplier ${multiplier}`).toMatchObject({ x: 5, y: 5, blur: 0 });
    // Icon-only stays a square, and the equal x/y offset keeps it reading as one.
    expect(icon.inlineSize).toBe(icon.blockSize);
    expect(icon.shadow!.x).toBe(icon.shadow!.y);
    if (multiplier === "0") expect(probe.radius).toBe("0px");
    else expect(Number.parseFloat(probe.radius)).toBeGreaterThan(8);
  }
  await page.evaluate(() => document.documentElement.style.removeProperty("--radius-multiplier"));
});

test("size and density stay their own: every size keeps plain's block size", async ({ page }) => {
  await mount(
    page,
    (["xs", "sm", "md", "lg"] as const)
      .map(
        (size) =>
          `<button id="plain-${size}" class="sk-button sk-interactive" type="button" data-size="${size}">Save</button>` +
          button(`b-${size}`, `data-size="${size}"`, "Save"),
      )
      .join(""),
  );
  for (const size of ["xs", "sm", "md", "lg"]) {
    expect((await read(page, `#b-${size}`)).blockSize, size).toBe((await read(page, `#plain-${size}`)).blockSize);
  }
});

test("disabled outranks appearance: a shrunk, muted offset and no travel at all", async ({ page }) => {
  await mount(
    page,
    [
      '<button id="plain" class="sk-button sk-interactive" type="button" data-tone="accent" disabled>Save</button>',
      button("disabled", 'data-tone="accent" disabled', "Save"),
      button("aria", 'data-tone="accent" aria-disabled="true"', "Save"),
    ].join(""),
  );
  const plain = await read(page, "#plain");

  for (const id of ["#disabled", "#aria"]) {
    const rest = await read(page, id);
    expect(rest.bg, id).toBe(plain.bg);
    expect(rest.fg, id).toBe(plain.fg);
    expect(rest.shadow!.y, id).toBeLessThan(5);
    expect(rest.shadow!.blur, id).toBe(0);

    const hover = await whileHovered(page, id);
    const active = await whilePressed(page, id);
    for (const state of [hover, active]) {
      expect(state.translate, id).toEqual({ x: 0, y: 0 });
      expect(state.shadow, id).toEqual(rest.shadow);
    }
  }
});

test("aria-pressed is the logical state, not a finger held down: rest offset stays, a press still travels", async ({ page }) => {
  await mount(
    page,
    [
      '<button id="plain" class="sk-button sk-interactive" type="button" aria-pressed="true">Bold</button>',
      button("off", 'aria-pressed="false"', "Bold"),
      button("on", 'aria-pressed="true"', "Bold"),
    ].join(""),
  );
  const plain = await read(page, "#plain");
  const off = await read(page, "#off");
  const on = await read(page, "#on");

  expect(on.bg).toBe(plain.bg);
  expect(on.bg).not.toBe(off.bg);
  expect(on.translate).toEqual({ x: 0, y: 0 });
  expect(on.shadow).toEqual(off.shadow);

  const active = await whilePressed(page, "#on");
  expect(active.translate.y).toBeGreaterThan(0);
  expect(active.shadow!.y).toBeLessThan(on.shadow!.y);
});

test("focus-visible keeps the system ring, distinct from the hard shadow", async ({ page }) => {
  await mount(page, `<button id="first" type="button">first</button>${button("probe", 'data-tone="accent"')}`);
  await page.locator("#first").focus();
  await page.keyboard.press("Tab");

  const ring = await page.locator("#probe").evaluate((el) => {
    const cs = getComputedStyle(el);
    const root = getComputedStyle(document.documentElement);
    return {
      focused: el.matches(":focus-visible"),
      style: cs.outlineStyle,
      width: cs.outlineWidth,
      color: cs.outlineColor,
      offset: cs.outlineOffset,
      expectedWidth: root.getPropertyValue("--focus-ring-width").trim(),
      shadow: cs.boxShadow,
    };
  });

  expect(ring.focused).toBe(true);
  expect(ring.style).toBe("solid");
  expect(Number.parseFloat(ring.width)).toBeGreaterThan(0);
  expect(ring.shadow).not.toBe("none");
  expect(parseShadow(ring.shadow)!.color).not.toBe(ring.color);
});

test("xs and sm keep their 44px hit area under the brutalist paint", async ({ page }) => {
  await mount(
    page,
    (["xs", "sm"] as const)
      .map((size) => `<div data-size-cell="${size}" style="padding:24px">${button(`brutalist-hit-${size}`, `data-size="${size}"`, "Go")}</div>`)
      .join(""),
  );
  const probe = (size: "xs" | "sm") =>
    page.evaluate((size) => {
      const touchTarget = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--size-touch-target"));
      const el = document.getElementById(`brutalist-hit-${size}`)!;
      const r = el.getBoundingClientRect();
      const reachX = Math.max(0, (touchTarget - r.width) / 2) - 1;
      const reachY = Math.max(0, (touchTarget - r.height) / 2) - 1;
      const hit = (dx: number, dy: number) =>
        document.elementFromPoint(r.left + r.width / 2 + dx, r.top + r.height / 2 + dy) === el;
      return {
        reachY,
        start: hit(-(r.width / 2 + reachX), 0),
        end: hit(r.width / 2 + reachX, 0),
        top: hit(0, -(r.height / 2 + reachY)),
        bottom: hit(0, r.height / 2 + reachY),
      };
    }, size);

  for (const size of ["xs", "sm"] as const) {
    const rest = await probe(size);
    expect(rest.reachY, size).toBeGreaterThan(0);
    expect(rest, `${size} at rest`).toMatchObject({ start: true, end: true, top: true, bottom: true });
    // Hovered too: a hover that moved the face would clip the target and flicker hover off again.
    await page.locator(`#brutalist-hit-${size}`).hover();
    await page.waitForTimeout(250);
    expect(await probe(size), `${size} hovered`).toMatchObject({ start: true, end: true, top: true, bottom: true });
    await page.mouse.move(1, 1);
  }
});

test("RTL mirrors the inline side of the offset and of the travel", async ({ page }) => {
  await mount(page, button("probe", 'data-tone="accent"'), JSON.stringify({ dir: "rtl" }));
  const rest = await read(page, "#probe");
  expect(rest.shadow).toMatchObject({ x: -5, y: 5 });

  const active = await whilePressed(page, "#probe");
  expect(active.translate.x).toBeLessThan(0);
  expect(active.translate.y).toBeGreaterThan(0);
  expect(active.translate.x + active.shadow!.x).toBe(-5);
});

test("welded members cast one block-end shadow, share one seam line, and press straight down", async ({ page }) => {
  await mount(
    page,
    `<div style="display:inline-flex">${button("lead", 'data-tone="accent" data-weld-end', "Save")}${button(
      "trail",
      'data-tone="accent" data-weld-start data-icon-only aria-label="More"',
      "▾",
    )}</div>`,
  );
  const lead = await read(page, "#lead");
  const trail = await read(page, "#trail");

  for (const member of [lead, trail]) expect(member.shadow).toMatchObject({ x: 0, y: 5, blur: 0 });
  // One line at the seam: the trailing member draws its start edge, the leading one clears its end.
  expect(lead.borderEndColor).toBe("rgba(0, 0, 0, 0)");
  expect(trail.borderStartColor).not.toBe("rgba(0, 0, 0, 0)");

  const active = await whilePressed(page, "#trail");
  expect(active.translate.x).toBe(0);
  expect(active.translate.y).toBeGreaterThan(0);
});

test("the navigation host renders the same construction as the action host", async ({ page }) => {
  await mount(page, button("action", 'data-tone="accent"', "Docs") + '<a id="link" class="sk-button sk-interactive" href="#x" data-appearance="brutalist" data-tone="accent">Docs</a>');
  const action = await read(page, "#action");
  const link = await read(page, "#link");
  expect(link.shadow).toEqual(action.shadow);
  expect(link.bg).toBe(action.bg);
  expect(link.borderStartColor).toBe(action.borderStartColor);
});

test("reduced motion: the pressed state still lands, with no animated travel", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mount(page, button("probe", 'data-tone="accent"'));
  const durations = await page.locator("#probe").evaluate((el) => {
    const cs = getComputedStyle(el);
    const names = cs.transitionProperty.split(",").map((s) => s.trim());
    const times = cs.transitionDuration.split(",").map((s) => Number.parseFloat(s) * (s.includes("ms") ? 1 : 1000));
    return Object.fromEntries(names.map((name, i) => [name, times[i]]));
  });
  expect(durations.translate).toBeLessThanOrEqual(1);
  expect(durations["box-shadow"]).toBeLessThanOrEqual(1);

  const active = await whilePressed(page, "#probe");
  expect(active.translate.y).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: null });
});

test("forced colors: the offset drops, the edge, focus ring and states stay", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await mount(
    page,
    [
      `<button id="first" type="button">first</button>`,
      button("probe", 'data-tone="accent"'),
      button("pressed", 'aria-pressed="true"', "Bold"),
      button("off", 'aria-pressed="false"', "Bold"),
      button("disabled", "disabled", "Save"),
    ].join(""),
  );
  const probe = await read(page, "#probe");
  expect(probe.shadow).toBeNull();
  expect(probe.borderWidth).toBe("1px");

  const pressed = await read(page, "#pressed");
  const off = await read(page, "#off");
  const disabled = await read(page, "#disabled");
  expect(pressed.bg).not.toBe(off.bg);
  expect(disabled.fg).not.toBe(off.fg);

  const active = await whilePressed(page, "#probe");
  expect(active.translate).toEqual({ x: 0, y: 0 });

  await page.locator("#first").focus();
  await page.keyboard.press("Tab");
  const outline = await page.locator("#probe").evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).toBe("solid");
  await page.emulateMedia({ forcedColors: null });
});

test("dark mode keeps a black offset: a shadow, never a light glow", async ({ page }) => {
  await page.evaluate(() => (document.documentElement.style.colorScheme = "dark"));
  await mount(page, VARIANTS.map((variant) => button(`dark-${variant}`, `data-variant="${variant}" data-tone="accent"`)).join(""));
  for (const variant of VARIANTS) {
    const color = await page.locator(`#dark-${variant}`).evaluate((el) => {
      // Resolve the shadow colour to sRGB channels through a probe element.
      const probe = document.createElement("i");
      probe.style.color = getComputedStyle(el).boxShadow.match(/^[a-z-]+\([^)]*\)|^[a-z]+/i)![0];
      document.body.append(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    });
    const [r, g, b] = (color.match(/[\d.]+/g) ?? []).map(Number);
    // oklch(0 0 0) serializes as 0 lightness; rgb() as 0,0,0. Either way, nothing light.
    expect(Math.max(r ?? 0, g ?? 0, b ?? 0), `${variant}: ${color}`).toBeLessThan(0.05 * 255);
  }
  await page.evaluate(() => (document.documentElement.style.colorScheme = ""));
});
