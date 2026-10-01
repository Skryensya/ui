export const sliderMessages = {
  es: {

    "demo.slider.volume": "Volumen",
    "demo.slider.brightness": "Brillo",
    "demo.slider.priceMin": "Precio mínimo",
    "demo.slider.priceMax": "Precio máximo",

    "sliderPage.description": "Ajusta un valor aproximado arrastrando, o un rango con dos extremos.",

    "sliderPage.key.homeEnd": "Va al mínimo o al máximo.",

    "sliderPage.key.page": "Mueve un paso grande.",

    "sliderPage.key.arrows": "Mueve un paso.",

    "sliderPage.a11yYours2": "Si el valor tiene unidad, dalo con <code>aria-valuetext</code>: «45.000 pesos».",

    "sliderPage.a11yYours1": "Dale nombre con <code>aria-label</code> o una etiqueta visible; en un rango, un nombre a cada pulgar: «Precio mínimo».",

    "sliderPage.a11yDoes2": "En un rango, el límite de cada pulgar es el valor del otro.",

    "sliderPage.a11yDoes1": "Cada pulgar anuncia su valor, su mínimo y su máximo.",

    "sliderPage.a11yIntro": "Slider sigue el patrón slider de la APG.",

    "sliderPage.content2": "Muestra el valor actual con su unidad junto al pulgar o la etiqueta: «$45.000».",

    "sliderPage.content1": "Nombra el slider con lo que ajusta: «Volumen», «Precio».",

    "sliderPage.whenNot3": 'Para mostrar un valor que no se cambia: usa <a href="/es/componentes/meter">Meter</a>.',

    "sliderPage.whenNot2": 'Para pocas opciones con nombre: usa <a href="/es/componentes/segmented">Segmented</a>.',

    "sliderPage.whenNot1": 'Para un número exacto: usa <a href="/es/componentes/number-field">NumberField</a>.',

    "sliderPage.when2": "Para un rango: precio mínimo y máximo, con <code>SliderRange</code>.",

    "sliderPage.when1": "Para un valor aproximado que se ajusta a ojo: volumen, brillo, zoom.",

    "sliderPage.contract3": "El cambio dispara un evento en Vanilla y <code>onValueChange</code> en React.",

    "sliderPage.contract2": "Participa en el formulario con un campo oculto, con el nombre que le des.",

    "sliderPage.contract1": "<code>value</code> es dónde empieza el pulgar: <code>data-value</code> en el markup, <code>defaultValue</code> en React.",

    "sliderPage.singleBody": "El pulgar se arrastra o se mueve con las flechas; los extremos son los de la pista.",

    "sliderPage.singleTitle": "Un valor: volumen y brillo",
    "sliderPage.lede": "Slider ajusta un valor aproximado arrastrando, donde ver el cambio ayuda a decidir: el volumen, el brillo, un rango de precios. Para un número exacto, NumberField se escribe más rápido.",
    "sliderPage.anatomyBody":
      "Este diagrama nombra la pista, el relleno y el pulgar. El espécimen está congelado; los sliders vivos empiezan abajo.",
    "sliderPage.anatomyLabel": "Anatomía de Slider",
    "sliderPage.anatomyPreviewLabel": "Slider, parte por parte",
    "sliderPage.test1": "Expone la semántica ARIA de slider desde la máquina Zag y reporta cambios como números.",
    "sliderPage.test2": "Pinta la pista y el relleno desde los porcentajes que publica la máquina.",
    "sliderPage.rangeTitle": "Rango: un mínimo y un máximo",
    "sliderPage.rangeBody": "<code>SliderRange</code> tiene dos pulgares que no se cruzan: el mínimo nunca pasa al máximo.",
    "sliderPage.testRange1":
      "El máximo del pulgar bajo queda acotado por el valor actual del pulgar alto, y viceversa.",
    "sliderPage.testRange2":
      "Al cambiar un valor, reacota el OTRO pulgar y reporta ambos valores en el cambio.",
    "sliderPage.testRange3":
      "Ningún pulgar puede superar al otro. El min/max nativo recorta incluso una escritura directa de valor que se pase del límite.",
    "demo.slider.dd.age": "Edad",
    "sliderPage.guidelinesLede": "Arrastrar sirve cuando el valor exacto importa menos que cómo se ve el resultado.",
    "sliderPage.dd.approx.title": "Valor: aproximado, no exacto",
    "sliderPage.dd.approx.do": "Usa Slider para un valor que se ajusta a ojo, como el volumen.",
    "sliderPage.dd.approx.dont": 'Un número exacto, como una edad, se escribe más rápido en un <a href="/es/componentes/number-field">NumberField</a>.',
    "sliderPage.dd.range.title": "Rango: un control, no dos",
    "sliderPage.dd.range.do": "Para un mínimo y un máximo, usa <code>SliderRange</code>: los dos extremos no se cruzan.",
    "sliderPage.dd.range.dont": "Dos sliders sueltos no saben uno del otro: el mínimo puede quedar sobre el máximo.",
  },
  en: {

    "demo.slider.volume": "Volume",
    "demo.slider.brightness": "Brightness",
    "demo.slider.priceMin": "Minimum price",
    "demo.slider.priceMax": "Maximum price",

    "sliderPage.description": "Adjusts an approximate value by dragging, or a range with two ends.",

    "sliderPage.key.homeEnd": "Goes to the minimum or maximum.",

    "sliderPage.key.page": "Moves one large step.",

    "sliderPage.key.arrows": "Moves one step.",

    "sliderPage.a11yYours2": "If the value has a unit, give it with <code>aria-valuetext</code>: “45 dollars”.",

    "sliderPage.a11yYours1": "Name it with <code>aria-label</code> or a visible label; in a range, name each thumb: “Minimum price”.",

    "sliderPage.a11yDoes2": "In a range, each thumb's limit is the other's value.",

    "sliderPage.a11yDoes1": "Each thumb announces its value, minimum and maximum.",

    "sliderPage.a11yIntro": "Slider follows the APG slider pattern.",

    "sliderPage.content2": "Show the current value with its unit beside the thumb or the label: “$45”.",

    "sliderPage.content1": "Name the slider by what it adjusts: “Volume”, “Price”.",

    "sliderPage.whenNot3": 'To show a value that is not changed: use <a href="/components/meter">Meter</a>.',

    "sliderPage.whenNot2": 'For a few named options: use <a href="/components/segmented">Segmented</a>.',

    "sliderPage.whenNot1": 'For an exact number: use <a href="/components/number-field">NumberField</a>.',

    "sliderPage.when2": "For a range: minimum and maximum price, with <code>SliderRange</code>.",

    "sliderPage.when1": "For an approximate value set by eye: volume, brightness, zoom.",

    "sliderPage.contract3": "A change fires an event in Vanilla and <code>onValueChange</code> in React.",

    "sliderPage.contract2": "It takes part in the form with a hidden field, under the name you give it.",

    "sliderPage.contract1": "<code>value</code> is where the thumb starts: <code>data-value</code> in markup, <code>defaultValue</code> in React.",

    "sliderPage.singleBody": "The thumb is dragged or moved with the arrows; the ends are the track's.",

    "sliderPage.singleTitle": "One value: volume and brightness",
    "sliderPage.lede": "Slider adjusts an approximate value by dragging, where seeing the change helps decide: volume, brightness, a price range. For an exact number, NumberField is faster to type.",
    "sliderPage.anatomyBody":
      "This diagram names the track, the fill, and the thumb. The specimen is frozen; the live sliders start below.",
    "sliderPage.anatomyLabel": "Slider anatomy",
    "sliderPage.anatomyPreviewLabel": "Slider, part by part",
    "sliderPage.test1": "Exposes slider ARIA semantics from the Zag machine and reports changes as numbers.",
    "sliderPage.test2": "Paints the track and range from the percentages the machine publishes.",
    "sliderPage.rangeTitle": "Range: a minimum and a maximum",
    "sliderPage.rangeBody": "<code>SliderRange</code> has two thumbs that do not cross: the minimum never passes the maximum.",
    "sliderPage.testRange1":
      "The low thumb's max is bounded by the high thumb's current value, and vice versa.",
    "sliderPage.testRange2":
      "Changing one value re-bounds the OTHER thumb and reports both values on the change.",
    "sliderPage.testRange3":
      "Neither thumb can exceed the other. Native min/max clamps even a direct value write past the bound.",
    "demo.slider.dd.age": "Age",
    "sliderPage.guidelinesLede": "Dragging helps when the exact value matters less than how the result looks.",
    "sliderPage.dd.approx.title": "Value: approximate, not exact",
    "sliderPage.dd.approx.do": "Use Slider for a value set by eye, like volume.",
    "sliderPage.dd.approx.dont": 'An exact number, like an age, is typed faster in a <a href="/components/number-field">NumberField</a>.',
    "sliderPage.dd.range.title": "Range: one control, not two",
    "sliderPage.dd.range.do": "For a minimum and a maximum, use <code>SliderRange</code>: the two ends cannot cross.",
    "sliderPage.dd.range.dont": "Two separate sliders know nothing about each other: the minimum can end up above the maximum.",
  },
} as const;
