import { describe, expect, it } from "vitest";
import { commitSite, startHistory, undo } from "./history.js";
import { walk, type MakerNode } from "./node.js";
import { fromUsageTree } from "./project.js";
import { createPage, serialize } from "./page.js";
import { counterIds } from "./project.js";
import {
  applySite,
  applySiteAll,
  brokenLinks,
  createSite,
  composePage,
  duplicatePage,
  emptyLayout,
  emptyPage,
  layoutFor,
  onPage,
  parseSite,
  pathProblem,
  serializeSite,
  type MakerSite,
} from "./site.js";
import { samplePage } from "./test-page.js";

function site(): MakerSite {
  const newId = counterIds("x");
  const base = createSite("hash", newId);
  return { ...base, pages: [{ ...base.pages[0]!, id: "home", root: samplePage() }, emptyPage("about", "About", "/about", counterIds("a"))] };
}

const ok = (result: ReturnType<typeof applySite>) => {
  if (!result.ok) throw new Error(result.reason);
  return result.site;
};

describe("paths", () => {
  it("are / or lowercase slug segments", () => {
    for (const path of ["/", "/about", "/docs/getting-started", "/v2"]) expect(pathProblem(path)).toBeUndefined();
    for (const path of ["", "about", "/About", "/a b", "/trailing/", "//", "/-x"]) expect(pathProblem(path)).toBeDefined();
  });
});

