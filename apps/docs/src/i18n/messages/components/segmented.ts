export const segmentedMessages = {
  es: {
    "demo.segmented.label": "Rango",
    "demo.segmented.day": "Día",
    "demo.segmented.week": "Semana",
    "demo.segmented.month": "Mes",

    "segmentedPage.description": "Elige una opción entre pocas, todas a la vista en una barra, con efecto inmediato.",

    "segmentedPage.key.homeEnd": "Elige la primera o la última.",

    "segmentedPage.key.arrows": "Elige la opción anterior o siguiente.",

    "segmentedPage.a11yYours2": "Si el cambio reordena contenido lejos del control, anúncialo.",

    "segmentedPage.a11yYours1": "Nombra el grupo con <code>aria-label</code>: «Rango».",

    "segmentedPage.a11yDoes2": "La opción elegida se anuncia como marcada.",

    "segmentedPage.a11yDoes1": "El grupo es una sola parada de <kbd>Tab</kbd>; las flechas eligen.",

    "segmentedPage.a11yIntro": "Segmented sigue el patrón radio group de la APG.",

    "segmentedPage.content2": "Si usas solo íconos, dale a cada uno un nombre accesible.",

    "segmentedPage.content1": "Escribe opciones de una o dos palabras, con la misma forma: «Día», «Semana», «Mes».",

    "segmentedPage.whenNot4": 'Para activar o desactivar una cosa: usa <a href="/es/componentes/switch">Switch</a>.',

    "segmentedPage.whenNot3": 'Para una opción de formulario que se envía: usa <a href="/es/componentes/radio-group">RadioGroup</a>.',

    "segmentedPage.whenNot2": 'Para más de 4 opciones: usa <a href="/es/componentes/select">Select</a>.',

    "segmentedPage.whenNot1": 'Para cambiar entre paneles con contenido distinto: usa <a href="/es/componentes/tabs">Tabs</a>.',

    "segmentedPage.when2": "Cuando el cambio se aplica al instante, sin botón de guardar.",

    "segmentedPage.when1": "Para cambiar entre 2 y 4 vistas o modos del mismo contenido.",

    "segmentedPage.contract3": "El indicador viaja hasta la opción nueva con el token de movimiento; con <code>prefers-reduced-motion</code>, salta.",

    "segmentedPage.contract2": "La opción elegida queda en <code>data-value</code>; en React, <code>value</code> o <code>defaultValue</code>.",

    "segmentedPage.contract1": "Es un <code>radiogroup</code>: una parada de <kbd>Tab</kbd> y flechas para elegir.",

    "segmentedPage.iconsBody": "La etiqueta de cada opción admite un icono delante de la palabra; el icono acompaña, no reemplaza al texto.",
    "segmentedPage.iconsTitle": "Con iconos",
    "segmentedPage.icons.label": "Tema",
    "segmentedPage.icons.system": "Sistema",
    "segmentedPage.icons.light": "Claro",
    "segmentedPage.icons.dark": "Oscuro",
    "segmentedPage.icons.inlineBody": "<code>inline</code>: el icono va delante de la palabra. La barra conserva su alto y cada opción ensancha lo justo.",
    "segmentedPage.icons.blockBody": "<code>block</code>: el icono va encima de la palabra. La barra se hace más alta y cada opción más angosta, útil cuando el ancho escasea.",
    "segmentedPage.vsListbox.title": "SegmentedControl o Listbox horizontal",
    "segmentedPage.vsListbox.rule": "Las dos eligen entre opciones a la vista, en fila. La regla: si siempre hay <strong>una</strong> elegida y son pocas, es un <code>SegmentedControl</code>; si puede haber varias, ninguna, o cada opción necesita más que una palabra, es un <code>Listbox</code> con <code>orientation=\"horizontal\"</code>.",
    "segmentedPage.vsListbox.aspect": "Qué cambia",
    "segmentedPage.vsListbox.choice": "Qué se elige",
    "segmentedPage.vsListbox.choice.segmented": "Exactamente una opción, siempre: no hay forma de dejarla sin elegir.",
    "segmentedPage.vsListbox.choice.listbox": "Una (<code>single</code>), varias (<code>multiple</code>) o un rango (<code>extended</code>).",
    "segmentedPage.vsListbox.role": "Qué anuncia",
    "segmentedPage.vsListbox.role.segmented": "Un <code>radiogroup</code> de <code>radio</code>: un valor, como una vista o un período.",
    "segmentedPage.vsListbox.role.listbox": "Un <code>listbox</code> de <code>option</code>: una lista de la que se escoge, con nombre visible.",
    "segmentedPage.vsListbox.keys": "Teclado",
    "segmentedPage.vsListbox.keys.segmented": "Una parada de <kbd>Tab</kbd>; las flechas mueven y eligen a la vez.",
    "segmentedPage.vsListbox.keys.listbox": "Las flechas mueven el resaltado, y elegir es un paso aparte; con <code>loopFocus</code> da la vuelta.",
    "segmentedPage.vsListbox.count": "Cuántas opciones",
    "segmentedPage.vsListbox.count.segmented": "Dos a cuatro. Con más, la barra se queda sin ancho.",
    "segmentedPage.vsListbox.count.listbox": "Las que sean: es una lista, aunque se dibuje en fila.",
    "segmentedPage.vsListbox.content": "Qué lleva cada opción",
    "segmentedPage.vsListbox.content.segmented": "Una palabra corta, con un icono si ayuda.",
    "segmentedPage.vsListbox.content.listbox": "Etiqueta y descripción, con una marca de elegida (en horizontal se omite).",
    "segmentedPage.vsListbox.clear": "Quitar la elección",
    "segmentedPage.vsListbox.clear.segmented": "No existe.",
    "segmentedPage.vsListbox.clear.listbox": "Con <code>deselectable</code>, elegir de nuevo la opción elegida la limpia.",
    "segmentedPage.viewsBody": "El período de un gráfico o un calendario; elegir uno cambia la vista al instante.",

    "segmentedPage.viewsTitle": "Rango: día, semana o mes",
    "segmentedPage.lede": "Segmented elige una opción entre dos y cuatro, todas a la vista en una barra, y el cambio se ve al instante: la vista de una lista, el período de un gráfico, la unidad de una medida. Es un grupo de radios con forma de barra de botones.",
    "segmentedPage.prop.size.title": "Size: el tamaño de la barra",
    "segmentedPage.prop.size.body": "Sigue la escala de Button: alto, texto y relleno cambian juntos.",
    "segmentedPage.prop.size.sm": "Usa <code>sm</code>, el valor por defecto, en una fila de herramientas.",
    "segmentedPage.prop.size.md": "Usa <code>md</code> junto a campos de formulario.",
    "segmentedPage.prop.size.lg": "Usa <code>lg</code> cuando el control es lo principal, como el selector de estas vistas previas.",
    "segmentedPage.anatomyBody":
      "Este diagrama nombra el root, el indicador y las opciones. El espécimen está congelado; los Segmented vivos empiezan abajo.",
    "segmentedPage.anatomyLabel": "Anatomía de Segmented",
    "segmentedPage.anatomyPreviewLabel": "Segmented, parte por parte",
    "segmentedPage.vanillaInitTitle": "Inicializar vanilla",
    "segmentedPage.test1": "Conecta las partes escritas a mano en un único radiogroup con foco itinerante (roving).",
    "segmentedPage.test2": "Selecciona con click y navegación por flechas, saltando las opciones deshabilitadas.",
    "demo.segmented.dd.mon": "Lun",
    "demo.segmented.dd.tue": "Mar",
    "demo.segmented.dd.wed": "Mié",
    "demo.segmented.dd.thu": "Jue",
    "demo.segmented.dd.fri": "Vie",
    "demo.segmented.dd.sat": "Sáb",
    "demo.segmented.dd.sun": "Dom",
    "segmentedPage.guidelinesLede": "Una barra corta muestra todas las opciones y cuál está activa, sin abrir nada.",
    "segmentedPage.dd.few.title": "Opciones: pocas y cortas",
    "segmentedPage.dd.few.do": "Dos a cuatro opciones cortas que caben en una fila.",
    "segmentedPage.dd.few.dont": 'Con muchas opciones el riel no cabe: usa un <a href="/es/componentes/select">Select</a>.',
  },
  en: {
    "demo.segmented.label": "Range",
    "demo.segmented.day": "Day",
    "demo.segmented.week": "Week",
    "demo.segmented.month": "Month",

    "segmentedPage.description": "Chooses one option among a few, all in view in a bar, with immediate effect.",

    "segmentedPage.key.homeEnd": "Chooses the first or last.",

    "segmentedPage.key.arrows": "Chooses the previous or next option.",

    "segmentedPage.a11yYours2": "If the change reorders content far from the control, announce it.",

    "segmentedPage.a11yYours1": "Name the group with <code>aria-label</code>: “Range”.",

    "segmentedPage.a11yDoes2": "The chosen option is announced as checked.",

    "segmentedPage.a11yDoes1": "The group is a single <kbd>Tab</kbd> stop; the arrows choose.",

    "segmentedPage.a11yIntro": "Segmented follows the APG radio group pattern.",

    "segmentedPage.content2": "If you use icons only, give each an accessible name.",

    "segmentedPage.content1": "Write options of one or two words, in the same shape: “Day”, “Week”, “Month”.",

    "segmentedPage.whenNot4": 'To turn one thing on or off: use <a href="/components/switch">Switch</a>.',

    "segmentedPage.whenNot3": 'For a form option that is submitted: use <a href="/components/radio-group">RadioGroup</a>.',

    "segmentedPage.whenNot2": 'For more than 4 options: use <a href="/components/select">Select</a>.',

    "segmentedPage.whenNot1": 'To switch between panels with different content: use <a href="/components/tabs">Tabs</a>.',

    "segmentedPage.when2": "When the change applies at once, with no save button.",

    "segmentedPage.when1": "To switch between 2 and 4 views or modes of the same content.",

    "segmentedPage.contract3": "The indicator travels to the new option with the motion token; with <code>prefers-reduced-motion</code>, it jumps.",

    "segmentedPage.contract2": "The chosen option stays in <code>data-value</code>; in React, <code>value</code> or <code>defaultValue</code>.",

    "segmentedPage.contract1": "It is a <code>radiogroup</code>: one <kbd>Tab</kbd> stop and arrows to choose.",

    "segmentedPage.iconsBody": "Each option's label takes an icon before the word; the icon accompanies the text, it does not replace it.",
    "segmentedPage.iconsTitle": "With icons",
    "segmentedPage.icons.label": "Theme",
    "segmentedPage.icons.system": "System",
    "segmentedPage.icons.light": "Light",
    "segmentedPage.icons.dark": "Dark",
    "segmentedPage.icons.inlineBody": "<code>inline</code>: the icon sits before the word. The bar keeps its height and each option widens just enough.",
    "segmentedPage.icons.blockBody": "<code>block</code>: the icon sits above the word. The bar grows taller and each option narrower, which helps when width is scarce.",
    "segmentedPage.vsListbox.title": "SegmentedControl or horizontal Listbox",
    "segmentedPage.vsListbox.rule": "Both choose among options in plain sight, in a row. The rule: if there is always <strong>one</strong> chosen and there are few, it is a <code>SegmentedControl</code>; if there can be several, none, or each option needs more than a word, it is a <code>Listbox</code> with <code>orientation=\"horizontal\"</code>.",
    "segmentedPage.vsListbox.aspect": "What changes",
    "segmentedPage.vsListbox.choice": "What is chosen",
    "segmentedPage.vsListbox.choice.segmented": "Exactly one option, always: there is no way to leave it unchosen.",
    "segmentedPage.vsListbox.choice.listbox": "One (<code>single</code>), several (<code>multiple</code>) or a range (<code>extended</code>).",
    "segmentedPage.vsListbox.role": "What it announces",
    "segmentedPage.vsListbox.role.segmented": "A <code>radiogroup</code> of <code>radio</code>: one value, like a view or a period.",
    "segmentedPage.vsListbox.role.listbox": "A <code>listbox</code> of <code>option</code>: a list you pick from, with a visible name.",
    "segmentedPage.vsListbox.keys": "Keyboard",
    "segmentedPage.vsListbox.keys.segmented": "One <kbd>Tab</kbd> stop; the arrows move and choose at once.",
    "segmentedPage.vsListbox.keys.listbox": "The arrows move the highlight, and choosing is a separate step; with <code>loopFocus</code> it wraps around.",
    "segmentedPage.vsListbox.count": "How many options",
    "segmentedPage.vsListbox.count.segmented": "Two to four. With more, the bar runs out of width.",
    "segmentedPage.vsListbox.count.listbox": "As many as there are: it is a list, even drawn in a row.",
    "segmentedPage.vsListbox.content": "What each option carries",
    "segmentedPage.vsListbox.content.segmented": "One short word, with an icon if it helps.",
    "segmentedPage.vsListbox.content.listbox": "A label and a description, with a chosen mark (omitted when horizontal).",
    "segmentedPage.vsListbox.clear": "Clearing the choice",
    "segmentedPage.vsListbox.clear.segmented": "Not possible.",
    "segmentedPage.vsListbox.clear.listbox": "With <code>deselectable</code>, choosing the chosen option again clears it.",
    "segmentedPage.viewsBody": "A chart's or calendar's period; choosing one changes the view at once.",

    "segmentedPage.viewsTitle": "Range: day, week or month",
    "segmentedPage.lede": "Segmented chooses one option among two to four, all in view in a bar, and the change shows at once: a list's view, a chart's period, a measure's unit. It is a radio group shaped like a button bar.",
    "segmentedPage.prop.size.title": "Size: the bar's size",
    "segmentedPage.prop.size.body": "Follows Button's scale: height, text and padding change together.",
    "segmentedPage.prop.size.sm": "Use <code>sm</code>, the default, in a row of tools.",
    "segmentedPage.prop.size.md": "Use <code>md</code> beside form fields.",
    "segmentedPage.prop.size.lg": "Use <code>lg</code> when the control is the main thing, like these previews' value picker.",
    "segmentedPage.anatomyBody":
      "This diagram names the root, the indicator and the options. The specimen is frozen; the live Segmented controls begin below.",
    "segmentedPage.anatomyLabel": "Segmented anatomy",
    "segmentedPage.anatomyPreviewLabel": "Segmented, part by part",
    "segmentedPage.vanillaInitTitle": "Initializing vanilla",
    "segmentedPage.test1": "Patches the authored parts into one roving radiogroup.",
    "segmentedPage.test2": "Selects on click and arrow navigation, skipping disabled options.",
    "demo.segmented.dd.mon": "Mon",
    "demo.segmented.dd.tue": "Tue",
    "demo.segmented.dd.wed": "Wed",
    "demo.segmented.dd.thu": "Thu",
    "demo.segmented.dd.fri": "Fri",
    "demo.segmented.dd.sat": "Sat",
    "demo.segmented.dd.sun": "Sun",
    "segmentedPage.guidelinesLede": "A short bar shows every option and which is active, without opening anything.",
    "segmentedPage.dd.few.title": "Options: few and short",
    "segmentedPage.dd.few.do": "Two to four short options that fit in one row.",
    "segmentedPage.dd.few.dont": 'With many options the rail does not fit: use a <a href="/components/select">Select</a>.',
  },
} as const;
