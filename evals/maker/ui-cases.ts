import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Invariant } from "../case.js";

/*
 * THE UI BENCH: prompts a person would really type, grouped by the component they exercise, each with what ANY good answer
 * must do (invariants, never an exact tree) and the mistakes the model has actually made. Two kinds of case:
 *
 *   build   a request on an empty page ("a pricing section with three plans"): the structure and the right component.
 *   edit    a request on a page that exists ("change the heading", "remove the pricing section"): what is asked changes and
 *           everything else stays exactly as it was. An agent that regenerates the page fails these, however good the page.
 *
 * Every case ships a `good` tree and `bad` ones. `ui-cases.test.ts` holds the checks to them offline, so a check that would
 * pass the wrong page, or fail the right one, is caught before it costs a model call.
 */
export type UiCase = {
  readonly id: string;
  /** The component family it exercises: what to filter by when only one is being tuned. */
  readonly family: string;
  readonly prompt: { readonly en: string; readonly es: string };
  /** What the page holds before the request (the children of its Main). Absent: an empty page. */
  readonly start?: readonly UsageTree[];
  readonly invariants: readonly Invariant[];
  /** Edits: copy that must still be there, copy that must be gone, and copy that must have arrived. */
  readonly keeps?: readonly string[];
  readonly removes?: readonly string[];
  readonly adds?: readonly string[];
  /** Page children (inside Main) of a correct answer. */
  readonly good: readonly UsageTree[];
  readonly bad: readonly { readonly children: readonly UsageTree[]; readonly because: string }[];
};

const T = (children: string, options: Record<string, unknown> = {}): UsageTree => ({ contract: "typography", signature: "Text", options, children });
const H = (children: string): UsageTree => ({ contract: "typography", signature: "Heading", children });
const btn = (label: string, options: Record<string, unknown> = {}): UsageTree => ({ contract: "button", signature: "Button.action", options, children: label });
const nav = (label: string, href: string): UsageTree => ({ contract: "button", signature: "Button.navigation", options: { href }, children: label });
const stack = (children: UsageTree[], gap = "md"): UsageTree => ({ contract: "layout", signature: "Stack", options: { gap }, children });
const inline = (children: UsageTree[]): UsageTree => ({ contract: "layout", signature: "Inline", options: { gap: "sm" }, children });
const grid = (children: UsageTree[]): UsageTree => ({ contract: "layout", signature: "Grid", options: { minColumn: "md", gap: "md" }, children });
const wrap = (children: UsageTree[], size = "md"): UsageTree => ({ contract: "wrapper", signature: "Wrapper", options: { wrapperSize: size }, children });
const box = (children: UsageTree[]): UsageTree => ({ contract: "box", signature: "Box", options: { padding: "md", surface: "surface", border: "subtle", radius: "surface" }, children });
const BUTTONS = ["Button.action", "Button.navigation"];

/** A small existing page the edit cases start from. */
const welcome: UsageTree[] = [wrap([stack([H("Welcome"), T("A short introduction."), btn("Start")])])];

