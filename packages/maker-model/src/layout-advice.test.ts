import { describe, it, expect } from "vitest";
import { layoutAdvice } from "./structure.js";
import { fromUsageTree } from "./project.js";
import { counterIds } from "./project.js";
import { presetFor } from "./preset.js";
const T = (t: any) => fromUsageTree(t, counterIds("n"));
it("a page grows without limit unless its content sits in a Wrapper with a ceiling", () => {
  const bare = T({ contract: "layout", signature: "Main", children: [{ contract: "typography", signature: "Heading", children: "Hi" }] });
  const wrapped = T({ contract: "layout", signature: "Main", children: [{ contract: "wrapper", signature: "Wrapper", options: { wrapperSize: "md" }, children: { contract: "typography", signature: "Heading", children: "Hi" } }] });
  const full = T({ contract: "layout", signature: "Main", children: [{ contract: "wrapper", signature: "Wrapper", options: { wrapperSize: "full" }, children: { contract: "typography", signature: "Heading", children: "Hi" } }] });
  expect(layoutAdvice(bare)[0]).toContain("no Wrapper");
  expect(layoutAdvice(wrapped)).toEqual([]);
  expect(layoutAdvice(full)[0]).toContain("no maximum");
  expect(presetFor({ contract: "wrapper", signature: "Wrapper" }, () => "i")?.options?.wrapperSize).toBe("md");
});

it("flags the arrangements that run down the page when they were meant to be arranged", () => {
  const main = (...children: unknown[]) => T({ contract: "layout", signature: "Main", children: [{ contract: "wrapper", signature: "Wrapper", options: { wrapperSize: "md" }, children }] });
  const heading = { contract: "typography", signature: "Heading", children: "Hi" };
  const text = { contract: "typography", signature: "Text", children: "Body" };
  const button = (label: string) => ({ contract: "button", signature: "Button.action", children: label });
  /* Two things straight into the Wrapper: nothing spaces them. A Stack does. */
  expect(layoutAdvice(main(heading, text)).join(" ")).toContain("Put them in one Stack");
  expect(layoutAdvice(main({ contract: "layout", signature: "Stack", children: [heading, text] }))).toEqual([]);
  /* Buttons one under another in a Stack: they belong in an Inline. */
  expect(layoutAdvice(main({ contract: "layout", signature: "Stack", children: [heading, button("A"), button("B")] })).join(" ")).toContain("go in an Inline");
  expect(layoutAdvice(main({ contract: "layout", signature: "Stack", children: [heading, { contract: "layout", signature: "Inline", children: [button("A"), button("B")] }] }))).toEqual([]);
  /* A heading in a row. */
  expect(layoutAdvice(main({ contract: "layout", signature: "Stack", children: [{ contract: "layout", signature: "Inline", children: [heading, button("A")] }] })).join(" ")).toContain("holds a Heading");
});

it("a strip meant to span the page is not told to go in a Wrapper", () => {
  const strip = T({ contract: "layout", signature: "Main", children: [{ contract: "marquee", signature: "Marquee.autoplay", slots: { pauseLabel: "Pause" }, children: [{ contract: "typography", signature: "Text", children: "A" }] }] });
  expect(layoutAdvice(strip)).toEqual([]);
});

describe("structure advice", () => {
  const H = (level: string, text: string) => ({ contract: "typography", signature: "Heading", options: { headingElement: level }, children: text });
  const page = (children: unknown[]) => T({ contract: "layout", signature: "Main", children: [{ contract: "wrapper", signature: "Wrapper", options: { wrapperSize: "md" }, children: { contract: "layout", signature: "Stack", children } }] });
  it("flags a second h1, a skipped level, an empty container, a one-child grid and lorem ipsum, each by node", () => {
    const advice = layoutAdvice(page([H("h1", "One"), H("h1", "Two"), H("h4", "Deep"), { contract: "layout", signature: "Box", children: [] }, { contract: "layout", signature: "Grid", options: { columns: "3" }, children: [{ contract: "typography", signature: "Text", children: "Lorem ipsum dolor sit amet" }] }]));
    const text = advice.join("\n");
    expect(text).toContain("2 top-level headings");
    expect(text).toContain("jumps from h1 to h4");
    expect(text).toMatch(/Box \S+ is empty/);
    expect(text).toMatch(/Grid \S+ has one child/);
    expect(text).toContain("lorem ipsum");
  });
  it("says nothing about a page with one h1 and headings one level at a time", () => {
    expect(layoutAdvice(page([H("h1", "One"), H("h2", "Two"), H("h3", "Three"), H("h2", "Four")]))).toEqual([]);
  });
});
