import { definePattern, type PatternModule } from "../../model/types.js";
import { stack } from "../kit.js";

interface Content {
  label: string;
  lines: number;
  lastWidth: string;
}

const { pattern, use } = definePattern<Content>({
  id: "content-skeleton",
  subject: "feedback",
  scale: "fragment",
  title: { en: "Content skeleton", es: "Esqueleto de contenido" },
  layout: { en: "A heading-sized Placeholder over a few body-sized ones, the last shorter, shimmering.", es: "Un Placeholder del tamaño de un título sobre unos del tamaño del cuerpo, el último más corto, con brillo." },
  fields: { label: { en: "What is loading, for assistive technology: the region is marked busy and named once.", es: "Qué está cargando, para la tecnología asistiva: la región se marca ocupada y se nombra una vez." }, lines: { en: "How many lines of body the real content will have.", es: "Cuántas líneas de cuerpo tendrá el contenido real." }, lastWidth: { en: "How far the last line reaches, as a share of the width.", es: "Hasta dónde llega la última línea, como proporción del ancho." } },
  notes: [
    { en: "The skeleton has the shape of what is coming (a title, then a paragraph that ends short): when the real text lands, nothing jumps.", es: "El esqueleto tiene la forma de lo que viene (un título, luego un párrafo que termina corto): cuando llega el texto real, nada salta." },
    { en: "It is hidden from assistive technology; announce the wait once, with a named Loader or a status, not once per bar.", es: "Se oculta a la tecnología asistiva; anuncia la espera una vez, con un Loader con nombre o un estado, no una vez por barra." },
  ],
  build: ({ label, lines, lastWidth }) =>
    stack(
      [
        { contract: "placeholder", signature: "Placeholder", options: { text: "h4", width: "55%", shimmer: true } },
        ...Array.from({ length: lines }, (_, index) => ({ contract: "placeholder", signature: "Placeholder", options: { text: "body", width: index === lines - 1 ? lastWidth : "100%", shimmer: true } })),
      ],
      { gap: "sm" },
      { role: "group", "aria-busy": "true", "aria-label": label },
    ),
});

export const contentSkeleton: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "skeleton-article",
      intent: "status/progress/content-skeleton",
      title: { en: "An article loading", es: "Un artículo cargando" },
      purpose: { en: "Hold the place of a title and a paragraph while they arrive, so the page does not reflow.", es: "Guardar el lugar de un título y un párrafo mientras llegan, para que la página no se reacomode." },
      content: { label: { en: "Loading the article", es: "Cargando el artículo" }, lines: 3, lastWidth: "70%" },
    }),
  ],
};
