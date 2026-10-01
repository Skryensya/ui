export const tagMessages = {
  es: {

    /*
     * THE CONTENT OF THE DEMOS, so a usage tree can be written ONCE and read in either language.
     *
     * A demo's tree is its composition (which signature, nested how, with which options), and none
     * of that is Spanish or English. Only the words inside it are, so only the words live here: the
     * two pages import the same tree factory from `src/demos/` and hand it their translator. Before
     * this, each page carried its own copy of the tree, which is the same duplication the tree came
     * to remove, one language later.
     *
     * A demo string that is a PROPER NOUN stays in the tree (`react`, `frontend`, `tokens`): it is
     * not translated, and a key for it would only be an identity entry that can rot.
     */
    "demo.tag.design": "diseño",
    "demo.tag.active": "activo",
    "demo.tag.deprecated": "deprecado",
    "demo.tag.remove": "Quitar {name}",

    "tagPage.description": "Clasifica contenido con palabras clave sobre las que se puede actuar: filtrar, quitar, navegar.",

    "tagPage.key.remove": "Con el foco en el botón, quita el tag.",

    "tagPage.a11yYours2": "Pon los filtros en una lista con nombre: «Filtros aplicados».",

    "tagPage.a11yYours1": "Al quitar un tag, lleva el foco al siguiente, o al campo si no quedan.",

    "tagPage.a11yDoes2": "<code>Tag.link</code> es un enlace nativo.",

    "tagPage.a11yDoes1": "El botón de quitar tiene su propio nombre accesible.",

    "tagPage.a11yIntro": "Tag es texto, un enlace o un texto con botón, según su función.",

    "tagPage.content2": "Nombra el botón de quitar con el tag: «Quitar Diseño».",

    "tagPage.content1": "Escribe una o dos palabras: «Diseño», «Accesibilidad».",

    "tagPage.whenNot3": 'Para elegir entre opciones: usa <a href="/es/componentes/checkbox">Checkbox</a> o <a href="/es/componentes/segmented">Segmented</a>.',

    "tagPage.whenNot2": 'Para escribir varios valores en un campo: usa <a href="/es/componentes/tags-input">TagsInput</a>.',

    "tagPage.whenNot1": 'Para un estado que solo se lee: usa <a href="/es/componentes/badge">Badge</a>.',

    "tagPage.when2": "Para temas o palabras clave que llevan a su página.",

    "tagPage.when1": "Para los filtros aplicados de una búsqueda, que se quitan uno a uno.",

    "tagPage.contract3": "Quitar un tag dispara un evento; sacarlo de la lista es tuyo.",

    "tagPage.contract2": "<code>Tag.link</code> es un enlace; no acepta <code>removable</code>.",

    "tagPage.contract1": "Un tag removible tiene dos partes: el texto y un botón aparte, con nombre propio.",
    "tagPage.lede": 'Tag clasifica contenido con palabras clave sobre las que se puede actuar: los filtros aplicados de una búsqueda, los temas de un artículo, las etiquetas de un ticket. Un tag se quita o lleva a su tema; un <a href="/es/componentes/badge">Badge</a> solo se lee.',
    "tagPage.simpleTitle": "Palabras clave: los temas de un artículo",
    "tagPage.anatomyBody":
      "Este diagrama nombra el chip, la etiqueta y el botón de quitar. El espécimen está congelado; los Tag vivos empiezan abajo.",
    "tagPage.anatomyLabel": "Anatomía de Tag",
    "tagPage.anatomyPreviewLabel": "Tag, parte por parte",
    "tagPage.simpleBody": "Clasifican sin sugerir estado ni alerta.",
    "tagPage.tonesTitle": "Con tono: activo, beta, obsoleto",
    "tagPage.tonesBody": "El tono dice qué función tiene cada palabra clave.",
    "tagPage.linksTitle": "Enlaces: cada tag lleva a su tema",
    "tagPage.linksBody": "<code>Tag.link</code> navega a la página del tema; no se puede quitar.",
    "tagPage.removableTitle": "Filtros: cada tag se quita",
    "tagPage.removableBody": "La etiqueta y el botón de quitar son dos objetivos distintos.",
    "tagPage.prop.tone.title": "Tone: la función del tag",
    "tagPage.prop.tone.body": "Dice qué es la palabra clave; el texto sigue siendo lo que se lee.",
    "tagPage.prop.tone.neutral": "Usa <code>neutral</code>, el valor por defecto, para una palabra clave común.",
    "tagPage.prop.tone.accent": "Usa <code>accent</code> para destacar una faceta elegida.",
    "tagPage.prop.tone.success": "Usa <code>success</code> para una faceta positiva o activa.",
    "tagPage.prop.tone.warning": "Usa <code>warning</code> para una faceta que necesita atención.",
    "tagPage.prop.tone.danger": "Usa <code>danger</code> para una faceta riesgosa o deprecada.",
    "tagPage.prop.removable.title": "Removable: un botón para quitarlo",
    "tagPage.prop.removable.body": "Agrega un botón aparte para quitar el tag.",
    "tagPage.prop.removable.false": "Usa <code>false</code>, el valor por defecto, cuando el tag solo clasifica.",
    "tagPage.prop.removable.true": "Usa <code>true</code> cuando el tag es un filtro aplicado.",
    "tagPage.prop.removable.falseLabel": "Fijo",
    "tagPage.prop.removable.trueLabel": "Removible",
    "tagPage.guidelinesLede": "Un tag es algo que se puede tocar: si solo se lee, es un Badge.",
    "tagPage.dd.job.title": "Función: se actúa sobre él",
    "tagPage.dd.job.do": "Un filtro aplicado se quita con su botón.",
    "tagPage.dd.job.dont": "Un estado que solo se lee, como «Beta», es un Badge.",
    "tagPage.dd.link.title": "Acción: navegar o quitar, no las dos",
    "tagPage.dd.link.do": "Un tag que lleva a su tema es un enlace.",
    "tagPage.dd.link.dont": "Un tag que navega y además se quita ofrece dos acciones en un objetivo pequeño.",
    "tagPage.test1": "Lleva su tono y su etiqueta.",
    "tagPage.test2": "Expone un control de remover nombrado solo cuando <code>removable</code> es verdadero.",
    "tagPage.test3": "El control de remover compone Button real: foco, press y área de toque vienen de Button.",
  },
  en: {

    /* The demos' words. The composition they sit in is shared: see the Spanish block above. */
    "demo.tag.design": "design",
    "demo.tag.active": "active",
    "demo.tag.deprecated": "deprecated",
    "demo.tag.remove": "Remove {name}",

    "tagPage.description": "Classifies content with keywords that can be acted on: filter, remove, navigate.",

    "tagPage.key.remove": "With focus on the button, removes the tag.",

    "tagPage.a11yYours2": "Put filters in a named list: “Applied filters”.",

    "tagPage.a11yYours1": "On removing a tag, move focus to the next one, or to the field if none are left.",

    "tagPage.a11yDoes2": "<code>Tag.link</code> is a native link.",

    "tagPage.a11yDoes1": "The remove button has its own accessible name.",

    "tagPage.a11yIntro": "Tag is text, a link or text with a button, depending on its function.",

    "tagPage.content2": "Name the remove button with the tag: “Remove Design”.",

    "tagPage.content1": "Write one or two words: “Design”, “Accessibility”.",

    "tagPage.whenNot3": 'To choose among options: use <a href="/components/checkbox">Checkbox</a> or <a href="/components/segmented">Segmented</a>.',

    "tagPage.whenNot2": 'To type several values into a field: use <a href="/components/tags-input">TagsInput</a>.',

    "tagPage.whenNot1": 'For a status that is only read: use <a href="/components/badge">Badge</a>.',

    "tagPage.when2": "For topics or keywords that lead to their page.",

    "tagPage.when1": "For a search's applied filters, removed one by one.",

    "tagPage.contract3": "Removing a tag fires an event; taking it off the list is yours.",

    "tagPage.contract2": "<code>Tag.link</code> is a link; it does not take <code>removable</code>.",

    "tagPage.contract1": "A removable tag has two parts: the text and a separate button, with its own name.",
    "tagPage.lede": 'Tag classifies content with keywords that can be acted on: a search\'s applied filters, an article\'s topics, a ticket\'s labels. A tag is removed or leads to its topic; a <a href="/components/badge">Badge</a> is only read.',
    "tagPage.simpleTitle": "Keywords: an article's topics",
    "tagPage.anatomyBody":
      "This diagram names the chip, the label and the remove button. The specimen is frozen; the live Tags begin below.",
    "tagPage.anatomyLabel": "Tag anatomy",
    "tagPage.anatomyPreviewLabel": "Tag, part by part",
    "tagPage.simpleBody": "They classify without suggesting status or alert.",
    "tagPage.tonesTitle": "With tone: active, beta, deprecated",
    "tagPage.tonesBody": "The tone says what function each keyword has.",
    "tagPage.linksTitle": "Links: each tag leads to its topic",
    "tagPage.linksBody": "<code>Tag.link</code> navigates to the topic's page; it cannot be removed.",
    "tagPage.removableTitle": "Filters: each tag is removed",
    "tagPage.removableBody": "The label and the remove button are two separate targets.",
    "tagPage.prop.tone.title": "Tone: the tag's function",
    "tagPage.prop.tone.body": "Says what the keyword is; the text is still what is read.",
    "tagPage.prop.tone.neutral": "Use <code>neutral</code>, the default, for a common keyword.",
    "tagPage.prop.tone.accent": "Use <code>accent</code> to highlight a selected facet.",
    "tagPage.prop.tone.success": "Use <code>success</code> for a positive or active facet.",
    "tagPage.prop.tone.warning": "Use <code>warning</code> for a facet that needs attention.",
    "tagPage.prop.tone.danger": "Use <code>danger</code> for a risky or deprecated facet.",
    "tagPage.prop.removable.title": "Removable: a button to remove it",
    "tagPage.prop.removable.body": "Adds a separate button to remove the tag.",
    "tagPage.prop.removable.false": "Use <code>false</code>, the default, when the tag only classifies.",
    "tagPage.prop.removable.true": "Use <code>true</code> when the tag is an applied filter.",
    "tagPage.prop.removable.falseLabel": "Fixed",
    "tagPage.prop.removable.trueLabel": "Removable",
    "tagPage.guidelinesLede": "A tag is something to act on: if it is only read, it is a Badge.",
    "tagPage.dd.job.title": "Function: it is acted on",
    "tagPage.dd.job.do": "An applied filter is removed with its button.",
    "tagPage.dd.job.dont": "A status that is only read, like “Beta”, is a Badge.",
    "tagPage.dd.link.title": "Action: navigate or remove, not both",
    "tagPage.dd.link.do": "A tag that leads to its topic is a link.",
    "tagPage.dd.link.dont": "A tag that navigates and is also removed offers two actions on a small target.",
    "tagPage.test1": "Carries its tone and label.",
    "tagPage.test2": "Exposes a named remove control only when <code>removable</code> is true.",
    "tagPage.test3": "The remove control composes a real Button: focus, press, and hit area come from Button.",
  },
} as const;
