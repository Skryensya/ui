import { isPausedRoute } from "@skryensya/core/paused";
import { hasTranslation, localizePath, navLabel, useTranslations, type Locale } from "../i18n";
import { slugify } from "./document-index";

/** Maturity of a component's contract. Only meaningful within `componentItems`. */
export type ComponentStatus = "wip" | "stable";

export type NavigationItem = {
  href: string;
  label: string;
  aliases?: readonly string[];
  todo?: boolean;
  /**
   * Maturity of the component this entry documents. Omitted defaults to "wip" (the honest state
   * of every entry in this catalog today) via {@link componentStatus}. Flip an entry to "stable"
   * once its contract has actually settled; never the reverse, an entry does not go back to "wip"
   * once it has shipped as settled.
   */
  status?: ComponentStatus;
  /**
   * This entry leaves the site, so it opens in a new tab.
   *
   * NO ENTRY HAS THIS TODAY. It is for a destination that is a different app on a different ORIGIN,
   * where a same-tab navigation drops the reader out of the docs with the back button as their only
   * way home.
   *
   * It is a FLAG rather than a `startsWith("http")` test at each render site, because "absolute URL"
   * and "leaves this site" are not the same fact: a deployment may put both apps behind one host,
   * and the sniff would then get it wrong in the quiet direction. The three places that render an item (the header nav in
   * `Base.astro`, `SiteFooter.astro` and `DrawerNav.astro`) all read this.
   *
   * `rel="noopener noreferrer"` travels with it, and no separate "opens in a new tab" text: that is
   * what every other external link in this site's prose already does.
   */
  external?: boolean;
  /**
   * Short trailing text next to the label, the same word `nav-list.ts`'s own `trailing` slot uses
   * ("a count, a badge"). Not `status`: that field is a maturity axis nothing downstream renders
   * yet, and wiring it up now would light up every "wip" entry in the catalog at once, not just the
   * one page asking for a callout. This is deliberately per-entry and opt-in instead.
   */
  trailing?: string;
};

/** `item.status`, defaulted: every catalog entry reads "wip" until deliberately marked "stable". */
export function componentStatus(item: NavigationItem): ComponentStatus {
  return item.status ?? "wip";
}

export type NavigationGroup = {
  /**
   * Stable identity, independent of language, like a section's `id`: the key a renderer keeps a group's
   * open/closed state under (`sessionStorage`) and the hook a script finds its copies by. Optional because
   * most groups have never needed one.
   */
  id?: string;
  group: string;
  /** Short task-oriented explanation used by catalog section headers. */
  blurb?: string;
  /** A platform-native fallback: discoverable, but visually and structurally below the enhanced route. */
  secondary?: boolean;
  /**
   * The group opens and closes: a renderer shows its label as a disclosure button over its items instead of
   * a plain label. Whether to do it is the DATA's call, not the renderer's: a renderer never decides it from
   * a group's name. The component catalog sets it (a hundred entries are too many to show at once); the
   * foundations, which are a short reading path, do not.
   */
  collapsible?: boolean;
  /**
   * Whether a collapsible group starts open. Absent, it starts open only when it holds the current page
   * (a long catalog: the reader sees where they are and nothing else). `true` opens it on arrival whatever the
   * page (a short reading path, where hiding a group would hide a step of it). The reader's own open/closed
   * choice still wins over it on later visits.
   */
  defaultOpen?: boolean;
  items: readonly NavigationItem[];
};

export type NavigationSection = {
  /**
   * Stable identity, independent of language. The layout picks sections out of this list to decide
   * which rail a page belongs to; matching on the visible title would have made that lookup fail the
   * moment the title was translated.
   */
  id: NavigationSectionId;
  section: string;
  href?: string;
  blurb: string;
  /**
   * The rail draws this one short caption over the section INSTEAD of its title and blurb: the categories
   * speak for themselves and need only to be named as a set. The section keeps its own name for assistive
   * tech (the landmark's label) and for everything else that lists sections. An i18n key.
   */
  caption?: string;
  groups: readonly NavigationGroup[];
};

export type NavigationSectionId = "foundations" | "components" | "catalog" | "templates";

