import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  label: string;
  dropzoneLabel: string;
  triggerLabel: string;
  accept: string;
  multiple: boolean;
}

const { pattern, use } = definePattern<Content>({
  id: "attach-files",
  subject: "form",
  scale: "component",
  title: { en: "Attach files", es: "Adjuntar archivos" },
  layout: { en: "A FileUpload with its name, a drop area saying where to drop, and a button for choosing.", es: "Un FileUpload con su nombre, una zona que dice dónde soltar y un botón para elegir." },
  fields: {
    label: { en: "What is being attached.", es: "Qué se adjunta." },
    dropzoneLabel: { en: "The drop area's words.", es: "Las palabras de la zona de soltar." },
    triggerLabel: { en: "The button, as a verb.", es: "El botón, como verbo." },
    accept: { en: "The file types allowed, by extension.", es: "Los tipos de archivo permitidos, por extensión." },
    multiple: { en: "Whether more than one file is accepted.", es: "Si se acepta más de un archivo." },
  },
  notes: [
    { en: "Dropping is a shortcut, never the only way: the button does the same and works with a keyboard.", es: "Soltar es un atajo, nunca la única vía: el botón hace lo mismo y funciona con teclado." },
    { en: "Say what is accepted in the copy near it, not only in `accept`: a rejected file is the worst moment to learn the rule.", es: "Di qué se acepta en el texto cercano, no solo en `accept`: un archivo rechazado es el peor momento para enterarse de la regla." },
  ],
  build: ({ label, dropzoneLabel, triggerLabel, accept, multiple }) => ({
    contract: "file-upload",
    signature: "FileUpload",
    options: { name: "attachments", multiple, accept },
    slots: { label, dropzoneLabel, triggerLabel },
  }),
});

export const attachFiles: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "attach-supporting-documents",
      intent: "input/media/file-attach",
      title: { en: "Supporting documents", es: "Documentos de respaldo" },
      purpose: { en: "Let someone add several documents to a request, by dropping or choosing them.", es: "Dejar que alguien agregue varios documentos a una solicitud, soltándolos o eligiéndolos." },
      content: { label: { en: "Supporting documents", es: "Documentos de respaldo" }, dropzoneLabel: { en: "Drop the files here", es: "Arrastra los archivos aquí" }, triggerLabel: { en: "Choose files", es: "Elegir archivos" }, accept: ".pdf,.docx", multiple: true },
    }),
  ],
};
