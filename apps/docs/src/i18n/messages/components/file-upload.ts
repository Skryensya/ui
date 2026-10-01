export const fileUploadMessages = {
  es: {

    "demo.fileUpload.label": "Adjuntos",
    "demo.fileUpload.dropzone": "Arrastra archivos aquí",
    "demo.fileUpload.vagueDropzone": "Subir",
    "demo.fileUpload.vagueTrigger": "Continuar",
    "demo.fileUpload.trigger": "Elegir archivos",
    "demo.fileUpload.anatomyHint": "PDF o imagen, hasta 10 MB",
    "demo.fileUpload.anatomyItem": "informe-final-consolidado-2026.pdf",
    "demo.fileUpload.anatomyRemove": "Quitar informe-final-consolidado-2026.pdf",

    "demo.fileUpload.overlay": "Suelta los archivos para adjuntarlos",

    "fileUploadPage.description": "Adjunta archivos con un botón o soltándolos, y dice antes qué acepta.",

    "fileUploadPage.a11yKeyTab": "Recorre el botón y los botones de quitar de cada archivo.",

    "fileUploadPage.a11yKeyEnter": "Con el botón enfocado, abre el selector de archivos.",

    "fileUploadPage.a11yYours2": "Anuncia los rechazos en texto junto al campo, no solo con color.",

    "fileUploadPage.a11yYours1": "Nombra el campo con una etiqueta visible.",

    "fileUploadPage.a11yDoes3": "El cartel que aparece al arrastrar es <code>aria-hidden</code>: respongesto por gesto de puntero.",

    "fileUploadPage.a11yDoes2": "Cada archivo de la lista tiene un botón para quitarlo, con nombre propio.",

    "fileUploadPage.a11yDoes1": "El botón abre el selector del sistema; arrastrar es un atajo, no el único camino.",

    "fileUploadPage.a11yIntro": "El input de archivos real sigue disponible: la caja no lo reemplaza.",

    "fileUploadPage.content3": "En cada rechazo, di qué falló y qué se acepta: «pesa 8 MB; el máximo es 5 MB».",

    "fileUploadPage.content2": "Di los límites en la ayuda: «PDF o JPG, hasta 5 MB».",

    "fileUploadPage.content1": "Escribe la instrucción con las dos formas: «Suelta archivos aquí o elige desde tu equipo».",

    "fileUploadPage.whenNot3": 'Para la ayuda y el error del formulario alrededor: envuélvelo en <a href="/es/componentes/form-field">FormField</a>.',

    "fileUploadPage.whenNot2": 'Si el valor es texto, aunque venga de un archivo: usa <a href="/es/componentes/input">Input</a>.',

    "fileUploadPage.whenNot1": "Para una foto de perfil que se recorta ahí mismo: necesita su propio flujo.",

    "fileUploadPage.when3": "Para soltar en un panel o en toda la página: usa <code>dropScope</code>.",

    "fileUploadPage.when2": "Cuando conviene aceptar arrastrar y soltar además del botón.",

    "fileUploadPage.when1": "Para adjuntar archivos: un currículum, una factura, fotos.",

    "fileUploadPage.contract3": "La lista va debajo de la caja, no en su lugar, así el segundo archivo cae donde cayó el primero.",

    "fileUploadPage.contract2": "No sube nada: Vanilla emite <code>sk:fileuploadchange</code> y React entrega los aceptados y los rechazados.",

    "fileUploadPage.contract1": "Cinco límites opcionales: <code>accept</code>, <code>maxFileSize</code>, <code>minFileSize</code>, <code>maxTotalSize</code> y <code>maxFiles</code>. Cada rechazo dice su motivo.",

    "fileUploadPage.pageDropBody": 'Con <code>dropScope="page"</code>, todo el documento recibe archivos, y <code>overlayLabel</code> muestra el destino mientras se arrastra. Va en un marco propio para no convertir esta página en destino.',

    "fileUploadPage.pageDropTitle": "Soltar en toda la página: dropScope",

    "fileUploadPage.basicBody": "La caja dice qué acepta. Al llegar a <code>maxFiles</code>, la caja se esconde y queda la lista.",

    "fileUploadPage.basicTitle": "Con límites: tipos, tamaño y cantidad",

    "fileUploadPage.lede": "FileUpload adjunta archivos (un currículum, una factura, fotos) con un botón o soltándolos sobre la caja, y dice antes de elegir qué tipos y tamaños acepta. Lo elegido aparece en una lista debajo, y lo que no cumple se rechaza con su motivo.",
    "fileUploadPage.anatomyBody": "La caja (con su glifo, su instrucción y su ayuda), el conteo y la lista de archivos elegidos.",
    "fileUploadPage.anatomyLabel": "Anatomía de FileUpload",
    "fileUploadPage.anatomyPreviewLabel": "FileUpload, parte por parte",
    "fileUploadPage.pageDropLabel": "Soltar en cualquier parte del documento",

    "fileUploadPage.testVanilla1":
      'La dropzone es un <code class="sk-code">role="button"</code> real y tabulable, no decoración; el trigger es un botón nativo.',
    "fileUploadPage.testVanilla8":
      "Enter o Espacio sobre la dropzone abren el selector de archivos, no solo un click de mouse.",
    "fileUploadPage.testVanilla2":
      'Elegir un archivo válido emite <code class="sk-code">sk:fileuploadchange</code> con el archivo aceptado.',
    "fileUploadPage.testVanilla3":
      'Un archivo que excede el tamaño emite <code class="sk-code">sk:fileuploadchange</code> con el archivo rechazado en vez de aceptado.',
    "fileUploadPage.testVanilla4":
      "El botón de quitar se queda oculto hasta que se acepta un archivo, y aparece cuando eso pasa.",
    "fileUploadPage.testVanilla5":
      "Hacer click en el botón de quitar vacía los archivos aceptados y se vuelve a ocultar.",
    "fileUploadPage.testVanilla6": "Sin dropzone/input/trigger escritos a mano no hace nada, ni tira un error.",
    "fileUploadPage.testVanilla7": "Destruir el mount detiene la máquina y deja de emitir eventos.",

    "fileUploadPage.testReact1": "Anuncia el motivo del rechazo de un archivo en vez de fallar en silencio.",
    "fileUploadPage.testReact2": "Limpia el mensaje de rechazo en cuanto sigue una selección válida.",
    "fileUploadPage.guidelinesLede": "Di qué se acepta antes de que la persona elija, no después.",
    "fileUploadPage.dd.limits.title": "Acepta: dilo antes de elegir",
    "fileUploadPage.dd.limits.do": "El campo dice qué formatos, tamaño y cantidad admite antes de abrir el selector.",
    "fileUploadPage.dd.limits.dont": "Sin esa información, la persona elige a ciegas y descubre el rechazo después.",
    "fileUploadPage.dd.instruction.title": "Texto claro",
    "fileUploadPage.dd.instruction.do": "La caja usa una instrucción corta y directa.",
    "fileUploadPage.dd.instruction.dont": "«Subir» no dice dónde soltar ni qué acepta el campo.",
    "fileUploadPage.dd.trigger.title": "Botón claro",
    "fileUploadPage.dd.trigger.do": "El botón dice la acción real: abrir el selector de archivos.",
    "fileUploadPage.dd.trigger.dont": "«Continuar» suena a avanzar el flujo, no a elegir un archivo.",
  },
  en: {

    "demo.fileUpload.label": "Attachments",
    "demo.fileUpload.dropzone": "Drag files here",
    "demo.fileUpload.vagueDropzone": "Upload",
    "demo.fileUpload.vagueTrigger": "Continue",
    "demo.fileUpload.trigger": "Choose files",
    "demo.fileUpload.anatomyHint": "PDF or image, up to 10 MB",
    "demo.fileUpload.anatomyItem": "final-consolidated-report-2026.pdf",
    "demo.fileUpload.anatomyRemove": "Remove final-consolidated-report-2026.pdf",

    "demo.fileUpload.overlay": "Drop the files to attach them",

    "fileUploadPage.description": "Attaches files with a button or by dropping them, and says up front what it accepts.",

    "fileUploadPage.a11yKeyTab": "Moves through the button and each file's remove button.",

    "fileUploadPage.a11yKeyEnter": "With the button focused, opens the file picker.",

    "fileUploadPage.a11yYours2": "Announce rejections in text beside the field, not only with color.",

    "fileUploadPage.a11yYours1": "Name the field with a visible label.",

    "fileUploadPage.a11yDoes3": "The banner shown while dragging is <code>aria-hidden</code>: it answers a pointer gesture.",

    "fileUploadPage.a11yDoes2": "Each file in the list has a named remove button.",

    "fileUploadPage.a11yDoes1": "The button opens the system picker; dragging is a shortcut, not the only way.",

    "fileUploadPage.a11yIntro": "The real file input stays available: the box does not replace it.",

    "fileUploadPage.content3": "For each rejection, say what failed and what is accepted: “it is 8 MB; the maximum is 5 MB”.",

    "fileUploadPage.content2": "State the limits in the hint: “PDF or JPG, up to 5 MB”.",

    "fileUploadPage.content1": "Write the instruction with both ways: “Drop files here or choose from your device”.",

    "fileUploadPage.whenNot3": 'For the form\'s hint and error around it: wrap it in <a href="/components/form-field">FormField</a>.',

    "fileUploadPage.whenNot2": 'If the value is text, even from a file: use <a href="/components/input">Input</a>.',

    "fileUploadPage.whenNot1": "For a profile photo cropped on the spot: it needs its own flow.",

    "fileUploadPage.when3": "To drop onto a panel or the whole page: use <code>dropScope</code>.",

    "fileUploadPage.when2": "When drag and drop should work besides the button.",

    "fileUploadPage.when1": "To attach files: a resume, an invoice, photos.",

    "fileUploadPage.contract3": "The list goes below the box, not in its place, so the second file lands where the first did.",

    "fileUploadPage.contract2": "It uploads nothing: Vanilla emits <code>sk:fileuploadchange</code> and React delivers the accepted and rejected files.",

    "fileUploadPage.contract1": "Five optional limits: <code>accept</code>, <code>maxFileSize</code>, <code>minFileSize</code>, <code>maxTotalSize</code> and <code>maxFiles</code>. Each rejection states its reason.",

    "fileUploadPage.pageDropBody": 'With <code>dropScope="page"</code>, the whole document takes files, and <code>overlayLabel</code> shows the target while dragging. It sits in its own frame so this page does not become a target.',

    "fileUploadPage.pageDropTitle": "Drop anywhere on the page: dropScope",

    "fileUploadPage.basicBody": "The box says what it accepts. On reaching <code>maxFiles</code>, the box hides and the list remains.",

    "fileUploadPage.basicTitle": "With limits: types, size and count",

    "fileUploadPage.lede": "FileUpload attaches files (a resume, an invoice, photos) with a button or by dropping them on the box, and says before choosing which types and sizes it accepts. The chosen files appear in a list below, and anything that does not qualify is rejected with its reason.",
    "fileUploadPage.anatomyBody": "The box (with its glyph, instruction and hint), the count and the list of chosen files.",
    "fileUploadPage.anatomyLabel": "FileUpload anatomy",
    "fileUploadPage.anatomyPreviewLabel": "FileUpload, part by part",
    "fileUploadPage.pageDropLabel": "Dropping anywhere in the document",

    "fileUploadPage.testVanilla1":
      'The dropzone is a real, tabbable <code class="sk-code">role="button"</code>, not decoration; the trigger is a native button.',
    "fileUploadPage.testVanilla8":
      "Enter or Space on the dropzone opens the file picker, not just a pointer click.",
    "fileUploadPage.testVanilla2":
      'Choosing a valid file emits <code class="sk-code">sk:fileuploadchange</code> with it accepted.',
    "fileUploadPage.testVanilla3":
      'An oversized file emits <code class="sk-code">sk:fileuploadchange</code> with it rejected instead of accepted.',
    "fileUploadPage.testVanilla4":
      "The clear trigger stays hidden until a file is accepted, and shows once one is.",
    "fileUploadPage.testVanilla5":
      "Clicking the clear trigger empties the accepted files and re-hides itself.",
    "fileUploadPage.testVanilla6": "With no authored dropzone/input/trigger, it does nothing, without throwing.",
    "fileUploadPage.testVanilla7": "Destroying the mount stops the machine and it stops emitting events.",

    "fileUploadPage.testReact1": "Announces a rejected file's reason instead of failing silently.",
    "fileUploadPage.testReact2": "Clears the rejection message once a valid selection follows.",
    "fileUploadPage.guidelinesLede": "Say what is accepted before people choose, not after.",
    "fileUploadPage.dd.limits.title": "Accepted files: say before choosing",
    "fileUploadPage.dd.limits.do": "The field says which formats, sizes and quantities it accepts before opening the picker.",
    "fileUploadPage.dd.limits.dont": "Without that information, people choose blindly and only discover the rejection afterwards.",
    "fileUploadPage.dd.instruction.title": "Clear text",
    "fileUploadPage.dd.instruction.do": "The box uses a short, direct instruction.",
    "fileUploadPage.dd.instruction.dont": "“Upload” does not say where to drop or what the field accepts.",
    "fileUploadPage.dd.trigger.title": "Clear button",
    "fileUploadPage.dd.trigger.do": "The button names the real action: opening the file picker.",
    "fileUploadPage.dd.trigger.dont": "“Continue” sounds like moving forward, not choosing a file.",
  },
} as const;
