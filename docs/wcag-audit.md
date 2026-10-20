# Auditoría WCAG 2.2 AA

Octubre 2026. Complementa `docs/aria-apg-audit.md` (comportamiento y ARIA por patrón APG) con lo que esa auditoría y los gates de
`packages/ai-gates` no miran: **contraste en uso real, tamaño de objetivo, foco no oculto y el propio sitio de docs**.

Este documento tiene cuatro partes: método, hallazgos, matriz WCAG 2.2 y lo que queda sin cubrir.

## 1. Método

Todo se midió contra el sitio de docs en desarrollo (`apps/docs`, puerto 4173), en las **122 páginas de `/components/*`** (rutas en inglés;
las españolas comparten componentes).

| Medición | Cómo | Qué cubre |
|---|---|---|
| **axe-core 4.12.1**, reglas `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` (incluye `color-contrast` y `target-size`) | Playwright, página en reposo (pestaña Overview), en **claro, oscuro y alto contraste**; se inyecta también dentro de los iframes de los ejemplos (2 documentos por página de media) | Estructura, nombres, contraste, tamaño de objetivo, regiones con scroll |
| **Contraste en oscuro real** | Segundo barrido con `colorScheme: "dark"` emulado (no cambiando `data-scheme` en caliente, que daba artefactos) | Contraste en modo oscuro |
| **Tamaño de objetivo propio** | 1.961 controles visibles dentro de los ejemplos; se cuenta el `::after` de alcance cuando existe y se excluyen los `<input>` nativos ocultos (117) | 2.5.8 AA (24px) y 2.5.5 AAA (44px) |
| **Foco no oculto** | Recorrido con Tab (~90 paradas) en 8 páginas; en cada parada, 5 puntos del elemento enfocado y qué elemento queda encima (`elementFromPoint`) | 2.4.11 AA |
| **Evidencia en código** | `packages/core/css`, contratos, gates y la auditoría APG | La matriz de la sección 3 |

**Limitaciones.** Una herramienta automática encuentra solo una parte de los fallos reales. No se probó con lector de pantalla, con
dispositivo táctil, ni con zoom al 200 %/400 %. Solo se midió la pestaña **Overview** y el estado de reposo: **no** se midieron
menús, diálogos o tooltips abiertos, ni las pestañas Usage guide, Reference y Accessibility. Las reglas que axe agrupa como
`best-practice` (orden de encabezados, `region`) no se pidieron.

Tres artefactos de medición se descartaron (sección 2.3).

## 2. Hallazgos

Severidad: **Alta** = bloquea o degrada seriamente a quien usa teclado o lector de pantalla, o falla AA en toda la página;
**Media** = falla AA en un componente o ejemplo concreto; **Baja** = ruido, demo o caso con excepción plausible.

**Resultado de 122 páginas × 3 modos: las demás reglas AA no dieron ninguna violación.** Eso incluye `button-name`, `link-name`,
`label`, `aria-valid-attr-value`, `aria-roles`, `duplicate-id`, `image-alt`, `select-name` y `aria-required-children`.

### 2.1 Sitio de docs

