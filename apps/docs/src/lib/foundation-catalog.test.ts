import { describe, expect, it } from "vitest";
import { canonicalPath } from "../i18n";
import { foundationGroups } from "./foundation-catalog";
import { documentationNavigation, getNavigation, type NavigationSection } from "./navigation";

const authored: NavigationSection = documentationNavigation.find((section) => section.id === "foundations")!;

describe.each(["es", "en"] as const)("foundations reading guide (%s)", (locale) => {
  const groups = foundationGroups(locale);

  it("shows every published foundation, once, without exposing unlisted pages", () => {
    const actual = groups.flatMap((group) => group.items.map((item) => canonicalPath(item.href)));
    const visible = getNavigation(locale).find((section) => section.id === "foundations")!.groups
      .flatMap((group) => group.items.filter((item) => !item.todo).map((item) => canonicalPath(item.href)));
    expect(actual.slice().sort()).toEqual(visible.sort());
    expect(new Set(actual).size).toBe(actual.length);
    expect(actual).not.toContain("/density");
  });

  it("keeps the authored reading order in every section", () => {
    for (const [index, group] of groups.entries()) {
      expect(group.items.map((item) => canonicalPath(item.href))).toEqual(authored.groups[index]!.items.map((item) => item.href));
    }
    expect(groups[0]!.items.map((item) => canonicalPath(item.href))).toEqual([
      "/prerequisites", "/installation", "/first-component", "/automatic-mounting",
    ]);
  });

  it("describes every topic in the current language", () => {
    for (const item of groups.flatMap((group) => group.items)) {
      expect(item.label.trim(), item.href).not.toBe("");
      expect(item.description.trim(), item.href).not.toBe("");
    }
  });

  it("preserves the existing section anchors", () => {
    expect(groups.map((group) => group.headingId)).toEqual(groups.map((_group, index) => `foundations-group-${index}`));
  });
});
