export const iconMessages = {
  es: {
    "iconPage.anatomyLabel": "Anatomía de Icon",
    "iconPage.anatomyPreviewLabel": "Icon, parte por parte",
    "iconPage.anatomyBody": "Una parte por glifo. Lo que se escribe es un <code>&lt;span data-sk-icon&gt;</code>; lo que se dibuja, y se nombra acá, es el <code>&lt;svg class=\"sk-icon\"&gt;</code> que lo reemplaza al montar.",

    "iconPage.description":
      "Icon: el pattern sk-icon en React y vanilla, con roles del vocabulario, geometría propia, tamaños y a11y en el call site.",
    "iconPage.lede":
      'Cómo pones un icono en pantalla: <code>&lt;Icon&gt;</code> en React, <code>data-sk-icon</code> + <code>mountIcons</code> en vanilla, o el <code>&lt;svg class="sk-icon"&gt;</code> a mano. El vocabulario de roles, los sets como marca y por qué el CSS no toca fill/stroke viven en <a href="/es/iconos">Iconografía</a>.',
    "iconPage.reactTitle": "React",
    "iconPage.reactBody1":
      "<code>Icon</code> toma <code>name</code> <strong>o</strong> <code>data</code>, nunca los dos. <code>name</code> es un rol portable que sobrevive un cambio de set; <code>data</code> es geometría tuya, acoplada a propósito y visible en el call site.",
    "iconPage.reactNote": "React renderiza (decisión 14)",
    "iconPage.reactBody2":
      '<code>&lt;Icon name="…"&gt;</code> dibuja sin configuración: Lucide viaja con <code>@skryensya/react</code>. Para otro set, lo instalas y envuelves la app una vez.',
    "iconPage.providerNote": "Lucide/Material son opt-in",
    "iconPage.providerLabel": "cambiar el set por defecto",
    "iconPage.vanillaTitle": "Vanilla: hidratar por nombre, o escribir el markup",
    "iconPage.vanillaBody1":
      "<code>mountIcons(root, set)</code> reemplaza un placeholder con el <strong>nombre</strong> del rol por el mismo <code>&lt;svg class=\"sk-icon\"&gt;</code> que escribirías a mano. El set es siempre explícito; para dos sets en una página, hidratas cada subárbol con el suyo.",
    "iconPage.vanillaHydrateNote": "escribes el nombre, no el <svg>",
    "iconPage.vanillaBindLabel": "una vez, al arrancar",
    "iconPage.vanillaBindNote": "mountIcons no lo llama initComponents()",
    "iconPage.vanillaBody2":
      "Un <code>data-sk-icon</code> que el set no cubre se deja intacto y se avisa: la geometría del <strong>proyecto</strong> no es un rol, y se escribe como <code>&lt;svg&gt;</code> propio.",
    "iconPage.vanillaRawLabel": "geometría propia, a mano",
    "iconPage.vanillaRawNote": "para un dibujo que ningún set tiene",
    "iconPage.a11yItem1":
      "<strong>Sin <code>label</code> el icono es decorativo</strong>, lleva <code>aria-hidden=\"true\"</code>. Es el caso normal: en un botón con texto, el texto ya nombra la acción.",
    "iconPage.a11yItem2":
      '<strong>En un botón de solo icono, el nombre accesible es del botón</strong> (<code>aria-label="Cerrar diálogo"</code>), no del <code>&lt;svg&gt;</code>. El icono adentro sigue decorativo.',
    "iconPage.a11yItem3":
      "<strong>Con <code>label</code> el icono es contenido</strong>, <code>role=\"img\"</code> más <code>aria-label</code>. Solo cuando el icono se para solo y significa algo por sí mismo.",
    "iconPage.a11yItem4": "<code>focusable=\"false\"</code> siempre: un <code>&lt;svg&gt;</code> no es un tab stop.",
    "iconPage.sizeTitle": "Tamaño",
    "iconPage.sizeBody":
      "Tres valores de <strong>un</strong> hook. <code>--sk-icon-size</code> es invariante a densidad: la densidad es espaciado; un icono es contenido al lado de un glifo: si el texto no encoge, el icono tampoco.",
    "iconPage.sizeLabel": "Icon · sm / md / lg",
    "iconPage.sizeNote": "no hay prop numérica",
    "iconPage.prop.size.title": "Tamaño",
    "iconPage.prop.size.body": "<code>size</code> elige uno de los tres tamaños del sistema.",
    "iconPage.prop.size.sm": "Usa <code>sm</code> junto a texto pequeño o metadatos.",
    "iconPage.prop.size.md": "Usa <code>md</code> como tamaño normal.",
    "iconPage.prop.size.lg": "Usa <code>lg</code> cuando el icono necesita más presencia.",
    "iconPage.showcaseTitle": "Showcases",
    "iconPage.showcaseBody": "Icon cubre roles estables, tamaño y accesibilidad en el lugar de uso.",
    "iconPage.vocabularyTitle": "Vocabulario",
    "iconPage.vocabularyBody": "Los nombres son roles estables, no el nombre del dibujo de un set concreto.",
    "iconPage.customSizeTitle": "Tamaño personalizado",
    "iconPage.customSizeBody": "Si necesitas otro tamaño, redefine el hook CSS en el contexto que lo necesita.",
    "iconPage.customSizeLabel": "tamaño arbitrario",
    "iconPage.guidelinesLede": "Usa iconos para apoyar texto o para contenido que tenga un nombre accesible claro.",
    "iconPage.dd.decorative.title": "Decorativo por defecto",
    "iconPage.dd.decorative.do": "Deja decorativos los iconos que acompañan un texto visible.",
    "iconPage.dd.decorative.dont": "No conviertas cada icono en contenido si ya hay texto que nombra la acción.",
    "iconPage.dd.size.title": "Tamaño consistente",
    "iconPage.dd.size.do": "Usa los tamaños nombrados para mantener ritmo con el texto.",
    "iconPage.dd.size.dont": "No mezcles tamaños grandes sólo para llamar la atención.",
    "iconPage.test1": "Resuelve un nombre estable contra el set enlazado.",
    "iconPage.test2": "Renderiza geometría propia del proyecto sin ningún binding.",
    "iconPage.test3": "Es decorativo sin un label, y es contenido con uno.",
  },
  en: {
    "iconPage.anatomyLabel": "Icon anatomy",
    "iconPage.anatomyPreviewLabel": "Icon, part by part",
    "iconPage.anatomyBody": "One part per glyph. What you author is a <code>&lt;span data-sk-icon&gt;</code>; what gets drawn, and is named here, is the <code>&lt;svg class=\"sk-icon\"&gt;</code> that replaces it on mount.",

    "iconPage.description":
      "Icon: the sk-icon pattern in React and vanilla, with vocabulary roles, your own geometry, sizes, and a11y at the call site.",
    "iconPage.lede":
      'How you put an icon on screen: <code>&lt;Icon&gt;</code> in React, <code>data-sk-icon</code> + <code>mountIcons</code> in vanilla, or a hand-written <code>&lt;svg class="sk-icon"&gt;</code>. The role vocabulary, sets as a brand choice, and why the CSS never touches fill/stroke live in <a href="/icons">Iconography</a>.',
    "iconPage.reactTitle": "React",
    "iconPage.reactBody1":
      "<code>Icon</code> takes <code>name</code> <strong>or</strong> <code>data</code>, never both. <code>name</code> is a portable role that survives a set change; <code>data</code> is your own geometry, deliberately coupled and visible at the call site.",
    "iconPage.reactNote": "React renders it (decision 14)",
    "iconPage.reactBody2":
      '<code>&lt;Icon name="…"&gt;</code> draws with no configuration: Lucide ships with <code>@skryensya/react</code>. For a different set, install it and wrap the app once.',
    "iconPage.providerNote": "Lucide/Material are opt-in",
    "iconPage.providerLabel": "switching the default set",
    "iconPage.vanillaTitle": "Vanilla: hydrate by name, or write the markup",
    "iconPage.vanillaBody1":
      "<code>mountIcons(root, set)</code> replaces a placeholder carrying the role's <strong>name</strong> with the same <code>&lt;svg class=\"sk-icon\"&gt;</code> you would write by hand. The set is always explicit; for two sets on one page, hydrate each subtree with its own.",
    "iconPage.vanillaHydrateNote": "you write the name, not the <svg>",
    "iconPage.vanillaBindLabel": "once, at startup",
    "iconPage.vanillaBindNote": "mountIcons does not call initComponents()",
    "iconPage.vanillaBody2":
      "A <code>data-sk-icon</code> the set does not cover is left untouched, with a warning: the <strong>project's</strong> own geometry is not a role, and gets written as its own <code>&lt;svg&gt;</code>.",
    "iconPage.vanillaRawLabel": "your own geometry, by hand",
    "iconPage.vanillaRawNote": "for a drawing no set has",
    "iconPage.a11yItem1":
      "<strong>With no <code>label</code> the icon is decorative</strong>, carrying <code>aria-hidden=\"true\"</code>. This is the normal case: in a button with text, the text already names the action.",
    "iconPage.a11yItem2":
      '<strong>In an icon-only button, the accessible name belongs to the button</strong> (<code>aria-label="Close dialog"</code>), not the <code>&lt;svg&gt;</code>. The icon inside stays decorative.',
    "iconPage.a11yItem3":
      "<strong>With a <code>label</code> the icon is content</strong>, <code>role=\"img\"</code> plus <code>aria-label</code>. Only when the icon stands alone and means something on its own.",
    "iconPage.a11yItem4": "<code>focusable=\"false\"</code> always: an <code>&lt;svg&gt;</code> is not a tab stop.",
    "iconPage.sizeTitle": "Size",
    "iconPage.sizeBody":
      "Three values off <strong>one</strong> hook. <code>--sk-icon-size</code> is invariant to density: density is spacing; an icon is content beside a glyph: if the text does not shrink, neither does the icon.",
    "iconPage.sizeLabel": "Icon · sm / md / lg",
    "iconPage.sizeNote": "no numeric prop",
    "iconPage.prop.size.title": "Size",
    "iconPage.prop.size.body": "<code>size</code> chooses one of the three system sizes.",
    "iconPage.prop.size.sm": "Use <code>sm</code> beside small text or metadata.",
    "iconPage.prop.size.md": "Use <code>md</code> as the normal size.",
    "iconPage.prop.size.lg": "Use <code>lg</code> when the icon needs more presence.",
    "iconPage.showcaseTitle": "Showcases",
    "iconPage.showcaseBody": "Icon covers stable roles, size, and accessibility at the call site.",
    "iconPage.vocabularyTitle": "Vocabulary",
    "iconPage.vocabularyBody": "Names are stable roles, not the drawing name from one set.",
    "iconPage.customSizeTitle": "Custom size",
    "iconPage.customSizeBody": "If you need another size, redefine the CSS hook in the context that needs it.",
    "iconPage.customSizeLabel": "arbitrary size",
    "iconPage.guidelinesLede": "Use icons to support text, or as content with a clear accessible name.",
    "iconPage.dd.decorative.title": "Decorative by default",
    "iconPage.dd.decorative.do": "Keep icons decorative when visible text already names the action.",
    "iconPage.dd.decorative.dont": "Do not make every icon content when text already names the action.",
    "iconPage.dd.size.title": "Consistent size",
    "iconPage.dd.size.do": "Use named sizes to keep rhythm with text.",
    "iconPage.dd.size.dont": "Do not mix large sizes just to draw attention.",
    "iconPage.test1": "Resolves a stable name against the bound set.",
    "iconPage.test2": "Renders project geometry without any binding.",
    "iconPage.test3": "Is decorative without a label, and content with one.",
  },
} as const;
