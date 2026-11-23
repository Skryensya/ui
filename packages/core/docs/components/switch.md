# switch

Category: forms. Stylesheet: `@skryensya/core/components/switch.css`. Signatures: `Switch`.

## Switch

**Use when**

- the change takes effect immediately: dark mode, notifications, a feature being turned on
- there is no save button involved
- it carries a name: the text as children, or aria-label when the visible label sits beside it; defaultChecked if it starts on

**Avoid when**

- the value is submitted with a form; that is a Checkbox
- an indeterminate third state is needed; a switch is on or off

Alternatives: `Checkbox`.

- React: `import { Switch } from "@skryensya/react/selection"`.
- HTML: a `<input>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `value` | string |  |
| `defaultChecked` | boolean | `false` |
| `disabled` | boolean | `false` |
| `appearance` | "plain" \| "tactile" \| "brutalist" \| "frosted" | `"plain"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node |  |

**Accessible name**

- A switch is a form control; with no visible label beside it, it needs an accessible name. Give one of: `children`, `aria-label`, `aria-labelledby`.

**Example** (canonical tree `switch/labelled`; its copy is placeholder, replace it)

```tsx
import { Switch } from "@skryensya/react/selection";

export function SwitchExample() {
  return <Switch name="dark-mode" defaultChecked>Modo oscuro</Switch>;
}
```

```html
<label class="sk-switch" data-appearance="plain">
  <input
    class="sk-switch__input"
    name="dark-mode"
    checked
    type="checkbox"
    role="switch"
  >
  <span class="sk-switch__control" aria-hidden="true">
    <span class="sk-switch__thumb"></span>
  </span>
  <span class="sk-switch__label">Modo oscuro</span>
</label>
```

Stylesheets: `@skryensya/core/components/switch.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-switch-bg`, `--sk-switch-block-size`, `--sk-switch-border-color`, `--sk-switch-border-width`, `--sk-switch-disabled-bg`, `--sk-switch-disabled-border-color`, `--sk-switch-disabled-fg`, `--sk-switch-disabled-thumb-bg`, `--sk-switch-fg`, `--sk-switch-gap`, `--sk-switch-inline-size`, `--sk-switch-padding`, `--sk-switch-selected-bg`, `--sk-switch-selected-border-color`, `--sk-switch-selected-thumb-bg`, `--sk-switch-thumb-bg`.
