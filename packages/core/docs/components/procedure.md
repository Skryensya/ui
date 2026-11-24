# procedure

Category: content. Stylesheet: `@skryensya/core/components/procedure.css`. Signatures: `Procedure`, `ProcedureStep`.

## Procedure

**Use when**

- they are instructions to follow, and the content of each step is what matters

**Avoid when**

- what matters is which step the user is on; that is Steps
- they are rows of a list (links, actions, metadata) with no instruction body; that is List

Alternatives: `Steps`, `List`.

- React: `import { Procedure } from "@skryensya/react/procedure"`.
- HTML: a `<ol>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `ProcedureStep` | yes |

**Example** (canonical tree `procedure/instructions`; its copy is placeholder, replace it)

```tsx
import { Procedure, ProcedureStep } from "@skryensya/react/procedure";

export function ProcedureExample() {
  return (
    <Procedure>
      <ProcedureStep title="Instalar">pnpm add @skryensya/core</ProcedureStep>
      <ProcedureStep title="Importar los tokens">
        Una vez, en el entry de la app.
      </ProcedureStep>
    </Procedure>
  );
}
```

```html
<ol class="sk-procedure" role="list">
  <li class="sk-procedure__step">
    <div class="sk-procedure__content">
      <span class="sk-procedure__title">Instalar</span>
      pnpm add @skryensya/core
    </div>
  </li>
  <li class="sk-procedure__step">
    <div class="sk-procedure__content">
      <span class="sk-procedure__title">Importar los tokens</span>
      Una vez, en el entry de la app.
    </div>
  </li>
</ol>
```

Stylesheets: `@skryensya/core/components/procedure.css`.

## ProcedureStep

**Use when**

- one instruction inside the list

**Avoid when**

- the item reports complete/current/upcoming; that is a step of Steps, not an instruction

Alternatives: `Steps`.

- React: `import { ProcedureStep } from "@skryensya/react/procedure"`.
- HTML: a `<li>`, no JavaScript needed.

- Goes inside: `Procedure`.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node |  |
| `title` | text | yes |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-procedure-connector-color`, `--sk-procedure-connector-size`, `--sk-procedure-content-gap`, `--sk-procedure-fg`, `--sk-procedure-step-gap`, `--sk-procedure-step-padding-x`, `--sk-procedure-step-padding-y`, `--sk-procedure-marker-bg`, `--sk-procedure-marker-border-color`, `--sk-procedure-marker-fg`, `--sk-procedure-marker-ring-color`, `--sk-procedure-marker-size`, `--sk-procedure-title-fg`, `--sk-procedure-title-font-size`, `--sk-procedure-title-font-weight`.
