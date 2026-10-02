export const progressMessages = {
  es: {
    "demo.progress.running": "Subiendo informe.pdf",
    "demo.progress.done": "Importación de contactos",
    "demo.progress.doneValue": "Listo",
    "demo.progress.failed": "Instalación del paquete",
    "demo.progress.failedValue": "Se detuvo en 40%",
    "demo.progress.steps": "Configuración de la cuenta",
    "demo.progress.stepsValue": "Paso 3 de 5",
    "progressPage.valueTitle": "Value: cuánto lleva",
    "progressPage.valueBody": "La barra se llena según el valor. Con el texto al lado, la persona sabe de qué tarea se trata y cuánto lleva.",
    "progressPage.valueLabel": "Avance de la tarea",
    "progressPage.valueExplain.0": "Recién empieza: la pista vacía.",
    "progressPage.valueExplain.25": "Un cuarto: ya se nota que avanza.",
    "progressPage.valueExplain.68": "Más de la mitad de la tarea.",
    "progressPage.valueExplain.100": "Terminó: la barra llena. Un tono de éxito lo confirma.",
    "progressPage.stepsTitle": "Con otro máximo: pasos en vez de porcentaje",
    "progressPage.stepsBody": "La barra se llena en proporción al máximo que le des: tres de cinco pasos es el 60%.",
    "progressPage.dd.value.title": "Decir cuánto lleva",
    "progressPage.dd.value.do": "El nombre de la tarea y el avance en palabras junto a la barra.",
    "progressPage.dd.value.dont": "Solo la barra: se ve que hay algo a medias, pero no de qué ni cuánto.",
    "demo.progress.seg.account": "Cuenta",
    "demo.progress.seg.profile": "Perfil",
    "demo.progress.seg.team": "Equipo",
    "demo.progress.seg.plan": "Plan",
    "demo.progress.seg.done": "Listo",
    "progressPage.styleTitle": "Barra o segmentos",
    "progressPage.styleBody": "Para un camino de pasos, una barra por paso dice más que una sola: se ve cuántos van y cuántos faltan. Es lo que usa Questionnaire.",
    "progressPage.styleLabel": "Cómo se dibuja el avance",
    "progressPage.style.bar": "Una barra",
    "progressPage.style.segments": "Por segmentos",
    "progressPage.styleExplain.bar": "Una sola barra llena en proporción: tres de cinco pasos, el 60%. Sirve cuando lo que importa es cuánto falta.",
    "progressPage.styleExplain.segments": "Una barra por paso: se cuentan las que ya están llenas. Sirve cuando los pasos importan por separado.",
    "progressPage.segmentsTitle": "Por segmentos: los pasos de un flujo",
    "progressPage.segmentsBody": 'Es <a href="/es/componentes/steps">Steps</a> dibujado como barras, el mismo avance que usa <a href="/es/componentes/questionnaire">Questionnaire</a>: dos pasos hechos, el tercero en curso.',
    "demo.progress.upload": "Subida",
    "demo.progress.complete": "Completado",
    "demo.progress.quota": "Cuota",

    "progressPage.description": "Muestra cuánto falta para terminar una tarea de largo conocido.",

    "progressPage.a11yYours2": "No dependas solo del tono: el texto también dice si falló.",

    "progressPage.a11yYours1": "Anuncia el final: los lectores de pantalla no leen cada cambio de valor.",

    "progressPage.a11yDoes2": "La etiqueta visible nombra la barra.",

    "progressPage.a11yDoes1": "Se anuncia como una barra de progreso, con su valor actual y su rango.",

    "progressPage.a11yIntro": "Progress se anuncia como barra de progreso, con su valor.",

    "progressPage.content3": "Si falla, di qué pasó y qué hacer: «Se perdió la conexión. Reintenta».",

    "progressPage.content2": "Cuando termina, cambia la etiqueta: «10 archivos subidos».",

    "progressPage.content1": "Di qué avanza: «Subiendo 3 de 10 archivos», «Importando contactos».",

    "progressPage.whenNot3": 'Para los pasos de un formulario: usa <a href="/es/componentes/steps">Steps</a>.',

    "progressPage.whenNot2": 'Para una medida que sube y baja, como una batería: usa <a href="/es/componentes/meter">Meter</a>.',

    "progressPage.whenNot1": 'Si no sabes cuánto falta: usa <a href="/es/componentes/loader">Loader</a>.',

    "progressPage.when2": "Para los pasos completados de un total conocido: «3 de 10 archivos».",

    "progressPage.when1": "Para una tarea con un final conocido: subir archivos, importar, instalar.",

    "progressPage.contract2": "El valor se mantiene entre 0 y el máximo: uno fuera de rango no rompe la barra.",

    "progressPage.contract1": "Es solo la barra: el nombre de la tarea y el valor en palabras los pones tú, junto a ella.",

    "progressPage.tasksBody": "Cada barra con el nombre de su tarea y el avance en palabras, y un tono que dice lo mismo.",

    "progressPage.tasksTitle": "Tareas: en curso, terminada y detenida",
    "progressPage.lede": "Progress muestra cuánto falta para terminar una tarea de largo conocido: una subida de archivos, una importación, una instalación. Si no sabes cuánto falta, usa Loader; si es una medida que sube y baja, Meter.",
    "progressPage.anatomyBody":
      "Este diagrama nombra la pista y la barra de relleno. El espécimen está congelado; los Progress vivos empiezan abajo.",
    "progressPage.anatomyLabel": "Anatomía de Progress",
    "progressPage.anatomyPreviewLabel": "Progress, parte por parte",
    "progressPage.test1": "Expone el valor en el rol <code>progressbar</code> y pinta el relleno correspondiente.",
    "progressPage.test2": "Recorta un valor fuera de rango para que el relleno y <code>aria-valuenow</code> coincidan.",
    "demo.progress.dd.battery": "Batería",
    "progressPage.prop.tone.title": "Tone: el estado de la tarea",
    "progressPage.prop.tone.body": "Dice si la tarea avanza, terminó, necesita atención o falló.",
    "progressPage.prop.tone.accent": "Usa <code>accent</code>, el valor por defecto, mientras la tarea avanza.",
    "progressPage.prop.tone.success": "Usa <code>success</code> cuando la tarea terminó bien.",
    "progressPage.prop.tone.warning": "Usa <code>warning</code> cuando la tarea sigue pero algo necesita atención.",
    "progressPage.prop.tone.danger": "Usa <code>danger</code> cuando la tarea falló o se detuvo.",
    "progressPage.guidelinesLede": "Una barra que avanza dice que la tarea sigue viva y cuánto queda.",
    "progressPage.dd.tone.title": "Tone: sigue al estado",
    "progressPage.dd.tone.do": "Mientras la tarea avanza, deja el tono por defecto.",
    "progressPage.dd.tone.dont": "No uses <code>success</code> antes de que la tarea termine.",
    "progressPage.dd.task.title": "Tarea: no una medida",
    "progressPage.dd.task.do": "Usa Progress para algo que empieza, avanza y termina.",
    "progressPage.dd.task.dont": 'Una batería no termina: es una medida, y eso es <a href="/es/componentes/meter">Meter</a>.',
  },
  en: {
    "demo.progress.running": "Uploading report.pdf",
    "demo.progress.done": "Contacts import",
    "demo.progress.doneValue": "Done",
    "demo.progress.failed": "Package install",
    "demo.progress.failedValue": "Stopped at 40%",
    "demo.progress.steps": "Account setup",
    "demo.progress.stepsValue": "Step 3 of 5",
    "progressPage.valueTitle": "Value: how far along",
    "progressPage.valueBody": "The bar fills by the value. With the text beside it, people know which task it is and how far along it is.",
    "progressPage.valueLabel": "Task progress",
    "progressPage.valueExplain.0": "Just starting: the empty track.",
    "progressPage.valueExplain.25": "A quarter: it already reads as moving.",
    "progressPage.valueExplain.68": "More than half of the task.",
    "progressPage.valueExplain.100": "Done: the bar is full. A success tone confirms it.",
    "progressPage.stepsTitle": "With another maximum: steps instead of a percentage",
    "progressPage.stepsBody": "The bar fills in proportion to the maximum you give it: three of five steps is 60%.",
    "progressPage.dd.value.title": "Saying how far along",
    "progressPage.dd.value.do": "The task's name and its progress in words beside the bar.",
    "progressPage.dd.value.dont": "Only the bar: it shows something is half done, but not what or how much.",
    "demo.progress.seg.account": "Account",
    "demo.progress.seg.profile": "Profile",
    "demo.progress.seg.team": "Team",
    "demo.progress.seg.plan": "Plan",
    "demo.progress.seg.done": "Done",
    "progressPage.styleTitle": "Bar or segments",
    "progressPage.styleBody": "For a path of steps, a bar per step says more than a single one: you see how many are done and how many are left. It is what Questionnaire uses.",
    "progressPage.styleLabel": "How progress is drawn",
    "progressPage.style.bar": "One bar",
    "progressPage.style.segments": "Segments",
    "progressPage.styleExplain.bar": "A single bar filling in proportion: three of five steps, 60%. It suits when what matters is how much is left.",
    "progressPage.styleExplain.segments": "A bar per step: you count the ones already full. It suits when the steps matter on their own.",
    "progressPage.segmentsTitle": "Segments: the steps of a flow",
    "progressPage.segmentsBody": 'It is <a href="/components/steps">Steps</a> drawn as bars, the same progress <a href="/components/questionnaire">Questionnaire</a> uses: two steps done, the third in progress.',
    "demo.progress.upload": "Upload",
    "demo.progress.complete": "Complete",
    "demo.progress.quota": "Quota",

    "progressPage.description": "Shows how much is left to finish a task of known length.",

    "progressPage.a11yYours2": "Do not rely on tone alone: the text also says it failed.",

    "progressPage.a11yYours1": "Announce the end: screen readers do not read every value change.",

    "progressPage.a11yDoes2": "The visible label names the bar.",

    "progressPage.a11yDoes1": "It is announced as a progress bar, with its current value and range.",

    "progressPage.a11yIntro": "Progress is announced as a progress bar, with its value.",

    "progressPage.content3": "If it fails, say what happened and what to do: “Connection lost. Retry”.",

    "progressPage.content2": "When it finishes, change the label: “10 files uploaded”.",

    "progressPage.content1": "Say what is advancing: “Uploading 3 of 10 files”, “Importing contacts”.",

    "progressPage.whenNot3": 'For a form\'s steps: use <a href="/components/steps">Steps</a>.',

    "progressPage.whenNot2": 'For a measurement that goes up and down, like a battery: use <a href="/components/meter">Meter</a>.',

    "progressPage.whenNot1": 'If you do not know how long is left: use <a href="/components/loader">Loader</a>.',

    "progressPage.when2": "For completed items of a known total: “3 of 10 files”.",

    "progressPage.when1": "For a task with a known end: uploading files, importing, installing.",

    "progressPage.contract2": "The value stays between 0 and the maximum: an out-of-range one does not break the bar.",

    "progressPage.contract1": "It is only the bar: the task's name and the value in words are yours to put beside it.",

    "progressPage.tasksBody": "Each bar with its task's name and its progress in words, and a tone that says the same.",

    "progressPage.tasksTitle": "Tasks: running, done and stopped",
    "progressPage.lede": "Progress shows how much is left to finish a task of known length: a file upload, an import, an installation. If you do not know how long is left, use Loader; if it is a measurement that goes up and down, Meter.",
    "progressPage.anatomyBody":
      "This diagram names the track and the fill bar. The specimen is frozen; the live Progress bars begin below.",
    "progressPage.anatomyLabel": "Progress anatomy",
    "progressPage.anatomyPreviewLabel": "Progress, part by part",
    "progressPage.test1": "Exposes the value on the progressbar role and paints the matching fill.",
    "progressPage.test2": "Clamps an out-of-range value so the paint and aria-valuenow agree.",
    "demo.progress.dd.battery": "Battery",
    "progressPage.prop.tone.title": "Tone: the task's state",
    "progressPage.prop.tone.body": "Says whether the task is advancing, done, needs attention or failed.",
    "progressPage.prop.tone.accent": "Use <code>accent</code>, the default, while the task advances.",
    "progressPage.prop.tone.success": "Use <code>success</code> when the task finished well.",
    "progressPage.prop.tone.warning": "Use <code>warning</code> when the task continues but something needs attention.",
    "progressPage.prop.tone.danger": "Use <code>danger</code> when the task failed or stopped.",
    "progressPage.guidelinesLede": "A moving bar says the task is alive and how much is left.",
    "progressPage.dd.tone.title": "Tone: follows the state",
    "progressPage.dd.tone.do": "While the task is running, keep the default tone.",
    "progressPage.dd.tone.dont": "Do not use <code>success</code> before the task is done.",
    "progressPage.dd.task.title": "Task: not a measurement",
    "progressPage.dd.task.do": "Use Progress for something that starts, runs and ends.",
    "progressPage.dd.task.dont": 'A battery does not finish: it is a measurement, and that is <a href="/components/meter">Meter</a>.',
  },
} as const;
