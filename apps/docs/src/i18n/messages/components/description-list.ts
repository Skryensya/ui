export const descriptionListMessages = {
  es: {
    "demo.descriptionList.order.term": "Pedido",
    "demo.descriptionList.order.value": "#4821",
    "demo.descriptionList.placed.term": "Fecha",
    "demo.descriptionList.placed.value": "10 de marzo de 2026",
    "demo.descriptionList.total.term": "Total",
    "demo.descriptionList.total.value": "$38.990",
    "demo.descriptionList.payment.term": "Medio de pago",
    "demo.descriptionList.payment.value": "Tarjeta terminada en 4417",
    "demo.descriptionList.status.term": "Estado",
    "demo.descriptionList.status.value": "Entregado",
    "demo.descriptionList.tracking.term": "Seguimiento",
    "demo.descriptionList.tracking.value": "4821-CL",
    "demo.descriptionList.spec.format.term": "Formato",
    "demo.descriptionList.spec.format.value": "PDF/A-2b",
    "demo.descriptionList.spec.size.term": "Tamaño",
    "demo.descriptionList.spec.size.value": "1,4 MB",
    "demo.descriptionList.spec.updated.term": "Actualizado",
    "demo.descriptionList.spec.updated.value": "14 de marzo de 2026",
    "demo.descriptionList.spec.licence.term": "Licencia",
    "demo.descriptionList.spec.licence.value": "CC BY 4.0",
    "demo.descriptionList.spec.sizeBare": "1,4",
    "demo.descriptionList.longTerm1": "Plataforma donde se realizó el pago",
    "demo.descriptionList.longValue1": "Tarjeta de crédito",
    "demo.descriptionList.longTerm2": "Dirección de correo para notificaciones",
    "demo.descriptionList.longValue2": "ana@example.com",
    "demo.descriptionList.missingValue": "Sin seguimiento",
    "demo.descriptionList.longLabel": "Identificador del pedido en el sistema de ventas",

    "descriptionListPage.description": "Muestra los datos de un registro como pares de nombre y valor.",

    "descriptionListPage.a11yYours2": "No uses la lista para alinear un formulario: los campos van en FormField.",

    "descriptionListPage.a11yYours1": "Pon un encabezado antes de la lista que diga de qué registro son los datos.",

    "descriptionListPage.a11yDoes2": "No recibe foco: los enlaces de un valor sí.",

    "descriptionListPage.a11yDoes1": "Usa <code>&lt;dl&gt;</code>, <code>&lt;dt&gt;</code> y <code>&lt;dd&gt;</code>; cada par va agrupado en su <code>&lt;div&gt;</code>.",

    "descriptionListPage.a11yIntro": "Es un <code>&lt;dl&gt;</code> nativo: los lectores de pantalla anuncian cada nombre con su valor.",

    "descriptionListPage.content3": "Si un valor falta, dilo: «Sin seguimiento», en vez de dejar la fila vacía.",

    "descriptionListPage.content2": "Escribe los valores completos, con su unidad: «1,4 MB», no «1.4».",

    "descriptionListPage.content1": "Usa nombres cortos, de 1 a 3 palabras, con mayúscula solo al inicio: «Medio de pago».",

    "descriptionListPage.dd.one.dont": "Tres pedidos en una lista repiten los nombres y obligan a comparar filas: eso es una Table.",

    "descriptionListPage.dd.one.do": "Los datos de un pedido: cada fila se lee sola.",

    "descriptionListPage.dd.one.title": "Registros: uno por lista",
    "descriptionListPage.dd.terms.title": "Layout: deja respirar los nombres largos",
    "descriptionListPage.dd.terms.do": "Con nombres largos, apila cada valor debajo de su nombre.",
    "descriptionListPage.dd.terms.dont": "En columnas, el nombre largo aprieta el espacio del valor.",
    "descriptionListPage.dd.units.title": "Valores: incluye la unidad",
    "descriptionListPage.dd.units.do": "«1,4 MB» dice cuánto pesa el archivo sin que haya que inferirlo.",
    "descriptionListPage.dd.units.dont": "«1,4» podría ser tamaño, cantidad o precio.",
    "descriptionListPage.dd.missing.title": "Datos faltantes: dilo explícitamente",
    "descriptionListPage.dd.missing.do": "«Sin seguimiento» explica por qué no hay un número.",
    "descriptionListPage.dd.missing.dont": "Una fila vacía parece un error o un dato olvidado.",
    "descriptionListPage.dd.labels.title": "Términos: etiquetas, no frases",
    "descriptionListPage.dd.labels.do": "«Pedido» se escanea rápido como nombre del dato.",
    "descriptionListPage.dd.labels.dont": "Una pregunta larga convierte el término en otro párrafo.",
    "descriptionListPage.dd.links.title": "Valores: haz que el destino sea un enlace",
    "descriptionListPage.dd.links.do": "El número de seguimiento se puede abrir para consultar el envío.",
    "descriptionListPage.dd.links.dont": "Una URL como texto no permite seguir el envío con un clic.",

    "descriptionListPage.whenNot3": 'Si es una lista de cosas y no de datos sobre una cosa: usa <a href="/es/componentes/list">List</a>.',

    "descriptionListPage.whenNot2": 'Si los pares son campos que la persona completa: usa <a href="/es/componentes/form-field">FormField</a>.',

    "descriptionListPage.whenNot1": 'Si los mismos campos se muestran para varios registros: usa <a href="/es/componentes/table">Table</a>.',

    "descriptionListPage.when2": "Cuando los nombres son cortos y cada fila se lee sola.",

    "descriptionListPage.when1": "Para los datos de un registro: el resumen de un pedido, los metadatos de un documento, las características de un producto.",

    "descriptionListPage.contract3": "No tiene enhancer: el markup está completo por sí solo.",

    "descriptionListPage.contract2": "La hoja quita la sangría y el margen del navegador.",

    "descriptionListPage.contract1": "Cada par va en un <code>&lt;div&gt;</code>, el agrupador que HTML admite dentro de <code>&lt;dl&gt;</code>: de ahí cuelgan el divisor y el layout.",

    "descriptionListPage.basicBody": "Tres pares apilados, la forma que resiste cualquier ancho y cualquier largo de nombre.",

    "descriptionListPage.basicTitle": "Un pedido: el caso base",
    "descriptionListPage.lede": 'DescriptionList muestra los datos de un registro como pares de nombre y valor: el resumen de un pedido, los metadatos de un documento, las características de un producto. Cada fila se lee sola; si hay que comparar varios registros, es una <a href="/es/componentes/table">Table</a>.',
    "descriptionListPage.anatomyBody": "La lista, cada par, el nombre y el valor.",
    "descriptionListPage.anatomyLabel": "Anatomía de DescriptionList",
    "descriptionListPage.anatomyPreviewLabel": "DescriptionList, parte por parte",
    "descriptionListPage.columnsTitle": "Columnas: el valor al lado",
    "descriptionListPage.columnsBody": "El ancho de la columna del nombre se ajusta con <code>--sk-description-list-term-size</code> si tus nombres son largos.",
    "descriptionListPage.dividedTitle": "Divisores y densidad: material de referencia",
    "descriptionListPage.dividedBody": '<code>dividers</code> separa las filas y <code>density="compact"</code> las acerca sin cambiar la tipografía.',
    "descriptionListPage.richTitle": "Valores con markup: un Tag, un enlace",
    "descriptionListPage.richBody": 'El valor acepta un <a href="/es/componentes/tag">Tag</a>, un enlace o una fecha. El nombre es texto: si necesita markup, es un encabezado.',
    "descriptionListPage.prop.layout.title": "Layout: el valor debajo o al lado",
    "descriptionListPage.prop.layout.body": "Pone cada valor debajo de su nombre o a su lado.",
    "descriptionListPage.prop.layout.stacked": "Usa <code>stacked</code>, el valor por defecto, en columnas angostas y en teléfonos.",
    "descriptionListPage.prop.layout.columns": "Usa <code>columns</code> en una vista ancha, para leer nombres y valores en dos columnas. Por debajo de 36rem vuelve a apilarse.",
    "descriptionListPage.prop.dividers.title": "Dividers: una línea entre pares",
    "descriptionListPage.prop.dividers.body": "<code>dividers</code> dibuja una línea entre pares.",
    "descriptionListPage.prop.dividers.false": "Usa <code>false</code> cuando son pocos pares y el espacio alcanza para separarlos.",
    "descriptionListPage.prop.dividers.true": "Usa <code>true</code> cuando son muchos pares y el ojo se pierde entre filas.",
    "descriptionListPage.prop.dividers.falseLabel": "Sin divisores",
    "descriptionListPage.prop.dividers.trueLabel": "Con divisores",
    "descriptionListPage.guidelinesLede": "Cada fila es una afirmación sobre una misma cosa.",
  },
  en: {
    "demo.descriptionList.order.term": "Order",
    "demo.descriptionList.order.value": "#4821",
    "demo.descriptionList.placed.term": "Placed",
    "demo.descriptionList.placed.value": "10 March 2026",
    "demo.descriptionList.total.term": "Total",
    "demo.descriptionList.total.value": "$38,990",
    "demo.descriptionList.payment.term": "Payment",
    "demo.descriptionList.payment.value": "Card ending 4417",
    "demo.descriptionList.status.term": "Status",
    "demo.descriptionList.status.value": "Delivered",
    "demo.descriptionList.tracking.term": "Tracking",
    "demo.descriptionList.tracking.value": "4821-CL",
    "demo.descriptionList.spec.format.term": "Format",
    "demo.descriptionList.spec.format.value": "PDF/A-2b",
    "demo.descriptionList.spec.size.term": "Size",
    "demo.descriptionList.spec.size.value": "1.4 MB",
    "demo.descriptionList.spec.updated.term": "Updated",
    "demo.descriptionList.spec.updated.value": "14 March 2026",
    "demo.descriptionList.spec.licence.term": "Licence",
    "demo.descriptionList.spec.licence.value": "CC BY 4.0",
    "demo.descriptionList.spec.sizeBare": "1.4",
    "demo.descriptionList.longTerm1": "Platform used to make the payment",
    "demo.descriptionList.longValue1": "Credit card",
    "demo.descriptionList.longTerm2": "Email address for notifications",
    "demo.descriptionList.longValue2": "ana@example.com",
    "demo.descriptionList.missingValue": "No tracking available",
    "demo.descriptionList.longLabel": "Order identifier in the sales system",

    "descriptionListPage.description": "Shows one record's details as name and value pairs.",

    "descriptionListPage.a11yYours2": "Do not use the list to align a form: fields go in FormField.",

    "descriptionListPage.a11yYours1": "Put a heading before the list that says which record the details belong to.",

    "descriptionListPage.a11yDoes2": "It takes no focus: links inside a value do.",

    "descriptionListPage.a11yDoes1": "It uses <code>&lt;dl&gt;</code>, <code>&lt;dt&gt;</code> and <code>&lt;dd&gt;</code>; each pair is grouped in its <code>&lt;div&gt;</code>.",

    "descriptionListPage.a11yIntro": "It is a native <code>&lt;dl&gt;</code>: screen readers announce each name with its value.",

    "descriptionListPage.content3": "If a value is missing, say so: “No tracking”, instead of leaving the row empty.",

    "descriptionListPage.content2": "Write values in full, with their unit: “1.4 MB”, not “1.4”.",

    "descriptionListPage.content1": "Use short names, 1 to 3 words, capitalizing only the first: “Payment method”.",

    "descriptionListPage.dd.one.dont": "Three orders in one list repeat the names and force comparing rows: that is a Table.",

    "descriptionListPage.dd.one.do": "One order's details: each row reads on its own.",

    "descriptionListPage.dd.one.title": "Records: one per list",
    "descriptionListPage.dd.terms.title": "Layout: give long names room",
    "descriptionListPage.dd.terms.do": "With long names, stack each value under its term.",
    "descriptionListPage.dd.terms.dont": "In columns, a long term squeezes the value's space.",
    "descriptionListPage.dd.units.title": "Values: include the unit",
    "descriptionListPage.dd.units.do": "“1.4 MB” says how large the file is without making people infer it.",
    "descriptionListPage.dd.units.dont": "“1.4” could be a size, count or price.",
    "descriptionListPage.dd.missing.title": "Missing data: say so",
    "descriptionListPage.dd.missing.do": "“No tracking available” explains why there is no number.",
    "descriptionListPage.dd.missing.dont": "An empty row looks like an error or forgotten data.",
    "descriptionListPage.dd.labels.title": "Terms: labels, not sentences",
    "descriptionListPage.dd.labels.do": "“Order” scans quickly as the name of a fact.",
    "descriptionListPage.dd.labels.dont": "A long question turns the term into another paragraph.",
    "descriptionListPage.dd.links.title": "Values: make destinations links",
    "descriptionListPage.dd.links.do": "The tracking number can open the shipment details.",
    "descriptionListPage.dd.links.dont": "A URL shown as text cannot be followed with one click.",

    "descriptionListPage.whenNot3": 'If it is a list of things rather than facts about one thing: use <a href="/components/list">List</a>.',

    "descriptionListPage.whenNot2": 'If the pairs are fields people fill in: use <a href="/components/form-field">FormField</a>.',

    "descriptionListPage.whenNot1": 'If the same fields are shown for several records: use <a href="/components/table">Table</a>.',

    "descriptionListPage.when2": "When names are short and each row reads on its own.",

    "descriptionListPage.when1": "For one record's details: an order summary, a document's metadata, a product's specs.",

    "descriptionListPage.contract3": "It has no enhancer: the markup is complete on its own.",

    "descriptionListPage.contract2": "The sheet removes the browser's indentation and margin.",

    "descriptionListPage.contract1": "Each pair sits in a <code>&lt;div&gt;</code>, the grouping element HTML allows inside <code>&lt;dl&gt;</code>: the divider and the layout hang from it.",

    "descriptionListPage.basicBody": "Three stacked pairs, the shape that survives any width and any name length.",

    "descriptionListPage.basicTitle": "An order: the base case",
    "descriptionListPage.lede": 'DescriptionList shows one record\'s details as name and value pairs: an order summary, a document\'s metadata, a product\'s specs. Each row reads on its own; if several records have to be compared, it is a <a href="/components/table">Table</a>.',
    "descriptionListPage.anatomyBody": "The list, each pair, the name and the value.",
    "descriptionListPage.anatomyLabel": "DescriptionList anatomy",
    "descriptionListPage.anatomyPreviewLabel": "DescriptionList, part by part",
    "descriptionListPage.columnsTitle": "Columns: the value beside",
    "descriptionListPage.columnsBody": "The name column's width adjusts with <code>--sk-description-list-term-size</code> if your names are long.",
    "descriptionListPage.dividedTitle": "Dividers and density: reference material",
    "descriptionListPage.dividedBody": '<code>dividers</code> separates the rows and <code>density="compact"</code> brings them closer without changing the type.',
    "descriptionListPage.richTitle": "Values with markup: a Tag, a link",
    "descriptionListPage.richBody": 'The value takes a <a href="/components/tag">Tag</a>, a link or a date. The name is text: if it needs markup, it is a heading.',
    "descriptionListPage.prop.layout.title": "Layout: the value below or beside",
    "descriptionListPage.prop.layout.body": "Puts each value below its name or beside it.",
    "descriptionListPage.prop.layout.stacked": "Use <code>stacked</code>, the default, in narrow columns and on phones.",
    "descriptionListPage.prop.layout.columns": "Use <code>columns</code> in a wide view, to read names and values in two columns. Below 36rem it stacks again.",
    "descriptionListPage.prop.dividers.title": "Dividers: a line between pairs",
    "descriptionListPage.prop.dividers.body": "<code>dividers</code> draws a line between pairs.",
    "descriptionListPage.prop.dividers.false": "Use <code>false</code> when there are few pairs and space is enough to separate them.",
    "descriptionListPage.prop.dividers.true": "Use <code>true</code> when there are many pairs and the eye gets lost between rows.",
    "descriptionListPage.prop.dividers.falseLabel": "No dividers",
    "descriptionListPage.prop.dividers.trueLabel": "Dividers",
    "descriptionListPage.guidelinesLede": "Each row is a statement about the same thing.",
  },
} as const;
