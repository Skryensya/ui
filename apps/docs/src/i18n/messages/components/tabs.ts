export const tabsMessages = {
  es: {
    "demo.tabs.basic.label": "Proyecto",
    "demo.tabs.basic.summary": "Resumen",
    "demo.tabs.basic.summaryBody":
      "Atlas está listo para el lanzamiento de julio.",
    "demo.tabs.basic.activity": "Actividad",
    "demo.tabs.basic.activityBody":
      "Tres cambios aprobados durante la última semana.",
    "demo.tabs.size.smLabel": "Proyecto (sm)",
    "demo.tabs.size.mdLabel": "Proyecto (md)",
    "demo.tabs.hanging.label": "Proyecto (colgantes)",
    "demo.tabs.states.label": "Revisión",
    "demo.tabs.states.details": "Detalles",
    "demo.tabs.states.detailsTitle": "Solicitud #248",
    "demo.tabs.states.detailsBody": "Actualiza el runtime de Atlas a Node 24.",
    "demo.tabs.states.validation": "Validación",
    "demo.tabs.states.validationTitle": "12 comprobaciones aprobadas",
    "demo.tabs.states.validationBody":
      "Tipos, pruebas y revisión de dependencias sin fallos.",
    "demo.tabs.states.settings": "Ajustes",
    "demo.tabs.states.settingsBody":
      "Los ajustes estarán disponibles después de aprobar la solicitud.",
    "demo.tabs.status": "Panel activo",
    "demo.tabs.summary": "Resumen",
    "demo.tabs.activity": "Actividad",
    "demo.tabs.metrics": "Métricas",
    "demo.tabs.settings": "Ajustes",
    "demo.tabs.summary.body": "Estado general del espacio de trabajo.",
    "demo.tabs.activity.body": "Cambios recientes del equipo.",
    "demo.tabs.metrics.body": "Rendimiento y uso del proyecto.",
    "demo.tabs.settings.body": "Preferencias del espacio de trabajo.",

    "tabsPage.description": "Cambia entre vistas del mismo contenido, al mismo nivel, sin salir de la página.",

    "tabsPage.key.select": "Con activación manual, muestra el panel de la pestaña con el foco.",

    "tabsPage.key.tab": "Sale de la lista al panel.",

    "tabsPage.key.homeEnd": "Va a la primera o a la última.",

    "tabsPage.key.arrows": "Pasa a la pestaña anterior o siguiente.",

    "tabsPage.a11yYours2": "Usa activación manual si cambiar de panel es lento.",

    "tabsPage.a11yYours1": "Nombra la lista con <code>aria-label</code> si hay varias en la página.",

    "tabsPage.a11yDoes3": "El ícono nunca reemplaza el nombre accesible.",

    "tabsPage.a11yDoes2": "Cada pestaña anuncia si está elegida y controla su panel.",

    "tabsPage.a11yDoes1": "La lista es una sola parada de <kbd>Tab</kbd>; las flechas cambian de pestaña.",

    "tabsPage.a11yIntro": "Tabs sigue el patrón tabs de la APG.",

    "tabsPage.content2": "Usa sustantivos, todos con la misma forma.",

    "tabsPage.content1": "Nombra cada pestaña con 1 o 2 palabras: «Resumen», «Actividad».",

    "tabsPage.whenNot4": "Si conviene comparar las vistas: muéstralas juntas.",

    "tabsPage.whenNot3": 'Para muchas secciones: usa <a href="/es/componentes/sidebar">Sidebar</a> o una navegación.',

    "tabsPage.whenNot2": 'Para cambiar la vista de los mismos datos (lista, tablero): usa <a href="/es/componentes/segmented">Segmented</a>.',

    "tabsPage.whenNot1": 'Para pasos que se hacen en orden: usa <a href="/es/componentes/steps">Steps</a>.',

    "tabsPage.when2": "Cuando el contenido de cada vista es largo y verlas juntas sería demasiado.",

    "tabsPage.when1": "Para 2 a 5 vistas del mismo contenido que se abren en cualquier orden.",

    "tabsPage.contract3": "El cambio dispara <code>sk:tabsvaluechange</code>; en React, <code>onValueChange</code>.",

    "tabsPage.contract2": "<code>data-disabled</code> retira una pestaña.",

    "tabsPage.contract1": "Cada pestaña y su panel comparten <code>data-value</code>; la raíz guarda el activo.",
    "tabsPage.lede": "Tabs cambia entre vistas del mismo contenido, al mismo nivel, sin salir de la página: el resumen y la actividad de un proyecto, la configuración de una cuenta por tema. Solo se ve un panel a la vez.",
    "tabsPage.anatomyBody":
      "Este diagrama nombra la lista, los triggers y el panel. El espécimen está congelado; los Tabs vivos empiezan abajo.",
    "tabsPage.anatomyLabel": "Anatomía de Tabs",
    "tabsPage.anatomyPreviewLabel": "Tabs, parte por parte",
    "tabsPage.basicTitle": "Dos vistas: resumen y actividad",
    "tabsPage.basicBody": "Cada pestaña se enlaza con su panel por <code>data-value</code>.",
    "tabsPage.statesTitle": "Con íconos y una deshabilitada",
    "tabsPage.statesBody": "El ícono acompaña al texto; una pestaña deshabilitada se ve pero no se elige.",
    "tabsPage.advancedTitle": "Vertical y manual: elegir con Enter",
    "tabsPage.advancedBody": 'Con <code>activationMode="manual"</code>, mover el foco no cambia el panel: <kbd>Enter</kbd> o <kbd>Espacio</kbd> lo confirma.',
    "tabsPage.vanillaInitTitle": "Inicializar vanilla",
    "tabsPage.vanillaInitBody": "<code>initComponents</code> conecta los Tabs. Los iconos se montan por separado con el set elegido por la aplicación.",
    "tabsPage.reactBody": "El componente renderiza la misma anatomía desde <code>items</code>. Usa <code>value</code> y <code>onValueChange</code> cuando otro estado de la aplicación dependa de la pestaña activa.",
    "tabsPage.test1": "Conecta la pestaña seleccionada con su panel nombrado.",
    "tabsPage.test2": "Refleja la selección en el atributo <code>data-*</code> de la raíz.",
    "tabsPage.test3": "Mueve el foco itinerante con Flecha derecha sin cambiar la selección manual.",
    "demo.tabs.dd.general": "General",
    "demo.tabs.dd.members": "Miembros",
    "demo.tabs.dd.billing": "Facturación",
    "demo.tabs.dd.security": "Seguridad",
    "demo.tabs.dd.alerts": "Alertas",
    "demo.tabs.dd.integrations": "Integraciones",
    "demo.tabs.dd.api": "API",
    "demo.tabs.dd.logs": "Registros",
    "demo.tabs.dd.step1": "1. Datos",
    "demo.tabs.dd.step2": "2. Envío",
    "demo.tabs.dd.step3": "3. Pago",
    "demo.tabs.dd.stepBody": "Completa tus datos para seguir.",
    "tabsPage.prop.variant.title": "Variant: cómo se marca la activa",
    "tabsPage.prop.variant.body": "La línea va abajo de las pestañas o arriba, colgando.",
    "tabsPage.prop.variant.underline": "Usa <code>underline</code>, el valor por defecto, sobre el contenido de una página.",
    "tabsPage.prop.variant.hanging": "Usa <code>hanging</code> cuando las pestañas cuelgan de una superficie, como la cabecera de una tarjeta.",
    "tabsPage.prop.size.title": "Size: la altura de las pestañas",
    "tabsPage.prop.size.body": "Solo cambia alto, relleno y texto.",
    "tabsPage.prop.size.sm": "Usa <code>sm</code> dentro de un panel o una tarjeta.",
    "tabsPage.prop.size.md": "Usa <code>md</code>, el valor por defecto, para las secciones de una página.",
    "tabsPage.prop.orientation.title": "Orientation: fila o columna",
    "tabsPage.prop.orientation.body": "Cambia también qué flechas recorren las pestañas.",
    "tabsPage.prop.orientation.horizontal": "Usa <code>horizontal</code>, el valor por defecto, con pocas pestañas de nombre corto.",
    "tabsPage.prop.orientation.vertical": "Usa <code>vertical</code> cuando hay más pestañas o sus nombres son largos.",
    "tabsPage.guidelinesLede": "Las pestañas esconden contenido: úsalas cuando no hace falta ver dos vistas a la vez.",
    "tabsPage.dd.few.title": "Cantidad: pocas pestañas",
    "tabsPage.dd.few.do": "Dos a cinco pestañas con nombres cortos.",
    "tabsPage.dd.few.dont": "Si no caben, las últimas quedan fuera de la vista. Usa una navegación lateral.",
    "tabsPage.dd.steps.title": "Orden: vistas, no pasos",
    "tabsPage.dd.steps.do": "Usa pestañas para vistas que se abren en cualquier orden.",
    "tabsPage.dd.steps.dont": 'Unos pasos numerados tienen orden: eso es <a href="/es/componentes/steps">Steps</a>.',
  },
  en: {
    "demo.tabs.basic.label": "Project",
    "demo.tabs.basic.summary": "Summary",
    "demo.tabs.basic.summaryBody": "Atlas is ready for the July launch.",
    "demo.tabs.basic.activity": "Activity",
    "demo.tabs.basic.activityBody":
      "Three changes approved during the last week.",
    "demo.tabs.size.smLabel": "Project (sm)",
    "demo.tabs.size.mdLabel": "Project (md)",
    "demo.tabs.hanging.label": "Project (hanging)",
    "demo.tabs.states.label": "Review",
    "demo.tabs.states.details": "Details",
    "demo.tabs.states.detailsTitle": "Request #248",
    "demo.tabs.states.detailsBody": "Update the Atlas runtime to Node 24.",
    "demo.tabs.states.validation": "Validation",
    "demo.tabs.states.validationTitle": "12 checks passed",
    "demo.tabs.states.validationBody":
      "Types, tests and dependency review with no failures.",
    "demo.tabs.states.settings": "Settings",
    "demo.tabs.states.settingsBody":
      "Settings will be available after the request is approved.",
    "demo.tabs.status": "Active panel",
    "demo.tabs.summary": "Summary",
    "demo.tabs.activity": "Activity",
    "demo.tabs.metrics": "Metrics",
    "demo.tabs.settings": "Settings",
    "demo.tabs.summary.body": "Overall workspace status.",
    "demo.tabs.activity.body": "Recent changes from the team.",
    "demo.tabs.metrics.body": "Project performance and usage.",
    "demo.tabs.settings.body": "Workspace preferences.",

    "tabsPage.description": "Switches between views of the same content, at the same level, without leaving the page.",

    "tabsPage.key.select": "With manual activation, shows the focused tab's panel.",

    "tabsPage.key.tab": "Leaves the list for the panel.",

    "tabsPage.key.homeEnd": "Goes to the first or last.",

    "tabsPage.key.arrows": "Moves to the previous or next tab.",

    "tabsPage.a11yYours2": "Use manual activation if switching panels is slow.",

    "tabsPage.a11yYours1": "Name the list with <code>aria-label</code> if there are several on the page.",

    "tabsPage.a11yDoes3": "The icon never replaces the accessible name.",

    "tabsPage.a11yDoes2": "Each tab announces whether it is selected and controls its panel.",

    "tabsPage.a11yDoes1": "The list is a single <kbd>Tab</kbd> stop; the arrows switch tabs.",

    "tabsPage.a11yIntro": "Tabs follows the APG tabs pattern.",

    "tabsPage.content2": "Use nouns, all in the same shape.",

    "tabsPage.content1": "Name each tab in 1 or 2 words: “Summary”, “Activity”.",

    "tabsPage.whenNot4": "If comparing the views helps: show them together.",

    "tabsPage.whenNot3": 'For many sections: use <a href="/components/sidebar">Sidebar</a> or a navigation.',

    "tabsPage.whenNot2": 'To change the view of the same data (list, board): use <a href="/components/segmented">Segmented</a>.',

    "tabsPage.whenNot1": 'For steps done in order: use <a href="/components/steps">Steps</a>.',

    "tabsPage.when2": "When each view's content is long and seeing them together would be too much.",

    "tabsPage.when1": "For 2 to 5 views of the same content opened in any order.",

    "tabsPage.contract3": "A change fires <code>sk:tabsvaluechange</code>; in React, <code>onValueChange</code>.",

    "tabsPage.contract2": "<code>data-disabled</code> removes a tab.",

    "tabsPage.contract1": "Each tab and its panel share a <code>data-value</code>; the root keeps the active one.",
    "tabsPage.lede": "Tabs switches between views of the same content, at the same level, without leaving the page: a project’s summary and activity, an account's settings by topic. Only one panel shows at a time.",
    "tabsPage.anatomyBody":
      "This diagram names the list, the triggers and the panel. The specimen is frozen; the live Tabs begin below.",
    "tabsPage.anatomyLabel": "Tabs anatomy",
    "tabsPage.anatomyPreviewLabel": "Tabs, part by part",
    "tabsPage.basicTitle": "Two views: summary and activity",
    "tabsPage.basicBody": "Each tab links to its panel through <code>data-value</code>.",
    "tabsPage.statesTitle": "With icons and a disabled one",
    "tabsPage.statesBody": "The icon goes with the text; a disabled tab shows but cannot be chosen.",
    "tabsPage.advancedTitle": "Vertical and manual: choose with Enter",
    "tabsPage.advancedBody": 'With <code>activationMode="manual"</code>, moving focus does not change the panel: <kbd>Enter</kbd> or <kbd>Space</kbd> confirms it.',
    "tabsPage.vanillaInitTitle": "Initializing vanilla",
    "tabsPage.vanillaInitBody":
      "<code>initComponents</code> connects Tabs. Icons mount separately with the set the application chooses.",
    "tabsPage.reactBody":
      "The component renders the same anatomy from <code>items</code>. Use <code>value</code> and <code>onValueChange</code> when another piece of application state depends on the active tab.",
    "tabsPage.test1": "Connects the selected tab with its labelled panel.",
    "tabsPage.test2": "Mirrors selection on the root data attribute.",
    "tabsPage.test3": "Moves roving focus with ArrowRight without changing manual selection.",
    "demo.tabs.dd.general": "General",
    "demo.tabs.dd.members": "Members",
    "demo.tabs.dd.billing": "Billing",
    "demo.tabs.dd.security": "Security",
    "demo.tabs.dd.alerts": "Alerts",
    "demo.tabs.dd.integrations": "Integrations",
    "demo.tabs.dd.api": "API",
    "demo.tabs.dd.logs": "Logs",
    "demo.tabs.dd.step1": "1. Details",
    "demo.tabs.dd.step2": "2. Shipping",
    "demo.tabs.dd.step3": "3. Payment",
    "demo.tabs.dd.stepBody": "Fill in your details to continue.",
    "tabsPage.prop.variant.title": "Variant: how the active one is marked",
    "tabsPage.prop.variant.body": "The line goes below the tabs or above them, hanging.",
    "tabsPage.prop.variant.underline": "Use <code>underline</code>, the default, over a page's content.",
    "tabsPage.prop.variant.hanging": "Use <code>hanging</code> when the tabs hang from a surface, like a card's header.",
    "tabsPage.prop.size.title": "Size: the tabs' height",
    "tabsPage.prop.size.body": "Only changes height, padding and text.",
    "tabsPage.prop.size.sm": "Use <code>sm</code> inside a panel or a card.",
    "tabsPage.prop.size.md": "Use <code>md</code>, the default, for a page's sections.",
    "tabsPage.prop.orientation.title": "Orientation: row or column",
    "tabsPage.prop.orientation.body": "Also changes which arrows move through the tabs.",
    "tabsPage.prop.orientation.horizontal": "Use <code>horizontal</code>, the default, with a few short-named tabs.",
    "tabsPage.prop.orientation.vertical": "Use <code>vertical</code> when there are more tabs or their names are long.",
    "tabsPage.guidelinesLede": "Tabs hide content: use them when seeing two views at once is not needed.",
    "tabsPage.dd.few.title": "Count: a few tabs",
    "tabsPage.dd.few.do": "Two to five tabs with short names.",
    "tabsPage.dd.few.dont": "When they do not fit, the last ones fall out of view. Use a side navigation.",
    "tabsPage.dd.steps.title": "Order: views, not steps",
    "tabsPage.dd.steps.do": "Use tabs for views opened in any order.",
    "tabsPage.dd.steps.dont": 'Numbered steps have an order: that is <a href="/components/steps">Steps</a>.',
  },
} as const;
