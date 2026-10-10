import { emitMarkup } from "@skryensya/ai-compiler/emit";
import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { describe, expect, it } from "vitest";
import { useTranslations } from "../i18n";
import { fadeDirectionTree } from "./fade-edge";

for (const locale of ["es", "en"] as const) {
  describe(`FadeEdge direction example (${locale})`, () => {
    const t = useTranslations(locale);
    for (const direction of ["to-bottom", "to-top", "to-right", "to-left", "horizontal", "vertical"] as const) {
      it(`uses localized content and matching scroll geometry for ${direction}`, () => {
        const tree = fadeDirectionTree(t, direction);
        expect(validateUsageTree(tree).problems.filter((p) => p.severity === "error")).toEqual([]);
        const markup = emitMarkup(tree);
        expect(markup).toContain(`data-direction="${direction}"`);
        expect(markup).toContain('tabindex="0"');
        expect(markup).toContain('role="region"');
        const horizontal = ["to-right", "to-left", "horizontal"].includes(direction);
        expect(markup).toContain(horizontal ? "overflow-x: auto" : "overflow-y: auto");
        expect(markup).toContain(t(horizontal ? "demo.fadeEdge.agenda.session1" : "demo.fadeEdge.activity.action2"));
        expect(markup).not.toContain("demo.fadeEdge.");
      });
    }
  });
}
