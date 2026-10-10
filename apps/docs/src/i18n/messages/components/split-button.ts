export const splitButtonMessages = {
  es: {
    "demo.splitButton.action": "Guardar",
    "demo.splitButton.menuLabel": "Más opciones",
    "demo.splitButton.copy": "Guardar una copia",
    "demo.splitButton.template": "Guardar como plantilla",
    "demo.splitButton.subtlePrimary": "Archivar",
    "demo.splitButton.subtleMenuLabel": "Más opciones de archivado",
    "demo.splitButton.subtleItem1": "Archivar y silenciar",
    "demo.splitButton.subtleItem2": "Archivar todo el hilo",
    "demo.splitButton.overMediaPrimary": "Descargar",
    "demo.splitButton.overMediaMenuLabel": "Más opciones de descarga",
    "demo.splitButton.overMediaItem1": "Descargar en alta resolución",
    "demo.splitButton.overMediaItem2": "Descargar original",
    "demo.splitButton.ghostPrimary": "Compartir",
    "demo.splitButton.ghostMenuLabel": "Más opciones para compartir",
    "demo.splitButton.ghostItem1": "Copiar enlace",
    "demo.splitButton.ghostItem2": "Compartir por correo",
    "demo.splitButton.dangerPrimary": "Eliminar",
    "demo.splitButton.dangerMenuLabel": "Más opciones de eliminación",
    "demo.splitButton.dangerItem1": "Eliminar permanentemente",
    "demo.splitButton.dangerItem2": "Mover a la papelera",
    "demo.splitButton.zoomLabel": "Zoom",
    "demo.splitButton.zoomIn": "Acercar",
    "demo.splitButton.zoomOut": "Alejar",

    "splitButtonPage.description": "Pone la acción más común a un clic y sus variantes en un menú al lado.",

    "splitButtonPage.key.arrows": "Dentro del menú, recorre las variantes.",

    "splitButtonPage.key.run": "Ejecuta la acción, o abre el menú.",

    "splitButtonPage.key.tab": "Pasa de la acción al botón del menú.",

    "splitButtonPage.a11yYours1": "El botón del menú solo muestra una flecha: dale <code>aria-label</code>.",

    "splitButtonPage.a11yDoes2": "El segundo abre un Menu y anuncia <code>aria-haspopup</code> y <code>aria-expanded</code>.",

    "splitButtonPage.a11yDoes1": "La acción es un <code>&lt;button&gt;</code> que ejecuta.",

    "splitButtonPage.a11yIntro": "SplitButton son dos botones con un nombre cada uno.",

    "splitButtonPage.content3": 'Nombra el botón del menú: <code>aria-label="Más opciones de guardado"</code>.',

    "splitButtonPage.content2": "Escribe las variantes del menú partiendo del mismo verbo: «Guardar como…», «Guardar una copia».",

    "splitButtonPage.content1": "Escribe la acción con un verbo: «Guardar», «Exportar».",

    "splitButtonPage.whenNot3": 'Si ninguna acción domina: usa un <a href="/es/componentes/menu">Menu</a> con un botón «Acciones».',

    "splitButtonPage.whenNot2": 'Si hay una sola acción: usa <a href="/es/componentes/button">Button</a>.',

    "splitButtonPage.whenNot1": 'Si las acciones no son variantes de lo mismo: usa <a href="/es/componentes/menu">Menu</a>.',

    "splitButtonPage.when1": "Cuando casi todos quieren una acción y unos pocos una variante: Guardar y Guardar como.",

    "splitButtonPage.contract3": "Elegir en el menú ejecuta esa variante; no reemplaza la acción principal.",

    "splitButtonPage.contract2": "El menú es un Menu completo, con su teclado.",

    "splitButtonPage.contract1": "Las dos mitades llevan la misma variante y el mismo tamaño: se leen como un solo control.",

    "splitButtonPage.mainBody": "La acción de la izquierda no cambia al elegir en el menú.",
    "splitButtonPage.verticalTitle": "Vertical: acercar y alejar",
    "splitButtonPage.verticalBody": "Dos botones soldados en vertical, sin menú ni lógica propia.",

    "splitButtonPage.mainTitle": "Principal: Guardar y sus variantes",

    "splitButtonPage.lede": "SplitButton pone la acción más común a un clic y sus variantes en un menú al lado: Guardar y Guardar como, Exportar y sus formatos. Son dos botones soldados: uno ejecuta y el otro abre las alternativas.",
    "splitButtonPage.anatomyBody":
      "Este diagrama nombra el grupo soldado, el Button de acción y el trigger del Menu. El espécimen está congelado; los SplitButton vivos empiezan abajo.",
    "splitButtonPage.anatomyLabel": "Anatomía de SplitButton",
    "splitButtonPage.anatomyPreviewLabel": "SplitButton, parte por parte",

    "splitButtonPage.testReact1":
      "Renderiza un grupo con nombre que contiene el botón de acción y el trigger icon-only del menú.",
    "splitButtonPage.testReact2":
      'Al hacer click en el botón de acción dispara <code class="sk-code">onClick</code>, independiente del menú.',
    "splitButtonPage.testReact3":
      'Abre el menú de fallback desde su trigger y selecciona un item, disparando <code class="sk-code">onSelect</code>.',
    "splitButtonPage.testReact4": "disabled deshabilita el botón de acción y el trigger del menú juntos.",
    "splitButtonPage.testReact6":
      'El trigger de fallback empareja su <code class="sk-code">variant</code>/<code class="sk-code">size</code> y forma (icon-only, soldado) con el botón de acción.',
    "splitButtonPage.testReact5":
      "Una acción y un menu compuestos a mano se renderizan tal cual, en vez del fallback de props planas.",
    "splitButtonPage.smallTitle": "Pequeño: las dos mitades juntas",
    "splitButtonPage.smallBody": "<code>size</code> en la acción y <code>triggerSize</code> en el menú, con el mismo valor.",
    "splitButtonPage.subtleTitle": "Subtle: una acción de menos énfasis",
    "splitButtonPage.subtleBody": "Archivar, junto a una acción principal que ya existe en la vista.",
    "splitButtonPage.overMediaTitle": "Soft: sobre una foto",
    "splitButtonPage.overMediaBody": "Descargar, sobre la portada donde vive la acción.",
    "splitButtonPage.ghostTitle": "Ghost: sin borde",
    "splitButtonPage.ghostBody": "Compartir, opcional y casi invisible en reposo.",
    "splitButtonPage.dangerTitle": "Danger: una acción destructiva",
    "splitButtonPage.dangerBody": "Eliminar, con sus variantes en el menú.",
    "splitButtonPage.guidelinesLede": "Una acción a un clic y sus variantes a dos: sirve cuando casi todos quieren la primera.",
  },
  en: {
    "demo.splitButton.action": "Save",
    "demo.splitButton.menuLabel": "More options",
    "demo.splitButton.copy": "Save a copy",
    "demo.splitButton.template": "Save as template",
    "demo.splitButton.subtlePrimary": "Archive",
    "demo.splitButton.subtleMenuLabel": "More archive options",
    "demo.splitButton.subtleItem1": "Archive and mute",
    "demo.splitButton.subtleItem2": "Archive whole thread",
    "demo.splitButton.overMediaPrimary": "Download",
    "demo.splitButton.overMediaMenuLabel": "More download options",
    "demo.splitButton.overMediaItem1": "Download in high resolution",
    "demo.splitButton.overMediaItem2": "Download original",
    "demo.splitButton.ghostPrimary": "Share",
    "demo.splitButton.ghostMenuLabel": "More sharing options",
    "demo.splitButton.ghostItem1": "Copy link",
    "demo.splitButton.ghostItem2": "Share by email",
    "demo.splitButton.dangerPrimary": "Delete",
    "demo.splitButton.dangerMenuLabel": "More deletion options",
    "demo.splitButton.dangerItem1": "Delete permanently",
    "demo.splitButton.dangerItem2": "Move to trash",
    "demo.splitButton.zoomLabel": "Zoom",
    "demo.splitButton.zoomIn": "Zoom in",
    "demo.splitButton.zoomOut": "Zoom out",

    "splitButtonPage.description": "Puts the most common action one click away and its variants in a menu beside it.",

    "splitButtonPage.key.arrows": "Inside the menu, moves through the variants.",

    "splitButtonPage.key.run": "Runs the action, or opens the menu.",

    "splitButtonPage.key.tab": "Moves from the action to the menu button.",

    "splitButtonPage.a11yYours1": "The menu button only shows an arrow: give it an <code>aria-label</code>.",

    "splitButtonPage.a11yDoes2": "The second opens a Menu and announces <code>aria-haspopup</code> and <code>aria-expanded</code>.",

    "splitButtonPage.a11yDoes1": "The action is a <code>&lt;button&gt;</code> that runs.",

    "splitButtonPage.a11yIntro": "SplitButton is two buttons, each with a name.",

    "splitButtonPage.content3": 'Name the menu button: <code>aria-label="More save options"</code>.',

    "splitButtonPage.content2": "Write the menu's variants starting from the same verb: “Save as…”, “Save a copy”.",

    "splitButtonPage.content1": "Write the action with a verb: “Save”, “Export”.",

    "splitButtonPage.whenNot3": 'If no action dominates: use a <a href="/components/menu">Menu</a> with an “Actions” button.',

    "splitButtonPage.whenNot2": 'If there is a single action: use <a href="/components/button">Button</a>.',

    "splitButtonPage.whenNot1": 'If the actions are not variants of the same thing: use <a href="/components/menu">Menu</a>.',

    "splitButtonPage.when1": "When almost everyone wants one action and a few a variant: Save and Save as.",

    "splitButtonPage.contract3": "Choosing in the menu runs that variant; it does not replace the main action.",

    "splitButtonPage.contract2": "The menu is a full Menu, with its keyboard.",

    "splitButtonPage.contract1": "Both halves carry the same variant and size: they read as one control.",

    "splitButtonPage.mainBody": "The left action does not change when choosing in the menu.",
    "splitButtonPage.verticalTitle": "Vertical: zoom in and out",
    "splitButtonPage.verticalBody": "Two buttons welded vertically, without a menu or built-in behavior.",

    "splitButtonPage.mainTitle": "Main: Save and its variants",

    "splitButtonPage.lede": "SplitButton puts the most common action one click away and its variants in a menu beside it: Save and Save as, Export and its formats. It is two joined buttons: one runs and the other opens the alternatives.",
    "splitButtonPage.anatomyBody":
      "This diagram names the welded group, the action Button and the Menu trigger. The specimen is frozen; the live SplitButtons begin below.",
    "splitButtonPage.anatomyLabel": "SplitButton anatomy",
    "splitButtonPage.anatomyPreviewLabel": "SplitButton, part by part",

    "splitButtonPage.testReact1":
      "Renders a labelled group holding the action button and the menu's icon-only trigger.",
    "splitButtonPage.testReact2":
      'Clicking the action button fires <code class="sk-code">onClick</code>, independent of the menu.',
    "splitButtonPage.testReact3":
      'Opens the fallback menu from its trigger and selects an item, firing <code class="sk-code">onSelect</code>.',
    "splitButtonPage.testReact4": "disabled disables both the action button and the menu trigger together.",
    "splitButtonPage.testReact6":
      'The fallback trigger pairs its <code class="sk-code">variant</code>/<code class="sk-code">size</code> and shape (icon-only, welded) with the action button.',
    "splitButtonPage.testReact5":
      "A hand-composed action and menu render verbatim instead of the flat-prop fallback.",
    "splitButtonPage.smallTitle": "Small: both halves together",
    "splitButtonPage.smallBody": "<code>size</code> on the action and <code>triggerSize</code> on the menu, with the same value.",
    "splitButtonPage.subtleTitle": "Subtle: a lower-emphasis action",
    "splitButtonPage.subtleBody": "Archive, beside a main action already in the view.",
    "splitButtonPage.overMediaTitle": "Soft: over a photo",
    "splitButtonPage.overMediaBody": "Download, over the cover where the action lives.",
    "splitButtonPage.ghostTitle": "Ghost: no border",
    "splitButtonPage.ghostBody": "Share, optional and nearly invisible at rest.",
    "splitButtonPage.dangerTitle": "Danger: a destructive action",
    "splitButtonPage.dangerBody": "Delete, with its variants in the menu.",
    "splitButtonPage.guidelinesLede": "One action a click away and its variants two away: it helps when almost everyone wants the first.",
  },
} as const;
