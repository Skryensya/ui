import type { ContractOption, ContractSignature, ContractSlot } from "@skryensya/core/contract";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { CompiledContract, CompiledIndex, CompiledManifest } from "./artifact.js";

/*
 * THE DOCS A MODEL READS WHEN THERE IS NO MCP: Markdown rendered from the compiled manifest and
 * shipped inside `@skryensya/core` (`docs/`), so what an agent reads is the release it installed.
 *
 * Nothing here is written by hand. The contract says what a component is, the semantic overlay when
 * to use it, and a canonical tree (one per signature, the same trees the gates render) is emitted as
 * the usage example. `agent-docs.test.ts` fails when the committed files differ from this render.
 *
 *   docs/llms.txt              the index: start here
 *   docs/choose.md             "the person needs to → use", every signature's first useWhen
 *   docs/components/<id>.md    one family: when, how it nests, options, slots, events, an example
 */

export type EmittedExample = {
  readonly name: string;
  readonly tree: UsageTree;
  readonly react: string;
  readonly vanilla: string;
  /** The data module the React source imports, when its collection is too long to inline. */
  readonly reactData: { readonly file: string; readonly source: string } | null;
  readonly css: readonly string[];
};

export type AgentDocsInput = {
  readonly index: CompiledIndex;
  readonly manifest: CompiledManifest;
  /** The emitted example for a signature, or nothing when no canonical tree covers it. */
  readonly exampleFor: (signature: string) => EmittedExample | undefined;
};

const CATEGORY_ORDER = ["actions", "forms", "navigation", "overlays", "feedback", "data", "content", "layout"] as const;

const CATEGORY_TITLE: Record<string, string> = {
  actions: "Actions",
  forms: "Forms",
  navigation: "Navigation",
  overlays: "Overlays",
  feedback: "Feedback",
  data: "Data",
  content: "Content",
  layout: "Layout",
  other: "Other",
};

/** Table cells cannot hold a pipe or a line break. */
const cell = (text: string): string => text.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");

const code = (text: string): string => `\`${text.replace(/`/g, "'")}\``;

const typeOf = (option: ContractOption): string => {
  if (option.type === "enum" && option.values) return option.values.map((value) => `"${value}"`).join(" | ");
  return option.type;
};

const defaultOf = (option: ContractOption): string => (option.default === undefined ? "" : code(JSON.stringify(option.default)));

const acceptsOf = (slot: ContractSlot): string => {
  if (slot.accepts === "signature" && slot.of?.length) return `one of ${slot.of.map(code).join(", ")}`;
  if (slot.accepts === "items") return "a list of items (below)";
  return slot.accepts;
};

const isPublic = (signature: ContractSignature): boolean => !signature.deprecated;

function optionsTable(contract: CompiledContract, names: readonly string[]): string[] {
  if (names.length === 0) return [];
  const rows = names.map((name) => {
    const option = contract.options[name];
    if (!option) return `| ${code(name)} | | |`;
    const prop = option.prop && option.prop !== name ? ` (React: ${code(option.prop)})` : "";
    return `| ${code(name)}${prop} | ${cell(typeOf(option))} | ${defaultOf(option)} |`;
  });
  return ["**Options**", "", "| Option | Values | Default |", "|---|---|---|", ...rows, ""];
}

function slotsTable(signature: ContractSignature): string[] {
  const entries = Object.entries(signature.slots ?? {});
  if (entries.length === 0) return [];
  const rows = entries.map(([name, slot]) => `| ${code(name)}${slot.prop ? ` (React: ${code(slot.prop)})` : ""} | ${cell(acceptsOf(slot))} | ${slot.required ? "yes" : ""} |`);
  const out = ["**Slots**", "", "| Slot | Accepts | Required |", "|---|---|---|", ...rows, ""];
  for (const [name, slot] of entries) {
    const item = (slot as ContractSlot & { item?: { key?: string; options?: Record<string, ContractOption>; slots?: Record<string, ContractSlot> } }).item;
    if (slot.accepts !== "items" || !item) continue;
    const fields = [
      ...Object.entries(item.options ?? {}).map(([key, option]) => `${code(key)} (${cell(typeOf(option))})`),
      ...Object.entries(item.slots ?? {}).map(([key, itemSlot]) => `${code(key)} (${itemSlot.accepts}${itemSlot.required ? ", required" : ""})`),
    ];
    out.push(`Each item in ${code(name)}${item.key ? `, keyed by ${code(item.key)}` : ""}: ${fields.join(", ")}.`, "");
  }
  return out;
}

