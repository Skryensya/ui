import type { UsageTree } from "@skryensya/core/usage-tree";
import { brokenInvariants } from "../invariants.js";
import { quality, textsOf } from "./ui-checks.js";
import type { UiCase } from "./ui-cases.js";

export type Score = { readonly pass: boolean; readonly failures: readonly string[]; readonly warnings: readonly string[] };

/**
 * One attempt against one case: what the case's invariants say, what every page must be (quality), and for edits that what
 * was asked changed and everything else stayed. `failures` fail the attempt; `warnings` are reported.
 */
export function scoreAttempt(entry: UiCase, page: UsageTree, given: string): Score {
  const failures = [...brokenInvariants(page, entry.invariants)];
  const copy = textsOf(page);
  const has = (text: string) => copy.some((piece) => piece.includes(text));
  for (const text of entry.keeps ?? []) if (!has(text)) failures.push(`lost "${text}": the page was meant to keep it`);
  for (const text of entry.removes ?? []) if (has(text)) failures.push(`still has "${text}": it was meant to be removed`);
  for (const text of entry.adds ?? []) if (!has(text)) failures.push(`missing "${text}": it was asked for`);
  const checked = quality(page, given);
  failures.push(...checked.problems.map((problem) => `quality: ${problem}`));
  return { pass: failures.length === 0, failures, warnings: checked.warnings };
}
