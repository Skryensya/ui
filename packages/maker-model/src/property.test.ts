import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { describe, expect, it } from "vitest";
import { commit, startHistory, undo, type History } from "./history.js";
import { childrenOf, findNode, isNode, locate, walk, walkChildren, type MakerNode } from "./node.js";
import type { Operation } from "./operations.js";
import { createPage } from "./page.js";
import { presetFor } from "./preset.js";
import { counterIds, reidentify, toUsageTree } from "./project.js";
import { catalogue, dropTargets, resolve } from "./structure.js";
import { samplePage } from "./test-page.js";

/*
 * THE PROPERTY THAT MAKES "NEVER COORDINATES" A FACT RATHER THAN A HOPE. Any sequence of operations,
 * from any starting page, yields a page whose projection:
 *
 *   - breaks no rule of STRUCTURE (what may sit where, what HTML may contain, which values exist);
 *     options may be pending, since nothing forces an author to finish;
 *   - carries no attribute or option that could place anything: no style, no class, no x or y;
 *   - keeps every identity unique;
 *
 * and undoing every step gives back the page it started from. Seeded, so a failure names the seed
 * that reproduces it. No property-testing library: the repository's supply-chain policy weighs a
 * dependency more than forty lines of generator.
 */

const STRUCTURAL = new Set([
  "unknown-contract",
  "unknown-signature",
  "unknown-slot",
  "slot-accepts",
  "invalid-child",
  "invalid-parent",
  "invalid-ancestor",
  "content-model",
  "unknown-option",
  "invalid-option-value",
  "invalid-attr-value",
  "shadowed-attr",
]);

const PLACING = /^(style|class|x|y|top|left|right|bottom|width|height|inset|transform|translate|position|margin.*|offset.*)$/i;

/** mulberry32: small, fast, and the same numbers on every machine. */
function random(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = <T,>(list: readonly T[]): T | undefined => (list.length === 0 ? undefined : list[Math.floor(next() * list.length)]);
  return { next, pick };
}

const LAYOUT = [
  { contract: "layout", signature: "Stack" },
  { contract: "layout", signature: "Inline" },
  { contract: "layout", signature: "Grid" },
  { contract: "box", signature: "Box" },
  { contract: "wrapper", signature: "Wrapper" },
];

function proposal(root: MakerNode, rng: ReturnType<typeof random>, newId: () => string, palette: ReturnType<typeof catalogue>): Operation | undefined {
  const nodes = [...walk(root)];
  const children = [...walkChildren(root)];
  switch (Math.floor(rng.next() * 7)) {
    case 0: {
      const child = rng.pick(children);
      const to = child && rng.pick(dropTargets(root, child));
      return child && to ? { type: "move", child: child.id, to } : undefined;
    }
    case 1: {
      const ref = rng.next() < 0.6 ? rng.pick(LAYOUT) : rng.pick(palette);
      const preset = ref && presetFor(ref, newId);
      const at = preset && rng.pick(dropTargets(root, preset));
      return preset && at ? { type: "insert", at, child: preset } : undefined;
    }
    case 2: {
      const child = rng.pick(children);
      return child ? { type: "remove", child: child.id } : undefined;
    }
    case 3: {
      const child = rng.pick(children);
      const at = child && locate(root, child.id);
      const ref = rng.pick(LAYOUT);
      const container = ref && presetFor(ref, newId);
      if (!at || !container) return undefined;
      const siblings = childrenOf(at.parent, at.slot);
      const span = 1 + Math.floor(rng.next() * Math.min(3, siblings.length - at.index));
      return { type: "wrap", children: siblings.slice(at.index, at.index + span).map((c) => c.id), container };
    }
    case 4: {
      const node = rng.pick(nodes);
      return node ? { type: "unwrap", node: node.id } : undefined;
    }
    case 5: {
      const node = rng.pick(nodes);
      const resolved = node && resolve(node);
      const name = resolved && rng.pick(resolved.signature.options);
      const option = name ? resolved!.contract.options[name] : undefined;
      if (!node || !name || !option) return undefined;
      const value = option.type === "enum" ? rng.pick(option.values ?? []) : option.type === "boolean" ? rng.next() < 0.5 : undefined;
      return { type: "setOption", node: node.id, name, value };
    }
    default: {
      const child = rng.pick(children);
      if (child && rng.next() < 0.5) return { type: "insert", at: { ...locate(root, child.id)!, parent: locate(root, child.id)!.parent.id, index: locate(root, child.id)!.index }, child: reidentify(child, newId) };
      const node = rng.pick(nodes.filter((n) => locate(root, n.id)?.parent.signature === "Inline"));
      return node ? { type: "setAttr", node: node.id, name: "data-sizing", value: rng.pick(["fit", "fill", "342px"]) } : undefined;
    }
  }
}

function checkInvariants(root: MakerNode, seed: number, step: number) {
  const tree = toUsageTree(root);
  const broken = validateUsageTree(tree).problems.filter((problem) => STRUCTURAL.has(problem.rule));
  expect(broken.map((p) => `${p.rule}: ${p.path}: ${p.message}`), `seed ${seed}, step ${step}`).toEqual([]);

  const ids = [root.id, ...[...walkChildren(root)].map((child) => child.id)];
  expect(new Set(ids).size, `seed ${seed}, step ${step}: duplicate identity`).toBe(ids.length);

  for (const node of walk(root)) {
    for (const name of [...Object.keys(node.attrs ?? {}), ...Object.keys(node.options ?? {})]) {
      expect(PLACING.test(name), `seed ${seed}, step ${step}: ${node.signature} carries "${name}"`).toBe(false);
    }
  }
}

describe("any sequence of operations", () => {
  const palette = catalogue();
  const seeds = Array.from({ length: 40 }, (_, i) => 1000 + i);

  it.each(seeds)("keeps the page sound and coordinate-free (seed %i)", (seed) => {
    const rng = random(seed);
    const newId = counterIds(`s${seed}-`);
    let history: History = startHistory({ ...createPage("hash", newId), root: samplePage() });
    const start = history.present;
    let applied = 0;

    for (let step = 0; step < 60; step++) {
      const operation = proposal(history.present.root, rng, newId, palette);
      if (!operation) continue;
      const result = commit(history, [operation]);
      if (!result.ok) continue;
      history = result.history;
      applied++;
      checkInvariants(history.present.root, seed, step);
    }

    expect(applied, `seed ${seed} applied almost nothing`).toBeGreaterThan(10);
    while (history.past.length > 0) history = undo(history);
    expect(history.present).toBe(start);
    expect(findNode(history.present.root, "main")).toBeDefined();
    expect(isNode(history.present.root)).toBe(true);
  });
});
