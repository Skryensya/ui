import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { describe, expect, it } from "vitest";
import { buildVariant, variantsFor, wrapperChoices, type WrapperId } from "./variants.js";
import { counterIds, toUsageTree } from "./project.js";
import { catalogue } from "./structure.js";

/*
 * A VARIANT IS HELD TO THE BAR OF THE BASE PRESET: at worst pending (something still to fill in), never
 * wrong in a way the author did not cause. The rules below are the ones that mean "what is here is wrong".
 */
const WRONG = new Set([
  "unknown-option",
  "invalid-option-value",
  "restricted-option-value",
  "excluded-option",
  "slot-accepts",
  "unknown-slot",
  "invalid-child",
  "content-model",
  "unknown-attr",
  "invalid-attr-value",
  "shadowed-attr",
  "unknown-item-option",
  "duplicate-item-key",
]);

const wrongOf = (node: ReturnType<typeof buildVariant>) =>
  validateUsageTree(toUsageTree(node)).problems.filter((problem) => WRONG.has(problem.rule)).map((problem) => `${problem.rule} @ ${problem.path}: ${problem.message}`);

describe("variants of one component", () => {
  const refs = catalogue();
  const button = { contract: "button", signature: "Button.action" };

  it("always begin with the generated default, then the curated ones in the order they were written", () => {
    const names = variantsFor(button).map((variant) => variant.name);
    expect(names).toEqual(["Default", "Primary", "Secondary", "Quiet", "Destructive", "Icon only", "Primary and secondary"]);
    expect(variantsFor(button)[0]!.source).toBe("default");
  });

  it("have curated presets for the components that need them, each valid in every wrapper", () => {
    const names = (contract: string, signature: string) => variantsFor({ contract, signature }).map((variant) => variant.name);
    expect(names("callout", "Callout")).toEqual(["Default", "Information", "Success", "Warning", "Error with a way forward"]);
    expect(names("hero", "Hero")).toEqual(["Default", "Centered headline", "Headline with actions"]);
    expect(names("form-field", "FormField")).toEqual(["Default", "Text field", "With a hint", "Required email", "With an error"]);
  });

  it("fall back to the contract's own visual options when nothing is curated", () => {
    const badge = variantsFor({ contract: "badge", signature: "Badge" });
    expect(badge[0]!.name).toBe("Default");
    expect(badge.length).toBeGreaterThan(1);
    expect(badge.slice(1).every((variant) => variant.source === "generated")).toBe(true);
    expect(badge.some((variant) => variant.name.startsWith("Tone: "))).toBe(true);
  });

  it.each(refs.map((ref) => [`${ref.contract}/${ref.signature}`, ref] as const))("%s: every variant is at worst pending, bare and in every wrapper", (_name, ref) => {
    for (const variant of variantsFor(ref)) {
      for (const wrap of ["auto", ...wrapperChoices.map((choice) => choice.id)] as const) {
        const node = buildVariant(variant, wrap as "auto" | WrapperId, counterIds());
        expect(wrongOf(node), `${variant.id} in ${wrap}`).toEqual([]);
      }
    }
  });

  it("an icon-only button carries an accessible name and an icon", () => {
    const iconOnly = variantsFor(button).find((variant) => variant.id === "icon-only")!;
    const node = buildVariant(iconOnly, "none", counterIds());
    expect(node.attrs?.["aria-label"]).toBeTruthy();
    expect(node.options?.iconOnly).toBe(true);
    expect(node.slots.children).toMatchObject({ kind: "nodes", children: [{ contract: "icon", signature: "Icon" }] });
  });

  it("a variant arrives in its own wrapper unless the author chose another", () => {
    const pair = variantsFor(button).find((variant) => variant.id === "confirm-pair")!;
    const auto = buildVariant(pair, "auto", counterIds());
    expect(auto.signature).toBe("Inline");
    expect(auto.slots.children).toMatchObject({ kind: "nodes", children: [{ signature: "Button.action" }, { signature: "Button.action" }] });

    const stacked = buildVariant(pair, "stack", counterIds());
    expect(stacked.signature).toBe("Stack");
    const bare = buildVariant(pair, "none", counterIds());
    expect(bare.signature).toBe("Button.action");
  });

  it("a variant without a wrapper of its own arrives bare, and an explicit wrapper holds it", () => {
    const primary = variantsFor(button).find((variant) => variant.id === "primary")!;
    expect(buildVariant(primary, "auto", counterIds()).signature).toBe("Button.action");
    const boxed = buildVariant(primary, "box", counterIds());
    expect(boxed.signature).toBe("Box");
    expect(boxed.options).toMatchObject({ padding: "md", border: "subtle" });
    expect(boxed.slots.children).toMatchObject({ kind: "nodes", children: [{ signature: "Button.action", options: { tone: "accent" } }] });
  });

  it("mint a fresh identity for every node, so inserting one twice never collides", () => {
    const pair = variantsFor(button).find((variant) => variant.id === "confirm-pair")!;
    const ids = new Set<string>();
    const ids2 = counterIds();
    const collect = (node: ReturnType<typeof buildVariant>) => {
      ids.add(node.id);
      const held = node.slots.children;
      if (held?.kind === "nodes") for (const child of held.children) if ("signature" in child) collect(child as typeof node);
    };
    collect(buildVariant(pair, "auto", ids2));
    expect(ids.size).toBe(3);
  });
});
