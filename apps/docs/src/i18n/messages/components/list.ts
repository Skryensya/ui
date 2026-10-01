export const listMessages = {
  es: {

    "demo.list.preferences": "Preferencias",
    "demo.list.resources": "Recursos del proyecto",
    "demo.list.team": "Equipo",
    "demo.list.active": "Activo",
    "demo.list.timezone.title": "Zona horaria",
    "demo.list.timezone.description": "Se usa para programar envíos.",
    "demo.list.timezone.value": "GMT−3",
    "demo.list.language.title": "Idioma",
    "demo.list.language.description": "Interfaz y correos.",
    "demo.list.language.value": "Español",
    "demo.list.dateFormat.title": "Formato de fecha",
    "demo.list.dateFormat.description": "Cómo se escriben días y meses.",
    "demo.list.dateFormat.value": "31/12/2026",
    "demo.list.homePage.title": "Página de inicio",
    "demo.list.homePage.description": "Dónde caes al entrar.",
    "demo.list.homePage.value": "Resumen",
    "demo.list.prerequisites.title": "Prerrequisitos",
    "demo.list.prerequisites.description": "Qué necesitas antes de instalar.",
    "demo.list.gettingStarted.title": "Guía de inicio",
    "demo.list.gettingStarted.description":
      "Instala y configura tu primer proyecto.",
    "demo.list.customization.title": "Personalización",
    "demo.list.customization.description":
      "Ajusta color, densidad, radio e iconografía.",
    "demo.list.tokenReference.title": "Referencia de tokens",
    "demo.list.tokenReference.description":
      "Consulta roles, escalas y cadenas de decisión.",
    "demo.list.tiers.title": "Tiers",
    "demo.list.tiers.description": "Qué capa resuelve cada decisión.",
    "demo.list.first.name": "John Doe",
    "demo.list.first.role": "Sistema de diseño y experiencia.",
    "demo.list.second.name": "Jane Doe",
    "demo.list.second.role": "Componentes e infraestructura.",
    "demo.list.third.name": "Richard Roe",
    "demo.list.third.role": "Estrategia y descubrimiento.",
    "demo.list.fourth.name": "Mary Major",
    "demo.list.fourth.role": "Investigación y contenido.",
    "demo.list.area.design": "Diseño",
    "demo.list.area.engineering": "Ingeniería",
    "demo.list.area.product": "Producto",
    "demo.list.integrations": "Integraciones",

    "listPage.description": "Muestra filas de cosas del mismo tipo, una debajo de otra, para recorrerlas rápido.",

    "listPage.a11yKeyEnter": "Sigue el enlace o activa el botón de la fila.",

    "listPage.a11yKeyTab": "Recorre las filas que actúan.",

    "listPage.a11yYours2": "Una fila deshabilitada debe decir por qué, si no es evidente.",

    "listPage.a11yYours1": "Dale nombre a la lista si hay varias en la página: un encabezado antes o un <code>aria-label</code>.",

    "listPage.a11yDoes3": "Una fila que actúa es un enlace o un botón nativo, con su foco y su teclado.",

    "listPage.a11yDoes2": "El ícono o el avatar del inicio son decorativos.",

    "listPage.a11yDoes1": "Usa <code>&lt;ul&gt;</code> u <code>&lt;ol&gt;</code> y <code>&lt;li&gt;</code>.",

    "listPage.a11yIntro": "List es una lista real: el lector de pantalla anuncia cuántas filas hay.",

    "listPage.content3": "Usa la misma forma en todas las filas: si una lleva descripción, todas deberían.",

    "listPage.content2": "Pon al final datos cortos y comparables: una fecha, una cifra, un estado.",

    "listPage.content1": "Escribe el título de la fila con 1 a 5 palabras; el detalle va en la descripción.",

    "listPage.whenNot4": 'Para elegir una o varias opciones de la lista: usa <a href="/es/componentes/listbox">Listbox</a>.',

    "listPage.whenNot3": 'Para instrucciones que se siguen en orden: usa <a href="/es/componentes/process-list">ProcessList</a>.',

    "listPage.whenNot2": 'Para la navegación de un sitio o de una página: usa <a href="/es/nav-list">NavList</a>.',

    "listPage.whenNot1": 'Si las filas tienen columnas que se comparan: usa <a href="/es/componentes/table">Table</a>.',

    "listPage.when2": "Cuando cada fila lleva a un detalle o hace una acción.",

    "listPage.when1": "Para filas de cosas del mismo tipo: una bandeja de entrada, ajustes, resultados de búsqueda.",

    "listPage.contract4": '<code>density="compact"</code> acerca las filas; no necesita JavaScript.',

    "listPage.contract3": "No guarda selección ni destino actual: para eso está NavList o Listbox.",

    "listPage.contract2": "Una fila que actúa lleva un <code>&lt;a&gt;</code> o un <code>&lt;button&gt;</code> con <code>sk-list__action</code> que la llena.",

    "listPage.contract1": "La raíz es un <code>&lt;ul&gt;</code> u <code>&lt;ol&gt;</code>; cada fila, un <code>&lt;li&gt;</code>.",
    "listPage.lede": "List muestra filas de cosas del mismo tipo, una debajo de otra: una bandeja de entrada, ajustes, resultados. Cada fila puede llevar un ícono o un avatar al inicio, un título con su descripción y un dato al final, y puede ser un enlace o un botón.",
    "listPage.anatomyBody":
      "Este diagrama nombra cada parte de una fila completa: leading, content, trailing. El espécimen está congelado; las listas vivas empiezan abajo.",
    "listPage.anatomyLabel": "Anatomía de List",
    "listPage.anatomyPreviewLabel": "List, parte por parte",
    "listPage.stepsBody": "Cada ejemplo es la misma lista con una pieza más que el anterior.",
    "listPage.step1Title": "Solo la lista: filas y divisores",
    "listPage.step1Body": "Un <code>&lt;ul&gt;</code> real: el lector de pantalla anuncia «lista de 5 elementos».",
    "listPage.step2Title": "Título y descripción: el contenido",
    "listPage.step2Body": "El contenido es la única parte que se encoge: un título largo se corta y el resto de la fila se queda.",
    "listPage.step3Title": "Al inicio: un ícono o un avatar",
    "listPage.step3Body": "El inicio es decorativo: quien nombra la fila es el título.",
    "listPage.step4Title": "Al final: un dato o un estado",
    "listPage.step4Body": "El final se alinea a la derecha con números tabulares, así las cifras quedan en columna.",
    "listPage.step5Title": "La fila actúa: un enlace",
    "listPage.step5Body": "La misma fila dentro de un <code>a[href]</code> real: toda la fila es el objetivo y el foco es nativo.",
    "listPage.step6Title": "Todo junto: densidad compacta",
    "listPage.step6Body": "Filas que actúan, un estado y una flecha al final, y densidad <code>compact</code>.",
    "listPage.test1": "Renderiza una lista semántica con filas estáticas, de enlace y de botón.",
    "listPage.test2": "Renderiza una lista ordenada cuando el orden importa.",
    "demo.list.dd.long1": "Conecta tu cuenta para que cada cambio que hagas en el repositorio aparezca en el historial del proyecto y avise al equipo.",
    "demo.list.dd.long2": "Envía un aviso al canal elegido cada vez que alguien comenta, asigna o cierra una tarea de las que sigues.",
    "demo.list.dd.shapePlain": "Solo título",
    "demo.list.dd.shapeDescribed": "Título con descripción",
    "demo.list.dd.shapeIcon": "Fila con ícono",
    "demo.list.dd.shapeTrailing": "Fila con dato final",
    "demo.list.dd.buriedTimezone": "Se usa para programar envíos. Valor actual: GMT−3.",
    "demo.list.dd.buriedLanguage": "Interfaz y correos. Valor actual: Español.",
    "demo.list.dd.buriedDateFormat": "Cómo se escriben días y meses. Valor actual: 31/12/2026.",
    "listPage.prop.dividers.title": "Dividers: una línea entre filas",
    "listPage.prop.dividers.body": "<code>dividers</code> dibuja una línea entre filas.",
    "listPage.prop.dividers.false": "Usa <code>false</code> en listas cortas y aireadas: el espacio separa las filas.",
    "listPage.prop.dividers.true": "Usa <code>true</code>, el valor por defecto, cuando las filas son densas o llevan varias partes.",
    "listPage.prop.dividers.falseLabel": "Sin divisores",
    "listPage.prop.dividers.trueLabel": "Con divisores",
    "listPage.guidelinesLede": "Una lista se recorre con la vista: cada fila tiene que leerse de un vistazo.",
    "listPage.dd.short.title": "Filas: título corto, detalle aparte",
    "listPage.dd.short.do": "Título breve arriba y una descripción corta debajo: la vista encuentra la fila rápido.",
    "listPage.dd.short.dont": "Párrafos enteros no se recorren: la lista deja de servir para encontrar algo.",
    "listPage.dd.shape.title": "Forma: todas las filas iguales",
    "listPage.dd.shape.do": "Si una fila tiene título y descripción, mantén esa forma en las demás.",
    "listPage.dd.shape.dont": "Mezclar filas simples, con ícono y con dato final obliga a reinterpretar cada línea.",
    "listPage.dd.trailing.title": "Dato final: corto y comparable",
    "listPage.dd.trailing.do": "Pon estados, fechas o valores al final para que se alineen y se comparen de reojo.",
    "listPage.dd.trailing.dont": "Enterrar el valor dentro de la descripción lo vuelve texto: ya no se compara entre filas.",
  },
  en: {

    "demo.list.preferences": "Preferences",
    "demo.list.resources": "Project resources",
    "demo.list.team": "Team",
    "demo.list.active": "Active",
    "demo.list.timezone.title": "Time zone",
    "demo.list.timezone.description": "Used to schedule sends.",
    "demo.list.timezone.value": "GMT−3",
    "demo.list.language.title": "Language",
    "demo.list.language.description": "Interface and emails.",
    "demo.list.language.value": "Spanish",
    "demo.list.dateFormat.title": "Date format",
    "demo.list.dateFormat.description": "How days and months are written.",
    "demo.list.dateFormat.value": "31/12/2026",
    "demo.list.homePage.title": "Home page",
    "demo.list.homePage.description": "Where you land when you sign in.",
    "demo.list.homePage.value": "Summary",
    "demo.list.prerequisites.title": "Prerequisites",
    "demo.list.prerequisites.description": "What you need before installing.",
    "demo.list.gettingStarted.title": "Getting started",
    "demo.list.gettingStarted.description":
      "Install and set up your first project.",
    "demo.list.customization.title": "Customization",
    "demo.list.customization.description":
      "Adjust color, density, radius and iconography.",
    "demo.list.tokenReference.title": "Token reference",
    "demo.list.tokenReference.description":
      "Look up roles, scales and decision chains.",
    "demo.list.tiers.title": "Tiers",
    "demo.list.tiers.description": "Which layer resolves each decision.",
    "demo.list.first.name": "John Doe",
    "demo.list.first.role": "Design system and experience.",
    "demo.list.second.name": "Jane Doe",
    "demo.list.second.role": "Components and infrastructure.",
    "demo.list.third.name": "Richard Roe",
    "demo.list.third.role": "Strategy and discovery.",
    "demo.list.fourth.name": "Mary Major",
    "demo.list.fourth.role": "Research and content.",
    "demo.list.area.design": "Design",
    "demo.list.area.engineering": "Engineering",
    "demo.list.area.product": "Product",
    "demo.list.integrations": "Integrations",

    "listPage.description": "Shows rows of same-kind things, one below another, to scan quickly.",

    "listPage.a11yKeyEnter": "Follows the row's link or activates its button.",

    "listPage.a11yKeyTab": "Moves through the acting rows.",

    "listPage.a11yYours2": "A disabled row should say why, if it is not obvious.",

    "listPage.a11yYours1": "Name the list if there are several on the page: a heading before it or an <code>aria-label</code>.",

    "listPage.a11yDoes3": "An acting row is a native link or button, with its focus and keyboard.",

    "listPage.a11yDoes2": "The start's icon or avatar is decorative.",

    "listPage.a11yDoes1": "It uses <code>&lt;ul&gt;</code> or <code>&lt;ol&gt;</code> and <code>&lt;li&gt;</code>.",

    "listPage.a11yIntro": "List is a real list: the screen reader announces how many rows there are.",

    "listPage.content3": "Use the same shape in every row: if one has a description, all should.",

    "listPage.content2": "Put short, comparable values at the end: a date, a figure, a status.",

    "listPage.content1": "Write the row's title in 1 to 5 words; the detail goes in the description.",

    "listPage.whenNot4": 'To choose one or several options from the list: use <a href="/components/listbox">Listbox</a>.',

    "listPage.whenNot3": 'For instructions followed in order: use <a href="/components/process-list">ProcessList</a>.',

    "listPage.whenNot2": 'For a site\'s or page\'s navigation: use <a href="/nav-list">NavList</a>.',

    "listPage.whenNot1": 'If the rows have columns compared with each other: use <a href="/components/table">Table</a>.',

    "listPage.when2": "When each row leads to a detail or performs an action.",

    "listPage.when1": "For rows of same-kind things: an inbox, settings, search results.",

    "listPage.contract4": '<code>density="compact"</code> brings rows closer; it needs no JavaScript.',

    "listPage.contract3": "It keeps no selection or current destination: NavList or Listbox do that.",

    "listPage.contract2": "An acting row carries an <code>&lt;a&gt;</code> or <code>&lt;button&gt;</code> with <code>sk-list__action</code> that fills it.",

    "listPage.contract1": "The root is a <code>&lt;ul&gt;</code> or <code>&lt;ol&gt;</code>; each row, an <code>&lt;li&gt;</code>.",
    "listPage.lede": "List shows rows of same-kind things, one below another: an inbox, settings, results. Each row can carry an icon or avatar at the start, a title with its description and a value at the end, and can be a link or a button.",
    "listPage.anatomyBody":
      "This diagram names every part of a complete row: leading, content, trailing. The specimen is frozen; the live lists start below.",
    "listPage.anatomyLabel": "List anatomy",
    "listPage.anatomyPreviewLabel": "List, part by part",
    "listPage.stepsBody": "Each example is the same list with one more piece than the last.",
    "listPage.step1Title": "Just the list: rows and dividers",
    "listPage.step1Body": "A real <code>&lt;ul&gt;</code>: the screen reader announces “list, 5 items”.",
    "listPage.step2Title": "Title and description: the content",
    "listPage.step2Body": "The content is the only part that shrinks: a long title truncates and the rest of the row stays.",
    "listPage.step3Title": "At the start: an icon or an avatar",
    "listPage.step3Body": "The start is decorative: the title is what names the row.",
    "listPage.step4Title": "At the end: a value or a status",
    "listPage.step4Body": "The end aligns right with tabular numbers, so figures line up in a column.",
    "listPage.step5Title": "The row acts: a link",
    "listPage.step5Body": "The same row inside a real <code>a[href]</code>: the whole row is the target and focus is native.",
    "listPage.step6Title": "All together: compact density",
    "listPage.step6Body": "Acting rows, a status and an arrow at the end, and <code>compact</code> density.",
    "listPage.test1": "Renders a semantic list with static, link and button rows.",
    "listPage.test2": "Renders an ordered list when order is meaningful.",
    "demo.list.dd.long1": "Connect your account so that every change you make in the repository shows up in the project's history and notifies the team.",
    "demo.list.dd.long2": "Send a notice to the chosen channel every time someone comments on, assigns or closes a task you follow.",
    "demo.list.dd.shapePlain": "Title only",
    "demo.list.dd.shapeDescribed": "Title with description",
    "demo.list.dd.shapeIcon": "Row with icon",
    "demo.list.dd.shapeTrailing": "Row with trailing value",
    "demo.list.dd.buriedTimezone": "Used to schedule sends. Current value: GMT−3.",
    "demo.list.dd.buriedLanguage": "Interface and emails. Current value: Spanish.",
    "demo.list.dd.buriedDateFormat": "How days and months are written. Current value: 31/12/2026.",
    "listPage.prop.dividers.title": "Dividers: a line between rows",
    "listPage.prop.dividers.body": "<code>dividers</code> draws a line between rows.",
    "listPage.prop.dividers.false": "Use <code>false</code> for short, airy lists: space separates the rows.",
    "listPage.prop.dividers.true": "Use <code>true</code>, the default, when rows are dense or carry several parts.",
    "listPage.prop.dividers.falseLabel": "No dividers",
    "listPage.prop.dividers.trueLabel": "Dividers",
    "listPage.guidelinesLede": "A list is scanned by eye: each row has to read at a glance.",
    "listPage.dd.short.title": "Rows: short title, detail aside",
    "listPage.dd.short.do": "Brief title on top and a short description below: the eye finds the row quickly.",
    "listPage.dd.short.dont": "Whole paragraphs do not scan: the list stops helping anyone find anything.",
    "listPage.dd.shape.title": "Shape: every row the same",
    "listPage.dd.shape.do": "If one row has title and description, keep that shape in the rest.",
    "listPage.dd.shape.dont": "Mixing plain rows, icon rows and value rows makes each line a new layout to parse.",
    "listPage.dd.trailing.title": "End value: short and comparable",
    "listPage.dd.trailing.do": "Put statuses, dates or values at the end so they align and compare at a glance.",
    "listPage.dd.trailing.dont": "Burying the value in the description turns it into prose: it no longer compares across rows.",
  },
} as const;
