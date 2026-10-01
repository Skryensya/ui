export const colorPickerMessages = {
  es: {
    "demo.colorPicker.label": "Color de marca",
    "demo.colorPicker.compactLabel": "Acento",
    "demo.colorPicker.presetsLabel": "Color con presets",
    "demo.colorPicker.nativeLabel": "Color de fondo",

    "colorPicker.description": "Elige un color cualquiera, viéndolo y ajustándolo a mano.",

    "colorPicker.a11yKeyEsc": "Cierra el panel y devuelve el foco al botón.",

    "colorPicker.a11yKeyPage": "En un riel, mueve el valor en pasos grandes.",

    "colorPicker.a11yKeyArrows": "En el área o un riel, mueve el valor.",

    "colorPicker.a11yYours2": "Si el color elegido pinta texto, revisa su contraste de 4.5:1 (WCAG 2.2, 1.4.3).",

    "colorPicker.a11yYours1": "No dependas solo del color que se ve: muestra también su valor en texto.",

    "colorPicker.a11yDoes3": "Los canales son campos de texto: el valor exacto se escribe.",

    "colorPicker.a11yDoes2": 'El área y los rieles son <code>role="slider"</code>.',

    "colorPicker.a11yDoes1": "El botón tiene nombre propio con <code>triggerLabel</code>.",

    "colorPicker.a11yIntro": "Cada parte del panel se opera con teclado.",

    "colorPicker.content2": "Traduce <code>triggerLabel</code>: es el nombre del botón, «Elegir color».",

    "colorPicker.content1": "Nombra el campo por lo que colorea: «Color de marca», no «Color».",

    "colorPicker.dd.presets.dont": "Sin presets, la persona tiene que recordar el hex exacto de la marca.",

    "colorPicker.dd.presets.do": "Los presets ponen los colores de la marca a un clic, y el resto sigue disponible.",

    "colorPicker.dd.presets.title": "Colores de marca: con presets",

    "colorPicker.whenNot2": "Si hay que escribir un valor exacto en un espacio pequeño: usa la forma completa, no la compacta.",

    "colorPicker.whenNot1": 'Si el color es siempre uno de unos pocos conocidos: usa <a href="/es/componentes/select">Select</a> o <a href="/es/componentes/segmented">SegmentedControl</a>.',

    "colorPicker.when3": "Para un color común en un formulario, sin presets: usa la forma nativa.",

    "colorPicker.when2": "Cuando hay que ver y ajustar el matiz, la saturación y la transparencia.",

    "colorPicker.when1": "Para un color cualquiera, no uno de unas pocas opciones: el color de una marca, de una etiqueta, de un fondo.",

    "colorPicker.contract3": "OKLCH se lee y se escribe con una conversión propia (<code>@skryensya/core/color</code>) sobre el mismo color, nunca un estado aparte.",

    "colorPicker.contract2": "Un input oculto envía el color con el formulario.",

    "colorPicker.contract1": "React ofrece <code>ColorPicker</code>, <code>CompactColorPicker</code> y <code>NativeColorPicker</code>; Vanilla monta el <code>data-sk-color-picker</code> escrito a mano.",
    "colorPicker.lede": "ColorPicker elige un color cualquiera, no uno de unas pocas opciones fijas, y deja verlo y ajustarlo a mano. Tiene tres formas: la nativa del sistema operativo, sin JavaScript; la completa, con área, rieles de matiz y alfa y los canales en hex, RGB, HSL y OKLCH; y la compacta, para una barra de herramientas.",
    "colorPicker.anatomyBody": "El control (etiqueta, botón, muestra) y el panel (área, canales, presets, cuentagotas), abierto y congelado.",
    "colorPicker.anatomyLabel": "Anatomía de ColorPicker",
    "colorPicker.anatomyPreviewLabel": "ColorPicker, parte por parte",
    "colorPicker.nativeTitle": "Nativo: el picker del sistema",
    "colorPicker.nativeBody": 'Un <code>&lt;input type="color"&gt;</code>: sin JavaScript, sin presets, un solo hex.',
    "colorPicker.customTitle": "Completo: todos los canales",
    "colorPicker.customBody": "Área, rieles de matiz y alfa, los cuatro formatos de canal y el cuentagotas donde el navegador lo soporta.",
    "colorPicker.compactTitle": "Compacto: para una barra de herramientas",
    "colorPicker.compactBody": "Sin las filas de canal: área, riel de matiz y presets.",
    "colorPicker.presetsTitle": "Con presets: los colores de la marca a mano",
    "colorPicker.presetsBody": "<code>swatches</code> es una lista de colores separados por espacios.",
    "colorPicker.disabledTitle": "Deshabilitado",
    "colorPicker.test1": "Rechaza markup al que le falta una parte que necesita parchar.",
    "colorPicker.test2": "Parcha el control escrito a mano y renderiza el popover alrededor de un panel.",
    "colorPicker.test3": "Muestra el color de partida en la custom property del root.",
    "colorPicker.test4": "Confirma un hex escrito a mano y llena cada fila de canal desde él.",
    "colorPicker.test5": "Elige un swatch preset y actualiza el color actual.",
    "colorPicker.test6": "La anatomía compact quita las filas de canal por completo.",
    "colorPicker.test7": "Mantiene el nombre accesible del trigger sin que Zag lo pise.",
    "colorPicker.guidelinesLede": "Empieza por el picker más simple que alcance.",
  },
  en: {
    "demo.colorPicker.label": "Brand color",
    "demo.colorPicker.compactLabel": "Accent",
    "demo.colorPicker.presetsLabel": "Color with presets",
    "demo.colorPicker.nativeLabel": "Background color",

    "colorPicker.description": "Picks any color, seeing it and adjusting it by hand.",

    "colorPicker.a11yKeyEsc": "Closes the panel and returns focus to the button.",

    "colorPicker.a11yKeyPage": "On a rail, moves the value in large steps.",

    "colorPicker.a11yKeyArrows": "On the area or a rail, moves the value.",

    "colorPicker.a11yYours2": "If the chosen color paints text, check its 4.5:1 contrast (WCAG 2.2, 1.4.3).",

    "colorPicker.a11yYours1": "Do not rely on the visible color alone: show its value as text too.",

    "colorPicker.a11yDoes3": "The channels are text fields: the exact value can be typed.",

    "colorPicker.a11yDoes2": 'The area and the rails are <code>role="slider"</code>.',

    "colorPicker.a11yDoes1": "The button has its own name through <code>triggerLabel</code>.",

    "colorPicker.a11yIntro": "Every part of the panel works from the keyboard.",

    "colorPicker.content2": "Translate <code>triggerLabel</code>: it is the button's name, “Choose color”.",

    "colorPicker.content1": "Name the field by what it colors: “Brand color”, not “Color”.",

    "colorPicker.dd.presets.dont": "Without presets, people have to remember the brand's exact hex.",

    "colorPicker.dd.presets.do": "Presets put the brand's colors one click away, and the rest stays available.",

    "colorPicker.dd.presets.title": "Brand colors: with presets",

    "colorPicker.whenNot2": "If an exact value must be typed in a tight space: use the full form, not the compact one.",

    "colorPicker.whenNot1": 'If the color is always one of a few known ones: use <a href="/components/select">Select</a> or <a href="/components/segmented">SegmentedControl</a>.',

    "colorPicker.when3": "For an ordinary color in a form, with no presets: use the native form.",

    "colorPicker.when2": "When hue, saturation and transparency need to be seen and adjusted.",

    "colorPicker.when1": "For any color, not one of a few options: a brand's color, a tag's, a background's.",

    "colorPicker.contract3": "OKLCH is read and written through its own conversion (<code>@skryensya/core/color</code>) over the same color, never a separate state.",

    "colorPicker.contract2": "A hidden input submits the color with the form.",

    "colorPicker.contract1": "React offers <code>ColorPicker</code>, <code>CompactColorPicker</code> and <code>NativeColorPicker</code>; Vanilla mounts the hand-written <code>data-sk-color-picker</code>.",
    "colorPicker.lede": "ColorPicker picks any color, not one of a few fixed options, and lets people see and adjust it by hand. It comes in three forms: the operating system's native one, with no JavaScript; the full one, with an area, hue and alpha rails and the channels in hex, RGB, HSL and OKLCH; and the compact one, for a toolbar.",
    "colorPicker.anatomyBody": "The control (label, button, swatch) and the panel (area, channels, presets, eyedropper), open and frozen.",
    "colorPicker.anatomyLabel": "ColorPicker anatomy",
    "colorPicker.anatomyPreviewLabel": "ColorPicker, part by part",
    "colorPicker.nativeTitle": "Native: the system picker",
    "colorPicker.nativeBody": 'An <code>&lt;input type="color"&gt;</code>: no JavaScript, no presets, one hex.',
    "colorPicker.customTitle": "Full: every channel",
    "colorPicker.customBody": "Area, hue and alpha rails, the four channel formats and the eyedropper where the browser supports it.",
    "colorPicker.compactTitle": "Compact: for a toolbar",
    "colorPicker.compactBody": "Without the channel rows: area, hue rail and presets.",
    "colorPicker.presetsTitle": "With presets: the brand's colors at hand",
    "colorPicker.presetsBody": "<code>swatches</code> is a space-separated list of colors.",
    "colorPicker.disabledTitle": "Disabled",
    "colorPicker.test1": "Refuses markup that is missing a part it must patch.",
    "colorPicker.test2": "Patches the authored control and renders the popover around a panel.",
    "colorPicker.test3": "Shows the starting color on the root's own custom property.",
    "colorPicker.test4": "Commits a typed hex value and fills every channel row from it.",
    "colorPicker.test5": "Selects a preset swatch and updates the current color.",
    "colorPicker.test6": "The compact anatomy drops the channel-input rows entirely.",
    "colorPicker.test7": "Keeps the trigger's accessible name intact instead of letting Zag override it.",
    "colorPicker.guidelinesLede": "Start with the simplest picker that does the job.",
  },
} as const;
