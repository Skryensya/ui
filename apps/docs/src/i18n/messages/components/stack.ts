export const stackMessages = {
  es: {
    "demo.stack.title": "Resumen",
    "demo.stack.body": "La solicitud está lista para revisar.",
    "demo.stack.action": "Ver detalles",

    "stackPage.description": "Apila contenido de arriba abajo con un espacio constante entre cada cosa.",

    "stackPage.a11yYours1": "Elige el elemento por lo que significa el contenido: una lista es <code>ul</code>, una sección es <code>section</code>.",

    "stackPage.a11yDoes1": "El orden de lectura es el del DOM.",

    "stackPage.a11yIntro": "Stack es geometría: no agrega roles.",

    "stackPage.whenNot3": 'Para la columna de lectura de una página: usa <a href="/es/componentes/layout-grid">LayoutGrid</a>.',

    "stackPage.whenNot2": 'Para una cuadrícula de columnas: usa <a href="/es/componentes/grid">Grid</a>.',

    "stackPage.whenNot1": 'Para poner cosas en fila: usa <a href="/es/componentes/inline">Inline</a>.',

    "stackPage.when2": "Para dar el mismo espacio entre hermanos sin márgenes sueltos.",

    "stackPage.when1": "Para apilar bloques de arriba abajo: campos, párrafos, tarjetas.",

    "stackPage.contract2": "Es CSS: no necesita JavaScript. El elemento lo eliges tú (<code>as</code> en React).",

    "stackPage.contract3": "<code>justify</code> no tiene valor por defecto: sin declararlo, el Stack mide lo que mide su contenido y nunca reclama altura.",
    "stackPage.prop.justify.title": "Justify: la altura que le dan",
    "stackPage.prop.justify.body": "Con <code>justify</code>, el Stack toma la altura de su padre y reparte lo que sobra. El padre tiene que tener altura: un Main, una tarjeta estirada por su fila.",
    "stackPage.prop.justify.start": "El contenido arriba y el aire abajo.",
    "stackPage.prop.justify.center": "En el medio: un formulario de entrada en el área de trabajo.",
    "stackPage.prop.justify.end": "El contenido abajo y el aire arriba.",
    "stackPage.prop.justify.between": "El primero arriba y el último al fondo: las acciones al pie de una tarjeta.",
    "stackPage.contract1": "<code>gap</code> acepta <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> o <code>xl</code>; por defecto, <code>md</code>.",

    "stackPage.cardBody": "Tres hijos con el mismo espacio entre ellos.",

    "stackPage.cardTitle": "Una tarjeta: título, texto y enlace",
    "stackPage.anatomyBody":
      "Las dos franjas entre los anillos de los hijos son <code>data-gap</code>: el dibujo muestra el número en vez de nombrarlo. Son tres hijos y no dos porque dos hacen un solo hueco, y un hueco solo se lee como casualidad; el segundo es el que lo vuelve un ritmo. La etiqueta de adentro dice <code>sk-stack &gt; *</code> porque los hijos no llevan clase propia.",
    "stackPage.anatomyLabel": "Anatomía de Stack",
    "stackPage.anatomyPreviewLabel": "Stack, parte por parte",
    "stackPage.lede": "Stack apila contenido de arriba abajo con un espacio constante entre cada cosa: los campos de un formulario, el título y el texto de una tarjeta, las secciones de un panel. El espacio es un nombre de una escala, no un margen suelto.",
    "stackPage.prop.align.title": "Align: el borde en que se alinean",
    "stackPage.prop.align.body": "Alinea los hijos en horizontal.",
    "stackPage.prop.align.start": "Usa <code>start</code> para contenido de lectura.",
    "stackPage.prop.align.center": "Usa <code>center</code> para composiciones centradas.",
    "stackPage.prop.align.end": "Usa <code>end</code> para alinear al borde final.",
    "stackPage.prop.align.stretch": "Usa <code>stretch</code>, el valor por defecto, cuando los hijos deben ocupar todo el ancho.",
    "stackPage.guidelinesLede": "Un espacio constante entre bloques hace que una columna se lea como un grupo.",
    "stackPage.dd.axis.title": "Eje: acciones en fila",
    "stackPage.dd.axis.do": "Las acciones de un formulario van en fila: se leen como un grupo.",
    "stackPage.dd.axis.dont": "Apiladas, cada una ocupa una línea y parecen tres decisiones separadas.",
    "stackPage.test1": "Renderiza Stack, Inline y Grid según los contratos de layout documentados.",
  },
  en: {
    "demo.stack.title": "Summary",
    "demo.stack.body": "The request is ready for review.",
    "demo.stack.action": "See details",

    "stackPage.description": "Stacks content top to bottom with a constant space between each thing.",

    "stackPage.a11yYours1": "Choose the element by what the content means: a list is a <code>ul</code>, a section a <code>section</code>.",

    "stackPage.a11yDoes1": "Reading order is the DOM's.",

    "stackPage.a11yIntro": "Stack is geometry: it adds no roles.",

    "stackPage.whenNot3": 'For a page\'s reading column: use <a href="/components/layout-grid">LayoutGrid</a>.',

    "stackPage.whenNot2": 'For a grid of columns: use <a href="/components/grid">Grid</a>.',

    "stackPage.whenNot1": 'To put things in a row: use <a href="/components/inline">Inline</a>.',

    "stackPage.when2": "To give siblings the same space without stray margins.",

    "stackPage.when1": "To stack blocks top to bottom: fields, paragraphs, cards.",

    "stackPage.contract2": "It is CSS: it needs no JavaScript. You choose the element (<code>as</code> in React).",

    "stackPage.contract3": "<code>justify</code> has no default: left out, the Stack is as tall as its content and never claims height.",
    "stackPage.prop.justify.title": "Justify: the height it is given",
    "stackPage.prop.justify.body": "With <code>justify</code>, the Stack takes its parent's height and spends what is left. The parent needs a height: a Main, a card stretched by its row.",
    "stackPage.prop.justify.start": "The content on top and the air below.",
    "stackPage.prop.justify.center": "In the middle: a sign-in form in the work area.",
    "stackPage.prop.justify.end": "The content at the bottom and the air above.",
    "stackPage.prop.justify.between": "The first on top and the last on the floor: the actions at the foot of a card.",
    "stackPage.contract1": "<code>gap</code> takes <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> or <code>xl</code>; by default, <code>md</code>.",

    "stackPage.cardBody": "Three children with the same space between them.",

    "stackPage.cardTitle": "A card: title, text and link",
    "stackPage.anatomyBody":
      "The two bands between the children’s rings are <code>data-gap</code>: the drawing shows the number instead of naming it. Three children rather than two, because two make one gap and one gap reads as a coincidence; the second is what makes it a rhythm. The inner label reads <code>sk-stack &gt; *</code> because the children carry no class of their own.",
    "stackPage.anatomyLabel": "Stack anatomy",
    "stackPage.anatomyPreviewLabel": "Stack, part by part",
    "stackPage.lede": "Stack stacks content top to bottom with a constant space between each thing: a form's fields, a card's title and text, a panel's sections. The space is a name on a scale, not a stray margin.",
    "stackPage.prop.align.title": "Align: the edge they align to",
    "stackPage.prop.align.body": "Aligns the children horizontally.",
    "stackPage.prop.align.start": "Use <code>start</code> for reading content.",
    "stackPage.prop.align.center": "Use <code>center</code> for centered compositions.",
    "stackPage.prop.align.end": "Use <code>end</code> to align to the far edge.",
    "stackPage.prop.align.stretch": "Use <code>stretch</code>, the default, when the children should fill the width.",
    "stackPage.guidelinesLede": "A constant space between blocks makes a column read as a group.",
    "stackPage.dd.axis.title": "Axis: actions in a row",
    "stackPage.dd.axis.do": "A form's actions go in a row: they read as a group.",
    "stackPage.dd.axis.dont": "Stacked, each takes a line and they look like three separate decisions.",
    "stackPage.test1": "Renders Stack, Inline and Grid as the documented layout contracts.",
  },
} as const;
