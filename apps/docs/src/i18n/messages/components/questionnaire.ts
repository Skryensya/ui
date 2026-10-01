export const questionnaireMessages = {
  es: {
    "questionnairePage.anatomyLabel": "Anatomía de Questionnaire",
    "questionnairePage.anatomyPreviewLabel": "Questionnaire, parte por parte",
    "questionnairePage.anatomyBody": "Una sola pregunta, para que todas las partes visibles estén en pantalla a la vez: la máquina muestra un ítem por vez. Es obligatoria, así que Omitir y Anterior no tienen por qué aparecer y las acciones son solo Siguiente.",
    "demo.questionnaire.label": "Encuesta de producto",
    "demo.questionnaire.previous": "Anterior",
    "demo.questionnaire.next": "Siguiente",
    "demo.questionnaire.skip": "Omitir",
    "demo.questionnaire.submit": "Enviar",
    "demo.questionnaire.position": "Pregunta {current} de {total}",
    "demo.questionnaire.progress": "Progreso de la encuesta",
    "demo.questionnaire.error": "Elige una respuesta para continuar.",
    "demo.questionnaire.skippableError": "Elige una respuesta u omite esta pregunta.",
    "demo.questionnaire.direction.title": "¿Qué deberíamos prototipar ahora?",
    "demo.questionnaire.direction.description": "Elige una dirección o escribe la tuya.",
    "demo.questionnaire.direction.step": "Dirección",
    "demo.questionnaire.direction.delegation": "Delegación",
    "demo.questionnaire.direction.delegationDescription": "El agente actúa y luego informa.",
    "demo.questionnaire.direction.questions": "Preguntas",
    "demo.questionnaire.direction.questionsDescription": "El agente pregunta antes de actuar.",
    "demo.questionnaire.direction.both": "Ambas",
    "demo.questionnaire.direction.other": "Otra respuesta",
    "demo.questionnaire.direction.otherPlaceholder": "Escribe otra respuesta…",
    "demo.questionnaire.channels.title": "¿Dónde quieres recibir novedades?",
    "demo.questionnaire.channels.description": "Puedes elegir varias.",
    "demo.questionnaire.channels.step": "Canales",
    "demo.questionnaire.channels.email": "Correo",
    "demo.questionnaire.channels.sms": "SMS",
    "demo.questionnaire.channels.smsDescription": "Pronto.",
    "demo.questionnaire.channels.push": "Notificaciones push",
    "demo.questionnaire.notes.title": "¿Algo más que debamos saber?",
    "demo.questionnaire.notes.step": "Comentarios",
    "demo.questionnaire.notes.label": "Comentarios",
    "demo.questionnaire.notes.placeholder": "Opcional",
    /* The Likert demo's own words: the scale is part of the questionnaire now, so its copy lives here. */
    "demo.likert.min": "Nada de acuerdo",
    "demo.likert.max": "Totalmente de acuerdo",
    "demo.likert.one": "1",
    "demo.likert.two": "2",
    "demo.likert.three": "3",
    "demo.likert.four": "4",
    "demo.likert.five": "5",

    "questionnairePage.description": "Hace preguntas de una en una, valida antes de avanzar y muestra cuánto falta.",

    "questionnairePage.key.letter": "Con atajos, elige la opción de esa letra.",

    "questionnairePage.key.arrows": "Recorre las respuestas.",

    "questionnairePage.key.modEnter": "Avanza desde cualquier control.",

    "questionnairePage.key.enter": "Con una respuesta elegida, avanza.",

    "questionnairePage.a11yYours2": "Deja volver atrás: la persona puede querer cambiar una respuesta.",

    "questionnairePage.a11yYours1": "Dale un título al cuestionario y di cuánto dura antes de empezar.",

    "questionnairePage.a11yDoes3": "El avance se anuncia con su texto: «Pregunta 2 de 3».",

    "questionnairePage.a11yDoes2": 'Un error aparece después del intento, como <code>role="alert"</code>, y el foco vuelve a la respuesta.',

    "questionnairePage.a11yDoes1": "Al avanzar, el foco va a la pregunta nueva.",

    "questionnairePage.a11yIntro": "Questionnaire es un formulario nativo que se muestra por partes.",

    "questionnairePage.content3": "Marca lo opcional, no lo obligatorio: «(opcional)».",

    "questionnairePage.content2": "Escribe las opciones con la misma forma y sin solaparse: «1 a 5», «6 a 20», «Más de 20».",

    "questionnairePage.content1": "Escribe cada pregunta como pregunta, con su signo: «¿Cuántas personas hay en tu equipo?».",

    "questionnairePage.whenNot2": 'Para un flujo con pasos que agrupan varios campos: usa <a href="/es/componentes/steps">Steps</a>.',

    "questionnairePage.whenNot1": 'Para un formulario corto que se llena de una vez: usa <a href="/es/componentes/form-field">FormField</a> en una sola vista.',

    "questionnairePage.when2": "Cuando las preguntas siguientes dependen de las respuestas.",

    "questionnairePage.when1": "Para una encuesta, un diagnóstico o una configuración donde cada pregunta merece atención.",

    "questionnairePage.contract4": "Sin JavaScript, muestra todas las preguntas y un botón Enviar.",

    "questionnairePage.contract3": "El alto no cambia al avanzar: los botones no se mueven bajo el cursor.",

    "questionnairePage.contract2": "El estado vive en <code>createQuestionnaireStore</code>, de <code>@skryensya/core/questionnaire</code>.",

    "questionnairePage.contract1": "Las opciones son Tile, los campos FormField, los botones Button y el avance Progress o Steps.",

    "questionnairePage.basicBody": "Cada pregunta ocupa toda la vista; la opción «Otra» abre un campo de texto.",

    "questionnairePage.basicTitle": "Una encuesta: opciones y otra respuesta",

    "questionnairePage.prop.progress.segments": "Usa <code>segments</code> para una barra partida en preguntas, sin nombres.",

    "questionnairePage.prop.progress.steps": "Usa <code>steps</code> cuando cada pregunta tiene un nombre que conviene ver.",

    "questionnairePage.prop.progress.bar": "Usa <code>bar</code> para un recorrido largo sin nombres de etapa.",

    "questionnairePage.prop.progress.text": "Usa <code>text</code>, el valor por defecto, para pocas preguntas: «Pregunta 2 de 3».",

    "questionnairePage.prop.progress.body": "Cómo dice cuánto falta.",

    "questionnairePage.prop.progress.title": "Progress: cómo se ve el avance",
    "questionnairePage.lede": "Questionnaire hace preguntas de una en una: una encuesta, un diagnóstico, la configuración inicial de una cuenta. Valida antes de avanzar, deja omitir lo opcional, puede ramificarse según las respuestas y muestra cuánto falta. Sin JavaScript es un formulario largo que funciona.",
    "questionnairePage.keyboardTitle": "Atajos: una letra por opción",
    "questionnairePage.keyboardBody": 'Con <code>shortcuts="letters"</code>, cada opción muestra su letra y se elige con ella.',
    "questionnairePage.choicesOnlyTitle": "Solo opciones: sin otra respuesta",
    "questionnairePage.choicesOnlyBody": "Sin <code>data-text</code>, se elige solo entre las opciones.",
    "questionnairePage.likertTitle": "Likert: de acuerdo a en desacuerdo",
    "questionnairePage.likertBody": "La misma pregunta de una opción, puesta de lado: cada punto de la escala es una columna.",
    "questionnairePage.branchTitle": "Ramas: la siguiente depende de la respuesta",
    "questionnairePage.branchBody": "<code>data-show-when-item</code> nombra la pregunta que decide y <code>data-show-when-any</code> las respuestas que la abren.",
    "demo.questionnaire.choicesOnly.label": "Preferencias",
    "demo.questionnaire.choicesOnly.step": "Herramienta",
    "demo.questionnaire.choicesOnly.title": "¿Qué prefieres prototipar?",
    "demo.questionnaire.choicesOnly.design": "Diseño",
    "demo.questionnaire.choicesOnly.code": "Código",
    "demo.questionnaire.choicesOnly.both": "Ambos",
    "demo.questionnaire.likert.label": "Claridad",
    "demo.questionnaire.likert.step": "Claridad",
    "demo.questionnaire.likert.title": "Las preguntas se entienden al primer intento",
    "demo.questionnaire.control.label": "Datos",
    "demo.questionnaire.control.countryTitle": "¿Desde dónde nos escribes?",
    "demo.questionnaire.control.countryLabel": "País",
    "demo.questionnaire.control.fileTitle": "¿Nos dejas tu CV?",
    "demo.questionnaire.control.fileLabel": "Archivo",
    "demo.questionnaire.control.fileDropzone": "Arrastra el archivo o elígelo",
    "demo.questionnaire.control.fileTrigger": "Elegir archivo",
    "questionnairePage.railTitle": "Rail: el avance al costado",
    "questionnairePage.railBody": '<code>progressOrientation="vertical"</code> pone las etapas a la izquierda, para un recorrido largo.',
    "questionnairePage.controlTitle": "Cualquier control: un Select, un archivo",
    "questionnairePage.controlBody": "El slot <code>control</code> recibe cualquier control del kit, como un Select para una lista larga.",
    "demo.questionnaire.followUp.label": "Hogar",
    "demo.questionnaire.followUp.aloneTitle": "¿Vives con otras personas?",
    "demo.questionnaire.followUp.shared": "Sí, con otras personas",
    "demo.questionnaire.followUp.alone": "No, vivo solo",
    "demo.questionnaire.followUp.sizeTitle": "¿Cuántas personas son en total?",
    "demo.questionnaire.followUp.sizeBody": "Contándote a ti.",
    "demo.questionnaire.followUp.sizeMany": "5 o más",
    "demo.questionnaire.followUp.tenureTitle": "¿Hace cuánto vives ahí?",
    "demo.questionnaire.followUp.tenureShort": "Menos de un año",
    "demo.questionnaire.followUp.tenureMid": "Entre uno y cinco años",
    "demo.questionnaire.followUp.tenureLong": "Más de cinco años",
    "questionnairePage.followUpTitle": "Seguimiento: una pregunta más",
    "questionnairePage.followUpBody": "La misma regla agrega una pregunta al camino, por ejemplo «¿Qué falló?» después de una nota baja.",
    "demo.questionnaire.branch.label": "Beta",
    "demo.questionnaire.branch.betaStep": "Beta",
    "demo.questionnaire.branch.betaTitle": "¿Quieres acceso anticipado?",
    "demo.questionnaire.branch.yes": "Sí",
    "demo.questionnaire.branch.no": "No",
    "demo.questionnaire.branch.channelsStep": "Canales",
    "demo.questionnaire.branch.channelsTitle": "¿Por dónde te avisamos?",
    "demo.questionnaire.branch.whyNotStep": "Motivo",
    "demo.questionnaire.branch.whyNotTitle": "¿Qué te frena?",
    "demo.questionnaire.branch.whyNotTiming": "No es buen momento",
    "demo.questionnaire.branch.whyNotNeed": "No lo necesito",
    "demo.questionnaire.branch.closingStep": "Contacto",
    "demo.questionnaire.branch.closingTitle": "¿A qué correo te escribimos?",
    "demo.questionnaire.branch.closingLabel": "Correo",
    "demo.questionnaire.branch.closingPlaceholder": "tu@correo.com",
    "questionnairePage.guidelinesLede": "Una pregunta por vista pide toda la atención, a cambio de no ver el formulario completo.",
  },
  en: {
    "questionnairePage.anatomyLabel": "Questionnaire anatomy",
    "questionnairePage.anatomyPreviewLabel": "Questionnaire, part by part",
    "questionnairePage.anatomyBody": "A single question, so every visible part is on screen at once: the machine shows one item at a time. It is required, so Skip and Previous have no reason to appear and the actions are Next alone.",
    "demo.questionnaire.label": "Product survey",
    "demo.questionnaire.previous": "Previous",
    "demo.questionnaire.next": "Next",
    "demo.questionnaire.skip": "Skip",
    "demo.questionnaire.submit": "Submit",
    "demo.questionnaire.position": "Question {current} of {total}",
    "demo.questionnaire.progress": "Survey progress",
    "demo.questionnaire.error": "Choose an answer to continue.",
    "demo.questionnaire.skippableError": "Choose an answer or skip this question.",
    "demo.questionnaire.direction.title": "What should we prototype next?",
    "demo.questionnaire.direction.description": "Choose a direction or write your own.",
    "demo.questionnaire.direction.step": "Direction",
    "demo.questionnaire.direction.delegation": "Delegation",
    "demo.questionnaire.direction.delegationDescription": "The agent acts, then reports.",
    "demo.questionnaire.direction.questions": "Questions",
    "demo.questionnaire.direction.questionsDescription": "The agent asks before acting.",
    "demo.questionnaire.direction.both": "Both",
    "demo.questionnaire.direction.other": "Another answer",
    "demo.questionnaire.direction.otherPlaceholder": "Type another answer…",
    "demo.questionnaire.channels.title": "Where should we send updates?",
    "demo.questionnaire.channels.description": "Pick as many as you like.",
    "demo.questionnaire.channels.step": "Channels",
    "demo.questionnaire.channels.email": "Email",
    "demo.questionnaire.channels.sms": "SMS",
    "demo.questionnaire.channels.smsDescription": "Coming soon.",
    "demo.questionnaire.channels.push": "Push notifications",
    "demo.questionnaire.notes.title": "Anything else we should know?",
    "demo.questionnaire.notes.step": "Notes",
    "demo.questionnaire.notes.label": "Notes",
    "demo.questionnaire.notes.placeholder": "Optional",
    /* The Likert demo's own words: the scale is part of the questionnaire now, so its copy lives here. */
    "demo.likert.min": "Strongly disagree",
    "demo.likert.max": "Strongly agree",
    "demo.likert.one": "1",
    "demo.likert.two": "2",
    "demo.likert.three": "3",
    "demo.likert.four": "4",
    "demo.likert.five": "5",

    "questionnairePage.description": "Asks questions one at a time, validates before moving on and shows how much is left.",

    "questionnairePage.key.letter": "With shortcuts, chooses that letter's option.",

    "questionnairePage.key.arrows": "Moves through the answers.",

    "questionnairePage.key.modEnter": "Moves on from any control.",

    "questionnairePage.key.enter": "With an answer chosen, moves on.",

    "questionnairePage.a11yYours2": "Allow going back: people may want to change an answer.",

    "questionnairePage.a11yYours1": "Give the questionnaire a title and say how long it takes before starting.",

    "questionnairePage.a11yDoes3": "Progress is announced as text: “Question 2 of 3”.",

    "questionnairePage.a11yDoes2": 'An error appears after the attempt, as <code>role="alert"</code>, and focus returns to the answer.',

    "questionnairePage.a11yDoes1": "On advancing, focus goes to the new question.",

    "questionnairePage.a11yIntro": "Questionnaire is a native form shown in parts.",

    "questionnairePage.content3": "Mark what is optional, not what is required: “(optional)”.",

    "questionnairePage.content2": "Write options in the same shape and without overlap: “1 to 5”, “6 to 20”, “More than 20”.",

    "questionnairePage.content1": "Write each question as a question: “How many people are on your team?”.",

    "questionnairePage.whenNot2": 'For a flow whose steps group several fields: use <a href="/components/steps">Steps</a>.',

    "questionnairePage.whenNot1": 'For a short form filled in at once: use <a href="/components/form-field">FormField</a> in a single view.',

    "questionnairePage.when2": "When later questions depend on the answers.",

    "questionnairePage.when1": "For a survey, diagnosis or setup where each question deserves attention.",

    "questionnairePage.contract4": "Without JavaScript, it shows every question and a Submit button.",

    "questionnairePage.contract3": "Height does not change when advancing: the buttons do not move under the cursor.",

    "questionnairePage.contract2": "The state lives in <code>createQuestionnaireStore</code>, from <code>@skryensya/core/questionnaire</code>.",

    "questionnairePage.contract1": "Options are Tile, fields FormField, buttons Button and progress Progress or Steps.",

    "questionnairePage.basicBody": "Each question takes the whole view; the “Other” option opens a text field.",

    "questionnairePage.basicTitle": "A survey: options and another answer",

    "questionnairePage.prop.progress.segments": "Use <code>segments</code> for a bar split into questions, with no names.",

    "questionnairePage.prop.progress.steps": "Use <code>steps</code> when each question has a name worth seeing.",

    "questionnairePage.prop.progress.bar": "Use <code>bar</code> for a long path with no stage names.",

    "questionnairePage.prop.progress.text": "Use <code>text</code>, the default, for a few questions: “Question 2 of 3”.",

    "questionnairePage.prop.progress.body": "How it says how much is left.",

    "questionnairePage.prop.progress.title": "Progress: how advancement looks",
    "questionnairePage.lede": "Questionnaire asks questions one at a time: a survey, a diagnosis, an account's initial setup. It validates before moving on, lets optional ones be skipped, can branch on answers and shows how much is left. Without JavaScript it is a long form that works.",
    "questionnairePage.keyboardTitle": "Shortcuts: one letter per option",
    "questionnairePage.keyboardBody": 'With <code>shortcuts="letters"</code>, each option shows its letter and is chosen with it.',
    "questionnairePage.choicesOnlyTitle": "Options only: no other answer",
    "questionnairePage.choicesOnlyBody": "Without <code>data-text</code>, the choice is only among the options.",
    "questionnairePage.likertTitle": "Likert: agree to disagree",
    "questionnairePage.likertBody": "The same single-choice question, laid sideways: each point of the scale is a column.",
    "questionnairePage.branchTitle": "Branches: the next depends on the answer",
    "questionnairePage.branchBody": "<code>data-show-when-item</code> names the deciding question and <code>data-show-when-any</code> the answers that open it.",
    "demo.questionnaire.choicesOnly.label": "Preferences",
    "demo.questionnaire.choicesOnly.step": "Tooling",
    "demo.questionnaire.choicesOnly.title": "What do you prefer to prototype?",
    "demo.questionnaire.choicesOnly.design": "Design",
    "demo.questionnaire.choicesOnly.code": "Code",
    "demo.questionnaire.choicesOnly.both": "Both",
    "demo.questionnaire.likert.label": "Clarity",
    "demo.questionnaire.likert.step": "Clarity",
    "demo.questionnaire.likert.title": "The questions are clear on first read",
    "demo.questionnaire.control.label": "Details",
    "demo.questionnaire.control.countryTitle": "Where are you writing from?",
    "demo.questionnaire.control.countryLabel": "Country",
    "demo.questionnaire.control.fileTitle": "Care to leave your CV?",
    "demo.questionnaire.control.fileLabel": "File",
    "demo.questionnaire.control.fileDropzone": "Drop the file or pick one",
    "demo.questionnaire.control.fileTrigger": "Choose file",
    "questionnairePage.railTitle": "Rail: progress on the side",
    "questionnairePage.railBody": '<code>progressOrientation="vertical"</code> puts the stages on the left, for a long path.',
    "questionnairePage.controlTitle": "Any control: a Select, a file",
    "questionnairePage.controlBody": "The <code>control</code> slot takes any kit control, like a Select for a long list.",
    "demo.questionnaire.followUp.label": "Household",
    "demo.questionnaire.followUp.aloneTitle": "Do you live with other people?",
    "demo.questionnaire.followUp.shared": "Yes, with others",
    "demo.questionnaire.followUp.alone": "No, I live alone",
    "demo.questionnaire.followUp.sizeTitle": "How many of you are there?",
    "demo.questionnaire.followUp.sizeBody": "Counting yourself.",
    "demo.questionnaire.followUp.sizeMany": "5 or more",
    "demo.questionnaire.followUp.tenureTitle": "How long have you lived there?",
    "demo.questionnaire.followUp.tenureShort": "Under a year",
    "demo.questionnaire.followUp.tenureMid": "One to five years",
    "demo.questionnaire.followUp.tenureLong": "Over five years",
    "questionnairePage.followUpTitle": "Follow-up: one more question",
    "questionnairePage.followUpBody": "The same rule adds a question to the path, for example “What went wrong?” after a low score.",
    "demo.questionnaire.branch.label": "Beta",
    "demo.questionnaire.branch.betaStep": "Beta",
    "demo.questionnaire.branch.betaTitle": "Want early access?",
    "demo.questionnaire.branch.yes": "Yes",
    "demo.questionnaire.branch.no": "No",
    "demo.questionnaire.branch.channelsStep": "Channels",
    "demo.questionnaire.branch.channelsTitle": "How should we reach you?",
    "demo.questionnaire.branch.whyNotStep": "Reason",
    "demo.questionnaire.branch.whyNotTitle": "What is holding you back?",
    "demo.questionnaire.branch.whyNotTiming": "Bad timing",
    "demo.questionnaire.branch.whyNotNeed": "Do not need it",
    "demo.questionnaire.branch.closingStep": "Contact",
    "demo.questionnaire.branch.closingTitle": "Where should we write?",
    "demo.questionnaire.branch.closingLabel": "Email",
    "demo.questionnaire.branch.closingPlaceholder": "you@example.com",
    "questionnairePage.guidelinesLede": "One question per view asks for full attention, at the cost of not seeing the whole form.",
  },
} as const;
