import type { UsageTree } from "@skryensya/core/usage-tree";
import { localizePath, type Locale, type Translate } from "../i18n";

/*
 * The Markdown a model reads, as @skryensya/core ships it (rendered from the contracts by
 * `pnpm --filter @skryensya/ai-compiler docs`). The site serves the same files, so a page's
 * "Markdown" link and the installed package never say two different things.
 */
const pages = import.meta.glob("../../../../packages/core/docs/components/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

const byId = new Map(Object.entries(pages).map(([path, text]) => [path.slice(path.lastIndexOf("/") + 1, -".md".length), text]));

/** The family's Markdown, or nothing when the catalogue does not offer it (a paused family). */
export const agentDocFor = (contractId: string): string | undefined => byId.get(contractId);

export const agentDocIds = (): string[] => [...byId.keys()].sort();

export const agentDocPath = (contractId: string) => `/components/${contractId}.md`;

/** Where each view lives: the agents' is the bare file (a blank tab, no site around it), the people's a page in the component's own layout. */
export const componentMarkdownPath = (contractId: string, view: "agents" | "people") =>
  view === "agents" ? agentDocPath(contractId) : `/components/${contractId}/read`;

/** The two views as tiles under a label that says what they are; the one the reader is on is marked as the current page. */
export const componentMarkdownTiles = (contractId: string, locale: Locale, t: Translate, current?: "agents" | "people"): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [
    { contract: "typography", signature: "Text", options: { size: "sm", tone: "secondary", weight: "label" }, children: t("component.markdownViews") },
    {
      contract: "layout",
      signature: "Grid",
      /* Auto-fit lanes, not `responsive`: that one aligns each cell to the start, and the tiles must share a height. */
      options: { gap: "sm", minColumn: "sm" },
      children: (["agents", "people"] as const).map((view) => ({
        contract: "tile",
        signature: "TileLink",
        options: { href: view === "agents" ? componentMarkdownPath(contractId, view) : localizePath(componentMarkdownPath(contractId, view), locale), padding: "lg" },
        /* The file opens in a tab of its own: nothing of the site around it, which is what an agent is given. */
        attrs: view === "agents" ? { target: "_blank", rel: "noopener" } : view === current ? { "aria-current": "page" } : undefined,
        /* The settings-shortcut row from the examples: icon, title over one line of what it is, chevron. */
        children: {
          contract: "layout",
          signature: "Inline",
          options: { gap: "md", inlineAlign: "center", justify: "between", wrap: false },
          children: [
            {
              contract: "layout",
              signature: "Inline",
              options: { gap: "md", inlineAlign: "start", wrap: false },
              children: [
                { contract: "icon", signature: "Icon", options: { name: view === "agents" ? "code" : "file-text", size: "md" } },
                {
                  contract: "layout",
                  signature: "Stack",
                  options: { gap: "none" },
                  children: [
                    { contract: "typography", signature: "Text", options: { weight: "label" }, children: t(view === "agents" ? "component.markdown" : "component.markdownPeople") },
                    { contract: "typography", signature: "Text", options: { size: "sm", tone: "secondary" }, children: t(view === "agents" ? "component.markdownAgentsBody" : "component.markdownPeopleBody") },
                  ],
                },
              ],
            },
            { contract: "icon", signature: "Icon", options: { name: "chevron-right", size: "sm" } },
          ],
        },
      })),
    },
  ],
});
