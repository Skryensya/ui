import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  label: string;
  value: string;
}

const { pattern, use } = definePattern<Content>({
  id: "color-field",
  subject: "form",
  scale: "fragment",
  title: { en: "Color field", es: "Campo de color" },
  layout: { en: "A ColorPicker: a swatch and a hex field, with a visible label, starting on a colour.", es: "Un ColorPicker: una muestra y un campo hexadecimal, con etiqueta visible, que empieza en un color." },
  fields: { label: { en: "What the colour is for.", es: "Para qué es el color." }, value: { en: "The colour it starts on, as a hex code.", es: "El color en el que empieza, como código hexadecimal." } },
  notes: [
    { en: "The hex field is the accessible way in: the swatch alone asks for sight and a pointer, the typed value works for everyone and can be pasted from a brand guide.", es: "El campo hexadecimal es la vía accesible: la muestra sola pide vista y puntero, el valor escrito sirve a todos y se puede pegar de una guía de marca." },
    { en: "Use it where the reader picks any colour; a short, fixed palette is a set of named choices.", es: "Úsalo donde quien lee elige cualquier color; una paleta corta y fija es un conjunto de opciones con nombre." },
  ],
  build: ({ label, value }, ctx) => ({ contract: "color-picker", signature: "ColorPicker", options: { name: `${ctx.ns}-color`, value }, slots: { label } }),
});

export const colorField: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "color-brand", intent: "input/fields/color", title: { en: "Brand colour", es: "Color de marca" }, purpose: { en: "Let someone set the colour a product uses for its accents.", es: "Dejar que alguien fije el color que un producto usa para sus acentos." }, content: { label: { en: "Brand colour", es: "Color de marca" }, value: "#3366ff" } }),
  ],
};