/** Component inventory. The catalog groups this single source by task below. */
const componentItems = [
  {
    href: "/components/accordion",
    label: "Accordion",
    aliases: [
      "acordeón",
      "acordeon",
      "tarjeta expandible",
      "tarjeta desplegable",
      "expandable tile",
      "expansible tile",
      "expandabletile",
      "details",
      "summary",
      "details nativo",
      "acordeón nativo",
      "acordeon nativo",
      "disclosure",
    ],
  },
  {
    href: "/components/annotation",
    label: "Annotation",
    aliases: [
      "anotación",
      "anotacion",
      "anotaciones",
      "anatomía",
      "anatomia",
      "anatomy",
      "diagrama",
      "diagrama de composición",
      "diagram",
      "callout",
      "leader line",
      "línea guía",
      "linea guia",
      "etiqueta",
      "label",
      "partes",
      "parts",
    ],
  },
  {
    href: "/components/canvas",
    label: "Canvas",
    aliases: [
      "lienzo",
      "paneo",
      "pan",
      "zoom",
      "visor",
      "pan and zoom",
      "zoomable view",
      "diagrama grande",
      "plano",
    ],
  },
  {
    href: "/components/diagram",
    label: "Diagram",
    aliases: [
      "diagrama",
      "diagrama de flujo",
      "flowchart",
      "flujo",
      "flow",
      "nodos",
      "nodes",
      "aristas",
      "edges",
      "flecha",
      "arrow",
      "conector",
      "connector",
      "árbol de decisión",
      "arbol de decision",
      "decision tree",
      "máquina de estados",
      "maquina de estados",
      "state machine",
      "state diagram",
      "grafo",
      "graph",
      "mermaid",
      "proceso",
      "process",
      "workflow",
      "actividad",
      "activity",
      "uml",
      "modelo",
      "model",
      "entidad relación",
      "entidad relacion",
      "er",
      "lógica",
      "logica",
      "logic",
      "organigrama",
    ],
  },
  { href: "/components/avatar", label: "Avatar", aliases: ["perfil"] },
  {
    href: "/components/expressive-avatar",
    label: "Expressive Avatar",
    trailing: "Beta",
    aliases: [
      "avatar expresivo",
      "expressive avatar",
      "avatar interactivo",
      "reactive avatar",
      "avatar con expresiones",
      "avatar pixel",
    ],
  },
  { href: "/components/badge", label: "Badge", aliases: ["insignia"] },
  {
    href: "/components/back-to-top",
    label: "BackToTop",
    aliases: [
      "volver arriba",
      "ir arriba",
      "subir",
      "scroll to top",
      "scroll top",
      "back to top",
      "return to top",
      "botón flotante",
      "boton flotante",
      "fab",
    ],
  },
  { href: "/components/box", label: "Box", aliases: ["caja"] },
  {
    href: "/components/tile",
    label: "Tile",
    aliases: [
      "baldosa",
      "superficie interactiva",
      "interactive surface",
      "tile link",
      "tile button",
      "tile checkbox",
      "expandable tile",
    ],
  },
  {
    href: "/components/footer",
    label: "Footer",
    aliases: ["pie", "pie de pagina", "pie de página", "contentinfo", "colofón", "colofon"],
  },
  { href: "/components/hero", label: "Hero", trailing: "Beta", aliases: ["portada", "landing"] },
  {
    href: "/components/button",
    label: "Button",
    aliases: [
      "botón",
      "boton",
      "tile button",
      "botón de superficie",
      "boton de superficie",
      "tarjeta botón",
      "tarjeta boton",
    ],
  },
  { href: "/components/callout", label: "Callout", aliases: ["alerta", "nota", "aviso"] },
  {
    href: "/components/card",
    label: "Card",
    aliases: [
      "tarjeta",
      "tarjetas",
      "card de contenido",
      "card de noticia",
      "card de producto",
      "card de enlace",
      "stat card",
      "tarjeta de contenido",
      "tarjeta de noticia",
      "tarjeta de producto",
      "tarjeta de enlace",
    ],
  },
  {
    href: "/components/carousel",
    label: "Carousel",
    aliases: [
      "carrusel",
      "carousel",
      "slider de contenido",
      "scroll snap",
      "scroll-snap",
      "slides",
      "diapositivas",
      "galería",
      "galeria",
      "secciones desplazables",
      "scrollable sections",
      "scroll-button",
      "scroll-marker",
    ],
  },
  {
    href: "/components/charts",
    label: "Charts",
    aliases: [
      "chart",
      "charts",
      "gráfico",
      "grafico",
      "gráficos",
      "graficos",
      "gráfica",
      "grafica",
      "visualización de datos",
      "visualizacion de datos",
      "data viz",
      "barras",
      "bar chart",
      "líneas",
      "lineas",
      "line chart",
      "área",
      "area chart",
      "tanstack charts",
    ],
  },
  {
    href: "/components/checkbox",
    label: "Checkbox",
    aliases: [
      "casilla",
      "casilla de verificación",
      "casilla de verificacion",
      "tile checkbox",
      "checkbox de superficie",
      "tarjeta seleccionable",
      "tarjeta casilla",
    ],
  },
  {
    href: "/components/changelog",
    label: "Changelog",
    aliases: [
      "changelog",
      "historial",
      "cambios",
      "release notes",
      "notas de versión",
      "notas de version",
      "novedades",
    ],
  },
  {
    href: "/components/code-preview",
    label: "CodePreview",
    aliases: ["shiki", "código", "codigo", "code block", "preview de código", "preview de codigo"],
  },
  {
    href: "/components/command-palette",
    label: "CommandPalette",
    aliases: [
      "cmdk",
      "command palette",
      "paleta de comandos",
      "buscar",
      "search",
      "⌘k",
      "ctrl+k",
    ],
  },


  {
    href: "/components/data-grid",
    label: "Data Grid",
    aliases: ["grilla de datos", "layout grid", "grilla de layout", "navegación 2d", "navegacion 2d"],
  },
  {
    href: "/components/clipboard",
    label: "Clipboard",
    aliases: ["copy button", "copybutton", "copiar", "portapapeles", "copy to clipboard", "copy link"],
  },
  {
    href: "/components/dialog",
    label: "Dialog",
    aliases: ["diálogo", "dialogo", "modal", "confirm", "dialog vaul", "dialog enhanced"],
  },
  {
    href: "/components/drawer",
    label: "Drawer",
    aliases: ["panel lateral", "cajón", "cajon"],
  },
  {
    href: "/components/fade-edge",
    label: "FadeEdge",
    aliases: ["fade out", "fade-out", "mask", "gradient fade", "fade effect", "fade visual"],
  },
  {
    href: "/components/presence",
    label: "Presence",
    aliases: ["animate presence", "exit animation", "animación de salida", "animacion de salida", "unmount", "transition"],
  },
  {
    href: "/components/feed",
    label: "Feed",
    aliases: ["stream", "feed de actividad", "publicaciones", "posts"],
  },
  {
    href: "/components/form-field",
    label: "FormField",
    aliases: [
      "form field",
      "field",
      "campo",
      "campo de formulario",
      "rótulo",
      "rotulo",
      "label",
      "hint",
      "ayuda",
      "error",
      "mensaje de error",
      "validación",
      "validacion",
      "required",
      "requerido",
    ],
  },
  {
    href: "/components/grid",
    label: "Grid",
    aliases: ["grilla", "cuadrícula", "cuadricula"],
  },
  {
    href: "/components/layout-grid",
    label: "Layout Grid",
    aliases: [
      "layout grid",
      "ancho de contenido",
      "content width",
      "breakout",
      "full-width",
      "full bleed",
      "sangrado",
    ],
  },
  { href: "/components/heading", label: "Heading", aliases: ["encabezado", "título", "titulo"] },
  { href: "/hotkey", label: "Hotkey", aliases: ["atajo", "atajos", "keyboard shortcut"] },
  {
    href: "/components/icon",
    label: "Icon",
    aliases: ["icono", "ícono", "icono componente", "sk-icon", "mountIcons"],
  },
  {
    href: "/components/image-frame",
    label: "ImageFrame",
    aliases: [
      "img",
      "image",
      "images",
      "imagen",
      "imagenes",
      "imágenes",
      "foto",
      "fotos",
      "picture",
      "marco",
      "frame",
      "media",
      "object-fit",
      "object-position",
      "aspect-ratio",
      "ratio",
    ],
  },
  {
    href: "/components/sticker",
    label: "Sticker",
    aliases: ["sticker", "calcomanía", "calcomania", "pegatina", "die-cut", "troquelado", "decal", "peel", "despegar"],
  },
  {
    href: "/components/lightbox",
    label: "Lightbox",
    aliases: [
      "visor de imágenes",
      "visor de imagenes",
      "image viewer",
      "galería",
      "galeria",
      "gallery",
      "fotos",
      "zoom",
      "ampliar imagen",
      "photo viewer",
    ],
  },
  { href: "/components/inline", label: "Inline", aliases: ["en línea", "en linea"] },
  { href: "/components/input", label: "Input", aliases: ["entrada", "campo"] },
  { href: "/components/kbd", label: "Kbd", aliases: ["tecla", "teclado"] },
  {
    href: "/components/link",
    label: "Link",
    aliases: ["enlace", "vínculo", "vinculo", "tile link", "enlace de superficie", "tarjeta enlace"],
  },
  {
    href: "/components/listbox",
    label: "Listbox",
    aliases: ["lista de opciones", "list box", "lista seleccionable", "selección múltiple", "multi select", "multiselect"],
  },
  {
    href: "/components/list",
    label: "List",
    aliases: [
      "lista",
      "list",
      "listado",
      "lista de ajustes",
      "settings list",
      "list item",
      "row list",
      "filas",
    ],
  },
  {
    href: "/components/loader",
    label: "Loader",
    aliases: ["carga", "cargando", "spinner", "indicador de carga"],
  },
  {
    href: "/components/message",
    label: "Message",
    aliases: ["mensaje", "chat", "conversación", "conversacion", "burbuja de chat", "assistant message"],
  },
  {
    href: "/components/meter",
    label: "Meter",
    aliases: ["medidor", "medición", "medicion", "batería", "bateria", "uso de disco"],
  },
  {
    href: "/components/rating",
    label: "Rating",
    aliases: ["puntuación", "puntuacion", "estrellas", "valoración", "valoracion", "reseña", "resena", "calificación", "calificacion"],
  },
  {
    href: "/nav-list",
    label: "Nav list",
    aliases: ["lista de navegación", "lista de navegacion"],
  },
  { href: "/components/navbar", label: "Navbar", aliases: ["barra de navegación", "barra de navegacion"] },
  { href: "/components/pagination", label: "Pagination", aliases: ["paginación", "paginacion"] },
  {
    href: "/components/placeholder",
    label: "Placeholder",
    aliases: ["skeleton", "esqueleto", "contenido provisional", "cargando contenido"],
  },
  {
    href: "/components/questionnaire",
    label: "Questionnaire",
    aliases: ["cuestionario", "encuesta", "survey", "formulario por pasos", "wizard", "preguntas"],
  },
  {
    href: "/components/comparison-table",
    label: "ComparisonTable",
    aliases: [
      "tabla comparativa",
      "comparación",
      "comparacion",
      "comparar",
      "versus",
      "vs",
      "cuándo usar",
      "cuando usar",
      "planes",
      "lado a lado",
      "side by side",
    ],
  },
  {
    href: "/components/description-list",
    label: "DescriptionList",
    aliases: [
      "lista de definiciones",
      "lista de descripción",
      "lista de descripcion",
      "definition list",
      "dl",
      "metadatos",
      "metadata",
      "ficha",
      "resumen",
      "pares nombre valor",
      "specs",
    ],
  },
  {
    href: "/components/separator",
    label: "Separator",
    aliases: [
      "separador",
      "divisor",
      "divider",
      "hr",
      "regla",
      "línea divisoria",
      "linea divisoria",
      "quiebre temático",
      "quiebre tematico",
      "o divider",
    ],
  },
  {
    href: "/components/tags-input",
    label: "TagsInput",
    aliases: [
      "campo de etiquetas",
      "etiquetas",
      "tags",
      "chips",
      "tokens",
      "multivalor",
      "destinatarios",
      "palabras clave",
      "keywords",
    ],
  },
  {
    href: "/components/quote",
    label: "Quote",
    aliases: [
      "cita",
      "citas",
      "blockquote",
      "quote",
      "testimonio",
      "testimonial",
      "pull quote",
      "frase destacada",
      "epígrafe",
      "epigrafe",
    ],
  },
  {
    href: "/components/timeline",
    label: "Timeline",
    aliases: [
      "timeline",
      "línea de tiempo",
      "linea de tiempo",
      "seguimiento",
      "actividad",
      "activity",
      "event history",
      "cronología",
      "cronologia",
    ],
  },
  {
    href: "/components/procedure",
    label: "Procedure",
    aliases: [
      "lista de instrucciones",
      "lista ordenada",
      "procedimiento",
      "how-to",
      "pasos estáticos",
      "pasos estaticos",
      "process list",
      "ol",
    ],
  },
  { href: "/components/progress", label: "Progress", aliases: ["progreso"] },
  {
    href: "/components/qr-code",
    label: "QRCode",
    aliases: [
      "qr",
      "qr code",
      "código qr",
      "codigo qr",
      "quick response",
      "quick response code",
      "quick read code",
      "código de respuesta rápida",
      "codigo de respuesta rapida",
      "código bidi",
      "codigo bidi",
      "2d barcode",
      "código de barras 2d",
      "codigo de barras 2d",
      "escanear",
      "scan",
      "escaneable",
      "enlace escaneable",
    ],
  },
  {
    href: "/components/radio-group",
    label: "RadioGroup",
    aliases: [
      "grupo de opciones",
      "botones de radio",
      "tile radio group",
      "radio group de superficie",
      "grupo de tarjetas",
      "tarjetas de opción",
      "tarjetas de opcion",
    ],
  },
  {
    href: "/scrollbar",
    label: "Scrollbar",
    aliases: ["scroll", "rail", "thumb", "sk-scrollbar", "reveal scrollbar", "scrollbar custom"],
  },
  { href: "/components/segmented", label: "SegmentedControl", aliases: ["control segmentado"] },
  {
    href: "/components/select",
    label: "Select",
    aliases: [
      "selector",
      "select enhanced",
      "select nativo",
      "native select",
      "select de plataforma",
      "selector nativo",
    ],
  },
  { href: "/components/sidebar", label: "Sidebar", aliases: ["barra lateral"] },
  {
    href: "/components/skip-link",
    label: "SkipLink",
    aliases: [
      "saltar",
      "salto",
      "enlace de salto",
      "skip link",
      "skip to content",
      "skip navigation",
      "bypass blocks",
      "wcag 2.4.1",
      "accesibilidad teclado",
    ],
  },
  { href: "/components/slider", label: "Slider", aliases: ["deslizador"] },
  { href: "/components/stack", label: "Stack", aliases: ["pila"] },
  { href: "/components/stat", label: "Stat", aliases: ["estadística", "estadistica", "métrica", "metrica"] },
  { href: "/components/steps", label: "Steps", aliases: ["pasos"] },
  { href: "/components/state-button", label: "StateButton", aliases: ["botón de estados", "boton de estados", "botón multi-estado", "boton multi-estado"] },
  { href: "/components/switch", label: "Switch", aliases: ["interruptor"] },
  { href: "/components/table", label: "Table", aliases: ["tabla"] },
  {
    href: "/components/table-pager",
    label: "TablePager",
    aliases: ["paginar tabla", "tabla paginada", "paginated table", "table pagination", "filas por página", "rows per page"],
  },
  {
    href: "/components/treegrid",
    label: "Treegrid",
    aliases: ["grilla jerárquica", "grilla jerarquica", "tabla jerárquica", "tabla jerarquica", "explorador de archivos"],
  },
  { href: "/components/tabs", label: "Tabs", aliases: ["pestañas", "pestanas"] },
  { href: "/components/tag", label: "Tag", aliases: ["etiqueta"] },
  { href: "/components/text", label: "Text", aliases: ["texto"] },
  {
    href: "/components/toast",
    label: "Toast",
    aliases: ["notificación", "notificacion", "aviso transitorio"],
  },
  { href: "/components/tooltip", label: "Tooltip", aliases: ["globo", "ayuda contextual", "descripción", "descripcion", "hint"] },
  {
    href: "/components/window",
    label: "Window",
    aliases: [
      "ventana",
      "ventana flotante",
      "panel flotante",
      "floating panel",
      "floating window",
      "paleta de herramientas",
      "inspector",
      "arrastrable",
      "draggable",
      "redimensionable",
      "resizable",
    ],
  },
  {
    href: "/components/tour",
    label: "Tour",
    aliases: [
      "tour guiado",
      "recorrido guiado",
      "recorrido",
      "guided tour",
      "product tour",
      "onboarding",
      "walkthrough",
      "coach marks",
      "spotlight",
    ],
  },
  {
    href: "/components/toc",
    label: "Table of contents",
    aliases: [
      "toc",
      "tabla de contenidos",
      "table of contents",
      "en esta página",
      "en esta pagina",
      "on this page",
      "índice",
      "indice",
      "scroll spy",
      "rail derecho",
    ],
  },
  {
    href: "/components/user-select",
    label: "UserSelect",
    aliases: [
      "selector de usuarios",
      "seleccionar personas",
      "assignees",
      "reviewers",
      "collaborators",
      "people picker",
      "person select",
      "multi-select de personas",
    ],
  },
  { href: "/vaul", label: "Vaul", aliases: ["drawer pattern", "sheet"] },
  { href: "/components/wrapper", label: "Wrapper", aliases: ["container", "contenedor", "envoltorio"] },
  {
    href: "/components/app-shell",
    label: "AppShell",
    aliases: ["app shell", "page shell", "layout", "frame", "marco", "main", "esqueleto de página", "shell de aplicación"],
  },
  {
    href: "/components/breadcrumb",
    label: "Breadcrumb",
    aliases: ["migas de pan", "ruta jerárquica", "ruta jerarquica"],
  },
  {
    href: "/components/combobox",
    label: "Combobox",
    aliases: ["autocompletar", "autocomplete", "selector editable"],
  },
  {
    href: "/components/comment-thread",
    label: "CommentThread",
    aliases: ["hilo de comentarios", "comentarios", "respuestas anidadas", "comment thread"],
  },
  {
    href: "/components/date-picker",
    label: "DatePicker",
    aliases: ["fecha", "selector de fecha", "date range", "campo de fecha"],
  },
  {
    href: "/components/color-picker",
    label: "ColorPicker",
    aliases: ["selector de color", "color picker", "swatch", "rgb", "hsl", "oklch", "presets de color"],
  },
  {
    href: "/components/calendar",
    label: "Calendar",
    aliases: ["calendario", "grid de fecha", "mes", "vista de año", "década"],
  },
  {
    href: "/components/empty-state",
    label: "EmptyState",
    aliases: ["estado vacío", "estado vacio", "sin resultados"],
  },
  {
    href: "/components/editor",
    label: "Editor",
    aliases: ["editor de texto enriquecido", "wysiwyg", "rich text", "prosemirror", "editor de contenido"],
  },
  {
    href: "/components/folder",
    label: "Folder",
    aliases: ["carpeta", "folder", "pestaña", "pestana", "tab surface", "pila de carpetas"],
  },
  {
    href: "/components/file-upload",
    label: "FileUpload",
    aliases: ["subir archivo", "carga de archivos", "dropzone"],
  },
  {
    href: "/components/megamenu",
    label: "Megamenu",
    aliases: ["mega menu", "megamenú", "panel de navegación", "navegación borde a borde"],
  },
  {
    href: "/components/marquee",
    label: "Marquee",
    aliases: ["marquesina", "ticker", "cinta continua", "scrolling text", "logo wall"],
  },
  {
    href: "/components/media-overlay",
    label: "MediaOverlay",
    aliases: ["gradient", "gradients", "gradientes", "media gradient", "media-overlay", "media overlay", "media caption", "contraste sobre imagen", "text on image", "texto sobre imagen", "wash", "velo", "scrim"],
  },
  {
    href: "/components/menu",
    label: "Menu",
    aliases: ["menú", "menu de acciones", "context menu"],
  },
  {
    href: "/components/app-bar",
    label: "AppBar",
    aliases: ["barra de aplicación", "barra de aplicacion", "app bar", "barra superior", "top bar", "menu bar macos", "barra de menús de escritorio"],
  },
  {
    href: "/components/menubar",
    label: "Menubar",
    aliases: ["barra de menú", "barra de menu", "menubar-editor"],
  },
  {
    href: "/components/number-field",
    label: "NumberField",
    aliases: ["campo numérico", "campo numerico", "stepper"],
  },
  {
    href: "/components/otp-input",
    label: "OtpInput",
    aliases: ["código de verificación", "codigo de verificacion", "otp", "pin", "pin input", "one-time code", "2fa", "código sms"],
  },
  {
    href: "/components/password-input",
    label: "PasswordInput",
    aliases: ["contraseña", "contrasena", "password", "mostrar contraseña", "show password", "clave"],
  },
  {
    /*
     * POPUP'S SEARCH WORDS LIVE HERE. Popup was a second page for `Popover.bare`, and merging it
     * into this one would have made the word "popup" stop finding anything: the rail is also the
     * search index. As aliases they still land the reader on the section, which is where the
     * content went. The route itself 301s onto the same heading.
     */
    href: "/components/popover",
    label: "Popover",
    aliases: [
      "contenido flotante",
      "ayuda rica",
      "top layer",
      "popup",
      "popup primitivo",
      "superficie flotante",
      "popover bare",
      "bare",
    ],
  },
  {
    href: "/components/split-button",
    label: "SplitButton",
    aliases: ["botón dividido", "boton dividido", "acción con menú"],
  },
  {
    href: "/components/time-field",
    label: "TimeField",
    aliases: [
      "hora",
      "campo de hora",
      "time input",
      "selector de hora",
      "time picker",
      "campo segmentado",
      "segmented input",
    ],
  },
  {
    href: "/components/toolbar",
    label: "Toolbar",
    aliases: ["barra de herramientas", "grupo de controles"],
  },
  {
    href: "/components/tree-view",
    label: "TreeView",
    aliases: ["árbol", "arbol", "jerarquía", "jerarquia"],
  },
] as const satisfies readonly NavigationItem[];

