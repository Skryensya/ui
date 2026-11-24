# dialog-stack

Category: overlays. Stylesheet: `@skryensya/core/components/dialog-stack.css`. Signatures: `DialogStack`, `DialogStackTrigger`, `DialogStackOverlay`, `DialogStackBody`, `DialogStackContent`, `DialogStackHeader`, `DialogStackTitle`, `DialogStackDescription`, `DialogStackFooter`, `DialogStackNext`, `DialogStackPrevious`, `DialogStackClose`.

## DialogStack

**Use when**

- a short blocking task has ordered steps and needs backward navigation
- earlier steps should remain visible as stacked surfaces without exposing their controls

**Avoid when**

- a single confirmation needs an answer: use Dialog
- the flow is long or needs URLs, reload recovery or branching: use separate pages
- the content explains a control without blocking: use Popover

Alternatives: `Dialog`, `Popover`, `Steps`.

- React: `import { DialogStack } from "@skryensya/react/dialog-stack"`.
- HTML: a `<div>`, no JavaScript needed.

- Never inside: `DialogStack`.
- Holds at least 1 of `DialogStackBody`: One native dialog owns modality for the stack.

**Options**

| Option | Values | Default |
|---|---|---|
| `defaultOpen` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `DialogStackTrigger`, `DialogStackOverlay`, `DialogStackBody` | yes |

**Example** (canonical tree `dialog-stack/default`; its copy is placeholder, replace it)

```tsx
import {
  DialogStack,
  DialogStackBody,
  DialogStackClose,
  DialogStackContent,
  DialogStackDescription,
  DialogStackFooter,
  DialogStackHeader,
  DialogStackNext,
  DialogStackOverlay,
  DialogStackPrevious,
  DialogStackTitle,
  DialogStackTrigger,
} from "@skryensya/react/dialog-stack";

export function DialogStackExample() {
  return (
    <DialogStack>
      <DialogStackTrigger>Set up workspace</DialogStackTrigger>
      <DialogStackOverlay />
      <DialogStackBody>
        <DialogStackContent>
          <DialogStackHeader>
            <DialogStackTitle>Name your workspace</DialogStackTitle>
            <DialogStackDescription>
              Choose a name your team will recognize.
            </DialogStackDescription>
          </DialogStackHeader>
          <DialogStackFooter>
            <DialogStackClose>Cancel</DialogStackClose>
            <DialogStackNext>Next</DialogStackNext>
          </DialogStackFooter>
        </DialogStackContent>
        <DialogStackContent>
          <DialogStackHeader>
            <DialogStackTitle>Invite your team</DialogStackTitle>
            <DialogStackDescription>
              Invitations can be sent after setup too.
            </DialogStackDescription>
          </DialogStackHeader>
          <DialogStackFooter>
            <DialogStackPrevious>Back</DialogStackPrevious>
            <DialogStackClose>Cancel</DialogStackClose>
            <DialogStackNext>Next</DialogStackNext>
          </DialogStackFooter>
        </DialogStackContent>
        <DialogStackContent>
          <DialogStackHeader>
            <DialogStackTitle>Ready to start</DialogStackTitle>
            <DialogStackDescription>
              Your workspace is ready. You can revisit its
              settings later.
            </DialogStackDescription>
          </DialogStackHeader>
          <DialogStackFooter>
            <DialogStackPrevious>Back</DialogStackPrevious>
            <DialogStackClose>Finish</DialogStackClose>
          </DialogStackFooter>
        </DialogStackContent>
      </DialogStackBody>
    </DialogStack>
  );
}
```

```html
<div class="sk-dialog-stack" data-sk-dialog-stack>
  <button
    class="sk-dialog-stack__trigger sk-button sk-interactive"
    type="button"
  >
    Set up workspace
  </button>
  <span class="sk-dialog-stack__overlay" hidden aria-hidden="true"></span>
  <dialog class="sk-dialog-stack__body">
    <section class="sk-dialog-stack__content" tabindex="-1">
      <header class="sk-dialog-stack__header">
        <h2 class="sk-dialog-stack__title">Name your workspace</h2>
        <p class="sk-dialog-stack__description">
          Choose a name your team will recognize.
        </p>
      </header>
      <footer class="sk-dialog-stack__footer">
        <button
          class="sk-dialog-stack__close sk-button sk-interactive"
          type="button"
        >
          Cancel
        </button>
        <button
          class="sk-dialog-stack__next sk-button sk-interactive"
          type="button"
        >
          Next
        </button>
      </footer>
    </section>
    <section class="sk-dialog-stack__content" tabindex="-1">
      <header class="sk-dialog-stack__header">
        <h2 class="sk-dialog-stack__title">Invite your team</h2>
        <p class="sk-dialog-stack__description">
          Invitations can be sent after setup too.
        </p>
      </header>
      <footer class="sk-dialog-stack__footer">
        <button
          class="sk-dialog-stack__previous sk-button sk-interactive"
          type="button"
        >
          Back
        </button>
        <button
          class="sk-dialog-stack__close sk-button sk-interactive"
          type="button"
        >
          Cancel
        </button>
        <button
          class="sk-dialog-stack__next sk-button sk-interactive"
          type="button"
        >
          Next
        </button>
      </footer>
    </section>
    <section class="sk-dialog-stack__content" tabindex="-1">
      <header class="sk-dialog-stack__header">
        <h2 class="sk-dialog-stack__title">Ready to start</h2>
        <p class="sk-dialog-stack__description">
          Your workspace is ready. You can revisit its
          settings later.
        </p>
      </header>
      <footer class="sk-dialog-stack__footer">
        <button
          class="sk-dialog-stack__previous sk-button sk-interactive"
          type="button"
        >
          Back
        </button>
        <button
          class="sk-dialog-stack__close sk-button sk-interactive"
          type="button"
        >
          Finish
        </button>
      </footer>
    </section>
  </dialog>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/dialog-stack.css`.

