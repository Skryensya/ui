export const linkMessages = {
  es: {
    "demo.link.dontAfter": ".",
    "demo.link.dontLink": "aquí",
    "demo.link.dontBefore": "Para ver los precios de cada plan, haz clic ",
    "demo.link.doAfter": " antes de elegir.",
    "demo.link.doLink": "precios de cada plan",
    "demo.link.doBefore": "Revisa los ",
    "linkPage.anatomyLabel": "Anatomía de Link",
    "linkPage.anatomyPreviewLabel": "Link, parte por parte",
    "linkPage.anatomyBody": "Una sola parte, y solo tiene sentido dentro de una frase: el párrafo es <code>sk-text</code>, el enlace dentro de él es <code>sk-link</code>.",
    "demo.link.before": "Un párrafo con un ",
    "demo.link.neutral": "enlace del color del texto",
    "demo.link.middle": " y otro ",
    "demo.link.accent": "de color acento",
    "demo.link.after": ", los dos con subrayado permanente.",
    "demo.link.targetBefore": "Lee la ",
    "demo.link.targetLink": "guía de migración",
    "demo.link.targetAfter": " antes de actualizar.",
    "demo.link.wholeSentence": "Lee la guía de migración antes de actualizar.",
    "demo.link.externalReport": "Informe anual",
    "demo.link.newTab": "Se abre en otra pestaña",
    "demo.link.saveChanges": "Guardar cambios",

    "linkPage.description": "Lleva a otra página desde dentro de un texto, siempre subrayado.",

    "linkPage.a11yKeyEnter": "Sigue el enlace.",

    "linkPage.a11yYours2": "El texto debe tener sentido fuera de su frase.",

    "linkPage.a11yYours1": "Debe tener un <code>href</code> real; sin él, no es un enlace.",

    "linkPage.a11yDoes2": "El subrayado permanente cumple WCAG 2.2, 1.4.1: el enlace no depende del color.",

    "linkPage.a11yDoes1": "Renderiza un <code>&lt;a href&gt;</code> que se anuncia como enlace.",

    "linkPage.a11yIntro": "Link es un enlace nativo: rol, foco y teclado vienen del navegador.",

    "linkPage.content3": "No enlaces una oración entera: enlaza las palabras que nombran el destino.",

    "linkPage.content2": "Si abre en otra pestaña, dilo: «(se abre en otra pestaña)» o un ícono con nombre.",

    "linkPage.content1": "Escribe el texto del enlace con el destino: «precios del plan», no «aquí» ni «más información».",

    "linkPage.whenNot4": 'Para la navegación de un sitio: usa <a href="/es/componentes/navbar">Navbar</a> o <a href="/es/nav-list">NavList</a>.',

    "linkPage.whenNot3": 'Para una tarjeta entera que lleva a un lugar: usa <a href="/es/componentes/tile">TileLink</a>.',

    "linkPage.whenNot2": "Para un enlace que debe verse como botón: usa <code>Button.navigation</code>.",

    "linkPage.whenNot1": 'Para una acción que cambia algo en la página: usa <a href="/es/componentes/button">Button</a>.',

    "linkPage.when2": "Para una acción secundaria dentro de un párrafo que en realidad navega.",

    "linkPage.when1": "Para llevar a otra página desde dentro de un texto.",

    "linkPage.contract4": "Los enlaces de navegación (un menú, un breadcrumb) se distinguen por su lugar, no por el subrayado: son otros componentes.",

    "linkPage.contract3": "No pone <code>target</code> ni <code>rel</code>: un enlace externo los recibe de quien lo escribe.",

    "linkPage.contract2": "El subrayado no se puede quitar.",

    "linkPage.contract1": "Renderiza un <code>&lt;a&gt;</code> nativo; <code>href</code> es el destino.",
    "linkPage.lede": "Link lleva a otra página desde dentro de un texto. Es un <code>&lt;a&gt;</code> nativo, siempre subrayado: un enlace en un párrafo no se puede distinguir solo por el color (WCAG 2.2, 1.4.1).",
    "linkPage.tileTitle": "Una superficie entera: TileLink",
    "linkPage.tileBody1": "Cuando toda una tarjeta lleva a un destino, <code>TileLink</code> es el <code>&lt;a&gt;</code>, con la superficie de Tile.",
    "linkPage.tileBody2": "El HTML escrito a mano funciona sin JavaScript; <code>createTileLink</code> crea el enlace cuando el árbol se genera en el navegador.",
    "linkPage.prop.linkTone.title": "Tone: cuánto destaca",
    "linkPage.prop.linkTone.body": "Cambia el color; el subrayado se queda siempre.",
    "linkPage.prop.linkTone.neutral": "Usa <code>neutral</code>, el valor por defecto, en prosa: el enlace toma el color del texto y el subrayado lo marca.",
    "linkPage.prop.linkTone.accent": "Usa <code>accent</code> cuando el enlace necesita más señal, como un «Ver todos» al pie de una lista.",
    "linkPage.inlineTitle": "En un párrafo: el subrayado lo marca",
    "linkPage.inlineBody": "El subrayado permanente distingue el enlace sin depender del color.",
    "linkPage.guidelinesLede": "Un enlace dice adónde lleva con su propio texto.",
    "linkPage.dd.text.title": "Texto: di adónde lleva",
    "linkPage.dd.text.do": "El texto del enlace nombra el destino: se entiende leído solo, como en una lista de enlaces.",
    "linkPage.dd.text.dont": "«Aquí» no dice adónde lleva, y un lector de pantalla que recorre los enlaces oye «aquí» varias veces.",
    "linkPage.dd.scope.title": "Alcance: solo las palabras destino",
    "linkPage.dd.scope.do": "Enlaza las palabras que nombran la página de destino.",
    "linkPage.dd.scope.dont": "Enlazar toda la oración agranda el objetivo, pero hace menos claro qué parte navega.",
    "linkPage.dd.external.title": "Nueva pestaña: avisa",
    "linkPage.dd.external.do": "Si cambia de pestaña, el texto o un ícono con nombre lo anuncian.",
    "linkPage.dd.external.dont": "Abrir otra pestaña sin aviso sorprende y rompe la expectativa del enlace.",
    "linkPage.dd.action.title": "Acción: no es enlace",
    "linkPage.dd.action.do": "Si cambia algo en esta página, es un botón.",
    "linkPage.dd.action.dont": "Un enlace para guardar promete navegación, no una mutación del estado.",
    "linkPage.dd.underline.title": "Superficie: un enlace de texto no basta",
    "linkPage.dd.underline.do": "Una tarjeta entera que lleva a un lugar es un TileLink: todo el rectángulo es el objetivo.",
    "linkPage.dd.underline.dont": "Un enlace pequeño dentro de una tarjeta que parece presionable obliga a apuntar a una palabra.",
    "linkPage.test1": "Renderiza un enlace nativo con el state layer compartido para hover/press/foco.",
  },
  en: {
    "demo.link.dontAfter": ".",
    "demo.link.dontLink": "here",
    "demo.link.dontBefore": "To see each plan's pricing, click ",
    "demo.link.doAfter": " before choosing.",
    "demo.link.doLink": "each plan's pricing",
    "demo.link.doBefore": "Check ",
    "linkPage.anatomyLabel": "Link anatomy",
    "linkPage.anatomyPreviewLabel": "Link, part by part",
    "linkPage.anatomyBody": "One part, and it only makes sense inside a sentence: the paragraph is <code>sk-text</code>, the anchor inside it is <code>sk-link</code>.",
    "demo.link.before": "A paragraph with a ",
    "demo.link.neutral": "text-coloured link",
    "demo.link.middle": " and another ",
    "demo.link.accent": "accent-coloured one",
    "demo.link.after": ", both with a permanent underline.",
    "demo.link.targetBefore": "Read the ",
    "demo.link.targetLink": "migration guide",
    "demo.link.targetAfter": " before updating.",
    "demo.link.wholeSentence": "Read the migration guide before updating.",
    "demo.link.externalReport": "Annual report",
    "demo.link.newTab": "Opens in a new tab",
    "demo.link.saveChanges": "Save changes",

    "linkPage.description": "Leads to another page from inside text, always underlined.",

    "linkPage.a11yKeyEnter": "Follows the link.",

    "linkPage.a11yYours2": "The text must make sense outside its sentence.",

    "linkPage.a11yYours1": "It must have a real <code>href</code>; without it, it is not a link.",

    "linkPage.a11yDoes2": "The permanent underline meets WCAG 2.2, 1.4.1: the link does not rely on color.",

    "linkPage.a11yDoes1": "It renders an <code>&lt;a href&gt;</code> announced as a link.",

    "linkPage.a11yIntro": "Link is a native link: role, focus and keyboard come from the browser.",

    "linkPage.content3": "Do not link a whole sentence: link the words that name the destination.",

    "linkPage.content2": "If it opens in another tab, say so: “(opens in a new tab)” or a named icon.",

    "linkPage.content1": "Write the link text with the destination: “each plan's pricing”, not “here” or “more information”.",

    "linkPage.whenNot4": 'For a site\'s navigation: use <a href="/components/navbar">Navbar</a> or <a href="/nav-list">NavList</a>.',

    "linkPage.whenNot3": 'For a whole card that leads somewhere: use <a href="/components/tile">TileLink</a>.',

    "linkPage.whenNot2": "For a link that must look like a button: use <code>Button.navigation</code>.",

    "linkPage.whenNot1": 'For an action that changes something on the page: use <a href="/components/button">Button</a>.',

    "linkPage.when2": "For a secondary action inside a paragraph that actually navigates.",

    "linkPage.when1": "To lead to another page from inside text.",

    "linkPage.contract4": "Navigation links (a menu, a breadcrumb) are told apart by their place, not the underline: they are other components.",

    "linkPage.contract3": "It sets no <code>target</code> or <code>rel</code>: an external link gets them from whoever writes it.",

    "linkPage.contract2": "The underline cannot be removed.",

    "linkPage.contract1": "It renders a native <code>&lt;a&gt;</code>; <code>href</code> is the destination.",
    "linkPage.lede": "Link leads to another page from inside text. It is a native <code>&lt;a&gt;</code>, always underlined: a link in a paragraph cannot be told apart by color alone (WCAG 2.2, 1.4.1).",
    "linkPage.tileTitle": "A whole surface: TileLink",
    "linkPage.tileBody1": "When a whole card leads to one destination, <code>TileLink</code> is the <code>&lt;a&gt;</code>, with Tile's surface.",
    "linkPage.tileBody2": "Hand-written HTML works without JavaScript; <code>createTileLink</code> creates the link when the tree is built in the browser.",
    "linkPage.prop.linkTone.title": "Tone: how much it stands out",
    "linkPage.prop.linkTone.body": "Changes the color; the underline always stays.",
    "linkPage.prop.linkTone.neutral": "Use <code>neutral</code>, the default, in prose: the link takes the text's color and the underline marks it.",
    "linkPage.prop.linkTone.accent": "Use <code>accent</code> when the link needs more signal, like a “See all” at the foot of a list.",
    "linkPage.inlineTitle": "In a paragraph: the underline marks it",
    "linkPage.inlineBody": "The permanent underline sets the link apart without relying on color.",
    "linkPage.guidelinesLede": "A link says where it goes with its own text.",
    "linkPage.dd.text.title": "Text: say where it goes",
    "linkPage.dd.text.do": "The link's text names the destination: it makes sense read alone, as in a list of links.",
    "linkPage.dd.text.dont": "“Here” does not say where it goes, and a screen reader moving through links hears “here” several times.",
    "linkPage.dd.scope.title": "Scope: only the destination words",
    "linkPage.dd.scope.do": "Link the words that name the destination page.",
    "linkPage.dd.scope.dont": "Linking the whole sentence makes the target larger, but makes it less clear what navigates.",
    "linkPage.dd.external.title": "New tab: announce it",
    "linkPage.dd.external.do": "If it changes tabs, the text or a named icon says so.",
    "linkPage.dd.external.dont": "Opening another tab without warning surprises people and breaks the link's expectation.",
    "linkPage.dd.action.title": "Action: not a link",
    "linkPage.dd.action.do": "If it changes something on this page, it is a button.",
    "linkPage.dd.action.dont": "A link for saving promises navigation, not a state mutation.",
    "linkPage.dd.underline.title": "Surface: a text link is not enough",
    "linkPage.dd.underline.do": "A whole card that leads somewhere is a TileLink: the entire rectangle is the target.",
    "linkPage.dd.underline.dont": "A small link inside a card that looks pressable makes people aim at a word.",
    "linkPage.test1": "Renders a native link with the shared state layer for hover/press/focus.",
  },
} as const;
