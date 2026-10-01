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
    "menubarPage.navSkinTitle": "Como navegación: enlaces en la barra",
    "menubarPage.navSkinBody": "Con la opción <code>nav</code>, una entrada se dibuja como un enlace de NavList. Úsalo solo si la barra también lleva comandos; para un sitio, usa Megamenu.",
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
    "demo.menubar.destinations": "Destinos",
    "menubarPage.guidelinesLede": "Una barra de menú pone a mano todos los comandos de una aplicación, agrupados por tema.",
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
    "menubarPage.navSkinTitle": "As navigation: links in the bar",
    "menubarPage.navSkinBody": "With the <code>nav</code> option, an entry is drawn as a NavList link. Use it only if the bar also carries commands; for a site, use Megamenu.",
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
    "demo.menubar.destinations": "Destinations",
    "menubarPage.guidelinesLede": "A menu bar keeps all of an application's commands at hand, grouped by topic.",
    "menubarPage.dd.single.title": "Entries: several, or it is a Menu",
    "menubarPage.dd.single.do": "Several entries form the application's bar.",
    "menubarPage.dd.single.dont": 'A single entry is a button that opens a <a href="/components/menu">Menu</a>.',
  },
} as const;
