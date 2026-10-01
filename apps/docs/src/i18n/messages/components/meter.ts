export const meterMessages = {
  es: {

    "meterPage.description": "Muestra una medida dentro de un rango conocido: el uso del disco, la batería, una calificación.",

    "meterPage.a11yYours2": "No dependas solo del tono: el número también dice si el valor es un problema.",

    "meterPage.a11yYours1": "Da el valor con su unidad en <code>valueText</code>: «72 de 100 GB».",

    "meterPage.a11yDoes2": "La etiqueta visible nombra la barra.",

    "meterPage.a11yDoes1": "Usa el rol <code>meter</code>, con el valor actual, el mínimo y el máximo.",

    "meterPage.a11yIntro": "Meter se anuncia como medida, con su valor y su rango.",

    "meterPage.content2": "Muestra el valor con su unidad y el total: «72 de 100 GB», no solo «72 %».",

    "meterPage.content1": "Nombra qué se mide: «Almacenamiento», «Batería».",

    "meterPage.whenNot3": 'Para un número sin barra: usa <a href="/es/componentes/stat">Stat</a>.',

    "meterPage.whenNot2": 'Para una espera de largo desconocido: usa <a href="/es/componentes/loader">Loader</a>.',

    "meterPage.whenNot1": 'Para el avance de una tarea que termina: usa <a href="/es/componentes/progress">Progress</a>.',

    "meterPage.when2": "Para comparar varias medidas del mismo tipo, una debajo de otra.",

    "meterPage.when1": "Para una medida dentro de un rango conocido: disco, batería, cuota, una calificación.",

    "meterPage.contract3": "El relleno se calcula en el rango entre <code>min</code> y <code>max</code>.",

    "meterPage.contract2": "<code>aria-valuetext</code> lee el valor con su unidad: «72 de 100 GB».",

    "meterPage.contract1": "Rol <code>meter</code> con <code>aria-valuenow</code>, <code>aria-valuemin</code> y <code>aria-valuemax</code> siempre presentes.",

    "meterPage.panelBody": "<code>min</code> no tiene que ser cero: una calificación va de 1 a 5, una temperatura puede ser negativa.",

    "meterPage.panelTitle": "Varias medidas: cada una con su escala",
    "meterPage.lede": "Meter muestra una medida dentro de un rango conocido: el uso del disco, el nivel de batería, una calificación de 1 a 5. El valor sube y baja; no es el avance de una tarea que termina, que es Progress.",
    "meterPage.anatomyBody":
      "Este diagrama nombra el grupo, el encabezado, la etiqueta, el valor, la pista y la barra. El espécimen está congelado; los meters vivos empiezan abajo.",
    "meterPage.anatomyLabel": "Anatomía de Meter",
    "meterPage.anatomyPreviewLabel": "Meter, parte por parte",
    "meterPage.test1": "Aplica role=meter con los tres atributos aria-value obligatorios.",
    "meterPage.test2":
      "Respeta un min distinto de cero al pintar el relleno, a diferencia de Progress.",

    "demo.meter.rating": "Calificación",
    "demo.meter.ratingText": "4 de 5 estrellas",
    "demo.meter.disk": "Uso de disco",
    "demo.meter.diskText": "92% usado",
    "demo.meter.battery": "Batería",
    "demo.meter.batteryText": "68% restante",
    "demo.meter.dd.upload": "Subiendo archivo",
    "meterPage.prop.tone.title": "Tone: cómo leer el valor",
    "meterPage.prop.tone.body": "Dice si el valor está bien, si conviene revisarlo o si ya es un problema.",
    "meterPage.prop.tone.accent": "Usa <code>accent</code>, el valor por defecto, para una medida sin juicio: solo cuánto hay.",
    "meterPage.prop.tone.success": "Usa <code>success</code> cuando el valor está en un rango sano.",
    "meterPage.prop.tone.warning": "Usa <code>warning</code> cuando el valor se acerca a un límite.",
    "meterPage.prop.tone.danger": "Usa <code>danger</code> cuando el valor ya pasó el límite.",
    "meterPage.guidelinesLede": "Una barra de medida se compara de un vistazo; el número al lado da la cifra exacta.",
    "meterPage.dd.tone.title": "Tone: dice lo mismo que el valor",
    "meterPage.dd.tone.do": "Un disco casi lleno lleva <code>danger</code>: el color dice lo mismo que el número.",
    "meterPage.dd.tone.dont": "Un <code>success</code> sobre un valor que es un problema contradice al número.",
    "meterPage.dd.measure.title": "Medida: no una tarea",
    "meterPage.dd.measure.do": "Una cantidad que sube y baja: batería, disco, una puntuación.",
    "meterPage.dd.measure.dont": 'El avance de una subida va de 0 a 100 y termina: eso es <a href="/es/componentes/progress">Progress</a>.',
  },
  en: {

    "meterPage.description": "Shows a measurement within a known range: disk usage, battery, a rating.",

    "meterPage.a11yYours2": "Do not rely on tone alone: the number also says whether the value is a problem.",

    "meterPage.a11yYours1": "Give the value with its unit in <code>valueText</code>: “72 of 100 GB”.",

    "meterPage.a11yDoes2": "The visible label names the bar.",

    "meterPage.a11yDoes1": "It uses the <code>meter</code> role, with the current value, minimum and maximum.",

    "meterPage.a11yIntro": "Meter is announced as a measurement, with its value and range.",

    "meterPage.content2": "Show the value with its unit and total: “72 of 100 GB”, not just “72%”.",

    "meterPage.content1": "Name what is measured: “Storage”, “Battery”.",

    "meterPage.whenNot3": 'For a number with no bar: use <a href="/components/stat">Stat</a>.',

    "meterPage.whenNot2": 'For a wait of unknown length: use <a href="/components/loader">Loader</a>.',

    "meterPage.whenNot1": 'For a task\'s progress toward an end: use <a href="/components/progress">Progress</a>.',

    "meterPage.when2": "To compare several measurements of the same kind, one below another.",

    "meterPage.when1": "For a measurement within a known range: disk, battery, quota, a rating.",

    "meterPage.contract3": "The fill is computed over the range between <code>min</code> and <code>max</code>.",

    "meterPage.contract2": "<code>aria-valuetext</code> reads the value with its unit: “72 of 100 GB”.",

    "meterPage.contract1": "Role <code>meter</code> with <code>aria-valuenow</code>, <code>aria-valuemin</code> and <code>aria-valuemax</code> always present.",

    "meterPage.panelBody": "<code>min</code> need not be zero: a rating goes from 1 to 5, a temperature can be negative.",

    "meterPage.panelTitle": "Several measurements: each with its scale",
    "meterPage.lede": "Meter shows a measurement within a known range: disk usage, battery level, a 1 to 5 rating. The value goes up and down; it is not a task's progress toward an end, which is Progress.",
    "meterPage.anatomyBody":
      "This diagram names the group, the header, the label, the value, the track, and the bar. The specimen is frozen; the live meters start below.",
    "meterPage.anatomyLabel": "Meter anatomy",
    "meterPage.anatomyPreviewLabel": "Meter, part by part",
    "meterPage.test1": "Sets role=meter with the three required aria-value attributes.",
    "meterPage.test2": "Honors a non-zero min when painting the fill, unlike Progress.",

    "demo.meter.rating": "Rating",
    "demo.meter.ratingText": "4 out of 5 stars",
    "demo.meter.disk": "Disk usage",
    "demo.meter.diskText": "92% used",
    "demo.meter.battery": "Battery",
    "demo.meter.batteryText": "68% remaining",
    "demo.meter.dd.upload": "Uploading file",
    "meterPage.prop.tone.title": "Tone: how to read the value",
    "meterPage.prop.tone.body": "Says whether the value is fine, worth checking or already a problem.",
    "meterPage.prop.tone.accent": "Use <code>accent</code>, the default, for a measurement without judgment: just how much.",
    "meterPage.prop.tone.success": "Use <code>success</code> when the value is in a healthy range.",
    "meterPage.prop.tone.warning": "Use <code>warning</code> when the value is getting close to a limit.",
    "meterPage.prop.tone.danger": "Use <code>danger</code> when the value is past the limit.",
    "meterPage.guidelinesLede": "A measurement bar compares at a glance; the number beside it gives the exact figure.",
    "meterPage.dd.tone.title": "Tone: says what the value says",
    "meterPage.dd.tone.do": "A nearly full disk takes <code>danger</code>: the colour says what the number says.",
    "meterPage.dd.tone.dont": "A <code>success</code> on a value that is a problem contradicts the number.",
    "meterPage.dd.measure.title": "Measurement: not a task",
    "meterPage.dd.measure.do": "A quantity that goes up and down: battery, disk, a score.",
    "meterPage.dd.measure.dont": 'An upload\'s progress goes from 0 to 100 and ends: that is <a href="/components/progress">Progress</a>.',
  },
} as const;
