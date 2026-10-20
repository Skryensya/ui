# Break UI: navegación, formularios y contenido

## Alcance de esta pasada

13 harnesses nuevos, dev-only y con escenarios inline (sin selector de datos):

`breadcrumb`, `tabs`, `segmented`, `steps`, `procedure`, `toolbar`, `menubar`, `dialog`,
`message`, `form-field`, `otp-input`, `password-input`, `nav-list`.

Rutas: `/debug/<nombre>-break`. El índice `/debug` reúne ahora 57 harnesses.
Cada página muestra errores observados y fixes propuestos/aplicados, desde
`apps/docs/src/lib/break-findings.ts`. La nueva tanda también los anota junto a los
casos afectados. No se aplican correcciones de presentación a los specimens.
Esto **no termina** la cobertura del catálogo. Entre otros, siguen pendientes las
superficies de aplicación, medios/editor, notificaciones, tablas compuestas y
controles como SplitButton/StateButton. NavList ejercita la navegación interna de
un sidebar, no la carcasa completa de Sidebar.

Los fixtures están en `apps/docs/src/components/react-demos/debug-<nombre>-break.tsx`;
usan los componentes React públicos, sin modificar su CSS ni su markup interno.

## Superficie de datos

Fuentes de tipos: `packages/react/src/components/<nombre>.tsx` y el contrato
correspondiente en `packages/core/src/`. Son componentes de biblioteca: no hay un
backend que imponga límites de longitud. «Sin límite» significa que sus props/tipos
no declaran un máximo, no que deba aceptarse cualquier longitud en una aplicación.

| Componente | Datos renderizados desde props/slots | Límites y opcionales |
| --- | --- | --- |
| Breadcrumb | `items[].label/href/current`, nombre del landmark, separador y nombre del disclosure | Texto y número de niveles sin máximo; href/current opcionales. 0/1/12 niveles. |
| Tabs | `items[].label/children/disabled/value`, nombre del tablist y selección | Etiquetas/paneles y cantidad sin máximo; panel/disabled opcionales. 0/1/24 documentos. |
| SegmentedControl | `options[].label/value/disabled`, nombre del grupo y selección | Texto/cantidad sin máximo; disabled/selección inicial opcionales. 0/1/3 opciones y todas deshabilitadas. |
| Steps | `steps[].label/description/marker/status`, índice actual | Texto/cantidad sin máximo; descripción/marker/status opcionales; status complete/current/upcoming. 0/1/12 etapas. |
| Procedure | títulos, cuerpos y posición en la secuencia | Texto/cantidad sin máximo; cuerpo opcional. 0/1/100 instrucciones, incluyendo números de tres dígitos. |
| Toolbar | nombres de controles/grupos, contenido de botones, estado disabled y composite anidado | Texto/cantidad sin máximo; label del grupo opcional. 0/1/3 acciones y control segmentado anidado. |
| Menubar | nombres de comandos, submenús, estados checked/disabled | Texto/cantidad/profundidad sin máximo; items opcionales. 0/1/3 grupos, checkbox y submenú. |
| Dialog | title, children, footer, closeLabel; acciones de cierre | Texto sin máximo; footer opcional. Cuerpo breve/vacío/largo, título largo y alertdialog. |
| Message | autor, avatar, cuerpo, pie y acciones; alineación | Slots sin límites; avatar/pie opcionales. Incoming/outgoing, metadatos ausentes y markup literal. |
| FormField | label/hint/error; valor y required/disabled del Input compuesto | Texto sin máximo; hint/error opcionales. No se configura maxLength en el fixture. |
| OtpInput | label/hint, dígitos, nombre de segmento, count/groupSize, disabled/invalid | Contrato: count entero ≥1, sin máximo; groupSize 2/3/4. Casos de 1/6/8 dígitos. Hint opcional. |
| PasswordInput | label/hint/placeholder, nombres del toggle, estado del campo | Texto sin máximo; hint/placeholder opcionales. El fixture empieza vacío; el self-check escribe una frase larga por la interacción pública. |
| NavList | nombres de grupo/destino, icono, current y contador trailing | Texto/cantidad sin máximo; icon/trailing opcionales. 0/1/1.000 proyectos. |

