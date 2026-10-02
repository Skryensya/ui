export const numberFieldMessages = {
  es: {
    "demo.numberField.label": "Cantidad",
    "demo.numberField.decrement": "Disminuir",
    "demo.numberField.increment": "Aumentar",

    "numberFieldPage.description": "Recibe un número exacto que se escribe o se ajusta paso a paso.",

    "numberFieldPage.key.homeEnd": "Va al mínimo o al máximo.",

    "numberFieldPage.key.arrows": "Sube o baja un paso.",

    "numberFieldPage.a11yYours2": "Nombra los botones en tu idioma con <code>incrementLabel</code> y <code>decrementLabel</code>.",

    "numberFieldPage.a11yYours1": "Debe tener una etiqueta visible.",

    "numberFieldPage.a11yDoes2": "Los botones de más y menos tienen nombre propio y no reciben foco: el teclado usa las flechas.",

    "numberFieldPage.a11yDoes1": "El campo anuncia el valor, el mínimo, el máximo y si es inválido.",

    "numberFieldPage.a11yIntro": "NumberField sigue el patrón spinbutton de la APG.",

    "numberFieldPage.content2": "Di los límites en la ayuda si no son obvios: «Máximo 20 por pedido».",

    "numberFieldPage.content1": "Nombra el campo con lo que se cuenta y su unidad: «Noches», «Monto (CLP)».",

    "numberFieldPage.whenNot3": 'Para texto que parece número (un RUT, un teléfono, un código): usa <a href="/es/componentes/input">Input</a>.',

    "numberFieldPage.whenNot2": 'Para unas pocas opciones fijas: usa <a href="/es/componentes/segmented">Segmented</a> o <a href="/es/componentes/radio-group">RadioGroup</a>.',

    "numberFieldPage.whenNot1": 'Para un valor aproximado que se ajusta a ojo: usa <a href="/es/componentes/slider">Slider</a>.',

    "numberFieldPage.when3": "Cuando el número necesita formato de miles o decimales según el idioma.",

    "numberFieldPage.when2": "Cuando ajustar paso a paso es frecuente y merece botones.",

    "numberFieldPage.when1": "Para un número que se escribe: una cantidad, un monto, un número de noches.",

    "numberFieldPage.contract3": "Un valor fuera de rango se ajusta al límite al salir del campo.",
    "numberFieldPage.contract4": "El <code>defaultValue</code> se escribe como lo escribe el idioma del campo: <code>1234567,89</code> en <code>es-CL</code>, <code>1234567.89</code> en <code>en-US</code>.",

    "numberFieldPage.contract2": "<code>Intl.NumberFormat</code> formatea miles y decimales según <code>locale</code>.",

    "numberFieldPage.contract1": "El valor se entrega como texto y como número (<code>valueAsNumber</code>): el formato no se pierde ni se mezcla con el dato.",

    "numberFieldPage.quantityBody": "De 0 a 20, uno por uno. Los botones y las flechas del teclado suben y bajan un paso.",

    "numberFieldPage.quantityTitle": "Cantidad: con límites y paso",

    "numberFieldPage.lede": "NumberField recibe un número exacto que se escribe o se ajusta paso a paso: una cantidad, un monto, un número de noches. Respeta un mínimo, un máximo y un paso, y formatea el número según el idioma.",
    "numberFieldPage.anatomyBody":
      "Este diagrama nombra la etiqueta, el control y ambos steppers. El espécimen está congelado.",
    "numberFieldPage.anatomyLabel": "Anatomía de NumberField",
    "numberFieldPage.anatomyPreviewLabel": "NumberField, parte por parte",

    "numberFieldPage.testVanilla1":
      'Los triggers montan con el <code class="sk-code">aria-label</code> escrito a mano en el markup.',
    "numberFieldPage.testVanilla2":
      'Cada trigger suma o resta un <code class="sk-code">step</code> y emite <code class="sk-code">sk:numberfieldvaluechange</code>.',
    "numberFieldPage.testVanilla3":
      "El trigger de incrementar se deshabilita en el máximo, el de disminuir en el mínimo.",
    "numberFieldPage.testVanilla4": "Presionar un trigger deshabilitado en el límite no hace nada.",
    "numberFieldPage.testVanilla5":
      'Escribir un valor y salir del campo lo confirma y emite <code class="sk-code">sk:numberfieldvaluechange</code>.',
    "numberFieldPage.testVanilla6":
      "Un valor tipeado por encima del máximo se recorta al límite al salir del campo.",
    "numberFieldPage.testVanilla7":
      "El input y ambos triggers quedan deshabilitados cuando el input escrito a mano lo está.",
    "numberFieldPage.testVanilla8":
      'Monta <code class="sk-code">role="spinbutton"</code> con <code class="sk-code">aria-valuemin</code>/<code class="sk-code">aria-valuemax</code>/<code class="sk-code">aria-valuenow</code>.',
    "numberFieldPage.testVanilla9":
      "Flecha arriba/abajo suman o restan desde el teclado; Home/End saltan a los límites.",

    "numberFieldPage.testReact1":
      'Los triggers montan con el nombre accesible de <code class="sk-code">decrementLabel</code>/<code class="sk-code">incrementLabel</code>.',
    "numberFieldPage.testReact2":
      'Cada trigger suma o resta un <code class="sk-code">step</code> y llama a <code class="sk-code">onValueChange</code>.',
    "numberFieldPage.testReact3":
      "El trigger de incrementar se deshabilita en el máximo, el de disminuir en el mínimo.",
    "numberFieldPage.testReact4": "Presionar un trigger deshabilitado en el límite no hace nada.",
    "numberFieldPage.testReact5":
      'Escribir un valor y salir del campo lo confirma y llama a <code class="sk-code">onValueChange</code>.',
    "numberFieldPage.testReact6":
      "Un valor tipeado por encima del máximo se recorta al límite al salir del campo.",
    "numberFieldPage.testReact7": "El input y ambos triggers quedan deshabilitados con disabled.",
    "numberFieldPage.testReact8":
      'Monta <code class="sk-code">aria-valuemin</code>/<code class="sk-code">aria-valuemax</code>/<code class="sk-code">aria-valuenow</code>.',
    "numberFieldPage.testReact9":
      "Flecha arriba/abajo suman o restan desde el teclado; Home/End saltan a los límites.",
    "demo.numberField.amount": "Monto",
    "demo.numberField.weight": "Peso (kg)",
    "demo.numberField.offset": "Ajuste",
    "demo.numberField.nights": "Noches",
    "demo.numberField.generic": "Número",
    "numberFieldPage.state.title": "State: cómo está el campo",
    "numberFieldPage.state.body": "El mismo campo en cada estado. Cada uno dice algo distinto a quien lo usa.",
    "numberFieldPage.state.label": "Estado",
    "numberFieldPage.state.default": "Se puede escribir y ajustar con los botones y las flechas del teclado.",
    "numberFieldPage.state.readOnly": "<code>readOnly</code> muestra el valor y deja copiarlo, pero no se puede cambiar. Úsalo para un dato que viene de otro lado.",
    "numberFieldPage.state.invalid": "<code>invalid</code> marca el campo cuando el valor no cumple una regla que tú conoces. Dile a la persona qué corregir en la ayuda.",
    "numberFieldPage.state.disabled": "<code>disabled</code> quita el campo de la tabulación y no se envía. Úsalo solo si no hay nada que ajustar todavía; si hay una razón, dila.",
    "numberFieldPage.prop.locale.title": "Locale: cómo se escribe el número",
    "numberFieldPage.prop.locale.body": "El mismo monto escrito como lo escribe cada idioma. Lo que cambia es la lectura; el número que se envía no.",
    "numberFieldPage.prop.locale.label": "Locale",
    "numberFieldPage.prop.locale.en-US": "<code>en-US</code>: coma para los miles, punto para los decimales.",
    "numberFieldPage.prop.locale.es-CL": "<code>es-CL</code>: punto para los miles, coma para los decimales.",
    "numberFieldPage.prop.locale.en-IN": "<code>en-IN</code>: los miles se agrupan de a dos después del primero. Usa el idioma de quien lee, no el del sitio.",
    "numberFieldPage.decimalTitle": "Decimales: paso de medio",
    "numberFieldPage.decimalBody": "Con <code>step</code> menor que uno el campo avanza de a medio y muestra la coma o el punto según el idioma.",
    "numberFieldPage.unboundedTitle": "Sin límites: un ajuste",
    "numberFieldPage.unboundedBody": "Sin <code>min</code> ni <code>max</code> el valor puede ir a cualquier lado: sirve para un ajuste, no para un conteo.",
    "numberFieldPage.dd.bounds.title": "Límites: un conteo tiene piso",
    "numberFieldPage.dd.bounds.do": "Con <code>min</code> y <code>max</code>, el campo no pasa de lo posible: de 1 a 14 noches.",
    "numberFieldPage.dd.bounds.dont": "Sin límites, el campo acepta «−2 noches», un valor que no existe.",
    "numberFieldPage.dd.label.title": "Etiqueta: lo que se cuenta",
    "numberFieldPage.dd.label.do": "«Noches» dice qué es el número.",
    "numberFieldPage.dd.label.dont": "«Número» no dice qué se está contando.",
    "demo.numberField.dd.volume": "Volumen",
    "numberFieldPage.guidelinesLede": "Un campo numérico sirve cuando el número exacto importa más que verlo moverse.",
    "numberFieldPage.dd.exact.title": "Valor: exacto, no aproximado",
    "numberFieldPage.dd.exact.do": "Una cantidad exacta, como las unidades de un producto.",
    "numberFieldPage.dd.exact.dont": 'Un valor que se ajusta a ojo, como el volumen, se elige mejor con un <a href="/es/componentes/slider">Slider</a>.',
  },
  en: {
    "demo.numberField.label": "Quantity",
    "demo.numberField.decrement": "Decrease",
    "demo.numberField.increment": "Increase",

    "numberFieldPage.description": "Takes an exact number that is typed or adjusted one step at a time.",

    "numberFieldPage.key.homeEnd": "Goes to the minimum or maximum.",

    "numberFieldPage.key.arrows": "Moves one step up or down.",

    "numberFieldPage.a11yYours2": "Name the buttons in your language with <code>incrementLabel</code> and <code>decrementLabel</code>.",

    "numberFieldPage.a11yYours1": "It must have a visible label.",

    "numberFieldPage.a11yDoes2": "The plus and minus buttons have their own names and take no focus: the keyboard uses the arrows.",

    "numberFieldPage.a11yDoes1": "The field announces the value, minimum, maximum and whether it is invalid.",

    "numberFieldPage.a11yIntro": "NumberField follows the APG spinbutton pattern.",

    "numberFieldPage.content2": "State the bounds in the hint if they are not obvious: “Up to 20 per order”.",

    "numberFieldPage.content1": "Name the field by what is counted and its unit: “Nights”, “Amount (USD)”.",

    "numberFieldPage.whenNot3": 'For text that looks like a number (an ID, a phone, a code): use <a href="/components/input">Input</a>.',

    "numberFieldPage.whenNot2": 'For a few fixed options: use <a href="/components/segmented">Segmented</a> or <a href="/components/radio-group">RadioGroup</a>.',

    "numberFieldPage.whenNot1": 'For an approximate value set by eye: use <a href="/components/slider">Slider</a>.',

    "numberFieldPage.when3": "When the number needs thousands or decimals formatted by language.",

    "numberFieldPage.when2": "When adjusting one step at a time is frequent and deserves buttons.",

    "numberFieldPage.when1": "For a number that is typed: a quantity, an amount, a number of nights.",

    "numberFieldPage.contract3": "An out-of-range value snaps to the bound when leaving the field.",
    "numberFieldPage.contract4": "The <code>defaultValue</code> is written the way the field's language writes it: <code>1234567,89</code> in <code>es-CL</code>, <code>1234567.89</code> in <code>en-US</code>.",

    "numberFieldPage.contract2": "<code>Intl.NumberFormat</code> formats thousands and decimals by <code>locale</code>.",

    "numberFieldPage.contract1": "The value comes as text and as a number (<code>valueAsNumber</code>): formatting is neither lost nor mixed with the data.",

    "numberFieldPage.quantityBody": "From 0 to 20, one at a time. The buttons and the keyboard arrows move one step.",

    "numberFieldPage.quantityTitle": "Quantity: with bounds and step",

    "numberFieldPage.lede": "NumberField takes an exact number that is typed or adjusted step by step: a quantity, an amount, a number of nights. It respects a minimum, a maximum and a step, and formats the number for the language.",
    "numberFieldPage.anatomyBody":
      "This diagram names the label, the control, and both steppers. The specimen is frozen.",
    "numberFieldPage.anatomyLabel": "NumberField anatomy",
    "numberFieldPage.anatomyPreviewLabel": "NumberField, part by part",

    "numberFieldPage.testVanilla1":
      'The triggers mount with the authored <code class="sk-code">aria-label</code> from the markup.',
    "numberFieldPage.testVanilla2":
      'Each trigger adds or subtracts one <code class="sk-code">step</code> and emits <code class="sk-code">sk:numberfieldvaluechange</code>.',
    "numberFieldPage.testVanilla3":
      "The increment trigger disables at the max, the decrement trigger disables at the min.",
    "numberFieldPage.testVanilla4": "Pressing a disabled trigger at the bound does nothing.",
    "numberFieldPage.testVanilla5":
      'Typing a value and leaving the field commits it and emits <code class="sk-code">sk:numberfieldvaluechange</code>.',
    "numberFieldPage.testVanilla6":
      "A typed value past the max clamps down to the bound when the field is left.",
    "numberFieldPage.testVanilla7":
      "The input and both triggers disable when the authored input is disabled.",
    "numberFieldPage.testVanilla8":
      'Mounts <code class="sk-code">role="spinbutton"</code> with <code class="sk-code">aria-valuemin</code>/<code class="sk-code">aria-valuemax</code>/<code class="sk-code">aria-valuenow</code>.',
    "numberFieldPage.testVanilla9":
      "ArrowUp/ArrowDown step from the keyboard; Home/End jump to the bounds.",

    "numberFieldPage.testReact1":
      'The triggers mount with the accessible name from <code class="sk-code">decrementLabel</code>/<code class="sk-code">incrementLabel</code>.',
    "numberFieldPage.testReact2":
      'Each trigger adds or subtracts one <code class="sk-code">step</code> and calls <code class="sk-code">onValueChange</code>.',
    "numberFieldPage.testReact3":
      "The increment trigger disables at the max, the decrement trigger disables at the min.",
    "numberFieldPage.testReact4": "Pressing a disabled trigger at the bound does nothing.",
    "numberFieldPage.testReact5":
      'Typing a value and leaving the field commits it and calls <code class="sk-code">onValueChange</code>.',
    "numberFieldPage.testReact6":
      "A typed value past the max clamps down to the bound when the field is left.",
    "numberFieldPage.testReact7": "The input and both triggers disable with disabled.",
    "numberFieldPage.testReact8":
      'Mounts <code class="sk-code">aria-valuemin</code>/<code class="sk-code">aria-valuemax</code>/<code class="sk-code">aria-valuenow</code>.',
    "numberFieldPage.testReact9":
      "ArrowUp/ArrowDown step from the keyboard; Home/End jump to the bounds.",
    "demo.numberField.amount": "Amount",
    "demo.numberField.weight": "Weight (kg)",
    "demo.numberField.offset": "Offset",
    "demo.numberField.nights": "Nights",
    "demo.numberField.generic": "Number",
    "numberFieldPage.state.title": "State: how the field is",
    "numberFieldPage.state.body": "The same field in each state. Each one tells the person using it something different.",
    "numberFieldPage.state.label": "State",
    "numberFieldPage.state.default": "It can be typed into and adjusted with the buttons and the keyboard arrows.",
    "numberFieldPage.state.readOnly": "<code>readOnly</code> shows the value and lets it be copied, but it cannot be changed. Use it for a figure that comes from elsewhere.",
    "numberFieldPage.state.invalid": "<code>invalid</code> marks the field when the value breaks a rule you know. Say what to fix in the hint.",
    "numberFieldPage.state.disabled": "<code>disabled</code> takes the field out of the tab order and it is not submitted. Use it only when there is nothing to adjust yet; if there is a reason, say it.",
    "numberFieldPage.prop.locale.title": "Locale: how the number is written",
    "numberFieldPage.prop.locale.body": "The same amount written the way each language writes it. What changes is how it reads; the number that is submitted does not.",
    "numberFieldPage.prop.locale.label": "Locale",
    "numberFieldPage.prop.locale.en-US": "<code>en-US</code>: a comma for thousands, a point for decimals.",
    "numberFieldPage.prop.locale.es-CL": "<code>es-CL</code>: a point for thousands, a comma for decimals.",
    "numberFieldPage.prop.locale.en-IN": "<code>en-IN</code>: thousands group in twos after the first. Use the reader's language, not the site's.",
    "numberFieldPage.decimalTitle": "Decimals: half a step",
    "numberFieldPage.decimalBody": "With a <code>step</code> below one the field moves by halves and shows the comma or the point for the language.",
    "numberFieldPage.unboundedTitle": "No limits: an adjustment",
    "numberFieldPage.unboundedBody": "With no <code>min</code> or <code>max</code> the value can go anywhere: right for an adjustment, wrong for a count.",
    "numberFieldPage.dd.bounds.title": "Limits: a count has a floor",
    "numberFieldPage.dd.bounds.do": "With <code>min</code> and <code>max</code> the field stays within what is possible: 1 to 14 nights.",
    "numberFieldPage.dd.bounds.dont": "With no limits the field accepts “−2 nights”, a value that does not exist.",
    "numberFieldPage.dd.label.title": "Label: what is counted",
    "numberFieldPage.dd.label.do": "“Nights” says what the number is.",
    "numberFieldPage.dd.label.dont": "“Number” does not say what is being counted.",
    "demo.numberField.dd.volume": "Volume",
    "numberFieldPage.guidelinesLede": "A number field helps when the exact number matters more than seeing it move.",
    "numberFieldPage.dd.exact.title": "Value: exact, not approximate",
    "numberFieldPage.dd.exact.do": "An exact quantity, like a product's units.",
    "numberFieldPage.dd.exact.dont": 'A value set by eye, like volume, is picked better with a <a href="/components/slider">Slider</a>.',
  },
} as const;
