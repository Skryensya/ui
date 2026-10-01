export const footerMessages = {
  es: {
    "footer.anatomyLabel": "Anatomía de Footer",
    "footer.anatomyPreviewLabel": "Footer, parte por parte",
    "footer.anatomyBody": "El corchete es el landmark <code>&lt;footer&gt;</code> con su padding y su divisor; el anillo es la columna donde vive su contenido.",

    "demo.footer.colProduct": "Producto",
    "demo.footer.colResources": "Recursos",
    "demo.footer.colLegal": "Legal",
    "demo.footer.linkOverview": "Resumen",
    "demo.footer.linkChangelog": "Cambios",
    "demo.footer.linkDocs": "Documentación",
    "demo.footer.linkRepo": "Repositorio",
    "demo.footer.linkLicense": "Licencia",
    "demo.footer.linkPrivacy": "Privacidad",
    "demo.footer.legal": "© 2026 skryensya/ui",
    "demo.footer.built": "Compuesto a mano con skryensya/ui",
    "demo.footer.credit": "Sitio compuesto a mano con skryensya/ui.",
    "demo.footer.pageTitle": "Última sección",
    "demo.footer.pageBody": "El contenido termina acá; el pie empieza después y debe leerse como otra zona.",
    "demo.footer.newsletterTitle": "Recibe novedades y lanzamientos",
    "demo.footer.newsletterBody": "Un bloque promocional con texto largo hace que el pie compita con el contenido principal.",

    "footer.description": "Cierra la página con navegación secundaria, avisos legales o créditos.",

    "footer.a11yYours3": 'Cada columna de enlaces es un <a href="/es/nav-list">NavList</a> con nombre: una navegación sin nombre en la lista de landmarks confunde.',

    "footer.a11yYours2": 'No escribas <code>role="contentinfo"</code> a mano.',

    "footer.a11yYours1": "Pon a lo sumo un <code>&lt;footer&gt;</code> de documento por página.",

    "footer.a11yDoes2": "No agrega roles ni foco.",

    "footer.a11yDoes1": "El host es un <code>&lt;footer&gt;</code> real.",

    "footer.a11yIntro": "Un <code>&lt;footer&gt;</code> de documento es el landmark <code>contentinfo</code> sin escribir el rol.",

    "footer.content3": "Escribe el aviso legal en una línea: «© 2026 Empresa. Todos los derechos reservados.».",

    "footer.content2": "Usa enlaces de 1 a 3 palabras: «Precios», «Términos de uso».",

    "footer.content1": "Da nombre a cada columna de enlaces con un encabezado visible o un <code>aria-label</code>: «Producto», «Empresa».",

    "footer.dd.surface.dont": "Sobre el mismo fondo y sin borde, el crédito parece un párrafo más de la página.",

    "footer.dd.surface.do": "Con fondo hundido y un borde arriba, hasta un pie de una línea se lee como cierre.",

    "footer.dd.surface.title": "Superficie: marca el cierre",

    "footer.dd.scope.dont": "Si el pie suma promoción, explicación y navegación a la vez, deja de ser cierre y vuelve a abrir la página.",

    "footer.dd.scope.do": "Columnas de enlaces y una línea legal bastan: secundario, escaneable y al final.",

    "footer.dd.scope.title": "Alcance: navegación secundaria",

    "footer.whenNot3": "Si el pie tiene columnas, un boletín, una barra legal y créditos a la vez: saca lo que sobra a su propia región antes del pie.",

    "footer.whenNot2": 'Para una fila de botones al pie de un panel o un diálogo: usa <a href="/es/componentes/inline">Inline</a> dentro del contenedor.',

    "footer.whenNot1": 'Para separar una sección en medio de la página: usa <a href="/es/componentes/box">Box</a>.',

    "footer.when2": "Una vez por página, en un <code>&lt;footer&gt;</code> a nivel de documento.",

    "footer.when1": "Para cerrar la página con navegación secundaria, avisos legales o créditos.",

    "footer.contract3": "No trae slots para columnas ni para una barra inferior: la anatomía es tuya.",

    "footer.contract2": '<code>divider</code>, el borde superior, viene activado; <code>divider="false"</code> lo apaga.',

    "footer.contract1": "Usa un <code>&lt;footer&gt;</code> con <code>sk-footer</code>: a nivel de documento ya es el landmark <code>contentinfo</code>.",
    "footer.lede": "Footer cierra la página: la banda final con navegación secundaria, avisos legales o una línea de crédito. Trae su superficie, un borde arriba y espacio; lo que va adentro lo compones tú con Grid, NavList y Text.",
    "footer.patternSiteTitle": "Pie de sitio: columnas y aviso legal",
    "footer.patternSiteDescription": "Columnas de enlaces sobre una línea legal, dentro de un Wrapper a la medida de la página.",
    "footer.patternCreditTitle": "Línea de crédito: una sola línea",
    "footer.patternCreditDescription": "El cierre de una página personal o de un portafolio.",
    "footer.test1":
      "Por defecto emite el landmark <code>contentinfo</code> con la superficie hundida, el padding grande y el divisor superior que documenta el contrato.",
    "footer.test2":
      "El divisor, el padding y la superficie se pueden cambiar, y <code>as</code> deja de emitir el landmark cuando el footer va anidado dentro de otro elemento.",

    "footer.body":
      "Este sitio consume {core} y los paquetes de componentes por sus exports maps, con bundler, el mismo camino que documenta. Cada píxel sale de un token.",
    /* The section's title, separate from `label`: `label` is the LINK TEXT and is written as an action
       ("Report a problem on GitHub"), which as a heading would be giving an order to someone who may
       not have found any problem. The title asks; the link acts. */
    "footer.reportIssue.title": "¿Encontraste un problema?",
    "footer.reportIssue.label": "Reportar un problema en GitHub",
    /* A sentence that closes itself, without a colon: the control comes below and already announces
       itself with its own label, so the prose does not need to point at it. It used to start with
       "It opens on GitHub…", which referred backwards because the link came first. */
    "footer.reportIssue.description":
      "Si algo no anda como esperabas, el reporte ya lleva la página y tu navegador completados, y espacio para contar qué pasó.",
    /*
     * A lightweight bug footer, not a form: three concrete questions (what did you expect, what
     * happened, how to reproduce it) instead of the earlier "Describe the problem:", which left the
     * reporter to invent their own structure or, more often, give none. `{url}` is the only thing the
     * server can fill in; `{ua}`/`{viewport}` from `footer.reportIssue.environment` are filled in by
     * `report-issue.ts` in the browser, so they are left untouched here (they are never passed `vars`,
     * which is why `t()` leaves them as they are).
     */
    "footer.reportIssue.body":
      "**Página:** {url}\n\n**¿Qué esperabas que pasara?**\n\n\n**¿Qué pasó en cambio?**\n\n\n**Pasos para reproducirlo:**\n1. \n2. \n3. \n",
    /* Appended by `report-issue.ts` at the end of the body above, with JS only: the only thing the
       server cannot know. Without JS the body above is already a complete report on its own. */
    "footer.reportIssue.environment": "\n\n**Entorno:**\n- Navegador: {ua}\n- Tamaño de ventana: {viewport}",
    "footer.prop.surface.title": "Surface: cuánto se separa del contenido",
    "footer.prop.surface.body": "El fondo del pie respecto de la página.",
    "footer.prop.surface.none": "Usa <code>none</code> cuando el pie es una sola línea sobre el fondo de la página.",
    "footer.prop.surface.sunken": "Usa <code>sunken</code>, el valor por defecto, para separar el cierre sin una línea dura.",
    "footer.prop.surface.surface": "Usa <code>surface</code> cuando la página tiene un fondo hundido y el pie debe subir.",
    "footer.prop.surface.raised": "Usa <code>raised</code> para un pie que se lee como una tarjeta.",
    "footer.guidelinesLede": "Un pie dice «la página termina aquí» y ofrece adónde ir después.",
  },
  en: {
    "footer.anatomyLabel": "Footer anatomy",
    "footer.anatomyPreviewLabel": "Footer, part by part",
    "footer.anatomyBody": "The bracket is the <code>&lt;footer&gt;</code> landmark with its padding and divider; the ring is the column its content lives in.",

    "demo.footer.colProduct": "Product",
    "demo.footer.colResources": "Resources",
    "demo.footer.colLegal": "Legal",
    "demo.footer.linkOverview": "Overview",
    "demo.footer.linkChangelog": "Changelog",
    "demo.footer.linkDocs": "Documentation",
    "demo.footer.linkRepo": "Repository",
    "demo.footer.linkLicense": "License",
    "demo.footer.linkPrivacy": "Privacy",
    "demo.footer.legal": "© 2026 skryensya/ui",
    "demo.footer.built": "Hand-composed with skryensya/ui",
    "demo.footer.credit": "Site hand-composed with skryensya/ui.",
    "demo.footer.pageTitle": "Last section",
    "demo.footer.pageBody": "The content ends here; the footer starts after it and should read as another zone.",
    "demo.footer.newsletterTitle": "Get updates and releases",
    "demo.footer.newsletterBody": "A promotional block with long copy makes the footer compete with the main content.",

    "footer.description": "Closes the page with secondary navigation, legal notices or credits.",

    "footer.a11yYours3": 'Each link column is a named <a href="/nav-list">NavList</a>: an unnamed navigation in the landmark list confuses.',

    "footer.a11yYours2": 'Do not write <code>role="contentinfo"</code> by hand.',

    "footer.a11yYours1": "Put at most one document <code>&lt;footer&gt;</code> per page.",

    "footer.a11yDoes2": "It adds no roles and no focus.",

    "footer.a11yDoes1": "The host is a real <code>&lt;footer&gt;</code>.",

    "footer.a11yIntro": "A document <code>&lt;footer&gt;</code> is the <code>contentinfo</code> landmark without writing the role.",

    "footer.content3": "Write the legal notice in one line: “© 2026 Company. All rights reserved.”.",

    "footer.content2": "Use links of 1 to 3 words: “Pricing”, “Terms of use”.",

    "footer.content1": "Name each link column with a visible heading or an <code>aria-label</code>: “Product”, “Company”.",

    "footer.dd.surface.dont": "On the same background with no border, the credit reads like one more paragraph on the page.",

    "footer.dd.surface.do": "With a sunken background and a top border, even a one-line footer reads as the close.",

    "footer.dd.surface.title": "Surface: mark the close",

    "footer.dd.scope.dont": "If the footer adds promotion, explanation and navigation at once, it stops closing the page and opens it again.",

    "footer.dd.scope.do": "Link columns and one legal line are enough: secondary, scannable and at the end.",

    "footer.dd.scope.title": "Scope: secondary navigation",

    "footer.whenNot3": "If the footer has columns, a newsletter, a legal bar and credits at once: move the extra into its own region before the footer.",

    "footer.whenNot2": 'For a row of buttons at the bottom of a panel or dialog: use <a href="/components/inline">Inline</a> inside the container.',

    "footer.whenNot1": 'To separate a section mid-page: use <a href="/components/box">Box</a>.',

    "footer.when2": "Once per page, in a document-level <code>&lt;footer&gt;</code>.",

    "footer.when1": "To close the page with secondary navigation, legal notices or credits.",

    "footer.contract3": "It has no slots for columns or a bottom bar: the anatomy is yours.",

    "footer.contract2": '<code>divider</code>, the top border, is on; <code>divider="false"</code> turns it off.',

    "footer.contract1": "Use a <code>&lt;footer&gt;</code> with <code>sk-footer</code>: at document level it is already the <code>contentinfo</code> landmark.",
    "footer.lede": "Footer closes the page: the final band with secondary navigation, legal notices or a credit line. It brings its surface, a top border and space; what goes inside you compose with Grid, NavList and Text.",
    "footer.patternSiteTitle": "Site footer: columns and legal notice",
    "footer.patternSiteDescription": "Columns of links over a legal line, inside a Wrapper at the page's measure.",
    "footer.patternCreditTitle": "Credit line: a single line",
    "footer.patternCreditDescription": "The ending of a personal page or a portfolio.",
    "footer.test1":
      "Emits the <code>contentinfo</code> landmark by default, with the sunken surface, large padding and top divider the contract documents.",
    "footer.test2":
      "The divider, padding and surface can all be changed, and <code>as</code> drops the landmark when the footer is nested inside another element.",

    "footer.body":
      "This site consumes {core} and the component packages through their exports maps, with a bundler: the same path it documents. Every pixel comes from a token.",
    /* The section's title, kept apart from `label`: `label` is the LINK TEXT and is written as an
       action ("Report an issue on GitHub"), which as a heading would give an instruction to someone
       who may not have found a problem at all. The title asks; the link acts. */
    "footer.reportIssue.title": "Found a problem?",
    "footer.reportIssue.label": "Report an issue on GitHub",
    /* A sentence that closes itself, no colon: the control sits below and already announces itself
       with its own label, so the prose does not need to point at it. It used to open with "Opens on
       GitHub…", which pointed backwards because the link came first. */
    "footer.reportIssue.description":
      "If something is not working the way you expected, the report already has the page and your browser filled in, with room to describe what happened.",
    /* A light bug template, not a form: three concrete prompts (expected, actual, repro steps)
       instead of the old bare "Describe the issue:", which left a reporter to invent their own
       structure or, more often, skip one. `{url}` is what the server can fill; `{ua}`/`{viewport}`
       from `footer.reportIssue.environment` are filled by `report-issue.ts` in the browser, so they
       stay literal here (never passed as `vars`, which is why `t()` leaves them alone). */
    "footer.reportIssue.body":
      "**Page:** {url}\n\n**What did you expect to happen?**\n\n\n**What happened instead?**\n\n\n**Steps to reproduce:**\n1. \n2. \n3. \n",
    /* Appended by `report-issue.ts` to the end of the body above, JS only: the one thing the server
       cannot know. Without JS the body above is already a complete report on its own. */
    "footer.reportIssue.environment": "\n\n**Environment:**\n- Browser: {ua}\n- Window size: {viewport}",
    "footer.prop.surface.title": "Surface: how far it sets apart from the content",
    "footer.prop.surface.body": "The footer's background against the page.",
    "footer.prop.surface.none": "Use <code>none</code> when the footer is a single line on the page's background.",
    "footer.prop.surface.sunken": "Use <code>sunken</code>, the default, to set the ending apart without a hard line.",
    "footer.prop.surface.surface": "Use <code>surface</code> when the page has a sunken background and the footer should rise.",
    "footer.prop.surface.raised": "Use <code>raised</code> for a footer that reads as a card.",
    "footer.guidelinesLede": "A footer says “the page ends here” and offers where to go next.",
  },
} as const;
