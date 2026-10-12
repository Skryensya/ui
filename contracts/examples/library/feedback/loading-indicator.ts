import { definePattern, type PatternModule } from "../../model/types.js";
import { inline, text } from "../kit.js";

interface Content {
  label: string;
  caption: string;
  variant: string;
}

const { pattern, use } = definePattern<Content>({
  id: "loading-indicator",
  subject: "feedback",
  scale: "fragment",
  title: { en: "Loading indicator", es: "Indicador de carga" },
  layout: { en: "A Loader with its accessible name, beside one line that says what is being waited for.", es: "Un Loader con su nombre accesible, junto a una línea que dice qué se está esperando." },
  fields: {
    label: { en: "The loader's accessible name: what a screen reader announces while it spins.", es: "El nombre accesible del loader: lo que anuncia un lector de pantalla mientras gira." },
    caption: { en: "The same thing for everyone who can see it, in plain words.", es: "Lo mismo para quien lo ve, en palabras simples." },
    variant: { en: "Which motion the loader draws; it changes the look, never the meaning.", es: "Qué movimiento dibuja el loader; cambia el aspecto, nunca el significado." },
  },
  notes: [
    { en: "The loader is named, so it is a status and not decoration; the caption is hidden from assistive technology because it would say the same words twice.", es: "El loader lleva nombre, así que es un estado y no decoración; el pie se oculta a la tecnología asistiva porque diría las mismas palabras dos veces." },
    { en: "Say what is loading (`results`, `your files`), never only `Loading`: a reader who lands on it later has no other context.", es: "Di qué se carga (`resultados`, `tus archivos`), nunca solo `Cargando`: quien llega después no tiene otro contexto." },
  ],
  build: ({ label, caption, variant }) =>
    inline(
      [
        { contract: "loader", signature: "Loader", options: { label, variant, size: "md" } },
        text(caption, { tone: "secondary", size: "sm" }, { "aria-hidden": "true" }),
      ],
      { gap: "sm", inlineAlign: "center" },
    ),
});

export const loadingIndicator: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "loading-results",
      intent: "status/progress/loading-indicator",
      title: { en: "Search results", es: "Resultados de búsqueda" },
      purpose: { en: "Show that a search is running and what it is searching, so an empty page is not read as no results.", es: "Mostrar que una búsqueda corre y qué busca, para que una página vacía no se lea como sin resultados." },
      content: { label: { en: "Loading results", es: "Cargando resultados" }, caption: { en: "Searching 12,400 documents…", es: "Buscando entre 12 400 documentos…" }, variant: "dots" },
    }),
  ],
};
