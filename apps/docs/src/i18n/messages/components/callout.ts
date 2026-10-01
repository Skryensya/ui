export const calloutMessages = {
  es: {
    "demo.callout.gotIt": "Entendido",

    "demo.callout.neutral.title": "Mantenimiento programado",
    "demo.callout.neutral.body":
      "El domingo de 02:00 a 04:00 UTC el panel estará en solo lectura.",
    "demo.callout.info.title": "Nueva versión",
    "demo.callout.info.body": "Una actualización está disponible.",
    "demo.callout.warning.title": "Tu plan expira en 3 días",
    "demo.callout.warning.body":
      "Elige un plan para no interrumpir los despliegues.",
    "demo.callout.warning.action": "Ver planes",
    "demo.callout.success.body": "Tus cambios se guardaron.",
    "demo.callout.success.action": "Ver detalle",

    "callout.description": "Deja un mensaje en la página mientras dure lo que avisa: un error, una advertencia, una confirmación o una nota.",

    "callout.a11yYours3": "Si el mensaje aparece después de cargar la página, muéstralo en un lugar donde la persona lo encuentre: cerca de lo que lo causó.",

    "callout.a11yYours2": "El texto debe decir qué tipo de mensaje es; el color solo lo refuerza (WCAG 2.2, 1.4.1).",

    "callout.a11yYours1": "Usa <code>danger</code> solo para lo que debe interrumpir.",

    "callout.a11yDoes3": "No roba el foco.",

    "callout.a11yDoes2": "El ícono es decorativo.",

    "callout.a11yDoes1": 'Con <code>danger</code> es <code>role="alert"</code> y se anuncia de inmediato; con el resto es <code>role="status"</code> y se anuncia cuando el lector termina.',

    "callout.a11yIntro": "Callout es una región viva: se anuncia sin mover el foco.",

    "callout.content4": "No uses «Error» ni «Atención» como título: el tono ya lo dice.",

    "callout.content3": "Escribe la acción con un verbo que resuelve: «Ver planes», «Reintentar».",

    "callout.content2": "Di en la descripción qué pasa y qué puede hacer la persona, en 1 o 2 oraciones.",

    "callout.content1": "Nombra la condición en el título, en pocas palabras: «Tu plan expira en 3 días».",

    "callout.dd.tone.dont": "<code>danger</code> interrumpe al lector de pantalla y alarma por algo que todavía no es un error.",

    "callout.dd.tone.do": "Un plan que vence pronto pide atención: <code>warning</code>.",

    "callout.dd.tone.title": "Tone: según lo que pasó",

    "callout.whenNot4": 'Para un estado corto junto a un elemento: usa <a href="/es/componentes/badge">Badge</a>.',

    "callout.whenNot3": 'Para el error de un campo: usa el mensaje de <a href="/es/componentes/form-field">FormField</a>, junto al campo.',

    "callout.whenNot2": 'Si la región está vacía por falta de datos: usa <a href="/es/componentes/empty-state">EmptyState</a>.',

    "callout.whenNot1": 'Si el mensaje se va solo o se puede descartar: usa <a href="/es/componentes/toast">Toast</a>.',

    "callout.when2": "Para una nota al margen que la persona no debería pasar por alto.",

    "callout.when1": "Para un error, una advertencia o una confirmación que debe quedar a la vista.",

    "callout.contract3": "<code>actions</code> es el único punto interactivo: un <code>Link</code>, o un <code>Button</code> <code>soft</code> o <code>danger</code>.",

    "callout.contract2": "No hay cierre ni <code>onDismiss</code>: un mensaje que se descarta es un Toast.",

    "callout.contract1": 'Solo <code>danger</code> se anuncia como <code>role="alert"</code>; el resto es <code>role="status"</code>.',
    "callout.lede1": 'Callout deja un mensaje en la página mientras dure lo que avisa: un error, una advertencia, una confirmación o una nota. Vive en el flujo del contenido y no se cierra; si el mensaje debe irse solo, es un <a href="/es/componentes/toast">Toast</a>.',
    "callout.anatomyBody": "El ícono a un lado, el contenido (título y descripción) al otro, y las acciones en su propia fila debajo. Solo el contenido es obligatorio.",
    "callout.anatomyLabel": "Anatomía de Callout",
    "callout.anatomyPreviewLabel": "Callout, parte por parte",
    "callout.neutralTitle": "Neutral: el texto carga el mensaje",
    "callout.neutralBody": "Superficie y borde, sin color semántico, para avisos donde el color agregaría una urgencia que el contenido no tiene.",
    "callout.infoTitle": "Con título: nombra la condición",
    "callout.infoBody": "Un título junto al ícono nombra lo que pasa en vez de solo describirlo.",
    "callout.warningTitle": "Con un enlace: la ruta para resolverlo",
    "callout.warningBody": "La acción es un <code>Link</code>: lleva adonde se resuelve.",
    "callout.successTitle": "Con un botón: soft o danger, nunca accent",
    "callout.successBody": "Un callout no es el lugar de la acción principal de la página, así que el botón es <code>soft</code>, o <code>danger</code> si destruye algo.",
    "callout.prop.tone.title": "Tone: qué tipo de mensaje es",
    "callout.prop.tone.body": "El tono dice qué pasó, y decide cómo se anuncia.",
    "callout.prop.tone.neutral": "Usa <code>neutral</code> para avisos comunes sin color semántico.",
    "callout.prop.tone.info": "Usa <code>info</code> para contexto nuevo o adicional.",
    "callout.prop.tone.success": "Usa <code>success</code> para confirmar que algo terminó bien.",
    "callout.prop.tone.warning": "Usa <code>warning</code> para una condición que necesita atención.",
    "callout.prop.tone.danger": "Usa <code>danger</code> para errores que deben anunciarse de inmediato: es el único que interrumpe al lector de pantalla.",
    "callout.guidelinesLede": "Un callout avisa algo que sigue siendo cierto mientras la persona está en la página.",
    "callout.dd.persistence.title": "Duración: lo que sigue siendo cierto",
    "callout.dd.persistence.do": "La nueva versión sigue disponible hasta que actualices: el aviso se queda.",
    "callout.dd.persistence.dont": "«Tus cambios se guardaron» deja de importar en segundos: eso es un Toast.",
    "callout.dd.recovery.title": "Acción: solo si el aviso pide una",
    "callout.dd.recovery.do": "El plan expira, y «Ver planes» lleva a resolverlo.",
    "callout.dd.recovery.dont": "«Entendido» no resuelve nada: si el aviso no pide una acción, no agregues un botón.",
    "callout.test1": 'El tono danger se anuncia asertivo (<code>role="alert"</code>); los demás, con cortesía.',
    "callout.test2": "Nunca renderiza un control para cerrarlo: no es dismissible.",
    "callout.test3": "El icono y las acciones opcionales se renderizan como partes explícitas.",
  },
  en: {
    "demo.callout.gotIt": "Got it",

    "demo.callout.neutral.title": "Scheduled maintenance",
    "demo.callout.neutral.body":
      "On Sunday from 02:00 to 04:00 UTC the panel will be read-only.",
    "demo.callout.info.title": "New version",
    "demo.callout.info.body": "An update is available.",
    "demo.callout.warning.title": "Your plan expires in 3 days",
    "demo.callout.warning.body":
      "Choose a plan so your deployments are not interrupted.",
    "demo.callout.warning.action": "View plans",
    "demo.callout.success.body": "Your changes have been saved.",
    "demo.callout.success.action": "View details",

    "callout.description": "Keeps a message on the page for as long as what it reports holds: an error, a warning, a confirmation or a note.",

    "callout.a11yYours3": "If the message appears after the page loads, show it where people will find it: near what caused it.",

    "callout.a11yYours2": "The text must say what kind of message it is; color only reinforces it (WCAG 2.2, 1.4.1).",

    "callout.a11yYours1": "Use <code>danger</code> only for what must interrupt.",

    "callout.a11yDoes3": "It does not take focus.",

    "callout.a11yDoes2": "The icon is decorative.",

    "callout.a11yDoes1": 'With <code>danger</code> it is <code>role="alert"</code> and announced at once; with the rest it is <code>role="status"</code> and announced when the reader finishes.',

    "callout.a11yIntro": "Callout is a live region: it is announced without moving focus.",

    "callout.content4": "Do not use “Error” or “Attention” as a title: the tone already says it.",

    "callout.content3": "Write the action with a verb that resolves it: “See plans”, “Try again”.",

    "callout.content2": "Say in the description what is happening and what people can do, in 1 or 2 sentences.",

    "callout.content1": "Name the condition in the title, in a few words: “Your plan expires in 3 days”.",

    "callout.dd.tone.dont": "<code>danger</code> interrupts the screen reader and raises alarm over something that is not an error yet.",

    "callout.dd.tone.do": "A plan expiring soon asks for attention: <code>warning</code>.",

    "callout.dd.tone.title": "Tone: by what happened",

    "callout.whenNot4": 'For a short status beside an element: use <a href="/components/badge">Badge</a>.',

    "callout.whenNot3": 'For a field\'s error: use <a href="/components/form-field">FormField</a>\'s message, beside the field.',

    "callout.whenNot2": 'If the region is empty for lack of data: use <a href="/components/empty-state">EmptyState</a>.',

    "callout.whenNot1": 'If the message goes away on its own or can be dismissed: use <a href="/components/toast">Toast</a>.',

    "callout.when2": "For a side note people should not miss.",

    "callout.when1": "For an error, a warning or a confirmation that must stay in view.",

    "callout.contract3": "<code>actions</code> is the only interactive point: a <code>Link</code>, or a <code>soft</code> or <code>danger</code> <code>Button</code>.",

    "callout.contract2": "There is no close button and no <code>onDismiss</code>: a message that is dismissed is a Toast.",

    "callout.contract1": 'Only <code>danger</code> is announced as <code>role="alert"</code>; the rest are <code>role="status"</code>.',
    "callout.lede1": 'Callout keeps a message on the page for as long as what it reports holds: an error, a warning, a confirmation or a note. It lives in the flow of the content and does not close; if the message should go away on its own, it is a <a href="/components/toast">Toast</a>.',
    "callout.anatomyBody": "The icon on one side, the content (title and description) on the other, and the actions on their own row below. Only the content is required.",
    "callout.anatomyLabel": "Callout anatomy",
    "callout.anatomyPreviewLabel": "Callout, part by part",
    "callout.neutralTitle": "Neutral: the text carries the message",
    "callout.neutralBody": "A surface and a border, with no semantic color, for notices where color would add urgency the content does not have.",
    "callout.infoTitle": "With a title: name the condition",
    "callout.infoBody": "A title beside the icon names what is happening instead of only describing it.",
    "callout.warningTitle": "With a link: the way to resolve it",
    "callout.warningBody": "The action is a <code>Link</code>: it leads to where it gets resolved.",
    "callout.successTitle": "With a button: soft or danger, never accent",
    "callout.successBody": "A callout is not where the page's main action lives, so the button is <code>soft</code>, or <code>danger</code> if it destroys something.",
    "callout.prop.tone.title": "Tone: what kind of message it is",
    "callout.prop.tone.body": "The tone says what happened, and decides how it is announced.",
    "callout.prop.tone.neutral": "Use <code>neutral</code> for ordinary notices without semantic color.",
    "callout.prop.tone.info": "Use <code>info</code> for new or additional context.",
    "callout.prop.tone.success": "Use <code>success</code> to confirm that something completed.",
    "callout.prop.tone.warning": "Use <code>warning</code> for a condition that needs attention.",
    "callout.prop.tone.danger": "Use <code>danger</code> for errors that must be announced at once: it is the only tone that interrupts a screen reader.",
    "callout.guidelinesLede": "A callout reports something that stays true while people are on the page.",
    "callout.dd.persistence.title": "Duration: what stays true",
    "callout.dd.persistence.do": "The new version stays available until you update: the notice stays.",
    "callout.dd.persistence.dont": "“Your changes were saved” stops mattering within seconds: that is a Toast.",
    "callout.dd.recovery.title": "Action: only if the notice asks for one",
    "callout.dd.recovery.do": "The plan is expiring, and “See plans” leads to resolving it.",
    "callout.dd.recovery.dont": "“Got it” resolves nothing: if the notice asks for no action, do not add a button.",
    "callout.test1": 'The danger tone announces assertively (<code>role="alert"</code>); every other tone, politely.',
    "callout.test2": "Never renders a dismiss control: it is not dismissible.",
    "callout.test3": "The icon and optional actions render as explicit parts.",
  },
} as const;
