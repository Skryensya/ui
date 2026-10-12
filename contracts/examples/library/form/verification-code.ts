import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  label: string;
  count: number;
}

const { pattern, use } = definePattern<Content>({
  id: "verification-code",
  subject: "form",
  scale: "fragment",
  title: { en: "Verification code", es: "Código de verificación" },
  layout: { en: "An OtpInput: one box per digit under a visible label, that takes a pasted code whole.", es: "Un OtpInput: una caja por dígito bajo una etiqueta visible, que recibe un código pegado completo." },
  fields: { label: { en: "What the code is: it names the group.", es: "Qué es el código: nombra el grupo." }, count: { en: "How many digits it has.", es: "Cuántos dígitos tiene." } },
  notes: [
    { en: "A pasted code fills every box at once and the browser can offer the one it just received by message: do not turn that off with per-digit inputs of your own.", es: "Un código pegado llena todas las cajas a la vez y el navegador puede ofrecer el que acaba de recibir por mensaje: no lo apagues con campos por dígito propios." },
    { en: "Say where the code came from in the copy around it (`we sent it to…`): the boxes only say how long it is.", es: "Di de dónde vino el código en el texto que lo rodea (`lo enviamos a…`): las cajas solo dicen cuánto mide." },
  ],
  build: ({ label, count }, ctx) => ({ contract: "otp-input", signature: "OtpInput", options: { name: `${ctx.ns}-code`, count }, slots: { label } }),
});

export const verificationCode: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "code-sign-in", intent: "identity/access/one-time-code", title: { en: "Sign-in code", es: "Código de acceso" }, purpose: { en: "Confirm someone owns an address or a phone with a code we just sent them.", es: "Confirmar que alguien es dueño de un correo o un teléfono con un código que acabamos de enviarle." }, content: { label: { en: "Verification code", es: "Código de verificación" }, count: 6 } }),
  ],
};