function nesting(signature: ContractSignature): string[] {
  const lines: string[] = [];
  if (signature.parents?.length) lines.push(`- Goes inside: ${signature.parents.map(code).join(", ")}.`);
  if (signature.notInside?.length) lines.push(`- Never inside: ${signature.notInside.map(code).join(", ")}.`);
  if (signature.requires?.length) lines.push(`- Requires the options: ${signature.requires.map(code).join(", ")}.`);
  if (signature.exactlyOneOf?.length) lines.push(...signature.exactlyOneOf.map((group) => `- Exactly one of: ${group.map(code).join(", ")}.`));
  if (signature.atLeastOneOf?.length) lines.push(...signature.atLeastOneOf.map((group) => `- At least one of: ${group.map(code).join(", ")}.`));
  for (const rule of signature.descendants ?? []) lines.push(`- Holds at least ${rule.min} of ${rule.of.map(code).join(", ")}: ${rule.because}`);
  return lines.length ? [...lines, ""] : [];
}

function a11yLines(contract: CompiledContract, name: string): string[] {
  const rules = (contract.a11y ?? []).filter((rule) => !rule.signatures || rule.signatures.includes(name));
  if (rules.length === 0) return [];
  return ["**Accessible name**", "", ...rules.map((rule) => `- ${rule.because} Give one of: ${rule.requiresOneOf.map(code).join(", ")}.`), ""];
}

function eventLines(contract: CompiledContract): string[] {
  const events = Object.entries(contract.events ?? {});
  if (events.length === 0) return [];
  const rows = events.map(([key, domEvent]) => {
    const detail = contract.eventDetails?.[key];
    const fields = detail ? Object.entries(detail.detail).map(([field, type]) => `${field}: ${type}`).join(", ") : "";
    const react = detail?.reactProp ? code(detail.reactProp) : detail?.reactProp === false ? "(none: listen on the element)" : "";
    const direction = detail?.direction === "in" ? " (dispatch it to the root to drive the component)" : "";
    return `| ${code(domEvent)}${direction} | ${react} | ${cell(fields ? `{ ${fields} }` : "")} |`;
  });
  return ["## Events", "", "| DOM event (Vanilla) | React prop | `detail` |", "|---|---|---|", ...rows, ""];
}

function exampleLines(example: EmittedExample | undefined): string[] {
  if (!example) return [];
  return [
    `**Example** (canonical tree ${code(example.name)}; its copy is placeholder, replace it)`,
    "",
    "```tsx",
    example.react,
    "```",
    "",
    ...(example.reactData ? [`${code(example.reactData.file)}:`, "", "```ts", example.reactData.source.trimEnd(), "```", ""] : []),
    "```html",
    example.vanilla,
    "```",
    "",
    `Stylesheets: ${example.css.map(code).join(", ")}.`,
    "",
  ];
}

