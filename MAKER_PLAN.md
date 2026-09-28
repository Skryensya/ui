# Plan: Maker

Un constructor visual de páginas donde **el navegador es el motor de layout**. La persona compone
signatures en un árbol dentro del flujo normal del documento; nada tiene coordenadas. El layout se
expresa con `Stack`, `Inline`, `Grid`, `Box` y `Wrapper`, y con las opciones que sus contracts ya
declaran.

Relacionado: [ADR-0031](docs/decisions/0031-the-maker-speaks-only-the-contract-and-changes-only-through-operations.md)
(la decisión), ADR-0014 (el usage tree es la moneda única), ADR-0025 (hotkeys sobre Zag), ADR-0030
(espaciado `*Expanded`), `CONTEXT.md` § Maker (vocabulario).

---

## 0. Decisiones cerradas

| # | Decisión |
| --- | --- |
| 1 | El producto se llama **Maker**. No "editor": ese nombre es del Editor de texto enriquecido. |
| 2 | El MVP edita **una Maker page**. `SiteDocument` (varias páginas) queda fuera. |
| 3 | Un **Maker node** es un nodo de usage tree más un `id` estable. `toUsageTree()` quita los ids y no pierde nada más. Core no cambia. |
| 4 | El inspector muestra **solo** lo que el contract declara. Lo que falte se agrega al contract en core (los dos bindings) o no existe. |
| 5 | Grid gana `minColumn` (auto-fit), en vez de reescribir `responsive`/`multicol`. |
| 6 | El **stage** es un iframe con el ancho del preview; React monta dentro con `renderTree`. |
| 7 | La estructura siempre es válida (las drop zones respetan el contract); las opciones pueden quedar **Pending**. |
| 8 | Toda mutación es una **Maker operation** de un conjunto cerrado. Ninguna acepta una posición. |
| 9 | La v1 no incluye AI, backend ni varias páginas. |
| 10 | Vive en `apps/maker` + `packages/maker-model`. |
| 11 | Stack **no** gana `justify` (sin alto fijo no hace nada). |
| 12 | Stack **no** gana `padding`: es de Box, y el Maker ofrece "wrap in Box". |
| 13 | Fill/Fit es un `childAttr` que declara el parent: `Inline > [data-sizing="fit\|fill"]` (enum, porque los attrs son strings). |
| 14 | Restringir el ancho es `Box measure: sm \| md \| lg` sobre `--size-wrapper-*`, sin centrar. |
| 15 | El radius no se vuelve opción (es theming). El `gutter` del Wrapper **sí** se muestra, porque ya es opción del contract. |
| 16 | `minColumn: sm \| md \| lg` → `--size-column-*` = 12 / 18 / 24rem; prohíbe `columns` explícito. |
| 17 | El Maker nunca expone container queries como control; un componente que las necesita las lleva en su CSS. |
| 18 | La raíz de una Maker page es `Main`, fija y no borrable; sus hijos son libres. |
| 19 | Un contenedor que queda vacío se conserva, muestra una drop zone con placeholder y queda Pending. |
| 20 | `wrap` solo agrupa hermanos contiguos del mismo parent; el contenedor toma el índice del primero. |
| 21 | El palette ofrece el catálogo completo, filtrado por lo que puede ir en el nodo seleccionado. Los slots de colección se editan como lista en el inspector. |
| 22 | El texto se edita en el inspector en la v1; la edición inline sobre el stage viene después. |
| 23 | Outline + teclado es la vía completa y accesible; el DnD sobre el stage también entra en la v1. |
| 24 | Los presets se generan del contract; el overlay semántico los corrige donde lo generado no tenga sentido. |
| 25 | Los 29 snippets aparecen como pestaña **Sections** del palette. |
| 26 | Anchos del stage: 36 / 52 / 72 / 90rem + Fit + handle arrastrable. |
| 27 | Color mode, density, brand y high contrast son controles del stage; no se guardan en la página. |
| 28 | Cada página guarda `formatVersion` + `sourceHash`; si el catálogo cambió, lo que no encaje queda Pending. |
| 29 | Un paso de undo es un gesto; un gesto puede agrupar varias operaciones. |
| 30 | La selección muestra tipo, parent, posición, **layout role**, las opciones y el grupo "In this \<parent\>". |
| 31 | Teclado: estilo TreeView, `Alt+flechas` para mover, `Mod+G` / `Mod+Shift+G` para wrap/unwrap, `Del`, `Mod+D` (duplicar = `insert` de una copia). |
| 32 | Las adiciones al contract van **antes** y en PRs separados. |
| 33 | El stage tiene modo **Edit** (el click selecciona) y **Interact** (todo funciona); la navegación siempre está bloqueada. |
| 34 | El contenido del top layer se edita desde el outline; seleccionar un nodo dentro de un Dialog lo abre en el stage mientras dure la selección, sin guardarse. |
| 35 | Los slots con nombre son sub-ramas del outline con sus propias drop zones. |
| 36 | Export: Maker page JSON, usage tree JSON, TSX, HTML + CSS; se exporta aunque esté Pending, con un aviso. |
| 37 | Pruebas: TDD en el modelo, un property test sin coordenadas y Playwright en la app. |
| 38 | ADR-0031 cubre el Maker; las adiciones al contract solo llevan su changelog entry. |
| 39 | Las opciones `*Expanded` se muestran junto a su opción base. |
| 40 | El MCP desactualizado se arregla aparte. |

