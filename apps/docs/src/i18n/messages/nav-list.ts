export const navListMessages = {
  es: {
    "demo.navList.productLabel": "Navegación de producto",
    "demo.navList.groupWork": "Trabajo",
    "demo.navList.groupOperate": "Operar",
    "demo.navList.dashboard": "Panel",
    "demo.navList.inbox": "Bandeja",
    "demo.navList.customers": "Clientes",
    "demo.navList.allCustomers": "Todos los clientes",
    "demo.navList.segments": "Segmentos",
    "demo.navList.automations": "Automatizaciones",
    "demo.navList.settings": "Ajustes",
    "demo.navList.horizontalLabel": "Principal",
    "demo.navList.overview": "Resumen",
    "demo.navList.projects": "Proyectos",
    "demo.navList.reports": "Reportes",
    "demo.navList.team": "Equipo",
    "demo.navList.collapsibleNavLabel": "Navegación de documentación",
    "demo.navList.docs": "Documentación",
    "demo.navList.start": "Empezar",
    "demo.navList.components": "Componentes",
    "demo.navList.tokens": "Tokens",
    "demo.navList.account": "Cuenta",
    "demo.navList.profile": "Perfil",
    "demo.navList.billing": "Facturación",

    "navListPage.description": "Lista los destinos de una navegación y marca en cuál estás.",

    "navListPage.a11yYours2": "Un conteo debe decir de qué es: «3 sin leer».",

    "navListPage.a11yYours1": "Si hay más de una navegación, nombra cada una con <code>aria-label</code>.",

    "navListPage.a11yDoes2": "Un grupo que se pliega es un botón con <code>aria-expanded</code>.",

    "navListPage.a11yDoes1": 'La página actual se anuncia con <code>aria-current="page"</code>.',

    "navListPage.a11yIntro": "NavList es un <code>&lt;nav&gt;</code> con enlaces nativos.",

    "navListPage.content2": "Titula los grupos con el tema, no con «Otros».",

    "navListPage.content1": "Nombra cada destino con 1 o 2 palabras: «Clientes», «Automatizaciones».",

    "navListPage.whenNot3": 'Para el índice de la página: usa <a href="/es/componentes/toc">Toc</a>.',

    "navListPage.whenNot2": 'Para el camino hasta la página actual: usa <a href="/es/componentes/breadcrumb">Breadcrumb</a>.',

    "navListPage.whenNot1": 'Para acciones: usa <a href="/es/componentes/menu">Menu</a>.',

    "navListPage.when2": "Cuando conviene agrupar los destinos por tema.",

    "navListPage.when1": "Para los destinos de una barra lateral, una barra superior o un panel.",

    "navListPage.contract3": "Es el mismo patrón que usan Sidebar, Navbar y Drawer.",

    "navListPage.contract2": 'La página actual lleva <code>aria-current="page"</code>, que la marca.',

    "navListPage.contract1": "Cada NavList es un <code>&lt;nav&gt;</code>; cada grupo emite su <code>&lt;ul&gt;</code>.",
    "navListPage.lede": "NavList lista los destinos de una navegación y marca en cuál estás: las secciones de un producto en una barra lateral, las páginas de un sitio en la barra superior, un menú en un panel. Son enlaces, no acciones.",
    "navListPage.anatomyBody":
      "Este diagrama nombra el landmark, el grupo, la lista y cada parte del enlace. El espécimen está congelado; las navegaciones vivas empiezan abajo.",
    "navListPage.anatomyLabel": "Anatomía de NavList",
    "navListPage.anatomyPreviewLabel": "NavList, parte por parte",
    "navListPage.productTitle": "Un producto: grupos, conteos y subpáginas",
    "navListPage.productBody": "Secciones agrupadas, un conteo de pendientes y una subpágina que marca a su padre como actual.",
    "navListPage.horizontalTitle": "En fila: una barra superior",
    "navListPage.horizontalBody": "El mismo patrón en horizontal; sin íconos cuando el texto basta.",
    "navListPage.disclosureTitle": "Grupos que se pliegan: una documentación larga",
    "navListPage.disclosureBody": "El título de un grupo puede abrir y cerrar sus enlaces. Siguen siendo enlaces, no un menú.",
    "navListPage.installIntro": "Importa el pattern donde el host vaya a renderizar la navegación.",
    "navListPage.test1": 'Es un landmark <code>navigation</code> con nombre y una lista de enlaces etiquetada; el enlace actual lleva <code>aria-current="page"</code>.',
    "navListPage.test2": 'Los enlaces de destino no fingen semántica de menú: no hay <code>role="menu"</code> ni <code>aria-current</code> donde no corresponde.',
    "navListPage.test3": "Un grupo colapsable es un <code>&lt;button&gt;</code> con <code>aria-expanded</code>/<code>aria-controls</code>, abierto por defecto.",
    "navListPage.test4": "El clic alterna <code>aria-expanded</code> y el estado <code>hidden</code> de la lista.",
    "navListPage.test5": "Escape cierra el grupo abierto desde cualquier punto adentro y devuelve el foco al trigger.",
    "navListPage.test6": "Un grupo anidado dentro de un enlace vive en el mismo <code>&lt;li&gt;</code>, independiente del grupo padre.",
    "navListPage.test7": "<code>defaultOpen={false}</code> arranca cerrado.",
    "navListPage.test8": "Al montar genera un id y cablea <code>aria-controls</code> a la lista.",
    "navListPage.test9": "Respeta un id escrito a mano en vez de generar uno segundo.",
    "navListPage.test10": "El clic alterna <code>aria-expanded</code> y el <code>hidden</code> de la lista.",
    "navListPage.test11": 'Arranca oculto si se autora con <code>aria-expanded="false"</code>.',
    "navListPage.test12": "Enter/Espacio lo alternan: comportamiento nativo del <code>&lt;button&gt;</code>, no algo que el enhancer cablee.",
    "navListPage.test13": "Escape cierra el grupo abierto desde adentro y devuelve el foco al trigger.",
    "navListPage.test14": "Escape no hace nada cuando el grupo ya está cerrado.",
    "navListPage.test15": "Cablea el grupo anidado de un enlace de forma independiente del grupo padre (el trigger externo encuentra su propia <code>&lt;ul&gt;</code>, no la de adentro).",
    "navListPage.prop.orientation.title": "Orientation: columna o fila",
    "navListPage.prop.orientation.body": "Pone los destinos en columna o en fila.",
    "navListPage.prop.orientation.vertical": "Usa <code>vertical</code>, el valor por defecto, en una barra lateral.",
    "navListPage.prop.orientation.horizontal": "Usa <code>horizontal</code> en una barra superior, con pocos destinos.",
    "navListPage.guidelinesLede": "Una lista de destinos dice dónde estás y adónde puedes ir.",
  },
  en: {
    "demo.navList.productLabel": "Product navigation",
    "demo.navList.groupWork": "Work",
    "demo.navList.groupOperate": "Operate",
    "demo.navList.dashboard": "Dashboard",
    "demo.navList.inbox": "Inbox",
    "demo.navList.customers": "Customers",
    "demo.navList.allCustomers": "All customers",
    "demo.navList.segments": "Segments",
    "demo.navList.automations": "Automations",
    "demo.navList.settings": "Settings",
    "demo.navList.horizontalLabel": "Primary",
    "demo.navList.overview": "Overview",
    "demo.navList.projects": "Projects",
    "demo.navList.reports": "Reports",
    "demo.navList.team": "Team",
    "demo.navList.collapsibleNavLabel": "Documentation navigation",
    "demo.navList.docs": "Documentation",
    "demo.navList.start": "Start",
    "demo.navList.components": "Components",
    "demo.navList.tokens": "Tokens",
    "demo.navList.account": "Account",
    "demo.navList.profile": "Profile",
    "demo.navList.billing": "Billing",

    "navListPage.description": "Lists a navigation's destinations and marks which one you are on.",

    "navListPage.a11yYours2": "A count must say what it counts: “3 unread”.",

    "navListPage.a11yYours1": "If there is more than one navigation, name each with <code>aria-label</code>.",

    "navListPage.a11yDoes2": "A collapsible group is a button with <code>aria-expanded</code>.",

    "navListPage.a11yDoes1": 'The current page is announced with <code>aria-current="page"</code>.',

    "navListPage.a11yIntro": "NavList is a <code>&lt;nav&gt;</code> with native links.",

    "navListPage.content2": "Title groups by topic, not “Other”.",

    "navListPage.content1": "Name each destination in 1 or 2 words: “Customers”, “Automations”.",

    "navListPage.whenNot3": 'For the page\'s index: use <a href="/components/toc">Toc</a>.',

    "navListPage.whenNot2": 'For the path to the current page: use <a href="/components/breadcrumb">Breadcrumb</a>.',

    "navListPage.whenNot1": 'For actions: use <a href="/components/menu">Menu</a>.',

    "navListPage.when2": "When grouping destinations by topic helps.",

    "navListPage.when1": "For the destinations of a sidebar, a top bar or a panel.",

    "navListPage.contract3": "It is the same pattern Sidebar, Navbar and Drawer use.",

    "navListPage.contract2": 'The current page carries <code>aria-current="page"</code>, which marks it.',

    "navListPage.contract1": "Each NavList is a <code>&lt;nav&gt;</code>; each group emits its <code>&lt;ul&gt;</code>.",
    "navListPage.lede": "NavList lists a navigation's destinations and marks which one you are on: a product's sections in a sidebar, a site's pages in the top bar, a menu in a panel. They are links, not actions.",
    "navListPage.anatomyBody":
      "This diagram names the landmark, the group, the list, and each part of the link. The specimen is frozen; the live navigations start below.",
    "navListPage.anatomyLabel": "NavList anatomy",
    "navListPage.anatomyPreviewLabel": "NavList, part by part",
    "navListPage.productTitle": "A product: groups, counts and subpages",
    "navListPage.productBody": "Grouped sections, a pending count and a subpage that marks its parent as current.",
    "navListPage.horizontalTitle": "In a row: a top bar",
    "navListPage.horizontalBody": "The same pattern laid horizontally; no icons when the text is enough.",
    "navListPage.disclosureTitle": "Collapsible groups: long documentation",
    "navListPage.disclosureBody": "A group's title can open and close its links. They are still links, not a menu.",
    "navListPage.installIntro": "Import the pattern wherever the host renders navigation.",
    "navListPage.test1": 'It is a named <code>navigation</code> landmark with a labelled list of links; the current link carries <code>aria-current="page"</code>.',
    "navListPage.test2": 'Destination links don\'t fake menu semantics: no <code>role="menu"</code>, no <code>aria-current</code> where it doesn\'t belong.',
    "navListPage.test3": "A collapsible group is a <code>&lt;button&gt;</code> with <code>aria-expanded</code>/<code>aria-controls</code>, open by default.",
    "navListPage.test4": "Clicking toggles <code>aria-expanded</code> and the list's <code>hidden</code> state.",
    "navListPage.test5": "Escape closes the open group from anywhere inside it and returns focus to the trigger.",
    "navListPage.test6": "A group nested inside a link lives in the same <code>&lt;li&gt;</code>, independent of the parent group.",
    "navListPage.test7": "<code>defaultOpen={false}</code> starts closed.",
    "navListPage.test8": "On mount it generates an id and wires <code>aria-controls</code> to the list.",
    "navListPage.test9": "It preserves an authored id instead of generating a second one.",
    "navListPage.test10": "Clicking toggles <code>aria-expanded</code> and the list's <code>hidden</code> state.",
    "navListPage.test11": 'It starts hidden when authored with <code>aria-expanded="false"</code>.',
    "navListPage.test12": "Enter/Space toggle it: native <code>&lt;button&gt;</code> behavior, nothing the enhancer wires itself.",
    "navListPage.test13": "Escape closes the open group from inside it and returns focus to the trigger.",
    "navListPage.test14": "Escape does nothing when the group is already closed.",
    "navListPage.test15": "It wires a link's own nested group independently of its parent group (the outer trigger finds its own <code>&lt;ul&gt;</code>, not the nested one).",
    "navListPage.prop.orientation.title": "Orientation: column or row",
    "navListPage.prop.orientation.body": "Lays destinations in a column or a row.",
    "navListPage.prop.orientation.vertical": "Use <code>vertical</code>, the default, in a sidebar.",
    "navListPage.prop.orientation.horizontal": "Use <code>horizontal</code> in a top bar, with a few destinations.",
    "navListPage.guidelinesLede": "A list of destinations says where you are and where you can go.",
  },
} as const;
