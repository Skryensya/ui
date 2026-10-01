export const imageFrameMessages = {
  es: {
    "demo.imageFrame.alt": "Paisaje de demostración",
    "demo.imageFrame.aspectLabel": "Proporciones de ImageFrame",
    "demo.imageFrame.fitLabel": "Modos de object-fit",
    "demo.imageFrame.positionLabel": "Anclas de recorte",
    "demo.imageFrame.anatomyCaption": "Vista desde el mirador",

    "imageFrame.description": "Recorta una imagen o un video a una proporción fija y decide qué parte se ve.",

    "imageFrame.a11yYours2": "Un video con información debe tener subtítulos.",

    "imageFrame.a11yYours1": 'Toda imagen de contenido debe tener <code>alt</code>; las decorativas, <code>alt=""</code>.',

    "imageFrame.a11yDoes2": "La proporción fija evita que el contenido salte al cargar.",

    "imageFrame.a11yDoes1": "Renderiza el <code>img</code> con el <code>alt</code> que le pasas.",

    "imageFrame.a11yIntro": "El marco no agrega semántica: la imagen habla por su <code>alt</code>.",

    "imageFrame.content3": "No repitas en el <code>alt</code> lo que ya dice el texto de al lado.",

    "imageFrame.content2": 'Si la imagen es decorativa, deja <code>alt=""</code>.',

    "imageFrame.content1": "Escribe un <code>alt</code> con lo que la imagen aporta: «Lámpara de latón con pantalla de tela», no «Imagen».",

    "imageFrame.dd.fit.dont": "Con <code>cover</code>, el logo llena el cuadro pero pierde partes: ya no se reconoce completo.",

    "imageFrame.dd.fit.do": "Con <code>contain</code>, el logo entra entero aunque quede aire alrededor.",

    "imageFrame.dd.fit.title": "Fit: logos y diagramas completos",

    "imageFrame.dd.photo.dont": "Con <code>contain</code>, la foto entra completa pero deja bandas: la miniatura deja de llenar la tarjeta.",

    "imageFrame.dd.photo.do": "Con <code>cover</code>, la foto llena el marco y todas las miniaturas mantienen el mismo peso visual.",

    "imageFrame.dd.photo.title": "Fotos: llena el marco",

    "imageFrame.dd.position.dont": "Con el centro por defecto, el recorte puede quedarse con el torso y perder la cara.",

    "imageFrame.dd.position.do": "Con <code>position</code>, ancla el recorte donde está el sujeto importante.",

    "imageFrame.dd.position.title": "Position: protege el sujeto",

    "imageFrame.dd.border.dont": "Sin borde, una captura clara sobre fondo claro se confunde con la página.",

    "imageFrame.dd.border.do": "Un borde sutil marca dónde termina la imagen sin competir con su contenido.",

    "imageFrame.dd.border.title": "Border: separa imágenes claras",

    "imageFrame.whenNot4": "Si no hay imagen que mostrar: un marco vacío es una caja vacía, no un espacio reservado.",

    "imageFrame.whenNot3": 'Para ver una imagen más grande al tocarla: usa <a href="/es/componentes/lightbox">Lightbox</a>.',

    "imageFrame.whenNot2": 'Mientras la imagen no cargó: usa <a href="/es/componentes/placeholder">Placeholder</a>.',

    "imageFrame.whenNot1": 'Para la identidad de una persona: usa <a href="/es/componentes/avatar">Avatar</a>.',

    "imageFrame.when2": "Para llenar una caja sin deformar la imagen, y elegir qué parte se ve.",

    "imageFrame.when1": "Para recortar una foto o un video a una proporción fija: una tarjeta, una galería, una portada.",

    "imageFrame.contract3": "<code>border</code> agrega un borde (<code>subtle</code> o <code>default</code>) para fotos claras sobre fondos claros.",

    "imageFrame.contract2": "En React, <code>src</code> y <code>alt</code> pintan un <code>img</code>; para <code>picture</code> o <code>video</code>, pasa hijos.",

    "imageFrame.contract1": "El media es un <code>img</code>, un <code>video</code> o un <code>picture &gt; img</code> hijo directo, o cualquier elemento con <code>sk-image-frame__media</code>.",

    "imageFrame.basicBody": "Proporción fija, recorte con <code>cover</code> y esquinas redondeadas.",

    "imageFrame.basicTitle": "Una foto con su marco",
    "imageFrame.lede": "ImageFrame recorta una imagen o un video a una proporción fija, y decide cómo la llena (<code>fit</code>) y qué parte sobrevive al recorte (<code>position</code>). La caja tiene su tamaño antes de que la imagen cargue, así la página no salta.",
    "imageFrame.anatomyBody":
      "Este diagrama nombra el marco, el media y un caption con wash. El caption y el gradient son de MediaCaption/MediaGradient (padres de ImageFrame), no partes propias del frame; el espécimen los trae porque esa composición es lo que el contrato enseña. Está congelado; los aspect/fit/position vivos empiezan abajo.",
    "imageFrame.anatomyLabel": "Anatomía de ImageFrame",
    "imageFrame.anatomyPreviewLabel": "ImageFrame, parte por parte",
    "imageFrame.aspectTitle": "Proporciones: la caja, no el archivo",
    "imageFrame.aspectBody": "La misma foto en varias cajas. Con <code>auto</code>, el marco sigue la medida de la imagen.",
    "imageFrame.fitTitle": "Ajustes: recortar, encajar o estirar",
    "imageFrame.fitBody": "La misma caja <code>1/1</code>: <code>cover</code> recorta, <code>contain</code> deja ver el fondo del marco, <code>fill</code> estira.",
    "imageFrame.positionTitle": "Posición: qué parte queda",
    "imageFrame.positionBody": "Con <code>cover</code>, <code>position</code> elige el ancla del recorte.",
    "imageFrame.contractItem2":
      "<code>data-aspect</code>: <code>auto</code>, <code>1/1</code>, <code>4/3</code>, <code>3/2</code>, <code>16/9</code>, <code>3/4</code>, <code>2/3</code>, <code>9/16</code>.",
    "imageFrame.contractItem3":
      "<code>data-fit</code>: <code>cover</code> (default), <code>contain</code>, <code>fill</code>, <code>none</code>, <code>scale-down</code>.",
    "imageFrame.contractItem5":
      "<code>data-radius</code>: <code>none</code>, <code>top</code>, <code>control</code>, <code>surface</code>, <code>pill</code> (default).",
    "imageFrame.contractItem6": "<code>data-border</code>: <code>none</code> (default), <code>subtle</code>, <code>default</code>.",
    "imageFrame.contractItem7":
      "Hooks: <code>--sk-image-frame-aspect</code>, <code>--sk-image-frame-fit</code>, <code>--sk-image-frame-position</code>, <code>--sk-image-frame-radius</code>, <code>--sk-image-frame-border-*</code>, <code>--sk-image-frame-bg</code>.",
    "imageFrame.test1": "Traduce las props de geometría a atributos <code>data-*</code> en la raíz escrita a mano.",
    "imageFrame.test2": "Renderiza un <code>img</code> desde <code>src</code>/<code>alt</code> cuando no se pasan hijos.",
    "imageFrame.test3": "Mantiene un caption junto al medio de <code>src</code>.",
    "imageFrame.prop.aspect.title": "Aspect: la forma de la caja",
    "imageFrame.prop.aspect.body": "El <code>aspect</code> reserva el alto de la imagen antes de que cargue, y así no mueve la página.",
    "imageFrame.prop.aspect.auto": "Usa <code>auto</code> para respetar la proporción de la imagen, cuando la conoces de antemano.",
    "imageFrame.prop.aspect.1/1": "Usa <code>1/1</code> para avatares, logos y miniaturas en cuadrícula.",
    "imageFrame.prop.aspect.4/3": "Usa <code>4/3</code> para fotos de producto y tarjetas.",
    "imageFrame.prop.aspect.3/2": "Usa <code>3/2</code> para fotografías de cámara.",
    "imageFrame.prop.aspect.16/9": "Usa <code>16/9</code> para portadas y videos.",
    "imageFrame.prop.aspect.3/4": "Usa <code>3/4</code> para retratos.",
    "imageFrame.prop.aspect.2/3": "Usa <code>2/3</code> para pósters y portadas de libros.",
    "imageFrame.prop.aspect.9/16": "Usa <code>9/16</code> para historias y capturas de celular.",
    "imageFrame.prop.radius.title": "Radius: las esquinas",
    "imageFrame.prop.radius.body": "El <code>radius</code> redondea las esquinas con los radios del sistema.",
    "imageFrame.prop.radius.none": "Usa <code>none</code> para una imagen a sangre, de borde a borde.",
    "imageFrame.prop.radius.top": "Usa <code>top</code> para la imagen de arriba de una tarjeta.",
    "imageFrame.prop.radius.control": "Usa <code>control</code> para miniaturas junto a controles.",
    "imageFrame.prop.radius.surface": "Usa <code>surface</code>, el default, para una imagen suelta en el contenido.",
    "imageFrame.prop.radius.pill": "Usa <code>pill</code> para avatares redondos.",
    "imageFrame.guidelinesLede": "Una proporción fija reserva el lugar de la imagen antes de que llegue.",
    "imageFrame.prop.fit.title": "Fit: cómo la llena",
    "imageFrame.prop.fit.body": "El <code>fit</code> decide qué hace la imagen cuando su proporción no es la del marco. Aquí el marco es cuadrado y la imagen, ancha.",
    "imageFrame.prop.fit.cover": "Usa <code>cover</code>, el default, para llenar el marco: recorta lo que sobra. Fotos, portadas, miniaturas.",
    "imageFrame.prop.fit.contain": "Usa <code>contain</code> cuando no se puede cortar nada: la imagen entra entera y se ve el fondo del marco. Logos, capturas.",
    "imageFrame.prop.fit.fill": "<code>fill</code> estira la imagen hasta llenar el marco y la deforma. Úsalo solo con imágenes que no tienen forma que proteger, como un degradado.",
    "imageFrame.prop.fit.none": "Usa <code>none</code> para mostrar la imagen a su tamaño real, recortada por el marco.",
    "imageFrame.prop.fit.scale-down": "Usa <code>scale-down</code> para que una imagen pequeña no se agrande y una grande entre entera, como un ícono subido por alguien.",
  },
  en: {
    "demo.imageFrame.alt": "Demonstration landscape",
    "demo.imageFrame.aspectLabel": "ImageFrame aspect ratios",
    "demo.imageFrame.fitLabel": "object-fit modes",
    "demo.imageFrame.positionLabel": "Crop anchors",
    "demo.imageFrame.anatomyCaption": "View from the lookout",

    "imageFrame.description": "Crops an image or video to a fixed ratio and decides which part shows.",

    "imageFrame.a11yYours2": "A video with information must have captions.",

    "imageFrame.a11yYours1": 'Every content image must have an <code>alt</code>; decorative ones, <code>alt=""</code>.',

    "imageFrame.a11yDoes2": "The fixed ratio keeps content from jumping on load.",

    "imageFrame.a11yDoes1": "It renders the <code>img</code> with the <code>alt</code> you pass.",

    "imageFrame.a11yIntro": "The frame adds no semantics: the image speaks through its <code>alt</code>.",

    "imageFrame.content3": "Do not repeat in the <code>alt</code> what the text beside it already says.",

    "imageFrame.content2": 'If the image is decorative, leave <code>alt=""</code>.',

    "imageFrame.content1": "Write an <code>alt</code> with what the image adds: “Brass lamp with a fabric shade”, not “Image”.",

    "imageFrame.dd.fit.dont": "With <code>cover</code>, the logo fills the square but loses parts: it is no longer recognizable whole.",

    "imageFrame.dd.fit.do": "With <code>contain</code>, the logo fits whole even if space remains around it.",

    "imageFrame.dd.fit.title": "Fit: whole logos and diagrams",

    "imageFrame.dd.photo.dont": "With <code>contain</code>, the whole photo fits but leaves bars: the thumbnail stops filling the card.",

    "imageFrame.dd.photo.do": "With <code>cover</code>, the photo fills the frame and every thumbnail keeps the same visual weight.",

    "imageFrame.dd.photo.title": "Photos: fill the frame",

    "imageFrame.dd.position.dont": "With the default center, the crop can keep the torso and lose the face.",

    "imageFrame.dd.position.do": "With <code>position</code>, anchor the crop where the important subject is.",

    "imageFrame.dd.position.title": "Position: protect the subject",

    "imageFrame.dd.border.dont": "Without a border, a light screenshot on a light background blends into the page.",

    "imageFrame.dd.border.do": "A subtle border marks where the image ends without competing with its content.",

    "imageFrame.dd.border.title": "Border: separate light images",

    "imageFrame.whenNot4": "If there is no image to show: an empty frame is an empty box, not a reserved space.",

    "imageFrame.whenNot3": 'To see an image larger on tap: use <a href="/components/lightbox">Lightbox</a>.',

    "imageFrame.whenNot2": 'While the image has not loaded: use <a href="/components/placeholder">Placeholder</a>.',

    "imageFrame.whenNot1": 'For a person\'s identity: use <a href="/components/avatar">Avatar</a>.',

    "imageFrame.when2": "To fill a box without distorting the image, and choose which part shows.",

    "imageFrame.when1": "To crop a photo or video to a fixed ratio: a card, a gallery, a cover.",

    "imageFrame.contract3": "<code>border</code> adds a border (<code>subtle</code> or <code>default</code>) for light photos on light backgrounds.",

    "imageFrame.contract2": "In React, <code>src</code> and <code>alt</code> paint an <code>img</code>; for <code>picture</code> or <code>video</code>, pass children.",

    "imageFrame.contract1": "The media is a direct <code>img</code>, <code>video</code> or <code>picture &gt; img</code> child, or any element with <code>sk-image-frame__media</code>.",

    "imageFrame.basicBody": "A fixed ratio, a <code>cover</code> crop and rounded corners.",

    "imageFrame.basicTitle": "A photo with its frame",
    "imageFrame.lede": "ImageFrame crops an image or video to a fixed ratio, and decides how it fills (<code>fit</code>) and which part survives the crop (<code>position</code>). The box has its size before the image loads, so the page does not jump.",
    "imageFrame.anatomyBody":
      "This diagram names the frame, the media, and a caption with wash. Caption and gradient belong to MediaCaption/MediaGradient (parents of ImageFrame), not to the frame's own parts; the specimen includes them because that composition is what the contract teaches. It is frozen; the live aspect/fit/position demos start below.",
    "imageFrame.anatomyLabel": "ImageFrame anatomy",
    "imageFrame.anatomyPreviewLabel": "ImageFrame, part by part",
    "imageFrame.aspectTitle": "Ratios: the box, not the file",
    "imageFrame.aspectBody": "The same photo in several boxes. With <code>auto</code>, the frame follows the image's size.",
    "imageFrame.fitTitle": "Fits: crop, fit or stretch",
    "imageFrame.fitBody": "The same <code>1/1</code> box: <code>cover</code> crops, <code>contain</code> shows the frame's background, <code>fill</code> stretches.",
    "imageFrame.positionTitle": "Position: which part stays",
    "imageFrame.positionBody": "With <code>cover</code>, <code>position</code> picks the crop's anchor.",
    "imageFrame.contractItem2":
      "<code>data-aspect</code>: <code>auto</code>, <code>1/1</code>, <code>4/3</code>, <code>3/2</code>, <code>16/9</code>, <code>3/4</code>, <code>2/3</code>, <code>9/16</code>.",
    "imageFrame.contractItem3":
      "<code>data-fit</code>: <code>cover</code> (default), <code>contain</code>, <code>fill</code>, <code>none</code>, <code>scale-down</code>.",
    "imageFrame.contractItem5":
      "<code>data-radius</code>: <code>none</code>, <code>top</code>, <code>control</code>, <code>surface</code>, <code>pill</code> (default).",
    "imageFrame.contractItem6": "<code>data-border</code>: <code>none</code> (default), <code>subtle</code>, <code>default</code>.",
    "imageFrame.contractItem7":
      "Hooks: <code>--sk-image-frame-aspect</code>, <code>--sk-image-frame-fit</code>, <code>--sk-image-frame-position</code>, <code>--sk-image-frame-radius</code>, <code>--sk-image-frame-border-*</code>, <code>--sk-image-frame-bg</code>.",
    "imageFrame.test1": "Maps geometry props to data attributes on the authored root.",
    "imageFrame.test2": "Renders a media img from src/alt when children are omitted.",
    "imageFrame.test3": "Keeps a caption beside the src media.",
    "imageFrame.prop.aspect.title": "Aspect: the box's shape",
    "imageFrame.prop.aspect.body": "<code>aspect</code> reserves the image's height before it loads, so the page does not move.",
    "imageFrame.prop.aspect.auto": "Use <code>auto</code> to keep the image's own ratio, when you know it ahead of time.",
    "imageFrame.prop.aspect.1/1": "Use <code>1/1</code> for avatars, logos and grid thumbnails.",
    "imageFrame.prop.aspect.4/3": "Use <code>4/3</code> for product photos and cards.",
    "imageFrame.prop.aspect.3/2": "Use <code>3/2</code> for camera photographs.",
    "imageFrame.prop.aspect.16/9": "Use <code>16/9</code> for covers and videos.",
    "imageFrame.prop.aspect.3/4": "Use <code>3/4</code> for portraits.",
    "imageFrame.prop.aspect.2/3": "Use <code>2/3</code> for posters and book covers.",
    "imageFrame.prop.aspect.9/16": "Use <code>9/16</code> for stories and phone screenshots.",
    "imageFrame.prop.radius.title": "Radius: the corners",
    "imageFrame.prop.radius.body": "<code>radius</code> rounds the corners with the system's radii.",
    "imageFrame.prop.radius.none": "Use <code>none</code> for a full-bleed image, edge to edge.",
    "imageFrame.prop.radius.top": "Use <code>top</code> for the image at the top of a card.",
    "imageFrame.prop.radius.control": "Use <code>control</code> for thumbnails beside controls.",
    "imageFrame.prop.radius.surface": "Use <code>surface</code>, the default, for an image on its own in the content.",
    "imageFrame.prop.radius.pill": "Use <code>pill</code> for round avatars.",
    "imageFrame.guidelinesLede": "A fixed ratio reserves the image's place before it arrives.",
    "imageFrame.prop.fit.title": "Fit: how it fills",
    "imageFrame.prop.fit.body": "<code>fit</code> decides what the image does when its ratio is not the frame's. Here the frame is square and the image is wide.",
    "imageFrame.prop.fit.cover": "Use <code>cover</code>, the default, to fill the frame: whatever overflows is cropped. Photos, covers, thumbnails.",
    "imageFrame.prop.fit.contain": "Use <code>contain</code> when nothing may be cropped: the whole image fits and the frame's background shows. Logos, screenshots.",
    "imageFrame.prop.fit.fill": "<code>fill</code> stretches the image to fill the frame and distorts it. Use it only for images with no shape to protect, like a gradient.",
    "imageFrame.prop.fit.none": "Use <code>none</code> to show the image at its real size, cropped by the frame.",
    "imageFrame.prop.fit.scale-down": "Use <code>scale-down</code> so a small image is not enlarged and a large one fits whole, like an icon someone uploaded.",
  },
} as const;
