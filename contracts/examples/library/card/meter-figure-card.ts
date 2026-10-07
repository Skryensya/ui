import { definePattern, type PatternModule } from "../../model/types.js";
import { inline, navAction, surface, text } from "../kit.js";

interface Content {
  label: string;
  /** The figure, formatted: "68 GB". */
  value: string;
  meterLabel: string;
  used: number;
  limit: number;
  /** What the meter says in words: "68 of 100 GB". */
  valueText: string;
  tone: "accent" | "success" | "warning" | "danger";
  note: string;
  actionLabel: string;
}

const { pattern, use } = definePattern<Content>({
  id: "meter-figure-card",
  subject: "card",
  scale: "component",
  title: { en: "Figure with a meter", es: "Cifra con medidor" },
  layout: { en: "A labelled figure, a Meter under it, and a quiet note beside a ghost action on the last row.", es: "Una cifra con etiqueta, un Meter debajo, y una nota discreta junto a una acción fantasma en la última fila." },
  fields: { label: { en: "What the figure measures.", es: "Qué mide la cifra." }, value: { en: "The figure, formatted.", es: "La cifra, con formato." }, meterLabel: { en: "The meter's accessible name.", es: "El nombre accesible del medidor." }, used: { en: "How much is used.", es: "Cuánto se usó." }, limit: { en: "The limit.", es: "El límite." }, valueText: { en: "The reading in words.", es: "La lectura en palabras." }, tone: { en: "How worried to look.", es: "Cuánta preocupación mostrar." }, note: { en: "A fact about the limit: when it renews.", es: "Un dato del límite: cuándo se renueva." }, actionLabel: { en: "The way to raise the limit.", es: "La forma de subir el límite." } },
  notes: [{ en: "A Meter, not a Progress: a quota is a reading on a scale that can be near a limit, not a task heading to done.", es: "Un Meter y no un Progress: una cuota es una lectura en una escala que puede estar cerca de un límite, no una tarea rumbo a terminar." }],
  build: ({ label, value, meterLabel, used, limit, valueText, tone, note, actionLabel }) =>
    surface([
      { contract: "stat", signature: "Stat", slots: { label, value } },
      { contract: "meter", signature: "Meter", options: { label: meterLabel, value: used, max: limit, valueText, tone } },
      inline([text(note, { size: "caption", tone: "tertiary" }), navAction(actionLabel, "#", { variant: "ghost", size: "sm" })], { gap: "sm", justify: "between", inlineAlign: "center" }),
    ]),
});

export const meterFigureCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "quota-storage",
      intent: "metrics/usage/quota",
      title: { en: "Quota", es: "Cuota" },
      purpose: { en: "How much of a limit is already used and what to do near it.", es: "Cuánto de un límite ya se usó y qué hacer al acercarse." },
      content: { label: { en: "Storage used", es: "Almacenamiento usado" }, value: "68 GB", meterLabel: { en: "Storage", es: "Almacenamiento" }, used: 68, limit: 100, valueText: { en: "68 of 100 GB", es: "68 de 100 GB" }, tone: "warning", note: { en: "Renews on November 1", es: "Se renueva el 1 de noviembre" }, actionLabel: { en: "Upgrade plan", es: "Ampliar plan" } },
    }),
  ],
};