## DialogStackTrigger

**Use when**

- a button opens the stack from the page

**Avoid when**

- the action advances inside the stack: use DialogStackNext

Alternatives: `DialogStackNext`.

- React: `import { DialogStackTrigger } from "@skryensya/react/dialog-stack"`.
- HTML: a `<button>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## DialogStackOverlay

**Use when**

- the compound composition needs an explicit backdrop marker; the native ::backdrop paints it

**Avoid when**

- the background is part of a non-modal panel: use Window

Alternatives: `Window`.

- React: `import { DialogStackOverlay } from "@skryensya/react/dialog-stack"`.
- HTML: a `<span>`, no JavaScript needed.

## DialogStackBody

**Use when**

- the stack needs its one native modal host around its steps

**Avoid when**

- there is only one confirmation: use Dialog

Alternatives: `Dialog`.

- React: `import { DialogStackBody } from "@skryensya/react/dialog-stack"`.
- HTML: a `<dialog>`, no JavaScript needed.

- Goes inside: `DialogStack`.
- Holds at least 1 of `DialogStackContent`: A stack needs at least one step to open.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `DialogStackContent` | yes |

## DialogStackContent

**Use when**

- one step has a title, content and navigation controls

**Avoid when**

- the content needs a standalone URL: use a page

Alternatives: `Dialog`.

- React: `import { DialogStackContent } from "@skryensya/react/dialog-stack"`.
- HTML: a `<section>`, no JavaScript needed.

- Goes inside: `DialogStackBody`.
- Holds at least 1 of `DialogStackTitle`: The active step supplies the dialog's accessible name.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## DialogStackHeader

**Use when**

- a step groups its title and optional description

**Avoid when**

- the content is a set of actions: use DialogStackFooter

Alternatives: `DialogStackFooter`.

- React: `import { DialogStackHeader } from "@skryensya/react/dialog-stack"`.
- HTML: a `<header>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## DialogStackTitle

**Use when**

- a heading names the active step and its dialog

**Avoid when**

- the text explains rather than names the step: use DialogStackDescription

Alternatives: `DialogStackDescription`.

- React: `import { DialogStackTitle } from "@skryensya/react/dialog-stack"`.
- HTML: a `<h2>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |

## DialogStackDescription

**Use when**

- a short sentence explains what the step asks for

**Avoid when**

- the text is a heading: use DialogStackTitle

Alternatives: `DialogStackTitle`.

- React: `import { DialogStackDescription } from "@skryensya/react/dialog-stack"`.
- HTML: a `<p>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | text | yes |

## DialogStackFooter

**Use when**

- navigation and completion controls need an action row

**Avoid when**

- the group contains the step title: use DialogStackHeader

Alternatives: `DialogStackHeader`.

- React: `import { DialogStackFooter } from "@skryensya/react/dialog-stack"`.
- HTML: a `<footer>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## DialogStackNext

**Use when**

- a control advances to the next step

**Avoid when**

- the last action completes the task: use DialogStackClose

Alternatives: `DialogStackClose`.

- React: `import { DialogStackNext } from "@skryensya/react/dialog-stack"`.
- HTML: a `<button>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## DialogStackPrevious

**Use when**

- a control returns to the previous step while keeping its authored content mounted

**Avoid when**

- the control abandons the flow: use DialogStackClose

Alternatives: `DialogStackClose`.

- React: `import { DialogStackPrevious } from "@skryensya/react/dialog-stack"`.
- HTML: a `<button>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## DialogStackClose

**Use when**

- a visible action cancels or completes the flow and closes the dialog

**Avoid when**

- the action only changes steps: use DialogStackNext or DialogStackPrevious

Alternatives: `DialogStackNext`, `DialogStackPrevious`.

- React: `import { DialogStackClose } from "@skryensya/react/dialog-stack"`.
- HTML: a `<button>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-dialog-stack-gap`, `--sk-dialog-stack-inline-size`, `--sk-dialog-stack-bg`, `--sk-dialog-stack-border-color`, `--sk-dialog-stack-radius`, `--sk-dialog-stack-padding`, `--sk-dialog-stack-elevation`, `--sk-dialog-stack-backdrop-bg`, `--sk-dialog-stack-exit-duration`, `--sk-dialog-stack-exit-easing`.
