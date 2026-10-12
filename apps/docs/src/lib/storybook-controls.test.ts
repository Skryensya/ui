/*
 * THE STORYBOOKS' CONTROLS come from the root tree's contract (`storybook-kit/controls`): the options a Controls panel
 * offers are the ones the contract declares, with the contract's own values, and an arg changes the tree the story draws.
 */
import { describe, expect, it } from "vitest";
import { rootControls, withRootOptions } from "../../../../packages/storybook-kit/src/controls";
import { buttonDefaultTree } from "../demos/button";
import type { Translate } from "../i18n";
import { validateUsageTree } from "@skryensya/ai-compiler/validate";

const t = Object.assign((key: string) => key, { locale: "en" }) as unknown as Translate;
const tree = buttonDefaultTree(t);

describe("storybook controls", () => {
  it("offers the root's enum options as selects with the contract's values", () => {
    const { argTypes } = rootControls(tree);
    expect(argTypes.variant?.control).toBe("select");
    expect(argTypes.variant?.options).toContain("ghost");
    expect(argTypes.disabled?.control).toBe("boolean");
  });

  it("writes only the args that differ into the tree, and the result still validates", () => {
    const { args } = rootControls(tree);
    expect(withRootOptions(tree, args).options).toEqual(tree.options ?? {});
    const changed = withRootOptions(tree, { ...args, variant: "ghost" });
    expect(changed.options?.variant).toBe("ghost");
    expect(validateUsageTree(changed).problems.filter((problem) => problem.severity === "error")).toEqual([]);
  });
});
