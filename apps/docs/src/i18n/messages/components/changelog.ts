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

    "changelogPage.a11yDoes3": "El tipo se escribe con una palabra; el color del badge lo refuerza, nunca lo sustituye.",

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

    "changelogPage.exampleBody": "La versión con sufijo <code>-dev</code> y sin fecha todavía no se publicó. Cada entrada dice su tipo con una palabra, y el color del badge lo refuerza.",

    "changelogPage.exampleTitle": "Dos versiones: una sin publicar",
    "changelogPage.lede": "Changelog lista las versiones de algo y lo que cambió en cada una, lo más nuevo arriba. Quien lo lee quiere saber si ya tiene el cambio que está leyendo, y la versión se lo dice. Es estático: no tiene estado ni JavaScript.",
    "changelogPage.anatomyBody": "Dos niveles. La <strong>versión</strong> es lo que marca el riel: su marcador, su número y su fecha. Debajo, cada <strong>entrada</strong> es un cambio: el tipo (y, si hace falta, la parte que toca), el título y el texto.",
    "changelogPage.partsTitle": "Las partes",
    "changelogPage.partsAspect": "Clase",
    "changelogPage.partsColumns": "Qué es",
    "changelogPage.part.root": "La lista ordenada y <code>reversed</code>: lo más nuevo arriba.",
    "changelogPage.part.release": "Una versión y todo lo que salió en ella. Es lo que marca el riel.",
    "changelogPage.part.marker": "La marca del riel junto a la versión. Decorativa: la versión ya lo dice con palabras.",
    "changelogPage.part.version": "La versión como se escribe en un lockfile: <code>0.2.0</code>, o <code>0.2.0-dev</code> si no salió.",
    "changelogPage.part.date": "El día que salió, en un <code>&lt;time datetime&gt;</code>. Sin fecha, la versión no se publicó.",
    "changelogPage.part.entries": "La lista de cambios de una versión.",
    "changelogPage.part.entry": "Un cambio: tipo, título y texto, en ese orden.",
    "changelogPage.part.kind": "El tipo, dibujado como un Badge. Su color sale del tipo, no se elige.",
    "changelogPage.part.target": "La opción, parte o firma sobre la que trata el cambio. Opcional.",
    "changelogPage.part.title": "Qué cambió, en una línea: lo que se escanea.",
    "changelogPage.part.text": "Por qué cambió y qué significa para quien lo usa.",
    "changelogPage.kindsTitle": "Los cinco tipos",
    "changelogPage.kindsBody": "Describen qué le pasó a <em>quien lo usa</em>, no qué le pasó al archivo. Van del más ruidoso al más callado, y cada uno lleva su propio color: recorrer la columna de badges responde «¿algo de esto es para mí?» antes de leer una palabra.",
    "changelogPage.kindsAspect": "Tipo",
    "changelogPage.kindsColumns": "Rol del color|Qué le debe el lector",
    "changelogPage.kind.breaking.tone": "Peligro",
    "changelogPage.kind.breaking.duty": "Su código tiene que cambiar, hoy. Aquí entran también lo eliminado y lo obsoleto.",
    "changelogPage.kind.feature.tone": "Éxito",
    "changelogPage.kind.feature.duty": "Hay algo nuevo a lo que puede recurrir.",
    "changelogPage.kind.bugfix.tone": "Acento",
    "changelogPage.kind.bugfix.duty": "Algo que ya usaba estaba mal y ahora no: lo recibe sin hacer nada.",
    "changelogPage.kind.rework.tone": "Advertencia",
    "changelogPage.kind.rework.duty": "La misma capacidad, rehecha: no hay nada que hacer, pero puede no verse o comportarse igual.",
    "changelogPage.kind.chore.tone": "Neutro",
    "changelogPage.kind.chore.duty": "No le llega nada: compilación, dependencias, interiores. Es también lo que dice una entrada sin tipo.",
    "changelogPage.compactTitle": "Compacto, cuando haga falta",
    "changelogPage.compactBody": "Por defecto cada entrada son tres líneas: el tipo, el título y el texto. Para un historial largo que se recorre de un vistazo, <code>layout=\"inline\"</code> pone el tipo, la parte y el título en una sola fila y deja el texto debajo, y <code>size=\"xs\"</code> usa el badge compacto. Son las mismas palabras en el mismo orden, así que un lector de pantalla oye lo mismo.",
    "changelogPage.compactTitle2": "Las mismas entradas, dos líneas cada una",
    "changelogPage.contract5": "Cada entrada se coloca con <code>layout</code> (<code>stacked</code>, por defecto, o <code>inline</code>) y el badge con <code>size</code> (<code>md</code> por defecto, <code>sm</code> o <code>xs</code>). Ninguno es obligatorio: sin ellos el changelog se ve como siempre.",
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

    "changelogPage.a11yDoes3": "The kind is written as a word; the badge's color reinforces it and never replaces it.",

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

    "changelogPage.exampleBody": "The version with a <code>-dev</code> suffix and no date is not published yet. Each entry states its kind in a word, and the badge's color reinforces it.",

    "changelogPage.exampleTitle": "Two versions: one unpublished",
    "changelogPage.lede": "Changelog lists something's versions and what changed in each, newest first. Readers want to know whether they already have the change they are reading, and the version tells them. It is static: no state and no JavaScript.",
    "changelogPage.anatomyBody": "Two levels. The <strong>version</strong> is what the rail marks: its marker, its number and its date. Under it, each <strong>entry</strong> is one change: the kind (and, if needed, the part it touches), the title and the text.",
    "changelogPage.partsTitle": "The parts",
    "changelogPage.partsAspect": "Class",
    "changelogPage.partsColumns": "What it is",
    "changelogPage.part.root": "The ordered, <code>reversed</code> list: newest first.",
    "changelogPage.part.release": "One version and everything that shipped in it. It is what the rail marks.",
    "changelogPage.part.marker": "The rail's mark beside the version. Decorative: the version already says it in words.",
    "changelogPage.part.version": "The version as written in a lockfile: <code>0.2.0</code>, or <code>0.2.0-dev</code> if it has not shipped.",
    "changelogPage.part.date": "The day it shipped, in a <code>&lt;time datetime&gt;</code>. With no date, the version has not shipped.",
    "changelogPage.part.entries": "The list of changes in one version.",
    "changelogPage.part.entry": "One change: kind, title and text, in that order.",
    "changelogPage.part.kind": "The kind, drawn as a Badge. Its color comes from the kind; it is not chosen.",
    "changelogPage.part.target": "The option, part or signature the change is about. Optional.",
    "changelogPage.part.title": "What changed, in one line: what gets scanned.",
    "changelogPage.part.text": "Why it changed and what it means for whoever uses it.",
    "changelogPage.kindsTitle": "The five kinds",
    "changelogPage.kindsBody": "They describe what happened to <em>whoever uses it</em>, not to the file. They run from the loudest to the quietest, and each wears its own color: scanning the column of badges answers “is any of this for me?” before a word is read.",
    "changelogPage.kindsAspect": "Kind",
    "changelogPage.kindsColumns": "Color role|What the reader owes",
    "changelogPage.kind.breaking.tone": "Danger",
    "changelogPage.kind.breaking.duty": "Their code has to change, today. Removed and deprecated land here too.",
    "changelogPage.kind.feature.tone": "Success",
    "changelogPage.kind.feature.duty": "There is something new they can reach for.",
    "changelogPage.kind.bugfix.tone": "Accent",
    "changelogPage.kind.bugfix.duty": "Something they already use was wrong and now is not: they get it without doing anything.",
    "changelogPage.kind.rework.tone": "Warning",
    "changelogPage.kind.rework.duty": "The same capability, rebuilt: nothing to do, but it may not look or behave identically.",
    "changelogPage.kind.chore.tone": "Neutral",
    "changelogPage.kind.chore.duty": "Nothing reaches them: build, dependencies, internals. It is also what an entry with no kind says.",
    "changelogPage.compactTitle": "Compact, when you need it",
    "changelogPage.compactBody": "By default each entry is three lines: the kind, the title and the text. For a long history that is scanned at a glance, <code>layout=\"inline\"</code> puts the kind, the part and the title on one row and leaves the text under them, and <code>size=\"xs\"</code> uses the compact badge. It is the same words in the same order, so a screen reader hears the same thing.",
    "changelogPage.compactTitle2": "The same entries, two lines each",
    "changelogPage.contract5": "Each entry is laid out with <code>layout</code> (<code>stacked</code>, the default, or <code>inline</code>) and its badge sized with <code>size</code> (<code>md</code> by default, <code>sm</code> or <code>xs</code>). Neither is required: without them the changelog looks as it always did.",
    "changelogPage.anatomyLabel": "Changelog anatomy",
    "changelogPage.anatomyPreviewLabel": "Changelog, part by part",
    "changelogPage.test1": "Renders a reversed ordered list of releases (most recent first).",
    "changelogPage.test2": "A release with no date is marked unreleased and renders no time at all.",
    "changelogPage.test3": "The kind of change is drawn as a Badge.",
    "changelogPage.test4": "Title and description render as separate parts.",
    "changelogPage.guidelinesLede": "A changelog answers one question: do I have this change yet?",
  },
} as const;
