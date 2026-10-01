export const stickerMessages = {
  es: {
    "demo.sticker.groupLabel": "Tres stickers, uno por estado",
    "demo.sticker.starAlt": "Estrella dorada",
    "demo.sticker.bubbleAlt": "Globo de diálogo morado",
    "demo.sticker.statesLabel": "Los tres estados de Sticker",
    "demo.sticker.originsLabel": "Las cuatro esquinas desde las que se despega",
    "demo.sticker.hooksLabel": "Sticker ajustado con styling hooks",
    "demo.sticker.hooksDefault": "por defecto",
    "demo.sticker.hooksThick": "borde ancho y de color",
    "demo.sticker.hooksDeep": "despegue profundo",
    "demo.sticker.peel": "Despegar",
    "demo.sticker.apply": "Pegar",
    "demo.sticker.reset": "Soltar",

    "sticker.description": "Convierte una ilustración en una calcomanía troquelada que se despega y se pega.",

    "sticker.a11yYours2": "Si se gana con una acción, anuncia el logro con una región viva.",

    "sticker.a11yYours1": "Si el estado importa (ganada o no), dilo en texto: el estado no se anuncia.",

    "sticker.a11yDoes2": "Con <code>prefers-reduced-motion</code>, no hay recorrido entre estados.",

    "sticker.a11yDoes1": "Con <code>src</code>, exige <code>alt</code>.",

    "sticker.a11yIntro": "Sticker es una imagen con su borde; el estado es visual.",

    "sticker.content2": 'Usa <code>alt=""</code> si es decoración.',

    "sticker.content1": "Escribe un <code>alt</code> con lo que la insignia significa: «Insignia: primer proyecto publicado».",

    "sticker.whenNot3": "Para llamar la atención con movimiento: la calcomanía no es un efecto.",

    "sticker.whenNot2": 'Para una etiqueta de estado: usa <a href="/es/componentes/badge">Badge</a>.',

    "sticker.whenNot1": 'Para recortar una imagen a una proporción: usa <a href="/es/componentes/image-frame">ImageFrame</a>.',

    "sticker.when2": "Cuando conviene que se vea si está puesta o no.",

    "sticker.when1": "Para una insignia ganada, una marca puesta, un logro.",

    "sticker.contract3": "Con <code>prefers-reduced-motion</code>, el cambio de estado es inmediato.",

    "sticker.contract2": "No cambia de estado solo ni al hacer clic.",

    "sticker.contract1": "El borde sigue el canal alfa del arte: los píxeles transparentes quedan fuera.",

    "sticker.setBody": "Cada ilustración con su borde troquelado y una inclinación propia.",

    "sticker.setTitle": "Una colección: varias insignias",
    "sticker.lede": "Sticker convierte una ilustración en una calcomanía troquelada: una insignia ganada, una marca puesta sobre algo. El borde blanco sigue la silueta del arte, y la calcomanía puede estar suelta, despegándose o pegada. El estado lo decide tu producto.",
    "sticker.anatomyBody":
      "Tres partes. La raíz no pinta nada: da espacio al borde y sostiene la inclinación. <code>sk-sticker__art</code> es el arte con su borde y su sombra, y aparece dos veces: la segunda, dentro de <code>sk-sticker__flap</code>, es la esquina que se levanta al despegar, oculta para las tecnologías de asistencia. El diagrama está congelado y despegado para que la solapa tenga algo adentro.",
    "sticker.anatomyLabel": "Anatomía de Sticker",
    "sticker.anatomyPreviewLabel": "Sticker, parte por parte",
    "sticker.placementHeading": "Colocar: el producto cambia el estado",
    "sticker.placementIntro": "Al ganar la insignia, el producto escribe <code>applied</code> y la calcomanía se pega con un rebote corto.",
    "sticker.originsHeading": "Esquina: desde dónde se despega",
    "sticker.originsIntro": "<code>peelOrigin</code> elige la esquina que se levanta, en términos lógicos: en una página de derecha a izquierda se invierte sola.",
    "sticker.hooksHeading": "A medida: borde, doblez e inclinación",
    "sticker.hooksIntro": "<code>--sk-sticker-edge-width</code> y <code>--sk-sticker-edge-color</code> ajustan el borde; <code>--sk-sticker-peel-size</code>, cuánto se dobla.",
    "sticker.reactTitle": "En React: src o hijos",
    "sticker.reactBody": "El arte entra por <code>src</code>, que exige <code>alt</code>, o como hijos; nunca los dos.",
    "sticker.vanillaTitle": "En HTML: data-state",
    "sticker.vanillaBody": "No hay enhancer: para cambiar de estado, escribe <code>data-state</code>.",
    "sticker.prop.state.title": "State: suelta, despegándose o pegada",
    "sticker.prop.state.body": "En qué momento está la calcomanía. Aquí cambia la primera.",
    "sticker.prop.state.idle": "Usa <code>idle</code>, el valor por defecto, para una calcomanía suelta, un poco sobre la página.",
    "sticker.prop.state.peeled": "Usa <code>peeled</code> para una esquina levantada: todavía no se pegó.",
    "sticker.prop.state.applied": "Usa <code>applied</code> para una calcomanía pegada, plana sobre la superficie.",
    "sticker.guidelinesLede": "Una calcomanía se lee como un objeto que se gana o se pone: úsala para eso.",
  },
  en: {
    "demo.sticker.groupLabel": "Three stickers, one per state",
    "demo.sticker.starAlt": "Golden star",
    "demo.sticker.bubbleAlt": "Purple speech bubble",
    "demo.sticker.statesLabel": "Sticker's three states",
    "demo.sticker.originsLabel": "The four corners it can peel from",
    "demo.sticker.hooksLabel": "Sticker tuned with styling hooks",
    "demo.sticker.hooksDefault": "default",
    "demo.sticker.hooksThick": "wide, coloured edge",
    "demo.sticker.hooksDeep": "deep peel",
    "demo.sticker.peel": "Peel",
    "demo.sticker.apply": "Apply",
    "demo.sticker.reset": "Release",

    "sticker.description": "Turns an illustration into a die-cut sticker that peels and sticks.",

    "sticker.a11yYours2": "If it is earned through an action, announce the achievement with a live region.",

    "sticker.a11yYours1": "If the state matters (earned or not), say it in text: the state is not announced.",

    "sticker.a11yDoes2": "With <code>prefers-reduced-motion</code>, there is no transition between states.",

    "sticker.a11yDoes1": "With <code>src</code>, it requires <code>alt</code>.",

    "sticker.a11yIntro": "Sticker is an image with its edge; the state is visual.",

    "sticker.content2": 'Use <code>alt=""</code> if it is decoration.',

    "sticker.content1": "Write an <code>alt</code> with what the badge means: “Badge: first project published”.",

    "sticker.whenNot3": "To draw attention with motion: the sticker is not an effect.",

    "sticker.whenNot2": 'For a status label: use <a href="/components/badge">Badge</a>.',

    "sticker.whenNot1": 'To crop an image to a ratio: use <a href="/components/image-frame">ImageFrame</a>.',

    "sticker.when2": "When it helps to see whether it is placed or not.",

    "sticker.when1": "For an earned badge, a placed mark, an achievement.",

    "sticker.contract3": "With <code>prefers-reduced-motion</code>, a state change is immediate.",

    "sticker.contract2": "It does not change state by itself or on click.",

    "sticker.contract1": "The edge follows the art's alpha channel: transparent pixels stay out.",

    "sticker.setBody": "Each illustration with its die-cut edge and its own tilt.",

    "sticker.setTitle": "A collection: several badges",
    "sticker.lede": "Sticker turns an illustration into a die-cut sticker: an earned badge, a mark placed on something. The white edge follows the art's silhouette, and the sticker can be loose, peeling or applied. Your product decides the state.",
    "sticker.anatomyBody":
      "Three parts. The root paints nothing: it makes room for the edge and carries the tilt. <code>sk-sticker__art</code> is the artwork with its edge and shadow, and it appears twice: the second copy, inside <code>sk-sticker__flap</code>, is the corner that lifts when it peels, hidden from assistive tech. The diagram is frozen and peeled so the flap has something in it.",
    "sticker.anatomyLabel": "Sticker anatomy",
    "sticker.anatomyPreviewLabel": "Sticker, part by part",
    "sticker.placementHeading": "Placing: the product changes the state",
    "sticker.placementIntro": "On earning the badge, the product writes <code>applied</code> and the sticker sticks with a short bounce.",
    "sticker.originsHeading": "Corner: where it peels from",
    "sticker.originsIntro": "<code>peelOrigin</code> picks the corner that lifts, in logical terms: on a right-to-left page it flips by itself.",
    "sticker.hooksHeading": "Custom: edge, fold and tilt",
    "sticker.hooksIntro": "<code>--sk-sticker-edge-width</code> and <code>--sk-sticker-edge-color</code> set the edge; <code>--sk-sticker-peel-size</code>, how much folds.",
    "sticker.reactTitle": "In React: src or children",
    "sticker.reactBody": "The art comes in through <code>src</code>, which requires <code>alt</code>, or as children; never both.",
    "sticker.vanillaTitle": "In HTML: data-state",
    "sticker.vanillaBody": "There is no enhancer: to change state, write <code>data-state</code>.",
    "sticker.prop.state.title": "State: loose, peeling or applied",
    "sticker.prop.state.body": "What moment the sticker is in. Here the first one changes.",
    "sticker.prop.state.idle": "Use <code>idle</code>, the default, for a loose sticker, slightly above the page.",
    "sticker.prop.state.peeled": "Use <code>peeled</code> for a lifted corner: not yet applied.",
    "sticker.prop.state.applied": "Use <code>applied</code> for an applied sticker, flat on the surface.",
    "sticker.guidelinesLede": "A sticker reads as an object earned or placed: use it for that.",
  },
} as const;
