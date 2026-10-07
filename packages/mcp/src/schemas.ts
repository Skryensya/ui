import { z } from "zod";
import type {
  AgentError,
  CatalogPage,
  ContractView,
  ExampleDetail,
  ExamplesIndex,
  Provenance,
  ReviewOutcome,
  ValidateOutcome,
} from "@skryensya/ai-compiler/agent";
import type { DiscoverResult } from "@skryensya/ai-compiler/discover";
import type { OptionInput } from "@skryensya/core/usage-tree";

/*
 * THE PROTOCOL SCHEMAS, and only those. Everything here describes what crosses the MCP wire; what
 * the values MEAN lives in `@skryensya/ai-compiler/agent`, which knows nothing of zod or MCP. Core
 * gets neither dependency just so these could sit closer to the types they mirror.
 *
 * Mirroring a TypeScript type in zod is the duplication this repo keeps being bitten by (the tree
 * schema rejected every Tabs composition, then every numeric option, before anyone noticed). So each
 * output schema below is pinned to the service type it describes by a compile-time assignment at the
 * bottom of this file: widen a service result and this stops building until the schema follows.
 */

// ── Input: the usage tree ──────────────────────────────────────────────────────────────────────

/*
 * STRICT: a key the tree does not define is an error, not something dropped on the way in. zod's
 * default strips unknown keys, so `{ option: { href } }` (one letter short of `options`) used to
 * arrive at the validator as a node with no options at all, and the message that came back was
 * about a missing `href` rather than about the typo that caused it.
 */

/*
 * What an option may hold. `OptionInput` in Core is the authority; the guard at the bottom of this
 * file fails to compile if it widens without this following.
 */
const optionValue = z.union([z.string(), z.boolean(), z.number()]);

const collectionEntry: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    options: z
      .record(z.string(), optionValue)
      .optional()
      .describe("Entry values that land on an attribute, including the key that pairs its parts."),
    slots: z.record(z.string(), slotContent).describe("Entry content by slot name, e.g. a tab's `label` and `children`."),
  }).strict(),
);

const slotContent: z.ZodType<unknown> = z.lazy(() =>
  z.union([z.string(), usageTree, z.array(z.union([z.string(), usageTree])), z.array(collectionEntry)]),
);

export const usageTree: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    contract: z.string().min(1).describe("Family id, e.g. 'button'."),
    signature: z.string().min(1).describe("Signature id within that family, e.g. 'Button.navigation'."),
    options: z
      .record(z.string(), optionValue)
      .optional()
      .describe("Values for options the signature declares; the contract maps them to attributes. Anything else is rejected."),
    attrs: z
      .record(z.string(), z.string())
      .optional()
      .describe("Attributes passed to the host element as-is: aria-label, id, rel, target."),
    slots: z
      .record(z.string(), slotContent)
      .optional()
      .describe(
        "Named slots other than children: a group's `label`, a link's `icon`, or a collection like a " +
          "tab set's `items`, whose entries are {options, slots} objects rather than nodes.",
      ),
    children: slotContent.optional().describe("The `children` slot, written directly."),
  }).strict(),
);

// ── Output: shared pieces ──────────────────────────────────────────────────────────────────────

const provenance = {
  schemaVersion: z.string().describe("Schema version of the compiled artifact this answer came from."),
  sourceHash: z.string().describe("Hash of the compiled artifact this answer came from."),
};

/** Every error result carries this, provenance included. Errors are not validated against an outputSchema. */
export const errorOutput = z.object({ ...provenance, error: z.string(), detail: z.string() });


const indexSignature = z.object({
  id: z.string(),
  intent: z.array(z.string()),
  host: z.string(),
  parents: z.array(z.string()),
  deprecated: z.string().optional(),
  useWhen: z.array(z.string()),
  avoidWhen: z.array(z.string()),
  alternatives: z.array(z.string()),
});

const indexEntry = z.object({
  id: z.string(),
  category: z.string().optional(),
  css: z.string(),
  signatures: z.array(indexSignature),
});

const exampleSummary = z.object({
  id: z.string(),
  kind: z.enum(["use", "fixed"]),
  title: z.string(),
  intent: z.string().describe("The taxonomy intent id, `domain/area/intent`: what the reader is trying to do."),
  subject: z.string().describe("What a person would call it: card, list, form, hero…"),
  scale: z.string().describe("fragment, component, composition or page."),
  pattern: z.string().optional().describe("The layout this use is written against; absent for a fixed tree. Other uses of the same pattern are the same layout put to other jobs."),
});