### Lo que el Maker nunca hace

`position: absolute`, drag libre por coordenadas, resize handles que escriban width/height, snapping
por píxel, canvas infinito, offsets manuales, márgenes negativos, transforms como layout. Ninguna
Maker page guarda x, y, top, left, translate, un ancho o alto calculado, ni un rect medido.

---

## Fase 0. Hallazgo aparte (fuera del Maker)

- [ ] Rebuild y redeploy del MCP `skryensya-ui`: `get_contract` sirve un manifest viejo, sin
      `gapExpanded`, `paddingExpanded`, `appearance` ni el `gutter` de Wrapper que sí están en
      `packages/core/src/layout.ts`.

---

## Fase 1. Adiciones al contract (tres PRs, antes del Maker)

Cada PR: opción en `packages/core/src/layout.ts`, CSS en `packages/core/css/patterns/`, overlay en
`contracts/semantic/`, changelog entry que pase el surface gate, un usage tree de evidencia en los
dos bindings (ADR-0015) y verde en `ai-gates`.

### 1.1 `Inline > [data-sizing]` (Fill / Fit)

- [x] `childAttrs.sizing` (`fit | fill`, `data-sizing`) en el slot `children` de `Inline`, como el `width` de `LayoutGrid`. Enum y no boolean: `attrs` son strings y el validador rechaza un boolean.
- [x] CSS: `.sk-inline > [data-sizing="fill"] { flex: 1 1 auto; min-inline-size: 0 }`: parte del contenido, así la fila hace wrap antes de apretar.
- [x] `fill` + `equal`: sin constraint (un `childAttr` no puede excluir una opción del parent); documentado que bajo `equal` no agrega nada.
- [x] Changelog entry de `layout`.
- [x] Usage tree de evidencia (`layout/logical-sizing`) y medición en `logical-sizing.spec.ts`.
- [x] Gate de simetría vanilla/React verde.

### 1.2 `Box measure` (Constrain)

- [x] Opción `measure: sm | md | lg` (`data-measure`) sobre `--size-wrapper-*`, sin centrar.
- [x] Agregar `measure` al `atLeastOneOf` de Box (junto a `padding`, `surface`, `border`, `appearance`).
- [x] CSS: `max-inline-size` con el token; nunca `width`.
- [x] Changelog entry de `box`.
- [x] Usage tree de evidencia (`layout/logical-sizing`) y medición (techo exacto, sin desplazarse).
- [x] Gate de simetría verde.

### 1.3 `Grid minColumn` (auto-fit)

- [x] Tokens tier-2 `--size-column-sm | md | lg` = 12 / 18 / 24rem en `packages/core/css/semantic/_size.scss`.
- [x] Opción `minColumn: sm | md | lg` (`data-min-column`) en la signature `Grid`.
- [x] Constraint: `excludes: { minColumn: [columns, multicol, responsive, fill] }`.
- [x] CSS: `grid-template-columns: repeat(auto-fit, minmax(min(var(--size-column-*), 100%), 1fr))`, tres reglas escritas y sin hook público.
- [x] Changelog entry de `layout`.
- [x] Evidencia: el mismo Grid da 3 carriles en 1000px y 1 en 400px con el mismo viewport; en 150px no desborda.
- [x] Gate de simetría verde; baseline visual del stage regenerado (+1 caso).

