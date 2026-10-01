export const loaderMessages = {
  es: {
    "demo.loader.variant.beads": "Ocho puntos sobre el borde.",
    "demo.loader.variant.compass": "Cuatro marcas que giran juntas un cuarto.",
    "demo.loader.variant.ticks": "La misma secuencia con ocho marcas.",
    "demo.loader.variant.spokes": "Doce radios que se apagan en secuencia.",
    "demo.loader.variant.clock": "Una aguja barriendo una esfera tenue.",
    "demo.loader.variant.orbit": "Un punto recorriendo una pista fina.",
    "demo.loader.variant.comet": "Una cola que se apaga tras la cabeza.",
    "demo.loader.variant.arc": "Un cuarto suelto, sin pista detrás.",
    "demo.loader.variant.dots": "Un punto que avanza por tres posiciones.",
    "demo.loader.variant.bars": "Dos pares que alternan; nada gira.",
    "demo.loader.variant.sweep": "Abanico cónico que se desvanece.",
    "demo.loader.variant.ring": "Pista completa con un cuarto encendido.",
    "demo.loader.dd.files": "Subiendo 3 de 10 archivos",
    "demo.loader.dd.invoices": "Cargando facturas…",
    "demo.loader.dd.saving": "Guardando…",
    "demo.loader.dd.save": "Guardar",
    "demo.loader.dd.card": "Cargando tarjeta…",
    "loaderPage.anatomyLabel": "Anatomía de Loader",
    "loaderPage.anatomyPreviewLabel": "Loader, parte por parte",
    "loaderPage.anatomyBody": "Una parte visible. Las variantes escalonadas (spokes, ticks, beads, compass) montan hijos <code>sk-loader__tick</code>, pero cada uno es una capa del tamaño de la raíz que gira sobre su centro, así que no se dibujan aparte.",
    "loaderPage.anatomyStatus": "Cargando",
    "demo.loader.sizesLabel": "Tamaños de Loader",
    "demo.loader.speedsLabel": "Velocidades de Loader",
    "demo.loader.size.sm": "Dentro de controles",
    "demo.loader.size.md": "Estado inline",
    "demo.loader.size.lg": "Región o carga inicial",
    "demo.loader.speed.fast": "Ciclo corto",
    "demo.loader.speed.normal": "Ciclo base",
    "demo.loader.speed.slow": "Ciclo largo",
    "demo.loader.loadingResults": "Cargando resultados",
    "demo.loader.syncing": "Sincronizando en segundo plano",
    "demo.loader.simulation": "Simulación de carga",
    "demo.loader.busy": "Cargando resultados…",
    "demo.loader.ready": "Resultados listos.",
    "demo.loader.start": "Simular carga",
    "demo.loader.contexts": "Loader en contexto",
    "demo.loader.page.title": "Página",
    "demo.loader.page.body": "Carga una vista completa.",
    "demo.loader.card.title": "Card",
    "demo.loader.card.body": "Carga contenido dentro de una superficie.",
    "demo.loader.control.title": "Control",
    "demo.loader.control.body": "Reserva espacio junto a una acción.",
    "demo.loader.pseudoVariantsLabel": "Diseños sin hijos",
    "demo.loader.staggeredVariantsLabel": "Diseños con marcas escalonadas",

    "loaderPage.description": "Dice que algo está cargando cuando no se sabe cuánto falta.",

    "loaderPage.a11yYours2": "Anuncia el final si cambia algo que no se ve: «Facturas cargadas».",

    "loaderPage.a11yYours1": 'Marca la región que carga con <code>aria-busy="true"</code> y quítalo al terminar.',

    "loaderPage.a11yDoes3": "Con <code>prefers-reduced-motion: reduce</code>, deja de moverse.",

    "loaderPage.a11yDoes2": "Sin <code>label</code>, la figura es decorativa.",

    "loaderPage.a11yDoes1": 'Con <code>label</code>, es un <code>role="status"</code> que el lector de pantalla anuncia.',

    "loaderPage.a11yIntro": "Loader anuncia la espera una vez; la figura no se lee.",

    "loaderPage.content2": "Si la espera se alarga, cambia el texto: «Esto está tardando más de lo normal».",

    "loaderPage.content1": "Di qué se carga, con un verbo en gerundio: «Cargando facturas…», «Guardando cambios…».",

    "loaderPage.dd.progress.dont": "Un Loader con el avance en palabras obliga a leer para saber cuánto falta.",

    "loaderPage.dd.progress.do": "Si sabes cuánto va, una barra lo muestra de un vistazo.",

    "loaderPage.dd.progress.title": "Avance conocido: usa Progress",

    "loaderPage.dd.text.dont": "Una figura sola no dice qué se espera ni si tiene que ver con lo que hiciste.",

    "loaderPage.dd.text.do": "La figura con un texto que dice qué se carga.",

    "loaderPage.dd.text.title": "Texto: di qué se carga",

    "loaderPage.dd.control.dont": "Un loader grande dentro de un botón cambia el peso del control y no dice qué acción sigue corriendo.",

    "loaderPage.dd.control.do": "Dentro de un botón, usa <code>sm</code> y cambia el texto a la acción en curso.",

    "loaderPage.dd.control.title": "Control: pequeño y con verbo",

    "loaderPage.dd.shape.dont": "Un spinner genérico oculta la forma de lo que viene y hace que la tarjeta parezca vacía.",

    "loaderPage.dd.shape.do": "Si la tarjeta ya tiene una forma esperada, usa Placeholder para reservar esa forma.",

    "loaderPage.dd.shape.title": "Forma conocida: usa Placeholder",

    "loaderPage.whenNot3": "Para una espera de menos de un segundo: no muestres nada, el parpadeo distrae.",

    "loaderPage.whenNot2": 'Si el contenido tiene una forma conocida: usa <a href="/es/componentes/placeholder">Placeholder</a>.',

    "loaderPage.whenNot1": 'Si sabes cuánto falta: usa <a href="/es/componentes/progress">Progress</a>.',

    "loaderPage.when2": "En un botón mientras su acción corre, junto a un texto como «Guardando…».",

    "loaderPage.when1": "Para una espera de largo desconocido: una búsqueda, un guardado.",

    "loaderPage.contract4": "Con <code>prefers-reduced-motion: reduce</code>, las doce figuras se quedan quietas y se siguen reconociendo.",

    "loaderPage.contract3": 'No controla la operación: la región que carga lleva <code>aria-busy="true"</code>.',

    "loaderPage.contract2": "<code>Loader.status</code> anuncia una espera que ya se ve, con skeletons o una barra.",

    "loaderPage.contract1": 'Con <code>label</code> es un <code>role="status"</code> que se anuncia; sin él es decorativo y acompaña un texto que ya lo dice.',
    "loaderPage.lede": "Loader dice que algo está cargando cuando no se sabe cuánto falta: una búsqueda, un guardado, la carga de una sección. Si sabes cuánto falta, usa Progress. Hay doce figuras del mismo Loader; elige una por producto.",
    "loaderPage.variantsTitle": "Figuras: doce, para elegir una",
    "loaderPage.variantsBody": "Todas comparten <code>size</code>, <code>speed</code> y la misma accesibilidad. Usa la misma en todo el producto.",
    "loaderPage.simTitle": "Ocupado y listo: el mismo lugar",
    "loaderPage.simBody": "Una región pasa de cargando a lista sin cambiar de tamaño. Presiona el botón para repetirlo.",
    "loaderPage.simLabel": "Análisis de mezcla",
    "loaderPage.simBody2":
      "<code>bars</code> aporta movimiento sin fingir un porcentaje. El contenedor conserva <code>aria-busy</code> y el estado visible aporta el anuncio accesible.",
    "loaderPage.contextsTitle": "Tres lugares: página, tarjeta y botón",
    "loaderPage.contextsBody": "En una carga inicial, Loader lleva un título; en una tarjeta que se actualiza, anuncia el estado; en un botón, acompaña el texto que ya lo dice.",
    "loaderPage.hookPlaygroundTitle": "Pruébalo",
    "loaderPage.hookPlaygroundBody":
      "Cada control mueve un solo hook sobre esta misma marca. Es una prueba de concepto: sin encabezado, sin código, solo la variable y su efecto.",
    "loaderPage.hookPlaygroundLabel": "Playground de hooks de Loader",
    "loaderPage.reactBody":
      "Props: <code>size</code>, <code>variant</code>, <code>speed</code> y <code>label</code>. Los valores por defecto son <code>md</code>, <code>ring</code> y <code>normal</code>.",
    "loaderPage.test1": "Expone el trabajo indeterminado con nombre como un status cortés (<code>polite</code>).",
    "loaderPage.test2": "Escribe los ejes ortogonales de variante y velocidad en la raíz.",
    "loaderPage.test3": "Queda decorativo cuando el control que lo rodea ya aporta el significado de estado.",
    "demo.loader.dd.loading": "Cargando",
    "loaderPage.prop.size.title": "Size: el tamaño de su lugar",
    "loaderPage.prop.size.body": "Va con el tamaño de lo que carga.",
    "loaderPage.prop.size.sm": "Usa <code>sm</code> dentro de un botón o una línea de texto.",
    "loaderPage.prop.size.md": "Usa <code>md</code>, el valor por defecto, en una tarjeta o un panel.",
    "loaderPage.prop.size.lg": "Usa <code>lg</code> cuando la carga ocupa toda la vista.",
    "loaderPage.prop.speed.title": "Speed: el ritmo",
    "loaderPage.prop.speed.body": "El ritmo de la animación, sin cambiar la figura.",
    "loaderPage.prop.speed.fast": "Usa <code>fast</code> para esperas cortas y acciones directas.",
    "loaderPage.prop.speed.normal": "Usa <code>normal</code>, el valor por defecto, casi siempre.",
    "loaderPage.prop.speed.slow": "Usa <code>slow</code> para esperas largas, donde un ritmo rápido cansa.",
    "loaderPage.guidelinesLede": "Un Loader solo dice que hay que esperar; el texto de al lado dice qué.",
  },
  en: {
    "demo.loader.variant.beads": "Eight dots around the rim.",
    "demo.loader.variant.compass": "Four marks turning together, a quarter at a time.",
    "demo.loader.variant.ticks": "The same sequence at eight marks.",
    "demo.loader.variant.spokes": "Twelve spokes fading in sequence.",
    "demo.loader.variant.clock": "A hand sweeping a faint face.",
    "demo.loader.variant.orbit": "A dot travelling a hairline track.",
    "demo.loader.variant.comet": "A tail fading out behind the head.",
    "demo.loader.variant.arc": "A lone quarter, with no track behind it.",
    "demo.loader.variant.dots": "One dot stepping across three positions.",
    "demo.loader.variant.bars": "Two alternating pairs; nothing rotates.",
    "demo.loader.variant.sweep": "A conic fan trailing off.",
    "demo.loader.variant.ring": "A full track with one quarter lit.",
    "demo.loader.dd.files": "Uploading 3 of 10 files",
    "demo.loader.dd.invoices": "Loading invoices…",
    "demo.loader.dd.saving": "Saving…",
    "demo.loader.dd.save": "Save",
    "demo.loader.dd.card": "Loading card…",
    "loaderPage.anatomyLabel": "Loader anatomy",
    "loaderPage.anatomyPreviewLabel": "Loader, part by part",
    "loaderPage.anatomyBody": "One visible part. The staggered variants (spokes, ticks, beads, compass) mount <code>sk-loader__tick</code> children, but each is a root-sized layer rotating about its centre, so they are not drawn separately.",
    "loaderPage.anatomyStatus": "Loading",
    "demo.loader.sizesLabel": "Loader sizes",
    "demo.loader.speedsLabel": "Loader speeds",
    "demo.loader.size.sm": "Inside controls",
    "demo.loader.size.md": "Inline status",
    "demo.loader.size.lg": "Region or initial load",
    "demo.loader.speed.fast": "Short cycle",
    "demo.loader.speed.normal": "Base cycle",
    "demo.loader.speed.slow": "Long cycle",
    "demo.loader.loadingResults": "Loading results",
    "demo.loader.syncing": "Syncing in the background",
    "demo.loader.simulation": "Loading simulation",
    "demo.loader.busy": "Loading results…",
    "demo.loader.ready": "Results are ready.",
    "demo.loader.start": "Simulate loading",
    "demo.loader.contexts": "Loader in context",
    "demo.loader.page.title": "Page",
    "demo.loader.page.body": "Loading a complete view.",
    "demo.loader.card.title": "Card",
    "demo.loader.card.body": "Loading content inside a surface.",
    "demo.loader.control.title": "Control",
    "demo.loader.control.body": "Reserving space beside an action.",
    "demo.loader.pseudoVariantsLabel": "Designs with no children",
    "demo.loader.staggeredVariantsLabel": "Designs with staggered marks",

    "loaderPage.description": "Says something is loading when how long is left is unknown.",

    "loaderPage.a11yYours2": "Announce the end if something changes out of view: “Invoices loaded”.",

    "loaderPage.a11yYours1": 'Mark the loading region with <code>aria-busy="true"</code> and remove it when done.',

    "loaderPage.a11yDoes3": "With <code>prefers-reduced-motion: reduce</code>, it stops moving.",

    "loaderPage.a11yDoes2": "Without <code>label</code>, the figure is decorative.",

    "loaderPage.a11yDoes1": 'With <code>label</code>, it is a <code>role="status"</code> the screen reader announces.',

    "loaderPage.a11yIntro": "Loader announces the wait once; the figure is not read.",

    "loaderPage.content2": "If the wait drags on, change the text: “This is taking longer than usual”.",

    "loaderPage.content1": "Say what is loading, with an -ing verb: “Loading invoices…”, “Saving changes…”.",

    "loaderPage.dd.progress.dont": "A Loader with progress in words makes people read to know how long is left.",

    "loaderPage.dd.progress.do": "If you know how far along it is, a bar shows it at a glance.",

    "loaderPage.dd.progress.title": "Known progress: use Progress",

    "loaderPage.dd.text.dont": "A figure alone does not say what is awaited or whether it relates to what you did.",

    "loaderPage.dd.text.do": "The figure with text that says what is loading.",

    "loaderPage.dd.text.title": "Text: say what is loading",

    "loaderPage.dd.control.dont": "A large loader inside a button changes the control's weight and does not say which action is still running.",

    "loaderPage.dd.control.do": "Inside a button, use <code>sm</code> and change the text to the action in progress.",

    "loaderPage.dd.control.title": "Control: small and verb-led",

    "loaderPage.dd.shape.dont": "A generic spinner hides the shape of what is coming and makes the card feel empty.",

    "loaderPage.dd.shape.do": "If the card already has an expected shape, use Placeholder to reserve that shape.",

    "loaderPage.dd.shape.title": "Known shape: use Placeholder",

    "loaderPage.whenNot3": "For a wait under a second: show nothing, the flicker distracts.",

    "loaderPage.whenNot2": 'If the content has a known shape: use <a href="/components/placeholder">Placeholder</a>.',

    "loaderPage.whenNot1": 'If you know how long is left: use <a href="/components/progress">Progress</a>.',

    "loaderPage.when2": "In a button while its action runs, beside text like “Saving…”.",

    "loaderPage.when1": "For a wait of unknown length: a search, a save.",

    "loaderPage.contract4": "With <code>prefers-reduced-motion: reduce</code>, all twelve figures stand still and remain recognizable.",

    "loaderPage.contract3": 'It does not control the operation: the loading region carries <code>aria-busy="true"</code>.',

    "loaderPage.contract2": "<code>Loader.status</code> announces a wait that is already visible, with skeletons or a bar.",

    "loaderPage.contract1": 'With <code>label</code> it is an announced <code>role="status"</code>; without it, it is decorative and goes with text that already says it.',
    "loaderPage.lede": "Loader says something is loading when how long is left is unknown: a search, a save, a section loading. If you know how long, use Progress. There are twelve figures of the same Loader; choose one per product.",
    "loaderPage.variantsTitle": "Figures: twelve, to choose one",
    "loaderPage.variantsBody": "They all share <code>size</code>, <code>speed</code> and the same accessibility. Use the same one across the product.",
    "loaderPage.simTitle": "Busy and ready: the same place",
    "loaderPage.simBody": "A region goes from loading to ready without changing size. Press the button to repeat it.",
    "loaderPage.simLabel": "Blend analysis",
    "loaderPage.simBody2":
      "<code>bars</code> adds motion with no percentage to fake. The container carries <code>aria-busy</code>, and the visible state provides the accessible announcement.",
    "loaderPage.contextsTitle": "Three places: page, card and button",
    "loaderPage.contextsBody": "In an initial load, Loader carries a title; in a card that refreshes, it announces the state; in a button, it goes with text that already says it.",
    "loaderPage.hookPlaygroundTitle": "Try it",
    "loaderPage.hookPlaygroundBody":
      "Each control moves a single hook on this same mark. It's a proof of concept: no header, no code, just the variable and its effect.",
    "loaderPage.hookPlaygroundLabel": "Loader hook playground",
    "loaderPage.reactBody":
      "Props: <code>size</code>, <code>variant</code>, <code>speed</code>, and <code>label</code>. The defaults are <code>md</code>, <code>ring</code>, and <code>normal</code>.",
    "loaderPage.test1": "Exposes labelled indeterminate work as a polite status.",
    "loaderPage.test2": "Writes orthogonal variant and speed axes onto the root.",
    "loaderPage.test3": "Stays decorative when the surrounding control already carries the status meaning.",
    "demo.loader.dd.loading": "Loading",
    "loaderPage.prop.size.title": "Size: the size of its place",
    "loaderPage.prop.size.body": "Matches the size of what is loading.",
    "loaderPage.prop.size.sm": "Use <code>sm</code> inside a button or a line of text.",
    "loaderPage.prop.size.md": "Use <code>md</code>, the default, in a card or a panel.",
    "loaderPage.prop.size.lg": "Use <code>lg</code> when the load takes the whole view.",
    "loaderPage.prop.speed.title": "Speed: the pace",
    "loaderPage.prop.speed.body": "The animation's pace, without changing the figure.",
    "loaderPage.prop.speed.fast": "Use <code>fast</code> for short waits and direct actions.",
    "loaderPage.prop.speed.normal": "Use <code>normal</code>, the default, almost always.",
    "loaderPage.prop.speed.slow": "Use <code>slow</code> for long waits, where a fast pace tires the eye.",
    "loaderPage.guidelinesLede": "A Loader only says there is a wait; the text beside it says what for.",
  },
} as const;
