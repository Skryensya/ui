# qr-code

Category: content. Stylesheet: `@skryensya/core/components/qr-code.css`. Signatures: `QRCode`.

## QRCode

**Use when**

- the reader has to be taken from a physical surface - a table, a poster, someone else's screen - to a URL without typing it
- the destination is short and stable: a link, an identifier, a wifi credential
- the code is printed or projected, and so needs real contrast and a real quiet zone

**Avoid when**

- the reader is already on the same device; there a plain link is faster and more accessible than aiming a camera
- the content is long or changes often; the symbol grows until it is unreadable and goes stale once printed
- it is the only way to an important action; a QR with no written link beside it leaves out whoever cannot scan
- it should be decorated with a huge logo; past a certain size the symbol stops scanning, and that is not a matter of style

Alternatives: `Link`, `CodePreview`.

- React: `import { QRCode } from "@skryensya/react/qr-code"`.
- HTML: a `<div>` with `data-sk-qr-code`, enhanced by Vanilla's mount.

- Requires the options: `value`, `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `value` | string |  |
| `level` | "L" \| "M" \| "Q" \| "H" | `"Q"` |
| `mask` | "auto" \| "0" \| "1" \| "2" \| "3" \| "4" \| "5" \| "6" \| "7" | `"auto"` |
| `moduleShape` (React: `shape`) | "square" \| "dot" \| "rounded" | `"square"` |
| `quietZone` | number | `4` |
| `logoRatio` | number | `0` |
| `tone` | "neutral" \| "accent" \| "success" \| "warning" \| "danger" \| "info" | `"neutral"` |
| `polarity` | "auto" \| "light" \| "dark" | `"auto"` |
| `qrSize` (React: `size`) | "sm" \| "md" \| "lg" \| "xl" | `"md"` |
| `label` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `logo` | node |  |

**Example** (canonical tree `qr-code/default`; its copy is placeholder, replace it)

```tsx
import { QRCode } from "@skryensya/react/qr-code";

export function QRCodeExample() {
  return (
    <QRCode value="https://ui.skryensya.dev" level="Q" label="Abrir el sitio" />
  );
}
```

```html
<div
  class="sk-qr-code"
  data-sk-qr-code
  data-value="https://ui.skryensya.dev"
  data-level="Q"
  data-module-shape="square"
  data-mask="auto"
  data-quiet-zone="4"
  data-tone="neutral"
  data-polarity="auto"
  data-size="md"
  aria-label="Abrir el sitio"
  role="img"
  style="--sk-qr-code-logo-ratio: 0;"
