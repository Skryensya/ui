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
    "demo.tag.accessibility": "accesibilidad",
    "demo.tag.performance": "rendimiento",
    "demo.tag.articleTitle": "Diseñar interfaces accesibles",
    "demo.tag.articleSummary": "Principios prácticos para productos que funcionan para más personas.",
    "demo.tag.remove": "Quitar {name}",

    "tagPage.description": "Clasifica contenido con palabras clave: pueden ser etiquetas estáticas, enlaces o filtros que se quitan o seleccionan.",

    "tagPage.key.remove": "Con el foco en el botón, quita el tag.",

    "tagPage.a11yYours2": "Pon los filtros en una lista con nombre: «Filtros aplicados».",

    "tagPage.a11yYours1": "Al quitar un tag, lleva el foco al siguiente, o al campo si no quedan.",

    "tagPage.a11yDoes3": "<code>Tag.toggle</code> es un botón nativo: Tab, Enter y Espacio ya funcionan.",
    "tagPage.a11yDoes2": "<code>Tag.link</code> es un enlace nativo.",

    "tagPage.a11yDoes1": "El botón de quitar tiene su propio nombre accesible.",

    "tagPage.a11yIntro": "Tag es texto, un enlace o un texto con botón, según su función.",

    "tagPage.content2": "Nombra el botón de quitar con el tag: «Quitar Diseño».",

    "tagPage.content1": "Escribe una o dos palabras: «Diseño», «Accesibilidad».",

    "tagPage.whenNot3": 'Si las opciones son mutuamente excluyentes (una, no varias): usa <a href="/es/componentes/checkbox">Checkbox</a> o <a href="/es/componentes/segmented">Segmented</a>, no <code>Tag.toggle</code>.',

    "tagPage.whenNot2": 'Para escribir varios valores en un campo: usa <a href="/es/componentes/tags-input">TagsInput</a>.',

    "tagPage.whenNot1": 'Para un estado que solo se lee: usa <a href="/es/componentes/badge">Badge</a>.',

    "tagPage.when4": "Para palabras clave que clasifican el contenido de una tarjeta, aunque no sean clicables.",
    "tagPage.when3": "Para un filtro que se prende y se apaga por su cuenta, independiente de los demás (<code>Tag.toggle</code>).",
    "tagPage.when2": "Para temas o palabras clave que llevan a su página.",

    "tagPage.when1": "Para los filtros aplicados de una búsqueda, que se quitan uno a uno.",

    "tagPage.contract3": "Quitar un tag dispara un evento; sacarlo de la lista es tuyo.",

    "tagPage.contract2": "<code>Tag.link</code> es un enlace; no acepta <code>removable</code>.",

    "tagPage.contract1": "Un tag removible tiene dos partes: el texto y un botón aparte, con nombre propio.",
    "tagPage.lede": 'Tag nombra categorías y facetas: los temas de un artículo, las etiquetas de un ticket o los filtros de una búsqueda. Puede ser estático, enlazar a un tema o permitir seleccionar/quitar un filtro. <a href="/es/componentes/badge">Badge</a> comunica estados y cuentas.',
    "tagPage.simpleTitle": "Palabras clave: los temas de un artículo",
    "tagPage.anatomyBody":
      "Este diagrama nombra el chip, la etiqueta y el botón de quitar. El espécimen está congelado; los Tag vivos empiezan abajo.",
    "tagPage.anatomyLabel": "Anatomía de Tag",
    "tagPage.anatomyPreviewLabel": "Tag, parte por parte",
    "tagPage.simpleBody": "Un tema de artículo sigue siendo Tag aunque no tenga ninguna acción.",
    "tagPage.categoriesTitle": "Categorías en una tarjeta",
    "tagPage.categoriesBody": "Diseño, accesibilidad y rendimiento son temas, no estados: van en Tags aunque no sean interactivos.",
    "tagPage.tonesTitle": "Acento: destacar, no seleccionar",
    "tagPage.tonesBody": "<code>accent</code> da énfasis visual a una categoría. Para un filtro que sí se selecciona, usa <code>Tag.toggle</code>; para éxito, advertencia o error, usa Badge.",
    "tagPage.appliedFiltersLabel": "Filtros aplicados",
    "tagPage.noFiltersLabel": "No quedan filtros aplicados.",
    "tagPage.topicFiltersLabel": "Filtrar por tema",
    "tagPage.linksTitle": "Enlaces: navegar a un tema",
    "tagPage.linksBody": "Cada chip es un enlace real a la documentación del tema; no se puede quitar. La vista previa contiene los clics para que el ejemplo no te saque de la página.",
    "tagPage.removableTitle": "Filtros aplicados: quitar uno",
    "tagPage.removableBody": "Prueba la X: ese filtro desaparece de la lista. El texto y el botón de quitar son objetivos distintos.",
    "tagPage.toggleTitle": "Filtros disponibles",
    "tagPage.toggleDescription": "Elige si se puede activar un solo tema o varios a la vez.",
    "tagPage.toggleBody": "Activa y desactiva los temas. Cada Tag es un botón independiente: puede haber varios seleccionados a la vez, y el estado seleccionado persiste.",
    "tagPage.selection.modeLabel": "Modo de selección",
    "tagPage.selection.single": "Uno a la vez",
    "tagPage.selection.multiple": "Varios a la vez",
    "tagPage.selection.singleExplain": "Al activar un tema, se desactiva el anterior. Puedes volver a pulsar el activo para dejar todos desactivados.",
    "tagPage.prop.tone.title": "Tone: la función del tag",
    "tagPage.prop.tone.body": "Dice qué es la palabra clave; el texto sigue siendo lo que se lee.",
    "tagPage.prop.tone.neutral": "Usa <code>neutral</code>, el valor por defecto, para una palabra clave común.",
    "tagPage.prop.tone.accent": "Usa <code>accent</code> para dar énfasis visual; no significa que esté seleccionada.",
    "tagPage.prop.removable.title": "Removable: un botón para quitarlo",
    "tagPage.prop.removable.body": "Agrega un botón aparte para quitar el tag.",
    "tagPage.prop.removable.false": "Usa <code>false</code>, el valor por defecto, cuando el tag solo clasifica.",
    "tagPage.prop.removable.true": "Usa <code>true</code> cuando el tag es un filtro aplicado.",
    "tagPage.prop.removable.falseLabel": "Fijo",
    "tagPage.prop.removable.trueLabel": "Removible",
    "tagPage.prop.disabled.title": "Disabled: temporalmente bloqueado",
    "tagPage.prop.disabled.body": "<code>aria-disabled</code> en el chip; si es removible o un toggle, el control real también queda deshabilitado.",
    "tagPage.prop.disabled.false": "Usa <code>false</code>, el valor por defecto, cuando el tag se puede usar.",
    "tagPage.prop.disabled.true": "Usa <code>true</code> mientras la acción no está disponible (p. ej., guardando).",
    "tagPage.prop.disabled.falseLabel": "Activo",
    "tagPage.prop.disabled.trueLabel": "Deshabilitado",
    "tagPage.guidelinesLede": "Tag nombra una categoría o faceta, sea estática o interactiva. Badge comunica un estado o una cuenta.",
    "tagPage.dd.job.title": "Significado: categoría o estado",
    "tagPage.dd.job.do": "Los temas que clasifican contenido son categorías: usa Tags.",
    "tagPage.dd.job.dont": "«Beta» describe un estado, no una categoría: usa Badge.",
    "tagPage.dd.link.title": "Selección: estado, no color",
    "tagPage.dd.link.do": "<code>Tag.toggle</code> expone la selección con <code>aria-pressed</code>.",
    "tagPage.dd.link.dont": "<code>accent</code> solo da énfasis visual; no indica selección. Para un filtro seleccionable, usa <code>Tag.toggle</code>.",
    "tagPage.test1": "Lleva su tono y su etiqueta.",
    "tagPage.test2": "Expone un control de remover nombrado solo cuando <code>removable</code> es verdadero.",
    "tagPage.test3": "El control de remover compone Button real: foco, press y área de toque vienen de Button.",
  },
  en: {

    /* The demos' words. The composition they sit in is shared: see the Spanish block above. */
    "demo.tag.design": "design",
    "demo.tag.accessibility": "accessibility",
    "demo.tag.performance": "performance",
    "demo.tag.articleTitle": "Designing accessible interfaces",
    "demo.tag.articleSummary": "Practical principles for products that work for more people.",
    "demo.tag.remove": "Remove {name}",

    "tagPage.description": "Classifies content with keywords: they can be static labels, links, or filters that readers remove or select.",

    "tagPage.key.remove": "With focus on the button, removes the tag.",

    "tagPage.a11yYours2": "Put filters in a named list: “Applied filters”.",

    "tagPage.a11yYours1": "On removing a tag, move focus to the next one, or to the field if none are left.",

    "tagPage.a11yDoes3": "<code>Tag.toggle</code> is a native button: Tab, Enter and Space already work.",
    "tagPage.a11yDoes2": "<code>Tag.link</code> is a native link.",

    "tagPage.a11yDoes1": "The remove button has its own accessible name.",

    "tagPage.a11yIntro": "Tag is text, a link or text with a button, depending on its function.",

    "tagPage.content2": "Name the remove button with the tag: “Remove Design”.",

    "tagPage.content1": "Write one or two words: “Design”, “Accessibility”.",

    "tagPage.whenNot3": 'If the options are mutually exclusive (one, not several): use <a href="/components/checkbox">Checkbox</a> or <a href="/components/segmented">Segmented</a>, not <code>Tag.toggle</code>.',

    "tagPage.whenNot2": 'To type several values into a field: use <a href="/components/tags-input">TagsInput</a>.',

    "tagPage.whenNot1": 'For a status that is only read: use <a href="/components/badge">Badge</a>.',

    "tagPage.when4": "For keywords that classify a card's content, even when they are not clickable.",
    "tagPage.when3": "For a filter the reader turns on and off independently of the rest (<code>Tag.toggle</code>).",
    "tagPage.when2": "For topics or keywords that lead to their page.",

    "tagPage.when1": "For a search's applied filters, removed one by one.",

    "tagPage.contract3": "Removing a tag fires an event; taking it off the list is yours.",

    "tagPage.contract2": "<code>Tag.link</code> is a link; it does not take <code>removable</code>.",

    "tagPage.contract1": "A removable tag has two parts: the text and a separate button, with its own name.",
    "tagPage.lede": 'Tag names categories and facets: an article\'s topics, a ticket\'s labels, or a search\'s filters. It may be static, link to a topic, or let readers select/remove a filter. <a href="/components/badge">Badge</a> communicates statuses and counts.',
    "tagPage.simpleTitle": "Keywords: an article's topics",
    "tagPage.anatomyBody":
      "This diagram names the chip, the label and the remove button. The specimen is frozen; the live Tags begin below.",
    "tagPage.anatomyLabel": "Tag anatomy",
    "tagPage.anatomyPreviewLabel": "Tag, part by part",
    "tagPage.simpleBody": "An article topic is still a Tag even when it has no action.",
    "tagPage.categoriesTitle": "Categories on a card",
    "tagPage.categoriesBody": "Design, accessibility and performance are topics, not statuses: use Tags even when they are not interactive.",
    "tagPage.tonesTitle": "Accent: emphasis, not selection",
    "tagPage.tonesBody": "<code>accent</code> visually emphasizes a category. For a filter that can be selected, use <code>Tag.toggle</code>; for success, warning or danger, use Badge.",
    "tagPage.appliedFiltersLabel": "Applied filters",
    "tagPage.noFiltersLabel": "No filters left.",
    "tagPage.topicFiltersLabel": "Filter by topic",
    "tagPage.linksTitle": "Links: navigate to a topic",
    "tagPage.linksBody": "Each chip is a real link to the topic documentation; it cannot be removed. The preview contains clicks so the example does not take you away from this page.",
    "tagPage.removableTitle": "Applied filters: remove one",
    "tagPage.removableBody": "Try the X: that filter disappears from the list. The label and remove button are separate targets.",
    "tagPage.toggleTitle": "Available filters",
    "tagPage.toggleDescription": "Choose whether one topic or several can be active at once.",
    "tagPage.toggleBody": "Turn topics on and off. Each Tag is an independent button: several can be selected at once, and selection persists.",
    "tagPage.selection.modeLabel": "Selection mode",
    "tagPage.selection.single": "One at a time",
    "tagPage.selection.multiple": "Several at a time",
    "tagPage.selection.singleExplain": "Selecting a topic clears the previous one. Select the active topic again to clear the selection.",
    "tagPage.prop.tone.title": "Tone: the tag's function",
    "tagPage.prop.tone.body": "Says what the keyword is; the text is still what is read.",
    "tagPage.prop.tone.neutral": "Use <code>neutral</code>, the default, for a common keyword.",
    "tagPage.prop.tone.accent": "Use <code>accent</code> for visual emphasis; it does not mean the tag is selected.",
    "tagPage.prop.removable.title": "Removable: a button to remove it",
    "tagPage.prop.removable.body": "Adds a separate button to remove the tag.",
    "tagPage.prop.removable.false": "Use <code>false</code>, the default, when the tag only classifies.",
    "tagPage.prop.removable.true": "Use <code>true</code> when the tag is an applied filter.",
    "tagPage.prop.removable.falseLabel": "Fixed",
    "tagPage.prop.removable.trueLabel": "Removable",
    "tagPage.prop.disabled.title": "Disabled: temporarily blocked",
    "tagPage.prop.disabled.body": "<code>aria-disabled</code> on the chip; if it is removable or a toggle, the real control is disabled too.",
    "tagPage.prop.disabled.false": "Use <code>false</code>, the default, when the tag is usable.",
    "tagPage.prop.disabled.true": "Use <code>true</code> while the action is unavailable (saving, say).",
    "tagPage.prop.disabled.falseLabel": "Active",
    "tagPage.prop.disabled.trueLabel": "Disabled",
    "tagPage.guidelinesLede": "Tag names a category or facet, whether static or interactive. Badge communicates a status or count.",
    "tagPage.dd.job.title": "Meaning: category or status",
    "tagPage.dd.job.do": "Topics that classify content are categories: use Tags.",
    "tagPage.dd.job.dont": "“Beta” describes a status, not a category: use Badge.",
    "tagPage.dd.link.title": "Selection: state, not color",
    "tagPage.dd.link.do": "<code>Tag.toggle</code> exposes selection with <code>aria-pressed</code>.",
    "tagPage.dd.link.dont": "<code>accent</code> adds visual emphasis; it does not indicate selection. Use <code>Tag.toggle</code> for a selectable filter.",
    "tagPage.test1": "Carries its tone and label.",
    "tagPage.test2": "Exposes a named remove control only when <code>removable</code> is true.",
    "tagPage.test3": "The remove control composes a real Button: focus, press, and hit area come from Button.",
  },
} as const;
