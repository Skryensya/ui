# 0003 · Los íconos vienen de Iconify, y los instala tu proyecto

20 de noviembre de 2026 · cambio que rompe

`@skryensya/icons-lucide`, `@skryensya/icons-phosphor` y `@skryensya/icons-material` dejan de existir.
El kit ya no publica íconos ni tiene un set por defecto: el set es una dependencia de desarrollo de tu
proyecto, un `@iconify-json/<set>`, y `skryensya icons <set>` escribe en tu proyecto solo los roles que
piden los componentes. El resto de la colección (entre 0,6 y 12 MB de JSON) se queda en `node_modules`
y nunca llega al bundle.

**Si no bindeas un set, los componentes no dibujan íconos.** En React, `<Icon name>` no renderiza nada
y avisa una vez en desarrollo; en Vanilla, los placeholders `[data-sk-icon]` quedan sin hidratar, como
ya pasaba si no llamabas a `mountIcons`. El select y el carousel nativos muestran el ícono del navegador
hasta que importas `icons.css`.

## Qué cambia

| Antes | Ahora |
| --- | --- |
| `@skryensya/react` traía Lucide y dibujaba sin configuración | sin set por defecto: envuelves la app en `<IconSetProvider set={icons}>` |
| `import { lucideIcons } from "@skryensya/icons-lucide"` | `pnpm add -D @iconify-json/lucide` y `skryensya icons lucide`, que escribe `src/icons.ts` |
| `import "@skryensya/icons-lucide/select.css"` y `…/carousel.css` | `import "./icons.css"`, que escribe el mismo comando (las dos hojas en una) |
| `phosphorIcons`, `materialIcons` | `skryensya icons ph`, `skryensya icons material-symbols` (y otros 18 presets: `ph-bold`, `material-symbols-rounded`, `tabler`, `heroicons`, `ri`, `fluent`, `carbon`, `mdi`…; `skryensya help` los lista) |
| `skryensya add` instalaba `icons-lucide` junto al binding | instala el binding y core; te recuerda elegir un set |
| `@skryensya/core/emit-icon-set` | `@skryensya/core/iconify`: `iconSetFromIconify`, `iconifyPresets`, `iconSetCss`, `iconSetModule` |
| Material dibujaba en `0 -960 960 960` | dibuja en `0 0 24 24`, el viewBox de Iconify |

Los nombres de los roles no cambian. Ningún `<Icon name="…">` ni `data-sk-icon="…"` se mueve.

## Cómo migrar

1. Quita los paquetes viejos y agrega el set que usabas como dependencia de desarrollo:

   ```bash
   pnpm remove @skryensya/icons-lucide @skryensya/icons-phosphor @skryensya/icons-material
   pnpm add -D @iconify-json/lucide   # o @iconify-json/ph, @iconify-json/material-symbols
   ```

2. Escribe el set en tu proyecto. Desde el release, mientras el kit no esté en npm:

   ```bash
   npx https://github.com/Skryensya/ui/releases/download/v<versión>/skryensya-cli-<versión>.tgz icons lucide
   ```

   Escribe `src/icons.ts` y `src/icons.css`; `--out lib/icons` los escribe en otra ruta. Comitea los dos
   archivos. `--check` falla si quedaron desactualizados (por ejemplo, después de actualizar el set), y
   sirve para CI.

3. Cambia los imports:

   ```diff
   - import { lucideIcons } from "@skryensya/icons-lucide";
   - import "@skryensya/icons-lucide/select.css";
   + import { icons as lucideIcons } from "./icons";
   + import "./icons.css";
   ```

4. En React, si dependías del set por defecto, envuelve la app una vez:

   ```tsx
   import { IconSetProvider } from "@skryensya/react/icon";

   <IconSetProvider set={lucideIcons}><App /></IconSetProvider>
   ```

   Vanilla no cambia: `mountIcons(document, lucideIcons)` o `mountComponentsWithIcons(document, lucideIcons)`.

## Otro set de Iconify

Cualquier colección de Iconify sirve. Mapea cada rol del vocabulario a uno de sus nombres y llama al
adaptador en un script de build, no en el navegador (el JSON completo pesaría en el bundle):

```ts
import { writeFileSync } from "node:fs";
import tabler from "@iconify-json/tabler/icons.json" with { type: "json" };
import { iconSetFromIconify, iconSetModule } from "@skryensya/core/iconify";

const icons = iconSetFromIconify(tabler, { map: { "chevron-down": "chevron-down", delete: "trash" /* … cada rol */ } });
writeFileSync("src/icons.ts", iconSetModule(icons, "/* tabler */"));
```

El adaptador falla en el primer rol que la colección no dibuja, así que un set con huecos no llega a una
página. Un objeto escrito a mano que cumple `IconSet` también es un set.
