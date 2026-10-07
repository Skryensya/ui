import { describe, expect, it } from "vitest";
import { snippets } from "@skryensya/examples";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { reviewTree } from "./quality.js";
import { validateUsageTree } from "./validate.js";

/*
 * THE QUALITY RULES, held two ways.
 *
 * The reference patterns must pass clean: they are what the rules are measured against, so a rule they
 * break is either a bad rule or a bad pattern, and either is worth a failing test. Each counterexample
 * is the opposite: a tree that VALIDATES and is still mediocre or inaccessible, and must trip exactly
 * the rule it was written to trip. A rule with no counterexample is a rule nobody has proved can fail.
 */

const heading = (children: string, as: string): UsageTree => ({ contract: "typography", signature: "Heading", options: { headingElement: as }, children });
const text = (children: string): UsageTree => ({ contract: "typography", signature: "Text", children });
const main = (children: UsageTree | UsageTree[]): UsageTree => ({ contract: "layout", signature: "Main", attrs: { id: "main", tabindex: "-1" }, children });
const skip: UsageTree = { contract: "skip-link", signature: "SkipLink", options: { href: "#main" }, children: "Skip to content" };
const navbar: UsageTree = { contract: "navbar", signature: "Navbar", children: { contract: "navbar", signature: "NavbarBrand", children: "Brand" } };
const page = (...content: UsageTree[]): UsageTree => ({ contract: "layout", signature: "Stack", children: [skip, navbar, main(content)] });
const button = (label: string, extra: Record<string, unknown> = {}): UsageTree => ({ contract: "button", signature: "Button.action", ...extra, children: label });

const rulesFor = (tree: UsageTree) => reviewTree(tree).findings.map((finding) => finding.rule);

describe("the reference patterns", () => {
  const patterns = snippets.filter((snippet) => snippet.id.startsWith("page-") && !snippet.notes[0]?.startsWith("A whole page, taken from the Templates"));

  it("includes the nine hand-composed patterns", () => {
    expect(patterns.map((snippet) => snippet.id).sort()).toEqual([
      "page-account-settings",
      "page-chat",
      "page-checkout-form",
      "page-inbox",
      "page-issue-tracker",
      "page-repo-overview",
      "page-search-results",
      "page-sign-in-card",
      "page-store-listing",
    ]);
  });

  for (const snippet of patterns) {
    it(`${snippet.id} composes, and passes the review with no findings`, () => {
      const problems = validateUsageTree(snippet.tree).problems.filter((problem) => problem.severity === "error");
      expect(problems).toEqual([]);
      const review = reviewTree(snippet.tree);
      expect(review.findings.map((finding) => `${finding.rule} @ ${finding.path}`)).toEqual([]);
    });
  }
});

describe("every page the MCP serves", () => {
  const pages = snippets.filter((snippet) => snippet.level === "page");

  it("has no accessibility error: a page an agent copies must not teach one", () => {
    const errors = pages.flatMap((snippet) =>
      reviewTree(snippet.tree)
        .findings.filter((finding) => finding.severity === "error")
        .map((finding) => `${snippet.id} · ${finding.rule} @ ${finding.path}`),
    );
    expect(errors).toEqual([]);
  });

  it("keeps its remaining warnings to ones decided on purpose", () => {
    /* A marketing page repeats its call to action at the top, the middle and the close: three solid accent
       buttons by design. Listed so a new warning is a new decision, not noise. */
    const warnings = pages.flatMap((snippet) => reviewTree(snippet.tree).findings.filter((finding) => finding.severity === "warn").map((finding) => `${snippet.id} · ${finding.rule}`));
    expect(warnings).toEqual(["page-marketing · competing-primary-actions"]);
  });
});

