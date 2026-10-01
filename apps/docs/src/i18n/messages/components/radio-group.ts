export const radioGroupMessages = {
  es: {
    "demo.radioGroup.country": "País",
    "demo.matrix.easy": "Es fácil de usar",
    "demo.matrix.fast": "Responde rápido",
    "demo.matrix.recommend": "Lo recomendaría",
    "radioGroupPage.matrixTitle": "Matriz: varias preguntas, una escala",
    "radioGroupPage.matrixTable": "Una tabla: cada fila es una pregunta y la escala se nombra una vez, en la cabecera.",
    "radioGroupPage.matrixCaption": "Cuánto estás de acuerdo con cada afirmación",
    "radioGroupPage.matrixStatement": "Afirmación",
    "radioGroupPage.matrixLabel": "Likert de tabla",
    "radioGroupPage.likertTitle": "Likert: una escala en fila",
    "radioGroupPage.likertBody": "El mismo grupo en horizontal, con los extremos nombrados. No es otro componente.",
    "radioGroupPage.likertLabel": "Escala Likert, compuesta",
    "demo.radioGroup.label": "Plan",
    "demo.radioGroup.starter.title": "Starter",
    "demo.radioGroup.starter.body": "Para proyectos personales.",
    "demo.radioGroup.pro.title": "Pro",
    "demo.radioGroup.pro.body": "Para equipos en crecimiento.",
    "demo.radioGroup.basic.title": "Basic",
    "demo.radioGroup.basic.body": "Funciones esenciales, sin costo.",

    "radioGroupPage.description": "Elige una sola opción de un grupo pequeño, con todas a la vista.",

    "radioGroupPage.key.space": "Elige la opción con el foco.",

    "radioGroupPage.key.arrows": "Elige la opción anterior o siguiente.",

    "radioGroupPage.key.tab": "Entra al grupo, a la opción elegida.",

    "radioGroupPage.a11yYours2": "Elige una opción por defecto si hay una razonable; si no, deja ninguna.",

    "radioGroupPage.a11yYours1": "Dale nombre al grupo con <code>label</code> o un <code>legend</code>.",

    "radioGroupPage.a11yDoes2": "El lector de pantalla anuncia el grupo, la opción y su posición: «Professional, 2 de 3».",

    "radioGroupPage.a11yDoes1": "El grupo es una sola parada de <kbd>Tab</kbd>; las flechas eligen dentro.",

    "radioGroupPage.a11yIntro": "RadioGroup usa radios nativos con un nombre compartido.",

    "radioGroupPage.content3": "Ordénalas de forma lógica: de menor a mayor, o la recomendada primero.",

    "radioGroupPage.content2": "Escribe opciones cortas, con la misma forma y sin solaparse.",

    "radioGroupPage.content1": "Nombra el grupo con una pregunta o un sustantivo: «Plan», «¿Cómo quieres recibirlo?».",

    "radioGroupPage.whenNot4": 'Para cambiar de vista: usa <a href="/es/componentes/segmented">Segmented</a>.',

    "radioGroupPage.whenNot3": 'Para activar o desactivar algo al instante: usa <a href="/es/componentes/switch">Switch</a>.',

    "radioGroupPage.whenNot2": 'Si se pueden elegir varias: usa <a href="/es/componentes/checkbox">Checkbox</a>.',

    "radioGroupPage.whenNot1": 'Para más de 6 opciones: usa <a href="/es/componentes/select">Select</a>.',

    "radioGroupPage.when2": "Para una escala de encuesta, en horizontal.",

    "radioGroupPage.when1": "Para elegir una sola opción entre 2 y 6, cuando conviene verlas todas.",

    "radioGroupPage.contract3": "El grupo necesita nombre: <code>label</code>, o un <code>fieldset</code> con <code>legend</code>.",

    "radioGroupPage.contract2": "<code>defaultValue</code> respeta el reset del formulario; <code>value</code> y <code>onValueChange</code> lo controlan.",

    "radioGroupPage.contract1": "<code>name</code> es obligatorio y lo comparten todas las opciones.",

    "radioGroupPage.basicTitle": "Un plan: tres opciones",
    "radioGroupPage.lede": "RadioGroup elige una sola opción de un grupo pequeño, con todas a la vista: un plan, un método de envío, una respuesta de una encuesta. Elegir una desmarca la anterior. Cada opción es un radio nativo, así que se envía con el formulario.",
    "radioGroupPage.anatomyBody":
      "Este diagrama nombra el grupo, cada opción, el input, el control, el indicador y la etiqueta. El espécimen está congelado; los RadioGroup vivos empiezan abajo.",
    "radioGroupPage.anatomyLabel": "Anatomía de RadioGroup",
    "radioGroupPage.anatomyPreviewLabel": "RadioGroup, parte por parte",
    "radioGroupPage.tileTitle": "TileRadioGroup: opciones con detalle",
    "radioGroupPage.tileBody1": "Cuando cada opción necesita título y descripción, cada una es una tarjeta que se elige entera.",
    "radioGroupPage.tileBody2": "Con HTML escrito a mano, el enhancer <code>tile-radio-group</code> le da el teclado de un grupo de radios.",
    "radioGroupPage.prop.orientation.title": "Orientation: columna o fila",
    "radioGroupPage.prop.orientation.body": "Cómo se ordenan las opciones.",
    "radioGroupPage.prop.orientation.vertical": "Usa <code>vertical</code>, el valor por defecto, en formularios: se lee de arriba abajo.",
    "radioGroupPage.prop.orientation.horizontal": "Usa <code>horizontal</code> para dos o tres opciones cortas.",
    "radioGroupPage.prop.spread.title": "Spread: el mismo ancho para cada una",
    "radioGroupPage.prop.spread.body": "Reparte las opciones en fila como pasos iguales.",
    "radioGroupPage.prop.spread.false": "Usa <code>false</code>, el valor por defecto: cada opción mide lo que su etiqueta.",
    "radioGroupPage.prop.spread.true": "Usa <code>true</code> en escalas, donde cada punto pesa lo mismo.",
    "radioGroupPage.prop.spread.falseLabel": "Natural",
    "radioGroupPage.prop.spread.trueLabel": "Distribuido",
    "radioGroupPage.basicBody": "La opción recomendada empieza elegida.",
    "radioGroupPage.guidelinesLede": "Ver todas las opciones a la vez ayuda a compararlas antes de elegir.",
    "radioGroupPage.dd.exclusive.title": "Cantidad: pocas opciones",
    "radioGroupPage.dd.exclusive.do": "Tres planes se comparan de un vistazo.",
    "radioGroupPage.dd.exclusive.dont": 'Diez países ocupan media pantalla y cuesta encontrar uno: eso es un <a href="/es/componentes/select">Select</a>.',
    "radioGroupPage.dd.surface.title": "Detalle: una tarjeta por opción",
    "radioGroupPage.dd.surface.do": "Con título y descripción, cada opción es una tarjeta que se elige entera.",
    "radioGroupPage.dd.surface.dont": "Una etiqueta sola no alcanza para comparar planes con precio y límites.",
    "radioGroupPage.test1":
      "Es un radiogroup, respeta el valor por defecto, mantiene los valores mutuamente excluyentes y emite el evento.",
    "radioGroupPage.test2": "Marca el <code>data-state</code> del ítem seleccionado.",
  },
  en: {
    "demo.radioGroup.country": "Country",
    "demo.matrix.easy": "It is easy to use",
    "demo.matrix.fast": "It responds quickly",
    "demo.matrix.recommend": "I would recommend it",
    "radioGroupPage.matrixTitle": "Matrix: several questions, one scale",
    "radioGroupPage.matrixTable": "A table: each row is a question and the scale is named once, in the header.",
    "radioGroupPage.matrixCaption": "How much you agree with each statement",
    "radioGroupPage.matrixStatement": "Statement",
    "radioGroupPage.matrixLabel": "Table Likert",
    "radioGroupPage.likertTitle": "Likert: a scale in a row",
    "radioGroupPage.likertBody": "The same group laid horizontally, with the ends named. It is not another component.",
    "radioGroupPage.likertLabel": "Likert scale, composed",
    "demo.radioGroup.label": "Plan",
    "demo.radioGroup.starter.title": "Starter",
    "demo.radioGroup.starter.body": "For personal projects.",
    "demo.radioGroup.pro.title": "Pro",
    "demo.radioGroup.pro.body": "For growing teams.",
    "demo.radioGroup.basic.title": "Basic",
    "demo.radioGroup.basic.body": "Core features, free forever.",

    "radioGroupPage.description": "Chooses a single option from a small group, with all of them in view.",

    "radioGroupPage.key.space": "Chooses the focused option.",

    "radioGroupPage.key.arrows": "Chooses the previous or next option.",

    "radioGroupPage.key.tab": "Enters the group, at the chosen option.",

    "radioGroupPage.a11yYours2": "Pick a default if there is a reasonable one; otherwise leave none.",

    "radioGroupPage.a11yYours1": "Name the group with <code>label</code> or a <code>legend</code>.",

    "radioGroupPage.a11yDoes2": "The screen reader announces the group, the option and its position: “Professional, 2 of 3”.",

    "radioGroupPage.a11yDoes1": "The group is a single <kbd>Tab</kbd> stop; the arrows choose within it.",

    "radioGroupPage.a11yIntro": "RadioGroup uses native radios with a shared name.",

    "radioGroupPage.content3": "Order them logically: smallest to largest, or the recommended one first.",

    "radioGroupPage.content2": "Write short options, in the same shape and without overlap.",

    "radioGroupPage.content1": "Name the group with a question or noun: “Plan”, “How do you want to receive it?”.",

    "radioGroupPage.whenNot4": 'To switch views: use <a href="/components/segmented">Segmented</a>.',

    "radioGroupPage.whenNot3": 'To turn something on or off instantly: use <a href="/components/switch">Switch</a>.',

    "radioGroupPage.whenNot2": 'If several can be chosen: use <a href="/components/checkbox">Checkbox</a>.',

    "radioGroupPage.whenNot1": 'For more than 6 options: use <a href="/components/select">Select</a>.',

    "radioGroupPage.when2": "For a survey scale, horizontally.",

    "radioGroupPage.when1": "To choose one option among 2 to 6, when it helps to see them all.",

    "radioGroupPage.contract3": "The group needs a name: <code>label</code>, or a <code>fieldset</code> with a <code>legend</code>.",

    "radioGroupPage.contract2": "<code>defaultValue</code> respects form reset; <code>value</code> and <code>onValueChange</code> control it.",

    "radioGroupPage.contract1": "<code>name</code> is required and shared by every option.",

    "radioGroupPage.basicTitle": "A plan: three options",
    "radioGroupPage.lede": "RadioGroup chooses a single option from a small group, with all of them in view: a plan, a shipping method, a survey answer. Choosing one unchecks the last. Each option is a native radio, so it is submitted with the form.",
    "radioGroupPage.anatomyBody":
      "This diagram names the group, each option, the input, the control, the indicator and the label. The specimen is frozen; the live RadioGroups begin below.",
    "radioGroupPage.anatomyLabel": "RadioGroup anatomy",
    "radioGroupPage.anatomyPreviewLabel": "RadioGroup, part by part",
    "radioGroupPage.tileTitle": "TileRadioGroup: options with detail",
    "radioGroupPage.tileBody1": "When each option needs a title and description, each is a card chosen whole.",
    "radioGroupPage.tileBody2": "With hand-written HTML, the <code>tile-radio-group</code> enhancer gives it a radio group's keyboard.",
    "radioGroupPage.prop.orientation.title": "Orientation: column or row",
    "radioGroupPage.prop.orientation.body": "How the options are laid out.",
    "radioGroupPage.prop.orientation.vertical": "Use <code>vertical</code>, the default, in forms: it reads top to bottom.",
    "radioGroupPage.prop.orientation.horizontal": "Use <code>horizontal</code> for two or three short options.",
    "radioGroupPage.prop.spread.title": "Spread: the same width for each",
    "radioGroupPage.prop.spread.body": "Spreads the options in a row as equal steps.",
    "radioGroupPage.prop.spread.false": "Use <code>false</code>, the default: each option measures its label.",
    "radioGroupPage.prop.spread.true": "Use <code>true</code> in scales, where each point weighs the same.",
    "radioGroupPage.prop.spread.falseLabel": "Natural",
    "radioGroupPage.prop.spread.trueLabel": "Spread",
    "radioGroupPage.basicBody": "The recommended option starts selected.",
    "radioGroupPage.guidelinesLede": "Seeing every option at once helps compare them before choosing.",
    "radioGroupPage.dd.exclusive.title": "Count: a few options",
    "radioGroupPage.dd.exclusive.do": "Three plans compare at a glance.",
    "radioGroupPage.dd.exclusive.dont": 'Ten countries fill half the screen and one is hard to find: that is a <a href="/components/select">Select</a>.',
    "radioGroupPage.dd.surface.title": "Detail: one card per option",
    "radioGroupPage.dd.surface.do": "With a title and description, each option is a card chosen whole.",
    "radioGroupPage.dd.surface.dont": "A label alone is not enough to compare plans with price and limits.",
    "radioGroupPage.test1":
      "Is a radiogroup, honours the default value, keeps values mutually exclusive, and emits the event.",
    "radioGroupPage.test2": "Marks the selected item's <code>data-state</code>.",
  },
} as const;
