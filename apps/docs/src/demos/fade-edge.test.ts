import { emitMarkup } from "@skryensya/ai-compiler/emit";
import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { describe, expect, it } from "vitest";
import { useTranslations } from "../i18n";
import { fadeModeTree } from "./fade-edge";

for (const locale of ["es", "en"] as const) {
  describe(`FadeEdge mode example (${locale})`, () => {
    const t = useTranslations(locale);

    it("renders both modes with localized content and a keyboard-accessible scroller", () => {
      for (const mode of ["transparent", "color"] as const) {
        const specimen = fadeModeTree(t);
        const children = specimen.children as UsageTree[];
        const region: UsageTree = { ...children[1], options: { ...children[1].options, mode } };
        const tree: UsageTree = { ...specimen, children: [children[0], region, children[2]] };
        expect(validateUsageTree(tree).problems.filter((p) => p.severity === "error")).toEqual([]);
        const markup = emitMarkup(tree);
        expect(markup).toContain(t("demo.fadeEdge.activity.title"));
        expect(markup).toContain(t("demo.fadeEdge.activity.action2"));
        expect(markup).not.toContain("demo.fadeEdge.");
        const scroller = region.children as UsageTree;
        expect(scroller.attrs).toMatchObject({ tabindex: "0", role: "region" });
        expect(region.attrs?.style).not.toContain("overflow-y: auto");
        expect(region.attrs?.style).toContain("--sk-fade-edge-color: var(--color-bg-surface-raised)");
        expect(markup).toContain(`data-fade="${mode}"`);
      }
    });

    it("uses a patterned backdrop and the same solid surface for the panel and color fade", () => {
      const tree = fadeModeTree(t);
      expect(tree.attrs?.style).toContain("conic-gradient");
      expect(tree.attrs?.style).toContain("background-size: 1.5rem 1.5rem");
      const region = (tree.children as UsageTree[])[1];
      expect(region.attrs?.style).toContain("background: var(--color-bg-surface-raised)");
      const scroller = region.children as UsageTree;
      expect(scroller.attrs?.style).toContain("overflow-y: auto");
      expect(scroller.attrs?.style).toContain("block-size: 12rem");
      expect(region.attrs?.style).toContain("overflow: hidden");
      expect(emitMarkup(tree).replace(/\s+/g, " ")).toContain(t("demo.fadeEdge.mode.hint"));
    });
  });
}
