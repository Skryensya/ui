import { describe, expect, it } from "vitest";
import { commitSite, startHistory, undo } from "./history.js";
import { walk } from "./node.js";
import { createPage, serialize } from "./page.js";
import { counterIds } from "./project.js";
import {
  applySite,
  applySiteAll,
  brokenLinks,
  createSite,
  duplicatePage,
  emptyPage,
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
