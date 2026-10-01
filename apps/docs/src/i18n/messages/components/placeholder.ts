export const placeholderMessages = {
  es: {
    "demo.placeholder.loading": "Cargando publicación…",
    "demo.placeholder.loaded": "Publicación cargada.",
    "demo.placeholder.research": "Investigación",
    "demo.placeholder.title": "Cuando una ruta deja de ser lineal",
    "demo.placeholder.body":
      "Doce entrevistas muestran dónde se pierde el contexto y qué señales ayudan a recuperarlo.",
    "demo.placeholder.readTime": "8 min de lectura · actualizado hoy",
    "demo.placeholder.roleSample": "El texto real de este rol",

    "placeholderPage.description": "Dibuja la forma del contenido mientras carga, para que nada salte al llegar.",

    "placeholderPage.a11yYours2": 'Pon un mensaje de estado, visible u oculto, con <code>role="status"</code>.',

    "placeholderPage.a11yYours1": 'Marca la región con <code>aria-busy="true"</code> y quítalo cuando llegue el contenido.',

    "placeholderPage.a11yDoes2": "Con <code>prefers-reduced-motion: reduce</code>, deja de moverse.",

    "placeholderPage.a11yDoes1": "Cada forma lleva <code>aria-hidden</code>.",

    "placeholderPage.a11yIntro": "Placeholder no se lee: la región que carga anuncia la espera.",

    "placeholderPage.content1": "Di en el mensaje de estado qué se carga: «Cargando publicaciones…».",

    "placeholderPage.dd.shape.dont": "Un bloque gris no anticipa nada y, al llegar la tarjeta, todo salta.",

    "placeholderPage.dd.shape.do": "La misma imagen, las mismas líneas y el mismo orden que la tarjeta que llega.",

    "placeholderPage.dd.shape.title": "Forma: la del contenido",

    "placeholderPage.whenNot3": 'Para una lista vacía: usa <a href="/es/componentes/empty-state">EmptyState</a>.',

    "placeholderPage.whenNot2": 'Si se sabe cuánto falta: usa <a href="/es/componentes/progress">Progress</a>.',

    "placeholderPage.whenNot1": 'Si no se sabe qué forma tendrá el contenido: usa <a href="/es/componentes/loader">Loader</a>.',

    "placeholderPage.when2": "Cuando la carga dura lo bastante para verse, más de medio segundo.",

    "placeholderPage.when1": "Cuando el contenido tiene una forma conocida: una tarjeta, una lista, un perfil.",

    "placeholderPage.contract3": "Con <code>prefers-reduced-motion: reduce</code>, el brillo se apaga y queda la forma quieta.",

    "placeholderPage.contract2": "Cada forma acepta solo sus opciones: un círculo no acepta <code>text</code>, un párrafo no acepta <code>fill</code>.",

    "placeholderPage.contract1": 'Siempre es decorativo: la región que carga lleva <code>aria-busy="true"</code> y un mensaje de estado.',
    "placeholderPage.lede": "Placeholder dibuja la forma del contenido mientras carga: las líneas de un texto, una imagen, un avatar. Cuando llega el contenido, ocupa el mismo lugar y nada salta. Es decorativo: la región que carga dice qué espera.",
    "placeholderPage.anatomyBody":
      "Este diagrama nombra el root y las líneas de un <code>Placeholder.paragraph</code>. Las demás firmas son un solo <code>sk-placeholder</code> sin parte hija; solo el párrafo hace que <code>sk-placeholder__line</code> valga la pena. Está congelado; los layouts vivos empiezan abajo.",
    "placeholderPage.anatomyLabel": "Anatomía de Placeholder",
    "placeholderPage.anatomyPreviewLabel": "Placeholder, parte por parte",
    "placeholderPage.layoutTitle": "Una publicación: la forma de la tarjeta",
    "placeholderPage.layoutBody": "Imagen, título, dos líneas y firma, con las mismas medidas que la tarjeta real.",
    "placeholderPage.swapTitle": "Carga simulada: el contenido ocupa su lugar",
    "placeholderPage.swapBody": "A los 5 segundos, la tarjeta real reemplaza la forma en el mismo espacio.",
    "placeholderPage.swapLabel": "Placeholder → contenido",
    "placeholderPage.shapesTitle": "Formas: línea, párrafo, bloque y círculo",
    "placeholderPage.shapesBody": "Una línea mide lo que el texto que reemplaza; un párrafo deja la última línea corta; un bloque es una imagen o una tabla; un círculo, un avatar.",
    "placeholderPage.matchTitle": "A la medida: igual que el texto",
    "placeholderPage.matchBody": '<code>text="h3"</code> usa el mismo tamaño e interlineado que un Heading h3: al cambiar, la línea no se mueve.',
    "placeholderPage.reactBody": "El código está en la pestaña <strong>React</strong> de cada preview.",
    "placeholderPage.test1": "Una línea toma su alto del rol tipográfico que reemplaza, no de un largo escrito a mano.",
    "placeholderPage.test2": "No tiene violaciones serias de accesibilidad dentro de una región busy nombrada.",
    "placeholderPage.test3": "El párrafo dibuja líneas reales y publica la última medida en la raíz.",
    "placeholderPage.test4": "React acota la cantidad de líneas igual que el emisor, así los dos bindings dibujan lo mismo.",
    "placeholderPage.test5": "Un bloque con fill toma la caja del padre; el círculo toma la escala de Avatar.",
    "placeholderPage.test6": "Ninguna de las cuatro firmas entra al árbol de accesibilidad.",
    "placeholderPage.prop.shimmer.title": "Shimmer: un brillo que pasa",
    "placeholderPage.prop.shimmer.body": "Un brillo recorre la forma para que se note que algo carga.",
    "placeholderPage.prop.shimmer.false": "Usa <code>false</code> cuando hay muchas formas en pantalla: el brillo en todas distrae.",
    "placeholderPage.prop.shimmer.true": "Usa <code>true</code>, el valor por defecto, para que la espera se note.",
    "placeholderPage.prop.shimmer.falseLabel": "Quieto",
    "placeholderPage.prop.shimmer.trueLabel": "Con brillo",
    "placeholderPage.guidelinesLede": "Una forma parecida al contenido hace la espera más corta y evita que la página salte.",
  },
  en: {
    "demo.placeholder.loading": "Loading post…",
    "demo.placeholder.loaded": "Post loaded.",
    "demo.placeholder.research": "Research",
    "demo.placeholder.title": "When a route stops being linear",
    "demo.placeholder.body":
      "Twelve interviews show where context is lost and what signs help to recover it.",
    "demo.placeholder.readTime": "8 min read · updated today",
    "demo.placeholder.roleSample": "The real text of this role",

    "placeholderPage.description": "Draws the content's shape while it loads, so nothing jumps when it arrives.",

    "placeholderPage.a11yYours2": 'Add a status message, visible or hidden, with <code>role="status"</code>.',

    "placeholderPage.a11yYours1": 'Mark the region with <code>aria-busy="true"</code> and remove it when the content arrives.',

    "placeholderPage.a11yDoes2": "With <code>prefers-reduced-motion: reduce</code>, it stops moving.",

    "placeholderPage.a11yDoes1": "Each shape carries <code>aria-hidden</code>.",

    "placeholderPage.a11yIntro": "Placeholder is not read: the loading region announces the wait.",

    "placeholderPage.content1": "Say in the status message what is loading: “Loading posts…”.",

    "placeholderPage.dd.shape.dont": "A grey block anticipates nothing and, when the card arrives, everything jumps.",

    "placeholderPage.dd.shape.do": "The same image, lines and order as the card that is coming.",

    "placeholderPage.dd.shape.title": "Shape: the content's own",

    "placeholderPage.whenNot3": 'For an empty list: use <a href="/components/empty-state">EmptyState</a>.',

    "placeholderPage.whenNot2": 'If you know how long is left: use <a href="/components/progress">Progress</a>.',

    "placeholderPage.whenNot1": 'If the content\'s shape is unknown: use <a href="/components/loader">Loader</a>.',

    "placeholderPage.when2": "When loading lasts long enough to see, over half a second.",

    "placeholderPage.when1": "When the content has a known shape: a card, a list, a profile.",

    "placeholderPage.contract3": "With <code>prefers-reduced-motion: reduce</code>, the gleam turns off and the shape stays still.",

    "placeholderPage.contract2": "Each shape takes only its own options: a circle takes no <code>text</code>, a paragraph no <code>fill</code>.",

    "placeholderPage.contract1": 'It is always decorative: the loading region carries <code>aria-busy="true"</code> and a status message.',
    "placeholderPage.lede": "Placeholder draws the content's shape while it loads: a text's lines, an image, an avatar. When the content arrives, it takes the same place and nothing jumps. It is decorative: the loading region says what it awaits.",
    "placeholderPage.anatomyBody":
      "This diagram names the root and the lines of a <code>Placeholder.paragraph</code>. The other signatures are a single <code>sk-placeholder</code> with no child part; only the paragraph makes <code>sk-placeholder__line</code> worth naming. It is frozen; the live layouts start below.",
    "placeholderPage.anatomyLabel": "Placeholder anatomy",
    "placeholderPage.anatomyPreviewLabel": "Placeholder, part by part",
    "placeholderPage.layoutTitle": "A post: the card's shape",
    "placeholderPage.layoutBody": "Image, title, two lines and byline, at the same sizes as the real card.",
    "placeholderPage.swapTitle": "Simulated load: the content takes its place",
    "placeholderPage.swapBody": "After 5 seconds, the real card replaces the shape in the same space.",
    "placeholderPage.swapLabel": "Placeholder → content",
    "placeholderPage.shapesTitle": "Shapes: line, paragraph, block and circle",
    "placeholderPage.shapesBody": "A line measures the text it replaces; a paragraph leaves the last line short; a block is an image or a table; a circle, an avatar.",
    "placeholderPage.matchTitle": "To size: the same as the text",
    "placeholderPage.matchBody": '<code>text="h3"</code> uses the same size and line height as an h3 Heading: on the swap, the line does not move.',
    "placeholderPage.reactBody": "The code is in each preview's <strong>React</strong> tab.",
    "placeholderPage.test1": "A line takes its height from the type role it replaces, not from a hand-written length.",
    "placeholderPage.test2": "Has no serious accessibility violations inside a labelled busy region.",
    "placeholderPage.test3": "The paragraph draws real lines and publishes the last line's measure on the root.",
    "placeholderPage.test4": "React clamps the line count exactly as the emitter does, so both bindings draw the same thing.",
    "placeholderPage.test5": "A filled block takes the parent's box; the circle takes Avatar's scale.",
    "placeholderPage.test6": "None of the four signatures enters the accessibility tree.",
    "placeholderPage.prop.shimmer.title": "Shimmer: a passing gleam",
    "placeholderPage.prop.shimmer.body": "A gleam runs over the shape so the loading shows.",
    "placeholderPage.prop.shimmer.false": "Use <code>false</code> when there are many shapes on screen: a gleam on all of them distracts.",
    "placeholderPage.prop.shimmer.true": "Use <code>true</code>, the default, so the wait shows.",
    "placeholderPage.prop.shimmer.falseLabel": "Still",
    "placeholderPage.prop.shimmer.trueLabel": "Shimmer",
    "placeholderPage.guidelinesLede": "A shape like the content makes the wait feel shorter and keeps the page from jumping.",
  },
} as const;