type ComponentHref = (typeof componentItems)[number]["href"];

const componentItemByHref = Object.fromEntries(
  componentItems.map((item) => [item.href, item] as const),
) satisfies Record<string, NavigationItem>;

const componentGroupItems = (...hrefs: readonly ComponentHref[]): readonly NavigationItem[] =>
  hrefs
    .map((href) => {
      const item = componentItemByHref[href];
      if (!item) throw new Error(`Unknown component catalog entry: ${href}`);
      return item;
    })
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

/*
 * TWELVE CATEGORIES, in the order a reader goes looking: what you DO, what you FILL IN, where you GO, what
 * you READ, how it is SET, who it IS, what HOLDS content, what TELLS you, what sits ON TOP, how it is
 * ARRANGED, what is SEEN, and what is left over. Every entry belongs to exactly one category; the check
 * below enforces it. Inside a category the order is alphabetical, applied at the end (`componentGroupItems`
 * sorts the source, and `getNavigation` sorts again by the LOCALISED label, which is what a reader sees).
 *
 * AUTHORED IN FULL, PUBLISHED FILTERED. This table is the whole inventory, paused entries included,
 * because the invariant below is about authorship: every entry belongs to exactly one category, and a
 * table that quietly dropped some could not say that. `componentNavigation` under it is what the
 * site actually renders. A paused entry (DataGrid) and a dev-only one (Annotation) keep a category here
 * for that reason, and are filtered out below.
 *
 * Where a piece could sit in two places it sits where a reader would look first: ExpressiveAvatar with
 * Avatar (an identity, not a picture), Message with the other things that hold content (a turn of a
 * conversation), TreeView with Surfaces & Collections (a collection, not a way to navigate), Hotkey with
 * the utilities (it is a behaviour, not a control).
 */
