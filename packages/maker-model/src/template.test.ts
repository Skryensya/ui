import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { describe, expect, it } from "vitest";
import { counterIds, toUsageTree } from "./project.js";
import { childrenOf, isNode, walk } from "./node.js";
import { applySite, composePage, parseSite } from "./site.js";
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
    it(`${template.id} opens as a sound page, without the gallery's classes`, () => {
      const { title, tree } = template.locales.es!;
      const site = siteFromTemplate(tree, { pageName: title, sourceHash: "hash", newId: counterIds() });
      expect(site.pages[0]!.root.signature).toBe("Main");
      const projected = toUsageTree(site.pages[0]!.root);
      const text = JSON.stringify(projected);
      expect(text).not.toContain('"class"');
      const broken = validateUsageTree(projected).problems.filter((problem) => STRUCTURAL.has(problem.rule));
      expect(broken.map((problem) => `${problem.rule}: ${problem.path}`)).toEqual([]);
    });
  }
});

describe("an application template", () => {
  const shell = artifact.templates.find((template) => template.id === "app-shell")!;
  const { title, tree, prompt } = shell.locales.es! as { title: string; tree: UsageTree; prompt?: string };
  const site = siteFromTemplate(tree, { pageName: title, sourceHash: "hash", newId: counterIds(), prompt });

  it("opens as the project's layout (the frame) and a page (what was inside its Main)", () => {
    const layout = site.layouts?.[0];
    expect(layout?.root.signature).toBe("AppShell");
    expect(site.defaultLayout).toBe(layout?.id);
    const frame = childrenOf(layout!.root, "children").filter(isNode).map((node) => node.signature);
    expect(frame).toEqual(["SkipLink", "Navbar", "Sidebar", "Main", "Vaul.drawer"]);
    const outlet = childrenOf(layout!.root, "children").filter(isNode).find((node) => node.signature === "Main")!;
    expect(childrenOf(outlet, "children")).toEqual([]);
    expect(childrenOf(site.pages[0]!.root, "children").length).toBeGreaterThan(0);
  });

  it("draws as one AppShell with one main, and reopens as a sound site", () => {
    const drawn = composePage(site, site.pages[0]!).root;
    expect(drawn.signature).toBe("AppShell");
    expect([...walk(drawn)].filter((node) => node.signature === "Main")).toHaveLength(1);
    const reopened = parseSite(JSON.stringify(site), "hash", counterIds("r"));
    expect(reopened.ok).toBe(true);
    const broken = validateUsageTree(toUsageTree(drawn)).problems.filter((problem) => STRUCTURAL.has(problem.rule));
    expect(broken.map((problem) => `${problem.rule}: ${problem.path}`)).toEqual([]);
  });

  it("brings its prompt for Maker AI, which the project then owns", () => {
    expect(site.prompt).toContain("Northstar");
    const edited = applySite(site, { type: "setPrompt", prompt: "  A different product.  " });
    expect(edited.ok && edited.site.prompt).toBe("A different product.");
    const cleared = applySite(site, { type: "setPrompt", prompt: "" });
    expect(cleared.ok && "prompt" in cleared.site).toBe(false);
  });
});
