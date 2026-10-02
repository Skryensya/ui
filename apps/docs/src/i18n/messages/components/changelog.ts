export const changelogMessages = {
  es: {
    "demo.changelog.vague.refactorBody": "Cambios internos.",
    "demo.changelog.vague.refactor": "Refactor",
    "demo.changelog.vague.fixesBody": "Mejoras de estabilidad.",
    "demo.changelog.vague.fixes": "Varios arreglos",
    /* The dates are written here, not formatted in the demo: the tree has a `Translate` and not a
       locale, and `Intl` needs the locale. Each language writes the date the way that language does. */
    "demo.changelog.label": "Cambios de Accordion",
    /* Untranslated, same as in the real changelog. See the note in `changelog.kind.*`. */
    "demo.changelog.kind.breaking": "breaking",
    "demo.changelog.kind.feature": "feature",
    "demo.changelog.kind.bugfix": "bugfix",
    "demo.changelog.kind.rework": "rework",
    /* A single date: the one of the release that actually shipped. The other has none, and that is
       precisely how the contract says it has not been published yet. */
    "demo.changelog.date": "29 de julio de 2026",
    /* Each entry is a headline and its explanation: the first is what gets scanned, the second what
       gets read once someone stopped there. */
    "demo.changelog.breaking.title": "El evento cambió de nombre",
    "demo.changelog.breaking.body": "Pasó a llamarse sk:accordionvaluechange. El anterior ya no se emite.",
    "demo.changelog.bugfix.title": "La parte se busca solo como hija directa",
    "demo.changelog.bugfix.body": "El enhancer la buscaba en cualquier descendiente, así que una sección anidada ataba su propio título como panel.",
    "demo.changelog.rework.title": "collapsible pasa a ser false por defecto",
    "demo.changelog.rework.body": "Es como se comportaba el acordeón de una sola sección desde siempre.",
    "demo.changelog.feature.title": "Primera publicación del contrato",
    "demo.changelog.feature.body": "Sale con sus tres firmas y las opciones que las componen.",
    "demo.changelog.chore.title": "El enhancer se publica con el resto del paquete",
    "demo.changelog.chore.body": "Antes salía como módulo aparte. Ni el markup ni las opciones se mueven.",

    /* "Changelog" and not "Cambios": it is the name of the component and of the section, and it stays
       the same in both languages. The word is already used that way here; translating it on only one
       side made the same section be called something different depending on the URL. */
    "changelog.tab": "Changelog",
    "changelog.title": "Changelog",
    "changelog.empty": "Nada todavía. El contrato no se movió desde su primera publicación.",
    /* The five kinds are NOT translated, and it is the same decision as "Changelog" above: they are the
       vocabulary a commit is written with and the one people already read a release of any other
       package with. Translated on only one side, the same entry would be called something different
       depending on the URL, and "rehecho" means nothing "rework" does not say better. */
    "changelog.kind.breaking": "breaking",
    "changelog.kind.feature": "feature",
    "changelog.kind.bugfix": "bugfix",
    "changelog.kind.rework": "rework",
    "changelog.kind.chore": "chore",

    "changelogPage.description": "Lista las versiones de algo y lo que cambió en cada una, lo más nuevo arriba.",

    "changelogPage.a11yYours2": "Si pones el changelog bajo un encabezado, ajusta los niveles de los títulos de versión al esquema de la página.",

    "changelogPage.a11yYours1": "Nombra la lista con <code>aria-label</code>: «Cambios de Accordion».",

    "changelogPage.a11yDoes3": "El tipo se escribe con una palabra; el punto de color es decorativo.",

    "changelogPage.a11yDoes2": "La fecha va en un <code>&lt;time datetime&gt;</code>.",

    "changelogPage.a11yDoes1": "La lista es <code>reversed</code>, así el lector de pantalla cuenta hacia atrás, como el tiempo.",

    "changelogPage.a11yIntro": "Changelog es una lista ordenada: no tiene controles ni foco.",

    "changelogPage.content4": "Formatea la fecha en el idioma de la página; no la escribas a mano.",

    "changelogPage.content3": "Nombra en <code>target</code> la opción o la parte que tocó el cambio.",

    "changelogPage.content2": "En un cambio incompatible, di qué hay que hacer para actualizarse.",

    "changelogPage.content1": "Titula cada entrada con lo que cambió para quien lo usa: «El evento cambió de nombre», no «Refactor».",

    "changelogPage.dd.specific.dont": "«Varios arreglos» obliga a leer el código para saber si algo te afecta.",

    "changelogPage.dd.specific.do": "«El evento cambió de nombre» dice qué hay que tocar en el código que lo consume.",

    "changelogPage.dd.specific.title": "Entradas: qué cambió para quien lo usa",

    "changelogPage.whenNot4": 'Para una actividad con autores y horas: usa <a href="/es/componentes/feed">Feed</a>.',

    "changelogPage.whenNot3": 'Para una sola novedad sin historia alrededor: usa un <a href="/es/componentes/callout">Callout</a>.',

    "changelogPage.whenNot2": 'Para mostrar en qué etapa está alguien: usa <a href="/es/componentes/steps">Steps</a>.',

    "changelogPage.whenNot1": 'Para instrucciones que se siguen en orden: usa <a href="/es/componentes/procedure">Procedure</a>.',

    "changelogPage.when2": "Cuando quien lee necesita saber desde qué versión puede contar con un cambio.",

    "changelogPage.when1": "Para las notas de versión de un producto o el historial de un contrato.",

    "changelogPage.contract4": "Una versión sin fecha es una versión sin publicar; no hay una opción aparte para decirlo.",

    "changelogPage.contract3": "El tipo también: la opción <code>kind</code> marca la entrada y el slot es la palabra, obligatoria, así el tipo nunca queda solo en el color.",

    "changelogPage.contract2": "La fecha son dos campos: <code>date</code> (<code>YYYY-MM-DD</code>) va a <code>&lt;time datetime&gt;</code>, y el texto visible es un slot que formateas con <code>Intl.DateTimeFormat</code>.",

    "changelogPage.contract1": "La raíz es un <code>&lt;ol reversed&gt;</code>: lo más nuevo arriba no es una opción, es lo que un changelog es.",

    "changelogPage.exampleBody": "La versión con sufijo <code>-dev</code> y sin fecha todavía no se publicó. Cada entrada dice su tipo con una palabra, y el punto lo refuerza.",

    "changelogPage.exampleTitle": "Dos versiones: una sin publicar",
    "changelogPage.lede": "Changelog lista las versiones de algo y lo que cambió en cada una, lo más nuevo arriba. Quien lo lee quiere saber si ya tiene el cambio que está leyendo, y la versión se lo dice. Es estático: no tiene estado ni JavaScript.",
    "changelogPage.anatomyBody": "La versión, su marcador y su fecha, y en cada entrada el tipo, el título y el texto.",
    "changelogPage.anatomyLabel": "Anatomía de Changelog",
    "changelogPage.anatomyPreviewLabel": "Changelog, parte por parte",
    "changelogPage.test1": "Renderiza una lista ordenada de releases en orden inverso (el más reciente primero).",
    "changelogPage.test2": "Un release sin fecha se marca «sin publicar» y no renderiza hora alguna.",
    "changelogPage.test3": "El tipo de cambio se dibuja como un Badge.",
    "changelogPage.test4": "Título y descripción se renderizan como partes separadas.",
    "changelogPage.guidelinesLede": "Un changelog responde una pregunta: ¿ya tengo este cambio?",
  },
  en: {
    "demo.changelog.vague.refactorBody": "Internal changes.",
    "demo.changelog.vague.refactor": "Refactor",
    "demo.changelog.vague.fixesBody": "Stability improvements.",
    "demo.changelog.vague.fixes": "Various fixes",
    /* The dates are written here rather than formatted in the demo: the tree has a `Translate` and
       not a locale, and `Intl` needs the locale. Each language writes a date the way it writes dates. */
    "demo.changelog.label": "Accordion changes",
    "demo.changelog.kind.breaking": "breaking",
    "demo.changelog.kind.feature": "feature",
    "demo.changelog.kind.bugfix": "bugfix",
    "demo.changelog.kind.rework": "rework",
    /* One date: the release that actually shipped. The other has none, and that absence is exactly
       how the contract says a version has not been published. */
    "demo.changelog.date": "29 July 2026",
    /* Every entry is a headline and its explanation: the first is what gets scanned, the second is
       what gets read once someone has stopped on it. */
    "demo.changelog.breaking.title": "The event was renamed",
    "demo.changelog.breaking.body": "It is now called sk:accordionvaluechange. The old one is no longer emitted.",
    "demo.changelog.bugfix.title": "The part is scoped to a direct child",
    "demo.changelog.bugfix.body": "The enhancer looked for it on any descendant, so a nested section bound its own title as the panel.",
    "demo.changelog.rework.title": "collapsible now defaults to false",
    "demo.changelog.rework.body": "Which is how a single-section accordion had always behaved anyway.",
    "demo.changelog.feature.title": "First published contract",
    "demo.changelog.feature.body": "It ships with its three signatures and the options that compose them.",
    "demo.changelog.chore.title": "The enhancer ships with the rest of the package",
    "demo.changelog.chore.body": "It used to be a separate module. Neither the markup nor the options move.",

    "changelog.tab": "Changelog",
    "changelog.title": "Changelog",
    "changelog.empty": "Nothing yet. The contract has not moved since it was first published.",
    "changelog.kind.breaking": "breaking",
    "changelog.kind.feature": "feature",
    "changelog.kind.bugfix": "bugfix",
    "changelog.kind.rework": "rework",
    "changelog.kind.chore": "chore",

    "changelogPage.description": "Lists something's versions and what changed in each, newest first.",

    "changelogPage.a11yYours2": "If the changelog sits under a heading, set the version titles' levels to fit the page's outline.",

    "changelogPage.a11yYours1": "Name the list with <code>aria-label</code>: “Accordion changes”.",

    "changelogPage.a11yDoes3": "The kind is written as a word; the colored dot is decorative.",

    "changelogPage.a11yDoes2": "The date is in a <code>&lt;time datetime&gt;</code>.",

    "changelogPage.a11yDoes1": "The list is <code>reversed</code>, so a screen reader counts down, as time does.",

    "changelogPage.a11yIntro": "Changelog is an ordered list: it has no controls and no focus.",

    "changelogPage.content4": "Format the date in the page's language; do not write it by hand.",

    "changelogPage.content3": "Name in <code>target</code> the option or part the change touched.",

    "changelogPage.content2": "For a breaking change, say what to do to upgrade.",

    "changelogPage.content1": "Title each entry with what changed for whoever uses it: “The event was renamed”, not “Refactor”.",

    "changelogPage.dd.specific.dont": "“Various fixes” makes people read the code to know whether anything affects them.",

    "changelogPage.dd.specific.do": "“The event was renamed” says what to change in the code that consumes it.",

    "changelogPage.dd.specific.title": "Entries: what changed for whoever uses it",

    "changelogPage.whenNot4": 'For activity with authors and times: use <a href="/components/feed">Feed</a>.',

    "changelogPage.whenNot3": 'For a single piece of news with no history around it: use a <a href="/components/callout">Callout</a>.',

    "changelogPage.whenNot2": 'To show which stage someone is at: use <a href="/components/steps">Steps</a>.',

    "changelogPage.whenNot1": 'For instructions followed in order: use <a href="/components/procedure">Procedure</a>.',

    "changelogPage.when2": "When readers need to know from which version they can rely on a change.",

    "changelogPage.when1": "For a product's release notes or a contract's history.",

    "changelogPage.contract4": "A version with no date is an unpublished version; there is no separate option to say so.",

    "changelogPage.contract3": "So is the kind: the <code>kind</code> option marks the entry and the slot is the word, required, so the kind is never color alone.",

    "changelogPage.contract2": "The date is two fields: <code>date</code> (<code>YYYY-MM-DD</code>) lands on <code>&lt;time datetime&gt;</code>, and the visible text is a slot you format with <code>Intl.DateTimeFormat</code>.",

    "changelogPage.contract1": "The root is an <code>&lt;ol reversed&gt;</code>: newest first is not an option, it is what a changelog is.",

    "changelogPage.exampleBody": "The version with a <code>-dev</code> suffix and no date is not published yet. Each entry states its kind in a word, and the dot reinforces it.",

    "changelogPage.exampleTitle": "Two versions: one unpublished",
    "changelogPage.lede": "Changelog lists something's versions and what changed in each, newest first. Readers want to know whether they already have the change they are reading, and the version tells them. It is static: no state and no JavaScript.",
    "changelogPage.anatomyBody": "The version, its marker and its date, and in each entry the kind, the title and the text.",
    "changelogPage.anatomyLabel": "Changelog anatomy",
    "changelogPage.anatomyPreviewLabel": "Changelog, part by part",
    "changelogPage.test1": "Renders a reversed ordered list of releases (most recent first).",
    "changelogPage.test2": "A release with no date is marked unreleased and renders no time at all.",
    "changelogPage.test3": "The kind of change is drawn as a Badge.",
    "changelogPage.test4": "Title and description render as separate parts.",
    "changelogPage.guidelinesLede": "A changelog answers one question: do I have this change yet?",
  },
} as const;
