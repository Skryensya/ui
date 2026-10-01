export const tablePagerMessages = {
  es: {
    "tablePager.description": "Divide en páginas las filas de una tabla que ya están en la página.",
    "tablePager.key.enter": "Va a esa página.",
    "tablePager.key.tab": "Recorre el tamaño, las páginas y las flechas.",
    "tablePager.a11yYours2": "Al cambiar de página, considera anunciar el rango nuevo.",
    "tablePager.a11yYours1": "Traduce los nombres de anterior y siguiente.",
    "tablePager.a11yDoes2": 'La página actual se marca con <code>aria-current="page"</code>.',
    "tablePager.a11yDoes1": "El <code>nav</code> lleva <code>aria-label</code> (<code>navLabel</code>).",
    "tablePager.a11yIntro": "TablePager agrega un <code>&lt;nav&gt;</code> con botones nativos debajo de la tabla.",
    "tablePager.content2": "Ofrece tamaños redondos: 10, 25, 50.",
    "tablePager.content1": "Di el rango con el total: «21–30 de 214».",
    "tablePager.whenNot2": 'Para una tabla con orden, filtros y selección: usa <a href="/es/componentes/data-grid">DataGrid</a>.',
    "tablePager.whenNot1": 'Si los datos llegan paginados del servidor: usa <a href="/es/componentes/pagination">Pagination</a>.',
    "tablePager.when2": "Cuando conviene elegir cuántas filas ver por página.",
    "tablePager.when1": "Para una tabla con todas sus filas ya en el HTML, demasiadas para verlas de una vez.",
    "tablePager.contract3": "Con datos paginados en el servidor, usa Pagination y controla tú la consulta.",
    "tablePager.contract2": "Cada cambio dispara <code>sk:tablepagerchange</code> con <code>{ page, pageSize, pageCount, total, start, end }</code>.",
    "tablePager.contract1": "Pagina en el navegador: oculta las filas que no están en la página actual.",
    "tablePager.anatomyBody":
      'La tabla va primero y la barra después. La barra tiene el tamaño de página al inicio (opcional) y, al final, el rango visible (opcional) junto al <code>nav</code>, que el enhancer llena con los controles de <a class="sk-link sk-interactive" href="/es/componentes/pagination">Pagination</a>.',
    "tablePager.anatomyLabel": "Partes de TablePager",
    "tablePager.anatomyPreviewLabel": "Anatomía",

    "tablePager.lede": 'TablePager divide en páginas las filas de una tabla que ya están todas en la página: una lista de pedidos, un registro de actividad. Dice qué filas estás viendo y deja elegir cuántas por página. La tabla sigue siendo una <a href="/es/componentes/table">Table</a>.',


    "tablePager.fullTitle": "Completo: tamaño, rango y páginas",
    "tablePager.fullBody": "Un Select cambia cuántas filas por página; al cambiarlo, vuelve a la primera.",

    "tablePager.minimalTitle": "Mínimo: solo las páginas",
    "tablePager.minimalBody": "El tamaño y el rango son opcionales; la navegación no.",


    "demo.tablePager.dd.between": "Estas cifras se actualizan cada hora.",
    "tablePager.guidelinesLede": "Páginas cortas hacen una tabla larga recorrible, a cambio de un clic por página.",
    "tablePager.dd.attached.title": "Lugar: pegado a su tabla",
    "tablePager.dd.attached.do": "La barra va justo debajo de la tabla que pagina.",
    "tablePager.dd.attached.dont": "Separada por otro contenido, no queda claro qué pagina.",
  },
  en: {
    "tablePager.description": "Splits into pages the rows of a table that are already on the page.",
    "tablePager.key.enter": "Goes to that page.",
    "tablePager.key.tab": "Moves through the size, the pages and the arrows.",
    "tablePager.a11yYours2": "On a page change, consider announcing the new range.",
    "tablePager.a11yYours1": "Translate the previous and next names.",
    "tablePager.a11yDoes2": 'The current page is marked with <code>aria-current="page"</code>.',
    "tablePager.a11yDoes1": "The <code>nav</code> carries an <code>aria-label</code> (<code>navLabel</code>).",
    "tablePager.a11yIntro": "TablePager adds a <code>&lt;nav&gt;</code> with native buttons below the table.",
    "tablePager.content2": "Offer round sizes: 10, 25, 50.",
    "tablePager.content1": "State the range with the total: “21–30 of 214”.",
    "tablePager.whenNot2": 'For a table with sorting, filters and selection: use <a href="/components/data-grid">DataGrid</a>.',
    "tablePager.whenNot1": 'If data comes paginated from the server: use <a href="/components/pagination">Pagination</a>.',
    "tablePager.when2": "When it helps to choose how many rows to see per page.",
    "tablePager.when1": "For a table with all its rows already in the HTML, too many to see at once.",
    "tablePager.contract3": "With server-paginated data, use Pagination and drive the query yourself.",
    "tablePager.contract2": "Every change fires <code>sk:tablepagerchange</code> with <code>{ page, pageSize, pageCount, total, start, end }</code>.",
    "tablePager.contract1": "It pages in the browser: it hides the rows not on the current page.",
    "tablePager.anatomyBody":
      'The table comes first and the bar after it. The bar has the page size at its start (optional) and, at its end, the visible range (optional) next to the <code>nav</code>, which the enhancer fills with <a class="sk-link sk-interactive" href="/components/pagination">Pagination</a>\'s controls.',
    "tablePager.anatomyLabel": "TablePager parts",
    "tablePager.anatomyPreviewLabel": "Anatomy",

    "tablePager.lede": 'TablePager splits into pages the rows of a table that are all already on the page: a list of orders, an activity log. It says which rows you are viewing and lets you choose how many per page. The table is still a <a href="/components/table">Table</a>.',


    "tablePager.fullTitle": "Full: size, range and pages",
    "tablePager.fullBody": "A Select changes how many rows per page; changing it returns to the first.",

    "tablePager.minimalTitle": "Minimal: just the pages",
    "tablePager.minimalBody": "Size and range are optional; navigation is not.",


    "demo.tablePager.dd.between": "These figures update every hour.",
    "tablePager.guidelinesLede": "Short pages make a long table browsable, at the cost of a click per page.",
    "tablePager.dd.attached.title": "Place: attached to its table",
    "tablePager.dd.attached.do": "The bar sits right under the table it pages.",
    "tablePager.dd.attached.dont": "Separated by other content, it is unclear what it pages.",
  },
} as const;
