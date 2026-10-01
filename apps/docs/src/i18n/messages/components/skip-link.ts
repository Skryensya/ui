export const skipLinkMessages = {
  es: {
    "skipLink.anatomyLabel": "Anatomía de SkipLink",
    "skipLink.anatomyPreviewLabel": "SkipLink, parte por parte",
    "skipLink.anatomyBody": "Una sola parte, un <code>&lt;a&gt;</code>. Se dibuja como se ve con foco, que es el único momento en que se ve: en reposo está recortado a un píxel.",

    "skipLink.description": "Deja saltar con el teclado lo que se repite al inicio de cada página.",

    "skipLink.key.enter": "Salta al destino y lleva el foco ahí.",

    "skipLink.key.tab": "Desde el principio de la página, muestra el enlace.",

    "skipLink.a11yYours3": "No enlaces a un destino que puede no estar en la página.",

    "skipLink.a11yYours2": 'Pon <code>tabindex="-1"</code> en el destino.',

    "skipLink.a11yYours1": "Ponlo primero en el <code>&lt;body&gt;</code>: lo que esté antes no se puede saltar.",

    "skipLink.a11yDoes2": "Nunca usa <code>display: none</code>: el <kbd>Tab</kbd> siempre lo alcanza.",

    "skipLink.a11yDoes1": "Es un enlace nativo recortado en reposo; al recibir el foco se ve.",

    "skipLink.content2": "Si hay dos, el del contenido va primero.",

    "skipLink.content1": "Nómbralo por el destino: «Ir al contenido», no «Saltar».",

    "skipLink.whenNot2": 'Para volver arriba: usa <a href="/es/componentes/back-to-top">BackToTop</a>.',

    "skipLink.whenNot1": 'Para navegar dentro de una página larga: usa <a href="/es/componentes/toc">Toc</a>.',

    "skipLink.when2": "Un segundo enlace, a la navegación, cuando hay un índice permanente.",

    "skipLink.when1": "En toda página con navegación o encabezado que se repite.",

    "skipLink.contract3": "Al recibir el foco entra al layout, arriba a la izquierda.",

    "skipLink.contract2": "En reposo está recortado, no oculto: sigue en el árbol de accesibilidad y el <kbd>Tab</kbd> lo alcanza.",

    "skipLink.contract1": "Una opción, <code>href</code>, obligatoria.",

    "skipLink.oneBody": "Presiona <kbd>Tab</kbd> dentro de la vista previa: aparece arriba a la izquierda.",

    "skipLink.oneTitle": "Uno: ir al contenido",
    "skipLink.lede": "SkipLink deja saltar con el teclado lo que se repite al inicio de cada página, como la barra y el menú. Es el primer enlace del documento y solo se ve al recibir el foco. Este sitio usa dos: presiona <kbd>Tab</kbd> al principio de la página.",
    "skipLink.demoContentLabel": "Ir al contenido",
    "skipLink.demoNavLabel": "Ir a la navegación",
    "skipLink.severalTitle": "Dos: contenido y navegación",
    "skipLink.severalBody1": "El primero lleva al contenido, que es lo que casi todos vinieron a leer; el segundo, a la navegación. Presiona <kbd>Tab</kbd> dos veces para ver los dos.",
    "skipLink.targetTitle": "El destino: que reciba el foco",
    "skipLink.targetBody1": 'Pon <code>tabindex="-1"</code> en el destino: sin eso, algunos navegadores hacen scroll pero dejan el foco donde estaba, y el siguiente <kbd>Tab</kbd> vuelve al menú.',
    "skipLink.a11yIntro": "SkipLink cumple WCAG 2.2, 2.4.1 (Evitar bloques), nivel A.",
    "skipLink.test1":
      "Es un <code>&lt;a&gt;</code> con href, no un botón con onClick: el salto, el foco y el botón Atrás son de la plataforma.",
    "skipLink.test2":
      "En reposo sigue en el árbol de accesibilidad: si estuviera con display none, este test no lo encontraría, y el Tab tampoco.",
    "skipLink.test3":
      "El destino recibe su requisito como valor (<code>skipLinkTarget</code>), y el href apunta al id que lo lleva.",
    "skipLink.guidelinesLede": "Un salto al contenido ahorra decenas de <kbd>Tab</kbd> en cada página.",
  },
  en: {
    "skipLink.anatomyLabel": "SkipLink anatomy",
    "skipLink.anatomyPreviewLabel": "SkipLink, part by part",
    "skipLink.anatomyBody": "One part, an <code>&lt;a&gt;</code>. It is drawn as it looks when focused, which is the only time it is visible: at rest it is clipped to one pixel.",

    "skipLink.description": "Lets the keyboard skip what repeats at the start of every page.",

    "skipLink.key.enter": "Jumps to the target and moves focus there.",

    "skipLink.key.tab": "From the start of the page, shows the link.",

    "skipLink.a11yYours3": "Do not link to a target that may be missing from the page.",

    "skipLink.a11yYours2": 'Put <code>tabindex="-1"</code> on the target.',

    "skipLink.a11yYours1": "Put it first in the <code>&lt;body&gt;</code>: anything before it cannot be skipped.",

    "skipLink.a11yDoes2": "It never uses <code>display: none</code>: <kbd>Tab</kbd> always reaches it.",

    "skipLink.a11yDoes1": "It is a native link clipped at rest; it shows on focus.",

    "skipLink.content2": "If there are two, the content one goes first.",

    "skipLink.content1": "Name it by the destination: “Skip to content”, not “Skip”.",

    "skipLink.whenNot2": 'To go back up: use <a href="/components/back-to-top">BackToTop</a>.',

    "skipLink.whenNot1": 'To navigate within a long page: use <a href="/components/toc">Toc</a>.',

    "skipLink.when2": "A second link, to navigation, when there is a permanent index.",

    "skipLink.when1": "On every page with navigation or a header that repeats.",

    "skipLink.contract3": "On focus it enters the layout, at the top left.",

    "skipLink.contract2": "At rest it is clipped, not hidden: it stays in the accessibility tree and <kbd>Tab</kbd> reaches it.",

    "skipLink.contract1": "One option, <code>href</code>, required.",

    "skipLink.oneBody": "Press <kbd>Tab</kbd> inside the preview: it appears at the top left.",

    "skipLink.oneTitle": "One: skip to content",
    "skipLink.lede": "SkipLink lets the keyboard skip what repeats at the start of every page, like the bar and the menu. It is the document's first link and shows only when it takes focus. This site uses two: press <kbd>Tab</kbd> at the start of the page.",
    "skipLink.demoContentLabel": "Go to content",
    "skipLink.demoNavLabel": "Go to navigation",
    "skipLink.severalTitle": "Two: content and navigation",
    "skipLink.severalBody1": "The first leads to the content, which is what almost everyone came to read; the second, to navigation. Press <kbd>Tab</kbd> twice to see both.",
    "skipLink.targetTitle": "The target: it must take focus",
    "skipLink.targetBody1": 'Put <code>tabindex="-1"</code> on the target: without it, some browsers scroll but leave focus where it was, and the next <kbd>Tab</kbd> returns to the menu.',
    "skipLink.a11yIntro": "SkipLink meets WCAG 2.2, 2.4.1 (Bypass Blocks), level A.",
    "skipLink.test1":
      "It is an <code>&lt;a&gt;</code> with an href, not a button with onClick: the jump, the focus move and the Back button are the platform's.",
    "skipLink.test2":
      "At rest it is still in the accessibility tree: with display none this test would not find it, and neither would Tab.",
    "skipLink.test3":
      "The destination receives its own requirement as a value (<code>skipLinkTarget</code>), and the href points at the id that carries it.",
    "skipLink.guidelinesLede": "A skip to content saves dozens of <kbd>Tab</kbd> presses on every page.",
  },
} as const;
