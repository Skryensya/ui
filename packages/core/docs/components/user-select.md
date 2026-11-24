# user-select

Category: forms. Stylesheet: `@skryensya/core/components/user-select.css`. Signatures: `UserSelect`.

## UserSelect

**Use when**

- picking people: assignees, reviewers, members, recipients
- any number can be chosen and the choice should read at a glance as faces and a count
- the list is long enough that the person searches it by name or email

**Avoid when**

- exactly one person is chosen; a Select or Combobox with avatar rows reads better
- the options are not people; that is Select, Combobox or a CheckboxGroup
- the chosen people must each stay visible and removable as chips; that is TagsInput

Alternatives: `Select`, `Combobox`, `TagsInput`.

- React: `import { UserSelect } from "@skryensya/react/user-select"`.
- HTML: a `<div>` with `data-sk-user-select`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `variant` | "outline" \| "ghost" | `"ghost"` |
| `name` | string |  |
| `value` (React: `defaultValue`) | string |  |
| `disabled` | boolean | `false` |
| `term` | string |  |
| `placeholder` | string |  |
| `searchPlaceholder` | string |  |
| `unselectedLabel` | string |  |
| `maxAvatars` | number |  |
| `loading` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `items` (React: `users`) | a list of items (below) | yes |

Each item in `items`, keyed by `id`: `disabled` (boolean), `id` (string), `email` (text), `initials` (text, required), `name` (text, required).

**Example** (canonical tree `user-select/assignees`; its copy is placeholder, replace it)

```tsx
import { UserSelect } from "@skryensya/react/user-select";
import { users } from "./user-select-users";

export function UserSelectExample() {
  return <UserSelect name="assignees" defaultValue="jane" users={users} />;
}
```

`user-select-users.ts`:

```ts
export const users = [
  { id: "jane", name: "Jane Cooper", initials: "JC", email: "jane@acme.dev" },
  {
    id: "maria",
    name: "Maria Fuentes",
    initials: "MF",
    email: "maria@acme.dev",
  },
  { id: "sam", name: "Sam Lee", initials: "SL" },
  {
    id: "alex",
    disabled: true,
    name: "Alex Kim",
    initials: "AK",
    email: "alex@acme.dev",
  },
];
```

