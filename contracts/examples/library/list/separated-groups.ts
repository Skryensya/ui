import { definePattern, type PatternModule } from "../../model/types.js";
import { surface, titleBlock } from "../kit.js";
import type { UsageTree } from "@skryensya/core/usage-tree";

interface Content {
  title: string;
  groups: { label: string; body: string }[];
}

const { pattern, use } = definePattern<Content>({
  id: "separated-groups",
  subject: "list",
  scale: "composition",
  title: { en: "Groups under labelled separators", es: "Grupos bajo separadores con nombre" },
  layout: { en: "A card with a title and then, for each group, a separator that carries the group's name followed by the body of another use.", es: "Una card con un título y, por cada grupo, un separador que lleva el nombre del grupo seguido del cuerpo de otro uso." },
  fields: { title: { en: "What the card is.", es: "Qué es la card." }, groups: { en: "Each group: its name and the id of the use it holds.", es: "Cada grupo: su nombre y el id del uso que contiene." } },
  notes: [{ en: "The LabelledSeparator is the one separator allowed to carry a word, so a group's name is part of the divider and not a heading floating above it.", es: "El LabelledSeparator es el único separador que puede llevar una palabra, así que el nombre del grupo es parte del divisor y no un título flotando encima." }],
  build: ({ title, groups }, ctx) =>
    surface([titleBlock(title), ...groups.flatMap((group): UsageTree[] => [{ contract: "separator", signature: "LabelledSeparator", options: { spacing: "none" }, children: group.label }, ctx.render(group.body)])]),
});

export const separatedGroups: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "tasks-board", intent: "collaboration/work/task-board", title: { en: "Task board", es: "Tablero de tareas" }, purpose: { en: "Tasks grouped by when they are due.", es: "Tareas agrupadas por cuándo vencen." }, content: { title: { en: "My tasks", es: "Mis tareas" }, groups: [{ label: { en: "Today", es: "Hoy" }, body: "tasks-today" }, { label: { en: "This week", es: "Esta semana" }, body: "tasks-week" }] } }),
  ],
};
