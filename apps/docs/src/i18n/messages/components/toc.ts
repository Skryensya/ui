export const tocMessages = {
  es: {

    "toc.title": "En esta página",
    "demo.toc.title": "En esta página",
    "demo.toc.summary": "Resumen",
    "demo.toc.installation": "Instalación",
    "demo.toc.configuration": "Configuración",
    "demo.toc.configuration.env": "Variables de entorno",
    "demo.toc.configuration.flags": "Flags opcionales",
    "demo.toc.reference": "Referencia",

    "tocPage.description": "Lista las secciones de una página larga y marca en cuál estás.",

    "tocPage.a11yYours2": "Cada sección necesita un <code>id</code> estable para su enlace.",

    "tocPage.a11yYours1": "Nombra el <code>&lt;nav&gt;</code>: «En esta página».",

    "tocPage.a11yDoes2": "El ícono es decorativo.",

    "tocPage.a11yDoes1": "La sección actual lleva <code>aria-current</code>.",

    "tocPage.a11yIntro": "Toc es una navegación con enlaces nativos.",

    "tocPage.content2": "Titula el índice «En esta página».",

    "tocPage.content1": "Usa los títulos de las secciones tal cual; si son largos, acórtalos en la página.",

    "tocPage.whenNot3": 'Para saltar el menú al inicio: usa <a href="/es/componentes/skip-link">SkipLink</a>.',

    "tocPage.whenNot2": "Para una página corta: el índice agrega ruido.",

    "tocPage.whenNot1": 'Para la navegación entre páginas: usa <a href="/es/componentes/sidebar">Sidebar</a> o <a href="/es/nav-list">NavList</a>.',

    "tocPage.when2": "Cuando conviene saber en qué parte de la página estás.",

    "tocPage.when1": "Para una página larga con cuatro o más secciones.",

    "tocPage.contract4": "Genera la lista en el servidor, con los encabezados de la página: así no hay saltos al cargar.",

    "tocPage.contract3": "Una sola forma, siempre abierta; fijarlo al costado con <code>position: sticky</code> es decisión de la página.",

    "tocPage.contract2": "Cada fila lleva su <code>data-level</code>: <code>h2</code> o <code>h3</code>.",

    "tocPage.contract1": "Es un <code>&lt;aside&gt;</code> con un <code>&lt;nav&gt;</code>, su título y una lista de enlaces.",

    "tocPage.spyBody": "El enhancer marca con <code>aria-current</code> la sección que cruza la parte de arriba de la ventana.",

    "tocPage.spyTitle": "Scroll-spy: la sección actual",
    "tocPage.lede": "Toc lista las secciones de una página larga y marca en cuál estás: una guía, un artículo, una página de documentación como esta. Cada fila es un enlace a su sección, y la actual se marca sola al desplazarte.",
    "tocPage.anatomyBody":
      "Este diagrama nombra el aside, el nav, el título y cada parte del enlace con icono. El espécimen está congelado; los índices vivos empiezan abajo.",
    "tocPage.anatomyLabel": "Anatomía de Toc",
    "tocPage.anatomyPreviewLabel": "Toc, parte por parte",
    "tocPage.plainTitle": "Lista: las secciones de la página",
    "tocPage.plainBody": "Un título y un enlace por sección. Se ve desde el primer instante, sin nada que abrir.",
    "tocPage.levelsTitle": "Niveles: secciones y subsecciones",
    "tocPage.levelsBody": "Una subsección (<code>h3</code>) va sangrada bajo su sección.",
    "tocPage.iconsTitle": "Con íconos: un ícono por sección",
    "tocPage.iconsBody": "El ícono es decorativo: la etiqueta nombra el destino.",
    "tocPage.iconsCodeLabel": "enlace con icono",
    "tocPage.test1": "Nombra el nav a partir del caption y da nivel a cada ítem.",
    "tocPage.test2": "Siembra <code>aria-current</code> desde la composición antes de que el spy reporte.",
    "tocPage.test3": "Mueve <code>aria-current</code> a medida que los encabezados entran a la banda.",
    "demo.toc.dd.long1": "Qué es este componente y cuándo conviene usarlo en tu proyecto",
    "demo.toc.dd.long2": "Cómo instalar los paquetes y cargar las hojas de estilo necesarias",
    "demo.toc.dd.long3": "Todas las opciones, eventos y atributos que acepta",
    "tocPage.guidelinesLede": "Un índice muestra de un vistazo qué tiene una página y deja saltar a cualquier parte.",
    "tocPage.dd.short.title": "Entradas: cortas",
    "tocPage.dd.short.do": "Usa los títulos de las secciones, en pocas palabras.",
    "tocPage.dd.short.dont": "Oraciones largas no se leen de un vistazo y se cortan en la columna lateral.",
  },
  en: {

    "toc.title": "On this page",
    "demo.toc.title": "On this page",
    "demo.toc.summary": "Summary",
    "demo.toc.installation": "Installation",
    "demo.toc.configuration": "Configuration",
    "demo.toc.configuration.env": "Environment variables",
    "demo.toc.configuration.flags": "Optional flags",
    "demo.toc.reference": "Reference",

    "tocPage.description": "Lists a long page's sections and marks which one you are in.",

    "tocPage.a11yYours2": "Each section needs a stable <code>id</code> for its link.",

    "tocPage.a11yYours1": "Name the <code>&lt;nav&gt;</code>: “On this page”.",

    "tocPage.a11yDoes2": "The icon is decorative.",

    "tocPage.a11yDoes1": "The current section carries <code>aria-current</code>.",

    "tocPage.a11yIntro": "Toc is navigation with native links.",

    "tocPage.content2": "Title the index “On this page”.",

    "tocPage.content1": "Use the section titles as they are; if long, shorten them on the page.",

    "tocPage.whenNot3": 'To skip the menu at the start: use <a href="/components/skip-link">SkipLink</a>.',

    "tocPage.whenNot2": "For a short page: the index adds noise.",

    "tocPage.whenNot1": 'For navigation between pages: use <a href="/components/sidebar">Sidebar</a> or <a href="/nav-list">NavList</a>.',

    "tocPage.when2": "When it helps to know where on the page you are.",

    "tocPage.when1": "For a long page with four or more sections.",

    "tocPage.contract4": "Build the list on the server, from the page's headings: that way nothing jumps on load.",

    "tocPage.contract3": "A single shape, always open; pinning it aside with <code>position: sticky</code> is the page's choice.",

    "tocPage.contract2": "Each row carries its <code>data-level</code>: <code>h2</code> or <code>h3</code>.",

    "tocPage.contract1": "It is an <code>&lt;aside&gt;</code> with a <code>&lt;nav&gt;</code>, its title and a list of links.",

    "tocPage.spyBody": "The enhancer marks with <code>aria-current</code> the section crossing the top of the window.",

    "tocPage.spyTitle": "Scroll-spy: the current section",
    "tocPage.lede": "Toc lists a long page's sections and marks which one you are in: a guide, an article, a documentation page like this one. Each row links to its section, and the current one marks itself as you scroll.",
    "tocPage.anatomyBody":
      "This diagram names the aside, the nav, the title, and each part of an icon link. The specimen is frozen; the live indexes start below.",
    "tocPage.anatomyLabel": "Toc anatomy",
    "tocPage.anatomyPreviewLabel": "Toc, part by part",
    "tocPage.plainTitle": "List: the page's sections",
    "tocPage.plainBody": "A title and a link per section. It shows from the first moment, with nothing to open.",
    "tocPage.levelsTitle": "Levels: sections and subsections",
    "tocPage.levelsBody": "A subsection (<code>h3</code>) is indented under its section.",
    "tocPage.iconsTitle": "With icons: one icon per section",
    "tocPage.iconsBody": "The icon is decorative: the label names the destination.",
    "tocPage.iconsCodeLabel": "link with an icon",
    "tocPage.test1": "Names the nav after the caption and levels each item.",
    "tocPage.test2": "Seeds aria-current from the composition before the spy reports.",
    "tocPage.test3": "Moves aria-current as headings enter the band.",
    "demo.toc.dd.long1": "What this component is and when to use it in your project",
    "demo.toc.dd.long2": "How to install the packages and load the stylesheets it needs",
    "demo.toc.dd.long3": "Every option, event and attribute it accepts",
    "tocPage.guidelinesLede": "An index shows at a glance what a page holds and lets you jump anywhere.",
    "tocPage.dd.short.title": "Entries: short",
    "tocPage.dd.short.do": "Use the section titles, in a few words.",
    "tocPage.dd.short.dont": "Long sentences do not scan at a glance and get cut in the side column.",
  },
} as const;
