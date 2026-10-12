# El accent es un parámetro

El kit no trae marcas ni paletas de accent. Trae **una semilla**, `--palette-accent`, y deriva de ella
la rampa completa (`--palette-accent-50` … `-950`) que los tokens semánticos ya consumían.

```css
:root { --palette-accent: oklch(58% 0.2 25); }  /* o #e11d48, cualquier color CSS */
```

## Cómo se deriva

Cada peldaño conserva el **matiz** de la semilla, escala su **croma** y toma una **luminosidad fija**
(`primitives/_accent.scss`). La luminosidad es lo que decide el contraste, y esos peldaños usan las
mismas L que la rampa azul de siempre. Por eso los pares WCAG que usa la capa semántica se cumplen
para cualquier matiz, no solo para el azul por defecto.

El croma de la semilla es el **pico** de la rampa (peldaños 600/700); los extremos toman su parte. Si
el pico queda fuera de sRGB, el navegador reduce el croma a luminosidad constante, así que el contraste
no se mueve.

## La garantía

`scripts/checks.test.ts` barre 36 matices × 4 croma (0.02 a 0.4) y corre **todos** los pares de
`contrast-pairs.json` en claro, oscuro y alto contraste. Un cambio que rompa el contraste para algún
matiz falla ahí, no en producción. El mínimo medido hoy es 4.59:1 (texto blanco sobre el relleno de
acción, matiz verde) contra un umbral de 4.5:1.

## Límites conocidos

- La semilla se lee en `:root`. Un subárbol con su propia semilla no re-deriva los tokens semánticos,
  que ya están resueltos arriba.
- Necesita color relativo de CSS (Chrome 119, Safari 16.4, Firefox 128). Verificado en Chromium y WebKit.
- Una semilla sin croma da un accent gris; es válido, no un error.
