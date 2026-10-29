export const searchFieldMessages = {
  es: {
    "searchField.description": "Un campo de búsqueda con lupa, un botón para borrar y, si hace falta, el formulario que la envía.",
    "searchField.lede":
      "SearchField recibe lo que alguien busca. El valor es lo que escribió, no una opción de una lista. Un botón y <kbd>Escape</kbd> lo borran. Con <code>action</code>, es un formulario que envía la búsqueda a otra página.",

    "searchField.filterTitle": "Filtrar en la página",
    "searchField.filterBody": "Sin <code>action</code>: la búsqueda filtra algo que ya está en pantalla mientras se escribe. Escucha el evento <code>input</code>; borrar también lo dispara.",
    "searchField.formTitle": "Buscar en el sitio",
    "searchField.formBody": 'Con <code>action</code>: un <code>&lt;form role="search"&gt;</code> que envía por GET, con su botón. Aquí la etiqueta queda solo para lectores de pantalla con <code>labelVisuallyHidden</code>.',

    "searchField.filterLabel": "Buscar personas",
    "searchField.filterPlaceholder": "Nombre o correo",
    "searchField.formLabel": "Buscar en la ayuda",
    "searchField.submit": "Buscar",
    "searchField.clearLabel": "Borrar búsqueda",

    "searchField.contract1": "El campo es un <code>sk-input</code>: tamaños, apariencias y estados vienen de Input.",
    "searchField.contract2": "El botón de borrar se oculta mientras el campo está vacío.",
    "searchField.contract3": "<kbd>Escape</kbd> solo se usa si hay texto. Con el campo vacío, sigue de largo y puede cerrar el diálogo que lo contiene.",

    "searchField.anatomyBody": "La etiqueta, la lupa, el campo con el botón de borrar dentro y, en el formulario, el botón de enviar.",
    "searchField.anatomyLabel": "Partes de SearchField",
    "searchField.anatomyPreviewLabel": "Anatomía",

    "searchField.guidelinesLede": "Úsalo cuando lo escrito es la búsqueda misma.",
    "searchField.when1": "Para filtrar una lista, una tabla o una grilla mientras se escribe.",
    "searchField.when2": "Para buscar en todo el sitio o en un centro de ayuda.",
    "searchField.whenNot1": 'Si el valor tiene que ser una opción conocida: usa <a href="/es/componentes/combobox">Combobox</a>.',
    "searchField.whenNot2": 'Para abrir comandos y destinos con el teclado: usa <a href="/es/componentes/command-palette">CommandPalette</a>.',
    "searchField.content1": "Nombra lo que se busca: «Buscar personas», no solo «Buscar».",
    "searchField.content2": "El placeholder da un ejemplo de qué escribir, nunca reemplaza la etiqueta.",

    "searchField.a11yIntro": "SearchField es un <code>&lt;input type=\"search\"&gt;</code> nativo con su etiqueta.",
    "searchField.a11yDoes1": "La etiqueta nombra el campo, también cuando está oculta a la vista.",
    "searchField.a11yDoes2": "Al borrar, el foco vuelve al campo.",
    "searchField.a11yDoes3": 'El formulario es un landmark <code>search</code> al que se puede saltar.',
    "searchField.a11yYours1": "Anuncia cuántos resultados quedan cuando el filtro cambia la página.",
    "searchField.key.escape": "Borra la búsqueda, si hay texto.",
  },
  en: {
    "searchField.description": "A search box with a magnifier, a clear button and, when needed, the form that submits it.",
    "searchField.lede":
      "SearchField takes what someone is looking for. The value is whatever they typed, not an option from a list. A button and <kbd>Escape</kbd> clear it. With <code>action</code>, it is a form that sends the query to another page.",

    "searchField.filterTitle": "Filter on the page",
    "searchField.filterBody": "No <code>action</code>: the query filters something already on screen as it is typed. Listen to the <code>input</code> event; clearing fires it too.",
    "searchField.formTitle": "Search the site",
    "searchField.formBody": 'With <code>action</code>: a <code>&lt;form role="search"&gt;</code> that submits as a GET, with its button. Here the label is for screen readers only, through <code>labelVisuallyHidden</code>.',

    "searchField.filterLabel": "Search people",
    "searchField.filterPlaceholder": "Name or email",
    "searchField.formLabel": "Search help",
    "searchField.submit": "Search",
    "searchField.clearLabel": "Clear search",

    "searchField.contract1": "The field is an <code>sk-input</code>: sizes, appearances and states come from Input.",
    "searchField.contract2": "The clear button is hidden while the field is empty.",
    "searchField.contract3": "<kbd>Escape</kbd> is only used when there is text. With the field empty, it passes through and can close the dialog around it.",

    "searchField.anatomyBody": "The label, the magnifier, the field with the clear button inside and, in the form, the submit button.",
    "searchField.anatomyLabel": "Parts of SearchField",
    "searchField.anatomyPreviewLabel": "Anatomy",

    "searchField.guidelinesLede": "Use it when what is typed is the query itself.",
    "searchField.when1": "To filter a list, a table or a grid as someone types.",
    "searchField.when2": "To search the whole site or a help centre.",
    "searchField.whenNot1": 'When the value has to be a known option: use <a href="/components/combobox">Combobox</a>.',
    "searchField.whenNot2": 'To open commands and destinations from the keyboard: use <a href="/components/command-palette">CommandPalette</a>.',
    "searchField.content1": "Name what is searched: “Search people”, not just “Search”.",
    "searchField.content2": "The placeholder gives an example of what to type, never replaces the label.",

    "searchField.a11yIntro": "SearchField is a native <code>&lt;input type=\"search\"&gt;</code> with its label.",
    "searchField.a11yDoes1": "The label names the field, also when it is hidden from view.",
    "searchField.a11yDoes2": "Clearing hands focus back to the field.",
    "searchField.a11yDoes3": "The form is a <code>search</code> landmark a screen reader can jump to.",
    "searchField.a11yYours1": "Announce how many results remain when the filter changes the page.",
    "searchField.key.escape": "Clears the query, when there is text.",
  },
} as const;
