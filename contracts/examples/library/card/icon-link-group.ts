import { definePattern, type PatternModule } from "../../model/types.js";
import { box, icon } from "../kit.js";
import type { UsageTree } from "@skryensya/core/usage-tree";

interface Content {
  label: string;
  links: { label: string; icon: string }[];
}

const { pattern, use } = definePattern<Content>({
  id: "icon-link-group",
  subject: "card",
  scale: "fragment",
  title: { en: "Icon link group", es: "Grupo de enlaces con ícono" },
  layout: { en: "A named group of links, each an icon and a label, on a small bordered surface.", es: "Un grupo con nombre de enlaces, cada uno un ícono y una etiqueta, en una superficie pequeña con borde." },
  fields: { label: { en: "The group's name: also its accessible name.", es: "El nombre del grupo: también su nombre accesible." }, links: { en: "Each destination: label and icon name.", es: "Cada destino: etiqueta y nombre del ícono." } },
  notes: [{ en: "A nav-list pattern, not a List: these are destinations, so they are links in a `nav` with one focus stop each.", es: "Es el patrón nav-list y no una List: son destinos, así que son enlaces dentro de un `nav` con un foco cada uno." }],
  build: ({ label, links }) =>
    box(
      [
        {
          contract: "nav-list",
          signature: "NavList",
          attrs: { "aria-label": label },
          children: [
            {
              contract: "nav-list",
              signature: "NavListGroup",
              slots: { label },
              children: links.map((link): UsageTree => ({ contract: "nav-list", signature: "NavListLink", options: { href: "#" }, slots: { icon: icon(link.icon, "sm") }, children: link.label })),
            },
          ],
        },
      ],
      { surface: "surface", border: "subtle", padding: "sm" },
    ),
});

export const iconLinkGroup: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "planning-links",
      intent: "navigation/destinations/link-group",
      title: { en: "Link group", es: "Grupo de enlaces" },
      purpose: { en: "Destinations of one area, each with its icon, under a group name.", es: "Destinos de una misma área, con su ícono y un nombre de grupo." },
      content: {
        label: { en: "Planning", es: "Planificación" },
        links: [
          { label: { en: "Documents", es: "Documentos" }, icon: "file" },
          { label: { en: "Budget", es: "Presupuesto" }, icon: "folder" },
          { label: { en: "Calendar", es: "Calendario" }, icon: "calendar" },
          { label: { en: "Settings", es: "Ajustes" }, icon: "settings" },
        ],
      },
    }),
  ],
};
