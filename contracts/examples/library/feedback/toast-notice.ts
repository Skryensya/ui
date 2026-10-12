import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  tone: "neutral" | "info" | "success" | "warning" | "danger";
  title: string;
  body: string;
  dismissLabel: string;
}

const { pattern, use } = definePattern<Content>({
  id: "toast-notice",
  subject: "feedback",
  scale: "component",
  title: { en: "Toast", es: "Toast" },
  layout: { en: "A ToastRegion holding one dismissible Toast with a title and a line of detail.", es: "Una ToastRegion con un Toast descartable, con título y una línea de detalle." },
  fields: {
    tone: { en: "What kind of news: it paints, it does not change how it is announced.", es: "Qué tipo de noticia: pinta, no cambia cómo se anuncia." },
    title: { en: "What happened, in a few words.", es: "Qué pasó, en pocas palabras." },
    body: { en: "The detail, once.", es: "El detalle, una vez." },
    dismissLabel: { en: "The close button's name.", es: "El nombre del botón de cerrar." },
  },
  notes: [
    { en: "A toast reports the result of something the reader just did; it is announced politely and leaves on its own, so nothing it says may be the only copy.", es: "Un toast informa el resultado de algo que quien lee acaba de hacer; se anuncia con cortesía y se va solo, así que nada de lo que dice puede ser la única copia." },
    { en: "It is dismissible with a named button: a notice that cannot be closed covers whatever is under it.", es: "Se descarta con un botón con nombre: un aviso que no se puede cerrar tapa lo que hay debajo." },
  ],
  build: ({ tone, title, body, dismissLabel }) => ({
    contract: "content",
    signature: "ToastRegion",
    children: {
      contract: "content",
      signature: "Toast",
      options: { tone, dismissible: true, dismissLabel },
      slots: { title },
      children: body,
    },
  }),
});

export const toastNotice: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "toast-saved",
      intent: "status/notices/toast",
      title: { en: "Changes saved", es: "Cambios guardados" },
      purpose: { en: "Confirm that an action went through, without moving the reader from where they are.", es: "Confirmar que una acción se hizo, sin sacar a quien lee de donde está." },
      content: { tone: "success", title: { en: "Changes saved", es: "Cambios guardados" }, body: { en: "The July version is published.", es: "La versión de julio quedó publicada." }, dismissLabel: { en: "Dismiss", es: "Cerrar aviso" } },
    }),
    use({
      id: "toast-sync-failed",
      intent: "status/notices/toast",
      title: { en: "Sync failed", es: "Falló la sincronización" },
      purpose: { en: "Report a background failure the reader did not cause, in words that say what to do.", es: "Informar de un fallo en segundo plano que no causó quien lee, con palabras que dicen qué hacer." },
      content: { tone: "danger", title: { en: "Could not sync", es: "No se pudo sincronizar" }, body: { en: "Check your connection. We will try again in a minute.", es: "Revisa tu conexión. Lo intentamos de nuevo en un minuto." }, dismissLabel: { en: "Dismiss", es: "Cerrar aviso" } },
    }),
  ],
};
