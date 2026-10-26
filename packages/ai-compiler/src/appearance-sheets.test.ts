import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CSS_DIR } from "@skryensya/core/parse";
import { contractIds, getContract } from "@skryensya/core/registry";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { sheetsForTree } from "./sheets-for-tree.js";

/*
 * Each appearance has its own stylesheet (`button.tactile.css` beside `button.css`), and the contract
 * says which sheet belongs to which value. Two things have to hold: the DATA is coherent (every named
 * sheet exists, every sibling file is named by someone), and `sheetsForTree` asks for exactly the sheets
 * a tree needs, which is what lets a consumer link `button.brutalist.css` only when it writes
 * `appearance="brutalist"`.
 */

const SIBLING = /^[a-z0-9-]+\.[a-z]+\.css$/;
const siblingFiles = readdirSync(join(CSS_DIR, "components")).filter(
  (f) => SIBLING.test(f) && existsSync(join(CSS_DIR, "components", f.replace(/\.[a-z]+\.css$/, ".css"))),
);
const named = new Set<string>();
for (const id of contractIds()) {
  const c = getContract(id)!;
  for (const o of Object.values(c.options)) for (const list of Object.values(o.sheets ?? {})) list.forEach((s) => named.add(s.split("/").pop()!));
  for (const list of Object.values(c.memberAppearanceSheets ?? {})) list.forEach((s) => named.add(s.split("/").pop()!));
}

describe("appearance sheets: the contract data", () => {
  it("names only values the option has, and only sheets that exist", () => {
    const problems: string[] = [];
    for (const id of contractIds()) {
      const c = getContract(id)!;
      for (const [key, o] of Object.entries(c.options)) {
        for (const [value, list] of Object.entries(o.sheets ?? {})) {
          if (!o.values?.includes(value)) problems.push(`${id}.${key}: sheets names "${value}", which is not one of its values`);
          if (o.default === value) problems.push(`${id}.${key}: the default "${value}" has a sheet, so a tree could never leave it out`);
          for (const s of list) if (!existsSync(join(CSS_DIR, s.replace("@skryensya/core/", "")))) problems.push(`${id}.${key}.${value}: ${s} does not exist`);
        }
      }
      for (const [value, list] of Object.entries(c.memberAppearanceSheets ?? {})) {
        for (const s of list) if (!existsSync(join(CSS_DIR, s.replace("@skryensya/core/", "")))) problems.push(`${id}.memberAppearanceSheets.${value}: ${s} does not exist`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("leaves no appearance sheet that no contract names (it would ship to nobody)", () => {
    // A sheet only a `data-appearance` ATTR reaches (StateButton forwards Button's look) is named through its owner's siblings.
    const orphans = siblingFiles.filter((f) => !named.has(f));
    expect(orphans).toEqual([]);
  });

  it("lists, for each value, the sheets of the contract's OWN family and nothing it merely builds on", () => {
    const exists = (file: string) => siblingFiles.includes(file);
    const problems: string[] = [];
    for (const id of contractIds()) {
      const c = getContract(id)!;
      const own = [c.css, ...(c.hookSheets ?? [])].map((s) => s.split("/").pop()!);
      for (const [key, o] of Object.entries(c.options)) {
        for (const [value, list] of Object.entries(o.sheets ?? {})) {
          const expected = own.map((base) => base.replace(/\.css$/, `.${value}.css`)).filter(exists);
          const actual = list.map((s) => s.split("/").pop()!);
          if (JSON.stringify(actual) !== JSON.stringify(expected)) problems.push(`${id}.${key}.${value}: lists ${actual.join(", ")}; its own sheets have ${expected.join(", ")}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it("imports nothing: not its base, and not another appearance, because a copied @import pastes it again behind whatever loaded since", () => {
    const offenders = siblingFiles.filter((f) => /^@import/m.test(readFileSync(join(CSS_DIR, "components", f), "utf8")));
    expect(offenders).toEqual([]);
  });

  it("finds some sheets to check, so the two tests above cannot pass on an empty corpus", () => {
    expect(siblingFiles.length).toBeGreaterThan(50);
    expect(named.size).toBe(siblingFiles.length);
  });
});

describe("appearance sheets: what a tree asks for", () => {
  const button = (options: Record<string, string> = {}): UsageTree => ({ contract: "button", signature: "Button.action", options, children: "Go" });
  const names = (tree: UsageTree) => sheetsForTree(tree).sheets.map((s) => s.split("/").pop());

  it("a plain Button loads the base sheet and no appearance", () => {
    expect(names(button())).not.toContain("button.brutalist.css");
    expect(names(button())).not.toContain("button.tactile.css");
    expect(names(button())).toContain("button.css");
  });

  it("asks for exactly the sheet of the value written", () => {
    const sheets = names(button({ appearance: "brutalist" }));
    expect(sheets).toContain("button.brutalist.css");
    expect(sheets).not.toContain("button.tactile.css");
    expect(sheets).not.toContain("button.frosted.css");
  });

  it("a ButtonGroup loads its own weld for the appearance one of its members asks for", () => {
    const group = (appearance?: string): UsageTree => ({
      contract: "button-group",
      signature: "ButtonGroup",
      children: [button(appearance ? { appearance } : {}), button(appearance ? { appearance } : {})],
    });
    expect(names(group("brutalist"))).toEqual(expect.arrayContaining(["button-group.brutalist.css", "button.brutalist.css"]));
    expect(names(group())).not.toContain("button-group.brutalist.css");
  });

  it("lists each appearance right after its own base, bases in alphabetical order (the order the one file had)", () => {
    const tree: UsageTree = {
      contract: "button-group",
      signature: "ButtonGroup",
      children: [button({ appearance: "brutalist" }), button({ appearance: "brutalist" })],
    };
    const sheets = names(tree).filter((s) => /^button(-group)?\./.test(s!));
    expect(sheets).toEqual(["button-group.css", "button-group.brutalist.css", "button.css", "button.brutalist.css"]);
  });

  it("a part that borrows `.sk-button` (a copy button) loads Button's sheet for the value it was given", () => {
    const tree: UsageTree = { contract: "clipboard", signature: "CopyButton", options: { appearance: "tactile" } } as UsageTree;
    expect(names(tree)).toContain("button.tactile.css");
  });

  it("an appearance written as an authored attr (StateButton forwards Button's look) still counts", () => {
    const tree: UsageTree = {
      contract: "state-button",
      signature: "StateButton",
      options: { current: "idle" },
      attrs: { "aria-label": "Copy", "data-appearance": "brutalist" },
      slots: { faces: [{ options: { name: "idle", icon: "copy" }, slots: {} }] },
    };
    expect(names(tree)).toContain("button.brutalist.css");
  });
});
