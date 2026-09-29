export const meterMessages = {
  es: {

    "meterPage.description":
      "Meter: una medición dentro de un rango conocido, nunca el avance de una tarea.",
    "meterPage.lede":
      'Un valor medido ahora, no una tarea en curso: el rol WAI-ARIA <code>meter</code>, distinto de <code>progressbar</code>. Úsalo para uso de disco, nivel de batería, una calificación sobre una escala. Para el avance de una tarea con inicio y fin, usa <a href="/es/componentes/progress">Progress</a>.',
    "meterPage.anatomyBody":
      "Este diagrama nombra el grupo, el encabezado, la etiqueta, el valor, la pista y la barra. El espécimen está congelado; los meters vivos empiezan abajo.",
    "meterPage.anatomyLabel": "Anatomía de Meter",
    "meterPage.anatomyPreviewLabel": "Meter, parte por parte",
    "meterPage.body":
      "A diferencia de Progress, <code>min</code> es un parámetro real y con frecuencia distinto de cero: una calificación de 1 a 5, una temperatura. El relleno se calcula con <code>meterFraction(value, min, max)</code>, no con <code>value / max</code>.",
    "meterPage.test1": "Aplica role=meter con los tres atributos aria-value obligatorios.",
    "meterPage.test2":
      "Respeta un min distinto de cero al pintar el relleno, a diferencia de Progress.",
    "meterPage.a11yBody":
      'El rol <code>meter</code> lleva <code>aria-valuenow</code>/<code>aria-valuemin</code>/<code>aria-valuemax</code> siempre presentes, y <code>aria-valuetext</code> opcional para cuando el número solo no alcanza ("50% (6 horas) restantes"). Sin interacción de teclado: es una medición, no un control.',

    "demo.meter.rating": "Calificación",
    "demo.meter.ratingText": "4 de 5 estrellas",
    "demo.meter.disk": "Uso de disco",
    "demo.meter.diskText": "92% usado",
    "demo.meter.battery": "Batería",
    "demo.meter.batteryText": "68% restante",
    "demo.meter.dd.upload": "Subiendo archivo",
    "meterPage.prop.tone.title": "Tono",
    "meterPage.prop.tone.body": "El <code>tone</code> dice cómo leer el valor: si está bien, si conviene revisarlo o si es un problema.",
    "meterPage.prop.tone.accent": "Usa <code>accent</code>, el default, para una medida sin juicio: solo cuánto hay.",
    "meterPage.prop.tone.success": "Usa <code>success</code> cuando el valor está en un rango sano.",
    "meterPage.prop.tone.warning": "Usa <code>warning</code> cuando el valor se acerca a un límite.",
    "meterPage.prop.tone.danger": "Usa <code>danger</code> cuando el valor ya pasó el límite.",
    "meterPage.showcaseTitle": "Showcases",
    "meterPage.showcaseBody": "Varias medidas juntas, cada una con su escala y su tono.",
    "meterPage.guidelinesLede": "Meter muestra una medida dentro de un rango conocido. No muestra el avance de una tarea.",
    "meterPage.dd.tone.title": "El tono acompaña al valor",
    "meterPage.dd.tone.do": "Un disco casi lleno lleva <code>danger</code>: el color dice lo mismo que el número.",
    "meterPage.dd.tone.dont": "No pintes de <code>success</code> un valor que es un problema.",
    "meterPage.dd.measure.title": "Una medida, no una tarea",
    "meterPage.dd.measure.do": "Usa Meter para una cantidad que sube y baja: batería, disco, una puntuación.",
    "meterPage.dd.measure.dont": "El avance de una subida va de 0 a 100 y termina: eso es <a href=\"/es/componentes/progress\">Progress</a>.",
  },
  en: {

    "meterPage.description":
      "Meter: a measurement within a known range, never a task's completion.",
    "meterPage.lede":
      'A value measured right now, not a task in progress: the WAI-ARIA <code>meter</code> role, distinct from <code>progressbar</code>. Use it for disk usage, battery level, a rating on a scale. For a task\'s progress with a start and an end, use <a href="/components/progress">Progress</a>.',
    "meterPage.anatomyBody":
      "This diagram names the group, the header, the label, the value, the track, and the bar. The specimen is frozen; the live meters start below.",
    "meterPage.anatomyLabel": "Meter anatomy",
    "meterPage.anatomyPreviewLabel": "Meter, part by part",
    "meterPage.body":
      "Unlike Progress, <code>min</code> is a real parameter and often non-zero: a 1-to-5 rating, a temperature. The fill is computed with <code>meterFraction(value, min, max)</code>, not <code>value / max</code>.",
    "meterPage.test1": "Sets role=meter with the three required aria-value attributes.",
    "meterPage.test2": "Honors a non-zero min when painting the fill, unlike Progress.",
    "meterPage.a11yBody":
      'The <code>meter</code> role carries <code>aria-valuenow</code>/<code>aria-valuemin</code>/<code>aria-valuemax</code> always present, and an optional <code>aria-valuetext</code> for when the raw number alone is not enough ("50% (6 hours) remaining"). No keyboard interaction: it is a measurement, not a control.',

    "demo.meter.rating": "Rating",
    "demo.meter.ratingText": "4 out of 5 stars",
    "demo.meter.disk": "Disk usage",
    "demo.meter.diskText": "92% used",
    "demo.meter.battery": "Battery",
    "demo.meter.batteryText": "68% remaining",
    "demo.meter.dd.upload": "Uploading file",
    "meterPage.prop.tone.title": "Tone",
    "meterPage.prop.tone.body": "<code>tone</code> says how to read the value: fine, worth checking, or a problem.",
    "meterPage.prop.tone.accent": "Use <code>accent</code>, the default, for a measurement with no judgement: just how much.",
    "meterPage.prop.tone.success": "Use <code>success</code> when the value is in a healthy range.",
    "meterPage.prop.tone.warning": "Use <code>warning</code> when the value is getting close to a limit.",
    "meterPage.prop.tone.danger": "Use <code>danger</code> when the value is past the limit.",
    "meterPage.showcaseTitle": "Showcases",
    "meterPage.showcaseBody": "Several measurements together, each with its own scale and tone.",
    "meterPage.guidelinesLede": "Meter shows a measurement within a known range. It does not show a task's progress.",
    "meterPage.dd.tone.title": "The tone matches the value",
    "meterPage.dd.tone.do": "A nearly full disk takes <code>danger</code>: the colour says what the number says.",
    "meterPage.dd.tone.dont": "Do not paint a value that is a problem in <code>success</code>.",
    "meterPage.dd.measure.title": "A measurement, not a task",
    "meterPage.dd.measure.do": "Use Meter for an amount that goes up and down: battery, disk, a score.",
    "meterPage.dd.measure.dont": "An upload goes from 0 to 100 and ends: that is <a href=\"/components/progress\">Progress</a>.",
  },
} as const;
