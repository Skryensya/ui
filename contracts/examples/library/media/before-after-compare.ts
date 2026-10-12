import { definePattern, type PatternModule } from "../../model/types.js";
import { box, heading, stack, text } from "../kit.js";

interface Version {
  eyebrow: string;
  title: string;
  line: string;
}
interface Content {
  label: string;
  before: Version;
  after: Version;
}

/* The old version reads from the start and the new one from the end, so each stays readable on its own side of the divider. */
const version = (v: Version, surface: "sunken" | "raised", side: "start" | "end") =>
  box([stack([text(v.eyebrow, { textRole: "eyebrow" }), heading(v.title, "h3"), text(v.line, { size: "sm", tone: "secondary" })], { gap: "sm", align: side })], { surface, padding: "lg" });

const { pattern, use } = definePattern<Content>({
  id: "before-after-compare",
  subject: "media",
  scale: "component",
  title: { en: "Before and after", es: "Antes y después" },
  layout: { en: "A CompareSlider over two Boxes of the same shape, the old version sunken and the new one raised.", es: "Un CompareSlider sobre dos Box de la misma forma, la versión vieja hundida y la nueva elevada." },
  fields: { label: { en: "What is being compared: it names the divider.", es: "Qué se compara: nombra el divisor." }, before: { en: "The old version: a label, a title and a line.", es: "La versión vieja: una etiqueta, un título y una línea." }, after: { en: "The new version, with the same three parts.", es: "La versión nueva, con las mismas tres partes." } },
  notes: [
    { en: "Both layers have the same anatomy so what is on one side of the divider lines up with the other; two unrelated pictures would only be cut in half.", es: "Las dos capas tienen la misma anatomía para que lo de un lado del divisor se alinee con el otro; dos imágenes sin relación solo se cortarían por la mitad." },
    { en: "The old version reads from the start and the new one from the end, so each stays readable on its own side of the divider. Layers hold plain text, never links or buttons: a press anywhere on the box moves the divider, so anything inside would be unreachable.", es: "La versión vieja se lee desde el inicio y la nueva desde el final, así cada una se lee en su lado del divisor. Las capas llevan texto simple, nunca enlaces ni botones: una pulsación en cualquier parte de la caja mueve el divisor, así que lo de dentro sería inalcanzable." },
  ],
  build: ({ label, before, after }) => ({
    contract: "compare-slider",
    signature: "CompareSlider",
    options: { label },
    slots: { before: version(before, "sunken", "start"), after: version(after, "raised", "end") },
  }),
});

export const beforeAfterCompare: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "compare-pricing-card",
      intent: "content/presentation/before-after",
      title: { en: "Old and new pricing", es: "Precio viejo y nuevo" },
      purpose: { en: "Let a reader judge a redesign by dragging between the two versions of the same card.", es: "Dejar que quien lee juzgue un rediseño arrastrando entre las dos versiones de la misma tarjeta." },
      content: {
        label: { en: "Compare the old and the new pricing card", es: "Compara la tarjeta de precios vieja y la nueva" },
        before: { eyebrow: { en: "Before", es: "Antes" }, title: "12 €", line: { en: "Billed monthly. Cancel any time.", es: "Facturado cada mes. Cancela cuando quieras." } },
        after: { eyebrow: { en: "After", es: "Después" }, title: "10 €", line: { en: "Billed yearly. Two months free.", es: "Facturado al año. Dos meses gratis." } },
      },
    }),
  ],
};
