import { definePattern, type PatternModule } from "../../model/types.js";
import { inline, text } from "../kit.js";

interface Content {
  value: string;
  label: string;
  copiedLabel: string;
  errorLabel: string;
}

const { pattern, use } = definePattern<Content>({
  id: "copy-value",
  subject: "action",
  scale: "fragment",
  title: { en: "Copy a value", es: "Copiar un valor" },
  layout: { en: "The value in plain text with a Clipboard copy button beside it, ghost and small.", es: "El valor en texto simple con un botón de copiar de Clipboard al lado, ghost y pequeño." },
  fields: {
    value: { en: "What is shown and what lands on the clipboard.", es: "Lo que se muestra y lo que queda en el portapapeles." },
    label: { en: "The button's name, as a verb that says what is copied.", es: "El nombre del botón, como verbo que dice qué se copia." },
    copiedLabel: { en: "What the button says after it worked.", es: "Lo que dice el botón después de funcionar." },
    errorLabel: { en: "What it says when the browser refuses.", es: "Lo que dice cuando el navegador lo rechaza." },
  },
  notes: [
    { en: "The button names what it copies (`Copy command`, not `Copy`): two of them on one page would otherwise be indistinguishable to a screen reader.", es: "El botón nombra lo que copia (`Copiar comando`, no `Copiar`): dos en una página serían indistinguibles para un lector de pantalla." },
    { en: "The failure has words of its own: clipboard access can be denied, and a silent button looks broken.", es: "El fallo tiene palabras propias: el acceso al portapapeles puede negarse, y un botón callado parece roto." },
  ],
  build: ({ value, label, copiedLabel, errorLabel }) =>
    inline(
      [
        text(value, { size: "sm" }),
        { contract: "clipboard", signature: "CopyButton", options: { value, label, copiedLabel, errorLabel, size: "sm", variant: "ghost" } },
      ],
      { gap: "sm", inlineAlign: "center" },
    ),
});

export const copyValue: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "copy-install-command",
      intent: "actions/buttons/copy-value",
      title: { en: "Install command", es: "Comando de instalación" },
      purpose: { en: "Let a reader take a command from the docs without selecting it by hand.", es: "Dejar que quien lee se lleve un comando de la documentación sin seleccionarlo a mano." },
      content: { value: "pnpm add @skryensya/core", label: { en: "Copy command", es: "Copiar comando" }, copiedLabel: { en: "Copied", es: "Copiado" }, errorLabel: { en: "Could not copy", es: "No se pudo copiar" } },
    }),
  ],
};