const exampleRef = z.object({ id: z.string(), title: z.string(), intent: z.string(), scale: z.string() });

const patternInfo = z.object({
  id: z.string(),
  title: z.string(),
  layout: z.string().describe("The structure alone, with no purpose in it."),
  fields: z.record(z.string(), z.string()).describe("Every field the layout fills, with what it holds: what a new use writes."),
  notes: z.array(z.string()),
});

const problem = z.object({
  path: z.string(),
  rule: z.string(),
  severity: z.enum(["error", "advisory"]),
  message: z.string(),
});

const match = z.object({
  field: z.string().describe("Which compiled field matched, or which filter admitted the candidate."),
  term: z.string().describe("The normalized input term or filter value."),
  value: z.string().describe("The field value it matched."),
  negation: z
    .enum(["query", "both"])
    .optional()
    .describe("The input negated the term. `query`: a conflict, never counted toward order. `both`: the value negates it too, so they agree."),
});

// ── Output: one schema per tool ────────────────────────────────────────────────────────────────

export const catalogOutput = z.object({
  ...provenance,
  contracts: z.array(indexEntry),
  page: z.number().int(),
  totalPages: z.number().int(),
  totalFamilies: z.number().int(),
  more: z.boolean().describe("True while there are further pages to read."),
});

/*
 * A compiled contract is large and nested, and `get_contract` is its authority, so the schema names
 * the fields a client can rely on and admits the rest as-is rather than restating ComponentContract.
 */
const contractFields = {
  id: z.string(),
  category: z.string().optional(),
  css: z.string(),
  parts: z.record(z.string(), z.string()),
  signatures: z.record(z.string(), z.unknown()),
  semantics: z.record(z.string(), z.unknown()).optional(),
};

export const contractOutput = z.object({ ...provenance, ...contractFields }).loose();

/** Several contracts, provenance once at the top rather than once per family. */
export const contractsOutput = z.object({
  ...provenance,
  contracts: z.array(z.object(contractFields).loose()).describe("The families asked for, in the order asked."),
});

/*
 * ONE object, not a union of "index" and "one example": a union has no `type: object` root, and the
 * 2025-era wire wraps a non-object-rooted result as `{result: ...}`, which would move every field an
 * existing client reads.
 */
export const examplesOutput = z.object({
  ...provenance,
  /* The index (no id). */
  locale: z.enum(["en", "es"]),
  total: z.number().int().optional().describe("Every example in the library."),
  matched: z.number().int().optional().describe("How many passed the filters."),
  examples: z.array(exampleSummary).optional().describe("Present when called with no id: the matching examples, without trees."),
  facets: z
    .object({
      intents: z.array(z.object({ id: z.string(), label: z.string(), job: z.string(), count: z.number().int() })),
      subjects: z.array(z.object({ id: z.string(), title: z.string(), count: z.number().int() })),
      scales: z.array(z.object({ scale: z.string(), count: z.number().int() })),
    })
    .optional()
    .describe("Only on an unfiltered call: the taxonomy with a count under each line, to choose a filter from."),
  /* One example (an id). */
  id: z.string().optional(),
  kind: z.enum(["use", "fixed"]).optional(),
  title: z.string().optional(),
  purpose: z.string().optional().describe("When a page picks this example, in one sentence."),
  notes: z.array(z.string()).optional(),
  intent: z.object({ id: z.string(), label: z.string(), job: z.string() }).optional(),
  subject: z.string().optional(),
  scale: z.string().optional(),
  contracts: z.array(z.string()).optional().describe("The contract families the tree touches."),
  pattern: patternInfo.optional(),
  content: z.unknown().optional().describe("What fills the pattern in this use. Replace it to put the same layout to another job."),
  relations: z
    .object({
      sameLayout: z.array(exampleRef).describe("Other uses of this pattern: the same layout, other jobs."),
      sameIntent: z.array(exampleRef).describe("Other examples for the same job: alternatives."),
      contains: z.array(exampleRef).describe("The uses this composition renders."),
      containedIn: z.array(exampleRef).describe("The compositions that render this use."),
      similar: z.array(exampleRef.extend({ score: z.number() })).describe("Structurally close trees under another pattern, by shared signatures."),
      related: z.array(exampleRef.extend({ kind: z.string(), why: z.string() })).describe("Written judgements: when to prefer the other one, or why it only looks alike."),
    })
    .optional(),
  tree: z.record(z.string(), z.unknown()).optional().describe("Present when called with an id: the example's usage tree."),
});

