import type { SubjectId, Text } from "./types.js";

/*
 * THE TAXONOMY: two axes, plus one that is derived.
 *
 *   INTENT, what the reader is trying to do. Three levels: `domain/area/intent`. The id IS the path, so
 *   a prefix is a query (`metrics/` is every figure, `metrics/money/` the money ones). An intent names
 *   a job, never a shape: "show how much of a limit is used" (`metrics/usage/quota`), not "a card with a
 *   bar". The same job can be done by several patterns; those are its alternatives.
 *
 *   SUBJECT, what a person would call the thing ("card", "list", "form"). Subjects group the Catalog
 *   page and give a fragment a home. A subject is a human name; it does not constrain which contracts a
 *   use employs.
 *
 *   COMPONENTS, derived. Which contract families a use's tree actually touches. Not authored, so it
 *   cannot drift: an agent asking "what do we have that uses Meter?" gets the truth about the trees.
 *
 * Adding an intent is one line here. A use that names an id that is not here fails the build, so the
 * taxonomy is never a list of good intentions.
 */

export interface Intent {
  /** `domain/area/intent`. Kebab-case, three segments, stable: ids are what other uses and agents point at. */
  readonly id: string;
  readonly label: Text;
  /** The job, in one sentence: what makes a use belong here and not under a neighbour. */
  readonly job: Text;
}

const intent = <const I extends string>(id: I, label: Text, job: Text) => ({ id, label, job }) as const;

