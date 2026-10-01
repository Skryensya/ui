export const carouselMessages = {
  es: {
    "demo.carousel.label": "Novedades",
    "demo.carousel.productivity.eyebrow": "Productividad",
    "demo.carousel.productivity.title": "Búsqueda",
    "demo.carousel.productivity.body":
      "Encuentra cualquier proyecto al instante, con atajos y filtros vivos.",
    "demo.carousel.context.eyebrow": "Contexto",
    "demo.carousel.context.title": "Actividad",
    "demo.carousel.context.body":
      "Seis meses de cambios en una línea de tiempo que no pierde el hilo.",
    "demo.carousel.analytics.eyebrow": "Analítica",
    "demo.carousel.analytics.title": "Informes",
    "demo.carousel.analytics.body":
      "Cohortes, exportación programada y métricas que caben en una card.",
    "demo.carousel.collaboration.eyebrow": "Colaboración",
    "demo.carousel.collaboration.title": "Equipo",
    "demo.carousel.collaboration.body":
      "Invita, asigna roles y comparte espacios sin salir del flujo.",
    "demo.carousel.readMore": "Leer más",
    "demo.carousel.focusLabel": "Novedades, con enlace en cada tarjeta",
    "demo.carousel.team.label": "Equipo",
    "demo.carousel.person.first.role": "Plataforma",
    "demo.carousel.person.second.role": "Compiladores",
    "demo.carousel.person.third.role": "Redes",
    "demo.carousel.person.fourth.role": "Genética",
    "demo.carousel.person.fifth.role": "Recuperación",

    "demo.carousel.nativeLabel": "Novedades (sin JS)",

    "carousel.description": "Muestra una fila de elementos parecidos que no entran a lo ancho, con el siguiente asomando.",

    "carousel.a11yKeyTab": "Recorre los botones, los puntos y el contenido de los slides.",

    "carousel.a11yKeyHomeEnd": "Va a la primera o a la última página.",

    "carousel.a11yKeyArrows": "Con el foco en la pista o en los puntos, pasa a la página anterior o siguiente.",

    "carousel.a11yYours3": "Si usas <code>autoplay</code>, deja al menos 5 segundos por página.",

    "carousel.a11yYours2": "No pongas en un slide lo único que la persona necesita para seguir: puede no verlo.",

    "carousel.a11yYours1": "Debe tener <code>aria-label</code>.",

    "carousel.a11yDoes4": "El desplazamiento suave se apaga con <code>prefers-reduced-motion</code>.",

    "carousel.a11yDoes3": "Con <code>autoplay</code> hay un botón de pausa (WCAG 2.2, 2.2.2), y la rotación se detiene con el foco o el mouse dentro del carrusel. Con <code>prefers-reduced-motion</code> no arranca sola.",

    "carousel.a11yDoes2": "Los botones anterior y siguiente tienen nombre y se deshabilitan en los extremos.",

    "carousel.a11yDoes1": 'Cada slide es un <code>role="group"</code> con su posición («2 de 4»).',

    "carousel.a11yIntro": "Carousel sigue el patrón de carrusel de la APG.",

    "carousel.content3": "Da a cada tarjeta un título propio, no «Diapositiva 1».",

    "carousel.content2": "Pon lo importante en la primera tarjeta: puede que nadie llegue a la tercera.",

    "carousel.content1": "Nombra el carrusel con <code>aria-label</code>: «Novedades», «Equipo».",

    "carousel.dd.few.dont": "Dos tarjetas que ya entran quedan detrás de botones sin motivo.",

    "carousel.dd.few.do": "Cuatro tarjetas en un ancho para dos: la siguiente asoma y la persona sabe que hay más.",

    "carousel.dd.few.title": "Cantidad: solo si no entran",

    "carousel.whenNot4": 'Para elementos que se leen en orden: usa <a href="/es/componentes/list">List</a>.',

    "carousel.whenNot3": 'Para un mensaje que rota solo, como un banner: se lee poco y molesta. Usa un <a href="/es/componentes/callout">Callout</a> fijo.',

    "carousel.whenNot2": 'Si son pocos y entran: muéstralos todos con <a href="/es/componentes/grid">Grid</a> o <a href="/es/componentes/inline">Inline</a>.',

    "carousel.whenNot1": 'Si el contenido importa y no puede depender de que alguien deslice: usa <a href="/es/componentes/grid">Grid</a>.',

    "carousel.when2": "Cuando conviene mostrar que hay más, con el siguiente asomando.",

    "carousel.when1": "Para muchos elementos parecidos cuando el ancho solo alcanza para algunos: tarjetas, fotos, perfiles.",

    "carousel.contract4": 'El arrastre con mouse viene activado; <code>mouseDrag="off"</code> lo apaga cuando el texto de los slides debe poder seleccionarse.',

    "carousel.contract3": "Hay un punto por página medida, no por slide: los últimos slides pueden compartir la última parada.",

    "carousel.contract2": "<code>--sk-carousel-slide-size</code> fija el ancho de cada slide, con y sin JavaScript.",

    "carousel.contract1": 'La raíz es un <code>section</code> con una pista de slides; cada slide es un <code>role="group"</code>, no un ítem de lista.',

    "carousel.prop.controls.none": "Usa <code>none</code> cuando la pista sola alcanza, como una fila corta en un teléfono. El teclado y el arrastre siguen funcionando.",

    "carousel.prop.controls.auto": "Usa <code>auto</code> casi siempre: da una forma de avanzar sin arrastrar.",

    "carousel.prop.controls.body": "Decide si se dibujan los botones anterior y siguiente y los puntos de página.",

    "carousel.prop.controls.title": "Controls: con botones o solo deslizar",
    "carousel.lede": "Carousel muestra una fila de elementos parecidos (tarjetas, fotos, perfiles) cuando no entran todos a lo ancho, con el siguiente asomando para decir que hay más. La pista es un scroller nativo con puntos de anclaje; los botones y los puntos se agregan encima, y sin JavaScript la plataforma dibuja los suyos.",
    "carousel.anatomyBody": "Pista, slide, botones, puntos y, con <code>autoplay</code>, el botón de pausa.",
    "carousel.anatomyLabel": "Anatomía de Carousel",
    "carousel.anatomyPreviewLabel": "Carousel, parte por parte",
    "carousel.cardsTitle": "Tarjetas: la siguiente asoma",
    "carousel.cardsBody": "Cada slide es una card con imagen. Los botones se deshabilitan en los extremos y hay un punto por página, no por slide.",
    "carousel.multiTitle": "Varias por página, con avance automático",
    "carousel.multiBody1": "Slides más angostos entran varios por página. Con <code>autoplay</code> aparece un botón de pausa, y la rotación se detiene al pasar el mouse o llevar el foco al carrusel.",
    "carousel.multiNote": "Avatar + meta · data-loop · data-autoplay",
    "carousel.focusTitle": "Contenido con foco: pausa la rotación",
    "carousel.focusBody1": "Cada tarjeta tiene un enlace. Llevar el foco a cualquier parte del carrusel, no solo a los botones, pausa el avance automático.",
    "carousel.bareTitle": "Sin controles: la pista sola",
    "carousel.bareBody1": '<code>controls="none"</code> deja la pista con sus puntos de anclaje. Cada slide es una parada, así que deslizar nunca se salta una.',
    "carousel.nativeTitle": "Sin JavaScript: controles nativos",
    "carousel.nativeBody": "El mismo markup sin montar: los pseudo-elementos <code>::scroll-button</code> y <code>::scroll-marker</code> dibujan los controles. Hoy funciona en Chrome y Edge; en el resto queda un scroller con anclaje.",
    "carousel.nativeLabel": "Sin JS (CSS nativo)",
    "carousel.nativeNote": "iconos del set + scroll buttons nativos",
    "carousel.nativeCssLabel": "la base sin JS",
    "carousel.apiTitle": "Ir a una página: eventos",
    "carousel.apiBody": "Envía <code>sk:carouselgoto</code> para ir a una página y escucha <code>sk:carouselchange</code> para saber cuál está activa. En React, el <code>ref</code> expone <code>snapTo(index)</code>.",
    "carousel.nativeCssComment1": "cero JS: la plataforma dibuja los controles",
    "carousel.nativeCssComment2": "Anterior",
    "carousel.nativeCssComment3": "Siguiente",
    "carousel.nativeCssComment4": "la fila de dots",
    "carousel.nativeCssComment5":
      "Las cajas de ::scroll-button se maquetan después del scroller, en el\n   flujo del padre. El grid de 3 columnas les reserva los extremos.",
    "carousel.bootstrapComment": "corre la máquina en cada [data-sk-carousel]",
    "carousel.apiComment1": "anclar a una página (0-based): el mismo comando que envía snapTo() del ref de React",
    "carousel.apiComment2": "leer la página activa cada vez que cambia (swipe, rueda, botón, tecla, arrastre o goto)",
    "carousel.apiComment3": "{ index, count }  ← count son PÁGINAS medidas, no slides",
    "carousel.test1": "Renderiza una región <code>section</code> con una pista de slides con scroll-snap.",
    "carousel.test2": "Nombra la región y cada slide para la tecnología de asistencia.",
    "carousel.test3": "Dibuja un punto por página MEDIDA, no uno por slide.",
    "carousel.test4": "Se ancla a un punto y reporta la página en el evento de cambio.",
    "carousel.test5":
      "El foco en el ENLACE de una tarjeta (no solo en los botones prev/next) pausa el autoplay, y lo retoma al perderlo.",
    "carousel.guidelinesLede": "Un carrusel muestra que hay más al costado sin ocupar más alto.",
  },
  en: {
    "demo.carousel.label": "What's new",
    "demo.carousel.productivity.eyebrow": "Productivity",
    "demo.carousel.productivity.title": "Search",
    "demo.carousel.productivity.body":
      "Find any project instantly, with shortcuts and live filters.",
    "demo.carousel.context.eyebrow": "Context",
    "demo.carousel.context.title": "Activity",
    "demo.carousel.context.body":
      "Six months of changes in a timeline that keeps its thread.",
    "demo.carousel.analytics.eyebrow": "Analytics",
    "demo.carousel.analytics.title": "Reports",
    "demo.carousel.analytics.body":
      "Cohorts, scheduled exports, and metrics that fit in one card.",
    "demo.carousel.collaboration.eyebrow": "Collaboration",
    "demo.carousel.collaboration.title": "Team",
    "demo.carousel.collaboration.body":
      "Invite, assign roles, and share spaces without leaving the flow.",
    "demo.carousel.readMore": "Read more",
    "demo.carousel.focusLabel": "What's new, with a link on every card",
    "demo.carousel.team.label": "Team",
    "demo.carousel.person.first.role": "Platform",
    "demo.carousel.person.second.role": "Compilers",
    "demo.carousel.person.third.role": "Networks",
    "demo.carousel.person.fourth.role": "Genetics",
    "demo.carousel.person.fifth.role": "Retrieval",

    "demo.carousel.nativeLabel": "News (no JS)",

    "carousel.description": "Shows a row of similar items that do not fit across, with the next one peeking in.",

    "carousel.a11yKeyTab": "Moves through the buttons, the dots and the slides' content.",

    "carousel.a11yKeyHomeEnd": "Goes to the first or last page.",

    "carousel.a11yKeyArrows": "With focus on the track or the dots, goes to the previous or next page.",

    "carousel.a11yYours3": "If you use <code>autoplay</code>, allow at least 5 seconds per page.",

    "carousel.a11yYours2": "Do not put in a slide the only thing people need to move on: they may never see it.",

    "carousel.a11yYours1": "It must have an <code>aria-label</code>.",

    "carousel.a11yDoes4": "Smooth scrolling turns off with <code>prefers-reduced-motion</code>.",

    "carousel.a11yDoes3": "With <code>autoplay</code> there is a pause button (WCAG 2.2, 2.2.2), and rotation stops with focus or the mouse inside. With <code>prefers-reduced-motion</code> it does not start on its own.",

    "carousel.a11yDoes2": "The previous and next buttons are named and disable at the ends.",

    "carousel.a11yDoes1": 'Each slide is a <code>role="group"</code> with its position (“2 of 4”).',

    "carousel.a11yIntro": "Carousel follows the APG carousel pattern.",

    "carousel.content3": "Give each card its own title, not “Slide 1”.",

    "carousel.content2": "Put what matters in the first card: nobody may reach the third.",

    "carousel.content1": "Name the carousel with <code>aria-label</code>: “What's new”, “Team”.",

    "carousel.dd.few.dont": "Two cards that already fit end up behind buttons for no reason.",

    "carousel.dd.few.do": "Four cards in room for two: the next peeks in and people know there is more.",

    "carousel.dd.few.title": "Count: only when they do not fit",

    "carousel.whenNot4": 'For items read in order: use <a href="/components/list">List</a>.',

    "carousel.whenNot3": 'For a message that rotates on its own, like a banner: it is little read and much disliked. Use a fixed <a href="/components/callout">Callout</a>.',

    "carousel.whenNot2": 'If there are few and they fit: show them all with <a href="/components/grid">Grid</a> or <a href="/components/inline">Inline</a>.',

    "carousel.whenNot1": 'If the content matters and cannot depend on someone swiping: use <a href="/components/grid">Grid</a>.',

    "carousel.when2": "When it helps to show there is more, with the next one peeking in.",

    "carousel.when1": "For many similar items when the width fits only a few: cards, photos, profiles.",

    "carousel.contract4": 'Mouse dragging is on; <code>mouseDrag="off"</code> turns it off when the slides\' text must be selectable.',

    "carousel.contract3": "There is one dot per measured page, not per slide: the last slides can share the final stop.",

    "carousel.contract2": "<code>--sk-carousel-slide-size</code> sets each slide's width, with and without JavaScript.",

    "carousel.contract1": 'The root is a <code>section</code> holding a track of slides; each slide is a <code>role="group"</code>, not a list item.',

    "carousel.prop.controls.none": "Use <code>none</code> when the track alone is enough, like a short row on a phone. Keyboard and dragging still work.",

    "carousel.prop.controls.auto": "Use <code>auto</code> almost always: it gives a way forward without dragging.",

    "carousel.prop.controls.body": "Sets whether the previous and next buttons and the page dots are drawn.",

    "carousel.prop.controls.title": "Controls: buttons or swipe only",
    "carousel.lede": "Carousel shows a row of similar items (cards, photos, profiles) when they do not all fit across, with the next one peeking in to say there is more. The track is a native scroller with snap points; buttons and dots are added on top, and without JavaScript the platform draws its own.",
    "carousel.anatomyBody": "Track, slide, buttons, dots and, with <code>autoplay</code>, the pause button.",
    "carousel.anatomyLabel": "Carousel anatomy",
    "carousel.anatomyPreviewLabel": "Carousel, part by part",
    "carousel.cardsTitle": "Cards: the next one peeks in",
    "carousel.cardsBody": "Each slide is a card with an image. The buttons disable at the ends and there is one dot per page, not per slide.",
    "carousel.multiTitle": "Several per page, with autoplay",
    "carousel.multiBody1": "Narrower slides fit several per page. With <code>autoplay</code> a pause button appears, and rotation stops when the mouse or focus is inside the carousel.",
    "carousel.multiNote": "Avatar + meta · data-loop · data-autoplay",
    "carousel.focusTitle": "Focusable content: it pauses rotation",
    "carousel.focusBody1": "Each card has a link. Moving focus anywhere in the carousel, not only to the buttons, pauses autoplay.",
    "carousel.bareTitle": "No controls: the track alone",
    "carousel.bareBody1": '<code>controls="none"</code> leaves the track with its snap points. Each slide is a stop, so swiping never skips one.',
    "carousel.nativeTitle": "No JavaScript: native controls",
    "carousel.nativeBody": "The same markup, not mounted: the <code>::scroll-button</code> and <code>::scroll-marker</code> pseudo-elements draw the controls. It works today in Chrome and Edge; elsewhere it is a snapping scroller.",
    "carousel.nativeLabel": "No JS (native CSS)",
    "carousel.nativeNote": "set icons + native scroll buttons",
    "carousel.nativeCssLabel": "the JS-free base",
    "carousel.apiTitle": "Go to a page: events",
    "carousel.apiBody": "Dispatch <code>sk:carouselgoto</code> to go to a page and listen for <code>sk:carouselchange</code> to know which is active. In React, the <code>ref</code> exposes <code>snapTo(index)</code>.",
    "carousel.nativeCssComment1": "zero JS: the platform draws the controls",
    "carousel.nativeCssComment2": "Previous",
    "carousel.nativeCssComment3": "Next",
    "carousel.nativeCssComment4": "the dot row",
    "carousel.nativeCssComment5":
      "The ::scroll-button boxes are laid out after the scroller, in the\n   parent's flow. The 3-column grid reserves the ends for them.",
    "carousel.bootstrapComment": "runs the machine on every [data-sk-carousel]",
    "carousel.apiComment1": "pin to a page (0-based): the same command snapTo() sends from the React ref",
    "carousel.apiComment2": "read the active page every time it changes (swipe, wheel, button, key, drag or goto)",
    "carousel.apiComment3": "{ index, count } ← count is measured PAGES, not slides",
    "carousel.test1": "Renders a <code>section</code> region with a scroll-snap track of slides.",
    "carousel.test2": "Names the region and every slide for assistive tech.",
    "carousel.test3": "Draws one dot per MEASURED page, not one per slide.",
    "carousel.test4": "Snaps to a dot and reports the page on the change event.",
    "carousel.test5":
      "Focus landing on a card's LINK (not just the prev/next buttons) pauses autoplay, and resumes it on blur.",
    "carousel.guidelinesLede": "A carousel shows there is more to the side without taking more height.",
  },
} as const;