const allComponentNavigation = [
  {
    id: "actions",
    group: "group.componentActions",
    blurb: "group.componentActions.blurb",
    items: componentGroupItems(
      "/components/app-bar",
      "/components/button",
      "/components/clipboard",
      "/components/command-palette",
      "/components/menu",
      "/components/menubar",
      "/components/split-button",
      "/components/state-button",
      "/components/toolbar",
    ),
  },
  {
    id: "forms",
    group: "group.componentForms",
    blurb: "group.componentForms.blurb",
    items: componentGroupItems(
      "/components/calendar",
      "/components/checkbox",
      "/components/color-picker",
      "/components/combobox",
      "/components/date-picker",
      "/components/editor",
      "/components/file-upload",
      "/components/form-field",
      "/components/input",
      "/components/listbox",
      "/components/number-field",
      "/components/otp-input",
      "/components/password-input",
      "/components/questionnaire",
      "/components/radio-group",
      "/components/segmented",
      "/components/select",
      "/components/slider",
      "/components/switch",
      "/components/tags-input",
      "/components/time-field",
      "/components/user-select",
    ),
  },
  {
    id: "navigation",
    group: "group.componentNavigation",
    blurb: "group.componentNavigation.blurb",
    items: componentGroupItems(
      "/components/back-to-top",
      "/components/breadcrumb",
      "/components/link",
      "/components/megamenu",
      "/components/navbar",
      "/nav-list",
      "/components/pagination",
      "/components/sidebar",
      "/components/skip-link",
      "/components/steps",
      "/components/tabs",
      "/components/toc",
    ),
  },
  {
    id: "data",
    group: "group.componentData",
    blurb: "group.componentData.blurb",
    items: componentGroupItems(
      "/components/charts",
      "/components/comparison-table",
      "/components/data-grid",
      "/components/description-list",
      "/components/meter",
      "/components/rating",
      "/components/stat",
      "/components/table",
      "/components/table-pager",
      "/components/treegrid",
    ),
  },
  {
    id: "typography",
    group: "group.componentTypography",
    blurb: "group.componentTypography.blurb",
    items: componentGroupItems(
      "/components/code-preview",
      "/components/heading",
      "/components/kbd",
      "/components/quote",
      "/components/text",
    ),
  },
  {
    id: "identity",
    group: "group.componentIdentity",
    blurb: "group.componentIdentity.blurb",
    items: componentGroupItems(
      "/components/avatar",
      "/components/badge",
      "/components/expressive-avatar",
      "/components/icon",
      "/components/tag",
    ),
  },
  {
    id: "surfaces",
    group: "group.componentSurfaces",
    blurb: "group.componentSurfaces.blurb",
    items: componentGroupItems(
      "/components/accordion",
      "/components/card",
      "/components/changelog",
      "/components/comment-thread",
      "/components/feed",
      "/components/folder",
      "/components/list",
      "/components/message",
      "/components/procedure",
      "/components/tile",
      "/components/timeline",
      "/components/tree-view",
    ),
  },
  {
    id: "feedback",
    group: "group.componentFeedback",
    blurb: "group.componentFeedback.blurb",
    items: componentGroupItems(
      "/components/callout",
      "/components/empty-state",
      "/components/loader",
      "/components/placeholder",
      "/components/progress",
      "/components/toast",
    ),
  },
  {
    id: "overlays",
    group: "group.componentOverlays",
    blurb: "group.componentOverlays.blurb",
    items: componentGroupItems(
      "/components/dialog",
      "/components/drawer",
      "/components/popover",
      "/components/tooltip",
      "/components/tour",
      "/vaul",
      "/components/window",
    ),
  },
  {
    id: "layout",
    group: "group.componentLayout",
    blurb: "group.componentLayout.blurb",
    items: componentGroupItems(
      "/components/app-shell",
      "/components/box",
      "/components/footer",
      "/components/grid",
      "/components/hero",
      "/components/inline",
      "/components/layout-grid",
      "/components/separator",
      "/components/stack",
      "/components/wrapper",
    ),
  },
  {
    id: "media",
    group: "group.componentMedia",
    blurb: "group.componentMedia.blurb",
    items: componentGroupItems(
      "/components/annotation",
      "/components/canvas",
      "/components/carousel",
      "/components/diagram",
      "/components/image-frame",
      "/components/lightbox",
      "/components/marquee",
      "/components/media-overlay",
      "/components/qr-code",
      "/components/sticker",
    ),
  },
  {
    id: "utilities",
    group: "group.componentUtilities",
    blurb: "group.componentUtilities.blurb",
    items: componentGroupItems(
      "/components/fade-edge",
      "/hotkey",
      "/components/presence",
      "/scrollbar",
    ),
  },
] satisfies readonly NavigationGroup[];

