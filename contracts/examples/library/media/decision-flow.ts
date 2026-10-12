import type { ItemInput } from "@skryensya/core/usage-tree";
import { definePattern, type PatternModule } from "../../model/types.js";

interface Node {
  id: string;
  label: string;
  shape?: "terminal" | "decision";
  wide?: boolean;
}
interface Edge {
  from: string;
  to: string;
  label?: string;
}
interface Content {
  label: string;
  nodes: Node[];
  edges: Edge[];
}

const { pattern, use } = definePattern<Content>({
  id: "decision-flow",
  subject: "media",
  scale: "component",
  title: { en: "Flow diagram", es: "Diagrama de flujo" },
  layout: { en: "A Diagram of two columns: terminal and decision nodes spanning both, steps beneath, joined by labelled arrows.", es: "Un Diagram de dos columnas: nodos terminales y de decisión que ocupan ambas, pasos debajo, unidos por flechas con etiqueta." },
  fields: { label: { en: "What the diagram explains: it is its text alternative's title.", es: "Qué explica el diagrama: es el título de su alternativa textual." }, nodes: { en: "The nodes: an id, a label, an optional shape, and whether it spans both columns.", es: "Los nodos: un id, una etiqueta, una forma opcional y si ocupa ambas columnas." }, edges: { en: "The arrows: from, to, and an optional word on them.", es: "Las flechas: de, a y una palabra opcional sobre ellas." } },
  notes: [
    { en: "The arrows are drawn from the edge list, and the same list is what a screen reader gets as text: a diagram is never only a picture.", es: "Las flechas se dibujan desde la lista de aristas, y esa misma lista es lo que recibe un lector de pantalla como texto: un diagrama nunca es solo una imagen." },
    { en: "Word the branches (`yes`, `no`, `retry`): an unlabelled fork forces the reader to guess which way is which.", es: "Pon palabras a las ramas (`sí`, `no`, `reintentar`): una bifurcación sin etiqueta obliga a adivinar cuál es cuál." },
  ],
  build: ({ label, nodes, edges }) => ({
    contract: "diagram",
    signature: "Diagram",
    options: { label, columns: 2 },
    slots: {
      nodes: nodes.map((node): ItemInput => ({ options: { node: node.id, ...(node.shape ? { shape: node.shape } : {}), ...(node.wide ? { span: 2 } : {}) }, slots: { children: node.label } })),
      edges: edges.map((edge): ItemInput => ({ options: { from: edge.from, to: edge.to }, slots: edge.label ? { children: edge.label } : {} })),
    },
  }),
});

export const decisionFlow: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "flow-request",
      intent: "content/documentation/flow-diagram",
      title: { en: "How a request is handled", es: "Cómo se atiende una solicitud" },
      purpose: { en: "Explain a process with a branch and a loop, so the reader sees the whole path at once.", es: "Explicar un proceso con una bifurcación y un ciclo, para que quien lee vea el camino completo." },
      content: {
        label: { en: "Request handling", es: "Atención de una solicitud" },
        nodes: [
          { id: "start", label: { en: "Request", es: "Solicitud" }, shape: "terminal", wide: true },
          { id: "valid", label: { en: "Session valid?", es: "¿Sesión válida?" }, shape: "decision", wide: true },
          { id: "app", label: { en: "Dashboard", es: "Panel" } },
          { id: "login", label: { en: "Sign in", es: "Iniciar sesión" } },
        ],
        edges: [
          { from: "start", to: "valid" },
          { from: "valid", to: "app", label: { en: "yes", es: "sí" } },
          { from: "valid", to: "login", label: { en: "no", es: "no" } },
          { from: "login", to: "valid", label: { en: "retry", es: "reintentar" } },
        ],
      },
    }),
  ],
};
