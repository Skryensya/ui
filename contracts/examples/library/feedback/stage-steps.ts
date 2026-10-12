import { definePattern, type PatternModule } from "../../model/types.js";
import { icon, surface, titleBlock } from "../kit.js";

interface Stage {
  status: "complete" | "current" | "upcoming";
  label: string;
  description?: string;
}
interface Content {
  title: string;
  subtitle: string;
  orientation: "horizontal" | "vertical";
  stages: Stage[];
}

const { pattern, use } = definePattern<Content>({
  id: "stage-steps",
  subject: "feedback",
  scale: "component",
  title: { en: "Stage progress card", es: "Card de progreso por etapas" },
  layout: { en: "A title block over Steps: a marker per stage, done ones ticked, the current one called out, the rest numbered.", es: "Un bloque de título sobre Steps: un marcador por etapa, las hechas con marca, la actual destacada y las demás numeradas." },
  fields: { title: { en: "What the stages lead to.", es: "A qué llevan las etapas." }, subtitle: { en: "One line of context.", es: "Una línea de contexto." }, orientation: { en: "`horizontal` for a short row of stages, `vertical` when each carries a description.", es: "`horizontal` para una fila corta de etapas, `vertical` cuando cada una lleva descripción." }, stages: { en: "Each stage: its status, its label and an optional description.", es: "Cada etapa: su estado, su etiqueta y una descripción opcional." } },
  notes: [{ en: "A done stage's marker is a tick and the others show their position, so the row reads without colour.", es: "El marcador de una etapa hecha es una marca y los demás muestran su posición, así que la fila se lee sin color." }],
  build: ({ title, subtitle, orientation, stages }) =>
    surface([
      titleBlock(title, subtitle),
      {
        contract: "steps",
        signature: "Steps",
        options: { orientation },
        slots: {
          items: stages.map((stage, index) => ({
            options: { status: stage.status },
            slots: { marker: stage.status === "complete" ? icon("check", "sm") : String(index + 1), label: stage.label, ...(stage.description ? { description: stage.description } : {}) },
          })),
        },
      },
    ]),
});

export const stageSteps: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "checkout-progress",
      intent: "status/progress/stage-progress",
      title: { en: "Checkout progress", es: "Progreso de compra" },
      purpose: { en: "Where someone is in a short, fixed sequence, and how much is left.", es: "En qué punto está alguien de una secuencia corta y fija, y cuánto falta." },
      content: {
        title: { en: "Checkout", es: "Compra" },
        subtitle: { en: "Step 2 of 4", es: "Paso 2 de 4" },
        orientation: "horizontal",
        stages: [
          { status: "complete", label: { en: "Cart", es: "Carrito" } },
          { status: "current", label: { en: "Shipping", es: "Envío" } },
          { status: "upcoming", label: { en: "Payment", es: "Pago" } },
          { status: "upcoming", label: { en: "Review", es: "Revisión" } },
        ],
      },
    }),
    use({
      id: "setup-progress",
      intent: "status/progress/stage-progress",
      title: { en: "Setup checklist", es: "Pasos de configuración" },
      purpose: { en: "A longer setup where each stage says what it asks, so no one has to guess.", es: "Una configuración más larga donde cada etapa dice qué pide, para que nadie adivine." },
      content: {
        title: { en: "Set up your workspace", es: "Configura tu espacio" },
        subtitle: { en: "Two steps to go", es: "Faltan dos pasos" },
        orientation: "vertical",
        stages: [
          { status: "complete", label: { en: "Create the workspace", es: "Crear el espacio" }, description: { en: "Named Studio North.", es: "Se llama Studio North." } },
          { status: "complete", label: { en: "Invite your team", es: "Invitar a tu equipo" }, description: { en: "Four people joined.", es: "Se unieron cuatro personas." } },
          { status: "current", label: { en: "Connect a data source", es: "Conectar una fuente de datos" }, description: { en: "Pick where your reports will read from.", es: "Elige de dónde leerán tus informes." } },
          { status: "upcoming", label: { en: "Publish the first report", es: "Publicar el primer informe" }, description: { en: "Share it with the team.", es: "Compártelo con el equipo." } },
        ],
      },
    }),
  ],
};
