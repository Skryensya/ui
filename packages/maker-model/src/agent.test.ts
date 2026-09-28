import { describe, expect, it } from "vitest";
import { describeSite, resolveAgentOperations, type AgentSiteOperation } from "./agent.js";
import { childrenOf, findNode } from "./node.js";
import { counterIds } from "./project.js";
import { applySiteAll, createSite, type MakerSite } from "./site.js";
import { node, samplePage, text } from "./test-page.js";

function site(): MakerSite {
  const base = createSite("hash", counterIds("x"));
  return { ...base, pages: [{ ...base.pages[0]!, id: "home", root: samplePage() }] };
}

function run(start: MakerSite, operations: readonly AgentSiteOperation[]): MakerSite {
  const resolved = resolveAgentOperations(start, operations, counterIds("ag"));
  if (!resolved.ok) throw new Error(resolved.reason);
  const applied = applySiteAll(start, resolved.value);
  if (!applied.ok) throw new Error(applied.reason);
  return applied.site;
}

describe("an agent's operations", () => {
  it('"put these two buttons next to each other" is a wrap in an Inline, never a coordinate', () => {
    /* Two buttons one above the other, in a Stack. */
    const start: MakerSite = {
      ...site(),
      pages: [
        {
          ...site().pages[0]!,
          root: node("main", "layout", "Main", [
            node("s", "layout", "Stack", [
              node("a", "button", "Button.action", [text("a-t", "One")]),
              node("b", "button", "Button.action", [text("b-t", "Two")]),
            ]),
          ]),
        },
      ],
    };
    const next = run(start, [
      { type: "page", page: "home", operations: [{ type: "wrap", children: ["a", "b"], with: { contract: "layout", signature: "Inline", options: { gap: "sm" } } }] },
    ]);
    const stack = findNode(next.pages[0]!.root, "s")!;
    const row = childrenOf(stack, "children")[0] as ReturnType<typeof node>;
    expect(row.signature).toBe("Inline");
    expect(row.options).toEqual({ gap: "sm" });
    expect(childrenOf(row, "children").map((child) => child.id)).toEqual(["a", "b"]);
  });

  it("inserts a usage tree, minting its identities", () => {
    const next = run(site(), [
      {
        type: "page",
        page: "home",
        operations: [
          {
            type: "insert",
            at: { parent: "s", slot: "children", index: 0 },
            tree: { contract: "typography", signature: "Text", children: "Hola" },
          },
        ],
      },
    ]);
    const first = childrenOf(findNode(next.pages[0]!.root, "s")!, "children")[0]!;
    expect(first.id).toMatch(/^ag\d+$/);
  });

  it("inserts a signature as its preset, and adds a page", () => {
    const next = run(site(), [
      { type: "addPage", name: "About", path: "/about" },
      { type: "page", page: "home", operations: [{ type: "insert", at: { parent: "s", slot: "children", index: 3 }, signature: { contract: "layout", signature: "Grid" } }] },
    ]);
    expect(next.pages.map((page) => page.path)).toEqual(["/", "/about"]);
    expect(describeSite(next)).toMatch(/layout\/Grid/);
  });

  it("is refused, whole, when any operation breaks the contract", () => {
    const resolved = resolveAgentOperations(site(), [
      { type: "page", page: "home", operations: [
        { type: "setOption", node: "s", name: "gap", value: "lg" },
        { type: "setOption", node: "s", name: "padding", value: "md" },
      ] },
    ], counterIds());
    expect(resolved.ok && applySiteAll(site(), resolved.value).ok).toBe(false);
  });
});

describe("the outline an agent reads", () => {
  it("names every node and text run by id, with the options set, and what is pending", () => {
    const withEmpty = run(site(), [{ type: "page", page: "home", operations: [{ type: "insert", at: { parent: "s", slot: "children", index: 0 }, signature: { contract: "layout", signature: "Stack" } }] }]);
    const outline = describeSite(withEmpty);
    expect(outline).toContain('page home "Home" /');
    expect(outline).toContain("s layout/Stack");
    expect(outline).toContain('b1-t "One"');
    expect(outline).toMatch(/pending:\n\s+\[ag\d+\] missing-required-slot/);
  });
});
