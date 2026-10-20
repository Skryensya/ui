import { describe, expect, it } from "vitest";
import { navListLinkIsCurrent } from "./nav-list.js";

describe("navListLinkIsCurrent", () => {
  it("matches the exact path", () => {
    expect(navListLinkIsCurrent("/students", "/students")).toBe(true);
    expect(navListLinkIsCurrent("/students", "/staff")).toBe(false);
  });

  it("matches a route nested under href", () => {
    expect(navListLinkIsCurrent("/students/42", "/students")).toBe(true);
    expect(navListLinkIsCurrent("/students-archive", "/students")).toBe(false);
  });

  it("never marks the root current for an unrelated page", () => {
    expect(navListLinkIsCurrent("/students", "/")).toBe(false);
    expect(navListLinkIsCurrent("/", "/")).toBe(true);
  });

  it("exact mode never counts a nested route", () => {
    expect(navListLinkIsCurrent("/students/42", "/students", { exact: true })).toBe(false);
    expect(navListLinkIsCurrent("/students", "/students", { exact: true })).toBe(true);
  });
});
