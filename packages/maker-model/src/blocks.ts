import type { UsageTree } from "@skryensya/core/usage-tree";
import { catalogue } from "./structure.js";

/*
 * BLOCKS: whole sections of a page, made of the design system's own components and ready to drop in. The palette's Sections
 * tab offers them first, with the published snippets (mostly heroes) after. A block is data (a usage tree) like anything the
 * Maker inserts: a band in a Wrapper, a Stack inside it, the system's cards, lists and buttons, never a CSS of its own, and
 * the text in it is a placeholder to be replaced, never a claim.
 */
export type Block = {
  readonly id: string;
  readonly name: string;
  readonly category: BlockCategory;
  readonly description: string;
  readonly tree: UsageTree;
};

export const BLOCK_CATEGORIES = ["Navigation", "Content", "Social proof", "Pricing", "Conversion", "Questions", "Footer"] as const;
export type BlockCategory = (typeof BLOCK_CATEGORIES)[number];

const contractOf = new Map<string, string>();
const contract = (signature: string): string => {
  if (contractOf.size === 0) for (const ref of catalogue()) if (!contractOf.has(ref.signature)) contractOf.set(ref.signature, ref.contract);
  return contractOf.get(signature) ?? signature;
};

type Content = UsageTree["children"];
/** A node by signature, the contract found from the catalogue. */
const n = (signature: string, options?: UsageTree["options"], children?: Content, slots?: UsageTree["slots"]): UsageTree => ({
  contract: contract(signature),
  signature,
  ...(options ? { options } : {}),
  ...(slots ? { slots } : {}),
  ...(children !== undefined ? { children } : {}),
});

const heading = (text: string, size: string = "h2", extra: UsageTree["options"] = {}) => n("Heading", { headingSize: size, flush: true, ...extra }, text);
const text = (value: string, options: UsageTree["options"] = {}) => n("Text", options, value);
const intro = (title: string, lead: string) =>
  n("Stack", { gap: "sm", align: "center" }, [heading(title, "h2"), text(lead, { tone: "secondary", size: "lg" })]);
/** A band of the page: a surface, a measure, a column. */
const band = (content: UsageTree, options: UsageTree["options"] = {}, size = "lg") =>
  n("Box", { padding: "lg", ...options }, [n("Wrapper", { wrapperSize: size }, [content])]);

const card = (iconName: string, title: string, body: string) =>
  n("Box", { surface: "raised", border: "subtle", padding: "md" }, [
    n("Stack", { gap: "sm" }, [n("Icon", { name: iconName, size: "md" }), heading(title, "h3"), text(body, { tone: "secondary" })]),
  ]);

const plan = (name: string, blurb: string, price: string, perks: string[], featured = false, action = "Choose plan") =>
  n("Box", { surface: "raised", border: featured ? "default" : "subtle", padding: "md" }, [
    n("Stack", { gap: "md" }, [
      n("Stack", { gap: "xs", align: "start" }, [...(featured ? [n("Badge", { tone: "accent" }, "Most popular")] : []), heading(name, "h4"), text(blurb, { size: "sm", tone: "secondary" })]),
      n("Stat", undefined, undefined, { label: "Per month", value: price }),
      n("List", { density: "compact" }, perks.map((perk) => n("ListItem", undefined, undefined, { leading: n("Icon", { name: "check", size: "sm" }), title: perk }))),
      n("Button.action", featured ? { tone: "accent" } : {}, action),
    ]),
  ]);

const quote = (words: string, name: string, initials: string, role: string) =>
  n("Box", { surface: "raised", border: "subtle", padding: "md" }, [
    n("Stack", { gap: "md" }, [
      text(`“${words}”`),
      n("Inline", { gap: "sm", inlineAlign: "center" }, [
        n("Avatar.initials", { name }, initials),
        n("Stack", { gap: "none" }, [text(name, { weight: "emphasis", size: "sm" }), text(role, { tone: "secondary", size: "sm" })]),
      ]),
    ]),
  ]);

