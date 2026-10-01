export const mediaGradientMessages = {
  es: {
    "mediaGradient.description": "Hace legible el texto que va sobre una foto, con un velo del alto del texto.",
    "mediaGradient.a11yYours2": 'Comprueba el contraste con la foto real, sobre todo con <code>strength="sm"</code>.',
    "mediaGradient.a11yYours1": 'Si la foto dice algo que el texto no, dale un <code>alt</code>; si es decorativa, <code>alt=""</code>.',
    "mediaGradient.a11yDoes2": "El velo asegura el contraste del texto sobre cualquier foto.",
    "mediaGradient.a11yDoes1": 'El velo lleva <code>aria-hidden="true"</code>.',
    "mediaGradient.a11yIntro": "El velo es pintura; el contenido es el texto.",
    "mediaGradient.content2": "Deja la descripción larga fuera de la foto.",
    "mediaGradient.content1": "Escribe un texto corto sobre la foto: un título de 2 a 8 palabras y, si hace falta, una línea.",
    "mediaGradient.whenNot3": 'Para oscurecer la página detrás de un diálogo: eso lo hace <a href="/es/componentes/dialog">Dialog</a>.',
    "mediaGradient.whenNot2": "Para el pie de una foto: usa un <code>&lt;figcaption&gt;</code> fuera del marco.",
    "mediaGradient.whenNot1": 'Si el texto puede ir debajo de la foto: ahí se lee mejor. Usa <a href="/es/componentes/image-frame">ImageFrame</a> con el texto aparte.',
    "mediaGradient.when2": "Cuando el velo tiene que medir lo que mide el texto.",
    "mediaGradient.when1": "Para un título o un titular sobre una foto de portada.",
    "mediaGradient.prop.strength.lg": "Usa <code>lg</code> sobre fotos claras o con mucho detalle.",
    "mediaGradient.prop.strength.md": "Usa <code>md</code>, el valor por defecto, casi siempre.",
    "mediaGradient.prop.strength.sm": "Usa <code>sm</code> sobre fotos oscuras o parejas.",
    "mediaGradient.prop.strength.body": "La opacidad del velo; nunca cuánta foto tapa.",
    "mediaGradient.prop.strength.title": "Strength: cuánto oscurece",
    "mediaGradient.prop.edge.end": "Usa <code>end</code> igual que <code>start</code>, al otro lado.",
    "mediaGradient.prop.edge.start": "Usa <code>start</code> para un texto al costado en una foto ancha.",
    "mediaGradient.prop.edge.top": "Usa <code>top</code> cuando lo importante de la foto está abajo.",
    "mediaGradient.prop.edge.bottom": "Usa <code>bottom</code>, el valor por defecto, para un título de portada.",
    "mediaGradient.prop.edge.body": "El borde de la foto donde va el texto. El velo sigue al texto, no a un porcentaje de la imagen.",
    "mediaGradient.prop.edge.title": "Edge: desde qué borde",
    "mediaGradient.anatomyBody":
      '<a class="sk-link sk-interactive" href="/es/componentes/image-frame">ImageFrame</a> recorta la foto. <code>MediaCaption</code> va dentro y lleva el texto: su caja es la medida. <code>MediaGradient</code> es hijo del caption, así que el wash mide lo que mide el texto y no un porcentaje de la imagen.',
    "mediaGradient.anatomyLabel": "Partes de MediaGradient",
    "mediaGradient.anatomyPreviewLabel": "Anatomía",

    "mediaGradient.lede": 'MediaGradient hace legible el texto que va sobre una foto: el título de una portada, el titular de una tarjeta. Un velo de color, del alto del texto, asegura el contraste sea cual sea la foto. Va dentro de <code>MediaCaption</code>, en el slot <code>caption</code> de un <a href="/es/componentes/image-frame">ImageFrame</a>.',


    "mediaGradient.cardTitle": "Tarjeta con portada: el título sobre la foto",
    "mediaGradient.cardBody": "El título va sobre la foto y el cuerpo, debajo, sobre la superficie de la tarjeta.",



    "mediaGradient.tintTitle": "Tinte: el color del velo",
    "mediaGradient.tintBody": "Sale de <code>--sk-media-gradient-tint</code>, el color de acento por defecto.",


    "demo.mediaGradient.title": "Horizonte costero",
    "demo.mediaGradient.caption": "Tres noches frente al mar, desde $249.",
    "demo.mediaGradient.body": "Incluye desayuno y traslado desde el aeropuerto. Reserva antes del 30 de marzo.",
    "mediaGradient.guidelinesLede": "El texto se lee mejor debajo de la foto; encima, solo cuando es parte de la portada.",
  },
  en: {
    "mediaGradient.description": "Makes text over a photo readable, with a veil as tall as the text.",
    "mediaGradient.a11yYours2": 'Check contrast with the real photo, especially with <code>strength="sm"</code>.',
    "mediaGradient.a11yYours1": 'If the photo says something the text does not, give it an <code>alt</code>; if decorative, <code>alt=""</code>.',
    "mediaGradient.a11yDoes2": "The veil ensures the text's contrast over any photo.",
    "mediaGradient.a11yDoes1": 'The veil carries <code>aria-hidden="true"</code>.',
    "mediaGradient.a11yIntro": "The veil is paint; the content is the text.",
    "mediaGradient.content2": "Keep long descriptions off the photo.",
    "mediaGradient.content1": "Write short text over the photo: a 2 to 8 word title and, if needed, one line.",
    "mediaGradient.whenNot3": 'To dim the page behind a dialog: <a href="/components/dialog">Dialog</a> does that.',
    "mediaGradient.whenNot2": "For a photo caption: use a <code>&lt;figcaption&gt;</code> outside the frame.",
    "mediaGradient.whenNot1": 'If the text can go below the photo: it reads better there. Use <a href="/components/image-frame">ImageFrame</a> with the text apart.',
    "mediaGradient.when2": "When the veil has to measure what the text measures.",
    "mediaGradient.when1": "For a title or headline over a cover photo.",
    "mediaGradient.prop.strength.lg": "Use <code>lg</code> over light or busy photos.",
    "mediaGradient.prop.strength.md": "Use <code>md</code>, the default, almost always.",
    "mediaGradient.prop.strength.sm": "Use <code>sm</code> over dark or even photos.",
    "mediaGradient.prop.strength.body": "The veil's opacity; never how much photo it covers.",
    "mediaGradient.prop.strength.title": "Strength: how much it darkens",
    "mediaGradient.prop.edge.end": "Use <code>end</code> like <code>start</code>, on the other side.",
    "mediaGradient.prop.edge.start": "Use <code>start</code> for side text on a wide photo.",
    "mediaGradient.prop.edge.top": "Use <code>top</code> when what matters in the photo is at the bottom.",
    "mediaGradient.prop.edge.bottom": "Use <code>bottom</code>, the default, for a cover title.",
    "mediaGradient.prop.edge.body": "The photo's edge where the text goes. The veil follows the text, not a percentage of the image.",
    "mediaGradient.prop.edge.title": "Edge: from which side",
    "mediaGradient.anatomyBody":
      '<a class="sk-link sk-interactive" href="/components/image-frame">ImageFrame</a> crops the photo. <code>MediaCaption</code> sits inside it and carries the text: its box is the measure. <code>MediaGradient</code> is the caption\'s child, so the wash measures what the text measures, not a percentage of the image.',
    "mediaGradient.anatomyLabel": "MediaGradient parts",
    "mediaGradient.anatomyPreviewLabel": "Anatomy",

    "mediaGradient.lede": 'MediaGradient makes text over a photo readable: a cover\'s title, a card\'s headline. A color veil, as tall as the text, ensures contrast whatever the photo. It goes inside <code>MediaCaption</code>, in an <a href="/components/image-frame">ImageFrame</a>\'s <code>caption</code> slot.',


    "mediaGradient.cardTitle": "Card with a cover: the title on the photo",
    "mediaGradient.cardBody": "The title goes over the photo and the body below it, on the card's surface.",



    "mediaGradient.tintTitle": "Tint: the veil's color",
    "mediaGradient.tintBody": "It comes from <code>--sk-media-gradient-tint</code>, the accent color by default.",


    "demo.mediaGradient.title": "Coastal horizon",
    "demo.mediaGradient.caption": "Three nights by the sea, from $249.",
    "demo.mediaGradient.body": "Includes breakfast and an airport transfer. Book by March 30.",
    "mediaGradient.guidelinesLede": "Text reads best below the photo; over it, only when it is part of the cover.",
  },
} as const;
