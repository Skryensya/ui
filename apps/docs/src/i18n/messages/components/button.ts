export const buttonMessages = {
  es: {
    "demo.button.ok": "Aceptar",
    "demo.button.deleteForever": "Borrar para siempre",
    "demo.button.saveDraft": "Guardar borrador",
    "demo.button.saveChanges": "Guardar cambios",
    "demo.button.action": "Acción",
    "demo.button.save": "Guardar",
    "demo.button.cancel": "Cancelar",
    "demo.button.delete": "Borrar",
    "demo.button.confirmDelete": "Sí, borrar",
    "demo.button.download": "Descargar",
    "demo.button.continue": "Continuar",
    "demo.button.settings": "Configuración",
    "demo.button.edit": "Editar",
    "demo.button.add": "Añadir",
    "demo.button.copy": "Copiar",
    "demo.button.moreActions": "Más acciones",
    "demo.button.readNews": "Ver noticia",
    "demo.button.small": "Pequeño",
    "demo.button.large": "Grande",
    "demo.button.withIcon": "Con icono",
    "demo.button.retry": "Reintentar",
    "demo.button.dismiss": "Descartar",

    "button.description": "Ejecuta una acción en la página: enviar, guardar, confirmar o descartar.",

    "button.a11yKeyTab": "Mueve el foco al botón siguiente o al anterior.",

    "button.a11yKeySpace": "Activa el botón. En un enlace, desplaza la página.",

    "button.a11yKeyEnter": "Activa el botón o sigue el enlace.",

    "button.a11yYours3": "El objetivo debe medir al menos 24px (WCAG 2.2, 2.5.8). Deja <code>xs</code> para controles dentro de otro patrón.",

    "button.a11yYours2": "No uses un botón deshabilitado como única explicación de qué falta: dilo junto al campo.",

    "button.a11yYours1": "Un botón solo ícono debe tener <code>aria-label</code>.",

    "button.a11yDoes3": "El ícono es decorativo cuando hay texto.",

    "button.a11yDoes2": "Con <code>pressed</code>, anuncia <code>aria-pressed</code>.",

    "button.a11yDoes1": "Renderiza un <code>&lt;button&gt;</code> nativo, o un <code>&lt;a&gt;</code> cuando recibe <code>href</code>.",

    "button.a11yIntro": "Button es un control nativo: foco, teclado y rol vienen de la plataforma.",

    "button.content4": "No nombres el control ni su posición: «Enviar solicitud», no «Botón de enviar».",

    "button.content3": "En la confirmación destructiva, di el costo: «Borrar para siempre», no «Aceptar».",

    "button.content2": "Usa de 1 a 3 palabras, en una línea, con mayúscula solo al inicio.",

    "button.content1": "Empieza con un verbo en infinitivo: «Guardar cambios», no «Cambios».",

    "button.dd.cost.dont": "«Aceptar» no dice qué pasa, y en rojo solo agrega alarma.",

    "button.dd.cost.do": "«Borrar para siempre» dice qué se pierde antes de que la persona presione.",

    "button.dd.cost.title": "Confirmación destructiva: di el costo",
    "button.dd.hardDelete.title": "Borrado irreversible: énfasis sólido",
    "button.dd.hardDelete.do": "La confirmación final usa <code>solid</code> + <code>danger</code>: la acción no puede pasar inadvertida.",
    "button.dd.hardDelete.dont": "<code>ghost</code> + <code>danger</code> es demasiado tenue para confirmar un borrado irreversible.",

    "button.dd.primary.dont": "Dos <code>solid</code> + <code>accent</code> en la misma fila: si todo es la acción principal, nada lo es.",

    "button.dd.primary.do": "Un <code>accent</code> por región y el resto <code>neutral</code>: la persona ve de inmediato qué hacer.",

    "button.dd.primary.title": "Acción principal: una por región",

    "button.whenNot4": 'Para informar un estado: usa <a href="/es/componentes/badge">Badge</a> o <a href="/es/componentes/callout">Callout</a>.',

    "button.whenNot3": 'Para marcar la opción elegida de un grupo: usa <a href="/es/componentes/segmented">SegmentedControl</a> o <a href="/es/componentes/radio-group">RadioGroup</a>.',

    "button.whenNot2": 'Para una acción secundaria dentro de un párrafo: usa <a href="/es/componentes/link">Link</a>.',

    "button.whenNot1": 'Para ir a otra página: usa <code>Button.navigation</code> si debe verse como botón, o <a href="/es/componentes/link">Link</a>.',

    "button.when3": "Para un toggle que queda encendido, como la negrita en una barra: usa <code>pressed</code>.",

    "button.when2": "Para confirmar o descartar un diálogo.",

    "button.when1": "Para una acción que cambia algo en la página: guardar, enviar, confirmar.",

    "button.contract2": '<code>Button.navigation</code> renderiza un <code>&lt;a&gt;</code>: no lleva <code>tone="danger"</code>, porque navegar no destruye nada.',

    "button.contract1": "Con <code>pressed</code> es un toggle real y anuncia <code>aria-pressed</code>. Omítelo cuando el botón no queda encendido.",

    "button.iconOnlyBody": "Para acciones que se reconocen sin texto, como la configuración. El nombre va en <code>aria-label</code>.",
    "button.lede": "Button ejecuta una acción en la página: enviar un formulario, guardar, confirmar o descartar. Es el <code>&lt;button&gt;</code> nativo con hooks de estilo; con <code>href</code>, el mismo aspecto sobre un enlace.",
    "button.anatomyBody":
      "Un botón es una sola caja con lugares reservados: <code>sk-button__pre</code> antes del label y <code>sk-button__post</code> después. El icono es un solo <code>sk-icon</code> (el mismo en cualquiera de los dos slots). El espécimen llena ambos para nombrarlos; los ejemplos vivos empiezan con el botón base.",
    "button.anatomyLabel": "Anatomía de Button",
    "button.anatomyPreviewLabel": "Button, parte por parte",
    "button.defaultTitle": "El botón base: sin opciones",
    "button.defaultBody": "<code>solid</code>, <code>neutral</code> y <code>md</code> son los valores por defecto. Agrega una opción solo cuando el contexto lo pide.",
    "button.variantsTitle": "Énfasis y tono: dos decisiones independientes",
    "button.variantsBody": "<code>variant</code> dice qué tan fuerte es y <code>tone</code> qué significa, así que se combinan todos. Un botón ejecuta una acción, por eso no tiene los tonos <code>success</code> ni <code>warning</code>.",
    "button.destructiveTitle": "Acción destructiva: el disparador y la confirmación no pesan igual",
    "button.destructiveBody": "<code>ghost</code> + <code>danger</code> es el disparador que vive en una fila de acciones; <code>solid</code> + <code>danger</code> confirma el borrado.",
    "button.appearanceTitle": "Appearance: cómo se expresa",
    "button.appearanceBody": "El mismo botón en <code>plain</code>, <code>tactile</code>, <code>brutalist</code> y <code>frosted</code>, sin cambiar qué significa ni qué tan fuerte es. El menú de apariencia de esta página cambia todos los demás ejemplos.",
    "button.brutalistMatrixTitle": "Brutalist: cada énfasis y tono",
    "button.brutalistMatrixBody": "<code>solid</code> usa toda la construcción, <code>soft</code> una sombra más corta y <code>ghost</code> solo tinta.",
    "button.brutalistRadiusTitle": "Brutalist: no es un radio",
    "button.brutalistRadiusBody": "La identidad está en el borde, la cara plana y la sombra dura, no en las esquinas.",
    "button.brutalistStatesTitle": "Brutalist: estados",
    "button.brutalistStatesBody": "<code>hover</code> alarga la sombra, <code>:active</code> empuja la cara hacia ella y <code>disabled</code> apaga la construcción. Aquí están congelados para compararlos.",
    "button.brutalistShapesTitle": "Brutalist: formas y hosts",
    "button.brutalistShapesBody": "Solo ícono, como enlace y soldados: la misma construcción en cada forma.",
    "button.frostedTitle": "Frosted: un material, no una pintura",
    "button.frostedBody": "La cara deja pasar lo que hay detrás, difuminado. No es <code>soft</code>: <code>soft</code> decide cuánto se ve el fondo; <code>frosted</code>, cómo se procesa.",
    "button.frostedMatrixTitle": "Frosted: cada énfasis y tono",
    "button.frostedMatrixBody": "En <code>accent</code> y <code>danger</code> la cara casi no deja pasar el fondo, para que el texto mantenga 4.5:1 sobre cualquier foto.",
    "button.frostedDetailsTitle": "Frosted: radio, estados y formas",
    "button.frostedDetailsBody": "El material sigue el radio. Sin <code>backdrop-filter</code>, con transparencia reducida o alto contraste, vuelve a la cara opaca de plain.",
    "button.iconTitle": "Con ícono: anticipa la acción",
    "button.iconBody": "El ícono va en el slot <code>pre</code>, antes del texto. Un slot vacío no se dibuja.",
    "button.iconOnlyTitle": "Solo ícono: con nombre accesible",
    "button.linkTitle": "Como enlace: con <code>href</code>, el mismo aspecto sobre un <code>&lt;a&gt;</code>",
    "button.linkBody": "Cuando la acción lleva a otra página, el componente renderiza un enlace. Un enlace no puede estar deshabilitado: renderiza el contenido sin enlace.",
    "button.tileTitle": "TileButton: toda la superficie es la acción",
    "button.tileBody": "Cuando la acción ocupa una tarjeta entera, no solo un texto dentro de ella.",
    "button.vanillaInitTitle": "Inicializar vanilla",
    "button.iconsComment":
      "Los iconos se autoran como placeholders <span data-sk-icon>;\nmountIcons los reemplaza por el <svg> del set enlazado.",
    "button.prop.variant.title": "Variant: qué tan fuerte se ve",
    "button.prop.variant.body": "El énfasis del botón frente a los que lo rodean.",
    "button.prop.variant.solid": "Usa <code>solid</code> para la acción principal o una confirmación.",
    "button.prop.variant.soft": "Usa <code>soft</code> para una acción visible pero secundaria, también sobre superficies de color o con imagen.",
    "button.prop.variant.ghost": "Usa <code>ghost</code> en barras o filas donde la caja sobra.",
    "button.prop.tone.title": "Tone: qué significa la acción",
    "button.prop.tone.body": "La intención de la acción, independiente de su énfasis.",
    "button.prop.tone.neutral": "Usa <code>neutral</code> para la mayoría de las acciones.",
    "button.prop.tone.accent": "Usa <code>accent</code> para la acción principal de una región, una por región.",
    "button.prop.tone.danger": "Usa <code>danger</code> para lo que destruye algo o es difícil de deshacer.",
    "button.prop.size.title": "Size: cuánto espacio ocupa",
    "button.prop.size.body": "Ajusta la altura y el ritmo del control al espacio disponible.",
    "button.prop.size.xs": "Usa <code>xs</code> solo dentro de otro patrón, como una fila de tabla.",
    "button.prop.size.sm": "Usa <code>sm</code> para acciones compactas en barras o filas.",
    "button.prop.size.md": "Usa <code>md</code> en formularios y diálogos.",
    "button.prop.size.lg": "Usa <code>lg</code> para la acción principal de una portada o un paso clave.",
    "button.guidelinesLede": "Un botón hace algo aquí; si lleva a otro lugar, es un enlace.",
    "button.dd.icon.title": "Ícono: añade texto si puede ser ambiguo",
    "button.dd.icon.do": "Ícono y texto: la persona reconoce la acción y la lee.",
    "button.dd.icon.dont": "Los puntos pueden significar más acciones, opciones o información: añade una etiqueta visible.",
    "button.dd.order.title": "Orden: deja la acción principal al final",
    "button.dd.order.do": "La acción secundaria va primero; la principal queda al final de la fila.",
    "button.dd.order.dont": "Invertir el orden hace más difícil encontrar la acción principal.",
    "button.test1": "Es un <code>&lt;button&gt;</code> nativo que no envía formularios por defecto.",
    "button.test2": "El estado deshabilitado llega al control nativo y a la tecnología de asistencia.",
    "button.test3": "Como enlace, renderiza con la apariencia de Button y los atributos del ancla.",
    "button.test4": "El enhancer da un <code>type</code> seguro a los botones escritos a mano, y montar dos veces es idempotente.",
    "button.test5": "Un botón solo-icono sin nombre accesible es rechazado por el enhancer.",
    "button.test6": "El tamaño <code>xs</code> viaja por el mismo <code>data-size</code> que los otros tres.",
    "button.test7":
      "Un nombre accesible escondido dentro del slot <code>post</code> es aceptado por React, igual que por la capa vanilla.",
    "button.test8":
      "El enhancer acepta el nombre puesto en un slot, no solo junto al icono: las dos capas exigen la misma regla.",
  },
  en: {
    "demo.button.ok": "OK",
    "demo.button.deleteForever": "Delete forever",
    "demo.button.saveDraft": "Save draft",
    "demo.button.saveChanges": "Save changes",
    "demo.button.action": "Action",
    "demo.button.save": "Save",
    "demo.button.cancel": "Cancel",
    "demo.button.delete": "Delete",
    "demo.button.confirmDelete": "Yes, delete",
    "demo.button.download": "Download",
    "demo.button.continue": "Continue",
    "demo.button.settings": "Settings",
    "demo.button.edit": "Edit",
    "demo.button.add": "Add",
    "demo.button.copy": "Copy",
    "demo.button.moreActions": "More actions",
    "demo.button.readNews": "Read the story",
    "demo.button.small": "Small",
    "demo.button.large": "Large",
    "demo.button.withIcon": "With icon",
    "demo.button.retry": "Retry",
    "demo.button.dismiss": "Dismiss",

    "button.description": "Runs an action on the page: submit, save, confirm or dismiss.",

    "button.a11yKeyTab": "Moves focus to the next or previous button.",

    "button.a11yKeySpace": "Activates the button. On a link, scrolls the page.",

    "button.a11yKeyEnter": "Activates the button or follows the link.",

    "button.a11yYours3": "The target must be at least 24px (WCAG 2.2, 2.5.8). Keep <code>xs</code> for controls inside another pattern.",

    "button.a11yYours2": "Do not use a disabled button as the only explanation of what is missing: say it beside the field.",

    "button.a11yYours1": "An icon-only button must have an <code>aria-label</code>.",

    "button.a11yDoes3": "The icon is decorative when there is text.",

    "button.a11yDoes2": "With <code>pressed</code>, it announces <code>aria-pressed</code>.",

    "button.a11yDoes1": "It renders a native <code>&lt;button&gt;</code>, or an <code>&lt;a&gt;</code> when given <code>href</code>.",

    "button.a11yIntro": "Button is a native control: focus, keyboard and role come from the platform.",

    "button.content4": "Do not name the control or its position: “Send request”, not “Send button”.",

    "button.content3": "On a destructive confirm, state the cost: “Delete forever”, not “OK”.",

    "button.content2": "Use 1 to 3 words, on one line, capitalizing only the first.",

    "button.content1": "Start with a verb: “Save changes”, not “Changes”.",

    "button.dd.cost.dont": "“OK” does not say what happens, and in red it only adds alarm.",

    "button.dd.cost.do": "“Delete forever” says what is lost before people press it.",

    "button.dd.cost.title": "Destructive confirm: state the cost",
    "button.dd.hardDelete.title": "Irreversible deletion: solid emphasis",
    "button.dd.hardDelete.do": "The final confirmation uses <code>solid</code> + <code>danger</code>: the action cannot go unnoticed.",
    "button.dd.hardDelete.dont": "<code>ghost</code> + <code>danger</code> is too quiet for confirming an irreversible deletion.",

    "button.dd.primary.dont": "Two <code>solid</code> + <code>accent</code> in the same row: if everything is the main action, nothing is.",

    "button.dd.primary.do": "One <code>accent</code> per region and the rest <code>neutral</code>: people see at once what to do.",

    "button.dd.primary.title": "Main action: one per region",

    "button.whenNot4": 'To report a status: use <a href="/components/badge">Badge</a> or <a href="/components/callout">Callout</a>.',

    "button.whenNot3": 'To mark the chosen option of a group: use <a href="/components/segmented">SegmentedControl</a> or <a href="/components/radio-group">RadioGroup</a>.',

    "button.whenNot2": 'For a secondary action inside a paragraph: use <a href="/components/link">Link</a>.',

    "button.whenNot1": 'To go to another page: use <code>Button.navigation</code> if it must look like a button, or <a href="/components/link">Link</a>.',

    "button.when3": "For a toggle that stays on, such as bold in a toolbar: use <code>pressed</code>.",

    "button.when2": "To confirm or dismiss a dialog.",

    "button.when1": "For an action that changes something on the page: save, submit, confirm.",

    "button.contract2": '<code>Button.navigation</code> renders an <code>&lt;a&gt;</code>: it takes no <code>tone="danger"</code>, because navigating destroys nothing.',

    "button.contract1": "With <code>pressed</code> it is a real toggle and announces <code>aria-pressed</code>. Leave it out when the button does not stay on.",

    "button.iconOnlyBody": "For actions recognized without text, such as settings. The name goes in <code>aria-label</code>.",
    "button.lede": "Button runs an action on the page: submitting a form, saving, confirming or dismissing. It is the native <code>&lt;button&gt;</code> with styling hooks; with <code>href</code>, the same look on a link.",
    "button.anatomyBody":
      "A button is a single box with reserved places: <code>sk-button__pre</code> before the label and <code>sk-button__post</code> after. The icon is one <code>sk-icon</code> (the same part in either slot). The specimen fills both so they can be named; the live examples start with the base button.",
    "button.anatomyLabel": "Button anatomy",
    "button.anatomyPreviewLabel": "Button, part by part",
    "button.defaultTitle": "The base button: no options",
    "button.defaultBody": "<code>solid</code>, <code>neutral</code> and <code>md</code> are the defaults. Add an option only when the context asks for it.",
    "button.variantsTitle": "Emphasis and tone: two independent decisions",
    "button.variantsBody": "<code>variant</code> says how strong it is and <code>tone</code> what it means, so every pairing exists. A button runs an action, so it has no <code>success</code> or <code>warning</code> tones.",
    "button.destructiveTitle": "Destructive action: the trigger and the confirm weigh differently",
    "button.destructiveBody": "<code>ghost</code> + <code>danger</code> is the trigger that lives in a row of actions; <code>solid</code> + <code>danger</code> confirms the deletion.",
    "button.appearanceTitle": "Appearance: how it is expressed",
    "button.appearanceBody": "The same button in <code>plain</code>, <code>tactile</code>, <code>brutalist</code> and <code>frosted</code>, without changing what it means or how strong it is. This page's appearance menu changes every other example.",
    "button.brutalistMatrixTitle": "Brutalist: every emphasis and tone",
    "button.brutalistMatrixBody": "<code>solid</code> uses the whole construction, <code>soft</code> a shorter shadow and <code>ghost</code> only ink.",
    "button.brutalistRadiusTitle": "Brutalist: not a radius",
    "button.brutalistRadiusBody": "The identity is in the border, the flat face and the hard shadow, not in the corners.",
    "button.brutalistStatesTitle": "Brutalist: states",
    "button.brutalistStatesBody": "<code>hover</code> lengthens the shadow, <code>:active</code> pushes the face into it and <code>disabled</code> dims the construction. Here they are frozen for comparison.",
    "button.brutalistShapesTitle": "Brutalist: shapes and hosts",
    "button.brutalistShapesBody": "Icon only, as a link and joined: the same construction in each shape.",
    "button.frostedTitle": "Frosted: a material, not a paint",
    "button.frostedBody": "The face lets what is behind show through, blurred. It is not <code>soft</code>: <code>soft</code> decides how much of the background shows; <code>frosted</code>, how it is processed.",
    "button.frostedMatrixTitle": "Frosted: every emphasis and tone",
    "button.frostedMatrixBody": "In <code>accent</code> and <code>danger</code> the face barely lets the background through, so the text keeps 4.5:1 on any photo.",
    "button.frostedDetailsTitle": "Frosted: radius, states and shapes",
    "button.frostedDetailsBody": "The material follows the radius. Without <code>backdrop-filter</code>, with reduced transparency or high contrast, it falls back to plain's opaque face.",
    "button.iconTitle": "With an icon: it anticipates the action",
    "button.iconBody": "The icon goes in the <code>pre</code> slot, before the text. An empty slot is not drawn.",
    "button.iconOnlyTitle": "Icon only: with an accessible name",
    "button.linkTitle": "As a link: with <code>href</code>, the same look on an <code>&lt;a&gt;</code>",
    "button.linkBody": "When the action goes to another page, the component renders a link. A link cannot be disabled: it renders the content unlinked instead.",
    "button.tileTitle": "TileButton: the whole surface is the action",
    "button.tileBody": "When the action takes a whole card, not just a line of text inside it.",
    "button.vanillaInitTitle": "Initialize vanilla",
    "button.iconsComment":
      "Icons are authored as <span data-sk-icon> placeholders;\nmountIcons replaces them with the <svg> of the linked set.",
    "button.prop.variant.title": "Variant: how strong it looks",
    "button.prop.variant.body": "The button's emphasis against the ones around it.",
    "button.prop.variant.solid": "Use <code>solid</code> for the primary action or a confirmation.",
    "button.prop.variant.soft": "Use <code>soft</code> for an action that is visible but secondary, on coloured or image surfaces too.",
    "button.prop.variant.ghost": "Use <code>ghost</code> in bars or rows where the box is noise.",
    "button.prop.tone.title": "Tone: what the action means",
    "button.prop.tone.body": "The action's intent, independent of its emphasis.",
    "button.prop.tone.neutral": "Use <code>neutral</code> for most actions.",
    "button.prop.tone.accent": "Use <code>accent</code> for a region's main action, one per region.",
    "button.prop.tone.danger": "Use <code>danger</code> for what destroys something or is hard to undo.",
    "button.prop.size.title": "Size: how much room it takes",
    "button.prop.size.body": "Fits the control's height and rhythm to the space available.",
    "button.prop.size.xs": "Use <code>xs</code> only inside another pattern, such as a table row.",
    "button.prop.size.sm": "Use <code>sm</code> for compact actions in bars or rows.",
    "button.prop.size.md": "Use <code>md</code> in forms and dialogs.",
    "button.prop.size.lg": "Use <code>lg</code> for the main action of a landing page or a key step.",
    "button.guidelinesLede": "A button does something here; if it takes you somewhere else, it is a link.",
    "button.dd.icon.title": "Icon: add a label when its meaning can vary",
    "button.dd.icon.do": "Icon and text: people recognize the action and read it.",
    "button.dd.icon.dont": "An ellipsis can mean more actions, options, or details: add a visible label.",
    "button.dd.order.title": "Order: put the main action last",
    "button.dd.order.do": "The secondary action comes first; the main action ends the row.",
    "button.dd.order.dont": "Reversing the order makes the main action harder to find.",
    "button.test1": "Is a native <code>&lt;button&gt;</code> that does not submit forms by default.",
    "button.test2": "Disabled state reaches both the native control and assistive technology.",
    "button.test3": "As a link, renders with Button's appearance and the anchor's attributes.",
    "button.test4": "The enhancer gives authored buttons a safe <code>type</code>, and mounting twice is idempotent.",
    "button.test5": "An icon-only button with no accessible name is refused by the enhancer.",
    "button.test6": "The <code>xs</code> size travels on the same <code>data-size</code> as the other three.",
    "button.test7":
      "An accessible name hidden inside the <code>post</code> slot is accepted by React, as it already was by the vanilla layer.",
    "button.test8":
      "The enhancer accepts a name placed in a slot, not only beside the icon: both layers enforce the same rule.",
  },
} as const;
