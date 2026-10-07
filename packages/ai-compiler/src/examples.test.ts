import { duplicateIds, entries, fixedExamples, hasIntent, intents, isLocalePair, pairsIn, patterns, relationsOf, unplacedFixed, uses, type Locale } from "@skryensya/examples";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { reviewTree } from "./quality.js";
import { sheetsForTree } from "./sheets-for-tree.js";
import { validateUsageTree } from "./validate.js";

/*
 * THE EXAMPLE LIBRARY, HELD TO ITS OWN MODEL.
 *
 * Three kinds of check, because an example can be wrong in three ways. Its TREE can be wrong (a contract
 * rejects it, a review finds an accessibility failure, a class it emits has no stylesheet). Its FILING can
 * be wrong (an intent that is not in the taxonomy, a use for a pattern that does not exist, a pattern
 * nobody lists). And its WORDS can be wrong (a Spanish half that was never written). The first is what the
 * old snippet gate covered; the other two are what a model with a taxonomy adds.
 */
const here = dirname(fileURLToPath(import.meta.url));
const library = join(here, "..", "..", "..", "contracts", "examples", "library");
const locales: readonly Locale[] = ["en", "es"];

describe("the library's filing", () => {
  it("has no id taken twice", () => {
    expect(duplicateIds()).toEqual([]);
  });

  it("files every fixed example", () => {
    expect(unplacedFixed()).toEqual([]);
  });

  it("gives every pattern at least one use, and every use a pattern", () => {
    const known = new Set(patterns.map((pattern) => pattern.id));
    expect(uses.filter((use) => !known.has(use.pattern)).map((use) => use.id)).toEqual([]);
    const used = new Set(uses.map((use) => use.pattern));
    expect(patterns.filter((pattern) => !used.has(pattern.id)).map((pattern) => pattern.id)).toEqual([]);
  });

  it("names only intents that are in the taxonomy", () => {
    expect([...uses.map((use) => use.intent), ...fixedExamples.map((entry) => entry.intent)].filter((id) => !hasIntent(id))).toEqual([]);
  });

  it("leaves no intent empty: a taxonomy line nothing is filed under is a good intention", () => {
    const filed = new Set(entries("en").map((entry) => entry.intent));
    expect(intents.filter((intent) => !filed.has(intent.id)).map((intent) => intent.id)).toEqual([]);
  });

  it("keeps intent ids three segments of kebab-case", () => {
    expect(intents.filter((intent) => !/^[a-z]+\/[a-z-]+\/[a-z-]+$/.test(intent.id)).map((intent) => intent.id)).toEqual([]);
  });

  it("lists every pattern file in library/index.ts", () => {
    const index = readFileSync(join(library, "index.ts"), "utf8");
    const missing: string[] = [];
    for (const dir of readdirSync(library, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
      for (const file of readdirSync(join(library, dir.name)).filter((name) => name.endsWith(".ts") && name !== "fields.ts")) {
        if (!index.includes(`"./${dir.name}/${file.replace(/\.ts$/, ".js")}"`)) missing.push(`${dir.name}/${file}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("points every written relation at an example that exists", () => {
    const ids = new Set(entries("en").map((entry) => entry.id));
    const broken = entries("en").flatMap((entry) => (relationsOf(entry.id)?.related ?? []).filter((relation) => !ids.has(relation.id)).map((relation) => `${entry.id} -> ${relation.id}`));
    expect(broken).toEqual([]);
  });

  it("reads each composition's parts through render(), so containment is the graph's", () => {
    const composed = entries("en").filter((entry) => entry.scale === "composition" && entry.kind === "use");
    expect(composed.filter((entry) => (relationsOf(entry.id)?.contains ?? []).length === 0).map((entry) => entry.id)).toEqual([]);
  });
});

describe("the library's words", () => {
  it("writes both halves of every translated pair", () => {
    const empty: string[] = [];
    for (const use of uses) {
      for (const [path, pair] of pairsIn(use.content)) if (!pair.en.trim() || !pair.es.trim()) empty.push(`${use.id}: ${path}`);
      for (const text of [use.title, use.purpose]) if (typeof text === "object" && !isLocalePair(text)) empty.push(`${use.id}: malformed text`);
    }
    expect(empty).toEqual([]);
  });

  it("translates every use: the Spanish tree is not the English one", () => {
    const en = new Map(entries("en").map((entry) => [entry.id, JSON.stringify(entry.tree)]));
    const same = entries("es")
      .filter((entry) => entry.kind === "use" && en.get(entry.id) === JSON.stringify(entry.tree))
      .map((entry) => entry.id);
    expect(same).toEqual([]);
  });
});

function segmentedLabelsWithParentheses(node: unknown, found: string[] = []): string[] {
  if (Array.isArray(node)) node.forEach((child) => segmentedLabelsWithParentheses(child, found));
  else if (node && typeof node === "object") {
    const tree = node as { signature?: string; options?: { label?: unknown }; slots?: { items?: { slots?: { label?: unknown } }[] } };
    if (tree.signature === "Segmented") {
      for (const label of [tree.options?.label, ...(tree.slots?.items ?? []).map((item) => item.slots?.label)]) if (typeof label === "string" && /[(（]/.test(label)) found.push(label);
    }
    for (const value of Object.values(node)) segmentedLabelsWithParentheses(value, found);
  }
  return found;
}

for (const locale of locales) {
  describe(`the library's trees (${locale})`, () => {
    for (const entry of entries(locale)) {
      it(entry.id, () => {
        const errors = (validateUsageTree(entry.tree).problems ?? []).filter((problem) => problem.severity === "error");
        expect(errors.map((problem) => `${problem.path}: ${problem.message}`)).toEqual([]);

        const review = reviewTree(entry.tree).findings.filter((finding) => finding.severity === "error" && !(entry.scale !== "page" && ["one-h1", "one-main", "skip-link"].includes(finding.rule)));
        expect(review.map((finding) => `${finding.rule} at ${finding.path}: ${finding.message}`)).toEqual([]);

        expect(sheetsForTree(entry.tree).unplaced).toEqual([]);

        /* A Segmented option is one short word. What qualifies it ("Annual (2 months free)") is a note beside the control. */
        expect(segmentedLabelsWithParentheses(entry.tree)).toEqual([]);
      });
    }
  });
}
