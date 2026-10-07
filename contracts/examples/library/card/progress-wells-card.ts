import { definePattern, type PatternModule } from "../../model/types.js";
import { box, inline, stack, surface, text, titleBlock } from "../kit.js";

interface Goal {
  name: string;
  /** The target, formatted. */
  target: string;
  /** The progress meter's accessible name. */
  progressLabel: string;
  percent: number;
  /** "65% achieved". */
  achieved: string;
  /** What is reached so far, formatted. */
  reached: string;
}
interface Content {
  title: string;
  body: string;
  goals: Goal[];
}

const { pattern, use } = definePattern<Content>({
  id: "progress-wells-card",
  subject: "card",
  scale: "component",
  title: { en: "Progress wells", es: "Pozos de avance" },
  layout: { en: "A title block, then one sunken well per goal: its name, its target as a large figure, a progress bar and the reached amount at the end of a caption row.", es: "Un bloque de título y, debajo, un pozo hundido por meta: su nombre, su objetivo como cifra grande, una barra de avance y lo logrado al final de una fila de leyenda." },
  fields: { title: { en: "What the goals are.", es: "Qué son las metas." }, body: { en: "The period or the rule.", es: "El periodo o la regla." }, goals: { en: "Each goal: name, target, progress and what is reached.", es: "Cada meta: nombre, objetivo, avance y lo logrado." } },
  notes: [{ en: "Each goal in its own well, so two figures on one card read as two things. A Progress, not a Meter: a goal is heading to done.", es: "Cada meta en su pozo, para que dos cifras en una card se lean como dos cosas. Un Progress y no un Meter: una meta va rumbo a cumplirse." }],
  build: ({ title, body, goals }) =>
    surface([
      titleBlock(title, body),
      ...goals.map((goal) =>
        box(
          [
            stack(
              [
                { contract: "stat", signature: "Stat", slots: { label: goal.name, value: goal.target } },
                { contract: "progress", signature: "Progress", options: { label: goal.progressLabel, value: goal.percent, max: 100 } },
                inline([text(goal.achieved, { size: "caption", tone: "secondary" }), text(goal.reached, { size: "caption", weight: "label" })], { gap: "sm", justify: "between" }),
              ],
              { gap: "sm" },
            ),
          ],
          { surface: "sunken", padding: "md" },
        ),
      ),
    ]),
});

export const progressWellsCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "goals-savings",
      intent: "metrics/progress/goals",
      title: { en: "Goals", es: "Metas" },
      purpose: { en: "Targets, with how far each one still has to go.", es: "Objetivos con cuánto falta para cada uno." },
      content: {
        title: { en: "Savings goals", es: "Metas de ahorro" },
        body: { en: "How far each of this year's targets still has to go.", es: "Cuánto falta para cada objetivo de este año." },
        goals: [
          { name: { en: "Retirement", es: "Retiro" }, target: { en: "$420,000", es: "420.000 US$" }, progressLabel: { en: "Retirement progress", es: "Avance de Retiro" }, percent: 65, achieved: { en: "65% achieved", es: "65 % logrado" }, reached: { en: "$273,000", es: "273.000 US$" } },
          { name: { en: "Home", es: "Vivienda" }, target: { en: "$85,000", es: "85.000 US$" }, progressLabel: { en: "Home progress", es: "Avance de Vivienda" }, percent: 30, achieved: { en: "30% achieved", es: "30 % logrado" }, reached: { en: "$25,500", es: "25.500 US$" } },
        ],
      },
    }),
  ],
};
