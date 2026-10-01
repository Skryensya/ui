export const folderMessages = {
  es: {
    "demo.folder.radioTitle": "Radio",
    "demo.folder.radioBody":
      "Una radio personal: estaciones curadas a mano y la misma canción sonando para todos a la misma hora, sin botón de siguiente ni servidor coordinando nada. Solo el reloj de cada quien, que resulta ser el mismo reloj.",
    "demo.folder.printerTitle": "Printer",
    "demo.folder.printerBody":
      "Un sitio donde cualquiera puede mandar un mensaje corto que sale impreso al instante en la impresora térmica de mi escritorio. Nació de una pregunta que no me dejaba en paz: ¿y si cualquier cosa en internet pudiera imprimir en ella?",
    "demo.folder.wadaTitle": "Wada.ink",
    "demo.folder.wadaBody":
      "Un catálogo interactivo de las combinaciones de color de Sanzo Wada, pensado para navegar y descubrir, no solo para mirar láminas. Ya existían otras versiones, pero ninguna dejaba comparar dos paletas de un vistazo.",
    "demo.folder.albumMorningTitle": "Mañana",
    "demo.folder.albumMorningBody": "Fotos de ventanas, mesas y primeras caminatas; una serie suave para abrir el día.",
    "demo.folder.albumNightTitle": "Noche",
    "demo.folder.albumNightBody": "Luces, letreros y reflejos: imágenes oscuras que se reconocen por el color.",
    "demo.folder.albumFieldTitle": "Campo",
    "demo.folder.albumFieldBody": "Texturas de plantas, tierra y señales encontradas en una salida corta.",
    "demo.folder.filesBrandTitle": "Marca",
    "demo.folder.filesBrandBody": "Logos, paleta, tipografías y reglas para publicar piezas consistentes.",
    "demo.folder.filesResearchTitle": "Investigación",
    "demo.folder.filesResearchBody": "Notas, entrevistas y capturas que explican de dónde salió una decisión.",
    "demo.folder.filesArchiveTitle": "Archivo",
    "demo.folder.filesArchiveBody": "Material anterior que se conserva por contexto, no para usarlo como fuente principal.",
    "demo.folder.filesShortBody1": "Logos y reglas.",
    "demo.folder.filesShortBody2": "Notas y entrevistas.",
    "demo.folder.filesShortBody3": "Material anterior.",
    "demo.folder.genericTitle1": "Carpeta 1",
    "demo.folder.genericTitle2": "Carpeta 2",
    "demo.folder.genericTitle3": "Carpeta 3",
    "demo.folder.genericBody": "Contenido guardado para revisar después.",
    "demo.folder.singleBody": "Un destino único no necesita pila ni solape para entenderse.",
    "demo.folder.mixedProjectBody": "Un proyecto interactivo con vistas previas y una historia propia.",

    "folderPage.description": "Presenta una colección de cosas del mismo tipo como carpetas que se asoman al tocarlas.",

    "folderPage.a11yYours2": "Con varios destinos adentro, no uses <code>Folder.link</code>: pon los enlaces en el cuerpo.",

    "folderPage.a11yYours1": "Pon un encabezado en la pestaña, con el nivel que le toca en la página.",

    "folderPage.a11yDoes4": "Con <code>prefers-reduced-motion</code>, se revela sin movimiento.",

    "folderPage.a11yDoes3": "En punteros gruesos se muestra revelada: invisible para siempre sería peor.",

    "folderPage.a11yDoes2": "Se revela con <code>:focus-within</code>, no solo con hover.",

    "folderPage.a11yDoes1": "El <code>&lt;svg&gt;</code> es <code>aria-hidden</code>, sin rol ni nombre.",

    "folderPage.a11yIntro": "La silueta es decorativa; lo que nombra la carpeta es su pestaña.",

    "folderPage.content2": "Usa como vistas previas lo que hay adentro, para que se reconozca sin abrirla.",

    "folderPage.content1": "Pon en la pestaña el nombre de la cosa: «Radio comunitaria», no «Proyecto 1».",

    "folderPage.dd.collection.dont": 'Una carpeta sola no tiene con qué apilarse: una <a href="/es/componentes/card">Card</a> enlazada es más directa.',

    "folderPage.dd.collection.do": "Tres proyectos apilados: el solape dice que hay un orden y que hay más.",

    "folderPage.dd.collection.title": "Colección: varias del mismo tipo",

    "folderPage.dd.names.dont": "«Carpeta 2» obliga a leer el cuerpo para saber qué hay dentro.",

    "folderPage.dd.names.do": "La pestaña nombra el contenido sin abrir la carpeta.",

    "folderPage.dd.names.title": "Nombre: específico en la pestaña",

    "folderPage.dd.kind.dont": "Proyectos, archivos y álbumes en una misma pila no comparten una lógica de navegación.",

    "folderPage.dd.kind.do": "Tres álbumes juntos forman una colección; el solape ayuda a leerlos como serie.",

    "folderPage.dd.kind.title": "Tipo: una pila, una clase de cosa",

    "folderPage.whenNot4": 'Si cada carpeta debe verse entera: usa un <a href="/es/componentes/grid">Grid</a> de Folders, sin pila.',

    "folderPage.whenNot3": 'Si el contenido se abre y se cierra: usa <a href="/es/componentes/accordion">Accordion</a>.',

    "folderPage.whenNot2": 'Si toda la superficie es un control: usa <a href="/es/componentes/tile">Tile</a>.',

    "folderPage.whenNot1": 'Para una superficie sin pestaña propia: usa <a href="/es/componentes/box">Box</a>.',

    "folderPage.when2": "Cuando conviene que en reposo se lea como texto limpio y la forma aparezca al tocar.",

    "folderPage.when1": "Para una colección de cosas del mismo tipo que se leen como objetos separados: proyectos, álbumes.",

    "folderPage.contract4": "La silueta es un solo <code>&lt;path&gt;</code> que el binding calcula midiendo la caja y la pestaña.",

    "folderPage.contract3": "<code>Folder.link</code> es un <code>&lt;a&gt;</code> real, lo que da teclado al revelado.",

    "folderPage.contract2": "Todas las carpetas son del mismo color, como en un cajón: una pila de colores distintos se lee como tarjetas sueltas.",

    "folderPage.contract1": "<code>label</code> es un slot: la pestaña suele llevar un encabezado.",

    "folderPage.prop.active.true": "Usa <code>true</code> para marcar la carpeta actual, sobre todo en pantallas táctiles, que no tienen hover.",

    "folderPage.prop.active.false": "Usa <code>false</code>, el valor por defecto: la carpeta aparece al pasar el puntero o con el foco.",

    "folderPage.prop.active.body": "Deja la carpeta dibujada, como si el puntero estuviera encima.",

    "folderPage.prop.active.title": "Active: revelada sin tocarla",
    "folderPage.lede": "Folder presenta una colección de cosas del mismo tipo (proyectos, álbumes, grupos de archivos) como carpetas apiladas. En reposo se lee como texto limpio; al pasar el puntero o llevar el foco, la carpeta se dibuja con su pestaña y abre en abanico lo que tiene adentro.",
    "folderPage.anatomyBody": "La raíz, la silueta, la pestaña, el contenido y las vistas previas.",
    "folderPage.anatomyLabel": "Anatomía de Folder",
    "folderPage.anatomyPreviewLabel": "Folder, parte por parte",
    "folderPage.appearanceTitle": "Appearance: el mismo eje que Button",
    "folderPage.appearanceBody": "Sigue el menú de apariencia de esta página. Va sobre un degradado para que <code>frosted</code> tenga algo que difuminar.",
    "folderPage.albumsTitle": "Álbumes: vistas previas como memoria visual",
    "folderPage.albumsBody": "Cuando la colección es visual, el abanico ayuda a reconocer la carpeta antes de abrirla.",
    "folderPage.filesTitle": "Archivos: una pila más compacta",
    "folderPage.filesBody": "Con descripciones cortas, el solape puede ser menor y la pila sigue leyendo como una colección.",
    "folderPage.previewsTitle": "Sin vistas previas: solo la forma",
    "folderPage.previewsBody": "El slot <code>previews</code> es opcional: sin él, la carpeta se revela igual.",
    "folderPage.touchTitle": "En táctil: la actual, revelada",
    "folderPage.touchBody": "Un teléfono no tiene hover: <code>active</code> deja revelada la carpeta en la que está la persona.",
    "folderPage.groundTitle": "Sobre cualquier fondo: se esconde contra él",
    "folderPage.groundBody": "En reposo, la carpeta toma el color de lo que tiene detrás, sobre una superficie hundida o elevada.",
    "folderPage.stackTitle": "Una pila: el uso principal",
    "folderPage.stackBody": "La primera carpeta queda abierta para enseñar la forma, el solape y las vistas previas en una sola imagen.",
    "folderPage.testCore1": "Gira la esquina de entrada con el mismo radio en los dos ejes, como todas las demás.",
    "folderPage.testCore2": "Lleva el filo de la pestaña hasta donde termina la pestaña y ahí dobla por el hombro.",
    "folderPage.testCore3": "Mantiene las proporciones de la curva en S cuando la pestaña es más alta.",
    "folderPage.testCore4": "Nunca dibuja fuera de la caja de la que se midió.",
    "folderPage.testCore5": "Recorta una pestaña demasiado ancha en vez de plegar el path sobre sí mismo.",
    "folderPage.testCore6": "Recorta el barrido de entrada a una pestaña que no lo puede contener, en vez de ensanchar la pestaña.",
    "folderPage.testCore7": "Espeja la silueta completa para una carpeta en RTL.",
    "folderPage.testCore8": "No dibuja nada para una caja sin área.",
    "folderPage.testCore9": "Lee cada perilla de la forma desde una custom property.",
    "folderPage.testCore10": "Cae al default por propiedad, así un hook redeclarado no se lleva el resto de la silueta.",
    "folderPage.testReact1": "Renderiza la pestaña, el contenido y una silueta decorativa detrás.",
    "folderPage.testReact2": "Dibuja la silueta a partir de la caja de la carpeta y del ancho de su pestaña.",
    "folderPage.testReact3": "Marca la raíz como lista solo cuando escribió un path real.",
    "folderPage.testReact4": "No escribe atributo de reveal: una carpeta nunca se ve en reposo.",
    "folderPage.testReact5": "Escribe el <code>reveal</code> por defecto del contrato cuando no se pide.",
    "folderPage.testReact6": "Espeja la silueta dentro de un subárbol RTL.",
    "folderPage.testReact7": "<code>Folder.link</code> es un ancla real con la anatomía de la carpeta.",
    "folderPage.testReact8": "La pila contiene carpetas directamente, sin elemento envoltorio entre medio.",
    "folderPage.testReact9": "Pasa <code>overlap</code> como la custom property que lee la hoja.",
    "folderPage.testVanilla1": "Dibuja la silueta a partir de la caja de la carpeta y del ancho de su pestaña.",
    "folderPage.testVanilla2": "Marca la raíz como lista solo cuando escribió un path real.",
    "folderPage.testVanilla3": "No dibuja nada, y no queda lista, si la caja no se puede medir.",
    "folderPage.testVanilla4": "Vuelve a medir cuando cambia cualquiera de las dos cajas, y observa las dos.",
    "folderPage.testVanilla5": "Rechaza una raíz a la que le faltan los nodos donde tiene que dibujar.",
    "folderPage.testVanilla6": "Monta una vez por raíz y deja en paz una carpeta ya enhanceada.",
    "folderPage.testCore11": "Mide hasta el borde lejano de la pestaña, no solo su ancho.",
    "folderPage.testCore12": "En RTL mide desde el borde inline-start, que es el derecho.",
    "folderPage.testCore13": "Toma el primer ancestro que efectivamente pinta algo.",
    "folderPage.testCore14": "Omite todas las formas de escribir un fondo totalmente transparente.",
    "folderPage.testCore15": "Responde <code>null</code> cuando nada en el árbol pinta.",
    "folderPage.testCore16": "Responde <code>null</code> para una carpeta sin padre.",
    "folderPage.testCore17": "Pone el pliegue a la altura medida de la pestaña, sin importar el default.",
    "folderPage.testCore18": "Levanta el canto superior del cuerpo sin mover la esquina de la pestaña.",
    "folderPage.testCore19": "Nunca levanta ese canto por encima del techo de la pestaña.",
    "folderPage.testCore20": "Copia las capas de imagen sobre el color, en el orden en que CSS las pinta.",
    "folderPage.testCore21": "Toma una imagen aunque no haya color debajo.",
    "folderPage.testCore22": "Esconde la parte vacía debajo de la última línea, y nada por encima.",
    "folderPage.testCore23": "Una carpeta cuyo texto la llena no esconde nada, en vez de un valor negativo.",
    "folderPage.testCore24": "Paga la inclinación, que una medición en espacio de layout no ve.",
    "folderPage.testReact10": "Publica la silueta como clip para que el state layer la siga.",
    "folderPage.testReact11": "Abre las previews en una capa <code>aria-hidden</code>, y no renderiza ninguna sin el slot.",
    "folderPage.testVanilla7": "Publica la silueta como clip para que el state layer la siga.",
    "folderPage.guidelinesLede": "Una carpeta dice de qué trata algo antes de que se lea.",
  },
  en: {
    "demo.folder.radioTitle": "Radio",
    "demo.folder.radioBody":
      "A personal radio: hand-picked stations, and the same song playing for everyone at the same time, with no skip button and no server keeping anyone in sync. Only each listener's own clock, which turns out to be the same clock.",
    "demo.folder.printerTitle": "Printer",
    "demo.folder.printerBody":
      "A site where anyone can send a short message that prints instantly on the thermal printer on my desk. It grew out of a question that would not leave me alone: what if anything on the internet could print on it?",
    "demo.folder.wadaTitle": "Wada.ink",
    "demo.folder.wadaBody":
      "An interactive catalogue of Sanzo Wada's colour combinations, built to browse and discover rather than only to look at. Other versions existed, but none let you hold two palettes side by side.",
    "demo.folder.albumMorningTitle": "Morning",
    "demo.folder.albumMorningBody": "Photos of windows, tables and first walks; a soft series to open the day.",
    "demo.folder.albumNightTitle": "Night",
    "demo.folder.albumNightBody": "Lights, signs and reflections: dark images recognized by colour.",
    "demo.folder.albumFieldTitle": "Field",
    "demo.folder.albumFieldBody": "Textures of plants, soil and found signs from a short trip.",
    "demo.folder.filesBrandTitle": "Brand",
    "demo.folder.filesBrandBody": "Logos, palette, type and rules for publishing consistent pieces.",
    "demo.folder.filesResearchTitle": "Research",
    "demo.folder.filesResearchBody": "Notes, interviews and screenshots that explain where a decision came from.",
    "demo.folder.filesArchiveTitle": "Archive",
    "demo.folder.filesArchiveBody": "Older material kept for context, not as the primary source.",
    "demo.folder.filesShortBody1": "Logos and rules.",
    "demo.folder.filesShortBody2": "Notes and interviews.",
    "demo.folder.filesShortBody3": "Older material.",
    "demo.folder.genericTitle1": "Folder 1",
    "demo.folder.genericTitle2": "Folder 2",
    "demo.folder.genericTitle3": "Folder 3",
    "demo.folder.genericBody": "Saved content to review later.",
    "demo.folder.singleBody": "A single destination does not need a stack or overlap to be understood.",
    "demo.folder.mixedProjectBody": "An interactive project with previews and its own story.",

    "folderPage.description": "Presents a collection of same-kind things as folders that peek out when reached.",

    "folderPage.a11yYours2": "With several destinations inside, do not use <code>Folder.link</code>: put the links in the body.",

    "folderPage.a11yYours1": "Put a heading on the tab, at the level it has on the page.",

    "folderPage.a11yDoes4": "With <code>prefers-reduced-motion</code>, it reveals without motion.",

    "folderPage.a11yDoes3": "On coarse pointers it shows revealed: invisible forever would be worse.",

    "folderPage.a11yDoes2": "It reveals on <code>:focus-within</code>, not only on hover.",

    "folderPage.a11yDoes1": "The <code>&lt;svg&gt;</code> is <code>aria-hidden</code>, with no role or name.",

    "folderPage.a11yIntro": "The silhouette is decorative; the folder is named by its tab.",

    "folderPage.content2": "Use what is inside as previews, so it is recognized without opening it.",

    "folderPage.content1": "Put the thing's name on the tab: “Community radio”, not “Project 1”.",

    "folderPage.dd.collection.dont": 'A single folder has nothing to stack with: a linked <a href="/components/card">Card</a> is more direct.',

    "folderPage.dd.collection.do": "Three stacked projects: the overlap says there is an order and more to see.",

    "folderPage.dd.collection.title": "Collection: several of one kind",

    "folderPage.dd.names.dont": "“Folder 2” forces people to read the body to know what is inside.",

    "folderPage.dd.names.do": "The tab names the content without opening the folder.",

    "folderPage.dd.names.title": "Name: specific on the tab",

    "folderPage.dd.kind.dont": "Projects, files and albums in one stack do not share a navigation logic.",

    "folderPage.dd.kind.do": "Three albums together form a collection; the overlap helps them read as a series.",

    "folderPage.dd.kind.title": "Kind: one stack, one class of thing",

    "folderPage.whenNot4": 'If each folder must be seen whole: use a <a href="/components/grid">Grid</a> of Folders, with no stack.',

    "folderPage.whenNot3": 'If the content opens and closes: use <a href="/components/accordion">Accordion</a>.',

    "folderPage.whenNot2": 'If the whole surface is a control: use <a href="/components/tile">Tile</a>.',

    "folderPage.whenNot1": 'For a surface with no tab of its own: use <a href="/components/box">Box</a>.',

    "folderPage.when2": "When it should read as clean text at rest and the shape should appear when reached.",

    "folderPage.when1": "For a collection of same-kind things read as separate objects: projects, albums.",

    "folderPage.contract4": "The silhouette is a single <code>&lt;path&gt;</code> the binding computes by measuring the box and the tab.",

    "folderPage.contract3": "<code>Folder.link</code> is a real <code>&lt;a&gt;</code>, which gives the reveal a keyboard.",

    "folderPage.contract2": "All folders are the same color, as in a drawer: a stack of different colors reads as loose cards.",

    "folderPage.contract1": "<code>label</code> is a slot: the tab usually carries a heading.",

    "folderPage.prop.active.true": "Use <code>true</code> to mark the current folder, especially on touch screens, which have no hover.",

    "folderPage.prop.active.false": "Use <code>false</code>, the default: the folder appears on hover or focus.",

    "folderPage.prop.active.body": "Keeps the folder drawn, as if the pointer were over it.",

    "folderPage.prop.active.title": "Active: revealed without reaching it",
    "folderPage.lede": "Folder presents a collection of same-kind things (projects, albums, groups of files) as stacked folders. At rest it reads as clean text; on hover or focus, the folder draws itself with its tab and fans out what is inside.",
    "folderPage.anatomyBody": "The root, the silhouette, the tab, the content and the previews.",
    "folderPage.anatomyLabel": "Folder anatomy",
    "folderPage.anatomyPreviewLabel": "Folder, part by part",
    "folderPage.appearanceTitle": "Appearance: the same axis as Button",
    "folderPage.appearanceBody": "It follows this page's appearance menu. It sits on a gradient so <code>frosted</code> has something to blur.",
    "folderPage.albumsTitle": "Albums: previews as visual memory",
    "folderPage.albumsBody": "When the collection is visual, the fan helps people recognize a folder before opening it.",
    "folderPage.filesTitle": "Files: a tighter stack",
    "folderPage.filesBody": "With short descriptions, the overlap can be smaller and the stack still reads as a collection.",
    "folderPage.previewsTitle": "No previews: just the shape",
    "folderPage.previewsBody": "The <code>previews</code> slot is optional: without it, the folder still reveals.",
    "folderPage.touchTitle": "On touch: the current one, revealed",
    "folderPage.touchBody": "A phone has no hover: <code>active</code> keeps the folder people are on revealed.",
    "folderPage.groundTitle": "On any ground: it hides against it",
    "folderPage.groundBody": "At rest, the folder takes the color of what is behind it, on a sunken or raised surface.",
    "folderPage.stackTitle": "A stack: the main use",
    "folderPage.stackBody": "The first folder is held open to show the shape, the overlap and the previews in one image.",
    "folderPage.testCore1": "Turns the leading corner on the same radius both ways, like every other corner.",
    "folderPage.testCore2": "Runs the tab's top edge to where the tab ends, then folds down over the shoulder.",
    "folderPage.testCore3": "Keeps the S-curve's proportions when the tab is taller.",
    "folderPage.testCore4": "Never draws outside the box it was measured from.",
    "folderPage.testCore5": "Clamps a tab too wide for its shoulder instead of folding the path back on itself.",
    "folderPage.testCore6": "Clamps the leading sweep to a tab too narrow to hold it, instead of widening the tab.",
    "folderPage.testCore7": "Mirrors the whole silhouette for an RTL folder.",
    "folderPage.testCore8": "Draws nothing at all for a box with no area.",
    "folderPage.testCore9": "Reads every knob off custom properties.",
    "folderPage.testCore10": "Falls back per property, so one redeclared hook keeps the rest of the silhouette.",
    "folderPage.testReact1": "Renders the tab, the content and a decorative silhouette behind them.",
    "folderPage.testReact2": "Draws the silhouette from the folder's own box and its tab's width.",
    "folderPage.testReact3": "Marks the root ready only once a real path has been written.",
    "folderPage.testReact4": "Writes no reveal attribute, because a folder is never visible at rest.",
    "folderPage.testReact5": "Writes the contract's default reveal when none is given.",
    "folderPage.testReact6": "Mirrors the silhouette inside an RTL subtree.",
    "folderPage.testReact7": "<code>Folder.link</code> is a real anchor carrying the folder's own anatomy.",
    "folderPage.testReact8": "The stack holds folders directly, with no wrapper element between them.",
    "folderPage.testReact9": "Passes <code>overlap</code> through as the custom property the stylesheet reads.",
    "folderPage.testVanilla1": "Draws the silhouette from the folder's own box and its tab's width.",
    "folderPage.testVanilla2": "Marks the root ready only once a real path has been written.",
    "folderPage.testVanilla3": "Draws nothing, and stays unready, when the box cannot be measured.",
    "folderPage.testVanilla4": "Re-measures when either box changes, and observes both.",
    "folderPage.testVanilla5": "Refuses a root missing the nodes it has to draw into.",
    "folderPage.testVanilla6": "Mounts once per root and leaves an already-enhanced folder alone.",
    "folderPage.testCore11": "Measures to the tab's far edge, not merely its width.",
    "folderPage.testCore12": "In RTL it measures from the inline-start edge, which is the right-hand one.",
    "folderPage.testCore13": "Takes the first ancestor that actually paints something.",
    "folderPage.testCore14": "Skips every spelling of a fully transparent background.",
    "folderPage.testCore15": "Answers <code>null</code> when nothing up the tree paints at all.",
    "folderPage.testCore16": "Answers <code>null</code> for a folder with no parent.",
    "folderPage.testCore17": "Puts the fold at the measured tab height, whatever the default says.",
    "folderPage.testCore18": "Lifts the body's top edge without moving the tab's own corner.",
    "folderPage.testCore19": "Never lifts that edge above the tab's own top.",
    "folderPage.testCore20": "Copies the image layers over the colour, in the order CSS paints them.",
    "folderPage.testCore21": "Takes an image with no colour under it.",
    "folderPage.testCore22": "Hides the empty card below the last line, and nothing above it.",
    "folderPage.testCore23": "A folder whose copy fills it gets no tail, rather than a negative one.",
    "folderPage.testCore24": "Pays for the forward lean, which a layout-space measurement cannot see.",
    "folderPage.testReact10": "Publishes the silhouette as a clip for the state layer to follow.",
    "folderPage.testReact11": "Fans previews into an <code>aria-hidden</code> layer, and renders none without the slot.",
    "folderPage.testVanilla7": "Publishes the silhouette as a clip for the state layer to follow.",
    "folderPage.guidelinesLede": "A folder says what something is about before it is read.",
  },
} as const;
