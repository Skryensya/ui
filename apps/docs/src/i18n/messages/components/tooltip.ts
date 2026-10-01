export const tooltipMessages = {
  es: {
    "demo.tooltip.export.label": "Exportar",
    "demo.tooltip.export.content": "Descarga el periodo visible en CSV",
    "demo.tooltip.metric.value": "Ingresos $48.2k",
    "demo.tooltip.metric.label": "Cómo se calcula Ingresos",
    "demo.tooltip.metric.content": "Suma facturada del periodo, sin impuestos ni reembolsos",
    "demo.tooltip.truncated.content": "Migración del pipeline de facturación",

    "tooltipPage.description": "Agrega una descripción corta a algo que ya está en pantalla, al pasar el puntero o enfocarlo.",

    "tooltipPage.key.escape": "Cierra el tooltip.",

    "tooltipPage.key.focus": "Enfocar el control muestra el tooltip.",

    "tooltipPage.a11yYours2": "No pongas enlaces ni botones dentro.",

    "tooltipPage.a11yYours1": "Un botón de solo ícono necesita su propio <code>aria-label</code>: el tooltip describe, no nombra.",

    "tooltipPage.a11yDoes3": "El puntero puede pasar sobre el tooltip sin que se cierre.",

    "tooltipPage.a11yDoes2": "<kbd>Esc</kbd> lo cierra sin mover el foco.",

    "tooltipPage.a11yDoes1": "Se abre al enfocar, no solo al pasar el puntero.",

    "tooltipPage.a11yIntro": "Tooltip sigue el patrón tooltip de la APG.",

    "tooltipPage.content2": "Para un botón de ícono, usa el mismo texto que su <code>aria-label</code>.",

    "tooltipPage.content1": "Escribe unas pocas palabras, sin punto final: «Copiar enlace».",

    "tooltipPage.whenNot3": "Para un botón que ya muestra su texto: no repitas.",

    "tooltipPage.whenNot2": 'Para información que hace falta para completar la tarea: ponla en la página, por ejemplo en la ayuda de un <a href="/es/componentes/form-field">FormField</a>.',

    "tooltipPage.whenNot1": 'Para texto con formato, enlaces o acciones: usa <a href="/es/componentes/popover">Popover</a>.',

    "tooltipPage.when3": "Para mostrar completo un texto recortado.",

    "tooltipPage.when2": "Para explicar una cifra o una abreviatura.",

    "tooltipPage.when1": "Para nombrar un botón de solo ícono, además de su <code>aria-label</code>.",

    "tooltipPage.contract4": "En pantallas táctiles no hay puntero: lo que diga el tooltip tiene que estar también en otro lado.",

    "tooltipPage.contract3": "<code>placement</code> acepta <code>block-start</code> (por defecto), <code>block-end</code>, <code>inline-start</code> e <code>inline-end</code>; si no cabe, se da vuelta.",

    "tooltipPage.contract2": "Cumple WCAG 2.2, 1.4.13: se cierra con <kbd>Esc</kbd>, se puede pasar el puntero encima y no se va solo.",

    "tooltipPage.contract1": "Cuelga <code>aria-describedby</code> del control: describe, no nombra.",

    "tooltipPage.casesBody": "Pasa el puntero o recorre con <kbd>Tab</kbd>: la descripción aparece arriba del control.",

    "tooltipPage.casesTitle": "Tres casos: ícono, cifra y texto recortado",
    "tooltipPage.lede": "Tooltip agrega una descripción corta a algo que ya está en pantalla: qué hace un botón de solo ícono, qué significa una cifra, el texto completo de uno recortado. Aparece al pasar el puntero o al enfocar, y nunca es el único lugar donde vive un dato.",
    "tooltipPage.anatomyBody":
      "Este diagrama nombra el root, el trigger, el positioner, el content y la flecha. El espécimen está congelado abierto; los Tooltip vivos empiezan abajo.",
    "tooltipPage.anatomyLabel": "Anatomía de Tooltip",
    "tooltipPage.anatomyPreviewLabel": "Tooltip, parte por parte",
    "tooltipPage.test1": "Describe el trigger en vez de nombrarlo.",
    "tooltipPage.test2": "Se mantiene cerrado mientras está deshabilitado.",
    "demo.tooltip.dd.long": "Este archivo se exporta con todas sus capas, incluidas las ocultas. Si necesitas solo la vista actual, usa la opción de exportar selección desde el menú de archivo.",
    "tooltipPage.guidelinesLede": "Un tooltip es una ayuda extra: si alguien no lo ve, no debe perderse nada.",
    "tooltipPage.dd.short.title": "Largo: una frase corta",
    "tooltipPage.dd.short.do": "Unas pocas palabras que nombran o aclaran.",
    "tooltipPage.dd.short.dont": 'Un párrafo desaparece al mover el puntero antes de leerlo. Usa un <a href="/es/componentes/popover">Popover</a>.',
    "tooltipPage.dd.repeat.title": "Contenido: agrega algo",
    "tooltipPage.dd.repeat.do": "Nombra un botón que solo muestra un ícono.",
    "tooltipPage.dd.repeat.dont": "No repitas el texto que el botón ya muestra.",
  },
  en: {
    "demo.tooltip.export.label": "Export",
    "demo.tooltip.export.content": "Download the visible period as CSV",
    "demo.tooltip.metric.value": "Revenue $48.2k",
    "demo.tooltip.metric.label": "How Revenue is calculated",
    "demo.tooltip.metric.content": "Amount invoiced for the period, before tax and refunds",
    "demo.tooltip.truncated.content": "Billing pipeline migration",

    "tooltipPage.description": "Adds a short description to something already on screen, on hover or focus.",

    "tooltipPage.key.escape": "Closes the tooltip.",

    "tooltipPage.key.focus": "Focusing the control shows the tooltip.",

    "tooltipPage.a11yYours2": "Do not put links or buttons inside.",

    "tooltipPage.a11yYours1": "An icon-only button needs its own <code>aria-label</code>: the tooltip describes, it does not name.",

    "tooltipPage.a11yDoes3": "The pointer can move over the tooltip without it closing.",

    "tooltipPage.a11yDoes2": "<kbd>Esc</kbd> closes it without moving focus.",

    "tooltipPage.a11yDoes1": "It opens on focus, not only on hover.",

    "tooltipPage.a11yIntro": "Tooltip follows the APG tooltip pattern.",

    "tooltipPage.content2": "For an icon button, use the same text as its <code>aria-label</code>.",

    "tooltipPage.content1": "Write a few words, with no final period: “Copy link”.",

    "tooltipPage.whenNot3": "For a button that already shows its text: do not repeat.",

    "tooltipPage.whenNot2": 'For information needed to complete the task: put it on the page, for example in a <a href="/components/form-field">FormField</a>\'s hint.',

    "tooltipPage.whenNot1": 'For text with formatting, links or actions: use <a href="/components/popover">Popover</a>.',

    "tooltipPage.when3": "To show a truncated text in full.",

    "tooltipPage.when2": "To explain a figure or an abbreviation.",

    "tooltipPage.when1": "To name an icon-only button, on top of its <code>aria-label</code>.",

    "tooltipPage.contract4": "On touch screens there is no hover: whatever the tooltip says must also be somewhere else.",

    "tooltipPage.contract3": "<code>placement</code> takes <code>block-start</code> (default), <code>block-end</code>, <code>inline-start</code> and <code>inline-end</code>; if it does not fit, it flips.",

    "tooltipPage.contract2": "It meets WCAG 2.2, 1.4.13: it closes with <kbd>Esc</kbd>, can be hovered and does not leave by itself.",

    "tooltipPage.contract1": "It hangs <code>aria-describedby</code> on the control: it describes, it does not name.",

    "tooltipPage.casesBody": "Hover or move through with <kbd>Tab</kbd>: the description appears above the control.",

    "tooltipPage.casesTitle": "Three cases: icon, figure and truncated text",
    "tooltipPage.lede": "Tooltip adds a short description to something already on screen: what an icon-only button does, what a figure means, the full text of a truncated one. It appears on hover or focus, and is never the only place a piece of data lives.",
    "tooltipPage.anatomyBody":
      "This diagram names the root, the trigger, the positioner, the content and the arrow. The specimen is frozen open; the live Tooltips begin below.",
    "tooltipPage.anatomyLabel": "Tooltip anatomy",
    "tooltipPage.anatomyPreviewLabel": "Tooltip, part by part",
    "tooltipPage.test1": "Describes the trigger rather than naming it.",
    "tooltipPage.test2": "Stays closed while disabled.",
    "demo.tooltip.dd.long": "This file is exported with all its layers, hidden ones included. If you only need the current view, use export selection from the file menu.",
    "tooltipPage.guidelinesLede": "A tooltip is extra help: if someone does not see it, nothing should be lost.",
    "tooltipPage.dd.short.title": "Length: a short phrase",
    "tooltipPage.dd.short.do": "A few words that name or clarify.",
    "tooltipPage.dd.short.dont": 'A paragraph disappears when the pointer moves before it is read. Use a <a href="/components/popover">Popover</a>.',
    "tooltipPage.dd.repeat.title": "Content: add something",
    "tooltipPage.dd.repeat.do": "Name a button that only shows an icon.",
    "tooltipPage.dd.repeat.dont": "Do not repeat the text the button already shows.",
  },
} as const;
