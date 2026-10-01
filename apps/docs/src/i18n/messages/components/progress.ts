export const progressMessages = {
  es: {
    "demo.progress.upload": "Subida",
    "demo.progress.complete": "Completado",
    "demo.progress.quota": "Cuota",

    "progressPage.description": "Muestra cuánto falta para terminar una tarea de largo conocido.",

    "progressPage.a11yYours2": "No dependas solo del tono: el texto también dice si falló.",

    "progressPage.a11yYours1": "Anuncia el final: los lectores de pantalla no leen cada cambio de valor.",

    "progressPage.a11yDoes2": "La etiqueta visible nombra la barra.",

    "progressPage.a11yDoes1": "Usa el rol <code>progressbar</code>, con el valor actual y el rango.",

    "progressPage.a11yIntro": "Progress se anuncia como barra de progreso, con su valor.",

    "progressPage.content3": "Si falla, di qué pasó y qué hacer: «Se perdió la conexión. Reintenta».",

    "progressPage.content2": "Cuando termina, cambia la etiqueta: «10 archivos subidos».",

    "progressPage.content1": "Di qué avanza: «Subiendo 3 de 10 archivos», «Importando contactos».",

    "progressPage.whenNot3": 'Para los pasos de un formulario: usa <a href="/es/componentes/steps">Steps</a>.',

    "progressPage.whenNot2": 'Para una medida que sube y baja, como una batería: usa <a href="/es/componentes/meter">Meter</a>.',

    "progressPage.whenNot1": 'Si no sabes cuánto falta: usa <a href="/es/componentes/loader">Loader</a>.',

    "progressPage.when2": "Para los pasos completados de un total conocido: «3 de 10 archivos».",

    "progressPage.when1": "Para una tarea con un final conocido: subir archivos, importar, instalar.",

    "progressPage.contract2": "El valor se recorta entre 0 y <code>max</code>: un valor fuera de rango no rompe la barra.",

    "progressPage.contract1": "Rol <code>progressbar</code> con <code>aria-valuenow</code>, <code>aria-valuemin</code> y <code>aria-valuemax</code>.",

    "progressPage.tasksBody": "Cada barra con su etiqueta y un tono que dice lo mismo que el texto.",

    "progressPage.tasksTitle": "Tareas: en curso, terminada y con un problema",
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
    "demo.progress.upload": "Upload",
    "demo.progress.complete": "Complete",
    "demo.progress.quota": "Quota",

    "progressPage.description": "Shows how much is left to finish a task of known length.",

    "progressPage.a11yYours2": "Do not rely on tone alone: the text also says it failed.",

    "progressPage.a11yYours1": "Announce the end: screen readers do not read every value change.",

    "progressPage.a11yDoes2": "The visible label names the bar.",

    "progressPage.a11yDoes1": "It uses the <code>progressbar</code> role, with the current value and range.",

    "progressPage.a11yIntro": "Progress is announced as a progress bar, with its value.",

    "progressPage.content3": "If it fails, say what happened and what to do: “Connection lost. Retry”.",

    "progressPage.content2": "When it finishes, change the label: “10 files uploaded”.",

    "progressPage.content1": "Say what is advancing: “Uploading 3 of 10 files”, “Importing contacts”.",

    "progressPage.whenNot3": 'For a form\'s steps: use <a href="/components/steps">Steps</a>.',

    "progressPage.whenNot2": 'For a measurement that goes up and down, like a battery: use <a href="/components/meter">Meter</a>.',

    "progressPage.whenNot1": 'If you do not know how long is left: use <a href="/components/loader">Loader</a>.',

    "progressPage.when2": "For completed items of a known total: “3 of 10 files”.",

    "progressPage.when1": "For a task with a known end: uploading files, importing, installing.",

    "progressPage.contract2": "The value is clamped between 0 and <code>max</code>: an out-of-range value does not break the bar.",

    "progressPage.contract1": "Role <code>progressbar</code> with <code>aria-valuenow</code>, <code>aria-valuemin</code> and <code>aria-valuemax</code>.",

    "progressPage.tasksBody": "Each bar with its label and a tone that says what the text says.",

    "progressPage.tasksTitle": "Tasks: running, done and with a problem",
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
