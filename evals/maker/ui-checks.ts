import type { UsageTree } from "@skryensya/core/usage-tree";
import { counterIds, fromUsageTree, layoutAdvice, pending, type MakerNode } from "@skryensya/maker-model";
import { walkUsageTree } from "@skryensya/ai-compiler/usage-walk";

/*
 * THE CHECKS EVERY GENERATED PAGE FACES, whatever it was asked for. They are the things a person notices in the first second
 * and the model keeps getting wrong, so they are measured on every attempt of every case, not argued about in a prompt.
 *
 *   problems  (an attempt fails)   the tree breaks a contract rule, or has the arrangement mistakes the layout advice names
 *                                  (loose content in a Wrapper, buttons stacked instead of side by side, no width ceiling).
 *   warnings  (reported, not failed) text that reads like a FACT nobody gave: a price, a percentage, an email, a link. Maker AI
 *                                  must leave those as placeholders; a heuristic, so it warns instead of deciding.
 */
export type Quality = { readonly problems: readonly string[]; readonly warnings: readonly string[] };

const node = (tree: UsageTree): MakerNode => fromUsageTree(tree, counterIds("q")) as MakerNode;

/** Every piece of copy in a tree, in document order: text children and text slots. */
export function textsOf(tree: UsageTree): string[] {
  const out: string[] = [];
  const add = (value: unknown) => {
    if (typeof value === "string") out.push(value);
    else if (Array.isArray(value)) value.forEach(add);
  };
  walkUsageTree(tree, (each) => {
    add(each.children);
    for (const slot of Object.values(each.slots ?? {})) if (typeof slot === "string") out.push(slot);
  });
  return out;
}

const FACT = [
  { re: /[$€£]\s?[1-9]\d*(?:[.,]\d+)?/, what: "a price" },
  { re: /\b[1-9]\d*(?:[.,]\d+)?\s?%/, what: "a percentage" },
  { re: /[\w.+-]+@[\w-]+\.[\w.-]+/, what: "an email address" },
  { re: /https?:\/\/\S+/, what: "a web address" },
  { re: /\+?\d[\d\s().-]{8,}\d/, what: "a phone number" },
] as const;

/** Facts in the copy that the person never gave: not in the prompt, not on the page it started from. */
export function inventedFacts(tree: UsageTree, given: string): string[] {
  const known = given.toLowerCase();
  const found: string[] = [];
  for (const text of textsOf(tree)) {
    for (const { re, what } of FACT) {
      const hit = re.exec(text)?.[0];
      if (hit && !known.includes(hit.toLowerCase())) found.push(`${what} ("${hit}")`);
    }
  }
  return [...new Set(found)];
}

export function quality(tree: UsageTree, given: string): Quality {
  const root = node(tree);
  const state = pending(root);
  const problems = [
    ...state.problems.filter((problem) => problem.severity === "error").map((problem) => `${problem.rule}: ${problem.message}`),
    ...layoutAdvice(root),
  ];
  return { problems, warnings: inventedFacts(tree, given).map((fact) => `invented ${fact}`) };
}