const categorizedComponentHrefs = allComponentNavigation.flatMap((group) =>
  group.items.map((item) => item.href),
);
if (
  categorizedComponentHrefs.length !== componentItems.length ||
  new Set(categorizedComponentHrefs).size !== componentItems.length
) {
  throw new Error("Every component catalog entry must belong to exactly one category");
}

/*
 * THE CATALOGUE AS THE SITE OFFERS IT: the table above minus whatever is paused.
 *
 * ONE FILTER REACHES EVERY SURFACE, which is the reason it lives here and not in each renderer.
 * `getNavigation` builds the sidebar, the component index and the landing page from this list. A
 * paused component leaves those surfaces together, which is what "hidden" has to mean for a paused
 * contract. A separate dev-only list below can still feed the command palette for docs-internal
 * pages that should stay out of the rails.
 *
 * WHAT DOES NOT CHANGE: the page itself. `/components/data-grid` still builds, still renders its
 * demos, still runs its gates, and still answers to anyone holding the link. Pausing removes the
 * places that OFFER a component, never the component. The list is `@skryensya/core/paused`, and
 * deleting an entry there puts the page back in every rail at once.
 *
 * An emptied group disappears rather than rendering as a heading over nothing.
 */
const devCommandPaletteOnlyComponentHrefs = new Set<ComponentHref>([
  "/components/annotation",
]);

