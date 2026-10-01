export const sidebarMessages = {
  es: {
    "demo.sidebar.collapse": "Contraer navegación",
    "demo.sidebar.nav": "Principal",
    "demo.sidebar.workspace": "Espacio",
    "demo.sidebar.home": "Inicio",
    "demo.sidebar.reports": "Reportes",
    "demo.sidebar.content": "El contenido de la app va aquí.",
    "demo.sidebar.resize": "Cambiar el ancho de la navegación",
    "demo.sidebar.files": "Archivos del proyecto",
    "demo.sidebar.explorer": "Explorador",
    "demo.sidebar.longFile": "informe-anual-consolidado.md",
    "demo.sidebar.resizeContent": "Arrastra el borde de la barra. El nombre que no entra se corta con puntos suspensivos; nunca aparece un scroll horizontal.",

    "sidebarPage.description": "Pone la navegación principal de una aplicación al costado, y se contrae a un riel de íconos.",

    "sidebarPage.key.reset": "Con el foco en el borde, vuelve al ancho inicial.",

    "sidebarPage.key.homeEnd": "Lleva el ancho al mínimo o al máximo.",

    "sidebarPage.key.arrows": "Con el foco en el borde, cambia el ancho; con <kbd>Shift</kbd>, más rápido.",

    "sidebarPage.key.toggle": "Contrae o expande, con el foco en el botón.",

    "sidebarPage.a11yYours2": "Pon la lista de destinos en un <code>&lt;nav&gt;</code> con nombre.",

    "sidebarPage.a11yYours1": "El botón de contraer solo muestra un ícono: dale <code>aria-label</code>.",

    "sidebarPage.a11yDoes3": "El borde que se arrastra es un <code>separator</code> con teclado.",

    "sidebarPage.a11yDoes2": "Contraído, cada ícono conserva su nombre.",

    "sidebarPage.a11yDoes1": "El botón anuncia <code>aria-expanded</code> y <code>aria-controls</code>.",

    "sidebarPage.a11yIntro": "Sidebar es un <code>&lt;aside&gt;</code> con un botón de contraer y, si quieres, un separador que se arrastra.",

    "sidebarPage.content3": "Agrupa los destinos con un título por grupo cuando pasan de siete.",

    "sidebarPage.content2": "Dale a cada destino un ícono distinto: contraído, es lo único que se ve.",

    "sidebarPage.content1": "Nombra cada destino con 1 o 2 palabras: se leen también como tooltip del riel.",

    "sidebarPage.whenNot3": 'Para el índice de una página: usa <a href="/es/componentes/toc">Toc</a>.',

    "sidebarPage.whenNot2": 'Para un panel que aparece sobre el contenido y se cierra al elegir: usa <a href="/es/componentes/drawer">Drawer</a>.',

    "sidebarPage.whenNot1": 'Para un sitio de contenido con pocas secciones: usa <a href="/es/componentes/navbar">Navbar</a>.',

    "sidebarPage.when2": "Cuando conviene ver dónde estás y adónde ir durante toda la sesión.",

    "sidebarPage.when1": "Para la navegación principal de una aplicación con muchas secciones.",

    "sidebarPage.contract4": "<code>collapsed</code> o <code>defaultCollapsed</code>, con <code>onCollapsedChange</code> para guardar la preferencia; guardarla es de la app.",

    "sidebarPage.contract3": "El ancho es un hook, <code>--sk-sidebar-inline-size</code>, acotado por <code>--sk-sidebar-min-inline-size</code> y <code>--sk-sidebar-max-inline-size</code>.",

    "sidebarPage.contract2": "Contraído, las etiquetas se desvanecen pero siguen en el DOM: nombran los íconos para el lector de pantalla.",

    "sidebarPage.contract1": "Tiene header, un medio que se desplaza y footer; lo que va adentro es tuyo.",

    "sidebarPage.collapseTitle": "Contraer: un riel de íconos",
    "sidebarPage.lede": 'Sidebar pone la navegación principal de una aplicación al costado, a la vista durante toda la sesión. Se contrae a un riel de íconos para dar lugar al contenido, sin esconderse. Adentro va una lista de destinos (<a href="/es/nav-list">NavList</a>), un árbol o lo que la app necesite.',
    "sidebarPage.anatomyBody":
      "Este diagrama nombra header, content, footer y el control de colapso. El espécimen está congelado; los sidebars vivos empiezan abajo.",
    "sidebarPage.anatomyLabel": "Anatomía de Sidebar",
    "sidebarPage.anatomyPreviewLabel": "Sidebar, parte por parte",
    "sidebarPage.collapseBody": "El botón lo contrae a un riel; los destinos siguen ahí, como íconos con nombre.",
    "sidebarPage.widthTitle": "Ancho ajustable: arrastrar el borde",
    "sidebarPage.widthBody1": 'Con un <code>SidebarResizeHandle</code> adentro, el borde se arrastra o se mueve con las flechas. Doble clic vuelve al ancho inicial. Aquí lleva un <a href="/es/componentes/tree-view">TreeView</a>, cuyo ancho justo nadie sabe de antemano.',
    "sidebarPage.resizableLabel": "Sidebar redimensionable",
    "sidebarPage.floatingTriggerTitle": "Botón flotante: en la esquina del panel",
    "sidebarPage.floatingTriggerBody": "<code>floating</code> sube el botón de contraer a la esquina superior del panel.",
    "sidebarPage.vanillaInitTitle": "Inicializar vanilla",
    "sidebarPage.iconsComment": "Los iconos se autoran como placeholders <span data-sk-icon>;\nmountIcons los reemplaza por el <svg> del set enlazado.",
    "sidebarPage.test1": "Colapsa en modo no controlado y reporta el cambio.",
    "sidebarPage.test2": "El trigger apunta al contenido que controla.",
    "sidebarPage.test3":
      "Escribe el estado colapsado, emite el cambio, y la limpieza remueve los listeners.",
    "sidebarPage.test4": "Escribe la propiedad de ancho mientras se arrastra, y solo mientras se arrastra.",
    "sidebarPage.test5": "Restaura un ancho guardado al montar, y deja intacto un sidebar sin clave.",
    "sidebarPage.guidelinesLede": "Una navegación al costado muestra todas las secciones sin abrir nada, a cambio de ancho.",
  },
  en: {
    "demo.sidebar.collapse": "Collapse navigation",
    "demo.sidebar.nav": "Primary",
    "demo.sidebar.workspace": "Workspace",
    "demo.sidebar.home": "Home",
    "demo.sidebar.reports": "Reports",
    "demo.sidebar.content": "The content of the app goes here.",
    "demo.sidebar.resize": "Resize the navigation",
    "demo.sidebar.files": "Project files",
    "demo.sidebar.explorer": "Explorer",
    "demo.sidebar.longFile": "consolidated-annual-report.md",
    "demo.sidebar.resizeContent": "Drag the panel edge. A name that does not fit is truncated with an ellipsis; a horizontal scrollbar never appears.",

    "sidebarPage.description": "Puts an application's main navigation on the side, and collapses to an icon rail.",

    "sidebarPage.key.reset": "With focus on the edge, returns to the initial width.",

    "sidebarPage.key.homeEnd": "Takes the width to the minimum or maximum.",

    "sidebarPage.key.arrows": "With focus on the edge, changes the width; with <kbd>Shift</kbd>, faster.",

    "sidebarPage.key.toggle": "Collapses or expands, with focus on the button.",

    "sidebarPage.a11yYours2": "Put the destinations list in a named <code>&lt;nav&gt;</code>.",

    "sidebarPage.a11yYours1": "The collapse button shows only an icon: give it an <code>aria-label</code>.",

    "sidebarPage.a11yDoes3": "The draggable edge is a <code>separator</code> with a keyboard.",

    "sidebarPage.a11yDoes2": "Collapsed, each icon keeps its name.",

    "sidebarPage.a11yDoes1": "The button announces <code>aria-expanded</code> and <code>aria-controls</code>.",

    "sidebarPage.a11yIntro": "Sidebar is an <code>&lt;aside&gt;</code> with a collapse button and, optionally, a draggable separator.",

    "sidebarPage.content3": "Group destinations under a title per group when there are more than seven.",

    "sidebarPage.content2": "Give each destination a distinct icon: collapsed, it is all that shows.",

    "sidebarPage.content1": "Name each destination in 1 or 2 words: they also read as the rail's tooltip.",

    "sidebarPage.whenNot3": 'For a page\'s index: use <a href="/components/toc">Toc</a>.',

    "sidebarPage.whenNot2": 'For a panel that appears over content and closes on choosing: use <a href="/components/drawer">Drawer</a>.',

    "sidebarPage.whenNot1": 'For a content site with a few sections: use <a href="/components/navbar">Navbar</a>.',

    "sidebarPage.when2": "When seeing where you are and where to go helps for the whole session.",

    "sidebarPage.when1": "For an application's main navigation with many sections.",

    "sidebarPage.contract4": "<code>collapsed</code> or <code>defaultCollapsed</code>, with <code>onCollapsedChange</code> to save the preference; saving it is the app's job.",

    "sidebarPage.contract3": "The width is a hook, <code>--sk-sidebar-inline-size</code>, bounded by <code>--sk-sidebar-min-inline-size</code> and <code>--sk-sidebar-max-inline-size</code>.",

    "sidebarPage.contract2": "Collapsed, the labels fade but stay in the DOM: they name the icons for the screen reader.",

    "sidebarPage.contract1": "It has a header, a scrolling middle and a footer; what goes inside is yours.",

    "sidebarPage.collapseTitle": "Collapse: an icon rail",
    "sidebarPage.lede": 'Sidebar puts an application\'s main navigation on the side, in view for the whole session. It collapses to an icon rail to make room for content, without hiding. Inside goes a list of destinations (<a href="/nav-list">NavList</a>), a tree or whatever the app needs.',
    "sidebarPage.anatomyBody":
      "This diagram names the header, content, footer, and collapse control. The specimen is frozen; the live sidebars start below.",
    "sidebarPage.anatomyLabel": "Sidebar anatomy",
    "sidebarPage.anatomyPreviewLabel": "Sidebar, part by part",
    "sidebarPage.collapseBody": "The button collapses it to a rail; the destinations stay, as named icons.",
    "sidebarPage.widthTitle": "Adjustable width: drag the edge",
    "sidebarPage.widthBody1": 'With a <code>SidebarResizeHandle</code> inside, the edge is dragged or moved with the arrows. Double-click returns to the initial width. Here it holds a <a href="/components/tree-view">TreeView</a>, whose right width nobody knows in advance.',
    "sidebarPage.resizableLabel": "Resizable sidebar",
    "sidebarPage.floatingTriggerTitle": "Floating button: in the panel's corner",
    "sidebarPage.floatingTriggerBody": "<code>floating</code> lifts the collapse button to the panel's top corner.",
    "sidebarPage.vanillaInitTitle": "Initializing vanilla",
    "sidebarPage.iconsComment": "Icons are authored as <span data-sk-icon> placeholders;\nmountIcons replaces them with the <svg> of the linked set.",
    "sidebarPage.test1": "Collapses uncontrolled and reports the change.",
    "sidebarPage.test2": "Points the trigger at the content it controls.",
    "sidebarPage.test3": "Writes collapsed state, emits the change, and cleanup removes listeners.",
    "sidebarPage.test4": "Writes the width property while dragging, and only while dragging.",
    "sidebarPage.test5": "Restores a stored width on mount, and leaves an unkeyed sidebar alone.",
    "sidebarPage.guidelinesLede": "Side navigation shows every section without opening anything, at the cost of width.",
  },
} as const;
