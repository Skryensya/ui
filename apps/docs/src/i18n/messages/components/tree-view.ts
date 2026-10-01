export const treeViewMessages = {
  es: {
    "demo.treeView.label": "Proyecto",
    "demo.tree.initialLabel": "Proyecto",
    "demo.tree.multipleLabel": "Archivos del proyecto",
    "demo.tree.disabledLabel": "Proyecto con rama deshabilitada",
    "demo.tree.filesLabel": "Archivos del proyecto",
    "demo.tree.source": "src",
    "demo.tree.components": "componentes",
    "demo.tree.buttonFile": "botón.tsx",
    "demo.tree.indexFile": "índice.ts",
    "demo.tree.disabledFolder": "legado",
    "demo.tree.selection": "Selección",
    "demo.tree.expansion": "Expansión",

    "treeViewPage.description": "Muestra una jerarquía que se abre y se cierra, como carpetas y archivos.",

    "treeViewPage.key.select": "Elige el nodo.",

    "treeViewPage.key.homeEnd": "Va al primer o al último nodo visible.",

    "treeViewPage.key.left": "Cierra la rama o sube a su padre.",

    "treeViewPage.key.right": "Abre la rama o entra en su primer hijo.",

    "treeViewPage.key.updown": "Pasa al nodo visible anterior o siguiente.",

    "treeViewPage.a11yYours2": "No escondas nodos con <code>disabled</code>: se siguen leyendo.",

    "treeViewPage.a11yYours1": "Nombra el árbol con <code>aria-label</code>: «Archivos del proyecto».",

    "treeViewPage.a11yDoes3": "El árbol es una sola parada de <kbd>Tab</kbd>.",

    "treeViewPage.a11yDoes2": "Las ramas anuncian <code>aria-expanded</code>.",

    "treeViewPage.a11yDoes1": 'Publica <code>role="tree"</code> y <code>treeitem</code> con el nivel y la posición de cada nodo.',

    "treeViewPage.a11yIntro": "TreeView sigue el patrón tree view de la APG.",

    "treeViewPage.content2": "Ordena los nodos de forma predecible: carpetas primero, luego alfabético.",

    "treeViewPage.content1": "Escribe nombres cortos: se cortan con puntos suspensivos si no caben.",

    "treeViewPage.whenNot3": 'Para la navegación de un sitio: usa <a href="/es/nav-list">NavList</a>.',

    "treeViewPage.whenNot2": 'Para una jerarquía con columnas de datos: usa <a href="/es/componentes/treegrid">Treegrid</a>.',

    "treeViewPage.whenNot1": 'Sin nada anidado: usa <a href="/es/componentes/list">List</a> o <a href="/es/componentes/listbox">Listbox</a>.',

    "treeViewPage.when2": "Cuando conviene abrir solo las ramas que interesan.",

    "treeViewPage.when1": "Para elementos anidados: carpetas, categorías, un organigrama.",

    "treeViewPage.contract4": "La sangría y la guía vertical son hooks: el árbol viene angosto a propósito.",

    "treeViewPage.contract3": "Eventos: <code>sk:treeviewselectionchange</code> y <code>sk:treeviewexpandedchange</code>; en React, <code>onSelectionChange</code> y <code>onExpandedChange</code>.",

    "treeViewPage.contract2": "Cada nodo es una rama (con control y contenido) o una hoja.",

    "treeViewPage.contract1": "<code>data-value</code> identifica cada nodo y es único en el árbol.",
    "treeViewPage.lede": "TreeView muestra una jerarquía que se abre y se cierra: las carpetas y archivos de un proyecto, las categorías de un catálogo, el organigrama de un equipo. Las ramas se expanden, los nodos se eligen, todo con el teclado.",
    "treeViewPage.anatomyBody":
      "Este diagrama nombra la raíz, las ramas y las hojas. El espécimen está congelado; los árboles vivos empiezan abajo.",
    "treeViewPage.anatomyLabel": "Anatomía de TreeView",
    "treeViewPage.anatomyPreviewLabel": "TreeView, parte por parte",
    "treeViewPage.minimalTitle": "Mínimo: carpetas y archivos",
    "treeViewPage.minimalBody": "Ramas que se abren y hojas que se eligen.",
    "treeViewPage.initialTitle": "Estado inicial: abierto y elegido",
    "treeViewPage.initialBody": "<code>expandedValue</code> y <code>selectedValue</code> dicen qué empieza abierto y qué elegido.",
    "treeViewPage.multipleTitle": "Varios: con Ctrl y Mayús",
    "treeViewPage.multipleBody": "<kbd>Ctrl</kbd> o <kbd>⌘</kbd> suman un nodo; <kbd>Shift</kbd> extiende el rango.",
    "treeViewPage.disabledTitle": "Deshabilitados: se leen, no se eligen",
    "treeViewPage.disabledBody": "Un nodo deshabilitado no recibe foco; una rama deshabilitada tampoco se abre.",
    "treeViewPage.eventsTitle": "Íconos y eventos: carpetas y archivos",
    "treeViewPage.eventsBody": "<code>branchIcon</code> y <code>leafIcon</code> ponen un ícono por tipo de nodo; los cambios se escuchan con eventos.",
    "treeViewPage.hooksBody":
      "La sangría, el inset de la fila y la guía vertical son hooks: el árbol viene angosto a propósito, porque la sangría se paga una vez por nivel. Ensancha el paso, dale aire a las filas o apaga la guía sin tocar el resto.",
    "treeViewPage.test1": "Parcha la semántica de árbol sobre el markup escrito a mano y monta una sola vez.",
    "treeViewPage.test2": "Expande una rama desde su control y lo comunica.",
    "treeViewPage.test3": "Selecciona una hoja y reporta el valor que escribió la composición.",

    "treeViewPage.testReact1": "Renderiza la semántica de árbol a partir de la prop nodes.",
    "treeViewPage.testReact2":
      'Expande una rama desde su control y llama a <code class="sk-code">onExpandedChange</code>.',
    "treeViewPage.testReact3":
      'Las ramas abiertas se pueden sembrar con <code class="sk-code">defaultExpandedValue</code>.',
    "treeViewPage.testReact4":
      'Selecciona una hoja y llama a <code class="sk-code">onSelectionChange</code>.',
    "treeViewPage.testReact5": "Reemplaza la selección en modo single.",
    "treeViewPage.testReact6": "Extiende la selección en modo multiple con el modificador de la plataforma.",
    "treeViewPage.testReact7": "Un nodo deshabilitado queda fuera de la selección.",
    "treeViewPage.prop.selectionMode.title": "Selection mode: uno o varios",
    "treeViewPage.prop.selectionMode.body": "Cuántos nodos se eligen a la vez.",
    "treeViewPage.prop.selectionMode.single": "Usa <code>single</code>, el valor por defecto, para abrir un elemento, como un archivo en un editor.",
    "treeViewPage.prop.selectionMode.multiple": "Usa <code>multiple</code> para actuar sobre varios a la vez, como mover o borrar.",
    "treeViewPage.guidelinesLede": "Un árbol muestra dónde está cada cosa dentro de otra; si nada se anida, es una lista.",
    "treeViewPage.dd.nested.title": "Anidado: solo con jerarquía",
    "treeViewPage.dd.nested.do": "Úsalo cuando los elementos se anidan unos dentro de otros.",
    "treeViewPage.dd.nested.dont": 'Sin nada anidado, es una lista: usa <a href="/es/componentes/list">List</a> o <a href="/es/componentes/listbox">Listbox</a>.',
  },
  en: {
    "demo.treeView.label": "Project",
    "demo.tree.initialLabel": "Project",
    "demo.tree.multipleLabel": "Project files",
    "demo.tree.disabledLabel": "Project with a disabled branch",
    "demo.tree.filesLabel": "Project files",
    "demo.tree.source": "src",
    "demo.tree.components": "components",
    "demo.tree.buttonFile": "button.tsx",
    "demo.tree.indexFile": "index.ts",
    "demo.tree.disabledFolder": "legacy",
    "demo.tree.selection": "Selection",
    "demo.tree.expansion": "Expansion",

    "treeViewPage.description": "Shows a hierarchy that opens and closes, like folders and files.",

    "treeViewPage.key.select": "Chooses the node.",

    "treeViewPage.key.homeEnd": "Goes to the first or last visible node.",

    "treeViewPage.key.left": "Closes the branch or moves up to its parent.",

    "treeViewPage.key.right": "Opens the branch or enters its first child.",

    "treeViewPage.key.updown": "Moves to the previous or next visible node.",

    "treeViewPage.a11yYours2": "Do not hide nodes with <code>disabled</code>: they are still read.",

    "treeViewPage.a11yYours1": "Name the tree with <code>aria-label</code>: “Project files”.",

    "treeViewPage.a11yDoes3": "The tree is a single <kbd>Tab</kbd> stop.",

    "treeViewPage.a11yDoes2": "Branches announce <code>aria-expanded</code>.",

    "treeViewPage.a11yDoes1": 'It publishes <code>role="tree"</code> and <code>treeitem</code> with each node\'s level and position.',

    "treeViewPage.a11yIntro": "TreeView follows the APG tree view pattern.",

    "treeViewPage.content2": "Order nodes predictably: folders first, then alphabetically.",

    "treeViewPage.content1": "Write short names: they truncate with an ellipsis if they do not fit.",

    "treeViewPage.whenNot3": 'For a site\'s navigation: use <a href="/nav-list">NavList</a>.',

    "treeViewPage.whenNot2": 'For a hierarchy with data columns: use <a href="/components/treegrid">Treegrid</a>.',

    "treeViewPage.whenNot1": 'With nothing nested: use <a href="/components/list">List</a> or <a href="/components/listbox">Listbox</a>.',

    "treeViewPage.when2": "When it helps to open only the branches of interest.",

    "treeViewPage.when1": "For nested items: folders, categories, an org chart.",

    "treeViewPage.contract4": "Indentation and the vertical guide are hooks: the tree comes narrow on purpose.",

    "treeViewPage.contract3": "Events: <code>sk:treeviewselectionchange</code> and <code>sk:treeviewexpandedchange</code>; in React, <code>onSelectionChange</code> and <code>onExpandedChange</code>.",

    "treeViewPage.contract2": "Each node is a branch (with control and content) or a leaf.",

    "treeViewPage.contract1": "<code>data-value</code> identifies each node and is unique in the tree.",
    "treeViewPage.lede": "TreeView shows a hierarchy that opens and closes: a project's folders and files, a catalog's categories, a team's org chart. Branches expand, nodes are chosen, all by keyboard.",
    "treeViewPage.anatomyBody":
      "This diagram names the root, branches, and leaves. The specimen is frozen; the live trees start below.",
    "treeViewPage.anatomyLabel": "TreeView anatomy",
    "treeViewPage.anatomyPreviewLabel": "TreeView, part by part",
    "treeViewPage.minimalTitle": "Minimal: folders and files",
    "treeViewPage.minimalBody": "Branches that open and leaves that are chosen.",
    "treeViewPage.initialTitle": "Initial state: open and chosen",
    "treeViewPage.initialBody": "<code>expandedValue</code> and <code>selectedValue</code> say what starts open and what chosen.",
    "treeViewPage.multipleTitle": "Several: with Ctrl and Shift",
    "treeViewPage.multipleBody": "<kbd>Ctrl</kbd> or <kbd>⌘</kbd> add a node; <kbd>Shift</kbd> extends the range.",
    "treeViewPage.disabledTitle": "Disabled: read, not chosen",
    "treeViewPage.disabledBody": "A disabled node takes no focus; a disabled branch does not open either.",
    "treeViewPage.eventsTitle": "Icons and events: folders and files",
    "treeViewPage.eventsBody": "<code>branchIcon</code> and <code>leafIcon</code> set an icon per node kind; changes are listened to with events.",
    "treeViewPage.hooksBody":
      "Indent, row inset, and the vertical guide are hooks: the tree ships narrow on purpose, because the indent gets paid once per level. Widen the step, give the rows more air, or turn off the guide without touching the rest.",
    "treeViewPage.test1": "Patches tree semantics onto authored markup and mounts once.",
    "treeViewPage.test2": "Expands a branch from its control and says so.",
    "treeViewPage.test3": "Selects a leaf and reports the value the composition wrote.",

    "treeViewPage.testReact1": "Renders tree semantics from the nodes prop.",
    "treeViewPage.testReact2":
      'Expands a branch from its control and calls <code class="sk-code">onExpandedChange</code>.',
    "treeViewPage.testReact3":
      'Open branches can be seeded with <code class="sk-code">defaultExpandedValue</code>.',
    "treeViewPage.testReact4":
      'Selects a leaf and calls <code class="sk-code">onSelectionChange</code>.',
    "treeViewPage.testReact5": "Replaces the selection in single mode.",
    "treeViewPage.testReact6": "Extends the selection in multiple mode with the platform's own modifier.",
    "treeViewPage.testReact7": "A disabled node is left out of the selection.",
    "treeViewPage.prop.selectionMode.title": "Selection mode: one or several",
    "treeViewPage.prop.selectionMode.body": "How many nodes are chosen at once.",
    "treeViewPage.prop.selectionMode.single": "Use <code>single</code>, the default, to open one item, like a file in an editor.",
    "treeViewPage.prop.selectionMode.multiple": "Use <code>multiple</code> to act on several at once, like moving or deleting.",
    "treeViewPage.guidelinesLede": "A tree shows where each thing sits inside another; if nothing nests, it is a list.",
    "treeViewPage.dd.nested.title": "Nested: only with hierarchy",
    "treeViewPage.dd.nested.do": "Use it when items nest inside each other.",
    "treeViewPage.dd.nested.dont": 'With nothing nested, it is a list: use <a href="/components/list">List</a> or <a href="/components/listbox">Listbox</a>.',
  },
} as const;
