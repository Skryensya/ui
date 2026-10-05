import type { OptionInput } from "@skryensya/core/usage-tree";
import { presetFor } from "./preset.js";
import type { IdFactory } from "./project.js";
import { resolve, type SignatureRef } from "./structure.js";
import type { MakerNode, MakerSlot } from "./node.js";

/*
 * PRESETS OF ONE COMPONENT: the same signature, set up in the ways people reach for it, each arriving in
 * the wrapper it usually sits in.
 *
 * `presetFor` gives ONE starting point per signature (every option at its default, the least that
 * satisfies the contract). That is the right default and the wrong ceiling: a Button is a primary action,
 * a quiet one, a destructive one, an icon-only one, and a pair of them, and an author should not have to
 * rediscover which options make each. A variant is exactly that: a name, an overlay of options/attributes/
 * slots on the generated preset, and the wrapper it naturally arrives in.
 *
 * TWO SOURCES, in this order:
 *   1. CURATED (`curated` below): written by hand where the generated one cannot know what is idiomatic (an
 *      icon-only button needs an accessible name; a pair of buttons wants an Inline).
 *   2. GENERATED, when nothing is curated: one variant per value of the visual options (`variant`, `tone`,
 *      `appearance`), so every signature with a visual axis offers it without anyone writing it.
 * Both are held to the same bar as the base preset (`variants.test.ts`): at worst pending, never wrong.
 *
 * NOT IN THE OVERLAY YAML, deliberately. The overlay feeds the artifact an AGENT reads (discovery, the
 * catalogue), and a preset is an editor convenience: putting it there would grow every agent's index
 * for a thing only the Maker uses. If agents ever need presets they are already served as snippets.
 */

export type WrapperId = "none" | "box" | "stack" | "inline" | "wrapper";

export type WrapperChoice = {
  readonly id: WrapperId;
  readonly label: string;
  readonly ref?: SignatureRef;
  readonly options?: Readonly<Record<string, OptionInput>>;
};

/** What "Wrap in" offers. `none` is the component on its own. */
export const wrapperChoices: readonly WrapperChoice[] = [
  { id: "none", label: "Nothing" },
  { id: "box", label: "Box", ref: { contract: "box", signature: "Box" }, options: { padding: "md", border: "subtle" } },
  { id: "stack", label: "Stack", ref: { contract: "layout", signature: "Stack" }, options: { gap: "sm" } },
  { id: "inline", label: "Inline", ref: { contract: "layout", signature: "Inline" }, options: { gap: "sm" } },
  { id: "wrapper", label: "Wrapper", ref: { contract: "wrapper", signature: "Wrapper" } },
];

/** A node to add: a signature (default: the one the variant is for), its overlay, and what its slots hold. */
type Spec = {
  readonly contract?: string;
  readonly signature?: string;
  readonly options?: Readonly<Record<string, OptionInput>>;
  readonly attrs?: Readonly<Record<string, string>>;
  /** A string sets the slot's text; a list of specs fills a slot of nodes. */
  readonly slots?: Readonly<Record<string, string | readonly Spec[]>>;
};

type CuratedVariant = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly set: Spec;
  /** Other nodes that arrive with it, in the same wrapper (a primary action comes with its secondary). */
  readonly siblings?: readonly Spec[];
  /** The wrapper it arrives in unless the author chose one. */
  readonly wrapper?: WrapperId;
};

export type Variant = {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  /** Who wrote it: a person (curated) or the contract's own enums (generated). */
  readonly source: "default" | "curated" | "generated";
  readonly wrapper: WrapperId;
  /** The nodes of the variant (the first is the component itself), before any wrapping. */
  nodes(newId: IdFactory): readonly MakerNode[];
};

const iconSpec = (name: string): Spec => ({ contract: "icon", signature: "Icon", options: { name } });

