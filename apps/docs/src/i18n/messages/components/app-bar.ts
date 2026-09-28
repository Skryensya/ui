export const appBarMessages = {
  es: {
    "appBarPage.description": "AppBar: la barra corta de texto en el borde superior de una aplicación, con sus menús y su estado.",
    "appBarPage.lede":
      'Una sola línea de texto, como la barra de un sistema de escritorio: los menús de la aplicación a la izquierda, el suyo propio primero y en negrita, y unas pocas palabras de estado a la derecha. Los títulos son palabras, no botones: no tienen caja hasta que se abren y no llevan chevron. No es <a href="/es/componentes/menubar">Menubar</a>, que es un widget entre otros controles de una página, ni <a href="/es/componentes/navbar">Navbar</a>, que es la cabecera de destinos de un sitio.',
    "appBarPage.anatomyBody":
      "El diagrama nombra la barra, el <code>menubar</code> con sus menús, el título abierto con el popup de Menu que cuelga de él, y la zona de estado. El espécimen está congelado; las barras vivas empiezan abajo.",
    "appBarPage.anatomyLabel": "Anatomía de AppBar",
    "appBarPage.anatomyPreviewLabel": "Una AppBar con un menú abierto, parte por parte",
    "appBarPage.label": "Barra de aplicación",
    "appBarPage.contractBody":
      'Cada desplegable es un <code>Menu</code> real: comandos, casillas, radios, separadores y submenús son de <code>Menu</code>, en los dos bindings. Lo que es de la barra: una sola parada de tabulación para los menús, <kbd class="sk-kbd">←</kbd>/<kbd class="sk-kbd">→</kbd> entre ellos llevando el desplegable abierto, y la costumbre de escritorio de que, con un menú abierto, basta apuntar a otro para cambiar. Apuntar sin nada abierto no abre nada.',
    "appBarPage.statusTitle": "Estado a la derecha",
    "appBarPage.statusBody":
      '<code>AppBarStatus</code> sin <code>items</code> es texto y nada más: no recibe foco ni se presiona, porque no hay nada que hacer con él. Con <code>items</code> se vuelve un botón de menú con esa etiqueta, como un ítem de estado de escritorio que abre su propio menú pequeño. Aquí el ancho es un grupo de radios.',
    "appBarPage.minimalTitle": "Solo menús",
    "appBarPage.minimalBody": "La zona de estado es opcional. Sin ella, la barra es el nombre de la aplicación y sus menús.",
    "appBarPage.a11yBody":
      'Los menús son un <code>role="menubar"</code> con <code>aria-label</code> (obligatorio, casi siempre el nombre de la aplicación). Cada título es <code>role="menuitem"</code>, con <code>aria-haspopup="menu"</code>/<code>aria-expanded</code> solo si abre algo; el foco es roving, una parada para todos. La zona de estado queda fuera del <code>menubar</code> a propósito: un <code>menubar</code> solo puede contener ítems de menú, y «Guardado» no lo es. Sus menús son botones de menú corrientes, cada uno con su parada. Dentro de un desplegable, <kbd class="sk-kbd">↑</kbd>/<kbd class="sk-kbd">↓</kbd>, <kbd class="sk-kbd">Escape</kbd> y <kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> son de <code>Menu</code>.',

    "demo.appBar.app": "Maker",
    "demo.appBar.about": "Acerca de Maker",
    "demo.appBar.settings": "Ajustes…",
    "demo.appBar.file": "Archivo",
    "demo.appBar.new": "Nuevo proyecto",
    "demo.appBar.open": "Abrir…",
    "demo.appBar.export": "Exportar",
    "demo.appBar.edit": "Editar",
    "demo.appBar.undo": "Deshacer",
    "demo.appBar.redo": "Rehacer",
    "demo.appBar.view": "Ver",
    "demo.appBar.zoomIn": "Acercar",
    "demo.appBar.zoomOut": "Alejar",
    "demo.appBar.help": "Ayuda",
    "demo.appBar.saved": "Guardado",
  },
  en: {
    "appBarPage.description": "AppBar: the short line of text on an application's top edge, with its menus and its state.",
    "appBarPage.lede":
      'One line of text, like a desktop OS menu bar: the application\'s menus on the left, its own first and in bold, and a few words of state on the right. The titles are words, not buttons: they have no box until they open and carry no chevron. Not <a href="/components/menubar">Menubar</a>, which is a widget among other controls on a page, and not <a href="/components/navbar">Navbar</a>, which is a site\'s header of destinations.',
    "appBarPage.anatomyBody":
      "The diagram names the bar, the <code>menubar</code> with its menus, the open title with the Menu popup hanging from it, and the status region. The specimen is frozen; the live bars start below.",
    "appBarPage.anatomyLabel": "AppBar anatomy",
    "appBarPage.anatomyPreviewLabel": "An AppBar with one menu open, part by part",
    "appBarPage.label": "Application bar",
    "appBarPage.contractBody":
      'Every dropdown is a real <code>Menu</code>: commands, checkboxes, radios, separators and submenus are <code>Menu</code>\'s, in both bindings. What belongs to the bar: one tab stop for the menus, <kbd class="sk-kbd">←</kbd>/<kbd class="sk-kbd">→</kbd> between them carrying an open dropdown along, and the desktop habit that once a menu is open, pointing at another switches to it. Pointing with nothing open opens nothing.',
    "appBarPage.statusTitle": "State on the right",
    "appBarPage.statusBody":
      '<code>AppBarStatus</code> without <code>items</code> is text and nothing else: it takes no focus and cannot be pressed, because there is nothing to do with it. With <code>items</code> it becomes a menu button with that label, like a desktop status item opening its own small menu. Here the width is a radio group.',
    "appBarPage.minimalTitle": "Menus only",
    "appBarPage.minimalBody": "The status region is optional. Without it, the bar is the application's name and its menus.",
    "appBarPage.a11yBody":
      'The menus are a <code>role="menubar"</code> with an <code>aria-label</code> (required, nearly always the application\'s name). Each title is <code>role="menuitem"</code>, with <code>aria-haspopup="menu"</code>/<code>aria-expanded</code> only when it opens something; focus is roving, one stop for all of them. The status region stays outside the <code>menubar</code> on purpose: a <code>menubar</code> may only hold menu items, and "Saved" is not one. Its menus are ordinary menu buttons, each its own stop. Inside a dropdown, <kbd class="sk-kbd">↑</kbd>/<kbd class="sk-kbd">↓</kbd>, <kbd class="sk-kbd">Escape</kbd> and <kbd class="sk-kbd">Home</kbd>/<kbd class="sk-kbd">End</kbd> are <code>Menu</code>\'s.',

    "demo.appBar.app": "Maker",
    "demo.appBar.about": "About Maker",
    "demo.appBar.settings": "Settings…",
    "demo.appBar.file": "File",
    "demo.appBar.new": "New project",
    "demo.appBar.open": "Open…",
    "demo.appBar.export": "Export",
    "demo.appBar.edit": "Edit",
    "demo.appBar.undo": "Undo",
    "demo.appBar.redo": "Redo",
    "demo.appBar.view": "View",
    "demo.appBar.zoomIn": "Zoom in",
    "demo.appBar.zoomOut": "Zoom out",
    "demo.appBar.help": "Help",
    "demo.appBar.saved": "Saved",
  },
} as const;
