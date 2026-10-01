export const tagsInputMessages = {
  es: {
    "demo.tagsInput.label": "Temas",
    "demo.tagsInput.placeholder": "Agrega un tema",
    "demo.tagsInput.removeLabel": "Quitar",
    "demo.tagsInput.tag.react": "react",
    "demo.tagsInput.tag.svelte": "svelte",
    "demo.tagsInput.tag.css": "css",
    "demo.tagsInput.tag.a11y": "accesibilidad",
    "demo.tagsInput.emailsLabel": "Destinatarios",
    "demo.tagsInput.emailsPlaceholder": "nombre@ejemplo.cl",
    "demo.tagsInput.maxLabel": "Hasta tres habilidades",
    "demo.tagsInput.maxPlaceholder": "Agrega una habilidad",
    "demo.tagsInput.readOnlyLabel": "Temas asignados",
    "demo.tagsInput.fieldLabel": "Temas de interés",
    "demo.tagsInput.fieldHint": "Escribe uno y presiona Enter, o sepáralos con comas.",

    "tagsInputPage.description": "Recibe varios valores cortos escritos en un mismo campo.",

    "tagsInputPage.key.arrows": "Recorre los valores.",

    "tagsInputPage.key.back": "Con la entrada vacía, selecciona o quita el último valor.",

    "tagsInputPage.key.add": "Agrega el texto escrito como valor.",

    "tagsInputPage.a11yYours2": "Si hay un máximo, dilo antes, en la ayuda: pasarlo no avisa.",

    "tagsInputPage.a11yYours1": "Traduce <code>removeLabel</code>.",

    "tagsInputPage.a11yDoes2": "<kbd>Backspace</kbd> en la entrada vacía selecciona el último valor.",

    "tagsInputPage.a11yDoes1": "Cada botón de quitar tiene nombre accesible.",

    "tagsInputPage.a11yIntro": "TagsInput es una entrada de texto con una lista de Tags delante.",

    "tagsInputPage.content2": "Di en la ayuda cómo se agrega y el límite: «Separa con coma. Hasta 5».",

    "tagsInputPage.content1": "Nombra el campo en plural: «Temas», «Destinatarios».",

    "tagsInputPage.whenNot3": 'Si lo que se agrega son archivos: usa <a href="/es/componentes/file-upload">FileUpload</a>.',

    "tagsInputPage.whenNot2": 'Para filtros aplicados o palabras clave que solo se muestran: usa <a href="/es/componentes/tag">Tag</a>.',

    "tagsInputPage.whenNot1": 'Si los valores salen de una lista conocida: usa <a href="/es/componentes/combobox">Combobox</a>.',

    "tagsInputPage.when1": "Para varios valores escritos en un mismo campo: temas, destinatarios, habilidades.",

    "tagsInputPage.contract4": "<code>label</code> es obligatorio y nombra la entrada de texto, no la caja.",

    "tagsInputPage.contract3": "Con <code>allowDuplicates</code> apagado, un repetido se descarta en silencio.",

    "tagsInputPage.contract2": "Un campo oculto lleva el valor completo: el formulario lo envía sin JavaScript de por medio.",

    "tagsInputPage.contract1": "Los valores iniciales van como markup, un elemento cada uno: el campo se lee antes de que llegue el JavaScript.",

    "tagsInputPage.basicBody": "Cada valor es un Tag que se quita con su botón.",

    "tagsInputPage.basicTitle": "Con valores: los temas de un artículo",
    "tagsInputPage.lede": 'TagsInput recibe varios valores cortos escritos en un mismo campo: los temas de un artículo, los destinatarios de un correo, las habilidades de un perfil. Acepta lo que se escriba; si los valores salen de una lista conocida, es un <a href="/es/componentes/combobox">Combobox</a>.',
    "tagsInputPage.anatomyBody":
      "El diagrama nombra el campo, la caja que lo dibuja, un chip y la entrada que comparte la fila con ellos.",
    "tagsInputPage.anatomyLabel": "Anatomía de TagsInput",
    "tagsInputPage.anatomyPreviewLabel": "TagsInput, parte por parte",
    "tagsInputPage.emptyTitle": "Vacío: Enter o coma para agregar",
    "tagsInputPage.emptyBody": "La coma también confirma, así una lista pegada se reparte sola.",
    "tagsInputPage.maxTitle": "Con máximo: max",
    "tagsInputPage.maxBody": "Pasado el máximo, el valor no se agrega y el texto queda en el campo. Di el límite en la ayuda.",
    "tagsInputPage.readOnlyTitle": "Solo lectura: se lee, no se edita",
    "tagsInputPage.readOnlyBody": "Conserva su forma y pierde los botones de quitar.",
    "tagsInputPage.fieldTitle": "En un FormField: etiqueta, ayuda y error",
    "tagsInputPage.fieldBody": 'La etiqueta visible, la ayuda y el error son de <a href="/es/componentes/form-field">FormField</a>.',
    "demo.tagsInput.dd.long1": "Todo lo relacionado con el diseño de la interfaz",
    "demo.tagsInput.dd.long2": "Preguntas sobre facturación y pagos",
    "tagsInputPage.guidelinesLede": "Varios valores en un campo ahorran filas, a cambio de que cada uno sea corto.",
    "tagsInputPage.dd.short.title": "Valores: cortos",
    "tagsInputPage.dd.short.do": "Una o dos palabras por etiqueta.",
    "tagsInputPage.dd.short.dont": "Frases largas llenan el campo y dejan de leerse como etiquetas.",
  },
  en: {
    "demo.tagsInput.label": "Topics",
    "demo.tagsInput.placeholder": "Add a topic",
    "demo.tagsInput.removeLabel": "Remove",
    "demo.tagsInput.tag.react": "react",
    "demo.tagsInput.tag.svelte": "svelte",
    "demo.tagsInput.tag.css": "css",
    "demo.tagsInput.tag.a11y": "accessibility",
    "demo.tagsInput.emailsLabel": "Recipients",
    "demo.tagsInput.emailsPlaceholder": "name@example.org",
    "demo.tagsInput.maxLabel": "Up to three skills",
    "demo.tagsInput.maxPlaceholder": "Add a skill",
    "demo.tagsInput.readOnlyLabel": "Assigned topics",
    "demo.tagsInput.fieldLabel": "Topics of interest",
    "demo.tagsInput.fieldHint": "Type one and press Enter, or separate them with commas.",

    "tagsInputPage.description": "Takes several short values typed into a single field.",

    "tagsInputPage.key.arrows": "Moves through the values.",

    "tagsInputPage.key.back": "With the input empty, selects or removes the last value.",

    "tagsInputPage.key.add": "Adds the typed text as a value.",

    "tagsInputPage.a11yYours2": "If there is a maximum, say it first, in the hint: going past it gives no warning.",

    "tagsInputPage.a11yYours1": "Translate <code>removeLabel</code>.",

    "tagsInputPage.a11yDoes2": "<kbd>Backspace</kbd> in the empty input selects the last value.",

    "tagsInputPage.a11yDoes1": "Each remove button has an accessible name.",

    "tagsInputPage.a11yIntro": "TagsInput is a text input with a list of Tags in front of it.",

    "tagsInputPage.content2": "Say in the hint how to add and the limit: “Separate with commas. Up to 5”.",

    "tagsInputPage.content1": "Name the field in the plural: “Topics”, “Recipients”.",

    "tagsInputPage.whenNot3": 'If what is added is files: use <a href="/components/file-upload">FileUpload</a>.',

    "tagsInputPage.whenNot2": 'For applied filters or keywords that are only shown: use <a href="/components/tag">Tag</a>.',

    "tagsInputPage.whenNot1": 'If values come from a known list: use <a href="/components/combobox">Combobox</a>.',

    "tagsInputPage.when1": "For several values typed into one field: topics, recipients, skills.",

    "tagsInputPage.contract4": "<code>label</code> is required and names the text input, not the box.",

    "tagsInputPage.contract3": "With <code>allowDuplicates</code> off, a repeat is silently discarded.",

    "tagsInputPage.contract2": "A hidden field carries the full value: the form submits it with no JavaScript in between.",

    "tagsInputPage.contract1": "Initial values go as markup, one element each: the field reads before the JavaScript arrives.",

    "tagsInputPage.basicBody": "Each value is a Tag removed with its button.",

    "tagsInputPage.basicTitle": "With values: an article's topics",
    "tagsInputPage.lede": 'TagsInput takes several short values typed into a single field: an article\'s topics, an email\'s recipients, a profile\'s skills. It accepts whatever is typed; if values come from a known list, it is a <a href="/components/combobox">Combobox</a>.',
    "tagsInputPage.anatomyBody":
      "The diagram names the field, the box that draws it, one chip, and the entry that shares the row with them.",
    "tagsInputPage.anatomyLabel": "TagsInput anatomy",
    "tagsInputPage.anatomyPreviewLabel": "TagsInput, part by part",
    "tagsInputPage.emptyTitle": "Empty: Enter or comma to add",
    "tagsInputPage.emptyBody": "A comma also confirms, so a pasted list splits by itself.",
    "tagsInputPage.maxTitle": "With a maximum: max",
    "tagsInputPage.maxBody": "Past the maximum, the value is not added and the text stays in the field. State the limit in the hint.",
    "tagsInputPage.readOnlyTitle": "Read-only: read, not edited",
    "tagsInputPage.readOnlyBody": "It keeps its shape and loses the remove buttons.",
    "tagsInputPage.fieldTitle": "In a FormField: label, hint and error",
    "tagsInputPage.fieldBody": 'The visible label, hint and error belong to <a href="/components/form-field">FormField</a>.',
    "demo.tagsInput.dd.long1": "Everything about interface design",
    "demo.tagsInput.dd.long2": "Questions about billing and payments",
    "tagsInputPage.guidelinesLede": "Several values in one field save rows, at the cost of each one being short.",
    "tagsInputPage.dd.short.title": "Values: short",
    "tagsInputPage.dd.short.do": "One or two words per tag.",
    "tagsInputPage.dd.short.dont": "Long phrases fill the field and stop reading as tags.",
  },
} as const;
