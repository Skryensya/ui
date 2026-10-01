export const dataGridMessages = {
  es: {

    "dataGridPage.description": "Una cuadrícula que se recorre celda por celda con las flechas, con una sola parada de tabulación.",

    "dataGridPage.a11yKeyTab": "Entra y sale de la cuadrícula.",

    "dataGridPage.a11yKeyCtrlHomeEnd": "Va al inicio o al fin de la cuadrícula.",

    "dataGridPage.a11yKeyHomeEnd": "Va al inicio o al fin de la fila.",

    "dataGridPage.a11yKeyArrows": "Mueve el foco entre celdas.",

    "dataGridPage.a11yYours2": "Explica cerca de la cuadrícula que se recorre con las flechas si no es evidente.",

    "dataGridPage.a11yYours1": "Debe tener <code>aria-label</code>.",

    "dataGridPage.a11yDoes3": "Mantiene el rol de lo que hay en la celda: un botón sigue siendo un botón.",

    "dataGridPage.a11yDoes2": "Una sola celda, o su control, es la parada de tabulación de toda la cuadrícula.",

    "dataGridPage.a11yDoes1": 'La raíz es <code>role="grid"</code>, cada fila <code>role="row"</code> y cada celda <code>role="gridcell"</code>.',

    "dataGridPage.a11yIntro": "DataGrid sigue el patrón de grid de la APG, con foco itinerante.",

    "dataGridPage.content2": "Da a cada botón de celda su propio nombre: «Editar», «Eliminar».",

    "dataGridPage.content1": "Nombra la cuadrícula con <code>aria-label</code>: «Puntajes por ronda».",

    "dataGridPage.dd.static.dont": "Si los datos solo se leen, las flechas no agregan nada: en una Table cada celda se lee con su encabezado.",

    "dataGridPage.dd.static.do": "Los controles de la cuadrícula comparten una parada: Tab salta la cuadrícula entera.",

    "dataGridPage.dd.static.title": "Datos de lectura: una Table",

    "dataGridPage.whenNot3": 'Para una cuadrícula visual sin navegación con teclado: usa <a href="/es/componentes/grid">Grid</a>.',

    "dataGridPage.whenNot2": 'Si las filas tienen jerarquía: usa <a href="/es/componentes/treegrid">Treegrid</a>.',

    "dataGridPage.whenNot1": 'Para datos que solo se leen: usa <a href="/es/componentes/table">Table</a>.',

    "dataGridPage.when2": "Para una cuadrícula de controles (chips, tarjetas, enlaces) que debe ocupar una sola parada de tabulación.",

    "dataGridPage.when1": "Para datos que se editan o se operan celda por celda.",

    "dataGridPage.contract2": "<code>wrapCols</code> y <code>wrapRows</code> deciden si las flechas pasan al otro borde; los dos son <code>false</code> por defecto.",

    "dataGridPage.contract1": "El modelo de teclado está escrito a mano y lo comparten los dos bindings; no usa una máquina de Zag.",
    "dataGridPage.lede": 'DataGrid es una cuadrícula que se recorre celda por celda con las flechas: datos que se editan, o una cuadrícula de controles que ocupa una sola parada de tabulación en vez de una por control. Para datos que solo se leen, <a href="/es/componentes/table">Table</a> es más simple.',
    "dataGridPage.dataTitle": "Datos: la celda recibe el foco",
    "dataGridPage.anatomyBody": "La cuadrícula, la fila y la celda.",
    "dataGridPage.anatomyLabel": "Anatomía de DataGrid",
    "dataGridPage.anatomyPreviewLabel": "DataGrid, parte por parte",
    "dataGridPage.dataBody": "Celdas de texto que se recorren con las flechas, como una planilla que se revisa o se edita.",
    "dataGridPage.layoutTitle": "Controles: una parada en vez de muchas",
    "dataGridPage.layoutBody": "Cada celda tiene su botón y el foco va al botón, no a la celda. Toda la cuadrícula ocupa una sola parada de tabulación.",
    "dataGridPage.testReact1":
      "Le cede la parada de foco al descendiente interactivo PROPIO de la celda, no al div de la celda.",
    "dataGridPage.testReact2":
      "En movimiento vertical, se ajusta a la última celda real de una fila más corta (cuadrícula irregular).",
    "dataGridPage.testVanilla1":
      "Envuelve columnas a la fila siguiente cuando se autora data-wrap-cols.",
    "dataGridPage.testVanilla2": "Clickear una celda mueve la parada de foco ahí.",

    "demo.dataGrid.scoresLabel": "Puntajes por ronda",
    "demo.dataGrid.player": "Jugador",
    "demo.dataGrid.round1": "Ronda 1",
    "demo.dataGrid.round2": "Ronda 2",
    "demo.dataGrid.actionsLabel": "Acciones rápidas",
    "demo.dataGrid.edit": "Editar",
    "demo.dataGrid.copy": "Copiar",
    "demo.dataGrid.delete": "Eliminar",
    "demo.dataGrid.more": "Más opciones",
    "dataGridPage.guidelinesLede": "DataGrid ahorra paradas de tabulación cuando hay muchas celdas que operar.",
  },
  en: {

    "dataGridPage.description": "A grid moved through cell by cell with the arrow keys, with a single tab stop.",

    "dataGridPage.a11yKeyTab": "Enters and leaves the grid.",

    "dataGridPage.a11yKeyCtrlHomeEnd": "Goes to the start or end of the grid.",

    "dataGridPage.a11yKeyHomeEnd": "Goes to the start or end of the row.",

    "dataGridPage.a11yKeyArrows": "Moves focus between cells.",

    "dataGridPage.a11yYours2": "If it is not obvious, say near the grid that it is moved through with the arrow keys.",

    "dataGridPage.a11yYours1": "It must have an <code>aria-label</code>.",

    "dataGridPage.a11yDoes3": "It keeps the role of what is in the cell: a button stays a button.",

    "dataGridPage.a11yDoes2": "A single cell, or its control, is the whole grid's tab stop.",

    "dataGridPage.a11yDoes1": 'The root is <code>role="grid"</code>, each row <code>role="row"</code> and each cell <code>role="gridcell"</code>.',

    "dataGridPage.a11yIntro": "DataGrid follows the APG grid pattern, with roving focus.",

    "dataGridPage.content2": "Give each cell button its own name: “Edit”, “Delete”.",

    "dataGridPage.content1": "Name the grid with <code>aria-label</code>: “Scores per round”.",

    "dataGridPage.dd.static.dont": "If the data is only read, the arrows add nothing: in a Table each cell is read with its header.",

    "dataGridPage.dd.static.do": "The grid's controls share one stop: Tab skips the whole grid.",

    "dataGridPage.dd.static.title": "Read-only data: a Table",

    "dataGridPage.whenNot3": 'For a visual grid with no keyboard navigation: use <a href="/components/grid">Grid</a>.',

    "dataGridPage.whenNot2": 'If rows have a hierarchy: use <a href="/components/treegrid">Treegrid</a>.',

    "dataGridPage.whenNot1": 'For read-only data: use <a href="/components/table">Table</a>.',

    "dataGridPage.when2": "For a grid of controls (chips, cards, links) that should take a single tab stop.",

    "dataGridPage.when1": "For data that is edited or operated cell by cell.",

    "dataGridPage.contract2": "<code>wrapCols</code> and <code>wrapRows</code> decide whether the arrows wrap to the other edge; both are <code>false</code> by default.",

    "dataGridPage.contract1": "The keyboard model is hand-written and shared by both bindings; it uses no Zag machine.",
    "dataGridPage.lede": 'DataGrid is a grid moved through cell by cell with the arrow keys: data that is edited, or a grid of controls taking a single tab stop instead of one per control. For read-only data, <a href="/components/table">Table</a> is simpler.',
    "dataGridPage.dataTitle": "Data: the cell takes focus",
    "dataGridPage.anatomyBody": "The grid, the row and the cell.",
    "dataGridPage.anatomyLabel": "DataGrid anatomy",
    "dataGridPage.anatomyPreviewLabel": "DataGrid, part by part",
    "dataGridPage.dataBody": "Text cells moved through with the arrow keys, like a sheet that is reviewed or edited.",
    "dataGridPage.layoutTitle": "Controls: one stop instead of many",
    "dataGridPage.layoutBody": "Each cell has its button and focus goes to the button, not the cell. The whole grid takes a single tab stop.",
    "dataGridPage.testReact1":
      "Hands the roving stop to a cell's OWN interactive descendant, not the cell div.",
    "dataGridPage.testReact2":
      "Clamps into a shorter row's last real cell on vertical movement (ragged grid).",
    "dataGridPage.testVanilla1": "Wraps columns into the next row when data-wrap-cols is set.",
    "dataGridPage.testVanilla2": "Clicking a cell moves the roving stop there.",

    "demo.dataGrid.scoresLabel": "Scores by round",
    "demo.dataGrid.player": "Player",
    "demo.dataGrid.round1": "Round 1",
    "demo.dataGrid.round2": "Round 2",
    "demo.dataGrid.actionsLabel": "Quick actions",
    "demo.dataGrid.edit": "Edit",
    "demo.dataGrid.copy": "Copy",
    "demo.dataGrid.delete": "Delete",
    "demo.dataGrid.more": "More options",
    "dataGridPage.guidelinesLede": "DataGrid saves tab stops when there are many cells to operate.",
  },
} as const;
