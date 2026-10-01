export const menuMessages = {
  es: {
    "demo.menu.label": "Acciones del archivo",
    "demo.menu.trigger": "Acciones",
    "demo.menu.rename": "Renombrar",
    "demo.menu.favorite": "Favorito",
    "demo.menu.export": "Exportar",
    "demo.menu.multilevel.label": "Insertar contenido",
    "demo.menu.multilevel.trigger": "Insertar",
    "demo.menu.multilevel.heading": "Encabezado",
    "demo.menu.multilevel.media": "Medios",
    "demo.menu.multilevel.image": "Imagen",
    "demo.menu.multilevel.upload": "Subir archivo",
    "demo.menu.multilevel.fromUrl": "Desde una URL",
    "demo.menu.multilevel.video": "Video",
    "demo.menu.multilevel.table": "Tabla",
    "demo.menu.compact.label": "Formato de texto",
    "demo.menu.compact.trigger": "Formato",
    "demo.menu.compact.bold": "Negrita",
    "demo.menu.compact.italic": "Cursiva",
    "demo.menu.compact.underline": "Subrayado",
    "demo.menu.compact.strikethrough": "Tachado",
    "demo.menu.compact.alignLeft": "Alinear a la izquierda",
    "demo.menu.compact.alignCenter": "Alinear al centro",
    "demo.menu.compact.alignRight": "Alinear a la derecha",
    "demo.menu.context.label": "Acciones del elemento",
    "demo.menu.context.area": "Clic derecho (o mantén presionado) dentro de esta área",
    "demo.menu.context.copy": "Copiar",
    "demo.menu.context.paste": "Pegar",
    "demo.menu.context.delete": "Eliminar",
    "demo.menu.safety.trigger": "Archivo",
    "demo.menu.safety.new": "Nuevo",
    "demo.menu.safety.share": "Compartir",
    "demo.menu.safety.email": "Por correo",
    "demo.menu.safety.emailOutlook": "Outlook",
    "demo.menu.safety.emailGmail": "Gmail",
    "demo.menu.safety.emailApple": "Apple Mail",
    "demo.menu.safety.emailYahoo": "Yahoo",
    "demo.menu.safety.link": "Copiar enlace",
    "demo.menu.safety.print": "Imprimir",
    "demo.menu.safety.pdf": "Exportar como PDF",
    "demo.menu.safety.pdfHighRes": "Alta resolución",
    "demo.menu.safety.pdfCompressed": "Comprimido",
    "demo.menu.safety.delete": "Eliminar",
    "demo.menu.anatomy.label": "Acciones del documento",
    "demo.menu.anatomy.trigger": "Acciones",
    "demo.menu.anatomy.delete": "Eliminar",

    "menuPage.anatomyBody":
      "Un menú cerrado es un botón: el positioner, el content, las filas y la regla que las separa solo existen mientras el popup está arriba. Por eso el espécimen se dibuja abierto y se queda así. Está congelado, no responde al puntero ni al teclado; el menú vivo es el de abajo.",
    "menuPage.anatomyLabel": "Anatomía de Menu",
    "menuPage.anatomyPreviewLabel": "Menu abierto, parte por parte",
    "menuPage.description": "Agrupa comandos que actúan sobre algo detrás de un botón.",
    "menuPage.key.escape": "Cierra el menú y devuelve el foco.",
    "menuPage.key.letter": "Salta al primer comando que empieza con esa letra.",
    "menuPage.key.run": "Ejecuta el comando o marca la opción.",
    "menuPage.key.homeEnd": "Va al primer o al último comando.",
    "menuPage.key.sub": "Abre o cierra un submenú.",
    "menuPage.key.arrows": "Mueve entre los comandos.",
    "menuPage.key.open": "Abre el menú desde el botón.",
    "menuPage.a11yYours2": "Un menú contextual también debe poder abrirse desde un botón visible: no todos saben usar el clic derecho.",
    "menuPage.a11yYours1": "Un botón de solo ícono debe tener <code>aria-label</code>.",
    "menuPage.a11yDoes3": "Las casillas y las opciones anuncian si están marcadas.",
    "menuPage.a11yDoes2": "Al abrir, el foco entra al menú; al cerrar, vuelve al botón.",
    "menuPage.a11yDoes1": "El botón anuncia <code>aria-haspopup</code> y <code>aria-expanded</code>.",
    "menuPage.a11yIntro": "Menu sigue el patrón menu button de la APG.",
    "menuPage.content4": "Nombra el botón con lo que abre: «Acciones», o un ícono de tres puntos con <code>aria-label</code>.",
    "menuPage.content3": "Agrupa los comandos relacionados y deja los destructivos al final, separados.",
    "menuPage.content2": "Agrega «…» cuando el comando pide algo más antes de hacerse: «Renombrar…».",
    "menuPage.content1": "Empieza cada comando con un verbo: «Duplicar», «Mover a…», «Eliminar».",
    "menuPage.whenNot4": 'Para la navegación de un sitio: usa <a href="/es/componentes/megamenu">Megamenu</a> o <a href="/es/componentes/navbar">Navbar</a>.',
    "menuPage.whenNot3": 'Para la barra de comandos de una aplicación (Archivo, Editar): usa <a href="/es/componentes/menubar">Menubar</a>.',
    "menuPage.whenNot2": 'Para una o dos acciones importantes: muéstralas como <a href="/es/componentes/button">Button</a>.',
    "menuPage.whenNot1": 'Para elegir un valor en un formulario: usa <a href="/es/componentes/select">Select</a>.',
    "menuPage.when3": "Para un menú contextual con clic derecho, además de un botón que lo abra.",
    "menuPage.when2": "Cuando las acciones son muchas o secundarias y no caben a la vista.",
    "menuPage.when1": "Para comandos que actúan sobre algo: las acciones de una fila, de un archivo.",
    "menuPage.contract3": "<code>contextTarget</code> en React, o <code>data-sk-menu-context-trigger</code>, lo abre con clic derecho.",
    "menuPage.contract2": "Un item con <code>children</code> es un submenú, sin límite de profundidad.",
    "menuPage.contract1": 'Ejecuta comandos: <code>role="menu"</code> con <code>menuitem</code>, <code>menuitemcheckbox</code> y <code>menuitemradio</code>.',
    "menuPage.actionsBody": "Acciones, una casilla y un grupo de opciones, separados por reglas. Prueba las flechas y escribir la primera letra.",
    "menuPage.actionsTitle": "Acciones: un botón y sus comandos",
    "menuPage.lede": "Menu agrupa comandos que actúan sobre algo detrás de un botón: las acciones de una fila, las opciones de un documento. Úsalo cuando las acciones son muchas o secundarias. También abre con clic derecho, como menú contextual.",
    "menuPage.multilevelTitle": "Submenús: el mismo menú, anidado",
    "menuPage.multilevelBody": "Insertar → Medios → Imagen: un submenú se abre con <kbd>→</kbd> y se cierra con <kbd>←</kbd>.",
    "menuPage.compactTitle": "Compacto: filas más bajas",
    "menuPage.compactBody": '<code>density="compact"</code> baja cada fila a 24px, el mínimo de WCAG 2.2. Úsalo en herramientas densas con mouse.',
    "menuPage.contextTitle": "Contextual: con clic derecho",
    "menuPage.contextBody": "El área misma abre el menú con clic derecho o con <kbd>Shift</kbd>+<kbd>F10</kbd>, donde está el puntero.",
    "menuPage.safetyTitle": "Intención del puntero: cruzar en diagonal",
    "menuPage.safetyBody": "Con un submenú abierto, pasar en diagonal sobre otra fila no lo cierra: el puntero puede llegar al submenú sin rodeos.",

    "menuPage.testVanilla1":
      'El trigger monta con <code class="sk-code">aria-haspopup="menu"</code> y <code class="sk-code">aria-expanded="false"</code>: el menú no abre solo.',
    "menuPage.testVanilla2":
      'Un click abre el menú; <kbd>Escape</kbd> lo cierra y devuelve el foco al trigger.',
    "menuPage.testVanilla3":
      "Un pointerdown fuera del menú lo cierra, el mismo dismiss-layer que un click adentro ya usa.",
    "menuPage.testVanilla4":
      'Elegir un item dispara el evento <code class="sk-code">sk-select</code> con su value y cierra el menú.',
    "menuPage.testVanilla5":
      'Un item deshabilitado nunca dispara <code class="sk-code">sk-select</code>; el menú se queda abierto.',
    "menuPage.testVanilla6":
      'Un checkbox alterna <code class="sk-code">data-checked</code> y emite <code class="sk-code">sk:menucheckedchange</code>.',
    "menuPage.testVanilla7":
      "Dos radios del mismo grupo son mutuamente excluyentes; elegir uno cierra el menú, como un comando.",
    "menuPage.testVanilla8":
      'Un item con <code class="sk-code">href</code> se renderiza como un <code class="sk-code">&lt;a&gt;</code> real con <code class="sk-code">role="menuitem"</code>.',
    "menuPage.testVanilla9":
      "ArrowDown mueve el resaltado por la lista, saltando el item deshabilitado.",
    "menuPage.testVanilla10":
      'Un item con <code class="sk-code">children</code> monta una segunda instancia real de Menu, cerrada hasta que se abre.',
    "menuPage.testVanilla11":
      "Elegir un item del submenú cierra todo el árbol, padre incluido.",

    "menuPage.testReact1":
      'El trigger monta con <code class="sk-code">aria-haspopup="menu"</code> y <code class="sk-code">aria-expanded="false"</code>: el menú no abre solo.',
    "menuPage.testReact2":
      'Un click abre el menú; <kbd>Escape</kbd> lo cierra y devuelve el foco al trigger.',
    "menuPage.testReact3":
      "Un pointerdown fuera del menú lo cierra, el mismo dismiss-layer que un click adentro ya usa.",
    "menuPage.testReact4":
      'Elegir un item llama a <code class="sk-code">onSelect</code> con su value y cierra el menú.',
    "menuPage.testReact5":
      'Un item deshabilitado nunca llama a <code class="sk-code">onSelect</code>; el menú se queda abierto.',
    "menuPage.testReact6":
      'Un checkbox alterna <code class="sk-code">aria-checked</code> y llama a <code class="sk-code">onCheckedChange</code>.',
    "menuPage.testReact7":
      "Dos radios del mismo grupo son mutuamente excluyentes; elegir uno cierra el menú, como un comando.",
    "menuPage.testReact8":
      'Un item con <code class="sk-code">href</code> se renderiza como un <code class="sk-code">&lt;a&gt;</code> real.',
    "menuPage.testReact9":
      "ArrowDown mueve el resaltado por la lista, saltando el item deshabilitado.",
    "menuPage.testReact10":
      "Elegir un item del submenú cierra todo el árbol, padre incluido.",
    "menuPage.guidelinesLede": "Un menú esconde comandos: úsalo para los que no necesitan estar a la vista.",
  },
  en: {
    "demo.menu.label": "File actions",
    "demo.menu.trigger": "Actions",
    "demo.menu.rename": "Rename",
    "demo.menu.favorite": "Favourite",
    "demo.menu.export": "Export",
    "demo.menu.multilevel.label": "Insert content",
    "demo.menu.multilevel.trigger": "Insert",
    "demo.menu.multilevel.heading": "Heading",
    "demo.menu.multilevel.media": "Media",
    "demo.menu.multilevel.image": "Image",
    "demo.menu.multilevel.upload": "Upload file",
    "demo.menu.multilevel.fromUrl": "From a URL",
    "demo.menu.multilevel.video": "Video",
    "demo.menu.multilevel.table": "Table",
    "demo.menu.compact.label": "Text format",
    "demo.menu.compact.trigger": "Format",
    "demo.menu.compact.bold": "Bold",
    "demo.menu.compact.italic": "Italic",
    "demo.menu.compact.underline": "Underline",
    "demo.menu.compact.strikethrough": "Strikethrough",
    "demo.menu.compact.alignLeft": "Align left",
    "demo.menu.compact.alignCenter": "Align center",
    "demo.menu.compact.alignRight": "Align right",
    "demo.menu.context.label": "Item actions",
    "demo.menu.context.area": "Right-click (or press and hold) inside this area",
    "demo.menu.context.copy": "Copy",
    "demo.menu.context.paste": "Paste",
    "demo.menu.context.delete": "Delete",
    "demo.menu.safety.trigger": "File",
    "demo.menu.safety.new": "New",
    "demo.menu.safety.share": "Share",
    "demo.menu.safety.email": "By email",
    "demo.menu.safety.emailOutlook": "Outlook",
    "demo.menu.safety.emailGmail": "Gmail",
    "demo.menu.safety.emailApple": "Apple Mail",
    "demo.menu.safety.emailYahoo": "Yahoo",
    "demo.menu.safety.link": "Copy link",
    "demo.menu.safety.print": "Print",
    "demo.menu.safety.pdf": "Export as PDF",
    "demo.menu.safety.pdfHighRes": "High resolution",
    "demo.menu.safety.pdfCompressed": "Compressed",
    "demo.menu.safety.delete": "Delete",
    "demo.menu.anatomy.label": "Document actions",
    "demo.menu.anatomy.trigger": "Actions",
    "demo.menu.anatomy.delete": "Delete",

    "menuPage.anatomyBody":
      "A closed menu is a button: the positioner, the content, the rows and the rule between them only exist while the popup is up. So the specimen is drawn open and stays open. It is frozen: no pointer, no keyboard; the live menu is the one below.",
    "menuPage.anatomyLabel": "Menu anatomy",
    "menuPage.anatomyPreviewLabel": "An open Menu, part by part",
    "menuPage.description": "Groups commands that act on something behind a button.",
    "menuPage.key.escape": "Closes the menu and returns focus.",
    "menuPage.key.letter": "Jumps to the first command starting with that letter.",
    "menuPage.key.run": "Runs the command or checks the option.",
    "menuPage.key.homeEnd": "Goes to the first or last command.",
    "menuPage.key.sub": "Opens or closes a submenu.",
    "menuPage.key.arrows": "Moves between commands.",
    "menuPage.key.open": "Opens the menu from the button.",
    "menuPage.a11yYours2": "A context menu must also open from a visible button: not everyone knows to right-click.",
    "menuPage.a11yYours1": "An icon-only button must have an <code>aria-label</code>.",
    "menuPage.a11yDoes3": "Checkboxes and options announce whether they are checked.",
    "menuPage.a11yDoes2": "On open, focus enters the menu; on close, it returns to the button.",
    "menuPage.a11yDoes1": "The button announces <code>aria-haspopup</code> and <code>aria-expanded</code>.",
    "menuPage.a11yIntro": "Menu follows the APG menu button pattern.",
    "menuPage.content4": "Name the button by what it opens: “Actions”, or a three-dot icon with an <code>aria-label</code>.",
    "menuPage.content3": "Group related commands and leave destructive ones last, set apart.",
    "menuPage.content2": "Add “…” when the command asks for more before it runs: “Rename…”.",
    "menuPage.content1": "Start each command with a verb: “Duplicate”, “Move to…”, “Delete”.",
    "menuPage.whenNot4": 'For a site\'s navigation: use <a href="/components/megamenu">Megamenu</a> or <a href="/components/navbar">Navbar</a>.',
    "menuPage.whenNot3": 'For an application\'s command bar (File, Edit): use <a href="/components/menubar">Menubar</a>.',
    "menuPage.whenNot2": 'For one or two important actions: show them as <a href="/components/button">Button</a>.',
    "menuPage.whenNot1": 'To choose a value in a form: use <a href="/components/select">Select</a>.',
    "menuPage.when3": "For a right-click context menu, plus a button that opens it.",
    "menuPage.when2": "When there are many or secondary actions that do not fit in view.",
    "menuPage.when1": "For commands that act on something: a row's actions, a file's.",
    "menuPage.contract3": "<code>contextTarget</code> in React, or <code>data-sk-menu-context-trigger</code>, opens it on right-click.",
    "menuPage.contract2": "An item with <code>children</code> is a submenu, with no depth limit.",
    "menuPage.contract1": 'It runs commands: <code>role="menu"</code> with <code>menuitem</code>, <code>menuitemcheckbox</code> and <code>menuitemradio</code>.',
    "menuPage.actionsBody": "Actions, a checkbox and a group of options, separated by rules. Try the arrows and typing the first letter.",
    "menuPage.actionsTitle": "Actions: a button and its commands",
    "menuPage.lede": "Menu groups commands that act on something behind a button: a row's actions, a document's options. Use it when there are many actions or they are secondary. It also opens on right-click, as a context menu.",
    "menuPage.multilevelTitle": "Submenus: the same menu, nested",
    "menuPage.multilevelBody": "Insert → Media → Image: a submenu opens with <kbd>→</kbd> and closes with <kbd>←</kbd>.",
    "menuPage.compactTitle": "Compact: shorter rows",
    "menuPage.compactBody": '<code>density="compact"</code> lowers each row to 24px, the WCAG 2.2 minimum. Use it in dense mouse-driven tools.',
    "menuPage.contextTitle": "Context: on right-click",
    "menuPage.contextBody": "The area itself opens the menu with a right-click or <kbd>Shift</kbd>+<kbd>F10</kbd>, where the pointer is.",
    "menuPage.safetyTitle": "Pointer intent: crossing diagonally",
    "menuPage.safetyBody": "With a submenu open, passing diagonally over another row does not close it: the pointer can reach the submenu directly.",

    "menuPage.testVanilla1":
      'The trigger mounts with <code class="sk-code">aria-haspopup="menu"</code> and <code class="sk-code">aria-expanded="false"</code>: the menu never opens on its own.',
    "menuPage.testVanilla2":
      'A click opens the menu; <kbd>Escape</kbd> closes it and returns focus to the trigger.',
    "menuPage.testVanilla3":
      "A pointerdown outside the menu closes it, the same dismiss layer a click inside already uses.",
    "menuPage.testVanilla4":
      'Choosing an item fires the <code class="sk-code">sk-select</code> event with its value and closes the menu.',
    "menuPage.testVanilla5":
      'A disabled item never fires <code class="sk-code">sk-select</code>; the menu stays open.',
    "menuPage.testVanilla6":
      'A checkbox toggles <code class="sk-code">data-checked</code> and emits <code class="sk-code">sk:menucheckedchange</code>.',
    "menuPage.testVanilla7":
      "Two radios in the same group are mutually exclusive; choosing one closes the menu, like a command.",
    "menuPage.testVanilla8":
      'An item with <code class="sk-code">href</code> renders as a real <code class="sk-code">&lt;a&gt;</code> with <code class="sk-code">role="menuitem"</code>.',
    "menuPage.testVanilla9":
      "ArrowDown moves the highlight through the item list, skipping the disabled one.",
    "menuPage.testVanilla10":
      'An item with <code class="sk-code">children</code> mounts a real second Menu instance, closed until opened.',
    "menuPage.testVanilla11":
      "Choosing a submenu item closes the whole tree, parent included.",

    "menuPage.testReact1":
      'The trigger mounts with <code class="sk-code">aria-haspopup="menu"</code> and <code class="sk-code">aria-expanded="false"</code>: the menu never opens on its own.',
    "menuPage.testReact2":
      'A click opens the menu; <kbd>Escape</kbd> closes it and returns focus to the trigger.',
    "menuPage.testReact3":
      "A pointerdown outside the menu closes it, the same dismiss layer a click inside already uses.",
    "menuPage.testReact4":
      'Choosing an item calls <code class="sk-code">onSelect</code> with its value and closes the menu.',
    "menuPage.testReact5":
      'A disabled item never calls <code class="sk-code">onSelect</code>; the menu stays open.',
    "menuPage.testReact6":
      'A checkbox toggles <code class="sk-code">aria-checked</code> and calls <code class="sk-code">onCheckedChange</code>.',
    "menuPage.testReact7":
      "Two radios in the same group are mutually exclusive; choosing one closes the menu, like a command.",
    "menuPage.testReact8":
      'An item with <code class="sk-code">href</code> renders as a real <code class="sk-code">&lt;a&gt;</code>.',
    "menuPage.testReact9":
      "ArrowDown moves the highlight through the item list, skipping the disabled one.",
    "menuPage.testReact10":
      "Choosing a submenu item closes the whole tree, parent included.",
    "menuPage.guidelinesLede": "A menu hides commands: use it for those that need not be in view.",
  },
} as const;
