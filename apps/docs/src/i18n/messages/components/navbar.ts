export const navbarMessages = {
  es: {
    "demo.navbar.nav": "Principal",
    "demo.navbar.home": "Inicio",
    "demo.navbar.projects": "Proyectos",
    "demo.navbar.reports": "Reportes",
    "demo.navbar.team": "Equipo",
    "demo.navbar.invite": "Invitar",
    "demo.navbar.newProject": "Nuevo proyecto",
    "demo.navbar.signIn": "Iniciar sesión",
    "demo.navbar.getStarted": "Empezar",
    "demo.navbar.search": "Buscar",
    "demo.navbar.settings": "Configuración",

    "navbarPage.description": "Pone arriba de todo la marca, la navegación principal y las acciones.",

    "navbarPage.a11yYours3": 'Pon un <a href="/es/componentes/skip-link">SkipLink</a> antes, para saltar al contenido.',

    "navbarPage.a11yYours2": "Cada acción de solo ícono debe tener <code>aria-label</code>.",

    "navbarPage.a11yYours1": 'Nombra el <code>&lt;nav&gt;</code> si hay más de uno: <code>aria-label="Principal"</code>.',

    "navbarPage.a11yDoes2": 'El enlace con <code>aria-current="page"</code> se marca y se anuncia como página actual.',

    "navbarPage.a11yDoes1": "Los enlaces y los botones son nativos, con su foco y su teclado.",

    "navbarPage.a11yIntro": "Navbar es un <code>&lt;header&gt;</code> con un <code>&lt;nav&gt;</code> dentro.",

    "navbarPage.content3": "Haz que la marca lleve al inicio.",

    "navbarPage.content2": "Deja cinco secciones o menos; el resto va en otra navegación.",

    "navbarPage.content1": "Nombra cada sección con 1 o 2 palabras: «Proyectos», «Reportes».",

    "navbarPage.whenNot3": 'Para las acciones de una vista, no del sitio: usa <a href="/es/componentes/app-bar">AppBar</a> o <a href="/es/componentes/toolbar">Toolbar</a>.',

    "navbarPage.whenNot2": 'Si cada categoría abre un panel de varias columnas: usa <a href="/es/componentes/megamenu">Megamenu</a>.',

    "navbarPage.whenNot1": 'Si la navegación va al costado: usa <a href="/es/componentes/sidebar">Sidebar</a>.',

    "navbarPage.when2": "Cuando las acciones globales (buscar, la cuenta) deben estar siempre a mano.",

    "navbarPage.when1": "Para la cabecera de un sitio o una aplicación con pocas secciones.",

    "navbarPage.contract4": "La superficie son cuatro hooks: <code>--sk-navbar-bg</code>, <code>--sk-navbar-wash</code>, <code>--sk-navbar-elevation</code> y <code>--sk-navbar-border-color</code>.",

    "navbarPage.contract3": 'La página actual se marca con <code>aria-current="page"</code>, que ya tienes que escribir para los lectores de pantalla.',

    "navbarPage.contract2": "Los enlaces son el pattern NavList en horizontal, el mismo que Sidebar pone en vertical.",

    "navbarPage.contract1": "Es un <code>&lt;header&gt;</code> con enlaces y botones nativos; no necesita JavaScript.",
    "navbarPage.lede": 'Navbar es la barra de arriba de un sitio o una aplicación: la marca a la izquierda, la navegación principal y las acciones, como buscar o la cuenta. Los enlaces son un <a href="/es/nav-list">NavList</a> horizontal.',
    "navbarPage.anatomyBody":
      "Este diagrama nombra el brand, la nav huésped y las actions. El espécimen está congelado; los Navbar vivos empiezan abajo.",
    "navbarPage.anatomyLabel": "Anatomía de Navbar",
    "navbarPage.anatomyPreviewLabel": "Navbar, parte por parte",
    "navbarPage.linksTitle": "Sitio: marca, secciones y una acción",
    "navbarPage.linksBody": 'La página actual lleva <code>aria-current="page"</code> y se marca sola.',
    "navbarPage.bareTitle": "Sin superficie: sobre una portada",
    "navbarPage.bareBody": "La barra sin fondo ni sombra, para ir sobre un Hero o una imagen.",
    "navbarPage.appTitle": "Aplicación: herramientas y cuenta",
    "navbarPage.appBody": "En una aplicación web, las acciones son íconos con nombre accesible y la cuenta cierra la fila. Para los menús de una aplicación de escritorio (Archivo, Editar) está la <a href=\"/es/componentes/app-bar\">AppBar</a>, que no es una variante de esta barra.",
    "navbarPage.test1": "Usa un landmark <code>header</code> y deja la navegación a su hijo NavList.",
    "demo.navbar.dd.tryFree": "Probar gratis",
    "demo.navbar.dd.pricing": "Precios",
    "demo.navbar.dd.blog": "Blog",
    "demo.navbar.dd.docs": "Docs",
    "demo.navbar.dd.contact": "Contacto",
    "demo.navbar.dd.longBrand": "Atlas: la plataforma para tu equipo",
    "navbarPage.megaTitle": "Con un megamenú",
    "navbarPage.megaBody": 'Cuando hay demasiadas secciones para una fila, el guest puede ser un <a href="/es/componentes/megamenu">Megamenu</a>: abre un panel contra la barra.',
    "navbarPage.dd.actions.title": "Acciones de la barra",
    "navbarPage.dd.actions.do": "Una acción principal y las demás en silencio.",
    "navbarPage.dd.actions.dont": "Tres botones llamativos: ninguno es el principal.",
    "navbarPage.dd.links.title": "Cuántas secciones",
    "navbarPage.dd.links.do": "Unas pocas secciones, las que se buscan desde cualquier parte.",
    "navbarPage.dd.links.dont": "Todo el sitio en una fila: no caben y se cortan. Agrupa en un megamenú o un pie de página.",
    "navbarPage.dd.brand.title": "La marca",
    "navbarPage.dd.brand.do": "El nombre del producto, nada más.",
    "navbarPage.dd.brand.dont": "Un eslogan como marca: le quita el sitio a los enlaces.",
    "navbarPage.appearanceTitle": "Appearance: cómo se dibuja la barra",
    "navbarPage.appearanceBody": "Plain, brutalist o frosted: la misma barra con otra superficie. No cambia el espacio ni el orden.",
    "navbarPage.appearance.plain": "Plain, el valor por defecto: superficie con una sombra suave.",
    "navbarPage.appearance.brutalist": "Brutalist: borde negro y una sombra dura, sin degradado.",
    "navbarPage.appearance.frosted": "Frosted: material translúcido sobre lo que pasa por detrás de la barra.",
    "navbarPage.layoutTitle": "Distribución: dónde va cada región",
    "navbarPage.layoutBody": "La barra no tiene una opción de distribución: es una fila y lo demás es CSS. Cada variante pone un <code>data-layout</code> en la barra y una regla que lo lee.",
    "navbarPage.layout.start": "Al lado",
    "navbarPage.layout.centered": "Centrados",
    "navbarPage.layout.brand-center": "Marca al centro",
    "navbarPage.layout.minimal": "Sin enlaces",
    "navbarPage.layoutLabel": "Distribución de la barra",
    "navbarPage.layoutExplain.start": "Lo habitual: la marca, los enlaces pegados a ella y las acciones al final.",
    "navbarPage.layoutExplain.centered": "Los enlaces se centran entre la marca y las acciones: <code>margin-inline: auto</code> en la lista.",
    "navbarPage.layoutExplain.brand-center": "La marca en medio, con los enlaces a un lado y las acciones al otro: una rejilla de tres pistas.",
    "navbarPage.layoutExplain.minimal": "Solo marca y acciones, para una página que no navega: un acceso, un registro.",
    "navbarPage.megaAppTitle": "Megamenú y cuenta",
    "navbarPage.megaAppBody": "El megamenú lleva los destinos; las acciones de la derecha son herramientas y la cuenta.",
    "navbarPage.guidelinesLede": "La barra de arriba se ve en todas las páginas: lleva lo que se busca desde cualquier parte.",
  },
  en: {
    "demo.navbar.nav": "Primary",
    "demo.navbar.home": "Home",
    "demo.navbar.projects": "Projects",
    "demo.navbar.reports": "Reports",
    "demo.navbar.team": "Team",
    "demo.navbar.invite": "Invite",
    "demo.navbar.newProject": "New project",
    "demo.navbar.signIn": "Sign in",
    "demo.navbar.getStarted": "Get started",
    "demo.navbar.search": "Search",
    "demo.navbar.settings": "Settings",

    "navbarPage.description": "Puts the brand, the main navigation and the actions at the very top.",

    "navbarPage.a11yYours3": 'Put a <a href="/components/skip-link">SkipLink</a> before it, to jump to the content.',

    "navbarPage.a11yYours2": "Each icon-only action must have an <code>aria-label</code>.",

    "navbarPage.a11yYours1": 'Name the <code>&lt;nav&gt;</code> if there is more than one: <code>aria-label="Main"</code>.',

    "navbarPage.a11yDoes2": 'The link with <code>aria-current="page"</code> is marked and announced as the current page.',

    "navbarPage.a11yDoes1": "Links and buttons are native, with their focus and keyboard.",

    "navbarPage.a11yIntro": "Navbar is a <code>&lt;header&gt;</code> with a <code>&lt;nav&gt;</code> inside.",

    "navbarPage.content3": "Make the brand lead home.",

    "navbarPage.content2": "Keep five sections or fewer; the rest go in another navigation.",

    "navbarPage.content1": "Name each section in 1 or 2 words: “Projects”, “Reports”.",

    "navbarPage.whenNot3": 'For a view\'s actions, not the site\'s: use <a href="/components/app-bar">AppBar</a> or <a href="/components/toolbar">Toolbar</a>.',

    "navbarPage.whenNot2": 'If each category opens a multi-column panel: use <a href="/components/megamenu">Megamenu</a>.',

    "navbarPage.whenNot1": 'If navigation goes on the side: use <a href="/components/sidebar">Sidebar</a>.',

    "navbarPage.when2": "When global actions (search, account) must always be at hand.",

    "navbarPage.when1": "For the header of a site or application with a few sections.",

    "navbarPage.contract4": "The surface is four hooks: <code>--sk-navbar-bg</code>, <code>--sk-navbar-wash</code>, <code>--sk-navbar-elevation</code> and <code>--sk-navbar-border-color</code>.",

    "navbarPage.contract3": 'The current page is marked with <code>aria-current="page"</code>, which you already write for screen readers.',

    "navbarPage.contract2": "The links are the NavList pattern laid horizontally, the same one Sidebar lays vertically.",

    "navbarPage.contract1": "It is a <code>&lt;header&gt;</code> with native links and buttons; it needs no JavaScript.",
    "navbarPage.lede": 'Navbar is a site\'s or application\'s top bar: the brand on the left, the main navigation and actions such as search or the account. The links are a horizontal <a href="/nav-list">NavList</a>.',
    "navbarPage.anatomyBody":
      "This diagram names the brand, the guest nav and the actions. The specimen is frozen; the live Navbars begin below.",
    "navbarPage.anatomyLabel": "Navbar anatomy",
    "navbarPage.anatomyPreviewLabel": "Navbar, part by part",
    "navbarPage.linksTitle": "Site: brand, sections and one action",
    "navbarPage.linksBody": 'The current page carries <code>aria-current="page"</code> and marks itself.',
    "navbarPage.bareTitle": "No surface: over a cover",
    "navbarPage.bareBody": "The bar with no background or shadow, to sit over a Hero or an image.",
    "navbarPage.appTitle": "Application: tools and account",
    "navbarPage.appBody": "In a web application, actions are icons with an accessible name and the account closes the row. For a desktop application's menus (File, Edit) there is the <a href=\"/components/app-bar\">AppBar</a>, which is not a variant of this bar.",
    "navbarPage.test1": "Uses a header landmark while leaving navigation to its NavList child.",
    "demo.navbar.dd.tryFree": "Try for free",
    "demo.navbar.dd.pricing": "Pricing",
    "demo.navbar.dd.blog": "Blog",
    "demo.navbar.dd.docs": "Docs",
    "demo.navbar.dd.contact": "Contact",
    "demo.navbar.dd.longBrand": "Atlas: the platform for your team",
    "navbarPage.megaTitle": "With a megamenu",
    "navbarPage.megaBody": 'When there are too many sections for one row, the guest can be a <a href="/components/megamenu">Megamenu</a>: it opens a panel against the bar.',
    "navbarPage.dd.actions.title": "The bar's actions",
    "navbarPage.dd.actions.do": "One main action and the rest quiet.",
    "navbarPage.dd.actions.dont": "Three loud buttons: none of them is the main one.",
    "navbarPage.dd.links.title": "How many sections",
    "navbarPage.dd.links.do": "A few sections, the ones people look for from anywhere.",
    "navbarPage.dd.links.dont": "The whole site in one row: they do not fit and get cut off. Group them in a megamenu or a footer.",
    "navbarPage.dd.brand.title": "The brand",
    "navbarPage.dd.brand.do": "The product name, nothing more.",
    "navbarPage.dd.brand.dont": "A tagline as the brand: it takes the links' room.",
    "navbarPage.appearanceTitle": "Appearance: how the bar is drawn",
    "navbarPage.appearanceBody": "Plain, brutalist or frosted: the same bar with another surface. Spacing and order do not change.",
    "navbarPage.appearance.plain": "Plain, the default: a surface with a soft shadow.",
    "navbarPage.appearance.brutalist": "Brutalist: a black edge and a hard shadow, no gradient.",
    "navbarPage.appearance.frosted": "Frosted: a see-through material over whatever passes behind the bar.",
    "navbarPage.layoutTitle": "Layout: where each region goes",
    "navbarPage.layoutBody": "The bar has no layout option: it is a row and the rest is CSS. Each variant puts a <code>data-layout</code> on the bar and a rule that reads it.",
    "navbarPage.layout.start": "Beside",
    "navbarPage.layout.centered": "Centred",
    "navbarPage.layout.brand-center": "Brand centred",
    "navbarPage.layout.minimal": "No links",
    "navbarPage.layoutLabel": "Bar layout",
    "navbarPage.layoutExplain.start": "The usual: the brand, the links next to it and the actions at the end.",
    "navbarPage.layoutExplain.centered": "The links centre between the brand and the actions: <code>margin-inline: auto</code> on the list.",
    "navbarPage.layoutExplain.brand-center": "The brand in the middle, links on one side and actions on the other: a three-track grid.",
    "navbarPage.layoutExplain.minimal": "Only brand and actions, for a page that does not navigate: a sign-in, a sign-up.",
    "navbarPage.megaAppTitle": "Megamenu and account",
    "navbarPage.megaAppBody": "The megamenu carries the destinations; the actions on the right are tools and the account.",
    "navbarPage.guidelinesLede": "The top bar is seen on every page: it carries what people look for from anywhere.",
  },
} as const;
