# 0002 · Cada apariencia, en su propia hoja

25 de octubre de 2026 · cambio que rompe

Las reglas de `tactile`, `brutalist` y `frosted` (y `segments`, en Steps) salieron de la hoja de cada
componente. Ahora viven en `<componente>.<valor>.css`, junto a la base, y se importan solo si usas ese
valor. Antes `button.css` pesaba 64 kB en fuente y 22 kB minificado, y más de la mitad eran las tres
apariencias que casi nadie escribe; ahora la base pesa 36 kB y 9 kB, y cada apariencia entre 4 y 9 kB.
En gzip, `button.css` baja de 3,0 a 1,6 kB y cada apariencia suma entre 0,8 y 1,1 kB.

Midiendo los 100 componentes, cada archivo por su cuenta y minificado: **sin ninguna apariencia** el kit
pesa un 13 % menos en bruto (un 10 % en gzip); **con todas** pesa un 5 % más (un 14 % en gzip, que
comprime peor cuantos más archivos hay), por las copias de las que habla el último apartado. Lo que
compensa es que una página casi nunca carga todas.

**Si no importas la hoja de una apariencia, ese valor no recibe su pintura**: el atributo
`data-appearance="brutalist"` se escribe igual, pero nada lo dibuja, y el control se ve como `plain`
(sin su sombra, su borde ni su recorrido al presionarlo). Lo que no cambia: quien usa el bundle
`skryensya.css` o `foundation.css` + `dist/components/*` sigue teniéndolo todo, sin tocar nada.

## Qué cambia

| Antes | Ahora |
| --- | --- |
| `@import "@skryensya/core/components/button.css"` trae las cuatro apariencias | `button.css` + las hojas de las apariencias que uses: `button.brutalist.css`, `button.tactile.css`, `button.frosted.css` |
| `skryensya add button` | `skryensya add button button.brutalist` (cada apariencia es un id con el nombre de su hoja; trae el componente) |
| `skryensya list` | no lista las apariencias: `skryensya info button` las muestra |
| un árbol con `appearance: "brutalist"` listaba `button.css` | lista `button.css` y `button.brutalist.css` (`validate_ui`, `sheetsForTree`, el export del Maker) |
| contrato: la opción `appearance` solo tenía `values` | también `sheets`: qué hoja necesita cada valor (`options.appearance.sheets.brutalist`) |
| ButtonGroup no tenía nada que declarar | `memberAppearanceSheets`: la soldadura de un miembro `brutalist` es del grupo, y se carga cuando un miembro lo pide |
| `install-manifest.json`: un registro por componente | además, un registro por apariencia (`button.brutalist`) con sus hojas en orden |

## Qué componentes tienen hojas de apariencia

| Componente | Valores con hoja |
| --- | --- |
| `accordion`, `back-to-top`, `button`, `button-group`, `checkbox`, `details`, `pagination`, `radio-group`, `segmented`, `switch`, `tile`, `toolbar` | `tactile`, `brutalist`, `frosted` |
| `callout`, `code-preview`, `combobox`, `date-picker`, `dialog`, `input`, `navbar`, `number-field`, `password-input`, `popover`, `select`, `sidebar`, `tags-input`, `time-field`, `tour`, `window` | `brutalist`, `frosted` |
| `avatar`, `badge`, `kbd`, `tag` | `brutalist` |
| `steps` | `segments` |

Se quedaron en la base, porque su apariencia es una sola regla de menos de 300 bytes: `tactile` en
`audio-player` y `video-player`, y `brutalist` en `expressive-avatar`.

## Cómo no equivocarte con el orden

**Cada apariencia va justo detrás de su base, y las bases en orden alfabético.** Es el orden que tenía
el CSS cuando todo era un archivo por componente: `button.css`, `button.tactile.css`, `combobox.css`,
`combobox.brutalist.css`. Importa por dos razones. Una base que cargue después de su apariencia le gana
todos los empates a igual especificidad (`.sk-button[data-variant="soft"]` y
`.sk-button[data-appearance="tactile"]` pesan lo mismo). Y una regla de otro componente que se pensó para
ir después de Button entero (Combobox sobre su botón interior) tiene que seguir yendo después de Button
**con su apariencia incluida**, no antes. `sheetsForTree`, el manifest y el CLI ya listan las hojas así;
a mano, sigue el mismo orden.

