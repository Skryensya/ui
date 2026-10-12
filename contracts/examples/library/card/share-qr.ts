import { definePattern, type PatternModule } from "../../model/types.js";
import { stack, text } from "../kit.js";

interface Content {
  title: string;
  hint: string;
  label: string;
  value: string;
}

const { pattern, use } = definePattern<Content>({
  id: "share-qr",
  subject: "card",
  scale: "fragment",
  title: { en: "Share with a code", es: "Compartir con un código" },
  layout: { en: "A QRCode of an address, named for what it opens, under a line that says what to do with it.", es: "Un QRCode de una dirección, con nombre por lo que abre, bajo una línea que dice qué hacer con él." },
  fields: { title: { en: "What the code is for.", es: "Para qué es el código." }, hint: { en: "What to do with it, in one line.", es: "Qué hacer con él, en una línea." }, label: { en: "The code's accessible name: where it leads.", es: "El nombre accesible del código: a dónde lleva." }, value: { en: "The address it encodes.", es: "La dirección que codifica." } },
  notes: [
    { en: "A code is for moving something from a screen to a phone; the same address is also shown or linked as text, because a code asks for a camera and a steady hand.", es: "Un código es para pasar algo de una pantalla a un teléfono; la misma dirección se muestra o enlaza también como texto, porque un código pide una cámara y pulso firme." },
    { en: "Name it by where it goes (`Open the site`), not `QR code`: that is what a screen reader should say.", es: "Nómbralo por a dónde va (`Abrir el sitio`), no `código QR`: eso es lo que debe decir un lector de pantalla." },
  ],
  build: ({ title, hint, label, value }) =>
    stack([text(title, { size: "sm", weight: "emphasis" }), { contract: "qr-code", signature: "QRCode", options: { value, label, level: "Q" } }, text(hint, { size: "caption", tone: "secondary" })], { gap: "sm" }),
});

export const shareQr: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "qr-open-on-phone", intent: "actions/buttons/share-code", title: { en: "Open on your phone", es: "Abrir en tu teléfono" }, purpose: { en: "Hand a link to a phone without anyone typing it.", es: "Pasar un enlace a un teléfono sin que nadie lo escriba." }, content: { title: { en: "Continue on your phone", es: "Continúa en tu teléfono" }, hint: { en: "Point the camera at the code.", es: "Apunta la cámara al código." }, label: { en: "Open the site", es: "Abrir el sitio" }, value: "https://ui.skryensya.dev" } }),
  ],
};
