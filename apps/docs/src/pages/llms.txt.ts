import { getComponentDescription } from "../lib/component-catalog";
import { getNavigation } from "../lib/navigation";

/*
 * `/llms.txt` (llmstxt.org): the site's map for a language model, in Markdown. One H1, a blockquote
 * summary, then one `##` per docs section with its pages as links. DERIVED from `navigation.ts`, like
 * the search index, so a new component is listed the build it ships; English only, the locale a
 * crawler is most likely to read, with the Spanish twin of every page one link away on the page itself.
 */
const SITE = "https://ui.skryensya.dev";

export function buildLlmsTxt(): string {
  const sections = getNavigation("en").map((section) => {
    const links = section.groups.flatMap((group) =>
      group.items
        .filter((item) => !item.todo && !item.external)
        .map((item) => {
          const description = section.id === "components" ? getComponentDescription(item.href, "en") : undefined;
          return `- [${item.label}](${SITE}${item.href})${description ? `: ${description}` : ""}`;
        }),
    );
    return links.length ? `## ${section.section}\n\n${section.blurb}\n\n${links.join("\n")}` : "";
  });

  return [
    "# skryensya/ui",
    "> A framework-agnostic design system where the component contract is the source of truth: every component ships as a React binding and as plain HTML enhanced by a Vanilla mount, both derived from one contract (parts, options, attributes and accessibility rules) so the two never drift.",
    "Each component page covers when to use it and when not to, its anatomy, options, keyboard behaviour and do/don't examples. For composing UI programmatically, the `@skryensya/mcp` server exposes the same contracts: discover candidate components, read a contract, and validate a usage tree before emitting markup or React.",
    [
      "## For agents building with it",
      "",
      "- Skill: `npx skills add Skryensya/ui --skill skryensya-ui`. It routes between the MCP and the offline path.",
      "- Docs as Markdown, matching the installed release: `node_modules/@skryensya/core/docs/llms.txt`, then `choose.md` and one page per family.",
      "- Without the MCP: `skryensya validate <tree.json>` and `skryensya review <tree.json>` answer what validate_ui and review_ui do.",
      "- Operating a page: `@skryensya/core/agent` gives an agent `snapshot`, `query` and `act` over the page's components, and offers them through WebMCP.",
    ].join("\n"),
    ...sections.filter(Boolean),
  ].join("\n\n") + "\n";
}

export function GET(): Response {
  return new Response(buildLlmsTxt(), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