| ID | Sev. | WCAG | Qué pasa | Dónde / evidencia | Arreglo sugerido |
|---|---|---|---|---|---|
| **D1** | Alta | 2.4.11 Foco no oculto (AA) | Con Tab, el elemento enfocado queda **tapado por las pestañas fijas** del encabezado de la página. En Button: el botón del ojito (parada 54 y 57) y la opción «Solid» del segmented (parada 55), a 126–131px de la parte alta, bajo una barra fija que ocupa hasta ~165px. 3 de 5 puntos tapados en cada una. | Página `button`, primer ejemplo. El navegador no hace scroll porque el elemento ya está «dentro del viewport». Solo hay `scroll-margin-top` en encabezados (`site.css:758`, `1541`, `1588`), no en controles. | `html { scroll-padding-top: <altura fija: navbar 58 + banda 66 + pestañas 45> }`, igual que se hizo para los encabezados; así el scroll por foco reserva el espacio. |
| **D2** | Alta | 1.4.3 Contraste mínimo (AA) | El **eyebrow del hero** («COMPONENTS») mide **4.09:1** (`#008236` sobre `#b9f8cf`) y las **etiquetas del sidebar** (`sk-nav-list__label`) **4.03:1** (`#008236` sobre `#deecdd`). Texto de 12px: pide 4.5. | 120 y 119 páginas: **todas**. No mejora en alto contraste (mismos valores). | Texto más oscuro (`accent-800`) o fondo más claro en `--docs-hero-bg` y en la franja del sidebar. El gate de tokens (`contrast-pairs.json`) exige 4.5 para `text-accent` sobre `bg-accent-subtle`, pero estos fondos son **propios del sitio** y ningún par los cubre: conviene añadirlos. |
| **D3** | Media | 4.1.2 Nombre, rol, valor (A) | El campo de búsqueda del encabezado es `<input type="text" readonly aria-expanded aria-controls>`: `aria-expanded` **no está permitido** en un `textbox`. axe lo marca `critical`. | `Base.astro:907`. 122 páginas, 1 elemento por página. | `role="combobox"` con `aria-haspopup="dialog"` (el patrón que ya describe el comentario del archivo), o quitar `aria-expanded`. |
| **D4** | Media | 2.1.1 Teclado (A) | Los **bloques de código** con scroll horizontal (`pre.astro-code`) no se pueden enfocar: quien usa teclado no puede desplazarlos. | 15 nodos en 10 páginas (carousel, expressive-avatar, feed, radio-group, scroll-expand, scroll-stack, skip-link, sticker, toc, tour). | `tabindex="0"` y nombre accesible (`role="region"` + `aria-label`) en el `<pre>` desplazable. |
| **D5** | Baja | 3.1.1 Idioma de la página (A, parcial), 2.4.2 Título | Los documentos dentro de los **iframes de ejemplo** no tienen `lang` ni `<title>`. El srcdoc trae `<html lang="es">` fijo (`preview-frame.ts:78`) aunque la página sea inglesa, y el documento vivo termina sin `lang`. El `<iframe>` sí tiene `title` (`Preview renderizado (React): TreeDemo`). | 93 y 106 páginas. | Escribir `lang` según el idioma de la página y un `<title>` en el documento del iframe. |
| **D6** | Baja | 1.4.3 | Demo de **fade-edge**: iniciales blancas sobre `emerald-600` (**3.65:1**). Es del ejemplo, no del componente (`--sk-avatar-bg: var(--palette-emerald-600)` en `demos/fade-edge.ts:82`). | 2 páginas. Se repite en oscuro. | Usar `emerald-700` o texto oscuro. |

### 2.2 Componentes

| ID | Sev. | WCAG | Qué pasa | Dónde / evidencia | Arreglo sugerido |
|---|---|---|---|---|---|
| **C1** | Alta | 4.1.2, 1.3.1 | **Accordion**: el wrapper del trigger lleva `role="heading"` **sin `aria-level`** cuando no se pasa `headingLevel`. axe: `aria-required-attr`, `critical`. El default (3) existe en el contrato, pero el marcado emitido con `fillDefaults: false` lo omite; la ruta React sí lo pone. | `core/accordion.ts:329-332` (`optionAttrs: { headingLevel: "aria-level" }` sin valor por defecto en `attrs`). 6 nodos, 2 páginas. | Emitir `aria-level="3"` como atributo por defecto del wrapper (y que la opción lo sobrescriba), de modo que el marcado nunca quede sin nivel. |
| **C2** | Media | 2.1.1 | Regiones con scroll sin foco por teclado: **Carousel** (`.sk-carousel__track`, 4), **Resizable** (`.sk-resizable__panel`, 3) y **FadeEdge** (`.sk-fade-edge`, 1). | 8 nodos, 3 páginas (más D4). | `tabindex="0"` en el contenedor con scroll (sobre todo cuando no hay controles que lo muevan) y nombre accesible. |
| **C3** | Media | 2.5.8 Tamaño de objetivo (AA) | Los **puntos del Carousel** miden 8×8 (activo 20×8). El alcance extra (`::after`) crece solo en vertical y los puntos están a 8px: centros a 16px, así que ni 24px de ancho ni la excepción de espaciado se cumplen. | `core/css/components/carousel.css:217-238`. 4 nodos. | Ampliar el `::after` en horizontal y subir `--sk-carousel-dot-gap` a ≥16px, o pasar a un punto mayor. |
| **C4** | Media | 2.5.8 | Los **triggers de AppBar** miden **23px de alto** (12 nodos), uno menos que el mínimo. El contrato dice 24px (`--size-control-xs`). | Página `app-bar`. | Comprobar por qué se pierde 1px (borde o redondeo) y garantizar `min-block-size: 24px`. |
| **C5** | Baja | 2.5.8 | Segmentos **Hour/Minute de TimeField** (22×24); **sliders de búsqueda** de VideoPlayer/AudioPlayer (16px de alto, 3 nodos). | Páginas `time-field`, `video-player`, `audio-player`. | Aumentar a 24px (en los sliders, la zona táctil, no solo la pista). |
| **C6** | Baja | 2.5.8 | **Asas de redimensionado de columnas** de Table y Treegrid (8px de ancho, 6 nodos). Son arrastre con alternativa de teclado, así que probablemente aplica la excepción «equivalente». | Páginas `table`, `treegrid`. | Verificar que el redimensionado por teclado funcione y documentar la excepción. |
| **C7** | Baja | 1.4.3 | **ImageCropper**: el mensaje de error (`sk-image-cropper__message`) mide **4.31:1** (`#c10007` sobre `#d6d3d1`). | Página `image-cropper`. | Fondo más claro o rojo más oscuro para el mensaje. |
| **C8** | Info | 2.5.8 | **Enlaces en línea** (`sk-link`, 5 nodos con 18–21px de alto): excepción de WCAG para enlaces dentro de una frase. | `comparison-table`, `description-list`. | Ninguno. |

