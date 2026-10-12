import { definePattern, type PatternModule } from "../../model/types.js";
import { action, inline, separator, surface, text, type Person } from "../kit.js";
import { avatarByline } from "./avatar-byline.js";
import { headingStack } from "./heading-stack.js";

interface Content {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  person: Person;
  meta: string;
  open: string;
}

const { pattern, use } = definePattern<Content>({
  id: "project-card",
  subject: "card",
  scale: "component",
  title: { en: "Project card", es: "Card de proyecto" },
  layout: { en: "A heading block, a short description, a rule, and a footer with who is behind it at the start and one action at the end.", es: "Un bloque de encabezado, una descripción corta, una línea y un pie con quién está detrás al inicio y una acción al final." },
  fields: { eyebrow: { en: "The category.", es: "La categoría." }, title: { en: "What it is called.", es: "Cómo se llama." }, subtitle: { en: "When it last changed.", es: "Cuándo cambió por última vez." }, description: { en: "What it is, in a sentence or two.", es: "Qué es, en una o dos frases." }, person: { en: "The owner: name and initials.", es: "La persona responsable: nombre e iniciales." }, meta: { en: "The line under the owner's name.", es: "La línea bajo el nombre de la persona." }, open: { en: "The action's label.", es: "La etiqueta de la acción." } },
  notes: [{ en: "The footer is one Inline that never wraps the byline: on a narrow card the action keeps its place and the description above it gives way.", es: "El pie es un Inline que nunca parte la autoría: en una card angosta la acción conserva su lugar y cede la descripción de arriba." }],
  build: ({ eyebrow, title, subtitle, description, person, meta, open }, ctx) =>
    surface([
      headingStack.pattern.build({ eyebrow, title, subtitle }, ctx),
      text(description, { size: "sm" }),
      separator(),
      inline([avatarByline.pattern.build({ person, meta }, ctx), action(open, { variant: "ghost", size: "sm" })], { gap: "md", justify: "between", inlineAlign: "center" }),
    ]),
});

export const projectCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "project-summary",
      intent: "collaboration/work/project",
      title: { en: "Project", es: "Proyecto" },
      purpose: { en: "A project at a glance: what it is, who owns it and the way in.", es: "Un proyecto de un vistazo: qué es, quién lo lleva y la entrada." },
      content: {
        eyebrow: { en: "Project", es: "Proyecto" },
        title: { en: "Customer portal redesign", es: "Rediseño del portal de clientes" },
        subtitle: { en: "Updated 2 hours ago", es: "Actualizado hace 2 horas" },
        description: { en: "A new home for invoices, plans and support, built to cut the calls the team gets each week.", es: "Un nuevo hogar para facturas, planes y soporte, pensado para reducir las llamadas que recibe el equipo cada semana." },
        person: { name: "Marta Ruiz", initials: "MR" },
        meta: { en: "Owner · since October 3", es: "Responsable · desde el 3 de octubre" },
        open: { en: "Open project", es: "Abrir proyecto" },
      },
    }),
  ],
};
