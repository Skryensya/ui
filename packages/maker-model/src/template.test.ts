import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { describe, expect, it } from "vitest";
import { counterIds, toUsageTree } from "./project.js";
import { siteFromTemplate } from "./template.js";
import templates from "../../../artifacts/templates.json" with { type: "json" };

/* The real templates the docs gallery shows, as the artifact the Maker reads. */
type Artifact = { templates: { id: string; locales: Record<string, { title: string; tree: UsageTree }> }[] };
const artifact = templates as unknown as Artifact;

const STRUCTURAL = new Set(["unknown-contract", "unknown-signature", "unknown-slot", "slot-accepts", "invalid-child", "invalid-parent", "invalid-ancestor", "content-model", "unsafe-url"]);

describe("docs templates as Maker sites", () => {
  it("covers every template the gallery shows", () => {
    expect(artifact.templates.length).toBeGreaterThanOrEqual(17);
  });

  for (const template of artifact.templates) {
    it(`${template.id} opens as a sound page, without the gallery's classes or phone-only stand-ins`, () => {
      const { title, tree } = template.locales.es!;
      const site = siteFromTemplate(tree, { pageName: title, sourceHash: "hash", newId: counterIds() });
      expect(site.pages[0]!.root.signature).toBe("Main");
      const projected = toUsageTree(site.pages[0]!.root);
      const text = JSON.stringify(projected);
      expect(text).not.toContain('"class"');
      expect(text).not.toContain("template-narrow-only");
      const broken = validateUsageTree(projected).problems.filter((problem) => STRUCTURAL.has(problem.rule));
      expect(broken.map((problem) => `${problem.rule}: ${problem.path}`)).toEqual([]);
    });
  }
});
