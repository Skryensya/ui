export const switchMessages = {
  es: {
    "demo.switch.dd.save": "Guardar",
    "demo.switch.dd.newsletter": "Recibir el boletín mensual",
    "demo.switch.deployAutomatically": "Desplegar automáticamente",
    "demo.switch.auto.title": "Despliegue automático",
    "demo.switch.auto.body": "Publica cuando las verificaciones pasan.",
    "demo.switch.public.title": "URL pública",
    "demo.switch.public.body": "Cualquiera con el enlace puede verla.",

    "switchPage.description": "Enciende o apaga algo, y el cambio se aplica en el momento.",

    "switchPage.key.toggle": "Enciende o apaga.",

    "switchPage.a11yYours2": "Si el cambio tiene efectos que no se ven, anúncialos.",

    "switchPage.a11yYours1": "Debe tener una etiqueta visible.",

    "switchPage.a11yDoes2": "La etiqueta está asociada: tocarla también cambia el estado.",

    "switchPage.a11yDoes1": "Se anuncia como interruptor, activado o desactivado.",

    "switchPage.a11yIntro": "Switch es un checkbox nativo con el rol de interruptor.",

    "switchPage.content2": "No agregues «Sí/No» ni «Activado» al lado: el interruptor ya lo muestra.",

    "switchPage.content1": "Nombra lo que se enciende, no la acción: «Notificaciones por correo», no «Activar notificaciones».",

    "switchPage.whenNot3": 'Para un botón de ícono que cambia de estado: usa <a href="/es/componentes/state-button">StateButton</a>.',

    "switchPage.whenNot2": 'Para elegir entre más de dos opciones: usa <a href="/es/componentes/radio-group">RadioGroup</a> o <a href="/es/componentes/segmented">Segmented</a>.',

    "switchPage.whenNot1": 'Si el cambio espera un botón de guardar: usa <a href="/es/componentes/checkbox">Checkbox</a>.',

    "switchPage.when2": "Para encender o apagar una función en una lista de ajustes.",

    "switchPage.when1": "Para una preferencia que se aplica al cambiarla: notificaciones, modo oscuro.",

    "switchPage.contract4": "No guarda nada: aplicar el cambio es tuyo.",

    "switchPage.contract3": "Solo dos estados: no hay indeterminado, a diferencia de Checkbox.",

    "switchPage.contract2": "<code>defaultChecked</code> deja el valor al navegador; <code>checked</code> y <code>onCheckedChange</code> lo controlan.",

    "switchPage.contract1": 'El input es un checkbox con <code>role="switch"</code>.',

    "switchPage.basicBody": 'Es un checkbox nativo con <code>role="switch"</code>: teclado, reset y envío son del navegador.',

    "switchPage.basicTitle": "Una preferencia: desplegar automáticamente",
    "switchPage.lede": "Switch enciende o apaga algo, y el cambio se aplica en el momento: las notificaciones, el despliegue automático, el modo oscuro. Si la elección espera un botón de guardar, es un Checkbox.",
    "switchPage.anatomyBody":
      "Este diagrama nombra el input, el control, el thumb y la etiqueta. El espécimen está congelado; los Switch vivos empiezan abajo.",
    "switchPage.anatomyLabel": "Anatomía de Switch",
    "switchPage.anatomyPreviewLabel": "Switch, parte por parte",
    "switchPage.tileTitle": "TileSwitch: con título y descripción",
    "switchPage.tileBody1": "Cuando la preferencia necesita explicación, toda la tarjeta es el objetivo.",
    "switchPage.tileBody2": "Con HTML escrito a mano, el enhancer <code>tile-switch</code> le da el comportamiento.",
    "switchPage.guidelinesLede": "Un interruptor promete que el cambio ya ocurrió: úsalo solo cuando es cierto.",
    "switchPage.dd.immediate.title": "Efecto: inmediato",
    "switchPage.dd.immediate.do": "Si la elección espera a Guardar, es una casilla.",
    "switchPage.dd.immediate.dont": "Un interruptor con un botón de guardar promete un cambio que todavía no pasó.",
    "switchPage.dd.surface.title": "Contexto: TileSwitch",
    "switchPage.dd.surface.do": "Cuando la preferencia necesita explicación, usa TileSwitch.",
    "switchPage.dd.surface.dont": "Una etiqueta corta sola no dice qué pasa al encenderlo.",
    "switchPage.test1":
      "Alterna el estado marcado y el <code>data-state</code> de la raíz al hacer click, emitiendo <code>sk:tilecheckedchange</code>.",
    "switchPage.test2": "Está asociado al formulario y respeta su <code>default-checked</code>.",
  },
  en: {
    "demo.switch.dd.save": "Save",
    "demo.switch.dd.newsletter": "Get the monthly newsletter",
    "demo.switch.deployAutomatically": "Deploy automatically",
    "demo.switch.auto.title": "Automatic deployment",
    "demo.switch.auto.body": "Publish when all checks pass.",
    "demo.switch.public.title": "Public URL",
    "demo.switch.public.body": "Anyone with the link can view it.",
    "switchPage.description": "Turns something on or off, and the change applies right away.",
    "switchPage.key.toggle": "Turns it on or off.",
    "switchPage.a11yYours2": "If the change has effects that are not seen, announce them.",
    "switchPage.a11yYours1": "It must have a visible label.",
    "switchPage.a11yDoes2": "The label is tied to it: tapping it also changes the state.",
    "switchPage.a11yDoes1": "It is announced as a switch, on or off.",
    "switchPage.a11yIntro": "Switch is a native checkbox with the switch role.",
    "switchPage.content2": "Do not add “Yes/No” or “On” beside it: the switch already shows it.",
    "switchPage.content1": "Name what turns on, not the action: “Email notifications”, not “Enable notifications”.",
    "switchPage.whenNot3": 'For an icon button that changes state: use <a href="/components/state-button">StateButton</a>.',
    "switchPage.whenNot2": 'To choose among more than two options: use <a href="/components/radio-group">RadioGroup</a> or <a href="/components/segmented">Segmented</a>.',
    "switchPage.whenNot1": 'If the change waits for a save button: use <a href="/components/checkbox">Checkbox</a>.',
    "switchPage.when2": "To turn a feature on or off in a settings list.",
    "switchPage.when1": "For a preference applied on change: notifications, dark mode.",
    "switchPage.contract4": "It saves nothing: applying the change is yours.",
    "switchPage.contract3": "Only two states: there is no indeterminate, unlike Checkbox.",
    "switchPage.contract2": "<code>defaultChecked</code> leaves the value to the browser; <code>checked</code> and <code>onCheckedChange</code> control it.",
    "switchPage.contract1": 'The input is a checkbox with <code>role="switch"</code>.',
    "switchPage.basicBody": 'It is a native checkbox with <code>role="switch"</code>: keyboard, reset and submission belong to the browser.',
    "switchPage.basicTitle": "A preference: deploy automatically",
    "switchPage.lede": "Switch turns something on or off, and the change applies right away: notifications, automatic deploys, dark mode. If the choice waits for a save button, it is a Checkbox.",
    "switchPage.anatomyBody":
      "This diagram names the input, the control, the thumb and the label. The specimen is frozen; the live Switches begin below.",
    "switchPage.anatomyLabel": "Switch anatomy",
    "switchPage.anatomyPreviewLabel": "Switch, part by part",
    "switchPage.tileTitle": "TileSwitch: with title and description",
    "switchPage.tileBody1": "When the preference needs explaining, the whole card is the target.",
    "switchPage.tileBody2": "With hand-written HTML, the <code>tile-switch</code> enhancer gives it behavior.",
    "switchPage.guidelinesLede": "A switch promises the change already happened: use it only when that is true.",
    "switchPage.dd.immediate.title": "Effect: immediate",
    "switchPage.dd.immediate.do": "If the choice waits for Save, it is a checkbox.",
    "switchPage.dd.immediate.dont": "A switch with a save button promises a change that has not happened yet.",
    "switchPage.dd.surface.title": "Context: TileSwitch",
    "switchPage.dd.surface.do": "When the preference needs explaining, use TileSwitch.",
    "switchPage.dd.surface.dont": "A short label alone does not say what happens when it is on.",
    "switchPage.test1":
      "Toggles checked state and the root's <code>data-state</code> on click, emitting <code>sk:tilecheckedchange</code>.",
    "switchPage.test2": "Is form-associated and honours its <code>default-checked</code>.",
  },
} as const;