export const intents = [
  /* ── identity: who someone is, and getting in ───────────────────────────────────────────────── */
  intent("identity/access/sign-in", { en: "Sign in", es: "Iniciar sesión" }, { en: "Let a returning person get into their account.", es: "Dejar que quien ya tiene cuenta entre." }),
  intent("identity/access/sign-up", { en: "Sign up", es: "Crear cuenta" }, { en: "Collect what is needed to register a new person.", es: "Pedir lo necesario para registrar a alguien nuevo." }),
  intent("identity/access/branded-sign-in", { en: "Branded sign-in", es: "Acceso con marca" }, { en: "Sign in beside a panel that says what the product is.", es: "Entrar junto a un panel que dice qué es el producto." }),
  intent("identity/access/remember-recover", { en: "Remember and recover", es: "Recordar y recuperar" }, { en: "Keep a person signed in, or get them back in when they forgot.", es: "Mantener la sesión, o devolver el acceso a quien lo olvidó." }),
  intent("identity/access/alternative-method", { en: "Alternative method", es: "Método alternativo" }, { en: "Separate two ways of doing the same thing.", es: "Separar dos maneras de hacer lo mismo." }),
  intent("identity/access/sign-in-page", { en: "Sign-in page", es: "Página de acceso" }, { en: "A whole screen whose only job is signing in.", es: "Una pantalla completa cuyo único trabajo es entrar." }),
  intent("identity/people/profile", { en: "Profile", es: "Perfil" }, { en: "Say who a person is, what they do and how to reach them.", es: "Decir quién es una persona, qué hace y cómo contactarla." }),
  intent("identity/people/team-directory", { en: "Team directory", es: "Directorio de equipo" }, { en: "Browse the people of a team side by side.", es: "Recorrer a las personas de un equipo lado a lado." }),
  intent("identity/people/members", { en: "Members", es: "Miembros" }, { en: "List people with their role, to manage who belongs.", es: "Listar personas con su rol, para gestionar quién pertenece." }),
  intent("identity/people/team-page", { en: "Team page", es: "Página de equipo" }, { en: "A whole screen to see and manage a team.", es: "Una pantalla para ver y gestionar un equipo." }),
  intent("identity/devices/pair-device", { en: "Pair a device", es: "Vincular un dispositivo" }, { en: "Link a phone or another device by scanning a code.", es: "Vincular un teléfono u otro dispositivo escaneando un código." }),
  intent("identity/onboarding/step-flow", { en: "Onboarding steps", es: "Onboarding por pasos" }, { en: "Walk a new person through setup one step at a time.", es: "Guiar a alguien nuevo por la configuración, un paso a la vez." }),

  /* ── input: collecting data ─────────────────────────────────────────────────────────────────── */
  intent("input/fields/field-hint", { en: "Field with hint", es: "Campo con ayuda" }, { en: "Ask for one value and say what is expected.", es: "Pedir un dato y decir qué se espera." }),
  intent("input/fields/field-error", { en: "Field with error", es: "Campo con error" }, { en: "Say a value will not do, and how to fix it.", es: "Decir que un dato no sirve y cómo corregirlo." }),
  intent("input/fields/field-hint-and-error", { en: "Field with hint and error", es: "Campo con ayuda y error" }, { en: "One field that guides before and corrects after.", es: "Un campo que guía antes y corrige después." }),
  intent("input/fields/validated-identifier", { en: "Validated identifier", es: "Identificador validado" }, { en: "A field whose format is checked as the person types.", es: "Un campo cuyo formato se revisa mientras se escribe." }),
  intent("input/capture/subscribe", { en: "Subscribe", es: "Suscripción" }, { en: "Capture one value and one action, on one line.", es: "Capturar un dato y una acción, en una línea." }),
  intent("input/capture/contact", { en: "Contact", es: "Contacto" }, { en: "Take a message with its topic so it reaches the right person.", es: "Recibir un mensaje con su tema para que llegue a quien corresponde." }),
  intent("input/preferences/toggle-setting", { en: "Toggle setting", es: "Ajuste que se activa" }, { en: "One option that turns on or off at once.", es: "Una opción que se activa o desactiva al momento." }),
  intent("input/preferences/notification-switches", { en: "Notification switches", es: "Interruptores de notificaciones" }, { en: "Several options that apply at once, each with its effect.", es: "Varias opciones que se aplican al momento, cada una con su efecto." }),
  intent("input/preferences/settings-page", { en: "Settings page", es: "Página de ajustes" }, { en: "Sections of fields, each explained beside its fields.", es: "Secciones de campos, cada una explicada junto a sus campos." }),
  intent("input/preferences/settings-screen", { en: "Settings screen", es: "Pantalla de ajustes" }, { en: "A whole screen of account settings.", es: "Una pantalla completa de ajustes de cuenta." }),
  intent("input/surveys/branching-survey", { en: "Branching survey", es: "Encuesta con ramas" }, { en: "Ask questions where each answer decides the next.", es: "Preguntar donde cada respuesta decide la siguiente." }),

  /* ── metrics: figures and how they stand ────────────────────────────────────────────────────── */
  intent("metrics/key-figures/kpi", { en: "Key figure", es: "Cifra clave" }, { en: "Show one number that matters, with its change and what it means.", es: "Mostrar una cifra que importa, con su variación y lo que significa." }),
  intent("metrics/key-figures/kpi-grid", { en: "Key figures grid", es: "Grilla de cifras" }, { en: "Several key figures side by side.", es: "Varias cifras clave lado a lado." }),
  intent("metrics/key-figures/account-overview", { en: "Account overview", es: "Resumen de cuenta" }, { en: "An account's figures, its quota and recent activity at a glance.", es: "Las cifras de una cuenta, su cuota y su actividad reciente de un vistazo." }),
  intent("metrics/usage/quota", { en: "Quota", es: "Cuota" }, { en: "Show how much of a limit is used and what to do near it.", es: "Mostrar cuánto de un límite se usó y qué hacer al acercarse." }),
  intent("metrics/progress/goals", { en: "Goals", es: "Metas" }, { en: "Show targets and how far each one still has to go.", es: "Mostrar objetivos y cuánto falta para cada uno." }),
  intent("metrics/money/breakdown", { en: "Breakdown", es: "Desglose" }, { en: "Amounts that add up to a total.", es: "Montos que suman un total." }),
  intent("metrics/money/balance", { en: "Balance", es: "Saldo" }, { en: "An available amount, its status and where it comes from.", es: "Un monto disponible, su estado y de dónde sale." }),
  intent("metrics/money/holdings", { en: "Holdings", es: "Cartera" }, { en: "One figure per row, with its change at the end.", es: "Una cifra por fila, con su variación al final." }),
  intent("metrics/money/finance-board", { en: "Finance board", es: "Tablero de finanzas" }, { en: "Unrelated cards of different heights that tell an account's state.", es: "Cards distintas, de distinta altura, que cuentan el estado de una cuenta." }),
  intent("metrics/dashboards/analytics-dashboard", { en: "Analytics dashboard", es: "Dashboard de analítica" }, { en: "A whole screen of figures, a table and paging.", es: "Una pantalla de cifras, una tabla y paginación." }),

  /* ── commerce: pricing, selling, buying ─────────────────────────────────────────────────────── */
  intent("commerce/pricing/plan", { en: "Plan", es: "Plan" }, { en: "One offer with its price and what it includes, to compare with others.", es: "Una oferta con precio y lo que incluye, para comparar con otras." }),
  intent("commerce/pricing/plan-comparison", { en: "Plan comparison", es: "Comparación de planes" }, { en: "Plans side by side with one featured.", es: "Planes lado a lado con uno destacado." }),
  intent("commerce/pricing/pricing-page", { en: "Pricing page", es: "Página de precios" }, { en: "A whole screen to choose a plan.", es: "Una pantalla completa para elegir un plan." }),
  intent("commerce/catalog/product-card", { en: "Product card", es: "Tarjeta de producto" }, { en: "One product as a cell of a grid: picture, name, a way in.", es: "Un producto como celda de una grilla: imagen, nombre, una entrada." }),
  intent("commerce/catalog/product-page", { en: "Product page", es: "Página de producto" }, { en: "A whole screen for one product.", es: "Una pantalla completa para un producto." }),
  intent("commerce/catalog/store-listing", { en: "Store listing", es: "Listado de tienda" }, { en: "Browse and filter a store's products.", es: "Recorrer y filtrar los productos de una tienda." }),
  intent("commerce/checkout/checkout-flow", { en: "Checkout", es: "Checkout" }, { en: "A whole screen to pay: steps, shipping and order summary.", es: "Una pantalla completa para pagar: pasos, envío y resumen." }),
  intent("commerce/booking/booking-flow", { en: "Booking", es: "Reserva" }, { en: "A whole screen to pick a time and confirm.", es: "Una pantalla completa para elegir un horario y confirmar." }),

  /* ── content: things to read ────────────────────────────────────────────────────────────────── */
  intent("content/presentation/heading-block", { en: "Heading block", es: "Bloque de encabezado" }, { en: "Open a block of content with its category, title and context.", es: "Abrir un bloque de contenido con su categoría, título y contexto." }),
  intent("content/presentation/labelled-image", { en: "Labelled image", es: "Imagen con etiqueta" }, { en: "An image that names its content's kind.", es: "Una imagen que nombra el tipo de su contenido." }),
  intent("content/presentation/section-header", { en: "Section header", es: "Encabezado de sección" }, { en: "Name a list and lead to the rest of it.", es: "Nombrar una lista y llevar al resto." }),
  intent("content/attribution/byline", { en: "Byline", es: "Autoría" }, { en: "Say who made something and when.", es: "Decir quién hizo algo y cuándo." }),
  intent("content/publishing/post", { en: "Post", es: "Publicación" }, { en: "Something to read, with its author and date.", es: "Algo para leer, con su autor y su fecha." }),
  intent("content/publishing/post-feed", { en: "Post feed", es: "Feed de publicaciones" }, { en: "A row of posts to choose what to read.", es: "Una fila de publicaciones para elegir qué leer." }),
  intent("content/publishing/article-page", { en: "Article page", es: "Página de artículo" }, { en: "A whole screen to read one article.", es: "Una pantalla completa para leer un artículo." }),
  intent("content/publishing/changelog", { en: "Changelog", es: "Registro de cambios" }, { en: "A whole screen of what changed and when.", es: "Una pantalla completa de qué cambió y cuándo." }),
  intent("content/documentation/docs-site", { en: "Docs site", es: "Sitio de documentación" }, { en: "A whole screen of documentation: rail, article and page index.", es: "Una pantalla de documentación: riel, artículo e índice." }),
  intent("content/documentation/help-center", { en: "Help centre", es: "Centro de ayuda" }, { en: "A whole screen to find an answer.", es: "Una pantalla completa para encontrar una respuesta." }),
  intent("content/search/search-results", { en: "Search results", es: "Resultados de búsqueda" }, { en: "A whole screen of results to scan and refine.", es: "Una pantalla completa de resultados para recorrer y refinar." }),
  intent("content/code/repo-overview", { en: "Repository overview", es: "Resumen de repositorio" }, { en: "A whole screen to understand a code repository.", es: "Una pantalla completa para entender un repositorio." }),

  /* ── collaboration: people working together ─────────────────────────────────────────────────── */
  intent("collaboration/messages/notifications", { en: "Notifications", es: "Notificaciones" }, { en: "Who did what and when, with unread ones marked.", es: "Quién hizo qué y cuándo, con las no leídas marcadas." }),
  intent("collaboration/messages/inbox-panel", { en: "Inbox panel", es: "Panel de bandeja" }, { en: "Notifications in a panel with a filter and a way to the full list.", es: "Notificaciones en un panel con filtro y salida a la lista completa." }),
  intent("collaboration/messages/mail-client", { en: "Mail client", es: "Cliente de correo" }, { en: "A whole screen: folders, messages and the open message.", es: "Una pantalla completa: carpetas, mensajes y el mensaje abierto." }),
  intent("collaboration/messages/chat", { en: "Chat", es: "Chat" }, { en: "A whole screen of a conversation.", es: "Una pantalla completa de una conversación." }),
  intent("collaboration/files/file-list", { en: "File list", es: "Lista de archivos" }, { en: "Documents with their size and one action per row.", es: "Documentos con su tamaño y una acción por fila." }),
  intent("collaboration/work/task", { en: "Task", es: "Tarea" }, { en: "An item with a status, details and the actions it allows.", es: "Un elemento con estado, detalles y las acciones que admite." }),
  intent("collaboration/work/checklist", { en: "Checklist", es: "Lista de pendientes" }, { en: "Items to tick off as done, with their category.", es: "Elementos que se marcan como hechos, con su categoría." }),
  intent("collaboration/work/task-board", { en: "Task board", es: "Tablero de tareas" }, { en: "Tasks grouped by when they are due.", es: "Tareas agrupadas por cuándo vencen." }),
  intent("collaboration/work/activity-feed", { en: "Activity feed", es: "Feed de actividad" }, { en: "Who did what lately, newest first.", es: "Quién hizo qué últimamente, lo más reciente primero." }),
  intent("collaboration/work/activity-panel", { en: "Activity panel", es: "Panel de actividad" }, { en: "Two lists side by side that tell a project's state.", es: "Dos listas lado a lado que cuentan el estado de un proyecto." }),
  intent("collaboration/work/issue-tracker", { en: "Issue tracker", es: "Seguimiento de incidencias" }, { en: "A whole screen to triage and follow issues.", es: "Una pantalla completa para clasificar y seguir incidencias." }),

  /* ── navigation: getting somewhere ──────────────────────────────────────────────────────────── */
  intent("navigation/destinations/link-group", { en: "Link group", es: "Grupo de enlaces" }, { en: "Destinations of one area under a group name.", es: "Destinos de una misma área bajo un nombre de grupo." }),
  intent("navigation/destinations/settings-menu", { en: "Settings menu", es: "Menú de ajustes" }, { en: "Rows that each lead to a screen, saying what changes there.", es: "Filas que llevan cada una a una pantalla, diciendo qué se cambia ahí." }),
  intent("navigation/destinations/setting-shortcuts", { en: "Setting shortcuts", es: "Atajos a ajustes" }, { en: "Rows that lead to settings, each saying what it changes.", es: "Filas que llevan a ajustes, cada una diciendo qué cambia." }),
  intent("navigation/site/footer-credit", { en: "Footer credit", es: "Crédito de pie" }, { en: "A footer's closing line of credit.", es: "La línea de crédito que cierra un pie de página." }),
  intent("navigation/shells/app-shell", { en: "App shell", es: "Marco de aplicación" }, { en: "The frame of an application: bar, rail and work area.", es: "El marco de una aplicación: barra, riel y área de trabajo." }),
  intent("navigation/shells/nested-navigation-shell", { en: "Nested navigation shell", es: "Marco con navegación anidada" }, { en: "An app frame whose rail holds a tree of destinations.", es: "Un marco cuyo riel guarda un árbol de destinos." }),

  /* ── decision: choosing, confirming, destroying ─────────────────────────────────────────────── */
  intent("decision/confirmation/decision-row", { en: "Decision row", es: "Fila de decisión" }, { en: "Close a block that asks for a decision.", es: "Cerrar un bloque que pide una decisión." }),
  intent("decision/destructive/danger-zone", { en: "Danger zone", es: "Zona de peligro" }, { en: "Set apart an action that cannot be undone, and explain it.", es: "Apartar una acción que no se puede deshacer y explicarla." }),

  /* ── actions ────────────────────────────────────────────────────────────────────────────────── */
  intent("actions/buttons/icon-only", { en: "Icon-only button", es: "Botón solo de ícono" }, { en: "An action with no visible label that still explains itself.", es: "Una acción sin etiqueta visible que aun así se explica." }),
  intent("actions/toolbars/icon-toolbar", { en: "Icon toolbar", es: "Barra de íconos" }, { en: "A row of related icon actions with arrow-key movement.", es: "Una fila de acciones de ícono relacionadas, con movimiento por flechas." }),

  /* ── data: collections ──────────────────────────────────────────────────────────────────────── */
  intent("data/collections/pagination", { en: "Pagination", es: "Paginación" }, { en: "Move through a collection split into pages.", es: "Moverse por una colección partida en páginas." }),
  intent("data/collections/paged-table", { en: "Paged table", es: "Tabla paginada" }, { en: "Tabular records with their pager.", es: "Registros en tabla con su paginador." }),

  /* ── status: what state something is in ─────────────────────────────────────────────────────── */
  intent("status/progress/state-indicator", { en: "State indicator", es: "Indicador de estado" }, { en: "Where an item stands, with an icon and a word.", es: "Dónde está un elemento, con ícono y palabra." }),
  intent("status/emptiness/empty-collection", { en: "Empty collection", es: "Colección vacía" }, { en: "What shows while there is nothing yet, and how to start.", es: "Lo que se ve mientras no hay nada, y cómo empezar." }),
  intent("status/errors/error-with-retry", { en: "Error with retry", es: "Error con reintento" }, { en: "Say something failed and offer to try again.", es: "Decir que algo falló y ofrecer reintentar." }),
  intent("status/errors/not-found", { en: "Not found", es: "No encontrado" }, { en: "A whole screen for an address that leads nowhere.", es: "Una pantalla completa para una dirección que no lleva a nada." }),

  /* ── marketing: selling the product ─────────────────────────────────────────────────────────── */
  intent("marketing/landing/hero", { en: "Hero", es: "Hero" }, { en: "Open a page with its pitch and the way in.", es: "Abrir una página con su propuesta y la entrada." }),
  intent("marketing/landing/landing-page", { en: "Landing page", es: "Landing de producto" }, { en: "A whole screen that sells a product.", es: "Una pantalla completa que vende un producto." }),
  intent("marketing/proof/social-proof", { en: "Social proof", es: "Prueba social" }, { en: "Show that others use and trust it, next to the pitch.", es: "Mostrar que otros lo usan y confían, junto a la propuesta." }),
  intent("marketing/proof/logo-wall", { en: "Logo wall", es: "Muro de logos" }, { en: "Prove credibility with the names of known customers.", es: "Dar credibilidad con los nombres de clientes conocidos." }),
  intent("marketing/proof/testimonial", { en: "Testimonial", es: "Testimonio" }, { en: "Put a customer's words beside the pitch.", es: "Poner las palabras de un cliente junto a la propuesta." }),
  intent("marketing/conversion/email-capture", { en: "Email capture", es: "Captura de correo" }, { en: "Make the first action leaving an email.", es: "Hacer que la primera acción sea dejar un correo." }),
  intent("marketing/conversion/app-download", { en: "App download", es: "Descarga de app" }, { en: "Lead to the app stores.", es: "Llevar a las tiendas de apps." }),
  intent("marketing/pricing/pricing-toggle", { en: "Pricing toggle", es: "Selector de facturación" }, { en: "Let the visitor switch the billing period beside the pitch.", es: "Dejar cambiar el ciclo de facturación junto a la propuesta." }),
  intent("marketing/product/code-demo", { en: "Code demo", es: "Demo de código" }, { en: "Show the product through its code.", es: "Mostrar el producto a través de su código." }),
  intent("marketing/product/video-demo", { en: "Video demo", es: "Demo en video" }, { en: "Show the product in motion.", es: "Mostrar el producto en movimiento." }),
  intent("marketing/audience/audience-tabs", { en: "Audience tabs", es: "Pestañas por audiencia" }, { en: "Speak to several audiences from one hero.", es: "Hablar a varias audiencias desde un mismo hero." }),
] as const;

