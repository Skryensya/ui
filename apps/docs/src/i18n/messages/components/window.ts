export const windowMessages = {
  es: {
    "windowPage.enabled": "Activado",
    "windowPage.disabled": "Desactivado",
    "windowPage.resizeTitle": "Cambiar de tamaño",
    "windowPage.resizeBody": "Selecciona resizable y abre el inspector. Al desactivarlo desaparecen los bordes de redimensión y los controles de minimizar y maximizar.",
    "windowPage.dragTitle": "Arrastrar la ventana",
    "windowPage.dragBody": "Compara draggable activado y desactivado. Abre el inspector y prueba su barra de título.",
    "windowPage.dragOn": "La barra de título permite mover la ventana dentro del ejemplo.",
    "windowPage.dragOff": "La ventana permanece en su posición, pero conserva la redimensión y los demás controles.",
    "windowPage.appearanceTitle": "Apariencia del marco",
    "windowPage.appearanceBody": "Cambia la apariencia y abre el inspector para comparar el marco. El comportamiento y la semántica siguen siendo los mismos.",
    "windowPage.anatomyLabel": "Anatomía de Window",
    "windowPage.anatomyPreviewLabel": "Window, parte por parte",
    "windowPage.anatomyBody": "Abierta y dibujada en su lugar: una ventana real la posiciona su máquina. El diagrama separa el disparador, el posicionador, el marco que se pinta, la zona de arrastre, el título, los controles, el cuerpo y un borde de redimensión que representa a los ocho.",
    "demo.window.trigger": "Abrir inspector",
    "demo.window.title": "Inspector",
    "demo.window.body": "Arrastra la barra de título para moverla, y un borde o una esquina para cambiarle el tamaño.",
    "demo.window.close": "Cerrar",
    "demo.window.minimize": "Minimizar",
    "demo.window.maximize": "Maximizar",
    "demo.window.restore": "Restaurar",
    "demo.windowFixed.trigger": "Abrir notas",
    "demo.windowFixed.title": "Notas",
    "demo.windowFixed.body": "Esta ventana se mueve, pero no cambia de tamaño.",

    "windowPage.description": "Abre un panel que se mueve y cambia de tamaño al lado de la página, sin bloquearla.",

    "windowPage.a11yYours2": "Al cerrarla, devuelve el foco a lo que la abrió.",

    "windowPage.a11yYours1": "Dale un título que la nombre.",

    "windowPage.a11yDoes3": "Los botones de minimizar, maximizar y cerrar tienen nombre.",

    "windowPage.a11yDoes2": "Todo lo que se hace con el puntero se puede hacer con el teclado.",

    "windowPage.a11yDoes1": "La página no queda inerte: <kbd>Tab</kbd> entra y sale de la ventana.",

    "windowPage.a11yIntro": 'El contenido es un <code>role="dialog"</code> sin <code>aria-modal</code>, nombrado por su título.',

    "windowPage.content2": "Recuerda la posición y el tamaño si la persona vuelve a abrirla.",

    "windowPage.content1": "Titula la ventana con lo que contiene: «Inspector», «Capas».",

    "windowPage.whenNot3": 'Para una ayuda junto a un control: usa <a href="/es/componentes/popover">Popover</a>.',

    "windowPage.whenNot2": 'Para un panel de costado fijo: usa <a href="/es/componentes/drawer">Drawer</a>.',

    "windowPage.whenNot1": 'Para algo que hay que decidir antes de seguir: usa <a href="/es/componentes/dialog">Dialog</a>.',

    "windowPage.when2": "Cuando la persona necesita ver la página y el panel a la vez.",

    "windowPage.when1": "Para herramientas que acompañan el contenido: un inspector, un reproductor, un chat.",

    "windowPage.contract3": "No hay fondo que tape la página ni trampa de foco.",
    "windowPage.contract4": "Mínimo de 240 × 120 px, ampliable con <code>minWidth</code> y <code>minHeight</code>. El arrastre queda dentro del viewport; usa <code>boundary</code> con un selector para limitarlo a un contenedor. En React también se usa el portal <code>container</code> como límite.",

    "windowPage.contract2": "No recuerda dónde estaba: guardarlo es de tu app.",

    "windowPage.contract1": "La posición y el tamaño son cuatro hooks: <code>--x</code>, <code>--y</code>, <code>--width</code> y <code>--height</code>.",

    "windowPage.freeBody": "Arrastra la barra de título o un borde; doble clic en la barra maximiza.",

    "windowPage.freeTitle": "Libre: arrastrar y cambiar de tamaño",
    "windowPage.lede": "Window abre un panel que queda abierto mientras sigues trabajando: una paleta de herramientas, un inspector, un chat. Se arrastra por la barra de título, cambia de tamaño por los bordes, se minimiza y se maximiza. La página de atrás sigue funcionando.",
    "windowPage.fixedTitle": "Tamaño fijo: sin bordes ni maximizar",
    "windowPage.fixedBody": "Con <code>resizable={false}</code> se quitan los bordes y los botones de minimizar y maximizar.",
    "window.key.arrows": "Con el foco en la ventana, la mueve; con <kbd>Shift</kbd>, en pasos más largos.",
    "window.key.escape": "Cierra la ventana. Durante un arrastre o un cambio de tamaño, lo cancela y la deja donde estaba.",
    "window.key.dblclick": "Doble clic en la barra de título: maximiza o restaura.",
    "windowPage.guidelinesLede": "Una ventana convive con la página: úsala para lo que se consulta mientras se trabaja.",
  },
  en: {
    "windowPage.enabled": "Enabled",
    "windowPage.disabled": "Disabled",
    "windowPage.resizeTitle": "Resizing",
    "windowPage.resizeBody": "Choose resizable and open the inspector. Disabling it removes resize handles and the minimize and maximize controls.",
    "windowPage.dragTitle": "Dragging the window",
    "windowPage.dragBody": "Compare draggable enabled and disabled. Open the inspector and try its title bar.",
    "windowPage.dragOn": "The title bar lets you move the window within the example.",
    "windowPage.dragOff": "The window stays in position while retaining resizing and its other controls.",
    "windowPage.appearanceTitle": "Frame appearance",
    "windowPage.appearanceBody": "Change appearance and open the inspector to compare its frame. Behavior and semantics stay the same.",
    "windowPage.anatomyLabel": "Window anatomy",
    "windowPage.anatomyPreviewLabel": "Window, part by part",
    "windowPage.anatomyBody": "Open and drawn in place: a real window is positioned by its machine. The diagram separates the trigger, positioner, painted frame, drag region, title, controls, body, and one resize edge standing in for all eight.",
    "demo.window.trigger": "Open inspector",
    "demo.window.title": "Inspector",
    "demo.window.body": "Drag the title bar to move it, and an edge or a corner to resize it.",
    "demo.window.close": "Close",
    "demo.window.minimize": "Minimize",
    "demo.window.maximize": "Maximize",
    "demo.window.restore": "Restore",
    "demo.windowFixed.trigger": "Open notes",
    "demo.windowFixed.title": "Notes",
    "demo.windowFixed.body": "This window moves, but it does not resize.",

    "windowPage.description": "Opens a panel that moves and resizes beside the page, without blocking it.",

    "windowPage.a11yYours2": "On close, return focus to what opened it.",

    "windowPage.a11yYours1": "Give it a title that names it.",

    "windowPage.a11yDoes3": "The minimize, maximize and close buttons have names.",

    "windowPage.a11yDoes2": "Everything done with the pointer can be done with the keyboard.",

    "windowPage.a11yDoes1": "The page does not become inert: <kbd>Tab</kbd> enters and leaves the window.",

    "windowPage.a11yIntro": 'The content is a <code>role="dialog"</code> without <code>aria-modal</code>, named by its title.',

    "windowPage.content2": "Remember position and size if people open it again.",

    "windowPage.content1": "Title the window with what it holds: “Inspector”, “Layers”.",

    "windowPage.whenNot3": 'For help beside a control: use <a href="/components/popover">Popover</a>.',

    "windowPage.whenNot2": 'For a fixed side panel: use <a href="/components/drawer">Drawer</a>.',

    "windowPage.whenNot1": 'For something that must be decided before going on: use <a href="/components/dialog">Dialog</a>.',

    "windowPage.when2": "When people need to see the page and the panel at once.",

    "windowPage.when1": "For tools that go with the content: an inspector, a player, a chat.",

    "windowPage.contract3": "There is no backdrop covering the page and no focus trap.",
    "windowPage.contract4": "Minimum size is 240 × 120 px, increased with <code>minWidth</code> and <code>minHeight</code>. Dragging stays within the viewport; use a <code>boundary</code> selector to constrain it to a container. In React the portal <code>container</code> also acts as the boundary.",

    "windowPage.contract2": "It does not remember where it was: saving that is your app's job.",

    "windowPage.contract1": "Position and size are four hooks: <code>--x</code>, <code>--y</code>, <code>--width</code> and <code>--height</code>.",

    "windowPage.freeBody": "Drag the title bar or an edge; double-click the bar to maximize.",

    "windowPage.freeTitle": "Free: drag and resize",
    "windowPage.lede": "Window opens a panel that stays open while you keep working: a tool palette, an inspector, a chat. It is dragged by its title bar, resized by its edges, minimized and maximized. The page behind keeps working.",
    "windowPage.fixedTitle": "Fixed size: no edges or maximize",
    "windowPage.fixedBody": "With <code>resizable={false}</code> the edges and the minimize and maximize buttons are gone.",
    "window.key.arrows": "With focus on the window, moves it; with <kbd>Shift</kbd>, in longer steps.",
    "window.key.escape": "Closes the window. During a drag or a resize, cancels it and puts the window back.",
    "window.key.dblclick": "Double-click the title bar: maximizes or restores.",
    "windowPage.guidelinesLede": "A window lives alongside the page: use it for what is consulted while working.",
  },
} as const;
