export const commandPaletteMessages = {
  es: {
    "demo.commandPalette.open": "Abrir paleta",
    "demo.commandPalette.label": "Buscar",
    "demo.commandPalette.section": "Componentes",
    "demo.commandPalette.button": "Button",
    "demo.commandPalette.dialog": "Dialog",
    "demo.commandPalette.toc": "Toc",
    "demo.commandPalette.placeholder": "Buscar…",
    "demo.commandPalette.close": "Cerrar",
    "demo.commandPalette.results": "Resultados",
    "demo.commandPalette.empty": "Sin resultados.",
    "demo.commandPalette.enterKey": "Enter",
    "demo.commandPalette.footer": "para abrir",

    "commandPalette.description": "Lleva a un destino o una acción escribiendo su nombre.",

    "commandPalette.a11yKeyEsc": "Cierra la paleta y devuelve el foco.",

    "commandPalette.a11yKeyEnter": "Abre el resultado activo.",

    "commandPalette.a11yKeyArrows": "Recorre los resultados.",

    "commandPalette.a11yKeyHotkey": "Abre la paleta, si el atajo está activo.",

    "commandPalette.a11yYours2": "No uses un atajo que choque con uno del navegador o del lector de pantalla.",

    "commandPalette.a11yYours1": "Da un botón visible para abrirla: el atajo solo no se descubre.",

    "commandPalette.a11yDoes2": "El foco se queda en el campo; <code>aria-activedescendant</code> señala la opción activa.",

    "commandPalette.a11yDoes1": "Es un <code>&lt;dialog&gt;</code> nativo: atrapa el foco, lo devuelve al cerrar y se cierra con Esc.",

    "commandPalette.a11yIntro": "La paleta es un diálogo modal con una lista que se recorre desde el campo.",

    "commandPalette.content4": "Muestra el atajo junto al botón que la abre: «⌘K».",

    "commandPalette.content3": "Si no hay resultados, dilo y sugiere otra palabra: «Sin resultados».",

    "commandPalette.content2": "Usa un placeholder que diga qué se busca: «Buscar páginas y acciones».",

    "commandPalette.content1": "Nombra cada entrada como la persona la buscaría: el título de la página o el verbo de la acción.",

    "commandPalette.whenNot3": 'Para un campo de formulario que filtra una lista: usa <a href="/es/componentes/combobox">Combobox</a>.',

    "commandPalette.whenNot2": "Como única forma de llegar a algo: la paleta complementa la navegación, no la reemplaza.",

    "commandPalette.whenNot1": 'Si las opciones son pocas y entran a la vista: usa <a href="/es/componentes/menu">Menu</a>.',

    "commandPalette.when2": "Para quien usa el producto seguido y quiere llegar sin recorrer menús.",

    "commandPalette.when1": "Cuando hay muchos destinos o acciones y escribir el nombre llega antes que navegar.",

    "commandPalette.contract3": "Se cierra con el botón de cerrar, con Esc o con un clic en el fondo.",

    "commandPalette.contract2": 'Un botón con <code>data-sk-command-palette-open</code> y <code>aria-controls</code> la abre; <code>data-sk-command-palette-hotkey="mod+k"</code> agrega el atajo.',

    "commandPalette.contract1": 'El índice es un JSON en un <code>&lt;script type="application/json"&gt;</code>, apuntado por <code>data-sk-command-palette-index</code>.',

    "commandPalette.exampleBody": "Abre la paleta, escribe y elige con Enter. Esc o el botón de cerrar la cierran.",

    "commandPalette.exampleTitle": "Buscar y abrir: un índice de páginas",
    "commandPalette.anatomyBody": "El campo, el botón de cerrar, la lista, cada opción, el mensaje vacío y el pie, con la paleta abierta.",
    "commandPalette.anatomyLabel": "Anatomía de CommandPalette",
    "commandPalette.anatomyPreviewLabel": "CommandPalette abierta, parte por parte",
    "commandPalette.lede": 'CommandPalette lleva a un destino o una acción escribiendo su nombre, sin navegar: un campo que filtra un índice, dentro de un <a href="/es/componentes/dialog">Dialog</a> nativo. Se abre con un botón y, si lo activas, con un atajo; este sitio usa {hotkey}.',
    "commandPalette.test1": "No reclama nada en reposo: sin opciones y sin popup expandido.",
    "commandPalette.test2": "Filtra a medida que se tipea y apunta al primer resultado.",
    "commandPalette.test3": "Abre desde su trigger y solo entonces llena la lista.",
    "commandPalette.guidelinesLede": "Una paleta es un atajo para quien ya sabe adónde va.",
    "commandPalette.dd.shortcut.title": "Acceso: atajo y botón visible",
    "commandPalette.dd.shortcut.do": "El botón deja descubrir la paleta; el atajo acelera su apertura.",
    "commandPalette.dd.shortcut.dont": "Un atajo sin botón no se descubre y deja afuera a quien no puede usarlo.",
    "demo.commandPalette.openGeneric": "Abrir",
    "commandPalette.dd.results.title": "Resultados: nombres que orientan",
    "commandPalette.dd.results.do": "Cada opción nombra un destino distinto y muestra su sección para reconocerlo de un vistazo.",
    "commandPalette.dd.results.dont": "Dos opciones llamadas «Abrir» no dicen qué va a pasar al elegirlas.",
  },
  en: {
    "demo.commandPalette.open": "Open palette",
    "demo.commandPalette.label": "Search",
    "demo.commandPalette.section": "Components",
    "demo.commandPalette.button": "Button",
    "demo.commandPalette.dialog": "Dialog",
    "demo.commandPalette.toc": "Toc",
    "demo.commandPalette.placeholder": "Search…",
    "demo.commandPalette.close": "Close",
    "demo.commandPalette.results": "Results",
    "demo.commandPalette.empty": "No results.",
    "demo.commandPalette.enterKey": "Enter",
    "demo.commandPalette.footer": "to open",

    "commandPalette.description": "Takes people to a destination or an action by typing its name.",

    "commandPalette.a11yKeyEsc": "Closes the palette and returns focus.",

    "commandPalette.a11yKeyEnter": "Opens the active result.",

    "commandPalette.a11yKeyArrows": "Moves through the results.",

    "commandPalette.a11yKeyHotkey": "Opens the palette, if the shortcut is on.",

    "commandPalette.a11yYours2": "Do not use a shortcut that clashes with the browser's or the screen reader's.",

    "commandPalette.a11yYours1": "Give a visible button to open it: a shortcut alone is not discoverable.",

    "commandPalette.a11yDoes2": "Focus stays in the field; <code>aria-activedescendant</code> points to the active option.",

    "commandPalette.a11yDoes1": "It is a native <code>&lt;dialog&gt;</code>: it traps focus, returns it on close and closes with Esc.",

    "commandPalette.a11yIntro": "The palette is a modal dialog with a list moved through from the field.",

    "commandPalette.content4": "Show the shortcut beside the button that opens it: “⌘K”.",

    "commandPalette.content3": "When there are no results, say so: “No results”.",

    "commandPalette.content2": "Use a placeholder that says what is searched: “Search pages and actions”.",

    "commandPalette.content1": "Name each entry the way people would search for it: the page's title or the action's verb.",

    "commandPalette.whenNot3": 'For a form field that filters a list: use <a href="/components/combobox">Combobox</a>.',

    "commandPalette.whenNot2": "As the only way to reach something: the palette complements navigation, it does not replace it.",

    "commandPalette.whenNot1": 'If the options are few and fit in view: use <a href="/components/menu">Menu</a>.',

    "commandPalette.when2": "For people who use the product often and want to get there without menus.",

    "commandPalette.when1": "When there are many destinations or actions and typing the name gets there faster than navigating.",

    "commandPalette.contract3": "It closes with the close button, Esc or a click on the backdrop.",

    "commandPalette.contract2": 'A button with <code>data-sk-command-palette-open</code> and <code>aria-controls</code> opens it; <code>data-sk-command-palette-hotkey="mod+k"</code> adds the shortcut.',

    "commandPalette.contract1": 'The index is JSON in a <code>&lt;script type="application/json"&gt;</code>, pointed to by <code>data-sk-command-palette-index</code>.',

    "commandPalette.exampleBody": "Open the palette, type and pick with Enter. Esc or the close button closes it.",

    "commandPalette.exampleTitle": "Search and open: an index of pages",
    "commandPalette.anatomyBody": "The field, the close button, the list, each option, the empty message and the footer, with the palette open.",
    "commandPalette.anatomyLabel": "CommandPalette anatomy",
    "commandPalette.anatomyPreviewLabel": "An open CommandPalette, part by part",
    "commandPalette.lede": 'CommandPalette takes people to a destination or an action by typing its name, without navigating: a field that filters an index, inside a native <a href="/components/dialog">Dialog</a>. It opens from a button and, if you enable it, a shortcut; this site uses {hotkey}.',
    "commandPalette.test1": "Claims nothing at rest: no options and no expanded popup.",
    "commandPalette.test2": "Filters as the reader types and points at the first hit.",
    "commandPalette.test3": "Opens from its trigger and fills the list only then.",
    "commandPalette.guidelinesLede": "A palette is a shortcut for people who already know where they are going.",
    "commandPalette.dd.shortcut.title": "Access: shortcut and visible button",
    "commandPalette.dd.shortcut.do": "The button makes the palette discoverable; the shortcut makes it faster to open.",
    "commandPalette.dd.shortcut.dont": "A shortcut without a button is undiscoverable and excludes people who cannot use it.",
    "demo.commandPalette.openGeneric": "Open",
    "commandPalette.dd.results.title": "Results: names that guide",
    "commandPalette.dd.results.do": "Each option names a distinct destination and shows its section, so people can recognize it at a glance.",
    "commandPalette.dd.results.dont": "Two options called “Open” do not say what choosing either one will do.",
  },
} as const;