export const uiCases: readonly UiCase[] = [
  /* ─── build ──────────────────────────────────────────────────────────────────────────────────────────────────────── */
  {
    id: "hero-two-actions",
    family: "hero",
    prompt: {
      en: "A hero for a bakery landing page: a headline, one supporting sentence, and two buttons side by side, a primary 'Order now' and a secondary 'See the menu'.",
      es: "Un hero para la landing de una panadería: un titular, una frase de apoyo y dos botones lado a lado, uno principal 'Pedir ahora' y uno secundario 'Ver el menú'.",
    },
    invariants: [
      { uses: ["Hero"], because: "a hero is what the Hero component is for" },
      { count: { signature: BUTTONS, min: 2 }, because: "two actions were asked for" },
      { contains: { ancestor: "Inline", descendant: BUTTONS }, because: "buttons that sit together are an Inline, never two rows of a Stack" },
      { before: { first: "Heading", then: BUTTONS }, because: "the headline comes before the actions" },
    ],
    good: [{ contract: "hero", signature: "Hero", options: { align: "center", padding: "lg" }, children: [stack([H("Fresh bread, every morning"), T("Baked at dawn from simple ingredients."), inline([btn("Order now", { variant: "solid" }), btn("See the menu", { variant: "soft" })])])] }],
    bad: [
      { children: [{ contract: "hero", signature: "Hero", children: [stack([H("Fresh bread"), T("Baked at dawn."), btn("Order now"), btn("See the menu")])] }], because: "buttons stacked one under another" },
      { children: [wrap([stack([H("Fresh bread"), T("Baked at dawn."), inline([btn("Order now"), btn("See the menu")])])])], because: "a Wrapper and a Stack, not a Hero" },
    ],
  },
  {
    id: "pricing-three-plans",
    family: "layout",
    prompt: {
      en: "A pricing section with three plans side by side. Each plan has a name, a price, a short list of what it includes and a button.",
      es: "Una sección de precios con tres planes lado a lado. Cada plan tiene nombre, precio, una lista corta de lo que incluye y un botón.",
    },
    invariants: [
      { uses: ["Grid"], because: "equal cards in columns are a Grid, which also stacks them on a narrow screen" },
      { count: { signature: BUTTONS, min: 3 }, because: "each of the three plans has its own button" },
      { count: { signature: "Heading", min: 3 }, because: "each plan is named" },
      { contains: { ancestor: "Grid", descendant: BUTTONS }, because: "the plans sit inside the grid" },
      { uses: ["Wrapper"], because: "the section needs a width ceiling" },
    ],
    good: [wrap([stack([H("Pricing"), grid([1, 2, 3].map((n) => box([stack([H(`Plan ${n}`), T("Price"), T("What this plan includes."), btn("Choose")])])))])], "lg")],
    bad: [
      { children: [wrap([stack([H("Pricing"), box([H("Plan 1"), btn("Choose")]), box([H("Plan 2"), btn("Choose")]), box([H("Plan 3"), btn("Choose")])])])], because: "three plans one under another, no grid" },
      { children: [stack([H("Pricing"), grid([1, 2, 3].map((n) => box([stack([H(`Plan ${n}`), btn("Choose")])])))])], because: "no Wrapper: grows with the window" },
    ],
  },
  {
    id: "features-three-columns",
    family: "layout",
    prompt: {
      en: "Three features in columns, each with a title and a short description.",
      es: "Tres características en columnas, cada una con un título y una descripción corta.",
    },
    invariants: [
      { anyOf: [{ uses: ["Grid"] }, { uses: ["LayoutGrid"] }], because: "columns that share the width are a Grid" },
      { count: { signature: "Heading", min: 3 }, because: "three titles" },
      { count: { signature: "Text", min: 3 }, because: "three descriptions" },
    ],
    good: [wrap([grid([1, 2, 3].map((n) => stack([H(`Feature ${n}`), T("A short description.")], "xs")))], "lg")],
    bad: [{ children: [wrap([inline([1, 2, 3].map((n) => stack([H(`Feature ${n}`), T("A short description.")])))])], because: "an Inline does not wrap or stack on a narrow screen" }],
  },
  {
    id: "faq-expand",
    family: "accordion",
    prompt: {
      en: "An FAQ with four questions; clicking a question expands its answer.",
      es: "Un FAQ con cuatro preguntas; al hacer clic en una se despliega su respuesta.",
    },
    invariants: [
      { anyOf: [{ uses: ["Accordion"] }, { uses: ["DetailsGroup"] }], because: "expandable answers are an Accordion or a DetailsGroup" },
      { count: { signature: ["Accordion.Item", "Details"], min: 4 }, because: "four questions" },
      { avoids: ["Button.action"], because: "a hand-made toggle where the component exists" },
    ],
    good: [wrap([stack([H("Questions"), { contract: "accordion", signature: "DetailsGroup", children: [1, 2, 3, 4].map((n) => ({ contract: "accordion", signature: "Details", children: [{ contract: "accordion", signature: "Details.Summary", children: `Question ${n}` }, { contract: "accordion", signature: "Details.Content", children: "The answer." }] })) }])])],
    bad: [{ children: [wrap([stack([H("Questions"), ...[1, 2, 3, 4].flatMap((n) => [H(`Question ${n}`), T("The answer.")])])])], because: "everything open, nothing expands" }],
  },
  {
    id: "contact-form",
    family: "form-field",
    prompt: {
      en: "A contact form with name, email and a message, and a send button.",
      es: "Un formulario de contacto con nombre, email y un mensaje, y un botón para enviar.",
    },
    invariants: [
      { count: { signature: "FormField", min: 3 }, because: "every control has a visible label, through FormField" },
      { uses: ["Textarea"], because: "a message is several lines" },
      { contains: { ancestor: "FormField", descendant: ["Input", "Textarea"] }, because: "the label belongs to the control it names" },
      { count: { signature: "Button.action", min: 1 }, because: "a send button" },
      { option: { signature: "Input", name: "type", equals: "email" }, because: "the email field is typed as an email" },
    ],
    good: [wrap([stack([H("Contact"), { contract: "form-field", signature: "FormField", slots: { label: "Name" }, children: { contract: "input", signature: "Input", options: { name: "name" } } }, { contract: "form-field", signature: "FormField", slots: { label: "Email" }, children: { contract: "input", signature: "Input", options: { name: "email", type: "email" } } }, { contract: "form-field", signature: "FormField", slots: { label: "Message" }, children: { contract: "input", signature: "Textarea", options: { name: "message" } } }, btn("Send")])])],
    bad: [{ children: [wrap([stack([H("Contact"), T("Name"), { contract: "input", signature: "Input" }, T("Email"), { contract: "input", signature: "Input" }, btn("Send")])])], because: "labels as loose text, no Textarea, email not typed" }],
  },
  {
    id: "stats-row",
    family: "stat",
    prompt: {
      en: "Three key numbers in a row: customers, countries and years in business.",
      es: "Tres cifras clave en una fila: clientes, países y años de trayectoria.",
    },
    invariants: [
      { count: { signature: "Stat", min: 3 }, because: "a figure with its label is a Stat" },
      { anyOf: [{ contains: { ancestor: "Grid", descendant: "Stat" } }, { contains: { ancestor: "Inline", descendant: "Stat" } }], because: "they sit side by side" },
    ],
    good: [wrap([grid([["Customers", "0"], ["Countries", "0"], ["Years", "0"]].map(([label, value]) => ({ contract: "stat", signature: "Stat", slots: { label: label!, value: value! } })))])],
    bad: [{ children: [wrap([inline([1, 2, 3].map((n) => stack([H(`${n}`), T("label")])))])], because: "hand-made figures where Stat exists" }],
  },
  {
    id: "site-header",
    family: "navbar",
    prompt: {
      en: "A site header with the name on the left and links to Home, Menu and Contact.",
      es: "Un encabezado con el nombre a la izquierda y enlaces a Inicio, Menú y Contacto.",
    },
    invariants: [
      { uses: ["Navbar"], because: "the header is a Navbar" },
      { uses: ["NavbarBrand"], because: "the name sits in the brand slot" },
      { count: { signature: ["NavListLink", "Button.navigation", "Link"], min: 3 }, because: "three destinations" },
    ],
    good: [{ contract: "navbar", signature: "Navbar", children: [{ contract: "navbar", signature: "NavbarBrand", children: "Site name" }, { contract: "nav-list", signature: "NavList", options: { orientation: "horizontal" }, children: [{ contract: "nav-list", signature: "NavListGroup", children: ["Home", "Menu", "Contact"].map((label) => ({ contract: "nav-list", signature: "NavListLink", options: { href: "/" }, children: label })) }] }] }],
    bad: [{ children: [inline([H("Site name"), nav("Home", "/"), nav("Menu", "/menu")])], because: "an Inline for a header, two links, no Navbar" }],
  },
  {
    id: "data-table",
    family: "table",
    prompt: {
      en: "A table of the last three invoices with number, date and amount.",
      es: "Una tabla con las últimas tres facturas, con número, fecha e importe.",
    },
    invariants: [
      { uses: ["Table"], because: "tabular data is a Table" },
      { uses: ["TableCaption"], because: "a table is named by its caption" },
      { before: { first: "TableCaption", then: "TableHead" }, because: "the caption comes first" },
      { count: { signature: "TableRow", min: 4 }, because: "a header row and three invoices" },
      { contains: { ancestor: "TableHead", descendant: "TableHeader" }, because: "column headers are header cells" },
    ],
    good: [wrap([{ contract: "table", signature: "Table", children: [{ contract: "table", signature: "TableCaption", children: "Latest invoices" }, { contract: "table", signature: "TableHead", children: [{ contract: "table", signature: "TableRow", children: ["Number", "Date", "Amount"].map((label) => ({ contract: "table", signature: "TableHeader", options: { scope: "col" }, children: label })) }] }, { contract: "table", signature: "TableBody", children: [1, 2, 3].map(() => ({ contract: "table", signature: "TableRow", children: ["#", "Date", "Amount"].map((label) => ({ contract: "table", signature: "TableCell", children: label })) })) }] }])],
    bad: [{ children: [wrap([stack([1, 2, 3].map(() => inline([T("#"), T("Date"), T("Amount")])))])], because: "rows faked with Inlines" }],
  },
  {
    id: "empty-state",
    family: "empty-state",
    prompt: {
      en: "The empty state of a projects page: a title, one sentence, and a button to create a project.",
      es: "El estado vacío de una página de proyectos: un título, una frase y un botón para crear un proyecto.",
    },
    invariants: [
      { uses: ["EmptyState"], because: "this is exactly what EmptyState is for" },
      { count: { signature: BUTTONS, exactly: 1 }, because: "one clear next step" },
    ],
    good: [wrap([{ contract: "empty-state", signature: "EmptyState", slots: { title: "No projects yet", description: "Projects keep your work together.", actions: [btn("Create a project")] } }])],
    bad: [{ children: [wrap([stack([H("No projects yet"), T("Nothing here."), btn("Create a project"), btn("Learn more")])])], because: "hand-made, two competing actions" }],
  },
  {
    id: "warning-callout",
    family: "callout",
    prompt: {
      en: "A warning that the trial ends in three days, with a button to upgrade.",
      es: "Un aviso de que la prueba termina en tres días, con un botón para mejorar el plan.",
    },
    invariants: [
      { uses: ["Callout"], because: "a message the person must notice is a Callout" },
      { option: { signature: "Callout", name: "tone", equals: "warning" }, because: "it is a warning" },
      { contains: { ancestor: "Callout", descendant: BUTTONS }, because: "the action belongs to the notice" },
    ],
    good: [wrap([{ contract: "callout", signature: "Callout", options: { tone: "warning" }, slots: { title: "Your trial ends in 3 days", actions: [btn("Upgrade")] }, children: "Upgrade to keep your work." }])],
    bad: [{ children: [wrap([stack([T("Your trial ends in 3 days"), btn("Upgrade")])])], because: "plain text, not a Callout, no tone" }],
  },
  {
    id: "marquee-full-width",
    family: "marquee",
    prompt: {
      en: "A strip of six customer names that scrolls horizontally and spans the full width of the page.",
      es: "Una franja con seis nombres de clientes que se desplaza horizontalmente y ocupa todo el ancho de la página.",
    },
    invariants: [
      { anyOf: [{ uses: ["Marquee"] }, { uses: ["Marquee.autoplay"] }], because: "a scrolling strip is a Marquee" },
      { count: { signature: ["Text", "Tag", "Strong"], min: 6 }, because: "six names" },
      { anyOf: [{ avoids: ["Wrapper"] }, { option: { signature: "Wrapper", name: "wrapperSize", equals: "full" } }], because: "a strip asked to span the page must not sit in a narrow Wrapper" },
    ],
    good: [{ contract: "marquee", signature: "Marquee.autoplay", options: { control: true }, slots: { pauseLabel: "Pause", playLabel: "Play" }, children: ["Customer A", "Customer B", "Customer C", "Customer D", "Customer E", "Customer F"].map((name) => T(name)) }],
    bad: [{ children: [wrap([{ contract: "marquee", signature: "Marquee.autoplay", slots: { pauseLabel: "Pause" }, children: ["A", "B", "C", "D", "E", "F"].map((name) => T(name)) }], "sm")], because: "the strip is squeezed into a small container" }],
  },

  /* ─── edit: what is asked changes, and nothing else does ─────────────────────────────────────────────────────────── */
  {
    id: "edit-heading-copy",
    family: "edit",
    prompt: { en: "Change the heading to 'Build faster' and leave everything else exactly as it is.", es: "Cambia el título a 'Build faster' y deja todo lo demás exactamente igual." },
    start: welcome,
    keeps: ["A short introduction.", "Start"],
    removes: ["Welcome"],
    adds: ["Build faster"],
    invariants: [{ count: { signature: "Heading", exactly: 1 }, because: "the heading was edited, not duplicated" }],
    good: [wrap([stack([H("Build faster"), T("A short introduction."), btn("Start")])])],
    bad: [{ children: [wrap([stack([H("Build faster"), T("Ship in minutes."), btn("Get started")])])], because: "the page was rewritten, not edited" }],
  },
  {
    id: "edit-append-cta",
    family: "edit",
    prompt: { en: "Add a call to action at the end of the page with a headline and a button that goes to /pricing. Keep everything that is there.", es: "Añade una llamada a la acción al final de la página con un titular y un botón que lleve a /pricing. Conserva todo lo que ya está." },
    start: welcome,
    keeps: ["Welcome", "A short introduction.", "Start"],
    invariants: [
      { option: { signature: "Button.navigation", name: "href", equals: "/pricing" }, because: "a button that goes somewhere is a navigation, to /pricing" },
      { count: { signature: "Heading", min: 2 }, because: "the new headline is added next to the existing one" },
    ],
    good: [...welcome, wrap([stack([H("Ready to start?"), nav("See pricing", "/pricing")])])],
    bad: [{ children: [...welcome, wrap([stack([H("Ready to start?"), btn("See pricing")])])], because: "an action button where a link to /pricing was asked" }],
  },
  {
    id: "edit-buttons-side-by-side",
    family: "edit",
    prompt: { en: "Put the two buttons next to each other.", es: "Pon los dos botones uno al lado del otro." },
    start: [wrap([stack([H("Choose"), btn("One"), btn("Two")])])],
    keeps: ["Choose", "One", "Two"],
    invariants: [
      { contains: { ancestor: "Inline", descendant: "Button.action" }, because: "side by side is an Inline" },
      { count: { signature: "Button.action", exactly: 2 }, because: "the same two buttons, no more" },
    ],
    good: [wrap([stack([H("Choose"), inline([btn("One"), btn("Two")])])])],
    bad: [{ children: [wrap([stack([H("Choose"), btn("One"), btn("Two")])])], because: "nothing changed" }],
  },
  {
    id: "edit-remove-section",
    family: "edit",
    prompt: { en: "Remove the pricing section and nothing else.", es: "Quita la sección de precios y nada más." },
    start: [wrap([stack([H("Features"), T("What it does.")])]), wrap([stack([H("Pricing"), T("What it costs."), btn("Buy")])])],
    keeps: ["Features", "What it does."],
    removes: ["Pricing", "What it costs.", "Buy"],
    invariants: [{ count: { signature: "Heading", exactly: 1 }, because: "only the Features heading is left" }],
    good: [wrap([stack([H("Features"), T("What it does.")])])],
    bad: [{ children: [], because: "everything removed, not only the pricing section" }],
  },
];
