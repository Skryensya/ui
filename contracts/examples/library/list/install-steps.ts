import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  steps: { title: string; body: string }[];
}

const { pattern, use } = definePattern<Content>({
  id: "install-steps",
  subject: "list",
  scale: "component",
  title: { en: "Instructions in order", es: "Instrucciones en orden" },
  layout: { en: "A Procedure: numbered steps joined by a line, each a short title over the thing to do.", es: "Un Procedure: pasos numerados unidos por una línea, cada uno un título corto sobre lo que hay que hacer." },
  fields: { steps: { en: "The steps in order: a title, and what to do.", es: "Los pasos en orden: un título y qué hacer." } },
  notes: [
    { en: "The numbers and the line say order, never progress: no step is done or current. A flow where the reader moves through stages is Steps.", es: "Los números y la línea dicen orden, nunca avance: ningún paso está hecho ni es el actual. Un flujo donde quien lee avanza por etapas es Steps." },
    { en: "Each step is one action, in the imperative; a step with an `and` in it is two.", es: "Cada paso es una acción, en imperativo; un paso con una `y` dentro son dos." },
  ],
  build: ({ steps }) => ({ contract: "procedure", signature: "Procedure", children: steps.map((step) => ({ contract: "procedure", signature: "ProcedureStep", slots: { title: step.title }, children: step.body })) }),
});

export const installSteps: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "procedure-install", intent: "content/documentation/instructions", title: { en: "Installing a library", es: "Instalar una librería" }, purpose: { en: "Tell someone what to do, one thing at a time, in the order it has to happen.", es: "Decir a alguien qué hacer, una cosa a la vez, en el orden en que tiene que pasar." }, content: { steps: [{ title: { en: "Install", es: "Instalar" }, body: "pnpm add @skryensya/core" }, { title: { en: "Import the tokens", es: "Importar los tokens" }, body: { en: "Once, in the app's entry file.", es: "Una vez, en el archivo de entrada de la app." } }, { title: { en: "Use a component", es: "Usar un componente" }, body: { en: "Import the sheet and write the markup.", es: "Importa la hoja y escribe el marcado." } }] } }),
  ],
};
