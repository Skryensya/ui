/*
 * The `appearance-sheet` rule and the sibling exemption from rules 6 and 7, through `runChecks`.
 *
 * `components/button.css` beside `components/button.tactile.css` only saves anyone anything if the base
 * really stays free of the tactile rules, and if a sibling holds its own value and no other.
 *
 * Run: `node --test scripts/appearance-sheets.test.ts`
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { runChecks, type CheckableCorpus, type Problem } from "./checks.ts";

function corpus(partial: Partial<CheckableCorpus> = {}): CheckableCorpus {
  return {
    files: [],
    declaredTier: new Map(),
    baseSemantic: new Map(),
    hcByName: new Map(),
    paletteMap: () => new Map(),
    resolveColor: () => null,
    ...partial,
  };
}
const rules = (problems: Problem[]) => new Set(problems.map((p) => p.rule));

const sheet = (rel: string, css: string, hooks = true) => ({
  tier: "component" as const,
  rel,
  css,
  decls: hooks ? [{ name: "--sk-toolbar-bg", value: "var(--color-bg-surface)" }] : [],
});
const baseCss = "@layer components { .sk-toolbar { --sk-toolbar-bg: red; background: var(--sk-toolbar-bg); } }";
const tactileCss = '@layer components { .sk-toolbar[data-appearance="tactile"] { translate: 0 1px; } }';

test("a base that still holds a rule of a value that has its own sheet fails", () => {
  const problems = runChecks(
    corpus({ files: [sheet("components/toolbar.css", `${baseCss} ${tactileCss}`), sheet("components/toolbar.tactile.css", tactileCss, false)] }),
  );
  const found = problems.find((p) => p.rule === "appearance-sheet");
  assert.ok(found, "the stray tactile rule in the base is reported");
  assert.match(found.msg, /toolbar\.tactile\.css exists/);
});

test("a sibling that names another value fails", () => {
  const brutalist = '@layer components { .sk-toolbar[data-appearance="brutalist"] { outline: 2px solid; } }';
  const problems = runChecks(corpus({ files: [sheet("components/toolbar.css", baseCss), sheet("components/toolbar.tactile.css", brutalist, false)] }));
  assert.ok(problems.some((p) => p.rule === "appearance-sheet" && /"brutalist" but is the "tactile" sheet/.test(p.msg)));
});

test("a base that only EXCLUDES the value, beside a clean sibling, passes", () => {
  const excludes = '@layer components { .sk-toolbar:active:not([data-appearance="tactile"]) { scale: 0.98; } }';
  const problems = runChecks(
    corpus({ files: [sheet("components/toolbar.css", `${baseCss} ${excludes}`), sheet("components/toolbar.tactile.css", tactileCss, false)] }),
  );
  assert.ok(!rules(problems).has("appearance-sheet"));
});

test("a sheet with no sibling is left alone, whatever appearances it names", () => {
  const problems = runChecks(corpus({ files: [sheet("components/toolbar.css", `${baseCss} ${tactileCss}`)] }));
  assert.ok(!rules(problems).has("appearance-sheet"));
});

test("a sibling needs no hooks or structure of its own: its base carries them", () => {
  const problems = runChecks(corpus({ files: [sheet("components/toolbar.css", baseCss), sheet("components/toolbar.tactile.css", tactileCss, false)] }));
  assert.ok(!rules(problems).has("component-ships-hooks"));
  assert.ok(!rules(problems).has("component-ships-structure"));
});
