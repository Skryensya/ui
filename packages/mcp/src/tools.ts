import { z } from "zod";
import { CONTRACTS_BATCH_LIMIT, type AgentResult, type AgentService } from "@skryensya/ai-compiler/agent";
import { DISCOVER_DEFAULT_LIMIT, DISCOVER_MAX_LIMIT } from "@skryensya/ai-compiler/discover";
import type { UsageTree } from "@skryensya/core/usage-tree";
import {
  catalogOutput,
  contractOutput,
  contractsOutput,
  discoverOutput,
  examplesOutput,
  usageTree,
  reviewOutput,
  validateOutput,
} from "./schemas.js";

/*
 * THE PUBLIC TOOL INVENTORY, declared once. `create-server.ts` registers exactly this list, the
 * README's tool table is rendered from it (`pnpm --filter @skryensya/mcp docs`), and
 * `docs.test.ts` fails when either drifts. A tool that exists here and nowhere in the docs, or the
 * reverse, is caught by a test rather than by a confused client.
 *
 * Each `run` is a one-line delegation to `@skryensya/ai-compiler/agent`. If a handler here ever needs
 * more than that, the knowledge it needs belongs in the service, not in the protocol adapter.
 */

type ToolDefinition<Input extends z.ZodObject, Output extends z.ZodType> = {
  readonly name: string;
  readonly title: string;
  /** One line for the README table. The full `description` is what a client sees. */
  readonly summary: string;
  readonly description: string;
  readonly input: Input;
  readonly output: Output;
  readonly run: (service: AgentService, args: z.infer<Input>) => AgentResult<object>;
};

const define = <Input extends z.ZodObject, Output extends z.ZodType>(tool: ToolDefinition<Input, Output>) => tool;

