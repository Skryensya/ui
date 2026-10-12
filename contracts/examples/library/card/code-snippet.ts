import { definePattern, type PatternModule } from "../../model/types.js";
import { stack, text } from "../kit.js";

interface Content {
  intro: string;
  file: string;
  code: string;
}

const { pattern, use } = definePattern<Content>({
  id: "code-snippet",
  subject: "card",
  scale: "fragment",
  title: { en: "Code snippet", es: "Fragmento de código" },
  layout: { en: "A CodePreview: the file's name on a bar, then the code in a fixed-width box.", es: "Un CodePreview: el nombre del archivo en una barra y luego el código en una caja de ancho fijo." },
  fields: { intro: { en: "One line before the code that says what to do with it.", es: "Una línea antes del código que dice qué hacer con él." }, file: { en: "The file the code belongs to.", es: "El archivo al que pertenece el código." }, code: { en: "The code itself, as it should be copied.", es: "El código en sí, como debe copiarse." } },
  notes: [
    { en: "The name of the file is part of the example: code with no place to put it is half an answer.", es: "El nombre del archivo es parte del ejemplo: código sin lugar donde ponerlo es media respuesta." },
    { en: "Keep it to the lines that matter; past about twenty, collapse it behind a `collapsible` preview so the page is not a wall of code.", es: "Déjalo en las líneas que importan; pasadas unas veinte, pliégalo tras un preview `collapsible` para que la página no sea un muro de código." },
  ],
  build: ({ intro, file, code }) => stack([text(intro, { size: "sm" }), { contract: "code-preview", signature: "CodePreview", slots: { label: file, children: code } }], { gap: "sm" }),
});

export const codeSnippet: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "snippet-config", intent: "content/code/code-sample", title: { en: "A configuration file", es: "Un archivo de configuración" }, purpose: { en: "Show the exact lines to put in a file, with the file's name above them.", es: "Mostrar las líneas exactas que van en un archivo, con el nombre del archivo encima." }, content: { intro: { en: "Set the port in your Vite configuration:", es: "Fija el puerto en tu configuración de Vite:" }, file: "vite.config.ts", code: "import { defineConfig } from \"vite\";\n\nexport default defineConfig({\n  server: { port: 4173 },\n});" } }),
  ],
};
