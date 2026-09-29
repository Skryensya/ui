export const tablePagerMessages = {
  es: {
    "tablePager.description": "Pagina en el cliente las filas de una tabla escrita a mano, con tamaño de página opcional.",
    "tablePager.betaBadge": "Beta",
    "tablePager.anatomyBody":
      "La tabla va primero y la barra después. La barra tiene el tamaño de página al inicio (opcional) y, al final, el rango visible (opcional) junto al <code>nav</code>, que el enhancer llena con los controles de <a class=\"sk-link sk-interactive\" href=\"/es/componentes/pagination\">Pagination</a>.",
    "tablePager.anatomyLabel": "Partes de TablePager",
    "tablePager.anatomyPreviewLabel": "Anatomía",

    "tablePager.lede":
      "TablePager no dibuja la tabla: la tabla sigue siendo <a class=\"sk-link sk-interactive\" href=\"/es/componentes/table\">Table</a>. Lo que agrega es la composición alrededor y un enhancer que oculta las filas del <code>&lt;tbody&gt;</code> que no caen en la página actual, genera los botones del <code>nav</code> y reescribe el rango. El mismo código corre en Vanilla y en React.",

    "tablePager.whenTitle": "Cuándo usarlo",
    "tablePager.whenItem1": "Una tabla con todas sus filas ya en el HTML, demasiadas para verlas de una vez",
    "tablePager.whenItem2": "Cuando quien la lee tiene que poder elegir cuántas filas ver por página",
    "tablePager.whenItem3":
      "No cuando los datos llegan paginados del servidor: ahí la aplicación controla la consulta y usa <a class=\"sk-link sk-interactive\" href=\"/es/componentes/pagination\">Pagination</a> sola",

    "tablePager.fullTitle": "Con tamaño de página",
    "tablePager.fullBody":
      "Un <a class=\"sk-link sk-interactive\" href=\"/es/componentes/select\">Select</a> dentro de <code>TablePagerSize</code> cambia <code>pageSize</code>: el enhancer escucha su cambio y vuelve a la primera página. <code>statusTemplate</code> arma el rango con <code>{start}</code>, <code>{end}</code> y <code>{total}</code>. Con <code>data-layout=\"fixed\"</code> en la tabla, los anchos de columna no saltan entre páginas.",
    "tablePager.fullPreviewLabel": "TablePager con tamaño de página",

    "tablePager.minimalTitle": "Solo navegación",
    "tablePager.minimalBody":
      "<code>TablePagerSize</code> y <code>TablePagerStatus</code> son opcionales. <code>TablePagerEnd</code> y su <code>TablePagerNav</code> no lo son: sin ellos no hay cómo cambiar de página.",
    "tablePager.minimalPreviewLabel": "TablePager solo con navegación",

    "tablePager.eventsTitle": "Escuchar el cambio",
    "tablePager.eventsBody":
      "Cada cambio de página o de tamaño dispara <code>sk:tablepagerchange</code> en la raíz, con <code>{ page, pageSize, pageCount, total, start, end }</code>. En React no hay prop para este evento: se escucha en el elemento.",

    "tablePager.a11yBody":
      "El <code>nav</code> lleva <code>aria-label</code> (<code>navLabel</code>) y la página actual se marca con <code>aria-current=\"page\"</code>. Los botones de anterior y siguiente se nombran con <code>previousLabel</code> y <code>nextLabel</code>, y cada número con <code>pageLabel</code>; sus valores por defecto están en inglés, así que en otra lengua hay que traducirlos. El rango es <code>role=\"status\"</code>, así que un lector de pantalla anuncia el nuevo rango al cambiar de página.",
  },
  en: {
    "tablePager.description": "Pages a hand-written table's rows on the client, with an optional page size.",
    "tablePager.betaBadge": "Beta",
    "tablePager.anatomyBody":
      "The table comes first and the bar after it. The bar has the page size at its start (optional) and, at its end, the visible range (optional) next to the <code>nav</code>, which the enhancer fills with <a class=\"sk-link sk-interactive\" href=\"/components/pagination\">Pagination</a>'s controls.",
    "tablePager.anatomyLabel": "TablePager parts",
    "tablePager.anatomyPreviewLabel": "Anatomy",

    "tablePager.lede":
      "TablePager does not draw the table: the table is still <a class=\"sk-link sk-interactive\" href=\"/components/table\">Table</a>. What it adds is the composition around it and an enhancer that hides the <code>&lt;tbody&gt;</code> rows outside the current page, generates the <code>nav</code>'s buttons and rewrites the range. The same code runs in Vanilla and in React.",

    "tablePager.whenTitle": "When to use it",
    "tablePager.whenItem1": "A table with all its rows already in the HTML, too many to see at once",
    "tablePager.whenItem2": "When the reader has to be able to choose how many rows to see per page",
    "tablePager.whenItem3":
      "Not when the data arrives paged from the server: there the application controls the query and uses <a class=\"sk-link sk-interactive\" href=\"/components/pagination\">Pagination</a> on its own",

    "tablePager.fullTitle": "With a page size",
    "tablePager.fullBody":
      "A <a class=\"sk-link sk-interactive\" href=\"/components/select\">Select</a> inside <code>TablePagerSize</code> changes <code>pageSize</code>: the enhancer listens for its change and goes back to the first page. <code>statusTemplate</code> builds the range from <code>{start}</code>, <code>{end}</code> and <code>{total}</code>. With <code>data-layout=\"fixed\"</code> on the table, column widths do not jump between pages.",
    "tablePager.fullPreviewLabel": "TablePager with a page size",

    "tablePager.minimalTitle": "Navigation only",
    "tablePager.minimalBody":
      "<code>TablePagerSize</code> and <code>TablePagerStatus</code> are optional. <code>TablePagerEnd</code> and its <code>TablePagerNav</code> are not: without them there is no way to change page.",
    "tablePager.minimalPreviewLabel": "TablePager with navigation only",

    "tablePager.eventsTitle": "Listening for the change",
    "tablePager.eventsBody":
      "Every page or size change fires <code>sk:tablepagerchange</code> on the root, with <code>{ page, pageSize, pageCount, total, start, end }</code>. React has no prop for this event: listen for it on the element.",

    "tablePager.a11yBody":
      "The <code>nav</code> carries <code>aria-label</code> (<code>navLabel</code>) and the current page is marked <code>aria-current=\"page\"</code>. The previous and next buttons are named by <code>previousLabel</code> and <code>nextLabel</code>, and each number by <code>pageLabel</code>; their defaults are English, so in another language they have to be translated. The range is <code>role=\"status\"</code>, so a screen reader announces the new range when the page changes.",
  },
} as const;
