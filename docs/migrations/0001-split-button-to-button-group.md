# 0001 · SplitButton → ButtonGroup

24 de octubre de 2026 · cambio que rompe

`SplitButton` dejó de existir. En su lugar hay un `ButtonGroup` que une controles relacionados, al
estilo del [ButtonGroup de shadcn](https://ui.shadcn.com/docs/components/base/button-group). Un split
button ahora es un `ButtonGroup` con un `Button` y un `Menu`. El grupo es dueño de la soldadura: decide
qué esquinas cuadrar según la posición de cada miembro en el DOM, así que los miembros ya no llevan
nada para eso.

## Qué se fue y qué lo reemplaza

| Antes | Ahora |
| --- | --- |
| `import { SplitButton } from "@skryensya/react/split-button"` | `import { ButtonGroup } from "@skryensya/react/button-group"` + `Button` + `Menu` |
| `<SplitButton menuItems onClick onSelect …>Guardar</SplitButton>` | la composición de [Split button](#split-button) |
| `SplitButtonVertical first second` | `<ButtonGroup orientation="vertical">` con los dos `Button` como hijos |
| `<Button weldStart>` / `<Button weldEnd>` | nada: pon el `Button` dentro de un `ButtonGroup` |
| `<Menu triggerWeldStart>` / `triggerWeldEnd` | nada: pon el `Menu` dentro de un `ButtonGroup` |
| `data-weld-start` / `data-weld-end` en el HTML | nada: envuelve los controles en `.sk-button-group` |
| `@skryensya/core/components/split-button.css` | `@skryensya/core/components/button-group.css` |
| clase `.sk-split-button` | `.sk-button-group` (más `data-orientation`) |
| `--sk-split-button-shadow`, `-wash`, `-brutalist-offset` | `--sk-button-group-shadow`, `-wash`, `-brutalist-offset` |
| contrato `split-button`, firmas `SplitButton` / `SplitButtonVertical` | contrato `button-group`, firma `ButtonGroup` |
| página `/components/split-button` | `/components/button-group` (la vieja redirige con 301) |

Nuevos: `ButtonGroupSeparator`, `ButtonGroupText` y `ButtonGroupLabel`. Además, `Input`, `Select`,
`NativeSelect` y `Popover` ya pueden ser miembros de un grupo.

### Lo que ya no se valida solo

- **`loading` ya no deshabilita el menú.** `SplitButton` tenía una regla (`slotImplies`) que obligaba a
  poner `disabled` en el menú cuando la acción tenía `loading`. Ahora esa decisión es tuya: pásale
  `disabled={loading}` al `Menu`.
- **Que las mitades combinen ya no se valida.** El contrato comprobaba con `pairs` que la acción y el
  trigger compartieran variant, tone y size. Ahora tienes que repetir los valores a mano: `variant` ↔
  `triggerVariant`, `tone` ↔ `triggerTone`, `size` ↔ `triggerSize`.
- **Las props planas no tienen reemplazo.** `menuItems`, `menuLabel`, `onSelect`, `variant`, `tone`,
  `appearance` y `size` sobre el `SplitButton` desaparecieron. La composición explícita es la única
  forma.

## Buscar qué migrar

```sh
rg -n "SplitButton|split-button|weldStart|weldEnd|triggerWeld|data-weld|sk-split-button|--sk-split-button" src
```

Si no encuentra nada, ya terminaste.

## Cada caso, antes y ahora

Los ejemplos son de React. En HTML plano es la misma estructura: un
`<div class="sk-button-group" role="group" data-orientation="horizontal">` con los controles adentro y
**sin** atributos `data-weld-*`.

### Split button

Antes:

```tsx
<SplitButton
  label="Guardar"
  menuLabel="Más formas de guardar"
  menuItems={[{ value: "copy", label: "Guardar una copia" }]}
  onClick={save}
  onSelect={({ value }) => saveAs(value)}
  loading={saving}
>
  Guardar
</SplitButton>
```

Ahora:

```tsx
<ButtonGroup label="Guardar">
  <Button tone="accent" variant="solid" loading={saving} onClick={save}>
    Guardar
  </Button>
  <Menu
    label="Más formas de guardar"
    triggerLabel="Más formas de guardar"
    triggerTone="accent"
    triggerVariant="solid"
    triggerIconOnly
    disabled={saving}
    items={[{ value: "copy", label: "Guardar una copia" }]}
    onSelect={({ value }) => saveAs(value)}
  />
</ButtonGroup>
```

El valor por defecto de `SplitButton` era `tone="accent"`. El de `Button` es `neutral`, así que, si
quieres el aspecto de antes, escribe `tone="accent"` en las dos mitades.

Si el menú iba **antes** que la acción (`triggerWeldEnd` + `weldStart`), cambia el orden de los
hijos. El grupo suelda según la posición, así que no tienes que cambiar nada más.

### Orientación (antes `SplitButtonVertical`)

```tsx
<ButtonGroup label="Zoom" orientation="vertical">
  <Button iconOnly aria-label="Acercar"><Icon name="zoom-in" /></Button>
  <Button iconOnly aria-label="Alejar"><Icon name="zoom-out" /></Button>
</ButtonGroup>
```

### Botones soldados a mano (antes `weldStart` / `weldEnd`)

```tsx
// Antes
<div style={{ display: "flex" }}>
  <Button weldEnd>Copiar</Button>
  <Button weldStart weldEnd>Cortar</Button>
  <Button weldStart>Pegar</Button>
</div>

// Ahora
<ButtonGroup>
  <Button>Copiar</Button>
  <Button>Cortar</Button>
  <Button>Pegar</Button>
</ButtonGroup>
```

### Tamaño

El tamaño va en cada miembro, nunca en el grupo. Usa el mismo en todos:

```tsx
<ButtonGroup>
  <Button size="sm">Archivar</Button>
  <Button size="sm">Reportar</Button>
  <Button size="sm" iconOnly aria-label="Más acciones"><Icon name="more" /></Button>
</ButtonGroup>
```

Si el grupo combina campos y botones, usa `md`. En `sm`, un `Input` mide lo mismo que el área táctil
(44 px) y un `Button` mide 32 px, así que no quedan a la misma altura.

### Anidado (una fila de grupos)

Un grupo cuyos hijos directos son grupos no suelda nada: los separa con un espacio
(`--sk-button-group-gap`).

```tsx
<ButtonGroup label="Páginas">
  <ButtonGroup>
    <Button>1</Button>
    <Button>2</Button>
    <Button>3</Button>
  </ButtonGroup>
  <ButtonGroup>
    <Button iconOnly aria-label="Página anterior"><Icon name="chevron-left" /></Button>
    <Button iconOnly aria-label="Página siguiente"><Icon name="chevron-right" /></Button>
  </ButtonGroup>
</ButtonGroup>
```

### Separador

Dos miembros `solid` no tienen borde, así que nada marca dónde se unen. El separador dibuja esa línea:

```tsx
<ButtonGroup>
  <Button variant="solid">Copiar</Button>
  <ButtonGroupSeparator />
  <Button variant="solid">Pegar</Button>
</ButtonGroup>
```

Su color es `--sk-button-group-separator-color`. En un grupo vertical se dibuja horizontal: no tiene
una opción de orientación propia.

### Input

```tsx
<ButtonGroup>
  <Input aria-label="Buscar" placeholder="Buscar en el correo" />
  <Button iconOnly aria-label="Buscar"><Icon name="search" /></Button>
</ButtonGroup>
```

Desde este cambio, `Input` acepta como padres tanto `FormField` como `ButtonGroup`.

### Input group (texto fijo y etiqueta)

El kit no tiene un `InputGroup` aparte. El caso de shadcn se arma con `ButtonGroupText` (un prefijo,
una unidad) y `ButtonGroupLabel` (un `<label for>` real):

```tsx
<ButtonGroup>
  <ButtonGroupLabel htmlFor="site">Sitio</ButtonGroupLabel>
  <ButtonGroupText>https://</ButtonGroupText>
  <Input id="site" />
</ButtonGroup>
```

Un ícono *dentro* del campo, como en el InputGroup de shadcn, sigue sin estar cubierto.

### Dropdown menu

Es el [split button](#split-button). Un `Menu` cuyo trigger tiene texto (`trigger="Acciones"`) también
puede ser miembro del grupo.

### Select

```tsx
<ButtonGroup>
  <Select aria-label="Moneda" value="usd" options={[{ value: "usd", label: "USD" }, { value: "eur", label: "EUR" }]} />
  <Input aria-label="Monto" placeholder="10.00" />
  <Button tone="accent">Enviar</Button>
</ButtonGroup>
```

`NativeSelect` (`<select class="sk-select-native">`) se suelda igual que `Select`. No le pongas la
`label` visible de `Select` dentro del grupo: nómbralo con `aria-label` o con un `ButtonGroupLabel`.

### Popover

```tsx
<ButtonGroup>
  <Button>Asistente</Button>
  <Popover id="assistant" triggerLabel="Ajustes del asistente" triggerIconOnly trigger={<Icon name="chevron-down" />}>
    Elige el tono y el largo de las respuestas.
  </Popover>
</ButtonGroup>
```

El grupo cuadra las esquinas del trigger del Popover. El botón de cerrar del panel conserva sus
esquinas redondeadas.

### RTL

No tienes que hacer nada: el grupo usa esquinas lógicas, así que en `dir="rtl"` se invierte solo.
Desde un usage tree, pásale `attrs: { dir: "rtl" }` al grupo (la firma ahora reenvía `dir`).

## Usage trees (MCP / Maker)

```ts
// Antes
{ contract: "split-button", signature: "SplitButton",
  slots: { action: { …Button.action, options: { weldEnd: true } }, menu: { …Menu, options: { triggerWeldStart: true } } } }

// Ahora
{ contract: "button-group", signature: "ButtonGroup",
  children: [ { …Button.action }, { …Menu, options: { triggerIconOnly: true, triggerLabel } } ] }
```

Si un tree todavía tiene `weldStart`, `weldEnd`, `triggerWeldStart` o `triggerWeldEnd`, ahora falla con
`unknown-option`. Bórralos.

## Comportamiento que cambió sin que cambie la API

- **Ya no hay doble borde en la unión.** Antes se borraba el color del borde en el lado soldado. Ahora
  cada miembro se monta 1 px sobre el anterior y los dos bordes caen en la misma columna de píxeles.
  En variantes con borde (`soft`) verás una sola línea en la unión, como antes. En `solid` no se ve
  ninguna; para marcarla, usa `ButtonGroupSeparator`.
- **El grupo no se estira en altura dentro de un padre flex** (`block-size: fit-content`). Antes, un
  `SplitButton` en una fila con `align-items: stretch` estiraba la acción y dejaba el trigger de ícono
  más bajo.
- **Los miembros no se encogen al presionarlos.** Pasaba antes con `data-weld-*`; ahora pasa con
  cualquier hijo, o nieto a través de un Menu o Popover, de `.sk-button-group`.
- **Un grupo apretado ya no rompe el layout** (break-ui del 24 de octubre de 2026):
  - las etiquetas largas terminan en elipsis en vez de recortarse por los dos lados;
  - ningún botón queda más angosto que su alto;
  - los botones de ícono y los triggers envueltos (Menu, Popover, Tooltip) no se encogen.
- **Input usa su ancho intrínseco dentro del grupo** (`inline-size: auto; flex: 1 1 auto`, con un
  mínimo de 8rem), en vez del `100%` de siempre. Para que llene la fila, dale ancho al grupo.
- **`ButtonGroupText` cambió de aspecto:** usa el tamaño de texto del campo (`--font-size-body`),
  el fondo `--color-bg-well` y, si el texto es largo, termina en elipsis.
- **Un Button dentro de un Tooltip se suelda** como cualquier otro miembro, igual que un Menu o
  Popover dentro de un Tooltip.
- **Los extremos ignoran separadores y miembros `[hidden]`.** Un separador en un extremo no se muestra
  y deja redondas las esquinas exteriores. Button ahora respeta `[hidden]` (antes su `display`
  le ganaba), así que basta con el atributo.
- **En vertical, un botón de ícono se estira** al ancho del miembro más ancho.