```html
<div
  class="sk-select"
  data-sk-user-select
  data-variant="ghost"
  data-value="jane"
>
  <select
    data-sk-select-hidden
    name="assignees"
    aria-hidden="true"
    multiple
    tabindex="-1"
    style="border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;white-space:nowrap;word-wrap:normal;"
  >
    <option selected value="jane">Jane Cooper</option>
    <option value="maria">Maria Fuentes</option>
    <option value="sam">Sam Lee</option>
    <option value="alex" disabled>Alex Kim</option>
  </select>
  <div class="sk-select__control" data-sk-select-control>
    <button
      class="sk-select__trigger sk-anchor sk-interactive"
      data-sk-select-trigger
      type="button"
    >
      <span
        class="sk-select__value"
        data-sk-select-value
        aria-hidden="true"
      ></span>
      <span
        class="sk-select__indicator"
        data-sk-select-indicator
        aria-hidden="true"
      >
        <span data-state="closed">
          <span data-sk-icon="chevron-down" data-sk-icon-size="md"></span>
        </span>
        <span data-state="open">
          <span data-sk-icon="chevron-up" data-sk-icon-size="md"></span>
        </span>
      </span>
    </button>
  </div>
  <div class="sk-select__positioner sk-anchored" data-sk-select-positioner>
    <div class="sk-select__content" data-sk-select-content>
      <input
        class="sk-input"
        data-sk-user-select-search
        type="search"
        data-size="sm"
        data-variant="ghost"
      >
      <button
        class="sk-button sk-interactive"
        data-sk-user-select-search-clear
        type="button"
        hidden
        data-icon-only
        data-size="xs"
        data-variant="ghost"
      >
        <span data-sk-icon="close" data-sk-icon-size="sm"></span>
      </button>
      <div
        class="sk-combobox__status sk-visually-hidden"
        data-sk-user-select-status
        role="status"
        aria-atomic="true"
      ></div>
      <div class="sk-scrollbar" data-sk-user-select-list>
        <div
          class="sk-select__item sk-interactive"
          data-sk-select-item
          data-value="jane"
        >
          <span
            class="sk-checkbox"
            data-sk-user-select-check
            aria-hidden="true"
          >
            <span class="sk-checkbox__control">
              <span class="sk-checkbox__indicator" data-state="checked">
                <span data-sk-icon="check" data-sk-icon-size="sm"></span>
              </span>
            </span>
          </span>
          <span
            class="sk-inline"
            data-align="center"
            data-gap="sm"
            data-wrap="false"
          >
            <span
              class="sk-avatar"
              aria-label="Jane Cooper"
              aria-hidden="true"
              data-appearance="plain"
              data-size="sm"
              role="img"
            >
              <span class="sk-avatar__fallback" aria-hidden="true">
                JC
              </span>
            </span>
            <span class="sk-combobox__item-copy">
              <span class="sk-select__item-text" data-sk-select-item-text>
                Jane Cooper
              </span>
              <span
                class="sk-select__item-text sk-combobox__item-description"
              >
                jane@acme.dev
              </span>
            </span>
          </span>
        </div>
        <div
          class="sk-select__item sk-interactive"
          data-sk-select-item
          data-value="maria"
        >
          <span
            class="sk-checkbox"
            data-sk-user-select-check
            aria-hidden="true"
          >
            <span class="sk-checkbox__control">
              <span class="sk-checkbox__indicator" data-state="checked">
                <span data-sk-icon="check" data-sk-icon-size="sm"></span>
              </span>
            </span>
          </span>
          <span
            class="sk-inline"
            data-align="center"
            data-gap="sm"
            data-wrap="false"
          >
            <span
              class="sk-avatar"
              aria-label="Maria Fuentes"
              aria-hidden="true"
              data-appearance="plain"
              data-size="sm"
              role="img"
            >
              <span class="sk-avatar__fallback" aria-hidden="true">
                MF
              </span>
            </span>
            <span class="sk-combobox__item-copy">
              <span class="sk-select__item-text" data-sk-select-item-text>
                Maria Fuentes
              </span>
              <span
                class="sk-select__item-text sk-combobox__item-description"
              >
                maria@acme.dev
              </span>
            </span>
          </span>
        </div>
        <div
          class="sk-select__item sk-interactive"
          data-sk-select-item
          data-value="sam"
        >
          <span
            class="sk-checkbox"
            data-sk-user-select-check
            aria-hidden="true"
          >
            <span class="sk-checkbox__control">
              <span class="sk-checkbox__indicator" data-state="checked">
                <span data-sk-icon="check" data-sk-icon-size="sm"></span>
              </span>
            </span>
          </span>
          <span
            class="sk-inline"
            data-align="center"
            data-gap="sm"
            data-wrap="false"
          >
            <span
              class="sk-avatar"
              aria-label="Sam Lee"
              aria-hidden="true"
              data-appearance="plain"
              data-size="sm"
              role="img"
            >
              <span class="sk-avatar__fallback" aria-hidden="true">
                SL
              </span>
            </span>
            <span class="sk-combobox__item-copy">
              <span class="sk-select__item-text" data-sk-select-item-text>
                Sam Lee
              </span>
            </span>
          </span>
        </div>
        <div
          class="sk-select__item sk-interactive"
          data-sk-select-item
          data-value="alex"
          data-disabled
        >
          <span
            class="sk-checkbox"
            data-sk-user-select-check
            aria-hidden="true"
          >
            <span class="sk-checkbox__control">
              <span class="sk-checkbox__indicator" data-state="checked">
                <span data-sk-icon="check" data-sk-icon-size="sm"></span>
              </span>
            </span>
          </span>
          <span
            class="sk-inline"
            data-align="center"
            data-gap="sm"
            data-wrap="false"
          >
            <span
              class="sk-avatar"
              aria-label="Alex Kim"
              aria-hidden="true"
              data-appearance="plain"
              data-size="sm"
              role="img"
            >
              <span class="sk-avatar__fallback" aria-hidden="true">
                AK
              </span>
            </span>
            <span class="sk-combobox__item-copy">
              <span class="sk-select__item-text" data-sk-select-item-text>
                Alex Kim
              </span>
              <span
                class="sk-select__item-text sk-combobox__item-description"
              >
                alex@acme.dev
              </span>
            </span>
          </span>
        </div>
        <div
          class="sk-combobox__empty"
          data-sk-user-select-empty
          hidden
          role="presentation"
        >
          <span data-sk-user-select-empty-icon aria-hidden="true">
            <span data-sk-icon="search" data-sk-icon-size="md"></span>
          </span>
          <span data-sk-user-select-empty-title></span>
          <span data-sk-user-select-empty-hint></span>
        </div>
      </div>
      <span
        class="sk-inline"
        data-sk-user-select-footer
        data-align="center"
        data-gap="sm"
        data-justify="between"
      >
        <span
          class="sk-text"
          data-sk-user-select-count
          data-size="caption"
          data-tone="secondary"
        ></span>
        <button
          class="sk-button sk-interactive"
          data-sk-user-select-clear
          type="button"
          data-size="sm"
          data-variant="ghost"
        ></button>
      </span>
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/avatar.css`, `@skryensya/core/components/button.css`, `@skryensya/core/components/checkbox.css`, `@skryensya/core/components/combobox.css`, `@skryensya/core/components/input.css`, `@skryensya/core/components/select.css`, `@skryensya/core/components/typography.css`, `@skryensya/core/components/user-select.css`, `@skryensya/core/patterns/anchored.css`, `@skryensya/core/patterns/layout.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:userselectvaluechange` | `onValueChange` | { value: string[] } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-select-padding-x`, `--sk-user-select-content-max-block-size`, `--sk-user-select-content-min-inline-size`, `--sk-user-select-list-block-size`.
