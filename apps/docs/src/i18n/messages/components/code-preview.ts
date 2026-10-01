export const codePreviewMessages = {
  es: {
    "demo.codePreview.genericLabel": "Código",

    "codePreview.description": "Muestra código para leer y copiar, resaltado y con su etiqueta.",

    "codePreview.a11yKeyEnter": "Activa el control con foco.",

    "codePreview.a11yKeyTab": "Recorre el botón de copiar, el interruptor de densidad y el de expandir.",

    "codePreview.a11yYours2": "No pongas en el avance algo que solo se entiende con el resto: la persona puede no expandirlo.",

    "codePreview.a11yYours1": "Traduce <code>moreLabel</code> y <code>lessLabel</code>: son los nombres del botón.",

    "codePreview.a11yDoes2": "El resaltado usa colores con contraste en modo claro y oscuro.",

    "codePreview.a11yDoes1": "El botón para expandir anuncia si el bloque está abierto (<code>aria-expanded</code>).",

    "codePreview.a11yIntro": "El código es texto seleccionable; los controles son botones nativos.",

    "codePreview.content3": "Escribe los comentarios del código en el idioma de la página.",

    "codePreview.content2": "Muestra solo lo necesario para el ejemplo; enlaza el archivo completo.",

    "codePreview.content1": "Pon en la etiqueta el archivo, el lenguaje o la terminal: «button.tsx», «terminal».",

    "codePreview.dd.label.dont": "«Código» no dice nada que el bloque no diga ya.",

    "codePreview.dd.label.do": "«example.ts» dice el archivo y la nota dice el lenguaje.",

    "codePreview.dd.label.title": "Etiqueta: di qué es",


    "codePreview.whenNot2": 'Si lo único que importa es copiarlo: usa <a href="/es/componentes/clipboard">CopyButton</a> sin bloque alrededor.',

    "codePreview.whenNot1": 'Para código dentro de una oración: usa <code>Code</code> en el <a href="/es/componentes/text">texto</a>.',

    "codePreview.when3": "Para la misma pieza en una versión corta y una completa: usa <code>CodePreview.density</code>.",

    "codePreview.when2": "Para un bloque largo que empujaría el resto de la página: con un avance que se expande.",

    "codePreview.when1": "Para mostrar código que debe leerse como código: resaltado, con su etiqueta.",

    "codePreview.contract3": "El resaltado no corre en el navegador: llega como HTML.",

    "codePreview.contract2": "<code>initComponents()</code> no lo monta: <code>mountCodePreview()</code> es una llamada aparte, para que ninguna aplicación cargue este enhancer por accidente.",

    "codePreview.contract1": "<code>components/code-preview.css</code> lee las variables <code>--shiki-light</code> y <code>--shiki-dark</code>.",

    "codePreview.exampleBody": "La etiqueta dice el archivo, la nota el lenguaje, y el avance muestra tres líneas.",

    "codePreview.exampleTitle": "Un bloque con etiqueta y avance",

    "codePreview.prop.collapsible.true": "Usa <code>true</code> cuando mostrar el bloque entero empuja el resto de la página fuera de la vista.",

    "codePreview.prop.collapsible.false": "Usa <code>false</code> para bloques cortos, que se leen enteros.",

    "codePreview.prop.collapsible.body": "Decide si un bloque largo muestra unas líneas y un botón para verlo completo.",

    "codePreview.prop.collapsible.title": "Collapsible: entero o un avance",
    "codePreview.lede": "CodePreview muestra código para leer y copiar: resaltado, con una etiqueta que dice qué es y, si es largo, un avance que se expande. Shiki resalta en build o SSR; el navegador solo monta los controles.",
    "demo.codePreview.label": "example.ts",
    "demo.codePreview.note": "TypeScript",
    "demo.codePreview.condensed": 'const registrations = [\n  { selector: "[data-sk-button]" },\n];',
    "demo.codePreview.full":
      'const registrations = [\n  { selector: "[data-sk-button]", load: () => import("./button.js") },\n  { selector: "[data-sk-select]", load: () => import("./select.js") },\n];',
    "codePreview.anatomyBody": "La etiqueta, la nota, el interruptor de densidad, el avance, el visor y el botón para expandir.",
    "codePreview.anatomyLabel": "Anatomía de CodePreview",
    "codePreview.anatomyPreviewLabel": "CodePreview, parte por parte",
    "codePreview.highlightTitle": "Resaltar en build o SSR",
    "codePreview.mountTitle": "Montar explícitamente",
    "codePreview.mountBody":
      "Los componentes normales se descubren por selector. CodePreview se monta en una segunda llamada deliberada, para que ninguna aplicación cargue un preview de documentación por accidente.",
    "codePreview.highlightComment": "Se ejecuta en build/SSR, nunca en el navegador.",
    "codePreview.mountComment1": "CopyButton y los componentes normales: imports dinámicos por selector.",
    "codePreview.mountComment2": "CodePreview es opt-in y queda fuera del auto-loader.",
    "codePreview.test1": "Cambia densidad, expande, colapsa y monta de forma idempotente.",
    "codePreview.test2": "El botón para revelar más sigue disponible aunque el modo Condensado ya sea largo.",
    "codePreview.test3": "Dice el conteo en el idioma del autor, y solo el número cuando no hay uno.",
    "codePreview.guidelinesLede": "Un bloque de código se lee mejor cuando dice qué es y muestra solo lo necesario.",
  },
  en: {
    "demo.codePreview.genericLabel": "Code",

    "codePreview.description": "Shows code to read and copy, highlighted and labelled.",

    "codePreview.a11yKeyEnter": "Activates the focused control.",

    "codePreview.a11yKeyTab": "Moves through the copy button, the density switch and the expand button.",

    "codePreview.a11yYours2": "Do not put in the preview something that only makes sense with the rest: people may never expand it.",

    "codePreview.a11yYours1": "Translate <code>moreLabel</code> and <code>lessLabel</code>: they are the button's names.",

    "codePreview.a11yDoes2": "Highlighting uses colors with contrast in light and dark modes.",

    "codePreview.a11yDoes1": "The expand button announces whether the block is open (<code>aria-expanded</code>).",

    "codePreview.a11yIntro": "The code is selectable text; the controls are native buttons.",

    "codePreview.content3": "Write code comments in the page's language.",

    "codePreview.content2": "Show only what the example needs; link to the full file.",

    "codePreview.content1": "Put the file, the language or the terminal in the label: “button.tsx”, “terminal”.",

    "codePreview.dd.label.dont": "“Code” says nothing the block does not already say.",

    "codePreview.dd.label.do": "“example.ts” says the file and the note says the language.",

    "codePreview.dd.label.title": "Label: say what it is",


    "codePreview.whenNot2": 'If all that matters is copying it: use <a href="/components/clipboard">CopyButton</a> with no block around it.',

    "codePreview.whenNot1": 'For code inside a sentence: use <code>Code</code> in the <a href="/components/text">text</a>.',

    "codePreview.when3": "For the same piece in a short and a full version: use <code>CodePreview.density</code>.",

    "codePreview.when2": "For a long block that would push the rest of the page away: with a preview that expands.",

    "codePreview.when1": "To show code that should read as code: highlighted, with its label.",

    "codePreview.contract3": "Highlighting does not run in the browser: it arrives as HTML.",

    "codePreview.contract2": "<code>initComponents()</code> does not mount it: <code>mountCodePreview()</code> is a separate call, so no application loads this enhancer by accident.",

    "codePreview.contract1": "<code>components/code-preview.css</code> reads the <code>--shiki-light</code> and <code>--shiki-dark</code> variables.",

    "codePreview.exampleBody": "The label says the file, the note the language, and the preview shows three lines.",

    "codePreview.exampleTitle": "A block with a label and a preview",

    "codePreview.prop.collapsible.true": "Use <code>true</code> when showing the whole block pushes the rest of the page out of view.",

    "codePreview.prop.collapsible.false": "Use <code>false</code> for short blocks, read whole.",

    "codePreview.prop.collapsible.body": "Sets whether a long block shows a few lines and a button to see it all.",

    "codePreview.prop.collapsible.title": "Collapsible: whole or a preview",
    "codePreview.lede": "CodePreview shows code to read and copy: highlighted, with a label that says what it is and, when it is long, a preview that expands. Shiki highlights at build or SSR; the browser only mounts the controls.",
    "demo.codePreview.label": "example.ts",
    "demo.codePreview.note": "TypeScript",
    "demo.codePreview.condensed": 'const registrations = [\n  { selector: "[data-sk-button]" },\n];',
    "demo.codePreview.full":
      'const registrations = [\n  { selector: "[data-sk-button]", load: () => import("./button.js") },\n  { selector: "[data-sk-select]", load: () => import("./select.js") },\n];',
    "codePreview.anatomyBody": "The label, the note, the density switch, the preview, the viewport and the expand button.",
    "codePreview.anatomyLabel": "CodePreview anatomy",
    "codePreview.anatomyPreviewLabel": "CodePreview, part by part",
    "codePreview.highlightTitle": "Highlighting at build or SSR time",
    "codePreview.mountTitle": "Mounting explicitly",
    "codePreview.mountBody":
      "Regular components are discovered by selector. CodePreview mounts on a second, deliberate call, so that no application loads a documentation preview by accident.",
    "codePreview.highlightComment": "Runs at build/SSR time, never in the browser.",
    "codePreview.mountComment1": "CopyButton and regular components: dynamic imports by selector.",
    "codePreview.mountComment2": "CodePreview is opt-in and stays outside the auto-loader.",
    "codePreview.test1": "Switches density, expands, collapses and mounts idempotently.",
    "codePreview.test2": "Keeps the disclosure control available even when Condensed itself is long.",
    "codePreview.test3": "Says the count in the author's language, and just the number when there is none.",
    "codePreview.guidelinesLede": "A code block reads best when it says what it is and shows only what is needed.",
  },
} as const;
