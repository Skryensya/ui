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

  it.each(["style", "class", "className", "onclick", "onClick", "STYLE"])("refuses %s in an inserted tree, including nested nodes", (attribute) => {
    const resolved = resolveAgentOperations(site(), [{ type: "page", page: "home", operations: [{ type: "insert", at: { parent: "s", slot: "children", index: 0 }, tree: {
      contract: "layout", signature: "Stack", children: [{ contract: "typography", signature: "Text", attrs: { [attribute]: "arbitrary" }, children: "Content" }],
    } }] }], counterIds("unsafe"));
    expect(resolved.ok).toBe(true);
    if (resolved.ok) {
      const result = applySiteAll(site(), resolved.value);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toContain("never authored");
    }
  });

  it("refuses invented insertion options and wrapper options rather than granting a tree extra authority", () => {
    expect(() => run(site(), [{ type: "page", page: "home", operations: [{ type: "insert", at: { parent: "s", slot: "children", index: 0 }, tree: { contract: "typography", signature: "Text", options: { width: "200px" }, children: "Content" } }] }])).toThrow();
    expect(() => run(site(), [{ type: "page", page: "home", operations: [{ type: "wrap", children: ["b1"], with: { contract: "layout", signature: "Inline", options: { padding: "200px" } } }] }])).toThrow();
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

  it("adds a layout, edits it by its id like a page, and puts every page inside it", () => {
    /* A new id prefix per call, as each turn of the real agent has: one counter would mint the same ids twice. */
    const step = (start: MakerSite, prefix: string, operations: readonly AgentSiteOperation[]): MakerSite => {
      const resolved = resolveAgentOperations(start, operations, counterIds(prefix));
      if (!resolved.ok) throw new Error(resolved.reason);
      const applied = applySiteAll(start, resolved.value);
      if (!applied.ok) throw new Error(applied.reason);
      return applied.site;
    };
    const withLayout = step(site(), "a", [{ type: "addLayout", name: "Marketing", makeDefault: true }]);
    const outline = describeSite(withLayout);
    expect(outline).toMatch(/^page home "Home" \/ layout=/m);
    expect(outline).toMatch(/^layout \S+ "Marketing" \(default/m);
    expect(outline).toContain("layout/AppShell");
    /* The layout's brand text is changed with a `page` operation addressed to the layout, not a new vocabulary. */
    const layout = withLayout.layouts![0]!;
    const brand = /^\s+(\S+) navbar\/NavbarBrand/m.exec(outline)![1]!;
    const edited = step(withLayout, "b", [{ type: "page", page: layout.id, operations: [{ type: "setText", node: brand, text: "Aurora" }] }]);
    expect(describeSite(edited)).toContain("Aurora");
    /* A page the agent adds afterwards has the layout without being told. */
    const more = step(edited, "c", [{ type: "addPage", name: "About", path: "/about" }]);
    expect(describeSite(more)).toMatch(/^page \S+ "About" \/about layout=/m);
    /* A name that is neither a page nor a layout is refused, naming both. */
    const refused = resolveAgentOperations(more, [{ type: "page", page: "nope", operations: [{ type: "remove", child: "x" }] }], counterIds("r"));
    expect(refused.ok).toBe(false);
    if (!refused.ok) expect(refused.reason).toContain("page or layout");
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

describe("inserting a preset", () => {
  const at = { parent: "s", slot: "children", index: 0 };
  const button = { contract: "button", signature: "Button.action" };
  const insertOp = (extra: Record<string, unknown>): AgentSiteOperation[] => [{ type: "page", page: "home", operations: [{ type: "insert", at, signature: button, ...extra } as never] }];
  const firstOfStack = (result: MakerSite) => childrenOf(findNode(result.pages[0]!.root, "s") as never, "children")[0] as { signature: string };

  it("inserts a named preset of a signature, in the wrapper it arrives in", () => {
    expect(firstOfStack(run(site(), insertOp({ preset: "confirm-pair" }))).signature).toBe("Inline");
  });

  it("lets the wrap override the preset's own", () => {
    expect(firstOfStack(run(site(), insertOp({ preset: "primary", wrap: "box" }))).signature).toBe("Box");
  });

  it("refuses a preset that does not exist, naming the ones that do", () => {
    const refused = resolveAgentOperations(site(), insertOp({ preset: "nope" }), counterIds("ag"));
    expect(refused.ok).toBe(false);
    expect((refused as { ok: false; reason: string }).reason).toContain("confirm-pair");
  });
});