export const discoverOutput = z.object({
  ...provenance,
  input: z.object({
    terms: z.array(z.string()),
    negated: z.array(z.string()).describe("Terms the input negated (no X, without X, sin X): never evidence for a candidate."),
    ignored: z.array(z.string()),
    filters: z.object({
      category: z.string().optional(),
      host: z.string().optional(),
      parent: z.string().optional(),
      includeDeprecated: z.boolean(),
    }),
    limit: z.number().int(),
  }),
  coverage: z.enum(["complete", "partial", "none", "browse"]),
  candidates: z.array(
    z.object({
      signature: z.string(),
      contract: z.string(),
      category: z.string().optional(),
      host: z.string(),
      intent: z.array(z.string()),
      parents: z.array(z.string()),
      useWhen: z.array(z.string()),
      avoidWhen: z.array(z.string()),
      alternatives: z.array(z.string()),
      deprecated: z.string().optional(),
      matched: z.array(match),
      examples: z.array(z.string()),
    }),
  ),
  total: z.number().int(),
  truncated: z.boolean(),
  unmatchedTerms: z.array(z.string()),
  examples: z.array(
    z.object({
      id: z.string(),
      level: z.string(),
      intent: z.string(),
      uses: z.array(z.string()),
      matched: z.array(match),
    }),
  ),
  categories: z.array(z.object({ id: z.string(), families: z.number().int(), signatures: z.number().int() })),
  vocabulary: z.object({ intents: z.array(z.string()), hosts: z.array(z.string()) }).optional(),
  guidance: z.string(),
});

const finding = z.object({
  rule: z.string(),
  severity: z.enum(["error", "warn"]).describe("error: an accessibility failure the tree causes. warn: a design smell."),
  path: z.string(),
  message: z.string(),
  reference: z.string().describe("The guideline behind the rule (a WCAG success criterion or the kit's convention)."),
  fix: z.string().describe("What to change in the tree."),
});

export const reviewOutput = z.object({
  ...provenance,
  valid: z.boolean().describe("Whether the tree composes. A tree that does not compose is not reviewed."),
  problems: z.array(problem),
  review: z
    .object({
      findings: z.array(finding),
      errors: z.number().int(),
      warnings: z.number().int(),
      passes: z.boolean().describe("True when no error remains. Warnings never fail a review."),
    })
    .nullable(),
  hint: z.string(),
});

export const validateOutput = z.object({
  ...provenance,
  valid: z.boolean(),
  problems: z.array(problem),
  emitted: z
    .object({
      vanilla: z.string().describe("Authored markup for the Vanilla binding."),
      react: z.string().describe("The React component file."),
      reactData: z
        .object({ file: z.string(), source: z.string() })
        .nullable()
        .describe("A second file the component imports, when the composition carries a collection."),
    })
    .nullable()
    .describe("Null whenever the tree is invalid: nothing is emitted from an invalid tree."),
  css: z.array(z.string()).optional().describe("Every stylesheet the composition needs. Present when valid."),
  hint: z.string().optional(),
});

// ── Compile-time pins: each service result must fit the schema that describes it ──────────────

/** The service returns readonly data; zod infers mutable arrays. Only the shape is being compared. */
type Writable<T> = T extends readonly (infer U)[]
  ? Writable<U>[]
  : T extends object
    ? { -readonly [K in keyof T]: Writable<T[K]> }
    : T;

/*
 * TWO CHECKS, because assignability alone is one-directional: a result with a field the schema
 * never declared still "fits" it, so a field the service grew would reach clients undescribed by
 * the outputSchema they validate against. `ExtraKeys` walks the value type (each member of a union
 * on its own, arrays by element) and names every key the schema does not declare, as a dotted path.
 * It stops where the schema deliberately admits anything: `unknown`, or a record/loose object.
 */
type Dotted<Path extends string, Key extends string> = Path extends "" ? Key : `${Path}.${Key}`;
type ExtraKeys<Value, Schema, Path extends string = ""> = unknown extends Schema
  ? never
  : Value extends readonly (infer Item)[]
    ? NonNullable<Schema> extends readonly (infer SchemaItem)[]
      ? ExtraKeys<Item, SchemaItem, `${Path}[]`>
      : never
    : Value extends object
      ? string extends keyof NonNullable<Schema>
        ? never
        :
            | Dotted<Path, Exclude<keyof Value, keyof NonNullable<Schema> | symbol | number>>
            | {
                [K in keyof Value & keyof NonNullable<Schema> & string]-?: ExtraKeys<
                  NonNullable<Value[K]>,
                  NonNullable<Schema>[K],
                  Dotted<Path, K>
                >;
              }[keyof Value & keyof NonNullable<Schema> & string]
      : never;

