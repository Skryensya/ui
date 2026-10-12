import { definePattern, type PatternModule } from "../../model/types.js";
import { action, inline, surface, titleBlock } from "../kit.js";

interface Content {
  title: string;
  subtitle: string;
  label: string;
  hint?: string;
  count: number;
  type: "numeric" | "alphanumeric";
  /** Show dots instead of the characters: for something the person knows, not something that was sent. */
  mask?: boolean;
  /** Let the phone offer the code it received by SMS. Off for anything that was not sent to the phone. */
  otp: boolean;
  groupSize?: "2" | "3" | "4";
  /** A code already typed, for showing a state. */
  value?: string;
  invalid?: boolean;
  segmentLabel: string;
  submit: string;
  secondary?: string;
}

const { pattern, use } = definePattern<Content>({
  id: "otp-verification-card",
  subject: "form",
  scale: "component",
  title: { en: "Code entry card", es: "Card de ingreso de código" },
  layout: { en: "A title block, a row of code segments with its label and a line of help, and a decision row under it.", es: "Un bloque de título, una fila de segmentos de código con su etiqueta y una línea de ayuda, y una fila de decisión debajo." },
  fields: { title: { en: "What the code is for.", es: "Para qué es el código." }, subtitle: { en: "Where it came from or what it unlocks.", es: "De dónde vino o qué desbloquea." }, label: { en: "The field's name.", es: "El nombre del campo." }, hint: { en: "Where the code was sent, or the error when it is invalid.", es: "A dónde se envió el código, o el error cuando no es válido." }, count: { en: "How many segments: 4 to 8.", es: "Cuántos segmentos: de 4 a 8." }, type: { en: "`numeric` for digits, `alphanumeric` for letters too.", es: "`numeric` para dígitos, `alphanumeric` también para letras." }, mask: { en: "Show dots instead of characters.", es: "Mostrar puntos en lugar de caracteres." }, otp: { en: "Offer the SMS code the phone received.", es: "Ofrecer el código SMS que recibió el teléfono." }, groupSize: { en: "Split the segments into groups of 2, 3 or 4.", es: "Partir los segmentos en grupos de 2, 3 o 4." }, value: { en: "A code already typed.", es: "Un código ya escrito." }, invalid: { en: "Mark the code as wrong.", es: "Marcar el código como incorrecto." }, segmentLabel: { en: "Each segment's accessible name, with `{index}` and `{count}`.", es: "El nombre accesible de cada segmento, con `{index}` y `{count}`." }, submit: { en: "The way forward.", es: "El camino adelante." }, secondary: { en: "The quiet way out (resend, use another method).", es: "La salida discreta (reenviar, usar otro método)." } },
  notes: [{ en: "Keep the segment count to what a person can hold in mind: past eight, a single field with a mask reads better than a row of boxes.", es: "Mantén los segmentos en lo que una persona puede retener: pasados ocho, un solo campo con máscara se lee mejor que una fila de cajas." }],
  build: ({ title, subtitle, label, hint, count, type, mask, otp, groupSize, value, invalid, segmentLabel, submit, secondary }, ctx) =>
    surface([
      titleBlock(title, subtitle),
      {
        contract: "otp-input",
        signature: "OtpInput",
        options: { name: `${ctx.ns}-code`, count, type, otp, segmentLabel, ...(mask ? { mask } : {}), ...(groupSize ? { groupSize } : {}), ...(value ? { defaultValue: value } : {}), ...(invalid ? { invalid } : {}) },
        slots: { label, ...(hint ? { hint } : {}) },
      },
      inline([...(secondary ? [action(secondary, { variant: "ghost", size: "sm" })] : []), action(submit, { variant: "soft", tone: "accent", size: "sm" })], { gap: "sm", justify: "end" }),
    ]),
});

const segments = { en: "Code {index} of {count}", es: "Código {index} de {count}" };

export const otpVerificationCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "otp-sms-verify",
      intent: "identity/access/verify-code",
      title: { en: "Verify by SMS", es: "Verificar por SMS" },
      purpose: { en: "Confirm a phone number with the code just sent to it.", es: "Confirmar un número de teléfono con el código que se acaba de enviar." },
      content: { title: { en: "Check your phone", es: "Revisa tu teléfono" }, subtitle: { en: "We sent you a code to confirm it is you", es: "Te enviamos un código para confirmar que eres tú" }, label: { en: "Verification code", es: "Código de verificación" }, hint: { en: "Sent to the number ending in 42.", es: "Enviado al número que termina en 42." }, count: 6, type: "numeric", otp: true, segmentLabel: segments, submit: { en: "Verify", es: "Verificar" }, secondary: { en: "Resend code", es: "Reenviar código" } },
    }),
    use({
      id: "otp-wrong-code",
      intent: "identity/access/code-error",
      title: { en: "Wrong code", es: "Código incorrecto" },
      purpose: { en: "Say that the code did not match and what to do next, beside the segments.", es: "Decir que el código no coincidió y qué hacer, junto a los segmentos." },
      content: { title: { en: "Confirm your email", es: "Confirma tu correo" }, subtitle: { en: "The code we sent to marta@example.com", es: "El código que enviamos a marta@example.com" }, label: { en: "Email code", es: "Código del correo" }, hint: { en: "That code did not match. Check it or ask for a new one.", es: "Ese código no coincide. Revísalo o pide uno nuevo." }, count: 6, type: "numeric", otp: true, value: "482913", invalid: true, segmentLabel: segments, submit: { en: "Verify", es: "Verificar" }, secondary: { en: "Send a new code", es: "Enviar un código nuevo" } },
    }),
    use({
      id: "otp-pair-device",
      intent: "identity/devices/pair-with-code",
      title: { en: "Pair with a code", es: "Vincular con un código" },
      purpose: { en: "Link a device by typing the short code its screen shows.", es: "Vincular un dispositivo escribiendo el código corto que muestra su pantalla." },
      content: { title: { en: "Link your TV", es: "Vincula tu televisor" }, subtitle: { en: "Open the app on the TV and choose Link a device", es: "Abre la app en el televisor y elige Vincular un dispositivo" }, label: { en: "Code on the screen", es: "Código en la pantalla" }, hint: { en: "Letters and numbers, no spaces.", es: "Letras y números, sin espacios." }, count: 6, type: "alphanumeric", otp: false, groupSize: "3", segmentLabel: segments, submit: { en: "Link device", es: "Vincular dispositivo" } },
    }),
  ],
};
