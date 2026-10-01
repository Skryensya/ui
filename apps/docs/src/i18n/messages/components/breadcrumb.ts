export const breadcrumbMessages = {
  es: {
    "demo.breadcrumb.genericHere": "Aquí",
    "demo.breadcrumb.genericSection": "Sección",
    "demo.breadcrumb.genericBack": "Atrás",
    "demo.breadcrumb.label": "Migas de pan",
    "demo.breadcrumb.home": "Inicio",
    "demo.breadcrumb.projects": "Proyectos",
    "demo.breadcrumb.settings": "Configuración",
    "demo.breadcrumb.search": "Búsqueda",
    "demo.breadcrumb.results": "Resultados",
    "demo.breadcrumb.longAncestor":
      "Migración del layer vanilla a componentes Svelte",
    "demo.breadcrumb.longCurrent":
      "Máquinas Zag compartidas entre el layer vanilla y los componentes Svelte",
    "demo.breadcrumb.documents": "Documentos",
    "demo.breadcrumb.activeProjects": "Proyectos activos",
    "demo.breadcrumb.designSystem": "Sistema de diseño",
    "demo.breadcrumb.sharedComponents": "Componentes compartidos",

    "breadcrumb.description": "Muestra dónde está la página dentro de una jerarquía y deja volver a cada nivel.",

    "breadcrumb.a11yKeyEnter": "Sigue el enlace, o abre el menú de niveles ocultos.",

    "breadcrumb.a11yKeyTab": "Recorre los enlaces y el botón «…».",

    "breadcrumb.a11yKeysNote": 'Dentro del menú de niveles ocultos, las teclas son las de <a href="/es/componentes/menu">Menu</a>.',

    "breadcrumb.a11yYours2": "Pasa <code>collapsedLabel</code>: es el nombre del botón «…», como «Mostrar niveles ocultos».",

    "breadcrumb.a11yYours1": "Debe tener <code>label</code>, para distinguirlo de otras navegaciones de la página.",

    "breadcrumb.a11yDoes4": "El botón «…» abre un Menu real, con su teclado.",

    "breadcrumb.a11yDoes3": "Los separadores son decorativos y no se anuncian.",

    "breadcrumb.a11yDoes2": 'La página actual lleva <code>aria-current="page"</code>.',

    "breadcrumb.a11yDoes1": "Renderiza un <code>nav</code> con una lista <code>ol</code>: el lector de pantalla anuncia cuántos niveles hay.",

    "breadcrumb.a11yIntro": "Breadcrumb es una navegación con nombre, con una lista ordenada de enlaces.",

    "breadcrumb.content3": "Nombra la navegación con <code>label</code>: «Migas de pan» o «Ubicación».",

    "breadcrumb.content2": "Escribe la página actual completa; los ancestros largos se cortan solos.",

    "breadcrumb.content1": "Usa el título de cada página tal como aparece en su encabezado.",

    "breadcrumb.dd.labels.dont": "«Atrás» y «Sección» no identifican las páginas de destino; usa sus títulos para que se entiendan antes de abrir los enlaces.",

    "breadcrumb.dd.labels.do": "Cada enlace dice adónde lleva, con el mismo título que tiene esa página.",

    "breadcrumb.dd.labels.title": "Etiquetas: el título de cada página",

    "breadcrumb.dd.hierarchy.title": "Jerarquía: no historial",
    "breadcrumb.dd.hierarchy.do": "La senda muestra el lugar estable de esta página dentro del producto.",
    "breadcrumb.dd.hierarchy.dont": "Búsqueda y resultados son cómo llegó la persona, no niveles por encima de la página.",

    "breadcrumb.dd.current.title": "Página actual: termina la senda",
    "breadcrumb.dd.current.do": "El último nivel nombra dónde está la persona ahora y no es un enlace.",
    "breadcrumb.dd.current.dont": "Sin la página actual, la senda solo dice a dónde puede ir, no dónde está.",

    "breadcrumb.whenNot3": 'Si solo hay una página por encima: un enlace «Volver a…» alcanza. Usa <a href="/es/componentes/link">Link</a>.',

    "breadcrumb.whenNot2": 'Para los pasos de un proceso: usa <a href="/es/componentes/steps">Steps</a>.',

    "breadcrumb.whenNot1": 'Si la navegación es plana: usa <a href="/es/nav-list">NavList</a>.',

    "breadcrumb.when2": "Cuando la persona llega por búsqueda o por un enlace directo y necesita subir.",

    "breadcrumb.when1": "En páginas dentro de una jerarquía de tres niveles o más: documentación, catálogos, carpetas.",

    "breadcrumb.contract1": 'Usa <code>nav</code> y una lista <code>ol</code>; el último elemento lleva <code>aria-current="page"</code> y no es un enlace.',

    "breadcrumb.lede": "Breadcrumb muestra dónde está la página dentro de una jerarquía y deja volver a cualquier nivel superior. Cada nivel es un enlace real, y la página actual va al final, sin enlace.",
    "breadcrumb.anatomyBody": "<code>sk-breadcrumb__item</code> y los separadores se repiten; el botón de colapso y la página actual son únicos.",
    "breadcrumb.twoTitle": "Dos niveles: el caso mínimo",
    "breadcrumb.twoBody": "Un enlace al nivel anterior y la página actual.",
    "breadcrumb.multiTitle": "Varios niveles: un enlace por ancestro",
    "breadcrumb.multiBody": "Cada nivel intermedio es un enlace seguido de su separador; solo el último pierde los dos.",
    "breadcrumb.iconTitle": "Separador: texto o ícono",
    "breadcrumb.iconBody": 'Sin llenarlo, el separador es <code>/</code>. Acepta texto (<code>·</code>, <code>›</code>) o un <a href="/es/componentes/icon">Icon</a>, como <code>chevron-right</code>.',
    "breadcrumb.longTitle": "Etiquetas largas: los ancestros se cortan, la actual no",
    "breadcrumb.longBody": "Un ancestro largo no debe sacar al resto de la columna, y la página actual es justo la que tiene que leerse entera.",
    "breadcrumb.longItem1": "<code>sk-breadcrumb__link</code> se corta con elipsis a <code>--sk-breadcrumb-link-max</code> (16ch por defecto) y guarda el texto completo en <code>title</code>.",
    "breadcrumb.longItem2": "<code>sk-breadcrumb__current</code> no se corta: pasa a varias líneas.",
    "breadcrumb.collapseTitle": "Colapso: cuando no entra en una línea",
    "breadcrumb.collapseBody": 'Si el camino no entra, los ancestros del medio pasan a un botón «…» que abre un <a href="/es/componentes/menu">Menu</a> con esos niveles. El primero y la página actual quedan siempre a la vista. Sin JavaScript, el camino sigue completo.',
    "breadcrumb.collapseTriggerLabel": "Mostrar niveles ocultos",
    "breadcrumb.test1": "Una senda corta se renderiza sin colapsar: no hay «…» que valga la pena mostrar.",
    "breadcrumb.test2": 'El trigger «…» expone su <code>aria-label</code> y <code>aria-haspopup="menu"</code>, y abre un <a href="/es/componentes/menu">Menu</a> real con los niveles ocultos.',
    "breadcrumb.test3": "Una senda que entra en una línea queda sin colapsar.",
    "breadcrumb.test4": "El colapso se recalcula en cada resize, incluso al achicarse desde un estado ya expandido.",
    "breadcrumb.test5": "Una senda corta no gana ni siquiera el elemento «…»: nada vale la pena esconder.",
    "breadcrumb.test6": "Una senda que entra en una línea no toca ningún crumb: el «…» queda oculto.",
    "breadcrumb.test7": 'Sin espacio, el «…» abre un <a href="/es/componentes/menu">Menu</a> real con los crumbs escondidos, cada uno como enlace navegable; el primero y la página actual quedan siempre a la vista.',
    "breadcrumb.test8": "Cada resize vuelve a medir la senda: primero expande todo, así nunca queda atascado colapsado de más.",
    "breadcrumb.test9": "Al desmontar el enhancer, todos los crumbs vuelven a quedar visibles.",
    "breadcrumb.guidelinesLede": "Breadcrumb responde dos preguntas: dónde estoy y cómo vuelvo.",
    "breadcrumb.dd.collapse.title": "Colapso: acorta los caminos largos",
    "breadcrumb.dd.collapse.do": "Los niveles del medio pasan a «…» y el inicio y la página actual quedan a la vista.",
    "breadcrumb.dd.collapse.dont": "Un camino entero se parte en varias líneas y deja de leerse como un camino.",
  },
  en: {
    "demo.breadcrumb.genericHere": "Here",
    "demo.breadcrumb.genericSection": "Section",
    "demo.breadcrumb.genericBack": "Back",
    "demo.breadcrumb.label": "Breadcrumbs",
    "demo.breadcrumb.home": "Home",
    "demo.breadcrumb.projects": "Projects",
    "demo.breadcrumb.settings": "Settings",
    "demo.breadcrumb.search": "Search",
    "demo.breadcrumb.results": "Results",
    "demo.breadcrumb.longAncestor":
      "Migration from vanilla layer to Svelte components",
    "demo.breadcrumb.longCurrent":
      "Zag machines shared between vanilla layer and Svelte components",
    "demo.breadcrumb.documents": "Documents",
    "demo.breadcrumb.activeProjects": "Active projects",
    "demo.breadcrumb.designSystem": "Design system",
    "demo.breadcrumb.sharedComponents": "Shared components",

    "breadcrumb.description": "Shows where a page sits in a hierarchy and leads back to each level.",

    "breadcrumb.a11yKeyEnter": "Follows the link, or opens the hidden-levels menu.",

    "breadcrumb.a11yKeyTab": "Moves through the links and the “…” button.",

    "breadcrumb.a11yKeysNote": 'Inside the hidden-levels menu, the keys are <a href="/components/menu">Menu</a>\'s.',

    "breadcrumb.a11yYours2": "Pass <code>collapsedLabel</code>: it is the name of the “…” button, such as “Show hidden levels”.",

    "breadcrumb.a11yYours1": "It must have a <code>label</code>, to tell it apart from other navigations on the page.",

    "breadcrumb.a11yDoes4": "The “…” button opens a real Menu, with its keyboard.",

    "breadcrumb.a11yDoes3": "The separators are decorative and not announced.",

    "breadcrumb.a11yDoes2": 'The current page carries <code>aria-current="page"</code>.',

    "breadcrumb.a11yDoes1": "It renders a <code>nav</code> with an <code>ol</code> list: the screen reader announces how many levels there are.",

    "breadcrumb.a11yIntro": "Breadcrumb is a named navigation holding an ordered list of links.",

    "breadcrumb.content3": "Name the navigation with <code>label</code>: “Breadcrumb” or “Location”.",

    "breadcrumb.content2": "Write the current page in full; long ancestors truncate on their own.",

    "breadcrumb.content1": "Use each page's title exactly as its heading shows it.",

    "breadcrumb.dd.labels.dont": "“Back” and “Section” do not identify the destination pages; use their titles so people know where each link goes.",

    "breadcrumb.dd.labels.do": "Each link says where it goes, with the same title that page has.",

    "breadcrumb.dd.labels.title": "Labels: each page's title",

    "breadcrumb.dd.hierarchy.title": "Hierarchy: not history",
    "breadcrumb.dd.hierarchy.do": "The trail shows this page's stable place inside the product.",
    "breadcrumb.dd.hierarchy.dont": "Search and results are how people arrived, not levels above the page.",

    "breadcrumb.dd.current.title": "Current page: end the trail",
    "breadcrumb.dd.current.do": "The last level names where people are now and is not a link.",
    "breadcrumb.dd.current.dont": "Without the current page, the trail only says where people can go, not where they are.",

    "breadcrumb.whenNot3": 'If there is only one page above: a “Back to…” link is enough. Use <a href="/components/link">Link</a>.',

    "breadcrumb.whenNot2": 'For the steps of a process: use <a href="/components/steps">Steps</a>.',

    "breadcrumb.whenNot1": 'If navigation is flat: use <a href="/nav-list">NavList</a>.',

    "breadcrumb.when2": "When people arrive from search or a direct link and need to go up.",

    "breadcrumb.when1": "On pages inside a hierarchy three or more levels deep: documentation, catalogs, folders.",

    "breadcrumb.contract1": 'It uses <code>nav</code> and an <code>ol</code> list; the last item carries <code>aria-current="page"</code> and is not a link.',

    "breadcrumb.lede": "Breadcrumb shows where a page sits in a hierarchy and leads back to any level above it. Each level is a real link, and the current page comes last, with no link.",
    "breadcrumb.anatomyBody": "<code>sk-breadcrumb__item</code> and the separators repeat; the collapse button and the current page are single.",
    "breadcrumb.twoTitle": "Two levels: the minimum",
    "breadcrumb.twoBody": "A link to the level above and the current page.",
    "breadcrumb.multiTitle": "Several levels: one link per ancestor",
    "breadcrumb.multiBody": "Each intermediate level is a link followed by its separator; only the last loses both.",
    "breadcrumb.iconTitle": "Separator: text or an icon",
    "breadcrumb.iconBody": 'Left empty, the separator is <code>/</code>. It takes text (<code>·</code>, <code>›</code>) or an <a href="/components/icon">Icon</a>, such as <code>chevron-right</code>.',
    "breadcrumb.longTitle": "Long labels: ancestors truncate, the current page does not",
    "breadcrumb.longBody": "A long ancestor must not push the rest out of the column, and the current page is exactly the one that must read in full.",
    "breadcrumb.longItem1": "<code>sk-breadcrumb__link</code> truncates with an ellipsis at <code>--sk-breadcrumb-link-max</code> (16ch by default) and keeps the full text in <code>title</code>.",
    "breadcrumb.longItem2": "<code>sk-breadcrumb__current</code> never truncates: it wraps onto several lines.",
    "breadcrumb.collapseTitle": "Collapse: when it does not fit one line",
    "breadcrumb.collapseBody": 'If the trail does not fit, the middle ancestors move behind a “…” button that opens a <a href="/components/menu">Menu</a> with those levels. The first level and the current page always stay visible. Without JavaScript, the trail stays whole.',
    "breadcrumb.collapseTriggerLabel": "Show hidden levels",
    "breadcrumb.test1": 'A short trail renders uncollapsed: there is no "…" worth showing.',
    "breadcrumb.test2": 'The "…" trigger exposes its <code>aria-label</code> and <code>aria-haspopup="menu"</code>, and opens a real <a href="/components/menu">Menu</a> of the hidden levels.',
    "breadcrumb.test3": "A trail that fits on one line stays uncollapsed.",
    "breadcrumb.test4": "The collapse is re-measured on every resize, even shrinking back from an already-expanded state.",
    "breadcrumb.test5": 'A short trail doesn\'t even grow the "…" item: nothing is worth hiding.',
    "breadcrumb.test6": 'A trail that fits on one line leaves every crumb untouched: the "…" stays hidden.',
    "breadcrumb.test7": 'With no room, the "…" opens a real <a href="/components/menu">Menu</a> of the hidden crumbs, each one a navigable link; the first crumb and the current page stay visible either way.',
    "breadcrumb.test8": "Every resize re-measures the trail: it expands first, so it never gets stuck over-collapsed.",
    "breadcrumb.test9": "Unmounting the enhancer restores every crumb to visible.",
    "breadcrumb.guidelinesLede": "Breadcrumb answers two questions: where am I, and how do I go back.",
    "breadcrumb.dd.collapse.title": "Collapse: shorten long trails",
    "breadcrumb.dd.collapse.do": "The middle levels move behind “…”, and the start and the current page stay visible.",
    "breadcrumb.dd.collapse.dont": "A whole trail breaks across several lines and stops reading as a trail.",
  },
} as const;
