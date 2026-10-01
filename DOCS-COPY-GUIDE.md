# Guía de redacción para el sitio de docs de skryensya-ui

30 de septiembre de 2026

## Dictamen

Nuestra pestaña **Guía de uso** ya escribe como los mejores sistemas: oraciones de 11 palabras, un 31 % en imperativo y pares Haz / Evítalo que dicen por qué. El problema está en lo demás. Esa guía es el 7 % de nuestras palabras. El otro 93 % habla del componente y no de la persona que usa la interfaz. Además, lo primero que ve quien entra a una página es una lede que, en unos 35 de 96 casos, empieza por la implementación.

Reglas que adoptamos:

1. **La primera oración de la lede dice qué tarea resuelve.** La implementación va en la segunda oración o en Referencia. La oración de propósito casi siempre existe ya: es el `guidelinesLede`, que hoy vive en la segunda pestaña.
2. **Toda Guía de uso tiene “Cuándo usar” y “Cuándo no usar”**, y cada “no” nombra la alternativa. Hoy lo tienen 20 de 108 páginas; en los cinco sistemas, 6 de 6.
3. **Cada componente con texto tiene un bloque de Contenido** que dice cómo escribir su label, título o mensaje. Carbon y DSFR lo tienen en 6 de 6 páginas. Nosotros lo tenemos disperso en algún par Haz / Evítalo.
4. **Todo componente interactivo tiene pestaña Accesibilidad**, dividida en lo que el componente ya hace, lo que te toca a ti y el teclado. Hoy la tienen 49 de 116 páginas.
5. **Dos registros, uno por pestaña.** Guía de uso habla de la persona y de la tarea. Resumen y Referencia pueden hablar de clases, máquinas y elementos nativos. Ninguno se cuela en el otro.
6. **Cada regla lleva su porqué, con fuerza fija**: “Debe/No” para lo obligatorio, “Usa/No uses” para lo recomendado y “Considera” para el juicio.
7. **Cifras y nombres, no adjetivos**, y un solo español: sin restos rioplatenses (“acá”, “recién”, “de a una”), sin anglicismos que tienen traducción (“Showcases”, “patterns”, “browser”) y con “solo” sin tilde.

Esto complementa [`docs/writing-guide.md`](docs/writing-guide.md), que ya fija el tuteo, el code-switching y el orden de los ejemplos.

## Fuentes y método

Se revisaron seis páginas de componente por sistema, elegidas para que haya un equivalente en todos: botón, campo de texto, diálogo, checkbox, pestañas y alerta. Se usó la fuente publicada cuando el sitio no dejaba descargar el HTML. Del lado nuestro se leyeron los 108 archivos de `i18n/messages/components`, en español y en inglés, y la estructura de `ComponentPageShell.astro`.

