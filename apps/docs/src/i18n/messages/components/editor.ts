export const editorMessages = {
  es: {
    "demo.editor.titleValue": "Informe mensual",
    "demo.editor.titleLabel": "Título",
    "demo.editor.placeholder": "Escribe algo…",
    "demo.editor.label": "Contenido",

    "editorPage.description": "Un campo de texto con formato: negrita, listas, títulos, enlaces.",

    "editorPage.a11yKeyTab": "Sale de la superficie hacia el control siguiente.",

    "editorPage.a11yKeyUndo": "Deshace el último cambio.",

    "editorPage.a11yKeyItalic": "Aplica o quita cursiva.",

    "editorPage.a11yKeyBold": "Aplica o quita negrita.",

    "editorPage.a11yYours2": "No dependas del formato para decir algo: un lector de pantalla puede no anunciar la negrita.",

    "editorPage.a11yYours1": "Debe tener una etiqueta visible.",

    "editorPage.a11yDoes3": "Cada botón de la barra anuncia su estado con <code>aria-pressed</code>.",

    "editorPage.a11yDoes2": "Dentro de un FormField, hereda su <code>id</code>, <code>aria-describedby</code> y <code>aria-invalid</code>.",

    "editorPage.a11yDoes1": 'La superficie es <code>role="textbox"</code> con <code>aria-multiline="true"</code>.',

    "editorPage.a11yIntro": "La superficie es un campo de texto multilínea; la barra, una toolbar con foco itinerante.",

    "editorPage.content3": "Traduce <code>toolbarLabel</code>: es el nombre de la barra, «Formato de texto».",

    "editorPage.content2": "Usa un placeholder que sugiera el contenido: «Escribe la descripción del proyecto».",

    "editorPage.content1": "Nombra el campo por lo que se escribe: «Descripción», «Comentario».",

    "editorPage.dd.format.dont": "Un título de una línea no necesita una barra de formato: usa Input.",

    "editorPage.dd.format.do": "Una descripción larga aprovecha títulos y listas.",

    "editorPage.dd.format.title": "Formato: solo donde hace falta",

    "editorPage.whenNot3": "Para código: usa un editor de código o un Textarea con fuente monoespaciada.",

    "editorPage.whenNot2": 'Para varias líneas sin formato: usa un Textarea de <a href="/es/componentes/input">Input</a>.',

    "editorPage.whenNot1": 'Para una línea de texto: usa <a href="/es/componentes/input">Input</a>.',

    "editorPage.when2": "Cuando la barra de formato debe venir lista, sin componerla a mano.",

    "editorPage.when1": "Para texto con formato: una descripción, un artículo, un comentario largo.",

    "editorPage.contract3": "El motor (<code>@skryensya/editor</code>) es una dependencia opcional: ningún otro componente instala ProseMirror.",

    "editorPage.contract2": "El valor inicial es <code>defaultValue</code>, un HTML: no hay <code>value</code> controlado.",

    "editorPage.contract1": "Cada cambio entrega <code>html</code>, <code>markdown</code> y <code>doc</code> a la vez. El subrayado no tiene sintaxis en CommonMark, así que en Markdown se pierde.",

    "editorPage.defaultBody": "Negrita, cursiva, subrayado, enlaces, títulos, listas, citas y código, con deshacer y rehacer.",

    "editorPage.defaultTitle": "Un documento: la barra completa",

    "editorPage.prop.toolbarCompact.true": "Usa <code>true</code> para un comentario o un campo dentro de un panel angosto.",

    "editorPage.prop.toolbarCompact.false": "Usa <code>false</code> para un documento, donde el editor ocupa el centro de la pantalla.",

    "editorPage.prop.toolbarCompact.body": "Reduce el relleno y la separación de la barra; los botones son los mismos.",

    "editorPage.prop.toolbarCompact.title": "Toolbar compact: la barra en poco espacio",
    "editorPage.lede": "Editor es un campo de texto con formato, para cuando el texto necesita negrita, listas, títulos, citas o enlaces: una descripción, un artículo, un comentario largo. Trae su barra de formato lista y entrega el contenido en HTML, Markdown y como documento de ProseMirror.",
    "editorPage.anatomyBody": "La raíz, la barra, un botón de formato, la superficie y el input oculto que envía el valor.",
    "editorPage.anatomyLabel": "Anatomía de Editor",
    "editorPage.anatomyPreviewLabel": "Editor, parte por parte",
    "editorPage.compactTitle": "Un comentario: la barra compacta",
    "editorPage.compactBody": "La misma barra con menos espacio, para un campo corto.",
    "editorPage.guidelinesLede": "El formato sirve cuando el texto es largo y tiene estructura.",
  },
  en: {
    "demo.editor.titleValue": "Monthly report",
    "demo.editor.titleLabel": "Title",
    "demo.editor.placeholder": "Write something…",
    "demo.editor.label": "Content",

    "editorPage.description": "A text field with formatting: bold, lists, headings, links.",

    "editorPage.a11yKeyTab": "Leaves the surface for the next control.",

    "editorPage.a11yKeyUndo": "Undoes the last change.",

    "editorPage.a11yKeyItalic": "Toggles italic.",

    "editorPage.a11yKeyBold": "Toggles bold.",

    "editorPage.a11yYours2": "Do not rely on formatting to say something: a screen reader may not announce bold.",

    "editorPage.a11yYours1": "It must have a visible label.",

    "editorPage.a11yDoes3": "Each toolbar button announces its state with <code>aria-pressed</code>.",

    "editorPage.a11yDoes2": "Inside a FormField, it inherits its <code>id</code>, <code>aria-describedby</code> and <code>aria-invalid</code>.",

    "editorPage.a11yDoes1": 'The surface is <code>role="textbox"</code> with <code>aria-multiline="true"</code>.',

    "editorPage.a11yIntro": "The surface is a multiline text field; the toolbar is a toolbar with roving focus.",

    "editorPage.content3": "Translate <code>toolbarLabel</code>: it is the toolbar's name, “Text formatting”.",

    "editorPage.content2": "Use a placeholder that suggests the content: “Write the project's description”.",

    "editorPage.content1": "Name the field by what is written: “Description”, “Comment”.",

    "editorPage.dd.format.dont": "A one-line title needs no formatting toolbar: use Input.",

    "editorPage.dd.format.do": "A long description makes use of headings and lists.",

    "editorPage.dd.format.title": "Formatting: only where needed",

    "editorPage.whenNot3": "For code: use a code editor or a Textarea with a monospace font.",

    "editorPage.whenNot2": 'For several lines with no formatting: use <a href="/components/input">Input</a>\'s Textarea.',

    "editorPage.whenNot1": 'For one line of text: use <a href="/components/input">Input</a>.',

    "editorPage.when2": "When the formatting toolbar should come ready, without composing it by hand.",

    "editorPage.when1": "For formatted text: a description, an article, a long comment.",

    "editorPage.contract3": "The engine (<code>@skryensya/editor</code>) is an optional dependency: no other component installs ProseMirror.",

    "editorPage.contract2": "The initial value is <code>defaultValue</code>, an HTML string: there is no controlled <code>value</code>.",

    "editorPage.contract1": "Each change delivers <code>html</code>, <code>markdown</code> and <code>doc</code> at once. Underline has no CommonMark syntax, so it is lost in Markdown.",

    "editorPage.defaultBody": "Bold, italic, underline, links, headings, lists, quotes and code, with undo and redo.",

    "editorPage.defaultTitle": "A document: the full toolbar",

    "editorPage.prop.toolbarCompact.true": "Use <code>true</code> for a comment or a field inside a narrow panel.",

    "editorPage.prop.toolbarCompact.false": "Use <code>false</code> for a document, where the editor takes the middle of the screen.",

    "editorPage.prop.toolbarCompact.body": "Reduces the toolbar's padding and gap; the buttons stay the same.",

    "editorPage.prop.toolbarCompact.title": "Toolbar compact: the bar in little space",
    "editorPage.lede": "Editor is a text field with formatting, for when text needs bold, lists, headings, quotes or links: a description, an article, a long comment. It ships its formatting toolbar and delivers the content as HTML, Markdown and a ProseMirror document.",
    "editorPage.anatomyBody": "The root, the toolbar, a format button, the surface and the hidden input that submits the value.",
    "editorPage.anatomyLabel": "Editor anatomy",
    "editorPage.anatomyPreviewLabel": "Editor, part by part",
    "editorPage.compactTitle": "A comment: the compact toolbar",
    "editorPage.compactBody": "The same toolbar with less space, for a short field.",
    "editorPage.guidelinesLede": "Formatting helps when the text is long and has structure.",
  },
} as const;
