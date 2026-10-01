export const cardMessages = {
  es: {
    "demo.card.title": "Lámpara de mesa",
    "demo.card.description": "Luz cálida y regulable, con base de latón y pantalla de tela.",
    "demo.card.alt": "Una lámpara de mesa de latón con pantalla de tela",
    "demo.card.cta": "Leer más",

    "cardPage.description": "Agrupa contenido sobre un solo tema en una superficie comparable. Se compone con Box o Tile.",

    "cardPage.a11yYours4": "Las imágenes de contenido llevan <code>alt</code>; el gradiente que protege el texto es decorativo.",

    "cardPage.a11yYours3": "No pongas <code>onClick</code> ni <code>tabindex</code> en un Box, ni enlaces o botones dentro de un TileLink o un TileButton.",

    "cardPage.a11yYours2": "Ajusta el nivel del título al lugar de la card en el esquema de encabezados de tu página.",

    "cardPage.a11yYours1": "Elige la raíz por lo que hace la card, con la tabla de Resumen.",

    "cardPage.a11yDoes2": "El foco visible de un Tile rodea toda la superficie.",

    "cardPage.a11yDoes1": "Cada Tile usa su elemento nativo: <code>a[href]</code>, <code>button</code> o <code>input[type=checkbox]</code>.",

    "cardPage.a11yIntro": "La semántica de una card es la de su raíz.",

    "cardPage.content3": "Pon una sola llamada a la acción por card, con un verbo: «Ver producto».",

    "cardPage.content2": "Usa 1 o 2 líneas de descripción. No recortes contenido importante para igualar alturas.",

    "cardPage.content1": "Escribe un título que nombre el contenido. En una card que navega, es el nombre del enlace.",

    "cardPage.dd.target.dont": "Un enlace pequeño adentro obliga a apuntar a una palabra en una card que ya parece presionable.",

    "cardPage.dd.target.do": "Si la card lleva a un solo lugar, toda la superficie es el enlace: el objetivo es grande y el foco la rodea entera.",

    "cardPage.dd.target.title": "Destino: toda la card, no un enlace adentro",

    "cardPage.whenNot4": 'Para un mensaje del sistema: usa <a href="/es/componentes/callout">Callout</a>.',

    "cardPage.whenNot3": 'Para datos que se comparan por columna: usa <a href="/es/componentes/table">Table</a>.',

    "cardPage.whenNot2": 'Para elementos que se recorren en orden: usa <a href="/es/componentes/list">List</a>.',

    "cardPage.whenNot1": 'Para una sola pieza sin hermanas con qué compararse: muéstrala sin superficie, con <a href="/es/componentes/stack">Stack</a>.',

    "cardPage.when2": "Para una superficie que navega, actúa o se elige completa: usa el Tile que corresponde.",

    "cardPage.when1": "Para contenido comparable en una colección: productos, noticias, métricas.",

    "cardPage.contract3": 'Una fila de botones al pie de cards de distinta altura es un <a href="/es/componentes/inline">Inline</a> con <code>blockStart="auto"</code>.',

    "cardPage.contract2": "Box y Tile parten de la misma superficie, borde, radio y padding. Tile agrega el state layer: la diferencia aparece al pasar, enfocar o presionar.",

    "cardPage.contract1": "No existen <code>sk-card</code>, <code>@skryensya/react/card</code> ni <code>components/card.css</code>: importa las piezas que la card usa.",
    "cardPage.lede": 'Una card agrupa el contenido sobre un solo tema (un producto, una noticia, una métrica) en una superficie que se compara con sus vecinas. No es un componente: se compone con <a href="/es/componentes/box">Box</a> o con <a href="/es/componentes/tile">Tile</a>, según lo que hace la superficie.',
    "cardPage.chooseTitle": "Raíz: la elige el comportamiento",
    "cardPage.chooseBody": "«Card» describe una forma, no lo que hace. Empieza por la interacción y después compón el contenido con Stack, Heading, Text, Badge o Stat.",
    "cardPage.tableHeadSurface": "La superficie…",
    "cardPage.tableHeadUses": "Usa",
    "cardPage.tableHeadElement": "Elemento real",
    "cardPage.tableRow1Surface": "presenta contenido o contiene varios controles",
    "cardPage.tableRow1Element": "<code>article</code>, <code>section</code> o <code>div</code>",
    "cardPage.tableRow2Surface": "navega completa a un destino",
    "cardPage.tableRow2Element": "<code>a[href]</code>",
    "cardPage.tableRow3Surface": "ejecuta completa una acción",
    "cardPage.tableRow3Element": "<code>button</code>",
    "cardPage.tableRow4Surface": "activa una opción independiente",
    "cardPage.tableRow4Element": '<code>input[type=checkbox]</code>',
    "cardPage.tableRow5Surface": "elige una opción exclusiva",
    "cardPage.tableRow5Element": '<code>input[type=radio]</code>',
    "cardPage.tableRow6Surface": "revela contenido",
    "cardPage.tableRow6Element": "<code>button</code> o <code>details</code>",
    "cardPage.plainMediaTitle": "Sin contenedor: el contenido basta",
    "cardPage.plainMediaBody": 'Un Stack con una foto sobre el texto, sin borde ni fondo. Sin un Box que recorte las esquinas, <a href="/es/componentes/image-frame">ImageFrame</a> lleva su propio radio.',
    "cardPage.plainMediaNote": "Stack + ImageFrame + Heading + Text",
    "cardPage.linkTitle": "Card que navega: la raíz es un enlace",
    "cardPage.linkBody": "Toda la superficie lleva a un destino, así que la raíz es un <code>a[href]</code>: un TileLink. El título es el nombre del enlace.",
    "cardPage.linkNote": "TileLink + Icon",
    "cardPage.actionTitle": "Card que actúa: la raíz es un botón",
    "cardPage.actionBody": "La misma forma, pero hace algo: es un <code>button</code>. La forma no decide el elemento; la intención sí.",
    "cardPage.actionNote": "TileButton + Icon",
    "cardPage.selectTitle": "Card que se elige: la raíz es un checkbox",
    "cardPage.selectBody": "Una preferencia es un checkbox real: se marca con la barra espaciadora, entra en un formulario y se anuncia como casilla.",
    "cardPage.selectNote": "TileCheckbox",
    "cardPage.gradientNote": "ImageFrame + MediaCaption + MediaGradient (sm · md · lg)",
    "cardPage.productTitle": "Card de producto: dos acciones, un Box",
    "cardPage.productBody": "Ver el detalle y agregar al carrito son dos decisiones, así que la raíz no puede ser un Tile: un enlace y un botón dentro de un <code>a</code> son HTML inválido.",
    "cardPage.productNote": "Box + Badge + Link + Button",
    "cardPage.prop.surface.title": "Surface: qué tan presente es la card",
    "cardPage.prop.surface.body": "La primera decisión visual no crea un componente: elige el nivel del Box que contiene el contenido.",
    "cardPage.prop.surface.none": "Usa <code>none</code> cuando otro contenedor ya agrupa las cards.",
    "cardPage.prop.surface.sunken": "Usa <code>sunken</code> para cards secundarias o dentro de una superficie mayor.",
    "cardPage.prop.surface.surface": "Usa <code>surface</code> para la card base: visible, neutra y comparable con sus hermanas.",
    "cardPage.prop.surface.raised": "Usa <code>raised</code> para la card que debe adelantarse a las demás.",
    "cardPage.prop.padding.title": "Padding",
    "cardPage.prop.padding.body": "El inset pertenece a la pieza que pinta la superficie. Cambiarlo no cambia la semántica de la card.",
    "cardPage.prop.padding.none": "None deja que el contenido llegue al borde; útil cuando una imagen o media ya controla el recorte.",
    "cardPage.prop.padding.xs": "XS compacta metadatos o cards densas, no contenido largo.",
    "cardPage.prop.padding.sm": "SM mantiene una card apretada sin hacerla parecer una fila de tabla.",
    "cardPage.prop.padding.md": "MD sirve para cards pequeñas y listas de superficies repetidas.",
    "cardPage.prop.padding.lg": "LG es el punto de partida para contenido editorial o producto.",
    "cardPage.prop.padding.xl": "XL convierte la card en un bloque protagonista; úsalo cuando el contenido pueda respirar.",
    "cardPage.prop.appearance.title": "Apariencia interactiva",
    "cardPage.prop.appearance.body": "Cuando toda la superficie tiene una sola intención, la raíz cambia a Tile. La apariencia expresa materialidad, no comportamiento.",
    "cardPage.prop.appearance.plain": "Plain conserva la card plana y deja que hover, focus y press indiquen interacción.",
    "cardPage.prop.appearance.tactile": "Tactile añade una sensación física de presión; útil para acciones prominentes.",
    "cardPage.prop.appearance.brutalist": "Brutalist usa borde duro y desplazamiento; debe ser una decisión de lenguaje visual, no de énfasis accidental.",
    "cardPage.prop.appearance.frosted": "Frosted hace que la superficie lea como material translúcido sobre fondos ricos.",
    "cardPage.prop.defaultChecked.title": "Estado inicial",
    "cardPage.prop.defaultChecked.body": "Una card seleccionable sigue siendo un checkbox real. El estado inicial es propiedad del TileCheckbox, no una clase de card.",
    "cardPage.prop.defaultChecked.falseLabel": "Sin marcar",
    "cardPage.prop.defaultChecked.trueLabel": "Marcada",
    "cardPage.prop.defaultChecked.false": "Sin marcar, la card ofrece la opción sin declarar una preferencia previa.",
    "cardPage.prop.defaultChecked.true": "Marcada, el estado inicial vive en la raíz del TileCheckbox y la máquina lo toma desde ahí.",
    "cardPage.guidelinesLede": "Elige primero qué hace la card; su aspecto viene después.",
  },
  en: {
    "demo.card.title": "Desk lamp",
    "demo.card.description": "Warm dimmable light with a brass base and fabric shade.",
    "demo.card.alt": "A brass desk lamp with a fabric shade",
    "demo.card.cta": "Read more",

    "cardPage.description": "Groups content about one subject on a comparable surface. Composed from Box or Tile.",

    "cardPage.a11yYours4": "Content images carry <code>alt</code>; the gradient that protects the text is decorative.",

    "cardPage.a11yYours3": "Do not put <code>onClick</code> or <code>tabindex</code> on a Box, or links or buttons inside a TileLink or TileButton.",

    "cardPage.a11yYours2": "Set the title's level to the card's place in your page's heading outline.",

    "cardPage.a11yYours1": "Choose the root by what the card does, with the table in Overview.",

    "cardPage.a11yDoes2": "A Tile's visible focus surrounds the whole surface.",

    "cardPage.a11yDoes1": "Each Tile uses its native element: <code>a[href]</code>, <code>button</code> or <code>input[type=checkbox]</code>.",

    "cardPage.a11yIntro": "A card's semantics are its root's.",

    "cardPage.content3": "Use one call to action per card, with a verb: “View product”.",

    "cardPage.content2": "Use 1 or 2 lines of description. Do not cut important content to even out heights.",

    "cardPage.content1": "Write a title that names the content. On a card that navigates, it is the link's name.",

    "cardPage.dd.target.dont": "A small link inside makes people aim at a word on a card that already looks pressable.",

    "cardPage.dd.target.do": "If the card leads to one place, the whole surface is the link: the target is large and focus surrounds all of it.",

    "cardPage.dd.target.title": "Destination: the whole card, not a link inside",

    "cardPage.whenNot4": 'For a system message: use <a href="/components/callout">Callout</a>.',

    "cardPage.whenNot3": 'For data compared by column: use <a href="/components/table">Table</a>.',

    "cardPage.whenNot2": 'For items read in order: use <a href="/components/list">List</a>.',

    "cardPage.whenNot1": 'For a single piece with no siblings to compare against: show it without a surface, with <a href="/components/stack">Stack</a>.',

    "cardPage.when2": "For a surface that navigates, acts or is chosen as a whole: use the matching Tile.",

    "cardPage.when1": "For comparable content in a collection: products, stories, metrics.",

    "cardPage.contract3": 'A row of buttons at the foot of cards of different heights is an <a href="/components/inline">Inline</a> with <code>blockStart="auto"</code>.',

    "cardPage.contract2": "Box and Tile start from the same surface, border, radius and padding. Tile adds the state layer: the difference shows on hover, focus or press.",

    "cardPage.contract1": "There is no <code>sk-card</code>, <code>@skryensya/react/card</code> or <code>components/card.css</code>: import the pieces the card uses.",
    "cardPage.lede": 'A card groups content about one subject (a product, a story, a metric) on a surface people compare with its neighbors. It is not a component: it is composed from <a href="/components/box">Box</a> or <a href="/components/tile">Tile</a>, depending on what the surface does.',
    "cardPage.chooseTitle": "Root: behavior chooses it",
    "cardPage.chooseBody": "“Card” describes a shape, not what it does. Start from the interaction, then compose the content with Stack, Heading, Text, Badge or Stat.",
    "cardPage.tableHeadSurface": "The surface…",
    "cardPage.tableHeadUses": "Use",
    "cardPage.tableHeadElement": "Real element",
    "cardPage.tableRow1Surface": "presents content or holds several controls",
    "cardPage.tableRow1Element": "<code>article</code>, <code>section</code>, or <code>div</code>",
    "cardPage.tableRow2Surface": "navigates entirely to a destination",
    "cardPage.tableRow2Element": "<code>a[href]</code>",
    "cardPage.tableRow3Surface": "runs an action entirely",
    "cardPage.tableRow3Element": "<code>button</code>",
    "cardPage.tableRow4Surface": "toggles an independent option",
    "cardPage.tableRow4Element": '<code>input[type=checkbox]</code>',
    "cardPage.tableRow5Surface": "chooses an exclusive option",
    "cardPage.tableRow5Element": '<code>input[type=radio]</code>',
    "cardPage.tableRow6Surface": "reveals content",
    "cardPage.tableRow6Element": "<code>button</code> or <code>details</code>",
    "cardPage.plainMediaTitle": "No container: the content is enough",
    "cardPage.plainMediaBody": 'A Stack with a photo over the text, with no border or fill. Without a Box to clip the corners, <a href="/components/image-frame">ImageFrame</a> carries its own radius.',
    "cardPage.plainMediaNote": "Stack + ImageFrame + Heading + Text",
    "cardPage.linkTitle": "A card that navigates: the root is a link",
    "cardPage.linkBody": "The whole surface leads to one destination, so the root is an <code>a[href]</code>: a TileLink. The title is the link's name.",
    "cardPage.linkNote": "TileLink + Icon",
    "cardPage.actionTitle": "A card that acts: the root is a button",
    "cardPage.actionBody": "The same shape, but it does something: it is a <code>button</code>. Shape does not choose the element; intent does.",
    "cardPage.actionNote": "TileButton + Icon",
    "cardPage.selectTitle": "A card that is chosen: the root is a checkbox",
    "cardPage.selectBody": "A preference is a real checkbox: it toggles with the space bar, joins a form and is announced as a checkbox.",
    "cardPage.selectNote": "TileCheckbox",
    "cardPage.gradientNote": "ImageFrame + MediaCaption + MediaGradient (sm · md · lg)",
    "cardPage.productTitle": "Product card: two actions, one Box",
    "cardPage.productBody": "Viewing details and adding to the cart are two decisions, so the root cannot be a Tile: a link and a button inside an <code>a</code> are invalid HTML.",
    "cardPage.productNote": "Box + Badge + Link + Button",
    "cardPage.prop.surface.title": "Surface: how present the card is",
    "cardPage.prop.surface.body": "The first visual decision creates no component: it sets the level of the Box that holds the content.",
    "cardPage.prop.surface.none": "Use <code>none</code> when another container already groups the cards.",
    "cardPage.prop.surface.sunken": "Use <code>sunken</code> for secondary cards or cards inside a larger surface.",
    "cardPage.prop.surface.surface": "Use <code>surface</code> for the base card: visible, neutral and comparable with its siblings.",
    "cardPage.prop.surface.raised": "Use <code>raised</code> for the card that should step ahead of the rest.",
    "cardPage.prop.padding.title": "Padding",
    "cardPage.prop.padding.body": "The inset belongs to the piece that paints the surface. Changing it does not change card semantics.",
    "cardPage.prop.padding.none": "None lets content reach the edge; useful when media already controls the clipping.",
    "cardPage.prop.padding.xs": "XS compacts metadata or dense cards, not long content.",
    "cardPage.prop.padding.sm": "SM keeps a card tight without making it read like a table row.",
    "cardPage.prop.padding.md": "MD works for small cards and repeated surface lists.",
    "cardPage.prop.padding.lg": "LG is the starting point for editorial or product content.",
    "cardPage.prop.padding.xl": "XL turns the card into a feature block; use it when the content can breathe.",
    "cardPage.prop.appearance.title": "Interactive appearance",
    "cardPage.prop.appearance.body": "When the whole surface has one intent, the root changes to Tile. Appearance expresses material, not behavior.",
    "cardPage.prop.appearance.plain": "Plain keeps the card flat and lets hover, focus, and press signal interaction.",
    "cardPage.prop.appearance.tactile": "Tactile adds a physical press feel; useful for prominent actions.",
    "cardPage.prop.appearance.brutalist": "Brutalist uses a hard edge and offset; it should be a visual-language decision, not accidental emphasis.",
    "cardPage.prop.appearance.frosted": "Frosted makes the surface read as translucent material over rich backdrops.",
    "cardPage.prop.defaultChecked.title": "Initial state",
    "cardPage.prop.defaultChecked.body": "A selectable card is still a real checkbox. The initial state is a TileCheckbox property, not a card class.",
    "cardPage.prop.defaultChecked.falseLabel": "Unchecked",
    "cardPage.prop.defaultChecked.trueLabel": "Checked",
    "cardPage.prop.defaultChecked.false": "Unchecked, the card offers an option without declaring a prior preference.",
    "cardPage.prop.defaultChecked.true": "Checked, the initial state lives on the TileCheckbox root and the machine reads it from there.",
    "cardPage.guidelinesLede": "Decide first what the card does; its look comes after.",
  },
} as const;
