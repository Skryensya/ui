export const checkboxMessages = {
  es: {
    "demo.checkbox.longLabel":
      "Notificarme por correo cuando haya caídas o degradaciones en cualquiera de los servicios que tengo configurados",
    "demo.checkbox.receiveAlerts": "Recibir alertas",
    "demo.checkbox.noAlerts": "No recibir alertas",
    "demo.checkbox.planTeam": "Plan equipo",
    "demo.checkbox.planPro": "Plan pro",
    "demo.checkbox.planBasic": "Plan básico",
    "demo.checkboxScale.mon": "Lunes",
    "demo.checkboxScale.tue": "Martes",
    "demo.checkboxScale.wed": "Miércoles",
    "demo.checkboxScale.thu": "Jueves",
    "demo.checkboxScale.min": "Principio de semana",
    "demo.checkboxScale.max": "Fin de semana",
    "checkboxPage.scaleTitle": "Escala: cuáles, no cuánto",
    "checkboxPage.scaleBody":
      'Cuando la pregunta es «cuáles», los mismos extremos de una escala llevan checkboxes: cada punto se marca por separado. Si la pregunta es «cuánto», es <a href="/es/componentes/radio-group">RadioGroup</a>.',
    "demo.checkbox.emailAlerts": "Alertas por email",
    "demo.checkbox.group": "Permisos del repositorio",
    "demo.checkbox.read": "Lectura",
    "demo.checkbox.write": "Escritura",
    "demo.checkbox.admin": "Administración",
    "demo.checkbox.critical.title": "Alertas críticas",
    "demo.checkbox.critical.body": "Notifica caídas y degradaciones.",
    "demo.checkbox.private.title": "Repositorios privados",
    "demo.checkbox.private.body": "Incluye actividad de proyectos privados.",
    "demo.checkbox.disabled.title": "Canal heredado",
    "demo.checkbox.disabled.body": "Gestionado por la organización.",

    "checkbox.description":
      "Marca una opción que se guarda al enviar, o varias opciones independientes.",

    "checkbox.a11yKeySpace": "Marca o desmarca el checkbox con foco.",

    "checkbox.a11yKeyTab": "Mueve el foco al checkbox siguiente o al anterior.",

    "checkbox.a11yYours2":
      "Si es obligatorio, dilo en texto junto al campo, no solo con un asterisco.",

    "checkbox.a11yYours1":
      "Sin texto visible, debe tener <code>aria-label</code>.",

    "checkbox.a11yDoes3":
      '<code>CheckboxGroup</code> es un <code>role="group"</code> nombrado por la etiqueta del padre.',

    "checkbox.a11yDoes2": "El estado indeterminado se anuncia como «mixto».",

    "checkbox.a11yDoes1":
      'Renderiza un <code>input type="checkbox"</code> dentro de su <code>label</code>.',

    "checkbox.a11yIntro":
      "Checkbox es un input nativo: rol, estado y teclado vienen del navegador.",

    "checkbox.content3":
      "En un grupo, la etiqueta del padre nombra el conjunto: «Permisos del repositorio».",

    "checkbox.content2":
      "Usa de 1 a 5 palabras, con mayúscula solo al inicio. La explicación va en la descripción de un TileCheckbox.",

    "checkbox.content1":
      "Escribe la etiqueta en positivo: «Recibir avisos», no «No recibir avisos».",

    "checkbox.whenNot3":
      'Para elegir muchas opciones de una lista larga que se busca: usa <a href="/es/componentes/combobox">Combobox</a> o <a href="/es/componentes/tags-input">TagsInput</a>.',

    "checkbox.whenNot2":
      'Si se elige una sola opción de un conjunto: usa <a href="/es/componentes/radio-group">RadioGroup</a>.',

    "checkbox.whenNot1":
      'Si el cambio aplica en el momento, sin enviar nada: usa <a href="/es/componentes/switch">Switch</a>.',

    "checkbox.when3":
      "Para marcar o desmarcar un conjunto entero: usa <code>CheckboxGroup</code>.",

    "checkbox.when2":
      "Para varias opciones independientes, cada una marcada por su cuenta.",

    "checkbox.when1":
      "Para una decisión de sí o no que se guarda al enviar: aceptar términos, suscribirse.",

    "checkbox.contract4":
      "Si no hay texto visible, el checkbox debe tener <code>aria-label</code>.",

    "checkbox.contract3":
      "En <code>CheckboxGroup</code>, los que envían valor son los hijos; un hijo <code>disabled</code> no impide que el padre diga «todos».",

    "checkbox.contract2":
      "El estado indeterminado es visual: no envía nada hasta que la persona elige.",

    "checkbox.contract1":
      "<code>defaultChecked</code> deja el estado al input; un reset vuelve a ese valor.",

    "checkbox.singleBody":
      "La etiqueta va dentro del <code>label</code>, así todo el texto es clicable.",

    "checkbox.singleTitle": "Una opción: el caso base",

    "checkbox.prop.orientation.horizontal":
      "Usa <code>horizontal</code> para dos o tres opciones cortas que caben en una línea.",

    "checkbox.prop.orientation.vertical":
      "Usa <code>vertical</code>, el valor por defecto, para listas de más de tres opciones o con etiquetas largas.",

    "checkbox.prop.orientation.body":
      "Cómo se ordenan los hijos de un <code>CheckboxGroup</code>.",

    "checkbox.prop.orientation.title": "Orientation: en columna o en fila",
    "checkbox.lede":
      'Checkbox marca una opción de sí o no que se guarda al enviar el formulario, o varias opciones independientes: aceptar términos, elegir permisos, activar filtros. Es un <code>input type="checkbox"</code> nativo, así que el envío, el reset, el teclado y la validación son del navegador.',
    "checkbox.anatomyBody":
      "El input, el control visible, el indicador y la etiqueta.",
    "checkbox.anatomyLabel": "Anatomía de Checkbox",
    "checkbox.anatomyPreviewLabel": "Checkbox, parte por parte",
    "checkbox.groupTitle": "Grupo: un padre que marca a todos",
    "checkbox.groupBody1":
      "El padre se marca cuando están todos, se desmarca cuando no hay ninguno y queda indeterminado cuando no coinciden. Ese estado se calcula desde los hijos, nunca se fija a mano.",
    "checkbox.tileTitle": "Con descripción: TileCheckbox",
    "checkbox.tileBody1":
      "Cuando la opción necesita un título, una descripción y toda la superficie como objetivo. Es el mismo control en otro contenedor.",
    "checkbox.tileBody2":
      "En Vanilla, <code>initComponents()</code> monta cada TileCheckbox y emite <code>sk:tilecheckedchange</code> al cambiar.",
    "checkbox.iconsComment1":
      "Los indicadores check/remove se escriben a mano como placeholders",
    "checkbox.iconsComment2":
      "<span data-sk-icon>; mountIcons los reemplaza por el <svg> del set.",
    "checkbox.iconsComment3":
      "Cada label se autora con data-sk-tile-checkbox (data-name, data-value,\ndata-default-checked) más su input y su indicador.",
    "checkbox.iconsComment4":
      "initComponents las hidrata con la máquina @zag-js/checkbox.",
    "checkbox.guidelinesLede":
      "Un checkbox es una decisión que se envía con el formulario.",
    "checkbox.dd.independent.title": "Respuestas: varias, no una",
    "checkbox.dd.independent.do":
      "Los permisos se combinan: cada uno se marca por su cuenta.",
    "checkbox.dd.independent.dont":
      "Un plan es una sola respuesta: con checkboxes, la persona puede marcar dos y no sabe cuál vale. Usa RadioGroup.",
    "checkbox.dd.surface.title":
      "Explicación: en la descripción, no en la etiqueta",
    "checkbox.dd.surface.do":
      "TileCheckbox separa el título corto de la descripción.",
    "checkbox.dd.surface.dont":
      "Una etiqueta de dos líneas se lee como un párrafo y cuesta encontrar qué se está marcando.",
    "checkbox.dd.positive.title": "Etiqueta: escribe en positivo",
    "checkbox.dd.positive.do":
      "Al marcar, la persona acepta lo que la etiqueta anuncia.",
    "checkbox.dd.positive.dont":
      "Una etiqueta negativa vuelve confuso qué significa marcar la casilla.",
    "checkbox.test1":
      "Alterna el estado marcado y el <code>data-state</code> de la raíz al hacer click, emitiendo <code>sk:tilecheckedchange</code>.",
    "checkbox.test2":
      "Está asociado al formulario y respeta su <code>default-checked</code>.",
  },
  en: {
    "demo.checkbox.longLabel":
      "Email me when there are outages or degradations in any of the services I have configured",
    "demo.checkbox.receiveAlerts": "Receive alerts",
    "demo.checkbox.noAlerts": "Do not receive alerts",
    "demo.checkbox.planTeam": "Team plan",
    "demo.checkbox.planPro": "Pro plan",
    "demo.checkbox.planBasic": "Basic plan",
    "demo.checkboxScale.mon": "Monday",
    "demo.checkboxScale.tue": "Tuesday",
    "demo.checkboxScale.wed": "Wednesday",
    "demo.checkboxScale.thu": "Thursday",
    "demo.checkboxScale.min": "Start of the week",
    "demo.checkboxScale.max": "End of the week",
    "checkboxPage.scaleTitle": "Scale: which, not how much",
    "checkboxPage.scaleBody":
      'When the question is “which”, the same scale ends carry checkboxes: each point is checked on its own. If the question is “how much”, it is <a href="/components/radio-group">RadioGroup</a>.',
    "demo.checkbox.emailAlerts": "Email alerts",
    "demo.checkbox.group": "Repository permissions",
    "demo.checkbox.read": "Read",
    "demo.checkbox.write": "Write",
    "demo.checkbox.admin": "Admin",
    "demo.checkbox.critical.title": "Critical alerts",
    "demo.checkbox.critical.body": "Notify outages and degradations.",
    "demo.checkbox.private.title": "Private repositories",
    "demo.checkbox.private.body": "Include activity from private projects.",
    "demo.checkbox.disabled.title": "Inherited channel",
    "demo.checkbox.disabled.body": "Managed by the organization.",

    "checkbox.description":
      "Checks an option saved on submit, or several independent options.",

    "checkbox.a11yKeySpace": "Checks or unchecks the focused checkbox.",

    "checkbox.a11yKeyTab": "Moves focus to the next or previous checkbox.",

    "checkbox.a11yYours2":
      "If it is required, say so in text beside the field, not only with an asterisk.",

    "checkbox.a11yYours1":
      "With no visible text, it must have an <code>aria-label</code>.",

    "checkbox.a11yDoes3":
      '<code>CheckboxGroup</code> is a <code>role="group"</code> named by the parent\'s label.',

    "checkbox.a11yDoes2": "The indeterminate state is announced as “mixed”.",

    "checkbox.a11yDoes1":
      'It renders an <code>input type="checkbox"</code> inside its <code>label</code>.',

    "checkbox.a11yIntro":
      "Checkbox is a native input: role, state and keyboard come from the browser.",

    "checkbox.content3":
      "In a group, the parent's label names the set: “Repository permissions”.",

    "checkbox.content2":
      "Use 1 to 5 words, capitalizing only the first. The explanation goes in a TileCheckbox's description.",

    "checkbox.content1":
      "Write the label in the positive: “Receive alerts”, not “Do not receive alerts”.",

    "checkbox.whenNot3":
      'To pick many options from a long, searchable list: use <a href="/components/combobox">Combobox</a> or <a href="/components/tags-input">TagsInput</a>.',

    "checkbox.whenNot2":
      'If one option of a set is chosen: use <a href="/components/radio-group">RadioGroup</a>.',

    "checkbox.whenNot1":
      'If the change applies at once, with nothing to submit: use <a href="/components/switch">Switch</a>.',

    "checkbox.when3":
      "To check or uncheck a whole set: use <code>CheckboxGroup</code>.",

    "checkbox.when2":
      "For several independent options, each checked on its own.",

    "checkbox.when1":
      "For a yes-or-no decision saved on submit: accepting terms, subscribing.",

    "checkbox.contract4":
      "With no visible text, the checkbox must have an <code>aria-label</code>.",

    "checkbox.contract3":
      "In <code>CheckboxGroup</code>, the children submit values; a <code>disabled</code> child does not stop the parent from saying “all”.",

    "checkbox.contract2":
      "The indeterminate state is visual: it submits nothing until the person chooses.",

    "checkbox.contract1":
      "<code>defaultChecked</code> leaves the state to the input; a reset returns to that value.",

    "checkbox.singleBody":
      "The text lives inside the <code>label</code>, so all of it is clickable.",

    "checkbox.singleTitle": "One option: the base case",

    "checkbox.prop.orientation.horizontal":
      "Use <code>horizontal</code> for two or three short options that fit on one line.",

    "checkbox.prop.orientation.vertical":
      "Use <code>vertical</code>, the default, for lists of more than three options or with long labels.",

    "checkbox.prop.orientation.body":
      "How a <code>CheckboxGroup</code>'s children are arranged.",

    "checkbox.prop.orientation.title": "Orientation: column or row",
    "checkbox.lede":
      'Checkbox checks a yes-or-no option that is saved when the form is submitted, or several independent options: accepting terms, choosing permissions, turning on filters. It is a native <code>input type="checkbox"</code>, so submitting, resetting, the keyboard and validation belong to the browser.',
    "checkbox.anatomyBody":
      "The input, the visible control, the indicator and the label.",
    "checkbox.anatomyLabel": "Checkbox anatomy",
    "checkbox.anatomyPreviewLabel": "Checkbox, part by part",
    "checkbox.groupTitle": "Group: a parent that checks them all",
    "checkbox.groupBody1":
      "The parent is checked when all are, unchecked when none are, and indeterminate when they disagree. That state is derived from the children, never set by hand.",
    "checkbox.tileTitle": "With a description: TileCheckbox",
    "checkbox.tileBody1":
      "When the option needs a title, a description and the whole surface as its target. It is the same control in another container.",
    "checkbox.tileBody2":
      "In Vanilla, <code>initComponents()</code> mounts each TileCheckbox and emits <code>sk:tilecheckedchange</code> on change.",
    "checkbox.iconsComment1":
      "The check/remove indicators are authored as placeholders",
    "checkbox.iconsComment2":
      "<span data-sk-icon>; mountIcons replaces them with the <svg> of the set.",
    "checkbox.iconsComment3":
      "Every label is authored with data-sk-tile-checkbox (data-name, data-value,\ndata-default-checked) plus its input and its indicator.",
    "checkbox.iconsComment4":
      "initComponents hydrates them with the @zag-js/checkbox machine.",
    "checkbox.guidelinesLede":
      "A checkbox is a decision submitted with the form.",
    "checkbox.dd.independent.title": "Answers: several, not one",
    "checkbox.dd.independent.do":
      "Permissions combine: each is checked on its own.",
    "checkbox.dd.independent.dont":
      "A plan is a single answer: with checkboxes, people can check two and not know which counts. Use RadioGroup.",
    "checkbox.dd.surface.title":
      "Explanation: in the description, not the label",
    "checkbox.dd.surface.do":
      "TileCheckbox separates the short title from the description.",
    "checkbox.dd.surface.dont":
      "A two-line label reads like a paragraph and hides what is being checked.",
    "checkbox.dd.positive.title": "Label: write in the positive",
    "checkbox.dd.positive.do":
      "When checked, the person agrees to what the label says.",
    "checkbox.dd.positive.dont":
      "A negative label makes the checked state harder to interpret.",
    "checkbox.test1":
      "Toggles checked state and the root's <code>data-state</code> on click, emitting <code>sk:tilecheckedchange</code>.",
    "checkbox.test2":
      "Is form-associated and honours its <code>default-checked</code>.",
  },
} as const;
