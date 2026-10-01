export const backToTopMessages = {
  es: {

    "backToTop.description": "Devuelve al inicio de una página larga con un clic, y solo aparece cuando hace falta.",

    "backToTop.a11yKeyEnter": "Vuelve al inicio. Con <code>target</code>, mueve el foco ahí.",

    "backToTop.a11yKeyTab": "Llega al botón cuando está visible.",

    "backToTop.a11yYours2": "Ubícalo donde no tape contenido ni controles al aparecer.",

    "backToTop.a11yYours1": 'Pasa <code>target</code> con algo enfocable del inicio (un encabezado con <code>tabindex="-1"</code>). Sin él, el foco se queda en un botón que ya se escondió.',

    "backToTop.a11yDoes3": "Respeta <code>prefers-reduced-motion</code>: sin animación, sube de inmediato.",

    "backToTop.a11yDoes2": "Escondido, sale del árbol de accesibilidad y del orden de tabulación.",

    "backToTop.a11yDoes1": 'Renderiza un <code>&lt;button type="button"&gt;</code>; la etiqueta recortada es su nombre accesible y el chevron es decorativo.',

    "backToTop.a11yIntro": "Es un botón nativo con nombre, que desaparece del recorrido de foco mientras está escondido.",

    "backToTop.content2": "Di adónde lleva. En un panel, nombra el panel: “Volver al inicio de la lista”.",

    "backToTop.content1": "Debe tener etiqueta aunque no se vea: “Volver arriba”.",

    "backToTop.whenNot4": "Para recordar la posición entre páginas: es tarea del router, no de un botón.",

    "backToTop.whenNot3": 'Para ir a una sección concreta: usa un enlace de ancla o <a href="/es/componentes/toc">Toc</a>.',

    "backToTop.whenNot2": 'Para saltar el encabezado y llegar al contenido: usa <a href="/es/componentes/skip-link">SkipLink</a>.',

    "backToTop.whenNot1": "Si la página entra en una pantalla: no hay adónde volver. No lo pongas.",

    "backToTop.when2": "En un panel con desplazamiento propio: apúntalo con <code>scroller</code>.",

    "backToTop.when1": "En páginas largas, donde la persona baja varias pantallas: documentación, artículos, listados.",

    "backToTop.contract3": "El desplazamiento es suave, e instantáneo si la persona pidió menos movimiento.",

    "backToTop.contract2": "<code>threshold</code> son los píxeles antes de aparecer (400 por defecto). <code>scroller</code> apunta a un panel con desplazamiento propio. <code>target</code> mueve el foco después de subir.",

    "backToTop.contract1": "Viene con <code>hidden</code>: sin JavaScript no ocupa lugar.",
    "backToTop.lede": "BackToTop devuelve al inicio de una página larga con un clic. Aparece cuando la persona ya bajó lo suficiente y se va al volver arriba, así no ocupa lugar cuando no hace falta.",
    "backToTop.anatomyBody": "El botón, el ícono y la etiqueta. El diagrama muestra la etiqueta, que por defecto está recortada.",
    "backToTop.anatomyLabel": "Anatomía de BackToTop",
    "backToTop.anatomyPreviewLabel": "BackToTop, parte por parte",
    "backToTop.demoLabel": "Volver arriba",
    "backToTop.demoStaticTitle": "El botón: un chevron con nombre",
    "backToTop.demoStaticBody": "Con <code>threshold</code> en <code>0</code> queda siempre visible. La etiqueta está recortada: se oye, no se ve.",
    "backToTop.demoStaticLabel": "BackToTop siempre visible",
    "backToTop.demoScrollTitle": "Al desplazarse: aparece pasado el umbral",
    "backToTop.demoScrollBody": "Baja dentro del recuadro: el botón aparece al pasar el umbral y, al presionarlo, vuelve arriba. Al llegar, se va solo.",
    "backToTop.demoScrollLabel": "BackToTop al scrollear",
    "backToTop.demoScrollHint": "Desplázate dentro del recuadro para verlo aparecer.",
    "backToTop.scrollDemoP1":
      "Una página larga tiene un movimiento que se repite hasta el cansancio: volver al principio. Después de leer varias pantallas, quien quiere releer el encabezado o cambiar de sección tiene que arrastrar la barra o buscar la tecla Inicio, y ninguna de las dos se ve.",
    "backToTop.scrollDemoP2":
      "Un botón visible mientras se baja es la señal de que ese movimiento existe. No está desde el principio: aparece solo cuando ya te alejaste lo suficiente como para quererlo, y se esconde de nuevo cuando llegas. Cuando no hace falta, no ocupa lugar.",
    "backToTop.scrollDemoP3":
      "El scroll lo hace la plataforma con <code>scrollTo</code>: suave por defecto, instantáneo si pediste menos movimiento. Con <code>target</code>, además mueve el foco a algo enfocable de arriba, así el siguiente Tab arranca del principio y no de un control que se acaba de esconder.",
    "backToTop.htmlTitle": "HTML escrito a mano",
    "backToTop.targetTitle": "Umbral y foco",
    "backToTop.targetBody":
      '<code>data-threshold</code> son los píxeles de scroll antes de aparecer. <code>data-target</code> es un selector de algo enfocable arriba: sin él, el foco se queda en un botón que ya no se ve; con él, el siguiente Tab sigue desde el principio. El destino tiene que poder recibir el foco (<code>tabindex="-1"</code> si es un landmark o un encabezado).',
    "backToTop.pillTitle": "Pill con texto visible",
    "backToTop.pillBody":
      "Por defecto es solo ícono y la etiqueta va recortada. El nombre accesible ya está; para dibujarlo, un consumidor destapa <code>.sk-back-to-top__label</code> y le da lugar al root.",
    "backToTop.test1": "Se renderiza oculto (<code>hidden</code>) y toma su nombre accesible del contenido una vez visible.",
    "backToTop.test2": "Se muestra al pasar el umbral y vuelve a ocultarse al subir de nuevo.",
    "backToTop.test3": "Al hacer clic devuelve la ventana al inicio, con scroll suave por defecto.",
    "backToTop.test4": "Salta de forma instantánea cuando quien lee prefiere menos movimiento.",
    "backToTop.test5": "Mueve el foco a <code>target</code> después de scrollear, sin disparar un segundo scroll.",
    "backToTop.test6": "Actúa sobre un scroller interno nombrado en vez de la ventana.",
    "backToTop.test7": "Sigue llamando al <code>onClick</code> de quien lo usa, y le permite cancelar el scroll.",
    "backToTop.test8": "Revela en o después del umbral, nunca antes.",
    "backToTop.test9": "Con umbral 0 se muestra desde el primer píxel.",
    "backToTop.test10": "Un umbral inválido cae al valor por defecto, no queda siempre activado ni siempre desactivado.",
    "backToTop.test11": "Nunca se revela con una posición de scroll no finita.",
    "backToTop.test12": "Parsea <code>data-threshold</code>, y cae al valor por defecto si viene vacío o no se puede interpretar.",
    "backToTop.test13": "Anima el scroll salvo que quien lee haya pedido menos movimiento.",
    "backToTop.test14": "Se mantiene oculto bajo el umbral y se revela al pasarlo.",
    "backToTop.test15": "Respeta un <code>data-threshold</code> personalizado.",
    "backToTop.test16": "Al hacer clic devuelve la ventana al inicio, con scroll suave por defecto.",
    "backToTop.test17": "Salta de forma instantánea cuando quien lee prefiere menos movimiento.",
    "backToTop.test18": "Mueve el foco a <code>target</code> después del scroll, sin iniciar uno segundo.",
    "backToTop.test19": "Actúa sobre un scroller interno nombrado en vez de la ventana.",
    "backToTop.test20": "Deja de sincronizar una vez limpiado (<code>off()</code>).",
    "backToTop.test21": "Se monta una sola vez por raíz escrita a mano; una segunda llamada no hace nada.",
    "backToTop.guidelinesLede": "Un atajo visible para un movimiento que se repite en páginas largas: volver arriba.",
    "backToTop.dd.placement.title": "Ubicación: despeja el contenido",
    "backToTop.dd.placement.do": "Pon el botón en una esquina libre para que siga a mano sin tapar lo que se está leyendo.",
    "backToTop.dd.placement.dont": "No lo pongas sobre el texto: el atajo no debe ocultar el contenido al que acompaña.",
    "backToTop.dd.mockEyebrow": "DOCUMENTACIÓN · GUÍA",
    "backToTop.dd.mockTitle": "Leer la documentación",
    "backToTop.dd.mockBody1": "El contenido largo se recorre a tu ritmo. Puedes volver al inicio cuando lo necesites.",
    "backToTop.dd.mockBody2": "Deja espacio alrededor del texto y los controles para que nada importante quede cubierto.",
  },
  en: {

    "backToTop.description": "Takes people back to the top of a long page in one click, and only appears when needed.",

    "backToTop.a11yKeyEnter": "Goes back to the top. With <code>target</code>, moves focus there.",

    "backToTop.a11yKeyTab": "Reaches the button while it is visible.",

    "backToTop.a11yYours2": "Place it where it covers no content or controls when it appears.",

    "backToTop.a11yYours1": 'Pass <code>target</code> with something focusable at the top (a heading with <code>tabindex="-1"</code>). Without it, focus stays on a button that just hid.',

    "backToTop.a11yDoes3": "It respects <code>prefers-reduced-motion</code>: with no animation, it jumps up at once.",

    "backToTop.a11yDoes2": "While hidden, it is out of the accessibility tree and the tab order.",

    "backToTop.a11yDoes1": 'It renders a <code>&lt;button type="button"&gt;</code>; the clipped label is its accessible name and the chevron is decorative.',

    "backToTop.a11yIntro": "It is a native, named button that leaves the focus order while hidden.",

    "backToTop.content2": "Say where it goes. In a panel, name the panel: “Back to the start of the list”.",

    "backToTop.content1": "It must have a label even though it is not visible: “Back to top”.",

    "backToTop.whenNot4": "To remember the position between pages: that is the router's job, not a button's.",

    "backToTop.whenNot3": 'To go to a specific section: use an anchor link or <a href="/components/toc">Toc</a>.',

    "backToTop.whenNot2": 'To skip the header and reach the content: use <a href="/components/skip-link">SkipLink</a>.',

    "backToTop.whenNot1": "If the page fits on one screen: there is nowhere to go back to. Leave it out.",

    "backToTop.when2": "In a panel with its own scroll: point it there with <code>scroller</code>.",

    "backToTop.when1": "On long pages where people scroll several screens: documentation, articles, listings.",

    "backToTop.contract3": "Scrolling is smooth, and instant if the person asked for less motion.",

    "backToTop.contract2": "<code>threshold</code> is the pixels before it appears (400 by default). <code>scroller</code> points it at a panel with its own scroll. <code>target</code> moves focus after scrolling up.",

    "backToTop.contract1": "It ships with <code>hidden</code>: without JavaScript it takes no room.",
    "backToTop.lede": "BackToTop takes people back to the top of a long page in one click. It appears once they have scrolled far enough and leaves when they are back at the top, so it takes no room when it is not needed.",
    "backToTop.anatomyBody": "The button, the icon and the label. The diagram shows the label, which is clipped by default.",
    "backToTop.anatomyLabel": "BackToTop anatomy",
    "backToTop.anatomyPreviewLabel": "BackToTop, part by part",
    "backToTop.demoLabel": "Back to top",
    "backToTop.demoStaticTitle": "The button: a chevron with a name",
    "backToTop.demoStaticBody": "With <code>threshold</code> at <code>0</code> it is always visible. The label is clipped: it is heard, not seen.",
    "backToTop.demoStaticLabel": "BackToTop, always shown",
    "backToTop.demoScrollTitle": "While scrolling: it appears past the threshold",
    "backToTop.demoScrollBody": "Scroll inside the box: the button appears past the threshold and, when pressed, goes back to the top. Once there, it leaves.",
    "backToTop.demoScrollLabel": "BackToTop on scroll",
    "backToTop.demoScrollHint": "Scroll inside the box to see it appear.",
    "backToTop.scrollDemoP1":
      "A long page has one move the reader makes over and over: get back to the start. After a few screens of reading, someone who wants to re-read the heading or jump sections has to drag the scrollbar or reach for the Home key, and neither is visible.",
    "backToTop.scrollDemoP2":
      "A button that stays visible while scrolling is the affordance that says the move exists. It is not there from the start: it appears once you have gone far enough to want it, and hides again once you are back. When it is not needed, it takes no room.",
    "backToTop.scrollDemoP3":
      "The scroll is the platform's, via <code>scrollTo</code>: smooth by default, instant if you asked for less motion. With <code>target</code> it also moves focus to a focusable element up top, so the next Tab starts from the beginning rather than from a control that just hid itself.",
    "backToTop.htmlTitle": "Authored HTML",
    "backToTop.targetTitle": "Threshold and focus",
    "backToTop.targetBody":
      '<code>data-threshold</code> is the scroll distance before it appears. <code>data-target</code> is a selector for a focusable element up top: without it, focus is stranded on a button that has hidden itself; with it, the next Tab continues from the start. The target has to be focusable (<code>tabindex="-1"</code> if it is a landmark or a heading).',
    "backToTop.pillTitle": "Pill with visible text",
    "backToTop.pillBody":
      "By default it is icon-only and the label is clipped. The accessible name is already there; to draw it, a consumer un-clips <code>.sk-back-to-top__label</code> and gives the root room.",
    "backToTop.test1": "Renders hidden, and takes its accessible name from its content once shown.",
    "backToTop.test2": "Reveals once scrolled past the threshold and hides again above it.",
    "backToTop.test3": "Returns the window to the top on click, smoothly by default.",
    "backToTop.test4": "Jumps instantly when the reader prefers reduced motion.",
    "backToTop.test5": "Moves focus to <code>target</code> after scrolling, without a second scroll.",
    "backToTop.test6": "Acts on a named inner scroller instead of the window.",
    "backToTop.test7": "Still calls the consumer's <code>onClick</code>, and lets it opt out of the scroll.",
    "backToTop.test8": "Reveals at or past the threshold, never before.",
    "backToTop.test9": "Shows from the first pixel when the threshold is 0.",
    "backToTop.test10": "A broken threshold falls back to the default, not always-on or always-off.",
    "backToTop.test11": "Never reveals on a non-finite scroll position.",
    "backToTop.test12": "Parses <code>data-threshold</code>, falling back to the default on empty or unparseable input.",
    "backToTop.test13": "Animates the scroll unless the reader asked for less motion.",
    "backToTop.test14": "Stays hidden below the threshold and reveals once past it.",
    "backToTop.test15": "Honours a custom <code>data-threshold</code>.",
    "backToTop.test16": "Returns the window to the top on click, smoothly by default.",
    "backToTop.test17": "Jumps instantly when the reader prefers reduced motion.",
    "backToTop.test18": "Moves focus to <code>target</code> after the scroll, without starting a second one.",
    "backToTop.test19": "Acts on a named inner scroller instead of the window.",
    "backToTop.test20": "Stops syncing once cleaned up (<code>off()</code>).",
    "backToTop.test21": "Mounts once per authored root; a second call does nothing.",
    "backToTop.guidelinesLede": "A visible shortcut for a move people repeat on long pages: back to the top.",
    "backToTop.dd.placement.title": "Placement: keep content clear",
    "backToTop.dd.placement.do": "Place the button in a clear corner so it stays handy without covering what people are reading.",
    "backToTop.dd.placement.dont": "Do not put it over the text: the shortcut should not hide the content it supports.",
    "backToTop.dd.mockEyebrow": "DOCUMENTATION · GUIDE",
    "backToTop.dd.mockTitle": "Reading the docs",
    "backToTop.dd.mockBody1": "Long content should be read at your own pace. Return to the top whenever you need.",
    "backToTop.dd.mockBody2": "Leave room around text and controls so nothing important gets covered.",
  },
} as const;
