export const menubarMessages = {
  es: {

    "menubarPage.description": "Muestra los comandos de una aplicación en una barra fija, como Archivo, Editar y Ver.",

    "menubarPage.key.tab": "Sale de la barra.",

    "menubarPage.key.escape": "Cierra el desplegable y vuelve a su entrada.",

    "menubarPage.key.arrowsV": "Recorre los comandos del desplegable.",

    "menubarPage.key.open": "Abre el desplegable de la entrada.",

    "menubarPage.key.arrowsH": "Pasa a la entrada anterior o siguiente de la barra.",

    "menubarPage.a11yYours2": "Si muestras atajos, haz que funcionen también con el menú cerrado.",

    "menubarPage.a11yYours1": "Debe tener <code>aria-label</code>: «Menú del editor».",

    "menubarPage.a11yDoes3": "Con un desplegable abierto, <kbd>←</kbd> y <kbd>→</kbd> abren el de al lado.",

    "menubarPage.a11yDoes2": "Cada entrada anuncia <code>aria-haspopup</code> y <code>aria-expanded</code>.",

    "menubarPage.a11yDoes1": "La barra tiene una sola parada de <kbd>Tab</kbd>.",

    "menubarPage.a11yIntro": "Menubar sigue el patrón menubar de la APG.",

    "menubarPage.content3": "Muestra el atajo de cada comando al final de su fila: «Guardar ⌘S».",

    "menubarPage.content2": "Sigue el orden que la gente conoce: Archivo primero, Ayuda al final.",

    "menubarPage.content1": "Nombra cada entrada con una palabra: «Archivo», «Editar», «Ver».",

    "menubarPage.whenNot4": 'Para el borde superior de la ventana de una aplicación de escritorio, con su estado: usa <a href="/es/componentes/app-bar">AppBar</a>.',
    "menubarPage.whenNot3": 'Para unos pocos botones de formato: usa <a href="/es/componentes/toolbar">Toolbar</a>.',

    "menubarPage.whenNot2": 'Para la navegación de un sitio: usa <a href="/es/componentes/megamenu">Megamenu</a> o <a href="/es/componentes/navbar">Navbar</a>.',

    "menubarPage.whenNot1": 'Para un solo grupo de comandos: usa <a href="/es/componentes/menu">Menu</a>.',

    "menubarPage.when2": "Cuando hay tres o más grupos de comandos que se usan seguido.",

    "menubarPage.when1": "Para los comandos de una aplicación de escritorio o un editor: Archivo, Editar, Ver.",

    "menubarPage.contract3": "La barra tiene una sola parada de <kbd>Tab</kbd>: las flechas mueven dentro.",

    "menubarPage.contract2": "Cada desplegable es un Menu real, con sus submenús y su teclado.",

    "menubarPage.contract1": 'La raíz es un <code>role="menubar"</code> con <code>aria-label</code> obligatorio; cada entrada, un <code>menuitem</code>.',

    "menubarPage.editorBody": "Abre una entrada y recorre las demás con <kbd>←</kbd> y <kbd>→</kbd>: el desplegable sigue al foco.",

    "menubarPage.editorTitle": "Editor: Archivo, Editar y Ver",
    "menubarPage.lede": "Menubar muestra los comandos de una aplicación en una barra fija: Archivo, Editar, Ver en un editor. Cada entrada abre un desplegable, y las flechas recorren la barra sin salir de ella.",
    "menubarPage.anatomyBody":
      "Este diagrama nombra la barra, el wrapper, el ítem abierto y el popup Menu que cuelga de él. El espécimen está congelado; las barras vivas empiezan abajo.",
    "menubarPage.anatomyLabel": "Anatomía de Menubar",
    "menubarPage.anatomyPreviewLabel": "Menubar abierto, parte por parte",
    "menubarPage.contractBody":
      'Sin máquina <code>@zag-js/*</code> propia: igual que <code>Treegrid</code>/<code>DataGrid</code>, escrito a mano y compartido por ambos bindings. Alcance de v1, de la BARRA misma: UN desplegable por ítem de nivel superior, y ni siquiera eso lo maneja <code>Menubar</code> a mano: moverse a un ítem vecino con el desplegable abierto cierra el viejo y abre el nuevo, todo vía la propia <code>api.setOpen()</code> de <code>Menu</code>. El CONTENIDO de un desplegable no tiene ese límite: es un <code>Menu</code> real, así que anida submenús tan profundo como <code>Menu</code> permite (ver «Desplegables con submenú» más abajo).',
    "menubarPage.label": "Barra de menú",
    "menubarPage.submenuTitle": "Submenús: Exportar como…",
    "menubarPage.submenuBody": "Cada desplegable es un Menu, así que un comando puede abrir su propio submenú.",
    "menubarPage.testCore1":
      "Al moverse mientras un desplegable estaba abierto, mantiene abierto el del ítem SIGUIENTE. El detalle que un roving tabindex plano se pierde.",
    "menubarPage.testReact1":
      "Moverse a la derecha mientras un desplegable está abierto lo cierra y abre el del ítem adyacente.",
    "menubarPage.testReact2": "Escape cierra el desplegable abierto y devuelve el foco a su trigger.",
    "menubarPage.testVanilla1": "Clickear el trigger de un ítem vecino mientras un desplegable está abierto cierra el primero y abre el del vecino.",

    "demo.menubar.label": "Barra de menú",
    "demo.menubar.file": "Archivo",
    "demo.menubar.new": "Nuevo",
    "demo.menubar.open": "Abrir",
    "demo.menubar.save": "Guardar",
    "demo.menubar.export": "Exportar",
    "demo.menubar.pdf": "PDF",
    "demo.menubar.csv": "CSV",
    "demo.menubar.print": "Imprimir",
    "demo.menubar.edit": "Editar",
    "demo.menubar.undo": "Deshacer",
    "demo.menubar.redo": "Rehacer",
    "menubarPage.guidelinesLede": "Una barra de menú pone a mano todos los comandos de una aplicación, agrupados por tema.",
    "demo.menubar.help": "Ayuda",
    "demo.menubar.view": "Ver",
    "demo.menubar.longFile": "Archivo del proyecto",
    "demo.menubar.longEdit": "Editar el contenido",
    "demo.menubar.longView": "Ver y ajustar la vista",
    "demo.menubar.longHelp": "Ayuda y soporte técnico",
    "menubarPage.entry.title": "Entradas: desplegable, submenú o comando",
    "menubarPage.entry.intro": "Cada entrada de la barra abre un desplegable o ejecuta un comando directo; y un comando del desplegable puede abrir su propio submenú.",
    "menubarPage.entry.label": "Tipo de entrada",
    "menubarPage.entry.dropdown": "Desplegable",
    "menubarPage.entry.submenu": "Submenú",
    "menubarPage.entry.command": "Comando",
    "menubarPage.entry.dropdown.body": "Una entrada con <code>items</code> abre un desplegable, un <code>Menu</code> real. Es la forma de casi toda la barra.",
    "menubarPage.entry.submenu.body": "Un ítem con <code>children</code> abre un submenú: <code>Exportar</code> tiene PDF y CSV. Con el teclado, → lo abre y ← lo cierra.",
    "menubarPage.entry.command.body": "Una entrada sin <code>items</code> es un comando directo (<code>Ayuda</code>): no tiene flecha porque no abre nada.",
    "menubarPage.dd.labels.title": "Entradas: una palabra",
    "menubarPage.dd.labels.do": "«Archivo», «Editar», «Ver»: se leen de un vistazo y caben en la fila.",
    "menubarPage.dd.labels.dont": "Las frases largas llenan la fila: las entradas que siguen se cortan y desaparecen.",
    "menubarPage.dd.commands.title": "Desplegables: comandos, no destinos",
    "menubarPage.dd.commands.do": "Cada ítem hace algo sobre el documento: nuevo, abrir, guardar.",
    "menubarPage.dd.commands.dont": 'Llevar a otras páginas no es un comando. Para eso usa <a href="/es/componentes/megamenu">Megamenu</a> o <a href="/es/nav-list">NavList</a>.',
    "demo.menubar.cut": "Cortar",
    "demo.menubar.copy": "Copiar",
    "demo.menubar.paste": "Pegar",
    "demo.menubar.delete": "Eliminar",
    "demo.menubar.ruler": "Mostrar regla",
    "demo.menubar.grid": "Mostrar cuadrícula",
    "demo.menubar.docs": "Documentación",
    "demo.menubar.shortcuts": "Atajos de teclado",
    "demo.menubar.report": "Reportar un problema",
    "menubarPage.rows.title": "Dentro del desplegable: todo tipo de fila",
    "menubarPage.rows.intro": "Abre <strong>Ver</strong>: un desplegable es un Menu real, y en un solo menú caben todos estos tipos de fila, no solo comandos.",
    "menubarPage.rows.legend1": "<strong>Casillas</strong> (<code>kind=\"checkbox\"</code>): activan o desactivan algo; el menú guarda el estado.",
    "menubarPage.rows.legend2": "<strong>Radios</strong> (<code>kind=\"radio\"</code> con el mismo <code>group</code>): eligen una sola opción.",
    "menubarPage.rows.legend3": "<strong>Separadores</strong> (<code>kind=\"separator\"</code>): agrupan las filas por tema.",
    "menubarPage.rows.legend4": "<strong>Deshabilitada</strong> (<code>disabled</code>): se ve pero no actúa, como «Restablecer vista» sin cambios.",
    "menubarPage.rows.legend5": "<strong>Peligro</strong> (<code>tone=\"danger\"</code>): una acción que destruye, apartada de las demás.",
    "menubarPage.rows.legend6": "<strong>Enlace</strong> (<code>href</code>): una fila que lleva fuera de la aplicación, a su documentación.",
    "demo.menubar.reset": "Restablecer vista",
    "demo.menubar.clear": "Borrar preferencias",
    "demo.menubar.viewHelp": "Ayuda de la vista",
    "menubarPage.editor.title": "Un editor completo: cuatro entradas",
    "menubarPage.editor.body": "Todo junto, como lo lleva un editor: un submenú en Archivo, un separador y una fila deshabilitada en Editar, casillas y zoom en Ver, y enlaces en Ayuda.",
    "menubarVs.appbarPage.title": "AppBar o Menubar",
    "menubarVs.appbarPage.rule": "<strong>Usa AppBar para el borde superior de la ventana de una aplicación de escritorio, con su estado al otro lado. Cambia a <a href='/es/componentes/menubar'>Menubar</a> cuando la barra de menús va dentro de una página o un panel, entre otros controles; cuando sus desplegables necesitan casillas, radios o separadores; o cuando debe funcionar en pantallas táctiles.</strong> Los dos abren menús desde una barra y se recorren con flechas; lo que cambia es qué es la barra.",
    "menubarVs.title": "Menubar o AppBar",
    "menubarVs.rule": "<strong>Si es el borde superior de la ventana de una aplicación de escritorio, con su estado al otro lado, usa <a href='/es/componentes/app-bar'>AppBar</a>. Si es una barra de menús dentro de una página o un panel, entre otros controles, usa <a href='/es/componentes/menubar'>Menubar</a>.</strong> Los dos abren menús desde una barra y se recorren con flechas; lo que cambia es qué es la barra.",
    "menubarVs.intro": "Los mismos comandos en cada uno: solo cambia el componente.",
    "menubarVs.toggle": "Componente",
    "menubarVs.menubar.body": "<code>Menubar</code>: cada entrada es un botón con su flecha. Se lee como un control más de la página.",
    "menubarVs.appbar.body": "<code>AppBar</code>: las entradas son palabras sin caja; la primera, en negrita, es el menú de la aplicación, y a la derecha va el estado.",
    "menubarVs.col.aspect": "Aspecto",
    "menubarVs.row.where": "Dónde vive",
    "menubarVs.row.where.menubar": "Dentro de una página o un panel, entre otros controles.",
    "menubarVs.row.where.appbar": "En el borde superior de la ventana: es el marco de la aplicación, no su contenido.",
    "menubarVs.row.entries": "Las entradas",
    "menubarVs.row.entries.menubar": "Botones <code>ghost</code> con una flecha en cada desplegable.",
    "menubarVs.row.entries.appbar": "Palabras sin caja hasta que se abren; la primera, en negrita, es el menú de la aplicación.",
    "menubarVs.row.dropdown": "Qué lleva un desplegable",
    "menubarVs.row.dropdown.menubar": "La forma completa de <code>Menu</code>: casillas, radios, separadores, peligro, enlaces.",
    "menubarVs.row.dropdown.appbar": "Solo acciones: sin casillas, radios ni separadores. Elegir y ajustar es de la aplicación, no de su barra.",
    "menubarVs.row.status": "Estado",
    "menubarVs.row.status.menubar": "No tiene: solo menús.",
    "menubarVs.row.status.appbar": "Una región a la derecha para unas palabras de estado (Guardado, un ancho, la hora), algunas con su propio menú.",
    "menubarVs.row.device": "Dónde funciona",
    "menubarVs.row.device.menubar": "En cualquier pantalla, también táctil: sus botones tienen el tamaño de un botón.",
    "menubarVs.row.device.appbar": "Escritorio con puntero: objetivos de 24px, y con un menú abierto, apuntar a otro lo abre.",
    "menubarPage.dd.single.title": "Entradas: varias, o es un Menu",
    "menubarPage.dd.single.do": "Varias entradas forman la barra de la aplicación.",
    "menubarPage.dd.single.dont": 'Una sola entrada es un botón que abre un <a href="/es/componentes/menu">Menu</a>.',
  },
  en: {

    "menubarPage.description": "Shows an application's commands in a persistent bar, like File, Edit and View.",

    "menubarPage.key.tab": "Leaves the bar.",

    "menubarPage.key.escape": "Closes the dropdown and returns to its entry.",

    "menubarPage.key.arrowsV": "Moves through the dropdown's commands.",

    "menubarPage.key.open": "Opens the entry's dropdown.",

    "menubarPage.key.arrowsH": "Moves to the previous or next entry in the bar.",

    "menubarPage.a11yYours2": "If you show shortcuts, make them work with the menu closed too.",

    "menubarPage.a11yYours1": "It must have an <code>aria-label</code>: “Editor menu”.",

    "menubarPage.a11yDoes3": "With a dropdown open, <kbd>←</kbd> and <kbd>→</kbd> open the next one.",

    "menubarPage.a11yDoes2": "Each entry announces <code>aria-haspopup</code> and <code>aria-expanded</code>.",

    "menubarPage.a11yDoes1": "The bar has a single <kbd>Tab</kbd> stop.",

    "menubarPage.a11yIntro": "Menubar follows the APG menubar pattern.",

    "menubarPage.content3": "Show each command's shortcut at the end of its row: “Save ⌘S”.",

    "menubarPage.content2": "Follow the order people know: File first, Help last.",

    "menubarPage.content1": "Name each entry with one word: “File”, “Edit”, “View”.",

    "menubarPage.whenNot4": 'For the top edge of a desktop application\'s window, with its status: use <a href="/components/app-bar">AppBar</a>.',
    "menubarPage.whenNot3": 'For a few formatting buttons: use <a href="/components/toolbar">Toolbar</a>.',

    "menubarPage.whenNot2": 'For a site\'s navigation: use <a href="/components/megamenu">Megamenu</a> or <a href="/components/navbar">Navbar</a>.',

    "menubarPage.whenNot1": 'For a single group of commands: use <a href="/components/menu">Menu</a>.',

    "menubarPage.when2": "When there are three or more frequently used groups of commands.",

    "menubarPage.when1": "For the commands of a desktop application or an editor: File, Edit, View.",

    "menubarPage.contract3": "The bar has a single <kbd>Tab</kbd> stop: the arrows move within it.",

    "menubarPage.contract2": "Each dropdown is a real Menu, with its submenus and keyboard.",

    "menubarPage.contract1": 'The root is a <code>role="menubar"</code> with a required <code>aria-label</code>; each entry, a <code>menuitem</code>.',

    "menubarPage.editorBody": "Open an entry and move to the others with <kbd>←</kbd> and <kbd>→</kbd>: the dropdown follows focus.",

    "menubarPage.editorTitle": "Editor: File, Edit and View",
    "menubarPage.lede": "Menubar shows an application's commands in a persistent bar: File, Edit, View in an editor. Each entry opens a dropdown, and the arrows move along the bar without leaving it.",
    "menubarPage.anatomyBody":
      "This diagram names the bar, the wrapper, the open item, and the Menu popup that hangs from it. The specimen is frozen; the live bars start below.",
    "menubarPage.anatomyLabel": "Menubar anatomy",
    "menubarPage.anatomyPreviewLabel": "An open Menubar, part by part",
    "menubarPage.contractBody":
      'No <code>@zag-js/*</code> machine of its own: same as <code>Treegrid</code>/<code>DataGrid</code>, hand-rolled and shared by both bindings. v1 scope, of the BAR itself: ONE dropdown per top-level item, and even that is not hand-managed: moving to a neighboring item while a dropdown is open closes the old one and opens the new one through <code>Menu</code>\'s own <code>api.setOpen()</code>. A dropdown\'s own CONTENT has no such limit: it is a real <code>Menu</code>, so it nests submenus exactly as deep as <code>Menu</code> allows (see "Dropdowns with a submenu" below).',
    "menubarPage.label": "Menu bar",
    "menubarPage.submenuTitle": "Submenus: Export as…",
    "menubarPage.submenuBody": "Each dropdown is a Menu, so a command can open its own submenu.",
    "menubarPage.testCore1":
      "Moving while a dropdown was open keeps the NEXT item's dropdown open. The detail a plain roving tabindex misses.",
    "menubarPage.testReact1":
      "Moving right while a dropdown is open closes it and opens the adjacent item's dropdown.",
    "menubarPage.testReact2": "Escape closes the open dropdown and returns focus to its trigger.",
    "menubarPage.testVanilla1": "Clicking a neighboring item's trigger while one dropdown is open closes the first and opens the neighbor's.",

    "demo.menubar.label": "Menu bar",
    "demo.menubar.file": "File",
    "demo.menubar.new": "New",
    "demo.menubar.open": "Open",
    "demo.menubar.save": "Save",
    "demo.menubar.export": "Export",
    "demo.menubar.pdf": "PDF",
    "demo.menubar.csv": "CSV",
    "demo.menubar.print": "Print",
    "demo.menubar.edit": "Edit",
    "demo.menubar.undo": "Undo",
    "demo.menubar.redo": "Redo",
    "menubarPage.guidelinesLede": "A menu bar keeps all of an application's commands at hand, grouped by topic.",
    "demo.menubar.help": "Help",
    "demo.menubar.view": "View",
    "demo.menubar.longFile": "Project file",
    "demo.menubar.longEdit": "Edit the content",
    "demo.menubar.longView": "View and adjust the display",
    "demo.menubar.longHelp": "Help and technical support",
    "menubarPage.entry.title": "Entries: dropdown, submenu or command",
    "menubarPage.entry.intro": "Each entry of the bar opens a dropdown or runs a command directly; and a command inside a dropdown can open its own submenu.",
    "menubarPage.entry.label": "Entry type",
    "menubarPage.entry.dropdown": "Dropdown",
    "menubarPage.entry.submenu": "Submenu",
    "menubarPage.entry.command": "Command",
    "menubarPage.entry.dropdown.body": "An entry with <code>items</code> opens a dropdown, a real <code>Menu</code>. It is the shape of almost the whole bar.",
    "menubarPage.entry.submenu.body": "An item with <code>children</code> opens a submenu: <code>Export</code> holds PDF and CSV. With the keyboard, → opens it and ← closes it.",
    "menubarPage.entry.command.body": "An entry with no <code>items</code> is a direct command (<code>Help</code>): it has no arrow because it opens nothing.",
    "menubarPage.dd.labels.title": "Entries: one word",
    "menubarPage.dd.labels.do": "“File”, “Edit”, “View”: read at a glance and fit the row.",
    "menubarPage.dd.labels.dont": "Long phrases fill the row: the entries that follow get cut off and disappear.",
    "menubarPage.dd.commands.title": "Dropdowns: commands, not destinations",
    "menubarPage.dd.commands.do": "Each item does something to the document: new, open, save.",
    "menubarPage.dd.commands.dont": 'Going to other pages is not a command. For that use <a href="/components/megamenu">Megamenu</a> or <a href="/nav-list">NavList</a>.',
    "demo.menubar.cut": "Cut",
    "demo.menubar.copy": "Copy",
    "demo.menubar.paste": "Paste",
    "demo.menubar.delete": "Delete",
    "demo.menubar.ruler": "Show ruler",
    "demo.menubar.grid": "Show grid",
    "demo.menubar.docs": "Documentation",
    "demo.menubar.shortcuts": "Keyboard shortcuts",
    "demo.menubar.report": "Report a problem",
    "menubarPage.rows.title": "Inside the dropdown: every kind of row",
    "menubarPage.rows.intro": "Open <strong>View</strong>: a dropdown is a real Menu, and one menu holds all of these kinds of row, not only commands.",
    "menubarPage.rows.legend1": "<strong>Checkboxes</strong> (<code>kind=\"checkbox\"</code>): turn something on or off; the menu keeps the state.",
    "menubarPage.rows.legend2": "<strong>Radios</strong> (<code>kind=\"radio\"</code> with the same <code>group</code>): pick one option.",
    "menubarPage.rows.legend3": "<strong>Separators</strong> (<code>kind=\"separator\"</code>): group rows by topic.",
    "menubarPage.rows.legend4": "<strong>Disabled</strong> (<code>disabled</code>): visible but does nothing, like “Reset view” with nothing changed.",
    "menubarPage.rows.legend5": "<strong>Danger</strong> (<code>tone=\"danger\"</code>): an action that destroys, set apart from the rest.",
    "menubarPage.rows.legend6": "<strong>Link</strong> (<code>href</code>): a row that leaves the application for its documentation.",
    "demo.menubar.reset": "Reset view",
    "demo.menubar.clear": "Clear preferences",
    "demo.menubar.viewHelp": "View help",
    "menubarPage.editor.title": "A full editor: four entries",
    "menubarPage.editor.body": "All together, as an editor ships it: a submenu in File, a separator and a disabled row in Edit, checkboxes and zoom in View, and links in Help.",
    "menubarVs.appbarPage.title": "AppBar or Menubar",
    "menubarVs.appbarPage.rule": "<strong>Use AppBar for the top edge of a desktop application's window, with its status on the other side. Switch to <a href='/components/menubar'>Menubar</a> when the menu bar sits inside a page or a panel, among other controls; when its dropdowns need checkboxes, radios or separators; or when it has to work on touch screens.</strong> Both open menus from a bar and move with the arrows; what differs is what the bar is.",
    "menubarVs.title": "Menubar or AppBar",
    "menubarVs.rule": "<strong>If it is the top edge of a desktop application's window, with its status on the other side, use <a href='/components/app-bar'>AppBar</a>. If it is a menu bar inside a page or a panel, among other controls, use <a href='/components/menubar'>Menubar</a>.</strong> Both open menus from a bar and move with the arrows; what differs is what the bar is.",
    "menubarVs.intro": "The same commands in each: only the component changes.",
    "menubarVs.toggle": "Component",
    "menubarVs.menubar.body": "<code>Menubar</code>: each entry is a button with its arrow. It reads as one more control on the page.",
    "menubarVs.appbar.body": "<code>AppBar</code>: the entries are words with no box; the first, in bold, is the application's menu, and the status sits on the right.",
    "menubarVs.col.aspect": "Aspect",
    "menubarVs.row.where": "Where it lives",
    "menubarVs.row.where.menubar": "Inside a page or a panel, among other controls.",
    "menubarVs.row.where.appbar": "On the window's top edge: it is the application's frame, not its content.",
    "menubarVs.row.entries": "The entries",
    "menubarVs.row.entries.menubar": "<code>ghost</code> buttons with an arrow on each dropdown.",
    "menubarVs.row.entries.appbar": "Words with no box until they open; the first, in bold, is the application's menu.",
    "menubarVs.row.dropdown": "What a dropdown holds",
    "menubarVs.row.dropdown.menubar": "<code>Menu</code>'s whole item shape: checkboxes, radios, separators, danger, links.",
    "menubarVs.row.dropdown.appbar": "Actions only: no checkboxes, radios or separators. Choosing and adjusting belongs to the application, not its bar.",
    "menubarVs.row.status": "Status",
    "menubarVs.row.status.menubar": "It has none: menus only.",
    "menubarVs.row.status.appbar": "A region on the right for a few words of status (Saved, a width, the time), some with a menu of their own.",
    "menubarVs.row.device": "Where it works",
    "menubarVs.row.device.menubar": "On any screen, touch included: its buttons are button-sized.",
    "menubarVs.row.device.appbar": "Desktop with a pointer: 24px targets, and with one menu open, pointing at another opens it.",
    "menubarPage.dd.single.title": "Entries: several, or it is a Menu",
    "menubarPage.dd.single.do": "Several entries form the application's bar.",
    "menubarPage.dd.single.dont": 'A single entry is a button that opens a <a href="/components/menu">Menu</a>.',
  },
} as const;
