import { definePattern, type PatternModule } from "../../model/types.js";
import { box, icon, inline, navAction, surface, titleBlock } from "../kit.js";

interface Content {
  icon: string;
  title: string;
  body: string;
  link: string;
}

const { pattern, use } = definePattern<Content>({
  id: "feature-card",
  subject: "card",
  scale: "component",
  title: { en: "Feature card", es: "Card de característica" },
  layout: { en: "An icon on its own tile, a title with a short description, and one soft link to learn more.", es: "Un ícono sobre su propia baldosa, un título con una descripción corta y un enlace suave para saber más." },
  fields: { icon: { en: "The icon role that stands for the feature.", es: "El rol de ícono que representa la característica." }, title: { en: "The feature, named by what it does for you.", es: "La característica, nombrada por lo que hace por ti." }, body: { en: "One or two sentences.", es: "Una o dos frases." }, link: { en: "Where to read more, as a phrase.", es: "Dónde leer más, como frase." } },
  notes: [
    { en: "Name the benefit, not the mechanism (`Work offline`, not `Local-first sync engine`): the title is what a skimming reader takes away.", es: "Nombra el beneficio, no el mecanismo (`Trabaja sin conexión`, no `Motor de sincronización local`): el título es lo que se lleva quien hojea." },
    { en: "Put features in an equal grid, three or four of the same shape; one card alone is a statement, not a list of features.", es: "Pon las características en una cuadrícula igual, tres o cuatro de la misma forma; una card sola es una afirmación, no una lista de características." },
  ],
  build: ({ icon: name, title, body, link }) =>
    surface([inline([box([icon(name, "md")], { surface: "sunken", padding: "sm" })]), titleBlock(title, body), inline([navAction(link, "#", { variant: "ghost", size: "sm" })])]),
});

export const featureCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "feature-search", intent: "marketing/product/feature-highlight", title: { en: "Search", es: "Búsqueda" }, purpose: { en: "Introduce one capability on a landing page, in the benefit's own words.", es: "Presentar una capacidad en una página de aterrizaje, con las palabras del propio beneficio." }, content: { icon: "search", title: { en: "Find anything in seconds", es: "Encuentra lo que sea en segundos" }, body: { en: "Search across every project, file and comment from one box.", es: "Busca en todos los proyectos, archivos y comentarios desde una sola caja." }, link: { en: "How search works", es: "Cómo funciona la búsqueda" } } }),
  ],
};