const curated: Record<string, readonly CuratedVariant[]> = {
  "button/Button.action": [
    { id: "primary", name: "Primary", description: "The one action the page is for.", set: { options: { variant: "solid", tone: "accent" }, slots: { children: "Save changes" } } },
    { id: "secondary", name: "Secondary", description: "An alternative that should not compete with the primary.", set: { options: { variant: "soft", tone: "neutral" }, slots: { children: "Cancel" } } },
    { id: "quiet", name: "Quiet", description: "A low-emphasis action: it reads as text until it is hovered.", set: { options: { variant: "ghost", tone: "neutral" }, slots: { children: "Learn more" } } },
    { id: "destructive", name: "Destructive", description: "An action that removes something.", set: { options: { variant: "solid", tone: "danger" }, slots: { children: "Delete" } } },
    {
      id: "icon-only",
      name: "Icon only",
      description: "A control with no visible text: it carries an accessible name.",
      set: { options: { variant: "ghost", iconOnly: true }, attrs: { "aria-label": "Add item" }, slots: { children: [iconSpec("add")] } },
    },
    {
      id: "confirm-pair",
      name: "Primary and secondary",
      description: "The two buttons a form ends with, side by side.",
      wrapper: "inline",
      set: { options: { variant: "solid", tone: "accent" }, slots: { children: "Save changes" } },
      siblings: [{ options: { variant: "soft", tone: "neutral" }, slots: { children: "Cancel" } }],
    },
  ],
  "button/Button.navigation": [
    { id: "primary-link", name: "Primary link", description: "A link that looks like the page's main action.", set: { options: { variant: "solid", tone: "accent", href: "#" }, slots: { children: "Get started" } } },
    { id: "quiet-link", name: "Quiet link", description: "A link to somewhere else, without the weight of a button.", set: { options: { variant: "ghost", href: "#" }, slots: { children: "Read the docs" } } },
  ],
  "typography/Heading": [
    { id: "page-title", name: "Page title", description: "The h1: one per page.", set: { options: { headingElement: "h1", headingSize: "h1" }, slots: { children: "Page title" } } },
    { id: "section-title", name: "Section title", description: "An h2 that opens a section.", set: { options: { headingElement: "h2", headingSize: "h2" }, slots: { children: "Section title" } } },
    { id: "subsection-title", name: "Subsection title", description: "An h3 inside a section.", set: { options: { headingElement: "h3", headingSize: "h3" }, slots: { children: "Subsection title" } } },
  ],
  "typography/Text": [
    { id: "lead", name: "Lead paragraph", description: "The sentence under a title that says what the page is.", set: { options: { size: "lg", tone: "secondary" }, slots: { children: "A short paragraph that sets up what follows." } } },
    { id: "body", name: "Body", description: "Running text.", set: { slots: { children: "Body text that explains one idea." } } },
    { id: "caption", name: "Caption", description: "Small, quiet text beside something else.", set: { options: { size: "sm", tone: "tertiary" }, slots: { children: "A caption or a note." } } },
  ],
  "box/Box": [
    { id: "card", name: "Card", description: "A raised surface with an edge: one self-contained thing.", set: { options: { surface: "raised", border: "subtle", padding: "md" } } },
    { id: "panel", name: "Sunken panel", description: "A quiet region behind related content.", set: { options: { surface: "sunken", padding: "lg" } } },
    { id: "band", name: "Band", description: "A region that runs edge to edge: square corners, padding on all sides.", set: { options: { surface: "sunken", padding: "lg", radius: "none" } } },
    { id: "outlined", name: "Outlined", description: "An edge and no fill.", set: { options: { border: "default", padding: "md" } } },
  ],
};

