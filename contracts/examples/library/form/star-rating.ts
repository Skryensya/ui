import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  label: string;
  value: number;
}

const { pattern, use } = definePattern<Content>({
  id: "star-rating",
  subject: "form",
  scale: "fragment",
  title: { en: "Rating", es: "Valoración" },
  layout: { en: "A Rating input: a row of marks the reader chooses among, starting on a value, with a visible name.", es: "Una entrada Rating: una fila de marcas entre las que se elige, que empieza en un valor, con nombre visible." },
  fields: { label: { en: "What is being rated: the group's name.", es: "Qué se valora: el nombre del grupo." }, value: { en: "The value it starts on.", es: "El valor en el que empieza." } },
  notes: [
    { en: "It is a set of radio buttons drawn as marks, so it works with the arrow keys and announces `3 of 5`; the picture is never the only cue.", es: "Es un conjunto de radios dibujados como marcas, así que funciona con las flechas y anuncia `3 de 5`; la imagen nunca es la única señal." },
    { en: "To show a rating that was already given (a product's average) use the read-only form, not the input.", es: "Para mostrar una valoración ya dada (el promedio de un producto) usa la forma de solo lectura, no la entrada." },
  ],
  build: ({ label, value }, ctx) => ({ contract: "rating", signature: "Rating", options: { label, name: `${ctx.ns}-score`, defaultValue: value } }),
});

export const starRating: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "rating-score", intent: "input/fields/rating", title: { en: "Your score", es: "Tu puntuación" }, purpose: { en: "Collect a quick opinion on a scale, from someone who has just used something.", es: "Recoger una opinión rápida en una escala, de alguien que acaba de usar algo." }, content: { label: { en: "Your score", es: "Tu puntuación" }, value: 3 } }),
  ],
};