>
  <svg
    class="sk-qr-code__frame"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 37 37"
  >
    <path
      class="sk-qr-code__modules"
      fill="currentColor"
      d="M4 4h7v1h-7zM12 4h2v1h-2zM15 4h2v1h-2zM19 4h4v1h-4zM24 4h1v1h-1zM26 4h7v1h-7zM4 5h1v1h-1zM10 5h1v1h-1zM13 5h1v1h-1zM16 5h1v1h-1zM18 5h2v1h-2zM21 5h1v1h-1zM23 5h1v1h-1zM26 5h1v1h-1zM32 5h1v1h-1zM4 6h1v1h-1zM6 6h3v1h-3zM10 6h1v1h-1zM13 6h3v1h-3zM19 6h2v1h-2zM22 6h3v1h-3zM26 6h1v1h-1zM28 6h3v1h-3zM32 6h1v1h-1zM4 7h1v1h-1zM6 7h3v1h-3zM10 7h1v1h-1zM13 7h1v1h-1zM17 7h1v1h-1zM21 7h1v1h-1zM23 7h1v1h-1zM26 7h1v1h-1zM28 7h3v1h-3zM32 7h1v1h-1zM4 8h1v1h-1zM6 8h3v1h-3zM10 8h1v1h-1zM12 8h4v1h-4zM17 8h1v1h-1zM19 8h1v1h-1zM23 8h1v1h-1zM26 8h1v1h-1zM28 8h3v1h-3zM32 8h1v1h-1zM4 9h1v1h-1zM10 9h1v1h-1zM12 9h2v1h-2zM17 9h1v1h-1zM19 9h1v1h-1zM22 9h1v1h-1zM24 9h1v1h-1zM26 9h1v1h-1zM32 9h1v1h-1zM4 10h7v1h-7zM12 10h1v1h-1zM14 10h1v1h-1zM16 10h1v1h-1zM18 10h1v1h-1zM20 10h1v1h-1zM22 10h1v1h-1zM24 10h1v1h-1zM26 10h7v1h-7zM15 11h1v1h-1zM17 11h1v1h-1zM5 12h7v1h-7zM13 12h1v1h-1zM18 12h3v1h-3zM22 12h3v1h-3zM27 12h2v1h-2zM32 12h1v1h-1zM4 13h1v1h-1zM6 13h1v1h-1zM8 13h1v1h-1zM13 13h1v1h-1zM15 13h2v1h-2zM18 13h3v1h-3zM25 13h4v1h-4zM32 13h1v1h-1zM5 14h1v1h-1zM8 14h4v1h-4zM13 14h2v1h-2zM17 14h1v1h-1zM19 14h4v1h-4zM24 14h3v1h-3zM28 14h3v1h-3zM5 15h1v1h-1zM8 15h1v1h-1zM11 15h1v1h-1zM13 15h1v1h-1zM15 15h1v1h-1zM17 15h4v1h-4zM25 15h5v1h-5zM31 15h1v1h-1zM5 16h1v1h-1zM7 16h1v1h-1zM9 16h4v1h-4zM15 16h1v1h-1zM21 16h1v1h-1zM25 16h1v1h-1zM27 16h1v1h-1zM29 16h4v1h-4zM5 17h3v1h-3zM11 17h1v1h-1zM13 17h7v1h-7zM21 17h6v1h-6zM28 17h2v1h-2zM32 17h1v1h-1zM4 18h1v1h-1zM6 18h1v1h-1zM9 18h2v1h-2zM12 18h1v1h-1zM15 18h2v1h-2zM18 18h4v1h-4zM24 18h1v1h-1zM27 18h1v1h-1zM4 19h1v1h-1zM7 19h1v1h-1zM9 19h1v1h-1zM11 19h1v1h-1zM13 19h1v1h-1zM16 19h3v1h-3zM20 19h3v1h-3zM24 19h1v1h-1zM28 19h2v1h-2zM31 19h2v1h-2zM4 20h3v1h-3zM8 20h1v1h-1zM10 20h1v1h-1zM12 20h2v1h-2zM15 20h3v1h-3zM19 20h2v1h-2zM29 20h2v1h-2zM32 20h1v1h-1zM4 21h1v1h-1zM6 21h1v1h-1zM8 21h1v1h-1zM11 21h4v1h-4zM16 21h1v1h-1zM18 21h2v1h-2zM21 21h2v1h-2zM24 21h1v1h-1zM26 21h3v1h-3zM30 21h3v1h-3zM4 22h1v1h-1zM6 22h6v1h-6zM13 22h4v1h-4zM19 22h5v1h-5zM26 22h1v1h-1zM29 22h1v1h-1zM4 23h1v1h-1zM7 23h2v1h-2zM12 23h1v1h-1zM14 23h6v1h-6zM23 23h2v1h-2zM26 23h2v1h-2zM29 23h1v1h-1zM31 23h1v1h-1zM4 24h1v1h-1zM6 24h1v1h-1zM10 24h1v1h-1zM12 24h1v1h-1zM14 24h1v1h-1zM16 24h2v1h-2zM19 24h1v1h-1zM21 24h1v1h-1zM23 24h6v1h-6zM30 24h3v1h-3zM12 25h2v1h-2zM15 25h1v1h-1zM17 25h2v1h-2zM20 25h1v1h-1zM23 25h2v1h-2zM28 25h2v1h-2zM31 25h2v1h-2zM4 26h7v1h-7zM12 26h1v1h-1zM15 26h1v1h-1zM17 26h4v1h-4zM22 26h3v1h-3zM26 26h1v1h-1zM28 26h1v1h-1zM4 27h1v1h-1zM10 27h1v1h-1zM12 27h2v1h-2zM17 27h1v1h-1zM19 27h1v1h-1zM23 27h2v1h-2zM28 27h2v1h-2zM4 28h1v1h-1zM6 28h3v1h-3zM10 28h1v1h-1zM12 28h1v1h-1zM14 28h1v1h-1zM17 28h1v1h-1zM22 28h1v1h-1zM24 28h7v1h-7zM4 29h1v1h-1zM6 29h3v1h-3zM10 29h1v1h-1zM12 29h4v1h-4zM17 29h1v1h-1zM19 29h2v1h-2zM23 29h3v1h-3zM27 29h1v1h-1zM4 30h1v1h-1zM6 30h3v1h-3zM10 30h1v1h-1zM12 30h1v1h-1zM16 30h2v1h-2zM21 30h9v1h-9zM31 30h1v1h-1zM4 31h1v1h-1zM10 31h1v1h-1zM12 31h3v1h-3zM17 31h2v1h-2zM20 31h1v1h-1zM22 31h1v1h-1zM28 31h1v1h-1zM31 31h1v1h-1zM4 32h7v1h-7zM13 32h1v1h-1zM16 32h1v1h-1zM18 32h1v1h-1zM20 32h2v1h-2zM25 32h2v1h-2zM28 32h1v1h-1zM30 32h1v1h-1z"
    ></path>
  </svg>
</div>
```

Stylesheets: `@skryensya/core/components/qr-code.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-qr-code-logo-ratio`, `--sk-qr-code-modules`, `--sk-qr-code-paper`, `--sk-qr-code-radius`, `--sk-qr-code-size`.
