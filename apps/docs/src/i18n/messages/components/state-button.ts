export const stateButtonMessages = {
  es: {
    "stateButtonPage.anatomyLabel": "Anatomía de StateButton",
    "stateButtonPage.anatomyPreviewLabel": "StateButton, parte por parte",
    "stateButtonPage.anatomyDiagramBody": "El botón es la raíz y cada estado es una cara, un hijo con <code>data-face</code>. Solo la que lleva <code>data-active</code> se ve; las caras son datos, no partes, por eso no tienen clase.",
    "demo.state-button.viewMode.title": "Modo de vista",
    "demo.state-button.viewMode.grid": "Modo de vista: cuadrícula",
    "demo.state-button.viewMode.list": "Modo de vista: lista",
    "demo.state-button.viewMode.compact": "Modo de vista: compacto",
    "demo.state-button.themeToggle.title": "Modo de tema",
    "demo.state-button.copy.title": "Copiar al portapapeles",

    "stateButtonPage.description": "Un botón de ícono que muestra uno de varios estados con nombre y cambia al presionarlo.",

    "stateButtonPage.key.run": "Pasa al siguiente estado.",

    "stateButtonPage.a11yYours2": "Si el cambio no se ve en otro lado (como «copiado»), anúncialo con una región viva.",

    "stateButtonPage.a11yYours1": "Dale a cada estado su etiqueta.",

    "stateButtonPage.a11yDoes2": "Solo la cara activa se ve; las demás no se anuncian.",

    "stateButtonPage.a11yDoes1": "El nombre accesible es el del estado activo.",

    "stateButtonPage.a11yIntro": "StateButton es un <code>&lt;button&gt;</code> nativo cuyo nombre cambia con el estado.",

    "stateButtonPage.content2": "Elige íconos que se distingan entre sí sin leer la etiqueta.",

    "stateButtonPage.content1": "Nombra cada estado con lo que pasa al presionar, o con lo que está activo, pero siempre igual: «Vista en lista».",

    "stateButtonPage.whenNot4": 'Para copiar texto con su valor a la vista: usa <a href="/es/componentes/clipboard">Clipboard</a>.',

    "stateButtonPage.whenNot3": 'Si necesita texto visible: usa <a href="/es/componentes/button">Button</a>.',

    "stateButtonPage.whenNot2": 'Si conviene ver todas las opciones a la vez: usa <a href="/es/componentes/segmented">Segmented</a>.',

    "stateButtonPage.whenNot1": 'Para encender o apagar algo: usa <a href="/es/componentes/switch">Switch</a>.',

    "stateButtonPage.when2": 'En una barra de herramientas, con <code>variant="ghost"</code> y <code>size="sm"</code>.',

    "stateButtonPage.when1": "Para un control de ícono con varios estados, cada uno con su ícono: tema, vista, copiado.",

    "stateButtonPage.contract4": "<code>variant</code> y <code>size</code> son los de Button.",

    "stateButtonPage.contract3": "No cambia de estado solo: escribes tú la función que cambia <code>activeState</code>.",

    "stateButtonPage.contract2": "<code>states</code> es una lista de estados, cada uno con <code>name</code>, ícono y etiqueta.",

    "stateButtonPage.contract1": "Siempre es un botón de solo ícono: el nombre accesible cambia con el estado.",

    "stateButtonPage.copyBody": "Después del clic muestra el check y vuelve solo. <code>@skryensya/core/copy-button</code> ya trae este comportamiento.",

    "stateButtonPage.copyTitle": "Copiar: listo y copiado",

    "stateButtonPage.themeBody": "El ícono muestra el modo actual. <code>@skryensya/core/theme-toggle</code> ya trae este comportamiento.",

    "stateButtonPage.themeTitle": "Tema: claro, oscuro o del sistema",

    "stateButtonPage.viewBody": "Tres estados en ciclo: cada clic pasa al siguiente.",

    "stateButtonPage.viewTitle": "Vista: cuadrícula, lista o compacta",
    "stateButtonPage.lede": "StateButton es un botón de ícono que muestra uno de varios estados con nombre y cambia al presionarlo: el modo de tema, la vista de una lista, «copiado». Cada estado tiene su ícono y su nombre accesible; cuándo cambia lo decides tú.",
    "stateButtonPage.guidelinesLede": "Un botón que muestra su estado ahorra espacio, a cambio de esconder los otros estados.",
  },
  en: {
    "stateButtonPage.anatomyLabel": "StateButton anatomy",
    "stateButtonPage.anatomyPreviewLabel": "StateButton, part by part",
    "stateButtonPage.anatomyDiagramBody": "The button is the root and each state is a face, a child with <code>data-face</code>. Only the one carrying <code>data-active</code> is visible; faces are data, not parts, which is why they have no class.",
    "demo.state-button.viewMode.title": "View mode",
    "demo.state-button.viewMode.grid": "View mode: grid",
    "demo.state-button.viewMode.list": "View mode: list",
    "demo.state-button.viewMode.compact": "View mode: compact",
    "demo.state-button.themeToggle.title": "Theme mode",
    "demo.state-button.copy.title": "Copy to clipboard",

    "stateButtonPage.description": "An icon button that shows one of several named states and changes when pressed.",

    "stateButtonPage.key.run": "Moves to the next state.",

    "stateButtonPage.a11yYours2": "If the change is not seen elsewhere (like “copied”), announce it with a live region.",

    "stateButtonPage.a11yYours1": "Give each state its label.",

    "stateButtonPage.a11yDoes2": "Only the active face shows; the others are not announced.",

    "stateButtonPage.a11yDoes1": "The accessible name is the active state's.",

    "stateButtonPage.a11yIntro": "StateButton is a native <code>&lt;button&gt;</code> whose name changes with the state.",

    "stateButtonPage.content2": "Choose icons that tell apart without reading the label.",

    "stateButtonPage.content1": "Name each state by what pressing does, or by what is active, but always the same way: “List view”.",

    "stateButtonPage.whenNot4": 'To copy text with its value in view: use <a href="/components/clipboard">Clipboard</a>.',

    "stateButtonPage.whenNot3": 'If it needs visible text: use <a href="/components/button">Button</a>.',

    "stateButtonPage.whenNot2": 'If seeing all options at once helps: use <a href="/components/segmented">Segmented</a>.',

    "stateButtonPage.whenNot1": 'To turn something on or off: use <a href="/components/switch">Switch</a>.',

    "stateButtonPage.when2": 'In a toolbar, with <code>variant="ghost"</code> and <code>size="sm"</code>.',

    "stateButtonPage.when1": "For an icon control with several states, each with its icon: theme, view, copied.",

    "stateButtonPage.contract4": "<code>variant</code> and <code>size</code> are Button's.",

    "stateButtonPage.contract3": "It does not change state by itself: you write the function that changes <code>activeState</code>.",

    "stateButtonPage.contract2": "<code>states</code> is a list of states, each with a <code>name</code>, icon and label.",

    "stateButtonPage.contract1": "It is always an icon-only button: the accessible name changes with the state.",

    "stateButtonPage.copyBody": "After the click it shows the check and returns by itself. <code>@skryensya/core/copy-button</code> already brings this behavior.",

    "stateButtonPage.copyTitle": "Copy: ready and copied",

    "stateButtonPage.themeBody": "The icon shows the current mode. <code>@skryensya/core/theme-toggle</code> already brings this behavior.",

    "stateButtonPage.themeTitle": "Theme: light, dark or system",

    "stateButtonPage.viewBody": "Three states in a cycle: each click moves to the next.",

    "stateButtonPage.viewTitle": "View: grid, list or compact",
    "stateButtonPage.lede": "StateButton is an icon button that shows one of several named states and changes when pressed: the theme mode, a list's view, “copied”. Each state has its icon and accessible name; when it changes is up to you.",
    "stateButtonPage.guidelinesLede": "A button that shows its state saves space, at the cost of hiding the other states.",
  },
};