| Sistema | Páginas | Fuente leída |
| --- | --- | --- |
| [GOV.UK Design System](https://design-system.service.gov.uk/components/) | button, text-input, checkboxes, tabs, error-summary, notification-banner | [Markdown del repositorio](https://github.com/alphagov/govuk-design-system/tree/main/src/components) |
| [Carbon](https://carbondesignsystem.com/components/overview/components/) | button, text-input, modal, checkbox, tabs, notification (usage + accessibility) | [MDX del repositorio](https://github.com/carbon-design-system/carbon-website/tree/main/src/pages/components) |
| [DSFR](https://www.systeme-de-design.gouv.fr/version-courante/fr/composants) | bouton, champ de saisie, modale, case à cocher, onglet, alerte (présentation + accessibilité) | [Markdown del repositorio](https://github.com/GouvernementFR/dsfr/tree/main/src/dsfr/component); el sitio responde 403 |
| [Singapore Government DS](https://www.designsystem.tech.gov.sg/components/button) | button, input, modal, checkbox, tab, alert | HTML publicado |
| [Material 3](https://m3.material.io/components) | buttons, text fields, dialogs, checkbox, tabs, snackbar (guidelines + accessibility) | Página renderizada; el sitio necesita JavaScript |

Las métricas se calcularon con expresiones regulares sobre la prosa, sin encabezados, tablas ni código. Son aproximadas: sirven para comparar órdenes de magnitud, no décimas.

## Qué dicen los números

Comparamos la versión en inglés de nuestro copy con los cuatro sistemas en inglés; el DSFR se midió en francés. Separamos nuestra Guía de uso (`guidelinesLede`, `dd.*`, `guide.*`) del resto.

| Corpus | Oraciones | Palabras por oración | Más de 25 palabras | Empieza en imperativo | Con código | Persona final, por 1000 palabras | “you”, por 1000 | should + must, por 1000 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GOV.UK | 304 | 18.9 | 16 % | 21 % | 11 % | 25.0 | 18.3 | 8.7 |
| SGDS | 303 | 12.5 | 3 % | 43 % | 0 % | 15.9 | 11.4 | 3.7 |
| Carbon | 985 | 16.2 | 10 % | 8 % | 5 % | 14.2 | 3.1 | 7.7 |
| Material 3 | 740 | 14.6 | 8 % | 14 % | 0 % | 11.0 | 0.4 | 8.8 |
| DSFR (francés) | 313 | 16.9 | 16 % | 31 % (infinitivo) | 21 % | 7.2 | no aplica | no aplica |
| skryensya, Guía de uso | 467 | 11.0 | 0 % | 31 % | 4 % | 6.0 | 2.5 | 2.4 |
| skryensya, el resto | 4575 | 14.6 | 13 % | 8 % | 39 % | 0.6 | 1.9 | 0.7 |

Qué se lee en la tabla:

- **El largo no es el problema.** Nuestras oraciones miden lo mismo que las de los cinco sistemas.
- **Nuestra Guía de uso está a la altura.** Tiene el imperativo del DSFR, casi nada de código y nombra a la persona casi tanto como el DSFR.
- **El resto casi nunca nombra a la persona que usa la interfaz**: 0.6 menciones por cada 1000 palabras, frente a 7 a 25 en los cinco sistemas.
- **El resto está escrito sobre identificadores.** El 39 % de las oraciones lleva código y el 12 % tiene un identificador como sujeto (“`variant` decide…”); en los otros sistemas, ese número va del 0 % al 4 %.
- **Casi no prescribimos fuera de la guía.** Los otros sistemas usan “should” o “must” de 4 a 9 veces por cada 1000 palabras; nosotros, 0.7. Nuestro copy describe cómo funciona y deja la decisión al lector.

El segundo registro no está mal: Resumen y Referencia son para quien integra el componente. El problema es que la primera pestaña que se abre es la de ese registro, y la guía para decidir queda detrás de un clic.

## Qué secciones tiene cada sistema

| Sección | GOV.UK | Carbon | DSFR | SGDS | Material 3 | skryensya |
| --- | --- | --- | --- | --- | --- | --- |
| Primera vista | Guía y ejemplo | Usage: demo y guía | Présentation: guía | Design: propósito | Overview | Resumen: ejemplos e implementación |
| Cuándo usar | 6/6 | 6/6 | 6/6 | 6/6 | En Usage | 20/108 explícito; `guidelinesLede` en 104 |
| Cuándo no usar | 4/6 | 4/6 | Dentro de “Quand utiliser” | 6/6 | En Usage | 20/108 |
| Haz / No hagas | Reglas “Do not” en 6/6, sin pares | 4/6 | 4/6 | 6/6 | 6/6, más Caution en 5/6 | 56/108 |
| Copy del componente | Dentro de “How it works” | 6/6 | 6/6 | En Best practices | Label text en 5/6 | Sin sección; suelto en pares |
| Accesibilidad | Integrada en cada regla | Pestaña, 6/6 | Pestaña, 6/6 | 6/6, con teclado | Pestaña, 5/6 | Pestaña en 49/116 |
| Investigación o referencias | 5/6 | 3/6 | Criterios RGAA | No | No | No; los ADR no se enlazan |
| Historial | Enlace a GitHub | No | No | Updates y Roadmap | No | Cambios, desde el contrato |

Nuestra forma de página, con pestañas Resumen, Guía de uso, Referencia, Instalación, Style hooks, Accesibilidad, Tests y Cambios, se parece a Carbon y a SGDS. La diferencia es el orden. Solo Material 3 abre, como nosotros, con una vista general antes de la guía. Los otros cuatro abren con la guía.

## Nuestras ledes

De los 108 archivos de mensajes, 96 tienen lede y 12 no la tienen (accordion, breadcrumb, callout, empty-state, file-upload, megamenu, menu, number-field, popover, split-button, toolbar, typography). La primera oración de esas 96 cae en uno de cinco tipos:

| Tipo | Cuántas, aprox. | Ejemplo | Veredicto |
| --- | --- | --- | --- |
| Tarea o función | 48 | “Loader comunica trabajo indeterminado: la operación está activa, pero no existe una fracción honesta que mostrar.” | Se queda |
| Implementación | 35 | “Sobre @zag-js/password-input, la misma máquina en las dos capas.” | Se reescribe |
| Contraste (lo que no es) | 7 | “Canvas no es un lienzo para dibujar ni una caja con scroll.” | Segunda oración, después de la tarea |
| Recorrido de la página | 2 | “Cómo usar Badge bien, en pares…” (badge, tabs) | Pasa al cuerpo |
| Proceso | 4 | “Tres formas de elegir un color.” | Se completa con la tarea |

Las mejores ledes ya siguen la regla y sirven de modelo: “Una ventana es para lo que tiene que quedar abierto mientras sigues trabajando: una paleta de herramientas, un inspector, un chat.” (window), “Un título de página comunica el resultado antes de que la persona lea los detalles.” (heading), “Un estado binario que toma efecto inmediatamente: encendido o apagado.” (switch).

En las páginas con implementación primero, la oración que falta casi siempre ya existe en `guidelinesLede`. Dialog abre con “Un `<dialog class="sk-dialog">` centrado.”, y su guía abre con “Dialog detiene la página hasta que la persona decide algo.” Basta con invertir el orden.

## Dónde ya estamos a la altura

- **Pares Haz / Evítalo con su razón.** “Si todas las etiquetas destacan, ninguna destaca: lo nuevo se ve igual que el resto.” (badge) es una regla con su razón, como en GOV.UK. “Unos pasos numerados tienen orden: eso es Steps.” (tabs) nombra la alternativa, como en Carbon.
- **Títulos de par que son reglas**: “Vistas, no pasos”, “Informa, no se presiona”, “Un contador con tope”. Se leen solos, como los captions de Material 3.
- **Copy de botones** en Dialog: “Nombra los botones por lo que hacen, como ‘Eliminar proyecto’, no ‘Aceptar’.” Es la misma regla de Carbon y de Material 3.
- **Opciones con una línea por valor** (“Usa `ghost` en barras o filas donde la caja sobra.”), igual que la sección Configuration de SGDS.
- **“Do not” en inglés**, nunca “Don’t”, como GOV.UK.

## Dónde nos quedamos atrás

| Tema | Cómo lo escribe la referencia | Cómo lo escribimos | Qué falta |
| --- | --- | --- | --- |
| Placeholder | GOV.UK: “Do not use placeholder text in place of a label… it vanishes when the user starts typing, which can cause problems for users with memory conditions… not all screen readers read it out” | “El placeholder desaparece al escribir: luego nadie recuerda qué pedía el campo.” | La razón de accesibilidad: no todos los lectores de pantalla lo anuncian |
| Propósito de Button | SGDS: “Use buttons for actions such as submitting, saving, opening, or confirming.” | `guidelinesLede`: “Elige primero la intención de la acción; luego ajusta énfasis, tamaño y apariencia.” | Dice cómo configurarlo, no para qué sirve |
| Pares de Button | Carbon: “Do not use two high-emphasis buttons in a button group.” | “Compara el disparador destructivo con la confirmación destructiva.” | El par habla de la demo, no de una interfaz real |
| Reglas del label | DSFR: verbo en infinitivo, sin mayúsculas, sin nombrar el botón ni su posición, sin repetir la instrucción | Solo en Dialog y en Input | Un bloque de Contenido por componente con texto |
| Cuándo no usar | Carbon: “Do not use buttons as navigational elements. Instead, use links…” | Está en `avoidWhen` del contrato; la página no lo muestra | Mostrarlo en la Guía de uso |
| Encabezados | GOV.UK: “Avoid placeholder text”, “Do not disable tabs”, “If you’re asking more than one question on the page” | “El rótulo no es del Input”, “Sigue siendo el dialog”, “Llega desde el borde” | Que el encabezado nombre el tema; la tesis puede ir después de dos puntos |
| Accesibilidad | SGDS: “Built-in accessibility” y “Labels and content”, más la tabla de teclado, en 6/6 | Pestaña en 49/116; el resto, dentro de los ejemplos | Pestaña en todo componente interactivo |

Sobre los encabezados: el patrón “tema: tesis” ya existe en nuestro propio copy (“`format`: la validación que el navegador no trae”) y resuelve el problema. Primero va el tema, que se puede buscar, y después la afirmación, que es nuestra voz.

## Limpieza pendiente

Salió al barrer el copy en español. Los números cuentan archivos de `i18n/messages/components` (108 en total).

| Problema | Archivos | Ejemplos | Corrección |
| --- | --- | --- | --- |
| Encabezado “Showcases” | 103 | todas las páginas con ejemplos | “Ejemplos” |
| “sólo” con tilde | 63 | box, footer, hero, link | “solo” |
| “acá” | 9 | description-list, icon, popover | “aquí” |
| “recién” | 9 | input, file-upload, presence | “solo”, “apenas”, “hasta” |
| “de a una” / “de a uno” | 3 | carousel, list, questionnaire | “una a una”, “de una en una” |
| Raya reemplazada por “ - ” con espacios | 7 | qr-code: “un texto corto  -  casi siempre una URL  - ” | Dos puntos, comas o paréntesis |
| “el usuario” | 10 | tag: “sobre el que el usuario puede actuar” | “la persona”, “quien…” |
| “patterns”, “browser”, “feedback”, “scrollea” | 11, 2, 4, 6 | primitives, checkbox, toast, sidebar | “patrones”, “navegador”, “respuesta” o “aviso”, “se desplaza” |
| “chico”, “grilla” | 6, 11 | button (tamaño), grid | Decidir: “pequeño” y “cuadrícula” son neutros |

`docs/writing-guide.md` dice que el voseo y su léxico se barrieron el 2026-09-14. “acá”, “recién” y “de a una” muestran que el barrido no llegó a `i18n/messages`, o que volvieron después. Un test como `no-em-dash.test.ts` que busque estas palabras evitaría que vuelvan.

## Cómo escribe cada sistema

### GOV.UK: cada regla trae su razón

- **Estructura**: ejemplo, “When to use this component”, “When not to use this component”, “How it works”, y subtítulos que son tareas o reglas (“Avoid placeholder text”, “Do not disable tabs”, “If you’re asking one question on the page”). Cierra con “Research on this component” en 5 de 6 páginas.
- **Voz**: segunda persona e imperativo; la que más nombra a quien usa el servicio (25 por cada 1000 palabras). Siempre “Do not”.
- **Rasgo distintivo**: regla y razón juntas, y a veces varias razones en lista. “Avoid using multiple default buttons on a single page. Having more than one main call to action reduces their impact, and makes it harder for users to know what to do next.”
- **Evidencia**: investigación propia y problemas conocidos admitidos (“Known issues” en Checkboxes).

### Singapore Government DS: una oración por idea

- **Estructura**: igual en las 6 páginas. Purpose (tres tarjetas con título y una oración), Anatomy, Configuration, tokens con “Where it’s used”, When to use, When not to use, Best practices, Accessibility (Built-in, Labels and content, Focus and interaction, Keyboard) y Updates.
- **Voz**: la más imperativa (43 %) y la más corta (12.5 palabras). “Use text inputs for single-line values such as names, references, and search terms.”
- **Rasgo distintivo**: la separación entre lo que el componente ya garantiza y lo que te toca.

### DSFR: reglas editoriales en cada componente

- **Estructura**: “Quand utiliser ce composant ?”, “Comment utiliser ce composant ?” y “Règles éditoriales” en 6 de 6; accesibilidad con criterios RGAA, lectores de pantalla y teclado en pestaña propia.
- **Voz**: infinitivo impersonal (“Utiliser…”, “Ne pas…”), regla en negrita y ejemplos entre paréntesis.
- **Rasgo distintivo**: las reglas del texto del componente: verbo en infinitivo, sin mayúsculas, sin nombrar el control ni su posición, sin repetir la instrucción.

### Material 3: labels breves y tres niveles de juicio

- **Estructura**: Usage, Anatomy (una sección por parte, con reglas de texto como “Label text”), variantes, Adaptive design y Behavior; accesibilidad aparte.
- **Voz**: tercera persona descriptiva; dice “people”, no “users”, y casi nunca “you” (0.4).
- **Rasgo distintivo**: Do, Don’t y Caution con caption completo; cifras para el copy (“ideally 1–3 words”).

### Carbon: tablas de caso de uso y sección Content

- **Estructura**: Live demo, Overview (When to use / When not to use), Formatting, **Content** en 6 de 6 (Labels, Helper text, Placeholder, Overflow), Universal behaviors, variantes, Related y References.
- **Voz**: la que más usa la voz pasiva (16 por cada 1000 palabras) y la menos consistente en la persona gramatical.
- **Rasgo distintivo**: una sección de contenido con subsecciones por elemento de texto, y tablas “valor / caso de uso”.

## Voz y tono

Escribimos para alguien que está construyendo una interfaz y tiene que decidir. La primera pantalla responde “¿es este el componente?” antes que “¿cómo está hecho?”.

- **Dos registros, uno por pestaña.** En Guía de uso, el sujeto es la persona o la tarea (“Dialog detiene la página hasta que la persona decide algo”). En Resumen y Referencia, el sujeto puede ser un identificador (“`variant` decide qué tan fuerte se ve”).
- **Persona**: tú en español, *you* en inglés, imperativo en las reglas.
- **A quién nombramos**: a quien usa la interfaz final, “la persona” o “quien…”; *people* en inglés. “El usuario” es ambiguo, porque quien lee la documentación también usa la librería.
- **Tono**: sobrio y exacto. Palabras que no se usan: potente, flexible, robusto, intuitivo, simplemente, fácilmente, “solo tienes que”.
- **Largo**: menos de 25 palabras por oración y hasta 3 oraciones por párrafo. En la guía ya estamos en 11 palabras; mantenerlo.

### Niveles de fuerza

| Nivel | Cuándo | Español | Inglés | Ejemplo |
| --- | --- | --- | --- | --- |
| Obligatorio | Romperlo rompe accesibilidad o el contrato | Debe / No + verbo | Must / Do not | “Un botón solo icono debe tener nombre accesible.” |
| Recomendado | Romperlo empeora la interfaz | Usa / No uses | Use / Do not use | “No uses dos `solid` + `accent` a la vista.” |
| Juicio | Depende del contexto | Considera / Prefiere | Consider / Prefer | “Considera `ghost` en filas con más de tres acciones.” |

## Estructura por pestaña

Mantiene las pestañas de `ComponentPageShell.astro` y lo que fija `docs/writing-guide.md` sobre el orden de los ejemplos. Solo cambia qué va arriba y qué no puede faltar.

1. **Encabezado de la página.** Lede cuya primera oración es la tarea; la segunda, si hace falta, dice cómo está hecho. Sin lede no se publica.
2. **Resumen.** Ejemplo base, anatomía, opciones con una línea “Usa X para…” por valor, y ejemplos de simple a complejo. Registro técnico permitido. Encabezados “tema: tesis”.
3. **Guía de uso.** En este orden:
    1. Propósito en una oración (`guidelinesLede`), sin repetir la lede.
    2. Cuándo usar y cuándo no, desde `useWhen`/`avoidWhen` del contrato; cada “no” termina en la alternativa.
    3. Pares Haz / Evítalo sobre casos de producto, nunca sobre la demo.
    4. Contenido, en componentes con texto: label, título, mensaje, placeholder.
4. **Referencia y Cambios.** Se generan del contrato; no llevan prosa a mano.
5. **Accesibilidad.** Obligatoria en componentes interactivos: “Lo que ya hace”, “Lo que te toca” y la tabla Tecla / Acción.
6. **Instalación y Style hooks.** Sin cambios.

## Reglas de redacción

### Prosa de la página

| Regla | Escribe | No escribas | Origen |
| --- | --- | --- | --- |
| La lede abre con la tarea | “Dialog detiene la página hasta que la persona decide algo.” | “Un `<dialog class="sk-dialog">` centrado.” | Los cinco |
| Regla + porqué | “Usa un solo `accent` por región. Si todo es la acción principal, nada lo es.” | “Usa un solo `accent` por región.” | GOV.UK |
| El “no” nombra la salida | “No uses Button para ir a otra página: usa `Button.navigation` o Link.” | “No uses Button para navegar.” | Carbon, DSFR |
| El par habla del producto | “No pongas dos botones `solid` + `accent` en la misma fila.” | “Compara el disparador destructivo con la confirmación destructiva.” | Carbon |
| La guía nombra a la persona | “La persona no ve el placeholder una vez que empieza a escribir.” | “`placeholder` se oculta con el input.” | GOV.UK, Material 3 |
| Todas las razones | “El placeholder desaparece al escribir y no todos los lectores de pantalla lo anuncian.” | Una sola razón cuando hay dos | GOV.UK |
| Encabezado “tema: tesis” | “Etiqueta: la pone FormField” | “El rótulo no es del Input” | Nuestro copy (`format: …`) |
| Cifras, no adjetivos | “4.5:1 sobre el fondo (WCAG 2.2, 1.4.3)” | “Buen contraste” | GOV.UK |
| Un solo español | “aquí”, “solo”, “una a una”, “Ejemplos” | “acá”, “recién”, “de a una”, “Showcases” | `docs/writing-guide.md` |
| Sin raya ni su sustituto | “un texto corto (casi siempre una URL)” | “un texto corto  -  casi siempre una URL  - ” | `no-em-dash.test.ts` |

### Copy de las demos y del componente

| Regla | Escribe | No escribas | Origen |
| --- | --- | --- | --- |
| Verbo en infinitivo + objeto | “Guardar cambios”, “Eliminar proyecto” | “Cambios”, “Aceptar” | DSFR, Carbon, nuestro Dialog |
| Verbo solo en acciones comunes | “Cancelar”, “Cerrar”, “Listo” | “Cancelar operación actual” | Carbon |
| De 1 a 3 palabras, en una línea | “Descargar factura” | “Haz clic aquí para descargar tu factura” | Material 3, `button-single-line.test.ts` |
| Mayúscula solo al inicio | “Crear cuenta” | “Crear Cuenta”, “CREAR CUENTA” | Material 3, DSFR |
| No nombrar el control ni su posición | “Enviar solicitud” | “Botón de enviar”, “Usa el botón de abajo” | DSFR |
| El label no repite la instrucción | Instrucción: “Revisa tus datos antes de enviar.” Botón: “Enviar” | Botón: “Revisar y enviar datos” | DSFR |
| Etiqueta visible, no placeholder | Etiqueta “Correo electrónico” sobre el campo | Solo placeholder “Correo electrónico” | GOV.UK, nuestro Input |
| El label dice el costo | “Borrar para siempre” en la confirmación `danger` | “Aceptar” en la confirmación `danger` | GOV.UK |
| Casos reales | “Resumen”, “Actividad” | “Tab 1”, “Lorem ipsum” | `docs/writing-guide.md` |

## Plantilla

Button reescrito con estas reglas, pestaña por pestaña.

````markdown
# Button

Button ejecuta una acción en la página: enviar un formulario, guardar, confirmar o descartar.
Es el <button> nativo con styling hooks, un enhancer vanilla mínimo y un componente React.

## Resumen
[Ejemplo base: "Guardar cambios"]
### Anatomía
### Énfasis: `variant` decide qué tan fuerte se ve
- Usa `solid` para la acción principal o una confirmación.
- Usa `soft` para una acción visible pero secundaria.
- Usa `ghost` en barras o filas donde la caja sobra.
### Acción destructiva: el disparador y la confirmación no pesan igual
### Como enlace: con `href`, el mismo aspecto sobre un <a>

## Guía de uso
Un botón hace algo aquí; si lleva a otro lugar, es un enlace.

### Cuándo usar
- Para una acción que cambia algo en la página: guardar, enviar, confirmar.
- Para confirmar o descartar un diálogo.
### Cuándo no usar
- Para ir a otra página: usa Button.navigation.
- Para una acción secundaria dentro de un párrafo: usa Link.
- Para marcar la opción elegida de un grupo: usa Segmented o RadioGroup.

### Una sola acción principal
Hazlo: un `accent` por región, el resto `neutral`.
Evítalo: dos `solid` + `accent` en la misma fila. Si todo es la acción principal, nada lo es.

### Contenido
- Empieza con un verbo en infinitivo: "Guardar cambios", no "Cambios".
- De 1 a 3 palabras, en una línea, con mayúscula solo al inicio.
- En la confirmación destructiva, di el costo: "Borrar para siempre", no "Aceptar".

## Accesibilidad
### Lo que ya hace
- Renderiza un <button> nativo, o un <a> cuando recibe href.
### Lo que te toca
- Un botón solo icono debe tener aria-label.
- No uses un botón deshabilitado como única explicación de qué falta.
### Teclado
| Tecla | Acción |
| Enter, Espacio | Activa el botón |
````

## Checklist de revisión

- [ ] La lede existe y su primera oración dice la tarea, sin nombrar la implementación.
- [ ] Guía de uso tiene propósito, “Cuándo usar” y “Cuándo no usar”, coherentes con `useWhen`/`avoidWhen`.
- [ ] Cada “no” termina en la alternativa.
- [ ] Los pares Haz / Evítalo hablan de una interfaz real, no de la demo, y dicen su porqué.
- [ ] Si el componente lleva texto, hay bloque de Contenido.
- [ ] Si es interactivo, hay pestaña Accesibilidad con “Lo que ya hace”, “Lo que te toca” y teclado.
- [ ] En Guía de uso, el sujeto es la persona o la tarea, no un identificador.
- [ ] Encabezados de Resumen en forma “tema: tesis”.
- [ ] Verbos de fuerza fijos: Debe/No, Usa/No uses, Considera/Prefiere.
- [ ] Sin “Showcases”, “acá”, “recién”, “de a una”, “sólo”, raya ni “ - ” como raya.