const discoverUi = define({
  name: "discover_ui",
  title: "Find candidate signatures for a piece of UI",
  summary: "Narrows the catalogue to candidate signatures, each with the evidence that matched it.",
  description:
    "Start here. Describe the UI you need and get a small set of candidate signatures, each with its " +
    "useWhen, avoidWhen, alternatives, related example ids, and `matched`: the exact field, term and " +
    "value that made it a candidate. Deterministic and LEXICAL: words are compared to compiled " +
    "fields, nothing is interpreted, and there is no score; choosing is your job. The catalogue is " +
    "written in English, so describe the UI in English words even when the user wrote another language. Narrow with " +
    "`category`, `host` or `parent`, or pass `intents` spelled as the index spells them (call with " +
    "no arguments to list the vocabulary). When `coverage` is `none` or `partial` and nothing fits, " +
    "page through get_catalog, which is exhaustive.",
  input: z.object({
    query: z
      .string()
      .max(500)
      .optional()
      .describe("Words describing the UI, matched word by word against an English catalogue."),
    intents: z
      .array(z.string().max(80))
      .max(20)
      .optional()
      .describe("Intent terms exactly as the index spells them (`on-off`, `navigation`)."),
    category: z
      .enum(["actions", "forms", "navigation", "overlays", "feedback", "data", "content", "layout"])
      .optional()
      .describe("Only families in this category."),
    host: z.string().max(40).optional().describe("Only signatures whose host element is this tag: `a`, `button`, `input`."),
    parent: z.string().max(80).optional().describe("Only signatures that declare this signature id as a valid parent."),
    includeDeprecated: z.boolean().optional().describe("Include deprecated signatures. Default false."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(DISCOVER_MAX_LIMIT)
      .optional()
      .describe(`Most candidates to return. Default ${DISCOVER_DEFAULT_LIMIT}.`),
  }),
  output: discoverOutput,
  run: (service, args) => service.discover(args),
});

const getCatalog = define({
  name: "get_catalog",
  title: "Read the whole published catalogue, one page at a time",
  summary: "The exhaustive catalogue, paged: every family and signature with useWhen and avoidWhen.",
  description:
    "The exhaustive authority on what is published: every family and signature with what it is for " +
    "(useWhen), what it is NOT for (avoidWhen), its HTML host, valid parents, alternatives and " +
    "deprecations. Use it when discover_ui finds nothing that fits, or to browse. Paged because the " +
    "whole catalogue does not arrive intact in one response: call with no `page` for page 1 and keep " +
    "incrementing while `more` is true. A family absent from every page is not published.",
  input: z.object({
    page: z.number().int().min(1).default(1).describe("1-indexed. Keep going while `more` is true."),
  }),
  output: catalogOutput,
  run: (service, { page }) => service.catalogPage(page),
});

const getExamples = define({
  name: "get_examples",
  title: "Browse the example library by intent, subject, scale or layout, or fetch one by id",
  summary: "The example library: filter the taxonomy with no id, one full example with its graph with an id.",
  description:
    "Established, known-good trees, filed on two axes. INTENT is what the reader is trying to do " +
    "(`domain/area/intent`, e.g. `metrics/usage/quota`; a prefix such as `metrics/` is every figure). " +
    "SUBJECT is what a person would call it (card, list, form, hero…); the components an example uses are " +
    "read off its tree (`contract`). A SCALE says how much of a page it is: fragment, component, " +
    "composition or page.\n\n" +
    "Layout and meaning are kept apart. A PATTERN is the structure alone, with the fields it fills; a USE " +
    "is one intent put on a pattern, with its content. So an example's `relations` answer both questions: " +
    "`sameLayout` is this layout put to other jobs (reach for it when you like the shape but the purpose " +
    "differs), `sameIntent` is other ways to do this job, `contains`/`containedIn` are what a composition " +
    "is made of, `similar` is structural kinship across patterns, and `related` carries written " +
    "judgements.\n\n" +
    "With no id and no filter you get the facets (every intent with a count) and the whole compact index; " +
    "filter to narrow it. With an id you get the full tree, its pattern's `fields` and the use's `content`: " +
    "to reuse the layout for another purpose, keep the pattern's structure and replace the content. " +
    "`locale` is `en` or `es`. Then validate what you adapted: an example proves its tree matched a " +
    "contract when it was written, not that it still does.",
  input: z.object({
    id: z.string().max(120).optional().describe("An example id. Omit to browse."),
    intent: z.string().max(120).optional().describe("An intent id or a prefix: `metrics/`, `metrics/money/`, `metrics/usage/quota`."),
    subject: z.string().max(40).optional().describe("card, list, form, hero, action, feedback, navigation, table, survey or screen."),
    scale: z.enum(["fragment", "component", "composition", "page"]).optional(),
    pattern: z.string().max(120).optional().describe("Every use of one pattern: the same layout put to other jobs."),
    contract: z.string().max(80).optional().describe("Examples whose tree touches this contract family, e.g. `meter`."),
    query: z.string().max(200).optional().describe("Words that must all appear in an example's id, title, purpose or intent."),
    locale: z.enum(["en", "es"]).default("en").describe("The language of titles, purposes and content. The trees' words follow it."),
  }),
  output: examplesOutput,
  run: (service, { id, locale, ...filter }) => (id ? service.example(id, locale) : service.examples({ ...filter, locale })),
});

const detail = z
  .enum(["contract", "full"])
  .default("contract")
  .describe("'contract' omits the semantic overlay (useWhen/avoidWhen) you already have.");

const getContract = define({
  name: "get_contract",
  title: "Read one family's compiled contract",
  summary: "One family's contract: options, slots, constraints, accessibility and CSS.",
  description:
    "The full contract for one family: every signature, the options it takes and the attribute each " +
    "maps to, its part template, slots, constraints (requires / forbids / exactlyOneOf / " +
    "atLeastOneOf / descendants), the accessibility it owes, and the CSS a consumer must import. The authority for " +
    "how a component is configured and composed; do not infer an option, a class or an import path " +
    "beyond what it returns.",
  input: z.object({
    id: z.string().min(1).max(80).describe("A family id, e.g. 'button', 'nav-list' (the `contract` of a candidate)."),
    detail,
  }),
  output: contractOutput,
  run: (service, { id, detail }) => service.contract(id, detail),
});

const getContracts = define({
  name: "get_contracts",
  title: "Read several families' compiled contracts at once",
  summary: `Up to ${CONTRACTS_BATCH_LIMIT} contracts in one call, in the order asked, for one composition.`,
  description:
    `The same contracts get_contract returns, for up to ${CONTRACTS_BATCH_LIMIT} families in one call: ` +
    "use it when one composition needs several families (a page, a card with media and actions). " +
    "Returned in the order asked, a repeated id once. All or nothing: if any id is not published " +
    "the call fails and names every unknown id; if the contracts together are too large for one " +
    "answer, it fails and names the groups to ask for instead.",
  input: z.object({
    ids: z
      .array(z.string().min(1).max(80))
      .min(1)
      .max(CONTRACTS_BATCH_LIMIT)
      .describe("Family ids, e.g. ['hero', 'layout', 'typography', 'button'] (the `contract` of each candidate)."),
    detail,
  }),
  output: contractsOutput,
  run: (service, { ids, detail }) => service.contracts(ids, detail),
});

const validateUi = define({
  name: "validate_ui",
  title: "Validate a composition and, if it holds, return its code",
  summary: "Validates a usage tree; when valid, returns Vanilla markup, React source, data module and CSS.",
  description:
    "The hard boundary. Checks a usage tree against its contracts: signatures, option values, " +
    "requires / forbids / exactlyOneOf / atLeastOneOf, valid parents, required descendants, slots and declared " +
    "accessibility. When valid it returns the emitted Vanilla markup, the React component, `reactData` " +
    "(a second file the component imports, when there is a collection) and every stylesheet to " +
    "import. Use that code as returned: it is the only way what you write and what was validated " +
    "stay the same artifact. When invalid, nothing is emitted; problems come back with a path into " +
    "the tree, a rule and a severity. An `advisory` is something no static check can settle and does " +
    "not make the tree invalid.",
  input: z.object({
    tree: usageTree.describe("The composition to check, written in signatures."),
  }),
  output: validateOutput,
  run: (service, { tree }) => service.validate(tree as UsageTree),
});

const reviewUi = define({
  name: "review_ui",
  title: "Review a composition's design: accessibility errors and mediocre-design smells",
  summary: "Judges a tree that composes: structure, bypass blocks, names, tables, competing actions. Each finding names its guideline and its fix.",
  description:
    "The other question. validate_ui says whether a tree COMPOSES; this says whether it is any GOOD, for the " +
    "part of good a tree can show. Deterministic rules, each with the guideline behind it and how to fix it. " +
    "`error` is an accessibility failure the tree itself causes (no h1, a heading that skips a level, no skip " +
    "link, controls that share one name, a table with no caption, an unnamed landmark, a scrolling table the " +
    "keyboard cannot reach): a page with one is broken for somebody, whatever it looks like, and style never " +
    "outranks it. `warn` is a smell (several competing primary actions, a table without row headers): nothing " +
    "is inaccessible, but the page is harder to use than it needs to be. A tree that does not compose comes back " +
    "unreviewed. A clean review is necessary, not sufficient: contrast, focus visibility and reflow depend on " +
    "rendering. Run it on a whole page after validate_ui; page-level examples from get_examples pass it.",
  input: z.object({
    tree: usageTree.describe("The composition to review, written in signatures."),
  }),
  output: reviewOutput,
  run: (service, { tree }) => service.review(tree as UsageTree),
});

/** In workflow order, which is also the order `tools/list` returns and the README shows. */
export const tools = [discoverUi, getExamples, getContract, getContracts, validateUi, reviewUi, getCatalog] as const;

export const toolNames: readonly string[] = tools.map((tool) => tool.name);