Los títulos traducidos, direcciones `.example.com`, URLs y nombres compuestos son
plausibles; los casos de 12 etapas, 24 documentos y 100 instrucciones evitan
fabricar un producto con miles de tabs o pasos. Los 1.000 proyectos de NavList se
confinan en un viewport con scroll; no es una implementación de virtualización.

## Qué se rompió

Comprobado en Chromium. A 320px de viewport, el shell deja **229px de contenedor**;
no se ha confundido el ancho del viewport con el del componente. La medición inicial
se hizo con un scrollport del harness. Se retiró ese scrollport para que los errores
se vean desbordar el límite punteado, sin recortarlos ni simular un fix; por tanto,
el documento ahora puede ensancharse. Sólo se conservan los viewports explícitos
de colecciones grandes. El measurer oculto de Breadcrumb no se cuenta como overflow
visible.

| # | Severidad | Campo / dato adverso | Resultado confirmado | Corrección propuesta, sin aplicar |
| --- | --- | --- | --- | --- |
| 1 | Broken | Steps: `Benachrichtigungseinstellungen`, descripciones y 12 etapas | En escritorio, dentro de 437px, las etiquetas se superponen. La media query no ve que el contenedor es estrecho. El compuesto alemán también sobresale en la variante vertical móvil. | Elegir rail vertical por contenedor/cantidad y envolver texto sin solaparlo. `packages/core/css/components/steps.css:68`, `:120`, `:167`. |
| 2 | Broken | Procedure: título alemán, email y URL largos | Una columna de 153px produce contenido de hasta 381px; el ancho desbordado del componente llega a 441px. Se corta el texto en el borde del escenario. | Permitir cortes de palabras largas en contenido/título, respetando el gutter del marcador. `packages/core/css/components/procedure.css:98`. |
| 3 | Broken | Message: email y URL dentro del cuerpo | El cuerpo desborda tras la columna del avatar; se pierde información a la derecha. | Contener el slot de cuerpo y envolver identificadores, sin encoger el avatar. `packages/core/css/components/message.css:78`. |
| 4 | Broken | Tabs: etiquetas traducidas, email en panel y 24 documentos | La lista mide 583px en el worst case y 1.955px con 24 documentos. El scroll del escenario arrastra también el panel; el email no hace reflow. | Restringir el grid, hacer scroll sólo del tablist y envolver el texto del panel. `packages/core/css/components/tabs.css:9`, `:31`, `:102`. |
| 5 | Fragile | OtpInput: 6 y 8 dígitos | Filas de 284px y 396px dentro de 229px: últimos segmentos fuera de vista, alcanzables desplazando el escenario. El label de 8 dígitos hereda el ancho de la fila. | Layout responsive por grupos y texto independiente del mínimo de la fila, conservando objetivos accesibles. `packages/core/css/components/otp-input.css:24`, `:34`, `:45`. |
| 6 | Broken | SegmentedControl: teclado RTL | En el demo Day/Week/Month con dir=rtl, ArrowRight desde Week selecciona Month, físicamente a la izquierda. | Resolver flechas horizontales según dirección efectiva, manteniendo Up/Down/Home/End. `packages/react/src/components/segmented.tsx:78`; revisar también el binding Vanilla antes de corregir. |
| 7 | Fragile | SegmentedControl: periodos en alemán | El control ocupa 669px dentro de 229px. Para ver las otras opciones hay que desplazar el escenario. | Acordar scroll propio o composición alternativa para etiquetas largas; no ocultar opciones ni recortarlas sin acceso al nombre completo. `packages/core/css/components/segmented.css:78`. |
| 8 | Fragile | Toolbar: comando “Export the complete billing history” | El toolbar con wrap necesita 292px dentro de 229px: envolver controles no ayuda cuando un solo control no cabe. | Limitar el ancho de la barra y permitir wrap del label o menú de overflow a nivel de composición. `packages/core/css/components/toolbar.css:11`, `packages/core/css/components/button.css`. |
| 9 | Fragile | Menubar: tres grupos con nombres expandidos | Barra de 621px en 229px; los grupos posteriores sólo se ven con scroll del escenario. | Decidir una adaptación de menubar a contenedor estrecho, sin envolver arbitrariamente el orden de teclado. `packages/core/css/components/menubar.css:19`. |
| 10 | Fragile | NavList: destinos largos | Ellipsis sin title/tooltip ni alternativa visible al nombre completo en el harness. El nombre accesible sí conserva el texto. | Wrap o vía accesible al nombre completo, sin sustituir el nombre del enlace. `packages/core/css/patterns/nav-list.css:270`, `packages/react/src/components/nav-list.tsx:166`. |

