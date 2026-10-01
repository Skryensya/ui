export const calendarMessages = {
  es: {
    "demo.calendar.locale": "es-DO",
    "demo.calendar.availability": "Disponibilidad",
    "demo.calendar.stay": "Estadía",
    "demo.calendar.previousMonth": "Mes anterior",
    "demo.calendar.nextMonth": "Mes siguiente",

    "calendar.description":
      "Muestra un mes a la vista para elegir un día o un rango.",

    "calendar.a11yKeyEnter": "Elige el día con foco.",

    "calendar.a11yKeyHomeEnd": "Va al inicio o al fin de la semana.",

    "calendar.a11yKeyPage": "Pasa al mes anterior o al siguiente.",

    "calendar.a11yKeyArrows":
      "Mueve el foco un día, o una semana arriba y abajo.",

    "calendar.a11yYours2":
      "No marques feriados ni días especiales solo con color: agrega texto o un ícono con nombre.",

    "calendar.a11yYours1": "Debe tener <code>label</code>.",

    "calendar.a11yDoes4":
      "Los días fuera de <code>min</code> y <code>max</code> se anuncian deshabilitados.",

    "calendar.a11yDoes3":
      "Las abreviaturas de los días guardan el nombre completo en un <code>&lt;abbr&gt;</code>.",

    "calendar.a11yDoes2":
      "Los botones anterior y siguiente dicen qué cambian: mes, año o década.",

    "calendar.a11yDoes1":
      'El mes es un <code>role="grid"</code>; el foco se mueve entre días con las flechas.',

    "calendar.a11yIntro":
      "Calendar sigue el patrón de grid de fechas de la APG.",

    "calendar.content2":
      "Nombra el calendario con <code>label</code>: «Disponibilidad», «Estadía».",

    "calendar.content1":
      "Pasa el locale en vez de traducir los nombres: decide los meses, los días y el primer día de la semana.",

    "calendar.dd.limits.dont":
      "Si todo parece elegible, la persona elige una fecha y después se entera de que no estaba disponible.",

    "calendar.dd.limits.do":
      "Con <code>min</code> y <code>max</code>, la persona ve de entrada qué fechas están disponibles.",

    "calendar.dd.limits.title":
      "Límites: deshabilita lo que no se puede elegir",

    "calendar.whenNot3":
      'Para una hora: usa <a href="/es/componentes/time-field">TimeField</a>.',

    "calendar.whenNot2":
      'Si la fecha se escribe más rápido de lo que se busca, como una fecha de nacimiento: usa el campo de <a href="/es/componentes/date-picker">DatePicker</a>.',

    "calendar.whenNot1":
      'Para una fecha dentro de un formulario: usa <a href="/es/componentes/date-picker">DatePicker</a>, que abre este calendario desde un campo.',

    "calendar.when2":
      "Cuando ver el mes ayuda a decidir: fines de semana, feriados, cuántos días quedan.",

    "calendar.when1":
      "Cuando elegir la fecha es la tarea de la pantalla: una reserva, una agenda, un filtro de un panel.",

    "calendar.contract4":
      "La misma tabla sirve a las tres vistas; <code>sk-calendar__month-grid</code> y <code>sk-calendar__year-grid</code> son modificadores.",

    "calendar.contract3":
      "<code>data-min</code> y <code>data-max</code> (fechas ISO) deshabilitan lo que cae fuera, en las tres vistas.",

    "calendar.contract2":
      "Los días dentro del rango llevan <code>data-in-range</code>; los extremos, <code>data-selected</code>.",

    "calendar.contract1":
      "El botón del encabezado sube de vista (día, mes, década) y elegir una celda baja un nivel. No hay selects de mes y año.",
    "calendar.lede":
      'Calendar muestra un mes a la vista para elegir un día o un rango, cuando ver los fines de semana y los días que quedan ayuda a decidir. Es el mismo grid que abre <a href="/es/componentes/date-picker">DatePicker</a>, sin el campo.',
    "calendar.anatomyBody":
      "Vista de día: etiqueta, encabezado (anterior, cambio de vista, siguiente), tabla, cabecera de días, celda y su botón.",
    "calendar.anatomyLabel": "Anatomía de Calendar (día)",
    "calendar.anatomyPreviewLabel": "Calendar, vista de día",
    "calendar.anatomyMonthBody":
      "Vista de mes: la misma tabla con <code>sk-calendar__month-grid</code>, doce celdas en 4×3.",
    "calendar.anatomyMonthLabel": "Anatomía de Calendar (mes)",
    "calendar.anatomyMonthPreviewLabel": "Calendar, vista de mes",
    "calendar.anatomyYearBody":
      "Vista de año: la misma tabla con <code>sk-calendar__year-grid</code>; el encabezado muestra la década.",
    "calendar.anatomyYearLabel": "Anatomía de Calendar (año)",
    "calendar.anatomyYearPreviewLabel": "Calendar, vista de año",
    "calendar.gridTitle": "Un día: el mes completo a la vista",
    "calendar.gridBody":
      "Seis semanas fijas, así el alto no cambia al pasar de mes.",
    "calendar.rangeTitle": "Rango: inicio y fin en el mismo calendario",
    "calendar.rangeBody1":
      "El primer clic fija el inicio y el segundo el fin; los días del medio se marcan, también mientras se elige.",
    "calendar.minMaxTitle": "Límites: min y max",
    "calendar.minMaxBody1":
      "Lo que cae fuera del rango queda deshabilitado, en la vista de día, de mes y de año.",
    "calendar.test1":
      "Genera todo el grid desde una raíz escrita a mano vacía, una sola vez.",
    "calendar.test2":
      "Nombra los días de la semana en el locale escrito a mano.",
    "calendar.test3": "Abre en la fecha escrita a mano en vez de en hoy.",
    "calendar.test4":
      "Pinta cada control del calendario en un solo escalón de tamaño, incluidas las celdas de día.",
    "calendar.prop.selectionMode.title": "Selection mode: un día o un rango",
    "calendar.prop.selectionMode.body":
      "Dice si la persona elige una fecha o un inicio y un fin.",
    "calendar.prop.selectionMode.single":
      "Usa <code>single</code>, el valor por defecto, para una fecha.",
    "calendar.prop.selectionMode.range":
      "Usa <code>range</code> para un inicio y un fin, como una reserva.",
    "calendar.guidelinesLede":
      "Calendar hace de elegir una fecha la tarea de la pantalla.",
    "calendar.dd.range.title": "Rango: un solo calendario",
    "calendar.dd.range.do":
      "Inicio y fin en el mismo calendario: el rango se ve entero.",
    "calendar.dd.range.dont":
      "Dos calendarios no muestran el rango y dejan elegir un fin antes del inicio.",
  },
  en: {
    "demo.calendar.locale": "en-US",
    "demo.calendar.availability": "Availability",
    "demo.calendar.stay": "Stay",
    "demo.calendar.previousMonth": "Previous month",
    "demo.calendar.nextMonth": "Next month",

    "calendar.description": "Shows a month in view to pick a day or a range.",

    "calendar.a11yKeyEnter": "Picks the focused day.",

    "calendar.a11yKeyHomeEnd": "Goes to the start or end of the week.",

    "calendar.a11yKeyPage": "Goes to the previous or next month.",

    "calendar.a11yKeyArrows": "Moves focus one day, or one week up and down.",

    "calendar.a11yYours2":
      "Do not mark holidays or special days with color alone: add text or a named icon.",

    "calendar.a11yYours1": "It must have a <code>label</code>.",

    "calendar.a11yDoes4":
      "Days outside <code>min</code> and <code>max</code> are announced as disabled.",

    "calendar.a11yDoes3":
      "Weekday abbreviations keep the full name in an <code>&lt;abbr&gt;</code>.",

    "calendar.a11yDoes2":
      "The previous and next buttons say what they change: month, year or decade.",

    "calendar.a11yDoes1":
      'The month is a <code>role="grid"</code>; focus moves between days with the arrow keys.',

    "calendar.a11yIntro": "Calendar follows the APG date grid pattern.",

    "calendar.content2":
      "Name the calendar with <code>label</code>: “Availability”, “Stay”.",

    "calendar.content1":
      "Pass the locale instead of translating names: it sets the months, the days and the first day of the week.",

    "calendar.dd.limits.dont":
      "If everything looks available, people pick a date and only then learn it was not.",

    "calendar.dd.limits.do":
      "With <code>min</code> and <code>max</code>, people see up front which dates are available.",

    "calendar.dd.limits.title": "Limits: disable what cannot be picked",

    "calendar.whenNot3":
      'For a time: use <a href="/components/time-field">TimeField</a>.',

    "calendar.whenNot2":
      'If the date is typed faster than it is found, like a date of birth: use <a href="/components/date-picker">DatePicker</a>\'s field.',

    "calendar.whenNot1":
      'For a date inside a form: use <a href="/components/date-picker">DatePicker</a>, which opens this calendar from a field.',

    "calendar.when2":
      "When seeing the month helps people decide: weekends, holidays, how many days are left.",

    "calendar.when1":
      "When picking the date is the task of the screen: a booking, a schedule, a dashboard filter.",

    "calendar.contract4":
      "The same table serves all three views; <code>sk-calendar__month-grid</code> and <code>sk-calendar__year-grid</code> are modifiers.",

    "calendar.contract3":
      "<code>data-min</code> and <code>data-max</code> (ISO dates) disable what falls outside, in all three views.",

    "calendar.contract2":
      "Days inside the range carry <code>data-in-range</code>; the ends, <code>data-selected</code>.",

    "calendar.contract1":
      "The header button steps up a view (day, month, decade) and picking a cell steps back down. There are no month and year selects.",
    "calendar.lede":
      'Calendar shows a month in view to pick a day or a range, when seeing weekends and remaining days helps people decide. It is the same grid <a href="/components/date-picker">DatePicker</a> opens, without the field.',
    "calendar.anatomyBody":
      "Day view: label, header (previous, view switch, next), table, weekday header, cell and its button.",
    "calendar.anatomyLabel": "Calendar anatomy (day)",
    "calendar.anatomyPreviewLabel": "Calendar, day view",
    "calendar.anatomyMonthBody":
      "Month view: the same table with <code>sk-calendar__month-grid</code>, twelve cells in 4×3.",
    "calendar.anatomyMonthLabel": "Calendar anatomy (month)",
    "calendar.anatomyMonthPreviewLabel": "Calendar, month view",
    "calendar.anatomyYearBody":
      "Year view: the same table with <code>sk-calendar__year-grid</code>; the header shows the decade.",
    "calendar.anatomyYearLabel": "Calendar anatomy (year)",
    "calendar.anatomyYearPreviewLabel": "Calendar, year view",
    "calendar.gridTitle": "One day: the whole month in view",
    "calendar.gridBody":
      "Six fixed weeks, so the height does not change from month to month.",
    "calendar.rangeTitle": "Range: start and end in one calendar",
    "calendar.rangeBody1":
      "The first click sets the start and the second the end; the days between are marked, also while choosing.",
    "calendar.minMaxTitle": "Limits: min and max",
    "calendar.minMaxBody1":
      "Anything outside the range is disabled, in the day, month and year views.",
    "calendar.test1":
      "Generates the whole grid from an empty authored root, once.",
    "calendar.test2": "Names the weekdays in the authored locale.",
    "calendar.test3": "Opens on the authored date rather than on today.",
    "calendar.test4":
      "Paints every control in the calendar at one size tier, day cells included.",
    "calendar.prop.selectionMode.title": "Selection mode: one day or a range",
    "calendar.prop.selectionMode.body":
      "Sets whether people pick one date or a start and an end.",
    "calendar.prop.selectionMode.single":
      "Use <code>single</code>, the default, for one date.",
    "calendar.prop.selectionMode.range":
      "Use <code>range</code> for a start and an end, such as a booking.",
    "calendar.guidelinesLede":
      "Calendar makes picking a date the task of the screen.",
    "calendar.dd.range.title": "Range: one calendar",
    "calendar.dd.range.do":
      "Start and end in the same calendar: the whole range is visible.",
    "calendar.dd.range.dont":
      "Two calendars do not show the range and let people pick an end before the start.",
  },
} as const;
