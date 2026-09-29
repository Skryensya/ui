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

    "popoverPage.description": "Contenido no modal con título, descripción y cierre explícito sobre top layer nativo.",
    "popoverPage.anatomyBody":
      "Este diagrama nombra el trigger, el panel abierto, el título, la descripción y el cierre. El espécimen está congelado; los popovers vivos empiezan abajo.",
    "popoverPage.anatomyLabel": "Anatomía de Popover",
    "popoverPage.anatomyPreviewLabel": "Popover abierto, parte por parte",
    "popoverPage.structuredTitle": "Contenido estructurado",
    "popoverPage.structuredBody":
      "El contrato no tiene un slot de <code>header</code> ni de <code>footer</code>, y no le hace falta: <code>children</code> acepta un nodo, así que una fila de encabezado (avatar y nombre) y una fila de acciones al final son composición, hechas con las mismas piezas publicadas (Inline, Stack, Avatar, Text, Button): nada de marcado propio de esta página.",
    "popoverPage.structuredLabel": "Popover con encabezado y pie",
    "popoverPage.placementTitle": "Colocación",
    "popoverPage.placementBody":
      "Las cuatro colocaciones posibles, con <code>Popover.bare</code> en vez de <code>Popover</code>: aquí el punto es <code>placement</code>, no el título ni el botón de cierre. La etiqueta de cada disparador es el valor de la opción que usa.",
    "popoverPage.placementLabel": "Popover en las cuatro colocaciones",
    "popoverPage.contractBody": "Popover describe contenido auxiliar rico. Menu contiene acciones; Tooltip solo una descripción corta.",
    "popoverPage.a11yBody": "La plataforma posee top layer, Escape y light-dismiss mediante popover=auto.",

    "popoverPage.popupTitle": "Popup: la superficie desnuda",
    "popoverPage.popupBody":
      "<code>Popover.bare</code> es la misma familia sin el chrome: ancla y superficie, nada más. Esta sección se llamaba <strong>Popup</strong> y tenía página propia; era un nombre distinto para una signature que ya existía acá, así que vive donde vive el contrato.",
    "popoverPage.popupAnatomyBody":
      "Un Popup es un ancla y una superficie, y el dibujo lo muestra literal: el disparador lleva <code>sk-anchor</code>, y el panel es <strong>un solo nodo</strong> que usa dos clases a la vez, <code>sk-popover__content</code> (lo que pinta la superficie) y <code>sk-anchored</code> (el patrón que la ubica). Por eso hay dos anillos concéntricos sobre la misma caja. Adentro no se nombra nada: qué va ahí es asunto de la composición, que es justamente para lo que existe la signature bare. El espécimen está congelado y abierto a la fuerza; el vivo está arriba.",
    "popoverPage.popupAnatomyLabel": "Anatomía de Popup",
    "popoverPage.popupAnatomyPreviewLabel": "Popup, parte por parte",
    "popoverPage.popupContractBody": "Popup aporta ancla y superficie, no semántica interna. Si el patrón tiene título y acciones de cierre, usa Popover completo.",
    "popoverPage.popupA11yBody": "En modo bare el contenido debe aportar su propia semántica: la signature no inventa roles dialog ni menu.",

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
    "popoverPage.prop.placement.title": "Posición",
    "popoverPage.prop.placement.body": "La <code>placement</code> dice de qué lado del botón se abre el panel. Si no cabe, se da vuelta. Presiona el botón para verlo.",
    "popoverPage.prop.placement.block-start": "Usa <code>block-start</code> cuando el botón está al pie de la vista.",
    "popoverPage.prop.placement.block-end": "Usa <code>block-end</code>, el default, casi siempre: el panel cae bajo el botón.",
    "popoverPage.prop.placement.inline-start": "Usa <code>inline-start</code> para un botón al final de una fila.",
    "popoverPage.prop.placement.inline-end": "Usa <code>inline-end</code> para un botón en una barra lateral.",
    "popoverPage.prop.placement.top": "Arriba",
    "popoverPage.prop.placement.bottom": "Abajo",
    "popoverPage.prop.placement.start": "Inicio",
    "popoverPage.prop.placement.end": "Fin",
    "popoverPage.prop.appearance.title": "Apariencia",
    "popoverPage.prop.appearance.body": "La <code>appearance</code> decide cómo se dibuja el panel. Presiona el botón para verlo.",
    "popoverPage.prop.appearance.plain": "Usa <code>plain</code>, el default, en casi todas partes.",
    "popoverPage.prop.appearance.brutalist": "Usa <code>brutalist</code> cuando el resto de la página lo es.",
    "popoverPage.prop.appearance.frosted": "Usa <code>frosted</code> sobre una imagen o un fondo con color.",
    "popoverPage.showcaseTitle": "Showcases",
    "popoverPage.showcaseBody": "Un panel simple, uno con título y acciones, las cuatro posiciones y el Popup sin adornos.",
    "popoverPage.guidelinesLede": "Popover abre un panel con contenido propio junto a un control, sin bloquear la página.",
    "popoverPage.guide.use1": "Úsalo para un formulario corto o una explicación con formato, que se cierra al hacer clic afuera o con Esc.",
    "popoverPage.guide.avoid1": "Una descripción de una línea es un <a href=\"/es/componentes/tooltip\">Tooltip</a>: no se roba el foco.",
    "popoverPage.guide.avoid2": "Una lista de acciones es un <a href=\"/es/componentes/menu\">Menu</a>, que ya trae la navegación con teclado.",
    "popoverPage.guide.avoid3": "Si hay que decidir algo antes de seguir, es un <a href=\"/es/componentes/dialog\">Dialog</a>.",
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

    "popoverPage.description": "Non-modal content with a title, description, and explicit close over the native top layer.",
    "popoverPage.anatomyBody":
      "This diagram names the trigger, the open panel, the title, the description, and the close control. The specimen is frozen; the live popovers start below.",
    "popoverPage.anatomyLabel": "Popover anatomy",
    "popoverPage.anatomyPreviewLabel": "An open Popover, part by part",
    "popoverPage.structuredTitle": "Structured content",
    "popoverPage.structuredBody":
      "The contract has no <code>header</code> or <code>footer</code> slot, and does not need one: <code>children</code> accepts a node, so a header row (avatar and name) and an action row at the end are composition, built from the same published pieces (Inline, Stack, Avatar, Text, Button): no markup of this page's own.",
    "popoverPage.structuredLabel": "Popover with a header and footer",
    "popoverPage.placementTitle": "Placement",
    "popoverPage.placementBody":
      "All four placements, with <code>Popover.bare</code> instead of <code>Popover</code>: the point here is <code>placement</code>, not the title or the close button. Each trigger's label is the option value it uses.",
    "popoverPage.placementLabel": "Popover in all four placements",
    "popoverPage.contractBody": "Popover describes rich auxiliary content. Menu holds actions; Tooltip holds only a short description.",
    "popoverPage.a11yBody": "The platform owns the top layer, Escape, and light-dismiss through popover=auto.",

    "popoverPage.popupTitle": "Popup: the bare surface",
    "popoverPage.popupBody":
      "<code>Popover.bare</code> is the same family without the chrome: an anchor and a surface, nothing else. This section used to be a page of its own called <strong>Popup</strong>, which was a second name for a signature that already lived here, so it now lives where the contract lives.",
    "popoverPage.popupAnatomyBody":
      "A Popup is an anchor and a surface, and the drawing shows exactly that: the trigger carries <code>sk-anchor</code>, and the panel is <strong>one node</strong> wearing two classes at once, <code>sk-popover__content</code> (which paints the surface) and <code>sk-anchored</code> (the pattern that places it). Hence the two concentric rings on one box. Nothing inside is named: what goes there is the composition's business, which is what the bare signature exists for. The specimen is frozen and forced open; the live one is above.",
    "popoverPage.popupAnatomyLabel": "Popup anatomy",
    "popoverPage.popupAnatomyPreviewLabel": "Popup, part by part",
    "popoverPage.popupContractBody": "Popup provides an anchor and a surface, not internal semantics. If the pattern has a title and closing actions, use the full Popover.",
    "popoverPage.popupA11yBody": "In bare mode the content must provide its own semantics: the signature invents no dialog or menu roles.",

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
    "popoverPage.prop.placement.title": "Placement",
    "popoverPage.prop.placement.body": "<code>placement</code> says which side of the button the panel opens on. If it does not fit, it flips. Press the button to see it.",
    "popoverPage.prop.placement.block-start": "Use <code>block-start</code> when the button sits at the bottom of the view.",
    "popoverPage.prop.placement.block-end": "Use <code>block-end</code>, the default, almost always: the panel drops under the button.",
    "popoverPage.prop.placement.inline-start": "Use <code>inline-start</code> for a button at the end of a row.",
    "popoverPage.prop.placement.inline-end": "Use <code>inline-end</code> for a button in a sidebar.",
    "popoverPage.prop.placement.top": "Top",
    "popoverPage.prop.placement.bottom": "Bottom",
    "popoverPage.prop.placement.start": "Start",
    "popoverPage.prop.placement.end": "End",
    "popoverPage.prop.appearance.title": "Appearance",
    "popoverPage.prop.appearance.body": "<code>appearance</code> decides how the panel is drawn. Press the button to see it.",
    "popoverPage.prop.appearance.plain": "Use <code>plain</code>, the default, almost everywhere.",
    "popoverPage.prop.appearance.brutalist": "Use <code>brutalist</code> when the rest of the page is.",
    "popoverPage.prop.appearance.frosted": "Use <code>frosted</code> over an image or a coloured background.",
    "popoverPage.showcaseTitle": "Showcases",
    "popoverPage.showcaseBody": "A simple panel, one with a title and actions, the four placements, and the bare Popup.",
    "popoverPage.guidelinesLede": "Popover opens a panel with content of its own beside a control, without blocking the page.",
    "popoverPage.guide.use1": "Use it for a short form or a formatted explanation, closed by clicking outside or pressing Esc.",
    "popoverPage.guide.avoid1": "A one-line description is a <a href=\"/components/tooltip\">Tooltip</a>: it does not steal focus.",
    "popoverPage.guide.avoid2": "A list of actions is a <a href=\"/components/menu\">Menu</a>, which already brings keyboard navigation.",
    "popoverPage.guide.avoid3": "When something must be decided before going on, it is a <a href=\"/components/dialog\">Dialog</a>.",
  },
} as const;
