export const timeFieldMessages = {
  es: {
    "demo.timeField.label": "Salida",
    "demo.timeField.forced24Label": "Llegada (24 horas)",
    "demo.timeField.optionsLabel": "Elegir de la lista",

    "timeFieldPage.description": "Recibe una hora del día, sin fecha, con un campo por segmento y una lista de horarios.",

    "timeFieldPage.key.open": "Abre la lista de horarios.",

    "timeFieldPage.key.digits": "Escribe el valor del segmento.",

    "timeFieldPage.key.move": "Pasa al segmento anterior o siguiente.",

    "timeFieldPage.key.arrows": "Sube o baja el segmento con el foco.",

    "timeFieldPage.a11yYours1": "Debe tener una etiqueta visible.",

    "timeFieldPage.a11yDoes3": "La lista de horarios es un listbox que se recorre con flechas.",

    "timeFieldPage.a11yDoes2": "Cada segmento anuncia su nombre y su valor: hora, minuto, AM/PM.",

    "timeFieldPage.a11yDoes1": "El grupo toma el nombre de la etiqueta del campo.",

    "timeFieldPage.a11yIntro": "Cada segmento sigue el patrón spinbutton de la APG, dentro de un grupo nombrado.",

    "timeFieldPage.content2": "Si importa la zona horaria, dila al lado: «Hora de Santiago».",

    "timeFieldPage.content1": "Nombra el campo con lo que ocurre a esa hora: «Hora de inicio».",

    "timeFieldPage.whenNot3": 'Si basta el selector del sistema: usa el <code>&lt;input type="time"&gt;</code> nativo.',

    "timeFieldPage.whenNot2": 'Para una duración (2 h 30 min): usa <a href="/es/componentes/number-field">NumberField</a>.',

    "timeFieldPage.whenNot1": 'Para una fecha: usa <a href="/es/componentes/date-picker">DatePicker</a>.',

    "timeFieldPage.when2": "Cuando conviene ofrecer horarios frecuentes en una lista.",

    "timeFieldPage.when1": "Para una hora del día sin fecha: reuniones, entregas, turnos.",

    "timeFieldPage.contract3": "El valor es una hora local <code>HH:mm</code>, sin fecha ni zona horaria.",

    "timeFieldPage.contract2": "Escribir un dígito avanza al siguiente segmento cuando ya no cabe otro.",

    "timeFieldPage.contract1": "El orden de los segmentos y el separador salen de <code>Intl.DateTimeFormat</code> del idioma.",

    "timeFieldPage.basicBody": "Escribe los dígitos o elige de la lista. Las flechas suben y bajan el segmento con el foco.",

    "timeFieldPage.basicTitle": "Una hora: segmentos y lista",
    "timeFieldPage.lede": "TimeField recibe una hora del día, sin fecha: la hora de una reunión, de una entrega, de un turno. Hora, minuto y AM/PM se escriben por separado, y un botón abre una lista de horarios. El reloj de 12 o 24 horas lo decide el idioma.",
    "timeFieldPage.anatomyBody":
      "Un TimeField cerrado es un control segmentado: el positioner, el content y las filas del listbox solo existen mientras el desplegable está abierto. Por eso el espécimen se dibuja abierto y se queda así. Está congelado; el TimeField vivo es el de abajo.",
    "timeFieldPage.anatomyLabel": "Anatomía de TimeField",
    "timeFieldPage.anatomyPreviewLabel": "TimeField abierto, parte por parte",
    "timeFieldPage.forced24Title": "24 horas: sin depender del idioma",
    "timeFieldPage.forced24Body": '<code>hourCycle="h24"</code> fija el reloj para horarios técnicos, como turnos o vuelos.',
    "timeFieldPage.nativeTitle": 'Nativo: <input type="time">',
    "timeFieldPage.nativeBody": "No necesita CSS ni JavaScript y trae el selector del sistema. Usa TimeField cuando necesitas la lista de horarios o el mismo aspecto en todos los navegadores.",
    "timeFieldPage.optionsTitle": "Cada 15 minutos: la lista con otro paso",
    "timeFieldPage.optionsBody": "<code>optionsStep</code> cambia el intervalo de la lista, en minutos.",
    "timeFieldPage.test1": "Monta una sola vez y nombra el grupo a partir del label escrito a mano.",
    "timeFieldPage.test2": "Deriva los segmentos del locale, no del markup.",
    "timeFieldPage.test3": "Empieza vacío, con placeholders en vez de una hora inventada.",
    "timeFieldPage.prop.hourCycle.title": "Hour cycle: 12 o 24 horas",
    "timeFieldPage.prop.hourCycle.body": "Fuerza un reloj; sin él, lo decide el idioma.",
    "timeFieldPage.prop.hourCycle.h12": "Usa <code>h12</code> solo cuando el dominio lo exige, y siempre con AM y PM.",
    "timeFieldPage.prop.hourCycle.h24": "Usa <code>h24</code> para horarios técnicos, como turnos o vuelos.",
    "timeFieldPage.guidelinesLede": "Una hora se escribe más rápido que se elige, si el campo ayuda a escribirla.",
    "timeFieldPage.dd.cycle.title": "Reloj: el del idioma",
    "timeFieldPage.dd.cycle.do": "Deja que el idioma decida el reloj: en español, 24 horas.",
    "timeFieldPage.dd.cycle.dont": "Forzar 12 horas donde se lee en 24 obliga a traducir cada hora.",
  },
  en: {
    "demo.timeField.label": "Departure",
    "demo.timeField.forced24Label": "Arrival (24-hour)",
    "demo.timeField.optionsLabel": "Choose from the list",

    "timeFieldPage.description": "Takes a time of day, with no date, with one field per segment and a list of times.",

    "timeFieldPage.key.open": "Opens the list of times.",

    "timeFieldPage.key.digits": "Types the segment's value.",

    "timeFieldPage.key.move": "Moves to the previous or next segment.",

    "timeFieldPage.key.arrows": "Raises or lowers the focused segment.",

    "timeFieldPage.a11yYours1": "It must have a visible label.",

    "timeFieldPage.a11yDoes3": "The list of times is a listbox browsed with the arrows.",

    "timeFieldPage.a11yDoes2": "Each segment announces its name and value: hour, minute, AM/PM.",

    "timeFieldPage.a11yDoes1": "The group takes the name of the field's label.",

    "timeFieldPage.a11yIntro": "Each segment follows the APG spinbutton pattern, inside a named group.",

    "timeFieldPage.content2": "If the time zone matters, state it beside: “Santiago time”.",

    "timeFieldPage.content1": "Name the field by what happens at that time: “Start time”.",

    "timeFieldPage.whenNot3": 'If the system picker is enough: use the native <code>&lt;input type="time"&gt;</code>.',

    "timeFieldPage.whenNot2": 'For a duration (2 h 30 min): use <a href="/components/number-field">NumberField</a>.',

    "timeFieldPage.whenNot1": 'For a date: use <a href="/components/date-picker">DatePicker</a>.',

    "timeFieldPage.when2": "When it helps to offer common times in a list.",

    "timeFieldPage.when1": "For a time of day with no date: meetings, deliveries, shifts.",

    "timeFieldPage.contract3": "The value is a local <code>HH:mm</code> time, with no date or time zone.",

    "timeFieldPage.contract2": "Typing a digit advances to the next segment once no other fits.",

    "timeFieldPage.contract1": "Segment order and separator come from the language's <code>Intl.DateTimeFormat</code>.",

    "timeFieldPage.basicBody": "Type the digits or choose from the list. The arrows raise and lower the focused segment.",

    "timeFieldPage.basicTitle": "A time: segments and list",
    "timeFieldPage.lede": "TimeField takes a time of day, with no date: a meeting's time, a delivery's, a shift's. Hour, minute and AM/PM are typed separately, and a button opens a list of times. The 12 or 24 hour clock is decided by the language.",
    "timeFieldPage.anatomyBody":
      "A closed TimeField is a segmented control: the positioner, content and listbox rows only exist while the dropdown is open. That is why the specimen is drawn open and stays that way. It is frozen; the live TimeField is the one below.",
    "timeFieldPage.anatomyLabel": "TimeField anatomy",
    "timeFieldPage.anatomyPreviewLabel": "An open TimeField, part by part",
    "timeFieldPage.forced24Title": "24 hours: regardless of language",
    "timeFieldPage.forced24Body": '<code>hourCycle="h24"</code> fixes the clock for technical schedules, like shifts or flights.',
    "timeFieldPage.nativeTitle": 'Native: <input type="time">',
    "timeFieldPage.nativeBody": "It needs no CSS or JavaScript and brings the system picker. Use TimeField when you need the list of times or the same look in every browser.",
    "timeFieldPage.optionsTitle": "Every 15 minutes: the list with another step",
    "timeFieldPage.optionsBody": "<code>optionsStep</code> changes the list's interval, in minutes.",
    "timeFieldPage.test1": "Mounts once and names the group from the authored label.",
    "timeFieldPage.test2": "Derives the segments from the locale, not from the markup.",
    "timeFieldPage.test3": "Starts empty, with placeholders instead of a made-up time.",
    "timeFieldPage.prop.hourCycle.title": "Hour cycle: 12 or 24 hours",
    "timeFieldPage.prop.hourCycle.body": "Forces a clock; without it, the language decides.",
    "timeFieldPage.prop.hourCycle.h12": "Use <code>h12</code> only when the domain requires it, and always with AM and PM.",
    "timeFieldPage.prop.hourCycle.h24": "Use <code>h24</code> for technical schedules, like shifts or flights.",
    "timeFieldPage.guidelinesLede": "A time is faster to type than to pick, if the field helps type it.",
    "timeFieldPage.dd.cycle.title": "Clock: the language's",
    "timeFieldPage.dd.cycle.do": "Let the locale choose the clock: in Spanish, 24 hours.",
    "timeFieldPage.dd.cycle.dont": "Forcing 12 hours where people read 24 makes them translate every time.",
  },
} as const;
