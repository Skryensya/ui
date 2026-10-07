import { definePattern, type PatternModule } from "../../model/types.js";
import { renderField } from "./fields.js";

interface Content {
  label: string;
  type: "text" | "email";
  placeholder: string;
  /** What is expected, under the label. */
  hint?: string;
  /** Why the value will not do and how to fix it. Replaces the hint's job once shown. */
  error?: string;
  required?: boolean;
}

const { pattern, use } = definePattern<Content>({
  id: "labelled-field",
  subject: "form",
  scale: "fragment",
  title: { en: "Labelled field", es: "Campo con etiqueta" },
  layout: { en: "A label, the control, and under it either a hint or an error.", es: "Una etiqueta, el control y, debajo, una ayuda o un error." },
  fields: { label: { en: "What the value is.", es: "Qué es el dato." }, type: { en: "text or email.", es: "text o email." }, placeholder: { en: "An example of the value, never the label.", es: "Un ejemplo del dato, nunca la etiqueta." }, hint: { en: "What is expected.", es: "Qué se espera." }, error: { en: "Why it will not do, and the fix.", es: "Por qué no sirve y cómo corregirlo." }, required: { en: "Marks the field as required.", es: "Marca el campo como obligatorio." } },
  notes: [{ en: "The error says how to fix it, not only that it failed: 'Enter an email with an @, like name@example.com' beats 'Invalid email'.", es: "El error dice cómo corregirlo y no solo que falló: 'Escribe un correo con @, por ejemplo nombre@ejemplo.com' vale más que 'Correo inválido'." }],
  build: ({ label, type, placeholder, hint, error, required }, ctx) => renderField({ kind: type, name: "value", label, placeholder, hint, error, required }, ctx.ns),
});

const email = { label: { en: "Email", es: "Correo" }, type: "email" as const, placeholder: { en: "name@example.com", es: "nombre@ejemplo.com" }, required: true };

export const labelledField: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "field-email-hint", intent: "input/fields/field-hint", title: { en: "Field with hint", es: "Campo con ayuda" }, purpose: { en: "One piece of data with its label and a line on what is expected.", es: "Un dato con su etiqueta y una línea que explica qué se espera." }, related: [{ id: "field-email-error", kind: "alternative", why: { en: "The same field after a bad value: swap the hint for the error.", es: "El mismo campo tras un dato inválido: cambia la ayuda por el error." } }], content: { ...email, hint: { en: "We use it to tell you about changes to your account.", es: "Lo usamos para avisarte de cambios en tu cuenta." } } }),
    use({ id: "field-email-error", intent: "input/fields/field-error", title: { en: "Field with error", es: "Campo con error" }, purpose: { en: "The same field when the value will not do, saying how to fix it.", es: "El mismo campo cuando el dato no sirve, diciendo cómo corregirlo." }, content: { ...email, error: { en: "Enter an email with an @, like name@example.com.", es: "Escribe un correo con @, por ejemplo nombre@ejemplo.com." } } }),
  ],
};
