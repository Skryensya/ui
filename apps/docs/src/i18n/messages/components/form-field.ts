export const formFieldMessages = {
  es: {
    "demo.formField.hint": "Solo la usamos para las boletas.",
    "demo.formField.error": "Ingresa una dirección laboral.",
    "demo.formField.planHint": "Lo vas a poder cambiar después.",

    "formFieldPage.description": "Pone la etiqueta, la ayuda y el error alrededor de un control, y los conecta.",

    "formFieldPage.a11yYours2": "Con <code>labelHidden</code>, el contexto visual debe decir qué pide el campo.",

    "formFieldPage.a11yYours1": "Escribe el error en texto: el color no es la única señal (WCAG 2.2, 1.4.1).",

    "formFieldPage.a11yDoes3": "El asterisco de obligatorio es decorativo; lo que lo dice es el atributo <code>required</code> del control.",

    "formFieldPage.a11yDoes2": "El control apunta a la ayuda y al error con <code>aria-describedby</code>, y con error lleva <code>aria-invalid</code>.",

    "formFieldPage.a11yDoes1": "La etiqueta apunta al control con <code>for</code>.",

    "formFieldPage.a11yIntro": "FormField conecta cada texto con el control, así se anuncian juntos.",

    "formFieldPage.content4": "No uses el placeholder como etiqueta: desaparece al escribir.",

    "formFieldPage.content3": "Escribe el error con qué falta y cómo arreglarlo: «Escribe un correo con @», no «Campo inválido».",

    "formFieldPage.content2": "Usa la ayuda para el formato o el porqué: «Te enviaremos el recibo aquí».",

    "formFieldPage.content1": "Escribe la etiqueta con lo que se pide, en 1 a 3 palabras: «Correo electrónico».",

    "formFieldPage.whenNot3": 'Para un mensaje sobre todo el formulario: usa <a href="/es/componentes/callout">Callout</a>.',

    "formFieldPage.whenNot2": 'Para controles que ya traen su etiqueta cableada, como <a href="/es/componentes/number-field">NumberField</a> o <a href="/es/componentes/combobox">Combobox</a>: envolverlos agrega un segundo <code>for</code>.',

    "formFieldPage.whenNot1": "Si el control no lleva etiqueta visible ni oculta: el control lleva su propio <code>aria-label</code>.",

    "formFieldPage.when2": "Para mostrar una ayuda antes de escribir o un error junto al control.",

    "formFieldPage.when1": "Para cualquier control que necesita una etiqueta, que casi siempre es todos.",

    "formFieldPage.contract3": "En React, <code>FormField</code> genera el <code>id</code> y el <code>aria-describedby</code>, y pasa <code>required</code> al control.",

    "formFieldPage.contract2": "La presencia del mensaje de error es lo que invalida el campo; no hay una opción <code>invalid</code> aparte.",

    "formFieldPage.contract1": "Los ids del campo, la etiqueta, la ayuda y el error salen de uno solo: ningún binding los inventa por su cuenta.",

    "formFieldPage.basicBody": "La ayuda dice el formato antes de escribir; el error dice qué falta.",

    "formFieldPage.basicTitle": "Un campo: etiqueta, ayuda y error",
    "formFieldPage.title": "FormField",
    "formFieldPage.lede": "FormField pone la etiqueta, la ayuda y el mensaje de error alrededor de cualquier control (un input, un select, un textarea) y los conecta entre sí, para que un lector de pantalla anuncie cada uno con el campo. Tú escribes el nombre; el componente deriva los ids.",
    "formFieldPage.anatomyBody":
      "Este diagrama nombra el rótulo, el control, la ayuda y el error. El espécimen está congelado; los campos vivos empiezan abajo.",
    "formFieldPage.anatomyLabel": "Anatomía de FormField",
    "formFieldPage.anatomyPreviewLabel": "FormField, parte por parte",
    "formFieldPage.independentTitle": "Con otro control: un Select",
    "formFieldPage.independentBody": "FormField envuelve cualquier control igual: un select o un textarea.",
    "formFieldPage.test1": "Cablea label, hint y error al control que envuelve.",
    "formFieldPage.test2": "El mensaje de error es lo que vuelve inválido al campo.",
    "formFieldPage.test3": "Pasa required y disabled al control nativo.",
    "formFieldPage.test4": "Cablea un textarea igual que un input.",
    "formFieldPage.test5": "Pasa axe con ayuda y error a la vez.",
    "demo.formField.dd.date": "Fecha de nacimiento",
    "demo.formField.dd.dateHint": "Día, mes y año: 31/12/1990",
    "demo.formField.dd.dateError": "Formato inválido",
    "demo.formField.dd.email": "Correo electrónico",
    "demo.formField.dd.information": "Información",
    "demo.formField.dd.emailError": "Escribe un correo con @.",
    "demo.formField.dd.genericError": "Campo inválido.",
    "demo.formField.dd.taxId": "RUT",
    "demo.formField.dd.taxIdHint": "Lo necesitamos para emitir factura.",
    "demo.formField.dd.taxIdRequiredText": "RUT (obligatorio)",
    "demo.formField.dd.legalName": "Nombre legal",
    "demo.formField.dd.legalNameHint": "Tal como aparece en tu documento.",
    "demo.formField.dd.nameAndPhone": "Nombre y teléfono",
    "demo.formField.dd.nameAndPhonePlaceholder": "Ana, +56 9 1234 5678",
    "demo.formField.dd.deliveryNotes": "Notas de entrega",
    "demo.formField.dd.deliveryNotesHint": "Portón, piso, referencia o horario.",
    "demo.formField.dd.deliveryNotesPlaceholder": "Portón azul, dejar en conserjería, llamar antes de llegar",
    "demo.formField.dd.phone": "Teléfono",
    "demo.formField.dd.phonePurpose": "Solo te llamamos si hay que reagendar la entrega.",
    "demo.formField.dd.phoneRepeat": "Ingresa tu teléfono.",
    "demo.formField.dd.accountError": "Ese correo ya tiene cuenta. Inicia sesión o usa otro.",
    "demo.formField.dd.middleName": "Segundo nombre",
    "demo.formField.dd.optional": "Opcional",
    "formFieldPage.prop.labelHidden.title": "Label hidden: la etiqueta solo para lectores",
    "formFieldPage.prop.labelHidden.body": "<code>labelHidden</code> esconde la etiqueta a la vista y la deja para lectores de pantalla.",
    "formFieldPage.prop.labelHidden.false": "Usa <code>false</code>, el valor por defecto: la etiqueta se ve sobre el control.",
    "formFieldPage.prop.labelHidden.true": "Usa <code>true</code> solo cuando el contexto ya dice qué pide el campo, como una búsqueda con su botón.",
    "formFieldPage.prop.labelHidden.falseLabel": "Visible",
    "formFieldPage.prop.labelHidden.trueLabel": "Oculta",
    "formFieldPage.guidelinesLede": "Un campo claro dice qué pide antes de que la persona escriba.",
    "formFieldPage.dd.label.title": "Etiqueta: no placeholder",
    "formFieldPage.dd.label.do": "La etiqueta dice qué dato se pide; el placeholder solo muestra un ejemplo.",
    "formFieldPage.dd.label.dont": "Una etiqueta genérica fuerza a leer el placeholder, que desaparece al escribir.",
    "formFieldPage.dd.hint.title": "Ayuda: antes que el error",
    "formFieldPage.dd.hint.do": "Di el formato en la pista, antes de que alguien escriba.",
    "formFieldPage.dd.hint.dont": "Un error que dice el formato solo después obliga a escribir dos veces.",
    "formFieldPage.dd.error.title": "Error: qué falta y cómo arreglarlo",
    "formFieldPage.dd.error.do": "El mensaje nombra la corrección concreta.",
    "formFieldPage.dd.error.dont": "«Campo inválido» no dice qué mirar ni qué cambiar.",
    "formFieldPage.dd.required.title": "Obligatorio: estado real del control",
    "formFieldPage.dd.required.do": "Usa <code>required</code>: el navegador y las ayudas técnicas reciben la misma señal.",
    "formFieldPage.dd.required.dont": "Escribir «obligatorio» en la etiqueta no marca el control como requerido.",
    "formFieldPage.dd.oneQuestion.title": "Un campo, una pregunta",
    "formFieldPage.dd.oneQuestion.do": "Cada campo captura un dato; así valida, autocompleta y se corrige por separado.",
    "formFieldPage.dd.oneQuestion.dont": "Dos datos en un campo mezclan errores y rompen el autocompletado.",
    "formFieldPage.dd.textarea.title": "Respuesta larga: Textarea",
    "formFieldPage.dd.textarea.do": "Usa un textarea cuando esperas varias palabras o instrucciones.",
    "formFieldPage.dd.textarea.dont": "Una línea empuja a abreviar y oculta lo que la persona ya escribió.",
    "formFieldPage.dd.purpose.title": "Ayuda: aporta propósito",
    "formFieldPage.dd.purpose.do": "La ayuda explica por qué se pide el dato o cómo se usará.",
    "formFieldPage.dd.purpose.dont": "Repetir la etiqueta ocupa espacio sin aclarar nada.",
    "formFieldPage.dd.serverError.title": "Error de servidor: en error",
    "formFieldPage.dd.serverError.do": "Pon el fallo del servidor en <code>error</code>, para marcar el campo inválido.",
    "formFieldPage.dd.serverError.dont": "Poner un fallo en la ayuda lo hace sonar como información neutral.",
    "formFieldPage.dd.optional.title": "Opcional: no como placeholder",
    "formFieldPage.dd.optional.do": "Si hace falta decirlo, dilo en la ayuda: permanece visible.",
    "formFieldPage.dd.optional.dont": "Un placeholder «Opcional» parece un valor de ejemplo y desaparece al escribir.",
  },
  en: {
    "demo.formField.hint": "We only use it for receipts.",
    "demo.formField.error": "Enter a work address.",
    "demo.formField.planHint": "You can change it later.",

    "formFieldPage.description": "Puts the label, hint and error around a control, and connects them.",

    "formFieldPage.a11yYours2": "With <code>labelHidden</code>, the visual context must say what the field asks for.",

    "formFieldPage.a11yYours1": "Write the error as text: color is not the only signal (WCAG 2.2, 1.4.1).",

    "formFieldPage.a11yDoes3": "The required asterisk is decorative; the control's <code>required</code> attribute is what says it.",

    "formFieldPage.a11yDoes2": "The control points to the hint and error with <code>aria-describedby</code>, and carries <code>aria-invalid</code> with an error.",

    "formFieldPage.a11yDoes1": "The label points to the control with <code>for</code>.",

    "formFieldPage.a11yIntro": "FormField connects each text to the control, so they are announced together.",

    "formFieldPage.content4": "Do not use the placeholder as the label: it disappears on typing.",

    "formFieldPage.content3": "Write the error as what is missing and how to fix it: “Enter an email with @”, not “Invalid field”.",

    "formFieldPage.content2": "Use the hint for the format or the why: “We will send the receipt here”.",

    "formFieldPage.content1": "Write the label as what is asked, in 1 to 3 words: “Email address”.",

    "formFieldPage.whenNot3": 'For a message about the whole form: use <a href="/components/callout">Callout</a>.',

    "formFieldPage.whenNot2": 'For controls that wire their own label, like <a href="/components/number-field">NumberField</a> or <a href="/components/combobox">Combobox</a>: wrapping them adds a second <code>for</code>.',

    "formFieldPage.whenNot1": "If the control carries no label, visible or hidden: the control carries its own <code>aria-label</code>.",

    "formFieldPage.when2": "To show a hint before typing or an error beside the control.",

    "formFieldPage.when1": "For any control that needs a label, which is almost all of them.",

    "formFieldPage.contract3": "In React, <code>FormField</code> generates the <code>id</code> and <code>aria-describedby</code>, and passes <code>required</code> to the control.",

    "formFieldPage.contract2": "The error message's presence is what makes the field invalid; there is no separate <code>invalid</code> option.",

    "formFieldPage.contract1": "The ids of the field, label, hint and error come from one: no binding invents them on its own.",

    "formFieldPage.basicBody": "The hint says the format before typing; the error says what is missing.",

    "formFieldPage.basicTitle": "One field: label, hint and error",
    "formFieldPage.title": "FormField",
    "formFieldPage.lede": "FormField puts the label, the hint and the error message around any control (an input, a select, a textarea) and connects them, so a screen reader announces each with the field. You write the name; the component derives the ids.",
    "formFieldPage.anatomyBody":
      "This diagram names the label, control, hint, and error. The specimen is frozen; the live fields start below.",
    "formFieldPage.anatomyLabel": "FormField anatomy",
    "formFieldPage.anatomyPreviewLabel": "FormField, part by part",
    "formFieldPage.independentTitle": "With another control: a Select",
    "formFieldPage.independentBody": "FormField wraps any control the same way: a select or a textarea.",
    "formFieldPage.test1": "Wires the label, hint and error to the control it wraps.",
    "formFieldPage.test2": "The error message is what makes the field invalid.",
    "formFieldPage.test3": "Passes required and disabled to the native control.",
    "formFieldPage.test4": "Wires a textarea exactly as it wires an input.",
    "formFieldPage.test5": "Passes axe with a hint and an error at once.",
    "demo.formField.dd.date": "Date of birth",
    "demo.formField.dd.dateHint": "Day, month and year: 31/12/1990",
    "demo.formField.dd.dateError": "Invalid format",
    "demo.formField.dd.email": "Email address",
    "demo.formField.dd.information": "Information",
    "demo.formField.dd.emailError": "Enter an email with @.",
    "demo.formField.dd.genericError": "Invalid field.",
    "demo.formField.dd.taxId": "Tax ID",
    "demo.formField.dd.taxIdHint": "We need it to issue an invoice.",
    "demo.formField.dd.taxIdRequiredText": "Tax ID (required)",
    "demo.formField.dd.legalName": "Legal name",
    "demo.formField.dd.legalNameHint": "As it appears on your document.",
    "demo.formField.dd.nameAndPhone": "Name and phone",
    "demo.formField.dd.nameAndPhonePlaceholder": "Ana, +56 9 1234 5678",
    "demo.formField.dd.deliveryNotes": "Delivery notes",
    "demo.formField.dd.deliveryNotesHint": "Gate, floor, landmark or time window.",
    "demo.formField.dd.deliveryNotesPlaceholder": "Blue gate, leave at reception, call before arriving",
    "demo.formField.dd.phone": "Phone",
    "demo.formField.dd.phonePurpose": "We only call if the delivery needs rescheduling.",
    "demo.formField.dd.phoneRepeat": "Enter your phone.",
    "demo.formField.dd.accountError": "That email already has an account. Sign in or use another.",
    "demo.formField.dd.middleName": "Middle name",
    "demo.formField.dd.optional": "Optional",
    "formFieldPage.prop.labelHidden.title": "Label hidden: the label for screen readers only",
    "formFieldPage.prop.labelHidden.body": "<code>labelHidden</code> hides the label from view and keeps it for screen readers.",
    "formFieldPage.prop.labelHidden.false": "Use <code>false</code>, the default: the label shows above the control.",
    "formFieldPage.prop.labelHidden.true": "Use <code>true</code> only when the context already says what the field asks for, like a search with its button.",
    "formFieldPage.prop.labelHidden.falseLabel": "Visible",
    "formFieldPage.prop.labelHidden.trueLabel": "Hidden",
    "formFieldPage.guidelinesLede": "A clear field says what it asks for before people type.",
    "formFieldPage.dd.label.title": "Label: not a placeholder",
    "formFieldPage.dd.label.do": "The label says what data is asked for; the placeholder only shows an example.",
    "formFieldPage.dd.label.dont": "A generic label makes people read the placeholder, which disappears on typing.",
    "formFieldPage.dd.hint.title": "Hint: before the error",
    "formFieldPage.dd.hint.do": "Give the format in the hint, before anyone types.",
    "formFieldPage.dd.hint.dont": "An error that only then says the format makes people type twice.",
    "formFieldPage.dd.error.title": "Error: what is missing and how to fix it",
    "formFieldPage.dd.error.do": "The message names the concrete correction.",
    "formFieldPage.dd.error.dont": "“Invalid field” does not say what to inspect or what to change.",
    "formFieldPage.dd.required.title": "Required: a real control state",
    "formFieldPage.dd.required.do": "Use <code>required</code>: the browser and assistive tech receive the same signal.",
    "formFieldPage.dd.required.dont": "Writing “required” in the label does not mark the control as required.",
    "formFieldPage.dd.oneQuestion.title": "One field, one question",
    "formFieldPage.dd.oneQuestion.do": "Each field captures one piece of data; validation, autocomplete and fixes stay separate.",
    "formFieldPage.dd.oneQuestion.dont": "Two pieces of data in one field mix errors and break autocomplete.",
    "formFieldPage.dd.textarea.title": "Long answer: Textarea",
    "formFieldPage.dd.textarea.do": "Use a textarea when you expect several words or instructions.",
    "formFieldPage.dd.textarea.dont": "One line pushes people to abbreviate and hides what they already wrote.",
    "formFieldPage.dd.purpose.title": "Hint: add purpose",
    "formFieldPage.dd.purpose.do": "The hint explains why the data is requested or how it will be used.",
    "formFieldPage.dd.purpose.dont": "Repeating the label takes space without clarifying anything.",
    "formFieldPage.dd.serverError.title": "Server error: in error",
    "formFieldPage.dd.serverError.do": "Put the server failure in <code>error</code>, so the field is marked invalid.",
    "formFieldPage.dd.serverError.dont": "Putting a failure in the hint makes it sound like neutral information.",
    "formFieldPage.dd.optional.title": "Optional: not as placeholder",
    "formFieldPage.dd.optional.do": "If it needs saying, say it in the hint: it stays visible.",
    "formFieldPage.dd.optional.dont": "An “Optional” placeholder looks like an example value and disappears on typing.",
  },
} as const;
