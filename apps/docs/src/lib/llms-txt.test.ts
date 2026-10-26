import { describe, expect, it } from "vitest";
import { buildLlmsTxt } from "../pages/llms.txt";

describe("/llms.txt", () => {
  const text = buildLlmsTxt();

  it("is Markdown with one H1 and a blockquote summary, as llmstxt.org asks", () => {
    expect(text.match(/^# /gm)).toHaveLength(1);
    expect(text.startsWith("# ")).toBe(true);
    expect(text).toMatch(/^> \S/m);
  });

  it("links every page absolutely, components with their catalog description", () => {
    const links = [...text.matchAll(/^- \[[^\]]+\]\(([^)]+)\)/gm)].map((m) => m[1]!);
    expect(links.length).toBeGreaterThan(50);
    expect(links.every((href) => href.startsWith("https://ui.skryensya.dev/"))).toBe(true);
    expect(text).toMatch(/^- \[Listbox\]\(https:\/\/ui\.skryensya\.dev\/components\/listbox\): \S/m);
  });
});
