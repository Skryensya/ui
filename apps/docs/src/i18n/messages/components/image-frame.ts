export const imageFrameMessages = {
  es: {
    "demo.imageFrame.alt": "Paisaje de demostración",
    "demo.imageFrame.aspectLabel": "Proporciones de ImageFrame",
    "demo.imageFrame.fitLabel": "Modos de object-fit",
    "demo.imageFrame.positionLabel": "Anclas de recorte",
    "demo.imageFrame.anatomyCaption": "Vista desde el mirador",

    "imageFrame.description": "ImageFrame: marco que recorta y posiciona media con aspect-ratio, object-fit y object-position.",
    "imageFrame.lede":
      'ImageFrame es el <strong>marco de media</strong>: una caja que fija un aspect ratio, recorta con radio/borde y decide cómo llena la imagen (<code>object-fit</code>) y desde dónde (<code>object-position</code>). No es un componente de imagen con CDN ni un Avatar: es el pattern que Card, Tile y galerías reutilizan en vez de copiar <code>aspect-ratio</code> a mano. Para tipo sobre la foto, compón con <a href="/es/componentes/media-gradient">MediaGradient</a> (<code>sk-media-gradient</code>).',
    "imageFrame.anatomyBody":
      "Este diagrama nombra el marco, el media y un caption con wash. El caption y el gradient son de MediaCaption/MediaGradient (padres de ImageFrame), no partes propias del frame; el espécimen los trae porque esa composición es lo que el contrato enseña. Está congelado; los aspect/fit/position vivos empiezan abajo.",
    "imageFrame.anatomyLabel": "Anatomía de ImageFrame",
    "imageFrame.anatomyPreviewLabel": "ImageFrame, parte por parte",
    "imageFrame.aspectTitle": "Aspect",
    "imageFrame.aspectBody":
      "<code>data-aspect</code> es la caja, no el archivo. Con <code>cover</code> (por defecto) la media rellena y se recorta; con <code>auto</code> el marco sigue la medida intrínseca del media.",
    "imageFrame.fitTitle": "Fit",
    "imageFrame.fitBody":
      "Misma caja <code>1/1</code>, distinto <code>data-fit</code>: <code>cover</code> recorta, <code>contain</code> letterboxa (se ve el fondo del marco), <code>fill</code> estira.",
    "imageFrame.positionTitle": "Position",
    "imageFrame.positionBody":
      "Con <code>cover</code>, <code>data-position</code> elige el ancla del recorte. El demo concentra un disco arriba-izquierda y un bloque abajo-derecha para que el ancla se note.",
    "imageFrame.reactBody":
      '<code>src</code> / <code>alt</code> pintan un <code>img</code> con la clase media. Para <code>picture</code> o <code>video</code>, pasa hijos con <code>className="sk-image-frame__media"</code> (o deja el <code>img</code>/<code>video</code> como hijo directo: el CSS también los alcanza).',
    "imageFrame.contractItem1":
      "Raíz: <code>sk-image-frame</code>. Media: <code>sk-image-frame__media</code>, o <code>img</code>/<code>video</code>/<code>picture &gt; img</code> hijo directo.",
    "imageFrame.contractItem2":
      "<code>data-aspect</code>: <code>auto</code>, <code>1/1</code>, <code>4/3</code>, <code>3/2</code>, <code>16/9</code>, <code>3/4</code>, <code>2/3</code>, <code>9/16</code>.",
    "imageFrame.contractItem3":
      "<code>data-fit</code>: <code>cover</code> (default), <code>contain</code>, <code>fill</code>, <code>none</code>, <code>scale-down</code>.",
    "imageFrame.contractItem4":
      "<code>data-position</code>: <code>center</code> (default), <code>top</code>, <code>bottom</code>, <code>left</code>, <code>right</code>, y las cuatro esquinas (<code>top-left</code>, …).",
    "imageFrame.contractItem5":
      "<code>data-radius</code>: <code>none</code>, <code>top</code>, <code>control</code>, <code>surface</code>, <code>pill</code> (default).",
    "imageFrame.contractItem6": "<code>data-border</code>: <code>none</code> (default), <code>subtle</code>, <code>default</code>.",
    "imageFrame.contractItem7":
      "Hooks: <code>--sk-image-frame-aspect</code>, <code>--sk-image-frame-fit</code>, <code>--sk-image-frame-position</code>, <code>--sk-image-frame-radius</code>, <code>--sk-image-frame-border-*</code>, <code>--sk-image-frame-bg</code>.",
    "imageFrame.test1": "Traduce las props de geometría a atributos <code>data-*</code> en la raíz escrita a mano.",
    "imageFrame.test2": "Renderiza un <code>img</code> desde <code>src</code>/<code>alt</code> cuando no se pasan hijos.",
    "imageFrame.test3": "Mantiene un caption junto al medio de <code>src</code>.",
    "imageFrame.prop.aspect.title": "Proporción",
    "imageFrame.prop.aspect.body": "El <code>aspect</code> reserva el alto de la imagen antes de que cargue, y así no mueve la página.",
    "imageFrame.prop.aspect.auto": "Usa <code>auto</code> para respetar la proporción de la imagen, cuando la conoces de antemano.",
    "imageFrame.prop.aspect.1/1": "Usa <code>1/1</code> para avatares, logos y miniaturas en cuadrícula.",
    "imageFrame.prop.aspect.4/3": "Usa <code>4/3</code> para fotos de producto y tarjetas.",
    "imageFrame.prop.aspect.3/2": "Usa <code>3/2</code> para fotografías de cámara.",
    "imageFrame.prop.aspect.16/9": "Usa <code>16/9</code> para portadas y videos.",
    "imageFrame.prop.aspect.3/4": "Usa <code>3/4</code> para retratos.",
    "imageFrame.prop.aspect.2/3": "Usa <code>2/3</code> para pósters y portadas de libros.",
    "imageFrame.prop.aspect.9/16": "Usa <code>9/16</code> para historias y capturas de celular.",
    "imageFrame.prop.radius.title": "Esquinas",
    "imageFrame.prop.radius.body": "El <code>radius</code> redondea las esquinas con los radios del sistema.",
    "imageFrame.prop.radius.none": "Usa <code>none</code> para una imagen a sangre, de borde a borde.",
    "imageFrame.prop.radius.top": "Usa <code>top</code> para la imagen de arriba de una tarjeta.",
    "imageFrame.prop.radius.control": "Usa <code>control</code> para miniaturas junto a controles.",
    "imageFrame.prop.radius.surface": "Usa <code>surface</code>, el default, para una imagen suelta en el contenido.",
    "imageFrame.prop.radius.pill": "Usa <code>pill</code> para avatares redondos.",
    "imageFrame.showcaseTitle": "Showcases",
    "imageFrame.showcaseBody": "Una imagen con su marco, en varias proporciones, con distintos ajustes y puntos de foco.",
    "imageFrame.guidelinesLede": "ImageFrame muestra una imagen con una proporción fija, un ajuste y un foco.",
    "imageFrame.guide.use1": "Fija la proporción para que la página no salte cuando la imagen carga.",
    "imageFrame.guide.use2": "Usa <code>fit=\"cover\"</code> para llenar el marco y <code>contain</code> cuando no se puede cortar nada, como un logo.",
    "imageFrame.guide.use3": "Escribe un <code>alt</code> que diga lo que la imagen aporta; si es decorativa, déjalo vacío.",
    "imageFrame.prop.fit.title": "Ajuste",
    "imageFrame.prop.fit.body": "El <code>fit</code> decide qué hace la imagen cuando su proporción no es la del marco. Aquí el marco es cuadrado y la imagen, ancha.",
    "imageFrame.prop.fit.cover": "Usa <code>cover</code>, el default, para llenar el marco: recorta lo que sobra. Fotos, portadas, miniaturas.",
    "imageFrame.prop.fit.contain": "Usa <code>contain</code> cuando no se puede cortar nada: la imagen entra entera y se ve el fondo del marco. Logos, capturas.",
    "imageFrame.prop.fit.fill": "<code>fill</code> estira la imagen hasta llenar el marco y la deforma. Úsalo solo con imágenes que no tienen forma que proteger, como un degradado.",
    "imageFrame.prop.fit.none": "Usa <code>none</code> para mostrar la imagen a su tamaño real, recortada por el marco.",
    "imageFrame.prop.fit.scale-down": "Usa <code>scale-down</code> para que una imagen chica no se agrande y una grande entre entera, como un ícono subido por alguien.",
  },
  en: {
    "demo.imageFrame.alt": "Demonstration landscape",
    "demo.imageFrame.aspectLabel": "ImageFrame aspect ratios",
    "demo.imageFrame.fitLabel": "object-fit modes",
    "demo.imageFrame.positionLabel": "Crop anchors",
    "demo.imageFrame.anatomyCaption": "View from the lookout",

    "imageFrame.description": "ImageFrame: a frame that crops and positions media with aspect-ratio, object-fit and object-position.",
    "imageFrame.lede":
      'ImageFrame is the <strong>media frame</strong>: a box that fixes an aspect ratio, crops with a radius/border, and decides how the image fills it (<code>object-fit</code>) and from where (<code>object-position</code>). It is not a CDN image component or an Avatar: it is the pattern Card, Tile, and galleries reuse instead of copying <code>aspect-ratio</code> by hand. For type over the photo, compose with <a href="/components/media-gradient">MediaGradient</a> (<code>sk-media-gradient</code>).',
    "imageFrame.anatomyBody":
      "This diagram names the frame, the media, and a caption with wash. Caption and gradient belong to MediaCaption/MediaGradient (parents of ImageFrame), not to the frame's own parts; the specimen includes them because that composition is what the contract teaches. It is frozen; the live aspect/fit/position demos start below.",
    "imageFrame.anatomyLabel": "ImageFrame anatomy",
    "imageFrame.anatomyPreviewLabel": "ImageFrame, part by part",
    "imageFrame.aspectTitle": "Aspect",
    "imageFrame.aspectBody":
      "<code>data-aspect</code> is the box, not the file. With <code>cover</code> (the default) the media fills and gets cropped; with <code>auto</code> the frame follows the media's own intrinsic size.",
    "imageFrame.fitTitle": "Fit",
    "imageFrame.fitBody":
      "Same <code>1/1</code> box, different <code>data-fit</code>: <code>cover</code> crops, <code>contain</code> letterboxes (the frame's own background shows), <code>fill</code> stretches.",
    "imageFrame.positionTitle": "Position",
    "imageFrame.positionBody":
      "With <code>cover</code>, <code>data-position</code> picks the crop's anchor. The demo puts a disc in the top-left and a block in the bottom-right so the anchor stands out.",
    "imageFrame.reactBody":
      '<code>src</code> / <code>alt</code> paint an <code>img</code> with the media class. For <code>picture</code> or <code>video</code>, pass children with <code>className="sk-image-frame__media"</code> (or leave the <code>img</code>/<code>video</code> as a direct child: the CSS reaches those too).',
    "imageFrame.contractItem1":
      "Root: <code>sk-image-frame</code>. Media: <code>sk-image-frame__media</code>, or a direct-child <code>img</code>/<code>video</code>/<code>picture &gt; img</code>.",
    "imageFrame.contractItem2":
      "<code>data-aspect</code>: <code>auto</code>, <code>1/1</code>, <code>4/3</code>, <code>3/2</code>, <code>16/9</code>, <code>3/4</code>, <code>2/3</code>, <code>9/16</code>.",
    "imageFrame.contractItem3":
      "<code>data-fit</code>: <code>cover</code> (default), <code>contain</code>, <code>fill</code>, <code>none</code>, <code>scale-down</code>.",
    "imageFrame.contractItem4":
      "<code>data-position</code>: <code>center</code> (default), <code>top</code>, <code>bottom</code>, <code>left</code>, <code>right</code>, and the four corners (<code>top-left</code>, …).",
    "imageFrame.contractItem5":
      "<code>data-radius</code>: <code>none</code>, <code>top</code>, <code>control</code>, <code>surface</code>, <code>pill</code> (default).",
    "imageFrame.contractItem6": "<code>data-border</code>: <code>none</code> (default), <code>subtle</code>, <code>default</code>.",
    "imageFrame.contractItem7":
      "Hooks: <code>--sk-image-frame-aspect</code>, <code>--sk-image-frame-fit</code>, <code>--sk-image-frame-position</code>, <code>--sk-image-frame-radius</code>, <code>--sk-image-frame-border-*</code>, <code>--sk-image-frame-bg</code>.",
    "imageFrame.test1": "Maps geometry props to data attributes on the authored root.",
    "imageFrame.test2": "Renders a media img from src/alt when children are omitted.",
    "imageFrame.test3": "Keeps a caption beside the src media.",
    "imageFrame.prop.aspect.title": "Aspect",
    "imageFrame.prop.aspect.body": "<code>aspect</code> reserves the image's height before it loads, so the page does not move.",
    "imageFrame.prop.aspect.auto": "Use <code>auto</code> to keep the image's own ratio, when you know it ahead of time.",
    "imageFrame.prop.aspect.1/1": "Use <code>1/1</code> for avatars, logos and grid thumbnails.",
    "imageFrame.prop.aspect.4/3": "Use <code>4/3</code> for product photos and cards.",
    "imageFrame.prop.aspect.3/2": "Use <code>3/2</code> for camera photographs.",
    "imageFrame.prop.aspect.16/9": "Use <code>16/9</code> for covers and videos.",
    "imageFrame.prop.aspect.3/4": "Use <code>3/4</code> for portraits.",
    "imageFrame.prop.aspect.2/3": "Use <code>2/3</code> for posters and book covers.",
    "imageFrame.prop.aspect.9/16": "Use <code>9/16</code> for stories and phone screenshots.",
    "imageFrame.prop.radius.title": "Corners",
    "imageFrame.prop.radius.body": "<code>radius</code> rounds the corners with the system's radii.",
    "imageFrame.prop.radius.none": "Use <code>none</code> for a full-bleed image, edge to edge.",
    "imageFrame.prop.radius.top": "Use <code>top</code> for the image at the top of a card.",
    "imageFrame.prop.radius.control": "Use <code>control</code> for thumbnails beside controls.",
    "imageFrame.prop.radius.surface": "Use <code>surface</code>, the default, for an image on its own in the content.",
    "imageFrame.prop.radius.pill": "Use <code>pill</code> for round avatars.",
    "imageFrame.showcaseTitle": "Showcases",
    "imageFrame.showcaseBody": "An image in its frame, in several ratios, with different fits and focus points.",
    "imageFrame.guidelinesLede": "ImageFrame shows an image at a fixed ratio, with a fit and a focus point.",
    "imageFrame.guide.use1": "Fix the ratio so the page does not jump when the image loads.",
    "imageFrame.guide.use2": "Use <code>fit=\"cover\"</code> to fill the frame, and <code>contain</code> when nothing may be cropped, like a logo.",
    "imageFrame.guide.use3": "Write an <code>alt</code> that says what the image adds; when it is decorative, leave it empty.",
    "imageFrame.prop.fit.title": "Fit",
    "imageFrame.prop.fit.body": "<code>fit</code> decides what the image does when its ratio is not the frame's. Here the frame is square and the image is wide.",
    "imageFrame.prop.fit.cover": "Use <code>cover</code>, the default, to fill the frame: whatever overflows is cropped. Photos, covers, thumbnails.",
    "imageFrame.prop.fit.contain": "Use <code>contain</code> when nothing may be cropped: the whole image fits and the frame's background shows. Logos, screenshots.",
    "imageFrame.prop.fit.fill": "<code>fill</code> stretches the image to fill the frame and distorts it. Use it only for images with no shape to protect, like a gradient.",
    "imageFrame.prop.fit.none": "Use <code>none</code> to show the image at its real size, cropped by the frame.",
    "imageFrame.prop.fit.scale-down": "Use <code>scale-down</code> so a small image is not enlarged and a large one fits whole, like an icon someone uploaded.",
  },
} as const;
