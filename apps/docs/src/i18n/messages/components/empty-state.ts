export const emptyStateMessages = {
  es: {
    "demo.emptyState.title": "Todavía no hay proyectos",
    "demo.emptyState.description":
      "Crea el primero para organizar el trabajo del equipo.",
    "demo.emptyState.action": "Crear proyecto",

    "emptyState.description": "Explica por qué no hay contenido y ofrece una siguiente acción concreta.",
    "emptyState.betaBadge": "Beta",
    "emptyState.anatomyBody":
      "Este diagrama nombra el icono, el título, la descripción y las acciones. El espécimen está congelado; el EmptyState vivo empieza abajo.",
    "emptyState.anatomyLabel": "Anatomía de EmptyState",
    "emptyState.anatomyPreviewLabel": "EmptyState, parte por parte",
    "emptyState.contractBody": "El título nombra el estado, la descripción explica, y la acción resuelve. No uses EmptyState durante carga.",
    "emptyState.a11yBody": "El icono es decorativo; el texto y la acción sostienen el significado sin depender de una ilustración.",

    "emptyState.testReact1":
      "Renderiza el título como un heading, sin icono, descripción ni acciones por defecto.",
    "emptyState.testReact2": "Renderiza un icono, oculto para tecnología asistiva, solo cuando se da.",
    "emptyState.testReact3": "Renderiza una descripción solo cuando se da.",
    "emptyState.testReact4": "Renderiza acciones solo cuando se dan.",
    "demo.emptyState.dd.vague": "No hay datos",
    "emptyState.showcaseTitle": "Showcases",
    "emptyState.showcaseBody": "Una búsqueda sin resultados: qué pasó y qué hacer ahora.",
    "emptyState.guidelinesLede": "EmptyState explica por qué no hay nada y ofrece un siguiente paso.",
    "emptyState.dd.next.title": "Di qué pasó y qué hacer",
    "emptyState.dd.next.do": "Un título concreto, una línea de contexto y una acción para seguir.",
    "emptyState.dd.next.dont": "\"No hay datos\" no dice por qué ni qué hacer después.",
  },
  en: {
    "demo.emptyState.title": "There are no projects yet",
    "demo.emptyState.description":
      "Create the first one to organize the team's work.",
    "demo.emptyState.action": "Create project",

    "emptyState.description": "Explains why there is no content and offers a concrete next action.",
    "emptyState.betaBadge": "Beta",
    "emptyState.anatomyBody":
      "This diagram names the icon, title, description, and actions. The specimen is frozen; the live EmptyState starts below.",
    "emptyState.anatomyLabel": "EmptyState anatomy",
    "emptyState.anatomyPreviewLabel": "EmptyState, part by part",
    "emptyState.contractBody": "The title names the state, the description explains, and the action resolves it. Do not use EmptyState during loading.",
    "emptyState.a11yBody": "The icon is decorative; the text and the action carry the meaning without depending on an illustration.",

    "emptyState.testReact1":
      "Renders the title as a heading, with no icon, description or actions by default.",
    "emptyState.testReact2": "Renders an icon, hidden from assistive tech, only when given.",
    "emptyState.testReact3": "Renders a description only when given.",
    "emptyState.testReact4": "Renders actions only when given.",
    "demo.emptyState.dd.vague": "No data",
    "emptyState.showcaseTitle": "Showcases",
    "emptyState.showcaseBody": "A search with no results: what happened, and what to do now.",
    "emptyState.guidelinesLede": "EmptyState explains why there is nothing here, and offers a next step.",
    "emptyState.dd.next.title": "Say what happened and what to do",
    "emptyState.dd.next.do": "A specific title, one line of context and an action to move on.",
    "emptyState.dd.next.dont": "\"No data\" says neither why nor what to do next.",
  },
} as const;
