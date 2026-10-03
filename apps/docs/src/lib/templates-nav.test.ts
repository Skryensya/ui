import { describe, expect, it } from "vitest";
import { useTranslations } from "../i18n";
import { templateGroups, templateSections } from "./templates-nav";

/* The rail, the drawer and the stage walk one sequence: every template in exactly one group, groups in order. */
describe("the templates navigation", () => {
  const t = useTranslations("en");

  it("puts every template in exactly one group", () => {
    const grouped = templateGroups(t).flatMap((group) => group.sections.map((section) => section.id));
    expect(grouped).toEqual(templateSections(t).map((section) => section.id));
    expect(new Set(grouped).size).toBe(grouped.length);
  });

  it("names the five groups, in order", () => {
    expect(templateGroups(t).map((group) => group.label)).toEqual(["Application", "Marketing", "Content", "Flows", "System"]);
  });
});