const visibleGroup = (group: NavigationGroup): NavigationGroup => ({
  ...group,
  items: group.items.filter(
    (item) =>
      !isPausedRoute(item.href) &&
      !devCommandPaletteOnlyComponentHrefs.has(item.href as ComponentHref),
  ),
});

export const componentNavigation = allComponentNavigation
  .map(visibleGroup)
  .filter((group) => group.items.length > 0) satisfies readonly NavigationGroup[];

export const devCommandPaletteOnlyComponentNavigation = allComponentNavigation
  .map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        !isPausedRoute(item.href) &&
        devCommandPaletteOnlyComponentHrefs.has(item.href as ComponentHref),
    ),
  }))
  .filter((group) => group.items.length > 0) satisfies readonly NavigationGroup[];

/*
 * The authored table below carries UI KEYS in `section`, `blurb` and `group`, not Spanish prose:
 * `getNavigation(locale)` resolves them. Item labels stay as authored, because most of them are
 * component names and identical in every language; the ones that are actually Spanish words are
 * overridden per locale in `i18n/ui.ts` (`navLabel`), keyed by href.
 */
/*
 * THE MAKER (apps/maker) runs on the machine of whoever builds pages with it, so the gallery's
 * "Open in Maker" link points at it only where one is known to exist: PUBLIC_MAKER_URL when set, the
 * Maker's dev address in development, and nowhere (no link at all) on a build that names none.
 */
export const makerUrl: string | null =
  import.meta.env.PUBLIC_MAKER_URL ?? (import.meta.env.DEV ? "http://localhost:4200/" : null);

/*
 * THE TWO STORYBOOKS (apps/storybook-react, apps/storybook-vanilla) are separate deployed apps: each
 * base is null where none is known to exist, rather than a bare path that 404s on a topology that
 * does not put every app behind one host.
 */
export const storybookReactUrl: string | null =
  import.meta.env.PUBLIC_STORYBOOK_REACT_URL ??
  (import.meta.env.DEV ? "http://localhost:6006/" : null);

