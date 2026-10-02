export const qrCodeMessages = {
  es: {
    "qrCodePage.description": "Convierte un enlace o un texto corto en un código que una cámara puede escanear.",
    "qrCodePage.a11yYours2": "Escribe el enlace al lado: el código no puede ser el único camino.",
    "qrCodePage.a11yYours1": "Nunca uses la URL como nombre: un lector de pantalla la deletrea.",
    "qrCodePage.a11yDoes2": "Los puntos son oscuros sobre claro: el contraste que la cámara necesita.",
    "qrCodePage.a11yDoes1": "Es una imagen con nombre; el dibujo en sí queda oculto para los lectores de pantalla.",
    "qrCodePage.a11yIntro": "QRCode es una imagen con nombre.",
    "qrCodePage.content3": "Deja el margen vacío alrededor: es parte del código.",
    "qrCodePage.content2": "Di encima qué hacer: «Escanea con la cámara del teléfono».",
    "qrCodePage.content1": "Nombra el código con lo que se logra: «Abrir esta página en el teléfono», no la URL.",
    "qrCodePage.dd.short.title": "Enlace corto",
    "qrCodePage.dd.short.do": "Un enlace corto da un código con pocos puntos grandes: la cámara lo lee al instante.",
    "qrCodePage.dd.short.dont": "Un enlace largo con parámetros llena el código de puntos diminutos: cuesta más escanearlo. Acórtalo.",
    "qrCodePage.dd.logo.title": "Logo en el centro",
    "qrCodePage.dd.logo.do": "Con el nivel más alto de corrección, el código se reconstruye aunque el logo tape el centro.",
    "qrCodePage.dd.logo.dont": "Con el nivel más bajo no queda con qué reconstruirlo: el hueco lo vuelve ilegible.",
    "qrCodePage.dd.link.dont": "Un código solo deja fuera a quien no puede escanearlo.",
    "qrCodePage.dd.link.do": "El enlace escrito al lado sirve a quien no tiene cámara o lee desde el mismo teléfono.",
    "qrCodePage.dd.link.title": "Enlace: también en texto",
    "qrCodePage.whenNot2": "Para un texto largo: un QR denso cuesta leerlo. Comparte un enlace corto.",
    "qrCodePage.whenNot1": 'Como única forma de llegar a algo en una pantalla donde se puede hacer clic: usa un <a href="/es/componentes/link">Link</a>.',
    "qrCodePage.when2": "Para un dato que se escanea: una entrada, un pase, un código de pago.",
    "qrCodePage.when1": "Para llevar un enlace de una pantalla grande o un impreso al teléfono.",
    "qrCodePage.contract4": "No lee códigos ni trae botón de descarga.",
    "qrCodePage.contract3": "En modo oscuro puedes elegir de qué lado va el contraste; por defecto los puntos siempre son oscuros sobre claro.",
    "qrCodePage.contract2": "Necesita un nombre: dice qué se logra al escanearlo.",
    "qrCodePage.contract1": "Es un solo dibujo vectorial: se ve nítido a cualquier tamaño y toma el color del texto.",
    "qrCodePage.prop.level.H": "Usa <code>H</code> con un logo al centro o en impresos que se gastan.",
    "qrCodePage.prop.level.Q": "Usa <code>Q</code>, el valor por defecto, casi siempre.",
    "qrCodePage.prop.level.M": "Usa <code>M</code> para pantallas e impresos cuidados.",
    "qrCodePage.prop.level.L": "Usa <code>L</code> para un enlace largo en una pantalla limpia.",
    "qrCodePage.prop.level.body": "Cuánto del código puede taparse o ensuciarse y seguir leyéndose: 7, 15, 25 o 30 %. Más corrección, más puntos.",
    "qrCodePage.prop.level.title": "Level: cuánto daño resiste",
    "qrCodePage.lede": "QRCode convierte un enlace o un texto corto en un código que una cámara puede escanear: llevar una página al teléfono, una entrada que se valida en la puerta, un menú en la mesa. Al lado va siempre el enlace escrito, para quien no puede escanear.",
    "qrCodePage.anatomyBody":
      "Este diagrama nombra el root, el frame, los módulos y el logo. El espécimen está congelado; los QRCode vivos empiezan abajo.",
    "qrCodePage.anatomyLabel": "Anatomía de QRCode",
    "qrCodePage.anatomyPreviewLabel": "QRCode, parte por parte",





    "qrCodePage.logoTitle": "Con logo: al centro, con nivel H",
    "qrCodePage.logoBody": "El centro se vacía para darle lugar a un logo: un ícono, un avatar o una imagen. Usa el nivel más alto de corrección para que el código resista el hueco.",
    "qrCodePage.logoBody2":
      'El slot toma cualquier nodo publicado del kit: un <a href="/es/componentes/icon">Icon</a>, un <a href="/es/componentes/avatar">Avatar</a>, un <a href="/es/componentes/image-frame">ImageFrame</a>. Y el agujero se paga en capacidad, así que un logo pide nivel <code>Q</code> o <code>H</code>: por debajo de eso el contrato avisa.',

    "qrCodePage.compositionTitle": "En una tarjeta: con el enlace escrito",
    "qrCodePage.compositionBody": "El código no trae título ni botón: los pone lo que lo rodea. Un Box con un título, el código y el enlace en texto.",




    "qrCodePage.popoverTitle": "En un Popover: llevar la página al teléfono",
    "qrCodePage.popoverBody": "Quien lee en el escritorio abre el código y lo escanea con el teléfono.",
    "qrCodePage.popoverLabel": "QR en un popover",

    "qrCodePage.ticketTitle": "Una entrada: el código es el contenido",
    "qrCodePage.ticketBody": "Lo que se escanea en la puerta. Es lo más grande de la tarjeta y el texto de al lado repite el dato.",

    "qrCodePage.exportTitle": "Guardarlo: PNG o SVG",
    "qrCodePage.exportBody": "El código se guarda tal como se ve: como imagen (PNG) o como vector (SVG) para imprimir. El código de cada caso está en Storybook.",
    "qrCodePage.runtimeTitle": "Si el valor llega después",
    "qrCodePage.runtimeBody": "Si el enlace solo se conoce en el navegador, el código se dibuja cuando llega y se redibuja si cambia. Si es demasiado largo para un QR, queda vacío: muestra entonces el enlace en texto.",


    "qrCodePage.prop.moduleShape.title": "Module shape: el dibujo de cada punto",
    "qrCodePage.prop.moduleShape.body": "Cambia cómo se dibuja cada punto, nunca lo que codifica: los tres se escanean igual.",
    "qrCodePage.prop.moduleShape.square": "Usa <code>square</code>, el valor por defecto, para la lectura más segura.",
    "qrCodePage.prop.moduleShape.dot": "Usa <code>dot</code> para un código más suave, junto a una marca.",
    "qrCodePage.prop.moduleShape.rounded": "Usa <code>rounded</code> para un punto medio entre los dos.",
    "qrCodePage.prop.qrSize.title": "Size: por la distancia de lectura",
    "qrCodePage.prop.qrSize.body": "El lado del código. Elige por la distancia desde la que se escanea, no por el hueco que queda.",
    "qrCodePage.prop.qrSize.sm": "Usa <code>sm</code> dentro de un menú o una tarjeta pequeña.",
    "qrCodePage.prop.qrSize.md": "Usa <code>md</code>, el valor por defecto, en una tarjeta.",
    "qrCodePage.prop.qrSize.lg": "Usa <code>lg</code> cuando se escanea desde lejos, como en una pantalla.",
    "qrCodePage.prop.qrSize.xl": "Usa <code>xl</code> para un código que es lo principal de la vista.",
    "qrCodePage.prop.tone.title": "Tone: el color de los puntos",
    "qrCodePage.prop.tone.body": "Pinta los puntos siempre en un paso oscuro, para que la cámara lo lea.",
    "qrCodePage.prop.tone.neutral": "Usa <code>neutral</code>, el valor por defecto, casi siempre.",
    "qrCodePage.prop.tone.accent": "Usa <code>accent</code> para que el código siga a la marca.",
    "qrCodePage.prop.tone.success": "Usa <code>success</code> para un código ya validado, como una entrada.",
    "qrCodePage.prop.tone.warning": "Usa <code>warning</code> para un código que vence pronto.",
    "qrCodePage.prop.tone.danger": "Usa <code>danger</code> para un código que ya no sirve.",
    "qrCodePage.prop.tone.info": "Usa <code>info</code> para un código informativo.",
    "qrCodePage.guidelinesLede": "Un QR sirve para pasar algo de una pantalla o un papel a un teléfono.",
  },
  en: {
    "qrCodePage.description": "Turns a link or short text into a code a camera can scan.",
    "qrCodePage.a11yYours2": "Write the link beside it: the code cannot be the only way.",
    "qrCodePage.a11yYours1": "Never use the URL as the name: a screen reader spells it out.",
    "qrCodePage.a11yDoes2": "The dots are dark on light: the contrast the camera needs.",
    "qrCodePage.a11yDoes1": "It is a named image; the drawing itself is hidden from screen readers.",
    "qrCodePage.a11yIntro": "QRCode is a named image.",
    "qrCodePage.content3": "Leave the margin around it empty: it is part of the code.",
    "qrCodePage.content2": "Say above it what to do: “Scan with your phone's camera”.",
    "qrCodePage.content1": "Name the code by what it achieves: “Open this page on your phone”, not the URL.",
    "qrCodePage.dd.short.title": "Short link",
    "qrCodePage.dd.short.do": "A short link makes a code of a few large dots: a camera reads it at a glance.",
    "qrCodePage.dd.short.dont": "A long link with parameters fills the code with tiny dots: it is harder to scan. Shorten it.",
    "qrCodePage.dd.logo.title": "Logo in the centre",
    "qrCodePage.dd.logo.do": "At the highest correction level the code rebuilds itself even with the logo over the middle.",
    "qrCodePage.dd.logo.dont": "At the lowest level there is nothing to rebuild it from: the hole makes it unreadable.",
    "qrCodePage.dd.link.dont": "A code alone leaves out whoever cannot scan it.",
    "qrCodePage.dd.link.do": "The written link beside it serves whoever has no camera or reads on the same phone.",
    "qrCodePage.dd.link.title": "Link: also as text",
    "qrCodePage.whenNot2": "For long text: a dense QR is hard to read. Share a short link.",
    "qrCodePage.whenNot1": 'As the only way to reach something on a clickable screen: use a <a href="/components/link">Link</a>.',
    "qrCodePage.when2": "For data that is scanned: a ticket, a pass, a payment code.",
    "qrCodePage.when1": "To take a link from a large screen or a print to the phone.",
    "qrCodePage.contract4": "It does not read codes or bring a download button.",
    "qrCodePage.contract3": "In dark mode you can choose which side the contrast falls on; by default the dots are always dark on light.",
    "qrCodePage.contract2": "It needs a name: it says what scanning it achieves.",
    "qrCodePage.contract1": "It is a single vector drawing: it stays sharp at any size and takes the text colour.",
    "qrCodePage.prop.level.H": "Use <code>H</code> with a logo in the center or on prints that wear.",
    "qrCodePage.prop.level.Q": "Use <code>Q</code>, the default, almost always.",
    "qrCodePage.prop.level.M": "Use <code>M</code> for screens and careful prints.",
    "qrCodePage.prop.level.L": "Use <code>L</code> for a long link on a clean screen.",
    "qrCodePage.prop.level.body": "How much of the code can be covered or dirtied and still read: 7, 15, 25 or 30%. More correction, more dots.",
    "qrCodePage.prop.level.title": "Level: how much damage it survives",
    "qrCodePage.lede": "QRCode turns a link or short text into a code a camera can scan: taking a page to the phone, a ticket checked at the door, a menu on the table. The written link always goes beside it, for whoever cannot scan.",
    "qrCodePage.anatomyBody":
      "This diagram names the root, the frame, the modules and the logo. The specimen is frozen; the live QRCodes begin below.",
    "qrCodePage.anatomyLabel": "QRCode anatomy",
    "qrCodePage.anatomyPreviewLabel": "QRCode, part by part",





    "qrCodePage.logoTitle": "With a logo: centered, at level H",
    "qrCodePage.logoBody": "The centre is cleared to make room for a logo: an icon, an avatar or an image. Use the highest correction level so the code survives the gap.",
    "qrCodePage.logoBody2":
      'The slot takes any published node in the kit: an <a href="/components/icon">Icon</a>, an <a href="/components/avatar">Avatar</a>, an <a href="/components/image-frame">ImageFrame</a>. The hole is paid for in capacity, so a logo wants level <code>Q</code> or <code>H</code>; below that the contract says so.',

    "qrCodePage.compositionTitle": "In a card: with the written link",
    "qrCodePage.compositionBody": "The code brings no title or button: what surrounds it does. A Box with a title, the code and the link as text.",




    "qrCodePage.popoverTitle": "In a Popover: taking the page to the phone",
    "qrCodePage.popoverBody": "Someone reading on the desktop opens the code and scans it with the phone.",
    "qrCodePage.popoverLabel": "QR in a popover",

    "qrCodePage.ticketTitle": "A ticket: the code is the content",
    "qrCodePage.ticketBody": "What is scanned at the door. It is the largest thing on the card and the text beside it repeats the data.",

    "qrCodePage.exportTitle": "Saving it: PNG or SVG",
    "qrCodePage.exportBody": "The code is saved just as it looks: as an image (PNG) or a vector (SVG) for print. The code for each case is in Storybook.",
    "qrCodePage.runtimeTitle": "If the value arrives later",
    "qrCodePage.runtimeBody": "If the link is only known in the browser, the code draws when it arrives and redraws if it changes. If it is too long for a QR it stays empty: show the link as text instead.",


    "qrCodePage.prop.moduleShape.title": "Module shape: how each dot is drawn",
    "qrCodePage.prop.moduleShape.body": "Changes how each dot is drawn, never what it encodes: all three scan the same.",
    "qrCodePage.prop.moduleShape.square": "Use <code>square</code>, the default, for the safest reading.",
    "qrCodePage.prop.moduleShape.dot": "Use <code>dot</code> for a softer code beside a brand.",
    "qrCodePage.prop.moduleShape.rounded": "Use <code>rounded</code> for a middle ground between the two.",
    "qrCodePage.prop.qrSize.title": "Size: by reading distance",
    "qrCodePage.prop.qrSize.body": "The code's side. Choose by the distance it is scanned from, not the gap in the layout.",
    "qrCodePage.prop.qrSize.sm": "Use <code>sm</code> inside a menu or a small card.",
    "qrCodePage.prop.qrSize.md": "Use <code>md</code>, the default, in a card.",
    "qrCodePage.prop.qrSize.lg": "Use <code>lg</code> when it is scanned from afar, as on a screen.",
    "qrCodePage.prop.qrSize.xl": "Use <code>xl</code> for a code that is the main thing in the view.",
    "qrCodePage.prop.tone.title": "Tone: the dots' color",
    "qrCodePage.prop.tone.body": "Paints the dots always in a dark step, so the camera reads it.",
    "qrCodePage.prop.tone.neutral": "Use <code>neutral</code>, the default, almost always.",
    "qrCodePage.prop.tone.accent": "Use <code>accent</code> so the code follows the brand.",
    "qrCodePage.prop.tone.success": "Use <code>success</code> for a code already validated, like a ticket.",
    "qrCodePage.prop.tone.warning": "Use <code>warning</code> for a code that expires soon.",
    "qrCodePage.prop.tone.danger": "Use <code>danger</code> for a code that no longer works.",
    "qrCodePage.prop.tone.info": "Use <code>info</code> for an informational code.",
    "qrCodePage.guidelinesLede": "A QR helps move something from a screen or paper to a phone.",
  },
} as const;
