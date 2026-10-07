import { definePattern, type PatternModule } from "../../model/types.js";
import { action, badge, heading, icon, inline, list, separator, stack, surface, text } from "../kit.js";

interface Content {
  name: string;
  body: string;
  /** The price alone: "$24". */
  price: string;
  /** What the price is per: "per person per month". */
  per: string;
  featuresLabel: string;
  features: string[];
  cta: string;
  /** Set on the one recommended offer: lifts the card, adds the badge and makes its action the accent. */
  featured?: string;
}

const { pattern, use } = definePattern<Content>({
  id: "pricing-column",
  subject: "card",
  scale: "component",
  title: { en: "Pricing column", es: "Columna de precio" },
  layout: { en: "Name and one line of who it is for, the price with its unit on one baseline, a rule, a checked feature list, and one action at the foot.", es: "Nombre y una línea de a quién sirve, el precio con su unidad en una línea base, una regla, una lista de funciones con check y una acción al pie." },
  fields: { name: { en: "The offer's name.", es: "El nombre de la oferta." }, body: { en: "Who it is for.", es: "A quién sirve." }, price: { en: "The price.", es: "El precio." }, per: { en: "The unit of the price.", es: "La unidad del precio." }, featuresLabel: { en: "The feature list's accessible name.", es: "El nombre accesible de la lista de funciones." }, features: { en: "What is included, three to five lines.", es: "Qué incluye, de tres a cinco líneas." }, cta: { en: "The action's label, naming the offer.", es: "La etiqueta de la acción, nombrando la oferta." }, featured: { en: "The badge text, only on the recommended offer.", es: "El texto de la insignia, solo en la oferta recomendada." } },
  notes: [{ en: "One solid accent action per row of plans: only the featured column gets it, the rest stay soft, so the page has a single main action.", es: "Una sola acción sólida con acento por fila de planes: solo la columna destacada la tiene, el resto queda suave, y la página tiene una acción principal." }],
  build: ({ name, body, price, per, featuresLabel, features, cta, featured }) =>
    surface(
      [
        stack([...(featured ? [badge(featured, "accent")] : []), heading(name, "h4"), text(body, { size: "sm", tone: "secondary" })], { gap: "xs", align: "start" }),
        inline([text(price, { size: "lg", weight: "emphasis", textElement: "span" }), text(per, { size: "sm", tone: "secondary", textElement: "span" })], { gap: "xs", inlineAlign: "baseline" }),
        separator(),
        list(featuresLabel, features.map((title) => ({ leading: icon("check", "sm"), title }))),
        action(cta, featured ? { variant: "solid", tone: "accent" } : { variant: "soft" }),
      ],
      Boolean(featured),
    ),
});

const per = { en: "per person per month", es: "por persona al mes" };
const includes = { en: "Includes", es: "Incluye" };

export const pricingColumn: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "plan-starter",
      intent: "commerce/pricing/plan",
      title: { en: "Starter plan", es: "Plan inicial" },
      purpose: { en: "The entry offer: free, for one person or a small team.", es: "La oferta de entrada: gratis, para una persona o un equipo pequeño." },
      catalog: false,
      content: { name: { en: "Starter", es: "Inicial" }, body: { en: "To start on your own or with a small team.", es: "Para empezar solo o con un equipo pequeño." }, price: "$0", per, featuresLabel: includes, features: [{ en: "Up to 3 projects", es: "Hasta 3 proyectos" }, { en: "10 GB of storage", es: "10 GB de almacenamiento" }, { en: "Email support", es: "Soporte por correo" }], cta: { en: "Choose Starter", es: "Elegir Inicial" } },
    }),
    use({
      id: "plan-team",
      intent: "commerce/pricing/plan",
      title: { en: "Plan", es: "Plan" },
      purpose: { en: "One offer with its price and what it includes, to compare with others.", es: "Una oferta con precio y lo que incluye, para comparar con otras." },
      content: { name: { en: "Team", es: "Equipo" }, body: { en: "For teams that work together every day.", es: "Para equipos que trabajan juntos cada día." }, price: "$24", per, featuresLabel: includes, features: [{ en: "Unlimited projects", es: "Proyectos ilimitados" }, { en: "100 GB of storage", es: "100 GB de almacenamiento" }, { en: "Role-based permissions", es: "Permisos por rol" }], cta: { en: "Choose Team", es: "Elegir Equipo" }, featured: { en: "Most chosen", es: "Más elegido" } },
    }),
    use({
      id: "plan-business",
      intent: "commerce/pricing/plan",
      title: { en: "Business plan", es: "Plan empresa" },
      purpose: { en: "The top offer, for organisations with control requirements.", es: "La oferta superior, para organizaciones con requisitos de control." },
      catalog: false,
      content: { name: { en: "Business", es: "Empresa" }, body: { en: "For organisations with control requirements.", es: "Para organizaciones con requisitos de control." }, price: "$49", per, featuresLabel: includes, features: [{ en: "Single sign-on", es: "Inicio de sesión único" }, { en: "Custom storage", es: "Almacenamiento a medida" }, { en: "Dedicated support", es: "Soporte dedicado" }], cta: { en: "Choose Business", es: "Elegir Empresa" } },
    }),
  ],
};
