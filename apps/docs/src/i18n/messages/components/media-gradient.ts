export const mediaGradientMessages = {
  es: {
    "mediaGradient.description": "Un wash del tamaño del texto para que se lea sobre una foto.",
    "mediaGradient.betaBadge": "Beta",
    "mediaGradient.anatomyBody":
      "<a class=\"sk-link sk-interactive\" href=\"/es/componentes/image-frame\">ImageFrame</a> recorta la foto. <code>MediaCaption</code> va dentro y lleva el texto: su caja es la medida. <code>MediaGradient</code> es hijo del caption, así que el wash mide lo que mide el texto y no un porcentaje de la imagen.",
    "mediaGradient.anatomyLabel": "Partes de MediaGradient",
    "mediaGradient.anatomyPreviewLabel": "Anatomía",

    "mediaGradient.lede":
      "Cuando el texto va <strong>sobre una foto</strong>, el token de color del texto no garantiza el contraste: lo garantiza un wash. <code>sk-media-gradient</code> vive <strong>adentro</strong> del caption, así que es tan alto (o tan ancho) como el texto que protege, no un velo sobre toda la imagen. Va teñido con el color de acento.",

    "mediaGradient.whenTitle": "Cuándo usarlo",
    "mediaGradient.whenItem1": "Un título o un titular encima de una imagen de portada",
    "mediaGradient.whenItem2": "Cuando el wash tiene que ser del alto del texto, no de un porcentaje de la imagen",
    "mediaGradient.whenItem3":
      "No cuando el texto puede ir debajo de la imagen: ahí se lee mejor y no necesita wash. No para oscurecer la página detrás de un diálogo (eso es el <code>::backdrop</code> de <a class=\"sk-link sk-interactive\" href=\"/es/componentes/dialog\">Dialog</a>), ni para desvanecer el borde de un área con scroll (eso es <a class=\"sk-link sk-interactive\" href=\"/es/componentes/fade-edge\">FadeEdge</a>)",

    "mediaGradient.cardTitle": "Card con imagen",
    "mediaGradient.cardBody":
      "ImageFrame toma el caption como slot, no como una segunda fuente de imagen. La card sigue siendo <a class=\"sk-link sk-interactive\" href=\"/es/componentes/box\">Box</a> más composición.",
    "mediaGradient.cardPreviewLabel": "Card con MediaGradient",

    "mediaGradient.edgesTitle": "Bordes",
    "mediaGradient.edgesBody":
      "<code>edge</code> en el caption: con <code>top</code> y <code>bottom</code> la banda es tan alta como el texto y ocupa todo el ancho; con <code>start</code> y <code>end</code> es tan ancha como el texto y tan alta como el contenido. El degradado se desvanece hacia la foto desde ese borde.",
    "mediaGradient.edgesPreviewLabel": "Los cuatro bordes",

    "mediaGradient.strengthTitle": "Intensidad",
    "mediaGradient.strengthBody":
      "<code>strength</code> (<code>sm</code>, <code>md</code>, <code>lg</code>) en el wash cambia la opacidad y la mezcla del tinte, nunca cuánta foto queda tapada. En React, <code>&lt;MediaCaption strength&gt;</code> agrega el wash solo.",
    "mediaGradient.strengthPreviewLabel": "Las tres intensidades",

    "mediaGradient.tintTitle": "Tinte",
    "mediaGradient.tintBody":
      "El tinte sale de <code>--sk-media-gradient-tint</code>, que por defecto es <code>--color-action-accent</code>. Para más tinte u opacidad se sobrescriben <code>--sk-media-gradient-mix</code> y <code>--sk-media-gradient-opacity</code>.",

    "mediaGradient.a11yBody":
      "El wash es pintura: lleva <code>aria-hidden=\"true\"</code> y el contenido es el texto del caption. Con <a class=\"sk-link sk-interactive\" href=\"/es/transparencias\"><code>prefers-reduced-transparency</code></a>, el degradado se reemplaza por el color base opaco dentro de la misma caja, así que el contraste queda garantizado sin depender de la foto. Si la imagen solo decora, su <code>alt</code> va vacío; el título ya está en el caption.",

    "demo.mediaGradient.title": "Horizonte costero",
    "demo.mediaGradient.caption": "Texto legible sobre la foto.",
    "demo.mediaGradient.body": "Cuerpo de la card debajo de la imagen.",
  },
  en: {
    "mediaGradient.description": "A wash the size of the text, so it reads over a photo.",
    "mediaGradient.betaBadge": "Beta",
    "mediaGradient.anatomyBody":
      "<a class=\"sk-link sk-interactive\" href=\"/components/image-frame\">ImageFrame</a> crops the photo. <code>MediaCaption</code> sits inside it and carries the text: its box is the measure. <code>MediaGradient</code> is the caption's child, so the wash measures what the text measures, not a percentage of the image.",
    "mediaGradient.anatomyLabel": "MediaGradient parts",
    "mediaGradient.anatomyPreviewLabel": "Anatomy",

    "mediaGradient.lede":
      "When the text sits <strong>on a photo</strong>, the text colour token does not guarantee contrast: a wash does. <code>sk-media-gradient</code> lives <strong>inside</strong> the caption, so it is as tall (or as wide) as the text it protects, not a veil over the whole image. It is tinted with the accent colour.",

    "mediaGradient.whenTitle": "When to use it",
    "mediaGradient.whenItem1": "A title or headline over a cover image",
    "mediaGradient.whenItem2": "When the wash has to be as tall as the text, not a percentage of the image",
    "mediaGradient.whenItem3":
      "Not when the text can go below the image: it reads better there and needs no wash. Not to darken the page behind a dialog (that is <a class=\"sk-link sk-interactive\" href=\"/components/dialog\">Dialog</a>'s <code>::backdrop</code>), and not to fade the edge of a scrolling area (that is <a class=\"sk-link sk-interactive\" href=\"/components/fade-edge\">FadeEdge</a>)",

    "mediaGradient.cardTitle": "Image card",
    "mediaGradient.cardBody":
      "ImageFrame takes the caption as a slot, not as a second image source. The card is still <a class=\"sk-link sk-interactive\" href=\"/components/box\">Box</a> plus composition.",
    "mediaGradient.cardPreviewLabel": "Card with MediaGradient",

    "mediaGradient.edgesTitle": "Edges",
    "mediaGradient.edgesBody":
      "<code>edge</code> on the caption: with <code>top</code> and <code>bottom</code> the band is as tall as the text and spans the full width; with <code>start</code> and <code>end</code> it is as wide as the text and as tall as the content. The gradient fades toward the photo from that edge.",
    "mediaGradient.edgesPreviewLabel": "The four edges",

    "mediaGradient.strengthTitle": "Strength",
    "mediaGradient.strengthBody":
      "<code>strength</code> (<code>sm</code>, <code>md</code>, <code>lg</code>) on the wash changes the opacity and the tint mix, never how much of the photo is covered. In React, <code>&lt;MediaCaption strength&gt;</code> adds the wash itself.",
    "mediaGradient.strengthPreviewLabel": "The three strengths",

    "mediaGradient.tintTitle": "Tint",
    "mediaGradient.tintBody":
      "The tint comes from <code>--sk-media-gradient-tint</code>, which defaults to <code>--color-action-accent</code>. For more tint or opacity, override <code>--sk-media-gradient-mix</code> and <code>--sk-media-gradient-opacity</code>.",

    "mediaGradient.a11yBody":
      "The wash is paint: it carries <code>aria-hidden=\"true\"</code> and the content is the caption's text. With <a class=\"sk-link sk-interactive\" href=\"/transparency\"><code>prefers-reduced-transparency</code></a>, the gradient is replaced by the opaque base colour inside the same box, so contrast holds without depending on the photo. If the image is only decorative, its <code>alt</code> is empty; the title is already in the caption.",

    "demo.mediaGradient.title": "Coastal horizon",
    "demo.mediaGradient.caption": "Legible text on the photo.",
    "demo.mediaGradient.body": "Card body below the image.",
  },
} as const;
