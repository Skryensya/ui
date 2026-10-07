import { definePattern, type PatternModule } from "../../model/types.js";
import { lanes } from "../kit.js";

interface Content {
  /** The group's accessible name. */
  label: string;
  columns: "2" | "3";
  /** Ids of the uses to lay out, in reading order. */
  items: string[];
}

const { pattern, use } = definePattern<Content>({
  id: "equal-grid",
  subject: "card",
  scale: "composition",
  title: { en: "Equal grid", es: "Grilla pareja" },
  layout: { en: "Siblings in equal columns that become one lane on a phone, as a named group.", es: "Hermanos en columnas iguales que pasan a un solo carril en el teléfono, como un grupo con nombre." },
  fields: { label: { en: "The group's accessible name.", es: "El nombre accesible del grupo." }, columns: { en: "How many lanes on a desktop.", es: "Cuántos carriles en escritorio." }, items: { en: "Ids of the uses it holds: it renders them, it never copies them.", es: "Ids de los usos que contiene: los renderiza, nunca los copia." } },
  notes: [{ en: "The layout is the whole pattern. The same grid holds plans, people, posts or figures: what they are is the intent of the use that names them, not of the grid.", es: "El layout es todo el patrón. La misma grilla guarda planes, personas, publicaciones o cifras: qué son lo dice la intención del uso que los nombra, no la grilla." }, { en: "Responsive, not fixed: a fixed 3-up grid squeezes three columns into a phone.", es: "Responsiva y no fija: una grilla fija de 3 aprieta tres columnas en un teléfono." }],
  build: ({ label, columns, items }, ctx) => lanes(label, items.map((id) => ctx.render(id)), columns),
});

export const equalGrid: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "plans-comparison", intent: "commerce/pricing/plan-comparison", title: { en: "Pricing", es: "Precios" }, purpose: { en: "Three plans side by side, one of them featured.", es: "Tres planes lado a lado, con uno destacado." }, content: { label: { en: "Plans", es: "Planes" }, columns: "3", items: ["plan-starter", "plan-team", "plan-business"] } }),
    use({ id: "team-directory", intent: "identity/people/team-directory", title: { en: "Directory", es: "Directorio" }, purpose: { en: "A team in a grid that reflows to the width.", es: "Un equipo en una grilla que se reacomoda al ancho." }, content: { label: { en: "Team", es: "Equipo" }, columns: "3", items: ["profile-marta", "profile-tomas", "profile-lucia", "profile-ines", "profile-andres", "profile-pablo"] } }),
    use({ id: "posts-feed", intent: "content/publishing/post-feed", title: { en: "Blog", es: "Blog" }, purpose: { en: "A row of posts to choose what to read.", es: "Una fila de publicaciones para elegir qué leer." }, content: { label: { en: "Posts", es: "Publicaciones" }, columns: "3", items: ["post-backlog", "post-reports", "post-support-team"] } }),
    use({ id: "project-activity", subject: "list", intent: "collaboration/work/activity-panel", title: { en: "Activity panel", es: "Panel de actividad" }, purpose: { en: "Two lists side by side that tell a project's state.", es: "Dos listas lado a lado que cuentan el estado de un proyecto." }, content: { label: { en: "Project activity", es: "Actividad del proyecto" }, columns: "2", items: ["panel-files", "panel-members"] } }),
    use({ id: "kpis-grid", intent: "metrics/key-figures/kpi-grid", title: { en: "Metrics", es: "Métricas" }, purpose: { en: "Four indicators in a two-column grid.", es: "Cuatro indicadores en una grilla de dos." }, content: { label: { en: "Key figures", es: "Cifras clave" }, columns: "2", items: ["kpi-revenue", "kpi-customers", "kpi-accounts", "kpi-growth"] } }),
  ],
};
