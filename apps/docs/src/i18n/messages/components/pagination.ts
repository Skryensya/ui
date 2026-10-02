export const paginationMessages = {
  es: {
    "demo.pagination.label": "Paginación",
    "demo.pagination.previous": "Página anterior",
    "demo.pagination.next": "Página siguiente",

    "paginationPage.description": "Recorre una lista larga dividida en páginas, una a la vez.",

    "paginationPage.key.enter": "Va a esa página.",

    "paginationPage.key.tab": "Recorre las páginas y las flechas.",

    "paginationPage.a11yYours2": "Al cambiar de página, lleva el foco al principio de la lista nueva.",

    "paginationPage.a11yYours1": "Dale nombre al <code>&lt;nav&gt;</code> si hay otro en la página.",

    "paginationPage.a11yDoes3": "La elipsis es decorativa.",

    "paginationPage.a11yDoes2": "Anterior y Siguiente tienen nombre accesible aunque solo muestren una flecha.",

    "paginationPage.a11yDoes1": 'La página actual se anuncia con <code>aria-current="page"</code>.',

    "paginationPage.a11yIntro": "Pagination es un <code>&lt;nav&gt;</code> con enlaces o botones nativos.",

    "paginationPage.content2": "Si importa, di el total cerca: «Resultados 21 a 30 de 214».",

    "paginationPage.content1": 'Nombra el control: <code>aria-label="Páginas de resultados"</code>.',

    "paginationPage.whenNot3": 'Para pasos de un proceso: usa <a href="/es/componentes/steps">Steps</a>.',

    "paginationPage.whenNot2": 'Para un flujo que se lee de corrido: carga más al final, con <a href="/es/componentes/feed">Feed</a>.',

    "paginationPage.whenNot1": 'Para una tabla con filas por página: usa <a href="/es/componentes/table-pager">TablePager</a>.',

    "paginationPage.when2": "Cuando la persona necesita volver a un lugar concreto: «estaba en la página 4».",

    "paginationPage.when1": "Para una lista larga que no cabe en una vista: resultados, un archivo.",

    "paginationPage.contract3": "Las flechas son los íconos <code>chevron-left</code> y <code>chevron-right</code> del set enlazado.",

    "paginationPage.contract2": "Anterior y Siguiente se deshabilitan en los bordes.",

    "paginationPage.contract1": 'La página actual lleva <code>aria-current="page"</code>.',

    "paginationPage.twelveBody": "La primera y la última siempre están; alrededor de la actual, sus vecinas; el resto se resume en «…».",

    "paginationPage.twelveTitle": "Doce páginas: los extremos siempre a la vista",
    "paginationPage.lede": "Pagination recorre una lista larga dividida en páginas, una a la vez: resultados de búsqueda, un archivo de artículos. Dice en qué página estás y deja saltar a la primera, la última y las vecinas.",
    "paginationPage.anatomyBody":
      "Este diagrama nombra prev, la elipsis, la página actual, sus vecinas (las que conserva <code>siblings</code>) y next. El espécimen está congelado; la paginación viva empieza abajo.",
    "paginationPage.anatomyLabel": "Anatomía de Pagination",
    "paginationPage.anatomyPreviewLabel": "Pagination, parte por parte",
    "paginationPage.rangeTitle": "La ventana: una función del core",
    "paginationPage.rangeBody": "Qué páginas se muestran lo calcula una función pura, la misma en los dos bindings:",
    "paginationPage.test1": "Marca la página actual y deshabilita prev/next en los límites.",
    "paginationPage.test2": "Colapsa páginas lejanas detrás de una elipsis y reporta clicks acotados al rango.",
    "demo.pagination.status": "Resultados 21 a 30 de 214",
    "paginationPage.appearanceTitle": "Appearance: cómo se dibuja la página actual",
    "paginationPage.appearanceBody": "Solo cambia cómo se ve la página en la que estás; los números, las flechas y el espacio no se mueven.",
    "paginationPage.appearance.plain": "Plain, el valor por defecto: la actual en un recuadro suave.",
    "paginationPage.appearance.tactile": "Tactile: la actual es una tecla sobre un reborde; al pulsar se hunde.",
    "paginationPage.appearance.brutalist": "Brutalist: un bloque de borde negro con una sombra dura.",
    "paginationPage.appearance.frosted": "Frosted: una hoja translúcida sobre lo que haya detrás.",
    "paginationPage.siblingsTitle": "Siblings: cuántas vecinas se quedan",
    "paginationPage.siblingsBody": "Veinte páginas, en la 8: la primera y la última siempre están, y <code>siblings</code> dice cuántas más se ven a cada lado de la actual.",
    "paginationPage.siblingsLabel": "Vecinas a cada lado",
    "paginationPage.siblings.0": "0 vecinas",
    "paginationPage.siblings.1": "1 vecina",
    "paginationPage.siblings.2": "2 vecinas",
    "paginationPage.siblingsExplain.0": "Solo la actual entre los extremos: el pager más corto, para un espacio estrecho.",
    "paginationPage.siblingsExplain.1": "El valor por defecto: la actual con una vecina a cada lado.",
    "paginationPage.siblingsExplain.2": "Dos a cada lado: más para saltar sin pasar por los extremos.",
    "paginationPage.positionTitle": "Dónde estás: la ventana se ajusta",
    "paginationPage.positionBody": "En un extremo la ventana se resume en una sola elipsis; en medio, en dos. Anterior y Siguiente se deshabilitan en los bordes.",
    "paginationPage.positionLabel": "Página actual",
    "paginationPage.positionExplain.1": "En la primera: Anterior deshabilitada y una sola elipsis hacia el final.",
    "paginationPage.positionExplain.6": "En medio: las vecinas de la actual y una elipsis a cada lado.",
    "paginationPage.positionExplain.12": "En la última: una sola elipsis hacia el principio y Siguiente deshabilitada.",
    "paginationPage.position.1": "Primera",
    "paginationPage.position.6": "En medio",
    "paginationPage.position.12": "Última",
    "paginationPage.resultsTitle": "Debajo de unos resultados",
    "paginationPage.resultsBody": "El pager cierra la lista y, encima, una línea dice qué parte de los resultados se ve.",
    "paginationPage.dd.total.title": "Decir dónde estás",
    "paginationPage.dd.total.do": "Una línea con el rango y el total junto al pager: se sabe cuánto falta.",
    "paginationPage.dd.total.dont": "Solo los números: no se sabe si son 3 páginas o 300 resultados.",
    "demo.pagination.dd.row": "Resultado",
    "paginationPage.guidelinesLede": "Las páginas dan un lugar al que volver, a cambio de un clic por cada salto.",
    "paginationPage.dd.few.title": "Páginas: solo cuando hacen falta",
    "paginationPage.dd.few.do": "Pagina una lista que no cabe en una vista.",
    "paginationPage.dd.few.dont": "Dos páginas de resultados se leen mejor juntas: el control cuesta más de lo que ahorra.",
    "paginationPage.dd.below.title": "Lugar: debajo de la lista",
    "paginationPage.dd.below.do": "Pon la paginación al final, donde termina la lectura.",
    "paginationPage.dd.below.dont": "Arriba de la lista, obliga a volver a subir para seguir.",
  },
  en: {
    "demo.pagination.label": "Pagination",
    "demo.pagination.previous": "Previous page",
    "demo.pagination.next": "Next page",

    "paginationPage.description": "Moves through a long list split into pages, one at a time.",

    "paginationPage.key.enter": "Goes to that page.",

    "paginationPage.key.tab": "Moves through the pages and arrows.",

    "paginationPage.a11yYours2": "On a page change, move focus to the start of the new list.",

    "paginationPage.a11yYours1": "Name the <code>&lt;nav&gt;</code> if there is another one on the page.",

    "paginationPage.a11yDoes3": "The ellipsis is decorative.",

    "paginationPage.a11yDoes2": "Previous and Next have an accessible name even when they only show an arrow.",

    "paginationPage.a11yDoes1": 'The current page is announced with <code>aria-current="page"</code>.',

    "paginationPage.a11yIntro": "Pagination is a <code>&lt;nav&gt;</code> with native links or buttons.",

    "paginationPage.content2": "If it matters, say the total nearby: “Results 21 to 30 of 214”.",

    "paginationPage.content1": 'Name the control: <code>aria-label="Result pages"</code>.',

    "paginationPage.whenNot3": 'For the steps of a process: use <a href="/components/steps">Steps</a>.',

    "paginationPage.whenNot2": 'For a stream read straight through: load more at the end, with <a href="/components/feed">Feed</a>.',

    "paginationPage.whenNot1": 'For a table with rows per page: use <a href="/components/table-pager">TablePager</a>.',

    "paginationPage.when2": "When people need to return to a specific place: “I was on page 4”.",

    "paginationPage.when1": "For a long list that does not fit in a view: results, an archive.",

    "paginationPage.contract3": "The arrows are the linked set's <code>chevron-left</code> and <code>chevron-right</code> icons.",

    "paginationPage.contract2": "Previous and Next are disabled at the edges.",

    "paginationPage.contract1": 'The current page carries <code>aria-current="page"</code>.',

    "paginationPage.twelveBody": "The first and last are always there; around the current one, its neighbors; the rest collapse into “…”.",

    "paginationPage.twelveTitle": "Twelve pages: the ends always in view",
    "paginationPage.lede": "Pagination moves through a long list split into pages, one at a time: search results, an article archive. It says which page you are on and lets you jump to the first, the last and the neighbors.",
    "paginationPage.anatomyBody":
      "This diagram names prev, the ellipsis, the current page, its neighbours (the ones <code>siblings</code> keeps) and next. The specimen is frozen; the live pagination starts below.",
    "paginationPage.anatomyLabel": "Pagination anatomy",
    "paginationPage.anatomyPreviewLabel": "Pagination, part by part",
    "paginationPage.rangeTitle": "The window: a core function",
    "paginationPage.rangeBody": "Which pages show is computed by a pure function, the same in both bindings:",
    "paginationPage.test1": "Marks the current page and disables prev/next at the bounds.",
    "paginationPage.test2": "Collapses far pages behind an ellipsis and reports clicks clamped to range.",
    "demo.pagination.status": "Results 21 to 30 of 214",
    "paginationPage.appearanceTitle": "Appearance: how the current page is drawn",
    "paginationPage.appearanceBody": "Only how the page you are on looks changes; the numbers, the arrows and the spacing stay put.",
    "paginationPage.appearance.plain": "Plain, the default: the current page in a soft box.",
    "paginationPage.appearance.tactile": "Tactile: the current page is a key on a ledge; pressing sinks it.",
    "paginationPage.appearance.brutalist": "Brutalist: a black-edged block with a hard shadow.",
    "paginationPage.appearance.frosted": "Frosted: a see-through sheet over whatever is behind.",
    "paginationPage.siblingsTitle": "Siblings: how many neighbours stay",
    "paginationPage.siblingsBody": "Twenty pages, on the 8th: the first and last are always there, and <code>siblings</code> says how many more show on each side of the current one.",
    "paginationPage.siblingsLabel": "Neighbours on each side",
    "paginationPage.siblings.0": "0 neighbours",
    "paginationPage.siblings.1": "1 neighbour",
    "paginationPage.siblings.2": "2 neighbours",
    "paginationPage.siblingsExplain.0": "Only the current page between the ends: the shortest pager, for a narrow space.",
    "paginationPage.siblingsExplain.1": "The default: the current page with one neighbour on each side.",
    "paginationPage.siblingsExplain.2": "Two on each side: more to jump to without going through the ends.",
    "paginationPage.positionTitle": "Where you are: the window adjusts",
    "paginationPage.positionBody": "At an end the window collapses into a single ellipsis; in the middle, into two. Previous and Next are disabled at the edges.",
    "paginationPage.positionLabel": "Current page",
    "paginationPage.positionExplain.1": "On the first: Previous disabled and a single ellipsis toward the end.",
    "paginationPage.positionExplain.6": "In the middle: the current page's neighbours and an ellipsis on each side.",
    "paginationPage.positionExplain.12": "On the last: a single ellipsis toward the start and Next disabled.",
    "paginationPage.position.1": "First",
    "paginationPage.position.6": "Middle",
    "paginationPage.position.12": "Last",
    "paginationPage.resultsTitle": "Under a list of results",
    "paginationPage.resultsBody": "The pager closes the list and, above it, a line says which part of the results is showing.",
    "paginationPage.dd.total.title": "Saying where you are",
    "paginationPage.dd.total.do": "A line with the range and the total beside the pager: people know how much is left.",
    "paginationPage.dd.total.dont": "Only the numbers: there is no telling whether it is 3 pages or 300 results.",
    "demo.pagination.dd.row": "Result",
    "paginationPage.guidelinesLede": "Pages give a place to come back to, at the cost of a click per jump.",
    "paginationPage.dd.few.title": "Pages: only when needed",
    "paginationPage.dd.few.do": "Paginate a list that does not fit in a view.",
    "paginationPage.dd.few.dont": "Two pages of results read better together: the control costs more than it saves.",
    "paginationPage.dd.below.title": "Place: below the list",
    "paginationPage.dd.below.do": "Put the pagination at the end, where reading stops.",
    "paginationPage.dd.below.dont": "Above the list, it makes people scroll back up to continue.",
  },
} as const;
