export const megamenuMessages = {
  es: {

    "megamenuPage.description": "Organiza la navegación de un sitio en categorías que abren un panel de varias columnas de enlaces.",

    "megamenuPage.key.escape": "Cierra el panel y vuelve a la categoría.",

    "megamenuPage.key.tab": "Recorre las categorías y los enlaces del panel abierto.",

    "megamenuPage.key.open": "Abre o cierra la categoría.",

    "megamenuPage.a11yYours2": 'Marca la página actual con <code>aria-current="page"</code> en su enlace.',

    "megamenuPage.a11yYours1": 'Pon el Megamenu dentro de un <code>&lt;nav&gt;</code> con nombre: <code>aria-label="Principal"</code>.',

    "megamenuPage.a11yDoes3": "<kbd>Esc</kbd> cierra el panel y devuelve el foco a su categoría.",

    "megamenuPage.a11yDoes2": "<kbd>Tab</kbd> recorre los enlaces del panel en orden, sin atrapar el foco.",

    "megamenuPage.a11yDoes1": "Cada categoría anuncia <code>aria-expanded</code>.",

    "megamenuPage.a11yIntro": "Megamenu es navegación con botones que muestran y ocultan paneles.",

    "megamenuPage.content3": "Escribe cada enlace con el nombre de su destino, no con «Ver más».",

    "megamenuPage.content2": "Da un título a cada columna y ordena sus enlaces por lo que más se busca.",

    "megamenuPage.content1": "Nombra cada categoría con 1 o 2 palabras: «Productos», «Recursos».",

    "megamenuPage.whenNot3": 'Si solo hace falta la barra con la marca y las acciones: usa <a href="/es/componentes/navbar">Navbar</a>.',

    "megamenuPage.whenNot2": 'Para pocos destinos sin panel: usa <a href="/es/nav-list">NavList</a>.',

    "megamenuPage.whenNot1": 'Para comandos de una aplicación: usa <a href="/es/componentes/menu">Menu</a> o <a href="/es/componentes/menubar">Menubar</a>.',

    "megamenuPage.when2": "Cuando los enlaces de una categoría se ordenan en dos a cuatro columnas con título.",

    "megamenuPage.when1": "Para la navegación de un sitio con categorías que agrupan muchos destinos.",

    "megamenuPage.contract3": "El hover abre el panel después de una pausa corta, solo con mouse; el clic y el teclado funcionan igual.",

    "megamenuPage.contract2": 'No es un <code>role="menu"</code>: no hay flechas ni búsqueda por letra, y <kbd>Tab</kbd> recorre los enlaces en orden.',

    "megamenuPage.contract1": "Cada categoría es un <code>&lt;button aria-expanded&gt;</code>; su panel son dos a cuatro NavListGroup.",

    "megamenuPage.siteBody": "Abre una categoría con clic o con <kbd>Enter</kbd>; <kbd>Esc</kbd> la cierra y devuelve el foco.",

    "megamenuPage.siteTitle": "Barra de sitio: tres categorías",
    "megamenuPage.variantsTitle": "Variantes",
    "demo.megamenu.vague1": "Ver más",
    "demo.megamenu.vague2": "Haz clic aquí",
    "demo.megamenu.vague3": "Más información",
    "demo.megamenu.allGroup": "Todo",
    "megamenuPage.dd.links.title": "Enlaces: con el nombre del destino",
    "megamenuPage.dd.links.do": "Cada enlace dice a dónde lleva, también fuera de contexto.",
    "megamenuPage.dd.links.dont": "«Ver más» no dice nada: en un panel se ven todos a la vez y ninguno se distingue.",
    "megamenuPage.dd.columns.title": "Columnas: cortas y con título",
    "megamenuPage.dd.columns.do": "Dos o tres enlaces por columna, cada una con su título.",
    "megamenuPage.dd.columns.dont": "Una sola columna larga: hay que leerla entera para encontrar un enlace.",
    "demo.megamenu.longTrigger1": "Nuestros productos y servicios",
    "demo.megamenu.longTrigger2": "Recursos para aprender",
    "demo.megamenu.longTrigger3": "Sobre la empresa y el equipo",
    "megamenuPage.dd.triggers.title": "Categorías: una o dos palabras",
    "megamenuPage.dd.triggers.do": "«Producto», «Recursos»: se leen de un vistazo y caben en la barra.",
    "megamenuPage.dd.triggers.dont": "Frases largas llenan la barra y se cortan o saltan de línea.",
    "megamenuPage.columnsLabel": "Columnas del panel",
    "megamenuPage.columnsOption": "{count} columnas",
    "megamenuPage.variantTwoBody": "El mínimo: dos columnas. Con solo enlaces, cada <code>NavListGroup</code> lleva su encabezado y se lee como una lista.",
    "megamenuPage.variantThreeBody": "Dos grupos de enlaces y una columna de media. Al pasar por un enlace, la imagen cambia por la suya.",
    "megamenuPage.variantFourBody": "El máximo: tres grupos de enlaces y una columna de media.",

    "megamenuPage.lede": "Megamenu organiza la navegación de un sitio con muchos destinos: cada categoría de la barra (Productos, Recursos, Empresa) abre un panel de borde a borde con dos a cuatro columnas de enlaces. Son enlaces, no comandos.",
    "megamenuPage.anatomyBody":
      "Este diagrama nombra la barra, su lista, cada ítem, el trigger y el panel abierto con sus columnas. El espécimen está congelado; el megamenu vivo empieza arriba.",
    "megamenuPage.anatomyLabel": "Anatomía de Megamenu",
    "megamenuPage.anatomyPreviewLabel": "Megamenu abierto, parte por parte",

    "megamenuPage.testVanilla1":
      "Las N posicionadoras escritas a mano colapsan en un solo panel compartido, dimensionado por una regla oculta con las columnas de cada trigger.",
    "megamenuPage.testVanilla2":
      "Un click abre el panel de ese trigger con sus propias columnas.",
    "megamenuPage.testVanilla3": "Un click en el MISMO trigger lo cierra. Un toggle.",
    "megamenuPage.testVanilla4":
      "Un click en un trigger DISTINTO cambia el contenido del panel compartido, de forma excluyente.",
    "megamenuPage.testVanilla5": "Abre por intención de hover solo cuando pasa su demora, no al instante.",
    "megamenuPage.testVanilla6": "Sacar el puntero antes de que pase la demora cancela la apertura por hover.",
    "megamenuPage.testVanilla7":
      "Cierra por intención de hover solo cuando pasa su propia demora, una vez que el puntero deja el trigger Y el panel.",
    "megamenuPage.testVanilla8": "Volver a entrar al panel compartido cancela su cierre pendiente.",
    "megamenuPage.testVanilla9": "Escape cierra el panel abierto y devuelve el foco a su trigger.",
    "megamenuPage.testVanilla10": "El foco saliendo de toda la barra cierra el panel abierto.",
    "megamenuPage.testVanilla11":
      "El foco moviéndose de un trigger a su propio panel (portado afuera) NO lo cierra.",
    "megamenuPage.testVanilla12":
      "Pasar el puntero por un enlace con preview cambia la imagen, revirtiendo solo al dejar todos los enlaces con preview.",

    "megamenuPage.testReact1":
      "Renderiza un solo panel compartido, dimensionado por una regla oculta con las columnas de cada trigger.",
    "megamenuPage.testReact2":
      "Un click abre el panel de ese trigger con sus propias columnas.",
    "megamenuPage.testReact3": "Un click en el MISMO trigger lo cierra. Un toggle.",
    "megamenuPage.testReact4":
      "Un click en un trigger DISTINTO cambia el contenido del panel compartido, de forma excluyente.",
    "megamenuPage.testReact5": "Abre por intención de hover solo cuando pasa su demora, no al instante.",
    "megamenuPage.testReact6": "Sacar el puntero antes de que pase la demora cancela la apertura por hover.",
    "megamenuPage.testReact7":
      "Cierra por intención de hover solo cuando pasa su propia demora, una vez que el puntero deja el trigger Y el panel.",
    "megamenuPage.testReact8": "Volver a entrar al panel compartido cancela su cierre pendiente.",
    "megamenuPage.testReact9": "Escape cierra el panel abierto y devuelve el foco a su trigger.",
    "megamenuPage.testReact10": "El foco saliendo de toda la barra cierra el panel abierto.",
    "megamenuPage.testReact11":
      "El foco moviéndose de un trigger a su propio panel (portado afuera) NO lo cierra.",
    "megamenuPage.testReact12":
      "Pasar el puntero por un enlace con preview cambia la imagen, revirtiendo solo al dejar todos los enlaces con preview.",
    "demo.megamenu.label": "Navegación principal",
    "demo.megamenu.trigger1": "Producto",
    "demo.megamenu.trigger2": "Recursos",
    "demo.megamenu.group1": "Plataforma",
    "demo.megamenu.group2": "Soluciones",
    "demo.megamenu.group3": "Aprender",
    "demo.megamenu.group4": "Comunidad",
    "demo.megamenu.link1": "Resumen",
    "demo.megamenu.link2": "Precios",
    "demo.megamenu.link3": "Integraciones",
    "demo.megamenu.link4": "Para equipos",
    "demo.megamenu.link5": "Para empresas",
    "demo.megamenu.link6": "Documentación",
    "demo.megamenu.link7": "Guías",
    "demo.megamenu.link8": "Foro",
    "demo.megamenu.link9": "Blog",
    "demo.megamenu.trigger3": "Empresa",
    "demo.megamenu.group5": "Nosotros",
    "demo.megamenu.link10": "Sobre nosotros",
    "demo.megamenu.link11": "Empleos",
    "megamenuPage.guidelinesLede": "Un panel grande muestra de una vez todo lo que tiene una categoría, a cambio de tapar la página.",
  },
  en: {

    "megamenuPage.description": "Organizes a site's navigation into categories that open a panel with several columns of links.",

    "megamenuPage.key.escape": "Closes the panel and returns to the category.",

    "megamenuPage.key.tab": "Moves through the categories and the open panel's links.",

    "megamenuPage.key.open": "Opens or closes the category.",

    "megamenuPage.a11yYours2": 'Mark the current page with <code>aria-current="page"</code> on its link.',

    "megamenuPage.a11yYours1": 'Put the Megamenu inside a named <code>&lt;nav&gt;</code>: <code>aria-label="Main"</code>.',

    "megamenuPage.a11yDoes3": "<kbd>Esc</kbd> closes the panel and returns focus to its category.",

    "megamenuPage.a11yDoes2": "<kbd>Tab</kbd> moves through the panel's links in order, without trapping focus.",

    "megamenuPage.a11yDoes1": "Each category announces <code>aria-expanded</code>.",

    "megamenuPage.a11yIntro": "Megamenu is navigation with buttons that show and hide panels.",

    "megamenuPage.content3": "Write each link with its destination's name, not “See more”.",

    "megamenuPage.content2": "Give each column a title and order its links by what is most sought.",

    "megamenuPage.content1": "Name each category in 1 or 2 words: “Products”, “Resources”.",

    "megamenuPage.whenNot3": 'If only the bar with brand and actions is needed: use <a href="/components/navbar">Navbar</a>.',

    "megamenuPage.whenNot2": 'For a few destinations with no panel: use <a href="/nav-list">NavList</a>.',

    "megamenuPage.whenNot1": 'For an application\'s commands: use <a href="/components/menu">Menu</a> or <a href="/components/menubar">Menubar</a>.',

    "megamenuPage.when2": "When a category's links sort into two to four titled columns.",

    "megamenuPage.when1": "For a site's navigation with categories grouping many destinations.",

    "megamenuPage.contract3": "Hover opens the panel after a short pause, mouse only; click and keyboard work the same.",

    "megamenuPage.contract2": 'It is not a <code>role="menu"</code>: no arrows or type-ahead, and <kbd>Tab</kbd> moves through the links in order.',

    "megamenuPage.contract1": "Each category is a <code>&lt;button aria-expanded&gt;</code>; its panel is two to four NavListGroups.",

    "megamenuPage.siteBody": "Open a category with a click or <kbd>Enter</kbd>; <kbd>Esc</kbd> closes it and returns focus.",

    "megamenuPage.siteTitle": "Site bar: three categories",
    "megamenuPage.variantsTitle": "Variants",
    "demo.megamenu.vague1": "See more",
    "demo.megamenu.vague2": "Click here",
    "demo.megamenu.vague3": "More info",
    "demo.megamenu.allGroup": "Everything",
    "megamenuPage.dd.links.title": "Links: name the destination",
    "megamenuPage.dd.links.do": "Each link says where it goes, even out of context.",
    "megamenuPage.dd.links.dont": "“See more” says nothing: in a panel they are all visible at once and none stands out.",
    "megamenuPage.dd.columns.title": "Columns: short and titled",
    "megamenuPage.dd.columns.do": "Two or three links per column, each with its title.",
    "megamenuPage.dd.columns.dont": "One long column: it has to be read whole to find a link.",
    "demo.megamenu.longTrigger1": "Our products and services",
    "demo.megamenu.longTrigger2": "Resources to learn from",
    "demo.megamenu.longTrigger3": "About the company and the team",
    "megamenuPage.dd.triggers.title": "Categories: one or two words",
    "megamenuPage.dd.triggers.do": "“Product”, “Resources”: read at a glance and fit the bar.",
    "megamenuPage.dd.triggers.dont": "Long phrases fill the bar and get cut or wrap.",
    "megamenuPage.columnsLabel": "Panel columns",
    "megamenuPage.columnsOption": "{count} columns",
    "megamenuPage.variantTwoBody": "The minimum: two columns. With links only, each <code>NavListGroup</code> carries its heading and reads as a list.",
    "megamenuPage.variantThreeBody": "Two groups of links and a media column. Hovering a link swaps the image for its own.",
    "megamenuPage.variantFourBody": "The maximum: three groups of links and a media column.",

    "megamenuPage.lede": "Megamenu organizes the navigation of a site with many destinations: each category in the bar (Products, Resources, Company) opens an edge-to-edge panel with two to four columns of links. They are links, not commands.",
    "megamenuPage.anatomyBody":
      "This diagram names the bar, its list, each item, the trigger and the open panel with its columns. The specimen is frozen; the live megamenu is above.",
    "megamenuPage.anatomyLabel": "Megamenu anatomy",
    "megamenuPage.anatomyPreviewLabel": "An open Megamenu, part by part",

    "megamenuPage.testVanilla1":
      "The N authored positioners collapse into one shared panel, sized by a hidden ruler holding every trigger's columns.",
    "megamenuPage.testVanilla2": "A click opens that trigger's panel with its own columns.",
    "megamenuPage.testVanilla3": "A click on the SAME trigger closes it. A toggle.",
    "megamenuPage.testVanilla4":
      "A click on a DIFFERENT trigger switches the shared panel's content, exclusively.",
    "megamenuPage.testVanilla5": "Opens on hover intent only once its own delay elapses, not immediately.",
    "megamenuPage.testVanilla6": "Leaving before the delay elapses cancels the hover-intent open.",
    "megamenuPage.testVanilla7":
      "Closes on hover intent only once its own delay elapses, after the pointer leaves both the trigger and the panel.",
    "megamenuPage.testVanilla8": "Re-entering the shared panel cancels its pending close.",
    "megamenuPage.testVanilla9": "Escape closes the open panel and returns focus to its trigger.",
    "megamenuPage.testVanilla10": "Focus leaving the whole bar closes the open panel.",
    "megamenuPage.testVanilla11":
      "Focus moving from a trigger into its own (portalled-out) panel does NOT close it.",
    "megamenuPage.testVanilla12":
      "Hovering a preview link swaps the image, reverting only once every preview link is left.",

    "megamenuPage.testReact1":
      "Renders one shared panel, sized by a hidden ruler holding every trigger's columns.",
    "megamenuPage.testReact2": "A click opens that trigger's panel with its own columns.",
    "megamenuPage.testReact3": "A click on the SAME trigger closes it. A toggle.",
    "megamenuPage.testReact4":
      "A click on a DIFFERENT trigger switches the shared panel's content, exclusively.",
    "megamenuPage.testReact5": "Opens on hover intent only once its own delay elapses, not immediately.",
    "megamenuPage.testReact6": "Leaving before the delay elapses cancels the hover-intent open.",
    "megamenuPage.testReact7":
      "Closes on hover intent only once its own delay elapses, after the pointer leaves both the trigger and the panel.",
    "megamenuPage.testReact8": "Re-entering the shared panel cancels its pending close.",
    "megamenuPage.testReact9": "Escape closes the open panel and returns focus to its trigger.",
    "megamenuPage.testReact10": "Focus leaving the whole bar closes the open panel.",
    "megamenuPage.testReact11":
      "Focus moving from a trigger into its own (portalled-out) panel does NOT close it.",
    "megamenuPage.testReact12":
      "Hovering a preview link swaps the image, reverting only once every preview link is left.",

    "demo.megamenu.label": "Main navigation",
    "demo.megamenu.trigger1": "Product",
    "demo.megamenu.trigger2": "Resources",
    "demo.megamenu.group1": "Platform",
    "demo.megamenu.group2": "Solutions",
    "demo.megamenu.group3": "Learn",
    "demo.megamenu.group4": "Community",
    "demo.megamenu.link1": "Overview",
    "demo.megamenu.link2": "Pricing",
    "demo.megamenu.link3": "Integrations",
    "demo.megamenu.link4": "For teams",
    "demo.megamenu.link5": "For enterprise",
    "demo.megamenu.link6": "Documentation",
    "demo.megamenu.link7": "Guides",
    "demo.megamenu.link8": "Forum",
    "demo.megamenu.link9": "Blog",
    "demo.megamenu.trigger3": "Company",
    "demo.megamenu.group5": "About",
    "demo.megamenu.link10": "About us",
    "demo.megamenu.link11": "Careers",
    "megamenuPage.guidelinesLede": "A large panel shows everything a category holds at once, at the cost of covering the page.",
  },
} as const;