const question = (value: string, ask: string, answer: string) =>
  n("Accordion.Item", { value }, [
    n("Accordion.Trigger", undefined, [n("TileContent", undefined, undefined, { title: ask }), n("TileChevron")]),
    n("Accordion.Content", undefined, answer),
  ]);

export const blocks: readonly Block[] = [
  {
    id: "navbar",
    name: "Navigation bar",
    category: "Navigation",
    description: "A brand on the left, a few links, one primary action.",
    tree: n("Navbar", undefined, [
      n("NavbarBrand", undefined, "Your brand"),
      n("NavbarActions", undefined, [n("Button.action", { variant: "ghost" }, "Product"), n("Button.action", { variant: "ghost" }, "Pricing"), n("Button.action", { tone: "accent" }, "Get started")]),
    ]),
  },
  {
    id: "features-grid",
    name: "Three features",
    category: "Content",
    description: "A title, a line, and three cards with an icon, a heading and a sentence.",
    tree: band(
      n("Stack", { gap: "lg", gapExpanded: "xl" }, [
        intro("Everything you need, nothing you don't", "Say in one line what the product does for the person reading."),
        n("Grid", { columns: "3", gap: "md", responsive: true }, [
          card("check", "First benefit", "Describe what this feature does for them."),
          card("info", "Second benefit", "Describe what this feature does for them."),
          card("settings", "Third benefit", "Describe what this feature does for them."),
        ]),
      ]),
    ),
  },
  {
    id: "split-feature",
    name: "Feature with image",
    category: "Content",
    description: "Text and a call to action on one side, an image on the other.",
    tree: band(
      n("Grid", { columns: "2", gap: "lg", responsive: true }, [
        n("Stack", { gap: "md" }, [
          heading("One feature, explained properly", "h2"),
          text("A short paragraph on what it is, who it is for and what changes once they have it.", { tone: "secondary", size: "lg" }),
          n("Inline", { gap: "sm" }, [n("Button.action", { tone: "accent" }, "Try it"), n("Button.action", { variant: "ghost" }, "Learn more")]),
        ]),
        n("ImageFrame", { src: "https://picsum.photos/seed/maker-feature/800/600", alt: "A placeholder image for the feature", aspect: "4/3", radius: "surface" }),
      ]),
    ),
  },
  {
    id: "steps",
    name: "How it works",
    category: "Content",
    description: "Three numbered steps, side by side.",
    tree: band(
      n("Stack", { gap: "lg" }, [
        intro("How it works", "Three steps from nothing to done."),
        n("Grid", { columns: "3", gap: "md", responsive: true }, ["First step", "Second step", "Third step"].map((title, index) =>
          n("Stack", { gap: "sm" }, [n("Badge", { tone: "accent" }, String(index + 1)), heading(title, "h3"), text("Describe what happens in this step.", { tone: "secondary" })]),
        )),
      ]),
    ),
  },
  {
    id: "stats",
    name: "Numbers",
    category: "Content",
    description: "Four figures in a row, each with its label.",
    tree: band(
      n("Grid", { columns: "4", gap: "md", responsive: true }, [
        n("Stat", undefined, undefined, { label: "Customers", value: "0" }),
        n("Stat", undefined, undefined, { label: "Countries", value: "0" }),
        n("Stat", undefined, undefined, { label: "Uptime", value: "0%" }),
        n("Stat", undefined, undefined, { label: "Support", value: "0h" }),
      ]),
    ),
  },
  {
    id: "logo-cloud",
    name: "Logo cloud",
    category: "Social proof",
    description: "Who uses it, as a centred row of names.",
    tree: band(
      n("Stack", { gap: "md", align: "center" }, [
        text("Trusted by teams at", { tone: "tertiary", size: "sm", weight: "label" }),
        n("Inline", { gap: "lg", inlineAlign: "center", justify: "center", wrap: true }, ["ACME", "GLOBEX", "INITECH", "UMBRELLA"].map((name) => text(name, { tone: "tertiary", size: "lg", weight: "label" }))),
      ]),
    ),
  },
  {
    id: "testimonials",
    name: "Testimonials",
    category: "Social proof",
    description: "Three quotes with a name and a role.",
    tree: band(
      n("Stack", { gap: "lg" }, [
        intro("What people say", "Replace these with real words from real customers."),
        n("Grid", { columns: "3", gap: "md", responsive: true }, [
          quote("A sentence from a customer about the result.", "Customer name", "CN", "Role, Company"),
          quote("A sentence from a customer about the result.", "Customer name", "CN", "Role, Company"),
          quote("A sentence from a customer about the result.", "Customer name", "CN", "Role, Company"),
        ]),
      ]),
    ),
  },
  {
    id: "pricing",
    name: "Pricing plans",
    category: "Pricing",
    description: "Three plans side by side, the middle one highlighted.",
    tree: band(
      n("Stack", { gap: "lg", gapExpanded: "xl" }, [
        intro("Simple, clear pricing", "Start free and change plans whenever you need to."),
        n("Grid", { columns: "3", gap: "md", responsive: true }, [
          plan("Free", "To try it out.", "$0", ["One project", "Community support"], false, "Start free"),
          plan("Team", "For teams that ship every week.", "$0", ["Unlimited projects", "Email support", "Reviews"], true),
          plan("Scale", "For larger organisations.", "$0", ["Everything in Team", "Priority support"], false, "Contact us"),
        ]),
      ]),
    ),
  },
  {
    id: "faq",
    name: "Questions and answers",
    category: "Questions",
    description: "A title and an accordion of questions.",
    tree: band(
      n("Stack", { gap: "lg" }, [
        intro("Frequently asked questions", "The things people ask before they start."),
        n("Accordion", { collapsible: true }, [
          question("first", "First question?", "A short, honest answer."),
          question("second", "Second question?", "A short, honest answer."),
          question("third", "Third question?", "A short, honest answer."),
        ]),
      ]),
      {},
      "sm",
    ),
  },
  {
    id: "cta-band",
    name: "Call to action",
    category: "Conversion",
    description: "A centred band with one sentence and two buttons.",
    tree: band(
      n("Stack", { gap: "md", align: "center" }, [
        heading("Ready to get started?", "h2"),
        text("One line that says what happens next.", { tone: "secondary", size: "lg" }),
        n("Inline", { gap: "sm", justify: "center", wrap: true }, [n("Button.action", { tone: "accent" }, "Get started"), n("Button.action", { variant: "ghost" }, "Talk to us")]),
      ]),
      { surface: "sunken", padding: "xl" },
      "md",
    ),
  },
  {
    id: "contact-form",
    name: "Contact form",
    category: "Conversion",
    description: "A short form: name, email, message and a send button.",
    tree: band(
      n("Stack", { gap: "lg" }, [
        n("Stack", { gap: "sm" }, [heading("Get in touch", "h2"), text("Tell us a little and we will reply soon.", { tone: "secondary" })]),
        n("Stack", { gap: "md" }, [
          n("FormField", { required: true }, undefined, { label: "Name", children: n("Input", { name: "name" }) }),
          n("FormField", { required: true }, undefined, { label: "Email", children: n("Input", { type: "email", name: "email" }) }),
          n("FormField", undefined, undefined, { label: "Message", children: n("Textarea", { name: "message" }) }),
          n("Button.action", { tone: "accent" }, "Send message"),
        ]),
      ]),
      {},
      "sm",
    ),
  },
  {
    id: "footer",
    name: "Footer",
    category: "Footer",
    description: "The brand and a few links on one line, the small print under it.",
    tree: n("Footer", { padding: "md" }, [
      n("Wrapper", { wrapperSize: "lg" }, [
        n("Stack", { gap: "md" }, [
          n("Inline", { justify: "between", inlineAlign: "center", wrap: true, gap: "md" }, [
            text("Your brand", { weight: "emphasis" }),
            n("Inline", { gap: "sm", wrap: true }, [n("Button.action", { variant: "ghost", size: "sm" }, "About"), n("Button.action", { variant: "ghost", size: "sm" }, "Contact"), n("Button.action", { variant: "ghost", size: "sm" }, "Privacy")]),
          ]),
          text("© Your brand. All rights reserved.", { tone: "tertiary", size: "sm" }),
        ]),
      ]),
    ]),
  },
];