No se corrigió ninguno de estos problemas en esta pasada.

## Decisiones pendientes

- Recomiendo **scroll sólo del tablist** y wrap de su panel: desplazar el documento
  seleccionado junto con las tabs hace más difícil leerlo.
- Steps debe responder al **contenedor**, no sólo al viewport. No recomiendo
  truncar las etapas que identifican el avance.
- OTP necesita conservar targets accesibles. Agrupar en varias filas es preferible
  a reducir indefinidamente el tamaño de los dígitos.
- Menubar/Toolbar/Segmented necesitan acordar cómo adaptar comandos largos; no
  aplicar truncado global ni reducir el tamaño de letra para esconder el problema.
- Los controles vacíos se muestran deliberadamente. Omitirlos o acompañarlos de un
  estado vacío suele corresponder a la composición; no se inventó copy de producto.

## Qué resistió y validación

- Las 13 rutas cargan con 200; 39 combinaciones de ruta/entorno sin errores JS:
  1280px LTR claro, 320px LTR claro y 320px RTL oscuro con zoom CSS 200%.
  Este último es una aproximación de ampliación, no validación de zoom nativo ni
  una matriz exhaustiva de entornos independientes.
- Capturas revisadas de los casos principales: Steps en escritorio, los casos
  estrechos de contenido/navegación y los diálogos abiertos. Las métricas de
  200%/RTL/oscuro no equivalen a una revisión visual exhaustiva de cada píxel.
- Self-checks con asserts: selección de Tabs, flechas LTR de Segmented, Home/End de
  Toolbar, apertura/cierre de Menubar/Breadcrumb, disclosure de NavList,
  aria-invalid/describedby de FormField, escritura y show/hide de PasswordInput,
  entrada de un código completo en OtpInput y Escape de los diálogos.
- FormField envuelve labels, hints y errores sin romper sus relaciones accesibles.
- Breadcrumb conserva el destino actual y permite abrir los ancestros colapsados.
- Los cuerpos largos de Dialog tienen scroll y Escape funciona; las acciones del
  alertdialog siguen visibles. No se afirma que todos los textos del modal se
  adapten perfectamente: las acciones largas quedan muy ajustadas al ancho móvil.
- Markup adverso se presenta como texto literal; los avatares conservan su forma.
- `src/lib/debug-routes.test.ts` y `src/lib/break-findings.test.ts`: checks de guard
  dev-only, shell, hidratación, índice y coherencia de errores/fixes. No sustituyen
  a una prueba de build de producción.
- TypeScript no reporta errores en los 13 harnesses nuevos. El chequeo general
  continúa fallando fuera de estos archivos (tile, install-procedure,
  command-palette, input y tag, entre otros).

No se probó VoiceOver/NVDA, Firefox, hardware táctil real ni rendimiento bajo
carga de las 1.000 filas. No se ejecutó la suite completa ni un build de producción.
