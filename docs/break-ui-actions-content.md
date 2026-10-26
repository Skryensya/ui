# Break UI: acciones y contenido

## Alcance

Nueve páginas nuevas en `/debug`: `state-button-break`, `split-button-break`,
`clipboard-break`, `code-preview-break`, `details-break`, `comparison-table-break`,
`comment-thread-break`, `feed-break` e `image-frame-break`. Total: 66 harnesses;
**el catálogo todavía no está completamente cubierto**.

Fixtures: `apps/docs/src/components/react-demos/debug-<nombre>-break.tsx`.
Errores y fixes: `apps/docs/src/lib/break-findings.ts`, compartido por el índice,
el diagnóstico de cada página y las anotaciones junto a los casos afectados.
Todos los fixes de esta tanda son propuestas **sin aplicar**. Los specimens no
reciben CSS correctivo del harness; sus desbordamientos permanecen visibles.
Sólo las colecciones explícitas de 1.000 elementos tienen un viewport con scroll.

## Datos y límites

Las fuentes son las props públicas de `packages/react/src/components/` y sus
contratos en `packages/core/src/`. No hay backend ni validadores de longitud en
estos fixtures. «Sin máximo» se refiere al contrato de biblioteca, no a una política
recomendada para aplicaciones.

| Componente | Campos / origen de datos | Límites y casos |
| --- | --- | --- |
| StateButton | `faces[].name/icon`, `current`, aria-label y disabled | Iconos del enum; ≥2 faces y current debe pertenecer a ellas cuando se proporciona. Nombres/label sin máximo. Se identifican como **inválidos** cero/una face y current desconocido; no se cuentan como promesas incumplidas. |
| SplitButton | label de acción/grupo/menú, `menuItems[].label/value/disabled`, loading y callbacks | Texto/cantidad sin máximo; menú opcional. Demo, título largo, cero/una alternativa, disabled y loading. |
| Clipboard | fieldLabel/value, nombre de botón, copiedLabel/errorLabel y timeout | Strings sin máximo; timeout ≥0. URL larga, mezcla de scripts, valor vacío, éxito y denegación. El campo usa elipsis, pero copiar debe conservar todo el valor. |
| CodePreview | label/note, código como children, lines/previewLines, labels del disclosure | Texto/líneas sin máximo; metadata opcional. 0/1/3/1.002 líneas; el fichero grande tiene reglas de routing únicas, no texto aleatorio repetido. |
| Details | summaries, cuerpos, group name y open | Texto/cantidad sin máximo; body vacío. 0/1/1.000 disclosures y un grupo con summaries largos. La exclusión de aperturas la controla el navegador mediante name. |
| ComparisonTable | caption/aspectLabel, cabeceras, etiquetas de fila y celdas | Contrato: 2–4 columnas. Texto/filas sin máximo. Se respetan 2/4 columnas y la misma cantidad de celdas en cada fila; datos vacíos no significan estructura inválida. 0/1/1.000 aspectos. |
| CommentThread | autor/avatar, timestamp, body, votos formateados, respuestas y composer | Texto/cantidad/profundidad sin máximo; avatar/timestamp/replies opcionales. Votos −42/0/1/1.284, seis niveles y 0/1/1.000 comentarios. Avatar sm como en la composición documentada. Votos/respuestas son estado local del consumidor; no hay persistencia. |
| Feed | label del feed/artículo, body, posInset/setSize y busy | Texto/cantidad sin máximo; posición ≥1, total puede ser −1 si se desconoce. 0/1/1.000 artículos y carga en curso. Keyboard opt-in habilitado. |
| ImageFrame | src/alt, aspect/fit, children | Exactamente una fuente src o children; enums de aspect/fit. Foto local, calibraciones SVG 4000×200 y 200×4000, 404 deliberado, artwork transparente. Sin media es explícitamente **inválido**, no un empty state soportado. |

## Qué se rompió

Medidas iniciales de Chromium a 320px de viewport: el shell deja 229px al
specimen. No se usa el ancho del documento como único criterio: en CodePreview,
por ejemplo, el alto de la metadata ya prueba el defecto aunque el texto envuelva.

