import { definePattern, type PatternModule } from "../../model/types.js";
import { icon, inline, stack, text } from "../kit.js";
import type { UsageTree } from "@skryensya/core/usage-tree";

interface Content {
  rows: { icon: string; title: string; body: string }[];
}

const { pattern, use } = definePattern<Content>({
  id: "icon-link-tiles",
  subject: "card",
  scale: "component",
  title: { en: "Icon link tiles", es: "Tiles de enlace con ícono" },
  layout: { en: "A stack of tiles, each one link: a leading icon, a title over one line of what it changes, and a chevron at the end.", es: "Una pila de tiles, cada uno un enlace: un ícono al inicio, un título sobre una línea de lo que cambia, y un chevron al final." },
  fields: { rows: { en: "Each destination: icon, title and what it changes.", es: "Cada destino: ícono, título y qué cambia." } },
  notes: [{ en: "Each row IS the link (a TileLink), so there is one focus stop per row and no inner anchor; the chevron is decoration.", es: "Cada fila ES el enlace (un TileLink), así que hay un foco por fila y ningún ancla interna; el chevron es decoración." }],
  build: ({ rows }) =>
    stack(
      rows.map(
        (row): UsageTree => ({
          contract: "tile",
          signature: "TileLink",
          options: { href: "#", padding: "md" },
          children: [
            inline(
              [inline([icon(row.icon), stack([text(row.title, { weight: "label" }), text(row.body, { size: "sm", tone: "secondary" })], { gap: "none" })], { gap: "md", inlineAlign: "start", wrap: false }), icon("chevron-right", "sm")],
              { gap: "md", inlineAlign: "center", justify: "between", wrap: false },
            ),
          ],
        }),
      ),
      { gap: "sm" },
    ),
});

export const iconLinkTiles: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "shortcuts-settings",
      intent: "navigation/destinations/setting-shortcuts",
      title: { en: "Shortcuts", es: "Atajos" },
      purpose: { en: "Rows that lead to settings, each with what it changes.", es: "Filas que llevan a ajustes, cada una con lo que cambia." },
      content: {
        rows: [
          { icon: "settings", title: { en: "Change transfer limit", es: "Cambiar el límite de transferencia" }, body: { en: "Adjust how much you can send from your balance.", es: "Ajusta cuánto puedes enviar desde tu saldo." } },
          { icon: "calendar", title: { en: "Scheduled transfers", es: "Transferencias programadas" }, body: { en: "Review and edit the payments that repeat.", es: "Revisa y edita los pagos que se repiten." } },
        ],
      },
    }),
  ],
};
