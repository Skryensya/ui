// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { icons as lucide } from "../icon-sets/lucide";
import { icons as ph } from "../icon-sets/ph";
import { siteIconSets } from "../lib/icon-set-options";
import { followIconSet, loadIconSet, repaintIcons } from "./icon-set";

const box = (role: string) =>
  `<svg data-icon="${role}" class="sk-icon" data-size="sm" aria-hidden="true" viewBox="${ph.close.viewBox}" fill="currentColor" stroke="currentColor" stroke-width="4">${ph.close.body}</svg>`;

describe("the site's icon-set switch", () => {
  it("loads every set offered in Preferences", async () => {
    for (const { id } of siteIconSets) {
      const { set, css } = await loadIconSet(id);
      expect(set.close.body, id).toBeTruthy();
      expect(css, id).toContain("::picker-icon");
    }
  });

  it("repaints the geometry and keeps the box: class, size and accessibility", () => {
    document.body.innerHTML = `${box("close")}<div data-icon-set-fixed>${box("close")}</div><svg data-icon="not-a-role"></svg>`;
    repaintIcons(document, lucide);
    const [swapped, fixed, own] = document.querySelectorAll("svg");
    expect(swapped!.getAttribute("viewBox")).toBe(lucide.close.viewBox);
    expect(swapped!.getAttribute("stroke-width")).toBe("2");
    expect(swapped!.innerHTML).toContain("stroke-linecap");
    expect([swapped!.getAttribute("class"), swapped!.getAttribute("data-size"), swapped!.getAttribute("aria-hidden")]).toEqual(["sk-icon", "sm", "true"]);
    expect(fixed!.getAttribute("viewBox")).toBe(ph.close.viewBox);
    expect(own!.innerHTML).toBe("");
  });

  it("follows <html data-icon-set>, including icons added later and the native-control sheet", async () => {
    document.body.innerHTML = box("check");
    followIconSet(document);
    document.documentElement.setAttribute("data-icon-set", "lucide");
    await expect.poll(() => document.querySelector("svg")!.getAttribute("viewBox")).toBe(lucide.check.viewBox);
    expect(document.getElementById("docs-icon-set-css")?.textContent).toContain("::picker-icon");
    document.body.insertAdjacentHTML("beforeend", box("delete"));
    await expect.poll(() => document.querySelectorAll("svg")[1]!.getAttribute("viewBox")).toBe(lucide.delete.viewBox);
    document.documentElement.setAttribute("data-icon-set", "ph");
    await expect.poll(() => document.querySelector("svg")!.getAttribute("viewBox")).toBe(ph.check.viewBox);
    expect(document.getElementById("docs-icon-set-css")).toBeNull();
  });

  it("marks the page ready only once the reader's set is painted", async () => {
    document.documentElement.removeAttribute("data-sk-icons-ready");
    document.documentElement.setAttribute("data-icon-set", "lucide");
    document.body.innerHTML = box("check");
    followIconSet(document);
    expect(document.documentElement.hasAttribute("data-sk-icons-ready")).toBe(false);
    await expect.poll(() => document.documentElement.hasAttribute("data-sk-icons-ready")).toBe(true);
    expect(document.querySelector("svg")!.getAttribute("viewBox")).toBe(lucide.check.viewBox);
  });
});