| # | Severidad | Caso / fallo confirmado | Fix propuesto y ubicación |
| --- | --- | --- | --- |
| 1 | Broken | CodePreview: filename de una letra por línea; header de 1.610px de alto con note largo | Metadata que pueda reducirse y envolver; pasar note a otra fila si hace falta. `packages/core/css/components/code-preview.css:106`. |
| 2 | Broken | CodePreview: 1.002 líneas visibles al cargar (~21.763px de alto) pese a aria-expanded=false. Primer clic no cambia altura: ya estaba desplegado. | Sincronizar atributo CSS, estado inicial y disclosure. El shell de docs también monta un enhancer Vanilla; verificar ambos bindings aislados antes de atribuir toda la interacción a uno. `packages/react/src/components/code-preview.tsx:71`, `packages/core/css/components/code-preview.css:355`. |
| 3 | Broken | SplitButton: 369px en worst case y 393px en loading; trigger de alternativas fuera de vista | Contener el grupo y envolver sólo la acción principal, sin perder trigger/targets ni la unión visual. `packages/core/css/components/split-button.css:63`. |
| 4 | Broken | Clipboard: feedback de éxito de 425px y de denegación de 583px, ambos fuera de viewport | Cap por ancho disponible y wrap de feedback largo; conservar live region y error real. `packages/core/css/components/copy-button.css:95`. |
| 5 | Broken | Details: compuesto alemán bajo el chevron, recortado contra el borde | Wrap de palabras largas en summary con columna estable para el indicador. `packages/core/css/components/details.css:84`. |
| 6 | Broken | ComparisonTable: tabla de cuatro columnas de 816px; incluso demo de dos columnas ocupa 245px dentro de 229px | Reflow/scroll propio acordado y wrap de texto identificador. No truncar importes ni ocultar columnas. `packages/core/css/components/comparison-table.css:16`. |
| 7 | Broken | CommentThread: autor y timestamp compiten; email/URL desbordan hasta 425px | Metadata que pueda reducirse/apilarse y wrap del body. `packages/core/css/components/comment-thread.css:132`, `:162`, `:182`. |
| 8 | Fragile | CommentThread: seis niveles dejan 45px de body; fila de acciones de 51px para grupo de votos de 84px | Adaptar indentación al contenedor sin aplanar la relación entre respuestas ni encoger targets indefinidamente. `packages/core/css/components/comment-thread.css:277`. |
| 9 | Broken | Feed: email/URL producen 398px de contenido en artículo dentro de 229px | Contener artículos y envolver identificadores, conservando foco/ARIA. `packages/core/css/components/feed.css:19`. |
| 10 | Fragile - composición | ImageFrame con 404 conserva icono nativo y alt; no hay recuperación | Política de fallback en el consumidor con img autorado/onError o fuente alternativa. No es una garantía incumplida de ImageFrame. Mantener el 404 del harness. `packages/react/src/components/image-frame.tsx:58`. |
| 11 | Fragile - asset | Wordmark negro transparente casi invisible en oscuro | Variante del asset o fondo de marca acordado. No invertir todas las imágenes ni cambiar el adverso del harness. `apps/docs/src/components/react-demos/debug-image-frame-break.tsx`. |

## Decisiones y qué resistió

- Recomiendo wrap para filenames, preguntas y mensajes; no reducir la fuente ni
  reemplazar el dato largo por uno que quepa.
- En la comparación, decidir scroll propio frente a reflow: las cifras y las
  relaciones de fila/columna deben conservarse completas.
- El fallback y contraste de ImageFrame pertenecen a la composición/asset;
  no se añadió un parche global a la biblioteca para borrar esos casos.
- StateButton cambia una sola face activa y respeta disabled; un aria-label largo
  no altera la geometría del icono. Los inputs fuera del contrato siguen visibles.
- SplitButton ejecuta acción principal/alternativa distintas; disabled/loading
  deshabilitan ambos controles.
- Clipboard copia **todo** el value largo; el estado de rechazo aparece tanto con
  valor vacío como con escritura/fallback denegados en el navegador de prueba.
- Details mantiene un solo disclosure abierto por name; su body sí envuelve las
  direcciones largas. Markup adverso se ve como texto literal.
- Feed mueve foco con PageDown y expresa busy/setSize=−1 durante carga.
- CommentThread permite votar, responder localmente y cerrar con Escape. El host
  controla replyOpen y escucha el cierre nativo para conservar ese estado coherente.
- ImageFrame conserva proporción/crop/contain con las calibraciones extremas.

## Validación y límites de esta pasada

- 45 cargas de ruta/entorno sin excepciones JS: 1280px claro LTR, 320px claro LTR,
  2560px claro LTR, 320px oscuro RTL y 320px claro con zoom CSS 200%. No es zoom
  nativo ni hardware táctil real. El 404 de la imagen es intencional.
- Capturas revisadas de los defectos principales en móvil, metadata de CodePreview
  también en escritorio y artwork en oscuro. No se afirma una inspección visual
  exhaustiva de todas las combinaciones a 2560px o 200%.
- Self-checks con asserts para las interacciones anteriores, scopes de tabla,
  texto copiado y rechazo de permisos. Los defectos abiertos se miden y documentan,
  no se convierten en tests que falsamente declaren que el comportamiento es correcto.
- Los tests de guard dev-only/índice/diagnósticos continúan cubriendo las rutas.
  El typecheck general sigue bloqueado fuera de estos nuevos harnesses.
- Sin suite completa, build de producción, VoiceOver/NVDA, Firefox ni perfiles de
  rendimiento de las colecciones de 1.000 elementos.