Las hojas de apariencia **no importan nada**, a propósito: un bundler que copia los `@import` (o una lista
de `<link>` que los resuelve) pegaría la base, o la apariencia de la que dependen, otra vez justo detrás
de lo que ya cargó, y esa copia tardía ganaría los empates. Un test lo comprueba.

Lo que en el archivo original iba después de las reglas de una apariencia para ganarles (un bloque de
colores forzados, por ejemplo) se copia al final de esa hoja solo si de verdad **puede** ganarles: si toca
una propiedad que ella también toca y es al menos igual de específico. Así sigue ganando donde ganaba,
sin arrastrar el resto. `pnpm --filter @skryensya/core lint` comprueba que cada regla de apariencia esté en
su hoja (`appearance-sheet`).

## Buscar qué migrar

```sh
rg -n 'appearance[=:]\s*["{]?\s*"?(tactile|brutalist|frosted|segments)|data-appearance' src
```

Para cada componente que salga, importa la hoja del valor. Si construyes la lista a mano desde un
usage tree, no hace falta: `sheetsForTree(tree).sheets` ya la trae.

## Cada caso, antes y ahora

### Un Button brutalist

```css
/* Antes */
@import "@skryensya/core/components/button.css";

/* Ahora */
@import "@skryensya/core/components/button.css";
@import "@skryensya/core/components/button.brutalist.css";
```

Las dos líneas hacen falta, y en ese orden: la hoja de apariencia no trae la base. Con el CLI:
`skryensya add button.brutalist` (trae el componente y escribe los dos imports en orden).

### Un grupo de botones brutalist

```css
@import "@skryensya/core/components/button-group.css";
@import "@skryensya/core/components/button.css";
@import "@skryensya/core/components/button-group.brutalist.css"; /* la soldadura */
@import "@skryensya/core/components/button.brutalist.css";       /* los miembros */
```

El grupo no tiene opción `appearance`: la soldadura se activa porque un miembro la pide
(`:has(> .sk-button[data-appearance="brutalist"])`), por eso su hoja cuelga de `memberAppearanceSheets`.

### Un componente que cambia de apariencia en runtime

Una página que deja elegir la apariencia (como el menú de ojo de la documentación) tiene que importar
las hojas de **todos** los valores que ofrece, no solo el de arranque:

```css
@import "@skryensya/core/components/tile.tactile.css";
@import "@skryensya/core/components/tile.brutalist.css";
@import "@skryensya/core/components/tile.frosted.css";
```

### Un componente que se dibuja con otra clase

Un `CopyButton` es un `.sk-button`, así que con `appearance="tactile"` necesita `button.tactile.css`. Un
usage tree ya lo resuelve; a mano, importa la apariencia del componente que dibuja.

## Detalles que conviene saber

- **Una regla que nombraba varias apariencias a la vez** (`:is([data-appearance="tactile"],
  [data-appearance="brutalist"])`) se desdobló en una copia por apariencia, cada una en su hoja. La
  especificidad es la misma.
- **La regla de presión de la base** (`:not([data-appearance="tactile"], …)`) sigue en la base: solo
  excluye. Por eso un Button con `appearance="tactile"` y sin `button.tactile.css` no tiene ni el
  recorrido táctil ni el encogimiento de `plain` al presionarlo.
- **Lo que en un solo archivo iba después de una apariencia para ganarle se copia al final de su hoja.**
  Las reglas de los bloques `@media (forced-colors: active)`, de contraste y de movimiento reducido, y las
  que tienen `[data-appearance]` sin valor, se quedan en la base (el valor por defecto las necesita) y
  además se copian al final de cada hoja de apariencia que, en el archivo original, las tenía detrás **y
  a la que pueden ganar** (tocan una propiedad en común y son al menos igual de específicas). Una que
  estaba antes de la apariencia no se copia: ahí ella ganaba, y sigue ganando. Por eso algunas hojas pesan
  un poco más que sus reglas solas.
- **Los hooks siguen declarados en la base.** Re-declarar `--sk-button-brutalist-offset-inline` funciona
  igual; solo cambia dónde está la regla que lo lee.
- **El espejo de `data-motion="reduced"`** se generó de nuevo en cada hoja de apariencia
  (`scripts/mirror-motion.ts`).
