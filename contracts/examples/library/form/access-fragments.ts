import { definePattern, type PatternModule } from "../../model/types.js";
import { inline } from "../kit.js";

/* Two one-line fragments of an access flow, kept in one module: each is a pattern of its own with its own use. */

interface RememberContent {
  remember: string;
  forgot: string;
}

const row = definePattern<RememberContent>({
  id: "remember-recover-row",
  subject: "form",
  scale: "fragment",
  title: { en: "Remember and recover row", es: "Fila de recordar y recuperar" },
  layout: { en: "A checkbox at the start and a link at the end of one row.", es: "Un checkbox al inicio y un enlace al final de una fila." },
  fields: { remember: { en: "The checkbox's label.", es: "La etiqueta del checkbox." }, forgot: { en: "The recovery link's text.", es: "El texto del enlace de recuperación." } },
  notes: [{ en: "The recovery path is a Link, not a button: it goes somewhere.", es: "La recuperación es un Link y no un botón: va a otro lado." }],
  build: ({ remember, forgot }, ctx) => inline([{ contract: "checkbox", signature: "Checkbox", options: { name: `${ctx.ns}-remember` }, children: remember }, { contract: "typography", signature: "Link", options: { href: "#" }, children: forgot }], { gap: "sm", justify: "between", inlineAlign: "center" }),
});

interface DividerContent {
  label: string;
}

const divider = definePattern<DividerContent>({
  id: "labelled-divider",
  subject: "form",
  scale: "fragment",
  title: { en: "Labelled divider", es: "Divisor con palabra" },
  layout: { en: "A rule with one word in the middle.", es: "Una línea con una palabra en el medio." },
  fields: { label: { en: "The word: 'or'.", es: "La palabra: 'o'." } },
  notes: [{ en: "The one separator allowed to carry a word.", es: "El único separador que puede llevar una palabra." }],
  build: ({ label }) => ({ contract: "separator", signature: "LabelledSeparator", options: { spacing: "none" }, children: label }),
});


export const rememberRecoverRow: PatternModule<RememberContent> = {
  pattern: row.pattern,
  uses: [row.use({ id: "remember-forgot", intent: "identity/access/remember-recover", title: { en: "Remember me", es: "Recordarme" }, purpose: { en: "An option and a recovery link on one row.", es: "Una opción y un enlace de recuperación en la misma fila." }, content: { remember: { en: "Remember me", es: "Recordarme" }, forgot: { en: "Forgot your password?", es: "¿Olvidaste tu contraseña?" } } })],
};

export const labelledDivider: PatternModule<DividerContent> = {
  pattern: divider.pattern,
  uses: [divider.use({ id: "alternative-methods", intent: "identity/access/alternative-method", title: { en: "Divider", es: "Separador" }, purpose: { en: "Separates two ways of doing the same thing.", es: "Separa dos maneras de hacer lo mismo." }, content: { label: { en: "or", es: "o" } } })],
};
