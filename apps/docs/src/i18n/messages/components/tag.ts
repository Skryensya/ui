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

    "tagPage.description": "Tag: chip de palabra clave opcionalmente removible, con tonos y componente React.",
    "tagPage.lede":
      'Tag clasifica contenido sobre el que el usuario puede actuar: filtros, facetas, chips. Donde <a href="/es/componentes/badge">Badge</a> es una etiqueta de estado de solo lectura, Tag es más cuadrado (radio de control, no píldora) para leerse como accionable.',
    "tagPage.simpleTitle": "Tags de palabra clave",
    "tagPage.anatomyBody":
      "Este diagrama nombra el chip, la etiqueta y el botón de quitar. El espécimen está congelado; los Tag vivos empiezan abajo.",
    "tagPage.anatomyLabel": "Anatomía de Tag",
    "tagPage.anatomyPreviewLabel": "Tag, parte por parte",
    "tagPage.simpleBody":
      "Una etiqueta quieta categoriza contenido sin sugerir estado, alerta o eliminación.",
    "tagPage.simpleLabel": "Tag simple",
    "tagPage.tonesTitle": "Tags con tono",
    "tagPage.tonesBody":
      "El tono comunica función. Activo, beta, deprecado, pero sigue siendo Tag. Si sólo quieres un estado de lectura, Badge es la pieza correcta.",
    "tagPage.tonesLabel": "Tonos",
    "tagPage.linksTitle": "Tags enlace",
    "tagPage.linksBody":
      "Un tag enlace navega a una faceta o palabra clave. No puede ser dismissible: si el usuario debe quitar un filtro, usa un tag removible con su botón separado.",
    "tagPage.linksLabel": "Tags enlace",
    "tagPage.removableTitle": "Tags removibles",
    "tagPage.removableBody":
      "Cuando es removible, la etiqueta y el botón de quitar son dos objetivos distintos. El nombre accesible del control nombra el tag exacto que remueve.",
    "tagPage.removableLabel": "Tags removibles",
    "tagPage.prop.tone.title": "Tono",
    "tagPage.prop.tone.body": "<code>tone</code> comunica la función del tag.",
    "tagPage.prop.tone.neutral": "Usa <code>neutral</code> para una palabra clave común.",
    "tagPage.prop.tone.accent": "Usa <code>accent</code> para destacar una faceta elegida.",
    "tagPage.prop.tone.success": "Usa <code>success</code> para una faceta positiva o activa.",
    "tagPage.prop.tone.warning": "Usa <code>warning</code> para una faceta que necesita atención.",
    "tagPage.prop.tone.danger": "Usa <code>danger</code> para una faceta riesgosa o deprecada.",
    "tagPage.prop.appearance.title": "Apariencia",
    "tagPage.prop.appearance.body": "<code>appearance</code> cambia cómo se dibuja el chip.",
    "tagPage.prop.appearance.plain": "Usa <code>plain</code> como apariencia base.",
    "tagPage.prop.appearance.brutalist": "Usa <code>brutalist</code> cuando el tag acompaña una superficie de borde fuerte.",
    "tagPage.prop.removable.title": "Removible",
    "tagPage.prop.removable.body": "<code>removable</code> añade un botón separado para quitar el tag.",
    "tagPage.prop.removable.false": "Déjalo fijo cuando sólo clasifica contenido.",
    "tagPage.prop.removable.true": "Hazlo removible cuando representa una faceta aplicada.",
    "tagPage.prop.removable.falseLabel": "Fijo",
    "tagPage.prop.removable.trueLabel": "Removible",
    "tagPage.showcaseTitle": "Showcases",
    "tagPage.showcaseBody": "Tag cubre palabras clave, tonos, navegación y filtros removibles.",
    "tagPage.guidelinesLede": "Usa Tag cuando la etiqueta clasifica algo sobre lo que la persona puede actuar.",
    "tagPage.dd.job.title": "Un trabajo por tag",
    "tagPage.dd.job.do": "Usa tags removibles para filtros aplicados.",
    "tagPage.dd.job.dont": "No uses tonos como si todos fueran estados de sólo lectura; para eso existe Badge.",
    "tagPage.dd.link.title": "Navegar o quitar",
    "tagPage.dd.link.do": "Usa Tag.link cuando el chip navega a una faceta.",
    "tagPage.dd.link.dont": "No mezcles navegación y quitar en el mismo chip.",
    "tagPage.test1": "Lleva su tono y su etiqueta.",
    "tagPage.test2": "Expone un control de remover nombrado solo cuando <code>removable</code> es verdadero.",
    "tagPage.test3": "El control de remover compone Button real: foco, press y área de toque vienen de Button.",
    "tagPage.testLink": "Renderiza un tag navegable como enlace y nunca como dismissible.",
  },
  en: {

    /* The demos' words. The composition they sit in is shared: see the Spanish block above. */
    "demo.tag.design": "design",
    "demo.tag.active": "active",
    "demo.tag.deprecated": "deprecated",
    "demo.tag.remove": "Remove {name}",

    "tagPage.description": "Tag: an optionally removable keyword chip, with tones and a React component.",
    "tagPage.lede":
      'Tag classifies content the user can act on: filters, facets, chips. Where <a href="/components/badge">Badge</a> is a read-only status label, Tag is more squared (control radius, not a pill) to read as actionable.',
    "tagPage.simpleTitle": "Keyword tags",
    "tagPage.anatomyBody":
      "This diagram names the chip, the label and the remove button. The specimen is frozen; the live Tags begin below.",
    "tagPage.anatomyLabel": "Tag anatomy",
    "tagPage.anatomyPreviewLabel": "Tag, part by part",
    "tagPage.simpleBody":
      "A quiet label categorizes content without implying status, warning, or removal.",
    "tagPage.simpleLabel": "Simple tag",
    "tagPage.tonesTitle": "Tonal tags",
    "tagPage.tonesBody":
      "Tone communicates function. Active, beta, deprecated, but the component is still Tag. If you only need read-only status, Badge is the right piece.",
    "tagPage.tonesLabel": "Tones",
    "tagPage.linksTitle": "Link tags",
    "tagPage.linksBody":
      "A link tag navigates to a facet or keyword. It cannot be dismissible: if the user needs to remove a filter, use a removable tag with its separate button.",
    "tagPage.linksLabel": "Link tags",
    "tagPage.removableTitle": "Removable tags",
    "tagPage.removableBody":
      "When removable, the label and the remove button are two separate targets. The control's accessible name names the exact tag it removes.",
    "tagPage.removableLabel": "Removable tags",
    "tagPage.prop.tone.title": "Tone",
    "tagPage.prop.tone.body": "<code>tone</code> communicates the tag's function.",
    "tagPage.prop.tone.neutral": "Use <code>neutral</code> for an ordinary keyword.",
    "tagPage.prop.tone.accent": "Use <code>accent</code> to highlight a selected facet.",
    "tagPage.prop.tone.success": "Use <code>success</code> for a positive or active facet.",
    "tagPage.prop.tone.warning": "Use <code>warning</code> for a facet that needs attention.",
    "tagPage.prop.tone.danger": "Use <code>danger</code> for a risky or deprecated facet.",
    "tagPage.prop.appearance.title": "Appearance",
    "tagPage.prop.appearance.body": "<code>appearance</code> changes how the chip is drawn.",
    "tagPage.prop.appearance.plain": "Use <code>plain</code> as the base appearance.",
    "tagPage.prop.appearance.brutalist": "Use <code>brutalist</code> when the tag sits with a strong-edged surface.",
    "tagPage.prop.removable.title": "Removable",
    "tagPage.prop.removable.body": "<code>removable</code> adds a separate button to remove the tag.",
    "tagPage.prop.removable.false": "Keep it fixed when it only classifies content.",
    "tagPage.prop.removable.true": "Make it removable when it represents an applied facet.",
    "tagPage.prop.removable.falseLabel": "Fixed",
    "tagPage.prop.removable.trueLabel": "Removable",
    "tagPage.showcaseTitle": "Showcases",
    "tagPage.showcaseBody": "Tag covers keywords, tones, navigation, and removable filters.",
    "tagPage.guidelinesLede": "Use Tag when the label classifies something the person can act on.",
    "tagPage.dd.job.title": "One job per tag",
    "tagPage.dd.job.do": "Use removable tags for applied filters.",
    "tagPage.dd.job.dont": "Do not use tones as if every tag were read-only status; that is Badge's job.",
    "tagPage.dd.link.title": "Navigate or remove",
    "tagPage.dd.link.do": "Use Tag.link when the chip navigates to a facet.",
    "tagPage.dd.link.dont": "Do not mix navigation and removal in the same chip.",
    "tagPage.test1": "Carries its tone and label.",
    "tagPage.test2": "Exposes a named remove control only when <code>removable</code> is true.",
    "tagPage.test3": "The remove control composes a real Button: focus, press, and hit area come from Button.",
    "tagPage.testLink": "Renders a navigable tag as a link and never as dismissible.",
  },
} as const;
