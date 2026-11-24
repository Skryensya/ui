# code-preview

Category: content. Stylesheet: `@skryensya/core/components/code-preview.css`. Signatures: `CodePreview`, `CodePreview.density`.

## CodePreview

**Use when**

- code has to be shown and should read as code: highlighted, with its label
- the block is long and showing it whole pushes the rest of the page out of view

**Avoid when**

- it is a literal inside a sentence: that is Code
- what matters is copying it, not reading or showing it: that is StateButton composed with the copy behaviour, with no code block around it

Alternatives: `Code`.

- React: `import { CodePreview } from "@skryensya/react/code-preview"`.
- HTML: a `<div>` with `data-sk-code-preview`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `collapsible` | boolean | `false` |
| `lines` | number |  |
| `previewLines` | number |  |
| `moreLabel` | string | `"Expand"` |
| `lessLabel` | string | `"Collapse"` |
| `appearance` | "plain" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |
| `label` | text |  |
| `note` | text |  |

**Example** (canonical tree `code-preview/collapsible`; its copy is placeholder, replace it)

```tsx
import { CodePreview } from "@skryensya/react/code-preview";

export function CodePreviewExample() {
  return (
    <CodePreview collapsible lines={48} previewLines={8} label="vite.config.ts">
      export default defineConfig({})
    </CodePreview>
  );
}
```

```html
<div
  class="sk-code-preview"
  data-sk-code-preview
  data-appearance="plain"
  data-sk-code-preview-collapsible
  data-sk-code-preview-lines="48"
  data-sk-code-preview-preview-lines="8"
>
  <div class="sk-code-preview__label">
    <span class="sk-code-preview__meta">
      <span>vite.config.ts</span>
    </span>
  </div>
  <div class="sk-code-preview__preview">
    <div class="sk-code-preview__viewport">export default defineConfig({})</div>
  </div>
  <div class="sk-code-preview__more" data-sk-code-preview-more>
    <button
      class="sk-code-preview__toggle sk-button sk-interactive"
      data-sk-code-preview-toggle
      data-sk-code-preview-expanded-label="Collapse"
      type="button"
      aria-expanded="false"
      data-size="sm"
      data-variant="ghost"
    >
      <span data-sk-code-preview-toggle-label>Expand</span>
      <span class="sk-code-preview__toggle-count"></span>
      <span class="sk-code-preview__toggle-icon">
        <span data-sk-icon="chevron-down" data-sk-icon-size="sm"></span>
      </span>
    </button>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/code-preview.css`, `@skryensya/core/components/switch.css`.

## CodePreview.density

**Use when**

- the same code has a short version to understand it and a complete one to copy it
- showing only the complete one means nobody reads it, and only the short one leaves out what is needed

**Avoid when**

- there is only one version of the code: that is CodePreview and it needs no switch
- the two versions are different code, not two levels of detail of the same code

Alternatives: `CodePreview`.

- React: `import { CodePreviewDensity } from "@skryensya/react/code-preview"`.
- HTML: a `<div>` with `data-sk-code-preview`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `collapsible` | boolean | `false` |
| `lines` | number |  |
| `previewLines` | number |  |
| `moreLabel` | string | `"Expand"` |
| `lessLabel` | string | `"Collapse"` |
| `switchLabel` | string | `"Show the full version"` |
| `appearance` | "plain" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `condensed` | node | yes |
| `condensedLabel` | text | yes |
| `full` | node | yes |
| `fullLabel` | text | yes |
| `label` | text |  |

**Example** (canonical tree `code-preview/density`; its copy is placeholder, replace it)

```tsx
import { CodePreviewDensity } from "@skryensya/react/code-preview";

export function CodePreviewDensityExample() {
  return (
    <CodePreviewDensity
      switchLabel="Mostrar la versión completa"
      label="vite.config.ts"
      condensedLabel="Condensado"
      fullLabel="Completo"
      condensed="export default defineConfig({})"
      full="import { defineConfig } from 'vite';"
    />
  );
}
```

```html
<div
  class="sk-code-preview"
  data-sk-code-preview
  data-appearance="plain"
  data-sk-code-preview-density="condensed"
>
  <div class="sk-code-preview__label">
    <span class="sk-code-preview__meta">
      <span>vite.config.ts</span>
    </span>
    <div class="sk-code-preview__density">
      <span class="sk-code-preview__density-edge" data-density="condensed">
        Condensado
      </span>
      <label class="sk-switch">
        <input
          class="sk-switch__input"
          data-sk-code-preview-density-input
          aria-label="Mostrar la versión completa"
          type="checkbox"
          role="switch"
        >
        <span class="sk-switch__control" aria-hidden="true">
          <span class="sk-switch__thumb"></span>
        </span>
      </label>
      <span class="sk-code-preview__density-edge" data-density="full">
        Completo
      </span>
    </div>
  </div>
  <div class="sk-code-preview__preview">
    <div
      class="sk-code-preview__viewport"
      data-sk-code-preview-density-panel="condensed"
    >export default defineConfig({})</div>
    <div
      class="sk-code-preview__viewport"
      data-sk-code-preview-density-panel="full"
    >import { defineConfig } from 'vite';</div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/code-preview.css`, `@skryensya/core/components/switch.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-code-preview-bg`, `--sk-code-preview-border-color`, `--sk-code-preview-brutalist-offset`, `--sk-code-preview-collapsed-padding-block`, `--sk-code-preview-copy-scroll-inset`, `--sk-code-preview-count-fg`, `--sk-code-preview-fg`, `--sk-code-preview-font-size`, `--sk-code-preview-footer-bg`, `--sk-code-preview-label-active-fg`, `--sk-code-preview-label-bg`, `--sk-code-preview-label-fg`, `--sk-code-preview-line-height`, `--sk-code-preview-window`.
