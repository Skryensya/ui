export const drawerMessages = {
  es: {
    "drawer.anatomyLabel": "Anatomía de Drawer",
    "drawer.anatomyPreviewLabel": "Drawer, parte por parte",
    "drawer.anatomyBody": "La raíz y el tirador de Vaul, con <code>sk-drawer</code> para pintarlo como panel lateral. El contenido es tuyo.",
    "drawer.anatomyPanelLabel": "Navegación",
    "drawer.anatomyTitle": "Tu cuenta",
    "drawer.anatomyBodyText": "Perfil, seguridad y notificaciones.",

    "demo.drawer.label": "Navegación",
    "demo.drawer.brand": "Estudio",
    "demo.drawer.close": "Cerrar",
    "demo.drawer.filters": "Filtros de búsqueda",
    "demo.drawer.genericPanel": "Panel",
    "demo.drawer.nameBody": "Ajusta los filtros para acotar los resultados.",
    "demo.drawer.decisionTitle": "¿Eliminar este archivo?",
    "demo.drawer.decisionBody": "Se eliminará de forma permanente.",
    "demo.drawer.decisionCancel": "Cancelar",
    "demo.drawer.decisionConfirm": "Eliminar",
    "demo.drawer.main": "Principal",
    "demo.drawer.work": "Trabajo",
    "demo.drawer.account": "Cuenta",
    "demo.drawer.summary": "Resumen",
    "demo.drawer.agenda": "Agenda",
    "demo.drawer.files": "Archivos",
    "demo.drawer.team": "Equipo",
    "demo.drawer.settings": "Ajustes",
    "demo.drawer.userName": "Ada Kovač",
    "demo.drawer.pageTitle": "Resumen del proyecto",
    "demo.drawer.pageCard": "Actividad reciente",
    "demo.drawer.pageCardBody": "3 tareas actualizadas",

    "drawer.description": "Un panel que entra desde el costado, a lo alto de la pantalla, y tapa la página hasta que se cierra.",

    "drawer.a11yKeyEsc": "Cierra el panel y devuelve el foco.",

    "drawer.a11yKeyTab": "Recorre los controles del panel.",

    "drawer.a11yYours2": "Da un botón de cerrar visible: arrastrar no es la única forma de salir.",

    "drawer.a11yYours1": "Nombra el panel con <code>aria-labelledby</code> apuntando a su título.",

    "drawer.a11yDoes4": "El tirador no se anuncia si no hay arrastre.",

    "drawer.a11yDoes3": "Escape lo cierra.",

    "drawer.a11yDoes2": "La página detrás queda <code>inert</code>.",

    "drawer.a11yDoes1": "Al abrir, el foco entra al panel; al cerrar, vuelve a lo que lo abrió.",

    "drawer.a11yIntro": "Drawer es un <code>&lt;dialog&gt;</code> modal: la plataforma maneja el foco y la página inerte.",

    "drawer.content3": "Da al botón de cerrar solo ícono un <code>aria-label</code>: «Cerrar».",

    "drawer.content2": "Nombra el botón que lo abre por lo que abre: «Abrir menú», «Filtros».",

    "drawer.content1": "Pon un título que diga qué hay en el panel: «Filtros», «Tu cuenta».",

    "drawer.whenNot4": 'Si no bloquea el resto de la pantalla: usa <a href="/es/componentes/popover">Popover</a>.',

    "drawer.whenNot3": 'Para un riel permanente que no tapa la página: usa <a href="/es/componentes/sidebar">Sidebar</a>.',

    "drawer.whenNot2": 'Para una hoja que sube desde abajo en móvil: usa la opción Vaul de <a href="/es/componentes/dialog">Dialog</a>.',

    "drawer.whenNot1": 'Para una decisión corta: usa <a href="/es/componentes/dialog">Dialog</a>, centrado y con título.',

    "drawer.when2": "Para el detalle de un elemento que se revisa sin salir de la lista.",

    "drawer.when1": "Para navegación o filtros al costado, a lo alto, en pantallas angostas.",

    "drawer.contract4": "Sin <code>data-sk-vaul</code>, el auto-loader no monta nada: el enhancer solo hace falta para arrastrar y para cerrar tocando fuera.",

    "drawer.contract3": "No trae estructura: encabezado, navegación y pie son tu composición. Afina el panel con los hooks <code>--sk-drawer-*</code>.",

    "drawer.contract2": "El tirador es opcional: sin él no hay arrastre, y el drawer sigue funcionando.",

    "drawer.contract1": "La raíz es un <code>&lt;dialog&gt;</code> nativo con <code>sk-vaul sk-drawer</code> y su <code>data-edge</code>.",

    "drawer.exampleBody": "Encabezado fijo, navegación con scroll propio y la cuenta abajo. Ábrelo y arrástralo hacia el borde para cerrarlo.",

    "drawer.exampleTitle": "Navegación: el menú de una app en móvil",
    "drawer.lede": 'Drawer es un panel que entra desde el costado, a lo alto de la pantalla, para una tarea que descansa en un borde: navegación en móvil, filtros, detalles de un elemento. Tapa la página hasta que se cierra; se cierra con Escape, tocando fuera o arrastrándolo. Es un <a href="/es/vaul">Vaul</a> en el borde inline.',
    "drawer.nativeTitle": "Nativo: sin JavaScript extra",
    "drawer.nativeLede": 'El mismo <code>&lt;dialog class="sk-vaul sk-drawer"&gt;</code> sin <code>data-sk-vaul</code>, abierto con <code>showModal()</code>. Sin arrastre, pero con Escape, foco y fondo del navegador.',
    "drawer.nativeLabel": "Drawer nativo",
    "drawer.compositionComment": "un drawer ES un Vaul",
    "drawer.compositionComment2": "toca tres bordes del viewport: un radio ahí se lee como\n     un error",
    "drawer.demoOpenLabel": "Abrir drawer nativo",
    "drawer.demoPanelTitle": "Panel nativo",
    "drawer.demoPanelBody": "La plataforma posee modalidad, foco, Escape y restauración.",
    "drawer.demoCloseLabel": "Cerrar",
    "drawer.demoAriaLabel": "Drawer nativo de ejemplo",
    "drawer.test1": "Agrega el modificador de drawer solo para la firma de drawer.",
    "drawer.guidelinesLede": "Un drawer mantiene a mano algo que no cabe en la pantalla, sin sacar a la persona de donde está.",
    "drawer.dd.close.title": "Cierre: ofrece un control visible",
    "drawer.dd.close.do": "El botón de cerrar es fácil de encontrar; arrastrar queda como alternativa.",
    "drawer.dd.close.dont": "No dependas del gesto de arrastre como única forma de salir.",
    "drawer.dd.name.title": "Nombre: identifica qué contiene el panel",
    "drawer.dd.name.do": "«Filtros de búsqueda» describe el propósito del panel.",
    "drawer.dd.name.dont": "«Panel» no ayuda a entender qué hay dentro.",
    "drawer.dd.decision.title": "Decisión breve: usa Dialog, no Drawer",
    "drawer.dd.decision.do": "Una confirmación puntual encaja en un diálogo centrado.",
    "drawer.dd.decision.dont": "Un panel lateral de pantalla completa es excesivo para una decisión breve."
  },
  en: {
    "drawer.anatomyLabel": "Drawer anatomy",
    "drawer.anatomyPreviewLabel": "Drawer, part by part",
    "drawer.anatomyBody": "Vaul's root and handle, with <code>sk-drawer</code> to paint it as a side panel. The content is yours.",
    "drawer.anatomyPanelLabel": "Navigation",
    "drawer.anatomyTitle": "Your account",
    "drawer.anatomyBodyText": "Profile, security and notifications.",

    "demo.drawer.label": "Navigation",
    "demo.drawer.brand": "Estudio",
    "demo.drawer.close": "Close",
    "demo.drawer.filters": "Search filters",
    "demo.drawer.genericPanel": "Panel",
    "demo.drawer.nameBody": "Adjust filters to narrow the results.",
    "demo.drawer.decisionTitle": "Delete this file?",
    "demo.drawer.decisionBody": "It will be permanently deleted.",
    "demo.drawer.decisionCancel": "Cancel",
    "demo.drawer.decisionConfirm": "Delete",
    "demo.drawer.main": "Main",
    "demo.drawer.work": "Work",
    "demo.drawer.account": "Account",
    "demo.drawer.summary": "Overview",
    "demo.drawer.agenda": "Agenda",
    "demo.drawer.files": "Files",
    "demo.drawer.team": "Team",
    "demo.drawer.settings": "Settings",
    "demo.drawer.userName": "Ada Kovač",
    "demo.drawer.pageTitle": "Project overview",
    "demo.drawer.pageCard": "Recent activity",
    "demo.drawer.pageCardBody": "3 tasks updated",

    "drawer.description": "A panel that slides in from the side, full height, and covers the page until it closes.",

    "drawer.a11yKeyEsc": "Closes the panel and returns focus.",

    "drawer.a11yKeyTab": "Moves through the panel's controls.",

    "drawer.a11yYours2": "Give a visible close button: dragging is not the only way out.",

    "drawer.a11yYours1": "Name the panel with <code>aria-labelledby</code> pointing to its title.",

    "drawer.a11yDoes4": "The handle is not announced when there is no dragging.",

    "drawer.a11yDoes3": "Escape closes it.",

    "drawer.a11yDoes2": "The page behind is <code>inert</code>.",

    "drawer.a11yDoes1": "On open, focus enters the panel; on close, it returns to what opened it.",

    "drawer.a11yIntro": "Drawer is a modal <code>&lt;dialog&gt;</code>: the platform handles focus and the inert page.",

    "drawer.content3": "Give the icon-only close button an <code>aria-label</code>: “Close”.",

    "drawer.content2": "Name the button that opens it by what it opens: “Open menu”, “Filters”.",

    "drawer.content1": "Give it a title that says what is in the panel: “Filters”, “Your account”.",

    "drawer.whenNot4": 'If it does not block the rest of the screen: use <a href="/components/popover">Popover</a>.',

    "drawer.whenNot3": 'For a permanent rail that does not cover the page: use <a href="/components/sidebar">Sidebar</a>.',

    "drawer.whenNot2": 'For a sheet sliding up from the bottom on mobile: use <a href="/components/dialog">Dialog</a>\'s Vaul option.',

    "drawer.whenNot1": 'For a short decision: use <a href="/components/dialog">Dialog</a>, centered and titled.',

    "drawer.when2": "For an item's details, reviewed without leaving the list.",

    "drawer.when1": "For side navigation or filters, full height, on narrow screens.",

    "drawer.contract4": "Without <code>data-sk-vaul</code>, the auto-loader mounts nothing: the enhancer is only needed for dragging and tap-outside dismissal.",

    "drawer.contract3": "It ships no structure: header, navigation and footer are your composition. Tune the panel with the <code>--sk-drawer-*</code> hooks.",

    "drawer.contract2": "The handle is optional: without it there is no dragging, and the drawer still works.",

    "drawer.contract1": "The root is a native <code>&lt;dialog&gt;</code> with <code>sk-vaul sk-drawer</code> and its <code>data-edge</code>.",

    "drawer.exampleBody": "A fixed header, navigation with its own scroll and the account at the bottom. Open it and drag it toward the edge to close it.",

    "drawer.exampleTitle": "Navigation: an app's menu on mobile",
    "drawer.lede": 'Drawer is a panel that slides in from the side, full height, for a task that rests on an edge: mobile navigation, filters, an item\'s details. It covers the page until it closes; it closes with Escape, a tap outside or a drag. It is a <a href="/vaul">Vaul</a> on the inline edge.',
    "drawer.nativeTitle": "Native: no extra JavaScript",
    "drawer.nativeLede": 'The same <code>&lt;dialog class="sk-vaul sk-drawer"&gt;</code> without <code>data-sk-vaul</code>, opened with <code>showModal()</code>. No dragging, but the browser\'s Escape, focus and backdrop.',
    "drawer.nativeLabel": "Native drawer",
    "drawer.compositionComment": "a drawer IS a Vaul",
    "drawer.compositionComment2": "touches three edges of the viewport: a radius there\n     reads as a bug",
    "drawer.demoOpenLabel": "Open native drawer",
    "drawer.demoPanelTitle": "Native panel",
    "drawer.demoPanelBody": "The platform owns modality, focus, Escape and restoration.",
    "drawer.demoCloseLabel": "Close",
    "drawer.demoAriaLabel": "Example native drawer",
    "drawer.test1": "Adds the drawer modifier only for the drawer signature.",
    "drawer.guidelinesLede": "A drawer keeps at hand something that does not fit on screen, without taking people away from where they are.",
    "drawer.dd.close.title": "Dismissal: provide a visible control",
    "drawer.dd.close.do": "The close button is easy to find; dragging remains an alternative.",
    "drawer.dd.close.dont": "Do not make dragging the only way out.",
    "drawer.dd.name.title": "Name: identify what the panel contains",
    "drawer.dd.name.do": "“Search filters” describes the panel's purpose.",
    "drawer.dd.name.dont": "“Panel” does not help people understand what is inside.",
    "drawer.dd.decision.title": "Brief decision: use Dialog, not Drawer",
    "drawer.dd.decision.do": "A one-off confirmation belongs in a centered dialog.",
    "drawer.dd.decision.dont": "A full-height side panel is excessive for a brief decision."
  },
} as const;
