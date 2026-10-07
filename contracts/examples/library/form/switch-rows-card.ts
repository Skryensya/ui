import { definePattern, type PatternModule } from "../../model/types.js";
import { inline, stack, surface, text, titleBlock } from "../kit.js";
import type { UsageTree } from "@skryensya/core/usage-tree";

interface Content {
  title: string;
  body: string;
  rows: { title: string; effect: string; on?: boolean }[];
}

const { pattern, use } = definePattern<Content>({
  id: "switch-rows-card",
  subject: "form",
  scale: "component",
  title: { en: "Switch rows card", es: "Card de filas con interruptor" },
  layout: { en: "A title block, then divided rows: the setting and its effect on the start edge, the switch on the end.", es: "Un bloque de título y, debajo, filas con divisores: el ajuste y su efecto al inicio, el interruptor al final." },
  fields: { title: { en: "What the settings are.", es: "Qué son los ajustes." }, body: { en: "What they control.", es: "Qué controlan." }, rows: { en: "Each setting: its name, what turning it on does, and whether it starts on.", es: "Cada ajuste: su nombre, qué hace activarlo y si empieza activo." } },
  notes: [{ en: "The switch has no visible label of its own: it takes its name from the setting's text (`aria-labelledby`) and its description from the effect's (`aria-describedby`), so a screen reader hears both and the layout can put the words on the left.", es: "El interruptor no tiene etiqueta visible propia: toma su nombre del texto del ajuste (`aria-labelledby`) y su descripción del efecto (`aria-describedby`), así que un lector de pantalla oye ambos y el layout puede poner las palabras a la izquierda." }, { en: "Compare the tile version (description-switch-tile), where the whole card is the switch's label.", es: "Compara la versión en tile (description-switch-tile), donde toda la card es la etiqueta del interruptor." }],
  build: ({ title, body, rows }, ctx) =>
    surface([
      titleBlock(title, body),
      {
        contract: "list",
        signature: "List",
        options: { dividers: true },
        attrs: { "aria-label": title },
        children: rows.map(
          (row, index): UsageTree => ({
            contract: "list",
            signature: "ListItemPlain",
            children: inline(
              [
                stack([text(row.title, { weight: "label" }, { id: `${ctx.ns}-${index}-label` }), text(row.effect, { size: "sm", tone: "secondary" }, { id: `${ctx.ns}-${index}-hint` })], { gap: "none" }, { "data-sizing": "fill" }),
                { contract: "switch", signature: "Switch", options: { name: `${ctx.ns}-${index}`, defaultChecked: Boolean(row.on) }, attrs: { "aria-labelledby": `${ctx.ns}-${index}-label`, "aria-describedby": `${ctx.ns}-${index}-hint`, "data-sizing": "fit" } },
              ],
              { gap: "md", justify: "between", inlineAlign: "center", wrap: false },
            ),
          }),
        ),
      },
    ]),
});

export const switchRowsCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "preferences-notifications",
      intent: "input/preferences/notification-switches",
      title: { en: "Preferences", es: "Preferencias" },
      purpose: { en: "Options that apply at once, each with its effect.", es: "Opciones que se activan al momento, cada una con su efecto." },
      related: [{ id: "setting-weekly-summary", kind: "alternative", why: { en: "For one option, a single tile whose whole surface is the switch.", es: "Para una sola opción, un tile cuya superficie entera es el interruptor." } }],
      content: {
        title: { en: "Notifications", es: "Notificaciones" },
        body: { en: "Choose what we email you about.", es: "Elige qué te avisamos por correo." },
        rows: [
          { title: { en: "Comments", es: "Comentarios" }, effect: { en: "When someone replies to something of yours.", es: "Cuando alguien responde a algo tuyo." }, on: true },
          { title: { en: "Weekly summary", es: "Resumen semanal" }, effect: { en: "The team's activity, every Monday.", es: "La actividad del equipo, cada lunes." }, on: true },
          { title: { en: "Product news", es: "Novedades del producto" }, effect: { en: "New features, once a month.", es: "Funciones nuevas, una vez al mes." } },
        ],
      },
    }),
  ],
};
