import { definePattern, type PatternModule } from "../../model/types.js";
import { action, grid, inline, surface, titleBlock } from "../kit.js";
import { renderField, type FieldSpec } from "./fields.js";

interface Content {
  title: string;
  body: string;
  /** The two short fields on the first row. */
  who: FieldSpec[];
  /** The topic select. */
  topic: Extract<FieldSpec, { kind: "select" }>;
  message: Extract<FieldSpec, { kind: "textarea" }>;
  submit: string;
}

const { pattern, use } = definePattern<Content>({
  id: "message-form-card",
  subject: "form",
  scale: "component",
  title: { en: "Message form card", es: "Card de formulario de mensaje" },
  layout: { en: "A title block, two short fields side by side (one lane on a phone), a topic select, a message area and a right-aligned submit.", es: "Un bloque de título, dos campos cortos lado a lado (un carril en el teléfono), un select de tema, un área de mensaje y un envío alineado a la derecha." },
  fields: { title: { en: "What writing in does.", es: "Qué hace escribir." }, body: { en: "When to expect an answer.", es: "Cuándo esperar respuesta." }, who: { en: "Who is writing: name and email.", es: "Quién escribe: nombre y correo." }, topic: { en: "The topic, which routes the message.", es: "El tema, que enruta el mensaje." }, message: { en: "The message itself.", es: "El mensaje." }, submit: { en: "Send.", es: "Enviar." } },
  build: ({ title, body, who, topic, message, submit }, ctx) =>
    surface([titleBlock(title, body), grid(who.map((field) => renderField(field, ctx.ns)), { columns: "2", gap: "md", responsive: true }), renderField(topic, ctx.ns), renderField(message, ctx.ns), inline([action(submit, { tone: "accent", type: "submit" })], { justify: "end" })]),
});

export const messageFormCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "contact-support",
      intent: "input/capture/contact",
      title: { en: "Contact", es: "Contacto" },
      purpose: { en: "A message with its topic, so it reaches the right person.", es: "Un mensaje con su tema, para que llegue a quien corresponde." },
      content: {
        title: { en: "Write to us", es: "Escríbenos" },
        body: { en: "We answer within one working day.", es: "Te respondemos en un día hábil." },
        who: [
          { kind: "text", name: "name", label: { en: "Full name", es: "Nombre completo" }, placeholder: { en: "Jane Doe", es: "Ana Pérez" }, required: true },
          { kind: "email", name: "email", label: { en: "Email", es: "Correo" }, placeholder: { en: "name@example.com", es: "nombre@ejemplo.com" }, required: true },
        ],
        topic: { kind: "select", name: "topic", label: { en: "Topic", es: "Tema" }, value: "support", options: [{ value: "sales", label: { en: "Sales", es: "Ventas" } }, { value: "support", label: { en: "Support", es: "Soporte" } }, { value: "billing", label: { en: "Billing", es: "Facturación" } }] },
        message: { kind: "textarea", name: "message", label: { en: "Message", es: "Mensaje" }, placeholder: { en: "Tell us how we can help", es: "Cuéntanos en qué te ayudamos" }, required: true },
        submit: { en: "Send message", es: "Enviar mensaje" },
      },
    }),
  ],
};
