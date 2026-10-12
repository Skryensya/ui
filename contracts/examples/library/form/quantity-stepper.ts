import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  label: string;
  min: number;
  max: number;
  step: number;
}

const { pattern, use } = definePattern<Content>({
  id: "quantity-stepper",
  subject: "form",
  scale: "fragment",
  title: { en: "Quantity field", es: "Campo de cantidad" },
  layout: { en: "A NumberField with a visible label, stepper buttons and the limits it will accept.", es: "Un NumberField con etiqueta visible, botones de paso y los límites que acepta." },
  fields: { label: { en: "What is being counted.", es: "Qué se cuenta." }, min: { en: "The least it accepts.", es: "Lo mínimo que acepta." }, max: { en: "The most it accepts.", es: "Lo máximo que acepta." }, step: { en: "How much a press changes it.", es: "Cuánto cambia con una pulsación." } },
  notes: [
    { en: "A number the reader can also type: the steppers are for small moves, the keyboard for a known value, and both respect the limits.", es: "Un número que quien lee también puede escribir: los pasos son para movimientos pequeños, el teclado para un valor conocido, y ambos respetan los límites." },
    { en: "Use it for a quantity with a real range (nights, seats); a value judged by feel is a slider.", es: "Úsalo para una cantidad con un rango real (noches, asientos); un valor juzgado a ojo es un deslizador." },
  ],
  build: ({ label, min, max, step }, ctx) => ({ contract: "number-field", signature: "NumberField", options: { name: `${ctx.ns}-quantity`, min, max, step }, slots: { label } }),
});

export const quantityStepper: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "quantity-nights", intent: "input/fields/quantity", title: { en: "Nights", es: "Noches" }, purpose: { en: "Ask for a small whole number inside a range, with steppers and a typed value.", es: "Pedir un número entero pequeño dentro de un rango, con pasos y valor escrito." }, content: { label: { en: "Nights", es: "Noches" }, min: 1, max: 14, step: 1 } }),
  ],
};