**Lo que no falló:** contraste de los componentes en uso. Los únicos casos son D6, C7 y el texto de acento de D2. Los tokens y el material
frosted ya estaban cubiertos por los gates.

### 2.3 Descartado: artefactos de la medición

- **Dark mode «con fondo blanco»** (60 nodos en 15 páginas, sobre todo leyendas de Annotated, megamenu, TOC): al correrlo con oscuro real,
  la página principal da 0 violaciones, y todo lo demás está **dentro de iframes** con fondo transparente. axe, dentro de un iframe,
  no ve el fondo del documento padre y asume blanco (verificado a ojo en `toc` y `app-shell`: se leen bien). Falso positivo.
- **Botones «Copy code» fuera de pantalla con foco**: con espera de 70ms tras cada Tab, el scroll suave del sitio aún no había terminado.
  Con 450ms desaparece.
- **Back-to-top «parcialmente tapado», 8px de ancho** (7 nodos): estado oculto/animando, no el botón visible.

## 3. Matriz WCAG 2.2 → sistema

**Leyenda:** ✅ cubierto, con evidencia · ⚠️ parcial o con hallazgo · 🧑 depende de quien use el sistema · ❓ no verificado.

| Criterio | Estado | Evidencia o hueco |
|---|---|---|
| 1.1.1 Contenido no textual (A) | ✅ | El botón solo-ícono exige nombre accesible: el enhancer vanilla y el wrapper React lo rechazan (`button.css`, comentario del bloque `data-icon-only`). axe: 0 `button-name` / `image-alt`. |
| 1.2.x Medios temporales (A/AA) | ❓ | VideoPlayer y AudioPlayer existen; subtítulos y transcripciones dependen del consumidor. No se auditó. |
| 1.3.1 Información y relaciones (A) | ✅ | `docs/aria-apg-audit.md`: 89 patrones revisados. G4 `accessibility.spec.ts`: axe por árbol y binding. **C1** es la excepción. |
| 1.3.2 Secuencia con sentido (A) | ❓ | Sin prueba específica. |
| 1.3.3 Características sensoriales (A) | 🧑 | Contenido del consumidor. |
| 1.3.4 Orientación (AA) | ❓ | No se vio ningún bloqueo de orientación; no se probó. |
| 1.3.5 Identificar el propósito de la entrada (AA) | ⚠️ | `PasswordInput` expone `autocomplete` (`core/password-input.ts:110`); el resto lo decide el consumidor. |
| 1.4.1 Uso del color (A) | ❓ | No se revisó estado por estado. |
| 1.4.3 Contraste mínimo (AA) | ⚠️ | `packages/core/contrast-pairs.json`: 53 pares de tokens (claro, oscuro y alto contraste en los principales) en `scripts/checks.ts`; `frosted-contrast.spec.ts` para frosted. En uso real: **D2, D6, C7**. |
| 1.4.4 Cambio de tamaño del texto (AA) | ❓ | Sin prueba de zoom del 200 %. |
| 1.4.10 Reflow (AA) | ⚠️ | `button-containment.spec.ts` y `patterns.spec.ts` miran 320px solo en Button y patrones; el resto no. |
| 1.4.11 Contraste no textual (AA) | ⚠️ | 6 pares de borde a 3:1 en `contrast-pairs.json`; `focus-ring.spec.ts`. Sin barrido de estados (hover, deshabilitado). |
| 1.4.12 Espaciado del texto (AA) | ❓ | **Sin prueba ni gate.** Es el hueco más claro de esta lista. |
| 1.4.13 Contenido al pasar o enfocar (AA) | ⚠️ | Tooltip es interactivo por defecto (se puede pasar el puntero encima: `core/tooltip.ts`); descartar con Esc no se verificó. |
| 2.1.1 Teclado (A) | ⚠️ | APG revisado por patrón. **D4, C2** (regiones con scroll). |
| 2.1.2 Sin trampa de teclado (A) | ✅ | Diálogo nativo `<dialog>` + `showModal()` (`core/dialog.ts`), revisado en la auditoría APG. |
| 2.1.4 Atajos de teclado (A) | ❓ | Hay atajos (`Meta+K`, `Hotkey`); el palette usa modificador. No se revisó el resto. |
| 2.2.1 Tiempo ajustable (A) | ❓ | Toast con duración: no auditado. |
| 2.2.2 Pausar, detener, ocultar (A) | ✅ | `Marquee.autoplay` siempre trae botón Pausa (`core/marquee.ts:14,130`); Carousel con autoplay dibuja un conmutador de pausa (`core/carousel.ts:56`). 70 hojas respetan `prefers-reduced-motion`. |
| 2.3.1 Tres destellos (A) | ✅ | No hay contenido que parpadee. |
| 2.4.1 Saltar bloques (A) | ✅ | Componente `SkipLink` y salto en `Base.astro`. |
| 2.4.2 Título de la página (A) | ⚠️ | Páginas con título. **D5** (iframes). |
| 2.4.3 Orden del foco (A) | ⚠️ | Orden revisado en el recorrido de 8 páginas; no hubo saltos raros, pero **D1**. |
| 2.4.6 Encabezados y etiquetas (AA) | ❓ | `heading-order` no se pidió a axe. |
| 2.4.7 Foco visible (AA) | ✅ | `focus-ring.spec.ts`; 54 hojas usan el anillo (`--focus-ring-*`). |
| **2.4.11 Foco no oculto (AA, nuevo en 2.2)** | ⚠️ | **D1.** La librería no define `scroll-padding`; el consumidor con cabecera fija debe hacerlo. |
| 2.5.1 Gestos con el puntero (A) | ⚠️ | Carousel tiene botones además del deslizamiento; resto no revisado. |
| 2.5.2 Cancelación del puntero (A) | ❓ | |
| 2.5.3 Etiqueta en el nombre (A) | ❓ | |
| **2.5.7 Movimientos de arrastre (AA, nuevo)** | ⚠️ | Slider, Resizable y redimensionado de columnas tienen teclado. Cropper, Carousel (swipe) y Splitter: sin comprobar. **C6.** |
| **2.5.8 Tamaño de objetivo, mínimo (AA, nuevo)** | ⚠️ | Token `--size-touch-target: 44px` y `::after` de alcance en Button. De 1.961 controles visibles, **32 bajo 24px** (**C3, C4, C5, C6**; C8 exento). |
| 3.1.1 Idioma de la página (A) | ⚠️ | `<html lang={locale}>` en `Base.astro`. **D5** (iframes). |
| 3.1.2 Idioma de las partes (AA) | 🧑 | |
| 3.2.1 al 3.2.4 (A/AA) | 🧑 | Componentes sin cambios de contexto automáticos; navegación consistente en docs. |
| **3.2.6 Ayuda consistente (A, nuevo)** | 🧑 | |
| 3.3.1, 3.3.2, 3.3.3, 3.3.4 | ⚠️ | `FormField` y `questionnaire-invalid.spec.ts` cubren errores y etiquetas; sugerencias y prevención de errores son del consumidor. |
| **3.3.7 Entrada redundante (A, nuevo)** | 🧑 | |
| **3.3.8 Autenticación accesible, mínimo (AA, nuevo)** | ❓ | `PasswordInput` con `autocomplete`; falta confirmar que `OtpInput` admite pegar. |
| 4.1.2 Nombre, rol, valor (A) | ⚠️ | G4 + APG. **C1, D3.** |
| 4.1.3 Mensajes de estado (AA) | ✅ | Regiones vivas en Toast, Pagination, Clipboard, Callout, Lightbox y Tour (`core/src/*.ts`). |