export const storybookVanillaUrl: string | null =
  import.meta.env.PUBLIC_STORYBOOK_VANILLA_URL ??
  (import.meta.env.DEV ? "http://localhost:6007/" : null);

/*
 * ONE EXAMPLE, ONE STORY: the deep link a `ComponentPreview` hands over when it knows which generated
 * story (each storybook app's own `scripts/generate-stories.ts`) its tree became. `title` is the story's
 * "kind" as that script computes it (`Components/<catalog group>/<label>`, English always: Storybook
 * has no locale), `story` is the PascalCase export name it derives from the demo's own export
 * (`badgeSmallTree` -> `Small`). The id this builds is exactly what Storybook's own `toId(kind, name)`
 * produces, verified against a real build's `index.json` rather than assumed: lower-case, every run of
 * non `[a-z0-9]` collapsed to one `-`, kind and story joined by `--`. `slugify` (this file already
 * imports it for nothing else, `document-index.ts`) happens to do exactly that.
 *
 * Points at the component's DOCS page (`/docs/<id>--docs`), not its bare story: that is the one route
 * `@storybook/addon-docs` is guaranteed to render every story's source under a "Show code" block on,
 * autodocs needing no further setup than the `tags: ["autodocs"]` every generated file already
 * carries. The story's own anchor is appended as a hash for a direct scroll where Storybook's docs
 * page happens to honor one; landing on the page at all does not depend on it.
 */
export function storybookDocsUrl(
  base: string | null,
  title: string,
  story: string,
): string | null {
  if (!base) return null;
  const kind = slugify(title);
  const name = slugify(story);
  return `${base}?path=/docs/${kind}--docs#${name}`;
}

/* The row reads as one journey through the documentation: start, foundations, the catalogue, what
   you can build from it. */
export const globalNavigation = [
  { href: "/", label: "nav.home" },
  { href: "/foundations", label: "nav.foundations" },
  { href: "/components", label: "nav.components" },
  { href: "/catalog", label: "nav.catalog" },
  { href: "/templates", label: "nav.templates" },
  { href: "/presets", label: "nav.presets" },
] satisfies readonly NavigationItem[];

export const documentationNavigation = [
  {
    // First stage: the pages commented out below are written and still routable, only unlisted here (rail,
    // footer, search). Uncomment an entry to list it again.
    id: "foundations",
    section: "section.foundations",
    href: "/foundations",
    blurb: "section.foundations.blurb",
    /* A short reading path: every group opens and closes (the same disclosure as the catalog's), and they all
       start open, so no step of it is hidden until the reader chooses to hide it. */
    groups: ([
      {
        id: "foundations-first-steps",
        group: "group.firstSteps",
        items: [
          {
            href: "/prerequisites",
            label: "Prerrequisitos",
            aliases: ["conceptos", "fundamentos externos", "css variables", "custom properties", "antes de empezar"],
          },
          {
            href: "/installation",
            label: "Instalación",
            aliases: ["installation", "instalar", "install"],
          },
          {
            href: "/first-component",
            label: "Tu primer componente",
            aliases: ["first component", "primer componente"],
          },
          {
            href: "/automatic-mounting",
            label: "Montaje automático",
            aliases: ["auto mount", "initComponents", "auto-mounting", "automatic mounting", "vanilla mount"],
          },
          // {
            // href: "/maker",
            // label: "Maker",
            // aliases: ["page builder", "constructor de páginas", "editor visual", "visual editor", "maker_apply", "maker_read"],
          // },
        ],
      },
      {
        id: "foundations-model",
        group: "group.foundationModel",
        blurb: "group.foundationModel.blurb",
        items: [
          {
            href: "/architecture",
            label: "Arquitectura",
            aliases: ["contrato", "binding", "capas", "cómo se construye un componente", "machine"],
          },
          { href: "/tiers", label: "Tiers" },
          { href: "/reference", label: "Tokens" },
          {
            href: "/dependencies",
            label: "Dependencias",
            aliases: ["dependencies", "paquetes de terceros", "zag", "svelte", "peer dependencies", "librerías"],
          },
        ],
      },
      {
        id: "foundations-dimensions",
        group: "group.visualDimensions",
        blurb: "group.visualDimensions.blurb",
        items: [
          { href: "/dimensions", label: "Dimensiones" },
          // {
            // href: "/density",
            // label: "Densidad de componente",
            // aliases: ["density", "densidad local", "scope de densidad", "custom density", "compactar componente"],
          // },
          // {
            // href: "/elevation",
            // label: "Elevación",
            // aliases: [
              // "elevation",
              // "sombra",
              // "sombras",
              // "shadow",
              // "shadows",
              // "box-shadow",
              // "depth",
              // "profundidad",
              // "material elevation",
              // "z-depth",
            // ],
          // },
          {
            href: "/appearance",
            label: "Apariencia",
            aliases: [
              "appearance",
              "apariencias",
              "tactile",
              "brutalist",
              "brutalismo",
              "frosted",
              "glassmorphism",
              "plain",
              "neobrutalism",
              "estilo físico",
            ],
          },
          {
            href: "/typography",
            label: "Tipografía",
            aliases: [
              "typography",
              "tipografia",
              "fuente",
              "font",
              "type scale",
              "escala tipográfica",
              "line-height",
              "interlineado",
              "font-weight",
              "hanken grotesk",
            ],
          },
          {
            href: "/icons",
            label: "Iconografía",
            aliases: ["iconos", "icon set", "roles de icono", "vocabulario de iconos", "adr-15"],
          },
        ],
      },
      {
        id: "foundations-surfaces",
        group: "group.publicSurfaces",
        blurb: "group.publicSurfaces.blurb",
        items: [
          { href: "/styling-hooks", label: "Styling hooks" },
          // { href: "/state-layer", label: "State layer" },
          // { href: "/motion", label: "Motion" },
          // {
            // href: "/effects",
            // label: "Efectos",
            // trailing: "Demo",
            // aliases: [
              // "effects",
              // "scroll reveal",
              // "reveal on scroll",
              // "animation-timeline",
              // "collapse header",
              // "header colapsable",
              // "pulse",
              // "pulso",
              // "adr-20",
            // ],
          // },
        ],
      },
      {
        id: "foundations-platform",
        group: "group.platformAccessibility",
        blurb: "group.platformAccessibility.blurb",
        items: [
          // {
            // href: "/zoom",
            // label: "Zoom y reflow",
            // aliases: [
              // "zoom 200%",
              // "zoom 400%",
              // "reflow",
              // "resize text",
              // "wcag 1.4.4",
              // "wcag 1.4.10",
            // ],
          // },
          {
            href: "/keyboard",
            label: "Navegación por teclado",
            aliases: [
              "keyboard",
              "keyboard navigation",
              "teclado",
              "arrow keys",
              "flechas",
              "tab",
              "escape",
              "focus trap",
              "roving tabindex",
              "wcag 2.1.1",
              "aria-activedescendant",
            ],
          },
          // {
            // href: "/storage",
            // label: "Almacenamiento",
            // aliases: [
              // "storage",
              // "localstorage",
              // "local storage",
              // "preferencias",
              // "preferences",
              // "persistencia",
              // "persistence",
              // "usestoredpreference",
              // "definepreference",
            // ],
          // },
        ],
      },
      // {
        // group: "group.sharedPatterns",
        // blurb: "group.sharedPatterns.blurb",
        // items: [
          // {
            // href: "/anchoring",
            // label: "Anclaje",
            // aliases: [
              // "anchored",
              // "anchor",
              // "anchor positioning",
              // "posicionamiento",
              // "colocación",
              // "colocacion",
              // "placement",
              // "floating",
              // "popper",
              // "flecha",
              // "arrow",
              // "positioner",
            // ],
          // },
          // {
            // href: "/splitter",
            // label: "Splitter",
            // aliases: [
              // "window splitter",
              // "separador",
              // "resize handle",
              // "redimensionar",
              // "resizable columns",
              // "columnas redimensionables",
              // "sk-splitter",
            // ],
          // },
          // {
            // href: "/scroll-lock",
            // label: "Scroll lock",
            // aliases: ["scrollbar gutter", "cls", "overflow hidden", "congelar scroll", "reserva scrollbar"],
          // },
          // {
            // href: "/transparency",
            // label: "Transparencia",
            // aliases: [
              // "transparency",
              // "reduced transparency",
              // "prefers-reduced-transparency",
              // "blur",
              // "glassmorphism",
              // "fondos translúcidos",
              // "frosted",
            // ],
          // },
        // ],
      // },
    ] satisfies readonly NavigationGroup[]).map((group) => ({ ...group, collapsible: true, defaultOpen: true })),
  },
  {
    id: "components",
    section: "section.components",
    href: "/components",
    blurb: "section.components.blurb",
    caption: "section.components.caption",
    /* A hundred entries do not fit in one view: each category opens and closes. */
    groups: componentNavigation.map((group) => ({ ...group, collapsible: true })),
  },
] satisfies readonly NavigationSection[];

