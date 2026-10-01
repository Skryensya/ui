export const selectMessages = {
  es: {
    "demo.select.label": "Plan",

    "selectPage.description": "Elige una opción de una lista que no cabe a la vista.",

    "selectPage.key.escape": "Cierra sin cambiar.",

    "selectPage.key.letter": "Salta a la opción que empieza con esa letra.",

    "selectPage.key.choose": "Elige la opción resaltada y cierra.",

    "selectPage.key.arrows": "Recorre las opciones.",

    "selectPage.key.open": "Abre la lista.",

    "selectPage.a11yYours2": "Si usas el mejorado en un formulario, agrega el <code>&lt;select&gt;</code> oculto para enviarlo.",

    "selectPage.a11yYours1": "Debe tener una etiqueta visible.",

    "selectPage.a11yDoes2": "El foco queda en el campo y <code>aria-activedescendant</code> dice cuál está resaltada.",

    "selectPage.a11yDoes1": "El campo anuncia <code>aria-expanded</code> y la opción elegida.",

    "selectPage.a11yIntro": "Select sigue el patrón select-only combobox de la APG; el nativo es del navegador.",

    "selectPage.content3": "Ordena las opciones de forma predecible: alfabética, o las más usadas primero.",

    "selectPage.content2": "Usa un placeholder que pida la acción, no una opción falsa: «Elige un país».",

    "selectPage.content1": "Nombra el campo con lo que se elige: «País», «Responsable».",

    "selectPage.whenNot4": 'Para elegir varias: usa <a href="/es/componentes/combobox">Combobox</a> múltiple o <a href="/es/componentes/checkbox">Checkbox</a>.',

    "selectPage.whenNot3": 'Para ejecutar una acción: usa <a href="/es/componentes/menu">Menu</a>.',

    "selectPage.whenNot2": 'Para listas largas donde se busca escribiendo: usa <a href="/es/componentes/combobox">Combobox</a>.',

    "selectPage.whenNot1": 'Para 2 a 6 opciones que conviene ver: usa <a href="/es/componentes/radio-group">RadioGroup</a>.',

    "selectPage.when2": "Usa el nativo para una elección simple de formulario; el mejorado cuando necesitas controlar la lista o escuchar el cambio.",

    "selectPage.when1": "Para elegir una opción entre más de 6.",

    "selectPage.contract4": "El nativo usa <code>disabled</code> y <code>required</code> nativos, sin estado en JavaScript.",

    "selectPage.contract3": "El cambio dispara <code>sk:selectvaluechange</code>; en React, <code>onValueChange</code>.",

    "selectPage.contract2": "El trigger y cada opción miden al menos 44px de alto, también en densidad compacta.",

    "selectPage.contract1": "La raíz lleva <code>data-sk-select</code>; el enhancer conecta los nodos escritos a mano y no genera markup.",

    "selectPage.enhancedBody": "La lista se abre junto al campo; escribir salta a la opción que empieza así.",

    "selectPage.enhancedTitle": "Mejorado: un plan",
    "selectPage.anatomyBody":
      "Un Select cerrado es un trigger: el positioner, el content y las filas solo existen mientras el listbox está arriba. Por eso el espécimen se dibuja abierto y se queda así. Está congelado; el Select vivo es el de abajo.",
    "selectPage.anatomyLabel": "Anatomía de Select",
    "selectPage.anatomyPreviewLabel": "Select abierto, parte por parte",
    "selectPage.lede": "Select elige una opción de una lista que no cabe a la vista: un país, una categoría, un responsable. La lista se abre junto al campo y se recorre con el teclado o escribiendo. Para una elección simple de formulario, el Select nativo basta.",
    "selectPage.htmlTitle": "En HTML: los items son la lista",
    "selectPage.htmlBody": "El enhancer lee los items del DOM; cada uno necesita <code>data-value</code>. Un <code>&lt;select&gt;</code> oculto con las mismas opciones lo envía con el formulario y queda sin JavaScript.",
    "selectPage.vanillaInitTitle": "Inicializar Vanilla",
    "selectPage.listenTitle": "Escuchar el cambio",
    "selectPage.nativeTitle": "Nativo: un <select> real",
    "selectPage.nativeBody": "Selección, teclado y envío son del navegador. Donde se puede, <code>appearance: base-select</code> le da la misma apariencia a la lista abierta.",
    "selectPage.nativeInstallTitle": "Instalar solo el Select nativo",
    "selectPage.iconsComment": "Los iconos se autoran como placeholders <span data-sk-icon>;\nmountIcons los reemplaza por el <svg> del set enlazado.",
    "selectPage.formsComment": "Opcional: hace que el Select se envíe en un form, y es lo\n     que queda sin JS. Sus <option> tienen que coincidir con\n     los items, o el enhancer tira.",
    "selectPage.test1": "Usa la máquina de Zag select para la selección del popup y el valor del form.",
    "selectPage.test2": "Conduce la máquina sobre el markup escrito a mano: ARIA, selección y el texto del valor.",
    "selectPage.test3": "Emite <code>sk:selectvaluechange</code>, y el cleanup detiene la máquina.",
    "demo.select.dd.billing": "Facturación",
    "demo.select.dd.monthly": "Mensual",
    "demo.select.dd.yearly": "Anual",
    "selectPage.prop.variant.title": "Variant: cuánto se nota",
    "selectPage.prop.variant.body": "Decide si el campo lleva borde o se funde con lo que lo rodea.",
    "selectPage.prop.variant.outline": "Usa <code>outline</code>, el valor por defecto, en un formulario, junto a otros campos con borde.",
    "selectPage.prop.variant.ghost": "Usa <code>ghost</code> en una barra o un encabezado, donde un borde sería ruido.",
    "selectPage.guidelinesLede": "Una lista que se abre ahorra espacio, a cambio de esconder las opciones hasta el clic.",
    "selectPage.dd.two.title": "Opciones: si son pocas, a la vista",
    "selectPage.dd.two.do": 'Con dos o tres opciones, muéstralas todas con un <a href="/es/componentes/radio-group">RadioGroup</a>.',
    "selectPage.dd.two.dont": "Esconder dos opciones detrás de un clic obliga a abrir la lista para verlas.",
  },
  en: {
    "demo.select.label": "Plan",

    "selectPage.description": "Chooses one option from a list that does not fit in view.",

    "selectPage.key.escape": "Closes without changing.",

    "selectPage.key.letter": "Jumps to the option starting with that letter.",

    "selectPage.key.choose": "Chooses the highlighted option and closes.",

    "selectPage.key.arrows": "Moves through the options.",

    "selectPage.key.open": "Opens the list.",

    "selectPage.a11yYours2": "If you use the enhanced one in a form, add the hidden <code>&lt;select&gt;</code> to submit it.",

    "selectPage.a11yYours1": "It must have a visible label.",

    "selectPage.a11yDoes2": "Focus stays on the field and <code>aria-activedescendant</code> says which is highlighted.",

    "selectPage.a11yDoes1": "The field announces <code>aria-expanded</code> and the chosen option.",

    "selectPage.a11yIntro": "Select follows the APG select-only combobox pattern; the native one belongs to the browser.",

    "selectPage.content3": "Order options predictably: alphabetically, or most used first.",

    "selectPage.content2": "Use a placeholder that asks for the action, not a fake option: “Choose a country”.",

    "selectPage.content1": "Name the field by what is chosen: “Country”, “Assignee”.",

    "selectPage.whenNot4": 'To choose several: use a multiple <a href="/components/combobox">Combobox</a> or <a href="/components/checkbox">Checkbox</a>.',

    "selectPage.whenNot3": 'To run an action: use <a href="/components/menu">Menu</a>.',

    "selectPage.whenNot2": 'For long lists searched by typing: use <a href="/components/combobox">Combobox</a>.',

    "selectPage.whenNot1": 'For 2 to 6 options worth seeing: use <a href="/components/radio-group">RadioGroup</a>.',

    "selectPage.when2": "Use the native one for a simple form choice; the enhanced one when you need to control the list or listen for the change.",

    "selectPage.when1": "To choose one option among more than 6.",

    "selectPage.contract4": "The native one uses native <code>disabled</code> and <code>required</code>, with no JavaScript state.",

    "selectPage.contract3": "A change fires <code>sk:selectvaluechange</code>; in React, <code>onValueChange</code>.",

    "selectPage.contract2": "The trigger and each option are at least 44px tall, in compact density too.",

    "selectPage.contract1": "The root carries <code>data-sk-select</code>; the enhancer wires the hand-written nodes and generates no markup.",

    "selectPage.enhancedBody": "The list opens beside the field; typing jumps to the option that starts that way.",

    "selectPage.enhancedTitle": "Enhanced: a plan",
    "selectPage.anatomyBody":
      "A closed Select is a trigger: the positioner, the content and the rows only exist while the listbox is up. So the specimen is drawn open and stays open. It is frozen; the live Select is the one below.",
    "selectPage.anatomyLabel": "Select anatomy",
    "selectPage.anatomyPreviewLabel": "An open Select, part by part",
    "selectPage.lede": "Select chooses one option from a list that does not fit in view: a country, a category, an assignee. The list opens beside the field and is browsed by keyboard or typing. For a simple form choice, the native Select is enough.",
    "selectPage.htmlTitle": "In HTML: the items are the list",
    "selectPage.htmlBody": "The enhancer reads the items from the DOM; each needs a <code>data-value</code>. A hidden <code>&lt;select&gt;</code> with the same options submits it with the form and remains without JavaScript.",
    "selectPage.vanillaInitTitle": "Initializing Vanilla",
    "selectPage.listenTitle": "Listening for the change",
    "selectPage.nativeTitle": "Native: a real <select>",
    "selectPage.nativeBody": "Selection, keyboard and submission belong to the browser. Where supported, <code>appearance: base-select</code> gives the open list the same look.",
    "selectPage.nativeInstallTitle": "Installing just the native Select",
    "selectPage.iconsComment": "Icons are authored as <span data-sk-icon> placeholders;\nmountIcons replaces them with the <svg> of the linked set.",
    "selectPage.formsComment": "Optional: makes the Select submit inside a form, and it is\n     what remains with no JS. Its <option>s have to match\n     the items, or the enhancer throws.",
    "selectPage.test1": "Uses the Zag select machine for popup selection and form value.",
    "selectPage.test2": "Drives the machine over authored markup: ARIA, selection and the value text.",
    "selectPage.test3": "Emits <code>sk:selectvaluechange</code>, and cleanup stops the machine.",
    "demo.select.dd.billing": "Billing",
    "demo.select.dd.monthly": "Monthly",
    "demo.select.dd.yearly": "Yearly",
    "selectPage.prop.variant.title": "Variant: how much it shows",
    "selectPage.prop.variant.body": "Decides whether the field has a border or blends with its surroundings.",
    "selectPage.prop.variant.outline": "Use <code>outline</code>, the default, in a form, beside other bordered fields.",
    "selectPage.prop.variant.ghost": "Use <code>ghost</code> in a bar or a header, where a border would be noise.",
    "selectPage.guidelinesLede": "A list that opens saves space, at the cost of hiding the options until clicked.",
    "selectPage.dd.two.title": "Options: if few, in view",
    "selectPage.dd.two.do": 'With two or three options, show them all with a <a href="/components/radio-group">RadioGroup</a>.',
    "selectPage.dd.two.dont": "Hiding two options behind a click makes people open the list to see them.",
  },
} as const;
