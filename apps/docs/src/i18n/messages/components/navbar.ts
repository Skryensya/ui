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
    "navbarPage.appBody": "En una aplicación, las acciones son íconos con nombre accesible y la cuenta cierra la fila.",
    "navbarPage.test1": "Usa un landmark <code>header</code> y deja la navegación a su hijo NavList.",
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
    "navbarPage.appBody": "In an application, actions are icons with an accessible name and the account closes the row.",
    "navbarPage.test1": "Uses a header landmark while leaving navigation to its NavList child.",
    "navbarPage.guidelinesLede": "The top bar is seen on every page: it carries what people look for from anywhere.",
  },
} as const;
