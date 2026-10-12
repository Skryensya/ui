import type { ItemInput } from "@skryensya/core/usage-tree";
import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  label: string;
  placeholder: string;
  removeLabel: string;
  tags: string[];
}

const { pattern, use } = definePattern<Content>({
  id: "topic-tags",
  subject: "form",
  scale: "component",
  title: { en: "Tags field", es: "Campo de etiquetas" },
  layout: { en: "A TagsInput: the tags already chosen as removable chips, and the field where the next one is typed.", es: "Un TagsInput: las etiquetas ya elegidas como chips que se quitan, y el campo donde se escribe la siguiente." },
  fields: { label: { en: "What the tags are.", es: "Qué son las etiquetas." }, placeholder: { en: "An invitation to type the next one.", es: "Una invitación a escribir la siguiente." }, removeLabel: { en: "The word each chip's remove button starts with.", es: "La palabra con la que empieza el botón de quitar de cada chip." }, tags: { en: "The tags that are already there.", es: "Las etiquetas que ya están." } },
  notes: [
    { en: "Each chip's remove button names its tag (`Remove react`): a row of buttons that all say `Remove` cannot be told apart.", es: "El botón de quitar de cada chip nombra su etiqueta (`Quitar react`): una fila de botones que dicen `Quitar` no se distingue." },
    { en: "Use it where the set is open and the reader supplies the words; a closed set of options is a Listbox or a group of checkboxes.", es: "Úsalo donde el conjunto es abierto y quien lee pone las palabras; un conjunto cerrado de opciones es un Listbox o un grupo de casillas." },
  ],
  build: ({ label, placeholder, removeLabel, tags }, ctx) => ({
    contract: "tags-input",
    signature: "TagsInput",
    options: { label, placeholder, removeLabel, name: `${ctx.ns}-tags` },
    slots: { items: tags.map((tag): ItemInput => ({ slots: { label: tag } })) },
  }),
});

export const topicTags: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "tags-article-topics", intent: "input/choice/free-tags", title: { en: "Article topics", es: "Temas de un artículo" }, purpose: { en: "Let an author tag a post with whatever words fit, and take any of them back.", es: "Dejar que quien escribe etiquete una publicación con las palabras que quiera, y quitar cualquiera." }, content: { label: { en: "Topics", es: "Temas" }, placeholder: { en: "Add a topic", es: "Agrega un tema" }, removeLabel: { en: "Remove", es: "Quitar" }, tags: ["react", "design systems", "accessibility"] } }),
  ],
};