/**
 * The navigation as a given locale renders it: titles and blurbs translated, item labels overridden
 * where they are Spanish prose, and every `href` rewritten into that locale's route vocabulary.
 *
 * The whole table is derived per request rather than duplicated per language, so adding a page is
 * still one entry, and adding a language cannot leave the two rails out of sync.
 */
/*
 * The site is translated a page at a time, so most entries in a non-default locale's rail have no
 * page behind them yet. Those link to the DEFAULT locale's version instead of to a 404: a reader on
 * an English page can still reach every document, and the ones already translated take them to the
 * English copy. `hasTranslation` reads the page directory at build, so an entry starts pointing at
 * its own language the moment the file lands, with no list to update here.
 */
const resolveHref = (href: string, locale: Locale): string =>
  hasTranslation(href, locale) ? localizePath(href, locale) : href;

const localizeNavigationItem = (entry: NavigationItem, locale: Locale): NavigationItem => {
  const labels = navLabel[locale] ?? {};
  return {
    ...entry,
    href: resolveHref(entry.href, locale),
    label: labels[entry.href] ?? entry.label,
  };
};

export function getNavigation(locale: Locale): readonly NavigationSection[] {
  const t = useTranslations(locale);

  return documentationNavigation.map((section) => ({
    ...section,
    section: t(section.section as Parameters<typeof t>[0]),
    blurb: t(section.blurb as Parameters<typeof t>[0]),
    caption: section.caption ? t(section.caption as Parameters<typeof t>[0]) : undefined,
    href: section.href ? resolveHref(section.href, locale) : undefined,
    groups: section.groups.map((group: NavigationGroup) => ({
      ...group,
      group: group.group ? t(group.group as Parameters<typeof t>[0]) : "",
      blurb: group.blurb ? t(group.blurb as Parameters<typeof t>[0]) : undefined,
      items: sortedForGroup(group, group.items.map((entry) => localizeNavigationItem(entry, locale)), locale),
    })),
  }));
}

/*
 * A category that opens and closes is a list a reader scans for a NAME, so it is alphabetical in the
 * language the reader sees: the labels were authored in one language and a few are overridden per locale,
 * so the order has to be taken after that, not before. A group that is a reading path keeps its authored order.
 */
const sortedForGroup = (group: NavigationGroup, items: readonly NavigationItem[], locale: Locale): readonly NavigationItem[] =>
  group.collapsible ? items.slice().sort((a, b) => a.label.localeCompare(b.label, locale)) : items;

export function getDevCommandPaletteOnlyComponentNavigation(locale: Locale): readonly NavigationGroup[] {
  const t = useTranslations(locale);

  return devCommandPaletteOnlyComponentNavigation.map((group) => ({
    ...group,
    group: group.group ? t(group.group as Parameters<typeof t>[0]) : "",
    blurb: group.blurb ? t(group.blurb as Parameters<typeof t>[0]) : undefined,
    items: group.items.map((entry) => localizeNavigationItem(entry, locale)),
  }));
}

/** The header's two global links, same treatment. */
export function getGlobalNavigation(locale: Locale): readonly NavigationItem[] {
  const t = useTranslations(locale);
  return globalNavigation.map((entry) => ({
    ...entry,
    href: resolveHref(entry.href, locale),
    label: t(entry.label as Parameters<typeof t>[0]),
  }));
}