export type IntentId = (typeof intents)[number]["id"];

export interface Subject {
  readonly id: SubjectId;
  readonly title: Text;
  readonly lede: Text;
  /** Order on the Catalog page. */
  readonly order: number;
}

export const subjects: readonly Subject[] = [
  { id: "card", order: 1, title: { en: "Card", es: "Card" }, lede: { en: "Card is not a kit component: it is a composition of Box, Stack, typography and whatever the card has to show. These variants run from the pieces a card is built from to the pages that hold many.", es: "Card no es un componente del kit: es una composición de Box, Stack, tipografía y lo que la tarjeta necesite mostrar. Estas variantes van de las piezas con las que se arma una card a las páginas que arman muchas." } },
  { id: "list", order: 2, title: { en: "List", es: "Lista" }, lede: { en: "Rows read top to bottom: each one an item with its title, its context and sometimes an action. They run from a piece of a row to screens made of lists.", es: "Filas que se leen de arriba abajo: cada una es un elemento con su título, su contexto y, a veces, una acción. Van de la pieza de una fila a pantallas hechas de listas." } },
  { id: "form", order: 3, title: { en: "Form", es: "Formulario" }, lede: { en: "Fields with their label, hint and error, and the flows built from them: signing in, signing up, writing in, configuring.", es: "Campos con su etiqueta, su ayuda y su error, y los flujos que se arman con ellos: entrar, registrarse, escribir, configurar." } },
  { id: "hero", order: 4, title: { en: "Hero", es: "Hero" }, lede: { en: "The opening block of a page: its pitch, its proof and the way in.", es: "El bloque que abre una página: su propuesta, su prueba y la entrada." } },
  { id: "action", order: 5, title: { en: "Actions", es: "Acciones" }, lede: { en: "Buttons and the rows and toolbars that hold them.", es: "Botones y las filas y barras que los agrupan." } },
  { id: "feedback", order: 6, title: { en: "Feedback", es: "Feedback" }, lede: { en: "What the interface says back: errors, empty states, progress.", es: "Lo que la interfaz responde: errores, estados vacíos, progreso." } },
  { id: "navigation", order: 7, title: { en: "Navigation", es: "Navegación" }, lede: { en: "Getting somewhere: link groups, footers, frames.", es: "Llegar a algún lado: grupos de enlaces, pies, marcos." } },
  { id: "table", order: 8, title: { en: "Table and data", es: "Tabla y datos" }, lede: { en: "Records and the way through them.", es: "Registros y la manera de recorrerlos." } },
  { id: "survey", order: 9, title: { en: "Survey", es: "Encuesta" }, lede: { en: "Asking questions and following the answers.", es: "Hacer preguntas y seguir las respuestas." } },
  { id: "screen", order: 10, title: { en: "Whole screens", es: "Pantallas completas" }, lede: { en: "Complete pages, from the frame to the content. Also on the Templates page.", es: "Páginas completas, del marco al contenido. También en la página de Templates." } },
];


