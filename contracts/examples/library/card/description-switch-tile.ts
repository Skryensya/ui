import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  title: string;
  body: string;
  checked: boolean;
}

const { pattern, use } = definePattern<Content>({
  id: "description-switch-tile",
  subject: "card",
  scale: "component",
  title: { en: "Switch tile", es: "Tile con interruptor" },
  layout: { en: "One tile whose whole surface is the hit area of a switch: a title and a description on the start edge, the switch on the end.", es: "Un tile cuya superficie entera es la zona de un interruptor: título y descripción al inicio, el interruptor al final." },
  fields: { title: { en: "The setting.", es: "El ajuste." }, body: { en: "What turning it on does.", es: "Qué hace activarlo." }, checked: { en: "Whether it starts on.", es: "Si empieza activo." } },
  notes: [{ en: "A TileSwitch, not a Box with a Switch: the tile is the label, so the title and the description are part of the switch's accessible name and the whole card toggles it.", es: "Un TileSwitch y no un Box con un Switch: el tile es la etiqueta, así que título y descripción forman parte del nombre accesible del interruptor y toda la card lo activa." }],
  build: ({ title, body, checked }, ctx) => ({
    contract: "tile",
    signature: "TileSwitch",
    /* The form name is the use's own id: unique in a page that shows this tile twice. */
    options: { name: ctx.ns, defaultChecked: checked, padding: "lg" },
    children: { contract: "tile", signature: "TileContent", slots: { title, description: body } },
  }),
});

export const descriptionSwitchTile: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "setting-weekly-summary",
      intent: "input/preferences/toggle-setting",
      title: { en: "Setting", es: "Ajuste" },
      purpose: { en: "An option that turns on or off, with the whole card as the hit area.", es: "Una opción que se activa o desactiva, con toda la card como zona de clic." },
      content: { title: { en: "Weekly email summary", es: "Resumen semanal por correo" }, body: { en: "One email every Monday with your team's activity.", es: "Un correo cada lunes con la actividad de tu equipo." }, checked: true },
    }),
  ],
};
