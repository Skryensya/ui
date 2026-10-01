import { emitMarkup } from "@skryensya/ai-compiler/emit";
import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { describe, expect, it } from "vitest";
import { useTranslations } from "../i18n";
import {
  feedBusyTree,
  feedDontFixedListTree,
  feedDontGenericLabelsTree,
  feedDontMixedOrderTree,
  feedDontSpinnerTree,
  feedFixedListTree,
  feedGuideTree,
  feedTree,
} from "./feed";

const articles = (tree: UsageTree) => tree.children as UsageTree[];

for (const locale of ["es", "en"] as const) {
  const t = useTranslations(locale);
  describe(`Feed comparisons (${locale})`, () => {
    it("renders contract-valid specimens with a shared heading and width", () => {
      for (const [good, bad, fixed] of [
        [feedBusyTree(t), feedDontSpinnerTree(t), false],
        [feedFixedListTree(t), feedDontFixedListTree(t), true],
        [feedTree(t), feedDontGenericLabelsTree(t), false],
        [feedTree(t), feedDontMixedOrderTree(t), false],
      ] as const) {
        const pair = [good, bad].map((tree) => feedGuideTree(t, tree, fixed));
        expect(pair[0].attrs).toEqual(pair[1].attrs);
        expect(articles(pair[0])[0]).toEqual(articles(pair[1])[0]);
        for (const specimen of pair) {
          const result = validateUsageTree(specimen);
          expect(result.problems.filter((problem) => problem.severity === "error")).toEqual([]);
          expect(emitMarkup(specimen)).not.toContain("demo.feed.");
        }
      }
    });

    it("changes only the labels in the identification comparison", () => {
      const good = articles(feedTree(t));
      const bad = articles(feedDontGenericLabelsTree(t));
      expect(bad).toHaveLength(good.length);
      bad.forEach((article, index) => {
        expect(article).toEqual({ ...good[index], slots: { label: t("demo.feed.genericLabel") } });
      });
    });

    it("preserves all fixed instructions in the ordered list alternative", () => {
      expect(feedFixedListTree(t).signature).toBe("OrderedList");
      const good = articles(feedFixedListTree(t));
      articles(feedDontFixedListTree(t)).forEach((article, index) => {
        expect(good[index].slots?.title).toBe(article.slots?.label);
        expect(good[index].slots?.description).toBe(article.children);
      });
    });

    it("changes temporal order without changing posts or accessible positions", () => {
      const good = articles(feedTree(t));
      const bad = articles(feedDontMixedOrderTree(t));
      expect(bad.map((article) => article.children)).toEqual([good[0].children, good[2].children, good[1].children]);
      expect(bad.map((article) => article.options?.posInset)).toEqual([1, 2, 3]);
    });

    it("preserves the loaded post only in the good loading example", () => {
      const good = emitMarkup(feedBusyTree(t));
      const bad = emitMarkup(feedDontSpinnerTree(t));
      expect(good).toContain(t("demo.feed.body1"));
      expect(bad).not.toContain(t("demo.feed.body1"));
      expect(good).toContain(t("demo.feed.loadingLabel"));
      expect(bad).toContain(t("demo.feed.loadingLabel"));
    });
  });
}
