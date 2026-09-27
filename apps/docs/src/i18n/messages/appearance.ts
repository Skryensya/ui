/*
 * The Appearance foundation page. One component (`AppearancePage.astro`) read in both locales, the
 * same pattern the component pages use, so the two languages cannot drift apart.
 */
export const appearanceMessages = {
  es: {
    "appearancePage.title": "Apariencia",
    "appearancePage.description":
      "Un eje compartido que dice cómo se expresa físicamente una superficie: plain, tactile, brutalist o frosted.",
    "appearancePage.lede":
      "<code>appearance</code> dice <strong>cómo se expresa físicamente</strong> un control o una superficie, y nada más: no cambia qué significa, qué tan fuerte es, su tamaño, su radio ni su densidad. Es un solo eje, con los mismos valores y el mismo significado en cada componente que lo publica, así que una página que elige una apariencia la elige para todos.",

    "appearancePage.specimenTitle": "El mismo ejemplo, cuatro expresiones",
    "appearancePage.specimenBody":
      "Un botón, una tarjeta, una elección y un grupo de secciones. Cambia la apariencia con el selector: cada pieza la aplica a su manera, pero es la misma decisión.",
    "appearancePage.specimenLabel": "Button, Tile y Accordion con la apariencia de la página",
    "appearancePage.backdropBody":
      "<code>frosted</code> difumina lo que hay detrás, así que necesita algo detrás. Este es el mismo ejemplo sobre un degradado hecho con tokens; también sigue el selector.",
    "appearancePage.backdropLabel": "El mismo ejemplo sobre un fondo",

    "appearancePage.valuesTitle": "Los cuatro valores",
    "appearancePage.headValue": "Valor",
    "appearancePage.headWhat": "Qué es",
    "appearancePage.headMotion": "Qué se mueve",
    "appearancePage.plainWhat": "La pintura base del componente. Es el valor por defecto.",
    "appearancePage.plainMotion": "Lo que el componente ya hacía (el state layer, y la compresión de Button).",
    "appearancePage.tactileWhat": "Profundidad física: un canto debajo de la cara, y una cara con luz arriba y sombra abajo.",
    "appearancePage.tactileMotion": "La cara se hunde hacia el canto al pasar el puntero y casi del todo al presionar.",
    "appearancePage.brutalistWhat": "Un borde negro y una sombra dura desplazada, sin desenfoque.",
    "appearancePage.brutalistMotion": "La sombra crece un píxel al pasar el puntero; al presionar, la cara viaja hacia ella y su borde lejano queda quieto.",
    "appearancePage.frostedWhat": "Material translúcido que difumina y satura lo que hay detrás, con un borde fino y un brillo arriba.",
    "appearancePage.frostedMotion": "Nada viaja: la lámina se vuelve un poco más densa al pasar el puntero y al presionar.",

    "appearancePage.rulesTitle": "Las reglas que comparten",
    "appearancePage.ruleIndependent":
      "<strong>Es independiente de los demás ejes.</strong> <code>variant</code>, <code>tone</code>, <code>size</code>, el radio y la densidad no cambian. Nunca se escribe como un valor compuesto (<code>brutalist-danger</code>): cada eje se elige por separado.",
    "appearancePage.ruleSurface":
      "<strong>Va en la superficie que se expresa.</strong> En Accordion va en la raíz, porque el marco es la superficie; en TileRadioGroup se pone en el grupo y se pinta en cada opción; en DetailsGroup, en su marco.",
    "appearancePage.ruleNoTravel":
      "<strong>Solo el control viaja.</strong> Un ExpandableTile, el marco de un Accordion o un Folder llevan la apariencia sin moverse: su control es el trigger que tienen adentro.",
    "appearancePage.ruleSelection":
      "<strong>La selección no es presión.</strong> Un toggle encendido o un tile seleccionado conservan su profundidad de reposo y se distinguen por la pintura; al presionarlos otra vez, vuelven a viajar.",
    "appearancePage.ruleBlack":
      "<strong>Brutalist dibuja con negro en ambos modos.</strong> Es el color de sombra del sistema a opacidad total: una sombra es oscura sea cual sea la página. El borde conserva el grosor de plain, así que cambiar de apariencia nunca cambia el tamaño.",
    "appearancePage.ruleFrosted":
      "<strong>Frosted parte de una base opaca.</strong> La lámina translúcida solo aparece donde hay <code>backdrop-filter</code> y nadie pidió menos transparencia; con alto contraste vuelve a la superficie opaca. Ver <a href=\"/es/transparencias\">Transparencia</a>.",
    "appearancePage.ruleReveal":
      "<strong>Folder solo la muestra revelado.</strong> En reposo un folder es del color de su fondo, y una apariencia visible ahí lo delataría.",
    "appearancePage.ruleDisabled":
      "<strong>Deshabilitado manda.</strong> La construcción se encoge y se apaga, pero sigue reconocible; un control deshabilitado nunca parece presionable.",
    "appearancePage.ruleForced":
      "<strong>En forced colors, todas vuelven a la superficie del sistema.</strong> Las sombras y el desenfoque desaparecen; foco, selección y deshabilitado se siguen leyendo.",

    "appearancePage.supportTitle": "Qué componentes la publican",
    "appearancePage.supportBody":
      "Esta tabla se lee de los contratos al construir la página, así que siempre dice lo que el sistema publica hoy. Un valor que falta es una decisión de ese componente, no un olvido: su página explica por qué.",
    "appearancePage.headComponent": "Componente",
    "appearancePage.headValues": "Valores",
    "appearancePage.headSignatures": "Firmas",
    "appearancePage.yes": "Sí",
    "appearancePage.no": "No",

    "appearancePage.useTitle": "Cómo se usa",
    "appearancePage.useBody":
      "Es una opción del contrato, así que se escribe igual que las demás: un atributo <code>data-appearance</code> en el HTML y una prop <code>appearance</code> en React. Sin valor, es <code>plain</code>.",

    "appearancePage.hooksTitle": "Hooks",
    "appearancePage.hooksBody":
      "Cada componente publica las magnitudes y las tintas de sus construcciones con el mismo patrón de nombres, así que un ajuste se escribe igual en todos. La lista exacta de cada uno está en su pestaña Style hooks.",

    "appearancePage.demo.save": "Guardar",
    "appearancePage.demo.preview": "Vista previa",
    "appearancePage.demo.cancel": "Cancelar",
    "appearancePage.demo.exportTitle": "Exportar",
    "appearancePage.demo.exportBody": "Descargar el informe actual.",
    "appearancePage.demo.alertsTitle": "Alertas críticas",
    "appearancePage.demo.alertsBody": "Avisar cuando falle un despliegue.",
    "appearancePage.demo.runtimeTitle": "Runtime",
    "appearancePage.demo.runtimeDescription": "Versión y región",
    "appearancePage.demo.runtimeBody": "Node 24 en el pool compartido de Frankfurt.",
    "appearancePage.demo.rolloutTitle": "Rollout",
    "appearancePage.demo.rolloutDescription": "Canary por porcentaje",
    "appearancePage.demo.rolloutBody": "10% del tráfico durante una hora, después 100%.",
  },
  en: {
    "appearancePage.title": "Appearance",
    "appearancePage.description":
      "One shared axis for how a surface is physically expressed: plain, tactile, brutalist or frosted.",
    "appearancePage.lede":
      "<code>appearance</code> says <strong>how a control or a surface is physically expressed</strong>, and nothing else: not what it means, how loud it is, its size, its radius or its density. It is one axis, with the same values and the same meaning on every component that publishes it, so a page that chooses an appearance chooses it for all of them.",

    "appearancePage.specimenTitle": "One example, four expressions",
    "appearancePage.specimenBody":
      "A button, a card, a choice and a group of sections. Change the appearance with the switch: each piece applies it in its own way, but it is the same decision.",
    "appearancePage.specimenLabel": "Button, Tile and Accordion in the page's appearance",
    "appearancePage.backdropBody":
      "<code>frosted</code> blurs what is behind it, so it needs something behind it. This is the same example on a gradient built from tokens; it follows the switch too.",
    "appearancePage.backdropLabel": "The same example over a backdrop",

    "appearancePage.valuesTitle": "The four values",
    "appearancePage.headValue": "Value",
    "appearancePage.headWhat": "What it is",
    "appearancePage.headMotion": "What moves",
    "appearancePage.plainWhat": "The component's baseline paint. It is the default.",
    "appearancePage.plainMotion": "Whatever the component already did (the state layer, and Button's squeeze).",
    "appearancePage.tactileWhat": "Physical depth: a ledge under the face, and a face lit at the top and shaded at the bottom.",
    "appearancePage.tactileMotion": "The face sinks toward the ledge on hover, and almost all the way when pressed.",
    "appearancePage.brutalistWhat": "A black edge and a hard offset shadow, with no blur.",
    "appearancePage.brutalistMotion": "The shadow grows a pixel on hover; when pressed, the face travels into it and its far edge stays put.",
    "appearancePage.frostedWhat": "Translucent material that blurs and saturates what is behind it, with a fine edge and a lit rim.",
    "appearancePage.frostedMotion": "Nothing travels: the sheet gets a little denser on hover and when pressed.",

    "appearancePage.rulesTitle": "The rules they share",
    "appearancePage.ruleIndependent":
      "<strong>It is independent of the other axes.</strong> <code>variant</code>, <code>tone</code>, <code>size</code>, radius and density do not change. It is never written as a compound value (<code>brutalist-danger</code>): each axis is chosen on its own.",
    "appearancePage.ruleSurface":
      "<strong>It goes on the surface being expressed.</strong> On Accordion it goes on the root, because the frame is the surface; on TileRadioGroup it is set on the group and painted on each option; on DetailsGroup, on its frame.",
    "appearancePage.ruleNoTravel":
      "<strong>Only a control travels.</strong> An ExpandableTile, an Accordion's frame or a Folder wear the appearance without moving: their control is the trigger inside them.",
    "appearancePage.ruleSelection":
      "<strong>Selection is not press.</strong> A toggle that is on, or a selected tile, keeps its rest depth and is told apart by its paint; pressed again, it travels again.",
    "appearancePage.ruleBlack":
      "<strong>Brutalist draws in black in both modes.</strong> It is the system's shadow colour at full opacity: a shadow is dark whatever the page is. The edge keeps plain's width, so switching appearance never changes a size.",
    "appearancePage.ruleFrosted":
      "<strong>Frosted starts from an opaque baseline.</strong> The see-through sheet only appears where <code>backdrop-filter</code> exists and nobody asked for less transparency; under high contrast it returns to the opaque surface. See <a href=\"/transparency\">Transparency</a>.",
    "appearancePage.ruleReveal":
      "<strong>Folder shows it only when revealed.</strong> At rest a folder is the colour of its ground, and a visible appearance there would give it away.",
    "appearancePage.ruleDisabled":
      "<strong>Disabled outranks appearance.</strong> The construction shrinks and fades but stays recognisable; a disabled control never looks pressable.",
    "appearancePage.ruleForced":
      "<strong>Under forced colors, every appearance returns to the system surface.</strong> Shadows and blur go away; focus, selection and disabled still read.",

    "appearancePage.supportTitle": "Which components publish it",
    "appearancePage.supportBody":
      "This table is read from the contracts when the page is built, so it always says what the system publishes today. A missing value is that component's decision, not an oversight: its page says why.",
    "appearancePage.headComponent": "Component",
    "appearancePage.headValues": "Values",
    "appearancePage.headSignatures": "Signatures",
    "appearancePage.yes": "Yes",
    "appearancePage.no": "No",

    "appearancePage.useTitle": "How to use it",
    "appearancePage.useBody":
      "It is a contract option, so it is written like any other: a <code>data-appearance</code> attribute in HTML and an <code>appearance</code> prop in React. With no value, it is <code>plain</code>.",

    "appearancePage.hooksTitle": "Hooks",
    "appearancePage.hooksBody":
      "Every component publishes the magnitudes and inks of its constructions under the same naming pattern, so a retune is written the same way on all of them. Each one's exact list is in its Style hooks tab.",

    "appearancePage.demo.save": "Save",
    "appearancePage.demo.preview": "Preview",
    "appearancePage.demo.cancel": "Cancel",
    "appearancePage.demo.exportTitle": "Export",
    "appearancePage.demo.exportBody": "Download the current report.",
    "appearancePage.demo.alertsTitle": "Critical alerts",
    "appearancePage.demo.alertsBody": "Notify me when a deployment fails.",
    "appearancePage.demo.runtimeTitle": "Runtime",
    "appearancePage.demo.runtimeDescription": "Version and region",
    "appearancePage.demo.runtimeBody": "Node 24 on the Frankfurt shared pool.",
    "appearancePage.demo.rolloutTitle": "Rollout",
    "appearancePage.demo.rolloutDescription": "Canary by percentage",
    "appearancePage.demo.rolloutBody": "10% of traffic for an hour, then 100%.",
  },
} as const;
