import { definePattern, type PatternModule } from "../../model/types.js";
import { action, inline, stack, surface, text, titleBlock } from "../kit.js";
import { renderField, type FieldSpec } from "./fields.js";

interface Content {
  title: string;
  body: string;
  fields: FieldSpec[];
  /** Sign-in only: the checkbox and the recovery link, between the fields and the submit. */
  remember?: { remember: string; forgot: string };
  submit: string;
  /** The word between the two ways in. */
  divider: string;
  provider: string;
  /** The line that leads to the other flow: the question and the link. */
  switchQuestion: string;
  switchLink: string;
}

const { pattern, use } = definePattern<Content>({
  id: "account-form-card",
  subject: "form",
  scale: "component",
  title: { en: "Account form card", es: "Card de formulario de cuenta" },
  layout: { en: "A title block, the fields, an optional remember-and-recover row, a single accent submit, a labelled divider, a neutral provider button and a line that leads to the other flow.", es: "Un bloque de título, los campos, una fila opcional de recordar y recuperar, un único botón de envío con acento, un divisor con palabra, un botón neutro de proveedor y una línea que lleva al otro flujo." },
  fields: { title: { en: "What the card does.", es: "Qué hace la card." }, body: { en: "One line of instruction.", es: "Una línea de instrucción." }, fields: { en: "The controls, top to bottom.", es: "Los controles, de arriba abajo." }, remember: { en: "The checkbox and the recovery link; leave out for a sign-up.", es: "El checkbox y el enlace de recuperación; omitir en un registro." }, submit: { en: "The main action.", es: "La acción principal." }, divider: { en: "The word between the ways in.", es: "La palabra entre las maneras de entrar." }, provider: { en: "The alternative provider's action.", es: "La acción del proveedor alternativo." }, switchQuestion: { en: "The question that leads to the other flow.", es: "La pregunta que lleva al otro flujo." }, switchLink: { en: "The link that answers it.", es: "El enlace que la responde." } },
  notes: [{ en: "The only accent is the submit: the provider is a real way in but not the default one. Sign-in and sign-up are one layout; they differ in their fields and in the recover row.", es: "El único acento es el envío: el proveedor es una vía real pero no la principal. Entrar y registrarse son un mismo layout; difieren en sus campos y en la fila de recuperar." }],
  build: ({ title, body, fields, remember, submit, divider, provider, switchQuestion, switchLink }, ctx) =>
    surface([
      titleBlock(title, body),
      ...fields.map((field) => renderField(field, ctx.ns)),
      ...(remember ? [inline([{ contract: "checkbox", signature: "Checkbox", options: { name: `${ctx.ns}-remember` }, children: remember.remember }, { contract: "typography", signature: "Link", options: { href: "#" }, children: remember.forgot }], { gap: "sm", justify: "between", inlineAlign: "center" })] : []),
      action(submit, { tone: "accent", type: "submit" }),
      { contract: "separator", signature: "LabelledSeparator", options: { spacing: "none" }, children: divider },
      action(provider),
      stack([text([`${switchQuestion} `, { contract: "typography", signature: "Link", options: { href: "#" }, children: switchLink }], { size: "sm", tone: "secondary" })], { gap: "none", align: "center" }),
    ]),
});

const emailField = (hint?: { en: string; es: string }) => ({ kind: "email" as const, name: "email", label: { en: "Email", es: "Correo" }, placeholder: { en: "name@example.com", es: "nombre@ejemplo.com" }, required: true, ...(hint ? { hint } : {}) });
const google = { en: "Sign in with Google", es: "Entrar con Google" };
const or = { en: "or", es: "o" };

export const accountFormCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "sign-in-email-password",
      intent: "identity/access/sign-in",
      title: { en: "Sign in", es: "Iniciar sesión" },
      purpose: { en: "Getting in with email and password, or another provider.", es: "Entrar con correo y contraseña o con otro proveedor." },
      related: [{ id: "sign-up-full", kind: "alternative", why: { en: "For someone with no account yet: the same layout with a name field, a new-password field and no recover row.", es: "Para quien aún no tiene cuenta: el mismo layout con un campo de nombre, una contraseña nueva y sin fila de recuperar." } }],
      content: {
        title: { en: "Sign in to your account", es: "Entra a tu cuenta" },
        body: { en: "Enter your email to sign in.", es: "Escribe tu correo para entrar." },
        fields: [emailField(), { kind: "password", name: "password", label: { en: "Password", es: "Contraseña" }, show: { en: "Show password", es: "Mostrar contraseña" }, hide: { en: "Hide password", es: "Ocultar contraseña" }, mode: "current" }],
        remember: { remember: { en: "Remember me", es: "Recordarme" }, forgot: { en: "Forgot your password?", es: "¿Olvidaste tu contraseña?" } },
        submit: { en: "Sign in", es: "Entrar" },
        divider: or,
        provider: google,
        switchQuestion: { en: "No account yet?", es: "¿No tienes cuenta?" },
        switchLink: { en: "Sign up", es: "Regístrate" },
      },
    }),
    use({
      id: "sign-up-full",
      intent: "identity/access/sign-up",
      title: { en: "Sign up", es: "Crear cuenta" },
      purpose: { en: "The details to register, each with what is expected.", es: "Los datos para registrarse, cada uno con lo que se espera." },
      content: {
        title: { en: "Create an account", es: "Crea una cuenta" },
        body: { en: "Fill in your details to get started.", es: "Completa tus datos para empezar." },
        fields: [
          { kind: "text", name: "name", label: { en: "Full name", es: "Nombre completo" }, placeholder: { en: "Jane Doe", es: "Ana Pérez" }, required: true },
          emailField({ en: "We use it to tell you about changes to your account.", es: "Lo usamos para avisarte de cambios en tu cuenta." }),
          { kind: "password", name: "password", label: { en: "Password", es: "Contraseña" }, hint: { en: "At least 8 characters.", es: "Al menos 8 caracteres." }, show: { en: "Show password", es: "Mostrar contraseña" }, hide: { en: "Hide password", es: "Ocultar contraseña" }, mode: "new" },
        ],
        submit: { en: "Create account", es: "Crear cuenta" },
        divider: or,
        provider: { en: "Sign up with Google", es: "Registrarse con Google" },
        switchQuestion: { en: "Already have an account?", es: "¿Ya tienes cuenta?" },
        switchLink: { en: "Sign in", es: "Entra" },
      },
    }),
  ],
};