/*
 * THE NAMES OF THE TWO UPPER LEVELS. Domains and areas are only ever read as headings, so they carry a label
 * and nothing else: the job is stated at the intent, where a use is actually filed.
 */
export const domainLabels: Readonly<Record<string, Text>> = {
  identity: { en: "Identity and access", es: "Identidad y acceso" },
  input: { en: "Input", es: "Entrada de datos" },
  metrics: { en: "Metrics", es: "Métricas" },
  commerce: { en: "Commerce", es: "Comercio" },
  content: { en: "Content", es: "Contenido" },
  collaboration: { en: "Collaboration", es: "Colaboración" },
  navigation: { en: "Navigation", es: "Navegación" },
  decision: { en: "Decisions", es: "Decisiones" },
  actions: { en: "Actions", es: "Acciones" },
  data: { en: "Data", es: "Datos" },
  status: { en: "Status", es: "Estado" },
  marketing: { en: "Marketing", es: "Marketing" },
};

export const areaLabels: Readonly<Record<string, Text>> = {
  access: { en: "Access", es: "Acceso" },
  people: { en: "People", es: "Personas" },
  devices: { en: "Devices", es: "Dispositivos" },
  onboarding: { en: "Onboarding", es: "Onboarding" },
  fields: { en: "Fields", es: "Campos" },
  capture: { en: "Capture", es: "Captura" },
  preferences: { en: "Preferences", es: "Preferencias" },
  surveys: { en: "Surveys", es: "Encuestas" },
  "key-figures": { en: "Key figures", es: "Cifras clave" },
  usage: { en: "Usage", es: "Uso" },
  progress: { en: "Progress", es: "Avance" },
  money: { en: "Money", es: "Dinero" },
  dashboards: { en: "Dashboards", es: "Dashboards" },
  pricing: { en: "Pricing", es: "Precios" },
  catalog: { en: "Catalogue", es: "Catálogo" },
  checkout: { en: "Checkout", es: "Pago" },
  booking: { en: "Booking", es: "Reservas" },
  presentation: { en: "Presentation", es: "Presentación" },
  attribution: { en: "Attribution", es: "Autoría" },
  publishing: { en: "Publishing", es: "Publicación" },
  documentation: { en: "Documentation", es: "Documentación" },
  search: { en: "Search", es: "Búsqueda" },
  code: { en: "Code", es: "Código" },
  messages: { en: "Messages", es: "Mensajes" },
  files: { en: "Files", es: "Archivos" },
  work: { en: "Work", es: "Trabajo" },
  destinations: { en: "Destinations", es: "Destinos" },
  site: { en: "Site", es: "Sitio" },
  shells: { en: "Frames", es: "Marcos" },
  confirmation: { en: "Confirmation", es: "Confirmación" },
  destructive: { en: "Destructive", es: "Destructivo" },
  buttons: { en: "Buttons", es: "Botones" },
  toolbars: { en: "Toolbars", es: "Barras de herramientas" },
  collections: { en: "Collections", es: "Colecciones" },
  emptiness: { en: "Emptiness", es: "Vacío" },
  errors: { en: "Errors", es: "Errores" },
  landing: { en: "Landing", es: "Landing" },
  proof: { en: "Proof", es: "Prueba" },
  conversion: { en: "Conversion", es: "Conversión" },
  product: { en: "Product", es: "Producto" },
  audience: { en: "Audience", es: "Audiencia" },
};

const intentById: ReadonlyMap<string, Intent> = new Map(intents.map((entry) => [entry.id, entry]));

export const hasIntent = (id: string): id is IntentId => intentById.has(id);
export const intentOf = (id: string): Intent | undefined => intentById.get(id);

/** The path of an intent as `[domain, area, intent]`. */
export const intentPath = (id: string): readonly [string, string, string] => id.split("/") as unknown as [string, string, string];

/** Every domain and area with the intents under it, for a rail or a facet. */
export function intentTree(): readonly { domain: string; areas: readonly { area: string; intents: readonly Intent[] }[] }[] {
  const domains = new Map<string, Map<string, Intent[]>>();
  for (const entry of intents) {
    const [domain, area] = intentPath(entry.id);
    const areas = domains.get(domain) ?? new Map<string, Intent[]>();
    areas.set(area, [...(areas.get(area) ?? []), entry]);
    domains.set(domain, areas);
  }
  return [...domains].map(([domain, areas]) => ({ domain, areas: [...areas].map(([area, list]) => ({ area, intents: list })) }));
}
