import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { test } from "node:test";

/*
 * THE MAKER IS BUILT WITH THE DESIGN SYSTEM IT EDITS. A tool for composing the kit's components that draws
 * its own buttons, fields and headings with raw HTML and a parallel stylesheet is two things at once: a
 * demonstration that the kit is not enough, and a second place where every decision (a radius, a focus ring,
 * a colour in dark mode) has to be remade by hand and kept in step.
 *
 * So the Maker's own UI is held to the rule it gives its users: controls are the kit's, and the colours,
 * spaces and radii are the kit's tokens. This gate counts the ways it still is not, and RATCHETS: the
 * baseline in `design-system.baseline.json` is what exists today and may only shrink. Adding a raw control
 * fails; removing one fails too until the baseline is lowered, so the number cannot drift back up unseen.
 *
 *   node --test scripts/design-system.test.ts          check
 *   UPDATE_BASELINE=1 node scripts/design-system.test.ts   rewrite the baseline (after migrating something)
 *
 * What counts (per file):
 *   tsx  a raw `<button|select|input|textarea|label|dialog|details|summary|h1-h6|table>`: each has a kit
 *        component (Button, NativeSelect, Input, Textarea, FormField, Dialog, Details, Heading, Table).
 *        Lists, images and fieldsets are allowed: the kit has no replacement that is not heavier.
 *   css  a hex/rgb/hsl colour literal; `currentColor` standing in for a border; a selector that restyles a kit
 *        control by its element name (`.maker-x input`), which is a reskin of a component that has its own hooks.
 */
const root = join(import.meta.dirname, "..", "src");
const baselinePath = join(import.meta.dirname, "design-system.baseline.json");

function files(dir: string, ext: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path, ext) : path.endsWith(ext) ? [path] : [];
  });
}

const RAW = /<(button|select|input|textarea|label|dialog|details|summary|h[1-6]|table)[\s>/]/g;
const COLOUR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g;
const CURRENT_BORDER = /border[a-z-]*:[^;{}]*currentColor/g;

export function measure(): Record<string, number> {
  const counts: Record<string, number> = {};
  const add = (file: string, kind: string, n: number) => {
    if (n > 0) counts[`${relative(root, file)} · ${kind}`] = n;
  };
  for (const file of files(root, ".tsx")) {
    const source = readFileSync(file, "utf8");
    const tally = new Map<string, number>();
    for (const match of source.matchAll(RAW)) {
      /* A raw element can be a decision, not a leftover: a comment `ds-exception: <why>` in the lines just above says so. */
      const before = source.slice(0, match.index).split("\n").slice(-4, -1).join("\n");
      if (/ds-exception:/.test(before)) continue;
      tally.set(match[1]!, (tally.get(match[1]!) ?? 0) + 1);
    }
    for (const [tag, n] of tally) add(file, `raw <${tag}>`, n);
  }
  for (const file of files(root, ".css")) {
    const source = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    add(file, "colour literal", (source.match(COLOUR) ?? []).length);
    add(file, "currentColor border", (source.match(CURRENT_BORDER) ?? []).length);
    const selectors = [...source.matchAll(/([^{}]+)\{/g)].map((match) => match[1]!.trim()).filter((selector) => !selector.startsWith("@") && !/^\d+%|^(from|to)$/.test(selector));
    const reskin = selectors.filter((selector) => /(^|[\s,>+~])(input|select|textarea|button)(?=[\s,>+~:.[]|$)/.test(selector));
    add(file, "kit control restyled by element", reskin.length);
  }
  return counts;
}

if (process.env.UPDATE_BASELINE) {
  writeFileSync(baselinePath, `${JSON.stringify(measure(), null, 2)}\n`);
  console.log(`baseline written: ${baselinePath}`);
}

test("the Maker's own UI uses no more raw controls and literals than the baseline", () => {
  const baseline: Record<string, number> = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, "utf8")) : {};
  const now = measure();
  const worse = Object.entries(now).filter(([key, n]) => n > (baseline[key] ?? 0)).map(([key, n]) => `${key}: ${n} (baseline ${baseline[key] ?? 0})`);
  assert.deepEqual(worse, [], "new raw controls or literals. Use the kit's component or a token instead.");
});

test("the baseline is tight: every migration lowers it", () => {
  const baseline: Record<string, number> = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, "utf8")) : {};
  const now = measure();
  const stale = Object.entries(baseline).filter(([key, n]) => (now[key] ?? 0) < n).map(([key, n]) => `${key}: ${now[key] ?? 0} now, baseline ${n}`);
  assert.deepEqual(stale, [], "something was migrated: run UPDATE_BASELINE=1 node scripts/design-system.test.ts and commit the lower numbers.");
});