describe("site operations", () => {
  it("adds a page at an index, refusing a path already taken", () => {
    const contact = emptyPage("contact", "Contact", "/contact", counterIds("c"));
    const next = ok(applySite(site(), { type: "addPage", page: contact, index: 1 }));
    expect(next.pages.map((page) => page.path)).toEqual(["/", "/contact", "/about"]);
    expect(applySite(next, { type: "addPage", page: emptyPage("again", "Again", "/about", counterIds("d")) }).ok).toBe(false);
  });

  it("keeps at least one page", () => {
    const one = ok(applySite(site(), { type: "removePage", page: "about" }));
    expect(applySite(one, { type: "removePage", page: "home" }).ok).toBe(false);
  });

  it("renames, re-paths and reorders, and refuses a bad path", () => {
    let next = ok(applySite(site(), { type: "renamePage", page: "about", name: "Nosotros" }));
    next = ok(applySite(next, { type: "setPagePath", page: "about", path: "/nosotros" }));
    next = ok(applySite(next, { type: "movePage", page: "about", index: 0 }));
    expect(next.pages.map((page) => `${page.name} ${page.path}`)).toEqual(["Nosotros /nosotros", "Home /"]);
    expect(applySite(next, { type: "setPagePath", page: "about", path: "/" }).ok).toBe(false);
    expect(applySite(next, { type: "setPagePath", page: "about", path: "Nosotros" }).ok).toBe(false);
  });

  it("carries page operations to one page, under that page's rules", () => {
    const next = ok(applySiteAll(site(), onPage("home", [{ type: "setOption", node: "s", name: "gap", value: "xl" }])));
    expect([...walk(next.pages[0]!.root)].find((node) => node.id === "s")!.options).toEqual({ gap: "xl" });
    expect(applySiteAll(site(), onPage("home", [{ type: "setOption", node: "s", name: "padding", value: "md" }])).ok).toBe(false);
  });

  it("duplicates a page with new identities throughout", () => {
    const copy = duplicatePage(site().pages[0]!, "Home copy", "/home-copy", counterIds("dup"));
    const next = ok(applySite(site(), { type: "addPage", page: copy }));
    const ids = next.pages.flatMap((page) => [...walk(page.root)].map((node) => node.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("refuses a new page that reuses another page's identities", () => {
    const clash = { ...emptyPage("clash", "Clash", "/clash", counterIds("z")), root: site().pages[0]!.root };
    expect(applySite(site(), { type: "addPage", page: clash }).ok).toBe(false);
  });

  it("is one history: a gesture on any page is one undo step", () => {
    const start = startHistory(site());
    const done = commitSite(start, [
      { type: "renamePage", page: "about", name: "Us" },
      ...onPage("home", [{ type: "remove", child: "h" }]),
    ]);
    if (!done.ok) throw new Error(done.reason);
    expect(done.history.past).toHaveLength(1);
    expect(undo(done.history).present).toBe(start.present);
  });
});

describe("links between pages", () => {
  it("are broken while an href names a path no page has, and whole once one does", () => {
    const link = {
      id: "nav",
      contract: "button",
      signature: "Button.navigation",
      options: { href: "/nowhere" },
      slots: { children: { kind: "nodes" as const, children: [{ id: "nav-t", text: "Go" }] } },
    };
    const linked = ok(applySiteAll(site(), onPage("home", [{ type: "insert", at: { parent: "i", slot: "children", index: 2 }, child: link }])));
    expect(brokenLinks(linked)).toEqual([{ page: "home", node: "nav", href: "/nowhere" }]);
    const fixed = ok(applySiteAll(linked, onPage("home", [{ type: "setOption", node: "nav", name: "href", value: "/about#team" }])));
    expect(brokenLinks(fixed)).toEqual([]);
    const external = ok(applySiteAll(linked, onPage("home", [{ type: "setOption", node: "nav", name: "href", value: "https://example.com" }])));
    expect(brokenLinks(external)).toEqual([]);
  });
});

describe("files", () => {
  it("round-trips a site, and opens a single maker page as a one-page site", () => {
    const saved = serializeSite(site(), "hash");
    const opened = parseSite(saved, "hash", counterIds("o"));
    expect(opened.ok && opened.site.pages.map((page) => page.path)).toEqual(["/", "/about"]);
    const single = parseSite(serialize({ ...createPage("hash", counterIds("p")), root: samplePage() }, "hash"), "other", counterIds("q"));
    expect(single.ok && single.site.pages).toHaveLength(1);
    expect(single.ok && single.catalogueChanged).toBe(true);
  });

  it("refuses a site whose pages share a path", () => {
    const bad = { ...site(), pages: site().pages.map((page) => ({ ...page, path: "/" })) };
    expect(parseSite(JSON.stringify(bad), "hash", counterIds()).ok).toBe(false);
  });
});


describe("layouts: a frame every page sits in, edited once", () => {
  const footer = (): MakerNode =>
    fromUsageTree({ contract: "footer", signature: "Footer", children: [{ contract: "typography", signature: "Text", children: "Made by hand" }] }, counterIds("f")) as MakerNode;
  const withLayout = () => {
    const base = site();
    const layout = emptyLayout("frame", "Marketing", counterIds("l"));
    const shell = layout.root;
    const added = ok(applySite(base, { type: "addLayout", layout, makeDefault: true }));
    /* A footer under the outlet, added to the layout the way anything is added to a page: an `edit` addressed to it. */
    return { added, layout, shell, withFooter: ok(applySite(added, { type: "edit", page: "frame", operation: { type: "insert", at: { parent: shell.id, slot: "children", index: 1 }, child: footer() } })) };
  };

  it("a layout is an AppShell with an outlet, and the default one reaches every page that does not say otherwise", () => {
    const { withFooter } = withLayout();
    const home = withFooter.pages[0]!;
    expect(layoutFor(withFooter, home)?.id).toBe("frame");
    const composed = composePage(withFooter, home);
    const signatures = [...walk(composed.root)].map((node) => node.signature);
    expect(composed.root.signature).toBe("AppShell");
    expect(signatures).toContain("Footer");
    /* The page's own Main stands where the outlet was, and its nodes are the page's, not the layout's. */
    expect(composed.root.slots.children).toMatchObject({ kind: "nodes" });
    expect([...walk(composed.root)].some((node) => node.id === home.root.id)).toBe(true);
    expect(composed.layout.has(home.root.id)).toBe(false);
    expect([...walk(home.root)].every((node) => !composed.layout.has(node.id))).toBe(true);
    expect([...composed.layout].length).toBeGreaterThan(1);
  });

  it("a page added later has the layout without anyone setting it, and can opt out or pick another", () => {
    const { withFooter } = withLayout();
    const added = ok(applySite(withFooter, { type: "addPage", page: emptyPage("pricing", "Pricing", "/pricing", counterIds("p")) }));
    const pricing = added.pages.find((page) => page.id === "pricing")!;
    expect(layoutFor(added, pricing)?.id).toBe("frame");
    const alone = ok(applySite(added, { type: "setPageLayout", page: "pricing", layout: "none" }));
    expect(composePage(alone, alone.pages.find((page) => page.id === "pricing")!).root.signature).toBe("Main");
    const back = ok(applySite(alone, { type: "setPageLayout", page: "pricing" }));
    expect(layoutFor(back, back.pages.find((page) => page.id === "pricing")!)?.id).toBe("frame");
    expect(applySite(added, { type: "setPageLayout", page: "pricing", layout: "nope" }).ok).toBe(false);
  });

  it("an edit that would remove the outlet is refused, and a layout without one cannot be added", () => {
    const { added, layout } = withLayout();
    const outlet = layout.root.slots.children!.kind === "nodes" ? (layout.root.slots.children.children[0] as MakerNode) : undefined;
    const removed = applySite(added, { type: "edit", page: "frame", operation: { type: "remove", child: outlet!.id } });
    expect(removed.ok).toBe(false);
    const noOutlet = { ...layout, id: "bad", root: { ...layout.root, id: "x1", slots: { children: { kind: "nodes" as const, children: [] } } } };
    expect(applySite(added, { type: "addLayout", layout: noOutlet }).ok).toBe(false);
  });

  it("removing a layout sets pages that named it free, and clears the default", () => {
    const { added } = withLayout();
    const named = ok(applySite(added, { type: "setPageLayout", page: "about", layout: "frame" }));
    const gone = ok(applySite(named, { type: "removeLayout", layout: "frame" }));
    expect(gone.layouts).toEqual([]);
    expect(gone.defaultLayout).toBeUndefined();
    expect(gone.pages.every((page) => page.layout === undefined)).toBe(true);
    expect(layoutFor(gone, gone.pages[0]!)).toBeUndefined();
  });

  it("one undo takes back adding a layout, and the saved file keeps it and refuses a broken reference", () => {
    const base = site();
    let history = startHistory(base);
    const layout = emptyLayout("frame", "Marketing", counterIds("l"));
    const committed = commitSite(history, [{ type: "addLayout", layout, makeDefault: true }]);
    if (!committed.ok) throw new Error(committed.reason);
    history = committed.history;
    expect(history.present.layouts).toHaveLength(1);
    expect(undo(history).present.layouts ?? []).toHaveLength(0);
    const saved = serializeSite(history.present, "hash");
    const reopened = parseSite(saved, "hash", counterIds("n"));
    expect(reopened.ok && reopened.site.defaultLayout).toBe("frame");
    const broken = JSON.parse(saved);
    broken.defaultLayout = "ghost";
    expect(parseSite(JSON.stringify(broken), "hash", counterIds("n")).ok).toBe(false);
  });

  it("a site made before layouts opens as it was", () => {
    const old = parseSite(serializeSite(site(), "hash"), "hash", counterIds("n"));
    expect(old.ok && old.site.layouts).toBeUndefined();
    expect(old.ok && composePage(old.site, old.site.pages[0]!).root).toBe(old.ok && old.site.pages[0]!.root);
  });
});
