import { definePattern, type PatternModule } from "../../model/types.js";
import { heading, stack, surface, text } from "../kit.js";

interface Content {
  value: string;
  /** The code's accessible name: what scanning it does. */
  codeLabel: string;
  title: string;
  body: string;
}

const { pattern, use } = definePattern<Content>({
  id: "centered-code-card",
  subject: "card",
  scale: "component",
  title: { en: "Centred code card", es: "Card de código centrada" },
  layout: { en: "A QR code, then a title and one instruction under it, centred in one column.", es: "Un código QR y, debajo, un título y una instrucción, centrados en una columna." },
  fields: { value: { en: "What the code encodes.", es: "Lo que codifica el código." }, codeLabel: { en: "The code's accessible name.", es: "El nombre accesible del código." }, title: { en: "The instruction as a heading.", es: "La instrucción como título." }, body: { en: "The steps, in a sentence.", es: "Los pasos, en una frase." } },
  notes: [{ en: "A code is an image to a screen reader, so its name says what scanning achieves; a person who cannot scan needs the value to be reachable some other way.", es: "Un código es una imagen para un lector de pantalla, así que su nombre dice qué logra escanearlo; quien no puede escanear necesita llegar al valor por otro lado." }],
  build: ({ value, codeLabel, title, body }) =>
    surface([stack([{ contract: "qr-code", signature: "QRCode", options: { value, label: codeLabel, qrSize: "md" } }, stack([heading(title, "h5"), text(body, { size: "sm", tone: "secondary" })], { gap: "xs", align: "center" })], { gap: "md", align: "center" })]),
});

export const centeredCodeCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "connect-mobile-app",
      intent: "identity/devices/pair-device",
      title: { en: "Connect a device", es: "Conectar dispositivo" },
      purpose: { en: "A code to scan and the instruction to scan it.", es: "Un código para escanear y la instrucción para hacerlo." },
      content: { value: "https://example.com/link-device", codeLabel: { en: "QR code to link the mobile app", es: "Código QR para vincular la app móvil" }, title: { en: "Scan to connect your phone", es: "Escanea para conectar tu teléfono" }, body: { en: "Open the app on your phone and scan this code to link it.", es: "Abre la app en tu teléfono y escanea este código para vincularlo." } },
    }),
  ],
};
