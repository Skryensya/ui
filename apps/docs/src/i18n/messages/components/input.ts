export const inputMessages = {
  es: {
    "demo.input.hint": "Te escribimos aquí si algo sale mal.",
    "demo.input.emailLabel": "Correo electrónico",
    "demo.input.emailHint": "Lo usamos para enviarte el recibo.",
    "demo.input.notesLabel": "Notas",
    "demo.input.notesHint": "Cuéntanos qué te pasó, con el detalle que puedas.",
    "demo.input.notesPlaceholder": "Escribe aquí",

    "inputPage.description": "Recibe una línea de texto, o varias con Textarea, con el teclado y la validación del navegador.",

    "inputPage.a11yYours2": "Usa <code>autocomplete</code> para datos personales (<code>email</code>, <code>name</code>): ayuda a completar (WCAG 2.2, 1.3.5).",

    "inputPage.a11yYours1": "Debe tener una etiqueta visible.",

    "inputPage.a11yDoes3": "El área de interacción mide al menos 44px de alto.",

    "inputPage.a11yDoes2": "Con <code>format</code>, el error se escribe en el FormField y el campo lleva <code>aria-invalid</code>.",

    "inputPage.a11yDoes1": "Dentro de un FormField, la etiqueta, la ayuda y el error quedan conectados.",

    "inputPage.a11yIntro": "Input es un control nativo: el rol, el foco y el teclado vienen del navegador.",

    "inputPage.content4": "Usa el <code>type</code> que corresponde (<code>email</code>, <code>tel</code>, <code>url</code>): el teléfono muestra el teclado correcto.",

    "inputPage.content3": "Pon el formato esperado en la ayuda, antes de escribir: «Con puntos y guion: 12.345.678-5».",

    "inputPage.content2": "Usa el placeholder solo para un ejemplo del formato, nunca como etiqueta: «nombre@empresa.com».",

    "inputPage.content1": "Escribe la etiqueta con lo que se pide: «Correo electrónico».",

    "inputPage.whenNot4": 'Para texto con formato: usa <a href="/es/componentes/editor">Editor</a>.',

    "inputPage.whenNot3": 'Para una contraseña: usa <a href="/es/componentes/password-input">PasswordInput</a>.',

    "inputPage.whenNot2": 'Para un número con paso y límites: usa <a href="/es/componentes/number-field">NumberField</a>.',

    "inputPage.whenNot1": 'Para elegir de un conjunto cerrado: usa <a href="/es/componentes/select">Select</a>.',

    "inputPage.when3": "Para un valor con una validez que el navegador no comprueba, como un RUT: usa <code>format</code>.",

    "inputPage.when2": "Para texto de varias líneas: usa Textarea.",

    "inputPage.when1": "Para una línea de texto: nombre, correo, búsqueda.",

    "inputPage.contract4": "Un error del servidor (un RUT ya registrado) va en el slot <code>error</code> del FormField y le gana al de <code>format</code>.",

    "inputPage.contract3": "<code>NativeInput</code> es el mismo elemento sin <code>sk-input</code>, para controles como <code>time</code>, <code>color</code> o <code>range</code> con su aspecto nativo.",

    "inputPage.contract2": "La densidad compacta el espacio alrededor, no el área de interacción: el campo mide al menos 44px de alto.",

    "inputPage.contract1": "<code>sk-input</code> va en el <code>&lt;input&gt;</code> y en el <code>&lt;textarea&gt;</code>: un solo set de hooks.",

    "inputPage.textareaBody": "El mismo control visual, con la misma clase y los mismos hooks.",

    "inputPage.textareaTitle": "Varias líneas: Textarea",

    "inputPage.basicBody": "Un Input dentro de un FormField, con etiqueta y ayuda.",

    "inputPage.basicTitle": "Una línea: con su etiqueta",
    "inputPage.title": "Input",
    "inputPage.lede": 'Input recibe una línea de texto (un nombre, un correo, una búsqueda) y Textarea, varias. Son los controles nativos: el teclado del teléfono, la validación y el autocompletado son del navegador. Van dentro de un <a href="/es/componentes/form-field">FormField</a>, que les pone la etiqueta.',
    "demo.input.anatomyEmail": "tu@ejemplo.com",
    "demo.input.anatomyEmailLabel": "Email",
    "demo.input.anatomyNotes": "Escribe aquí",
    "inputPage.anatomyBody":
      'El dibujo tiene una sola etiqueta porque el contrato publica una sola clase; lo que vale la pena ver es <strong>cuántos elementos</strong> la llevan. Un anillo por cada uno, saliendo de la misma burbuja: el <code>&lt;input type="email"&gt;</code>, el <code>&lt;textarea&gt;</code> y un <code>&lt;input type="time"&gt;</code> nativo de verdad. Y no hay nada más nombrado: el rótulo, la pista y el error son del FormField, y están dibujados en su propia anatomía.',
    "inputPage.anatomyLabel": "Anatomía de Input",
    "inputPage.anatomyPreviewLabel": "Una clase, tres elementos",
    "demo.input.rutHint": "Con puntos o sin ellos, da lo mismo.",
    "demo.input.phoneLabel": "Celular",
    "demo.input.siteLabel": "Sitio web",

    "inputPage.formatTitle": "format: la validación que el navegador no trae",
    "inputPage.formatBody": '<code>format="rut"</code> comprueba el dígito verificador y <code>"url"</code> que el enlace se pueda abrir. Escribe <code>12.345.678-4</code> y sal del campo: el mensaje aparece en el error del FormField.',
    "inputPage.formatPhoneTitle": "phone: un paquete aparte",
    "inputPage.formatPhoneBody": "Un teléfono se valida contra el plan de numeración de su país, que son datos: instala <code>@skryensya/phone</code> y regístralo al arrancar. Si nadie lo registra, el campo deja pasar el valor y avisa en consola.",
    "inputPage.test1": "Sigue siendo un control válido fuera de un FormField.",
    "inputPage.test2": "Le da al textarea el mismo contrato de apariencia que al input.",
    "inputPage.test3": "Escribe el alto en data-size y deja en paz al atributo size nativo.",
    "demo.input.dd.placeholder": "nombre@ejemplo.com",
    "demo.input.dd.genericLabel": "Información",
    "demo.input.dd.message": "Mensaje",
    "demo.input.dd.messagePlaceholder": "Cuéntanos qué pasó",
    "demo.input.dd.messageHint": "Puedes escribir varias líneas.",
    "demo.input.dd.longValue": "El pedido llegó incompleto y necesito explicar qué falta antes de enviarlo de nuevo.",
    "demo.input.dd.formatPlaceholder": "Ingresa tu RUT",
    "inputPage.prop.controlSize.title": "Control size: la altura del campo",
    "inputPage.prop.controlSize.body": "Fija la altura, igual que la de un botón del mismo tamaño.",
    "inputPage.prop.controlSize.sm": "Usa <code>sm</code> en barras de herramientas y filtros compactos.",
    "inputPage.prop.controlSize.md": "Usa <code>md</code>, el valor por defecto, en formularios.",
    "inputPage.prop.controlSize.lg": "Usa <code>lg</code> para un campo principal, como una búsqueda en portada.",
    "inputPage.guidelinesLede": "Un campo de texto dice qué pide antes de que la persona escriba.",
    "inputPage.dd.label.title": "Etiqueta: visible, sobre el campo",
    "inputPage.dd.label.do": 'Pon la etiqueta sobre el campo, con un <a href="/es/componentes/form-field">FormField</a>.',
    "inputPage.dd.label.dont": "El placeholder desaparece al escribir y no todos los lectores de pantalla lo anuncian: después nadie recuerda qué pedía el campo.",
    "inputPage.dd.long.title": "Largo: el campo del tamaño del texto",
    "inputPage.dd.long.do": "Para un texto de varias líneas, usa <code>Textarea</code>: se ve lo que se está escribiendo.",
    "inputPage.dd.long.dont": "Un mensaje en una sola línea se escribe a ciegas: lo anterior se sale de la vista.",
    "inputPage.dd.format.title": "Formato: dilo antes de escribir",
    "inputPage.dd.format.do": "La ayuda muestra el formato esperado y el campo puede validarlo.",
    "inputPage.dd.format.dont": "Un placeholder genérico no enseña el patrón y desaparece al escribir.",
  },
  en: {
    "demo.input.hint": "We write here if something goes wrong.",
    "demo.input.emailLabel": "Email address",
    "demo.input.emailHint": "We use it to send your receipt.",
    "demo.input.notesLabel": "Notes",
    "demo.input.notesHint": "Tell us what happened, in as much detail as you can.",
    "demo.input.notesPlaceholder": "Write here",

    "inputPage.description": "Takes one line of text, or several with Textarea, with the browser's keyboard and validation.",

    "inputPage.a11yYours2": "Use <code>autocomplete</code> for personal data (<code>email</code>, <code>name</code>): it helps filling in (WCAG 2.2, 1.3.5).",

    "inputPage.a11yYours1": "It must have a visible label.",

    "inputPage.a11yDoes3": "The interaction area is at least 44px tall.",

    "inputPage.a11yDoes2": "With <code>format</code>, the error is written in the FormField and the field carries <code>aria-invalid</code>.",

    "inputPage.a11yDoes1": "Inside a FormField, the label, hint and error are connected.",

    "inputPage.a11yIntro": "Input is a native control: role, focus and keyboard come from the browser.",

    "inputPage.content4": "Use the matching <code>type</code> (<code>email</code>, <code>tel</code>, <code>url</code>): the phone shows the right keyboard.",

    "inputPage.content3": "Put the expected format in the hint, before typing: “With dots and a dash: 12.345.678-5”.",

    "inputPage.content2": "Use the placeholder only for a format example, never as the label: “name@company.com”.",

    "inputPage.content1": "Write the label as what is asked: “Email address”.",

    "inputPage.whenNot4": 'For formatted text: use <a href="/components/editor">Editor</a>.',

    "inputPage.whenNot3": 'For a password: use <a href="/components/password-input">PasswordInput</a>.',

    "inputPage.whenNot2": 'For a number with a step and bounds: use <a href="/components/number-field">NumberField</a>.',

    "inputPage.whenNot1": 'To choose from a closed set: use <a href="/components/select">Select</a>.',

    "inputPage.when3": "For a value with a validity the browser does not check, like a RUT: use <code>format</code>.",

    "inputPage.when2": "For multi-line text: use Textarea.",

    "inputPage.when1": "For one line of text: name, email, search.",

    "inputPage.contract4": "A server error (an already registered RUT) goes in the FormField's <code>error</code> slot and wins over <code>format</code>'s.",

    "inputPage.contract3": "<code>NativeInput</code> is the same element without <code>sk-input</code>, for controls like <code>time</code>, <code>color</code> or <code>range</code> with their native look.",

    "inputPage.contract2": "Density compacts the space around, not the interaction area: the field is at least 44px tall.",

    "inputPage.contract1": "<code>sk-input</code> goes on the <code>&lt;input&gt;</code> and the <code>&lt;textarea&gt;</code>: one set of hooks.",

    "inputPage.textareaBody": "The same visual control, with the same class and the same hooks.",

    "inputPage.textareaTitle": "Several lines: Textarea",

    "inputPage.basicBody": "An Input inside a FormField, with a label and a hint.",

    "inputPage.basicTitle": "One line: with its label",
    "inputPage.title": "Input",
    "inputPage.lede": 'Input takes one line of text (a name, an email, a search) and Textarea, several. They are the native controls: the phone keyboard, validation and autofill belong to the browser. They go inside a <a href="/components/form-field">FormField</a>, which gives them their label.',
    "demo.input.anatomyEmail": "you@example.com",
    "demo.input.anatomyEmailLabel": "Email",
    "demo.input.anatomyNotes": "Write here",
    "inputPage.anatomyBody":
      'The drawing carries one label because the contract publishes one class; what is worth seeing is <strong>how many elements</strong> wear it. One ring each, from a single bubble: the <code>&lt;input type="email"&gt;</code>, the <code>&lt;textarea&gt;</code>, and a real native <code>&lt;input type="time"&gt;</code>. Nothing else is named: the label, the hint and the error are FormField\'s, and they are drawn on FormField\'s own anatomy.',
    "inputPage.anatomyLabel": "Input anatomy",
    "inputPage.anatomyPreviewLabel": "One class, three elements",
    "demo.input.rutHint": "With dots or without them, it makes no difference.",
    "demo.input.phoneLabel": "Mobile",
    "demo.input.siteLabel": "Website",

    "inputPage.formatTitle": "format: the validation the browser lacks",
    "inputPage.formatBody": '<code>format="rut"</code> checks the check digit and <code>"url"</code> that the link can be opened. Type <code>12.345.678-4</code> and leave the field: the message appears in the FormField\'s error.',
    "inputPage.formatPhoneTitle": "phone: a separate package",
    "inputPage.formatPhoneBody": "A phone is validated against its country's numbering plan, which is data: install <code>@skryensya/phone</code> and register it at startup. If nobody registers it, the field lets the value through and warns in the console.",
    "inputPage.test1": "Stays a valid control outside a FormField.",
    "inputPage.test2": "Gives a textarea the same appearance contract as an input.",
    "inputPage.test3": "Writes the height to data-size and leaves the native size attribute alone.",
    "demo.input.dd.placeholder": "name@example.com",
    "demo.input.dd.genericLabel": "Information",
    "demo.input.dd.message": "Message",
    "demo.input.dd.messagePlaceholder": "Tell us what happened",
    "demo.input.dd.messageHint": "You can write several lines.",
    "demo.input.dd.longValue": "The order arrived incomplete and I need to explain what is missing before sending it again.",
    "demo.input.dd.formatPlaceholder": "Enter your RUT",
    "inputPage.prop.controlSize.title": "Control size: the field's height",
    "inputPage.prop.controlSize.body": "Sets the height, the same as a button of the same size.",
    "inputPage.prop.controlSize.sm": "Use <code>sm</code> in toolbars and compact filters.",
    "inputPage.prop.controlSize.md": "Use <code>md</code>, the default, in forms.",
    "inputPage.prop.controlSize.lg": "Use <code>lg</code> for a main field, like a search on a home page.",
    "inputPage.guidelinesLede": "A text field says what it asks for before people type.",
    "inputPage.dd.label.title": "Label: visible, above the field",
    "inputPage.dd.label.do": 'Put the label above the field, with a <a href="/components/form-field">FormField</a>.',
    "inputPage.dd.label.dont": "The placeholder disappears on typing and not every screen reader announces it: afterwards nobody remembers what the field asked for.",
    "inputPage.dd.long.title": "Length: the field sized to the text",
    "inputPage.dd.long.do": "For text several lines long, use <code>Textarea</code>: what people are writing stays visible.",
    "inputPage.dd.long.dont": "A message on a single line is typed blind: what came before scrolls out of view.",
    "inputPage.dd.format.title": "Format: say it before typing",
    "inputPage.dd.format.do": "The hint shows the expected format and the field can validate it.",
    "inputPage.dd.format.dont": "A generic placeholder does not teach the pattern and disappears on typing.",
  },
} as const;
