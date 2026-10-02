export const placeholderMessages = {
  es: {
    "demo.placeholder.restart": "Reiniciar",
    "demo.placeholder.loadingTable": "Cargando tabla…",
    "placeholderPage.tableTitle": "Una tabla: las columnas alinean",
    "placeholderPage.tableBody": "La cabecera, el avatar con nombre, la píldora de estado y las cifras ocupan las mismas columnas que las filas reales.",
    "demo.placeholder.loadingAll": "Cargando…",
    "placeholderPage.dd.role.title": "Rol: el del texto que llega",
    "placeholderPage.dd.role.do": "Un título h3 y tres líneas de cuerpo: al llegar, nada se desplaza.",
    "placeholderPage.dd.role.dont": "Barras de 12 px escritas a mano: el título real es más alto y todo baja.",
    "placeholderPage.dd.avatar.title": "Avatar: redondo, con prosa irregular",
    "placeholderPage.dd.avatar.do": "Un círculo del tamaño del avatar y un texto que termina antes del margen.",
    "placeholderPage.dd.avatar.dont": "Un cuadrado donde irá un círculo y líneas iguales: parece una tabla, no un comentario.",
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
      "Una tarjeta con las cuatro formas. Todas son el mismo <code>sk-placeholder</code> distinguido por <code>data-shape</code>; solo el párrafo tiene una parte hija, <code>sk-placeholder__line</code>. Está congelado; los layouts vivos están arriba.",
    "placeholderPage.anatomyLabel": "Anatomía de Placeholder",
    "placeholderPage.anatomyPreviewLabel": "Placeholder, parte por parte",
    "placeholderPage.layoutTitle": "Una publicación: la forma de la tarjeta",
    "placeholderPage.layoutBody": "Imagen, título, dos líneas y firma, con las mismas medidas que la tarjeta real.",
    "placeholderPage.swapTitle": "Carga simulada: el contenido ocupa su lugar",
    "placeholderPage.swapBody": "Al llegar a esta sección empieza una carga de 5 segundos y la tarjeta real reemplaza la forma en el mismo espacio. Reiníciala cuando quieras.",
    "placeholderPage.swapLabel": "Placeholder → contenido",
    "placeholderPage.shapesTitle": "Cuatro interfaces reales: comentarios, perfil, resultados y una métrica",
    "placeholderPage.shapesBody": "Cuatro interfaces de todos los días. Cada una mide con los roles del texto y el avatar que reemplaza, sin una sola medida escrita a mano.",
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
    "demo.placeholder.restart": "Restart",
    "demo.placeholder.loadingTable": "Loading table…",
    "placeholderPage.tableTitle": "A table: the columns line up",
    "placeholderPage.tableBody": "The header, the avatar with a name, the status pill and the figures take the same columns as the real rows.",
    "demo.placeholder.loadingAll": "Loading…",
    "placeholderPage.dd.role.title": "Role: the text that arrives",
    "placeholderPage.dd.role.do": "An h3 title and three body lines: when it arrives, nothing moves.",
    "placeholderPage.dd.role.dont": "Hand-sized 12px bars: the real title is taller and everything shifts down.",
    "placeholderPage.dd.avatar.title": "Avatar: round, with ragged prose",
    "placeholderPage.dd.avatar.do": "A circle at the avatar's size and text that ends short of the measure.",
    "placeholderPage.dd.avatar.dont": "A square where a circle will land and equal lines: it reads as a table, not a comment.",
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
      "A card with all four shapes. Each is the same <code>sk-placeholder</code> told apart by <code>data-shape</code>; only the paragraph has a child part, <code>sk-placeholder__line</code>. It is frozen; the live layouts are above.",
    "placeholderPage.anatomyLabel": "Placeholder anatomy",
    "placeholderPage.anatomyPreviewLabel": "Placeholder, part by part",
    "placeholderPage.layoutTitle": "A post: the card's shape",
    "placeholderPage.layoutBody": "Image, title, two lines and byline, at the same sizes as the real card.",
    "placeholderPage.swapTitle": "Simulated load: the content takes its place",
    "placeholderPage.swapBody": "The load starts when this section scrolls into view; after 5 seconds the real card replaces the shape in the same space. Restart it whenever you like.",
    "placeholderPage.swapLabel": "Placeholder → content",
    "placeholderPage.shapesTitle": "Four real interfaces: comments, profile, results and a metric",
    "placeholderPage.shapesBody": "Four everyday interfaces. Each is measured by the text and avatar roles it replaces, with not one hand-written length.",
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
