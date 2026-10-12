import { definePattern, type PatternModule } from "../../model/types.js";
import { inline, text } from "../kit.js";

interface Content {
  before: string;
  keys: string[];
  after: string;
}

const { pattern, use } = definePattern<Content>({
  id: "shortcut-hint",
  subject: "action",
  scale: "fragment",
  title: { en: "Keyboard shortcut hint", es: "Pista de atajo de teclado" },
  layout: { en: "A line of text with one Kbd per key of the shortcut, between the words that say what it does.", es: "Una línea de texto con un Kbd por cada tecla del atajo, entre las palabras que dicen qué hace." },
  fields: { before: { en: "The words before the keys.", es: "Las palabras antes de las teclas." }, keys: { en: "The keys, one by one, in the order they are pressed.", es: "Las teclas, una por una, en el orden en que se pulsan." }, after: { en: "The words after the keys.", es: "Las palabras después de las teclas." } },
  notes: [
    { en: "One Kbd per key, never the whole chord in one: the keys are separate things, and the chord reads `K` then `Ctrl`, not `Ctrl+K` as one word.", es: "Un Kbd por tecla, nunca todo el acorde en uno: las teclas son cosas separadas, y el acorde se lee `K` y luego `Ctrl`, no `Ctrl+K` como una palabra." },
    { en: "Say what the shortcut does in words next to it: the keys alone are a code to decipher.", es: "Di en palabras qué hace el atajo junto a él: las teclas solas son un código por descifrar." },
  ],
  build: ({ before, keys, after }) =>
    inline([text(before, { size: "sm" }), ...keys.map((key) => ({ contract: "kbd", signature: "Kbd", children: key })), text(after, { size: "sm" })], { gap: "xs", inlineAlign: "center", wrap: true }),
});

export const shortcutHint: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "shortcut-search", intent: "actions/buttons/shortcut-hint", title: { en: "Open the search", es: "Abrir la búsqueda" }, purpose: { en: "Teach the keyboard way to do something the interface already offers.", es: "Enseñar la vía de teclado para algo que la interfaz ya ofrece." }, content: { before: { en: "Press", es: "Pulsa" }, keys: ["Ctrl", "K"], after: { en: "to search the docs", es: "para buscar en la documentación" } } }),
  ],
};