---

## Fase 2. `packages/maker-model` (puro, sin DOM, TDD)

### 2.1 Paquete

- [x] Crear `packages/maker-model` (`private`, `type: module`, exporta el source TS como el resto).
- [x] Depende solo de `@skryensya/core` y de `@skryensya/ai-compiler/validate`; los tests usan también `/emit`, los snippets y los árboles de `ai-gates`.
- [x] `vitest` + `tsc --noEmit` en `check`; turbo lo recoge solo.

### 2.2 Tipos

- [x] `MakerNode` = nodo de usage tree + `id`; cada slot es explícito (`text`, `nodes`, `items`) y el texto en un slot de nodos es un `MakerText` con id propio, movible.
- [x] `MakerPage` = `{ format, formatVersion, sourceHash, root }`, con raíz `Main`.
- [x] Ningún campo de posición, tamaño ni rect en ningún tipo (verificado en 2.8).

### 2.3 Proyección

- [x] `toUsageTree(node)`: quita los ids, pura, en forma canónica.
- [x] `fromUsageTree(tree, newId)`: asigna ids nuevos (snippets, usage trees).
- [x] Ida y vuelta sobre los 218 árboles del repo (29 snippets + casos de los gates): mismo markup, mismo TSX, misma validez.

### 2.4 Operaciones

- [x] `insert(at, child)`, `move(child, to)`, `remove(child)`: `Place` = parent + slot + índice de hueco.
- [x] `remove` nunca borra la raíz; un contenedor vaciado queda (Pending).
- [x] `wrap(children, container)`: solo hermanos contiguos; el contenedor toma el lugar del primero y viaja con su id.
- [x] `unwrap(node)`: los hijos toman su lugar, en orden; rechaza si el nodo tiene contenido fuera de `children`.
- [x] `setOption(node, name, value | undefined)`: solo opciones declaradas, solo valores del contract.
- [x] `setText` y `setItems` (el "set a slot" acordado).
- [x] **`setAttr` (nuevo, fuera de lo acordado):** hace falta para `data-sizing` y para `aria-label`. Nunca `style`, `class` ni handlers; `data-*` solo si el slot del parent lo publica. Registrado en ADR-0031 y `CONTEXT.md`.
- [x] Al cambiar de parent se descartan los `childAttrs` que publicaba el slot anterior; al reordenar se conservan.
- [x] Duplicar = `insert` de `reidentify(copia)`.
- [x] Toda operación rechaza (no repara) lo estructuralmente inválido; un gesto (`applyAll`) entra entero o no entra.

### 2.5 Reglas de estructura

- [x] `canPlace`/`canPlaceAt` desde el contract: `accepts`, `of`, `parents`, `notInside` a cualquier profundidad, topes (`maxItems`, `cardinality`). Los mínimos son Pending, no rechazo.
- [x] Modelo de contenido HTML (el `content-model` del validador, sobre un árbol de prueba): nada de bloques dentro de un `<p>`, un `<h2>` o un `<button>`. Aplicado a toda operación estructural (el property test encontró que wrap/unwrap lo esquivaban).
- [x] `dropTargets(root, child)`: todos los huecos válidos, sin los dos huecos vecinos (no-op) ni el interior del propio nodo.
- [x] `insertionPlace(root, selected)` e `insertable(root, place, presetOf)` para el palette.

### 2.6 Presets

- [x] `presetFor(ref, newId)`: defaults + lo mínimo que satisface `requires`, `exactlyOneOf`, `atLeastOneOf`, `implies`; placeholder en slots requeridos de texto/colección; contenedores de layout vacíos.
- [ ] Lectura de un preset desde el overlay semántico cuando exista (campo nuevo en `contracts/semantic/*.yaml`). Pendiente hasta que un preset generado no alcance.
- [x] Test: los presets de las 211 signatures del catálogo quedan, como mucho, Pending (ninguno rompe una regla de "lo que hay está mal").

### 2.7 Pending, historial, persistencia

- [x] `pending(root)`: corre `validate` sobre la proyección y ubica cada problema en los nodos de su trail.
- [x] Contenedor vacío = Pending (`missing-required-slot`), no error de estructura.
- [x] Historial: un paso = un gesto; undo/redo; un gesto rechazado o vacío no deja paso.
- [x] `serialize`/`parse` con `formatVersion` + `sourceHash`; con otro hash abre y avisa `catalogueChanged`.
- [x] `layoutRole(root, id)`: parent, posición "n of m" y la frase en términos del parent.

