export type BreakFinding = {
  scenario: string;
  cases?: readonly string[];
  error: string;
  fix: string;
  status: "open" | "fixed";
  source: string;
};

// Findings are observations, not CSS overrides for the specimens.
export const breakFindings: Record<string, readonly BreakFinding[]> = {
  "button-group": [
    {
      scenario:
        "Worst case / Loading - viewport de 320px (contenedor de 229px)",
      cases: ["Worst case", "Loading"],
      error:
        "El split button ocupa 369px con el título largo y 393px en loading. El segmento que abre alternativas queda fuera de vista y ensancha la página.",
      fix: "Aplicado: min-inline-size: 0 y max-inline-size: 100% en el grupo (hoy .sk-button-group), mismo par de reglas que Button ya usa en sí mismo, un nivel arriba, para que el recorte del segmento primario pueda surtir efecto al encoger el grupo.",
      status: "fixed",
      source: "packages/core/css/components/button-group.css",
    },
    {
      scenario: "ButtonGroup: tres etiquetas largas a 320px",
      cases: [],
      error: "Cada etiqueta se recortaba por los dos lados alrededor del centro, sin elipsis: «todas las conv», «richtigungseins».",
      fix: "Aplicado: dentro del grupo, sk-button__label lleva overflow: hidden y text-overflow: ellipsis, y ningún botón queda más angosto que su alto. Los íconos y los triggers envueltos (Menu, Popover, Tooltip) no se encogen.",
      status: "fixed",
      source: "packages/core/css/components/button-group.css",
    },
    {
      scenario: "ButtonGroup: prefijo largo junto a un campo",
      cases: [],
      error: "El prefijo (white-space: nowrap) empujaba el campo 37px fuera del contenedor. Con un prefijo corto, el 100% de Input se resolvía contra el propio grupo y recortaba «https://» a «ht…».",
      fix: "Aplicado: ButtonGroupText es un bloque con elipsis y min-inline-size: 0; dentro del grupo, Input usa su ancho intrínseco y flex: 1 1 auto, con un piso de 8rem.",
      status: "fixed",
      source: "packages/core/css/components/button-group.css",
    },
    {
      scenario: "ButtonGroup: miembros envueltos en Tooltip",
      cases: [],
      error: "Un Button dentro de un Tooltip (span > span > button) no se soldaba: esquinas redondas en medio del grupo y una sombra por botón.",
      fix: "Aplicado: la ruta .sk-tooltip > .sk-tooltip__trigger (también con un Menu o Popover adentro) cuenta como una cara más en el weld, la sombra, el press y las apariencias.",
      status: "fixed",
      source: "packages/core/css/components/button-group.css",
    },
    {
      scenario: "ButtonGroup: separador en un extremo, miembro oculto al inicio",
      cases: [],
      error: "Un separador al inicio o al final dibujaba una línea suelta y cuadraba la esquina exterior del vecino; un primer miembro [hidden] hacía lo mismo.",
      fix: "Aplicado: «primero» y «último» se calculan con :nth-child(1 of :not(separador, [hidden])); un separador sin nada a un lado no se muestra.",
      status: "fixed",
      source: "packages/core/css/components/button-group.css",
    },
    {
      scenario: "ButtonGroup vertical: etiqueta sobre un ícono",
      cases: [],
      error: "El ícono quedaba cuadrado debajo de un botón ancho y la esquina soldada del ancho colgaba sobre nada.",
      fix: "Aplicado: en vertical, los miembros de solo ícono se estiran al ancho de la columna; el cuadrado queda como piso.",
      status: "fixed",
      source: "packages/core/css/components/button-group.css",
    },
    {
      scenario: "ButtonGroup: paginación con números de cuatro cifras a 320px",
      cases: [],
      error: "«1,284», «1,285» y «1,286» terminan en «1,…»: un número no se debería truncar nunca.",
      fix: "Aplicado: seis páginas de cuatro cifras no caben en 320px, así que la fila muestra menos (1 … 1,285 … 1,290). Queda como regla de contenido en la página.",
      status: "fixed",
      source: "apps/docs/src/i18n/messages/components/button-group.ts",
    },
    {
      scenario: "Ronda 2: grupos anidados con el separador por defecto, a 320px",
      cases: ["Pages, nested groups, default separator", "Pages past a thousand"],
      error:
        "Con separator inset (el valor por defecto), el grupo exterior inserta un ButtonGroupSeparator entre los dos grupos hijos: una línea suelta de 44px flota a la derecha de «1,290» (x=329, ancho 0), cuando el contrato dice que un grupo de grupos solo los separa con espacio.",
      fix: "Propuesto, SIN APLICAR: en button-group.tsx no insertar separador junto a un hijo que sea otro ButtonGroup (igual que ya se omite junto a un ButtonGroupSeparator), o en CSS ocultar .sk-button-group__separator dentro de .sk-button-group:has(> .sk-button-group).",
      status: "open",
      source: "packages/react/src/components/button-group.tsx",
    },
    {
      scenario: "Ronda 2: doce botones de ícono (barra de formato) a 320px",
      cases: ["Twelve icon members (a formatting bar)"],
      error:
        "Los 12 botones conservan 44px (528px en total) dentro de un grupo de 320px con overflow visible: del octavo en adelante quedan fuera de la superficie y del contenedor, sin scroll ni salto de línea. Los últimos (↶ ↷, hasta x=568) no se alcanzan.",
      fix: "Propuesto, SIN APLICAR (decisión): permitir que el grupo haga wrap como el grupo de grupos (flex-wrap: wrap), o dar scroll horizontal; y dejar escrito que más de unos seis miembros es una Toolbar.",
      status: "open",
      source: "packages/core/css/components/button-group.css",
    },
    {
      scenario: "Ronda 2: un miembro [hidden] entre otros con separator inset",
      cases: ["Inset with a [hidden] member in the middle"],
      error:
        "El grupo inserta un separador a cada lado del miembro oculto: quedan dos separadores en la misma posición (x=128.3, ancho 0) que se dibujan apilados, y la línea se oscurece (12 % + 12 %).",
      fix: "Propuesto, SIN APLICAR: no insertar el separador junto a un hijo con hidden en button-group.tsx, o en CSS ocultar el segundo de dos separadores contiguos que rodean un miembro [hidden].",
      status: "open",
      source: "packages/react/src/components/button-group.tsx",
    },
    {
      scenario: "Ronda 2: Select, campo y botón a 320px con un monto largo",
      cases: ["Select, field and button"],
      error:
        "El Input conserva 179px (su ancho intrínseco y su piso) y es el Select el que se encoge a 77px: el código de moneda «CHF» se recorta a «C.» y Send a «Se…». Se trunca un dato que el usuario compara y la acción.",
      fix: "Propuesto, SIN APLICAR: flex-shrink: 0 en el Select y en el Button dentro del grupo (o min-inline-size: max-content en el Select), de modo que ceda el Input hasta su piso de 8rem.",
      status: "open",
      source: "packages/core/css/components/button-group.css",
    },
  ],
  clipboard: [
    {
      scenario: "Worst case - copiar o denegar permisos a 320px",
      cases: ["Worst case"],
      error:
        "El feedback de éxito mide 425px y el de error 583px: ambos salen del viewport de 320px. El valor largo se copia completo; el fallo es la presentación del resultado.",
      fix: "Aplicado: max-inline-size con el mismo cap de Tooltip, overflow-wrap: anywhere en vez de white-space: nowrap, y min-inline-size: 0 !important para vencer min-inline-size: max-content del patrón .sk-anchored compartido.",
      status: "fixed",
      source: "packages/core/css/components/copy-button.css",
    },
  ],
  "code-preview": [
    {
      scenario: "Worst case - metadata larga a 320px y escritorio",
      cases: ["Worst case"],
      error:
        "El note sin flex-shrink consume la fila. El nombre del archivo se estrecha hasta una letra por línea; en móvil el header llega a 1.610px de alto y la nota desborda.",
      fix: "Aplicado: la nota ahora es flex: 0 1 auto con su propio ellipsis (metadata secundaria, se trunca), y el nombre del archivo recibe un min-inline-size: 8ch real en vez del mínimo automático que overflow-wrap: anywhere colapsaba a un carácter.",
      status: "fixed",
      source: "packages/core/css/components/code-preview.css",
    },
    {
      scenario: "1,002 lines - estado inicial y disclosure",
      cases: ["1,002 lines"],
      error:
        "Al cargar, aria-expanded es false pero no existe el atributo de estado que activa el límite CSS: se ven las 1.002 líneas (~21.763px de alto). El primer clic cambia la etiqueta, no la altura, porque ya estaba desplegado.",
      fix: "Aplicado: el binding de React ahora escribe data-sk-code-preview-expanded a partir de su propio estado (expanded), en vez de esperar al enhancer Vanilla, que nunca corre para este binding. Regresión en code-preview.test.tsx.",
      status: "fixed",
      source: "packages/react/src/components/code-preview.tsx",
    },
  ],
  details: [
    {
      scenario: "Worst case - summary alemán a 320px",
      cases: ["Worst case"],
      error:
        "Benachrichtigungseinstellungen no envuelve en el summary: se mete bajo el chevron y se recorta contra el borde. El cuerpo sí envuelve emails y URLs.",
      fix: "Aplicado: overflow-wrap: anywhere en los hijos del summary distintos del indicador, conservando la columna del chevron intacta.",
      status: "fixed",
      source: "packages/core/css/components/details.css",
    },
  ],
  "comparison-table": [
    {
      scenario: "Worst case / Demo / One row - viewport de 320px",
      cases: ["Worst case", "Demo", "One row"],
      error:
        "La tabla de cuatro columnas crece a 816px dentro de 229px y deja las columnas comparadas fuera de vista. Incluso la demo de dos columnas necesita 245px. El mínimo intrínseco de texto/importes vence inline-size: 100%.",
      fix: "Aplicado: nueva señal de contrato ComparisonTableScroll (host div, opt-in), mismo patrón que Table ya tiene con TableScroll, agregada porque overflow-x/max-inline-size en el <table> mismo no funciona en los motores reales (table-layout:auto). Verificado en vivo contra /debug/comparison-table-break: la tabla de 4 columnas (816px de contenido) ahora vive en un wrapper de 229px que hace scroll; el scrollWidth de la página bajó de 856px a 309px. Regresión en comparison-table.test.tsx.",
      status: "fixed",
      source: "packages/core/css/components/comparison-table.css",
    },
  ],
  "comment-thread": [
    {
      scenario: "Worst case - autor, timestamp y cuerpo a 320px",
      cases: ["Worst case"],
      error:
        "El autor largo y el timestamp compiten por el header; email/URL también desbordan el cuerpo. El hilo alcanza 425px de contenido en un contenedor de 229px.",
      fix: "Aplicado: overflow-wrap: anywhere en .sk-comment__author (conservando su columna auto deliberada) y en .sk-comment__content.",
      status: "fixed",
      source: "packages/core/css/components/comment-thread.css",
    },
    {
      scenario: "Worst case - seis niveles de respuestas a 320px",
      cases: ["Worst case"],
      error:
        "La indentación acumulada deja al último cuerpo sólo 45px. La fila de acciones tiene 51px para un grupo de votos de 84px y termina fuera de su columna.",
      fix: "Ya arreglado antes de esta auditoría: .sk-comment-actions tiene flex-wrap y una media query que reduce --sk-comment-indent a la mitad bajo 36rem, con un comentario fechado confirmándolo. El ledger estaba desactualizado en la parte de la fila de acciones; la compresión del cuerpo a seis niveles no se volvió a medir en vivo.",
      status: "fixed",
      source: "packages/core/css/components/comment-thread.css",
    },
  ],
  feed: [
    {
      scenario: "Worst case - viewport de 320px",
      cases: ["Worst case"],
      error:
        "El email y la URL salen del borde del artículo: hasta 398px de contenido dentro de un feed de 229px. El texto queda fuera del viewport, aunque la navegación PageDown/PageUp funciona.",
      fix: "Aplicado: min-inline-size: 0 y overflow-wrap: anywhere en .sk-feed__article, que no tenía ninguno de los dos.",
      status: "fixed",
      source: "packages/core/css/components/feed.css",
    },
  ],
  "image-frame": [
    {
      scenario: "Broken source - 404 intencional",
      cases: ["Broken source"],
      error:
        "La imagen rota conserva el icono nativo y texto alternativo dentro del frame. No hay recuperación automática: es un límite de la composición, no una promesa de fallback incumplida por ImageFrame.",
      fix: "El límite de composición sigue siendo correcto por diseño (ImageFrame no debe auto-recuperar). Pero el escape hatch que esta misma nota sugería - \"img autorado con onError\" - estaba roto: onError pasado vía src llegaba al wrapper, no al <img>, y el evento error nativo no hace bubble, así que nunca se disparaba (confirmado en vivo: un listener en el wrapper nunca corrió). Aplicado: onError ahora se aplica directo al <img> interno. Regresión en image-frame.test.tsx. El estado roto sigue mostrándose igual sin onError, que es lo correcto.",
      status: "fixed",
      source: "packages/react/src/components/image-frame.tsx",
    },
    {
      scenario: "Transparent artwork - modo oscuro",
      cases: ["Transparent artwork"],
      error:
        "El wordmark negro sobre transparencia casi desaparece contra la superficie oscura. Es un problema de contraste del asset, no de aspect-ratio/object-fit.",
      fix: "Aplicado sin tocar el componente: --sk-image-frame-bg ya era un hook publicado en imageFrameContract.hooks, solo que nada lo demostraba para este caso exacto. Agregado un segundo caso \"Transparent artwork, backed\" en el harness que fija --sk-image-frame-bg: #fff en esa instancia (style prop, ya soportado). Verificado en vivo en dark mode: la tarjeta original sigue oscura (correcto, demuestra el problema sin el hook), la nueva mide rgb(255,255,255) y el texto negro es legible. No se invirtieron colores ni se tocó el SVG adverso. Regresión en image-frame.test.tsx.",
      status: "fixed",
      source:
        "apps/docs/src/components/react-demos/debug-image-frame-break.tsx",
    },
  ],
  input: [
    {
      scenario: "Textarea con scroll - Chrome/macOS",
      error:
        "El track opaco del scrollbar heredado rompía visualmente la superficie del textarea.",
      fix: "Aplicado: track transparente en Textarea; regresión en input-scrollbar.spec.ts. El texto largo y el scroll se conservan en el caso.",
      status: "fixed",
      source: "packages/core/css/components/input.css",
    },
  ],
  content: [
    {
      scenario: "Heading / Link - palabras sin espacios",
      error: "Los títulos y enlaces largos podían desbordar su contenedor.",
      fix: "Aplicado: overflow-wrap: anywhere en Heading y Link. No se acortaron los datos para hacerlos caber.",
      status: "fixed",
      source: "packages/core/css/components/typography.css",
    },
  ],
  "file-upload": [
    {
      scenario: "Mensaje de rechazo con un nombre de archivo largo",
      error:
        "El texto de rechazo podía desbordarse con identificadores sin oportunidades de corte.",
      fix: "CSS aplicado: overflow-wrap: anywhere en .sk-file-upload__rejection. Para revalidar el rechazo, seleccionar un archivo fuera de los límites; los archivos precargados son aceptados.",
      status: "fixed",
      source: "packages/core/css/components/file-upload.css",
    },
  ],
  select: [
    {
      scenario: "Select compuesto dentro de FormField",
      error:
        "El ID del trigger difería del ID que Zag usaba como referencia, dejando el menú mal anclado.",
      fix: "Aplicado: sincronizar el ID efectivo del trigger con la máquina. Se añadió regresión en select.test.tsx.",
      status: "fixed",
      source: "packages/react/src/components/select.tsx",
    },
    {
      scenario: "Worst case - etiquetas largas y viewport estrecho",
      error:
        "Las opciones largas se truncaban y el ancho del panel no respetaba el espacio disponible.",
      fix: "Aplicado: opciones con wrap, límites de ancho disponible y capa popover. Se conservan las etiquetas largas y los casos nativos/enhanced.",
      status: "fixed",
      source: "packages/core/css/components/select.css",
    },
  ],
  tabs: [
    {
      scenario: "Worst case / 24 documents",
      cases: ["Worst case", "24 documents"],
      error:
        "A 320px de viewport (229px de contenedor), la tira ocupa 583px; con 24 documentos llega a 1.955px. El panel se desplaza con las tabs y el email no hace reflow.",
      fix: "Aplicado: min-inline-size: 0 y overflow-x: auto en .sk-tabs__list, mismo patrón de scroll que AppBar ya usa en sus propias filas __menus/__status.",
      status: "fixed",
      source: "packages/core/css/components/tabs.css",
    },
  ],
  segmented: [
    {
      scenario: "Worst case",
      cases: ["Worst case"],
      error:
        "Los periodos en alemán producen un control de 669px dentro de un contenedor de 229px; las otras opciones quedan fuera de vista.",
      fix: "Aplicado: overflow-x: auto con max-inline-size: 100% en .sk-segmented, mismo patrón de scroll que Toolbar/Menubar/Tabs; las opciones siguen en una sola línea y seleccionables.",
      status: "fixed",
      source: "packages/core/css/components/segmented.css",
    },
    {
      scenario: "Demo - dir=rtl, foco en Week, ArrowRight",
      cases: ["Demo"],
      error:
        "ArrowRight selecciona Month, que está visualmente a la izquierda. El teclado sigue el orden LTR.",
      fix: "Aplicado: el manejador de teclas ahora lee la dirección efectiva (prop dir o getComputedStyle) y resuelve forward/backward según RTL/LTR; Home/End/Up/Down sin cambios. Regresión en segmented.test.tsx.",
      status: "fixed",
      source: "packages/react/src/components/segmented.tsx",
    },
  ],
  steps: [
    {
      scenario: "Worst case / 12 stages - escritorio, contenedor de 437px",
      cases: ["Worst case", "12 stages"],
      error:
        "Las etiquetas de las etapas se superponen. El fallback vertical sólo mira el viewport, no el ancho del contenedor. El compuesto alemán también sobresale en móvil.",
      fix: "Aplicado: el fallback vertical pasó de @media (max-width: 40rem) a @container (width < 40rem), siguiendo la decisión 35 (todo ancho se pregunta a un contenedor, nunca al viewport) que description-list.css/timeline.css/questionnaire.css ya seguían. overflow-wrap: anywhere añadido al label/description.",
      status: "fixed",
      source: "packages/core/css/components/steps.css",
    },
  ],
  procedure: [
    {
      scenario: "Worst case - viewport de 320px",
      cases: ["Worst case"],
      error:
        "El título alemán y el email/URL desbordan la columna de instrucciones: 441px de contenido dentro de 229px de contenedor.",
      fix: "Aplicado: overflow-wrap: anywhere en .sk-procedure__content, heredado por título y cuerpo, conservando el gutter del marcador.",
      status: "fixed",
      source: "packages/core/css/components/procedure.css",
    },
  ],
  toolbar: [
    {
      scenario: "Worst case - viewport de 320px",
      cases: ["Worst case"],
      error:
        "Un solo comando largo fuerza la barra a 292px dentro de 229px. El wrap entre controles no resuelve un botón que no cabe.",
      fix: "Aplicado: overflow-x: auto además del flex-wrap existente, para el caso de un único control más ancho que el contenedor, que wrap no puede resolver por sí solo.",
      status: "fixed",
      source: "packages/core/css/components/toolbar.css",
    },
    {
      scenario: "Teclado horizontal bajo dir=\"rtl\"",
      error:
        "resolveToolbarKey (packages/core/src/toolbar.ts) nunca tomaba una dirección: en orientación horizontal, ArrowRight siempre significaba \"siguiente índice del array\" sin importar hacia qué lado lee la barra. Mismo patrón que Segmented tenía.",
      fix: "Aplicado: nuevo parámetro dir opcional ('ltr'|'rtl'), que intercambia qué tecla avanza/retrocede solo en orientación horizontal (vertical queda igual, Up/Down no son ambiguos). React y Vanilla ahora calculan la dirección real (getDirection/getComputedStyle) y la pasan. Regresión en toolbar.test.ts (core).",
      status: "fixed",
      source: "packages/core/src/toolbar.ts",
    },
  ],
  menubar: [
    {
      scenario: "Worst case - viewport de 320px",
      cases: ["Worst case"],
      error:
        "Las etiquetas expandidas producen una barra de 621px dentro de 229px; los grupos posteriores quedan fuera de vista.",
      fix: "Aplicado: min-inline-size: 0 y overflow-x: auto en .sk-menubar, que no tenía ninguna regla de ancho antes. Orden de navegación por teclado sin cambios.",
      status: "fixed",
      source: "packages/core/css/components/menubar.css",
    },
    {
      scenario: "Teclado horizontal bajo dir=\"rtl\"",
      error:
        "resolveMenubarKey (packages/core/src/menubar.ts) nunca tomaba una dirección: ArrowRight siempre significaba \"siguiente índice del array\" sin importar hacia qué lado lee la barra. Mismo patrón que Segmented tenía.",
      fix: "Aplicado: nuevo parámetro dir opcional ('ltr'|'rtl'); React y Vanilla calculan la dirección real y la pasan. Regresión en menubar.test.ts (core) y menubar.test.tsx (react).",
      status: "fixed",
      source: "packages/core/src/menubar.ts",
    },
  ],
  "app-bar": [
    {
      scenario: "Teclado horizontal bajo dir=\"rtl\"",
      error:
        "resolveAppBarKey (packages/core/src/app-bar.ts) nunca tomaba una dirección: mismo patrón que Segmented/Menubar/Toolbar.",
      fix: "Aplicado: nuevo parámetro dir opcional ('ltr'|'rtl'); React calcula la dirección real y la pasa, Vanilla igual. Regresión en app-bar.test.ts (core).",
      status: "fixed",
      source: "packages/core/src/app-bar.ts",
    },
  ],
  "time-field": [
    {
      scenario: "Teclado ArrowLeft/ArrowRight entre segmentos bajo dir=\"rtl\"",
      error:
        "moveFocus (React y Vanilla, por separado, misma lógica duplicada) movía siempre en el orden del array de segmentos (hora, minuto, periodo) sin mirar la dirección visual. El auto-avance al completar un dígito usa la misma función y SÍ debe quedarse en orden lógico (no visual); el bug estaba solo en el handler de flechas, no en moveFocus en sí.",
      fix: "Aplicado en ambos bindings: el handler de ArrowLeft/ArrowRight ahora calcula la dirección real y decide si la tecla corresponde a +1 o -1 en el array, dejando moveFocus sin cambios (así el auto-avance al tipear sigue siendo correcto). Regresión en time-field.test.tsx (react) y time-field.svelte.test.ts (vanilla, sin romper nada).",
      status: "fixed",
      source: "packages/react/src/components/time-field.tsx",
    },
  ],
  message: [
    {
      scenario: "Worst case - viewport de 320px",
      cases: ["Worst case"],
      error:
        "El email y la URL desbordan el cuerpo después de la columna del avatar; parte del mensaje queda fuera del contenedor.",
      fix: "Aplicado: overflow-wrap: anywhere en .sk-message__content, sin encoger el avatar.",
      status: "fixed",
      source: "packages/core/css/components/message.css",
    },
  ],
  "otp-input": [
    {
      scenario: "Demo / Worst case - viewport de 320px",
      cases: ["Demo", "Worst case", "Disabled", "Invalid"],
      error:
        "Las filas de seis y ocho dígitos requieren 284px/396px dentro de 229px. Los últimos segmentos quedan fuera de vista y el label hereda el ancho de la fila.",
      fix: "Aplicado: scroll horizontal en .sk-otp-input__control (min-inline-size: 0, overflow-x: auto) en vez de encoger segmentos por debajo del touch target mínimo; el label ya no hereda el ancho desbordado una vez que el control puede encogerse de verdad.",
      status: "fixed",
      source: "packages/core/css/components/otp-input.css",
    },
  ],
  "nav-list": [
    {
      scenario: "Worst case / Large workspace",
      cases: ["Worst case", "Large workspace"],
      error:
        "Los destinos largos se truncan con ellipsis, sin title ni alternativa visible para consultar el nombre completo. El nombre accesible sí conserva el texto.",
      fix: "Aplicado: title={children} en el enlace de NavListLink, que ya tipaba children como string. Regresión en nav-list.test.tsx. Sidebar hereda el fix al reusar el mismo componente.",
      status: "fixed",
      source: "packages/react/src/components/nav-list.tsx",
    },
  ],
  combobox: [
    {
      scenario: "Campo y panel en un contenedor estrecho",
      error: "El mínimo del campo/panel podía superar el ancho disponible.",
      fix: "Aplicado parcialmente: mínimo limitado al contenedor, panel con ancho de referencia/disponible y capa popover. Sigue abierto el desborde de 8px detallado abajo.",
      status: "fixed",
      source: "packages/core/css/components/combobox.css",
    },
    {
      scenario: "Abrir la lista - viewport de 320px",
      error: "La lista portalled sobresale 8px del viewport.",
      fix: "Ya arreglado antes de esta auditoría: medido en vivo con Playwright contra /debug/combobox-break a 320px, el panel encaja exactamente en su contenedor (0.3-0.5px de margen, redondeo de subpíxel). El ledger estaba desactualizado; no hizo falta tocar código.",
      status: "fixed",
      source: "packages/core/css/components/combobox.css",
    },
  ],
  "user-select": [
    {
      scenario: "Worst case - abrir la lista a 320px",
      error: "La lista portalled sobresale 8px del viewport.",
      fix: "Ya arreglado antes de esta auditoría: UserSelect renderiza literalmente la misma clase de contenido que Select (.sk-select__content), que ya tiene el fix de ancho. select-item.spec.ts prueba ese mecanismo compartido a 320px, cubriendo indirectamente a UserSelect también. El ledger estaba desactualizado.",
      status: "fixed",
      source: "packages/react/src/components/user-select.tsx",
    },
  ],
  carousel: [
    {
      scenario: "Worst case - viewport de 320px",
      error: "El título alemán desborda su tarjeta por 36px.",
      fix: "Aplicado: overflow-wrap: anywhere en .sk-carousel__slide, heredado por la tarjeta que compone el consumidor dentro del slide.",
      status: "fixed",
      source: "packages/core/css/components/carousel.css",
    },
    {
      scenario: "1.000 slides - ampliación al 200%",
      error:
        "Se generan 1.000 botones de paginación y un rail de controles de 2.416px.",
      fix: "Aplicado: tope de 20 puntos de paginación (MAX_DOTS); por encima de ese número se usa automáticamente el indicador \"count\" (\"2 / 1000\") que el contrato ya ofrecía, incluso si se pidió indicator=\"dots\". Regresión en carousel.test.tsx.",
      status: "fixed",
      source: "packages/react/src/components/carousel.tsx",
    },
    {
      scenario: "Chevrons de prev/next no cambian de dirección bajo dir=\"rtl\"",
      error:
        "carousel.tsx usa nombres de ícono fijos (chevron-left/chevron-right); data-side=\"start\"/\"end\" ya posiciona el botón correctamente en RTL, pero el ícono seguía apuntando en la dirección LTR. Mismo patrón que Lightbox.",
      fix: "Aplicado: .sk-carousel__button .sk-icon:dir(rtl) { transform: scaleX(-1) }. Verificado en vivo contra el caso \"RTL\" ya existente en /debug/carousel-break: transform ahora es matrix(-1,0,0,1,0,0) bajo RTL.",
      status: "fixed",
      source: "packages/core/css/components/carousel.css",
    },
  ],
  calendar: [
    {
      scenario: "Demo / Range / Constrained",
      error:
        "El heading muestra un mes anterior al de la cuadrícula: se observó September 2026 sobre días de October 2026; la selección de junio aparece bajo May 2026.",
      fix: "Aplicado, y confirmado como bug real de lógica, no de timezone: reproducido en vivo con Playwright (timezoneId America/Los_Angeles) contra /debug/calendar-break. El heading usaba api.visibleRange.start (el primer día de la grilla, que suele ser un día de desborde del mes anterior: el 1 de junio de 2026 cae lunes, así que la grilla empieza el domingo 31 de mayo) en vez de api.focusedValue (el día realmente enfocado/visto). Cambiado a api.focusedValue en ambas ramas (day/month) de headingLabel. Verificado: \"June 2026\" en vez de \"May 2026\" para Range y Constrained. Regresión en calendar.test.tsx.",
      status: "fixed",
      source: "packages/react/src/components/calendar.tsx",
    },
    {
      scenario: "Chevrons de prev/next no cambian de dirección bajo dir=\"rtl\"",
      error:
        "calendar.tsx usa nombres de ícono fijos (chevron-left/chevron-right) para los botones de mes anterior/siguiente, sin flip bajo RTL. Mismo patrón que Lightbox/Carousel/Pagination.",
      fix: "Aplicado: .sk-calendar__previous .sk-icon:dir(rtl) y .sk-calendar__next .sk-icon:dir(rtl) { transform: scaleX(-1) }. Cubre también a DatePicker (misma clase .sk-calendar reutilizada). Verificado en vivo inyectando dir=\"rtl\" en el root contra /debug/calendar-break: transform ahora es matrix(-1,0,0,1,0,0).",
      status: "fixed",
      source: "packages/core/css/components/calendar.css",
    },
  ],
  pagination: [
    {
      scenario: "Chevrons de prev/next no cambian de dirección bajo dir=\"rtl\"",
      error:
        "pagination.tsx usa nombres de ícono fijos (chevron-left/chevron-right), sin flip bajo RTL. Mismo patrón que Lightbox/Carousel/Calendar.",
      fix: "Aplicado: .sk-pagination__previous .sk-icon:dir(rtl) y .sk-pagination__next .sk-icon:dir(rtl) { transform: scaleX(-1) }. Verificado en vivo contra el caso \"RTL, dir=rtl on the container\" ya existente en /debug/pagination-break: transform ahora es matrix(-1,0,0,1,0,0).",
      status: "fixed",
      source: "packages/core/css/components/pagination.css",
    },
  ],
  menu: [
    {
      scenario: "Chevron del indicador de submenú no cambia de dirección bajo dir=\"rtl\"",
      error:
        "El itemIndicator de un trigger de submenú es un chevron-right fijo (menu.ts/menu.tsx); un submenú se abre hacia el borde final del menú, que se invierte bajo RTL, pero el ícono seguía apuntando a la derecha siempre.",
      fix: "Aplicado: button.sk-menu__item > .sk-menu__item-indicator:dir(rtl) { transform: scaleX(-1) }. Verificado por código/selector (.matches() y el CSS servido por Vite confirmados correctos); la verificación en vivo contra /debug/menu-break se vio bloqueada por una duplicación de menu.css en el dev server (importado desde menubar.css/toolbar.css/app-bar.css además de directamente), que deja una copia vieja del stylesheet ganando la cascada en caliente - artefacto de HMR, no del fix. Revalidar en una build real o tras un restart limpio del dev server.",
      status: "fixed",
      source: "packages/core/css/components/menu.css",
    },
  ],
  "date-picker": [
    {
      scenario: "Abrir el calendario enhanced - viewport ≤480px",
      error:
        "El documento se expande hasta aproximadamente 1.000.040px de ancho.",
      fix: "Aplicado y confirmado en vivo (reproducido exactamente: 1.000.040px): .sk-calendar (calendar.css) y .sk-date-picker__content (date-picker.css) comparten el mismo elemento cuando el calendario está embebido, y ambas reglas inline-size (min(18rem,100%) vs min(18rem, 100vi-...)) tienen la misma especificidad (0,1,0); cuál gana depende del orden de import, no de cuál tiene sentido. Cuando gana el 100% de calendar.css dentro de un positioner de position:fixed anclado nativamente sin contenedor de referencia definido, el porcentaje queda sin resolver y el motor lo trata como casi sin límite. Fix: selector combinado .sk-date-picker__content.sk-calendar (0,2,0) que gana de forma determinista. Verificado en vivo: el documento ya no crece, se queda en 364px.",
      status: "fixed",
      source: "packages/core/css/components/date-picker.css",
    },
    {
      scenario: "Range across year boundary - viewport de 320px",
      error:
        "Los controles del campo recortan los dos valores de fecha del rango.",
      fix: "Aplicado y confirmado en vivo: cada input de fecha tenía minmax(0,1fr) sin piso, así que a 320px cada uno quedaba más angosto que un valor con formato (\"12/29/2025\") y el texto nativo se desplazaba internamente, mostrando solo una parte. Se dio a .sk-date-picker__input un min-inline-size: 6.5rem real, y la fila (.sk-date-picker__control en modo range) ahora hace scroll horizontal en vez de encoger más allá de ese piso o empujar la página, mismo patrón que OtpInput/Segmented/Toolbar. Verificado: ambos valores visibles por completo (104px/103px de ancho de input vs 85px que necesita el texto), sin overflow nuevo en la página.",
      status: "fixed",
      source: "packages/core/css/components/date-picker.css",
    },
  ],
  lightbox: [
    {
      scenario: "Galería abierta - dir=rtl",
      error:
        "El contador se invierte visualmente: la primera imagen se lee como 7 / 1.",
      fix: "Aplicado: direction: ltr y unicode-bidi: isolate en .sk-lightbox__counter, para que \"1 / 7\" no se reordene con el algoritmo de bidi dentro de un contexto RTL.",
      status: "fixed",
      source: "packages/core/css/components/lightbox.css",
    },
    {
      scenario: "Galería abierta - dir=rtl",
      error:
        "Los botones de navegación cambian de posición, pero las direcciones de sus chevrons no cambian.",
      fix: "Aplicado: .sk-lightbox__nav .sk-icon:dir(rtl) { transform: scaleX(-1) }, mismo patrón :dir(rtl) que hero.css/vaul.css ya usan en este kit.",
      status: "fixed",
      source: "packages/core/css/components/lightbox.css",
    },
  ],
  listbox: [
    {
      scenario: "Worst case",
      error:
        "Las opciones largas se truncan con ellipsis sin una forma visible de consultar el texto completo.",
      fix: "Aplicado: title={item.label} en cada <li> de opción. Regresión en listbox.test.tsx.",
      status: "fixed",
      source: "packages/react/src/components/listbox.tsx",
    },
  ],
  popover: [
    {
      scenario: "Worst case - abrir a 320px",
      error:
        "Un email/URL largo fuerza el panel a unos 840px y deja contenido fuera del viewport.",
      fix: "Aplicado: overflow-wrap: anywhere en .sk-popover__content. La cifra original de 840px ya no aplica (el positioner tiene un cap de 24rem desde antes), pero el contenido sin wrap seguía pudiendo desbordar esa caja.",
      status: "fixed",
      source: "packages/core/css/components/popover.css",
    },
  ],
  tooltip: [
    {
      scenario: "Long realistic explanation - viewport de 320px",
      cases: ["Long realistic explanation"],
      error:
        "Antes del fix, el texto de facturación expandía el tooltip a unos 1.146px en una sola línea.",
      fix: "Aplicado: se anula el min-width: max-content inline de Zag, se limita a 18rem/viewport y se usa overflow-wrap: anywhere. Verificado a 320/390/1280px y con tooltip-width.spec.ts.",
      status: "fixed",
      source: "packages/core/css/components/tooltip.css",
    },
  ],
  icon: [
    {
      scenario: "name dinámico sin drawing en el set activo",
      error:
        "set[name] es undefined cuando el nombre no existe en el set activo (ej. calculado desde una API); renderIconBox lee icon.attrs/.viewBox/.body sobre undefined y crashea el árbol de React completo. El propio comentario del contrato confirma que esto ya pasó una vez (\"inbox\").",
      fix: "Aplicado: guard en <Icon> que renderiza null y emite un devTicket cuando el set no tiene el nombre pedido, en vez de crashear. validate_ui sigue cubriendo el caso de un tree construido por contrato; este guard cubre el JSX directo con un name calculado en runtime. Regresión en icon.test.tsx.",
      status: "fixed",
      source: "packages/react/src/components/icon.tsx",
    },
  ],
  "qr-code": [
    {
      scenario: "value que excede la capacidad de codificación",
      error:
        "qrGeometry lanza QrError cuando value no cabe en la versión 40 al nivel de corrección elegido (ej. una URL larga con muchos query params); el componente de React no lo capturaba y el crash tiraba abajo todo el árbol de React en producción, aunque core ya tenía un test que prueba que esto lanza (qr-code.test.ts).",
      fix: "Aplicado: try/catch alrededor de qrGeometry en <QRCode>, con data-status=\"error\" y un devTicket en dev en vez de un SVG roto. Regresión en qr-code.test.tsx.",
      status: "fixed",
      source: "packages/react/src/components/qr-code.tsx",
    },
  ],
};

export function openBreakFindings(component: string): string[] {
  return (breakFindings[component] ?? [])
    .filter((finding) => finding.status === "open")
    .map((finding) => finding.error);
}
