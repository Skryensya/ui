import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  label: string;
  value: number;
}

const { pattern, use } = definePattern<Content>({
  id: "level-control",
  subject: "form",
  scale: "fragment",
  title: { en: "Level control", es: "Control de nivel" },
  layout: { en: "A Slider named for what it adjusts, starting at a value inside its range.", es: "Un Slider con el nombre de lo que ajusta, que empieza en un valor dentro de su rango." },
  fields: { label: { en: "What the slider adjusts: its accessible name.", es: "Qué ajusta el deslizador: su nombre accesible." }, value: { en: "Where it starts, from 0 to 100.", es: "Dónde empieza, de 0 a 100." } },
  notes: [
    { en: "A slider is for a value adjusted by feel (volume, brightness) where the exact number does not matter; when it does, use a number field.", es: "Un deslizador es para un valor ajustado a ojo (volumen, brillo) donde el número exacto no importa; cuando importa, usa un campo numérico." },
    { en: "The name is required: a slider that announces only a number tells nobody what it changes.", es: "El nombre es obligatorio: un deslizador que solo anuncia un número no dice qué cambia." },
  ],
  build: ({ label, value }, ctx) => ({ contract: "slider", signature: "Slider", options: { value, name: `${ctx.ns}-level` }, attrs: { "aria-label": label } }),
});

export const levelControl: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "level-volume", intent: "input/fields/level", title: { en: "Volume", es: "Volumen" }, purpose: { en: "Let someone set how loud something is without typing a number.", es: "Dejar que alguien ajuste qué tan fuerte suena algo sin escribir un número." }, content: { label: { en: "Volume", es: "Volumen" }, value: 60 } }),
  ],
};