export function renderComponentPage(contract: CompiledContract, exampleFor: AgentDocsInput["exampleFor"]): string {
  const signatures = Object.entries(contract.signatures).filter(([, signature]) => isPublic(signature));
  const out: string[] = [
    `# ${contract.id}`,
    "",
    `Category: ${contract.category ?? "other"}. Stylesheet: ${code(contract.css)}. Signatures: ${signatures.map(([name]) => code(name)).join(", ")}.`,
    "",
  ];
  for (const [name, signature] of signatures) {
    const semantics = contract.semantics[name];
    out.push(`## ${name}`, "");
    if (semantics?.useWhen?.length) out.push("**Use when**", "", ...semantics.useWhen.map((line) => `- ${line}`), "");
    if (semantics?.avoidWhen?.length) out.push("**Avoid when**", "", ...semantics.avoidWhen.map((line) => `- ${line}`), "");
    if (semantics?.alternatives?.length) out.push(`Alternatives: ${semantics.alternatives.map(code).join(", ")}.`, "");
    out.push(
      `- React: ${code(`import { ${signature.react.name.split(".")[0]} } from "${signature.react.from}"`)}${signature.react.name.includes(".") ? `, then ${code(`<${signature.react.name}>`)}` : ""}.`,
      `- HTML: a ${code(`<${signature.host.element}>`)}${signature.mount ? ` with ${code(signature.mount)}, enhanced by Vanilla's mount` : ", no JavaScript needed"}.`,
      "",
    );
    out.push(...nesting(signature), ...optionsTable(contract, signature.options), ...slotsTable(signature), ...a11yLines(contract, name), ...exampleLines(exampleFor(name)));
  }
  out.push(...eventLines(contract));
  const hooks = contract.hooks ?? [];
  if (hooks.length) out.push("## Styling hooks", "", `Override on the root, never by restyling its classes: ${hooks.map(code).join(", ")}.`, "");
  return `${out.join("\n").trimEnd()}\n`;
}

const firstSentence = (text: string): string => text.split(/(?<=[.;:])\s/)[0]!.replace(/[;:]$/, "");

export function renderChoose(index: CompiledIndex): string {
  const groups = new Map<string, string[]>();
  for (const entry of index.contracts) {
    const category = entry.category ?? "other";
    for (const signature of entry.signatures) {
      // A part (it has parents) is reached from its family's page, not chosen on its own.
      if (signature.deprecated || signature.parents.length > 0 || signature.useWhen.length === 0) continue;
      const rows = groups.get(category) ?? [];
      rows.push(`| ${cell(firstSentence(signature.useWhen[0]!))} | ${code(signature.id)} | [${entry.id}](components/${entry.id}.md) |`);
      groups.set(category, rows);
    }
  }
  const out = [
    "# Choose a component",
    "",
    "Each row is a signature's first reason to use it, from its contract. Pick the row that fits, then read the family's page: it has the rest of its useWhen, its avoidWhen and what to use instead. When nothing fits a shape, use a layout primitive (`Stack`, `Inline`, `Grid`, `Box`) with an intentional gap; never hand-roll a widget the table names.",
    "",
  ];
  for (const category of [...CATEGORY_ORDER, "other"]) {
    const rows = groups.get(category);
    if (!rows) continue;
    out.push(`## ${CATEGORY_TITLE[category]}`, "", "| The person needs | Use | Family |", "|---|---|---|", ...rows, "");
  }
  return `${out.join("\n").trimEnd()}\n`;
}

export function renderLlms(index: CompiledIndex): string {
  const out = [
    "# skryensya/ui",
    "",
    "> A design system whose component contract is the source of truth: every component ships as a React binding (`@skryensya/react`) and as plain HTML enhanced by a Vanilla mount (`@skryensya/vanilla`), both rendering the same DOM from one contract.",
    "",
    "These docs match the installed release. Read this index, then `choose.md` to pick components, then only the family pages you use. The source in `dist/` and `src/` is not the API: these pages and the TypeScript types are.",
    "",
    "- [Choose a component](choose.md): the person needs to → use",
    "",
    "## Families",
    "",
  ];
  for (const entry of index.contracts) {
    const lead = entry.signatures.find((signature) => !signature.deprecated && signature.useWhen.length);
    out.push(`- [${entry.id}](components/${entry.id}.md): ${lead ? cell(firstSentence(lead.useWhen[0]!)) : entry.signatures.map((signature) => signature.id).join(", ")}`);
  }
  return `${out.join("\n").trimEnd()}\n`;
}

/** Every file, keyed by its path under `docs/`. */
export function renderAgentDocs({ index, manifest, exampleFor }: AgentDocsInput): Readonly<Record<string, string>> {
  const files: Record<string, string> = { "llms.txt": renderLlms(index), "choose.md": renderChoose(index) };
  for (const entry of index.contracts) {
    const contract = manifest.contracts[entry.id];
    if (contract) files[`components/${entry.id}.md`] = renderComponentPage(contract, exampleFor);
  }
  return files;
}
