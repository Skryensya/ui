import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { brandIconNames, isBrandIconName, isComponentIconName, stableIconNames } from "./icon.js";
import { iconSetCss, iconSetFromIconify, iconSetModule, iconifyPresets, type IconifyJSON } from "./iconify.js";

const require = createRequire(import.meta.url);

describe.each(Object.entries(iconifyPresets))("%s preset", (_, preset) => {
  const json = require(`@iconify-json/${preset.prefix}/icons.json`) as IconifyJSON;
  const set = iconSetFromIconify(json, preset);
  const full = iconSetFromIconify(json, preset, { components: true });

  it("draws every role in the vocabulary, and nothing beyond its map", () => {
    for (const role of stableIconNames) expect((full as Record<string, { body: string }>)[role]?.body, role).toBeTruthy();
    expect(Object.keys(full).sort()).toEqual(Object.keys(preset.map).sort());
  });

  it("draws every brand logo when asked, and none otherwise", () => {
    const branded = iconSetFromIconify(json, preset, { brands: true }) as Record<string, { body: string }>;
    for (const brand of brandIconNames) expect(branded[brand]?.body, brand).toBeTruthy();
    expect(Object.keys(set).some(isBrandIconName)).toBe(false);
  });

  it("leaves the component marks out unless asked", () => {
    expect(Object.keys(set).some(isComponentIconName)).toBe(false);
    expect(Object.keys(full).filter(isComponentIconName).length).toBeGreaterThan(100);
  });

  it("writes a module and a stylesheet holding only the mapped roles", () => {
    const source = iconSetModule(set, "/* test */");
    // Solar's bold duotone draws two layers per icon: ~84 KB, still one lazy chunk.
    expect(source.length).toBeLessThan(100_000);
    expect(iconSetCss(set)).toContain("--sk-carousel-native-next-icon");
  });
});

it("follows aliases and reads per-icon sizes", () => {
  const json: IconifyJSON = { prefix: "t", width: 24, height: 24, icons: { a: { body: "<path/>", width: 20 } }, aliases: { b: { parent: "a" } } };
  const map = Object.fromEntries(stableIconNames.map((role) => [role, "b"])) as never;
  expect(iconSetFromIconify(json, { map }).close).toEqual({ body: "<path/>", viewBox: "0 0 20 24" });
  expect(() => iconSetFromIconify(json, { map: { ...(map as object), close: "zz" } as never })).toThrow(/no icon "zz"/);
});

it("fills the outline body of the roles a preset paints solid", () => {
  const json = require("@iconify-json/lucide/icons.json") as IconifyJSON;
  const set = iconSetFromIconify(json, iconifyPresets.lucide!);
  expect(set.play.body).toContain('fill="currentColor"');
  expect(set.close.body).toContain('fill="none"');
});

it("draws each style of a library with its own geometry, not the base one", () => {
  const load = (prefix: string) => require(`@iconify-json/${prefix}/icons.json`) as IconifyJSON;
  const base = { ph: iconSetFromIconify(load("ph"), iconifyPresets.ph!), "material-symbols": iconSetFromIconify(load("material-symbols"), iconifyPresets["material-symbols"]!) };
  for (const [id, preset] of Object.entries(iconifyPresets)) {
    const parent = id.startsWith("ph-") ? base.ph : id.startsWith("material-symbols-") ? base["material-symbols"] : undefined;
    if (!parent) continue;
    const set = iconSetFromIconify(load(preset.prefix), preset);
    const roles = stableIconNames.filter((role) => !isComponentIconName(role));
    const changed = roles.filter((role) => set[role as keyof typeof set]!.body !== parent[role as keyof typeof parent]!.body).length;
    // a fifth, not half: Material's sharp style only differs where outlined rounds a corner (22 of 69).
    expect(changed, id).toBeGreaterThan(roles.length / 5);
  }
});
