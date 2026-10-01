export const gridMessages = {
  es: {
    "demo.layoutGuide.publish": "Publicar",
    "demo.layoutGuide.saveDraft": "Guardar borrador",
    "demo.layoutGuide.cancel": "Cancelar",
    "demo.grid.label": "Proyectos recientes",


    "grid.description": "Reparte elementos parecidos en columnas del mismo ancho.",


    "grid.a11yYours2": "Con <code>multicol</code>, el orden visual va de arriba abajo por carril: no lo uses para una secuencia que se lee en orden.",


    "grid.a11yYours1": "Elige el elemento por lo que agrupa: <code>ul</code> para una lista de tarjetas, <code>section</code> con encabezado.",


    "grid.a11yDoes1": "El orden de lectura es el del DOM, no el visual.",


    "grid.a11yIntro": "Grid es visual: no agrega roles ni foco.",


    "grid.dd.cards.dont": "En una pila, las tarjetas dejan de compararse de un vistazo y la página parece más larga.",


    "grid.dd.cards.do": "Tres proyectos parecidos comparten el ancho en columnas iguales.",


    "grid.dd.cards.title": "Colección: tarjetas del mismo tipo",


    "grid.dd.data.dont": "En tarjetas, cada plan repite los nombres de campo y cuesta comparar uso contra uso.",


    "grid.dd.data.do": "En Table, los campos compartidos son columnas y cada fila se compara con la otra.",


    "grid.dd.data.title": "Datos: columnas compartidas",


    "grid.dd.sequence.dont": "En carriles, el orden se parte visualmente: hay que reconstruir la secuencia.",


    "grid.dd.sequence.do": "En una pila, cada paso queda debajo del anterior y se lee en el orden correcto.",


    "grid.dd.sequence.title": "Orden: pasos en una sola columna",


    "grid.dd.buttons.dont": "En Grid, cada botón se estira hasta llenar su columna y la fila parece una colección de tarjetas.",


    "grid.dd.buttons.do": "Con Inline, cada acción conserva su ancho natural y se lee como un grupo de botones.",


    "grid.dd.buttons.title": "Acciones: ancho propio, no columnas",


    "grid.whenNot4": 'Para datos que se comparan por columna: usa <a href="/es/componentes/table">Table</a>.',


    "grid.whenNot3": 'Para la estructura de una página, con columnas de distinto ancho: usa <a href="/es/componentes/layout-grid">LayoutGrid</a>.',


    "grid.whenNot2": 'Para apilar bloques de arriba abajo: usa <a href="/es/componentes/stack">Stack</a>.',


    "grid.whenNot1": 'Para una fila de elementos de ancho propio, como botones: usa <a href="/es/componentes/inline">Inline</a>.',


    "grid.when2": "Para una colección que debe pasar a una columna en pantallas angostas: usa <code>responsive</code> o <code>multicol</code>.",


    "grid.when1": "Para tarjetas, miniaturas o cifras que se comparan entre sí.",


    "grid.contract2": "No necesita JavaScript.",


    "grid.contract1": "Aplica <code>sk-grid</code> al elemento que elijas, como <code>section</code>; en React, <code>as</code> lo elige.",


    "grid.basicBody": "Tres columnas iguales con el <code>gap</code> por defecto.",


    "grid.basicTitle": "Columnas fijas: el caso base",
    "grid.anatomyBody":
      '<code>data-columns</code> es una cuenta, así que el dibujo es contable: tres celdas en <code>columns="3"</code> ponen un anillo en cada columna, y las dos franjas entre ellos son el mismo <code>data-gap</code> que Stack dibuja en horizontal.',
    "grid.anatomyLabel": "Anatomía de Grid",
    "grid.anatomyPreviewLabel": "Grid, parte por parte",
    "grid.lede": "Grid reparte elementos parecidos en columnas del mismo ancho: tarjetas, miniaturas, cifras que se comparan. Cada columna usa <code>minmax(0, 1fr)</code>, así un contenido largo no ensancha la suya. El elemento semántico lo eliges tú.",
    "grid.multicolTitle": "Multicolumna: un muro de tarjetas",
    "grid.multicolBody1": "<code>multicol</code> reparte las tarjetas en carriles que se llenan de arriba hacia abajo, y <code>columns</code> es el máximo: 1 carril antes de 36rem, 2 desde 36rem, más en pantallas anchas. Úsalo para tarjetas independientes, no para una secuencia.",
    "grid.responsiveTitle": "Responsivo: filas del mismo alto",
    "grid.responsiveBody1": "<code>responsive</code> usa la misma progresión de carriles con un Grid CSS real: cada tarjeta conserva su alto, y un hijo puede ocupar dos columnas para destacar.",
    "grid.responsiveFeaturedLabel": "Destacado, ocupa dos carriles",
    "grid.test1": "Renderiza Stack, Inline y Grid según los contratos de layout documentados.",
    "grid.test2": "Cambia Grid a filas responsivas y deja que un hijo pida un carril más ancho con data-span.",
    "grid.prop.columns.title": "Columns: cuántas columnas",
    "grid.prop.columns.body": "Fija cuántas columnas iguales tiene la cuadrícula.",
    "grid.prop.columns.1": "Usa <code>1</code> para apilar en una columna, como en el celular.",
    "grid.prop.columns.2": "Usa <code>2</code> para comparar dos cosas lado a lado.",
    "grid.prop.columns.3": "Usa <code>3</code> para tarjetas en una página de contenido.",
    "grid.prop.columns.4": "Usa <code>4</code> para miniaturas o cifras cortas.",
    "grid.prop.columns.5": "Usa <code>5</code> solo para elementos muy pequeños, como logos.",
    "grid.guidelinesLede": "Una cuadrícula dice «estas cosas son del mismo tipo».",
  },
  en: {
    "demo.layoutGuide.publish": "Publish",
    "demo.layoutGuide.saveDraft": "Save draft",
    "demo.layoutGuide.cancel": "Cancel",
    "demo.grid.label": "Recent projects",


    "grid.description": "Lays similar items out in columns of equal width.",


    "grid.a11yYours2": "With <code>multicol</code>, the visual order runs top to bottom per lane: do not use it for a sequence read in order.",


    "grid.a11yYours1": "Choose the element by what it groups: <code>ul</code> for a list of cards, <code>section</code> with a heading.",


    "grid.a11yDoes1": "Reading order is the DOM's, not the visual one.",


    "grid.a11yIntro": "Grid is visual: it adds no roles or focus.",


    "grid.dd.cards.dont": "In a stack, the cards stop comparing at a glance and the page looks longer.",


    "grid.dd.cards.do": "Three similar projects share the width in equal columns.",


    "grid.dd.cards.title": "Collection: cards of one kind",


    "grid.dd.data.dont": "In cards, each plan repeats the field names and usage is harder to compare against usage.",


    "grid.dd.data.do": "In Table, the shared fields are columns and each row compares with the next.",


    "grid.dd.data.title": "Data: shared columns",


    "grid.dd.sequence.dont": "In lanes, the order is visually split: people have to rebuild the sequence.",


    "grid.dd.sequence.do": "In a stack, each step sits under the previous one and reads in the right order.",


    "grid.dd.sequence.title": "Order: steps in one column",


    "grid.dd.buttons.dont": "In Grid, each button stretches to fill its column and the row looks like a collection of cards.",


    "grid.dd.buttons.do": "With Inline, each action keeps its natural width and reads as a group of buttons.",


    "grid.dd.buttons.title": "Actions: own width, not columns",


    "grid.whenNot4": 'For data compared by column: use <a href="/components/table">Table</a>.',


    "grid.whenNot3": 'For a page\'s structure, with columns of different widths: use <a href="/components/layout-grid">LayoutGrid</a>.',


    "grid.whenNot2": 'To stack blocks top to bottom: use <a href="/components/stack">Stack</a>.',


    "grid.whenNot1": 'For a row of items with their own widths, like buttons: use <a href="/components/inline">Inline</a>.',


    "grid.when2": "For a collection that should drop to one column on narrow screens: use <code>responsive</code> or <code>multicol</code>.",


    "grid.when1": "For cards, thumbnails or figures compared with each other.",


    "grid.contract2": "It needs no JavaScript.",


    "grid.contract1": "Apply <code>sk-grid</code> to the element you choose, like <code>section</code>; in React, <code>as</code> chooses it.",


    "grid.basicBody": "Three equal columns with the default <code>gap</code>.",


    "grid.basicTitle": "Fixed columns: the base case",
    "grid.anatomyBody":
      '<code>data-columns</code> is a count, so the drawing is countable: three cells at <code>columns="3"</code> put one ring in each column, and the two bands between them are the same <code>data-gap</code> Stack draws horizontally.',
    "grid.anatomyLabel": "Grid anatomy",
    "grid.anatomyPreviewLabel": "Grid, part by part",
    "grid.lede": "Grid lays similar items out in columns of equal width: cards, thumbnails, figures compared side by side. Each column uses <code>minmax(0, 1fr)</code>, so long content does not widen its own. You choose the semantic element.",
    "grid.multicolTitle": "Multi-column: a wall of cards",
    "grid.multicolBody1": "<code>multicol</code> spreads the cards into lanes filled top to bottom, and <code>columns</code> is the maximum: 1 lane below 36rem, 2 from 36rem, more on wide screens. Use it for independent cards, not a sequence.",
    "grid.responsiveTitle": "Responsive: rows of equal height",
    "grid.responsiveBody1": "<code>responsive</code> uses the same lane progression with a real CSS Grid: each card keeps its height, and a child can span two columns to stand out.",
    "grid.responsiveFeaturedLabel": "Featured, spans two lanes",
    "grid.test1": "Renders Stack, Inline and Grid as the documented layout contracts.",
    "grid.test2": "Switches Grid into responsive rows and lets a child request a wider span with data-span.",
    "grid.prop.columns.title": "Columns: how many columns",
    "grid.prop.columns.body": "Sets how many equal columns the grid has.",
    "grid.prop.columns.1": "Use <code>1</code> to stack in one column, as on a phone.",
    "grid.prop.columns.2": "Use <code>2</code> to compare two things side by side.",
    "grid.prop.columns.3": "Use <code>3</code> for cards on a content page.",
    "grid.prop.columns.4": "Use <code>4</code> for thumbnails or short figures.",
    "grid.prop.columns.5": "Use <code>5</code> only for very small items, like logos.",
    "grid.guidelinesLede": "A grid says “these things are of one kind”.",
  },
} as const;
