export const treegridMessages = {
  es: {

    "treegridPage.description": "Muestra filas anidadas con columnas: una jerarquía donde cada fila tiene varios datos.",

    "treegridPage.key.homeEnd": "Va a la primera o a la última fila.",

    "treegridPage.key.left": "En una fila abierta, la cierra; si no, pasa a su padre.",

    "treegridPage.key.right": "En una fila cerrada, la abre; si no, pasa a la celda siguiente.",

    "treegridPage.key.updown": "Pasa a la fila anterior o siguiente.",

    "treegridPage.a11yYours1": "Nombra la cuadrícula con <code>label</code>.",

    "treegridPage.a11yDoes3": "La cuadrícula es una sola parada de <kbd>Tab</kbd>; las flechas recorren filas y celdas.",

    "treegridPage.a11yDoes2": "Las filas con hijos anuncian <code>aria-expanded</code>.",

    "treegridPage.a11yDoes1": "Cada fila anuncia su nivel y su posición (<code>aria-level</code>, <code>aria-posinset</code>).",

    "treegridPage.a11yIntro": "Treegrid sigue el patrón treegrid de la APG.",

    "treegridPage.content2": "La primera columna nombra la fila: es la que se sangra.",

    "treegridPage.content1": "Escribe encabezados cortos, con la unidad si hace falta: «Tamaño (MB)».",

    "treegridPage.whenNot2": 'Para filas sin jerarquía: usa <a href="/es/componentes/table">Table</a> o <a href="/es/componentes/data-grid">DataGrid</a>.',

    "treegridPage.whenNot1": 'Para una jerarquía con solo nombres: usa <a href="/es/componentes/tree-view">TreeView</a>.',

    "treegridPage.when2": "Cuando conviene abrir solo las ramas que interesan sin perder las columnas.",

    "treegridPage.when1": "Para una jerarquía donde cada fila tiene varios datos que se comparan.",

    "treegridPage.contract4": "<code>resizableColumns</code> agrega un separador entre encabezados, como en Table.",

    "treegridPage.contract3": "<code>expanded</code> solo va en una fila con hijos; su ausencia la marca como hoja.",

    "treegridPage.contract2": "Las filas se escriben planas, en orden: el nivel lo dice <code>aria-level</code>, no el anidamiento.",

    "treegridPage.contract1": 'Es un <code>&lt;table role="treegrid"&gt;</code> y exige <code>label</code>.',
    "treegridPage.lede": "Treegrid muestra filas anidadas con columnas: una bandeja con hilos de mensajes, un explorador de archivos con tamaño y fecha, un presupuesto por partidas. Cada fila se abre y se cierra sin perder sus otros datos.",
    "treegridPage.minimalTitle": "Bandeja: carpetas y mensajes",
    "treegridPage.anatomyBody":
      "Este diagrama nombra el scroll, la tabla, cabecera, cuerpo, filas, celdas y el disclosure. El espécimen está congelado; los Treegrid vivos empiezan abajo.",
    "treegridPage.anatomyLabel": "Anatomía de Treegrid",
    "treegridPage.anatomyPreviewLabel": "Treegrid, parte por parte",
    "treegridPage.minimalBody": "Dos columnas, Asunto y De; una carpeta abierta y otra cerrada.",
    "treegridPage.hooksBody":
      "La sangría por nivel y el ancho reservado para el glyph de apertura son hooks: <code>--sk-treegrid-indent</code> y <code>--sk-treegrid-indicator-size</code>.",
    "treegridPage.testVanilla1":
      "Al montar, esconde el único hijo de la rama que arranca colapsada.",
    "treegridPage.testVanilla2":
      "Flecha derecha sobre una rama colapsada la expande y revela su hijo, sin mover el foco de la fila.",
    "treegridPage.testVanilla3":
      "Clickear la primera celda de una rama la alterna y mueve el foco a la fila.",
    "treegridPage.testReact1":
      "Respeta el <code>expanded</code> inicial de cada fila, y esconde solo el descendiente de la rama colapsada.",
    "treegridPage.testReact2":
      "Flecha izquierda sobre una rama abierta la colapsa y esconde a sus hijos.",
    "treegridPage.testReact3": "Enter activa una fila hoja con foco.",

    "treegridPage.stressTitle": "Explorador: siete niveles y cuatro columnas",
    "treegridPage.stressBody": "Nombres largos que se cortan, niveles profundos y columnas ajustables.",

    "demo.treegrid.label": "Mensajes",
    "demo.treegrid.subject": "Asunto",
    "demo.treegrid.from": "De",
    "demo.treegrid.inbox": "Recibidos",
    "demo.treegrid.meeting": "Reunión de equipo",
    "demo.treegrid.lunch": "Almuerzo",
    "demo.treegrid.drafts": "Borradores",
    "demo.treegrid.untitled": "Sin título",
    "demo.treegrid.me": "Yo",
    "demo.treegrid.sent": "Enviados",

    "demo.treegridStress.label": "Explorador de archivos",
    "demo.treegridStress.resizeLabel": "Redimensionar columna",
    "demo.treegridStress.colName": "Nombre",
    "demo.treegridStress.colType": "Tipo",
    "demo.treegridStress.colSize": "Tamaño",
    "demo.treegridStress.colModified": "Modificado",
    "demo.treegridStress.typeFolder": "Carpeta",
    "demo.treegridStress.typeTs": "Archivo TypeScript",
    "demo.treegridStress.typeTest": "Archivo de test",
    "demo.treegridStress.typeStyle": "Hoja de estilos",
    "demo.treegridStress.typeConfig": "Configuración",
    "demo.treegridStress.typeMarkdown": "Documento Markdown",
    "demo.treegridStress.typeText": "Documento de texto",
    "demo.treegridStress.projectAlpha": "proyecto-alpha",
    "demo.treegridStress.src": "src",
    "demo.treegridStress.components": "components",
    "demo.treegridStress.buttonFolder": "Button",
    "demo.treegridStress.buttonTsx": "Button.tsx",
    "demo.treegridStress.internalTypesFolder": "tipos-internos-del-componente-con-props-extendidas",
    "demo.treegridStress.buttonPropsTs": "ButtonProps.ts",
    "demo.treegridStress.buttonTestTsx": "Button.test.tsx",
    "demo.treegridStress.buttonModuleCss": "Button.module.css",
    "demo.treegridStress.modalTsx": "Modal.tsx",
    "demo.treegridStress.utilsFolder": "utils",
    "demo.treegridStress.formatUtil": "format-currency-and-long-date-strings-for-every-supported-locale.ts",
    "demo.treegridStress.packageJson": "package.json",
    "demo.treegridStress.readme":
      "README-instrucciones-de-instalación-configuración-y-despliegue-para-todo-el-equipo.md",
    "demo.treegridStress.readmeModified": "Hace 3 semanas por Alice Fernández del equipo de Diseño",
    "demo.treegridStress.projectBeta": "proyecto-beta",
    "demo.treegridStress.indexTs": "index.ts",
    "demo.treegridStress.license": "licencia.txt",
    "demo.treegridStress.modified2d": "Hace 2 días",
    "demo.treegridStress.modified3d": "Hace 3 días",
    "demo.treegridStress.modified4d": "Hace 4 días",
    "demo.treegridStress.modified1h": "Hace 1 hora",
    "demo.treegridStress.modified5h": "Hace 5 horas",
    "demo.treegridStress.modified1day": "Hace 1 día",
    "demo.treegridStress.modified1week": "Hace 1 semana",
    "demo.treegridStress.modified1month": "Hace 1 mes",
    "demo.treegridStress.modified6months": "Hace 6 meses",
    "demo.treegrid.dd.name": "Nombre",
    "demo.treegrid.dd.docs": "Documentos",
    "demo.treegrid.dd.guide": "Guía",
    "demo.treegrid.dd.faq": "Preguntas frecuentes",
    "demo.treegrid.dd.assets": "Recursos",
    "treegridPage.guidelinesLede": "Jerarquía y columnas a la vez: úsalo solo cuando hacen falta las dos.",
    "treegridPage.dd.columns.title": "Columnas: solo si las hay",
    "treegridPage.dd.columns.do": "Úsalo cuando cada fila tiene varios datos que se comparan en columnas.",
    "treegridPage.dd.columns.dont": 'Una sola columna de nombres es un árbol: usa <a href="/es/componentes/tree-view">TreeView</a>.',
  },
  en: {

    "treegridPage.description": "Shows nested rows with columns: a hierarchy where each row has several data points.",

    "treegridPage.key.homeEnd": "Goes to the first or last row.",

    "treegridPage.key.left": "On an open row, closes it; otherwise moves to its parent.",

    "treegridPage.key.right": "On a closed row, opens it; otherwise moves to the next cell.",

    "treegridPage.key.updown": "Moves to the previous or next row.",

    "treegridPage.a11yYours1": "Name the grid with <code>label</code>.",

    "treegridPage.a11yDoes3": "The grid is a single <kbd>Tab</kbd> stop; the arrows move through rows and cells.",

    "treegridPage.a11yDoes2": "Rows with children announce <code>aria-expanded</code>.",

    "treegridPage.a11yDoes1": "Each row announces its level and position (<code>aria-level</code>, <code>aria-posinset</code>).",

    "treegridPage.a11yIntro": "Treegrid follows the APG treegrid pattern.",

    "treegridPage.content2": "The first column names the row: it is the one indented.",

    "treegridPage.content1": "Write short headers, with the unit if needed: “Size (MB)”.",

    "treegridPage.whenNot2": 'For rows without hierarchy: use <a href="/components/table">Table</a> or <a href="/components/data-grid">DataGrid</a>.',

    "treegridPage.whenNot1": 'For a hierarchy of names only: use <a href="/components/tree-view">TreeView</a>.',

    "treegridPage.when2": "When it helps to open only the branches of interest without losing the columns.",

    "treegridPage.when1": "For a hierarchy where each row has several data points to compare.",

    "treegridPage.contract4": "<code>resizableColumns</code> adds a separator between headers, as in Table.",

    "treegridPage.contract3": "<code>expanded</code> only goes on a row with children; its absence marks a leaf.",

    "treegridPage.contract2": "Rows are written flat, in order: <code>aria-level</code> gives the level, not nesting.",

    "treegridPage.contract1": 'It is a <code>&lt;table role="treegrid"&gt;</code> and requires a <code>label</code>.',
    "treegridPage.lede": "Treegrid shows nested rows with columns: an inbox with message threads, a file explorer with size and date, a budget by line item. Each row opens and closes without losing its other data.",
    "treegridPage.minimalTitle": "Inbox: folders and messages",
    "treegridPage.anatomyBody":
      "This diagram names the scroll, the table, head, body, rows, cells and the disclosure. The specimen is frozen; the live Treegrids begin below.",
    "treegridPage.anatomyLabel": "Treegrid anatomy",
    "treegridPage.anatomyPreviewLabel": "Treegrid, part by part",
    "treegridPage.minimalBody": "Two columns, Subject and From; one folder open and one closed.",
    "treegridPage.hooksBody":
      "Per-level indent and the width reserved for the disclosure glyph are hooks: <code>--sk-treegrid-indent</code> and <code>--sk-treegrid-indicator-size</code>.",
    "treegridPage.testVanilla1":
      "On mount, hides the one child of the branch that starts collapsed.",
    "treegridPage.testVanilla2":
      "Right Arrow on a collapsed branch expands it and reveals its child, without moving the row's focus.",
    "treegridPage.testVanilla3":
      "Clicking a branch's first cell toggles it and moves focus to the row.",
    "treegridPage.testReact1":
      "Honors each row's initial <code>expanded</code>, and hides only the collapsed branch's own descendant.",
    "treegridPage.testReact2":
      "Left Arrow on an open branch collapses it and hides its children.",
    "treegridPage.testReact3": "Enter activates a focused leaf row.",

    "treegridPage.stressTitle": "Explorer: seven levels and four columns",
    "treegridPage.stressBody": "Long names that truncate, deep levels and adjustable columns.",

    "demo.treegrid.label": "Messages",
    "demo.treegrid.subject": "Subject",
    "demo.treegrid.from": "From",
    "demo.treegrid.inbox": "Inbox",
    "demo.treegrid.meeting": "Team meeting",
    "demo.treegrid.lunch": "Lunch",
    "demo.treegrid.drafts": "Drafts",
    "demo.treegrid.untitled": "Untitled",
    "demo.treegrid.me": "Me",
    "demo.treegrid.sent": "Sent",

    "demo.treegridStress.label": "File explorer",
    "demo.treegridStress.resizeLabel": "Resize column",
    "demo.treegridStress.colName": "Name",
    "demo.treegridStress.colType": "Type",
    "demo.treegridStress.colSize": "Size",
    "demo.treegridStress.colModified": "Modified",
    "demo.treegridStress.typeFolder": "Folder",
    "demo.treegridStress.typeTs": "TypeScript file",
    "demo.treegridStress.typeTest": "Test file",
    "demo.treegridStress.typeStyle": "Stylesheet",
    "demo.treegridStress.typeConfig": "Config",
    "demo.treegridStress.typeMarkdown": "Markdown document",
    "demo.treegridStress.typeText": "Text document",
    "demo.treegridStress.projectAlpha": "project-alpha",
    "demo.treegridStress.src": "src",
    "demo.treegridStress.components": "components",
    "demo.treegridStress.buttonFolder": "Button",
    "demo.treegridStress.buttonTsx": "Button.tsx",
    "demo.treegridStress.internalTypesFolder": "internal-types-for-the-component-with-extended-props",
    "demo.treegridStress.buttonPropsTs": "ButtonProps.ts",
    "demo.treegridStress.buttonTestTsx": "Button.test.tsx",
    "demo.treegridStress.buttonModuleCss": "Button.module.css",
    "demo.treegridStress.modalTsx": "Modal.tsx",
    "demo.treegridStress.utilsFolder": "utils",
    "demo.treegridStress.formatUtil": "format-currency-and-long-date-strings-for-every-supported-locale.ts",
    "demo.treegridStress.packageJson": "package.json",
    "demo.treegridStress.readme":
      "README-install-configure-and-deploy-instructions-for-the-whole-team.md",
    "demo.treegridStress.readmeModified": "3 weeks ago by Alice Fernández from the Design team",
    "demo.treegridStress.projectBeta": "project-beta",
    "demo.treegridStress.indexTs": "index.ts",
    "demo.treegridStress.license": "license.txt",
    "demo.treegridStress.modified2d": "2 days ago",
    "demo.treegridStress.modified3d": "3 days ago",
    "demo.treegridStress.modified4d": "4 days ago",
    "demo.treegridStress.modified1h": "1 hour ago",
    "demo.treegridStress.modified5h": "5 hours ago",
    "demo.treegridStress.modified1day": "1 day ago",
    "demo.treegridStress.modified1week": "1 week ago",
    "demo.treegridStress.modified1month": "1 month ago",
    "demo.treegridStress.modified6months": "6 months ago",
    "demo.treegrid.dd.name": "Name",
    "demo.treegrid.dd.docs": "Documents",
    "demo.treegrid.dd.guide": "Guide",
    "demo.treegrid.dd.faq": "FAQ",
    "demo.treegrid.dd.assets": "Assets",
    "treegridPage.guidelinesLede": "Hierarchy and columns at once: use it only when both are needed.",
    "treegridPage.dd.columns.title": "Columns: only if there are some",
    "treegridPage.dd.columns.do": "Use it when each row has several values compared across columns.",
    "treegridPage.dd.columns.dont": 'A single column of names is a tree: use <a href="/components/tree-view">TreeView</a>.',
  },
} as const;
