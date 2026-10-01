export const feedMessages = {
  es: {

    "feedPage.description": "Un flujo de publicaciones independientes que se carga por partes.",

    "feedPage.a11yKeysNote": "WAI-ARIA recomienda estas teclas pero no las exige; se activan con <code>keyboard</code>.",

    "feedPage.a11yYours2": "Usa <code>setSize: -1</code> si no conoces el total; no inventes uno.",

    "feedPage.a11yYours1": "Debe tener <code>label</code>: el rol no trae un nombre propio.",

    "feedPage.a11yDoes3": "Con <code>keyboard</code>, los artículos entran al orden de Tab.",

    "feedPage.a11yDoes2": 'Con <code>busy</code>, la raíz anuncia <code>aria-busy="true"</code> y el lector espera al lote nuevo.',

    "feedPage.a11yDoes1": "Cada artículo es un <code>article</code> con <code>aria-posinset</code> y <code>aria-setsize</code>, nombrado por su etiqueta.",

    "feedPage.a11yIntro": "Feed sigue el rol <code>feed</code> de WAI-ARIA.",

    "feedPage.content3": "Escribe el botón de más con lo que trae: «Cargar más publicaciones».",

    "feedPage.content2": "Nombra el feed con <code>label</code>: «Actividad reciente».",

    "feedPage.content1": "Usa como etiqueta del artículo quién lo publicó y cuándo: «Ana, hace 2 h».",

    "feedPage.dd.loading.dont": "No sustituyas las publicaciones por un indicador de carga al pedir más. La persona pierde el contexto de lo que estaba leyendo.",

    "feedPage.dd.loading.do": "Conserva las publicaciones ya cargadas y muestra la espera al final. La persona puede seguir leyendo mientras llega el siguiente lote.",

    "feedPage.dd.loading.title": "Carga: conserva lo que ya se puede leer",
    "feedPage.dd.fixed.title": "Contenido fijo: usa una lista, no un Feed",
    "feedPage.dd.fixed.do": "Usa una lista ordenada para los pasos de publicación. Su posición indica qué va antes y qué va después.",
    "feedPage.dd.fixed.dont": "No presentes instrucciones como publicaciones. Su orden depende del procedimiento, no de cuándo se publicaron.",
    "feedPage.dd.labels.title": "Etiquetas: identifica cada publicación",
    "feedPage.dd.labels.do": "Incluye el autor y la hora en cada etiqueta. Permiten recorrer el feed y reconocer una publicación sin leer todo su cuerpo.",
    "feedPage.dd.labels.dont": "No repitas “Actualización” como única etiqueta. Oculta quién publicó y cuándo, y da el mismo nombre a todos los artículos para quien usa un lector de pantalla.",
    "feedPage.dd.order.title": "Actividad reciente: mantén un orden temporal",
    "feedPage.dd.order.do": "Ordena la actividad reciente de más nueva a más antigua. La hora de cada publicación permite entender la secuencia y localizar lo último.",
    "feedPage.dd.order.dont": "No mezcles publicaciones de ayer entre las de hoy sin explicar otro criterio. La persona tiene que comparar todas las horas para encontrar las novedades.",

    "feedPage.whenNot4": 'Si el orden es fijo y no de publicación: usa <a href="/es/componentes/table">Table</a> o <a href="/es/componentes/list">List</a>.',

    "feedPage.whenNot3": 'Si todavía no hay publicaciones: usa <a href="/es/componentes/empty-state">EmptyState</a>.',

    "feedPage.whenNot2": 'Para una conversación con respuestas anidadas: usa <a href="/es/componentes/comment-thread">CommentThread</a>.',

    "feedPage.whenNot1": 'Para una lista fija o de opciones: usa <a href="/es/componentes/list">List</a> o <a href="/es/componentes/listbox">Listbox</a>.',

    "feedPage.when2": "Cuando el contenido llega por lotes y a veces sin final conocido.",

    "feedPage.when1": "Para contenido que se agrega a medida que se lee: publicaciones, actividad, comentarios.",

    "feedPage.contract3": "Los artículos que llegan después se suman solos al orden de tabulación.",

    "feedPage.contract2": "El teclado del patrón es opcional (<code>keyboard</code>): cada artículo entra al orden de Tab y Page Up y Page Down pasan de uno a otro.",

    "feedPage.contract1": "La posición, el total y el nombre son markup: un Feed no necesita JavaScript.",
    "feedPage.lede": "Feed muestra un flujo de publicaciones independientes que se carga por partes: posts, actividad, comentarios sin respuestas. Cada artículo dice su posición, y un lector de pantalla sabe cuántos hay y cuándo llegan más.",
    "feedPage.test1": "Aplica role=feed, lo nombra, y refleja aria-busy.",
    "feedPage.anatomyBody": "El feed, el artículo y su etiqueta.",
    "feedPage.anatomyLabel": "Anatomía de Feed",
    "feedPage.anatomyPreviewLabel": "Feed, parte por parte",
    "feedPage.test2":
      "Cada artículo recibe role=article con aria-posinset/aria-setsize y un nombre real enlazado.",
    "feedPage.test3":
      "Permite setSize=-1 para un total indeterminado, por la propia licencia de WAI.",

    "feedPage.demoTitle": "Publicaciones: el caso base",
    "feedPage.demoBody": "Tres posts de texto, cada uno con su autor como etiqueta.",
    "feedPage.demoActivityTitle": "Actividad: avatar, nombre y hora",
    "feedPage.demoActivityBody": "La etiqueta acepta una composición: un Avatar, el nombre y la hora. El cuerpo lleva un Tag.",
    "feedPage.demoBusyTitle": "Cargando más: esqueletos",
    "feedPage.demoBusyBody": "Con <code>busy</code>, la raíz anuncia <code>aria-busy</code> mientras llega el siguiente lote, y los esqueletos muestran dónde va a caer.",
    "feedPage.demoInfiniteTitle": "Total desconocido: un flujo sin fin",
    "feedPage.demoInfiniteBody": "Cada artículo declara <code>setSize: -1</code>, así se anuncia la posición sin inventar un total. El botón agrega el siguiente lote.",
    "feedPage.demoInfiniteLabel": "Stream con botón de cargar más",
    "feedPage.demoCommentsTitle": "Comentarios: sin respuestas anidadas",
    "feedPage.demoCommentsBody": 'Comentarios que solo se leen. Si tienen respuestas o votos, es <a href="/es/componentes/comment-thread">CommentThread</a>.',
    "feedPage.keyboardPageDown": "Mueve el foco al artículo siguiente.",
    "feedPage.keyboardPageUp": "Mueve el foco al artículo anterior.",
    "feedPage.keyboardCtrlEnd": "Mueve el foco al primer elemento enfocable después del feed.",
    "feedPage.keyboardCtrlHome": "Mueve el foco al primer elemento enfocable antes del feed.",
    "feedPage.test4": "Resuelve Page Down y Page Up un artículo por vez, sin dar la vuelta.",

    "demo.feed.label": "Actividad reciente",
    "demo.feed.author1": "María. Hace 2 horas",
    "demo.feed.body1": "Publicó el resumen del sprint.",
    "demo.feed.author2": "Diego. Hace 5 horas",
    "demo.feed.body2": "Comentó en el issue #482.",
    "demo.feed.author3": "Lucía. Ayer",
    "demo.feed.body3": "Cerró tres tickets del backlog.",
    "demo.feed.when1": "Hace 2 horas",
    "demo.feed.when2": "Hace 5 horas",
    "demo.feed.when3": "Ayer",
    "demo.feed.activity1": "Publicó el resumen del sprint y etiquetó la versión.",
    "demo.feed.activity2": "Comentó en el issue #482 sobre el foco del combobox.",
    "demo.feed.activity3": "Cerró tres tickets del backlog de accesibilidad.",
    "demo.feed.tagRelease": "Versión 2.4",
    "demo.feed.tagClosed": "3 cerrados",
    "demo.feed.loadingLabel": "Cargando más publicaciones",
    "demo.feed.streamLabel": "Novedades",
    "demo.feed.loadMore": "Cargar más",
    "demo.feed.commentsLabel": "Comentarios",
    "demo.feed.genericLabel": "Actualización",
    "demo.feed.fixedListLabel": "Pasos de publicación",
    "demo.feed.fixed1": "Preparar borrador",
    "demo.feed.fixed1Body": "Reunir el contenido.",
    "demo.feed.fixed2": "Revisar",
    "demo.feed.fixed2Body": "Comprobar los detalles.",
    "demo.feed.fixed3": "Publicar",
    "demo.feed.fixed3Body": "Compartir el resultado.",
    "demo.feed.commentAuthor1": "Paula",
    "demo.feed.commentAuthor2": "Tomás",
    "demo.feed.comment1": "Me pasó lo mismo con el lector de pantalla en Firefox.",
    "demo.feed.comment2": "Buenísimo el cambio, ahora el orden de lectura tiene sentido.",

    "feedPage.guidelinesLede": "Un feed crece mientras se lee; cada artículo tiene que valer por sí solo.",
  },
  en: {

    "feedPage.description": "A stream of independent posts that loads in batches.",

    "feedPage.a11yKeysNote": "WAI-ARIA recommends these keys but does not require them; they turn on with <code>keyboard</code>.",

    "feedPage.a11yYours2": "Use <code>setSize: -1</code> if you do not know the total; do not invent one.",

    "feedPage.a11yYours1": "It must have a <code>label</code>: the role has no name of its own.",

    "feedPage.a11yDoes3": "With <code>keyboard</code>, the articles join the Tab order.",

    "feedPage.a11yDoes2": 'With <code>busy</code>, the root announces <code>aria-busy="true"</code> and the reader waits for the new batch.',

    "feedPage.a11yDoes1": "Each article is an <code>article</code> with <code>aria-posinset</code> and <code>aria-setsize</code>, named by its label.",

    "feedPage.a11yIntro": "Feed follows the WAI-ARIA <code>feed</code> role.",

    "feedPage.content3": "Write the load-more button with what it brings: “Load more posts”.",

    "feedPage.content2": "Name the feed with <code>label</code>: “Recent activity”.",

    "feedPage.content1": "Use who posted and when as the article's label: “Ana, 2 h ago”.",

    "feedPage.dd.loading.dont": "Do not replace posts with a loading indicator when fetching more. People lose the context of what they were reading.",

    "feedPage.dd.loading.do": "Keep loaded posts visible and show the loading state at the end. People can keep reading while the next batch arrives.",

    "feedPage.dd.loading.title": "Loading: keep readable content visible",
    "feedPage.dd.fixed.title": "Fixed content: use a list, not a Feed",
    "feedPage.dd.fixed.do": "Use an ordered list for publishing steps. Their position indicates what comes before and what comes after.",
    "feedPage.dd.fixed.dont": "Do not present instructions as posts. Their order depends on the procedure, not on when they were published.",
    "feedPage.dd.labels.title": "Labels: identify each post",
    "feedPage.dd.labels.do": "Include the author and time in each label. They let people scan the feed and recognize a post without reading its entire body.",
    "feedPage.dd.labels.dont": "Do not repeat “Update” as the only label. It hides who posted and when, and gives every article the same name for people using a screen reader.",
    "feedPage.dd.order.title": "Recent activity: keep a chronological order",
    "feedPage.dd.order.do": "Order recent activity from newest to oldest. Each post's time makes the sequence clear and helps people find the latest updates.",
    "feedPage.dd.order.dont": "Do not mix yesterday's posts between today's without explaining a different ordering. People have to compare every timestamp to find what is new.",

    "feedPage.whenNot4": 'If the order is fixed rather than by publication: use <a href="/components/table">Table</a> or <a href="/components/list">List</a>.',

    "feedPage.whenNot3": 'If there are no posts yet: use <a href="/components/empty-state">EmptyState</a>.',

    "feedPage.whenNot2": 'For a conversation with nested replies: use <a href="/components/comment-thread">CommentThread</a>.',

    "feedPage.whenNot1": 'For a fixed list or a list of options: use <a href="/components/list">List</a> or <a href="/components/listbox">Listbox</a>.',

    "feedPage.when2": "When content arrives in batches, sometimes with no known end.",

    "feedPage.when1": "For content that is added as it is read: posts, activity, comments.",

    "feedPage.contract3": "Articles added later join the tab order on their own.",

    "feedPage.contract2": "The pattern's keyboard is optional (<code>keyboard</code>): each article joins the Tab order and Page Up and Page Down move between them.",

    "feedPage.contract1": "Position, total and name are markup: a Feed needs no JavaScript.",
    "feedPage.lede": "Feed shows a stream of independent posts that loads in batches: posts, activity, comments without replies. Each article states its position, and a screen reader knows how many there are and when more arrive.",
    "feedPage.test1": "Sets role=feed, names it, and reflects aria-busy.",
    "feedPage.anatomyBody": "The feed, the article and its label.",
    "feedPage.anatomyLabel": "Feed anatomy",
    "feedPage.anatomyPreviewLabel": "Feed, part by part",
    "feedPage.test2":
      "Each article gets role=article with aria-posinset/aria-setsize and a real labelled name.",
    "feedPage.test3": "Allows setSize=-1 for an undetermined total, per WAI's own allowance.",

    "feedPage.demoTitle": "Posts: the base case",
    "feedPage.demoBody": "Three text posts, each labelled with its author.",
    "feedPage.demoActivityTitle": "Activity: avatar, name and time",
    "feedPage.demoActivityBody": "The label takes a composition: an Avatar, the name and the time. The body carries a Tag.",
    "feedPage.demoBusyTitle": "Loading more: skeletons",
    "feedPage.demoBusyBody": "With <code>busy</code>, the root announces <code>aria-busy</code> while the next batch arrives, and the skeletons show where it will land.",
    "feedPage.demoInfiniteTitle": "Unknown total: an endless stream",
    "feedPage.demoInfiniteBody": "Each article declares <code>setSize: -1</code>, so the position is announced without inventing a total. The button appends the next batch.",
    "feedPage.demoInfiniteLabel": "Stream with a load-more button",
    "feedPage.demoCommentsTitle": "Comments: no nested replies",
    "feedPage.demoCommentsBody": 'Comments that are only read. If they have replies or votes, it is <a href="/components/comment-thread">CommentThread</a>.',
    "feedPage.keyboardPageDown": "Moves focus to the next article.",
    "feedPage.keyboardPageUp": "Moves focus to the previous article.",
    "feedPage.keyboardCtrlEnd": "Moves focus to the first focusable element after the feed.",
    "feedPage.keyboardCtrlHome": "Moves focus to the first focusable element before the feed.",
    "feedPage.test4": "Resolves Page Down and Page Up one article at a time, without wrapping.",

    "demo.feed.label": "Recent activity",
    "demo.feed.author1": "María. 2 hours ago",
    "demo.feed.body1": "Posted the sprint summary.",
    "demo.feed.author2": "Diego. 5 hours ago",
    "demo.feed.body2": "Commented on issue #482.",
    "demo.feed.author3": "Lucía. Yesterday",
    "demo.feed.body3": "Closed three backlog tickets.",
    "demo.feed.when1": "2 hours ago",
    "demo.feed.when2": "5 hours ago",
    "demo.feed.when3": "Yesterday",
    "demo.feed.activity1": "Posted the sprint summary and tagged the release.",
    "demo.feed.activity2": "Commented on issue #482 about combobox focus.",
    "demo.feed.activity3": "Closed three tickets from the accessibility backlog.",
    "demo.feed.tagRelease": "Release 2.4",
    "demo.feed.tagClosed": "3 closed",
    "demo.feed.loadingLabel": "Loading more posts",
    "demo.feed.streamLabel": "What's new",
    "demo.feed.loadMore": "Load more",
    "demo.feed.commentsLabel": "Comments",
    "demo.feed.genericLabel": "Update",
    "demo.feed.fixedListLabel": "Publishing steps",
    "demo.feed.fixed1": "Prepare draft",
    "demo.feed.fixed1Body": "Gather the content.",
    "demo.feed.fixed2": "Review",
    "demo.feed.fixed2Body": "Check the details.",
    "demo.feed.fixed3": "Publish",
    "demo.feed.fixed3Body": "Share the result.",
    "demo.feed.commentAuthor1": "Paula",
    "demo.feed.commentAuthor2": "Tomás",
    "demo.feed.comment1": "Same thing happened to me with the screen reader on Firefox.",
    "demo.feed.comment2": "Great change, the reading order finally makes sense.",

    "feedPage.guidelinesLede": "A feed grows as it is read; each article has to stand on its own.",
  },
} as const;