describe("the counterexamples: valid trees that are still not good", () => {
  it("a good page is clean", () => {
    expect(reviewTree(page(heading("Title", "h1"), heading("Section", "h2"))).findings).toEqual([]);
  });

  it("two h1s, or none", () => {
    expect(rulesFor(page(heading("A", "h1"), heading("B", "h1")))).toContain("one-h1");
    expect(rulesFor(page(heading("A", "h2")))).toContain("one-h1");
  });

  it("a heading that skips a level", () => {
    expect(rulesFor(page(heading("A", "h1"), heading("C", "h3")))).toContain("heading-order");
  });

  it("no skip link before navigation", () => {
    const tree: UsageTree = { contract: "layout", signature: "Stack", children: [navbar, main(heading("A", "h1"))] };
    expect(rulesFor(tree)).toContain("skip-link");
  });

  it("a skip link that points nowhere", () => {
    const tree: UsageTree = { contract: "layout", signature: "Stack", children: [{ ...skip, options: { href: "#content" } }, navbar, main(heading("A", "h1"))] };
    expect(rulesFor(tree)).toContain("skip-link-target");
  });

  it("a skip link whose destination cannot take focus", () => {
    const unfocusable: UsageTree = { contract: "layout", signature: "Main", attrs: { id: "main" }, children: heading("A", "h1") };
    const tree: UsageTree = { contract: "layout", signature: "Stack", children: [skip, navbar, unfocusable] };
    expect(rulesFor(tree)).toContain("skip-link-focusable");
  });

  it("a scrolling table box that the keyboard cannot reach", () => {
    const scroll: UsageTree = { contract: "table", signature: "TableScroll", children: { contract: "table", signature: "Table", children: [] } };
    expect(rulesFor(page(heading("A", "h1"), scroll))).toContain("table-scroll-focusable");
  });

  it("aria-labelledby that points at nothing", () => {
    const region: UsageTree = { contract: "box", signature: "Box", options: { boxElement: "section", padding: "md" }, attrs: { "aria-labelledby": "missing" }, children: text("x") };
    expect(rulesFor(page(heading("A", "h1"), region))).toContain("labelledby-target");
  });

  it("a page with no main landmark", () => {
    const tree: UsageTree = { contract: "layout", signature: "Stack", children: [navbar, heading("A", "h1")] };
    expect(rulesFor(tree)).toContain("one-main");
  });

  it("six buttons that all say the same thing", () => {
    const rows = Array.from({ length: 3 }, () => button("Add to cart"));
    expect(rulesFor(page(heading("Shop", "h1"), ...rows))).toContain("distinct-control-names");
  });

  it("the same buttons are fine once each names what it acts on", () => {
    const rows = ["Trail jacket", "Ridge shell"].map((name) => button("Add", { attrs: { "aria-label": `Add ${name} to cart` } }));
    expect(rulesFor(page(heading("Shop", "h1"), ...rows))).not.toContain("distinct-control-names");
  });

  it("generic link text", () => {
    const link: UsageTree = { contract: "typography", signature: "Link", options: { href: "#x" }, children: "Read more" };
    expect(rulesFor(page(heading("A", "h1"), link))).toContain("generic-control-name");
  });

  it("an icon-only button without a name", () => {
    const iconOnly = button("", { options: { iconOnly: true } });
    expect(rulesFor(page(heading("A", "h1"), iconOnly))).toContain("icon-only-named");
  });

  it("a table with no caption and no row headers", () => {
    const cell = (children: string): UsageTree => ({ contract: "table", signature: "TableCell", children });
    const table: UsageTree = {
      contract: "table",
      signature: "Table",
      children: [{ contract: "table", signature: "TableBody", children: [{ contract: "table", signature: "TableRow", children: [cell("a"), cell("b")] }] }],
    };
    const rules = rulesFor(page(heading("A", "h1"), table));
    expect(rules).toContain("table-caption");
    expect(rules).toContain("table-row-headers");
  });

  it("three solid accent buttons competing", () => {
    const primary = (label: string) => button(label, { options: { tone: "accent" } });
    expect(rulesFor(page(heading("A", "h1"), primary("One"), primary("Two"), primary("Three")))).toContain("competing-primary-actions");
  });

  it("several unnamed navigations", () => {
    const nav = (): UsageTree => ({ contract: "nav-list", signature: "NavList", children: [] });
    expect(rulesFor(page(heading("A", "h1"), nav(), nav()))).toContain("landmarks-named");
  });

  it("a shell whose rail never reaches a phone", () => {
    const rail = (side?: "end"): UsageTree => ({
      contract: "sidebar",
      signature: "Sidebar",
      ...(side ? { options: { side } } : {}),
      children: { contract: "sidebar", signature: "SidebarContent", children: text("Links") },
    });
    const drawer: UsageTree = { contract: "vaul", signature: "Vaul.drawer", options: { label: "Menu", panelId: "menu" }, children: text("Links") };
    const trigger: UsageTree = {
      contract: "vaul",
      signature: "Vaul.Trigger",
      options: { opens: "menu", buttonIconOnly: true, buttonLabel: "Menu" },
      children: { contract: "icon", signature: "Icon", options: { name: "menu" } },
    };
    const header: UsageTree = { contract: "navbar", signature: "Navbar", children: [{ contract: "navbar", signature: "NavbarBrand", children: "Brand" }, trigger] };
    const shell = (...children: UsageTree[]): UsageTree => ({ contract: "layout", signature: "AppShell", children: [skip, ...children] });

    expect(rulesFor(shell(navbar, rail(), main(heading("Inbox", "h1"))))).toContain("rails-reach-compact");
    expect(rulesFor(shell(navbar, rail(), main(heading("Inbox", "h1")), drawer))).toContain("rails-reach-compact");
    expect(rulesFor(shell(header, rail(), main(heading("Inbox", "h1")), drawer))).not.toContain("rails-reach-compact");
    expect(rulesFor(shell(header, rail(), main(heading("Inbox", "h1")), rail(), drawer))).toContain("end-rail-side");
    expect(rulesFor(shell(header, rail(), main(heading("Inbox", "h1")), rail("end"), drawer))).not.toContain("end-rail-side");
  });

  it("warnings never fail a review, errors always do", () => {
    const cell = (children: string): UsageTree => ({ contract: "table", signature: "TableCell", children });
    const table: UsageTree = {
      contract: "table",
      signature: "Table",
      children: [
        { contract: "table", signature: "TableCaption", children: "A table" },
        { contract: "table", signature: "TableBody", children: [{ contract: "table", signature: "TableRow", children: [cell("a")] }] },
      ],
    };
    const review = reviewTree(page(heading("A", "h1"), table));
    expect(review.warnings).toBe(1);
    expect(review.passes).toBe(true);
    expect(reviewTree(page(heading("A", "h2"))).passes).toBe(false);
  });

  it("is deterministic", () => {
    const tree = page(heading("A", "h2"), heading("B", "h4"));
    expect(reviewTree(tree)).toEqual(reviewTree(tree));
  });
});