### 2.8 Property test

- [x] Generador con semilla (mulberry32, sin dependencias nuevas): 40 semillas × 60 operaciones aleatorias.
- [x] Invariante: ninguna regla estructural rota (las opciones pueden quedar Pending).
- [x] Invariante: ningún nodo lleva `style`, `class`, `x`, `y`, `top`, `left`, `transform`, `translate`, `position`, márgenes ni medidas.
- [x] Invariante: ids únicos, y undo de todo vuelve a la página inicial.

---

## Fase 3. `apps/maker` (Vite + React)

### 3.1 Esqueleto

- [x] `apps/maker` con Vite + React, `@skryensya/react` y los CSS de core (y la fuente del kit: el Root contract deja la fuente del `body` al consumidor).
- [x] Layout: outline + palette · stage · inspector, construido con componentes del kit (TreeView, SegmentedControl, NativeSelect, FormField, Input, Button, Stack/Inline).
- [x] Estado (`src/state.ts`): historial de Maker pages + vista (selección, ancho, modo, theming); solo la página se persiste y se exporta.
- [x] Persistencia en `localStorage` con try/catch; import/export de JSON desde el panel Export.
- [x] Script de dev (`pnpm --filter @skryensya/maker dev`, puerto 4200).
- [ ] Dockerfile como las otras apps. Pendiente: nadie despliega el Maker todavía.

### 3.2 Stage

- [x] Segunda entrada de Vite (`stage.html`), mismo origen, en un iframe: el chrome lee su DOM directo, sin trucos de `srcdoc`.
- [x] Cada nodo lleva `data-maker-node` **solo en la proyección del stage** (`stageTree`); nunca en la página, el historial ni el export (verificado en el test de export).
- [x] Anchos 36 / 52 / 72 / 90rem + Fit + handle arrastrable del stage.
- [x] Indicador de si el stage está en compacto o expandido (≥ 52rem) para las opciones `*Expanded`.
- [x] Color mode, high contrast, density (`--sk-density`) y radius (`data-radius`) en la raíz del stage, sin guardarse. Brand quedó fuera: no es una dimensión sino el bundle de acento, y no hay más de uno.
- [x] Modo **Edit** (el click selecciona, el pointer no activa nada) y **Interact**.
- [x] Navegación y submit bloqueados en los dos modos.
- [x] Top layer: el Dialog/Popover seleccionado, o que contiene la selección, se abre en el stage y se cierra al deseleccionar; nunca se guarda abierto.

### 3.3 Overlays

- [x] Capa de overlays sobre el iframe, `pointer-events: none`, sin caja en la página.
- [x] Hover, selección (con etiqueta) e indicador de drop (línea entre hermanos o caja para un contenedor vacío), desde rects leídos al vuelo.
- [x] Se recalculan al renderizar, al cambiar el ancho (ResizeObserver) y al hacer scroll en el stage.

### 3.4 Outline

- [x] TreeView del kit; slots con nombre como sub-ramas (`› actions`), visibles cuando tienen algo o el nodo está seleccionado; texto como hojas entre comillas.
- [x] Selección sincronizada con el stage y el inspector.
- [x] Click en la fila selecciona sin plegar; solo el chevron o el teclado pliegan.
- [x] Teclado: `Alt+↑/↓` mover, `Alt+←` sacar al parent, `Alt+→` entrar al hermano anterior, `Mod+G` wrap en Stack, `Mod+Shift+G` unwrap, `Mod+D` duplicar, `Delete` quitar, `Mod+Z` / `Mod+Shift+Z`. Lo que el contract rechaza se avisa y no cambia nada.
- [ ] Los atajos se registran con listeners propios, no con el sistema de hotkeys de Zag (ADR-0025). Pendiente de migrar.
- [x] DnD en el outline: arriba/abajo de una fila = antes/después; banda central = adentro (si es contenedor); sub-rama de slot = adentro del slot.
- [x] Marca "· pending" por nodo en el outline.

### 3.5 DnD en el stage

