import type { UsageTree } from "@skryensya/core/usage-tree";
import type { IntentId } from "./taxonomy.js";

/*
 * THE MODEL, in two halves that are kept apart on purpose.
 *
 *   - A PATTERN is LAYOUT: which signatures, nested how, with which options, and the named fields it
 *     fills. It says nothing about what the UI is for. "A label over a large figure with a chip at
 *     the end" is a pattern; it holds a revenue KPI, a storage quota or a ticket count equally well.
 *   - A USE is MEANING: one intent from the taxonomy, the sentence that says when a page picks it,
 *     and the content (bilingual) that fills the pattern's fields for that purpose.
 *
 * One pattern has many uses (the same layout put to other purposes), and one intent has many uses
 * on different patterns (alternatives for the same job). Both directions are what an agent needs:
 * "I need a quota, what shapes are there?" and "I like this shape, what else is it good for?".
 *
 * A FIXED example is the third kind: a tree written once, whole, with its intent attached. It is how
 * the pages and the older hand-composed molecules live beside patterns without being rewritten as
 * them: a tree that is one of a kind has no layout to separate from its meaning.
 */

export type Locale = "en" | "es";

/** Copy that differs per locale, or a plain string that is the same in every locale (a proper noun, a figure). */
export type Text = string | { readonly en: string; readonly es: string };

/**
 * How much of a page the example is: a piece of a component, one component whole, a few working
 * together, or a whole screen.
 */
export type Scale = "fragment" | "component" | "composition" | "page";

export const SCALES: readonly Scale[] = ["fragment", "component", "composition", "page"];

/** A content shape with every string allowed to be bilingual. What a use writes. */
export type Localized<T> = T extends string
  ? Text
  : T extends readonly (infer U)[]
    ? readonly Localized<U>[]
    : T extends object
      ? { readonly [K in keyof T]: Localized<T[K]> }
      : T;

export type SubjectId =
  | "card"
  | "list"
  | "form"
  | "hero"
  | "action"
  | "feedback"
  | "navigation"
  | "table"
  | "survey"
  | "screen";

export interface BuildContext {
  readonly locale: Locale;
  /**
   * A namespace unique to the use being built (its id). Form `name`s and element `id`s are prefixed
   * with it, because a page may render a fragment and the composition that holds it side by side,
   * and two controls sharing a name are one group to the browser.
   */
  readonly ns: string;
  /**
   * Builds another use, in this locale. A composition holds uses and never copies their trees, so a
   * fix to a card reaches every composition that contains it, and the graph knows who contains whom.
   */
  render(useId: string): UsageTree;
}

export interface Pattern<C = any> {
  /** Stable, kebab-case, unique across the package. */
  readonly id: string;
  /** The subject on the component axis: what a person would call it ("card", "list", "form"). */
  readonly subject: SubjectId;
  readonly scale: Scale;
  readonly title: Text;
  /** The structure in one sentence, with no purpose in it: what goes where. */
  readonly layout: Text;
  /** Every field the pattern fills, with what it holds. The contract a new use writes against. */
  readonly fields: { readonly [K in keyof C & string]-?: Text };
  /** Why the structure is this one: the composition decisions worth copying. */
  readonly notes?: readonly Text[];
  build(content: C, ctx: BuildContext): UsageTree;
}

export type RelationKind = "alternative" | "contrast";

export interface Relation {
  readonly id: string;
  readonly kind: RelationKind;
  /** When to prefer the other one, or why it only looks alike. */
  readonly why: Text;
}

export interface Use<C = any> {
  /** Stable, kebab-case, unique across the package. What `get_examples(id)` takes. */
  readonly id: string;
  readonly pattern: string;
  readonly intent: IntentId;
  /** Files the use under another subject than its pattern's: a grid is a card pattern, a grid of panels is a list example. */
  readonly subject?: SubjectId;
  readonly title: Text;
  /** When a page picks this, in one sentence. */
  readonly purpose: Text;
  readonly content: Localized<C>;
  /**
   * Hand-written edges the graph cannot derive. Same layout, same intent, containment and
   * structural similarity are all derived; only a judgement ("prefer this one when…") is written.
   */
  readonly related?: readonly Relation[];
  /**
   * False for a use that exists to be held by a composition (one plan of three, one person of six):
   * it is served by the MCP and shown inside its composition, but not given a card of its own.
   */
  readonly catalog?: boolean;
}

export interface Fixed {
  readonly id: string;
  readonly subject: SubjectId;
  readonly scale: Scale;
  readonly intent: IntentId;
  readonly title: Text;
  readonly purpose: Text;
  readonly notes: readonly Text[];
  readonly tree: UsageTree;
  readonly related?: readonly Relation[];
}

/** A pattern and the uses written against its content type, declared together so the types line up. */
export interface PatternModule<C = any> {
  readonly pattern: Pattern<C>;
  readonly uses: readonly Use<C>[];
}

/** Declares a pattern and gives back a typed `use()` for writing its uses against the same content type. */
export function definePattern<C>(pattern: Pattern<C>) {
  return {
    pattern,
    use: (use: Omit<Use<C>, "pattern">): Use<C> => ({ ...use, pattern: pattern.id }),
  };
}
