# stat

Category: data. Stylesheet: `@skryensya/core/components/stat.css`. Signatures: `Stat`.

## Stat

**Use when**

- a number with its name: active users, revenue this month
- there is a delta showing which way it is going

**Avoid when**

- there are several numbers comparable with each other; that is a Table

Alternatives: `Table`.

- React: `import { Stat } from "@skryensya/react/stat"`.
- HTML: a `<div>` with `data-sk-stat`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `trend` | "up" \| "down" \| "neutral" | `"neutral"` |
| `animate` | boolean | `false` |
| `count` | number |  |
| `locale` | string |  |
| `suffix` | string |  |
| `fractionDigits` | number |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `label` | text | yes |
| `value` | text | yes |
| `change` | node |  |

**Example** (canonical tree `stat/animated`; its copy is placeholder, replace it)

```tsx
import { Stat } from "@skryensya/react/stat";

export function StatExample() {
  return <Stat animate count={1284} label="Usuarios activos" value="1.284" />;
}
```

```html
<div class="sk-stat" data-sk-stat data-animate>
  <span class="sk-stat__label">Usuarios activos</span>
  <span class="sk-stat__value" data-count="1284">1.284</span>
</div>
```

Stylesheets: `@skryensya/core/components/stat.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-stat-change-fg`, `--sk-stat-count-duration`.
