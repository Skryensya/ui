export const paginationMessages = {
  es: {
    "demo.pagination.label": "Paginación",
    "demo.pagination.previous": "Página anterior",
    "demo.pagination.next": "Página siguiente",

    "paginationPage.description": "Pagination: ventana de páginas como función pura del core, con primera, última y elipsis.",
    "paginationPage.lede":
      "Pagination recorre un conjunto paginado, una página a la vez. La ventana visible es la parte interesante, y vive como función pura en el core: primera y última siempre presentes, la actual con un hermano a cada lado, y las corridas ocultas colapsan en una elipsis.",
    "paginationPage.anatomyBody":
      "Este diagrama nombra prev, los ítems, la elipsis y next. El espécimen está congelado; la paginación viva empieza abajo.",
    "paginationPage.anatomyLabel": "Anatomía de Pagination",
    "paginationPage.anatomyPreviewLabel": "Pagination, parte por parte",
    "paginationPage.body":
      'Prev/next usan los roles <code>chevron-left</code> y <code>chevron-right</code> del set. La página actual lleva <code>aria-current="page"</code>; prev/next se deshabilitan en los bordes. La elipsis es texto inerte, no un objetivo. Los targets llevan <code>sk-interactive</code>.',
    "paginationPage.rangeTitle": "La ventana, en el core",
    "paginationPage.rangeBody": "El renderizado y los handlers son del binding; el cálculo es del core y es testeable en aislamiento:",
    "paginationPage.reactBody": "React dibuja los chevrons del set enlazado.",
    "paginationPage.test1": "Marca la página actual y deshabilita prev/next en los límites.",
    "paginationPage.test2": "Colapsa páginas lejanas detrás de una elipsis y reporta clicks acotados al rango.",
    "demo.pagination.dd.row": "Resultado",
    "paginationPage.showcaseTitle": "Showcases",
    "paginationPage.showcaseBody": "Doce páginas con la actual marcada y los extremos siempre a la vista.",
    "paginationPage.guidelinesLede": "Pagination divide una lista larga en páginas y dice en cuál estás.",
    "paginationPage.dd.few.title": "Solo cuando hacen falta páginas",
    "paginationPage.dd.few.do": "Pagina una lista que no cabe en una sola vista.",
    "paginationPage.dd.few.dont": "Dos páginas de resultados se leen mejor juntas: el control cuesta más de lo que ahorra.",
    "paginationPage.dd.below.title": "Debajo de la lista",
    "paginationPage.dd.below.do": "Pon la paginación al final, donde termina la lectura.",
    "paginationPage.dd.below.dont": "Arriba de la lista, obliga a volver a subir para seguir.",
  },
  en: {
    "demo.pagination.label": "Pagination",
    "demo.pagination.previous": "Previous page",
    "demo.pagination.next": "Next page",

    "paginationPage.description": "Pagination: a page window as a pure function from core, with first, last, and ellipsis.",
    "paginationPage.lede":
      "Pagination moves through a paginated set, one page at a time. The visible window is the interesting part, and it lives as a pure function in core: first and last always present, the current page with one sibling on each side, and hidden runs collapsing into an ellipsis.",
    "paginationPage.anatomyBody":
      "This diagram names prev, the items, the ellipsis, and next. The specimen is frozen; the live pagination starts below.",
    "paginationPage.anatomyLabel": "Pagination anatomy",
    "paginationPage.anatomyPreviewLabel": "Pagination, part by part",
    "paginationPage.body":
      'Prev/next use the set\'s <code>chevron-left</code> and <code>chevron-right</code> roles. The current page carries <code>aria-current="page"</code>; prev/next disable at the edges. The ellipsis is inert text, never a target. The targets carry <code>sk-interactive</code>.',
    "paginationPage.rangeTitle": "The window, in core",
    "paginationPage.rangeBody": "Rendering and handlers belong to the binding; the calculation belongs to core and is testable in isolation:",
    "paginationPage.reactBody": "React draws the chevrons from the linked set.",
    "paginationPage.test1": "Marks the current page and disables prev/next at the bounds.",
    "paginationPage.test2": "Collapses far pages behind an ellipsis and reports clicks clamped to range.",
    "demo.pagination.dd.row": "Result",
    "paginationPage.showcaseTitle": "Showcases",
    "paginationPage.showcaseBody": "Twelve pages, with the current one marked and both ends always in view.",
    "paginationPage.guidelinesLede": "Pagination splits a long list into pages and says which one you are on.",
    "paginationPage.dd.few.title": "Only when pages are needed",
    "paginationPage.dd.few.do": "Paginate a list that does not fit in one view.",
    "paginationPage.dd.few.dont": "Two pages of results read better together: the control costs more than it saves.",
    "paginationPage.dd.below.title": "Below the list",
    "paginationPage.dd.below.do": "Put the pagination at the end, where reading stops.",
    "paginationPage.dd.below.dont": "Above the list, it makes people scroll back up to continue.",
  },
} as const;
