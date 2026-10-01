export const popoverMessages = {
  es: {
    "demo.popover.trigger": "Ver perfil",
    "demo.popover.description": "Matemática y escritora.",
    "demo.popover.body": "Escribió el primer algoritmo pensado para una máquina.",
    "demo.popover.close": "Cerrar",
    "demo.popoverStructured.trigger": "Ver equipo",
    "demo.popoverStructured.role": "Ingeniera de software",
    "demo.popoverStructured.body": "Coordina el equipo de plataforma y revisa cada release antes de publicarla.",
    "demo.popoverStructured.dismiss": "Ignorar",
    "demo.popoverStructured.action": "Enviar mensaje",
    "demo.popoverPlacement.blockStart": "Se abre arriba del disparador.",
    "demo.popoverPlacement.blockEnd": "Se abre debajo del disparador.",
    "demo.popoverPlacement.inlineStart": "Se abre al inicio en línea (izquierda en LTR).",
    "demo.popoverPlacement.inlineEnd": "Se abre al final en línea (derecha en LTR).",

    "popoverPage.description": "Abre junto a un control un panel con contenido propio, sin bloquear la página.",

    "popoverPage.contract3": "<code>Popover.bare</code> no agrega roles: el contenido trae su propia semántica.",

    "popoverPage.contract2": "El panel se ancla a su botón con CSS anchor positioning.",

    "popoverPage.contract1": 'Usa el atributo nativo <code>popover="auto"</code>: la capa superior, <kbd>Esc</kbd> y el cierre por clic afuera son del navegador.',

    "popoverPage.simpleBody": "El panel abre sobre la página, junto a su botón, y se cierra con la X, con <kbd>Esc</kbd> o con un clic afuera.",

    "popoverPage.simpleTitle": "Simple: título, texto y cierre",

    "popoverPage.lede": "Popover abre junto a un control un panel con contenido propio: un formulario corto, una tarjeta de perfil, una explicación con formato. No bloquea la página y se cierra con <kbd>Esc</kbd> o con un clic afuera.",

    "popoverPage.key.escape": "Cierra el panel y vuelve al botón.",

    "popoverPage.key.tab": "Recorre el contenido del panel; al salir, sigue la página.",

    "popoverPage.key.open": "Abre o cierra el panel desde su botón.",

    "popoverPage.a11yYours2": "No pongas en un Popover lo único que explica una acción: puede pasar desapercibido.",

    "popoverPage.a11yYours1": "En <code>Popover.bare</code>, pon tú los roles que el contenido necesite.",

    "popoverPage.a11yDoes3": "El botón de cierre tiene nombre accesible.",

    "popoverPage.a11yDoes2": "El botón anuncia <code>aria-expanded</code> y el panel queda asociado a él.",

    "popoverPage.a11yDoes1": "<kbd>Esc</kbd> y el clic afuera lo cierran.",

    "popoverPage.a11yIntro": "Popover es un panel no modal sobre el <code>popover</code> nativo.",

    "popoverPage.content3": "Deja el contenido corto: si necesita desplazarse, es un Dialog o un Drawer.",

    "popoverPage.content2": "Nombra el botón que lo abre con lo mismo que el título.",

    "popoverPage.content1": "Escribe el título con lo que el panel contiene: «Compartir», «Filtros».",

    "popoverPage.whenNot3": 'Si hay que decidir algo antes de seguir: usa <a href="/es/componentes/dialog">Dialog</a>.',

    "popoverPage.whenNot2": 'Para una lista de acciones: usa <a href="/es/componentes/menu">Menu</a>.',

    "popoverPage.whenNot1": 'Para una descripción de una línea: usa <a href="/es/componentes/tooltip">Tooltip</a>.',

    "popoverPage.when2": "Para una explicación con formato, enlaces o una imagen.",

    "popoverPage.when1": "Para un formulario corto o un ajuste rápido junto al control que lo abre.",






    "popoverPage.anatomyBody":
      "Este diagrama nombra el trigger, el panel abierto, el título, la descripción y el cierre. El espécimen está congelado; los popovers vivos empiezan abajo.",
    "popoverPage.anatomyLabel": "Anatomía de Popover",
    "popoverPage.anatomyPreviewLabel": "Popover abierto, parte por parte",
    "popoverPage.structuredTitle": "Estructurado: un perfil con acciones",
    "popoverPage.structuredBody": "Un encabezado con avatar y nombre, el cuerpo y una fila de acciones: todo va en <code>children</code>.",
    "popoverPage.placementTitle": "Placement: los cuatro lados",
    "popoverPage.placementBody": "<code>placement</code> elige el lado; si no cabe, el panel se da vuelta solo.",

    "popoverPage.popupTitle": "Popup: solo ancla y superficie",
    "popoverPage.popupBody": "<code>Popover.bare</code> es el mismo panel sin título ni cierre, para armar un patrón propio encima. Antes era la página Popup.",
    "popoverPage.popupAnatomyBody":
      "Un Popup es un ancla y una superficie, y el dibujo lo muestra literal: el disparador lleva <code>sk-anchor</code>, y el panel es <strong>un solo nodo</strong> que usa dos clases a la vez, <code>sk-popover__content</code> (lo que pinta la superficie) y <code>sk-anchored</code> (el patrón que la ubica). Por eso hay dos anillos concéntricos sobre la misma caja. Adentro no se nombra nada: qué va ahí es asunto de la composición, que es justamente para lo que existe la signature bare. El espécimen está congelado y abierto a la fuerza; el vivo está arriba.",
    "popoverPage.popupAnatomyLabel": "Anatomía de Popup",
    "popoverPage.popupAnatomyPreviewLabel": "Popup, parte por parte",
    "popoverPage.popupContractBody": "Popup aporta ancla y superficie, no semántica interna. Si el patrón tiene título y acciones de cierre, usa Popover completo.",

    "demo.popup.trigger": "Filtros",
    "demo.popup.onlyActive": "Solo activos",

    "popoverPage.testReact1":
      'Liga el trigger a su contenido vía <code class="sk-code">popovertarget</code>/id, con <code class="sk-code">popover=auto</code>.',
    "popoverPage.testReact2": "Renderiza un título y una descripción en la anatomía completa (no bare).",
    "popoverPage.testReact3":
      'Renderiza un botón de cerrar en la anatomía completa, ligado a <code class="sk-code">popoverTargetAction=hide</code>.',
    "popoverPage.testReact4":
      "Omite por completo el título, la descripción y el botón de cerrar en modo bare.",
    "popoverPage.testReact5": "No renderiza flecha por defecto, y solo una cuando se pide.",
    "popoverPage.testReact6": "Escribe el placement elegido sobre el contenido.",
    "popoverPage.testReact7": "Nombra un trigger icon-only con triggerLabel.",
    "popoverPage.testReact8":
      'Liga el panel a su propio título/descripción vía <code class="sk-code">aria-labelledby</code>/<code class="sk-code">aria-describedby</code>, igual que Dialog.',
    "popoverPage.testReact9":
      "No lleva ni aria-labelledby ni aria-describedby sin un título/descripción a los que apuntar.",
    "popoverPage.testReact10":
      "No lleva ni aria-labelledby ni aria-describedby en modo bare, aunque se den título y descripción.",
    "popoverPage.testReact11":
      'Pasa <code class="sk-code">triggerVariant</code>/<code class="sk-code">triggerSize</code>/<code class="sk-code">triggerIconOnly</code> al botón del trigger.',
    "popoverPage.testReact12":
      "Deja fuera los atributos de variante, tamaño e icon-only del trigger cuando no se piden.",
    "popoverPage.guidelinesLede": "Un panel junto al control da contexto sin sacar a la persona de lo que hacía.",
  },
  en: {
    "demo.popover.trigger": "View profile",
    "demo.popover.description": "Mathematician and writer.",
    "demo.popover.body": "Wrote the first algorithm intended for a machine.",
    "demo.popover.close": "Close",
    "demo.popoverStructured.trigger": "View team",
    "demo.popoverStructured.role": "Software engineer",
    "demo.popoverStructured.body": "Coordinates the platform team and reviews every release before it ships.",
    "demo.popoverStructured.dismiss": "Dismiss",
    "demo.popoverStructured.action": "Send message",
    "demo.popoverPlacement.blockStart": "Opens above the trigger.",
    "demo.popoverPlacement.blockEnd": "Opens below the trigger.",
    "demo.popoverPlacement.inlineStart": "Opens at inline-start (left in LTR).",
    "demo.popoverPlacement.inlineEnd": "Opens at inline-end (right in LTR).",

    "popoverPage.description": "Opens a panel with its own content beside a control, without blocking the page.",

    "popoverPage.contract3": "<code>Popover.bare</code> adds no roles: the content brings its own semantics.",

    "popoverPage.contract2": "The panel anchors to its button with CSS anchor positioning.",

    "popoverPage.contract1": 'It uses the native <code>popover="auto"</code> attribute: the top layer, <kbd>Esc</kbd> and click-outside dismissal belong to the browser.',

    "popoverPage.simpleBody": "The panel opens over the page, beside its button, and closes with the X, <kbd>Esc</kbd> or a click outside.",

    "popoverPage.simpleTitle": "Simple: title, text and close",

    "popoverPage.lede": "Popover opens a panel with its own content beside a control: a short form, a profile card, a formatted explanation. It does not block the page and closes with <kbd>Esc</kbd> or a click outside.",

    "popoverPage.key.escape": "Closes the panel and returns to the button.",

    "popoverPage.key.tab": "Moves through the panel's content; leaving it continues the page.",

    "popoverPage.key.open": "Opens or closes the panel from its button.",

    "popoverPage.a11yYours2": "Do not put the only explanation of an action in a Popover: it may go unnoticed.",

    "popoverPage.a11yYours1": "In <code>Popover.bare</code>, add the roles the content needs yourself.",

    "popoverPage.a11yDoes3": "The close button has an accessible name.",

    "popoverPage.a11yDoes2": "The button announces <code>aria-expanded</code> and the panel is tied to it.",

    "popoverPage.a11yDoes1": "<kbd>Esc</kbd> and clicking outside close it.",

    "popoverPage.a11yIntro": "Popover is a non-modal panel on the native <code>popover</code>.",

    "popoverPage.content3": "Keep the content short: if it needs scrolling, it is a Dialog or a Drawer.",

    "popoverPage.content2": "Name the button that opens it the same as the title.",

    "popoverPage.content1": "Write the title with what the panel holds: “Share”, “Filters”.",

    "popoverPage.whenNot3": 'If something must be decided before going on: use <a href="/components/dialog">Dialog</a>.',

    "popoverPage.whenNot2": 'For a list of actions: use <a href="/components/menu">Menu</a>.',

    "popoverPage.whenNot1": 'For a one-line description: use <a href="/components/tooltip">Tooltip</a>.',

    "popoverPage.when2": "For an explanation with formatting, links or an image.",

    "popoverPage.when1": "For a short form or quick setting beside the control that opens it.",






    "popoverPage.anatomyBody":
      "This diagram names the trigger, the open panel, the title, the description, and the close control. The specimen is frozen; the live popovers start below.",
    "popoverPage.anatomyLabel": "Popover anatomy",
    "popoverPage.anatomyPreviewLabel": "An open Popover, part by part",
    "popoverPage.structuredTitle": "Structured: a profile with actions",
    "popoverPage.structuredBody": "A header with avatar and name, the body and a row of actions: all of it goes in <code>children</code>.",
    "popoverPage.placementTitle": "Placement: the four sides",
    "popoverPage.placementBody": "<code>placement</code> picks the side; if it does not fit, the panel flips on its own.",

    "popoverPage.popupTitle": "Popup: just anchor and surface",
    "popoverPage.popupBody": "<code>Popover.bare</code> is the same panel with no title or close, to build a pattern of your own on top. It used to be the Popup page.",
    "popoverPage.popupAnatomyBody":
      "A Popup is an anchor and a surface, and the drawing shows exactly that: the trigger carries <code>sk-anchor</code>, and the panel is <strong>one node</strong> wearing two classes at once, <code>sk-popover__content</code> (which paints the surface) and <code>sk-anchored</code> (the pattern that places it). Hence the two concentric rings on one box. Nothing inside is named: what goes there is the composition's business, which is what the bare signature exists for. The specimen is frozen and forced open; the live one is above.",
    "popoverPage.popupAnatomyLabel": "Popup anatomy",
    "popoverPage.popupAnatomyPreviewLabel": "Popup, part by part",
    "popoverPage.popupContractBody": "Popup provides an anchor and a surface, not internal semantics. If the pattern has a title and closing actions, use the full Popover.",

    "demo.popup.trigger": "Filters",
    "demo.popup.onlyActive": "Active only",

    "popoverPage.testReact1":
      'Links the trigger to its content via <code class="sk-code">popovertarget</code>/id, with <code class="sk-code">popover=auto</code>.',
    "popoverPage.testReact2": "Renders a title and description in the full (non-bare) anatomy.",
    "popoverPage.testReact3":
      'Renders a close button in the full anatomy, wired to <code class="sk-code">popoverTargetAction=hide</code>.',
    "popoverPage.testReact4": "Omits the title, description and close button entirely in bare mode.",
    "popoverPage.testReact5": "Renders no arrow by default, and one only when asked.",
    "popoverPage.testReact6": "Writes the chosen placement onto the content.",
    "popoverPage.testReact7": "Names an icon-only trigger with triggerLabel.",
    "popoverPage.testReact8":
      'Links the panel to its own title/description via <code class="sk-code">aria-labelledby</code>/<code class="sk-code">aria-describedby</code>, same as Dialog.',
    "popoverPage.testReact9":
      "Carries neither aria-labelledby nor aria-describedby without a title/description to point at.",
    "popoverPage.testReact10":
      "Carries neither aria-labelledby nor aria-describedby in bare mode, even with title/description given.",
    "popoverPage.testReact11":
      'Passes <code class="sk-code">triggerVariant</code>/<code class="sk-code">triggerSize</code>/<code class="sk-code">triggerIconOnly</code> through to the trigger button.',
    "popoverPage.testReact12":
      "Leaves the trigger's variant/size/icon-only attributes off when unset.",
    "popoverPage.guidelinesLede": "A panel beside the control gives context without taking people out of what they were doing.",
  },
} as const;