type Pinned<Value, Schema extends z.ZodType> =
  Writable<Value> extends z.infer<Schema>
    ? [ExtraKeys<Value, z.infer<Schema>>] extends [never]
      ? true
      : { undeclaredFields: ExtraKeys<Value, z.infer<Schema>> }
    : { doesNotFit: Value };

const pins: [
  Pinned<Provenance & CatalogPage, typeof catalogOutput>,
  Pinned<Provenance & ExamplesIndex, typeof examplesOutput>,
  Pinned<Provenance & ExampleDetail, typeof examplesOutput>,
  Pinned<Provenance & DiscoverResult, typeof discoverOutput>,
  Pinned<Provenance & ValidateOutcome, typeof validateOutput>,
  Pinned<Provenance & ReviewOutcome, typeof reviewOutput>,
  Pinned<Provenance & ContractView, typeof contractOutput>,
  Pinned<Provenance & { contracts: readonly ContractView[] }, typeof contractsOutput>,
  Pinned<AgentError, typeof errorOutput>,
  Pinned<OptionInput, typeof optionValue>,
] = [true, true, true, true, true, true, true, true, true, true];
void pins;

/* The guard, guarded: a result with one field the schema lacks must not compile as pinned. */
// @ts-expect-error `extra` is not declared by the schema, so this is `{ undeclaredFields: "extra" }`.
const undeclared: Pinned<{ kept: string; extra: number }, z.ZodObject<{ kept: z.ZodString }>> = true;
// @ts-expect-error the same inside an array: `{ undeclaredFields: "rows[].extra" }`.
const nested: Pinned<{ rows: readonly { kept: string; extra: number }[] }, z.ZodObject<{ rows: z.ZodArray<z.ZodObject<{ kept: z.ZodString }>> }>> = true;
void undeclared;
void nested;

// ── Input validation that answers like every other failure ─────────────────────────────────────

export type Checked<T> = { readonly ok: true; readonly data: T } | { readonly ok: false; readonly issues: string };

/*
 * The SDK validates tool arguments before a handler runs and answers a failure itself, as one line
 * of text with no provenance and nothing a client can parse. This wraps an input schema so the SDK
 * publishes EXACTLY the same JSON Schema (it delegates `jsonSchema`) while validation never fails at
 * the SDK layer: the handler receives either the parsed arguments or the issues, and answers through
 * the agent service like any other error. Validation itself is still the zod schema, unchanged.
 */
export function reportingInput<Schema extends z.ZodObject>(schema: Schema) {
  const standard = schema["~standard"];
  return {
    "~standard": {
      version: 1 as const,
      vendor: "skryensya",
      jsonSchema: standard.jsonSchema,
      validate: (value: unknown): { value: Checked<z.infer<Schema>> } => {
        const parsed = schema.safeParse(value ?? {});
        return parsed.success
          ? { value: { ok: true, data: parsed.data } }
          : {
              value: { ok: false, issues: describeIssues(parsed.error.issues).join("; ") },
            };
      },
    },
  };
}

/*
 * A slot accepts text, a node, a list, or a collection, so a mistake inside a node surfaces from zod
 * as one "Invalid input" on the union, with the real cause buried in one branch. This descends into
 * union branches and keeps what a person would fix: branches that failed only because the value was
 * a different KIND (an object is not a string) are dropped, and the rest are reported at full path.
 */
function describeIssues(issues: readonly z.core.$ZodIssue[], prefix: readonly PropertyKey[] = []): string[] {
  return [...new Set(issues.flatMap((issue) => describeIssue(issue, prefix)))];
}

function describeIssue(issue: z.core.$ZodIssue, prefix: readonly PropertyKey[]): string[] {
  const path = [...prefix, ...issue.path];
  if (issue.code === "invalid_union") {
    const specific = issue.errors
      .filter((branch) => !(branch.length === 1 && branch[0]!.code === "invalid_type" && branch[0]!.path.length === 0))
      .flatMap((branch) => describeIssues(branch, path));
    if (specific.length > 0) return specific;
  }
  return [`${path.length > 0 ? path.map(String).join(".") : "(arguments)"}: ${issue.message}`];
}
