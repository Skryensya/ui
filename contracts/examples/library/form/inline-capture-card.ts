import { definePattern, type PatternModule } from "../../model/types.js";
import { action, inline, surface, titleBlock } from "../kit.js";

interface Content {
  title: string;
  body: string;
  /** The field's name. Hidden: the button says what it is for. */
  label: string;
  placeholder: string;
  submit: string;
}

const { pattern, use } = definePattern<Content>({
  id: "inline-capture-card",
  subject: "form",
  scale: "component",
  title: { en: "Inline capture card", es: "Card de captura en línea" },
  layout: { en: "A title block, then one field and one button on a single line.", es: "Un bloque de título y, debajo, un campo y un botón en una sola línea." },
  fields: { title: { en: "The offer.", es: "La oferta." }, body: { en: "What to expect.", es: "Qué esperar." }, label: { en: "The field's accessible name.", es: "El nombre accesible del campo." }, placeholder: { en: "An example value.", es: "Un valor de ejemplo." }, submit: { en: "The action.", es: "La acción." } },
  notes: [{ en: "The label is hidden because the button beside the field already says what it is for: the one case a hidden label is allowed. It stays in the markup, so a screen reader still hears it.", es: "La etiqueta está oculta porque el botón junto al campo ya dice para qué es: el único caso en que se permite. Sigue en el markup, así que un lector de pantalla la oye." }, { en: "The field is `fill` so it takes the row the button leaves.", es: "El campo es `fill` para que tome lo que deja libre el botón." }],
  build: ({ title, body, label, placeholder, submit }, ctx) =>
    surface([
      titleBlock(title, body),
      inline(
        [
          { contract: "form-field", signature: "FormField", options: { labelHidden: true }, attrs: { "data-sizing": "fill" }, slots: { label, children: { contract: "input", signature: "Input", options: { type: "email", name: `${ctx.ns}-email`, placeholder } } } },
          action(submit, { tone: "accent", variant: "soft", type: "submit" }),
        ],
        { gap: "sm", inlineAlign: "end", wrap: false },
      ),
    ]),
});

export const inlineCaptureCard: PatternModule<Content> = {
  pattern,
  uses: [use({ id: "newsletter-signup", intent: "input/capture/subscribe", title: { en: "Newsletter", es: "Suscripción" }, purpose: { en: "One value and one action, on one line.", es: "Un solo dato y una acción, en una línea." }, content: { title: { en: "Get the news", es: "Recibe las novedades" }, body: { en: "One email a month, no filler.", es: "Un correo al mes, sin relleno." }, label: { en: "Email", es: "Correo" }, placeholder: { en: "name@example.com", es: "nombre@ejemplo.com" }, submit: { en: "Subscribe", es: "Suscribirme" } } })],
};