const headline = (as: string, size: string, text: string): Spec => ({ contract: "typography", signature: "Heading", options: { headingElement: as, headingSize: size }, slots: { children: text } });
const paragraph = (text: string, options: Readonly<Record<string, OptionInput>> = {}): Spec => ({ contract: "typography", signature: "Text", options, slots: { children: text } });
const buttonSpec = (text: string, options: Readonly<Record<string, OptionInput>>): Spec => ({ contract: "button", signature: "Button.action", options, slots: { children: text } });
const field = (name: string, options: Readonly<Record<string, OptionInput>> = {}): Spec => ({ contract: "input", signature: "Input", options: { name, ...options } });

curated["callout/Callout"] = [
  { id: "info", name: "Information", description: "Something worth knowing before going on.", set: { options: { tone: "info" }, slots: { title: "Good to know", children: "A sentence that adds context to what is on the page.", actions: [] } } },
  { id: "success", name: "Success", description: "Confirms that something worked.", set: { options: { tone: "success" }, slots: { title: "Saved", children: "Your changes are live.", actions: [] } } },
  { id: "warning", name: "Warning", description: "Something to check before continuing.", set: { options: { tone: "warning" }, slots: { title: "Check this first", children: "This action affects every project in the workspace.", actions: [] } } },
  {
    id: "error-retry",
    name: "Error with a way forward",
    description: "A failure that offers the next step, not a dead end.",
    set: { options: { tone: "danger" }, slots: { title: "The upload failed", children: "The file is larger than 10 MB.", actions: [buttonSpec("Try again", { variant: "soft" })] } },
  },
];

curated["hero/Hero"] = [
  {
    id: "centered",
    name: "Centered headline",
    description: "A headline and one line under it, centered: nothing else.",
    set: { options: { align: "center", padding: "xl", surface: "surface" }, slots: { children: [{ contract: "layout", signature: "Stack", options: { gap: "md", align: "center" }, slots: { children: [headline("h1", "display-sm", "A headline that says what this is"), paragraph("One sentence of support.", { tone: "secondary" })] } }] } },
  },
  {
    id: "with-actions",
    name: "Headline with actions",
    description: "The page's opening: a headline, a pitch, one primary action and a quieter second one.",
    set: {
      options: { padding: "xl", surface: "surface" },
      slots: {
        children: [
          {
            contract: "layout",
            signature: "Stack",
            options: { gap: "md" },
            slots: {
              children: [
                headline("h1", "display-sm", "A headline that says what this is"),
                paragraph("A short pitch that says who it is for.", { tone: "secondary" }),
                { contract: "layout", signature: "Inline", options: { gap: "sm" }, slots: { children: [buttonSpec("Get started", { tone: "accent" }), buttonSpec("Learn more", { variant: "ghost" })] } },
              ],
            },
          },
        ],
      },
    },
  },
];

curated["form-field/FormField"] = [
  { id: "text", name: "Text field", description: "A labelled single-line field.", set: { slots: { label: "Name", children: [field("name")] } } },
  { id: "with-hint", name: "With a hint", description: "A standing hint that says what is expected.", set: { slots: { label: "Username", hint: "Letters and numbers only.", children: [field("username")] } } },
  { id: "email-required", name: "Required email", description: "A required field that checks it is an email.", set: { options: { required: true }, slots: { label: "Email", children: [field("email", { type: "email", format: "email" })] } } },
  { id: "with-error", name: "With an error", description: "The state after a bad value: the error says what to change.", set: { slots: { label: "Password", error: "Use at least 12 characters.", children: [field("password", { type: "password" })] } } },
];

/** The options whose values are a visual choice, in the order they are offered. */
const VISUAL_OPTIONS = ["variant", "tone", "appearance"] as const;
const MAX_VALUES = 6;

const title = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function variantsFor(ref: SignatureRef): readonly Variant[] {
  const base: Variant = {
    id: "default",
    name: "Default",
    source: "default",
    wrapper: "none",
    nodes: (newId) => [presetFor(ref, newId)!],
  };
  const key = `${ref.contract}/${ref.signature}`;
  const written = curated[key];
  if (written) return [base, ...written.map((entry) => curatedVariant(ref, entry))];
  return [base, ...generatedVariants(ref)];
}

