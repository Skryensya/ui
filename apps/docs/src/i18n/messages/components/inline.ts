export const inlineMessages = {
  es: {
    "demo.inline.title": "Proyecto Atlas",
    "demo.inline.status": "3 cambios sin publicar",
    "demo.inline.preview": "Vista previa",
    "demo.inline.publish": "Publicar",
    "demo.inline.floorShortTitle": "Plan corto",
    "demo.inline.floorShortBody": "Una línea de pitch.",
    "demo.inline.floorLongTitle": "Plan largo",
    "demo.inline.floorLongBody":
      "Texto de más, para que esta card crezca más que su vecina y la fila de acciones tenga que sentarse en el piso en vez de pegarse a la última línea.",
    "demo.inline.floorSecondary": "Detalles",
    "demo.inline.floorPrimary": "Elegir",
    "demo.inline.tag.design": "Diseño",
    "demo.inline.tag.research": "Investigación",
    "demo.inline.tag.frontend": "Frontend",
    "demo.inline.statusLabel": "Estado",
    "demo.inline.statusValue": "Publicado",
    "demo.inline.owner": "Ana Rivera",
    "demo.inline.updated": "Hace 2 min",
    "demo.inline.metadataSentence": "Publicado · Ana Rivera · Hace 2 min",
    "demo.inline.plan": "Plan Team",
    "demo.inline.manage": "Administrar",

    "inlinePage.description": "Pone elementos en fila, cada uno con su ancho, y los pasa a otra línea si no caben.",

    "inlinePage.a11yYours2": "Para un grupo de controles relacionados, usa un elemento con nombre, como un <code>fieldset</code>.",

    "inlinePage.a11yYours1": "No reordenes con CSS lo que se lee en orden: la vista y el foco deben coincidir.",

    "inlinePage.a11yDoes1": "El orden de lectura y de tabulación es el del DOM.",

    "inlinePage.a11yIntro": "Inline es visual: no agrega roles ni foco.",

    "inlinePage.dd.row.dont": "En una cuadrícula, los botones se estiran y la fila parece de tarjetas.",

    "inlinePage.dd.row.do": "Cada acción ocupa lo que necesita su texto.",

    "inlinePage.dd.row.title": "Botones: en fila, no en cuadrícula",
    "inlinePage.dd.wrap.title": "Chips: permite que envuelvan",
    "inlinePage.dd.wrap.do": "Los chips mantienen su tamaño y saltan a la línea siguiente cuando falta espacio.",
    "inlinePage.dd.wrap.dont": "Forzar una sola línea corta contenido o empuja la página hacia los lados.",
    "inlinePage.dd.metadata.title": "Metadatos: piezas que pueden envolver",
    "inlinePage.dd.metadata.do": "Cada dato conserva su forma y la fila envuelve sin perder estructura.",
    "inlinePage.dd.metadata.dont": "Una frase con separadores se parte como texto común y es más difícil de escanear.",
    "inlinePage.dd.between.title": "Entre extremos: usa between",
    "inlinePage.dd.between.do": "<code>justify=\"between\"</code> separa título y acción sin inventar columnas.",
    "inlinePage.dd.between.dont": "Una Grid de dos columnas hace que una relación simple parezca una tabla.",

    "inlinePage.whenNot3": 'Para una barra de herramientas que se recorre con flechas: usa <a href="/es/componentes/toolbar">Toolbar</a>.',

    "inlinePage.whenNot2": 'Para apilar de arriba abajo: usa <a href="/es/componentes/stack">Stack</a>.',

    "inlinePage.whenNot1": 'Para elementos parecidos en columnas del mismo ancho: usa <a href="/es/componentes/grid">Grid</a>.',

    "inlinePage.when2": "Para un par etiqueta y valor, o un grupo de chips.",

    "inlinePage.when1": "Para una fila de acciones: el pie de una card, un diálogo o un formulario.",

    "inlinePage.contract3": "No hay un <code>ButtonWrapper</code>: una fila de botones es una Inline.",

    "inlinePage.contract2": '<code>wrap</code> viene activado; <code>wrap="false"</code> fuerza una sola línea.',

    "inlinePage.contract1": "Aplica <code>sk-inline</code> al elemento que corresponda; en React, <code>as</code> lo elige.",

    "inlinePage.barBody": "Una Inline dentro de un Box, con la acción principal y la secundaria.",

    "inlinePage.barTitle": "Una barra de acciones",

    "inlinePage.prop.justify.between": "Usa <code>between</code> para separar dos grupos, como el título a un lado y las acciones al otro.",

    "inlinePage.prop.justify.end": "Usa <code>end</code> para el pie de un diálogo o de un formulario: la acción principal a la derecha.",

    "inlinePage.prop.justify.center": "Usa <code>center</code> para una fila sola en una columna centrada, como en un estado vacío.",

    "inlinePage.prop.justify.start": "Usa <code>start</code>, el valor por defecto, para acciones que siguen al contenido.",

    "inlinePage.prop.justify.body": "Distribuye los elementos a lo largo de la fila.",

    "inlinePage.prop.justify.title": "Justify: dónde se ubica la fila",
    "inlinePage.anatomyBody":
      "El mismo dibujo que el de Stack girado noventa grados, que es toda la diferencia entre los dos primitivos: las franjas de <code>data-gap</code> ahora son verticales. Las etiquetas giran con él, porque nombrar una fila desde un margen lateral obligaría a cruzar cada caja para llegar a la última.",
    "inlinePage.anatomyLabel": "Anatomía de Inline",
    "inlinePage.anatomyPreviewLabel": "Inline, parte por parte",
    "inlinePage.lede": "Inline pone elementos en fila, cada uno con su propio ancho, y los pasa a otra línea cuando el espacio se acaba: una fila de acciones, un par etiqueta y valor, un grupo de chips. El elemento semántico lo eliges tú.",
    "inlinePage.floorTitle": "Al pie de una card: blockStart auto",
    "inlinePage.floorBody": '<code>blockStart="auto"</code> absorbe el alto que sobra, así las acciones de tarjetas de distinto alto quedan alineadas abajo.',
    "inlinePage.floorPreviewLabel": "Fila de acciones al piso",
    "inlinePage.test1": "Renderiza Stack, Inline y Grid según los contratos de layout documentados.",
    "inlinePage.test2": 'Escribe <code>data-block-start="none"</code> para el aire por defecto, igual que el markup emitido.',
    "inlinePage.guidelinesLede": "Inline es para cosas que van una al lado de la otra, cada una del ancho que necesita.",
  },
  en: {
    "demo.inline.title": "Project Atlas",
    "demo.inline.status": "3 unpublished changes",
    "demo.inline.preview": "Preview",
    "demo.inline.publish": "Publish",
    "demo.inline.floorShortTitle": "Short plan",
    "demo.inline.floorShortBody": "A one-line pitch.",
    "demo.inline.floorLongTitle": "Longer plan",
    "demo.inline.floorLongBody":
      "Enough copy that this card grows taller than its neighbour, so the action row has to sit on the floor rather than under the last line of text.",
    "demo.inline.floorSecondary": "Details",
    "demo.inline.floorPrimary": "Choose",
    "demo.inline.tag.design": "Design",
    "demo.inline.tag.research": "Research",
    "demo.inline.tag.frontend": "Frontend",
    "demo.inline.statusLabel": "Status",
    "demo.inline.statusValue": "Published",
    "demo.inline.owner": "Ana Rivera",
    "demo.inline.updated": "2 min ago",
    "demo.inline.metadataSentence": "Published · Ana Rivera · 2 min ago",
    "demo.inline.plan": "Team plan",
    "demo.inline.manage": "Manage",

    "inlinePage.description": "Puts items in a row, each at its own width, and wraps them when they do not fit.",

    "inlinePage.a11yYours2": "For a group of related controls, use a named element, such as a <code>fieldset</code>.",

    "inlinePage.a11yYours1": "Do not reorder with CSS what is read in order: the view and focus must match.",

    "inlinePage.a11yDoes1": "Reading and tab order follow the DOM.",

    "inlinePage.a11yIntro": "Inline is visual: it adds no roles or focus.",

    "inlinePage.dd.row.dont": "In a grid, buttons stretch and the row looks like tiles.",

    "inlinePage.dd.row.do": "Each action takes what its text needs.",

    "inlinePage.dd.row.title": "Buttons: in a row, not a grid",
    "inlinePage.dd.wrap.title": "Chips: let them wrap",
    "inlinePage.dd.wrap.do": "Chips keep their own width and move to the next line when space runs out.",
    "inlinePage.dd.wrap.dont": "Forcing one line clips content or pushes the page sideways.",
    "inlinePage.dd.metadata.title": "Metadata: pieces that can wrap",
    "inlinePage.dd.metadata.do": "Each piece keeps its shape and the row wraps without losing structure.",
    "inlinePage.dd.metadata.dont": "A sentence with separators breaks like ordinary text and is harder to scan.",
    "inlinePage.dd.between.title": "Opposite ends: use between",
    "inlinePage.dd.between.do": "<code>justify=\"between\"</code> separates title and action without inventing columns.",
    "inlinePage.dd.between.dont": "A two-column Grid makes a simple relationship look like a table.",

    "inlinePage.whenNot3": 'For a toolbar moved through with arrow keys: use <a href="/components/toolbar">Toolbar</a>.',

    "inlinePage.whenNot2": 'To stack top to bottom: use <a href="/components/stack">Stack</a>.',

    "inlinePage.whenNot1": 'For similar items in columns of equal width: use <a href="/components/grid">Grid</a>.',

    "inlinePage.when2": "For a label and value pair, or a group of chips.",

    "inlinePage.when1": "For a row of actions: a card's, a dialog's or a form's footer.",

    "inlinePage.contract3": "There is no <code>ButtonWrapper</code>: a row of buttons is an Inline.",

    "inlinePage.contract2": '<code>wrap</code> is on; <code>wrap="false"</code> forces a single line.',

    "inlinePage.contract1": "Apply <code>sk-inline</code> to the right element; in React, <code>as</code> chooses it.",

    "inlinePage.barBody": "An Inline inside a Box, with the main and the secondary action.",

    "inlinePage.barTitle": "An action bar",

    "inlinePage.prop.justify.between": "Use <code>between</code> to separate two groups, like the title on one side and actions on the other.",

    "inlinePage.prop.justify.end": "Use <code>end</code> for a dialog's or form's footer: the main action on the right.",

    "inlinePage.prop.justify.center": "Use <code>center</code> for a lone row in a centered column, as in an empty state.",

    "inlinePage.prop.justify.start": "Use <code>start</code>, the default, for actions that follow the content.",

    "inlinePage.prop.justify.body": "Distributes the items along the row.",

    "inlinePage.prop.justify.title": "Justify: where the row sits",
    "inlinePage.anatomyBody":
      "The same drawing as Stack’s, turned ninety degrees, which is the whole difference between the two primitives: the <code>data-gap</code> bands are vertical now. The labels turn with it, because naming a row from a side gutter would cross every box to reach the far one.",
    "inlinePage.anatomyLabel": "Inline anatomy",
    "inlinePage.anatomyPreviewLabel": "Inline, part by part",
    "inlinePage.lede": "Inline puts items in a row, each at its own width, and moves them to another line when space runs out: a row of actions, a label and value pair, a group of chips. You choose the semantic element.",
    "inlinePage.floorTitle": "At a card's foot: blockStart auto",
    "inlinePage.floorBody": '<code>blockStart="auto"</code> takes the spare height, so actions of cards with different heights line up at the bottom.',
    "inlinePage.floorPreviewLabel": "Action row on the floor",
    "inlinePage.test1": "Renders Stack, Inline and Grid as the documented layout contracts.",
    "inlinePage.test2": 'Writes <code>data-block-start="none"</code> for the default space above, as the emitted markup does.',
    "inlinePage.guidelinesLede": "Inline is for things side by side, each as wide as it needs.",
  },
} as const;
