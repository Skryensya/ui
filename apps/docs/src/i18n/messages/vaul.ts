export const vaulMessages = {
  es: {

    "vaulPage.description": "Abre un panel desde un borde de la pantalla, que en el teléfono se cierra arrastrándolo.",

    "vaulPage.key.tab": "Recorre los controles del panel, sin salir de él.",

    "vaulPage.key.escape": "Cierra el panel.",

    "vaulPage.a11yYours2": "Pon siempre un botón para cerrar: no todos pueden arrastrar.",

    "vaulPage.a11yYours1": "Nombra el diálogo con su título o un <code>aria-label</code>.",

    "vaulPage.a11yDoes3": "Con <code>prefers-reduced-motion</code>, entra sin desplazamiento.",

    "vaulPage.a11yDoes2": "<kbd>Esc</kbd> lo cierra; el arrastre tiene siempre otra forma de cerrar.",

    "vaulPage.a11yDoes1": "El foco queda dentro del panel y vuelve a lo que lo abrió al cerrar.",

    "vaulPage.a11yIntro": "Vaul es un <code>&lt;dialog&gt;</code> modal nativo.",

    "vaulPage.content2": "Pon la acción principal al final, al alcance del pulgar.",

    "vaulPage.content1": "Titula el panel con la tarea: «Compartir», «Filtros».",

    "vaulPage.whenNot3": 'Para un panel que convive con la página: usa <a href="/es/componentes/window">Window</a>.',

    "vaulPage.whenNot2": 'Para una navegación lateral: usa <a href="/es/componentes/drawer">Drawer</a>.',

    "vaulPage.whenNot1": 'Para una decisión en escritorio: usa <a href="/es/componentes/dialog">Dialog</a>.',

    "vaulPage.when2": "Cuando el contenido cabe en un panel y no necesita una página propia.",

    "vaulPage.when1": "En el teléfono, para una tarea corta que sale de la pantalla actual: compartir, filtrar, confirmar.",

    "vaulPage.guidelinesLede": "Un panel desde el borde deja ver de dónde vino la acción, a cambio de bloquear la página.",

    "vaulPage.contract4": '<a href="/es/componentes/drawer">Drawer</a> es el mismo Vaul pegado a un borde lateral.',

    "vaulPage.contract3": "En pantallas anchas, sobre <code>52rem</code>, no hay gesto ni handle: se cierra con <kbd>Esc</kbd> o un clic afuera.",

    "vaulPage.contract2": "Un gesto corto y rápido también cierra; tirar hacia adentro cede un poco y vuelve.",

    "vaulPage.contract1": "Es un <code>&lt;dialog&gt;</code> nativo: foco atrapado, <kbd>Esc</kbd>, fondo inerte y capa superior vienen del navegador.",
    "vaulPage.lede": 'Vaul abre un panel desde un borde de la pantalla: compartir un archivo, confirmar un borrado, filtrar resultados. En el teléfono entra desde abajo y se cierra arrastrándolo hacia afuera. Bloquea la página de atrás, como un <a href="/es/componentes/dialog">Dialog</a>.',
    "vaulPage.anatomyBody":
      "Este diagrama nombra el panel y el handle. El contenido es composición libre (no hay <code>sk-vaul__content</code>); el espécimen solo trae título y texto para que el panel se lea como panel. Está congelado y en flujo; los sheets vivos empiezan abajo.",
    "vaulPage.anatomyLabel": "Anatomía de Vaul",
    "vaulPage.anatomyPreviewLabel": "Vaul, parte por parte",
    "vaulPage.anatomyPanelLabel": "Panel de ejemplo",
    "vaulPage.anatomyTitle": "Hoja inferior",
    "vaulPage.anatomyBodyText": "El handle es el affordance del gesto; el resto lo compone quien lo usa.",
    "vaulPage.edgeTitle": "Borde: abajo, al inicio o al final",
    "vaulPage.edgeBody": "<code>data-edge</code> decide desde dónde entra. Los bordes laterales siguen la dirección del texto.",
    "vaulPage.dragTitle": "Arrastrar: con o sin gesto",
    "vaulPage.dragBody1": "Abrir es <code>showModal()</code> y cerrar, <code>close()</code>; el enhancer solo agrega el gesto de arrastrar.",
    "vaulPage.noDragLabel": "sin drag",
    "vaulPage.completeTitle": "Compartir: un flujo completo",
    "vaulPage.completeBody": "Cabecera, un interruptor, la lista de personas y las acciones. Arrastra el panel hacia abajo para cerrarlo.",
    "vaulPage.completeLabel": "Compartir archivo",
    "vaulPage.reactSnippetComment": "mismo contenido que el ejemplo Vanilla",
    "vaulPage.dragBody2":
      "El cierre usa distancia o velocidad: un flick corto también es intención. Un flick de vuelta gana aunque el panel haya viajado lejos.",
    "vaulPage.demoOpenLabel": "Compartir archivo",
    "vaulPage.demoTitle": "Propuesta comercial Q3",
    "vaulPage.demoMeta": "PDF · 2,4 MB · editado hace 2 h",
    "vaulPage.demoClose": "Cerrar",
    "vaulPage.demoShareToggle": "Cualquiera con el enlace puede ver",
    "vaulPage.demoPeopleLabel": "Personas con acceso",
    "vaulPage.demoOwner": "Dueña",
    "vaulPage.demoCanEdit": "Puede editar",
    "vaulPage.demoCanComment": "Puede comentar",
    "vaulPage.demoReadOnly": "Solo lectura",
    "vaulPage.demoInviteSent": "Invitación enviada",
    "vaulPage.demoDesignTeam": "Equipo de diseño",
    "vaulPage.demoDesignTeamMeta": "6 personas",
    "vaulPage.demoCancel": "Cancelar",
    "vaulPage.demoShare": "Compartir",
    "vaulPage.vanillaComment1": "Solo el drag. Abrir es showModal() y cerrar es close():",
    "vaulPage.vanillaComment2": "la modalidad es de la plataforma.",
    "vaulPage.vanillaComment3": "fracción del panel que hay que arrastrar",
    "vaulPage.vanillaComment4": "px/ms: un flick cierra sin cruzar la distancia",
    "vaulPage.noDragComment": "sin handle y sin drag: Vaul sigue completo",
    "vaulPage.test1": "Lleva las marcas de scope del enhancer en reposo.",
    "vaulPage.test2": "Dibuja el handle como decoración, siempre.",
    "vaulPage.test3": "Cierra con un drag lento que llega suficientemente lejos (solo distancia).",
    "vaulPage.test4": "Un flick rápido y corto cierra aunque la distancia sea pequeña.",
    "vaulPage.test5": "Un flick de vuelta a casa le gana a un drag largo: la dirección le gana a la distancia.",
    "vaulPage.examplesTitle": "Poco o mucho contenido: el alto lo da el contenido",
    "vaulPage.examplesBody": "Una confirmación de una línea y un formulario de filtros usan el mismo panel.",
    "vaulPage.deleteLabel": "Confirmar eliminación",
    "vaulPage.deleteOpenLabel": "Eliminar archivo",
    "vaulPage.deleteTitle": "¿Eliminar este archivo?",
    "vaulPage.deleteDesc":
      "Esta acción no se puede deshacer. El archivo se moverá a la papelera por 30 días.",
    "vaulPage.deleteCancel": "Cancelar",
    "vaulPage.deleteConfirm": "Eliminar",
    "vaulPage.filtersLabel": "Filtros de búsqueda",
    "vaulPage.filtersOpenLabel": "Filtros",
    "vaulPage.filtersTitle": "Filtros de búsqueda",
    "vaulPage.filtersSortLabel": "Ordenar por",
    "vaulPage.filtersSortRelevance": "Relevancia",
    "vaulPage.filtersSortPriceAsc": "Precio: menor a mayor",
    "vaulPage.filtersSortPriceDesc": "Precio: mayor a menor",
    "vaulPage.filtersSortRecent": "Más recientes",
    "vaulPage.filtersCategoryLabel": "Categoría",
    "vaulPage.filtersCategoryDesign": "Diseño",
    "vaulPage.filtersCategoryDev": "Desarrollo",
    "vaulPage.filtersCategoryResearch": "Investigación",
    "vaulPage.filtersCategoryStrategy": "Estrategia",
    "vaulPage.filtersCategoryContent": "Contenido",
    "vaulPage.filtersCategoryIllustration": "Ilustración",
    "vaulPage.filtersAvailabilityLabel": "Disponibilidad",
    "vaulPage.filtersAvailabilityStock": "En stock",
    "vaulPage.filtersAvailabilityShipping": "Envío gratis",
    "vaulPage.filtersClear": "Limpiar",
    "vaulPage.filtersApply": "Aplicar filtros",
  },
  en: {

    "vaulPage.description": "Opens a panel from an edge of the screen that, on a phone, closes by dragging it.",

    "vaulPage.key.tab": "Moves through the panel's controls, without leaving it.",

    "vaulPage.key.escape": "Closes the panel.",

    "vaulPage.a11yYours2": "Always include a close button: not everyone can drag.",

    "vaulPage.a11yYours1": "Name the dialog with its title or an <code>aria-label</code>.",

    "vaulPage.a11yDoes3": "With <code>prefers-reduced-motion</code>, it enters without travel.",

    "vaulPage.a11yDoes2": "<kbd>Esc</kbd> closes it; dragging always has another way to close.",

    "vaulPage.a11yDoes1": "Focus stays inside the panel and returns to what opened it on close.",

    "vaulPage.a11yIntro": "Vaul is a native modal <code>&lt;dialog&gt;</code>.",

    "vaulPage.content2": "Put the main action at the end, within thumb reach.",

    "vaulPage.content1": "Title the panel with the task: “Share”, “Filters”.",

    "vaulPage.whenNot3": 'For a panel that lives alongside the page: use <a href="/components/window">Window</a>.',

    "vaulPage.whenNot2": 'For side navigation: use <a href="/components/drawer">Drawer</a>.',

    "vaulPage.whenNot1": 'For a decision on desktop: use <a href="/components/dialog">Dialog</a>.',

    "vaulPage.when2": "When the content fits a panel and needs no page of its own.",

    "vaulPage.when1": "On a phone, for a short task off the current screen: share, filter, confirm.",

    "vaulPage.guidelinesLede": "A panel from the edge shows where the action came from, at the cost of blocking the page.",

    "vaulPage.contract4": '<a href="/components/drawer">Drawer</a> is the same Vaul attached to a side edge.',

    "vaulPage.contract3": "On wide screens, above <code>52rem</code>, there is no gesture or handle: it closes with <kbd>Esc</kbd> or a click outside.",

    "vaulPage.contract2": "A short, quick flick also closes it; pulling inward gives a little and springs back.",

    "vaulPage.contract1": "It is a native <code>&lt;dialog&gt;</code>: focus trap, <kbd>Esc</kbd>, inert backdrop and top layer come from the browser.",
    "vaulPage.lede": 'Vaul opens a panel from an edge of the screen: sharing a file, confirming a deletion, filtering results. On a phone it comes up from the bottom and closes by dragging it away. It blocks the page behind, like a <a href="/components/dialog">Dialog</a>.',
    "vaulPage.anatomyBody":
      "This diagram names the panel and the handle. Content is free-form composition (there is no <code>sk-vaul__content</code>); the specimen only carries a title and a line of text so the panel reads as a panel. It is frozen and in flow; the live sheets start below.",
    "vaulPage.anatomyLabel": "Vaul anatomy",
    "vaulPage.anatomyPreviewLabel": "Vaul, part by part",
    "vaulPage.anatomyPanelLabel": "Example panel",
    "vaulPage.anatomyTitle": "Bottom sheet",
    "vaulPage.anatomyBodyText": "The handle is the gesture affordance; the rest is the consumer's composition.",
    "vaulPage.edgeTitle": "Edge: bottom, start or end",
    "vaulPage.edgeBody": "<code>data-edge</code> decides where it enters from. Side edges follow the text direction.",
    "vaulPage.dragTitle": "Drag: with or without the gesture",
    "vaulPage.dragBody1": "Opening is <code>showModal()</code> and closing <code>close()</code>; the enhancer only adds the drag gesture.",
    "vaulPage.noDragLabel": "no drag",
    "vaulPage.completeTitle": "Share: a complete flow",
    "vaulPage.completeBody": "A header, a switch, the list of people and the actions. Drag the panel down to close it.",
    "vaulPage.completeLabel": "Share file",
    "vaulPage.reactSnippetComment": "same content as the Vanilla example",
    "vaulPage.dragBody2":
      "Dismissal uses distance or velocity: a short flick is intent too. A flick back home wins even after the panel has travelled far.",
    "vaulPage.demoOpenLabel": "Share file",
    "vaulPage.demoTitle": "Q3 commercial proposal",
    "vaulPage.demoMeta": "PDF · 2.4 MB · edited 2h ago",
    "vaulPage.demoClose": "Close",
    "vaulPage.demoShareToggle": "Anyone with the link can view",
    "vaulPage.demoPeopleLabel": "People with access",
    "vaulPage.demoOwner": "Owner",
    "vaulPage.demoCanEdit": "Can edit",
    "vaulPage.demoCanComment": "Can comment",
    "vaulPage.demoReadOnly": "Read-only",
    "vaulPage.demoInviteSent": "Invite sent",
    "vaulPage.demoDesignTeam": "Design team",
    "vaulPage.demoDesignTeamMeta": "6 people",
    "vaulPage.demoCancel": "Cancel",
    "vaulPage.demoShare": "Share",
    "vaulPage.vanillaComment1": "Just the drag. Opening is showModal() and closing is close():",
    "vaulPage.vanillaComment2": "modality belongs to the platform.",
    "vaulPage.vanillaComment3": "fraction of the panel that has to be dragged",
    "vaulPage.vanillaComment4": "px/ms: a flick closes without crossing the distance",
    "vaulPage.noDragComment": "no handle and no drag: Vaul is still complete",
    "vaulPage.test1": "Carries the enhancer's scope markers at rest.",
    "vaulPage.test2": "Draws the handle as decoration, always.",
    "vaulPage.test3": "Dismisses on a slow drag that travels far enough (distance alone).",
    "vaulPage.test4": "A fast, short flick closes it even when the distance is small.",
    "vaulPage.test5": "A flick back home overrules a far drag: direction beats distance.",
    "vaulPage.examplesTitle": "Little or much content: the content sets the height",
    "vaulPage.examplesBody": "A one-line confirmation and a filters form use the same panel.",
    "vaulPage.deleteLabel": "Confirm deletion",
    "vaulPage.deleteOpenLabel": "Delete file",
    "vaulPage.deleteTitle": "Delete this file?",
    "vaulPage.deleteDesc": "This cannot be undone. The file moves to trash for 30 days.",
    "vaulPage.deleteCancel": "Cancel",
    "vaulPage.deleteConfirm": "Delete",
    "vaulPage.filtersLabel": "Search filters",
    "vaulPage.filtersOpenLabel": "Filters",
    "vaulPage.filtersTitle": "Search filters",
    "vaulPage.filtersSortLabel": "Sort by",
    "vaulPage.filtersSortRelevance": "Relevance",
    "vaulPage.filtersSortPriceAsc": "Price: low to high",
    "vaulPage.filtersSortPriceDesc": "Price: high to low",
    "vaulPage.filtersSortRecent": "Most recent",
    "vaulPage.filtersCategoryLabel": "Category",
    "vaulPage.filtersCategoryDesign": "Design",
    "vaulPage.filtersCategoryDev": "Development",
    "vaulPage.filtersCategoryResearch": "Research",
    "vaulPage.filtersCategoryStrategy": "Strategy",
    "vaulPage.filtersCategoryContent": "Content",
    "vaulPage.filtersCategoryIllustration": "Illustration",
    "vaulPage.filtersAvailabilityLabel": "Availability",
    "vaulPage.filtersAvailabilityStock": "In stock",
    "vaulPage.filtersAvailabilityShipping": "Free shipping",
    "vaulPage.filtersClear": "Clear",
    "vaulPage.filtersApply": "Apply filters",
  },
} as const;