## 4. Sin cubrir y siguiente paso

**Sin cubrir en esta pasada**
1. **Estados abiertos**: menús, diálogos, tooltips, popovers y lightbox; ahí viven la mayoría de los fallos de foco y de contraste de capas.
2. **Lector de pantalla** (VoiceOver, NVDA) en los patrones complejos: DataGrid, Treegrid, Combobox, Tour.
3. **1.4.12 Espaciado del texto**, **1.4.4 Zoom** y **1.4.10 Reflow** en todos los componentes, no solo Button.
4. **Pestañas Usage guide, Reference y Accessibility** de cada página, y las rutas en español (`/es/componentes/*`).
5. **Dispositivo táctil real**: tamaño de objetivo con dedo y gestos.

**Cómo repetir las mediciones.** Los scripts de esta auditoría (barrido de axe en 3 modos, medidor de objetivos, recorrido de foco) están
en el scratchpad de la sesión y no se guardaron en el repo. Si se quiere que sea un gate recurrente, el sitio natural es
`packages/ai-gates` (ya tiene axe 4.10 y la infraestructura de Playwright): un gate de **contraste con `color-contrast` activado**
en claro/oscuro/alto contraste, y otro de **tamaño de objetivo ≥ 24px**, para que D2 y C3 a C5 no puedan volver.

**Orden sugerido de arreglos:** D1 (una línea de CSS, afecta a toda la navegación por teclado), D2 (toda página), C1 (crítico y
barato), D3, C2/D4, C3/C4, y el resto.
