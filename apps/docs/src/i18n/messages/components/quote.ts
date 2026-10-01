export const quoteMessages = {
  es: {
    "demo.quote.main.body":
      "Escribir el componente es la parte fácil. Lo difícil es que quien lo lea después entienda por qué quedó así.",
    "demo.quote.main.attribution": "Camila Rojas,",
    "demo.quote.main.source": "Cuadernos de un sistema de diseño",
    "demo.quote.anonymous.body":
      "El sistema no se defiende solo: se defiende cada vez que alguien decide no hacer una excepción.",
    "demo.quote.pull.body":
      "Un contrato no existe para describir el componente. Existe para que dos implementaciones no puedan discrepar en silencio.",
    "demo.quote.pull.attribution": "CONTEXT.md",
    "demo.quote.testimonial.body":
      "Migramos las seis pantallas del trámite en una tarde y no tuvimos que discutir ni un espaciado.",
    "demo.quote.testimonial.attribution": "Equipo de Postulaciones,",
    "demo.quote.testimonial.source": "Informe de adopción, marzo 2026",

    "quotePage.description": "Muestra palabras de otra persona y dice de quién son y dónde aparecieron.",

    "quotePage.a11yYours2": "Un pull repite una frase que ya está en el texto: el lector de pantalla la lee dos veces. Considera <code>aria-hidden</code> en el pull.",

    "quotePage.a11yYours1": "Si la cita está en otro idioma, ponle <code>lang</code>.",

    "quotePage.a11yDoes2": "La línea del costado es decorativa.",

    "quotePage.a11yDoes1": "<code>&lt;figure&gt;</code> y <code>&lt;figcaption&gt;</code> asocian la atribución a la cita.",

    "quotePage.a11yIntro": "Quote usa los elementos de cita del HTML.",

    "quotePage.content3": "Usa las comillas de tu idioma: «» en español.",

    "quotePage.content2": "Escribe la atribución con nombre y, si ayuda, cargo: «Ana Rojas, directora de producto».",

    "quotePage.content1": "Cita textual; si recortas, marca el corte con «[…]».",

    "quotePage.whenNot3": 'Para código o salida de consola: usa <a href="/es/componentes/code-preview">CodePreview</a>.',

    "quotePage.whenNot2": 'Para un aviso de la interfaz: usa <a href="/es/componentes/callout">Callout</a>.',

    "quotePage.whenNot1": "Para una frase corta dentro de una oración: usa el <code>&lt;q&gt;</code> nativo.",

    "quotePage.when2": 'Para destacar una frase del artículo, con <code>variant="pull"</code>.',

    "quotePage.when1": "Para palabras de otro: una cita, un testimonio, un extracto.",

    "quotePage.contract4": "No necesita JavaScript.",

    "quotePage.contract3": "No agrega comillas: las escribe quien cita, con las de su idioma.",

    "quotePage.contract2": "El atributo <code>cite</code> guarda la URL de origen; ningún navegador lo muestra.",

    "quotePage.contract1": "La raíz es un <code>&lt;figure&gt;</code>; la cita, un <code>&lt;blockquote&gt;</code>; la atribución, un <code>&lt;figcaption&gt;</code> afuera.",

    "quotePage.citedBody": "<code>attribution</code> es quién lo dijo; <code>source</code>, la obra, que va en un <code>&lt;cite&gt;</code>.",

    "quotePage.citedTitle": "Con fuente: quién y dónde",
    "quotePage.lede": "Quote muestra palabras de otra persona: una cita en un artículo, un testimonio, un extracto. Dice quién lo dijo y en qué obra apareció, fuera de la cita, como pide el HTML.",
    "quotePage.anatomyBody":
      "El diagrama nombra las cuatro partes. Fíjate dónde queda el caption: afuera de la cita, que es lo que esta anatomía existe para hacer bien.",
    "quotePage.anatomyLabel": "Anatomía de Quote",
    "quotePage.anatomyPreviewLabel": "Quote, parte por parte",
    "quotePage.bareTitle": "Sin atribución: solo la cita",
    "quotePage.bareBody": "Sin <code>attribution</code> ni <code>source</code>, no queda un pie vacío bajo la cita.",
    "quotePage.pullTitle": "Pull: una frase levantada del texto",
    "quotePage.pullBody": "Fuera del párrafo, más grande y sin línea: para repetir una frase que ya está en el artículo.",
    "quotePage.testimonialTitle": "Testimonio: en una tarjeta",
    "quotePage.testimonialBody": "La misma cita dentro de un Box, como en una sección de clientes.",
    "demo.quote.dd.long": "Durante años pensamos que el problema era la velocidad, así que medimos cada paso, cada espera y cada clic. Lo que encontramos fue otra cosa: la gente no se iba por lo lento, se iba porque no sabía qué pasaba después.",
    "demo.quote.dd.notice": "Recuerda guardar los cambios antes de salir.",
    "quotePage.prop.variant.title": "Variant: dentro del texto o sola",
    "quotePage.prop.variant.body": "Dice si la cita vive dentro del texto o se lee sola.",
    "quotePage.prop.variant.block": "Usa <code>block</code>, el valor por defecto, para citar dentro de un artículo: lleva una línea al costado.",
    "quotePage.prop.variant.pull": "Usa <code>pull</code> para destacar una frase fuera del texto, más grande y sin la línea.",
    "quotePage.guidelinesLede": "Una cita presenta palabras como de alguien: úsala solo cuando lo son.",
    "quotePage.dd.pull.title": "Pull: una frase corta",
    "quotePage.dd.pull.do": "Destaca una sola frase que se entienda sin el resto.",
    "quotePage.dd.pull.dont": "Un párrafo en tamaño grande deja de destacar y cuesta leerlo.",
    "quotePage.dd.notice.title": "Cita: solo si alguien la dijo",
    "quotePage.dd.notice.do": 'Un aviso de la interfaz va en un <a href="/es/componentes/callout">Callout</a>.',
    "quotePage.dd.notice.dont": "Nadie dijo esa frase: el formato de cita la presenta como si alguien la hubiera dicho.",
  },
  en: {
    "demo.quote.main.body":
      "Writing the component is the easy part. The hard part is the next person reading it and seeing why it ended up like that.",
    "demo.quote.main.attribution": "Camila Rojas,",
    "demo.quote.main.source": "Notebooks on a design system",
    "demo.quote.anonymous.body":
      "A system does not defend itself: it is defended every time somebody decides not to make an exception.",
    "demo.quote.pull.body":
      "A contract does not exist to describe the component. It exists so two implementations cannot disagree in silence.",
    "demo.quote.pull.attribution": "CONTEXT.md",
    "demo.quote.testimonial.body":
      "We migrated the six screens of the form in one afternoon, and never had to argue about a single spacing value.",
    "demo.quote.testimonial.attribution": "Applications team,",
    "demo.quote.testimonial.source": "Adoption report, March 2026",

    "quotePage.description": "Shows another person's words and says whose they are and where they appeared.",

    "quotePage.a11yYours2": "A pull repeats a phrase already in the text: the screen reader reads it twice. Consider <code>aria-hidden</code> on the pull.",

    "quotePage.a11yYours1": "If the quote is in another language, give it <code>lang</code>.",

    "quotePage.a11yDoes2": "The side line is decorative.",

    "quotePage.a11yDoes1": "<code>&lt;figure&gt;</code> and <code>&lt;figcaption&gt;</code> tie the attribution to the quote.",

    "quotePage.a11yIntro": "Quote uses HTML's quotation elements.",

    "quotePage.content3": "Use your language's quotation marks: “” in English.",

    "quotePage.content2": "Write the attribution with a name and, if it helps, a role: “Ana Rojas, head of product”.",

    "quotePage.content1": "Quote verbatim; if you cut, mark it with “[…]”.",

    "quotePage.whenNot3": 'For code or console output: use <a href="/components/code-preview">CodePreview</a>.',

    "quotePage.whenNot2": 'For an interface notice: use <a href="/components/callout">Callout</a>.',

    "quotePage.whenNot1": "For a short phrase within a sentence: use the native <code>&lt;q&gt;</code>.",

    "quotePage.when2": 'To highlight a phrase from the article, with <code>variant="pull"</code>.',

    "quotePage.when1": "For someone else's words: a quotation, a testimonial, an excerpt.",

    "quotePage.contract4": "It needs no JavaScript.",

    "quotePage.contract3": "It adds no quotation marks: the author writes them, with their language's.",

    "quotePage.contract2": "The <code>cite</code> attribute keeps the source URL; no browser shows it.",

    "quotePage.contract1": "The root is a <code>&lt;figure&gt;</code>; the quote a <code>&lt;blockquote&gt;</code>; the attribution a <code>&lt;figcaption&gt;</code> outside it.",

    "quotePage.citedBody": "<code>attribution</code> is who said it; <code>source</code>, the work, which goes in a <code>&lt;cite&gt;</code>.",

    "quotePage.citedTitle": "With a source: who and where",
    "quotePage.lede": "Quote shows another person's words: a quotation in an article, a testimonial, an excerpt. It says who said it and in what work it appeared, outside the quotation, as HTML asks.",
    "quotePage.anatomyBody":
      "The diagram names the four parts. Watch where the caption lands: outside the quotation, which is what this anatomy exists to get right.",
    "quotePage.anatomyLabel": "Quote anatomy",
    "quotePage.anatomyPreviewLabel": "Quote, part by part",
    "quotePage.bareTitle": "No attribution: just the quote",
    "quotePage.bareBody": "Without <code>attribution</code> or <code>source</code>, no empty caption is left under the quote.",
    "quotePage.pullTitle": "Pull: a phrase lifted from the text",
    "quotePage.pullBody": "Outside the paragraph, larger and without the line: to repeat a phrase already in the article.",
    "quotePage.testimonialTitle": "Testimonial: in a card",
    "quotePage.testimonialBody": "The same quote inside a Box, as in a customers section.",
    "demo.quote.dd.long": "For years we thought the problem was speed, so we measured every step, every wait and every click. What we found was something else: people did not leave because it was slow, they left because they did not know what came next.",
    "demo.quote.dd.notice": "Remember to save your changes before leaving.",
    "quotePage.prop.variant.title": "Variant: inside the text or on its own",
    "quotePage.prop.variant.body": "Says whether the quote lives inside the text or reads on its own.",
    "quotePage.prop.variant.block": "Use <code>block</code>, the default, to quote inside an article: it carries a line on the side.",
    "quotePage.prop.variant.pull": "Use <code>pull</code> to lift one sentence out of the text, larger and without the rule.",
    "quotePage.guidelinesLede": "A quote presents words as someone's: use it only when they are.",
    "quotePage.dd.pull.title": "Pull: a short phrase",
    "quotePage.dd.pull.do": "Lift one sentence that makes sense without the rest.",
    "quotePage.dd.pull.dont": "A paragraph set large stops standing out and is hard to read.",
    "quotePage.dd.notice.title": "Quote: only if someone said it",
    "quotePage.dd.notice.do": 'An interface notice goes in a <a href="/components/callout">Callout</a>.',
    "quotePage.dd.notice.dont": "Nobody said that sentence: the quote format presents it as if someone had.",
  },
} as const;