- [x] Arrastrar el nodo seleccionado desde el stage (umbral de 4px, así un click sigue siendo click).
- [x] Resolución: cerca del borde de un elemento (¼ de su tamaño, máx. 24px) el drop va antes/después de él; en su interior, adentro. El eje sale del estilo computado (un Stack es un grid de una columna: fluye hacia abajo).
- [x] Indicador estructural, nunca una posición libre; el drop emite un solo `move` o `insert`.
- [x] `Esc` cancela; el click que sigue a un drop no cambia la selección.

### 3.6 Inspector

- [x] Encabezado: signature, contract, parent (enlace), "n of m" y layout role.
- [x] Opciones del contract: enum y boolean como select con "(default: …)"; string y number como campo que confirma en blur/Enter.
- [x] Opciones `*Expanded` agrupadas bajo "On expanded widths (≥ 52rem)".
- [x] Grupo "In this \<parent\>" con los `childAttrs` del parent (sizing en Inline, width en LayoutGrid).
- [ ] Grid como "Columns: Fixed | Auto-fit": hoy `columns` y `minColumn` son dos selects y el conflicto se muestra como Pending (`excluded-option`).
- [x] Contenido: slots de texto, text runs y colecciones (agregar, quitar, reordenar entradas).
- [x] Nombre accesible (`aria-label`) cuando la signature lo acepta.
- [x] Acciones: wrap in (Stack, Inline, Grid, Box, Wrapper), unwrap, duplicate, remove.
- [x] Problemas Pending del nodo, con el texto del validador.
- [x] Ningún campo de CSS, px, x, y ni tamaño (verificado en test).

### 3.7 Palette

- [x] **Components**: catálogo agrupado por categoría, filtrado por lo que cabe en el lugar de inserción.
- [x] Búsqueda con Discovery (`@skryensya/ai-compiler/discover` sobre `ai-index.json`, en el navegador).
- [x] **Sections**: los 29 snippets, filtrados por lo que cabe, insertados con ids nuevos.
- [x] Insertar con click (en la selección) o arrastrando al outline o al stage.

### 3.8 Export

- [x] Maker page (JSON), usage tree (JSON), React (TSX, componente `Page`) y HTML, con los imports de CSS de `sheets-for-tree`.
- [x] Con Pending exporta igual, con aviso y la lista de problemas.
- [x] Descargar, copiar y abrir una Maker page guardada.

### 3.9 Pruebas de la app (`pnpm --filter @skryensya/maker test`, 16 specs)

- [x] La paleta construye una página real que el binding de React renderiza.
- [x] DnD en el stage (borde de un bloque → antes) y en el outline; del palette al stage dentro de un Inline.
- [ ] DnD en el stage dentro de un Grid y de un Inline con wrap en varias líneas.
- [x] Teclado: mover, wrap, unwrap, duplicar, quitar, undo; un movimiento rechazado se avisa y no cambia la página.
- [x] Cambiar el ancho del stage no cambia la Maker page.
- [x] Modo Edit selecciona; Interact activa; la navegación queda bloqueada.
- [x] Fill/Fit en el inspector y descartado al salir del Inline.
- [x] Contenedor vaciado: queda, con drop zone y Pending.
- [x] La página guardada no tiene coordenadas, tamaños ni estilos; el export no lleva `data-maker-node`.
- [x] Dialog abierto en el stage solo mientras está seleccionado.
- [x] Axe sin violaciones en la interfaz del Maker.

---

## Fase 4. Cierre de la v1

- [ ] Construir en el Maker, sin tocar código, una landing de ejemplo (navbar, hero, grid de tiles, footer) y revisarla a 36 / 52 / 90rem.
- [ ] Verificar que el TSX y el HTML exportados renderizan igual que el stage (los dos bindings).
- [ ] Documentar el Maker en `README.md` (qué hace) y enlazar ADR-0031.
- [ ] Marcar ADR-0031 como aceptado con la evidencia.

---

## Después de la v1 (no se construye ahora)

- [ ] Edición por prompt: un tool MCP `apply_operations` que solo acepta Maker operations.
- [ ] Edición inline de texto sobre el stage.
- [ ] `SiteDocument`: varias páginas y piezas compartidas (navbar/footer una sola vez).
- [ ] Persistencia en backend.
- [ ] Migraciones explícitas de Maker pages cuando exista el primer consumidor.
- [ ] Container queries en los primitivos, como cambio de todo el kit (ADR-0030 lo deja fuera).
