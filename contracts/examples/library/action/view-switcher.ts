import { definePattern, type PatternModule } from "../../model/types.js";
import { stack, surface, text, titleBlock } from "../kit.js";

interface Content {
  title: string;
  subtitle: string;
  label: string;
  selected: string;
  options: { value: string; label: string }[];
  figure: string;
  caption: string;
}

const { pattern, use } = definePattern<Content>({
  id: "view-switcher",
  subject: "action",
  scale: "component",
  title: { en: "Switcher card", es: "Card con selector" },
  layout: { en: "A title block, a segmented control of two or three options and the figure and note that go with the choice.", es: "Un bloque de título, un control segmentado de dos o tres opciones y la cifra y la nota que acompañan la elección." },
  fields: { title: { en: "What is being chosen.", es: "Qué se elige." }, subtitle: { en: "One line of context.", es: "Una línea de contexto." }, label: { en: "The control's accessible name.", es: "El nombre accesible del control." }, selected: { en: "The `value` of the option that starts selected.", es: "El `value` de la opción que empieza seleccionada." }, options: { en: "Two or three options: a stable `value` and a short label.", es: "Dos o tres opciones: un `value` estable y una etiqueta corta." }, figure: { en: "What the selected option gives, formatted.", es: "Lo que da la opción elegida, con formato." }, caption: { en: "The note under the figure.", es: "La nota bajo la cifra." } },
  notes: [{ en: "The figure shown is the one for the option that starts selected; the host swaps it when the choice changes. Two or three short options only: more belong in a Select.", es: "La cifra mostrada es la de la opción que empieza seleccionada; quien lo usa la cambia cuando cambia la elección. Solo dos o tres opciones cortas: más van en un Select." }],
  build: ({ title, subtitle, label, selected, options, figure, caption }) =>
    surface([
      titleBlock(title, subtitle),
      { contract: "segmented", signature: "Segmented", options: { value: selected, label }, slots: { items: options.map((option) => ({ options: { value: option.value }, slots: { label: option.label } })) } },
      stack([text(figure, { size: "lg", weight: "emphasis" }), text(caption, { size: "sm", tone: "secondary" })], { gap: "xs" }),
    ]),
});

export const viewSwitcher: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "billing-period-switch",
      intent: "actions/buttons/view-switch",
      title: { en: "Billing period", es: "Período de facturación" },
      purpose: { en: "Switch between two or three views of the same thing without leaving the card.", es: "Cambiar entre dos o tres vistas de lo mismo sin salir de la card." },
      content: {
        title: { en: "Team plan", es: "Plan Equipo" },
        subtitle: { en: "Pick how you pay", es: "Elige cómo pagas" },
        label: { en: "Billing period", es: "Período de facturación" },
        selected: "yearly",
        options: [{ value: "monthly", label: { en: "Monthly", es: "Mensual" } }, { value: "yearly", label: { en: "Yearly", es: "Anual" } }],
        figure: { en: "$19 per person per month", es: "19 US$ por persona al mes" },
        caption: { en: "Billed yearly. Save 20% against paying monthly.", es: "Se factura al año. Ahorras un 20 % frente al pago mensual." },
      },
    }),
  ],
};
