export const datePickerMessages = {
  es: {

    "demo.datePicker.locale": "es-DO",
    "demo.datePicker.label": "Reserva",
    "demo.datePicker.placeholder": "dd/mm/aaaa",
    "demo.datePicker.clear": "Limpiar fecha",
    "demo.datePicker.anatomy.month": "sep 2026",
    "demo.datePicker.anatomy.dow1": "lu",
    "demo.datePicker.anatomy.dow2": "ma",
    "demo.datePicker.anatomy.dow3": "mi",
    "demo.datePicker.anatomy.dow4": "ju",
    "demo.datePicker.anatomy.dow5": "vi",
    "demo.datePicker.anatomy.dow6": "sá",
    "demo.datePicker.anatomy.dow7": "do",

    "datePicker.description": "Un campo de fecha que se escribe o se elige en un calendario.",

    "datePicker.a11yKeyEsc": "Cierra el calendario y devuelve el foco al campo.",

    "datePicker.a11yKeyOpen": "Con el botón enfocado, abre el calendario.",

    "datePicker.a11yYours2": "Deja escribir la fecha: elegirla en un calendario es más lento para una fecha lejana.",

    "datePicker.a11yYours1": "Debe tener una etiqueta visible.",

    "datePicker.a11yDoes3": 'La navegación dentro del calendario es la de <a href="/es/componentes/calendar">Calendar</a>.',

    "datePicker.a11yDoes2": "Al abrir, el foco pasa al día elegido; al cerrar, vuelve al botón.",

    "datePicker.a11yDoes1": "El botón que abre el calendario tiene nombre y anuncia si está abierto.",

    "datePicker.a11yIntro": "El campo tiene nombre por su etiqueta; el calendario sigue el contrato de Calendar.",

    "datePicker.content3": "Pasa el locale para que el calendario use los nombres y el primer día de la semana del idioma.",

    "datePicker.content2": "Muestra el formato esperado en el placeholder o en la ayuda: «dd/mm/aaaa».",

    "datePicker.content1": "Nombra el campo por lo que es la fecha: «Llegada», «Fecha de entrega», no «Fecha».",

    "datePicker.whenNot3": 'Para una hora: usa <a href="/es/componentes/time-field">TimeField</a>.',

    "datePicker.whenNot2": 'Si solo importa el mes o el año: usa un <a href="/es/componentes/select">Select</a>.',

    "datePicker.whenNot1": 'Si elegir la fecha es la tarea de la pantalla: usa <a href="/es/componentes/calendar">Calendar</a>, siempre visible.',

    "datePicker.when3": 'Para un rango, como llegada y salida: usa <code>selectionMode="range"</code>.',

    "datePicker.when2": "Cuando conviene poder escribirla o buscarla en un calendario.",

    "datePicker.when1": "Para una fecha que es un campo más de un formulario.",

    "datePicker.contract3": "El input nativo no necesita enhancer.",

    "datePicker.contract2": "La fecha es un <code>DateValue</code> con zona horaria explícita, no un texto ambiguo.",

    "datePicker.contract1": "React y Vanilla usan la misma máquina y el mismo cuerpo que <code>Calendar</code>: no hay dos grids.",

    "datePicker.prop.selectionMode.range": "Usa <code>range</code> para un inicio y un fin, como una reserva: se eligen en el mismo calendario.",

    "datePicker.prop.selectionMode.single": "Usa <code>single</code>, el valor por defecto, para una fecha.",

    "datePicker.prop.selectionMode.body": "Dice si el campo guarda una fecha o un inicio y un fin.",

    "datePicker.prop.selectionMode.title": "Selection mode: una fecha o un rango",
    "datePicker.anatomyBody": "El campo, el botón y el calendario abierto. El grid se documenta en Calendar.",
    "datePicker.anatomyLabel": "Anatomía de DatePicker",
    "datePicker.anatomyPreviewLabel": "DatePicker abierto, parte por parte",
    "datePicker.lede": 'DatePicker es un campo de fecha dentro de un formulario: se escribe o se elige en un calendario que se abre desde el campo. Tiene dos versiones: la nativa, un <code>&lt;input type="date"&gt;</code> sin JavaScript, y la propia, con un <a href="/es/componentes/calendar">Calendar</a> detrás de un botón, para rangos o un calendario igual en todos los navegadores.',
    "datePicker.nativeTitle": "Nativo: el control del sistema",
    "datePicker.nativeBody": "Sin JavaScript: el teclado, el formato local y el envío son del navegador.",
    "datePicker.customTitle": "Con calendario: el mismo en todos los navegadores",
    "datePicker.customBody": "El campo abre un Calendar. En pantallas angostas, el calendario sube como una hoja desde abajo.",
    "datePicker.disabledTitle": "Deshabilitado",
    "datePicker.disabledBody": "El campo, el input y el botón se deshabilitan juntos.",
    "datePicker.test1": "Rechaza markup al que le falta una parte que necesita parchar.",
    "datePicker.test2": "Parcha el control escrito a mano y renderiza el popover alrededor de un calendario.",
    "datePicker.test3": "Llena el campo con el día que eligió quien lee.",
    "demo.datePicker.dd.stay": "Estadía",
    "demo.datePicker.dd.start": "Llegada",
    "demo.datePicker.dd.end": "Salida",
    "datePicker.guidelinesLede": "Empieza por la versión nativa y sube a la propia solo cuando no alcanza.",
    "datePicker.dd.range.title": "Rango: un campo, no dos",
    "datePicker.dd.range.do": 'Con <code>selectionMode="range"</code>, inicio y fin se eligen en el mismo calendario.',
    "datePicker.dd.range.dont": "Dos campos sueltos dejan elegir una salida antes de la llegada.",
  },
  en: {

    "demo.datePicker.locale": "en-US",
    "demo.datePicker.label": "Booking",
    "demo.datePicker.placeholder": "mm/dd/yyyy",
    "demo.datePicker.clear": "Clear date",
    "demo.datePicker.anatomy.month": "Sep 2026",
    "demo.datePicker.anatomy.dow1": "Mo",
    "demo.datePicker.anatomy.dow2": "Tu",
    "demo.datePicker.anatomy.dow3": "We",
    "demo.datePicker.anatomy.dow4": "Th",
    "demo.datePicker.anatomy.dow5": "Fr",
    "demo.datePicker.anatomy.dow6": "Sa",
    "demo.datePicker.anatomy.dow7": "Su",

    "datePicker.description": "A date field that is typed or picked from a calendar.",

    "datePicker.a11yKeyEsc": "Closes the calendar and returns focus to the field.",

    "datePicker.a11yKeyOpen": "With the button focused, opens the calendar.",

    "datePicker.a11yYours2": "Let people type the date: picking a distant date from a calendar is slow.",

    "datePicker.a11yYours1": "It must have a visible label.",

    "datePicker.a11yDoes3": 'Navigation inside the calendar is <a href="/components/calendar">Calendar</a>\'s.',

    "datePicker.a11yDoes2": "On open, focus moves to the selected day; on close, it returns to the button.",

    "datePicker.a11yDoes1": "The button that opens the calendar is named and announces whether it is open.",

    "datePicker.a11yIntro": "The field is named by its label; the calendar follows Calendar's contract.",

    "datePicker.content3": "Pass the locale so the calendar uses the language's names and first day of the week.",

    "datePicker.content2": "Show the expected format in the placeholder or the hint: “dd/mm/yyyy”.",

    "datePicker.content1": "Name the field by what the date is: “Check-in”, “Delivery date”, not “Date”.",

    "datePicker.whenNot3": 'For a time: use <a href="/components/time-field">TimeField</a>.',

    "datePicker.whenNot2": 'If only the month or year matters: use a <a href="/components/select">Select</a>.',

    "datePicker.whenNot1": 'If picking the date is the task of the screen: use <a href="/components/calendar">Calendar</a>, always visible.',

    "datePicker.when3": 'For a range, such as check-in and check-out: use <code>selectionMode="range"</code>.',

    "datePicker.when2": "When it helps to be able to type it or look it up in a calendar.",

    "datePicker.when1": "For a date that is one more field in a form.",

    "datePicker.contract3": "The native input needs no enhancer.",

    "datePicker.contract2": "The date is a <code>DateValue</code> with an explicit time zone, not an ambiguous string.",

    "datePicker.contract1": "React and Vanilla use the same machine and the same body as <code>Calendar</code>: there are not two grids.",

    "datePicker.prop.selectionMode.range": "Use <code>range</code> for a start and an end, like a booking: both are picked in the same calendar.",

    "datePicker.prop.selectionMode.single": "Use <code>single</code>, the default, for one date.",

    "datePicker.prop.selectionMode.body": "Sets whether the field stores one date or a start and an end.",

    "datePicker.prop.selectionMode.title": "Selection mode: one date or a range",
    "datePicker.anatomyBody": "The field, the button and the open calendar. The grid is documented in Calendar.",
    "datePicker.anatomyLabel": "DatePicker anatomy",
    "datePicker.anatomyPreviewLabel": "An open DatePicker, part by part",
    "datePicker.lede": 'DatePicker is a date field inside a form: typed, or picked from a calendar that opens from the field. It comes in two versions: the native one, an <code>&lt;input type="date"&gt;</code> with no JavaScript, and its own, with a <a href="/components/calendar">Calendar</a> behind a button, for ranges or a calendar that looks the same in every browser.',
    "datePicker.nativeTitle": "Native: the system control",
    "datePicker.nativeBody": "No JavaScript: keyboard, local format and submission belong to the browser.",
    "datePicker.customTitle": "With a calendar: the same in every browser",
    "datePicker.customBody": "The field opens a Calendar. On narrow screens, the calendar slides up as a bottom sheet.",
    "datePicker.disabledTitle": "Disabled",
    "datePicker.disabledBody": "The field, the input and the button are disabled together.",
    "datePicker.test1": "Refuses markup that is missing a part it must patch.",
    "datePicker.test2": "Patches the authored control and renders the popover around a calendar.",
    "datePicker.test3": "Fills the field with the day the reader picked.",
    "demo.datePicker.dd.stay": "Stay",
    "demo.datePicker.dd.start": "Check-in",
    "demo.datePicker.dd.end": "Check-out",
    "datePicker.guidelinesLede": "Start with the native version and move to its own only when it falls short.",
    "datePicker.dd.range.title": "Range: one field, not two",
    "datePicker.dd.range.do": 'With <code>selectionMode="range"</code>, start and end are picked in the same calendar.',
    "datePicker.dd.range.dont": "Two separate fields let people pick a check-out before the check-in.",
  },
} as const;