function curatedVariant(ref: SignatureRef, entry: CuratedVariant): Variant {
  return {
    id: entry.id,
    name: entry.name,
    description: entry.description,
    source: "curated",
    wrapper: entry.wrapper ?? "none",
    nodes: (newId) => [applySpec(presetFor(ref, newId)!, entry.set, newId), ...(entry.siblings ?? []).map((sibling) => applySpec(presetFor(ref, newId)!, sibling, newId))],
  };
}

function generatedVariants(ref: SignatureRef): readonly Variant[] {
  const resolved = resolve(ref);
  if (!resolved) return [];
  const { contract, signature } = resolved;
  const out: Variant[] = [];
  for (const name of VISUAL_OPTIONS) {
    const option = signature.options.includes(name) ? contract.options[name] : undefined;
    if (!option || option.type !== "enum") continue;
    const values = (option.values ?? []).filter((value) => !(option.deprecatedValues && value in option.deprecatedValues));
    if (values.length < 2 || values.length > MAX_VALUES) continue;
    for (const value of values) {
      if (value === option.default) continue;
      out.push({
        id: `${name}-${value}`,
        name: name === "variant" ? title(value) : `${title(name)}: ${value}`,
        source: "generated",
        wrapper: "none",
        nodes: (newId) => [applySpec(presetFor(ref, newId)!, { options: { [name]: value } }, newId)],
      });
    }
  }
  return out;
}

/** The base preset with the spec laid over it. Options and attributes merge; a slot is replaced. */
function applySpec(base: MakerNode, spec: Spec, newId: IdFactory): MakerNode {
  const slots: Record<string, MakerSlot> = { ...base.slots };
  for (const [name, content] of Object.entries(spec.slots ?? {})) {
    if (typeof content === "string") {
      slots[name] = base.slots[name]?.kind === "text" ? { kind: "text", text: content } : { kind: "nodes", children: [{ id: newId(), text: content }] };
    } else {
      const children = content.map((child) => nodeFromSpec(child, newId)).filter((node): node is MakerNode => Boolean(node));
      slots[name] = { kind: "nodes", children };
    }
  }
  return {
    ...base,
    options: { ...base.options, ...spec.options },
    ...(spec.attrs || base.attrs ? { attrs: { ...base.attrs, ...spec.attrs } } : {}),
    slots,
  };
}

function nodeFromSpec(spec: Spec, newId: IdFactory): MakerNode | undefined {
  if (!spec.contract || !spec.signature) return undefined;
  const preset = presetFor({ contract: spec.contract, signature: spec.signature }, newId);
  return preset ? applySpec(preset, spec, newId) : undefined;
}

/** A wrapper around some nodes, or `undefined` when the choice is `none` or the wrapper is not insertable. */
export function wrapNodes(nodes: readonly MakerNode[], choice: WrapperChoice, newId: IdFactory): MakerNode | undefined {
  if (!choice.ref) return undefined;
  const wrapper = presetFor(choice.ref, newId);
  if (!wrapper) return undefined;
  return { ...wrapper, options: { ...wrapper.options, ...choice.options }, slots: { ...wrapper.slots, children: { kind: "nodes", children: nodes } } };
}

/**
 * What to insert for a variant: its nodes, in the wrapper the author chose, or in the variant's own
 * (`auto`). With no wrapper only the component itself arrives (a pair's second button is part of the
 * wrapped arrangement, not a loose sibling the page cannot place).
 */
export function buildVariant(variant: Variant, wrap: "auto" | WrapperId, newId: IdFactory): MakerNode {
  const nodes = variant.nodes(newId);
  const id = wrap === "auto" ? variant.wrapper : wrap;
  const choice = wrapperChoices.find((entry) => entry.id === id);
  const wrapped = choice ? wrapNodes(nodes, choice, newId) : undefined;
  return wrapped ?? nodes[0]!;
}
